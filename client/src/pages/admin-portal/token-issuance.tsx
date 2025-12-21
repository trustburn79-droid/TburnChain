import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Coins, Plus, Flame, Pause, Play, Users, TrendingUp, 
  Shield, Brain, AlertTriangle, CheckCircle, FileText,
  RefreshCw, Download, Wifi, WifiOff, Eye, Calendar, Clock,
  Box, ShieldCheck, Zap, Hash, ExternalLink, Copy
} from "lucide-react";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";

interface Token {
  id: number | string;
  name: string;
  symbol: string;
  standard: string;
  totalSupply: string;
  circulatingSupply?: string;
  holders: number;
  status: string;
  aiEnabled?: boolean;
  // Extended fields for user-deployed tokens
  contractAddress?: string;
  deployerAddress?: string;
  deploymentTxHash?: string;
  deployedAt?: string;
  blockNumber?: number;
  decimals?: number;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  aiOptimizationEnabled?: boolean;
  quantumResistant?: boolean;
  mevProtection?: boolean;
  verified?: boolean;
  deploymentSource?: string;
  deploymentMode?: string;
  securityScore?: number;
  transactionCount?: number;
  volume24h?: number;
  isUserDeployed?: boolean;
}

interface SupplyStat {
  labelKey: string;
  value: string;
  unit: string;
}

interface RecentAction {
  id: number;
  action: string;
  token: string;
  amount: string;
  toKey: string;
  byKey: string;
  timestamp: string;
}

interface TokenData {
  tokens: Token[];
  supplyStats: SupplyStat[];
  recentActions: RecentAction[];
}

export default function AdminTokenIssuance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenToToggle, setTokenToToggle] = useState<Token | null>(null);
  const [activeTab, setActiveTab] = useState("tokens");
  const [selectedTokenForAction, setSelectedTokenForAction] = useState<Token | null>(null);

  const { data, isLoading, error, refetch } = useQuery<TokenData>({
    queryKey: ['/api/admin/tokens'],
    refetchInterval: 30000,
  });

  const tokens = data?.tokens || [];
  const supplyStats = data?.supplyStats || [];
  const recentActions = data?.recentActions || [];

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

        ws.onopen = () => {
          setWsConnected(true);
          reconnectAttempts = 0;
          // Subscribe to token issuance channel
          ws?.send(JSON.stringify({ type: 'subscribe', channel: 'token_issuance' }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'token_issuance_update' || message.type === 'subscribed') {
              if (message.type === 'token_issuance_update') {
                queryClient.invalidateQueries({ queryKey: ['/api/admin/tokens'] });
                setLastUpdate(new Date());
              }
            }
          } catch (e) {
            console.error('WebSocket message parse error:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          reconnectTimeout = setTimeout(connectWebSocket, delay);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const mintMutation = useMutation({
    mutationFn: async (data: { token: string; amount: string; recipient: string; reason: string }) => {
      const response = await apiRequest('POST', '/api/admin/tokens/mint', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("adminTokenIssuance.mintRequestSubmitted"),
        description: t("adminTokenIssuance.mintRequestSubmittedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tokens'] });
    },
  });

  const burnMutation = useMutation({
    mutationFn: async (data: { token: string; amount: string; reason: string }) => {
      const response = await apiRequest('POST', '/api/admin/tokens/burn', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("adminTokenIssuance.burnRequestSubmitted"),
        description: t("adminTokenIssuance.burnRequestSubmittedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tokens'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (data: { tokenId: number; action: 'pause' | 'resume' }) => {
      const response = await apiRequest('POST', `/api/admin/tokens/${data.tokenId}/${data.action}`);
      return response.json();
    },
    onSuccess: () => {
      setTokenToToggle(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tokens'] });
      toast({
        title: t("adminTokenIssuance.statusUpdated"),
        description: t("adminTokenIssuance.statusUpdatedDesc"),
      });
    },
  });

  const confirmToggleStatus = useCallback(() => {
    if (tokenToToggle) {
      toggleStatusMutation.mutate({
        tokenId: tokenToToggle.id,
        action: tokenToToggle.status === 'active' ? 'pause' : 'resume',
      });
    }
  }, [tokenToToggle, toggleStatusMutation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminTokenIssuance.refresh"),
        description: t("adminTokenIssuance.exportSuccessDesc"),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      tokens,
      supplyStats,
      recentActions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-issuance-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminTokenIssuance.exportSuccess"),
      description: t("adminTokenIssuance.exportSuccessDesc"),
    });
  }, [tokens, supplyStats, recentActions, toast, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6" data-testid="error-state">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("adminTokenIssuance.error.title")}</h2>
        <p className="text-muted-foreground mb-4">{t("adminTokenIssuance.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          {t("adminTokenIssuance.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminTokenIssuance.title")}</h1>
            <p className="text-muted-foreground">{t("adminTokenIssuance.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={wsConnected ? "default" : "secondary"} data-testid="badge-ws-status">
              {wsConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> {t("adminTokenIssuance.connected")}</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> {t("adminTokenIssuance.reconnecting")}</>
              )}
            </Badge>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminTokenIssuance.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminTokenIssuance.refreshing") : t("adminTokenIssuance.refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              {t("adminTokenIssuance.export")}
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-token">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("adminTokenIssuance.createToken")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="dialog-create-token">
                <DialogHeader>
                  <DialogTitle>{t("adminTokenIssuance.createNewToken")}</DialogTitle>
                  <DialogDescription>{t("adminTokenIssuance.deployNewToken")}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.tokenStandard")}</Label>
                    <Select defaultValue="tbc20">
                      <SelectTrigger data-testid="select-token-standard">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tbc20">TBC-20 (Fungible)</SelectItem>
                        <SelectItem value="tbc721">TBC-721 (NFT)</SelectItem>
                        <SelectItem value="tbc1155">TBC-1155 (Multi-Token)</SelectItem>
                        <SelectItem value="tbcai">TBC-AI (AI Managed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.tokenName")}</Label>
                    <Input placeholder="My Token" data-testid="input-token-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.symbol")}</Label>
                    <Input placeholder="MTK" data-testid="input-symbol" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.decimals")}</Label>
                    <Input type="number" defaultValue="18" data-testid="input-decimals" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.initialSupply")}</Label>
                    <Input type="number" placeholder="1000000" data-testid="input-initial-supply" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.maxSupply")}</Label>
                    <Input type="number" placeholder="10000000" data-testid="input-max-supply" />
                  </div>
                  <div className="col-span-2 space-y-4 pt-4 border-t">
                    <h4 className="font-medium">{t("adminTokenIssuance.aiFeatures")}</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t("adminTokenIssuance.aiBurnOptimization")}</p>
                        <p className="text-xs text-muted-foreground">{t("adminTokenIssuance.aiBurnOptimizationDesc")}</p>
                      </div>
                      <Switch data-testid="switch-ai-burn" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t("adminTokenIssuance.predictiveBalancing")}</p>
                        <p className="text-xs text-muted-foreground">{t("adminTokenIssuance.predictiveBalancingDesc")}</p>
                      </div>
                      <Switch data-testid="switch-predictive-balancing" />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-4 pt-4 border-t">
                    <h4 className="font-medium">{t("adminTokenIssuance.securityFeatures")}</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t("adminTokenIssuance.quantumResistance")}</p>
                        <p className="text-xs text-muted-foreground">{t("adminTokenIssuance.quantumResistanceDesc")}</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-quantum-resistance" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t("adminTokenIssuance.mevProtection")}</p>
                        <p className="text-xs text-muted-foreground">{t("adminTokenIssuance.mevProtectionDesc")}</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-mev-protection" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-create">
                    {t("adminTokenIssuance.cancel")}
                  </Button>
                  <Button data-testid="button-confirm-create">{t("adminTokenIssuance.createToken")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} data-testid={`card-supply-stat-skeleton-${index}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            supplyStats.map((stat, index) => (
              <Card key={index} data-testid={`card-supply-stat-${index}`}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{t(`adminTokenIssuance.supplyStats.${stat.labelKey}`)}</div>
                  <div className="text-2xl font-bold" data-testid={`text-supply-value-${index}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.unit}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tokens" data-testid="tab-tokens">
              <Coins className="w-4 h-4 mr-2" />
              {t("adminTokenIssuance.allTokens")}
            </TabsTrigger>
            <TabsTrigger value="mint" data-testid="tab-mint">
              <Plus className="w-4 h-4 mr-2" />
              {t("adminTokenIssuance.mint")}
            </TabsTrigger>
            <TabsTrigger value="burn" data-testid="tab-burn">
              <Flame className="w-4 h-4 mr-2" />
              {t("adminTokenIssuance.burn")}
            </TabsTrigger>
            <TabsTrigger value="holders" data-testid="tab-holders">
              <Users className="w-4 h-4 mr-2" />
              {t("adminTokenIssuance.holders")}
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <FileText className="w-4 h-4 mr-2" />
              {t("adminTokenIssuance.history")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens">
            <Card data-testid="card-token-list">
              <CardHeader>
                <CardTitle>{t("adminTokenIssuance.tokenList")}</CardTitle>
                <CardDescription>{t("adminTokenIssuance.tokensDeployed")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-tokens">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminTokenIssuance.token")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.standard")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.totalSupply")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.createdAt", "Created")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.holders")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.status")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.source", "Source")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens.map((token) => {
                        const isAiEnabled = token.aiEnabled || token.aiOptimizationEnabled;
                        const createdDate = token.deployedAt ? new Date(token.deployedAt) : null;
                        return (
                          <TableRow key={token.id} data-testid={`row-token-${token.id}`}>
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium" data-testid={`text-token-name-${token.id}`}>{token.name}</p>
                                  {token.verified && (
                                    <ShieldCheck className="w-3 h-3 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{token.symbol}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{token.standard}</Badge>
                            </TableCell>
                            <TableCell>{token.totalSupply}</TableCell>
                            <TableCell>
                              {createdDate ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span>{createdDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>{(token.holders || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={token.status === "active" ? "default" : "secondary"} data-testid={`badge-status-${token.id}`}>
                                {token.status === "active" ? (
                                  <><CheckCircle className="w-3 h-3 mr-1" /> {t("adminTokenIssuance.active")}</>
                                ) : (
                                  <><Pause className="w-3 h-3 mr-1" /> {t("adminTokenIssuance.paused")}</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {token.isUserDeployed || token.deploymentSource ? (
                                  <Badge variant="outline" className="text-xs">
                                    {token.deploymentSource === 'token-generator' ? t("adminTokenIssuance.sourceGenerator", "Generator") 
                                      : token.deploymentSource === 'token-factory' ? t("adminTokenIssuance.sourceFactory", "Factory")
                                      : token.deploymentSource === 'token-system' ? t("adminTokenIssuance.sourceSystem", "System")
                                      : t("adminTokenIssuance.sourcePlatform", "Platform")}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">{t("adminTokenIssuance.sourcePlatform", "Platform")}</Badge>
                                )}
                                {isAiEnabled && (
                                  <Brain className="w-3 h-3 text-purple-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => setSelectedToken(token)}
                                  data-testid={`button-view-${token.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => { setSelectedTokenForAction(token); setActiveTab("mint"); }}
                                  data-testid={`button-mint-${token.id}`}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => { setSelectedTokenForAction(token); setActiveTab("burn"); }}
                                  data-testid={`button-burn-${token.id}`}
                                >
                                  <Flame className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => setTokenToToggle(token)}
                                  disabled={toggleStatusMutation.isPending}
                                  data-testid={`button-toggle-${token.id}`}
                                >
                                  {token.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mint">
            <Card data-testid="card-mint">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  {t("adminTokenIssuance.mintTokens")}
                </CardTitle>
                <CardDescription>{t("adminTokenIssuance.mintTokensDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.selectToken")}</Label>
                    <Select>
                      <SelectTrigger data-testid="select-mint-token">
                        <SelectValue placeholder={t("adminTokenIssuance.chooseToken")} />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.id} value={token.symbol}>{token.name} ({token.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.amount")}</Label>
                    <Input type="number" placeholder={t("adminTokenIssuance.enterAmount")} data-testid="input-mint-amount" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.recipientAddress")}</Label>
                    <Input placeholder="0x..." data-testid="input-mint-recipient" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.reason")}</Label>
                    <Input placeholder={t("adminTokenIssuance.mintingReason")} data-testid="input-mint-reason" />
                  </div>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">{t("adminTokenIssuance.multiSigRequired")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("adminTokenIssuance.multiSigDesc")}
                  </p>
                </div>
                <Button className="w-full" disabled={mintMutation.isPending} data-testid="button-submit-mint">
                  <Shield className="w-4 h-4 mr-2" />
                  {t("adminTokenIssuance.submitMintRequest")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="burn">
            <Card data-testid="card-burn">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  {t("adminTokenIssuance.burnTokens")}
                </CardTitle>
                <CardDescription>{t("adminTokenIssuance.burnTokensDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.selectToken")}</Label>
                    <Select>
                      <SelectTrigger data-testid="select-burn-token">
                        <SelectValue placeholder={t("adminTokenIssuance.chooseToken")} />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.id} value={token.symbol}>{token.name} ({token.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTokenIssuance.amount")}</Label>
                    <Input type="number" placeholder={t("adminTokenIssuance.enterAmount")} data-testid="input-burn-amount" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>{t("adminTokenIssuance.reason")}</Label>
                    <Input placeholder={t("adminTokenIssuance.burningReason")} data-testid="input-burn-reason" />
                  </div>
                </div>
                <Button variant="destructive" className="w-full" disabled={burnMutation.isPending} data-testid="button-submit-burn">
                  <Flame className="w-4 h-4 mr-2" />
                  {t("adminTokenIssuance.submitBurnRequest")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holders">
            <Card data-testid="card-holders">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("adminTokenIssuance.holderAnalysis")}
                </CardTitle>
                <CardDescription>{t("adminTokenIssuance.holderAnalysisDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="stat-total-holders">
                    <div className="text-3xl font-bold">125,000</div>
                    <div className="text-sm text-muted-foreground">{t("adminTokenIssuance.totalHolders")}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="stat-gini">
                    <div className="text-3xl font-bold">0.42</div>
                    <div className="text-sm text-muted-foreground">{t("adminTokenIssuance.giniCoefficient")}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="stat-whale-wallets">
                    <div className="text-3xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">{t("adminTokenIssuance.whaleWallets")}</div>
                  </div>
                </div>
                <Table data-testid="table-holders">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminTokenIssuance.rank")}</TableHead>
                      <TableHead>{t("adminTokenIssuance.address")}</TableHead>
                      <TableHead>{t("adminTokenIssuance.balance")}</TableHead>
                      <TableHead>{t("adminTokenIssuance.percentage")}</TableHead>
                      <TableHead>{t("adminTokenIssuance.type")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow data-testid="row-holder-1">
                      <TableCell>1</TableCell>
                      <TableCell className="font-mono">0x1234...5678</TableCell>
                      <TableCell>500,000,000 TBURN</TableCell>
                      <TableCell>5.00%</TableCell>
                      <TableCell><Badge>{t("adminTokenIssuance.whale")}</Badge></TableCell>
                    </TableRow>
                    <TableRow data-testid="row-holder-2">
                      <TableCell>2</TableCell>
                      <TableCell className="font-mono">0x2345...6789</TableCell>
                      <TableCell>350,000,000 TBURN</TableCell>
                      <TableCell>3.50%</TableCell>
                      <TableCell><Badge>{t("adminTokenIssuance.whale")}</Badge></TableCell>
                    </TableRow>
                    <TableRow data-testid="row-holder-3">
                      <TableCell>3</TableCell>
                      <TableCell className="font-mono">0x3456...7890</TableCell>
                      <TableCell>280,000,000 TBURN</TableCell>
                      <TableCell>2.80%</TableCell>
                      <TableCell><Badge>{t("adminTokenIssuance.whale")}</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card data-testid="card-history">
              <CardHeader>
                <CardTitle>{t("adminTokenIssuance.actionHistory")}</CardTitle>
                <CardDescription>{t("adminTokenIssuance.recentOperations")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-history">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminTokenIssuance.action")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.token")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.amount")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.to")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.by")}</TableHead>
                        <TableHead>{t("adminTokenIssuance.timestamp")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActions.map((action) => (
                        <TableRow key={action.id} data-testid={`row-action-${action.id}`}>
                          <TableCell>
                            <Badge variant={action.action === "Mint" ? "default" : action.action === "Burn" ? "destructive" : "secondary"}>
                              {action.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{action.token}</TableCell>
                          <TableCell>{action.amount}</TableCell>
                          <TableCell className="font-mono text-sm">{t(`adminTokenIssuance.destinations.${action.toKey}`)}</TableCell>
                          <TableCell>{t(`adminTokenIssuance.sources.${action.byKey}`)}</TableCell>
                          <TableCell className="text-muted-foreground">{action.timestamp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DetailSheet
        open={!!selectedToken}
        onOpenChange={(open) => !open && setSelectedToken(null)}
        title={t("adminTokenIssuance.detail.title")}
        sections={selectedToken ? [
          {
            title: t("adminTokenIssuance.detail.overview"),
            fields: [
              { label: t("adminTokenIssuance.detail.tokenId"), value: String(selectedToken.id), copyable: true },
              { label: t("adminTokenIssuance.detail.name"), value: selectedToken.name },
              { label: t("adminTokenIssuance.detail.symbol"), value: selectedToken.symbol },
              { label: t("adminTokenIssuance.detail.standard"), value: selectedToken.standard, type: "badge" as const },
              { label: t("adminTokenIssuance.detail.status"), value: selectedToken.status, type: "badge" as const, badgeVariant: selectedToken.status === "active" ? "default" as const : "secondary" as const },
              { label: t("adminTokenIssuance.detail.verified"), value: selectedToken.verified ? t("adminTokenIssuance.verified") : t("adminTokenIssuance.unverified"), type: "badge" as const, badgeVariant: selectedToken.verified ? "default" as const : "secondary" as const },
            ],
          },
          // Deployment Info Section (only for user-deployed tokens)
          ...(selectedToken.contractAddress ? [{
            title: t("adminTokenIssuance.detail.deploymentInfo", "Deployment Information"),
            fields: [
              { label: t("adminTokenIssuance.detail.contractAddress", "Contract Address"), value: selectedToken.contractAddress || '-', copyable: true },
              { label: t("adminTokenIssuance.detail.deployerAddress", "Deployer Address"), value: selectedToken.deployerAddress || '-', copyable: true },
              { label: t("adminTokenIssuance.detail.deploymentTx", "Deployment TX"), value: selectedToken.deploymentTxHash ? `${selectedToken.deploymentTxHash.slice(0, 10)}...${selectedToken.deploymentTxHash.slice(-8)}` : '-', copyable: !!selectedToken.deploymentTxHash },
              { label: t("adminTokenIssuance.detail.blockNumber", "Block Number"), value: selectedToken.blockNumber ? `#${selectedToken.blockNumber.toLocaleString()}` : '-' },
              { label: t("adminTokenIssuance.detail.deployedAt", "Created At"), value: selectedToken.deployedAt ? new Date(selectedToken.deployedAt).toLocaleString('ko-KR', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-' },
              { label: t("adminTokenIssuance.detail.deploymentSource", "Deployment Source"), value: selectedToken.deploymentSource === 'token-generator' ? t("adminTokenIssuance.sourceGenerator", "Token Generator") : selectedToken.deploymentSource === 'token-factory' ? t("adminTokenIssuance.sourceFactory", "Token Factory") : selectedToken.deploymentSource === 'token-system' ? t("adminTokenIssuance.sourceSystem", "Token System") : t("adminTokenIssuance.sourcePlatform", "Platform"), type: "badge" as const },
              { label: t("adminTokenIssuance.detail.deploymentMode", "Deployment Mode"), value: selectedToken.deploymentMode === 'simulation' ? t("adminTokenIssuance.modeSimulation", "Simulation") : t("adminTokenIssuance.modeWallet", "Wallet"), type: "badge" as const, badgeVariant: selectedToken.deploymentMode === 'simulation' ? "secondary" as const : "default" as const },
            ],
          }] : []),
          {
            title: t("adminTokenIssuance.detail.supplyInfo"),
            fields: [
              { label: t("adminTokenIssuance.detail.totalSupply"), value: selectedToken.totalSupply },
              { label: t("adminTokenIssuance.detail.circulatingSupply"), value: selectedToken.circulatingSupply || selectedToken.totalSupply },
              { label: t("adminTokenIssuance.detail.decimals", "Decimals"), value: String(selectedToken.decimals ?? 18) },
              { label: t("adminTokenIssuance.detail.holders"), value: (selectedToken.holders || 0).toLocaleString() },
              { label: t("adminTokenIssuance.detail.transactionCount", "Transactions"), value: (selectedToken.transactionCount || 0).toLocaleString() },
            ],
          },
          {
            title: t("adminTokenIssuance.detail.features"),
            fields: [
              { label: t("adminTokenIssuance.detail.mintable", "Mintable"), value: selectedToken.mintable ? t("adminTokenIssuance.enabled") : t("adminTokenIssuance.disabled"), type: "badge" as const, badgeVariant: selectedToken.mintable ? "default" as const : "secondary" as const },
              { label: t("adminTokenIssuance.detail.burnable", "Burnable"), value: selectedToken.burnable ? t("adminTokenIssuance.enabled") : t("adminTokenIssuance.disabled"), type: "badge" as const, badgeVariant: selectedToken.burnable ? "default" as const : "secondary" as const },
              { label: t("adminTokenIssuance.detail.pausable", "Pausable"), value: selectedToken.pausable ? t("adminTokenIssuance.enabled") : t("adminTokenIssuance.disabled"), type: "badge" as const, badgeVariant: selectedToken.pausable ? "default" as const : "secondary" as const },
              { label: t("adminTokenIssuance.detail.aiEnabled"), value: (selectedToken.aiEnabled || selectedToken.aiOptimizationEnabled) ? t("adminTokenIssuance.enabled") : t("adminTokenIssuance.disabled"), type: "badge" as const, badgeVariant: (selectedToken.aiEnabled || selectedToken.aiOptimizationEnabled) ? "default" as const : "secondary" as const },
            ],
          },
          {
            title: t("adminTokenIssuance.detail.security", "Security Features"),
            fields: [
              { label: t("adminTokenIssuance.detail.quantumResistant", "Quantum Resistant"), value: selectedToken.quantumResistant ? t("adminTokenIssuance.enabled") : t("adminTokenIssuance.disabled"), type: "badge" as const, badgeVariant: selectedToken.quantumResistant ? "default" as const : "secondary" as const },
              { label: t("adminTokenIssuance.detail.mevProtection", "MEV Protection"), value: selectedToken.mevProtection ? t("adminTokenIssuance.enabled") : t("adminTokenIssuance.disabled"), type: "badge" as const, badgeVariant: selectedToken.mevProtection ? "default" as const : "secondary" as const },
              ...(selectedToken.securityScore ? [{ label: t("adminTokenIssuance.detail.securityScore", "Security Score"), value: `${selectedToken.securityScore}/100` }] : []),
            ],
          },
        ] : []}
      />

      <ConfirmationDialog
        open={!!tokenToToggle}
        onOpenChange={(open) => !open && setTokenToToggle(null)}
        title={tokenToToggle?.status === 'active' ? t("adminTokenIssuance.confirmPause.title") : t("adminTokenIssuance.confirmResume.title")}
        description={tokenToToggle?.status === 'active' 
          ? t("adminTokenIssuance.confirmPause.description", { name: tokenToToggle?.name, symbol: tokenToToggle?.symbol })
          : t("adminTokenIssuance.confirmResume.description", { name: tokenToToggle?.name, symbol: tokenToToggle?.symbol })
        }
        confirmText={tokenToToggle?.status === 'active' ? t("adminTokenIssuance.pause") : t("adminTokenIssuance.resume")}
        onConfirm={confirmToggleStatus}
        destructive={tokenToToggle?.status === 'active'}
        isLoading={toggleStatusMutation.isPending}
      />
    </ScrollArea>
  );
}
