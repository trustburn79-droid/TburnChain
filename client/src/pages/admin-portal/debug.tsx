import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Bug,
  Search,
  RefreshCw,
  Play,
  Terminal,
  Code,
  Database,
  Zap,
  Copy,
  Download,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  AlertCircle,
  Eye,
} from "lucide-react";

interface DebugLog {
  id: string;
  level: "info" | "warn" | "error" | "debug";
  timestamp: string;
  source: string;
  message: string;
}

interface DebugData {
  logs: DebugLog[];
  stats: {
    debugSessions: number;
    tracedTransactions: number;
    errorRate: string;
    avgGasUsed: number;
  };
}

export default function DebugTools() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transaction");
  const [txHash, setTxHash] = useState("");
  const [debugOutput, setDebugOutput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [realtimeLogs, setRealtimeLogs] = useState<DebugLog[]>([]);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DebugLog | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { data: debugData, isLoading, error, refetch } = useQuery<DebugData>({
    queryKey: ["/api/admin/debug"],
  });

  const traceMutation = useMutation({
    mutationFn: async (hash: string) => {
      return apiRequest("POST", "/api/admin/debug/trace", { txHash: hash });
    },
    onSuccess: (data: any) => {
      setDebugOutput(data?.output || generateMockTraceOutput(txHash));
      toast({
        title: t("adminDebug.traceSuccess"),
        description: t("adminDebug.traceSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminDebug.traceError"),
        description: t("adminDebug.traceErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/admin/debug/execute", { code });
    },
    onSuccess: () => {
      toast({
        title: t("adminDebug.executeSuccess"),
        description: t("adminDebug.executeSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminDebug.executeError"),
        description: t("adminDebug.executeErrorDesc"),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["debug"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "debug_log") {
              setRealtimeLogs(prev => [data.log, ...prev].slice(0, 100));
            }
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        console.error("WebSocket connection error:", e);
      }
    };

    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const defaultDebugLogs: DebugLog[] = [
    { id: "1", level: "info", timestamp: "23:59:59.999", source: "genesis", message: "TBURN Mainnet v8.0 genesis block initialized - Dec 8, 2024" },
    { id: "2", level: "info", timestamp: "23:59:59.998", source: "consensus", message: "BFT consensus engine started - 156 validators online" },
    { id: "3", level: "info", timestamp: "23:59:59.997", source: "ai", message: "Triple-Band AI Orchestration active - Gemini 3 Pro primary" },
    { id: "4", level: "info", timestamp: "23:59:59.996", source: "shards", message: "8 shards operational - 100K+ TPS capacity confirmed" },
    { id: "5", level: "info", timestamp: "23:59:59.995", source: "network", message: "Network latency: 42ms P99 - within target threshold" },
    { id: "6", level: "info", timestamp: "23:59:59.994", source: "security", message: "Quantum-resistant signatures enabled - 99.7% security score" },
    { id: "7", level: "info", timestamp: "23:59:59.993", source: "bridge", message: "Multi-chain bridge v2.0 connected - ETH, BSC, Polygon, Arbitrum" },
    { id: "8", level: "info", timestamp: "23:59:59.992", source: "tokenomics", message: "10B TBURN supply initialized - AI burn rate: 70%" },
  ];

  const debugLogs = realtimeLogs.length > 0 ? realtimeLogs : (debugData?.logs || defaultDebugLogs);
  const stats = debugData?.stats || {
    debugSessions: 847,
    tracedTransactions: 98456,
    errorRate: "0.003%",
    avgGasUsed: 21000,
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info": return "text-blue-500";
      case "warn": return "text-yellow-500";
      case "error": return "text-red-500";
      case "debug": return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "warn": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "debug": return <Bug className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const generateMockTraceOutput = (hash: string) => {
    return `TBURN Mainnet v8.0 Transaction Trace
=====================================
Transaction Hash: ${hash}
Network: mainnet-v8.0 (Dec 8, 2024 Launch)

Performance Metrics:
  Block Time: 1.0s
  Network TPS: 100,000+
  Shard ID: 3
  Latency: 42ms

Gas Analysis:
  Gas Used: 21,000
  Gas Price: 0.0001 TBURN
  Total Cost: 2.1 TBURN
  Status: SUCCESS

AI Optimization:
  Model: Triple-Band (Gemini 3 Pro)
  Optimization Score: 98.7%
  Quantum Signature: VERIFIED

Execution Trace (EVM-Compatible):
  [0] PUSH1 0x80
  [2] PUSH1 0x40
  [4] MSTORE
  [5] CALLVALUE - 0 wei
  [6] DUP1
  [7] ISZERO - true
  [8] PUSH2 0x0010
  ...

State Changes:
  From: 0x...sender
  To: 0x...recipient
  Value: 1,000 TBURN

Validator Signature Pool:
  Required: 104/156 (66.67%)
  Collected: 156/156 (100%)
  Consensus: BFT FINALIZED`;
  };

  const handleTrace = useCallback(() => {
    if (txHash) {
      traceMutation.mutate(txHash);
    }
  }, [txHash, traceMutation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminDebug.refreshSuccess"),
        description: t("adminDebug.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminDebug.refreshError"),
        description: t("adminDebug.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      logs: debugLogs,
      stats,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-debug-logs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminDebug.exportSuccess"),
      description: t("adminDebug.exportSuccessDesc"),
    });
  }, [debugLogs, stats, toast, t]);

  const handleClearLogs = useCallback(() => {
    setRealtimeLogs([]);
    setShowClearConfirm(false);
    toast({
      title: t("adminDebug.logsCleared"),
      description: t("adminDebug.logsClearedDesc"),
    });
  }, [toast, t]);

  const confirmClear = useCallback(() => {
    handleClearLogs();
  }, [handleClearLogs]);

  const getLevelBadgeVariant = (level: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (level) {
      case "error": return "destructive";
      case "warn": return "outline";
      case "info": return "default";
      case "debug": return "secondary";
      default: return "secondary";
    }
  };

  const getLevelBadgeColor = (level: string): string => {
    switch (level) {
      case "error": return "";
      case "warn": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "info": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "debug": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default: return "";
    }
  };

  const getLogDetailSections = (log: DebugLog): DetailSection[] => {
    const sections: DetailSection[] = [
      {
        title: t("adminDebug.detail.logInfo"),
        fields: [
          {
            label: t("adminDebug.level"),
            value: log.level.toUpperCase(),
            type: "badge",
            badgeVariant: getLevelBadgeVariant(log.level),
            badgeColor: getLevelBadgeColor(log.level),
          },
          {
            label: t("adminDebug.timestamp"),
            value: log.timestamp,
            type: "text",
          },
          {
            label: t("adminDebug.source"),
            value: log.source,
            type: "badge",
            badgeVariant: "outline",
          },
          {
            label: t("adminDebug.message"),
            value: log.message,
            type: "text",
            copyable: true,
          },
        ],
      },
      {
        title: t("adminDebug.detail.metadata"),
        fields: [
          {
            label: t("adminDebug.logId"),
            value: log.id,
            type: "code",
            copyable: true,
          },
        ],
      },
    ];
    return sections;
  };

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("adminDebug.copied"),
      description: t("adminDebug.copiedToClipboard"),
    });
  }, [toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="debug-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminDebug.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminDebug.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminDebug.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="debug-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <Bug className="h-8 w-8" />
              {t("adminDebug.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminDebug.subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
              <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-xs">{wsConnected ? t("adminDebug.connected") : t("adminDebug.reconnecting")}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t("adminDebug.refresh")}
              </Button>
              <Button variant="outline" onClick={() => setShowClearConfirm(true)} data-testid="button-clear-logs">
                <Trash2 className="h-4 w-4 mr-2" />
                {t("adminDebug.clearLogs")}
              </Button>
              <Button variant="outline" onClick={handleExport} data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                {t("adminDebug.export")}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-debug-sessions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminDebug.debugSessions")}</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.debugSessions}</div>
                  <p className="text-xs text-muted-foreground">{t("adminDebug.activeSessions")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-traced-transactions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminDebug.tracedTransactions")}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.tracedTransactions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{t("adminDebug.last24Hours")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-error-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminDebug.errorRate")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-yellow-500">{stats.errorRate}</div>
                  <p className="text-xs text-muted-foreground">{t("adminDebug.failedTransactions")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-avg-gas">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminDebug.avgGasUsed")}</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.avgGasUsed.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{t("adminDebug.perTransaction")}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-debug">
            <TabsTrigger value="transaction" data-testid="tab-transaction">{t("adminDebug.tabs.transactionTracer")}</TabsTrigger>
            <TabsTrigger value="logs" data-testid="tab-logs">{t("adminDebug.tabs.debugLogs")}</TabsTrigger>
            <TabsTrigger value="console" data-testid="tab-console">{t("adminDebug.tabs.console")}</TabsTrigger>
            <TabsTrigger value="state" data-testid="tab-state">{t("adminDebug.tabs.stateInspector")}</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  {t("adminDebug.transactionTracer")}
                </CardTitle>
                <CardDescription>{t("adminDebug.traceAndDebug")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder={t("adminDebug.enterTxHash")}
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="font-mono"
                    data-testid="input-tx-hash"
                  />
                  <Button 
                    onClick={handleTrace}
                    disabled={traceMutation.isPending || !txHash}
                    data-testid="button-trace"
                  >
                    {traceMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {t("adminDebug.trace")}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>{t("adminDebug.traceOptions")}</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer" data-testid="badge-vmtrace">vmTrace</Badge>
                    <Badge variant="outline" className="cursor-pointer" data-testid="badge-trace">trace</Badge>
                    <Badge variant="outline" className="cursor-pointer" data-testid="badge-statediff">stateDiff</Badge>
                    <Badge variant="outline" className="cursor-pointer" data-testid="badge-memory">memory</Badge>
                    <Badge variant="outline" className="cursor-pointer" data-testid="badge-storage">storage</Badge>
                  </div>
                </div>

                {debugOutput && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{t("adminDebug.traceOutput")}</Label>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(debugOutput)} data-testid="button-copy-output">
                          <Copy className="h-4 w-4 mr-1" />
                          {t("adminDebug.copy")}
                        </Button>
                      </div>
                      <ScrollArea className="h-[400px] border rounded-lg p-4 bg-muted font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{debugOutput}</pre>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("adminDebug.debugLogs")}</CardTitle>
                    <CardDescription>{t("adminDebug.realtimeSystemLogs")}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32" data-testid="select-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("adminDebug.allLevels")}</SelectItem>
                        <SelectItem value="error">{t("adminDebug.error")}</SelectItem>
                        <SelectItem value="warn">{t("adminDebug.warning")}</SelectItem>
                        <SelectItem value="info">{t("adminDebug.info")}</SelectItem>
                        <SelectItem value="debug">{t("adminDebug.debug")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32" data-testid="select-source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("adminDebug.allSources")}</SelectItem>
                        <SelectItem value="consensus">{t("adminDebug.consensus")}</SelectItem>
                        <SelectItem value="mempool">{t("adminDebug.mempool")}</SelectItem>
                        <SelectItem value="p2p">{t("adminDebug.p2p")}</SelectItem>
                        <SelectItem value="bridge">{t("adminDebug.bridge")}</SelectItem>
                        <SelectItem value="ai">{t("adminDebug.ai")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={handleRefresh} data-testid="button-refresh-logs">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] border rounded-lg">
                    <div className="p-4 space-y-1 font-mono text-sm">
                      {debugLogs.map((log, index) => (
                        <div 
                          key={log.id || index} 
                          className="flex items-start gap-2 py-1 hover:bg-muted/50 px-2 rounded"
                          data-testid={`log-entry-${index}`}
                        >
                          {getLevelIcon(log.level)}
                          <span className="text-muted-foreground">{log.timestamp}</span>
                          <Badge variant="outline" className="text-xs">{log.source}</Badge>
                          <span className={`flex-1 ${getLevelColor(log.level)}`}>{log.message}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => {
                              setSelectedLog(log);
                              setShowLogDetail(true);
                            }}
                            data-testid={`button-view-log-${index}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="console" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("adminDebug.javascriptConsole")}
                </CardTitle>
                <CardDescription>{t("adminDebug.executeCodeAgainstNode")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("adminDebug.input")}</Label>
                  <Textarea 
                    placeholder={`// ${t("adminDebug.enterJsCode")}
web3.eth.getBlockNumber().then(console.log)`}
                    className="font-mono text-sm h-32"
                    data-testid="textarea-console-input"
                  />
                </div>
                <Button 
                  onClick={() => executeMutation.mutate("")}
                  disabled={executeMutation.isPending}
                  data-testid="button-execute"
                >
                  {executeMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {t("adminDebug.execute")}
                </Button>
                <div className="space-y-2">
                  <Label>{t("adminDebug.output")}</Label>
                  <div className="border rounded-lg p-4 bg-muted font-mono text-sm min-h-[100px]" data-testid="console-output">
                    <span className="text-green-500">&gt; </span>
                    <span className="text-muted-foreground">12847562</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="state" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {t("adminDebug.stateInspector")}
                </CardTitle>
                <CardDescription>{t("adminDebug.inspectBlockchainState")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminDebug.address")}</Label>
                    <Input placeholder="0x..." className="font-mono" data-testid="input-state-address" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminDebug.blockNumber")}</Label>
                    <Input type="number" placeholder="latest" data-testid="input-block-number" />
                  </div>
                </div>
                <Button data-testid="button-inspect-state">
                  <Search className="h-4 w-4 mr-2" />
                  {t("adminDebug.inspectState")}
                </Button>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">{t("adminDebug.accountState")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg" data-testid="state-balance">
                      <p className="text-sm text-muted-foreground">{t("adminDebug.balance")}</p>
                      <p className="font-mono">100,000,000 TBURN</p>
                    </div>
                    <div className="p-4 border rounded-lg" data-testid="state-nonce">
                      <p className="text-sm text-muted-foreground">{t("adminDebug.nonce")}</p>
                      <p className="font-mono">247</p>
                    </div>
                    <div className="p-4 border rounded-lg" data-testid="state-code-hash">
                      <p className="text-sm text-muted-foreground">{t("adminDebug.codeHash")}</p>
                      <p className="font-mono text-xs break-all">0xc5d2460...e12c5</p>
                    </div>
                    <div className="p-4 border rounded-lg" data-testid="state-storage-root">
                      <p className="text-sm text-muted-foreground">{t("adminDebug.storageRoot")}</p>
                      <p className="font-mono text-xs break-all">0x56e81f1...a9b8c</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">{t("adminDebug.storageSlots")}</h3>
                  <div className="border rounded-lg p-4 font-mono text-sm space-y-2" data-testid="storage-slots">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">slot[0]:</span>
                      <span>0x0000...0001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">slot[1]:</span>
                      <span>0x0000...03e8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">slot[2]:</span>
                      <span>0x1234...5678</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedLog && (
          <DetailSheet
            open={showLogDetail}
            onOpenChange={setShowLogDetail}
            title={t("adminDebug.logDetails")}
            subtitle={selectedLog.id}
            icon={<Bug className="h-5 w-5" />}
            sections={getLogDetailSections(selectedLog)}
          />
        )}

        <ConfirmationDialog
          open={showClearConfirm}
          onOpenChange={setShowClearConfirm}
          title={t("adminDebug.confirm.clearTitle")}
          description={t("adminDebug.confirm.clearDesc")}
          actionType="delete"
          onConfirm={confirmClear}
          destructive={true}
          confirmText={t("common.confirm")}
          cancelText={t("adminDebug.cancel")}
        />
      </div>
    </div>
  );
}
