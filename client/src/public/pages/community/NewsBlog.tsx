import { 
  Newspaper, Search, Star, Calendar, Clock, Eye, ArrowRight,
  Megaphone, Cpu, Handshake, Coins, Shield, Code, Lock, LineChart, Mail
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export default function NewsBlog() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const categories = [
    t('publicPages.community.news.categories.all'),
    t('publicPages.community.news.categories.announcement'),
    t('publicPages.community.news.categories.technology'),
    t('publicPages.community.news.categories.security'),
    t('publicPages.community.news.categories.tokenomics'),
    t('publicPages.community.news.categories.partnership'),
    t('publicPages.community.news.categories.defi')
  ];

  const featuredNews = [
    {
      id: 1,
      slug: "v4-mainnet-launch",
      category: t('publicPages.community.news.categories.announcement'),
      categoryIcon: Megaphone,
      title: t('publicPages.community.news.featured.mainnetLaunch.title'),
      description: t('publicPages.community.news.featured.mainnetLaunch.description'),
      date: "11/28/2024",
      readTime: t('publicPages.community.news.readTime', { minutes: 5 }),
      views: "128.5K",
      author: t('publicPages.community.news.featured.mainnetLaunch.author'),
      gradient: "from-[#7000ff] to-blue-600",
      featuredColor: "bg-[#7000ff]",
    },
    {
      id: 2,
      slug: "triple-band-ai-revealed",
      category: t('publicPages.community.news.categories.technology'),
      categoryIcon: Cpu,
      title: t('publicPages.community.news.featured.tripleBandAi.title'),
      description: t('publicPages.community.news.featured.tripleBandAi.description'),
      date: "11/25/2024",
      readTime: t('publicPages.community.news.readTime', { minutes: 8 }),
      views: "89.2K",
      author: t('publicPages.community.news.featured.tripleBandAi.author'),
      gradient: "from-cyan-500 to-blue-500",
      featuredColor: "bg-[#00f0ff] text-black",
    },
    {
      id: 3,
      slug: "global-partnership-expansion",
      category: t('publicPages.community.news.categories.partnership'),
      categoryIcon: Handshake,
      title: t('publicPages.community.news.featured.partnership.title'),
      description: t('publicPages.community.news.featured.partnership.description'),
      date: "11/15/2024",
      readTime: t('publicPages.community.news.readTime', { minutes: 4 }),
      views: "98.7K",
      author: t('publicPages.community.news.featured.partnership.author'),
      gradient: "from-indigo-500 to-violet-600",
      featuredColor: "bg-[#7000ff]",
    },
  ];

  const latestArticles = [
    {
      id: 4,
      slug: "staking-program-details",
      category: t('publicPages.community.news.categories.tokenomics'),
      categoryIcon: Coins,
      title: t('publicPages.community.news.articles.staking.title'),
      description: t('publicPages.community.news.articles.staking.description'),
      date: "11/22/2024",
      views: "67.8K",
      gradient: "from-amber-500 to-orange-600",
      color: "text-[#ffd700]",
    },
    {
      id: 5,
      slug: "trust-score-deep-dive",
      category: t('publicPages.community.news.categories.security'),
      categoryIcon: Shield,
      title: t('publicPages.community.news.articles.trustScore.title'),
      description: t('publicPages.community.news.articles.trustScore.description'),
      date: "11/20/2024",
      views: "56.3K",
      gradient: "from-green-500 to-emerald-600",
      color: "text-[#00ff9d]",
    },
    {
      id: 6,
      slug: "sdk-2-released",
      category: t('publicPages.community.news.categories.development'),
      categoryIcon: Code,
      title: t('publicPages.community.news.articles.sdk.title'),
      description: t('publicPages.community.news.articles.sdk.description'),
      date: "11/18/2024",
      views: "43.1K",
      gradient: "from-purple-500 to-pink-600",
      color: "text-[#7000ff]",
    },
    {
      id: 7,
      slug: "quantum-resistant-cryptography",
      category: t('publicPages.community.news.categories.security'),
      categoryIcon: Lock,
      title: t('publicPages.community.news.articles.quantum.title'),
      description: t('publicPages.community.news.articles.quantum.description'),
      date: "11/12/2024",
      views: "34.2K",
      gradient: "from-teal-500 to-cyan-600",
      color: "text-[#00f0ff]",
    },
    {
      id: 8,
      slug: "tburn-dex-beta",
      category: t('publicPages.community.news.categories.defi'),
      categoryIcon: LineChart,
      title: t('publicPages.community.news.articles.dex.title'),
      description: t('publicPages.community.news.articles.dex.description'),
      date: "11/10/2024",
      views: "51.4K",
      gradient: "from-rose-500 to-pink-600",
      color: "text-[#ff0055]",
    },
  ];
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: t('publicPages.community.news.newsletter.error'), description: t('publicPages.community.news.newsletter.invalidEmail'), variant: "destructive" });
      return;
    }
    toast({ title: t('publicPages.community.news.newsletter.success'), description: t('publicPages.community.news.newsletter.subscribed') });
    setEmail("");
  };

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <Newspaper className="w-3 h-3" /> {t('publicPages.community.news.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('publicPages.community.news.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.community.news.subtitle')}
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-8 px-6 border-b border-white/5 bg-black/40">
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder={t('publicPages.community.news.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
              data-testid="input-search-news"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                  activeCategory === cat
                    ? "bg-[#7000ff] text-white border border-[#7000ff]"
                    : "bg-[#7000ff]/10 border border-[#7000ff]/20 text-purple-300 hover:bg-[#7000ff]/20 hover:border-[#7000ff]/40 hover:text-white"
                }`}
                data-testid={`button-category-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#ffd700]" /> {t('publicPages.community.news.featuredTitle')}
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {featuredNews.map((article) => (
              <Link 
                key={article.id} 
                href={`/community/news/${article.slug}`}
                className="spotlight-card rounded-xl p-0 border border-white/10 group overflow-hidden block h-full"
                data-testid={`link-article-${article.slug}`}
              >
                <div className={`h-48 bg-gradient-to-br ${article.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute top-4 left-4 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <article.categoryIcon className="w-3 h-3" /> {article.category}
                  </div>
                  <div className={`absolute top-4 right-4 ${article.featuredColor} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {t('publicPages.community.news.featuredBadge')}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-mono">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00f0ff] transition-colors">{article.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{article.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-gray-500">{article.author}</span>
                    <span className="text-[#00f0ff] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t('publicPages.community.news.readMore')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-12 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gray-400" /> {t('publicPages.community.news.latestTitle')}
            </h2>
            <span className="text-xs text-gray-500 font-mono">{t('publicPages.community.news.showingCount', { current: latestArticles.length, total: latestArticles.length })}</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <Link 
                key={article.id} 
                href={`/community/news/${article.slug}`}
                className="spotlight-card rounded-xl p-0 border border-white/10 group overflow-hidden block"
                data-testid={`link-article-${article.slug}`}
              >
                <div className={`h-40 bg-gradient-to-br ${article.gradient} relative`}>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/20">
                    <article.categoryIcon className={`w-3 h-3 ${article.color}`} /> {article.category}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2 text-xs text-gray-500 font-mono">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.views} {t('publicPages.community.news.views')}</span>
                  </div>
                  <h3 className={`font-bold text-white mb-2 group-hover:${article.color} transition-colors`}>{article.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{article.description}</p>
                  <span className={`${article.color} text-xs font-bold flex items-center gap-1`}>
                    {t('publicPages.community.news.readMore')} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="spotlight-card rounded-xl p-8 border border-white/10 text-center bg-gradient-to-b from-transparent to-[#7000ff]/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{t('publicPages.community.news.newsletter.title')}</h2>
            <p className="text-gray-400 mb-8">{t('publicPages.community.news.newsletter.description')}</p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder={t('publicPages.community.news.newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-[#00f0ff] focus:outline-none transition"
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
