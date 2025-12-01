import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Terminal, 
  ArrowRight, 
  BookOpen,
  Box,
  Coins,
  Brain,
  FlaskConical,
  Server
} from "lucide-react";
import { SiJavascript, SiPython, SiRust, SiGo, SiSwift } from "react-icons/si";
import { FaJava } from "react-icons/fa";

const quickStartSteps = [
  { step: 1, comment: "# Install CLI", command: "npm install -g @burnchain/cli", highlight: "npm" },
  { step: 2, comment: "# Create Project", command: "burn init my-dapp --template=react", highlight: "burn" },
  { step: 3, comment: "# Run Dev Server", command: "cd my-dapp && burn dev", highlight: "cd" },
  { step: 4, comment: "# Deploy to Mainnet", command: "burn deploy --network=mainnet", highlight: "burn" },
];

const sdks = [
  { 
    name: "JavaScript / TypeScript", 
    icon: SiJavascript, 
    iconColor: "#facc15", 
    version: "v4.2.1", 
    install: "npm install @burnchain/sdk",
    downloads: "1.2M/mo downloads"
  },
  { 
    name: "Python", 
    icon: SiPython, 
    iconColor: "#60a5fa", 
    version: "v4.1.0", 
    install: "pip install burnchain-py",
    downloads: "450K/mo downloads"
  },
  { 
    name: "Rust", 
    icon: SiRust, 
    iconColor: "#f97316", 
    version: "v4.0.3", 
    install: "cargo add burnchain-rs",
    downloads: "280K/mo downloads"
  },
  { 
    name: "Go", 
    icon: SiGo, 
    iconColor: "#22d3ee", 
    version: "v4.0.2", 
    install: "go get github.com/burnchain/go",
    downloads: "180K/mo downloads"
  },
  { 
    name: "Java / Kotlin", 
    icon: FaJava, 
    iconColor: "#f87171", 
    version: "v4.0.1", 
    install: "implementation 'burnchain-jvm'",
    downloads: "120K/mo downloads"
  },
  { 
    name: "Swift", 
    icon: SiSwift, 
    iconColor: "#fb923c", 
    version: "v4.0.0", 
    install: "pod 'BurnChainSwift'",
    downloads: "85K/mo downloads"
  },
];

const blockchainApiEndpoints = [
  { method: "GET", path: "/v4/blocks/{hash}", color: "#22c55e" },
  { method: "GET", path: "/v4/transactions/{txId}", color: "#22c55e" },
  { method: "POST", path: "/v4/transactions/submit", color: "#3b82f6" },
  { method: "GET", path: "/v4/accounts/{address}", color: "#22c55e" },
];

const defiApiEndpoints = [
  { method: "GET", path: "/v4/defi/pools", color: "#22c55e" },
  { method: "POST", path: "/v4/defi/swap", color: "#3b82f6" },
  { method: "GET", path: "/v4/defi/lending/markets", color: "#22c55e" },
  { method: "POST", path: "/v4/defi/staking/stake", color: "#3b82f6" },
];

const aiApiEndpoints = [
  { method: "GET", path: "/v4/ai/trust-score/{id}", color: "#22c55e" },
  { method: "POST", path: "/v4/ai/analyze", color: "#3b82f6" },
  { method: "GET", path: "/v4/ai/predictions", color: "#22c55e" },
  { method: "WS", path: "/v4/ai/stream", color: "#a855f7" },
];

const devTools = [
  { title: "Burn CLI", description: "Project init & deploy", icon: Terminal, color: "#00f0ff" },
  { title: "Test Framework", description: "Unit & E2E testing", icon: FlaskConical, color: "#7000ff" },
  { title: "Local Devnet", description: "Simulator environment", icon: Server, color: "#00ff9d" },
];

const grantTiers = [
  { tier: "Seed", amount: "$5K - $25K", description: "Idea Validation" },
  { tier: "Build", amount: "$25K - $100K", description: "MVP Development" },
  { tier: "Scale", amount: "$100K - $500K", description: "Production Ready" },
  { tier: "Enterprise", amount: "$500K+", description: "Ecosystem Leader" },
];

export default function DeveloperHub() {
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
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#7000ff]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Terminal className="w-4 h-4" /> V4 SDK & API READY
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Developer{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Hub
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
            Build next-generation trust-based applications. Access comprehensive development tools, SDKs, and APIs for the TBurn Chain V4 ecosystem.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg flex items-center gap-2 font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ 
                  background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                  boxShadow: "0 0 15px rgba(112, 0, 255, 0.3)"
                }}
                data-testid="button-get-started"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center gap-2"
                data-testid="button-view-docs"
              >
                <BookOpen className="w-4 h-4" /> View Docs
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Quick Start</h2>
            <p className="text-gray-400">Deploy your first dApp in 5 minutes</p>
          </div>

          <div 
            className="rounded-lg overflow-hidden shadow-2xl"
            style={{ 
              background: "#0a0a0f",
              border: "1px solid #333",
              boxShadow: "0 25px 50px -12px rgba(112, 0, 255, 0.1)"
            }}
            data-testid="terminal-window"
          >
            {/* Terminal Header */}
            <div className="px-3 py-2 flex gap-1.5" style={{ background: "#1a1a20" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f56" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#27c93f" }} />
            </div>
            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm text-gray-300 space-y-4">
              {quickStartSteps.map((step) => (
                <div 
                  key={step.step}
                  className="flex gap-4 py-1 border-l-2 border-transparent hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 transition-colors pl-2"
                >
                  <span className="text-gray-500 select-none">{step.step}</span>
                  <div>
                    <span className="text-[#00ff9d]">{step.comment}</span>
                    <br />
                    <span className="text-[#00f0ff]">{step.highlight}</span>{" "}
                    {step.command.replace(step.highlight, "").replace(" && burn dev", "").replace(" && ", "")}
                    {step.command.includes(" && ") && (
                      <><span className="text-gray-300"> && </span><span className="text-[#00f0ff]">burn</span> dev</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Official SDKs Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Official SDKs</h2>
            <p className="text-gray-400">Native support for your favorite languages</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sdks.map((sdk, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-6"
                data-testid={`sdk-card-${index}`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <sdk.icon className="text-3xl" style={{ color: sdk.iconColor }} />
                  <span className="px-2 py-1 rounded bg-white/10 text-xs font-mono text-white">{sdk.version}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{sdk.name}</h3>
                <div className="bg-black/30 p-2 rounded text-xs font-mono text-[#00f0ff] mb-3">
                  {sdk.install}
                </div>
                <p className="text-xs text-gray-500">{sdk.downloads}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">API Reference</h2>
            <p className="text-gray-400">RESTful API & WebSocket Streaming</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Blockchain API */}
            <div className="spotlight-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-[#7000ff]" /> Blockchain API
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {blockchainApiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span 
                      className="px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${endpoint.color}20`,
                        color: endpoint.color,
                        border: `1px solid ${endpoint.color}30`
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-gray-300">{endpoint.path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DeFi API */}
            <div className="spotlight-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#00f0ff]" /> DeFi API
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {defiApiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span 
                      className="px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${endpoint.color}20`,
                        color: endpoint.color,
                        border: `1px solid ${endpoint.color}30`
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-gray-300">{endpoint.path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI API */}
            <div className="spotlight-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#00ff9d]" /> AI API
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {aiApiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span 
                      className="px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${endpoint.color}20`,
                        color: endpoint.color,
                        border: `1px solid ${endpoint.color}30`
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-gray-300">{endpoint.path}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Tools Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Development Tools</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {devTools.map((tool, index) => (
              <Link key={index} href="/developers/docs">
                <div 
                  className="spotlight-card p-6 rounded-xl flex items-center gap-4 group cursor-pointer"
                  data-testid={`dev-tool-${index}`}
                >
                  <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center" style={{ color: tool.color }}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{tool.title}</h4>
                    <p className="text-xs text-gray-400">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* Developer Grants Program */}
          <div 
            className="spotlight-card rounded-2xl p-8 text-center"
            style={{ 
              border: "1px solid rgba(0, 255, 157, 0.3)",
              background: "rgba(0, 255, 157, 0.05)"
            }}
            data-testid="grants-section"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Developer Grants Program</h2>
            <p className="text-gray-400 mb-8">We support projects that expand the TBurn Chain ecosystem.</p>
            
            <div className="inline-block px-6 py-2 rounded-full bg-[#00ff9d]/20 text-[#00ff9d] font-bold text-2xl mb-8">
              $50M Total Grant Fund
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-left">
              {grantTiers.map((tier, index) => (
                <div 
                  key={index}
                  className="p-4 rounded border border-white/10"
                  style={{ background: "rgba(0, 0, 0, 0.4)" }}
                >
                  <div className="text-xs text-[#00ff9d] font-bold uppercase mb-1">{tier.tier}</div>
                  <div className="text-xl font-bold text-white">{tier.amount}</div>
                  <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
