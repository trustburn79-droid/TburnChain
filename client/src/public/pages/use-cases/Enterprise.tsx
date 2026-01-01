import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Building,
  Shield,
  Zap,
  Users,
  Lock,
  Server,
  ArrowRight,
  FileText,
  Key,
  Database,
  CheckCircle,
  Layers
} from "lucide-react";

export default function Enterprise() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const solutions = [
    {
      icon: Key,
      iconColor: "#7000ff",
      title: t('publicPages.useCases.enterprise.solutions.identity.title'),
      desc: t('publicPages.useCases.enterprise.solutions.identity.desc')
    },
    {
      icon: Database,
      iconColor: "#00f0ff",
      title: t('publicPages.useCases.enterprise.solutions.supplyChain.title'),
      desc: t('publicPages.useCases.enterprise.solutions.supplyChain.desc')
    },
    {
      icon: FileText,
      iconColor: "#00ff9d",
      title: t('publicPages.useCases.enterprise.solutions.document.title'),
      desc: t('publicPages.useCases.enterprise.solutions.document.desc')
    },
    {
      icon: Layers,
      iconColor: "#ffd700",
      title: t('publicPages.useCases.enterprise.solutions.automation.title'),
      desc: t('publicPages.useCases.enterprise.solutions.automation.desc')
    }
  ];

  const metrics = [
    {
      value: "850+",
      label: t('publicPages.useCases.enterprise.metrics.enterpriseClients'),
      iconColor: "#7000ff"
    },
    {
      value: "99.97%",
      label: t('publicPages.useCases.enterprise.metrics.uptimeGuarantee'),
      iconColor: "#00f0ff"
    },
    {
      value: "24/7",
      label: t('publicPages.useCases.enterprise.metrics.dedicatedSupport'),
      iconColor: "#00ff9d"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: t('publicPages.useCases.enterprise.features.soc2.title'),
      desc: t('publicPages.useCases.enterprise.features.soc2.desc')
    },
    {
      icon: Lock,
      title: t('publicPages.useCases.enterprise.features.privateSubnets.title'),
      desc: t('publicPages.useCases.enterprise.features.privateSubnets.desc')
    },
    {
      icon: Users,
      title: t('publicPages.useCases.enterprise.features.roleAccess.title'),
      desc: t('publicPages.useCases.enterprise.features.roleAccess.desc')
    },
    {
      icon: Server,
      title: t('publicPages.useCases.enterprise.features.onPremise.title'),
      desc: t('publicPages.useCases.enterprise.features.onPremise.desc')
    }
  ];

  const industries = [
    { title: t('publicPages.useCases.enterprise.industries.healthcare.title'), desc: t('publicPages.useCases.enterprise.industries.healthcare.desc') },
    { title: t('publicPages.useCases.enterprise.industries.manufacturing.title'), desc: t('publicPages.useCases.enterprise.industries.manufacturing.desc') },
    { title: t('publicPages.useCases.enterprise.industries.legal.title'), desc: t('publicPages.useCases.enterprise.industries.legal.desc') },
    { title: t('publicPages.useCases.enterprise.industries.government.title'), desc: t('publicPages.useCases.enterprise.industries.government.desc') },
    { title: t('publicPages.useCases.enterprise.industries.insurance.title'), desc: t('publicPages.useCases.enterprise.industries.insurance.desc') },
    { title: t('publicPages.useCases.enterprise.industries.logistics.title'), desc: t('publicPages.useCases.enterprise.industries.logistics.desc') }
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
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Building className="w-4 h-4" /> {t('publicPages.useCases.enterprise.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.useCases.enterprise.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.useCases.enterprise.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/community/hub">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-contact"
              >
                {t('publicPages.useCases.enterprise.buttons.contactEnterprise')}
              </button>
            </Link>
            <Link href="/developers/documentation">
              <button 
                className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                {t('publicPages.useCases.enterprise.buttons.enterpriseDocs')}
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.useCases.enterprise.sections.solutions')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.useCases.enterprise.sections.solutionsDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10"
                  data-testid={`card-solution-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${solution.iconColor}10`,
                      border: `1px solid ${solution.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: solution.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{solution.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.useCases.enterprise.sections.platformFeatures')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#7000ff] mx-auto mb-4" />
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.useCases.enterprise.sections.industryApplications')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {industries.map((industry, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10"
                data-testid={`card-industry-${idx}`}
              >
                <CheckCircle className="w-6 h-6 text-[#00ff9d] mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{industry.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#7000ff]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(112,0,255,0.1) 0%, rgba(0,240,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.useCases.enterprise.cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.useCases.enterprise.cta.desc')}
            </p>
            <Link href="/community/hub">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-schedule"
              >
                {t('publicPages.useCases.enterprise.cta.scheduleConsultation')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
