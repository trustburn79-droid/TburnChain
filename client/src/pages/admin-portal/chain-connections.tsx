import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Link2, Plus, Settings, CheckCircle, AlertTriangle, 
  Activity, Globe, Shield, RefreshCw, Trash2
} from "lucide-react";

export default function AdminChainConnections() {
  const [addChainOpen, setAddChainOpen] = useState(false);

  const chains = [
    { 
      id: 1, 
      name: "Ethereum Mainnet", 
      chainId: 1, 
      rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/...", 
      status: "active",
      blockHeight: 18750234,
      latency: 85,
      contractAddress: "0x1234...5678",
      enabled: true
    },
    { 
      id: 2, 
      name: "BNB Smart Chain", 
      chainId: 56, 
      rpcUrl: "https://bsc-dataseed1.binance.org", 
      status: "active",
      blockHeight: 34567890,
      latency: 42,
      contractAddress: "0x2345...6789",
      enabled: true
    },
    { 
      id: 3, 
      name: "Polygon", 
      chainId: 137, 
      rpcUrl: "https://polygon-rpc.com", 
      status: "active",
      blockHeight: 51234567,
      latency: 65,
      contractAddress: "0x3456...7890",
      enabled: true
    },
    { 
      id: 4, 
      name: "Avalanche C-Chain", 
      chainId: 43114, 
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc", 
      status: "active",
      blockHeight: 42345678,
      latency: 120,
      contractAddress: "0x4567...8901",
      enabled: true
    },
    { 
      id: 5, 
      name: "Arbitrum One", 
      chainId: 42161, 
      rpcUrl: "https://arb1.arbitrum.io/rpc", 
      status: "active",
      blockHeight: 156789012,
      latency: 55,
      contractAddress: "0x5678...9012",
      enabled: true
    },
    { 
      id: 6, 
      name: "Optimism", 
      chainId: 10, 
      rpcUrl: "https://mainnet.optimism.io", 
      status: "degraded",
      blockHeight: 112345678,
      latency: 250,
      contractAddress: "0x6789...0123",
      enabled: true
    },
    { 
      id: 7, 
      name: "Base", 
      chainId: 8453, 
      rpcUrl: "https://mainnet.base.org", 
      status: "active",
      blockHeight: 7890123,
      latency: 78,
      contractAddress: "0x7890...1234",
      enabled: true
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Chain Connections</h1>
            <p className="text-muted-foreground">Manage connected blockchain networks</p>
          </div>
          <Dialog open={addChainOpen} onOpenChange={setAddChainOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Chain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Chain</DialogTitle>
                <DialogDescription>Connect a new blockchain network to the bridge</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Chain Name</Label>
                  <Input placeholder="e.g., Ethereum Mainnet" />
                </div>
                <div className="space-y-2">
                  <Label>Chain ID</Label>
                  <Input type="number" placeholder="e.g., 1" />
                </div>
                <div className="space-y-2">
                  <Label>RPC URL</Label>
                  <Input placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Bridge Contract Address</Label>
                  <Input placeholder="0x..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddChainOpen(false)}>Cancel</Button>
                <Button>Add Chain</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Connected Chains</span>
              </div>
              <div className="text-3xl font-bold">7</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <div className="text-3xl font-bold text-green-500">6</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Degraded</span>
              </div>
              <div className="text-3xl font-bold text-yellow-500">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Avg Latency</span>
              </div>
              <div className="text-3xl font-bold">85ms</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connected Chains</CardTitle>
            <CardDescription>All blockchain networks connected to the bridge</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chain</TableHead>
                  <TableHead>Chain ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Block Height</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chains.map((chain) => (
                  <TableRow key={chain.id}>
                    <TableCell className="font-medium">{chain.name}</TableCell>
                    <TableCell>{chain.chainId}</TableCell>
                    <TableCell>
                      <Badge variant={chain.status === "active" ? "default" : "secondary"} 
                        className={chain.status === "active" ? "bg-green-500" : "bg-yellow-500"}>
                        {chain.status === "active" ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 mr-1" /> Degraded</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{chain.blockHeight.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={chain.latency < 100 ? "text-green-500" : chain.latency < 200 ? "text-yellow-500" : "text-red-500"}>
                        {chain.latency}ms
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{chain.contractAddress}</TableCell>
                    <TableCell>
                      <Switch defaultChecked={chain.enabled} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RPC Health</CardTitle>
            <CardDescription>Connection status for each chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {chains.slice(0, 4).map((chain) => (
                <div key={chain.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{chain.name}</span>
                    <Badge variant="outline" className={chain.status === "active" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
                      {chain.latency}ms
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{chain.rpcUrl}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${chain.status === "active" ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
                    <span className="text-xs">Connected</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
