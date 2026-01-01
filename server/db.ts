import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Configure WebSocket for Neon serverless in Node.js
neonConfig.webSocketConstructor = ws;

// Production-optimized pool settings for Neon Serverless
// - max:3 prevents connection exhaustion in serverless (Neon recommends 2-5)
// - idleTimeoutMillis:20000 releases idle connections faster
// - connectionTimeoutMillis:5000 fails fast on connection issues
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });

// DB connection keep-alive to prevent cold start delays
// Runs a simple query every 30 seconds to keep connections warm
let keepAliveInterval: NodeJS.Timeout | null = null;

export function startDbKeepAlive() {
  if (keepAliveInterval) return;
  
  keepAliveInterval = setInterval(async () => {
    try {
      await pool.query('SELECT 1');
    } catch (err) {
      // Silently ignore - connection will be re-established on next query
    }
  }, 30000);
  
  // Initial warm-up query
  pool.query('SELECT 1').catch(() => {});
  console.log('[DB] Keep-alive started - connections will stay warm');
}

export function stopDbKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}
