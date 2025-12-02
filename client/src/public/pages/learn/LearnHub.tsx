import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Coins, 
  Code, 
  ArrowRight,
  Flame,
  Brain,
  Lock,
  Fuel,
  Network,
  Award,
  MessageCircle,
  Globe
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

const stats = [
  { value: "25+", label: "COURSES", color: "text-[#7000ff]" },
  { value: "48K+", label: "LEARNERS", color: "text-[#00f0ff]" },
  { value: "120+", label: "HOURS CONTENT", color: "text-[#00ff9d]" },
  { value: "94%", label: "COMPLETION RATE", color: "text-[#ffb800]" },
];

const learningPaths = [
  {
    icon: BookOpen,
    title: "Blockchain Basics",
    description: "Understand the basics of blockchain and how TBurn Chain solves the trilemma with Trust Score.",
    level: "Beginner",
    color: "#00ff9d",
    tags: ["Consensus", "Smart Contracts"],
    href: "/learn/what-is-burn-chain",
  },
  {
    icon: ShieldCheck,
    title: "Trust Score System",
    description: "Deep dive into the 3-stage verification system, AI analysis, and the Auto-Burn mechanism.",
    level: "Intermediate",
    color: "#00f0ff",
    tags: ["Algorithm", "Verification"],
    href: "/learn/trust-score",
  },
  {
    icon: Coins,
    title: "Mastering DeFi",
    description: "Learn about decentralized finance: DEX liquidity, staking, and yield farming on TBurn.",
    level: "Intermediate",
    color: "#7000ff",
    tags: ["Liquidity", "Yield Farming"],
    href: "/learn/tokenomics",
  },
  {
    icon: Code,
    title: "Developer Course",
    description: "Step-by-step guide to building and deploying dApps using the TBurn SDK and API.",
    level: "Advanced",
    color: "#ffb800",
    tags: ["SDK Setup", "API Integration"],
    href: "/developers",
  },
];

const coreConcepts = [
  { icon: ShieldCheck, title: "Trust Score", description: "Dynamic score rating project reliability from 0-100.", color: "#00f0ff" },
  { icon: Flame, title: "Auto-Burn", description: "Automatic collateral burn for non-compliance.", color: "#ef4444" },
  { icon: Brain, title: "Triple-Band AI", description: "Multi-LLM real-time analysis for verification.", color: "#7000ff" },
  { icon: Lock, title: "Quantum Security", description: "CRYSTALS-Dilithium + ED25519 hybrid encryption.", color: "#ffffff" },
  { icon: Fuel, title: "Ember Gas", description: "Micro-gas unit (1 TBURN = 10^6 Ember).", color: "#ffb800" },
  { icon: Network, title: "DPoS + BFT", description: "Hybrid consensus supporting 30,000 validators.", color: "#00ff9d" },
];

const glossary = [
  { term: "TBURN", description: "TBurn Chain's native governance and utility token.", color: "#00f0ff" },
  { term: "Ember", description: "Gas unit for transaction fees.", color: "#ffb800" },
  { term: "Slashing", description: "Penalty on staked tokens for validator misbehavior.", color: "#ef4444" },
];

const certifications = [
  { title: "TBurn Fundamentals", description: "Complete basics course + pass quiz.", color: "#ffb800", bgColor: "bg-amber-900/30" },
  { title: "DeFi Expert", description: "Complete DeFi course + hands-on tasks.", color: "#9ca3af", bgColor: "bg-gray-700/30" },
  { title: "Developer Certification", description: "Developer course + dApp project submission.", color: "#ffb800", bgColor: "bg-[#ffb800]/20" },
];

const communityLinks = [
  { icon: SiDiscord, title: "Join Discord", description: "Discuss with learners.", color: "#7000ff", href: "/community/hub" },
  { icon: MessageCircle, title: "Developer Forum", description: "Technical Q&A.", color: "#00f0ff", href: "/community/hub" },
  { icon: Globe, title: "Live Sessions", description: "Weekly Workshops.", color: "#00ff9d", href: "/community/events" },
];

export default function LearnHub() {
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
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#7000ff]/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
              <GraduationCap className="w-4 h-4" /> {t('publicPages.learn.hub.tag')}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-learn-title">
              {t('publicPages.learn.hub.title')}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
              {t('publicPages.learn.hub.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-6 border-y border-white/5 bg-black/20">
        <div className="container mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-500 font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">{t('publicPages.learn.hub.learningPaths')}</h2>
            <p className="text-gray-400">{t('publicPages.learn.hub.learningPathsDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {learningPaths.map((path, index) => (
              <Link key={index} href={path.href}>
                <div 
                  className="spotlight-card rounded-xl p-8 group cursor-pointer h-full"
                  data-testid={`learning-path-${index}`}
                >
                  <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ 
                        backgroundColor: `${path.color}10`,
                        border: `1px solid ${path.color}30`,
                        color: path.color 
                      }}
                    >
                      <path.icon className="w-6 h-6" />
                    </div>
                    <span 
                      className="font-mono text-[0.7rem] px-2 py-1 rounded border"
                      style={{ 
                        color: path.color,
                        borderColor: `${path.color}30`
                      }}
                    >
                      {path.level}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{path.title}</h3>
                  <p className="text-gray-400 text-sm mb-6">{path.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {path.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="font-mono text-[0.7rem] px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div 
                    className="font-bold text-sm flex items-center gap-2 group-hover:gap-4 transition-all"
                    style={{ color: path.color }}
                  >
                    {t('publicPages.common.getStarted')} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Core Concepts Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">{t('publicPages.learn.hub.coreConcepts')}</h2>
            <p className="text-gray-400">{t('publicPages.learn.hub.coreConceptsDesc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {coreConcepts.map((concept, index) => (
              <div 
                key={index} 
                className="spotlight-card p-6 rounded-xl"
                data-testid={`core-concept-${index}`}
              >
                <concept.icon 
                  className="w-8 h-8 mb-4" 
                  style={{ color: concept.color }} 
                />
                <h3 className="font-bold text-white mb-2">{concept.title}</h3>
                <p className="text-sm text-gray-400">{concept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary & Certifications Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-12">
          {/* Glossary */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Glossary</h2>
            <div className="space-y-4">
              {glossary.map((item, index) => (
                <div 
                  key={index}
                  className="spotlight-card p-4 rounded-lg flex gap-4 items-start"
                  data-testid={`glossary-${index}`}
                >
                  <span 
                    className="font-mono text-[0.7rem] px-2 py-1 rounded shrink-0"
                    style={{ 
                      color: item.color,
                      border: `1px solid ${item.color}50`
                    }}
                  >
                    {item.term}
                  </span>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Certifications</h2>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div 
                  key={index}
                  className="spotlight-card p-4 rounded-lg flex items-center gap-4"
                  data-testid={`certification-${index}`}
                >
                  <div 
                    className={`w-10 h-10 rounded-full ${cert.bgColor} flex items-center justify-center`}
                    style={{ color: cert.color }}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{cert.title}</h4>
                    <p className="text-xs text-gray-400">{cert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Links Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6">
            {communityLinks.map((link, index) => (
              <Link key={index} href={link.href}>
                <div 
                  className="spotlight-card p-6 rounded-xl text-center group cursor-pointer"
                  data-testid={`community-link-${index}`}
                >
                  <link.icon 
                    className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform"
                    style={{ color: link.color }}
                  />
                  <h3 className="font-bold text-white">{link.title}</h3>
                  <p className="text-sm text-gray-400">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
