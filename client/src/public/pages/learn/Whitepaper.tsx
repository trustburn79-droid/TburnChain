import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { 
  FileCode, 
  FileText, 
  AlertTriangle, 
  DollarSign, 
  TrendingDown, 
  UserX,
  Check,
  Zap,
  Timer,
  Box,
  Server,
  Brain,
  Cpu,
  Terminal,
  ShieldCheck,
  Lock,
  Key,
  Boxes,
  Coins,
  Gamepad2,
  Link as LinkIcon
} from "lucide-react";
import { SiGithub } from "react-icons/si";

const trustCrisis = [
  {
    icon: AlertTriangle,
    title: "80%+ Scams",
    description: "Over 80% of new crypto projects are potential scams or rugpulls.",
    color: "#ff2a6d",
  },
  {
    icon: DollarSign,
    title: "$2.7B Lost",
    description: "Total funds lost to rugpulls and fraud in 2023 alone.",
    color: "#f97316",
  },
  {
    icon: TrendingDown,
    title: "$3.1B Risk",
    description: "Estimated losses projected for 2024 without intervention.",
    color: "#f97316",
  },
  {
    icon: UserX,
    title: "60-80% Loss",
    description: "Average investor loss rate in early-stage projects.",
    color: "#ff2a6d",
  },
];

const performanceMetrics = [
  { icon: Zap, value: "500k+", label: "TPS", color: "#00f0ff" },
  { icon: Timer, value: "1.84ms", label: "Latency", color: "#7000ff" },
  { icon: Box, value: "1s", label: "Block Time", color: "#00ff9d" },
  { icon: Server, value: "30,000", label: "Nodes", color: "#ffd700" },
];

const aiLayers = [
  {
    icon: Brain,
    title: "Strategic Layer",
    model: ":: ChatGPT Latest",
    latency: "450ms",
    description: "Handles complex market analysis, governance proposal evaluation, and long-term strategy formulation.",
    color: "#3b82f6",
  },
  {
    icon: Cpu,
    title: "Tactical Layer",
    model: ":: Claude Latest",
    latency: "180ms",
    description: "Processes trust assessment, transaction verification, and smart contract auditing.",
    color: "#a855f7",
  },
  {
    icon: Terminal,
    title: "Operational Layer",
    model: ":: Gemini Latest",
    latency: "45ms",
    description: "Executes real-time monitoring, emergency response (Auto-Burn), and automated actions.",
    color: "#22c55e",
  },
];

const quantumSecurity = [
  {
    icon: Lock,
    title: "CRYSTALS-Dilithium",
    description: "NIST standard lattice-based signature algorithm providing post-quantum security.",
  },
  {
    icon: Key,
    title: "Hybrid Signatures",
    description: "Combining ED25519 + Dilithium for backward compatibility and future-proofing.",
  },
];

const coreModules = [
  {
    icon: Coins,
    title: "DeFi Hub",
    description: "Integrated AMM DEX, 85% LTV Loans, and Liquid Staking.",
  },
  {
    icon: Gamepad2,
    title: "GameFi Platform",
    description: "P2E Engine, Tournament System, and Cross-chain Item Trading.",
  },
  {
    icon: LinkIcon,
    title: "Cross-Chain Bridge",
    description: "Secure atomic swaps connected to 7+ major blockchains.",
  },
];

export default function Whitepaper() {
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
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-[#00f0ff]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <FileCode className="w-4 h-4" /> VERSION 4.0.2
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-page-title">
            Technical{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Whitepaper
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
            Decentralized Trust Infrastructure for Blockchain Projects.
            <br />Arbitrum-based Layer 2 solution verifying reliability with 100% on-chain transparency.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg flex items-center gap-2 font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ 
                  background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                  boxShadow: "0 0 20px rgba(112, 0, 255, 0.3)"
                }}
                data-testid="button-download-pdf"
              >
                <FileText className="w-4 h-4" /> Download PDF
              </button>
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center gap-2"
              data-testid="link-view-source"
            >
              <SiGithub className="w-4 h-4" /> View Source
            </a>
          </div>
        </div>
      </section>

      {/* The Trust Crisis Section */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">The Trust Crisis</h2>
            <p className="text-gray-500">Fundamental Issues in the Current Blockchain Industry</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustCrisis.map((item, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-6"
                style={{ borderTop: `2px solid ${item.color}50` }}
                data-testid={`crisis-card-${index}`}
              >
                <item.icon className="w-8 h-8 mb-4" style={{ color: item.color }} />
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* V4 Enterprise Performance Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="md:w-1/2">
              <div className="inline-block px-3 py-1 rounded bg-[#7000ff]/20 text-[#7000ff] text-xs font-bold mb-4 font-mono">
                SOLUTION ARCHITECTURE
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">V4 Enterprise Performance</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                TBurn Chain isn't just about trust scoring; it's a high-performance Layer 2 scaling solution built on Arbitrum technology, designed for enterprise-grade throughput.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#00ff9d]" /> Hybrid Consensus (DPoS + BFT)
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#00ff9d]" /> EVM Compatibility
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#00ff9d]" /> Dynamic Sharding Support
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 w-full">
              <div className="grid grid-cols-2 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div 
                    key={index}
                    className="p-6 rounded-lg text-center"
                    style={{ 
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(0,0,0,0.4)"
                    }}
                    data-testid={`performance-metric-${index}`}
                  >
                    <metric.icon className="w-6 h-6 mx-auto mb-2" style={{ color: metric.color }} />
                    <div className="text-2xl font-bold text-white font-mono">{metric.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Triple-Band AI Orchestration Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Triple-Band AI Orchestration</h2>
            <p className="text-gray-400">Intelligent decision-making using three distinct AI models.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiLayers.map((layer, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-8"
                style={{ border: `1px solid ${layer.color}20` }}
                data-testid={`ai-layer-${index}`}
              >
                <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
                  <layer.icon className="w-8 h-8" style={{ color: layer.color }} />
                  <span 
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: `${layer.color}10`,
                      color: layer.color
                    }}
                  >
                    {layer.latency}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{layer.title}</h3>
                <p className="text-xs mb-4 font-mono" style={{ color: layer.color }}>{layer.model}</p>
                <p className="text-sm text-gray-400">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Core Modules Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Quantum-Safe Security */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#00f0ff]" /> Quantum-Safe Security
              </h3>
              <div className="space-y-4">
                {quantumSecurity.map((item, index) => (
                  <div key={index} className="spotlight-card p-5 rounded-lg flex gap-4">
                    <div className="text-[#00f0ff] text-xl">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-gray-400 text-xs">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* V4 Core Modules */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Boxes className="w-6 h-6 text-[#7000ff]" /> V4 Core Modules
              </h3>
              <div className="space-y-4">
                {coreModules.map((item, index) => (
                  <div key={index} className="spotlight-card p-5 rounded-lg flex gap-4">
                    <div className="text-[#7000ff] text-xl">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-gray-400 text-xs">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
