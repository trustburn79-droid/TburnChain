import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Layers,
  Lock,
  Flame,
  Coins,
  FileCode,
  Shield,
  CheckCircle,
  TrendingDown,
  DollarSign,
  Gamepad2,
  Building
} from "lucide-react";

export default function TokenExtensions() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const featureCards = [
    {
      icon: Lock,
      iconColor: "#00f0ff",
      title: t('publicPages.solutions.tokenExtensions.features.trustRating.title'),
      desc: t('publicPages.solutions.tokenExtensions.features.trustRating.description'),
      codeInline: "transfer()",
      descContinue: t('publicPages.solutions.tokenExtensions.features.trustRating.descriptionContinue'),
      badge: t('publicPages.solutions.tokenExtensions.features.trustRating.badge'),
      badgeBg: "bg-[#00f0ff]/5",
      badgeBorder: "border-[#00f0ff]/20",
      badgeText: "text-[#00f0ff]"
    },
    {
      icon: Flame,
      iconColor: "#ff0055",
      title: t('publicPages.solutions.tokenExtensions.features.autoBurn.title'),
      desc: t('publicPages.solutions.tokenExtensions.features.autoBurn.description'),
      badge: t('publicPages.solutions.tokenExtensions.features.autoBurn.badge'),
      badgeBg: "bg-[#ff0055]/5",
      badgeBorder: "border-[#ff0055]/20",
      badgeText: "text-[#ff0055]"
    },
    {
      icon: Coins,
      iconColor: "#ffd700",
      title: t('publicPages.solutions.tokenExtensions.features.collateral.title'),
      desc: t('publicPages.solutions.tokenExtensions.features.collateral.description')
    },
    {
      icon: FileCode,
      iconColor: "#00ff9d",
      title: t('publicPages.solutions.tokenExtensions.features.metadata.title'),
      desc: t('publicPages.solutions.tokenExtensions.features.metadata.description')
    }
  ];

  const useCases = [
    {
      icon: CheckCircle,
      color: "#00ff9d",
      title: t('publicPages.solutions.tokenExtensions.useCases.verified.title'),
      desc: t('publicPages.solutions.tokenExtensions.useCases.verified.description')
    },
    {
      icon: Coins,
      color: "#00f0ff",
      title: t('publicPages.solutions.tokenExtensions.useCases.stablecoins.title'),
      desc: t('publicPages.solutions.tokenExtensions.useCases.stablecoins.description')
    },
    {
      icon: TrendingDown,
      color: "#7000ff",
      title: t('publicPages.solutions.tokenExtensions.useCases.deflationary.title'),
      desc: t('publicPages.solutions.tokenExtensions.useCases.deflationary.description')
    }
  ];

  const realExamples = [
    { 
      name: t('publicPages.solutions.tokenExtensions.examples.busd.name'), 
      icon: DollarSign, 
      iconColor: "#00ff9d", 
      badge: t('publicPages.solutions.tokenExtensions.examples.busd.badge')
    },
    { 
      name: t('publicPages.solutions.tokenExtensions.examples.bgame.name'), 
      icon: Gamepad2, 
      iconColor: "#7000ff", 
      badge: t('publicPages.solutions.tokenExtensions.examples.bgame.badge')
    },
    { 
      name: t('publicPages.solutions.tokenExtensions.examples.bprop.name'), 
      icon: Building, 
      iconColor: "#00f0ff", 
      badge: t('publicPages.solutions.tokenExtensions.examples.bprop.badge')
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Layers className="w-4 h-4" /> {t('publicPages.solutions.tokenExtensions.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.tokenExtensions.title')}{" "}
            <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.tokenExtensions.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.solutions.tokenExtensions.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a 
              href="#tbc-20"
              className="px-8 py-3 rounded-lg bg-[#7000ff] text-gray-900 dark:text-white font-bold hover:bg-purple-600 transition"
              style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
              data-testid="button-explore"
            >
              {t('publicPages.solutions.tokenExtensions.buttons.exploreBrc20')}
            </a>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition"
                data-testid="button-specs"
              >
                {t('publicPages.solutions.tokenExtensions.buttons.readSpecs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8"
                  data-testid={`card-feature-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${card.iconColor}10`,
                      border: `1px solid ${card.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: card.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{card.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {card.desc}
                    {card.codeInline && (
                      <>
                        <span className="font-mono text-gray-900 dark:text-white bg-white/10 px-1 rounded mx-1">
                          {card.codeInline}
                        </span>
                        {card.descContinue}
                      </>
                    )}
                  </p>
                  {card.badge && (
                    <div className={`p-4 rounded ${card.badgeBg} border ${card.badgeBorder} text-xs ${card.badgeText} font-mono flex items-center gap-2`}>
                      <CheckCircle className="w-4 h-4" /> {card.badge}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TBC-20 Token Standard Section */}
      <section id="tbc-20" className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.solutions.tokenExtensions.brc20.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('publicPages.solutions.tokenExtensions.brc20.subtitle')}</p>
          </div>

          <div className="space-y-8">
            {/* Trust Score Functions */}
            <div className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#7000ff]" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.solutions.tokenExtensions.brc20.trustScoreFunctions')}</h3>
              </div>
              <div 
                className="rounded-lg p-4 font-mono text-sm overflow-x-auto"
                style={{ 
                  background: "#0d0d12",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <pre className="text-gray-600 dark:text-gray-400">
                  <code>
                    <span className="text-[#ff79c6]">function</span>{" "}
                    <span className="text-[#50fa7b]">getTrustScore</span>(){" "}
                    <span className="text-[#ff79c6]">public view returns</span> (
                    <span className="text-[#8be9fd]">uint8</span>) {"{"}{"\n"}
                    {"    "}<span className="text-[#ff79c6]">return</span> trustScore;{" "}
                    <span className="text-[#6272a4]">{t('publicPages.solutions.tokenExtensions.code.comments.range')}</span>{"\n"}
                    {"}"}{"\n\n"}
                    <span className="text-[#ff79c6]">function</span>{" "}
                    <span className="text-[#50fa7b]">_beforeTokenTransfer</span>(
                    <span className="text-[#8be9fd]">address</span> from,{" "}
                    <span className="text-[#8be9fd]">address</span> to,{" "}
                    <span className="text-[#8be9fd]">uint256</span> amount){" "}
                    <span className="text-[#ff79c6]">internal override</span> {"{"}{"\n"}
                    {"    "}<span className="text-[#ff79c6]">require</span>(trustScore {">="}{" "}
                    <span className="text-[#8be9fd]">40</span>,{" "}
                    <span className="text-[#f1fa8c]">"Trust score too low"</span>);{"\n"}
                    {"    "}<span className="text-[#ff79c6]">super</span>._beforeTokenTransfer(from, to, amount);{"\n"}
                    {"}"}
                  </code>
                </pre>
              </div>
            </div>

            {/* Auto Burn Functions */}
            <div className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-6 h-6 text-[#ff0055]" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.solutions.tokenExtensions.brc20.autoBurnFunctions')}</h3>
              </div>
              <div 
                className="rounded-lg p-4 font-mono text-sm overflow-x-auto"
                style={{ 
                  background: "#0d0d12",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <pre className="text-gray-600 dark:text-gray-400">
                  <code>
                    <span className="text-[#ff79c6]">function</span>{" "}
                    <span className="text-[#50fa7b]">scheduleBurn</span>(
                    <span className="text-[#8be9fd]">uint256</span> amount,{" "}
                    <span className="text-[#8be9fd]">uint256</span> deadline){" "}
                    <span className="text-[#ff79c6]">public</span> onlyOwner {"{"}{"\n"}
                    {"    "}burnSchedule.push(BurnEvent(amount, deadline,{" "}
                    <span className="text-[#ff79c6]">false</span>));{"\n"}
                    {"}"}{"\n\n"}
                    <span className="text-[#ff79c6]">function</span>{" "}
                    <span className="text-[#50fa7b]">executeBurn</span>(){" "}
                    <span className="text-[#ff79c6]">public</span> {"{"}{"\n"}
                    {"    "}<span className="text-[#6272a4]">{t('publicPages.solutions.tokenExtensions.code.comments.autoBurn')}</span>{"\n"}
                    {"    "}<span className="text-[#ff79c6]">if</span> (block.timestamp {">"} deadline && !executed) {"{"}{"\n"}
                    {"        "}<span className="text-[#50fa7b]">_burn</span>(collateralAddress, amount);{"\n"}
                    {"    "}{"}"}{"\n"}
                    {"}"}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.solutions.tokenExtensions.useCasesSection.title')}</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {useCases.map((uc, idx) => {
                const Icon = uc.icon;
                return (
                  <div key={idx} className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${uc.color}10` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: uc.color }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{uc.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{uc.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="spotlight-card rounded-2xl p-8 border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.solutions.tokenExtensions.examplesSection.title')}</h3>
              <ul className="space-y-4 text-sm">
                {realExamples.map((ex, idx) => {
                  const Icon = ex.icon;
                  return (
                    <li key={idx} className="flex items-center justify-between p-3 rounded bg-black/40">
                      <span className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: ex.iconColor }} />
                        {ex.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">{ex.badge}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#7000ff]/10 to-[#00f0ff]/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.solutions.tokenExtensions.cta.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{t('publicPages.solutions.tokenExtensions.cta.subtitle')}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-gray-900 dark:text-white font-bold hover:bg-purple-600 transition"
                data-testid="button-console"
              >
                {t('publicPages.solutions.tokenExtensions.buttons.openConsole')}
              </button>
            </Link>
            <Link href="/developers/api">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition"
                data-testid="button-api"
              >
                {t('publicPages.solutions.tokenExtensions.buttons.viewApiDocs')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
