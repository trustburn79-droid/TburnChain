import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Coins,
  Building2,
  Gem,
  FileText,
  Shield,
  TrendingUp,
  Lock,
  Users,
  Globe,
  Banknote,
  ArrowRight
} from "lucide-react";

export default function Tokenization() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const tokenizationTypes = [
    {
      icon: Building2,
      iconColor: "#7000ff",
      title: t('publicPages.useCases.tokenization.types.realEstate.title'),
      desc: t('publicPages.useCases.tokenization.types.realEstate.desc')
    },
    {
      icon: Gem,
      iconColor: "#00f0ff",
      title: t('publicPages.useCases.tokenization.types.luxuryAsset.title'),
      desc: t('publicPages.useCases.tokenization.types.luxuryAsset.desc')
    },
    {
      icon: FileText,
      iconColor: "#00ff9d",
      title: t('publicPages.useCases.tokenization.types.securities.title'),
      desc: t('publicPages.useCases.tokenization.types.securities.desc')
    },
    {
      icon: TrendingUp,
      iconColor: "#ffd700",
      title: t('publicPages.useCases.tokenization.types.commodity.title'),
      desc: t('publicPages.useCases.tokenization.types.commodity.desc')
    }
  ];

  const metrics = [
    {
      icon: Users,
      iconColor: "#7000ff",
      value: "250M+",
      label: t('publicPages.useCases.tokenization.metrics.newInvestors')
    },
    {
      icon: TrendingUp,
      iconColor: "#00f0ff",
      value: "$80T",
      label: t('publicPages.useCases.tokenization.metrics.unlockedAssetValue')
    },
    {
      icon: Lock,
      iconColor: "#00ff9d",
      value: "99.99%",
      label: t('publicPages.useCases.tokenization.metrics.settlementReliability')
    }
  ];

  const features = [
    {
      icon: Globe,
      title: t('publicPages.useCases.tokenization.features.globalMarket.title'),
      desc: t('publicPages.useCases.tokenization.features.globalMarket.desc')
    },
    {
      icon: Banknote,
      title: t('publicPages.useCases.tokenization.features.fractionalOwnership.title'),
      desc: t('publicPages.useCases.tokenization.features.fractionalOwnership.desc')
    },
    {
      icon: Shield,
      title: t('publicPages.useCases.tokenization.features.regulatoryCompliant.title'),
      desc: t('publicPages.useCases.tokenization.features.regulatoryCompliant.desc')
    },
    {
      icon: Lock,
      title: t('publicPages.useCases.tokenization.features.enterpriseSecurity.title'),
      desc: t('publicPages.useCases.tokenization.features.enterpriseSecurity.desc')
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
    <div ref={containerRef} className="min-h-screen">
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Coins className="w-4 h-4" /> {t('publicPages.useCases.tokenization.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.useCases.tokenization.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.useCases.tokenization.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-tokenize"
              >
                {t('publicPages.useCases.tokenization.buttons.startTokenizing')}
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                {t('publicPages.useCases.tokenization.buttons.viewDocumentation')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">{t('publicPages.useCases.tokenization.sections.types')}</h2>
            <p className="text-gray-400">{t('publicPages.useCases.tokenization.sections.typesDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {tokenizationTypes.map((type, idx) => {
              const Icon = type.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-white/10"
                  data-testid={`card-type-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${type.iconColor}10`,
                      border: `1px solid ${type.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: type.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{type.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {metrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center group"
                  data-testid={`card-metric-${idx}`}
                >
                  <Icon 
                    className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform" 
                    style={{ color: metric.iconColor }}
                  />
                  <div className="text-4xl font-bold text-white mb-2 font-mono">{metric.value}</div>
                  <p className="text-sm text-gray-400">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">{t('publicPages.useCases.tokenization.sections.platformFeatures')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#00f0ff] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#7000ff]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(112,0,255,0.1) 0%, rgba(0,240,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-white mb-4">{t('publicPages.useCases.tokenization.cta.title')}</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.useCases.tokenization.cta.desc')}
            </p>
            <Link href="/app">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-get-started"
              >
                {t('publicPages.useCases.tokenization.cta.getStarted')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
