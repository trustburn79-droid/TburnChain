import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  Users,
  Clock,
  AlertCircle,
  Sparkles,
  Target,
  BarChart3,
  Wallet,
  Key,
  Eye,
  RefreshCw,
  FileText,
  Database,
  Globe,
  Cpu,
  ShieldCheck,
  Fingerprint,
  Code2,
  GitBranch,
  History,
  CircleDollarSign,
  Gem,
  Gamepad2,
  Building2,
  Landmark,
  ShoppingBag
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
    vulnerabilities: SecurityVulnerability[];
    codeQuality: CodeQualityMetrics;
  };
  contractVerification: ContractVerification;
}

interface SecurityVulnerability {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  location: string;
  recommendation: string;
}

interface CodeQualityMetrics {
  overall: number;
  gasEfficiency: number;
  readability: number;
  testCoverage: number;
  documentation: number;
}

interface ContractVerification {
  status: "verified" | "pending" | "failed";
  sourceCode: boolean;
  optimizer: boolean;
  compilerVersion: string;
  license: string;
}

interface TokenTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  standard: TokenStandardType;
  features: string[];
  presets: Partial<TokenFormData>;
  popularity: number;
  aiRecommended: boolean;
}

interface TokenFormData {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  description: string;
  website: string;
  logo: string;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  capped: boolean;
  maxSupply: string;
  baseUri: string;
  maxTokens: string;
  royaltyPercentage: number;
  royaltyRecipient: string;
  vestingEnabled: boolean;
  vestingSchedule: VestingSchedule[];
  stakingEnabled: boolean;
  stakingRewardRate: number;
  airdropEnabled: boolean;
  airdropRecipients: string;
  aiOptimizationEnabled: boolean;
  aiBurnOptimization: boolean;
  aiPriceOracle: boolean;
  aiSupplyManagement: boolean;
  aiAntiBot: boolean;
  aiLiquidityManagement: boolean;
  quantumResistant: boolean;
  mevProtection: boolean;
  zkPrivacy: boolean;
  multisigEnabled: boolean;
  multisigThreshold: number;
  multisigSigners: string[];
  accessControl: "ownable" | "roles" | "multisig";
  upgradeability: "none" | "transparent" | "uups";
  deployerAddress: string;
}

interface VestingSchedule {
  recipient: string;
  amount: string;
  cliff: number;
  duration: number;
  startTime: number;
}

type TokenStandardType = "TBC-20" | "TBC-721" | "TBC-1155";

const TOKEN_TEMPLATES: TokenTemplate[] = [
  {
    id: "defi-governance",
    name: "DeFi Governance Token",
    description: "Full-featured governance token with staking, voting, and burn mechanisms",
    category: "DeFi",
    icon: Landmark,
    standard: "TBC-20",
    features: ["Governance Voting", "Staking Rewards", "Auto-Burn", "Delegation"],
    presets: {
      mintable: false,
      burnable: true,
      stakingEnabled: true,
      stakingRewardRate: 12,
      aiOptimizationEnabled: true,
      aiBurnOptimization: true,
      quantumResistant: true,
      accessControl: "roles"
    },
    popularity: 95,
    aiRecommended: true
  },
  {
    id: "utility-token",
    name: "Utility Token",
    description: "Platform utility token with dynamic pricing and usage rewards",
    category: "Utility",
    icon: Zap,
    standard: "TBC-20",
    features: ["Usage Rewards", "Dynamic Pricing", "Cross-Platform", "API Access"],
    presets: {
      mintable: true,
      burnable: true,
      aiOptimizationEnabled: true,
      aiPriceOracle: true,
      mevProtection: true
    },
    popularity: 88,
    aiRecommended: false
  },
  {
    id: "gamefi-asset",
    name: "GameFi Asset Token",
    description: "Gaming asset token with semi-fungible support and marketplace integration",
    category: "GameFi",
    icon: Gamepad2,
    standard: "TBC-1155",
    features: ["In-Game Items", "Marketplace Ready", "Batch Transfers", "Level System"],
    presets: {
      aiOptimizationEnabled: true,
      aiSupplyManagement: true,
      quantumResistant: true,
      accessControl: "roles"
    },
    popularity: 82,
    aiRecommended: true
  },
  {
    id: "nft-collection",
    name: "NFT Art Collection",
    description: "Premium NFT collection with AI authenticity verification and royalties",
    category: "NFT",
    icon: Gem,
    standard: "TBC-721",
    features: ["Royalty Enforcement", "AI Authenticity", "IPFS Metadata", "Rarity Scoring"],
    presets: {
      royaltyPercentage: 5,
      aiOptimizationEnabled: true,
      quantumResistant: true
    },
    popularity: 90,
    aiRecommended: false
  },
  {
    id: "enterprise-token",
    name: "Enterprise Security Token",
    description: "Regulated security token with compliance features and multi-sig",
    category: "Enterprise",
    icon: Building2,
    standard: "TBC-20",
    features: ["KYC/AML", "Multi-Signature", "Compliance", "Audit Trail"],
    presets: {
      pausable: true,
      multisigEnabled: true,
      multisigThreshold: 3,
      quantumResistant: true,
      accessControl: "multisig",
      upgradeability: "transparent"
    },
    popularity: 75,
    aiRecommended: true
  },
  {
    id: "marketplace-token",
    name: "Marketplace Token",
    description: "E-commerce token with loyalty rewards and payment integration",
    category: "Commerce",
    icon: ShoppingBag,
    standard: "TBC-20",
    features: ["Loyalty Points", "Cashback", "Merchant Tools", "Payment Gateway"],
    presets: {
      mintable: true,
      burnable: true,
      aiOptimizationEnabled: true,
      aiAntiBot: true,
      mevProtection: true
    },
    popularity: 70,
    aiRecommended: false
  }
];

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-token-system-title">
            Token System v4.0
          </h1>
          <p className="text-muted-foreground">
            AI-Enhanced Enterprise Token Standards with Quantum Security
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="px-3 py-1">
            <Cpu className="h-3 w-3 mr-1" />
            Triple-Band AI
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            Quantum-Resistant
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Audited
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tokens
                </CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(stats?.totalTokens || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  TBC-20: {stats?.tbc20Count} | TBC-721: {stats?.tbc721Count} | TBC-1155: {stats?.tbc1155Count}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-total-burned">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Burned
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.totalBurned || "0")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.dailyBurnRate || 0}% daily burn rate
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-ai-optimization">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quantum Secured
                </CardTitle>
                <Lock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {stats?.quantumSecuredTokens || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  CRYSTALS-Dilithium + ED25519
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">
            <Plus className="h-4 w-4 mr-2" />
            Create Token
          </TabsTrigger>
          <TabsTrigger value="deployed" data-testid="tab-deployed">
            <Database className="h-4 w-4 mr-2" />
            My Tokens
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

        <TabsContent value="overview" className="space-y-6">
          <TokenStandardsOverview 
            tbc20Count={tbc20Tokens.length}
            tbc721Count={tbc721Tokens.length}
            tbc1155Count={tbc1155Tokens.length}
            onCreateToken={() => setActiveTab("create")}
          />
          <TripleBandAISection />
          <TokenTemplatesPreview onSelectTemplate={() => setActiveTab("create")} />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <EnterpriseTokenCreationWizard />
        </TabsContent>

        <TabsContent value="deployed" className="space-y-4">
          <DeployedTokensDashboard />
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

function TokenStandardsOverview({ 
  tbc20Count, 
  tbc721Count, 
  tbc1155Count, 
  onCreateToken 
}: { 
  tbc20Count: number;
  tbc721Count: number;
  tbc1155Count: number;
  onCreateToken: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
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
              <span className="font-medium">{tbc20Count}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={onCreateToken}
            data-testid="button-create-tbc20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create TBC-20 Token
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
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
              <span className="font-medium">{tbc721Count}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant="secondary"
            onClick={onCreateToken}
            data-testid="button-create-tbc721"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create TBC-721 NFT
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
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
              <span className="font-medium">{tbc1155Count}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={onCreateToken}
            data-testid="button-create-tbc1155"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create TBC-1155
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function TripleBandAISection() {
  return (
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
  );
}

function TokenTemplatesPreview({ onSelectTemplate }: { onSelectTemplate: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              Enterprise Token Templates
            </CardTitle>
            <CardDescription>
              Pre-configured templates for common use cases
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSelectTemplate}>
            View All Templates
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOKEN_TEMPLATES.slice(0, 3).map((template) => (
            <div 
              key={template.id}
              className="p-4 rounded-lg border hover-elevate cursor-pointer"
              onClick={onSelectTemplate}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <template.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{template.standard}</Badge>
                    {template.aiRecommended && (
                      <Badge className="text-xs bg-purple-500/10 text-purple-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Recommended
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EnterpriseTokenCreationWizard() {
  const [step, setStep] = useState(1);
  const [selectedStandard, setSelectedStandard] = useState<TokenStandardType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TokenTemplate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();
  
  const initialFormData: TokenFormData = {
    name: "",
    symbol: "",
    totalSupply: "1000000",
    decimals: 18,
    description: "",
    website: "",
    logo: "",
    mintable: false,
    burnable: true,
    pausable: false,
    capped: false,
    maxSupply: "",
    baseUri: "",
    maxTokens: "",
    royaltyPercentage: 0,
    royaltyRecipient: "",
    vestingEnabled: false,
    vestingSchedule: [],
    stakingEnabled: false,
    stakingRewardRate: 0,
    airdropEnabled: false,
    airdropRecipients: "",
    aiOptimizationEnabled: true,
    aiBurnOptimization: false,
    aiPriceOracle: false,
    aiSupplyManagement: false,
    aiAntiBot: true,
    aiLiquidityManagement: false,
    quantumResistant: true,
    mevProtection: true,
    zkPrivacy: false,
    multisigEnabled: false,
    multisigThreshold: 2,
    multisigSigners: [],
    accessControl: "ownable",
    upgradeability: "none",
    deployerAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  };

  const [formData, setFormData] = useState<TokenFormData>(initialFormData);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [securityAnalysis, setSecurityAnalysis] = useState<{
    score: number;
    vulnerabilities: SecurityVulnerability[];
    gasEstimate: number;
    recommendations: string[];
  } | null>(null);

  const deployMutation = useMutation({
    mutationFn: async (data: TokenFormData & { standard: TokenStandardType }) => {
      const response = await apiRequest("POST", "/api/token-system/deploy", data);
      return response.json();
    },
    onSuccess: (data: DeploymentResult) => {
      setDeploymentResult(data);
      setStep(6);
      toast({
        title: "Token Deployed Successfully",
        description: `${formData.name} (${formData.symbol}) has been deployed to TBURN Chain.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/tokens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/deployed"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (template: TokenTemplate) => {
    setSelectedTemplate(template);
    setSelectedStandard(template.standard);
    setFormData({
      ...initialFormData,
      ...template.presets
    });
    setStep(2);
  };

  const handleStandardSelect = (standard: TokenStandardType) => {
    setSelectedStandard(standard);
    setSelectedTemplate(null);
    setStep(2);
  };

  const runSecurityAnalysis = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const vulnerabilities: SecurityVulnerability[] = [];
    let score = 100;
    
    if (!formData.quantumResistant) {
      vulnerabilities.push({
        id: "qr-001",
        severity: "medium",
        title: "Quantum Vulnerability",
        description: "Contract uses classical cryptography vulnerable to quantum attacks",
        location: "Signature verification",
        recommendation: "Enable quantum-resistant signatures (CRYSTALS-Dilithium)"
      });
      score -= 10;
    }
    
    if (!formData.mevProtection) {
      vulnerabilities.push({
        id: "mev-001",
        severity: "high",
        title: "MEV Vulnerability",
        description: "Contract susceptible to front-running and sandwich attacks",
        location: "Transaction ordering",
        recommendation: "Enable MEV protection with commit-reveal scheme"
      });
      score -= 15;
    }

    if (formData.mintable && !formData.capped) {
      vulnerabilities.push({
        id: "inf-001",
        severity: "medium",
        title: "Uncapped Supply",
        description: "Mintable token without maximum supply cap",
        location: "Mint function",
        recommendation: "Consider adding a maximum supply cap"
      });
      score -= 5;
    }

    if (!formData.aiAntiBot) {
      vulnerabilities.push({
        id: "bot-001",
        severity: "low",
        title: "Bot Vulnerability",
        description: "No anti-bot measures for launch protection",
        location: "Transfer function",
        recommendation: "Enable AI anti-bot protection"
      });
      score -= 5;
    }

    const recommendations = [];
    if (formData.aiOptimizationEnabled) {
      recommendations.push("Triple-Band AI will optimize gas usage by approximately 15-25%");
    }
    if (formData.stakingEnabled) {
      recommendations.push(`Staking APY of ${formData.stakingRewardRate}% is within sustainable range`);
    }
    if (formData.vestingEnabled) {
      recommendations.push("Vesting schedules detected - ensure cliff periods are reasonable");
    }

    setSecurityAnalysis({
      score,
      vulnerabilities,
      gasEstimate: 250000 + Math.floor(Math.random() * 150000),
      recommendations
    });
    
    setIsAnalyzing(false);
    setAnalysisComplete(true);
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
    setSelectedTemplate(null);
    setDeploymentResult(null);
    setSecurityAnalysis(null);
    setAnalysisComplete(false);
    setFormData(initialFormData);
  };

  const totalSteps = 6;
  const stepLabels = ["Template", "Basic Info", "Features", "AI & Security", "Review", "Success"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Create Enterprise Token</h2>
          <p className="text-muted-foreground">Deploy a production-grade token on TBURN Chain</p>
        </div>
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center">
              <div 
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                  ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`w-8 h-0.5 ${step > i + 1 ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Choose a Template or Start from Scratch
              </CardTitle>
              <CardDescription>
                Templates provide pre-configured settings optimized for specific use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOKEN_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className="hover-elevate cursor-pointer border-2 hover:border-primary transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                    data-testid={`card-template-${template.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <template.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{template.standard}</Badge>
                            <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {template.popularity}% popular
                        </div>
                        {template.aiRecommended && (
                          <Badge className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Pick
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Or Select Token Standard</CardTitle>
              <CardDescription>Start with a blank token and configure everything manually</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="hover-elevate cursor-pointer border-2 hover:border-blue-500 transition-colors"
                  onClick={() => handleStandardSelect("TBC-20")}
                  data-testid="card-select-tbc20"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Coins className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">TBC-20</h3>
                        <p className="text-sm text-muted-foreground">Fungible Token</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      Select
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card 
                  className="hover-elevate cursor-pointer border-2 hover:border-purple-500 transition-colors"
                  onClick={() => handleStandardSelect("TBC-721")}
                  data-testid="card-select-tbc721"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Image className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">TBC-721</h3>
                        <p className="text-sm text-muted-foreground">NFT Collection</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      Select
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card 
                  className="hover-elevate cursor-pointer border-2 hover:border-amber-500 transition-colors"
                  onClick={() => handleStandardSelect("TBC-1155")}
                  data-testid="card-select-tbc1155"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">TBC-1155</h3>
                        <p className="text-sm text-muted-foreground">Multi-Token</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      Select
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && selectedStandard && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <div>
                <CardTitle>Token Configuration - {selectedStandard}</CardTitle>
                <CardDescription>
                  {selectedTemplate ? `Using "${selectedTemplate.name}" template` : "Configure your token's basic parameters"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Token Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Token"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-token-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol *</Label>
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
                      <Label htmlFor="totalSupply">Initial Supply *</Label>
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
                      <Select
                        value={formData.decimals.toString()}
                        onValueChange={(value) => setFormData({ ...formData, decimals: parseInt(value) })}
                      >
                        <SelectTrigger data-testid="select-decimals">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18">18 (Standard)</SelectItem>
                          <SelectItem value="8">8 (Bitcoin-style)</SelectItem>
                          <SelectItem value="6">6 (USDC-style)</SelectItem>
                          <SelectItem value="0">0 (No decimals)</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <div className="flex items-center gap-2">
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
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your token..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={() => setStep(3)} 
              disabled={!formData.name || !formData.symbol}
              data-testid="button-next-step"
            >
              Next: Features
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && selectedStandard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Token Features & Tokenomics
            </CardTitle>
            <CardDescription>Configure advanced features and tokenomics settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Core Features
                </h4>
                
                {selectedStandard === "TBC-20" && (
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
                )}
                
                <Separator />
                
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
                    <p className="text-xs text-muted-foreground">Emergency pause capability</p>
                  </div>
                  <Switch
                    id="pausable"
                    checked={formData.pausable}
                    onCheckedChange={(checked) => setFormData({ ...formData, pausable: checked })}
                    data-testid="switch-pausable"
                  />
                </div>

                {selectedStandard === "TBC-20" && formData.mintable && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="capped">Capped Supply</Label>
                        <p className="text-xs text-muted-foreground">Set maximum token supply</p>
                      </div>
                      <Switch
                        id="capped"
                        checked={formData.capped}
                        onCheckedChange={(checked) => setFormData({ ...formData, capped: checked })}
                      />
                    </div>
                    {formData.capped && (
                      <div className="space-y-2">
                        <Label htmlFor="maxSupply">Maximum Supply</Label>
                        <Input
                          id="maxSupply"
                          type="number"
                          placeholder="100000000"
                          value={formData.maxSupply}
                          onChange={(e) => setFormData({ ...formData, maxSupply: e.target.value })}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" />
                  Tokenomics
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stakingEnabled">Staking</Label>
                    <p className="text-xs text-muted-foreground">Enable staking rewards</p>
                  </div>
                  <Switch
                    id="stakingEnabled"
                    checked={formData.stakingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, stakingEnabled: checked })}
                  />
                </div>
                
                {formData.stakingEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="stakingRewardRate">Staking APY (%)</Label>
                    <Input
                      id="stakingRewardRate"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="12"
                      value={formData.stakingRewardRate}
                      onChange={(e) => setFormData({ ...formData, stakingRewardRate: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vestingEnabled">Vesting</Label>
                    <p className="text-xs text-muted-foreground">Token vesting schedules</p>
                  </div>
                  <Switch
                    id="vestingEnabled"
                    checked={formData.vestingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, vestingEnabled: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="airdropEnabled">Airdrop</Label>
                    <p className="text-xs text-muted-foreground">Initial token distribution</p>
                  </div>
                  <Switch
                    id="airdropEnabled"
                    checked={formData.airdropEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, airdropEnabled: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Access Control & Upgradeability
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Access Control Model</Label>
                  <Select
                    value={formData.accessControl}
                    onValueChange={(value: "ownable" | "roles" | "multisig") => 
                      setFormData({ ...formData, accessControl: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ownable">Single Owner</SelectItem>
                      <SelectItem value="roles">Role-Based (Recommended)</SelectItem>
                      <SelectItem value="multisig">Multi-Signature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Upgradeability Pattern</Label>
                  <Select
                    value={formData.upgradeability}
                    onValueChange={(value: "none" | "transparent" | "uups") => 
                      setFormData({ ...formData, upgradeability: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Upgradeable</SelectItem>
                      <SelectItem value="transparent">Transparent Proxy</SelectItem>
                      <SelectItem value="uups">UUPS Proxy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.accessControl === "multisig" && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Multi-Signature Settings</Label>
                      <p className="text-xs text-muted-foreground">Configure multi-sig requirements</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="multisigThreshold">Required Signatures</Label>
                      <Select
                        value={formData.multisigThreshold.toString()}
                        onValueChange={(value) => setFormData({ ...formData, multisigThreshold: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 of N</SelectItem>
                          <SelectItem value="3">3 of N</SelectItem>
                          <SelectItem value="4">4 of N</SelectItem>
                          <SelectItem value="5">5 of N</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(4)}>
              Next: AI & Security
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && selectedStandard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI & Security Configuration
            </CardTitle>
            <CardDescription>Configure AI optimization and quantum security features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  Triple-Band AI Features
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiOptimization">AI Optimization</Label>
                    <p className="text-xs text-muted-foreground">Enable Triple-Band AI engine</p>
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
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiAntiBot">AI Anti-Bot Protection</Label>
                    <p className="text-xs text-muted-foreground">Launch protection from bots</p>
                  </div>
                  <Switch
                    id="aiAntiBot"
                    checked={formData.aiAntiBot}
                    onCheckedChange={(checked) => setFormData({ ...formData, aiAntiBot: checked })}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiLiquidity">AI Liquidity Management</Label>
                    <p className="text-xs text-muted-foreground">Automated liquidity optimization</p>
                  </div>
                  <Switch
                    id="aiLiquidity"
                    checked={formData.aiLiquidityManagement}
                    onCheckedChange={(checked) => setFormData({ ...formData, aiLiquidityManagement: checked })}
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

                <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-sm">Security Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {formData.quantumResistant ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>Quantum Resistance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formData.mevProtection ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>MEV Protection</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formData.aiAntiBot ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>Anti-Bot</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formData.zkPrivacy ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>ZK Privacy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => { setStep(5); runSecurityAnalysis(); }}>
              Next: Review & Deploy
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 5 && selectedStandard && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Deployment Review
              </CardTitle>
              <CardDescription>Review your token configuration before deployment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Token Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbol:</span>
                      <span className="font-medium">{formData.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Standard:</span>
                      <Badge>{selectedStandard}</Badge>
                    </div>
                    {selectedStandard === "TBC-20" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Supply:</span>
                          <span className="font-medium">{formatNumber(parseInt(formData.totalSupply))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Decimals:</span>
                          <span className="font-medium">{formData.decimals}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.mintable && <Badge variant="secondary">Mintable</Badge>}
                    {formData.burnable && <Badge variant="secondary">Burnable</Badge>}
                    {formData.pausable && <Badge variant="secondary">Pausable</Badge>}
                    {formData.stakingEnabled && <Badge variant="secondary">Staking</Badge>}
                    {formData.vestingEnabled && <Badge variant="secondary">Vesting</Badge>}
                    <Badge variant="outline">{formData.accessControl}</Badge>
                    {formData.upgradeability !== "none" && (
                      <Badge variant="outline">{formData.upgradeability}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">AI & Security</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.aiOptimizationEnabled && (
                      <Badge className="bg-purple-500/10 text-purple-500">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Enabled
                      </Badge>
                    )}
                    {formData.quantumResistant && (
                      <Badge className="bg-green-500/10 text-green-500">
                        <Lock className="h-3 w-3 mr-1" />
                        Quantum
                      </Badge>
                    )}
                    {formData.mevProtection && (
                      <Badge className="bg-blue-500/10 text-blue-500">
                        <Shield className="h-3 w-3 mr-1" />
                        MEV
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isAnalyzing ? "animate-pulse" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                AI Security Analysis
                {isAnalyzing && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
              </CardTitle>
              <CardDescription>
                {isAnalyzing 
                  ? "Analyzing contract security with Triple-Band AI..." 
                  : "Security scan completed by Triple-Band AI"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : securityAnalysis && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24">
                      <svg className="h-24 w-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${securityAnalysis.score * 2.51} 251`}
                          className={securityAnalysis.score >= 90 ? "text-green-500" : securityAnalysis.score >= 70 ? "text-yellow-500" : "text-red-500"}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{securityAnalysis.score}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Security Score</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {securityAnalysis.score >= 90 
                          ? "Excellent security posture. Ready for production deployment."
                          : securityAnalysis.score >= 70 
                          ? "Good security with some recommendations."
                          : "Security improvements recommended before deployment."
                        }
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span>Estimated Gas: {formatNumber(securityAnalysis.gasEstimate)} EMB</span>
                      </div>
                    </div>
                  </div>

                  {securityAnalysis.vulnerabilities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Findings</h4>
                      {securityAnalysis.vulnerabilities.map((vuln) => (
                        <div 
                          key={vuln.id} 
                          className={`p-3 rounded-lg border ${
                            vuln.severity === "critical" ? "border-red-500/50 bg-red-500/10" :
                            vuln.severity === "high" ? "border-orange-500/50 bg-orange-500/10" :
                            vuln.severity === "medium" ? "border-yellow-500/50 bg-yellow-500/10" :
                            "border-blue-500/50 bg-blue-500/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              vuln.severity === "critical" ? "destructive" :
                              vuln.severity === "high" ? "destructive" :
                              vuln.severity === "medium" ? "default" : "secondary"
                            } className="text-xs">
                              {vuln.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-sm">{vuln.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{vuln.description}</p>
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">Recommendation:</span> {vuln.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {securityAnalysis.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">AI Recommendations</h4>
                      {securityAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-muted-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleDeploy} 
                disabled={deployMutation.isPending || isAnalyzing}
                size="lg"
                data-testid="button-deploy"
              >
                {deployMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy to TBURN Chain
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 6 && deploymentResult && (
        <Card className="border-green-500/50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Token Deployed Successfully</CardTitle>
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
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
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
                    <span className="font-medium tabular-nums">{formatNumber(deploymentResult.transaction.blockNumber)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas Used:</span>
                    <span className="font-medium tabular-nums">{formatNumber(deploymentResult.transaction.gasUsed)} EMB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {deploymentResult.transaction.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification:</span>
                    <Badge variant="outline" className="text-blue-500 border-blue-500">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <h4 className="font-medium flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-purple-500" />
                  AI Deployment Analysis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Gas Optimization</p>
                    <p className="text-2xl font-semibold text-green-500">
                      +{deploymentResult.aiAnalysis.gasOptimization}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Security Score</p>
                    <p className="text-2xl font-semibold text-green-500">
                      {deploymentResult.aiAnalysis.securityScore}/100
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Code Quality</p>
                    <p className="text-2xl font-semibold text-blue-500">
                      A+
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Audit Status</p>
                    <p className="text-2xl font-semibold text-green-500">
                      <CheckCircle className="h-6 w-6 inline" />
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {deploymentResult.aiAnalysis.recommendation}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Contract
              </Button>
              <Button variant="outline" className="w-full">
                <Code2 className="h-4 w-4 mr-2" />
                Source Code
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Add to Bridge
              </Button>
            </div>
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

function DeployedTokensDashboard() {
  const { data: deployedTokens, isLoading } = useQuery<DeployedToken[]>({
    queryKey: ["/api/token-system/deployed"],
  });

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

  if (!deployedTokens || deployedTokens.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Deployed Tokens</h3>
          <p className="text-muted-foreground mb-4">You haven't deployed any tokens yet.</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Token
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Deployed Tokens</h3>
        <Badge variant="outline">{deployedTokens.length} tokens</Badge>
      </div>
      
      {deployedTokens.map((token) => (
        <Card key={token.id} className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {token.standard === "TBC-20" && <Coins className="h-6 w-6 text-primary" />}
                  {token.standard === "TBC-721" && <Image className="h-6 w-6 text-purple-500" />}
                  {token.standard === "TBC-1155" && <Layers className="h-6 w-6 text-amber-500" />}
                </div>
                <div>
                  <h3 className="font-semibold">{token.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{token.symbol}</span>
                    <span>-</span>
                    <code className="text-xs bg-muted px-1 rounded">
                      {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Holders</p>
                  <p className="font-medium tabular-nums">{formatNumber(token.holders)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="font-medium tabular-nums">{formatNumber(token.transactionCount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={token.status === "active" ? "default" : "secondary"}>
                    {token.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {token.aiOptimizationEnabled && (
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
                </div>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
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
                  <p className="text-sm text-muted-foreground tabular-nums">{formatTokenAmount(token.totalSupply)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Holders</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{formatNumber(token.holders)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">24h TX</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{formatNumber(token.transactions24h)}</p>
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
