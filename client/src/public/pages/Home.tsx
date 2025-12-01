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
import { useNetworkStats } from "../hooks/use-public-data";
import { NeuralCanvas } from "../components/NeuralCanvas";
import { AITerminal } from "../components/AITerminal";
import "../styles/public.css";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function useTextScramble(text: string, delay: number = 0) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let frame = 0;
    let animationId: number;
    
    const queue: Array<{ from: string; to: string; start: number; end: number; char?: string }> = [];
    
    for (let i = 0; i < text.length; i++) {
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      queue.push({ from: "", to: text[i], start, end });
    }

    const update = () => {
      let output = "";
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        if (frame >= item.end) {
          complete++;
          output += item.to;
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          output += item.char;
        } else {
          output += item.from;
        }
      }

      setDisplayText(output);

      if (complete === queue.length) {
        setIsComplete(true);
      } else {
        frame++;
        animationId = requestAnimationFrame(() => setTimeout(update, 30));
      }
    };

    const timer = setTimeout(() => {
      update();
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [text, delay]);

  return { displayText, isComplete };
}

const solutions = [
  {
    icon: Brain,
    title: "Triple-Band AI",
    description: "Three-tier AI orchestration using optimized decision-making at strategic, tactical, and operational levels.",
    color: "cyan",
  },
  {
    icon: Shield,
    title: "Quantum Security",
    description: "CRYSTALS-Dilithium + ED25519 hybrid signatures ensure security against future quantum threats.",
    color: "purple",
  },
  {
    icon: Coins,
    title: "DeFi Hub",
    description: "Complete DeFi ecosystem integrating DEX, lending, staking, and yield farming with liquidity AMM.",
    color: "blue",
  },
  {
    icon: Gamepad2,
    title: "GameFi Platform",
    description: "Next-gen gaming infrastructure with P2E engine, tournaments, and NFT marketplace cross-chain.",
    color: "green",
  },
  {
    icon: TrendingUp,
    title: "Auto Burn",
    description: "Hybrid deflation model with transaction-based, time-based, and AI-optimized burning.",
    color: "orange",
  },
  {
    icon: Link2,
    title: "Cross-Chain Bridge",
    description: "Secure cross-chain asset transfer solution connecting to 7+ chains including Ethereum and BSC.",
    color: "red",
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
    green: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
    red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  };
  return colors[color] || colors.cyan;
};

function ScrambleText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const { displayText, isComplete } = useTextScramble(text, delay);
  
  return (
    <span className={className}>
      {displayText.split("").map((char, i) => (
        <span 
          key={i} 
          className={isComplete || char === text[i] ? "" : "text-cyan-400/70"}
          style={{ 
            textShadow: !isComplete && char !== text[i] ? "0 0 10px rgba(0, 240, 255, 0.5)" : undefined 
          }}
        >
          {char}
        </span>
      ))}
      {!isComplete && <span className="cursor-blink" />}
    </span>
  );
}

export default function Home() {
  const { data: stats } = useNetworkStats();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
              {showContent ? (
                <>
                  <ScrambleText 
                    text="Trust-Based" 
                    className="text-gradient inline-block"
                    delay={300}
                  />
                  <span data-testid="text-hero-title" className="sr-only">Trust-Based</span>
                </>
              ) : (
                <span className="text-gradient">Trust-Based</span>
              )}
              <br />
              <span className="text-white">Blockchain Ecosystem</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
              TBurn Chain is the world's first trust network that verifies project reliability and ensures transparency. Build a secure ecosystem by tracking promise fulfillment in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
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
                {stats?.tps ? `${(stats.tps / 1000).toFixed(0)}K+` : "51K+"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">TPS</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-center group hover:border-cyan-400/30 transition-colors" data-testid="stat-latency">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                {stats?.avgBlockTime ? `${(stats.avgBlockTime / 1000).toFixed(2)}s` : "0.5s"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Latency</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-center group hover:border-cyan-400/30 transition-colors" data-testid="stat-validators">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                {stats?.totalValidators?.toLocaleString() || "30,000"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Validators</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-center group hover:border-cyan-400/30 transition-colors" data-testid="stat-fee">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors">$0.0001</div>
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
              const colors = getColorClasses(solution.color);
              const Icon = solution.icon;
              return (
                <div
                  key={index}
                  className="spotlight-card rounded-2xl p-8 group cursor-pointer"
                  data-testid={`card-solution-${index}`}
                >
                  <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-6 border ${colors.border} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{solution.description}</p>
                </div>
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

      <AITerminal />
    </div>
  );
}
