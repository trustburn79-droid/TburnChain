import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Database, TestTube, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DataSourceStatus {
  dataSourceType: 'external-mainnet' | 'local-simulated' | 'testnet';
  isSimulated: boolean;
  isProduction: boolean;
  nodeUrl: string;
  message: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastChecked: string;
}

interface DataSourceBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function DataSourceBadge({ className, size = "sm", showTooltip = true }: DataSourceBadgeProps) {
  const { data: status, isLoading, isError } = useQuery<DataSourceStatus>({
    queryKey: ["/api/system/data-source"],
    refetchInterval: 30000,
    staleTime: 10000,
  });
  
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

  if (isLoading) {
    return (
      <Badge 
        variant="secondary"
        className={cn(
          "bg-gray-500/20 text-gray-500 border-gray-500/50 animate-pulse",
          sizeClasses[size],
          className
        )}
      >
        <Wifi className={cn(iconSize[size], "mr-1")} />
        Loading...
      </Badge>
    );
  }

  if (isError || !status) {
    return (
      <Badge 
        variant="destructive"
        className={cn(sizeClasses[size], className)}
      >
        <WifiOff className={cn(iconSize[size], "mr-1")} />
        Offline
      </Badge>
    );
  }

  const isRealMainnet = !status.isSimulated && status.dataSourceType === 'external-mainnet';
  
  const badgeContent = isRealMainnet ? (
    <Badge 
      variant="default"
      className={cn(
        "bg-green-600 hover:bg-green-700 text-white border-green-700",
        sizeClasses[size],
        className
      )}
      data-testid="badge-data-source-mainnet"
    >
      <Database className={cn(iconSize[size], "mr-1")} />
      Mainnet
    </Badge>
  ) : (
    <Badge 
      variant="secondary"
      className={cn(
        "bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-400 border-amber-500/50",
        sizeClasses[size],
        className
      )}
      data-testid="badge-data-source-simulated"
    >
      <TestTube className={cn(iconSize[size], "mr-1")} />
      Simulated
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1 text-xs">
          <p className="font-medium">{status.message}</p>
          <p className="text-muted-foreground">Node: {status.nodeUrl}</p>
          <p className="text-muted-foreground">
            Status: {status.connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function DataSourceIndicator({ className }: { className?: string }) {
  const { data: status } = useQuery<DataSourceStatus>({
    queryKey: ["/api/system/data-source"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (!status) return null;

  const isRealMainnet = !status.isSimulated;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <span className={cn(
        "w-2 h-2 rounded-full",
        isRealMainnet ? "bg-green-500" : "bg-amber-500"
      )} />
      <span className="text-muted-foreground">
        {isRealMainnet ? "Live Mainnet" : "Simulated Data"}
      </span>
    </div>
  );
}
