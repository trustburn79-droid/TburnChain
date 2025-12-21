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
  Crown, Award, Star, Sparkles, Trophy, Hexagon, Box,
  Home, ScanLine, User, Bug, Shield, HelpCircle, ImageIcon
} from "lucide-react";
import { SiDiscord, SiTelegram } from "react-icons/si";
import { LanguageSelector } from "@/components/LanguageSelector";

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
  const { t } = useTranslation();
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
            <Link href="/user?section=wallet">
              <a className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                <Wallet className="w-6 h-6" />
                <span className="hidden lg:block font-medium">Wallet</span>
              </a>
            </Link>
            <a className="flex items-center gap-4 px-3 py-3 rounded-xl bg-orange-50 text-[#F97316] border-l-4 border-[#F97316] dark:bg-[#151E32] dark:text-white dark:border-[#F97316] shadow-sm transition-colors">
              <Rocket className="w-6 h-6" />
              <span className="hidden lg:block font-medium">Genesis Launch</span>
            </a>
            <Link href="/user?section=stakingDashboard">
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
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-xs font-bold animate-pulse">● {t('launchEventPage.liveEvent', 'LIVE EVENT')}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {/* Navigation Icons */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="Home">
                    <Home className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/scan">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="Scan">
                    <ScanLine className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/user">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="User">
                    <User className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/bug-bounty">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="Bug Bounty">
                    <Bug className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/security-audit">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="Security Audit">
                    <Shield className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/token-generator">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="Token Generator">
                    <Hexagon className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/nft-marketplace">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="NFT Marketplace">
                    <ImageIcon className="w-4 h-4" />
                  </a>
                </Link>
                <Link href="/qna">
                  <a className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400" title="QnA">
                    <HelpCircle className="w-4 h-4" />
                  </a>
                </Link>
              </div>
              
              <div className="h-6 w-px bg-slate-200 dark:bg-gray-700 hidden md:block" />
              
              <LanguageSelector isDark={isDark} />
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
                  {t('launchEventPage.connectWallet', 'Connect Wallet')}
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
                      {t('launchEventPage.title', 'TBURN Mainnet Genesis Launch')}
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 dark:text-gray-300 max-w-2xl">
                      {t('launchEventPage.subtitle', 'Join the historic moment of TBURN Mainnet. Airdrops, Genesis NFTs, and special rewards await you.')}
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
                    <p className="text-xs text-slate-500">{t('launchEventPage.stats.participants', 'Participants')}</p>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{formatNumber(stats.totalParticipants)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">{t('launchEventPage.stats.totalStaked', 'Total Staked')}</p>
                    <p className="text-xl font-bold font-mono text-[#3B82F6]">{formatNumber(parseFloat(stats.totalStaked) / 1e6)}M</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">Airdrop</p>
                    <p className="text-xl font-bold font-mono text-[#F97316]">{formatNumber(parseFloat(stats.totalAirdropClaimed) / 1e6)}M</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">{t('launchEventPage.stats.nftsMinted', 'NFTs Minted')}</p>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{formatNumber(stats.nftsMinted)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500">{t('launchEventPage.stats.countries', 'Countries')}</p>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{stats.countriesRepresented}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800">
              <div className="max-w-6xl mx-auto flex">
                {[
                  { id: "overview", label: t('launchEventPage.tabs.overview', 'Overview') },
                  { id: "rewards", label: t('launchEventPage.tabs.rewards', 'Rewards') },
                  { id: "tasks", label: t('launchEventPage.tabs.tasks', 'Tasks') },
                  { id: "leaderboard", label: t('launchEventPage.tabs.leaderboard', 'Leaderboard') }
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('launchEventPage.tierSystem.title', 'Airdrop Tier System')}</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">{t('launchEventPage.tierSystem.description', 'Your tier is determined by your staking amount. Higher tiers receive more rewards.')}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {/* Genesis Tier */}
                      <div className={`tier-genesis glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-orange-500/10 to-transparent ${userTier === 'genesis' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-genesis">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">LEGENDARY</div>
                        {userTier === 'genesis' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">{t('launchEventPage.tierSystem.currentTier', 'Current Tier')}</Badge>}
                        <h3 className="text-lg font-bold text-[#F97316] mb-1">{t('launchEventPage.tierSystem.genesis.name', 'Genesis Founder')}</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">100,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.reward', 'TBURN Reward')}</p>
                            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">50,000+</p>
                          </div>
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.multiplier', 'Multiplier')}</p>
                            <p className="text-lg font-bold font-mono text-[#F97316]">5x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>✅ <span className="text-slate-900 dark:text-white font-medium">{t('launchEventPage.tierSystem.genesis.perk1', 'Exclusive Genesis NFT')}</span></p>
                          <p>✅ {t('launchEventPage.tierSystem.genesis.perk2', 'Lifetime Governance Premium')}</p>
                          <p>✅ {t('launchEventPage.tierSystem.genesis.perk3', 'Private Discord')}</p>
                        </div>
                      </div>

                      {/* Diamond Tier */}
                      <div className={`tier-diamond glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-cyan-500/10 to-transparent ${userTier === 'diamond' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-diamond">
                        {userTier === 'diamond' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">{t('launchEventPage.tierSystem.currentTier', 'Current Tier')}</Badge>}
                        <h3 className="text-lg font-bold text-cyan-500 dark:text-cyan-400 mb-1">{t('launchEventPage.tierSystem.diamond.name', 'Diamond Pioneer')}</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">50,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.reward', 'TBURN Reward')}</p>
                            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">25,000+</p>
                          </div>
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.multiplier', 'Multiplier')}</p>
                            <p className="text-lg font-bold font-mono text-cyan-500 dark:text-cyan-400">3x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>✅ {t('launchEventPage.tierSystem.diamond.perk1', 'Diamond Pioneer NFT')}</p>
                          <p>✅ {t('launchEventPage.tierSystem.diamond.perk2', 'Priority Support Access')}</p>
                        </div>
                      </div>

                      {/* Gold Tier */}
                      <div className={`tier-gold glass-panel p-5 rounded-2xl relative bg-gradient-to-b from-yellow-500/10 to-transparent ${userTier === 'gold' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-gold">
                        {userTier === 'gold' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">{t('launchEventPage.tierSystem.currentTier', 'Current Tier')}</Badge>}
                        <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-500 mb-1">{t('launchEventPage.tierSystem.gold.name', 'Gold Validator')}</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">10,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.reward', 'TBURN Reward')}</p>
                            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">10,000+</p>
                          </div>
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.multiplier', 'Multiplier')}</p>
                            <p className="text-lg font-bold font-mono text-yellow-600 dark:text-yellow-500">2x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>✅ {t('launchEventPage.tierSystem.gold.perk1', 'Gold Validator NFT')}</p>
                          <p>✅ {t('launchEventPage.tierSystem.gold.perk2', 'Monthly AMA Invitation')}</p>
                        </div>
                      </div>

                      {/* Silver Tier */}
                      <div className={`tier-silver glass-panel p-5 rounded-2xl relative ${userTier === 'silver' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-silver">
                        {userTier === 'silver' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">{t('launchEventPage.tierSystem.currentTier', 'Current Tier')}</Badge>}
                        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">{t('launchEventPage.tierSystem.silver.name', 'Silver Supporter')}</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">1,000</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.reward', 'TBURN Reward')}</p>
                            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">2,500+</p>
                          </div>
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.multiplier', 'Multiplier')}</p>
                            <p className="text-lg font-bold font-mono text-gray-500 dark:text-gray-400">1.5x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>✅ {t('launchEventPage.tierSystem.silver.perk1', 'Community Badge')}</p>
                          <p>✅ {t('launchEventPage.tierSystem.silver.perk2', 'Event Priority Access')}</p>
                        </div>
                      </div>

                      {/* Bronze Tier */}
                      <div className={`tier-bronze glass-panel p-5 rounded-2xl relative ${userTier === 'bronze' ? 'ring-2 ring-blue-500' : ''}`} data-testid="tier-card-bronze">
                        {userTier === 'bronze' && <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[10px]">{t('launchEventPage.tierSystem.currentTier', 'Current Tier')}</Badge>}
                        <h3 className="text-lg font-bold text-orange-700 mb-1">{t('launchEventPage.tierSystem.bronze.name', 'Bronze Member')}</h3>
                        <p className="text-xs text-slate-500 mb-4">Min: <span className="font-mono font-bold text-slate-900 dark:text-white">100</span> TBURN</p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.reward', 'TBURN Reward')}</p>
                            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">500+</p>
                          </div>
                          <div className="bg-slate-200/80 dark:bg-black/20 rounded p-2 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('launchEventPage.tierSystem.multiplier', 'Multiplier')}</p>
                            <p className="text-lg font-bold font-mono text-orange-700">1x</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>✅ {t('launchEventPage.tierSystem.bronze.perk1', 'Launch Participant Badge')}</p>
                          <p>✅ {t('launchEventPage.tierSystem.bronze.perk2', 'Community Access')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Launch Schedule & NFT Collection - 3 Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Launch Schedule - 1 Column */}
                    <div className="glass-panel p-6 rounded-2xl lg:col-span-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">📅 {t('launchEventPage.schedule.title', 'Launch Schedule')}</h3>
                      <div className="space-y-0 relative border-l border-slate-300 dark:border-slate-700 ml-3">
                        <div className="ml-6 mb-6 relative">
                          <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#10B981] ring-4 ring-slate-100 dark:ring-[#0B1120]"></span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{t('launchEventPage.schedule.mainnetGenesis', 'Mainnet Genesis Block')}</p>
                          <p className="text-xs text-slate-500">Dec 21, 00:00 UTC</p>
                        </div>
                        <div className="ml-6 mb-6 relative">
                          <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#3B82F6] ring-4 ring-slate-100 dark:ring-[#0B1120] animate-pulse"></span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{t('launchEventPage.schedule.airdropClaim', 'Airdrop Claim Open')}</p>
                          <p className="text-xs text-[#3B82F6] font-bold">Dec 21, 00:01 UTC ({t('launchEventPage.schedule.scheduled', 'Scheduled')})</p>
                        </div>
                        <div className="ml-6 mb-6 relative">
                          <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-700 ring-4 ring-slate-100 dark:ring-[#0B1120]"></span>
                          <p className="text-sm font-bold text-slate-500">{t('launchEventPage.schedule.nftMinting', 'Genesis NFT Minting Start')}</p>
                          <p className="text-xs text-slate-600">Dec 21, 00:05 UTC</p>
                        </div>
                        <div className="ml-6 relative">
                          <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-700 ring-4 ring-slate-100 dark:ring-[#0B1120]"></span>
                          <p className="text-sm font-bold text-slate-500">{t('launchEventPage.schedule.stakingRewards', 'Staking Rewards Start')}</p>
                          <p className="text-xs text-slate-600">Jan 1, 2025</p>
                        </div>
                      </div>
                    </div>

                    {/* Genesis NFT Collection - 2 Columns */}
                    <div className="glass-panel p-6 rounded-2xl lg:col-span-2 relative overflow-hidden">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                        <Box className="w-32 h-32 text-slate-400 dark:text-white" strokeWidth={1} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">🎨 {t('launchEventPage.nftSection.title', 'Genesis NFT Collection')}</h3>
                      <div className="flex items-center gap-6 mb-6">
                        <img 
                          src="https://api.dicebear.com/7.x/shapes/svg?seed=Genesis" 
                          className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-1 shadow-lg border border-white/20"
                          alt="Genesis NFT"
                        />
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('launchEventPage.nftSection.nftName', 'Genesis Founder NFT')}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('launchEventPage.nftSection.nftDesc', '100 limited edition. Ultimate authority and benefits.')}</p>
                          <div className="flex gap-4 text-xs font-mono">
                            <div className="bg-slate-200/80 dark:bg-black/30 px-2 py-1 rounded">
                              <span className="text-slate-500">{t('launchEventPage.nftSection.tier', 'Tier')}</span> <span className="text-slate-900 dark:text-white font-bold">3</span>
                            </div>
                            <div className="bg-slate-200/80 dark:bg-black/30 px-2 py-1 rounded">
                              <span className="text-slate-500">{t('launchEventPage.nftSection.totalSupply', 'Total Supply')}</span> <span className="text-slate-900 dark:text-white font-bold">1,000</span>
                            </div>
                            <div className="bg-slate-200/80 dark:bg-black/30 px-2 py-1 rounded">
                              <span className="text-[#3B82F6]">{t('launchEventPage.nftSection.minted', 'Minted')}</span> <span className="text-slate-900 dark:text-white font-bold">{formatNumber(stats.nftsMinted)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-200/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-300 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-300">ℹ️ {t('launchEventPage.nftSection.info', 'Free minting rights granted to Genesis and Diamond tier stakers.')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Referral Program */}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('launchEventPage.referralSection.title', 'Referral Program')}</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">{t('launchEventPage.referralSection.description', 'Share your referral link and earn 10% of your referrals\' staking rewards!')}</p>
                    
                    <div className="glass-panel p-6 rounded-2xl">
                      {isConnected && userData ? (
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 bg-slate-200/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-300 dark:border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">{t('launchEventPage.referralSection.yourCode', 'Your Referral Link')}</p>
                            <div className="flex items-center gap-2">
                              <code className="text-lg font-mono text-slate-900 dark:text-white flex-1">{userData.referralCode}</code>
                              <button 
                                onClick={copyReferralCode}
                                className="p-2 rounded-lg bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                              >
                                {copiedReferral ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-200/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-300 dark:border-slate-700 text-center">
                              <p className="text-xs text-slate-500">{t('launchEventPage.referralSection.totalReferrals', 'Total Referrals')}</p>
                              <p className="text-2xl font-bold font-mono text-[#3B82F6]">{userData.referralCount}</p>
                            </div>
                            <div className="bg-slate-200/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-300 dark:border-slate-700 text-center">
                              <p className="text-xs text-slate-500">{t('launchEventPage.referralSection.bonusEarned', 'Bonus Earned')}</p>
                              <p className="text-2xl font-bold font-mono text-[#F97316]">{userData.referralBonus}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Wallet className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-500 dark:text-slate-400 mb-4">{t('launchEventPage.referralSection.description', 'Share your referral link and earn 10% of your referrals\' staking rewards!')}</p>
                          <button 
                            onClick={() => setShowWalletModal(true)}
                            className="bg-[#3B82F6] hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            {t('launchEventPage.connectWallet', 'Connect Wallet')}
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('launchEventPage.rewards.title', 'My Rewards')}</h2>
                    
                    {isConnected && userData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-2xl">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <Coins className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{t('launchEventPage.rewards.airdropReward', 'Airdrop Reward')}</p>
                              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{userData.airdropAmount} TBURN</p>
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
                              <><CheckCircle className="w-5 h-5" /> {t('launchEventPage.rewards.claimCompleted', 'Claimed')}</>
                            ) : (
                              <><Gift className="w-5 h-5" /> {t('launchEventPage.rewards.claimAirdrop', 'Claim Airdrop')}</>
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
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('launchEventPage.rewards.genesisNft', 'Genesis NFT')}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{userTier?.charAt(0).toUpperCase()}{userTier?.slice(1)} NFT</p>
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
                                <><CheckCircle className="w-5 h-5" /> {t('launchEventPage.rewards.mintCompleted', 'Minted')}</>
                              ) : (
                                <><Sparkles className="w-5 h-5" /> {t('launchEventPage.rewards.mintNft', 'Mint NFT')}</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="glass-panel p-12 rounded-2xl text-center">
                        <Wallet className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('launchEventPage.rewards.connectPrompt', 'Connect Wallet')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">{t('launchEventPage.rewards.connectDescription', 'Connect your wallet to check and claim rewards.')}</p>
                        <button 
                          onClick={() => setShowWalletModal(true)}
                          className="bg-[#3B82F6] hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                        >
                          {t('launchEventPage.connectWallet', 'Connect Wallet')}
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('launchEventPage.tasks.title', 'Tasks & Quests')}</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">{t('launchEventPage.tasks.description', 'Complete tasks and earn additional rewards!')}</p>

                    <div className="glass-panel rounded-2xl overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-6">{t('launchEventPage.tasks.task', 'TASK')}</div>
                        <div className="col-span-3 text-center">{t('launchEventPage.tasks.reward', 'REWARD')}</div>
                        <div className="col-span-3 text-right">{t('launchEventPage.tasks.action', 'ACTION')}</div>
                      </div>
                      
                      {/* Table Body */}
                      {SOCIAL_TASKS.map((task) => {
                        const Icon = task.icon;
                        const isCompleted = userData?.tasks?.find(t => t.id === task.id)?.completed || false;
                        
                        return (
                          <div 
                            key={task.id} 
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800 items-center hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                            data-testid={`task-row-${task.id}`}
                          >
                            {/* Task */}
                            <div className="col-span-6 flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? "bg-emerald-500/20" : "bg-slate-200 dark:bg-slate-700"}`}>
                                <Icon className={`w-5 h-5 ${isCompleted ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"}`} />
                              </div>
                              <p className="font-medium text-slate-900 dark:text-white">{t(`launchEventPage.tasks.${task.id}`, task.name)}</p>
                            </div>
                            
                            {/* Reward */}
                            <div className="col-span-3 text-center">
                              <span className="text-[#F97316] font-mono font-bold">{task.reward}</span>
                            </div>
                            
                            {/* Action */}
                            <div className="col-span-3 text-right">
                              <button 
                                disabled={isCompleted}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                  isCompleted 
                                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                                    : "bg-[#3B82F6] hover:bg-blue-600 text-white"
                                }`}
                              >
                                {isCompleted ? (
                                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {t('launchEventPage.tasks.completed', 'Completed')}</span>
                                ) : (
                                  <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4" /> {t('launchEventPage.tasks.start', 'Start')}</span>
                                )}
                              </button>
                            </div>
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">🏆 {t('launchEventPage.leaderboard.title', 'Launch Leaderboard')}</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">{t('launchEventPage.leaderboard.description', 'Raise your rank through staking and referrals. Special rewards for top participants.')}</p>

                    <div className="glass-panel rounded-2xl overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-1">{t('launchEventPage.leaderboard.rank', 'RANK')}</div>
                        <div className="col-span-4">{t('launchEventPage.leaderboard.user', 'USER')}</div>
                        <div className="col-span-3 text-right">{t('launchEventPage.leaderboard.staked', 'STAKED')}</div>
                        <div className="col-span-2 text-center">{t('launchEventPage.leaderboard.referrals', 'REFERRALS')}</div>
                        <div className="col-span-2 text-right">{t('launchEventPage.leaderboard.score', 'SCORE')}</div>
                      </div>
                      
                      {/* Table Body */}
                      {leaderboardData.slice(0, 10).map((entry, idx) => {
                        const rank = idx + 1;
                        const isUser = address === entry.address;
                        
                        return (
                          <div 
                            key={entry.address}
                            className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800 items-center hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors ${isUser ? "bg-blue-500/10" : ""}`}
                            data-testid={`leaderboard-row-${rank}`}
                          >
                            {/* Rank */}
                            <div className="col-span-1">
                              {rank === 1 ? <span className="text-2xl">👑</span> :
                               rank === 2 ? <span className="text-2xl">🥈</span> :
                               rank === 3 ? <span className="text-2xl">🥉</span> :
                               <span className="text-slate-500 font-mono">#{rank}</span>}
                            </div>
                            
                            {/* User */}
                            <div className="col-span-4">
                              <span className="font-bold text-slate-900 dark:text-white">{entry.displayName}</span>
                              {isUser && <Badge className="ml-2 bg-blue-500 text-white text-[10px]">{t('launchEventPage.leaderboard.you', 'You')}</Badge>}
                            </div>
                            
                            {/* Staked */}
                            <div className="col-span-3 text-right">
                              <span className="font-mono text-[#3B82F6]">{formatNumber(parseFloat(entry.stakedAmount))} TB</span>
                            </div>
                            
                            {/* Referrals */}
                            <div className="col-span-2 text-center">
                              <span className="font-mono text-slate-900 dark:text-white">{entry.referrals}</span>
                            </div>
                            
                            {/* Score */}
                            <div className="col-span-2 text-right">
                              <span className="font-bold font-mono text-[#F97316]">{formatNumber(entry.score)}</span>
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('launchEventPage.cta.title', 'Join Now!')}</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-xl mx-auto">
                  {t('launchEventPage.cta.description', 'Participate in the TBURN Mainnet Genesis launch and receive exclusive rewards. Start staking to automatically join the event.')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/staking">
                    <button 
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
                      data-testid="button-join-launch"
                    >
                      {t('launchEventPage.cta.joinLaunch', 'Join Launch Event')}
                    </button>
                  </Link>
                  <Link href="/staking">
                    <button 
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105"
                      data-testid="link-staking"
                    >
                      {t('launchEventPage.cta.startStaking', 'Start Staking')}
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
