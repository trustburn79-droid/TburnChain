console.log('[TBURN-Main] Starting module load...');
import { createRoot, Root } from "react-dom/client";
console.log('[TBURN-Main] React imports loaded');
import "./index.css";
console.log('[TBURN-Main] CSS loaded');
import App from "./App";
console.log('[TBURN-Main] App imported directly (no lazy loading)');

function LoadingFallback() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#030407',
      color: 'white',
      fontFamily: 'Space Grotesk, system-ui, sans-serif',
      gap: '1.5rem'
    }}>
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fg" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="50%" stopColor="#F7931E" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="40" stroke="url(#fg)" strokeWidth="2" fill="none" />
        <path d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20" fill="url(#fg)" />
        <text x="50" y="58" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1a1a2e">T</text>
      </svg>
      <div style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading TBURN Explorer...</div>
      <div style={{ width: '200px', height: '3px', background: 'rgba(255, 107, 53, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, #FF6B35, #FFD700)', borderRadius: '3px', animation: 'loading 1.2s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
    </div>
  );
}

function AppWrapper() {
  // Direct render without Suspense (no lazy loading)
  return <App />;
}

console.log('[TBURN-Main] Wrapper component defined');

declare global {
  interface Window {
    __TBURN_APP_ROOT__?: Root;
    __TBURN_INITIALIZED__?: boolean;
    __TBURN_VERSION__?: string;
  }
}

const BUILD_VERSION = "2025.12.25.v4";

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
    window.__TBURN_APP_ROOT__.render(<AppWrapper />);
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
