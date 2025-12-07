import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Shield,
  ShieldCheck,
  ShieldPlus,
  Users,
  Settings,
  Database,
  Activity,
  Globe,
  Lock,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: Date;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolesData {
  roles: Role[];
  permissions: Permission[];
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

export default function AdminRoles() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleDetail, setShowRoleDetail] = useState(false);
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: rolesData, isLoading, error, refetch } = useQuery<RolesData>({
    queryKey: ["/api/admin/roles"],
    refetchInterval: 30000,
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: { name: string; description: string; permissions: string[] }) => {
      const response = await apiRequest("POST", "/api/admin/roles", roleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setShowCreateDialog(false);
      toast({
        title: t("adminRoles.roleCreated"),
        description: t("adminRoles.roleCreatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminRoles.createError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: string[] }) => {
      const response = await apiRequest("PATCH", `/api/admin/roles/${id}`, { permissions });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({
        title: t("adminRoles.roleUpdated"),
        description: t("adminRoles.roleUpdatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminRoles.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/roles/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setSelectedRole(null);
      toast({
        title: t("adminRoles.roleDeleted"),
        description: t("adminRoles.roleDeletedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminRoles.deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminRoles.refreshing"),
      description: t("adminRoles.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(rolesData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roles-permissions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminRoles.exported"),
      description: t("adminRoles.exportedDesc"),
    });
  }, [rolesData, toast, t]);

  const mockRoles: Role[] = useMemo(() => [
    { id: "1", name: "Super Admin", description: t("adminRoles.roleDescriptions.superAdmin"), permissions: ["all"], userCount: 2, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "2", name: "Admin", description: t("adminRoles.roleDescriptions.admin"), permissions: ["read", "write", "manage_users", "view_logs"], userCount: 1, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "3", name: "Operator", description: t("adminRoles.roleDescriptions.operator"), permissions: ["read", "write", "manage_validators", "manage_nodes", "pause_services"], userCount: 2, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "4", name: "Security", description: t("adminRoles.roleDescriptions.security"), permissions: ["read", "security_management", "view_logs", "manage_access"], userCount: 3, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "5", name: "Developer", description: t("adminRoles.roleDescriptions.developer"), permissions: ["read", "deploy_contracts", "use_testnet", "view_logs"], userCount: 3, isSystem: true, createdAt: new Date("2024-01-01") },
    { id: "6", name: "Viewer", description: t("adminRoles.roleDescriptions.viewer"), permissions: ["read"], userCount: 1, isSystem: true, createdAt: new Date("2024-01-01") },
  ], [t]);

  const mockPermissions: Permission[] = useMemo(() => [
    { id: "read", name: t("adminRoles.permissions.read"), description: t("adminRoles.permissionDescriptions.read"), category: "General" },
    { id: "write", name: t("adminRoles.permissions.write"), description: t("adminRoles.permissionDescriptions.write"), category: "General" },
    { id: "manage_users", name: t("adminRoles.permissions.manageUsers"), description: t("adminRoles.permissionDescriptions.manageUsers"), category: "User Management" },
    { id: "manage_roles", name: t("adminRoles.permissions.manageRoles"), description: t("adminRoles.permissionDescriptions.manageRoles"), category: "User Management" },
    { id: "manage_validators", name: t("adminRoles.permissions.manageValidators"), description: t("adminRoles.permissionDescriptions.manageValidators"), category: "Network" },
    { id: "manage_nodes", name: t("adminRoles.permissions.manageNodes"), description: t("adminRoles.permissionDescriptions.manageNodes"), category: "Network" },
    { id: "pause_services", name: t("adminRoles.permissions.pauseServices"), description: t("adminRoles.permissionDescriptions.pauseServices"), category: "Operations" },
    { id: "emergency_controls", name: t("adminRoles.permissions.emergencyControls"), description: t("adminRoles.permissionDescriptions.emergencyControls"), category: "Operations" },
    { id: "security_management", name: t("adminRoles.permissions.securityManagement"), description: t("adminRoles.permissionDescriptions.securityManagement"), category: "Security" },
    { id: "manage_access", name: t("adminRoles.permissions.manageAccess"), description: t("adminRoles.permissionDescriptions.manageAccess"), category: "Security" },
    { id: "view_logs", name: t("adminRoles.permissions.viewLogs"), description: t("adminRoles.permissionDescriptions.viewLogs"), category: "Monitoring" },
    { id: "deploy_contracts", name: t("adminRoles.permissions.deployContracts"), description: t("adminRoles.permissionDescriptions.deployContracts"), category: "Development" },
    { id: "use_testnet", name: t("adminRoles.permissions.useTestnet"), description: t("adminRoles.permissionDescriptions.useTestnet"), category: "Development" },
    { id: "all", name: t("adminRoles.permissions.all"), description: t("adminRoles.permissionDescriptions.all"), category: "System" },
  ], [t]);

  const roles = rolesData?.roles || mockRoles;
  const permissions = rolesData?.permissions || mockPermissions;

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(perm => {
      if (!groups[perm.category]) groups[perm.category] = [];
      groups[perm.category].push(perm);
    });
    return groups;
  }, [permissions]);

  const totalUsers = useMemo(() => roles.reduce((sum, r) => sum + r.userCount, 0), [roles]);

  const getRoleBadge = (name: string) => {
    switch (name) {
      case "Super Admin": return <Badge className="bg-purple-500/10 text-purple-500">{name}</Badge>;
      case "Admin": return <Badge className="bg-blue-500/10 text-blue-500">{name}</Badge>;
      case "Operator": return <Badge className="bg-green-500/10 text-green-500">{name}</Badge>;
      case "Security": return <Badge className="bg-red-500/10 text-red-500">{name}</Badge>;
      case "Developer": return <Badge className="bg-orange-500/10 text-orange-500">{name}</Badge>;
      case "Viewer": return <Badge variant="outline">{name}</Badge>;
      default: return <Badge variant="secondary">{name}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "General": return <Globe className="h-4 w-4" />;
      case "User Management": return <Users className="h-4 w-4" />;
      case "Network": return <Activity className="h-4 w-4" />;
      case "Operations": return <Settings className="h-4 w-4" />;
      case "Security": return <Shield className="h-4 w-4" />;
      case "Monitoring": return <Activity className="h-4 w-4" />;
      case "Development": return <Database className="h-4 w-4" />;
      case "System": return <Lock className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleDetailSections = (role: Role): DetailSection[] => {
    return [
      {
        title: t("adminRoles.detail.roleInfo"),
        icon: <Shield className="h-4 w-4" />,
        fields: [
          { label: t("common.name"), value: role.name },
          { label: t("common.description"), value: role.description },
          { 
            label: t("adminRoles.system"), 
            value: role.isSystem ? t("common.yes") : t("common.no"), 
            type: "badge" as const,
            badgeVariant: role.isSystem ? "secondary" : "outline"
          },
          { label: t("adminRoles.metrics.totalUsers"), value: role.userCount },
        ],
      },
      {
        title: t("adminRoles.detail.permissions"),
        icon: <Lock className="h-4 w-4" />,
        fields: role.permissions.map((perm) => ({
          label: perm,
          value: permissions.find(p => p.id === perm)?.name || perm,
          type: "badge" as const,
          badgeVariant: "secondary" as const,
        })),
      },
    ];
  };

  const confirmDelete = useCallback((roleId: string) => {
    setPendingDeleteId(roleId);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteId) {
      await deleteRoleMutation.mutateAsync(pendingDeleteId);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, deleteRoleMutation]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="roles-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminRoles.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminRoles.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminRoles.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="roles-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-roles-title">
              <ShieldCheck className="h-8 w-8" />
              {t("adminRoles.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-roles-subtitle">
              {t("adminRoles.subtitle")} | {i18n.language === 'ko' ? 'Configure roles and permissions for admin accounts' : '역할 및 권한 관리'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminRoles.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminRoles.refresh")}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-role">
              <ShieldPlus className="h-4 w-4 mr-2" />
              {t("adminRoles.createRole")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={ShieldCheck}
            label={t("adminRoles.metrics.totalRoles")}
            value={roles.length}
            change="Enterprise RBAC system"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-total-roles"
          />
          <MetricCard
            icon={Lock}
            label={t("adminRoles.metrics.systemRoles")}
            value={roles.filter(r => r.isSystem).length}
            change="Immutable core roles"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-purple-500/10"
            iconColor="text-purple-500"
            testId="metric-system-roles"
          />
          <MetricCard
            icon={Users}
            label={t("adminRoles.metrics.totalUsers")}
            value={totalUsers}
            change="All roles assigned for launch"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-total-users"
          />
          <MetricCard
            icon={Shield}
            label={t("adminRoles.metrics.totalPermissions")}
            value={permissions.length}
            change="Granular access control"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-orange-500/10"
            iconColor="text-orange-500"
            testId="metric-total-permissions"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-roles-list">
            <CardHeader>
              <CardTitle>{t("adminRoles.rolesTitle")}</CardTitle>
              <CardDescription>{t("adminRoles.rolesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-4 rounded-lg border cursor-pointer hover-elevate ${selectedRole?.id === role.id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setSelectedRole(role)}
                      data-testid={`role-card-${role.id}`}
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div>
                          {getRoleBadge(role.name)}
                          {role.isSystem && (
                            <Badge variant="outline" className="ml-2 text-xs">{t("adminRoles.system")}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailRole(role);
                              setShowRoleDetail(true);
                            }}
                            data-testid={`button-view-role-${role.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {role.userCount}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {role.permissions.slice(0, 3).map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.permissions.length - 3} {t("adminRoles.more")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-permissions">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{t("adminRoles.permissionsTitle")}</span>
                {selectedRole && !selectedRole.isSystem && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" data-testid="button-edit-role">
                      <Edit className="h-4 w-4 mr-1" />
                      {t("adminRoles.edit")}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500"
                      onClick={() => confirmDelete(selectedRole.id)}
                      data-testid="button-delete-role"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t("adminRoles.delete")}
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {selectedRole ? `${t("adminRoles.permissionsFor")} ${selectedRole.name}` : t("adminRoles.selectRole")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRole ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(category)}
                          <h3 className="font-medium">{category}</h3>
                        </div>
                        <div className="space-y-2">
                          {perms.map((perm) => {
                            const hasPermission = selectedRole.permissions.includes("all") || selectedRole.permissions.includes(perm.id);
                            return (
                              <div
                                key={perm.id}
                                className={`flex items-center gap-3 p-2 rounded-lg ${hasPermission ? "bg-green-500/5" : "bg-muted/50"}`}
                                data-testid={`permission-${perm.id}`}
                              >
                                <Checkbox checked={hasPermission} disabled={selectedRole.isSystem} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{perm.name}</p>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <Shield className="h-12 w-12 mb-4 opacity-50" />
                  <p>{t("adminRoles.selectRoleToView")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldPlus className="h-5 w-5" />
                {t("adminRoles.createDialog.title")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">{t("adminRoles.createDialog.roleName")}</Label>
                  <Input id="roleName" placeholder={t("adminRoles.createDialog.roleNamePlaceholder")} data-testid="input-role-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDesc">{t("adminRoles.createDialog.description")}</Label>
                  <Input id="roleDesc" placeholder={t("adminRoles.createDialog.descriptionPlaceholder")} data-testid="input-role-desc" />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="mb-3 block">{t("adminRoles.createDialog.permissions")}</Label>
                <ScrollArea className="h-[300px] rounded border p-4">
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).filter(([cat]) => cat !== "System").map(([category, perms]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(category)}
                          <h3 className="font-medium text-sm">{category}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <Checkbox id={perm.id} data-testid={`checkbox-perm-${perm.id}`} />
                              <Label htmlFor={perm.id} className="text-sm font-normal cursor-pointer">
                                {perm.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-create-cancel">
                {t("adminRoles.createDialog.cancel")}
              </Button>
              <Button onClick={() => createRoleMutation.mutate({ name: "", description: "", permissions: [] })} disabled={createRoleMutation.isPending} data-testid="button-create-submit">
                {createRoleMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                {t("adminRoles.createDialog.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {detailRole && (
          <DetailSheet
            open={showRoleDetail}
            onOpenChange={setShowRoleDetail}
            title={detailRole.name}
            subtitle={detailRole.id}
            icon={<Shield className="h-5 w-5" />}
            sections={getRoleDetailSections(detailRole)}
          />
        )}

        <ConfirmationDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title={t("adminRoles.confirm.deleteTitle")}
          description={t("adminRoles.confirm.deleteDesc")}
          actionType="delete"
          onConfirm={handleConfirmDelete}
          isLoading={deleteRoleMutation.isPending}
          destructive={true}
          confirmText={t("common.delete")}
          cancelText={t("adminRoles.cancel")}
        />
      </div>
    </div>
  );
}
