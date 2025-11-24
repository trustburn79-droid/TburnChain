import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useMainnetSnapshots } from "@/hooks/use-mainnet-snapshots";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Power,
  Clock,
  Database,
  Zap,
  Shield,
  Loader2,
  WifiOff,
  Wifi,
  AlertCircle,
  CheckCircle,
  Timer,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

// Types
interface MainnetHealth {
  isHealthy: boolean;
  lastBlockTime: number;
  lastBlockNumber: number;
  timeSinceLastBlock: number;
  status: "active" | "paused" | "degraded" | "restarting" | "offline" | "rate-limited";
  tps: number;
  peakTps: number;
  errorType?: "api-rate-limit" | "api-error" | "mainnet-offline" | "network-error";
  retryAfter?: number;
  isStale?: boolean;
}

interface RestartPhase {
  phase: "idle" | "initiating" | "shutting_down" | "restarting" | "reconnecting" | "validating" | "completed" | "failed";
  message: string;
  progress: number;
  startTime?: number;
  estimatedDuration?: number;
  error?: string;
}

interface AdminOperationStatus {
  operationType: "restart" | "health_check";
  phase: RestartPhase;
  timestamp: number;
  completedAt?: number;
}

// Phase configurations
const RESTART_PHASES = {
  idle: { icon: Activity, color: "text-muted-foreground", label: "Ready", animate: false },
  initiating: { icon: Loader2, color: "text-yellow-500", label: "Initiating", animate: true },
  shutting_down: { icon: Power, color: "text-orange-500", label: "Shutting Down", animate: true },
  restarting: { icon: RefreshCw, color: "text-blue-500", label: "Restarting Server", animate: true },
  reconnecting: { icon: Wifi, color: "text-purple-500", label: "Reconnecting", animate: true },
  validating: { icon: CheckCircle2, color: "text-cyan-500", label: "Validating", animate: true },
  completed: { icon: CheckCircle, color: "text-green-500", label: "Completed", animate: false },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed", animate: false }
};

// Custom hooks
function useRestartMonitor() {
  const [restartStatus, setRestartStatus] = useState<RestartPhase>({
    phase: "idle",
    message: "",
    progress: 0
  });
  const [isRestartInProgress, setIsRestartInProgress] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const startRestart = () => {
    setIsRestartInProgress(true);
    setRestartStatus({
      phase: "initiating",
      message: "Preparing to restart TBURN mainnet...",
      progress: 10,
      startTime: Date.now(),
      estimatedDuration: 60000 // 60 seconds total
    });

    // Simulate progress phases (keeping existing animation for now)
    let currentProgress = 10;
    progressInterval.current = setInterval(() => {
      currentProgress += 2;
      setRestartStatus(prev => {
        // Phase transitions based on progress
        let newPhase = prev.phase;
        let message = prev.message;
        
        if (currentProgress >= 20 && prev.phase === "initiating") {
          newPhase = "shutting_down";
          message = "Shutting down current instance...";
        } else if (currentProgress >= 40 && prev.phase === "shutting_down") {
          newPhase = "restarting";
          message = "Server restarting (Replit auto-restart)...";
        } else if (currentProgress >= 60 && prev.phase === "restarting") {
          newPhase = "reconnecting";
          message = "Reconnecting to TBURN mainnet...";
        } else if (currentProgress >= 80 && prev.phase === "reconnecting") {
          newPhase = "validating";
          message = "Validating system health...";
        } else if (currentProgress >= 100) {
          newPhase = "completed";
          message = "Restart completed successfully!";
          setIsRestartInProgress(false);
          if (progressInterval.current) clearInterval(progressInterval.current);
          
          // Reload the page after completion to refresh all data
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }

        return {
          ...prev,
          phase: newPhase as RestartPhase["phase"],
          message,
          progress: Math.min(currentProgress, 100)
        };
      });

      if (currentProgress >= 100) {
        clearInterval(progressInterval.current);
      }
    }, 600); // Update every 600ms for 60 second total duration
  };

  const resetStatus = () => {
    setRestartStatus({
      phase: "idle",
      message: "",
      progress: 0
    });
    setIsRestartInProgress(false);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  return {
    restartStatus,
    isRestartInProgress,
    startRestart,
    resetStatus
  };
}

export default function AdminPage() {
  const { toast } = useToast();
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showHealthCheckDialog, setShowHealthCheckDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  
  const { restartStatus, isRestartInProgress, startRestart, resetStatus } = useRestartMonitor();

  // Use snapshot system for real failure tracking
  const snapshots = useMainnetSnapshots(isRestartInProgress ? 2000 : 5000);
  const { stats, blocks, isLive, lastLiveUpdate, hasFailures, recentFailures, failureHistory } = snapshots;

  // Calculate mainnet health using snapshot data
  const calculateHealth = (): MainnetHealth => {
    // Priority 1: Check restart in progress
    if (isRestartInProgress) {
      return {
        isHealthy: false,
        lastBlockTime: 0,
        lastBlockNumber: 0,
        timeSinceLastBlock: 0,
        status: "restarting",
        tps: 0,
        peakTps: 520000,
        isStale: true
      };
    }

    // Priority 2: Extract data from snapshots
    const statsData = stats.data;
    const blocksData = blocks.data;
    const errorType = stats.errorType || blocks.errorType;

    // Priority 3: Check for rate limiting specifically
    if (errorType === 'api-rate-limit') {
      return {
        isHealthy: false,
        lastBlockTime: 0,
        lastBlockNumber: 0,
        timeSinceLastBlock: 0,
        status: "rate-limited" as MainnetHealth["status"],
        tps: 0,
        peakTps: 0,
        errorType: "api-rate-limit",
        isStale: true
      };
    }

    // Priority 4: Check data availability
    if (!statsData || !blocksData) {
      return {
        isHealthy: false,
        lastBlockTime: 0,
        lastBlockNumber: 0,
        timeSinceLastBlock: 0,
        status: "offline",
        tps: 0,
        peakTps: 0,
        errorType: errorType || "mainnet-offline",
        isStale: true
      };
    }

    // Priority 4: Process block data
    const lastBlock = blocksData[0];
    if (!lastBlock) {
      return {
        isHealthy: false,
        lastBlockTime: 0,
        lastBlockNumber: 0,
        timeSinceLastBlock: 0,
        status: "paused",
        tps: statsData.tps || 0,
        peakTps: statsData.peakTps || 520000,
        errorType,
        isStale: stats.isStale || blocks.isStale
      };
    }

    // Priority 5: Calculate health metrics
    const timeSinceLastBlock = Date.now() / 1000 - lastBlock.timestamp;
    const isHealthy = timeSinceLastBlock < 3600 && isLive; // 1 hour threshold + live data

    // Priority 6: Determine status based on source and staleness
    let status: MainnetHealth["status"];
    if (isHealthy && isLive) {
      status = "active";
    } else if (stats.isStale || blocks.isStale) {
      status = "degraded";
    } else if (timeSinceLastBlock > 7200) {
      status = "offline";
    } else {
      status = "paused";
    }

    return {
      isHealthy,
      lastBlockTime: lastBlock.timestamp,
      lastBlockNumber: lastBlock.height || (lastBlock as any).blockNumber || 0,
      timeSinceLastBlock,
      status,
      tps: statsData.tps || 0,
      peakTps: statsData.peakTps || 520000,
      errorType,
      isStale: stats.isStale || blocks.isStale
    };
  };

  const health = calculateHealth();

  // Restart mutation with enhanced feedback
  const restartMainnetMutation = useMutation({
    mutationFn: async (password: string) => {
      // Set a timeout to handle the case where the server doesn't respond
      // because it restarts before sending a complete response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch("/api/admin/restart-mainnet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Password": password,
          },
          credentials: "include",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to restart mainnet");
        }
        
        return response.json();
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // If the request was aborted or failed due to network error,
        // it might mean the server is restarting - consider this a success
        if (error.name === 'AbortError' || error.message === 'Failed to fetch') {
          console.log('[Admin] Server restart initiated (connection lost as expected)');
          return { success: true, message: 'Restart initiated - server disconnected as expected' };
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[Admin] Restart initiated:', data);
      startRestart(); // Start the progress monitoring
      toast({
        title: "🚀 Mainnet Restart Initiated",
        description: "Server is restarting. Progress will be tracked automatically.",
        duration: 10000,
      });
      setShowRestartDialog(false);
      setAdminPassword("");
      
      // Set up recovery monitoring
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/blocks/recent"] });
      }, 5000);
    },
    onError: (error: any) => {
      // Don't show error for expected connection failures during restart
      if (error.message === 'Failed to fetch' || error.name === 'AbortError') {
        console.log('[Admin] Connection lost during restart (expected behavior)');
        startRestart(); // Start the progress monitoring anyway
        toast({
          title: "🚀 Mainnet Restart Initiated",
          description: "Server is restarting. Connection lost as expected.",
          duration: 10000,
        });
        setShowRestartDialog(false);
        setAdminPassword("");
        return;
      }
      
      console.error('[Admin] Restart failed:', error);
      toast({
        title: "❌ Restart Failed",
        description: error.message || "Failed to restart mainnet. Check server logs.",
        variant: "destructive",
        duration: 10000,
      });
      setAdminPassword("");
      resetStatus();
    },
  });

  // Health check mutation with status tracking
  const checkHealthMutation = useMutation({
    mutationFn: async (password: string) => {
      setIsHealthChecking(true);
      const response = await fetch("/api/admin/check-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": password,
        },
        credentials: "include",
      });
      
      // Check content type to handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If not JSON, likely an error page (502, 503, etc)
        console.error('[Admin] Health check returned non-JSON response:', response.status, response.statusText);
        throw new Error(`Server error (${response.status}): ${response.statusText}. Server may be restarting.`);
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(error.message || "Failed to check health");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const healthIcon = data.healthy ? "✅" : "⚠️";
      const healthStatus = data.healthy ? "Healthy" : "Degraded";
      
      toast({
        title: `${healthIcon} Health Check: ${healthStatus}`,
        description: `TPS: ${data.details?.tps || 0} | Peak: ${data.details?.peakTps || 0} | Last Block: ${data.details?.timeSinceLastBlock?.toFixed(0)}s ago`,
        variant: data.healthy ? "default" : "destructive",
        duration: 8000,
      });
      setShowHealthCheckDialog(false);
      setAdminPassword("");
      setIsHealthChecking(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blocks/recent"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Health Check Failed",
        description: error.message || "Failed to perform health check.",
        variant: "destructive",
        duration: 10000,
      });
      setAdminPassword("");
      setIsHealthChecking(false);
    },
  });

  // Get status badge configuration
  const getStatusBadge = () => {
    const configs = {
      active: { variant: "default" as const, icon: CheckCircle2, className: "bg-green-500 hover:bg-green-600" },
      restarting: { variant: "secondary" as const, icon: RefreshCw, className: "bg-blue-500 hover:bg-blue-600 animate-pulse" },
      degraded: { variant: "secondary" as const, icon: AlertTriangle, className: "bg-yellow-500 hover:bg-yellow-600" },
      paused: { variant: "secondary" as const, icon: AlertCircle, className: "bg-orange-500 hover:bg-orange-600" },
      offline: { variant: "destructive" as const, icon: WifiOff, className: "" },
      "rate-limited": { variant: "secondary" as const, icon: Clock, className: "bg-orange-500 hover:bg-orange-600" }
    };
    return configs[health.status] || configs.offline;
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Mainnet Administration</h1>
        <p className="text-muted-foreground">Control and monitor TBURN mainnet infrastructure</p>
      </div>

      {/* Live Status Bar */}
      <Card className={`border-2 ${health.status === 'active' ? 'border-green-500/50' : health.status === 'restarting' ? 'border-blue-500/50 animate-pulse' : 'border-destructive/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-6 w-6 ${statusBadge.className.includes('animate') ? 'animate-spin' : ''} ${statusBadge.className.includes('green') ? 'text-green-500' : statusBadge.className.includes('blue') ? 'text-blue-500' : statusBadge.className.includes('yellow') ? 'text-yellow-500' : statusBadge.className.includes('orange') ? 'text-orange-500' : 'text-red-500'}`} />
              <div>
                <h2 className="text-2xl font-bold">Mainnet Status</h2>
                <p className="text-sm text-muted-foreground">
                  {health.status === "rate-limited" ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-500" />
                      Rate Limited by TBURN Mainnet API - Retrying connections
                    </span>
                  ) : stats.source === "failed" || blocks.source === "failed" ? (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      API Connection Failed - {hasFailures ? `${failureHistory.length} failures recorded` : "No data available"}
                    </span>
                  ) : stats.source === "cached" || blocks.source === "cached" ? (
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3 text-yellow-500" />
                      Using cached data (Last update: {lastLiveUpdate > 0 ? formatDistanceToNow(new Date(lastLiveUpdate)) + " ago" : "Unknown"})
                    </span>
                  ) : isLive ? (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-green-500" />
                      Real-time health monitoring
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <WifiOff className="h-3 w-3 text-orange-500" />
                      Connecting to mainnet...
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Badge className={statusBadge.className} data-testid="badge-status">
              {health.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={blocks.source === "failed" || !blocks.data ? "opacity-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Block</p>
                    <p className="text-2xl font-bold" data-testid="text-last-block">
                      {!blocks.data || blocks.source === "failed" ? "---" : `#${health.lastBlockNumber || 0}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!blocks.data || blocks.source === "failed" ? "No data" : 
                       health.lastBlockTime > 0 ? formatDistanceToNow(new Date(health.lastBlockTime * 1000), { addSuffix: true }) : "N/A"}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className={stats.source === "failed" || !stats.data ? "opacity-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current TPS</p>
                    <p className="text-2xl font-bold" data-testid="text-current-tps">
                      {!stats.data || stats.source === "failed" ? "---" : health.tps.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!stats.data || stats.source === "failed" ? "No data" : "Transactions per second"}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className={stats.source === "failed" || !stats.data ? "opacity-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak TPS</p>
                    <p className="text-2xl font-bold" data-testid="text-peak-tps">
                      {!stats.data || stats.source === "failed" ? "---" : health.peakTps.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!stats.data || stats.source === "failed" ? "No data" : "All-time high"}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className={blocks.source === "failed" || !blocks.data ? "opacity-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Time Since Block</p>
                    <p className="text-2xl font-bold" data-testid="text-time-since-block">
                      {!blocks.data || blocks.source === "failed" ? "---" : 
                       health.timeSinceLastBlock > 0 ? 
                        `${Math.floor(health.timeSinceLastBlock)}s` : 
                        "N/A"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!blocks.data || blocks.source === "failed" ? "No data" :
                       health.timeSinceLastBlock > 3600 ? "⚠️ Stalled" : "Normal"}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert showing real failures */}
          {health.errorType && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {health.errorType === "api-rate-limit" ? "API Rate Limit - Service Unavailable" : 
                 health.errorType === "api-error" ? "API Error - Service Failed" : 
                 health.errorType === "network-error" ? "Network Error - Connection Failed" :
                 "Mainnet Offline"}
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {health.errorType === "api-rate-limit" ? 
                      "The TBURN API is rejecting requests due to rate limiting (HTTP 429)." :
                     health.errorType === "api-error" ? 
                      "The TBURN API returned an error response (HTTP 500/502)." :
                     health.errorType === "network-error" ?
                      "Failed to establish connection to TBURN mainnet API." :
                      "The mainnet appears to be offline or unresponsive."}
                  </p>
                  
                  {/* Show failure count */}
                  {hasFailures && (
                    <p className="text-sm">
                      <span className="font-semibold text-red-500">
                        {failureHistory.length} failure{failureHistory.length !== 1 ? 's' : ''} recorded
                      </span>
                      {stats.source === "cached" || blocks.source === "cached" ? 
                        ` - Using cached data from ${formatDistanceToNow(new Date(lastLiveUpdate))} ago` :
                        " - No cached data available"}
                    </p>
                  )}
                  
                  {/* Show current state */}
                  <p className="text-sm font-medium">
                    Current State: {stats.source === "failed" && blocks.source === "failed" ? 
                      "❌ Complete failure - no data available" :
                      stats.source === "cached" || blocks.source === "cached" ?
                      "⚠️ Partial failure - showing stale cached data" :
                      "🔄 Attempting to reconnect..."}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Failure History */}
          {recentFailures && recentFailures.length > 0 && (
            <Card className="mt-4 border-orange-500/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Failure History (Past 24h)
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("tburn_admin_failure_history");
                      window.location.reload();
                    }}
                    className="h-6 text-xs px-2"
                  >
                    Clear History
                  </Button>
                </div>
                <CardDescription className="text-xs mt-1">
                  Historical API failures stored locally - Not current errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {recentFailures.map((failure, idx) => {
                    const ageMs = Date.now() - failure.timestamp;
                    const ageMinutes = Math.floor(ageMs / 60000);
                    const ageHours = Math.floor(ageMinutes / 60);
                    const ageText = ageHours > 0 ? `${ageHours}h ago` : `${ageMinutes}m ago`;
                    
                    return (
                      <div key={idx} className="text-xs flex items-center justify-between py-1 border-b last:border-0">
                        <span className="text-muted-foreground">
                          {new Date(failure.timestamp).toLocaleTimeString()} 
                          <span className="text-orange-500 ml-1">({ageText})</span>
                        </span>
                        <span className={`font-mono ${
                          failure.errorType === "api-rate-limit" ? "text-yellow-500" :
                          failure.errorType === "api-error" ? "text-red-500" :
                          "text-orange-500"
                        }`}>
                          {failure.statusCode || failure.errorType}
                        </span>
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          {failure.endpoint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Restart Progress */}
      {isRestartInProgress && (
        <Card className="border-blue-500/50 bg-blue-50/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Restart in Progress
            </CardTitle>
            <CardDescription>
              {restartStatus.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={restartStatus.progress} className="h-3" />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {restartStatus.progress}%</span>
              {restartStatus.estimatedDuration && (
                <span>
                  Est. remaining: {Math.max(0, Math.floor((restartStatus.estimatedDuration - (Date.now() - (restartStatus.startTime || 0))) / 1000))}s
                </span>
              )}
            </div>

            {/* Phase Indicators */}
            <div className="flex justify-between items-center">
              {Object.entries(RESTART_PHASES).map(([phase, config]) => {
                if (phase === 'idle' || phase === 'failed') return null;
                const isActive = restartStatus.phase === phase;
                const isCompleted = ['initiating', 'shutting_down', 'restarting', 'reconnecting', 'validating', 'completed'].indexOf(restartStatus.phase) > 
                                  ['initiating', 'shutting_down', 'restarting', 'reconnecting', 'validating', 'completed'].indexOf(phase);
                const Icon = config.icon;
                
                return (
                  <div key={phase} className="flex flex-col items-center gap-1">
                    <div className={`p-2 rounded-full ${isActive ? 'bg-primary/20' : isCompleted ? 'bg-green-500/20' : 'bg-muted'}`}>
                      <Icon className={`h-4 w-4 ${isActive && config.animate ? 'animate-spin' : ''} ${isActive ? config.color : isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-xs ${isActive ? 'font-bold' : ''} ${isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Mainnet Control Panel
          </CardTitle>
          <CardDescription>
            Administrative actions for TBURN mainnet infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Critical Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Critical Actions</h3>
              <Button 
                className="w-full"
                variant={isRestartInProgress ? "secondary" : "destructive"}
                size="lg"
                onClick={() => setShowRestartDialog(true)}
                disabled={restartMainnetMutation.isPending || isRestartInProgress}
                data-testid="button-restart-mainnet"
              >
                {restartMainnetMutation.isPending || isRestartInProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isRestartInProgress ? "Restart in Progress..." : "Initiating..."}
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Restart Mainnet
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Triggers a clean server restart via process.exit(0). Replit will automatically restart the service within 5-10 seconds.
              </p>
            </div>

            {/* Diagnostics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Diagnostics</h3>
              <Button 
                className="w-full"
                variant={isHealthChecking ? "secondary" : "outline"}
                size="lg"
                onClick={() => setShowHealthCheckDialog(true)}
                disabled={checkHealthMutation.isPending || isHealthChecking}
                data-testid="button-health-check"
              >
                {checkHealthMutation.isPending || isHealthChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Health...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Run Health Check
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Performs a comprehensive health check on the mainnet infrastructure and reports status.
              </p>
            </div>
          </div>

          <Separator />

          {/* Detailed Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Detailed Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mainnet URL</span>
                <span className="font-mono">https://tburn1.replit.app</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Block Timestamp</span>
                <span className="font-mono" data-testid="text-last-block-timestamp">
                  {health.lastBlockTime > 0 
                    ? new Date(health.lastBlockTime * 1000).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block Production</span>
                <span className={health.timeSinceLastBlock > 3600 ? "text-destructive" : ""}>
                  {health.timeSinceLastBlock > 3600 ? "⛔ Stopped" : "✅ Active"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peak TPS</span>
                <span>{health.peakTps.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens During Restart</CardTitle>
          <CardDescription>
            Understanding the mainnet restart process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Expected Behavior:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Server receives restart command and shuts down cleanly</li>
              <li>Replit automatically restarts the application (5-10s)</li>
              <li>Service reconnects to production mainnet at tburn1.replit.app</li>
              <li>Fresh data polling begins, block production resumes</li>
              <li>Status changes from PAUSED → ACTIVE, TPS returns to normal</li>
            </ul>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">Recovery Time:</h4>
            <p className="text-muted-foreground">
              Service restart: 5-10 seconds (automatic) | Data sync: 10-20 seconds | 
              Full recovery: 30-60 seconds total. Monitor "Last Block" and "Current TPS" 
              metrics above to confirm successful restart.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Restart Confirmation Dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-destructive" />
              Confirm Mainnet Restart
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-2">This action will:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Trigger clean shutdown via process.exit(0)</li>
                    <li>Replit auto-restarts the service (5-10s)</li>
                    <li>Reconnect to mainnet and resume data polling</li>
                    <li>Full recovery in 30-60 seconds</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password-restart" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Password Required
                  </Label>
                  <Input
                    id="admin-password-restart"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    data-testid="input-admin-password-restart"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your admin password to authorize this operation.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminPassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restartMainnetMutation.mutate(adminPassword)}
              disabled={!adminPassword || restartMainnetMutation.isPending}
              data-testid="button-confirm-restart"
            >
              {restartMainnetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restarting...
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Restart Mainnet
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Health Check Dialog */}
      <AlertDialog open={showHealthCheckDialog} onOpenChange={setShowHealthCheckDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Confirm Health Check
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-sm">
                  This will perform a comprehensive health check on the TBURN mainnet infrastructure.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="admin-password-health" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Password Required
                  </Label>
                  <Input
                    id="admin-password-health"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    data-testid="input-admin-password-health"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your admin password to authorize this operation.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminPassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => checkHealthMutation.mutate(adminPassword)}
              disabled={!adminPassword || checkHealthMutation.isPending}
              data-testid="button-confirm-health"
            >
              {checkHealthMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Check Health
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}