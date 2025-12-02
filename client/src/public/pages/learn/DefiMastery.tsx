import { Link } from "wouter";
import { 
  Coins, Layers, ArrowLeft, Clock, ChevronRight, Play, 
  Check, Box, Wallet, Code, ArrowRightLeft, HandCoins, 
  Droplets, TrendingUp, FileText, Zap, BookOpen, Terminal
} from "lucide-react";

const statsData = [
  { value: "$2.4B+", label: "TVL Locked", color: "#7000ff" },
  { value: "Up to 45%", label: "Average APY", color: "#ff00ff" },
  { value: "50+", label: "Active Protocols", color: "#00f0ff" },
];

const curriculumModules = [
  {
    icon: ArrowRightLeft,
    title: "Liquidity Provision",
    subtitle: "Understanding AMMs & Pools",
    duration: "60 min",
    link: "/developers/docs"
  },
  {
    icon: HandCoins,
    title: "Collateralized Lending",
    subtitle: "LTV Ratios & Liquidation",
    duration: "60 min",
    link: "/developers/api"
  },
  {
    icon: Droplets,
    title: "Liquid Staking",
    subtitle: "Unlocking staked assets",
    duration: "60 min",
    link: "/developers/contracts"
  },
  {
    icon: TrendingUp,
    title: "Yield Farming",
    subtitle: "Strategies for max APY",
    duration: "60 min",
    link: "/developers/sdk"
  },
];

const keyTakeaways = [
  "Core DeFi protocols mechanics",
  "Advanced Farming Strategies",
  "Risk Management",
];

const prerequisites = [
  { icon: Box, text: "Blockchain Basics", link: "/learn/blockchain-basics" },
  { icon: Wallet, text: "Crypto Wallet Setup", link: "/learn/wallet" },
];

export default function DefiMastery() {
  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-12 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/20 via-[#ff00ff]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/learn/education-programs"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#7000ff] mb-6 transition-colors group"
            data-testid="link-back-education"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Education Hub
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="hidden md:flex w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7000ff] to-[#ff00ff] border border-white/10 items-center justify-center shadow-[0_0_30px_rgba(112,0,255,0.2)]">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#7000ff] text-[#7000ff] bg-[#7000ff]/5">
                  Intermediate
                </span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> 4 hours
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Mastering DeFi</h1>
              <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
                Dive deep into decentralized finance. Master the mechanics of DEXs, lending protocols, and yield farming strategies on TBurn Chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsData.map((stat, index) => (
            <div 
              key={index}
              className="spotlight-card p-5 rounded-xl text-center"
              style={{ borderBottom: `2px solid ${stat.color}` }}
              data-testid={`stat-card-${index}`}
            >
              <div className="text-3xl font-bold text-white font-mono">{stat.value}</div>
              <div 
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: stat.color }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Course Overview */}
            <div className="spotlight-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6 text-[#7000ff]" />
                <h2 className="text-xl font-bold text-white">Course Overview</h2>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                This course moves beyond the basics. You will learn the economic models behind liquidity pools, how to calculate impermanent loss, and how to execute flash loans securely.
              </p>

              <div className="mt-6 p-4 border border-white/10 border-dashed rounded-lg bg-black/20">
                <div className="aspect-video bg-gradient-to-br from-[#7000ff]/10 to-[#ff00ff]/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7000ff]/20 flex items-center justify-center">
                      <Play className="w-8 h-8 text-[#7000ff]" />
                    </div>
                    <p className="text-gray-400 text-sm">Smart Contract Interaction Flow</p>
                    <p className="text-xs text-gray-500 mt-1">DeFi Protocol Architecture</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Figure 1: Smart Contract Interaction Flow</p>
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Curriculum</h2>
              <div className="space-y-4">
                {curriculumModules.map((module, index) => (
                  <Link 
                    key={index}
                    href={module.link}
                    className="spotlight-card rounded-xl p-5 cursor-pointer group block"
                    data-testid={`card-module-${index + 1}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#7000ff]/10 border border-[#7000ff]/20 flex items-center justify-center group-hover:bg-[#7000ff]/20 transition-colors">
                          <module.icon className="w-5 h-5 text-[#7000ff]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-[#7000ff] transition-colors">{module.title}</h3>
                          <p className="text-xs text-gray-500">{module.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">{module.duration}</span>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Developer Resources */}
            <div className="spotlight-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Developer Resources</h3>
              <p className="text-gray-400 text-sm mb-4">
                Build DeFi applications on TBurn Chain with our comprehensive developer tools and documentation.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  href="/developers/contracts"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                  data-testid="link-smart-contracts"
                >
                  <Code className="w-5 h-5 text-[#7000ff]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#7000ff] transition">Smart Contracts</p>
                    <p className="text-xs text-gray-500">DeFi contract templates</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/sdk"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#ff00ff]/5 border border-[#ff00ff]/20 hover:bg-[#ff00ff]/10 transition group"
                  data-testid="link-sdk-guide"
                >
                  <BookOpen className="w-5 h-5 text-[#ff00ff]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#ff00ff] transition">SDK Guide</p>
                    <p className="text-xs text-gray-500">DeFi SDK integration</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/api"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                  data-testid="link-api-reference"
                >
                  <FileText className="w-5 h-5 text-[#00f0ff]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#00f0ff] transition">API Reference</p>
                    <p className="text-xs text-gray-500">DeFi endpoints</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/websocket"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 hover:bg-[#00ff9d]/10 transition group"
                  data-testid="link-websocket"
                >
                  <Zap className="w-5 h-5 text-[#00ff9d]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#00ff9d] transition">WebSocket API</p>
                    <p className="text-xs text-gray-500">Real-time DeFi data</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/examples"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
                  data-testid="link-code-examples"
                >
                  <Terminal className="w-5 h-5 text-[#ffd700]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#ffd700] transition">Code Examples</p>
                    <p className="text-xs text-gray-500">DeFi code samples</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/quickstart"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#ff0055]/5 border border-[#ff0055]/20 hover:bg-[#ff0055]/10 transition group"
                  data-testid="link-quickstart"
                >
                  <Play className="w-5 h-5 text-[#ff0055]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#ff0055] transition">Quick Start</p>
                    <p className="text-xs text-gray-500">Build your first DApp</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Start Learning Card */}
            <div className="spotlight-card rounded-xl p-6 sticky top-24 border-[#7000ff]/20">
              <Link href="/learn/intro-to-defi">
                <button 
                  className="w-full bg-[#7000ff] text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition shadow-[0_0_20px_rgba(112,0,255,0.4)] mb-6 flex items-center justify-center gap-2"
                  data-testid="button-start-learning"
                >
                  <Play className="w-5 h-5" /> Start Learning
                </button>
              </Link>

              {/* Key Takeaways */}
              <div className="mb-6">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Key Takeaways</h3>
                <ul className="space-y-3">
                  {keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-[#7000ff] mt-0.5 flex-shrink-0" />
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisites */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Prerequisites</h3>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, index) => (
                    <li key={index}>
                      <Link 
                        href={prereq.link}
                        className="flex items-start gap-3 text-sm text-gray-400 hover:text-[#7000ff] transition"
                        data-testid={`link-prereq-${index}`}
                      >
                        <prereq.icon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        {prereq.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Up Next Card */}
            <Link 
              href="/developers/quickstart"
              className="spotlight-card rounded-xl p-6 group cursor-pointer block"
              data-testid="link-developer-course"
            >
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Up Next</h3>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Code className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-orange-400 transition">Developer Course</h4>
                  <p className="text-xs text-gray-500">Build your first DApp</p>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </main>
  );
}
