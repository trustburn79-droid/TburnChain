import { Link } from "wouter";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Download,
  ArrowRight,
  Presentation
} from "lucide-react";

export default function Universities() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const educationFeatures = [
    {
      icon: BookOpen,
      title: t('publicPages.learn.universities.features.materials.title'),
      description: t('publicPages.learn.universities.features.materials.description'),
      color: "#00f0ff",
    },
    {
      icon: Users,
      title: t('publicPages.learn.universities.features.community.title'),
      description: t('publicPages.learn.universities.features.community.description'),
      color: "#7000ff",
    },
    {
      icon: Award,
      title: t('publicPages.learn.universities.features.grants.title'),
      description: t('publicPages.learn.universities.features.grants.description'),
      color: "#ffd700",
    },
  ];

  const studentOpportunities = [
    {
      number: "01",
      title: t('publicPages.learn.universities.opportunities.startChapter.title'),
      description: t('publicPages.learn.universities.opportunities.startChapter.description'),
      hoverColor: "#00ff9d",
    },
    {
      number: "02",
      title: t('publicPages.learn.universities.opportunities.joinHackathon.title'),
      description: t('publicPages.learn.universities.opportunities.joinHackathon.description'),
      hoverColor: "#00f0ff",
    },
    {
      number: "03",
      title: t('publicPages.learn.universities.opportunities.applyGrants.title'),
      description: t('publicPages.learn.universities.opportunities.applyGrants.description'),
      hoverColor: "#7000ff",
    },
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
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ff9d]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00ff9d] mb-6">
            <GraduationCap className="w-4 h-4" /> {t('publicPages.learn.universities.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight" data-testid="text-page-title">
            {t('publicPages.learn.universities.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {t('publicPages.learn.universities.subtitle')}
          </p>
        </div>
      </section>

      {/* Education at Scale Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('publicPages.learn.universities.educationSection.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('publicPages.learn.universities.educationSection.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {educationFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8 group"
                data-testid={`education-feature-${index}`}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: `${feature.color}10`,
                    border: `1px solid ${feature.color}30`
                  }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Educators Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-2xl p-1 relative overflow-hidden" data-testid="educators-section">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7000ff]/10 to-[#00f0ff]/10 pointer-events-none" />
            
            <div className="bg-gray-50 dark:bg-black/80 backdrop-blur-xl rounded-xl p-10 md:p-12 relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 rounded bg-[#7000ff]/20 text-[#7000ff] text-xs font-bold mb-4">
                  {t('publicPages.learn.universities.educators.badge')}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('publicPages.learn.universities.educators.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {t('publicPages.learn.universities.educators.description')}
                </p>
                <Link href="/learn">
                  <button 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ 
                      background: "linear-gradient(90deg, #7000ff, #00f0ff)",
                      boxShadow: "0 0 15px rgba(112, 0, 255, 0.3)"
                    }}
                    data-testid="button-educator-resources"
                  >
                    <Download className="w-4 h-4" /> {t('publicPages.learn.universities.educators.button')}
                  </button>
                </Link>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <Presentation className="w-32 h-32 text-gray-200 dark:text-white/5 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Opportunities Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('publicPages.learn.universities.students.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {t('publicPages.learn.universities.students.description')}
              </p>
              <div className="p-4 border-l-2 border-[#00f0ff] bg-[#00f0ff]/5">
                <p className="text-sm text-[#00f0ff] italic">
                  "{t('publicPages.learn.universities.students.quote')}"
                </p>
              </div>
            </div>

            <div className="md:w-2/3 grid gap-4">
              {studentOpportunities.map((opportunity, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card p-6 rounded-xl flex items-center gap-6 group cursor-pointer"
                  data-testid={`opportunity-${index}`}
                >
                  <div 
                    className="text-4xl font-bold text-gray-300 dark:text-white/20 font-mono transition-colors"
                    style={{ 
                      '--hover-color': opportunity.hoverColor 
                    } as React.CSSProperties}
                  >
                    <span className="group-hover:text-[var(--hover-color)]">{opportunity.number}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{opportunity.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
