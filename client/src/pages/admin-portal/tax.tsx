import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  FileText,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Building2,
  Globe,
  FileCheck,
  FilePlus,
  Printer,
  AlertCircle,
  Eye,
} from "lucide-react";

interface TaxReport {
  id: string;
  type: string;
  period: string;
  jurisdiction: string;
  status: "filed" | "pending" | "draft" | "overdue";
  dueDate: string;
  amount: number;
  filedDate: string | null;
}

interface TaxLiability {
  jurisdiction: string;
  taxType: string;
  liability: number;
  paid: number;
  remaining: number;
  dueDate: string;
}

interface TaxCalendarEvent {
  date: string;
  event: string;
  status: "completed" | "upcoming";
}

interface TaxData {
  reports: TaxReport[];
  liabilities: TaxLiability[];
  calendar: TaxCalendarEvent[];
}

export default function TaxReporting() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2024");
  const [activeTab, setActiveTab] = useState("overview");
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [pendingReportType, setPendingReportType] = useState<string | null>(null);

  const { data: taxData, isLoading, error, refetch } = useQuery<TaxData>({
    queryKey: ["/api/enterprise/admin/tax"],
    refetchInterval: 60000,
    staleTime: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportType: string) => {
      return apiRequest("POST", "/api/enterprise/admin/tax/reports/generate", { reportType, year: selectedYear });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/tax"] });
      toast({
        title: t("adminTax.reportGenerated"),
        description: t("adminTax.reportGeneratedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminTax.error"),
        description: t("adminTax.generateError"),
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminTax.refreshed"),
      description: t("adminTax.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      year: selectedYear,
      reports: taxReports,
      liabilities: taxLiabilities,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-report-${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminTax.exported"),
      description: t("adminTax.exportedDesc"),
    });
  }, [selectedYear, toast, t]);

  const taxReports: TaxReport[] = taxData?.reports || [
    { id: "TAX-001", type: "Corporate Income Tax", period: "FY 2024", jurisdiction: "United States (Delaware)", status: "pending", dueDate: "2025-04-15", amount: 25000000, filedDate: null },
    { id: "TAX-002", type: "Digital Asset Transaction Tax", period: "Q4 2024", jurisdiction: "United States (Federal)", status: "pending", dueDate: "2025-01-31", amount: 8500000, filedDate: null },
    { id: "TAX-003", type: "Corporate Tax", period: "FY 2024", jurisdiction: "European Union (Ireland)", status: "draft", dueDate: "2025-03-31", amount: 12000000, filedDate: null },
    { id: "TAX-004", type: "VAT on Services", period: "FY 2024", jurisdiction: "European Union (Ireland)", status: "draft", dueDate: "2025-01-31", amount: 3500000, filedDate: null },
    { id: "TAX-005", type: "Corporate Tax", period: "FY 2024", jurisdiction: "Singapore (Foundation)", status: "pending", dueDate: "2025-11-30", amount: 2800000, filedDate: null },
    { id: "TAX-006", type: "Withholding Tax", period: "FY 2024", jurisdiction: "Switzerland (Technology Hub)", status: "filed", dueDate: "2024-12-31", amount: 1500000, filedDate: "2024-12-05" },
  ];

  const taxLiabilities: TaxLiability[] = taxData?.liabilities || [
    { jurisdiction: "United States (Delaware)", taxType: "Corporate & Digital Asset Tax", liability: 33500000, paid: 0, remaining: 33500000, dueDate: "2025-04-15" },
    { jurisdiction: "European Union (Ireland)", taxType: "Corporate Tax & VAT", liability: 15500000, paid: 0, remaining: 15500000, dueDate: "2025-03-31" },
    { jurisdiction: "Singapore (Foundation)", taxType: "Corporate Tax", liability: 2800000, paid: 0, remaining: 2800000, dueDate: "2025-11-30" },
    { jurisdiction: "Switzerland (Technology Hub)", taxType: "Withholding Tax", liability: 1500000, paid: 1500000, remaining: 0, dueDate: "2024-12-31" },
    { jurisdiction: "Cayman Islands (Holding)", taxType: "No Corporate Tax", liability: 0, paid: 0, remaining: 0, dueDate: "N/A" },
  ];

  const taxCalendar: TaxCalendarEvent[] = taxData?.calendar || [
    { date: "2024-12-08", event: "TBURN Mainnet v8.0 Launch - Tax Year Start", status: "completed" },
    { date: "2024-12-31", event: "Switzerland FY2024 Withholding Tax Filing", status: "completed" },
    { date: "2025-01-31", event: "US Q4 2024 Digital Asset Tax Deadline", status: "upcoming" },
    { date: "2025-01-31", event: "EU VAT Q4 2024 Filing Deadline", status: "upcoming" },
    { date: "2025-03-31", event: "EU Ireland Corporate Tax FY2024", status: "upcoming" },
    { date: "2025-04-15", event: "US Federal Corporate Tax FY2024", status: "upcoming" },
  ];

  const totalLiability = taxLiabilities.reduce((sum, t) => sum + t.liability, 0);
  const totalPaid = taxLiabilities.reduce((sum, t) => sum + t.paid, 0);
  const totalRemaining = taxLiabilities.reduce((sum, t) => sum + t.remaining, 0);
  const pendingReports = taxReports.filter(r => r.status === "pending" || r.status === "draft").length;
  const overdueReports = taxReports.filter(r => r.status === "overdue").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "filed": return <Badge className="bg-green-500">{t("adminTax.status.filed")}</Badge>;
      case "pending": return <Badge variant="secondary">{t("adminTax.status.pending")}</Badge>;
      case "draft": return <Badge variant="outline">{t("adminTax.status.draft")}</Badge>;
      case "overdue": return <Badge className="bg-red-500">{t("adminTax.status.overdue")}</Badge>;
      case "completed": return <Badge className="bg-green-500">{t("adminTax.status.completed")}</Badge>;
      case "upcoming": return <Badge variant="secondary">{t("adminTax.status.upcoming")}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "filed": return "bg-green-500/10 text-green-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "draft": return "bg-gray-500/10 text-gray-500";
      case "overdue": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  const getReportDetailSections = (report: TaxReport): DetailSection[] => [
    {
      title: t("adminTax.detail.reportInfo"),
      fields: [
        { label: t("adminTax.reports.id"), value: report.id, type: "code", copyable: true },
        { label: t("adminTax.reports.type"), value: report.type },
        { label: t("adminTax.reports.period"), value: report.period },
        { label: t("adminTax.reports.jurisdiction"), value: report.jurisdiction },
        { label: t("adminTax.reports.status"), value: t(`adminTax.status.${report.status}`), type: "badge", badgeColor: getStatusBadgeColor(report.status) },
      ],
    },
    {
      title: t("adminTax.detail.filingDetails"),
      fields: [
        { label: t("adminTax.reports.amount"), value: `$${(report.amount / 1000000).toFixed(2)}M`, type: "currency" },
        { label: t("adminTax.reports.dueDate"), value: report.dueDate, type: "date" },
        { label: t("adminTax.filedDate"), value: report.filedDate || "-", type: "date" },
      ],
    },
  ];

  const confirmGenerate = useCallback(() => {
    if (pendingReportType) {
      generateReportMutation.mutate(pendingReportType);
      setShowGenerateConfirm(false);
      setPendingReportType(null);
    }
  }, [pendingReportType, generateReportMutation]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminTax.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminTax.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-tax">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminTax.retry")}
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
              <Skeleton className="h-10 w-32" />
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
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="tax-reporting-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-tax-title">
              <FileText className="h-8 w-8" />
              {t("adminTax.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-tax-description">
              {t("adminTax.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32" data-testid="select-year">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-tax">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTax.refresh")}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setPendingReportType("annual");
                setShowGenerateConfirm(true);
              }}
              disabled={generateReportMutation.isPending}
              data-testid="button-new-report"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              {t("adminTax.newReport")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-tax">
              <Download className="h-4 w-4 mr-2" />
              {t("adminTax.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-liability">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTax.stats.totalLiability")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-liability">${(totalLiability / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-paid">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTax.stats.paid")}</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-paid">${(totalPaid / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-pending">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTax.stats.pendingReports")}</p>
                  <p className="text-2xl font-bold" data-testid="text-pending">{pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-overdue">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTax.stats.overdue")}</p>
                  <p className="text-2xl font-bold text-red-500" data-testid="text-overdue">{overdueReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-tax">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminTax.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">{t("adminTax.tabs.reports")}</TabsTrigger>
            <TabsTrigger value="liabilities" data-testid="tab-liabilities">{t("adminTax.tabs.liabilities")}</TabsTrigger>
            <TabsTrigger value="calendar" data-testid="tab-calendar">{t("adminTax.tabs.calendar")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-compliance-status">
                <CardHeader>
                  <CardTitle>{t("adminTax.compliance.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("adminTax.compliance.paymentProgress")}</span>
                    <span className="text-sm font-medium">{((totalPaid / totalLiability) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(totalPaid / totalLiability) * 100} />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-green-500" data-testid="text-filed-count">
                        {taxReports.filter(r => r.status === "filed").length}
                      </p>
                      <p className="text-sm text-muted-foreground">{t("adminTax.compliance.filed")}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-yellow-500" data-testid="text-pending-count">{pendingReports}</p>
                      <p className="text-sm text-muted-foreground">{t("adminTax.compliance.pending")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-jurisdictions">
                <CardHeader>
                  <CardTitle>{t("adminTax.jurisdictions.title")}</CardTitle>
                  <CardDescription>{t("adminTax.jurisdictions.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from(new Set(taxLiabilities.map(t => t.jurisdiction))).map((jurisdiction, index) => {
                    const liability = taxLiabilities.filter(t => t.jurisdiction === jurisdiction);
                    const total = liability.reduce((s, t) => s + t.liability, 0);
                    const paid = liability.reduce((s, t) => s + t.paid, 0);
                    return (
                      <div key={jurisdiction} className="space-y-2" data-testid={`jurisdiction-${index}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{jurisdiction}</span>
                          </div>
                          <span className="text-sm">${(total / 1000000).toFixed(2)}M</span>
                        </div>
                        <Progress value={(paid / total) * 100} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-upcoming-deadlines">
              <CardHeader>
                <CardTitle>{t("adminTax.deadlines.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxCalendar.filter(e => e.status === "upcoming").slice(0, 5).map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`deadline-${i}`}>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{event.event}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card data-testid="card-tax-reports">
              <CardHeader>
                <CardTitle>{t("adminTax.reports.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminTax.reports.id")}</TableHead>
                      <TableHead>{t("adminTax.reports.type")}</TableHead>
                      <TableHead>{t("adminTax.reports.period")}</TableHead>
                      <TableHead>{t("adminTax.reports.jurisdiction")}</TableHead>
                      <TableHead className="text-right">{t("adminTax.reports.amount")}</TableHead>
                      <TableHead>{t("adminTax.reports.dueDate")}</TableHead>
                      <TableHead>{t("adminTax.reports.status")}</TableHead>
                      <TableHead className="text-right">{t("adminTax.reports.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxReports.map((report, index) => (
                      <TableRow key={report.id} data-testid={`report-row-${index}`}>
                        <TableCell className="font-mono">{report.id}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.period}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {report.jurisdiction}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${(report.amount / 1000000).toFixed(2)}M</TableCell>
                        <TableCell>{report.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportDetail(true);
                              }}
                              data-testid={`button-view-report-${index}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-check-${index}`}>
                              <FileCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-print-${index}`}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-download-${index}`}>
                              <Download className="h-4 w-4" />
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

          <TabsContent value="liabilities" className="space-y-6">
            <Card data-testid="card-tax-liabilities">
              <CardHeader>
                <CardTitle>{t("adminTax.liabilities.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminTax.liabilities.jurisdiction")}</TableHead>
                      <TableHead>{t("adminTax.liabilities.taxType")}</TableHead>
                      <TableHead className="text-right">{t("adminTax.liabilities.totalLiability")}</TableHead>
                      <TableHead className="text-right">{t("adminTax.liabilities.paid")}</TableHead>
                      <TableHead className="text-right">{t("adminTax.liabilities.remaining")}</TableHead>
                      <TableHead>{t("adminTax.liabilities.dueDate")}</TableHead>
                      <TableHead>{t("adminTax.liabilities.progress")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxLiabilities.map((liability, i) => (
                      <TableRow key={i} data-testid={`liability-row-${i}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {liability.jurisdiction}
                          </div>
                        </TableCell>
                        <TableCell>{liability.taxType}</TableCell>
                        <TableCell className="text-right">${(liability.liability / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className="text-right text-green-500">${(liability.paid / 1000000).toFixed(2)}M</TableCell>
                        <TableCell className={`text-right ${liability.remaining > 0 ? "text-yellow-500" : "text-green-500"}`}>
                          ${(liability.remaining / 1000000).toFixed(2)}M
                        </TableCell>
                        <TableCell>{liability.dueDate}</TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={(liability.paid / liability.liability) * 100} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>{t("adminTax.liabilities.total")}</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">${(totalLiability / 1000000).toFixed(2)}M</TableCell>
                      <TableCell className="text-right text-green-500">${(totalPaid / 1000000).toFixed(2)}M</TableCell>
                      <TableCell className="text-right text-yellow-500">${(totalRemaining / 1000000).toFixed(2)}M</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card data-testid="card-tax-calendar">
              <CardHeader>
                <CardTitle>{t("adminTax.calendar.title")}</CardTitle>
                <CardDescription>{t("adminTax.calendar.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxCalendar.map((event, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`calendar-event-${i}`}>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                      {getStatusBadge(event.status)}
                      {event.status === "upcoming" && (
                        <Button variant="outline" size="sm" data-testid={`button-reminder-${i}`}>
                          {t("adminTax.calendar.setReminder")}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedReport && (
          <DetailSheet
            open={showReportDetail}
            onOpenChange={setShowReportDetail}
            title={selectedReport.type}
            subtitle={selectedReport.id}
            icon={<FileText className="h-5 w-5" />}
            sections={getReportDetailSections(selectedReport)}
          />
        )}

        <ConfirmationDialog
          open={showGenerateConfirm}
          onOpenChange={setShowGenerateConfirm}
          title={t("adminTax.confirm.generateTitle")}
          description={t("adminTax.confirm.generateDesc")}
          onConfirm={confirmGenerate}
          isLoading={generateReportMutation.isPending}
          destructive={false}
          confirmText={t("adminTax.generateReport")}
          cancelText={t("adminTax.cancel")}
        />
      </div>
    </div>
  );
}
