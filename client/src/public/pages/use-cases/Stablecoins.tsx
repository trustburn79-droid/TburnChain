import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Banknote,
  Shield,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Building2,
  ArrowRight,
  Coins,
  CheckCircle,
  RefreshCw
} from "lucide-react";

export default function Stablecoins() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const stablecoinTypes = [
    {
      icon: Banknote,
      iconColor: "#00ff9d",
      title: t('publicPages.useCases.stablecoins.types.fiatBacked.title'),
      desc: t('publicPages.useCases.stablecoins.types.fiatBacked.desc')
    },
    {
      icon: Coins,
      iconColor: "#ffd700",
      title: t('publicPages.useCases.stablecoins.types.cryptoCollateralized.title'),
      desc: t('publicPages.useCases.stablecoins.types.cryptoCollateralized.desc')
    },
    {
      icon: Building2,
      iconColor: "#7000ff",
      title: t('publicPages.useCases.stablecoins.types.institutionalGrade.title'),
      desc: t('publicPages.useCases.stablecoins.types.institutionalGrade.desc')
    },
    {
      icon: Globe,
      iconColor: "#00f0ff",
      title: t('publicPages.useCases.stablecoins.types.multiCurrency.title'),
      desc: t('publicPages.useCases.stablecoins.types.multiCurrency.desc')
    }
  ];

  const metrics = [
    {
      value: "$2.8B",
      label: t('publicPages.useCases.stablecoins.metrics.totalSupply'),
      iconColor: "#00ff9d"
    },
    {
      value: "15M+",
      label: t('publicPages.useCases.stablecoins.metrics.dailyTransactions'),
      iconColor: "#7000ff"
    },
    {
      value: "0.001%",
      label: t('publicPages.useCases.stablecoins.metrics.pegDeviation'),
      iconColor: "#00f0ff"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: t('publicPages.useCases.stablecoins.features.proofOfReserves.title'),
      desc: t('publicPages.useCases.stablecoins.features.proofOfReserves.desc')
    },
    {
      icon: Zap,
      title: t('publicPages.useCases.stablecoins.features.instantSettlement.title'),
      desc: t('publicPages.useCases.stablecoins.features.instantSettlement.desc')
    },
    {
      icon: Lock,
      title: t('publicPages.useCases.stablecoins.features.programmableCompliance.title'),
      desc: t('publicPages.useCases.stablecoins.features.programmableCompliance.desc')
    },
    {
      icon: RefreshCw,
      title: t('publicPages.useCases.stablecoins.features.crossChainBridges.title'),
      desc: t('publicPages.useCases.stablecoins.features.crossChainBridges.desc')
    }
  ];

  const useCases = [
    { title: t('publicPages.useCases.stablecoins.useCases.payments.title'), desc: t('publicPages.useCases.stablecoins.useCases.payments.desc') },
    { title: t('publicPages.useCases.stablecoins.useCases.defiCollateral.title'), desc: t('publicPages.useCases.stablecoins.useCases.defiCollateral.desc') },
    { title: t('publicPages.useCases.stablecoins.useCases.treasury.title'), desc: t('publicPages.useCases.stablecoins.useCases.treasury.desc') },
    { title: t('publicPages.useCases.stablecoins.useCases.payroll.title'), desc: t('publicPages.useCases.stablecoins.useCases.payroll.desc') }
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
        <div className="absolute top-0 left-1/3 w-[600px] h-[500px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00ff9d] mb-6">
            <Banknote className="w-4 h-4" /> {t('publicPages.useCases.stablecoins.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.useCases.stablecoins.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.useCases.stablecoins.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00ff9d] text-black font-bold hover:bg-green-400 transition"
                style={{ boxShadow: "0 0 20px rgba(0,255,157,0.3)" }}
                data-testid="button-issue"
              >
                {t('publicPages.useCases.stablecoins.buttons.issueStablecoin')}
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                {t('publicPages.useCases.stablecoins.buttons.technicalDocs')}
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
            <h2 className="text-3xl font-bold text-white mb-2">{t('publicPages.useCases.stablecoins.sections.types')}</h2>
            <p className="text-gray-400">{t('publicPages.useCases.stablecoins.sections.typesDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {stablecoinTypes.map((type, idx) => {
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
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">{t('publicPages.useCases.stablecoins.sections.platformFeatures')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#00ff9d] mx-auto mb-4" />
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
          <h2 className="text-3xl font-bold text-white mb-12 text-center">{t('publicPages.useCases.stablecoins.sections.useCases')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 border border-white/10 flex items-start gap-4"
                data-testid={`card-usecase-${idx}`}
              >
                <CheckCircle className="w-6 h-6 text-[#00ff9d] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{useCase.title}</h3>
                  <p className="text-sm text-gray-400">{useCase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#00ff9d]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,240,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-white mb-4">{t('publicPages.useCases.stablecoins.cta.title')}</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.useCases.stablecoins.cta.desc')}
            </p>
            <Link href="/app">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#00ff9d] text-black font-bold hover:bg-green-400 transition"
                style={{ boxShadow: "0 0 20px rgba(0,255,157,0.3)" }}
                data-testid="button-get-started"
              >
                {t('publicPages.useCases.stablecoins.cta.getStarted')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
