import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bug,
  Search,
  RefreshCw,
  Play,
  Terminal,
  Code,
  FileText,
  Database,
  Zap,
  Copy,
  Download,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";

interface DebugLog {
  id: string;
  level: "info" | "warn" | "error" | "debug";
  timestamp: string;
  source: string;
  message: string;
}

interface TraceResult {
  gasUsed: number;
  returnValue: string;
  structLogs: Array<{
    pc: number;
    op: string;
    gas: number;
    gasCost: number;
    depth: number;
  }>;
}

export default function DebugTools() {
  const [activeTab, setActiveTab] = useState("transaction");
  const [txHash, setTxHash] = useState("");
  const [debugOutput, setDebugOutput] = useState("");

  const debugLogs: DebugLog[] = [
    { id: "1", level: "info", timestamp: "14:45:23.456", source: "consensus", message: "Block 12847562 finalized in 124ms" },
    { id: "2", level: "debug", timestamp: "14:45:23.458", source: "mempool", message: "Added 847 transactions to mempool" },
    { id: "3", level: "warn", timestamp: "14:45:23.460", source: "p2p", message: "Peer 0x1234...5678 slow response (>500ms)" },
    { id: "4", level: "error", timestamp: "14:45:23.465", source: "bridge", message: "Failed to verify signature from chain ETH" },
    { id: "5", level: "info", timestamp: "14:45:23.470", source: "ai", message: "AI optimization decision: increase shard count to 48" },
    { id: "6", level: "debug", timestamp: "14:45:23.475", source: "storage", message: "State root updated: 0xabcd...efgh" },
    { id: "7", level: "info", timestamp: "14:45:23.480", source: "validator", message: "156 validators participating in round 892345" },
    { id: "8", level: "warn", timestamp: "14:45:23.485", source: "network", message: "High latency detected: P99 > 200ms" },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-500";
      case "warn":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      case "debug":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "debug":
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const handleTrace = () => {
    setDebugOutput(`Tracing transaction: ${txHash}

Gas Used: 21000
Status: Success

Execution Trace:
  [0] PUSH1 0x80
  [2] PUSH1 0x40
  [4] MSTORE
  [5] CALLVALUE
  [6] DUP1
  [7] ISZERO
  [8] PUSH2 0x0010
  ...

Stack:
  0x0000...0000
  0x0000...0001

Memory:
  0x00: 0x0000000000000000000000000000000000000000000000000000000000000000

Storage:
  slot[0]: 0x0000000000000000000000000000000000000000000000000000000000000001`);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bug className="h-8 w-8" />
              Debugging Tools
            </h1>
            <p className="text-muted-foreground">디버깅 도구 | Transaction tracing and debugging utilities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-clear-logs">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debug Sessions</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Active sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Traced Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">0.12%</div>
              <p className="text-xs text-muted-foreground">Failed transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Gas Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,230</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transaction">Transaction Tracer</TabsTrigger>
            <TabsTrigger value="logs">Debug Logs</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
            <TabsTrigger value="state">State Inspector</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Transaction Tracer
                </CardTitle>
                <CardDescription>Trace and debug transaction execution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter transaction hash (0x...)" 
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={handleTrace}>
                    <Play className="h-4 w-4 mr-2" />
                    Trace
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Trace Options</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer">vmTrace</Badge>
                    <Badge variant="outline" className="cursor-pointer">trace</Badge>
                    <Badge variant="outline" className="cursor-pointer">stateDiff</Badge>
                    <Badge variant="outline" className="cursor-pointer">memory</Badge>
                    <Badge variant="outline" className="cursor-pointer">storage</Badge>
                  </div>
                </div>

                {debugOutput && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Trace Output</Label>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <ScrollArea className="h-[400px] border rounded-lg p-4 bg-muted font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{debugOutput}</pre>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Debug Logs</CardTitle>
                    <CardDescription>Real-time system logs</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="consensus">Consensus</SelectItem>
                        <SelectItem value="mempool">Mempool</SelectItem>
                        <SelectItem value="p2p">P2P</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] border rounded-lg">
                  <div className="p-4 space-y-1 font-mono text-sm">
                    {debugLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 py-1 hover:bg-muted/50 px-2 rounded">
                        {getLevelIcon(log.level)}
                        <span className="text-muted-foreground">{log.timestamp}</span>
                        <Badge variant="outline" className="text-xs">{log.source}</Badge>
                        <span className={getLevelColor(log.level)}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="console" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  JavaScript Console
                </CardTitle>
                <CardDescription>Execute JavaScript code against the node</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Input</Label>
                  <Textarea 
                    placeholder="// Enter JavaScript code here
web3.eth.getBlockNumber().then(console.log)"
                    className="font-mono text-sm h-32"
                  />
                </div>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </Button>
                <div className="space-y-2">
                  <Label>Output</Label>
                  <div className="border rounded-lg p-4 bg-muted font-mono text-sm min-h-[100px]">
                    <span className="text-green-500">&gt; </span>
                    <span className="text-muted-foreground">12847562</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="state" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  State Inspector
                </CardTitle>
                <CardDescription>Inspect blockchain state at any point</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input placeholder="0x..." className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Block Number</Label>
                    <Input type="number" placeholder="latest" />
                  </div>
                </div>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Inspect State
                </Button>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Account State</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-mono">1,000,000 TBURN</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Nonce</p>
                      <p className="font-mono">247</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Code Hash</p>
                      <p className="font-mono text-xs break-all">0xc5d2460...e12c5</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Storage Root</p>
                      <p className="font-mono text-xs break-all">0x56e81f1...a9b8c</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Storage Slots</h3>
                  <div className="border rounded-lg p-4 font-mono text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">slot[0]:</span>
                      <span>0x0000...0001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">slot[1]:</span>
                      <span>0x0000...03e8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">slot[2]:</span>
                      <span>0x1234...5678</span>
                    </div>
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
