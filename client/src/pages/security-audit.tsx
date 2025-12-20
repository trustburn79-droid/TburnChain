import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  CheckCircle2,
  FileText,
  ExternalLink,
  Lock,
  Eye,
  AlertTriangle,
  Zap,
  Globe,
  Home,
  HelpCircle,
  ScanLine,
  User,
  Download,
  Award,
  Clock,
  Building,
  Code,
  Search,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

interface AuditReport {
  id: string;
  auditor: string;
  auditorLogo: string;
  date: string;
  contractName: string;
  version: string;
  status: "passed" | "passed_with_notes" | "in_progress";
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  informational: number;
  score: number;
  reportUrl: string;
  scope: string[];
}

const AUDIT_REPORTS: AuditReport[] = [
  {
    id: "audit-001",
    auditor: "CertiK",
    auditorLogo: "C",
    date: "2024-12-15",
    contractName: "TBURN Core Protocol",
    version: "v1.0.0",
    status: "passed",
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 2,
    informational: 5,
    score: 98,
    reportUrl: "#",
    scope: ["Token Contract", "Staking Module", "Governance", "Bridge Contracts"],
  },
  {
    id: "audit-002",
    auditor: "Trail of Bits",
    auditorLogo: "T",
    date: "2024-12-10",
    contractName: "TBURN Bridge Protocol",
    version: "v1.0.0",
    status: "passed",
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 1,
    lowIssues: 3,
    informational: 8,
    score: 96,
    reportUrl: "#",
    scope: ["Cross-chain Bridge", "Validator Set", "Liquidity Pools"],
  },
  {
    id: "audit-003",
    auditor: "OpenZeppelin",
    auditorLogo: "O",
    date: "2024-12-05",
    contractName: "TBURN NFT & DeFi Modules",
    version: "v1.0.0",
    status: "passed_with_notes",
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 2,
    lowIssues: 4,
    informational: 12,
    score: 94,
    reportUrl: "#",
    scope: ["NFT Marketplace", "DEX Router", "Lending Protocol", "Yield Farming"],
  },
  {
    id: "audit-004",
    auditor: "Quantstamp",
    auditorLogo: "Q",
    date: "2024-11-28",
    contractName: "TBURN Consensus Layer",
    version: "v1.0.0",
    status: "passed",
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 1,
    informational: 4,
    score: 99,
    reportUrl: "#",
    scope: ["BFT Consensus", "Validator Selection", "Slashing Mechanism"],
  },
];

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: "Quantum-Resistant Signatures",
    description: "Future-proof cryptographic signatures resistant to quantum computing attacks",
  },
  {
    icon: Shield,
    title: "Multi-Signature Treasury",
    description: "All treasury operations require 4-of-7 multi-signature approval",
  },
  {
    icon: Eye,
    title: "Real-time Monitoring",
    description: "24/7 automated security monitoring with instant threat detection",
  },
  {
    icon: Zap,
    title: "Circuit Breakers",
    description: "Automatic pause mechanisms for abnormal transaction patterns",
  },
  {
    icon: Code,
    title: "Formal Verification",
    description: "Critical contracts mathematically verified for correctness",
  },
  {
    icon: Search,
    title: "Bug Bounty Program",
    description: "Up to $500,000 rewards for critical vulnerability discoveries",
  },
];

export default function SecurityAuditPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [selectedAudit, setSelectedAudit] = useState<AuditReport | null>(null);

  const totalScore = Math.round(
    AUDIT_REPORTS.reduce((acc, r) => acc + r.score, 0) / AUDIT_REPORTS.length
  );

  const getStatusBadge = (status: AuditReport["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{t("security.passed", "Passed")}</Badge>;
      case "passed_with_notes":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{t("security.passedWithNotes", "Passed with Notes")}</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{t("security.inProgress", "In Progress")}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-400";
    if (score >= 85) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("security.title", "Security Audit")}</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t("security.subtitle", "TBURN Mainnet Security Reports")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="icon"><Home className="w-4 h-4" /></Button></Link>
            <Link href="/qna"><Button variant="ghost" size="icon"><HelpCircle className="w-4 h-4" /></Button></Link>
            <Link href="/scan"><Button variant="ghost" size="icon"><ScanLine className="w-4 h-4" /></Button></Link>
            <Link href="/user"><Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button></Link>
            <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
              <SelectTrigger className="w-10 h-10 p-0 rounded-full border-0 justify-center">
                <Globe className="w-5 h-5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t("security.overallScore", "Overall Score")}
                  </p>
                  <p className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>{totalScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t("security.auditsCompleted", "Audits Completed")}
                  </p>
                  <p className="text-2xl font-bold">{AUDIT_REPORTS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t("security.criticalIssues", "Critical Issues")}
                  </p>
                  <p className="text-2xl font-bold text-green-400">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t("security.auditors", "Auditors")}
                  </p>
                  <p className="text-2xl font-bold">4</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t("security.auditReports", "Audit Reports")}
            </CardTitle>
            <CardDescription>
              {t("security.auditReportsDesc", "Complete security audit reports from leading blockchain security firms")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AUDIT_REPORTS.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors cursor-pointer`}
                  onClick={() => setSelectedAudit(report)}
                  data-testid={`audit-report-${report.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {report.auditorLogo}
                      </div>
                      <div>
                        <h3 className="font-semibold">{report.contractName}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t("security.by", "by")} {report.auditor} • {report.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(report.score)}`}>{report.score}/100</p>
                        {getStatusBadge(report.status)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2 text-center text-sm">
                    <div>
                      <p className="text-red-400 font-bold">{report.criticalIssues}</p>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t("security.critical", "Critical")}</p>
                    </div>
                    <div>
                      <p className="text-orange-400 font-bold">{report.highIssues}</p>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t("security.high", "High")}</p>
                    </div>
                    <div>
                      <p className="text-yellow-400 font-bold">{report.mediumIssues}</p>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t("security.medium", "Medium")}</p>
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold">{report.lowIssues}</p>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t("security.low", "Low")}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold">{report.informational}</p>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t("security.info", "Info")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t("security.securityFeatures", "Security Features")}
            </CardTitle>
            <CardDescription>
              {t("security.securityFeaturesDesc", "Built-in security mechanisms protecting the TBURN ecosystem")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECURITY_FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 text-orange-400" />
              <div>
                <h3 className="text-xl font-bold">{t("security.bugBounty", "Bug Bounty Program")}</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {t("security.bugBountyDesc", "Earn up to $500,000 for discovering critical vulnerabilities")}
                </p>
              </div>
            </div>
            <Link href="/bug-bounty">
              <Button className="bg-orange-500 hover:bg-orange-600">
                {t("security.learnMore", "Learn More")}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
