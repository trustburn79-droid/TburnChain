import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  BookOpen, 
  Search, 
  Zap, 
  Terminal, 
  Key, 
  ArrowRight,
  Server,
  Package,
  FileCode,
  Radio,
  GraduationCap,
  Cpu,
  Gauge,
  Clock,
  Shield,
  Brain,
  Utensils,
  Coins,
  MessageCircle
} from "lucide-react";

const quickStartItems = [
  { 
    title: "Get Started in 5 Min", 
    description: "Create your first TBurn dApp.",
    icon: Zap,
    color: "#00f0ff",
    hoverColor: "hover:text-[#00f0ff]"
  },
  { 
    title: "Development Setup", 
    description: "Configure local environment & CLI.",
    icon: Terminal,
    color: "#7000ff",
    hoverColor: "hover:text-[#7000ff]"
  },
  { 
    title: "Get API Keys", 
    description: "Authentication & Access tokens.",
    icon: Key,
    color: "#00ff9d",
    hoverColor: "hover:text-[#00ff9d]"
  },
];

const docCategories = [
  { 
    title: "API Reference", 
    description: "Complete guide to RESTful API, GraphQL, and gRPC endpoints for node interaction.",
    icon: Server,
    badge: "v4.2.1",
    gradient: "from-blue-500 to-cyan-500"
  },
  { 
    title: "SDK Guide", 
    description: "Official libraries for JavaScript, Python, Rust, Go, and Java development.",
    icon: Package,
    badge: "Multi-lang",
    gradient: "from-green-500 to-emerald-500"
  },
  { 
    title: "CLI Reference", 
    description: "Manage nodes, deploy contracts, and interact with the chain via command line.",
    icon: Terminal,
    badge: "Tooling",
    gradient: "from-purple-500 to-pink-500"
  },
  { 
    title: "Smart Contracts", 
    description: "Write and deploy contracts using Solidity & Vyper. Best practices and security patterns.",
    icon: FileCode,
    badge: "EVM",
    gradient: "from-orange-500 to-red-500"
  },
  { 
    title: "WebSocket API", 
    description: "Subscribe to block headers, transactions, and event logs in real-time.",
    icon: Radio,
    badge: "Real-time",
    gradient: "from-indigo-500 to-violet-500"
  },
  { 
    title: "Tutorials", 
    description: "Step-by-step guides for building DeFi apps, NFT marketplaces, and DAOs.",
    icon: GraduationCap,
    badge: "Learning",
    gradient: "from-teal-500 to-cyan-500"
  },
];

const architectureStats = [
  { icon: Zap, label: "500,000+ TPS", sublabel: "Throughput", color: "#00f0ff" },
  { icon: Clock, label: "1.84ms", sublabel: "Latency", color: "#7000ff" },
  { icon: Shield, label: "Quantum Safe", sublabel: "Cryptography", color: "#00ff9d" },
  { icon: Brain, label: "Triple AI", sublabel: "Orchestration", color: "#ffd700" },
];

const architectureLayers = [
  { 
    number: "01", 
    title: "Application Layer", 
    description: "dApps, Wallets, NFT Marketplaces",
    color: "#7000ff",
    tags: ["Web3.js", "Ethers.js"]
  },
  { 
    number: "02", 
    title: "Service Layer", 
    description: "DeFi Protocols, GameFi Engines, AI Oracles",
    color: "#00f0ff",
    tags: []
  },
  { 
    number: "03", 
    title: "Consensus Layer", 
    description: "DPoS + BFT Hybrid Engine",
    color: "#00ff9d",
    tags: []
  },
  { 
    number: "04", 
    title: "Execution Layer", 
    description: "EVM Compatible, Parallel Processing",
    color: "#ffffff",
    tags: []
  },
];

const additionalResources = [
  { title: "Cookbook", description: "Practical code recipes.", icon: Utensils, color: "#7000ff" },
  { title: "Trust Score", description: "Evaluation algorithms.", icon: Shield, color: "#00f0ff" },
  { title: "DeFi Hub", description: "Integration guides.", icon: Coins, color: "#00ff9d" },
  { title: "Community", description: "Join the discussion.", icon: MessageCircle, color: "#ffffff" },
];

export default function Documentation() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
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
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{ 
                background: "linear-gradient(to bottom right, #00f0ff, #7000ff)",
                boxShadow: "0 10px 15px -3px rgba(0, 240, 255, 0.2)"
              }}
            >
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white" data-testid="text-page-title">
                {t('publicPages.developers.docs.title').split(' ')[0]}{" "}
                <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
                  {t('publicPages.developers.docs.title').split(' ').slice(1).join(' ') || 'Docs'}
                </span>
              </h1>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#00ff9d]/20 text-[#00ff9d] text-xs font-mono border border-[#00ff9d]/30">
                  V4 Mainnet
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-xs font-mono border border-white/10">
                  Latest
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
            Build next-generation blockchain applications on TBurn Chain. Explore comprehensive guides, API references, and smart contract examples.
          </p>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search documentation (e.g. 'Deploy Contract', 'RPC Endpoint')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-24 rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none"
              style={{ 
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
              data-testid="input-search"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 text-xs text-gray-600 font-mono">
              <span className="border border-gray-700 rounded px-1.5 py-0.5">Ctrl</span>
              <span className="border border-gray-700 rounded px-1.5 py-0.5">K</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-12 px-6 border-b border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-lg font-bold text-white mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickStartItems.map((item, index) => (
              <Link key={index} href="/developers/quickstart">
                <div 
                  className="spotlight-card p-6 rounded-xl group cursor-pointer"
                  data-testid={`quick-start-${index}`}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{ 
                        backgroundColor: `${item.color}10`,
                        border: `1px solid ${item.color}30`
                      }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-white mb-1 transition-colors ${item.hoverColor} group-hover:text-opacity-100`}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors mt-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-8">Documentation Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docCategories.map((category, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-6 group cursor-pointer"
                data-testid={`doc-category-${index}`}
              >
                <div 
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                  <h3 className="text-xl font-bold text-white">{category.title}</h3>
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-300">
                    {category.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* V4 Core Architecture Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Cpu className="w-6 h-6 text-[#7000ff]" /> V4 Core Architecture
            </h2>
            <p className="text-gray-400">Understanding the layers of TBurn Chain.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {architectureStats.map((stat, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg text-center"
                  style={{ 
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                  data-testid={`arch-stat-${index}`}
                >
                  <stat.icon className="w-7 h-7 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="font-bold text-white">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.sublabel}</div>
                </div>
              ))}
            </div>

            {/* Layers Stack */}
            <div className="space-y-3">
              {architectureLayers.map((layer, index) => (
                <div 
                  key={index}
                  className="spotlight-card rounded-lg p-4 flex justify-between items-center group"
                  data-testid={`arch-layer-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs"
                      style={{ 
                        backgroundColor: `${layer.color}20`,
                        border: `1px solid ${layer.color}50`,
                        color: layer.color
                      }}
                    >
                      {layer.number}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{layer.title}</h4>
                      <p className="text-xs text-gray-500">{layer.description}</p>
                    </div>
                  </div>
                  {layer.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {layer.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 rounded text-[10px] text-gray-400"
                          style={{ 
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)"
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-8">Additional Resources</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {additionalResources.map((resource, index) => (
              <Link key={index} href="/developers">
                <div 
                  className="spotlight-card p-4 rounded-xl cursor-pointer transition-colors"
                  style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
                  data-testid={`resource-${index}`}
                >
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <resource.icon className="w-4 h-4" style={{ color: resource.color }} />
                    {resource.title}
                  </h4>
                  <p className="text-xs text-gray-400">{resource.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 px-6"
        style={{ background: "linear-gradient(to right, rgba(112, 0, 255, 0.1), rgba(0, 240, 255, 0.1))" }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-gray-400 mb-8">
            Join 10,000+ developers building the future of decentralized applications.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ 
                  background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                  boxShadow: "0 0 15px rgba(112, 0, 255, 0.3)"
                }}
                data-testid="button-start-building"
              >
                {t('publicPages.common.startBuilding')} <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            </Link>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center gap-2"
              data-testid="link-discord"
            >
              <MessageCircle className="w-4 h-4" /> Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
