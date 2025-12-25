import { useEffect } from 'react';
import { TBurnLogo } from "@/components/tburn-logo";

export default function TokenSchedule() {
  useEffect(() => {
    const navItems = document.querySelectorAll('.ts-nav-item');
    const sections = document.querySelectorAll('.ts-section');
    const scrollTopBtn = document.querySelector('.ts-scroll-top');

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ts-visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.ts-fade-in-up').forEach(el => observer.observe(el));

    const handleScroll = () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute('id') || '';
        }
      });

      navItems.forEach(item => {
        item.classList.remove('ts-active');
        if (item.getAttribute('href') === '#' + current) {
          item.classList.add('ts-active');
        }
      });

      if (scrollTopBtn) {
        if (window.scrollY > 500) scrollTopBtn.classList.add('ts-btn-visible');
        else scrollTopBtn.classList.remove('ts-btn-visible');
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
        .ts-root {
          --ts-bg-deep: #050509;
          --ts-bg-panel: rgba(20, 25, 40, 0.6);
          --ts-bg-card: rgba(30, 35, 55, 0.4);
          --ts-border-glass: rgba(255, 255, 255, 0.08);
          --ts-primary: #FF6B35;
          --ts-primary-glow: rgba(255, 107, 53, 0.4);
          --ts-secondary: #00D4AA;
          --ts-accent: #FFD700;
          --ts-purple: #8B5CF6;
          --ts-pink: #EC4899;
          --ts-text-main: #FFFFFF;
          --ts-text-muted: #94A3B8;
          --ts-container-width: 1280px;
        }

        .ts-root {
          background-color: var(--ts-bg-deep);
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(255, 107, 53, 0.08), transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(0, 212, 170, 0.08), transparent 25%);
          color: var(--ts-text-main);
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .ts-root h1, .ts-root h2, .ts-root h3, .ts-root h4, .ts-font-orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 0.5px; }
        .ts-font-mono { font-family: 'JetBrains Mono', monospace; }

        .ts-container { max-width: var(--ts-container-width); margin: 0 auto; padding: 0 24px; }
        .ts-grid { display: grid; gap: 24px; }
        .ts-flex { display: flex; }
        .ts-items-center { align-items: center; }
        .ts-justify-between { justify-content: space-between; }
        .ts-justify-center { justify-content: center; }
        .ts-gap-4 { gap: 16px; }

        .ts-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: rgba(5, 5, 9, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--ts-border-glass);
          height: 80px;
          display: flex;
          align-items: center;
        }

        .ts-logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ts-logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--ts-primary), #FF9F43);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 20px var(--ts-primary-glow);
        }
        .ts-logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(to right, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ts-nav-wrapper {
          position: sticky;
          top: 80px;
          z-index: 900;
          background: rgba(5, 5, 9, 0.9);
          border-bottom: 1px solid var(--ts-border-glass);
          padding: 12px 0;
          backdrop-filter: blur(10px);
        }
        .ts-nav-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .ts-nav-scroll::-webkit-scrollbar { display: none; }
        .ts-nav-item {
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--ts-text-muted);
          text-decoration: none;
          border: 1px solid transparent;
          transition: all 0.3s ease;
          white-space: nowrap;
          cursor: pointer;
        }
        .ts-nav-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .ts-active {
          background: rgba(255, 107, 53, 0.15);
          border-color: rgba(255, 107, 53, 0.3);
          color: var(--ts-primary);
          box-shadow: 0 0 15px rgba(255, 107, 53, 0.1);
        }

        .ts-hero {
          padding: 100px 0 60px;
          text-align: center;
          position: relative;
        }
        .ts-hero h1 {
          font-size: clamp(3rem, 6vw, 4.5rem);
          font-weight: 700;
          margin-bottom: 24px;
          letter-spacing: -0.025em;
          line-height: 1.1;
          background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(255,255,255,0.1);
        }
        .ts-hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-top: 60px;
        }
        .ts-hero-stat-card {
          background: var(--ts-bg-panel);
          border: 1px solid var(--ts-border-glass);
          padding: 30px;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .ts-hero-stat-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
        .ts-hero-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 4px;
          background: linear-gradient(90deg, var(--c), transparent);
        }
        .ts-stat-val { font-size: 2.5rem; font-weight: 700; margin-bottom: 5px; color: #fff; }
        .ts-stat-lbl { font-size: 0.9rem; color: var(--ts-text-muted); text-transform: uppercase; letter-spacing: 1px; }

        .ts-section { padding: 80px 0; border-bottom: 1px solid rgba(255,255,255,0.03); scroll-margin-top: 140px; }
        .ts-section-header { margin-bottom: 40px; display: flex; align-items: center; gap: 15px; }
        .ts-section-icon { 
          width: 50px; height: 50px; 
          border-radius: 16px; 
          background: rgba(255,255,255,0.05); 
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          border: 1px solid var(--ts-border-glass);
        }
        .ts-section-title { font-size: 2rem; font-weight: 700; color: #fff; }

        .ts-card {
          background: var(--ts-bg-card);
          border: 1px solid var(--ts-border-glass);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .ts-card:hover { border-color: rgba(255,255,255,0.15); box-shadow: 0 15px 50px rgba(0,0,0,0.3); }
        .ts-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--ts-border-glass); }
        .ts-card-title { font-size: 1.25rem; font-weight: 600; color: #fff; }

        .ts-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .ts-bg-fire { background: rgba(255, 107, 53, 0.15); color: var(--ts-primary); border: 1px solid rgba(255, 107, 53, 0.3); }
        .ts-bg-ocean { background: rgba(0, 212, 170, 0.15); color: var(--ts-secondary); border: 1px solid rgba(0, 212, 170, 0.3); }
        .ts-bg-gold { background: rgba(255, 215, 0, 0.15); color: var(--ts-accent); border: 1px solid rgba(255, 215, 0, 0.3); }
        .ts-bg-purple { background: rgba(139, 92, 246, 0.15); color: var(--ts-purple); border: 1px solid rgba(139, 92, 246, 0.3); }

        .ts-table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid var(--ts-border-glass); }
        .ts-root table { width: 100%; border-collapse: collapse; font-size: 0.95rem; white-space: nowrap; }
        .ts-root th { background: rgba(255,255,255,0.03); color: var(--ts-text-muted); font-weight: 600; text-align: left; padding: 16px; font-size: 0.8rem; text-transform: uppercase; }
        .ts-root td { padding: 16px; border-top: 1px solid var(--ts-border-glass); color: #fff; }
        .ts-root tr:hover td { background: rgba(255,255,255,0.02); }
        
        .ts-phase-header td { background: rgba(255,255,255,0.05); color: var(--ts-accent); font-weight: 700; font-family: 'Orbitron'; letter-spacing: 1px; }
        .ts-total-row td { background: rgba(255, 107, 53, 0.1); font-weight: 700; color: var(--ts-primary); border-top: 2px solid rgba(255, 107, 53, 0.3); }

        .ts-chart-row { display: flex; align-items: center; margin-bottom: 12px; height: 36px; }
        .ts-chart-label { width: 60px; font-family: 'Orbitron'; font-weight: 600; color: var(--ts-text-muted); font-size: 0.9rem; }
        .ts-chart-track { flex: 1; background: rgba(255,255,255,0.05); height: 100%; border-radius: 6px; overflow: hidden; position: relative; margin: 0 15px; }
        .ts-chart-fill { height: 100%; display: flex; align-items: center; padding-left: 12px; font-size: 0.85rem; font-weight: 700; color: #000; transition: width 1s ease-out; }
        .ts-chart-value-text { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: #fff; font-weight: 600; }

        .ts-milestone {
          display: flex; align-items: center; gap: 20px; padding: 20px;
          background: linear-gradient(90deg, rgba(255,255,255,0.02), transparent);
          border-left: 4px solid var(--ts-text-muted);
          border-radius: 0 12px 12px 0;
          margin-bottom: 12px;
        }
        .ts-milestone.ts-milestone-active { border-left-color: var(--ts-secondary); background: linear-gradient(90deg, rgba(0,212,170,0.1), transparent); }
        .ts-m-year { font-family: 'Orbitron'; font-size: 1.2rem; font-weight: 700; color: #fff; width: 60px; }
        .ts-m-val { font-family: 'JetBrains Mono'; color: var(--ts-secondary); font-weight: 700; width: 140px; }
        .ts-m-desc { color: var(--ts-text-muted); font-size: 0.95rem; }

        .ts-footer {
          border-top: 1px solid var(--ts-border-glass);
          padding: 60px 0;
          margin-top: 80px;
          text-align: center;
          background: rgba(5,5,9,0.8);
        }

        .ts-scroll-top {
          position: fixed; bottom: 30px; right: 30px;
          width: 50px; height: 50px;
          background: var(--ts-primary);
          color: #fff;
          border: none; border-radius: 50%;
          cursor: pointer;
          opacity: 0; pointer-events: none;
          transition: all 0.3s;
          box-shadow: 0 5px 20px rgba(255, 107, 53, 0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          z-index: 100;
        }
        .ts-btn-visible { opacity: 1; pointer-events: all; }
        .ts-scroll-top:hover { transform: translateY(-5px); background: #ff8f5c; }

        .ts-fade-in-up { opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out; }
        .ts-visible { opacity: 1; transform: translateY(0); }

        .ts-text-secondary { color: var(--ts-secondary); }
        .ts-text-primary { color: var(--ts-primary); }
        .ts-text-accent { color: var(--ts-accent); }
        .ts-text-purple { color: var(--ts-purple); }
        .ts-text-pink { color: var(--ts-pink); }
        .ts-font-bold { font-weight: 700; }
        .ts-mb-4 { margin-bottom: 16px; }
        .ts-mb-1 { margin-bottom: 4px; }
        .ts-border-b { border-bottom: 1px solid var(--ts-border-glass); }
        .ts-pb-2 { padding-bottom: 8px; }

        @media (max-width: 768px) {
          .ts-hero h1 { font-size: 2.5rem; }
          .ts-hero-stats { grid-template-columns: 1fr 1fr; }
          .ts-section-title { font-size: 1.5rem; }
          .ts-card { padding: 20px; }
        }
      `}</style>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="ts-root">
        <header className="ts-header">
          <div className="ts-container ts-flex ts-justify-between ts-items-center">
            <div className="ts-logo-box">
              <TBurnLogo className="w-10 h-10" showText={false} />
              <div className="ts-logo-text ts-font-orbitron">TBURN</div>
            </div>
            <div className="ts-badge ts-bg-ocean">v3.0.0 Enterprise Edition</div>
          </div>
        </header>

        <nav className="ts-nav-wrapper">
          <div className="ts-container">
            <div className="ts-nav-scroll">
              <a href="#overview" className="ts-nav-item ts-active">📋 기본 구조</a>
              <a href="#schedule" className="ts-nav-item">📊 20년 스케줄</a>
              <a href="#phase1" className="ts-nav-item">📈 성장기</a>
              <a href="#phase2" className="ts-nav-item">🔥 디플레기</a>
              <a href="#phase3" className="ts-nav-item">⚖️ 균형기</a>
              <a href="#phase4" className="ts-nav-item">⚙️ 최적화기</a>
              <a href="#visual" className="ts-nav-item">📉 시각화</a>
              <a href="#comparison" className="ts-nav-item">⚔️ 비교분석</a>
              <a href="#summary" className="ts-nav-item">🏆 종합성과</a>
            </div>
          </div>
        </nav>

        <main>
          <div className="ts-hero ts-container">
            <div className="ts-fade-in-up">
              <h1 className="ts-font-orbitron">TBURN TOKEN ECONOMICS</h1>
              <p style={{ color: 'var(--ts-text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
                2025 ~ 2045 Long-term Deflationary Roadmap<br />
                블록 발행, AI 소각, 공급량 변화 종합 시뮬레이션
              </p>
            </div>

            <div className="ts-hero-stats ts-fade-in-up">
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-primary)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">100억</div>
                <div className="ts-stat-lbl">초기 공급량 (Start)</div>
              </div>
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-secondary)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">69.4억</div>
                <div className="ts-stat-lbl">최종 공급량 (Y20)</div>
              </div>
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-pink)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">-30.6억</div>
                <div className="ts-stat-lbl">총 소각량 (Burn)</div>
              </div>
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-purple)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">-30.6%</div>
                <div className="ts-stat-lbl">총 감소율 (Rate)</div>
              </div>
            </div>
          </div>

          <section id="overview" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-clipboard-list" style={{ color: 'var(--ts-primary)' }}></i></div>
              <h2 className="ts-section-title">1. 토큰 이코노미 기본 구조</h2>
            </div>

            <div className="ts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title"><i className="fas fa-plus-circle" style={{ color: 'var(--ts-primary)', marginRight: '8px' }}></i> 공급 메커니즘</h3>
                  <span className="ts-badge ts-bg-fire">INFLATION</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>블록 보상 풀</span>
                    <span className="ts-font-bold">15억 TBURN (15%)</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>배분 기간</span>
                    <span className="ts-font-bold">20년 (240개월)</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>블록 시간</span>
                    <span className="ts-font-bold">0.5초</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--ts-secondary)', marginBottom: '8px' }}>⚡ 반감기 일정</h4>
                    <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>
                      <li style={{ marginBottom: '5px' }}>• <strong>1차 반감기 (Y6):</strong> 발행량 17.6% 감소</li>
                      <li>• <strong>2차 반감기 (Y9):</strong> 발행량 10% 추가 감소</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title"><i className="fas fa-fire" style={{ color: 'var(--ts-secondary)', marginRight: '8px' }}></i> 소각 메커니즘</h3>
                  <span className="ts-badge ts-bg-ocean">DEFLATION</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(0,212,170,0.05)', borderRadius: '10px', border: '1px solid rgba(0,212,170,0.1)' }}>
                    <div className="ts-font-bold ts-text-secondary ts-mb-1">AI 연산 수수료 소각</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>AI 추론/학습 비용 및 에이전트 수수료 100% 소각</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,212,170,0.05)', borderRadius: '10px', border: '1px solid rgba(0,212,170,0.1)' }}>
                    <div className="ts-font-bold ts-text-secondary ts-mb-1">트랜잭션 수수료 소각</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>기본 가스비의 50% 영구 소각 (나머지 50% 검증자)</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,212,170,0.05)', borderRadius: '10px', border: '1px solid rgba(0,212,170,0.1)' }}>
                    <div className="ts-font-bold ts-text-secondary ts-mb-1">Special Events</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>분기별 바이백 & 번 프로그램 가동</div>
                  </div>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title"><i className="fas fa-flag-checkered" style={{ color: 'var(--ts-accent)', marginRight: '8px' }}></i> Phase 목표</h3>
                  <span className="ts-badge ts-bg-gold">VISION</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-primary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-primary)' }}>Phase 1 (Y1-Y5)</div>
                    <div style={{ fontWeight: 700 }}>성장기: 생태계 구축</div>
                  </div>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-secondary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-secondary)' }}>Phase 2 (Y6-Y10)</div>
                    <div style={{ fontWeight: 700 }}>디플레기: 가속 소각</div>
                  </div>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-accent)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-accent)' }}>Phase 3 (Y11-Y15)</div>
                    <div style={{ fontWeight: 700 }}>균형기: 완전 안정화</div>
                  </div>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-purple)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-purple)' }}>Phase 4 (Y16-Y20)</div>
                    <div style={{ fontWeight: 700 }}>최적화기: 가치 완성</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="schedule" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-table" style={{ color: 'var(--ts-secondary)' }}></i></div>
              <h2 className="ts-section-title">2. 20년 종합 스케줄</h2>
            </div>

            <div className="ts-card">
              <p style={{ color: 'var(--ts-text-muted)', marginBottom: '20px' }}>
                <i className="fas fa-info-circle"></i> 메인넷 제네시스(2025.12.22) 기준 20년간의 공급량 시뮬레이션 (단위: 억 TBURN)
              </p>
              <div className="ts-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>연도/기간</th>
                      <th>단계</th>
                      <th>시작 공급</th>
                      <th style={{ color: 'var(--ts-primary)' }}>블록 발행 (+)</th>
                      <th style={{ color: 'var(--ts-pink)' }}>AI 소각 (-)</th>
                      <th>순 변화</th>
                      <th>총 공급</th>
                      <th>감소율</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'rgba(255, 107, 53, 0.1)' }}>
                      <td className="ts-font-orbitron ts-font-bold">Y0</td>
                      <td><span className="ts-badge ts-bg-fire">제네시스</span></td>
                      <td>100.00</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td className="ts-font-bold">100.00</td>
                      <td>0.00%</td>
                      <td>메인넷 런칭</td>
                    </tr>
                    
                    <tr className="ts-phase-header"><td colSpan={9}>PHASE 1: 성장기 (생태계 구축 및 초기 디플레이션)</td></tr>
                    <tr><td>Y1-Q1</td><td>성장</td><td>100.00</td><td>+0.80</td><td>-1.00</td><td>-0.20</td><td>99.80</td><td>-0.20%</td><td>초기 유저 유치</td></tr>
                    <tr><td>Y1-Q2</td><td>성장</td><td>99.80</td><td>+0.60</td><td>-1.40</td><td>-0.80</td><td>99.00</td><td>-0.80%</td><td>성장 가속</td></tr>
                    <tr><td>Y1-H2</td><td>성장</td><td>99.00</td><td>+1.20</td><td>-3.20</td><td>-2.00</td><td>97.00</td><td>-2.02%</td><td>생태계 확장</td></tr>
                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}><td><strong>Y1 Total</strong></td><td></td><td></td><td className="ts-font-mono">+2.60</td><td className="ts-font-mono">-5.60</td><td className="ts-font-mono ts-text-pink">-3.00</td><td className="ts-font-bold">97.00</td><td>-3.00%</td><td></td></tr>
                    
                    <tr><td>Y2</td><td>디플레</td><td>97.00</td><td>+2.00</td><td>-5.10</td><td>-3.10</td><td>93.90</td><td>-3.20%</td><td>지속 성장</td></tr>
                    <tr><td>Y3</td><td>디플레</td><td>93.90</td><td>+1.90</td><td>-5.00</td><td>-3.10</td><td>90.80</td><td>-3.30%</td><td>대량 채택</td></tr>
                    <tr><td>Y4</td><td>디플레</td><td>90.80</td><td>+1.80</td><td>-4.90</td><td>-3.10</td><td>87.70</td><td>-3.41%</td><td>기업 통합</td></tr>
                    <tr><td>Y5</td><td>디플레</td><td>87.70</td><td>+1.70</td><td>-4.80</td><td>-3.10</td><td>84.60</td><td>-3.53%</td><td>플랫폼 성숙</td></tr>

                    <tr className="ts-phase-header"><td colSpan={9}>PHASE 2: 디플레이션기 (반감기 적용 & 가속)</td></tr>
                    <tr><td>Y6 ⚡</td><td>디플레</td><td>84.60</td><td>+1.40</td><td>-4.20</td><td>-2.80</td><td>81.80</td><td>-3.31%</td><td>1차 반감기</td></tr>
                    <tr><td>Y7</td><td>디플레</td><td>81.80</td><td>+1.20</td><td>-4.00</td><td>-2.80</td><td>79.00</td><td>-3.42%</td><td>안정화</td></tr>
                    <tr><td>Y8</td><td>디플레</td><td>79.00</td><td>+1.00</td><td>-3.80</td><td>-2.80</td><td>76.20</td><td>-3.54%</td><td>기관급</td></tr>
                    <tr><td>Y9 ⚡</td><td>디플레</td><td>76.20</td><td>+0.90</td><td>-3.60</td><td>-2.70</td><td>73.50</td><td>-3.54%</td><td>2차 반감기</td></tr>
                    <tr><td>Y10 🎉</td><td>디플레</td><td>73.50</td><td>+0.80</td><td>-3.50</td><td>-2.70</td><td>70.80</td><td>-3.67%</td><td>10년 달성</td></tr>

                    <tr className="ts-phase-header"><td colSpan={9}>PHASE 3: 균형기 (발행 = 소각)</td></tr>
                    <tr><td>Y11</td><td>균형</td><td>70.80</td><td>+0.70</td><td>-1.40</td><td>-0.70</td><td>70.10</td><td>-0.99%</td><td>균형 시작</td></tr>
                    <tr><td>Y12</td><td>균형</td><td>70.10</td><td>+0.65</td><td>-0.65</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>완전 균형</td></tr>
                    <tr><td>Y13</td><td>균형</td><td>70.10</td><td>+0.60</td><td>-0.60</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>안정 상태</td></tr>
                    <tr><td>Y14</td><td>균형</td><td>70.10</td><td>+0.55</td><td>-0.55</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>예측 가능</td></tr>
                    <tr><td>Y15</td><td>균형</td><td>70.10</td><td>+0.50</td><td>-0.50</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>균형 종료</td></tr>

                    <tr className="ts-phase-header"><td colSpan={9}>PHASE 4: 최적화기 (장기 미세 조정)</td></tr>
                    <tr><td>Y16</td><td>최적화</td><td>70.10</td><td>+0.45</td><td>-0.61</td><td>-0.16</td><td>69.94</td><td>-0.23%</td><td>미세 조정</td></tr>
                    <tr><td>Y17</td><td>최적화</td><td>69.94</td><td>+0.43</td><td>-0.57</td><td>-0.14</td><td>69.80</td><td>-0.20%</td><td>정밀 관리</td></tr>
                    <tr><td>Y18</td><td>최적화</td><td>69.80</td><td>+0.41</td><td>-0.55</td><td>-0.14</td><td>69.66</td><td>-0.20%</td><td>성숙 단계</td></tr>
                    <tr><td>Y19</td><td>최적화</td><td>69.66</td><td>+0.39</td><td>-0.53</td><td>-0.14</td><td>69.52</td><td>-0.20%</td><td>탁월함</td></tr>
                    <tr><td>Y20 🏆</td><td>최적화</td><td>69.52</td><td>+0.37</td><td>-0.49</td><td>-0.12</td><td>69.40</td><td>-0.17%</td><td>비전 완성</td></tr>

                    <tr className="ts-total-row">
                      <td>TOTAL</td>
                      <td>20년</td>
                      <td>100.00</td>
                      <td>+19.75</td>
                      <td>-50.35</td>
                      <td>-30.60</td>
                      <td>69.40</td>
                      <td>-30.60%</td>
                      <td>목표 달성</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="phase1" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-chart-line" style={{ color: 'var(--ts-primary)' }}></i></div>
              <h2 className="ts-section-title">3. Phase 1: 성장기 (Y1~Y5)</h2>
            </div>
            <div className="ts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">연간 상세 데이터</h3>
                  <span className="ts-badge ts-bg-fire">2026-2030</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>연도</th><th>블록 발행</th><th>AI 소각</th><th>순 변화</th><th>총 공급</th></tr></thead>
                    <tbody>
                      <tr><td>Y1</td><td>+2.60억</td><td>-5.60억</td><td>-3.00억</td><td>97.00억</td></tr>
                      <tr><td>Y2</td><td>+2.00억</td><td>-5.10억</td><td>-3.10억</td><td>93.90억</td></tr>
                      <tr><td>Y3</td><td>+1.90억</td><td>-5.00억</td><td>-3.10억</td><td>90.80억</td></tr>
                      <tr><td>Y4</td><td>+1.80억</td><td>-4.90억</td><td>-3.10억</td><td>87.70억</td></tr>
                      <tr><td>Y5</td><td>+1.70억</td><td>-4.80억</td><td>-3.10억</td><td>84.60억</td></tr>
                      <tr className="ts-total-row"><td>합계</td><td>+10.00억</td><td>-25.40억</td><td>-15.40억</td><td></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="ts-card" style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.1), transparent)' }}>
                <div className="ts-card-header"><h3 className="ts-card-title">성과 요약</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>시작 공급량</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem' }}>100.00억</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>종료 공급량</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem', color: 'var(--ts-primary)' }}>84.60억</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>순 감소</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem', color: 'var(--ts-pink)' }}>-15.40억</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="phase2" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-bolt" style={{ color: 'var(--ts-secondary)' }}></i></div>
              <h2 className="ts-section-title">4. Phase 2: 디플레이션기 (Y6~Y10)</h2>
            </div>
            <div className="ts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">연간 상세 데이터</h3>
                  <span className="ts-badge ts-bg-ocean">2031-2035</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>연도</th><th>블록 발행</th><th>AI 소각</th><th>순 변화</th><th>총 공급</th></tr></thead>
                    <tbody>
                      <tr><td>Y6 ⚡</td><td>+1.40억</td><td>-4.20억</td><td>-2.80억</td><td>81.80억</td></tr>
                      <tr><td>Y7</td><td>+1.20억</td><td>-4.00억</td><td>-2.80억</td><td>79.00억</td></tr>
                      <tr><td>Y8</td><td>+1.00억</td><td>-3.80억</td><td>-2.80억</td><td>76.20억</td></tr>
                      <tr><td>Y9 ⚡</td><td>+0.90억</td><td>-3.60억</td><td>-2.70억</td><td>73.50억</td></tr>
                      <tr><td>Y10</td><td>+0.80억</td><td>-3.50억</td><td>-2.70억</td><td>70.80억</td></tr>
                      <tr className="ts-total-row"><td>합계</td><td>+5.30억</td><td>-19.10억</td><td>-13.80억</td><td></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="ts-card" style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.1), transparent)' }}>
                <div className="ts-card-header"><h3 className="ts-card-title">성과 요약</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>시작 공급량</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem' }}>84.60억</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>종료 공급량</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem', color: 'var(--ts-secondary)' }}>70.80억</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>10년 누적 감소</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem', color: 'var(--ts-accent)' }}>-29.20%</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="ts-container ts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
            <section id="phase3" className="ts-section ts-fade-in-up">
              <div className="ts-section-header">
                <div className="ts-section-icon"><i className="fas fa-balance-scale" style={{ color: 'var(--ts-accent)' }}></i></div>
                <h2 className="ts-section-title">5. Phase 3: 균형기</h2>
              </div>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">Y11 ~ Y15</h3>
                  <span className="ts-badge ts-bg-gold">STABILITY</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>연도</th><th>순 변화</th><th>총 공급</th></tr></thead>
                    <tbody>
                      <tr><td>Y11</td><td>-0.70억</td><td>70.10억</td></tr>
                      <tr><td>Y12</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10억</td></tr>
                      <tr><td>Y13</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10억</td></tr>
                      <tr><td>Y14</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10억</td></tr>
                      <tr><td>Y15</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10억</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                  <strong style={{ color: 'var(--ts-accent)' }}>✅ 4년간 공급량 완전 고정 달성</strong>
                </div>
              </div>
            </section>

            <section id="phase4" className="ts-section ts-fade-in-up">
              <div className="ts-section-header">
                <div className="ts-section-icon"><i className="fas fa-cogs" style={{ color: 'var(--ts-purple)' }}></i></div>
                <h2 className="ts-section-title">6. Phase 4: 최적화기</h2>
              </div>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">Y16 ~ Y20</h3>
                  <span className="ts-badge ts-bg-purple">OPTIMIZATION</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>연도</th><th>순 변화</th><th>총 공급</th></tr></thead>
                    <tbody>
                      <tr><td>Y16</td><td>-0.16억</td><td>69.94억</td></tr>
                      <tr><td>Y17</td><td>-0.14억</td><td>69.80억</td></tr>
                      <tr><td>Y18</td><td>-0.14억</td><td>69.66억</td></tr>
                      <tr><td>Y19</td><td>-0.14억</td><td>69.52억</td></tr>
                      <tr><td>Y20</td><td>-0.12억</td><td>69.40억</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                  <strong style={{ color: 'var(--ts-purple)' }}>🏆 최종 69.40억 TBURN 도달</strong>
                </div>
              </div>
            </section>
          </div>

          <section id="visual" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-chart-bar" style={{ color: 'var(--ts-pink)' }}></i></div>
              <h2 className="ts-section-title">7. 공급량 변화 시각화</h2>
            </div>

            <div className="ts-card">
              <div style={{ padding: '20px 0' }}>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y0</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #FF6B35, #FF8F5C)' }}><span className="ts-chart-value-text">100.00억</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y1</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '97%', background: 'linear-gradient(90deg, #FF6B35, #FF8F5C)' }}><span className="ts-chart-value-text">97.00억</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y5</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '84.6%', background: 'linear-gradient(90deg, #FF6B35, #00D4AA)' }}><span className="ts-chart-value-text">84.60억</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y6 ⚡</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '81.8%', background: 'linear-gradient(90deg, #00D4AA, #00B4D8)' }}><span className="ts-chart-value-text">81.80억</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y10 🎉</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '70.8%', background: 'linear-gradient(90deg, #00D4AA, #FFD700)' }}><span className="ts-chart-value-text">70.80억</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y12 ✅</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '70.1%', background: 'linear-gradient(90deg, #FFD700, #FFA500)' }}><span className="ts-chart-value-text">70.10억</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y20 🏆</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '69.4%', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }}><span className="ts-chart-value-text">69.40억</span></div></div>
                </div>
              </div>
            </div>
          </section>

          <section id="comparison" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-balance-scale-right" style={{ color: '#60A5FA' }}></i></div>
              <h2 className="ts-section-title">8. 연간 블록 발행 vs AI 소각</h2>
            </div>

            <div className="ts-card">
              <div className="ts-table-wrapper">
                <table>
                  <thead><tr><th>연도</th><th>블록 발행</th><th>AI 소각</th><th>순 변화</th><th>소각/발행</th><th>누적 감소율</th><th>상태</th></tr></thead>
                  <tbody>
                    <tr><td>Y1</td><td>+2.60억</td><td>-5.60억</td><td>-3.00억</td><td className="ts-font-bold ts-text-secondary">215%</td><td>-3.00%</td><td>📈 초기 성장</td></tr>
                    <tr><td>Y2</td><td>+2.00억</td><td>-5.10억</td><td>-3.10억</td><td className="ts-font-bold ts-text-secondary">255%</td><td>-6.10%</td><td>📈 가속화</td></tr>
                    <tr><td>Y3</td><td>+1.90억</td><td>-5.00억</td><td>-3.10억</td><td className="ts-font-bold ts-text-secondary">263%</td><td>-9.20%</td><td>📈 대량 채택</td></tr>
                    <tr><td>Y4</td><td>+1.80억</td><td>-4.90억</td><td>-3.10억</td><td className="ts-font-bold ts-text-secondary">272%</td><td>-12.30%</td><td>📈 기업 통합</td></tr>
                    <tr><td>Y5</td><td>+1.70억</td><td>-4.80억</td><td>-3.10억</td><td className="ts-font-bold ts-text-secondary">282%</td><td>-15.40%</td><td>📈 플랫폼 성숙</td></tr>
                    <tr style={{ background: 'rgba(255,215,0,0.05)' }}><td>Y6</td><td>+1.40억</td><td>-4.20억</td><td>-2.80억</td><td className="ts-font-bold ts-text-accent">300%</td><td>-18.20%</td><td>⚡ 1차 반감기</td></tr>
                    <tr><td>Y9</td><td>+0.90억</td><td>-3.60억</td><td>-2.70억</td><td className="ts-font-bold ts-text-accent">400%</td><td>-26.50%</td><td>⚡ 2차 반감기</td></tr>
                    <tr><td>Y10</td><td>+0.80억</td><td>-3.50억</td><td>-2.70억</td><td className="ts-font-bold ts-text-primary">438%</td><td>-29.20%</td><td>🎉 10년 달성</td></tr>
                    <tr style={{ background: 'rgba(0,212,170,0.05)' }}><td>Y12</td><td>+0.65억</td><td>-0.65억</td><td>0</td><td className="ts-font-bold ts-text-secondary">100%</td><td>-29.90%</td><td>✅ 완전 균형</td></tr>
                    <tr><td>Y20</td><td>+0.37억</td><td>-0.49억</td><td>-0.12억</td><td className="ts-font-bold ts-text-purple">132%</td><td>-30.60%</td><td>🏆 비전 완성</td></tr>
                    <tr className="ts-total-row"><td>합계</td><td>+19.75억</td><td>-50.35억</td><td>-30.60억</td><td>255%</td><td>-30.60%</td><td></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="summary" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">🏆 20년 종합 성과 요약</h3>
                </div>
                <div className="ts-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--ts-text-muted)', fontSize: '0.9rem' }}>20년 누적 발행</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.5rem', color: 'var(--ts-primary)' }}>+19.75억</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--ts-text-muted)', fontSize: '0.9rem' }}>20년 누적 소각</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.5rem', color: 'var(--ts-secondary)' }}>-50.35억</div>
                  </div>
                </div>
                <div style={{ marginTop: '20px', background: 'rgba(236, 72, 153, 0.1)', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                  <div style={{ color: 'var(--ts-pink)', fontWeight: 700, marginBottom: '5px' }}>최종 순 디플레이션</div>
                  <div className="ts-font-orbitron" style={{ fontSize: '2.5rem', color: '#fff' }}>-30.60억</div>
                  <div style={{ color: 'var(--ts-text-muted)', fontSize: '0.9rem' }}>발행의 약 2.55배를 소각</div>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">📋 문서 정보</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>문서 제목</span>
                    <span>TBURN 20년 토큰 이코노미 스케줄</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>버전</span>
                    <span className="ts-badge ts-bg-ocean">3.0.0 Final</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>상태</span>
                    <span>승인 완료 (Approved)</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>계획 기간</span>
                    <span className="ts-font-mono">2025.12.22 ~ 2045.12.22</span>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--ts-text-muted)', textAlign: 'center' }}>
                    작성: TBURN 재단 전략기획실 | 승인: 이사회
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="ts-container ts-fade-in-up" style={{ marginTop: '40px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: '20px', padding: '30px' }}>
              <h3 className="ts-font-orbitron" style={{ color: 'var(--ts-accent)', marginBottom: '20px', fontSize: '1.1rem' }}>⚠️ 면책 조항 (Disclaimer)</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>투자 권유가 아님:</strong> 본 문서는 정보 제공 목적으로만 작성되었으며, 증권, 투자상품 또는 금융상품의 매수, 매도, 보유를 권유하거나 제안하는 것이 아닙니다.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>미래 예측 진술:</strong> 본 문서에 포함된 토큰 공급량, 소각률, 가격 전망 등은 현재 계획에 기반한 예상치이며, 실제 결과는 시장 상황, 규제 환경, 기술적 요인 등에 따라 크게 달라질 수 있습니다.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>변경 가능성:</strong> 토큰 이코노미 설계, 소각 메커니즘, Phase 전환 시점 등 모든 정보는 거버넌스 투표 또는 재단 결정에 따라 사전 통지 없이 변경될 수 있습니다.
                </p>
                <p>
                  <strong style={{ color: '#fff' }}>법적 책임 제한:</strong> TBURN 재단 및 관계사는 본 문서의 정보에 기반한 투자 결정으로 인한 손실에 대해 법적 책임을 지지 않습니다.
                </p>
              </div>
            </div>
          </div>

          <footer className="ts-footer">
            <div className="ts-container">
              <div className="ts-logo-box ts-justify-center ts-mb-4">
                <TBurnLogo className="w-10 h-10" showText={false} />
                <div className="ts-logo-text ts-font-orbitron">TBURN</div>
              </div>
              <p style={{ color: 'var(--ts-text-muted)' }}>20년 디플레이션 비전으로 장기 가치 창출</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '15px', maxWidth: '600px', margin: '15px auto 0' }}>
                본 문서의 모든 수치와 전망은 예상치이며 실제 결과와 다를 수 있습니다. 투자 결정 시 반드시 전문가와 상담하시기 바랍니다.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', marginTop: '20px' }}>
                © 2025 TBURN Foundation. All Rights Reserved.
              </p>
            </div>
          </footer>

          <button className="ts-scroll-top" onClick={scrollToTop} data-testid="button-scroll-top">
            <i className="fas fa-arrow-up"></i>
          </button>
        </main>
      </div>
    </>
  );
}
