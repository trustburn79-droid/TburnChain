import { Badge } from "@/components/ui/badge";
import { Database, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSourceBadgeProps {
  isProduction?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function DataSourceBadge({ isProduction, className, size = "sm" }: DataSourceBadgeProps) {
  const nodeMode = import.meta.env.VITE_NODE_MODE || 'development';
  const isRealData = isProduction !== undefined ? isProduction : nodeMode === 'production';
  
  const sizeClasses = {
    sm: "h-5 text-xs px-1.5 py-0",
    md: "h-6 text-sm px-2 py-0.5",
    lg: "h-7 text-base px-3 py-1"
  };
  
  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };
  
  if (isRealData) {
    return (
      <Badge 
        variant="default"
        className={cn(
          "bg-green-600 hover:bg-green-700 text-white border-green-700",
          sizeClasses[size],
          className
        )}
        data-testid="badge-data-source-real"
      >
        <Database className={cn(iconSize[size], "mr-1")} />
        Mainnet
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="secondary"
      className={cn(
        "bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-400 border-amber-500/50",
        sizeClasses[size],
        className
      )}
      data-testid="badge-data-source-demo"
    >
      <TestTube className={cn(iconSize[size], "mr-1")} />
      Demo Data
    </Badge>
  );
}