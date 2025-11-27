import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Activity,
  Plus,
  Rocket,
  Settings,
  ArrowRight,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { formatNumber, formatTokenAmount } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

interface DeployedToken {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  standard: string;
  totalSupply: string;
  decimals: number;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  aiOptimizationEnabled: boolean;
  quantumResistant: boolean;
  mevProtection: boolean;
  deployerAddress: string;
  deployedAt: string;
  holders: number;
  transactionCount: number;
  status: string;
}

interface DeploymentResult {
  success: boolean;
  token: DeployedToken;
  transaction: {
    hash: string;
    blockNumber: number;
    gasUsed: number;
    gasPrice: string;
    status: string;
    timestamp: string;
  };
  aiAnalysis: {
    gasOptimization: number;
    securityScore: number;
    recommendation: string;
  };
}

type TokenStandardType = "TBC-20" | "TBC-721" | "TBC-1155";

export default function TokenSystem() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-token-system-title">
            Token System v4.0
          </h1>
          <p className="text-muted-foreground">
            AI-Enhanced Enterprise Token Standards with Quantum Security
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Quantum-Resistant
          </Badge>
        </div>
      </div>

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">
            <Plus className="h-4 w-4 mr-2" />
            Create Token
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
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTab("create")}
                  data-testid="button-create-tbc20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create TBC-20 Token
                </Button>
              </CardFooter>
            </Card>

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
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => setActiveTab("create")}
                  data-testid="button-create-tbc721"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create TBC-721 NFT
                </Button>
              </CardFooter>
            </Card>

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
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab("create")}
                  data-testid="button-create-tbc1155"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create TBC-1155
                </Button>
              </CardFooter>
            </Card>
          </div>

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
                    <li>Token economics strategy</li>
                    <li>Governance analysis</li>
                    <li>Burn mechanism optimization</li>
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
                    <li>Real-time optimization</li>
                    <li>Security analysis</li>
                    <li>MEV protection</li>
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
                    <li>Transaction routing</li>
                    <li>Cache optimization</li>
                    <li>Resource allocation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <TokenCreationWizard />
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

function TokenCreationWizard() {
  const [step, setStep] = useState(1);
  const [selectedStandard, setSelectedStandard] = useState<TokenStandardType | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    totalSupply: "1000000",
    decimals: 18,
    mintable: false,
    burnable: true,
    pausable: false,
    maxSupply: "",
    baseUri: "",
    maxTokens: "",
    royaltyPercentage: 0,
    royaltyRecipient: "",
    aiOptimizationEnabled: true,
    aiBurnOptimization: false,
    aiPriceOracle: false,
    aiSupplyManagement: false,
    quantumResistant: true,
    mevProtection: true,
    zkPrivacy: false,
    deployerAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  });

  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const deployMutation = useMutation({
    mutationFn: async (data: typeof formData & { standard: TokenStandardType }) => {
      const response = await apiRequest("POST", "/api/token-system/deploy", data);
      return response.json();
    },
    onSuccess: (data: DeploymentResult) => {
      setDeploymentResult(data);
      setStep(4);
      toast({
        title: "Token Deployed Successfully",
        description: `${formData.name} (${formData.symbol}) has been deployed to TBURN Chain.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/tokens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStandardSelect = (standard: TokenStandardType) => {
    setSelectedStandard(standard);
    setStep(2);
  };

  const handleDeploy = () => {
    if (!selectedStandard) return;
    
    deployMutation.mutate({
      ...formData,
      standard: selectedStandard,
      totalSupply: selectedStandard === "TBC-20" 
        ? (BigInt(formData.totalSupply) * BigInt(10 ** formData.decimals)).toString()
        : formData.totalSupply
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedStandard(null);
    setDeploymentResult(null);
    setFormData({
      name: "",
      symbol: "",
      totalSupply: "1000000",
      decimals: 18,
      mintable: false,
      burnable: true,
      pausable: false,
      maxSupply: "",
      baseUri: "",
      maxTokens: "",
      royaltyPercentage: 0,
      royaltyRecipient: "",
      aiOptimizationEnabled: true,
      aiBurnOptimization: false,
      aiPriceOracle: false,
      aiSupplyManagement: false,
      quantumResistant: true,
      mevProtection: true,
      zkPrivacy: false,
      deployerAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create New Token</h2>
          <p className="text-muted-foreground">Deploy a new token on TBURN Chain with AI-enhanced features</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-2 w-8 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="hover-elevate cursor-pointer border-2 hover:border-blue-500 transition-colors"
            onClick={() => handleStandardSelect("TBC-20")}
            data-testid="card-select-tbc20"
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <Coins className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>TBC-20</CardTitle>
              <CardDescription>Fungible Token (ERC-20 Compatible)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Standard fungible tokens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI burn optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Cross-chain compatible
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Select TBC-20
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer border-2 hover:border-purple-500 transition-colors"
            onClick={() => handleStandardSelect("TBC-721")}
            data-testid="card-select-tbc721"
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Image className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>TBC-721</CardTitle>
              <CardDescription>NFT Collection (ERC-721 Compatible)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unique NFT tokens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI authenticity verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Royalty enforcement
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="secondary">
                Select TBC-721
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer border-2 hover:border-amber-500 transition-colors"
            onClick={() => handleStandardSelect("TBC-1155")}
            data-testid="card-select-tbc1155"
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-amber-500" />
              </div>
              <CardTitle>TBC-1155</CardTitle>
              <CardDescription>Multi-Token (ERC-1155 Compatible)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Fungible + Non-fungible
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Batch operations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Gas-efficient
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Select TBC-1155
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 2 && selectedStandard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Token Configuration - {selectedStandard}
            </CardTitle>
            <CardDescription>Configure your token's basic parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Token Name</Label>
                  <Input
                    id="name"
                    placeholder="My Token"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-token-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="MTK"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    maxLength={10}
                    data-testid="input-token-symbol"
                  />
                </div>
                {selectedStandard === "TBC-20" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="totalSupply">Total Supply</Label>
                      <Input
                        id="totalSupply"
                        type="number"
                        placeholder="1000000"
                        value={formData.totalSupply}
                        onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                        data-testid="input-total-supply"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decimals">Decimals</Label>
                      <Input
                        id="decimals"
                        type="number"
                        min={0}
                        max={18}
                        value={formData.decimals}
                        onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) || 18 })}
                        data-testid="input-decimals"
                      />
                    </div>
                  </>
                )}
                {selectedStandard === "TBC-721" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="baseUri">Base URI (Metadata)</Label>
                      <Input
                        id="baseUri"
                        placeholder="https://api.example.com/metadata/"
                        value={formData.baseUri}
                        onChange={(e) => setFormData({ ...formData, baseUri: e.target.value })}
                        data-testid="input-base-uri"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max Tokens (0 = unlimited)</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        placeholder="10000"
                        value={formData.maxTokens}
                        onChange={(e) => setFormData({ ...formData, maxTokens: e.target.value })}
                        data-testid="input-max-tokens"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="royaltyPercentage">Royalty Percentage</Label>
                      <Input
                        id="royaltyPercentage"
                        type="number"
                        min={0}
                        max={50}
                        placeholder="5"
                        value={formData.royaltyPercentage}
                        onChange={(e) => setFormData({ ...formData, royaltyPercentage: parseInt(e.target.value) || 0 })}
                        data-testid="input-royalty"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Token Features</h4>
                {selectedStandard === "TBC-20" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mintable">Mintable</Label>
                        <p className="text-xs text-muted-foreground">Allow minting new tokens</p>
                      </div>
                      <Switch
                        id="mintable"
                        checked={formData.mintable}
                        onCheckedChange={(checked) => setFormData({ ...formData, mintable: checked })}
                        data-testid="switch-mintable"
                      />
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="burnable">Burnable</Label>
                    <p className="text-xs text-muted-foreground">Allow burning tokens</p>
                  </div>
                  <Switch
                    id="burnable"
                    checked={formData.burnable}
                    onCheckedChange={(checked) => setFormData({ ...formData, burnable: checked })}
                    data-testid="switch-burnable"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pausable">Pausable</Label>
                    <p className="text-xs text-muted-foreground">Allow pausing transfers</p>
                  </div>
                  <Switch
                    id="pausable"
                    checked={formData.pausable}
                    onCheckedChange={(checked) => setFormData({ ...formData, pausable: checked })}
                    data-testid="switch-pausable"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              onClick={() => setStep(3)} 
              disabled={!formData.name || !formData.symbol}
              data-testid="button-next-step"
            >
              Next: AI & Security
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && selectedStandard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI & Security Features
            </CardTitle>
            <CardDescription>Configure AI optimization and quantum security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  AI Features
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiOptimization">AI Optimization</Label>
                    <p className="text-xs text-muted-foreground">Enable Triple-Band AI</p>
                  </div>
                  <Switch
                    id="aiOptimization"
                    checked={formData.aiOptimizationEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, aiOptimizationEnabled: checked })}
                    data-testid="switch-ai-optimization"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiBurn">AI Burn Optimization</Label>
                    <p className="text-xs text-muted-foreground">GPT-5 optimized burning</p>
                  </div>
                  <Switch
                    id="aiBurn"
                    checked={formData.aiBurnOptimization}
                    onCheckedChange={(checked) => setFormData({ ...formData, aiBurnOptimization: checked })}
                    data-testid="switch-ai-burn"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiOracle">AI Price Oracle</Label>
                    <p className="text-xs text-muted-foreground">Real-time price feeds</p>
                  </div>
                  <Switch
                    id="aiOracle"
                    checked={formData.aiPriceOracle}
                    onCheckedChange={(checked) => setFormData({ ...formData, aiPriceOracle: checked })}
                    data-testid="switch-ai-oracle"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiSupply">AI Supply Management</Label>
                    <p className="text-xs text-muted-foreground">Llama 3.3 supply optimization</p>
                  </div>
                  <Switch
                    id="aiSupply"
                    checked={formData.aiSupplyManagement}
                    onCheckedChange={(checked) => setFormData({ ...formData, aiSupplyManagement: checked })}
                    data-testid="switch-ai-supply"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Security Features
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quantum">Quantum-Resistant</Label>
                    <p className="text-xs text-muted-foreground">CRYSTALS-Dilithium signatures</p>
                  </div>
                  <Switch
                    id="quantum"
                    checked={formData.quantumResistant}
                    onCheckedChange={(checked) => setFormData({ ...formData, quantumResistant: checked })}
                    data-testid="switch-quantum"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mev">MEV Protection</Label>
                    <p className="text-xs text-muted-foreground">Front-running protection</p>
                  </div>
                  <Switch
                    id="mev"
                    checked={formData.mevProtection}
                    onCheckedChange={(checked) => setFormData({ ...formData, mevProtection: checked })}
                    data-testid="switch-mev"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="zk">ZK Privacy</Label>
                    <p className="text-xs text-muted-foreground">Zero-knowledge transfers</p>
                  </div>
                  <Switch
                    id="zk"
                    checked={formData.zkPrivacy}
                    onCheckedChange={(checked) => setFormData({ ...formData, zkPrivacy: checked })}
                    data-testid="switch-zk"
                  />
                </div>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">Deployment Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Standard</p>
                    <p className="font-medium">{selectedStandard}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{formData.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Symbol</p>
                    <p className="font-medium">{formData.symbol || "-"}</p>
                  </div>
                  {selectedStandard === "TBC-20" && (
                    <div>
                      <p className="text-muted-foreground">Supply</p>
                      <p className="font-medium">{formatNumber(parseInt(formData.totalSupply) || 0)}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <Brain className="h-4 w-4 inline mr-2" />
                    Estimated Gas: ~250,000 - 400,000 EMB | AI Analysis: Enabled
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button 
              onClick={handleDeploy} 
              disabled={deployMutation.isPending}
              data-testid="button-deploy"
            >
              {deployMutation.isPending ? (
                <>Deploying...</>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy Token
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && deploymentResult && (
        <Card className="border-green-500/50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle>Token Deployed Successfully</CardTitle>
                <CardDescription>
                  Your {selectedStandard} token is now live on TBURN Chain
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Token Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{deploymentResult.token.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium">{deploymentResult.token.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard:</span>
                    <Badge>{deploymentResult.token.standard}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Contract:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {deploymentResult.token.contractAddress.slice(0, 10)}...
                        {deploymentResult.token.contractAddress.slice(-8)}
                      </code>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(deploymentResult.token.contractAddress)}
                      >
                        {copiedAddress ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block:</span>
                    <span className="font-medium">{formatNumber(deploymentResult.transaction.blockNumber)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas Used:</span>
                    <span className="font-medium">{formatNumber(deploymentResult.transaction.gasUsed)} EMB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      {deploymentResult.transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <h4 className="font-medium flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-purple-500" />
                  AI Analysis
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Gas Optimization</p>
                    <p className="text-2xl font-semibold text-green-500">
                      +{deploymentResult.aiAnalysis.gasOptimization}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Security Score</p>
                    <p className="text-2xl font-semibold text-green-500">
                      {deploymentResult.aiAnalysis.securityScore}/100
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {deploymentResult.aiAnalysis.recommendation}
                </p>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetWizard}>
              <Plus className="h-4 w-4 mr-2" />
              Create Another Token
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
          </CardFooter>
        </Card>
      )}
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
            <div className="flex items-center justify-between flex-wrap gap-4">
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
              <div className="flex items-center gap-4 flex-wrap">
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
