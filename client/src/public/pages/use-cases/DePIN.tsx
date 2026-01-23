import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Wifi,
  Server,
  Map,
  Cpu,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Cloud,
  Radio,
  ArrowRight,
  HardDrive
} from "lucide-react";

export default function DePIN() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const depinCategories = [
    {
      icon: Wifi,
      iconColor: "#00f0ff",
      title: t('publicPages.useCases.depin.categories.wireless.title'),
      desc: t('publicPages.useCases.depin.categories.wireless.desc')
    },
    {
      icon: Server,
      iconColor: "#7000ff",
      title: t('publicPages.useCases.depin.categories.compute.title'),
      desc: t('publicPages.useCases.depin.categories.compute.desc')
    },
    {
      icon: Map,
      iconColor: "#00ff9d",
      title: t('publicPages.useCases.depin.categories.mapping.title'),
      desc: t('publicPages.useCases.depin.categories.mapping.desc')
    },
    {
      icon: Cloud,
      iconColor: "#ffd700",
      title: t('publicPages.useCases.depin.categories.storage.title'),
      desc: t('publicPages.useCases.depin.categories.storage.desc')
    }
  ];

  const metrics = [
    {
      value: "587",
      label: t('publicPages.useCases.depin.metrics.activeNodes'),
      iconColor: "#00f0ff"
    },
    {
      value: "100K TPS",
      label: t('publicPages.useCases.depin.metrics.protocolRevenue'),
      iconColor: "#7000ff"
    },
    {
      value: "24 Shards",
      label: t('publicPages.useCases.depin.metrics.countriesCovered'),
      iconColor: "#00ff9d"
    }
  ];

  const mainnetSpecs = [
    { label: "Chain ID", value: "5800" },
    { label: "Active Shards", value: "24 (scalable to 64)" },
    { label: "Genesis Validators", value: "587" },
    { label: "Target TPS", value: "100,000" },
    { label: "Block Time", value: "100ms" },
    { label: "Address Format", value: "tb1 (Bech32m)" },
    { label: "Total Supply", value: "100B TBURN" },
    { label: "Custody", value: "7/11 multisig (48h-30d timelocks)" }
  ];

  const features = [
    {
      icon: Zap,
      title: t('publicPages.useCases.depin.features.proofOfCoverage.title'),
      desc: t('publicPages.useCases.depin.features.proofOfCoverage.desc')
    },
    {
      icon: Shield,
      title: t('publicPages.useCases.depin.features.slashingProtection.title'),
      desc: t('publicPages.useCases.depin.features.slashingProtection.desc')
    },
    {
      icon: Users,
      title: t('publicPages.useCases.depin.features.communityGovernance.title'),
      desc: t('publicPages.useCases.depin.features.communityGovernance.desc')
    },
    {
      icon: TrendingUp,
      title: t('publicPages.useCases.depin.features.dynamicRewards.title'),
      desc: t('publicPages.useCases.depin.features.dynamicRewards.desc')
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Radio className="w-4 h-4" /> {t('publicPages.useCases.depin.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.useCases.depin.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.useCases.depin.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/app/staking">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
                style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
                data-testid="button-deploy"
              >
                {t('publicPages.useCases.depin.buttons.deployInfrastructure')}
              </button>
            </Link>
            <Link href="/developers/documentation">
              <button 
                className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                {t('publicPages.useCases.depin.buttons.protocolDocs')}
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.useCases.depin.sections.categories')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.useCases.depin.sections.categoriesDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {depinCategories.map((category, idx) => {
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.useCases.depin.sections.protocolFeatures')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#00f0ff] mx-auto mb-4" />
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">TBURN Mainnet Specifications</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12">Decentralized infrastructure powered by TBURN</p>
          
          <div className="grid md:grid-cols-4 gap-4">
            {mainnetSpecs.map((spec, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-4 border border-gray-300 dark:border-white/10 text-center"
                data-testid={`card-spec-${idx}`}
              >
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-1 font-mono">{spec.label}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">{spec.value}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Example: DePIN Node Registration (tb1 Format)</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto font-mono">
{`// TBURN DePIN Node
const node = {
  operator: "tb1qoperator8skdf3njfk8wehjfk3nfkw8sdfj6n",
  nodeId: "DEPIN_COMPUTE_NODE_0x1A2B",
  stake: "100000 TBURN",
  shard: 15,
  chainId: 5800,
  validators: 587
};`}
            </pre>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center flex-shrink-0">
                <HardDrive className="w-8 h-8 text-[#00f0ff]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.useCases.depin.hardware.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('publicPages.useCases.depin.hardware.desc')}
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    <span>{t('publicPages.useCases.depin.hardware.minimum')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    <span>{t('publicPages.useCases.depin.hardware.recommended')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    <span>{t('publicPages.useCases.depin.hardware.gpu')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#00f0ff]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(112,0,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.useCases.depin.cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              {t('publicPages.useCases.depin.cta.desc')}
            </p>
            <Link href="/app/staking">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
                style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
                data-testid="button-get-started"
              >
                {t('publicPages.useCases.depin.cta.getStarted')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
