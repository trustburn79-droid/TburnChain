import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Coins, Plus, Flame, Pause, Play, Users, TrendingUp, 
  Shield, Brain, AlertTriangle, CheckCircle, FileText
} from "lucide-react";

export default function AdminTokenIssuance() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const tokens = [
    { id: 1, name: "TBURN", symbol: "TBURN", standard: "TBC-20", totalSupply: "1,000,000,000", circulatingSupply: "750,000,000", holders: 125000, status: "active", aiEnabled: true },
    { id: 2, name: "Wrapped TBURN", symbol: "wTBURN", standard: "TBC-20", totalSupply: "50,000,000", circulatingSupply: "45,000,000", holders: 8500, status: "active", aiEnabled: false },
    { id: 3, name: "TBURN NFT Collection", symbol: "TBNFT", standard: "TBC-721", totalSupply: "10,000", circulatingSupply: "8,500", holders: 3200, status: "active", aiEnabled: false },
    { id: 4, name: "TBURN Rewards", symbol: "TBRW", standard: "TBC-1155", totalSupply: "100,000,000", circulatingSupply: "25,000,000", holders: 45000, status: "paused", aiEnabled: true },
  ];

  const supplyStats = [
    { label: "Total Supply", value: "1,000,000,000", unit: "TBURN" },
    { label: "Circulating Supply", value: "750,000,000", unit: "TBURN" },
    { label: "Locked Supply", value: "150,000,000", unit: "TBURN" },
    { label: "Burned Supply", value: "100,000,000", unit: "TBURN" },
  ];

  const recentActions = [
    { id: 1, action: "Mint", token: "TBURN", amount: "1,000,000", to: "0x7890...cdef", by: "Admin", timestamp: "2024-12-03 14:30" },
    { id: 2, action: "Burn", token: "TBURN", amount: "500,000", to: "Burn Address", by: "AI System", timestamp: "2024-12-03 12:00" },
    { id: 3, action: "Pause", token: "TBRW", amount: "-", to: "-", by: "Admin", timestamp: "2024-12-02 18:45" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Token Issuance Management</h1>
            <p className="text-muted-foreground">Manage token creation, minting, burning, and emergency controls</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-token">
                <Plus className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Token</DialogTitle>
                <DialogDescription>Deploy a new token with TBURN standards</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Token Standard</Label>
                  <Select defaultValue="tbc20">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tbc20">TBC-20 (Fungible)</SelectItem>
                      <SelectItem value="tbc721">TBC-721 (NFT)</SelectItem>
                      <SelectItem value="tbc1155">TBC-1155 (Multi-Token)</SelectItem>
                      <SelectItem value="tbcai">TBC-AI (AI Managed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Token Name</Label>
                  <Input placeholder="My Token" />
                </div>
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <Input placeholder="MTK" />
                </div>
                <div className="space-y-2">
                  <Label>Decimals</Label>
                  <Input type="number" defaultValue="18" />
                </div>
                <div className="space-y-2">
                  <Label>Initial Supply</Label>
                  <Input type="number" placeholder="1000000" />
                </div>
                <div className="space-y-2">
                  <Label>Max Supply</Label>
                  <Input type="number" placeholder="10000000" />
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t">
                  <h4 className="font-medium">AI Features</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">AI Burn Optimization</p>
                      <p className="text-xs text-muted-foreground">Automatically optimize burn rates</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Predictive Balancing</p>
                      <p className="text-xs text-muted-foreground">AI-powered supply management</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Security Features</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Quantum Resistance</p>
                      <p className="text-xs text-muted-foreground">Post-quantum cryptography</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">MEV Protection</p>
                      <p className="text-xs text-muted-foreground">Protect against front-running</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button>Create Token</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {supplyStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.unit}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="tokens" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tokens" data-testid="tab-tokens">
              <Coins className="w-4 h-4 mr-2" />
              All Tokens
            </TabsTrigger>
            <TabsTrigger value="mint" data-testid="tab-mint">
              <Plus className="w-4 h-4 mr-2" />
              Mint
            </TabsTrigger>
            <TabsTrigger value="burn" data-testid="tab-burn">
              <Flame className="w-4 h-4 mr-2" />
              Burn
            </TabsTrigger>
            <TabsTrigger value="holders" data-testid="tab-holders">
              <Users className="w-4 h-4 mr-2" />
              Holders
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <FileText className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>Token List</CardTitle>
                <CardDescription>All tokens deployed on TBURN network</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Total Supply</TableHead>
                      <TableHead>Circulating</TableHead>
                      <TableHead>Holders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{token.name}</p>
                            <p className="text-sm text-muted-foreground">{token.symbol}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{token.standard}</Badge>
                        </TableCell>
                        <TableCell>{token.totalSupply}</TableCell>
                        <TableCell>{token.circulatingSupply}</TableCell>
                        <TableCell>{token.holders.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={token.status === "active" ? "default" : "secondary"}>
                            {token.status === "active" ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                            ) : (
                              <><Pause className="w-3 h-3 mr-1" /> Paused</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {token.aiEnabled ? (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                              <Brain className="w-3 h-3 mr-1" /> AI
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Flame className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              {token.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mint">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  Mint Tokens
                </CardTitle>
                <CardDescription>Issue new tokens (requires multi-sig approval)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Token</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.id} value={token.symbol}>{token.name} ({token.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" placeholder="Enter amount" />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Address</Label>
                    <Input placeholder="0x..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input placeholder="Minting reason" />
                  </div>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Multi-Signature Required</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action requires 3/5 admin signatures to execute
                  </p>
                </div>
                <Button className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Submit Mint Request
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="burn">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Burn Tokens
                </CardTitle>
                <CardDescription>Permanently remove tokens from circulation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Token</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.id} value={token.symbol}>{token.name} ({token.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" placeholder="Enter amount" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Reason</Label>
                    <Input placeholder="Burning reason" />
                  </div>
                </div>
                <Button variant="destructive" className="w-full">
                  <Flame className="w-4 h-4 mr-2" />
                  Submit Burn Request
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Token Holder Analysis
                </CardTitle>
                <CardDescription>Distribution and holder statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-3xl font-bold">125,000</div>
                    <div className="text-sm text-muted-foreground">Total Holders</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-3xl font-bold">0.42</div>
                    <div className="text-sm text-muted-foreground">Gini Coefficient</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-3xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Whale Wallets</div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell className="font-mono">0x1234...5678</TableCell>
                      <TableCell>50,000,000 TBURN</TableCell>
                      <TableCell>5.00%</TableCell>
                      <TableCell><Badge>Whale</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell className="font-mono">0x2345...6789</TableCell>
                      <TableCell>35,000,000 TBURN</TableCell>
                      <TableCell>3.50%</TableCell>
                      <TableCell><Badge>Whale</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>3</TableCell>
                      <TableCell className="font-mono">0x3456...7890</TableCell>
                      <TableCell>28,000,000 TBURN</TableCell>
                      <TableCell>2.80%</TableCell>
                      <TableCell><Badge>Whale</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Action History</CardTitle>
                <CardDescription>Recent token operations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell>
                          <Badge variant={action.action === "Mint" ? "default" : action.action === "Burn" ? "destructive" : "secondary"}>
                            {action.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{action.token}</TableCell>
                        <TableCell>{action.amount}</TableCell>
                        <TableCell className="font-mono text-sm">{action.to}</TableCell>
                        <TableCell>{action.by}</TableCell>
                        <TableCell className="text-muted-foreground">{action.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
