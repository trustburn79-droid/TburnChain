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
    queryKey: ["/api/admin/help"],
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminHelp.refreshed"),
      description: t("adminHelp.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const categories: HelpCategory[] = helpData?.categories || [
    { name: t("adminHelp.categories.gettingStarted.name"), icon: BookOpen, articleCount: 12, description: t("adminHelp.categories.gettingStarted.desc") },
    { name: t("adminHelp.categories.network.name"), icon: Network, articleCount: 18, description: t("adminHelp.categories.network.desc") },
    { name: t("adminHelp.categories.security.name"), icon: Shield, articleCount: 15, description: t("adminHelp.categories.security.desc") },
    { name: t("adminHelp.categories.ai.name"), icon: Bot, articleCount: 10, description: t("adminHelp.categories.ai.desc") },
    { name: t("adminHelp.categories.token.name"), icon: Wallet, articleCount: 14, description: t("adminHelp.categories.token.desc") },
    { name: t("adminHelp.categories.settings.name"), icon: Settings, articleCount: 8, description: t("adminHelp.categories.settings.desc") },
  ];

  const featuredArticles: HelpArticle[] = helpData?.featuredArticles || [
    { id: "1", title: t("adminHelp.articles.addValidator.title"), description: t("adminHelp.articles.addValidator.desc"), category: t("adminHelp.categories.network.name"), views: 2847, lastUpdated: "2024-12-01", featured: true },
    { id: "2", title: t("adminHelp.articles.aiDecision.title"), description: t("adminHelp.articles.aiDecision.desc"), category: t("adminHelp.categories.ai.name"), views: 1956, lastUpdated: "2024-11-28", featured: true },
    { id: "3", title: t("adminHelp.articles.securityBest.title"), description: t("adminHelp.articles.securityBest.desc"), category: t("adminHelp.categories.security.name"), views: 3421, lastUpdated: "2024-11-25", featured: true },
    { id: "4", title: t("adminHelp.articles.tokenBurn.title"), description: t("adminHelp.articles.tokenBurn.desc"), category: t("adminHelp.categories.token.name"), views: 1432, lastUpdated: "2024-11-20", featured: true },
  ];

  const recentArticles: HelpArticle[] = helpData?.recentArticles || [
    { id: "5", title: t("adminHelp.articles.alertRules.title"), description: t("adminHelp.articles.alertRules.desc"), category: t("adminHelp.categories.gettingStarted.name"), views: 892, lastUpdated: "2024-12-03", featured: false },
    { id: "6", title: t("adminHelp.articles.bridgeOps.title"), description: t("adminHelp.articles.bridgeOps.desc"), category: t("adminHelp.categories.network.name"), views: 654, lastUpdated: "2024-12-02", featured: false },
    { id: "7", title: t("adminHelp.articles.rateLimit.title"), description: t("adminHelp.articles.rateLimit.desc"), category: t("adminHelp.categories.settings.name"), views: 432, lastUpdated: "2024-12-01", featured: false },
    { id: "8", title: t("adminHelp.articles.backup.title"), description: t("adminHelp.articles.backup.desc"), category: t("adminHelp.categories.security.name"), views: 876, lastUpdated: "2024-11-30", featured: false },
  ];

  const faqs: FAQ[] = helpData?.faqs || [
    { question: t("adminHelp.faqs.resetPassword.q"), answer: t("adminHelp.faqs.resetPassword.a") },
    { question: t("adminHelp.faqs.validatorPermission.q"), answer: t("adminHelp.faqs.validatorPermission.a") },
    { question: t("adminHelp.faqs.exportLogs.q"), answer: t("adminHelp.faqs.exportLogs.a") },
    { question: t("adminHelp.faqs.aiLayers.q"), answer: t("adminHelp.faqs.aiLayers.a") },
    { question: t("adminHelp.faqs.addBridge.q"), answer: t("adminHelp.faqs.addBridge.a") },
    { question: t("adminHelp.faqs.emergency.q"), answer: t("adminHelp.faqs.emergency.a") },
  ];

  const videos: VideoTutorial[] = helpData?.videos || [
    { title: t("adminHelp.videos.overview"), duration: "12:45", views: 4521 },
    { title: t("adminHelp.videos.validators"), duration: "18:32", views: 3287 },
    { title: t("adminHelp.videos.aiConfig"), duration: "15:20", views: 2654 },
    { title: t("adminHelp.videos.security"), duration: "22:15", views: 2198 },
    { title: t("adminHelp.videos.bridge"), duration: "14:08", views: 1876 },
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
