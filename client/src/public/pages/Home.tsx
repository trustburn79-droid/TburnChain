import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { 
  ArrowRight, 
  Book, 
  Brain, 
  Shield, 
  Coins, 
  Gamepad2, 
  TrendingUp, 
  Link2 
} from "lucide-react";
import { usePublicNetworkStats } from "../hooks/use-public-data";
import { NeuralCanvas } from "../components/NeuralCanvas";
import { AITerminal } from "../components/AITerminal";
import { PublicFooter } from "../components/PublicFooter";
import "../styles/public.css";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#";
const KEYWORDS = ["Trust-Based", "AI-Powered", "Quantum-Safe", "Hyper-Scale"];

class TextScramble {
  private chars: string;
  private queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>;
  private frame: number;
  private frameRequest: number | null;
  private resolve: (() => void) | null;
  private onUpdate: (text: string) => void;

  constructor(onUpdate: (text: string) => void) {
    this.chars = SCRAMBLE_CHARS;
    this.queue = [];
    this.frame = 0;
    this.frameRequest = null;
    this.resolve = null;
    this.onUpdate = onUpdate;
  }

  setText(newText: string, oldText: string = ""): Promise<void> {
    const length = Math.max(oldText.length, newText.length);
    this.queue = [];
    this.frame = 0;

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }

    return new Promise((resolve) => {
      this.resolve = resolve;
      this.update();
    });
  }

  private update = () => {
    let output = "";
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="scramble-char">${item.char}</span>`;
      } else {
        output += item.from;
      }
    }

    this.onUpdate(output);

    if (complete === this.queue.length) {
      if (this.resolve) this.resolve();
    } else {
      this.frame++;
      this.frameRequest = requestAnimationFrame(this.update);
    }
  };

  destroy() {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
  }
}

function useRotatingScramble(words: string[], intervalMs: number = 3000) {
  const [displayHtml, setDisplayHtml] = useState(words[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrambleRef = useRef<TextScramble | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    scrambleRef.current = new TextScramble((html) => setDisplayHtml(html));

    const runCycle = async () => {
      if (!scrambleRef.current) return;
      
      const nextIndex = (currentIndex + 1) % words.length;
      await scrambleRef.current.setText(words[nextIndex], words[currentIndex]);
      
      setTimeout(() => {
        setCurrentIndex(nextIndex);
      }, intervalMs);
    };

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      setTimeout(() => {
        runCycle();
      }, intervalMs);
    } else {
      runCycle();
    }

    return () => {
      if (scrambleRef.current) {
        scrambleRef.current.destroy();
      }
    };
  }, [currentIndex]);

  return displayHtml;
}

const solutions = [
  {
    icon: Brain,
    title: "Triple-Band AI",
    description: "Three-tier AI orchestration using optimized decision-making at strategic, tactical, and operational levels.",
    color: "pink",
    href: "/solutions/ai-features",
  },
  {
    icon: Shield,
    title: "Quantum Security",
    description: "CRYSTALS-Dilithium + ED25519 hybrid signatures ensure security against future quantum threats.",
    color: "cyan",
    href: "/solutions/token-extensions",
  },
  {
    icon: Coins,
    title: "DeFi Hub",
    description: "Complete DeFi ecosystem integrating DEX, lending, staking, and yield farming with liquidity AMM.",
    color: "blue",
    href: "/solutions/defi-hub",
  },
  {
    icon: Gamepad2,
    title: "GameFi Platform",
    description: "Next-gen gaming infrastructure with P2E engine, tournaments, and NFT marketplace cross-chain.",
    color: "rose",
    href: "/use-cases/gaming",
  },
  {
    icon: TrendingUp,
    title: "Auto Burn",
    description: "Hybrid deflation model with transaction-based, time-based, and AI-optimized burning.",
    color: "green",
    href: "/learn/tokenomics",
  },
  {
    icon: Link2,
    title: "Cross-Chain Bridge",
    description: "Secure cross-chain asset transfer solution connecting to 7+ chains including Ethereum and BSC.",
    color: "purple",
    href: "/solutions/cross-chain-bridge",
  },
];

const getIconStyle = (color: string) => {
  const styles: Record<string, { bg: string; shadow: string; iconColor: string }> = {
    pink: { 
      bg: "bg-gradient-to-br from-pink-500 to-rose-600", 
      shadow: "shadow-lg shadow-pink-500/30",
      iconColor: "text-white"
    },
    cyan: { 
      bg: "bg-gradient-to-br from-cyan-400 to-cyan-600", 
      shadow: "shadow-lg shadow-cyan-500/30",
      iconColor: "text-white"
    },
    blue: { 
      bg: "bg-gradient-to-br from-blue-400 to-blue-600", 
      shadow: "shadow-lg shadow-blue-500/30",
      iconColor: "text-white"
    },
    rose: { 
      bg: "bg-gradient-to-br from-rose-400 to-pink-600", 
      shadow: "shadow-lg shadow-rose-500/30",
      iconColor: "text-white"
    },
    green: { 
      bg: "bg-gradient-to-br from-emerald-400 to-green-600", 
      shadow: "shadow-lg shadow-emerald-500/30",
      iconColor: "text-white"
    },
    purple: { 
      bg: "bg-gradient-to-br from-violet-400 to-purple-600", 
      shadow: "shadow-lg shadow-violet-500/30",
      iconColor: "text-white"
    },
  };
  return styles[color] || styles.cyan;
};

function RotatingTitle() {
  const displayHtml = useRotatingScramble(KEYWORDS, 3000);
  
  return (
    <span 
      className="text-gradient inline-block"
      dangerouslySetInnerHTML={{ __html: displayHtml }}
    />
  );
}

export default function Home() {
  const { data: statsResponse } = usePublicNetworkStats();
  const stats = statsResponse?.data;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = e.currentTarget.querySelectorAll(".spotlight-card");
    cards.forEach((card) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
      (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
    });
  };

  return (
    <div className="min-h-screen bg-[#030407] text-white antialiased selection:bg-cyan-500/30 selection:text-white">
      <NeuralCanvas />

      <main className="relative pt-32 pb-20" style={{ position: "relative", zIndex: 1 }}>
        {/* Hero Section */}
        <section className="relative overflow-hidden mb-24">
          {/* Floating Orbs */}
          <div className="hero-orb hero-orb-purple w-[500px] h-[500px] top-0 left-[10%]" style={{ animationDelay: "0s" }}></div>
          <div className="hero-orb hero-orb-cyan w-[400px] h-[400px] bottom-0 right-[15%]" style={{ animationDelay: "2s" }}></div>
          <div className="hero-orb hero-orb-purple w-[300px] h-[300px] top-[50%] right-[5%]" style={{ animationDelay: "4s" }}></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-xs font-mono mb-8 backdrop-blur-sm animate-glow-pulse">
              <span className="relative w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75"></span>
                <span className="relative rounded-full w-2 h-2 bg-cyan-400 block"></span>
              </span>
              V4 MAINNET LIVE
            </div>

            {/* Hero Title with Scramble Effect */}
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
              <RotatingTitle />
              <span data-testid="text-hero-title" className="sr-only">Trust-Based</span>
              <br />
              <span className="text-white">Blockchain Ecosystem</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
              TBurn Chain is the world's first trust network that verifies project reliability and ensures transparency. Build a secure ecosystem by tracking promise fulfillment in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/developers/quickstart">
                <button 
                  className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 glow-white"
                  data-testid="button-get-started"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/developers/docs">
                <button 
                  className="glass-panel text-white border border-white/10 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  data-testid="button-documentation"
                >
                  <Book className="w-5 h-5" /> Documentation
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-6 rounded-2xl text-center group hover:border-cyan-400/30 transition-colors" data-testid="stat-tps">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                {stats?.tps != null 
                  ? (stats.tps >= 1000 ? Math.floor(stats.tps / 1000) + "K+" : stats.tps.toLocaleString()) 
                  : "51K+"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">TPS</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-center group hover:border-cyan-400/30 transition-colors" data-testid="stat-latency">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                {stats?.avgBlockTime != null ? `${Number(stats.avgBlockTime).toFixed(2)}s` : "0.5s"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Latency</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-center group hover:border-cyan-400/30 transition-colors" data-testid="stat-validators">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                {stats?.activeValidators != null ? stats.activeValidators.toLocaleString() : "125"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Validators</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-center group hover:border-cyan-400/30 transition-colors" data-testid="stat-fee">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                {stats?.gasPrice != null ? `$${stats.gasPrice}` : "$0.0001"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Avg Fee</div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" data-testid="text-solutions-title">Core Solutions</h2>
            <p className="text-gray-400">Next-generation enterprise blockchain infrastructure</p>
          </div>

          <div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            onMouseMove={handleMouseMove}
          >
            {solutions.map((solution, index) => {
              const iconStyle = getIconStyle(solution.color);
              const Icon = solution.icon;
              return (
                <Link key={index} href={solution.href}>
                  <div
                    className="spotlight-card rounded-2xl p-8 group cursor-pointer h-full"
                    data-testid={`card-solution-${index}`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${iconStyle.bg} ${iconStyle.shadow} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${iconStyle.iconColor}`} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{solution.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{solution.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 mb-24">
          <div className="glass-panel rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-600/10 pointer-events-none"></div>
            <h2 className="text-3xl font-bold text-white mb-6" data-testid="text-cta-title">Ready to Build Trust?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link href="/learn">
                <button 
                  className="bg-cyan-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-cyan-300 transition glow-cyan"
                  data-testid="button-explore-ecosystem"
                >
                  Explore Ecosystem
                </button>
              </Link>
              <Link href="/community/hub">
                <button 
                  className="text-white border border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition"
                  data-testid="button-join-community"
                >
                  Join Community
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
      <AITerminal />
    </div>
  );
}
