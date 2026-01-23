import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  CreditCard,
  Zap,
  Percent,
  Shield,
  Globe,
  TrendingUp,
  Code,
  ShoppingCart,
  Store
} from "lucide-react";

export default function Payments() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const whyChooseFeatures = [
    {
      icon: Zap,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.payments.whyChoose.instantSettlement.title'),
      desc: t('publicPages.solutions.payments.whyChoose.instantSettlement.description')
    },
    {
      icon: Percent,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.payments.whyChoose.ultraLowFees.title'),
      desc: t('publicPages.solutions.payments.whyChoose.ultraLowFees.description')
    },
    {
      icon: Shield,
      iconColor: "#ff0055",
      title: t('publicPages.solutions.payments.whyChoose.verifiedTokensOnly.title'),
      desc: t('publicPages.solutions.payments.whyChoose.verifiedTokensOnly.description')
    },
    {
      icon: Globe,
      iconColor: "#ffd700",
      title: t('publicPages.solutions.payments.whyChoose.globalReach.title'),
      desc: t('publicPages.solutions.payments.whyChoose.globalReach.description')
    }
  ];

  const tokenStandards = [
    {
      icon: TrendingUp,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.payments.tokenStandards.priceStability.title'),
      points: t('publicPages.solutions.payments.tokenStandards.priceStability.points'),
      desc: t('publicPages.solutions.payments.tokenStandards.priceStability.description'),
      scoring: [
        { label: t('publicPages.solutions.payments.tokenStandards.priceStability.scoring.volatility'), value: "+30 pts", positive: true },
        { label: t('publicPages.solutions.payments.tokenStandards.priceStability.scoring.liquidity'), value: "+10 pts", positive: true }
      ]
    },
    {
      icon: Code,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.payments.tokenStandards.contractSecurity.title'),
      points: t('publicPages.solutions.payments.tokenStandards.contractSecurity.points'),
      desc: t('publicPages.solutions.payments.tokenStandards.contractSecurity.description'),
      scoring: [
        { label: t('publicPages.solutions.payments.tokenStandards.contractSecurity.scoring.audits'), value: "+25 pts", positive: true },
        { label: t('publicPages.solutions.payments.tokenStandards.contractSecurity.scoring.criticalBug'), value: t('publicPages.solutions.payments.tokenStandards.contractSecurity.scoring.block'), positive: false }
      ]
    },
    {
      icon: CreditCard,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.payments.tokenStandards.adoptionUsage.title'),
      points: t('publicPages.solutions.payments.tokenStandards.adoptionUsage.points'),
      desc: t('publicPages.solutions.payments.tokenStandards.adoptionUsage.description'),
      scoring: [
        { label: t('publicPages.solutions.payments.tokenStandards.adoptionUsage.scoring.merchants'), value: t('publicPages.solutions.payments.tokenStandards.adoptionUsage.scoring.high'), positive: true },
        { label: t('publicPages.solutions.payments.tokenStandards.adoptionUsage.scoring.transactions'), value: t('publicPages.solutions.payments.tokenStandards.adoptionUsage.scoring.high'), positive: true }
      ]
    }
  ];

  const solutionTypes = [
    {
      icon: ShoppingCart,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.payments.solutionTypes.onlineCommerce.title'),
      desc: t('publicPages.solutions.payments.solutionTypes.onlineCommerce.description'),
      tags: t('publicPages.solutions.payments.solutionTypes.onlineCommerce.tags')
    },
    {
      icon: Store,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.payments.solutionTypes.offlinePos.title'),
      desc: t('publicPages.solutions.payments.solutionTypes.offlinePos.description'),
      tags: t('publicPages.solutions.payments.solutionTypes.offlinePos.tags')
    },
    {
      icon: Globe,
      iconColor: "#ffd700",
      title: t('publicPages.solutions.payments.solutionTypes.globalRemittance.title'),
      desc: t('publicPages.solutions.payments.solutionTypes.globalRemittance.description'),
      tags: t('publicPages.solutions.payments.solutionTypes.globalRemittance.tags')
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: t('publicPages.solutions.payments.integrationGuide.step1.title'),
      desc: t('publicPages.solutions.payments.integrationGuide.step1.description'),
      code: "curl -X POST https://mainnet.tburn.io/api/v8/auth/apikey"
    },
    {
      step: 2,
      title: t('publicPages.solutions.payments.integrationGuide.step2.title'),
      desc: t('publicPages.solutions.payments.integrationGuide.step2.description'),
      code: "npm install @tburn/payments-sdk"
    },
    {
      step: 3,
      title: t('publicPages.solutions.payments.integrationGuide.step3.title'),
      desc: t('publicPages.solutions.payments.integrationGuide.step3.description'),
      code: '<burn-pay amount="100" currency="USD" />'
    },
    {
      step: 4,
      title: t('publicPages.solutions.payments.integrationGuide.step4.title'),
      desc: t('publicPages.solutions.payments.integrationGuide.step4.description'),
      code: null
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <CreditCard className="w-4 h-4" /> {t('publicPages.solutions.payments.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.payments.title')}{" "}
            <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.payments.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.solutions.payments.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-gray-900 dark:text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-api-key"
              >
                {t('publicPages.solutions.payments.getApiKey')}
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition"
                data-testid="button-docs"
              >
                {t('publicPages.solutions.payments.buttons.viewDocs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose TBurn Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.solutions.payments.whyChoose.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.solutions.payments.whyChoose.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {whyChooseFeatures.map((feature, idx) => {
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

      {/* Payment Token Standards Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.payments.tokenStandards.title')}</h2>
          
          <div className="space-y-6">
            {tokenStandards.map((standard, idx) => {
              const Icon = standard.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center"
                  data-testid={`card-standard-${idx}`}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${standard.iconColor}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: standard.iconColor }} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {standard.title}{" "}
                      <span 
                        className="text-sm font-mono ml-2"
                        style={{ color: standard.iconColor }}
                      >
                        ({standard.points})
                      </span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{standard.desc}</p>
                  </div>
                  <div className="w-full md:w-auto bg-black/40 p-4 rounded border border-gray-300 dark:border-white/10 text-xs text-gray-300 font-mono">
                    {standard.scoring.map((score, i) => (
                      <div key={i} className={`flex justify-between gap-4 ${i < standard.scoring.length - 1 ? "mb-1" : ""}`}>
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

      {/* Solution Types Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.payments.solutionTypes.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {solutionTypes.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center border border-gray-300 dark:border-white/10 group"
                  data-testid={`card-solution-${idx}`}
                >
                  <Icon 
                    className="w-10 h-10 mx-auto mb-6 group-hover:scale-110 transition-transform" 
                    style={{ color: solution.iconColor }}
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{solution.desc}</p>
                  <div 
                    className="text-xs font-mono px-2 py-1 rounded inline-block"
                    style={{ 
                      color: solution.iconColor,
                      backgroundColor: `${solution.iconColor}10`
                    }}
                  >
                    {solution.tags}
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.payments.integrationGuide.title')}</h2>
          <div className="space-y-6">
            {integrationSteps.map((step, idx) => (
              <div 
                key={idx}
                className="spotlight-card p-6 rounded-xl border border-gray-300 dark:border-white/10"
                data-testid={`card-step-${step.step}`}
              >
                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-gray-900 dark:text-white shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{step.desc}</p>
                    {step.code && (
                      <div 
                        className="p-4 rounded-lg font-mono text-sm text-gray-600 dark:text-gray-400 overflow-x-auto"
                        style={{ 
                          backgroundColor: "#0d0d12",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}
                      >
                        {step.code}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
