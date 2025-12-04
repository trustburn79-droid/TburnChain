import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calculator,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Wallet,
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AccountingEntry {
  id: string;
  txHash: string;
  type: "fee" | "reward" | "burn" | "transfer" | "bridge";
  debit: number;
  credit: number;
  account: string;
  category: string;
  timestamp: string;
  status: "posted" | "pending" | "reconciled";
  reference: string;
}

export default function TxAccounting() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("ledger");

  const accountingEntries: AccountingEntry[] = [
    { id: "ACC-001", txHash: "0x1a2b3c...", type: "fee", debit: 0, credit: 125000, account: "Transaction Fees", category: "Revenue", timestamp: "2024-12-03T14:30:00Z", status: "posted", reference: "Block #12847563" },
    { id: "ACC-002", txHash: "0x4d5e6f...", type: "reward", debit: 85000, credit: 0, account: "Validator Rewards", category: "Expense", timestamp: "2024-12-03T14:25:00Z", status: "posted", reference: "Epoch 45678" },
    { id: "ACC-003", txHash: "0x7g8h9i...", type: "burn", debit: 50000, credit: 0, account: "Token Burn", category: "Deflationary", timestamp: "2024-12-03T14:20:00Z", status: "reconciled", reference: "Auto-burn" },
    { id: "ACC-004", txHash: "0xj0k1l2...", type: "bridge", debit: 0, credit: 35000, account: "Bridge Fees", category: "Revenue", timestamp: "2024-12-03T14:15:00Z", status: "posted", reference: "ETH→TBURN" },
    { id: "ACC-005", txHash: "0xm3n4o5...", type: "fee", debit: 0, credit: 98000, account: "Transaction Fees", category: "Revenue", timestamp: "2024-12-03T14:10:00Z", status: "pending", reference: "Block #12847562" },
    { id: "ACC-006", txHash: "0xp6q7r8...", type: "reward", debit: 92000, credit: 0, account: "Staking Rewards", category: "Expense", timestamp: "2024-12-03T14:05:00Z", status: "posted", reference: "Pool rewards" },
    { id: "ACC-007", txHash: "0xs9t0u1...", type: "transfer", debit: 0, credit: 15000, account: "DEX Fees", category: "Revenue", timestamp: "2024-12-03T14:00:00Z", status: "reconciled", reference: "Swap fees" },
    { id: "ACC-008", txHash: "0xv2w3x4...", type: "burn", debit: 45000, credit: 0, account: "Token Burn", category: "Deflationary", timestamp: "2024-12-03T13:55:00Z", status: "posted", reference: "Manual burn" },
  ];

  const dailyVolumes = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    fees: Math.floor(Math.random() * 500000) + 200000,
    rewards: Math.floor(Math.random() * 400000) + 150000,
    burns: Math.floor(Math.random() * 100000) + 50000,
  }));

  const accountSummary = [
    { account: "Transaction Fees", debit: 0, credit: 4250000, balance: 4250000, type: "Asset" },
    { account: "Bridge Fees", debit: 0, credit: 1580000, balance: 1580000, type: "Asset" },
    { account: "DEX Fees", debit: 0, credit: 890000, balance: 890000, type: "Asset" },
    { account: "Validator Rewards", debit: 2850000, credit: 0, balance: -2850000, type: "Liability" },
    { account: "Staking Rewards", debit: 1920000, credit: 0, balance: -1920000, type: "Liability" },
    { account: "Token Burn", debit: 1520000, credit: 0, balance: -1520000, type: "Equity" },
    { account: "Operations", debit: 750000, credit: 0, balance: -750000, type: "Expense" },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fee": return "bg-green-500";
      case "reward": return "bg-blue-500";
      case "burn": return "bg-orange-500";
      case "bridge": return "bg-purple-500";
      case "transfer": return "bg-cyan-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted": return <Badge variant="default">Posted</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "reconciled": return <Badge className="bg-green-500">Reconciled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredEntries = accountingEntries.filter((entry) => {
    const matchesSearch = 
      entry.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || entry.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalDebits = accountingEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = accountingEntries.reduce((sum, e) => sum + e.credit, 0);
  const pendingCount = accountingEntries.filter(e => e.status === "pending").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              Transaction Accounting
            </h1>
            <p className="text-muted-foreground">Blockchain transaction ledger and reconciliation</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32" data-testid="select-date-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-reconcile">
              <CheckCircle className="h-4 w-4 mr-2" />
              Reconcile
            </Button>
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${(totalCredits / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Debits</p>
                  <p className="text-2xl font-bold text-red-500">
                    ${(totalDebits / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Balance</p>
                  <p className="text-2xl font-bold">
                    ${((totalCredits - totalDebits) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ledger">General Ledger</TabsTrigger>
            <TabsTrigger value="accounts">Account Summary</TabsTrigger>
            <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          </TabsList>

          <TabsContent value="ledger" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Transaction Ledger</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-32" data-testid="select-type">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="fee">Fees</SelectItem>
                        <SelectItem value="reward">Rewards</SelectItem>
                        <SelectItem value="burn">Burns</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>TX Hash</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.txHash}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(entry.type)}>{entry.type}</Badge>
                        </TableCell>
                        <TableCell>{entry.account}</TableCell>
                        <TableCell className="text-right text-red-500">
                          {entry.debit > 0 ? `$${(entry.debit / 1000).toFixed(1)}K` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-green-500">
                          {entry.credit > 0 ? `$${(entry.credit / 1000).toFixed(1)}K` : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.reference}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription>Trial balance and account totals</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Total Debit</TableHead>
                      <TableHead className="text-right">Total Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountSummary.map((account) => (
                      <TableRow key={account.account}>
                        <TableCell className="font-medium">{account.account}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {account.debit > 0 ? `$${(account.debit / 1000000).toFixed(2)}M` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {account.credit > 0 ? `$${(account.credit / 1000000).toFixed(2)}M` : "-"}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${account.balance > 0 ? "text-green-500" : "text-red-500"}`}>
                          ${Math.abs(account.balance / 1000000).toFixed(2)}M
                          {account.balance > 0 ? " CR" : " DR"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>TOTAL</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        ${(accountSummary.reduce((s, a) => s + a.debit, 0) / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell className="text-right">
                        ${(accountSummary.reduce((s, a) => s + a.credit, 0) / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell className="text-right">
                        ${(accountSummary.reduce((s, a) => s + a.balance, 0) / 1000000).toFixed(2)}M
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Transaction Volume</CardTitle>
                <CardDescription>Fees, rewards, and burns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyVolumes}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [`$${(value / 1000).toFixed(1)}K`, ""]}
                      />
                      <Legend />
                      <Bar dataKey="fees" fill="hsl(var(--chart-1))" name="Fees" />
                      <Bar dataKey="rewards" fill="hsl(var(--chart-2))" name="Rewards" />
                      <Bar dataKey="burns" fill="hsl(var(--chart-3))" name="Burns" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Status</CardTitle>
                <CardDescription>Match on-chain transactions with ledger entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-sm text-muted-foreground">Reconciled</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold">1.2%</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                    <p className="text-2xl font-bold">0.3%</p>
                    <p className="text-sm text-muted-foreground">Discrepancies</p>
                  </div>
                </div>
                <Button className="w-full" data-testid="button-run-reconciliation">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Full Reconciliation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
