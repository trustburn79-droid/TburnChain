import { TBurnLogo } from "./tburn-logo";

interface TBurnLoaderProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function TBurnLoader({ 
  size = "md", 
  message, 
  className = "",
  fullScreen = false 
}: TBurnLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center";

  return (
    <div className={`${containerClasses} ${className}`} data-testid="tburn-loader">
      <div className="flex flex-col items-center gap-3">
        <div className={`${sizeClasses[size]}`}>
          <TBurnLogo className="w-full h-full animate-pulse" showText={false} />
        </div>
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}

export function PageLoader() {
  // CRITICAL: Inline styles as fallback for CSS race condition
  // Ensures loader is visible even before Tailwind CSS loads
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen w-full bg-background" 
      data-testid="page-loader"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #030407 0%, #0a0a14 100%)',
      }}
    >
      <div 
        className="flex flex-col items-center gap-4"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '72px', height: '72px', animation: 'tburn-spin 1.5s ease-in-out infinite' }}>
          <defs>
            <linearGradient id="flameGradLoader" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#FF6B35"/>
              <stop offset="50%" stopColor="#F7931E"/>
              <stop offset="100%" stopColor="#FFD700"/>
            </linearGradient>
            <linearGradient id="glowGradLoader" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#FF4500" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#glowGradLoader)" opacity="0.3"/>
          <circle cx="50" cy="50" r="40" stroke="url(#flameGradLoader)" strokeWidth="2" fill="none"/>
          <path d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20" fill="url(#flameGradLoader)"/>
          <path d="M50 35 C42 45, 38 55, 42 65 C45 72, 48 75, 50 75 C52 75, 55 72, 58 65 C62 55, 58 45, 50 35" fill="#FFD700" opacity="0.8"/>
        </svg>
        <p 
          className="text-lg font-medium text-foreground animate-pulse"
          style={{ 
            color: '#888', 
            fontSize: '14px', 
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            margin: 0,
            animation: 'tburn-fade 1.5s ease-in-out infinite'
          }}
        >
          Loading...
        </p>
        <style>{`
          @keyframes tburn-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
          @keyframes tburn-fade{0%,100%{opacity:0.5}50%{opacity:1}}
        `}</style>
      </div>
    </div>
  );
}

export function InlineLoader({ className = "" }: { className?: string }) {
  return <TBurnLoader size="sm" className={className} />;
}
