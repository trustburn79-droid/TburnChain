import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  CreditCard,
  Zap,
  Percent,
  Shield,
  Globe,
  TrendingUp,
  Code,
  ShoppingCart,
  Store
} from "lucide-react";

const whyChooseFeatures = [
  {
    icon: Zap,
    iconColor: "#00f0ff",
    title: "Instant Settlement",
    desc: (
      <>
        Average <span className="text-white">1-second block time</span> and 6-second finality. Experience payment speeds faster than traditional credit cards with 50,000+ TPS capacity.
      </>
    )
  },
  {
    icon: Percent,
    iconColor: "#00ff9d",
    title: "Ultra-Low Fees",
    desc: (
      <>
        <span className="text-white">$0.001 per transaction</span>. Save up to 99% compared to traditional payment gateways. Economically viable for everything from micropayments to large transfers.
      </>
    )
  },
  {
    icon: Shield,
    iconColor: "#ff0055",
    title: "Verified Tokens Only",
    desc: (
      <>
        Only tokens with a Trust Score of <span className="text-[#ff0055]">40% or higher</span> are allowed. We automatically block rug-pull tokens to protect merchants and customers.
      </>
    )
  },
  {
    icon: Globe,
    iconColor: "#ffd700",
    title: "Global Reach",
    desc: "Borderless 24/7 payment infrastructure. Multi-chain support for Ethereum, Arbitrum, and Polygon via LayerZero integration allows you to accept payments from anywhere."
  }
];

const tokenStandards = [
  {
    icon: TrendingUp,
    iconColor: "#7000ff",
    title: "Price Stability",
    points: "30 pts",
    desc: "Evaluated based on daily volatility, market cap, and liquidity pool depth.",
    scoring: [
      { label: "Volatility < 5%", value: "+30 pts", positive: true },
      { label: "Liquidity > $10M", value: "+10 pts", positive: true }
    ]
  },
  {
    icon: Code,
    iconColor: "#00f0ff",
    title: "Contract Security",
    points: "25 pts",
    desc: "Audit completion, reentrancy protection, and upgrade authority decentralization.",
    scoring: [
      { label: "2+ Audits", value: "+25 pts", positive: true },
      { label: "Critical Bug", value: "Block", positive: false }
    ]
  },
  {
    icon: CreditCard,
    iconColor: "#00ff9d",
    title: "Adoption & Usage",
    points: "20 pts",
    desc: "Number of merchants, monthly transaction volume, and average payment size.",
    scoring: [
      { label: "100+ Merchants", value: "High", positive: true },
      { label: "10k+ Tx/Mo", value: "High", positive: true }
    ]
  }
];

const solutionTypes = [
  {
    icon: ShoppingCart,
    iconColor: "#7000ff",
    title: "Online Commerce",
    desc: "Easy checkout integration for shops. 5-min setup.",
    tags: "SDK • Plugins"
  },
  {
    icon: Store,
    iconColor: "#00f0ff",
    title: "Offline POS",
    desc: "Instant payments via QR code in physical stores.",
    tags: "App • NFC"
  },
  {
    icon: Globe,
    iconColor: "#ffd700",
    title: "Global Remittance",
    desc: "Cross-border transfers with 99% lower fees.",
    tags: "P2P • B2B"
  }
];

const integrationSteps = [
  {
    step: 1,
    title: "Issue API Key",
    desc: "Get your credentials from the developer dashboard.",
    code: "curl -X POST https://api.tburn.io/v1/auth/apikey"
  },
  {
    step: 2,
    title: "Install SDK",
    desc: "Available for JS, Python, and PHP.",
    code: "npm install @tburn/payments-sdk"
  },
  {
    step: 3,
    title: "Add Payment Button",
    desc: "Embed the checkout button with just one line.",
    code: '<burn-pay amount="100" currency="USD" />'
  },
  {
    step: 4,
    title: "Configure Webhooks",
    desc: "Receive instant server notifications upon payment completion.",
    code: null
  }
];

export default function Payments() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

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
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <CreditCard className="w-4 h-4" /> {t('publicPages.solutions.payments.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.solutions.payments.title')}{" "}
            <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent">
              {t('publicPages.solutions.payments.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.solutions.payments.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-api-key"
              >
                Get API Key
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                View Docs
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose TBurn Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Why Choose TBurn?</h2>
            <p className="text-gray-400">Optimized infrastructure for global commerce.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {whyChooseFeatures.map((feature, idx) => {
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

      {/* Payment Token Standards Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Payment Token Standards</h2>
          
          <div className="space-y-6">
            {tokenStandards.map((standard, idx) => {
              const Icon = standard.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center"
                  data-testid={`card-standard-${idx}`}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${standard.iconColor}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: standard.iconColor }} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {standard.title}{" "}
                      <span 
                        className="text-sm font-mono ml-2"
                        style={{ color: standard.iconColor }}
                      >
                        ({standard.points})
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm">{standard.desc}</p>
                  </div>
                  <div className="w-full md:w-auto bg-black/40 p-4 rounded border border-white/10 text-xs text-gray-300 font-mono">
                    {standard.scoring.map((score, i) => (
                      <div key={i} className={`flex justify-between gap-4 ${i < standard.scoring.length - 1 ? "mb-1" : ""}`}>
                        <span>{score.label}</span>
                        <span className={score.positive ? "text-[#00ff9d]" : "text-gray-500"}>
                          {score.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution Types Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Solution Types</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {solutionTypes.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center border border-white/10 group"
                  data-testid={`card-solution-${idx}`}
                >
                  <Icon 
                    className="w-10 h-10 mx-auto mb-6 group-hover:scale-110 transition-transform" 
                    style={{ color: solution.iconColor }}
                  />
                  <h3 className="text-xl font-bold text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{solution.desc}</p>
                  <div 
                    className="text-xs font-mono px-2 py-1 rounded inline-block"
                    style={{ 
                      color: solution.iconColor,
                      backgroundColor: `${solution.iconColor}10`
                    }}
                  >
                    {solution.tags}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Guide Section */}
      <section 
        className="py-20 px-6"
        style={{ background: "linear-gradient(to right, rgba(112,0,255,0.1), rgba(0,240,255,0.1))" }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Integration Guide</h2>
          <div className="space-y-6">
            {integrationSteps.map((step, idx) => (
              <div 
                key={idx}
                className="spotlight-card p-6 rounded-xl border border-white/10"
                data-testid={`card-step-${step.step}`}
              >
                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{step.desc}</p>
                    {step.code && (
                      <div 
                        className="p-4 rounded-lg font-mono text-sm text-gray-400 overflow-x-auto"
                        style={{ 
                          backgroundColor: "#0d0d12",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}
                      >
                        {step.code}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
