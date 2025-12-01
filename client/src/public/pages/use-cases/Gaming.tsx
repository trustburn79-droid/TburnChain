import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Gamepad2,
  Trophy,
  Coins,
  Palette,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Gift,
  Sparkles,
  Music,
  Film
} from "lucide-react";

const categories = [
  {
    icon: Gamepad2,
    iconColor: "#ff0055",
    title: "Web3 Gaming",
    desc: "True ownership of in-game assets. Players earn, trade, and transfer items across games. Provably fair mechanics and transparent odds."
  },
  {
    icon: Palette,
    iconColor: "#7000ff",
    title: "NFT Collectibles",
    desc: "Dynamic NFTs that evolve with usage. Gaming achievements, character progression, and unique items stored on-chain."
  },
  {
    icon: Music,
    iconColor: "#00f0ff",
    title: "Music & Streaming",
    desc: "Direct artist-to-fan monetization. Tokenized royalties, exclusive access passes, and decentralized content distribution."
  },
  {
    icon: Film,
    iconColor: "#ffd700",
    title: "Metaverse & Virtual Worlds",
    desc: "Interoperable virtual assets. Land ownership, wearables, and experiences that work across multiple platforms."
  }
];

const metrics = [
  {
    value: "50K+",
    label: "Daily Active Players",
    iconColor: "#ff0055"
  },
  {
    value: "$45M",
    label: "NFT Volume",
    iconColor: "#7000ff"
  },
  {
    value: "200+",
    label: "Games & Apps",
    iconColor: "#00f0ff"
  }
];

const features = [
  {
    icon: Zap,
    title: "Gas-Free Gaming",
    desc: "Session keys and meta-transactions eliminate friction"
  },
  {
    icon: Shield,
    title: "Anti-Cheat On-Chain",
    desc: "Cryptographic verification prevents exploits"
  },
  {
    icon: Users,
    title: "Guilds & DAOs",
    desc: "Community governance for games and esports"
  },
  {
    icon: Gift,
    title: "Play & Earn",
    desc: "Token rewards for gameplay achievements"
  }
];

const gameTypes = [
  { title: "MMORPGs", desc: "Massive multiplayer worlds with player-owned economies" },
  { title: "Battle Royale", desc: "Competitive games with skill-based rewards" },
  { title: "Card & Strategy", desc: "Collectible cards with true ownership" },
  { title: "Racing & Sports", desc: "Virtual vehicles and athlete NFTs" },
  { title: "Casual & Social", desc: "Simple games with social token mechanics" },
  { title: "Esports", desc: "Tournament infrastructure and prize pools" }
];

export default function Gaming() {
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#ff0055]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#7000ff]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#ff0055] mb-6">
            <Sparkles className="w-4 h-4" /> GAMING_ENTERTAINMENT
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Gaming &{" "}
            <span className="bg-gradient-to-r from-[#ff0055] to-[#7000ff] bg-clip-text text-transparent">
              Entertainment
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Build the next generation of games and entertainment experiences.
            True digital ownership, provably fair mechanics, and player-driven economies.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              className="px-8 py-3 rounded-lg bg-[#ff0055] text-white font-bold hover:bg-pink-600 transition"
              style={{ boxShadow: "0 0 20px rgba(255,0,85,0.3)" }}
              data-testid="button-build"
            >
              Start Building
            </button>
            <Link href="/solutions/game-tooling">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-tools"
              >
                Game Tooling
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-b border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {metrics.map((metric, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-8 text-center"
                data-testid={`card-metric-${idx}`}
              >
                <div 
                  className="text-4xl font-bold mb-2 font-mono"
                  style={{ color: metric.iconColor }}
                >
                  {metric.value}
                </div>
                <p className="text-sm text-gray-400">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Use Case Categories</h2>
            <p className="text-gray-400">Powering entertainment across every format.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-white/10"
                  data-testid={`card-category-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${category.iconColor}10`,
                      border: `1px solid ${category.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: category.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{category.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{category.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Platform Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#ff0055] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Game Genres</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {gameTypes.map((game, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 border border-white/10"
                data-testid={`card-game-${idx}`}
              >
                <Trophy className="w-6 h-6 text-[#ffd700] mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
                <p className="text-sm text-gray-400">{game.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#ff0055]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(255,0,85,0.1) 0%, rgba(112,0,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join the growing ecosystem of games and entertainment on TBurn Chain.
              Access our SDK, documentation, and developer community.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/developers/quickstart">
                <button 
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#ff0055] text-white font-bold hover:bg-pink-600 transition"
                  style={{ boxShadow: "0 0 20px rgba(255,0,85,0.3)" }}
                  data-testid="button-quickstart"
                >
                  Quick Start <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/app">
                <button 
                  className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                  data-testid="button-login"
                >
                  Member Portal
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
