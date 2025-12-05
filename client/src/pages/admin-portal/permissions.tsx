import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Shield,
  Key,
  Users,
  Lock,
  Search,
  RefreshCw,
  Save,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Database,
  Globe,
  Activity,
  AlertCircle,
  Download,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: "read" | "write" | "admin" | "super";
}

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

interface PermissionsData {
  permissionGroups: PermissionGroup[];
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

export default function Permissions() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPermissionDetail, setShowPermissionDetail] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const { data: permissionsData, isLoading, error, refetch } = useQuery<PermissionsData>({
    queryKey: ["/api/admin/permissions"],
    refetchInterval: 30000,
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions: { id: string; enabled: boolean }[]) => {
      const response = await apiRequest("POST", "/api/admin/permissions", { permissions });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/permissions"] });
      toast({
        title: t("adminPermissions.saveSuccess"),
        description: t("adminPermissions.saveSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminPermissions.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminPermissions.refreshing"),
      description: t("adminPermissions.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(permissionsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `permissions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminPermissions.exported"),
      description: t("adminPermissions.exportedDesc"),
    });
  }, [permissionsData, toast, t]);

  const mockPermissionGroups: PermissionGroup[] = useMemo(() => [
    {
      name: t("adminPermissions.categories.dashboardMonitoring"),
      permissions: [
        { id: "dash_view", name: t("adminPermissions.perm.viewDashboard"), description: t("adminPermissions.permDesc.viewDashboard"), category: "dashboard", level: "read" },
        { id: "dash_customize", name: t("adminPermissions.perm.customizeDashboard"), description: t("adminPermissions.permDesc.customizeDashboard"), category: "dashboard", level: "write" },
        { id: "metrics_view", name: t("adminPermissions.perm.viewMetrics"), description: t("adminPermissions.permDesc.viewMetrics"), category: "dashboard", level: "read" },
        { id: "alerts_manage", name: t("adminPermissions.perm.manageAlerts"), description: t("adminPermissions.permDesc.manageAlerts"), category: "dashboard", level: "write" },
      ],
    },
    {
      name: t("adminPermissions.categories.networkOperations"),
      permissions: [
        { id: "nodes_view", name: t("adminPermissions.perm.viewNodes"), description: t("adminPermissions.permDesc.viewNodes"), category: "network", level: "read" },
        { id: "nodes_manage", name: t("adminPermissions.perm.manageNodes"), description: t("adminPermissions.permDesc.manageNodes"), category: "network", level: "admin" },
        { id: "validators_view", name: t("adminPermissions.perm.viewValidators"), description: t("adminPermissions.permDesc.viewValidators"), category: "network", level: "read" },
        { id: "validators_manage", name: t("adminPermissions.perm.manageValidators"), description: t("adminPermissions.permDesc.manageValidators"), category: "network", level: "admin" },
        { id: "consensus_view", name: t("adminPermissions.perm.viewConsensus"), description: t("adminPermissions.permDesc.viewConsensus"), category: "network", level: "read" },
        { id: "shards_manage", name: t("adminPermissions.perm.manageShards"), description: t("adminPermissions.permDesc.manageShards"), category: "network", level: "super" },
      ],
    },
    {
      name: t("adminPermissions.categories.tokenEconomy"),
      permissions: [
        { id: "tokens_view", name: t("adminPermissions.perm.viewTokens"), description: t("adminPermissions.permDesc.viewTokens"), category: "token", level: "read" },
        { id: "tokens_create", name: t("adminPermissions.perm.createTokens"), description: t("adminPermissions.permDesc.createTokens"), category: "token", level: "admin" },
        { id: "burn_view", name: t("adminPermissions.perm.viewBurnStats"), description: t("adminPermissions.permDesc.viewBurnStats"), category: "token", level: "read" },
        { id: "burn_manage", name: t("adminPermissions.perm.manageBurns"), description: t("adminPermissions.permDesc.manageBurns"), category: "token", level: "super" },
        { id: "treasury_view", name: t("adminPermissions.perm.viewTreasury"), description: t("adminPermissions.permDesc.viewTreasury"), category: "token", level: "read" },
        { id: "treasury_manage", name: t("adminPermissions.perm.manageTreasury"), description: t("adminPermissions.permDesc.manageTreasury"), category: "token", level: "super" },
      ],
    },
    {
      name: t("adminPermissions.categories.securityAudit"),
      permissions: [
        { id: "security_view", name: t("adminPermissions.perm.viewSecurity"), description: t("adminPermissions.permDesc.viewSecurity"), category: "security", level: "read" },
        { id: "security_manage", name: t("adminPermissions.perm.manageSecurity"), description: t("adminPermissions.permDesc.manageSecurity"), category: "security", level: "admin" },
        { id: "audit_view", name: t("adminPermissions.perm.viewAuditLogs"), description: t("adminPermissions.permDesc.viewAuditLogs"), category: "security", level: "read" },
        { id: "access_manage", name: t("adminPermissions.perm.manageAccess"), description: t("adminPermissions.permDesc.manageAccess"), category: "security", level: "super" },
      ],
    },
    {
      name: t("adminPermissions.categories.userManagement"),
      permissions: [
        { id: "users_view", name: t("adminPermissions.perm.viewUsers"), description: t("adminPermissions.permDesc.viewUsers"), category: "users", level: "read" },
        { id: "users_create", name: t("adminPermissions.perm.createUsers"), description: t("adminPermissions.permDesc.createUsers"), category: "users", level: "admin" },
        { id: "users_edit", name: t("adminPermissions.perm.editUsers"), description: t("adminPermissions.permDesc.editUsers"), category: "users", level: "admin" },
        { id: "users_delete", name: t("adminPermissions.perm.deleteUsers"), description: t("adminPermissions.permDesc.deleteUsers"), category: "users", level: "super" },
        { id: "roles_manage", name: t("adminPermissions.perm.manageRoles"), description: t("adminPermissions.permDesc.manageRoles"), category: "users", level: "super" },
        { id: "permissions_manage", name: t("adminPermissions.perm.managePermissions"), description: t("adminPermissions.permDesc.managePermissions"), category: "users", level: "super" },
      ],
    },
  ], [t]);

  const permissionGroups = permissionsData?.permissionGroups || mockPermissionGroups;
  const allPermissions = permissionGroups.flatMap(g => g.permissions);

  const filteredPermissions = searchQuery
    ? allPermissions.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "read": return "bg-blue-500/10 text-blue-500";
      case "write": return "bg-green-500/10 text-green-500";
      case "admin": return "bg-yellow-500/10 text-yellow-500";
      case "super": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "dashboard": return <Activity className="h-4 w-4" />;
      case "network": return <Globe className="h-4 w-4" />;
      case "token": return <Database className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      case "users": return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPermissionDetailSections = (permission: Permission): DetailSection[] => [
    {
      title: t("adminPermissions.detail.permissionInfo"),
      fields: [
        { label: t("common.name"), value: permission.name },
        { label: t("common.description"), value: permission.description },
        { label: t("adminPermissions.matrix.category"), value: permission.category },
        { 
          label: t("adminPermissions.table.level"), 
          value: t(`adminPermissions.levels.${permission.level}`), 
          type: "badge" as const, 
          badgeColor: getLevelColor(permission.level) 
        },
      ],
    },
    {
      title: t("adminPermissions.detail.accessControl"),
      fields: [
        { label: t("common.status"), value: t("adminPermissions.active"), type: "status" as const },
        { label: t("adminPermissions.table.permission"), value: permission.id, type: "code" as const },
      ],
    },
  ];

  const confirmSave = useCallback(() => {
    setShowSaveConfirm(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    await updatePermissionsMutation.mutateAsync([]);
    setShowSaveConfirm(false);
  }, [updatePermissionsMutation]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="permissions-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminPermissions.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminPermissions.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminPermissions.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="permissions-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-permissions-title">
              <Key className="h-8 w-8" />
              {t("adminPermissions.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-permissions-subtitle">
              {t("adminPermissions.subtitle")} | {i18n.language === 'ko' ? 'Configure system permissions and access levels' : '권한 관리'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminPermissions.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminPermissions.refresh")}
            </Button>
            <Button onClick={confirmSave} disabled={updatePermissionsMutation.isPending} data-testid="button-save">
              {updatePermissionsMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t("adminPermissions.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Key}
            label={t("adminPermissions.metrics.totalPermissions")}
            value={allPermissions.length}
            change={`${t("adminPermissions.metrics.across")} ${permissionGroups.length} ${t("adminPermissions.metrics.categories")}`}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-total-permissions"
          />
          <MetricCard
            icon={Eye}
            label={t("adminPermissions.metrics.readPermissions")}
            value={allPermissions.filter(p => p.level === "read").length}
            change={t("adminPermissions.metrics.viewOnly")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-read-permissions"
          />
          <MetricCard
            icon={Shield}
            label={t("adminPermissions.metrics.adminPermissions")}
            value={allPermissions.filter(p => p.level === "admin").length}
            change={t("adminPermissions.metrics.administrativeAccess")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-yellow-500/10"
            iconColor="text-yellow-500"
            testId="metric-admin-permissions"
          />
          <MetricCard
            icon={Lock}
            label={t("adminPermissions.metrics.superPermissions")}
            value={allPermissions.filter(p => p.level === "super").length}
            change={t("adminPermissions.metrics.criticalOperations")}
            changeType="negative"
            isLoading={isLoading}
            bgColor="bg-red-500/10"
            iconColor="text-red-500"
            testId="metric-super-permissions"
          />
        </div>

        <Card data-testid="card-search">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminPermissions.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-permissions"
              />
            </div>
            {searchQuery && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("adminPermissions.found")} {filteredPermissions.length} {t("adminPermissions.permissions")}
                </p>
                {filteredPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`search-result-${permission.id}`}>
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(permission.category)}
                      <div>
                        <p className="font-medium">{permission.name}</p>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                    <Badge className={getLevelColor(permission.level)}>{t(`adminPermissions.levels.${permission.level}`)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            permissionGroups.map((group, groupIndex) => (
              <Card key={group.name} data-testid={`card-group-${groupIndex}`}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.permissions.length} {t("adminPermissions.permissions")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>{t("adminPermissions.table.permission")}</TableHead>
                        <TableHead>{t("adminPermissions.table.description")}</TableHead>
                        <TableHead>{t("adminPermissions.table.level")}</TableHead>
                        <TableHead>{t("adminPermissions.table.status")}</TableHead>
                        <TableHead className="w-20">{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.permissions.map((permission) => (
                        <TableRow key={permission.id} data-testid={`row-permission-${permission.id}`}>
                          <TableCell>
                            <Checkbox defaultChecked data-testid={`checkbox-${permission.id}`} />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(permission.category)}
                              {permission.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {permission.description}
                          </TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(permission.level)}>
                              {t(`adminPermissions.levels.${permission.level}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("adminPermissions.active")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPermission(permission);
                                setShowPermissionDetail(true);
                              }}
                              data-testid={`button-view-${permission.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card data-testid="card-permission-matrix">
          <CardHeader>
            <CardTitle>{t("adminPermissions.matrix.title")}</CardTitle>
            <CardDescription>{t("adminPermissions.matrix.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adminPermissions.matrix.category")}</TableHead>
                  <TableHead className="text-center">{t("adminPermissions.levels.read")}</TableHead>
                  <TableHead className="text-center">{t("adminPermissions.levels.write")}</TableHead>
                  <TableHead className="text-center">{t("adminPermissions.levels.admin")}</TableHead>
                  <TableHead className="text-center">{t("adminPermissions.levels.super")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionGroups.map((group) => (
                  <TableRow key={group.name} data-testid={`matrix-row-${group.name}`}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "read").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "write").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "admin").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.permissions.filter(p => p.level === "super").length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedPermission && (
        <DetailSheet
          open={showPermissionDetail}
          onOpenChange={setShowPermissionDetail}
          title={selectedPermission.name}
          subtitle={selectedPermission.id}
          icon={<Key className="h-5 w-5" />}
          sections={getPermissionDetailSections(selectedPermission)}
        />
      )}

      <ConfirmationDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title={t("adminPermissions.confirm.saveTitle")}
        description={t("adminPermissions.confirm.saveDesc")}
        onConfirm={handleConfirmSave}
        isLoading={updatePermissionsMutation.isPending}
        destructive={false}
        confirmText={t("common.save")}
        cancelText={t("adminPermissions.cancel")}
      />
    </div>
  );
}
