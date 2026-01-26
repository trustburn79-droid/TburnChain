import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Terminal, 
  ArrowRight, 
  BookOpen,
  Box,
  Coins,
  Brain,
  FlaskConical,
  Server
} from "lucide-react";
import { SiJavascript, SiPython, SiRust, SiGo, SiSwift } from "react-icons/si";
import { FaJava } from "react-icons/fa";

const sdkIcons = [
  { key: "javascript", icon: SiJavascript, iconColor: "#facc15" },
  { key: "python", icon: SiPython, iconColor: "#60a5fa" },
  { key: "rust", icon: SiRust, iconColor: "#f97316" },
  { key: "go", icon: SiGo, iconColor: "#22d3ee" },
  { key: "java", icon: FaJava, iconColor: "#f87171" },
  { key: "swift", icon: SiSwift, iconColor: "#fb923c" },
];

const devToolIcons = [
  { key: "burnCli", icon: Terminal, color: "#00f0ff" },
  { key: "testFramework", icon: FlaskConical, color: "#7000ff" },
  { key: "localDevnet", icon: Server, color: "#00ff9d" },
];

const blockchainApiEndpoints = [
  { method: "GET", path: "/v8/blocks/{hash}", color: "#22c55e" },
  { method: "GET", path: "/v8/transactions/{txId}", color: "#22c55e" },
  { method: "POST", path: "/v8/transactions/submit", color: "#3b82f6" },
  { method: "GET", path: "/v8/accounts/{address}", color: "#22c55e" },
  { method: "GET", path: "/v8/shards/status", color: "#22c55e" },
  { method: "GET", path: "/v8/validators/active", color: "#22c55e" },
];

const defiApiEndpoints = [
  { method: "GET", path: "/v8/defi/pools", color: "#22c55e" },
  { method: "POST", path: "/v8/defi/swap", color: "#3b82f6" },
  { method: "GET", path: "/v8/defi/lending/markets", color: "#22c55e" },
  { method: "POST", path: "/v8/defi/staking/stake", color: "#3b82f6" },
  { method: "GET", path: "/v8/bridge/status", color: "#22c55e" },
  { method: "POST", path: "/v8/bridge/transfer", color: "#3b82f6" },
];

const aiApiEndpoints = [
  { method: "GET", path: "/v8/ai/trust-score/{id}", color: "#22c55e" },
  { method: "POST", path: "/v8/ai/analyze", color: "#3b82f6" },
  { method: "GET", path: "/v8/ai/predictions", color: "#22c55e" },
  { method: "WS", path: "/v8/ai/stream", color: "#a855f7" },
  { method: "GET", path: "/v8/ai/orchestration/status", color: "#22c55e" },
  { method: "POST", path: "/v8/ai/burn-optimize", color: "#3b82f6" },
];

const advancedTechApiEndpoints = [
  { method: "GET", path: "/advanced-tech/overview", color: "#22c55e" },
  { method: "GET", path: "/advanced-tech/tps-breakdown", color: "#22c55e" },
  { method: "GET", path: "/advanced-tech/feature-flags", color: "#22c55e" },
  { method: "GET", path: "/advanced-tech/adapters", color: "#22c55e" },
  { method: "POST", path: "/v8/aa/create-wallet", color: "#3b82f6" },
  { method: "POST", path: "/v8/intent/submit", color: "#3b82f6" },
];

const grantTierKeys = ["seed", "build", "scale", "enterprise"];

export default function DeveloperHub() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const quickStartSteps = [
    { 
      step: 1, 
      comment: t('publicPages.developers.hub.quickStartSteps.step1.comment'), 
      command: "npm install -g @burnchain/cli", 
      highlight: "npm" 
    },
    { 
      step: 2, 
      comment: t('publicPages.developers.hub.quickStartSteps.step2.comment'), 
      command: "burn init my-dapp --template=react", 
      highlight: "burn" 
    },
    { 
      step: 3, 
      comment: t('publicPages.developers.hub.quickStartSteps.step3.comment'), 
      command: "cd my-dapp && burn dev", 
      highlight: "cd" 
    },
    { 
      step: 4, 
      comment: t('publicPages.developers.hub.quickStartSteps.step4.comment'), 
      command: "burn deploy --network=mainnet", 
      highlight: "burn" 
    },
  ];

  const sdks = sdkIcons.map(sdk => ({
    ...sdk,
    name: t(`publicPages.developers.hub.sdkList.${sdk.key}.name`),
    version: t(`publicPages.developers.hub.sdkList.${sdk.key}.version`),
    install: t(`publicPages.developers.hub.sdkList.${sdk.key}.install`),
    downloads: t(`publicPages.developers.hub.sdkList.${sdk.key}.downloads`),
  }));

  const devTools = devToolIcons.map(tool => ({
    ...tool,
    title: t(`publicPages.developers.hub.devTools.${tool.key}.title`),
    description: t(`publicPages.developers.hub.devTools.${tool.key}.description`),
  }));

  const grantTiers = grantTierKeys.map(key => ({
    tier: t(`publicPages.developers.hub.grantTiers.${key}.tier`),
    amount: t(`publicPages.developers.hub.grantTiers.${key}.amount`),
    description: t(`publicPages.developers.hub.grantTiers.${key}.description`),
  }));

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
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#7000ff]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Terminal className="w-4 h-4" /> {t('publicPages.developers.hub.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.developers.hub.title').split(' ')[0]}{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              {t('publicPages.developers.hub.title').split(' ')[1]}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
            {t('publicPages.developers.hub.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg flex items-center gap-2 font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ 
                  background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                  boxShadow: "0 0 15px rgba(112, 0, 255, 0.3)"
                }}
                data-testid="button-get-started"
              >
                {t('publicPages.common.getStarted')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2"
                data-testid="button-view-docs"
              >
                <BookOpen className="w-4 h-4" /> {t('publicPages.common.viewDocs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.developers.hub.quickStart.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.developers.hub.quickStart.subtitle')}</p>
          </div>

          <div 
            className="rounded-lg overflow-hidden shadow-2xl"
            style={{ 
              background: "#0a0a0f",
              border: "1px solid #333",
              boxShadow: "0 25px 50px -12px rgba(112, 0, 255, 0.1)"
            }}
            data-testid="terminal-window"
          >
            {/* Terminal Header */}
            <div className="px-3 py-2 flex gap-1.5" style={{ background: "#1a1a20" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f56" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#27c93f" }} />
            </div>
            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm text-gray-300 space-y-4">
              {quickStartSteps.map((step) => (
                <div 
                  key={step.step}
                  className="flex gap-4 py-1 border-l-2 border-transparent hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 transition-colors pl-2"
                >
                  <span className="text-gray-500 select-none">{step.step}</span>
                  <div>
                    <span className="text-[#00ff9d]">{step.comment}</span>
                    <br />
                    <span className="text-[#00f0ff]">{step.highlight}</span>{" "}
                    {step.command.replace(step.highlight, "").replace(" && burn dev", "").replace(" && ", "")}
                    {step.command.includes(" && ") && (
                      <><span className="text-gray-300"> && </span><span className="text-[#00f0ff]">burn</span> dev</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Official SDKs Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.developers.hub.sdks.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.developers.hub.sdks.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sdks.map((sdk, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6"
                data-testid={`sdk-card-${index}`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <sdk.icon className="text-3xl" style={{ color: sdk.iconColor }} />
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-xs font-mono text-gray-900 dark:text-white">{sdk.version}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{sdk.name}</h3>
                <div className="bg-gray-900 dark:bg-black/30 p-2 rounded text-xs font-mono text-[#00f0ff] mb-3">
                  {sdk.install}
                </div>
                <p className="text-xs text-gray-500">{sdk.downloads}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.developers.hub.apiReference.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.developers.hub.apiReference.subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Blockchain API */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.developers.hub.apiReference.blockchainApi')}
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {blockchainApiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span 
                      className="px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${endpoint.color}20`,
                        color: endpoint.color,
                        border: `1px solid ${endpoint.color}30`
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{endpoint.path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DeFi API */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#00f0ff]" /> {t('publicPages.developers.hub.apiReference.defiApi')}
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {defiApiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span 
                      className="px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${endpoint.color}20`,
                        color: endpoint.color,
                        border: `1px solid ${endpoint.color}30`
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{endpoint.path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI API */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#00ff9d]" /> {t('publicPages.developers.hub.apiReference.aiApi')}
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {aiApiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span 
                      className="px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${endpoint.color}20`,
                        color: endpoint.color,
                        border: `1px solid ${endpoint.color}30`
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{endpoint.path}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Tools Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('publicPages.developers.hub.devToolsSection.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {devTools.map((tool, index) => (
              <Link key={index} href="/developers/docs">
                <div 
                  className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card p-6 rounded-xl flex items-center gap-4 group cursor-pointer"
                  data-testid={`dev-tool-${index}`}
                >
                  <div className="w-12 h-12 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center" style={{ color: tool.color }}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{tool.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* Developer Grants Program */}
          <div 
            className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8 text-center"
            style={{ 
              border: "1px solid rgba(0, 255, 157, 0.3)",
              background: "rgba(0, 255, 157, 0.05)"
            }}
            data-testid="grants-section"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.developers.hub.grants.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{t('publicPages.developers.hub.grants.subtitle')}</p>
            
            <div className="inline-block px-6 py-2 rounded-full bg-[#00ff9d]/20 text-[#00ff9d] font-bold text-2xl mb-8">
              {t('publicPages.developers.hub.grants.totalFund')}
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-left">
              {grantTiers.map((tier, index) => (
                <div 
                  key={index}
                  className="p-4 rounded border border-gray-300 dark:border-white/10"
                  style={{ background: "rgba(0, 0, 0, 0.4)" }}
                >
                  <div className="text-xs text-[#00ff9d] font-bold uppercase mb-1">{tier.tier}</div>
                  <div className="text-xl font-bold text-white">{tier.amount}</div>
                  <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
