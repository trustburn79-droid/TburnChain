import { Link, useRoute, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, User, MessageCircle, Heart, Eye, Share2, Bookmark, Tag, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslationApi } from "@/hooks/use-translation-api";

interface PostData {
  id: string;
  title: string;
  titleKo?: string;
  content: string;
  contentKo?: string;
  author: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  createdAt: number;
  translationKey?: string;
}

const categoryGradients: Record<string, string> = {
  "announcements": "from-purple-600 to-blue-600",
  "governance": "from-cyan-600 to-purple-600",
  "general": "from-green-600 to-emerald-600",
  "trading": "from-orange-600 to-red-600",
  "technical": "from-blue-600 to-indigo-600",
  "defi": "from-pink-600 to-purple-600"
};

const categoryColors: Record<string, string> = {
  "announcements": "bg-purple-500/20 text-purple-400",
  "governance": "bg-cyan-500/20 text-cyan-400",
  "general": "bg-green-500/20 text-green-400",
  "trading": "bg-orange-500/20 text-orange-400",
  "technical": "bg-blue-500/20 text-blue-400",
  "defi": "bg-pink-500/20 text-pink-400"
};

export default function PostDetail() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/community/hub/post/:id");
  const postId = params?.id || "";
  const currentLang = i18n.language;

  const { data: posts, isLoading } = useQuery<PostData[]>({
    queryKey: ['/api/community/posts'],
  });

  const post = posts?.find(p => p.id === postId);

  const translationItems = useMemo(() => {
    if (!post) return [];
    return [
      { id: `${post.id}-title`, text: post.title },
      { id: `${post.id}-content`, text: post.content }
    ];
  }, [post]);

  const { getTranslation, isTranslating } = useTranslationApi(translationItems, {
    enabled: !!post
  });

  const getLocalizedContent = (item: PostData, field: 'title' | 'content') => {
    const id = `${item.id}-${field}`;
    const originalText = field === 'title' ? item.title : item.content;
    const koText = field === 'title' ? item.titleKo : item.contentKo;
    return getTranslation(id, originalText, koText);
  };

  const getLocaleForDate = () => {
    const localeMap: Record<string, string> = {
      en: 'en-US', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP',
      es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA',
      hi: 'hi-IN', bn: 'bn-BD', pt: 'pt-BR', ur: 'ur-PK'
    };
    return localeMap[currentLang] || 'en-US';
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('publicPages.community.posts.detail.linkCopied'),
      description: t('publicPages.community.posts.detail.linkCopiedDesc'),
    });
  };

  const handleBookmark = () => {
    toast({
      title: t('publicPages.community.posts.detail.bookmarked'),
      description: t('publicPages.community.posts.detail.bookmarkedDesc'),
    });
  };

  const handleLike = () => {
    toast({
      title: t('publicPages.community.posts.detail.liked'),
      description: t('publicPages.community.posts.detail.likedDesc'),
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors pt-4 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors pt-4 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('publicPages.community.posts.detail.notFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('publicPages.community.posts.detail.notFoundDesc')}
          </p>
          <Button variant="outline" className="border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => setLocation("/community/hub")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicPages.community.posts.detail.backToHub')}
            </Button>
        </div>
      </main>
    );
  }

  const title = getLocalizedContent(post, 'title');
  const content = getLocalizedContent(post, 'content');
  const gradient = categoryGradients[post.category] || "from-purple-600 to-blue-600";
  const showTranslationBadge = currentLang !== 'en' && currentLang !== 'ko';
  const categoryColor = categoryColors[post.category] || "bg-purple-500/20 text-purple-400";

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(getLocaleForDate(), { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const categoryLabel = t(`publicPages.community.categories.${post.category}`);

  const relatedPosts = posts?.filter(p => p.id !== postId && p.category === post.category).slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors">
      <div className={`h-48 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-4xl px-6 h-full flex flex-col justify-end pb-6 relative z-10">
          <Link href="/community/hub" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {t('publicPages.community.posts.detail.backToHub')}
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={categoryColor}>{categoryLabel}</Badge>
            {post.isPinned && (
              <Badge className="bg-yellow-500/90 text-black">{t('publicPages.community.pinned')}</Badge>
            )}
            {showTranslationBadge && (
              <Badge className="bg-blue-500/90 text-white flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {isTranslating ? t('common.translating') : t('common.translated')}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-300 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {post.author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">{post.author}</p>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.createdAt)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" onClick={handleBookmark}>
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <article className="prose prose-gray dark:prose-invert prose-lg max-w-none mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">{content}</p>
        </article>

        <div className="flex items-center justify-between py-6 border-t border-b border-gray-300 dark:border-white/10 mb-8">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-400 transition" data-testid="button-like-post">
              <Heart className="w-5 h-5" />
              <span>{post.likes.toLocaleString()}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Eye className="w-5 h-5" />
              <span>{post.views.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <Badge variant="outline" className="border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400">{categoryLabel}</Badge>
            <Badge variant="outline" className="border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400">TBURN</Badge>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.community.posts.detail.relatedPosts')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map(related => (
                <Link key={related.id} href={`/community/hub/post/${related.id}`}>
                  <Card className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 transition cursor-pointer h-full shadow-sm">
                    <CardContent className="p-4">
                      <Badge className={`mb-2 text-xs ${categoryColors[related.category] || 'bg-purple-500/20 text-purple-400'}`}>
                        {t(`publicPages.community.categories.${related.category}`)}
                      </Badge>
                      <h3 className="text-gray-900 dark:text-white font-medium mb-2 line-clamp-2">
                        {getLocalizedContent(related, 'title')}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {related.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {related.comments}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
