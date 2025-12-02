import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Sparkles, ArrowLeft, Zap, Shield, Users, Maximize2, 
  Palette, Search, BookOpen, Code, FileText, Terminal,
  Wallet, CreditCard, Gamepad2, Store, Coins, ExternalLink
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Performance",
    description: "Mint thousands of NFTs in seconds. TBurn Chain's high throughput ensures your drops happen instantly without gas wars.",
    gradientFrom: "#d946ef",
    gradientTo: "#8b5cf6",
    hoverColor: "text-[#d946ef]"
  },
  {
    icon: Shield,
    title: "Trust Verification",
    description: "Protect your community. Our 3-stage verification badge gives collectors confidence that your project is authentic and secure.",
    gradientFrom: "#8b5cf6",
    gradientTo: "#00f0ff",
    hoverColor: "text-[#8b5cf6]"
  },
  {
    icon: Users,
    title: "Thriving Ecosystem",
    description: "Join a network of thousands of artists and developers. Collaborate, cross-promote, and grow together on a unified platform.",
    gradientFrom: "#00f0ff",
    gradientTo: "#d946ef",
    hoverColor: "text-[#00f0ff]"
  },
  {
    icon: Maximize2,
    title: "Infinite Scalability",
    description: "From your first prototype to a global metaverse launch, our infrastructure scales effortlessly with your ambition.",
    gradientFrom: "#d946ef",
    gradientTo: "#f97316",
    hoverColor: "text-orange-400"
  }
];

const stats = [
  { value: "2.5M+", label: "NFTs Minted", color: "#d946ef" },
  { value: "$120M+", label: "Creator Earnings", color: "#8b5cf6" },
  { value: "15k+", label: "Verified Artists", color: "#00f0ff" }
];

export default function ArtistsCreators() {
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
      <section className="relative py-20 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d946ef]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#d946ef]/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-[#8b5cf6]/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/solutions/token-extensions"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#d946ef] mb-6 transition-colors group"
            data-testid="link-back-solutions"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Solutions
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#d946ef]/30 bg-[#d946ef]/5 text-[#d946ef] text-xs">
            <Sparkles className="w-4 h-4" /> For Visionaries
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-page-title">
            Empower Your <br />
            <span className="bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#00f0ff] bg-clip-text text-transparent">
              Creative Universe
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            Mint, sell, and manage digital collectibles with zero-friction tools. 
            TBurn Chain provides the canvas; you bring the masterpiece.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-[#d946ef] text-white px-8 py-3 rounded-lg font-bold hover:bg-pink-600 transition flex items-center justify-center gap-2"
              style={{ boxShadow: "0 0 20px rgba(217,70,239,0.4)" }}
              data-testid="button-start-creating"
            >
              <Palette className="w-4 h-4" /> Start Creating
            </button>
            <button 
              className="spotlight-card border border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition flex items-center justify-center gap-2 text-white"
              data-testid="button-explore"
            >
              <Search className="w-4 h-4" /> Explore Collections
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="spotlight-card rounded-2xl p-8 group flex flex-col md:flex-row gap-6 items-start"
                data-testid={`card-feature-${idx}`}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${feature.gradientFrom}, ${feature.gradientTo})` }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold text-white mb-3 group-hover:${feature.hoverColor} transition-colors`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-2xl p-10 border border-[#d946ef]/20">
          <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-4xl font-bold text-white mb-2 font-mono">{stat.value}</div>
                <div className="text-sm uppercase tracking-widest" style={{ color: stat.color }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Solutions */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Related Solutions</h3>
          <p className="text-gray-400 text-sm mb-4">
            Explore other TBurn Chain solutions for creators and artists.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/solutions/token-extensions"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#d946ef]/5 border border-[#d946ef]/20 hover:bg-[#d946ef]/10 transition group"
              data-testid="link-token-extensions"
            >
              <Coins className="w-5 h-5 text-[#d946ef]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#d946ef] transition">Token Extensions</p>
                <p className="text-xs text-gray-500">NFT standards</p>
              </div>
            </Link>
            <Link 
              href="/solutions/wallets"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/10 transition group"
              data-testid="link-wallets"
            >
              <Wallet className="w-5 h-5 text-[#8b5cf6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#8b5cf6] transition">Wallets</p>
                <p className="text-xs text-gray-500">Creator wallets</p>
              </div>
            </Link>
            <Link 
              href="/solutions/commerce"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-commerce"
            >
              <Store className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Commerce</p>
                <p className="text-xs text-gray-500">NFT marketplace</p>
              </div>
            </Link>
            <Link 
              href="/solutions/game-tooling"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f97316]/5 border border-[#f97316]/20 hover:bg-[#f97316]/10 transition group"
              data-testid="link-game-tooling"
            >
              <Gamepad2 className="w-5 h-5 text-[#f97316]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f97316] transition">Game Tooling</p>
                <p className="text-xs text-gray-500">Gaming NFTs</p>
              </div>
            </Link>
            <Link 
              href="/solutions/payments"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-payments"
            >
              <CreditCard className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">Payments</p>
                <p className="text-xs text-gray-500">Creator payouts</p>
              </div>
            </Link>
            <Link 
              href="/solutions/actions-blinks"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#facc15]/5 border border-[#facc15]/20 hover:bg-[#facc15]/10 transition group"
              data-testid="link-actions-blinks"
            >
              <Zap className="w-5 h-5 text-[#facc15]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#facc15] transition">Actions & Blinks</p>
                <p className="text-xs text-gray-500">NFT actions</p>
              </div>
            </Link>
            <Link 
              href="/solutions/financial"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-financial"
            >
              <Shield className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">Financial Infra</p>
                <p className="text-xs text-gray-500">Royalty system</p>
              </div>
            </Link>
            <Link 
              href="/solutions/ai-features"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-ai-features"
            >
              <Sparkles className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">AI Features</p>
                <p className="text-xs text-gray-500">AI art tools</p>
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
            Build creator tools and NFT applications with TBurn Chain.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#d946ef]/5 border border-[#d946ef]/20 hover:bg-[#d946ef]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#d946ef]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#d946ef] transition">SDK Guide</p>
                <p className="text-xs text-gray-500">NFT SDK</p>
              </div>
            </Link>
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#8b5cf6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#8b5cf6] transition">Smart Contracts</p>
                <p className="text-xs text-gray-500">TBC-721/1155</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">API Reference</p>
                <p className="text-xs text-gray-500">NFT API</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f97316]/5 border border-[#f97316]/20 hover:bg-[#f97316]/10 transition group"
              data-testid="link-websocket"
            >
              <Zap className="w-5 h-5 text-[#f97316]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f97316] transition">WebSocket API</p>
                <p className="text-xs text-gray-500">Real-time events</p>
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
                <p className="text-xs text-gray-500">Minting tools</p>
              </div>
            </Link>
            <Link 
              href="/developers/examples"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-examples"
            >
              <ExternalLink className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">Code Examples</p>
                <p className="text-xs text-gray-500">NFT samples</p>
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
              <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#8b5cf6] transition">DeFi Mastery</h4>
                <p className="text-xs text-gray-500">NFT DeFi integration</p>
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
                <p className="text-xs text-gray-500">NFT development</p>
              </div>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to make your mark?</h2>
          <p className="text-gray-400 mb-8">
            The tools you need to build the next generation of digital experiences are here.
          </p>
          <Link 
            href="/developers/docs"
            className="text-[#d946ef] hover:text-white transition-colors border-b border-[#d946ef] hover:border-white pb-1"
            data-testid="link-creator-guide"
          >
            Read Creator Guide <ArrowLeft className="w-4 h-4 inline-block rotate-180 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
