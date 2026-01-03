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

// Use process.cwd() which is always the project root in Replit Autoscale
const distPath = path.resolve(process.cwd(), "dist", "public");

console.log(`[Production] Static files: ${distPath}`);
console.log(`[Production] Path exists: ${fs.existsSync(distPath)}`);

// List dist directory contents for debugging
if (fs.existsSync(path.resolve(process.cwd(), "dist"))) {
  const distContents = fs.readdirSync(path.resolve(process.cwd(), "dist"));
  console.log(`[Production] dist/ contents: ${distContents.join(", ")}`);
}

if (!fs.existsSync(distPath)) {
  console.error(`[FATAL] Could not find build directory: ${distPath}`);
  console.error(`[FATAL] Available directories in project root:`);
  try {
    const files = fs.readdirSync(process.cwd());
    console.error(files.join(', '));
  } catch (e) {
    console.error('Could not read project root');
  }
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

// React SPA served at / via SPA fallback below

// ============================================
// CRITICAL: Cache-Control Headers for Production
// index.html: no-cache (always fetch fresh)
// /assets/*: immutable long-cache (hashed filenames)
// ============================================

// Serve hashed assets with immutable caching
app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
  etag: false, // Not needed for hashed files
}));

// Serve static files with proper caching
app.use(express.static(distPath, {
  maxAge: '1h',
  etag: true,
  setHeaders: (res, filePath) => {
    // index.html MUST NOT be cached for SPA routing
    if (filePath.endsWith('index.html') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.setHeader('X-Content-Version', '2026.01.02.v6');
    }
  },
}));

// Handle 404 for missing assets (chunk loading failures)
app.use('/assets', (req, res) => {
  console.error(`[Asset 404] Missing: ${req.url}`);
  res.status(404).json({ 
    error: 'Asset not found',
    hint: 'This may be caused by a stale browser cache. Please hard refresh (Ctrl+Shift+R).',
    requestedFile: req.url,
  });
});

// ============================================
// PHASE 2: SPA Fallback IMMEDIATELY (before heavy init)
// This allows index.html to be served instantly on first visit
// ============================================

// Helper function to serve index.html with proper headers
function serveIndexHtml(res: express.Response) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Content-Version', '2026.01.02.v3');
  res.sendFile(path.resolve(distPath, "index.html"));
}

// API placeholder - returns 503 while services are initializing
// Allow critical auth endpoints through even during initialization
// Other APIs will be blocked until full initialization completes
app.use('/api', (req, res, next) => {
  // Allow health checks and auth-related APIs during initialization
  // Auth APIs are lightweight and only need database + session
  const earlyAllowedPaths = [
    '/api/health',
    '/api/auth/check',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/register',
    '/api/public/',  // All public API endpoints
  ];
  
  const isEarlyAllowed = earlyAllowedPaths.some(path => 
    req.path === path || req.path.startsWith(path)
  );
  
  if (!servicesReady && !isEarlyAllowed) {
    return res.status(503).json({
      error: 'Service initializing',
      message: 'Backend services are starting up. Please retry in a few seconds.',
      retryAfter: 3,
      servicesReady: false,
    });
  }
  next();
});

// WebSocket placeholder - will be upgraded once services are ready
app.use('/ws', (req, res, next) => {
  if (!servicesReady) {
    return res.status(503).json({
      error: 'WebSocket not ready',
      message: 'Backend services are starting up.',
      retryAfter: 5,
    });
  }
  next();
});

// Early handlers for static HTML pages that must work during initialization
// These are legal/compliance documents that must always be accessible
app.get('/whitepaper', async (_req, res) => {
  try {
    const whitepaperPath = path.resolve(process.cwd(), 'public', 'whitepaper.html');
    if (fs.existsSync(whitepaperPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(whitepaperPath);
    } else {
      res.status(404).send('Whitepaper not found');
    }
  } catch (error) {
    console.error('[Whitepaper] Error:', error);
    res.status(500).send('Error loading whitepaper');
  }
});

app.get('/technical-whitepaper', async (_req, res) => {
  try {
    const whitepaperPath = path.resolve(process.cwd(), 'public', 'technical-whitepaper.html');
    if (fs.existsSync(whitepaperPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(whitepaperPath);
    } else {
      res.status(404).send('Technical whitepaper not found');
    }
  } catch (error) {
    console.error('[Technical Whitepaper] Error:', error);
    res.status(500).send('Error loading technical whitepaper');
  }
});

// Backend routes that must NOT be intercepted by SPA fallback
// Verified from routes.ts: only these 3 non-API routes exist
const BACKEND_ROUTES = ['/api', '/ws', '/health', '/whitepaper', '/technical-whitepaper'];

// Early SPA fallback - serves index.html for SPA routes during initialization
// This enables instant page load while backend services initialize in background
app.use('*', (req, res, next) => {
  // Skip backend routes - they have their own handlers
  const urlPath = req.originalUrl.split('?')[0];
  for (const route of BACKEND_ROUTES) {
    if (urlPath === route || urlPath.startsWith(route + '/')) {
      return next();
    }
  }
  
  // Only serve index.html for browser HTML requests
  const acceptsHtml = req.headers.accept?.includes('text/html');
  if (!acceptsHtml) {
    return next();
  }
  
  serveIndexHtml(res);
});

// ============================================
// PHASE 3: Start HTTP server
// ============================================
const server = createServer(app);
const port = parseInt(process.env.PORT || '5000', 10);

server.listen({ port, host: "0.0.0.0" }, () => {
  console.log(`[Production] ✅ Server listening on port ${port} (static files ready)`);
  console.log(`[Production] ⏳ Starting backend services immediately...`);
  
  // Start services with minimal delay (just enough for server to be fully ready)
  // Auth APIs will be registered quickly, then heavy services initialize in background
  setImmediate(() => {
    initializeBackendServices();
  });
});

// ============================================
// PHASE 4: Background API service initialization
// ============================================
async function initializeBackendServices() {
  try {
    // Dynamically import heavy modules only after server is ready
    const { default: runAppServices } = await import("./app-services");
    
    await runAppServices(app, server);
    
    // Note: Early SPA fallback (registered above) already handles all SPA routes
    // No additional fallback needed here
    
    setServicesReady(true);
    console.log(`[Production] ✅ All backend services initialized - API ready`);
  } catch (error) {
    console.error(`[Production] ❌ Service initialization failed:`, error);
    // Don't crash - static serving continues to work
  }
}
