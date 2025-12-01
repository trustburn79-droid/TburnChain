import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  ArrowRight,
  Code,
  Shield,
  Zap,
  Lock,
  ArrowLeftRight,
  Flame
} from "lucide-react";
import { SiEthereum } from "react-icons/si";

const keyDifferences = [
  {
    icon: Code,
    title: "EVM Compatibility",
    iconColor: "#00f0ff",
    bgColor: "bg-[#00f0ff]/5",
    labelColor: "text-[#00f0ff]",
    badgeColor: "bg-[#00f0ff]/20 text-[#00f0ff]",
    evmDesc: "Standard EVM execution environment.",
    tburnDesc: "100% Compatible. Deploy Solidity/Vyper as-is."
  },
  {
    icon: Shield,
    title: "Verification",
    iconColor: "#7000ff",
    bgColor: "bg-[#7000ff]/5",
    labelColor: "text-[#7000ff]",
    badgeColor: "bg-[#7000ff]/20 text-[#7000ff]",
    evmDesc: "Manual audits & Community reviews (Slow).",
    tburnDesc: "3-Stage Automated System (AI → Expert → Community)."
  },
  {
    icon: Zap,
    title: "Performance",
    iconColor: "#00ff9d",
    bgColor: "bg-[#00ff9d]/5",
    labelColor: "text-[#00ff9d]",
    badgeColor: "bg-[#00ff9d]/20 text-[#00ff9d]",
    evmDesc: "15-50 TPS, Slow finality.",
    tburnDesc: "100,000+ TPS, 1s Blocks, 6s Finality."
  },
  {
    icon: Lock,
    title: "Safety",
    iconColor: "#ff0055",
    bgColor: "bg-[#ff0055]/5",
    labelColor: "text-[#ff0055]",
    badgeColor: "bg-[#ff0055]/20 text-[#ff0055]",
    evmDesc: "High risk of Rug Pulls & Scams.",
    tburnDesc: "Auto-Burn Mechanism & Collateral Enforcement."
  }
];

const developmentSteps = [
  {
    step: 1,
    color: "#00f0ff",
    title: "Use Existing Code",
    desc: "Since TBurn is fully EVM compatible, you don't need to rewrite your smart contracts. Deploy your existing Solidity code using Hardhat or Foundry.",
    code: "npx hardhat run scripts/deploy.ts\n--network tburn_mainnet"
  },
  {
    step: 2,
    color: "#7000ff",
    title: "Integrate Trust Score",
    desc: "Call the `TrustOracle` interface in your contract to check a project's reliability score before interacting. This adds a layer of safety for your users.",
    code: "require(TrustOracle.getScore(addr) > 80);"
  },
  {
    step: 3,
    color: "#00ff9d",
    title: "Leverage Auto-Burn",
    desc: "Design your tokenomics to utilize TBurn's automatic burn mechanism. Gain instant user trust by automating promise fulfillment on-chain.",
    code: "AutoBurn.execute(amount);"
  }
];

export default function EvmMigration() {
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          {/* Migration Icons */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <SiEthereum className="w-8 h-8 text-gray-400" />
            </div>
            <ArrowRight className="w-8 h-8 text-[#7000ff] animate-pulse" />
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <ArrowLeftRight className="w-4 h-4" /> MIGRATION_GUIDE
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            From EVM to{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              TBurn Chain
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Seamlessly migrate your dApps from Ethereum or other EVM chains. Experience fully compatible smart contracts with built-in trust verification.
          </p>
        </div>
      </section>

      {/* Key Differences Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Key Differences</h2>
            <p className="text-gray-400">Why developers are switching to TBurn.</p>
          </div>

          <div className="grid gap-6">
            {keyDifferences.map((diff, idx) => {
              const Icon = diff.icon;
              return (
                <div 
                  key={idx} 
                  className="spotlight-card rounded-xl p-0 overflow-hidden"
                  data-testid={`card-diff-${idx}`}
                >
                  <div className="grid md:grid-cols-[200px_1fr_1px_1fr]">
                    {/* Title Column */}
                    <div className="p-6 bg-white/5 flex items-center gap-3 border-b md:border-b-0 md:border-r border-white/10">
                      <Icon className="w-5 h-5" style={{ color: diff.iconColor }} />
                      <h3 className="font-bold text-white">{diff.title}</h3>
                    </div>
                    
                    {/* EVM Column */}
                    <div className="p-6 flex flex-col justify-center">
                      <p className="text-xs text-gray-500 uppercase mb-1">Existing EVM Chains</p>
                      <p className="text-gray-300">{diff.evmDesc}</p>
                    </div>
                    
                    {/* Divider */}
                    <div className="hidden md:block bg-white/10 w-px h-full" />
                    
                    {/* TBurn Column */}
                    <div className={`p-6 ${diff.bgColor} flex flex-col justify-center relative`}>
                      <div className={`absolute top-0 right-0 px-2 py-0.5 ${diff.badgeColor} text-[10px] font-bold rounded-bl`}>
                        UPGRADE
                      </div>
                      <p className={`text-xs ${diff.labelColor} uppercase mb-1`}>TBurn Chain</p>
                      <p className="text-white font-bold">{diff.tburnDesc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Development Approach Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Development Approach</h2>
            <p className="text-gray-400">How to build on TBurn Chain</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {developmentSteps.map((step) => (
              <div 
                key={step.step}
                className="spotlight-card rounded-xl p-8 relative"
                data-testid={`card-step-${step.step}`}
              >
                {/* Step Number Badge */}
                <div 
                  className="absolute -top-6 left-6 w-12 h-12 bg-black border rounded-full flex items-center justify-center text-xl font-bold z-10"
                  style={{ 
                    borderColor: step.color,
                    color: step.color,
                    boxShadow: `0 0 15px ${step.color}40`
                  }}
                >
                  {step.step}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {step.desc}
                  </p>
                  <div 
                    className="text-xs font-mono bg-black/40 p-2 rounded border border-white/10 whitespace-pre-wrap"
                    style={{ color: step.color }}
                  >
                    {step.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="spotlight-card p-1 rounded-2xl bg-gradient-to-r from-[#7000ff]/50 to-[#00f0ff]/50">
            <div className="bg-black/90 rounded-xl p-12 backdrop-blur-xl">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Migrate?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Check our documentation for detailed migration guides, endpoint references, and SDKs.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/developers/docs">
                  <button 
                    className="px-8 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition"
                    data-testid="button-docs"
                  >
                    Read Documentation
                  </button>
                </Link>
                <Link href="/community/hub">
                  <button 
                    className="px-8 py-3 rounded-lg border border-white/20 text-white font-bold hover:bg-white/10 transition"
                    data-testid="button-support"
                  >
                    Contact Dev Support
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
