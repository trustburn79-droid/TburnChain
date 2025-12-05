import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FlaskConical,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Droplets,
  Activity,
  Server,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
  RotateCcw,
  AlertCircle,
  Download,
} from "lucide-react";

interface TestnetInstance {
  id: string;
  name: string;
  chainId: number;
  status: "running" | "stopped" | "syncing";
  nodes: number;
  blockHeight: number;
  tps: number;
  uptime: string;
  createdAt: string;
}

interface FaucetRequest {
  id: string;
  address: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: string;
}

interface TestnetData {
  instances: TestnetInstance[];
  faucetRequests: FaucetRequest[];
  stats: {
    activeTestnets: number;
    totalNodes: number;
    faucetBalance: string;
    faucetRequests24h: number;
  };
}

export default function TestnetManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("instances");
  const [faucetAddress, setFaucetAddress] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: testnetData, isLoading, error, refetch } = useQuery<TestnetData>({
    queryKey: ["/api/admin/testnet"],
  });

  const faucetMutation = useMutation({
    mutationFn: async (data: { address: string; amount: number }) => {
      return apiRequest("POST", "/api/admin/testnet/faucet", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testnet"] });
      toast({
        title: t("adminTestnet.faucetSuccess"),
        description: t("adminTestnet.faucetSuccessDesc"),
      });
      setFaucetAddress("");
    },
    onError: () => {
      toast({
        title: t("adminTestnet.faucetError"),
        description: t("adminTestnet.faucetErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (instanceId: string) => {
      return apiRequest("POST", `/api/admin/testnet/${instanceId}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testnet"] });
      toast({
        title: t("adminTestnet.resetSuccess"),
        description: t("adminTestnet.resetSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminTestnet.resetError"),
        description: t("adminTestnet.resetErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ instanceId, action }: { instanceId: string; action: "start" | "stop" }) => {
      return apiRequest("POST", `/api/admin/testnet/${instanceId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testnet"] });
      toast({
        title: t("adminTestnet.toggleSuccess"),
        description: t("adminTestnet.toggleSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminTestnet.toggleError"),
        description: t("adminTestnet.toggleErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const defaultInstances: TestnetInstance[] = [
    { id: "1", name: "Dev Testnet", chainId: 8889, status: "running", nodes: 4, blockHeight: 1284567, tps: 1247, uptime: "99.9%", createdAt: "2024-11-01" },
    { id: "2", name: "Staging Testnet", chainId: 8890, status: "running", nodes: 8, blockHeight: 987654, tps: 2456, uptime: "99.8%", createdAt: "2024-10-15" },
    { id: "3", name: "QA Testnet", chainId: 8891, status: "stopped", nodes: 4, blockHeight: 456789, tps: 0, uptime: "95.2%", createdAt: "2024-09-01" },
  ];

  const defaultFaucetRequests: FaucetRequest[] = [
    { id: "1", address: "0x1234...5678", amount: 100, status: "completed", timestamp: "2024-12-04 14:45:00" },
    { id: "2", address: "0xabcd...efgh", amount: 50, status: "pending", timestamp: "2024-12-04 14:42:00" },
    { id: "3", address: "0x9876...5432", amount: 100, status: "completed", timestamp: "2024-12-04 14:38:00" },
    { id: "4", address: "0xdead...beef", amount: 100, status: "failed", timestamp: "2024-12-04 14:35:00" },
  ];

  const instances = testnetData?.instances || defaultInstances;
  const faucetRequests = testnetData?.faucetRequests || defaultFaucetRequests;
  const stats = testnetData?.stats || {
    activeTestnets: 2,
    totalNodes: 16,
    faucetBalance: "10M",
    faucetRequests24h: 247,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "stopped": return "bg-red-500";
      case "syncing": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminTestnet.refreshSuccess"),
        description: t("adminTestnet.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminTestnet.refreshError"),
        description: t("adminTestnet.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      instances,
      faucetRequests,
      stats,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-testnet-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminTestnet.exportSuccess"),
      description: t("adminTestnet.exportSuccessDesc"),
    });
  }, [instances, faucetRequests, stats, toast, t]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("adminTestnet.copied"),
      description: t("adminTestnet.copiedToClipboard"),
    });
  }, [toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="testnet-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminTestnet.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminTestnet.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTestnet.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="testnet-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <FlaskConical className="h-8 w-8" />
              {t("adminTestnet.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminTestnet.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t("adminTestnet.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminTestnet.export")}
            </Button>
            <Button data-testid="button-create-testnet">
              <Plus className="h-4 w-4 mr-2" />
              {t("adminTestnet.createTestnet")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-active-testnets">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.activeTestnets")}</CardTitle>
              <Server className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-green-500">{stats.activeTestnets}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.of3Instances")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-total-nodes">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.totalNodes")}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.totalNodes}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.acrossAllTestnets")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-faucet-balance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.faucetBalance")}</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.faucetBalance}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.testTburnAvailable")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-faucet-requests">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminTestnet.faucetRequests24h")}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{stats.faucetRequests24h}</div>
                  <p className="text-xs text-muted-foreground">{t("adminTestnet.testTokensDistributed")}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-testnet">
            <TabsTrigger value="instances" data-testid="tab-instances">{t("adminTestnet.tabs.testnetInstances")}</TabsTrigger>
            <TabsTrigger value="faucet" data-testid="tab-faucet">{t("adminTestnet.tabs.faucet")}</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">{t("adminTestnet.tabs.settings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))
            ) : (
              instances.map((instance, index) => (
                <Card key={instance.id} data-testid={`testnet-instance-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {instance.name}
                            <Badge className={getStatusColor(instance.status)}>{t(`adminTestnet.status.${instance.status}`)}</Badge>
                          </CardTitle>
                          <CardDescription>{t("adminTestnet.chainId")}: {instance.chainId}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {instance.status === "running" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleMutation.mutate({ instanceId: instance.id, action: "stop" })}
                            disabled={toggleMutation.isPending}
                            data-testid={`button-stop-${index}`}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            {t("adminTestnet.stop")}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleMutation.mutate({ instanceId: instance.id, action: "start" })}
                            disabled={toggleMutation.isPending}
                            data-testid={`button-start-${index}`}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            {t("adminTestnet.start")}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resetMutation.mutate(instance.id)}
                          disabled={resetMutation.isPending}
                          data-testid={`button-reset-${index}`}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {t("adminTestnet.reset")}
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-settings-${index}`}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" data-testid={`button-delete-${index}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("adminTestnet.nodes")}</p>
                        <p className="text-lg font-bold">{instance.nodes}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("adminTestnet.blockHeight")}</p>
                        <p className="text-lg font-bold">{instance.blockHeight.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("adminTestnet.tps")}</p>
                        <p className="text-lg font-bold">{instance.tps.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("adminTestnet.uptime")}</p>
                        <p className="text-lg font-bold">{instance.uptime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("adminTestnet.created")}</p>
                        <p className="text-lg font-bold">{instance.createdAt}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex flex-wrap gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t("adminTestnet.rpcEndpoint")}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            https://rpc-{instance.name.toLowerCase().replace(' ', '-')}.tburn.io
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleCopy(`https://rpc-${instance.name.toLowerCase().replace(' ', '-')}.tburn.io`)}
                            data-testid={`button-copy-rpc-${index}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t("adminTestnet.explorer")}</p>
                        <Button variant="link" size="sm" className="h-auto p-0" data-testid={`button-explorer-${index}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t("adminTestnet.viewExplorer")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="faucet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  {t("adminTestnet.requestTestTokens")}
                </CardTitle>
                <CardDescription>{t("adminTestnet.getTestTokensForDev")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("adminTestnet.walletAddress")}</Label>
                    <Input 
                      placeholder="0x..." 
                      value={faucetAddress}
                      onChange={(e) => setFaucetAddress(e.target.value)}
                      data-testid="input-faucet-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTestnet.amount")}</Label>
                    <Input type="number" defaultValue="100" data-testid="input-faucet-amount" />
                  </div>
                </div>
                <Button 
                  className="w-full md:w-auto"
                  onClick={() => faucetMutation.mutate({ address: faucetAddress, amount: 100 })}
                  disabled={faucetMutation.isPending || !faucetAddress}
                  data-testid="button-request-tokens"
                >
                  {faucetMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Droplets className="h-4 w-4 mr-2" />
                  )}
                  {t("adminTestnet.requestTokens")}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t("adminTestnet.faucetLimit")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminTestnet.recentFaucetRequests")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminTestnet.address")}</TableHead>
                        <TableHead>{t("adminTestnet.amount")}</TableHead>
                        <TableHead>{t("adminTestnet.statusHeader")}</TableHead>
                        <TableHead>{t("adminTestnet.timestamp")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faucetRequests.map((request, index) => (
                        <TableRow key={request.id} data-testid={`faucet-request-${index}`}>
                          <TableCell className="font-mono">{request.address}</TableCell>
                          <TableCell>{request.amount} TBURN</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {request.status === "failed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {t(`adminTestnet.status.${request.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{request.timestamp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminTestnet.faucetStatistics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg" data-testid="stat-total-distributed">
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.totalDistributed")}</p>
                    <p className="text-2xl font-bold">1.2M TBURN</p>
                    <p className="text-xs text-muted-foreground">{t("adminTestnet.allTime")}</p>
                  </div>
                  <div className="p-4 border rounded-lg" data-testid="stat-today">
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.today")}</p>
                    <p className="text-2xl font-bold">24,700 TBURN</p>
                    <p className="text-xs text-green-500">247 {t("adminTestnet.requests")}</p>
                  </div>
                  <div className="p-4 border rounded-lg" data-testid="stat-unique-addresses">
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.uniqueAddresses")}</p>
                    <p className="text-2xl font-bold">8,456</p>
                    <p className="text-xs text-muted-foreground">{t("adminTestnet.allTime")}</p>
                  </div>
                  <div className="p-4 border rounded-lg" data-testid="stat-success-rate">
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.successRate")}</p>
                    <p className="text-2xl font-bold text-green-500">98.7%</p>
                    <Progress value={98.7} className="h-2 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminTestnet.testnetSettings")}</CardTitle>
                <CardDescription>{t("adminTestnet.configureTestnetParameters")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminTestnet.autoRestartOnFailure")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.autoRestartDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-auto-restart" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminTestnet.dailyBackups")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.dailyBackupsDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-daily-backups" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminTestnet.rateLimiting")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminTestnet.rateLimitingDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-rate-limiting" />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminTestnet.faucetDailyLimit")}</Label>
                    <Input type="number" defaultValue="500" data-testid="input-daily-limit" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTestnet.faucetRequestAmount")}</Label>
                    <Input type="number" defaultValue="100" data-testid="input-request-amount" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
