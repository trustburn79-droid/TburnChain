import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

function initApp() {
  let rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.warn("[TBURN] Root element not found. Creating fallback root.");
    rootElement = document.createElement("div");
    rootElement.id = "root";
    if (document.body) {
      document.body.appendChild(rootElement);
    } else {
      document.documentElement.appendChild(rootElement);
    }
  }
  
  let portalRoot = document.getElementById("radix-portal-root");
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "radix-portal-root";
    if (document.body) {
      document.body.appendChild(portalRoot);
    } else {
      document.documentElement.appendChild(portalRoot);
    }
  }
  
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("[TBURN] Failed to render app:", error);
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:sans-serif;">
        <h1>Loading Error</h1>
        <p>Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="margin-top:20px;padding:10px 20px;background:#f59e0b;color:#000;border:none;border-radius:8px;cursor:pointer;">
          Refresh
        </button>
      </div>
    `;
  }
}

function safeInit() {
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      if (document.body) {
        initApp();
      } else {
        document.addEventListener("DOMContentLoaded", initApp, { once: true });
      }
    });
  });
}

if (document.readyState === "complete") {
  initApp();
} else if (document.readyState === "interactive") {
  safeInit();
} else {
  document.addEventListener("DOMContentLoaded", safeInit, { once: true });
}
