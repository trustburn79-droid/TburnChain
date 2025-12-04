import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeftRight, Search, Filter, CheckCircle, Clock, 
  AlertTriangle, XCircle, Eye, RefreshCw, Download
} from "lucide-react";

export default function AdminBridgeTransfers() {
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);

  const transfers = [
    { 
      id: "0xabc123def456", 
      from: { chain: "Ethereum", address: "0x1234...5678" }, 
      to: { chain: "TBURN", address: "tburn1...xyz" }, 
      amount: "50,000 USDT", 
      fee: "25 USDT",
      status: "completed", 
      confirmations: "12/12",
      timestamp: "2024-12-03 14:30:25",
      duration: "3m 24s"
    },
    { 
      id: "0xdef456ghi789", 
      from: { chain: "TBURN", address: "tburn1...abc" }, 
      to: { chain: "BSC", address: "0x2345...6789" }, 
      amount: "100,000 TBURN", 
      fee: "100 TBURN",
      status: "pending", 
      confirmations: "8/12",
      timestamp: "2024-12-03 14:25:00",
      duration: "-"
    },
    { 
      id: "0xghi789jkl012", 
      from: { chain: "Polygon", address: "0x3456...7890" }, 
      to: { chain: "TBURN", address: "tburn1...def" }, 
      amount: "25,000 USDC", 
      fee: "12.5 USDC",
      status: "validating", 
      confirmations: "4/12",
      timestamp: "2024-12-03 14:20:00",
      duration: "-"
    },
    { 
      id: "0xjkl012mno345", 
      from: { chain: "Avalanche", address: "0x4567...8901" }, 
      to: { chain: "TBURN", address: "tburn1...ghi" }, 
      amount: "10,000 AVAX", 
      fee: "5 AVAX",
      status: "failed", 
      confirmations: "0/12",
      timestamp: "2024-12-03 14:15:00",
      duration: "-",
      error: "Insufficient liquidity"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "validating": return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      validating: "bg-blue-500",
      failed: "bg-red-500"
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Transfer Monitor</h1>
            <p className="text-muted-foreground">Track and manage cross-chain transfers</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search by TX ID, address, or amount..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="validating">Validating</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="bsc">BSC</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="tburn">TBURN</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Transfers</TabsTrigger>
            <TabsTrigger value="pending">Pending (156)</TabsTrigger>
            <TabsTrigger value="failed">Failed (3)</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TX ID</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confirmations</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.from.chain}</p>
                            <p className="text-xs text-muted-foreground font-mono">{tx.from.address}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.to.chain}</p>
                            <p className="text-xs text-muted-foreground font-mono">{tx.to.address}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tx.amount}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.fee}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tx.status)}
                            {getStatusBadge(tx.status)}
                          </div>
                        </TableCell>
                        <TableCell>{tx.confirmations}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.duration}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedTransfer(tx)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Transfer Details</DialogTitle>
                                <DialogDescription>Full transaction information</DialogDescription>
                              </DialogHeader>
                              {selectedTransfer && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                                      <p className="font-mono">{selectedTransfer.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      {getStatusBadge(selectedTransfer.status)}
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">From</p>
                                      <p className="font-medium">{selectedTransfer.from.chain}</p>
                                      <p className="font-mono text-sm">{selectedTransfer.from.address}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">To</p>
                                      <p className="font-medium">{selectedTransfer.to.chain}</p>
                                      <p className="font-mono text-sm">{selectedTransfer.to.address}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Amount</p>
                                      <p className="font-medium">{selectedTransfer.amount}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Fee</p>
                                      <p>{selectedTransfer.fee}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Timestamp</p>
                                      <p>{selectedTransfer.timestamp}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Confirmations</p>
                                      <p>{selectedTransfer.confirmations}</p>
                                    </div>
                                  </div>
                                  {selectedTransfer.error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                      <p className="text-red-500 font-medium">Error</p>
                                      <p className="text-sm">{selectedTransfer.error}</p>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    {selectedTransfer.status === "failed" && (
                                      <Button>Retry Transfer</Button>
                                    )}
                                    {selectedTransfer.status === "pending" && (
                                      <Button variant="destructive">Cancel Transfer</Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Transfers
                </CardTitle>
                <CardDescription>Transfers awaiting confirmation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>156 pending transfers across all chains</p>
                  <Button variant="outline" className="mt-4">View All Pending</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="failed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Failed Transfers
                </CardTitle>
                <CardDescription>Transfers that require attention</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TX ID</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.filter(t => t.status === "failed").map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono">{tx.id}</TableCell>
                        <TableCell>{tx.from.chain} → {tx.to.chain}</TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell className="text-red-500">{tx.error}</TableCell>
                        <TableCell>
                          <Button size="sm">Retry</Button>
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
    </ScrollArea>
  );
}
