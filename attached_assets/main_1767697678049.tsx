/**
 * TBURN Frontend Main Entry Point
 * 
 * 10분 유휴 후 에러 방지:
 * 1. 서버 웜업 요청
 * 2. 탭 활성화 시 웜업
 * 3. API 자동 재시도
 * 4. 청크 로딩 재시도
 */

import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 유틸리티 임포트
import { 
  installChunkErrorHandler, 
  lazyWithRetry, 
  ChunkErrorBoundary 
} from './utils/dynamic-import-retry';

import { 
  installVisibilityWarmup, 
  warmupServer 
} from './utils/api-client';

// ============================================================================
// 앱 초기화
// ============================================================================

// 1. 청크 에러 핸들러 설치
installChunkErrorHandler();

// 2. 탭 활성화 시 웜업 핸들러 설치
const cleanupWarmup = installVisibilityWarmup();

// 3. 초기 서버 웜업
warmupServer();

// ============================================================================
// Lazy 컴포넌트 (재시도 포함)
// ============================================================================

// lazyWithRetry 사용 - 청크 로딩 실패 시 자동 재시도
const Home = lazyWithRetry(() => import('./pages/Home'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const ScanRoutes = lazyWithRetry(() => import('./pages/ScanRoutes'));
const Validators = lazyWithRetry(() => import('./pages/Validators'));
const Blocks = lazyWithRetry(() => import('./pages/Blocks'));
const Transactions = lazyWithRetry(() => import('./pages/Transactions'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));

// ============================================================================
// 로딩 컴포넌트
// ============================================================================

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0a0b',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #333',
        borderTop: '3px solid #f59e0b',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ color: '#888', marginTop: '16px' }}>로딩 중...</p>
    </div>
  );
}

// ============================================================================
// App 컴포넌트
// ============================================================================

function App() {
  // 컴포넌트 마운트 시 서버 웜업 확인
  useEffect(() => {
    // 페이지 로드 완료 후 웜업
    warmupServer();
    
    // 주기적 웜업 (5분마다)
    const intervalId = setInterval(() => {
      warmupServer();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return (
    <ChunkErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan/*" element={<ScanRoutes />} />
            <Route path="/validators" element={<Validators />} />
            <Route path="/blocks" element={<Blocks />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ChunkErrorBoundary>
  );
}

// ============================================================================
// 렌더링
// ============================================================================

// CSS 애니메이션 주입
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// React 앱 렌더링
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ============================================================================
// HMR (Hot Module Replacement)
// ============================================================================

if (import.meta.hot) {
  import.meta.hot.accept();
}
