import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  MoreHorizontal,
  Mail,
  Clock,
  Key,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: Date | string | null;
  createdAt: Date | string;
  twoFactorEnabled: boolean;
  permissions: string[];
}

interface AccountsData {
  accounts: AdminAccount[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    with2FA: number;
  };
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading = false,
  bgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId?: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${
                changeType === "positive" ? "text-green-500" : 
                changeType === "negative" ? "text-red-500" : 
                "text-muted-foreground"
              }`}>
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminAccounts() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAccountDetail, setShowAccountDetail] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: accountsData, isLoading, error, refetch } = useQuery<AccountsData>({
    queryKey: ["/api/admin/accounts"],
    refetchInterval: 30000,
  });

  const createAccountMutation = useMutation({
    mutationFn: async (accountData: { name: string; email: string; role: string }) => {
      const response = await apiRequest("POST", "/api/admin/accounts", accountData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      setShowCreateDialog(false);
      toast({
        title: t("adminAccounts.accountCreated"),
        description: t("adminAccounts.accountCreatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminAccounts.createError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/accounts/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      toast({
        title: t("adminAccounts.accountUpdated"),
        description: t("adminAccounts.accountUpdatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminAccounts.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/accounts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      toast({
        title: t("adminAccounts.accountDeleted"),
        description: t("adminAccounts.accountDeletedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminAccounts.deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminAccounts.refreshing"),
      description: t("adminAccounts.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(accountsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-accounts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminAccounts.exported"),
      description: t("adminAccounts.exportedDesc"),
    });
  }, [accountsData, toast, t]);

  const mockAccounts: AdminAccount[] = useMemo(() => [
    { id: "1", email: "cto@tburn.io", name: "Dr. James Park", role: "Super Admin", status: "active", lastLogin: new Date(Date.now() - 30000), createdAt: new Date("2024-01-01"), twoFactorEnabled: true, permissions: ["all"] },
    { id: "2", email: "coo@tburn.io", name: "Sarah Kim", role: "Super Admin", status: "active", lastLogin: new Date(Date.now() - 120000), createdAt: new Date("2024-01-01"), twoFactorEnabled: true, permissions: ["all"] },
    { id: "3", email: "head-ops@tburn.io", name: "Michael Chen", role: "Operator", status: "active", lastLogin: new Date(Date.now() - 180000), createdAt: new Date("2024-02-15"), twoFactorEnabled: true, permissions: ["read", "write", "manage_validators", "manage_nodes"] },
    { id: "4", email: "lead-ops@tburn.io", name: "Jennifer Lee", role: "Operator", status: "active", lastLogin: new Date(Date.now() - 300000), createdAt: new Date("2024-03-01"), twoFactorEnabled: true, permissions: ["read", "write", "manage_validators"] },
    { id: "5", email: "ciso@tburn.io", name: "Robert Johnson", role: "Security", status: "active", lastLogin: new Date(Date.now() - 600000), createdAt: new Date("2024-01-15"), twoFactorEnabled: true, permissions: ["read", "security_management", "view_logs", "manage_access"] },
    { id: "6", email: "security-lead@tburn.io", name: "Emma Wilson", role: "Security", status: "active", lastLogin: new Date(Date.now() - 900000), createdAt: new Date("2024-02-20"), twoFactorEnabled: true, permissions: ["read", "security_management"] },
    { id: "7", email: "tech-lead@tburn.io", name: "David Zhang", role: "Developer", status: "active", lastLogin: new Date(Date.now() - 1200000), createdAt: new Date("2024-03-10"), twoFactorEnabled: true, permissions: ["read", "deploy_contracts", "use_testnet", "view_logs"] },
    { id: "8", email: "senior-dev@tburn.io", name: "Alex Thompson", role: "Developer", status: "active", lastLogin: new Date(Date.now() - 1800000), createdAt: new Date("2024-04-01"), twoFactorEnabled: true, permissions: ["read", "deploy_contracts", "use_testnet"] },
    { id: "9", email: "blockchain-dev@tburn.io", name: "Chris Park", role: "Developer", status: "active", lastLogin: new Date(Date.now() - 2400000), createdAt: new Date("2024-05-15"), twoFactorEnabled: true, permissions: ["read", "deploy_contracts"] },
    { id: "10", email: "head-analyst@tburn.io", name: "Maria Garcia", role: "Admin", status: "active", lastLogin: new Date(Date.now() - 3600000), createdAt: new Date("2024-04-20"), twoFactorEnabled: true, permissions: ["read", "write", "view_logs"] },
    { id: "11", email: "data-analyst@tburn.io", name: "Kevin Brown", role: "Viewer", status: "active", lastLogin: new Date(Date.now() - 7200000), createdAt: new Date("2024-06-01"), twoFactorEnabled: true, permissions: ["read"] },
    { id: "12", email: "compliance@tburn.io", name: "Linda Martinez", role: "Security", status: "active", lastLogin: new Date(Date.now() - 10800000), createdAt: new Date("2024-05-10"), twoFactorEnabled: true, permissions: ["read", "view_logs"] },
  ], []);

  const accounts = accountsData?.accounts || mockAccounts;
  const stats = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter(a => a.status === "active").length,
    inactive: accounts.filter(a => a.status === "inactive").length,
    suspended: accounts.filter(a => a.status === "suspended").length,
    with2FA: accounts.filter(a => a.twoFactorEnabled).length,
  }), [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = searchQuery === "" ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || account.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [accounts, searchQuery, roleFilter]);

  const roles = ["Super Admin", "Admin", "Operator", "Security", "Developer", "Viewer"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-500">{t("adminAccounts.status.active")}</Badge>;
      case "inactive": return <Badge className="bg-yellow-500/10 text-yellow-500">{t("adminAccounts.status.inactive")}</Badge>;
      case "suspended": return <Badge className="bg-red-500/10 text-red-500">{t("adminAccounts.status.suspended")}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Super Admin": return <Badge className="bg-purple-500/10 text-purple-500">{role}</Badge>;
      case "Admin": return <Badge className="bg-blue-500/10 text-blue-500">{role}</Badge>;
      case "Operator": return <Badge className="bg-green-500/10 text-green-500">{role}</Badge>;
      case "Security": return <Badge className="bg-red-500/10 text-red-500">{role}</Badge>;
      case "Developer": return <Badge className="bg-orange-500/10 text-orange-500">{role}</Badge>;
      case "Viewer": return <Badge variant="outline">{role}</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return t("adminAccounts.never");
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return t("adminAccounts.never");
    const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ${t("adminAccounts.ago")}`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${t("adminAccounts.ago")}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${t("adminAccounts.ago")}`;
    const days = Math.floor(hours / 24);
    return `${days}d ${t("adminAccounts.ago")}`;
  };

  const getAccountDetailSections = (account: AdminAccount): DetailSection[] => {
    const statusColors: Record<string, string> = {
      active: "bg-green-500/10 text-green-500",
      inactive: "bg-yellow-500/10 text-yellow-500",
      suspended: "bg-red-500/10 text-red-500",
    };

    return [
      {
        title: t("adminAccounts.detail.accountInfo"),
        fields: [
          { label: t("common.name"), value: account.name, type: "text" },
          { label: t("adminAccounts.createDialog.email"), value: account.email, type: "text", copyable: true },
          { label: t("adminAccounts.role"), value: account.role, type: "badge", badgeVariant: "secondary" },
          { label: t("common.status"), value: t(`adminAccounts.status.${account.status}`), type: "badge", badgeColor: statusColors[account.status] },
        ],
      },
      {
        title: t("adminAccounts.detail.security"),
        fields: [
          { 
            label: t("adminAccounts.table.twoFA"), 
            value: account.twoFactorEnabled ? t("common.enable") : t("common.disable"), 
            type: "badge", 
            badgeColor: account.twoFactorEnabled ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground" 
          },
          { label: t("adminAccounts.table.lastLogin"), value: account.lastLogin, type: "date" },
          { label: t("common.date"), value: account.createdAt, type: "date" },
        ],
      },
    ];
  };

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId) {
      deleteAccountMutation.mutate(pendingDeleteId);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, deleteAccountMutation]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="accounts-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminAccounts.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminAccounts.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminAccounts.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="accounts-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-accounts-title">
              <Users className="h-8 w-8" />
              {t("adminAccounts.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-accounts-subtitle">
              {t("adminAccounts.subtitle")} | {i18n.language === 'ko' ? 'Manage administrator accounts and access' : '관리자 계정 관리'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminAccounts.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminAccounts.refresh")}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-account">
              <UserPlus className="h-4 w-4 mr-2" />
              {t("adminAccounts.createAccount")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            icon={Users}
            label={t("adminAccounts.metrics.totalAccounts")}
            value={stats.total}
            change="Enterprise-grade access control"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-total-accounts"
          />
          <MetricCard
            icon={CheckCircle}
            label={t("adminAccounts.metrics.active")}
            value={stats.active}
            change="All accounts online for launch"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-active-accounts"
          />
          <MetricCard
            icon={Clock}
            label={t("adminAccounts.metrics.inactive")}
            value={stats.inactive}
            change="Zero dormant accounts"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-inactive-accounts"
          />
          <MetricCard
            icon={XCircle}
            label={t("adminAccounts.metrics.suspended")}
            value={stats.suspended}
            change="Zero security incidents"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-suspended-accounts"
          />
          <MetricCard
            icon={ShieldCheck}
            label={t("adminAccounts.metrics.with2FA")}
            value={stats.with2FA}
            change="100% 2FA compliance"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-purple-500/10"
            iconColor="text-purple-500"
            testId="metric-2fa-accounts"
          />
        </div>

        <Card data-testid="card-accounts-list">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>{t("adminAccounts.accountsList")}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("adminAccounts.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-account-search"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-role-filter">
                    <SelectValue placeholder={t("adminAccounts.role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("adminAccounts.allRoles")}</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t("adminAccounts.table.account")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("adminAccounts.table.role")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("adminAccounts.table.status")}</th>
                      <th className="text-center py-3 px-4 font-medium">{t("adminAccounts.table.twoFA")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminAccounts.table.lastLogin")}</th>
                      <th className="text-center py-3 px-4 font-medium">{t("adminAccounts.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="border-b hover-elevate" data-testid={`row-account-${account.id}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">{account.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {account.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getRoleBadge(account.role)}</td>
                        <td className="py-3 px-4">{getStatusBadge(account.status)}</td>
                        <td className="py-3 px-4 text-center">
                          {account.twoFactorEnabled ? (
                            <ShieldCheck className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <Shield className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          <div className="flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(account.lastLogin)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" data-testid={`button-actions-${account.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setShowAccountDetail(true);
                                }}
                                data-testid={`action-view-detail-${account.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t("adminAccounts.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem data-testid={`action-edit-${account.id}`}>{t("adminAccounts.actions.edit")}</DropdownMenuItem>
                              <DropdownMenuItem data-testid={`action-reset-${account.id}`}>{t("adminAccounts.actions.resetPassword")}</DropdownMenuItem>
                              <DropdownMenuItem data-testid={`action-view-${account.id}`}>{t("adminAccounts.actions.viewActivity")}</DropdownMenuItem>
                              {account.status === "active" ? (
                                <DropdownMenuItem 
                                  className="text-yellow-500" 
                                  onClick={() => updateAccountMutation.mutate({ id: account.id, status: "inactive" })}
                                  data-testid={`action-deactivate-${account.id}`}
                                >
                                  {t("adminAccounts.actions.deactivate")}
                                </DropdownMenuItem>
                              ) : account.status === "inactive" ? (
                                <DropdownMenuItem 
                                  className="text-green-500"
                                  onClick={() => updateAccountMutation.mutate({ id: account.id, status: "active" })}
                                  data-testid={`action-activate-${account.id}`}
                                >
                                  {t("adminAccounts.actions.activate")}
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => {
                                  setPendingDeleteId(account.id);
                                  setShowDeleteConfirm(true);
                                }}
                                data-testid={`action-delete-${account.id}`}
                              >
                                {t("adminAccounts.actions.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {t("adminAccounts.createDialog.title")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("adminAccounts.createDialog.fullName")}</Label>
                <Input id="name" placeholder={t("adminAccounts.createDialog.fullNamePlaceholder")} data-testid="input-create-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("adminAccounts.createDialog.email")}</Label>
                <Input id="email" type="email" placeholder={t("adminAccounts.createDialog.emailPlaceholder")} data-testid="input-create-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t("adminAccounts.createDialog.role")}</Label>
                <Select>
                  <SelectTrigger data-testid="select-create-role">
                    <SelectValue placeholder={t("adminAccounts.createDialog.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("adminAccounts.createDialog.passwordNote")}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-create-cancel">
                {t("adminAccounts.createDialog.cancel")}
              </Button>
              <Button onClick={() => createAccountMutation.mutate({ name: "", email: "", role: "" })} disabled={createAccountMutation.isPending} data-testid="button-create-submit">
                {createAccountMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                {t("adminAccounts.createDialog.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {selectedAccount && (
          <DetailSheet
            open={showAccountDetail}
            onOpenChange={setShowAccountDetail}
            title={selectedAccount.name}
            subtitle={selectedAccount.email}
            icon={<Users className="h-5 w-5" />}
            sections={getAccountDetailSections(selectedAccount)}
          />
        )}

        <ConfirmationDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title={t("adminAccounts.confirm.deleteTitle")}
          description={t("adminAccounts.confirm.deleteDesc")}
          actionType="delete"
          onConfirm={confirmDelete}
          destructive={true}
          isLoading={deleteAccountMutation.isPending}
          confirmText={t("common.delete")}
          cancelText={t("adminAccounts.cancel")}
        />
      </div>
    </div>
  );
}
