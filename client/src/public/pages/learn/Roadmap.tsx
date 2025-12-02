import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Map, 
  Check, 
  Loader2, 
  Circle,
  Route,
  Users,
  Link as LinkIcon,
  Bot,
  Smartphone,
  Globe,
  Building,
  Handshake,
  Rocket,
  LucideIcon
} from "lucide-react";

interface TimelineItem {
  text: string;
  completed?: boolean;
  inProgress?: boolean;
  icon?: LucideIcon;
}

interface TimelinePhase {
  quarter: string;
  title: string;
  status: string;
  statusColor: string;
  dotColor: string;
  items: TimelineItem[];
  isLeft: boolean;
}

const timelineData: TimelinePhase[] = [
  {
    quarter: "2024 Q4",
    title: "Preparation Phase",
    status: "IN_PROGRESS",
    statusColor: "#00f0ff",
    dotColor: "#00f0ff",
    items: [
      { text: "Core protocol development completed", completed: true },
      { text: "Smart contract audit (CertiK)", completed: true },
      { text: "Testnet v0.8 launch", completed: true },
      { text: "Seed round $2M completed", completed: true },
      { text: "Private round $5M in progress", inProgress: true },
    ],
    isLeft: true,
  },
  {
    quarter: "2025 Q1",
    title: "Launch Phase",
    status: "UPCOMING",
    statusColor: "#7000ff",
    dotColor: "#7000ff",
    items: [
      { text: "Mainnet v1.0 launch (Arbitrum One)" },
      { text: "Public token sale ($5M target)" },
      { text: "Major Exchange Listings (CEX)" },
      { text: "Validator network setup (101 nodes)" },
      { text: "Developer SDK Release" },
    ],
    isLeft: false,
  },
  {
    quarter: "2025 Q2-Q3",
    title: "Growth Phase",
    status: "PLANNED",
    statusColor: "#9ca3af",
    dotColor: "#ffffff",
    items: [
      { text: "100 projects verified milestone", icon: Route },
      { text: "Community reaches 100K members", icon: Users },
      { text: "Cross-chain bridge (ETH, BSC, MATIC)", icon: LinkIcon },
      { text: "AI-powered fraud detection upgrade", icon: Bot },
      { text: "Mobile wallet app launch", icon: Smartphone },
    ],
    isLeft: true,
  },
  {
    quarter: "2026+",
    title: "Global Expansion",
    status: "LONG_TERM",
    statusColor: "#9ca3af",
    dotColor: "#ffffff",
    items: [
      { text: "Global university program (50 countries)", icon: Globe },
      { text: "Institutional investment solutions", icon: Building },
      { text: "Regulatory cooperation (SEC, MAS)", icon: Handshake },
      { text: "Full DAO governance transition", icon: Rocket },
    ],
    isLeft: false,
  },
];

const growthMetrics = [
  {
    year: "Year 1",
    color: "#00f0ff",
    projects: "1,500",
    users: "200K",
    tvl: "$500M",
    hasBorder: false,
  },
  {
    year: "Year 2",
    color: "#7000ff",
    projects: "6,000",
    users: "800K",
    tvl: "$2B",
    hasBorder: true,
  },
  {
    year: "Year 3",
    color: "#00ff9d",
    projects: "20,000",
    users: "2.5M",
    tvl: "$5B",
    hasBorder: false,
  },
];

export default function Roadmap() {
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
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00f0ff]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Map className="w-4 h-4" /> {t('publicPages.learn.roadmap.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.learn.roadmap.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('publicPages.learn.roadmap.subtitle')}
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 overflow-hidden">
        <div className="container mx-auto max-w-5xl relative">
          {/* Timeline Line */}
          <div 
            className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full z-0"
            style={{ 
              background: "linear-gradient(to bottom, #00f0ff, #7000ff, rgba(255,255,255,0.1))"
            }}
          />

          <div className="space-y-12 md:space-y-24">
            {timelineData.map((phase, index) => (
              <div key={index} className="relative grid md:grid-cols-2 gap-8 items-center">
                {phase.isLeft ? (
                  <>
                    <div className="md:text-right order-2 md:order-1">
                      <div 
                        className="spotlight-card rounded-xl p-8"
                        style={{ border: `1px solid ${phase.statusColor}30` }}
                        data-testid={`timeline-card-${index}`}
                      >
                        <div className="flex items-center justify-between md:justify-end gap-4 mb-4 flex-wrap">
                          <span 
                            className="px-2 py-1 rounded text-xs font-mono font-bold"
                            style={{ 
                              backgroundColor: `${phase.statusColor}20`,
                              color: phase.statusColor,
                              border: `1px solid ${phase.statusColor}30`
                            }}
                          >
                            {phase.status}
                          </span>
                          <h3 className="text-2xl font-bold text-white">{phase.quarter}</h3>
                        </div>
                        <h4 className="text-xl mb-4" style={{ color: phase.statusColor }}>{phase.title}</h4>
                        <ul className="space-y-2 text-sm text-gray-400 text-left md:text-right">
                          {phase.items.map((item, itemIndex) => (
                            <li key={itemIndex} className={`flex items-center gap-2 md:justify-end ${item.inProgress ? 'text-white' : ''}`}>
                              {item.text}
                              {item.completed && <Check className="w-4 h-4 text-[#00ff9d]" />}
                              {item.inProgress && <Loader2 className="w-4 h-4 text-[#00f0ff] animate-spin" />}
                              {item.icon && <item.icon className="w-4 h-4 text-gray-600" />}
                              {!item.completed && !item.inProgress && !item.icon && phase.status === "UPCOMING" && (
                                <Circle className="w-3 h-3 text-gray-600" />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {/* Timeline Dot */}
                    <div className="hidden md:flex justify-center order-1 md:order-2">
                      <div 
                        className="w-5 h-5 rounded-full bg-[#050505] z-10"
                        style={{ 
                          border: `2px solid ${phase.dotColor}`,
                          boxShadow: phase.status !== "PLANNED" && phase.status !== "LONG_TERM" ? `0 0 10px ${phase.dotColor}` : 'none'
                        }}
                      />
                    </div>
                    <div className="md:col-span-1 order-3" />
                  </>
                ) : (
                  <>
                    <div className="hidden md:block" />
                    {/* Timeline Dot */}
                    <div className="hidden md:flex justify-center">
                      <div 
                        className="w-5 h-5 rounded-full bg-[#050505] z-10"
                        style={{ 
                          border: `2px solid ${phase.dotColor}`,
                          boxShadow: phase.status !== "PLANNED" && phase.status !== "LONG_TERM" ? `0 0 10px ${phase.dotColor}` : 'none'
                        }}
                      />
                    </div>
                    <div>
                      <div 
                        className="spotlight-card rounded-xl p-8"
                        style={{ border: `1px solid ${phase.statusColor}30` }}
                        data-testid={`timeline-card-${index}`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                          <h3 className="text-2xl font-bold text-white">{phase.quarter}</h3>
                          <span 
                            className="px-2 py-1 rounded text-xs font-mono font-bold"
                            style={{ 
                              backgroundColor: `${phase.statusColor}20`,
                              color: phase.statusColor,
                              border: `1px solid ${phase.statusColor}30`
                            }}
                          >
                            {phase.status}
                          </span>
                        </div>
                        <h4 className="text-xl mb-4" style={{ color: phase.statusColor }}>{phase.title}</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          {phase.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center gap-2">
                              {item.completed && <Check className="w-4 h-4 text-[#00ff9d]" />}
                              {item.inProgress && <Loader2 className="w-4 h-4 text-[#00f0ff] animate-spin" />}
                              {item.icon && <item.icon className="w-4 h-4 text-gray-600" />}
                              {!item.completed && !item.inProgress && !item.icon && phase.status === "UPCOMING" && (
                                <Circle className="w-3 h-3 text-gray-600" />
                              )}
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projected Growth Metrics Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Projected Growth Metrics</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {growthMetrics.map((metric, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-8 text-center"
                style={{ 
                  border: metric.hasBorder ? `1px solid ${metric.color}30` : undefined
                }}
                data-testid={`growth-metric-${index}`}
              >
                <h3 className="text-2xl font-bold mb-6" style={{ color: metric.color }}>{metric.year}</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Verified Projects</p>
                    <p className="text-3xl font-bold text-white font-mono">{metric.projects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Active Users</p>
                    <p className="text-3xl font-bold text-white font-mono">{metric.users}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">TVL</p>
                    <p className="text-3xl font-bold text-white font-mono">{metric.tvl}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Build the Future with TBurn Chain</h2>
          <p className="text-gray-400 mb-8">Join our journey and contribute to building trust in the blockchain ecosystem.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/learn">
              <button 
                className="px-8 py-3 rounded-lg text-black font-bold transition-shadow hover:shadow-[0_0_20px_rgba(112,0,255,0.5)]"
                style={{ background: "linear-gradient(to right, #00f0ff, #7000ff)" }}
                data-testid="button-join-community"
              >
                Join Community
              </button>
            </Link>
            <Link href="/developers/quickstart">
              <button 
                className="px-8 py-3 rounded-lg border border-white/20 text-white font-bold hover:bg-white/5 transition-colors"
                data-testid="button-view-docs"
              >
                View Developer Docs
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
