import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  ShieldCheck, 
  Zap, 
  Flame, 
  Network, 
  AlertTriangle,
  Book
} from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function WhatIsBurnChain() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const coreFeatures = [
    {
      icon: ShieldCheck,
      title: t('publicPages.learn.whatIsBurnChain.features.trustVerification.title'),
      description: t('publicPages.learn.whatIsBurnChain.features.trustVerification.description'),
      color: "#00f0ff",
    },
    {
      icon: Zap,
      title: t('publicPages.learn.whatIsBurnChain.features.ultraFast.title'),
      description: t('publicPages.learn.whatIsBurnChain.features.ultraFast.description'),
      color: "#7000ff",
    },
    {
      icon: Flame,
      title: t('publicPages.learn.whatIsBurnChain.features.autoBurn.title'),
      description: t('publicPages.learn.whatIsBurnChain.features.autoBurn.description'),
      color: "#ff2a6d",
    },
    {
      icon: Network,
      title: t('publicPages.learn.whatIsBurnChain.features.distributed.title'),
      description: t('publicPages.learn.whatIsBurnChain.features.distributed.description'),
      color: "#00ff9d",
    },
  ];

  const consensusSpecs = [
    { label: t('publicPages.learn.whatIsBurnChain.specs.theoreticalTps'), value: "520,000+" },
    { label: t('publicPages.learn.whatIsBurnChain.specs.practicalTps'), value: "100,000+" },
    { label: t('publicPages.learn.whatIsBurnChain.specs.blockTime'), value: "0.5s" },
    { label: t('publicPages.learn.whatIsBurnChain.specs.finality'), value: "< 1s" },
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            {t('publicPages.learn.whatIsBurnChain.tag')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.learn.whatIsBurnChain.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('publicPages.learn.whatIsBurnChain.subtitle')}
          </p>
        </div>
      </section>

      {/* Trust-Based Blockchain Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white border-l-4 border-[#7000ff] pl-4">
              {t('publicPages.learn.whatIsBurnChain.trustBased.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {t('publicPages.learn.whatIsBurnChain.trustBased.paragraph1')}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {t('publicPages.learn.whatIsBurnChain.trustBased.paragraph2')}
            </p>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-base font-mono flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{t('publicPages.learn.whatIsBurnChain.trustBased.protocolRule')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('publicPages.learn.whatIsBurnChain.coreFeatures.title')}</h2>
            <p className="text-gray-500 mt-2">{t('publicPages.learn.whatIsBurnChain.coreFeatures.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {coreFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8 group"
                data-testid={`feature-card-${index}`}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: `${feature.color}10`,
                    border: `1px solid ${feature.color}30`
                  }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('publicPages.learn.whatIsBurnChain.techSpecs.title')}</h2>
          
          <div 
            className="rounded-2xl p-8 mb-16 relative overflow-hidden bg-gray-50 dark:bg-transparent"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(112, 0, 255, 0.2)",
              boxShadow: "0 0 20px rgba(112, 0, 255, 0.05)"
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7000ff]/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              {/* Consensus Algorithm */}
              <div>
                <h3 className="text-lg font-bold text-[#00f0ff] mb-4 font-mono">// CONSENSUS_ALGORITHM</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t('publicPages.learn.whatIsBurnChain.techSpecs.consensusDesc')}
                </p>
                <ul className="space-y-2 text-sm font-mono text-gray-600 dark:text-gray-400">
                  {consensusSpecs.map((spec, index) => (
                    <li key={index} className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-1">
                      <span>{spec.label}</span>
                      <span className="text-gray-900 dark:text-white">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Smart Contracts */}
              <div>
                <h3 className="text-lg font-bold text-[#7000ff] mb-4 font-mono">// SMART_CONTRACTS</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t('publicPages.learn.whatIsBurnChain.techSpecs.smartContractsDesc')}
                </p>
                <div className="p-3 bg-gray-100 dark:bg-black/40 rounded border border-gray-300 dark:border-white/10 font-mono text-xs text-gray-500">
                  <span className="text-[#7000ff]">function</span>{" "}
                  <span className="text-yellow-600 dark:text-yellow-400">getTrustScore</span>(address project){" "}
                  <span className="text-[#7000ff]">public view returns</span> (uint8) {"{"}<br />
                  &nbsp;&nbsp;<span className="text-[#7000ff]">return</span> TrustOracle.score(project);<br />
                  {"}"}
                </div>
              </div>
            </div>
          </div>

          {/* Developer Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('publicPages.learn.whatIsBurnChain.developer.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {t('publicPages.learn.whatIsBurnChain.developer.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/developers">
                <button 
                  className="px-6 py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:bg-gray-700 dark:hover:bg-gray-200 transition flex items-center gap-2"
                  data-testid="button-read-docs"
                >
                  <Book className="w-4 h-4" /> {t('publicPages.learn.whatIsBurnChain.developer.readDocs')}
                </button>
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center gap-2"
                data-testid="link-github-sdk"
              >
                <SiGithub className="w-4 h-4" /> {t('publicPages.learn.whatIsBurnChain.developer.tburnSdk')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
