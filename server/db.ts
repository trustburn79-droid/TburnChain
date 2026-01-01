import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Configure WebSocket for Neon serverless in Node.js
neonConfig.webSocketConstructor = ws;

// Pool configuration for high-frequency writes
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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
