import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import { nanoid } from "nanoid";
import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";

import viteConfig from "../vite.config";
import runApp from "./app";

export async function setupVite(app: Express, server: Server) {
  const viteLogger = createLogger();
  const isReplit = Boolean(process.env.REPL_ID);
  
  const serverOptions = {
    middlewareMode: true,
    // Disable HMR in Replit to prevent WebSocket blocking issues
    // Keep HMR enabled for local development
    hmr: isReplit ? false : { server },
    allowedHosts: true as const,
  };

  // ★ [2026-01-12 ARCHITECT FIX] Use default Vite logger - no custom error handling
  // PostCSS warnings were being promoted to errors and causing process.exit(1)
  // Removing custom logger prevents warnings from terminating the dev server
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: viteLogger,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Static HTML pages and file downloads that should NOT be handled by Vite SPA fallback
  const STATIC_HTML_ROUTES = ['/vision', '/whitepaper', '/technical-whitepaper', '/downloads'];
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip SPA fallback for static HTML pages - let Express routes handle them
    if (STATIC_HTML_ROUTES.some(route => url === route || url.startsWith(route + '?'))) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

(async () => {
  // CRITICAL: Start Vite FIRST to serve frontend immediately
  // Enterprise Node initialization is deferred to prevent blocking the event loop
  // This ensures the UI loads without waiting for heavy blockchain initialization
  await runApp(setupVite);
  
  // Check if we should skip enterprise node in DEV_SAFE_MODE
  const { DEV_SAFE_MODE } = await import("./core/memory/metrics-config");
  
  if (DEV_SAFE_MODE) {
    console.log('[Enterprise] ⚡ DEV_SAFE_MODE active - Enterprise Node startup SKIPPED for memory optimization');
    console.log('[Enterprise] 📊 Running in lightweight static data mode');
    return;
  }
  
  // Defer heavy enterprise infrastructure initialization (only in production/staging)
  // This allows Vite to serve the frontend bundle before blockchain services start
  setTimeout(async () => {
    console.log('[Enterprise] Initializing TBURN enterprise infrastructure (deferred)...');
    console.log('[Enterprise] Current TBURN_API_KEY:', process.env.TBURN_API_KEY || 'not set');
    
    // Start enterprise node after Vite is ready
    const { getEnterpriseNode } = await import("./services/TBurnEnterpriseNode");
    const enterpriseNode = getEnterpriseNode(); // This will auto-start
    console.log('[Enterprise] TBURN enterprise node initialized with API key tburn797900');
  }, 3000); // 3 second delay to let Vite compile and serve frontend first
})();
