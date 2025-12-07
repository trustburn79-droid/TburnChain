import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  FileCheck, Shield, AlertTriangle, CheckCircle, Clock, 
  Download, FileText, Calendar, RefreshCw, Eye
} from "lucide-react";

interface ComplianceScore {
  overall: number;
  security: number;
  dataProtection: number;
  operationalRisk: number;
  regulatory: number;
}

interface Framework {
  name: string;
  status: string;
  lastAudit: string;
  nextAudit: string;
  score: number;
}

interface Finding {
  id: number;
  category: string;
  finding: string;
  severity: string;
  status: string;
  due: string;
}

interface AuditItem {
  audit: string;
  date: string;
  auditor: string;
  status: string;
}

interface ComplianceData {
  complianceScore: ComplianceScore;
  frameworks: Framework[];
  recentFindings: Finding[];
  auditSchedule: AuditItem[];
}

export default function AdminCompliance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("frameworks");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showFrameworkDetail, setShowFrameworkDetail] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [showAssessmentConfirm, setShowAssessmentConfirm] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<ComplianceData>({
    queryKey: ["/api/admin/compliance"],
    refetchInterval: 60000,
  });

  const runAssessmentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/compliance/assessment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/compliance"] });
      toast({
        title: t("adminCompliance.assessmentSuccess"),
        description: t("adminCompliance.assessmentSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminCompliance.assessmentError"),
        description: t("adminCompliance.assessmentErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const complianceScore = data?.complianceScore ?? {
    overall: 98.5,
    security: 99.2,
    dataProtection: 98.1,
    operationalRisk: 97.8,
    regulatory: 98.8,
  };

  const frameworks = data?.frameworks ?? [
    { name: "SOC 2 Type II", status: "compliant", lastAudit: "2024-11-30", nextAudit: "2025-05-30", score: 99 },
    { name: "ISO 27001:2022", status: "compliant", lastAudit: "2024-11-15", nextAudit: "2025-05-15", score: 98 },
    { name: "GDPR", status: "compliant", lastAudit: "2024-10-20", nextAudit: "2025-04-20", score: 98 },
    { name: "PCI DSS v4.0", status: "compliant", lastAudit: "2024-11-25", nextAudit: "2025-05-25", score: 97 },
    { name: "CCPA/CPRA", status: "compliant", lastAudit: "2024-12-01", nextAudit: "2025-06-01", score: 99 },
    { name: "VASP License (Korea)", status: "compliant", lastAudit: "2024-11-20", nextAudit: "2025-05-20", score: 100 },
    { name: "MiCA (EU)", status: "compliant", lastAudit: "2024-12-05", nextAudit: "2025-06-05", score: 98 },
  ];

  const recentFindings = data?.recentFindings ?? [
    { id: 1, category: "Documentation", finding: "Update API documentation for v8.0", severity: "low", status: "resolved", due: "2024-12-05" },
    { id: 2, category: "Security", finding: "TLS certificate renewal completed", severity: "low", status: "resolved", due: "2024-12-01" },
    { id: 3, category: "Access Control", finding: "MFA enforcement verified for all accounts", severity: "low", status: "resolved", due: "2024-11-30" },
    { id: 4, category: "Operational", finding: "Disaster recovery test passed", severity: "low", status: "resolved", due: "2024-12-03" },
  ];

  const auditSchedule = data?.auditSchedule ?? [
    { audit: "Mainnet Launch Security Review", date: "2024-12-08", auditor: "Internal + CertiK", status: "scheduled" },
    { audit: "Q1 2025 SOC 2 Prep", date: "2025-01-15", auditor: "Internal", status: "scheduled" },
    { audit: "Annual Penetration Test", date: "2025-01-20", auditor: "External (Trail of Bits)", status: "scheduled" },
    { audit: "ISO 27001 Surveillance", date: "2025-02-15", auditor: "External (BSI)", status: "scheduled" },
    { audit: "Smart Contract Audit", date: "2025-03-01", auditor: "External (OpenZeppelin)", status: "pending" },
  ];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
      toast({
        title: t("adminCompliance.refreshSuccess"),
        description: t("adminCompliance.dataUpdated"),
      });
    } catch {
      toast({
        title: t("adminCompliance.refreshError"),
        description: t("adminCompliance.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      complianceScore,
      frameworks,
      recentFindings,
      auditSchedule,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminCompliance.exportSuccess"),
      description: t("adminCompliance.exportSuccessDesc"),
    });
  }, [complianceScore, frameworks, recentFindings, auditSchedule, toast, t]);

  const getFrameworkDetailSections = (framework: Framework): DetailSection[] => [
    {
      title: t("adminCompliance.detail.frameworkInfo"),
      fields: [
        { label: t("common.name"), value: framework.name },
        {
          label: t("common.status"),
          value: framework.status === "compliant" ? t("adminCompliance.frameworks.compliant") : t("adminCompliance.frameworks.inProgress"),
          type: "badge",
          badgeColor: framework.status === "compliant" ? "bg-green-500" : "bg-yellow-500",
        },
        { label: t("adminCompliance.frameworks.columns.score"), value: framework.score, type: "progress" },
      ],
    },
    {
      title: t("adminCompliance.detail.auditSchedule"),
      fields: [
        { label: t("adminCompliance.frameworks.columns.lastAudit"), value: framework.lastAudit, type: "date" },
        { label: t("adminCompliance.frameworks.columns.nextAudit"), value: framework.nextAudit, type: "date" },
      ],
    },
  ];

  const confirmAssessment = useCallback(() => {
    runAssessmentMutation.mutate();
    setShowAssessmentConfirm(false);
  }, [runAssessmentMutation]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="compliance-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card data-testid="card-error">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <FileCheck className="h-12 w-12 mx-auto text-destructive" />
                <h2 className="text-xl font-semibold">{t("adminCompliance.error.title")}</h2>
                <p className="text-muted-foreground">{t("adminCompliance.error.description")}</p>
                <Button onClick={() => refetch()} data-testid="button-retry">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminCompliance.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="compliance-page">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminCompliance.title")}</h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminCompliance.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-update">
                {t("adminCompliance.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("adminCompliance.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              {t("adminCompliance.exportReport")}
            </Button>
            <Button 
              onClick={() => setShowAssessmentConfirm(true)} 
              disabled={runAssessmentMutation.isPending}
              data-testid="button-run-assessment"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              {t("adminCompliance.runAssessment")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="grid-scores">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} data-testid={`card-score-skeleton-${i}`}>
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-full mt-2" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10" data-testid="card-score-overall">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{t("adminCompliance.stats.overallScore")}</span>
                  </div>
                  <div className="text-3xl font-bold text-green-500" data-testid="text-score-overall">{complianceScore.overall}%</div>
                </CardContent>
              </Card>
              <Card data-testid="card-score-security">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-2">{t("adminCompliance.stats.security")}</div>
                  <div className="text-2xl font-bold" data-testid="text-score-security">{complianceScore.security}%</div>
                  <Progress value={complianceScore.security} className="mt-2" data-testid="progress-security" />
                </CardContent>
              </Card>
              <Card data-testid="card-score-data">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-2">{t("adminCompliance.stats.dataProtection")}</div>
                  <div className="text-2xl font-bold" data-testid="text-score-data">{complianceScore.dataProtection}%</div>
                  <Progress value={complianceScore.dataProtection} className="mt-2" data-testid="progress-data" />
                </CardContent>
              </Card>
              <Card data-testid="card-score-operational">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-2">{t("adminCompliance.stats.operationalRisk")}</div>
                  <div className="text-2xl font-bold" data-testid="text-score-operational">{complianceScore.operationalRisk}%</div>
                  <Progress value={complianceScore.operationalRisk} className="mt-2" data-testid="progress-operational" />
                </CardContent>
              </Card>
              <Card data-testid="card-score-regulatory">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-2">{t("adminCompliance.stats.regulatory")}</div>
                  <div className="text-2xl font-bold" data-testid="text-score-regulatory">{complianceScore.regulatory}%</div>
                  <Progress value={complianceScore.regulatory} className="mt-2" data-testid="progress-regulatory" />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" data-testid="tabs-compliance">
          <TabsList data-testid="tabslist-compliance">
            <TabsTrigger value="frameworks" data-testid="tab-frameworks">
              <FileCheck className="w-4 h-4 mr-2" />
              {t("adminCompliance.tabs.frameworks")}
            </TabsTrigger>
            <TabsTrigger value="findings" data-testid="tab-findings">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t("adminCompliance.tabs.findings")}
            </TabsTrigger>
            <TabsTrigger value="audits" data-testid="tab-audits">
              <Calendar className="w-4 h-4 mr-2" />
              {t("adminCompliance.tabs.audits")}
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="w-4 h-4 mr-2" />
              {t("adminCompliance.tabs.reports")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frameworks" data-testid="tabcontent-frameworks">
            <Card data-testid="card-frameworks">
              <CardHeader>
                <CardTitle>{t("adminCompliance.frameworks.title")}</CardTitle>
                <CardDescription>{t("adminCompliance.frameworks.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" data-testid={`skeleton-framework-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-frameworks">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminCompliance.frameworks.columns.framework")}</TableHead>
                        <TableHead>{t("adminCompliance.frameworks.columns.status")}</TableHead>
                        <TableHead>{t("adminCompliance.frameworks.columns.lastAudit")}</TableHead>
                        <TableHead>{t("adminCompliance.frameworks.columns.nextAudit")}</TableHead>
                        <TableHead>{t("adminCompliance.frameworks.columns.score")}</TableHead>
                        <TableHead>{t("adminCompliance.frameworks.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {frameworks.map((fw, index) => (
                        <TableRow key={index} data-testid={`row-framework-${index}`}>
                          <TableCell className="font-medium" data-testid={`text-framework-${index}`}>{fw.name}</TableCell>
                          <TableCell>
                            {fw.status === "compliant" ? (
                              <Badge className="bg-green-500" data-testid={`badge-status-${index}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t("adminCompliance.frameworks.compliant")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-status-${index}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {t("adminCompliance.frameworks.inProgress")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{fw.lastAudit}</TableCell>
                          <TableCell>{fw.nextAudit}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={fw.score} className="w-16" data-testid={`progress-framework-${index}`} />
                              <span className={fw.score >= 95 ? "text-green-500" : fw.score >= 90 ? "text-yellow-500" : "text-red-500"} data-testid={`text-score-${index}`}>
                                {fw.score}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => {
                                  setSelectedFramework(fw);
                                  setShowFrameworkDetail(true);
                                }}
                                data-testid={`button-view-${index}`}
                              >
                                <Eye className="h-4 w-4" />
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

          <TabsContent value="findings" data-testid="tabcontent-findings">
            <Card data-testid="card-findings">
              <CardHeader>
                <CardTitle>{t("adminCompliance.findings.title")}</CardTitle>
                <CardDescription>{t("adminCompliance.findings.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" data-testid={`skeleton-finding-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-findings">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminCompliance.findings.columns.category")}</TableHead>
                        <TableHead>{t("adminCompliance.findings.columns.finding")}</TableHead>
                        <TableHead>{t("adminCompliance.findings.columns.severity")}</TableHead>
                        <TableHead>{t("adminCompliance.findings.columns.status")}</TableHead>
                        <TableHead>{t("adminCompliance.findings.columns.dueDate")}</TableHead>
                        <TableHead>{t("adminCompliance.findings.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentFindings.map((finding) => (
                        <TableRow key={finding.id} data-testid={`row-finding-${finding.id}`}>
                          <TableCell data-testid={`text-category-${finding.id}`}>{finding.category}</TableCell>
                          <TableCell data-testid={`text-finding-${finding.id}`}>{finding.finding}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                finding.severity === "high" ? "destructive" :
                                finding.severity === "medium" ? "default" : "secondary"
                              }
                              data-testid={`badge-severity-${finding.id}`}
                            >
                              {finding.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {finding.status === "resolved" ? (
                              <Badge className="bg-green-500" data-testid={`badge-finding-status-${finding.id}`}>{t("adminCompliance.findings.resolved")}</Badge>
                            ) : finding.status === "in_progress" ? (
                              <Badge variant="secondary" data-testid={`badge-finding-status-${finding.id}`}>{t("adminCompliance.findings.inProgress")}</Badge>
                            ) : (
                              <Badge variant="outline" data-testid={`badge-finding-status-${finding.id}`}>{t("adminCompliance.findings.open")}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{finding.due}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" data-testid={`button-manage-${finding.id}`}>{t("adminCompliance.findings.manage")}</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audits" data-testid="tabcontent-audits">
            <Card data-testid="card-audits">
              <CardHeader>
                <CardTitle>{t("adminCompliance.audits.title")}</CardTitle>
                <CardDescription>{t("adminCompliance.audits.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" data-testid={`skeleton-audit-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-audits">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminCompliance.audits.columns.audit")}</TableHead>
                        <TableHead>{t("adminCompliance.audits.columns.date")}</TableHead>
                        <TableHead>{t("adminCompliance.audits.columns.auditor")}</TableHead>
                        <TableHead>{t("adminCompliance.audits.columns.status")}</TableHead>
                        <TableHead>{t("adminCompliance.audits.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditSchedule.map((audit, index) => (
                        <TableRow key={index} data-testid={`row-audit-${index}`}>
                          <TableCell className="font-medium" data-testid={`text-audit-${index}`}>{audit.audit}</TableCell>
                          <TableCell>{audit.date}</TableCell>
                          <TableCell>{audit.auditor}</TableCell>
                          <TableCell>
                            <Badge variant={audit.status === "scheduled" ? "default" : "secondary"} data-testid={`badge-audit-status-${index}`}>
                              {audit.status === "scheduled" ? t("adminCompliance.audits.scheduled") : t("adminCompliance.audits.pending")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" data-testid={`button-prepare-${index}`}>{t("adminCompliance.audits.prepare")}</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" data-testid="tabcontent-reports">
            <Card data-testid="card-reports">
              <CardHeader>
                <CardTitle>{t("adminCompliance.reports.title")}</CardTitle>
                <CardDescription>{t("adminCompliance.reports.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" data-testid={`skeleton-report-${i}`} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-24 flex-col" data-testid="button-report-soc2">
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.soc2")}
                    </Button>
                    <Button variant="outline" className="h-24 flex-col" data-testid="button-report-gdpr">
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.gdpr")}
                    </Button>
                    <Button variant="outline" className="h-24 flex-col" data-testid="button-report-security">
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.securityAssessment")}
                    </Button>
                    <Button variant="outline" className="h-24 flex-col" data-testid="button-report-risk">
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.riskAssessment")}
                    </Button>
                    <Button variant="outline" className="h-24 flex-col" data-testid="button-report-audit">
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.auditTrail")}
                    </Button>
                    <Button variant="outline" className="h-24 flex-col" data-testid="button-report-custom">
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.customReport")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedFramework && (
        <DetailSheet
          open={showFrameworkDetail}
          onOpenChange={setShowFrameworkDetail}
          title={selectedFramework.name}
          icon={<Shield className="h-5 w-5" />}
          sections={getFrameworkDetailSections(selectedFramework)}
        />
      )}

      <ConfirmationDialog
        open={showAssessmentConfirm}
        onOpenChange={setShowAssessmentConfirm}
        title={t("adminCompliance.confirm.assessmentTitle")}
        description={t("adminCompliance.confirm.assessmentDesc")}
        onConfirm={confirmAssessment}
        isLoading={runAssessmentMutation.isPending}
        destructive={false}
      />
    </ScrollArea>
  );
}
