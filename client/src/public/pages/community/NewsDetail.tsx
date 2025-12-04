import { Link, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Clock, Eye, User, Share2, Bookmark, MessageCircle, ThumbsUp, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const newsArticles: Record<string, {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string[];
  date: string;
  readTime: string;
  views: string;
  author: string;
  authorRole: string;
  category: string;
  tags: string[];
  gradient: string;
}> = {
  "v4-mainnet-launch": {
    id: 1,
    slug: "v4-mainnet-launch",
    title: "TBURN v7.0 Mainnet Launch: A New Era of Blockchain Innovation",
    description: "After months of rigorous testing, TBURN v7.0 mainnet is now live with revolutionary AI-enhanced consensus and enterprise-grade features.",
    content: [
      "We are thrilled to announce that TBURN v7.0 mainnet has officially launched, marking a significant milestone in our journey to revolutionize blockchain technology. This release represents the culmination of over two years of research and development.",
      "Key Features of TBURN v7.0:",
      "• AI-Enhanced Committee BFT Consensus: Our proprietary consensus mechanism combines traditional Byzantine Fault Tolerance with advanced AI algorithms for optimal validator selection and network security.",
      "• Dynamic Sharding System: The network now supports automatic load balancing across multiple shards, enabling unprecedented scalability without sacrificing decentralization.",
      "• Triple-Band AI Orchestration: Three independent AI systems (GPT-5, Claude Sonnet 4.5, Llama 4) work in harmony to optimize network operations, from transaction routing to resource allocation.",
      "• Enterprise Token Standards (TBC-20, TBC-721, TBC-1155): Our enhanced token standards provide quantum-resistant security and built-in compliance features for institutional adoption.",
      "The mainnet launch includes a comprehensive DeFi ecosystem with DEX/AMM, lending protocols, liquid staking, NFT marketplace, and cross-chain bridge capabilities.",
      "We invite developers, validators, and users to join us in building the future of decentralized finance on TBURN v7.0."
    ],
    date: "November 28, 2024",
    readTime: "5 min read",
    views: "128.5K",
    author: "TBURN Core Team",
    authorRole: "Official Announcement",
    category: "Announcement",
    tags: ["Mainnet", "Launch", "v7.0", "AI", "DeFi"],
    gradient: "from-purple-600 to-blue-600"
  },
  "triple-band-ai-revealed": {
    id: 2,
    slug: "triple-band-ai-revealed",
    title: "Triple-Band AI Architecture Revealed: The Future of Blockchain Intelligence",
    description: "An in-depth technical exploration of how TBURN leverages three AI systems for optimal blockchain performance.",
    content: [
      "The TBURN v7.0 AI Orchestration system represents a breakthrough in blockchain technology, combining multiple AI providers for redundancy, accuracy, and optimal decision-making.",
      "Understanding Triple-Band Architecture:",
      "• Primary Band (GPT-5): Handles complex analytical tasks including validator trust scoring, anomaly detection, and predictive maintenance.",
      "• Secondary Band (Claude Sonnet 4.5): Specializes in code analysis, smart contract auditing, and natural language processing for governance proposals.",
      "• Tertiary Band (Llama 4): Provides high-throughput, low-latency processing for real-time transaction routing and load balancing decisions.",
      "Cross-Band Interaction:",
      "When a decision requires high confidence, all three AI systems independently analyze the situation. A consensus mechanism then combines their outputs, weighting each based on historical accuracy for similar decision types.",
      "Feedback Learning System:",
      "Every AI decision is tracked and evaluated against actual outcomes. This continuous feedback loop enables the system to improve over time, with accuracy metrics currently exceeding 99.7% for validator selection decisions.",
      "The result is a self-improving, fault-tolerant AI layer that enhances every aspect of blockchain operations."
    ],
    date: "November 25, 2024",
    readTime: "8 min read",
    views: "89.2K",
    author: "Dr. Sarah Chen",
    authorRole: "Chief AI Architect",
    category: "Technology",
    tags: ["AI", "Technology", "Deep Dive", "Architecture"],
    gradient: "from-cyan-600 to-purple-600"
  },
  "global-partnership-expansion": {
    id: 3,
    slug: "global-partnership-expansion",
    title: "Global Partnership Expansion: TBURN Joins Forces with Industry Leaders",
    description: "Strategic partnerships announced to accelerate TBURN ecosystem growth and global adoption.",
    content: [
      "TBURN is proud to announce a series of strategic partnerships that will accelerate our ecosystem growth and bring blockchain technology to millions of new users worldwide.",
      "Key Partnership Highlights:",
      "• Enterprise Integration Partners: Leading financial institutions and technology companies have committed to integrating TBURN's enterprise solutions.",
      "• Developer Ecosystem: Major development studios and blockchain tool providers are building on TBURN.",
      "• Infrastructure Partners: Cloud providers and data center operators are supporting our global node network.",
      "Regional Expansion:",
      "These partnerships enable TBURN to establish presence in key markets across Asia, Europe, and the Americas, with localized support and compliance frameworks.",
      "Developer Resources:",
      "Our partners are contributing to comprehensive developer resources, including SDKs, documentation, and training programs.",
      "We're excited about the opportunities these partnerships create for our community and the broader blockchain ecosystem."
    ],
    date: "November 15, 2024",
    readTime: "4 min read",
    views: "98.7K",
    author: "Business Development Team",
    authorRole: "Partnership Update",
    category: "Partnership",
    tags: ["Partnership", "Expansion", "Enterprise", "Global"],
    gradient: "from-indigo-600 to-violet-600"
  },
  "staking-program-details": {
    id: 4,
    slug: "staking-program-details",
    title: "Staking Program Details: Maximize Your TBURN Rewards",
    description: "Complete guide to TBURN staking tiers, rewards, and how to maximize your returns.",
    content: [
      "The TBURN staking program offers multiple ways to earn rewards while supporting network security. Here's everything you need to know.",
      "Staking Tiers:",
      "• Bronze Tier: Minimum 1,000 TBURN - 8% base APY",
      "• Silver Tier: Minimum 10,000 TBURN - 12% base APY + governance rights",
      "• Gold Tier: Minimum 100,000 TBURN - 18% base APY + priority validator selection",
      "• Platinum Tier: Minimum 1,000,000 TBURN - 25% base APY + all benefits",
      "Lock Period Bonuses:",
      "Longer lock periods provide additional APY bonuses up to 50% extra.",
      "Auto-Compounding:",
      "Enable auto-compounding to automatically reinvest your rewards and maximize returns.",
      "Getting Started:",
      "Visit the TBURN staking dashboard to begin earning rewards today."
    ],
    date: "November 22, 2024",
    readTime: "6 min read",
    views: "67.8K",
    author: "TBURN Economics Team",
    authorRole: "Official Guide",
    category: "Announcement",
    tags: ["Validators", "Rewards", "Economics", "Update"],
    gradient: "from-orange-600 to-red-600"
  },
  "trust-score-deep-dive": {
    id: 5,
    slug: "trust-score-deep-dive",
    title: "Trust Score Deep Dive: How TBURN's AI Evaluates Network Security",
    description: "Comprehensive explanation of the AI-powered Trust Score system that ensures network integrity.",
    content: [
      "The TBURN Trust Score system is a revolutionary approach to network security, leveraging AI to continuously evaluate and score every participant in the ecosystem.",
      "How Trust Score Works:",
      "• Real-time Monitoring: AI systems continuously analyze validator behavior, transaction patterns, and network contributions.",
      "• Multi-factor Analysis: Scores consider uptime, response time, block production accuracy, governance participation, and historical reliability.",
      "• Dynamic Adjustment: Trust scores update in real-time based on recent activity, with more recent actions weighted more heavily.",
      "Trust Score Impact:",
      "Higher trust scores unlock benefits like priority transaction processing, reduced fees, and enhanced governance voting power.",
      "Maintaining High Scores:",
      "Consistent uptime, timely block production, and active governance participation are key factors in maintaining high trust scores.",
      "The Trust Score system ensures that the most reliable participants are rewarded, creating a self-reinforcing security mechanism."
    ],
    date: "November 20, 2024",
    readTime: "7 min read",
    views: "56.3K",
    author: "Security Team",
    authorRole: "Technical Guide",
    category: "Security",
    tags: ["Security", "Trust Score", "AI", "Validators"],
    gradient: "from-green-600 to-emerald-600"
  },
  "sdk-2-released": {
    id: 6,
    slug: "sdk-2-released",
    title: "TBURN SDK 2.0 Released: Build Faster with New Developer Tools",
    description: "The new SDK version brings improved APIs, TypeScript support, and comprehensive documentation.",
    content: [
      "We're excited to announce the release of TBURN SDK 2.0, featuring significant improvements for developers building on our platform.",
      "What's New in SDK 2.0:",
      "• Full TypeScript Support: Complete type definitions for all SDK functions and objects.",
      "• Simplified APIs: Streamlined interfaces for common operations like transactions, staking, and smart contract interactions.",
      "• React Hooks: Pre-built hooks for easy integration with React applications.",
      "• Better Error Handling: Comprehensive error types and messages for easier debugging.",
      "Getting Started:",
      "Install with npm: npm install @tburn/sdk",
      "Documentation:",
      "Visit our developer portal for comprehensive guides, API references, and example projects.",
      "The SDK 2.0 represents our commitment to making TBURN development accessible and enjoyable."
    ],
    date: "November 18, 2024",
    readTime: "5 min read",
    views: "43.1K",
    author: "Developer Relations",
    authorRole: "Release Notes",
    category: "Development",
    tags: ["SDK", "Development", "TypeScript", "Tools"],
    gradient: "from-purple-600 to-pink-600"
  },
  "quantum-resistant-cryptography": {
    id: 7,
    slug: "quantum-resistant-cryptography",
    title: "Quantum-Resistant Cryptography: Securing TBURN's Future",
    description: "How TBURN implements quantum-resistant algorithms to protect against future threats.",
    content: [
      "As quantum computing advances, traditional cryptographic methods face potential vulnerabilities. TBURN is proactively addressing this with quantum-resistant implementations.",
      "Our Approach:",
      "• Hybrid Cryptography: Combining traditional and post-quantum algorithms for immediate security and future-proofing.",
      "• NIST-Approved Standards: Implementing cryptographic algorithms approved by NIST for post-quantum security.",
      "• Gradual Migration: Phased rollout of quantum-resistant features to ensure stability.",
      "Protected Components:",
      "• Transaction Signatures: All new transactions use quantum-resistant signature schemes.",
      "• Key Exchange: Secure key exchange protocols that resist quantum attacks.",
      "• Hash Functions: Multi-hash system with quantum-resistant options.",
      "This proactive approach ensures TBURN remains secure even as quantum computing capabilities evolve."
    ],
    date: "November 12, 2024",
    readTime: "6 min read",
    views: "34.2K",
    author: "Cryptography Team",
    authorRole: "Security Research",
    category: "Security",
    tags: ["Quantum", "Cryptography", "Security", "Research"],
    gradient: "from-teal-600 to-cyan-600"
  },
  "tburn-dex-beta": {
    id: 8,
    slug: "tburn-dex-beta",
    title: "TBURN DEX Beta Launch: Decentralized Trading is Here",
    description: "The TBURN decentralized exchange is now in beta with multiple AMM curve types and AI-optimized routing.",
    content: [
      "The TBURN DEX beta is now live, bringing decentralized trading to our ecosystem with advanced features and AI optimization.",
      "Key Features:",
      "• Multiple AMM Types: Constant product, stable swap, and concentrated liquidity pools.",
      "• AI-Optimized Routing: Smart routing finds the best path across all pools for optimal swap rates.",
      "• MEV Protection: Built-in protection against sandwich attacks and front-running.",
      "• Low Fees: Competitive trading fees with discounts for high-volume traders.",
      "Liquidity Provision:",
      "Earn fees by providing liquidity to pools. Our auto-compounding feature maximizes your returns.",
      "Getting Started:",
      "Connect your wallet and start trading on the TBURN DEX today. Full documentation is available in our developer portal.",
      "Join our community channels to provide feedback and help shape the future of decentralized trading on TBURN."
    ],
    date: "November 10, 2024",
    readTime: "5 min read",
    views: "51.4K",
    author: "DeFi Team",
    authorRole: "Product Launch",
    category: "DeFi",
    tags: ["DEX", "DeFi", "Trading", "AMM"],
    gradient: "from-rose-600 to-pink-600"
  }
};

const relatedArticles = [
  { slug: "triple-band-ai-revealed", title: "Triple-Band AI Architecture Revealed", category: "Technology" },
  { slug: "staking-program-details", title: "Staking Program Details", category: "Tokenomics" },
  { slug: "tburn-dex-beta", title: "TBURN DEX Beta Launch", category: "DeFi" },
];

export default function NewsDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, params] = useRoute("/community/news/:slug");
  const slug = params?.slug || "";
  
  const article = newsArticles[slug];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('publicPages.community.news.detail.linkCopied', 'Link copied!'),
      description: t('publicPages.community.news.detail.shareSuccess', 'Article link copied to clipboard'),
    });
  };

  const handleBookmark = () => {
    toast({
      title: t('publicPages.community.news.detail.bookmarked', 'Bookmarked!'),
      description: t('publicPages.community.news.detail.bookmarkSuccess', 'Article saved to your bookmarks'),
    });
  };

  if (!article) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('publicPages.community.news.detail.notFound', 'Article Not Found')}
          </h1>
          <p className="text-gray-400 mb-8">
            {t('publicPages.community.news.detail.notFoundDesc', 'The article you are looking for does not exist or has been removed.')}
          </p>
          <Link href="/community/news">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicPages.community.news.detail.backToNews', 'Back to News')}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className={`h-64 bg-gradient-to-r ${article.gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-4xl px-6 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link href="/community/news" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {t('publicPages.community.news.detail.backToNews', 'Back to News')}
          </Link>
          <Badge className="bg-white/90 text-black mb-3 w-fit">{article.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {article.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.readTime}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {article.views}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">{article.author}</p>
              <p className="text-sm text-gray-400">{article.authorRole}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={handleBookmark}
              data-testid="button-bookmark"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <article className="prose prose-invert max-w-none mb-12">
          <p className="text-lg text-gray-300 leading-relaxed mb-6">{article.description}</p>
          {article.content.map((paragraph, index) => (
            <p key={index} className="text-gray-400 leading-relaxed mb-4 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </article>

        <div className="flex flex-wrap gap-2 mb-12">
          <Tag className="w-4 h-4 text-gray-500" />
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-white/20 text-gray-400">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between py-6 border-t border-b border-white/10 mb-12">
          <div className="flex gap-4">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="button-like">
              <ThumbsUp className="w-4 h-4 mr-2" />
              {t('publicPages.community.news.detail.helpful', 'Helpful')}
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="button-comment">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('publicPages.community.news.detail.discuss', 'Discuss')}
            </Button>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-purple-500" />
            {t('publicPages.community.news.detail.relatedArticles', 'Related Articles')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedArticles.filter(a => a.slug !== slug).map((related) => (
              <Link key={related.slug} href={`/community/news/${related.slug}`}>
                <Card className="bg-white/5 border-white/10 hover:border-white/20 transition cursor-pointer h-full">
                  <CardContent className="p-4">
                    <Badge variant="outline" className="border-white/20 text-gray-400 mb-2 text-xs">
                      {related.category}
                    </Badge>
                    <h3 className="text-white font-medium text-sm line-clamp-2">{related.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
