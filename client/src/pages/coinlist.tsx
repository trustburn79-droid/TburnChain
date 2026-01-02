import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function CoinListPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayment, setSelectedPayment] = useState("usd");
  const [allocationAmount, setAllocationAmount] = useState(1000);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<"pending" | "success">("pending");
  const [countdown, setCountdown] = useState({ days: 14, hours: 8, minutes: 32, seconds: 45 });
  const [expandedFaq, setExpandedFaq] = useState(0);

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

  const tokenPrice = 0.02;
  const bonusPercent = allocationAmount >= 10000 ? 3 : allocationAmount >= 1000 ? 1 : 0;
  const baseTokens = allocationAmount / tokenPrice;
  const bonusTokens = baseTokens * (bonusPercent / 100);
  const totalTokens = baseTokens + bonusTokens;
  const tgeTokens = totalTokens * 0.15;

  const handlePurchase = () => {
    setShowModal(true);
    setModalStatus("pending");
    setTimeout(() => setModalStatus("success"), 2500);
  };

  const paymentMethods = [
    { id: "usd", icon: "💳", name: "USD", type: "신용카드 / 계좌이체" },
    { id: "usdt", icon: "💵", name: "USDT", type: "스테이블코인" },
    { id: "usdc", icon: "💲", name: "USDC", type: "스테이블코인" },
    { id: "btc", icon: "₿", name: "BTC", type: "비트코인" },
  ];

  const features = [
    { icon: "⚡", title: "초고속 처리", desc: "200,000+ TPS로 실시간 트랜잭션 처리" },
    { icon: "🧠", title: "AI 통합", desc: "스마트 컨트랙트에 AI 기능 내장" },
    { icon: "🛡️", title: "강력한 보안", desc: "AI 기반 위협 탐지 및 방어" },
    { icon: "🌱", title: "친환경", desc: "에너지 효율적인 PoS 합의" },
  ];

  const tokenomicsData = [
    { icon: "📊", label: "총 공급량", value: "100억 TBURN" },
    { icon: "💰", label: "초기 시가총액", value: "$80M" },
    { icon: "🎯", label: "FDV", value: "$2B" },
    { icon: "🔥", label: "퍼블릭 세일", value: "6%" },
    { icon: "🌱", label: "생태계", value: "30%" },
    { icon: "👥", label: "커뮤니티", value: "25%" },
  ];

  const teamMembers = [
    { initials: "JK", name: "John Kim", role: "CEO & Co-founder" },
    { initials: "SL", name: "Sarah Lee", role: "CTO & Co-founder" },
    { initials: "MP", name: "Michael Park", role: "Chief AI Officer" },
    { initials: "EC", name: "Emily Chen", role: "Head of Product" },
  ];

  const faqItems = [
    { q: "CoinList에서 어떻게 참여하나요?", a: "CoinList 계정 생성 후 KYC 인증을 완료하고, USD, 신용카드, 또는 암호화폐로 참여할 수 있습니다." },
    { q: "최소/최대 참여 금액은 얼마인가요?", a: "최소 $100, 최대 $50,000까지 참여 가능합니다. CoinList 레벨에 따라 할당량이 다를 수 있습니다." },
    { q: "토큰은 언제 받을 수 있나요?", a: "TGE 시점에 15%가 즉시 해제되며, 나머지는 12개월 선형 베스팅 스케줄에 따라 지급됩니다." },
    { q: "법정화폐로 참여할 수 있나요?", a: "네, CoinList는 신용카드와 계좌이체를 통한 USD 결제를 지원합니다." },
  ];

  const documents = [
    { icon: "📄", name: "백서", size: "PDF · 2.4 MB" },
    { icon: "📋", name: "기술 문서", size: "PDF · 5.1 MB" },
    { icon: "📊", name: "토크노믹스", size: "PDF · 1.2 MB" },
    { icon: "🛡️", name: "감사 보고서", size: "PDF · 890 KB" },
  ];

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="coinlist-page">
      <style>{`
        .coinlist-page {
          --coinlist-primary: #FFD700;
          --coinlist-secondary: #FFC107;
          --coinlist-dark: #1A1A2E;
          --coinlist-darker: #16162A;
          --coinlist-card: #252542;
          --coinlist-border: #3D3D5C;
          --gold: #D4AF37;
          --white: #FFFFFF;
          --gray: #9CA3AF;
          --light-gray: #D1D5DB;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --blue: #3B82F6;
          --purple: #8B5CF6;
          --gradient-coinlist: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--coinlist-darker);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); } 50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes rocket { 0%, 100% { transform: translateY(0) rotate(-10deg); } 50% { transform: translateY(-5px) rotate(-10deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }

        .cl-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(26, 26, 46, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--coinlist-border);
        }

        .cl-header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cl-header-left { display: flex; align-items: center; gap: 2rem; }

        .cl-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .cl-logo-icon {
          width: 40px;
          height: 40px;
          background: var(--gradient-coinlist);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          animation: rocket 3s ease-in-out infinite;
        }

        .cl-logo-text { font-size: 1.25rem; font-weight: 800; color: var(--white); }

        .cl-nav-tabs { display: flex; gap: 0.5rem; }

        .cl-nav-tab {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--gray);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-nav-tab:hover { color: var(--white); }
        .cl-nav-tab.active { background: var(--coinlist-card); color: var(--coinlist-primary); }

        .cl-header-right { display: flex; align-items: center; gap: 1rem; }

        .cl-balance {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--coinlist-card);
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .cl-balance .icon { color: var(--coinlist-primary); }
        .cl-balance .amount { font-weight: 700; }

        .cl-user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-user-menu:hover { border-color: var(--coinlist-primary); }

        .cl-user-avatar {
          width: 32px;
          height: 32px;
          background: var(--gradient-coinlist);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: var(--coinlist-dark);
        }

        .cl-user-info .name { font-size: 0.85rem; font-weight: 600; }
        .cl-user-info .level { font-size: 0.7rem; color: var(--coinlist-primary); }

        .cl-main { padding-top: 80px; }

        .cl-hero {
          background: linear-gradient(180deg, var(--coinlist-dark) 0%, var(--coinlist-darker) 100%);
          padding: 3rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .cl-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 300px;
          background: radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .cl-hero-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }

        .cl-hero-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }

        .cl-project-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }

        .cl-project-logo {
          width: 80px;
          height: 80px;
          background: var(--gradient-coinlist);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
        }

        .cl-project-title h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.25rem; }
        .cl-project-title .tagline { color: var(--gray); font-size: 1rem; }

        .cl-badges { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

        .cl-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .cl-badge.live { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
        .cl-badge.live .dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .cl-badge.verified { background: rgba(255, 215, 0, 0.15); color: var(--coinlist-primary); border: 1px solid rgba(255, 215, 0, 0.3); }
        .cl-badge.premium { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.3); }

        .cl-description { color: var(--light-gray); font-size: 1rem; line-height: 1.8; margin-bottom: 2rem; }

        .cl-key-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }

        .cl-metric-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
        }

        .cl-metric-value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }
        .cl-metric-value.gold { color: var(--coinlist-primary); }
        .cl-metric-value.green { color: var(--success); }
        .cl-metric-value.blue { color: var(--blue); }
        .cl-metric-value.purple { color: var(--purple); }
        .cl-metric-label { font-size: 0.8rem; color: var(--gray); }

        .cl-social-links { display: flex; gap: 0.75rem; }

        .cl-social-link {
          width: 44px;
          height: 44px;
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray);
          text-decoration: none;
          transition: all 0.3s;
          font-size: 1.25rem;
        }

        .cl-social-link:hover { border-color: var(--coinlist-primary); color: var(--coinlist-primary); transform: translateY(-3px); }

        .cl-sale-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 24px;
          overflow: hidden;
          position: sticky;
          top: 100px;
        }

        .cl-sale-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
          border-bottom: 1px solid var(--coinlist-border);
        }

        .cl-sale-status { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

        .cl-live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 100px;
          font-weight: 700;
          color: var(--success);
        }

        .cl-live-badge .dot { width: 10px; height: 10px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
        .cl-queue-info { font-size: 0.85rem; color: var(--gray); }

        .cl-countdown { display: flex; gap: 1rem; justify-content: center; }

        .cl-countdown-item { text-align: center; }
        .cl-countdown-value { font-size: 1.75rem; font-weight: 800; color: var(--white); }
        .cl-countdown-label { font-size: 0.7rem; color: var(--gray); text-transform: uppercase; }

        .cl-sale-body { padding: 1.5rem; }

        .cl-progress { margin-bottom: 1.5rem; }
        .cl-progress-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .cl-progress-header .raised { font-size: 1.25rem; font-weight: 800; color: var(--coinlist-primary); }
        .cl-progress-header .goal { color: var(--gray); font-size: 0.9rem; }

        .cl-progress-bar { height: 12px; background: var(--coinlist-dark); border-radius: 100px; overflow: hidden; margin-bottom: 0.75rem; }

        .cl-progress-fill {
          height: 100%;
          background: var(--gradient-coinlist);
          border-radius: 100px;
          position: relative;
          width: 45%;
        }

        .cl-progress-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .cl-progress-stats { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .cl-progress-stats .percent { color: var(--coinlist-primary); font-weight: 700; }
        .cl-progress-stats .participants { color: var(--gray); }

        .cl-sale-info { margin-bottom: 1.5rem; }

        .cl-sale-info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cl-sale-info-item:last-child { border-bottom: none; }
        .cl-sale-info-item .label { color: var(--gray); font-size: 0.9rem; }
        .cl-sale-info-item .value { font-weight: 600; font-size: 0.9rem; }
        .cl-sale-info-item .value.highlight { color: var(--coinlist-primary); }

        .cl-queue-system {
          background: var(--coinlist-dark);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .cl-queue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .cl-queue-header h4 { font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .cl-queue-header h4 span { color: var(--coinlist-primary); }
        .cl-queue-position { font-size: 0.85rem; color: var(--success); font-weight: 600; }

        .cl-queue-visual { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
        .cl-queue-bar { flex: 1; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 100px; overflow: hidden; }
        .cl-queue-bar-fill { height: 100%; background: var(--success); border-radius: 100px; width: 15%; }
        .cl-queue-percent { font-size: 0.8rem; font-weight: 700; color: var(--success); }
        .cl-queue-wait { font-size: 0.8rem; color: var(--gray); text-align: center; }

        .cl-allocation { margin-bottom: 1.5rem; }
        .cl-allocation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .cl-allocation-header .label { font-size: 0.9rem; font-weight: 600; }
        .cl-allocation-header .max-alloc { font-size: 0.8rem; color: var(--coinlist-primary); }

        .cl-allocation-input-group { position: relative; margin-bottom: 1rem; }

        .cl-allocation-input {
          width: 100%;
          padding: 1rem;
          padding-right: 100px;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.25rem;
          font-weight: 700;
          transition: border-color 0.3s;
        }

        .cl-allocation-input:focus { outline: none; border-color: var(--coinlist-primary); }

        .cl-allocation-currency {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--coinlist-card);
          border-radius: 8px;
        }

        .cl-allocation-currency .icon { font-size: 1.25rem; }
        .cl-allocation-currency span { font-weight: 600; font-size: 0.9rem; }

        .cl-quick-amounts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }

        .cl-quick-amount {
          padding: 10px;
          background: var(--coinlist-dark);
          border: 1px solid var(--coinlist-border);
          border-radius: 8px;
          color: var(--light-gray);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .cl-quick-amount:hover, .cl-quick-amount.active {
          border-color: var(--coinlist-primary);
          color: var(--coinlist-primary);
          background: rgba(255, 215, 0, 0.1);
        }

        .cl-token-calc {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05));
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .cl-calc-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
        .cl-calc-row .label { color: var(--gray); font-size: 0.85rem; }
        .cl-calc-row .value { font-weight: 600; font-size: 0.85rem; }
        .cl-calc-row .value.large { font-size: 1.125rem; color: var(--coinlist-primary); }
        .cl-calc-row .value.bonus { color: var(--success); }

        .cl-payment-section { margin-bottom: 1.5rem; }
        .cl-payment-header { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }

        .cl-payment-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }

        .cl-payment-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-payment-option:hover { border-color: rgba(255, 255, 255, 0.3); }
        .cl-payment-option.active { border-color: var(--coinlist-primary); background: rgba(255, 215, 0, 0.1); }
        .cl-payment-option .icon { font-size: 1.5rem; }
        .cl-payment-option .info { flex: 1; }
        .cl-payment-option .info .name { font-weight: 600; font-size: 0.9rem; }
        .cl-payment-option .info .type { font-size: 0.75rem; color: var(--gray); }

        .cl-payment-option .check {
          width: 20px;
          height: 20px;
          border: 2px solid var(--coinlist-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: transparent;
        }

        .cl-payment-option.active .check { background: var(--coinlist-primary); border-color: var(--coinlist-primary); color: var(--coinlist-dark); }

        .cl-purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: var(--gradient-coinlist);
          border: none;
          border-radius: 14px;
          color: var(--coinlist-dark);
          font-size: 1.125rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          animation: glow 2s infinite;
        }

        .cl-purchase-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3); }

        .cl-security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--gray);
        }

        .cl-security-note span { color: var(--success); }

        .cl-details-section { max-width: 1400px; margin: 0 auto; padding: 3rem 2rem; }

        .cl-details-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--coinlist-border);
          padding-bottom: 1rem;
          flex-wrap: wrap;
        }

        .cl-details-tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--gray);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-details-tab:hover { color: var(--white); }
        .cl-details-tab.active { background: var(--coinlist-card); color: var(--coinlist-primary); }

        .cl-details-content { display: none; animation: slideUp 0.3s ease; }
        .cl-details-content.active { display: block; }

        .cl-overview-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }

        .cl-about-section {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 20px;
          padding: 2rem;
        }

        .cl-about-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cl-about-section h3 span { color: var(--coinlist-primary); }
        .cl-about-section p { color: var(--light-gray); line-height: 1.8; margin-bottom: 1.5rem; }

        .cl-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

        .cl-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 1rem;
          background: var(--coinlist-dark);
          border-radius: 12px;
        }

        .cl-feature-item .icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .cl-feature-item h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem; }
        .cl-feature-item p { font-size: 0.8rem; color: var(--gray); }

        .cl-sidebar-cards { display: flex; flex-direction: column; gap: 1.5rem; }

        .cl-sidebar-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .cl-sidebar-card h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cl-sidebar-card h4 span { color: var(--coinlist-primary); }

        .cl-vesting-timeline { position: relative; }

        .cl-vesting-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding-bottom: 1.25rem;
          position: relative;
        }

        .cl-vesting-item::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 24px;
          bottom: 0;
          width: 2px;
          background: var(--coinlist-border);
        }

        .cl-vesting-item:last-child::before { display: none; }

        .cl-vesting-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--coinlist-dark);
          border: 2px solid var(--coinlist-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          flex-shrink: 0;
          z-index: 1;
        }

        .cl-vesting-item.tge .cl-vesting-dot { background: var(--coinlist-primary); border-color: var(--coinlist-primary); color: var(--coinlist-dark); }

        .cl-vesting-content { flex: 1; }
        .cl-vesting-content .title { font-weight: 600; font-size: 0.9rem; }
        .cl-vesting-content .desc { font-size: 0.8rem; color: var(--gray); }
        .cl-vesting-amount { font-weight: 700; color: var(--coinlist-primary); }

        .cl-documents-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .cl-document-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--coinlist-dark);
          border-radius: 10px;
          text-decoration: none;
          color: var(--white);
          transition: all 0.3s;
        }

        .cl-document-item:hover { background: rgba(255, 215, 0, 0.1); }

        .cl-document-item .icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
        }

        .cl-document-item .info { flex: 1; }
        .cl-document-item .info .name { font-weight: 600; font-size: 0.9rem; }
        .cl-document-item .info .size { font-size: 0.75rem; color: var(--gray); }
        .cl-document-item .arrow { color: var(--gray); }

        .cl-tokenomics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

        .cl-tokenomics-card {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .cl-tokenomics-card .icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 16px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        .cl-tokenomics-card h4 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--gray); }
        .cl-tokenomics-card .value { font-size: 1.5rem; font-weight: 800; color: var(--coinlist-primary); }

        .cl-team-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }

        .cl-team-member { display: flex; align-items: center; gap: 12px; }

        .cl-team-member .avatar {
          width: 44px;
          height: 44px;
          background: var(--gradient-coinlist);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          color: var(--coinlist-dark);
        }

        .cl-team-member .info { flex: 1; }
        .cl-team-member .info .name { font-weight: 600; font-size: 0.9rem; }
        .cl-team-member .info .role { font-size: 0.8rem; color: var(--gray); }

        .cl-partners-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }
        .cl-partner-badge { padding: 12px 20px; background: var(--coinlist-dark); border-radius: 10px; font-weight: 600; font-size: 0.9rem; }

        .cl-faq-list { max-width: 900px; }

        .cl-faq-item {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .cl-faq-question {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.3s;
        }

        .cl-faq-question:hover { background: rgba(255, 255, 255, 0.02); }
        .cl-faq-question h4 { font-size: 1rem; font-weight: 600; }
        .cl-faq-question .arrow { color: var(--coinlist-primary); transition: transform 0.3s; }
        .cl-faq-item.active .cl-faq-question .arrow { transform: rotate(180deg); }

        .cl-faq-answer {
          padding: 0 1.25rem;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s;
        }

        .cl-faq-item.active .cl-faq-answer { padding: 0 1.25rem 1.25rem; max-height: 500px; }
        .cl-faq-answer p { color: var(--gray); line-height: 1.8; }

        .cl-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .cl-modal {
          background: var(--coinlist-card);
          border: 1px solid var(--coinlist-border);
          border-radius: 24px;
          width: 100%;
          max-width: 450px;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .cl-modal-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
          border-bottom: 1px solid var(--coinlist-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cl-modal-header h3 { font-size: 1.25rem; font-weight: 700; }

        .cl-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--coinlist-dark);
          border: none;
          color: var(--gray);
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-modal-close:hover { background: var(--coinlist-border); color: var(--white); }

        .cl-modal-body { padding: 2rem; text-align: center; }

        .cl-modal-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .cl-modal-icon.pending { background: rgba(255, 215, 0, 0.2); }
        .cl-modal-icon.success { background: rgba(16, 185, 129, 0.2); color: var(--success); }

        .cl-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-top-color: var(--coinlist-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .cl-modal-body h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .cl-modal-body p { color: var(--gray); margin-bottom: 1.5rem; }

        .cl-modal-details {
          background: var(--coinlist-dark);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .cl-modal-detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; }
        .cl-modal-detail-row .label { color: var(--gray); }
        .cl-modal-detail-row .value { font-weight: 600; }

        .cl-modal-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: var(--gradient-coinlist);
          border: none;
          border-radius: 12px;
          color: var(--coinlist-dark);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cl-modal-btn:hover { transform: scale(1.02); }

        .cl-footer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          border-top: 1px solid var(--coinlist-border);
        }

        .cl-footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .cl-footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .cl-footer-links a { color: var(--gray); text-decoration: none; font-size: 0.85rem; transition: color 0.3s; }
        .cl-footer-links a:hover { color: var(--coinlist-primary); }
        .cl-footer-copyright { color: var(--gray); font-size: 0.85rem; }

        @media (max-width: 1200px) {
          .cl-hero-grid { grid-template-columns: 1fr; }
          .cl-sale-card { position: static; margin-top: 2rem; }
          .cl-overview-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .cl-key-metrics { grid-template-columns: repeat(2, 1fr); }
          .cl-tokenomics-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .cl-header-container { padding: 0.75rem 1rem; }
          .cl-nav-tabs, .cl-balance { display: none; }
          .cl-hero { padding: 2rem 1rem; }
          .cl-key-metrics { grid-template-columns: 1fr 1fr; }
          .cl-features-grid { grid-template-columns: 1fr; }
          .cl-tokenomics-grid { grid-template-columns: 1fr; }
          .cl-payment-options { grid-template-columns: 1fr; }
          .cl-quick-amounts { grid-template-columns: repeat(2, 1fr); }
          .cl-footer-content { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <header className="cl-header">
        <div className="cl-header-container">
          <div className="cl-header-left">
            <Link href="/" className="cl-logo">
              <div className="cl-logo-icon">🚀</div>
              <div className="cl-logo-text">CoinList</div>
            </Link>
            <div className="cl-nav-tabs">
              <button className="cl-nav-tab active">토큰 세일</button>
              <button className="cl-nav-tab">트레이딩</button>
              <button className="cl-nav-tab">스테이킹</button>
              <button className="cl-nav-tab">포트폴리오</button>
            </div>
          </div>
          <div className="cl-header-right">
            <div className="cl-balance">
              <span className="icon">💰</span>
              <span className="amount">$5,000.00</span>
            </div>
            <div className="cl-user-menu">
              <div className="cl-user-avatar">KV</div>
              <div className="cl-user-info">
                <div className="name">Kevin</div>
                <div className="level">Level 3 · Verified</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cl-main">
        {/* Hero Section */}
        <section className="cl-hero">
          <div className="cl-hero-container">
            <div className="cl-hero-grid">
              {/* Project Info */}
              <div className="cl-project-info">
                <div className="cl-project-header">
                  <div className="cl-project-logo">🔥</div>
                  <div className="cl-project-title">
                    <h1>TBURN Chain</h1>
                    <div className="tagline">AI-Enhanced Blockchain Platform</div>
                  </div>
                </div>

                <div className="cl-badges">
                  <span className="cl-badge live"><span className="dot"></span>세일 진행 중</span>
                  <span className="cl-badge verified">🛡️ CoinList 검증</span>
                  <span className="cl-badge premium">💎 프리미엄 런치</span>
                </div>

                <p className="cl-description">
                  TBURN Chain은 AI와 블록체인 기술을 결합한 차세대 레이어-1 플랫폼입니다. 
                  200,000+ TPS의 고성능, AI 기반 스마트 컨트랙트, 자가 최적화 네트워크를 통해 
                  Web3의 미래를 선도합니다. CoinList를 통해 전 세계 투자자들에게 공개됩니다.
                </p>

                <div className="cl-key-metrics">
                  <div className="cl-metric-card">
                    <div className="cl-metric-value gold">$0.020</div>
                    <div className="cl-metric-label">토큰 가격</div>
                  </div>
                  <div className="cl-metric-card">
                    <div className="cl-metric-value green">15%</div>
                    <div className="cl-metric-label">TGE 해제</div>
                  </div>
                  <div className="cl-metric-card">
                    <div className="cl-metric-value blue">6억</div>
                    <div className="cl-metric-label">총 세일 물량</div>
                  </div>
                  <div className="cl-metric-card">
                    <div className="cl-metric-value purple">$12M</div>
                    <div className="cl-metric-label">목표 모집</div>
                  </div>
                </div>

                <div className="cl-social-links">
                  {['🐦', '📱', '💬', '📝', '💻', '🌐'].map((icon, i) => (
                    <a key={i} href="#" className="cl-social-link">{icon}</a>
                  ))}
                </div>
              </div>

              {/* Sale Card */}
              <div className="cl-sale-card">
                <div className="cl-sale-header">
                  <div className="cl-sale-status">
                    <div className="cl-live-badge"><span className="dot"></span>LIVE</div>
                    <div className="cl-queue-info">12,450명 대기 중</div>
                  </div>
                  <div className="cl-countdown">
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.days.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">Days</div>
                    </div>
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.hours.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">Hours</div>
                    </div>
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.minutes.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">Mins</div>
                    </div>
                    <div className="cl-countdown-item">
                      <div className="cl-countdown-value">{countdown.seconds.toString().padStart(2, '0')}</div>
                      <div className="cl-countdown-label">Secs</div>
                    </div>
                  </div>
                </div>

                <div className="cl-sale-body">
                  {/* Progress */}
                  <div className="cl-progress" data-testid="coinlist-progress">
                    <div className="cl-progress-header">
                      <div className="raised">$5,400,000</div>
                      <div className="goal">/ $12,000,000</div>
                    </div>
                    <div className="cl-progress-bar">
                      <div className="cl-progress-fill"></div>
                    </div>
                    <div className="cl-progress-stats">
                      <span className="percent">45% 완료</span>
                      <span className="participants">8,234명 참여</span>
                    </div>
                  </div>

                  {/* Sale Info */}
                  <div className="cl-sale-info">
                    {[
                      { label: "토큰 가격", value: "$0.020", highlight: true },
                      { label: "최소 참여", value: "$100" },
                      { label: "최대 참여", value: "$50,000" },
                      { label: "TGE 해제", value: "15%", highlight: true },
                    ].map((item, i) => (
                      <div key={i} className="cl-sale-info-item">
                        <span className="label">{item.label}</span>
                        <span className={`value ${item.highlight ? 'highlight' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Queue System */}
                  <div className="cl-queue-system">
                    <div className="cl-queue-header">
                      <h4><span>👥</span> 대기열 현황</h4>
                      <span className="cl-queue-position">#1,247</span>
                    </div>
                    <div className="cl-queue-visual">
                      <div className="cl-queue-bar">
                        <div className="cl-queue-bar-fill"></div>
                      </div>
                      <span className="cl-queue-percent">15%</span>
                    </div>
                    <div className="cl-queue-wait">예상 대기 시간: 약 5분</div>
                  </div>

                  {/* Allocation Input */}
                  <div className="cl-allocation">
                    <div className="cl-allocation-header">
                      <span className="label">참여 금액</span>
                      <span className="max-alloc">최대: $50,000</span>
                    </div>
                    <div className="cl-allocation-input-group">
                      <input 
                        type="number"
                        className="cl-allocation-input"
                        value={allocationAmount}
                        onChange={(e) => setAllocationAmount(Number(e.target.value) || 0)}
                        data-testid="input-allocation"
                      />
                      <div className="cl-allocation-currency">
                        <span className="icon">💵</span>
                        <span>USD</span>
                      </div>
                    </div>
                    <div className="cl-quick-amounts">
                      {quickAmounts.map(amount => (
                        <div 
                          key={amount}
                          className={`cl-quick-amount ${allocationAmount === amount ? 'active' : ''}`}
                          onClick={() => setAllocationAmount(amount)}
                        >
                          ${amount.toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Token Calculation */}
                  <div className="cl-token-calc">
                    <div className="cl-calc-row">
                      <span className="label">받을 토큰</span>
                      <span className="value large">{totalTokens.toLocaleString()} TBURN</span>
                    </div>
                    <div className="cl-calc-row">
                      <span className="label">보너스 (+{bonusPercent}%)</span>
                      <span className="value bonus">+{bonusTokens.toLocaleString()} TBURN</span>
                    </div>
                    <div className="cl-calc-row">
                      <span className="label">TGE 해제 (15%)</span>
                      <span className="value">{tgeTokens.toLocaleString()} TBURN</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="cl-payment-section">
                    <div className="cl-payment-header">결제 수단 선택</div>
                    <div className="cl-payment-options">
                      {paymentMethods.map(method => (
                        <div 
                          key={method.id}
                          className={`cl-payment-option ${selectedPayment === method.id ? 'active' : ''}`}
                          onClick={() => setSelectedPayment(method.id)}
                        >
                          <span className="icon">{method.icon}</span>
                          <div className="info">
                            <div className="name">{method.name}</div>
                            <div className="type">{method.type}</div>
                          </div>
                          <div className="check">✓</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="cl-purchase-btn" onClick={handlePurchase} data-testid="button-purchase">
                    🚀 지금 참여하기
                  </button>

                  <div className="cl-security-note">
                    <span>🛡️</span> CoinList 보안 결제로 안전하게 처리됩니다
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="cl-details-section">
          <div className="cl-details-tabs">
            {['overview', 'tokenomics', 'team', 'faq'].map(tab => (
              <button 
                key={tab}
                className={`cl-details-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' ? '개요' : tab === 'tokenomics' ? '토크노믹스' : tab === 'team' ? '팀' : 'FAQ'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          <div className={`cl-details-content ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="cl-overview-grid">
              <div className="cl-about-section">
                <h3><span>ℹ️</span> 프로젝트 소개</h3>
                <p>
                  TBURN Chain은 AI 기술과 블록체인의 결합을 통해 차세대 탈중앙화 인프라를 구축합니다. 
                  Triple-Band AI Orchestration, AI-Enhanced Committee BFT, Dynamic Sharding 등의 
                  혁신적인 기술을 통해 기존 블록체인의 한계를 뛰어넘습니다.
                </p>
                <p>
                  메인넷 런칭 후 DeFi, NFT, GameFi, 엔터프라이즈 솔루션 등 다양한 생태계를 
                  구축하여 Web3 대중화를 선도할 예정입니다.
                </p>

                <h3 style={{ marginTop: '2rem' }}><span>⭐</span> 주요 특징</h3>
                <div className="cl-features-grid">
                  {features.map((f, i) => (
                    <div key={i} className="cl-feature-item">
                      <div className="icon">{f.icon}</div>
                      <div>
                        <h4>{f.title}</h4>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cl-sidebar-cards">
                {/* Vesting Schedule */}
                <div className="cl-sidebar-card">
                  <h4><span>📅</span> 베스팅 스케줄</h4>
                  <div className="cl-vesting-timeline">
                    <div className="cl-vesting-item tge">
                      <div className="cl-vesting-dot">✓</div>
                      <div className="cl-vesting-content">
                        <div className="title">TGE</div>
                        <div className="desc">토큰 생성 시점</div>
                      </div>
                      <div className="cl-vesting-amount">15%</div>
                    </div>
                    <div className="cl-vesting-item">
                      <div className="cl-vesting-dot"></div>
                      <div className="cl-vesting-content">
                        <div className="title">클리프</div>
                        <div className="desc">1~3개월</div>
                      </div>
                      <div className="cl-vesting-amount">0%</div>
                    </div>
                    <div className="cl-vesting-item">
                      <div className="cl-vesting-dot"></div>
                      <div className="cl-vesting-content">
                        <div className="title">선형 베스팅</div>
                        <div className="desc">4~15개월</div>
                      </div>
                      <div className="cl-vesting-amount">85%</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="cl-sidebar-card">
                  <h4><span>📄</span> 문서</h4>
                  <div className="cl-documents-list">
                    {documents.map((doc, i) => (
                      <a key={i} href="#" className="cl-document-item">
                        <div className="icon">{doc.icon}</div>
                        <div className="info">
                          <div className="name">{doc.name}</div>
                          <div className="size">{doc.size}</div>
                        </div>
                        <span className="arrow">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tokenomics Tab */}
          <div className={`cl-details-content ${activeTab === 'tokenomics' ? 'active' : ''}`}>
            <div className="cl-tokenomics-grid">
              {tokenomicsData.map((t, i) => (
                <div key={i} className="cl-tokenomics-card">
                  <div className="icon">{t.icon}</div>
                  <h4>{t.label}</h4>
                  <div className="value">{t.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Tab */}
          <div className={`cl-details-content ${activeTab === 'team' ? 'active' : ''}`}>
            <div className="cl-overview-grid">
              <div className="cl-about-section">
                <h3><span>👥</span> 핵심 팀</h3>
                <div className="cl-team-list">
                  {teamMembers.map((m, i) => (
                    <div key={i} className="cl-team-member">
                      <div className="avatar">{m.initials}</div>
                      <div className="info">
                        <div className="name">{m.name}</div>
                        <div className="role">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cl-sidebar-cards">
                <div className="cl-sidebar-card">
                  <h4><span>🤝</span> 주요 파트너</h4>
                  <div className="cl-partners-grid">
                    {['Chainlink', 'Circle', 'AWS', 'Samsung'].map(p => (
                      <div key={p} className="cl-partner-badge">{p}</div>
                    ))}
                  </div>
                </div>
                <div className="cl-sidebar-card">
                  <h4><span>🏢</span> 투자자</h4>
                  <div className="cl-partners-grid">
                    {['Polychain', 'Framework', 'Electric'].map(p => (
                      <div key={p} className="cl-partner-badge">{p}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Tab */}
          <div className={`cl-details-content ${activeTab === 'faq' ? 'active' : ''}`}>
            <div className="cl-faq-list">
              {faqItems.map((faq, i) => (
                <div key={i} className={`cl-faq-item ${expandedFaq === i ? 'active' : ''}`}>
                  <div className="cl-faq-question" onClick={() => setExpandedFaq(expandedFaq === i ? -1 : i)}>
                    <h4>{faq.q}</h4>
                    <span className="arrow">▼</span>
                  </div>
                  <div className="cl-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="cl-footer">
          <div className="cl-footer-content">
            <div className="cl-footer-links">
              <Link href="/legal/terms-of-service">이용약관</Link>
              <Link href="/legal/privacy-policy">개인정보처리방침</Link>
              <a href="#">리스크 고지</a>
              <a href="#">고객 지원</a>
            </div>
            <div className="cl-footer-copyright">© 2025 CoinList. All Rights Reserved.</div>
          </div>
        </footer>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="cl-modal-overlay">
          <div className="cl-modal">
            <div className="cl-modal-header">
              <h3>{modalStatus === 'success' ? '참여 완료!' : '처리 중...'}</h3>
              <button className="cl-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="cl-modal-body">
              <div className={`cl-modal-icon ${modalStatus}`}>
                {modalStatus === 'pending' ? <div className="cl-spinner"></div> : '✓'}
              </div>
              <h4>{modalStatus === 'success' ? '토큰 세일 참여 완료!' : '결제 처리 중...'}</h4>
              <p>{modalStatus === 'success' ? 'TGE 시점에 토큰이 지급됩니다' : '잠시만 기다려주세요'}</p>

              <div className="cl-modal-details">
                <div className="cl-modal-detail-row">
                  <span className="label">참여 금액</span>
                  <span className="value">${allocationAmount.toLocaleString()} {selectedPayment.toUpperCase()}</span>
                </div>
                <div className="cl-modal-detail-row">
                  <span className="label">받을 토큰</span>
                  <span className="value">{totalTokens.toLocaleString()} TBURN</span>
                </div>
                <div className="cl-modal-detail-row">
                  <span className="label">TGE 해제</span>
                  <span className="value">{tgeTokens.toLocaleString()} TBURN</span>
                </div>
              </div>

              {modalStatus === 'success' && (
                <button className="cl-modal-btn" onClick={() => setShowModal(false)}>확인</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
