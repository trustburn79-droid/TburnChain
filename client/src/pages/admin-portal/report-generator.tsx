import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  FileText, Download, Calendar, Clock, 
  Play, Pause, Trash2, Settings, Plus, RefreshCw, AlertCircle, Loader2, Eye
} from "lucide-react";

interface ReportTemplate {
  id: number;
  name: string;
  type: string;
  frequency: string;
  format: string;
}

interface ScheduledReport {
  id: number;
  name: string;
  nextRun: string;
  recipients: number;
  status: "active" | "paused";
}

interface RecentReport {
  id: number;
  name: string;
  generated: string;
  size: string;
  format: string;
}

interface ReportSection {
  id: string;
  label: string;
  checked: boolean;
}

interface ReportData {
  templates: ReportTemplate[];
  scheduledReports: ScheduledReport[];
  recentReports: RecentReport[];
}

export default function AdminReportGenerator() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportName, setReportName] = useState("");
  const [dateRange, setDateRange] = useState("7d");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [selectedSections, setSelectedSections] = useState<string[]>(["network", "transactions", "validators", "security"]);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState<RecentReport | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: reportData, isLoading, error, refetch } = useQuery<ReportData>({
    queryKey: ["/api/enterprise/admin/reports/templates"],
    refetchInterval: 60000,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: { name: string; dateRange: string; format: string; sections: string[] }) => {
      return apiRequest("POST", "/api/enterprise/admin/reports/generate", data);
    },
    onSuccess: () => {
      toast({
        title: t("adminReports.generateSuccess"),
        description: t("adminReports.generateSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/reports/templates"] });
    },
    onError: () => {
      toast({
        title: t("adminReports.generateError"),
        description: t("adminReports.generateErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: async (data: { id: number; status: "active" | "paused" }) => {
      return apiRequest("PATCH", `/api/enterprise/admin/reports/schedule/${data.id}`, { status: data.status });
    },
    onSuccess: () => {
      toast({
        title: t("adminReports.scheduleUpdated"),
        description: t("adminReports.scheduleUpdatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/reports/templates"] });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/enterprise/admin/reports/schedule/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("adminReports.scheduleDeleted"),
        description: t("adminReports.scheduleDeletedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/reports/templates"] });
    },
  });

  const reportTemplates = useMemo(() => {
    if (reportData?.templates) return reportData.templates;
    return [
      { id: 1, name: t("adminReports.networkPerformance"), type: "system", frequency: t("adminReports.daily"), format: "PDF" },
      { id: 2, name: t("adminReports.transactionSummary"), type: "analytics", frequency: t("adminReports.daily"), format: "Excel" },
      { id: 3, name: t("adminReports.userActivity"), type: "analytics", frequency: t("adminReports.weekly"), format: "PDF" },
      { id: 4, name: t("adminReports.securityAudit"), type: "security", frequency: t("adminReports.daily"), format: "PDF" },
      { id: 5, name: t("adminReports.financialStatement"), type: "finance", frequency: t("adminReports.weekly"), format: "Excel" },
      { id: 6, name: "Bridge Operations Summary", type: "operations", frequency: t("adminReports.daily"), format: "PDF" },
      { id: 7, name: "Validator Performance Report", type: "system", frequency: t("adminReports.daily"), format: "PDF" },
      { id: 8, name: "Compliance Status Report", type: "compliance", frequency: t("adminReports.weekly"), format: "PDF" },
    ];
  }, [reportData, t]);

  const scheduledReports = useMemo(() => {
    if (reportData?.scheduledReports) return reportData.scheduledReports;
    return [
      { id: 1, name: t("adminReports.dailyNetworkReport"), nextRun: "2024-12-08 00:00", recipients: 12, status: "active" as const },
      { id: 2, name: "Bridge Operations Daily", nextRun: "2024-12-08 06:00", recipients: 8, status: "active" as const },
      { id: 3, name: "Validator Health Report", nextRun: "2024-12-08 00:00", recipients: 6, status: "active" as const },
      { id: 4, name: t("adminReports.weeklyTxSummary"), nextRun: "2024-12-15 06:00", recipients: 15, status: "active" as const },
      { id: 5, name: "Security & Compliance Weekly", nextRun: "2024-12-15 00:00", recipients: 10, status: "active" as const },
    ];
  }, [reportData, t]);

  const recentReports = useMemo(() => {
    if (reportData?.recentReports) return reportData.recentReports;
    return [
      { id: 1, name: "Network Performance - Dec 7", generated: "2024-12-07 00:15", size: "4.8 MB", format: "PDF" },
      { id: 2, name: "Bridge Operations - Dec 7", generated: "2024-12-07 06:00", size: "3.2 MB", format: "PDF" },
      { id: 3, name: "Transaction Summary - Dec 7", generated: "2024-12-07 00:00", size: "8.5 MB", format: "Excel" },
      { id: 4, name: "Security Audit - Week 49", generated: "2024-12-06 00:00", size: "2.4 MB", format: "PDF" },
      { id: 5, name: "Validator Performance - Dec 6", generated: "2024-12-06 00:15", size: "3.8 MB", format: "PDF" },
    ];
  }, [reportData]);

  const reportSections: ReportSection[] = useMemo(() => [
    { id: "network", label: t("adminReports.sectionNetwork"), checked: selectedSections.includes("network") },
    { id: "transactions", label: t("adminReports.sectionTransactions"), checked: selectedSections.includes("transactions") },
    { id: "users", label: t("adminReports.sectionUsers"), checked: selectedSections.includes("users") },
    { id: "validators", label: t("adminReports.sectionValidators"), checked: selectedSections.includes("validators") },
    { id: "bridge", label: t("adminReports.sectionBridge"), checked: selectedSections.includes("bridge") },
    { id: "security", label: t("adminReports.sectionSecurity"), checked: selectedSections.includes("security") },
  ], [selectedSections, t]);

  const handleSectionToggle = useCallback((sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const handleGenerateReport = useCallback(() => {
    generateReportMutation.mutate({
      name: reportName || t("adminReports.customReport"),
      dateRange,
      format: reportFormat,
      sections: selectedSections,
    });
  }, [generateReportMutation, reportName, dateRange, reportFormat, selectedSections, t]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminReports.refreshSuccess"),
        description: t("adminReports.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminReports.refreshError"),
        description: t("adminReports.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const getReportDetailSections = useCallback((report: RecentReport): DetailSection[] => {
    return [
      {
        title: t("adminReports.detail.reportInfo"),
        fields: [
          { label: t("adminReports.reportName"), value: report.name },
          { label: t("adminReports.generated"), value: report.generated, type: "date" as const },
          { label: t("adminReports.size"), value: report.size },
          { label: t("adminReports.format"), value: report.format, type: "badge" as const },
        ],
      },
      {
        title: t("adminReports.detail.actions"),
        fields: [
          { label: t("adminReports.download"), value: t("adminReports.download") },
        ],
      },
    ];
  }, [t]);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId !== null) {
      deleteScheduleMutation.mutate(pendingDeleteId);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, deleteScheduleMutation]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="reports-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminReports.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminReports.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminReports.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="reports-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminReports.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminReports.subtitle")}</p>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("adminReports.refresh")}</TooltipContent>
              </Tooltip>
              <Button data-testid="button-new-report">
                <Plus className="w-4 h-4 mr-2" />
                {t("adminReports.newReport")}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="create" className="space-y-4" data-testid="tabs-reports">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="create" data-testid="tab-create">
                <FileText className="w-4 h-4 mr-2" />
                {t("adminReports.createReport")}
              </TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">
                <Settings className="w-4 h-4 mr-2" />
                {t("adminReports.templates")}
              </TabsTrigger>
              <TabsTrigger value="scheduled" data-testid="tab-scheduled">
                <Calendar className="w-4 h-4 mr-2" />
                {t("adminReports.scheduled")}
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <Clock className="w-4 h-4 mr-2" />
                {t("adminReports.history")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card data-testid="card-report-config">
                  <CardHeader>
                    <CardTitle>{t("adminReports.reportConfiguration")}</CardTitle>
                    <CardDescription>{t("adminReports.reportConfigurationDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>{t("adminReports.reportName")}</Label>
                          <Input 
                            placeholder={t("adminReports.reportNamePlaceholder")} 
                            value={reportName}
                            onChange={(e) => setReportName(e.target.value)}
                            data-testid="input-report-name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t("adminReports.dateRange")}</Label>
                            <Select value={dateRange} onValueChange={setDateRange}>
                              <SelectTrigger data-testid="select-date-range">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="24h">{t("adminReports.last24Hours")}</SelectItem>
                                <SelectItem value="7d">{t("adminReports.last7Days")}</SelectItem>
                                <SelectItem value="30d">{t("adminReports.last30Days")}</SelectItem>
                                <SelectItem value="custom">{t("adminReports.customRange")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adminReports.format")}</Label>
                            <Select value={reportFormat} onValueChange={setReportFormat}>
                              <SelectTrigger data-testid="select-format">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="excel">Excel</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="pt-4">
                          <Button 
                            className="w-full" 
                            onClick={handleGenerateReport}
                            disabled={generateReportMutation.isPending}
                            data-testid="button-generate"
                          >
                            {generateReportMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-2" />
                            )}
                            {generateReportMutation.isPending ? t("adminReports.generating") : t("adminReports.generateReport")}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-report-sections">
                  <CardHeader>
                    <CardTitle>{t("adminReports.reportSections")}</CardTitle>
                    <CardDescription>{t("adminReports.reportSectionsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : (
                      reportSections.map((section) => (
                        <div key={section.id} className="flex items-center space-x-2" data-testid={`section-${section.id}`}>
                          <Checkbox 
                            id={section.id} 
                            checked={selectedSections.includes(section.id)}
                            onCheckedChange={() => handleSectionToggle(section.id)}
                            data-testid={`checkbox-${section.id}`}
                          />
                          <label htmlFor={section.id} className="text-sm font-medium">
                            {section.label}
                          </label>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <Card data-testid="card-templates">
                <CardHeader>
                  <CardTitle>{t("adminReports.reportTemplates")}</CardTitle>
                  <CardDescription>{t("adminReports.reportTemplatesDesc")}</CardDescription>
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
                          <TableHead>{t("adminReports.templateName")}</TableHead>
                          <TableHead>{t("adminReports.type")}</TableHead>
                          <TableHead>{t("adminReports.defaultFrequency")}</TableHead>
                          <TableHead>{t("adminReports.format")}</TableHead>
                          <TableHead>{t("adminReports.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportTemplates.map((template, index) => (
                          <TableRow key={template.id} data-testid={`template-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`template-name-${index}`}>{template.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`template-type-${index}`}>{template.type}</Badge>
                            </TableCell>
                            <TableCell data-testid={`template-freq-${index}`}>{template.frequency}</TableCell>
                            <TableCell data-testid={`template-format-${index}`}>{template.format}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" data-testid={`button-use-${index}`}>{t("adminReports.use")}</Button>
                                <Button size="icon" variant="ghost" data-testid={`button-settings-${index}`}>
                                  <Settings className="w-4 h-4" />
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

            <TabsContent value="scheduled">
              <Card data-testid="card-scheduled">
                <CardHeader>
                  <CardTitle>{t("adminReports.scheduledReports")}</CardTitle>
                  <CardDescription>{t("adminReports.scheduledReportsDesc")}</CardDescription>
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
                          <TableHead>{t("adminReports.reportName")}</TableHead>
                          <TableHead>{t("adminReports.nextRun")}</TableHead>
                          <TableHead>{t("adminReports.recipients")}</TableHead>
                          <TableHead>{t("adminReports.status")}</TableHead>
                          <TableHead>{t("adminReports.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduledReports.map((report, index) => (
                          <TableRow key={report.id} data-testid={`scheduled-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`scheduled-name-${index}`}>{report.name}</TableCell>
                            <TableCell data-testid={`scheduled-next-${index}`}>{report.nextRun}</TableCell>
                            <TableCell data-testid={`scheduled-recipients-${index}`}>{report.recipients} {t("adminReports.recipients")}</TableCell>
                            <TableCell>
                              <Badge variant={report.status === "active" ? "default" : "secondary"} data-testid={`scheduled-status-${index}`}>
                                {report.status === "active" ? t("adminReports.active") : t("adminReports.paused")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost"
                                      onClick={() => toggleScheduleMutation.mutate({
                                        id: report.id,
                                        status: report.status === "active" ? "paused" : "active"
                                      })}
                                      disabled={toggleScheduleMutation.isPending}
                                      data-testid={`button-toggle-${index}`}
                                    >
                                      {report.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {report.status === "active" ? t("adminReports.pause") : t("adminReports.resume")}
                                  </TooltipContent>
                                </Tooltip>
                                <Button size="icon" variant="ghost" data-testid={`button-edit-${index}`}>
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="text-red-500"
                                      onClick={() => {
                                        setPendingDeleteId(report.id);
                                        setShowDeleteConfirm(true);
                                      }}
                                      disabled={deleteScheduleMutation.isPending}
                                      data-testid={`button-delete-${index}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminReports.delete")}</TooltipContent>
                                </Tooltip>
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

            <TabsContent value="history">
              <Card data-testid="card-history">
                <CardHeader>
                  <CardTitle>{t("adminReports.recentReports")}</CardTitle>
                  <CardDescription>{t("adminReports.recentReportsDesc")}</CardDescription>
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
                          <TableHead>{t("adminReports.reportName")}</TableHead>
                          <TableHead>{t("adminReports.generated")}</TableHead>
                          <TableHead>{t("adminReports.size")}</TableHead>
                          <TableHead>{t("adminReports.format")}</TableHead>
                          <TableHead>{t("adminReports.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentReports.map((report, index) => (
                          <TableRow key={report.id} data-testid={`history-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`history-name-${index}`}>{report.name}</TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`history-date-${index}`}>{report.generated}</TableCell>
                            <TableCell data-testid={`history-size-${index}`}>{report.size}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`history-format-${index}`}>{report.format}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedReport(report);
                                        setShowReportDetail(true);
                                      }}
                                      data-testid={`button-view-${index}`}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t("adminReports.view")}</TooltipContent>
                                </Tooltip>
                                <Button size="sm" variant="ghost" data-testid={`button-download-${index}`}>
                                  <Download className="w-4 h-4 mr-2" />
                                  {t("adminReports.download")}
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
          </Tabs>
        </div>
      </ScrollArea>

      {selectedReport && (
        <DetailSheet
          open={showReportDetail}
          onOpenChange={setShowReportDetail}
          title={selectedReport.name}
          icon={<FileText className="h-5 w-5" />}
          sections={getReportDetailSections(selectedReport)}
        />
      )}

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("adminReports.confirm.deleteTitle")}
        description={t("adminReports.confirm.deleteDesc")}
        actionType="delete"
        onConfirm={confirmDelete}
        isLoading={deleteScheduleMutation.isPending}
        destructive={true}
        confirmText={t("common.delete")}
        cancelText={t("adminReports.cancel")}
      />
    </TooltipProvider>
  );
}
