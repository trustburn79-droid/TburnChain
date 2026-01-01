import fs from "node:fs";
import path from "node:path";
import { type Server, createServer } from "node:http";
import express, { type Express } from "express";

// Service readiness state - APIs can check this before responding
export let servicesReady = false;
export function setServicesReady(ready: boolean) {
  servicesReady = ready;
}

const app = express();

// Trust proxy for Replit/Nginx
app.set('trust proxy', 1);

// ============================================
// PHASE 1: Immediate static serving (< 1 second)
// ============================================
const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

if (!fs.existsSync(distPath)) {
  console.error(`[FATAL] Could not find build directory: ${distPath}`);
  process.exit(1);
}

// Health check - respond immediately (Autoscale requires this)
app.get("/health", (_req, res) => {
  res.status(200).json({ 
    status: "ok", 
    servicesReady,
    timestamp: Date.now() 
  });
});

// Serve static assets immediately
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true,
}));

// ============================================
// PHASE 2: Start HTTP server IMMEDIATELY
// ============================================
const server = createServer(app);
const port = parseInt(process.env.PORT || '5000', 10);

server.listen({ port, host: "0.0.0.0" }, () => {
  console.log(`[Production] ✅ Server listening on port ${port} (static serving ready)`);
  console.log(`[Production] ⏳ Initializing backend services in background...`);
  
  // PHASE 3: Initialize heavy services AFTER server is listening
  initializeBackendServices();
});

// ============================================
// PHASE 3: Background service initialization
// ============================================
async function initializeBackendServices() {
  try {
    // Dynamically import heavy modules only after server is ready
    const { default: runAppServices } = await import("./app-services");
    
    await runAppServices(app, server);
    
    // Setup SPA fallback AFTER API routes are registered
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    
    setServicesReady(true);
    console.log(`[Production] ✅ All backend services initialized`);
  } catch (error) {
    console.error(`[Production] ❌ Service initialization failed:`, error);
    // Don't crash - static serving continues to work
  }
}
