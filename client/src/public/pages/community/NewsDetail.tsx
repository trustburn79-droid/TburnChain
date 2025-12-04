import { Link, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Clock, Eye, User, Share2, Bookmark, MessageCircle, ThumbsUp, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const articleSlugs = [
  "v4-mainnet-launch",
  "triple-band-ai-revealed", 
  "global-partnership-expansion",
  "staking-program-details",
  "trust-score-deep-dive",
  "sdk-2-released",
  "quantum-resistant-cryptography",
  "tburn-dex-beta"
];

const articleGradients: Record<string, string> = {
  "v4-mainnet-launch": "from-purple-600 to-blue-600",
  "triple-band-ai-revealed": "from-cyan-600 to-purple-600",
  "global-partnership-expansion": "from-indigo-600 to-violet-600",
  "staking-program-details": "from-orange-600 to-red-600",
  "trust-score-deep-dive": "from-green-600 to-emerald-600",
  "sdk-2-released": "from-purple-600 to-pink-600",
  "quantum-resistant-cryptography": "from-teal-600 to-cyan-600",
  "tburn-dex-beta": "from-rose-600 to-pink-600"
};

export default function NewsDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, params] = useRoute("/community/news/:slug");
  const slug = params?.slug || "";
  
  const isValidSlug = articleSlugs.includes(slug);
  const gradient = articleGradients[slug] || "from-purple-600 to-blue-600";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('publicPages.community.news.detail.linkCopied'),
      description: t('publicPages.community.news.detail.shareSuccess'),
    });
  };

  const handleBookmark = () => {
    toast({
      title: t('publicPages.community.news.detail.bookmarked'),
      description: t('publicPages.community.news.detail.bookmarkSuccess'),
    });
  };

  if (!isValidSlug) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('publicPages.community.news.detail.notFound')}
          </h1>
          <p className="text-gray-400 mb-8">
            {t('publicPages.community.news.detail.notFoundDesc')}
          </p>
          <Link href="/community/news">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicPages.community.news.detail.backToNews')}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const articleKey = `publicPages.community.news.detail.articles.${slug}`;
  const title = t(`${articleKey}.title`);
  const description = t(`${articleKey}.description`);
  const author = t(`${articleKey}.author`);
  const authorRole = t(`${articleKey}.authorRole`);
  const date = t(`${articleKey}.date`);
  const readTime = t(`${articleKey}.readTime`);
  const views = t(`${articleKey}.views`);
  const category = t(`${articleKey}.category`);
  
  const contentArray: string[] = [];
  for (let i = 0; i < 10; i++) {
    const content = t(`${articleKey}.content.${i}`, { defaultValue: '' });
    if (content && content !== `${articleKey}.content.${i}`) {
      contentArray.push(content);
    }
  }

  const tagsArray: string[] = [];
  for (let i = 0; i < 6; i++) {
    const tag = t(`${articleKey}.tags.${i}`, { defaultValue: '' });
    if (tag && tag !== `${articleKey}.tags.${i}`) {
      tagsArray.push(tag);
    }
  }

  const relatedSlugs = articleSlugs.filter(s => s !== slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className={`h-64 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-4xl px-6 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link href="/community/news" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {t('publicPages.community.news.detail.backToNews')}
          </Link>
          <Badge className="bg-white/90 text-black mb-3 w-fit">{category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {readTime}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {views}</span>
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
              <p className="font-bold text-white">{author}</p>
              <p className="text-sm text-gray-400">{authorRole}</p>
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
          <p className="text-lg text-gray-300 leading-relaxed mb-6">{description}</p>
          {contentArray.map((paragraph, index) => (
            <p key={index} className="text-gray-400 leading-relaxed mb-4 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </article>

        <div className="flex flex-wrap gap-2 mb-12">
          <Tag className="w-4 h-4 text-gray-500" />
          {tagsArray.map((tag) => (
            <Badge key={tag} variant="outline" className="border-white/20 text-gray-400">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between py-6 border-t border-b border-white/10 mb-12">
          <div className="flex gap-4">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="button-like">
              <ThumbsUp className="w-4 h-4 mr-2" />
              {t('publicPages.community.news.detail.helpful')}
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="button-comment">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('publicPages.community.news.detail.discuss')}
            </Button>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-purple-500" />
            {t('publicPages.community.news.detail.relatedArticles')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedSlugs.map((relatedSlug) => (
              <Link key={relatedSlug} href={`/community/news/${relatedSlug}`}>
                <Card className="bg-white/5 border-white/10 hover:border-white/20 transition cursor-pointer h-full">
                  <CardContent className="p-4">
                    <Badge variant="outline" className="border-white/20 text-gray-400 mb-2 text-xs">
                      {t(`publicPages.community.news.detail.articles.${relatedSlug}.category`)}
                    </Badge>
                    <h3 className="text-white font-medium text-sm line-clamp-2">
                      {t(`publicPages.community.news.detail.articles.${relatedSlug}.title`)}
                    </h3>
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
