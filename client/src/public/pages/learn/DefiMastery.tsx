import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Coins, Layers, ArrowLeft, Clock, ChevronRight, Play, 
  Check, Box, Wallet, Code, ArrowRightLeft, HandCoins, 
  Droplets, TrendingUp, FileText, Zap, BookOpen, Terminal, LucideIcon
} from "lucide-react";

interface StatData {
  value: string;
  label: string;
  color: string;
}

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

export default function DefiMastery() {
  const { t } = useTranslation();

  const statsData: StatData[] = [
    { value: t('publicPages.learn.defiMastery.stats.tvl.value'), label: t('publicPages.learn.defiMastery.stats.tvl.label'), color: "#7000ff" },
    { value: t('publicPages.learn.defiMastery.stats.apy.value'), label: t('publicPages.learn.defiMastery.stats.apy.label'), color: "#ff00ff" },
    { value: t('publicPages.learn.defiMastery.stats.protocols.value'), label: t('publicPages.learn.defiMastery.stats.protocols.label'), color: "#00f0ff" },
  ];

  const curriculumModules: CurriculumModule[] = [
    {
      icon: ArrowRightLeft,
      title: t('publicPages.learn.defiMastery.curriculum.module1.title'),
      subtitle: t('publicPages.learn.defiMastery.curriculum.module1.subtitle'),
      duration: t('publicPages.learn.defiMastery.curriculum.module1.duration'),
      link: "/developers/docs"
    },
    {
      icon: HandCoins,
      title: t('publicPages.learn.defiMastery.curriculum.module2.title'),
      subtitle: t('publicPages.learn.defiMastery.curriculum.module2.subtitle'),
      duration: t('publicPages.learn.defiMastery.curriculum.module2.duration'),
      link: "/developers/api"
    },
    {
      icon: Droplets,
      title: t('publicPages.learn.defiMastery.curriculum.module3.title'),
      subtitle: t('publicPages.learn.defiMastery.curriculum.module3.subtitle'),
      duration: t('publicPages.learn.defiMastery.curriculum.module3.duration'),
      link: "/developers/contracts"
    },
    {
      icon: TrendingUp,
      title: t('publicPages.learn.defiMastery.curriculum.module4.title'),
      subtitle: t('publicPages.learn.defiMastery.curriculum.module4.subtitle'),
      duration: t('publicPages.learn.defiMastery.curriculum.module4.duration'),
      link: "/developers/sdk"
    },
  ];

  const keyTakeaways: string[] = [
    t('publicPages.learn.defiMastery.keyTakeaways.item1'),
    t('publicPages.learn.defiMastery.keyTakeaways.item2'),
    t('publicPages.learn.defiMastery.keyTakeaways.item3'),
  ];

  const prerequisites: Prerequisite[] = [
    { icon: Box, text: t('publicPages.learn.defiMastery.prerequisites.item1'), link: "/learn/blockchain-basics" },
    { icon: Wallet, text: t('publicPages.learn.defiMastery.prerequisites.item2'), link: "/learn/wallet" },
  ];

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-12 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/20 via-[#ff00ff]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/learn/education-programs"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7000ff] mb-6 transition-colors group"
            data-testid="link-back-education"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.learn.defiMastery.backToEducation')}
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="hidden md:flex w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7000ff] to-[#ff00ff] border border-gray-300 dark:border-white/10 items-center justify-center shadow-[0_0_30px_rgba(112,0,255,0.2)]">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#7000ff] text-[#7000ff] bg-[#7000ff]/5">
                  {t('publicPages.learn.defiMastery.tag')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {t('publicPages.learn.defiMastery.duration')}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.learn.defiMastery.title')}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                {t('publicPages.learn.defiMastery.subtitle')}
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
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card p-5 rounded-xl text-center"
              style={{ borderBottom: `2px solid ${stat.color}` }}
              data-testid={`stat-card-${index}`}
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{stat.value}</div>
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
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6 text-[#7000ff]" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.learn.defiMastery.courseOverview.title')}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {t('publicPages.learn.defiMastery.courseOverview.description')}
              </p>

              <div className="mt-6 p-4 border border-gray-300 dark:border-white/10 border-dashed rounded-lg bg-gray-50 dark:bg-black/20">
                <div className="aspect-video bg-gradient-to-br from-[#7000ff]/10 to-[#ff00ff]/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7000ff]/20 flex items-center justify-center">
                      <Play className="w-8 h-8 text-[#7000ff]" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('publicPages.learn.defiMastery.courseOverview.videoTitle')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('publicPages.learn.defiMastery.courseOverview.videoSubtitle')}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">{t('publicPages.learn.defiMastery.courseOverview.figureCaption')}</p>
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.learn.defiMastery.curriculumTitle')}</h2>
              <div className="space-y-4">
                {curriculumModules.map((module, index) => (
                  <Link 
                    key={index}
                    href={module.link}
                    className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-5 cursor-pointer group block"
                    data-testid={`card-module-${index + 1}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#7000ff]/10 border border-[#7000ff]/20 flex items-center justify-center group-hover:bg-[#7000ff]/20 transition-colors">
                          <module.icon className="w-5 h-5 text-[#7000ff]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#7000ff] transition-colors">{module.title}</h3>
                          <p className="text-xs text-gray-500">{module.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{module.duration}</span>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Developer Resources */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.learn.defiMastery.developerResources.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {t('publicPages.learn.defiMastery.developerResources.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  href="/developers/contracts"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
                  data-testid="link-smart-contracts"
                >
                  <Code className="w-5 h-5 text-[#7000ff]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#7000ff] transition">{t('publicPages.learn.defiMastery.developerResources.smartContracts.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.defiMastery.developerResources.smartContracts.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/sdk"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#ff00ff]/5 border border-[#ff00ff]/20 hover:bg-[#ff00ff]/10 transition group"
                  data-testid="link-sdk-guide"
                >
                  <BookOpen className="w-5 h-5 text-[#ff00ff]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#ff00ff] transition">{t('publicPages.learn.defiMastery.developerResources.sdkGuide.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.defiMastery.developerResources.sdkGuide.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/api"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
                  data-testid="link-api-reference"
                >
                  <FileText className="w-5 h-5 text-[#00f0ff]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#00f0ff] transition">{t('publicPages.learn.defiMastery.developerResources.apiReference.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.defiMastery.developerResources.apiReference.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/websocket"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 hover:bg-[#00ff9d]/10 transition group"
                  data-testid="link-websocket"
                >
                  <Zap className="w-5 h-5 text-[#00ff9d]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#00ff9d] transition">{t('publicPages.learn.defiMastery.developerResources.websocket.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.defiMastery.developerResources.websocket.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/examples"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
                  data-testid="link-code-examples"
                >
                  <Terminal className="w-5 h-5 text-[#ffd700]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#ffd700] transition">{t('publicPages.learn.defiMastery.developerResources.codeExamples.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.defiMastery.developerResources.codeExamples.subtitle')}</p>
                  </div>
                </Link>
                <Link 
                  href="/developers/quickstart"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#ff0055]/5 border border-[#ff0055]/20 hover:bg-[#ff0055]/10 transition group"
                  data-testid="link-quickstart"
                >
                  <Play className="w-5 h-5 text-[#ff0055]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#ff0055] transition">{t('publicPages.learn.defiMastery.developerResources.quickStart.title')}</p>
                    <p className="text-xs text-gray-500">{t('publicPages.learn.defiMastery.developerResources.quickStart.subtitle')}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Start Learning Card */}
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 sticky top-24 border-[#7000ff]/20">
              <Link href="/learn/intro-to-defi">
                <button 
                  className="w-full bg-[#7000ff] text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition shadow-[0_0_20px_rgba(112,0,255,0.4)] mb-6 flex items-center justify-center gap-2"
                  data-testid="button-start-learning"
                >
                  <Play className="w-5 h-5" /> {t('publicPages.common.getStarted')}
                </button>
              </Link>

              {/* Key Takeaways */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">{t('publicPages.learn.defiMastery.keyTakeawaysTitle')}</h3>
                <ul className="space-y-3">
                  {keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-[#7000ff] mt-0.5 flex-shrink-0" />
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisites */}
              <div className="border-t border-gray-300 dark:border-white/10 pt-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">{t('publicPages.learn.defiMastery.prerequisitesTitle')}</h3>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, index) => (
                    <li key={index}>
                      <Link 
                        href={prereq.link}
                        className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7000ff] transition"
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
              className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group cursor-pointer block"
              data-testid="link-developer-course"
            >
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.learn.defiMastery.upNext.label')}</h3>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Code className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-400 transition">{t('publicPages.learn.defiMastery.upNext.title')}</h4>
                  <p className="text-xs text-gray-500">{t('publicPages.learn.defiMastery.upNext.subtitle')}</p>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </main>
  );
}
