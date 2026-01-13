import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Search,
  HelpCircle,
  FileText,
  Video,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  RefreshCw,
  Shield,
  Network,
  Bot,
  Wallet,
  Settings,
  AlertCircle,
  Play,
  Eye,
  ArrowLeft,
  CheckCircle,
  Zap,
  Database,
  Lock,
  Code,
  Globe,
  Users,
  TrendingUp,
  Cpu,
  Layers,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Printer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icon mapping system - converts string names to Lucide components
const iconRegistry: Record<string, LucideIcon> = {
  BookOpen,
  Network,
  Shield,
  Bot,
  Wallet,
  Settings,
  HelpCircle,
  FileText,
  Video,
  Star,
  Clock,
  Zap,
  Database,
  Lock,
  Code,
  Globe,
  Users,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
  AlertCircle,
  MessageCircle,
};

// Get icon component from string name
const getIconComponent = (iconName: string | LucideIcon | undefined): LucideIcon => {
  if (!iconName) return HelpCircle;
  if (typeof iconName === 'function') return iconName;
  return iconRegistry[iconName] || HelpCircle;
};

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: string;
  views: number;
  lastUpdated: string;
  featured: boolean;
  author?: string;
  readTime?: string;
  tags?: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  articleCount: number;
  description: string;
  color?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  helpful?: number;
}

interface VideoTutorial {
  id: string;
  title: string;
  description?: string;
  duration: string;
  views: number;
  thumbnail?: string;
  category?: string;
  instructor?: string;
}

interface HelpData {
  categories: HelpCategory[];
  featuredArticles: HelpArticle[];
  recentArticles: HelpArticle[];
  faqs: FAQ[];
  videos: VideoTutorial[];
}

// Static production data
const productionCategories: HelpCategory[] = [
  { 
    id: "cat-1",
    name: "Mainnet v8.0 Launch Guide", 
    icon: "BookOpen", 
    articleCount: 24, 
    description: "Complete guide for December 9th TBURN Mainnet deployment and operations",
    color: "bg-blue-500/10 text-blue-500"
  },
  { 
    id: "cat-2",
    name: "100K TPS Network Ops", 
    icon: "Network", 
    articleCount: 32, 
    description: "High-performance network operations with 8 dynamic shards and 156 validators",
    color: "bg-green-500/10 text-green-500"
  },
  { 
    id: "cat-3",
    name: "Quantum-Resistant Security", 
    icon: "Shield", 
    articleCount: 28, 
    description: "Advanced security protocols including quantum-resistant signatures and 2FA",
    color: "bg-red-500/10 text-red-500"
  },
  { 
    id: "cat-4",
    name: "Quad-Band AI System", 
    icon: "Cpu", 
    articleCount: 18, 
    description: "Multi-Band AI orchestration guide",
    color: "bg-purple-500/10 text-purple-500"
  },
  { 
    id: "cat-5",
    name: "10B TBURN Tokenomics", 
    icon: "TrendingUp", 
    articleCount: 22, 
    description: "20-year deflationary model, AI-driven burns, 30.60% target deflation",
    color: "bg-yellow-500/10 text-yellow-500"
  },
  { 
    id: "cat-6",
    name: "Admin Portal Config", 
    icon: "Settings", 
    articleCount: 16, 
    description: "33+ admin portal pages configuration and customization",
    color: "bg-cyan-500/10 text-cyan-500"
  },
];

const productionFeaturedArticles: HelpArticle[] = [
  { 
    id: "art-1", 
    title: "TBURN Mainnet v8.0 Launch Checklist", 
    description: "Complete pre-launch verification for December 9th, 2024 mainnet deployment with 100K TPS capacity",
    content: "This comprehensive guide covers all aspects of the TBURN Mainnet v8.0 launch scheduled for December 9th, 2024. The mainnet features 100,000 TPS capacity, 156 validators across 3 tiers, and quantum-resistant security.\n\n## Pre-Launch Requirements\n1. Verify all 156 validators are online and synchronized\n2. Confirm 8-shard configuration is active\n3. Test cross-shard communication\n4. Validate AI orchestration systems\n5. Complete security audit checklist\n\n## Launch Day Procedures\n- Genesis block creation at 00:00 UTC\n- Validator attestation window: 15 minutes\n- First transaction batch processing\n- Public RPC endpoints activation\n\n## Post-Launch Monitoring\n- Real-time TPS monitoring dashboard\n- Validator performance tracking\n- AI decision accuracy metrics\n- Security event logging",
    category: "Mainnet v8.0 Launch Guide", 
    views: 4521, 
    lastUpdated: "2024-12-07", 
    featured: true,
    author: "TBURN Core Team",
    readTime: "12 min",
    tags: ["mainnet", "launch", "v8.0", "deployment"]
  },
  { 
    id: "art-2", 
    title: "156 Validator Node Setup & 3-Tier Structure", 
    description: "Configure validator nodes across Tier 1 (20M), Tier 2 (5M), Tier 3 (10K) minimum stake requirements",
    content: "Learn how to configure and operate validator nodes in the TBURN network's 3-tier structure.\n\n## Tier Structure\n\n### Tier 1 - Enterprise (20M TBURN)\n- Maximum rewards (15% APY)\n- Priority block production\n- Governance voting weight: 3x\n- Required uptime: 99.9%\n\n### Tier 2 - Professional (5M TBURN)\n- Standard rewards (12% APY)\n- Regular block production\n- Governance voting weight: 2x\n- Required uptime: 99.5%\n\n### Tier 3 - Community (10K TBURN)\n- Entry-level rewards (8% APY)\n- Backup block production\n- Governance voting weight: 1x\n- Required uptime: 99%\n\n## Node Setup Steps\n1. Hardware requirements verification\n2. Software installation\n3. Key generation and registration\n4. Stake delegation\n5. Network synchronization",
    category: "100K TPS Network Ops", 
    views: 3847, 
    lastUpdated: "2024-12-06", 
    featured: true,
    author: "Network Operations",
    readTime: "18 min",
    tags: ["validators", "staking", "nodes", "setup"]
  },
  { 
    id: "art-3", 
    title: "Quad-Band AI Orchestration Configuration", 
    description: "Set up AI Engine α (primary), β (secondary), γ + δ fallback system",
    content: "Configure the Quad-Band AI Orchestration system for optimal performance.\n\n## AI Model Hierarchy\n\n### Primary Band - AI Engine α\n- Main decision engine\n- Consensus optimization\n- Real-time analysis\n- Latency: <50ms\n\n### Secondary Band - AI Engine β\n- Complex reasoning tasks\n- Governance analysis\n- Security assessment\n- Latency: <100ms\n\n### Operational Band - AI Engine γ\n- Standard operations\n- Transaction classification\n- User interaction\n- Latency: <150ms\n\n### Fallback Band - AI Engine δ\n- Emergency backup\n- High-load scenarios\n- Redundancy layer\n- Latency: <200ms\n\n## Configuration Steps\n1. API key setup for each model\n2. Failover threshold configuration\n3. Load balancing rules\n4. Monitoring integration",
    category: "Quad-Band AI System", 
    views: 3256, 
    lastUpdated: "2024-12-05", 
    featured: true,
    author: "AI Systems Team",
    readTime: "15 min",
    tags: ["AI", "orchestration", "AI Engine α", "AI Engine β", "AI Engine γ", "AI Engine δ"]
  },
  { 
    id: "art-4", 
    title: "Quantum-Resistant Security Implementation", 
    description: "Deploy quantum-resistant signatures, 2FA enforcement, and achieve 99.7% security score",
    content: "Implement quantum-resistant security protocols in your TBURN deployment.\n\n## Quantum-Resistant Features\n\n### CRYSTALS-Dilithium Signatures\n- Post-quantum cryptographic standard\n- NIST approved algorithm\n- 256-bit security level\n\n### Enhanced Authentication\n- Mandatory 2FA for all admin operations\n- Hardware key support (YubiKey, Ledger)\n- Biometric authentication options\n\n### Real-time Threat Detection\n- AI-powered anomaly detection\n- Pattern recognition for attack vectors\n- Automated response protocols\n\n## Security Metrics\n- Target security score: 99.7%\n- Zero-day vulnerability response: <4 hours\n- Penetration testing frequency: Weekly",
    category: "Quantum-Resistant Security", 
    views: 2987, 
    lastUpdated: "2024-12-04", 
    featured: true,
    author: "Security Team",
    readTime: "20 min",
    tags: ["security", "quantum", "2FA", "cryptography"]
  },
];

const productionRecentArticles: HelpArticle[] = [
  { 
    id: "art-5", 
    title: "Multi-Chain Bridge v2.0 Operations", 
    description: "ETH/BSC/Polygon/Arbitrum bridge setup with AI risk assessment and 0.1% fee structure",
    content: "Complete guide to operating the Multi-Chain Bridge v2.0...",
    category: "100K TPS Network Ops", 
    views: 1892, 
    lastUpdated: "2024-12-07", 
    featured: false,
    author: "Bridge Team",
    readTime: "10 min",
    tags: ["bridge", "cross-chain", "ETH", "BSC"]
  },
  { 
    id: "art-6", 
    title: "8-Shard Dynamic Scaling Guide", 
    description: "Configure AI-driven sharding from 8 to 64 shards with automatic load balancing",
    content: "Learn how to configure dynamic sharding for optimal network performance...",
    category: "100K TPS Network Ops", 
    views: 1654, 
    lastUpdated: "2024-12-06", 
    featured: false,
    author: "Scaling Team",
    readTime: "14 min",
    tags: ["sharding", "scaling", "performance"]
  },
  { 
    id: "art-7", 
    title: "10B TBURN Token Distribution", 
    description: "Genesis supply allocation: 15% treasury, 25% ecosystem, validator staking pools",
    content: "Detailed breakdown of the TBURN token distribution model...",
    category: "10B TBURN Tokenomics", 
    views: 1432, 
    lastUpdated: "2024-12-05", 
    featured: false,
    author: "Economics Team",
    readTime: "8 min",
    tags: ["tokenomics", "distribution", "genesis"]
  },
  { 
    id: "art-8", 
    title: "Real-time Monitoring & SLA Setup", 
    description: "Configure 99.99% uptime monitoring with WebSocket updates and alert rules",
    content: "Set up comprehensive monitoring for your TBURN infrastructure...",
    category: "Admin Portal Config", 
    views: 1276, 
    lastUpdated: "2024-12-04", 
    featured: false,
    author: "DevOps Team",
    readTime: "11 min",
    tags: ["monitoring", "SLA", "alerts", "websocket"]
  },
];

const productionFAQs: FAQ[] = [
  { 
    id: "faq-1",
    question: "What is the total supply of TBURN and initial price?", 
    answer: "TBURN Mainnet v8.0 launches with 10B (10 billion) total supply at $0.50 initial price, targeting 6.94B at Y20 through 30.60% deflationary mechanism. The deflationary model is driven by AI-optimized burn mechanisms that analyze transaction patterns and market conditions.",
    category: "Tokenomics",
    helpful: 156
  },
  { 
    id: "faq-2",
    question: "How does the Quad-Band AI Orchestration work?", 
    answer: "The system uses AI Engine α as primary, β as secondary, with γ and δ as fallback bands. Automatic failover ensures 99.99% AI availability for consensus optimization, burn rate calculations, and governance analysis. Each band has specific responsibilities and performance thresholds.",
    category: "AI System",
    helpful: 142
  },
  { 
    id: "faq-3",
    question: "What are the validator tier requirements?", 
    answer: "Tier 1: 20M TBURN minimum stake (enterprise) with 15% APY, Tier 2: 5M TBURN (professional) with 12% APY, Tier 3: 10K TBURN (community) with 8% APY. All 156 validators participate in BFT consensus with different voting weights based on tier.",
    category: "Validators",
    helpful: 128
  },
  { 
    id: "faq-4",
    question: "How does the quantum-resistant security work?", 
    answer: "TBURN implements post-quantum cryptographic signatures using CRYSTALS-Dilithium, combined with mandatory 2FA and real-time threat detection achieving 99.7% security score. The quantum-resistant layer protects against future quantum computing attacks.",
    category: "Security",
    helpful: 115
  },
  { 
    id: "faq-5",
    question: "What chains does the Multi-Chain Bridge support?", 
    answer: "Bridge v2.0 supports Ethereum, BSC, Polygon, and Arbitrum with 0.1% fees, AI-driven risk assessment, and sub-minute confirmation times. Additional chains including Avalanche and Solana are planned for Q1 2025.",
    category: "Bridge",
    helpful: 98
  },
  { 
    id: "faq-6",
    question: "How does the AI-driven burn mechanism work?", 
    answer: "70% of transaction fees are automatically burned through AI analysis, targeting 30.60% total supply reduction by Year 20 (from 10B to 6.94B TBURN). The AI analyzes market conditions, transaction volume, and network health to optimize burn rates.",
    category: "Tokenomics",
    helpful: 87
  },
  {
    id: "faq-7",
    question: "How do I become a validator on TBURN network?",
    answer: "To become a validator: 1) Meet minimum stake requirements for your desired tier, 2) Set up validator node with required hardware, 3) Register your node on the network, 4) Complete KYC for Tier 1/2 validators, 5) Begin block production after 24-hour synchronization period.",
    category: "Validators",
    helpful: 76
  },
  {
    id: "faq-8",
    question: "What is the expected APY for staking TBURN?",
    answer: "Staking APY varies by tier and delegation method: Tier 1 validators earn 15% APY, Tier 2 earn 12% APY, Tier 3 earn 8% APY. Delegators typically receive 80% of validator rewards after commission. Actual returns depend on network activity and validator performance.",
    category: "Staking",
    helpful: 71
  },
];

const productionVideos: VideoTutorial[] = [
  { 
    id: "vid-1",
    title: "TBURN Mainnet v8.0 Complete Overview", 
    description: "Comprehensive walkthrough of the TBURN Mainnet v8.0 architecture, features, and capabilities",
    duration: "24:30", 
    views: 8521,
    category: "Overview",
    instructor: "Dr. Sarah Chen"
  },
  { 
    id: "vid-2",
    title: "156 Validator Network Setup Guide", 
    description: "Step-by-step tutorial for setting up and configuring validator nodes across all tiers",
    duration: "32:15", 
    views: 6287,
    category: "Validators",
    instructor: "Mike Johnson"
  },
  { 
    id: "vid-3",
    title: "Quad-Band AI Configuration Tutorial", 
    description: "Learn how to configure the Quad-Band AI orchestration system for optimal performance",
    duration: "28:45", 
    views: 5654,
    category: "AI System",
    instructor: "Dr. Alex Kim"
  },
  { 
    id: "vid-4",
    title: "Quantum-Resistant Security Deep Dive", 
    description: "Technical deep dive into TBURN's quantum-resistant security implementation",
    duration: "35:20", 
    views: 4198,
    category: "Security",
    instructor: "James Wilson"
  },
  { 
    id: "vid-5",
    title: "Multi-Chain Bridge v2.0 Operations", 
    description: "Guide to operating the multi-chain bridge for cross-chain asset transfers",
    duration: "22:18", 
    views: 3876,
    category: "Bridge",
    instructor: "Lisa Park"
  },
  {
    id: "vid-6",
    title: "Admin Portal Dashboard Walkthrough",
    description: "Complete walkthrough of all 33+ admin portal pages and their functionalities",
    duration: "45:00",
    views: 3245,
    category: "Admin",
    instructor: "Tom Brown"
  },
];

export default function HelpCenter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("articles");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [articleDetailOpen, setArticleDetailOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: helpData, isLoading, error, refetch } = useQuery<HelpData>({
    queryKey: ["/api/enterprise/admin/help"],
    refetchInterval: 60000,
    staleTime: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminHelp.refreshed"),
      description: t("adminHelp.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  // Merge API data with production defaults
  const categories = useMemo(() => 
    helpData?.categories?.length ? helpData.categories : productionCategories,
    [helpData?.categories]
  );

  const featuredArticles = useMemo(() => 
    helpData?.featuredArticles?.length ? helpData.featuredArticles : productionFeaturedArticles,
    [helpData?.featuredArticles]
  );

  const recentArticles = useMemo(() => 
    helpData?.recentArticles?.length ? helpData.recentArticles : productionRecentArticles,
    [helpData?.recentArticles]
  );

  const faqs = useMemo(() => 
    helpData?.faqs?.length ? helpData.faqs : productionFAQs,
    [helpData?.faqs]
  );

  const videos = useMemo(() => 
    helpData?.videos?.length ? helpData.videos : productionVideos,
    [helpData?.videos]
  );

  const allArticles = useMemo(() => [...featuredArticles, ...recentArticles], [featuredArticles, recentArticles]);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let filtered = allArticles;
    
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower) ||
        article.category.toLowerCase().includes(searchLower) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [allArticles, debouncedSearch, selectedCategory]);

  // Filter FAQs based on search
  const filteredFAQs = useMemo(() => {
    if (!debouncedSearch) return faqs;
    const searchLower = debouncedSearch.toLowerCase();
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower)
    );
  }, [faqs, debouncedSearch]);

  // Filter videos based on search
  const filteredVideos = useMemo(() => {
    if (!debouncedSearch) return videos;
    const searchLower = debouncedSearch.toLowerCase();
    return videos.filter(video =>
      video.title.toLowerCase().includes(searchLower) ||
      video.description?.toLowerCase().includes(searchLower)
    );
  }, [videos, debouncedSearch]);

  const handleCategoryClick = useCallback((categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
      setActiveTab("articles");
    }
  }, [selectedCategory]);

  const handleArticleClick = useCallback((article: HelpArticle) => {
    setSelectedArticle(article);
    setArticleDetailOpen(true);
  }, []);

  const handleVideoClick = useCallback((video: VideoTutorial) => {
    setSelectedVideo(video);
    setVideoPlayerOpen(true);
  }, []);

  const handlePopularTagClick = useCallback((tag: string) => {
    setSearchQuery(tag);
  }, []);

  const handleCopyLink = useCallback((articleId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/admin/help/article/${articleId}`);
    toast({
      title: "Link Copied",
      description: "Article link copied to clipboard",
    });
  }, [toast]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminHelp.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminHelp.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-help">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminHelp.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="help-center-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-help-title">
              <BookOpen className="h-8 w-8" />
              {t("adminHelp.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-help-description">
              {t("adminHelp.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-help">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminHelp.refresh")}
            </Button>
            <Button variant="outline" data-testid="button-contact-support">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("adminHelp.contactSupport")}
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5" data-testid="card-search">
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">{t("adminHelp.searchTitle")}</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t("adminHelp.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                  data-testid="input-search-help"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setSearchQuery("")}
                    data-testid="button-clear-search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">{t("adminHelp.popular")}:</span>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover-elevate"
                  onClick={() => handlePopularTagClick("Validators")}
                  data-testid="tag-validators"
                >
                  {t("adminHelp.popularTopics.validators")}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover-elevate"
                  onClick={() => handlePopularTagClick("Security")}
                  data-testid="tag-security"
                >
                  {t("adminHelp.popularTopics.security")}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover-elevate"
                  onClick={() => handlePopularTagClick("AI")}
                  data-testid="tag-ai"
                >
                  {t("adminHelp.popularTopics.aiConfig")}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover-elevate"
                  onClick={() => handlePopularTagClick("Bridge")}
                  data-testid="tag-bridge"
                >
                  Bridge
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover-elevate"
                  onClick={() => handlePopularTagClick("Staking")}
                  data-testid="tag-staking"
                >
                  Staking
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category filter indicator */}
        {selectedCategory && (
          <div className="flex items-center gap-2" data-testid="filter-badge-container">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Badge variant="secondary" className="flex items-center gap-1" data-testid="filter-badge">
              {selectedCategory}
              <button
                type="button"
                className="h-4 w-4 p-0 ml-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory(null);
                }}
                data-testid="button-clear-filter"
                aria-label="Clear filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const IconComponent = getIconComponent(category.icon);
            const isSelected = selectedCategory === category.name;
            return (
              <Card 
                key={category.id || category.name} 
                className={`cursor-pointer hover-elevate transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleCategoryClick(category.name)}
                data-testid={`card-category-${index}`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`h-12 w-12 rounded-lg ${category.color || 'bg-primary/10'} flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className={`h-6 w-6 ${category.color?.includes('text-') ? '' : 'text-primary'}`} />
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.articleCount} {t("adminHelp.articles")}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-help">
            <TabsTrigger value="articles" data-testid="tab-articles">
              <FileText className="h-4 w-4 mr-2" />
              {t("adminHelp.tabs.articles")}
              {filteredArticles.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filteredArticles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="videos" data-testid="tab-videos">
              <Video className="h-4 w-4 mr-2" />
              {t("adminHelp.tabs.videos")}
              {filteredVideos.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filteredVideos.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="faq" data-testid="tab-faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              {t("adminHelp.tabs.faq")}
              {filteredFAQs.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filteredFAQs.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {debouncedSearch || selectedCategory ? (
              <Card data-testid="card-search-results">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    {selectedCategory ? `${selectedCategory}` : t("adminHelp.searchResults")}
                  </CardTitle>
                  <CardDescription>
                    {t("adminHelp.articlesFound", { count: filteredArticles.length })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No articles found. Try different keywords.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredArticles.map((article, index) => (
                        <div 
                          key={article.id} 
                          className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                          data-testid={`search-result-${index}`}
                        >
                          <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-1">{article.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                              <Badge variant="outline">{article.category}</Badge>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.readTime || "5 min"}
                              </span>
                              <span>{t("adminHelp.updated")} {article.lastUpdated}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Featured Articles */}
                <Card data-testid="card-featured-articles">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      {t("adminHelp.featuredArticles")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuredArticles.map((article, index) => (
                        <div 
                          key={article.id} 
                          className="p-4 border rounded-lg hover-elevate cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                          data-testid={`featured-article-${index}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium line-clamp-2">{article.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {article.views.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {article.readTime || "5 min"}
                                </span>
                                <span>{t("adminHelp.updated")} {article.lastUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Articles */}
                <Card data-testid="card-recent-articles">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t("adminHelp.recentlyUpdated")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentArticles.map((article, index) => (
                        <div 
                          key={article.id} 
                          className="flex items-center gap-4 p-3 hover-elevate rounded-lg cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                          data-testid={`recent-article-${index}`}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                            <p className="text-xs text-muted-foreground">{article.category}</p>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{article.lastUpdated}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card data-testid="card-video-tutorials">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  {t("adminHelp.videoTutorials")}
                </CardTitle>
                <CardDescription>{t("adminHelp.videoTutorialsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No videos found. Try different keywords.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVideos.map((video, i) => (
                      <div 
                        key={video.id || i} 
                        className="border rounded-lg overflow-hidden hover-elevate cursor-pointer group"
                        onClick={() => handleVideoClick(video)}
                        data-testid={`video-${i}`}
                      >
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                            <Play className="h-8 w-8 text-primary ml-1" />
                          </div>
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            {video.duration}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium line-clamp-2">{video.title}</h4>
                          {video.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.views.toLocaleString()} views
                            </span>
                            {video.instructor && (
                              <span className="text-xs">{video.instructor}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card data-testid="card-faq">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {t("adminHelp.faqTitle")}
                </CardTitle>
                <CardDescription>
                  Quick answers to the most common questions about TBURN Mainnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No FAQs found. Try different keywords.</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq, i) => (
                      <AccordionItem key={faq.id || i} value={`item-${i}`} data-testid={`faq-item-${i}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pl-8">
                          <p className="mb-3">{faq.answer}</p>
                          <div className="flex items-center gap-4 pt-2 border-t">
                            {faq.category && (
                              <Badge variant="outline" className="text-xs">
                                {faq.category}
                              </Badge>
                            )}
                            <span className="text-xs flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {faq.helpful || 0} found helpful
                            </span>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Need More Help Section */}
        <Card data-testid="card-need-help">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t("adminHelp.stillNeedHelp")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminHelp.supportAvailable")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" data-testid="button-dev-docs">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("adminHelp.devDocs")}
                </Button>
                <Button data-testid="button-open-ticket">
                  {t("adminHelp.openTicket")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Detail Sheet */}
      <Sheet open={articleDetailOpen} onOpenChange={setArticleDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedArticle && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                  {selectedArticle.featured && (
                    <Badge className="bg-yellow-500/10 text-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-xl">{selectedArticle.title}</SheetTitle>
                <SheetDescription className="text-base">
                  {selectedArticle.description}
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Article Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap pb-4 border-b">
                  {selectedArticle.author && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedArticle.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedArticle.readTime || "5 min read"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedArticle.views.toLocaleString()} views
                  </span>
                  <span>Updated {selectedArticle.lastUpdated}</span>
                </div>

                {/* Article Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedArticle.content ? (
                    selectedArticle.content.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-lg font-semibold mt-6 mb-3">{line.replace('## ', '')}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                      } else if (line.startsWith('- ')) {
                        return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                      } else if (line.match(/^\d+\./)) {
                        return <li key={i} className="ml-4">{line}</li>;
                      } else if (line.trim()) {
                        return <p key={i} className="my-2">{line}</p>;
                      }
                      return null;
                    })
                  ) : (
                    <p>Full article content will be available soon.</p>
                  )}
                </div>

                {/* Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    {selectedArticle.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleCopyLink(selectedArticle.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Video Player Dialog */}
      <Dialog open={videoPlayerOpen} onOpenChange={setVideoPlayerOpen}>
        <DialogContent className="sm:max-w-3xl">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVideo.title}</DialogTitle>
                <DialogDescription>
                  {selectedVideo.description || "Video tutorial"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 hover-elevate cursor-pointer">
                      <Play className="h-10 w-10 text-primary ml-1" />
                    </div>
                    <p className="text-muted-foreground">Click to play video</p>
                    <p className="text-sm text-muted-foreground mt-1">Duration: {selectedVideo.duration}</p>
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedVideo.views.toLocaleString()} views
                    </span>
                    {selectedVideo.category && (
                      <Badge variant="outline">{selectedVideo.category}</Badge>
                    )}
                  </div>
                  {selectedVideo.instructor && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedVideo.instructor}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
