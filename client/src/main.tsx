import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

let hasInitialized = false;

function initApp() {
  if (hasInitialized) return;
  hasInitialized = true;
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("[TBURN] Root element not found");
    return;
  }
  
  let portalRoot = document.getElementById("radix-portal-root");
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "radix-portal-root";
    document.body.appendChild(portalRoot);
  }
  
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("[TBURN] Render failed:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp, { once: true });
} else {
  initApp();
}
