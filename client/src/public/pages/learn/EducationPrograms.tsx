import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  GraduationCap, BookOpen, Code, TrendingUp, ArrowLeft, Clock, 
  ChevronRight, Award, Users, Zap, Shield, Target, Layers,
  Sparkles, CheckCircle, Star, Play, Trophy, LucideIcon
} from "lucide-react";

interface LearningPath {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  duration: string;
  level: string;
  link: string;
  color: string;
  courses: number;
}

interface FeaturedCourse {
  icon: LucideIcon;
  title: string;
  description: string;
  duration: string;
  level: string;
  link: string;
  color: string;
  tag?: string;
}

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EducationPrograms() {
  const { t } = useTranslation();

  const learningPaths: LearningPath[] = [
    {
      icon: BookOpen,
      title: t('publicPages.learn.educationPrograms.paths.beginner.title'),
      subtitle: t('publicPages.learn.educationPrograms.paths.beginner.subtitle'),
      duration: t('publicPages.learn.educationPrograms.paths.beginner.duration'),
      level: t('publicPages.learn.educationPrograms.paths.beginner.level'),
      link: "/learn/blockchain-basics",
      color: "#22c55e",
      courses: 4
    },
    {
      icon: TrendingUp,
      title: t('publicPages.learn.educationPrograms.paths.defi.title'),
      subtitle: t('publicPages.learn.educationPrograms.paths.defi.subtitle'),
      duration: t('publicPages.learn.educationPrograms.paths.defi.duration'),
      level: t('publicPages.learn.educationPrograms.paths.defi.level'),
      link: "/learn/intro-to-defi",
      color: "#3b82f6",
      courses: 6
    },
    {
      icon: Code,
      title: t('publicPages.learn.educationPrograms.paths.developer.title'),
      subtitle: t('publicPages.learn.educationPrograms.paths.developer.subtitle'),
      duration: t('publicPages.learn.educationPrograms.paths.developer.duration'),
      level: t('publicPages.learn.educationPrograms.paths.developer.level'),
      link: "/learn/developer-course",
      color: "#f59e0b",
      courses: 8
    },
    {
      icon: Shield,
      title: t('publicPages.learn.educationPrograms.paths.security.title'),
      subtitle: t('publicPages.learn.educationPrograms.paths.security.subtitle'),
      duration: t('publicPages.learn.educationPrograms.paths.security.duration'),
      level: t('publicPages.learn.educationPrograms.paths.security.level'),
      link: "/learn/trust-score",
      color: "#8b5cf6",
      courses: 5
    }
  ];

  const featuredCourses: FeaturedCourse[] = [
    {
      icon: Layers,
      title: t('publicPages.learn.educationPrograms.featured.blockchainBasics.title'),
      description: t('publicPages.learn.educationPrograms.featured.blockchainBasics.description'),
      duration: "2h",
      level: t('publicPages.learn.educationPrograms.levels.beginner'),
      link: "/learn/blockchain-basics",
      color: "#22c55e",
      tag: t('publicPages.learn.educationPrograms.tags.popular')
    },
    {
      icon: TrendingUp,
      title: t('publicPages.learn.educationPrograms.featured.introDefi.title'),
      description: t('publicPages.learn.educationPrograms.featured.introDefi.description'),
      duration: "3h",
      level: t('publicPages.learn.educationPrograms.levels.beginner'),
      link: "/learn/intro-to-defi",
      color: "#3b82f6"
    },
    {
      icon: Zap,
      title: t('publicPages.learn.educationPrograms.featured.defiMastery.title'),
      description: t('publicPages.learn.educationPrograms.featured.defiMastery.description'),
      duration: "6h",
      level: t('publicPages.learn.educationPrograms.levels.intermediate'),
      link: "/learn/defi-mastery",
      color: "#06b6d4",
      tag: t('publicPages.learn.educationPrograms.tags.advanced')
    },
    {
      icon: Code,
      title: t('publicPages.learn.educationPrograms.featured.developerCourse.title'),
      description: t('publicPages.learn.educationPrograms.featured.developerCourse.description'),
      duration: "8h",
      level: t('publicPages.learn.educationPrograms.levels.advanced'),
      link: "/learn/developer-course",
      color: "#f59e0b",
      tag: t('publicPages.learn.educationPrograms.tags.certification')
    },
    {
      icon: Shield,
      title: t('publicPages.learn.educationPrograms.featured.trustScore.title'),
      description: t('publicPages.learn.educationPrograms.featured.trustScore.description'),
      duration: "4h",
      level: t('publicPages.learn.educationPrograms.levels.intermediate'),
      link: "/learn/trust-score",
      color: "#8b5cf6"
    },
    {
      icon: Target,
      title: t('publicPages.learn.educationPrograms.featured.tokenomics.title'),
      description: t('publicPages.learn.educationPrograms.featured.tokenomics.description'),
      duration: "3h",
      level: t('publicPages.learn.educationPrograms.levels.intermediate'),
      link: "/learn/tokenomics",
      color: "#ec4899"
    }
  ];

  const benefits: Benefit[] = [
    {
      icon: Award,
      title: t('publicPages.learn.educationPrograms.benefits.certification.title'),
      description: t('publicPages.learn.educationPrograms.benefits.certification.description')
    },
    {
      icon: Users,
      title: t('publicPages.learn.educationPrograms.benefits.community.title'),
      description: t('publicPages.learn.educationPrograms.benefits.community.description')
    },
    {
      icon: Sparkles,
      title: t('publicPages.learn.educationPrograms.benefits.practical.title'),
      description: t('publicPages.learn.educationPrograms.benefits.practical.description')
    },
    {
      icon: Trophy,
      title: t('publicPages.learn.educationPrograms.benefits.career.title'),
      description: t('publicPages.learn.educationPrograms.benefits.career.description')
    }
  ];

  const stats = [
    { value: "25,000+", label: t('publicPages.learn.educationPrograms.stats.students') },
    { value: "35+", label: t('publicPages.learn.educationPrograms.stats.courses') },
    { value: "850+", label: t('publicPages.learn.educationPrograms.stats.certified') },
    { value: "99%", label: t('publicPages.learn.educationPrograms.stats.satisfaction') }
  ];

  return (
    <main className="flex-grow relative z-10 pt-24 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-12 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/20 via-[#7000ff]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link 
            href="/learn"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#00f0ff] mb-6 transition-colors group"
            data-testid="link-back-learn"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('publicPages.learn.educationPrograms.backToLearn')}
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="hidden md:flex w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#7000ff] border border-gray-300 dark:border-white/10 items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5">
                  {t('publicPages.learn.educationPrograms.tag')}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.learn.educationPrograms.title')}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                {t('publicPages.learn.educationPrograms.subtitle')}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[#00f0ff]">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        
        {/* Learning Paths */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.learn.educationPrograms.pathsTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('publicPages.learn.educationPrograms.pathsSubtitle')}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {learningPaths.map((path, index) => (
              <Link 
                key={index}
                href={path.link}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 cursor-pointer group block"
                data-testid={`card-path-${index}`}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `${path.color}15`, border: `1px solid ${path.color}30` }}
                  >
                    <path.icon className="w-6 h-6" style={{ color: path.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#00f0ff] transition-colors">{path.title}</h3>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{path.subtitle}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" /> {path.duration}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ backgroundColor: `${path.color}15`, color: path.color }}
                      >
                        {path.level}
                      </span>
                      <span className="text-gray-500">{path.courses} {t('publicPages.learn.educationPrograms.coursesLabel')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Courses */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.learn.educationPrograms.featuredTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('publicPages.learn.educationPrograms.featuredSubtitle')}</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <Link 
                key={index}
                href={course.link}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-5 cursor-pointer group block relative overflow-hidden"
                data-testid={`card-course-${index}`}
              >
                {course.tag && (
                  <div 
                    className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{ backgroundColor: `${course.color}20`, color: course.color }}
                  >
                    {course.tag}
                  </div>
                )}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: `${course.color}15`, border: `1px solid ${course.color}30` }}
                >
                  <course.icon className="w-5 h-5" style={{ color: course.color }} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#00f0ff] transition-colors">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" /> {course.duration}
                    </span>
                    <span className="text-gray-500">{course.level}</span>
                  </div>
                  <Play className="w-4 h-4 text-gray-600 group-hover:text-[#00f0ff] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('publicPages.learn.educationPrograms.benefitsTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">{t('publicPages.learn.educationPrograms.benefitsSubtitle')}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center" data-testid={`benefit-${index}`}>
                  <div className="w-14 h-14 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-[#00f0ff]" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* University Partnerships CTA */}
        <div className="mb-16">
          <Link 
            href="/learn/universities"
            className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8 block group cursor-pointer border-[#7000ff]/20 hover:border-[#7000ff]/40 transition-colors"
            data-testid="link-universities"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7000ff] to-[#00f0ff] flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#7000ff] transition-colors">
                  {t('publicPages.learn.educationPrograms.universities.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('publicPages.learn.educationPrograms.universities.description')}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-[#7000ff] transition-colors" />
            </div>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8 bg-gradient-to-br from-[#00f0ff]/5 to-[#7000ff]/5 border-[#00f0ff]/20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.learn.educationPrograms.cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">{t('publicPages.learn.educationPrograms.cta.description')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/learn/blockchain-basics">
                <button 
                  className="bg-[#00f0ff] text-black font-bold px-8 py-3 rounded-lg hover:bg-cyan-300 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2"
                  data-testid="button-start-learning"
                >
                  <Play className="w-5 h-5" /> {t('publicPages.learn.educationPrograms.cta.startLearning')}
                </button>
              </Link>
              <Link href="/learn/developer-course">
                <button 
                  className="border border-[#7000ff] text-[#7000ff] font-bold px-8 py-3 rounded-lg hover:bg-[#7000ff]/10 transition flex items-center gap-2"
                  data-testid="button-developer-path"
                >
                  <Code className="w-5 h-5" /> {t('publicPages.learn.educationPrograms.cta.developerPath')}
                </button>
              </Link>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
