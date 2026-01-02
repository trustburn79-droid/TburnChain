import { useState } from "react";
import { Link } from "wouter";
import { TBurnLogo } from "@/components/tburn-logo";

export default function AirdropPage() {
  const [activeTab, setActiveTab] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setActiveTab(activeTab === id ? null : id);
  };

  return (
    <div className="airdrop-page">
      <style>{`
        .airdrop-page {
          --navy: #1A365D;
          --navy-light: #2D4A7C;
          --gold: #D4AF37;
          --gold-light: #E5C76B;
          --dark: #0F172A;
          --dark-card: #1E293B;
          --gray: #64748B;
          --light-gray: #94A3B8;
          --white: #FFFFFF;
          --success: #22C55E;
          --warning: #F59E0B;
          --danger: #EF4444;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-navy: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
          --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .airdrop-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
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
          font-size: 24px;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--white);
        }

        .logo-text span {
          color: var(--gold);
        }

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

        .nav-links a:hover {
          color: var(--gold);
        }

        .connect-btn {
          background: var(--gradient-gold);
          color: var(--dark);
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(212, 175, 55, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 80px;
          background: radial-gradient(ellipse at center top, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
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
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          animation: float 8s ease-in-out infinite;
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
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--gold);
          margin-bottom: 2rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero h1 .gold {
          background: var(--gradient-gold);
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
          border-color: var(--gold);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
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
          background: var(--gradient-gold);
          color: var(--dark);
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.4);
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
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          border-color: var(--gold);
          color: var(--gold);
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
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
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

        .airdrop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .airdrop-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .airdrop-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-gold);
        }

        .airdrop-card:hover {
          transform: translateY(-10px);
          border-color: var(--gold);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .airdrop-card.featured {
          border-color: var(--gold);
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, var(--dark-card) 100%);
        }

        .airdrop-icon {
          width: 64px;
          height: 64px;
          background: var(--gradient-gold);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 1.5rem;
        }

        .airdrop-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .airdrop-amount {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .airdrop-desc {
          color: var(--light-gray);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .airdrop-features {
          list-style: none;
          margin-bottom: 1.5rem;
          padding: 0;
        }

        .airdrop-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          color: var(--light-gray);
          font-size: 0.9rem;
        }

        .airdrop-features li .check-icon {
          color: var(--success);
          font-size: 14px;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          height: 8px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-gold);
          border-radius: 100px;
          transition: width 1s ease;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .tasks-container {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tasks-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .tasks-info p {
          color: var(--light-gray);
        }

        .points-display {
          text-align: right;
        }

        .points-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
        }

        .points-label {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .task-category {
          margin-bottom: 2rem;
        }

        .task-category-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--light-gray);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s;
        }

        .task-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .task-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .task-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .task-info h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .task-info p {
          font-size: 0.875rem;
          color: var(--light-gray);
        }

        .task-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .task-points {
          font-weight: 700;
          color: var(--gold);
        }

        .task-btn {
          background: var(--navy);
          color: var(--white);
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .task-btn:hover {
          background: var(--navy-light);
        }

        .timeline {
          position: relative;
          padding-left: 40px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, var(--gold) 0%, var(--navy) 100%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 2.5rem;
          padding-left: 40px;
        }

        .timeline-dot {
          position: absolute;
          left: -40px;
          top: 5px;
          width: 32px;
          height: 32px;
          background: var(--dark);
          border: 3px solid var(--gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timeline-dot.active {
          background: var(--gold);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }

        .timeline-dot.active .dot-icon {
          color: var(--dark);
        }

        .dot-icon {
          font-size: 12px;
          color: var(--gold);
        }

        .timeline-content {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .timeline-date {
          font-size: 0.875rem;
          color: var(--gold);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .timeline-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .timeline-desc {
          color: var(--light-gray);
          font-size: 0.95rem;
        }

        .eligibility-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .eligibility-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
        }

        .eligibility-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .eligibility-list {
          list-style: none;
          padding: 0;
        }

        .eligibility-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .eligibility-list li:last-child {
          border-bottom: none;
        }

        .faq-container {
          max-width: 900px;
          margin: 0 auto;
        }

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

        .faq-question:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .faq-question h4 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .faq-chevron {
          color: var(--gold);
          transition: transform 0.3s;
        }

        .faq-item.active .faq-chevron {
          transform: rotate(180deg);
        }

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

        .faq-answer p {
          color: var(--light-gray);
          line-height: 1.8;
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

        .footer-brand h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .footer-brand h3 span {
          color: var(--gold);
        }

        .footer-brand p {
          color: var(--light-gray);
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

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

        .social-links a:hover {
          background: var(--gold);
          color: var(--dark);
        }

        .footer-links h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .footer-links ul {
          list-style: none;
          padding: 0;
        }

        .footer-links ul li {
          margin-bottom: 0.75rem;
        }

        .footer-links ul li a {
          color: var(--light-gray);
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-links ul li a:hover {
          color: var(--gold);
        }

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

        @media (max-width: 1024px) {
          .airdrop-grid {
            grid-template-columns: 1fr;
          }
          .eligibility-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 100px 1rem 60px;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .task-item {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          .task-left {
            flex-direction: column;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>

      {/* Header */}
      <header className="airdrop-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-8 h-8" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </Link>
          <nav className="nav-links">
            <a href="#overview">개요</a>
            <a href="#airdrops">에어드랍</a>
            <a href="#tasks">미션</a>
            <a href="#timeline">일정</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="connect-btn" data-testid="button-connect-wallet">
            <i className="fas fa-wallet"></i> 지갑 연결
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="overview">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot"></span>
            LIVE - 메인넷 에어드랍 진행 중
          </div>
          <h1>
            <span className="gold">12억 TBURN</span><br />
            에어드랍 프로그램
          </h1>
          <p className="hero-subtitle">
            TBURN Chain 메인넷 런칭을 기념하여 커뮤니티 여러분께 12억 TBURN을 배포합니다.
            지금 바로 참여하여 무료 토큰을 받으세요.
          </p>

          <div className="stats-grid">
            <div className="stat-card" data-testid="stat-total-airdrop">
              <div className="stat-value">12억</div>
              <div className="stat-label">총 에어드랍 물량</div>
            </div>
            <div className="stat-card" data-testid="stat-tge-unlock">
              <div className="stat-value">1.2억</div>
              <div className="stat-label">TGE 즉시 해제 (10%)</div>
            </div>
            <div className="stat-card" data-testid="stat-vesting">
              <div className="stat-value">12개월</div>
              <div className="stat-label">베스팅 기간</div>
            </div>
            <div className="stat-card" data-testid="stat-tge-price">
              <div className="stat-value">$0.50</div>
              <div className="stat-label">예상 TGE 가격</div>
            </div>
          </div>

          <div className="cta-group">
            <button className="btn-primary" data-testid="button-participate">
              <i className="fas fa-rocket"></i> 지금 참여하기
            </button>
            <a href="#airdrops" className="btn-secondary">
              <i className="fas fa-info-circle"></i> 자세히 보기
            </a>
          </div>
        </div>
      </section>

      {/* Airdrop Types Section */}
      <section className="section" id="airdrops">
        <div className="section-header">
          <span className="section-badge">AIRDROP TYPES</span>
          <h2 className="section-title">에어드랍 유형</h2>
          <p className="section-subtitle">3가지 유형의 에어드랍 프로그램으로 총 12억 TBURN을 배포합니다</p>
        </div>

        <div className="airdrop-grid">
          {/* Genesis Airdrop */}
          <div className="airdrop-card featured" data-testid="card-genesis-airdrop">
            <div className="airdrop-icon">🌟</div>
            <h3 className="airdrop-title">제네시스 에어드랍</h3>
            <div className="airdrop-amount">6억 TBURN</div>
            <p className="airdrop-desc">메인넷 런칭 기념 초기 참여자를 위한 대규모 에어드랍</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> 테스트넷 참여자 우선 배분</li>
              <li><span className="check-icon">✓</span> NFT 홀더 보너스 (2배)</li>
              <li><span className="check-icon">✓</span> 얼리버드 추가 보상</li>
              <li><span className="check-icon">✓</span> TGE 10% 즉시 해제</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '35%' }}></div>
            </div>
            <div className="progress-text">
              <span>배분 진행률</span>
              <span>35% (2.1억 / 6억)</span>
            </div>
          </div>

          {/* Community Airdrop */}
          <div className="airdrop-card" data-testid="card-community-airdrop">
            <div className="airdrop-icon">👥</div>
            <h3 className="airdrop-title">커뮤니티 에어드랍</h3>
            <div className="airdrop-amount">4억 TBURN</div>
            <p className="airdrop-desc">소셜 미션 완료 및 커뮤니티 활동 참여 보상</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> 트위터/텔레그램 팔로우</li>
              <li><span className="check-icon">✓</span> 콘텐츠 생성 보상</li>
              <li><span className="check-icon">✓</span> 레퍼럴 보너스</li>
              <li><span className="check-icon">✓</span> 활동량 기반 배분</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '20%' }}></div>
            </div>
            <div className="progress-text">
              <span>배분 진행률</span>
              <span>20% (0.8억 / 4억)</span>
            </div>
          </div>

          {/* Loyalty Airdrop */}
          <div className="airdrop-card" data-testid="card-loyalty-airdrop">
            <div className="airdrop-icon">💎</div>
            <h3 className="airdrop-title">로열티 에어드랍</h3>
            <div className="airdrop-amount">2억 TBURN</div>
            <p className="airdrop-desc">장기 홀더 및 스테이킹 참여자를 위한 보상</p>
            <ul className="airdrop-features">
              <li><span className="check-icon">✓</span> 90일+ 홀딩 보너스</li>
              <li><span className="check-icon">✓</span> 스테이킹 참여 보상</li>
              <li><span className="check-icon">✓</span> 거버넌스 참여 보너스</li>
              <li><span className="check-icon">✓</span> 분기별 추가 배분</li>
            </ul>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <div className="progress-text">
              <span>배분 진행률</span>
              <span>대기 중 (TGE 이후 시작)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="section" id="tasks" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">EARN POINTS</span>
          <h2 className="section-title">미션 수행</h2>
          <p className="section-subtitle">미션을 완료하고 포인트를 모아 에어드랍 배분량을 높이세요</p>
        </div>

        <div className="tasks-container">
          <div className="tasks-header">
            <div className="tasks-info">
              <h3>내 미션 현황</h3>
              <p>지갑을 연결하면 미션 진행 상황을 확인할 수 있습니다</p>
            </div>
            <div className="points-display">
              <div className="points-value" data-testid="text-total-points">0 P</div>
              <div className="points-label">획득 포인트</div>
            </div>
          </div>

          {/* Required Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>⭐</span> 필수 미션
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-wallet-connect">
                <div className="task-left">
                  <div className="task-icon">👛</div>
                  <div className="task-info">
                    <h4>지갑 연결</h4>
                    <p>MetaMask 또는 지원 지갑 연결</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+500 P</span>
                  <button className="task-btn">연결하기</button>
                </div>
              </div>

              <div className="task-item" data-testid="task-email-verify">
                <div className="task-left">
                  <div className="task-icon">✅</div>
                  <div className="task-info">
                    <h4>이메일 인증</h4>
                    <p>이메일 주소 등록 및 인증</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+300 P</span>
                  <button className="task-btn">인증하기</button>
                </div>
              </div>

              <div className="task-item" data-testid="task-telegram-join">
                <div className="task-left">
                  <div className="task-icon">📱</div>
                  <div className="task-info">
                    <h4>텔레그램 가입</h4>
                    <p>공식 텔레그램 그룹 참여</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+400 P</span>
                  <button className="task-btn">가입하기</button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>🔗</span> 소셜 미션
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-twitter-follow">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#1DA1F2' }}>𝕏</div>
                  <div className="task-info">
                    <h4>트위터 팔로우</h4>
                    <p>@TBURNChain 공식 계정 팔로우</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+200 P</span>
                  <button className="task-btn">팔로우</button>
                </div>
              </div>

              <div className="task-item" data-testid="task-retweet">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#1DA1F2' }}>𝕏</div>
                  <div className="task-info">
                    <h4>런칭 트윗 리트윗</h4>
                    <p>메인넷 런칭 공지 리트윗</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+300 P</span>
                  <button className="task-btn">리트윗</button>
                </div>
              </div>

              <div className="task-item" data-testid="task-discord-join">
                <div className="task-left">
                  <div className="task-icon" style={{ color: '#5865F2' }}>💬</div>
                  <div className="task-info">
                    <h4>디스코드 가입</h4>
                    <p>공식 디스코드 서버 참여</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+400 P</span>
                  <button className="task-btn">가입하기</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bonus Tasks */}
          <div className="task-category">
            <div className="task-category-title">
              <span>🎁</span> 보너스 미션
            </div>
            <div className="task-list">
              <div className="task-item" data-testid="task-nft-holder">
                <div className="task-left">
                  <div className="task-icon">🎨</div>
                  <div className="task-info">
                    <h4>제네시스 NFT 보유</h4>
                    <p>TBURN 제네시스 NFT 보유 시 2배 보너스</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+2,000 P</span>
                  <button className="task-btn">확인하기</button>
                </div>
              </div>

              <div className="task-item" data-testid="task-referral">
                <div className="task-left">
                  <div className="task-icon">👥</div>
                  <div className="task-info">
                    <h4>친구 초대 (레퍼럴)</h4>
                    <p>친구 1명당 500P, 최대 10명</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">최대 +5,000 P</span>
                  <button className="task-btn">초대하기</button>
                </div>
              </div>

              <div className="task-item" data-testid="task-testnet">
                <div className="task-left">
                  <div className="task-icon">📊</div>
                  <div className="task-info">
                    <h4>테스트넷 참여자</h4>
                    <p>테스트넷 활동 기록 보유 시 자동 적용</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className="task-points">+3,000 P</span>
                  <button className="task-btn">확인하기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section" id="timeline">
        <div className="section-header">
          <span className="section-badge">SCHEDULE</span>
          <h2 className="section-title">배분 일정</h2>
          <p className="section-subtitle">에어드랍 배분은 TGE 이후 12개월간 진행됩니다</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot active"><span className="dot-icon">✓</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2025년 12월</div>
                <div className="timeline-title">에어드랍 등록 시작</div>
                <div className="timeline-desc">지갑 연결 및 미션 수행 시작</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot active"><span className="dot-icon">✓</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2026년 1월</div>
                <div className="timeline-title">스냅샷 진행</div>
                <div className="timeline-desc">참여자 포인트 및 자격 확정</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"><span className="dot-icon">⏳</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2026년 2월</div>
                <div className="timeline-title">TGE (토큰 생성 이벤트)</div>
                <div className="timeline-desc">10% (1.2억 TBURN) 즉시 클레임 가능</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"><span className="dot-icon">⏳</span></div>
              <div className="timeline-content">
                <div className="timeline-date">2026년 3월 ~ 2027년 2월</div>
                <div className="timeline-title">월별 베스팅 해제</div>
                <div className="timeline-desc">매월 7.5%씩 12개월간 선형 해제</div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--gold)', marginRight: '10px' }}>🧮</span>
                배분 계산 예시
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>내 포인트: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>5,000 P</span></p>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>전체 포인트 풀: <span style={{ fontWeight: 600 }}>100,000,000 P</span></p>
                <p style={{ color: 'var(--light-gray)', marginBottom: '1rem' }}>배분 물량: <span style={{ fontWeight: 600 }}>6억 TBURN</span></p>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                <p style={{ fontSize: '1.125rem' }}>예상 수령량: <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1.5rem' }}>30,000 TBURN</span></p>
                <p style={{ color: 'var(--light-gray)', fontSize: '0.875rem', marginTop: '0.5rem' }}>예상 가치 (@$0.50): <span style={{ color: 'var(--success)', fontWeight: 600 }}>$15,000</span></p>
              </div>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                * 실제 배분량은 최종 스냅샷 시점의 전체 포인트 합계에 따라 달라질 수 있습니다.
              </p>
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--gold)', marginRight: '10px' }}>🔓</span>
                베스팅 스케줄
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--light-gray)' }}>TGE (Day 0)</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>10%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--light-gray)' }}>M1 ~ M12</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>매월 7.5%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', color: 'var(--gold)', fontWeight: 600 }}>12개월 후 (Y1 완료)</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-header">
          <span className="section-badge">ELIGIBILITY</span>
          <h2 className="section-title">참여 자격</h2>
          <p className="section-subtitle">에어드랍 참여 자격 요건을 확인하세요</p>
        </div>

        <div className="eligibility-grid">
          <div className="eligibility-card" data-testid="card-eligible">
            <h3><span style={{ color: 'var(--success)' }}>✓</span> 참여 가능 조건</h3>
            <ul className="eligibility-list">
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>지갑 연결 필수</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>MetaMask, Trust Wallet, Coinbase Wallet 등 지원</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>필수 미션 완료</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>지갑 연결 + 이메일 인증 + 텔레그램 가입</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>최소 1,000 포인트 획득</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>포인트 미달 시 배분 대상에서 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--success)', marginTop: '4px' }}>✓</span>
                <div>
                  <strong>스냅샷 시점까지 자격 유지</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>2026년 1월 스냅샷 예정</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="eligibility-card" data-testid="card-excluded">
            <h3><span style={{ color: 'var(--warning)' }}>⚠</span> 제외 대상</h3>
            <ul className="eligibility-list">
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>제한 국가 거주자</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>미국, 중국, 북한 등 규제 국가 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>시빌 어택 (Sybil Attack)</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>다중 계정 사용 시 모든 계정 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>봇 활동 감지</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>자동화 도구 사용 시 제외</p>
                </div>
              </li>
              <li>
                <span style={{ color: 'var(--warning)', marginTop: '4px' }}>✗</span>
                <div>
                  <strong>부정 행위</strong>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>미션 조작, 허위 정보 제출 시 영구 제외</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="section-subtitle">에어드랍 관련 궁금한 점을 확인하세요</p>
        </div>

        <div className="faq-container">
          <div className={`faq-item ${activeTab === 'faq-1' ? 'active' : ''}`} data-testid="faq-total-amount">
            <div className="faq-question" onClick={() => toggleFaq('faq-1')}>
              <h4>에어드랍 총 물량은 얼마인가요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>총 12억 TBURN이 에어드랍으로 배분됩니다. 이는 전체 공급량 100억 TBURN의 12%에 해당합니다. 제네시스 에어드랍 6억, 커뮤니티 에어드랍 4억, 로열티 에어드랍 2억으로 구성됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-2' ? 'active' : ''}`} data-testid="faq-tge-amount">
            <div className="faq-question" onClick={() => toggleFaq('faq-2')}>
              <h4>TGE 시점에 얼마나 받을 수 있나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TGE(토큰 생성 이벤트) 시점에 전체 배분량의 10%가 즉시 클레임 가능합니다. 나머지 90%는 12개월에 걸쳐 매월 7.5%씩 선형 베스팅됩니다. 예를 들어 총 10,000 TBURN을 받는다면, TGE에 1,000 TBURN을 즉시 받고 이후 매월 750 TBURN씩 받게 됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-3' ? 'active' : ''}`} data-testid="faq-points-conversion">
            <div className="faq-question" onClick={() => toggleFaq('faq-3')}>
              <h4>포인트는 어떻게 토큰으로 환산되나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>포인트는 전체 참여자의 포인트 합계 대비 개인 포인트 비율로 토큰이 배분됩니다. 예를 들어, 전체 포인트가 1억이고 내 포인트가 5,000이라면, 6억 TBURN의 0.005%인 30,000 TBURN을 받게 됩니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-4' ? 'active' : ''}`} data-testid="faq-wallet">
            <div className="faq-question" onClick={() => toggleFaq('faq-4')}>
              <h4>어떤 지갑을 사용해야 하나요?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>MetaMask, Trust Wallet, Coinbase Wallet, Rainbow Wallet 등 대부분의 EVM 호환 지갑을 지원합니다. WalletConnect를 통해 모바일 지갑도 연결 가능합니다.</p>
            </div>
          </div>

          <div className={`faq-item ${activeTab === 'faq-5' ? 'active' : ''}`} data-testid="faq-claim">
            <div className="faq-question" onClick={() => toggleFaq('faq-5')}>
              <h4>에어드랍 수령 방법은?</h4>
              <span className="faq-chevron">▼</span>
            </div>
            <div className="faq-answer">
              <p>TGE 이후 이 페이지에서 "클레임" 버튼이 활성화됩니다. 지갑을 연결하고 가스비를 지불하면 TBURN 토큰이 지갑으로 전송됩니다. 베스팅된 토큰은 매월 클레임 가능합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TBURN<span>CHAIN</span></h3>
            <p>차세대 레이어1 블록체인으로 빠르고 안전한 탈중앙화 금융의 미래를 만들어갑니다.</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter"><span>𝕏</span></a>
              <a href="#" aria-label="Telegram"><span>✈</span></a>
              <a href="#" aria-label="Discord"><span>💬</span></a>
              <a href="#" aria-label="GitHub"><span>⌘</span></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>제품</h4>
            <ul>
              <li><Link href="/scan">TBURNScan</Link></li>
              <li><Link href="/app">dApp</Link></li>
              <li><Link href="/staking">스테이킹</Link></li>
              <li><Link href="/bridge">브릿지</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>개발자</h4>
            <ul>
              <li><Link href="/developers/docs">문서</Link></li>
              <li><Link href="/developers/api">API</Link></li>
              <li><Link href="/developers/sdk">SDK</Link></li>
              <li><a href="https://github.com/tburn-chain" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>리소스</h4>
            <ul>
              <li><Link href="/learn/whitepaper">백서</Link></li>
              <li><Link href="/learn/tokenomics">토크노믹스</Link></li>
              <li><Link href="/learn/roadmap">로드맵</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 TBURN Chain. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none' }}>개인정보처리방침</a>
            <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none' }}>이용약관</a>
            <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none' }}>문의하기</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
