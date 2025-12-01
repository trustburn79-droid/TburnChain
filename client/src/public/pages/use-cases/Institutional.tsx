import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Building2,
  Shield,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Users,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle,
  Landmark
} from "lucide-react";

const paymentFeatures = [
  {
    icon: Zap,
    iconColor: "#ffd700",
    title: "Real-Time Gross Settlement",
    desc: "Instant, final settlement of high-value transactions. No batch processing delays or settlement risk."
  },
  {
    icon: Globe,
    iconColor: "#00f0ff",
    title: "Cross-Border Payments",
    desc: "Send payments to 190+ countries in seconds. Automatic FX conversion with competitive rates."
  },
  {
    icon: Lock,
    iconColor: "#7000ff",
    title: "Compliant Infrastructure",
    desc: "Full KYC/AML integration, sanctions screening, and regulatory reporting built into every transaction."
  },
  {
    icon: FileText,
    iconColor: "#00ff9d",
    title: "Smart Contract Automation",
    desc: "Programmable payment conditions, escrow, and multi-party settlements with trustless execution."
  }
];

const metrics = [
  {
    value: "$12B+",
    label: "Daily Volume",
    iconColor: "#ffd700"
  },
  {
    value: "0.02%",
    label: "Transaction Fee",
    iconColor: "#00f0ff"
  },
  {
    value: "99.99%",
    label: "Uptime SLA",
    iconColor: "#00ff9d"
  }
];

const integrations = [
  {
    icon: Landmark,
    title: "Core Banking",
    desc: "Direct integration with major core banking systems"
  },
  {
    icon: Shield,
    title: "Treasury Management",
    desc: "Real-time liquidity optimization and cash pooling"
  },
  {
    icon: Users,
    title: "Correspondent Banking",
    desc: "Nostro/Vostro account management on-chain"
  },
  {
    icon: Clock,
    title: "24/7 Operations",
    desc: "Always-on infrastructure for continuous operations"
  }
];

const clientTypes = [
  { title: "Central Banks", desc: "CBDC infrastructure and interbank settlement" },
  { title: "Commercial Banks", desc: "Retail and wholesale payment processing" },
  { title: "Payment Processors", desc: "High-volume transaction infrastructure" },
  { title: "Fintechs", desc: "Modern payment rails for next-gen services" }
];

export default function Institutional() {
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
        <div className="absolute top-0 right-1/3 w-[600px] h-[500px] bg-[#ffd700]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#ffd700] mb-6">
            <Building2 className="w-4 h-4" /> INSTITUTIONAL_PAYMENTS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            Institutional{" "}
            <span className="bg-gradient-to-r from-[#ffd700] to-[#ff9500] bg-clip-text text-transparent">
              Payments
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Enterprise-grade payment infrastructure for banks, financial institutions, 
            and payment processors. Real-time settlement, global reach, full compliance.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              className="px-8 py-3 rounded-lg bg-[#ffd700] text-black font-bold hover:bg-yellow-400 transition"
              style={{ boxShadow: "0 0 20px rgba(255,215,0,0.3)" }}
              data-testid="button-contact"
            >
              Contact Sales
            </button>
            <Link href="/developers/api">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-api"
              >
                API Reference
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
            <h2 className="text-3xl font-bold text-white mb-2">Payment Features</h2>
            <p className="text-gray-400">Built for the demands of institutional finance.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {paymentFeatures.map((feature, idx) => {
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

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">System Integrations</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrations.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-white/10 text-center"
                  data-testid={`card-integration-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#ffd700] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Client Types</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {clientTypes.map((client, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 border border-white/10 flex items-start gap-4"
                data-testid={`card-client-${idx}`}
              >
                <CheckCircle className="w-6 h-6 text-[#ffd700] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{client.title}</h3>
                  <p className="text-sm text-gray-400">{client.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#ffd700]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,149,0,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-white mb-4">Schedule a Demo</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              See how TBurn Chain can transform your payment infrastructure.
              Our team will customize a solution for your institution's needs.
            </p>
            <Link href="/app">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#ffd700] text-black font-bold hover:bg-yellow-400 transition"
                style={{ boxShadow: "0 0 20px rgba(255,215,0,0.3)" }}
                data-testid="button-demo"
              >
                Request Demo <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
