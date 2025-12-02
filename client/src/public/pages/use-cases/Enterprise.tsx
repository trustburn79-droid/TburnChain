import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Building,
  Shield,
  Zap,
  Users,
  Lock,
  Server,
  ArrowRight,
  FileText,
  Key,
  Database,
  CheckCircle,
  Layers
} from "lucide-react";

const solutions = [
  {
    icon: Key,
    iconColor: "#7000ff",
    title: "Identity & Access Management",
    desc: "Decentralized identity with self-sovereign credentials. Multi-factor authentication, SSO integration, and granular permission controls."
  },
  {
    icon: Database,
    iconColor: "#00f0ff",
    title: "Supply Chain Transparency",
    desc: "End-to-end product provenance tracking. Immutable audit trails from manufacturer to consumer with IoT integration."
  },
  {
    icon: FileText,
    iconColor: "#00ff9d",
    title: "Document Management",
    desc: "Tamper-proof document storage and verification. Digital signatures, version control, and compliance archiving."
  },
  {
    icon: Layers,
    iconColor: "#ffd700",
    title: "Business Process Automation",
    desc: "Smart contract-driven workflows. Automate approvals, payments, and multi-party agreements with trustless execution."
  }
];

const metrics = [
  {
    value: "500+",
    label: "Enterprise Clients",
    iconColor: "#7000ff"
  },
  {
    value: "99.95%",
    label: "Uptime Guarantee",
    iconColor: "#00f0ff"
  },
  {
    value: "24/7",
    label: "Dedicated Support",
    iconColor: "#00ff9d"
  }
];

const features = [
  {
    icon: Shield,
    title: "SOC 2 Compliant",
    desc: "Enterprise security controls and annual audits"
  },
  {
    icon: Lock,
    title: "Private Subnets",
    desc: "Isolated network environments for sensitive data"
  },
  {
    icon: Users,
    title: "Role-Based Access",
    desc: "Granular permissions and multi-tenant isolation"
  },
  {
    icon: Server,
    title: "On-Premise Option",
    desc: "Deploy within your own data center infrastructure"
  }
];

const industries = [
  { title: "Healthcare", desc: "HIPAA-compliant record management" },
  { title: "Manufacturing", desc: "Supply chain and quality assurance" },
  { title: "Legal", desc: "Contract management and e-signatures" },
  { title: "Government", desc: "Transparent record keeping and voting" },
  { title: "Insurance", desc: "Claims processing and fraud detection" },
  { title: "Logistics", desc: "Shipment tracking and verification" }
];

export default function Enterprise() {
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Building className="w-4 h-4" /> {t('publicPages.useCases.enterprise.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.useCases.enterprise.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t('publicPages.useCases.enterprise.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/community/hub">
              <button 
                className="px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-contact"
              >
                Contact Enterprise
              </button>
            </Link>
            <Link href="/developers/docs">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
                data-testid="button-docs"
              >
                Enterprise Docs
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
            <h2 className="text-3xl font-bold text-white mb-2">Enterprise Solutions</h2>
            <p className="text-gray-400">Blockchain applications for modern business challenges.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-2xl p-8 border border-white/10"
                  data-testid={`card-solution-${idx}`}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ 
                      backgroundColor: `${solution.iconColor}10`,
                      border: `1px solid ${solution.iconColor}30`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: solution.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{solution.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Platform Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className="spotlight-card rounded-xl p-6 border border-white/10 text-center"
                  data-testid={`card-feature-${idx}`}
                >
                  <Icon className="w-8 h-8 text-[#7000ff] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Industry Applications</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {industries.map((industry, idx) => (
              <div 
                key={idx}
                className="spotlight-card rounded-xl p-6 border border-white/10"
                data-testid={`card-industry-${idx}`}
              >
                <CheckCircle className="w-6 h-6 text-[#00ff9d] mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">{industry.title}</h3>
                <p className="text-sm text-gray-400">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="spotlight-card rounded-2xl p-8 border border-[#7000ff]/30 text-center"
               style={{ background: "linear-gradient(135deg, rgba(112,0,255,0.1) 0%, rgba(0,240,255,0.05) 100%)" }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready for Enterprise Blockchain?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Schedule a consultation with our enterprise team.
              We'll design a custom solution that fits your organization's requirements.
            </p>
            <Link href="/app">
              <button 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition"
                style={{ boxShadow: "0 0 20px rgba(112,0,255,0.3)" }}
                data-testid="button-schedule"
              >
                Schedule Consultation <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
