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
        <div className={`${sizeClasses[size]} animate-pulse`}>
          <TBurnLogo className="w-full h-full animate-spin-slow" showText={false} />
        </div>
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]" data-testid="page-loader">
      <TBurnLoader size="lg" />
    </div>
  );
}

export function InlineLoader({ className = "" }: { className?: string }) {
  return <TBurnLoader size="sm" className={className} />;
}
