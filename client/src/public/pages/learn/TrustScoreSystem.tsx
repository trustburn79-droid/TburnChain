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
  AlertTriangle
} from "lucide-react";

export default function TrustScoreSystem() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const evaluationPhilosophy = [
    {
      icon: Layers,
      title: t('publicPages.learn.trustScore.philosophy.comprehensive.title'),
      description: t('publicPages.learn.trustScore.philosophy.comprehensive.description'),
      color: "#7000ff",
    },
    {
      icon: Timer,
      title: t('publicPages.learn.trustScore.philosophy.realtime.title'),
      description: t('publicPages.learn.trustScore.philosophy.realtime.description'),
      color: "#00f0ff",
    },
    {
      icon: Search,
      title: t('publicPages.learn.trustScore.philosophy.transparent.title'),
      description: t('publicPages.learn.trustScore.philosophy.transparent.description'),
      color: "#00ff9d",
    },
    {
      icon: Bot,
      title: t('publicPages.learn.trustScore.philosophy.objective.title'),
      description: t('publicPages.learn.trustScore.philosophy.objective.description'),
      color: "#ffd700",
    },
  ];

  const scoreComponents = [
    {
      icon: UserRound,
      title: t('publicPages.learn.trustScore.components.teamTransparency.title'),
      points: 30,
      color: "#7000ff",
      stars: 5,
      items: [
        { label: t('publicPages.learn.trustScore.components.teamTransparency.items.realName'), pts: 10 },
        { label: t('publicPages.learn.trustScore.components.teamTransparency.items.experience'), pts: 8 },
        { label: t('publicPages.learn.trustScore.components.teamTransparency.items.kyc'), pts: 7 },
        { label: t('publicPages.learn.trustScore.components.teamTransparency.items.communication'), pts: 5 },
      ],
    },
    {
      icon: Code,
      title: t('publicPages.learn.trustScore.components.technical.title'),
      points: 25,
      color: "#00f0ff",
      stars: 4,
      items: [
        { label: t('publicPages.learn.trustScore.components.technical.items.codeQuality'), pts: 10 },
        { label: t('publicPages.learn.trustScore.components.technical.items.securityAudit'), pts: 8 },
        { label: t('publicPages.learn.trustScore.components.technical.items.testCoverage'), pts: 4 },
        { label: t('publicPages.learn.trustScore.components.technical.items.documentation'), pts: 3 },
      ],
    },
    {
      icon: Coins,
      title: t('publicPages.learn.trustScore.components.financial.title'),
      points: 20,
      color: "#00ff9d",
      stars: 4,
      items: [
        { label: t('publicPages.learn.trustScore.components.financial.items.walletDisclosure'), pts: 6 },
        { label: t('publicPages.learn.trustScore.components.financial.items.fundingReport'), pts: 6 },
        { label: t('publicPages.learn.trustScore.components.financial.items.accountingAudit'), pts: 5 },
        { label: t('publicPages.learn.trustScore.components.financial.items.distributionData'), pts: 3 },
      ],
    },
  ];

  const gradeSystem = [
    { grade: "S", range: "85-100", title: t('publicPages.learn.trustScore.grades.s.title'), description: t('publicPages.learn.trustScore.grades.s.description'), color: "#ffd700" },
    { grade: "A", range: "70-84", title: t('publicPages.learn.trustScore.grades.a.title'), description: t('publicPages.learn.trustScore.grades.a.description'), color: "#00ff9d" },
    { grade: "B", range: "55-69", title: t('publicPages.learn.trustScore.grades.b.title'), description: t('publicPages.learn.trustScore.grades.b.description'), color: "#00f0ff" },
    { grade: "C", range: "40-54", title: t('publicPages.learn.trustScore.grades.c.title'), description: t('publicPages.learn.trustScore.grades.c.description'), color: "#ff9900" },
    { grade: "F", range: "0-39", title: t('publicPages.learn.trustScore.grades.f.title'), description: t('publicPages.learn.trustScore.grades.f.description'), color: "#ff0055" },
  ];

  const verificationProcess = [
    { step: 1, title: t('publicPages.learn.trustScore.process.dataCollection.title'), description: t('publicPages.learn.trustScore.process.dataCollection.description'), color: "#00f0ff" },
    { step: 2, title: t('publicPages.learn.trustScore.process.aiAnalysis.title'), description: t('publicPages.learn.trustScore.process.aiAnalysis.description'), color: "#7000ff" },
    { step: 3, title: t('publicPages.learn.trustScore.process.expertReview.title'), description: t('publicPages.learn.trustScore.process.expertReview.description'), color: "#ffffff" },
    { step: 4, title: t('publicPages.learn.trustScore.process.onchainCommit.title'), description: t('publicPages.learn.trustScore.process.onchainCommit.description'), color: "#00ff9d" },
  ];

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
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative pt-4 pb-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <ShieldCheck className="w-4 h-4" /> {t('publicPages.learn.trustScore.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-page-title">
            {t('publicPages.learn.trustScore.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('publicPages.learn.trustScore.subtitle')}
          </p>
        </div>
      </section>

      {/* Evaluation Philosophy Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.learn.trustScore.evaluationPhilosophy')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {evaluationPhilosophy.map((item, index) => (
              <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6" data-testid={`philosophy-card-${index}`}>
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score Components Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.learn.trustScore.scoreComponents')}</h2>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">{t('publicPages.learn.trustScore.scoreComponentsStatus')}</p>
          </div>

          <div className="space-y-6">
            {scoreComponents.map((component, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl"
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
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{component.title}</h3>
                      <div className="flex gap-1 mt-1" style={{ color: component.color }}>
                        {Array.from({ length: component.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                      {component.points} <span className="text-sm text-gray-500">{t('publicPages.learn.trustScore.pts')}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                  {component.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="flex justify-between items-center p-3 bg-gray-100 dark:bg-black/40 rounded border border-gray-200 dark:border-white/5"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-xs font-mono" style={{ color: component.color }}>{item.pts}{t('publicPages.learn.trustScore.ptsUnit')}</span>
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.learn.trustScore.gradeSystem')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradeSystem.map((grade, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group"
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{grade.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{grade.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-lg bg-amber-50 dark:bg-[#ffd700]/5 border border-amber-200 dark:border-[#ffd700]/20 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-[#ffd700] shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="text-[#ffd700] font-bold">{t('publicPages.learn.trustScore.importantLabel')}</span> {t('publicPages.learn.trustScore.importantNote')}
            </p>
          </div>
        </div>
      </section>

      {/* Verification Process Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.learn.trustScore.verificationProcess')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {verificationProcess.map((step, index) => (
              <div key={index} className="relative text-center group" data-testid={`process-step-${step.step}`}>
                <div 
                  className="w-16 h-16 mx-auto rounded-full bg-white dark:bg-black flex items-center justify-center text-xl font-bold mb-4 group-hover:text-black transition-colors"
                  style={{ 
                    border: `1px solid ${step.color}`,
                    color: step.color,
                    boxShadow: `0 0 20px ${step.color}20`
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform">{step.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
