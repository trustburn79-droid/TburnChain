import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TBurnLogo } from "@/components/tburn-logo";
import { useWeb3 } from "@/lib/web3-context";

interface InvestmentRound {
  name: string;
  status: string;
  allocation: string;
  price: string;
  raised: string;
  investors: number;
  vesting: string;
  unlocked: string;
}

interface InvestmentRoundsStatsData {
  rounds: InvestmentRound[];
  totalRaised: string;
  totalInvestors: number;
  nextUnlock: string;
}

interface InvestmentRoundsStatsResponse {
  success: boolean;
  data: InvestmentRoundsStatsData;
}

export default function PublicRoundPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");
  const [investAmount, setInvestAmount] = useState(1000);
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();

  const { data: response, isLoading } = useQuery<InvestmentRoundsStatsResponse>({
    queryKey: ['/api/token-programs/investment-rounds/stats'],
  });
  const stats = response?.data;

  const publicRound = stats?.rounds?.find(r => r.name.toLowerCase().includes('public'));

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect("metamask");
    }
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const investmentHighlights = [
    { value: "$0.025", label: "토큰당 가격", compare: "" },
    { value: "20%", label: "시장가 대비 할인", compare: "" },
    { value: "15%", label: "TGE 즉시 해제", compare: "" },
    { value: "$100", label: "최소 참여금액", compare: "" },
  ];

  const distributions = [
    { id: "seed", name: "Seed Round", amount: "$0.008", discount: "70%", status: "completed" },
    { id: "private", name: "Private Round", amount: "$0.015", discount: "50%", status: "completed" },
    { id: "public", name: "Public Round", amount: "$0.025", discount: "20%", status: "current" },
  ];

  const participationTiers = [
    { id: "whale", icon: "🐋", name: "Whale", subtitle: "대형 참여자", amount: "$50K+", details: [{ label: "최소 참여", value: "$50,000" }, { label: "추가 보너스", value: "+5%" }, { label: "TGE 해제", value: "20%" }], benefits: ["VIP 커뮤니티 접근", "에어드랍 우선권", "전용 AMA 초대", "얼리 알파 정보", "전담 지원"] },
    { id: "dolphin", icon: "🐬", name: "Dolphin", subtitle: "중형 참여자", amount: "$10K+", details: [{ label: "최소 참여", value: "$10,000" }, { label: "추가 보너스", value: "+3%" }, { label: "TGE 해제", value: "17%" }], benefits: ["프리미엄 커뮤니티", "에어드랍 참여", "분기 AMA", "뉴스레터", "우선 지원"] },
    { id: "fish", icon: "🐟", name: "Fish", subtitle: "일반 참여자", amount: "$1K+", details: [{ label: "최소 참여", value: "$1,000" }, { label: "추가 보너스", value: "+1%" }, { label: "TGE 해제", value: "15%" }], benefits: ["일반 커뮤니티", "기본 에어드랍", "공개 AMA", "월간 업데이트", "일반 지원"] },
    { id: "shrimp", icon: "🦐", name: "Shrimp", subtitle: "소액 참여자", amount: "$100+", details: [{ label: "최소 참여", value: "$100" }, { label: "추가 보너스", value: "-" }, { label: "TGE 해제", value: "15%" }], benefits: ["공개 채널 접근", "기본 참여", "공개 정보", "이메일 알림", "커뮤니티 지원"] },
  ];

  const vestingPhases = [
    { icon: "🎉", title: "TGE 해제", value: "15%", desc: "즉시 해제" },
    { icon: "⏳", title: "클리프 없음", value: "0개월", desc: "바로 시작" },
    { icon: "📈", title: "월간 베스팅", value: "14.2%", desc: "6개월간" },
    { icon: "✅", title: "완전 언락", value: "100%", desc: "6개월 후" },
  ];

  const participateSteps = [
    { step: 1, icon: "👛", title: "지갑 연결", desc: "MetaMask, Trust 등 지원" },
    { step: 2, icon: "✅", title: "KYC 인증", desc: "간단한 본인 인증" },
    { step: 3, icon: "💳", title: "결제 선택", desc: "USDT, USDC, ETH, BTC" },
    { step: 4, icon: "🎉", title: "토큰 수령", desc: "TGE 15% 즉시 지급" },
  ];

  const platforms = [
    { icon: "🌐", name: "TBURN Launchpad", type: "공식 런치패드", desc: "TBURN 공식 세일 플랫폼", features: ["최저 수수료", "직접 참여", "24/7 지원", "다중 결제 지원"] },
    { icon: "🏛️", name: "파트너 거래소", type: "CEX IEO", desc: "파트너 거래소 통한 참여", features: ["간편한 KYC", "법정화폐 지원", "거래소 보증", "즉시 상장"] },
    { icon: "🦄", name: "DEX 런치패드", type: "탈중앙화 IDO", desc: "탈중앙화 플랫폼 참여", features: ["지갑 직접 연결", "스마트컨트랙트", "투명한 배분", "커뮤니티 주도"] },
  ];

  const quickAmounts = [100, 500, 1000, 5000, 10000];
  const tokenPrice = 0.025;
  const tokensReceived = investAmount / tokenPrice;
  const listingPrice = 0.031;
  const potentialValue = tokensReceived * listingPrice;
  const potentialProfit = potentialValue - investAmount;

  return (
    <div className="public-round-page">
      <style>{`
        .public-round-page {
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
          --emerald: #10B981;
          --indigo: #6366F1;
          --violet: #7C3AED;
          --sky: #0EA5E9;
          --public-primary: #3B82F6;
          --public-secondary: #2563EB;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-public: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes rocket { 0%, 100% { transform: translateY(0) rotate(-45deg); } 50% { transform: translateY(-10px) rotate(-45deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); } }
        @keyframes progressFill { 0% { width: 0%; } 100% { width: 45%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes countdown { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

        .public-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
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

        .logo-text { font-size: 1.5rem; font-weight: 800; color: var(--white); }
        .logo-text span { color: var(--gold); }

        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--light-gray); text-decoration: none; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: var(--public-primary); }

        .connect-btn {
          background: var(--gradient-public);
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
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
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
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
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
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--public-primary);
          margin-bottom: 2rem;
        }

        .badge .rocket-icon { animation: rocket 2s ease-in-out infinite; display: inline-block; }

        .round-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success);
          margin-left: 10px;
        }

        .round-status .dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gradient-text {
          background: var(--gradient-public);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--light-gray);
          max-width: 750px;
          margin: 0 auto 2rem;
        }

        .countdown-container {
          background: var(--dark-card);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .countdown-label {
          font-size: 0.9rem;
          color: var(--public-primary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .countdown-timer {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }

        .countdown-item { text-align: center; }

        .countdown-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--white);
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          padding: 0.5rem 1rem;
          min-width: 80px;
          animation: countdown 2s ease-in-out infinite;
        }

        .countdown-unit { font-size: 0.75rem; color: var(--gray); margin-top: 0.5rem; }

        .fundraise-progress {
          background: var(--dark-card);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--public-primary); }
        .progress-header .goal { font-size: 1rem; color: var(--gray); }

        .progress-bar {
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-public);
          border-radius: 100px;
          width: 45%;
          position: relative;
          animation: progressFill 2s ease-out;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .progress-stats .percent { color: var(--public-primary); font-weight: 700; }
        .progress-stats .remaining { color: var(--gray); }

        .investment-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .highlight-card {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .highlight-card .value { font-size: 1.75rem; font-weight: 800; color: var(--public-primary); margin-bottom: 0.25rem; }
        .highlight-card .label { font-size: 0.85rem; color: var(--light-gray); }

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
          border-color: var(--public-primary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-public);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.875rem; color: var(--light-gray); }

        .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .btn-primary {
          background: var(--gradient-public);
          color: var(--white);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          animation: glow 2s ease-in-out infinite;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
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

        .btn-secondary:hover { border-color: var(--public-primary); color: var(--public-primary); }

        .section { padding: 100px 2rem; max-width: 1400px; margin: 0 auto; }

        .section-header { text-align: center; margin-bottom: 4rem; }

        .section-badge {
          display: inline-block;
          background: rgba(59, 130, 246, 0.15);
          color: var(--public-primary);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .section-subtitle { color: var(--light-gray); font-size: 1.125rem; max-width: 600px; margin: 0 auto; }

        .round-comparison {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .comparison-header {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-header h3 { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }

        .comparison-table { width: 100%; border-collapse: collapse; }

        .comparison-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--light-gray);
        }

        .comparison-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .comparison-table tr:hover td { background: rgba(255, 255, 255, 0.02); }
        .comparison-table tr.highlight td { background: rgba(59, 130, 246, 0.1); }

        .round-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .round-badge.seed { background: rgba(34, 197, 94, 0.2); color: var(--success); }
        .round-badge.private { background: rgba(139, 92, 246, 0.2); color: var(--purple); }
        .round-badge.public { background: rgba(59, 130, 246, 0.2); color: var(--public-primary); }
        .round-badge.current { animation: glow 2s ease-in-out infinite; }

        .best-badge {
          background: rgba(34, 197, 94, 0.2);
          color: var(--success);
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-left: 8px;
        }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .tier-card {
          background: var(--dark-card);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .tier-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .tier-card.whale { border-color: var(--gold); box-shadow: 0 0 40px rgba(212, 175, 55, 0.2); }
        .tier-card.dolphin { border-color: var(--public-primary); }
        .tier-card.fish { border-color: var(--cyan); }
        .tier-card.shrimp { border-color: var(--emerald); }

        .tier-header { padding: 2rem 1.5rem; text-align: center; }

        .tier-card.whale .tier-header { background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%); }
        .tier-card.dolphin .tier-header { background: linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%); }
        .tier-card.fish .tier-header { background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%); }
        .tier-card.shrimp .tier-header { background: linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); }

        .tier-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tier-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }

        .tier-card.whale .tier-name { color: var(--gold); }
        .tier-card.dolphin .tier-name { color: var(--public-primary); }
        .tier-card.fish .tier-name { color: var(--cyan); }
        .tier-card.shrimp .tier-name { color: var(--emerald); }

        .tier-subtitle { font-size: 0.8rem; color: var(--gray); }

        .tier-content { padding: 1.5rem; }

        .tier-amount {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .tier-amount .label { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.25rem; }
        .tier-amount .value { font-size: 1.5rem; font-weight: 800; }

        .tier-card.whale .tier-amount .value { color: var(--gold); }
        .tier-card.dolphin .tier-amount .value { color: var(--public-primary); }
        .tier-card.fish .tier-amount .value { color: var(--cyan); }
        .tier-card.shrimp .tier-amount .value { color: var(--emerald); }

        .tier-details { margin-bottom: 1rem; }

        .tier-detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-detail-item:last-child { border-bottom: none; }
        .tier-detail-item .label { color: var(--gray); }
        .tier-detail-item .value { color: var(--white); font-weight: 600; }

        .tier-benefits { list-style: none; margin-bottom: 1rem; padding: 0; }

        .tier-benefits li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 0.8rem;
          color: var(--light-gray);
        }

        .tier-benefits li::before { content: '✓'; color: var(--success); font-size: 10px; }

        .tier-btn {
          display: block;
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .tier-card.whale .tier-btn { background: var(--gradient-gold); color: var(--dark); }
        .tier-card.dolphin .tier-btn { background: var(--gradient-public); color: var(--white); }
        .tier-card.fish .tier-btn { background: linear-gradient(135deg, var(--cyan), var(--blue)); color: var(--white); }
        .tier-card.shrimp .tier-btn { background: linear-gradient(135deg, var(--emerald), var(--cyan)); color: var(--white); }

        .tier-btn:hover { transform: scale(1.02); }

        .vesting-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .vesting-visual {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .vesting-phase {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          position: relative;
        }

        .vesting-phase::after {
          content: '→';
          position: absolute;
          right: -1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
          font-size: 1.25rem;
        }

        .vesting-phase:last-child::after { display: none; }

        .vesting-phase .icon { font-size: 2rem; margin-bottom: 0.75rem; }
        .vesting-phase .title { font-weight: 700; margin-bottom: 0.25rem; }
        .vesting-phase .value { font-size: 1.5rem; font-weight: 800; color: var(--public-primary); margin-bottom: 0.25rem; }
        .vesting-phase .desc { font-size: 0.8rem; color: var(--gray); }

        .participate-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .participate-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          position: relative;
          transition: all 0.3s;
        }

        .participate-card:hover {
          border-color: var(--public-primary);
          transform: translateY(-5px);
        }

        .participate-step {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: var(--gradient-public);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.125rem;
        }

        .participate-icon { font-size: 2.5rem; margin: 1rem 0; }

        .participate-card h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }
        .participate-card p { font-size: 0.85rem; color: var(--light-gray); }

        .platforms-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .platform-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
        }

        .platform-card:hover {
          border-color: var(--public-primary);
          transform: translateY(-5px);
        }

        .platform-logo {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .platform-card:nth-child(1) .platform-logo { background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2)); }
        .platform-card:nth-child(2) .platform-logo { background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(245, 158, 11, 0.2)); }
        .platform-card:nth-child(3) .platform-logo { background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2)); }

        .platform-card h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .platform-card .type { font-size: 0.85rem; color: var(--public-primary); margin-bottom: 1rem; }
        .platform-card p { font-size: 0.9rem; color: var(--light-gray); margin-bottom: 1.5rem; }

        .platform-features { list-style: none; text-align: left; margin-bottom: 1.5rem; padding: 0; }

        .platform-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 0.85rem;
          color: var(--light-gray);
        }

        .platform-features li::before { content: '✓'; color: var(--success); }

        .platform-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .platform-card:nth-child(1) .platform-btn { background: var(--gradient-public); color: var(--white); }
        .platform-card:nth-child(2) .platform-btn { background: var(--gradient-gold); color: var(--dark); }
        .platform-card:nth-child(3) .platform-btn { background: linear-gradient(135deg, var(--purple), var(--violet)); color: var(--white); }

        .platform-btn:hover { transform: scale(1.02); }

        .calculator-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .calculator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .calculator-input {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 2rem;
        }

        .calculator-input h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-group { margin-bottom: 1.5rem; }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          color: var(--gray);
          margin-bottom: 0.5rem;
        }

        .input-group input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .input-group input:focus { outline: none; border-color: var(--public-primary); }

        .quick-amounts { display: flex; gap: 0.5rem; flex-wrap: wrap; }

        .quick-amount {
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 100px;
          color: var(--public-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .quick-amount:hover { background: var(--public-primary); color: var(--white); }

        .calculator-result {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 2rem;
        }

        .calculator-result h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .result-item:last-child { margin-bottom: 0; }
        .result-item .label { color: var(--gray); }
        .result-item .value { font-weight: 700; }
        .result-item .value.highlight { color: var(--public-primary); font-size: 1.25rem; }
        .result-item .value.gold { color: var(--gold); }

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

        .faq-chevron { color: var(--public-primary); transition: transform 0.3s; }
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
          background: var(--gradient-public);
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

        .social-links a:hover { background: var(--public-primary); color: var(--white); }

        .footer-links h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .footer-links ul { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-links a { color: var(--light-gray); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--public-primary); }

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
          .tiers-grid, .participate-grid { grid-template-columns: repeat(2, 1fr); }
          .platforms-grid { grid-template-columns: 1fr; }
          .calculator-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .stats-grid, .investment-highlights { grid-template-columns: repeat(2, 1fr); }
          .vesting-visual { grid-template-columns: repeat(2, 1fr); }
          .vesting-phase::after { display: none; }
          .footer-content { grid-template-columns: 1fr 1fr; }
          .countdown-timer { flex-wrap: wrap; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero { padding: 100px 1rem 60px; }
          .stats-grid, .investment-highlights, .tiers-grid, .participate-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; gap: 2rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="public-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#tiers">참여 티어</a>
            <a href="#vesting">베스팅</a>
            <a href="#how">참여 방법</a>
            <a href="#calculator">계산기</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button 
            className="connect-btn" 
            onClick={handleWalletClick}
            data-testid="button-connect-wallet"
          >
            {isConnected ? formatAddress(address!) : "🚀 지금 참여하기"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="rocket-icon">🚀</span> PUBLIC ROUND - 공개 세일
            <span className="round-status"><span className="dot"></span> 진행중</span>
          </div>
          <h1>
            퍼블릭 라운드로<br />
            <span className="gradient-text">6억 TBURN</span> 기회를 잡으세요
          </h1>
          <p className="hero-subtitle">
            누구나 참여 가능한 공개 세일. 
            최소 $100부터 시작, TGE 15% 즉시 해제, 클리프 없음!
          </p>

          <div className="countdown-container" data-testid="countdown-timer">
            <div className="countdown-label">🔥 세일 종료까지</div>
            <div className="countdown-timer">
              <div className="countdown-item">
                <div className="countdown-value">14</div>
                <div className="countdown-unit">DAYS</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">08</div>
                <div className="countdown-unit">HOURS</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">32</div>
                <div className="countdown-unit">MINS</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">15</div>
                <div className="countdown-unit">SECS</div>
              </div>
            </div>
          </div>

          <div className="fundraise-progress" data-testid="fundraise-progress">
            <div className="progress-header">
              <span className="raised">$6,750,000</span>
              <span className="goal">목표 $15,000,000</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-stats">
              <span className="percent">45% 달성</span>
              <span className="remaining">$8,250,000 남음</span>
            </div>
          </div>

          <div className="investment-highlights" data-testid="investment-highlights">
            {investmentHighlights.map((item, idx) => (
              <div key={idx} className="highlight-card">
                <div className="value">{item.value}</div>
                <div className="label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="stats-grid">
            {isLoading ? (
              <div className="stat-card" data-testid="loading-indicator">
                <div className="stat-value" style={{ opacity: 0.5 }}>로딩중...</div>
              </div>
            ) : (
              <>
                <div className="stat-card" data-testid="stat-total-public">
                  <div className="stat-value">{publicRound?.allocation || "6억"}</div>
                  <div className="stat-label">퍼블릭 배정</div>
                </div>
                <div className="stat-card" data-testid="stat-price">
                  <div className="stat-value">{publicRound?.price || "$0.025"}</div>
                  <div className="stat-label">토큰 가격</div>
                </div>
                <div className="stat-card" data-testid="stat-hardcap">
                  <div className="stat-value">{publicRound?.raised || "$15M"}</div>
                  <div className="stat-label">하드캡</div>
                </div>
                <div className="stat-card" data-testid="stat-participants">
                  <div className="stat-value">{publicRound?.investors || 5200}+</div>
                  <div className="stat-label">참여자</div>
                </div>
              </>
            )}
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-apply-public">
              🚀 지금 참여하기
            </button>
            <button className="btn-secondary">
              📖 세일 가이드 보기
            </button>
          </div>
        </div>
      </section>

      {/* Round Comparison Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">COMPARISON</span>
          <h2 className="section-title">라운드 비교</h2>
          <p className="section-subtitle">퍼블릭 라운드의 장점을 확인하세요</p>
        </div>

        <div className="round-comparison">
          <div className="comparison-header">
            <h3>📊 투자 라운드 비교</h3>
          </div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>라운드</th>
                <th>토큰 가격</th>
                <th>할인율</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(round => (
                <tr key={round.id} className={round.status === 'current' ? 'highlight' : ''}>
                  <td>
                    <span className={`round-badge ${round.id} ${round.status === 'current' ? 'current' : ''}`}>
                      {round.id === 'public' ? '🚀' : '🔐'} {round.name}
                    </span>
                  </td>
                  <td>{round.amount}</td>
                  <td>
                    {round.discount}
                    {round.status === 'current' && <span className="best-badge">접근성 최고</span>}
                  </td>
                  <td>
                    {round.status === 'completed' ? '✅ 완료' : 
                     round.status === 'current' ? '🚀 진행중' : '⏳ 예정'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Participation Tiers Section */}
      <section className="section" id="tiers" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">TIERS</span>
          <h2 className="section-title">참여 티어</h2>
          <p className="section-subtitle">참여 금액별 혜택과 보너스</p>
        </div>

        <div className="tiers-grid">
          {participationTiers.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.id}`} data-testid={`tier-${tier.id}`}>
              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-subtitle">{tier.subtitle}</p>
              </div>
              <div className="tier-content">
                <div className="tier-amount">
                  <div className="label">최소 참여금</div>
                  <div className="value">{tier.amount}</div>
                </div>
                <div className="tier-details">
                  {tier.details.map((detail, idx) => (
                    <div key={idx} className="tier-detail-item">
                      <span className="label">{detail.label}</span>
                      <span className="value">{detail.value}</span>
                    </div>
                  ))}
                </div>
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                <button className="tier-btn">참여하기</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vesting Section */}
      <section className="section" id="vesting">
        <div className="section-header">
          <span className="section-badge">VESTING</span>
          <h2 className="section-title">베스팅 스케줄</h2>
          <p className="section-subtitle">TGE 15% 즉시 해제, 클리프 없음!</p>
        </div>

        <div className="vesting-container">
          <div className="vesting-visual">
            {vestingPhases.map((phase, idx) => (
              <div key={idx} className="vesting-phase">
                <div className="icon">{phase.icon}</div>
                <div className="title">{phase.title}</div>
                <div className="value">{phase.value}</div>
                <div className="desc">{phase.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Participate Section */}
      <section className="section" id="how" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">HOW TO</span>
          <h2 className="section-title">참여 방법</h2>
          <p className="section-subtitle">간단한 4단계로 참여하세요</p>
        </div>

        <div className="participate-grid">
          {participateSteps.map(step => (
            <div key={step.step} className="participate-card">
              <div className="participate-step">{step.step}</div>
              <div className="participate-icon">{step.icon}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">PLATFORMS</span>
          <h2 className="section-title">참여 플랫폼</h2>
          <p className="section-subtitle">다양한 방법으로 참여할 수 있습니다</p>
        </div>

        <div className="platforms-grid">
          {platforms.map((platform, idx) => (
            <div key={idx} className="platform-card">
              <div className="platform-logo">{platform.icon}</div>
              <h4>{platform.name}</h4>
              <div className="type">{platform.type}</div>
              <p>{platform.desc}</p>
              <ul className="platform-features">
                {platform.features.map((feature, fidx) => (
                  <li key={fidx}>{feature}</li>
                ))}
              </ul>
              <button className="platform-btn">참여하기</button>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator Section */}
      <section className="section" id="calculator" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">CALCULATOR</span>
          <h2 className="section-title">토큰 계산기</h2>
          <p className="section-subtitle">투자 금액에 따른 예상 수익을 계산해보세요</p>
        </div>

        <div className="calculator-container">
          <div className="calculator-grid">
            <div className="calculator-input">
              <h4>💵 투자 금액 입력</h4>
              <div className="input-group">
                <label>투자 금액 (USD)</label>
                <input 
                  type="number" 
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value) || 0)}
                  placeholder="투자 금액 입력"
                  data-testid="input-invest-amount"
                />
              </div>
              <div className="quick-amounts">
                {quickAmounts.map(amount => (
                  <span 
                    key={amount} 
                    className="quick-amount"
                    onClick={() => setInvestAmount(amount)}
                  >
                    ${amount.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
            <div className="calculator-result">
              <h4>📊 예상 결과</h4>
              <div className="result-item">
                <span className="label">토큰 수량</span>
                <span className="value highlight">{tokensReceived.toLocaleString()} TBURN</span>
              </div>
              <div className="result-item">
                <span className="label">TGE 해제 (15%)</span>
                <span className="value">{(tokensReceived * 0.15).toLocaleString()} TBURN</span>
              </div>
              <div className="result-item">
                <span className="label">예상 상장가 ($0.031)</span>
                <span className="value">${potentialValue.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="label">예상 수익</span>
                <span className="value gold">+${potentialProfit.toLocaleString()} (+{((potentialProfit / investAmount) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">퍼블릭 세일에 대한 궁금증</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>퍼블릭 라운드 누구나 참여 가능한가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>네, 퍼블릭 라운드는 KYC 인증을 완료한 모든 사용자가 참여할 수 있습니다. 최소 참여 금액은 $100이며, 지갑 연결 후 간단한 본인 인증만 완료하면 됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>TGE 즉시 해제가 뭔가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>Token Generation Event(TGE)는 토큰이 처음 생성되어 거래소에 상장되는 시점입니다. 퍼블릭 라운드 참여자는 TGE 시점에 투자 토큰의 15%를 즉시 받을 수 있습니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>시드/프라이빗과 뭐가 다른가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>시드($0.008)와 프라이빗($0.015)은 할인율이 높지만 높은 최소 참여금과 긴 베스팅 기간이 있습니다. 퍼블릭($0.025)은 할인율은 낮지만 $100부터 참여 가능하고 클리프 없이 TGE 15% 즉시 해제됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>어떤 결제 방식을 지원하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>USDT, USDC, ETH, BTC 등 주요 암호화폐로 결제할 수 있습니다. 파트너 거래소를 통해 법정화폐(USD, KRW 등)로도 참여 가능합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>지금 참여하세요!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            TBURN Chain의 퍼블릭 세일에 참여하고<br />
            최소 $100부터 시작하는 블록체인 혁신에 동참하세요!
          </p>
          <button className="btn-primary" style={{ background: 'var(--dark)', fontSize: '1.25rem', padding: '20px 50px' }}>
            🚀 지금 참여하기
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
