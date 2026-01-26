import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  FileCode, 
  FileText, 
  AlertTriangle, 
  DollarSign, 
  TrendingDown, 
  UserX,
  Check,
  Zap,
  Timer,
  Box,
  Server,
  Brain,
  Cpu,
  Terminal,
  ShieldCheck,
  Lock,
  Key,
  Boxes,
  Coins,
  Gamepad2,
  Link as LinkIcon,
  Sparkles,
  Wallet,
  Target,
  Layers,
  RefreshCw,
  Database,
  Rocket,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function Whitepaper() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const trustCrisis = [
    {
      icon: AlertTriangle,
      title: t('publicPages.learn.whitepaper.trustCrisis.items.scams.title'),
      description: t('publicPages.learn.whitepaper.trustCrisis.items.scams.description'),
      color: "#ff2a6d",
    },
    {
      icon: DollarSign,
      title: t('publicPages.learn.whitepaper.trustCrisis.items.lost.title'),
      description: t('publicPages.learn.whitepaper.trustCrisis.items.lost.description'),
      color: "#f97316",
    },
    {
      icon: TrendingDown,
      title: t('publicPages.learn.whitepaper.trustCrisis.items.risk.title'),
      description: t('publicPages.learn.whitepaper.trustCrisis.items.risk.description'),
      color: "#f97316",
    },
    {
      icon: UserX,
      title: t('publicPages.learn.whitepaper.trustCrisis.items.investorLoss.title'),
      description: t('publicPages.learn.whitepaper.trustCrisis.items.investorLoss.description'),
      color: "#ff2a6d",
    },
  ];

  const performanceMetrics = [
    { icon: Zap, value: t('publicPages.learn.whitepaper.performance.metrics.tps.value'), label: t('publicPages.learn.whitepaper.performance.metrics.tps.label'), color: "#00f0ff" },
    { icon: Timer, value: t('publicPages.learn.whitepaper.performance.metrics.latency.value'), label: t('publicPages.learn.whitepaper.performance.metrics.latency.label'), color: "#7000ff" },
    { icon: Box, value: t('publicPages.learn.whitepaper.performance.metrics.blockTime.value'), label: t('publicPages.learn.whitepaper.performance.metrics.blockTime.label'), color: "#00ff9d" },
    { icon: Server, value: t('publicPages.learn.whitepaper.performance.metrics.nodes.value'), label: t('publicPages.learn.whitepaper.performance.metrics.nodes.label'), color: "#ffd700" },
  ];

  const aiLayers = [
    {
      icon: Brain,
      title: t('publicPages.learn.whitepaper.aiLayers.items.strategic.title'),
      model: t('publicPages.learn.whitepaper.aiLayers.items.strategic.model'),
      latency: t('publicPages.learn.whitepaper.aiLayers.items.strategic.latency'),
      description: t('publicPages.learn.whitepaper.aiLayers.items.strategic.description'),
      color: "#3b82f6",
    },
    {
      icon: Cpu,
      title: t('publicPages.learn.whitepaper.aiLayers.items.tactical.title'),
      model: t('publicPages.learn.whitepaper.aiLayers.items.tactical.model'),
      latency: t('publicPages.learn.whitepaper.aiLayers.items.tactical.latency'),
      description: t('publicPages.learn.whitepaper.aiLayers.items.tactical.description'),
      color: "#a855f7",
    },
    {
      icon: Terminal,
      title: t('publicPages.learn.whitepaper.aiLayers.items.operational.title'),
      model: t('publicPages.learn.whitepaper.aiLayers.items.operational.model'),
      latency: t('publicPages.learn.whitepaper.aiLayers.items.operational.latency'),
      description: t('publicPages.learn.whitepaper.aiLayers.items.operational.description'),
      color: "#22c55e",
    },
  ];

  const quantumSecurity = [
    {
      icon: Lock,
      title: t('publicPages.learn.whitepaper.quantumSecurity.items.crystals.title'),
      description: t('publicPages.learn.whitepaper.quantumSecurity.items.crystals.description'),
    },
    {
      icon: Key,
      title: t('publicPages.learn.whitepaper.quantumSecurity.items.hybrid.title'),
      description: t('publicPages.learn.whitepaper.quantumSecurity.items.hybrid.description'),
    },
  ];

  const coreModules = [
    {
      icon: Coins,
      title: t('publicPages.learn.whitepaper.coreModules.items.defi.title'),
      description: t('publicPages.learn.whitepaper.coreModules.items.defi.description'),
    },
    {
      icon: Gamepad2,
      title: t('publicPages.learn.whitepaper.coreModules.items.gamefi.title'),
      description: t('publicPages.learn.whitepaper.coreModules.items.gamefi.description'),
    },
    {
      icon: LinkIcon,
      title: t('publicPages.learn.whitepaper.coreModules.items.bridge.title'),
      description: t('publicPages.learn.whitepaper.coreModules.items.bridge.description'),
    },
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
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-[#00f0ff]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <FileCode className="w-4 h-4" /> {t('publicPages.learn.whitepaper.tag')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.learn.whitepaper.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
            {t('publicPages.learn.whitepaper.heroDescription')}
            <br />
            {t('publicPages.learn.whitepaper.heroSubDescription')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/whitepaper">
              <button 
                className="px-8 py-3 rounded-lg flex items-center gap-2 font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ 
                  background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                  boxShadow: "0 0 20px rgba(112, 0, 255, 0.3)"
                }}
                data-testid="button-web-whitepaper"
              >
                <FileText className="w-4 h-4" /> {t('publicPages.learn.whitepaper.webWhitepaperButton')}
              </button>
            </a>
            <a 
              href="/technical-whitepaper"
              className="px-8 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2"
              data-testid="link-technical-whitepaper"
            >
              <FileCode className="w-4 h-4" /> {t('publicPages.learn.whitepaper.technicalWhitepaperButton')}
            </a>
          </div>
        </div>
      </section>

      {/* The Trust Crisis Section */}
      <section className="py-20 px-6 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.learn.whitepaper.trustCrisis.title')}</h2>
            <p className="text-gray-500">{t('publicPages.learn.whitepaper.trustCrisis.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustCrisis.map((item, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6"
                style={{ borderTop: `2px solid ${item.color}50` }}
                data-testid={`crisis-card-${index}`}
              >
                <item.icon className="w-8 h-8 mb-4" style={{ color: item.color }} />
                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* V4 Enterprise Performance Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="md:w-1/2">
              <div className="inline-block px-3 py-1 rounded bg-[#7000ff]/20 text-[#7000ff] text-xs font-bold mb-4 font-mono">
                {t('publicPages.learn.whitepaper.performance.badge')}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.learn.whitepaper.performance.title')}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {t('publicPages.learn.whitepaper.performance.description')}
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#00ff9d]" /> {t('publicPages.learn.whitepaper.performance.features.hybridConsensus')}
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#00ff9d]" /> {t('publicPages.learn.whitepaper.performance.features.evmCompatibility')}
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#00ff9d]" /> {t('publicPages.learn.whitepaper.performance.features.dynamicSharding')}
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 w-full">
              <div className="grid grid-cols-2 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div 
                    key={index}
                    className="p-6 rounded-lg text-center bg-gray-50 dark:bg-transparent"
                    style={{ 
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(0,0,0,0.4)"
                    }}
                    data-testid={`performance-metric-${index}`}
                  >
                    <metric.icon className="w-6 h-6 mx-auto mb-2" style={{ color: metric.color }} />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{metric.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2026 Next-Gen Technology Section */}
      <section className="py-20 px-6 relative overflow-hidden border-b border-gray-200 dark:border-white/5">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#7000ff]/20 to-[#00f0ff]/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#00ff9d]/15 to-[#f97316]/10 blur-[80px] rounded-full" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Header with Badge */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7000ff]/20 to-[#00f0ff]/20 border border-[#7000ff]/30 text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4 text-[#00f0ff]" />
              <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent">
                2026 NEXT-GEN BLOCKCHAIN
              </span>
              <Rocket className="w-4 h-4 text-[#7000ff]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              5 Core Technologies
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              혁신적인 5대 핵심 기술로 블록체인의 미래를 선도합니다
            </p>
          </div>

          {/* Performance Highlight Banner */}
          <div 
            className="mb-12 p-6 rounded-2xl text-center"
            style={{
              background: "linear-gradient(135deg, rgba(112, 0, 255, 0.1), rgba(0, 240, 255, 0.1))",
              border: "1px solid rgba(112, 0, 255, 0.3)"
            }}
          >
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-[#00ff9d]" />
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#00ff9d] to-[#00f0ff] bg-clip-text text-transparent">
                    1,900%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">TPS 향상</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-[#f97316]" />
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#f97316] to-[#ffd700] bg-clip-text text-transparent">
                    100,000+
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Peak TPS</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-[#7000ff]" />
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7000ff] to-[#a855f7] bg-clip-text text-transparent">
                    95%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">비용 절감</p>
              </div>
            </div>
          </div>

          {/* 5 Technologies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Account Abstraction */}
            <div 
              className="group p-6 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-[#00f0ff]/20 hover:border-[#00f0ff]/50 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 0 30px rgba(0, 240, 255, 0.05)" }}
              data-testid="card-aa"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-[#00f0ff]/10">
                  <Wallet className="w-6 h-6 text-[#00f0ff]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Account Abstraction</h3>
                  <span className="text-xs font-mono text-[#00f0ff]">ERC-4337</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                스마트 월렛으로 가스비 없는 트랜잭션, 소셜 로그인, 세션 키를 지원합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-[#00f0ff]/10 text-[#00f0ff]">Gasless TX</span>
                <span className="px-2 py-1 text-xs rounded bg-[#00f0ff]/10 text-[#00f0ff]">Session Keys</span>
                <span className="px-2 py-1 text-xs rounded bg-[#00f0ff]/10 text-[#00f0ff]">Social Recovery</span>
              </div>
            </div>

            {/* Intent Architecture */}
            <div 
              className="group p-6 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-[#00ff9d]/20 hover:border-[#00ff9d]/50 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 0 30px rgba(0, 255, 157, 0.05)" }}
              data-testid="card-intent"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-[#00ff9d]/10">
                  <Target className="w-6 h-6 text-[#00ff9d]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Intent Architecture</h3>
                  <span className="text-xs font-mono text-[#00ff9d]">MEV Protected</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                원하는 결과만 선언하면 최적의 솔버가 경쟁하여 실행합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-[#00ff9d]/10 text-[#00ff9d]">5+ Solvers</span>
                <span className="px-2 py-1 text-xs rounded bg-[#00ff9d]/10 text-[#00ff9d]">Batch Auction</span>
                <span className="px-2 py-1 text-xs rounded bg-[#00ff9d]/10 text-[#00ff9d]">Best Price</span>
              </div>
            </div>

            {/* ZK Rollup */}
            <div 
              className="group p-6 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-[#f97316]/20 hover:border-[#f97316]/50 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 0 30px rgba(249, 115, 22, 0.05)" }}
              data-testid="card-zk"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-[#f97316]/10">
                  <Layers className="w-6 h-6 text-[#f97316]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">ZK Rollup</h3>
                  <span className="text-xs font-mono text-[#f97316]">Layer 2</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                영지식 증명으로 95% 가스비를 절감하고 즉시 완결성을 제공합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-[#f97316]/10 text-[#f97316]">95% Gas Saved</span>
                <span className="px-2 py-1 text-xs rounded bg-[#f97316]/10 text-[#f97316]">Instant Finality</span>
                <span className="px-2 py-1 text-xs rounded bg-[#f97316]/10 text-[#f97316]">Fast Withdraw</span>
              </div>
            </div>

            {/* Restaking */}
            <div 
              className="group p-6 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-[#7000ff]/20 hover:border-[#7000ff]/50 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 0 30px rgba(112, 0, 255, 0.05)" }}
              data-testid="card-restaking"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-[#7000ff]/10">
                  <RefreshCw className="w-6 h-6 text-[#7000ff]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Restaking</h3>
                  <span className="text-xs font-mono text-[#7000ff]">AVS Rewards</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                스테이킹된 자산으로 추가 수익을 창출하며 20년 토큰노믹스를 보장합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-[#7000ff]/10 text-[#7000ff]">Extra APY</span>
                <span className="px-2 py-1 text-xs rounded bg-[#7000ff]/10 text-[#7000ff]">4 AVS Services</span>
                <span className="px-2 py-1 text-xs rounded bg-[#7000ff]/10 text-[#7000ff]">USDT/USDC</span>
              </div>
            </div>

            {/* Modular DA */}
            <div 
              className="group p-6 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-[#ffd700]/20 hover:border-[#ffd700]/50 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 0 30px rgba(255, 215, 0, 0.05)" }}
              data-testid="card-da"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-[#ffd700]/10">
                  <Database className="w-6 h-6 text-[#ffd700]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Modular DA</h3>
                  <span className="text-xs font-mono text-[#ffd700]">Multi-Provider</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                TBURN, Celestia, EigenDA 중 최적의 DA 레이어를 자동 선택합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-[#ffd700]/10 text-[#ffd700]">Auto Failover</span>
                <span className="px-2 py-1 text-xs rounded bg-[#ffd700]/10 text-[#ffd700]">100ms Latency</span>
                <span className="px-2 py-1 text-xs rounded bg-[#ffd700]/10 text-[#ffd700]">85% Cheaper</span>
              </div>
            </div>

            {/* Web2 UX Card */}
            <div 
              className="group p-6 rounded-xl bg-gradient-to-br from-[#7000ff]/5 to-[#00f0ff]/5 border border-dashed border-[#7000ff]/30 flex flex-col justify-center items-center text-center"
              data-testid="card-web2-ux"
            >
              <Sparkles className="w-10 h-10 text-[#7000ff] mb-4" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Web2-Level UX</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                블록체인의 복잡함 없이 친숙한 웹 경험을 제공합니다
              </p>
              <Link href="/developers">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#7000ff] hover:text-[#00f0ff] transition-colors cursor-pointer">
                  개발자 문서 보기 <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/learn/technical-whitepaper">
              <span 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{ 
                  background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                  boxShadow: "0 0 30px rgba(112, 0, 255, 0.4)"
                }}
                data-testid="button-tech-whitepaper"
              >
                <FileCode className="w-5 h-5" /> 기술 백서에서 자세히 보기
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Triple-Band AI Orchestration Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.learn.whitepaper.aiLayers.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.learn.whitepaper.aiLayers.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiLayers.map((layer, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8"
                style={{ border: `1px solid ${layer.color}20` }}
                data-testid={`ai-layer-${index}`}
              >
                <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
                  <layer.icon className="w-8 h-8" style={{ color: layer.color }} />
                  <span 
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: `${layer.color}10`,
                      color: layer.color
                    }}
                  >
                    {layer.latency}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{layer.title}</h3>
                <p className="text-xs mb-4 font-mono" style={{ color: layer.color }}>{layer.model}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Core Modules Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Quantum-Safe Security */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#00f0ff]" /> {t('publicPages.learn.whitepaper.quantumSecurity.title')}
              </h3>
              <div className="space-y-4">
                {quantumSecurity.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card p-5 rounded-lg flex gap-4">
                    <div className="text-[#00f0ff] text-xl">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* V4 Core Modules */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Boxes className="w-6 h-6 text-[#7000ff]" /> {t('publicPages.learn.whitepaper.coreModules.title')}
              </h3>
              <div className="space-y-4">
                {coreModules.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card p-5 rounded-lg flex gap-4">
                    <div className="text-[#7000ff] text-xl">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
