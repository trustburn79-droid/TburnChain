import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeftRight, ArrowLeft, Shield, Shuffle, Droplets, 
  Link2, Key, RotateCcw, Clock, Check, Zap, Globe,
  BookOpen, Code, FileText, Terminal, ExternalLink,
  Wallet, CreditCard, Coins, Landmark, Bitcoin, Sparkles, Lock
} from "lucide-react";

export default function CrossChainBridge() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const heroStats = [
    { value: "8+", label: t('publicPages.solutions.crossChainBridge.heroStats.chains'), color: "#00f0ff" },
    { value: "$2.5B+", label: t('publicPages.solutions.crossChainBridge.heroStats.volume'), color: "#ffffff" },
    { value: "4.2M+", label: t('publicPages.solutions.crossChainBridge.heroStats.txns'), color: "#00f0ff" },
    { value: "~45s", label: t('publicPages.solutions.crossChainBridge.heroStats.avgTime'), color: "#ffffff" }
  ];

  const supportedNetworks = [
    { name: "Ethereum", color: "#3b82f6" },
    { name: "BNB Chain", color: "#f59e0b" },
    { name: "Polygon", color: "#8b5cf6" },
    { name: "Arbitrum", color: "#93c5fd" },
    { name: "Optimism", color: "#ef4444" },
    { name: "Avalanche", color: "#dc2626" },
    { name: "Solana", color: "#a855f7" }
  ];

  const coreFeatures = [
    {
      icon: Key,
      title: t('publicPages.solutions.crossChainBridge.coreFeatures.mpcSecurity.title'),
      subtitle: t('publicPages.solutions.crossChainBridge.coreFeatures.mpcSecurity.subtitle'),
      color: "#00f0ff",
      gradientFrom: "#00f0ff",
      gradientTo: "#3b82f6",
      items: [
        t('publicPages.solutions.crossChainBridge.coreFeatures.mpcSecurity.items.distributedKeyGen'),
        t('publicPages.solutions.crossChainBridge.coreFeatures.mpcSecurity.items.thresholdSignatures'),
        t('publicPages.solutions.crossChainBridge.coreFeatures.mpcSecurity.items.regularKeyRotation')
      ]
    },
    {
      icon: Shuffle,
      title: t('publicPages.solutions.crossChainBridge.coreFeatures.atomicSwaps.title'),
      subtitle: t('publicPages.solutions.crossChainBridge.coreFeatures.atomicSwaps.subtitle'),
      color: "#7000ff",
      gradientFrom: "#7000ff",
      gradientTo: "#ec4899",
      items: [
        t('publicPages.solutions.crossChainBridge.coreFeatures.atomicSwaps.items.htlcContracts'),
        t('publicPages.solutions.crossChainBridge.coreFeatures.atomicSwaps.items.zeroSlippage'),
        t('publicPages.solutions.crossChainBridge.coreFeatures.atomicSwaps.items.autoRefund')
      ]
    },
    {
      icon: Droplets,
      title: t('publicPages.solutions.crossChainBridge.coreFeatures.unifiedLiquidity.title'),
      subtitle: t('publicPages.solutions.crossChainBridge.coreFeatures.unifiedLiquidity.subtitle'),
      color: "#3b82f6",
      gradientFrom: "#3b82f6",
      gradientTo: "#6366f1",
      items: [
        t('publicPages.solutions.crossChainBridge.coreFeatures.unifiedLiquidity.items.crossChainPools'),
        t('publicPages.solutions.crossChainBridge.coreFeatures.unifiedLiquidity.items.dynamicRebalancing'),
        t('publicPages.solutions.crossChainBridge.coreFeatures.unifiedLiquidity.items.largeTransferSupport')
      ]
    }
  ];

  const bridgeSteps = [
    { step: 1, title: t('publicPages.solutions.crossChainBridge.bridgeSteps.step1.title'), desc: t('publicPages.solutions.crossChainBridge.bridgeSteps.step1.desc') },
    { step: 2, title: t('publicPages.solutions.crossChainBridge.bridgeSteps.step2.title'), desc: t('publicPages.solutions.crossChainBridge.bridgeSteps.step2.desc') },
    { step: 3, title: t('publicPages.solutions.crossChainBridge.bridgeSteps.step3.title'), desc: t('publicPages.solutions.crossChainBridge.bridgeSteps.step3.desc') },
    { step: 4, title: t('publicPages.solutions.crossChainBridge.bridgeSteps.step4.title'), desc: t('publicPages.solutions.crossChainBridge.bridgeSteps.step4.desc') }
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
      <section className="relative py-20 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#3b82f6]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/solutions/token-extensions"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f0ff] mb-6 transition-colors group"
            data-testid="link-back-solutions"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.common.backToSolutions')}
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 text-[#00f0ff] text-xs">
            <ArrowLeftRight className="w-4 h-4" /> {t('publicPages.solutions.crossChainBridge.tag')}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.solutions.crossChainBridge.title')} <br />
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#3b82f6] to-white bg-clip-text text-transparent">
              {t('publicPages.solutions.crossChainBridge.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            {t('publicPages.solutions.crossChainBridge.subtitle')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
            {heroStats.map((stat, idx) => (
              <div key={idx} className="spotlight-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/developers/quickstart">
              <button 
                className="bg-gradient-to-r from-[#00f0ff] to-[#3b82f6] text-white px-8 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition flex items-center justify-center gap-2"
                data-testid="button-launch-bridge"
              >
                <ArrowLeftRight className="w-4 h-4" /> {t('publicPages.solutions.crossChainBridge.buttons.launchBridge')}
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="spotlight-card border border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition flex items-center justify-center gap-2 text-white"
                data-testid="button-view-docs"
              >
                <FileText className="w-4 h-4" /> {t('publicPages.solutions.crossChainBridge.buttons.viewDocumentation')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Supported Networks */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">{t('publicPages.solutions.crossChainBridge.supportedNetworks.title')}</h2>
          <p className="text-gray-400 text-sm mt-2">{t('publicPages.solutions.crossChainBridge.supportedNetworks.subtitle')}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {supportedNetworks.map((network, idx) => (
            <div 
              key={idx}
              className="spotlight-card px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition cursor-default"
            >
              <Globe className="w-5 h-5" style={{ color: network.color }} />
              <span className="font-medium text-white">{network.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {coreFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="spotlight-card rounded-2xl p-8 group"
                data-testid={`card-feature-${idx}`}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `linear-gradient(135deg, ${feature.gradientFrom}, ${feature.gradientTo})` }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm mb-4" style={{ color: feature.color }}>{feature.subtitle}</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4" style={{ color: feature.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* How Bridge Works */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">{t('publicPages.solutions.crossChainBridge.howItWorks.title')}</h2>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 hidden md:block z-0" />
          
          <div className="grid md:grid-cols-4 gap-6 relative z-10">
            {bridgeSteps.map((item, idx) => (
              <div 
                key={idx}
                className="spotlight-card p-6 rounded-xl text-center border border-[#00f0ff]/20"
                data-testid={`step-${item.step}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#00f0ff] text-black font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Solutions */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.solutions.crossChainBridge.relatedSolutions.title')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('publicPages.solutions.crossChainBridge.relatedSolutions.description')}
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/solutions/btcfi"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f7931a]/5 border border-[#f7931a]/20 hover:bg-[#f7931a]/10 transition group"
              data-testid="link-btcfi"
            >
              <Bitcoin className="w-5 h-5 text-[#f7931a]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f7931a] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.btcfi.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.btcfi.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/token-extensions"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-token-extensions"
            >
              <Coins className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.tokenExtensions.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.tokenExtensions.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/wallets"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-wallets"
            >
              <Wallet className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.wallets.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.wallets.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/payments"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-payments"
            >
              <CreditCard className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.payments.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.payments.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/financial"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-financial"
            >
              <Landmark className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.financial.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.financial.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/permissioned"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
              data-testid="link-permissioned"
            >
              <Lock className="w-5 h-5 text-[#ffd700]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ffd700] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.permissioned.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.permissioned.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/ai-features"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/10 transition group"
              data-testid="link-ai-features"
            >
              <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#8b5cf6] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.aiFeatures.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.aiFeatures.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/actions-blinks"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ff0055]/5 border border-[#ff0055]/20 hover:bg-[#ff0055]/10 transition group"
              data-testid="link-actions-blinks"
            >
              <Zap className="w-5 h-5 text-[#ff0055]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ff0055] transition">{t('publicPages.solutions.crossChainBridge.relatedSolutions.actionsBlinks.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.relatedSolutions.actionsBlinks.subtitle')}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer Resources */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.solutions.crossChainBridge.developerResources.title')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('publicPages.solutions.crossChainBridge.developerResources.description')}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.solutions.crossChainBridge.developerResources.sdkGuide.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.developerResources.sdkGuide.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">{t('publicPages.solutions.crossChainBridge.developerResources.smartContracts.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.developerResources.smartContracts.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.solutions.crossChainBridge.developerResources.apiReference.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.developerResources.apiReference.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-websocket"
            >
              <Globe className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">{t('publicPages.solutions.crossChainBridge.developerResources.websocketApi.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.developerResources.websocketApi.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/cli"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/20 hover:bg-[#f59e0b]/10 transition group"
              data-testid="link-cli"
            >
              <Terminal className="w-5 h-5 text-[#f59e0b]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f59e0b] transition">{t('publicPages.solutions.crossChainBridge.developerResources.cliReference.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.developerResources.cliReference.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/examples"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ec4899]/5 border border-[#ec4899]/20 hover:bg-[#ec4899]/10 transition group"
              data-testid="link-examples"
            >
              <ExternalLink className="w-5 h-5 text-[#ec4899]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ec4899] transition">{t('publicPages.solutions.crossChainBridge.developerResources.codeExamples.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.developerResources.codeExamples.subtitle')}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Learn Pages */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Link 
            href="/learn/defi-mastery"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-defi-mastery"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.solutions.crossChainBridge.learnMore.title')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#8b5cf6] transition">{t('publicPages.solutions.crossChainBridge.learnMore.defiMastery.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.learnMore.defiMastery.subtitle')}</p>
              </div>
            </div>
          </Link>
          <Link 
            href="/learn/blockchain-basics"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-blockchain-basics"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.solutions.crossChainBridge.learnMore.gettingStarted')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#00f0ff] transition">{t('publicPages.solutions.crossChainBridge.learnMore.blockchainBasics.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.crossChainBridge.learnMore.blockchainBasics.subtitle')}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center spotlight-card bg-gradient-to-br from-[#00f0ff]/10 via-[#3b82f6]/5 to-transparent p-12 rounded-2xl border border-[#00f0ff]/20">
          <h2 className="text-3xl font-bold text-white mb-6">{t('publicPages.solutions.crossChainBridge.cta.title')}</h2>
          <p className="text-gray-400 mb-8">
            {t('publicPages.solutions.crossChainBridge.cta.description')}
          </p>
          <Link href="/app/bridge">
            <button 
              className="bg-gradient-to-r from-[#00f0ff] to-[#3b82f6] text-white px-10 py-4 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition flex items-center justify-center gap-3 mx-auto text-lg"
              data-testid="button-cta-launch"
            >
              <ArrowLeftRight className="w-5 h-5" /> {t('publicPages.solutions.crossChainBridge.cta.button')}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
