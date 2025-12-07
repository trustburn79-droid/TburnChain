import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Bitcoin, ArrowLeft, Zap, Shield, Users, Maximize2, 
  TrendingUp, BarChart3, BookOpen, Code, FileText, Terminal,
  Wallet, CreditCard, Coins, Store, ExternalLink, ArrowRightLeft,
  Lock, Landmark, Percent, Globe
} from "lucide-react";

export default function Btcfi() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Zap,
      title: t('publicPages.solutions.btcfi.features.highPerformance.title'),
      description: t('publicPages.solutions.btcfi.features.highPerformance.description'),
      gradientFrom: "#f7931a",
      gradientTo: "#ffd700",
      hoverColor: "text-[#f7931a]"
    },
    {
      icon: Shield,
      title: t('publicPages.solutions.btcfi.features.trustVerification.title'),
      description: t('publicPages.solutions.btcfi.features.trustVerification.description'),
      gradientFrom: "#7000ff",
      gradientTo: "#00f0ff",
      hoverColor: "text-[#7000ff]"
    },
    {
      icon: Users,
      title: t('publicPages.solutions.btcfi.features.growingEcosystem.title'),
      description: t('publicPages.solutions.btcfi.features.growingEcosystem.description'),
      gradientFrom: "#22c55e",
      gradientTo: "#10b981",
      hoverColor: "text-green-400"
    },
    {
      icon: Maximize2,
      title: t('publicPages.solutions.btcfi.features.scalableSolutions.title'),
      description: t('publicPages.solutions.btcfi.features.scalableSolutions.description'),
      gradientFrom: "#3b82f6",
      gradientTo: "#6366f1",
      hoverColor: "text-blue-400"
    }
  ];

  const stats = [
    { value: "25,000+", label: t('publicPages.solutions.btcfi.stats.btcBridged'), color: "#f7931a" },
    { value: "$850M+", label: t('publicPages.solutions.btcfi.stats.tvl'), color: "#ffd700" },
    { value: t('publicPages.solutions.btcfi.stats.zeroValue'), label: t('publicPages.solutions.btcfi.stats.securityIncidents'), color: "#94a3b8" }
  ];

  const btcfiProducts = [
    {
      icon: ArrowRightLeft,
      iconColor: "#f7931a",
      title: t('publicPages.solutions.btcfi.products.tbtcBridge.title'),
      description: t('publicPages.solutions.btcfi.products.tbtcBridge.description'),
      stats: t('publicPages.solutions.btcfi.products.tbtcBridge.stats')
    },
    {
      icon: Percent,
      iconColor: "#22c55e",
      title: t('publicPages.solutions.btcfi.products.btcLending.title'),
      description: t('publicPages.solutions.btcfi.products.btcLending.description'),
      stats: t('publicPages.solutions.btcfi.products.btcLending.stats')
    },
    {
      icon: TrendingUp,
      iconColor: "#3b82f6",
      title: t('publicPages.solutions.btcfi.products.btcYieldFarming.title'),
      description: t('publicPages.solutions.btcfi.products.btcYieldFarming.description'),
      stats: t('publicPages.solutions.btcfi.products.btcYieldFarming.stats')
    },
    {
      icon: Lock,
      iconColor: "#7000ff",
      title: t('publicPages.solutions.btcfi.products.btcStaking.title'),
      description: t('publicPages.solutions.btcfi.products.btcStaking.description'),
      stats: t('publicPages.solutions.btcfi.products.btcStaking.stats')
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
      <section className="relative py-20 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7931a]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#f7931a]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#ffd700]/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/solutions/token-extensions"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#f7931a] mb-6 transition-colors group"
            data-testid="link-back-solutions"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.common.backToSolutions')}
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#f7931a]/30 bg-[#f7931a]/5 text-[#f7931a] text-xs">
            <Bitcoin className="w-4 h-4" /> {t('publicPages.solutions.btcfi.tag')}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.solutions.btcfi.title')} <br />
            <span className="bg-gradient-to-r from-[#f7931a] via-[#ffd700] to-white bg-clip-text text-transparent">
              {t('publicPages.solutions.btcfi.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            {t('publicPages.solutions.btcfi.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/solutions/cross-chain-bridge">
              <button 
                className="bg-[#f7931a] text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                style={{ boxShadow: "0 0 20px rgba(247,147,26,0.4)" }}
                data-testid="button-bridge-btc"
              >
                <ArrowRightLeft className="w-4 h-4" /> {t('publicPages.solutions.btcfi.buttons.bridgeBtc')}
              </button>
            </Link>
            <Link href="/app/yield-farming">
              <button 
                className="spotlight-card border border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition flex items-center justify-center gap-2 text-white"
                data-testid="button-view-yields"
              >
                <BarChart3 className="w-4 h-4" /> {t('publicPages.solutions.btcfi.buttons.viewYields')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="spotlight-card rounded-2xl p-8 group"
                data-testid={`card-feature-${idx}`}
              >
                <div className="flex items-start gap-6">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `linear-gradient(135deg, ${feature.gradientFrom}, ${feature.gradientTo})` }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold text-white mb-3 group-hover:${feature.hoverColor} transition-colors`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-2xl p-10 border border-[#f7931a]/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Bitcoin className="w-32 h-32 text-[#f7931a]" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800 relative z-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-4xl font-bold text-white mb-2 font-mono">{stat.value}</div>
                <div className="text-sm uppercase tracking-widest" style={{ color: stat.color }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BTCfi Products */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">{t('publicPages.solutions.btcfi.productsSection.title')}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('publicPages.solutions.btcfi.productsSection.description')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {btcfiProducts.map((product, idx) => {
            const Icon = product.icon;
            return (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 group"
                data-testid={`card-product-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${product.iconColor}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: product.iconColor }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#f7931a] transition-colors">
                        {product.title}
                      </h3>
                      <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10" style={{ color: product.iconColor }}>
                        {product.stats}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{product.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Solutions */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.solutions.btcfi.relatedSolutions.title')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('publicPages.solutions.btcfi.relatedSolutions.description')}
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/solutions/token-extensions"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f7931a]/5 border border-[#f7931a]/20 hover:bg-[#f7931a]/10 transition group"
              data-testid="link-token-extensions"
            >
              <Coins className="w-5 h-5 text-[#f7931a]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f7931a] transition">{t('publicPages.solutions.btcfi.relatedSolutions.tokenExtensions.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.tokenExtensions.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/wallets"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-wallets"
            >
              <Wallet className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.solutions.btcfi.relatedSolutions.wallets.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.wallets.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/payments"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-payments"
            >
              <CreditCard className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.solutions.btcfi.relatedSolutions.payments.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.payments.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/financial"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-financial"
            >
              <Landmark className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">{t('publicPages.solutions.btcfi.relatedSolutions.financial.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.financial.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/commerce"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-commerce"
            >
              <Store className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">{t('publicPages.solutions.btcfi.relatedSolutions.commerce.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.commerce.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/permissioned"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
              data-testid="link-permissioned"
            >
              <Lock className="w-5 h-5 text-[#ffd700]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ffd700] transition">{t('publicPages.solutions.btcfi.relatedSolutions.permissioned.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.permissioned.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/ai-features"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/10 transition group"
              data-testid="link-ai-features"
            >
              <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#8b5cf6] transition">{t('publicPages.solutions.btcfi.relatedSolutions.aiFeatures.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.aiFeatures.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/actions-blinks"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ff0055]/5 border border-[#ff0055]/20 hover:bg-[#ff0055]/10 transition group"
              data-testid="link-actions-blinks"
            >
              <Zap className="w-5 h-5 text-[#ff0055]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ff0055] transition">{t('publicPages.solutions.btcfi.relatedSolutions.actionsBlinks.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.relatedSolutions.actionsBlinks.subtitle')}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer Resources */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.solutions.btcfi.developerResources.title')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('publicPages.solutions.btcfi.developerResources.description')}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f7931a]/5 border border-[#f7931a]/20 hover:bg-[#f7931a]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#f7931a]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f7931a] transition">{t('publicPages.solutions.btcfi.developerResources.sdkGuide.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.developerResources.sdkGuide.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#ffd700]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ffd700] transition">{t('publicPages.solutions.btcfi.developerResources.smartContracts.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.developerResources.smartContracts.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.solutions.btcfi.developerResources.apiReference.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.developerResources.apiReference.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-websocket"
            >
              <Globe className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.solutions.btcfi.developerResources.websocketApi.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.developerResources.websocketApi.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/cli"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20 hover:bg-[#22c55e]/10 transition group"
              data-testid="link-cli"
            >
              <Terminal className="w-5 h-5 text-[#22c55e]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#22c55e] transition">{t('publicPages.solutions.btcfi.developerResources.cliReference.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.developerResources.cliReference.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/examples"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-examples"
            >
              <ExternalLink className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">{t('publicPages.solutions.btcfi.developerResources.codeExamples.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.developerResources.codeExamples.subtitle')}</p>
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
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.solutions.btcfi.learnMore.title')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#8b5cf6] transition">{t('publicPages.solutions.btcfi.learnMore.defiMastery.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.learnMore.defiMastery.subtitle')}</p>
              </div>
            </div>
          </Link>
          <Link 
            href="/learn/intro-to-defi"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-intro-defi"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.solutions.btcfi.learnMore.gettingStarted')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f7931a]/20 flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-[#f7931a]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#f7931a] transition">{t('publicPages.solutions.btcfi.learnMore.introToDefi.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.btcfi.learnMore.introToDefi.subtitle')}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">{t('publicPages.solutions.btcfi.cta.title')}</h2>
          <p className="text-gray-400 mb-8">
            {t('publicPages.solutions.btcfi.cta.description')}
          </p>
          <Link 
            href="/developers/docs"
            className="text-[#f7931a] hover:text-white transition-colors border-b border-[#f7931a] hover:border-white pb-1"
            data-testid="link-btcfi-guide"
          >
            {t('publicPages.solutions.btcfi.cta.link')} <ArrowLeft className="w-4 h-4 inline-block rotate-180 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
