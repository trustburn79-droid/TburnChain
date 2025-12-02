import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Gamepad2,
  Zap,
  Shield,
  CheckCheck,
  Trophy,
  Users,
  Code,
  TrendingUp,
  Store,
  Glasses
} from "lucide-react";

const whyBuildFeatures = [
  {
    icon: Zap,
    iconColor: "#00f0ff",
    title: "Ultra-Fast Processing",
    desc: (
      <>
        <span className="text-[#00f0ff] font-mono">50,000+ TPS</span> throughput enables real-time in-game item trading. With an average <span className="text-white">1-second block time</span>, players experience instant confirmation without lag.
      </>
    )
  },
  {
    icon: Shield,
    iconColor: "#ff0055",
    title: "NFT Project Verification",
    desc: (
      <>
        Our 3-stage verification system (AI → Experts → Community) proactively blocks fraudulent NFT projects. Trading is automatically suspended if the Trust Score drops below <span className="text-[#ff0055]">40%</span>.
      </>
    )
  },
  {
    icon: CheckCheck,
    iconColor: "#00ff9d",
    title: "Verified Ownership",
    desc: "All game item issuance and burn records are immutable on-chain. Provide players with real-time proof of ownership and item history, eliminating forgery risks."
  },
  {
    icon: Trophy,
    iconColor: "#ffd700",
    title: "Cross-Game Assets",
    desc: "Full EVM compatibility allows items to be interoperable across different games. Support for multi-chain asset transfers via LayerZero integration expands your game's economy."
  }
];

const trustScoreCategories = [
  {
    icon: Users,
    iconColor: "#7000ff",
    title: "Team Identity & Experience",
    points: "30 pts",
    desc: "Real name disclosure, track record verification, and social media authenticity checks.",
    scoring: [
      { label: "Verified Profile", value: "+30 pts", positive: true },
      { label: "Anonymous", value: "Max 10 pts", positive: false }
    ]
  },
  {
    icon: Code,
    iconColor: "#00f0ff",
    title: "Smart Contract Security",
    points: "25 pts",
    desc: "Audit completion status, automated vulnerability testing results, and minting authority decentralization.",
    scoring: [
      { label: "2+ Audits", value: "+25 pts", positive: true },
      { label: "No Audit", value: "0 pts", positive: false }
    ]
  },
  {
    icon: TrendingUp,
    iconColor: "#00ff9d",
    title: "Utility & Roadmap",
    points: "25 pts",
    desc: "Roadmap execution rate, actual utility provision (game integration), and community engagement levels.",
    scoring: [
      { label: "80%+ Executed", value: "+25 pts", positive: true },
      { label: "Game Live", value: "Bonus", positive: true }
    ]
  }
];

const gameTypes = [
  {
    icon: Gamepad2,
    iconColor: "#7000ff",
    title: "P2E Games",
    desc: "Trust verification blocks Ponzi schemes. Stable tokenomics for sustainable play-to-earn.",
    tags: "RPG • Strategy • Battle"
  },
  {
    icon: Store,
    iconColor: "#00f0ff",
    title: "NFT Marketplace",
    desc: "Trade game items, artwork, and collections. Trust badges are automatically displayed for safety.",
    tags: "Risk Warning • History"
  },
  {
    icon: Glasses,
    iconColor: "#ffd700",
    title: "Metaverse",
    desc: "Virtual real estate, avatars, and wearables. Decentralized ownership with DAO governance.",
    tags: "Land • Avatars • Social"
  }
];

const integrationSteps = [
  {
    step: 1,
    title: "Deploy Contracts",
    desc: "Write ERC-721/1155 contracts in Solidity ^0.8.19 and deploy to TBurn Chain.",
    highlight: false
  },
  {
    step: 2,
    title: "Apply for Trust Verification",
    desc: "Submit project info via developer console. ($2,000-$3,000 fee, 7-14 days)",
    highlight: false
  },
  {
    step: 3,
    title: "Integrate SDK",
    desc: "Use Unity/Unreal SDK to implement minting, trading, and burning features in-game.",
    highlight: false
  },
  {
    step: 4,
    title: "Display Trust Badge",
    desc: "Show real-time trust scores in your game UI to build player confidence.",
    highlight: true
  }
];

export default function GameTooling() {
  const { t } = useTranslation();
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
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Gamepad2 className="w-4 h-4" /> {t('publicPages.solutions.gameTooling.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.gameTooling.title')}{" "}
            <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.gameTooling.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
            {t('publicPages.solutions.gameTooling.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-sdk"
              >
                Get Unity SDK
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                View Docs
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Build on TBurn Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Why Build on TBurn?</h2>
            <p className="text-gray-400">Optimized for high-speed gaming and secure asset trading.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {whyBuildFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-white/10"
                  data-testid={`card-feature-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${feature.iconColor}10`,
                      border: `1px solid ${feature.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: feature.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NFT Project Trust Score Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">NFT Project Trust Score</h2>
          
          <div className="space-y-6">
            {trustScoreCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center"
                  data-testid={`card-trust-${idx}`}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${category.iconColor}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: category.iconColor }} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {category.title}{" "}
                      <span 
                        className="text-sm font-mono ml-2"
                        style={{ color: category.iconColor }}
                      >
                        ({category.points})
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm">{category.desc}</p>
                  </div>
                  <div className="w-full md:w-auto bg-black/40 p-4 rounded border border-white/10 text-xs text-gray-300 font-mono">
                    {category.scoring.map((score, i) => (
                      <div key={i} className={`flex justify-between gap-4 ${i < category.scoring.length - 1 ? "mb-1" : ""}`}>
                        <span>{score.label}</span>
                        <span className={score.positive ? "text-[#00ff9d]" : "text-gray-500"}>
                          {score.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Game Types Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Supported Game Types</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {gameTypes.map((game, idx) => {
              const Icon = game.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center border border-white/10 group"
                  data-testid={`card-game-${idx}`}
                >
                  <Icon 
                    className="w-10 h-10 mx-auto mb-6 group-hover:scale-110 transition-transform" 
                    style={{ color: game.iconColor }}
                  />
                  <h3 className="text-xl font-bold text-white mb-3">{game.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{game.desc}</p>
                  <div 
                    className="text-xs font-mono px-2 py-1 rounded inline-block"
                    style={{ 
                      color: game.iconColor,
                      backgroundColor: `${game.iconColor}10`
                    }}
                  >
                    {game.tags}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Guide Section */}
      <section 
        className="py-20 px-6"
        style={{ background: "linear-gradient(to right, rgba(112,0,255,0.1), rgba(0,240,255,0.1))" }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Integration Guide</h2>
          <div className="space-y-6">
            {integrationSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`spotlight-card p-6 rounded-xl flex gap-6 items-center ${
                  step.highlight 
                    ? "border border-[#00f0ff]/30 bg-[#00f0ff]/5" 
                    : "border border-white/10"
                }`}
                data-testid={`card-step-${step.step}`}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${
                    step.highlight 
                      ? "bg-[#00f0ff] text-black" 
                      : "bg-white/10 text-white"
                  }`}
                >
                  {step.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
