import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  ShoppingBag,
  CreditCard,
  Package,
  Gift,
  PieChart,
  Code
} from "lucide-react";
import { SiShopify, SiWordpress } from "react-icons/si";

const coreFeatures = [
  {
    icon: CreditCard,
    iconColor: "#7000ff",
    title: "Crypto Payment Gateway",
    desc: (
      <>
        Accept instant payments in TBURN, USDT, USDC. Reduce transaction fees from standard 2-3% to blockchain's <span className="text-white font-bold">0.1%</span>.
      </>
    )
  },
  {
    icon: Package,
    iconColor: "#00f0ff",
    title: "NFT Inventory Management",
    desc: "Mint each product as a unique NFT for real-time inventory tracking. Eliminate counterfeits and ensure supply chain transparency from factory to customer."
  },
  {
    icon: Gift,
    iconColor: "#00ff9d",
    title: "Token Loyalty Program",
    desc: "Reward customers with 1-5% of purchase value in brand tokens. Tokens can be redeemed for discounts or traded on the open market."
  },
  {
    icon: PieChart,
    iconColor: "#ffd700",
    title: "Real-time Sales Analytics",
    desc: "All transaction data is stored on-chain for immutable, real-time analysis of revenue streams, inventory levels, and customer behavior."
  }
];

const integrationPlatforms = [
  {
    icon: SiShopify,
    iconColor: "#00ff9d",
    title: "Shopify",
    desc: "One-click installation. Seamless checkout integration.",
    status: "Ready",
    statusColor: "#00ff9d"
  },
  {
    icon: SiWordpress,
    iconColor: "#ffffff",
    title: "WooCommerce",
    desc: "Official WordPress plugin. Supports millions of stores.",
    status: "Ready",
    statusColor: "#ffffff"
  },
  {
    icon: Code,
    iconColor: "#00f0ff",
    title: "Custom API",
    desc: "RESTful API for custom-built e-commerce solutions.",
    status: "SDK Available",
    statusColor: "#00f0ff"
  }
];

const successStories = [
  {
    initial: "A",
    name: "Fashion Brand A",
    type: "International Retailer",
    quote: "Adopting TBurn payments increased our international sales by 300%. We saved over $50k annually in credit card processing fees.",
    stats: [
      { label: "+$200k/mo Volume", color: "#7000ff" },
      { label: "98% Fee Savings", color: "#7000ff" }
    ],
    gradient: "from-[#7000ff]/10"
  },
  {
    initial: "B",
    name: "Resale Platform B",
    type: "Luxury Goods Marketplace",
    quote: "By minting NFTs for every luxury item, we completely eliminated counterfeit issues. Customer trust has never been higher.",
    stats: [
      { label: "50k+ NFTs Minted", color: "#00f0ff" },
      { label: "0% Counterfeits", color: "#00f0ff" }
    ],
    gradient: "from-[#00f0ff]/10"
  }
];

const integrationSteps = [
  {
    step: 1,
    title: "Get API Key",
    desc: "Sign up for a merchant account and generate your API key.",
    code: null
  },
  {
    step: 2,
    title: "Install SDK",
    desc: "Add our library to your frontend or backend.",
    code: "npm install @tburn/commerce-sdk"
  },
  {
    step: 3,
    title: "Add Payment Button",
    desc: "Drop in the checkout component.",
    code: null
  }
];

export default function Commerce() {
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
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <ShoppingBag className="w-4 h-4" /> COMMERCE_INFRASTRUCTURE
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Commerce{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              Solutions
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Revolutionize e-commerce with blockchain. <br />
            Integrate secure payments, NFT inventory, and token loyalty programs effortlessly.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
              style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
              data-testid="button-plugin"
            >
              Install Plugin
            </button>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                View API Docs
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Commerce Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Core Commerce Features</h2>
            <p className="text-gray-400">Powerful tools for modern merchants.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, idx) => {
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

      {/* Integration Platforms Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Integration Platforms</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {integrationPlatforms.map((platform, idx) => {
              const Icon = platform.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-8 text-center group"
                  data-testid={`card-platform-${idx}`}
                >
                  <Icon 
                    className="w-12 h-12 mx-auto mb-6 group-hover:scale-110 transition-transform" 
                    style={{ color: platform.iconColor }}
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{platform.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{platform.desc}</p>
                  <span 
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ 
                      border: `1px solid ${platform.statusColor}30`,
                      color: platform.statusColor
                    }}
                  >
                    {platform.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {successStories.map((story, idx) => (
              <div 
                key={idx}
                className={`spotlight-card rounded-xl p-8 border border-white/10 bg-gradient-to-br ${story.gradient} to-transparent`}
                data-testid={`card-story-${idx}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-xl">
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

      {/* Integration Guide Section */}
      <section 
        className="py-20 px-6"
        style={{ background: "linear-gradient(to right, rgba(112,0,255,0.1), rgba(0,240,255,0.1))" }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Integration Guide</h2>
          
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            {integrationSteps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-black/60 p-4 rounded-lg border border-white/10"
                data-testid={`card-step-${step.step}`}
              >
                <div className="flex gap-4 items-center">
                  <span className="w-8 h-8 rounded-full bg-[#00f0ff] text-black flex items-center justify-center font-bold shrink-0">
                    {step.step}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{step.title}</h4>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                    {step.code && (
                      <div 
                        className="mt-2 p-3 rounded-lg font-mono text-xs text-gray-400 overflow-x-auto"
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

          <div className="mt-10">
            <button 
              className="px-8 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition"
              data-testid="button-start"
            >
              Start Integration
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
