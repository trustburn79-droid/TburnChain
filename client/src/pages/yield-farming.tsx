import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet,
  BarChart3,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  AlertCircle,
  CheckCircle,
  Shield,
  Coins,
  DollarSign,
  Percent,
  Plus,
  Minus,
  PiggyBank,
  Sprout,
  Lock,
  Timer,
  Target,
  Layers,
  Bot,
  Sparkles,
  History,
  Gift,
  Loader2
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { WalletRequiredBanner } from "@/components/require-wallet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface YieldVault {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  contractAddress: string;
  underlyingAsset: string;
  underlyingSymbol: string;
  vaultType: string;
  strategyType: string;
  riskLevel: string;
  totalDeposited: string;
  totalShares: string;
  sharePrice: string;
  tvlUsd: string;
  baseApy: number;
  boostApy: number;
  rewardApy: number;
  totalApy: number;
  depositFee: number;
  withdrawalFee: number;
  performanceFee: number;
  managementFee: number;
  depositCap: string | null;
  minDeposit: string;
  dexPoolId: string | null;
  lendingMarketId: string | null;
  aiOptimized: boolean;
  aiStrategyScore: number;
  aiRiskScore: number;
  status: string;
  totalDepositors: number;
  deposits24h: string;
  withdrawals24h: string;
  harvestCount: number;
  lastHarvestAt: string | null;
}

interface YieldPosition {
  id: string;
  vaultId: string;
  userAddress: string;
  depositedAmount: string;
  shares: string;
  currentValue: string;
  currentValueUsd: string;
  totalProfit: string;
  unrealizedProfit: string;
  realizedProfit: string;
  pendingRewards: string;
  claimedRewards: string;
  boostMultiplier: number;
  isLocked: boolean;
  lockEndTime: string | null;
  lockDurationDays: number;
  status: string;
}

interface YieldStats {
  totalTvlUsd: string;
  totalVaults: number;
  activeVaults: number;
  totalUsers: number;
  avgVaultApy: number;
  topVaultApy: number;
  totalProfitGenerated: string;
  deposits24h: string;
  withdrawals24h: string;
}

interface YieldHarvest {
  id: string;
  vaultId: string;
  harvestType: string;
  harvestedAmount: string;
  compoundedAmount: string;
  distributedAmount: string;
  performanceFeeTaken: string;
  gasUsed: string;
  gasPriceEmb: number;
  txHash: string;
  harvestingBot: string;
  strategyProfit: string;
  status: string;
  timestamp: string;
}

interface YieldTransaction {
  id: string;
  vaultId: string;
  userAddress: string;
  type: string;
  amount: string;
  shares: string;
  sharePrice: string;
  valueUsd: string;
  fee: string;
  txHash: string;
  status: string;
  timestamp: string;
}

function formatWeiToToken(weiStr: string, decimals: number = 18): string {
  try {
    const wei = BigInt(weiStr || "0");
    const divisor = BigInt(10 ** decimals);
    const whole = wei / divisor;
    const remainder = wei % divisor;
    const decimal = remainder.toString().padStart(decimals, '0').slice(0, 4);
    return `${whole.toLocaleString()}.${decimal}`;
  } catch {
    return "0.0000";
  }
}

function formatUsd(value: string): string {
  try {
    const num = parseFloat(value) / 1e18;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  } catch {
    return "$0.00";
  }
}

function formatApy(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

const riskColors: Record<string, string> = {
  low: "bg-green-600",
  medium: "bg-yellow-600",
  high: "bg-orange-600",
  degen: "bg-red-600",
};

const getVaultTypeLabel = (t: (key: string) => string, vaultType: string): string => {
  const labels: Record<string, string> = {
    auto_compound: t("yieldFarming.vaultTypes.autoCompound"),
    single_asset: t("yieldFarming.vaultTypes.singleAsset"),
    lp_farm: t("yieldFarming.vaultTypes.lpFarm"),
    leverage: t("yieldFarming.vaultTypes.leverage"),
    delta_neutral: t("yieldFarming.vaultTypes.deltaNeutral"),
  };
  return labels[vaultType] || vaultType;
};

export default function YieldFarming() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, isCorrectNetwork, balance } = useWeb3();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVault, setSelectedVault] = useState<YieldVault | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawShares, setWithdrawShares] = useState("");
  const [lockDays, setLockDays] = useState("0");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<YieldPosition | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userAddress = "0xTBURNEnterprise0001234567890abcdef";

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<YieldStats>({
    queryKey: ["/api/yield/stats"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: vaults, isLoading: vaultsLoading, refetch: refetchVaults } = useQuery<YieldVault[]>({
    queryKey: ["/api/yield/vaults/active"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = useQuery<YieldPosition[]>({
    queryKey: ["/api/yield/positions", userAddress],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: harvests, isLoading: harvestsLoading, refetch: refetchHarvests } = useQuery<YieldHarvest[]>({
    queryKey: ["/api/yield/harvests/recent"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<YieldTransaction[]>({
    queryKey: ["/api/yield/transactions/recent"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchVaults(),
        refetchPositions(),
        refetchHarvests(),
        refetchTransactions(),
      ]);
      toast({
        title: t("yieldFarming.refreshSuccess"),
        description: t("yieldFarming.refreshSuccessDesc"),
      });
    } catch (error) {
      toast({
        title: t("yieldFarming.refreshError"),
        description: t("yieldFarming.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchStats, refetchVaults, refetchPositions, refetchHarvests, refetchTransactions, toast, t]);

  const depositMutation = useMutation({
    mutationFn: async (data: { vaultId: string; amount: string; lockDays: number }) => {
      const response = await apiRequest("POST", "/api/yield/deposit", {
        userAddress,
        vaultId: data.vaultId,
        amount: data.amount,
        lockDays: data.lockDays,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const vault = vaults?.find(v => v.id === variables.vaultId);
      toast({ 
        title: t("yieldFarming.depositSuccessful"), 
        description: t("yieldFarming.depositSuccessDesc", { 
          amount: formatWeiToToken(variables.amount), 
          symbol: vault?.underlyingSymbol || "TBURN",
          vault: vault?.name || "Vault"
        }) 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/vaults/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/transactions/recent"] });
      setDepositAmount("");
      setSelectedVault(null);
      setLockDays("0");
      setDepositDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: t("yieldFarming.depositFailed"), 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { vaultId: string; shares: string }) => {
      const response = await apiRequest("POST", "/api/yield/withdraw", {
        userAddress,
        vaultId: data.vaultId,
        shares: data.shares,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const vault = vaults?.find(v => v.id === variables.vaultId);
      toast({ 
        title: t("yieldFarming.withdrawSuccessful"), 
        description: t("yieldFarming.withdrawSuccessDesc", { 
          shares: formatWeiToToken(variables.shares),
          vault: vault?.name || "Vault"
        }) 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/vaults/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/transactions/recent"] });
      setWithdrawShares("");
      setSelectedPosition(null);
      setWithdrawDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: t("yieldFarming.withdrawFailed"), 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (data: { vaultId: string; positionId: string }) => {
      const response = await apiRequest("POST", "/api/yield/claim-rewards", { 
        userAddress, 
        vaultId: data.vaultId 
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const position = positions?.find(p => p.vaultId === variables.vaultId);
      const vault = vaults?.find(v => v.id === variables.vaultId);
      toast({ 
        title: t("yieldFarming.claimSuccessful"), 
        description: t("yieldFarming.claimSuccessDesc", { 
          amount: formatWeiToToken(position?.pendingRewards || "0"),
          vault: vault?.name || "Vault"
        }) 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/transactions/recent"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: t("yieldFarming.claimFailed"), 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const compoundMutation = useMutation({
    mutationFn: async (data: { vaultId: string }) => {
      const response = await apiRequest("POST", "/api/yield/compound", { 
        userAddress, 
        vaultId: data.vaultId 
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const vault = vaults?.find(v => v.id === variables.vaultId);
      toast({ 
        title: t("yieldFarming.compoundSuccessful"), 
        description: t("yieldFarming.compoundSuccessDesc", { 
          vault: vault?.name || "Vault"
        }) 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/stats"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: t("yieldFarming.compoundFailed"), 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const openDepositDialog = (vault: YieldVault) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    setSelectedVault(vault);
    setDepositAmount("");
    setLockDays("0");
    setDepositDialogOpen(true);
  };

  const openWithdrawDialog = (position: YieldPosition) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    setSelectedPosition(position);
    setWithdrawShares(position.shares);
    setWithdrawDialogOpen(true);
  };

  const totalUserValue = useMemo(() => {
    if (!positions) return BigInt(0);
    return positions.reduce((sum, p) => sum + BigInt(p.currentValue || "0"), BigInt(0));
  }, [positions]);

  const totalPendingRewards = useMemo(() => {
    if (!positions) return BigInt(0);
    return positions.reduce((sum, p) => sum + BigInt(p.pendingRewards || "0"), BigInt(0));
  }, [positions]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <WalletRequiredBanner />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-yield-title">
            <Sprout className="h-8 w-8 text-green-500" />
            {t("yieldFarming.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("yieldFarming.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            data-testid="button-refresh-yield"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("yieldFarming.refreshing")}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("yieldFarming.refresh")}
              </>
            )}
          </Button>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Bot className="h-4 w-4 mr-2" />
            {t("yieldFarming.aiEnhanced")}
          </Badge>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("yieldFarming.totalValueLocked")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-tvl">
                    {formatUsd(stats.totalTvlUsd)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("yieldFarming.activeVaults")}</p>
                  <p className="text-2xl font-bold" data-testid="text-active-vaults">
                    {stats.activeVaults} / {stats.totalVaults}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Layers className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("yieldFarming.topVaultApy")}</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-top-apy">
                    {formatApy(stats.topVaultApy)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("yieldFarming.totalUsers")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-users">
                    {formatNumber(stats.totalUsers)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-4xl grid-cols-6">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("yieldFarming.overview")}
          </TabsTrigger>
          <TabsTrigger value="vaults" data-testid="tab-vaults">
            <Layers className="h-4 w-4 mr-2" />
            {t("yieldFarming.vaults")}
          </TabsTrigger>
          <TabsTrigger value="deposit" data-testid="tab-deposit">
            <Plus className="h-4 w-4 mr-2" />
            {t("yieldFarming.deposit")}
          </TabsTrigger>
          <TabsTrigger value="positions" data-testid="tab-positions">
            <Wallet className="h-4 w-4 mr-2" />
            {t("yieldFarming.myPositions")}
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <History className="h-4 w-4 mr-2" />
            {t("yieldFarming.activity")}
          </TabsTrigger>
          <TabsTrigger value="harvests" data-testid="tab-harvests">
            <Gift className="h-4 w-4 mr-2" />
            {t("yieldFarming.harvests")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  {t("yieldFarming.topPerformingVaults")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {vaultsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : vaults && vaults.length > 0 ? (
                    <div className="space-y-3">
                      {vaults.slice(0, 5).map((vault) => (
                        <div
                          key={vault.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                          onClick={() => openDepositDialog(vault)}
                          data-testid={`vault-card-${vault.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Coins className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{vault.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {getVaultTypeLabel(t, vault.vaultType)}
                                </Badge>
                                <Badge className={`text-xs ${riskColors[vault.riskLevel]}`}>
                                  {t(`yieldFarming.riskLevels.${vault.riskLevel}`)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">{formatApy(vault.totalApy)}</p>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.tvlLabel", { value: formatUsd(vault.tvlUsd) })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Sprout className="h-12 w-12 mb-2" />
                      <p>{t("yieldFarming.noVaultsAvailable")}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-500" />
                  {t("yieldFarming.yourPortfolio")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t("yieldFarming.totalValue")}</p>
                    <p className="text-3xl font-bold">{formatWeiToToken(totalUserValue.toString())} TBURN</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t("yieldFarming.pendingRewards")}</p>
                    <p className="text-2xl font-bold text-green-500">
                      {formatWeiToToken(totalPendingRewards.toString())} TBURN
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t("yieldFarming.activePositions")}</p>
                    <p className="text-2xl font-bold">
                      {positions?.filter(p => p.status === "active").length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("yieldFarming.allVaults")}</CardTitle>
              <CardDescription>{t("yieldFarming.browseAndCompareVaults")}</CardDescription>
            </CardHeader>
            <CardContent>
              {vaultsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : vaults && vaults.length > 0 ? (
                <div className="space-y-4">
                  {vaults.map((vault) => (
                    <div
                      key={vault.id}
                      className="p-4 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => openDepositDialog(vault)}
                      data-testid={`vault-row-${vault.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Coins className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{vault.name}</h3>
                              {vault.aiOptimized && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Bot className="h-4 w-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t("yieldFarming.aiOptimizedTooltip", { score: vault.aiStrategyScore / 100 })}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{vault.underlyingSymbol}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getVaultTypeLabel(t, vault.vaultType)}
                              </Badge>
                              <Badge className={`text-xs ${riskColors[vault.riskLevel]}`}>
                                {t(`yieldFarming.riskLevels.${vault.riskLevel}`)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-8 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.totalApy")}</p>
                            <p className="font-bold text-green-500 text-lg">{formatApy(vault.totalApy)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.tvl")}</p>
                            <p className="font-medium">{formatUsd(vault.tvlUsd)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.depositors")}</p>
                            <p className="font-medium">{formatNumber(vault.totalDepositors)}</p>
                          </div>
                          <div>
                            <Button 
                              size="sm" 
                              data-testid={`button-deposit-${vault.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDepositDialog(vault);
                              }}
                            >
                              {t("yieldFarming.deposit")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sprout className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">{t("yieldFarming.noVaultsAvailable")}</p>
                  <p className="text-sm">{t("yieldFarming.checkBackLater")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("yieldFarming.selectVault")}</CardTitle>
                <CardDescription>{t("yieldFarming.chooseVaultToDeposit")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedVault?.id || ""}
                  onValueChange={(value) => {
                    const vault = vaults?.find(v => v.id === value);
                    setSelectedVault(vault || null);
                  }}
                >
                  <SelectTrigger data-testid="select-vault">
                    <SelectValue placeholder={t("yieldFarming.selectAVault")} />
                  </SelectTrigger>
                  <SelectContent>
                    {vaults?.map((vault) => (
                      <SelectItem key={vault.id} value={vault.id}>
                        {t("yieldFarming.vaultApyLabel", { name: vault.name, apy: formatApy(vault.totalApy) })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedVault && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("yieldFarming.vault")}</span>
                      <span className="font-medium">{selectedVault.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("yieldFarming.asset")}</span>
                      <span>{selectedVault.underlyingSymbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("yieldFarming.totalApy")}</span>
                      <span className="text-green-500 font-bold">{formatApy(selectedVault.totalApy)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("yieldFarming.baseApy")}</span>
                      <span>{formatApy(selectedVault.baseApy)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("yieldFarming.boostApy")}</span>
                      <span className="text-blue-500">{formatApy(selectedVault.boostApy)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("yieldFarming.rewardApy")}</span>
                      <span className="text-purple-500">{formatApy(selectedVault.rewardApy)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("yieldFarming.depositFee")}</span>
                      <span>{formatApy(selectedVault.depositFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("yieldFarming.withdrawalFee")}</span>
                      <span>{formatApy(selectedVault.withdrawalFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("yieldFarming.performanceFee")}</span>
                      <span>{formatApy(selectedVault.performanceFee)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("yieldFarming.depositAmount")}</CardTitle>
                <CardDescription>{t("yieldFarming.enterAmountToDeposit")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("yieldFarming.amount")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      data-testid="input-deposit-amount"
                    />
                    <Button variant="outline" onClick={() => setDepositAmount("1000000000000000000000")}>
                      {t("yieldFarming.max")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("yieldFarming.lockDurationOptionalBoost")}</Label>
                  <Select value={lockDays} onValueChange={setLockDays}>
                    <SelectTrigger data-testid="select-lock-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("yieldFarming.noLock")}</SelectItem>
                      <SelectItem value="7">{t("yieldFarming.days7")}</SelectItem>
                      <SelectItem value="30">{t("yieldFarming.days30")}</SelectItem>
                      <SelectItem value="90">{t("yieldFarming.days90")}</SelectItem>
                      <SelectItem value="180">{t("yieldFarming.days180")}</SelectItem>
                      <SelectItem value="365">{t("yieldFarming.days365")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedVault || !depositAmount || depositMutation.isPending}
                  onClick={() => {
                    if (selectedVault && depositAmount) {
                      depositMutation.mutate({
                        vaultId: selectedVault.id,
                        amount: depositAmount,
                        lockDays: parseInt(lockDays),
                      });
                    }
                  }}
                  data-testid="button-confirm-deposit"
                >
                  {depositMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t("yieldFarming.processing")}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("yieldFarming.deposit")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("yieldFarming.myPositions")}</CardTitle>
              <CardDescription>{t("yieldFarming.manageActivePositions")}</CardDescription>
            </CardHeader>
            <CardContent>
              {positionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : positions && positions.length > 0 ? (
                <div className="space-y-4">
                  {positions.filter(p => p.status === "active").map((position) => {
                    const vault = vaults?.find(v => v.id === position.vaultId);
                    return (
                      <div
                        key={position.id}
                        className="p-4 rounded-lg border"
                        data-testid={`position-${position.id}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Coins className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{vault?.name || t("yieldFarming.unknownVault")}</p>
                              <div className="flex items-center gap-2">
                                {position.isLocked && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    {t("yieldFarming.locked")}
                                  </Badge>
                                )}
                                {position.boostMultiplier > 10000 && (
                                  <Badge className="text-xs bg-blue-600">
                                    {t("yieldFarming.boostBadge", { percent: (position.boostMultiplier / 100).toFixed(0) })}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatWeiToToken(position.currentValue)}</p>
                            <p className="text-sm text-muted-foreground">
                              {t("yieldFarming.deposited", { amount: formatWeiToToken(position.depositedAmount) })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.unrealizedPL")}</p>
                            <p className={`font-medium ${BigInt(position.unrealizedProfit) >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {formatWeiToToken(position.unrealizedProfit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.pendingRewards")}</p>
                            <p className="font-medium text-green-500">{formatWeiToToken(position.pendingRewards)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.shares")}</p>
                            <p className="font-medium">{formatWeiToToken(position.shares)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t("yieldFarming.boost")}</p>
                            <p className="font-medium">{(position.boostMultiplier / 100).toFixed(0)}%</p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={position.isLocked || claimMutation.isPending || BigInt(position.pendingRewards || "0") <= 0}
                            onClick={() => claimMutation.mutate({ vaultId: position.vaultId, positionId: position.id })}
                            data-testid={`button-claim-${position.id}`}
                          >
                            {claimMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <DollarSign className="h-4 w-4 mr-1" />
                            )}
                            {t("yieldFarming.claimRewards")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={position.isLocked || compoundMutation.isPending}
                            onClick={() => compoundMutation.mutate({ vaultId: position.vaultId })}
                            data-testid={`button-compound-${position.id}`}
                          >
                            {compoundMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                            {t("yieldFarming.compound")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={position.isLocked}
                            onClick={() => openWithdrawDialog(position)}
                            data-testid={`button-withdraw-${position.id}`}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            {t("yieldFarming.withdraw")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">{t("yieldFarming.noActivePositions")}</p>
                  <p className="text-sm">{t("yieldFarming.startFarmingByDepositing")}</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("vaults")}
                    data-testid="button-browse-vaults"
                  >
                    {t("yieldFarming.browseVaults")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                {t("yieldFarming.recentActivity")}
              </CardTitle>
              <CardDescription>{t("yieldFarming.recentActivityDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {transactions.map((tx) => {
                      const vault = vaults?.find(v => v.id === tx.vaultId);
                      const isDeposit = tx.type === "deposit";
                      const isWithdraw = tx.type === "withdraw";
                      const isClaim = tx.type === "claim";
                      
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          data-testid={`activity-${tx.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              isDeposit ? "bg-green-500/10" : 
                              isWithdraw ? "bg-orange-500/10" : 
                              isClaim ? "bg-purple-500/10" : "bg-blue-500/10"
                            }`}>
                              {isDeposit ? (
                                <Plus className={`h-4 w-4 text-green-500`} />
                              ) : isWithdraw ? (
                                <Minus className={`h-4 w-4 text-orange-500`} />
                              ) : isClaim ? (
                                <Gift className={`h-4 w-4 text-purple-500`} />
                              ) : (
                                <RefreshCw className={`h-4 w-4 text-blue-500`} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium capitalize">
                                {t(`yieldFarming.txType.${tx.type}`) || tx.type}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {vault?.name || t("yieldFarming.unknownVault")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${isDeposit ? "text-green-500" : isWithdraw ? "text-orange-500" : "text-blue-500"}`}>
                              {isDeposit ? "+" : isWithdraw ? "-" : ""}{formatWeiToToken(tx.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={tx.status === "confirmed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}>
                              {t(`yieldFarming.txStatus.${tx.status}`) || tx.status}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      navigator.clipboard.writeText(tx.txHash);
                                      toast({
                                        title: t("yieldFarming.copied"),
                                        description: t("yieldFarming.txHashCopied"),
                                      });
                                    }}
                                    data-testid={`button-copy-tx-${tx.id}`}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">{t("yieldFarming.noActivity")}</p>
                  <p className="text-sm">{t("yieldFarming.noActivityDesc")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harvests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                {t("yieldFarming.recentHarvests")}
              </CardTitle>
              <CardDescription>{t("yieldFarming.recentHarvestsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {harvestsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : harvests && harvests.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {harvests.map((harvest) => {
                      const vault = vaults?.find(v => v.id === harvest.vaultId);
                      
                      return (
                        <div
                          key={harvest.id}
                          className="p-4 rounded-lg border"
                          data-testid={`harvest-${harvest.id}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-purple-500/10">
                                <Gift className="h-5 w-5 text-purple-500" />
                              </div>
                              <div>
                                <p className="font-semibold">{vault?.name || t("yieldFarming.unknownVault")}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {t(`yieldFarming.harvestType.${harvest.harvestType}`) || harvest.harvestType}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={harvest.status === "completed" ? "default" : "secondary"}>
                                {t(`yieldFarming.harvestStatus.${harvest.status}`) || harvest.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(harvest.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">{t("yieldFarming.harvested")}</p>
                              <p className="font-medium text-green-500">+{formatWeiToToken(harvest.harvestedAmount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">{t("yieldFarming.compounded")}</p>
                              <p className="font-medium text-blue-500">+{formatWeiToToken(harvest.compoundedAmount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">{t("yieldFarming.distributed")}</p>
                              <p className="font-medium">{formatWeiToToken(harvest.distributedAmount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">{t("yieldFarming.gasCost")}</p>
                              <p className="font-medium">{harvest.gasPriceEmb} EMB</p>
                            </div>
                          </div>
                          
                          {harvest.strategyProfit && BigInt(harvest.strategyProfit) > 0 && (
                            <div className="mt-3 p-2 rounded bg-green-500/10 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                {t("yieldFarming.strategyProfit")}: 
                                <span className="font-medium text-green-500 ml-1">
                                  +{formatWeiToToken(harvest.strategyProfit)} TBURN
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Gift className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">{t("yieldFarming.noHarvests")}</p>
                  <p className="text-sm">{t("yieldFarming.noHarvestsDesc")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              {t("yieldFarming.depositToVault")}
            </DialogTitle>
            <DialogDescription>
              {selectedVault ? t("yieldFarming.depositToVaultDesc", { symbol: selectedVault.underlyingSymbol, name: selectedVault.name }) : t("yieldFarming.selectVaultToDeposit")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVault && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("yieldFarming.vault")}</span>
                  <span className="font-medium">{selectedVault.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("yieldFarming.totalApy")}</span>
                  <span className="text-green-500 font-bold">{formatApy(selectedVault.totalApy)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("yieldFarming.riskLevel")}</span>
                  <Badge className={`text-xs ${riskColors[selectedVault.riskLevel]}`}>
                    {t(`yieldFarming.riskLevels.${selectedVault.riskLevel}`)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("yieldFarming.depositAmountWei")}</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={t("yieldFarming.enterAmountInWei")}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    data-testid="input-dialog-deposit-amount"
                  />
                  <Button variant="outline" onClick={() => setDepositAmount("1000000000000000000000")}>
                    {t("yieldFarming.max")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {depositAmount ? t("yieldFarming.approximateAmount", { amount: formatWeiToToken(depositAmount), symbol: selectedVault.underlyingSymbol }) : t("yieldFarming.enterAmount")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("yieldFarming.lockDurationOptionalBoost")}</Label>
                <Select value={lockDays} onValueChange={setLockDays}>
                  <SelectTrigger data-testid="select-dialog-lock-days">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t("yieldFarming.noLockMultiplier")}</SelectItem>
                    <SelectItem value="7">{t("yieldFarming.days7Multiplier")}</SelectItem>
                    <SelectItem value="30">{t("yieldFarming.days30Multiplier")}</SelectItem>
                    <SelectItem value="90">{t("yieldFarming.days90Multiplier")}</SelectItem>
                    <SelectItem value="180">{t("yieldFarming.days180Multiplier")}</SelectItem>
                    <SelectItem value="365">{t("yieldFarming.days365Multiplier")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{t("yieldFarming.feeSummary")}</span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("yieldFarming.depositFee")}</span>
                    <span>{formatApy(selectedVault.depositFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("yieldFarming.performanceFee")}</span>
                    <span>{formatApy(selectedVault.performanceFee)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDepositDialogOpen(false)}
              data-testid="button-cancel-deposit"
            >
              {t("yieldFarming.cancel")}
            </Button>
            <Button
              disabled={!selectedVault || !depositAmount || depositMutation.isPending}
              onClick={() => {
                if (selectedVault && depositAmount) {
                  depositMutation.mutate({
                    vaultId: selectedVault.id,
                    amount: depositAmount,
                    lockDays: parseInt(lockDays),
                  });
                }
              }}
              data-testid="button-dialog-confirm-deposit"
            >
              {depositMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("yieldFarming.processing")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("yieldFarming.confirmDeposit")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-orange-500" />
              {t("yieldFarming.withdrawFromVault")}
            </DialogTitle>
            <DialogDescription>
              {selectedPosition ? t("yieldFarming.withdrawYourPosition") : t("yieldFarming.selectPositionToWithdraw")}
            </DialogDescription>
          </DialogHeader>

          {selectedPosition && (
            <div className="space-y-4">
              {(() => {
                const vault = vaults?.find(v => v.id === selectedPosition.vaultId);
                return (
                  <>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("yieldFarming.vault")}</span>
                        <span className="font-medium">{vault?.name || t("yieldFarming.unknown")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("yieldFarming.currentValue")}</span>
                        <span className="font-bold">{formatWeiToToken(selectedPosition.currentValue)} TBURN</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("yieldFarming.totalShares")}</span>
                        <span>{formatWeiToToken(selectedPosition.shares)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("yieldFarming.pendingRewards")}</span>
                        <span className="text-green-500">{formatWeiToToken(selectedPosition.pendingRewards)} TBURN</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("yieldFarming.sharesToWithdraw")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder={t("yieldFarming.enterSharesToWithdraw")}
                          value={withdrawShares}
                          onChange={(e) => setWithdrawShares(e.target.value)}
                          data-testid="input-dialog-withdraw-shares"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => setWithdrawShares(selectedPosition.shares)}
                        >
                          {t("yieldFarming.max")}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {withdrawShares ? t("yieldFarming.approximateShares", { amount: formatWeiToToken(withdrawShares) }) : t("yieldFarming.enterShares")}
                      </p>
                    </div>

                    {vault && (
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">{t("yieldFarming.withdrawalFee")}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("yieldFarming.withdrawalFeeWarning", { fee: formatApy(vault.withdrawalFee) })}
                        </p>
                      </div>
                    )}

                    {selectedPosition.isLocked && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">{t("yieldFarming.positionLocked")}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("yieldFarming.positionLockedUntil", { date: selectedPosition.lockEndTime ? new Date(selectedPosition.lockEndTime).toLocaleDateString('en-US', { timeZone: 'America/New_York' }) : t("yieldFarming.unknown") })}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawDialogOpen(false)}
              data-testid="button-cancel-withdraw"
            >
              {t("yieldFarming.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={!selectedPosition || !withdrawShares || withdrawMutation.isPending || selectedPosition.isLocked}
              onClick={() => {
                if (selectedPosition && withdrawShares) {
                  withdrawMutation.mutate({
                    vaultId: selectedPosition.vaultId,
                    shares: withdrawShares,
                  });
                }
              }}
              data-testid="button-dialog-confirm-withdraw"
            >
              {withdrawMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("yieldFarming.processing")}
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  {t("yieldFarming.confirmWithdraw")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}
