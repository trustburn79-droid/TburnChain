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
  general: "text-gray-400 bg-gray-400/10",
  support: "text-[#ff0055] bg-[#ff0055]/10",
};

export default function CommunityHub() {
  const { t, i18n } = useTranslation();

  const isKorean = i18n.language === 'ko';

  const { data: posts, isLoading: postsLoading } = useQuery<PostData[]>({
    queryKey: ['/api/community/posts'],
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<CommunityStats>({
    queryKey: ['/api/community/stats'],
    refetchInterval: 60000,
  });

  const pinnedPosts = posts?.filter(p => p.isPinned).slice(0, 3) || [];
  const hotPosts = posts?.filter(p => p.isHot && !p.isPinned).slice(0, 3) || [];
  const recentPosts = posts?.filter(p => !p.isPinned && !p.isHot).slice(0, 6) || [];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return isKorean ? '방금 전' : 'Just now';
    if (diffHours < 24) return isKorean ? `${diffHours}시간 전` : `${diffHours}h ago`;
    if (diffDays < 7) return isKorean ? `${diffDays}일 전` : `${diffDays}d ago`;
    return date.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US');
  };

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
      href: "https://discord.gg/tburnchain",
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
      href: "https://x.com/tburnchain",
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
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Users className="w-3 h-3" /> {t('publicPages.community.hub.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('publicPages.community.hub.title')}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.community.hub.subtitle')}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 bg-white/5 border-b border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {communityStats.map((stat) => (
              <div key={stat.id} className="spotlight-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.iconColor}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono bg-[#00ff9d]/10 text-[#00ff9d] px-2 py-0.5 rounded border border-[#00ff9d]/20">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1 font-mono">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forum Posts Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#7000ff]" />
              {isKorean ? '커뮤니티 포럼' : 'Community Forum'}
            </h2>
            <Link href="/app/community">
              <button className="text-sm text-[#00f0ff] hover:underline flex items-center gap-1">
                {isKorean ? '전체 보기' : 'View All'} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {postsLoading && (
            <div className="flex items-center justify-center gap-3 py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#7000ff]" />
              <span className="text-gray-400">{t('common.loading')}</span>
            </div>
          )}

          {!postsLoading && posts && posts.length > 0 && (
            <div className="space-y-6">
              {/* Pinned Posts */}
              {pinnedPosts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                    <Pin className="w-4 h-4" /> {isKorean ? '고정 게시물' : 'Pinned'}
                  </h3>
                  {pinnedPosts.map(post => (
                    <Link key={post.id} href={`/app/community/post/${post.id}`}>
                      <div className="spotlight-card rounded-lg p-4 border border-[#7000ff]/30 hover:border-[#7000ff] transition cursor-pointer">
                        <div className="flex items-start gap-4">
                          <Pin className="w-4 h-4 text-[#7000ff] mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[post.category] || categoryColors.general}`}>
                                {post.category}
                              </span>
                              <span className="text-xs text-gray-500">{post.author}</span>
                            </div>
                            <h4 className="font-bold text-white truncate">{isKorean ? (post.titleKo || post.title) : post.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-1 mt-1">{isKorean ? (post.contentKo || post.content) : post.content}</p>
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

              {/* Hot Posts */}
              {hotPosts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" /> {isKorean ? '인기 게시물' : 'Hot'}
                  </h3>
                  {hotPosts.map(post => (
                    <Link key={post.id} href={`/app/community/post/${post.id}`}>
                      <div className="spotlight-card rounded-lg p-4 border border-orange-500/30 hover:border-orange-500 transition cursor-pointer">
                        <div className="flex items-start gap-4">
                          <Flame className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[post.category] || categoryColors.general}`}>
                                {post.category}
                              </span>
                              <span className="text-xs text-gray-500">{post.author}</span>
                            </div>
                            <h4 className="font-bold text-white truncate">{isKorean ? (post.titleKo || post.title) : post.title}</h4>
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

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-400">
                    {isKorean ? '최근 게시물' : 'Recent Posts'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recentPosts.map(post => (
                      <Link key={post.id} href={`/app/community/post/${post.id}`}>
                        <div className="spotlight-card rounded-lg p-4 border border-white/10 hover:border-white/30 transition cursor-pointer h-full">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[post.category] || categoryColors.general}`}>
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-500">{post.author}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm truncate mb-1">{isKorean ? (post.titleKo || post.title) : post.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-2">{isKorean ? (post.contentKo || post.content) : post.content}</p>
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
              <p className="text-gray-400">{t('adminCommunityContent.noPostsFound')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">{t('publicPages.community.hub.channelsTitle')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityChannels.map((channel) => (
              <a 
                key={channel.id}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className="spotlight-card rounded-xl p-6 group border border-white/10 hover:border-opacity-50 transition-colors block"
                style={{ "--hover-color": channel.color } as React.CSSProperties}
                data-testid={`link-channel-${channel.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${channel.color}20`, color: channel.color }}
                >
                  <channel.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{channel.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{channel.members}</p>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{channel.description}</p>
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

      {/* Leaderboard & Ambassador Program */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#7000ff]/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contributor Leaderboard */}
            <div className="spotlight-card rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-7 h-7 text-[#ffd700]" />
                <div>
                  <h3 className="text-xl font-bold text-white">{t('publicPages.community.hub.leaderboard.title')}</h3>
                  <p className="text-xs text-gray-400">{t('publicPages.community.hub.leaderboard.subtitle')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {leaderboard.map((member) => (
                  <div 
                    key={member.rank} 
                    className={`flex items-center gap-4 p-3 rounded-lg bg-white/5 ${member.isTop ? "border border-[#ffd700]/20" : "border border-white/5"}`}
                  >
                    <div className={`font-bold w-6 text-center ${member.isTop ? "text-[#ffd700]" : "text-gray-400"}`}>
                      {member.isTop ? <Crown className="w-4 h-4" /> : member.rank}
                    </div>
                    <div className={`w-10 h-10 rounded-full ${member.isTop ? "bg-gradient-to-br from-[#00f0ff] to-[#7000ff]" : "bg-gray-700"} flex items-center justify-center text-xs font-bold text-white`}>
                      {member.initials}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">{member.name}</div>
                      <div className="text-gray-500 text-xs">{member.points}</div>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded border ${member.isTop ? "text-[#00f0ff] border-[#00f0ff]/30" : "text-gray-300 border-gray-500/30"}`}>
                      {member.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambassador Program */}
            <div className="spotlight-card rounded-xl p-8 border border-[#7000ff]/30 bg-gradient-to-br from-[#7000ff]/10 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <Medal className="w-7 h-7 text-[#7000ff]" />
                <div>
                  <h3 className="text-xl font-bold text-white">{t('publicPages.community.hub.ambassador.title')}</h3>
                  <p className="text-xs text-gray-400">{t('publicPages.community.hub.ambassador.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {ambassadorBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
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

      {/* Ways to Contribute */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">{t('publicPages.community.hub.contributeTitle')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {contributeWays.map((way, index) => (
              <div key={index} className="spotlight-card rounded-xl p-6 text-center border border-white/10 group">
                <div className={`w-12 h-12 rounded-lg ${way.bgColor} flex items-center justify-center mx-auto mb-4 ${way.color} group-hover:scale-110 transition-transform`}>
                  <way.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-2">{way.title}</h3>
                <p className="text-xs text-gray-400 mb-4">{way.description}</p>
                <Link href={way.href}>
                  <button 
                    className="text-xs border border-white/20 px-3 py-1 rounded hover:bg-white/10 text-white"
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

      {/* Governance Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff] mb-4">
              <Vote className="w-3 h-3" /> TBURN DAO
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">{t('publicPages.community.hub.governance.title')}</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('publicPages.community.hub.governance.description')}
            </p>
            <Link href="/app/governance">
              <button 
                className="px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition flex items-center gap-2"
                data-testid="button-governance-portal"
              >
                {t('publicPages.community.hub.governance.button')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">124</div>
              <div className="text-xs text-gray-500">{t('publicPages.community.hub.governance.stats.proposals')}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">15.2M</div>
              <div className="text-xs text-gray-500">{t('publicPages.community.hub.governance.stats.votesCast')}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 text-center col-span-2">
              <div className="text-2xl font-bold text-white mb-1">$12.8M</div>
              <div className="text-xs text-gray-500">{t('publicPages.community.hub.governance.stats.treasury')}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
