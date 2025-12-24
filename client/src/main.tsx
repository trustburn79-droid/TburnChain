import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

let appInitialized = false;

function renderApp(rootElement: HTMLElement) {
  if (appInitialized) return;
  appInitialized = true;
  
  let portalRoot = document.getElementById("radix-portal-root");
  if (!portalRoot && document.body) {
    portalRoot = document.createElement("div");
    portalRoot.id = "radix-portal-root";
    document.body.appendChild(portalRoot);
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

function waitForRoot(maxAttempts = 50): void {
  let attempts = 0;
  
  function checkRoot() {
    const rootElement = document.getElementById("root");
    
    if (rootElement && document.body) {
      renderApp(rootElement);
      return;
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      requestAnimationFrame(checkRoot);
    } else {
      if (document.body) {
        const fallbackRoot = document.createElement("div");
        fallbackRoot.id = "root";
        document.body.insertBefore(fallbackRoot, document.body.firstChild);
        renderApp(fallbackRoot);
      }
    }
  }
  
  checkRoot();
}

function initApp() {
  if (appInitialized) return;
  
  const rootElement = document.getElementById("root");
  
  if (rootElement && document.body) {
    renderApp(rootElement);
  } else {
    waitForRoot();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp, { once: true });
} else {
  requestAnimationFrame(initApp);
}
