import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
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

export default function Gaming() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      icon: Gamepad2,
      iconColor: "#ff0055",
      title: t('publicPages.useCases.gaming.categories.web3Gaming.title'),
      desc: t('publicPages.useCases.gaming.categories.web3Gaming.desc')
    },
    {
      icon: Palette,
      iconColor: "#7000ff",
      title: t('publicPages.useCases.gaming.categories.nftCollectibles.title'),
      desc: t('publicPages.useCases.gaming.categories.nftCollectibles.desc')
    },
    {
      icon: Music,
      iconColor: "#00f0ff",
      title: t('publicPages.useCases.gaming.categories.musicStreaming.title'),
      desc: t('publicPages.useCases.gaming.categories.musicStreaming.desc')
    },
    {
      icon: Film,
      iconColor: "#ffd700",
      title: t('publicPages.useCases.gaming.categories.metaverse.title'),
      desc: t('publicPages.useCases.gaming.categories.metaverse.desc')
    }
  ];

  const metrics = [
    {
      value: "150K+",
      label: t('publicPages.useCases.gaming.metrics.dailyActivePlayers'),
      iconColor: "#ff0055"
    },
    {
      value: "$120M",
      label: t('publicPages.useCases.gaming.metrics.nftVolume'),
      iconColor: "#7000ff"
    },
    {
      value: "450+",
      label: t('publicPages.useCases.gaming.metrics.gamesApps'),
      iconColor: "#00f0ff"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: t('publicPages.useCases.gaming.features.gasFree.title'),
      desc: t('publicPages.useCases.gaming.features.gasFree.desc')
    },
    {
      icon: Shield,
      title: t('publicPages.useCases.gaming.features.antiCheat.title'),
      desc: t('publicPages.useCases.gaming.features.antiCheat.desc')
    },
    {
      icon: Users,
      title: t('publicPages.useCases.gaming.features.guilds.title'),
      desc: t('publicPages.useCases.gaming.features.guilds.desc')
    },
    {
      icon: Gift,
      title: t('publicPages.useCases.gaming.features.playEarn.title'),
      desc: t('publicPages.useCases.gaming.features.playEarn.desc')
    }
  ];

  const gameTypes = [
    { title: t('publicPages.useCases.gaming.gameTypes.mmorpgs.title'), desc: t('publicPages.useCases.gaming.gameTypes.mmorpgs.desc') },
    { title: t('publicPages.useCases.gaming.gameTypes.battleRoyale.title'), desc: t('publicPages.useCases.gaming.gameTypes.battleRoyale.desc') },
    { title: t('publicPages.useCases.gaming.gameTypes.cardStrategy.title'), desc: t('publicPages.useCases.gaming.gameTypes.cardStrategy.desc') },
    { title: t('publicPages.useCases.gaming.gameTypes.racingSports.title'), desc: t('publicPages.useCases.gaming.gameTypes.racingSports.desc') },
    { title: t('publicPages.useCases.gaming.gameTypes.casualSocial.title'), desc: t('publicPages.useCases.gaming.gameTypes.casualSocial.desc') },
    { title: t('publicPages.useCases.gaming.gameTypes.esports.title'), desc: t('publicPages.useCases.gaming.gameTypes.esports.desc') }
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#ff0055]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#7000ff]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#ff0055] mb-6">
            <Sparkles className="w-4 h-4" /> {t('publicPages.useCases.gaming.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.useCases.gaming.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.useCases.gaming.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#ff0055] text-white font-bold hover:bg-pink-600 transition"
                style={{ boxShadow: "0 0 20px rgba(255,0,85,0.3)" }}
                data-testid="button-build"
              >
                {t('publicPages.useCases.gaming.buttons.startBuilding')}
              </button>
            </Link>
            <Link href="/solutions/game-tooling">
              <button 
                className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                data-testid="button-tools"
              >
                {t('publicPages.useCases.gaming.buttons.gameTooling')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/5">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.useCases.gaming.sections.categories')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.useCases.gaming.sections.categoriesDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10"
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{category.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{category.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.useCases.gaming.sections.platformFeatures')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#ff0055] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.useCases.gaming.sections.gameGenres')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {gameTypes.map((game, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10"
                data-testid={`card-game-${idx}`}
              >
                <Trophy className="w-6 h-6 text-[#ffd700] mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{game.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{game.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#ff0055]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(255,0,85,0.1) 0%, rgba(112,0,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.useCases.gaming.cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.useCases.gaming.cta.desc')}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/developers/quickstart">
                <button 
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#ff0055] text-white font-bold hover:bg-pink-600 transition"
                  style={{ boxShadow: "0 0 20px rgba(255,0,85,0.3)" }}
                  data-testid="button-quickstart"
                >
                  {t('publicPages.useCases.gaming.cta.quickStart')} <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/app">
                <button 
                  className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  data-testid="button-login"
                >
                  {t('publicPages.useCases.gaming.cta.memberPortal')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
