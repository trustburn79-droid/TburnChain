import { createRoot, Root } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

declare global {
  interface Window {
    __TBURN_DOM_READY__?: boolean;
    __TBURN_BOOTSTRAP__?: (() => void) | null;
  }
}

let appRoot: Root | null = null;

function safeRender(rootElement: HTMLElement) {
  if (appRoot) return;
  
  let portalRoot = document.getElementById("radix-portal-root");
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "radix-portal-root";
    document.body.appendChild(portalRoot);
  }
  
  try {
    appRoot = createRoot(rootElement);
    appRoot.render(<App />);
  } catch (error) {
    console.error("[TBURN] Render failed:", error);
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:sans-serif;">
        <h1>Loading Error</h1>
        <p>Please refresh the page.</p>
        <button onclick="window.location.reload()" style="margin-top:20px;padding:10px 20px;background:#f59e0b;color:#000;border:none;border-radius:8px;cursor:pointer;">
          Refresh
        </button>
      </div>
    `;
  }
}

function bootstrap() {
  if (appRoot) return;
  
  const root = document.getElementById("root");
  if (root) {
    safeRender(root);
  } else if (document.body) {
    const newRoot = document.createElement("div");
    newRoot.id = "root";
    document.body.insertBefore(newRoot, document.body.firstChild);
    safeRender(newRoot);
  }
}

if (window.__TBURN_DOM_READY__) {
  bootstrap();
} else {
  window.__TBURN_BOOTSTRAP__ = bootstrap;
}
