import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  ShoppingBag,
  Upload,
  X,
  ImageIcon
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

const getTemplateTranslationKey = (templateId: string, field: 'name' | 'description' | 'category' | 'features'): string => {
  const keyMap: Record<string, string> = {
    'defi-governance': 'DefiGovernance',
    'utility-token': 'Utility',
    'gamefi-asset': 'Gamefi',
    'nft-collection': 'Nft',
    'enterprise-token': 'Enterprise',
    'marketplace-token': 'Marketplace'
  };
  const fieldKeyMap: Record<string, string> = {
    'name': 'Name',
    'description': 'Desc',
    'category': 'Category',
    'features': 'Feature'
  };
  const templateKey = keyMap[templateId] || templateId;
  if (field === 'features') {
    return `tokenSystem.template${templateKey}Feature`;
  }
  return `tokenSystem.template${templateKey}${fieldKeyMap[field] || field}`;
};

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

const getTranslatedCategory = (category: string, t: (key: string, fallback?: string) => string): string => {
  return t(`tokenSystem.categories.${category}`, category);
};

export default function TokenSystem() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<TokenSystemStats>({
    queryKey: ["/api/token-system/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: tokens, isLoading: tokensLoading } = useQuery<TokenStandard[]>({
    queryKey: ["/api/token-system/tokens"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const tbc20Tokens = tokens?.filter(t => t.standard === "TBC-20") || [];
  const tbc721Tokens = tokens?.filter(t => t.standard === "TBC-721") || [];
  const tbc1155Tokens = tokens?.filter(t => t.standard === "TBC-1155") || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-token-system-title">
            {t('tokenSystem.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('tokenSystem.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="px-3 py-1">
            <Cpu className="h-3 w-3 mr-1" />
            {t('tokenSystem.tripleBandAi')}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            {t('tokenSystem.quantumResistant')}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {t('tokenSystem.audited')}
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
                  {t('tokenSystem.totalTokens')}
                </CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(stats?.totalTokens || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('tokenSystem.tokenStatsBreakdown', { tbc20: stats?.tbc20Count, tbc721: stats?.tbc721Count, tbc1155: stats?.tbc1155Count })}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-total-burned">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('tokenSystem.totalBurned')}
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatTokenAmount(stats?.totalBurned || "0")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.dailyBurnRate || 0}% {t('tokenSystem.dailyBurnRate')}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-ai-optimization">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('tokenSystem.aiOptimization')}
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
                  {t('tokenSystem.quantumSecured')}
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="h-4 w-4 mr-2" />
            {t('tokenSystem.overview')}
          </TabsTrigger>
          <TabsTrigger value="search" data-testid="tab-search">
            <Target className="h-4 w-4 mr-2" />
            {t('tokenSystem.search')}
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">
            <Plus className="h-4 w-4 mr-2" />
            {t('tokenSystem.create')}
          </TabsTrigger>
          <TabsTrigger value="deployed" data-testid="tab-deployed">
            <Database className="h-4 w-4 mr-2" />
            {t('tokenSystem.myTokens')}
          </TabsTrigger>
          <TabsTrigger value="tbc20" data-testid="tab-tbc20">
            <Coins className="h-4 w-4 mr-2" />
            {t('tokenSystem.tbc20')}
          </TabsTrigger>
          <TabsTrigger value="tbc721" data-testid="tab-tbc721">
            <Image className="h-4 w-4 mr-2" />
            {t('tokenSystem.tbc721')}
          </TabsTrigger>
          <TabsTrigger value="tbc1155" data-testid="tab-tbc1155">
            <Layers className="h-4 w-4 mr-2" />
            {t('tokenSystem.tbc1155')}
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

        <TabsContent value="search" className="space-y-4">
          <EnterpriseTokenSearch />
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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-500" />
              TBC-20
            </CardTitle>
            <Badge>{t('tokenSystem.erc20Compatible')}</Badge>
          </div>
          <CardDescription>
            {t('tokenSystem.tbc20Description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.aiBurnOptimization')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.quantumSignatures')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.selfAdjustingGas')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.mevProtection')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.zkPrivacy')}
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('tokenSystem.activeTokens')}:</span>
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
            {t('tokenSystem.createTbc20')}
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
            <Badge variant="secondary">{t('tokenSystem.nftStandard')}</Badge>
          </div>
          <CardDescription>
            {t('tokenSystem.tbc721Description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.aiAuthenticity')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.dynamicRarity')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.quantumOwnership')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.aiValuation')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.crossChainBridging')}
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('tokenSystem.activeCollections')}:</span>
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
            {t('tokenSystem.createTbc721')}
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
            <Badge variant="outline">{t('tokenSystem.multiToken')}</Badge>
          </div>
          <CardDescription>
            {t('tokenSystem.tbc1155Description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.fungibleNonFungible')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.aiBatchOptimization')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.semiFungible')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.gasEfficientTransfers')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('tokenSystem.aiSupplyManagement')}
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('tokenSystem.activeContracts')}:</span>
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
            {t('tokenSystem.createTbc1155')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function TripleBandAISection() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          {t('tokenSystem.tripleBandAiTitle')}
        </CardTitle>
        <CardDescription>
          {t('tokenSystem.tripleBandAiDesc')}
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
                <h4 className="font-semibold">{t('tokenSystem.strategicLayer')}</h4>
                <p className="text-xs text-muted-foreground">{t('tokenSystem.aiModelGpt5')}</p>
              </div>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>{t('tokenSystem.tokenEconomicsStrategy')}</li>
              <li>{t('tokenSystem.governanceAnalysis')}</li>
              <li>{t('tokenSystem.burnMechanismOptimization')}</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold">{t('tokenSystem.tacticalLayer')}</h4>
                <p className="text-xs text-muted-foreground">{t('tokenSystem.aiModelClaude')}</p>
              </div>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>{t('tokenSystem.realTimeOptimization')}</li>
              <li>{t('tokenSystem.securityAnalysisAi')}</li>
              <li>{t('tokenSystem.mevProtection')}</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold">{t('tokenSystem.operationalLayer')}</h4>
                <p className="text-xs text-muted-foreground">{t('tokenSystem.aiModelLlama')}</p>
              </div>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>{t('tokenSystem.transactionRouting')}</li>
              <li>{t('tokenSystem.cacheOptimization')}</li>
              <li>{t('tokenSystem.resourceAllocation')}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TokenTemplatesPreview({ onSelectTemplate }: { onSelectTemplate: () => void }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              {t('tokenSystem.enterpriseTokenTemplates')}
            </CardTitle>
            <CardDescription>
              {t('tokenSystem.templatesDescription')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSelectTemplate}>
            {t('tokenSystem.viewAllTemplates')}
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
                  <h4 className="font-medium">{t(getTemplateTranslationKey(template.id, 'name'))}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{template.standard}</Badge>
                    {template.aiRecommended && (
                      <Badge className="text-xs bg-purple-500/10 text-purple-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t('tokenSystem.aiRecommended')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t(getTemplateTranslationKey(template.id, 'description'))}</p>
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 3).map((feature, idx) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {t(`${getTemplateTranslationKey(template.id, 'features')}${idx + 1}`)}
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
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedStandard, setSelectedStandard] = useState<TokenStandardType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TokenTemplate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url">("upload");
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('tokenSystem.fileTooLarge'),
          description: t('tokenSystem.fileTooLargeDesc'),
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: t('tokenSystem.invalidFileType'),
          description: t('tokenSystem.invalidFileTypeDesc'),
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('tokenSystem.fileTooLarge'),
          description: t('tokenSystem.fileTooLargeDesc'),
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo: "" }));
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = "";
    }
  };
  
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
        title: t('tokenSystem.tokenDeployed'),
        description: t('tokenSystem.tokenDeployedDesc', { name: formData.name, symbol: formData.symbol }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/tokens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/token-system/deployed"] });
    },
    onError: (error: Error) => {
      toast({
        title: t('tokenSystem.deploymentFailed'),
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
        title: t('tokenSystem.vulnQuantumTitle'),
        description: t('tokenSystem.vulnQuantumDesc'),
        location: t('tokenSystem.vulnQuantumLocation'),
        recommendation: t('tokenSystem.vulnQuantumRecommendation')
      });
      score -= 10;
    }
    
    if (!formData.mevProtection) {
      vulnerabilities.push({
        id: "mev-001",
        severity: "high",
        title: t('tokenSystem.vulnMevTitle'),
        description: t('tokenSystem.vulnMevDesc'),
        location: t('tokenSystem.vulnMevLocation'),
        recommendation: t('tokenSystem.vulnMevRecommendation')
      });
      score -= 15;
    }

    if (formData.mintable && !formData.capped) {
      vulnerabilities.push({
        id: "inf-001",
        severity: "medium",
        title: t('tokenSystem.vulnUncappedTitle'),
        description: t('tokenSystem.vulnUncappedDesc'),
        location: t('tokenSystem.vulnUncappedLocation'),
        recommendation: t('tokenSystem.vulnUncappedRecommendation')
      });
      score -= 5;
    }

    if (!formData.aiAntiBot) {
      vulnerabilities.push({
        id: "bot-001",
        severity: "low",
        title: t('tokenSystem.vulnBotTitle'),
        description: t('tokenSystem.vulnBotDesc'),
        location: t('tokenSystem.vulnBotLocation'),
        recommendation: t('tokenSystem.vulnBotRecommendation')
      });
      score -= 5;
    }

    const recommendations = [];
    if (formData.aiOptimizationEnabled) {
      recommendations.push(t('tokenSystem.recommendationAiGas'));
    }
    if (formData.stakingEnabled) {
      recommendations.push(t('tokenSystem.recommendationStakingApy', { rate: formData.stakingRewardRate }));
    }
    if (formData.vestingEnabled) {
      recommendations.push(t('tokenSystem.recommendationVesting'));
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
  const stepLabels = [
    t('tokenSystem.templateStep'),
    t('tokenSystem.basicInfo'),
    t('tokenSystem.features'),
    t('tokenSystem.aiSecurity'),
    t('tokenSystem.review'),
    t('tokenSystem.successStep')
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('tokenSystem.createEnterpriseToken')}</h2>
          <p className="text-muted-foreground">{t('tokenSystem.deployProductionGrade')}</p>
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
                {t('tokenSystem.chooseTemplate')}
              </CardTitle>
              <CardDescription>
                {t('tokenSystem.templateDesc')}
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
                          <CardTitle className="text-base">{t(getTemplateTranslationKey(template.id, 'name'))}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{template.standard}</Badge>
                            <Badge variant="secondary" className="text-xs">{t(getTemplateTranslationKey(template.id, 'category'))}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{t(getTemplateTranslationKey(template.id, 'description'))}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.features.map((feature, idx) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {t(`${getTemplateTranslationKey(template.id, 'features')}${idx + 1}`)}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {t('tokenSystem.percentPopular', { percent: template.popularity })}
                        </div>
                        {template.aiRecommended && (
                          <Badge className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                            <Brain className="h-3 w-3 mr-1" />
                            {t('tokenSystem.aiPick')}
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
              <CardTitle>{t('tokenSystem.selectTokenStandard')}</CardTitle>
              <CardDescription>{t('tokenSystem.startBlank')}</CardDescription>
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
                        <p className="text-sm text-muted-foreground">{t('tokenSystem.fungibleToken')}</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('tokenSystem.select')}
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
                        <p className="text-sm text-muted-foreground">{t('tokenSystem.nftCollection')}</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('tokenSystem.select')}
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
                        <p className="text-sm text-muted-foreground">{t('tokenSystem.multiToken')}</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('tokenSystem.select')}
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
                <CardTitle>{t('tokenSystem.tokenConfiguration')} - {selectedStandard}</CardTitle>
                <CardDescription>
                  {selectedTemplate ? t('tokenSystem.usingTemplate', { name: selectedTemplate.name }) : t('tokenSystem.configureBasic')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('tokenSystem.tokenName')} *</Label>
                  <Input
                    id="name"
                    placeholder={t('tokenSystem.tokenNamePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-token-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">{t('tokenSystem.tokenSymbol')} *</Label>
                  <Input
                    id="symbol"
                    placeholder={t('tokenSystem.tokenSymbolPlaceholder')}
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    maxLength={10}
                    data-testid="input-token-symbol"
                  />
                </div>
                {selectedStandard === "TBC-20" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="totalSupply">{t('tokenSystem.initialSupply')} *</Label>
                      <Input
                        id="totalSupply"
                        type="number"
                        placeholder={t('tokenSystem.initialSupplyPlaceholder')}
                        value={formData.totalSupply}
                        onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                        data-testid="input-total-supply"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decimals">{t('tokenSystem.decimals')}</Label>
                      <Select
                        value={formData.decimals.toString()}
                        onValueChange={(value) => setFormData({ ...formData, decimals: parseInt(value) })}
                      >
                        <SelectTrigger data-testid="select-decimals">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18">18 ({t('tokenSystem.standard')})</SelectItem>
                          <SelectItem value="8">8 ({t('tokenSystem.bitcoinStyle')})</SelectItem>
                          <SelectItem value="6">6 ({t('tokenSystem.usdcStyle')})</SelectItem>
                          <SelectItem value="0">0 ({t('tokenSystem.noDecimals')})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {selectedStandard === "TBC-721" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="baseUri">{t('tokenSystem.baseUri')}</Label>
                      <Input
                        id="baseUri"
                        placeholder={t('tokenSystem.baseUriPlaceholder')}
                        value={formData.baseUri}
                        onChange={(e) => setFormData({ ...formData, baseUri: e.target.value })}
                        data-testid="input-base-uri"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">{t('tokenSystem.maxTokens')}</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        placeholder={t('tokenSystem.maxTokensPlaceholder')}
                        value={formData.maxTokens}
                        onChange={(e) => setFormData({ ...formData, maxTokens: e.target.value })}
                        data-testid="input-max-tokens"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="royaltyPercentage">{t('tokenSystem.royaltyPercentage')}</Label>
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
                  <Label htmlFor="description">{t('tokenSystem.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('tokenSystem.describeToken')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t('tokenSystem.website')}</Label>
                  <Input
                    id="website"
                    placeholder={t('tokenSystem.websitePlaceholder')}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('tokenSystem.symbolLogo')}</Label>
                  <div className="flex gap-2 mb-2">
                    <Button 
                      type="button" 
                      variant={logoInputMode === "upload" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setLogoInputMode("upload")}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      {t('tokenSystem.upload')}
                    </Button>
                    <Button 
                      type="button" 
                      variant={logoInputMode === "url" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setLogoInputMode("url")}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      {t('tokenSystem.url')}
                    </Button>
                  </div>
                  
                  {logoInputMode === "upload" ? (
                    <div className="space-y-2">
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                        id="logo-upload"
                        data-testid="input-logo-upload"
                      />
                      {logoPreview || formData.logo ? (
                        <div className="relative inline-block">
                          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center">
                            <img 
                              src={logoPreview || formData.logo} 
                              alt={t('tokenSystem.tokenLogoAlt')} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button 
                            type="button"
                            size="icon" 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={clearLogo}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="w-full h-24 rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover-elevate transition-colors"
                          onClick={() => logoFileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleLogoDrop}
                          data-testid="dropzone-logo"
                        >
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">{t('tokenSystem.clickDragUpload')}</p>
                          <p className="text-xs text-muted-foreground">{t('tokenSystem.imageFormats')}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      id="logo"
                      placeholder={t('tokenSystem.logoUrlPlaceholder')}
                      value={formData.logo}
                      onChange={(e) => {
                        setFormData({ ...formData, logo: e.target.value });
                        setLogoPreview(null);
                      }}
                      data-testid="input-logo-url"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <Button 
              onClick={() => setStep(3)} 
              disabled={!formData.name || !formData.symbol}
              data-testid="button-next-step"
            >
              {t('tokenSystem.nextFeatures')}
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
              {t('tokenSystem.tokenFeatures')}
            </CardTitle>
            <CardDescription>{t('tokenSystem.configureAdvanced')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('tokenSystem.coreFeatures')}
                </h4>
                
                {selectedStandard === "TBC-20" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mintable">{t('tokenSystem.mintable')}</Label>
                      <p className="text-xs text-muted-foreground">{t('tokenSystem.mintableDesc')}</p>
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
                    <Label htmlFor="burnable">{t('tokenSystem.burnable')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.burnableDesc')}</p>
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
                    <Label htmlFor="pausable">{t('tokenSystem.pausable')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.pausableDesc')}</p>
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
                        <Label htmlFor="capped">{t('tokenSystem.cappedSupply')}</Label>
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.cappedSupplyDesc')}</p>
                      </div>
                      <Switch
                        id="capped"
                        checked={formData.capped}
                        onCheckedChange={(checked) => setFormData({ ...formData, capped: checked })}
                      />
                    </div>
                    {formData.capped && (
                      <div className="space-y-2">
                        <Label htmlFor="maxSupply">{t('tokenSystem.maxSupply')}</Label>
                        <Input
                          id="maxSupply"
                          type="number"
                          placeholder={t('tokenSystem.maxSupplyPlaceholder')}
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
                  {t('tokenSystem.tokenomics')}
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stakingEnabled">{t('tokenSystem.staking')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.stakingRewardsDesc')}</p>
                  </div>
                  <Switch
                    id="stakingEnabled"
                    checked={formData.stakingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, stakingEnabled: checked })}
                  />
                </div>
                
                {formData.stakingEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="stakingRewardRate">{t('tokenSystem.stakingApy')}</Label>
                    <Input
                      id="stakingRewardRate"
                      type="number"
                      min={0}
                      max={100}
                      placeholder={t('tokenSystem.stakingApyPlaceholder')}
                      value={formData.stakingRewardRate}
                      onChange={(e) => setFormData({ ...formData, stakingRewardRate: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vestingEnabled">{t('tokenSystem.vesting')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.vestingSchedulesDesc')}</p>
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
                    <Label htmlFor="airdropEnabled">{t('tokenSystem.airdrop')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.airdropDesc')}</p>
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
                {t('tokenSystem.accessControlUpgradeability')}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('tokenSystem.accessControlModel')}</Label>
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
                      <SelectItem value="ownable">{t('tokenSystem.singleOwner')}</SelectItem>
                      <SelectItem value="roles">{t('tokenSystem.roleBasedRecommended')}</SelectItem>
                      <SelectItem value="multisig">{t('tokenSystem.multiSignature')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('tokenSystem.upgradeabilityPattern')}</Label>
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
                      <SelectItem value="none">{t('tokenSystem.notUpgradeable')}</SelectItem>
                      <SelectItem value="transparent">{t('tokenSystem.transparent')}</SelectItem>
                      <SelectItem value="uups">{t('tokenSystem.uups')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.accessControl === "multisig" && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('tokenSystem.multiSignatureSettings')}</Label>
                      <p className="text-xs text-muted-foreground">{t('tokenSystem.configureMultisig')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="multisigThreshold">{t('tokenSystem.requiredSignatures')}</Label>
                      <Select
                        value={formData.multisigThreshold.toString()}
                        onValueChange={(value) => setFormData({ ...formData, multisigThreshold: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">{t('tokenSystem.multisig2ofN')}</SelectItem>
                          <SelectItem value="3">{t('tokenSystem.multisig3ofN')}</SelectItem>
                          <SelectItem value="4">{t('tokenSystem.multisig4ofN')}</SelectItem>
                          <SelectItem value="5">{t('tokenSystem.multisig5ofN')}</SelectItem>
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
              {t('common.back')}
            </Button>
            <Button onClick={() => setStep(4)}>
              {t('tokenSystem.nextAiSecurity')}
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
              {t('tokenSystem.aiSecurityConfiguration')}
            </CardTitle>
            <CardDescription>{t('tokenSystem.enterpriseFeatures')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  {t('tokenSystem.tripleBandAiFeatures')}
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiOptimization">{t('tokenSystem.aiOptimization')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.aiOptimizationDesc')}</p>
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
                    <Label htmlFor="aiBurn">{t('tokenSystem.aiBurnOptimizationSetting')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.aiBurnOptimizationDesc')}</p>
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
                    <Label htmlFor="aiOracle">{t('tokenSystem.aiPriceOracle')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.aiPriceOracleDesc')}</p>
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
                    <Label htmlFor="aiSupply">{t('tokenSystem.aiSupplyManagement')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.aiSupplyManagementDesc')}</p>
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
                    <Label htmlFor="aiAntiBot">{t('tokenSystem.aiAntiBot')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.aiAntiBotDesc')}</p>
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
                    <Label htmlFor="aiLiquidity">{t('tokenSystem.aiLiquidityManagement')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.aiLiquidityDesc')}</p>
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
                  {t('tokenSystem.securityFeatures')}
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quantum">{t('tokenSystem.quantumResistantSig')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.quantumResistantDesc')}</p>
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
                    <Label htmlFor="mev">{t('tokenSystem.mevProtectionSetting')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.mevProtectionDesc')}</p>
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
                    <Label htmlFor="zk">{t('tokenSystem.zkPrivacySetting')}</Label>
                    <p className="text-xs text-muted-foreground">{t('tokenSystem.zkPrivacyDesc')}</p>
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
                    <span className="font-medium text-sm">{t('tokenSystem.securitySummary')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {formData.quantumResistant ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>{t('tokenSystem.quantumResistance')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formData.mevProtection ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>{t('tokenSystem.mevProtection')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formData.aiAntiBot ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>{t('tokenSystem.antiBot')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formData.zkPrivacy ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>{t('tokenSystem.zkPrivacy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <Button onClick={() => { setStep(5); runSecurityAnalysis(); }}>
              {t('tokenSystem.nextReview')}
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
                {t('tokenSystem.deploymentReview')}
              </CardTitle>
              <CardDescription>{t('tokenSystem.verifySettings')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">{t('tokenSystem.tokenDetails')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('tokenSystem.name')}:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('tokenSystem.tokenSymbol')}:</span>
                      <span className="font-medium">{formData.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('tokenSystem.standard')}:</span>
                      <Badge>{selectedStandard}</Badge>
                    </div>
                    {selectedStandard === "TBC-20" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('tokenSystem.supply')}:</span>
                          <span className="font-medium">{formatNumber(parseInt(formData.totalSupply))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('tokenSystem.decimals')}:</span>
                          <span className="font-medium">{formData.decimals}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">{t('tokenSystem.features')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.mintable && <Badge variant="secondary">{t('tokenSystem.mintable')}</Badge>}
                    {formData.burnable && <Badge variant="secondary">{t('tokenSystem.burnable')}</Badge>}
                    {formData.pausable && <Badge variant="secondary">{t('tokenSystem.pausable')}</Badge>}
                    {formData.stakingEnabled && <Badge variant="secondary">{t('tokenSystem.staking')}</Badge>}
                    {formData.vestingEnabled && <Badge variant="secondary">{t('tokenSystem.vesting')}</Badge>}
                    <Badge variant="outline">{formData.accessControl}</Badge>
                    {formData.upgradeability !== "none" && (
                      <Badge variant="outline">{formData.upgradeability}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">{t('tokenSystem.aiSecurity')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.aiOptimizationEnabled && (
                      <Badge className="bg-purple-500/10 text-purple-500">
                        <Brain className="h-3 w-3 mr-1" />
                        {t('tokenSystem.aiEnabled')}
                      </Badge>
                    )}
                    {formData.quantumResistant && (
                      <Badge className="bg-green-500/10 text-green-500">
                        <Lock className="h-3 w-3 mr-1" />
                        {t('tokenSystem.quantum')}
                      </Badge>
                    )}
                    {formData.mevProtection && (
                      <Badge className="bg-blue-500/10 text-blue-500">
                        <Shield className="h-3 w-3 mr-1" />
                        {t('tokenSystem.mev')}
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
                {t('tokenSystem.aiSecurityAnalysis')}
                {isAnalyzing && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
              </CardTitle>
              <CardDescription>
                {isAnalyzing 
                  ? t('tokenSystem.analyzingContract')
                  : t('tokenSystem.securityScanCompleted')
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
                      <h4 className="font-medium mb-2">{t('tokenSystem.securityScore')}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {securityAnalysis.score >= 90 
                          ? t('tokenSystem.excellentSecurity')
                          : securityAnalysis.score >= 70 
                          ? t('tokenSystem.goodSecurity')
                          : t('tokenSystem.securityImprovements')
                        }
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span>{t('tokenSystem.estimatedGas')}: {formatNumber(securityAnalysis.gasEstimate)} EMB</span>
                      </div>
                    </div>
                  </div>

                  {securityAnalysis.vulnerabilities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">{t('tokenSystem.findings')}</h4>
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
                            <span className="text-muted-foreground">{t('tokenSystem.recommendation')}:</span> {vuln.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {securityAnalysis.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{t('tokenSystem.aiRecommendations')}</h4>
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
                {t('common.back')}
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
                    {t('tokenSystem.deploying')}
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    {t('tokenSystem.deployToTburn')}
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
                <CardTitle className="text-2xl">{t('tokenSystem.tokenDeployed')}</CardTitle>
                <CardDescription>
                  {t('tokenSystem.tokenDeployedDesc', { standard: selectedStandard })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">{t('tokenSystem.tokenDetails')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenSystem.name')}:</span>
                    <span className="font-medium">{deploymentResult.token.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenSystem.tokenSymbol')}:</span>
                    <span className="font-medium">{deploymentResult.token.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenSystem.standard')}:</span>
                    <Badge>{deploymentResult.token.standard}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('tokenSystem.contract')}:</span>
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
                <h4 className="font-medium">{t('tokenSystem.transactionDetails')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenSystem.block')}:</span>
                    <span className="font-medium tabular-nums">{formatNumber(deploymentResult.transaction.blockNumber)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenSystem.gasUsedDeploy')}:</span>
                    <span className="font-medium tabular-nums">{formatNumber(deploymentResult.transaction.gasUsed)} EMB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.status', 'Status')}:</span>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {deploymentResult.transaction.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tokenSystem.verification')}:</span>
                    <Badge variant="outline" className="text-blue-500 border-blue-500">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      {t('tokenSystem.verified')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <h4 className="font-medium flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-purple-500" />
                  {t('tokenSystem.aiDeploymentAnalysis')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t('tokenSystem.gasOptimization')}</p>
                    <p className="text-2xl font-semibold text-green-500">
                      +{deploymentResult.aiAnalysis.gasOptimization}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t('tokenSystem.securityScore')}</p>
                    <p className="text-2xl font-semibold text-green-500">
                      {deploymentResult.aiAnalysis.securityScore}/100
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t('tokenSystem.codeQuality')}</p>
                    <p className="text-2xl font-semibold text-blue-500">
                      A+
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t('tokenSystem.auditStatus')}</p>
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
                {t('tokenSystem.viewContract')}
              </Button>
              <Button variant="outline" className="w-full">
                <Code2 className="h-4 w-4 mr-2" />
                {t('tokenSystem.sourceCode')}
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('tokenSystem.analytics')}
              </Button>
              <Button variant="outline" className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                {t('tokenSystem.addToBridge')}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetWizard}>
              <Plus className="h-4 w-4 mr-2" />
              {t('tokenSystem.createAnother')}
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('tokenSystem.viewOnExplorer')}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

function DeployedTokensDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedToken, setSelectedToken] = useState<DeployedToken | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  
  const { data: deployedTokens, isLoading } = useQuery<DeployedToken[]>({
    queryKey: ["/api/token-system/deployed"],
  });

  const handleManageToken = (token: DeployedToken) => {
    setSelectedToken(token);
    setManageDialogOpen(true);
  };

  const handleMint = () => {
    toast({
      title: t('tokenSystem.mintSuccess', 'Mint Initiated'),
      description: t('tokenSystem.mintSuccessDesc', 'Token minting transaction has been submitted.'),
    });
    setManageDialogOpen(false);
  };

  const handleBurn = () => {
    toast({
      title: t('tokenSystem.burnSuccess', 'Burn Initiated'),
      description: t('tokenSystem.burnSuccessDesc', 'Token burning transaction has been submitted.'),
    });
    setManageDialogOpen(false);
  };

  const handlePause = () => {
    toast({
      title: t('tokenSystem.pauseSuccess', 'Token Paused'),
      description: t('tokenSystem.pauseSuccessDesc', 'Token transfers have been paused.'),
    });
    setManageDialogOpen(false);
  };

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
          <h3 className="font-semibold text-lg mb-2">{t('tokenSystem.noDeployedTokens')}</h3>
          <p className="text-muted-foreground mb-4">{t('tokenSystem.noDeployedTokensDesc')}</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('tokenSystem.createFirstToken')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('tokenSystem.yourDeployedTokens')}</h3>
        <Badge variant="outline">{deployedTokens.length} {t('common.tokens', 'Tokens')}</Badge>
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
                  <p className="text-xs text-muted-foreground">{t('tokenSystem.holders')}</p>
                  <p className="font-medium tabular-nums">{formatNumber(token.holders)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t('tokenSystem.transactions')}</p>
                  <p className="font-medium tabular-nums">{formatNumber(token.transactionCount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t('common.status', 'Status')}</p>
                  <Badge variant={token.status === "active" ? "default" : "secondary"} className={token.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}>
                    {token.status === "active" ? t('common.active', 'Active') : token.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {token.aiOptimizationEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      {t('tokenSystem.ai')}
                    </Badge>
                  )}
                  {token.quantumResistant && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      {t('tokenSystem.qr')}
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleManageToken(token)}
                  data-testid={`button-manage-${token.id}`}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  {t('tokenSystem.manage', 'Manage')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('tokenSystem.manageToken', 'Manage Token')}: {selectedToken?.name}
            </DialogTitle>
            <DialogDescription>
              {t('tokenSystem.manageTokenDesc', 'Configure and manage your token settings, supply, and permissions.')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedToken && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground">{t('tokenSystem.symbol', 'Symbol')}</p>
                  <p className="font-semibold">{selectedToken.symbol}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground">{t('tokenSystem.standard', 'Standard')}</p>
                  <Badge>{selectedToken.standard}</Badge>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground">{t('tokenSystem.totalSupply', 'Total Supply')}</p>
                  <p className="font-semibold tabular-nums">{formatNumber(parseFloat(selectedToken.totalSupply))}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground">{t('tokenSystem.holders', 'Holders')}</p>
                  <p className="font-semibold tabular-nums">{formatNumber(selectedToken.holders)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">{t('tokenSystem.tokenActions', 'Token Actions')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedToken.mintable && (
                    <Button variant="outline" onClick={handleMint} className="flex-col h-auto py-4">
                      <Plus className="h-5 w-5 mb-1" />
                      <span>{t('tokenSystem.mint', 'Mint')}</span>
                    </Button>
                  )}
                  {selectedToken.burnable && (
                    <Button variant="outline" onClick={handleBurn} className="flex-col h-auto py-4">
                      <Flame className="h-5 w-5 mb-1 text-orange-500" />
                      <span>{t('tokenSystem.burn', 'Burn')}</span>
                    </Button>
                  )}
                  {selectedToken.pausable && (
                    <Button variant="outline" onClick={handlePause} className="flex-col h-auto py-4">
                      <AlertCircle className="h-5 w-5 mb-1 text-yellow-500" />
                      <span>{t('tokenSystem.pause', 'Pause')}</span>
                    </Button>
                  )}
                  <Button variant="outline" className="flex-col h-auto py-4">
                    <Users className="h-5 w-5 mb-1" />
                    <span>{t('tokenSystem.transfer', 'Transfer')}</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">{t('tokenSystem.contractInfo', 'Contract Information')}</h4>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <code className="text-sm font-mono">{selectedToken.contractAddress}</code>
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageDialogOpen(false)}>
              {t('common.close', 'Close')}
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('tokenSystem.viewOnExplorer', 'View on Explorer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SearchToken {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  standard: string;
  totalSupply: string;
  decimals: number;
  holders: number;
  transactions24h: number;
  volume24h: string;
  marketCap: string;
  price: string;
  priceChange24h: number;
  burnRate: number;
  burnedTotal: string;
  aiEnabled: boolean;
  quantumResistant: boolean;
  mevProtection: boolean;
  verified: boolean;
  securityScore: number;
  deployerAddress: string;
  deployedAt: string;
  lastActivity: string;
  features: string[];
  category: string;
  website: string;
  telegram: string;
  twitter: string;
}

interface SearchResult {
  tokens: SearchToken[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TokenDetail {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  standard: string;
  totalSupply: string;
  circulatingSupply: string;
  decimals: number;
  price: string;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  volume24h: string;
  volumeChange24h: number;
  marketCap: string;
  marketCapRank: number;
  fullyDilutedValuation: string;
  holders: number;
  holdersChange24h: number;
  holdersChange7d: number;
  topHoldersConcentration: number;
  averageHoldingAmount: string;
  medianHoldingAmount: string;
  transactions24h: number;
  transactionsChange24h: number;
  totalTransactions: number;
  averageTransactionSize: string;
  uniqueAddresses24h: number;
  burnRate: number;
  burnedTotal: string;
  burnedLast24h: string;
  burnedLast7d: string;
  projectedMonthlyBurn: string;
  aiEnabled: boolean;
  quantumResistant: boolean;
  mevProtection: boolean;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  stakingEnabled: boolean;
  stakingAPY: number;
  verified: boolean;
  securityScore: number;
  lastAuditDate: string;
  auditor: string;
  vulnerabilities: number;
  deployerAddress: string;
  deployedAt: string;
  deploymentBlock: number;
  deploymentTxHash: string;
  website: string;
  telegram: string;
  twitter: string;
  discord: string;
  github: string;
  whitepaper: string;
  aiAnalysis: {
    sentiment: string;
    sentimentScore: number;
    riskLevel: string;
    riskScore: number;
    recommendation: string;
    lastAnalyzed: string;
  };
  features: string[];
  category: string;
  lastActivity: string;
}

function EnterpriseTokenSearch() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [sortBy, setSortBy] = useState("holders");
  const [sortOrder, setSortOrder] = useState("desc");
  const [aiEnabled, setAiEnabled] = useState<boolean | undefined>(undefined);
  const [quantumSecured, setQuantumSecured] = useState(false);
  const [verified, setVerified] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedToken, setSelectedToken] = useState<SearchToken | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedStandard !== "all") params.set("standard", selectedStandard);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", page.toString());
    params.set("limit", "10");
    if (aiEnabled !== undefined) params.set("aiEnabled", aiEnabled.toString());
    if (quantumSecured) params.set("quantumSecured", "true");
    if (verified) params.set("verified", "true");
    return `/api/token-system/search?${params.toString()}`;
  };

  const { data: searchResult, isLoading } = useQuery<SearchResult>({
    queryKey: [buildSearchUrl()],
  });

  const { data: tokenDetail, isLoading: detailLoading } = useQuery<TokenDetail>({
    queryKey: [`/api/token-system/token/${selectedToken?.contractAddress || ''}`],
    enabled: !!selectedToken,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common.copied'),
      description: t('tokenSystem.addressCopied'),
    });
  };

  const handleTokenClick = (token: SearchToken) => {
    setSelectedToken(token);
    setShowDetailModal(true);
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1) return `$${num.toFixed(2)}`;
    if (num >= 0.01) return `$${num.toFixed(4)}`;
    return `$${num.toFixed(6)}`;
  };

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume) / 1e18;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t('tokenSystem.enterpriseTokenSearch')}
          </CardTitle>
          <CardDescription>
            {t('tokenSystem.searchDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('tokenSystem.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pl-10"
                  data-testid="input-search-token"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedStandard} onValueChange={(v) => { setSelectedStandard(v); setPage(1); }}>
                <SelectTrigger className="w-32" data-testid="select-standard-filter">
                  <SelectValue placeholder={t('tokenSystem.standard')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tokenSystem.allStandards')}</SelectItem>
                  <SelectItem value="TBC-20">TBC-20</SelectItem>
                  <SelectItem value="TBC-721">TBC-721</SelectItem>
                  <SelectItem value="TBC-1155">TBC-1155</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36" data-testid="select-sort-by">
                  <SelectValue placeholder={t('tokenSystem.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holders">{t('tokenSystem.holders')}</SelectItem>
                  <SelectItem value="volume">{t('tokenSystem.volume24h')}</SelectItem>
                  <SelectItem value="marketCap">{t('tokenSystem.marketCap')}</SelectItem>
                  <SelectItem value="transactions">{t('tokenSystem.transactions')}</SelectItem>
                  <SelectItem value="securityScore">{t('tokenSystem.securityScore')}</SelectItem>
                  <SelectItem value="priceChange">{t('tokenSystem.priceChange')}</SelectItem>
                  <SelectItem value="name">{t('tokenSystem.name')}</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              >
                {sortOrder === "desc" ? <TrendingUp className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4 rotate-90" />}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="aiFilter" 
                checked={aiEnabled === true}
                onCheckedChange={(checked) => setAiEnabled(checked ? true : undefined)}
              />
              <Label htmlFor="aiFilter" className="text-sm">{t('tokenSystem.aiEnabled')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="quantumFilter" 
                checked={quantumSecured}
                onCheckedChange={setQuantumSecured}
              />
              <Label htmlFor="quantumFilter" className="text-sm">{t('tokenSystem.quantumSecured')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="verifiedFilter" 
                checked={verified}
                onCheckedChange={setVerified}
              />
              <Label htmlFor="verifiedFilter" className="text-sm">{t('tokenSystem.verifiedOnly')}</Label>
            </div>
            {searchResult && (
              <Badge variant="outline" className="ml-auto">
                {searchResult.pagination.total} {t('tokenSystem.tokensFound')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchResult?.tokens && searchResult.tokens.length > 0 ? (
        <div className="space-y-3">
          {searchResult.tokens.map((token) => (
            <Card 
              key={token.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => handleTokenClick(token)}
              data-testid={`card-search-result-${token.symbol}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {token.standard === "TBC-20" && <Coins className="h-5 w-5 text-primary" />}
                      {token.standard === "TBC-721" && <Image className="h-5 w-5 text-purple-500" />}
                      {token.standard === "TBC-1155" && <Layers className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{token.name}</h3>
                        <Badge variant="outline" className="text-xs">{token.symbol}</Badge>
                        {token.verified && (
                          <Badge className="bg-green-500/10 text-green-500 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('tokenSystem.verified')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{token.standard}</Badge>
                        <Badge variant="outline" className="text-xs">{getTranslatedCategory(token.category, t)}</Badge>
                        <code className="bg-muted px-1 rounded">
                          {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(token.contractAddress); }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('tokenSystem.price')}</p>
                      <p className="font-medium tabular-nums">{formatPrice(token.price)}</p>
                      <p className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('tokenSystem.volume24h')}</p>
                      <p className="font-medium tabular-nums">{formatVolume(token.volume24h)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('tokenSystem.holders')}</p>
                      <p className="font-medium tabular-nums">{formatNumber(token.holders)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('tokenSystem.security')}</p>
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${token.securityScore >= 90 ? 'bg-green-500' : token.securityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <p className="font-medium tabular-nums">{token.securityScore}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {token.aiEnabled && (
                        <Badge variant="secondary" className="text-xs">
                          <Brain className="h-3 w-3" />
                        </Badge>
                      )}
                      {token.quantumResistant && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3" />
                        </Badge>
                      )}
                      {token.mevProtection && (
                        <Badge className="bg-green-500/10 text-green-500 text-xs">
                          <Shield className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleTokenClick(token); }}>
                      <Eye className="h-3 w-3 mr-1" />
                      {t('common.view')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {searchResult.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!searchResult.pagination.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('common.previous')}
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                {t('tokenSystem.pageOf', { page: searchResult.pagination.page, total: searchResult.pagination.totalPages })}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!searchResult.pagination.hasNext}
                onClick={() => setPage(page + 1)}
              >
                {t('common.next')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t('tokenSystem.noTokensFound')}</h3>
            <p className="text-muted-foreground">{t('tokenSystem.adjustFilters')}</p>
          </CardContent>
        </Card>
      )}

      {showDetailModal && selectedToken && (
        <TokenDetailView 
          token={selectedToken}
          tokenDetail={tokenDetail || null}
          isLoading={detailLoading}
          onClose={() => { setShowDetailModal(false); setSelectedToken(null); }}
        />
      )}
    </div>
  );
}

function TokenDetailView({ token, tokenDetail, isLoading, onClose }: {
  token: SearchToken;
  tokenDetail: TokenDetail | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('common.copied'), description: t('tokenSystem.addressCopied') });
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1) return `$${num.toFixed(2)}`;
    if (num >= 0.01) return `$${num.toFixed(4)}`;
    return `$${num.toFixed(6)}`;
  };

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume) / 1e18;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {token.standard === "TBC-20" && <Coins className="h-6 w-6 text-primary" />}
              {token.standard === "TBC-721" && <Image className="h-6 w-6 text-purple-500" />}
              {token.standard === "TBC-1155" && <Layers className="h-6 w-6 text-amber-500" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{token.name}</CardTitle>
                <Badge>{token.symbol}</Badge>
                {token.verified && (
                  <Badge className="bg-green-500/10 text-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('tokenSystem.verified')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <code className="bg-muted px-1 rounded text-xs">
                  {token.contractAddress}
                </code>
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => copyToClipboard(token.contractAddress)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <AlertCircle className="h-5 w-5 rotate-45" />
          </Button>
        </CardHeader>
        
        <ScrollArea className="h-[calc(90vh-200px)]">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : tokenDetail ? (
              <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">{t('tokenSystem.overview')}</TabsTrigger>
                  <TabsTrigger value="holders">{t('tokenSystem.holders')}</TabsTrigger>
                  <TabsTrigger value="transactions">{t('tokenSystem.transactions')}</TabsTrigger>
                  <TabsTrigger value="security">{t('tokenSystem.security')}</TabsTrigger>
                  <TabsTrigger value="ai">{t('tokenSystem.aiAnalysis')}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.price')}</p>
                        <p className="text-2xl font-bold">{formatPrice(tokenDetail.price)}</p>
                        <p className={`text-sm ${tokenDetail.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tokenDetail.priceChange24h >= 0 ? '+' : ''}{tokenDetail.priceChange24h.toFixed(2)}% (24h)
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.marketCap')}</p>
                        <p className="text-2xl font-bold">{formatVolume(tokenDetail.marketCap)}</p>
                        <p className="text-sm text-muted-foreground">{t('tokenSystem.rank')} #{tokenDetail.marketCapRank}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.volume24h')}</p>
                        <p className="text-2xl font-bold">{formatVolume(tokenDetail.volume24h)}</p>
                        <p className={`text-sm ${tokenDetail.volumeChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tokenDetail.volumeChange24h >= 0 ? '+' : ''}{tokenDetail.volumeChange24h.toFixed(2)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.holders')}</p>
                        <p className="text-2xl font-bold">{formatNumber(tokenDetail.holders)}</p>
                        <p className="text-sm text-green-500">+{tokenDetail.holdersChange24h} (24h)</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t('tokenSystem.tokenInfo')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.standard')}</span>
                          <Badge>{tokenDetail.standard}</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.totalSupply')}</span>
                          <span className="font-medium">{formatTokenAmount(tokenDetail.totalSupply)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.circulatingSupply')}</span>
                          <span className="font-medium">{formatTokenAmount(tokenDetail.circulatingSupply)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.decimals')}</span>
                          <span className="font-medium">{tokenDetail.decimals}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.deployer')}</span>
                          <code className="text-xs">{tokenDetail.deployerAddress.slice(0, 8)}...{tokenDetail.deployerAddress.slice(-6)}</code>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.deployed')}</span>
                          <span className="font-medium">{new Date(tokenDetail.deployedAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t('tokenSystem.featuresAndSecurity')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {tokenDetail.aiEnabled && <Badge variant="secondary"><Brain className="h-3 w-3 mr-1" /> {t('tokenSystem.aiEnabled')}</Badge>}
                          {tokenDetail.quantumResistant && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" /> {t('tokenSystem.quantum')}</Badge>}
                          {tokenDetail.mevProtection && <Badge className="bg-green-500/10 text-green-500"><Shield className="h-3 w-3 mr-1" /> {t('tokenSystem.mev')}</Badge>}
                          {tokenDetail.mintable && <Badge variant="secondary">{t('tokenSystem.mintable')}</Badge>}
                          {tokenDetail.burnable && <Badge variant="secondary">{t('tokenSystem.burnable')}</Badge>}
                          {tokenDetail.pausable && <Badge variant="secondary">{t('tokenSystem.pausable')}</Badge>}
                          {tokenDetail.stakingEnabled && <Badge variant="outline">{t('staking.staking')} {tokenDetail.stakingAPY}% APY</Badge>}
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.securityScore')}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={tokenDetail.securityScore} className="w-20 h-2" />
                            <span className="font-medium">{tokenDetail.securityScore}/100</span>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.auditor')}</span>
                          <Badge variant="outline">{tokenDetail.auditor}</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.lastAudit')}</span>
                          <span className="font-medium">{new Date(tokenDetail.lastAuditDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('tokenSystem.vulnerabilities')}</span>
                          <Badge variant={tokenDetail.vulnerabilities === 0 ? "default" : "destructive"}>
                            {tokenDetail.vulnerabilities} {t('tokenSystem.found')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {tokenDetail.burnRate > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {t('tokenSystem.burnAnalytics')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">{t('tokenSystem.burnRate')}</p>
                            <p className="text-xl font-semibold">{tokenDetail.burnRate} BPS</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('tokenSystem.totalBurned')}</p>
                            <p className="text-xl font-semibold">{formatTokenAmount(tokenDetail.burnedTotal)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('tokenSystem.burned24h')}</p>
                            <p className="text-xl font-semibold">{formatTokenAmount(tokenDetail.burnedLast24h)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('tokenSystem.projected30d')}</p>
                            <p className="text-xl font-semibold">{formatTokenAmount(tokenDetail.projectedMonthlyBurn)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="holders" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.totalHolders')}</p>
                        <p className="text-2xl font-bold">{formatNumber(tokenDetail.holders)}</p>
                        <p className="text-sm text-green-500">+{tokenDetail.holdersChange7d} (7d)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.top10Concentration')}</p>
                        <p className="text-2xl font-bold">{tokenDetail.topHoldersConcentration}%</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.avgHolding')}</p>
                        <p className="text-2xl font-bold">{formatTokenAmount(tokenDetail.averageHoldingAmount)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.uniqueAddresses24h')}</p>
                        <p className="text-2xl font-bold">{formatNumber(tokenDetail.uniqueAddresses24h)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tokenSystem.holderListProduction')}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.transactions24h')}</p>
                        <p className="text-2xl font-bold">{formatNumber(tokenDetail.transactions24h)}</p>
                        <p className={`text-sm ${tokenDetail.transactionsChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tokenDetail.transactionsChange24h >= 0 ? '+' : ''}{tokenDetail.transactionsChange24h.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.totalTransactions')}</p>
                        <p className="text-2xl font-bold">{formatNumber(tokenDetail.totalTransactions)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.avgTransaction')}</p>
                        <p className="text-2xl font-bold">{formatTokenAmount(tokenDetail.averageTransactionSize)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">{t('tokenSystem.lastActivity')}</p>
                        <p className="text-lg font-bold">{new Date(tokenDetail.lastActivity).toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tokenSystem.transactionHistoryProduction')}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className={tokenDetail.securityScore >= 90 ? "border-green-500/50" : tokenDetail.securityScore >= 70 ? "border-yellow-500/50" : "border-red-500/50"}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5" />
                          {t('tokenSystem.securityScore')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6">
                          <div className="relative h-24 w-24">
                            <svg className="h-24 w-24 transform -rotate-90">
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                              <circle
                                cx="48" cy="48" r="40"
                                stroke="currentColor" strokeWidth="8" fill="none"
                                strokeDasharray={`${tokenDetail.securityScore * 2.51} 251`}
                                className={tokenDetail.securityScore >= 90 ? "text-green-500" : tokenDetail.securityScore >= 70 ? "text-yellow-500" : "text-red-500"}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">{tokenDetail.securityScore}</span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className={`font-medium ${tokenDetail.securityScore >= 90 ? "text-green-500" : tokenDetail.securityScore >= 70 ? "text-yellow-500" : "text-red-500"}`}>
                              {tokenDetail.securityScore >= 90 ? t('tokenSystem.excellent') : tokenDetail.securityScore >= 70 ? t('tokenSystem.good') : t('tokenSystem.needsReview')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t('tokenSystem.auditedBy', { auditor: tokenDetail.auditor, date: new Date(tokenDetail.lastAuditDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' }) })}
                            </p>
                            <p className="text-sm">
                              {tokenDetail.vulnerabilities} {t('tokenSystem.vulnerabilitiesFound')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t('tokenSystem.securityFeatures')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('tokenSystem.quantumResistant')}</span>
                          {tokenDetail.quantumResistant ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('tokenSystem.mevProtection')}</span>
                          {tokenDetail.mevProtection ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('tokenSystem.aiOptimization')}</span>
                          {tokenDetail.aiEnabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('tokenSystem.contractVerified')}</span>
                          {tokenDetail.verified ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        {t('tokenSystem.aiAnalysisByTripleBand')}
                      </CardTitle>
                      <CardDescription>
                        {t('tokenSystem.lastAnalyzed')}: {new Date(tokenDetail.aiAnalysis.lastAnalyzed).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">{t('tokenSystem.sentiment')}</p>
                          <p className={`text-xl font-bold capitalize ${tokenDetail.aiAnalysis.sentiment === 'bullish' ? 'text-green-500' : tokenDetail.aiAnalysis.sentiment === 'bearish' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {tokenDetail.aiAnalysis.sentiment}
                          </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">{t('tokenSystem.sentimentScore')}</p>
                          <p className="text-xl font-bold">{tokenDetail.aiAnalysis.sentimentScore}/100</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">{t('tokenSystem.riskLevel')}</p>
                          <p className={`text-xl font-bold capitalize ${tokenDetail.aiAnalysis.riskLevel === 'low' ? 'text-green-500' : tokenDetail.aiAnalysis.riskLevel === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                            {tokenDetail.aiAnalysis.riskLevel}
                          </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">{t('tokenSystem.riskScore')}</p>
                          <p className="text-xl font-bold">{tokenDetail.aiAnalysis.riskScore}/100</p>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-background">
                        <p className="text-sm font-medium mb-2">{t('tokenSystem.aiRecommendation')}</p>
                        <p className="text-sm text-muted-foreground">{tokenDetail.aiAnalysis.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center p-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p>{t('tokenSystem.failedToLoadDetails')}</p>
              </div>
            )}
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="border-t flex justify-between gap-4">
          <div className="flex gap-2">
            {token.website && (
              <Button variant="outline" size="sm" onClick={() => window.open(token.website, "_blank")}>
                <Globe className="h-4 w-4 mr-1" />
                {t('tokenSystem.website')}
              </Button>
            )}
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              {t('tokenSystem.analytics')}
            </Button>
          </div>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function TokenList({ tokens, isLoading, standard }: { tokens: TokenStandard[], isLoading: boolean, standard: string }) {
  const { t } = useTranslation();
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
          <p className="text-muted-foreground">{t('tokenSystem.noTokensDeployed', { standard })}</p>
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
                  <p className="text-sm font-medium">{t('tokenSystem.supply')}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{formatTokenAmount(token.totalSupply)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{t('tokenSystem.holders')}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{formatNumber(token.holders)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{t('tokenSystem.tx24h')}</p>
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
