import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { AITerminal } from "../components/AITerminal";
import { TBurnLogo } from "@/components/tburn-logo";
import "../styles/public.css";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#";

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
  const [displayHtml, setDisplayHtml] = useState(() => words?.[0] || "");
  const scrambleRef = useRef<TextScramble | null>(null);
  const indexRef = useRef(0);
  const isMountedRef = useRef(true);
  const isRunningRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!words || words.length === 0) {
      return;
    }

    // Create scramble instance once
    scrambleRef.current = new TextScramble((html) => {
      if (isMountedRef.current) {
        setDisplayHtml(html);
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

  return displayHtml || words?.[0] || "";
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
  const displayHtml = useRotatingScramble(safeKeywords, 3000);
  
  return (
    <span 
      className="text-gradient inline-block"
      dangerouslySetInnerHTML={{ __html: displayHtml }}
    />
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { data: statsResponse } = usePublicNetworkStats();
  const stats = statsResponse?.data;
  
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
    <div className="pb-8">
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
                {stats?.tps != null 
                  ? stats.tps.toLocaleString() 
                  : "210,000"}
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
                {stats?.blockHeight != null 
                  ? (stats.blockHeight >= 1000000 
                      ? (stats.blockHeight / 1000000).toFixed(1) + "M" 
                      : stats.blockHeight.toLocaleString()) 
                  : "1.9M"}
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
                {stats?.totalTransactions != null 
                  ? (stats.totalTransactions >= 1000000 
                      ? (stats.totalTransactions / 1000000).toFixed(1) + "M" 
                      : stats.totalTransactions >= 1000 
                        ? Math.floor(stats.totalTransactions / 1000).toLocaleString() + "K" 
                        : stats.totalTransactions.toLocaleString()) 
                  : "56.3M"}
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
                {stats?.uptime || "99.99%"}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.uptime')}</div>
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
      <AITerminal />
    </div>
  );
}
