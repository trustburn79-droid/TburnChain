import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Zap,
  Link2,
  Share2,
  Shield,
  Globe,
  Image,
  Gavel,
  ShoppingCart,
  Gamepad2,
  Users
} from "lucide-react";

const coreFeatures = [
  {
    icon: Link2,
    iconColor: "#00f0ff",
    title: "URL Execution",
    desc: "Perform swaps, minting, and voting with just a link click."
  },
  {
    icon: Share2,
    iconColor: "#7000ff",
    title: "Social Integration",
    desc: "Embed actions in Twitter, Discord, Telegram, and QR codes."
  },
  {
    icon: Shield,
    iconColor: "#00ff9d",
    title: "Trust Verified",
    desc: "Trust scores are automatically checked before execution."
  },
  {
    icon: Globe,
    iconColor: "#ffffff",
    title: "Universal",
    desc: "Works seamlessly across web, mobile, and IoT devices."
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

const useCases = [
  {
    icon: ShoppingCart,
    iconColor: "#00f0ff",
    title: "Social Commerce",
    desc: "Click product links on Twitter to pay instantly. 1-second settlement."
  },
  {
    icon: Gamepad2,
    iconColor: "#7000ff",
    title: "Gaming Items",
    desc: "Trade NFT items directly within Discord channels."
  },
  {
    icon: Users,
    iconColor: "#00ff9d",
    title: "Crowdfunding",
    desc: "Invest in verified projects via Telegram links. (Score > 80% only)"
  }
];

const howItWorks = [
  { step: 1, color: "#7000ff", bgColor: "bg-[#7000ff]", textColor: "text-white", title: "Generate URL", desc: "Devs create action links." },
  { step: 2, color: "#00f0ff", bgColor: "bg-[#00f0ff]", textColor: "text-black", title: "Trust Check", desc: "Auto-display project trust score." },
  { step: 3, color: "#ffffff", bgColor: "bg-white", textColor: "text-black", title: "Execute", desc: "Wallet signature & transaction." }
];

const devGuide = [
  { step: "01", title: "Generate Action URL", code: "https://tburn.io/action?type=swap&from=TBURN&to=USDC" },
  { step: "02", title: "Set Metadata", code: '<meta property="bc:action" content="swap" />' },
  { step: "03", title: "Share & Execute", desc: "Distribute the URL. Users can execute with a single click." }
];

export default function ActionsBlinks() {
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
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Zap className="w-4 h-4" /> BLOCKCHAIN_ACTIONS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Blockchain{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Actions
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            Execute transactions with a simple URL link.<br />
            Secure, verifiable actions integrated everywhere.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
              style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
              data-testid="button-create"
            >
              Create Action
            </button>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                View Docs
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Core Features</h2>
            <p className="text-gray-400">Why use TBurn Actions?</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card p-6 rounded-xl group"
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
        </div>
      </section>

      {/* Action Types Section */}
      <section className="py-16 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Action Types</h2>
            <p className="text-gray-400">What can you build?</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {actionTypes.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 border border-white/10"
                  data-testid={`card-action-${idx}`}
                >
                  <Icon className="w-8 h-8 mb-4" style={{ color: action.iconColor }} />
                  <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{action.desc}</p>
                  <div 
                    className="font-mono text-sm p-3 rounded-lg overflow-x-auto"
                    style={{ 
                      background: "#0d0d12",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#a0a0a0"
                    }}
                  >
                    {action.code}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real-World Use Cases Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Use Cases List */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Real-World Use Cases</h2>
              <div className="space-y-6">
                {useCases.map((uc, idx) => {
                  const Icon = uc.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="mt-1">
                        <Icon className="w-5 h-5" style={{ color: uc.iconColor }} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{uc.title}</h4>
                        <p className="text-gray-400 text-sm">{uc.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How Actions Work */}
            <div className="spotlight-card rounded-2xl p-8 border border-[#7000ff]/30 bg-[#7000ff]/5">
              <h3 className="text-2xl font-bold text-white mb-6">How Actions Work</h3>
              <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/10" />
                
                {howItWorks.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4 relative z-10">
                    <div 
                      className={`w-8 h-8 rounded-full ${step.bgColor} flex items-center justify-center font-bold text-sm ${step.textColor}`}
                    >
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Guide Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Developer Guide</h2>
          
          <div className="space-y-4">
            {devGuide.map((guide, idx) => (
              <div 
                key={idx}
                className="spotlight-card p-6 rounded-xl border border-white/10 flex gap-4"
                data-testid={`card-guide-${idx}`}
              >
                <div className="text-[#00f0ff] font-bold text-xl">{guide.step}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2">{guide.title}</h4>
                  {guide.code ? (
                    <div 
                      className="font-mono text-sm p-3 rounded-lg overflow-x-auto"
                      style={{ 
                        background: "#0d0d12",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#a0a0a0"
                      }}
                    >
                      {guide.code}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{guide.desc}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
