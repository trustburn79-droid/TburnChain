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
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  PiggyBank, FileText, Lock, Key, Send, History, DollarSign,
  RefreshCw, Download, Wifi, WifiOff, AlertTriangle, Eye, XCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { apiRequest } from "@/lib/queryClient";

interface TreasuryStats {
  totalBalance: string;
  usdValue: string;
  monthlyIncome: string;
  monthlyExpense: string;
  netChange: string;
}

interface PoolBalance {
  name: string;
  balance: string;
  percentage: number;
  color: string;
}

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: string;
  timestamp: string;
  status: string;
}

interface GrowthData {
  month: string;
  balance: number;
}

interface MultiSigSigner {
  address: string;
  name: string;
  signed: boolean;
}

interface TreasuryData {
  stats: TreasuryStats;
  pools: PoolBalance[];
  transactions: Transaction[];
  growthData: GrowthData[];
  signers: MultiSigSigner[];
}

export default function AdminTreasury() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToCancel, setTransactionToCancel] = useState<Transaction | null>(null);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [transferData, setTransferData] = useState<{ from: string; to: string; amount: string } | null>(null);

  const { data, isLoading, error, refetch } = useQuery<TreasuryData>({
    queryKey: ['/api/admin/treasury'],
    refetchInterval: 30000,
  });

  const treasuryStats = data?.stats || {
    totalBalance: "0",
    usdValue: "$0",
    monthlyIncome: "0",
    monthlyExpense: "0",
    netChange: "+0",
  };
  const poolBalances = data?.pools || [];
  const transactions = data?.transactions || [];
  const growthData = data?.growthData || [];
  const multiSigSigners = data?.signers || [];

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
          ws?.send(JSON.stringify({ type: 'subscribe', channel: 'treasury' }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'treasury_update' || message.type === 'subscribed') {
              if (message.type === 'treasury_update') {
                queryClient.invalidateQueries({ queryKey: ['/api/admin/treasury'] });
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

  const transferMutation = useMutation({
    mutationFn: async (data: { fromPool: string; to: string; amount: string; reason: string }) => {
      const response = await apiRequest('POST', '/api/admin/treasury/transfer', data);
      return response.json();
    },
    onSuccess: () => {
      setShowTransferConfirm(false);
      setTransferData(null);
      toast({
        title: t("adminTreasury.transferSubmitted"),
        description: t("adminTreasury.transferSubmittedDesc"),
      });
      setTransferDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/treasury'] });
    },
  });

  const cancelTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await apiRequest('POST', `/api/admin/treasury/transactions/${transactionId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      setTransactionToCancel(null);
      toast({
        title: t("adminTreasury.transactionCancelled"),
        description: t("adminTreasury.transactionCancelledDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/treasury'] });
    },
  });

  const confirmCancelTransaction = useCallback(() => {
    if (transactionToCancel) {
      cancelTransactionMutation.mutate(transactionToCancel.id);
    }
  }, [transactionToCancel, cancelTransactionMutation]);

  const confirmTransfer = useCallback(() => {
    if (transferData) {
      transferMutation.mutate({
        fromPool: transferData.from,
        to: transferData.to,
        amount: transferData.amount,
        reason: "Admin transfer",
      });
    }
  }, [transferData, transferMutation]);

  const initiateTransfer = useCallback((from: string, to: string, amount: string) => {
    setTransferData({ from, to, amount });
    setShowTransferConfirm(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminTreasury.refresh"),
        description: t("adminTreasury.transferSubmittedDesc"),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      treasuryStats,
      poolBalances,
      transactions,
      growthData,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treasury-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminTreasury.export"),
      description: t("adminTreasury.transferSubmittedDesc"),
    });
  }, [treasuryStats, poolBalances, transactions, growthData, toast, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6" data-testid="error-state">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("adminTreasury.error.title")}</h2>
        <p className="text-muted-foreground mb-4">{t("adminTreasury.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          {t("adminTreasury.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminTreasury.title")}</h1>
            <p className="text-muted-foreground">{t("adminTreasury.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={wsConnected ? "default" : "secondary"} data-testid="badge-ws-status">
              {wsConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> {t("adminTreasury.connected")}</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> {t("adminTreasury.reconnecting")}</>
              )}
            </Badge>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminTreasury.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminTreasury.refreshing") : t("adminTreasury.refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              {t("adminTreasury.export")}
            </Button>
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-transfer">
                  <Send className="w-4 h-4 mr-2" />
                  {t("adminTreasury.transferFunds")}
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-transfer">
                <DialogHeader>
                  <DialogTitle>{t("adminTreasury.transferFundsDialog")}</DialogTitle>
                  <DialogDescription>{t("adminTreasury.multiSigRequired")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("adminTreasury.fromPool")}</Label>
                    <Select>
                      <SelectTrigger data-testid="select-from-pool">
                        <SelectValue placeholder={t("adminTreasury.selectSource")} />
                      </SelectTrigger>
                      <SelectContent>
                        {poolBalances.map((pool) => (
                          <SelectItem key={pool.name} value={pool.name}>{pool.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTreasury.toAddress")}</Label>
                    <Input placeholder={t("adminTreasury.poolOrWalletAddress")} data-testid="input-to-address" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTreasury.amount")}</Label>
                    <Input type="number" placeholder="0.00" data-testid="input-transfer-amount" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTreasury.reason")}</Label>
                    <Input placeholder={t("adminTreasury.transferReason")} data-testid="input-transfer-reason" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTransferDialogOpen(false)} data-testid="button-cancel-transfer">
                    {t("adminTreasury.cancel")}
                  </Button>
                  <Button 
                    onClick={() => transferMutation.mutate({ fromPool: '', to: '', amount: '', reason: '' })}
                    disabled={transferMutation.isPending}
                    data-testid="button-submit-transfer"
                  >
                    {t("adminTreasury.submitForApproval")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className={index === 0 ? "col-span-2" : ""} data-testid={`card-stat-skeleton-${index}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="col-span-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10" data-testid="card-total-balance">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{t("adminTreasury.totalBalance")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-total-balance">{treasuryStats.totalBalance}</div>
                  <div className="text-sm text-muted-foreground">TBURN</div>
                  <div className="text-lg text-muted-foreground mt-1" data-testid="text-usd-value">{treasuryStats.usdValue}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-monthly-income">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t("adminTreasury.monthlyIncome")}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500" data-testid="text-monthly-income">+{treasuryStats.monthlyIncome}</div>
                  <div className="text-sm text-muted-foreground">TBURN</div>
                </CardContent>
              </Card>
              <Card data-testid="card-monthly-expense">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-muted-foreground">{t("adminTreasury.monthlyExpense")}</span>
                  </div>
                  <div className="text-2xl font-bold text-red-500" data-testid="text-monthly-expense">-{treasuryStats.monthlyExpense}</div>
                  <div className="text-sm text-muted-foreground">TBURN</div>
                </CardContent>
              </Card>
              <Card data-testid="card-net-change">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t("adminTreasury.netChange")}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500" data-testid="text-net-change">{treasuryStats.netChange}</div>
                  <div className="text-sm text-muted-foreground">TBURN</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2" data-testid="card-treasury-growth">
            <CardHeader>
              <CardTitle>{t("adminTreasury.treasuryGrowth")}</CardTitle>
              <CardDescription>{t("adminTreasury.monthlyBalanceTrend")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64" data-testid="chart-treasury-growth">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[200, 260]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-pool-allocation">
            <CardHeader>
              <CardTitle>{t("adminTreasury.poolAllocation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : (
                poolBalances.map((pool, index) => (
                  <div key={index} className="space-y-2" data-testid={`pool-allocation-${index}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{pool.name}</span>
                      <span className="font-medium">{pool.percentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={pool.percentage} className="flex-1" />
                    </div>
                    <div className="text-xs text-muted-foreground">{pool.balance} TBURN</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <History className="w-4 h-4 mr-2" />
              {t("adminTreasury.transactions")}
            </TabsTrigger>
            <TabsTrigger value="budget" data-testid="tab-budget">
              <PiggyBank className="w-4 h-4 mr-2" />
              {t("adminTreasury.budget")}
            </TabsTrigger>
            <TabsTrigger value="multisig" data-testid="tab-multisig">
              <Key className="w-4 h-4 mr-2" />
              {t("adminTreasury.multiSig")}
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="w-4 h-4 mr-2" />
              {t("adminTreasury.reports")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card data-testid="card-recent-transactions">
              <CardHeader>
                <CardTitle>{t("adminTreasury.recentTransactions")}</CardTitle>
                <CardDescription>{t("adminTreasury.treasuryIncomeExpense")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-transactions">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminTreasury.typeColumn")}</TableHead>
                        <TableHead>{t("adminTreasury.category")}</TableHead>
                        <TableHead>{t("adminTreasury.amount")}</TableHead>
                        <TableHead>{t("adminTreasury.timestamp")}</TableHead>
                        <TableHead>{t("adminTreasury.status")}</TableHead>
                        <TableHead>{t("adminTreasury.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                          <TableCell>
                            <Badge variant={tx.type === "income" ? "default" : "destructive"}>
                              {tx.type === "income" ? (
                                <><ArrowUpRight className="w-3 h-3 mr-1" /> {t("adminTreasury.income")}</>
                              ) : (
                                <><ArrowDownRight className="w-3 h-3 mr-1" /> {t("adminTreasury.expense")}</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{tx.category}</TableCell>
                          <TableCell className={tx.type === "income" ? "text-green-500" : "text-red-500"}>
                            {tx.type === "income" ? "+" : "-"}{tx.amount} TBURN
                          </TableCell>
                          <TableCell className="text-muted-foreground">{tx.timestamp}</TableCell>
                          <TableCell>
                            <Badge variant={tx.status === "completed" ? "outline" : "secondary"}>
                              {tx.status === "completed" ? t("adminTreasury.completed") : t("adminTreasury.pending")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => setSelectedTransaction(tx)}
                                data-testid={`button-view-transaction-${tx.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {tx.status === "pending" && (
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => setTransactionToCancel(tx)}
                                  disabled={cancelTransactionMutation.isPending}
                                  data-testid={`button-cancel-transaction-${tx.id}`}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <div className="grid grid-cols-2 gap-4">
              <Card data-testid="card-annual-budget">
                <CardHeader>
                  <CardTitle>{t("adminTreasury.annualBudget")}</CardTitle>
                  <CardDescription>{t("adminTreasury.budgetAllocationSpending")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3" data-testid="budget-development">
                    <div className="flex items-center justify-between">
                      <span>{t("adminTreasury.development")}</span>
                      <span className="font-medium">$2,000,000</span>
                    </div>
                    <Progress value={65} />
                    <div className="text-xs text-muted-foreground">65% {t("adminTreasury.utilized")} ($1,300,000)</div>
                  </div>
                  <div className="space-y-3" data-testid="budget-marketing">
                    <div className="flex items-center justify-between">
                      <span>{t("adminTreasury.marketing")}</span>
                      <span className="font-medium">$1,000,000</span>
                    </div>
                    <Progress value={45} />
                    <div className="text-xs text-muted-foreground">45% {t("adminTreasury.utilized")} ($450,000)</div>
                  </div>
                  <div className="space-y-3" data-testid="budget-operations">
                    <div className="flex items-center justify-between">
                      <span>{t("adminTreasury.operations")}</span>
                      <span className="font-medium">$500,000</span>
                    </div>
                    <Progress value={80} />
                    <div className="text-xs text-muted-foreground">80% {t("adminTreasury.utilized")} ($400,000)</div>
                  </div>
                  <div className="space-y-3" data-testid="budget-community">
                    <div className="flex items-center justify-between">
                      <span>Community</span>
                      <span className="font-medium">$300,000</span>
                    </div>
                    <Progress value={30} />
                    <div className="text-xs text-muted-foreground">30% {t("adminTreasury.utilized")} ($90,000)</div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-budget-overview">
                <CardHeader>
                  <CardTitle>{t("adminTreasury.budgetOverview")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="stat-total-budget">
                      <div className="text-sm text-muted-foreground">{t("adminTreasury.totalBudget")}</div>
                      <div className="text-2xl font-bold">$3.8M</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="stat-spent">
                      <div className="text-sm text-muted-foreground">{t("adminTreasury.spent")}</div>
                      <div className="text-2xl font-bold">$2.24M</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="stat-remaining">
                      <div className="text-sm text-muted-foreground">{t("adminTreasury.remaining")}</div>
                      <div className="text-2xl font-bold text-green-500">$1.56M</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="stat-utilization">
                      <div className="text-sm text-muted-foreground">{t("adminTreasury.utilization")}</div>
                      <div className="text-2xl font-bold">59%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="multisig">
            <Card data-testid="card-multisig">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t("adminTreasury.multiSigWallet")}
                </CardTitle>
                <CardDescription>{t("adminTreasury.multiSigDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <Table data-testid="table-signers">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminTreasury.signer")}</TableHead>
                          <TableHead>{t("adminTreasury.address")}</TableHead>
                          <TableHead>{t("adminTreasury.status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {multiSigSigners.map((signer, index) => (
                          <TableRow key={index} data-testid={`row-signer-${index}`}>
                            <TableCell className="font-medium">{signer.name}</TableCell>
                            <TableCell className="font-mono">{signer.address}</TableCell>
                            <TableCell>
                              {signer.signed ? (
                                <Badge className="bg-green-500">{t("adminTreasury.signed")}</Badge>
                              ) : (
                                <Badge variant="outline">{t("adminTreasury.pendingStatus")}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg" data-testid="pending-transactions-info">
                      <h4 className="font-medium mb-2">{t("adminTreasury.pendingTransactions")}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Transfer 7,500,000 TBURN to Development Fund</span>
                        <Badge variant="outline">2/3 {t("adminTreasury.signatures")}</Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card data-testid="card-financial-reports">
              <CardHeader>
                <CardTitle>{t("adminTreasury.financialReports")}</CardTitle>
                <CardDescription>{t("adminTreasury.generateReports")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col" data-testid="button-monthly-report">
                    <FileText className="w-8 h-8 mb-2" />
                    {t("adminTreasury.monthlyReport")}
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" data-testid="button-quarterly-report">
                    <FileText className="w-8 h-8 mb-2" />
                    {t("adminTreasury.quarterlyReport")}
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" data-testid="button-annual-report">
                    <FileText className="w-8 h-8 mb-2" />
                    {t("adminTreasury.annualReport")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DetailSheet
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
        title={t("adminTreasury.detail.title")}
        sections={selectedTransaction ? [
          {
            title: t("adminTreasury.detail.overview"),
            fields: [
              { label: t("adminTreasury.detail.transactionId"), value: String(selectedTransaction.id), copyable: true },
              { label: t("adminTreasury.detail.type"), value: selectedTransaction.type, type: "badge" as const, badgeVariant: selectedTransaction.type === "income" ? "default" as const : "destructive" as const },
              { label: t("adminTreasury.detail.category"), value: selectedTransaction.category },
              { label: t("adminTreasury.detail.status"), value: selectedTransaction.status, type: "badge" as const, badgeVariant: selectedTransaction.status === "completed" ? "default" as const : "secondary" as const },
            ],
          },
          {
            title: t("adminTreasury.detail.transaction"),
            fields: [
              { label: t("adminTreasury.detail.amount"), value: `${selectedTransaction.amount} TBURN` },
              { label: t("adminTreasury.detail.timestamp"), value: selectedTransaction.timestamp },
            ],
          },
        ] : []}
      />

      <ConfirmationDialog
        open={!!transactionToCancel}
        onOpenChange={(open) => !open && setTransactionToCancel(null)}
        title={t("adminTreasury.confirmCancel.title")}
        description={t("adminTreasury.confirmCancel.description", { 
          amount: transactionToCancel?.amount,
          category: transactionToCancel?.category 
        })}
        confirmText={t("adminTreasury.cancel")}
        onConfirm={confirmCancelTransaction}
        destructive
        isLoading={cancelTransactionMutation.isPending}
      />

      <ConfirmationDialog
        open={showTransferConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowTransferConfirm(false);
            setTransferData(null);
          }
        }}
        title={t("adminTreasury.confirmTransfer.title")}
        description={transferData 
          ? t("adminTreasury.confirmTransfer.description", { 
              from: transferData.from,
              to: transferData.to,
              amount: transferData.amount 
            })
          : ""
        }
        confirmText={t("adminTreasury.transfer")}
        onConfirm={confirmTransfer}
        isLoading={transferMutation.isPending}
      />
    </ScrollArea>
  );
}
