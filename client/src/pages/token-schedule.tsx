import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TBurnLogo } from "@/components/tburn-logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Home, ScanLine, User, Bug, Shield, Coins, ImageIcon, HelpCircle } from "lucide-react";

export default function TokenSchedule() {
  const { t } = useTranslation();

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
          --ts-container-width: 1200px;
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

        .ts-container { max-width: var(--ts-container-width); margin: 0 auto; padding: 0 32px; }
        @media (max-width: 1024px) {
          .ts-container { padding: 0 24px; }
        }
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
        .ts-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ts-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }
        .ts-header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: var(--ts-text-muted);
          transition: all 0.2s ease;
        }
        .ts-header-icon:hover {
          color: var(--ts-primary);
          background: rgba(255, 107, 53, 0.1);
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
            <div className="ts-header-left">
              <TBurnLogo className="w-10 h-10" showText={false} />
              <div className="ts-logo-text ts-font-orbitron">TBURN</div>
            </div>
            <div className="ts-header-right">
              <a href="/" className="ts-header-icon" title="Home"><Home size={18} /></a>
              <a href="/scan" className="ts-header-icon" title="Scan"><ScanLine size={18} /></a>
              <a href="/user" className="ts-header-icon" title="User"><User size={18} /></a>
              <a href="/bug-bounty" className="ts-header-icon" title="Bug Bounty"><Bug size={18} /></a>
              <a href="/security-audit" className="ts-header-icon" title="Security Audit"><Shield size={18} /></a>
              <a href="/token-generator" className="ts-header-icon" title="Token Generator"><Coins size={18} /></a>
              <a href="/nft-marketplace" className="ts-header-icon" title="NFT Marketplace"><ImageIcon size={18} /></a>
              <a href="/qna" className="ts-header-icon" title="QnA"><HelpCircle size={18} /></a>
              <LanguageSelector isDark={true} />
            </div>
          </div>
        </header>

        <nav className="ts-nav-wrapper">
          <div className="ts-container">
            <div className="ts-nav-scroll">
              <a href="#overview" className="ts-nav-item ts-active">{t('tokenSchedule.nav.overview')}</a>
              <a href="#schedule" className="ts-nav-item">{t('tokenSchedule.nav.schedule')}</a>
              <a href="#phase1" className="ts-nav-item">{t('tokenSchedule.nav.phase1')}</a>
              <a href="#phase2" className="ts-nav-item">{t('tokenSchedule.nav.phase2')}</a>
              <a href="#phase3" className="ts-nav-item">{t('tokenSchedule.nav.phase3')}</a>
              <a href="#phase4" className="ts-nav-item">{t('tokenSchedule.nav.phase4')}</a>
              <a href="#visual" className="ts-nav-item">{t('tokenSchedule.nav.visual')}</a>
              <a href="#comparison" className="ts-nav-item">{t('tokenSchedule.nav.comparison')}</a>
              <a href="#summary" className="ts-nav-item">{t('tokenSchedule.nav.summary')}</a>
            </div>
          </div>
        </nav>

        <main>
          <div className="ts-hero ts-container">
            <div className="ts-fade-in-up">
              <h1 className="ts-font-orbitron">{t('tokenSchedule.hero.title')}</h1>
              <p style={{ color: 'var(--ts-text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
                {t('tokenSchedule.hero.subtitle')}<br />
                {t('tokenSchedule.hero.description')}
              </p>
            </div>

            <div className="ts-hero-stats ts-fade-in-up">
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-primary)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">{t('tokenSchedule.hero.stats.initialSupply.value')}</div>
                <div className="ts-stat-lbl">{t('tokenSchedule.hero.stats.initialSupply.label')}</div>
              </div>
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-secondary)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">{t('tokenSchedule.hero.stats.finalSupply.value')}</div>
                <div className="ts-stat-lbl">{t('tokenSchedule.hero.stats.finalSupply.label')}</div>
              </div>
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-pink)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">{t('tokenSchedule.hero.stats.totalBurn.value')}</div>
                <div className="ts-stat-lbl">{t('tokenSchedule.hero.stats.totalBurn.label')}</div>
              </div>
              <div className="ts-hero-stat-card" style={{ '--c': 'var(--ts-purple)' } as React.CSSProperties}>
                <div className="ts-stat-val ts-font-orbitron">{t('tokenSchedule.hero.stats.reductionRate.value')}</div>
                <div className="ts-stat-lbl">{t('tokenSchedule.hero.stats.reductionRate.label')}</div>
              </div>
            </div>
          </div>

          <section id="overview" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-clipboard-list" style={{ color: 'var(--ts-primary)' }}></i></div>
              <h2 className="ts-section-title">{t('tokenSchedule.overview.title')}</h2>
            </div>

            <div className="ts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title"><i className="fas fa-plus-circle" style={{ color: 'var(--ts-primary)', marginRight: '8px' }}></i> {t('tokenSchedule.overview.supply.title')}</h3>
                  <span className="ts-badge ts-bg-fire">INFLATION</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.overview.supply.blockRewardPool')}</span>
                    <span className="ts-font-bold">{t('tokenSchedule.overview.supply.blockRewardValue')}</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.overview.supply.distributionPeriod')}</span>
                    <span className="ts-font-bold">{t('tokenSchedule.overview.supply.distributionValue')}</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.overview.supply.blockTime')}</span>
                    <span className="ts-font-bold">{t('tokenSchedule.overview.supply.blockTimeValue')}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--ts-secondary)', marginBottom: '8px' }}>{t('tokenSchedule.overview.supply.halvingTitle')}</h4>
                    <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>
                      <li style={{ marginBottom: '5px' }}>• <strong>{t('tokenSchedule.overview.supply.halving1Label')}</strong> {t('tokenSchedule.overview.supply.halving1Value')}</li>
                      <li>• <strong>{t('tokenSchedule.overview.supply.halving2Label')}</strong> {t('tokenSchedule.overview.supply.halving2Value')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title"><i className="fas fa-fire" style={{ color: 'var(--ts-secondary)', marginRight: '8px' }}></i> {t('tokenSchedule.overview.burn.title')}</h3>
                  <span className="ts-badge ts-bg-ocean">DEFLATION</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(0,212,170,0.05)', borderRadius: '10px', border: '1px solid rgba(0,212,170,0.1)' }}>
                    <div className="ts-font-bold ts-text-secondary ts-mb-1">{t('tokenSchedule.overview.burn.aiFee.title')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.overview.burn.aiFee.description')}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,212,170,0.05)', borderRadius: '10px', border: '1px solid rgba(0,212,170,0.1)' }}>
                    <div className="ts-font-bold ts-text-secondary ts-mb-1">{t('tokenSchedule.overview.burn.txFee.title')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.overview.burn.txFee.description')}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,212,170,0.05)', borderRadius: '10px', border: '1px solid rgba(0,212,170,0.1)' }}>
                    <div className="ts-font-bold ts-text-secondary ts-mb-1">{t('tokenSchedule.overview.burn.specialEvents.title')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.overview.burn.specialEvents.description')}</div>
                  </div>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title"><i className="fas fa-flag-checkered" style={{ color: 'var(--ts-accent)', marginRight: '8px' }}></i> {t('tokenSchedule.overview.phases.title')}</h3>
                  <span className="ts-badge ts-bg-gold">VISION</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-primary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-primary)' }}>Phase 1 (Y1-Y5)</div>
                    <div style={{ fontWeight: 700 }}>{t('tokenSchedule.overview.phases.phase1')}</div>
                  </div>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-secondary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-secondary)' }}>Phase 2 (Y6-Y10)</div>
                    <div style={{ fontWeight: 700 }}>{t('tokenSchedule.overview.phases.phase2')}</div>
                  </div>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-accent)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-accent)' }}>Phase 3 (Y11-Y15)</div>
                    <div style={{ fontWeight: 700 }}>{t('tokenSchedule.overview.phases.phase3')}</div>
                  </div>
                  <div style={{ padding: '10px', borderLeft: '3px solid var(--ts-purple)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ts-purple)' }}>Phase 4 (Y16-Y20)</div>
                    <div style={{ fontWeight: 700 }}>{t('tokenSchedule.overview.phases.phase4')}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="schedule" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-table" style={{ color: 'var(--ts-secondary)' }}></i></div>
              <h2 className="ts-section-title">{t('tokenSchedule.schedule.title')}</h2>
            </div>

            <div className="ts-card">
              <p style={{ color: 'var(--ts-text-muted)', marginBottom: '20px' }}>
                <i className="fas fa-info-circle"></i> {t('tokenSchedule.schedule.description')}
              </p>
              <div className="ts-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>{t('tokenSchedule.schedule.headers.yearPeriod')}</th>
                      <th>{t('tokenSchedule.schedule.headers.stage')}</th>
                      <th>{t('tokenSchedule.schedule.headers.startSupply')}</th>
                      <th style={{ color: 'var(--ts-primary)' }}>{t('tokenSchedule.schedule.headers.blockIssuance')}</th>
                      <th style={{ color: 'var(--ts-pink)' }}>{t('tokenSchedule.schedule.headers.aiBurn')}</th>
                      <th>{t('tokenSchedule.schedule.headers.netChange')}</th>
                      <th>{t('tokenSchedule.schedule.headers.totalSupply')}</th>
                      <th>{t('tokenSchedule.schedule.headers.reductionRate')}</th>
                      <th>{t('tokenSchedule.schedule.headers.notes')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'rgba(255, 107, 53, 0.1)' }}>
                      <td className="ts-font-orbitron ts-font-bold">Y0</td>
                      <td><span className="ts-badge ts-bg-fire">{t('tokenSchedule.schedule.stages.genesis')}</span></td>
                      <td>100.00</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td className="ts-font-bold">100.00</td>
                      <td>0.00%</td>
                      <td>{t('tokenSchedule.schedule.notes.mainnetLaunch')}</td>
                    </tr>
                    
                    <tr className="ts-phase-header"><td colSpan={9}>{t('tokenSchedule.schedule.phaseHeaders.phase1')}</td></tr>
                    <tr><td>Y1-Q1</td><td>{t('tokenSchedule.schedule.stages.growth')}</td><td>100.00</td><td>+0.80</td><td>-1.00</td><td>-0.20</td><td>99.80</td><td>-0.20%</td><td>{t('tokenSchedule.schedule.notes.earlyUserAcquisition')}</td></tr>
                    <tr><td>Y1-Q2</td><td>{t('tokenSchedule.schedule.stages.growth')}</td><td>99.80</td><td>+0.60</td><td>-1.40</td><td>-0.80</td><td>99.00</td><td>-0.80%</td><td>{t('tokenSchedule.schedule.notes.growthAcceleration')}</td></tr>
                    <tr><td>Y1-H2</td><td>{t('tokenSchedule.schedule.stages.growth')}</td><td>99.00</td><td>+1.20</td><td>-3.20</td><td>-2.00</td><td>97.00</td><td>-2.02%</td><td>{t('tokenSchedule.schedule.notes.ecosystemExpansion')}</td></tr>
                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}><td><strong>Y1 Total</strong></td><td></td><td></td><td className="ts-font-mono">+2.60</td><td className="ts-font-mono">-5.60</td><td className="ts-font-mono ts-text-pink">-3.00</td><td className="ts-font-bold">97.00</td><td>-3.00%</td><td></td></tr>
                    
                    <tr><td>Y2</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>97.00</td><td>+2.00</td><td>-5.10</td><td>-3.10</td><td>93.90</td><td>-3.20%</td><td>{t('tokenSchedule.schedule.notes.sustainedGrowth')}</td></tr>
                    <tr><td>Y3</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>93.90</td><td>+1.90</td><td>-5.00</td><td>-3.10</td><td>90.80</td><td>-3.30%</td><td>{t('tokenSchedule.schedule.notes.massAdoption')}</td></tr>
                    <tr><td>Y4</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>90.80</td><td>+1.80</td><td>-4.90</td><td>-3.10</td><td>87.70</td><td>-3.41%</td><td>{t('tokenSchedule.schedule.notes.enterpriseIntegration')}</td></tr>
                    <tr><td>Y5</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>87.70</td><td>+1.70</td><td>-4.80</td><td>-3.10</td><td>84.60</td><td>-3.53%</td><td>{t('tokenSchedule.schedule.notes.platformMaturity')}</td></tr>

                    <tr className="ts-phase-header"><td colSpan={9}>{t('tokenSchedule.schedule.phaseHeaders.phase2')}</td></tr>
                    <tr><td>Y6 ⚡</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>84.60</td><td>+1.40</td><td>-4.20</td><td>-2.80</td><td>81.80</td><td>-3.31%</td><td>{t('tokenSchedule.schedule.notes.firstHalving')}</td></tr>
                    <tr><td>Y7</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>81.80</td><td>+1.20</td><td>-4.00</td><td>-2.80</td><td>79.00</td><td>-3.42%</td><td>{t('tokenSchedule.schedule.notes.stabilization')}</td></tr>
                    <tr><td>Y8</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>79.00</td><td>+1.00</td><td>-3.80</td><td>-2.80</td><td>76.20</td><td>-3.54%</td><td>{t('tokenSchedule.schedule.notes.institutionalGrade')}</td></tr>
                    <tr><td>Y9 ⚡</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>76.20</td><td>+0.90</td><td>-3.60</td><td>-2.70</td><td>73.50</td><td>-3.54%</td><td>{t('tokenSchedule.schedule.notes.secondHalving')}</td></tr>
                    <tr><td>Y10 🎉</td><td>{t('tokenSchedule.schedule.stages.deflation')}</td><td>73.50</td><td>+0.80</td><td>-3.50</td><td>-2.70</td><td>70.80</td><td>-3.67%</td><td>{t('tokenSchedule.schedule.notes.tenYearMilestone')}</td></tr>

                    <tr className="ts-phase-header"><td colSpan={9}>{t('tokenSchedule.schedule.phaseHeaders.phase3')}</td></tr>
                    <tr><td>Y11</td><td>{t('tokenSchedule.schedule.stages.balance')}</td><td>70.80</td><td>+0.70</td><td>-1.40</td><td>-0.70</td><td>70.10</td><td>-0.99%</td><td>{t('tokenSchedule.schedule.notes.balanceStart')}</td></tr>
                    <tr><td>Y12</td><td>{t('tokenSchedule.schedule.stages.balance')}</td><td>70.10</td><td>+0.65</td><td>-0.65</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>{t('tokenSchedule.schedule.notes.perfectBalance')}</td></tr>
                    <tr><td>Y13</td><td>{t('tokenSchedule.schedule.stages.balance')}</td><td>70.10</td><td>+0.60</td><td>-0.60</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>{t('tokenSchedule.schedule.notes.stableState')}</td></tr>
                    <tr><td>Y14</td><td>{t('tokenSchedule.schedule.stages.balance')}</td><td>70.10</td><td>+0.55</td><td>-0.55</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>{t('tokenSchedule.schedule.notes.predictable')}</td></tr>
                    <tr><td>Y15</td><td>{t('tokenSchedule.schedule.stages.balance')}</td><td>70.10</td><td>+0.50</td><td>-0.50</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10</td><td>0.00%</td><td>{t('tokenSchedule.schedule.notes.balanceEnd')}</td></tr>

                    <tr className="ts-phase-header"><td colSpan={9}>{t('tokenSchedule.schedule.phaseHeaders.phase4')}</td></tr>
                    <tr><td>Y16</td><td>{t('tokenSchedule.schedule.stages.optimization')}</td><td>70.10</td><td>+0.45</td><td>-0.61</td><td>-0.16</td><td>69.94</td><td>-0.23%</td><td>{t('tokenSchedule.schedule.notes.finetuning')}</td></tr>
                    <tr><td>Y17</td><td>{t('tokenSchedule.schedule.stages.optimization')}</td><td>69.94</td><td>+0.43</td><td>-0.57</td><td>-0.14</td><td>69.80</td><td>-0.20%</td><td>{t('tokenSchedule.schedule.notes.precisionManagement')}</td></tr>
                    <tr><td>Y18</td><td>{t('tokenSchedule.schedule.stages.optimization')}</td><td>69.80</td><td>+0.41</td><td>-0.55</td><td>-0.14</td><td>69.66</td><td>-0.20%</td><td>{t('tokenSchedule.schedule.notes.maturityPhase')}</td></tr>
                    <tr><td>Y19</td><td>{t('tokenSchedule.schedule.stages.optimization')}</td><td>69.66</td><td>+0.39</td><td>-0.53</td><td>-0.14</td><td>69.52</td><td>-0.20%</td><td>{t('tokenSchedule.schedule.notes.excellence')}</td></tr>
                    <tr><td>Y20 🏆</td><td>{t('tokenSchedule.schedule.stages.optimization')}</td><td>69.52</td><td>+0.37</td><td>-0.49</td><td>-0.12</td><td>69.40</td><td>-0.17%</td><td>{t('tokenSchedule.schedule.notes.visionComplete')}</td></tr>

                    <tr className="ts-total-row">
                      <td>TOTAL</td>
                      <td>{t('tokenSchedule.schedule.total.years')}</td>
                      <td>100.00</td>
                      <td>+19.75</td>
                      <td>-50.35</td>
                      <td>-30.60</td>
                      <td>69.40</td>
                      <td>-30.60%</td>
                      <td>{t('tokenSchedule.schedule.notes.goalAchieved')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="phase1" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-chart-line" style={{ color: 'var(--ts-primary)' }}></i></div>
              <h2 className="ts-section-title">{t('tokenSchedule.phase1.title')}</h2>
            </div>
            <div className="ts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">{t('tokenSchedule.phase1.detailedData')}</h3>
                  <span className="ts-badge ts-bg-fire">2026-2030</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>{t('tokenSchedule.table.year')}</th><th>{t('tokenSchedule.table.blockIssuance')}</th><th>{t('tokenSchedule.table.aiBurn')}</th><th>{t('tokenSchedule.table.netChange')}</th><th>{t('tokenSchedule.table.totalSupply')}</th></tr></thead>
                    <tbody>
                      <tr><td>Y1</td><td>+2.60{t('tokenSchedule.units.billion')}</td><td>-5.60{t('tokenSchedule.units.billion')}</td><td>-3.00{t('tokenSchedule.units.billion')}</td><td>97.00{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y2</td><td>+2.00{t('tokenSchedule.units.billion')}</td><td>-5.10{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td>93.90{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y3</td><td>+1.90{t('tokenSchedule.units.billion')}</td><td>-5.00{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td>90.80{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y4</td><td>+1.80{t('tokenSchedule.units.billion')}</td><td>-4.90{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td>87.70{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y5</td><td>+1.70{t('tokenSchedule.units.billion')}</td><td>-4.80{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td>84.60{t('tokenSchedule.units.billion')}</td></tr>
                      <tr className="ts-total-row"><td>{t('tokenSchedule.table.total')}</td><td>+10.00{t('tokenSchedule.units.billion')}</td><td>-25.40{t('tokenSchedule.units.billion')}</td><td>-15.40{t('tokenSchedule.units.billion')}</td><td></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="ts-card" style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.1), transparent)' }}>
                <div className="ts-card-header"><h3 className="ts-card-title">{t('tokenSchedule.summary.title')}</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.summary.startSupply')}</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem' }}>100.00{t('tokenSchedule.units.billion')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.summary.endSupply')}</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem', color: 'var(--ts-primary)' }}>84.60{t('tokenSchedule.units.billion')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.summary.netReduction')}</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem', color: 'var(--ts-pink)' }}>-15.40{t('tokenSchedule.units.billion')}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="phase2" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-bolt" style={{ color: 'var(--ts-secondary)' }}></i></div>
              <h2 className="ts-section-title">{t('tokenSchedule.phase2.title')}</h2>
            </div>
            <div className="ts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">{t('tokenSchedule.phase1.detailedData')}</h3>
                  <span className="ts-badge ts-bg-ocean">2031-2035</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>{t('tokenSchedule.table.year')}</th><th>{t('tokenSchedule.table.blockIssuance')}</th><th>{t('tokenSchedule.table.aiBurn')}</th><th>{t('tokenSchedule.table.netChange')}</th><th>{t('tokenSchedule.table.totalSupply')}</th></tr></thead>
                    <tbody>
                      <tr><td>Y6 ⚡</td><td>+1.40{t('tokenSchedule.units.billion')}</td><td>-4.20{t('tokenSchedule.units.billion')}</td><td>-2.80{t('tokenSchedule.units.billion')}</td><td>81.80{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y7</td><td>+1.20{t('tokenSchedule.units.billion')}</td><td>-4.00{t('tokenSchedule.units.billion')}</td><td>-2.80{t('tokenSchedule.units.billion')}</td><td>79.00{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y8</td><td>+1.00{t('tokenSchedule.units.billion')}</td><td>-3.80{t('tokenSchedule.units.billion')}</td><td>-2.80{t('tokenSchedule.units.billion')}</td><td>76.20{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y9 ⚡</td><td>+0.90{t('tokenSchedule.units.billion')}</td><td>-3.60{t('tokenSchedule.units.billion')}</td><td>-2.70{t('tokenSchedule.units.billion')}</td><td>73.50{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y10</td><td>+0.80{t('tokenSchedule.units.billion')}</td><td>-3.50{t('tokenSchedule.units.billion')}</td><td>-2.70{t('tokenSchedule.units.billion')}</td><td>70.80{t('tokenSchedule.units.billion')}</td></tr>
                      <tr className="ts-total-row"><td>{t('tokenSchedule.table.total')}</td><td>+5.30{t('tokenSchedule.units.billion')}</td><td>-19.10{t('tokenSchedule.units.billion')}</td><td>-13.80{t('tokenSchedule.units.billion')}</td><td></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="ts-card" style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.1), transparent)' }}>
                <div className="ts-card-header"><h3 className="ts-card-title">{t('tokenSchedule.summary.title')}</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.summary.startSupply')}</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem' }}>84.60{t('tokenSchedule.units.billion')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.summary.endSupply')}</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.8rem', color: 'var(--ts-secondary)' }}>70.80{t('tokenSchedule.units.billion')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.summary.tenYearReduction')}</div>
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
                <h2 className="ts-section-title">{t('tokenSchedule.phase3.title')}</h2>
              </div>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">Y11 ~ Y15</h3>
                  <span className="ts-badge ts-bg-gold">STABILITY</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>{t('tokenSchedule.table.year')}</th><th>{t('tokenSchedule.table.netChange')}</th><th>{t('tokenSchedule.table.totalSupply')}</th></tr></thead>
                    <tbody>
                      <tr><td>Y11</td><td>-0.70{t('tokenSchedule.units.billion')}</td><td>70.10{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y12</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y13</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y14</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y15</td><td style={{ color: 'var(--ts-secondary)' }}>0.00</td><td>70.10{t('tokenSchedule.units.billion')}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                  <strong style={{ color: 'var(--ts-accent)' }}>{t('tokenSchedule.phase3.achievement')}</strong>
                </div>
              </div>
            </section>

            <section id="phase4" className="ts-section ts-fade-in-up">
              <div className="ts-section-header">
                <div className="ts-section-icon"><i className="fas fa-cogs" style={{ color: 'var(--ts-purple)' }}></i></div>
                <h2 className="ts-section-title">{t('tokenSchedule.phase4.title')}</h2>
              </div>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">Y16 ~ Y20</h3>
                  <span className="ts-badge ts-bg-purple">OPTIMIZATION</span>
                </div>
                <div className="ts-table-wrapper">
                  <table>
                    <thead><tr><th>{t('tokenSchedule.table.year')}</th><th>{t('tokenSchedule.table.netChange')}</th><th>{t('tokenSchedule.table.totalSupply')}</th></tr></thead>
                    <tbody>
                      <tr><td>Y16</td><td>-0.16{t('tokenSchedule.units.billion')}</td><td>69.94{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y17</td><td>-0.14{t('tokenSchedule.units.billion')}</td><td>69.80{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y18</td><td>-0.14{t('tokenSchedule.units.billion')}</td><td>69.66{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y19</td><td>-0.14{t('tokenSchedule.units.billion')}</td><td>69.52{t('tokenSchedule.units.billion')}</td></tr>
                      <tr><td>Y20</td><td>-0.12{t('tokenSchedule.units.billion')}</td><td>69.40{t('tokenSchedule.units.billion')}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                  <strong style={{ color: 'var(--ts-purple)' }}>{t('tokenSchedule.phase4.achievement')}</strong>
                </div>
              </div>
            </section>
          </div>

          <section id="visual" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-chart-bar" style={{ color: 'var(--ts-pink)' }}></i></div>
              <h2 className="ts-section-title">{t('tokenSchedule.visual.title')}</h2>
            </div>

            <div className="ts-card">
              <div style={{ padding: '20px 0' }}>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y0</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #FF6B35, #FF8F5C)' }}><span className="ts-chart-value-text">100.00{t('tokenSchedule.units.billion')}</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y1</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '97%', background: 'linear-gradient(90deg, #FF6B35, #FF8F5C)' }}><span className="ts-chart-value-text">97.00{t('tokenSchedule.units.billion')}</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y5</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '84.6%', background: 'linear-gradient(90deg, #FF6B35, #00D4AA)' }}><span className="ts-chart-value-text">84.60{t('tokenSchedule.units.billion')}</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y6 ⚡</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '81.8%', background: 'linear-gradient(90deg, #00D4AA, #00B4D8)' }}><span className="ts-chart-value-text">81.80{t('tokenSchedule.units.billion')}</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y10 🎉</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '70.8%', background: 'linear-gradient(90deg, #00D4AA, #FFD700)' }}><span className="ts-chart-value-text">70.80{t('tokenSchedule.units.billion')}</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y12 ✅</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '70.1%', background: 'linear-gradient(90deg, #FFD700, #FFA500)' }}><span className="ts-chart-value-text">70.10{t('tokenSchedule.units.billion')}</span></div></div>
                </div>
                <div className="ts-chart-row">
                  <div className="ts-chart-label">Y20 🏆</div>
                  <div className="ts-chart-track"><div className="ts-chart-fill" style={{ width: '69.4%', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }}><span className="ts-chart-value-text">69.40{t('tokenSchedule.units.billion')}</span></div></div>
                </div>
              </div>
            </div>
          </section>

          <section id="comparison" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-section-header">
              <div className="ts-section-icon"><i className="fas fa-balance-scale-right" style={{ color: '#60A5FA' }}></i></div>
              <h2 className="ts-section-title">{t('tokenSchedule.comparison.title')}</h2>
            </div>

            <div className="ts-card">
              <div className="ts-table-wrapper">
                <table>
                  <thead><tr><th>{t('tokenSchedule.table.year')}</th><th>{t('tokenSchedule.table.blockIssuance')}</th><th>{t('tokenSchedule.table.aiBurn')}</th><th>{t('tokenSchedule.table.netChange')}</th><th>{t('tokenSchedule.comparison.headers.burnToIssuance')}</th><th>{t('tokenSchedule.comparison.headers.cumulativeReduction')}</th><th>{t('tokenSchedule.comparison.headers.status')}</th></tr></thead>
                  <tbody>
                    <tr><td>Y1</td><td>+2.60{t('tokenSchedule.units.billion')}</td><td>-5.60{t('tokenSchedule.units.billion')}</td><td>-3.00{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-secondary">215%</td><td>-3.00%</td><td>{t('tokenSchedule.comparison.status.earlyGrowth')}</td></tr>
                    <tr><td>Y2</td><td>+2.00{t('tokenSchedule.units.billion')}</td><td>-5.10{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-secondary">255%</td><td>-6.10%</td><td>{t('tokenSchedule.comparison.status.acceleration')}</td></tr>
                    <tr><td>Y3</td><td>+1.90{t('tokenSchedule.units.billion')}</td><td>-5.00{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-secondary">263%</td><td>-9.20%</td><td>{t('tokenSchedule.comparison.status.massAdoption')}</td></tr>
                    <tr><td>Y4</td><td>+1.80{t('tokenSchedule.units.billion')}</td><td>-4.90{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-secondary">272%</td><td>-12.30%</td><td>{t('tokenSchedule.comparison.status.enterpriseIntegration')}</td></tr>
                    <tr><td>Y5</td><td>+1.70{t('tokenSchedule.units.billion')}</td><td>-4.80{t('tokenSchedule.units.billion')}</td><td>-3.10{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-secondary">282%</td><td>-15.40%</td><td>{t('tokenSchedule.comparison.status.platformMaturity')}</td></tr>
                    <tr style={{ background: 'rgba(255,215,0,0.05)' }}><td>Y6</td><td>+1.40{t('tokenSchedule.units.billion')}</td><td>-4.20{t('tokenSchedule.units.billion')}</td><td>-2.80{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-accent">300%</td><td>-18.20%</td><td>{t('tokenSchedule.comparison.status.firstHalving')}</td></tr>
                    <tr><td>Y9</td><td>+0.90{t('tokenSchedule.units.billion')}</td><td>-3.60{t('tokenSchedule.units.billion')}</td><td>-2.70{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-accent">400%</td><td>-26.50%</td><td>{t('tokenSchedule.comparison.status.secondHalving')}</td></tr>
                    <tr><td>Y10</td><td>+0.80{t('tokenSchedule.units.billion')}</td><td>-3.50{t('tokenSchedule.units.billion')}</td><td>-2.70{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-primary">438%</td><td>-29.20%</td><td>{t('tokenSchedule.comparison.status.tenYearMilestone')}</td></tr>
                    <tr style={{ background: 'rgba(0,212,170,0.05)' }}><td>Y12</td><td>+0.65{t('tokenSchedule.units.billion')}</td><td>-0.65{t('tokenSchedule.units.billion')}</td><td>0</td><td className="ts-font-bold ts-text-secondary">100%</td><td>-29.90%</td><td>{t('tokenSchedule.comparison.status.perfectBalance')}</td></tr>
                    <tr><td>Y20</td><td>+0.37{t('tokenSchedule.units.billion')}</td><td>-0.49{t('tokenSchedule.units.billion')}</td><td>-0.12{t('tokenSchedule.units.billion')}</td><td className="ts-font-bold ts-text-purple">132%</td><td>-30.60%</td><td>{t('tokenSchedule.comparison.status.visionComplete')}</td></tr>
                    <tr className="ts-total-row"><td>{t('tokenSchedule.table.total')}</td><td>+19.75{t('tokenSchedule.units.billion')}</td><td>-50.35{t('tokenSchedule.units.billion')}</td><td>-30.60{t('tokenSchedule.units.billion')}</td><td>255%</td><td>-30.60%</td><td></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="summary" className="ts-section ts-container ts-fade-in-up">
            <div className="ts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">{t('tokenSchedule.finalSummary.title')}</h3>
                </div>
                <div className="ts-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--ts-text-muted)', fontSize: '0.9rem' }}>{t('tokenSchedule.finalSummary.cumulativeIssuance')}</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.5rem', color: 'var(--ts-primary)' }}>+19.75{t('tokenSchedule.units.billion')}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--ts-text-muted)', fontSize: '0.9rem' }}>{t('tokenSchedule.finalSummary.cumulativeBurn')}</div>
                    <div className="ts-font-orbitron" style={{ fontSize: '1.5rem', color: 'var(--ts-secondary)' }}>-50.35{t('tokenSchedule.units.billion')}</div>
                  </div>
                </div>
                <div style={{ marginTop: '20px', background: 'rgba(236, 72, 153, 0.1)', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                  <div style={{ color: 'var(--ts-pink)', fontWeight: 700, marginBottom: '5px' }}>{t('tokenSchedule.finalSummary.netDeflation')}</div>
                  <div className="ts-font-orbitron" style={{ fontSize: '2.5rem', color: '#fff' }}>-30.60{t('tokenSchedule.units.billion')}</div>
                  <div style={{ color: 'var(--ts-text-muted)', fontSize: '0.9rem' }}>{t('tokenSchedule.finalSummary.burnMultiple')}</div>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <h3 className="ts-card-title">{t('tokenSchedule.documentInfo.title')}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.documentInfo.documentTitle')}</span>
                    <span>{t('tokenSchedule.documentInfo.documentTitleValue')}</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.documentInfo.version')}</span>
                    <span className="ts-badge ts-bg-ocean">3.0.0 Final</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.documentInfo.status')}</span>
                    <span>{t('tokenSchedule.documentInfo.statusValue')}</span>
                  </div>
                  <div className="ts-flex ts-justify-between ts-border-b ts-pb-2">
                    <span style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.documentInfo.planPeriod')}</span>
                    <span className="ts-font-mono">2025.12.22 ~ 2045.12.22</span>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--ts-text-muted)', textAlign: 'center' }}>
                    {t('tokenSchedule.documentInfo.author')}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="ts-container ts-fade-in-up" style={{ marginTop: '40px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: '20px', padding: '30px' }}>
              <h3 className="ts-font-orbitron" style={{ color: 'var(--ts-accent)', marginBottom: '20px', fontSize: '1.1rem' }}>{t('tokenSchedule.disclaimer.title')}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--ts-text-muted)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>{t('tokenSchedule.disclaimer.notInvestmentAdvice.title')}</strong> {t('tokenSchedule.disclaimer.notInvestmentAdvice.content')}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>{t('tokenSchedule.disclaimer.forwardLooking.title')}</strong> {t('tokenSchedule.disclaimer.forwardLooking.content')}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>{t('tokenSchedule.disclaimer.subjectToChange.title')}</strong> {t('tokenSchedule.disclaimer.subjectToChange.content')}
                </p>
                <p>
                  <strong style={{ color: '#fff' }}>{t('tokenSchedule.disclaimer.limitedLiability.title')}</strong> {t('tokenSchedule.disclaimer.limitedLiability.content')}
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
              <p style={{ color: 'var(--ts-text-muted)' }}>{t('tokenSchedule.footer.vision')}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '15px', maxWidth: '600px', margin: '15px auto 0' }}>
                {t('tokenSchedule.footer.disclaimer')}
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
