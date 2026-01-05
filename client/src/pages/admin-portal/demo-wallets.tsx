import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Wallet, Plus, RefreshCw, Eye, Trash2, Edit, Copy, 
  Users, Activity, BarChart3, TrendingUp, Clock, 
  CheckCircle2, AlertCircle, Ban, Key, Calendar
} from "lucide-react";

interface DemoWallet {
  id: number;
  walletId: string;
  address: string;
  walletType: string;
  label: string | null;
  balanceTburn: string;
  balanceEth: string;
  balanceUsdt: string;
  accessCode: string | null;
  expiresAt: string | null;
  isActive: boolean;
  dailyTransactionLimit: number;
  dailyTransactionsUsed: number;
  totalTransactions: number;
  totalVolumeUsdt: string | null;
  lastActivityAt: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface DemoWalletStats {
  totalWallets: number;
  activeWallets: number;
  totalTransactions: number;
  byType: Record<string, number>;
}

const WALLET_TYPES = [
  { value: 'vc', label: 'VC Investor', color: 'bg-emerald-500' },
  { value: 'developer', label: 'Developer', color: 'bg-blue-500' },
  { value: 'partner', label: 'Partner', color: 'bg-purple-500' },
  { value: 'enterprise', label: 'Enterprise', color: 'bg-amber-500' },
  { value: 'demo', label: 'Demo', color: 'bg-slate-500' },
];

const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const formatBalance = (balance: string) => {
  const num = parseFloat(balance || '0');
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function AdminDemoWallets() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wallets");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<DemoWallet | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    walletType: 'vc',
    label: '',
    balanceTburn: '1000000',
    balanceEth: '10',
    balanceUsdt: '50000',
    accessCode: '',
    expiresAt: '',
    dailyTransactionLimit: 1000,
    notes: '',
  });

  const { data: wallets, isLoading: walletsLoading, refetch } = useQuery<DemoWallet[]>({
    queryKey: ['/api/demo-wallets', typeFilter],
    queryFn: async () => {
      const url = typeFilter === 'all' 
        ? '/api/demo-wallets' 
        : `/api/demo-wallets?type=${typeFilter}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch wallets');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DemoWalletStats>({
    queryKey: ['/api/demo-wallets/stats'],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/demo-wallets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/demo-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/demo-wallets/stats'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Demo wallet created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ walletId, data }: { walletId: string; data: Partial<DemoWallet> }) => {
      return apiRequest(`/api/demo-wallets/${walletId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/demo-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/demo-wallets/stats'] });
      setSelectedWallet(null);
      toast({ title: "Success", description: "Wallet updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (walletId: string) => {
      return apiRequest(`/api/demo-wallets/${walletId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/demo-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/demo-wallets/stats'] });
      toast({ title: "Success", description: "Wallet deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      walletType: 'vc',
      label: '',
      balanceTburn: '1000000',
      balanceEth: '10',
      balanceUsdt: '50000',
      accessCode: '',
      expiresAt: '',
      dailyTransactionLimit: 1000,
      notes: '',
    });
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: "Refreshed", description: "Data updated" });
  }, [refetch, toast]);

  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Access code copied to clipboard" });
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "Copied", description: "Address copied to clipboard" });
  };

  const generateAccessCode = () => {
    const code = `TBURN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    setFormData(prev => ({ ...prev, accessCode: code }));
  };

  const handleToggleActive = (wallet: DemoWallet) => {
    updateMutation.mutate({
      walletId: wallet.walletId,
      data: { isActive: !wallet.isActive },
    });
  };

  const filteredWallets = wallets?.filter(w => 
    typeFilter === 'all' || w.walletType === typeFilter
  ) || [];

  const getTypeConfig = (type: string) => {
    return WALLET_TYPES.find(t => t.value === type) || WALLET_TYPES[4];
  };

  return (
    <div className="min-h-screen bg-background p-6" data-testid="admin-demo-wallets-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="page-title">Demo Wallet Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage enterprise demo wallets for VCs, developers, and partners
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-create-wallet">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Demo Wallet</DialogTitle>
                  <DialogDescription>
                    Create a new demo wallet for VC investors or developers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Wallet Type</Label>
                    <Select
                      value={formData.walletType}
                      onValueChange={(v) => setFormData(p => ({ ...p, walletType: v }))}
                    >
                      <SelectTrigger data-testid="select-wallet-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WALLET_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label / Name</Label>
                    <Input
                      value={formData.label}
                      onChange={(e) => setFormData(p => ({ ...p, label: e.target.value }))}
                      placeholder="e.g., Sequoia Capital Demo"
                      data-testid="input-label"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>TBURN Balance</Label>
                      <Input
                        type="number"
                        value={formData.balanceTburn}
                        onChange={(e) => setFormData(p => ({ ...p, balanceTburn: e.target.value }))}
                        data-testid="input-balance-tburn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ETH Balance</Label>
                      <Input
                        type="number"
                        value={formData.balanceEth}
                        onChange={(e) => setFormData(p => ({ ...p, balanceEth: e.target.value }))}
                        data-testid="input-balance-eth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>USDT Balance</Label>
                      <Input
                        type="number"
                        value={formData.balanceUsdt}
                        onChange={(e) => setFormData(p => ({ ...p, balanceUsdt: e.target.value }))}
                        data-testid="input-balance-usdt"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Access Code</Label>
                      <Button variant="ghost" size="sm" onClick={generateAccessCode} data-testid="button-generate-code">
                        <Key className="h-3 w-3 mr-1" /> Generate
                      </Button>
                    </div>
                    <Input
                      value={formData.accessCode}
                      onChange={(e) => setFormData(p => ({ ...p, accessCode: e.target.value }))}
                      placeholder="TBURN-XXXX-XXXX"
                      data-testid="input-access-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData(p => ({ ...p, expiresAt: e.target.value }))}
                      data-testid="input-expires-at"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Transaction Limit</Label>
                    <Input
                      type="number"
                      value={formData.dailyTransactionLimit}
                      onChange={(e) => setFormData(p => ({ ...p, dailyTransactionLimit: parseInt(e.target.value) || 1000 }))}
                      data-testid="input-daily-limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Internal notes about this wallet..."
                      data-testid="input-notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createMutation.mutate(formData)}
                    disabled={createMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Wallet'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid="stat-total-wallets">
                  {stats?.totalWallets || 0}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-emerald-500" data-testid="stat-active-wallets">
                  {stats?.activeWallets || 0}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-blue-500" data-testid="stat-total-transactions">
                  {formatNumber(stats?.totalTransactions || 0)}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">By Type</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex flex-wrap gap-1" data-testid="stat-by-type">
                  {Object.entries(stats?.byType || {}).map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Demo Wallets</CardTitle>
                <CardDescription>Manage all demo wallets and their access</CardDescription>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-type">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {WALLET_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {walletsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredWallets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No demo wallets found</p>
                  <p className="text-sm mt-2">Create your first demo wallet to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balances</TableHead>
                      <TableHead>Access Code</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWallets.map((wallet) => {
                      const typeConfig = getTypeConfig(wallet.walletType);
                      const isExpired = wallet.expiresAt && new Date(wallet.expiresAt) < new Date();
                      
                      return (
                        <TableRow key={wallet.walletId} data-testid={`row-wallet-${wallet.walletId}`}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{wallet.label || 'Unnamed Wallet'}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>{shortenAddress(wallet.address)}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-4 w-4"
                                  onClick={() => handleCopyAddress(wallet.address)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${typeConfig.color} text-white`}>
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              <div>{formatBalance(wallet.balanceTburn)} TBURN</div>
                              <div className="text-muted-foreground">{formatBalance(wallet.balanceEth)} ETH</div>
                              <div className="text-muted-foreground">${formatBalance(wallet.balanceUsdt)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {wallet.accessCode ? (
                              <div className="flex items-center gap-1">
                                <code className="text-xs bg-muted px-2 py-1 rounded">{wallet.accessCode}</code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleCopyAccessCode(wallet.accessCode!)}
                                  data-testid={`button-copy-code-${wallet.walletId}`}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No code</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              <div>{wallet.dailyTransactionsUsed}/{wallet.dailyTransactionLimit} today</div>
                              <div className="text-muted-foreground">{wallet.totalTransactions} total</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {isExpired ? (
                                <Badge variant="destructive" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" /> Expired
                                </Badge>
                              ) : wallet.isActive ? (
                                <Badge variant="default" className="text-xs bg-emerald-500">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <Ban className="h-3 w-3 mr-1" /> Inactive
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Switch
                                checked={wallet.isActive}
                                onCheckedChange={() => handleToggleActive(wallet)}
                                data-testid={`switch-active-${wallet.walletId}`}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteMutation.mutate(wallet.walletId)}
                                data-testid={`button-delete-${wallet.walletId}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
