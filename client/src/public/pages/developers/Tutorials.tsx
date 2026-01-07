import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  GraduationCap, 
  Play,
  Clock,
  Star,
  ChevronRight,
  Code,
  Wallet,
  BarChart3,
  Zap,
  Shield,
  Coins,
  ArrowRight,
  BookOpen,
  Users,
  Trophy,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tutorials = [
  {
    id: "getting-started",
    title: "Getting Started with TBURN SDK",
    description: "Learn how to install and configure the TBURN SDK for your first blockchain application.",
    duration: "15 min",
    difficulty: "Beginner",
    icon: Code,
    gradient: "from-cyan-500 to-blue-500",
    steps: 5,
    featured: true
  },
  {
    id: "first-transaction",
    title: "Your First Transaction",
    description: "Step-by-step guide to sending and receiving TBURN tokens on the network.",
    duration: "20 min",
    difficulty: "Beginner",
    icon: Zap,
    gradient: "from-green-500 to-emerald-500",
    steps: 6,
    featured: true
  },
  {
    id: "wallet-integration",
    title: "Wallet Integration Guide",
    description: "Connect MetaMask, Trust Wallet, and other Web3 wallets to your dApp.",
    duration: "25 min",
    difficulty: "Beginner",
    icon: Wallet,
    gradient: "from-purple-500 to-pink-500",
    steps: 7,
    featured: false
  },
  {
    id: "smart-contracts",
    title: "Deploy Smart Contracts",
    description: "Write, compile, and deploy your first smart contract on TBURN Chain.",
    duration: "45 min",
    difficulty: "Intermediate",
    icon: Shield,
    gradient: "from-orange-500 to-red-500",
    steps: 10,
    featured: true
  },
  {
    id: "trust-score",
    title: "Trust Score Integration",
    description: "Implement AI-powered Trust Score verification in your application.",
    duration: "30 min",
    difficulty: "Intermediate",
    icon: BarChart3,
    gradient: "from-indigo-500 to-violet-500",
    steps: 8,
    featured: false
  },
  {
    id: "defi-staking",
    title: "Build a Staking dApp",
    description: "Create a complete staking application with rewards and delegation.",
    duration: "60 min",
    difficulty: "Advanced",
    icon: Coins,
    gradient: "from-yellow-500 to-orange-500",
    steps: 12,
    featured: false
  }
];

const learningPaths = [
  {
    title: "Blockchain Fundamentals",
    description: "Start from zero and learn blockchain concepts with TBURN",
    tutorials: 4,
    hours: 2,
    icon: BookOpen,
    color: "#00f0ff"
  },
  {
    title: "dApp Development",
    description: "Build decentralized applications from scratch",
    tutorials: 6,
    hours: 4,
    icon: Code,
    color: "#7000ff"
  },
  {
    title: "DeFi Mastery",
    description: "Master DeFi protocols and build financial applications",
    tutorials: 5,
    hours: 5,
    icon: Coins,
    color: "#00ff9d"
  }
];

export default function Tutorials() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredTutorials = selectedDifficulty === "all" 
    ? tutorials 
    : tutorials.filter(t => t.difficulty === selectedDifficulty);

  const featuredTutorials = tutorials.filter(t => t.featured);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Advanced": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen pt-4 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#7000ff]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-white/70 mb-6">
            <GraduationCap className="w-4 h-4 text-[#00f0ff]" />
            <span>{t('publicPages.developers.tutorials.hero.badge', 'Step-by-Step Learning')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('publicPages.developers.tutorials.hero.title', 'TBURN Developer Tutorials')}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-white/60 max-w-2xl mx-auto mb-8">
            {t('publicPages.developers.tutorials.hero.description', 'Hands-on guides to help you build on TBURN Chain. From basic concepts to advanced DeFi applications.')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
              <BookOpen className="w-5 h-5 text-[#00f0ff]" />
              <span>{tutorials.length} {t('publicPages.developers.tutorials.hero.stats.tutorials', 'Tutorials')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
              <Clock className="w-5 h-5 text-[#7000ff]" />
              <span>3+ {t('publicPages.developers.tutorials.hero.stats.hours', 'Hours of Content')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
              <Users className="w-5 h-5 text-[#00ff9d]" />
              <span>{t('publicPages.developers.tutorials.hero.stats.level', 'All Skill Levels')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="py-12 border-b border-gray-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('publicPages.developers.tutorials.featured.title', 'Featured Tutorials')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                data-testid={`card-tutorial-${tutorial.id}`}
                className="spotlight-card group relative bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-[#00f0ff]/50 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tutorial.gradient} flex items-center justify-center mb-4`}>
                  <tutorial.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${getDifficultyColor(tutorial.difficulty)} border`}>
                    {tutorial.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tutorial.duration}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#00f0ff] transition-colors">
                  {tutorial.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-white/60 mb-4">
                  {tutorial.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-white/40">
                    {tutorial.steps} {t('publicPages.developers.tutorials.steps', 'steps')}
                  </span>
                  <div className="flex items-center gap-1 text-[#00f0ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4" />
                    {t('publicPages.developers.tutorials.start', 'Start')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-12 border-b border-gray-200 dark:border-white/5 bg-gray-100/50 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6 text-[#7000ff]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('publicPages.developers.tutorials.paths.title', 'Learning Paths')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <div
                key={index}
                data-testid={`card-path-${index}`}
                className="group bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-[#7000ff]/50 transition-all cursor-pointer"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${path.color}20` }}
                >
                  <path.icon className="w-6 h-6" style={{ color: path.color }} />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {path.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-white/60 mb-4">
                  {path.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-white/40">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {path.tutorials} tutorials
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {path.hours}h
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-1 text-[#7000ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('publicPages.developers.tutorials.viewPath', 'View Path')}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tutorials */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('publicPages.developers.tutorials.all.title', 'All Tutorials')}
            </h2>

            <div className="flex gap-2">
              {["all", "Beginner", "Intermediate", "Advanced"].map((level) => (
                <button
                  key={level}
                  data-testid={`button-filter-${level.toLowerCase()}`}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDifficulty === level
                      ? "bg-[#00f0ff] text-black"
                      : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/60 hover:bg-gray-300 dark:hover:bg-white/20"
                  }`}
                >
                  {level === "all" ? t('publicPages.developers.tutorials.filter.all', 'All') : level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                data-testid={`row-tutorial-${tutorial.id}`}
                className="group flex items-center gap-6 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-[#00f0ff]/50 transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tutorial.gradient} flex items-center justify-center flex-shrink-0`}>
                  <tutorial.icon className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#00f0ff] transition-colors truncate">
                      {tutorial.title}
                    </h3>
                    <Badge className={`${getDifficultyColor(tutorial.difficulty)} border flex-shrink-0`}>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white/60 truncate">
                    {tutorial.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-sm text-gray-500 dark:text-white/40 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tutorial.duration}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-white/40">
                    {tutorial.steps} steps
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-white/40 group-hover:text-[#00f0ff] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 border-t border-gray-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-[#00f0ff]/10 to-[#7000ff]/10 border border-gray-200 dark:border-white/10 rounded-2xl p-8">
            <CheckCircle className="w-12 h-12 text-[#00ff9d] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('publicPages.developers.tutorials.cta.title', 'Ready to Build?')}
            </h2>
            <p className="text-gray-600 dark:text-white/60 mb-6 max-w-xl mx-auto">
              {t('publicPages.developers.tutorials.cta.description', 'Start with our Quick Start guide and build your first dApp on TBURN Chain in under 15 minutes.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/developers/quickstart">
                <button 
                  data-testid="button-quickstart"
                  className="px-6 py-3 bg-[#00f0ff] text-black font-medium rounded-lg hover:bg-[#00d4e0] transition-colors"
                >
                  {t('publicPages.developers.tutorials.cta.quickstart', 'Quick Start Guide')}
                </button>
              </Link>
              <Link href="/developers/sdk">
                <button 
                  data-testid="button-sdk"
                  className="px-6 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
                >
                  {t('publicPages.developers.tutorials.cta.sdk', 'View SDK Docs')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
