import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Coins, 
  Flame,
  Layers,
  Gavel,
  Check
} from "lucide-react";

export default function Tokenomics() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const marketStats = [
    { value: "$5.0B", label: t('publicPages.learn.tokenomics.marketStats.marketCap'), color: "#ffb800" },
    { value: "8.5B", label: t('publicPages.learn.tokenomics.marketStats.circulatingSupply'), color: "#00f0ff" },
    { value: "1.2B", label: t('publicPages.learn.tokenomics.marketStats.burned'), color: "#ff0055" },
    { value: "2.8B", label: t('publicPages.learn.tokenomics.marketStats.totalStaked'), color: "#00ff9d" },
  ];

  const tokenDistribution = [
    { percent: "30%", title: t('publicPages.learn.tokenomics.distribution.community.title'), subtitle: t('publicPages.learn.tokenomics.distribution.community.subtitle'), color: "#7000ff" },
    { percent: "23%", title: t('publicPages.learn.tokenomics.distribution.rewards.title'), subtitle: t('publicPages.learn.tokenomics.distribution.rewards.subtitle'), color: "#00f0ff" },
    { percent: "20%", title: t('publicPages.learn.tokenomics.distribution.investors.title'), subtitle: t('publicPages.learn.tokenomics.distribution.investors.subtitle'), color: "#00ff9d" },
    { percent: "15%", title: t('publicPages.learn.tokenomics.distribution.ecosystem.title'), subtitle: t('publicPages.learn.tokenomics.distribution.ecosystem.subtitle'), color: "#ffb800" },
    { percent: "12%", title: t('publicPages.learn.tokenomics.distribution.team.title'), subtitle: t('publicPages.learn.tokenomics.distribution.team.subtitle'), color: "#ff0055" },
  ];

  const burnMechanisms = [
    { percent: "70%", title: t('publicPages.learn.tokenomics.burn.transactionFees.title'), description: t('publicPages.learn.tokenomics.burn.transactionFees.description') },
    { percent: "100%", title: t('publicPages.learn.tokenomics.burn.collateralBurn.title'), description: t('publicPages.learn.tokenomics.burn.collateralBurn.description') },
    { percent: "30%", title: t('publicPages.learn.tokenomics.burn.revenueBuyback.title'), description: t('publicPages.learn.tokenomics.burn.revenueBuyback.description') },
    { percent: "50%", title: t('publicPages.learn.tokenomics.burn.slashingPenalty.title'), description: t('publicPages.learn.tokenomics.burn.slashingPenalty.description') },
  ];

  const stakingRewards = [
    { type: t('publicPages.learn.tokenomics.staking.liquidStaking'), apy: "8-10% APY" },
    { type: t('publicPages.learn.tokenomics.staking.ninetyDayLock'), apy: "15-18% APY" },
    { type: t('publicPages.learn.tokenomics.staking.yearLock'), apy: "20-25% APY" },
  ];

  const governanceFeatures = [
    t('publicPages.learn.tokenomics.governance.features.voteProtocol'),
    t('publicPages.learn.tokenomics.governance.features.approveTreasury'),
    t('publicPages.learn.tokenomics.governance.features.decideSlashing'),
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
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#ffb800]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#ffb800] mb-6">
            <Coins className="w-4 h-4" /> {t('publicPages.learn.tokenomics.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.learn.tokenomics.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('publicPages.learn.tokenomics.subtitle')}
          </p>
          
          {/* Navigation Links */}
          <div className="flex justify-center gap-4 mt-8">
            <a 
              href="/TokenSchedule" 
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ffb800] text-white font-semibold hover:opacity-90 transition-opacity"
              data-testid="link-token-schedule"
            >
              토큰스케줄
            </a>
            <a 
              href="/TokenDetails" 
              className="px-6 py-3 rounded-lg border border-[#ff6b35] text-[#ff6b35] font-semibold hover:bg-[#ff6b35]/10 transition-colors"
              data-testid="link-token-details"
            >
              토큰배분 가이드
            </a>
          </div>
        </div>
      </section>

      {/* Market Stats Section */}
      <section className="py-12 px-6 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {marketStats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`market-stat-${index}`}>
                <div className="text-3xl font-bold mb-1 font-mono" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token Cards Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* TBURN Token Card */}
            <div 
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8"
              style={{ 
                border: "1px solid rgba(255, 184, 0, 0.3)",
                background: "rgba(255, 184, 0, 0.05)"
              }}
              data-testid="card-tburn"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#ffb800]/20 flex items-center justify-center text-[#ffb800] text-2xl">
                  <Coins className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">TBURN</h3>
                  <p className="text-sm text-[#ffb800] font-mono">{t('publicPages.learn.tokenomics.tburn.type')}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-2 gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.tburn.totalSupply')}</span>
                  <span className="text-gray-900 dark:text-white font-mono">10,000,000,000</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-2 gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.tburn.decimals')}</span>
                  <span className="text-gray-900 dark:text-white font-mono">18</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-2 gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.tburn.role')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.learn.tokenomics.tburn.roleValue')}</span>
                </div>
              </div>
            </div>

            {/* Ember Token Card */}
            <div 
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-8"
              style={{ 
                border: "1px solid rgba(255, 94, 0, 0.3)",
                background: "rgba(255, 94, 0, 0.05)"
              }}
              data-testid="card-ember"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#ff5e00]/20 flex items-center justify-center text-[#ff5e00] text-2xl">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ember</h3>
                  <p className="text-sm text-[#ff5e00] font-mono">{t('publicPages.learn.tokenomics.ember.type')}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-2 gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.ember.exchangeRatio')}</span>
                  <span className="text-gray-900 dark:text-white font-mono">1 TBURN = 1,000,000 EMB</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-2 gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.ember.baseFee')}</span>
                  <span className="text-[#ff0055] font-bold">{t('publicPages.learn.tokenomics.ember.baseFeeValue')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-white/10 pb-2 gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.ember.role')}</span>
                  <span className="text-gray-900 dark:text-white">{t('publicPages.learn.tokenomics.ember.roleValue')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Distribution Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.learn.tokenomics.distributionSection.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.distributionSection.subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Donut Chart - 5 segments: 30%, 23%, 20%, 15%, 12% */}
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                {/* Community 30% - #7000ff */}
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#7000ff" 
                  strokeWidth="15" 
                  strokeDasharray="75.4 251.3" 
                  strokeDashoffset="0"
                />
                {/* Rewards 23% - #00f0ff */}
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#00f0ff" 
                  strokeWidth="15" 
                  strokeDasharray="57.8 251.3" 
                  strokeDashoffset="-75.4"
                />
                {/* Investors 20% - #00ff9d */}
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#00ff9d" 
                  strokeWidth="15" 
                  strokeDasharray="50.3 251.3" 
                  strokeDashoffset="-133.2"
                />
                {/* Ecosystem 15% - #ffb800 */}
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#ffb800" 
                  strokeWidth="15" 
                  strokeDasharray="37.7 251.3" 
                  strokeDashoffset="-183.5"
                />
                {/* Team 12% - #ff0055 */}
                <circle 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#ff0055" 
                  strokeWidth="15" 
                  strokeDasharray="30.2 251.3" 
                  strokeDashoffset="-221.2"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-gray-900 dark:text-white font-mono">10B</span>
                <span className="text-sm text-gray-500">{t('publicPages.learn.tokenomics.distributionSection.totalSupply')}</span>
              </div>
            </div>

            {/* Distribution List */}
            <div className="space-y-6">
              {tokenDistribution.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-4 flex gap-4 items-center"
                  data-testid={`distribution-item-${index}`}
                >
                  <div className="w-16 text-right font-bold text-gray-900 dark:text-white">{item.percent}</div>
                  <div className="flex-1">
                    <div className="font-bold" style={{ color: item.color }}>{item.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Burn Mechanism Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#ff0055]/10 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-[#ff0055]" /> {t('publicPages.learn.tokenomics.burnSection.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.tokenomics.burnSection.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {burnMechanisms.map((item, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 text-center"
                style={{ borderTop: "2px solid #ff0055" }}
                data-testid={`burn-mechanism-${index}`}
              >
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{item.percent}</div>
                <h4 className="text-[#ff0055] font-bold mb-2">{item.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staking & Governance Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Staking Rewards */}
            <div 
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8"
              style={{ border: "1px solid rgba(0, 255, 157, 0.2)" }}
              data-testid="card-staking"
            >
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-6 h-6 text-[#00ff9d]" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.learn.tokenomics.staking.title')}</h3>
              </div>
              <div className="space-y-4">
                {stakingRewards.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-white/5 rounded flex-wrap gap-2">
                    <span className="text-gray-900 dark:text-white">{item.type}</span>
                    <span className="text-[#00ff9d] font-bold font-mono">{item.apy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance */}
            <div 
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8"
              style={{ border: "1px solid rgba(112, 0, 255, 0.2)" }}
              data-testid="card-governance"
            >
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="w-6 h-6 text-[#7000ff]" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publicPages.learn.tokenomics.governance.title')}</h3>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                {governanceFeatures.map((feature, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <Check className="w-4 h-4 text-[#7000ff] mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
