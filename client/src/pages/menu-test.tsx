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
  Globe,
  ChevronDown,
  Sun,
  TreeDeciduous
} from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import { PublicFooter } from "@/public/components/PublicFooter";
import "@/public/styles/public.css";

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

    const initialTimer = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      runCycle();
      const intervalId = setInterval(() => {
        if (isMountedRef.current) {
          runCycle();
        }
      }, intervalMs);
      
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
  }, []);

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

const DEFAULT_STATS = {
  tps: 97000,
  blockHeight: 40200000,
  totalTransactions: 298500000,
  uptime: "99.99%"
};

interface InternalNetworkStats {
  currentBlockHeight: number;
  tps: number;
  totalTransactions: number;
}

interface PublicNetworkStatsResponse {
  success: boolean;
  data: {
    tps: number;
    blockHeight: number;
    totalTransactions: number;
    uptime?: string;
  };
}

const menuStyles = `
.menu-page {
  min-height: 100vh;
  background: #030407;
  color: #f5f5f5;
}

.menu-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(3, 4, 7, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.menu-header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.menu-logo-text {
  font-weight: 700;
  font-size: 1.25rem;
}

.menu-logo-text .chain {
  color: #06b6d4;
  font-weight: 300;
}

.menu-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.menu-nav-item {
  position: relative;
  padding: 0.7rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #a1a1aa;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-nav-item:hover {
  color: #f5f5f5;
  background: rgba(255, 255, 255, 0.05);
}

.menu-nav-item::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #f97316, #06b6d4);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 2px;
}

.menu-nav-item:hover::after {
  width: calc(100% - 2rem);
}

.menu-nav-item .arrow {
  font-size: 0.65rem;
  transition: transform 0.4s ease;
}

.menu-nav-item:hover .arrow {
  transform: rotate(180deg);
}

.mega-menu-wrapper {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 15px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s ease, visibility 0.4s ease;
}

.menu-nav-item:hover .mega-menu-wrapper {
  opacity: 1;
  visibility: visible;
}

.mega-menu {
  width: 920px;
  background: #080411;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(15, 76, 93, 0.3);
  transform: translateY(10px) scale(0.98);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-nav-item:hover .mega-menu {
  transform: translateY(0) scale(1);
}

.mega-menu-header {
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mega-menu-title {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mega-menu-title-icon {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.mega-menu-badge {
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border-radius: 20px;
  font-weight: 500;
}

.mega-menu-body {
  padding: 1.5rem;
}

.mega-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.mega-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.mega-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f97316, #06b6d4);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.mega-section:hover::before {
  transform: scaleX(1);
}

.mega-section:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-3px);
}

.mega-section:first-child {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(249, 115, 22, 0.4);
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.15);
}

.mega-section:first-child::before {
  transform: scaleX(1);
}

.mega-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.mega-section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.4s ease;
}

.mega-section:hover .mega-section-icon {
  transform: scale(1.1) rotate(-5deg);
}

.mega-section-icon.gold { 
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); 
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.15);
}
.mega-section-icon.cyan { 
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2)); 
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.15);
}
.mega-section-icon.purple { 
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2)); 
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.15);
}
.mega-section-icon.pink { 
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.2)); 
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.15);
}

.mega-section-title {
  font-size: 0.6rem;
  font-weight: 700;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.mega-links {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.mega-link {
  font-size: 0.84rem;
  color: #a1a1aa;
  padding: 0.5rem 0.75rem;
  margin: 0 -0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 8px;
  text-decoration: none;
  position: relative;
}

.mega-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #f97316;
  border-radius: 2px;
  transition: height 0.3s ease;
}

.mega-link:hover::before {
  height: 60%;
}

.mega-link:hover {
  color: #f5f5f5;
  background: rgba(249, 115, 22, 0.08);
  padding-left: 1rem;
}

.mega-link .arrow-icon {
  margin-left: auto;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  font-size: 0.8rem;
  color: #f97316;
}

.mega-link:hover .arrow-icon {
  opacity: 1;
  transform: translateX(0);
}

.badge {
  font-size: 0.6rem;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.badge.core { 
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); 
  color: #f97316; 
}
.badge.new { 
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2)); 
  color: #06b6d4;
  animation: pulse-badge 2s infinite;
}
.badge.hot { 
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.2)); 
  color: #ef4444; 
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.mega-quick-access {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.mega-quick-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #71717a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.mega-quick-label .icon {
  color: #f97316;
  animation: flash 2s infinite;
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.mega-quick-items {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.mega-quick-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #a1a1aa;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.mega-quick-btn:hover {
  border-color: #f97316;
  color: #f5f5f5;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.15);
}

.mega-featured {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mega-featured-text {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mega-featured-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.mega-featured-info h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.mega-featured-info p {
  font-size: 0.8rem;
  color: #a1a1aa;
}

.mega-featured-btn {
  padding: 0.6rem 1.2rem;
  background: #f97316;
  color: #000;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.mega-featured-btn:hover {
  background: #ea580c;
  transform: translateY(-2px);
}

.menu-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-icon-btn {
  padding: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease;
  background: none;
  border: none;
}

.menu-icon-btn:hover {
  color: #f5f5f5;
}

.menu-icon-btn.tree:hover {
  color: #22c55e;
}

.menu-lang-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease;
  background: none;
  border: none;
}

.menu-lang-btn:hover {
  color: #f5f5f5;
}

.menu-lang-code {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.menu-login-btn {
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #06b6d4;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

.menu-login-btn:hover {
  background: rgba(6, 182, 212, 0.1);
}

.menu-content {
  padding-top: 1rem;
}

@media (max-width: 1200px) {
  .mega-menu { width: 95vw; }
  .mega-menu-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 992px) {
  .menu-nav { display: none; }
}
`;

export default function MenuTest() {
  const { t } = useTranslation();
  
  const { data: internalStats } = useQuery<InternalNetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  const { data: publicStats } = useQuery<PublicNetworkStatsResponse>({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 30000,
    staleTime: 30000,
    enabled: !internalStats,
  });
  
  const stats = {
    tps: internalStats?.tps || publicStats?.data?.tps || DEFAULT_STATS.tps,
    blockHeight: internalStats?.currentBlockHeight || publicStats?.data?.blockHeight || DEFAULT_STATS.blockHeight,
    totalTransactions: internalStats?.totalTransactions || publicStats?.data?.totalTransactions || DEFAULT_STATS.totalTransactions,
    uptime: DEFAULT_STATS.uptime
  };
  
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % 4);
    }, 2000);
    
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
    <>
      <style>{menuStyles}</style>
      <div className="menu-page">
        {/* Mega Menu Header */}
        <header className="menu-header">
          <div className="menu-header-content">
            <Link href="/" className="menu-logo">
              <TBurnLogo className="w-10 h-10" />
              <div className="menu-logo-text">
                <span>TBurn</span> <span className="chain">Chain</span>
              </div>
            </Link>

            <nav className="menu-nav">
              {/* Explore */}
              <div className="menu-nav-item">
                Explore <span className="arrow">▾</span>
                <div className="mega-menu-wrapper">
                  <div className="mega-menu">
                    <div className="mega-menu-header">
                      <div className="mega-menu-title">
                        <span className="mega-menu-title-icon">🔍</span>
                        Explore TBurn Chain
                      </div>
                      <div className="mega-menu-badge">Mainnet Live</div>
                    </div>
                    <div className="mega-menu-body">
                      <div className="mega-menu-grid">
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon gold">🔍</div>
                            <div className="mega-section-title">TBURNScan</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/scan" className="mega-link">Mainnet Scan <span className="badge core">Core</span> <span className="arrow-icon">→</span></Link>
                            <Link href="/scan/blocks" className="mega-link">Blocks <span className="arrow-icon">→</span></Link>
                            <Link href="/scan/txs" className="mega-link">Transactions <span className="arrow-icon">→</span></Link>
                            <Link href="/scan/validators" className="mega-link">Validators <span className="arrow-icon">→</span></Link>
                            <Link href="/scan/tokens" className="mega-link">Tokens <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon cyan">📊</div>
                            <div className="mega-section-title">Network</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/network/validators" className="mega-link">Validators <span className="badge core">Core</span> <span className="arrow-icon">→</span></Link>
                            <Link href="/network/rpc" className="mega-link">RPC Providers <span className="arrow-icon">→</span></Link>
                            <Link href="/network/status" className="mega-link">Network Status <span className="arrow-icon">→</span></Link>
                            <Link href="/network/ramp" className="mega-link">On/Off Ramp <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon purple">📚</div>
                            <div className="mega-section-title">Learn</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/learn/what-is-burn-chain" className="mega-link">What is TBURN Chain <span className="arrow-icon">→</span></Link>
                            <Link href="/learn/trust-score" className="mega-link">Trust Score System <span className="arrow-icon">→</span></Link>
                            <Link href="/learn/whitepaper" className="mega-link">Whitepaper <span className="arrow-icon">→</span></Link>
                            <Link href="/learn/tokenomics" className="mega-link">Tokenomics <span className="arrow-icon">→</span></Link>
                            <Link href="/learn/roadmap" className="mega-link">Roadmap <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon pink">📈</div>
                            <div className="mega-section-title">DeFi Hub</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/app/dex" className="mega-link">DEX <span className="badge hot">Hot</span> <span className="arrow-icon">→</span></Link>
                            <Link href="/app/lending" className="mega-link">Lending <span className="arrow-icon">→</span></Link>
                            <Link href="/app/yield-farming" className="mega-link">Yield Farming <span className="arrow-icon">→</span></Link>
                            <Link href="/app/bridge" className="mega-link">Bridge <span className="arrow-icon">→</span></Link>
                            <Link href="/app/staking" className="mega-link">Staking <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                      </div>
                      <div className="mega-quick-access">
                        <div className="mega-quick-label"><span className="icon">⚡</span> Quick Access</div>
                        <div className="mega-quick-items">
                          <Link href="/scan" className="mega-quick-btn">🔍 TBurn Scan</Link>
                          <Link href="/network/validators" className="mega-quick-btn">📊 Validators</Link>
                          <Link href="/app/bridge" className="mega-quick-btn">🔗 Bridge</Link>
                          <Link href="/network/rpc" className="mega-quick-btn">📡 RPC Endpoint</Link>
                          <Link href="/app/governance" className="mega-quick-btn">🗳️ Governance</Link>
                        </div>
                      </div>
                      <div className="mega-featured">
                        <div className="mega-featured-text">
                          <div className="mega-featured-icon">🚀</div>
                          <div className="mega-featured-info">
                            <h4>155,324 TPS Achieved!</h4>
                            <p>World's fastest AI-powered blockchain is live</p>
                          </div>
                        </div>
                        <Link href="/scan/stats" className="mega-featured-btn">View Stats →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Build */}
              <div className="menu-nav-item">
                Build <span className="arrow">▾</span>
                <div className="mega-menu-wrapper">
                  <div className="mega-menu">
                    <div className="mega-menu-header">
                      <div className="mega-menu-title">
                        <span className="mega-menu-title-icon">🛠️</span>
                        Build on TBurn
                      </div>
                      <div className="mega-menu-badge">Developer Portal</div>
                    </div>
                    <div className="mega-menu-body">
                      <div className="mega-menu-grid">
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon gold">📖</div>
                            <div className="mega-section-title">Documentation</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/developers/quickstart" className="mega-link">Quick Start <span className="badge core">Core</span> <span className="arrow-icon">→</span></Link>
                            <Link href="/developers/docs" className="mega-link">Documentation <span className="arrow-icon">→</span></Link>
                            <Link href="/developers/api" className="mega-link">API Reference <span className="arrow-icon">→</span></Link>
                            <Link href="/developers/sdk" className="mega-link">SDK Guide <span className="arrow-icon">→</span></Link>
                            <Link href="/developers/contracts" className="mega-link">Smart Contracts <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon cyan">🛠️</div>
                            <div className="mega-section-title">Developer Tools</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/developers/cli" className="mega-link">CLI Reference <span className="arrow-icon">→</span></Link>
                            <Link href="/developers/websocket" className="mega-link">WebSocket API <span className="arrow-icon">→</span></Link>
                            <Link href="/developers/examples" className="mega-link">Code Examples <span className="arrow-icon">→</span></Link>
                            <Link href="/developers/evm-migration" className="mega-link">EVM Migration <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon purple">🧪</div>
                            <div className="mega-section-title">Testnet</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/testnet-scan/faucet" className="mega-link">Faucet <span className="badge new">New</span> <span className="arrow-icon">→</span></Link>
                            <Link href="/testnet-scan" className="mega-link">Testnet Scan <span className="arrow-icon">→</span></Link>
                            <Link href="/testnet-scan/blocks" className="mega-link">Testnet Blocks <span className="arrow-icon">→</span></Link>
                            <Link href="/network/testnet-rpc" className="mega-link">Testnet RPC <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon pink">💡</div>
                            <div className="mega-section-title">Solutions</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/solutions/token-extensions" className="mega-link">Token Extensions <span className="arrow-icon">→</span></Link>
                            <Link href="/solutions/wallets" className="mega-link">Wallets <span className="arrow-icon">→</span></Link>
                            <Link href="/solutions/game-tooling" className="mega-link">Game Tooling <span className="arrow-icon">→</span></Link>
                            <Link href="/solutions/ai-features" className="mega-link">AI Features <span className="badge hot">Hot</span> <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                      </div>
                      <div className="mega-quick-access">
                        <div className="mega-quick-label"><span className="icon">⚡</span> Quick Access</div>
                        <div className="mega-quick-items">
                          <Link href="/testnet-scan/faucet" className="mega-quick-btn">💧 Faucet</Link>
                          <Link href="/network/testnet-rpc" className="mega-quick-btn">📡 Testnet RPC</Link>
                          <Link href="/developers/api" className="mega-quick-btn">📄 API Docs</Link>
                          <Link href="/token-generator" className="mega-quick-btn">🪙 Token Generator</Link>
                        </div>
                      </div>
                      <div className="mega-featured">
                        <div className="mega-featured-text">
                          <div className="mega-featured-icon">🧠</div>
                          <div className="mega-featured-info">
                            <h4>AI Smart Contract Templates</h4>
                            <p>Deploy intelligent contracts in minutes</p>
                          </div>
                        </div>
                        <Link href="/developers/contracts" className="mega-featured-btn">Get Started →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community */}
              <div className="menu-nav-item">
                Community <span className="arrow">▾</span>
                <div className="mega-menu-wrapper">
                  <div className="mega-menu" style={{ width: "720px" }}>
                    <div className="mega-menu-header">
                      <div className="mega-menu-title">
                        <span className="mega-menu-title-icon">👥</span>
                        Join Our Community
                      </div>
                      <div className="mega-menu-badge">50K+ Members</div>
                    </div>
                    <div className="mega-menu-body">
                      <div className="mega-menu-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon gold">💬</div>
                            <div className="mega-section-title">Community Hub</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/community/news" className="mega-link">News & Blog <span className="arrow-icon">→</span></Link>
                            <Link href="/community/events" className="mega-link">Events <span className="arrow-icon">→</span></Link>
                            <Link href="/community/hub" className="mega-link">Community Hub <span className="arrow-icon">→</span></Link>
                            <Link href="/official-channels" className="mega-link">Official Channels <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon cyan">🎁</div>
                            <div className="mega-section-title">Token Programs</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/airdrop" className="mega-link">Airdrop Program <span className="badge hot">Hot</span> <span className="arrow-icon">→</span></Link>
                            <Link href="/referral" className="mega-link">Referral Program <span className="arrow-icon">→</span></Link>
                            <Link href="/community-program" className="mega-link">Community Program <span className="arrow-icon">→</span></Link>
                            <Link href="/events" className="mega-link">Event Center <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon purple">🏛️</div>
                            <div className="mega-section-title">Governance</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/dao-governance" className="mega-link">DAO Governance <span className="badge new">New</span> <span className="arrow-icon">→</span></Link>
                            <Link href="/validator-incentives" className="mega-link">Validator Incentives <span className="arrow-icon">→</span></Link>
                            <Link href="/ecosystem-fund" className="mega-link">Ecosystem Fund <span className="arrow-icon">→</span></Link>
                            <Link href="/bug-bounty" className="mega-link">Bug Bounty <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                      </div>
                      <div className="mega-featured">
                        <div className="mega-featured-text">
                          <div className="mega-featured-icon">🎯</div>
                          <div className="mega-featured-info">
                            <h4>Airdrop Program Now Live!</h4>
                            <p>Join and earn TBURN tokens</p>
                          </div>
                        </div>
                        <Link href="/airdrop" className="mega-featured-btn">Apply Now →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* More */}
              <div className="menu-nav-item">
                More <span className="arrow">▾</span>
                <div className="mega-menu-wrapper">
                  <div className="mega-menu" style={{ width: "720px" }}>
                    <div className="mega-menu-header">
                      <div className="mega-menu-title">
                        <span className="mega-menu-title-icon">🔗</span>
                        More Resources
                      </div>
                    </div>
                    <div className="mega-menu-body">
                      <div className="mega-menu-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon gold">🏢</div>
                            <div className="mega-section-title">Company</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/about" className="mega-link">About <span className="arrow-icon">→</span></Link>
                            <Link href="/founders" className="mega-link">Founders <span className="arrow-icon">→</span></Link>
                            <Link href="/careers" className="mega-link">Careers <span className="arrow-icon">→</span></Link>
                            <Link href="/press" className="mega-link">Press <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon cyan">🤝</div>
                            <div className="mega-section-title">Partnerships</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/partnership-program" className="mega-link">Partnership Program <span className="arrow-icon">→</span></Link>
                            <Link href="/strategic-partner" className="mega-link">Strategic Partners <span className="arrow-icon">→</span></Link>
                            <Link href="/advisor-program" className="mega-link">Advisor Program <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                        <div className="mega-section">
                          <div className="mega-section-header">
                            <div className="mega-section-icon purple">📄</div>
                            <div className="mega-section-title">Legal</div>
                          </div>
                          <div className="mega-links">
                            <Link href="/legal/terms-of-service" className="mega-link">Terms of Service <span className="arrow-icon">→</span></Link>
                            <Link href="/legal/privacy-policy" className="mega-link">Privacy Policy <span className="arrow-icon">→</span></Link>
                            <Link href="/legal/disclaimer" className="mega-link">Disclaimer <span className="arrow-icon">→</span></Link>
                            <Link href="/nft-marketplace" className="mega-link">NFT Marketplace <span className="arrow-icon">→</span></Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className="menu-header-right">
              <Link href="/tree" className="menu-icon-btn tree">
                <TreeDeciduous className="w-5 h-5" />
              </Link>
              <button className="menu-lang-btn">
                <Globe className="w-5 h-5" />
                <span className="menu-lang-code">KO</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <button className="menu-icon-btn">
                <Sun className="w-5 h-5" />
              </button>
              <button className="menu-login-btn">로그인</button>
            </div>
          </div>
        </header>

        {/* Main Content - Exact Copy from Home.tsx */}
        <main className="menu-content pt-4 pb-8">
          {/* Hero Section */}
          <section className="relative overflow-hidden mb-24 pt-8">
            <div className="absolute right-[5%] top-[10%] opacity-10 pointer-events-none hidden lg:block">
              <TBurnLogo className="w-64 h-64 xl:w-80 xl:h-80" showText={true} textColor="#000000" />
            </div>
            <div className="hidden dark:block">
              <div className="hero-orb hero-orb-purple w-[500px] h-[500px] top-0 left-[10%]" style={{ animationDelay: "0s" }}></div>
              <div className="hero-orb hero-orb-cyan w-[400px] h-[400px] bottom-0 right-[15%]" style={{ animationDelay: "2s" }}></div>
              <div className="hero-orb hero-orb-purple w-[300px] h-[300px] top-[50%] right-[5%]" style={{ animationDelay: "4s" }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-xs font-mono mb-8 backdrop-blur-sm animate-glow-pulse">
                <span className="relative w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75"></span>
                  <span className="relative rounded-full w-2 h-2 bg-cyan-400 block"></span>
                </span>
                {t('publicPages.home.heroTag')}
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
                <span className="text-white">{t('publicPages.home.heroTitle')} </span>
                <RotatingTitle keywords={keywords} />
                <span data-testid="text-hero-title" className="sr-only">{keywords[0]}</span>
                <br />
                <span className="text-white">{t('publicPages.home.heroSubtitle')}</span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
                {t('publicPages.home.heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/scan">
                  <button 
                    className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"
                    data-testid="button-launch-explorer"
                  >
                    TBURN Scan <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/learn/whitepaper">
                  <button 
                    className="bg-transparent glass-panel text-white border border-white/10 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-sm"
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
                className={`bg-transparent glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 ${
                  activeStatIndex === 0 
                    ? 'border-cyan-400/50 scale-105 shadow-lg shadow-cyan-400/20' 
                    : 'border-white/10 hover:border-cyan-400/30'
                }`} 
                data-testid="stat-tps"
              >
                <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                  activeStatIndex === 0 ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                }`}>
                  {stats.tps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.tps')}</div>
              </div>
              <div 
                className={`bg-transparent glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 ${
                  activeStatIndex === 1 
                    ? 'border-cyan-400/50 scale-105 shadow-lg shadow-cyan-400/20' 
                    : 'border-white/10 hover:border-cyan-400/30'
                }`} 
                data-testid="stat-blocks"
              >
                <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                  activeStatIndex === 1 ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                }`}>
                  {(stats.blockHeight / 1000000).toFixed(1) + "M"}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.blocks')}</div>
              </div>
              <div 
                className={`bg-transparent glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 ${
                  activeStatIndex === 2 
                    ? 'border-cyan-400/50 scale-105 shadow-lg shadow-cyan-400/20' 
                    : 'border-white/10 hover:border-cyan-400/30'
                }`} 
                data-testid="stat-daily-txs"
              >
                <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                  activeStatIndex === 2 ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                }`}>
                  {(stats.totalTransactions / 1000000).toFixed(1) + "M"}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.dailyTxs')}</div>
              </div>
              <div 
                className={`bg-transparent glass-panel p-6 rounded-2xl text-center group border transition-all duration-500 ${
                  activeStatIndex === 3 
                    ? 'border-cyan-400/50 scale-105 shadow-lg shadow-cyan-400/20' 
                    : 'border-white/10 hover:border-cyan-400/30'
                }`} 
                data-testid="stat-uptime"
              >
                <div className={`text-3xl lg:text-4xl font-bold mb-2 font-mono transition-colors duration-500 ${
                  activeStatIndex === 3 ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                }`}>
                  {stats.uptime}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{t('publicPages.home.stats.uptime')}</div>
              </div>
            </div>
          </section>

          {/* Solutions Section */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" data-testid="text-solutions-title">{t('publicPages.home.solutions.title')}</h2>
              <p className="text-gray-400">{t('publicPages.home.solutions.subtitle')}</p>
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
                      className="bg-transparent spotlight-card border border-white/10 rounded-2xl p-8 group cursor-pointer h-full hover:border-white/20 transition-all"
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
            <div className="bg-transparent glass-panel border border-white/10 rounded-2xl p-12 text-center relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-600/10 pointer-events-none"></div>
              <h2 className="text-3xl font-bold text-white mb-6" data-testid="text-cta-title">{t('publicPages.home.cta.title')}</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link href="/learn">
                  <button 
                    className="bg-cyan-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-cyan-300 transition glow-cyan"
                    data-testid="button-explore-ecosystem"
                  >
                    {t('publicPages.home.cta.exploreEcosystem')}
                  </button>
                </Link>
                <Link href="/community/hub">
                  <button 
                    className="text-white border border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition"
                    data-testid="button-join-community"
                  >
                    {t('publicPages.home.cta.joinCommunity')}
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer - Use the same PublicFooter */}
        <PublicFooter />
      </div>
    </>
  );
}
