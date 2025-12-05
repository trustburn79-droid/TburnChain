import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Download, CheckCircle, Clock, AlertTriangle, 
  Play, RefreshCw, History, AlertCircle, Loader2, RotateCcw
} from "lucide-react";

interface CurrentVersion {
  version: string;
  released: string;
  status: string;
}

interface AvailableUpdate {
  version: string;
  type: string;
  releaseDate: string;
  status: string;
  changes: string;
}

interface UpdateHistory {
  version: string;
  date: string;
  status: string;
  duration: string;
  rollback: boolean;
}

interface NodeStatus {
  name: string;
  version: string;
  status: string;
}

interface UpdateData {
  currentVersion: CurrentVersion;
  availableUpdates: AvailableUpdate[];
  updateHistory: UpdateHistory[];
  nodes: NodeStatus[];
  isUpdating: boolean;
  updateProgress: number;
}

export default function AdminUpdates() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ type: "install" | "rollback"; version?: string } | null>(null);

  const { data: updateData, isLoading, error, refetch } = useQuery<UpdateData>({
    queryKey: ["/api/admin/updates"],
    refetchInterval: 30000,
  });

  const checkUpdatesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/updates/check");
    },
    onSuccess: () => {
      toast({
        title: t("adminUpdates.checkComplete"),
        description: t("adminUpdates.checkCompleteDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
    },
    onError: () => {
      toast({
        title: t("adminUpdates.checkError"),
        description: t("adminUpdates.checkErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const installUpdateMutation = useMutation({
    mutationFn: async (version: string) => {
      return apiRequest("POST", "/api/admin/updates/install", { version });
    },
    onSuccess: (_, version) => {
      toast({
        title: t("adminUpdates.installStarted"),
        description: t("adminUpdates.installStartedDesc", { version }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
      setConfirmDialog(null);
    },
    onError: () => {
      toast({
        title: t("adminUpdates.installError"),
        description: t("adminUpdates.installErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async (version: string) => {
      return apiRequest("POST", "/api/admin/updates/rollback", { version });
    },
    onSuccess: (_, version) => {
      toast({
        title: t("adminUpdates.rollbackStarted"),
        description: t("adminUpdates.rollbackStartedDesc", { version }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
      setConfirmDialog(null);
    },
    onError: () => {
      toast({
        title: t("adminUpdates.rollbackError"),
        description: t("adminUpdates.rollbackErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const updateNodeMutation = useMutation({
    mutationFn: async (nodeName: string) => {
      return apiRequest("POST", "/api/admin/updates/node", { nodeName });
    },
    onSuccess: (_, nodeName) => {
      toast({
        title: t("adminUpdates.nodeUpdateStarted"),
        description: t("adminUpdates.nodeUpdateStartedDesc", { node: nodeName }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
    },
  });

  const currentVersion = useMemo(() => {
    if (updateData?.currentVersion) return updateData.currentVersion;
    return {
      version: "4.0.0",
      released: "2024-12-01",
      status: "up-to-date",
    };
  }, [updateData]);

  const availableUpdates = useMemo(() => {
    if (updateData?.availableUpdates) return updateData.availableUpdates;
    return [
      { version: "4.0.1", type: "patch", releaseDate: "2024-12-05", status: "available", changes: t("adminUpdates.bugFixesAndSecurity") },
      { version: "4.1.0", type: "minor", releaseDate: "2024-12-15", status: "scheduled", changes: t("adminUpdates.newFeaturesAndImprovements") },
    ];
  }, [updateData, t]);

  const updateHistory = useMemo(() => {
    if (updateData?.updateHistory) return updateData.updateHistory;
    return [
      { version: "4.0.0", date: "2024-12-01", status: "success", duration: "45m", rollback: false },
      { version: "3.9.5", date: "2024-11-15", status: "success", duration: "30m", rollback: false },
      { version: "3.9.4", date: "2024-11-01", status: "success", duration: "25m", rollback: false },
      { version: "3.9.3", date: "2024-10-20", status: "rolled_back", duration: "20m", rollback: true },
      { version: "3.9.2", date: "2024-10-15", status: "success", duration: "35m", rollback: false },
    ];
  }, [updateData]);

  const nodes = useMemo(() => {
    if (updateData?.nodes) return updateData.nodes;
    return [
      { name: "Node 1", version: "4.0.0", status: "up-to-date" },
      { name: "Node 2", version: "4.0.0", status: "up-to-date" },
      { name: "Node 3", version: "3.9.5", status: "pending" },
      { name: "Node 4", version: "4.0.0", status: "up-to-date" },
      { name: "Node 5", version: "4.0.0", status: "up-to-date" },
    ];
  }, [updateData]);

  const isUpdating = updateData?.isUpdating ?? false;
  const updateProgress = updateData?.updateProgress ?? 0;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminUpdates.refreshSuccess"),
        description: t("adminUpdates.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminUpdates.refreshError"),
        description: t("adminUpdates.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="updates-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminUpdates.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminUpdates.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminUpdates.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="updates-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminUpdates.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminUpdates.subtitle")}</p>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("adminUpdates.refresh")}</TooltipContent>
              </Tooltip>
              <Button 
                variant="outline" 
                onClick={() => checkUpdatesMutation.mutate()}
                disabled={checkUpdatesMutation.isPending}
                data-testid="button-check-updates"
              >
                {checkUpdatesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {t("adminUpdates.checkForUpdates")}
              </Button>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10" data-testid="card-current-version">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-9 w-20 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("adminUpdates.currentVersion")}</div>
                    <div className="text-3xl font-bold" data-testid="text-current-version">v{currentVersion.version}</div>
                    <div className="text-sm text-muted-foreground">{t("adminUpdates.released")}: {currentVersion.released}</div>
                  </div>
                  <Badge className="bg-green-500" data-testid="badge-status">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t("adminUpdates.upToDate")}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {isUpdating && (
            <Card className="border-blue-500/30 bg-blue-500/5" data-testid="card-update-progress">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="font-medium">{t("adminUpdates.updateInProgress")}</span>
                </div>
                <Progress value={updateProgress} className="h-2" />
                <div className="text-sm text-muted-foreground mt-2" data-testid="text-update-progress">
                  {updateProgress}% {t("adminUpdates.complete")}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="available" className="space-y-4" data-testid="tabs-updates">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="available" data-testid="tab-available">{t("adminUpdates.availableUpdates")}</TabsTrigger>
              <TabsTrigger value="nodes" data-testid="tab-nodes">{t("adminUpdates.nodeStatus")}</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">{t("adminUpdates.updateHistory")}</TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              <Card data-testid="card-available-updates">
                <CardHeader>
                  <CardTitle>{t("adminUpdates.availableUpdates")}</CardTitle>
                  <CardDescription>{t("adminUpdates.availableUpdatesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableUpdates.map((update, index) => (
                        <div key={index} className="p-4 border rounded-lg" data-testid={`update-card-${index}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold" data-testid={`update-version-${index}`}>v{update.version}</span>
                              <Badge variant="outline" data-testid={`update-type-${index}`}>{update.type}</Badge>
                              <Badge variant={update.status === "available" ? "default" : "secondary"} data-testid={`update-status-${index}`}>
                                {update.status === "available" ? t("adminUpdates.available") : t("adminUpdates.scheduled")}
                              </Badge>
                            </div>
                            {update.status === "available" && (
                              <Dialog open={confirmDialog?.type === "install" && confirmDialog.version === update.version} onOpenChange={(open) => !open && setConfirmDialog(null)}>
                                <DialogTrigger asChild>
                                  <Button onClick={() => setConfirmDialog({ type: "install", version: update.version })} disabled={isUpdating} data-testid={`button-install-${index}`}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {t("adminUpdates.installUpdate")}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent data-testid={`dialog-install-${update.version}`}>
                                  <DialogHeader>
                                    <DialogTitle>{t("adminUpdates.confirmInstall")}</DialogTitle>
                                    <DialogDescription>
                                      {t("adminUpdates.confirmInstallDesc", { version: update.version })}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-500">
                                      <AlertTriangle className="w-4 h-4" />
                                      <span className="font-medium">{t("adminUpdates.warning")}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {t("adminUpdates.installWarning")}
                                    </p>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setConfirmDialog(null)} data-testid="button-cancel-install">
                                      {t("adminUpdates.cancel")}
                                    </Button>
                                    <Button 
                                      onClick={() => installUpdateMutation.mutate(update.version)}
                                      disabled={installUpdateMutation.isPending}
                                      data-testid="button-confirm-install"
                                    >
                                      {installUpdateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                      {t("adminUpdates.install")}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2" data-testid={`update-changes-${index}`}>{update.changes}</p>
                          <p className="text-xs text-muted-foreground" data-testid={`update-date-${index}`}>{t("adminUpdates.releaseDate")}: {update.releaseDate}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nodes">
              <Card data-testid="card-node-status">
                <CardHeader>
                  <CardTitle>{t("adminUpdates.nodeUpdateStatus")}</CardTitle>
                  <CardDescription>{t("adminUpdates.nodeUpdateStatusDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminUpdates.node")}</TableHead>
                          <TableHead>{t("adminUpdates.version")}</TableHead>
                          <TableHead>{t("adminUpdates.status")}</TableHead>
                          <TableHead>{t("adminUpdates.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nodes.map((node, index) => (
                          <TableRow key={index} data-testid={`node-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`node-name-${index}`}>{node.name}</TableCell>
                            <TableCell data-testid={`node-version-${index}`}>v{node.version}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={node.status === "up-to-date" ? "default" : "secondary"} 
                                className={node.status === "up-to-date" ? "bg-green-500" : ""}
                                data-testid={`node-status-${index}`}
                              >
                                {node.status === "up-to-date" ? (
                                  <><CheckCircle className="w-3 h-3 mr-1" /> {t("adminUpdates.upToDate")}</>
                                ) : (
                                  <><Clock className="w-3 h-3 mr-1" /> {t("adminUpdates.pending")}</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {node.status === "pending" && (
                                <Button 
                                  size="sm" 
                                  onClick={() => updateNodeMutation.mutate(node.name)}
                                  disabled={updateNodeMutation.isPending}
                                  data-testid={`button-update-node-${index}`}
                                >
                                  {updateNodeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                  {t("adminUpdates.updateNow")}
                                </Button>
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

            <TabsContent value="history">
              <Card data-testid="card-update-history">
                <CardHeader>
                  <CardTitle>{t("adminUpdates.updateHistory")}</CardTitle>
                  <CardDescription>{t("adminUpdates.updateHistoryDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminUpdates.version")}</TableHead>
                          <TableHead>{t("adminUpdates.date")}</TableHead>
                          <TableHead>{t("adminUpdates.duration")}</TableHead>
                          <TableHead>{t("adminUpdates.status")}</TableHead>
                          <TableHead>{t("adminUpdates.rollback")}</TableHead>
                          <TableHead>{t("adminUpdates.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {updateHistory.map((update, index) => (
                          <TableRow key={index} data-testid={`history-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`history-version-${index}`}>v{update.version}</TableCell>
                            <TableCell data-testid={`history-date-${index}`}>{update.date}</TableCell>
                            <TableCell data-testid={`history-duration-${index}`}>{update.duration}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={update.status === "success" ? "default" : "destructive"}
                                className={update.status === "success" ? "bg-green-500" : ""}
                                data-testid={`history-status-${index}`}
                              >
                                {update.status === "success" ? t("adminUpdates.success") : t("adminUpdates.rolledBack")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {update.rollback ? (
                                <Badge variant="outline" className="text-yellow-500" data-testid={`history-rollback-${index}`}>{t("adminUpdates.yes")}</Badge>
                              ) : (
                                <span className="text-muted-foreground" data-testid={`history-rollback-${index}`}>-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {index > 0 && update.status === "success" && (
                                <Dialog open={confirmDialog?.type === "rollback" && confirmDialog.version === update.version} onOpenChange={(open) => !open && setConfirmDialog(null)}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setConfirmDialog({ type: "rollback", version: update.version })}
                                      data-testid={`button-rollback-${index}`}
                                    >
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      {t("adminUpdates.rollbackTo")}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent data-testid={`dialog-rollback-${update.version}`}>
                                    <DialogHeader>
                                      <DialogTitle>{t("adminUpdates.confirmRollback")}</DialogTitle>
                                      <DialogDescription>
                                        {t("adminUpdates.confirmRollbackDesc", { version: update.version })}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                      <div className="flex items-center gap-2 text-red-500">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="font-medium">{t("adminUpdates.dangerZone")}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {t("adminUpdates.rollbackWarning")}
                                      </p>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setConfirmDialog(null)} data-testid="button-cancel-rollback">
                                        {t("adminUpdates.cancel")}
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        onClick={() => rollbackMutation.mutate(update.version)}
                                        disabled={rollbackMutation.isPending}
                                        data-testid="button-confirm-rollback"
                                      >
                                        {rollbackMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                                        {t("adminUpdates.confirmRollbackAction")}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
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
      </ScrollArea>
    </TooltipProvider>
  );
}
