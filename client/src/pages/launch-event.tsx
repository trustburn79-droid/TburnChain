import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatNumber } from "@/lib/formatters";
import { PhishingWarningBanner } from "@/components/phishing-warning-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Wallet, Rocket, Layers, Sun, Moon, CheckCircle, Copy, Loader2,
  Gift, Users, Globe, Coins, Image, Share2, Twitter, ArrowRight,
  Crown, Award, Star, Sparkles, Trophy, Hexagon
} from "lucide-react";
import { SiDiscord, SiTelegram } from "react-icons/si";

import "./launch-event.css";

const LAUNCH_DATE = new Date("2024-12-21T00:00:00Z");

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

const SOCIAL_TASKS = [
  { id: "twitter_follow", name: "Follow on X/Twitter", nameKo: "X/Twitter 팔로우", reward: "100 TBURN", icon: Twitter },
  { id: "discord_join", name: "Join Discord", nameKo: "Discord 가입", reward: "100 TBURN", icon: SiDiscord },
  { id: "telegram_join", name: "Join Telegram", nameKo: "Telegram 가입", reward: "100 TBURN", icon: SiTelegram },
  { id: "share_launch", name: "Share Launch Post", nameKo: "런칭 포스트 공유", reward: "200 TBURN", icon: Share2 },
  { id: "first_stake", name: "First Stake", nameKo: "첫 스테이킹", reward: "500 TBURN", icon: Coins },
  { id: "bridge_tx", name: "Bridge Transaction", nameKo: "브릿지 트랜잭션", reward: "300 TBURN", icon: ArrowRight }
];

function useCountdown(targetDate: Date) {
  const [isLaunched, setIsLaunched] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsLaunched(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return { isLaunched, ...timeLeft };
}

export default function LaunchEventPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, address } = useWeb3();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDark, setIsDark] = useState(true);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const countdown = useCountdown(LAUNCH_DATE);

  const { data: launchStats } = useQuery<LaunchStats>({
    queryKey: ["/api/launch-event/stats"],
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const { data: userData } = useQuery<UserLaunchData>({
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
      toast({ title: "에어드랍 클레임 성공!", description: "TBURN 토큰이 지갑으로 전송되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/launch-event/user"] });
    },
    onError: () => {
      toast({ title: "클레임 실패", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
    }
  });

  const claimNftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/launch-event/mint-nft", { address });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "NFT 민팅 성공!", description: "Genesis NFT가 지갑으로 전송되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/launch-event/user"] });
    },
    onError: () => {
      toast({ title: "민팅 실패", variant: "destructive" });
    }
  });

  const copyReferralCode = () => {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(`https://tburn.network/launch?ref=${userData.referralCode}`);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
      toast({ title: "복사됨!", description: "레퍼럴 링크가 클립보드에 복사되었습니다." });
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const stats = launchStats || {
    totalParticipants: 28549,
    totalStaked: "125000000",
    totalAirdropClaimed: "15000000",
    nftsMinted: 1248,
    referralCount: 8936,
    countriesRepresented: 89
  };

  const leaderboardData = leaderboard || [
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

  const userTier = userData?.tier;
  const canClaimNft = userTier === "genesis" || userTier === "diamond" || userTier === "gold";

  return (
    <div className={`launch-event-page ${isDark ? 'dark' : ''}`}>
      <PhishingWarningBanner />
      
      <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#F8FAFC] text-slate-800 dark:bg-[#0B1120] dark:text-[#E2E8F0]">
        
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 flex flex-col z-20 transition-all duration-300 border-r bg-white border-slate-200 dark:bg-[#0F172A] dark:border-gray-800">
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">T</div>
            <div className="hidden lg:block ml-3">
              <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">TBURN <span className="text-[#F97316]">Event</span></h1>
            </div>
          </div>
          
          <nav className="flex-1 py-6 space-y-2 px-3">
            <Link href="/wallet-dashboard">
              <a className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                <Wallet className="w-6 h-6" />
                <span className="hidden lg:block font-medium">Wallet</span>
              </a>
            </Link>
            <a className="flex items-center gap-4 px-3 py-3 rounded-xl bg-orange-50 text-[#F97316] border-l-4 border-[#F97316] dark:bg-[#151E32] dark:text-white dark:border-[#F97316] shadow-sm transition-colors">
              <Rocket className="w-6 h-6" />
              <span className="hidden lg:block font-medium">Genesis Launch</span>
            </a>
            <Link href="/staking">
              <a className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                <Layers className="w-6 h-6" />
                <span className="hidden lg:block font-medium">Staking</span>
              </a>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
          
          {/* Header */}
          <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 rounded text-xs font-bold animate-pulse">● LIVE EVENT</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-yellow-400"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {isConnected ? (
                <Badge className="bg-[#3B82F6] text-white">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Badge>
              ) : (
                <button 
                  onClick={() => setShowWalletModal(true)}
                  className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                  data-testid="button-connect-wallet"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth z-0">
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-500/10 to-orange-500/10 border-b border-slate-200 dark:border-gray-800 p-6 lg:p-12">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                      TBURN 메인넷 <span className="text-[#F97316]">Genesis 런칭</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 dark:text-gray-300 max-w-2xl">
                      TBURN 메인넷의 역사적인 순간에 함께하세요. 에어드랍, Genesis NFT, 그리고 특별 보상이 기다리고 있습니다.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-bold tracking-widest uppercase">Mainnet Status</span>
                    {countdown.isLaunched ? (
                      <div className="text-xl md:text-2xl font-bold text-[#10B981] flex items-center justify-end gap-2">
                        <CheckCircle className="w-5 h-5" /> MAINNET LIVE
                      </div>
                    ) : (
                      <div className="text-xl md:text-2xl font-bold text-[#F97316] flex items-center justify-end gap-2" data-testid="countdown-timer">
                        {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8" data-testid="launch-stats">
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">참여자</p>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{formatNumber(stats.totalParticipants)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">스테이킹</p>
                    <p className="text-xl font-bold font-mono text-[#3B82F6]">{formatNumber(parseFloat(stats.totalStaked) / 1e6)}M</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">에어드랍 할당</p>
                    <p className="text-xl font-bold font-mono text-[#F97316]">{formatNumber(parseFloat(stats.totalAirdropClaimed) / 1e6)}M</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">NFT 민팅</p>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{formatNumber(stats.nftsMinted)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">국가</p>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{stats.countriesRepresented}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800">
              <div className="max-w-6xl mx-auto flex">
                {[
                  { id: "overview", label: "개요 (Overview)" },
                  { id: "rewards", label: "보상 (Rewards)" },
                  { id: "tasks", label: "태스크 (Tasks)" },
                  { id: "leaderboard", label: "순위 (Leaderboard)" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn flex-1 py-4 text-sm font-bold transition-colors ${
                      activeTab === tab.id ? 'active' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    data-testid={`tab-${tab.id}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto p-4 lg:p-8 pb-48">
              
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-12">
                  {/* Tier System */}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">에어드랍 티어 시스템</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">스테이킹 금액에 따라 티어가 결정되며, 높은 티어일수록 더 많은 보상을 받습니다.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {/* Genesis Tier */}
                      <div className={`tier-genesis glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-orange-500/10 to-transparent ${userTier === 'genesis' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-genesis">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">LEGENDARY</div>
                        {userTier === 'genesis' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">현재 등급</Badge>}
                        <h3 className="text-lg font-bold text-[#F97316] mb-1">Genesis 창립자</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">100,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">TBURN 보상</p>
                            <p className="text-lg font-bold font-mono text-white">50,000+</p>
                          </div>
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">배수 (Multiplier)</p>
                            <p className="text-lg font-bold font-mono text-[#F97316]">5x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#F97316]" /> <span className="text-white">독점 Genesis NFT</span></p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 평생 거버넌스 프리미엄</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 프라이빗 디스코드</p>
                        </div>
                      </div>

                      {/* Diamond Tier */}
                      <div className={`tier-diamond glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-cyan-500/10 to-transparent ${userTier === 'diamond' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-diamond">
                        {userTier === 'diamond' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">현재 등급</Badge>}
                        <h3 className="text-lg font-bold text-cyan-400 mb-1">Diamond 파이오니어</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">50,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">TBURN 보상</p>
                            <p className="text-lg font-bold font-mono text-white">25,000+</p>
                          </div>
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">배수 (Multiplier)</p>
                            <p className="text-lg font-bold font-mono text-cyan-400">3x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-cyan-400" /> <span className="text-white">Diamond NFT</span></p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 우선 지원 액세스</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 베타 테스트 특권</p>
                        </div>
                      </div>

                      {/* Gold Tier */}
                      <div className={`tier-gold glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-yellow-500/10 to-transparent ${userTier === 'gold' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-gold">
                        {userTier === 'gold' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">현재 등급</Badge>}
                        <h3 className="text-lg font-bold text-[#FFD700] mb-1">Gold 검증자</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">10,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">TBURN 보상</p>
                            <p className="text-lg font-bold font-mono text-white">10,000+</p>
                          </div>
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">배수 (Multiplier)</p>
                            <p className="text-lg font-bold font-mono text-[#FFD700]">2x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#FFD700]" /> <span className="text-white">Gold NFT</span></p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 검증자 대시보드</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 월간 AMA 초대</p>
                        </div>
                      </div>

                      {/* Silver Tier */}
                      <div className={`tier-silver glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-gray-400/10 to-transparent ${userTier === 'silver' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-silver">
                        {userTier === 'silver' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">현재 등급</Badge>}
                        <h3 className="text-lg font-bold text-[#C0C0C0] mb-1">Silver 서포터</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">1,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">TBURN 보상</p>
                            <p className="text-lg font-bold font-mono text-white">2,500+</p>
                          </div>
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">배수 (Multiplier)</p>
                            <p className="text-lg font-bold font-mono text-[#C0C0C0]">1.5x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 커뮤니티 배지</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 이벤트 우선 액세스</p>
                        </div>
                      </div>

                      {/* Bronze Tier */}
                      <div className={`tier-bronze glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-amber-700/10 to-transparent ${userTier === 'bronze' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-bronze">
                        {userTier === 'bronze' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">현재 등급</Badge>}
                        <h3 className="text-lg font-bold text-[#CD7F32] mb-1">Bronze 멤버</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">100</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">TBURN 보상</p>
                            <p className="text-lg font-bold font-mono text-white">500+</p>
                          </div>
                          <div className="bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-400">배수 (Multiplier)</p>
                            <p className="text-lg font-bold font-mono text-[#CD7F32]">1x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 기본 에어드랍 보상</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 커뮤니티 액세스</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Launch Schedule */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 런칭 일정 */}
                    <div className="glass-panel p-6 rounded-2xl">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="text-lg">📅</span> 런칭 일정
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-white">메인넷 Genesis 블록</p>
                            <p className="text-sm text-slate-400">Dec 21, 00:00 UTC</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-[#3B82F6] mt-1.5 flex-shrink-0 animate-pulse" />
                          <div>
                            <p className="font-bold text-white">에어드랍 클레임 오픈</p>
                            <p className="text-sm text-[#3B82F6]">Dec 21, 00:01 UTC (예정)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-slate-400">Genesis NFT 민팅 시작</p>
                            <p className="text-sm text-slate-500">Dec 21, 00:05 UTC</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-slate-400">스테이킹 보상 시작</p>
                            <p className="text-sm text-slate-500">Dec 21, 00:10 UTC</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Genesis NFT Collection */}
                    <div className="glass-panel p-6 rounded-2xl">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="text-lg">🎨</span> Genesis NFT 컬렉션
                      </h2>
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* NFT Preview */}
                        <div className="w-full md:w-40 h-40 rounded-2xl bg-gradient-to-br from-[#3B82F6] via-[#06B6D4] to-[#F97316] p-1 flex-shrink-0">
                          <div className="w-full h-full rounded-xl bg-[#0F172A] flex items-center justify-center">
                            <Hexagon className="w-16 h-16 text-white/40" />
                          </div>
                        </div>
                        {/* NFT Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">Genesis 파운더 NFT</h3>
                          <p className="text-sm text-slate-400 mt-1">100개 한정 발행. 최고의 권위와 혜택.</p>
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="bg-black/30 rounded-lg p-2 text-center">
                              <p className="text-[10px] text-slate-500">등급</p>
                              <p className="text-sm font-bold text-white">3</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 text-center">
                              <p className="text-[10px] text-slate-500">총 발행</p>
                              <p className="text-sm font-bold text-white">1,000</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 text-center">
                              <p className="text-[10px] text-slate-500">민팅량</p>
                              <p className="text-sm font-bold text-[#3B82F6]">{formatNumber(stats.nftsMinted)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-700/50">
                        ※ 제네시스 및 다이아몬드 티어 스테이커에게 모든 민팅 권한이 부여됩니다
                      </p>
                    </div>
                  </div>

                  {/* Referral Program */}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">레퍼럴 프로그램</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">친구를 초대하고 추가 보상을 받으세요. 추천인당 200 TBURN 보너스!</p>
                    
                    <div className="glass-panel p-6 rounded-2xl">
                      {isConnected && userData ? (
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">내 레퍼럴 코드</p>
                            <div className="flex items-center gap-2">
                              <code className="text-lg font-mono text-white flex-1">{userData.referralCode}</code>
                              <button 
                                onClick={copyReferralCode}
                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                              >
                                {copiedReferral ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 text-center">
                              <p className="text-xs text-slate-500">추천 수</p>
                              <p className="text-2xl font-bold font-mono text-[#3B82F6]">{userData.referralCount}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 text-center">
                              <p className="text-xs text-slate-500">보너스</p>
                              <p className="text-2xl font-bold font-mono text-[#F97316]">{userData.referralBonus}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400 mb-4">레퍼럴 프로그램에 참여하려면 지갑을 연결하세요.</p>
                          <button 
                            onClick={() => setShowWalletModal(true)}
                            className="bg-[#3B82F6] hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            지갑 연결
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Rewards Tab */}
              {activeTab === "rewards" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">내 보상</h2>
                    
                    {isConnected && userData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-2xl">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <Coins className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">에어드랍 보상</p>
                              <p className="text-2xl font-bold font-mono text-white">{userData.airdropAmount} TBURN</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => claimAirdropMutation.mutate()}
                            disabled={userData.airdropClaimed || claimAirdropMutation.isPending}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {claimAirdropMutation.isPending ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : userData.airdropClaimed ? (
                              <><CheckCircle className="w-5 h-5" /> 클레임 완료</>
                            ) : (
                              <><Gift className="w-5 h-5" /> 에어드랍 클레임</>
                            )}
                          </button>
                        </div>

                        {canClaimNft && (
                          <div className="glass-panel p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Image className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-400">Genesis NFT</p>
                                <p className="text-lg font-bold text-white">{userTier?.charAt(0).toUpperCase()}{userTier?.slice(1)} NFT</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => claimNftMutation.mutate()}
                              disabled={userData.nftClaimed || claimNftMutation.isPending}
                              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {claimNftMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : userData.nftClaimed ? (
                                <><CheckCircle className="w-5 h-5" /> 민팅 완료</>
                              ) : (
                                <><Sparkles className="w-5 h-5" /> NFT 민팅</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="glass-panel p-12 rounded-2xl text-center">
                        <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">지갑을 연결하세요</h3>
                        <p className="text-slate-400 mb-6">보상을 확인하고 클레임하려면 지갑을 연결하세요.</p>
                        <button 
                          onClick={() => setShowWalletModal(true)}
                          className="bg-[#3B82F6] hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                        >
                          지갑 연결
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === "tasks" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">태스크 & 퀘스트</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">태스크를 완료하고 추가 보상을 획득하세요!</p>

                    <div className="space-y-3">
                      {SOCIAL_TASKS.map((task) => {
                        const Icon = task.icon;
                        const isCompleted = userData?.tasks?.find(t => t.id === task.id)?.completed || false;
                        
                        return (
                          <div key={task.id} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? "bg-emerald-500/20" : "bg-slate-700"}`}>
                                <Icon className={`w-5 h-5 ${isCompleted ? "text-emerald-500" : "text-slate-400"}`} />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{task.nameKo}</p>
                                <p className="text-sm text-slate-500">보상: <span className="text-[#F97316] font-mono">{task.reward}</span></p>
                              </div>
                            </div>
                            <button 
                              disabled={isCompleted}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                isCompleted 
                                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                                  : "bg-[#3B82F6] hover:bg-blue-600 text-white"
                              }`}
                            >
                              {isCompleted ? (
                                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 완료</span>
                              ) : (
                                <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4" /> 시작</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Tab */}
              {activeTab === "leaderboard" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">런칭 리더보드</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">스테이킹 금액과 레퍼럴을 기반으로 한 상위 참여자 순위입니다.</p>

                    <div className="space-y-3">
                      {leaderboardData.map((entry, idx) => {
                        const rank = idx + 1;
                        const isUser = address === entry.address;
                        
                        const getTierBadgeClass = () => {
                          switch (entry.tier) {
                            case "genesis": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
                            case "diamond": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
                            case "gold": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
                            case "silver": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
                            default: return "bg-amber-700/20 text-amber-600 border-amber-700/30";
                          }
                        };
                        
                        return (
                          <div 
                            key={entry.address}
                            className={`glass-panel p-4 rounded-xl flex items-center justify-between ${isUser ? "ring-2 ring-blue-500" : ""}`}
                            data-testid={`leaderboard-row-${rank}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 flex justify-center">
                                {rank === 1 ? <Crown className="w-5 h-5 text-yellow-500" /> :
                                 rank === 2 ? <Award className="w-5 h-5 text-gray-400" /> :
                                 rank === 3 ? <Award className="w-5 h-5 text-amber-600" /> :
                                 <span className="text-slate-400 font-mono text-sm">{rank}</span>}
                              </div>
                              <div>
                                <div className="font-medium text-white flex items-center gap-2">
                                  {entry.displayName}
                                  {isUser && <Badge className="bg-blue-500 text-white text-[10px]">You</Badge>}
                                </div>
                                <div className="text-xs text-slate-400">
                                  <span className="font-mono">{formatNumber(parseFloat(entry.stakedAmount))}</span> TBURN
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={`text-[10px] ${getTierBadgeClass()}`}>
                                {entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1)}
                              </Badge>
                              <div className="text-right">
                                <div className="font-bold font-mono text-[#3B82F6]">{formatNumber(entry.score)}</div>
                                <div className="text-[10px] text-slate-500">{entry.referrals} referrals</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-br from-blue-500/10 to-orange-500/10 border-t border-slate-200 dark:border-gray-800 p-8">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">지금 바로 참여하세요!</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-xl mx-auto">
                  TBURN 메인넷 Genesis 런칭에 참여하고 독점 보상을 받으세요. 스테이킹을 시작하면 자동으로 이벤트에 참여됩니다.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/staking">
                    <button 
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
                      data-testid="button-join-launch"
                    >
                      런칭 이벤트 참여
                    </button>
                  </Link>
                  <Link href="/staking">
                    <button 
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105"
                      data-testid="link-staking"
                    >
                      스테이킹 하기
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <WalletConnectModal 
        open={showWalletModal} 
        onOpenChange={setShowWalletModal}
      />
    </div>
  );
}
