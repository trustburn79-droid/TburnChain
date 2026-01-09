import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";

interface LaunchpadPlatform {
  name: string;
  status: string;
  totalProjects: number;
  totalRaised: string;
  avgRoi: string;
  participants: number;
  upcomingIdo: number;
}

interface LaunchpadStatsData {
  platforms: LaunchpadPlatform[];
  totalLaunchpadRaised: string;
  averageRoi: string;
}

interface LaunchpadStatsResponse {
  success: boolean;
  data: LaunchpadStatsData;
}

export default function DAOMakerPage() {
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tiers");
  const [allocationAmount, setAllocationAmount] = useState(1000);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<"pending" | "success">("pending");
  const [countdown, setCountdown] = useState({ days: 14, hours: 8, minutes: 32, seconds: 45 });
  const [expandedFaq, setExpandedFaq] = useState(0);

  const { data: response, isLoading: isLoadingStats } = useQuery<LaunchpadStatsResponse>({
    queryKey: ['/api/token-programs/launchpad/stats'],
  });
  const launchpadStats = response?.data;

  const daoMakerPlatform = launchpadStats?.platforms?.find(p => p.name === "DAO Maker");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
      toast({
        title: "지갑 연결 해제",
        description: "지갑이 성공적으로 연결 해제되었습니다.",
      });
    } else {
      connect("metamask");
      toast({
        title: "지갑 연결 중",
        description: "MetaMask 지갑 연결을 시도하고 있습니다.",
      });
    }
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({
      title: `${platform} 열기`,
      description: `${platform} 페이지로 이동합니다.`,
    });
  };

  const handleNavItem = (itemName: string) => {
    toast({
      title: `${itemName} 메뉴`,
      description: `${itemName} 기능은 곧 출시됩니다.`,
    });
  };

  const tokenPrice = 0.02;
  const daoTier = "Silver";
  const maxAllocation = 2500;
  const bonusPercent = allocationAmount >= 2500 ? 3 : allocationAmount >= 1000 ? 1 : 0;
  const baseTokens = allocationAmount / tokenPrice;
  const bonusTokens = baseTokens * (bonusPercent / 100);
  const totalTokens = baseTokens + bonusTokens;
  const tgeTokens = totalTokens * 0.15;

  const handlePurchase = () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "지갑 연결 필요",
        description: "SHO 참여를 위해 먼저 지갑을 연결해주세요.",
      });
      return;
    }
    if (allocationAmount < 100) {
      toast({
        variant: "destructive",
        title: "최소 금액 미달",
        description: "최소 $100 이상 참여해야 합니다.",
      });
      return;
    }
    if (allocationAmount > maxAllocation) {
      toast({
        variant: "destructive",
        title: "최대 금액 초과",
        description: `${daoTier} 티어 최대 할당량 $${maxAllocation.toLocaleString()}을 초과했습니다.`,
      });
      return;
    }
    setShowModal(true);
    setModalStatus("pending");
    setTimeout(() => {
      setModalStatus("success");
      toast({
        title: "SHO 참여 완료!",
        description: `${totalTokens.toLocaleString()} TBURN 토큰 구매가 완료되었습니다.`,
      });
    }, 2500);
  };

  const handleStakeDAO = () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "지갑 연결 필요",
        description: "DAO 토큰 스테이킹을 위해 먼저 지갑을 연결해주세요.",
      });
      return;
    }
    toast({
      title: "스테이킹 페이지로 이동",
      description: "DAO Power를 높이기 위한 스테이킹 페이지로 이동합니다.",
    });
  };

  const quickAmounts = [100, 500, 1000, 2500];

  const tiers = [
    { icon: "🥉", name: "Bronze", power: "1,000+", allocation: "$500", features: ["SHO 참여 자격", "기본 할당량", "리펀드 정책 적용"] },
    { icon: "🥈", name: "Silver", power: "5,000+", allocation: "$2,500", features: ["우선 할당", "+1% 보너스 토큰", "거버넌스 투표권", "리펀드 정책 적용"], recommended: true },
    { icon: "🥇", name: "Gold", power: "25,000+", allocation: "$10,000", features: ["보장 할당", "+3% 보너스 토큰", "우선 거버넌스 투표", "VIP 커뮤니티 접근", "리펀드 정책 적용"] },
  ];

  const vestingSchedule = [
    { title: "TGE (토큰 생성)", desc: "토큰 생성 시점 즉시 해제", percent: "15%", active: true },
    { title: "클리프 기간", desc: "1~3개월, 추가 해제 없음", percent: "0%" },
    { title: "선형 베스팅", desc: "4~15개월, 월 7.08% 해제", percent: "85%" },
    { title: "완전 해제", desc: "TGE 후 15개월", percent: "100%" },
  ];

  const vestingChart = [
    { label: "TGE", percent: 15 },
    { label: "3개월", percent: 15 },
    { label: "6개월", percent: 36 },
    { label: "9개월", percent: 57 },
    { label: "12개월", percent: 79 },
    { label: "15개월", percent: 100 },
  ];

  const governanceCards = [
    { icon: "🗳️", title: "커뮤니티 투표", desc: "DAO Power 보유자는 프로젝트 선정 및 주요 결정에 투표권을 행사할 수 있습니다." },
    { icon: "📊", title: "투명한 운영", desc: "모든 SHO 진행 과정과 자금 사용 내역은 온체인에서 투명하게 공개됩니다." },
    { icon: "🛡️", title: "리펀드 정책", desc: "TGE 후 30일 내 토큰 가격이 세일가 이하로 하락 시 100% 환불을 보장합니다." },
    { icon: "⚡", title: "DAO Power 스테이킹", desc: "DAO 토큰을 스테이킹하여 DAO Power를 획득하고 더 높은 티어로 승급하세요." },
    { icon: "🎁", title: "보상 프로그램", desc: "활발한 거버넌스 참여자에게 추가 보상과 에어드롭 기회를 제공합니다." },
    { icon: "🤝", title: "커뮤니티 펀드", desc: "DAO 커뮤니티가 관리하는 펀드를 통해 생태계 발전을 지원합니다." },
  ];

  const faqItems = [
    { 
      q: "SHO(Strong Holder Offering)란 무엇인가요?", 
      a: "SHO는 DAO Maker의 독점적인 토큰 세일 방식입니다. DAO Power를 보유한 사용자만 참여할 수 있으며, 보유량에 따라 티어가 결정되고 할당량이 달라집니다. Bronze(1,000+), Silver(5,000+), Gold(25,000+) 세 가지 티어가 있습니다." 
    },
    { 
      q: "DAO Power는 어떻게 얻나요?", 
      a: "DAO Maker 플랫폼에서 DAO 토큰을 스테이킹하여 DAO Power를 획득할 수 있습니다. 스테이킹 기간과 수량에 따라 DAO Power가 결정됩니다. 더 오래 스테이킹할수록 더 많은 DAO Power를 얻을 수 있습니다." 
    },
    { 
      q: "리펀드 정책은 어떻게 작동하나요?", 
      a: "TGE(Token Generation Event) 후 30일 내에 토큰 가격이 세일 가격($0.02) 이하로 하락하면, 참여자는 구매한 토큰을 반환하고 100% 환불받을 수 있습니다. 이는 DAO Maker의 투자자 보호 정책입니다." 
    },
    { 
      q: "최소/최대 참여 금액은 얼마인가요?", 
      a: "최소 $100부터 참여 가능하며, 최대 참여 금액은 DAO Power 티어에 따라 달라집니다. Bronze: $500, Silver: $2,500, Gold: $10,000까지 참여할 수 있습니다. 티어가 높을수록 더 많은 할당량을 받습니다." 
    },
    { 
      q: "토큰은 언제 받을 수 있나요?", 
      a: "TGE 시점에 15%가 즉시 해제되며, 3개월 클리프 기간 후 나머지 85%가 12개월 동안 선형 베스팅으로 지급됩니다. 총 베스팅 기간은 15개월입니다." 
    },
    { 
      q: "티어별 보너스 혜택은 무엇인가요?", 
      a: "Silver 티어($2,500 이상 할당)는 +1% 보너스 토큰을 받고, Gold 티어($10,000 이상 할당)는 +3% 보너스 토큰을 받습니다. 또한 Gold 티어는 보장 할당과 VIP 커뮤니티 접근 권한도 제공됩니다." 
    },
    { 
      q: "SHO 참여 방법은 어떻게 되나요?", 
      a: "1) DAO 토큰을 스테이킹하여 DAO Power 획득, 2) 지갑 연결 후 KYC 완료, 3) 원하는 금액 입력 및 USDT로 결제, 4) 스마트 컨트랙트를 통한 안전한 토큰 구매 완료. SHO 기간 내 참여해야 합니다." 
    },
    { 
      q: "문의나 지원이 필요하면 어떻게 하나요?", 
      a: "DAO Maker 공식 Discord, Telegram 커뮤니티를 통해 지원받으실 수 있습니다. 또는 support@daomaker.com으로 이메일 문의하거나, TBURN 공식 커뮤니티(support@tburnchain.io)에 문의해 주세요." 
    },
  ];

  const socialLinks = [
    { icon: "🐦", name: "Twitter", url: "https://x.com/tburnchain" },
    { icon: "📱", name: "Telegram", url: "https://t.me/tburnchain" },
    { icon: "💬", name: "Discord", url: "https://discord.gg/tburnchain" },
    { icon: "📝", name: "Medium", url: "https://medium.com/@tburnchain" },
    { icon: "💻", name: "GitHub", url: "https://github.com/tburnchain" },
    { icon: "🌐", name: "Website", url: "https://tburnchain.io" },
  ];

  return (
    <div className="dao-maker-page">
      <style>{`
        .dao-maker-page {
          --dao-primary: #00D4AA;
          --dao-secondary: #7B61FF;
          --dao-accent: #00B4D8;
          --dao-pink: #FF6B9D;
          --dao-dark: #0D1117;
          --dao-darker: #010409;
          --dao-card: #161B22;
          --dao-card-hover: #1C2128;
          --dao-border: #30363D;
          --dao-text: #C9D1D9;
          --dao-text-muted: #8B949E;
          --white: #FFFFFF;
          --success: #3FB950;
          --warning: #D29922;
          --danger: #F85149;
          --gradient-dao: linear-gradient(135deg, #00D4AA 0%, #7B61FF 100%);
          --gradient-sho: linear-gradient(135deg, #7B61FF 0%, #FF6B9D 100%);
          --gradient-power: linear-gradient(135deg, #00B4D8 0%, #00D4AA 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dao-darker);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.3); } 50% { box-shadow: 0 0 40px rgba(0, 212, 170, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes borderGlow { 0%, 100% { border-color: rgba(0, 212, 170, 0.3); } 50% { border-color: rgba(123, 97, 255, 0.5); } }
        @keyframes diamondSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1); } }

        .dm-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(13, 17, 23, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--dao-border);
        }

        .dm-header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dm-header-left { display: flex; align-items: center; gap: 2.5rem; }

        .dm-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          cursor: pointer;
        }

        .dm-logo-icon {
          width: 42px;
          height: 42px;
          background: var(--gradient-dao);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .dm-logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          background: var(--gradient-dao);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dm-nav { display: flex; gap: 0.25rem; }

        .dm-nav-item {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--dao-text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-nav-item:hover { color: var(--white); background: var(--dao-card); }
        .dm-nav-item.active { color: var(--dao-primary); background: rgba(0, 212, 170, 0.1); }

        .dm-header-right { display: flex; align-items: center; gap: 1rem; }

        .dm-power-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(123, 97, 255, 0.15);
          border: 1px solid rgba(123, 97, 255, 0.3);
          border-radius: 10px;
        }

        .dm-power-badge .icon { font-size: 1rem; color: var(--dao-secondary); }
        .dm-power-badge .label { font-size: 0.75rem; color: var(--dao-text-muted); }
        .dm-power-badge .value { font-size: 0.9rem; font-weight: 700; color: var(--dao-secondary); }

        .dm-connect-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--gradient-dao);
          border: none;
          border-radius: 10px;
          color: var(--dao-dark);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-connect-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0, 212, 170, 0.3); }

        .dm-main { padding-top: 80px; }

        .dm-hero {
          position: relative;
          padding: 3rem 2rem;
          background: var(--dao-dark);
          overflow: hidden;
        }

        .dm-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 30% 20%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(123, 97, 255, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .dm-hero-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }

        .dm-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 2rem; font-size: 0.85rem; }
        .dm-breadcrumb a { color: var(--dao-text-muted); text-decoration: none; transition: color 0.3s; cursor: pointer; }
        .dm-breadcrumb a:hover { color: var(--dao-primary); }
        .dm-breadcrumb span { color: var(--dao-text-muted); }
        .dm-breadcrumb .current { color: var(--white); }

        .dm-project-hero { display: grid; grid-template-columns: 1fr 420px; gap: 3rem; align-items: start; }

        .dm-project-main { display: flex; flex-direction: column; gap: 2rem; }

        .dm-project-header { display: flex; align-items: flex-start; gap: 1.5rem; }

        .dm-project-logo {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
          flex-shrink: 0;
        }

        .dm-project-info { flex: 1; }
        .dm-project-info h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; }
        .dm-project-info .tagline { color: var(--dao-text-muted); font-size: 1rem; margin-bottom: 1rem; }

        .dm-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }

        .dm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .dm-badge.sho { background: var(--gradient-sho); color: var(--white); }
        .dm-badge.live { background: rgba(63, 185, 80, 0.2); color: var(--success); border: 1px solid rgba(63, 185, 80, 0.3); }
        .dm-badge.live .dot { width: 6px; height: 6px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .dm-badge.refund { background: rgba(0, 180, 216, 0.15); color: var(--dao-accent); border: 1px solid rgba(0, 180, 216, 0.3); }
        .dm-badge.verified { background: rgba(0, 212, 170, 0.15); color: var(--dao-primary); border: 1px solid rgba(0, 212, 170, 0.3); }

        .dm-description { color: var(--dao-text); font-size: 1rem; line-height: 1.8; }

        .dm-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

        .dm-stat-card {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          transition: all 0.3s;
        }

        .dm-stat-card:hover { border-color: var(--dao-primary); transform: translateY(-3px); }

        .dm-stat-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .dm-stat-value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }
        .dm-stat-value.primary { color: var(--dao-primary); }
        .dm-stat-value.secondary { color: var(--dao-secondary); }
        .dm-stat-value.accent { color: var(--dao-accent); }
        .dm-stat-value.pink { color: var(--dao-pink); }
        .dm-stat-label { font-size: 0.8rem; color: var(--dao-text-muted); }

        .dm-social-row { display: flex; gap: 0.75rem; }

        .dm-social-btn {
          width: 44px;
          height: 44px;
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dao-text-muted);
          text-decoration: none;
          transition: all 0.3s;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .dm-social-btn:hover { border-color: var(--dao-primary); color: var(--dao-primary); transform: translateY(-3px); }

        .dm-sho-card {
          background: var(--dao-card);
          border: 2px solid var(--dao-border);
          border-radius: 24px;
          overflow: hidden;
          position: sticky;
          top: 100px;
          animation: borderGlow 3s infinite;
        }

        .dm-sho-header {
          padding: 1.5rem;
          background: var(--gradient-sho);
          position: relative;
          overflow: hidden;
        }

        .dm-sho-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .dm-sho-header-content { position: relative; z-index: 1; }

        .dm-sho-title { display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem; }
        .dm-sho-title h3 { font-size: 1.25rem; font-weight: 800; }
        .dm-sho-title .diamond { font-size: 1.25rem; animation: diamondSpin 4s ease-in-out infinite; }
        .dm-sho-subtitle { font-size: 0.9rem; opacity: 0.9; }

        .dm-sho-body { padding: 1.5rem; }

        .dm-sho-countdown {
          background: var(--dao-darker);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .dm-countdown-label { font-size: 0.8rem; color: var(--dao-text-muted); text-align: center; margin-bottom: 0.75rem; }

        .dm-countdown-timer { display: flex; justify-content: center; gap: 0.75rem; }

        .dm-countdown-item { text-align: center; min-width: 60px; }

        .dm-countdown-value {
          font-size: 1.75rem;
          font-weight: 800;
          background: var(--gradient-dao);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dm-countdown-unit { font-size: 0.7rem; color: var(--dao-text-muted); text-transform: uppercase; }

        .dm-sho-progress { margin-bottom: 1.5rem; }

        .dm-progress-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .dm-progress-raised { font-size: 1.25rem; font-weight: 800; color: var(--dao-primary); }
        .dm-progress-goal { font-size: 0.9rem; color: var(--dao-text-muted); }

        .dm-progress-bar { height: 10px; background: var(--dao-darker); border-radius: 100px; overflow: hidden; margin-bottom: 0.75rem; }

        .dm-progress-fill {
          height: 100%;
          background: var(--gradient-dao);
          border-radius: 100px;
          position: relative;
          width: 45%;
        }

        .dm-progress-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .dm-progress-stats { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .dm-progress-percent { color: var(--dao-primary); font-weight: 700; }
        .dm-progress-participants { color: var(--dao-text-muted); }

        .dm-sale-details { margin-bottom: 1.5rem; }

        .dm-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dm-detail-row:last-child { border-bottom: none; }
        .dm-detail-row .label { color: var(--dao-text-muted); font-size: 0.9rem; }
        .dm-detail-row .value { font-weight: 600; font-size: 0.9rem; }
        .dm-detail-row .value.highlight { color: var(--dao-primary); }

        .dm-dao-power-section {
          background: linear-gradient(135deg, rgba(123, 97, 255, 0.1), rgba(0, 212, 170, 0.05));
          border: 1px solid rgba(123, 97, 255, 0.2);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .dm-power-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .dm-power-header h4 { font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .dm-power-header h4 span { color: var(--dao-secondary); }
        .dm-power-status { font-size: 0.8rem; padding: 4px 10px; background: rgba(63, 185, 80, 0.2); border-radius: 100px; color: var(--success); font-weight: 600; }

        .dm-power-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

        .dm-power-stat { text-align: center; padding: 0.75rem; background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
        .dm-power-stat .value { font-size: 1.25rem; font-weight: 800; color: var(--dao-secondary); }
        .dm-power-stat .label { font-size: 0.75rem; color: var(--dao-text-muted); }

        .dm-allocation { margin-bottom: 1.5rem; }
        .dm-allocation-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .dm-allocation-header .label { font-size: 0.9rem; font-weight: 600; }
        .dm-allocation-header .max { font-size: 0.8rem; color: var(--dao-primary); }

        .dm-allocation-input-wrapper { position: relative; margin-bottom: 1rem; }

        .dm-allocation-input {
          width: 100%;
          padding: 1rem;
          padding-right: 100px;
          background: var(--dao-darker);
          border: 2px solid var(--dao-border);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
          transition: border-color 0.3s;
        }

        .dm-allocation-input:focus { outline: none; border-color: var(--dao-primary); }

        .dm-allocation-currency {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--dao-card);
          border-radius: 8px;
        }

        .dm-allocation-currency .icon { font-size: 1.25rem; }
        .dm-allocation-currency span { font-weight: 600; font-size: 0.85rem; }

        .dm-quick-amounts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }

        .dm-quick-amount {
          padding: 10px;
          background: var(--dao-darker);
          border: 1px solid var(--dao-border);
          border-radius: 8px;
          color: var(--dao-text);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .dm-quick-amount:hover, .dm-quick-amount.active {
          border-color: var(--dao-primary);
          color: var(--dao-primary);
          background: rgba(0, 212, 170, 0.1);
        }

        .dm-token-output {
          background: var(--dao-darker);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .dm-token-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
        .dm-token-row .label { color: var(--dao-text-muted); font-size: 0.85rem; }
        .dm-token-row .value { font-weight: 600; font-size: 0.85rem; }
        .dm-token-row .value.large { font-size: 1.125rem; color: var(--dao-primary); }
        .dm-token-row .value.bonus { color: var(--success); }

        .dm-refund-policy {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: rgba(0, 180, 216, 0.1);
          border: 1px solid rgba(0, 180, 216, 0.2);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .dm-refund-policy .icon {
          width: 40px;
          height: 40px;
          background: rgba(0, 180, 216, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dao-accent);
          font-size: 1.25rem;
        }

        .dm-refund-policy .content { flex: 1; }
        .dm-refund-policy .content h5 { font-size: 0.9rem; font-weight: 700; color: var(--dao-accent); margin-bottom: 0.25rem; }
        .dm-refund-policy .content p { font-size: 0.8rem; color: var(--dao-text-muted); }

        .dm-purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: var(--gradient-sho);
          border: none;
          border-radius: 14px;
          color: var(--white);
          font-size: 1.125rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          animation: glow 2s infinite;
        }

        .dm-purchase-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(123, 97, 255, 0.3); }

        .dm-security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--dao-text-muted);
        }

        .dm-security-note span { color: var(--dao-primary); }

        .dm-details-section { max-width: 1400px; margin: 0 auto; padding: 3rem 2rem; }

        .dm-section-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--dao-border);
          padding-bottom: 1rem;
        }

        .dm-section-tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--dao-text-muted);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-section-tab:hover { color: var(--white); }
        .dm-section-tab.active { background: var(--dao-card); color: var(--dao-primary); }

        .dm-tab-content { display: none; animation: slideUp 0.3s ease-out; }
        .dm-tab-content.active { display: block; }

        .dm-tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

        .dm-tier-card {
          background: var(--dao-card);
          border: 2px solid var(--dao-border);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .dm-tier-card:hover { border-color: var(--dao-primary); transform: translateY(-5px); }
        .dm-tier-card.recommended { border-color: var(--dao-secondary); position: relative; }
        .dm-tier-card.recommended::before {
          content: '추천';
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: var(--gradient-sho);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .dm-tier-header { padding: 1.5rem; text-align: center; border-bottom: 1px solid var(--dao-border); }
        .dm-tier-icon { font-size: 3rem; margin-bottom: 0.75rem; }
        .dm-tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }
        .dm-tier-power { font-size: 0.85rem; color: var(--dao-secondary); font-weight: 600; }

        .dm-tier-body { padding: 1.5rem; }
        .dm-tier-allocation { text-align: center; padding: 1rem; background: var(--dao-darker); border-radius: 12px; margin-bottom: 1rem; }
        .dm-tier-allocation .label { font-size: 0.8rem; color: var(--dao-text-muted); margin-bottom: 0.25rem; }
        .dm-tier-allocation .value { font-size: 1.5rem; font-weight: 800; color: var(--dao-primary); }

        .dm-tier-features { display: flex; flex-direction: column; gap: 0.75rem; }
        .dm-tier-feature { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: var(--dao-text); }
        .dm-tier-feature .check { color: var(--dao-primary); font-weight: 700; }

        .dm-vesting-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }

        .dm-vesting-card {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 20px;
          padding: 1.5rem;
        }

        .dm-vesting-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dm-vesting-timeline { display: flex; flex-direction: column; gap: 1rem; }

        .dm-vesting-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--dao-darker);
          border-radius: 12px;
          border: 1px solid transparent;
        }

        .dm-vesting-item.active { border-color: var(--dao-primary); background: rgba(0, 212, 170, 0.1); }

        .dm-vesting-dot {
          width: 32px;
          height: 32px;
          background: var(--dao-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--dao-text-muted);
          flex-shrink: 0;
        }

        .dm-vesting-item.active .dm-vesting-dot { background: var(--dao-primary); color: var(--dao-dark); }

        .dm-vesting-content { flex: 1; }
        .dm-vesting-content .title { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.25rem; }
        .dm-vesting-content .desc { font-size: 0.8rem; color: var(--dao-text-muted); }
        .dm-vesting-percent { font-size: 1.125rem; font-weight: 800; color: var(--dao-primary); }

        .dm-vesting-chart { display: flex; flex-direction: column; gap: 1rem; }

        .dm-chart-bar { display: flex; align-items: center; gap: 1rem; }
        .dm-chart-label { width: 60px; font-size: 0.85rem; color: var(--dao-text-muted); text-align: right; }
        .dm-chart-track { flex: 1; height: 32px; background: var(--dao-darker); border-radius: 8px; overflow: hidden; }

        .dm-chart-fill {
          height: 100%;
          background: var(--gradient-dao);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--dao-dark);
          min-width: 40px;
        }

        .dm-governance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

        .dm-governance-card {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .dm-governance-card:hover { border-color: var(--dao-primary); transform: translateY(-3px); }

        .dm-governance-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dm-governance-card h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dm-governance-card p { font-size: 0.9rem; color: var(--dao-text-muted); line-height: 1.6; }

        .dm-faq-list { display: flex; flex-direction: column; gap: 1rem; max-width: 800px; }

        .dm-faq-item {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 16px;
          overflow: hidden;
        }

        .dm-faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          cursor: pointer;
          transition: background 0.3s;
        }

        .dm-faq-question:hover { background: var(--dao-card-hover); }
        .dm-faq-question h4 { font-size: 1rem; font-weight: 600; }
        .dm-faq-question .arrow { color: var(--dao-primary); transition: transform 0.3s; }
        .dm-faq-item.active .dm-faq-question .arrow { transform: rotate(180deg); }

        .dm-faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s, padding 0.3s;
        }

        .dm-faq-item.active .dm-faq-answer {
          max-height: 300px;
          padding: 0 1.25rem 1.25rem;
        }

        .dm-faq-answer p { color: var(--dao-text); font-size: 0.95rem; line-height: 1.7; }

        .dm-footer {
          background: var(--dao-dark);
          border-top: 1px solid var(--dao-border);
          padding: 2rem;
        }

        .dm-footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dm-footer-links { display: flex; gap: 2rem; }
        .dm-footer-links a { color: var(--dao-text-muted); text-decoration: none; font-size: 0.9rem; transition: color 0.3s; cursor: pointer; }
        .dm-footer-links a:hover { color: var(--dao-primary); }

        .dm-footer-social { display: flex; gap: 1rem; }

        .dm-footer-social-link {
          width: 36px;
          height: 36px;
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dao-text-muted);
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-footer-social-link:hover { border-color: var(--dao-primary); color: var(--dao-primary); }

        .dm-footer-copyright { color: var(--dao-text-muted); font-size: 0.85rem; }

        .dm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }

        .dm-modal {
          background: var(--dao-card);
          border: 1px solid var(--dao-border);
          border-radius: 24px;
          width: 90%;
          max-width: 420px;
          overflow: hidden;
          animation: slideUp 0.3s;
        }

        .dm-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid var(--dao-border);
          background: var(--gradient-sho);
        }

        .dm-modal-header h3 { font-size: 1.125rem; font-weight: 700; }

        .dm-modal-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: var(--white);
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dm-modal-close:hover { background: rgba(255,255,255,0.3); }

        .dm-modal-body { padding: 2rem; text-align: center; }

        .dm-modal-icon {
          width: 80px;
          height: 80px;
          background: var(--dao-darker);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
        }

        .dm-modal-icon.success { background: rgba(63, 185, 80, 0.2); color: var(--success); }
        .dm-modal-icon.pending { background: rgba(123, 97, 255, 0.2); }

        .dm-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--dao-border);
          border-top-color: var(--dao-secondary);
          border-radius: 50%;
          animation: rotate 1s linear infinite;
        }

        .dm-modal-body h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dm-modal-body p { color: var(--dao-text-muted); font-size: 0.95rem; }

        .dm-modal-details {
          background: var(--dao-darker);
          border-radius: 12px;
          padding: 1rem;
          margin: 1.5rem 0;
        }

        .dm-modal-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .dm-modal-detail-row .label { color: var(--dao-text-muted); font-size: 0.9rem; }
        .dm-modal-detail-row .value { font-weight: 600; font-size: 0.9rem; }

        .dm-modal-btn {
          width: 100%;
          padding: 14px;
          background: var(--gradient-dao);
          border: none;
          border-radius: 12px;
          color: var(--dao-dark);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .dm-modal-btn:hover { transform: scale(1.02); }

        @media (max-width: 1024px) {
          .dm-project-hero { grid-template-columns: 1fr; }
          .dm-sho-card { position: static; margin-top: 2rem; }
          .dm-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dm-tiers-grid { grid-template-columns: 1fr; }
          .dm-vesting-grid { grid-template-columns: 1fr; }
          .dm-governance-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .dm-header-container { padding: 0.75rem 1rem; }
          .dm-nav, .dm-power-badge { display: none; }
          .dm-hero { padding: 2rem 1rem; }
          .dm-project-header { flex-direction: column; align-items: center; text-align: center; }
          .dm-stats-grid { grid-template-columns: 1fr 1fr; }
          .dm-quick-amounts { grid-template-columns: repeat(2, 1fr); }
          .dm-governance-grid { grid-template-columns: 1fr; }
          .dm-footer-content { flex-direction: column; text-align: center; gap: 1rem; }
        }
      `}</style>

      {/* Header */}
      <header className="dm-header">
        <div className="dm-header-container">
          <div className="dm-header-left">
            <a href="/" className="dm-logo" data-testid="link-logo">
              <div className="dm-logo-icon">💎</div>
              <div className="dm-logo-text">DAO Maker</div>
            </a>
            <nav className="dm-nav">
              <button 
                className="dm-nav-item active" 
                onClick={() => scrollToSection('hero')}
                data-testid="nav-sho"
              >
                SHO
              </button>
              <button 
                className="dm-nav-item" 
                onClick={() => handleNavItem('스테이킹')}
                data-testid="nav-staking"
              >
                스테이킹
              </button>
              <button 
                className="dm-nav-item" 
                onClick={() => handleNavItem('거버넌스')}
                data-testid="nav-governance"
              >
                거버넌스
              </button>
              <button 
                className="dm-nav-item" 
                onClick={() => handleNavItem('포트폴리오')}
                data-testid="nav-portfolio"
              >
                포트폴리오
              </button>
              <button 
                className="dm-nav-item" 
                onClick={() => handleNavItem('스왑')}
                data-testid="nav-swap"
              >
                스왑
              </button>
            </nav>
          </div>
          <div className="dm-header-right">
            <div className="dm-power-badge">
              <span className="icon">⚡</span>
              <div>
                <div className="label">DAO Power</div>
                <div className="value">12,500</div>
              </div>
            </div>
            <button 
              className="dm-connect-btn"
              onClick={handleWalletClick}
              data-testid="button-wallet-connect"
            >
              💳 {isConnected ? formatAddress(address || '') : '지갑 연결'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dm-main">
        {/* Hero Section */}
        <section className="dm-hero" id="hero">
          <div className="dm-hero-container">
            <div className="dm-breadcrumb">
              <a onClick={() => scrollToSection('hero')} data-testid="breadcrumb-sho">SHO</a>
              <span>/</span>
              <span className="current">TBURN Chain</span>
            </div>

            <div className="dm-project-hero">
              {/* Project Main */}
              <div className="dm-project-main">
                <div className="dm-project-header">
                  <div className="dm-project-logo">🔥</div>
                  <div className="dm-project-info">
                    <h1 data-testid="text-title">TBURN Chain</h1>
                    <p className="tagline">AI-Enhanced Blockchain Platform · Layer 1</p>
                    <div className="dm-badges">
                      <span className="dm-badge sho">💎 SHO Round</span>
                      <span className="dm-badge live"><span className="dot"></span>진행 중</span>
                      <span className="dm-badge refund">🛡️ 리펀드 보장</span>
                      <span className="dm-badge verified">✓ 검증됨</span>
                    </div>
                  </div>
                </div>

                <p className="dm-description">
                  TBURN Chain은 AI와 블록체인 기술을 융합한 차세대 레이어-1 플랫폼입니다. 
                  200,000+ TPS의 초고속 처리, Triple-Band AI Orchestration, 자가 최적화 네트워크를 통해 
                  엔터프라이즈급 성능과 탈중앙화를 동시에 실현합니다. DAO Maker의 Strong Holder Offering을 통해 
                  DAO Power 보유자에게 우선 참여 기회를 제공합니다.
                </p>

                <div className="dm-stats-grid" data-testid="dao-maker-stats">
                  <div className="dm-stat-card" data-testid="stat-token-price">
                    <div className="dm-stat-icon">💰</div>
                    <div className="dm-stat-value primary">$0.020</div>
                    <div className="dm-stat-label">토큰 가격</div>
                  </div>
                  <div className="dm-stat-card" data-testid="stat-target">
                    <div className="dm-stat-icon">🎯</div>
                    <div className="dm-stat-value secondary">
                      {isLoadingStats ? '...' : daoMakerPlatform?.totalRaised || '$12M'}
                    </div>
                    <div className="dm-stat-label">목표 모집액</div>
                  </div>
                  <div className="dm-stat-card" data-testid="stat-tge">
                    <div className="dm-stat-icon">🔓</div>
                    <div className="dm-stat-value accent">15%</div>
                    <div className="dm-stat-label">TGE 해제</div>
                  </div>
                  <div className="dm-stat-card" data-testid="stat-vesting">
                    <div className="dm-stat-icon">⏱️</div>
                    <div className="dm-stat-value pink">15개월</div>
                    <div className="dm-stat-label">총 베스팅</div>
                  </div>
                </div>

                <div className="dm-social-row">
                  {socialLinks.map((link, i) => (
                    <button 
                      key={i} 
                      className="dm-social-btn"
                      onClick={() => handleShareSocial(link.name, link.url)}
                      data-testid={`social-link-${link.name.toLowerCase()}`}
                    >
                      {link.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* SHO Card */}
              <div className="dm-sho-card">
                <div className="dm-sho-header">
                  <div className="dm-sho-header-content">
                    <div className="dm-sho-title">
                      <span className="diamond">💎</span>
                      <h3>Strong Holder Offering</h3>
                    </div>
                    <p className="dm-sho-subtitle">DAO Power 보유자 전용 토큰 세일</p>
                  </div>
                </div>

                <div className="dm-sho-body">
                  {/* Countdown */}
                  <div className="dm-sho-countdown" data-testid="countdown">
                    <div className="dm-countdown-label">세일 종료까지</div>
                    <div className="dm-countdown-timer">
                      <div className="dm-countdown-item">
                        <div className="dm-countdown-value">{countdown.days.toString().padStart(2, '0')}</div>
                        <div className="dm-countdown-unit">Days</div>
                      </div>
                      <div className="dm-countdown-item">
                        <div className="dm-countdown-value">{countdown.hours.toString().padStart(2, '0')}</div>
                        <div className="dm-countdown-unit">Hours</div>
                      </div>
                      <div className="dm-countdown-item">
                        <div className="dm-countdown-value">{countdown.minutes.toString().padStart(2, '0')}</div>
                        <div className="dm-countdown-unit">Mins</div>
                      </div>
                      <div className="dm-countdown-item">
                        <div className="dm-countdown-value">{countdown.seconds.toString().padStart(2, '0')}</div>
                        <div className="dm-countdown-unit">Secs</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="dm-sho-progress" data-testid="sho-progress">
                    <div className="dm-progress-header">
                      <div className="dm-progress-raised" data-testid="text-raised-amount">$5,400,000</div>
                      <div className="dm-progress-goal">/ $12,000,000</div>
                    </div>
                    <div className="dm-progress-bar">
                      <div className="dm-progress-fill"></div>
                    </div>
                    <div className="dm-progress-stats">
                      <span className="dm-progress-percent">45% 완료</span>
                      <span className="dm-progress-participants" data-testid="text-participants">5,847명 참여</span>
                    </div>
                  </div>

                  {/* Sale Details */}
                  <div className="dm-sale-details">
                    {[
                      { label: "토큰 가격", value: "$0.020", highlight: true },
                      { label: "최소 참여", value: "$100" },
                      { label: "TGE 해제", value: "15%", highlight: true },
                      { label: "베스팅", value: "3개월 클리프 + 12개월" },
                    ].map((item, i) => (
                      <div key={i} className="dm-detail-row">
                        <span className="label">{item.label}</span>
                        <span className={`value ${item.highlight ? 'highlight' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* DAO Power Section */}
                  <div className="dm-dao-power-section">
                    <div className="dm-power-header">
                      <h4><span>⚡</span> 내 DAO Power</h4>
                      <span className="dm-power-status">{daoTier} Tier</span>
                    </div>
                    <div className="dm-power-info">
                      <div className="dm-power-stat">
                        <div className="value">12,500</div>
                        <div className="label">DAO Power</div>
                      </div>
                      <div className="dm-power-stat">
                        <div className="value">${maxAllocation.toLocaleString()}</div>
                        <div className="label">최대 할당</div>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Input */}
                  <div className="dm-allocation">
                    <div className="dm-allocation-header">
                      <span className="label">참여 금액</span>
                      <span className="max">최대: ${maxAllocation.toLocaleString()}</span>
                    </div>
                    <div className="dm-allocation-input-wrapper">
                      <input 
                        type="number"
                        className="dm-allocation-input"
                        value={allocationAmount}
                        onChange={(e) => setAllocationAmount(Math.min(Number(e.target.value) || 0, maxAllocation))}
                        data-testid="input-allocation"
                      />
                      <div className="dm-allocation-currency">
                        <span className="icon">💵</span>
                        <span>USDT</span>
                      </div>
                    </div>
                    <div className="dm-quick-amounts">
                      {quickAmounts.map(amount => (
                        <button 
                          key={amount}
                          className={`dm-quick-amount ${allocationAmount === amount ? 'active' : ''}`}
                          onClick={() => setAllocationAmount(amount)}
                          data-testid={`button-amount-${amount}`}
                        >
                          {amount === maxAllocation ? 'MAX' : `$${amount.toLocaleString()}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Token Output */}
                  <div className="dm-token-output" data-testid="token-calculation">
                    <div className="dm-token-row">
                      <span className="label">받을 토큰</span>
                      <span className="value large">{totalTokens.toLocaleString()} TBURN</span>
                    </div>
                    <div className="dm-token-row">
                      <span className="label">보너스 (+{bonusPercent}%)</span>
                      <span className="value bonus">+{bonusTokens.toLocaleString()} TBURN</span>
                    </div>
                    <div className="dm-token-row">
                      <span className="label">TGE 해제 (15%)</span>
                      <span className="value">{tgeTokens.toLocaleString()} TBURN</span>
                    </div>
                  </div>

                  {/* Refund Policy */}
                  <div className="dm-refund-policy">
                    <div className="icon">🛡️</div>
                    <div className="content">
                      <h5>리펀드 정책 적용</h5>
                      <p>TGE 후 30일 내 토큰 가격이 세일가 이하 시 100% 환불</p>
                    </div>
                  </div>

                  <button 
                    className="dm-purchase-btn" 
                    onClick={handlePurchase} 
                    data-testid="button-purchase"
                  >
                    💎 SHO 참여하기
                  </button>

                  <div className="dm-security-note">
                    <span>🔒</span> DAO Maker 스마트 컨트랙트로 안전하게 처리
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="dm-details-section" id="details">
          <div className="dm-section-tabs">
            {[
              { id: 'tiers', label: 'SHO 티어' },
              { id: 'vesting', label: '베스팅' },
              { id: 'governance', label: '거버넌스' },
              { id: 'faq', label: 'FAQ' },
            ].map(tab => (
              <button 
                key={tab.id}
                className={`dm-section-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SHO Tiers Tab */}
          <div className={`dm-tab-content ${activeTab === 'tiers' ? 'active' : ''}`}>
            <div className="dm-tiers-grid">
              {tiers.map((tier, i) => (
                <div 
                  key={i} 
                  className={`dm-tier-card ${tier.recommended ? 'recommended' : ''}`}
                  data-testid={`tier-card-${tier.name.toLowerCase()}`}
                >
                  <div className="dm-tier-header">
                    <div className="dm-tier-icon">{tier.icon}</div>
                    <div className="dm-tier-name">{tier.name}</div>
                    <div className="dm-tier-power">{tier.power} DAO Power</div>
                  </div>
                  <div className="dm-tier-body">
                    <div className="dm-tier-allocation">
                      <div className="label">최대 할당</div>
                      <div className="value">{tier.allocation}</div>
                    </div>
                    <div className="dm-tier-features">
                      {tier.features.map((f, j) => (
                        <div key={j} className="dm-tier-feature">
                          <span className="check">✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vesting Tab */}
          <div className={`dm-tab-content ${activeTab === 'vesting' ? 'active' : ''}`}>
            <div className="dm-vesting-grid">
              <div className="dm-vesting-card">
                <h3><span>📅</span> 베스팅 스케줄</h3>
                <div className="dm-vesting-timeline">
                  {vestingSchedule.map((v, i) => (
                    <div key={i} className={`dm-vesting-item ${v.active ? 'active' : ''}`}>
                      <div className="dm-vesting-dot">{v.active ? '✓' : i + 1}</div>
                      <div className="dm-vesting-content">
                        <div className="title">{v.title}</div>
                        <div className="desc">{v.desc}</div>
                      </div>
                      <div className="dm-vesting-percent">{v.percent}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dm-vesting-card">
                <h3><span>📊</span> 해제 현황</h3>
                <div className="dm-vesting-chart">
                  {vestingChart.map((c, i) => (
                    <div key={i} className="dm-chart-bar">
                      <div className="dm-chart-label">{c.label}</div>
                      <div className="dm-chart-track">
                        <div className="dm-chart-fill" style={{ width: `${c.percent}%` }}>{c.percent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Governance Tab */}
          <div className={`dm-tab-content ${activeTab === 'governance' ? 'active' : ''}`}>
            <div className="dm-governance-grid">
              {governanceCards.map((g, i) => (
                <div key={i} className="dm-governance-card" data-testid={`governance-card-${i}`}>
                  <div className="dm-governance-icon">{g.icon}</div>
                  <h4>{g.title}</h4>
                  <p>{g.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Tab */}
          <div className={`dm-tab-content ${activeTab === 'faq' ? 'active' : ''}`} id="faq">
            <div className="dm-faq-list">
              {faqItems.map((faq, i) => (
                <div 
                  key={i} 
                  className={`dm-faq-item ${expandedFaq === i ? 'active' : ''}`}
                  data-testid={`faq-item-${i + 1}`}
                >
                  <div 
                    className="dm-faq-question" 
                    onClick={() => setExpandedFaq(expandedFaq === i ? -1 : i)}
                  >
                    <h4>{faq.q}</h4>
                    <span className="arrow">▼</span>
                  </div>
                  <div className="dm-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="dm-footer">
          <div className="dm-footer-content">
            <div className="dm-footer-links">
              <a href="/legal/terms-of-service" data-testid="footer-link-terms">이용약관</a>
              <a href="/legal/privacy-policy" data-testid="footer-link-privacy">개인정보처리방침</a>
              <a 
                onClick={() => toast({ title: "리스크 고지", description: "리스크 고지 페이지로 이동합니다." })}
                data-testid="footer-link-risk"
              >
                리스크 고지
              </a>
              <a 
                onClick={() => toast({ title: "고객 지원", description: "support@daomaker.com으로 문의해 주세요." })}
                data-testid="footer-link-support"
              >
                고객 지원
              </a>
            </div>
            <div className="dm-footer-social">
              <button 
                className="dm-footer-social-link"
                onClick={() => handleShareSocial('Twitter', 'https://x.com/tburnchain')}
                data-testid="footer-link-twitter"
              >
                🐦
              </button>
              <button 
                className="dm-footer-social-link"
                onClick={() => handleShareSocial('Telegram', 'https://t.me/tburnchain')}
                data-testid="footer-link-telegram"
              >
                📱
              </button>
              <button 
                className="dm-footer-social-link"
                onClick={() => handleShareSocial('Discord', 'https://discord.gg/tburnchain')}
                data-testid="footer-link-discord"
              >
                💬
              </button>
              <button 
                className="dm-footer-social-link"
                onClick={() => handleShareSocial('GitHub', 'https://github.com/tburnchain')}
                data-testid="footer-link-github"
              >
                💻
              </button>
            </div>
            <div className="dm-footer-copyright">© 2025 DAO Maker. All Rights Reserved.</div>
          </div>
        </footer>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="dm-modal-overlay" data-testid="modal-purchase">
          <div className="dm-modal">
            <div className="dm-modal-header">
              <h3>{modalStatus === 'success' ? 'SHO 참여 완료!' : '처리 중...'}</h3>
              <button 
                className="dm-modal-close" 
                onClick={() => setShowModal(false)}
                data-testid="button-modal-close"
              >
                ✕
              </button>
            </div>
            <div className="dm-modal-body">
              <div className={`dm-modal-icon ${modalStatus}`}>
                {modalStatus === 'pending' ? <div className="dm-spinner"></div> : '✓'}
              </div>
              <h4>{modalStatus === 'success' ? 'Strong Holder Offering 참여 완료!' : '스마트 컨트랙트 처리 중...'}</h4>
              <p>{modalStatus === 'success' ? 'TGE 시점에 토큰이 지급됩니다' : '잠시만 기다려주세요'}</p>

              <div className="dm-modal-details">
                <div className="dm-modal-detail-row">
                  <span className="label">참여 금액</span>
                  <span className="value">${allocationAmount.toLocaleString()} USDT</span>
                </div>
                <div className="dm-modal-detail-row">
                  <span className="label">받을 토큰</span>
                  <span className="value">{totalTokens.toLocaleString()} TBURN</span>
                </div>
                <div className="dm-modal-detail-row">
                  <span className="label">TGE 해제</span>
                  <span className="value">{tgeTokens.toLocaleString()} TBURN</span>
                </div>
                <div className="dm-modal-detail-row">
                  <span className="label">DAO Tier</span>
                  <span className="value">{daoTier}</span>
                </div>
              </div>

              {modalStatus === 'success' && (
                <button 
                  className="dm-modal-btn" 
                  onClick={() => setShowModal(false)}
                  data-testid="button-modal-confirm"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
