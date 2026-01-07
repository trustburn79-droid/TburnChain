import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Shield, Users, Key, Lock, Plus, 
  CheckCircle, XCircle, AlertTriangle, Settings,
  RefreshCw, Eye, Trash2, Edit
} from "lucide-react";

interface Policy {
  id: number;
  nameKey: string;
  descKey: string;
  roles: string[];
  resources: string;
  status: string;
}

interface IpWhitelistEntry {
  ip: string;
  description: string;
  addedBy: string;
  addedAt: string;
}

interface AccessLog {
  user: string;
  action: string;
  ip: string;
  time: string;
  status: string;
}

interface Permission {
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface AccessData {
  policies: Policy[];
  ipWhitelist: IpWhitelistEntry[];
  recentAccess: AccessLog[];
  permissions: Permission[];
  stats: {
    activePolicies: number;
    activeSessions: number;
    ipWhitelistCount: number;
    blockedToday: number;
  };
}

export default function AdminAccessControl() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("policies");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("operator");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedIp, setSelectedIp] = useState<IpWhitelistEntry | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [ipToRemove, setIpToRemove] = useState<IpWhitelistEntry | null>(null);

  const { data, isLoading, error, refetch } = useQuery<AccessData>({
    queryKey: ["/api/enterprise/admin/access/policies"],
    refetchInterval: 30000,
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: Partial<Policy>) => {
      return apiRequest("POST", "/api/enterprise/admin/access/policies", policyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/access/policies"] });
      toast({
        title: t("adminAccess.createSuccess"),
        description: t("adminAccess.createSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminAccess.refreshError"),
        description: t("adminAccess.refreshErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, ...policyData }: Policy) => {
      return apiRequest("PATCH", `/api/enterprise/admin/access/policies/${id}`, policyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/access/policies"] });
      toast({
        title: t("adminAccess.updateSuccess"),
        description: t("adminAccess.updateSuccessDesc"),
      });
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/enterprise/admin/access/policies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/access/policies"] });
      setPolicyToDelete(null);
      toast({
        title: t("adminAccess.deleteSuccess"),
        description: t("adminAccess.deleteSuccessDesc"),
      });
    },
  });

  const removeIpMutation = useMutation({
    mutationFn: async (ip: string) => {
      return apiRequest("DELETE", `/api/enterprise/admin/access/ip-whitelist/${encodeURIComponent(ip)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/access/policies"] });
      setIpToRemove(null);
      toast({
        title: t("adminAccess.ipRemoveSuccess"),
        description: t("adminAccess.ipRemoveSuccessDesc"),
      });
    },
  });

  const confirmDeletePolicy = () => {
    if (policyToDelete) {
      deletePolicyMutation.mutate(policyToDelete.id);
    }
  };

  const confirmRemoveIp = () => {
    if (ipToRemove) {
      removeIpMutation.mutate(ipToRemove.ip);
    }
  };

  const policies = data?.policies ?? [];

  const ipWhitelist = data?.ipWhitelist ?? [];

  const recentAccess = data?.recentAccess ?? [];

  const permissions = data?.permissions ?? [];

  const stats = data?.stats ?? {
    activePolicies: 0,
    activeSessions: 0,
    ipWhitelistCount: 0,
    blockedToday: 0,
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminAccess.refreshSuccess"),
        description: t("adminAccess.dataUpdated"),
      });
    } catch {
      toast({
        title: t("adminAccess.refreshError"),
        description: t("adminAccess.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="access-control-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card data-testid="card-error">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Shield className="h-12 w-12 mx-auto text-destructive" />
                <h2 className="text-xl font-semibold">{t("adminAccess.error.title")}</h2>
                <p className="text-muted-foreground">{t("adminAccess.error.description")}</p>
                <Button onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminAccess.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="access-control-page">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminAccess.title")}</h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminAccess.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("adminAccess.refresh")}
            </Button>
            <Button data-testid="button-new-policy" disabled={createPolicyMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              {t("adminAccess.newPolicy")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="grid-stats">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} data-testid={`card-stat-skeleton-${i}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card data-testid="card-stat-policies">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{t("adminAccess.stats.activePolicies")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-stat-policies">{stats.activePolicies}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-sessions">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t("adminAccess.stats.activeSessions")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-stat-sessions">{stats.activeSessions}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-whitelist">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">{t("adminAccess.stats.ipWhitelist")}</span>
                  </div>
                  <div className="text-3xl font-bold" data-testid="text-stat-whitelist">{stats.ipWhitelistCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-blocked">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-muted-foreground">{t("adminAccess.stats.blockedToday")}</span>
                  </div>
                  <div className="text-3xl font-bold text-red-500" data-testid="text-stat-blocked">{stats.blockedToday}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" data-testid="tabs-access">
          <TabsList data-testid="tabslist-access">
            <TabsTrigger value="policies" data-testid="tab-policies">
              <Shield className="w-4 h-4 mr-2" />
              {t("adminAccess.tabs.policies")}
            </TabsTrigger>
            <TabsTrigger value="permissions" data-testid="tab-permissions">
              <Key className="w-4 h-4 mr-2" />
              {t("adminAccess.tabs.permissions")}
            </TabsTrigger>
            <TabsTrigger value="ip" data-testid="tab-ip">
              <Lock className="w-4 h-4 mr-2" />
              {t("adminAccess.tabs.ipWhitelist")}
            </TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">
              <Users className="w-4 h-4 mr-2" />
              {t("adminAccess.tabs.accessLog")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="policies" data-testid="tabcontent-policies">
            <Card data-testid="card-policies">
              <CardHeader>
                <CardTitle>{t("adminAccess.policies.title")}</CardTitle>
                <CardDescription>{t("adminAccess.policies.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" data-testid={`skeleton-policy-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-policies">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminAccess.policies.columns.policyName")}</TableHead>
                        <TableHead>{t("adminAccess.policies.columns.description")}</TableHead>
                        <TableHead>{t("adminAccess.policies.columns.roles")}</TableHead>
                        <TableHead>{t("adminAccess.policies.columns.resources")}</TableHead>
                        <TableHead>{t("adminAccess.policies.columns.status")}</TableHead>
                        <TableHead>{t("adminAccess.policies.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policies.map((policy) => (
                        <TableRow key={policy.id} data-testid={`row-policy-${policy.id}`}>
                          <TableCell className="font-medium" data-testid={`text-policy-name-${policy.id}`}>{t(`adminAccess.policies.items.${policy.nameKey}`)}</TableCell>
                          <TableCell className="text-muted-foreground">{t(`adminAccess.policies.items.${policy.descKey}`)}</TableCell>
                          <TableCell>
                            {(policy.roles || []).map((role, i) => (
                              <Badge key={i} variant="outline" className="mr-1" data-testid={`badge-role-${policy.id}-${i}`}>{role}</Badge>
                            ))}
                          </TableCell>
                          <TableCell>{policy.resources}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500" data-testid={`badge-status-${policy.id}`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t("adminAccess.policies.active")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                data-testid={`button-view-policy-${policy.id}`}
                                onClick={() => setSelectedPolicy(policy)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                data-testid={`button-edit-${policy.id}`}
                                disabled={updatePolicyMutation.isPending}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-red-500"
                                data-testid={`button-delete-${policy.id}`}
                                onClick={() => setPolicyToDelete(policy)}
                                disabled={deletePolicyMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" data-testid="tabcontent-permissions">
            <Card data-testid="card-permissions">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>{t("adminAccess.permissions.title")}</CardTitle>
                    <CardDescription>{t("adminAccess.permissions.description")}</CardDescription>
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole} data-testid="select-role">
                    <SelectTrigger className="w-40" data-testid="select-role-trigger">
                      <SelectValue placeholder={t("adminAccess.permissions.selectRole")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin" data-testid="select-role-admin">{t("adminAccess.permissions.roles.superAdmin")}</SelectItem>
                      <SelectItem value="operator" data-testid="select-role-operator">{t("adminAccess.permissions.roles.operator")}</SelectItem>
                      <SelectItem value="analyst" data-testid="select-role-analyst">{t("adminAccess.permissions.roles.analyst")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" data-testid={`skeleton-permission-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-permissions">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminAccess.permissions.columns.resource")}</TableHead>
                        <TableHead>{t("adminAccess.permissions.columns.view")}</TableHead>
                        <TableHead>{t("adminAccess.permissions.columns.create")}</TableHead>
                        <TableHead>{t("adminAccess.permissions.columns.edit")}</TableHead>
                        <TableHead>{t("adminAccess.permissions.columns.delete")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((perm, index) => (
                        <TableRow key={index} data-testid={`row-permission-${index}`}>
                          <TableCell className="font-medium" data-testid={`text-resource-${index}`}>{perm.resource}</TableCell>
                          <TableCell><Switch defaultChecked={perm.view} data-testid={`switch-view-${index}`} /></TableCell>
                          <TableCell><Switch defaultChecked={perm.create} data-testid={`switch-create-${index}`} /></TableCell>
                          <TableCell><Switch defaultChecked={perm.edit} data-testid={`switch-edit-${index}`} /></TableCell>
                          <TableCell><Switch defaultChecked={perm.delete} data-testid={`switch-delete-${index}`} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip" data-testid="tabcontent-ip">
            <Card data-testid="card-ip-whitelist">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>{t("adminAccess.ipWhitelist.title")}</CardTitle>
                    <CardDescription>{t("adminAccess.ipWhitelist.description")}</CardDescription>
                  </div>
                  <Button size="sm" data-testid="button-add-ip">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("adminAccess.ipWhitelist.addIp")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" data-testid={`skeleton-ip-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-ip-whitelist">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminAccess.ipWhitelist.columns.ipAddress")}</TableHead>
                        <TableHead>{t("adminAccess.ipWhitelist.columns.description")}</TableHead>
                        <TableHead>{t("adminAccess.ipWhitelist.columns.addedBy")}</TableHead>
                        <TableHead>{t("adminAccess.ipWhitelist.columns.addedAt")}</TableHead>
                        <TableHead>{t("adminAccess.ipWhitelist.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ipWhitelist.map((entry, index) => (
                        <TableRow key={index} data-testid={`row-ip-${index}`}>
                          <TableCell className="font-mono" data-testid={`text-ip-${index}`}>{entry.ip}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>{entry.addedBy}</TableCell>
                          <TableCell className="text-muted-foreground">{entry.addedAt}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                data-testid={`button-view-ip-${index}`}
                                onClick={() => setSelectedIp(entry)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-red-500" 
                                data-testid={`button-remove-ip-${index}`}
                                onClick={() => setIpToRemove(entry)}
                                disabled={removeIpMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4" data-testid="card-security-settings">
              <CardHeader>
                <CardTitle>{t("adminAccess.securitySettings.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" data-testid={`skeleton-setting-${i}`} />
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between" data-testid="setting-ip-whitelist">
                      <div>
                        <p className="font-medium">{t("adminAccess.securitySettings.enforceIpWhitelist")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminAccess.securitySettings.enforceIpWhitelistDesc")}</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-enforce-ip" />
                    </div>
                    <div className="flex items-center justify-between" data-testid="setting-geo-blocking">
                      <div>
                        <p className="font-medium">{t("adminAccess.securitySettings.geoBlocking")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminAccess.securitySettings.geoBlockingDesc")}</p>
                      </div>
                      <Switch data-testid="switch-geo-blocking" />
                    </div>
                    <div className="flex items-center justify-between" data-testid="setting-rate-limiting">
                      <div>
                        <p className="font-medium">{t("adminAccess.securitySettings.rateLimiting")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminAccess.securitySettings.rateLimitingDesc")}</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-rate-limiting" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" data-testid="tabcontent-activity">
            <Card data-testid="card-access-log">
              <CardHeader>
                <CardTitle>{t("adminAccess.accessLog.title")}</CardTitle>
                <CardDescription>{t("adminAccess.accessLog.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" data-testid={`skeleton-log-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-access-log">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminAccess.accessLog.columns.user")}</TableHead>
                        <TableHead>{t("adminAccess.accessLog.columns.action")}</TableHead>
                        <TableHead>{t("adminAccess.accessLog.columns.ipAddress")}</TableHead>
                        <TableHead>{t("adminAccess.accessLog.columns.time")}</TableHead>
                        <TableHead>{t("adminAccess.accessLog.columns.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAccess.map((entry, index) => (
                        <TableRow key={index} data-testid={`row-access-${index}`}>
                          <TableCell data-testid={`text-user-${index}`}>{entry.user}</TableCell>
                          <TableCell>{entry.action}</TableCell>
                          <TableCell className="font-mono">{entry.ip}</TableCell>
                          <TableCell className="text-muted-foreground">{entry.time}</TableCell>
                          <TableCell>
                            {entry.status === "success" ? (
                              <Badge className="bg-green-500" data-testid={`badge-status-success-${index}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t("adminAccess.accessLog.success")}
                              </Badge>
                            ) : (
                              <Badge variant="destructive" data-testid={`badge-status-blocked-${index}`}>
                                <XCircle className="w-3 h-3 mr-1" />
                                {t("adminAccess.accessLog.blocked")}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DetailSheet
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
        title={t("adminAccess.detail.policyTitle")}
        sections={selectedPolicy ? [
          {
            title: t("adminAccess.detail.overview"),
            fields: [
              { label: t("adminAccess.detail.policyId"), value: selectedPolicy.id.toString(), copyable: true },
              { label: t("adminAccess.detail.name"), value: t(`adminAccess.policies.items.${selectedPolicy.nameKey}`) },
              { label: t("adminAccess.detail.description"), value: t(`adminAccess.policies.items.${selectedPolicy.descKey}`) },
            ],
          },
          {
            title: t("adminAccess.detail.accessControl"),
            fields: [
              { label: t("adminAccess.detail.roles"), value: selectedPolicy.roles.join(", ") },
              { label: t("adminAccess.detail.resources"), value: selectedPolicy.resources, type: "code" as const },
              { label: t("adminAccess.detail.status"), value: t("adminAccess.policies.active"), type: "status" as const, statusVariant: "success" as const },
            ],
          },
        ] : []}
      />

      <DetailSheet
        open={!!selectedIp}
        onOpenChange={(open) => !open && setSelectedIp(null)}
        title={t("adminAccess.detail.ipTitle")}
        sections={selectedIp ? [
          {
            title: t("adminAccess.detail.overview"),
            fields: [
              { label: t("adminAccess.detail.ipAddress"), value: selectedIp.ip, copyable: true },
              { label: t("adminAccess.detail.description"), value: selectedIp.description },
            ],
          },
          {
            title: t("adminAccess.detail.metadata"),
            fields: [
              { label: t("adminAccess.detail.addedBy"), value: selectedIp.addedBy },
              { label: t("adminAccess.detail.addedAt"), value: selectedIp.addedAt },
            ],
          },
        ] : []}
      />

      <ConfirmationDialog
        open={!!policyToDelete}
        onOpenChange={(open) => !open && setPolicyToDelete(null)}
        title={t("adminAccess.confirmDelete.title")}
        description={t("adminAccess.confirmDelete.description", { 
          name: policyToDelete ? t(`adminAccess.policies.items.${policyToDelete.nameKey}`) : ""
        })}
        confirmText={t("adminAccess.confirmDelete.confirm")}
        onConfirm={confirmDeletePolicy}
        destructive={true}
        isLoading={deletePolicyMutation.isPending}
      />

      <ConfirmationDialog
        open={!!ipToRemove}
        onOpenChange={(open) => !open && setIpToRemove(null)}
        title={t("adminAccess.confirmRemoveIp.title")}
        description={t("adminAccess.confirmRemoveIp.description", { ip: ipToRemove?.ip })}
        confirmText={t("adminAccess.confirmRemoveIp.confirm")}
        onConfirm={confirmRemoveIp}
        destructive={true}
        isLoading={removeIpMutation.isPending}
      />
    </ScrollArea>
  );
}
