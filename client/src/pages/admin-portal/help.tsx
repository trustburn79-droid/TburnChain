import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";

const categoryIconMap: Record<string, any> = {
  'Getting Started': BookOpen,
  'Network Operations': Network,
  'Security': Shield,
  'AI Systems': Bot,
  'Token Management': Wallet,
  'Settings': Settings,
};

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  views: number;
  lastUpdated: string;
  featured: boolean;
}

interface HelpCategory {
  name: string;
  icon: any;
  articleCount: number;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface VideoTutorial {
  title: string;
  duration: string;
  views: number;
}

interface HelpData {
  categories: HelpCategory[];
  featuredArticles: HelpArticle[];
  recentArticles: HelpArticle[];
  faqs: FAQ[];
  videos: VideoTutorial[];
}

export default function HelpCenter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("articles");

  const { data: helpData, isLoading, error, refetch } = useQuery<HelpData>({
    queryKey: ["/api/enterprise/admin/help"],
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminHelp.refreshed"),
      description: t("adminHelp.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const categories: HelpCategory[] = helpData?.categories || [
    { name: "Mainnet v8.0 Launch Guide", icon: BookOpen, articleCount: 24, description: "Complete guide for December 8th TBURN Mainnet deployment and operations" },
    { name: "100K TPS Network Ops", icon: Network, articleCount: 32, description: "High-performance network operations with 8 dynamic shards and 156 validators" },
    { name: "Quantum-Resistant Security", icon: Shield, articleCount: 28, description: "Advanced security protocols including quantum-resistant signatures and 2FA" },
    { name: "Triple-Band AI System", icon: Bot, articleCount: 18, description: "Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, Grok 3 orchestration guide" },
    { name: "10B TBURN Tokenomics", icon: Wallet, articleCount: 22, description: "20-year deflationary model, AI-driven burns, 30.60% target deflation" },
    { name: "Admin Portal Config", icon: Settings, articleCount: 16, description: "33 admin portal pages configuration and customization" },
  ];

  const featuredArticles: HelpArticle[] = helpData?.featuredArticles || [
    { id: "1", title: "TBURN Mainnet v8.0 Launch Checklist", description: "Complete pre-launch verification for December 8th, 2024 mainnet deployment with 100K TPS capacity", category: "Mainnet v8.0 Launch Guide", views: 4521, lastUpdated: "2024-12-07", featured: true },
    { id: "2", title: "156 Validator Node Setup & 3-Tier Structure", description: "Configure validator nodes across Tier 1 (20M), Tier 2 (5M), Tier 3 (10K) minimum stake requirements", category: "100K TPS Network Ops", views: 3847, lastUpdated: "2024-12-06", featured: true },
    { id: "3", title: "Triple-Band AI Orchestration Configuration", description: "Set up Gemini 3 Pro (primary), Claude Sonnet 4.5 (secondary), GPT-4o + Grok 3 fallback system", category: "Triple-Band AI System", views: 3256, lastUpdated: "2024-12-05", featured: true },
    { id: "4", title: "Quantum-Resistant Security Implementation", description: "Deploy quantum-resistant signatures, 2FA enforcement, and achieve 99.7% security score", category: "Quantum-Resistant Security", views: 2987, lastUpdated: "2024-12-04", featured: true },
  ];

  const recentArticles: HelpArticle[] = helpData?.recentArticles || [
    { id: "5", title: "Multi-Chain Bridge v2.0 Operations", description: "ETH/BSC/Polygon/Arbitrum bridge setup with AI risk assessment and 0.1% fee structure", category: "100K TPS Network Ops", views: 1892, lastUpdated: "2024-12-07", featured: false },
    { id: "6", title: "8-Shard Dynamic Scaling Guide", description: "Configure AI-driven sharding from 8 to 64 shards with automatic load balancing", category: "100K TPS Network Ops", views: 1654, lastUpdated: "2024-12-06", featured: false },
    { id: "7", title: "10B TBURN Token Distribution", description: "Genesis supply allocation: 15% treasury, 25% ecosystem, validator staking pools", category: "10B TBURN Tokenomics", views: 1432, lastUpdated: "2024-12-05", featured: false },
    { id: "8", title: "Real-time Monitoring & SLA Setup", description: "Configure 99.97% uptime monitoring with WebSocket updates and alert rules", category: "Admin Portal Config", views: 1276, lastUpdated: "2024-12-04", featured: false },
  ];

  const faqs: FAQ[] = helpData?.faqs || [
    { question: "What is the total supply of TBURN and initial price?", answer: "TBURN Mainnet v8.0 launches with 10B (10 billion) total supply at $0.50 initial price, targeting 6.94B at Y20 through 30.60% deflationary mechanism." },
    { question: "How does the Triple-Band AI Orchestration work?", answer: "The system uses Gemini 3 Pro as primary AI, Claude Sonnet 4.5 as secondary, with GPT-4o and Grok 3 as fallback. Automatic failover ensures 99.99% AI availability for consensus optimization." },
    { question: "What are the validator tier requirements?", answer: "Tier 1: 20M TBURN minimum stake (enterprise), Tier 2: 5M TBURN (professional), Tier 3: 10K TBURN (community). All 156 validators earn 8-15% APY based on tier and performance." },
    { question: "How does the quantum-resistant security work?", answer: "TBURN implements post-quantum cryptographic signatures using CRYSTALS-Dilithium, combined with mandatory 2FA and real-time threat detection achieving 99.7% security score." },
    { question: "What chains does the Multi-Chain Bridge support?", answer: "Bridge v2.0 supports Ethereum, BSC, Polygon, and Arbitrum with 0.1% fees, AI-driven risk assessment, and sub-minute confirmation times." },
    { question: "How does the AI-driven burn mechanism work?", answer: "70% of transaction fees are automatically burned through AI analysis, targeting 30.60% total supply reduction by Year 20 (from 10B to 6.94B TBURN)." },
  ];

  const videos: VideoTutorial[] = helpData?.videos || [
    { title: "TBURN Mainnet v8.0 Complete Overview", duration: "24:30", views: 8521 },
    { title: "156 Validator Network Setup Guide", duration: "32:15", views: 6287 },
    { title: "Triple-Band AI Configuration Tutorial", duration: "28:45", views: 5654 },
    { title: "Quantum-Resistant Security Deep Dive", duration: "35:20", views: 4198 },
    { title: "Multi-Chain Bridge v2.0 Operations", duration: "22:18", views: 3876 },
  ];

  const filteredArticles = [...featuredArticles, ...recentArticles].filter(
    article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              </div>
              <p className="text-sm text-muted-foreground">
                {t("adminHelp.popular")}: <span className="text-primary cursor-pointer">{t("adminHelp.popularTopics.validators")}</span> • 
                <span className="text-primary cursor-pointer ml-1">{t("adminHelp.popularTopics.security")}</span> • 
                <span className="text-primary cursor-pointer ml-1">{t("adminHelp.popularTopics.aiConfig")}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const IconComponent = category.icon || categoryIconMap[category.name] || HelpCircle;
            return (
            <Card key={category.name} className="cursor-pointer hover-elevate" data-testid={`card-category-${index}`}>
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.articleCount} {t("adminHelp.articles")}</p>
              </CardContent>
            </Card>
          );})}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-help">
            <TabsTrigger value="articles" data-testid="tab-articles">{t("adminHelp.tabs.articles")}</TabsTrigger>
            <TabsTrigger value="videos" data-testid="tab-videos">{t("adminHelp.tabs.videos")}</TabsTrigger>
            <TabsTrigger value="faq" data-testid="tab-faq">{t("adminHelp.tabs.faq")}</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {searchQuery && (
              <Card data-testid="card-search-results">
                <CardHeader>
                  <CardTitle>{t("adminHelp.searchResults")}</CardTitle>
                  <CardDescription>{t("adminHelp.articlesFound", { count: filteredArticles.length })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredArticles.map((article, index) => (
                      <div key={article.id} className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer" data-testid={`search-result-${index}`}>
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{article.category}</Badge>
                            <span>{article.views} {t("adminHelp.views")}</span>
                            <span>{t("adminHelp.updated")} {article.lastUpdated}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!searchQuery && (
              <>
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
                        <div key={article.id} className="p-4 border rounded-lg hover-elevate cursor-pointer" data-testid={`featured-article-${index}`}>
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <h4 className="font-medium">{article.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{article.views} {t("adminHelp.views")}</span>
                                <span>{t("adminHelp.updated")} {article.lastUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

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
                        <div key={article.id} className="flex items-center gap-4 p-3 hover-elevate rounded-lg cursor-pointer" data-testid={`recent-article-${index}`}>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{article.title}</p>
                            <p className="text-xs text-muted-foreground">{article.category}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{article.lastUpdated}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden hover-elevate cursor-pointer" data-testid={`video-${i}`}>
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium">{video.title}</h4>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>{video.duration}</span>
                          <span>{video.views} {t("adminHelp.views")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card data-testid="card-faq">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {t("adminHelp.faqTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-item-${i}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card data-testid="card-need-help">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
    </div>
  );
}
