import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileCode,
  Search,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  Eye,
  Upload,
  Download,
  Copy,
  Settings,
  Zap,
  Shield,
  Terminal,
} from "lucide-react";

interface Contract {
  address: string;
  name: string;
  verified: boolean;
  compiler: string;
  deployedAt: string;
  transactions: number;
}

export default function ContractTools() {
  const [activeTab, setActiveTab] = useState("interact");
  const [contractAddress, setContractAddress] = useState("");

  const contracts: Contract[] = [
    {
      address: "0x1234...5678",
      name: "TBURN Token",
      verified: true,
      compiler: "solidity 0.8.20",
      deployedAt: "2024-01-15",
      transactions: 1248567,
    },
    {
      address: "0xabcd...efgh",
      name: "Staking Pool",
      verified: true,
      compiler: "solidity 0.8.20",
      deployedAt: "2024-01-15",
      transactions: 456789,
    },
    {
      address: "0x9876...5432",
      name: "Bridge Contract",
      verified: true,
      compiler: "solidity 0.8.20",
      deployedAt: "2024-02-20",
      transactions: 234567,
    },
    {
      address: "0xdead...beef",
      name: "DEX Router",
      verified: false,
      compiler: "unknown",
      deployedAt: "2024-03-10",
      transactions: 89012,
    },
  ];

  const abiExample = `[
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
]`;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileCode className="h-8 w-8" />
              Smart Contract Tools
            </h1>
            <p className="text-muted-foreground">스마트 컨트랙트 도구 | Contract interaction and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-deploy">
              <Upload className="h-4 w-4 mr-2" />
              Deploy Contract
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-muted-foreground">Deployed on mainnet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">8,234</div>
              <p className="text-xs text-muted-foreground">Source verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interactions (24h)</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4M</div>
              <p className="text-xs text-green-500">+18% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gas Used (24h)</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847M</div>
              <p className="text-xs text-muted-foreground">Gas units</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="interact">Interact</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="abi">ABI Tools</TabsTrigger>
            <TabsTrigger value="deployed">Deployed Contracts</TabsTrigger>
          </TabsList>

          <TabsContent value="interact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Interaction</CardTitle>
                <CardDescription>Read and write to smart contracts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contract Address</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="0x..." 
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                      />
                      <Button variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Select defaultValue="mainnet">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ABI (JSON)</Label>
                  <Textarea 
                    placeholder="Paste contract ABI here..." 
                    className="font-mono text-sm h-32"
                    defaultValue={abiExample}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Read Functions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">totalSupply()</span>
                        <Badge variant="outline">view</Badge>
                      </div>
                      <Button size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Query
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">balanceOf(address)</span>
                        <Badge variant="outline">view</Badge>
                      </div>
                      <Input placeholder="Address" className="mb-2" />
                      <Button size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Query
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Write Functions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">transfer(address, uint256)</span>
                        <Badge variant="secondary">write</Badge>
                      </div>
                      <Input placeholder="To Address" className="mb-2" />
                      <Input placeholder="Amount" className="mb-2" />
                      <Button size="sm" className="w-full" variant="secondary">
                        <Zap className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verify" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verify Contract
                </CardTitle>
                <CardDescription>Submit source code for verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contract Address</Label>
                    <Input placeholder="0x..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Compiler Version</Label>
                    <Select defaultValue="0.8.20">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.8.20">Solidity 0.8.20</SelectItem>
                        <SelectItem value="0.8.19">Solidity 0.8.19</SelectItem>
                        <SelectItem value="0.8.18">Solidity 0.8.18</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contract Name</Label>
                    <Input placeholder="MyToken" />
                  </div>
                  <div className="space-y-2">
                    <Label>Optimization</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes (200 runs)</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Source Code</Label>
                  <Textarea 
                    placeholder="// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    // Your source code here...
}" 
                    className="font-mono text-sm h-64"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Constructor Arguments (ABI-encoded)</Label>
                  <Input placeholder="0x..." />
                </div>

                <Button className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Contract
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  ABI Encoder/Decoder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Encode</h3>
                    <div className="space-y-2">
                      <Label>Function Signature</Label>
                      <Input placeholder="transfer(address,uint256)" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parameters (comma-separated)</Label>
                      <Input placeholder="0x1234...5678, 1000000000000000000" />
                    </div>
                    <Button className="w-full">Encode</Button>
                    <div className="space-y-2">
                      <Label>Encoded Data</Label>
                      <Textarea readOnly className="font-mono text-xs" placeholder="Result will appear here..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Decode</h3>
                    <div className="space-y-2">
                      <Label>Encoded Data</Label>
                      <Textarea placeholder="0xa9059cbb..." className="font-mono text-xs h-20" />
                    </div>
                    <div className="space-y-2">
                      <Label>ABI (Optional)</Label>
                      <Textarea placeholder="Paste ABI for better decoding..." className="font-mono text-xs h-20" />
                    </div>
                    <Button className="w-full">Decode</Button>
                    <div className="space-y-2">
                      <Label>Decoded Output</Label>
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        <p>Function: transfer(address,uint256)</p>
                        <p>to: 0x1234...5678</p>
                        <p>amount: 1000000000000000000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployed" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Deployed Contracts</CardTitle>
                    <CardDescription>Core protocol contracts</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search contracts..." className="pl-9 w-64" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Compiler</TableHead>
                      <TableHead>Deployed</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow key={contract.address}>
                        <TableCell className="font-medium">{contract.name}</TableCell>
                        <TableCell className="font-mono text-sm">{contract.address}</TableCell>
                        <TableCell>
                          {contract.verified ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{contract.compiler}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{contract.deployedAt}</TableCell>
                        <TableCell>{contract.transactions.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Code className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Play className="h-4 w-4" />
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
        </Tabs>
      </div>
    </div>
  );
}
