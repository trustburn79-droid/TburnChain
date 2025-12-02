import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  ShieldCheck, 
  Layers, 
  Timer, 
  Search, 
  Bot, 
  UserRound, 
  Code, 
  Coins, 
  Star,
  AlertTriangle,
  Database,
  Brain,
  Users,
  Link as LinkIcon
} from "lucide-react";

const evaluationPhilosophy = [
  {
    icon: Layers,
    title: "Comprehensive",
    description: "Full verification including team, finance, and community, not just code.",
    color: "#7000ff",
  },
  {
    icon: Timer,
    title: "Real-time",
    description: "Continuous monitoring and automated updates, not a one-time stamp.",
    color: "#00f0ff",
  },
  {
    icon: Search,
    title: "Transparent",
    description: "All evaluation criteria, data sources, and processes are public on-chain.",
    color: "#00ff9d",
  },
  {
    icon: Bot,
    title: "Objective",
    description: "Minimizing human bias through Triple-Band AI analysis and raw data.",
    color: "#ffd700",
  },
];

const scoreComponents = [
  {
    icon: UserRound,
    title: "Team Transparency",
    points: 30,
    color: "#7000ff",
    stars: 5,
    items: [
      { label: "Real Name Disclosure", pts: 10 },
      { label: "Experience Verification", pts: 8 },
      { label: "KYC Completion", pts: 7 },
      { label: "Regular Communication", pts: 5 },
    ],
  },
  {
    icon: Code,
    title: "Technical Soundness",
    points: 25,
    color: "#00f0ff",
    stars: 4,
    items: [
      { label: "Code Quality", pts: 10 },
      { label: "Security Audit", pts: 8 },
      { label: "Test Coverage", pts: 4 },
      { label: "Documentation", pts: 3 },
    ],
  },
  {
    icon: Coins,
    title: "Financial Transparency",
    points: 20,
    color: "#00ff9d",
    stars: 4,
    items: [
      { label: "Wallet Disclosure", pts: 6 },
      { label: "Funding Report", pts: 6 },
      { label: "Accounting Audit", pts: 5 },
      { label: "Distribution Data", pts: 3 },
    ],
  },
];

const gradeSystem = [
  { grade: "S", range: "85-100", title: "Supreme Trust", description: "Excellent in all areas. Low risk.", color: "#ffd700" },
  { grade: "A", range: "70-84", title: "High Trust", description: "Good reliability. Recommended.", color: "#00ff9d" },
  { grade: "B", range: "55-69", title: "Average", description: "Standard level. Research needed.", color: "#00f0ff" },
  { grade: "C", range: "40-54", title: "Caution Required", description: "Risk factors detected.", color: "#ff9900" },
  { grade: "F", range: "0-39", title: "High Risk", description: "Serious issues. Not recommended.", color: "#ff0055" },
];

const verificationProcess = [
  { step: 1, title: "Data Collection", description: "Automated fetching from GitHub, On-chain, Social.", color: "#00f0ff" },
  { step: 2, title: "AI Analysis", description: "NLP & Anomaly detection via Triple-Band AI.", color: "#7000ff" },
  { step: 3, title: "Expert Review", description: "Human verification of ambiguous data points.", color: "#ffffff" },
  { step: 4, title: "On-chain Commit", description: "Results recorded on-chain with timestamp.", color: "#00ff9d" },
];

export default function TrustScoreSystem() {
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
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <ShieldCheck className="w-4 h-4" /> {t('publicPages.learn.trustScore.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
            {t('publicPages.learn.trustScore.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('publicPages.learn.trustScore.subtitle')}
          </p>
        </div>
      </section>

      {/* Evaluation Philosophy Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Evaluation Philosophy</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {evaluationPhilosophy.map((item, index) => (
              <div key={index} className="spotlight-card rounded-xl p-6" data-testid={`philosophy-card-${index}`}>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ 
                    backgroundColor: `${item.color}10`,
                    border: `1px solid ${item.color}30`,
                    color: item.color 
                  }}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score Components Section */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Score Components</h2>
            <p className="text-gray-400 font-mono text-sm">TOTAL_POINTS: 100 // SYSTEM_STATUS: ACTIVE</p>
          </div>

          <div className="space-y-6">
            {scoreComponents.map((component, index) => (
              <div 
                key={index} 
                className="spotlight-card rounded-xl"
                style={{ border: `1px solid ${component.color}30` }}
                data-testid={`score-component-${index}`}
              >
                <div 
                  className="p-6 flex flex-col md:flex-row justify-between items-center gap-4"
                  style={{
                    background: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${component.color}20`, color: component.color }}
                    >
                      <component.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{component.title}</h3>
                      <div className="flex gap-1 mt-1" style={{ color: component.color }}>
                        {Array.from({ length: component.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white font-mono">
                      {component.points} <span className="text-sm text-gray-500">PTS</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                  {component.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="flex justify-between items-center p-3 bg-black/40 rounded border border-white/5"
                    >
                      <span className="text-sm text-gray-300">{item.label}</span>
                      <span className="text-xs font-mono" style={{ color: component.color }}>{item.pts}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade System Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Grade System</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradeSystem.map((grade, index) => (
              <div 
                key={index}
                className="spotlight-card rounded-xl p-6 group"
                style={{ borderLeft: `4px solid ${grade.color}` }}
                data-testid={`grade-card-${grade.grade}`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div 
                    className="text-4xl font-black font-mono group-hover:scale-110 transition-transform"
                    style={{ color: grade.color }}
                  >
                    {grade.grade}
                  </div>
                  <div 
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ 
                      color: grade.color,
                      border: `1px solid ${grade.color}30`
                    }}
                  >
                    {grade.range}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{grade.title}</h3>
                <p className="text-sm text-gray-400">{grade.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-[#ffd700] shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              <span className="text-[#ffd700] font-bold">Important:</span> Scores are reference data, not financial advice. 
              Trading is suspended only if Trust Score drops below 40% (Grade F). Always DYOR.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Process Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Verification Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {verificationProcess.map((step, index) => (
              <div key={index} className="relative text-center group" data-testid={`process-step-${step.step}`}>
                <div 
                  className="w-16 h-16 mx-auto rounded-full bg-black flex items-center justify-center text-xl font-bold mb-4 group-hover:text-black transition-colors"
                  style={{ 
                    border: `1px solid ${step.color}`,
                    color: step.color,
                    boxShadow: `0 0 20px ${step.color}20`
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform">{step.step}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
