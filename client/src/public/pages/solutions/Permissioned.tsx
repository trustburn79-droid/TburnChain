import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Building2,
  UserCog,
  IdCard,
  FileText,
  Key,
  Link2,
  EyeOff,
  Network,
  Truck,
  Landmark,
  HeartPulse
} from "lucide-react";

export default function Permissioned() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const enterpriseFeatures = [
    {
      icon: UserCog,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.permissioned.features.rbac.title'),
      desc: t('publicPages.solutions.permissioned.features.rbac.desc')
    },
    {
      icon: IdCard,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.permissioned.features.whitelist.title'),
      desc: t('publicPages.solutions.permissioned.features.whitelist.desc')
    },
    {
      icon: FileText,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.permissioned.features.compliance.title'),
      desc: t('publicPages.solutions.permissioned.features.compliance.desc')
    },
    {
      icon: Key,
      iconColor: "#ffd700",
      title: t('publicPages.solutions.permissioned.features.multisig.title'),
      desc: t('publicPages.solutions.permissioned.features.multisig.desc')
    }
  ];

  const hybridFeatures = [
    {
      icon: Link2,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.permissioned.hybrid.privateAnchor.title'),
      desc: t('publicPages.solutions.permissioned.hybrid.privateAnchor.desc')
    },
    {
      icon: EyeOff,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.permissioned.hybrid.selectiveDisclosure.title'),
      desc: t('publicPages.solutions.permissioned.hybrid.selectiveDisclosure.desc')
    }
  ];

  const useCases = [
    {
      icon: Truck,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.permissioned.useCases.supplyChain.title'),
      desc: t('publicPages.solutions.permissioned.useCases.supplyChain.desc'),
      example: t('publicPages.solutions.permissioned.useCases.supplyChain.example'),
      flow: t('publicPages.solutions.permissioned.useCases.supplyChain.flow')
    },
    {
      icon: Landmark,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.permissioned.useCases.banking.title'),
      desc: t('publicPages.solutions.permissioned.useCases.banking.desc'),
      example: t('publicPages.solutions.permissioned.useCases.banking.example'),
      flow: t('publicPages.solutions.permissioned.useCases.banking.flow')
    },
    {
      icon: HeartPulse,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.permissioned.useCases.medical.title'),
      desc: t('publicPages.solutions.permissioned.useCases.medical.desc'),
      example: t('publicPages.solutions.permissioned.useCases.medical.example'),
      flow: t('publicPages.solutions.permissioned.useCases.medical.flow')
    }
  ];

  const deploymentSteps = [
    {
      step: 1,
      title: t('publicPages.solutions.permissioned.deployment.step1.title'),
      desc: t('publicPages.solutions.permissioned.deployment.step1.desc'),
      highlight: false
    },
    {
      step: 2,
      title: t('publicPages.solutions.permissioned.deployment.step2.title'),
      desc: t('publicPages.solutions.permissioned.deployment.step2.desc'),
      highlight: false
    },
    {
      step: 3,
      title: t('publicPages.solutions.permissioned.deployment.step3.title'),
      desc: t('publicPages.solutions.permissioned.deployment.step3.desc'),
      highlight: false
    },
    {
      step: 4,
      title: t('publicPages.solutions.permissioned.deployment.step4.title'),
      desc: t('publicPages.solutions.permissioned.deployment.step4.desc'),
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
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Building2 className="w-4 h-4" /> {t('publicPages.solutions.permissioned.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.permissioned.title')}{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.permissioned.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
            {t('publicPages.solutions.permissioned.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/community/hub">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
                style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
                data-testid="button-contact"
              >
                {t('publicPages.solutions.permissioned.buttons.contactSales')}
              </button>
            </Link>
            <Link href="/learn/whitepaper">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-whitepaper"
              >
                {t('publicPages.solutions.permissioned.buttons.viewWhitepaper')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">{t('publicPages.solutions.permissioned.sections.enterpriseFeatures.title')}</h2>
            <p className="text-gray-400">{t('publicPages.solutions.permissioned.sections.enterpriseFeatures.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {enterpriseFeatures.map((feature, idx) => {
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

      {/* Hybrid Architecture Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-white mb-6">{t('publicPages.solutions.permissioned.sections.hybridArchitecture.title')}</h2>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                {t('publicPages.solutions.permissioned.sections.hybridArchitecture.subtitle')}
              </p>
              
              <div className="space-y-6">
                {hybridFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="mt-1">
                        <Icon className="w-5 h-5" style={{ color: feature.iconColor }} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{feature.title}</h4>
                        <p className="text-gray-400 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Architecture Diagram */}
            <div className="md:w-1/2 w-full">
              <div className="spotlight-card p-8 rounded-2xl border border-[#00f0ff]/30 bg-[#00f0ff]/5 text-center">
                <Network className="w-16 h-16 text-[#00f0ff] mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white">{t('publicPages.solutions.permissioned.diagram.privateLayer')}</h3>
                
                <div className="my-4 border-l-2 border-dashed border-white/20 h-12 mx-auto w-0" />
                
                <div className="bg-black/40 p-4 rounded-lg border border-white/10 inline-block">
                  <span className="text-xs font-mono text-gray-500">{t('publicPages.solutions.permissioned.diagram.anchoringHash')}</span>
                  <div className="text-[#7000ff] font-mono text-sm mt-1">0x7f...3a9b</div>
                </div>
                
                <div className="my-4 border-l-2 border-dashed border-white/20 h-12 mx-auto w-0" />
                
                <h3 className="text-xl font-bold text-white">{t('publicPages.solutions.permissioned.diagram.publicMainnet')}</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Use Cases Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">{t('publicPages.solutions.permissioned.sections.useCases.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 border border-white/10"
                  data-testid={`card-usecase-${idx}`}
                >
                  <Icon className="w-10 h-10 mb-6" style={{ color: useCase.iconColor }} />
                  <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{useCase.desc}</p>
                  <div 
                    className="bg-white/5 p-3 rounded text-xs text-gray-300"
                    style={{ borderLeft: `2px solid ${useCase.iconColor}` }}
                  >
                    <strong>{t('publicPages.solutions.permissioned.useCases.exampleLabel')}:</strong> {useCase.example}<br />
                    {useCase.flow}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deployment Process Section */}
      <section 
        className="py-20 px-6"
        style={{ background: "linear-gradient(to right, rgba(112,0,255,0.1), rgba(0,240,255,0.1))" }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">{t('publicPages.solutions.permissioned.sections.deployment.title')}</h2>
          <div className="space-y-6">
            {deploymentSteps.map((step, idx) => (
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
