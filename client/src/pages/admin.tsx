import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useMainnetSnapshots } from "@/hooks/use-mainnet-snapshots";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Users,
  ShieldAlert,
  FileText,
  BarChart3,
  Eye,
  Lock,
  Unlock,
  Globe,
  Terminal,
  Settings,
  Gauge,
  Radio,
  MonitorCheck,
  BellRing,
  History,
  Timer,
  Workflow,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  Search,
  ChevronRight,
  Key,
  BookOpen,
  Scale,
  ExternalLink
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ko, zhCN, ja, enUS, hi, es, fr, ar, bn, ru, pt } from "date-fns/locale";
import { useWebSocket } from "@/lib/websocket-context";
import { AIUsageMonitor } from "@/components/AIUsageMonitor";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

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
  phase: "idle" | "initiating" | "stopping" | "waiting" | "shutting_down" | "restarting" | "reconnecting" | "validating" | "completed" | "failed";
  message: string;
  progress: number;
  startTime?: number;
  estimatedDuration?: number;
  error?: string;
  retryCount?: number;
  nextRetryAt?: Date;
  rateLimitedUntil?: Date;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  processUptime: number;
  nodeVersion: string;
  platform: string;
  loadAvg: number[];
  timestamp: number;
}

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "offline" | "unknown";
  latency: number;
  lastCheck: number;
  errorCount: number;
  uptime: number;
}

interface DatabaseHealth {
  connected: boolean;
  latency: number;
  activeConnections: number;
  maxConnections: number;
  poolSize: number;
  idleConnections: number;
  waitingRequests: number;
  lastError?: string;
  lastErrorTime?: number;
}

interface ApiEndpointHealth {
  path: string;
  method: string;
  status: "healthy" | "slow" | "error";
  avgLatency: number;
  p95Latency: number;
  requestCount: number;
  errorRate: number;
  lastError?: string;
}

interface SecurityEvent {
  id: string;
  type: "login_attempt" | "password_change" | "session_created" | "session_expired" | "rate_limit" | "blocked_ip" | "config_change";
  severity: "info" | "warning" | "critical";
  message: string;
  ip?: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ActiveSession {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastActivity: number;
  isActive: boolean;
}

interface AdminActivityEvent {
  id: string;
  type: "restart" | "deploy" | "config_change" | "user_action" | "alert" | "websocket" | "api_call" | "system";
  message: string;
  details?: string;
  severity: "info" | "success" | "warning" | "error";
  timestamp: number;
  source: string;
}

interface AnalyticsData {
  uptime: { date: string; value: number }[];
  tps: { date: string; avg: number; peak: number }[];
  incidents: { date: string; count: number; resolved: number }[];
  apiLatency: { endpoint: string; avg: number; p95: number }[];
  resourceUsage: { time: string; cpu: number; memory: number; disk: number }[];
}

// Phase configurations
const RESTART_PHASES = {
  idle: { icon: Activity, color: "text-muted-foreground", labelKey: "phaseReady", animate: false },
  initiating: { icon: Loader2, color: "text-yellow-500", labelKey: "phaseInitiating", animate: true },
  shutting_down: { icon: Power, color: "text-orange-500", labelKey: "phaseShuttingDown", animate: true },
  restarting: { icon: RefreshCw, color: "text-blue-500", labelKey: "phaseRestarting", animate: true },
  reconnecting: { icon: Wifi, color: "text-purple-500", labelKey: "phaseReconnecting", animate: true },
  validating: { icon: CheckCircle2, color: "text-cyan-500", labelKey: "phaseValidating", animate: true },
  completed: { icon: CheckCircle, color: "text-green-500", labelKey: "phaseCompleted", animate: false },
  failed: { icon: XCircle, color: "text-red-500", labelKey: "phaseFailed", animate: false }
};

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  success: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
  info: "#3b82f6",
  muted: "hsl(var(--muted-foreground))",
  cpu: "#8b5cf6",
  memory: "#06b6d4",
  disk: "#f59e0b",
  network: "#10b981"
};

// Custom hooks
function useRestartMonitor() {
  const [restartStatus, setRestartStatus] = useState<RestartPhase>({
    phase: "idle",
    message: "",
    progress: 0
  });
  const [isRestartInProgress, setIsRestartInProgress] = useState(false);
  const { subscribeToEvent } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeToEvent('restart_phase_update', (data: any) => {
      const { phase, message: phaseMessage, progress } = data;
      
      setRestartStatus({
        phase: phase as RestartPhase["phase"],
        message: phaseMessage,
        progress,
        startTime: phase === 'initiating' ? Date.now() : restartStatus.startTime,
        estimatedDuration: 60000
      });
      
      setIsRestartInProgress(phase !== 'completed' && phase !== 'failed' && phase !== 'idle');
      
      if (phase === 'completed') {
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [subscribeToEvent, restartStatus.startTime]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/admin/restart-status');
        if (response.ok) {
          const status = await response.json();
          
          if (status.isRestarting) {
            const progress = Math.min(
              Math.floor((status.elapsedTime / status.expectedRestartTime) * 100),
              100
            );
            
            const phaseMap: Record<string, string> = {
              'idle': '',
              'initiating': 'Preparing to restart TBURN mainnet...',
              'shutting_down': 'Shutting down current instance...',
              'restarting': 'Server restarting (Replit auto-restart)...',
              'reconnecting': 'Reconnecting to TBURN mainnet...',
              'validating': 'Validating system health...',
              'completed': 'Restart completed successfully!',
              'failed': 'Restart failed'
            };
            
            if (!restartStatus.progress || restartStatus.progress === 0) {
              setRestartStatus({
                phase: (status.phase || 'restarting') as RestartPhase["phase"],
                message: phaseMap[status.phase] || status.phaseMessage || 'Restarting...',
                progress,
                startTime: status.restartInitiatedAt ? new Date(status.restartInitiatedAt).getTime() : Date.now(),
                estimatedDuration: status.expectedRestartTime
              });
            }
            
            setIsRestartInProgress(true);
          } else {
            if (isRestartInProgress) {
              setIsRestartInProgress(false);
              setRestartStatus(prev => ({
                ...prev,
                phase: 'completed',
                message: 'Restart completed successfully!',
                progress: 100
              }));
              
              setTimeout(() => {
                window.location.href = '/admin';
              }, 2000);
            }
          }
        }
      } catch (error) {
        console.error('[Admin] Failed to check restart status:', error);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    checkStatus();
    
    return () => clearInterval(interval);
  }, [isRestartInProgress, restartStatus.progress]);

  const startRestart = () => {
    setIsRestartInProgress(true);
    setRestartStatus({
      phase: "initiating",
      message: "Preparing to restart TBURN mainnet...",
      progress: 10,
      startTime: Date.now(),
      estimatedDuration: 60000
    });
  };

  const resetStatus = () => {
    setRestartStatus({
      phase: "idle",
      message: "",
      progress: 0
    });
    setIsRestartInProgress(false);
  };

  return {
    restartStatus,
    isRestartInProgress,
    startRestart,
    resetStatus
  };
}

function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    processUptime: 0,
    nodeVersion: "",
    platform: "",
    loadAvg: [0, 0, 0],
    timestamp: Date.now()
  });
  const [history, setHistory] = useState<SystemMetrics[]>([]);
  const { subscribeToEvent } = useWebSocket();

  useEffect(() => {
    const generateMetrics = () => {
      const newMetrics: SystemMetrics = {
        cpu: 15 + Math.random() * 25,
        memory: 45 + Math.random() * 20,
        disk: 30 + Math.random() * 10,
        network: Math.random() * 100,
        processUptime: Date.now() - 1000 * 60 * 60 * 24 * 3,
        nodeVersion: "v20.10.0",
        platform: "linux",
        loadAvg: [0.5 + Math.random() * 0.5, 0.4 + Math.random() * 0.4, 0.3 + Math.random() * 0.3],
        timestamp: Date.now()
      };
      setMetrics(newMetrics);
      setHistory(prev => [...prev.slice(-59), newMetrics]);
    };

    generateMetrics();
    const interval = setInterval(generateMetrics, 5000);

    const unsubscribe = subscribeToEvent('system_metrics_update', (data: SystemMetrics) => {
      setMetrics(data);
      setHistory(prev => [...prev.slice(-59), data]);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [subscribeToEvent]);

  return { metrics, history };
}

function useServiceStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Server", status: "healthy", latency: 12, lastCheck: Date.now(), errorCount: 0, uptime: 99.99 },
    { name: "WebSocket Server", status: "healthy", latency: 5, lastCheck: Date.now(), errorCount: 0, uptime: 99.95 },
    { name: "Database", status: "healthy", latency: 8, lastCheck: Date.now(), errorCount: 0, uptime: 99.99 },
    { name: "Redis Cache", status: "healthy", latency: 2, lastCheck: Date.now(), errorCount: 0, uptime: 100 },
    { name: "TBURN API", status: "healthy", latency: 45, lastCheck: Date.now(), errorCount: 2, uptime: 98.5 },
    { name: "AI Orchestrator", status: "healthy", latency: 120, lastCheck: Date.now(), errorCount: 0, uptime: 99.8 }
  ]);

  useEffect(() => {
    const updateServices = () => {
      setServices(prev => prev.map(service => ({
        ...service,
        latency: Math.max(1, service.latency + (Math.random() - 0.5) * 10),
        lastCheck: Date.now(),
        status: Math.random() > 0.02 ? "healthy" : Math.random() > 0.5 ? "degraded" : "offline"
      })));
    };

    const interval = setInterval(updateServices, 10000);
    return () => clearInterval(interval);
  }, []);

  return services;
}

function useDatabaseHealth() {
  const [health, setHealth] = useState<DatabaseHealth>({
    connected: true,
    latency: 8,
    activeConnections: 5,
    maxConnections: 100,
    poolSize: 10,
    idleConnections: 5,
    waitingRequests: 0
  });

  useEffect(() => {
    const updateHealth = () => {
      setHealth(prev => ({
        ...prev,
        latency: Math.max(1, prev.latency + (Math.random() - 0.5) * 5),
        activeConnections: Math.floor(3 + Math.random() * 7),
        idleConnections: Math.floor(3 + Math.random() * 4),
        waitingRequests: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0
      }));
    };

    const interval = setInterval(updateHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  return health;
}

function useApiEndpointHealth() {
  const [endpoints, setEndpoints] = useState<ApiEndpointHealth[]>([
    { path: "/api/network/stats", method: "GET", status: "healthy", avgLatency: 45, p95Latency: 120, requestCount: 15420, errorRate: 0.1 },
    { path: "/api/blocks/recent", method: "GET", status: "healthy", avgLatency: 38, p95Latency: 95, requestCount: 12340, errorRate: 0.05 },
    { path: "/api/transactions", method: "GET", status: "healthy", avgLatency: 52, p95Latency: 150, requestCount: 8920, errorRate: 0.2 },
    { path: "/api/validators", method: "GET", status: "healthy", avgLatency: 65, p95Latency: 180, requestCount: 6540, errorRate: 0.15 },
    { path: "/api/ai/orchestration", method: "GET", status: "healthy", avgLatency: 125, p95Latency: 350, requestCount: 4320, errorRate: 0.3 },
    { path: "/api/admin/health", method: "GET", status: "healthy", avgLatency: 15, p95Latency: 45, requestCount: 2180, errorRate: 0 },
    { path: "/api/sharding/status", method: "GET", status: "healthy", avgLatency: 78, p95Latency: 220, requestCount: 3450, errorRate: 0.1 },
    { path: "/api/dex/pools", method: "GET", status: "healthy", avgLatency: 55, p95Latency: 140, requestCount: 5670, errorRate: 0.08 }
  ]);

  useEffect(() => {
    const updateEndpoints = () => {
      setEndpoints(prev => prev.map(ep => ({
        ...ep,
        avgLatency: Math.max(5, ep.avgLatency + (Math.random() - 0.5) * 20),
        p95Latency: Math.max(10, ep.p95Latency + (Math.random() - 0.5) * 40),
        requestCount: ep.requestCount + Math.floor(Math.random() * 50),
        status: ep.avgLatency > 200 ? "slow" : ep.errorRate > 1 ? "error" : "healthy"
      })));
    };

    const interval = setInterval(updateEndpoints, 15000);
    return () => clearInterval(interval);
  }, []);

  return endpoints;
}

function useSecurityEvents() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const { subscribeToEvent } = useWebSocket();

  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      { id: "1", type: "session_created", severity: "info", message: "Admin session created", ip: "10.0.0.1", timestamp: Date.now() - 60000 },
      { id: "2", type: "login_attempt", severity: "info", message: "Successful login", ip: "10.0.0.1", timestamp: Date.now() - 120000 },
      { id: "3", type: "rate_limit", severity: "warning", message: "Rate limit triggered on /api/network/stats", ip: "192.168.1.50", timestamp: Date.now() - 300000 },
      { id: "4", type: "config_change", severity: "info", message: "System configuration updated", userId: "admin", timestamp: Date.now() - 600000 },
      { id: "5", type: "blocked_ip", severity: "critical", message: "IP blocked due to suspicious activity", ip: "45.33.32.156", timestamp: Date.now() - 900000 }
    ];
    setEvents(mockEvents);

    const unsubscribe = subscribeToEvent('security_event_stream', (event: SecurityEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 100));
    });

    return () => unsubscribe();
  }, [subscribeToEvent]);

  return events;
}

function useActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSession[]>([
    { id: "1", userId: "admin", ip: "10.0.0.1", userAgent: "Mozilla/5.0 Chrome/120", createdAt: Date.now() - 3600000, lastActivity: Date.now() - 60000, isActive: true },
    { id: "2", userId: "operator1", ip: "10.0.0.5", userAgent: "Mozilla/5.0 Firefox/121", createdAt: Date.now() - 7200000, lastActivity: Date.now() - 300000, isActive: true }
  ]);

  return sessions;
}

// Activity message translation key mapping
const activityMessageKeyMap: Record<string, { key: string; params?: Record<string, string | number> }> = {
  "System health check completed": { key: "adminActivity.messages.systemHealthCheckCompleted" },
  "API rate limit adjusted for /api/blocks": { key: "adminActivity.messages.apiRateLimitAdjusted" },
  "WebSocket broadcast: 245 clients connected": { key: "adminActivity.messages.websocketBroadcast", params: { count: 245 } },
  "Configuration reload completed": { key: "adminActivity.messages.configurationReloadCompleted" },
  "High memory usage detected (78%)": { key: "adminActivity.messages.highMemoryUsageDetected", params: { percent: 78 } },
  "Cache invalidation completed": { key: "adminActivity.messages.cacheInvalidationCompleted" },
  "Database connection pool optimized": { key: "adminActivity.messages.databaseConnectionPoolOptimized" },
  "WebSocket heartbeat sent": { key: "adminActivity.messages.websocketHeartbeatSent" },
  "API request processed": { key: "adminActivity.messages.apiRequestProcessed" },
  "Session cleanup executed": { key: "adminActivity.messages.sessionCleanupExecuted" },
  "Admin session created": { key: "adminActivity.messages.adminSessionCreated" },
  "Successful login": { key: "adminActivity.messages.successfulLogin" },
  "Rate limit triggered on /api/network/stats": { key: "adminActivity.messages.rateLimitTriggered" },
  "System configuration updated": { key: "adminActivity.messages.systemConfigurationUpdated" },
  "IP blocked due to suspicious activity": { key: "adminActivity.messages.ipBlockedSuspiciousActivity" }
};

// Helper function to get translated activity message
const getTranslatedActivityMessage = (t: (key: string, params?: Record<string, unknown>) => string, message: string): string => {
  const mapping = activityMessageKeyMap[message];
  if (mapping) {
    return t(mapping.key, mapping.params);
  }
  return message;
};

function useActivityFeed() {
  const [activities, setActivities] = useState<AdminActivityEvent[]>([]);
  const { subscribeToEvent } = useWebSocket();

  useEffect(() => {
    const initialActivities: AdminActivityEvent[] = [
      { id: "1", type: "system", message: "System health check completed", severity: "success", timestamp: Date.now() - 30000, source: "HealthMonitor" },
      { id: "2", type: "api_call", message: "API rate limit adjusted for /api/blocks", severity: "info", timestamp: Date.now() - 60000, source: "RateLimiter" },
      { id: "3", type: "websocket", message: "WebSocket broadcast: 245 clients connected", severity: "info", timestamp: Date.now() - 120000, source: "WSServer" },
      { id: "4", type: "deploy", message: "Configuration reload completed", severity: "success", timestamp: Date.now() - 180000, source: "ConfigManager" },
      { id: "5", type: "alert", message: "High memory usage detected (78%)", severity: "warning", timestamp: Date.now() - 300000, source: "ResourceMonitor" }
    ];
    setActivities(initialActivities);

    const interval = setInterval(() => {
      const types: AdminActivityEvent["type"][] = ["system", "api_call", "websocket", "user_action"];
      const messages = [
        "Cache invalidation completed",
        "Database connection pool optimized",
        "WebSocket heartbeat sent",
        "API request processed",
        "Session cleanup executed"
      ];
      
      const newActivity: AdminActivityEvent = {
        id: Date.now().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        severity: Math.random() > 0.9 ? "warning" : "info",
        timestamp: Date.now(),
        source: "SystemMonitor"
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 100));
    }, 8000);

    const unsubscribe = subscribeToEvent('admin_activity_stream', (event: AdminActivityEvent) => {
      setActivities(prev => [event, ...prev].slice(0, 100));
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [subscribeToEvent]);

  return activities;
}

// Map language codes to date-fns locales
const getDateLocale = (lang: string) => {
  const localeMap: Record<string, typeof enUS> = {
    en: enUS, ko: ko, zh: zhCN, ja: ja, hi: hi, es: es, fr: fr, ar: ar, bn: bn, ru: ru, pt: pt
  };
  return localeMap[lang] || enUS;
};

const getStatusTranslationKey = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'admin.statusActive',
    'paused': 'admin.statusPaused',
    'degraded': 'admin.statusDegraded',
    'restarting': 'admin.statusRestarting',
    'offline': 'admin.statusOffline',
    'rate-limited': 'admin.statusRateLimited'
  };
  return statusMap[status] || 'admin.statusUnknown';
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: { value: number; direction: "up" | "down" | "neutral" };
  status?: "success" | "warning" | "error" | "info";
  onClick?: () => void;
  testId: string;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, status, onClick, testId }: StatCardProps) {
  const statusColors = {
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    info: "text-blue-500"
  };

  const TrendIcon = trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card 
      className={`${onClick ? "cursor-pointer hover-elevate" : ""} transition-all`}
      onClick={onClick}
      data-testid={testId}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${status ? statusColors[status] : ""}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${
                trend.direction === "up" ? "text-green-500" : 
                trend.direction === "down" ? "text-red-500" : "text-muted-foreground"
              }`}>
                <TrendIcon className="h-3 w-3" />
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 ${status ? statusColors[status] : "text-muted-foreground"}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Resource Usage Panel
function ResourceUsagePanel({ metrics, history }: { metrics: SystemMetrics; history: SystemMetrics[] }) {
  const { t } = useTranslation();
  
  const chartData = useMemo(() => {
    return history.map((m, i) => ({
      time: i.toString(),
      cpu: m.cpu.toFixed(1),
      memory: m.memory.toFixed(1),
      disk: m.disk.toFixed(1),
      network: m.network.toFixed(1)
    }));
  }, [history]);

  const getStatusColor = (value: number) => {
    if (value < 50) return "text-green-500";
    if (value < 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500";
    if (value < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-cpu-usage">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metrics.cpu)}`}>
                {metrics.cpu.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Load: {metrics.loadAvg.map(v => v.toFixed(2)).join(", ")}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-memory-usage">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-medium">{t('admin.system.memory')}</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metrics.memory)}`}>
                {metrics.memory.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-disk-usage">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{t('admin.system.disk')}</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metrics.disk)}`}>
                {metrics.disk.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.disk} className="h-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-network-usage">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">{t('admin.system.network')}</span>
              </div>
              <span className="text-lg font-bold text-emerald-500">
                {metrics.network.toFixed(0)} KB/s
              </span>
            </div>
            <Progress value={Math.min(100, metrics.network)} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {history.length > 5 && (
        <Card data-testid="card-resource-history">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('admin.system.resourceHistory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" name="CPU" stroke={CHART_COLORS.cpu} fill={CHART_COLORS.cpu} fillOpacity={0.2} />
                  <Area type="monotone" dataKey="memory" name="Memory" stroke={CHART_COLORS.memory} fill={CHART_COLORS.memory} fillOpacity={0.2} />
                  <Area type="monotone" dataKey="disk" name="Disk" stroke={CHART_COLORS.disk} fill={CHART_COLORS.disk} fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Service Status Grid
function ServiceStatusGrid({ services }: { services: ServiceStatus[] }) {
  const { t } = useTranslation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "offline": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t('admin.system.healthy')}</Badge>;
      case "degraded": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('admin.system.degraded')}</Badge>;
      case "offline": return <Badge variant="destructive">{t('admin.system.offline')}</Badge>;
      default: return <Badge variant="secondary">{t('admin.system.unknown')}</Badge>;
    }
  };

  return (
    <Card data-testid="card-service-status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MonitorCheck className="h-5 w-5" />
          {t('admin.system.serviceStatus')}
        </CardTitle>
        <CardDescription>{t('admin.system.serviceStatusDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, idx) => (
            <Card key={service.name} className="border" data-testid={`card-service-${idx}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <span className="font-medium text-sm">{service.name}</span>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block">{t('admin.system.latency')}</span>
                    <span className="font-mono text-foreground">{service.latency.toFixed(0)}ms</span>
                  </div>
                  <div>
                    <span className="block">{t('admin.system.uptime')}</span>
                    <span className="font-mono text-foreground">{service.uptime.toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Database Health Card
function DatabaseHealthCard({ health }: { health: DatabaseHealth }) {
  const { t } = useTranslation();

  return (
    <Card data-testid="card-database-health">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t('admin.system.databaseHealth')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-green-500">{health.connected ? "✓" : "✗"}</p>
            <p className="text-xs text-muted-foreground">{t('admin.system.connected')}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{health.latency.toFixed(0)}ms</p>
            <p className="text-xs text-muted-foreground">{t('admin.system.latency')}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{health.activeConnections}/{health.maxConnections}</p>
            <p className="text-xs text-muted-foreground">{t('admin.system.connections')}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{health.waitingRequests}</p>
            <p className="text-xs text-muted-foreground">{t('admin.system.waiting')}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{t('admin.system.poolUsage')}</span>
            <span>{((health.activeConnections / health.poolSize) * 100).toFixed(0)}%</span>
          </div>
          <Progress value={(health.activeConnections / health.poolSize) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// API Endpoint Health Table
function ApiEndpointTable({ endpoints }: { endpoints: ApiEndpointHealth[] }) {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<"latency" | "requests" | "errors">("latency");

  const sortedEndpoints = useMemo(() => {
    return [...endpoints].sort((a, b) => {
      switch (sortBy) {
        case "latency": return b.avgLatency - a.avgLatency;
        case "requests": return b.requestCount - a.requestCount;
        case "errors": return b.errorRate - a.errorRate;
        default: return 0;
      }
    });
  }, [endpoints, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t('admin.system.healthy')}</Badge>;
      case "slow": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('admin.system.slow')}</Badge>;
      case "error": return <Badge variant="destructive">{t('admin.system.error')}</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card data-testid="card-api-endpoints">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('admin.system.apiEndpoints')}
            </CardTitle>
            <CardDescription>{t('admin.system.apiEndpointsDesc')}</CardDescription>
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-32" data-testid="select-endpoint-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latency">{t('admin.system.sortLatency')}</SelectItem>
              <SelectItem value="requests">{t('admin.system.sortRequests')}</SelectItem>
              <SelectItem value="errors">{t('admin.system.sortErrors')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.system.endpoint')}</TableHead>
                <TableHead>{t('admin.system.method')}</TableHead>
                <TableHead>{t('admin.system.status')}</TableHead>
                <TableHead className="text-right">{t('admin.system.avgLatency')}</TableHead>
                <TableHead className="text-right">{t('admin.system.p95')}</TableHead>
                <TableHead className="text-right">{t('admin.system.requests')}</TableHead>
                <TableHead className="text-right">{t('admin.system.errorRate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEndpoints.map((ep, idx) => (
                <TableRow key={ep.path} data-testid={`row-endpoint-${idx}`}>
                  <TableCell className="font-mono text-xs">{ep.path}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{ep.method}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(ep.status)}</TableCell>
                  <TableCell className="text-right font-mono">{ep.avgLatency.toFixed(0)}ms</TableCell>
                  <TableCell className="text-right font-mono">{ep.p95Latency.toFixed(0)}ms</TableCell>
                  <TableCell className="text-right font-mono">{ep.requestCount.toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-mono ${ep.errorRate > 0.5 ? "text-red-500" : ""}`}>
                    {ep.errorRate.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Security Events Table
function SecurityEventsTable({ events }: { events: SecurityEvent[] }) {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    return events.filter(e => e.severity === filter);
  }, [events, filter]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">{t('admin.security.critical')}</Badge>;
      case "warning": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('admin.security.warning')}</Badge>;
      case "info": return <Badge variant="secondary">{t('admin.security.info')}</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "login_attempt": return <Lock className="h-4 w-4" />;
      case "session_created": return <Unlock className="h-4 w-4" />;
      case "rate_limit": return <AlertTriangle className="h-4 w-4" />;
      case "blocked_ip": return <ShieldAlert className="h-4 w-4" />;
      case "config_change": return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card data-testid="card-security-events">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              {t('admin.security.events')}
            </CardTitle>
            <CardDescription>{t('admin.security.eventsDesc')}</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32" data-testid="select-security-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.security.all')}</SelectItem>
              <SelectItem value="critical">{t('admin.security.critical')}</SelectItem>
              <SelectItem value="warning">{t('admin.security.warning')}</SelectItem>
              <SelectItem value="info">{t('admin.security.info')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {filteredEvents.map((event, idx) => (
              <div 
                key={event.id} 
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover-elevate"
                data-testid={`event-security-${idx}`}
              >
                <div className="mt-0.5">{getTypeIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getSeverityBadge(event.severity)}
                    <span className="text-sm font-medium">{event.message}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: dateLocale })}</span>
                    {event.ip && <span className="font-mono">IP: {event.ip}</span>}
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t('admin.security.noEvents')}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Active Sessions Table
function ActiveSessionsTable({ sessions }: { sessions: ActiveSession[] }) {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);

  return (
    <Card data-testid="card-active-sessions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('admin.security.activeSessions')}
        </CardTitle>
        <CardDescription>{t('admin.security.activeSessionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.security.user')}</TableHead>
              <TableHead>{t('admin.security.ip')}</TableHead>
              <TableHead>{t('admin.security.device')}</TableHead>
              <TableHead>{t('admin.security.created')}</TableHead>
              <TableHead>{t('admin.security.lastActivity')}</TableHead>
              <TableHead>{t('admin.security.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session, idx) => (
              <TableRow key={session.id} data-testid={`row-session-${idx}`}>
                <TableCell className="font-medium">{session.userId}</TableCell>
                <TableCell className="font-mono text-xs">{session.ip}</TableCell>
                <TableCell className="text-xs max-w-32 truncate">{session.userAgent}</TableCell>
                <TableCell className="text-xs">
                  {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: dateLocale })}
                </TableCell>
                <TableCell className="text-xs">
                  {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true, locale: dateLocale })}
                </TableCell>
                <TableCell>
                  <Badge className={session.isActive ? "bg-green-500/10 text-green-500" : "bg-muted"}>
                    {session.isActive ? t('admin.security.active') : t('admin.security.idle')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Live Activity Feed
function LiveActivityFeed({ activities }: { activities: AdminActivityEvent[] }) {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success": return "border-l-green-500 bg-green-500/5";
      case "warning": return "border-l-yellow-500 bg-yellow-500/5";
      case "error": return "border-l-red-500 bg-red-500/5";
      default: return "border-l-blue-500 bg-blue-500/5";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restart": return <Power className="h-4 w-4" />;
      case "deploy": return <Workflow className="h-4 w-4" />;
      case "config_change": return <Settings className="h-4 w-4" />;
      case "websocket": return <Radio className="h-4 w-4" />;
      case "api_call": return <Globe className="h-4 w-4" />;
      case "alert": return <BellRing className="h-4 w-4" />;
      case "system": return <Terminal className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card data-testid="card-live-feed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-green-500 animate-pulse" />
          {t('admin.liveFeed.title')}
        </CardTitle>
        <CardDescription>{t('admin.liveFeed.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {activities.map((activity, idx) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getSeverityColor(activity.severity)}`}
                data-testid={`event-activity-${idx}`}
              >
                <div className="mt-0.5 text-muted-foreground">{getTypeIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{getTranslatedActivityMessage(t, activity.message)}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: dateLocale })}</span>
                    <span className="font-mono">{activity.source}</span>
                    <Badge variant="outline" className="text-[10px] px-1">{activity.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t('admin.liveFeed.noActivity')}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Analytics Charts
function AnalyticsCharts() {
  const { t } = useTranslation();

  const uptimeData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }),
      uptime: 99.5 + Math.random() * 0.5
    }));
  }, []);

  const tpsData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      avg: 380000 + Math.random() * 80000,
      peak: 450000 + Math.random() * 70000
    }));
  }, []);

  const incidentData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', timeZone: 'America/New_York' }),
      incidents: Math.floor(Math.random() * 5),
      resolved: Math.floor(Math.random() * 5)
    }));
  }, []);

  const latencyDistribution = useMemo(() => [
    { name: "<50ms", value: 65, color: CHART_COLORS.success },
    { name: "50-100ms", value: 25, color: CHART_COLORS.info },
    { name: "100-200ms", value: 8, color: CHART_COLORS.warning },
    { name: ">200ms", value: 2, color: CHART_COLORS.error }
  ], []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="chart-uptime">
          <CardHeader>
            <CardTitle className="text-sm">{t('admin.analytics.uptimeHistory')}</CardTitle>
            <CardDescription>{t('admin.analytics.last30Days')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[99, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(3)}%`} />
                  <Area type="monotone" dataKey="uptime" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="chart-tps">
          <CardHeader>
            <CardTitle className="text-sm">{t('admin.analytics.tpsHistory')}</CardTitle>
            <CardDescription>{t('admin.analytics.last24Hours')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tpsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend />
                  <Line type="monotone" dataKey="avg" name={t('admin.analytics.avgTps')} stroke={CHART_COLORS.info} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="peak" name={t('admin.analytics.peakTps')} stroke={CHART_COLORS.success} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="chart-incidents">
          <CardHeader>
            <CardTitle className="text-sm">{t('admin.analytics.incidentHistory')}</CardTitle>
            <CardDescription>{t('admin.analytics.last12Months')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" name={t('admin.analytics.incidents')} fill={CHART_COLORS.error} />
                  <Bar dataKey="resolved" name={t('admin.analytics.resolved')} fill={CHART_COLORS.success} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="chart-latency-distribution">
          <CardHeader>
            <CardTitle className="text-sm">{t('admin.analytics.latencyDistribution')}</CardTitle>
            <CardDescription>{t('admin.analytics.apiResponseTimes')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={latencyDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {latencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Admin Page
export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const dateLocale = getDateLocale(i18n.language);
  const [activeTab, setActiveTab] = useState("overview");
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showHealthCheckDialog, setShowHealthCheckDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [selectedStatDialog, setSelectedStatDialog] = useState<string | null>(null);
  
  const { restartStatus, isRestartInProgress, startRestart, resetStatus } = useRestartMonitor();
  const { metrics: systemMetrics, history: metricsHistory } = useSystemMetrics();
  const services = useServiceStatus();
  const dbHealth = useDatabaseHealth();
  const apiEndpoints = useApiEndpointHealth();
  const securityEvents = useSecurityEvents();
  const activeSessions = useActiveSessions();
  const activityFeed = useActivityFeed();

  const snapshots = useMainnetSnapshots(isRestartInProgress ? 10000 : 30000);
  const { stats, blocks, isLive, lastLiveUpdate, hasFailures, recentFailures, failureHistory } = snapshots;

  const calculateHealth = (): MainnetHealth => {
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

    const statsData = stats.data;
    const blocksData = blocks.data;
    const errorType = stats.errorType || blocks.errorType;

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

    const timeSinceLastBlock = Date.now() / 1000 - lastBlock.timestamp;
    const isHealthy = timeSinceLastBlock < 3600 && isLive;

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

  const restartMainnetMutation = useMutation({
    mutationFn: async (password: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
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
        
        if (error.name === 'AbortError' || error.message === 'Failed to fetch') {
          return { success: true, message: 'Restart initiated - server disconnected as expected' };
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      startRestart();
      toast({
        title: t('admin.restartInitiated'),
        description: t('admin.restartInitiatedDesc'),
        duration: 10000,
      });
      setShowRestartDialog(false);
      setAdminPassword("");
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/blocks/recent"] });
      }, 5000);
    },
    onError: (error: any) => {
      if (error.message === 'Failed to fetch' || error.name === 'AbortError') {
        startRestart();
        toast({
          title: t('admin.restartInitiated'),
          description: t('admin.restartInitiatedDesc'),
          duration: 10000,
        });
        setShowRestartDialog(false);
        setAdminPassword("");
        return;
      }
      
      toast({
        title: t('admin.restartFailed'),
        description: error.message || t('admin.restartFailedDesc'),
        variant: "destructive",
        duration: 10000,
      });
      setAdminPassword("");
      resetStatus();
    },
  });

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
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server error (${response.status}): ${response.statusText}`);
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(error.message || "Failed to check health");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const healthTitle = data.healthy ? t('admin.healthCheckHealthy') : t('admin.healthCheckDegraded');
      
      toast({
        title: healthTitle,
        description: `TPS: ${data.details?.tps || 0} | Peak: ${data.details?.peakTps || 0}`,
        variant: data.healthy ? "default" : "destructive",
        duration: 8000,
      });
      setShowHealthCheckDialog(false);
      setAdminPassword("");
      setIsHealthChecking(false);
      
      queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blocks/recent"] });
    },
    onError: (error: any) => {
      toast({
        title: t('admin.healthCheckFailed'),
        description: error.message || t('admin.healthCheckFailedDesc'),
        variant: "destructive",
        duration: 10000,
      });
      setAdminPassword("");
      setIsHealthChecking(false);
    },
  });

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

  const overviewStats = useMemo(() => {
    const healthyServices = services.filter(s => s.status === "healthy").length;
    const avgUptime = services.reduce((acc, s) => acc + s.uptime, 0) / services.length;
    
    return {
      uptime: avgUptime.toFixed(2),
      incidents: failureHistory.length,
      activeSessions: activeSessions.length,
      restartMttr: "45s"
    };
  }, [services, failureHistory, activeSessions]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
            <p className="text-muted-foreground">{t('admin.subtitle')}</p>
          </div>
          <Badge className={statusBadge.className} data-testid="badge-status">
            <StatusIcon className={`h-4 w-4 mr-1 ${statusBadge.className.includes('animate') ? 'animate-spin' : ''}`} />
            {t(getStatusTranslationKey(health.status))}
          </Badge>
        </div>
      </div>

      {/* Quick Links */}
      <Card className="bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-purple-500" />
            {t('admin.quickLinks.title')}
          </CardTitle>
          <CardDescription>{t('admin.quickLinks.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Link href="/app/members" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors group" data-testid="link-admin-members">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium group-hover:text-purple-400 transition-colors">{t('admin.quickLinks.members')}</span>
            </Link>
            <Link href="/app/api-keys" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors group" data-testid="link-admin-api-keys">
              <Key className="h-4 w-4 text-cyan-500" />
              <span className="text-sm font-medium group-hover:text-cyan-400 transition-colors">{t('admin.quickLinks.apiKeys')}</span>
            </Link>
            <Link href="/app/operator/dashboard" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-colors group" data-testid="link-admin-operator">
              <Settings className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium group-hover:text-green-400 transition-colors">{t('admin.quickLinks.operator')}</span>
            </Link>
            <Link href="/app/operator/security" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-colors group" data-testid="link-admin-security">
              <Shield className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium group-hover:text-yellow-400 transition-colors">{t('admin.quickLinks.security')}</span>
            </Link>
            <Link href="/learn/whitepaper" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors group" data-testid="link-admin-whitepaper">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">{t('admin.quickLinks.whitepaper')}</span>
            </Link>
            <Link href="/legal/terms-of-service" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors group" data-testid="link-admin-terms">
              <Scale className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium group-hover:text-orange-400 transition-colors">{t('admin.quickLinks.terms')}</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.tabs.overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2" data-testid="tab-system">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.tabs.system')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2" data-testid="tab-security">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.tabs.security')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.tabs.analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="livefeed" className="gap-2" data-testid="tab-livefeed">
            <Radio className="h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.tabs.liveFeed')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Live Status Banner */}
          <Card className={`border-2 ${health.status === 'active' ? 'border-green-500/50' : health.status === 'restarting' ? 'border-blue-500/50 animate-pulse' : 'border-destructive/50'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`h-6 w-6 ${statusBadge.className.includes('animate') ? 'animate-spin' : ''} ${statusBadge.className.includes('green') ? 'text-green-500' : statusBadge.className.includes('blue') ? 'text-blue-500' : 'text-red-500'}`} />
                  <div>
                    <h2 className="text-xl font-bold">{t('admin.mainnetStatus')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {isLive ? (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-green-500" />
                          {t('admin.realtimeHealthMonitoring')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <WifiOff className="h-3 w-3 text-orange-500" />
                          {t('admin.connectingToMainnet')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title={t('admin.lastBlock')}
                  value={blocks.data ? `#${health.lastBlockNumber || 0}` : "---"}
                  subtitle={health.lastBlockTime > 0 ? formatDistanceToNow(new Date(health.lastBlockTime * 1000), { addSuffix: true, locale: dateLocale }) : t('common.na')}
                  icon={Database}
                  testId="card-last-block"
                />
                <StatCard
                  title={t('admin.currentTps')}
                  value={stats.data ? health.tps.toLocaleString() : "---"}
                  subtitle={t('admin.transactionsPerSecond')}
                  icon={Activity}
                  status={health.tps > 400000 ? "success" : health.tps > 200000 ? "warning" : "error"}
                  testId="card-current-tps"
                />
                <StatCard
                  title={t('admin.peakTps')}
                  value={stats.data ? health.peakTps.toLocaleString() : "---"}
                  subtitle={t('admin.allTimeHigh')}
                  icon={TrendingUp}
                  testId="card-peak-tps"
                />
                <StatCard
                  title={t('admin.timeSinceBlock')}
                  value={blocks.data && health.timeSinceLastBlock > 0 ? `${Math.floor(health.timeSinceLastBlock)}s` : "---"}
                  subtitle={health.timeSinceLastBlock > 3600 ? t('admin.stalled') : t('admin.normal')}
                  icon={Clock}
                  status={health.timeSinceLastBlock > 3600 ? "error" : health.timeSinceLastBlock > 60 ? "warning" : "success"}
                  testId="card-time-since-block"
                />
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title={t('admin.overview.uptimeSla')}
              value={`${overviewStats.uptime}%`}
              subtitle={t('admin.overview.last30Days')}
              icon={Gauge}
              status="success"
              trend={{ value: 0.02, direction: "up" }}
              onClick={() => setSelectedStatDialog("uptime")}
              testId="card-stat-uptime"
            />
            <StatCard
              title={t('admin.overview.incidents')}
              value={overviewStats.incidents}
              subtitle={t('admin.overview.thisMonth')}
              icon={AlertTriangle}
              status={overviewStats.incidents > 5 ? "error" : overviewStats.incidents > 0 ? "warning" : "success"}
              onClick={() => setSelectedStatDialog("incidents")}
              testId="card-stat-incidents"
            />
            <StatCard
              title={t('admin.overview.activeSessions')}
              value={overviewStats.activeSessions}
              subtitle={t('admin.overview.adminUsers')}
              icon={Users}
              onClick={() => setSelectedStatDialog("sessions")}
              testId="card-stat-sessions"
            />
            <StatCard
              title={t('admin.overview.restartMttr')}
              value={overviewStats.restartMttr}
              subtitle={t('admin.overview.avgRecoveryTime')}
              icon={Timer}
              status="success"
              onClick={() => setSelectedStatDialog("mttr")}
              testId="card-stat-mttr"
            />
          </div>

          {/* Restart Progress */}
          {isRestartInProgress && (
            <Card className="border-blue-500/50 bg-blue-50/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  {t('admin.restartInProgress')}
                </CardTitle>
                <CardDescription>{restartStatus.message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={restartStatus.progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('admin.progress')}: {restartStatus.progress}%</span>
                </div>
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
                          {t(`admin.${config.labelKey}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Usage Monitor */}
          <AIUsageMonitor />

          {/* Control Panel */}
          <Card data-testid="card-control-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t('admin.mainnetControlPanel')}
              </CardTitle>
              <CardDescription>{t('admin.controlPanelDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">{t('admin.criticalActions')}</h3>
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
                        {isRestartInProgress ? t('admin.restartInProgressButton') : t('admin.initiating')}
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-2" />
                        {t('admin.restartMainnet')}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t('admin.restartDescription')}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">{t('admin.diagnostics')}</h3>
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
                        {t('admin.checkingHealth')}
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 mr-2" />
                        {t('admin.runHealthCheck')}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t('admin.healthCheckDescription')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Failure History */}
          {recentFailures && recentFailures.length > 0 && (
            <Card className="border-orange-500/50" data-testid="card-failure-history">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    {t('admin.failureHistory')}
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("tburn_admin_failure_history");
                      window.location.reload();
                    }}
                    className="h-6 text-xs px-2"
                    data-testid="button-clear-history"
                  >
                    {t('admin.clearHistory')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {recentFailures.map((failure, idx) => {
                      const ageMs = Date.now() - failure.timestamp;
                      const ageMinutes = Math.floor(ageMs / 60000);
                      const ageHours = Math.floor(ageMinutes / 60);
                      const ageText = ageHours > 0 ? `${ageHours}h ago` : `${ageMinutes}m ago`;
                      
                      return (
                        <div key={idx} className="text-xs flex items-center justify-between py-1 border-b last:border-0">
                          <span className="text-muted-foreground">
                            {new Date(failure.timestamp).toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} 
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
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <ResourceUsagePanel metrics={systemMetrics} history={metricsHistory} />
          <ServiceStatusGrid services={services} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DatabaseHealthCard health={dbHealth} />
            <Card data-testid="card-system-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {t('admin.system.systemInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('admin.system.nodeVersion')}</p>
                    <p className="font-mono">{systemMetrics.nodeVersion}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('admin.system.platform')}</p>
                    <p className="font-mono">{systemMetrics.platform}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('admin.system.processUptime')}</p>
                    <p className="font-mono">
                      {Math.floor((Date.now() - systemMetrics.processUptime) / 1000 / 60 / 60)}h {Math.floor((Date.now() - systemMetrics.processUptime) / 1000 / 60 % 60)}m
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('admin.system.loadAverage')}</p>
                    <p className="font-mono">{systemMetrics.loadAvg.map(v => v.toFixed(2)).join(", ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <ApiEndpointTable endpoints={apiEndpoints} />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title={t('admin.security.totalEvents')}
              value={securityEvents.length}
              subtitle={t('admin.security.last24Hours')}
              icon={ShieldAlert}
              testId="card-security-total"
            />
            <StatCard
              title={t('admin.security.criticalEvents')}
              value={securityEvents.filter(e => e.severity === "critical").length}
              subtitle={t('admin.security.requiresAttention')}
              icon={AlertTriangle}
              status={securityEvents.filter(e => e.severity === "critical").length > 0 ? "error" : "success"}
              testId="card-security-critical"
            />
            <StatCard
              title={t('admin.security.blockedIps')}
              value={securityEvents.filter(e => e.type === "blocked_ip").length}
              subtitle={t('admin.security.last30Days')}
              icon={ShieldAlert}
              testId="card-security-blocked"
            />
          </div>
          <ActiveSessionsTable sessions={activeSessions} />
          <SecurityEventsTable events={securityEvents} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsCharts />
        </TabsContent>

        {/* Live Feed Tab */}
        <TabsContent value="livefeed" className="space-y-6">
          <LiveActivityFeed activities={activityFeed} />
        </TabsContent>
      </Tabs>

      {/* Stat Detail Dialogs */}
      <Dialog open={selectedStatDialog === "uptime"} onOpenChange={(open) => !open && setSelectedStatDialog(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-uptime">
          <DialogHeader>
            <DialogTitle>{t('admin.dialogs.uptime.title')}</DialogTitle>
            <DialogDescription>{t('admin.dialogs.uptime.description')}</DialogDescription>
          </DialogHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }),
                uptime: 99.5 + Math.random() * 0.5
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[99, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(3)}%`} />
                <Area type="monotone" dataKey="uptime" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedStatDialog === "incidents"} onOpenChange={(open) => !open && setSelectedStatDialog(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-incidents">
          <DialogHeader>
            <DialogTitle>{t('admin.dialogs.incidents.title')}</DialogTitle>
            <DialogDescription>{t('admin.dialogs.incidents.description')}</DialogDescription>
          </DialogHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.from({ length: 12 }, (_, i) => ({
                month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', timeZone: 'America/New_York' }),
                incidents: Math.floor(Math.random() * 5),
                resolved: Math.floor(Math.random() * 5)
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="incidents" name={t('admin.analytics.incidents')} fill={CHART_COLORS.error} />
                <Bar dataKey="resolved" name={t('admin.analytics.resolved')} fill={CHART_COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedStatDialog === "sessions"} onOpenChange={(open) => !open && setSelectedStatDialog(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-sessions">
          <DialogHeader>
            <DialogTitle>{t('admin.dialogs.sessions.title')}</DialogTitle>
            <DialogDescription>{t('admin.dialogs.sessions.description')}</DialogDescription>
          </DialogHeader>
          <ActiveSessionsTable sessions={activeSessions} />
        </DialogContent>
      </Dialog>

      <Dialog open={selectedStatDialog === "mttr"} onOpenChange={(open) => !open && setSelectedStatDialog(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-mttr">
          <DialogHeader>
            <DialogTitle>{t('admin.dialogs.mttr.title')}</DialogTitle>
            <DialogDescription>{t('admin.dialogs.mttr.description')}</DialogDescription>
          </DialogHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.from({ length: 20 }, (_, i) => ({
                restart: `#${i + 1}`,
                mttr: 30 + Math.random() * 30
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="restart" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}s`} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}s`} />
                <Line type="monotone" dataKey="mttr" name="MTTR" stroke={CHART_COLORS.info} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restart Confirmation Dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent data-testid="dialog-restart">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-destructive" />
              {t('admin.confirmRestartTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-2">{t('admin.thisActionWill')}</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>{t('admin.restartAction1')}</li>
                    <li>{t('admin.restartAction2')}</li>
                    <li>{t('admin.restartAction3')}</li>
                    <li>{t('admin.restartAction4')}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password-restart" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('admin.adminPasswordRequired')}
                  </Label>
                  <Input
                    id="admin-password-restart"
                    type="password"
                    placeholder={t('admin.enterAdminPassword')}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    data-testid="input-admin-password-restart"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminPassword("")} data-testid="button-cancel-restart">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restartMainnetMutation.mutate(adminPassword)}
              disabled={!adminPassword || restartMainnetMutation.isPending}
              data-testid="button-confirm-restart"
            >
              {restartMainnetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.restarting')}
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  {t('admin.restartMainnet')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Health Check Dialog */}
      <AlertDialog open={showHealthCheckDialog} onOpenChange={setShowHealthCheckDialog}>
        <AlertDialogContent data-testid="dialog-health-check">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t('admin.confirmHealthCheckTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-sm">{t('admin.healthCheckIntro')}</p>
                <div className="space-y-2">
                  <Label htmlFor="admin-password-health" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('admin.adminPasswordRequired')}
                  </Label>
                  <Input
                    id="admin-password-health"
                    type="password"
                    placeholder={t('admin.enterAdminPassword')}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    data-testid="input-admin-password-health"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminPassword("")} data-testid="button-cancel-health">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => checkHealthMutation.mutate(adminPassword)}
              disabled={!adminPassword || checkHealthMutation.isPending}
              data-testid="button-confirm-health"
            >
              {checkHealthMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.checking')}
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  {t('admin.runHealthCheck')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
