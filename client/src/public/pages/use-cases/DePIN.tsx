import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Wifi,
  Server,
  Map,
  Cpu,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Cloud,
  Radio,
  ArrowRight,
  HardDrive
} from "lucide-react";

const depinCategories = [
  {
    icon: Wifi,
    iconColor: "#00f0ff",
    title: "Wireless Networks",
    desc: "Decentralized 5G and WiFi infrastructure. Users deploy hotspots and earn tokens for providing coverage to IoT devices and mobile users."
  },
  {
    icon: Server,
    iconColor: "#7000ff",
    title: "Compute Networks",
    desc: "Distributed GPU and CPU computing power. Rent out idle hardware for AI training, rendering, and scientific computing."
  },
  {
    icon: Map,
    iconColor: "#00ff9d",
    title: "Mapping & Location",
    desc: "Crowdsourced geospatial data collection. Dashcams, drones, and mobile devices contribute to real-time mapping infrastructure."
  },
  {
    icon: Cloud,
    iconColor: "#ffd700",
    title: "Storage Networks",
    desc: "Decentralized file storage and CDN. Store and retrieve data across thousands of nodes with cryptographic verification."
  }
];

const metrics = [
  {
    value: "2.5M+",
    label: "Active Nodes",
    iconColor: "#00f0ff"
  },
  {
    value: "$850M",
    label: "Protocol Revenue",
    iconColor: "#7000ff"
  },
  {
    value: "150+",
    label: "Countries Covered",
    iconColor: "#00ff9d"
  }
];

const features = [
  {
    icon: Zap,
    title: "Proof of Coverage",
    desc: "Cryptographic verification that physical infrastructure exists and operates correctly"
  },
  {
    icon: Shield,
    title: "Slashing Protection",
    desc: "Staked collateral ensures reliable operation and penalizes malicious actors"
  },
  {
    icon: Users,
    title: "Community Governance",
    desc: "Token holders vote on protocol upgrades, rewards, and expansion zones"
  },
  {
    icon: TrendingUp,
    title: "Dynamic Rewards",
    desc: "Earn more in underserved areas where coverage is most valuable"
  }
];

export default function DePIN() {
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Radio className="w-4 h-4" /> DECENTRALIZED_INFRASTRUCTURE
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
              DePIN
            </span>{" "}
            Networks
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Build and operate Decentralized Physical Infrastructure Networks on TBurn Chain.
            Reward contributors, verify coverage, and scale globally.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
              style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
              data-testid="button-deploy"
            >
              Deploy Infrastructure
            </button>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                Protocol Docs
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-b border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {metrics.map((metric, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-8 text-center"
                data-testid={`card-metric-${idx}`}
              >
                <div 
                  className="text-4xl font-bold mb-2 font-mono"
                  style={{ color: metric.iconColor }}
                >
                  {metric.value}
                </div>
                <p className="text-sm text-gray-400">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Infrastructure Categories</h2>
            <p className="text-gray-400">Deploy physical infrastructure and earn rewards.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {depinCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-white/10"
                  data-testid={`card-category-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${category.iconColor}10`,
                      border: `1px solid ${category.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: category.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{category.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{category.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Protocol Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#00f0ff] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center flex-shrink-0">
                <HardDrive className="w-8 h-8 text-[#00f0ff]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Hardware Requirements</h3>
                <p className="text-gray-400 mb-4">
                  Start earning with consumer-grade hardware. Our protocol supports a wide range of devices 
                  from Raspberry Pi to enterprise servers. GPU miners can repurpose equipment for compute tasks.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    <span>Minimum: 4GB RAM, stable internet connection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    <span>Recommended: 16GB RAM, dedicated IP, SSD storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    <span>GPU tasks: NVIDIA RTX 3060 or equivalent</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#00f0ff]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(112,0,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-white mb-4">Join the Network</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Deploy infrastructure, contribute to decentralization, and earn rewards.
              Get started with our easy setup guides and community support.
            </p>
            <Link href="/app">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition"
                style={{ boxShadow: "0 0 20px rgba(0,240,255,0.3)" }}
                data-testid="button-get-started"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
