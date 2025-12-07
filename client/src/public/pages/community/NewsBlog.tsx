import { 
  Newspaper, Search, Star, Calendar, Clock, Eye, ArrowRight,
  Megaphone, Cpu, Handshake, Coins, Shield, Code, Lock, LineChart, Mail, Loader2, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface AnnouncementData {
  id: string;
  title: string;
  titleKo?: string;
  content: string;
  contentKo?: string;
  type: 'update' | 'news' | 'alert' | 'feature';
  createdAt: number;
  isImportant: boolean;
  views?: number;
  isPinned?: boolean;
}

const categoryIcons: Record<string, any> = {
  news: Megaphone,
  update: Cpu,
  alert: Shield,
  feature: Code,
  announcement: Megaphone,
  technology: Cpu,
  security: Shield,
  tokenomics: Coins,
  partnership: Handshake,
  defi: LineChart,
};

const categoryGradients: Record<string, string> = {
  news: "from-[#7000ff] to-blue-600",
  update: "from-cyan-500 to-blue-500",
  alert: "from-red-500 to-orange-600",
  feature: "from-green-500 to-emerald-600",
  announcement: "from-[#7000ff] to-blue-600",
  technology: "from-cyan-500 to-blue-500",
  security: "from-green-500 to-emerald-600",
  tokenomics: "from-amber-500 to-orange-600",
  partnership: "from-indigo-500 to-violet-600",
  defi: "from-rose-500 to-pink-600",
};

const categoryColors: Record<string, string> = {
  news: "text-[#7000ff]",
  update: "text-[#00f0ff]",
  alert: "text-red-500",
  feature: "text-[#00ff9d]",
  announcement: "text-[#7000ff]",
  technology: "text-[#00f0ff]",
  security: "text-[#00ff9d]",
  tokenomics: "text-[#ffd700]",
  partnership: "text-violet-400",
  defi: "text-[#ff0055]",
};

export default function NewsBlog() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const isKorean = i18n.language === 'ko';

  const { data: announcements, isLoading, error } = useQuery<AnnouncementData[]>({
    queryKey: ['/api/community/announcements'],
    refetchInterval: 30000,
  });

  const categories = [
    { key: "all", label: t('publicPages.community.news.categories.all') },
    { key: "news", label: t('publicPages.community.news.categories.announcement') },
    { key: "update", label: t('publicPages.community.news.categories.technology') },
    { key: "alert", label: t('publicPages.community.news.categories.security') },
    { key: "feature", label: t('publicPages.community.news.categories.defi') },
  ];

  const filteredAnnouncements = announcements?.filter(ann => {
    const matchesCategory = activeCategory === "all" || ann.type === activeCategory;
    const title = isKorean && ann.titleKo ? ann.titleKo : ann.title;
    const content = isKorean && ann.contentKo ? ann.contentKo : ann.content;
    const matchesSearch = !searchQuery || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const featuredNews = filteredAnnouncements.filter(ann => ann.isImportant || ann.isPinned).slice(0, 3);
  const latestArticles = filteredAnnouncements.filter(ann => !ann.isImportant && !ann.isPinned).slice(0, 6);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const formatViews = (views: number = 0) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: t('publicPages.community.news.newsletter.error'), description: t('publicPages.community.news.newsletter.invalidEmail'), variant: "destructive" });
      return;
    }
    toast({ title: t('publicPages.community.news.newsletter.success'), description: t('publicPages.community.news.newsletter.subscribed') });
    setEmail("");
  };

  const getTitle = (ann: AnnouncementData) => isKorean && ann.titleKo ? ann.titleKo : ann.title;
  const getContent = (ann: AnnouncementData) => isKorean && ann.contentKo ? ann.contentKo : ann.content;

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Newspaper className="w-3 h-3" /> {t('publicPages.community.news.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('publicPages.community.news.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.community.news.subtitle')}
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-8 px-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40">
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder={t('publicPages.community.news.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
              data-testid="input-search-news"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                  activeCategory === cat.key
                    ? "bg-[#7000ff] text-white border border-[#7000ff]"
                    : "bg-[#7000ff]/10 border border-[#7000ff]/20 text-purple-300 hover:bg-[#7000ff]/20 hover:border-[#7000ff]/40 hover:text-white"
                }`}
                data-testid={`button-category-${cat.key}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-3 py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#7000ff]" />
              <span className="text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('common.error')}</span>
            </div>
          </div>
        </section>
      )}

      {/* Featured News */}
      {!isLoading && !error && featuredNews.length > 0 && (
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#ffd700]" /> {t('publicPages.community.news.featuredTitle')}
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredNews.map((article) => {
                const Icon = categoryIcons[article.type] || Megaphone;
                const gradient = categoryGradients[article.type] || "from-[#7000ff] to-blue-600";
                
                return (
                  <Link 
                    key={article.id} 
                    href={`/community/news/${article.id}`}
                    className="spotlight-card rounded-xl p-0 border border-gray-300 dark:border-white/10 group overflow-hidden block h-full bg-white dark:bg-transparent shadow-sm"
                    data-testid={`link-article-${article.id}`}
                  >
                    <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gray-50 dark:bg-black/20 group-hover:bg-transparent transition-colors" />
                      <div className="absolute top-4 left-4 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Icon className="w-3 h-3" /> {article.type.toUpperCase()}
                      </div>
                      <div className="absolute top-4 right-4 bg-[#7000ff] text-white text-xs font-bold px-2 py-1 rounded">
                        {t('publicPages.community.news.featuredBadge')}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-mono">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(article.createdAt)}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatViews(article.views)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#00f0ff] transition-colors">{getTitle(article)}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{getContent(article)}</p>
                      <div className="flex items-center justify-end mt-auto">
                        <span className="text-[#00f0ff] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                          {t('publicPages.community.news.readMore')} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {!isLoading && !error && latestArticles.length > 0 && (
        <section className="py-12 px-6 bg-gray-100 dark:bg-white/5">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-gray-600 dark:text-gray-400" /> {t('publicPages.community.news.latestTitle')}
              </h2>
              <span className="text-xs text-gray-500 font-mono">{t('publicPages.community.news.showingCount', { current: latestArticles.length, total: filteredAnnouncements.length })}</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => {
                const Icon = categoryIcons[article.type] || Megaphone;
                const gradient = categoryGradients[article.type] || "from-[#7000ff] to-blue-600";
                const color = categoryColors[article.type] || "text-[#7000ff]";
                
                return (
                  <Link 
                    key={article.id} 
                    href={`/community/news/${article.id}`}
                    className="spotlight-card rounded-xl p-0 border border-gray-300 dark:border-white/10 group overflow-hidden block bg-white dark:bg-transparent shadow-sm"
                    data-testid={`link-article-${article.id}`}
                  >
                    <div className={`h-40 bg-gradient-to-br ${gradient} relative`}>
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-gray-300 dark:border-white/20">
                        <Icon className={`w-3 h-3 ${color}`} /> {article.type.toUpperCase()}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-2 text-xs text-gray-500 font-mono">
                        <span>{formatDate(article.createdAt)}</span>
                        <span>•</span>
                        <span>{formatViews(article.views)} {t('publicPages.community.news.views')}</span>
                      </div>
                      <h3 className={`font-bold text-gray-900 dark:text-white mb-2 group-hover:${color} transition-colors`}>{getTitle(article)}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{getContent(article)}</p>
                      <span className={`${color} text-xs font-bold flex items-center gap-1`}>
                        {t('publicPages.community.news.readMore')} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAnnouncements.length === 0 && (
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Newspaper className="w-10 h-10 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('adminCommunityContent.noNewsFound')}</span>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Subscription */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="spotlight-card rounded-xl p-8 border border-gray-300 dark:border-white/10 text-center bg-white dark:bg-transparent shadow-sm bg-gradient-to-b from-transparent to-[#7000ff]/5">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-gray-900 dark:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.community.news.newsletter.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{t('publicPages.community.news.newsletter.description')}</p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder={t('publicPages.community.news.newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
                data-testid="input-newsletter-email"
                required 
              />
              <button 
                type="submit" 
                className="px-6 py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition shadow-[0_0_20px_rgba(112,0,255,0.3)]"
                data-testid="button-subscribe"
              >
                {t('publicPages.community.news.newsletter.button')}
              </button>
            </form>
            
            <p className="text-xs text-gray-600 mt-6">{t('publicPages.community.news.newsletter.privacy')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
