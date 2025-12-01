import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Landmark,
  Building2,
  TrendingUp,
  ArrowLeftRight,
  Shield,
  Zap,
  Percent,
  Users
} from "lucide-react";

const coreServices = [
  {
    icon: Building2,
    iconColor: "#7000ff",
    title: "Digital Banking Infrastructure",
    desc: "Provide deposits, loans, and remittance services on blockchain. Start financial services instantly without complex legacy systems."
  },
  {
    icon: TrendingUp,
    iconColor: "#00f0ff",
    title: "DeFi Protocols",
    desc: (
      <>
        Generate profits through lending, borrowing, and liquidity provision. Smart contract-based automated finance with <span className="text-white font-bold">zero slippage</span>.
      </>
    )
  },
  {
    icon: ArrowLeftRight,
    iconColor: "#00ff9d",
    title: "Payment Gateway",
    desc: (
      <>
        Payment system supporting both crypto and fiat. <span className="text-white font-bold">95% fee reduction</span> compared to Visa/Mastercard networks.
      </>
    )
  },
  {
    icon: Shield,
    iconColor: "#ff0055",
    title: "Regulatory Compliance",
    desc: "Automate AML/CTF, KYC, and tax reporting. Built-in compliance tools ensure your dApp meets global financial regulations."
  }
];

const stats = [
  {
    icon: Zap,
    iconColor: "#ffd700",
    value: "$2.5B+",
    label: "Total Value Locked (TVL)"
  },
  {
    icon: Percent,
    iconColor: "#00f0ff",
    value: "8.5%",
    label: "Average Staking Yield (APY)"
  },
  {
    icon: Users,
    iconColor: "#7000ff",
    value: "250K+",
    label: "Daily Active Users"
  }
];

const realCases = [
  {
    initial: "N",
    name: "NeoBank A",
    type: "Southeast Asian Digital Bank",
    quote: "TBurn Chain-based digital banking acquired 1 million customers in 6 months. Operational costs reduced by 70% compared to traditional banking.",
    stats: [
      { label: "1M+ Customers", color: "#7000ff" },
      { label: "-70% Costs", color: "#7000ff" }
    ],
    gradient: "from-[#7000ff]/10"
  },
  {
    initial: "D",
    name: "DeFi Protocol B",
    type: "Global Lending Platform",
    quote: "Instant loan execution with 1-second block time. Achieved TVL $800M with zero liquidations thanks to real-time collateral monitoring.",
    stats: [
      { label: "$800M TVL", color: "#00f0ff" },
      { label: "0 Liquidations", color: "#00f0ff" }
    ],
    gradient: "from-[#00f0ff]/10"
  }
];

const buildingSteps = [
  {
    step: 1,
    color: "#00f0ff",
    textColor: "black",
    title: "Select Financial Service",
    desc: "Choose a service that fits your business among digital banking, DeFi protocols, and payment gateways."
  },
  {
    step: 2,
    color: "#7000ff",
    textColor: "white",
    title: "Check Regulatory Requirements",
    desc: "Check financial regulations in operating countries and set automatic compliance with TBurn Chain tools."
  },
  {
    step: 3,
    color: "#00ff9d",
    textColor: "black",
    title: "Deploy Smart Contracts",
    desc: "Template contracts or custom development. TBurn Chain security audit team provides free review."
  },
  {
    step: 4,
    color: "#ffd700",
    textColor: "black",
    title: "Service Launch & Marketing",
    desc: "Register on TBurn Chain Marketplace. Selected as official recommended service at 60%+ trust score."
  }
];

export default function Financial() {
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
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Landmark className="w-4 h-4" /> FINANCIAL_LAYER_1
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Financial{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Infrastructure
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            Build institutional-grade financial applications with TBurn Chain. <br />
            Experience 100,000 TPS speed and zero-knowledge privacy for next-gen banking.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
              style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
              data-testid="button-build"
            >
              Start Building
            </button>
            <Link href="/learn/whitepaper">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-whitepaper"
              >
                Read Whitepaper
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Financial Services Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Core Financial Services</h2>
            <p className="text-gray-400">Enterprise-grade modules for the future of money.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-white/10"
                  data-testid={`card-service-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${service.iconColor}10`,
                      border: `1px solid ${service.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: service.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center group"
                  data-testid={`card-stat-${idx}`}
                >
                  <Icon 
                    className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform" 
                    style={{ color: stat.iconColor }}
                  />
                  <div className="text-4xl font-bold text-white mb-2 font-mono">{stat.value}</div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real Cases Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Real Cases</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {realCases.map((story, idx) => (
              <div 
                key={idx}
                className={`spotlight-card rounded-xl p-8 border border-white/10 bg-gradient-to-br ${story.gradient} to-transparent`}
                data-testid={`card-case-${idx}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-bold">
                    {story.initial}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{story.name}</h4>
                    <p className="text-xs text-gray-400">{story.type}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">"{story.quote}"</p>
                <div className="flex gap-4 text-sm font-mono flex-wrap">
                  {story.stats.map((stat, i) => (
                    <div 
                      key={i}
                      className="bg-black/40 px-3 py-1 rounded"
                      style={{ 
                        border: `1px solid ${stat.color}30`,
                        color: stat.color
                      }}
                    >
                      {stat.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building Financial Infrastructure Section */}
      <section 
        className="py-20 px-6"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(112,0,255,0.05))" }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Building Financial Infrastructure</h2>
          
          <div className="space-y-4">
            {buildingSteps.map((step, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 flex items-start gap-6 group hover:bg-white/5 transition-colors"
                data-testid={`card-step-${step.step}`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: step.color,
                    color: step.textColor
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
