import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  auth: boolean;
  category: string;
}

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const endpoints: ApiEndpoint[] = [
    { method: "GET", path: "/api/blocks", description: "Get list of blocks", auth: false, category: "Blocks" },
    { method: "GET", path: "/api/blocks/:height", description: "Get block by height", auth: false, category: "Blocks" },
    { method: "GET", path: "/api/transactions", description: "Get list of transactions", auth: false, category: "Transactions" },
    { method: "GET", path: "/api/transactions/:hash", description: "Get transaction by hash", auth: false, category: "Transactions" },
    { method: "POST", path: "/api/transactions", description: "Submit new transaction", auth: true, category: "Transactions" },
    { method: "GET", path: "/api/wallets/:address", description: "Get wallet information", auth: false, category: "Wallets" },
    { method: "GET", path: "/api/wallets/:address/balance", description: "Get wallet balance", auth: false, category: "Wallets" },
    { method: "GET", path: "/api/validators", description: "Get list of validators", auth: false, category: "Validators" },
    { method: "POST", path: "/api/staking/delegate", description: "Delegate to validator", auth: true, category: "Staking" },
    { method: "POST", path: "/api/staking/undelegate", description: "Undelegate from validator", auth: true, category: "Staking" },
    { method: "GET", path: "/api/admin/dashboard", description: "Get admin dashboard data", auth: true, category: "Admin" },
    { method: "GET", path: "/api/admin/nodes", description: "Get node list", auth: true, category: "Admin" },
    { method: "POST", path: "/api/admin/nodes/:id/restart", description: "Restart node", auth: true, category: "Admin" },
  ];

  const categories = ["all", ...new Set(endpoints.map(e => e.category))];

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch = 
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500";
      case "POST":
        return "bg-blue-500";
      case "PUT":
        return "bg-yellow-500";
      case "DELETE":
        return "bg-red-500";
      case "PATCH":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Book className="h-8 w-8" />
              API Documentation
            </h1>
            <p className="text-muted-foreground">API 문서 | Complete API reference and documentation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-try-api">
              <Play className="h-4 w-4 mr-2" />
              Try API
            </Button>
            <Button variant="outline" data-testid="button-export">
              <ExternalLink className="h-4 w-4 mr-2" />
              Export OpenAPI
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">340+</div>
              <p className="text-xs text-muted-foreground">REST API endpoints</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public APIs</CardTitle>
              <Unlock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">180</div>
              <p className="text-xs text-muted-foreground">No auth required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protected APIs</CardTitle>
              <Lock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">160</div>
              <p className="text-xs text-muted-foreground">API key required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Version</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">v4.0</div>
              <p className="text-xs text-muted-foreground">Latest stable</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="websocket">WebSocket</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Quick start guide for TBURN API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Base URL</h3>
                  <div className="flex items-center gap-2">
                    <code className="px-4 py-2 bg-muted rounded-lg font-mono text-sm flex-1">
                      https://api.tburn.io/v1
                    </code>
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Example Request</h3>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`curl -X GET "https://api.tburn.io/v1/blocks/latest" \\
  -H "Content-Type: application/json"`}</pre>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Example Response</h3>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`{
  "height": 12847562,
  "hash": "0x1234...5678",
  "timestamp": 1701689123,
  "transactions": 847,
  "validator": "0xabcd...efgh"
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Blockchain APIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Blocks & Transactions
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Wallets & Balances
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Smart Contracts
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Staking APIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Validators
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Delegation
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Rewards
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    DeFi APIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      DEX & Swaps
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Lending
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Yield Farming
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
                      placeholder="Search endpoints..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === "all" ? "All" : category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>{filteredEndpoints.length} endpoints found</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredEndpoints.map((endpoint, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
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
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>How to authenticate with the TBURN API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">API Key Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Include your API key in the request header for authenticated endpoints.
                  </p>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <pre>{`curl -X GET "https://api.tburn.io/v1/admin/dashboard" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Request Signing (for sensitive operations)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Some operations require HMAC signature for additional security.
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
                <CardTitle>WebSocket API</CardTitle>
                <CardDescription>Real-time data streaming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Connection</h3>
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
                  <h3 className="font-medium mb-2">Available Channels</h3>
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
    </div>
  );
}
