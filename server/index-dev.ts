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
  
  // Defer heavy enterprise infrastructure initialization
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
