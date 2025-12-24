import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

function initApp() {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("[TBURN] Root element not found. Creating fallback root.");
    const fallbackRoot = document.createElement("div");
    fallbackRoot.id = "root";
    document.body.appendChild(fallbackRoot);
    createRoot(fallbackRoot).render(<App />);
    return;
  }
  
  createRoot(rootElement).render(<App />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
