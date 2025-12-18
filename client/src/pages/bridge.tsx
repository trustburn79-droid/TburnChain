import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRightLeft, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Unlock,
  Brain,
  Shield,
  TrendingUp,
  Activity,
  Link2,
  Droplets,
  Zap,
  Server,
  Sparkles,
  XCircle,
  RefreshCw,
  Users,
  Coins,
  ExternalLink,
  Copy,
  Calendar,
  Hash,
  Wallet,
} from "lucide-react";
import { WalletRequiredBanner } from "@/components/require-wallet";

interface BridgeChain {
  id: string;
  chainId: number;
  name: string;
  symbol: string;
  nativeCurrency: string;
  status: string;
  avgBlockTime: number;
  confirmationsRequired: number;
  totalLiquidity: string;
  volume24h: string;
  txCount24h: number;
  avgTransferTime: number;
  successRate: number;
  aiRiskScore: number;
  isEvm: boolean;
}

interface BridgeRoute {
  id: string;
  sourceChainId: number;
  destinationChainId: number;
  tokenSymbol: string;
  routeType: string;
  status: string;
  minAmount: string;
  maxAmount: string;
  feePercent: number;
  estimatedTime: number;
  successRate: number;
  volume24h: string;
  liquidityAvailable: string;
  aiOptimized: boolean;
  aiPriority: number;
}

interface BridgeTransfer {
  id: string;
  sourceChainId: number;
  destinationChainId: number;
  senderAddress: string;
  recipientAddress: string;
  tokenSymbol: string;
  amount: string;
  amountReceived: string | null;
  feeAmount: string;
  status: string;
  sourceTxHash: string;
  destinationTxHash: string | null;
  confirmations: number;
  requiredConfirmations: number;
  estimatedArrival: string | null;
  aiVerified: boolean;
  aiRiskScore: number | null;
  createdAt: string;
}

interface BridgeLiquidityPool {
  id: string;
  chainId: number;
  tokenSymbol: string;
  totalLiquidity: string;
  availableLiquidity: string;
  utilizationRate: number;
  lpApy: number;
  providerCount: number;
  status: string;
  volume24h: string;
  fees24h: string;
}

interface BridgeValidator {
  id: string;
  address: string;
  name: string | null;
  status: string;
  stake: string;
  commission: number;
  uptime: number;
  attestationsProcessed: number;
  attestationsValid: number;
  rewardsEarned: string;
  avgResponseTime: number;
  aiTrustScore: number;
  reputationScore: number;
}

interface BridgeActivity {
  id: string;
  eventType: string;
  chainId: number | null;
  walletAddress: string | null;
  amount: string | null;
  tokenSymbol: string | null;
  txHash: string | null;
  createdAt: string;
}

interface BridgeOverview {
  totalChains: number;
  activeChains: number;
  totalRoutes: number;
  activeRoutes: number;
  totalValidators: number;
  activeValidators: number;
  totalLiquidity: string;
  totalVolume: string;
  volume24h: string;
  transferCount24h: number;
  avgTransferTime: number;
  successRate: number;
  fees24h: string;
  securityEventsCount: number;
  topChains: BridgeChain[];
  recentTransfers: BridgeTransfer[];
  recentActivity: BridgeActivity[];
}

function formatAmount(wei: string | null | undefined, decimals: number = 18): string {
  if (!wei || wei === "0") return "0";
  try {
    const value = BigInt(wei);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const remainder = value % divisor;
    const decimalStr = remainder.toString().padStart(decimals, '0').slice(0, 2);
    return `${integerPart.toLocaleString()}.${decimalStr}`;
  } catch {
    return "0";
  }
}

function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortenHash(hash: string): string {
  if (!hash) return "";
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function formatTime(ms: number): string {
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

function formatBasisPoints(bp: number): string {
  return `${(bp / 100).toFixed(2)}%`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-500/10 text-green-500",
    completed: "bg-green-500/10 text-green-500",
    pending: "bg-yellow-500/10 text-yellow-500",
    confirming: "bg-blue-500/10 text-blue-500",
    bridging: "bg-purple-500/10 text-purple-500",
    relaying: "bg-indigo-500/10 text-indigo-500",
    failed: "bg-red-500/10 text-red-500",
    refunded: "bg-orange-500/10 text-orange-500",
    paused: "bg-gray-500/10 text-gray-500",
    maintenance: "bg-orange-500/10 text-orange-500",
    rebalancing: "bg-blue-500/10 text-blue-500",
    inactive: "bg-gray-500/10 text-gray-500",
    slashed: "bg-red-500/10 text-red-500",
  };
  return colors[status] || colors.active;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed": return CheckCircle2;
    case "pending": return Clock;
    case "failed": return XCircle;
    case "refunded": return RefreshCw;
    default: return Activity;
  }
}

function ChainCard({ chain }: { chain: BridgeChain }) {
  const { t } = useTranslation();
  
  if (!chain || !chain.symbol || !chain.name) {
    return null;
  }
  
  return (
    <Card className="hover-elevate" data-testid={`card-chain-${chain.chainId}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
              {chain.symbol?.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-semibold">{chain.name || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground">{t("bridge.chainId")} {chain.chainId ?? 'N/A'}</div>
            </div>
          </div>
          <Badge className={getStatusColor(chain.status || 'inactive')}>{chain.status || 'inactive'}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">{t("bridge.liquidity")}</div>
            <div className="font-medium">{formatAmount(chain.totalLiquidity)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("bridge.volume24h")}</div>
            <div className="font-medium">{formatAmount(chain.volume24h)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("bridge.avgTime")}</div>
            <div className="font-medium">{formatTime(chain.avgTransferTime)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("bridge.successRate")}</div>
            <div className="font-medium text-green-500">{formatBasisPoints(chain.successRate)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>{t("bridge.transfers24h", { count: chain.txCount24h ?? 0 })}</span>
          {(chain.aiRiskScore ?? 1000) <= 200 && (
            <Badge variant="outline" className="text-green-500 border-green-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              {t("bridge.lowRisk")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TransferRow({ transfer, chains, onClaim, onClick }: { transfer: BridgeTransfer; chains: BridgeChain[]; onClaim?: (id: string) => void; onClick?: () => void }) {
  const { t } = useTranslation();
  const sourceChain = chains.find(c => c.chainId === transfer.sourceChainId);
  const destChain = chains.find(c => c.chainId === transfer.destinationChainId);
  const StatusIcon = getStatusIcon(transfer.status);
  const canClaim = ["relaying", "bridging", "confirming", "pending"].includes(transfer.status);
  
  return (
    <div 
      className="flex items-center gap-4 py-3 border-b last:border-0 cursor-pointer hover-elevate rounded-lg px-2 -mx-2" 
      data-testid={`row-transfer-${transfer.id}`}
      onClick={onClick}
    >
      <div className={`p-2 rounded-lg ${getStatusColor(transfer.status)}`}>
        <StatusIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{sourceChain?.symbol || transfer.sourceChainId}</span>
          <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium">{destChain?.symbol || transfer.destinationChainId}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatAmount(transfer.amount)} {transfer.tokenSymbol}
        </div>
      </div>
      <div className="text-right flex items-center gap-2">
        <div>
          <div className="text-sm font-medium">{transfer.confirmations}/{transfer.requiredConfirmations}</div>
          <div className="text-xs text-muted-foreground">
            {transfer.aiVerified && <Sparkles className="w-3 h-3 inline mr-1 text-purple-500" />}
            {shortenHash(transfer.sourceTxHash)}
          </div>
        </div>
        {canClaim && onClaim && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onClaim(transfer.id); }}
            data-testid={`button-claim-${transfer.id}`}
          >
            <Unlock className="w-3 h-3 mr-1" />
            {t("bridge.claim")}
          </Button>
        )}
      </div>
    </div>
  );
}

function ValidatorCard({ validator }: { validator: BridgeValidator }) {
  const { t } = useTranslation();
  const successRate = validator.attestationsProcessed > 0 
    ? (validator.attestationsValid / validator.attestationsProcessed) * 10000
    : 10000;
    
  return (
    <Card className="hover-elevate" data-testid={`card-validator-${validator.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold">{validator.name || shortenAddress(validator.address)}</div>
            <div className="text-sm text-muted-foreground">{shortenAddress(validator.address)}</div>
          </div>
          <Badge className={getStatusColor(validator.status)}>{validator.status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <div className="text-muted-foreground">{t("bridge.stake")}</div>
            <div className="font-medium">{formatAmount(validator.stake)} TBURN</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("bridge.commission")}</div>
            <div className="font-medium">{formatBasisPoints(validator.commission)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("bridge.uptime")}</div>
            <div className="font-medium text-green-500">{formatBasisPoints(validator.uptime)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("bridge.response")}</div>
            <div className="font-medium">{validator.avgResponseTime}ms</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{t("bridge.attestations", { count: validator.attestationsProcessed })}</span>
          <span className="text-green-500">{t("bridge.successLabel", { rate: formatBasisPoints(successRate) })}</span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>{t("bridge.aiScore", { score: formatBasisPoints(validator.aiTrustScore) })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LiquidityPoolRow({ pool, chain }: { pool: BridgeLiquidityPool; chain?: BridgeChain }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`row-pool-${pool.id}`}>
      <div className="p-2 rounded-lg bg-muted">
        <Droplets className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{pool.tokenSymbol}</span>
          <span className="text-sm text-muted-foreground">{t("bridge.on")} {chain?.name || `Chain ${pool.chainId}`}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{t("bridge.providers", { count: pool.providerCount })}</span>
          <span className="text-green-500">{t("bridge.apy", { rate: formatBasisPoints(pool.lpApy) })}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{formatAmount(pool.totalLiquidity)}</div>
        <Progress value={pool.utilizationRate / 100} className="w-20 h-1.5 mt-1" />
      </div>
    </div>
  );
}

function ActivityRow({ activity, chains, onClick }: { activity: BridgeActivity; chains: BridgeChain[]; onClick?: () => void }) {
  const chain = activity.chainId ? chains.find(c => c.chainId === activity.chainId) : null;
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case "transfer_initiated": return ArrowRightLeft;
      case "transfer_completed": return CheckCircle2;
      case "transfer_failed": return XCircle;
      case "liquidity_added": return Lock;
      case "liquidity_removed": return Unlock;
      case "validator_joined": return Server;
      case "security_alert": return AlertTriangle;
      default: return Activity;
    }
  };
  
  const EventIcon = getEventIcon(activity.eventType);
  
  return (
    <div 
      className="flex items-center gap-4 py-2 border-b last:border-0 cursor-pointer hover-elevate rounded-lg px-2 -mx-2" 
      data-testid={`row-activity-${activity.id}`}
      onClick={onClick}
    >
      <div className="p-1.5 rounded bg-muted">
        <EventIcon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium capitalize">{activity.eventType.replace(/_/g, ' ')}</div>
        <div className="text-xs text-muted-foreground">
          {chain?.name || (activity.chainId ? `Chain ${activity.chainId}` : '')}
          {activity.walletAddress && ` • ${shortenAddress(activity.walletAddress)}`}
        </div>
      </div>
      {activity.amount && activity.tokenSymbol && (
        <div className="text-sm font-medium">
          {formatAmount(activity.amount)} {activity.tokenSymbol}
        </div>
      )}
    </div>
  );
}

const getLocaleFromLanguage = (lang: string): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    ko: 'ko-KR',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ar: 'ar-SA',
    bn: 'bn-BD',
    es: 'es-ES',
    fr: 'fr-FR',
    hi: 'hi-IN',
    pt: 'pt-BR',
    ru: 'ru-RU',
    ur: 'ur-PK',
  };
  return localeMap[lang] || 'en-US';
};

export default function Bridge() {
  const { t, i18n } = useTranslation();
  const currentLocale = getLocaleFromLanguage(i18n.language);
  const [activeTab, setActiveTab] = useState("overview");
  const [sourceChain, setSourceChain] = useState<string>("");
  const [destChain, setDestChain] = useState<string>("");
  const [bridgeAmount, setBridgeAmount] = useState<string>("");
  const [selectedTransfer, setSelectedTransfer] = useState<BridgeTransfer | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<BridgeActivity | null>(null);
  const { toast } = useToast();

  const { data: overview, isLoading: overviewLoading } = useQuery<BridgeOverview>({
    queryKey: ["/api/bridge/stats"],
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const initiateTransferMutation = useMutation({
    mutationFn: async (data: { sourceChainId: number; destinationChainId: number; amount: string; tokenSymbol?: string }) => {
      const res = await apiRequest("POST", "/api/bridge/transfers/initiate", data);
      return res.json();
    },
    onSuccess: (transfer) => {
      toast({
        title: t("bridge.transferInitiated"),
        description: t("bridge.transferInitiatedDesc", { 
          amount: formatAmount(transfer.amount), 
          token: transfer.tokenSymbol, 
          source: transfer.sourceChainId, 
          dest: transfer.destinationChainId 
        }),
      });
      setBridgeAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("bridge.transferFailed"),
        description: error.message || t("bridge.transferFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const claimTransferMutation = useMutation({
    mutationFn: async (transferId: string) => {
      const res = await apiRequest("POST", `/api/bridge/transfers/${transferId}/claim`);
      return res.json();
    },
    onSuccess: (transfer) => {
      toast({
        title: t("bridge.transferClaimed"),
        description: t("bridge.transferClaimedDesc", { 
          amount: formatAmount(transfer.amountReceived), 
          token: transfer.tokenSymbol 
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("bridge.claimFailed"),
        description: error.message || t("bridge.claimFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const handleBridgeAssets = () => {
    if (!sourceChain || !destChain || !bridgeAmount) return;
    
    const amountInWei = (BigInt(Math.floor(parseFloat(bridgeAmount) * 1e18))).toString();
    
    initiateTransferMutation.mutate({
      sourceChainId: parseInt(sourceChain),
      destinationChainId: parseInt(destChain),
      amount: amountInWei,
      tokenSymbol: "TBURN",
    });
  };

  const handleClaimTransfer = (transferId: string) => {
    claimTransferMutation.mutate(transferId);
  };

  const { data: chains } = useQuery<BridgeChain[]>({
    queryKey: ["/api/bridge/chains"],
    refetchInterval: 15000,
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: routes } = useQuery<BridgeRoute[]>({
    queryKey: ["/api/bridge/routes"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: transfers } = useQuery<BridgeTransfer[]>({
    queryKey: ["/api/bridge/transfers"],
    refetchInterval: 5000,
    staleTime: 5000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: validators } = useQuery<BridgeValidator[]>({
    queryKey: ["/api/bridge/validators"],
    refetchInterval: 15000,
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: liquidityPools } = useQuery<BridgeLiquidityPool[]>({
    queryKey: ["/api/bridge/liquidity"],
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: activity } = useQuery<BridgeActivity[]>({
    queryKey: ["/api/bridge/activity"],
    refetchInterval: 5000,
    staleTime: 5000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const activeChains = chains?.filter(c => c.status === "active") || [];

  return (
    <div className="p-6 space-y-6">
      <WalletRequiredBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-bridge-title">
            {t("bridge.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("bridge.subtitle")}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          {t("bridge.multiSigProtected")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Link2 className="w-4 h-4" />
              <span className="text-sm">{t("bridge.chains")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-chains">
                {overview?.activeChains || 0}/{overview?.totalChains || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="text-sm">{t("bridge.routes")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-routes">
                {overview?.activeRoutes || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm">{t("bridge.validatorsTab")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-xl font-bold text-green-500" data-testid="text-validators">
                {overview?.activeValidators || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplets className="w-4 h-4" />
              <span className="text-sm">{t("bridge.liquidity")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-liquidity">
                ${formatAmount(overview?.totalLiquidity || "0")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t("bridge.volume24h")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-volume">
                ${formatAmount(overview?.volume24h || "0")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm">{t("bridge.transfers")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-transfers">
                {overview?.transferCount24h?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t("bridge.avgTime")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-avg-time">
                {formatTime(overview?.avgTransferTime || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">{t("bridge.success")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold text-green-500" data-testid="text-success-rate">
                {formatBasisPoints(overview?.successRate || 9900)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="w-4 h-4 mr-2" />
            {t("bridge.overview")}
          </TabsTrigger>
          <TabsTrigger value="bridge" data-testid="tab-bridge">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {t("bridge.bridge")}
          </TabsTrigger>
          <TabsTrigger value="chains" data-testid="tab-chains">
            <Link2 className="w-4 h-4 mr-2" />
            {t("bridge.chainsTab")} ({activeChains.length})
          </TabsTrigger>
          <TabsTrigger value="validators" data-testid="tab-validators">
            <Shield className="w-4 h-4 mr-2" />
            {t("bridge.validatorsTab")}
          </TabsTrigger>
          <TabsTrigger value="liquidity" data-testid="tab-liquidity">
            <Droplets className="w-4 h-4 mr-2" />
            {t("bridge.liquidityTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  {t("bridge.aiRiskAssessment")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("bridge.aiRiskAssessmentDesc")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{t("bridge.accuracy", { percent: 99.3 })}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  {t("bridge.routeOptimization")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("bridge.routeOptimizationDesc")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{t("bridge.gasSavings", { percent: 35 })}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  {t("bridge.quantumSecurity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("bridge.quantumSecurityDesc")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{t("bridge.postQuantum")}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                  {t("bridge.recentTransfers")}
                </CardTitle>
                <CardDescription>{t("bridge.latestCrossChainTransfers")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  {transfers?.slice(0, 15).map(transfer => (
                    <TransferRow 
                      key={transfer.id} 
                      transfer={transfer} 
                      chains={chains || []} 
                      onClaim={handleClaimTransfer}
                      onClick={() => setSelectedTransfer(transfer)}
                    />
                  ))}
                  {(!transfers || transfers.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground">
                      {t("bridge.noRecentTransfers")}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  {t("bridge.bridgeActivity")}
                </CardTitle>
                <CardDescription>{t("bridge.liveBridgeEvents")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  {activity?.slice(0, 20).map(act => (
                    <ActivityRow 
                      key={act.id} 
                      activity={act} 
                      chains={chains || []} 
                      onClick={() => setSelectedActivity(act)}
                    />
                  ))}
                  {(!activity || activity.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground">
                      {t("bridge.noRecentActivity")}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-green-500" />
                {t("bridge.connectedChains")}
              </CardTitle>
              <CardDescription>{t("bridge.supportedBlockchainNetworks")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeChains.filter(c => c && c.symbol && c.name).slice(0, 8).map(chain => (
                  <ChainCard key={chain.id} chain={chain} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bridge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{t("bridge.transferAssets")}</CardTitle>
                <CardDescription>{t("bridge.bridgeTokensAcrossChains")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("bridge.fromChain")}</Label>
                  <Select value={sourceChain} onValueChange={setSourceChain}>
                    <SelectTrigger data-testid="select-source-chain">
                      <SelectValue placeholder={t("bridge.selectSourceChain")} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeChains.filter(c => c.chainId != null && c.symbol && c.name).map(chain => (
                        <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                          {chain.name} ({chain.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button variant="ghost" size="icon" onClick={() => {
                    const temp = sourceChain;
                    setSourceChain(destChain);
                    setDestChain(temp);
                  }}>
                    <ArrowRightLeft className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>{t("bridge.toChain")}</Label>
                  <Select value={destChain} onValueChange={setDestChain}>
                    <SelectTrigger data-testid="select-dest-chain">
                      <SelectValue placeholder={t("bridge.selectDestinationChain")} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeChains.filter(c => c.chainId != null && c.symbol && c.name && c.chainId.toString() !== sourceChain).map(chain => (
                        <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                          {chain.name} ({chain.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("bridge.amount")}</Label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={bridgeAmount}
                    onChange={(e) => setBridgeAmount(e.target.value)}
                    data-testid="input-bridge-amount"
                  />
                </div>

                <Button 
                  className="w-full" 
                  disabled={!sourceChain || !destChain || !bridgeAmount || initiateTransferMutation.isPending} 
                  onClick={handleBridgeAssets}
                  data-testid="button-bridge"
                >
                  {initiateTransferMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {t("bridge.initiating")}
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      {t("bridge.bridgeAssets")}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  {t("bridge.aiVerifiedTransfers")}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("bridge.availableRoutes")}</CardTitle>
                <CardDescription>{t("bridge.optimizedTransferPaths")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {routes?.filter(r => r.status === "active").slice(0, 20).map(route => {
                      const source = chains?.find(c => c.chainId === route.sourceChainId);
                      const dest = chains?.find(c => c.chainId === route.destinationChainId);
                      return (
                        <div key={route.id} className="flex items-center gap-4 p-3 rounded-lg border" data-testid={`row-route-${route.id}`}>
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="outline">{source?.symbol || route.sourceChainId}</Badge>
                            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline">{dest?.symbol || route.destinationChainId}</Badge>
                            <span className="font-medium">{route.tokenSymbol}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t("bridge.feeLabel")} {formatBasisPoints(route.feePercent)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ~{formatTime(route.estimatedTime)}
                          </div>
                          {route.aiOptimized && (
                            <Badge variant="secondary">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {t("bridge.aiOptimized")}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("bridge.allChains")}</CardTitle>
              <CardDescription>{t("bridge.browseAllConnectedNetworks")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chains?.filter(c => c && c.symbol && c.name).map(chain => (
                  <ChainCard key={chain.id} chain={chain} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("bridge.bridgeValidators")}</CardTitle>
              <CardDescription>{t("bridge.decentralizedRelayerNetwork")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {validators?.map(validator => (
                  <ValidatorCard key={validator.id} validator={validator} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("bridge.liquidityPools")}</CardTitle>
              <CardDescription>{t("bridge.bridgeLiquidityAcrossChains")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {liquidityPools?.map(pool => {
                  const chain = chains?.find(c => c.chainId === pool.chainId);
                  return (
                    <LiquidityPoolRow key={pool.id} pool={pool} chain={chain} />
                  );
                })}
                {(!liquidityPools || liquidityPools.length === 0) && (
                  <div className="py-12 text-center text-muted-foreground">
                    {t("bridge.noLiquidityPools")}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedTransfer} onOpenChange={(open) => !open && setSelectedTransfer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              {t("bridge.transferDetails")}
            </DialogTitle>
            <DialogDescription>
              {t("bridge.crossChainTransferInfo")}
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (() => {
            const sourceChainInfo = chains?.find(c => c.chainId === selectedTransfer.sourceChainId);
            const destChainInfo = chains?.find(c => c.chainId === selectedTransfer.destinationChainId);
            const StatusIcon = getStatusIcon(selectedTransfer.status);
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{t("bridge.from")}</div>
                    <Badge variant="outline" className="text-sm">{sourceChainInfo?.name || `Chain ${selectedTransfer.sourceChainId}`}</Badge>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{t("bridge.to")}</div>
                    <Badge variant="outline" className="text-sm">{destChainInfo?.name || `Chain ${selectedTransfer.destinationChainId}`}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {t("bridge.amount")}
                    </div>
                    <div className="font-semibold">{formatAmount(selectedTransfer.amount)} {selectedTransfer.tokenSymbol}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {t("bridge.status")}
                    </div>
                    <Badge className={getStatusColor(selectedTransfer.status)}>{t(`bridge.statuses.${selectedTransfer.status}`)}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {t("bridge.confirmations")}
                    </div>
                    <div className="font-semibold">{selectedTransfer.confirmations}/{selectedTransfer.requiredConfirmations}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {t("bridge.fee")}
                    </div>
                    <div className="font-semibold">{formatAmount(selectedTransfer.feeAmount)} {selectedTransfer.tokenSymbol}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      {t("bridge.sender")}
                    </span>
                    <span className="font-mono text-xs">{shortenAddress(selectedTransfer.senderAddress)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      {t("bridge.recipient")}
                    </span>
                    <span className="font-mono text-xs">{shortenAddress(selectedTransfer.recipientAddress)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {t("bridge.sourceTxHash")}
                    </span>
                    <span className="font-mono text-xs flex items-center gap-1">
                      {shortenHash(selectedTransfer.sourceTxHash)}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                  {selectedTransfer.destinationTxHash && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {t("bridge.destTxHash")}
                      </span>
                      <span className="font-mono text-xs flex items-center gap-1">
                        {shortenHash(selectedTransfer.destinationTxHash)}
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t("bridge.createdAt")}
                    </span>
                    <span className="text-xs">{new Date(selectedTransfer.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}</span>
                  </div>
                </div>

                {selectedTransfer.aiVerified && (
                  <div className="flex items-center gap-2 p-2 rounded bg-purple-500/10 text-purple-500 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>{t("bridge.aiVerifiedTransfer")}</span>
                    {selectedTransfer.aiRiskScore !== null && (
                      <Badge variant="secondary" className="ml-auto">{t("bridge.riskScore", { score: selectedTransfer.aiRiskScore })}</Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t("bridge.activityDetails")}
            </DialogTitle>
            <DialogDescription>
              {t("bridge.bridgeEventInfo")}
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (() => {
            const chainInfo = selectedActivity.chainId ? chains?.find(c => c.chainId === selectedActivity.chainId) : null;
            return (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-lg font-semibold capitalize">
                    {t(`bridge.eventTypes.${selectedActivity.eventType}`)}
                  </div>
                  {chainInfo && (
                    <Badge variant="outline" className="mt-2">{chainInfo.name}</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedActivity.amount && selectedActivity.tokenSymbol && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {t("bridge.amount")}
                      </span>
                      <span className="font-semibold">{formatAmount(selectedActivity.amount)} {selectedActivity.tokenSymbol}</span>
                    </div>
                  )}
                  {selectedActivity.walletAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        {t("bridge.wallet")}
                      </span>
                      <span className="font-mono text-xs">{shortenAddress(selectedActivity.walletAddress)}</span>
                    </div>
                  )}
                  {selectedActivity.txHash && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {t("bridge.txHash")}
                      </span>
                      <span className="font-mono text-xs flex items-center gap-1">
                        {shortenHash(selectedActivity.txHash)}
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t("bridge.timestamp")}
                    </span>
                    <span className="text-xs">{new Date(selectedActivity.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
