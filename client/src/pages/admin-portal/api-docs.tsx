import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Book,
  Code,
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  Play,
  ChevronRight,
  Globe,
  Lock,
  Unlock,
  Zap,
  Database,
  Shield,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  auth: boolean;
  category: string;
}

interface ApiDocsData {
  endpoints: ApiEndpoint[];
  stats: {
    totalEndpoints: number;
    publicApis: number;
    protectedApis: number;
    apiVersion: string;
  };
}

export default function ApiDocs() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEndpointDetail, setShowEndpointDetail] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: apiDocsData, isLoading, error, refetch } = useQuery<ApiDocsData>({
    queryKey: ["/api/enterprise/admin/developer/docs"],
  });

  const defaultEndpoints: ApiEndpoint[] = [
    { method: "GET", path: "/api/blocks", description: t("adminApiDocs.endpoints.getBlocks"), auth: false, category: "Blocks" },
    { method: "GET", path: "/api/blocks/:height", description: t("adminApiDocs.endpoints.getBlockByHeight"), auth: false, category: "Blocks" },
    { method: "GET", path: "/api/transactions", description: t("adminApiDocs.endpoints.getTransactions"), auth: false, category: "Transactions" },
    { method: "GET", path: "/api/transactions/:hash", description: t("adminApiDocs.endpoints.getTransactionByHash"), auth: false, category: "Transactions" },
    { method: "POST", path: "/api/transactions", description: t("adminApiDocs.endpoints.submitTransaction"), auth: true, category: "Transactions" },
    { method: "GET", path: "/api/wallets/:address", description: t("adminApiDocs.endpoints.getWalletInfo"), auth: false, category: "Wallets" },
    { method: "GET", path: "/api/wallets/:address/balance", description: t("adminApiDocs.endpoints.getWalletBalance"), auth: false, category: "Wallets" },
    { method: "GET", path: "/api/validators", description: t("adminApiDocs.endpoints.getValidators"), auth: false, category: "Validators" },
    { method: "POST", path: "/api/staking/delegate", description: t("adminApiDocs.endpoints.delegateToValidator"), auth: true, category: "Staking" },
    { method: "POST", path: "/api/staking/undelegate", description: t("adminApiDocs.endpoints.undelegateFromValidator"), auth: true, category: "Staking" },
    { method: "GET", path: "/api/admin/dashboard", description: t("adminApiDocs.endpoints.getAdminDashboard"), auth: true, category: "Admin" },
    { method: "GET", path: "/api/admin/nodes", description: t("adminApiDocs.endpoints.getNodeList"), auth: true, category: "Admin" },
    { method: "POST", path: "/api/admin/nodes/:id/restart", description: t("adminApiDocs.endpoints.restartNode"), auth: true, category: "Admin" },
  ];

  const endpoints = apiDocsData?.endpoints || defaultEndpoints;
  const stats = apiDocsData?.stats || {
    totalEndpoints: 847,
    publicApis: 412,
    protectedApis: 435,
    apiVersion: "v8.0",
  };

  const categories = ["all", ...Array.from(new Set(endpoints.map(e => e.category)))];

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch = 
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500";
      case "POST": return "bg-blue-500";
      case "PUT": return "bg-yellow-500";
      case "DELETE": return "bg-red-500";
      case "PATCH": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminApiDocs.refreshSuccess"),
        description: t("adminApiDocs.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminApiDocs.refreshError"),
        description: t("adminApiDocs.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("adminApiDocs.copied"),
      description: t("adminApiDocs.copiedToClipboard"),
    });
  }, [toast, t]);

  const getEndpointDetailSections = (endpoint: ApiEndpoint): DetailSection[] => [
    {
      title: t("adminApiDocs.detail.endpointInfo"),
      fields: [
        {
          label: t("adminApiDocs.method"),
          value: endpoint.method,
          type: "badge" as const,
          badgeColor: getMethodColor(endpoint.method),
        },
        {
          label: t("adminApiDocs.path"),
          value: endpoint.path,
          type: "code" as const,
          copyable: true,
        },
        {
          label: t("adminApiDocs.description"),
          value: endpoint.description,
          type: "text" as const,
        },
        {
          label: t("adminApiDocs.category"),
          value: endpoint.category,
          type: "text" as const,
        },
      ],
    },
    {
      title: t("adminApiDocs.detail.authentication"),
      fields: [
        {
          label: t("adminApiDocs.authentication"),
          value: endpoint.auth ? t("common.required") : t("adminApiDocs.publicApis"),
          type: "badge" as const,
          badgeVariant: endpoint.auth ? "destructive" : "secondary",
        },
      ],
    },
  ];

  const performExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      endpoints,
      stats,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-api-docs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminApiDocs.exportSuccess"),
      description: t("adminApiDocs.exportSuccessDesc"),
    });
    setShowExportConfirm(false);
  }, [endpoints, stats, toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="api-docs-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminApiDocs.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminApiDocs.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminApiDocs.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="api-docs-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <Book className="h-8 w-8" />
              {t("adminApiDocs.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminApiDocs.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t("adminApiDocs.refresh")}
            </Button>
            <Button variant="outline" data-testid="button-try-api">
              <Play className="h-4 w-4 mr-2" />
              {t("adminApiDocs.tryApi")}
            </Button>
            <Button variant="outline" onClick={() => setShowExportConfirm(true)} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminApiDocs.exportOpenApi")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-endpoints">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminApiDocs.totalEndpoints")}</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalEndpoints}+</div>
                  <p className="text-xs text-muted-foreground">{t("adminApiDocs.restApiEndpoints")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-public-apis">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminApiDocs.publicApis")}</CardTitle>
              <Unlock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-500">{stats.publicApis}</div>
                  <p className="text-xs text-muted-foreground">{t("adminApiDocs.noAuthRequired")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-protected-apis">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminApiDocs.protectedApis")}</CardTitle>
              <Lock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-yellow-500">{stats.protectedApis}</div>
                  <p className="text-xs text-muted-foreground">{t("adminApiDocs.apiKeyRequired")}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-api-version">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{t("adminApiDocs.apiVersion")}</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.apiVersion}</div>
                  <p className="text-xs text-muted-foreground">{t("adminApiDocs.latestStable")}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-api-docs">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminApiDocs.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="endpoints" data-testid="tab-endpoints">{t("adminApiDocs.tabs.endpoints")}</TabsTrigger>
            <TabsTrigger value="authentication" data-testid="tab-authentication">{t("adminApiDocs.tabs.authentication")}</TabsTrigger>
            <TabsTrigger value="websocket" data-testid="tab-websocket">{t("adminApiDocs.tabs.websocket")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiDocs.gettingStarted")}</CardTitle>
                <CardDescription>{t("adminApiDocs.quickStartGuide")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t("adminApiDocs.baseUrl")}</h3>
                  <div className="flex items-center gap-2">
                    <code className="px-4 py-2 bg-muted rounded-lg font-mono text-sm flex-1">
                      https://api.tburn.io/v1
                    </code>
                    <Button variant="outline" size="icon" onClick={() => handleCopy("https://api.tburn.io/v1")} data-testid="button-copy-base-url">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">{t("adminApiDocs.exampleRequest")}</h3>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`curl -X GET "https://api.tburn.io/v1/blocks/latest" \\
  -H "Content-Type: application/json"`}</pre>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">{t("adminApiDocs.exampleResponse")}</h3>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`{
  "height": 1,
  "hash": "0xTBURN_Genesis_Block_v8_Mainnet_Dec8_2024",
  "timestamp": 1733644800,
  "transactions": 0,
  "validator": "0xTBURN_Genesis_Validator_Pool",
  "network": "mainnet-v8.0",
  "tps_capacity": 100000,
  "block_time_ms": 1000,
  "shards": 8
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card data-testid="card-blockchain-apis">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {t("adminApiDocs.blockchainApis")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.blocksTransactions")}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.walletsBalances")}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.smartContracts")}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="card-staking-apis">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t("adminApiDocs.stakingApis")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.validators")}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.delegation")}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.rewards")}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="card-defi-apis">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {t("adminApiDocs.defiApis")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.dexSwaps")}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.lending")}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {t("adminApiDocs.yieldFarming")}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("adminApiDocs.searchEndpoints")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-endpoints"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        data-testid={`button-category-${category}`}
                      >
                        {category === "all" ? t("adminApiDocs.all") : category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiDocs.apiEndpoints")}</CardTitle>
                <CardDescription>{filteredEndpoints.length} {t("adminApiDocs.endpointsFound")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {filteredEndpoints.map((endpoint, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          data-testid={`endpoint-row-${index}`}
                        >
                          <Badge className={`${getMethodColor(endpoint.method)} w-16 justify-center`}>
                            {endpoint.method}
                          </Badge>
                          <code className="font-mono text-sm flex-1">{endpoint.path}</code>
                          <span className="text-sm text-muted-foreground hidden md:block">{endpoint.description}</span>
                          {endpoint.auth ? (
                            <Lock className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Unlock className="h-4 w-4 text-green-500" />
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedEndpoint(endpoint);
                              setShowEndpointDetail(true);
                            }}
                            data-testid={`button-endpoint-view-${index}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`button-endpoint-details-${index}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiDocs.authentication")}</CardTitle>
                <CardDescription>{t("adminApiDocs.howToAuthenticate")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t("adminApiDocs.apiKeyAuthentication")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("adminApiDocs.includeApiKey")}
                  </p>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`curl -X GET "https://api.tburn.io/v1/admin/dashboard" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">{t("adminApiDocs.requestSigning")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("adminApiDocs.requestSigningDesc")}
                  </p>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`const signature = crypto
  .createHmac('sha256', API_SECRET)
  .update(timestamp + method + path + body)
  .digest('hex');

headers['X-Signature'] = signature;
headers['X-Timestamp'] = timestamp;`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="websocket" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiDocs.websocketApi")}</CardTitle>
                <CardDescription>{t("adminApiDocs.realtimeDataStreaming")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t("adminApiDocs.connection")}</h3>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`const ws = new WebSocket('wss://ws.tburn.io');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['blocks', 'transactions']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};`}</pre>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">{t("adminApiDocs.availableChannels")}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="outline">blocks</Badge>
                    <Badge variant="outline">transactions</Badge>
                    <Badge variant="outline">validators</Badge>
                    <Badge variant="outline">consensus</Badge>
                    <Badge variant="outline">tps</Badge>
                    <Badge variant="outline">alerts</Badge>
                    <Badge variant="outline">bridge</Badge>
                    <Badge variant="outline">staking</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedEndpoint && (
        <DetailSheet
          open={showEndpointDetail}
          onOpenChange={setShowEndpointDetail}
          title={selectedEndpoint.path}
          subtitle={selectedEndpoint.method}
          icon={<Code className="h-5 w-5" />}
          sections={getEndpointDetailSections(selectedEndpoint)}
        />
      )}

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminApiDocs.confirm.exportTitle")}
        description={t("adminApiDocs.confirm.exportDesc")}
        confirmText={t("adminApiDocs.export")}
        cancelText={t("adminApiDocs.cancel")}
        onConfirm={performExport}
        destructive={false}
      />
    </div>
  );
}
