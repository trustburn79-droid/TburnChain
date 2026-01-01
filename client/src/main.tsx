import { createRoot, Root } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

declare global {
  interface Window {
    __TBURN_APP_ROOT__?: Root;
    __TBURN_INITIALIZED__?: boolean;
    __TBURN_VERSION__?: string;
    __TBURN_CHUNK_ERROR_RELOAD__?: boolean;
  }
}

// ============================================
// CRITICAL: Dynamic Import Error Handler
// Auto-reload when chunk loading fails (stale cache issue)
// ============================================
function setupChunkErrorHandler() {
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const target = event.target as HTMLScriptElement | null;
    
    // Detect chunk loading failures
    const isChunkError = 
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('Loading CSS chunk') ||
      (target?.tagName === 'SCRIPT' && target?.src?.includes('/assets/'));
    
    if (isChunkError && !window.__TBURN_CHUNK_ERROR_RELOAD__) {
      console.error('[TBURN] Chunk loading failed - performing auto-reload');
      window.__TBURN_CHUNK_ERROR_RELOAD__ = true;
      sessionStorage.setItem('tburn-chunk-error-reload', Date.now().toString());
      
      // Clear all caches and force reload
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Force hard reload after small delay
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, true);
  
  // Handle unhandled promise rejections (for async import failures)
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason) || '';
    
    const isChunkError = 
      reason.includes('Failed to fetch dynamically imported module') ||
      reason.includes('Loading chunk') ||
      reason.includes('error loading dynamically imported module');
    
    if (isChunkError && !window.__TBURN_CHUNK_ERROR_RELOAD__) {
      console.error('[TBURN] Dynamic import failed - performing auto-reload');
      window.__TBURN_CHUNK_ERROR_RELOAD__ = true;
      sessionStorage.setItem('tburn-chunk-error-reload', Date.now().toString());
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  });
}

// Initialize chunk error handler immediately
setupChunkErrorHandler();

const BUILD_VERSION = "2026.01.02.v1";

function safeInitApp() {
  const htmlVersion = document.documentElement.getAttribute("data-version");
  
  if (htmlVersion && htmlVersion !== BUILD_VERSION) {
    console.warn(`[TBURN] Version mismatch: HTML=${htmlVersion}, JS=${BUILD_VERSION}. Force reloading...`);
    sessionStorage.setItem("tburn-force-reload", Date.now().toString());
    window.location.reload();
    return;
  }
  
  if (window.__TBURN_INITIALIZED__) {
    console.warn("[TBURN] App already initialized, skipping duplicate mount");
    return;
  }
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("[TBURN] Root element not found - retrying in 100ms");
    setTimeout(safeInitApp, 100);
    return;
  }
  
  if (window.__TBURN_APP_ROOT__) {
    console.warn("[TBURN] Root already exists, unmounting first");
    try {
      window.__TBURN_APP_ROOT__.unmount();
    } catch (e) {
      console.warn("[TBURN] Failed to unmount existing root:", e);
    }
    window.__TBURN_APP_ROOT__ = undefined;
  }
  
  rootElement.innerHTML = "";
  
  window.__TBURN_INITIALIZED__ = true;
  window.__TBURN_VERSION__ = BUILD_VERSION;
  
  let portalRoot = document.getElementById("radix-portal-root");
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "radix-portal-root";
    document.body.appendChild(portalRoot);
  }
  
  try {
    window.__TBURN_APP_ROOT__ = createRoot(rootElement);
    window.__TBURN_APP_ROOT__.render(<App />);
    console.log(`[TBURN] App initialized successfully (v${BUILD_VERSION})`);
  } catch (error) {
    console.error("[TBURN] Render failed:", error);
    window.__TBURN_INITIALIZED__ = false;
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#030407;color:white;font-family:sans-serif;text-align:center;padding:20px;">
        <h2 style="color:#FF6B35;margin-bottom:16px;">페이지 로딩 오류</h2>
        <p style="color:#999;margin-bottom:24px;">페이지를 불러오는 중 문제가 발생했습니다.</p>
        <button onclick="location.reload(true)" style="background:#FF6B35;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:16px;">
          새로고침
        </button>
      </div>
    `;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(safeInitApp);
  }, { once: true });
} else {
  requestAnimationFrame(safeInitApp);
}
