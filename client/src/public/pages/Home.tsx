import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  Book, 
  Brain, 
  Shield, 
  Coins, 
  Gamepad2, 
  TrendingUp, 
  Link2,
  Layers,
  Repeat,
  Lock,
  Wallet,
  Sparkles,
  Zap
} from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import "../styles/public.css";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#";

interface CharElement {
  char: string;
  isScramble: boolean;
}

class TextScramble {
  private chars: string;
  private queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>;
  private frame: number;
  private frameRequest: number | null;
  private resolve: (() => void) | null;
  private onUpdate: (elements: CharElement[]) => void;

  constructor(onUpdate: (elements: CharElement[]) => void) {
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
    const output: CharElement[] = [];
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      if (this.frame >= item.end) {
        complete++;
        output.push({ char: item.to, isScramble: false });
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output.push({ char: item.char, isScramble: true });
      } else {
        output.push({ char: item.from, isScramble: false });
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
  const [displayElements, setDisplayElements] = useState<CharElement[]>(() => 
    (words?.[0] || "").split("").map(char => ({ char, isScramble: false }))
  );
  const scrambleRef = useRef<TextScramble | null>(null);
  const indexRef = useRef(0);
  const isMountedRef = useRef(true);
  const isRunningRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!words || words.length === 0) {
      return;
    }

    scrambleRef.current = new TextScramble((elements) => {
      if (isMountedRef.current) {
        setDisplayElements(elements);
      }
    });

    const runCycle = async () => {
      if (!scrambleRef.current || !isMountedRef.current || isRunningRef.current) return;
      
      isRunningRef.current = true;
      
      const currentIdx = indexRef.current;
      const nextIdx = (currentIdx + 1) % words.length;
      
      try {
        await scrambleRef.current.setText(words[nextIdx], words[currentIdx]);
        indexRef.current = nextIdx;
      } catch (e) {
        // Ignore errors if unmounted
      }
      
      isRunningRef.current = false;
    };

    // Initial delay before first transition
    const initialTimer = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      // Start the interval loop
      runCycle();
      const intervalId = setInterval(() => {
        if (isMountedRef.current) {
          runCycle();
        }
      }, intervalMs);
      
      // Store interval for cleanup
      (scrambleRef.current as any)._intervalId = intervalId;
    }, intervalMs);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimer);
      if (scrambleRef.current) {
        const intervalId = (scrambleRef.current as any)._intervalId;
        if (intervalId) clearInterval(intervalId);
        scrambleRef.current.destroy();
        scrambleRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  return displayElements.length > 0 
    ? displayElements 
    : (words?.[0] || "").split("").map(char => ({ char, isScramble: false }));
}

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

function RotatingTitle({ keywords }: { keywords: string[] }) {
  const safeKeywords = Array.isArray(keywords) && keywords.length > 0 
    ? keywords 
    : ["Trust-Based"];
  const displayElements = useRotatingScramble(safeKeywords, 3000);
  
  return (
    <span className="text-gradient inline-block">
      {displayElements.map((el, i) => (
        el.isScramble ? (
          <span key={i} className="scramble-char">{el.char}</span>
        ) : (
          <span key={i}>{el.char}</span>
        )
      ))}
    </span>
  );
}

// Default fallback values for instant rendering before API response
const DEFAULT_STATS = {
  tps: 97000,
  blockHeight: 40200000,
  totalTransactions: 298500000,
  uptime: "99.99%"
};

// Network stats interface for internal API (same as /app/transactions page)
interface InternalNetworkStats {
  currentBlockHeight: number;
  tps: number;
  totalTransactions: number;
}

// Public API response format
interface PublicNetworkStatsResponse {
  success: boolean;
  data: {
    tps: number;
    blockHeight: number;
    totalTransactions: number;
    uptime?: string;
  };
}

export default function Home() {
  const { t } = useTranslation();
  
  // ★ [LEGAL REQUIREMENT] Use SAME API as /app/transactions page for data consistency
  // This ensures homepage displays identical totalTransactions as transactions explorer
  const { data: internalStats } = useQuery<InternalNetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 30000, // ★ OPTIMIZED: Reduced from 5s to 30s for server stability
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  // Fallback to public API for TPS if internal API not available
  const { data: publicStats } = useQuery<PublicNetworkStatsResponse>({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 30000, // ★ OPTIMIZED: Reduced from 5s to 30s
    staleTime: 30000,
    enabled: !internalStats, // Only fetch if internal API didn't respond
  });
  
  // Merge API data with defaults for instant rendering
  // CRITICAL: totalTransactions from internal API for consistency with /app/transactions
  const stats = {
    tps: internalStats?.tps || publicStats?.data?.tps || DEFAULT_STATS.tps,
    blockHeight: internalStats?.currentBlockHeight || publicStats?.data?.blockHeight || DEFAULT_STATS.blockHeight,
    totalTransactions: internalStats?.totalTransactions || publicStats?.data?.totalTransactions || DEFAULT_STATS.totalTransactions,
    uptime: DEFAULT_STATS.uptime // Uptime is always 99.99%
  };
  
  // Auto-cycling highlight effect for stat cards
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % 4);
    }, 2000); // Cycle every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  const keywords = t('publicPages.home.heroTitleRotating', { returnObjects: true }) as string[];

  const solutions = [
    {
      icon: Brain,
      title: t('publicPages.home.solutions.tripleBandAi.title'),
      description: t('publicPages.home.solutions.tripleBandAi.description'),
      color: "pink",
      href: "/solutions/ai-features",
    },
    {
      icon: Shield,
      title: t('publicPages.home.solutions.quantumSecurity.title'),
      description: t('publicPages.home.solutions.quantumSecurity.description'),
      color: "cyan",
      href: "/solutions/token-extensions",
    },
    {
      icon: Coins,
      title: t('publicPages.home.solutions.defiHub.title'),
      description: t('publicPages.home.solutions.defiHub.description'),
      color: "blue",
      href: "/solutions/defi-hub",
    },
    {
      icon: Gamepad2,
      title: t('publicPages.home.solutions.gamefiPlatform.title'),
      description: t('publicPages.home.solutions.gamefiPlatform.description'),
      color: "rose",
      href: "/use-cases/gaming",
    },
    {
      icon: TrendingUp,
      title: t('publicPages.home.solutions.autoBurn.title'),
      description: t('publicPages.home.solutions.autoBurn.description'),
      color: "green",
      href: "/learn/tokenomics",
    },
    {
      icon: Link2,
      title: t('publicPages.home.solutions.crossChainBridge.title'),
      description: t('publicPages.home.solutions.crossChainBridge.description'),
      color: "purple",
      href: "/solutions/cross-chain-bridge",
    },
  ];

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
    <div className="pt-4 pb-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden mb-24 pt-8">
          {/* Large Translucent TBurn Symbol */}
          <div className="absolute right-[5%] top-[10%] opacity-10 pointer-events-none hidden lg:block">
            <TBurnLogo className="w-64 h-64 xl:w-80 xl:h-80" showText={true} textColor="#000000" />
          </div>
          {/* Floating Orbs - only in dark mode */}
          <div className="hidden dark:block">
            <div className="hero-orb hero-orb-purple w-[500px] h-[500px] top-0 left-[10%]" style={{ animationDelay: "0s" }}></div>
            <div className="hero-orb hero-orb-cyan w-[400px] h-[400px] bottom-0 right-[15%]" style={{ animationDelay: "2s" }}></div>
            <div className="hero-orb hero-orb-purple w-[300px] h-[300px] top-[50%] right-[5%]" style={{ animationDelay: "4s" }}></div>
          </div>
          {/* Light mode gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-purple-50/50 to-transparent dark:hidden pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-600/30 dark:border-cyan-400/30 bg-cyan-500/10 dark:bg-cyan-400/5 text-cyan-600 dark:text-cyan-400 text-xs font-mono mb-8 backdrop-blur-sm animate-glow-pulse">
              <span className="relative w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping opacity-75"></span>
                <span className="relative rounded-full w-2 h-2 bg-cyan-500 dark:bg-cyan-400 block"></span>
              </span>
              {t('publicPages.home.heroTag')}
            </div>

            {/* Hero Title with Scramble Effect */}
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
              <span className="text-gray-900 dark:text-white">{t('publicPages.home.heroTitle')} </span>
              <RotatingTitle keywords={keywords} />
              <span data-testid="text-hero-title" className="sr-only">{keywords[0]}</span>
              <br />
              <span className="text-gray-900 dark:text-white">{t('publicPages.home.heroSubtitle')}</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
              {t('publicPages.home.heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/scan">
                <button 
                  className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg dark:glow-white"
                  data-testid="button-launch-explorer"
                >
                  TBURN Scan <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/learn/whitepaper">
                <button 
                  className="bg-white dark:bg-transparent dark:glass-panel text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-sm"
                  data-testid="button-read-whitepaper"
                >
                  <Book className="w-5 h-5" /> {t('publicPages.home.readWhitepaper')}
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              className={`bg-white dark:bg-transparent dark:glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 shadow-sm ${
                activeStatIndex === 0 
                  ? 'border-cyan-500 dark:border-cyan-400/50 scale-105 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-400/20' 
                  : 'border-gray-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-400/30'
              }`} 
              data-testid="stat-tps"
            >
              <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                activeStatIndex === 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
              }`}>
                {stats.tps.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.tps')}</div>
            </div>
            <div 
              className={`bg-white dark:bg-transparent dark:glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 shadow-sm ${
                activeStatIndex === 1 
                  ? 'border-cyan-500 dark:border-cyan-400/50 scale-105 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-400/20' 
                  : 'border-gray-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-400/30'
              }`} 
              data-testid="stat-blocks"
            >
              <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                activeStatIndex === 1 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
              }`}>
                {(stats.blockHeight / 1000000).toFixed(1) + "M"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.blocks')}</div>
            </div>
            <div 
              className={`bg-white dark:bg-transparent dark:glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 shadow-sm ${
                activeStatIndex === 2 
                  ? 'border-cyan-500 dark:border-cyan-400/50 scale-105 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-400/20' 
                  : 'border-gray-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-400/30'
              }`} 
              data-testid="stat-daily-txs"
            >
              <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                activeStatIndex === 2 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
              }`}>
                {(stats.totalTransactions / 1000000).toFixed(1) + "M"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.dailyTxs')}</div>
            </div>
            <div 
              className={`bg-white dark:bg-transparent dark:glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 shadow-sm ${
                activeStatIndex === 3 
                  ? 'border-cyan-500 dark:border-cyan-400/50 scale-105 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-400/20' 
                  : 'border-gray-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-400/30'
              }`} 
              data-testid="stat-uptime"
            >
              <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                activeStatIndex === 3 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
              }`}>
                {stats.uptime}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.uptime')}</div>
            </div>
          </div>
        </section>

        {/* 5 Advanced Technologies Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono mb-6">
              <Sparkles className="w-3 h-3" />
              2026 NEXT-GEN TECHNOLOGY
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-advanced-tech-title">
              5 Core Technologies
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Enterprise-grade infrastructure with 1,900% TPS increase, 95% cost reduction, and Web2-level UX
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform" data-testid="card-modular-da">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Modular DA</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Data Availability Layer with compression</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform" data-testid="card-restaking">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Repeat className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Restaking</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">AVS rewards up to 12.5% APY</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform" data-testid="card-zk-rollup">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">ZK Rollup</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">95% gas savings with L2 scaling</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform" data-testid="card-account-abstraction">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Account Abstraction</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Gasless TX & session keys</p>
            </div>

            <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform" data-testid="card-intent-architecture">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Intent Architecture</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">MEV protection & natural language</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">1,900%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">TPS Increase</div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">95%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cost Reduction</div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">Web2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Level UX</div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-solutions-title">{t('publicPages.home.solutions.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.home.solutions.subtitle')}</p>
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
                    className="bg-white dark:bg-transparent dark:spotlight-card border border-gray-200 dark:border-white/10 rounded-2xl p-8 group cursor-pointer h-full shadow-sm hover:shadow-md dark:hover:border-white/20 transition-all"
                    data-testid={`card-solution-${index}`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${iconStyle.bg} ${iconStyle.shadow} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${iconStyle.iconColor}`} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{solution.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{solution.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 mb-24">
          <div className="bg-white dark:bg-transparent dark:glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-600/10 pointer-events-none"></div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-cta-title">{t('publicPages.home.cta.title')}</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link href="/learn">
                <button 
                  className="bg-cyan-500 dark:bg-cyan-400 text-white dark:text-black px-8 py-3 rounded-lg font-bold hover:bg-cyan-400 dark:hover:bg-cyan-300 transition dark:glow-cyan"
                  data-testid="button-explore-ecosystem"
                >
                  {t('publicPages.home.cta.exploreEcosystem')}
                </button>
              </Link>
              <Link href="/community/hub">
                <button 
                  className="text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  data-testid="button-join-community"
                >
                  {t('publicPages.home.cta.joinCommunity')}
                </button>
              </Link>
            </div>
          </div>
        </section>
    </div>
  );
}
