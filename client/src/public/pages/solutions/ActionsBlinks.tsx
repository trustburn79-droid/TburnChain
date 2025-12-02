import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Zap, Link2, Share2, Shield, Globe, Image, Gavel, ShoppingCart, 
  Gamepad2, Users, ArrowLeft, BookOpen, Code, FileText, Terminal,
  Wallet, CreditCard, Store, Coins, ExternalLink
} from "lucide-react";

const coreFeatures = [
  {
    icon: Link2,
    iconColor: "#00f0ff",
    title: "URL Execution",
    desc: "Perform swaps, minting, and voting instantly via deep links."
  },
  {
    icon: Share2,
    iconColor: "#7000ff",
    title: "Social Integration",
    desc: "Embed blockchain actions directly into Twitter, Discord, and Telegram."
  },
  {
    icon: Shield,
    iconColor: "#facc15",
    title: "Trust Verified",
    desc: "Auto-displays target project's Trust Score before execution."
  },
  {
    icon: Globe,
    iconColor: "#00ff9d",
    title: "Universal Access",
    desc: "Consistent experience across Web, Mobile, and IoT devices."
  }
];

const actionTypes = [
  {
    icon: Zap,
    iconColor: "#ffd700",
    title: "DeFi Actions",
    desc: "Instant token swaps, liquidity provision, and staking via URL.",
    code: "tburn.io/action?type=swap&from=ETH"
  },
  {
    icon: Image,
    iconColor: "#7000ff",
    title: "NFT Actions",
    desc: "One-click minting, transfers, and auction bidding.",
    code: "tburn.io/action?type=mint&col=BAYC"
  },
  {
    icon: Gavel,
    iconColor: "#00f0ff",
    title: "Governance",
    desc: "Vote on DAO proposals directly from community chats.",
    code: "tburn.io/action?type=vote&id=123"
  }
];

const realWorldApps = [
  {
    icon: ShoppingCart,
    iconColor: "#3b82f6",
    bgColor: "bg-blue-500/20",
    title: "Social Commerce",
    desc: "Embed product payment links in tweets. Buyers click to pay instantly with crypto wallet.",
    link: "/solutions/commerce"
  },
  {
    icon: Gamepad2,
    iconColor: "#6366f1",
    bgColor: "bg-indigo-500/20",
    title: "Gaming Items",
    desc: "Trade NFT items directly within Discord chats. Trust verification prevents scams.",
    link: "/solutions/game-tooling"
  },
  {
    icon: Users,
    iconColor: "#14b8a6",
    bgColor: "bg-teal-500/20",
    title: "Crowdfunding",
    desc: "Participate in ICOs via Telegram links. Only high Trust Score projects allowed.",
    link: "/solutions/financial"
  },
  {
    icon: Gavel,
    iconColor: "#ec4899",
    bgColor: "bg-pink-500/20",
    title: "DAO Governance",
    desc: "Vote on proposals via email links. No complex dashboard navigation needed.",
    link: "/solutions/permissioned"
  }
];

const howItWorks = [
  { step: 1, bgColor: "bg-[#00f0ff]", textColor: "text-black", title: "Generate Action URL", desc: "Developers create standard action links for specific transactions (e.g., Token Swap)." },
  { step: 2, bgColor: "bg-[#7000ff]", textColor: "text-white", title: "Trust Score Display", desc: "User clicks link -> System fetches and displays project reliability score instantly." },
  { step: 3, bgColor: "bg-[#facc15]", textColor: "text-black", title: "Secure Execution", desc: "Transaction executes only if user approves and Trust Score is safe (>40%)." }
];

const devQuickStart = {
  step1: { title: "Generate Action URL", code: "https://tburn.io/action?type=swap&from=TBURN&to=USDC&amount=100" },
  step2: { title: "Set Metadata (OG Tags for Preview)", code: '<meta property="bc:action" content="swap" />\n<meta property="bc:chain" content="tburn-mainnet" />' },
  step3: { title: "Share & Execute", desc: "Ready to share on Twitter/Discord/Telegram" }
};

export default function ActionsBlinks() {
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
      <section className="relative py-16 mb-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/solutions/token-extensions"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f0ff] mb-6 transition-colors group"
            data-testid="link-back-solutions"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.common.backToSolutions')}
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 text-[#00f0ff] text-xs">
            <Link2 className="w-4 h-4" /> {t('publicPages.solutions.actionsBlinks.tag')}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.actionsBlinks.title')} <br />
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#facc15] bg-clip-text text-transparent">
              {t('publicPages.solutions.actionsBlinks.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            {t('publicPages.solutions.actionsBlinks.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/developers/quickstart">
              <button 
                className="bg-[#00f0ff] text-black px-8 py-3 rounded-lg font-bold hover:bg-cyan-400 transition flex items-center justify-center gap-2"
                style={{ boxShadow: "0 0 20px rgba(0,240,255,0.4)" }}
                data-testid="button-create-action"
              >
                <Zap className="w-4 h-4" /> Create Action
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="spotlight-card border border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition flex items-center justify-center gap-2 text-white"
                data-testid="button-documentation"
              >
                <BookOpen className="w-4 h-4" /> Documentation
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Core Capabilities</h2>
          <p className="text-gray-400">Next-generation protocol standardizing blockchain interactions</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 group"
                data-testid={`card-feature-${idx}`}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${feature.iconColor}10` }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.iconColor }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How Actions Work */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-2xl p-8 border border-[#00f0ff]/20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">How Actions Work</h2>
              <div className="space-y-6">
                {howItWorks.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${step.bgColor} ${step.textColor} font-bold flex items-center justify-center`}>
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="h-80 bg-black/40 rounded-xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent pointer-events-none" />
              <Link2 className="w-16 h-16 text-[#00f0ff]/30 mb-4" />
              <span className="text-xs mt-3">Figure: Action Execution Flow</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Applications */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <h2 className="text-3xl font-bold mb-12 text-white text-center">Real-World Applications</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {realWorldApps.map((app, idx) => {
            const Icon = app.icon;
            return (
              <Link 
                key={idx}
                href={app.link}
                className="spotlight-card p-8 rounded-xl flex items-start gap-6 group cursor-pointer"
                data-testid={`card-app-${idx}`}
              >
                <div className={`w-14 h-14 rounded-full ${app.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7" style={{ color: app.iconColor }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00f0ff] transition">{app.title}</h3>
                  <p className="text-gray-400 text-sm">{app.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Developer Quick Start */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-24">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <Code className="w-6 h-6 text-[#00f0ff]" /> Developer Quick Start
        </h2>
        
        <div className="spotlight-card rounded-xl overflow-hidden border border-gray-800">
          <div className="bg-[#0d1117] px-4 py-2 border-b border-gray-800 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="p-6 bg-[#0d1117] font-mono text-sm text-gray-300">
            <div className="mb-6">
              <p className="text-gray-500 mb-2">// 1. {devQuickStart.step1.title}</p>
              <p className="text-[#00f0ff]">{devQuickStart.step1.code}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-500 mb-2">// 2. {devQuickStart.step2.title}</p>
              {devQuickStart.step2.code.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <div>
              <p className="text-gray-500 mb-2">// 3. {devQuickStart.step3.title}</p>
              <p className="text-green-400"> &gt; {devQuickStart.step3.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Solutions */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Related Solutions</h3>
          <p className="text-gray-400 text-sm mb-4">
            Explore other TBurn Chain solutions that integrate with Actions.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/solutions/wallets"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-wallets"
            >
              <Wallet className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Wallets</p>
                <p className="text-xs text-gray-500">User interaction</p>
              </div>
            </Link>
            <Link 
              href="/solutions/payments"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-payments"
            >
              <CreditCard className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">Payments</p>
                <p className="text-xs text-gray-500">Payment links</p>
              </div>
            </Link>
            <Link 
              href="/solutions/commerce"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#facc15]/5 border border-[#facc15]/20 hover:bg-[#facc15]/10 transition group"
              data-testid="link-commerce"
            >
              <Store className="w-5 h-5 text-[#facc15]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#facc15] transition">Commerce</p>
                <p className="text-xs text-gray-500">Social commerce</p>
              </div>
            </Link>
            <Link 
              href="/solutions/token-extensions"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 hover:bg-[#00ff9d]/10 transition group"
              data-testid="link-token-extensions"
            >
              <Coins className="w-5 h-5 text-[#00ff9d]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00ff9d] transition">Token Extensions</p>
                <p className="text-xs text-gray-500">Token swaps</p>
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
            Build and integrate Actions into your applications.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">SDK Guide</p>
                <p className="text-xs text-gray-500">Action SDK</p>
              </div>
            </Link>
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">Smart Contracts</p>
                <p className="text-xs text-gray-500">Action backend</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#facc15]/5 border border-[#facc15]/20 hover:bg-[#facc15]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#facc15]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#facc15] transition">API Reference</p>
                <p className="text-xs text-gray-500">Action API</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 hover:bg-[#00ff9d]/10 transition group"
              data-testid="link-websocket"
            >
              <Zap className="w-5 h-5 text-[#00ff9d]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00ff9d] transition">WebSocket API</p>
                <p className="text-xs text-gray-500">Real-time updates</p>
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
                <p className="text-xs text-gray-500">Command line tools</p>
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
                <p className="text-xs text-gray-500">Action samples</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Learn Pages */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Link 
            href="/learn/intro-to-defi"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-intro-to-defi"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Learn More</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#00ff9d]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#00ff9d]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#00ff9d] transition">Intro to DeFi</h4>
                <p className="text-xs text-gray-500">Trust Score System</p>
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
