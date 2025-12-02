import { 
  Newspaper, Search, Star, Calendar, Clock, Eye, ArrowRight,
  Megaphone, Cpu, Handshake, Coins, Shield, Code, Lock, LineChart, Mail
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Announcement", "Technology", "Security", "Tokenomics", "Partnership", "DeFi"];

const featuredNews = [
  {
    id: 1,
    slug: "v4-mainnet-launch",
    category: "Announcement",
    categoryIcon: Megaphone,
    title: "TBurn Chain V4 Mainnet Launch - Official Release",
    description: "The world's first trust-based Layer 1 blockchain, TBurn Chain V4, officially launches its mainnet on December 5, 2024. Experience 500,000+ TPS.",
    date: "11/28/2024",
    readTime: "5 min",
    views: "128.5K",
    author: "TBurn Team",
    gradient: "from-[#7000ff] to-blue-600",
    featuredColor: "bg-[#7000ff]",
  },
  {
    id: 2,
    slug: "triple-band-ai-revealed",
    category: "Technology",
    categoryIcon: Cpu,
    title: "Triple-Band AI System Revealed",
    description: "TBurn Chain's core Triple-Band AI system has been unveiled. The 3-tier AI analyzes projects in real-time and automatically calculates Trust Scores.",
    date: "11/25/2024",
    readTime: "8 min",
    views: "89.2K",
    author: "AI Research Team",
    gradient: "from-cyan-500 to-blue-500",
    featuredColor: "bg-[#00f0ff] text-black",
  },
  {
    id: 3,
    slug: "global-partnership-expansion",
    category: "Partnership",
    categoryIcon: Handshake,
    title: "Global Partnership Expansion - 30 Exchanges",
    description: "TBurn Chain has partnered with major global exchanges. TBURN token trading will begin on 30+ exchanges on January 5, 2026.",
    date: "11/15/2024",
    readTime: "4 min",
    views: "98.7K",
    author: "Business Team",
    gradient: "from-indigo-500 to-violet-600",
    featuredColor: "bg-[#7000ff]",
  },
];

const latestArticles = [
  {
    id: 4,
    slug: "staking-program-details",
    category: "Tokenomics",
    categoryIcon: Coins,
    title: "TBURN Token Staking Program Details",
    description: "Earn 12-25% APY through validator node operation. Learn how to participate.",
    date: "11/22/2024",
    views: "67.8K",
    gradient: "from-amber-500 to-orange-600",
    color: "text-[#ffd700]",
  },
  {
    id: 5,
    slug: "trust-score-deep-dive",
    category: "Security",
    categoryIcon: Shield,
    title: "Trust Score System Deep Dive",
    description: "Detailed explanation of the 5 evaluation factors (Team, Code, Finance, etc).",
    date: "11/20/2024",
    views: "56.3K",
    gradient: "from-green-500 to-emerald-600",
    color: "text-[#00ff9d]",
  },
  {
    id: 6,
    slug: "sdk-2-released",
    category: "Development",
    categoryIcon: Code,
    title: "Developer SDK 2.0 Released",
    description: "Full TypeScript support, improved error handling, and new Trust Score APIs.",
    date: "11/18/2024",
    views: "43.1K",
    gradient: "from-purple-500 to-pink-600",
    color: "text-[#7000ff]",
  },
  {
    id: 7,
    slug: "quantum-resistant-cryptography",
    category: "Security",
    categoryIcon: Lock,
    title: "Quantum-Resistant Cryptography",
    description: "CRYSTALS-Dilithium and ED25519 hybrid signature system integration complete.",
    date: "11/12/2024",
    views: "34.2K",
    gradient: "from-teal-500 to-cyan-600",
    color: "text-[#00f0ff]",
  },
  {
    id: 8,
    slug: "tburn-dex-beta",
    category: "DeFi",
    categoryIcon: LineChart,
    title: "First DeFi Project TBurn DEX Beta",
    description: "Try liquidity provision and swap features on testnet now.",
    date: "11/10/2024",
    views: "51.4K",
    gradient: "from-rose-500 to-pink-600",
    color: "text-[#ff0055]",
  },
];

export default function NewsBlog() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    toast({ title: "Success!", description: "You have been subscribed to our newsletter" });
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
              placeholder="Search news..." 
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
            <Star className="w-5 h-5 text-[#ffd700]" /> Featured News
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
                    Featured
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
                      Read More <ArrowRight className="w-3 h-3" />
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
              <Newspaper className="w-5 h-5 text-gray-400" /> Latest Articles
            </h2>
            <span className="text-xs text-gray-500 font-mono">Showing {latestArticles.length} of {latestArticles.length} articles</span>
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
                    <span>{article.views} Views</span>
                  </div>
                  <h3 className={`font-bold text-white mb-2 group-hover:${article.color} transition-colors`}>{article.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{article.description}</p>
                  <span className={`${article.color} text-xs font-bold flex items-center gap-1`}>
                    Read More <ArrowRight className="w-3 h-3" />
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
            <h2 className="text-2xl font-bold text-white mb-3">Subscribe to Newsletter</h2>
            <p className="text-gray-400 mb-8">Get the latest TBurn Chain news delivered directly to your inbox.</p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email" 
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
                Subscribe
              </button>
            </form>
            
            <p className="text-xs text-gray-600 mt-6">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
