import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatNumber } from "@/lib/formatters";
import { PhishingWarningBanner } from "@/components/phishing-warning-banner";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import {
  Rocket, Flame, Gift, Trophy, Users, Clock, Zap, Shield, Crown,
  Star, Sparkles, Copy, ExternalLink, CheckCircle, AlertCircle,
  Wallet, Coins, Image, Share2, Twitter, Send, Globe, Award,
  TrendingUp, BarChart3, Loader2, ChevronRight, PartyPopper, Timer,
  Hexagon, Lock, Unlock, RefreshCw, Info, ArrowRight, Heart,
  Layers, Sun, Moon
} from "lucide-react";
import { SiDiscord, SiTelegram } from "react-icons/si";

const LAUNCH_DATE = new Date("2024-12-21T00:00:00Z");

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLaunched: boolean;
}

interface AirdropTier {
  id: string;
  name: string;
  nameKo: string;
  minStake: number;
  tokenReward: number;
  nftReward: boolean;
  multiplier: number;
  color: string;
  borderColor: string;
  icon: typeof Crown;
  benefits: string[];
  benefitsKo: string[];
  label?: string;
}

interface LaunchStats {
  totalParticipants: number;
  totalStaked: string;
  totalAirdropClaimed: string;
  nftsMinted: number;
  referralCount: number;
  countriesRepresented: number;
}

interface UserLaunchData {
  isEligible: boolean;
  tier: string;
  stakedAmount: string;
  airdropAmount: string;
  airdropClaimed: boolean;
  nftClaimed: boolean;
  referralCode: string;
  referralCount: number;
  referralBonus: string;
  tasks: {
    id: string;
    name: string;
    completed: boolean;
    reward: string;
  }[];
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  stakedAmount: string;
  tier: string;
  referrals: number;
  score: number;
}

const AIRDROP_TIERS: AirdropTier[] = [
  {
    id: "genesis",
    name: "Genesis Founder",
    nameKo: "Genesis 창립자",
    minStake: 100000,
    tokenReward: 50000,
    nftReward: true,
    multiplier: 5.0,
    color: "from-orange-500/20 to-transparent",
    borderColor: "border-orange-500",
    icon: Crown,
    label: "LEGENDARY",
    benefits: [
      "Exclusive Genesis NFT (1 of 100)",
      "5x Airdrop Multiplier",
      "Lifetime Governance Premium",
      "Private Discord Channel",
      "Early Access to All Features"
    ],
    benefitsKo: [
      "독점 Genesis NFT (100개 한정)",
      "5배 에어드랍 배수",
      "평생 거버넌스 프리미엄",
      "프라이빗 디스코드 채널",
      "모든 기능 조기 액세스"
    ]
  },
  {
    id: "diamond",
    name: "Diamond Pioneer",
    nameKo: "Diamond 파이오니어",
    minStake: 50000,
    tokenReward: 25000,
    nftReward: true,
    multiplier: 3.0,
    color: "from-cyan-500/20 to-transparent",
    borderColor: "border-cyan-500",
    icon: Sparkles,
    benefits: [
      "Diamond Pioneer NFT",
      "3x Airdrop Multiplier",
      "Priority Support Access",
      "Beta Testing Privileges",
      "Exclusive Merch Pack"
    ],
    benefitsKo: [
      "Diamond Pioneer NFT",
      "3배 에어드랍 배수",
      "우선 지원 액세스",
      "베타 테스트 특권",
      "독점 굿즈 팩"
    ]
  },
  {
    id: "gold",
    name: "Gold Validator",
    nameKo: "Gold 검증자",
    minStake: 10000,
    tokenReward: 10000,
    nftReward: true,
    multiplier: 2.0,
    color: "from-yellow-500/20 to-transparent",
    borderColor: "border-yellow-500",
    icon: Award,
    benefits: [
      "Gold Validator NFT",
      "2x Airdrop Multiplier",
      "Validator Dashboard Access",
      "Monthly AMA Invites"
    ],
    benefitsKo: [
      "Gold Validator NFT",
      "2배 에어드랍 배수",
      "검증자 대시보드 액세스",
      "월간 AMA 초대"
    ]
  },
  {
    id: "silver",
    name: "Silver Supporter",
    nameKo: "Silver 서포터",
    minStake: 1000,
    tokenReward: 2500,
    nftReward: false,
    multiplier: 1.5,
    color: "from-gray-400/20 to-transparent",
    borderColor: "border-gray-400",
    icon: Star,
    benefits: [
      "1.5x Airdrop Multiplier",
      "Community Badge",
      "Event Priority Access"
    ],
    benefitsKo: [
      "1.5배 에어드랍 배수",
      "커뮤니티 배지",
      "이벤트 우선 액세스"
    ]
  },
  {
    id: "bronze",
    name: "Bronze Member",
    nameKo: "Bronze 멤버",
    minStake: 100,
    tokenReward: 500,
    nftReward: false,
    multiplier: 1.0,
    color: "from-amber-700/20 to-transparent",
    borderColor: "border-amber-700",
    icon: Users,
    benefits: [
      "Base Airdrop Reward",
      "Launch Participant Badge",
      "Community Access"
    ],
    benefitsKo: [
      "기본 에어드랍 보상",
      "런칭 참여자 배지",
      "커뮤니티 액세스"
    ]
  }
];

const SOCIAL_TASKS = [
  { id: "twitter_follow", name: "Follow on X/Twitter", nameKo: "X/Twitter 팔로우", reward: "100 TBURN", icon: Twitter },
  { id: "discord_join", name: "Join Discord", nameKo: "Discord 가입", reward: "100 TBURN", icon: SiDiscord },
  { id: "telegram_join", name: "Join Telegram", nameKo: "Telegram 가입", reward: "100 TBURN", icon: SiTelegram },
  { id: "share_launch", name: "Share Launch Post", nameKo: "런칭 포스트 공유", reward: "200 TBURN", icon: Share2 },
  { id: "first_stake", name: "First Stake", nameKo: "첫 스테이킹", reward: "500 TBURN", icon: Coins },
  { id: "bridge_tx", name: "Bridge Transaction", nameKo: "브릿지 트랜잭션", reward: "300 TBURN", icon: ArrowRight }
];

function useCountdown(targetDate: Date): CountdownTime {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLaunched: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLaunched: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isLaunched: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function TierCard({ tier, isActive, isKorean }: { tier: AirdropTier; isActive: boolean; isKorean: boolean }) {
  const Icon = tier.icon;
  const benefits = isKorean ? tier.benefitsKo : tier.benefits;
  const name = isKorean ? tier.nameKo : tier.name;

  const getTierGlowClass = () => {
    switch (tier.id) {
      case "genesis": return "shadow-[0_0_15px_rgba(249,115,22,0.3)]";
      case "diamond": return "shadow-[0_0_10px_rgba(6,182,212,0.3)]";
      case "gold": return "shadow-[0_0_8px_rgba(234,179,8,0.2)]";
      case "silver": return "shadow-[0_0_5px_rgba(148,163,184,0.2)]";
      default: return "";
    }
  };

  const getTierTextColor = () => {
    switch (tier.id) {
      case "genesis": return "text-orange-500";
      case "diamond": return "text-cyan-400";
      case "gold": return "text-yellow-500";
      case "silver": return "text-gray-400";
      case "bronze": return "text-amber-600";
      default: return "text-white";
    }
  };

  return (
    <div 
      className={`relative backdrop-blur-xl bg-gradient-to-b ${tier.color} border ${tier.borderColor} rounded-2xl p-5 transition-all duration-300 ${getTierGlowClass()} ${isActive ? "ring-2 ring-blue-500 scale-105" : "hover:scale-102"}`}
      data-testid={`tier-card-${tier.id}`}
    >
      {tier.label && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
          {tier.label}
        </div>
      )}
      {isActive && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-blue-500 text-white text-[10px]">
            <CheckCircle className="w-3 h-3 mr-1" />
            {isKorean ? "현재 등급" : "Your Tier"}
          </Badge>
        </div>
      )}
      
      <h3 className={`text-lg font-bold ${getTierTextColor()} mb-1`}>{name}</h3>
      <p className="text-xs text-slate-400 mb-4">
        Min: <span className="font-mono font-bold text-white">{formatNumber(tier.minStake)}</span> TBURN
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">TBURN {isKorean ? "보상" : "Reward"}</p>
          <p className="text-xl font-bold font-mono text-white">{formatNumber(tier.tokenReward)}+</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">{isKorean ? "배수" : "Multiplier"}</p>
          <p className={`text-xl font-bold font-mono ${getTierTextColor()}`}>{tier.multiplier}x</p>
        </div>
      </div>
      
      <div className="text-xs text-slate-400 space-y-2">
        {benefits.slice(0, 3).map((benefit, idx) => (
          <p key={idx} className="flex items-start gap-2">
            <CheckCircle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${tier.nftReward && idx === 0 ? getTierTextColor() : 'text-emerald-500'}`} />
            <span className={tier.nftReward && idx === 0 ? 'text-white font-medium' : ''}>{benefit}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, isUser, rank }: { entry: LeaderboardEntry; isUser: boolean; rank: number }) {
  const getRankDisplay = () => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-400 font-mono text-sm">{rank}</span>;
  };

  const getTierBadge = () => {
    const colors: Record<string, string> = {
      genesis: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      diamond: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      silver: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      bronze: "bg-amber-700/20 text-amber-600 border-amber-700/30"
    };
    return colors[entry.tier] || colors.bronze;
  };

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-xl transition-all ${isUser ? "bg-blue-500/10 border border-blue-500/30" : "bg-slate-800/40 hover:bg-slate-800/60"}`}
      data-testid={`leaderboard-row-${rank}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-8 flex justify-center">{getRankDisplay()}</div>
        <div>
          <div className="font-medium text-white flex items-center gap-2">
            {entry.displayName || `${entry.address.slice(0, 8)}...${entry.address.slice(-6)}`}
            {isUser && <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-400">You</Badge>}
          </div>
          <div className="text-xs text-slate-400">
            <span className="font-mono">{formatNumber(parseFloat(entry.stakedAmount))}</span> TBURN
          </div>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <Badge variant="outline" className={`text-[10px] ${getTierBadge()}`}>
          {entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1)}
        </Badge>
        <div>
          <div className="font-bold font-mono text-blue-400">{formatNumber(entry.score)}</div>
          <div className="text-[10px] text-slate-500">{entry.referrals} referrals</div>
        </div>
      </div>
    </div>
  );
}

export default function LaunchEventPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, address, connect } = useWeb3();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedReferral, setCopiedReferral] = useState(false);

  const isKorean = i18n.language === "ko";
  const countdown = useCountdown(LAUNCH_DATE);

  const { data: launchStats, isLoading: statsLoading } = useQuery<LaunchStats>({
    queryKey: ["/api/launch-event/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const { data: userData, isLoading: userLoading } = useQuery<UserLaunchData>({
    queryKey: ["/api/launch-event/user", address],
    enabled: !!address && isConnected,
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/launch-event/leaderboard"],
    staleTime: 60000,
    refetchInterval: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const claimAirdropMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/launch-event/claim-airdrop", { address });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isKorean ? "에어드랍 클레임 성공!" : "Airdrop Claimed!",
        description: isKorean ? "TBURN 토큰이 지갑으로 전송되었습니다." : "TBURN tokens have been sent to your wallet."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/launch-event/user"] });
    },
    onError: () => {
      toast({
        title: isKorean ? "클레임 실패" : "Claim Failed",
        description: isKorean ? "잠시 후 다시 시도해주세요." : "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const claimNftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/launch-event/mint-nft", { address });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isKorean ? "NFT 민팅 성공!" : "NFT Minted!",
        description: isKorean ? "Genesis NFT가 지갑으로 전송되었습니다." : "Genesis NFT has been sent to your wallet."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/launch-event/user"] });
    },
    onError: () => {
      toast({
        title: isKorean ? "민팅 실패" : "Minting Failed",
        variant: "destructive"
      });
    }
  });

  const userTier = useMemo(() => {
    if (!userData) return null;
    return AIRDROP_TIERS.find(t => t.id === userData.tier);
  }, [userData]);

  const copyReferralCode = () => {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(`https://tburn.network/launch?ref=${userData.referralCode}`);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
      toast({
        title: isKorean ? "복사됨!" : "Copied!",
        description: isKorean ? "레퍼럴 링크가 클립보드에 복사되었습니다." : "Referral link copied to clipboard."
      });
    }
  };

  const defaultStats: LaunchStats = {
    totalParticipants: 28549,
    totalStaked: "125000000",
    totalAirdropClaimed: "15000000",
    nftsMinted: 1248,
    referralCount: 8936,
    countriesRepresented: 89
  };

  const stats = launchStats || defaultStats;

  const defaultLeaderboard: LeaderboardEntry[] = [
    { rank: 1, address: "tb1whale...abc1", displayName: "Genesis Whale", stakedAmount: "2500000", tier: "genesis", referrals: 156, score: 2850000 },
    { rank: 2, address: "tb1diamond...def2", displayName: "Diamond Hands", stakedAmount: "1800000", tier: "genesis", referrals: 98, score: 1950000 },
    { rank: 3, address: "tb1hodler...ghi3", displayName: "TBURN HODLER", stakedAmount: "1200000", tier: "diamond", referrals: 87, score: 1320000 },
    { rank: 4, address: "tb1staker...jkl4", displayName: "Pro Staker", stakedAmount: "800000", tier: "diamond", referrals: 64, score: 890000 },
    { rank: 5, address: "tb1early...mno5", displayName: "Early Bird", stakedAmount: "500000", tier: "gold", referrals: 52, score: 560000 },
    { rank: 6, address: "tb1builder...pqr6", displayName: "Builder", stakedAmount: "350000", tier: "gold", referrals: 41, score: 400000 },
    { rank: 7, address: "tb1community...stu7", displayName: "Community Lead", stakedAmount: "250000", tier: "gold", referrals: 38, score: 295000 },
    { rank: 8, address: "tb1believer...vwx8", displayName: "True Believer", stakedAmount: "180000", tier: "silver", referrals: 29, score: 210000 },
    { rank: 9, address: "tb1supporter...yza9", displayName: "Supporter", stakedAmount: "120000", tier: "silver", referrals: 22, score: 145000 },
    { rank: 10, address: "tb1member...bcd0", displayName: "Active Member", stakedAmount: "80000", tier: "bronze", referrals: 15, score: 95000 }
  ];

  const leaderboardData = leaderboard || defaultLeaderboard;

  const tabs = [
    { id: "overview", label: isKorean ? "개요 (Overview)" : "Overview" },
    { id: "rewards", label: isKorean ? "보상 (Rewards)" : "Rewards" },
    { id: "tasks", label: isKorean ? "태스크 (Tasks)" : "Tasks" },
    { id: "leaderboard", label: isKorean ? "순위 (Leaderboard)" : "Leaderboard" }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans">
      <PhishingWarningBanner />
      
      <header className="h-16 border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            T
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg tracking-tight text-white">
              TBURN <span className="text-orange-500">Event</span>
            </h1>
          </div>
          <Badge className="bg-orange-500/10 text-orange-500 border border-orange-500/30 animate-pulse">
            <span className="mr-1">●</span> LIVE EVENT
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          {isConnected ? (
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 gap-1">
              <Wallet className="w-3 h-3" />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Badge>
          ) : (
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              onClick={() => setShowWalletModal(true)} 
              data-testid="button-connect-wallet"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isKorean ? "지갑 연결" : "Connect Wallet"}
            </Button>
          )}
        </div>
      </header>

      <main className="overflow-y-auto">
        <div className="relative bg-gradient-to-br from-blue-500/10 via-transparent to-orange-500/10 border-b border-slate-800 p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                  TBURN {isKorean ? "메인넷" : "Mainnet"} <span className="text-orange-500">Genesis {isKorean ? "런칭" : "Launch"}</span>
                </h1>
                <p className="text-base md:text-lg text-slate-400 max-w-2xl">
                  {isKorean 
                    ? "TBURN 메인넷의 역사적인 순간에 함께하세요. 에어드랍, Genesis NFT, 그리고 특별 보상이 기다리고 있습니다."
                    : "Join us for the historic launch of TBURN Mainnet. Airdrops, Genesis NFTs, and exclusive rewards await."}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">Mainnet Status</span>
                {countdown.isLaunched ? (
                  <div className="text-xl md:text-2xl font-bold text-emerald-500 flex items-center justify-end gap-2">
                    <CheckCircle className="w-5 h-5" /> MAINNET LIVE
                  </div>
                ) : (
                  <div className="text-xl md:text-2xl font-bold text-orange-500 flex items-center justify-end gap-2" data-testid="countdown-timer">
                    <Clock className="w-5 h-5" /> 
                    {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-8" data-testid="launch-stats">
              <GlassPanel className="p-4 text-center">
                <p className="text-xs text-slate-500">{isKorean ? "참여자" : "Participants"}</p>
                <p className="text-xl md:text-2xl font-bold font-mono text-white">{formatNumber(stats.totalParticipants)}</p>
              </GlassPanel>
              <GlassPanel className="p-4 text-center">
                <p className="text-xs text-slate-500">{isKorean ? "스테이킹" : "Staked"}</p>
                <p className="text-xl md:text-2xl font-bold font-mono text-blue-400">{formatNumber(parseFloat(stats.totalStaked) / 1e6)}M</p>
              </GlassPanel>
              <GlassPanel className="p-4 text-center">
                <p className="text-xs text-slate-500">{isKorean ? "에어드랍 할당" : "Airdrop"}</p>
                <p className="text-xl md:text-2xl font-bold font-mono text-orange-500">{formatNumber(parseFloat(stats.totalAirdropClaimed) / 1e6)}M</p>
              </GlassPanel>
              <GlassPanel className="p-4 text-center">
                <p className="text-xs text-slate-500">{isKorean ? "NFT 민팅" : "NFT Minted"}</p>
                <p className="text-xl md:text-2xl font-bold font-mono text-white">{formatNumber(stats.nftsMinted)}</p>
              </GlassPanel>
              <GlassPanel className="p-4 text-center">
                <p className="text-xs text-slate-500">{isKorean ? "국가" : "Countries"}</p>
                <p className="text-xl md:text-2xl font-bold font-mono text-white">{stats.countriesRepresented}</p>
              </GlassPanel>
            </div>
          </div>
        </div>

        <div className="sticky top-16 z-40 bg-[#0B1120]/95 backdrop-blur-xl border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? "text-blue-500 border-b-2 border-blue-500 bg-blue-500/5" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-[240px] md:pb-[200px]">
          {activeTab === "overview" && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-orange-500" />
                  {isKorean ? "에어드랍 티어 시스템" : "Airdrop Tier System"}
                </h2>
                <p className="text-slate-400 mb-6">
                  {isKorean 
                    ? "스테이킹 금액에 따라 티어가 결정되며, 높은 티어일수록 더 많은 보상을 받습니다."
                    : "Your tier is determined by your staked amount. Higher tiers receive greater rewards."}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {AIRDROP_TIERS.map((tier) => (
                    <TierCard 
                      key={tier.id} 
                      tier={tier} 
                      isActive={userData?.tier === tier.id}
                      isKorean={isKorean}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Image className="w-6 h-6 text-purple-500" />
                  Genesis NFT {isKorean ? "컬렉션" : "Collection"}
                </h2>
                <p className="text-slate-400 mb-6">
                  {isKorean 
                    ? "Gold 티어 이상의 참여자에게 독점 Genesis NFT가 제공됩니다. (총 1,000개 한정)"
                    : "Exclusive Genesis NFTs are available for Gold tier and above participants. (Limited to 1,000 total)"}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Genesis Founder", total: 100, minted: 89, color: "from-orange-500 to-red-500" },
                    { name: "Diamond Pioneer", total: 300, minted: 247, color: "from-cyan-500 to-blue-500" },
                    { name: "Gold Validator", total: 600, minted: 512, color: "from-yellow-500 to-amber-500" }
                  ].map((nft, idx) => (
                    <GlassPanel key={idx} className="p-5">
                      <div className={`h-32 rounded-xl bg-gradient-to-br ${nft.color} mb-4 flex items-center justify-center`}>
                        <Hexagon className="w-16 h-16 text-white/50" />
                      </div>
                      <h3 className="font-bold text-white mb-2">{nft.name} NFT</h3>
                      <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Minted</span>
                        <span className="font-mono">{nft.minted}/{nft.total}</span>
                      </div>
                      <Progress value={(nft.minted / nft.total) * 100} className="h-2" />
                    </GlassPanel>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Share2 className="w-6 h-6 text-blue-500" />
                  {isKorean ? "레퍼럴 프로그램" : "Referral Program"}
                </h2>
                <p className="text-slate-400 mb-6">
                  {isKorean 
                    ? "친구를 초대하고 추가 보상을 받으세요. 추천인당 200 TBURN 보너스!"
                    : "Invite friends and earn extra rewards. 200 TBURN bonus per referral!"}
                </p>
                
                <GlassPanel className="p-6">
                  {isConnected && userData ? (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                          <p className="text-xs text-slate-500 mb-1">{isKorean ? "내 레퍼럴 코드" : "Your Referral Code"}</p>
                          <div className="flex items-center gap-2">
                            <code className="text-lg font-mono text-white flex-1">{userData.referralCode}</code>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={copyReferralCode}
                              className="border-slate-600"
                            >
                              {copiedReferral ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 text-center">
                            <p className="text-xs text-slate-500">{isKorean ? "추천 수" : "Referrals"}</p>
                            <p className="text-2xl font-bold font-mono text-blue-400">{userData.referralCount}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 text-center">
                            <p className="text-xs text-slate-500">{isKorean ? "보너스" : "Bonus"}</p>
                            <p className="text-2xl font-bold font-mono text-orange-500">{userData.referralBonus}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">
                        {isKorean ? "레퍼럴 프로그램에 참여하려면 지갑을 연결하세요." : "Connect your wallet to join the referral program."}
                      </p>
                      <Button 
                        onClick={() => setShowWalletModal(true)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        {isKorean ? "지갑 연결" : "Connect Wallet"}
                      </Button>
                    </div>
                  )}
                </GlassPanel>
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-orange-500" />
                  {isKorean ? "내 보상" : "My Rewards"}
                </h2>
                
                {isConnected && userData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassPanel className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">{isKorean ? "에어드랍 보상" : "Airdrop Reward"}</p>
                          <p className="text-2xl font-bold font-mono text-white">{userData.airdropAmount} TBURN</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                        onClick={() => claimAirdropMutation.mutate()}
                        disabled={userData.airdropClaimed || claimAirdropMutation.isPending}
                      >
                        {claimAirdropMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : userData.airdropClaimed ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Gift className="w-4 h-4 mr-2" />
                        )}
                        {userData.airdropClaimed ? (isKorean ? "클레임 완료" : "Claimed") : (isKorean ? "에어드랍 클레임" : "Claim Airdrop")}
                      </Button>
                    </GlassPanel>

                    {userTier?.nftReward && (
                      <GlassPanel className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Image className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Genesis NFT</p>
                            <p className="text-lg font-bold text-white">{userTier.name} NFT</p>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          onClick={() => claimNftMutation.mutate()}
                          disabled={userData.nftClaimed || claimNftMutation.isPending}
                        >
                          {claimNftMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : userData.nftClaimed ? (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          {userData.nftClaimed ? (isKorean ? "민팅 완료" : "Minted") : (isKorean ? "NFT 민팅" : "Mint NFT")}
                        </Button>
                      </GlassPanel>
                    )}
                  </div>
                ) : (
                  <GlassPanel className="p-12 text-center">
                    <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      {isKorean ? "지갑을 연결하세요" : "Connect Your Wallet"}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {isKorean ? "보상을 확인하고 클레임하려면 지갑을 연결하세요." : "Connect your wallet to view and claim your rewards."}
                    </p>
                    <Button 
                      size="lg"
                      onClick={() => setShowWalletModal(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      {isKorean ? "지갑 연결" : "Connect Wallet"}
                    </Button>
                  </GlassPanel>
                )}
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  {isKorean ? "태스크 & 퀘스트" : "Tasks & Quests"}
                </h2>
                <p className="text-slate-400 mb-6">
                  {isKorean 
                    ? "태스크를 완료하고 추가 보상을 획득하세요!"
                    : "Complete tasks to earn additional rewards!"}
                </p>

                <div className="space-y-3">
                  {SOCIAL_TASKS.map((task, idx) => {
                    const Icon = task.icon;
                    const isCompleted = userData?.tasks?.find(t => t.id === task.id)?.completed || false;
                    
                    return (
                      <GlassPanel key={task.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? "bg-emerald-500/20" : "bg-slate-700"}`}>
                            <Icon className={`w-5 h-5 ${isCompleted ? "text-emerald-500" : "text-slate-400"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{isKorean ? task.nameKo : task.name}</p>
                            <p className="text-sm text-slate-400">{isKorean ? "보상" : "Reward"}: <span className="text-orange-500 font-mono">{task.reward}</span></p>
                          </div>
                        </div>
                        <Button 
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          disabled={isCompleted}
                          className={isCompleted ? "border-emerald-500 text-emerald-500" : "bg-blue-500 hover:bg-blue-600"}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {isKorean ? "완료" : "Done"}
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-4 h-4 mr-1" />
                              {isKorean ? "시작" : "Start"}
                            </>
                          )}
                        </Button>
                      </GlassPanel>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  {isKorean ? "런칭 리더보드" : "Launch Leaderboard"}
                </h2>
                <p className="text-slate-400 mb-6">
                  {isKorean 
                    ? "스테이킹 금액과 레퍼럴을 기반으로 한 상위 참여자 순위입니다."
                    : "Top participants ranked by staking amount and referrals."}
                </p>

                <div className="space-y-3">
                  {leaderboardData.map((entry, idx) => (
                    <LeaderboardRow 
                      key={entry.address}
                      entry={entry}
                      rank={idx + 1}
                      isUser={address === entry.address}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120] to-transparent pt-16 pb-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/staking">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30"
                data-testid="button-join-launch"
              >
                <Rocket className="w-5 h-5 mr-2" />
                {isKorean ? "런칭 이벤트 참여" : "Join Launch Event"}
              </Button>
            </Link>
            <Link href="/staking">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30"
                data-testid="link-staking"
              >
                <Coins className="w-5 h-5 mr-2" />
                {isKorean ? "스테이킹 하기" : "Start Staking"}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <WalletConnectModal 
        open={showWalletModal} 
        onOpenChange={setShowWalletModal}
      />
    </div>
  );
}
