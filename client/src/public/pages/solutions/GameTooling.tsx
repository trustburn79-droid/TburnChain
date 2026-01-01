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

export default function GameTooling() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const whyBuildFeatures = [
    {
      icon: Zap,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.gameTooling.features.ultraFast.title'),
      desc: t('publicPages.solutions.gameTooling.features.ultraFast.desc')
    },
    {
      icon: Shield,
      iconColor: "#ff0055",
      title: t('publicPages.solutions.gameTooling.features.verification.title'),
      desc: t('publicPages.solutions.gameTooling.features.verification.desc')
    },
    {
      icon: CheckCheck,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.gameTooling.features.ownership.title'),
      desc: t('publicPages.solutions.gameTooling.features.ownership.desc')
    },
    {
      icon: Trophy,
      iconColor: "#ffd700",
      title: t('publicPages.solutions.gameTooling.features.crossGame.title'),
      desc: t('publicPages.solutions.gameTooling.features.crossGame.desc')
    }
  ];

  const trustScoreCategories = [
    {
      icon: Users,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.gameTooling.trustScore.team.title'),
      points: t('publicPages.solutions.gameTooling.trustScore.team.points'),
      desc: t('publicPages.solutions.gameTooling.trustScore.team.desc'),
      scoring: [
        { label: t('publicPages.solutions.gameTooling.trustScore.team.scoring.verified'), value: "+30 pts", positive: true },
        { label: t('publicPages.solutions.gameTooling.trustScore.team.scoring.anonymous'), value: t('publicPages.solutions.gameTooling.trustScore.team.scoring.maxPoints'), positive: false }
      ]
    },
    {
      icon: Code,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.gameTooling.trustScore.contract.title'),
      points: t('publicPages.solutions.gameTooling.trustScore.contract.points'),
      desc: t('publicPages.solutions.gameTooling.trustScore.contract.desc'),
      scoring: [
        { label: t('publicPages.solutions.gameTooling.trustScore.contract.scoring.audits'), value: "+25 pts", positive: true },
        { label: t('publicPages.solutions.gameTooling.trustScore.contract.scoring.noAudit'), value: "0 pts", positive: false }
      ]
    },
    {
      icon: TrendingUp,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.gameTooling.trustScore.utility.title'),
      points: t('publicPages.solutions.gameTooling.trustScore.utility.points'),
      desc: t('publicPages.solutions.gameTooling.trustScore.utility.desc'),
      scoring: [
        { label: t('publicPages.solutions.gameTooling.trustScore.utility.scoring.executed'), value: "+25 pts", positive: true },
        { label: t('publicPages.solutions.gameTooling.trustScore.utility.scoring.gameLive'), value: t('publicPages.solutions.gameTooling.trustScore.utility.scoring.bonus'), positive: true }
      ]
    }
  ];

  const gameTypes = [
    {
      icon: Gamepad2,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.gameTooling.gameTypes.p2e.title'),
      desc: t('publicPages.solutions.gameTooling.gameTypes.p2e.desc'),
      tags: t('publicPages.solutions.gameTooling.gameTypes.p2e.tags')
    },
    {
      icon: Store,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.gameTooling.gameTypes.marketplace.title'),
      desc: t('publicPages.solutions.gameTooling.gameTypes.marketplace.desc'),
      tags: t('publicPages.solutions.gameTooling.gameTypes.marketplace.tags')
    },
    {
      icon: Glasses,
      iconColor: "#ffd700",
      title: t('publicPages.solutions.gameTooling.gameTypes.metaverse.title'),
      desc: t('publicPages.solutions.gameTooling.gameTypes.metaverse.desc'),
      tags: t('publicPages.solutions.gameTooling.gameTypes.metaverse.tags')
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: t('publicPages.solutions.gameTooling.integration.step1.title'),
      desc: t('publicPages.solutions.gameTooling.integration.step1.desc'),
      highlight: false
    },
    {
      step: 2,
      title: t('publicPages.solutions.gameTooling.integration.step2.title'),
      desc: t('publicPages.solutions.gameTooling.integration.step2.desc'),
      highlight: false
    },
    {
      step: 3,
      title: t('publicPages.solutions.gameTooling.integration.step3.title'),
      desc: t('publicPages.solutions.gameTooling.integration.step3.desc'),
      highlight: false
    },
    {
      step: 4,
      title: t('publicPages.solutions.gameTooling.integration.step4.title'),
      desc: t('publicPages.solutions.gameTooling.integration.step4.desc'),
      highlight: true
    }
  ];

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
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative pt-4 pb-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Gamepad2 className="w-4 h-4" /> {t('publicPages.solutions.gameTooling.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.gameTooling.title')}{" "}
            <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.gameTooling.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
            {t('publicPages.solutions.gameTooling.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-gray-900 dark:text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-sdk"
              >
                {t('publicPages.solutions.gameTooling.buttons.getUnitySdk')}
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition"
                data-testid="button-docs"
              >
                {t('publicPages.solutions.gameTooling.buttons.viewDocs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Build on TBurn Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.solutions.gameTooling.sections.whyBuild.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.solutions.gameTooling.sections.whyBuild.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {whyBuildFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10"
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NFT Project Trust Score Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.gameTooling.sections.trustScore.title')}</h2>
          
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {category.title}{" "}
                      <span 
                        className="text-sm font-mono ml-2"
                        style={{ color: category.iconColor }}
                      >
                        ({category.points})
                      </span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{category.desc}</p>
                  </div>
                  <div className="w-full md:w-auto bg-black/40 p-4 rounded border border-gray-300 dark:border-white/10 text-xs text-gray-300 font-mono">
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.gameTooling.sections.gameTypes.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {gameTypes.map((game, idx) => {
              const Icon = game.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center border border-gray-300 dark:border-white/10 group"
                  data-testid={`card-game-${idx}`}
                >
                  <Icon 
                    className="w-10 h-10 mx-auto mb-6 group-hover:scale-110 transition-transform" 
                    style={{ color: game.iconColor }}
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{game.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{game.desc}</p>
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.gameTooling.sections.integration.title')}</h2>
          <div className="space-y-6">
            {integrationSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`spotlight-card p-6 rounded-xl flex gap-6 items-center ${
                  step.highlight 
                    ? "border border-[#00f0ff]/30 bg-[#00f0ff]/5" 
                    : "border border-gray-300 dark:border-white/10"
                }`}
                data-testid={`card-step-${step.step}`}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${
                    step.highlight 
                      ? "bg-[#00f0ff] text-black" 
                      : "bg-white/10 text-gray-900 dark:text-white"
                  }`}
                >
                  {step.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
