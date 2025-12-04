import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Users,
  Settings,
  Shield,
  Zap,
  Database,
  Network,
  Bot,
  Wallet,
} from "lucide-react";

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

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("articles");

  const categories: HelpCategory[] = [
    { name: "Getting Started", icon: BookOpen, articleCount: 12, description: "Learn the basics of the admin portal" },
    { name: "Network Management", icon: Network, articleCount: 18, description: "Manage nodes, validators, and consensus" },
    { name: "Security", icon: Shield, articleCount: 15, description: "Security best practices and configurations" },
    { name: "AI Systems", icon: Bot, articleCount: 10, description: "Configure and monitor AI orchestration" },
    { name: "Token & Economy", icon: Wallet, articleCount: 14, description: "Token issuance, burns, and economics" },
    { name: "Settings", icon: Settings, articleCount: 8, description: "System configuration and preferences" },
  ];

  const featuredArticles: HelpArticle[] = [
    { id: "1", title: "How to Add a New Validator", description: "Step-by-step guide to onboard new validators to the network", category: "Network Management", views: 2847, lastUpdated: "2024-12-01", featured: true },
    { id: "2", title: "Understanding AI Decision Making", description: "Deep dive into how Triple-Band AI makes network decisions", category: "AI Systems", views: 1956, lastUpdated: "2024-11-28", featured: true },
    { id: "3", title: "Security Best Practices", description: "Essential security configurations for production environments", category: "Security", views: 3421, lastUpdated: "2024-11-25", featured: true },
    { id: "4", title: "Token Burn Mechanisms Explained", description: "How automatic and manual burns work in TBURN", category: "Token & Economy", views: 1432, lastUpdated: "2024-11-20", featured: true },
  ];

  const recentArticles: HelpArticle[] = [
    { id: "5", title: "Configuring Alert Rules", description: "Set up custom alerting for your monitoring needs", category: "Getting Started", views: 892, lastUpdated: "2024-12-03", featured: false },
    { id: "6", title: "Bridge Operations Guide", description: "Managing cross-chain transfers and validators", category: "Network Management", views: 654, lastUpdated: "2024-12-02", featured: false },
    { id: "7", title: "API Rate Limiting", description: "Configure and manage API rate limits", category: "Settings", views: 432, lastUpdated: "2024-12-01", featured: false },
    { id: "8", title: "Backup and Recovery", description: "Disaster recovery procedures and best practices", category: "Security", views: 876, lastUpdated: "2024-11-30", featured: false },
  ];

  const faqs = [
    { question: "How do I reset my admin password?", answer: "Go to Settings > Security > Change Password. You'll need to verify your identity via 2FA before making changes." },
    { question: "What permissions do I need to manage validators?", answer: "You need the 'Validator Management' permission which is typically assigned to Super Admin and Network Admin roles." },
    { question: "How can I export audit logs?", answer: "Navigate to Security & Audit > Audit Logs, select your date range, and click the Export button. Logs can be exported in CSV or JSON format." },
    { question: "What's the difference between AI layers?", answer: "Strategic (GPT-5) handles long-term decisions, Tactical (Claude) manages real-time operations, and Operational (Llama) handles immediate actions." },
    { question: "How do I add a new bridge chain?", answer: "Go to Bridge & Cross-Chain > Chain Connections, click 'Add Chain', and follow the setup wizard. Governance approval may be required." },
    { question: "What happens during emergency shutdown?", answer: "Emergency shutdown halts all transactions, disconnects validators, and creates a snapshot. Use this only in critical situations." },
  ];

  const videos = [
    { title: "Admin Portal Overview", duration: "12:45", views: 4521 },
    { title: "Setting Up Validators", duration: "18:32", views: 3287 },
    { title: "AI Configuration Guide", duration: "15:20", views: 2654 },
    { title: "Security Best Practices", duration: "22:15", views: 2198 },
    { title: "Bridge Operations", duration: "14:08", views: 1876 },
  ];

  const filteredArticles = [...featuredArticles, ...recentArticles].filter(
    article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Help Center
            </h1>
            <p className="text-muted-foreground">Documentation, guides, and support resources</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-contact-support">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">How can we help you?</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                  data-testid="input-search-help"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Popular: <span className="text-primary cursor-pointer">Validators</span> • 
                <span className="text-primary cursor-pointer ml-1">Security</span> • 
                <span className="text-primary cursor-pointer ml-1">AI Configuration</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card key={category.name} className="cursor-pointer hover-elevate">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.articleCount} articles</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {searchQuery && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>{filteredArticles.length} articles found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <div key={article.id} className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{article.category}</Badge>
                            <span>{article.views} views</span>
                            <span>Updated {article.lastUpdated}</span>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Featured Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuredArticles.map((article) => (
                        <div key={article.id} className="p-4 border rounded-lg hover-elevate cursor-pointer">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <h4 className="font-medium">{article.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{article.views} views</span>
                                <span>Updated {article.lastUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recently Updated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentArticles.map((article) => (
                        <div key={article.id} className="flex items-center gap-4 p-3 hover-elevate rounded-lg cursor-pointer">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>Step-by-step video guides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden hover-elevate cursor-pointer">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium">{video.title}</h4>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>{video.duration}</span>
                          <span>{video.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Still need help?</h3>
                  <p className="text-sm text-muted-foreground">Our support team is available 24/7</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Developer Docs
                </Button>
                <Button data-testid="button-open-ticket">
                  Open Support Ticket
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
