import { Link, useRoute, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Clock, Eye, User, Share2, Bookmark, Tag, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslationApi } from "@/hooks/use-translation-api";

interface AnnouncementData {
  id: string;
  title: string;
  titleKo?: string;
  content: string;
  contentKo?: string;
  type: string;
  createdAt: number;
  isImportant: boolean;
  isPinned?: boolean;
  views?: number;
  translationKey?: string;
}

const typeGradients: Record<string, string> = {
  "news": "from-purple-600 to-blue-600",
  "feature": "from-cyan-600 to-purple-600",
  "update": "from-green-600 to-emerald-600",
  "alert": "from-orange-600 to-red-600"
};

export default function NewsDetail() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/community/news/:slug");
  const slug = params?.slug || "";
  const currentLang = i18n.language;

  const { data: announcements, isLoading } = useQuery<AnnouncementData[]>({
    queryKey: ['/api/community/announcements'],
  });

  const announcement = announcements?.find(a => a.id === slug);

  const translationItems = useMemo(() => {
    if (!announcement) return [];
    return [
      { id: `${announcement.id}-title`, text: announcement.title },
      { id: `${announcement.id}-content`, text: announcement.content }
    ];
  }, [announcement]);

  const { getTranslation, isTranslating } = useTranslationApi(translationItems, {
    enabled: !!announcement
  });

  const getLocalizedContent = (ann: AnnouncementData, field: 'title' | 'content') => {
    const id = `${ann.id}-${field}`;
    const originalText = field === 'title' ? ann.title : ann.content;
    const koText = field === 'title' ? ann.titleKo : ann.contentKo;
    return getTranslation(id, originalText, koText);
  };

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

  if (!announcement) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors pt-4 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('publicPages.community.news.detail.notFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('publicPages.community.news.detail.notFoundDesc')}
          </p>
          <Button variant="outline" className="border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => setLocation("/community/news")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicPages.community.news.detail.backToNews')}
            </Button>
        </div>
      </main>
    );
  }

  const title = getLocalizedContent(announcement, 'title');
  const content = getLocalizedContent(announcement, 'content');
  const gradient = typeGradients[announcement.type] || "from-purple-600 to-blue-600";
  const showTranslationBadge = currentLang !== 'en' && currentLang !== 'ko';

  const getLocaleForDate = () => {
    const localeMap: Record<string, string> = {
      en: 'en-US', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP',
      es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA',
      hi: 'hi-IN', bn: 'bn-BD', pt: 'pt-BR', ur: 'ur-PK'
    };
    return localeMap[currentLang] || 'en-US';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(getLocaleForDate(), { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const category = t(`publicPages.community.news.types.${announcement.type}`);

  const relatedAnnouncements = announcements?.filter(a => a.id !== slug).slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors">
      <div className={`h-64 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-4xl px-6 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link href="/community/news" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {t('publicPages.community.news.detail.backToNews')}
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-white/90 text-black">{category}</Badge>
            {announcement.isImportant && (
              <Badge className="bg-red-500/90 text-white">{t('publicPages.community.news.detail.important')}</Badge>
            )}
            {showTranslationBadge && (
              <Badge className="bg-blue-500/90 text-white flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {isTranslating ? t('common.translating') : t('common.translated')}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(announcement.createdAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {t('publicPages.community.news.detail.readTime')}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {(announcement.views || 1250).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-300 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              TB
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">{t('publicPages.community.news.detail.tburnTeam')}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('publicPages.community.news.detail.officialAnnouncement')}</p>
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

        <article className="prose prose-gray dark:prose-invert prose-lg max-w-none mb-12">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">{content}</p>
        </article>

        <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-gray-300 dark:border-white/10">
          <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <Badge variant="outline" className="border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400">{category}</Badge>
          <Badge variant="outline" className="border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400">TBURN</Badge>
          <Badge variant="outline" className="border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400">Blockchain</Badge>
        </div>

        {relatedAnnouncements.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('publicPages.community.news.detail.relatedArticles')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedAnnouncements.map(related => (
                <Link key={related.id} href={`/community/news/${related.id}`}>
                  <Card className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 transition cursor-pointer h-full shadow-sm">
                    <CardContent className="p-4">
                      <Badge className="mb-2 text-xs" variant="outline">
                        {t(`publicPages.community.news.types.${related.type}`)}
                      </Badge>
                      <h3 className="text-gray-900 dark:text-white font-medium mb-2 line-clamp-2">
                        {getLocalizedContent(related, 'title')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(related.createdAt)}</p>
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
