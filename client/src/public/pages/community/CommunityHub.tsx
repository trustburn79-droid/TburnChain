import { 
  Users, TrendingUp, Crown, GitBranch, ArrowRight, Trophy, Medal,
  CheckCircle, Code, Book, Shield, Megaphone, Vote
} from "lucide-react";
import { SiDiscord, SiTelegram, SiX, SiGithub } from "react-icons/si";
import { Link } from "wouter";

const communityStats = [
  {
    id: 1,
    icon: Users,
    value: "307,538",
    label: "Total Members",
    change: "+12.5%",
    iconColor: "text-[#7000ff]",
    bgColor: "bg-[#7000ff]/10",
  },
  {
    id: 2,
    icon: TrendingUp,
    value: "89,421",
    label: "Monthly Active",
    change: "+8.3%",
    iconColor: "text-[#00f0ff]",
    bgColor: "bg-[#00f0ff]/10",
  },
  {
    id: 3,
    icon: Crown,
    value: "1,247",
    label: "Ambassadors",
    change: "+156",
    iconColor: "text-[#ffd700]",
    bgColor: "bg-[#ffd700]/10",
  },
  {
    id: 4,
    icon: GitBranch,
    value: "482",
    label: "Contributors",
    change: "+45",
    iconColor: "text-[#ff0055]",
    bgColor: "bg-[#ff0055]/10",
  },
];

const communityChannels = [
  {
    id: 1,
    name: "Discord",
    icon: SiDiscord,
    members: "52,847 members",
    description: "Real-time dev chat, support, and community hanging out.",
    action: "Join Server",
    color: "#5865F2",
    href: "https://discord.gg/tburnchain",
    external: true,
  },
  {
    id: 2,
    name: "Telegram",
    icon: SiTelegram,
    members: "38,291 members",
    description: "Fast announcements and local community groups.",
    action: "Join Channel",
    color: "#0088cc",
    href: "https://t.me/tburnchain",
    external: true,
  },
  {
    id: 3,
    name: "Twitter / X",
    icon: SiX,
    members: "127,450 followers",
    description: "Latest updates, partnerships, and event news.",
    action: "Follow Us",
    color: "#ffffff",
    href: "https://x.com/tburnchain",
    external: true,
  },
  {
    id: 4,
    name: "GitHub",
    icon: SiGithub,
    members: "3,842 stargazers",
    description: "Open source code, SDKs, and technical documentation.",
    action: "Contribute",
    color: "#e0e0e0",
    href: "https://github.com/tburnchain",
    external: true,
  },
];

const leaderboard = [
  { rank: 1, name: "CryptoKim", initials: "CK", points: "125,840 pts", tier: "Diamond", isTop: true },
  { rank: 2, name: "BlockMaster", initials: "BM", points: "98,520 pts", tier: "Platinum", isTop: false },
  { rank: 3, name: "DeFiQueen", initials: "DQ", points: "87,340 pts", tier: "Platinum", isTop: false },
];

const ambassadorBenefits = [
  "Monthly TBURN token rewards",
  "Early access to new features",
  "Official NFT Badge & Swag",
  "Direct team communication channel",
];

const contributeWays = [
  { icon: Code, title: "Code", description: "SDKs, Smart Contracts, Tools", action: "View Issues", color: "text-[#00f0ff]", bgColor: "bg-[#00f0ff]/10", href: "/developers/docs" },
  { icon: Book, title: "Content", description: "Tutorials, Blogs, Translations", action: "Submit Content", color: "text-[#ffd700]", bgColor: "bg-[#ffd700]/10", href: "/community/news" },
  { icon: Shield, title: "Moderation", description: "Discord & Telegram Support", action: "Apply Mod", color: "text-[#00ff9d]", bgColor: "bg-[#00ff9d]/10", href: "/community/hub" },
  { icon: Megaphone, title: "Marketing", description: "Events, Social Media, Growth", action: "Join Team", color: "text-[#ff0055]", bgColor: "bg-[#ff0055]/10", href: "/community/events" },
];

export default function CommunityHub() {
  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#7000ff] mb-6">
            <Users className="w-3 h-3" /> TBURN_COMMUNITY
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Global <span className="text-gradient">Community</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            Join 300K+ global community members in building the future of TBurn Chain. <br />
            Connect, contribute, and govern the ecosystem.
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

      {/* Community Channels */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Community Channels</h2>
          
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
                  <h3 className="text-xl font-bold text-white">Contributor Leaderboard</h3>
                  <p className="text-xs text-gray-400">Top community contributors this month</p>
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
                  <h3 className="text-xl font-bold text-white">Ambassador Program</h3>
                  <p className="text-xs text-gray-400">Lead the global community</p>
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
                  Apply as Ambassador
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Contribute */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Ways to Contribute</h2>
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
            <h2 className="text-3xl font-bold text-white mb-4">Governance</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Stake TBURN tokens to participate in protocol decisions. <br />
              Create proposals, vote on upgrades, and manage the community treasury.
            </p>
            <Link href="/governance">
              <button 
                className="px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition flex items-center gap-2"
                data-testid="button-governance-portal"
              >
                Go to Governance Portal <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">124</div>
              <div className="text-xs text-gray-500">Proposals</div>
            </div>
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">15.2M</div>
              <div className="text-xs text-gray-500">Votes Cast</div>
            </div>
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 text-center col-span-2">
              <div className="text-2xl font-bold text-white mb-1">$12.8M</div>
              <div className="text-xs text-gray-500">Treasury Balance</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
