import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Shield, ArrowLeft, Clock, Coins, ArrowRightLeft, 
  HandCoins, TrendingUp, Bot, UserCheck, Vote,
  Check, BookOpen, Code, FileText, Zap, Play,
  AlertTriangle, ExternalLink, LucideIcon
} from "lucide-react";

interface ScoreFormulaItem {
  percentage: string;
  title: string;
  subtitle: string;
  color: string;
}

interface VerificationStage {
  icon: LucideIcon;
  title: string;
  description: string;
  duration: string;
  color: string;
}

interface ScoreAction {
  range: string;
  label: string;
  description: string;
  color: string;
}

interface BurnStep {
  step: string;
  title: string;
  description: string;
}

export default function IntroToDefi() {
  const { t } = useTranslation();

  const scoreFormula: ScoreFormulaItem[] = [
    { 
      percentage: t('publicPages.learn.introToDefi.scoreFormula.burnCompliance.percentage'), 
      title: t('publicPages.learn.introToDefi.scoreFormula.burnCompliance.title'), 
      subtitle: t('publicPages.learn.introToDefi.scoreFormula.burnCompliance.subtitle'), 
      color: "#00ff9d" 
    },
    { 
      percentage: t('publicPages.learn.introToDefi.scoreFormula.devProgress.percentage'), 
      title: t('publicPages.learn.introToDefi.scoreFormula.devProgress.title'), 
      subtitle: t('publicPages.learn.introToDefi.scoreFormula.devProgress.subtitle'), 
      color: "#00f0ff" 
    },
    { 
      percentage: t('publicPages.learn.introToDefi.scoreFormula.transparency.percentage'), 
      title: t('publicPages.learn.introToDefi.scoreFormula.transparency.title'), 
      subtitle: t('publicPages.learn.introToDefi.scoreFormula.transparency.subtitle'), 
      color: "#7000ff" 
    },
  ];

  const verificationStages: VerificationStage[] = [
    {
      icon: Bot,
      title: t('publicPages.learn.introToDefi.verification.stage1.title'),
      description: t('publicPages.learn.introToDefi.verification.stage1.description'),
      duration: t('publicPages.learn.introToDefi.verification.stage1.duration'),
      color: "#00f0ff"
    },
    {
      icon: UserCheck,
      title: t('publicPages.learn.introToDefi.verification.stage2.title'),
      description: t('publicPages.learn.introToDefi.verification.stage2.description'),
      duration: t('publicPages.learn.introToDefi.verification.stage2.duration'),
      color: "#7000ff"
    },
    {
      icon: Vote,
      title: t('publicPages.learn.introToDefi.verification.stage3.title'),
      description: t('publicPages.learn.introToDefi.verification.stage3.description'),
      duration: t('publicPages.learn.introToDefi.verification.stage3.duration'),
      color: "#00ff9d"
    },
  ];

  const scoreActions: ScoreAction[] = [
    { 
      range: "80-100", 
      label: t('publicPages.learn.introToDefi.scoreActions.excellent.label'), 
      description: t('publicPages.learn.introToDefi.scoreActions.excellent.description'), 
      color: "rgb(34, 197, 94)" 
    },
    { 
      range: "60-79", 
      label: t('publicPages.learn.introToDefi.scoreActions.good.label'), 
      description: t('publicPages.learn.introToDefi.scoreActions.good.description'), 
      color: "rgb(59, 130, 246)" 
    },
    { 
      range: "40-59", 
      label: t('publicPages.learn.introToDefi.scoreActions.warning.label'), 
      description: t('publicPages.learn.introToDefi.scoreActions.warning.description'), 
      color: "rgb(234, 179, 8)" 
    },
    { 
      range: "< 40", 
      label: t('publicPages.learn.introToDefi.scoreActions.danger.label'), 
      description: t('publicPages.learn.introToDefi.scoreActions.danger.description'), 
      color: "rgb(220, 38, 38)" 
    },
  ];

  const burnSteps: BurnStep[] = [
    { step: "1", title: t('publicPages.learn.introToDefi.burnSteps.step1.title'), description: t('publicPages.learn.introToDefi.burnSteps.step1.description') },
    { step: "2", title: t('publicPages.learn.introToDefi.burnSteps.step2.title'), description: t('publicPages.learn.introToDefi.burnSteps.step2.description') },
    { step: "3", title: t('publicPages.learn.introToDefi.burnSteps.step3.title'), description: t('publicPages.learn.introToDefi.burnSteps.step3.description') },
  ];

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-16 mb-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff9d]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/learn/education-programs"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00ff9d] mb-6 transition-colors group"
            data-testid="link-back-education"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.learn.introToDefi.backToEducation')}
          </Link>
          
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#00ff9d]/30 bg-[#00ff9d]/5 text-[#00ff9d] text-xs">
            <Shield className="w-4 h-4" /> {t('publicPages.learn.introToDefi.tag')}
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('publicPages.learn.introToDefi.title')}
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('publicPages.learn.introToDefi.subtitle')}
          </p>
          
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#00ff9d] text-[#00ff9d] bg-[#00ff9d]/5">
              {t('publicPages.common.beginner')}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" /> {t('publicPages.learn.introToDefi.duration')}
            </span>
          </div>
        </div>
      </section>

      {/* Score Formula Section */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-20">
        <div className="spotlight-card rounded-2xl p-10 border-[#00ff9d]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff9d]/10 rounded-full blur-[80px]" />
          
          <h2 className="text-2xl font-bold text-center text-white mb-10">{t('publicPages.learn.introToDefi.scoreFormula.title')}</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 font-mono text-sm md:text-base">
            {scoreFormula.map((item, index) => (
              <div key={index} className="flex items-center gap-4 md:gap-8">
                <div 
                  className="bg-black/40 p-6 rounded-xl text-center flex-1 w-full hover:scale-105 transition-transform"
                  style={{ border: `1px solid ${item.color}30` }}
                >
                  <div className="text-3xl font-bold mb-2" style={{ color: item.color }}>{item.percentage}</div>
                  <div className="text-gray-300">{item.title}</div>
                  <p className="text-xs text-gray-500 mt-2">{item.subtitle}</p>
                </div>
                {index < scoreFormula.length - 1 && (
                  <div className="text-2xl text-gray-600 hidden md:block">+</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Check className="w-6 h-6 text-[#00ff9d]" />
          <h2 className="text-2xl font-bold text-white">{t('publicPages.learn.introToDefi.verification.title')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {verificationStages.map((stage, index) => (
            <div key={index} className="spotlight-card rounded-xl p-6 group">
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stage.color}10` }}
                >
                  <stage.icon className="w-5 h-5" style={{ color: stage.color }} />
                </div>
                <span 
                  className="text-xs font-mono px-2 py-1 rounded"
                  style={{ color: stage.color, border: `1px solid ${stage.color}30` }}
                >
                  {stage.duration}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{stage.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{stage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Actions by Score */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <h2 className="text-2xl font-bold text-white mb-8">{t('publicPages.learn.introToDefi.scoreActions.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreActions.map((action, index) => (
            <div 
              key={index}
              className="spotlight-card p-6 rounded-xl"
              style={{ borderLeft: `4px solid ${action.color}` }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: action.color }}>{action.range}</div>
              <div className="text-white font-bold mb-3">{action.label}</div>
              <p className="text-xs text-gray-400">{action.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hybrid Forced Burn */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="spotlight-card rounded-2xl p-8 border border-white/10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                <AlertTriangle className="w-6 h-6 text-[#ff0055]" /> {t('publicPages.learn.introToDefi.hybridBurn.title')}
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {t('publicPages.learn.introToDefi.hybridBurn.description')}
              </p>
              
              <ul className="space-y-4">
                {burnSteps.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff] text-xs mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="h-64 bg-black/40 rounded-xl border border-dashed border-gray-700 flex items-center justify-center flex-col text-gray-500">
              <Coins className="w-12 h-12 mb-2 text-[#00ff9d]/50" />
              <span className="text-xs mt-2">{t('publicPages.learn.introToDefi.hybridBurn.figureCaption')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Resources */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="spotlight-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">{t('publicPages.learn.introToDefi.developerResources.title')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('publicPages.learn.introToDefi.developerResources.description')}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/developers/contracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00ff9d]/5 border border-[#00ff9d]/20 hover:bg-[#00ff9d]/10 transition group"
              data-testid="link-smart-contracts"
            >
              <Code className="w-5 h-5 text-[#00ff9d]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00ff9d] transition">{t('publicPages.learn.introToDefi.developerResources.smartContracts.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.developerResources.smartContracts.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/sdk"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/5 border border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 transition group"
              data-testid="link-sdk-guide"
            >
              <BookOpen className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#00f0ff] transition">{t('publicPages.learn.introToDefi.developerResources.sdkGuide.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.developerResources.sdkGuide.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/api"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#7000ff]/5 border border-[#7000ff]/20 hover:bg-[#7000ff]/10 transition group"
              data-testid="link-api-reference"
            >
              <FileText className="w-5 h-5 text-[#7000ff]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#7000ff] transition">{t('publicPages.learn.introToDefi.developerResources.apiReference.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.developerResources.apiReference.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/websocket"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/20 hover:bg-[#ffd700]/10 transition group"
              data-testid="link-websocket"
            >
              <Zap className="w-5 h-5 text-[#ffd700]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ffd700] transition">{t('publicPages.learn.introToDefi.developerResources.websocket.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.developerResources.websocket.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/quickstart"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#ff0055]/5 border border-[#ff0055]/20 hover:bg-[#ff0055]/10 transition group"
              data-testid="link-quickstart"
            >
              <Play className="w-5 h-5 text-[#ff0055]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#ff0055] transition">{t('publicPages.learn.introToDefi.developerResources.quickStart.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.developerResources.quickStart.subtitle')}</p>
              </div>
            </Link>
            <Link 
              href="/developers/examples"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#f97316]/5 border border-[#f97316]/20 hover:bg-[#f97316]/10 transition group"
              data-testid="link-examples"
            >
              <ExternalLink className="w-5 h-5 text-[#f97316]" />
              <div>
                <p className="font-medium text-white group-hover:text-[#f97316] transition">{t('publicPages.learn.introToDefi.developerResources.codeExamples.title')}</p>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.developerResources.codeExamples.subtitle')}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Learn Pages */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Link 
            href="/learn/defi-mastery"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-defi-mastery"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.learn.introToDefi.continueLearning.label')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#7000ff]/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-[#7000ff]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#7000ff] transition">{t('publicPages.learn.introToDefi.continueLearning.defiMastery.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.continueLearning.defiMastery.level')}</p>
              </div>
            </div>
          </Link>
          <Link 
            href="/learn/developer-course"
            className="spotlight-card rounded-xl p-6 group cursor-pointer block"
            data-testid="link-developer-course"
          >
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t('publicPages.learn.introToDefi.forDevelopers.label')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#f59e0b] transition">{t('publicPages.learn.introToDefi.forDevelopers.developerCourse.title')}</h4>
                <p className="text-xs text-gray-500">{t('publicPages.learn.introToDefi.forDevelopers.developerCourse.level')}</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
