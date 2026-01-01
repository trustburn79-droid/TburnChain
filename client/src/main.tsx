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
// CRITICAL: Dynamic Import Error Handler with Infinite Loop Prevention
// Auto-reload when chunk loading fails (stale cache issue)
// ============================================
const RELOAD_COOLDOWN_MS = 30000; // 30 seconds between reloads
const MAX_RELOADS = 3; // Maximum 3 reloads in cooldown period

function getReloadHistory(): number[] {
  try {
    const history = sessionStorage.getItem('tburn-reload-history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function recordReload(): boolean {
  const now = Date.now();
  const history = getReloadHistory().filter(t => now - t < RELOAD_COOLDOWN_MS);
  
  if (history.length >= MAX_RELOADS) {
    console.error('[TBURN] Too many reloads - showing error UI instead');
    return false; // Don't allow reload
  }
  
  history.push(now);
  sessionStorage.setItem('tburn-reload-history', JSON.stringify(history));
  return true; // Allow reload
}

function showChunkErrorUI() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#030407;color:white;font-family:'Space Grotesk',sans-serif;text-align:center;padding:20px;">
        <svg width="80" height="80" viewBox="0 0 100 100" style="margin-bottom:24px;">
          <circle cx="50" cy="50" r="40" stroke="#FF6B35" stroke-width="2" fill="none"/>
          <path d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20" fill="url(#fg)"/>
          <defs><linearGradient id="fg" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#FFD700"/>
          </linearGradient></defs>
        </svg>
        <h2 style="color:#FF6B35;margin-bottom:16px;font-size:24px;">페이지 리소스를 불러올 수 없습니다</h2>
        <p style="color:#999;margin-bottom:8px;font-size:14px;">브라우저 캐시 문제로 인해 페이지를 불러올 수 없습니다.</p>
        <p style="color:#666;margin-bottom:24px;font-size:13px;">아래 버튼을 클릭하거나 Ctrl+Shift+R (Mac: Cmd+Shift+R)을 눌러 강제 새로고침하세요.</p>
        <button onclick="sessionStorage.clear();location.href=location.origin+'?v='+Date.now()" style="background:linear-gradient(135deg,#FF6B35,#F7931E);color:white;border:none;padding:14px 32px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(255,107,53,0.3);">
          강제 새로고침
        </button>
        <p style="color:#555;margin-top:24px;font-size:12px;">문제가 지속되면 브라우저 캐시를 삭제해주세요.</p>
      </div>
    `;
  }
}

function handleChunkError() {
  if (window.__TBURN_CHUNK_ERROR_RELOAD__) {
    return; // Already handling
  }
  
  window.__TBURN_CHUNK_ERROR_RELOAD__ = true;
  
  // Clear Service Worker and caches
  if ('caches' in window) {
    caches.keys().then(names => names.forEach(name => caches.delete(name)));
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => 
      regs.forEach(reg => reg.unregister())
    );
  }
  
  // Check if we can reload
  if (recordReload()) {
    console.error('[TBURN] Chunk loading failed - forcing hard reload with cache bust');
    // Use cache-busting URL to bypass CDN
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname + '?_t=' + Date.now();
    }, 100);
  } else {
    // Too many reloads - show manual refresh UI
    showChunkErrorUI();
  }
}

function setupChunkErrorHandler() {
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const target = event.target as HTMLScriptElement | null;
    
    const isChunkError = 
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('Loading CSS chunk') ||
      (target?.tagName === 'SCRIPT' && target?.src?.includes('/assets/'));
    
    if (isChunkError) {
      handleChunkError();
    }
  }, true);
  
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason) || '';
    
    const isChunkError = 
      reason.includes('Failed to fetch dynamically imported module') ||
      reason.includes('Loading chunk') ||
      reason.includes('error loading dynamically imported module');
    
    if (isChunkError) {
      handleChunkError();
    }
  });
}

// Initialize chunk error handler immediately
setupChunkErrorHandler();

// Clear reload history if app loads successfully (after 5 seconds)
setTimeout(() => {
  if (window.__TBURN_INITIALIZED__) {
    sessionStorage.removeItem('tburn-reload-history');
  }
}, 5000);

const BUILD_VERSION = "2026.01.02.v3";

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
