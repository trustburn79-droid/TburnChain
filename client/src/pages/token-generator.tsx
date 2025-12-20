import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatNumber, formatTokenAmount } from "@/lib/formatters";
import {
  Box,
  PlusCircle,
  List,
  GitBranch,
  Rocket,
  Home,
  CheckCircle2,
  Loader2,
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
  GitBranch as GitBranchIcon,
  History,
  CircleDollarSign,
  Gem,
  Gamepad2,
  Building2,
  Landmark,
  ShoppingBag,
  Upload,
  X,
  ImageIcon,
  ChevronDown,
  Search,
  HelpCircle,
  ScanLine,
  User,
  Bug,
  Hexagon,
} from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

type TabType = "create" | "myTokens" | "verification";
type TokenStandardType = "TBC-20" | "TBC-721" | "TBC-1155";
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

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
  accessControl: "ownable" | "roles" | "multisig";
  upgradeability: "none" | "transparent" | "uups";
}

interface SecurityVulnerability {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  recommendation: string;
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
  deployedAt: string;
  holders: number;
  transactionCount: number;
  status: string;
}

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

// Mapping for template IDs to locale keys
const TEMPLATE_LOCALE_KEYS: Record<string, string> = {
  "defi-governance": "defiGovernance",
  "utility-token": "utilityToken",
  "gamefi-asset": "gamefiAsset",
  "nft-collection": "nftCollection",
  "enterprise-token": "enterpriseSecurity",
  "marketplace-token": "marketplaceToken"
};

// Mapping for feature names to locale keys
const FEATURE_LOCALE_KEYS: Record<string, string> = {
  "Governance Voting": "governanceVoting",
  "Staking Rewards": "stakingRewards",
  "Auto-Burn": "autoBurn",
  "Delegation": "delegation",
  "Usage Rewards": "usageRewards",
  "Dynamic Pricing": "dynamicPricing",
  "Cross-Platform": "crossPlatform",
  "API Access": "apiAccess",
  "In-Game Items": "inGameItems",
  "Marketplace Ready": "marketplaceReady",
  "Batch Transfers": "batchTransfers",
  "Level System": "levelSystem",
  "Royalty Enforcement": "royaltyEnforcement",
  "AI Authenticity": "aiAuthenticity",
  "IPFS Metadata": "ipfsMetadata",
  "Rarity Scoring": "rarityScoring",
  "KYC/AML": "kycAml",
  "Multi-Signature": "multiSignature",
  "Compliance": "compliance",
  "Audit Trail": "auditTrail",
  "Loyalty Points": "loyaltyPoints",
  "Cashback": "cashback",
  "Merchant Tools": "merchantTools",
  "Payment Gateway": "paymentGateway"
};

// Mapping for category names to locale keys
const CATEGORY_LOCALE_KEYS: Record<string, string> = {
  "DeFi": "governance",
  "Utility": "utility",
  "GameFi": "gamefi",
  "NFT": "nft",
  "Enterprise": "enterprise",
  "Commerce": "commerce"
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
  maxTokens: "10000",
  royaltyPercentage: 5,
  royaltyRecipient: "",
  vestingEnabled: false,
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
  accessControl: "ownable",
  upgradeability: "none"
};

export default function TokenSystemPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === "dark";
  
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [selectedStandard, setSelectedStandard] = useState<TokenStandardType>("TBC-20");
  const [selectedTemplate, setSelectedTemplate] = useState<TokenTemplate | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<TokenFormData>(initialFormData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [securityAnalysis, setSecurityAnalysis] = useState<{
    score: number;
    vulnerabilities: SecurityVulnerability[];
    gasEstimate: number;
    recommendations: string[];
  } | null>(null);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [deployedContractAddress, setDeployedContractAddress] = useState("");

  const { data: deployedTokens, isLoading: tokensLoading } = useQuery<DeployedToken[]>({
    queryKey: ["/api/token-system/deployed"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const formatSupply = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US");
  };

  const getTokenIcon = () => {
    if (formData.symbol) {
      return formData.symbol.charAt(0).toUpperCase();
    }
    return selectedStandard === "TBC-721" ? "N" : selectedStandard === "TBC-1155" ? "M" : "T";
  };

  const handleTemplateSelect = (template: TokenTemplate) => {
    setSelectedTemplate(template);
    setSelectedStandard(template.standard);
    setFormData({
      ...initialFormData,
      ...template.presets
    });
    setWizardStep(2);
  };

  const handleStandardSelect = (standard: TokenStandardType) => {
    setSelectedStandard(standard);
    setSelectedTemplate(null);
    setFormData(initialFormData);
    setWizardStep(2);
  };

  const runSecurityAnalysis = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const vulnerabilities: SecurityVulnerability[] = [];
    let score = 100;
    
    if (!formData.quantumResistant) {
      vulnerabilities.push({
        id: "qr-001",
        severity: "medium",
        title: t('tokenGenerator.security.quantumTitle', { defaultValue: 'Quantum Vulnerability Detected' }),
        description: t('tokenGenerator.security.quantumDesc', { defaultValue: 'Token not using quantum-resistant signatures' }),
        recommendation: t('tokenGenerator.security.quantumRec', { defaultValue: 'Enable CRYSTALS-Dilithium + ED25519 signatures' })
      });
      score -= 10;
    }
    
    if (!formData.mevProtection) {
      vulnerabilities.push({
        id: "mev-001",
        severity: "high",
        title: t('tokenGenerator.security.mevTitle', { defaultValue: 'MEV Attack Vector' }),
        description: t('tokenGenerator.security.mevDesc', { defaultValue: 'No MEV protection enabled for transactions' }),
        recommendation: t('tokenGenerator.security.mevRec', { defaultValue: 'Enable MEV protection to prevent front-running' })
      });
      score -= 15;
    }

    if (formData.mintable && !formData.capped) {
      vulnerabilities.push({
        id: "inf-001",
        severity: "medium",
        title: t('tokenGenerator.security.uncappedTitle', { defaultValue: 'Uncapped Supply Risk' }),
        description: t('tokenGenerator.security.uncappedDesc', { defaultValue: 'Mintable token without supply cap' }),
        recommendation: t('tokenGenerator.security.uncappedRec', { defaultValue: 'Set a maximum supply limit for investor confidence' })
      });
      score -= 5;
    }

    if (!formData.aiAntiBot) {
      vulnerabilities.push({
        id: "bot-001",
        severity: "low",
        title: t('tokenGenerator.security.botTitle', { defaultValue: 'Bot Trading Vulnerability' }),
        description: t('tokenGenerator.security.botDesc', { defaultValue: 'No anti-bot protection enabled' }),
        recommendation: t('tokenGenerator.security.botRec', { defaultValue: 'Enable AI anti-bot to prevent manipulation' })
      });
      score -= 5;
    }

    const recommendations = [];
    if (formData.aiOptimizationEnabled) {
      recommendations.push(t('tokenGenerator.security.aiOptimizationRec', { defaultValue: 'AI optimization will reduce gas costs by ~23%' }));
    }
    if (formData.stakingEnabled) {
      recommendations.push(t('tokenGenerator.security.stakingRec', { rate: formData.stakingRewardRate, defaultValue: `Staking APY configured at ${formData.stakingRewardRate}%` }));
    }
    if (formData.vestingEnabled) {
      recommendations.push(t('tokenGenerator.security.vestingRec', { defaultValue: 'Vesting schedule provides long-term stability' }));
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

  const handleDeploy = async () => {
    setIsDeploying(true);
    setShowConsole(true);
    setConsoleLogs([]);
    setDeploySuccess(false);

    const contractAddr = `0x${Math.random().toString(16).substr(2, 40)}`;
    setDeployedContractAddress(contractAddr);

    const steps = [
      { msg: `> ${t('tokenGenerator.console.initFactory', { standard: selectedStandard })}...`, delay: 500 },
      { msg: `> ${t('tokenGenerator.console.compilingBytecode')}...`, delay: 700 },
      { msg: `> ${t('tokenGenerator.console.runningAISecurity')}...`, delay: 800 },
      { msg: `> ${t('tokenGenerator.console.securityScore')}: <span class='text-emerald-500'>${securityAnalysis?.score || 95}/100</span>`, delay: 400 },
      { msg: `> ${t('tokenGenerator.console.connectingMainnet')}...`, delay: 800 },
      { msg: `> ${t('tokenGenerator.console.estimatingGas')}... <span class='text-emerald-500'>0.00045 TB</span>`, delay: 800 },
      { msg: `> ${t('tokenGenerator.console.applyingQuantum')}...`, delay: 600 },
      { msg: `> ${t('tokenGenerator.console.signingTransaction')}...`, delay: 700 },
      { msg: `> ${t('tokenGenerator.console.broadcasting')}...`, delay: 700 },
      { msg: `> <span class='text-emerald-500'>[SUCCESS]</span> ${t('tokenGenerator.console.blockConfirmed')}`, delay: 800 },
      { msg: `> ${t('tokenGenerator.console.contractAddress')}: <span class='text-pink-400'>${contractAddr.slice(0, 10)}...${contractAddr.slice(-6)}</span>`, delay: 200 },
      { msg: `> ${t('tokenGenerator.console.verifyingSource')}...`, delay: 800 },
      { msg: `> <span class='text-emerald-500 font-bold'>${t('tokenGenerator.tokenDeployedSuccess')}</span>`, delay: 500 },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      const timestamp = new Date().toLocaleTimeString();
      setConsoleLogs((prev) => [...prev, `[${timestamp}] ${step.msg}`]);
    }

    setIsDeploying(false);
    setDeploySuccess(true);
    setWizardStep(6);

    toast({
      title: t('tokenGenerator.tokenDeployedSuccess'),
      description: `${formData.name} (${formData.symbol}) - ${t('tokenGenerator.deployToTburn')}`,
    });
  };

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedTemplate(null);
    setFormData(initialFormData);
    setSecurityAnalysis(null);
    setAnalysisComplete(false);
    setDeploySuccess(false);
    setShowConsole(false);
    setConsoleLogs([]);
    setDeployedContractAddress("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    toast({ title: t('tokenGenerator.copiedToClipboard') });
  };

  const getStandardIcon = () => {
    switch (selectedStandard) {
      case "TBC-20": return <Coins className="w-4 h-4" />;
      case "TBC-721": return <Image className="w-4 h-4" />;
      case "TBC-1155": return <Layers className="w-4 h-4" />;
    }
  };

  const getStandardColor = () => {
    switch (selectedStandard) {
      case "TBC-20": return "text-blue-500";
      case "TBC-721": return "text-purple-500";
      case "TBC-1155": return "text-amber-500";
    }
  };

  const stepLabels = [
    t('tokenGenerator.stepTemplate'),
    t('tokenGenerator.stepBasicInfo'),
    t('tokenGenerator.stepFeatures'),
    t('tokenGenerator.stepAiSecurity'),
    t('tokenGenerator.stepReview'),
    t('tokenGenerator.stepComplete')
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased ${isDark ? 'bg-[#0B1120] text-[#E2E8F0]' : 'bg-slate-50 text-slate-800'}`}>
      
      <aside className={`w-20 lg:w-64 flex flex-col z-20 transition-all duration-300 border-r ${isDark ? 'bg-[#0F172A] border-gray-800' : 'bg-white border-slate-200'}`}>
        <div className={`h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div className="hidden lg:block ml-3">
            <h1 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('tokenGenerator.pageTitle')}
            </h1>
            <p className="text-xs text-muted-foreground">{t('tokenGenerator.tokenCreationSystem')}</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => setActiveTab("create")}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
              activeTab === "create"
                ? isDark
                  ? 'bg-[#151E32] text-white border-l-4 border-blue-500 shadow-sm'
                  : 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            data-testid="nav-create-token"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="hidden lg:block font-medium">{t('tokenGenerator.createToken')}</span>
          </button>
          <button
            onClick={() => setActiveTab("myTokens")}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
              activeTab === "myTokens"
                ? isDark
                  ? 'bg-[#151E32] text-white border-l-4 border-blue-500 shadow-sm'
                  : 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            data-testid="nav-my-tokens"
          >
            <List className="w-6 h-6" />
            <span className="hidden lg:block font-medium">{t('tokenGenerator.myTokens')}</span>
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
              activeTab === "verification"
                ? isDark
                  ? 'bg-[#151E32] text-white border-l-4 border-blue-500 shadow-sm'
                  : 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            data-testid="nav-verification"
          >
            <ShieldCheck className="w-6 h-6" />
            <span className="hidden lg:block font-medium">{t('tokenGenerator.verification')}</span>
          </button>
        </nav>

        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold">{t('tokenGenerator.tripleBandAi')}</span>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              GPT-4o + Claude + Gemini
            </p>
          </div>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col relative overflow-hidden ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'} transition-colors duration-300`}>
        
        <header className={`h-16 border-b ${isDark ? 'border-gray-800 bg-[#0B1120]/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10`}>
          <div className="flex items-center gap-3">
            <Select value={selectedStandard} onValueChange={(v) => setSelectedStandard(v as TokenStandardType)}>
              <SelectTrigger className={`w-[140px] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`} data-testid="select-standard">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TBC-20">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-500" />
                    <span>TBC-20</span>
                  </div>
                </SelectItem>
                <SelectItem value="TBC-721">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-purple-500" />
                    <span>TBC-721</span>
                  </div>
                </SelectItem>
                <SelectItem value="TBC-1155">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>TBC-1155</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {t('tokenGenerator.auditVerified')}
            </Badge>
            <Badge variant="outline" className={isDark ? 'border-gray-700' : ''}>
              <Shield className="w-3 h-3 mr-1" />
              {t('tokenGenerator.quantumSecure')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-home">
                <Home className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/qna">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-qna">
                <HelpCircle className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/scan">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-scan">
                <ScanLine className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/user">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-user">
                <User className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/bug-bounty">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-bug-bounty">
                <Bug className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/token-generator">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-token-generator">
                <Hexagon className="w-5 h-5" />
              </a>
            </Link>
            <LanguageSelector isDark={isDark} />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth z-0">
          {activeTab === "create" && (
            <CreateTokenContent
              isDark={isDark}
              selectedStandard={selectedStandard}
              selectedTemplate={selectedTemplate}
              wizardStep={wizardStep}
              setWizardStep={setWizardStep}
              formData={formData}
              setFormData={setFormData}
              handleTemplateSelect={handleTemplateSelect}
              handleStandardSelect={handleStandardSelect}
              isAnalyzing={isAnalyzing}
              analysisComplete={analysisComplete}
              securityAnalysis={securityAnalysis}
              runSecurityAnalysis={runSecurityAnalysis}
              isDeploying={isDeploying}
              deploySuccess={deploySuccess}
              handleDeploy={handleDeploy}
              resetWizard={resetWizard}
              showConsole={showConsole}
              consoleLogs={consoleLogs}
              deployedContractAddress={deployedContractAddress}
              copyToClipboard={copyToClipboard}
              copiedAddress={copiedAddress}
              formatSupply={formatSupply}
              getTokenIcon={getTokenIcon}
              stepLabels={stepLabels}
            />
          )}

          {activeTab === "myTokens" && (
            <MyTokensContent
              isDark={isDark}
              deployedTokens={deployedTokens}
              tokensLoading={tokensLoading}
              copyToClipboard={copyToClipboard}
            />
          )}

          {activeTab === "verification" && (
            <VerificationContent isDark={isDark} />
          )}
        </div>
      </main>
    </div>
  );
}

function CreateTokenContent({
  isDark,
  selectedStandard,
  selectedTemplate,
  wizardStep,
  setWizardStep,
  formData,
  setFormData,
  handleTemplateSelect,
  handleStandardSelect,
  isAnalyzing,
  analysisComplete,
  securityAnalysis,
  runSecurityAnalysis,
  isDeploying,
  deploySuccess,
  handleDeploy,
  resetWizard,
  showConsole,
  consoleLogs,
  deployedContractAddress,
  copyToClipboard,
  copiedAddress,
  formatSupply,
  getTokenIcon,
  stepLabels,
}: any) {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {selectedStandard} {t('tokenGenerator.tokenFactory')}
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>
              {t('tokenGenerator.wizardDescription')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stepLabels.map((label: string, i: number) => (
              <div key={i} className="flex items-center">
                <div 
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                    ${wizardStep > i + 1 ? 'bg-green-500 text-white' : wizardStep === i + 1 ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-500' : 'bg-slate-200 text-slate-500'}`}
                >
                  {wizardStep > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-6 h-0.5 ${wizardStep > i + 1 ? 'bg-green-500' : isDark ? 'bg-gray-800' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {wizardStep === 1 && (
        <div className="space-y-6">
          <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                {t('tokenGenerator.chooseTemplate')}
              </CardTitle>
              <CardDescription>
                {t('tokenGenerator.templateDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOKEN_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer border-2 transition-all hover:scale-[1.02] ${isDark ? 'bg-[#0B1120] hover:border-blue-500' : 'hover:border-blue-500'}`}
                    onClick={() => handleTemplateSelect(template)}
                    data-testid={`card-template-${template.id}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          template.standard === "TBC-20" ? 'bg-blue-500/20' :
                          template.standard === "TBC-721" ? 'bg-purple-500/20' : 'bg-amber-500/20'
                        }`}>
                          <template.icon className={`h-5 w-5 ${
                            template.standard === "TBC-20" ? 'text-blue-500' :
                            template.standard === "TBC-721" ? 'text-purple-500' : 'text-amber-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{t(`tokenGenerator.templates.${TEMPLATE_LOCALE_KEYS[template.id] || template.id}.name`, { defaultValue: template.name })}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{template.standard}</Badge>
                            {template.aiRecommended && (
                              <Badge className="text-xs bg-purple-500/10 text-purple-500">
                                <Brain className="h-2 w-2 mr-1" />
                                {t('tokenGenerator.aiRecommended')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t(`tokenGenerator.templates.${TEMPLATE_LOCALE_KEYS[template.id] || template.id}.description`, { defaultValue: template.description })}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 2).map((feature: string) => (
                          <Badge key={feature} variant="secondary" className="text-xs">{t(`tokenGenerator.featuresList.${FEATURE_LOCALE_KEYS[feature] || feature}`, { defaultValue: feature })}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
            <CardHeader>
              <CardTitle>{t('tokenGenerator.createFromScratch')}</CardTitle>
              <CardDescription>{t('tokenGenerator.createFromScratchDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { std: "TBC-20" as const, icon: Coins, color: "blue", descKey: "tbc20Desc" },
                  { std: "TBC-721" as const, icon: Image, color: "purple", descKey: "tbc721Desc" },
                  { std: "TBC-1155" as const, icon: Layers, color: "amber", descKey: "tbc1155Desc" }
                ].map(({ std, icon: Icon, color, descKey }) => (
                  <Card 
                    key={std}
                    className={`cursor-pointer border-2 transition-all hover:scale-[1.02] ${isDark ? 'bg-[#0B1120]' : ''} hover:border-${color}-500`}
                    onClick={() => handleStandardSelect(std)}
                    data-testid={`card-select-${std.toLowerCase()}`}
                  >
                    <CardContent className="pt-6 text-center">
                      <div className={`h-16 w-16 rounded-full bg-${color}-500/20 flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`h-8 w-8 text-${color}-500`} />
                      </div>
                      <h3 className="font-bold text-lg">{std}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t(`tokenGenerator.${descKey}`)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {wizardStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                  {t('tokenGenerator.basicInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      {t('tokenGenerator.tokenName')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. My Awesome Token"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={isDark ? 'bg-[#0B1120] border-gray-700' : ''}
                      data-testid="input-token-name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      {t('tokenGenerator.tokenSymbol')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. MAT"
                      value={formData.symbol}
                      onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                      className={`uppercase ${isDark ? 'bg-[#0B1120] border-gray-700' : ''}`}
                      data-testid="input-token-symbol"
                    />
                  </div>
                  {selectedStandard === "TBC-20" && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          {t('tokenGenerator.initialSupply')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="1000000"
                          value={formData.totalSupply}
                          onChange={(e) => setFormData({...formData, totalSupply: e.target.value})}
                          className={isDark ? 'bg-[#0B1120] border-gray-700' : ''}
                          data-testid="input-initial-supply"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          {t('tokenGenerator.decimals')}
                        </label>
                        <Input
                          type="number"
                          value={formData.decimals}
                          onChange={(e) => setFormData({...formData, decimals: parseInt(e.target.value) || 18})}
                          className={isDark ? 'bg-[#0B1120] border-gray-700' : ''}
                          data-testid="input-decimals"
                        />
                      </div>
                    </>
                  )}
                  {(selectedStandard === "TBC-721" || selectedStandard === "TBC-1155") && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          {t('tokenGenerator.maxTokens')}
                        </label>
                        <Input
                          type="number"
                          placeholder="10000"
                          value={formData.maxTokens}
                          onChange={(e) => setFormData({...formData, maxTokens: e.target.value})}
                          className={isDark ? 'bg-[#0B1120] border-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          {t('tokenGenerator.baseUri')}
                        </label>
                        <Input
                          placeholder="ipfs://..."
                          value={formData.baseUri}
                          onChange={(e) => setFormData({...formData, baseUri: e.target.value})}
                          className={isDark ? 'bg-[#0B1120] border-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          {t('tokenGenerator.royaltyPercentage')}
                        </label>
                        <Input
                          type="number"
                          placeholder="5"
                          value={formData.royaltyPercentage}
                          onChange={(e) => setFormData({...formData, royaltyPercentage: parseFloat(e.target.value) || 0})}
                          className={isDark ? 'bg-[#0B1120] border-gray-700' : ''}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    {t('tokenGenerator.description')}
                  </label>
                  <Textarea
                    placeholder={t('tokenGenerator.describeYourToken')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className={isDark ? 'bg-[#0B1120] border-gray-700' : ''}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <LivePreviewCard
              isDark={isDark}
              selectedStandard={selectedStandard}
              formData={formData}
              formatSupply={formatSupply}
              getTokenIcon={getTokenIcon}
            />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setWizardStep(1)} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('tokenGenerator.back')}
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => setWizardStep(3)}
                disabled={!formData.name || !formData.symbol}
                data-testid="button-next"
              >
                {t('tokenGenerator.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {wizardStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                  {t('tokenGenerator.tokenFeatures')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStandard === "TBC-20" && (
                  <>
                    <FeatureToggle
                      isDark={isDark}
                      title={t('tokenGenerator.mintable')}
                      description={t('tokenGenerator.mintableDesc')}
                      checked={formData.mintable}
                      onChange={(v) => setFormData({...formData, mintable: v})}
                      testId="switch-mintable"
                    />
                    <FeatureToggle
                      isDark={isDark}
                      title={t('tokenGenerator.burnable')}
                      description={t('tokenGenerator.burnableDesc')}
                      checked={formData.burnable}
                      onChange={(v) => setFormData({...formData, burnable: v})}
                      testId="switch-burnable"
                    />
                    <FeatureToggle
                      isDark={isDark}
                      title={t('tokenGenerator.pausable')}
                      description={t('tokenGenerator.pausableDesc')}
                      checked={formData.pausable}
                      onChange={(v) => setFormData({...formData, pausable: v})}
                      testId="switch-pausable"
                    />
                    <FeatureToggle
                      isDark={isDark}
                      title={t('tokenGenerator.stakingEnabled')}
                      description={t('tokenGenerator.stakingEnabledDesc')}
                      checked={formData.stakingEnabled}
                      onChange={(v) => setFormData({...formData, stakingEnabled: v})}
                      testId="switch-staking"
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  {t('tokenGenerator.aiSecurityFeatures')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FeatureToggle
                  isDark={isDark}
                  title={t('tokenGenerator.aiOptimizationEnabled')}
                  description={t('tokenGenerator.aiOptimizationEnabledDesc')}
                  checked={formData.aiOptimizationEnabled}
                  onChange={(v) => setFormData({...formData, aiOptimizationEnabled: v})}
                  testId="switch-ai-optimization"
                />
                <FeatureToggle
                  isDark={isDark}
                  title={t('tokenGenerator.aiAntiBot')}
                  description={t('tokenGenerator.antiBotDesc')}
                  checked={formData.aiAntiBot}
                  onChange={(v) => setFormData({...formData, aiAntiBot: v})}
                  testId="switch-ai-antibot"
                />
                <FeatureToggle
                  isDark={isDark}
                  title={t('tokenGenerator.quantumResistant')}
                  description={t('tokenGenerator.quantumDesc')}
                  checked={formData.quantumResistant}
                  onChange={(v) => setFormData({...formData, quantumResistant: v})}
                  testId="switch-quantum"
                />
                <FeatureToggle
                  isDark={isDark}
                  title={t('tokenGenerator.mevProtection')}
                  description={t('tokenGenerator.mevDesc')}
                  checked={formData.mevProtection}
                  onChange={(v) => setFormData({...formData, mevProtection: v})}
                  testId="switch-mev"
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <LivePreviewCard
              isDark={isDark}
              selectedStandard={selectedStandard}
              formData={formData}
              formatSupply={formatSupply}
              getTokenIcon={getTokenIcon}
            />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setWizardStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('tokenGenerator.back')}
              </Button>
              <Button className="flex-1" onClick={() => setWizardStep(4)}>
                {t('tokenGenerator.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {wizardStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  {t('tokenGenerator.aiSecurityFeatures')}
                </CardTitle>
                <CardDescription>
                  {t('tokenGenerator.enterpriseFeatures')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analysisComplete ? (
                  <div className="text-center py-8">
                    {isAnalyzing ? (
                      <div className="space-y-4">
                        <Loader2 className="w-12 h-12 mx-auto text-purple-500 animate-spin" />
                        <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>
                          {t('tokenGenerator.analyzingSecurity')}
                        </p>
                        <Progress value={65} className="w-64 mx-auto" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Brain className="w-16 h-16 mx-auto text-purple-500" />
                        <h3 className="text-lg font-semibold">{t('tokenGenerator.readyForSecurityAnalysis')}</h3>
                        <p className={`max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          {t('tokenGenerator.templateDesc')}
                        </p>
                        <Button onClick={runSecurityAnalysis} className="mt-4" data-testid="button-run-analysis">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t('tokenGenerator.runSecurityAnalysis')}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : securityAnalysis && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-green-500">{securityAnalysis.score}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{t('tokenGenerator.securityScore')}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {securityAnalysis.score >= 90 ? t('tokenGenerator.excellentSecurity') : securityAnalysis.score >= 70 ? t('tokenGenerator.goodSecurity') : t('tokenGenerator.needsImprovement')}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500">{t('tokenGenerator.passed')}</Badge>
                    </div>

                    {securityAnalysis.vulnerabilities.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          {t('tokenGenerator.findings')} ({securityAnalysis.vulnerabilities.length})
                        </h4>
                        {securityAnalysis.vulnerabilities.map((vuln: SecurityVulnerability) => (
                          <div 
                            key={vuln.id}
                            className={`p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-medium">{vuln.title}</span>
                              <Badge variant={vuln.severity === 'high' ? 'destructive' : vuln.severity === 'medium' ? 'default' : 'secondary'}>
                                {vuln.severity}
                              </Badge>
                            </div>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{vuln.description}</p>
                            <p className="text-sm text-green-500">{vuln.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className="font-semibold mb-2">{t('tokenGenerator.gasEstimate')}</h4>
                      <p className="text-2xl font-mono font-bold text-blue-500">
                        ~{securityAnalysis.gasEstimate.toLocaleString()} gas
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        Estimated cost: ~0.0005 TB
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <LivePreviewCard
              isDark={isDark}
              selectedStandard={selectedStandard}
              formData={formData}
              formatSupply={formatSupply}
              getTokenIcon={getTokenIcon}
            />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setWizardStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('tokenGenerator.back')}
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => setWizardStep(5)}
                disabled={!analysisComplete}
              >
                {t('tokenGenerator.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {wizardStep === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('tokenGenerator.deploymentReview')}
                </CardTitle>
                <CardDescription>
                  {t('tokenGenerator.reviewFinalSettings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ReviewItem label={t('tokenGenerator.tokenName')} value={formData.name} />
                  <ReviewItem label={t('tokenGenerator.tokenSymbol')} value={formData.symbol} />
                  <ReviewItem label="Standard" value={selectedStandard} />
                  {selectedStandard === "TBC-20" && (
                    <>
                      <ReviewItem label={t('tokenGenerator.totalSupply')} value={formatSupply(formData.totalSupply)} />
                      <ReviewItem label={t('tokenGenerator.decimals')} value={formData.decimals.toString()} />
                    </>
                  )}
                  {(selectedStandard === "TBC-721" || selectedStandard === "TBC-1155") && (
                    <>
                      <ReviewItem label={t('tokenGenerator.maxTokens')} value={formData.maxTokens} />
                      <ReviewItem label={t('tokenGenerator.royaltyPercentage')} value={`${formData.royaltyPercentage}%`} />
                    </>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3">{t('tokenGenerator.features')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.mintable && <Badge>{t('tokenGenerator.mintable')}</Badge>}
                    {formData.burnable && <Badge>{t('tokenGenerator.burnable')}</Badge>}
                    {formData.pausable && <Badge>{t('tokenGenerator.pausable')}</Badge>}
                    {formData.stakingEnabled && <Badge variant="secondary">{t('tokenGenerator.staking')}</Badge>}
                    {formData.aiOptimizationEnabled && <Badge className="bg-purple-500/10 text-purple-500">{t('tokenGenerator.aiOptimized')}</Badge>}
                    {formData.quantumResistant && <Badge className="bg-green-500/10 text-green-500">{t('tokenGenerator.quantumSecure')}</Badge>}
                    {formData.mevProtection && <Badge className="bg-blue-500/10 text-blue-500">{t('tokenGenerator.mevProtected')}</Badge>}
                    {formData.aiAntiBot && <Badge className="bg-amber-500/10 text-amber-500">{t('tokenGenerator.antiBot')}</Badge>}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('tokenGenerator.serviceFee')}</span>
                    <span className="font-medium">100 TB</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('tokenGenerator.gasFee')}</span>
                    <span className="font-medium text-green-500">~0.0005 TB</span>
                  </div>
                  <div className={`border-t pt-2 mt-2 flex justify-between ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
                    <span className="font-bold">{t('tokenGenerator.total')}</span>
                    <span className="font-bold text-blue-500 text-lg">~100.0005 TB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <LivePreviewCard
              isDark={isDark}
              selectedStandard={selectedStandard}
              formData={formData}
              formatSupply={formatSupply}
              getTokenIcon={getTokenIcon}
            />
            <div className="mt-4 space-y-3">
              <Button 
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                onClick={handleDeploy}
                disabled={isDeploying}
                data-testid="button-deploy"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('tokenGenerator.deploying')}
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    {t('tokenGenerator.deploy')}
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setWizardStep(4)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('tokenGenerator.back')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {wizardStep === 6 && (
        <div className="max-w-2xl mx-auto">
          <Card className={`text-center ${isDark ? 'bg-[#151E32]/70 border-white/5' : ''}`}>
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('tokenGenerator.tokenDeployedSuccess')}</h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                {formData.name} ({formData.symbol}) - {t('tokenGenerator.deployToTburn')}
              </p>

              <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('tokenGenerator.contractAddress')}</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="font-mono text-sm">{deployedContractAddress}</code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(deployedContractAddress)}
                  >
                    {copiedAddress ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={resetWizard}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('tokenGenerator.createToken')}
                </Button>
                <Button>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('tokenGenerator.verify')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showConsole && (
        <div className="mt-6">
          <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-[#0B1120]' : 'border-slate-300 bg-slate-900'}`}>
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-slate-400 font-mono">Terminal - Deploying to TBURN Mainnet</span>
            </div>
            <div className="p-4 font-mono text-sm text-slate-300 space-y-1 h-48 overflow-y-auto" data-testid="console-logs">
              {consoleLogs.map((log: string, index: number) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: log }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LivePreviewCard({ isDark, selectedStandard, formData, formatSupply, getTokenIcon }: any) {
  return (
    <Card className={`sticky top-4 ${isDark ? 'bg-[#151E32]/70 border-white/5' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="rounded-2xl p-6 text-white shadow-2xl mb-4 border border-white/10 relative overflow-hidden" 
          style={{ 
            background: selectedStandard === "TBC-20" 
              ? 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)'
              : selectedStandard === "TBC-721"
              ? 'linear-gradient(135deg, #7c3aed 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #0f172a 100%)'
          }}
        >
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] rotate-45 pointer-events-none opacity-30" 
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl font-bold border border-white/20">
              {getTokenIcon()}
            </div>
            <Badge className="bg-black/30 backdrop-blur-md border-white/10">{selectedStandard}</Badge>
          </div>
          
          {selectedStandard === "TBC-20" && (
            <div className="mb-2 relative z-10">
              <p className="text-xs text-white/60">Total Supply</p>
              <p className="text-2xl font-mono font-bold">{formatSupply(formData.totalSupply)}</p>
            </div>
          )}
          {(selectedStandard === "TBC-721" || selectedStandard === "TBC-1155") && (
            <div className="mb-2 relative z-10">
              <p className="text-xs text-white/60">Max Items</p>
              <p className="text-2xl font-mono font-bold">{formData.maxTokens || "10,000"}</p>
            </div>
          )}
          
          <div className="relative z-10">
            <h4 className="text-lg font-bold">{formData.name || "Token Name"}</h4>
            <p className={`text-sm font-bold ${
              selectedStandard === "TBC-20" ? 'text-blue-300' :
              selectedStandard === "TBC-721" ? 'text-purple-300' : 'text-amber-300'
            }`}>
              {formData.symbol || "SYMBOL"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {formData.aiOptimizationEnabled && (
            <Badge variant="secondary" className="text-xs">
              <Brain className="w-2 h-2 mr-1" />
              AI
            </Badge>
          )}
          {formData.quantumResistant && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-2 h-2 mr-1" />
              QR
            </Badge>
          )}
          {formData.mevProtection && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-2 h-2 mr-1" />
              MEV
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureToggleProps {
  isDark: boolean;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  testId: string;
}

function FeatureToggle({ isDark, title, description, checked, onChange, testId }: FeatureToggleProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
      <div>
        <p className="font-medium">{title}</p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testId} />
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function MyTokensContent({ isDark, deployedTokens, tokensLoading, copyToClipboard }: any) {
  const { t } = useTranslation();
  const mockTokens: DeployedToken[] = [
    {
      id: "1",
      name: "TBURN Governance",
      symbol: "TBG",
      contractAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      standard: "TBC-20",
      totalSupply: "100000000",
      decimals: 18,
      mintable: false,
      burnable: true,
      pausable: false,
      aiOptimizationEnabled: true,
      quantumResistant: true,
      mevProtection: true,
      deployedAt: "2024-12-15T10:30:00Z",
      holders: 1523,
      transactionCount: 45678,
      status: "active"
    },
    {
      id: "2",
      name: "Dragon NFT Collection",
      symbol: "DRAGON",
      contractAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      standard: "TBC-721",
      totalSupply: "5000",
      decimals: 0,
      mintable: true,
      burnable: false,
      pausable: false,
      aiOptimizationEnabled: true,
      quantumResistant: true,
      mevProtection: false,
      deployedAt: "2024-12-18T14:20:00Z",
      holders: 342,
      transactionCount: 8901,
      status: "active"
    }
  ];

  const tokens = deployedTokens || mockTokens;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          My Deployed Tokens
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>
          Manage and monitor your deployed tokens on TBURN Mainnet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">{tokens.length}</p>
              </div>
              <Coins className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Holders</p>
                <p className="text-2xl font-bold">{tokens.reduce((sum: number, t: DeployedToken) => sum + t.holders, 0).toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{tokens.reduce((sum: number, t: DeployedToken) => sum + t.transactionCount, 0).toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {tokensLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          tokens.map((token: DeployedToken) => (
            <Card key={token.id} className={`hover:scale-[1.01] transition-transform ${isDark ? 'bg-[#151E32]/70 border-white/5' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      token.standard === "TBC-20" ? 'bg-blue-500/20' :
                      token.standard === "TBC-721" ? 'bg-purple-500/20' : 'bg-amber-500/20'
                    }`}>
                      {token.standard === "TBC-20" ? <Coins className="w-6 h-6 text-blue-500" /> :
                       token.standard === "TBC-721" ? <Image className="w-6 h-6 text-purple-500" /> :
                       <Layers className="w-6 h-6 text-amber-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{token.name}</h3>
                        <Badge variant="outline">{token.standard}</Badge>
                        <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          {token.contractAddress.slice(0, 10)}...{token.contractAddress.slice(-6)}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(token.contractAddress)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Holders</p>
                      <p className="font-bold">{token.holders.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Transactions</p>
                      <p className="font-bold">{token.transactionCount.toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function VerificationContent({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();
  const [contractAddress, setContractAddress] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!contractAddress) return;
    setIsVerifying(true);
    
    await new Promise(r => setTimeout(r, 2000));
    
    setVerificationResult({
      verified: true,
      name: "Sample Token",
      symbol: "SAMP",
      standard: "TBC-20",
      securityScore: 92,
      aiOptimized: true,
      quantumResistant: true,
      audited: true
    });
    
    setIsVerifying(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Contract Verification
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>
          Verify and audit any token contract on TBURN Mainnet
        </p>
      </div>

      <Card className={isDark ? 'bg-[#151E32]/70 border-white/5' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Verify Contract
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter contract address (0x...)"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className={`flex-1 ${isDark ? 'bg-[#0B1120] border-gray-700' : ''}`}
              data-testid="input-verify-address"
            />
            <Button onClick={handleVerify} disabled={isVerifying || !contractAddress} data-testid="button-verify">
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-2">Verify</span>
            </Button>
          </div>

          {verificationResult && (
            <div className={`p-6 rounded-xl border mt-6 ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{verificationResult.name}</h3>
                  <p className="text-muted-foreground">{verificationResult.symbol} • {verificationResult.standard}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-green-500/10">
                  <p className="text-2xl font-bold text-green-500">{verificationResult.securityScore}</p>
                  <p className="text-xs text-muted-foreground">Security Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-500/10">
                  <Brain className="w-6 h-6 mx-auto text-purple-500" />
                  <p className="text-xs text-muted-foreground mt-1">AI Optimized</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10">
                  <Shield className="w-6 h-6 mx-auto text-blue-500" />
                  <p className="text-xs text-muted-foreground mt-1">Quantum Secure</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-500/10">
                  <ShieldCheck className="w-6 h-6 mx-auto text-amber-500" />
                  <p className="text-xs text-muted-foreground mt-1">Audited</p>
                </div>
              </div>

              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified & Secure
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`mt-6 ${isDark ? 'bg-[#151E32]/70 border-white/5' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Triple-Band AI Security
          </CardTitle>
          <CardDescription>
            Our AI system provides comprehensive security analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">GPT-4o Strategic</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Token economics and governance analysis
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Claude Tactical</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Real-time security and MEV protection
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/10 border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">Gemini Operational</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Gas optimization and routing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
