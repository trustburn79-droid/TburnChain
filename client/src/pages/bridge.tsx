import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRightLeft, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Brain,
  Shield,
  TrendingUp,
  Activity,
  ExternalLink,
  Pause,
  Play
} from "lucide-react";
import { formatTokenAmount, formatNumber } from "@/lib/formatters";

interface ChainInfo {
  id: string;
  name: string;
  icon: string;
  status: "active" | "maintenance" | "paused";
  avgBlockTime: number;
  confirmations: number;
  liquidity: string;
  volume24h: string;
}

interface BridgeTransfer {
  id: string;
  sourceChain: string;
  targetChain: string;
  amount: string;
  token: string;
  from: string;
  to: string;
  status: "pending" | "locked" | "released" | "failed";
  signaturesCollected: number;
  signaturesRequired: number;
  riskScore: number;
  aiApproved: boolean;
  createdAt: string;
  estimatedCompletion: string;
}

interface BridgeStats {
  totalTransfers: number;
  totalVolume: string;
  pendingTransfers: number;
  avgTransferTime: number;
  successRate: number;
  aiRiskAssessments: number;
  highRiskBlocked: number;
}

const chainColors: Record<string, string> = {
  TBURNMainnet: "bg-primary",
  Ethereum: "bg-blue-500",
  BinanceSmartChain: "bg-yellow-500",
  Polygon: "bg-purple-500",
  Avalanche: "bg-red-500",
  Arbitrum: "bg-blue-600",
  Optimism: "bg-red-600",
  Base: "bg-blue-400",
};

export default function Bridge() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<BridgeStats>({
    queryKey: ["/api/bridge/stats"],
  });

  const { data: chains, isLoading: chainsLoading } = useQuery<ChainInfo[]>({
    queryKey: ["/api/bridge/chains"],
  });

  const { data: transfers, isLoading: transfersLoading } = useQuery<BridgeTransfer[]>({
    queryKey: ["/api/bridge/transfers"],
  });

  const pendingTransfers = transfers?.filter(t => t.status === "pending" || t.status === "locked") || [];
  const completedTransfers = transfers?.filter(t => t.status === "released") || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-bridge-title">
            Cross-Chain Bridge
          </h1>
          <p className="text-muted-foreground">
            AI-Enhanced Bridge with Quantum Security & Multi-Chain Support
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Multi-Sig Protected
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover-elevate" data-testid="card-total-transfers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transfers
                </CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(stats?.totalTransfers || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingTransfers || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-total-volume">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Volume
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.totalVolume || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  TBURN bridged
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-success-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {(stats?.successRate || 0).toFixed(1)}%
                </div>
                <Progress value={stats?.successRate || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-ai-risk">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AI Risk Blocked
                </CardTitle>
                <Brain className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(stats?.highRiskBlocked || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats?.aiRiskAssessments || 0)} assessments
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingTransfers.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Supported Chains */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Supported Chains
              </CardTitle>
              <CardDescription>
                Cross-chain bridging with AI-optimized routing and quantum security
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chainsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {chains?.map((chain) => (
                    <div
                      key={chain.id}
                      className="p-4 rounded-lg border hover-elevate cursor-pointer"
                      data-testid={`card-chain-${chain.id}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-8 w-8 rounded-full ${chainColors[chain.id] || 'bg-gray-500'} flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">
                            {chain.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{chain.name}</h4>
                          <Badge 
                            variant={chain.status === "active" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {chain.status === "active" && <Play className="h-3 w-3 mr-1" />}
                            {chain.status === "paused" && <Pause className="h-3 w-3 mr-1" />}
                            {chain.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Block Time:</span>
                          <span>{chain.avgBlockTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confirmations:</span>
                          <span>{chain.confirmations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Liquidity:</span>
                          <span>{formatTokenAmount(chain.liquidity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Features */}
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
                  Claude Sonnet 4.5 analyzes transfers for fraud, large amounts, suspicious patterns, and recent exploits.
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
                  GPT-5 Turbo optimizes cross-chain routes for gas costs, liquidity, transfer time, and reliability.
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
                  CRYSTALS-Dilithium + ED25519 hybrid signatures protect all bridge operations from quantum attacks.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">Post-Quantum</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <TransferList transfers={pendingTransfers} isLoading={transfersLoading} type="pending" />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <TransferList transfers={completedTransfers} isLoading={transfersLoading} type="completed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransferList({ transfers, isLoading, type }: { transfers: BridgeTransfer[], isLoading: boolean, type: string }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No {type} transfers</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transfers.map((transfer) => (
        <Card key={transfer.id} className="hover-elevate" data-testid={`card-transfer-${transfer.id}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-full ${chainColors[transfer.sourceChain] || 'bg-gray-500'} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {transfer.sourceChain.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <div className={`h-10 w-10 rounded-full ${chainColors[transfer.targetChain] || 'bg-gray-500'} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {transfer.targetChain.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">
                    {formatTokenAmount(transfer.amount)} {transfer.token}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transfer.sourceChain} → {transfer.targetChain}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Signatures</p>
                  <p className="text-sm text-muted-foreground">
                    {transfer.signaturesCollected}/{transfer.signaturesRequired}
                  </p>
                  <Progress 
                    value={(transfer.signaturesCollected / transfer.signaturesRequired) * 100} 
                    className="h-1 w-20 mt-1" 
                  />
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={transfer.status === "released" ? "default" : 
                             transfer.status === "pending" ? "secondary" : 
                             transfer.status === "locked" ? "outline" : "destructive"}
                  >
                    {transfer.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                    {transfer.status === "locked" && <Lock className="h-3 w-3 mr-1" />}
                    {transfer.status === "released" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {transfer.status === "failed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {transfer.status}
                  </Badge>
                  {transfer.aiApproved && (
                    <Badge variant="outline" className="text-green-500">
                      <Brain className="h-3 w-3 mr-1" />
                      AI OK
                    </Badge>
                  )}
                  {transfer.riskScore > 0.5 && (
                    <Badge variant="destructive">
                      Risk: {(transfer.riskScore * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
