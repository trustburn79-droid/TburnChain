import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Zap
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface MainnetHealth {
  isHealthy: boolean;
  lastBlockTime: number;
  lastBlockNumber: number;
  timeSinceLastBlock: number;
  status: "active" | "paused" | "degraded";
  tps: number;
}

export default function AdminPage() {
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
  });

  const { data: recentBlocks } = useQuery<any[]>({
    queryKey: ["/api/blocks/recent"],
    refetchInterval: 5000,
  });

  const restartMainnetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/restart-mainnet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to restart mainnet");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mainnet Restart Initiated",
        description: "TBURN mainnet restart request sent successfully. Please wait for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Restart Failed",
        description: error.message || "Failed to restart mainnet. Please check logs.",
        variant: "destructive",
      });
    },
  });

  const checkHealthMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/check-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to check health");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Health Check Complete",
        description: "Mainnet health check completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
    },
  });

  // Calculate mainnet health
  const calculateHealth = (): MainnetHealth => {
    if (!stats || !recentBlocks) {
      return {
        isHealthy: false,
        lastBlockTime: 0,
        lastBlockNumber: 0,
        timeSinceLastBlock: 0,
        status: "degraded",
        tps: 0,
      };
    }

    const lastBlock = recentBlocks[0];
    const lastBlockTime = lastBlock?.timestamp || 0;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastBlock = currentTime - lastBlockTime;

    const isHealthy = timeSinceLastBlock < 60; // Less than 1 minute
    const status = timeSinceLastBlock < 60 
      ? "active" 
      : timeSinceLastBlock < 3600 
        ? "degraded" 
        : "paused";

    return {
      isHealthy,
      lastBlockTime,
      lastBlockNumber: (stats as any).currentBlockHeight || 0,
      timeSinceLastBlock,
      status,
      tps: (stats as any).tps || 0,
    };
  };

  const health = calculateHealth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "paused":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "paused":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-admin">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mainnet Administration</h1>
          <p className="text-muted-foreground mt-1">
            Control and monitor TBURN mainnet infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={health.status === "active" ? "default" : "destructive"} data-testid="badge-mainnet-status">
            {health.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Critical Alert */}
      {health.status === "paused" && (
        <Alert variant="destructive" data-testid="alert-mainnet-paused">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Mainnet Paused</AlertTitle>
          <AlertDescription>
            The mainnet has been paused for {formatTimeSince(health.timeSinceLastBlock)}. 
            Last block: #{health.lastBlockNumber.toLocaleString()} at{" "}
            {new Date(health.lastBlockTime * 1000).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-status">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {getStatusIcon(health.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{health.status}</div>
            <p className="text-xs text-muted-foreground">
              {health.isHealthy ? "All systems operational" : "Action required"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-last-block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Block</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{health.lastBlockNumber.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {formatTimeSince(health.timeSinceLastBlock)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-current-tps">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current TPS</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.tps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Transactions per second
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-uptime">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Since Block</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTimeSince(health.timeSinceLastBlock)}</div>
            <p className="text-xs text-muted-foreground">
              {health.timeSinceLastBlock > 3600 ? "Critical" : "Normal"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card data-testid="card-control-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Mainnet Control Panel
          </CardTitle>
          <CardDescription>
            Administrative actions for TBURN mainnet infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Critical Actions</h3>
              <Separator />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => restartMainnetMutation.mutate()}
                disabled={restartMainnetMutation.isPending}
                data-testid="button-restart-mainnet"
              >
                {restartMainnetMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Power className="h-4 w-4 mr-2" />
                )}
                Restart Mainnet
              </Button>
              <p className="text-xs text-muted-foreground">
                Sends a restart request to tburn1.replit.app. This will resume block production and transaction processing.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Diagnostics</h3>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => checkHealthMutation.mutate()}
                disabled={checkHealthMutation.isPending}
                data-testid="button-check-health"
              >
                {checkHealthMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4 mr-2" />
                )}
                Check Health
              </Button>
              <p className="text-xs text-muted-foreground">
                Performs a comprehensive health check on the mainnet infrastructure and reports status.
              </p>
            </div>
          </div>

          {/* Detailed Status */}
          <div className="space-y-3 pt-4">
            <h3 className="font-semibold text-sm">Detailed Status</h3>
            <Separator />
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mainnet URL</span>
                <span className="font-mono">https://tburn1.replit.app</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Block Timestamp</span>
                <span className="font-mono">
                  {health.lastBlockTime > 0 
                    ? new Date(health.lastBlockTime * 1000).toISOString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Block Production</span>
                <Badge variant={health.isHealthy ? "default" : "destructive"}>
                  {health.isHealthy ? "Active" : "Stopped"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Peak TPS (All-Time)</span>
                <span className="font-mono">{(stats as any)?.peakTps?.toLocaleString() || "N/A"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card data-testid="card-instructions">
        <CardHeader>
          <CardTitle>Restart Instructions</CardTitle>
          <CardDescription>
            What happens when you restart the mainnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Expected Behavior:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Restart request is sent to tburn1.replit.app</li>
              <li>Mainnet service will restart block production</li>
              <li>Validators will resume consensus</li>
              <li>New blocks will start being generated</li>
              <li>TPS will return to normal levels</li>
            </ul>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">Recovery Time:</h4>
            <p className="text-muted-foreground">
              Typically 30-60 seconds for full mainnet restart and consensus re-establishment.
              Monitor the "Last Block" metric above to confirm block production has resumed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
