import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import express, { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";

import viteConfig from "../vite.config";
import runApp from "./app";

// Use production build if available (faster startup on Replit)
// Check for dist/public which is where Vite builds to (see vite.config.ts)
const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
// Only use static build if USE_STATIC_BUILD is explicitly 'true', or if not set and dist exists
const USE_STATIC_BUILD = process.env.USE_STATIC_BUILD === 'true' || 
  (process.env.USE_STATIC_BUILD !== 'false' && fs.existsSync(path.join(distPath, "index.html")));

export async function setupVite(app: Express, server: Server) {
  // Check if we should use static build instead of Vite dev server
  if (USE_STATIC_BUILD) {
    console.log('[Dev] Using static build from', distPath);
    
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    return;
  }
  
  // Serve homepage with static HTML to avoid Vite compilation timeout
  const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");
  console.log('[Dev] Homepage route registered, template path:', clientTemplate);
  
  app.get("/", (req, res) => {
    console.log('[Dev] Homepage request received');
    try {
      const template = fs.readFileSync(clientTemplate, "utf-8");
      console.log('[Dev] Template read, size:', template.length);
      res.status(200).set({ "Content-Type": "text/html" }).send(template);
      console.log('[Dev] Homepage response sent');
    } catch (e) {
      console.error('[Dev] Failed to serve homepage:', e);
      res.status(500).send('Failed to load homepage');
    }
  });
  
  // Fallback to Vite dev server
  console.log('[Dev] Starting Vite development server...');
  const viteLogger = createLogger();
  const isReplit = Boolean(process.env.REPL_ID);
  
  const serverOptions = {
    middlewareMode: true,
    // Disable HMR in Replit to prevent WebSocket blocking issues
    hmr: isReplit ? false : { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

(async () => {
  // Always start enterprise node for development
  console.log('[Enterprise] Initializing TBURN enterprise infrastructure...');
  console.log('[Enterprise] Current TBURN_API_KEY:', process.env.TBURN_API_KEY || 'not set');
  
  // Force start enterprise node
  const { getEnterpriseNode } = await import("./services/TBurnEnterpriseNode");
  const enterpriseNode = getEnterpriseNode(); // This will auto-start
  console.log('[Enterprise] TBURN enterprise node initialized with API key tburn797900');
  
  await runApp(setupVite);
})();
