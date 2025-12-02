import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  ShieldCheck, 
  Zap, 
  Flame, 
  Network, 
  AlertTriangle,
  Book
} from "lucide-react";
import { SiGithub } from "react-icons/si";

const coreFeatures = [
  {
    icon: ShieldCheck,
    title: "Trust Verification",
    description: (
      <>
        Ensure reliability through a 3-stage verification system:{" "}
        <span className="text-[#00f0ff]">AI Filtering</span>,{" "}
        <span className="text-[#00f0ff]">Expert Validation</span>, and{" "}
        <span className="text-[#00f0ff]">Community Voting</span>.
      </>
    ),
    color: "#00f0ff",
  },
  {
    icon: Zap,
    title: "Ultra-Fast Processing",
    description: (
      <>
        High-performance consensus engine capable of{" "}
        <span className="text-white font-mono">100,000+ TPS</span> with 1-second block times and 6-second finality.
      </>
    ),
    color: "#7000ff",
  },
  {
    icon: Flame,
    title: "Automatic Burn System",
    description: (
      <>
        Smart contract-based <span className="text-[#ff2a6d]">Forced Burn</span> mechanism that automatically penalizes collateral if project promises are not met.
      </>
    ),
    color: "#ff2a6d",
  },
  {
    icon: Network,
    title: "Distributed Validation",
    description: (
      <>
        A global validator network of{" "}
        <span className="text-white font-mono">30,000 super nodes</span> achieves high throughput while maintaining security and decentralization.
      </>
    ),
    color: "#00ff9d",
  },
];

const consensusSpecs = [
  { label: "Theoretical TPS", value: "100,000+" },
  { label: "Practical TPS", value: "50,000+" },
  { label: "Block Time", value: "1 second" },
  { label: "Finality", value: "6 seconds" },
];

export default function WhatIsBurnChain() {
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            {t('publicPages.learn.whatIsBurnChain.tag')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.learn.whatIsBurnChain.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('publicPages.learn.whatIsBurnChain.subtitle')}
          </p>
        </div>
      </section>

      {/* Trust-Based Blockchain Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6 text-white border-l-4 border-[#7000ff] pl-4">
              The World's First Trust-Based Blockchain
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              TBurn Chain was built from the ground up with trust as its core value. Unlike traditional blockchains that only validate transactions, TBurn Chain features an innovative architecture that{" "}
              <span className="text-[#00f0ff]">tracks and enforces project promise fulfillment</span> in real-time.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              At the heart of our technology is the <strong className="text-white">Trust Score system</strong>. It comprehensively evaluates burn compliance, development progress, and financial transparency (0-100 scale).
            </p>
            <div className="mt-4 p-4 bg-red-900/10 border border-red-500/20 rounded-lg text-red-400 text-base font-mono flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>protocol_rule: If trust_score &lt; 40%, token_trading = SUSPENDED</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Core Features</h2>
            <p className="text-gray-500 mt-2">Engineered for reliability and speed.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {coreFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="spotlight-card rounded-2xl p-8 group"
                data-testid={`feature-card-${index}`}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: `${feature.color}10`,
                    border: `1px solid ${feature.color}30`
                  }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-white">Technical Specifications</h2>
          
          <div 
            className="rounded-2xl p-8 mb-16 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(112, 0, 255, 0.2)",
              boxShadow: "0 0 20px rgba(112, 0, 255, 0.05)"
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7000ff]/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              {/* Consensus Algorithm */}
              <div>
                <h3 className="text-lg font-bold text-[#00f0ff] mb-4 font-mono">// CONSENSUS_ALGORITHM</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Hybrid mechanism combining DPoS (Delegated Proof of Stake) and BFT (Byzantine Fault Tolerance).
                </p>
                <ul className="space-y-2 text-sm font-mono text-gray-400">
                  {consensusSpecs.map((spec, index) => (
                    <li key={index} className="flex justify-between border-b border-white/10 pb-1">
                      <span>{spec.label}</span>
                      <span className="text-white">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Smart Contracts */}
              <div>
                <h3 className="text-lg font-bold text-[#7000ff] mb-4 font-mono">// SMART_CONTRACTS</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Fully EVM compatible. Supports Solidity and Vyper. Includes built-in interfaces for Trust Score queries.
                </p>
                <div className="p-3 bg-black/40 rounded border border-white/10 font-mono text-xs text-gray-500">
                  <span className="text-[#7000ff]">function</span>{" "}
                  <span className="text-yellow-400">getTrustScore</span>(address project){" "}
                  <span className="text-[#7000ff]">public view returns</span> (uint8) {"{"}<br />
                  &nbsp;&nbsp;<span className="text-[#7000ff]">return</span> TrustOracle.score(project);<br />
                  {"}"}
                </div>
              </div>
            </div>
          </div>

          {/* Developer Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">Designed for Developers</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              TBurn Chain provides a complete ecosystem of tools. With robust SDKs and comprehensive documentation, you can build trust-verified dApps instantly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/developers">
                <button 
                  className="px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition flex items-center gap-2"
                  data-testid="button-read-docs"
                >
                  <Book className="w-4 h-4" /> Read Docs
                </button>
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-white/20 text-white font-bold hover:bg-white/10 transition flex items-center gap-2"
                data-testid="link-github-sdk"
              >
                <SiGithub className="w-4 h-4" /> TBurn SDK
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
