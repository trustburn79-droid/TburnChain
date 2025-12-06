import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  Landmark,
  AlertTriangle,
  Heart,
  Target,
  Timer,
  CircleDollarSign,
  X,
  User
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

const ENTERPRISE_WALLET = "0xTBURNEnterprise742d35Cc6634C0532925a3b8";

interface LendingMarket {
  id: string;
  assetAddress: string;
  assetSymbol: string;
  assetName: string;
  assetDecimals: number;
  priceFeedId: string;
  totalSupply: string;
  totalBorrowed: string;
  totalSupplyShares: string;
  totalBorrowShares: string;
  availableLiquidity: string;
  utilizationRate: number;
  supplyRate: number;
  borrowRateVariable: number;
  borrowRateStable: number;
  collateralFactor: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  reserveFactor: number;
  baseRate: number;
  optimalUtilization: number;
  slope1: number;
  slope2: number;
  supplyCap: string | null;
  borrowCap: string | null;
  canBeCollateral: boolean;
  canBeBorrowed: boolean;
  isActive: boolean;
  isFrozen: boolean;
  isPaused: boolean;
}

interface LendingPosition {
  userAddress: string;
  totalCollateralValueUsd: string;
  totalBorrowedValueUsd: string;
  healthFactor: number;
  healthStatus: string;
  suppliedAssetCount: number;
  borrowedAssetCount: number;
  netApy: number;
  borrowCapacityRemaining: string;
  supplyDetails: Array<{
    marketId: string;
    assetSymbol: string;
    suppliedAmount: string;
    suppliedShares: string;
    valueUsd: string;
    supplyRate: number;
    isCollateral: boolean;
  }>;
  borrowDetails: Array<{
    marketId: string;
    assetSymbol: string;
    borrowedAmount: string;
    borrowedShares: string;
    valueUsd: string;
    borrowRate: number;
    rateMode: string;
    accruedInterest: string;
  }>;
}

interface LendingStats {
  totalMarkets: number;
  activeMarkets: number;
  totalSupplyUsd: string;
  totalBorrowUsd: string;
  avgUtilization: number;
  markets: Array<{
    id: string;
    assetSymbol: string;
    assetName: string;
    totalSupply: string | null;
    totalBorrowed: string | null;
    supplyRate: number;
    borrowRateVariable: number;
    utilizationRate: number;
    collateralFactor: number;
    isActive: boolean;
  }>;
}

interface LendingTransaction {
  id: string;
  txHash: string;
  userAddress: string;
  assetSymbol: string;
  txType: string;
  amount: string;
  amountUsd: string | null;
  status: string;
  createdAt: string | null;
}

interface LendingLiquidation {
  id: string;
  borrowerAddress: string;
  liquidatorAddress: string;
  collateralSymbol: string;
  debtSymbol: string;
  debtRepaid: string;
  collateralSeized: string;
  liquidationBonus: string;
  txHash: string;
  createdAt: string | null;
}

type DialogAction = "supply" | "withdraw" | "borrow" | "repay" | "liquidate" | null;

const healthStatusColors: Record<string, string> = {
  healthy: "bg-green-500 text-white",
  at_risk: "bg-yellow-500 text-white",
  liquidatable: "bg-red-500 text-white",
};

const getHealthStatusLabel = (t: (key: string) => string, status: string): string => {
  const labels: Record<string, string> = {
    healthy: t('lending.healthStatusHealthy'),
    at_risk: t('lending.healthStatusAtRisk'),
    liquidatable: t('lending.healthStatusLiquidatable'),
  };
  return labels[status] || status;
};

const txTypeIcons: Record<string, typeof Plus> = {
  supply: Plus,
  withdraw: Minus,
  borrow: ArrowDownRight,
  repay: ArrowUpRight,
  liquidation: AlertTriangle,
};

const txTypeColors: Record<string, string> = {
  supply: "text-green-500",
  withdraw: "text-orange-500",
  borrow: "text-blue-500",
  repay: "text-purple-500",
  liquidation: "text-red-500",
};

function bigIntPow(base: bigint, exp: number): bigint {
  let result = BigInt(1);
  for (let i = 0; i < exp; i++) {
    result = result * base;
  }
  return result;
}

function formatWeiToToken(weiStr: string | null | undefined, decimals: number = 18): string {
  if (!weiStr) return "0";
  try {
    const wei = BigInt(weiStr);
    const TEN = BigInt(10);
    const divisor = bigIntPow(TEN, decimals);
    const wholePart = wei / divisor;
    const fractionalWei = wei % divisor;
    const fractional = Number(fractionalWei) / Number(divisor);
    const total = Number(wholePart) + fractional;
    
    if (total >= 1e9) return `${(total / 1e9).toFixed(2)}B`;
    if (total >= 1e6) return `${(total / 1e6).toFixed(2)}M`;
    if (total >= 1e3) return `${(total / 1e3).toFixed(2)}K`;
    if (total >= 1) return total.toFixed(4);
    if (total >= 0.0001) return total.toFixed(6);
    return total.toExponential(2);
  } catch {
    return "0";
  }
}

function formatUSD(weiStr: string | null | undefined): string {
  if (!weiStr) return "$0.00";
  try {
    const wei = BigInt(weiStr);
    const TEN = BigInt(10);
    const divisor = bigIntPow(TEN, 18);
    const wholePart = wei / divisor;
    const fractionalWei = wei % divisor;
    const fractional = Number(fractionalWei) / Number(divisor);
    const total = Number(wholePart) + fractional;
    
    if (total >= 1e9) return `$${(total / 1e9).toFixed(2)}B`;
    if (total >= 1e6) return `$${(total / 1e6).toFixed(2)}M`;
    if (total >= 1e3) return `$${(total / 1e3).toFixed(2)}K`;
    return `$${total.toFixed(2)}`;
  } catch {
    return "$0.00";
  }
}

function formatBps(bps: number): string {
  const percent = bps / 100;
  return `${percent.toFixed(2)}%`;
}

function formatHealthFactor(hf: number): string {
  if (hf >= 100000) return ">1000";
  const value = hf / 10000;
  return value.toFixed(2);
}

function getHealthColor(hf: number): string {
  if (hf < 10000) return "text-red-500";
  if (hf < 15000) return "text-yellow-500";
  return "text-green-500";
}

function toWei(amount: string, decimals: number = 18): string {
  try {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return "0";
    const multiplier = Math.pow(10, decimals);
    return BigInt(Math.floor(parsed * multiplier)).toString();
  } catch {
    return "0";
  }
}

export default function LendingPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, isCorrectNetwork, balance } = useWeb3();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [actionTab, setActionTab] = useState<"supply" | "borrow">("supply");
  const [amount, setAmount] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);
  const [dialogMarket, setDialogMarket] = useState<LendingMarket | null>(null);
  const [dialogAmount, setDialogAmount] = useState("");
  const [useAsCollateral, setUseAsCollateral] = useState(true);
  const [rateMode, setRateMode] = useState<"variable" | "stable">("variable");
  
  const [liquidateDialogOpen, setLiquidateDialogOpen] = useState(false);
  const [liquidateBorrower, setLiquidateBorrower] = useState("");
  const [liquidateDebtMarket, setLiquidateDebtMarket] = useState("");
  const [liquidateCollateralMarket, setLiquidateCollateralMarket] = useState("");
  const [liquidateAmount, setLiquidateAmount] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [lendingStats, setLendingStats] = useState<LendingStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<LendingTransaction[]>([]);
  const [recentLiquidations, setRecentLiquidations] = useState<LendingLiquidation[]>([]);
  const [riskData, setRiskData] = useState<{
    atRiskCount: number;
    liquidatableCount: number;
  } | null>(null);

  const { data: markets, isLoading: marketsLoading, refetch: refetchMarkets } = useQuery<LendingMarket[]>({
    queryKey: ['/api/lending/markets'],
    staleTime: 30000,
  });

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<{
    totalMarkets: number;
    activeMarkets: number;
    totalSupplyUsd: string;
    totalBorrowUsd: string;
    avgSupplyRate: number;
    avgBorrowRate: number;
    avgUtilization: number;
  }>({
    queryKey: ['/api/lending/stats'],
    staleTime: 10000,
  });

  const { data: userPosition, refetch: refetchPosition } = useQuery<LendingPosition>({
    queryKey: ['/api/lending/positions', ENTERPRISE_WALLET],
    staleTime: 15000,
  });

  const selectedMarketData = useMemo(() => {
    return markets?.find(m => m.id === selectedMarket) || null;
  }, [markets, selectedMarket]);

  useEffect(() => {
    const ws = (window as any).__tburnWs;
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'lending_markets') {
          setLendingStats(message.data);
        } else if (message.type === 'lending_transactions') {
          setRecentTransactions(message.data.transactions || []);
        } else if (message.type === 'lending_liquidations') {
          setRecentLiquidations(message.data.liquidations || []);
        } else if (message.type === 'lending_risk_monitor') {
          setRiskData({
            atRiskCount: message.data.atRiskCount || 0,
            liquidatableCount: message.data.liquidatableCount || 0,
          });
        }
      } catch (error) {
        console.error('Error parsing lending WS message:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, []);

  const supplyMutation = useMutation({
    mutationFn: async (data: { marketId: string; amount: string; useAsCollateral: boolean }) => {
      const response = await apiRequest('POST', '/api/lending/supply', {
        userAddress: ENTERPRISE_WALLET,
        marketId: data.marketId,
        amount: data.amount,
        useAsCollateral: data.useAsCollateral,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('lending.supplyFailedDesc'));
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('lending.supplySuccessful'),
        description: t('lending.supplySuccessDescAmount', { 
          amount: formatWeiToToken(data?.supply?.suppliedAmount || '0'),
          symbol: data?.supply?.assetSymbol || 'Token'
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/markets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/stats'] });
      closeDialog();
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: t('lending.supplyFailed'),
        description: error.message || t('lending.supplyFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { marketId: string; shares: string }) => {
      const response = await apiRequest('POST', '/api/lending/withdraw', {
        userAddress: ENTERPRISE_WALLET,
        marketId: data.marketId,
        amount: data.shares,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('lending.withdrawFailedDesc'));
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('lending.withdrawSuccessful'),
        description: t('lending.withdrawSuccessDescAmount', {
          amount: formatWeiToToken(data?.withdraw?.withdrawnAmount || '0'),
          symbol: data?.withdraw?.assetSymbol || 'Token'
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/markets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/stats'] });
      closeDialog();
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: t('lending.withdrawFailed'),
        description: error.message || t('lending.withdrawFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const borrowMutation = useMutation({
    mutationFn: async (data: { marketId: string; amount: string; rateMode: "variable" | "stable" }) => {
      const response = await apiRequest('POST', '/api/lending/borrow', {
        userAddress: ENTERPRISE_WALLET,
        marketId: data.marketId,
        amount: data.amount,
        rateMode: data.rateMode,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('lending.borrowFailedDesc'));
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('lending.borrowSuccessful'),
        description: t('lending.borrowSuccessDescAmount', {
          amount: formatWeiToToken(data?.borrow?.borrowedAmount || '0'),
          symbol: data?.borrow?.assetSymbol || 'Token',
          mode: data?.borrow?.rateMode || 'variable'
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/markets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/stats'] });
      closeDialog();
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: t('lending.borrowFailed'),
        description: error.message || t('lending.borrowFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const repayMutation = useMutation({
    mutationFn: async (data: { marketId: string; amount: string }) => {
      const response = await apiRequest('POST', '/api/lending/repay', {
        userAddress: ENTERPRISE_WALLET,
        marketId: data.marketId,
        amount: data.amount,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('lending.repayFailedDesc'));
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('lending.repaySuccessful'),
        description: t('lending.repaySuccessDescAmount', {
          amount: formatWeiToToken(data?.repay?.repaidAmount || '0'),
          symbol: data?.repay?.assetSymbol || 'Token'
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/markets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/stats'] });
      closeDialog();
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: t('lending.repayFailed'),
        description: error.message || t('lending.repayFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const liquidateMutation = useMutation({
    mutationFn: async (data: { 
      borrowerAddress: string; 
      debtMarketId: string; 
      collateralMarketId: string;
      debtToCover: string;
    }) => {
      const response = await apiRequest('POST', '/api/lending/liquidate', {
        liquidatorAddress: ENTERPRISE_WALLET,
        borrowerAddress: data.borrowerAddress,
        debtMarketId: data.debtMarketId,
        collateralMarketId: data.collateralMarketId,
        debtToCover: data.debtToCover,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('lending.liquidationFailedDesc'));
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('lending.liquidationSuccessful'),
        description: t('lending.liquidationSuccessDescAmount', {
          debtAmount: formatWeiToToken(data?.liquidation?.debtRepaid || '0'),
          debtSymbol: data?.liquidation?.debtSymbol || 'Debt',
          collateralAmount: formatWeiToToken(data?.liquidation?.collateralSeized || '0'),
          collateralSymbol: data?.liquidation?.collateralSymbol || 'Collateral'
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/markets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lending/stats'] });
      setLiquidateDialogOpen(false);
      resetLiquidateForm();
    },
    onError: (error: Error) => {
      toast({
        title: t('lending.liquidationFailed'),
        description: error.message || t('lending.liquidationFailedDesc'),
        variant: "destructive",
      });
    },
  });

  const openDialog = (action: DialogAction, market: LendingMarket) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    setDialogAction(action);
    setDialogMarket(market);
    setDialogAmount("");
    setUseAsCollateral(true);
    setRateMode("variable");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogAction(null);
    setDialogMarket(null);
    setDialogAmount("");
  };

  const resetLiquidateForm = () => {
    setLiquidateBorrower("");
    setLiquidateDebtMarket("");
    setLiquidateCollateralMarket("");
    setLiquidateAmount("");
  };

  const handleDialogSubmit = () => {
    if (!dialogMarket || !dialogAmount) return;
    
    const weiAmount = toWei(dialogAmount, dialogMarket.assetDecimals);
    if (weiAmount === "0") {
      toast({
        title: t('lending.invalidAmount'),
        description: t('lending.invalidAmountDesc'),
        variant: "destructive",
      });
      return;
    }

    switch (dialogAction) {
      case "supply":
        supplyMutation.mutate({ 
          marketId: dialogMarket.id, 
          amount: weiAmount,
          useAsCollateral 
        });
        break;
      case "withdraw":
        withdrawMutation.mutate({ 
          marketId: dialogMarket.id, 
          shares: weiAmount 
        });
        break;
      case "borrow":
        borrowMutation.mutate({ 
          marketId: dialogMarket.id, 
          amount: weiAmount,
          rateMode 
        });
        break;
      case "repay":
        repayMutation.mutate({ 
          marketId: dialogMarket.id, 
          amount: weiAmount 
        });
        break;
    }
  };

  const handleLiquidateSubmit = () => {
    if (!liquidateBorrower || !liquidateDebtMarket || !liquidateCollateralMarket || !liquidateAmount) {
      toast({
        title: t('lending.invalidInput'),
        description: t('lending.invalidInputDesc'),
        variant: "destructive",
      });
      return;
    }

    const debtMarket = markets?.find(m => m.id === liquidateDebtMarket);
    const weiAmount = toWei(liquidateAmount, debtMarket?.assetDecimals || 18);
    
    liquidateMutation.mutate({
      borrowerAddress: liquidateBorrower,
      debtMarketId: liquidateDebtMarket,
      collateralMarketId: liquidateCollateralMarket,
      debtToCover: weiAmount,
    });
  };

  const isDialogPending = supplyMutation.isPending || withdrawMutation.isPending || 
                          borrowMutation.isPending || repayMutation.isPending;

  const getDialogTitle = () => {
    switch (dialogAction) {
      case "supply": return t('lending.supplyAssets');
      case "withdraw": return t('lending.withdrawAssets');
      case "borrow": return t('lending.borrowAssets');
      case "repay": return t('lending.repayDebt');
      default: return "";
    }
  };

  const getDialogDescription = () => {
    const symbol = dialogMarket?.assetSymbol || '';
    switch (dialogAction) {
      case "supply": return t('lending.supplyToEarn', { symbol });
      case "withdraw": return t('lending.withdrawFromPool', { symbol });
      case "borrow": return t('lending.borrowAgainst', { symbol });
      case "repay": return t('lending.repayYourDebt', { symbol });
      default: return "";
    }
  };

  const getActionButtonText = () => {
    if (isDialogPending) return t('lending.processing');
    const symbol = dialogMarket?.assetSymbol || '';
    switch (dialogAction) {
      case "supply": return t('lending.supplySymbol', { symbol });
      case "withdraw": return t('lending.withdrawSymbol', { symbol });
      case "borrow": return t('lending.borrowSymbol', { symbol });
      case "repay": return t('lending.repaySymbol', { symbol });
      default: return t('lending.confirm');
    }
  };

  if (marketsLoading || statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6" data-testid="lending-page">
        <WalletRequiredBanner />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Landmark className="h-8 w-8 text-primary" />
              {t('lending.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('lending.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              <User className="h-3 w-3 mr-1" />
              {ENTERPRISE_WALLET.slice(0, 12)}...
            </Badge>
            <Button 
              variant="outline" 
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await Promise.all([
                    refetchMarkets(),
                    refetchStats(),
                    refetchPosition()
                  ]);
                  toast({
                    title: t('lending.refreshSuccess'),
                    description: t('lending.refreshSuccessDesc'),
                  });
                } catch (error) {
                  toast({
                    title: t('lending.refreshError'),
                    description: t('lending.refreshErrorDesc'),
                    variant: "destructive",
                  });
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              data-testid="button-refresh-markets"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('lending.totalSupply')}</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-supply">
                {formatUSD(stats?.totalSupplyUsd || lendingStats?.totalSupplyUsd)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('lending.activeMarkets', { count: stats?.activeMarkets || lendingStats?.activeMarkets || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('lending.totalBorrowed')}</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-borrowed">
                {formatUSD(stats?.totalBorrowUsd || lendingStats?.totalBorrowUsd)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('lending.avgUtilization', { rate: stats?.avgUtilization || lendingStats?.avgUtilization || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('lending.positionsAtRisk')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-at-risk">
                {riskData?.atRiskCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('lending.liquidatable', { count: riskData?.liquidatableCount || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('lending.avgSupplyApy')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="text-avg-apy">
                {formatBps(stats?.avgSupplyRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('lending.borrowAprLabel', { rate: formatBps(stats?.avgBorrowRate || 0) })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">{t('lending.marketsOverview')}</TabsTrigger>
            <TabsTrigger value="positions" data-testid="tab-positions">{t('lending.myPositions')}</TabsTrigger>
            <TabsTrigger value="supply" data-testid="tab-supply">{t('lending.supply')}</TabsTrigger>
            <TabsTrigger value="borrow" data-testid="tab-borrow">{t('lending.borrow')}</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">{t('lending.activity')}</TabsTrigger>
            <TabsTrigger value="liquidations" data-testid="tab-liquidations">{t('lending.liquidations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('lending.lendingMarkets')}</CardTitle>
                <CardDescription>
                  {t('lending.lendingMarketsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {markets && markets.length > 0 ? markets.map((market) => (
                      <div 
                        key={market.id} 
                        className="p-4 rounded-lg border hover-elevate transition-colors"
                        data-testid={`market-card-${market.id}`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Coins className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {market.assetSymbol}
                                {market.canBeCollateral && (
                                  <Badge variant="outline" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {t('lending.collateral')}
                                  </Badge>
                                )}
                                {!market.isActive && (
                                  <Badge variant="secondary" className="text-xs">{t('lending.inactive')}</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{market.assetName}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 flex-wrap">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{t('lending.totalSupply')}</div>
                              <div className="font-medium">{formatUSD(market.totalSupply)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{t('lending.totalBorrowed')}</div>
                              <div className="font-medium">{formatUSD(market.totalBorrowed)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{t('lending.supplyApy')}</div>
                              <div className="font-medium text-green-500">{formatBps(market.supplyRate)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{t('lending.borrowApr')}</div>
                              <div className="font-medium text-blue-500">{formatBps(market.borrowRateVariable)}</div>
                            </div>
                            <div className="text-right w-24">
                              <div className="text-sm text-muted-foreground mb-1">{t('lending.utilization')}</div>
                              <Progress value={market.utilizationRate / 100} className="h-2" />
                              <div className="text-xs text-muted-foreground mt-1">{formatBps(market.utilizationRate)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              onClick={() => openDialog("supply", market)}
                              disabled={!market.isActive}
                              data-testid={`button-supply-${market.id}`}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {t('lending.supply')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openDialog("borrow", market)}
                              disabled={!market.isActive || !market.canBeBorrowed}
                              data-testid={`button-borrow-${market.id}`}
                            >
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                              {t('lending.borrow')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('lending.noMarketsAvailable')}</p>
                        <p className="text-sm mt-2">{t('lending.marketsWillAppear')}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            {userPosition ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('lending.totalCollateral')}</CardTitle>
                      <Shield className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-user-collateral">
                        {formatUSD(userPosition.totalCollateralValueUsd)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('lending.assetsSupplied', { count: userPosition.suppliedAssetCount })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('lending.totalBorrowed')}</CardTitle>
                      <CircleDollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-user-borrowed">
                        {formatUSD(userPosition.totalBorrowedValueUsd)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('lending.assetsBorrowed', { count: userPosition.borrowedAssetCount })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('lending.healthFactor')}</CardTitle>
                      <Heart className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getHealthColor(userPosition.healthFactor)}`} data-testid="text-health-factor">
                        {formatHealthFactor(userPosition.healthFactor)}
                      </div>
                      <Badge className={healthStatusColors[userPosition.healthStatus] || "bg-muted"}>
                        {getHealthStatusLabel(t, userPosition.healthStatus)}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('lending.netApy')}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${userPosition.netApy >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-net-apy">
                        {formatBps(userPosition.netApy)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('lending.borrowCapacity', { amount: formatUSD(userPosition.borrowCapacityRemaining) })}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-green-500" />
                        {t('lending.suppliedAssets')}
                      </CardTitle>
                      <CardDescription>{t('lending.suppliedAssetsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {userPosition.supplyDetails.length > 0 ? userPosition.supplyDetails.map((supply) => {
                            const market = markets?.find(m => m.id === supply.marketId);
                            return (
                              <div 
                                key={supply.marketId}
                                className="p-3 rounded-lg border"
                                data-testid={`supply-position-${supply.marketId}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                      <Coins className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center gap-2">
                                        {supply.assetSymbol}
                                        {supply.isCollateral && (
                                          <Badge variant="outline" className="text-xs">
                                            <Shield className="h-3 w-3" />
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {t('lending.supplied', { amount: formatWeiToToken(supply.suppliedAmount) })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{formatUSD(supply.valueUsd)}</div>
                                    <div className="text-xs text-green-500">+{formatBps(supply.supplyRate)} APY</div>
                                  </div>
                                </div>
                                {market && (
                                  <div className="flex items-center gap-2 mt-3">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openDialog("withdraw", market)}
                                      data-testid={`button-withdraw-position-${supply.marketId}`}
                                    >
                                      <Minus className="h-4 w-4 mr-1" />
                                      {t('lending.withdraw')}
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => openDialog("supply", market)}
                                      data-testid={`button-add-supply-${supply.marketId}`}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      {t('lending.addMore')}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          }) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <PiggyBank className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>{t('lending.noAssetsSupplied')}</p>
                              <p className="text-sm mt-1">{t('lending.supplyToEarnYield')}</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-blue-500" />
                        {t('lending.borrowedAssets')}
                      </CardTitle>
                      <CardDescription>{t('lending.borrowedAssetsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {userPosition.borrowDetails.length > 0 ? userPosition.borrowDetails.map((borrow) => {
                            const market = markets?.find(m => m.id === borrow.marketId);
                            return (
                              <div 
                                key={borrow.marketId}
                                className="p-3 rounded-lg border"
                                data-testid={`borrow-position-${borrow.marketId}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                      <CircleDollarSign className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center gap-2">
                                        {borrow.assetSymbol}
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {borrow.rateMode}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {t('lending.borrowed', { amount: formatWeiToToken(borrow.borrowedAmount) })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{formatUSD(borrow.valueUsd)}</div>
                                    <div className="text-xs text-blue-500">-{formatBps(borrow.borrowRate)} APR</div>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                  {t('lending.accruedInterest', { amount: formatWeiToToken(borrow.accruedInterest), symbol: borrow.assetSymbol })}
                                </div>
                                {market && (
                                  <div className="flex items-center gap-2 mt-3">
                                    <Button 
                                      size="sm"
                                      onClick={() => openDialog("repay", market)}
                                      data-testid={`button-repay-position-${borrow.marketId}`}
                                    >
                                      <ArrowUpRight className="h-4 w-4 mr-1" />
                                      {t('lending.repay')}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openDialog("borrow", market)}
                                      data-testid={`button-borrow-more-${borrow.marketId}`}
                                    >
                                      <ArrowDownRight className="h-4 w-4 mr-1" />
                                      {t('lending.borrowMore')}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          }) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <CircleDollarSign className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>{t('lending.noActiveBorrows')}</p>
                              <p className="text-sm mt-1">{t('lending.borrowAgainstCollateral')}</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">{t('lending.noPositionFound')}</p>
                    <p className="text-sm mt-2">{t('lending.noPositionDesc')}</p>
                    <Button 
                      className="mt-4"
                      onClick={() => setSelectedTab("overview")}
                      data-testid="button-go-to-markets"
                    >
                      {t('lending.viewMarkets')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="supply" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('lending.supplyAssets')}</CardTitle>
                  <CardDescription>
                    {t('lending.supplyAssetsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('lending.selectMarket')}</Label>
                    <Select value={selectedMarket || ""} onValueChange={setSelectedMarket}>
                      <SelectTrigger data-testid="select-supply-market">
                        <SelectValue placeholder={t('lending.chooseAssetToSupply')} />
                      </SelectTrigger>
                      <SelectContent>
                        {markets?.filter(m => m.isActive).map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            <div className="flex items-center gap-2">
                              <span>{market.assetSymbol}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-green-500">{formatBps(market.supplyRate)} APY</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMarketData && (
                    <>
                      <div className="space-y-2">
                        <Label>{t('lending.amountToSupply')}</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            data-testid="input-supply-amount"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {selectedMarketData.assetSymbol}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="use-as-collateral">{t('lending.useAsCollateral')}</Label>
                        <Switch 
                          id="use-as-collateral"
                          checked={useAsCollateral}
                          onCheckedChange={setUseAsCollateral}
                          disabled={!selectedMarketData.canBeCollateral}
                          data-testid="switch-collateral"
                        />
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('lending.supplyApy')}</span>
                          <span className="text-green-500 font-medium">{formatBps(selectedMarketData.supplyRate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('lending.collateralFactor')}</span>
                          <span>{formatBps(selectedMarketData.collateralFactor)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('lending.availableLiquidity')}</span>
                          <span>{formatWeiToToken(selectedMarketData.availableLiquidity)}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        disabled={!amount || supplyMutation.isPending}
                        onClick={() => {
                          if (selectedMarket && amount) {
                            const weiAmount = toWei(amount, selectedMarketData.assetDecimals);
                            supplyMutation.mutate({ 
                              marketId: selectedMarket, 
                              amount: weiAmount,
                              useAsCollateral 
                            });
                          }
                        }}
                        data-testid="button-supply"
                      >
                        {supplyMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {t('lending.supplySymbol', { symbol: selectedMarketData.assetSymbol })}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('lending.supplyMarkets')}</CardTitle>
                  <CardDescription>{t('lending.supplyMarketsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {markets?.filter(m => m.isActive).map((market) => (
                        <div
                          key={market.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedMarket === market.id ? 'border-primary bg-primary/5' : 'hover-elevate'
                          }`}
                          onClick={() => setSelectedMarket(market.id)}
                          data-testid={`supply-market-${market.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Coins className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{market.assetSymbol}</div>
                                <div className="text-xs text-muted-foreground">{market.assetName}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-500 font-medium">{formatBps(market.supplyRate)}</div>
                              <div className="text-xs text-muted-foreground">{t('lending.apy')}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="borrow" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('lending.borrowAssets')}</CardTitle>
                  <CardDescription>
                    {t('lending.borrowAssetsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('lending.selectMarket')}</Label>
                    <Select value={selectedMarket || ""} onValueChange={setSelectedMarket}>
                      <SelectTrigger data-testid="select-borrow-market">
                        <SelectValue placeholder={t('lending.chooseAssetToBorrow')} />
                      </SelectTrigger>
                      <SelectContent>
                        {markets?.filter(m => m.isActive && m.canBeBorrowed).map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            <div className="flex items-center gap-2">
                              <span>{market.assetSymbol}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-blue-500">{formatBps(market.borrowRateVariable)} APR</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMarketData && selectedMarketData.canBeBorrowed && (
                    <>
                      <div className="space-y-2">
                        <Label>{t('lending.amountToBorrow')}</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            data-testid="input-borrow-amount"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {selectedMarketData.assetSymbol}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('lending.rateMode')}</Label>
                        <Select value={rateMode} onValueChange={(v) => setRateMode(v as "variable" | "stable")}>
                          <SelectTrigger data-testid="select-rate-mode">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="variable">
                              {t('lending.variableRate', { rate: formatBps(selectedMarketData.borrowRateVariable) })}
                            </SelectItem>
                            <SelectItem value="stable">
                              {t('lending.stableRate', { rate: formatBps(selectedMarketData.borrowRateStable) })}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('lending.borrowAprMode', { mode: rateMode })}</span>
                          <span className="text-blue-500 font-medium">
                            {formatBps(rateMode === "variable" ? selectedMarketData.borrowRateVariable : selectedMarketData.borrowRateStable)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('lending.liquidationThreshold')}</span>
                          <span>{formatBps(selectedMarketData.liquidationThreshold)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('lending.availableToBorrow')}</span>
                          <span>{formatWeiToToken(selectedMarketData.availableLiquidity)}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-500">{t('lending.borrowingRisk')}</p>
                          <p className="text-muted-foreground">
                            {t('lending.borrowingRiskWarning', { penalty: formatBps(selectedMarketData.liquidationPenalty) })}
                          </p>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        disabled={!amount || borrowMutation.isPending}
                        onClick={() => {
                          if (selectedMarket && amount) {
                            const weiAmount = toWei(amount, selectedMarketData.assetDecimals);
                            borrowMutation.mutate({ 
                              marketId: selectedMarket, 
                              amount: weiAmount,
                              rateMode 
                            });
                          }
                        }}
                        data-testid="button-borrow"
                      >
                        {borrowMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-2" />
                        )}
                        {t('lending.borrowSymbol', { symbol: selectedMarketData.assetSymbol })}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('lending.borrowMarkets')}</CardTitle>
                  <CardDescription>{t('lending.borrowMarketsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {markets?.filter(m => m.isActive && m.canBeBorrowed).map((market) => (
                        <div
                          key={market.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedMarket === market.id ? 'border-primary bg-primary/5' : 'hover-elevate'
                          }`}
                          onClick={() => setSelectedMarket(market.id)}
                          data-testid={`borrow-market-${market.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <CircleDollarSign className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-medium">{market.assetSymbol}</div>
                                <div className="text-xs text-muted-foreground">
                                  {t('lending.available', { amount: formatWeiToToken(market.availableLiquidity) })}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-500 font-medium">{formatBps(market.borrowRateVariable)}</div>
                              <div className="text-xs text-muted-foreground">{t('lending.apr')}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('lending.recentTransactions')}</CardTitle>
                <CardDescription>{t('lending.recentTransactionsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {recentTransactions.length > 0 ? recentTransactions.map((tx) => {
                      const TxIcon = txTypeIcons[tx.txType] || Activity;
                      const txColor = txTypeColors[tx.txType] || "text-muted-foreground";
                      
                      return (
                        <div 
                          key={tx.id}
                          className="flex items-center justify-between gap-4 p-3 rounded-lg border flex-wrap"
                          data-testid={`tx-${tx.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${txColor}`}>
                              <TxIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium capitalize flex items-center gap-2">
                                {tx.txType}
                                <Badge variant="outline" className="text-xs">
                                  {tx.assetSymbol}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {tx.userAddress.slice(0, 8)}...{tx.userAddress.slice(-6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatWeiToToken(tx.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {tx.amountUsd ? formatUSD(tx.amountUsd) : '-'}
                            </div>
                          </div>
                          <Badge 
                            variant={tx.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {tx.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Timer className="h-3 w-3 mr-1" />
                            )}
                            {tx.status}
                          </Badge>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('lending.noRecentTransactions')}</p>
                        <p className="text-sm mt-2">{t('lending.transactionsWillAppear')}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('lending.atRiskPositions')}</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">
                    {riskData?.atRiskCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('lending.healthFactorBetween')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('lending.liquidatablePositions')}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {riskData?.liquidatableCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('lending.healthFactorBelow')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('lending.recentLiquidations')}</CardTitle>
                  <Zap className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {recentLiquidations.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('lending.inLast24Hours')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>{t('lending.liquidation')}</CardTitle>
                  <CardDescription>{t('lending.liquidationDesc')}</CardDescription>
                </div>
                <Button
                  onClick={() => setLiquidateDialogOpen(true)}
                  data-testid="button-open-liquidate"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t('lending.liquidatePosition')}
                </Button>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('lending.liquidationHistory')}</CardTitle>
                <CardDescription>{t('lending.liquidationHistoryDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {recentLiquidations.length > 0 ? recentLiquidations.map((liq) => (
                      <div 
                        key={liq.id}
                        className="p-4 rounded-lg border border-red-500/20 bg-red-500/5"
                        data-testid={`liquidation-${liq.id}`}
                      >
                        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="font-medium">{t('lending.liquidationEvent')}</span>
                          </div>
                          <Badge variant="destructive">
                            {liq.debtSymbol} / {liq.collateralSymbol}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">{t('lending.borrower')}</div>
                            <div className="font-mono">{liq.borrowerAddress.slice(0, 10)}...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{t('lending.liquidator')}</div>
                            <div className="font-mono">{liq.liquidatorAddress.slice(0, 10)}...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{t('lending.debtRepaid')}</div>
                            <div className="font-medium">{formatWeiToToken(liq.debtRepaid)} {liq.debtSymbol}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{t('lending.collateralSeized')}</div>
                            <div className="font-medium">{formatWeiToToken(liq.collateralSeized)} {liq.collateralSymbol}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-red-500/20 flex items-center justify-between text-sm gap-2 flex-wrap">
                          <div className="text-muted-foreground">
                            {t('lending.bonus', { amount: formatWeiToToken(liq.liquidationBonus), symbol: liq.collateralSymbol })}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {liq.txHash.slice(0, 18)}...
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('lending.noRecentLiquidations')}</p>
                        <p className="text-sm mt-2">{t('lending.protocolOperatingHealthily')}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {dialogAction === "supply" && <Plus className="h-5 w-5 text-green-500" />}
                {dialogAction === "withdraw" && <Minus className="h-5 w-5 text-orange-500" />}
                {dialogAction === "borrow" && <ArrowDownRight className="h-5 w-5 text-blue-500" />}
                {dialogAction === "repay" && <ArrowUpRight className="h-5 w-5 text-purple-500" />}
                {getDialogTitle()}
              </DialogTitle>
              <DialogDescription>{getDialogDescription()}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {dialogMarket && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{dialogMarket.assetSymbol}</div>
                    <div className="text-sm text-muted-foreground">{dialogMarket.assetName}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('lending.amount')}</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0.0"
                    value={dialogAmount}
                    onChange={(e) => setDialogAmount(e.target.value)}
                    data-testid="input-dialog-amount"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {dialogMarket?.assetSymbol}
                  </div>
                </div>
              </div>

              {dialogAction === "supply" && dialogMarket?.canBeCollateral && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="dialog-collateral">{t('lending.useAsCollateral')}</Label>
                  <Switch 
                    id="dialog-collateral"
                    checked={useAsCollateral}
                    onCheckedChange={setUseAsCollateral}
                    data-testid="switch-dialog-collateral"
                  />
                </div>
              )}

              {dialogAction === "borrow" && (
                <div className="space-y-2">
                  <Label>{t('lending.rateMode')}</Label>
                  <Select value={rateMode} onValueChange={(v) => setRateMode(v as "variable" | "stable")}>
                    <SelectTrigger data-testid="select-dialog-rate-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variable">
                        {t('lending.variableRate', { rate: formatBps(dialogMarket?.borrowRateVariable || 0) })}
                      </SelectItem>
                      <SelectItem value="stable">
                        {t('lending.stableRate', { rate: formatBps(dialogMarket?.borrowRateStable || 0) })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                {dialogAction === "supply" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('lending.supplyApy')}</span>
                      <span className="text-green-500 font-medium">{formatBps(dialogMarket?.supplyRate || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('lending.collateralFactor')}</span>
                      <span>{formatBps(dialogMarket?.collateralFactor || 0)}</span>
                    </div>
                  </>
                )}
                {dialogAction === "withdraw" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('lending.availableToWithdraw')}</span>
                      <span>{formatWeiToToken(dialogMarket?.availableLiquidity)}</span>
                    </div>
                  </>
                )}
                {dialogAction === "borrow" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('lending.borrowApr')}</span>
                      <span className="text-blue-500 font-medium">
                        {formatBps(rateMode === "variable" ? (dialogMarket?.borrowRateVariable || 0) : (dialogMarket?.borrowRateStable || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('lending.liquidationPenalty')}</span>
                      <span>{formatBps(dialogMarket?.liquidationPenalty || 0)}</span>
                    </div>
                  </>
                )}
                {dialogAction === "repay" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('lending.currentBorrowApr')}</span>
                      <span className="text-blue-500">{formatBps(dialogMarket?.borrowRateVariable || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {(dialogAction === "borrow" || dialogAction === "withdraw") && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {dialogAction === "borrow" 
                      ? t('lending.ensureSufficientCollateral')
                      : t('lending.withdrawMayAffectHealth')}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeDialog} data-testid="button-dialog-cancel">
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleDialogSubmit}
                disabled={!dialogAmount || isDialogPending}
                data-testid="button-dialog-confirm"
              >
                {isDialogPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                {getActionButtonText()}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={liquidateDialogOpen} onOpenChange={setLiquidateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500" />
                {t('lending.liquidatePosition')}
              </DialogTitle>
              <DialogDescription>
                {t('lending.liquidateUnhealthyPosition')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('lending.borrowerAddress')}</Label>
                <Input
                  placeholder="0x..."
                  value={liquidateBorrower}
                  onChange={(e) => setLiquidateBorrower(e.target.value)}
                  className="font-mono"
                  data-testid="input-liquidate-borrower"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('lending.debtAsset')}</Label>
                <Select value={liquidateDebtMarket} onValueChange={setLiquidateDebtMarket}>
                  <SelectTrigger data-testid="select-liquidate-debt">
                    <SelectValue placeholder={t('lending.selectDebtAsset')} />
                  </SelectTrigger>
                  <SelectContent>
                    {markets?.filter(m => m.isActive).map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.assetSymbol} - {market.assetName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('lending.collateralAsset')}</Label>
                <Select value={liquidateCollateralMarket} onValueChange={setLiquidateCollateralMarket}>
                  <SelectTrigger data-testid="select-liquidate-collateral">
                    <SelectValue placeholder={t('lending.selectCollateralAsset')} />
                  </SelectTrigger>
                  <SelectContent>
                    {markets?.filter(m => m.isActive && m.canBeCollateral).map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.assetSymbol} - {market.assetName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('lending.debtAmountToCover')}</Label>
                <Input
                  type="text"
                  placeholder="0.0"
                  value={liquidateAmount}
                  onChange={(e) => setLiquidateAmount(e.target.value)}
                  data-testid="input-liquidate-amount"
                />
              </div>

              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-red-500">{t('lending.liquidationWarning')}</p>
                  <p>{t('lending.liquidationWarningDesc')}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setLiquidateDialogOpen(false);
                  resetLiquidateForm();
                }}
                data-testid="button-liquidate-cancel"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleLiquidateSubmit}
                disabled={liquidateMutation.isPending || !liquidateBorrower || !liquidateDebtMarket || !liquidateCollateralMarket || !liquidateAmount}
                data-testid="button-liquidate-confirm"
              >
                {liquidateMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                {liquidateMutation.isPending ? t('lending.processing') : t('lending.executeLiquidation')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </TooltipProvider>
  );
}
