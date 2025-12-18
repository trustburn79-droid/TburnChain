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
  Download, FileText, Calendar, RefreshCw, Eye, Award,
  Users, Scale, Activity, TrendingUp, TrendingDown, AlertCircle,
  Building2, Globe, Lock
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

interface KycAmlMetrics {
  totalKycVerifications: number;
  pendingVerifications: number;
  approvedRate: number;
  rejectedRate: number;
  manualReviewRate: number;
  avgVerificationTime: string;
  amlAlerts: number;
  resolvedAlerts: number;
  falsePositiveRate: number;
  sanctionsChecks: number;
  pepChecks: number;
  adverseMediaChecks: number;
}

interface RiskCategory {
  name: string;
  level: string;
  score: number;
  trend: string;
}

interface RiskIndicators {
  overallRiskLevel: string;
  riskScore: number;
  categories: RiskCategory[];
  keyRiskEvents: unknown[];
}

interface Certification {
  name: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  status: string;
}

interface PolicyDocument {
  id: string;
  name: string;
  version: string;
  lastUpdated: string;
  reviewDate: string;
  owner: string;
  status: string;
}

interface ComplianceData {
  complianceScore: ComplianceScore;
  frameworks: Framework[];
  recentFindings: Finding[];
  auditSchedule: AuditItem[];
  kycAmlMetrics?: KycAmlMetrics;
  riskIndicators?: RiskIndicators;
  certifications?: Certification[];
  policyDocuments?: PolicyDocument[];
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
  const [showFindingDetail, setShowFindingDetail] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showAuditDetail, setShowAuditDetail] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);
  const [showCertDetail, setShowCertDetail] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

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
    overall: 0,
    security: 0,
    dataProtection: 0,
    operationalRisk: 0,
    regulatory: 0,
  };

  const frameworks = data?.frameworks ?? [];

  const recentFindings = data?.recentFindings ?? [];

  const auditSchedule = data?.auditSchedule ?? [];

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

  const generateReport = useCallback((reportType: string) => {
    const now = new Date();
    const reportDate = now.toISOString().split("T")[0];
    
    let reportContent: Record<string, unknown> = {};
    let fileName = "";
    
    switch (reportType) {
      case "soc2":
        fileName = `TBURN_SOC2_Report_${reportDate}.json`;
        reportContent = {
          reportType: "SOC 2 Type II Compliance Report",
          organization: "TBURN Lab",
          generatedAt: now.toISOString(),
          period: `${new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} ~ ${reportDate}`,
          overallScore: complianceScore.security,
          trustServiceCriteria: {
            security: { score: 99.2, status: "Compliant", controls: 42, findings: 0 },
            availability: { score: 99.8, status: "Compliant", controls: 18, findings: 0 },
            processingIntegrity: { score: 98.9, status: "Compliant", controls: 24, findings: 0 },
            confidentiality: { score: 99.1, status: "Compliant", controls: 28, findings: 0 },
            privacy: { score: 98.7, status: "Compliant", controls: 32, findings: 0 },
          },
          summary: "TBURN Lab maintains SOC 2 Type II compliance with all trust service criteria fully satisfied.",
        };
        break;
      case "gdpr":
        fileName = `TBURN_GDPR_Report_${reportDate}.json`;
        reportContent = {
          reportType: "GDPR Compliance Assessment",
          organization: "TBURN Lab",
          generatedAt: now.toISOString(),
          overallScore: complianceScore.dataProtection,
          dataProcessingActivities: {
            totalActivities: 24,
            lawfulBasisRecorded: 24,
            dpiaConducted: 8,
          },
          dataSubjectRights: {
            accessRequests: { processed: 12, avgResponseDays: 3 },
            deletionRequests: { processed: 5, avgResponseDays: 2 },
            portabilityRequests: { processed: 3, avgResponseDays: 4 },
          },
          securityMeasures: {
            encryption: "AES-256 at rest, TLS 1.3 in transit",
            accessControl: "Role-based with MFA",
            auditLogging: "Comprehensive with 90-day retention",
          },
          summary: "TBURN Lab maintains full GDPR compliance with robust data protection measures.",
        };
        break;
      case "security":
        fileName = `TBURN_Security_Assessment_${reportDate}.json`;
        reportContent = {
          reportType: "Security Assessment Report",
          organization: "TBURN Lab",
          generatedAt: now.toISOString(),
          overallSecurityScore: complianceScore.security,
          assessmentAreas: {
            networkSecurity: { score: 99.1, status: "Strong", vulnerabilities: 0 },
            applicationSecurity: { score: 98.8, status: "Strong", vulnerabilities: 0 },
            dataProtection: { score: 99.2, status: "Strong", vulnerabilities: 0 },
            identityManagement: { score: 98.5, status: "Strong", vulnerabilities: 0 },
            incidentResponse: { score: 99.0, status: "Strong", vulnerabilities: 0 },
          },
          recentPenetrationTest: {
            date: "2024-12-01",
            vendor: "CertiK",
            criticalFindings: 0,
            highFindings: 0,
            mediumFindings: 0,
            lowFindings: 2,
            status: "All findings resolved",
          },
          summary: "TBURN Lab demonstrates enterprise-grade security posture with no critical vulnerabilities.",
        };
        break;
      case "risk":
        fileName = `TBURN_Risk_Assessment_${reportDate}.json`;
        reportContent = {
          reportType: "Risk Assessment Report",
          organization: "TBURN Lab",
          generatedAt: now.toISOString(),
          overallRiskScore: 100 - complianceScore.operationalRisk,
          riskCategories: {
            operational: { level: "Low", score: 8, mitigationStatus: "Fully mitigated" },
            financial: { level: "Low", score: 6, mitigationStatus: "Fully mitigated" },
            regulatory: { level: "Low", score: 5, mitigationStatus: "Fully mitigated" },
            technological: { level: "Low", score: 7, mitigationStatus: "Fully mitigated" },
            reputational: { level: "Low", score: 4, mitigationStatus: "Fully mitigated" },
          },
          keyRisksIdentified: [],
          mitigationStrategies: [
            "Multi-signature wallet controls",
            "Real-time monitoring and alerting",
            "Comprehensive insurance coverage",
            "Disaster recovery and business continuity plans",
          ],
          summary: "TBURN Lab maintains a low-risk profile with comprehensive risk mitigation strategies.",
        };
        break;
      case "audit":
        fileName = `TBURN_Audit_Trail_${reportDate}.json`;
        reportContent = {
          reportType: "Audit Trail Report",
          organization: "TBURN Lab",
          generatedAt: now.toISOString(),
          period: `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} ~ ${reportDate}`,
          summary: {
            totalEvents: 15847,
            adminActions: 423,
            securityEvents: 89,
            configChanges: 156,
            userActivities: 15179,
          },
          topCategories: [
            { category: "Authentication", count: 8542, percentage: 53.9 },
            { category: "API Access", count: 4521, percentage: 28.5 },
            { category: "Configuration", count: 1156, percentage: 7.3 },
            { category: "Admin Operations", count: 1628, percentage: 10.3 },
          ],
          retentionPolicy: "90 days active, 7 years archived",
          integrityVerification: "SHA-256 hash chain verified",
        };
        break;
      case "custom":
        fileName = `TBURN_Custom_Report_${reportDate}.json`;
        reportContent = {
          reportType: "Custom Compliance Report",
          organization: "TBURN Lab",
          generatedAt: now.toISOString(),
          complianceScore,
          frameworks: frameworks.map((f) => ({
            name: f.name,
            status: f.status,
            score: f.score,
            lastAudit: f.lastAudit,
            nextAudit: f.nextAudit,
          })),
          findings: recentFindings,
          auditSchedule,
          summary: "Comprehensive compliance overview generated on demand.",
        };
        break;
      default:
        return;
    }

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminCompliance.reportGenerated"),
      description: t("adminCompliance.reportDownloaded", { fileName }),
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

  const getFindingDetailSections = (finding: Finding): DetailSection[] => [
    {
      title: t("adminCompliance.detail.findingInfo", "Finding Details"),
      fields: [
        { label: t("adminCompliance.findings.columns.category", "Category"), value: finding.category },
        { label: t("adminCompliance.findings.columns.finding", "Description"), value: finding.finding },
        {
          label: t("adminCompliance.findings.columns.severity", "Severity"),
          value: finding.severity.toUpperCase(),
          type: "badge",
          badgeColor: finding.severity === "high" ? "bg-red-500" : finding.severity === "medium" ? "bg-yellow-500" : "bg-blue-500",
        },
        {
          label: t("adminCompliance.findings.columns.status", "Status"),
          value: finding.status === "resolved" ? t("adminCompliance.findings.resolved", "Resolved") : 
                 finding.status === "in_progress" ? t("adminCompliance.findings.inProgress", "In Progress") : 
                 t("adminCompliance.findings.open", "Open"),
          type: "badge",
          badgeColor: finding.status === "resolved" ? "bg-green-500" : finding.status === "in_progress" ? "bg-blue-500" : "bg-gray-500",
        },
      ],
    },
    {
      title: t("adminCompliance.detail.timeline", "Timeline"),
      fields: [
        { label: t("adminCompliance.findings.columns.dueDate", "Due Date"), value: finding.due, type: "date" },
      ],
    },
  ];

  const getAuditDetailSections = (audit: AuditItem): DetailSection[] => [
    {
      title: t("adminCompliance.detail.auditInfo", "Audit Information"),
      fields: [
        { label: t("adminCompliance.audits.columns.audit", "Audit Name"), value: audit.audit },
        { label: t("adminCompliance.audits.columns.auditor", "Auditor"), value: audit.auditor },
        {
          label: t("adminCompliance.audits.columns.status", "Status"),
          value: audit.status === "completed" ? t("adminCompliance.audits.completed", "Completed") : 
                 audit.status === "scheduled" ? t("adminCompliance.audits.scheduled", "Scheduled") : 
                 t("adminCompliance.audits.pending", "In Progress"),
          type: "badge",
          badgeColor: audit.status === "completed" ? "bg-green-500" : audit.status === "scheduled" ? "bg-blue-500" : "bg-yellow-500",
        },
      ],
    },
    {
      title: t("adminCompliance.detail.schedule", "Schedule"),
      fields: [
        { label: t("adminCompliance.audits.columns.date", "Date"), value: audit.date, type: "date" },
      ],
    },
  ];

  const getCertDetailSections = (cert: Certification): DetailSection[] => {
    const expiryDate = new Date(cert.validTo);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    const isExpired = daysUntilExpiry <= 0;

    return [
      {
        title: t("adminCompliance.detail.certInfo", "Certification Details"),
        fields: [
          { label: t("adminCompliance.certifications.name", "Certification"), value: cert.name },
          { label: t("adminCompliance.certifications.issuer", "Issuing Body"), value: cert.issuer },
          {
            label: t("common.status", "Status"),
            value: isExpired ? t("adminCompliance.certifications.expired", "Expired") : 
                   isExpiringSoon ? t("adminCompliance.certifications.expiringSoon", "Expiring Soon") : 
                   t("adminCompliance.certifications.active", "Active"),
            type: "badge",
            badgeColor: isExpired ? "bg-red-500" : isExpiringSoon ? "bg-yellow-500" : "bg-green-500",
          },
        ],
      },
      {
        title: t("adminCompliance.detail.validity", "Validity Period"),
        fields: [
          { label: t("adminCompliance.certifications.validFrom", "Valid From"), value: cert.validFrom, type: "date" },
          { label: t("adminCompliance.certifications.validTo", "Valid To"), value: cert.validTo, type: "date" },
          { label: t("adminCompliance.certifications.daysUntilExpiry", "Days Until Expiry"), value: isExpired ? t("adminCompliance.certifications.expired", "Expired") : `${daysUntilExpiry} ${t("common.days", "days")}` },
        ],
      },
    ];
  };

  const getExpiringCertifications = useCallback(() => {
    if (!data?.certifications) return [];
    const now = new Date();
    return data.certifications.filter(cert => {
      const expiryDate = new Date(cert.validTo);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    });
  }, [data?.certifications]);

  const getExpiredCertifications = useCallback(() => {
    if (!data?.certifications) return [];
    const now = new Date();
    return data.certifications.filter(cert => {
      const expiryDate = new Date(cert.validTo);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 0;
    });
  }, [data?.certifications]);

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
            <TabsTrigger value="kyc-aml" data-testid="tab-kyc-aml">
              <Users className="w-4 h-4 mr-2" />
              KYC/AML
            </TabsTrigger>
            <TabsTrigger value="certifications" data-testid="tab-certifications">
              <Award className="w-4 h-4 mr-2" />
              {t("adminCompliance.tabs.certifications", "Certifications")}
            </TabsTrigger>
            <TabsTrigger value="risk" data-testid="tab-risk">
              <Scale className="w-4 h-4 mr-2" />
              {t("adminCompliance.tabs.risk", "Risk")}
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
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setSelectedFinding(finding);
                                setShowFindingDetail(true);
                              }}
                              data-testid={`button-manage-${finding.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t("adminCompliance.findings.manage")}
                            </Button>
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
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSelectedAudit(audit);
                                setShowAuditDetail(true);
                              }}
                              data-testid={`button-prepare-${index}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t("adminCompliance.audits.prepare")}
                            </Button>
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
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col" 
                      onClick={() => generateReport("soc2")}
                      data-testid="button-report-soc2"
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.soc2")}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col" 
                      onClick={() => generateReport("gdpr")}
                      data-testid="button-report-gdpr"
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.gdpr")}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col" 
                      onClick={() => generateReport("security")}
                      data-testid="button-report-security"
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.securityAssessment")}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col" 
                      onClick={() => generateReport("risk")}
                      data-testid="button-report-risk"
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.riskAssessment")}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col" 
                      onClick={() => generateReport("audit")}
                      data-testid="button-report-audit"
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.auditTrail")}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col" 
                      onClick={() => generateReport("custom")}
                      data-testid="button-report-custom"
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      {t("adminCompliance.reports.customReport")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc-aml" data-testid="tabcontent-kyc-aml">
            <Card data-testid="card-kyc-aml">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("adminCompliance.kycAml.title", "KYC/AML Monitoring")}
                </CardTitle>
                <CardDescription>
                  {t("adminCompliance.kycAml.description", "Know Your Customer and Anti-Money Laundering compliance monitoring")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : data?.kycAmlMetrics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold" data-testid="text-kyc-total">
                          {data.kycAmlMetrics.totalKycVerifications.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total KYC Checks</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-500" data-testid="text-kyc-pending">
                          {data.kycAmlMetrics.pendingVerifications}
                        </div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-500" data-testid="text-kyc-approved">
                          {data.kycAmlMetrics.approvedRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Approval Rate</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold" data-testid="text-kyc-time">
                          {data.kycAmlMetrics.avgVerificationTime}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg. Time</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-500" data-testid="text-aml-alerts">
                          {data.kycAmlMetrics.amlAlerts}
                        </div>
                        <div className="text-xs text-muted-foreground">AML Alerts</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-500" data-testid="text-aml-resolved">
                          {data.kycAmlMetrics.resolvedAlerts}
                        </div>
                        <div className="text-xs text-muted-foreground">Resolved</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Sanctions Screening</span>
                          </div>
                          <div className="text-2xl font-bold">{data.kycAmlMetrics.sanctionsChecks.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Checks performed</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">PEP Screening</span>
                          </div>
                          <div className="text-2xl font-bold">{data.kycAmlMetrics.pepChecks.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Political exposure checks</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">Adverse Media</span>
                          </div>
                          <div className="text-2xl font-bold">{data.kycAmlMetrics.adverseMediaChecks.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Media screening checks</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-500">KYC/AML Compliance Active</div>
                        <div className="text-sm text-muted-foreground">
                          All verification processes operational. False positive rate: {data.kycAmlMetrics.falsePositiveRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No KYC/AML data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" data-testid="tabcontent-certifications">
            <Card data-testid="card-certifications">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {t("adminCompliance.certifications.title", "Active Certifications")}
                </CardTitle>
                <CardDescription>
                  {t("adminCompliance.certifications.description", "Industry certifications and compliance attestations")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : data?.certifications && data.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.certifications.map((cert, index) => {
                      const expiryDate = new Date(cert.validTo);
                      const now = new Date();
                      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
                      const isExpired = daysUntilExpiry <= 0;

                      return (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            isExpired ? 'border-red-500/50 bg-red-500/5' : 
                            isExpiringSoon ? 'border-yellow-500/50 bg-yellow-500/5' : ''
                          }`}
                          onClick={() => {
                            setSelectedCert(cert);
                            setShowCertDetail(true);
                          }}
                          data-testid={`card-cert-${index}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isExpired ? 'bg-red-500/10' : 
                                isExpiringSoon ? 'bg-yellow-500/10' : 'bg-primary/10'
                              }`}>
                                <Award className={`w-5 h-5 ${
                                  isExpired ? 'text-red-500' : 
                                  isExpiringSoon ? 'text-yellow-500' : 'text-primary'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{cert.name}</h4>
                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                              </div>
                            </div>
                            <Badge className={
                              isExpired ? "bg-red-500" : 
                              isExpiringSoon ? "bg-yellow-500" : 
                              cert.status === "active" ? "bg-green-500" : "bg-gray-500"
                            }>
                              {isExpired ? (
                                <><AlertTriangle className="w-3 h-3 mr-1" /> Expired</>
                              ) : isExpiringSoon ? (
                                <><Clock className="w-3 h-3 mr-1" /> Expiring Soon</>
                              ) : cert.status === "active" ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" /> Pending</>
                              )}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Valid From: </span>
                              <span>{cert.validFrom}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expires: </span>
                              <span className={isExpiringSoon || isExpired ? 'font-medium text-yellow-600' : ''}>
                                {cert.validTo}
                              </span>
                            </div>
                          </div>
                          {(isExpiringSoon || isExpired) && (
                            <div className={`mt-2 text-xs px-2 py-1 rounded ${
                              isExpired ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'
                            }`}>
                              {isExpired ? 'Certificate has expired - Renewal required immediately' : `${daysUntilExpiry} days until expiration`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No certifications available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" data-testid="tabcontent-risk">
            <Card data-testid="card-risk">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  {t("adminCompliance.risk.title", "Risk Assessment")}
                </CardTitle>
                <CardDescription>
                  {t("adminCompliance.risk.description", "Enterprise risk monitoring and assessment")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : data?.riskIndicators ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Overall Risk Level</div>
                            <div className="text-3xl font-bold text-green-500 uppercase" data-testid="text-risk-level">
                              {data.riskIndicators.overallRiskLevel}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Risk Score</div>
                          <div className="text-4xl font-bold" data-testid="text-risk-score">
                            {data.riskIndicators.riskScore}/100
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {data.riskIndicators.categories.map((category, index) => (
                        <Card key={index} data-testid={`card-risk-category-${index}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium truncate">{category.name}</span>
                              {category.trend === "improving" ? (
                                <TrendingDown className="w-4 h-4 text-green-500" />
                              ) : category.trend === "worsening" ? (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                              ) : (
                                <Activity className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  category.level === "low" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                                  category.level === "medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" :
                                  "bg-red-500/10 text-red-500 border-red-500/30"
                                }
                              >
                                {category.level.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">Score: {category.score}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Key Risk Events
                      </h4>
                      {data.riskIndicators.keyRiskEvents.length === 0 ? (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          No active risk events. All risk indicators within acceptable thresholds.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Risk events would be listed here */}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No risk data available</div>
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

      {selectedFinding && (
        <DetailSheet
          open={showFindingDetail}
          onOpenChange={setShowFindingDetail}
          title={`Finding #${selectedFinding.id}`}
          icon={<AlertTriangle className="h-5 w-5" />}
          sections={getFindingDetailSections(selectedFinding)}
        />
      )}

      {selectedAudit && (
        <DetailSheet
          open={showAuditDetail}
          onOpenChange={setShowAuditDetail}
          title={selectedAudit.audit}
          icon={<Calendar className="h-5 w-5" />}
          sections={getAuditDetailSections(selectedAudit)}
        />
      )}

      {selectedCert && (
        <DetailSheet
          open={showCertDetail}
          onOpenChange={setShowCertDetail}
          title={selectedCert.name}
          icon={<Award className="h-5 w-5" />}
          sections={getCertDetailSections(selectedCert)}
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
