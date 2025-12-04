import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface AccountSummary {
  account: string;
  debit: number;
  credit: number;
  balance: number;
  type: string;
}

interface TxAccountingData {
  entries: AccountingEntry[];
  accountSummary: AccountSummary[];
  dailyVolumes: { date: string; fees: number; rewards: number; burns: number }[];
}

export default function TxAccounting() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("ledger");

  const { data: accountingData, isLoading, error, refetch } = useQuery<TxAccountingData>({
    queryKey: ["/api/admin/accounting/transactions"],
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminTxAccounting.refreshed"),
      description: t("adminTxAccounting.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      dateRange,
      entries: accountingEntries,
      accountSummary,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tx-accounting-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminTxAccounting.exported"),
      description: t("adminTxAccounting.exportedDesc"),
    });
  }, [dateRange, toast, t]);

  const accountingEntries: AccountingEntry[] = accountingData?.entries || [
    { id: "ACC-001", txHash: "0x1a2b3c...", type: "fee", debit: 0, credit: 125000, account: t("adminTxAccounting.accounts.txFees"), category: t("adminTxAccounting.categories.revenue"), timestamp: "2024-12-03T14:30:00Z", status: "posted", reference: "Block #12847563" },
    { id: "ACC-002", txHash: "0x4d5e6f...", type: "reward", debit: 85000, credit: 0, account: t("adminTxAccounting.accounts.validatorRewards"), category: t("adminTxAccounting.categories.expense"), timestamp: "2024-12-03T14:25:00Z", status: "posted", reference: "Epoch 45678" },
    { id: "ACC-003", txHash: "0x7g8h9i...", type: "burn", debit: 50000, credit: 0, account: t("adminTxAccounting.accounts.tokenBurn"), category: t("adminTxAccounting.categories.deflationary"), timestamp: "2024-12-03T14:20:00Z", status: "reconciled", reference: "Auto-burn" },
    { id: "ACC-004", txHash: "0xj0k1l2...", type: "bridge", debit: 0, credit: 35000, account: t("adminTxAccounting.accounts.bridgeFees"), category: t("adminTxAccounting.categories.revenue"), timestamp: "2024-12-03T14:15:00Z", status: "posted", reference: "ETH→TBURN" },
    { id: "ACC-005", txHash: "0xm3n4o5...", type: "fee", debit: 0, credit: 98000, account: t("adminTxAccounting.accounts.txFees"), category: t("adminTxAccounting.categories.revenue"), timestamp: "2024-12-03T14:10:00Z", status: "pending", reference: "Block #12847562" },
    { id: "ACC-006", txHash: "0xp6q7r8...", type: "reward", debit: 92000, credit: 0, account: t("adminTxAccounting.accounts.stakingRewards"), category: t("adminTxAccounting.categories.expense"), timestamp: "2024-12-03T14:05:00Z", status: "posted", reference: "Pool rewards" },
    { id: "ACC-007", txHash: "0xs9t0u1...", type: "transfer", debit: 0, credit: 15000, account: t("adminTxAccounting.accounts.dexFees"), category: t("adminTxAccounting.categories.revenue"), timestamp: "2024-12-03T14:00:00Z", status: "reconciled", reference: "Swap fees" },
    { id: "ACC-008", txHash: "0xv2w3x4...", type: "burn", debit: 45000, credit: 0, account: t("adminTxAccounting.accounts.tokenBurn"), category: t("adminTxAccounting.categories.deflationary"), timestamp: "2024-12-03T13:55:00Z", status: "posted", reference: "Manual burn" },
  ];

  const dailyVolumes = accountingData?.dailyVolumes || Array.from({ length: 30 }, (_, i) => ({
    date: `${t("adminTxAccounting.day")} ${i + 1}`,
    fees: Math.floor(Math.random() * 500000) + 200000,
    rewards: Math.floor(Math.random() * 400000) + 150000,
    burns: Math.floor(Math.random() * 100000) + 50000,
  }));

  const accountSummary: AccountSummary[] = accountingData?.accountSummary || [
    { account: t("adminTxAccounting.accounts.txFees"), debit: 0, credit: 4250000, balance: 4250000, type: t("adminTxAccounting.types.asset") },
    { account: t("adminTxAccounting.accounts.bridgeFees"), debit: 0, credit: 1580000, balance: 1580000, type: t("adminTxAccounting.types.asset") },
    { account: t("adminTxAccounting.accounts.dexFees"), debit: 0, credit: 890000, balance: 890000, type: t("adminTxAccounting.types.asset") },
    { account: t("adminTxAccounting.accounts.validatorRewards"), debit: 2850000, credit: 0, balance: -2850000, type: t("adminTxAccounting.types.liability") },
    { account: t("adminTxAccounting.accounts.stakingRewards"), debit: 1920000, credit: 0, balance: -1920000, type: t("adminTxAccounting.types.liability") },
    { account: t("adminTxAccounting.accounts.tokenBurn"), debit: 1520000, credit: 0, balance: -1520000, type: t("adminTxAccounting.types.equity") },
    { account: t("adminTxAccounting.accounts.operations"), debit: 750000, credit: 0, balance: -750000, type: t("adminTxAccounting.types.expense") },
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
      case "posted": return <Badge variant="default">{t("adminTxAccounting.status.posted")}</Badge>;
      case "pending": return <Badge variant="secondary">{t("adminTxAccounting.status.pending")}</Badge>;
      case "reconciled": return <Badge className="bg-green-500">{t("adminTxAccounting.status.reconciled")}</Badge>;
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

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminTxAccounting.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminTxAccounting.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-accounting">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminTxAccounting.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="tx-accounting-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-accounting-title">
              <Calculator className="h-8 w-8" />
              {t("adminTxAccounting.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-accounting-description">
              {t("adminTxAccounting.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32" data-testid="select-date-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("adminTxAccounting.timeRanges.7d")}</SelectItem>
                <SelectItem value="30d">{t("adminTxAccounting.timeRanges.30d")}</SelectItem>
                <SelectItem value="90d">{t("adminTxAccounting.timeRanges.90d")}</SelectItem>
                <SelectItem value="1y">{t("adminTxAccounting.timeRanges.1y")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-accounting">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTxAccounting.refresh")}
            </Button>
            <Button variant="outline" data-testid="button-reconcile">
              <CheckCircle className="h-4 w-4 mr-2" />
              {t("adminTxAccounting.reconcile")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-accounting">
              <Download className="h-4 w-4 mr-2" />
              {t("adminTxAccounting.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-credits">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTxAccounting.stats.totalCredits")}</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-total-credits">
                    ${(totalCredits / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-total-debits">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTxAccounting.stats.totalDebits")}</p>
                  <p className="text-2xl font-bold text-red-500" data-testid="text-total-debits">
                    ${(totalDebits / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-net-balance">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTxAccounting.stats.netBalance")}</p>
                  <p className="text-2xl font-bold" data-testid="text-net-balance">
                    ${((totalCredits - totalDebits) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-pending-count">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTxAccounting.stats.pending")}</p>
                  <p className="text-2xl font-bold" data-testid="text-pending-count">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-accounting">
            <TabsTrigger value="ledger" data-testid="tab-ledger">{t("adminTxAccounting.tabs.ledger")}</TabsTrigger>
            <TabsTrigger value="accounts" data-testid="tab-accounts">{t("adminTxAccounting.tabs.accounts")}</TabsTrigger>
            <TabsTrigger value="volume" data-testid="tab-volume">{t("adminTxAccounting.tabs.volume")}</TabsTrigger>
            <TabsTrigger value="reconciliation" data-testid="tab-reconciliation">{t("adminTxAccounting.tabs.reconciliation")}</TabsTrigger>
          </TabsList>

          <TabsContent value="ledger" className="space-y-6">
            <Card data-testid="card-transaction-ledger">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>{t("adminTxAccounting.ledger.title")}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("adminTxAccounting.ledger.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-ledger"
                      />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-32" data-testid="select-type">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("adminTxAccounting.ledger.allTypes")}</SelectItem>
                        <SelectItem value="fee">{t("adminTxAccounting.ledger.fees")}</SelectItem>
                        <SelectItem value="reward">{t("adminTxAccounting.ledger.rewards")}</SelectItem>
                        <SelectItem value="burn">{t("adminTxAccounting.ledger.burns")}</SelectItem>
                        <SelectItem value="bridge">{t("adminTxAccounting.ledger.bridge")}</SelectItem>
                        <SelectItem value="transfer">{t("adminTxAccounting.ledger.transfer")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminTxAccounting.table.id")}</TableHead>
                      <TableHead>{t("adminTxAccounting.table.txHash")}</TableHead>
                      <TableHead>{t("adminTxAccounting.table.type")}</TableHead>
                      <TableHead>{t("adminTxAccounting.table.account")}</TableHead>
                      <TableHead className="text-right">{t("adminTxAccounting.table.debit")}</TableHead>
                      <TableHead className="text-right">{t("adminTxAccounting.table.credit")}</TableHead>
                      <TableHead>{t("adminTxAccounting.table.reference")}</TableHead>
                      <TableHead>{t("adminTxAccounting.table.timestamp")}</TableHead>
                      <TableHead>{t("adminTxAccounting.table.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry, index) => (
                      <TableRow key={entry.id} data-testid={`ledger-row-${index}`}>
                        <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.txHash}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(entry.type)}>
                            {t(`adminTxAccounting.entryTypes.${entry.type}`)}
                          </Badge>
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
            <Card data-testid="card-account-summary">
              <CardHeader>
                <CardTitle>{t("adminTxAccounting.accounts.title")}</CardTitle>
                <CardDescription>{t("adminTxAccounting.accounts.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminTxAccounting.accounts.account")}</TableHead>
                      <TableHead>{t("adminTxAccounting.accounts.type")}</TableHead>
                      <TableHead className="text-right">{t("adminTxAccounting.accounts.totalDebit")}</TableHead>
                      <TableHead className="text-right">{t("adminTxAccounting.accounts.totalCredit")}</TableHead>
                      <TableHead className="text-right">{t("adminTxAccounting.accounts.balance")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountSummary.map((account, index) => (
                      <TableRow key={account.account} data-testid={`account-row-${index}`}>
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
                      <TableCell>{t("adminTxAccounting.accounts.total")}</TableCell>
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
            <Card data-testid="card-daily-volume">
              <CardHeader>
                <CardTitle>{t("adminTxAccounting.volume.title")}</CardTitle>
                <CardDescription>{t("adminTxAccounting.volume.description")}</CardDescription>
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
                      <Bar dataKey="fees" fill="hsl(var(--chart-1))" name={t("adminTxAccounting.volume.fees")} />
                      <Bar dataKey="rewards" fill="hsl(var(--chart-2))" name={t("adminTxAccounting.volume.rewards")} />
                      <Bar dataKey="burns" fill="hsl(var(--chart-3))" name={t("adminTxAccounting.volume.burns")} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-6">
            <Card data-testid="card-reconciliation-status">
              <CardHeader>
                <CardTitle>{t("adminTxAccounting.reconciliation.title")}</CardTitle>
                <CardDescription>{t("adminTxAccounting.reconciliation.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center" data-testid="status-reconciled">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-sm text-muted-foreground">{t("adminTxAccounting.reconciliation.reconciled")}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center" data-testid="status-pending">
                    <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold">1.2%</p>
                    <p className="text-sm text-muted-foreground">{t("adminTxAccounting.reconciliation.pending")}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center" data-testid="status-discrepancies">
                    <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                    <p className="text-2xl font-bold">0.3%</p>
                    <p className="text-sm text-muted-foreground">{t("adminTxAccounting.reconciliation.discrepancies")}</p>
                  </div>
                </div>
                <Button className="w-full" data-testid="button-run-reconciliation">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminTxAccounting.reconciliation.runFull")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
