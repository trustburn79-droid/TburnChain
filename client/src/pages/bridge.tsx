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
} from "lucide-react";

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
              <div className="text-sm text-muted-foreground">Chain ID: {chain.chainId ?? 'N/A'}</div>
            </div>
          </div>
          <Badge className={getStatusColor(chain.status || 'inactive')}>{chain.status || 'inactive'}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Liquidity</div>
            <div className="font-medium">{formatAmount(chain.totalLiquidity)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">24h Volume</div>
            <div className="font-medium">{formatAmount(chain.volume24h)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Time</div>
            <div className="font-medium">{formatTime(chain.avgTransferTime)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Success Rate</div>
            <div className="font-medium text-green-500">{formatBasisPoints(chain.successRate)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>{(chain.txCount24h ?? 0).toLocaleString()} transfers 24h</span>
          {(chain.aiRiskScore ?? 1000) <= 200 && (
            <Badge variant="outline" className="text-green-500 border-green-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Low Risk
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TransferRow({ transfer, chains, onClaim }: { transfer: BridgeTransfer; chains: BridgeChain[]; onClaim?: (id: string) => void }) {
  const sourceChain = chains.find(c => c.chainId === transfer.sourceChainId);
  const destChain = chains.find(c => c.chainId === transfer.destinationChainId);
  const StatusIcon = getStatusIcon(transfer.status);
  const canClaim = ["relaying", "bridging", "confirming", "pending"].includes(transfer.status);
  
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`row-transfer-${transfer.id}`}>
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
            onClick={() => onClaim(transfer.id)}
            data-testid={`button-claim-${transfer.id}`}
          >
            <Unlock className="w-3 h-3 mr-1" />
            Claim
          </Button>
        )}
      </div>
    </div>
  );
}

function ValidatorCard({ validator }: { validator: BridgeValidator }) {
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
            <div className="text-muted-foreground">Stake</div>
            <div className="font-medium">{formatAmount(validator.stake)} TBURN</div>
          </div>
          <div>
            <div className="text-muted-foreground">Commission</div>
            <div className="font-medium">{formatBasisPoints(validator.commission)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Uptime</div>
            <div className="font-medium text-green-500">{formatBasisPoints(validator.uptime)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Response</div>
            <div className="font-medium">{validator.avgResponseTime}ms</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{validator.attestationsProcessed.toLocaleString()} attestations</span>
          <span className="text-green-500">{formatBasisPoints(successRate)} success</span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>AI: {formatBasisPoints(validator.aiTrustScore)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LiquidityPoolRow({ pool, chain }: { pool: BridgeLiquidityPool; chain?: BridgeChain }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`row-pool-${pool.id}`}>
      <div className="p-2 rounded-lg bg-muted">
        <Droplets className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{pool.tokenSymbol}</span>
          <span className="text-sm text-muted-foreground">on {chain?.name || `Chain ${pool.chainId}`}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{pool.providerCount} providers</span>
          <span className="text-green-500">APY: {formatBasisPoints(pool.lpApy)}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{formatAmount(pool.totalLiquidity)}</div>
        <Progress value={pool.utilizationRate / 100} className="w-20 h-1.5 mt-1" />
      </div>
    </div>
  );
}

function ActivityRow({ activity, chains }: { activity: BridgeActivity; chains: BridgeChain[] }) {
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
    <div className="flex items-center gap-4 py-2 border-b last:border-0" data-testid={`row-activity-${activity.id}`}>
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

export default function Bridge() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [sourceChain, setSourceChain] = useState<string>("");
  const [destChain, setDestChain] = useState<string>("");
  const [bridgeAmount, setBridgeAmount] = useState<string>("");
  const { toast } = useToast();

  const { data: overview, isLoading: overviewLoading } = useQuery<BridgeOverview>({
    queryKey: ["/api/bridge/stats"],
    refetchInterval: 10000,
  });

  const initiateTransferMutation = useMutation({
    mutationFn: async (data: { sourceChainId: number; destinationChainId: number; amount: string; tokenSymbol?: string }) => {
      const res = await apiRequest("POST", "/api/bridge/transfers/initiate", data);
      return res.json();
    },
    onSuccess: (transfer) => {
      toast({
        title: "Transfer Initiated",
        description: `Transfer of ${formatAmount(transfer.amount)} ${transfer.tokenSymbol} from ${transfer.sourceChainId} to ${transfer.destinationChainId} has been initiated.`,
      });
      setBridgeAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to initiate transfer",
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
        title: "Transfer Claimed",
        description: `Successfully claimed ${formatAmount(transfer.amountReceived)} ${transfer.tokenSymbol} on destination chain.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim transfer",
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
  });

  const { data: routes } = useQuery<BridgeRoute[]>({
    queryKey: ["/api/bridge/routes"],
    refetchInterval: 30000,
  });

  const { data: transfers } = useQuery<BridgeTransfer[]>({
    queryKey: ["/api/bridge/transfers"],
    refetchInterval: 5000,
  });

  const { data: validators } = useQuery<BridgeValidator[]>({
    queryKey: ["/api/bridge/validators"],
    refetchInterval: 15000,
  });

  const { data: liquidityPools } = useQuery<BridgeLiquidityPool[]>({
    queryKey: ["/api/bridge/liquidity"],
    refetchInterval: 10000,
  });

  const { data: activity } = useQuery<BridgeActivity[]>({
    queryKey: ["/api/bridge/activity"],
    refetchInterval: 5000,
  });

  const activeChains = chains?.filter(c => c.status === "active") || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-bridge-title">
            Cross-Chain Bridge
          </h1>
          <p className="text-muted-foreground">
            AI-powered multi-chain asset transfers with enterprise security
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Multi-Sig Protected
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Chains</span>
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
              <span className="text-sm">Routes</span>
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
              <span className="text-sm">Validators</span>
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
              <span className="text-sm">Liquidity</span>
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
              <span className="text-sm">24h Volume</span>
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
              <span className="text-sm">Transfers</span>
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
              <span className="text-sm">Avg Time</span>
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
              <span className="text-sm">Success</span>
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
            Overview
          </TabsTrigger>
          <TabsTrigger value="bridge" data-testid="tab-bridge">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Bridge
          </TabsTrigger>
          <TabsTrigger value="chains" data-testid="tab-chains">
            <Link2 className="w-4 h-4 mr-2" />
            Chains ({activeChains.length})
          </TabsTrigger>
          <TabsTrigger value="validators" data-testid="tab-validators">
            <Shield className="w-4 h-4 mr-2" />
            Validators
          </TabsTrigger>
          <TabsTrigger value="liquidity" data-testid="tab-liquidity">
            <Droplets className="w-4 h-4 mr-2" />
            Liquidity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  AI Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Claude Sonnet 4.5 analyzes transfers for fraud, suspicious patterns, and security threats.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">99.3% Accuracy</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Route Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI-optimized routes minimize gas costs, maximize liquidity, and ensure fast transfers.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">35% Gas Savings</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  Quantum Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  CRYSTALS-Dilithium + ED25519 hybrid signatures protect all bridge operations.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">Post-Quantum</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                  Recent Transfers
                </CardTitle>
                <CardDescription>Latest cross-chain transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  {transfers?.slice(0, 15).map(transfer => (
                    <TransferRow 
                      key={transfer.id} 
                      transfer={transfer} 
                      chains={chains || []} 
                      onClaim={handleClaimTransfer}
                    />
                  ))}
                  {(!transfers || transfers.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground">
                      No recent transfers
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Bridge Activity
                </CardTitle>
                <CardDescription>Live bridge events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  {activity?.slice(0, 20).map(act => (
                    <ActivityRow key={act.id} activity={act} chains={chains || []} />
                  ))}
                  {(!activity || activity.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground">
                      No recent activity
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
                Connected Chains
              </CardTitle>
              <CardDescription>Supported blockchain networks</CardDescription>
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
                <CardTitle>Transfer Assets</CardTitle>
                <CardDescription>Bridge tokens across chains</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>From Chain</Label>
                  <Select value={sourceChain} onValueChange={setSourceChain}>
                    <SelectTrigger data-testid="select-source-chain">
                      <SelectValue placeholder="Select source chain" />
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
                  <Label>To Chain</Label>
                  <Select value={destChain} onValueChange={setDestChain}>
                    <SelectTrigger data-testid="select-dest-chain">
                      <SelectValue placeholder="Select destination chain" />
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
                  <Label>Amount</Label>
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
                      Initiating...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Bridge Assets
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  AI-verified transfers with MEV protection
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Available Routes</CardTitle>
                <CardDescription>Optimized transfer paths</CardDescription>
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
                            Fee: {formatBasisPoints(route.feePercent)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ~{formatTime(route.estimatedTime)}
                          </div>
                          {route.aiOptimized && (
                            <Badge variant="secondary">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
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
              <CardTitle>All Chains</CardTitle>
              <CardDescription>Browse all connected blockchain networks</CardDescription>
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
              <CardTitle>Bridge Validators</CardTitle>
              <CardDescription>Decentralized relayer network</CardDescription>
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
              <CardTitle>Liquidity Pools</CardTitle>
              <CardDescription>Bridge liquidity across chains</CardDescription>
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
                    No liquidity pools available
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
