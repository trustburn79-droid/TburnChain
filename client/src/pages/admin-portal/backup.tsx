import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Database, HardDrive, Clock, Download, Upload, 
  RotateCcw, Trash2, CheckCircle, RefreshCw, AlertCircle, Loader2, AlertTriangle, Play
} from "lucide-react";

interface BackupStats {
  lastBackup: string;
  nextScheduled: string;
  totalSize: string;
  backupCount: number;
  autoBackup: boolean;
  retentionDays: number;
}

interface BackupItem {
  id: number;
  name: string;
  type: string;
  size: string;
  created: string;
  status: string;
  retention: string;
}

interface BackupJob {
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  enabled: boolean;
}

interface BackupData {
  stats: BackupStats;
  backups: BackupItem[];
  jobs: BackupJob[];
  isBackingUp: boolean;
  backupProgress: number;
}

export default function AdminBackup() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ type: "backup" | "restore" | "delete"; id?: number } | null>(null);

  const { data: backupData, isLoading, error, refetch } = useQuery<BackupData>({
    queryKey: ["/api/admin/backups"],
    refetchInterval: 10000,
  });

  const createBackupMutation = useMutation({
    mutationFn: async (type: "full" | "incremental") => {
      return apiRequest("POST", "/api/admin/backups/create", { type });
    },
    onSuccess: () => {
      toast({
        title: t("adminBackup.backupStarted"),
        description: t("adminBackup.backupStartedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      setConfirmDialog(null);
    },
    onError: () => {
      toast({
        title: t("adminBackup.backupError"),
        description: t("adminBackup.backupErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: number) => {
      return apiRequest("POST", `/api/admin/backups/restore/${backupId}`);
    },
    onSuccess: () => {
      toast({
        title: t("adminBackup.restoreStarted"),
        description: t("adminBackup.restoreStartedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      setConfirmDialog(null);
    },
    onError: () => {
      toast({
        title: t("adminBackup.restoreError"),
        description: t("adminBackup.restoreErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: number) => {
      return apiRequest("DELETE", `/api/admin/backups/${backupId}`);
    },
    onSuccess: () => {
      toast({
        title: t("adminBackup.backupDeleted"),
        description: t("adminBackup.backupDeletedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      setConfirmDialog(null);
    },
    onError: () => {
      toast({
        title: t("adminBackup.deleteError"),
        description: t("adminBackup.deleteErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const toggleJobMutation = useMutation({
    mutationFn: async (data: { name: string; enabled: boolean }) => {
      return apiRequest("PATCH", "/api/admin/backups/job", data);
    },
    onSuccess: () => {
      toast({
        title: t("adminBackup.jobUpdated"),
        description: t("adminBackup.jobUpdatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
    },
  });

  const backupStats = useMemo(() => {
    if (backupData?.stats) return backupData.stats;
    return {
      lastBackup: "2024-12-03 00:00 UTC",
      nextScheduled: "2024-12-04 00:00 UTC",
      totalSize: "1.2 TB",
      backupCount: 45,
      autoBackup: true,
      retentionDays: 30,
    };
  }, [backupData]);

  const recentBackups = useMemo(() => {
    if (backupData?.backups) return backupData.backups;
    return [
      { id: 1, name: t("adminBackup.fullBackupName"), type: "full", size: "245 GB", created: "2024-12-03 00:00", status: "completed", retention: "30 days" },
      { id: 2, name: t("adminBackup.incrementalName"), type: "incremental", size: "12 GB", created: "2024-12-02 12:00", status: "completed", retention: "7 days" },
      { id: 3, name: t("adminBackup.incrementalName"), type: "incremental", size: "8 GB", created: "2024-12-02 00:00", status: "completed", retention: "7 days" },
      { id: 4, name: t("adminBackup.fullBackupName"), type: "full", size: "240 GB", created: "2024-12-01 00:00", status: "completed", retention: "30 days" },
      { id: 5, name: t("adminBackup.incrementalName"), type: "incremental", size: "15 GB", created: "2024-11-30 12:00", status: "completed", retention: "7 days" },
    ];
  }, [backupData, t]);

  const backupJobs = useMemo(() => {
    if (backupData?.jobs) return backupData.jobs;
    return [
      { name: t("adminBackup.dailyFullBackup"), schedule: t("adminBackup.dailyAt0000"), lastRun: t("adminBackup.success"), nextRun: "2024-12-04 00:00", enabled: true },
      { name: t("adminBackup.hourlyIncremental"), schedule: t("adminBackup.every12Hours"), lastRun: t("adminBackup.success"), nextRun: "2024-12-03 12:00", enabled: true },
      { name: t("adminBackup.weeklyArchive"), schedule: t("adminBackup.sundayAt0200"), lastRun: t("adminBackup.success"), nextRun: "2024-12-08 02:00", enabled: true },
    ];
  }, [backupData, t]);

  const isBackingUp = backupData?.isBackingUp ?? false;
  const backupProgress = backupData?.backupProgress ?? 0;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminBackup.refreshSuccess"),
        description: t("adminBackup.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminBackup.refreshError"),
        description: t("adminBackup.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="backup-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminBackup.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminBackup.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminBackup.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="backup-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminBackup.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminBackup.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("adminBackup.refresh")}</TooltipContent>
              </Tooltip>
              <Dialog open={confirmDialog?.type === "backup"} onOpenChange={(open) => !open && setConfirmDialog(null)}>
                <DialogTrigger asChild>
                  <Button onClick={() => setConfirmDialog({ type: "backup" })} disabled={isBackingUp} data-testid="button-run-backup">
                    <Play className="w-4 h-4 mr-2" />
                    {t("adminBackup.runBackupNow")}
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-create-backup">
                  <DialogHeader>
                    <DialogTitle>{t("adminBackup.createNewBackup")}</DialogTitle>
                    <DialogDescription>{t("adminBackup.createNewBackupDesc")}</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      variant="outline" 
                      onClick={() => createBackupMutation.mutate("full")}
                      disabled={createBackupMutation.isPending}
                      data-testid="button-full-backup"
                    >
                      {createBackupMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                      {t("adminBackup.fullBackup")}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => createBackupMutation.mutate("incremental")}
                      disabled={createBackupMutation.isPending}
                      data-testid="button-incremental-backup"
                    >
                      {createBackupMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <HardDrive className="w-4 h-4 mr-2" />}
                      {t("adminBackup.incrementalBackup")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="backup-stats-grid">
            <Card data-testid="stat-last-backup">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">{t("adminBackup.lastBackup")}</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="text-lg font-bold" data-testid="stat-last-backup-value">{backupStats.lastBackup}</div>
                )}
              </CardContent>
            </Card>
            <Card data-testid="stat-total-backups">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">{t("adminBackup.totalBackups")}</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <div className="text-3xl font-bold" data-testid="stat-total-backups-value">{backupStats.backupCount}</div>
                )}
              </CardContent>
            </Card>
            <Card data-testid="stat-storage-used">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">{t("adminBackup.storageUsed")}</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="text-3xl font-bold" data-testid="stat-storage-used-value">{backupStats.totalSize}</div>
                )}
              </CardContent>
            </Card>
            <Card data-testid="stat-next-scheduled">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">{t("adminBackup.nextScheduled")}</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="text-lg font-bold" data-testid="stat-next-scheduled-value">{backupStats.nextScheduled}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {isBackingUp && (
            <Card className="border-blue-500/30 bg-blue-500/5" data-testid="card-backup-progress">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="font-medium">{t("adminBackup.backupInProgress")}</span>
                </div>
                <Progress value={backupProgress} className="h-2" />
                <div className="text-sm text-muted-foreground mt-2" data-testid="text-backup-progress">
                  {backupProgress}% {t("adminBackup.complete")}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="backups" className="space-y-4" data-testid="tabs-backup">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="backups" data-testid="tab-backups">{t("adminBackup.backups")}</TabsTrigger>
              <TabsTrigger value="schedule" data-testid="tab-schedule">{t("adminBackup.schedule")}</TabsTrigger>
              <TabsTrigger value="restore" data-testid="tab-restore">{t("adminBackup.restore")}</TabsTrigger>
            </TabsList>

            <TabsContent value="backups">
              <Card data-testid="card-recent-backups">
                <CardHeader>
                  <CardTitle>{t("adminBackup.recentBackups")}</CardTitle>
                  <CardDescription>{t("adminBackup.recentBackupsDesc")}</CardDescription>
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
                          <TableHead>{t("adminBackup.name")}</TableHead>
                          <TableHead>{t("adminBackup.type")}</TableHead>
                          <TableHead>{t("adminBackup.size")}</TableHead>
                          <TableHead>{t("adminBackup.created")}</TableHead>
                          <TableHead>{t("adminBackup.status")}</TableHead>
                          <TableHead>{t("adminBackup.retention")}</TableHead>
                          <TableHead>{t("adminBackup.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentBackups.map((backup, index) => (
                          <TableRow key={backup.id} data-testid={`backup-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`backup-name-${index}`}>{backup.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`backup-type-${index}`}>{backup.type}</Badge>
                            </TableCell>
                            <TableCell data-testid={`backup-size-${index}`}>{backup.size}</TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`backup-created-${index}`}>{backup.created}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-500" data-testid={`backup-status-${index}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {backup.status}
                              </Badge>
                            </TableCell>
                            <TableCell data-testid={`backup-retention-${index}`}>{backup.retention}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" data-testid={`button-download-${index}`}>
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminBackup.download")}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" data-testid={`button-restore-${index}`}>
                                      <Upload className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminBackup.restore")}</TooltipContent>
                                </Tooltip>
                                <Dialog open={confirmDialog?.type === "delete" && confirmDialog.id === backup.id} onOpenChange={(open) => !open && setConfirmDialog(null)}>
                                  <DialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setConfirmDialog({ type: "delete", id: backup.id })} data-testid={`button-delete-${index}`}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent data-testid={`dialog-delete-${backup.id}`}>
                                    <DialogHeader>
                                      <DialogTitle>{t("adminBackup.confirmDelete")}</DialogTitle>
                                      <DialogDescription>
                                        {t("adminBackup.confirmDeleteDesc", { name: backup.name })}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setConfirmDialog(null)} data-testid="button-cancel-delete">
                                        {t("adminBackup.cancel")}
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        onClick={() => deleteBackupMutation.mutate(backup.id)}
                                        disabled={deleteBackupMutation.isPending}
                                        data-testid="button-confirm-delete"
                                      >
                                        {deleteBackupMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        {t("adminBackup.delete")}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
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

            <TabsContent value="schedule">
              <Card data-testid="card-backup-schedule">
                <CardHeader>
                  <CardTitle>{t("adminBackup.backupSchedule")}</CardTitle>
                  <CardDescription>{t("adminBackup.backupScheduleDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminBackup.jobName")}</TableHead>
                          <TableHead>{t("adminBackup.schedule")}</TableHead>
                          <TableHead>{t("adminBackup.lastRun")}</TableHead>
                          <TableHead>{t("adminBackup.nextRun")}</TableHead>
                          <TableHead>{t("adminBackup.status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backupJobs.map((job, index) => (
                          <TableRow key={index} data-testid={`job-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`job-name-${index}`}>{job.name}</TableCell>
                            <TableCell data-testid={`job-schedule-${index}`}>{job.schedule}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-500" data-testid={`job-lastrun-${index}`}>{job.lastRun}</Badge>
                            </TableCell>
                            <TableCell data-testid={`job-nextrun-${index}`}>{job.nextRun}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={job.enabled}
                                onCheckedChange={(enabled) => toggleJobMutation.mutate({ name: job.name, enabled })}
                                disabled={toggleJobMutation.isPending}
                                data-testid={`job-switch-${index}`}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="restore">
              <Card data-testid="card-restore">
                <CardHeader>
                  <CardTitle>{t("adminBackup.restoreFromBackup")}</CardTitle>
                  <CardDescription>{t("adminBackup.restoreFromBackupDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4" data-testid="restore-warning">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">{t("adminBackup.warning")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("adminBackup.restoreWarning")}
                    </p>
                  </div>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminBackup.backup")}</TableHead>
                          <TableHead>{t("adminBackup.date")}</TableHead>
                          <TableHead>{t("adminBackup.size")}</TableHead>
                          <TableHead>{t("adminBackup.action")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentBackups.slice(0, 3).map((backup, index) => (
                          <TableRow key={backup.id} data-testid={`restore-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`restore-name-${index}`}>{backup.name}</TableCell>
                            <TableCell data-testid={`restore-date-${index}`}>{backup.created}</TableCell>
                            <TableCell data-testid={`restore-size-${index}`}>{backup.size}</TableCell>
                            <TableCell>
                              <Dialog open={confirmDialog?.type === "restore" && confirmDialog.id === backup.id} onOpenChange={(open) => !open && setConfirmDialog(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm" onClick={() => setConfirmDialog({ type: "restore", id: backup.id })} data-testid={`button-restore-action-${index}`}>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    {t("adminBackup.restore")}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent data-testid={`dialog-restore-${backup.id}`}>
                                  <DialogHeader>
                                    <DialogTitle>{t("adminBackup.confirmRestore")}</DialogTitle>
                                    <DialogDescription>
                                      {t("adminBackup.confirmRestoreDesc", { name: backup.name })}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setConfirmDialog(null)} data-testid="button-cancel-restore">
                                      {t("adminBackup.cancel")}
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => restoreBackupMutation.mutate(backup.id)}
                                      disabled={restoreBackupMutation.isPending}
                                      data-testid="button-confirm-restore"
                                    >
                                      {restoreBackupMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                      {t("adminBackup.confirmRestoreAction")}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
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
