import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Plus, Download, Eye, CheckCircle2, Send,
  ChevronLeft, ChevronRight, Calendar, Building2,
  Clock, FileSpreadsheet, FileCheck, AlertTriangle,
  Play, Pause, Trash2, Copy, BarChart3, PieChart,
  TrendingUp, Shield, Users, Coins, ClipboardCheck
} from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { queryClient } from "@/lib/queryClient";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

interface ComplianceReport {
  id: string;
  report_type: string;
  report_period: string;
  period_start: string;
  period_end: string;
  jurisdiction: string;
  regulatory_body: string | null;
  summary: any;
  status: string;
  generated_by: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  submitted_at: string | null;
  created_at: string;
}

interface ReportsResponse {
  reports: ComplianceReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: string[];
  isDefault: boolean;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  frequency: string;
  nextRun: string;
  lastRun: string | null;
  enabled: boolean;
  recipients: string[];
}

interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  status: "compliant" | "non_compliant" | "pending" | "not_applicable";
  lastChecked: string;
  notes: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "kyc_summary",
    name: "KYC Summary Report",
    type: "kyc_summary",
    description: "Comprehensive overview of KYC verification status across all members",
    fields: ["Total Members", "Verified", "Pending", "Rejected", "Tier Distribution"],
    isDefault: true,
  },
  {
    id: "aml_report",
    name: "AML Compliance Report",
    type: "aml_report",
    description: "Anti-money laundering activity monitoring and suspicious transaction analysis",
    fields: ["Flagged Transactions", "SAR Filed", "Risk Assessment", "Country Breakdown"],
    isDefault: true,
  },
  {
    id: "transaction_report",
    name: "Transaction Activity Report",
    type: "transaction_report",
    description: "Detailed breakdown of network transaction activity and volume",
    fields: ["Total Volume", "Unique Addresses", "Average TX Size", "Fee Revenue"],
    isDefault: true,
  },
  {
    id: "validator_report",
    name: "Validator Performance Report",
    type: "validator_report",
    description: "Validator uptime, rewards, and slashing event summary",
    fields: ["Active Validators", "Avg Uptime", "Total Rewards", "Slashing Events"],
    isDefault: true,
  },
  {
    id: "financial_statement",
    name: "Financial Statement",
    type: "financial_statement",
    description: "Treasury balance, token emission, and burn statistics",
    fields: ["Treasury Balance", "Daily Emission", "Total Burned", "Net Inflation"],
    isDefault: false,
  },
];

const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: "sched_1",
    templateId: "kyc_summary",
    name: "Weekly KYC Summary",
    frequency: "weekly",
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    enabled: true,
    recipients: ["compliance@tburn.io", "admin@tburn.io"],
  },
  {
    id: "sched_2",
    templateId: "aml_report",
    name: "Monthly AML Report",
    frequency: "monthly",
    nextRun: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    enabled: true,
    recipients: ["legal@tburn.io"],
  },
  {
    id: "sched_3",
    templateId: "transaction_report",
    name: "Daily Transaction Summary",
    frequency: "daily",
    nextRun: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    enabled: true,
    recipients: ["ops@tburn.io"],
  },
  {
    id: "sched_4",
    templateId: "validator_report",
    name: "Quarterly Validator Report",
    frequency: "quarterly",
    nextRun: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastRun: null,
    enabled: false,
    recipients: ["validators@tburn.io"],
  },
];

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: "comp_1",
    category: "KYC/AML",
    requirement: "All members must complete identity verification within 30 days",
    status: "compliant",
    lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "98.5% compliance rate",
  },
  {
    id: "comp_2",
    category: "KYC/AML",
    requirement: "Suspicious Activity Reports (SARs) filed within 72 hours",
    status: "compliant",
    lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "All SARs filed on time",
  },
  {
    id: "comp_3",
    category: "Data Protection",
    requirement: "GDPR compliance for EU member data handling",
    status: "compliant",
    lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Annual audit passed",
  },
  {
    id: "comp_4",
    category: "Data Protection",
    requirement: "Encryption at rest for all sensitive data",
    status: "compliant",
    lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "AES-256 encryption verified",
  },
  {
    id: "comp_5",
    category: "Financial Reporting",
    requirement: "Quarterly financial statements submitted to regulators",
    status: "pending",
    lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Q4 2025 report in preparation",
  },
  {
    id: "comp_6",
    category: "Financial Reporting",
    requirement: "Annual audit by certified third party",
    status: "compliant",
    lastChecked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "2024 audit completed - clean opinion",
  },
  {
    id: "comp_7",
    category: "Network Security",
    requirement: "Multi-signature requirement for treasury transactions",
    status: "compliant",
    lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "3-of-5 multisig active",
  },
  {
    id: "comp_8",
    category: "Network Security",
    requirement: "Validator KYC for committee membership",
    status: "compliant",
    lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "All 125 validators verified",
  },
  {
    id: "comp_9",
    category: "Operational",
    requirement: "Disaster recovery plan tested quarterly",
    status: "pending",
    lastChecked: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Next test scheduled for December",
  },
  {
    id: "comp_10",
    category: "Operational",
    requirement: "Security incident response within 1 hour",
    status: "compliant",
    lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "24/7 monitoring active",
  },
];

const REPORT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function OperatorReports() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminPassword();
  const [activeTab, setActiveTab] = useState("reports");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [scheduledReports, setScheduledReports] = useState(SCHEDULED_REPORTS);
  const [complianceItems, setComplianceItems] = useState(COMPLIANCE_ITEMS);
  const [newReport, setNewReport] = useState({
    reportType: "kyc_summary",
    reportPeriod: "monthly",
    periodStart: "",
    periodEnd: "",
    jurisdiction: "global",
    regulatoryBody: "",
  });
  const [newSchedule, setNewSchedule] = useState({
    templateId: "",
    name: "",
    frequency: "weekly",
    recipients: "",
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (typeFilter !== "all") params.set("reportType", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    return params.toString();
  };

  const { data, isLoading } = useQuery<ReportsResponse>({
    queryKey: ["/api/operator/reports", page, typeFilter, statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/operator/reports?${buildQueryString()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (report: typeof newReport) => {
      const response = await fetch("/api/operator/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(report),
      });
      if (!response.ok) throw new Error("Failed to generate report");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Report generated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/reports"] });
      setShowGenerateDialog(false);
      setNewReport({
        reportType: "kyc_summary",
        reportPeriod: "monthly",
        periodStart: "",
        periodEnd: "",
        jurisdiction: "global",
        regulatoryBody: "",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate report", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/operator/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update report");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Report status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/reports"] });
      setSelectedReport(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update report", description: error.message, variant: "destructive" });
    },
  });

  const exportToCSV = (reports: ComplianceReport[]) => {
    const headers = ["ID", "Type", "Period", "Start Date", "End Date", "Jurisdiction", "Status", "Generated By", "Created At"];
    const rows = reports.map(r => [
      r.id,
      r.report_type,
      r.report_period,
      r.period_start,
      r.period_end,
      r.jurisdiction,
      r.status,
      r.generated_by,
      r.created_at,
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `compliance_reports_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast({ title: "Reports exported to CSV" });
  };

  const toggleSchedule = (id: string) => {
    setScheduledReports(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast({ title: "Schedule updated" });
  };

  const deleteSchedule = (id: string) => {
    setScheduledReports(prev => prev.filter(s => s.id !== id));
    toast({ title: "Schedule deleted" });
  };

  const createSchedule = () => {
    if (!newSchedule.templateId || !newSchedule.name) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const newSched: ScheduledReport = {
      id: `sched_${Date.now()}`,
      templateId: newSchedule.templateId,
      name: newSchedule.name,
      frequency: newSchedule.frequency,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastRun: null,
      enabled: true,
      recipients: newSchedule.recipients.split(",").map(r => r.trim()).filter(Boolean),
    };
    
    setScheduledReports(prev => [...prev, newSched]);
    setShowScheduleDialog(false);
    setNewSchedule({ templateId: "", name: "", frequency: "weekly", recipients: "" });
    toast({ title: "Schedule created successfully" });
  };

  const updateComplianceStatus = (id: string, status: ComplianceItem["status"]) => {
    setComplianceItems(prev => prev.map(item => 
      item.id === id ? { ...item, status, lastChecked: new Date().toISOString() } : item
    ));
    toast({ title: "Compliance status updated" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "submitted": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Send className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "draft": return <Badge variant="secondary">Draft</Badge>;
      case "pending_review": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending Review</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplianceStatusBadge = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Compliant</Badge>;
      case "non_compliant": return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Non-Compliant</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "not_applicable": return <Badge variant="outline">N/A</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReportTypeName = (type: string) => {
    switch (type) {
      case "kyc_summary": return "KYC Summary";
      case "aml_report": return "AML Report";
      case "transaction_report": return "Transaction Report";
      case "validator_report": return "Validator Report";
      case "financial_statement": return "Financial Statement";
      default: return type.replace(/_/g, " ");
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "kyc_summary": return <Users className="h-5 w-5 text-blue-500" />;
      case "aml_report": return <Shield className="h-5 w-5 text-red-500" />;
      case "transaction_report": return <BarChart3 className="h-5 w-5 text-green-500" />;
      case "validator_report": return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case "financial_statement": return <Coins className="h-5 w-5 text-yellow-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const complianceStats = useMemo(() => {
    const total = complianceItems.length;
    const compliant = complianceItems.filter(i => i.status === "compliant").length;
    const pending = complianceItems.filter(i => i.status === "pending").length;
    const nonCompliant = complianceItems.filter(i => i.status === "non_compliant").length;
    return { total, compliant, pending, nonCompliant, percentage: Math.round((compliant / total) * 100) };
  }, [complianceItems]);

  const complianceByCategory = useMemo(() => {
    const categories = [...new Set(complianceItems.map(i => i.category))];
    return categories.map(cat => {
      const items = complianceItems.filter(i => i.category === cat);
      const compliant = items.filter(i => i.status === "compliant").length;
      return { name: cat, value: compliant, total: items.length };
    });
  }, [complianceItems]);

  const reportTypeDistribution = useMemo(() => {
    if (!data?.reports) return [];
    const types: Record<string, number> = {};
    data.reports.forEach(r => {
      types[r.report_type] = (types[r.report_type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name: getReportTypeName(name), value }));
  }, [data]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Reports</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and manage regulatory compliance reports
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "reports" && data?.reports && data.reports.length > 0 && (
            <Button variant="outline" onClick={() => exportToCSV(data.reports)} data-testid="btn-export-csv">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          {activeTab === "schedules" && (
            <Button onClick={() => setShowScheduleDialog(true)} data-testid="btn-create-schedule">
              <Clock className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          )}
          {activeTab === "reports" && (
            <Button onClick={() => setShowGenerateDialog(true)} data-testid="btn-generate-report">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-reports">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="reports" className="flex items-center gap-2" data-testid="tab-reports">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2" data-testid="tab-templates">
            <FileSpreadsheet className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2" data-testid="tab-schedules">
            <Clock className="h-4 w-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2" data-testid="tab-compliance">
            <ClipboardCheck className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card data-testid="card-total-reports">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-draft-reports">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Draft</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {data?.reports?.filter(r => r.status === 'draft').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-pending-reports">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {data?.reports?.filter(r => r.status === 'pending_review').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-approved-reports">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {data?.reports?.filter(r => r.status === 'approved').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-submitted-reports">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {data?.reports?.filter(r => r.status === 'submitted').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2" data-testid="card-reports-table">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle>Reports List</CardTitle>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                      <SelectTrigger className="w-40" data-testid="select-report-type">
                        <SelectValue placeholder="Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="kyc_summary">KYC Summary</SelectItem>
                        <SelectItem value="aml_report">AML Report</SelectItem>
                        <SelectItem value="transaction_report">Transaction Report</SelectItem>
                        <SelectItem value="validator_report">Validator Report</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                      <SelectTrigger className="w-32" data-testid="select-report-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.reports?.map((report) => (
                        <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTemplateIcon(report.report_type)}
                              <span className="font-medium">{getReportTypeName(report.report_type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="capitalize">{report.report_period}</div>
                              <div className="text-muted-foreground text-xs">
                                {new Date(report.period_start).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedReport(report)}
                                data-testid={`btn-view-report-${report.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                data-testid={`btn-download-${report.id}`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.reports || data.reports.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No reports found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {data?.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {data.pagination.totalPages}
                      {isLoading && <span className="ml-2 text-xs">(loading...)</span>}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1 || isLoading}
                        data-testid="btn-reports-prev"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                        disabled={page >= data.pagination.totalPages || isLoading}
                        data-testid="btn-reports-next"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-report-distribution">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Report Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reportTypeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reportTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportTypeDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={REPORT_COLORS[index % REPORT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map((template) => (
              <Card key={template.id} className="hover-elevate cursor-pointer" data-testid={`card-template-${template.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTemplateIcon(template.type)}
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {template.isDefault && <Badge variant="secondary" className="text-xs mt-1">Default</Badge>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewReport({ ...newReport, reportType: template.type });
                        setShowGenerateDialog(true);
                      }}
                      data-testid={`btn-use-template-${template.id}`}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.map((field) => (
                      <Badge key={field} variant="outline" className="text-xs">{field}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-active-schedules">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {scheduledReports.filter(s => s.enabled).length}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-paused-schedules">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Paused</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {scheduledReports.filter(s => !s.enabled).length}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-daily-schedules">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scheduledReports.filter(s => s.frequency === "daily").length}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-weekly-schedules">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekly Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scheduledReports.filter(s => s.frequency === "weekly").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-schedules-table">
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automated report generation schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((schedule) => (
                    <TableRow key={schedule.id} data-testid={`row-schedule-${schedule.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTemplateIcon(schedule.templateId)}
                          <span className="font-medium">{schedule.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{schedule.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(schedule.nextRun).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {schedule.recipients.slice(0, 2).map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                          ))}
                          {schedule.recipients.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{schedule.recipients.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={() => toggleSchedule(schedule.id)}
                          data-testid={`switch-schedule-${schedule.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteSchedule(schedule.id)}
                            data-testid={`btn-delete-schedule-${schedule.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {scheduledReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No scheduled reports
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-compliance-score">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Compliance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{complianceStats.percentage}%</div>
                <Progress value={complianceStats.percentage} className="mt-2" />
              </CardContent>
            </Card>
            <Card data-testid="card-compliant-items">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{complianceStats.compliant}</div>
                <p className="text-xs text-muted-foreground">of {complianceStats.total} requirements</p>
              </CardContent>
            </Card>
            <Card data-testid="card-pending-items">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{complianceStats.pending}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-noncompliant-items">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Non-Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{complianceStats.nonCompliant}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2" data-testid="card-compliance-checklist">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Compliance Checklist
                </CardTitle>
                <CardDescription>Regulatory requirements and their compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Checked</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceItems.map((item) => (
                      <TableRow key={item.id} data-testid={`row-compliance-${item.id}`}>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{item.requirement}</p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getComplianceStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.lastChecked).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.status}
                            onValueChange={(v) => updateComplianceStatus(item.id, v as ComplianceItem["status"])}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-compliance-${item.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="compliant">Compliant</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                              <SelectItem value="not_applicable">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card data-testid="card-compliance-by-category">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}/${props.payload.total}`,
                        "Compliant"
                      ]}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport && getReportTypeName(selectedReport.report_type)}</DialogTitle>
            <DialogDescription>
              {selectedReport?.report_period} Report - {selectedReport?.jurisdiction}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jurisdiction</p>
                  <Badge variant="outline" className="capitalize">{selectedReport.jurisdiction}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period Start</p>
                  <p className="font-medium">{new Date(selectedReport.period_start).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period End</p>
                  <p className="font-medium">{new Date(selectedReport.period_end).toLocaleDateString()}</p>
                </div>
                {selectedReport.regulatory_body && (
                  <div>
                    <p className="text-sm text-muted-foreground">Regulatory Body</p>
                    <p className="font-medium">{selectedReport.regulatory_body}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Generated By</p>
                  <p className="font-medium">{selectedReport.generated_by}</p>
                </div>
              </div>

              {selectedReport.summary && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Report Summary</p>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedReport.summary, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedReport.approved_at && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <p className="text-sm text-green-500">
                    Approved by {selectedReport.approved_by} on {new Date(selectedReport.approved_at).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedReport.submitted_at && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <p className="text-sm text-blue-500">
                    Submitted on {new Date(selectedReport.submitted_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {selectedReport?.status === "draft" && (
              <Button
                variant="outline"
                onClick={() => updateStatusMutation.mutate({ id: selectedReport.id, status: "pending_review" })}
                disabled={updateStatusMutation.isPending}
                data-testid="btn-submit-review"
              >
                Submit for Review
              </Button>
            )}
            {selectedReport?.status === "pending_review" && (
              <Button
                onClick={() => updateStatusMutation.mutate({ id: selectedReport.id, status: "approved" })}
                disabled={updateStatusMutation.isPending}
                data-testid="btn-approve-report"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {selectedReport?.status === "approved" && (
              <Button
                onClick={() => updateStatusMutation.mutate({ id: selectedReport.id, status: "submitted" })}
                disabled={updateStatusMutation.isPending}
                data-testid="btn-submit-report"
              >
                <Send className="h-4 w-4 mr-2" />
                Mark as Submitted
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Compliance Report</DialogTitle>
            <DialogDescription>
              Create a new compliance report for the specified period
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select
                value={newReport.reportType}
                onValueChange={(v) => setNewReport({ ...newReport, reportType: v })}
              >
                <SelectTrigger className="mt-1" data-testid="select-new-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kyc_summary">KYC Summary</SelectItem>
                  <SelectItem value="aml_report">AML Report</SelectItem>
                  <SelectItem value="transaction_report">Transaction Report</SelectItem>
                  <SelectItem value="validator_report">Validator Report</SelectItem>
                  <SelectItem value="financial_statement">Financial Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Report Period</label>
                <Select
                  value={newReport.reportPeriod}
                  onValueChange={(v) => setNewReport({ ...newReport, reportPeriod: v })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-report-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Jurisdiction</label>
                <Select
                  value={newReport.jurisdiction}
                  onValueChange={(v) => setNewReport({ ...newReport, jurisdiction: v })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-jurisdiction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="sg">Singapore</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Period Start
                </label>
                <Input
                  type="date"
                  value={newReport.periodStart}
                  onChange={(e) => setNewReport({ ...newReport, periodStart: e.target.value })}
                  className="mt-1"
                  data-testid="input-period-start"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Period End
                </label>
                <Input
                  type="date"
                  value={newReport.periodEnd}
                  onChange={(e) => setNewReport({ ...newReport, periodEnd: e.target.value })}
                  className="mt-1"
                  data-testid="input-period-end"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Regulatory Body (optional)
              </label>
              <Input
                value={newReport.regulatoryBody}
                onChange={(e) => setNewReport({ ...newReport, regulatoryBody: e.target.value })}
                placeholder="e.g., SEC, FCA, MAS"
                className="mt-1"
                data-testid="input-regulatory-body"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => generateMutation.mutate(newReport)}
              disabled={generateMutation.isPending || !newReport.periodStart || !newReport.periodEnd}
              data-testid="btn-confirm-generate"
            >
              {generateMutation.isPending ? "Generating..." : "Generate Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Report Schedule</DialogTitle>
            <DialogDescription>
              Set up automated report generation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Schedule Name</label>
              <Input
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                placeholder="e.g., Weekly Compliance Summary"
                className="mt-1"
                data-testid="input-schedule-name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Report Template</label>
              <Select
                value={newSchedule.templateId}
                onValueChange={(v) => setNewSchedule({ ...newSchedule, templateId: v })}
              >
                <SelectTrigger className="mt-1" data-testid="select-schedule-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={newSchedule.frequency}
                onValueChange={(v) => setNewSchedule({ ...newSchedule, frequency: v })}
              >
                <SelectTrigger className="mt-1" data-testid="select-schedule-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Recipients (comma-separated)</label>
              <Input
                value={newSchedule.recipients}
                onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                placeholder="email1@example.com, email2@example.com"
                className="mt-1"
                data-testid="input-schedule-recipients"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={createSchedule}
              disabled={!newSchedule.templateId || !newSchedule.name}
              data-testid="btn-confirm-schedule"
            >
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
