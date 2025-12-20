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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Rocket, Flame, Gift, Trophy, Users, Clock, Zap, Shield, Crown,
  Star, Sparkles, Copy, ExternalLink, CheckCircle, AlertCircle,
  Wallet, Coins, Image, Share2, Twitter, Send, Globe, Award,
  TrendingUp, BarChart3, Loader2, ChevronRight, PartyPopper, Timer,
  Hexagon, Lock, Unlock, RefreshCw, Info, ArrowRight, Heart
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
  icon: typeof Crown;
  benefits: string[];
  benefitsKo: string[];
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
    color: "from-amber-400 to-yellow-600",
    icon: Crown,
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
    color: "from-cyan-400 to-blue-600",
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
    color: "from-yellow-400 to-orange-500",
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
    color: "from-gray-300 to-gray-500",
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
    color: "from-orange-600 to-amber-700",
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

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4 min-w-[80px] backdrop-blur-sm">
        <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function TierCard({ tier, isActive, isKorean }: { tier: AirdropTier; isActive: boolean; isKorean: boolean }) {
  const Icon = tier.icon;
  const benefits = isKorean ? tier.benefitsKo : tier.benefits;
  const name = isKorean ? tier.nameKo : tier.name;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${isActive ? "ring-2 ring-primary scale-105" : "hover-elevate"}`}>
      {isActive && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary text-primary-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            {isKorean ? "현재 등급" : "Your Tier"}
          </Badge>
        </div>
      )}
      <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${tier.color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>
              Min: {formatNumber(tier.minStake)} TBURN
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-primary">{formatNumber(tier.tokenReward)}</div>
            <div className="text-xs text-muted-foreground">TBURN {isKorean ? "보상" : "Reward"}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-primary">{tier.multiplier}x</div>
            <div className="text-xs text-muted-foreground">{isKorean ? "배수" : "Multiplier"}</div>
          </div>
        </div>
        {tier.nftReward && (
          <Badge variant="outline" className="w-full justify-center gap-1 py-1">
            <Image className="w-3 h-3" />
            {isKorean ? "NFT 포함" : "Includes NFT"}
          </Badge>
        )}
        <Separator />
        <ul className="space-y-1">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({ entry, isUser }: { entry: LeaderboardEntry; isUser: boolean }) {
  const getRankIcon = () => {
    if (entry.rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (entry.rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (entry.rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground font-medium">#{entry.rank}</span>;
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isUser ? "bg-primary/10 border border-primary/30" : "bg-muted/30"}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 flex justify-center">{getRankIcon()}</div>
        <div>
          <div className="font-medium flex items-center gap-2">
            {entry.displayName || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
            {isUser && <Badge variant="outline" className="text-xs">You</Badge>}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatNumber(parseFloat(entry.stakedAmount))} TBURN staked
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-primary">{formatNumber(entry.score)}</div>
        <div className="text-xs text-muted-foreground">{entry.referrals} referrals</div>
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
    totalParticipants: 28547,
    totalStaked: "125000000",
    totalAirdropClaimed: "15000000",
    nftsMinted: 1247,
    referralCount: 8934,
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

  return (
    <div className="min-h-screen bg-background">
      <PhishingWarningBanner />
      
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">TBURN</span>
            </div>
            <Badge variant="outline" className="hidden sm:flex gap-1">
              <Rocket className="w-3 h-3" />
              {isKorean ? "메인넷 런칭" : "Mainnet Launch"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {isConnected ? (
              <Badge variant="secondary" className="gap-1">
                <Wallet className="w-3 h-3" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
            ) : (
              <Button size="sm" onClick={() => setShowWalletModal(true)} data-testid="button-connect-wallet">
                <Wallet className="w-4 h-4 mr-2" />
                {isKorean ? "지갑 연결" : "Connect"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
            <PartyPopper className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isKorean ? "TBURN 메인넷 정식 오픈" : "TBURN Mainnet Official Launch"}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent">
            {isKorean ? "Genesis 런칭 이벤트" : "Genesis Launch Event"}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {isKorean 
              ? "TBURN 메인넷의 역사적인 순간에 함께하세요. 에어드랍, Genesis NFT, 그리고 특별 보상이 기다리고 있습니다."
              : "Join us for the historic launch of TBURN Mainnet. Airdrops, Genesis NFTs, and exclusive rewards await."}
          </p>

          {!countdown.isLaunched ? (
            <div className="flex justify-center gap-4 mb-8" data-testid="countdown-timer">
              <CountdownBox value={countdown.days} label={isKorean ? "일" : "Days"} />
              <CountdownBox value={countdown.hours} label={isKorean ? "시간" : "Hours"} />
              <CountdownBox value={countdown.minutes} label={isKorean ? "분" : "Min"} />
              <CountdownBox value={countdown.seconds} label={isKorean ? "초" : "Sec"} />
            </div>
          ) : (
            <div className="flex justify-center mb-8">
              <Badge className="text-lg py-2 px-6 bg-green-500 hover:bg-green-600 gap-2">
                <Zap className="w-5 h-5" />
                {isKorean ? "메인넷 라이브!" : "MAINNET IS LIVE!"}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto" data-testid="launch-stats">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="pt-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{formatNumber(stats.totalParticipants)}</div>
                <div className="text-xs text-muted-foreground">{isKorean ? "참여자" : "Participants"}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-transparent">
              <CardContent className="pt-4 text-center">
                <Coins className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{formatNumber(parseFloat(stats.totalStaked) / 1e6)}M</div>
                <div className="text-xs text-muted-foreground">{isKorean ? "스테이킹" : "Staked"}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent">
              <CardContent className="pt-4 text-center">
                <Gift className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{formatNumber(parseFloat(stats.totalAirdropClaimed) / 1e6)}M</div>
                <div className="text-xs text-muted-foreground">{isKorean ? "에어드랍" : "Airdrop"}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="pt-4 text-center">
                <Image className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{formatNumber(stats.nftsMinted)}</div>
                <div className="text-xs text-muted-foreground">{isKorean ? "NFT 민팅" : "NFTs Minted"}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardContent className="pt-4 text-center">
                <Share2 className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{formatNumber(stats.referralCount)}</div>
                <div className="text-xs text-muted-foreground">{isKorean ? "레퍼럴" : "Referrals"}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent">
              <CardContent className="pt-4 text-center">
                <Globe className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
                <div className="text-2xl font-bold">{stats.countriesRepresented}</div>
                <div className="text-xs text-muted-foreground">{isKorean ? "국가" : "Countries"}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Rocket className="w-4 h-4 mr-2" />
              {isKorean ? "개요" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="rewards" data-testid="tab-rewards">
              <Gift className="w-4 h-4 mr-2" />
              {isKorean ? "보상" : "Rewards"}
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              <CheckCircle className="w-4 h-4 mr-2" />
              {isKorean ? "태스크" : "Tasks"}
            </TabsTrigger>
            <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              {isKorean ? "순위" : "Ranking"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    {isKorean ? "에어드랍 티어 시스템" : "Airdrop Tier System"}
                  </CardTitle>
                  <CardDescription>
                    {isKorean 
                      ? "스테이킹 금액에 따라 티어가 결정되며, 높은 티어일수록 더 많은 보상을 받습니다."
                      : "Your tier is determined by your staking amount. Higher tiers receive more rewards."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-4">
                    {AIRDROP_TIERS.map((tier) => (
                      <TierCard
                        key={tier.id}
                        tier={tier}
                        isActive={userTier?.id === tier.id}
                        isKorean={isKorean}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-primary" />
                      {isKorean ? "런칭 일정" : "Launch Schedule"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { date: "Dec 21, 00:00 UTC", event: isKorean ? "메인넷 Genesis 블록" : "Mainnet Genesis Block", status: "upcoming" },
                      { date: "Dec 21, 00:01 UTC", event: isKorean ? "에어드랍 클레임 오픈" : "Airdrop Claims Open", status: "upcoming" },
                      { date: "Dec 21, 00:05 UTC", event: isKorean ? "Genesis NFT 민팅 시작" : "Genesis NFT Minting Starts", status: "upcoming" },
                      { date: "Dec 21 - Dec 28", event: isKorean ? "얼리버드 보너스 기간" : "Early Bird Bonus Period", status: "upcoming" },
                      { date: "Dec 28", event: isKorean ? "첫 거버넌스 제안" : "First Governance Proposal", status: "upcoming" },
                      { date: "Jan 1, 2025", event: isKorean ? "스테이킹 보상 시작" : "Staking Rewards Begin", status: "upcoming" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        <div className="flex-1">
                          <div className="font-medium">{item.event}</div>
                          <div className="text-sm text-muted-foreground">{item.date}</div>
                        </div>
                        <Badge variant="outline">{isKorean ? "예정" : "Upcoming"}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-primary" />
                      {isKorean ? "Genesis NFT 컬렉션" : "Genesis NFT Collection"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 via-purple-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <div className="text-center">
                        <Hexagon className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <div className="text-lg font-bold">{isKorean ? "Genesis 파운더 NFT" : "Genesis Founder NFT"}</div>
                        <div className="text-sm text-muted-foreground">{isKorean ? "100개 한정" : "Limited to 100"}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="text-xl font-bold text-primary">3</div>
                        <div className="text-xs text-muted-foreground">{isKorean ? "등급" : "Tiers"}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="text-xl font-bold text-primary">1,000</div>
                        <div className="text-xs text-muted-foreground">{isKorean ? "총 발행" : "Total"}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="text-xl font-bold text-primary">{stats.nftsMinted}</div>
                        <div className="text-xs text-muted-foreground">{isKorean ? "민팅됨" : "Minted"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="mt-8">
            {!isConnected ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">
                    {isKorean ? "지갑을 연결하세요" : "Connect Your Wallet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isKorean 
                      ? "보상을 확인하고 클레임하려면 지갑을 연결해주세요."
                      : "Connect your wallet to check and claim your rewards."}
                  </p>
                  <Button onClick={() => setShowWalletModal(true)} data-testid="button-connect-rewards">
                    <Wallet className="w-4 h-4 mr-2" />
                    {isKorean ? "지갑 연결" : "Connect Wallet"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" />
                      {isKorean ? "에어드랍 보상" : "Airdrop Rewards"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-xl">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {userData?.airdropAmount || "10,000"} TBURN
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isKorean ? "총 에어드랍 보상" : "Total Airdrop Reward"}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{isKorean ? "기본 보상" : "Base Reward"}</span>
                        <span>5,000 TBURN</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{isKorean ? "티어 보너스" : "Tier Bonus"}</span>
                        <span>+{userTier?.multiplier || 1}x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{isKorean ? "레퍼럴 보너스" : "Referral Bonus"}</span>
                        <span>{userData?.referralBonus || "0"} TBURN</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{isKorean ? "총계" : "Total"}</span>
                        <span className="text-primary">{userData?.airdropAmount || "10,000"} TBURN</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      disabled={userData?.airdropClaimed || claimAirdropMutation.isPending || !countdown.isLaunched}
                      onClick={() => claimAirdropMutation.mutate()}
                      data-testid="button-claim-airdrop"
                    >
                      {claimAirdropMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : userData?.airdropClaimed ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <Gift className="w-4 h-4 mr-2" />
                      )}
                      {userData?.airdropClaimed 
                        ? (isKorean ? "클레임 완료" : "Claimed") 
                        : !countdown.isLaunched
                          ? (isKorean ? "런칭 대기중" : "Waiting for Launch")
                          : (isKorean ? "에어드랍 클레임" : "Claim Airdrop")}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-primary" />
                      {isKorean ? "Genesis NFT" : "Genesis NFT"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="aspect-square max-w-[200px] mx-auto bg-gradient-to-br from-primary/20 via-purple-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <div className="text-center">
                        {userTier?.icon && <userTier.icon className="w-12 h-12 mx-auto mb-2 text-primary" />}
                        <div className="text-sm font-bold">{userTier?.name || "Bronze Member"}</div>
                      </div>
                    </div>

                    {userTier?.nftReward ? (
                      <Button 
                        className="w-full" 
                        disabled={userData?.nftClaimed || claimNftMutation.isPending || !countdown.isLaunched}
                        onClick={() => claimNftMutation.mutate()}
                        data-testid="button-mint-nft"
                      >
                        {claimNftMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : userData?.nftClaimed ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Image className="w-4 h-4 mr-2" />
                        )}
                        {userData?.nftClaimed 
                          ? (isKorean ? "민팅 완료" : "Minted") 
                          : !countdown.isLaunched
                            ? (isKorean ? "런칭 대기중" : "Waiting for Launch")
                            : (isKorean ? "NFT 민팅" : "Mint NFT")}
                      </Button>
                    ) : (
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {isKorean 
                            ? "Gold 티어 이상에서 NFT를 받을 수 있습니다."
                            : "NFT available for Gold tier and above."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-primary" />
                      {isKorean ? "레퍼럴 프로그램" : "Referral Program"}
                    </CardTitle>
                    <CardDescription>
                      {isKorean
                        ? "친구를 초대하고 추가 보상을 받으세요. 초대받은 친구가 스테이킹하면 10%의 보너스를 받습니다."
                        : "Invite friends and earn extra rewards. Get 10% bonus when your referrals stake."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex gap-2">
                          <Input 
                            value={`https://tburn.network/launch?ref=${userData?.referralCode || "YOURCODE"}`}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={copyReferralCode} data-testid="button-copy-referral">
                            {copiedReferral ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Twitter className="w-4 h-4 mr-2" />
                            {isKorean ? "트위터 공유" : "Share on X"}
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <SiTelegram className="w-4 h-4 mr-2" />
                            {isKorean ? "텔레그램 공유" : "Share on Telegram"}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-primary">{userData?.referralCount || 0}</div>
                          <div className="text-xs text-muted-foreground">{isKorean ? "초대" : "Invites"}</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-500">{userData?.referralBonus || "0"}</div>
                          <div className="text-xs text-muted-foreground">{isKorean ? "보너스" : "Bonus"}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  {isKorean ? "태스크 & 퀘스트" : "Tasks & Quests"}
                </CardTitle>
                <CardDescription>
                  {isKorean
                    ? "태스크를 완료하고 추가 TBURN 토큰을 획득하세요."
                    : "Complete tasks to earn additional TBURN tokens."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {SOCIAL_TASKS.map((task) => {
                    const isCompleted = userData?.tasks?.find(t => t.id === task.id)?.completed || false;
                    const Icon = task.icon;
                    return (
                      <div 
                        key={task.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${isCompleted ? "bg-green-500/10 border-green-500/30" : "bg-muted/30"}`}
                        data-testid={`task-${task.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isCompleted ? "bg-green-500/20" : "bg-muted"}`}>
                            <Icon className={`w-5 h-5 ${isCompleted ? "text-green-500" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="font-medium">{isKorean ? task.nameKo : task.name}</div>
                            <div className="text-sm text-muted-foreground">+{task.reward}</div>
                          </div>
                        </div>
                        {isCompleted ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {isKorean ? "완료" : "Done"}
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" data-testid={`button-task-${task.id}`}>
                            {isKorean ? "시작" : "Start"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-bold">{isKorean ? "총 태스크 보상" : "Total Task Rewards"}</div>
                      <div className="text-sm text-muted-foreground">
                        {userData?.tasks?.filter(t => t.completed).length || 0} / {SOCIAL_TASKS.length} {isKorean ? "완료" : "completed"}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {SOCIAL_TASKS.reduce((sum, t) => {
                      const isCompleted = userData?.tasks?.find(ut => ut.id === t.id)?.completed;
                      return isCompleted ? sum + parseInt(t.reward.replace(/[^0-9]/g, "")) : sum;
                    }, 0)} TBURN
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {isKorean ? "런칭 리더보드" : "Launch Leaderboard"}
                </CardTitle>
                <CardDescription>
                  {isKorean
                    ? "스테이킹과 레퍼럴을 통해 순위를 올리세요. 상위 참여자에게 특별 보상이 제공됩니다."
                    : "Climb the ranks through staking and referrals. Top participants receive special rewards."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {leaderboardData.map((entry) => (
                      <LeaderboardRow
                        key={entry.rank}
                        entry={entry}
                        isUser={entry.address === address}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <section className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-orange-500/10 border-primary/30">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-4">
                {isKorean ? "지금 참여하고 보상을 받으세요!" : "Join Now and Get Rewarded!"}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {isKorean
                  ? "TBURN 메인넷 런칭에 참여하여 에어드랍, NFT, 그리고 다양한 보상을 받으세요."
                  : "Participate in the TBURN mainnet launch and receive airdrops, NFTs, and various rewards."}
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={() => setShowWalletModal(true)} data-testid="button-join-launch">
                  <Rocket className="w-5 h-5 mr-2" />
                  {isKorean ? "런칭 이벤트 참여" : "Join Launch Event"}
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/app/staking" data-testid="link-staking">
                    <Coins className="w-5 h-5 mr-2" />
                    {isKorean ? "스테이킹 하기" : "Start Staking"}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <WalletConnectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </div>
  );
}
