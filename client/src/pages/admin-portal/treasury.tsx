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
  RefreshCw, Download, Wifi, WifiOff, AlertTriangle, Eye, XCircle,
  Users, Building, Landmark, Clock, Shield, Vote
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { 
  INVESTOR_ROUNDS, 
  FUND_USAGE, 
  DAO_TREASURY, 
  TOTAL_FUNDRAISING,
  INVESTOR_ROI_DATA
} from "@/lib/tokenomics-engine";
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

interface MultisigWallet {
  walletId: string;
  address: string;
  name: string;
  description: string;
  purpose: string;
  custodyMechanism: string;
  signaturesRequired: number;
  totalSigners: number;
  timelockHours: number;
  allocatedAmount: string;
  remainingAmount: string;
  distributedAmount: string;
  status: string;
  isEmergencyEnabled: boolean;
  executionCount: number;
  lastExecutionAt: string;
  lastReportQuarter: string;
}

interface CustodyTransaction {
  transactionId: string;
  walletId: string;
  transactionType: string;
  recipientAddress: string;
  recipientName: string;
  amount: string;
  amountUsd: string;
  status: string;
  approvalCount: number;
  requiredApprovals: number;
  purpose: string;
  justification?: string;
  proposedAt: string;
  proposedBy: string;
  timelockExpiresAt?: string;
  executedAt?: string;
  executedBy?: string;
  executedTxHash?: string;
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

  const { data: multisigWallets, isLoading: walletsLoading } = useQuery<MultisigWallet[]>({
    queryKey: ['/api/custody/multisig-wallets'],
    refetchInterval: 30000,
  });

  const { data: custodyTransactions, isLoading: txLoading } = useQuery<CustodyTransaction[]>({
    queryKey: ['/api/custody/transactions'],
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
            <TabsTrigger value="investors" data-testid="tab-investors">
              <Users className="w-4 h-4 mr-2" />
              {t("adminTreasury.investors", "투자자")}
            </TabsTrigger>
            <TabsTrigger value="fundUsage" data-testid="tab-fund-usage">
              <Building className="w-4 h-4 mr-2" />
              {t("adminTreasury.fundUsage", "자금 사용")}
            </TabsTrigger>
            <TabsTrigger value="daoTreasury" data-testid="tab-dao-treasury">
              <Landmark className="w-4 h-4 mr-2" />
              {t("adminTreasury.daoTreasury", "DAO 트레저리")}
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

          {/* 투자자 라운드 탭 */}
          <TabsContent value="investors">
            <div className="space-y-6">
              {/* 요약 카드들 */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="col-span-1 bg-gradient-to-br from-green-500/10 to-emerald-500/10" data-testid="card-total-raised">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("adminTreasury.totalRaised", "총 조달액")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-total-raised">${TOTAL_FUNDRAISING}M</div>
                    <div className="text-sm text-muted-foreground">{t("adminTreasury.usd", "USD")}</div>
                  </CardContent>
                </Card>
                {INVESTOR_ROUNDS.map((round) => (
                  <Card key={round.id} data-testid={`card-round-${round.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-muted-foreground">{round.name}</span>
                      </div>
                      <div className="text-2xl font-bold">${round.raised}M</div>
                      <div className="text-sm text-muted-foreground">@ ${round.price.toFixed(2)}/TBURN</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 투자자 라운드 상세 테이블 */}
                <Card data-testid="card-investor-rounds-detail">
                  <CardHeader>
                    <CardTitle>{t("adminTreasury.investorRounds", "투자자 라운드 상세")}</CardTitle>
                    <CardDescription>{t("adminTreasury.investorRoundsDesc", "각 라운드별 배분 및 조건")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table data-testid="table-investor-rounds">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminTreasury.round", "라운드")}</TableHead>
                          <TableHead>{t("adminTreasury.allocation", "배분")}</TableHead>
                          <TableHead>{t("adminTreasury.price", "가격")}</TableHead>
                          <TableHead>{t("adminTreasury.raised", "조달액")}</TableHead>
                          <TableHead>{t("adminTreasury.vestingInfo", "베스팅")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {INVESTOR_ROUNDS.map((round) => (
                          <TableRow key={round.id} data-testid={`row-investor-${round.id}`}>
                            <TableCell className="font-medium">
                              <Badge variant={round.id === 'seed' ? 'default' : round.id === 'private' ? 'secondary' : 'outline'}>
                                {round.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>{round.allocation}억 TBURN</div>
                              <div className="text-xs text-muted-foreground">{round.allocationPercent}%</div>
                            </TableCell>
                            <TableCell>${round.price.toFixed(2)}</TableCell>
                            <TableCell className="text-green-500 font-medium">${round.raised}M</TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>TGE: {round.tgePercent}%</div>
                                <div>Cliff: {round.cliffMonths}개월</div>
                                <div>Vesting: {round.vestingMonths}개월</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* 투자자 ROI 예측 */}
                <Card data-testid="card-investor-roi">
                  <CardHeader>
                    <CardTitle>{t("adminTreasury.investorROI", "투자자 ROI 예측")}</CardTitle>
                    <CardDescription>{t("adminTreasury.investorROIDesc", "중립 시나리오 기준 수익률")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table data-testid="table-investor-roi">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminTreasury.round", "라운드")}</TableHead>
                          <TableHead>{t("adminTreasury.entryPrice", "진입가")}</TableHead>
                          <TableHead>Y1 ROI</TableHead>
                          <TableHead>Y5 ROI</TableHead>
                          <TableHead>Y10 ROI</TableHead>
                          <TableHead>Y20 ROI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {INVESTOR_ROI_DATA.map((roi) => (
                          <TableRow key={roi.roundId} data-testid={`row-roi-${roi.roundId}`}>
                            <TableCell className="font-medium">{roi.roundId.toUpperCase()}</TableCell>
                            <TableCell>${roi.entryPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-green-500">{roi.y1.roi.toFixed(1)}x</TableCell>
                            <TableCell className="text-green-500">{roi.y5.roi.toFixed(1)}x</TableCell>
                            <TableCell className="text-green-500">{roi.y10.roi.toFixed(1)}x</TableCell>
                            <TableCell className="text-green-500 font-bold">{roi.y20.roi.toFixed(1)}x</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 자금 사용 계획 탭 */}
          <TabsContent value="fundUsage">
            <div className="space-y-6">
              {/* 요약 */}
              <div className="grid grid-cols-5 gap-4">
                {FUND_USAGE.map((fund, idx) => {
                  const colors = ['blue', 'purple', 'orange', 'red', 'green'];
                  const color = colors[idx % colors.length];
                  return (
                    <Card key={fund.category} data-testid={`card-fund-${idx}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className={`w-5 h-5 text-${color}-500`} />
                          <span className="text-sm text-muted-foreground">{fund.category}</span>
                        </div>
                        <div className="text-2xl font-bold">${fund.amount}M</div>
                        <div className="text-sm text-muted-foreground">{fund.percentage}%</div>
                        <Progress value={fund.percentage} className="mt-2" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 자금 사용 파이 차트 */}
                <Card data-testid="card-fund-usage-chart">
                  <CardHeader>
                    <CardTitle>{t("adminTreasury.fundAllocation", "자금 배분")}</CardTitle>
                    <CardDescription>{t("adminTreasury.totalFund", "총 $230M 자금 사용 계획")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80" data-testid="chart-fund-usage">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={FUND_USAGE.map(f => ({ name: f.category, value: f.amount }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {FUND_USAGE.map((_, index) => {
                              const COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#22c55e'];
                              return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                            })}
                          </Pie>
                          <Tooltip formatter={(value) => [`$${value}M`, '금액']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* 세부 사용 계획 */}
                <Card data-testid="card-fund-usage-detail">
                  <CardHeader>
                    <CardTitle>{t("adminTreasury.fundDetail", "세부 사용 계획")}</CardTitle>
                    <CardDescription>{t("adminTreasury.categoryBreakdown", "카테고리별 세부 내역")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {FUND_USAGE.map((fund, idx) => (
                          <div key={fund.category} className="space-y-2" data-testid={`fund-detail-${idx}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{fund.category}</span>
                              <span className="text-green-500 font-bold">${fund.amount}M</span>
                            </div>
                            <div className="pl-4 space-y-1">
                              {fund.subcategories.map((sub, subIdx) => (
                                <div key={subIdx} className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>{sub.name}</span>
                                  <span>${sub.amount}M</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* DAO 트레저리 탭 */}
          <TabsContent value="daoTreasury">
            <div className="space-y-6">
              {/* 요약 카드 */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="col-span-1 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" data-testid="card-dao-total">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Landmark className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">{t("adminTreasury.daoTotal", "DAO 트레저리")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-dao-total">{DAO_TREASURY.totalAmount}억 TBURN</div>
                    <div className="text-sm text-muted-foreground">{t("adminTreasury.communityControlled", "커뮤니티 관리")}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-dao-limit-quarter">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-muted-foreground">{t("adminTreasury.quarterlyLimit", "분기별 한도")}</span>
                    </div>
                    <div className="text-2xl font-bold">{DAO_TREASURY.usageLimits.perQuarter}억 TBURN</div>
                    <div className="text-sm text-muted-foreground">{t("adminTreasury.maxPerQuarter", "최대 사용")}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-dao-limit-year">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-muted-foreground">{t("adminTreasury.yearlyLimit", "연간 한도")}</span>
                    </div>
                    <div className="text-2xl font-bold">{DAO_TREASURY.usageLimits.perYear}억 TBURN</div>
                    <div className="text-sm text-muted-foreground">{t("adminTreasury.maxPerYear", "최대 사용")}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-dao-proposal-threshold">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Vote className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("adminTreasury.proposalThreshold", "제안 요건")}</span>
                    </div>
                    <div className="text-2xl font-bold">{DAO_TREASURY.governance.proposalThreshold.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">TBURN</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 거버넌스 규칙 */}
                <Card data-testid="card-dao-governance">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {t("adminTreasury.governanceRules", "거버넌스 규칙")}
                    </CardTitle>
                    <CardDescription>{t("adminTreasury.governanceDesc", "DAO 투표 및 승인 기준")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg" data-testid="governance-general">
                        <div className="text-sm text-muted-foreground mb-2">{t("adminTreasury.generalProposals", "일반 제안")}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>정족수:</span>
                            <span className="font-medium">{DAO_TREASURY.governance.quorumGeneral}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>승인:</span>
                            <span className="font-medium">{DAO_TREASURY.governance.approvalGeneral}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg" data-testid="governance-important">
                        <div className="text-sm text-muted-foreground mb-2">{t("adminTreasury.importantProposals", "중요 제안")}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>정족수:</span>
                            <span className="font-medium">{DAO_TREASURY.governance.quorumImportant}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>승인:</span>
                            <span className="font-medium">{DAO_TREASURY.governance.approvalImportant}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="p-3 bg-muted/50 rounded-lg text-center" data-testid="governance-voting-period">
                        <div className="text-xs text-muted-foreground">{t("adminTreasury.votingPeriod", "투표 기간")}</div>
                        <div className="text-lg font-bold">{DAO_TREASURY.governance.votingPeriodDays}일</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center" data-testid="governance-discussion-period">
                        <div className="text-xs text-muted-foreground">{t("adminTreasury.discussionPeriod", "토론 기간")}</div>
                        <div className="text-lg font-bold">{DAO_TREASURY.governance.discussionPeriodDays}일</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center" data-testid="governance-validator-weight">
                        <div className="text-xs text-muted-foreground">{t("adminTreasury.validatorWeight", "검증자 가중치")}</div>
                        <div className="text-lg font-bold">{DAO_TREASURY.governance.validatorWeight}x</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* DAO 자금 배분 */}
                <Card data-testid="card-dao-allocations">
                  <CardHeader>
                    <CardTitle>{t("adminTreasury.daoAllocations", "DAO 자금 용도")}</CardTitle>
                    <CardDescription>{t("adminTreasury.daoAllocationsDesc", "커뮤니티 승인 사용처")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table data-testid="table-dao-allocations">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminTreasury.category", "카테고리")}</TableHead>
                          <TableHead>{t("adminTreasury.amount", "금액")}</TableHead>
                          <TableHead>{t("adminTreasury.description", "설명")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {DAO_TREASURY.allocations.map((alloc, idx) => (
                          <TableRow key={idx} data-testid={`row-dao-alloc-${idx}`}>
                            <TableCell className="font-medium">{alloc.category}</TableCell>
                            <TableCell className="text-purple-500 font-medium">{alloc.amount}억</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{alloc.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
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
            <div className="space-y-6">
              {/* Custody Wallets */}
              <Card data-testid="card-custody-wallets">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        멀티시그 커스터디 지갑
                      </CardTitle>
                      <CardDescription>재단 관리 토큰 커스터디 지갑 현황</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-500/10 text-blue-500">
                        <Key className="h-3 w-3 mr-1" />
                        3/5 서명
                      </Badge>
                      <Badge className="bg-purple-500/10 text-purple-500">
                        <Clock className="h-3 w-3 mr-1" />
                        7일 타임락
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {walletsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {multisigWallets?.map((wallet) => (
                        <div 
                          key={wallet.walletId}
                          className="p-4 rounded-lg border bg-card hover-elevate"
                          data-testid={`wallet-${wallet.walletId}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{wallet.name}</span>
                            <Badge className={wallet.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                              {wallet.status === 'active' ? '활성' : wallet.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{wallet.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                              <span className="text-muted-foreground">할당량</span>
                              <div className="font-mono font-medium">{(parseFloat(wallet.allocatedAmount) / 1e9).toFixed(2)}B</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">잔여</span>
                              <div className="font-mono font-medium text-primary">{(parseFloat(wallet.remainingAmount) / 1e9).toFixed(2)}B</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">서명 요구</span>
                              <div className="font-medium">{wallet.signaturesRequired}/{wallet.totalSigners}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">타임락</span>
                              <div className="font-medium">{wallet.timelockHours}시간</div>
                            </div>
                          </div>
                          <Progress 
                            value={(parseFloat(wallet.distributedAmount) / parseFloat(wallet.allocatedAmount)) * 100}
                            className="h-1.5"
                          />
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>실행: {wallet.executionCount}건</span>
                            <span>배분률: {((parseFloat(wallet.distributedAmount) / parseFloat(wallet.allocatedAmount)) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custody Transactions */}
              <Card data-testid="card-custody-transactions">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    커스터디 트랜잭션
                  </CardTitle>
                  <CardDescription>멀티시그 승인 대기 및 완료된 트랜잭션</CardDescription>
                </CardHeader>
                <CardContent>
                  {txLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table data-testid="table-custody-transactions">
                      <TableHeader>
                        <TableRow>
                          <TableHead>유형</TableHead>
                          <TableHead>수신자</TableHead>
                          <TableHead>금액</TableHead>
                          <TableHead>승인</TableHead>
                          <TableHead>상태</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {custodyTransactions?.map((tx) => (
                          <TableRow key={tx.transactionId} data-testid={`row-custody-tx-${tx.transactionId}`}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {tx.transactionType === 'grant_disbursement' ? '그랜트' : 
                                 tx.transactionType === 'partnership_payment' ? '파트너십' : 
                                 tx.transactionType === 'marketing_spend' ? '마케팅' : tx.transactionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{tx.recipientName}</div>
                              <div className="text-xs text-muted-foreground font-mono">{tx.recipientAddress.substring(0, 20)}...</div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {(parseFloat(tx.amount) / 1e6).toFixed(2)}M
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {tx.approvalCount}/{tx.requiredApprovals}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                tx.status === 'executed' ? 'bg-green-500/10 text-green-500' :
                                tx.status === 'approved' ? 'bg-blue-500/10 text-blue-500' :
                                tx.status === 'pending_approval' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-red-500/10 text-red-500'
                              }>
                                {tx.status === 'executed' ? '실행 완료' :
                                 tx.status === 'approved' ? '승인 완료' :
                                 tx.status === 'pending_approval' ? '승인 대기' :
                                 tx.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Legacy Signers Section */}
              <Card data-testid="card-multisig">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
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
            </div>
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
