import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Heart,
  MemoryStick,
  Network,
  RefreshCw,
  Server,
  Shield,
  XCircle,
  Zap,
} from "lucide-react";

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  uptime: number;
  lastCheck: Date;
  details?: string;
}

export default function AdminHealth() {
  const { t } = useTranslation();

  const { data: networkStats, refetch, isLoading } = useQuery<{
    tps: number;
    blockHeight: number;
    avgBlockTime: number;
    totalValidators: number;
    activeValidators: number;
  }>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 10000,
  });

  const services: ServiceHealth[] = useMemo(() => [
    { name: "Consensus Engine", status: "healthy", latency: 12, uptime: 99.99, lastCheck: new Date(), details: "AI-Enhanced Committee BFT operational" },
    { name: "Block Producer", status: "healthy", latency: 8, uptime: 99.98, lastCheck: new Date(), details: "Producing blocks at optimal rate" },
    { name: "Transaction Pool", status: "healthy", latency: 5, uptime: 99.99, lastCheck: new Date(), details: "28,456 transactions in mempool" },
    { name: "Validator Network", status: "healthy", latency: 145, uptime: 99.95, lastCheck: new Date(), details: "142/156 validators online" },
    { name: "Shard Manager", status: "healthy", latency: 18, uptime: 99.97, lastCheck: new Date(), details: "8 shards operational" },
    { name: "Cross-Shard Router", status: "healthy", latency: 35, uptime: 99.92, lastCheck: new Date(), details: "Hybrid routing protocol active" },
    { name: "Bridge Relayer", status: "degraded", latency: 285, uptime: 98.5, lastCheck: new Date(), details: "High latency on Arbitrum bridge" },
    { name: "AI Orchestrator", status: "healthy", latency: 156, uptime: 99.88, lastCheck: new Date(), details: "Triple-Band AI system operational" },
    { name: "Database Cluster", status: "healthy", latency: 3, uptime: 99.99, lastCheck: new Date(), details: "Primary + 2 replicas healthy" },
    { name: "Cache Layer", status: "healthy", latency: 1, uptime: 99.99, lastCheck: new Date(), details: "Redis cluster operational" },
    { name: "API Gateway", status: "healthy", latency: 15, uptime: 99.97, lastCheck: new Date(), details: "Rate limiting active" },
    { name: "WebSocket Server", status: "healthy", latency: 8, uptime: 99.95, lastCheck: new Date(), details: "4,256 active connections" },
  ], []);

  const healthMetrics = useMemo(() => ({
    overallHealth: 98.5,
    networkHealth: 99.2,
    consensusHealth: 99.8,
    storageHealth: 97.5,
    aiHealth: 99.1,
  }), []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500/10 text-green-500">Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Degraded</Badge>;
      case "unhealthy":
        return <Badge className="bg-red-500/10 text-red-500">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const overallStatus = useMemo(() => {
    const unhealthy = services.filter(s => s.status === "unhealthy").length;
    const degraded = services.filter(s => s.status === "degraded").length;
    if (unhealthy > 0) return "unhealthy";
    if (degraded > 0) return "degraded";
    return "healthy";
  }, [services]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Heart className="h-8 w-8" />
              System Health
            </h1>
            <p className="text-muted-foreground">Monitor system health and service status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall Status:</span>
              {getStatusBadge(overallStatus)}
            </div>
            <Button onClick={() => refetch()} disabled={isLoading} data-testid="button-refresh-health">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Overall Health", value: healthMetrics.overallHealth, icon: Heart, color: "text-red-500" },
            { label: "Network Health", value: healthMetrics.networkHealth, icon: Globe, color: "text-blue-500" },
            { label: "Consensus Health", value: healthMetrics.consensusHealth, icon: Shield, color: "text-green-500" },
            { label: "Storage Health", value: healthMetrics.storageHealth, icon: Database, color: "text-purple-500" },
            { label: "AI Health", value: healthMetrics.aiHealth, icon: Zap, color: "text-orange-500" },
          ].map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-xl font-bold">{metric.value}%</p>
                  </div>
                </div>
                <Progress value={metric.value} className="h-1 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="p-4 rounded-lg border hover-elevate cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="font-medium text-sm">{service.name}</span>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Latency</span>
                      <span className="font-mono">{service.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime</span>
                      <span className="font-mono">{service.uptime}%</span>
                    </div>
                    {service.details && (
                      <p className="mt-2 pt-2 border-t text-muted-foreground">{service.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Infrastructure Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Primary Node</p>
                      <p className="text-xs text-muted-foreground">node-01.tburn.io</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Backup Node</p>
                      <p className="text-xs text-muted-foreground">node-02.tburn.io</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Standby</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Database Cluster</p>
                      <p className="text-xs text-muted-foreground">PostgreSQL (Neon)</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Network className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">Load Balancer</p>
                      <p className="text-xs text-muted-foreground">lb.tburn.io</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Health Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "2 min ago", event: "Health check completed", status: "success" },
                  { time: "15 min ago", event: "Bridge Relayer latency spike detected", status: "warning" },
                  { time: "1 hour ago", event: "Automatic cache refresh completed", status: "success" },
                  { time: "2 hours ago", event: "Database connection pool optimized", status: "success" },
                  { time: "4 hours ago", event: "AI model retraining completed", status: "success" },
                  { time: "6 hours ago", event: "Scheduled maintenance completed", status: "success" },
                ].map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
                    <div className={`w-2 h-2 rounded-full ${
                      event.status === "success" ? "bg-green-500" :
                      event.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{event.event}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
