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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Bug,
  Crosshair,
  Trophy,
  Medal,
  AlertTriangle,
  Info,
  FileCode,
  Server,
  X,
  Lock,
  UserCircle,
  Biohazard,
  ExternalLink,
  Loader2,
  Home,
  HelpCircle,
  ScanLine,
  User,
  Hexagon,
  Globe,
  ImageIcon,
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Hunter {
  rank: number;
  name: string;
  points: number;
  earned: string;
}

const HUNTERS: Hunter[] = [
  { rank: 1, name: "0xSafeDuck", points: 15200, earned: "$450,000" },
  { rank: 2, name: "WhiteHat_Kor", points: 12400, earned: "$320,000" },
  { rank: 3, name: "AuditGod", points: 8900, earned: "$150,000" },
  { rank: 4, name: "CryptoNinja", points: 5200, earned: "$45,000" },
  { rank: 5, name: "SolidityDev", points: 3100, earned: "$12,000" },
];

const ASSET_MAP: Record<string, string> = {
  "Smart Contracts (Core)": "smart_contracts",
  "Node Client": "node_client",
  "Website / API": "website_api",
  "Bridge": "bridge",
  "Other": "other",
};

export default function BugBountyPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    asset: "Smart Contracts (Core)",
    title: "",
    description: "",
    email: "",
    wallet: "",
    severity: "medium",
  });
  
  const isDark = theme === 'dark';

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-400 text-black";
    if (rank === 3) return "bg-gradient-to-br from-amber-600 to-amber-800 text-white";
    return "bg-slate-700 text-white";
  };

  const submitMutation = useMutation({
    mutationFn: async (data: typeof reportForm) => {
      const res = await apiRequest("POST", "/api/bug-bounty", {
        reporterEmail: data.email || undefined,
        reporterWallet: data.wallet || undefined,
        title: data.title,
        description: data.description,
        assetTarget: ASSET_MAP[data.asset] || "smart_contracts",
        reportedSeverity: data.severity,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('securityPages.bugBounty.reportSubmittedTitle'),
        description: t('securityPages.bugBounty.reportSubmittedDesc'),
      });
      setShowReportModal(false);
      setReportForm({ asset: "Smart Contracts (Core)", title: "", description: "", email: "", wallet: "", severity: "medium" });
    },
    onError: (error: Error) => {
      toast({
        title: t('securityPages.bugBounty.submissionFailed'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.title.trim() || !reportForm.description.trim()) {
      toast({
        title: t('securityPages.bugBounty.validationError'),
        description: t('securityPages.bugBounty.titleDescRequired'),
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(reportForm);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased ${isDark ? 'bg-[#0B1120] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <style>{`
        .glass-panel { backdrop-filter: blur(12px); transition: all 0.3s ease; }
        .dark .glass-panel { background: rgba(21, 30, 50, 0.7); border: 1px solid rgba(255, 255, 255, 0.05); }
        .glass-panel { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(226, 232, 240, 0.8); }
        .glitch-hover:hover { text-shadow: 2px 0 #F43F5E, -2px 0 #00FF94; }
      `}</style>

      <aside className={`w-20 lg:w-64 flex flex-col z-20 transition-all duration-300 border-r ${isDark ? 'bg-[#0F172A] border-gray-800' : 'bg-white border-slate-200'}`}>
        <div className={`h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-rose-500 font-bold text-xl shadow-lg shrink-0 border border-rose-500/50">
            <Bug className="w-5 h-5" />
          </div>
          <div className="hidden lg:block ml-3">
            <h1 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              TBURN <span className="text-rose-500">Bounty</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <Link href="/security-audit">
            <a className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'}`}>
              <Shield className="w-6 h-6" />
              <span className="hidden lg:block font-medium">{t('securityPages.nav.securityAudit')}</span>
            </a>
          </Link>
          <Link href="/bug-bounty">
            <a className={`flex items-center gap-4 px-3 py-3 rounded-xl border-l-4 border-rose-500 shadow-sm transition-colors ${isDark ? 'bg-[#151E32] text-white' : 'bg-rose-50 text-rose-500'}`}>
              <Crosshair className="w-6 h-6" />
              <span className="hidden lg:block font-medium">{t('securityPages.nav.bugBounty')}</span>
            </a>
          </Link>
          <Link href="/official-channels">
            <a className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'}`}>
              <Trophy className="w-6 h-6" />
              <span className="hidden lg:block font-medium">{t('securityPages.nav.hallOfFame')}</span>
            </a>
          </Link>
        </nav>
      </aside>

      <main className={`flex-1 flex flex-col relative overflow-hidden ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'} transition-colors duration-300`}>
        <header className={`h-16 border-b ${isDark ? 'border-gray-800 bg-[#0B1120]/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10`}>
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('securityPages.bugBounty.totalPaidOut')}:</span>
              <span className="font-mono font-bold text-emerald-500">$2,450,000</span>
            </div>
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
            <Link href="/security-audit">
              <a className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`} data-testid="link-security-audit">
                <Shield className="w-4 h-4" />
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
            <Button 
              onClick={() => setShowReportModal(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
              data-testid="button-submit-report"
            >
              <Bug className="w-4 h-4 mr-2" />
              {t('securityPages.bugBounty.submitReport')}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth z-0">
          <div className="relative rounded-3xl overflow-hidden mb-10 bg-[#0F172A] border border-slate-200 dark:border-gray-700">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#F43F5E 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-rose-500/10 to-transparent" />
            
            <div className="relative p-8 md:p-12 z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 text-xs font-bold mb-4 border border-rose-500/30">
                  {t('securityPages.bugBounty.huntBugs')}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight glitch-hover cursor-default">
                  {t('securityPages.bugBounty.protectNetwork')}
                </h1>
                <p className="text-slate-400 mb-8 text-lg">
                  {t('securityPages.bugBounty.description')}
                </p>
                <div className="flex gap-4">
                  <button className="text-white border-b-2 border-rose-500 pb-1 hover:text-rose-500 transition-colors font-bold">
                    {t('securityPages.bugBounty.viewScope')}
                  </button>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    {t('securityPages.bugBounty.readPolicy')}
                  </button>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-md border border-rose-500/30 p-6 rounded-2xl text-center min-w-[280px]">
                <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">{t('securityPages.bugBounty.maxCriticalReward')}</p>
                <p className="text-4xl md:text-5xl font-mono font-bold text-emerald-500 animate-pulse">$1,000,000</p>
                <p className="text-xs text-slate-500 mt-2">{t('securityPages.bugBounty.paidIn')}</p>
              </div>
            </div>
          </div>

          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Medal className="w-5 h-5 text-yellow-500" />
            {t('securityPages.bugBounty.rewardTiers')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-rose-500 group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-rose-500/10 text-rose-500 rounded text-xs font-bold">{t('securityPages.securityAudit.severityCritical').toUpperCase()}</span>
                <Biohazard className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-700'} group-hover:text-rose-500 transition-colors`} />
              </div>
              <p className={`text-3xl font-bold font-mono mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('securityPages.bugBounty.upTo')} $1M</p>
              <ul className={`text-sm space-y-2 list-disc list-inside ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                <li>Consensus manipulation</li>
                <li>Direct theft of funds</li>
                <li>Network shutdown</li>
                <li>Private key recovery</li>
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-t-4 border-orange-500 group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-bold">{t('securityPages.securityAudit.severityHigh').toUpperCase()}</span>
                <AlertTriangle className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-700'} group-hover:text-orange-500 transition-colors`} />
              </div>
              <p className={`text-3xl font-bold font-mono mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>$50,000</p>
              <ul className={`text-sm space-y-2 list-disc list-inside ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                <li>Temporary freezing</li>
                <li>Unintended smart contract behavior</li>
                <li>Fees manipulation</li>
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-t-4 border-yellow-500 group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs font-bold">{t('securityPages.securityAudit.severityMedium').toUpperCase()}</span>
                <Bug className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-700'} group-hover:text-yellow-500 transition-colors`} />
              </div>
              <p className={`text-3xl font-bold font-mono mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>$10,000</p>
              <ul className={`text-sm space-y-2 list-disc list-inside ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                <li>RPC node crash</li>
                <li>API authentication bypass</li>
                <li>Data leakage (Non-PII)</li>
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500 group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-bold">{t('securityPages.securityAudit.severityLow').toUpperCase()}</span>
                <Info className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-700'} group-hover:text-blue-500 transition-colors`} />
              </div>
              <p className={`text-3xl font-bold font-mono mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>$2,000</p>
              <ul className={`text-sm space-y-2 list-disc list-inside ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                <li>UI/UX Bugs with risk</li>
                <li>Inefficient gas usage</li>
                <li>Minor logic errors</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="glass-panel rounded-2xl p-6 h-full">
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="mr-2">🎯</span>{t('securityPages.bugBounty.assetsInScope')}
              </h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <FileCode className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('securityPages.bugBounty.smartContracts')} (Core)</p>
                      <p className="text-xs text-slate-500">{t('securityPages.bugBounty.smartContractsDesc')}</p>
                    </div>
                  </div>
                  <a href="#" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    {t('securityPages.bugBounty.viewGitHub')} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('securityPages.bugBounty.nodeClient')} (Go-TBURN)</p>
                      <p className="text-xs text-slate-500">{t('securityPages.bugBounty.nodeClientDesc')}</p>
                    </div>
                  </div>
                  <a href="#" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    {t('securityPages.bugBounty.viewGitHub')} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('securityPages.bugBounty.webDapps')}</p>
                      <p className="text-xs text-slate-500">{t('securityPages.bugBounty.webDappsDesc')}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`}>{t('securityPages.bugBounty.webOnly')}</span>
                </div>
              </div>

              <h4 className={`font-bold mt-6 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="mr-2">⛔</span>{t('securityPages.bugBounty.outOfScope')}
              </h4>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  {t('securityPages.bugBounty.socialEngineering')}
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  {t('securityPages.bugBounty.ddosAttacks')}
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  {t('securityPages.bugBounty.thirdPartyDapps')}
                </li>
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-6 h-full border-2 border-[#00FF94]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#00FF94]/10 rounded-bl-full -mr-10 -mt-10" />
              <div className="flex justify-between items-center mb-6">
                <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Trophy className="w-5 h-5 text-[#00FF94]" />
                  {t('securityPages.nav.hallOfFame')}
                </h3>
                <span className="text-xs text-slate-500">{t('securityPages.bugBounty.topHunters')}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`text-xs border-b ${isDark ? 'text-gray-400 border-gray-700' : 'text-slate-500 border-slate-200'}`}>
                      <th className="pb-3 pl-2">{t('securityPages.bugBounty.rank')}</th>
                      <th className="pb-3">{t('securityPages.bugBounty.hunter')}</th>
                      <th className="pb-3 text-right">{t('securityPages.bugBounty.points')}</th>
                      <th className="pb-3 text-right">{t('securityPages.bugBounty.earned')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono">
                    {HUNTERS.map((hunter) => (
                      <tr 
                        key={hunter.rank}
                        className={`border-b transition-colors ${isDark ? 'hover:bg-white/5 border-gray-800/50' : 'hover:bg-slate-50 border-slate-100'}`}
                        data-testid={`hunter-rank-${hunter.rank}`}
                      >
                        <td className="py-4 pl-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadge(hunter.rank)}`}>
                            {hunter.rank}
                          </span>
                        </td>
                        <td className={`py-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{hunter.name}</td>
                        <td className="py-4 text-right text-[#00FF94] font-bold">{hunter.points.toLocaleString()}</td>
                        <td className={`py-4 text-right ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{hunter.earned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className={`max-w-lg ${isDark ? 'bg-[#151E32] border-gray-700' : 'bg-white border-slate-200'}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <UserCircle className="w-6 h-6 text-rose-500" />
              {t('securityPages.bugBounty.submitVulnerability')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  {t('securityPages.bugBounty.emailOptional')}
                </label>
                <Input 
                  type="email"
                  placeholder="your@email.com"
                  value={reportForm.email}
                  onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                  className={isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-100 border-slate-200'}
                  data-testid="input-reporter-email"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  {t('securityPages.bugBounty.walletOptional')}
                </label>
                <Input 
                  placeholder="tb1..."
                  value={reportForm.wallet}
                  onChange={(e) => setReportForm({ ...reportForm, wallet: e.target.value })}
                  className={isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-100 border-slate-200'}
                  data-testid="input-reporter-wallet"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  {t('securityPages.bugBounty.targetAsset')}
                </label>
                <Select 
                  value={reportForm.asset} 
                  onValueChange={(v) => setReportForm({ ...reportForm, asset: v })}
                >
                  <SelectTrigger className={isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-100 border-slate-200'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Smart Contracts (Core)">Smart Contracts (Core)</SelectItem>
                    <SelectItem value="Node Client">Node Client</SelectItem>
                    <SelectItem value="Website / API">Website / API</SelectItem>
                    <SelectItem value="Bridge">Bridge</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  {t('securityPages.bugBounty.selectSeverity')}
                </label>
                <Select 
                  value={reportForm.severity} 
                  onValueChange={(v) => setReportForm({ ...reportForm, severity: v })}
                >
                  <SelectTrigger className={isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-100 border-slate-200'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="informational">Informational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                {t('securityPages.bugBounty.vulnerabilityTitle')} <span className="text-rose-500">*</span>
              </label>
              <Input 
                placeholder="e.g. Reentrancy in Staking.sol"
                value={reportForm.title}
                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                className={isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-100 border-slate-200'}
                data-testid="input-vulnerability-title"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                {t('securityPages.bugBounty.descriptionMarkdown')} <span className="text-rose-500">*</span>
              </label>
              <Textarea 
                rows={4}
                placeholder="Describe the impact and reproduction steps..."
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                className={isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-100 border-slate-200'}
                data-testid="textarea-vulnerability-description"
                required
              />
            </div>
            
            <div className={`p-3 rounded text-xs border ${isDark ? 'bg-black/20 border-gray-700 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <Lock className="w-3 h-3 inline mr-1" />
              {t('securityPages.bugBounty.secureNote')}
            </div>

            <Button 
              type="submit" 
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/30"
              data-testid="button-submit-vulnerability"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('securityPages.bugBounty.submitting')}
                </>
              ) : (
                t('securityPages.bugBounty.submitSecurely')
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
