import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Brain, ArrowLeft, Crown, Crosshair, Zap, Server, Coins, 
  Maximize2, Lock, Check, BookOpen, Code, FileText, Terminal,
  Shield, Wallet, CreditCard, Gamepad2, ExternalLink
} from "lucide-react";

const aiTiers = [
  {
    icon: Crown,
    title: "Strategic Tier",
    model: "ChatGPT Latest",
    latency: "~450ms",
    color: "#7000ff",
    description: "Handles complex context understanding, governance decisions, and long-term ecosystem strategy formulation.",
    capabilities: [
      "Protocol Governance",
      "Tokenomics Optimization",
      "Macro Risk Assessment"
    ]
  },
  {
    icon: Crosshair,
    title: "Tactical Tier",
    model: "Claude Latest",
    latency: "~180ms",
    color: "#3b82f6",
    description: "Balances accuracy and speed for smart contract auditing, fraud detection, and security analysis.",
    capabilities: [
      "Contract Vulnerability Scan",
      "Fraud Pattern Detection",
      "Fee Optimization"
    ]
  },
  {
    icon: Zap,
    title: "Operational Tier",
    model: "Gemini Latest",
    latency: "~45ms",
    color: "#22c55e",
    description: "Ultra-low latency processing for real-time transaction validation and network state monitoring.",
    capabilities: [
      "Real-time Validation",
      "MEV Protection",
      "Network Health Check"
    ]
  }
];

const architectureSteps = [
  {
    step: 1,
    title: "Input & Operational Analysis",
    description: "Transaction requests enter the mempool. Gemini (Operational Tier) instantly validates signatures and checks for MEV bots in < 50ms.",
    color: "#22c55e"
  },
  {
    step: 2,
    title: "Tactical Security Scan",
    description: "Concurrently, Claude (Tactical Tier) analyzes the smart contract logic for hidden backdoors or re-entrancy attacks before execution.",
    color: "#3b82f6"
  },
  {
    step: 3,
    title: "Strategic Optimization",
    description: "For complex DAO proposals or major transfers, ChatGPT (Strategic Tier) assesses the long-term impact on tokenomics and governance compliance.",
    color: "#7000ff"
  }
];

const systemStats = [
  { icon: Server, title: "99.97% Uptime", desc: "Auto-fallback system ensures continuity." },
  { icon: Coins, title: "Cost Optimized", desc: "AI tier selection based on task complexity." },
  { icon: Maximize2, title: "Infinite Scale", desc: "Horizontally scalable distributed AI nodes." },
  { icon: Lock, title: "Multi-Verify", desc: "Cross-validation between AI models." }
];

export default function AiFeatures() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 mb-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7000ff]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7000ff]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#3b82f6]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#22c55e]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/solutions/token-extensions"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#7000ff] mb-6 transition-colors group"
            data-testid="link-back-solutions"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.common.backToSolutions')}
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#7000ff]/30 bg-[#7000ff]/5 text-[#7000ff] text-xs">
            <Brain className="w-4 h-4" /> {t('publicPages.solutions.aiFeatures.tag')}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.solutions.aiFeatures.title')} <br />
            <span className="bg-gradient-to-r from-[#7000ff] via-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent">
              {t('publicPages.solutions.aiFeatures.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            {t('publicPages.solutions.aiFeatures.subtitle')}
          </p>
        </div>
      </section>

      {/* AI Tiers */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {aiTiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div 
                key={idx}
                className="spotlight-card rounded-2xl p-8 group"
                style={{ 
                  '--spotlight-color': `${tier.color}80`,
                  '--spotlight-color-dim': `${tier.color}4d`,
                  '--spotlight-shadow': `${tier.color}26`
                } as React.CSSProperties}
                data-testid={`card-tier-${idx}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center border"
                    style={{ 
                      backgroundColor: `${tier.color}10`,
                      borderColor: `${tier.color}33`,
                      color: tier.color
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span 
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ 
                      color: tier.color,
                      border: `1px solid ${tier.color}4d`,
                      backgroundColor: `${tier.color}0d`
                    }}
                  >
                    {tier.latency}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{tier.title}</h3>
                <p className="text-sm font-semibold mb-4" style={{ color: tier.color }}>{tier.model}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{tier.description}</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  {tier.capabilities.map((cap, capIdx) => (
                    <li key={capIdx} className="flex items-center gap-2">
                      <Check className="w-4 h-4" style={{ color: tier.color }} />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Timeline */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-24">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Integrated AI Architecture</h2>
        
        <div className="relative pl-8 border-l border-gray-800 space-y-12">
          {architectureSteps.map((step, idx) => (
            <div key={idx} className="relative">
              <div 
                className="absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-black"
                style={{ backgroundColor: step.color }}
              />
              <div 
                className="spotlight-card p-6 rounded-xl"
                style={{ borderColor: `${step.color}33` }}
              >
                <h4 className="font-bold mb-2 text-lg" style={{ color: step.color }}>
                  {step.step}. {step.title}
                </h4>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Stats */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="spotlight-card p-6 rounded-xl text-center hover:bg-white/5 transition">
                <Icon className="w-8 h-8 mx-auto text-gray-500 mb-4" />
                <h3 className="font-bold text-white mb-2">{stat.title}</h3>
                <p className="text-xs text-gray-500">{stat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Solutions */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Related Solutions</h3>
          <p className="text-gray-400 text-sm mb-4">
            Explore how AI integrates with other TBurn Chain solutions.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/solutions/wallets"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-wallets"
            >
              <Wallet className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">Wallets</p>
                <p className="text-xs text-gray-500">AI-powered security</p>
              </div>
            </Link>
            <Link 
              href="/solutions/payments"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-payments"
            >
              <CreditCard className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">Payments</p>
                <p className="text-xs text-gray-500">Fraud detection</p>
              </div>
            </Link>
            <Link 
              href="/solutions/game-tooling"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-game-tooling"
            >
              <Gamepad2 className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">Game Tooling</p>
                <p className="text-xs text-gray-500">AI-driven gameplay</p>
              </div>
            </Link>
            <Link 
              href="/solutions/financial"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/20 hover:bg-[#f59e0b]/10 transition group"
              data-testid="link-financial"
            >
              <Shield className="w-5 h-5 text-[#f59e0b]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f59e0b] transition">Financial Infra</p>
                <p className="text-xs text-gray-500">Risk assessment</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer Resources */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Developer Resources</h3>
          <p className="text-gray-400 text-sm mb-4">
            Integrate AI capabilities into your applications.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">SDK Guide</p>
                <p className="text-xs text-gray-500">AI SDK integration</p>
              </div>
            </Link>
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">Smart Contracts</p>
                <p className="text-xs text-gray-500">AI-audited contracts</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">API Reference</p>
                <p className="text-xs text-gray-500">AI API endpoints</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/20 hover:bg-[#f59e0b]/10 transition group"
              data-testid="link-websocket"
            >
              <Zap className="w-5 h-5 text-[#f59e0b]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f59e0b] transition">WebSocket API</p>
                <p className="text-xs text-gray-500">Real-time AI feeds</p>
              </div>
            </Link>
            <Link 
              href="/developers/cli"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ff0055]/5 border border-[#ff0055]/20 hover:bg-[#ff0055]/10 transition group"
              data-testid="link-cli"
            >
              <Terminal className="w-5 h-5 text-[#ff0055]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ff0055] transition">CLI Reference</p>
                <p className="text-xs text-gray-500">AI command tools</p>
              </div>
            </Link>
            <Link 
              href="/developers/examples"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-examples"
            >
              <ExternalLink className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Code Examples</p>
                <p className="text-xs text-gray-500">AI integration samples</p>
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
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Learn More</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#7000ff]/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#7000ff]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#7000ff] transition">DeFi Mastery</h4>
                <p className="text-xs text-gray-500">AI-enhanced DeFi</p>
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
    </div>
  );
}
