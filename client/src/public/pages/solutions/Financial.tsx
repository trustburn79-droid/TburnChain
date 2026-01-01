import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Landmark,
  Building2,
  TrendingUp,
  ArrowLeftRight,
  Shield,
  Zap,
  Percent,
  Users
} from "lucide-react";

export default function Financial() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const coreServices = [
    {
      icon: Building2,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.financial.services.banking.title'),
      desc: t('publicPages.solutions.financial.services.banking.desc')
    },
    {
      icon: TrendingUp,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.financial.services.defi.title'),
      desc: t('publicPages.solutions.financial.services.defi.desc')
    },
    {
      icon: ArrowLeftRight,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.financial.services.payment.title'),
      desc: t('publicPages.solutions.financial.services.payment.desc')
    },
    {
      icon: Shield,
      iconColor: "#ff0055",
      title: t('publicPages.solutions.financial.services.compliance.title'),
      desc: t('publicPages.solutions.financial.services.compliance.desc')
    }
  ];

  const stats = [
    {
      icon: Zap,
      iconColor: "#ffd700",
      value: "$5.0B+",
      label: t('publicPages.solutions.financial.stats.tvl')
    },
    {
      icon: Percent,
      iconColor: "#00f0ff",
      value: "12.5%",
      label: t('publicPages.solutions.financial.stats.apy')
    },
    {
      icon: Users,
      iconColor: "#7000ff",
      value: "450K+",
      label: t('publicPages.solutions.financial.stats.dau')
    }
  ];

  const realCases = [
    {
      initial: "N",
      name: t('publicPages.solutions.financial.cases.neobank.name'),
      type: t('publicPages.solutions.financial.cases.neobank.type'),
      quote: t('publicPages.solutions.financial.cases.neobank.quote'),
      stats: [
        { label: t('publicPages.solutions.financial.cases.neobank.stats.customers'), color: "#7000ff" },
        { label: t('publicPages.solutions.financial.cases.neobank.stats.costs'), color: "#7000ff" }
      ],
      gradient: "from-[#7000ff]/10"
    },
    {
      initial: "D",
      name: t('publicPages.solutions.financial.cases.defiProtocol.name'),
      type: t('publicPages.solutions.financial.cases.defiProtocol.type'),
      quote: t('publicPages.solutions.financial.cases.defiProtocol.quote'),
      stats: [
        { label: t('publicPages.solutions.financial.cases.defiProtocol.stats.tvl'), color: "#00f0ff" },
        { label: t('publicPages.solutions.financial.cases.defiProtocol.stats.liquidations'), color: "#00f0ff" }
      ],
      gradient: "from-[#00f0ff]/10"
    }
  ];

  const buildingSteps = [
    {
      step: 1,
      color: "#00f0ff",
      textColor: "black",
      title: t('publicPages.solutions.financial.building.step1.title'),
      desc: t('publicPages.solutions.financial.building.step1.desc')
    },
    {
      step: 2,
      color: "#7000ff",
      textColor: "white",
      title: t('publicPages.solutions.financial.building.step2.title'),
      desc: t('publicPages.solutions.financial.building.step2.desc')
    },
    {
      step: 3,
      color: "#00ff9d",
      textColor: "black",
      title: t('publicPages.solutions.financial.building.step3.title'),
      desc: t('publicPages.solutions.financial.building.step3.desc')
    },
    {
      step: 4,
      color: "#ffd700",
      textColor: "black",
      title: t('publicPages.solutions.financial.building.step4.title'),
      desc: t('publicPages.solutions.financial.building.step4.desc')
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
      <section className="relative py-24 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Landmark className="w-4 h-4" /> {t('publicPages.solutions.financial.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.financial.title')}{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.financial.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.solutions.financial.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/community/hub">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
                style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
                data-testid="button-build"
              >
                {t('publicPages.solutions.financial.buttons.startBuilding')}
              </button>
            </Link>
            <Link href="/learn/whitepaper">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition"
                data-testid="button-whitepaper"
              >
                {t('publicPages.solutions.financial.buttons.readWhitepaper')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Financial Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.solutions.financial.sections.coreServices.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.solutions.financial.sections.coreServices.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10"
                  data-testid={`card-service-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${service.iconColor}10`,
                      border: `1px solid ${service.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: service.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center group"
                  data-testid={`card-stat-${idx}`}
                >
                  <Icon 
                    className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform" 
                    style={{ color: stat.iconColor }}
                  />
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-mono">{stat.value}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.financial.sections.realCases.title')}</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {realCases.map((story, idx) => (
              <div 
                key={idx}
                className={`spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10 bg-gradient-to-br ${story.gradient} to-transparent`}
                data-testid={`card-case-${idx}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gray-900 dark:text-white text-xl font-bold">
                    {story.initial}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{story.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{story.type}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">"{story.quote}"</p>
                <div className="flex gap-4 text-sm font-mono flex-wrap">
                  {story.stats.map((stat, i) => (
                    <div 
                      key={i}
                      className="bg-black/40 px-3 py-1 rounded"
                      style={{ 
                        border: `1px solid ${stat.color}30`,
                        color: stat.color
                      }}
                    >
                      {stat.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building Financial Infrastructure Section */}
      <section 
        className="py-20"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(112,0,255,0.05))" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.financial.sections.building.title')}</h2>
          
          <div className="space-y-4">
            {buildingSteps.map((step, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-gray-100 dark:bg-white/5 transition-colors"
                data-testid={`card-step-${step.step}`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: step.color,
                    color: step.textColor
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
