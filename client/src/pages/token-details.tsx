import { useEffect } from 'react';
import { TBurnLogo } from "@/components/tburn-logo";
import { Home, ScanLine, User, Bug, Shield, Coins, ImageIcon, HelpCircle } from "lucide-react";

export default function TokenDetails() {
  useEffect(() => {
    const navItems = document.querySelectorAll('.td-nav-item');
    const sections = document.querySelectorAll('.td-section');
    const scrollTopBtn = document.querySelector('.td-scroll-top');

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('td-visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.td-fade-in-up').forEach(el => observer.observe(el));

    const handleScroll = () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute('id') || '';
        }
      });

      navItems.forEach(item => {
        item.classList.remove('td-active');
        if (item.getAttribute('href') === '#' + current) {
          item.classList.add('td-active');
        }
      });

      if (scrollTopBtn) {
        if (window.scrollY > 500) scrollTopBtn.classList.add('td-btn-visible');
        else scrollTopBtn.classList.remove('td-btn-visible');
      }
    };

    const handleNavClick = (e: Event) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const targetId = target.getAttribute('href');
      if (targetId) {
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    navItems.forEach(item => {
      item.addEventListener('click', handleNavClick);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      navItems.forEach(item => {
        item.removeEventListener('click', handleNavClick);
      });
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        .td-root {
          --td-bg-deep: #050509;
          --td-bg-panel: rgba(20, 25, 40, 0.6);
          --td-bg-card: rgba(30, 35, 55, 0.4);
          --td-border-glass: rgba(255, 255, 255, 0.08);
          --td-primary: #FF6B35;
          --td-primary-glow: rgba(255, 107, 53, 0.4);
          --td-secondary: #00D4AA;
          --td-accent: #FFD700;
          --td-purple: #8B5CF6;
          --td-pink: #EC4899;
          --td-text-main: #FFFFFF;
          --td-text-muted: #94A3B8;
          --td-container-width: 1280px;
        }

        .td-root {
          background-color: var(--td-bg-deep);
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(255, 107, 53, 0.08), transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(0, 212, 170, 0.08), transparent 25%);
          color: var(--td-text-main);
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .td-root h1, .td-root h2, .td-root h3, .td-root h4, .td-font-orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 0.5px; }
        .td-font-mono { font-family: 'JetBrains Mono', monospace; }

        .td-container { max-width: var(--td-container-width); margin: 0 auto; padding: 0 24px; }
        .td-grid { display: grid; gap: 24px; }
        .td-flex { display: flex; }
        .td-items-center { align-items: center; }
        .td-justify-between { justify-content: space-between; }
        .td-justify-center { justify-content: center; }
        .td-gap-4 { gap: 16px; }
        .td-text-center { text-align: center; }

        .td-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: rgba(5, 5, 9, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--td-border-glass);
          height: 80px;
          display: flex;
          align-items: center;
        }

        .td-logo-box { display: flex; align-items: center; gap: 12px; }
        .td-logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--td-primary), #FF9F43);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 20px var(--td-primary-glow);
        }
        .td-logo-text {
          font-size: 1.5rem; font-weight: 700;
          background: linear-gradient(to right, #fff, #ccc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .td-header-icons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .td-header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: var(--td-text-muted);
          transition: all 0.2s ease;
        }
        .td-header-icon:hover {
          color: var(--td-primary);
          background: rgba(255, 107, 53, 0.1);
        }

        .td-nav-wrapper {
          position: sticky; top: 80px; z-index: 900;
          background: rgba(5, 5, 9, 0.9);
          border-bottom: 1px solid var(--td-border-glass);
          padding: 12px 0; backdrop-filter: blur(10px);
        }
        .td-nav-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .td-nav-scroll::-webkit-scrollbar { display: none; }
        .td-nav-item {
          padding: 8px 16px; border-radius: 100px;
          font-size: 0.9rem; font-weight: 500; color: var(--td-text-muted);
          text-decoration: none; border: 1px solid transparent;
          transition: all 0.3s ease; white-space: nowrap; cursor: pointer;
        }
        .td-nav-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .td-active {
          background: rgba(255, 107, 53, 0.15);
          border-color: rgba(255, 107, 53, 0.3);
          color: var(--td-primary);
          box-shadow: 0 0 15px rgba(255, 107, 53, 0.1);
        }

        .td-hero { padding: 100px 0 60px; text-align: center; position: relative; }
        .td-hero h1 {
          font-size: clamp(3rem, 6vw, 4.5rem);
          font-weight: 700;
          margin-bottom: 24px;
          letter-spacing: -0.025em;
          line-height: 1.1;
          background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(255,255,255,0.1);
        }
        .td-hero-meta {
          display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-top: 40px;
        }
        .td-meta-item {
          display: flex; flex-direction: column; align-items: center;
          padding: 15px 30px; background: var(--td-bg-panel);
          border: 1px solid var(--td-border-glass); border-radius: 16px;
          min-width: 180px; transition: transform 0.3s;
        }
        .td-meta-item:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
        .td-meta-label { font-size: 0.8rem; color: var(--td-text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .td-meta-value { font-family: 'Orbitron'; font-weight: 700; color: var(--td-primary); font-size: 1.1rem; }

        .td-section { padding: 80px 0; border-bottom: 1px solid rgba(255,255,255,0.03); scroll-margin-top: 140px; }
        .td-section-header { margin-bottom: 40px; display: flex; align-items: center; gap: 15px; }
        .td-section-icon { 
          width: 50px; height: 50px; border-radius: 16px;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; border: 1px solid var(--td-border-glass);
        }
        .td-section-title { font-size: 2rem; font-weight: 700; color: #fff; }

        .td-card {
          background: var(--td-bg-card);
          border: 1px solid var(--td-border-glass);
          border-radius: 20px; padding: 30px; margin-bottom: 24px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .td-card:hover { border-color: rgba(255,255,255,0.15); box-shadow: 0 15px 50px rgba(0,0,0,0.3); }
        .td-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--td-border-glass); }
        .td-card-title { font-size: 1.25rem; font-weight: 600; color: #fff; }

        .td-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .td-bg-fire { background: rgba(255, 107, 53, 0.15); color: var(--td-primary); border: 1px solid rgba(255, 107, 53, 0.3); }
        .td-bg-ocean { background: rgba(0, 212, 170, 0.15); color: var(--td-secondary); border: 1px solid rgba(0, 212, 170, 0.3); }
        .td-bg-gold { background: rgba(255, 215, 0, 0.15); color: var(--td-accent); border: 1px solid rgba(255, 215, 0, 0.3); }
        .td-bg-purple { background: rgba(139, 92, 246, 0.15); color: var(--td-purple); border: 1px solid rgba(139, 92, 246, 0.3); }
        .td-bg-pink { background: rgba(236, 72, 153, 0.15); color: var(--td-pink); border: 1px solid rgba(236, 72, 153, 0.3); }

        .td-dist-chart { display: flex; flex-wrap: wrap; gap: 15px; margin: 30px 0; justify-content: center; }
        .td-dist-item { 
          background: rgba(255,255,255,0.03); border: 1px solid var(--td-border-glass); 
          border-radius: 16px; padding: 25px; min-width: 180px; text-align: center;
          transition: transform 0.3s;
        }
        .td-dist-item:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }
        .td-dist-pct { font-family: 'Orbitron'; font-size: 2.5rem; font-weight: 700; margin-bottom: 5px; line-height: 1; }
        .td-dist-amt { font-size: 1rem; font-weight: 600; margin-bottom: 8px; color: #fff; }
        .td-dist-lbl { font-size: 0.85rem; color: var(--td-text-muted); text-transform: uppercase; }

        .td-table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid var(--td-border-glass); }
        .td-root table { width: 100%; border-collapse: collapse; font-size: 0.95rem; white-space: nowrap; }
        .td-root th { background: rgba(255,255,255,0.03); color: var(--td-text-muted); font-weight: 600; text-align: left; padding: 16px; font-size: 0.8rem; text-transform: uppercase; }
        .td-root td { padding: 16px; border-top: 1px solid var(--td-border-glass); color: #fff; }
        .td-root tr:hover td { background: rgba(255,255,255,0.02); }
        .td-highlight-row td { background: rgba(255, 107, 53, 0.1); font-weight: 700; color: var(--td-primary); border-top: 2px solid rgba(255, 107, 53, 0.3); }

        .td-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .td-info-box { background: rgba(255,255,255,0.03); border: 1px solid var(--td-border-glass); border-radius: 12px; padding: 20px; }
        .td-info-lbl { font-size: 0.85rem; color: var(--td-text-muted); margin-bottom: 5px; }
        .td-info-val { font-family: 'Orbitron'; font-size: 1.1rem; font-weight: 600; color: #fff; }

        .td-step { 
          display: flex; align-items: flex-start; gap: 15px; padding: 20px; 
          background: linear-gradient(90deg, rgba(255,255,255,0.02), transparent);
          border-left: 3px solid var(--td-secondary); margin-bottom: 12px; border-radius: 0 12px 12px 0;
        }
        .td-step-num { 
          width: 32px; height: 32px; background: var(--td-secondary); border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0;
        }

        .td-checklist { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
        .td-check-item { 
          display: flex; align-items: center; gap: 12px; padding: 15px; 
          background: rgba(255,255,255,0.03); border: 1px solid var(--td-border-glass); 
          border-radius: 10px; font-size: 0.9rem; transition: background 0.3s;
        }
        .td-check-item:hover { background: rgba(255,255,255,0.05); }
        .td-check-icon { color: var(--td-accent); font-size: 1.2rem; }

        .td-timeline-item { 
          position: relative; margin-bottom: 20px; padding: 20px 20px 20px 50px; 
          background: var(--td-bg-card); border: 1px solid var(--td-border-glass); border-radius: 12px; 
        }
        .td-timeline-item::before { 
          content: ''; position: absolute; left: 20px; top: 25px; width: 14px; height: 14px; 
          background: var(--td-primary); border-radius: 50%; box-shadow: 0 0 10px var(--td-primary); 
        }
        .td-t-date { font-family: 'Orbitron'; font-size: 0.9rem; color: var(--td-primary); margin-bottom: 5px; }
        .td-t-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 5px; color: #fff; }
        .td-t-desc { color: var(--td-text-muted); font-size: 0.9rem; }

        .td-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-top: 20px; }
        .td-stat-box { 
          background: rgba(255,255,255,0.03); border: 1px solid var(--td-border-glass); 
          border-radius: 16px; padding: 20px; text-align: center; 
        }
        .td-stat-v { font-family: 'Orbitron'; font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 5px; }
        .td-stat-l { color: var(--td-text-muted); font-size: 0.85rem; }

        .td-highlight-box { padding: 20px; border-radius: 12px; margin: 20px 0; background: rgba(255,255,255,0.03); border-left: 4px solid #fff; }
        .td-hl-ocean { border-color: var(--td-secondary); background: rgba(0, 212, 170, 0.05); }
        .td-hl-fire { border-color: var(--td-primary); background: rgba(255, 107, 53, 0.05); }
        .td-hl-warning { border-color: var(--td-accent); background: rgba(255, 215, 0, 0.05); color: var(--td-accent); }

        .td-tier-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
        .td-tier-og { background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; }
        .td-tier-early { background: linear-gradient(135deg, #E2E8F0, #94A3B8); color: #000; }
        .td-tier-active { background: linear-gradient(135deg, #CD7F32, #A0522D); color: #fff; }
        .td-tier-basic { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }

        .td-footer { border-top: 1px solid var(--td-border-glass); padding: 60px 0; margin-top: 80px; text-align: center; background: rgba(5,5,9,0.8); }

        .td-scroll-top {
          position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px;
          background: var(--td-primary); color: #fff; border: none; border-radius: 50%;
          cursor: pointer; opacity: 0; pointer-events: none; transition: all 0.3s;
          box-shadow: 0 5px 20px rgba(255, 107, 53, 0.4); display: flex; align-items: center; justify-content: center;
          font-size: 20px; z-index: 100;
        }
        .td-btn-visible { opacity: 1; pointer-events: all; }
        .td-scroll-top:hover { transform: translateY(-5px); background: #ff8f5c; }

        .td-fade-in-up { opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out; }
        .td-visible { opacity: 1; transform: translateY(0); }

        .td-text-primary { color: var(--td-primary); }
        .td-text-secondary { color: var(--td-secondary); }
        .td-text-accent { color: var(--td-accent); }
        .td-text-purple { color: var(--td-purple); }
        .td-text-pink { color: var(--td-pink); }
        .td-font-bold { font-weight: 700; }
        .td-mb-2 { margin-bottom: 8px; }
        .td-mb-4 { margin-bottom: 16px; }
        .td-mb-6 { margin-bottom: 24px; }
        .td-mt-6 { margin-top: 24px; }

        @media (max-width: 768px) {
          .td-hero h1 { font-size: 2.5rem; }
          .td-section-title { font-size: 1.5rem; }
          .td-card { padding: 20px; }
        }
      `}</style>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="td-root">
        <header className="td-header">
          <div className="td-container td-flex td-justify-between td-items-center">
            <div className="td-logo-box">
              <TBurnLogo className="w-10 h-10" showText={false} />
              <div className="td-logo-text td-font-orbitron">TBURN</div>
            </div>
            <div className="td-header-icons">
              <a href="/" className="td-header-icon" title="Home"><Home size={18} /></a>
              <a href="/scan" className="td-header-icon" title="Scan"><ScanLine size={18} /></a>
              <a href="/user" className="td-header-icon" title="User"><User size={18} /></a>
              <a href="/bug-bounty" className="td-header-icon" title="Bug Bounty"><Bug size={18} /></a>
              <a href="/security-audit" className="td-header-icon" title="Security Audit"><Shield size={18} /></a>
              <a href="/token-generator" className="td-header-icon" title="Token Generator"><Coins size={18} /></a>
              <a href="/nft-marketplace" className="td-header-icon" title="NFT Marketplace"><ImageIcon size={18} /></a>
              <a href="/qna" className="td-header-icon" title="QnA"><HelpCircle size={18} /></a>
            </div>
          </div>
        </header>

        <nav className="td-nav-wrapper">
          <div className="td-container">
            <div className="td-nav-scroll">
              <a href="#overview" className="td-nav-item td-active">📋 개요</a>
              <a href="#community" className="td-nav-item">👥 커뮤니티</a>
              <a href="#rewards" className="td-nav-item">⛏️ 보상</a>
              <a href="#investors" className="td-nav-item">💰 투자자</a>
              <a href="#ecosystem" className="td-nav-item">🌐 생태계</a>
              <a href="#team" className="td-nav-item">👔 팀</a>
              <a href="#y1schedule" className="td-nav-item">📅 Y1 스케줄</a>
              <a href="#checklist" className="td-nav-item">✅ 체크리스트</a>
              <a href="#calendar" className="td-nav-item">🗓️ 캘린더</a>
            </div>
          </div>
        </nav>

        <main>
          <div className="td-hero td-container">
            <div className="td-fade-in-up">
              <h1 className="td-font-orbitron">토큰 배분 & 운영 가이드</h1>
              <p style={{ color: 'var(--td-text-muted)', fontSize: '1.1rem' }}>
                TBURN 토큰 실제 배분/제공 운영 스케줄 v3.0<br />
                100억 TBURN의 투명하고 예측 가능한 배분 실행 가이드
              </p>
            </div>
            <div className="td-hero-meta td-fade-in-up">
              <div className="td-meta-item">
                <span className="td-meta-label">메인넷 제네시스</span>
                <span className="td-meta-value">2025.12.22</span>
              </div>
              <div className="td-meta-item">
                <span className="td-meta-label">거래소 상장 (목표)</span>
                <span className="td-meta-value">2026.02 (예정)</span>
              </div>
              <div className="td-meta-item">
                <span className="td-meta-label">적용 기간</span>
                <span className="td-meta-value">Year 1</span>
              </div>
            </div>
          </div>

          <section id="overview" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-clipboard-list" style={{ color: 'var(--td-primary)' }}></i></div>
              <h2 className="td-section-title">1. 문서 개요</h2>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">1.1 목적</h3></div>
                <div className="td-highlight-box td-hl-ocean">
                  <p style={{ margin: 0, color: '#fff' }}>
                    이 문서는 TBURN 100억 토큰이 <strong>"누구에게"</strong>, <strong>"언제"</strong>, <strong>"어떻게"</strong> 배분되는지를 실무 운영 관점에서 상세히 정의합니다.
                  </p>
                </div>
                <ul style={{ listStyle: 'none', marginTop: '15px', fontSize: '0.95rem', color: 'var(--td-text-muted)', lineHeight: 2 }}>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> 각 카테고리별 토큰 수령 자격 조건</li>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> 실제 토큰이 지갑으로 전송되는 시점과 방식</li>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> 운영팀이 수행해야 할 배분 프로세스</li>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> 월별/분기별 배분 실행 스케줄</li>
                </ul>
              </div>

              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">1.2 핵심 일정 요약</h3></div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                  <div className="td-timeline-item">
                    <div className="td-t-date">2025.12.22</div>
                    <div className="td-t-title">🔥 메인넷 제네시스</div>
                    <div className="td-t-desc">100억 TBURN 발행, 베스팅 컨트랙트 배포</div>
                  </div>
                  <div className="td-timeline-item">
                    <div className="td-t-date">2026.01.05 ~ 11</div>
                    <div className="td-t-title">💰 시드 라운드</div>
                    <div className="td-t-desc">$0.04, 5억 TBURN, $20M</div>
                  </div>
                  <div className="td-timeline-item">
                    <div className="td-t-date">2026.01.19 ~ 30</div>
                    <div className="td-t-title">💰 퍼블릭 세일</div>
                    <div className="td-t-desc">$0.20, 6억 TBURN, $120M</div>
                  </div>
                  <div className="td-timeline-item">
                    <div className="td-t-date">2026.02 (목표)</div>
                    <div className="td-t-title">🚀 1차 상장 (베스팅 기준일)</div>
                    <div className="td-t-desc">목표 거래소 협의 진행 중</div>
                  </div>
                </div>
                <div className="td-highlight-box td-hl-fire" style={{ marginTop: '20px', fontWeight: 700, textAlign: 'center', color: '#fff' }}>
                  ※ 모든 베스팅 스케줄은 상장일 기준으로 계산됩니다. (일정은 변경될 수 있음)
                </div>
              </div>
            </div>

            <div className="td-card td-mt-6">
              <div className="td-card-header"><h3 className="td-card-title">1.3 토큰 배분 총괄표 (100억 TBURN)</h3></div>
              
              <div className="td-dist-chart">
                <div className="td-dist-item" style={{ borderTop: '3px solid #FF6B35' }}>
                  <div className="td-dist-pct" style={{ color: '#FF6B35' }}>30%</div>
                  <div className="td-dist-amt">30억 TBURN</div>
                  <div className="td-dist-lbl">커뮤니티</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #00D4AA' }}>
                  <div className="td-dist-pct" style={{ color: '#00D4AA' }}>23%</div>
                  <div className="td-dist-amt">23억 TBURN</div>
                  <div className="td-dist-lbl">보상</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #FFD700' }}>
                  <div className="td-dist-pct" style={{ color: '#FFD700' }}>20%</div>
                  <div className="td-dist-amt">20억 TBURN</div>
                  <div className="td-dist-lbl">투자자</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #8B5CF6' }}>
                  <div className="td-dist-pct" style={{ color: '#8B5CF6' }}>15%</div>
                  <div className="td-dist-amt">15억 TBURN</div>
                  <div className="td-dist-lbl">생태계</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #EC4899' }}>
                  <div className="td-dist-pct" style={{ color: '#EC4899' }}>12%</div>
                  <div className="td-dist-amt">12억 TBURN</div>
                  <div className="td-dist-lbl">팀</div>
                </div>
              </div>

              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>대분류</th><th>소분류</th><th>비율</th><th>수량</th><th>배분 방식</th><th>대상</th></tr></thead>
                  <tbody>
                    <tr><td rowSpan={5} style={{ color: 'var(--td-primary)', fontWeight: 700 }}>👥 커뮤니티</td><td>에어드랍</td><td>12.0%</td><td>12.00억</td><td>클레임</td><td>테스트넷 참여자</td></tr>
                    <tr><td>레퍼럴 보상</td><td>3.0%</td><td>3.00억</td><td>자동 지급</td><td>추천인</td></tr>
                    <tr><td>이벤트/캠페인</td><td>4.0%</td><td>4.00억</td><td>이벤트별 배포</td><td>이벤트 참여자</td></tr>
                    <tr><td>커뮤니티 활동</td><td>3.0%</td><td>3.00억</td><td>신청/심사</td><td>기여자</td></tr>
                    <tr><td>DAO 트레저리</td><td>8.0%</td><td>8.00억</td><td>거버넌스 투표</td><td>DAO</td></tr>
                    
                    <tr><td rowSpan={2} style={{ color: 'var(--td-secondary)', fontWeight: 700 }}>⛏️ 보상</td><td>블록 보상</td><td>15.0%</td><td>15.00억</td><td>자동 분배</td><td>검증자</td></tr>
                    <tr><td>검증자 인센티브</td><td>8.0%</td><td>8.00억</td><td>성과 기반</td><td>상위 검증자</td></tr>
                    
                    <tr><td rowSpan={3} style={{ color: 'var(--td-accent)', fontWeight: 700 }}>💰 투자자</td><td>시드 라운드</td><td>5.0%</td><td>5.00억</td><td>베스팅 컨트랙트</td><td>VC</td></tr>
                    <tr><td>프라이빗 라운드</td><td>9.0%</td><td>9.00억</td><td>베스팅 컨트랙트</td><td>기관 투자자</td></tr>
                    <tr><td>퍼블릭 세일</td><td>6.0%</td><td>6.00억</td><td>베스팅 컨트랙트</td><td>일반 참여자</td></tr>
                    
                    <tr className="td-highlight-row"><td colSpan={2}><strong>합계</strong></td><td><strong>100.0%</strong></td><td><strong>100.00억</strong></td><td colSpan={2}></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="community" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-users" style={{ color: 'var(--td-primary)' }}></i></div>
              <h2 className="td-section-title">2. 커뮤니티 (30% = 30억 TBURN)</h2>
            </div>

            <div className="td-card">
              <div className="td-card-header">
                <h3 className="td-card-title">2.1 에어드랍 (12%)</h3>
                <span className="td-badge td-bg-fire">클레임 방식</span>
              </div>
              
              <div className="td-info-grid td-mb-6">
                <div className="td-info-box"><div className="td-info-lbl">총 물량</div><div className="td-info-val">12억 TBURN</div></div>
                <div className="td-info-box"><div className="td-info-lbl">베스팅</div><div className="td-info-val">TGE 10% + 12M 선형</div></div>
                <div className="td-info-box"><div className="td-info-lbl">클레임 기간</div><div className="td-info-val">상장 후 12개월 이내</div></div>
              </div>

              <div className="td-table-wrapper td-mb-6">
                <table>
                  <thead><tr><th>티어</th><th>자격 조건</th><th>배분량</th><th>예상 인원</th><th>인당 평균</th></tr></thead>
                  <tbody>
                    <tr><td><span className="td-tier-tag td-tier-og">OG</span></td><td>테스트넷 전 기간 + 100Tx+</td><td>2.40억 (20%)</td><td>5,000명</td><td>48,000</td></tr>
                    <tr><td><span className="td-tier-tag td-tier-early">Early</span></td><td>테스트넷 1개월+ & 50Tx+</td><td>3.60억 (30%)</td><td>15,000명</td><td>24,000</td></tr>
                    <tr><td><span className="td-tier-tag td-tier-active">Active</span></td><td>테스트넷 2주+ & 20Tx+</td><td>3.60억 (30%)</td><td>30,000명</td><td>12,000</td></tr>
                    <tr><td><span className="td-tier-tag td-tier-basic">Basic</span></td><td>테스트넷 참여 & 5Tx+</td><td>2.40억 (20%)</td><td>50,000명</td><td>4,800</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <div className="td-step"><div className="td-step-num">1</div><div>상장일: 에어드랍 클레임 페이지 오픈 (일정 추후 공지)</div></div>
                <div className="td-step"><div className="td-step-num">2</div><div>사용자: 테스트넷 지갑으로 클레임 페이지 접속</div></div>
                <div className="td-step"><div className="td-step-num">3</div><div>시스템: TGE 10% 즉시 전송 + 나머지 베스팅 컨트랙트 등록</div></div>
                <div className="td-step"><div className="td-step-num">4</div><div>매월 1일: 월간 해제분 자동 클레임 가능</div></div>
              </div>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">2.2 레퍼럴 보상 (3%)</h3></div>
                <div className="td-info-grid td-mb-4">
                  <div className="td-info-box"><div className="td-info-lbl">베스팅</div><div className="td-info-val">TGE 5% + 24M 선형</div></div>
                  <div className="td-info-box"><div className="td-info-lbl">방식</div><div className="td-info-val">자동 지급</div></div>
                </div>
                <div className="td-table-wrapper">
                  <table>
                    <thead><tr><th>활동</th><th>추천인</th><th>피추천인</th></tr></thead>
                    <tbody>
                      <tr><td>가입+Tx</td><td>50 TBURN</td><td>50 TBURN</td></tr>
                      <tr><td>세일 참여</td><td>1%</td><td>0.5%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">2.3 이벤트/캠페인 (4%)</h3></div>
                <div className="td-info-grid td-mb-4">
                  <div className="td-info-box"><div className="td-info-lbl">베스팅</div><div className="td-info-val">TGE 10% + 24M 선형</div></div>
                  <div className="td-info-box"><div className="td-info-lbl">방식</div><div className="td-info-val">이벤트별 배포</div></div>
                </div>
                <ul style={{ listStyle: 'none', fontSize: '0.95rem', color: 'var(--td-text-muted)' }}>
                  <li style={{ marginBottom: '8px' }}>• 상장 기념 런칭 에어드랍 (0.4억)</li>
                  <li style={{ marginBottom: '8px' }}>• 지갑 활성화 캠페인 (0.2억)</li>
                  <li>• Tier-1 거래소 상장 기념 (0.3억) *</li>
                </ul>
              </div>
            </div>

            <div className="td-card">
              <div className="td-card-header"><h3 className="td-card-title">2.5 DAO 트레저리 (8%)</h3><span className="td-badge td-bg-fire">12M 클리프</span></div>
              <div className="td-highlight-box td-hl-ocean" style={{ marginTop: 0 }}>
                <p style={{ margin: 0, color: '#fff' }}><strong>⚠️ Y1 기간에는 토큰 해제 없음 (전량 락업)</strong></p>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#fff' }}>해제 시작: 상장 1주년 | 용도: 거버넌스 투표로 결정</p>
              </div>
            </div>
          </section>

          <section id="rewards" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-hammer" style={{ color: 'var(--td-secondary)' }}></i></div>
              <h2 className="td-section-title">3. 보상 (23% = 23억 TBURN)</h2>
            </div>

            <div className="td-card">
              <div className="td-card-header"><h3 className="td-card-title">3.1 블록 보상 (15%) & 반감기</h3><span className="td-badge td-bg-ocean">20년 배분</span></div>
              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>반감기</th><th>기간</th><th>블록당 보상</th><th>연간 발행</th><th>비고</th></tr></thead>
                  <tbody>
                    <tr><td>1기</td><td>Year 1~4</td><td style={{ color: 'var(--td-secondary)', fontWeight: 700 }}>10 TBURN</td><td>6.31억</td><td>초기 채굴자 혜택 극대화</td></tr>
                    <tr><td>2기</td><td>Year 5~8</td><td>5 TBURN</td><td>3.15억</td><td>1차 반감기</td></tr>
                    <tr><td>3기</td><td>Year 9~12</td><td>2.5 TBURN</td><td>1.58억</td><td>2차 반감기</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="td-stat-grid">
                <div className="td-stat-box">
                  <div className="td-stat-v" style={{ color: 'var(--td-secondary)' }}>125</div>
                  <div className="td-stat-l">검증자 수</div>
                </div>
                <div className="td-stat-box">
                  <div className="td-stat-v">~6.3억</div>
                  <div className="td-stat-l">Y1 총 보상량</div>
                </div>
                <div className="td-stat-box">
                  <div className="td-stat-v">~42만</div>
                  <div className="td-stat-l">검증자당 월평균</div>
                </div>
              </div>
            </div>

            <div className="td-card">
              <div className="td-card-header"><h3 className="td-card-title">3.2 검증자 인센티브 (8%)</h3><span className="td-badge td-bg-gold">성과 기반</span></div>
              <div className="td-info-grid td-mb-4">
                <div className="td-info-box"><div className="td-info-lbl">배분 기간</div><div className="td-info-val">60개월 선형</div></div>
                <div className="td-info-box"><div className="td-info-lbl">월간 예산</div><div className="td-info-val">1,333만 TBURN</div></div>
              </div>
              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>유형</th><th>비율</th><th>월간 예산</th><th>조건</th></tr></thead>
                  <tbody>
                    <tr><td>업타임 보너스</td><td>40%</td><td>533만</td><td>99.9%+ 가동</td></tr>
                    <tr><td>블록 생성 성과</td><td>30%</td><td>400만</td><td>생성 수 상위 25%</td></tr>
                    <tr><td>네트워크 기여</td><td>20%</td><td>267만</td><td>제안/투표 참여</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="investors" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-coins" style={{ color: 'var(--td-accent)' }}></i></div>
              <h2 className="td-section-title">4. 투자자 (20% = 20억 TBURN)</h2>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">Seed Round (5%)</h3><span className="td-badge td-bg-gold">$0.04</span></div>
                <div className="td-info-grid td-mb-4" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="td-info-box"><div className="td-info-lbl">베스팅</div><div className="td-info-val">12M 클리프 + 24M 선형</div></div>
                </div>
                <div className="td-highlight-box td-hl-warning" style={{ margin: 0 }}>
                  <strong>⚠️ Y1 해제량: 0 TBURN</strong><br />
                  첫 해제: 2027년 2월 1일
                </div>
              </div>

              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">Private Round (9%)</h3><span className="td-badge td-bg-ocean">$0.10</span></div>
                <div className="td-info-grid td-mb-4" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="td-info-box"><div className="td-info-lbl">베스팅</div><div className="td-info-val">9M 클리프 + 18M 선형</div></div>
                </div>
                <div className="td-highlight-box td-hl-ocean" style={{ margin: 0, color: '#fff' }}>
                  <strong>🔓 Y1 해제량: 1.5억 TBURN</strong><br />
                  첫 해제: 2026년 11월 1일 (3개월분)
                </div>
              </div>

              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">Public Sale (6%)</h3><span className="td-badge td-bg-fire">$0.20</span></div>
                <div className="td-info-grid td-mb-4" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="td-info-box"><div className="td-info-lbl">베스팅</div><div className="td-info-val">TGE 20% + 3M 클리프 + 9M 선형</div></div>
                </div>
                <div className="td-highlight-box td-hl-fire" style={{ margin: 0, color: '#fff' }}>
                  <strong>🔓 Y1 해제량: 6.0억 TBURN (100%)</strong><br />
                  TGE 1.2억 + 월별 해제 완료
                </div>
              </div>
            </div>
          </section>

          <section id="ecosystem" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-globe" style={{ color: 'var(--td-purple)' }}></i></div>
              <h2 className="td-section-title">5. 생태계 (15% = 15억 TBURN)</h2>
            </div>
            
            <div className="td-card">
              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>항목</th><th>물량</th><th>베스팅</th><th>Y1 활동/해제</th></tr></thead>
                  <tbody>
                    <tr>
                      <td className="td-font-bold" style={{ color: 'var(--td-purple)' }}>생태계 펀드</td>
                      <td>8억 (8%)</td>
                      <td>60M 선형</td>
                      <td>그랜트 30~50건 집행 (약 1.6억 해제)</td>
                    </tr>
                    <tr>
                      <td className="td-font-bold" style={{ color: 'var(--td-purple)' }}>파트너십</td>
                      <td>4억 (4%)</td>
                      <td>6M 클리프 + 36M 선형</td>
                      <td>0.67억 해제 (8월부터 시작)</td>
                    </tr>
                    <tr>
                      <td className="td-font-bold" style={{ color: 'var(--td-purple)' }}>마케팅</td>
                      <td>3억 (3%)</td>
                      <td>TGE 15% + 24M 선형</td>
                      <td>1.73억 해제 (KOL, 거래소 마케팅)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="team" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-user-tie" style={{ color: 'var(--td-pink)' }}></i></div>
              <h2 className="td-section-title">6. 팀 (12% = 12억 TBURN)</h2>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-text-pink td-mb-2">코어 팀 (8%)</h3>
                <div className="td-badge td-bg-pink td-mb-4">18M 클리프</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>첫 해제: 2027.08.01</p>
              </div>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-text-purple td-mb-2">어드바이저 (2%)</h3>
                <div className="td-badge td-bg-purple td-mb-4">12M 클리프</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>첫 해제: 2027.02.01</p>
              </div>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-text-secondary td-mb-2">전략 파트너 (2%)</h3>
                <div className="td-badge td-bg-ocean td-mb-4">6M 클리프</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>첫 해제: 2026.08.01</p>
              </div>
            </div>
            <div className="td-highlight-box td-hl-warning td-text-center">
              <strong>⚠️ Y1 기간 동안 코어 팀 및 어드바이저 물량은 100% 락업되어 시장에 나오지 않습니다.</strong>
            </div>
          </section>

          <section id="y1schedule" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-calendar-alt" style={{ color: 'var(--td-primary)' }}></i></div>
              <h2 className="td-section-title">7. Year-1 월별 배분 실행 스케줄</h2>
            </div>

            <div className="td-card">
              <div className="td-flex td-justify-between td-items-center td-mb-4">
                <p style={{ color: 'var(--td-text-muted)', fontSize: '0.9rem' }}>단위: 억 TBURN</p>
                <div className="td-badge td-bg-fire">총 해제: 32.68억 (32.7%)</div>
              </div>
              <div className="td-table-wrapper">
                <table style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr><th>시점</th><th>에어드랍</th><th>레퍼럴</th><th>이벤트</th><th>블록/검증</th><th>퍼블릭</th><th>프라이빗</th><th>생태계/마케팅</th><th>월합계</th><th>주요 이벤트</th></tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'rgba(255,107,53,0.15)', fontWeight: 700 }}>
                      <td>상장일</td><td>1.200</td><td>0.150</td><td>0.400</td><td>-</td><td>1.200</td><td>-</td><td>0.450</td><td className="td-text-primary">3.400</td><td>🚀 1차 상장 (목표)</td>
                    </tr>
                    <tr><td>M1</td><td>0.900</td><td>0.119</td><td>0.150</td><td>0.350</td><td>-</td><td>-</td><td>0.239</td><td>1.758</td><td>블록보상 시작</td></tr>
                    <tr><td>M2</td><td>0.900</td><td>0.119</td><td>0.300</td><td>0.350</td><td>-</td><td>-</td><td>0.239</td><td>1.908</td><td>Tier-1 상장 목표 *</td></tr>
                    <tr><td>M3</td><td>0.900</td><td>0.119</td><td>0.150</td><td>0.350</td><td>-</td><td>-</td><td>0.239</td><td>1.841</td><td>퍼블릭 클리프 끝</td></tr>
                    <tr><td>M4</td><td>0.900</td><td>0.119</td><td>0.150</td><td>0.350</td><td>0.533</td><td>-</td><td>0.239</td><td>2.374</td><td>퍼블릭 베스팅</td></tr>
                    <tr><td>M6</td><td>0.900</td><td>0.119</td><td>0.250</td><td>0.350</td><td>0.533</td><td>-</td><td>0.350</td><td>2.585</td><td>파트너십 시작</td></tr>
                    <tr><td>M10</td><td>0.900</td><td>0.119</td><td>0.100</td><td>0.350</td><td>0.533</td><td>0.500</td><td>0.350</td><td>2.935</td><td>프라이빗 시작</td></tr>
                    <tr style={{ background: 'rgba(255,107,53,0.15)', fontWeight: 700 }}>
                      <td>M12</td><td>0.900</td><td>0.119</td><td>0.300</td><td>0.350</td><td>0.536</td><td>0.500</td><td>0.350</td><td className="td-text-primary">3.138</td><td>🎉 1주년</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="td-container td-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <section id="checklist" className="td-section td-fade-in-up">
              <div className="td-section-header">
                <div className="td-section-icon"><i className="fas fa-check-double" style={{ color: 'var(--td-secondary)' }}></i></div>
                <h2 className="td-section-title">8. 운영 체크리스트</h2>
              </div>
              <div className="td-card">
                <div className="td-checklist">
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> 베스팅 컨트랙트 월간 해제 확인</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> 블록 보상 정산 및 지급</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> 레퍼럴 보상 자동 지급 확인</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> 그랜트 마일스톤 지급 처리</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> 월간 토큰 배분 리포트 작성</div>
                </div>
              </div>
            </section>

            <section id="calendar" className="td-section td-fade-in-up">
              <div className="td-section-header">
                <div className="td-section-icon"><i className="fas fa-calendar-check" style={{ color: 'var(--td-accent)' }}></i></div>
                <h2 className="td-section-title">9. 주요 일정</h2>
              </div>
              <div className="td-card">
                <div className="td-table-wrapper">
                  <table>
                    <thead><tr><th>날짜</th><th>이벤트</th><th>해제 물량</th></tr></thead>
                    <tbody>
                      <tr style={{ background: 'rgba(255,107,53,0.1)' }}><td>2026.02 (목표)</td><td className="td-font-bold">🚀 상장일 (예정)</td><td>3.40억</td></tr>
                      <tr><td>2026.05.01</td><td>퍼블릭 베스팅 시작</td><td>+0.53억/월</td></tr>
                      <tr><td>2026.08.01</td><td>파트너십 시작</td><td>+0.11억/월</td></tr>
                      <tr><td>2026.11.01</td><td>프라이빗 시작</td><td>+0.50억/월</td></tr>
                      <tr style={{ background: 'rgba(255,107,53,0.1)' }}><td>2027.02.01</td><td className="td-font-bold">🎉 1주년</td><td>+3.13억</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          <div className="td-container td-fade-in-up">
            <div className="td-card" style={{ border: '2px solid var(--td-primary-glow)' }}>
              <div className="td-card-header"><h3 className="td-card-title">📋 문서 정보</h3></div>
              <div className="td-info-grid">
                <div className="td-info-box"><div className="td-info-lbl">문서 제목</div><div className="td-info-val">TBURN 토큰 배분 운영 스케줄</div></div>
                <div className="td-info-box"><div className="td-info-lbl">버전</div><div className="td-info-val">3.0.0 Final</div></div>
                <div className="td-info-box"><div className="td-info-lbl">계획 기간</div><div className="td-info-val">2025.12.22 ~ 2027.02.01</div></div>
                <div className="td-info-box"><div className="td-info-lbl">Y1 총 해제</div><div className="td-info-val td-text-primary">32.68억 (32.7%)</div></div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--td-text-muted)', fontSize: '0.85rem' }}>
                작성: TBURN 재단 전략기획실 | 승인: 이사회
              </div>
            </div>
          </div>

          <div className="td-container td-fade-in-up" style={{ marginTop: '40px' }}>
            <div className="td-card" style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <div className="td-card-header"><h3 className="td-card-title" style={{ color: 'var(--td-accent)' }}>⚠️ 면책 조항 (Disclaimer)</h3></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--td-text-muted)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong>투자 권유가 아님:</strong> 본 문서는 정보 제공 목적으로만 작성되었으며, 증권, 투자상품 또는 금융상품의 매수, 매도, 보유를 권유하거나 제안하는 것이 아닙니다.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>미래 예측 진술:</strong> 본 문서에 포함된 일정, 거래소 상장, 가격, 배분 계획 등은 현재 계획에 기반한 예상치이며, 실제 결과는 시장 상황, 규제 환경, 기술적 요인 등에 따라 달라질 수 있습니다. "*" 표시된 항목은 목표 또는 협의 진행 중인 사항입니다.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>변경 가능성:</strong> 토큰 배분 일정, 베스팅 조건, 거래소 상장 계획 등 모든 정보는 사전 통지 없이 변경될 수 있습니다. 최신 정보는 공식 채널을 통해 확인하시기 바랍니다.
                </p>
                <p>
                  <strong>법적 책임 제한:</strong> TBURN 재단 및 관계사는 본 문서의 정보에 기반한 투자 결정으로 인한 손실에 대해 법적 책임을 지지 않습니다.
                </p>
              </div>
            </div>
          </div>

          <footer className="td-footer">
            <div className="td-container">
              <div className="td-logo-box td-justify-center td-mb-4">
                <TBurnLogo className="w-10 h-10" showText={false} />
                <div className="td-logo-text td-font-orbitron">TBURN</div>
              </div>
              <p style={{ color: 'var(--td-text-muted)' }}>투명하고 예측 가능한 토큰 배분 시스템</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '15px', maxWidth: '600px', margin: '15px auto 0' }}>
                본 문서의 모든 일정과 수치는 예정 사항이며 변경될 수 있습니다. 투자 결정 시 반드시 전문가와 상담하시기 바랍니다.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', marginTop: '20px' }}>
                © 2025 TBURN Foundation. All Rights Reserved.
              </p>
            </div>
          </footer>

          <button className="td-scroll-top" onClick={scrollToTop} data-testid="button-scroll-top">
            <i className="fas fa-arrow-up"></i>
          </button>
        </main>
      </div>
    </>
  );
}
