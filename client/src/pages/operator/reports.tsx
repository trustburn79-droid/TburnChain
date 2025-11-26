import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  ChevronLeft, ChevronRight, Calendar, Building2
} from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { queryClient } from "@/lib/queryClient";

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

export default function OperatorReports() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminPassword();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newReport, setNewReport] = useState({
    reportType: "kyc_summary",
    reportPeriod: "monthly",
    periodStart: "",
    periodEnd: "",
    jurisdiction: "global",
    regulatoryBody: "",
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage regulatory compliance reports
          </p>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)} data-testid="btn-generate-report">
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {data?.reports?.filter(r => r.status === 'pending_review').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {data?.reports?.filter(r => r.status === 'approved').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reports</CardTitle>
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
                  <TableHead>Jurisdiction</TableHead>
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
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getReportTypeName(report.report_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="capitalize">{report.report_period}</div>
                        <div className="text-muted-foreground">
                          {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.jurisdiction}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-sm">
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
