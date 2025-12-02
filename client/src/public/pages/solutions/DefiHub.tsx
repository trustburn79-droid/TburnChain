import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Layers, ArrowLeft, ArrowLeftRight, HandCoins, Droplets, Sprout,
  Check, TrendingUp, Percent, Users, BarChart3, Zap, Wallet,
  BookOpen, Code, FileText, Terminal, ExternalLink, Globe,
  CreditCard, Coins, Landmark, Bitcoin, Lock, Sparkles, ArrowRight
} from "lucide-react";
import { usePublicDefiSummary } from "../../hooks/use-public-data";

function DefiHeroStats() {
  const { t } = useTranslation();
  const { data: defiResponse } = usePublicDefiSummary();
  const defi = defiResponse?.data;
  
  const heroStats = [
    { value: defi?.tvl ?? "$1.24B+", label: t('publicPages.solutions.defiHub.stats.tvl'), color: "#3b82f6", borderColor: "border-[#3b82f6]" },
    { value: defi?.volume24h ?? "$245M+", label: t('publicPages.solutions.defiHub.stats.volume24h'), color: "#00f0ff", borderColor: "border-[#00f0ff]" },
    { value: defi?.activeLPs != null ? defi.activeLPs.toLocaleString() : "12,847", label: t('publicPages.solutions.defiHub.stats.activeLPs'), color: "#7000ff", borderColor: "border-[#7000ff]" },
    { value: defi?.stakingApy ?? "18.5%", label: t('publicPages.solutions.defiHub.stats.avgApy'), color: "#10b981", borderColor: "border-[#10b981]" }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
      {heroStats.map((stat, idx) => (
        <div key={idx} className={`spotlight-card p-4 rounded-xl text-center border-b-2 ${stat.borderColor}`} data-testid={`stat-defi-${idx}`}>
          <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function DefiHub() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const dexFeatures = [
    t('publicPages.solutions.defiHub.dex.feature1'),
    t('publicPages.solutions.defiHub.dex.feature2'),
    t('publicPages.solutions.defiHub.dex.feature3')
  ];

  const boostTiers = [
    { name: t('publicPages.solutions.defiHub.boostTiers.standard.name'), multiplier: "1.0x", requirement: t('publicPages.solutions.defiHub.boostTiers.standard.requirement'), highlight: false },
    { name: t('publicPages.solutions.defiHub.boostTiers.mid.name'), multiplier: "1.5x", requirement: t('publicPages.solutions.defiHub.boostTiers.mid.requirement'), highlight: false, color: "#3b82f6" },
    { name: t('publicPages.solutions.defiHub.boostTiers.max.name'), multiplier: "2.5x", requirement: t('publicPages.solutions.defiHub.boostTiers.max.requirement'), highlight: true, color: "#00f0ff" }
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#3b82f6]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-[#10b981]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/solutions/token-extensions"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#3b82f6] mb-6 transition-colors group"
            data-testid="link-back-solutions"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.common.backToSolutions')}
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/5 text-[#3b82f6] text-xs">
            <Layers className="w-4 h-4" /> {t('publicPages.solutions.defiHub.tag')}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.solutions.defiHub.title')} <br />
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#3b82f6] to-[#00ff9d] bg-clip-text text-transparent">
              {t('publicPages.solutions.defiHub.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
            {t('publicPages.solutions.defiHub.subtitle')}
          </p>
          
          <DefiHeroStats />
        </div>
      </section>

      {/* Concentrated Liquidity DEX */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-2xl p-8 border border-[#3b82f6]/20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff]">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <h2 className="text-3xl font-bold text-white">{t('publicPages.solutions.defiHub.dex.title')}</h2>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {t('publicPages.solutions.defiHub.dex.description')}
              </p>
              <ul className="space-y-3 mb-8">
                {dexFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-[#00f0ff]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/developers/quickstart">
                <button 
                  className="bg-[#00f0ff] text-black px-6 py-3 rounded-lg font-bold hover:bg-cyan-400 transition flex items-center gap-2"
                  data-testid="button-start-trading"
                >
                  {t('publicPages.solutions.defiHub.buttons.startTrading')} <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            <div className="spotlight-card p-6 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#7000ff]" />
                  <span className="font-bold text-white">TBURN / USDT</span>
                </div>
                <span className="text-green-400">+5.2%</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('publicPages.solutions.defiHub.dex.price')}</span>
                  <span className="text-white font-mono">$12.45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('publicPages.solutions.defiHub.dex.liquidity')}</span>
                  <span className="text-white font-mono">$128.5M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('publicPages.solutions.defiHub.dex.volume24h')}</span>
                  <span className="text-white font-mono">$45.2M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lending & Staking */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Collateralized Lending */}
          <div className="spotlight-card rounded-2xl p-8 group" data-testid="card-lending">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#7000ff]/10 flex items-center justify-center text-[#7000ff] border border-[#7000ff]/20">
                <HandCoins className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-[#7000ff] border border-[#7000ff]/30 px-2 py-1 rounded">{t('publicPages.solutions.defiHub.lending.maxLtv')}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('publicPages.solutions.defiHub.lending.title')}</h3>
            <p className="text-gray-400 text-sm mb-6">
              {t('publicPages.solutions.defiHub.lending.description')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-white/5">
                <span className="text-gray-400">{t('publicPages.solutions.defiHub.lending.tburnLtv')}</span>
                <span className="text-white font-bold">75%</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-white/5">
                <span className="text-gray-400">{t('publicPages.solutions.defiHub.lending.stablecoinLtv')}</span>
                <span className="text-white font-bold">80%</span>
              </div>
            </div>
          </div>

          {/* Liquid Staking */}
          <div className="spotlight-card rounded-2xl p-8 group" data-testid="card-staking">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20">
                <Droplets className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-[#10b981] border border-[#10b981]/30 px-2 py-1 rounded">{t('publicPages.solutions.defiHub.staking.apy')}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('publicPages.solutions.defiHub.staking.title')}</h3>
            <p className="text-gray-400 text-sm mb-6">
              {t('publicPages.solutions.defiHub.staking.description')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-white/5">
                <span className="text-gray-400">{t('publicPages.solutions.defiHub.staking.exchangeRate')}</span>
                <span className="text-white font-bold">1 TBURN = 1.05 sTBURN</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-white/5">
                <span className="text-gray-400">{t('publicPages.solutions.defiHub.staking.rewardCycle')}</span>
                <span className="text-white font-bold">{t('publicPages.solutions.defiHub.staking.everyEpoch')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yield Farming */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
          
          <div className="mb-8">
            <span className="text-[#00f0ff] text-sm font-bold uppercase tracking-widest mb-2 block">
              <Sprout className="w-4 h-4 inline-block mr-2" />
              {t('publicPages.solutions.defiHub.yieldFarming.tag')}
            </span>
            <h2 className="text-3xl font-bold text-white">{t('publicPages.solutions.defiHub.yieldFarming.title')}</h2>
            <p className="text-gray-400 mt-2">{t('publicPages.solutions.defiHub.yieldFarming.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {boostTiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl ${tier.highlight ? 'bg-gradient-to-br from-[#00f0ff]/20 to-[#3b82f6]/20 border border-[#00f0ff]/50' : 'bg-black/40 border border-white/5'}`}
                style={tier.color && !tier.highlight ? { borderColor: `${tier.color}30` } : {}}
              >
                <div className={`text-xs mb-1 ${tier.color ? `text-[${tier.color}]` : 'text-gray-400'}`} style={{ color: tier.color }}>
                  {tier.name}
                </div>
                <div className="text-xl font-bold text-white">{tier.multiplier}</div>
                <div className="text-xs text-gray-500 mt-2">{tier.requirement}</div>
              </div>
            ))}
          </div>
          
          <Link href="/learn/defi-mastery">
            <button 
              className="mt-10 border border-[#00f0ff] text-[#00f0ff] px-8 py-3 rounded-lg hover:bg-[#00f0ff]/10 transition"
              data-testid="button-view-farms"
            >
              {t('publicPages.solutions.defiHub.buttons.viewAllFarms')}
            </button>
          </Link>
        </div>
      </section>

      {/* Related Solutions */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.common.relatedSolutions')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('publicPages.solutions.defiHub.relatedSolutions.description')}
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/solutions/btcfi"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f7931a]/5 border border-[#f7931a]/20 hover:bg-[#f7931a]/10 transition group"
              data-testid="link-btcfi"
            >
              <Bitcoin className="w-5 h-5 text-[#f7931a]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f7931a] transition">{t('publicPages.solutions.defiHub.relatedSolutions.btcfi.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.btcfi.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/cross-chain-bridge"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-bridge"
            >
              <ArrowLeftRight className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.solutions.defiHub.relatedSolutions.bridge.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.bridge.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/token-extensions"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-token-extensions"
            >
              <Coins className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.solutions.defiHub.relatedSolutions.tokenExtensions.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.tokenExtensions.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/wallets"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
              data-testid="link-wallets"
            >
              <Wallet className="w-5 h-5 text-[#10b981]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#10b981] transition">{t('publicPages.solutions.defiHub.relatedSolutions.wallets.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.wallets.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/payments"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-payments"
            >
              <CreditCard className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">{t('publicPages.solutions.defiHub.relatedSolutions.payments.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.payments.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/financial"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
              data-testid="link-financial"
            >
              <Landmark className="w-5 h-5 text-[#ffd700]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ffd700] transition">{t('publicPages.solutions.defiHub.relatedSolutions.financial.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.financial.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/permissioned"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/10 transition group"
              data-testid="link-permissioned"
            >
              <Lock className="w-5 h-5 text-[#8b5cf6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#8b5cf6] transition">{t('publicPages.solutions.defiHub.relatedSolutions.permissioned.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.permissioned.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/solutions/ai-features"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ec4899]/5 border border-[#ec4899]/20 hover:bg-[#ec4899]/10 transition group"
              data-testid="link-ai-features"
            >
              <Sparkles className="w-5 h-5 text-[#ec4899]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ec4899] transition">{t('publicPages.solutions.defiHub.relatedSolutions.aiFeatures.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.relatedSolutions.aiFeatures.subtitle')}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer Resources */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.common.developerResources')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('publicPages.solutions.defiHub.developerResources.description')}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#3b82f6]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#3b82f6] transition">{t('publicPages.solutions.defiHub.developerResources.sdkGuide.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.developerResources.sdkGuide.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.solutions.defiHub.developerResources.smartContracts.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.developerResources.smartContracts.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.solutions.defiHub.developerResources.apiReference.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.developerResources.apiReference.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition group"
              data-testid="link-websocket"
            >
              <Globe className="w-5 h-5 text-[#10b981]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#10b981] transition">{t('publicPages.solutions.defiHub.developerResources.websocket.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.developerResources.websocket.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/cli"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/20 hover:bg-[#f59e0b]/10 transition group"
              data-testid="link-cli"
            >
              <Terminal className="w-5 h-5 text-[#f59e0b]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f59e0b] transition">{t('publicPages.solutions.defiHub.developerResources.cli.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.developerResources.cli.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/examples"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ec4899]/5 border border-[#ec4899]/20 hover:bg-[#ec4899]/10 transition group"
              data-testid="link-examples"
            >
              <ExternalLink className="w-5 h-5 text-[#ec4899]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ec4899] transition">{t('publicPages.solutions.defiHub.developerResources.examples.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.developerResources.examples.subtitle')}</p>
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
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.common.learnMoreSection')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#8b5cf6] transition">{t('publicPages.solutions.defiHub.learnPages.defiMastery.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.learnPages.defiMastery.subtitle')}</p>
              </div>
            </div>
          </Link>
          <Link 
            href="/learn/intro-to-defi"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-intro-defi"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.solutions.defiHub.learnPages.gettingStarted')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#3b82f6] transition">{t('publicPages.solutions.defiHub.learnPages.introToDefi.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.solutions.defiHub.learnPages.introToDefi.subtitle')}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">{t('publicPages.solutions.defiHub.cta.title')}</h2>
          <p className="text-gray-400 mb-8">
            {t('publicPages.solutions.defiHub.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/developers/quickstart">
              <button 
                className="bg-[#3b82f6] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                data-testid="button-launch-defi"
              >
                <Zap className="w-4 h-4" /> {t('publicPages.solutions.defiHub.cta.launchApp')}
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="border border-white/20 text-white px-8 py-3 rounded-lg hover:bg-white/5 transition flex items-center justify-center gap-2"
                data-testid="button-view-docs"
              >
                <BookOpen className="w-4 h-4" /> {t('publicPages.solutions.defiHub.cta.viewDocs')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
