import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Eye,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface BudgetItem {
  id: string;
  category: string;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: "on-track" | "at-risk" | "over-budget";
  forecast: number;
}

interface BudgetRequest {
  id: string;
  title: string;
  department: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  requester: string;
}

interface BudgetData {
  budgetItems: BudgetItem[];
  budgetRequests: BudgetRequest[];
  monthlyBudgetData: { month: string; budget: number; actual: number }[];
  departmentAllocation: { name: string; value: number; color: string }[];
}

export default function BudgetManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("q4-2024");
  const [activeTab, setActiveTab] = useState("overview");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    department: "",
    amount: 0,
    justification: "",
  });
  const [showBudgetDetail, setShowBudgetDetail] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: budgetData, isLoading, error, refetch } = useQuery<BudgetData>({
    queryKey: ["/api/admin/budget"],
  });

  const createRequestMutation = useMutation({
    mutationFn: async (request: typeof newRequest) => {
      return apiRequest("POST", "/api/admin/budget/requests", request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/budget"] });
      setIsRequestDialogOpen(false);
      setNewRequest({ title: "", department: "", amount: 0, justification: "" });
      toast({
        title: t("adminBudget.requestCreated"),
        description: t("adminBudget.requestCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminBudget.error"),
        description: t("adminBudget.createError"),
        variant: "destructive",
      });
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/budget/requests/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/budget"] });
      toast({
        title: t("adminBudget.requestApproved"),
        description: t("adminBudget.requestApprovedDesc"),
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/budget/requests/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/budget"] });
      toast({
        title: t("adminBudget.requestRejected"),
        description: t("adminBudget.requestRejectedDesc"),
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/budget/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/budget"] });
      toast({
        title: t("adminBudget.budgetDeleted"),
        description: t("adminBudget.budgetDeletedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminBudget.error"),
        description: t("adminBudget.deleteError"),
        variant: "destructive",
      });
    },
  });

  const getBudgetDetailSections = (budget: BudgetItem): DetailSection[] => {
    const statusBadgeColor = budget.status === "on-track" 
      ? "bg-green-500" 
      : budget.status === "at-risk" 
        ? "bg-yellow-500" 
        : "bg-red-500";
    
    return [
      {
        title: t("adminBudget.detail.budgetInfo"),
        fields: [
          { label: t("adminBudget.table.category"), value: budget.category, type: "text" },
          { label: t("adminBudget.table.department"), value: budget.department, type: "text" },
          { label: t("adminBudget.table.status"), value: t(`adminBudget.status.${budget.status === "on-track" ? "onTrack" : budget.status === "at-risk" ? "atRisk" : "overBudget"}`), type: "badge", badgeColor: statusBadgeColor },
        ],
      },
      {
        title: t("adminBudget.detail.financial"),
        fields: [
          { label: t("adminBudget.table.allocated"), value: `$${(budget.allocated / 1000000).toFixed(2)}M`, type: "currency" },
          { label: t("adminBudget.table.spent"), value: `$${(budget.spent / 1000000).toFixed(2)}M`, type: "currency" },
          { label: t("adminBudget.table.remaining"), value: `$${(budget.remaining / 1000000).toFixed(2)}M`, type: "currency" },
          { label: t("adminBudget.forecast.projected"), value: `$${(budget.forecast / 1000000).toFixed(2)}M`, type: "currency" },
        ],
      },
    ];
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      deleteBudgetMutation.mutate(pendingDeleteId);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminBudget.refreshed"),
      description: t("adminBudget.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      period: selectedPeriod,
      budgetItems,
      budgetRequests,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-report-${selectedPeriod}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminBudget.exported"),
      description: t("adminBudget.exportedDesc"),
    });
  }, [selectedPeriod, toast, t]);

  const budgetItems: BudgetItem[] = budgetData?.budgetItems || [
    { id: "BUD-001", category: "Blockchain Infrastructure (100K TPS)", department: "Core Engineering", allocated: 150000000, spent: 148500000, remaining: 1500000, status: "on-track", forecast: 150000000 },
    { id: "BUD-002", category: "Triple-Band AI System", department: "AI Engineering", allocated: 50000000, spent: 48000000, remaining: 2000000, status: "on-track", forecast: 50000000 },
    { id: "BUD-003", category: "Multi-Chain Bridge v2.0", department: "Bridge Team", allocated: 25000000, spent: 24500000, remaining: 500000, status: "on-track", forecast: 25000000 },
    { id: "BUD-004", category: "Security & Audit (Quantum-Resistant)", department: "Security", allocated: 35000000, spent: 34000000, remaining: 1000000, status: "on-track", forecast: 35000000 },
    { id: "BUD-005", category: "Validator Network (156 Nodes)", department: "Network Ops", allocated: 20000000, spent: 19500000, remaining: 500000, status: "on-track", forecast: 20000000 },
    { id: "BUD-006", category: "DeFi Protocol Development", department: "DeFi Team", allocated: 30000000, spent: 28000000, remaining: 2000000, status: "on-track", forecast: 30000000 },
    { id: "BUD-007", category: "Legal & Compliance", department: "Legal", allocated: 15000000, spent: 14500000, remaining: 500000, status: "on-track", forecast: 15000000 },
    { id: "BUD-008", category: "Marketing & Community", department: "Marketing", allocated: 25000000, spent: 23000000, remaining: 2000000, status: "on-track", forecast: 25000000 },
  ];

  const budgetRequests: BudgetRequest[] = budgetData?.budgetRequests || [
    { id: "REQ-001", title: "Mainnet v8.0 Launch Infrastructure", department: "Core Engineering", amount: 5000000, status: "approved", requestDate: "2024-12-01", requester: "CTO Office" },
    { id: "REQ-002", title: "Security Audit - CertiK Final Review", department: "Security", amount: 2500000, status: "approved", requestDate: "2024-12-05", requester: "CISO" },
    { id: "REQ-003", title: "Q1 2025 Marketing Campaign", department: "Marketing", amount: 10000000, status: "pending", requestDate: "2024-12-07", requester: "CMO" },
    { id: "REQ-004", title: "AI Model Training - Grok 3 Fallback", department: "AI Engineering", amount: 3000000, status: "approved", requestDate: "2024-12-03", requester: "AI Director" },
  ];

  const monthlyBudgetData = budgetData?.monthlyBudgetData || [
    { month: "Oct 2024", budget: 100000000, actual: 95000000 },
    { month: "Nov 2024", budget: 120000000, actual: 115000000 },
    { month: "Dec 2024", budget: 130000000, actual: 128000000 },
  ];

  const departmentAllocation = budgetData?.departmentAllocation || [
    { name: "Core Engineering (100K TPS)", value: 43, color: "hsl(var(--chart-1))" },
    { name: "AI Systems (Triple-Band)", value: 14, color: "hsl(var(--chart-2))" },
    { name: "Security (Quantum-Resistant)", value: 10, color: "hsl(var(--chart-3))" },
    { name: "DeFi & Bridge", value: 16, color: "hsl(var(--chart-4))" },
    { name: "Network Ops (156 Validators)", value: 6, color: "hsl(var(--chart-5))" },
    { name: "Other (Legal, Marketing)", value: 11, color: "hsl(var(--muted))" },
  ];

  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const utilizationRate = ((totalSpent / totalAllocated) * 100).toFixed(1);
  const overBudgetCount = budgetItems.filter(item => item.status === "over-budget").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track": return <Badge className="bg-green-500">{t("adminBudget.status.onTrack")}</Badge>;
      case "at-risk": return <Badge className="bg-yellow-500">{t("adminBudget.status.atRisk")}</Badge>;
      case "over-budget": return <Badge className="bg-red-500">{t("adminBudget.status.overBudget")}</Badge>;
      case "pending": return <Badge variant="secondary">{t("adminBudget.status.pending")}</Badge>;
      case "approved": return <Badge className="bg-green-500">{t("adminBudget.status.approved")}</Badge>;
      case "rejected": return <Badge className="bg-red-500">{t("adminBudget.status.rejected")}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminBudget.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminBudget.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-budget">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminBudget.retry")}
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
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-32" />
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
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="budget-management-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-budget-title">
              <Briefcase className="h-8 w-8" />
              {t("adminBudget.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-budget-description">
              {t("adminBudget.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36" data-testid="select-period">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q4-2024">{t("adminBudget.periods.q4-2024")}</SelectItem>
                <SelectItem value="q3-2024">{t("adminBudget.periods.q3-2024")}</SelectItem>
                <SelectItem value="q2-2024">{t("adminBudget.periods.q2-2024")}</SelectItem>
                <SelectItem value="2024">{t("adminBudget.periods.fy2024")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-budget">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminBudget.refresh")}
            </Button>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-request">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminBudget.newRequest")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("adminBudget.dialog.createTitle")}</DialogTitle>
                  <DialogDescription>{t("adminBudget.dialog.createDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminBudget.dialog.title")}</Label>
                    <Input 
                      placeholder={t("adminBudget.dialog.titlePlaceholder")}
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      data-testid="input-request-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminBudget.dialog.department")}</Label>
                    <Select
                      value={newRequest.department}
                      onValueChange={(v) => setNewRequest({ ...newRequest, department: v })}
                    >
                      <SelectTrigger data-testid="select-request-department">
                        <SelectValue placeholder={t("adminBudget.dialog.selectDepartment")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">{t("adminBudget.departments.engineering")}</SelectItem>
                        <SelectItem value="marketing">{t("adminBudget.departments.marketing")}</SelectItem>
                        <SelectItem value="security">{t("adminBudget.departments.security")}</SelectItem>
                        <SelectItem value="operations">{t("adminBudget.departments.operations")}</SelectItem>
                        <SelectItem value="rd">{t("adminBudget.departments.rd")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminBudget.dialog.amount")}</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={newRequest.amount}
                      onChange={(e) => setNewRequest({ ...newRequest, amount: parseFloat(e.target.value) })}
                      data-testid="input-request-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminBudget.dialog.justification")}</Label>
                    <Input 
                      placeholder={t("adminBudget.dialog.justificationPlaceholder")}
                      value={newRequest.justification}
                      onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
                      data-testid="input-request-justification"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)} data-testid="button-cancel-request">
                    {t("adminBudget.dialog.cancel")}
                  </Button>
                  <Button 
                    onClick={() => createRequestMutation.mutate(newRequest)}
                    disabled={createRequestMutation.isPending}
                    data-testid="button-submit-request"
                  >
                    {t("adminBudget.dialog.submit")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-budget">
              <Download className="h-4 w-4 mr-2" />
              {t("adminBudget.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-budget">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminBudget.stats.totalBudget")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-budget">${(totalAllocated / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-spent">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminBudget.stats.spent")}</p>
                  <p className="text-2xl font-bold" data-testid="text-spent">${(totalSpent / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-utilization">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminBudget.stats.utilization")}</p>
                  <p className="text-2xl font-bold" data-testid="text-utilization">{utilizationRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-over-budget">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminBudget.stats.overBudget")}</p>
                  <p className="text-2xl font-bold" data-testid="text-over-budget">{overBudgetCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-budget">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminBudget.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">{t("adminBudget.tabs.categories")}</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">{t("adminBudget.tabs.requests")}</TabsTrigger>
            <TabsTrigger value="forecast" data-testid="tab-forecast">{t("adminBudget.tabs.forecast")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" data-testid="card-budget-actual">
                <CardHeader>
                  <CardTitle>{t("adminBudget.charts.budgetActual")}</CardTitle>
                  <CardDescription>{t("adminBudget.charts.budgetActualDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyBudgetData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
                        />
                        <Legend />
                        <Bar dataKey="budget" fill="hsl(var(--chart-1))" name={t("adminBudget.charts.budget")} />
                        <Bar dataKey="actual" fill="hsl(var(--chart-2))" name={t("adminBudget.charts.actual")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-department-allocation">
                <CardHeader>
                  <CardTitle>{t("adminBudget.charts.departmentAllocation")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={departmentAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {departmentAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {departmentAllocation.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between" data-testid={`allocation-item-${index}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card data-testid="card-budget-categories">
              <CardHeader>
                <CardTitle>{t("adminBudget.categories.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminBudget.table.category")}</TableHead>
                      <TableHead>{t("adminBudget.table.department")}</TableHead>
                      <TableHead className="text-right">{t("adminBudget.table.allocated")}</TableHead>
                      <TableHead className="text-right">{t("adminBudget.table.spent")}</TableHead>
                      <TableHead className="text-right">{t("adminBudget.table.remaining")}</TableHead>
                      <TableHead>{t("adminBudget.table.utilization")}</TableHead>
                      <TableHead>{t("adminBudget.table.status")}</TableHead>
                      <TableHead className="text-right">{t("adminBudget.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetItems.map((item, index) => (
                      <TableRow key={item.id} data-testid={`budget-row-${index}`}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell className="text-right">${(item.allocated / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className="text-right">${(item.spent / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className={`text-right ${item.remaining < 0 ? "text-red-500" : "text-green-500"}`}>
                          ${(item.remaining / 1000000).toFixed(2)}M
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress 
                              value={Math.min((item.spent / item.allocated) * 100, 100)} 
                              className={item.status === "over-budget" ? "bg-red-200" : ""}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedBudget(item);
                                setShowBudgetDetail(true);
                              }}
                              data-testid={`button-view-budget-${index}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-edit-budget-${index}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                setPendingDeleteId(item.id);
                                setShowDeleteConfirm(true);
                              }}
                              data-testid={`button-delete-budget-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
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

          <TabsContent value="requests" className="space-y-6">
            <Card data-testid="card-budget-requests">
              <CardHeader>
                <CardTitle>{t("adminBudget.requests.title")}</CardTitle>
                <CardDescription>{t("adminBudget.requests.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminBudget.requests.id")}</TableHead>
                      <TableHead>{t("adminBudget.requests.titleCol")}</TableHead>
                      <TableHead>{t("adminBudget.requests.department")}</TableHead>
                      <TableHead>{t("adminBudget.requests.requester")}</TableHead>
                      <TableHead className="text-right">{t("adminBudget.requests.amount")}</TableHead>
                      <TableHead>{t("adminBudget.requests.date")}</TableHead>
                      <TableHead>{t("adminBudget.requests.status")}</TableHead>
                      <TableHead className="text-right">{t("adminBudget.requests.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetRequests.map((request, index) => (
                      <TableRow key={request.id} data-testid={`request-row-${index}`}>
                        <TableCell className="font-mono">{request.id}</TableCell>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{request.requester}</TableCell>
                        <TableCell className="text-right">${(request.amount / 1000).toFixed(0)}K</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" && (
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-green-500"
                                onClick={() => approveRequestMutation.mutate(request.id)}
                                data-testid={`button-approve-${index}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500"
                                onClick={() => rejectRequestMutation.mutate(request.id)}
                                data-testid={`button-reject-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <Card data-testid="card-budget-forecast">
              <CardHeader>
                <CardTitle>{t("adminBudget.forecast.title")}</CardTitle>
                <CardDescription>{t("adminBudget.forecast.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetItems.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg" data-testid={`forecast-item-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          {item.forecast > item.allocated ? (
                            <ArrowUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-green-500" />
                          )}
                          <span className={item.forecast > item.allocated ? "text-red-500" : "text-green-500"}>
                            ${(item.forecast / 1000000).toFixed(2)}M {t("adminBudget.forecast.projected")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{t("adminBudget.forecast.allocated")}: ${(item.allocated / 1000000).toFixed(2)}M</span>
                        <span>{t("adminBudget.forecast.spent")}: ${(item.spent / 1000000).toFixed(2)}M</span>
                        <span>{t("adminBudget.forecast.variance")}: {((item.forecast / item.allocated - 1) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedBudget && (
          <DetailSheet
            open={showBudgetDetail}
            onOpenChange={setShowBudgetDetail}
            title={selectedBudget.category}
            subtitle={selectedBudget.id}
            icon={<Briefcase className="h-5 w-5" />}
            sections={getBudgetDetailSections(selectedBudget)}
          />
        )}

        <ConfirmationDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title={t("adminBudget.confirm.deleteTitle")}
          description={t("adminBudget.confirm.deleteDesc")}
          actionType="delete"
          onConfirm={confirmDelete}
          isLoading={deleteBudgetMutation.isPending}
          destructive={true}
        />
      </div>
    </div>
  );
}
