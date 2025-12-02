import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Shield, ArrowLeft, Clock, Coins, ArrowRightLeft, 
  HandCoins, TrendingUp, Bot, UserCheck, Vote,
  Check, BookOpen, Code, FileText, Zap, Play,
  AlertTriangle, ExternalLink
} from "lucide-react";

const scoreFormula = [
  { percentage: "40%", title: "Burn Compliance", subtitle: "Schedule adherence & Collateral", color: "#00ff9d" },
  { percentage: "30%", title: "Dev Progress", subtitle: "GitHub activity & Roadmap", color: "#00f0ff" },
  { percentage: "30%", title: "Transparency", subtitle: "Financial audit & Wallets", color: "#7000ff" },
];

const verificationStages = [
  {
    icon: Bot,
    title: "1. AI Automated Filtering",
    description: "Scans smart contract vulnerabilities, checks whitepaper plagiarism against global DB, and verifies team identity using biometrics.",
    duration: "24 Hours",
    color: "#00f0ff"
  },
  {
    icon: UserCheck,
    title: "2. Expert Validation",
    description: "Committee of blockchain developers, legal, and financial experts verify financial statements and technical feasibility.",
    duration: "7-14 Days",
    color: "#7000ff"
  },
  {
    icon: Vote,
    title: "3. Community Voting",
    description: "Final public voting among TBURN token holders. Approval requires >60% consensus to proceed to Mainnet listing.",
    duration: "3-5 Days",
    color: "#00ff9d"
  },
];

const scoreActions = [
  { range: "80-100", label: "Excellent", description: "Normal trading active. Official \"Verified\" badge granted.", color: "rgb(34, 197, 94)" },
  { range: "60-79", label: "Good", description: "Normal trading active. Cautionary notice displayed.", color: "rgb(59, 130, 246)" },
  { range: "40-59", label: "Warning", description: "Warning displayed on DEX. Daily trading volume capped.", color: "rgb(234, 179, 8)" },
  { range: "< 40", label: "Danger", description: "Trading automatically suspended. Delisting process initiated.", color: "rgb(220, 38, 38)" },
];

const burnSteps = [
  { step: "1", title: "Collateral Deposit", description: "120% of planned burn amount deposited." },
  { step: "2", title: "Auto-Execution", description: "Smart contract triggers burn on schedule." },
  { step: "3", title: "Real-time Verification", description: "Tx hash recorded on-chain instantly." },
];

export default function IntroToDefi() {
  const { t } = useTranslation();

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-16 mb-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff9d]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/learn/education-programs"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00ff9d] mb-6 transition-colors group"
            data-testid="link-back-education"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Education Hub
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#00ff9d]/30 bg-[#00ff9d]/5 text-[#00ff9d] text-xs">
            <Shield className="w-4 h-4" /> {t('publicPages.learn.introToDefi.tag')}
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('publicPages.learn.introToDefi.title')}
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('publicPages.learn.introToDefi.subtitle')}
          </p>
          
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#00ff9d] text-[#00ff9d] bg-[#00ff9d]/5">
              {t('publicPages.common.beginner')}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" /> 2 hours
            </span>
          </div>
        </div>
      </section>

      {/* Score Formula Section */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-20">
        <div className="spotlight-card rounded-2xl p-10 border-[#00ff9d]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff9d]/10 rounded-full blur-[80px]" />
          
          <h2 className="text-2xl font-bold text-center text-white mb-10">Trust Score Calculation Formula</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 font-mono text-sm md:text-base">
            {scoreFormula.map((item, index) => (
              <div key={index} className="flex items-center gap-4 md:gap-8">
                <div 
                  className="bg-black/40 p-6 rounded-xl text-center flex-1 w-full hover:scale-105 transition-transform"
                  style={{ border: `1px solid ${item.color}30` }}
                >
                  <div className="text-3xl font-bold mb-2" style={{ color: item.color }}>{item.percentage}</div>
                  <div className="text-gray-300">{item.title}</div>
                  <p className="text-xs text-gray-500 mt-2">{item.subtitle}</p>
                </div>
                {index < scoreFormula.length - 1 && (
                  <div className="text-2xl text-gray-600 hidden md:block">+</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Check className="w-6 h-6 text-[#00ff9d]" />
          <h2 className="text-2xl font-bold text-white">3-Stage Verification Process</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {verificationStages.map((stage, index) => (
            <div key={index} className="spotlight-card rounded-xl p-6 group">
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stage.color}10` }}
                >
                  <stage.icon className="w-5 h-5" style={{ color: stage.color }} />
                </div>
                <span 
                  className="text-xs font-mono px-2 py-1 rounded"
                  style={{ color: stage.color, border: `1px solid ${stage.color}30` }}
                >
                  {stage.duration}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{stage.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{stage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Actions by Score */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <h2 className="text-2xl font-bold text-white mb-8">Actions by Score</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreActions.map((action, index) => (
            <div 
              key={index}
              className="spotlight-card p-6 rounded-xl"
              style={{ borderLeft: `4px solid ${action.color}` }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: action.color }}>{action.range}</div>
              <div className="text-white font-bold mb-3">{action.label}</div>
              <p className="text-xs text-gray-400">{action.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hybrid Forced Burn */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="spotlight-card rounded-2xl p-8 border border-white/10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                <AlertTriangle className="w-6 h-6 text-[#ff0055]" /> Hybrid Forced Burn
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                TBurn Chain doesn't just trust; it enforces. Projects must deposit collateral. If they fail to burn tokens as promised, the smart contract intervenes.
              </p>
              
              <ul className="space-y-4">
                {burnSteps.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff] text-xs mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="h-64 bg-black/40 rounded-xl border border-dashed border-gray-700 flex items-center justify-center flex-col text-gray-500">
              <Coins className="w-12 h-12 mb-2 text-[#00ff9d]/50" />
              <span className="text-xs mt-2">Figure: Collateral Burn Flow</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Resources */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Developer Resources</h3>
          <p className="text-gray-400 text-sm mb-4">
            Learn to integrate Trust Score verification into your DeFi applications.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 hover:bg-[#00ff9d]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#00ff9d]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00ff9d] transition">Smart Contracts</p>
                <p className="text-xs text-gray-500">Trust Score integration</p>
              </div>
            </Link>
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">SDK Guide</p>
                <p className="text-xs text-gray-500">Trust Score SDK</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">API Reference</p>
                <p className="text-xs text-gray-500">Trust Score API</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
              data-testid="link-websocket"
            >
              <Zap className="w-5 h-5 text-[#ffd700]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ffd700] transition">WebSocket API</p>
                <p className="text-xs text-gray-500">Real-time updates</p>
              </div>
            </Link>
            <Link 
              href="/developers/quickstart"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ff0055]/5 border border-[#ff0055]/20 hover:bg-[#ff0055]/10 transition group"
              data-testid="link-quickstart"
            >
              <Play className="w-5 h-5 text-[#ff0055]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ff0055] transition">Quick Start</p>
                <p className="text-xs text-gray-500">Get started fast</p>
              </div>
            </Link>
            <Link 
              href="/developers/examples"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f97316]/5 border border-[#f97316]/20 hover:bg-[#f97316]/10 transition group"
              data-testid="link-examples"
            >
              <ExternalLink className="w-5 h-5 text-[#f97316]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f97316] transition">Code Examples</p>
                <p className="text-xs text-gray-500">Trust Score samples</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Learn Pages */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Link 
            href="/learn/defi-mastery"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-defi-mastery"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Continue Learning</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#7000ff]/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-[#7000ff]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#7000ff] transition">Mastering DeFi</h4>
                <p className="text-xs text-gray-500">Intermediate Level</p>
              </div>
            </div>
          </Link>
          <Link 
            href="/learn/developer-course"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-developer-course"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">For Developers</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#f59e0b] transition">Developer Course</h4>
                <p className="text-xs text-gray-500">Advanced Level</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
