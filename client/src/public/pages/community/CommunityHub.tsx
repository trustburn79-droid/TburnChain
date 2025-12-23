import { 
  Users, TrendingUp, Crown, GitBranch, ArrowRight, Trophy, Medal,
  CheckCircle, Code, Book, Shield, Megaphone, Vote, MessageSquare,
  Eye, Heart, Pin, Flame, Loader2, AlertTriangle
} from "lucide-react";
import { SiDiscord, SiTelegram, SiX, SiGithub } from "react-icons/si";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

interface PostData {
  id: string;
  title: string;
  titleKo?: string;
  author: string;
  category: string;
  content: string;
  contentKo?: string;
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  isHot: boolean;
  createdAt: number;
  tags: string[];
  translationKey?: string;
}

interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalPosts: number;
  totalComments: number;
  weeklyGrowth: number;
}

const categoryColors: Record<string, string> = {
  announcements: "text-[#7000ff] bg-[#7000ff]/10",
  trading: "text-[#ffd700] bg-[#ffd700]/10",
  technical: "text-[#00f0ff] bg-[#00f0ff]/10",
  governance: "text-[#00ff9d] bg-[#00ff9d]/10",
  general: "text-gray-600 dark:text-gray-400 bg-gray-400/10",
  support: "text-[#ff0055] bg-[#ff0055]/10",
};

export default function CommunityHub() {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;

  const { data: posts, isLoading: postsLoading } = useQuery<PostData[]>({
    queryKey: ['/api/community/posts'],
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<CommunityStats>({
    queryKey: ['/api/community/stats'],
    refetchInterval: 60000,
  });

  const getLocalizedContent = (post: PostData, field: 'title' | 'content') => {
    if (post.translationKey) {
      const translationPath = `publicPages.community.posts.${post.translationKey}.${field}`;
      const translated = t(translationPath);
      if (translated !== translationPath) {
        return translated;
      }
    }
    return field === 'title' ? post.title : post.content;
  };

  const getLocaleForDate = () => {
    const localeMap: Record<string, string> = {
      en: 'en-US', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP',
      es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA',
      hi: 'hi-IN', bn: 'bn-BD', pt: 'pt-BR', ur: 'ur-PK'
    };
    return localeMap[currentLang] || 'en-US';
  };

  const pinnedPosts = posts?.filter(p => p.isPinned).slice(0, 3) || [];
  const hotPosts = posts?.filter(p => p.isHot && !p.isPinned).slice(0, 3) || [];
  const recentPosts = posts?.filter(p => !p.isPinned && !p.isHot).slice(0, 6) || [];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return t('publicPages.community.time.justNow');
    if (diffHours < 24) return t('publicPages.community.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('publicPages.community.time.daysAgo', { count: diffDays });
    return date.toLocaleDateString(getLocaleForDate());
  };

  const getTitle = (post: PostData) => getLocalizedContent(post, 'title');
  const getContent = (post: PostData) => getLocalizedContent(post, 'content');

  const communityStats = [
    {
      id: 1,
      icon: Users,
      value: stats?.totalMembers?.toLocaleString() || "425,680",
      label: t('publicPages.community.hub.stats.totalMembers'),
      change: "+18.7%",
      iconColor: "text-[#7000ff]",
      bgColor: "bg-[#7000ff]/10",
    },
    {
      id: 2,
      icon: TrendingUp,
      value: stats?.activeMembers?.toLocaleString() || "156,340",
      label: t('publicPages.community.hub.stats.monthlyActive'),
      change: `+${stats?.weeklyGrowth?.toFixed(1) || "24.5"}%`,
      iconColor: "text-[#00f0ff]",
      bgColor: "bg-[#00f0ff]/10",
    },
    {
      id: 3,
      icon: MessageSquare,
      value: stats?.totalPosts?.toLocaleString() ?? String(posts?.length ?? 0),
      label: t('publicPages.community.hub.stats.totalPosts'),
      change: `+${stats?.weeklyGrowth?.toFixed(1) || "8.5"}%`,
      iconColor: "text-[#ffd700]",
      bgColor: "bg-[#ffd700]/10",
    },
    {
      id: 4,
      icon: GitBranch,
      value: "720",
      label: t('publicPages.community.hub.stats.contributors'),
      change: "+95",
      iconColor: "text-[#ff0055]",
      bgColor: "bg-[#ff0055]/10",
    },
  ];

  const communityChannels = [
    {
      id: 1,
      name: "Discord",
      icon: SiDiscord,
      members: t('publicPages.community.hub.channels.discord.members'),
      description: t('publicPages.community.hub.channels.discord.description'),
      action: t('publicPages.community.hub.channels.discord.action'),
      color: "#5865F2",
      href: "https://discord.gg/uaPFkUkfN2",
      external: true,
    },
    {
      id: 2,
      name: "Telegram",
      icon: SiTelegram,
      members: t('publicPages.community.hub.channels.telegram.members'),
      description: t('publicPages.community.hub.channels.telegram.description'),
      action: t('publicPages.community.hub.channels.telegram.action'),
      color: "#0088cc",
      href: "https://t.me/tburnchain",
      external: true,
    },
    {
      id: 3,
      name: "Twitter / X",
      icon: SiX,
      members: t('publicPages.community.hub.channels.twitter.members'),
      description: t('publicPages.community.hub.channels.twitter.description'),
      action: t('publicPages.community.hub.channels.twitter.action'),
      color: "#ffffff",
      href: "https://x.com/tburnio",
      external: true,
    },
    {
      id: 4,
      name: "GitHub",
      icon: SiGithub,
      members: t('publicPages.community.hub.channels.github.members'),
      description: t('publicPages.community.hub.channels.github.description'),
      action: t('publicPages.community.hub.channels.github.action'),
      color: "#e0e0e0",
      href: "https://github.com/tburnchain",
      external: true,
    },
  ];

  const leaderboard = [
    { rank: 1, name: "CryptoKim", initials: "CK", points: "248,560 pts", tier: t('publicPages.community.hub.leaderboard.tiers.diamond'), isTop: true },
    { rank: 2, name: "BlockMaster", initials: "BM", points: "185,740 pts", tier: t('publicPages.community.hub.leaderboard.tiers.platinum'), isTop: false },
    { rank: 3, name: "DeFiQueen", initials: "DQ", points: "156,890 pts", tier: t('publicPages.community.hub.leaderboard.tiers.platinum'), isTop: false },
  ];

  const ambassadorBenefits = [
    t('publicPages.community.hub.ambassador.benefits.rewards'),
    t('publicPages.community.hub.ambassador.benefits.earlyAccess'),
    t('publicPages.community.hub.ambassador.benefits.nftBadge'),
    t('publicPages.community.hub.ambassador.benefits.directChannel'),
  ];

  const contributeWays = [
    { icon: Code, title: t('publicPages.community.hub.contribute.code.title'), description: t('publicPages.community.hub.contribute.code.description'), action: t('publicPages.community.hub.contribute.code.action'), color: "text-[#00f0ff]", bgColor: "bg-[#00f0ff]/10", href: "/developers/docs" },
    { icon: Book, title: t('publicPages.community.hub.contribute.content.title'), description: t('publicPages.community.hub.contribute.content.description'), action: t('publicPages.community.hub.contribute.content.action'), color: "text-[#ffd700]", bgColor: "bg-[#ffd700]/10", href: "/community/news" },
    { icon: Shield, title: t('publicPages.community.hub.contribute.moderation.title'), description: t('publicPages.community.hub.contribute.moderation.description'), action: t('publicPages.community.hub.contribute.moderation.action'), color: "text-[#00ff9d]", bgColor: "bg-[#00ff9d]/10", href: "/community/hub" },
    { icon: Megaphone, title: t('publicPages.community.hub.contribute.marketing.title'), description: t('publicPages.community.hub.contribute.marketing.description'), action: t('publicPages.community.hub.contribute.marketing.action'), color: "text-[#ff0055]", bgColor: "bg-[#ff0055]/10", href: "/community/events" },
  ];

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Users className="w-3 h-3" /> {t('publicPages.community.hub.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('publicPages.community.hub.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.community.hub.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-12 px-6 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {communityStats.map((stat) => (
              <div key={stat.id} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.iconColor}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono bg-[#00ff9d]/10 text-[#00ff9d] px-2 py-0.5 rounded border border-[#00ff9d]/20">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-mono">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#7000ff]" />
              {t('publicPages.community.hub.forumTitle')}
            </h2>
            <Link href="/app/community">
              <button className="text-sm text-[#00f0ff] hover:underline flex items-center gap-1">
                {t('publicPages.community.hub.viewAll')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {postsLoading && (
            <div className="flex items-center justify-center gap-3 py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#7000ff]" />
              <span className="text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
            </div>
          )}

          {!postsLoading && posts && posts.length > 0 && (
            <div className="space-y-6">
              {pinnedPosts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Pin className="w-4 h-4" /> {t('publicPages.community.pinned')}
                  </h3>
                  {pinnedPosts.map(post => (
                    <Link key={post.id} href={`/community/hub/post/${post.id}`}>
                      <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-lg p-4 border-l-4 border-l-[#7000ff] hover:border-l-[#7000ff] transition cursor-pointer">
                        <div className="flex items-start gap-4">
                          <Pin className="w-4 h-4 text-[#7000ff] mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[post.category] || categoryColors.general}`}>
                                {t(`publicPages.community.categories.${post.category}`)}
                              </span>
                              <span className="text-xs text-gray-500">{post.author}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{getTitle(post)}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">{getContent(post)}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {hotPosts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" /> {t('publicPages.community.hot')}
                  </h3>
                  {hotPosts.map(post => (
                    <Link key={post.id} href={`/community/hub/post/${post.id}`}>
                      <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-lg p-4 border-l-4 border-l-orange-500 hover:border-l-orange-500 transition cursor-pointer">
                        <div className="flex items-start gap-4">
                          <Flame className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[post.category] || categoryColors.general}`}>
                                {t(`publicPages.community.categories.${post.category}`)}
                              </span>
                              <span className="text-xs text-gray-500">{post.author}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{getTitle(post)}</h4>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {recentPosts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {t('publicPages.community.hub.recentPosts')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recentPosts.map(post => (
                      <Link key={post.id} href={`/community/hub/post/${post.id}`}>
                        <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-lg p-4 hover:border-gray-400 dark:hover:border-white/30 transition cursor-pointer h-full">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[post.category] || categoryColors.general}`}>
                              {t(`publicPages.community.categories.${post.category}`)}
                            </span>
                            <span className="text-xs text-gray-500">{post.author}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate mb-1">{getTitle(post)}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{getContent(post)}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!postsLoading && (!posts || posts.length === 0) && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('adminCommunityContent.noPostsFound')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.community.hub.channelsTitle')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityChannels.map((channel) => (
              <a 
                key={channel.id}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group hover:border-opacity-50 transition-colors block"
                style={{ "--hover-color": channel.color } as React.CSSProperties}
                data-testid={`link-channel-${channel.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${channel.color}20`, color: channel.color }}
                >
                  <channel.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{channel.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{channel.members}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{channel.description}</p>
                <div 
                  className="text-xs font-bold flex items-center gap-2 group-hover:gap-3 transition-all"
                  style={{ color: channel.color }}
                >
                  {channel.action} <ArrowRight className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#7000ff]/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-7 h-7 text-[#ffd700]" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.community.hub.leaderboard.title')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.community.hub.leaderboard.subtitle')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {leaderboard.map((member) => (
                  <div 
                    key={member.rank} 
                    className={`flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-white/5 ${member.isTop ? "border border-[#ffd700]/20" : "border border-gray-200 dark:border-white/5"}`}
                  >
                    <div className={`font-bold w-6 text-center ${member.isTop ? "text-[#ffd700]" : "text-gray-600 dark:text-gray-400"}`}>
                      {member.isTop ? <Crown className="w-4 h-4" /> : member.rank}
                    </div>
                    <div className={`w-10 h-10 rounded-full ${member.isTop ? "bg-gradient-to-br from-[#00f0ff] to-[#7000ff]" : "bg-gray-700"} flex items-center justify-center text-xs font-bold text-white`}>
                      {member.initials}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-white font-bold text-sm">{member.name}</div>
                      <div className="text-gray-500 text-xs">{member.points}</div>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded border ${member.isTop ? "text-[#00f0ff] border-[#00f0ff]/30" : "text-gray-500 dark:text-gray-300 border-gray-500/30"}`}>
                      {member.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-8 border-[#7000ff]/30 bg-gradient-to-br from-[#7000ff]/10 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <Medal className="w-7 h-7 text-[#7000ff]" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('publicPages.community.hub.ambassador.title')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('publicPages.community.hub.ambassador.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {ambassadorBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-[#00ff9d]" /> {benefit}
                  </div>
                ))}
              </div>

              <Link href="/community/hub">
                <button 
                  className="w-full py-3 rounded-lg bg-[#7000ff] text-white font-bold hover:bg-purple-600 transition shadow-[0_0_15px_rgba(112,0,255,0.3)]"
                  data-testid="button-apply-ambassador"
                >
                  {t('publicPages.community.hub.ambassador.applyButton')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t('publicPages.community.hub.contributeTitle')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {contributeWays.map((way, index) => (
              <div key={index} className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 text-center group">
                <div className={`w-12 h-12 rounded-lg ${way.bgColor} flex items-center justify-center mx-auto mb-4 ${way.color} group-hover:scale-110 transition-transform`}>
                  <way.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{way.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{way.description}</p>
                <Link href={way.href}>
                  <button 
                    className="text-xs border border-gray-300 dark:border-white/20 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white"
                    data-testid={`button-contribute-${way.title.toLowerCase()}`}
                  >
                    {way.action}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100 dark:bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('publicPages.community.hub.governance.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">{t('publicPages.community.hub.governance.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <div className="w-12 h-12 bg-[#00f0ff]/10 rounded-lg flex items-center justify-center mb-4">
                <Vote className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.community.hub.governance.voting.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.community.hub.governance.voting.description')}</p>
            </div>
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <div className="w-12 h-12 bg-[#ffd700]/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#ffd700]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.community.hub.governance.security.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.community.hub.governance.security.description')}</p>
            </div>
            <div className="bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6">
              <div className="w-12 h-12 bg-[#00ff9d]/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#00ff9d]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('publicPages.community.hub.governance.treasury.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('publicPages.community.hub.governance.treasury.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
