import { createRoot, Root } from "react-dom/client";
import "./index.css";
import { installVisibilityWarmup, warmupServer } from "./lib/api-client";
// CRITICAL: App and i18n are loaded dynamically to reduce initial bundle size

// ============================================
// Cold Start Protection: Server Warmup
// ★ [v6.0] 10분 유휴 후 에러 방지
// ============================================
installVisibilityWarmup();

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
        <h2 style="color:#FF6B35;margin-bottom:16px;font-size:24px;">Unable to load page resources</h2>
        <p style="color:#999;margin-bottom:8px;font-size:14px;">The page could not be loaded due to a browser cache issue.</p>
        <p style="color:#666;margin-bottom:24px;font-size:13px;">Click the button below or press Ctrl+Shift+R (Mac: Cmd+Shift+R) to force refresh.</p>
        <button onclick="sessionStorage.clear();location.href=location.origin+'?v='+Date.now()" style="background:linear-gradient(135deg,#FF6B35,#F7931E);color:white;border:none;padding:14px 32px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(255,107,53,0.3);">
          Force Refresh
        </button>
        <p style="color:#555;margin-top:24px;font-size:12px;">If the problem persists, please clear your browser cache.</p>
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

// CRITICAL: Disable browser's automatic scroll restoration
// This ensures pages always start at the top when navigating
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Clear reload history if app loads successfully (after 5 seconds)
setTimeout(() => {
  if (window.__TBURN_INITIALIZED__) {
    sessionStorage.removeItem('tburn-reload-history');
  }
}, 5000);

const BUILD_VERSION = "2026.01.03.v1";

async function safeInitApp() {
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
  
  // Show TBURN branded loading indicator while App loads
  // Include "Loading..." text for better UX during cold starts
  rootElement.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg, #030407 0%, #0a0a14 100%);">
      <div style="text-align:center;">
        <svg viewBox="0 0 100 100" style="width:72px;height:72px;animation:tburn-pulse 1.5s ease-in-out infinite;margin:0 auto 20px;">
          <defs>
            <linearGradient id="flameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stop-color="#FF6B35"/>
              <stop offset="50%" stop-color="#F7931E"/>
              <stop offset="100%" stop-color="#FFD700"/>
            </linearGradient>
            <linearGradient id="glowGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stop-color="#FF4500" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#FFD700" stop-opacity="0.2"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#glowGrad)" opacity="0.3"/>
          <circle cx="50" cy="50" r="40" stroke="url(#flameGrad)" stroke-width="2" fill="none"/>
          <path d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20" fill="url(#flameGrad)"/>
          <path d="M50 35 C42 45, 38 55, 42 65 C45 72, 48 75, 50 75 C52 75, 55 72, 58 65 C62 55, 58 45, 50 35" fill="#FFD700" opacity="0.8"/>
        </svg>
        <p style="color:#888;font-size:14px;font-family:'Space Grotesk',system-ui,sans-serif;margin:0;animation:tburn-fade 1.5s ease-in-out infinite;">Loading...</p>
      </div>
      <style>
        @keyframes tburn-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.95)}}
        @keyframes tburn-fade{0%,100%{opacity:0.5}50%{opacity:1}}
      </style>
    </div>
  `;
  
  window.__TBURN_INITIALIZED__ = true;
  window.__TBURN_VERSION__ = BUILD_VERSION;
  
  let portalRoot = document.getElementById("radix-portal-root");
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "radix-portal-root";
    document.body.appendChild(portalRoot);
  }
  
  try {
    // CRITICAL: Server warmup before app initialization
    // This ensures backend is ready before frontend makes requests
    try {
      await warmupServer();
      console.log("[TBURN] Server warmup completed");
    } catch (warmupError) {
      console.warn("[TBURN] Server warmup failed, continuing with app load:", warmupError);
      // Continue anyway - the app should handle API failures gracefully
    }
    
    // CRITICAL: Initialize i18n BEFORE rendering to ensure translations are loaded
    // This prevents showing translation keys on first render
    const i18nModule = await import("./lib/i18n");
    await i18nModule.initializeI18n();
    console.log("[TBURN] i18n initialized successfully");
    
    // Route-based app shell loading for faster first paint
    // PublicApp: lightweight shell for public pages (no sidebar, websocket, heavy providers)
    // App: full shell with all providers for authenticated/complex pages
    const path = window.location.pathname;
    
    // Routes that load via PublicRouter (must be defined in PublicRouter.tsx)
    const isPublicRoute = path === "/" || 
                          path === "/vc" ||
                          path.startsWith("/vc-test") ||
                          path === "/scan" || 
                          path.startsWith("/scan/") ||
                          path === "/whitepaper" ||
                          path.startsWith("/learn") ||
                          path.startsWith("/developers") ||
                          path.startsWith("/solutions") ||
                          path.startsWith("/use-cases") ||
                          path.startsWith("/network") ||
                          path.startsWith("/community") ||
                          path.startsWith("/legal") ||
                          path.startsWith("/rpc") ||
                          path.startsWith("/testnet-rpc") ||
                          path.startsWith("/testnet-scan") ||
                          path === "/brand" ||
                          path === "/token-generator" ||
                          path === "/tree" ||
                          path === "/airdrop" ||
                          path === "/referral" ||
                          path === "/events" ||
                          path.startsWith("/token-schedule") ||
                          path.startsWith("/token-details") ||
                          path === "/nft-marketplace" ||
                          path.startsWith("/nft-marketplace/") ||
                          path === "/login" ||
                          path === "/signup";
    
    let AppComponent;
    if (isPublicRoute) {
      // Lightweight public shell - no sidebar, websocket, web3 providers
      const { default: PublicApp } = await import("./PublicApp");
      AppComponent = PublicApp;
      console.log(`[TBURN] Loading lightweight PublicApp for ${path}`);
    } else {
      // Full app with all providers for authenticated routes
      const { default: App } = await import("./App");
      AppComponent = App;
      console.log(`[TBURN] Loading full App for ${path}`);
    }
    
    window.__TBURN_APP_ROOT__ = createRoot(rootElement);
    window.__TBURN_APP_ROOT__.render(<AppComponent />);
    console.log(`[TBURN] App initialized successfully (v${BUILD_VERSION})`);
  } catch (error: any) {
    // Enhanced error logging to capture full stack trace
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || '';
    const errorName = error?.name || 'Error';
    console.error("[TBURN] Render failed:", errorName, errorMessage);
    console.error("[TBURN] Stack trace:", errorStack);
    
    window.__TBURN_INITIALIZED__ = false;
    
    // Show user-friendly error UI with visible loading indicator
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);color:white;font-family:'Space Grotesk',system-ui,sans-serif;text-align:center;padding:20px;">
        <svg viewBox="0 0 100 100" style="width:80px;height:80px;margin-bottom:24px;">
          <defs>
            <linearGradient id="errGrad" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stop-color="#FF6B35"/>
              <stop offset="100%" stop-color="#FFD700"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="40" stroke="url(#errGrad)" stroke-width="2" fill="none"/>
          <path d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20" fill="url(#errGrad)"/>
        </svg>
        <h2 style="color:#FF6B35;margin-bottom:16px;font-size:24px;">페이지 로딩 중 오류 발생</h2>
        <p style="color:#aaa;margin-bottom:8px;font-size:15px;">페이지를 불러오는 중 문제가 발생했습니다.</p>
        <p style="color:#666;margin-bottom:24px;font-size:13px;">새로고침 버튼을 클릭하거나 잠시 후 다시 시도해 주세요.</p>
        <button onclick="location.reload()" style="background:linear-gradient(135deg,#FF6B35,#F7931E);color:white;border:none;padding:14px 32px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(255,107,53,0.3);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          새로고침
        </button>
        <p style="color:#555;margin-top:24px;font-size:12px;">문제가 지속되면 브라우저 캐시를 삭제해 주세요.</p>
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
