import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Code, FileCode, ArrowLeft, Clock, ChevronRight, Play, 
  Check, Terminal, Laptop, Layers, Rocket, Medal, 
  ExternalLink, Box, FileText, BookOpen, Zap, Download, LucideIcon
} from "lucide-react";

interface CurriculumModule {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  duration: string;
  link: string;
}

interface Prerequisite {
  icon: LucideIcon;
  text: string;
  link: string;
}

interface Resource {
  title: string;
  href: string;
}

const codeExample = `// Trust Score 조회 - Production v8 Example
import { TBurnSDK, NetworkConfig } from '@tburn/sdk';

const config: NetworkConfig = {
  network: 'mainnet',
  rpcUrl: 'https://rpc.tburn.io/v8',
  apiKey: process.env.TBURN_API_KEY,
  options: {
    timeout: 30000,
    retryAttempts: 3,
    cacheEnabled: true,
    wsUrl: 'wss://ws.tburn.io/v8'  // Real-time updates
  }
};

const sdk = new TBurnSDK(config);

async function getTrustScore(projectAddress: string) {
  const result = await sdk.trustScore.get(projectAddress);
  
  return {
    score: result.score,           // 0-100
    grade: result.grade,           // S, A, B, C, D, F
    lastUpdated: result.timestamp,
    aiConfidence: result.confidence  // AI 분석 신뢰도
  };
}`;

export default function DeveloperCourse() {
  const { t } = useTranslation();

  const curriculumModules: CurriculumModule[] = [
    {
      icon: Terminal,
      title: t('publicPages.learn.developerCourse.curriculum.module1.title'),
      subtitle: t('publicPages.learn.developerCourse.curriculum.module1.subtitle'),
      duration: t('publicPages.learn.developerCourse.curriculum.module1.duration'),
      link: "/developers/sdk"
    },
    {
      icon: Laptop,
      title: t('publicPages.learn.developerCourse.curriculum.module2.title'),
      subtitle: t('publicPages.learn.developerCourse.curriculum.module2.subtitle'),
      duration: t('publicPages.learn.developerCourse.curriculum.module2.duration'),
      link: "/developers/contracts"
    },
    {
      icon: Layers,
      title: t('publicPages.learn.developerCourse.curriculum.module3.title'),
      subtitle: t('publicPages.learn.developerCourse.curriculum.module3.subtitle'),
      duration: t('publicPages.learn.developerCourse.curriculum.module3.duration'),
      link: "/developers/api"
    },
    {
      icon: Rocket,
      title: t('publicPages.learn.developerCourse.curriculum.module4.title'),
      subtitle: t('publicPages.learn.developerCourse.curriculum.module4.subtitle'),
      duration: t('publicPages.learn.developerCourse.curriculum.module4.duration'),
      link: "/developers/installation"
    },
  ];

  const keyTakeaways: string[] = [
    t('publicPages.learn.developerCourse.keyTakeaways.item1'),
    t('publicPages.learn.developerCourse.keyTakeaways.item2'),
    t('publicPages.learn.developerCourse.keyTakeaways.item3'),
    t('publicPages.learn.developerCourse.keyTakeaways.item4'),
  ];

  const prerequisites: Prerequisite[] = [
    { icon: Code, text: t('publicPages.learn.developerCourse.prerequisites.item1'), link: "/developers/sdk" },
    { icon: FileCode, text: t('publicPages.learn.developerCourse.prerequisites.item2'), link: "/developers/contracts" },
    { icon: Box, text: t('publicPages.learn.developerCourse.prerequisites.item3'), link: "/learn/blockchain-basics" },
  ];

  const resources: Resource[] = [
    { title: t('publicPages.learn.developerCourse.resources.apiReference'), href: "/developers/api" },
    { title: t('publicPages.learn.developerCourse.resources.sdkGuide'), href: "/developers/sdk" },
    { title: t('publicPages.learn.developerCourse.resources.smartContracts'), href: "/developers/contracts" },
    { title: t('publicPages.learn.developerCourse.resources.cliReference'), href: "/developers/cli" },
    { title: t('publicPages.learn.developerCourse.resources.websocketApi'), href: "/developers/websocket" },
    { title: t('publicPages.learn.developerCourse.resources.codeExamples'), href: "/developers/examples" },
  ];

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-12 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/20 via-[#f97316]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/learn/education-programs"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#f59e0b] mb-6 transition-colors group"
            data-testid="link-back-education"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.learn.developerCourse.backToEducation')}
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="hidden md:flex w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#f97316] border border-white/10 items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/5">
                  {t('publicPages.learn.developerCourse.tag')}
                </span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {t('publicPages.learn.developerCourse.duration')}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{t('publicPages.learn.developerCourse.title')}</h1>
              <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
                {t('publicPages.learn.developerCourse.subtitle')}
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
                <FileCode className="w-6 h-6 text-[#f59e0b]" />
                <h2 className="text-xl font-bold text-white">{t('publicPages.learn.developerCourse.courseOverview.title')}</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {t('publicPages.learn.developerCourse.courseOverview.description')}
              </p>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">{t('publicPages.learn.developerCourse.curriculumTitle')}</h2>
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
                        <div className="w-12 h-12 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center group-hover:bg-[#f59e0b]/20 transition-colors">
                          <module.icon className="w-5 h-5 text-[#f59e0b]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-[#f59e0b] transition-colors">{module.title}</h3>
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

            {/* Code Example */}
            <div className="spotlight-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-gray-400" />
                  <h3 className="font-bold text-white">{t('publicPages.learn.developerCourse.codeExample.title')}</h3>
                </div>
                <span className="text-xs text-gray-500 font-mono">{t('publicPages.learn.developerCourse.codeExample.language')}</span>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg overflow-x-auto font-mono text-xs md:text-sm leading-relaxed border border-gray-800">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>

            {/* Developer Tools Grid */}
            <div className="spotlight-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.learn.developerCourse.developerTools.title')}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {t('publicPages.learn.developerCourse.developerTools.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  href="/developers/quickstart"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/20 hover:bg-[#f59e0b]/10 transition group"
                  data-testid="link-quickstart"
                >
                  <Play className="w-5 h-5 text-[#f59e0b]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#f59e0b] transition">{t('publicPages.learn.developerCourse.developerTools.quickStart.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.developerCourse.developerTools.quickStart.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/installation"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#f97316]/5 border border-[#f97316]/20 hover:bg-[#f97316]/10 transition group"
                  data-testid="link-installation"
                >
                  <Download className="w-5 h-5 text-[#f97316]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#f97316] transition">{t('publicPages.learn.developerCourse.developerTools.installation.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.developerCourse.developerTools.installation.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/docs"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                  data-testid="link-documentation"
                >
                  <BookOpen className="w-5 h-5 text-[#00f0ff]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.learn.developerCourse.developerTools.documentation.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.developerCourse.developerTools.documentation.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/evm-migration"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                  data-testid="link-evm-migration"
                >
                  <Zap className="w-5 h-5 text-[#7000ff]" />
                  <div>
                    <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.learn.developerCourse.developerTools.evmMigration.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.developerCourse.developerTools.evmMigration.subtitle')}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Start Learning Card */}
            <div className="spotlight-card rounded-xl p-6 sticky top-24 border-[#f59e0b]/20">
              <Link href="/developers/quickstart">
                <button 
                  className="w-full bg-[#f59e0b] text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition shadow-[0_0_20px_rgba(245,158,11,0.4)] mb-6 flex items-center justify-center gap-2"
                  data-testid="button-start-learning"
                >
                  <Play className="w-5 h-5" /> {t('publicPages.common.getStarted')}
                </button>
              </Link>

              {/* Key Takeaways */}
              <div className="mb-6">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">{t('publicPages.learn.developerCourse.keyTakeawaysTitle')}</h3>
                <ul className="space-y-3">
                  {keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisites */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">{t('publicPages.learn.developerCourse.prerequisitesTitle')}</h3>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, index) => (
                    <li key={index}>
                      <Link 
                        href={prereq.link}
                        className="flex items-start gap-3 text-sm text-gray-400 hover:text-[#f59e0b] transition"
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

            {/* Certification Badge */}
            <div className="spotlight-card rounded-xl p-6 bg-[#f59e0b]/5 border-[#f59e0b]/30 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#f59e0b]/20 flex items-center justify-center mb-3">
                <Medal className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <h3 className="font-bold text-white mb-1">{t('publicPages.learn.developerCourse.certification.title')}</h3>
              <p className="text-xs text-gray-400">{t('publicPages.learn.developerCourse.certification.description')}</p>
            </div>

            {/* Resources */}
            <div className="spotlight-card rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">{t('publicPages.learn.developerCourse.resourcesTitle')}</h3>
              <div className="space-y-2">
                {resources.map((resource, index) => (
                  <Link 
                    key={index}
                    href={resource.href}
                    className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition group"
                    data-testid={`link-resource-${index}`}
                  >
                    <span className="text-sm text-gray-400 group-hover:text-[#f59e0b]">{resource.title}</span>
                    <ExternalLink className="w-3 h-3 text-gray-600" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
