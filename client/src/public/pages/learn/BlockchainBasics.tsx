import { Link } from "wouter";
import { 
  BookOpen, FileText, ArrowLeft, Clock, ChevronRight, Play, 
  PlayCircle, CheckCircle, Code, Wifi, Shield
} from "lucide-react";

const curriculumModules = [
  {
    number: "01",
    title: "What is Blockchain?",
    subtitle: "The immutable ledger concept",
    duration: "30 min",
    color: "cyan",
    active: false
  },
  {
    number: "02",
    title: "Consensus Algorithms",
    subtitle: "PoW vs PoS vs TBurn Consensus",
    duration: "30 min",
    color: "cyan",
    active: false
  },
  {
    number: "03",
    title: "Smart Contract Basics",
    subtitle: "Automating trust with code",
    duration: "30 min",
    color: "cyan",
    active: false,
    link: "/developers/contracts"
  },
  {
    number: "04",
    title: "Intro to TBurn Chain",
    subtitle: "The Trust-Based Revolution",
    duration: "30 min",
    color: "purple",
    active: true,
    link: "/learn/what-is-burn-chain"
  },
];

const learningOutcomes = [
  "Core mechanisms of blockchain",
  "Consensus algorithm comparison",
  "Smart contract logic",
  "TBurn's unique features",
];

const prerequisites = [
  { icon: Code, text: "No coding required" },
  { icon: Wifi, text: "Basic internet skills" },
];

export default function BlockchainBasics() {
  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-12 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/10 via-[#00f0ff]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/learn/education-programs"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00f0ff] mb-6 transition-colors group"
            data-testid="link-back-education"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Education Hub
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="hidden md:flex w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00f0ff]/20 to-[#7000ff]/20 border border-white/10 items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <BookOpen className="w-8 h-8 text-[#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5">
                  Beginner
                </span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> 2 hours
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Blockchain Basics</h1>
              <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
                Understand the fundamental concepts of blockchain technology, decentralization, and how TBurn Chain solves the trilemma.
              </p>
            </div>
          </div>
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
                <FileText className="w-6 h-6 text-[#7000ff]" />
                <h2 className="text-xl font-bold text-white">Course Overview</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                In this comprehensive module, you will journey from the genesis of distributed ledger technology to the modern era of high-speed Layer 1 solutions. We will visually explore how blocks are chained and verified.
              </p>
              
              <div className="mt-6 p-4 border border-white/10 border-dashed rounded-lg bg-black/20">
                <div className="aspect-video bg-gradient-to-br from-[#00f0ff]/5 to-[#7000ff]/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00f0ff]/10 flex items-center justify-center">
                      <Play className="w-8 h-8 text-[#00f0ff]" />
                    </div>
                    <p className="text-gray-400 text-sm">Network Topology Comparison</p>
                    <p className="text-xs text-gray-500 mt-1">Centralized vs Decentralized</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Figure 1: Network Topology Comparison</p>
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Curriculum</h2>
              <div className="space-y-4">
                {curriculumModules.map((module, index) => (
                  <div 
                    key={index}
                    className={`spotlight-card rounded-xl p-5 cursor-pointer group ${
                      module.active ? 'border-[#7000ff]/30' : ''
                    }`}
                    data-testid={`card-module-${module.number}`}
                  >
                    {module.link ? (
                      <Link href={module.link} className="block">
                        <ModuleContent module={module} />
                      </Link>
                    ) : (
                      <ModuleContent module={module} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Related Links */}
            <div className="spotlight-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Continue Learning</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  href="/developers/contracts"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                  data-testid="link-smart-contracts"
                >
                  <Code className="w-5 h-5 text-[#00f0ff]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#00f0ff] transition">Smart Contracts</p>
                    <p className="text-xs text-gray-500">Build on TBurn Chain</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/sdk"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                  data-testid="link-sdk-guide"
                >
                  <BookOpen className="w-5 h-5 text-[#7000ff]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#7000ff] transition">SDK Guide</p>
                    <p className="text-xs text-gray-500">Developer tools</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/quickstart"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 hover:bg-[#00ff9d]/10 transition group"
                  data-testid="link-quick-start"
                >
                  <Play className="w-5 h-5 text-[#00ff9d]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#00ff9d] transition">Quick Start</p>
                    <p className="text-xs text-gray-500">Get started fast</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/docs"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
                  data-testid="link-documentation"
                >
                  <FileText className="w-5 h-5 text-[#ffd700]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#ffd700] transition">Documentation</p>
                    <p className="text-xs text-gray-500">Full reference</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Start Learning Card */}
            <div className="spotlight-card rounded-xl p-6 sticky top-24">
              <button 
                className="w-full bg-[#00f0ff] text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-6 flex items-center justify-center gap-2"
                data-testid="button-start-learning"
              >
                <Play className="w-5 h-5" /> Start Learning
              </button>

              {/* What You'll Learn */}
              <div className="mb-6">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">What You'll Learn</h3>
                <ul className="space-y-3">
                  {learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-[#00f0ff] mt-0.5 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisites */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Prerequisites</h3>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                      <prereq.icon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      {prereq.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Up Next Card */}
            <Link 
              href="/learn/trust-score"
              className="spotlight-card rounded-xl p-6 group cursor-pointer block"
              data-testid="link-trust-score"
            >
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Up Next</h3>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#7000ff]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#7000ff]" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-[#00f0ff] transition">Trust Score System</h4>
                  <p className="text-xs text-gray-500">Intermediate Level</p>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </main>
  );
}

function ModuleContent({ module }: { module: typeof curriculumModules[0] }) {
  const colorClass = module.color === "purple" ? "#7000ff" : "#00f0ff";
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
          style={{ 
            backgroundColor: `${colorClass}10`,
            borderWidth: 1,
            borderColor: `${colorClass}20`
          }}
        >
          <span className="font-mono font-bold" style={{ color: colorClass }}>{module.number}</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-[#00f0ff] transition-colors">{module.title}</h3>
          <p className="text-xs text-gray-500">{module.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">{module.duration}</span>
        {module.active ? (
          <PlayCircle className="w-5 h-5" style={{ color: colorClass }} />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
        )}
      </div>
    </div>
  );
}
