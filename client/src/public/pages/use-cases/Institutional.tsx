import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Building2,
  Shield,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Users,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle,
  Landmark
} from "lucide-react";

export default function Institutional() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const paymentFeatures = [
    {
      icon: Zap,
      iconColor: "#ffd700",
      title: t('publicPages.useCases.institutional.paymentFeatures.rtgs.title'),
      desc: t('publicPages.useCases.institutional.paymentFeatures.rtgs.desc')
    },
    {
      icon: Globe,
      iconColor: "#00f0ff",
      title: t('publicPages.useCases.institutional.paymentFeatures.crossBorder.title'),
      desc: t('publicPages.useCases.institutional.paymentFeatures.crossBorder.desc')
    },
    {
      icon: Lock,
      iconColor: "#7000ff",
      title: t('publicPages.useCases.institutional.paymentFeatures.compliant.title'),
      desc: t('publicPages.useCases.institutional.paymentFeatures.compliant.desc')
    },
    {
      icon: FileText,
      iconColor: "#00ff9d",
      title: t('publicPages.useCases.institutional.paymentFeatures.smartContract.title'),
      desc: t('publicPages.useCases.institutional.paymentFeatures.smartContract.desc')
    }
  ];

  const metrics = [
    {
      value: "$25B+",
      label: t('publicPages.useCases.institutional.metrics.dailyVolume'),
      iconColor: "#ffd700"
    },
    {
      value: "0.01%",
      label: t('publicPages.useCases.institutional.metrics.transactionFee'),
      iconColor: "#00f0ff"
    },
    {
      value: "99.99%",
      label: t('publicPages.useCases.institutional.metrics.uptimeSla'),
      iconColor: "#00ff9d"
    }
  ];

  const integrations = [
    {
      icon: Landmark,
      title: t('publicPages.useCases.institutional.integrations.coreBanking.title'),
      desc: t('publicPages.useCases.institutional.integrations.coreBanking.desc')
    },
    {
      icon: Shield,
      title: t('publicPages.useCases.institutional.integrations.treasury.title'),
      desc: t('publicPages.useCases.institutional.integrations.treasury.desc')
    },
    {
      icon: Users,
      title: t('publicPages.useCases.institutional.integrations.correspondent.title'),
      desc: t('publicPages.useCases.institutional.integrations.correspondent.desc')
    },
    {
      icon: Clock,
      title: t('publicPages.useCases.institutional.integrations.operations.title'),
      desc: t('publicPages.useCases.institutional.integrations.operations.desc')
    }
  ];

  const clientTypes = [
    { title: t('publicPages.useCases.institutional.clientTypes.centralBanks.title'), desc: t('publicPages.useCases.institutional.clientTypes.centralBanks.desc') },
    { title: t('publicPages.useCases.institutional.clientTypes.commercialBanks.title'), desc: t('publicPages.useCases.institutional.clientTypes.commercialBanks.desc') },
    { title: t('publicPages.useCases.institutional.clientTypes.paymentProcessors.title'), desc: t('publicPages.useCases.institutional.clientTypes.paymentProcessors.desc') },
    { title: t('publicPages.useCases.institutional.clientTypes.fintechs.title'), desc: t('publicPages.useCases.institutional.clientTypes.fintechs.desc') }
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
        <div className="absolute top-0 right-1/3 w-[600px] h-[500px] bg-[#ffd700]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#ffd700] mb-6">
            <Building2 className="w-4 h-4" /> {t('publicPages.useCases.institutional.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.useCases.institutional.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.useCases.institutional.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/community/hub">
              <button 
                className="px-8 py-3 rounded-lg bg-[#ffd700] text-black font-bold hover:bg-yellow-400 transition"
                style={{ boxShadow: "0 0 20px rgba(255,215,0,0.3)" }}
                data-testid="button-contact"
              >
                {t('publicPages.useCases.institutional.buttons.contactSales')}
              </button>
            </Link>
            <Link href="/developers/api-docs">
              <button 
                className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                data-testid="button-api"
              >
                {t('publicPages.useCases.institutional.buttons.apiReference')}
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.useCases.institutional.sections.paymentFeatures')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.useCases.institutional.sections.paymentFeaturesDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {paymentFeatures.map((feature, idx) => {
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

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.useCases.institutional.sections.systemIntegrations')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrations.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10 text-center"
                  data-testid={`card-integration-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#ffd700] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.useCases.institutional.sections.clientTypes')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {clientTypes.map((client, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10 flex items-start gap-4"
                data-testid={`card-client-${idx}`}
              >
                <CheckCircle className="w-6 h-6 text-[#ffd700] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{client.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{client.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#ffd700]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,149,0,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.useCases.institutional.cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.useCases.institutional.cta.desc')}
            </p>
            <Link href="/community/hub">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#ffd700] text-black font-bold hover:bg-yellow-400 transition"
                style={{ boxShadow: "0 0 20px rgba(255,215,0,0.3)" }}
                data-testid="button-demo"
              >
                {t('publicPages.useCases.institutional.cta.requestDemo')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
