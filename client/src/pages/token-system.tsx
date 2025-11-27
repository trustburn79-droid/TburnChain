import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, 
  Image, 
  Layers, 
  Shield, 
  Brain, 
  Zap, 
  Lock,
  Flame,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";
import { formatNumber, formatTokenAmount } from "@/lib/formatters";

interface TokenStandard {
  id: string;
  name: string;
  symbol: string;
  standard: "TBC-20" | "TBC-721" | "TBC-1155";
  totalSupply: string;
  holders: number;
  transactions24h: number;
  burnRate: number;
  aiEnabled: boolean;
  quantumResistant: boolean;
  mevProtection: boolean;
  features: string[];
}

interface TokenSystemStats {
  totalTokens: number;
  tbc20Count: number;
  tbc721Count: number;
  tbc1155Count: number;
  totalBurned: string;
  dailyBurnRate: number;
  aiOptimizationRate: number;
  quantumSecuredTokens: number;
}

export default function TokenSystem() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<TokenSystemStats>({
    queryKey: ["/api/token-system/stats"],
  });

  const { data: tokens, isLoading: tokensLoading } = useQuery<TokenStandard[]>({
    queryKey: ["/api/token-system/tokens"],
  });

  const tbc20Tokens = tokens?.filter(t => t.standard === "TBC-20") || [];
  const tbc721Tokens = tokens?.filter(t => t.standard === "TBC-721") || [];
  const tbc1155Tokens = tokens?.filter(t => t.standard === "TBC-1155") || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-token-system-title">
            Token System v4.0
          </h1>
          <p className="text-muted-foreground">
            AI-Enhanced Enterprise Token Standards with Quantum Security
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Quantum-Resistant
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
            <Card className="hover-elevate" data-testid="card-total-tokens">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tokens
                </CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(stats?.totalTokens || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  TBC-20: {stats?.tbc20Count} | TBC-721: {stats?.tbc721Count} | TBC-1155: {stats?.tbc1155Count}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-total-burned">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Burned
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.totalBurned || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.dailyBurnRate || 0}% daily burn rate
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-ai-optimization">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AI Optimization
                </CardTitle>
                <Brain className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {stats?.aiOptimizationRate || 0}%
                </div>
                <Progress value={stats?.aiOptimizationRate || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-quantum-secured">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quantum Secured
                </CardTitle>
                <Lock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {stats?.quantumSecuredTokens || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  CRYSTALS-Dilithium + ED25519
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Token Standards Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tbc20" data-testid="tab-tbc20">
            <Coins className="h-4 w-4 mr-2" />
            TBC-20
          </TabsTrigger>
          <TabsTrigger value="tbc721" data-testid="tab-tbc721">
            <Image className="h-4 w-4 mr-2" />
            TBC-721
          </TabsTrigger>
          <TabsTrigger value="tbc1155" data-testid="tab-tbc1155">
            <Layers className="h-4 w-4 mr-2" />
            TBC-1155
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TBC-20 Card */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-blue-500" />
                    TBC-20
                  </CardTitle>
                  <Badge>ERC-20 Compatible</Badge>
                </div>
                <CardDescription>
                  Enhanced fungible token standard with AI optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI-driven burn optimization
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Quantum-resistant signatures
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Self-adjusting gas fees
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    MEV protection
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Zero-knowledge privacy (optional)
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Tokens:</span>
                    <span className="font-medium">{tbc20Tokens.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TBC-721 Card */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-purple-500" />
                    TBC-721
                  </CardTitle>
                  <Badge variant="secondary">NFT Standard</Badge>
                </div>
                <CardDescription>
                  AI-Enhanced NFT with authenticity & rarity scoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI authenticity verification
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dynamic rarity scoring
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Quantum-resistant ownership
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI valuation engine
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cross-chain bridging
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Collections:</span>
                    <span className="font-medium">{tbc721Tokens.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TBC-1155 Card */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-amber-500" />
                    TBC-1155
                  </CardTitle>
                  <Badge variant="outline">Multi-Token</Badge>
                </div>
                <CardDescription>
                  Multi-token standard with batch optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fungible + Non-fungible
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI batch optimization
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Semi-fungible support
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Gas-efficient transfers
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI supply management
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Contracts:</span>
                    <span className="font-medium">{tbc1155Tokens.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Triple-Band Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Triple-Band AI Orchestration
              </CardTitle>
              <CardDescription>
                AI-first token management with strategic, tactical, and operational layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Strategic Layer</h4>
                      <p className="text-xs text-muted-foreground">GPT-5 Turbo</p>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Token economics strategy</li>
                    <li>• Governance analysis</li>
                    <li>• Burn mechanism optimization</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Tactical Layer</h4>
                      <p className="text-xs text-muted-foreground">Claude Sonnet 4.5</p>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time optimization</li>
                    <li>• Security analysis</li>
                    <li>• MEV protection</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Operational Layer</h4>
                      <p className="text-xs text-muted-foreground">Llama 3.3 70B</p>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Transaction routing</li>
                    <li>• Cache optimization</li>
                    <li>• Resource allocation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tbc20" className="space-y-4">
          <TokenList tokens={tbc20Tokens} isLoading={tokensLoading} standard="TBC-20" />
        </TabsContent>

        <TabsContent value="tbc721" className="space-y-4">
          <TokenList tokens={tbc721Tokens} isLoading={tokensLoading} standard="TBC-721" />
        </TabsContent>

        <TabsContent value="tbc1155" className="space-y-4">
          <TokenList tokens={tbc1155Tokens} isLoading={tokensLoading} standard="TBC-1155" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TokenList({ tokens, isLoading, standard }: { tokens: TokenStandard[], isLoading: boolean, standard: string }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No {standard} tokens deployed yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tokens.map((token) => (
        <Card key={token.id} className="hover-elevate" data-testid={`card-token-${token.symbol}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {standard === "TBC-20" && <Coins className="h-6 w-6 text-primary" />}
                  {standard === "TBC-721" && <Image className="h-6 w-6 text-purple-500" />}
                  {standard === "TBC-1155" && <Layers className="h-6 w-6 text-amber-500" />}
                </div>
                <div>
                  <h3 className="font-semibold">{token.name}</h3>
                  <p className="text-sm text-muted-foreground">{token.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Supply</p>
                  <p className="text-sm text-muted-foreground">{formatTokenAmount(token.totalSupply)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Holders</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(token.holders)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">24h TX</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(token.transactions24h)}</p>
                </div>
                <div className="flex gap-1">
                  {token.aiEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                  {token.quantumResistant && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      QR
                    </Badge>
                  )}
                  {token.mevProtection && (
                    <Badge className="bg-green-500/10 text-green-500 text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      MEV
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
