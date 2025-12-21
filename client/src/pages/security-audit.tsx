import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  Wallet,
  FileText,
  Bug,
  Award,
  CheckCircle2,
  Wrench,
  Download,
  X,
  Home,
  HelpCircle,
  ScanLine,
  User,
  Hexagon,
  ImageIcon,
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface AuditFirm {
  id: string;
  name: string;
  logoStyle: string;
  scope: string;
  date: string;
  score: string;
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
    logoStyle: "bg-slate-900",
    scope: "Core Consensus & Staking",
    date: "Dec 15, 2024",
    score: "99.5 / 100",
    reportFile: "TBURN_Core_Audit_Final.pdf",
  },
  {
    id: "slowmist",
    name: "SlowMist",
    logoStyle: "bg-slate-800 italic",
    scope: "Tokenomics & Bridge",
    date: "Nov 20, 2024",
    score: "Low Risk",
    reportFile: "TBURN_Token_Bridge_Audit.pdf",
  },
  {
    id: "hacken",
    name: "HACKEN",
    logoStyle: "bg-green-900",
    scope: "Smart Contracts (DEX)",
    date: "Dec 01, 2024",
    score: "10 / 10",
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
  const [location] = useLocation();
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
      critical: t('securityPages.securityAudit.severityCritical').toUpperCase(),
      major: t('securityPages.securityAudit.severityHigh').toUpperCase(),
      medium: t('securityPages.securityAudit.severityMedium').toUpperCase(),
      info: t('securityPages.securityAudit.severityLow').toUpperCase(),
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
        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          {status === "fixed" ? t('securityPages.securityAudit.statusFixed') : t('securityPages.securityAudit.statusResolved')}
        </span>
      );
    }
    return (
      <span className="text-slate-500 font-bold flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4" />
        {t('securityPages.securityAudit.statusAcknowledged')}
      </span>
    );
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased ${isDark ? 'bg-[#0B1120] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <style>{`
        .glass-panel { backdrop-filter: blur(12px); transition: all 0.3s ease; }
        .dark .glass-panel { background: rgba(21, 30, 50, 0.7); border: 1px solid rgba(255, 255, 255, 0.05); }
        .glass-panel { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(226, 232, 240, 0.8); }
        .shield-glow { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
      `}</style>

      <aside className={`hidden sm:flex w-20 lg:w-64 flex-col z-20 transition-all duration-300 border-r ${isDark ? 'bg-[#0F172A] border-gray-800' : 'bg-white border-slate-200'}`}>
        <div className={`h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="hidden lg:block ml-3">
            <h1 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              TBURN <span className="text-emerald-600">Security</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <Link href="/user">
            <a className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'}`}>
              <Wallet className="w-6 h-6" />
              <span className="hidden lg:block font-medium">{t('securityPages.nav.wallet')}</span>
            </a>
          </Link>
          <Link href="/security-audit">
            <a className={`flex items-center gap-4 px-3 py-3 rounded-xl border-l-4 border-emerald-600 shadow-sm transition-colors ${isDark ? 'bg-[#151E32] text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <FileText className="w-6 h-6" />
              <span className="hidden lg:block font-medium">{t('securityPages.nav.auditsReports')}</span>
            </a>
          </Link>
          <Link href="/bug-bounty">
            <a className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'}`}>
              <Bug className="w-6 h-6" />
              <span className="hidden lg:block font-medium">{t('securityPages.nav.bugBounty')}</span>
            </a>
          </Link>
        </nav>
      </aside>

      <main className={`flex-1 flex flex-col relative overflow-hidden ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'} transition-colors duration-300`}>
        <header className={`h-16 border-b ${isDark ? 'border-gray-800 bg-[#0B1120]/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10`}>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full ${isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-100 border-green-200'} text-green-600 dark:text-green-400 text-xs font-bold border flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t('securityPages.securityAudit.statusSafe')}
            </div>
            <span className="text-xs text-slate-400 hidden sm:block">{t('securityPages.securityAudit.lastScanned', { time: '10 mins' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-home">
                <Home className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/scan">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-scan">
                <ScanLine className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/user">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-user">
                <User className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/bug-bounty">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-bug-bounty">
                <Bug className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/token-generator">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-token-generator">
                <Hexagon className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/nft-marketplace">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-nft-marketplace">
                <ImageIcon className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/qna">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-qna">
                <HelpCircle className="w-4 h-4" />
              </a>
            </Link>
            <LanguageSelector isDark={isDark} />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth z-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className={`glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center items-center text-center shield-glow border-t-4 border-emerald-600 ${isDark ? '' : ''}`}>
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                {t('securityPages.securityAudit.totalSecurityScore')}
              </h2>
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
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
                  <span className={`text-4xl font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>98</span>
                  <span className="text-xs font-bold text-emerald-600">/ 100</span>
                </div>
              </div>
              <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{t('securityPages.securityAudit.tier1Verified')}</p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                <div className="mb-4 text-blue-500 text-3xl">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>3 / 3</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('securityPages.securityAudit.auditsPassed')}</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                <div className="mb-4 text-red-500 text-3xl">
                  <Bug className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>0</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('securityPages.securityAudit.criticalIssuesFound')}</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                <div className="mb-4 text-yellow-500 text-3xl">
                  <Wrench className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>100%</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('securityPages.securityAudit.resolutionRate')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Award className="w-5 h-5 text-emerald-600" />
              Verified Audit Firms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AUDIT_FIRMS.map((firm) => (
                <div 
                  key={firm.id}
                  className={`glass-panel p-6 rounded-2xl border hover:border-emerald-600 transition-colors group ${isDark ? 'border-gray-700' : 'border-slate-200'}`}
                  data-testid={`audit-firm-${firm.id}`}
                >
                  <div className="flex justify-between items-start mb-6 gap-2 flex-wrap">
                    <div className={`h-12 w-32 ${firm.logoStyle} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                      {firm.name}
                    </div>
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded border border-green-500/20">
                      PASSED
                    </span>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('securityPages.securityAudit.scope')}</span>
                      <span className={`font-bold text-right ${isDark ? 'text-white' : 'text-slate-800'}`}>{firm.scope}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('securityPages.securityAudit.date')}</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{firm.date}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>{t('securityPages.securityAudit.score')}</span>
                      <span className="font-bold text-emerald-600">{firm.score}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedReport(firm)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    data-testid={`button-view-report-${firm.id}`}
                  >
                    <FileText className="w-4 h-4" />
                    {t('securityPages.securityAudit.viewReport')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`glass-panel rounded-2xl overflow-hidden ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className={`p-6 border-b flex flex-wrap justify-between items-center gap-4 ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('securityPages.securityAudit.detailedFindings')}</h3>
              <div className="flex gap-2 flex-wrap">
                <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-red-500" />{t('securityPages.securityAudit.severityCritical')}
                </span>
                <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-orange-500" />{t('securityPages.securityAudit.severityHigh')}
                </span>
                <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />{t('securityPages.securityAudit.severityMedium')}
                </span>
                <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />{t('securityPages.securityAudit.severityLow')}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs uppercase font-semibold ${isDark ? 'bg-[#0B1120] text-gray-400' : 'bg-slate-50 text-slate-500'}`}>
                    <th className="p-4">ID</th>
                    <th className="p-4">{t('securityPages.securityAudit.severity')}</th>
                    <th className="p-4">{t('securityPages.securityAudit.titleDescription')}</th>
                    <th className="p-4">{t('securityPages.securityAudit.status')}</th>
                    <th className="p-4 text-right">{t('securityPages.securityAudit.date')}</th>
                  </tr>
                </thead>
                <tbody className={`text-sm ${isDark ? 'text-gray-300 divide-gray-800' : 'text-slate-700 divide-slate-100'} divide-y`}>
                  {FINDINGS.map((finding) => (
                    <tr 
                      key={finding.id}
                      className={isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
                      data-testid={`finding-${finding.id}`}
                    >
                      <td className="p-4 font-mono">{finding.id}</td>
                      <td className="p-4">{getSeverityBadge(finding.severity)}</td>
                      <td className="p-4">
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{finding.title}</p>
                        <p className="text-xs text-slate-500">{finding.description}</p>
                      </td>
                      <td className="p-4">{getStatusDisplay(finding.status)}</td>
                      <td className="p-4 text-right font-mono">{finding.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`mt-8 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border ${isDark ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-white/10' : 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700'}`}>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                {t('securityPages.bugBounty.title')}
              </h3>
              <p className="text-slate-300 text-sm">
                {t('securityPages.bugBounty.description')}
              </p>
            </div>
            <Link href="/bug-bounty">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                {t('securityPages.bugBounty.submitReport')}
              </button>
            </Link>
          </div>

          <p className={`text-center text-xs mt-12 mb-4 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
            {t('securityPages.securityAudit.securityJourney')}
          </p>
        </div>
      </main>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#151E32] border-gray-700' : 'bg-white border-slate-200'}`}>
          <DialogHeader className={`border-b pb-4 ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
            <DialogTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <FileText className="w-5 h-5 text-red-500" />
              {selectedReport?.reportFile}
            </DialogTitle>
            <DialogDescription>
              By {selectedReport?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className={`flex-1 p-8 rounded-lg ${isDark ? 'bg-black/40' : 'bg-slate-100'}`}>
            <div className="aspect-[3/4] bg-white shadow-lg mx-auto max-w-md flex flex-col items-center justify-center p-8 text-center border border-slate-200 rounded-lg">
              <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                <Shield className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('securityPages.securityAudit.securityAuditReport')}</h2>
              <p className="text-slate-500 mb-8">By {selectedReport?.name}</p>
              <div className="w-full space-y-2">
                <div className="w-full h-2 bg-slate-100 rounded" />
                <div className="w-2/3 h-2 bg-slate-100 rounded mx-auto" />
                <div className="w-5/6 h-2 bg-slate-100 rounded mx-auto" />
              </div>
              <p className="text-xs text-slate-400 mt-8">{t('securityPages.securityAudit.previewNote')}</p>
            </div>
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${isDark ? 'border-gray-700 bg-[#0B1120]' : 'border-slate-200 bg-slate-50'}`}>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedReport(null)}
              className={isDark ? 'text-slate-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-200'}
            >
              {t('securityPages.securityAudit.close')}
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              {t('securityPages.securityAudit.downloadReport')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
