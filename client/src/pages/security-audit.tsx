import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  CheckCircle2,
  FileText,
  ExternalLink,
  Download,
  Bug,
  Wrench,
  Award,
  X,
} from "lucide-react";
import { Link } from "wouter";

interface AuditFirm {
  id: string;
  name: string;
  logoStyle: string;
  scope: string;
  date: string;
  score: string;
  status: "passed" | "in_progress";
  reportFile: string;
}

interface Finding {
  id: string;
  severity: "critical" | "major" | "medium" | "info";
  title: string;
  description: string;
  status: "fixed" | "resolved" | "acknowledged";
  date: string;
}

const AUDIT_FIRMS: AuditFirm[] = [
  {
    id: "certik",
    name: "CERTIK",
    logoStyle: "bg-slate-900 dark:bg-slate-800",
    scope: "Core Consensus & Staking",
    date: "Dec 15, 2024",
    score: "99.5 / 100",
    status: "passed",
    reportFile: "TBURN_Core_Audit_Final.pdf",
  },
  {
    id: "slowmist",
    name: "SlowMist",
    logoStyle: "bg-slate-800 dark:bg-slate-700 italic",
    scope: "Tokenomics & Bridge",
    date: "Nov 20, 2024",
    score: "Low Risk",
    status: "passed",
    reportFile: "TBURN_Token_Bridge_Audit.pdf",
  },
  {
    id: "hacken",
    name: "HACKEN",
    logoStyle: "bg-green-900 dark:bg-green-800",
    scope: "Smart Contracts (DEX)",
    date: "Dec 01, 2024",
    score: "10 / 10",
    status: "passed",
    reportFile: "TBURN_SC_Audit.pdf",
  },
];

const FINDINGS: Finding[] = [
  {
    id: "TB-001",
    severity: "major",
    title: "Reentrancy Guard Optimization",
    description: "Staking contract potential reentrancy in withdraw function.",
    status: "fixed",
    date: "2024-11-15",
  },
  {
    id: "TB-002",
    severity: "medium",
    title: "Gas Limit Threshold",
    description: "Potential out-of-gas error in batch processing.",
    status: "resolved",
    date: "2024-11-18",
  },
  {
    id: "TB-003",
    severity: "info",
    title: "Variable Naming Convention",
    description: "Code style consistency improvements.",
    status: "acknowledged",
    date: "2024-11-20",
  },
];

export default function SecurityAuditPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedReport, setSelectedReport] = useState<AuditFirm | null>(null);
  
  const isDark = theme === 'dark';

  const getSeverityBadge = (severity: Finding["severity"]) => {
    const styles = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      major: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    const labels = {
      critical: "CRITICAL",
      major: "MAJOR",
      medium: "MEDIUM",
      info: "INFO",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[severity]}`}>
        {labels[severity]}
      </span>
    );
  };

  const getStatusDisplay = (status: Finding["status"]) => {
    if (status === "fixed" || status === "resolved") {
      return (
        <span className="text-emerald-500 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          {status === "fixed" ? "Fixed" : "Resolved"}
        </span>
      );
    }
    return (
      <span className="text-muted-foreground font-bold flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4" />
        Acknowledged
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'} transition-colors duration-300`}>
      <header className={`h-16 border-b ${isDark ? 'border-gray-800 bg-[#0B1120]/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10`}>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full ${isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-100 border-green-200'} text-green-600 dark:text-green-400 text-xs font-bold border flex items-center gap-2`}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Security Status: SAFE
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">Last scanned: 10 mins ago</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`${isDark ? 'bg-[#151E32]/70 border-white/5' : 'bg-white/90 border-slate-200'} backdrop-blur-xl p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center items-center text-center border border-t-4 border-t-emerald-600`} style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Total Security Score
            </h2>
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  className={isDark ? 'text-gray-700' : 'text-slate-200'} 
                />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="440" 
                  strokeDashoffset="10" 
                  className="text-emerald-600 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-mono font-bold">98</span>
                <span className="text-xs font-bold text-emerald-600">/ 100</span>
              </div>
            </div>
            <p className="text-muted-foreground font-medium">Tier 1 Security Verified</p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${isDark ? 'bg-[#151E32]/70 border-white/5' : 'bg-white/90 border-slate-200'} backdrop-blur-xl p-6 rounded-2xl border flex flex-col justify-between`}>
              <div className="mb-4 text-blue-500 text-3xl">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">3 / 3</p>
                <p className="text-sm text-muted-foreground">Audits Passed</p>
              </div>
            </div>
            <div className={`${isDark ? 'bg-[#151E32]/70 border-white/5' : 'bg-white/90 border-slate-200'} backdrop-blur-xl p-6 rounded-2xl border flex flex-col justify-between`}>
              <div className="mb-4 text-red-500 text-3xl">
                <Bug className="w-8 h-8" />
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">0</p>
                <p className="text-sm text-muted-foreground">Critical Issues Found</p>
              </div>
            </div>
            <div className={`${isDark ? 'bg-[#151E32]/70 border-white/5' : 'bg-white/90 border-slate-200'} backdrop-blur-xl p-6 rounded-2xl border flex flex-col justify-between`}>
              <div className="mb-4 text-yellow-500 text-3xl">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">100%</p>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Verified Audit Firms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AUDIT_FIRMS.map((firm) => (
              <div 
                key={firm.id}
                className={`${isDark ? 'bg-[#151E32]/70 border-gray-700 hover:border-emerald-600' : 'bg-white/90 border-slate-200 hover:border-emerald-600'} backdrop-blur-xl p-6 rounded-2xl border transition-colors group`}
                data-testid={`audit-firm-${firm.id}`}
              >
                <div className="flex justify-between items-start mb-6 gap-3 flex-wrap">
                  <div className={`h-12 px-4 min-w-[8rem] ${firm.logoStyle} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                    {firm.name}
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    PASSED
                  </Badge>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Scope</span>
                    <span className="font-bold text-right">{firm.scope}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-bold">{firm.date}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-bold text-emerald-600">{firm.score}</span>
                  </div>
                </div>
                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={() => setSelectedReport(firm)}
                  data-testid={`button-view-report-${firm.id}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Report
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className={`${isDark ? 'bg-[#151E32]/70 border-white/5' : 'bg-white/90 border-slate-200'} backdrop-blur-xl rounded-2xl overflow-hidden border mb-8`}>
          <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-slate-200'} flex flex-wrap justify-between items-center gap-4`}>
            <h3 className="font-bold">Detailed Findings & Resolutions</h3>
            <div className="flex gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-red-500" />Critical
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-orange-500" />Major
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />Medium
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500" />Info
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'} text-muted-foreground text-xs uppercase font-semibold`}>
                  <th className="p-4">ID</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Title / Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className={`text-sm ${isDark ? 'divide-gray-800' : 'divide-slate-100'} divide-y`}>
                {FINDINGS.map((finding) => (
                  <tr 
                    key={finding.id}
                    className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    data-testid={`finding-${finding.id}`}
                  >
                    <td className="p-4 font-mono">{finding.id}</td>
                    <td className="p-4">{getSeverityBadge(finding.severity)}</td>
                    <td className="p-4">
                      <p className="font-bold">{finding.title}</p>
                      <p className="text-xs text-muted-foreground">{finding.description}</p>
                    </td>
                    <td className="p-4">{getStatusDisplay(finding.status)}</td>
                    <td className="p-4 text-right font-mono">{finding.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-white/10' : 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700'} rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border`}>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Bug Bounty Program
            </h3>
            <p className="text-slate-300 text-sm">
              Found a vulnerability? Report it to the TBURN security team and earn up to $1,000,000 in rewards.
            </p>
          </div>
          <Link href="/bug-bounty">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap shadow-lg shadow-emerald-500/20">
              Submit Report
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12 mb-4">
          Security is a journey, not a destination. TBURN is committed to 24/7 monitoring.
        </p>
      </main>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              {selectedReport?.reportFile}
            </DialogTitle>
            <DialogDescription>
              By {selectedReport?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className={`flex-1 p-8 ${isDark ? 'bg-black/40' : 'bg-slate-100'} rounded-lg`}>
            <div className="aspect-[3/4] bg-white shadow-lg mx-auto max-w-sm flex flex-col items-center justify-center p-8 text-center border border-slate-200 rounded-lg">
              <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                <Shield className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">SECURITY AUDIT REPORT</h2>
              <p className="text-slate-500 mb-8">By {selectedReport?.name}</p>
              <div className="w-full space-y-2">
                <div className="w-full h-2 bg-slate-100 rounded" />
                <div className="w-2/3 h-2 bg-slate-100 rounded mx-auto" />
                <div className="w-5/6 h-2 bg-slate-100 rounded mx-auto" />
              </div>
              <p className="text-xs text-slate-400 mt-8">This is a preview. Please download for full details.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
