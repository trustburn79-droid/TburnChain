import { Link, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, User, MessageCircle, Heart, Eye, Share2, Bookmark, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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
  const [, params] = useRoute("/community/hub/post/:id");
  const postId = params?.id || "";
  const isKorean = i18n.language === 'ko';

  const { data: posts, isLoading } = useQuery<PostData[]>({
    queryKey: ['/api/community/posts'],
  });

  const post = posts?.find(p => p.id === postId);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: isKorean ? "링크 복사됨!" : "Link Copied!",
      description: isKorean ? "게시물 링크가 클립보드에 복사되었습니다" : "Post link copied to clipboard",
    });
  };

  const handleBookmark = () => {
    toast({
      title: isKorean ? "북마크됨!" : "Bookmarked!",
      description: isKorean ? "게시물이 북마크에 저장되었습니다" : "Post saved to bookmarks",
    });
  };

  const handleLike = () => {
    toast({
      title: isKorean ? "좋아요!" : "Liked!",
      description: isKorean ? "게시물에 좋아요를 눌렀습니다" : "You liked this post",
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-white mb-4">
            {isKorean ? "게시물을 찾을 수 없습니다" : "Post Not Found"}
          </h1>
          <p className="text-gray-400 mb-8">
            {isKorean ? "찾으시는 게시물이 존재하지 않거나 삭제되었습니다." : "The post you are looking for does not exist or has been deleted."}
          </p>
          <Link href="/community/hub">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isKorean ? "커뮤니티 허브로 돌아가기" : "Back to Community Hub"}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const title = isKorean ? (post.titleKo || post.title) : post.title;
  const content = isKorean ? (post.contentKo || post.content) : post.content;
  const gradient = categoryGradients[post.category] || "from-purple-600 to-blue-600";
  const categoryColor = categoryColors[post.category] || "bg-purple-500/20 text-purple-400";

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const categoryLabels: Record<string, { en: string; ko: string }> = {
    announcements: { en: 'Announcements', ko: '공지사항' },
    governance: { en: 'Governance', ko: '거버넌스' },
    general: { en: 'General', ko: '일반' },
    trading: { en: 'Trading', ko: '트레이딩' },
    technical: { en: 'Technical', ko: '기술' },
    defi: { en: 'DeFi', ko: 'DeFi' }
  };
  const categoryLabel = isKorean ? (categoryLabels[post.category]?.ko || post.category) : (categoryLabels[post.category]?.en || post.category);

  const relatedPosts = posts?.filter(p => p.id !== postId && p.category === post.category).slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className={`h-48 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-4xl px-6 h-full flex flex-col justify-end pb-6 relative z-10">
          <Link href="/community/hub" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {isKorean ? "커뮤니티 허브로 돌아가기" : "Back to Community Hub"}
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={categoryColor}>{categoryLabel}</Badge>
            {post.isPinned && (
              <Badge className="bg-yellow-500/90 text-black">{isKorean ? '고정됨' : 'Pinned'}</Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {post.author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{post.author}</p>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.createdAt)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" onClick={handleBookmark}>
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <article className="prose prose-invert prose-lg max-w-none mb-8">
          <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">{content}</p>
        </article>

        <div className="flex items-center justify-between py-6 border-t border-b border-white/10 mb-8">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition" data-testid="button-like-post">
              <Heart className="w-5 h-5" />
              <span>{post.likes.toLocaleString()}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Eye className="w-5 h-5" />
              <span>{post.views.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <Badge variant="outline" className="border-white/20 text-gray-400">{categoryLabel}</Badge>
            <Badge variant="outline" className="border-white/20 text-gray-400">TBURN</Badge>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6">{isKorean ? '관련 게시물' : 'Related Posts'}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map(related => (
                <Link key={related.id} href={`/community/hub/post/${related.id}`}>
                  <Card className="bg-white/5 border-white/10 hover:border-white/30 transition cursor-pointer h-full">
                    <CardContent className="p-4">
                      <Badge className={`mb-2 text-xs ${categoryColors[related.category] || 'bg-purple-500/20 text-purple-400'}`}>
                        {isKorean ? (categoryLabels[related.category]?.ko || related.category) : (categoryLabels[related.category]?.en || related.category)}
                      </Badge>
                      <h3 className="text-white font-medium mb-2 line-clamp-2">
                        {isKorean ? (related.titleKo || related.title) : related.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
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
