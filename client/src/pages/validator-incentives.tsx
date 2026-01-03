import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";

interface ValidatorStatsData {
  totalValidators: number;
  activeValidators: number;
  totalStaked: number;
  totalRewardsDistributed: number;
  averageApy: number;
  tiers: Array<{
    name: string;
    slots: number;
    filled: number;
    reward: number;
  }>;
  topValidators: Array<{
    name: string;
    stake: number;
    rewards: number;
  }>;
}

interface ValidatorStatsResponse {
  success: boolean;
  data: ValidatorStatsData;
}

export default function ValidatorIncentivesPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [countdown, setCountdown] = useState({ days: 12, hours: 8, mins: 45, secs: 30 });
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();

  const { data: response, isLoading } = useQuery<ValidatorStatsResponse>({
    queryKey: ['/api/token-programs/validator-incentives/stats'],
  });
  const stats = response?.data;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, mins, secs } = prev;
        secs--;
        if (secs < 0) { secs = 59; mins--; }
        if (mins < 0) { mins = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; mins = 0; secs = 0; }
        return { days, hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect("metamask");
    }
  };

  const distributions = [
    { id: "early", icon: "🏆", name: "얼리버드 보너스", amount: "2.25억", percent: "30%" },
    { id: "loyalty", icon: "💎", name: "장기 충성 보상", amount: "1.875억", percent: "25%" },
    { id: "performance", icon: "⚡", name: "성능 인센티브", amount: "1.5억", percent: "20%" },
    { id: "growth", icon: "📈", name: "네트워크 성장", amount: "1.125억", percent: "15%" },
    { id: "governance", icon: "🏛️", name: "거버넌스 보너스", amount: "0.75억", percent: "10%" },
  ];

  const tiers = [
    { id: "genesis", icon: "👑", name: "Genesis Validator", range: "1~25번째", reward: "100,000", benefits: ["100% 얼리버드 보너스", "독점 Genesis NFT 뱃지", "평생 0% 수수료 우대", "거버넌스 2x 투표권", "VIP 전용 채널 접근"], slots: "2/25", slotsClass: "limited", badge: "프리미엄" },
    { id: "pioneer", icon: "🚀", name: "Pioneer Validator", range: "26~75번째", reward: "50,000", benefits: ["75% 얼리버드 보너스", "Pioneer NFT 뱃지", "0.5% 수수료 우대", "거버넌스 1.5x 투표권", "얼리 액세스 권한"], slots: "18/50", slotsClass: "available", badge: "추천" },
    { id: "early", icon: "🌟", name: "Early Validator", range: "76~125번째", reward: "25,000", benefits: ["50% 얼리버드 보너스", "Early NFT 뱃지", "1% 수수료 우대", "거버넌스 1.25x 투표권", "커뮤니티 리더 인정"], slots: "32/50", slotsClass: "available", badge: "오픈" },
  ];

  const loyaltyTiers = [
    { year: "1년", multiplier: "1.5x", desc: "기본 충성 보너스" },
    { year: "2년", multiplier: "2.0x", desc: "실버 멤버십" },
    { year: "3년", multiplier: "2.5x", desc: "골드 멤버십" },
    { year: "4년+", multiplier: "3.0x", desc: "다이아몬드 멤버십" },
  ];

  const performanceTypes = [
    { id: "uptime", icon: "📊", title: "업타임 보너스", subtitle: "안정적인 네트워크 운영", tiers: [{ badge: "gold", condition: "99.9%+", reward: "+15%" }, { badge: "silver", condition: "99.5%+", reward: "+10%" }, { badge: "bronze", condition: "99.0%+", reward: "+5%" }] },
    { id: "blocks", icon: "⛏️", title: "블록 생산 보너스", subtitle: "효율적인 블록 생성", tiers: [{ badge: "gold", condition: "상위 10%", reward: "+20%" }, { badge: "silver", condition: "상위 30%", reward: "+12%" }, { badge: "bronze", condition: "상위 50%", reward: "+5%" }] },
    { id: "clean", icon: "🛡️", title: "무위반 보너스", subtitle: "슬래싱 0회 유지", tiers: [{ badge: "gold", condition: "1년 무위반", reward: "+25%" }, { badge: "silver", condition: "6개월 무위반", reward: "+15%" }, { badge: "bronze", condition: "3개월 무위반", reward: "+8%" }] },
  ];

  const leaderboard = [
    { rank: 1, name: "TBURN Genesis", tier: "Genesis", points: "2,450,000", rewards: "125,000" },
    { rank: 2, name: "CryptoNode Pro", tier: "Genesis", points: "2,180,000", rewards: "98,000" },
    { rank: 3, name: "BlockMaster", tier: "Pioneer", points: "1,950,000", rewards: "72,000" },
    { rank: 4, name: "Korea Node", tier: "Pioneer", points: "1,720,000", rewards: "58,000" },
    { rank: 5, name: "DeFi Validator", tier: "Early", points: "1,580,000", rewards: "45,000" },
  ];

  return (
    <div className="validator-incentives-page">
      <style>{`
        .validator-incentives-page {
          --navy: #1A365D;
          --gold: #D4AF37;
          --dark: #0F172A;
          --dark-card: #1E293B;
          --gray: #64748B;
          --light-gray: #94A3B8;
          --white: #FFFFFF;
          --success: #22C55E;
          --warning: #F59E0B;
          --danger: #EF4444;
          --purple: #8B5CF6;
          --blue: #3B82F6;
          --cyan: #06B6D4;
          --pink: #EC4899;
          --emerald: #10B981;
          --orange: #F97316;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-validator: linear-gradient(135deg, #F97316 0%, #F59E0B 100%);
          --gradient-loyalty: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          --gradient-performance: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); } 50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6); } }
        @keyframes shine { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes trophy { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

        .incentive-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: var(--gradient-gold);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--white);
        }

        .logo-text span { color: var(--gold); }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-links a {
          color: var(--light-gray);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-links a:hover { color: var(--orange); }

        .connect-btn {
          background: var(--gradient-validator);
          color: var(--white);
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                      var(--gradient-dark);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .hero-bg::before {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%);
          top: -300px;
          right: -200px;
          animation: float 10s ease-in-out infinite;
        }

        .hero-content {
          max-width: 1200px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--orange);
          margin-bottom: 2rem;
        }

        .badge .trophy-icon { animation: trophy 1s ease-in-out infinite; display: inline-block; }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-validator);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--light-gray);
          max-width: 700px;
          margin: 0 auto 3rem;
        }

        .early-bird-banner {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(245, 158, 11, 0.2), rgba(249, 115, 22, 0.2));
          border: 2px solid rgba(249, 115, 22, 0.4);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          animation: glow 3s infinite;
        }

        .early-bird-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: shine 3s infinite;
        }

        .early-bird-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .early-bird-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .early-bird-icon {
          font-size: 2.5rem;
          animation: trophy 1s ease-in-out infinite;
        }

        .early-bird-text h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--orange);
          margin-bottom: 0.25rem;
        }

        .early-bird-text p {
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .early-bird-countdown {
          text-align: center;
        }

        .early-bird-countdown .label {
          font-size: 0.75rem;
          color: var(--gray);
          margin-bottom: 0.5rem;
        }

        .countdown-timer {
          display: flex;
          gap: 0.75rem;
        }

        .countdown-item {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          text-align: center;
          min-width: 50px;
        }

        .countdown-item .value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--orange);
        }

        .countdown-item .unit {
          font-size: 0.6rem;
          color: var(--gray);
          text-transform: uppercase;
        }

        .early-bird-slots {
          text-align: right;
        }

        .early-bird-slots .available {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--success);
        }

        .early-bird-slots .total {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.3s, border-color 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--orange);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-validator);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .cta-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: var(--gradient-validator);
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(249, 115, 22, 0.4);
        }

        .btn-secondary {
          background: transparent;
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          border-color: var(--orange);
          color: var(--orange);
        }

        .section {
          padding: 100px 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-block;
          background: rgba(249, 115, 22, 0.15);
          color: var(--orange);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          color: var(--light-gray);
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }

        .dist-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .dist-card:hover {
          transform: translateY(-5px);
          border-color: var(--orange);
        }

        .dist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .dist-card.early::before { background: var(--gradient-validator); }
        .dist-card.loyalty::before { background: var(--gradient-loyalty); }
        .dist-card.performance::before { background: var(--gradient-performance); }
        .dist-card.growth::before { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
        .dist-card.governance::before { background: var(--gradient-gold); }

        .dist-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .dist-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dist-amount { font-size: 1.25rem; font-weight: 800; color: var(--orange); margin-bottom: 0.25rem; }
        .dist-percent { font-size: 0.8rem; color: var(--gray); }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .tier-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.genesis { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.pioneer { border-color: var(--purple); }
        .tier-card.early { border-color: var(--cyan); }

        .tier-header {
          padding: 2rem;
          text-align: center;
          position: relative;
        }

        .tier-card.genesis .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.2) 0%, transparent 100%); }
        .tier-card.pioneer .tier-header { background: linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, transparent 100%); }
        .tier-card.early .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.2) 0%, transparent 100%); }

        .tier-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .tier-card.genesis .tier-badge { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.pioneer .tier-badge { background: var(--purple); color: var(--white); }
        .tier-card.early .tier-badge { background: var(--cyan); color: var(--dark); }

        .tier-icon { font-size: 4rem; margin-bottom: 1rem; }

        .tier-name {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .tier-card.genesis .tier-name { color: var(--gold); }
        .tier-card.pioneer .tier-name { color: var(--purple); }
        .tier-card.early .tier-name { color: var(--cyan); }

        .tier-range { font-size: 0.9rem; color: var(--gray); }

        .tier-content { padding: 1.5rem 2rem 2rem; }

        .tier-reward {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .tier-reward-label { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }

        .tier-reward-value { font-size: 2rem; font-weight: 900; }

        .tier-card.genesis .tier-reward-value { color: var(--gold); }
        .tier-card.pioneer .tier-reward-value { color: var(--purple); }
        .tier-card.early .tier-reward-value { color: var(--cyan); }

        .tier-benefits { list-style: none; margin-bottom: 1.5rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.9rem;
          color: var(--light-gray);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-benefits li:last-child { border-bottom: none; }
        .tier-benefits li::before { content: '✓'; color: var(--success); }

        .tier-slots {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .tier-slots-label { font-size: 0.875rem; color: var(--gray); }

        .tier-slots-value { font-weight: 700; }
        .tier-slots-value.available { color: var(--success); }
        .tier-slots-value.limited { color: var(--warning); }

        .tier-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .tier-card.genesis .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.pioneer .tier-btn { background: var(--purple); color: var(--white); }
        .tier-card.early .tier-btn { background: var(--cyan); color: var(--dark); }

        .tier-btn:hover { transform: scale(1.02); }

        .loyalty-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .loyalty-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .loyalty-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .loyalty-timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 3rem 0;
        }

        .loyalty-timeline::before {
          content: '';
          position: absolute;
          top: 40px;
          left: 10%;
          right: 10%;
          height: 4px;
          background: linear-gradient(90deg, var(--purple), var(--pink), var(--orange), var(--gold));
          border-radius: 2px;
        }

        .loyalty-item {
          text-align: center;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .loyalty-dot {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.5rem;
          border: 4px solid var(--dark);
        }

        .loyalty-item:nth-child(1) .loyalty-dot { background: var(--purple); }
        .loyalty-item:nth-child(2) .loyalty-dot { background: var(--pink); }
        .loyalty-item:nth-child(3) .loyalty-dot { background: var(--orange); }
        .loyalty-item:nth-child(4) .loyalty-dot { background: var(--gold); color: var(--dark); }

        .loyalty-year { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem; }

        .loyalty-multiplier { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }

        .loyalty-item:nth-child(1) .loyalty-multiplier { color: var(--purple); }
        .loyalty-item:nth-child(2) .loyalty-multiplier { color: var(--pink); }
        .loyalty-item:nth-child(3) .loyalty-multiplier { color: var(--orange); }
        .loyalty-item:nth-child(4) .loyalty-multiplier { color: var(--gold); }

        .loyalty-desc { font-size: 0.8rem; color: var(--gray); }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .performance-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .performance-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .performance-card.uptime::before { background: var(--gradient-performance); }
        .performance-card.blocks::before { background: var(--gradient-validator); }
        .performance-card.clean::before { background: var(--gradient-gold); }

        .performance-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .performance-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .performance-card.uptime .performance-icon { background: rgba(16, 185, 129, 0.2); }
        .performance-card.blocks .performance-icon { background: rgba(249, 115, 22, 0.2); }
        .performance-card.clean .performance-icon { background: rgba(212, 175, 55, 0.2); }

        .performance-title { font-size: 1.25rem; font-weight: 700; }
        .performance-subtitle { font-size: 0.875rem; color: var(--gray); }

        .performance-tiers {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .perf-tier {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .perf-tier-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .perf-tier-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .perf-tier-badge.gold { background: rgba(212, 175, 55, 0.2); color: var(--gold); }
        .perf-tier-badge.silver { background: rgba(148, 163, 184, 0.2); color: var(--light-gray); }
        .perf-tier-badge.bronze { background: rgba(205, 127, 50, 0.2); color: #CD7F32; }

        .perf-tier-condition { font-size: 0.875rem; color: var(--light-gray); }
        .perf-tier-reward { font-weight: 700; color: var(--gold); }

        .leaderboard-section {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
        }

        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .leaderboard-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leaderboard-table th {
          text-align: left;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .leaderboard-table th:first-child { border-radius: 12px 0 0 12px; }
        .leaderboard-table th:last-child { border-radius: 0 12px 12px 0; }

        .leaderboard-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .leaderboard-table tr:hover td { background: rgba(255, 255, 255, 0.02); }

        .rank-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-weight: 800;
        }

        .rank-cell.gold { background: var(--gradient-gold); color: var(--dark); }
        .rank-cell.silver { background: linear-gradient(135deg, #C0C0C0, #E8E8E8); color: var(--dark); }
        .rank-cell.bronze { background: linear-gradient(135deg, #CD7F32, #E8A65D); color: var(--dark); }
        .rank-cell.normal { background: rgba(255, 255, 255, 0.1); color: var(--light-gray); }

        .validator-cell { display: flex; align-items: center; gap: 12px; }

        .validator-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .validator-avatar.genesis { background: var(--gradient-gold); color: var(--dark); }
        .validator-avatar.pioneer { background: var(--purple); }
        .validator-avatar.early { background: var(--cyan); color: var(--dark); }

        .validator-name { font-weight: 600; }
        .validator-tier { font-size: 0.75rem; color: var(--gray); }

        .points-cell { font-weight: 700; color: var(--orange); }
        .rewards-cell { font-weight: 700; color: var(--gold); }

        .faq-container { max-width: 900px; margin: 0 auto; }

        .faq-item {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .faq-question {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.3s;
        }

        .faq-question:hover { background: rgba(255, 255, 255, 0.03); }
        .faq-question h4 { font-size: 1.1rem; font-weight: 600; }

        .faq-chevron {
          color: var(--orange);
          transition: transform 0.3s;
        }

        .faq-item.active .faq-chevron { transform: rotate(180deg); }

        .faq-answer {
          padding: 0 1.5rem;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item.active .faq-answer {
          padding: 0 1.5rem 1.5rem;
          max-height: 500px;
        }

        .faq-answer p { color: var(--light-gray); line-height: 1.8; }

        .cta-section {
          padding: 100px 2rem;
          background: var(--gradient-validator);
          text-align: center;
        }

        .footer {
          background: var(--dark);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 60px 2rem 30px;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .footer-brand h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .footer-brand h3 span { color: var(--gold); }
        .footer-brand p { color: var(--light-gray); margin-bottom: 1.5rem; }

        .social-links { display: flex; gap: 1rem; }

        .social-links a {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--light-gray);
          transition: all 0.3s;
        }

        .social-links a:hover { background: var(--orange); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--orange); }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--gray);
          font-size: 0.875rem;
        }

        @media (max-width: 1200px) {
          .tiers-grid, .performance-grid { grid-template-columns: 1fr; }
          .distribution-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .distribution-grid { grid-template-columns: repeat(2, 1fr); }
          .loyalty-timeline { flex-wrap: wrap; gap: 2rem; }
          .loyalty-timeline::before { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .distribution-grid { grid-template-columns: 1fr; }
          .early-bird-content { flex-direction: column; text-align: center; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="incentive-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">티어</a>
            <a href="#loyalty">충성 보상</a>
            <a href="#performance">성능 보상</a>
            <a href="#leaderboard">리더보드</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button 
            className="connect-btn" 
            data-testid="button-connect-wallet"
            onClick={handleWalletClick}
          >
            {isConnected && address ? `🔗 ${formatAddress(address)}` : '🔗 지갑 연결'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="trophy-icon">🏆</span> VALIDATOR INCENTIVES - 검증자 인센티브
          </div>
          <h1>
            밸리데이터를 위한<br />
            <span className="gradient-text">7.5억 TBURN</span> 인센티브
          </h1>
          <p className="hero-subtitle">
            얼리버드 보너스, 장기 충성 보상, 성능 인센티브까지!
            TBURN Chain 밸리데이터가 되어 최대 300% 추가 보상을 받으세요!
          </p>

          <div className="early-bird-banner" data-testid="early-bird-banner">
            <div className="early-bird-content">
              <div className="early-bird-left">
                <span className="early-bird-icon">🦅</span>
                <div className="early-bird-text">
                  <h3>얼리버드 프로그램 진행중!</h3>
                  <p>지금 참여하면 최대 100,000 TBURN 보너스</p>
                </div>
              </div>
              <div className="early-bird-countdown">
                <div className="label">마감까지</div>
                <div className="countdown-timer">
                  <div className="countdown-item">
                    <div className="value" data-testid="countdown-days">{countdown.days}</div>
                    <div className="unit">일</div>
                  </div>
                  <div className="countdown-item">
                    <div className="value" data-testid="countdown-hours">{countdown.hours}</div>
                    <div className="unit">시간</div>
                  </div>
                  <div className="countdown-item">
                    <div className="value" data-testid="countdown-mins">{countdown.mins}</div>
                    <div className="unit">분</div>
                  </div>
                  <div className="countdown-item">
                    <div className="value" data-testid="countdown-secs">{countdown.secs}</div>
                    <div className="unit">초</div>
                  </div>
                </div>
              </div>
              <div className="early-bird-slots">
                <div className="available" data-testid="slots-available">{isLoading ? '...' : stats?.activeValidators ? `${stats.activeValidators}/${stats.totalValidators}` : '52/125'}</div>
                <div className="total">잔여 슬롯</div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-validators">
              <div className="stat-value">{isLoading ? '...' : stats?.totalValidators?.toLocaleString() || '7.5억'}</div>
              <div className="stat-label">총 인센티브 풀</div>
            </div>
            <div className="stat-card" data-testid="stat-active-validators">
              <div className="stat-value">{isLoading ? '...' : stats?.activeValidators?.toLocaleString() || '300%'}</div>
              <div className="stat-label">최대 추가 보상</div>
            </div>
            <div className="stat-card" data-testid="stat-total-staked">
              <div className="stat-value">{isLoading ? '...' : stats?.totalStaked?.toLocaleString() || '125'}</div>
              <div className="stat-label">Genesis 밸리데이터</div>
            </div>
            <div className="stat-card" data-testid="stat-average-apy">
              <div className="stat-value">{isLoading ? '...' : stats?.averageApy ? `~${stats.averageApy}%` : '~50%'}</div>
              <div className="stat-label">최대 예상 APY</div>
            </div>
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-join-validator">
              🏆 지금 참여하기
            </button>
            <button className="btn-secondary">
              📖 자세히 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">DISTRIBUTION</span>
          <h2 className="section-title">인센티브 배분</h2>
          <p className="section-subtitle">7.5억 TBURN이 5가지 카테고리로 배분됩니다</p>
        </div>

        <div className="distribution-grid">
          {distributions.map(dist => (
            <div key={dist.id} className={`dist-card ${dist.id}`} data-testid={`dist-${dist.id}`}>
              <div className="dist-icon">{dist.icon}</div>
              <div className="dist-name">{dist.name}</div>
              <div className="dist-amount">{dist.amount}</div>
              <div className="dist-percent">{dist.percent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">EARLY BIRD</span>
          <h2 className="section-title">얼리 밸리데이터 티어</h2>
          <p className="section-subtitle">참여 순서에 따른 차등 보상 시스템</p>
        </div>

        <div className="tiers-grid">
          {tiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <span className="tier-badge">{tier.badge}</span>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-range">{tier.range} 참여자</p>
              </div>
              <div className="tier-content">
                <div className="tier-reward">
                  <div className="tier-reward-label">얼리버드 보너스</div>
                  <div className="tier-reward-value">{tier.reward} TBURN</div>
                </div>
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <div className="tier-slots">
                  <span className="tier-slots-label">잔여 슬롯</span>
                  <span className={`tier-slots-value ${tier.slotsClass}`}>{tier.slots}</span>
                </div>
                <button className="tier-btn">지금 신청하기</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Loyalty Section */}
      <section className="section" id="loyalty">
        <div className="section-header">
          <span className="section-badge">LOYALTY</span>
          <h2 className="section-title">장기 충성 보상</h2>
          <p className="section-subtitle">오래 함께할수록 더 많은 보상</p>
        </div>

        <div className="loyalty-container">
          <div className="loyalty-header">
            <h3>💎 충성도 멀티플라이어</h3>
            <p style={{ color: 'var(--light-gray)' }}>스테이킹 기간에 따라 보상이 증가합니다</p>
          </div>

          <div className="loyalty-timeline">
            {loyaltyTiers.map((tier, idx) => (
              <div key={idx} className="loyalty-item">
                <div className="loyalty-dot">{idx + 1}</div>
                <div className="loyalty-year">{tier.year}</div>
                <div className="loyalty-multiplier">{tier.multiplier}</div>
                <div className="loyalty-desc">{tier.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="section" id="performance" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">PERFORMANCE</span>
          <h2 className="section-title">성능 인센티브</h2>
          <p className="section-subtitle">우수한 성능에 대한 추가 보상</p>
        </div>

        <div className="performance-grid">
          {performanceTypes.map(perf => (
            <div key={perf.id} className={`performance-card ${perf.id}`} data-testid={`perf-${perf.id}`}>
              <div className="performance-header">
                <div className="performance-icon">{perf.icon}</div>
                <div>
                  <h4 className="performance-title">{perf.title}</h4>
                  <p className="performance-subtitle">{perf.subtitle}</p>
                </div>
              </div>
              <div className="performance-tiers">
                {perf.tiers.map((tier, idx) => (
                  <div key={idx} className="perf-tier">
                    <div className="perf-tier-left">
                      <span className={`perf-tier-badge ${tier.badge}`}>
                        {tier.badge === 'gold' ? 'Gold' : tier.badge === 'silver' ? 'Silver' : 'Bronze'}
                      </span>
                      <span className="perf-tier-condition">{tier.condition}</span>
                    </div>
                    <span className="perf-tier-reward">{tier.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="section" id="leaderboard">
        <div className="section-header">
          <span className="section-badge">LEADERBOARD</span>
          <h2 className="section-title">인센티브 리더보드</h2>
          <p className="section-subtitle">가장 많은 보상을 받은 밸리데이터</p>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h3>🏆 Top Validators</h3>
          </div>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>밸리데이터</th>
                <th>포인트</th>
                <th>누적 보상</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((validator, idx) => (
                <tr key={idx}>
                  <td>
                    <div className={`rank-cell ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal'}`}>
                      {validator.rank}
                    </div>
                  </td>
                  <td>
                    <div className="validator-cell">
                      <div className={`validator-avatar ${validator.tier.toLowerCase()}`}>
                        {validator.name.charAt(0)}
                      </div>
                      <div>
                        <div className="validator-name">{validator.name}</div>
                        <div className="validator-tier">{validator.tier} Tier</div>
                      </div>
                    </div>
                  </td>
                  <td className="points-cell">{validator.points} pts</td>
                  <td className="rewards-cell">{validator.rewards} TBURN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">인센티브 프로그램에 대해 궁금한 점</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>얼리버드 보너스는 어떻게 받나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>Genesis(1~25번째), Pioneer(26~75번째), Early(76~125번째) 티어로 구분되며, 참여 순서에 따라 자동으로 티어가 결정됩니다. 보너스는 첫 스테이킹 시점에 즉시 지급됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>충성 보상 멀티플라이어는 어떻게 적용되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>스테이킹을 유지한 기간에 따라 자동으로 멀티플라이어가 적용됩니다. 1년 후 1.5x, 2년 후 2.0x, 3년 후 2.5x, 4년 이상 3.0x가 적용되어 기본 보상에 곱해집니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>성능 보너스는 어떻게 계산되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>업타임, 블록 생산량, 무위반 기록을 기준으로 매월 정산됩니다. 각 항목별로 Gold/Silver/Bronze 등급이 부여되며, 해당 등급에 따른 보너스가 기본 보상에 추가됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>보너스를 최대로 받으려면 어떻게 해야 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>Genesis 티어로 참여(+100%), 4년 이상 스테이킹(3.0x), 모든 성능 지표 Gold 등급(+60%) 달성 시 최대 300%의 추가 보상을 받을 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>지금 밸리데이터가 되세요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            얼리버드 슬롯이 빠르게 마감되고 있습니다!<br />
            지금 참여하고 최대 7.5억 TBURN 인센티브를 받으세요!
          </p>
          <button className="connect-btn" style={{ background: 'var(--white)', color: 'var(--orange)', fontSize: '1.25rem', padding: '20px 50px' }}>
            🏆 지금 신청하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>AI의 지능, 블록체인의 투명성<br />THE FUTURE IS NOW</p>
            <div className="social-links">
              <a href="#">𝕏</a>
              <a href="#">✈</a>
              <a href="#">💬</a>
              <a href="#">⌘</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li><Link href="/">메인넷</Link></li>
              <li><Link href="/scan">익스플로러</Link></li>
              <li><Link href="/app/bridge">브릿지</Link></li>
              <li><Link href="/app/staking">스테이킹</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><Link href="/learn/whitepaper">백서</Link></li>
              <li><Link href="/developers/docs">문서</Link></li>
              <li><a href="#">GitHub</a></li>
              <li><Link href="/security-audit">감사 보고서</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><Link href="/community/news">블로그</Link></li>
              <li><a href="#">앰배서더</a></li>
              <li><a href="#">그랜트</a></li>
              <li><Link href="/qna">고객지원</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/legal/terms-of-service" style={{ color: 'var(--gray)', textDecoration: 'none' }}>이용약관</Link>
            <Link href="/legal/privacy-policy" style={{ color: 'var(--gray)', textDecoration: 'none' }}>개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
