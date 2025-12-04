import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  PiggyBank, FileText, Lock, Key, Send, History, DollarSign
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AdminTreasury() {
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const treasuryStats = {
    totalBalance: "250,000,000",
    usdValue: "$125,000,000",
    monthlyIncome: "5,000,000",
    monthlyExpense: "3,500,000",
    netChange: "+1,500,000",
  };

  const poolBalances = [
    { name: "Main Treasury", balance: "150,000,000", percentage: 60, color: "bg-blue-500" },
    { name: "Development Fund", balance: "50,000,000", percentage: 20, color: "bg-purple-500" },
    { name: "Marketing Fund", balance: "25,000,000", percentage: 10, color: "bg-orange-500" },
    { name: "Community Fund", balance: "15,000,000", percentage: 6, color: "bg-green-500" },
    { name: "Reserve Fund", balance: "10,000,000", percentage: 4, color: "bg-gray-500" },
  ];

  const transactions = [
    { id: 1, type: "income", category: "Transaction Fees", amount: "125,000", timestamp: "2024-12-03 14:30", status: "completed" },
    { id: 2, type: "income", category: "Bridge Fees", amount: "45,000", timestamp: "2024-12-03 12:00", status: "completed" },
    { id: 3, type: "expense", category: "Validator Rewards", amount: "250,000", timestamp: "2024-12-03 00:00", status: "completed" },
    { id: 4, type: "expense", category: "Development", amount: "75,000", timestamp: "2024-12-02 16:00", status: "pending" },
    { id: 5, type: "income", category: "Slashing Penalty", amount: "10,000", timestamp: "2024-12-02 10:30", status: "completed" },
  ];

  const growthData = [
    { month: "Jul", balance: 220 },
    { month: "Aug", balance: 228 },
    { month: "Sep", balance: 235 },
    { month: "Oct", balance: 242 },
    { month: "Nov", balance: 248 },
    { month: "Dec", balance: 250 },
  ];

  const multiSigSigners = [
    { address: "0x1234...5678", name: "Admin 1", signed: true },
    { address: "0x2345...6789", name: "Admin 2", signed: true },
    { address: "0x3456...7890", name: "Admin 3", signed: false },
    { address: "0x4567...8901", name: "Admin 4", signed: false },
    { address: "0x5678...9012", name: "Admin 5", signed: false },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Treasury Dashboard</h1>
            <p className="text-muted-foreground">Manage treasury funds and financial operations</p>
          </div>
          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-transfer">
                <Send className="w-4 h-4 mr-2" />
                Transfer Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Funds</DialogTitle>
                <DialogDescription>Requires 3/5 multi-signature approval</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>From Pool</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {poolBalances.map((pool) => (
                        <SelectItem key={pool.name} value={pool.name}>{pool.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input placeholder="Pool name or wallet address" />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input placeholder="Transfer reason" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
                <Button>Submit for Approval</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Card className="col-span-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total Balance</span>
              </div>
              <div className="text-3xl font-bold">{treasuryStats.totalBalance}</div>
              <div className="text-sm text-muted-foreground">TBURN</div>
              <div className="text-lg text-muted-foreground mt-1">{treasuryStats.usdValue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Monthly Income</span>
              </div>
              <div className="text-2xl font-bold text-green-500">+{treasuryStats.monthlyIncome}</div>
              <div className="text-sm text-muted-foreground">TBURN</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Monthly Expense</span>
              </div>
              <div className="text-2xl font-bold text-red-500">-{treasuryStats.monthlyExpense}</div>
              <div className="text-sm text-muted-foreground">TBURN</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Net Change</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{treasuryStats.netChange}</div>
              <div className="text-sm text-muted-foreground">TBURN</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Treasury Growth</CardTitle>
              <CardDescription>6-month balance trend (in millions)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[200, 260]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pool Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {poolBalances.map((pool, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{pool.name}</span>
                    <span className="font-medium">{pool.percentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={pool.percentage} className="flex-1" />
                  </div>
                  <div className="text-xs text-muted-foreground">{pool.balance} TBURN</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <History className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="budget" data-testid="tab-budget">
              <PiggyBank className="w-4 h-4 mr-2" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="multisig" data-testid="tab-multisig">
              <Key className="w-4 h-4 mr-2" />
              Multi-Sig
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Treasury income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge variant={tx.type === "income" ? "default" : "destructive"}>
                            {tx.type === "income" ? (
                              <><ArrowUpRight className="w-3 h-3 mr-1" /> Income</>
                            ) : (
                              <><ArrowDownRight className="w-3 h-3 mr-1" /> Expense</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell className={tx.type === "income" ? "text-green-500" : "text-red-500"}>
                          {tx.type === "income" ? "+" : "-"}{tx.amount} TBURN
                        </TableCell>
                        <TableCell className="text-muted-foreground">{tx.timestamp}</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === "completed" ? "outline" : "secondary"}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Budget</CardTitle>
                  <CardDescription>Budget allocation and spending</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Development</span>
                      <span className="font-medium">$2,000,000</span>
                    </div>
                    <Progress value={65} />
                    <div className="text-xs text-muted-foreground">65% utilized ($1,300,000)</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Marketing</span>
                      <span className="font-medium">$1,000,000</span>
                    </div>
                    <Progress value={45} />
                    <div className="text-xs text-muted-foreground">45% utilized ($450,000)</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Operations</span>
                      <span className="font-medium">$500,000</span>
                    </div>
                    <Progress value={80} />
                    <div className="text-xs text-muted-foreground">80% utilized ($400,000)</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Community</span>
                      <span className="font-medium">$300,000</span>
                    </div>
                    <Progress value={30} />
                    <div className="text-xs text-muted-foreground">30% utilized ($90,000)</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                      <div className="text-2xl font-bold">$3.8M</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Spent</div>
                      <div className="text-2xl font-bold">$2.24M</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Remaining</div>
                      <div className="text-2xl font-bold text-green-500">$1.56M</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Utilization</div>
                      <div className="text-2xl font-bold">59%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="multisig">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Multi-Signature Wallet (3/5)
                </CardTitle>
                <CardDescription>Treasury operations require 3 out of 5 signatures</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multiSigSigners.map((signer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{signer.name}</TableCell>
                        <TableCell className="font-mono">{signer.address}</TableCell>
                        <TableCell>
                          {signer.signed ? (
                            <Badge className="bg-green-500">Signed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Pending Transactions</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transfer 75,000 TBURN to Development Fund</span>
                    <Badge variant="outline">2/3 signatures</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate and download treasury reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Monthly Report
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Quarterly Report
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Annual Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
