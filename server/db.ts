import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Patched WebSocket to work around Neon serverless bug
// Neon tries to set ErrorEvent.message which is read-only, causing crash
class PatchedWebSocket extends ws {
  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols);
    
    // Intercept error events and convert ErrorEvent to plain Error
    const originalEmit = this.emit.bind(this);
    this.emit = (event: string | symbol, ...args: any[]): boolean => {
      if (event === 'error' && args[0]) {
        const err = args[0];
        // Convert ErrorEvent to a plain Error with writable properties
        if (err && typeof err === 'object' && err.constructor?.name === 'ErrorEvent') {
          const plainError = new Error(err.message || 'WebSocket error');
          (plainError as any).code = err.error?.code || 'ECONNRESET';
          (plainError as any).cause = err.error;
          return originalEmit(event, plainError);
        }
      }
      return originalEmit(event, ...args);
    };
  }
}

// Configure WebSocket for Neon serverless in Node.js
neonConfig.webSocketConstructor = PatchedWebSocket as any;

// Enterprise Pool configuration for high-frequency writes
// Optimized for blockchain TPS monitoring workloads:
// - max: 20 connections for batch flush + concurrent reads
// - statement_timeout: 3s to prevent long-running queries
// - idle_in_transaction_session_timeout: 30s to reclaim stuck connections
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,                          // Increased from 5 for enterprise workloads
  idleTimeoutMillis: 30000,         // Close idle connections after 30s
  connectionTimeoutMillis: 10000,   // Wait 10s max for connection
  allowExitOnIdle: true,            // Allow clean exit when idle
  statement_timeout: 3000,          // 3s query timeout
});

// Handle pool errors gracefully - don't crash the process
pool.on("error", (err) => {
  console.error("[DB Pool] Connection error (will reconnect):", err.message);
});

export const db = drizzle(pool, { schema });

// Utility function for retrying DB operations
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string = "DB operation",
  maxRetries: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError = error?.message?.includes("Connection terminated") ||
                                error?.message?.includes("ECONNREFUSED") ||
                                error?.message?.includes("ECONNRESET") ||
                                error?.message?.includes("connection");
      
      if (isConnectionError && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(`[DB] ${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`[DB] ${operationName} failed after ${attempt} attempts:`, error.message);
      return null;
    }
  }
  return null;
}

// Global unhandled rejection handler to prevent crashes
process.on('unhandledRejection', (reason: any) => {
  if (reason?.message?.includes('Connection terminated') ||
      reason?.message?.includes('ECONNRESET') ||
      reason?.code === 'ECONNRESET') {
    console.error('[DB] Unhandled connection error (suppressed):', reason.message);
    return; // Don't crash
  }
  console.error('[Unhandled Rejection]:', reason);
});
