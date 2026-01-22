import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TBurnLogo } from "@/components/tburn-logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Home, ScanLine, User, Bug, Shield, Coins, ImageIcon, HelpCircle } from "lucide-react";

export default function TokenDetails() {
  const { t } = useTranslation();

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
          --td-container-width: 1200px;
        }

        .td-root {
          background-color: var(--td-bg-deep);
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(255, 107, 53, 0.08), transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(0, 212, 170, 0.08), transparent 25%);
          color: var(--td-text-main);
          font-family: ui-sans-serif, system-ui, sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .td-root h1, .td-root h2, .td-root h3, .td-root h4 { font-family: ui-sans-serif, system-ui, sans-serif; font-weight: 700; }
        .td-font-mono { font-family: 'JetBrains Mono', monospace; }

        .td-container { max-width: var(--td-container-width); margin: 0 auto; padding: 0 32px; }
        @media (max-width: 1024px) {
          .td-container { padding: 0 24px; }
        }
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
        .td-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .td-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
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
          font-size: clamp(1.5rem, 3.5vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 24px;
          letter-spacing: -0.025em;
          line-height: 1.1;
          white-space: nowrap;
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
        .td-meta-value { font-weight: 700; color: var(--td-primary); font-size: 1.1rem; }

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
        .td-dist-pct { font-size: 2.5rem; font-weight: 700; margin-bottom: 5px; line-height: 1; }
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
        .td-info-val { font-size: 1.1rem; font-weight: 600; color: #fff; }

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
        .td-t-date { font-size: 0.9rem; color: var(--td-primary); margin-bottom: 5px; }
        .td-t-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 5px; color: #fff; }
        .td-t-desc { color: var(--td-text-muted); font-size: 0.9rem; }

        .td-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-top: 20px; }
        .td-stat-box { 
          background: rgba(255,255,255,0.03); border: 1px solid var(--td-border-glass); 
          border-radius: 16px; padding: 20px; text-align: center; 
        }
        .td-stat-v { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 5px; }
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
          .td-hero h1 { font-size: 1.25rem; white-space: normal; }
          .td-section-title { font-size: 1.5rem; }
          .td-card { padding: 20px; }
        }
      `}</style>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="td-root">
        <header className="td-header">
          <div className="td-container td-flex td-justify-between td-items-center">
            <div className="td-header-left">
              <TBurnLogo className="w-10 h-10" showText={false} />
              <div className="td-logo-text td-font-orbitron">TBURN</div>
            </div>
            <div className="td-header-right">
              <a href="/" className="td-header-icon" title="Home"><Home size={18} /></a>
              <a href="/scan" className="td-header-icon" title="Scan"><ScanLine size={18} /></a>
              <a href="/user" className="td-header-icon" title="User"><User size={18} /></a>
              <a href="/bug-bounty" className="td-header-icon" title="Bug Bounty"><Bug size={18} /></a>
              <a href="/security-audit" className="td-header-icon" title="Security Audit"><Shield size={18} /></a>
              <a href="/token-generator" className="td-header-icon" title="Token Generator"><Coins size={18} /></a>
              <a href="/nft-marketplace" className="td-header-icon" title="NFT Marketplace"><ImageIcon size={18} /></a>
              <a href="/qna" className="td-header-icon" title="QnA"><HelpCircle size={18} /></a>
              <LanguageSelector isDark={true} />
            </div>
          </div>
        </header>

        <nav className="td-nav-wrapper">
          <div className="td-container">
            <div className="td-nav-scroll">
              <a href="#overview" className="td-nav-item td-active">{t('tokenDetails.nav.overview')}</a>
              <a href="#community" className="td-nav-item">{t('tokenDetails.nav.community')}</a>
              <a href="#rewards" className="td-nav-item">{t('tokenDetails.nav.rewards')}</a>
              <a href="#investors" className="td-nav-item">{t('tokenDetails.nav.investors')}</a>
              <a href="#ecosystem" className="td-nav-item">{t('tokenDetails.nav.ecosystem')}</a>
              <a href="#team" className="td-nav-item">{t('tokenDetails.nav.team')}</a>
              <a href="#foundation" className="td-nav-item">{t('tokenDetails.nav.foundation', { defaultValue: 'Foundation' })}</a>
              <a href="#y1schedule" className="td-nav-item">{t('tokenDetails.nav.y1Schedule')}</a>
              <a href="#checklist" className="td-nav-item">{t('tokenDetails.nav.checklist')}</a>
              <a href="#calendar" className="td-nav-item">{t('tokenDetails.nav.calendar')}</a>
            </div>
          </div>
        </nav>

        <main>
          <div className="td-hero td-container">
            <div className="td-fade-in-up">
              <h1 className="td-font-orbitron">{t('tokenDetails.hero.title')}</h1>
              <p style={{ color: 'var(--td-text-muted)', fontSize: '1.1rem' }}>
                {t('tokenDetails.hero.subtitle')}<br />
                {t('tokenDetails.hero.description')}
              </p>
            </div>
            <div className="td-hero-meta td-fade-in-up">
              <div className="td-meta-item">
                <span className="td-meta-label">{t('tokenDetails.hero.mainnetGenesis')}</span>
                <span className="td-meta-value">2025.12.22</span>
              </div>
              <div className="td-meta-item">
                <span className="td-meta-label">{t('tokenDetails.hero.exchangeListing')}</span>
                <span className="td-meta-value">{t('tokenDetails.hero.listingDate')}</span>
              </div>
              <div className="td-meta-item">
                <span className="td-meta-label">{t('tokenDetails.hero.applicablePeriod')}</span>
                <span className="td-meta-value">Year 1</span>
              </div>
            </div>
          </div>

          <section id="overview" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-clipboard-list" style={{ color: 'var(--td-primary)' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.overview.title')}</h2>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.overview.purpose.title')}</h3></div>
                <div className="td-highlight-box td-hl-ocean">
                  <p style={{ margin: 0, color: '#fff' }}>
                    {t('tokenDetails.overview.purpose.description')}
                  </p>
                </div>
                <ul style={{ listStyle: 'none', marginTop: '15px', fontSize: '0.95rem', color: 'var(--td-text-muted)', lineHeight: 2 }}>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> {t('tokenDetails.overview.purpose.item1')}</li>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> {t('tokenDetails.overview.purpose.item2')}</li>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> {t('tokenDetails.overview.purpose.item3')}</li>
                  <li><i className="fas fa-check" style={{ color: 'var(--td-secondary)', marginRight: '8px' }}></i> {t('tokenDetails.overview.purpose.item4')}</li>
                </ul>
              </div>

              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.overview.schedule.title')}</h3></div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                  <div className="td-timeline-item">
                    <div className="td-t-date">2025.12.22</div>
                    <div className="td-t-title">{t('tokenDetails.overview.schedule.genesis.title')}</div>
                    <div className="td-t-desc">{t('tokenDetails.overview.schedule.genesis.desc')}</div>
                  </div>
                  <div className="td-timeline-item">
                    <div className="td-t-date">2026.01.05 ~ 11</div>
                    <div className="td-t-title">{t('tokenDetails.overview.schedule.seed.title')}</div>
                    <div className="td-t-desc">$0.04, 5{t('tokenDetails.common.billion')} TBURN, $20M</div>
                  </div>
                  <div className="td-timeline-item">
                    <div className="td-t-date">2026.01.19 ~ 30</div>
                    <div className="td-t-title">{t('tokenDetails.overview.schedule.public.title')}</div>
                    <div className="td-t-desc">$0.20, 6{t('tokenDetails.common.billion')} TBURN, $120M</div>
                  </div>
                  <div className="td-timeline-item">
                    <div className="td-t-date">{t('tokenDetails.overview.schedule.listing.date')}</div>
                    <div className="td-t-title">{t('tokenDetails.overview.schedule.listing.title')}</div>
                    <div className="td-t-desc">{t('tokenDetails.overview.schedule.listing.desc')}</div>
                  </div>
                </div>
                <div className="td-highlight-box td-hl-fire" style={{ marginTop: '20px', fontWeight: 700, textAlign: 'center', color: '#fff' }}>
                  {t('tokenDetails.overview.schedule.note')}
                </div>
              </div>
            </div>

            <div className="td-card td-mt-6">
              <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.overview.distribution.title')}</h3></div>
              
              {/* v4.3 토큰 배분 구조 */}
              <div className="td-dist-chart">
                <div className="td-dist-item" style={{ borderTop: '3px solid #FF6B35' }}>
                  <div className="td-dist-pct" style={{ color: '#FF6B35' }}>30%</div>
                  <div className="td-dist-amt">30{t('tokenDetails.common.billion')} TBURN</div>
                  <div className="td-dist-lbl">{t('tokenDetails.distribution.community')}</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #00D4AA' }}>
                  <div className="td-dist-pct" style={{ color: '#00D4AA' }}>22%</div>
                  <div className="td-dist-amt">22{t('tokenDetails.common.billion')} TBURN</div>
                  <div className="td-dist-lbl">{t('tokenDetails.distribution.rewards')}</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #FFD700' }}>
                  <div className="td-dist-pct" style={{ color: '#FFD700' }}>20%</div>
                  <div className="td-dist-amt">20{t('tokenDetails.common.billion')} TBURN</div>
                  <div className="td-dist-lbl">{t('tokenDetails.distribution.investors')}</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #8B5CF6' }}>
                  <div className="td-dist-pct" style={{ color: '#8B5CF6' }}>14%</div>
                  <div className="td-dist-amt">14{t('tokenDetails.common.billion')} TBURN</div>
                  <div className="td-dist-lbl">{t('tokenDetails.distribution.ecosystem')}</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #EC4899' }}>
                  <div className="td-dist-pct" style={{ color: '#EC4899' }}>11%</div>
                  <div className="td-dist-amt">11{t('tokenDetails.common.billion')} TBURN</div>
                  <div className="td-dist-lbl">{t('tokenDetails.distribution.team')}</div>
                </div>
                <div className="td-dist-item" style={{ borderTop: '3px solid #60A5FA' }}>
                  <div className="td-dist-pct" style={{ color: '#60A5FA' }}>3%</div>
                  <div className="td-dist-amt">3{t('tokenDetails.common.billion')} TBURN</div>
                  <div className="td-dist-lbl">{t('tokenDetails.distribution.foundation', { defaultValue: 'Foundation Reserve' })}</div>
                </div>
              </div>

              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>{t('tokenDetails.table.category')}</th><th>{t('tokenDetails.table.subcategory')}</th><th>{t('tokenDetails.table.ratio')}</th><th>{t('tokenDetails.table.quantity')}</th><th>{t('tokenDetails.table.method')}</th><th>{t('tokenDetails.table.target')}</th></tr></thead>
                  <tbody>
                    <tr><td rowSpan={5} style={{ color: 'var(--td-primary)', fontWeight: 700 }}>{t('tokenDetails.table.communityIcon')} {t('tokenDetails.distribution.community')}</td><td>{t('tokenDetails.community.airdrop.name')}</td><td>12.0%</td><td>12.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.community.airdrop.method')}</td><td>{t('tokenDetails.community.airdrop.target')}</td></tr>
                    <tr><td>{t('tokenDetails.community.referral.name')}</td><td>3.0%</td><td>3.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.community.referral.method')}</td><td>{t('tokenDetails.community.referral.target')}</td></tr>
                    <tr><td>{t('tokenDetails.community.events.name')}</td><td>4.0%</td><td>4.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.community.events.method')}</td><td>{t('tokenDetails.community.events.target')}</td></tr>
                    <tr><td>{t('tokenDetails.community.activity.name')}</td><td>3.0%</td><td>3.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.community.activity.method')}</td><td>{t('tokenDetails.community.activity.target')}</td></tr>
                    <tr><td>{t('tokenDetails.community.dao.name')}</td><td>8.0%</td><td>8.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.community.dao.method')}</td><td>{t('tokenDetails.community.dao.target')}</td></tr>
                    
                    <tr><td rowSpan={2} style={{ color: 'var(--td-secondary)', fontWeight: 700 }}>{t('tokenDetails.table.rewardsIcon')} {t('tokenDetails.distribution.rewards')}</td><td>{t('tokenDetails.rewards.block.name')}</td><td>14.5%</td><td>14.50{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.rewards.block.method')}</td><td>{t('tokenDetails.rewards.block.target')}</td></tr>
                    <tr><td>{t('tokenDetails.rewards.validator.name')}</td><td>7.5%</td><td>7.50{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.rewards.validator.method')}</td><td>{t('tokenDetails.rewards.validator.target')}</td></tr>
                    
                    <tr><td rowSpan={3} style={{ color: 'var(--td-accent)', fontWeight: 700 }}>{t('tokenDetails.table.investorsIcon')} {t('tokenDetails.distribution.investors')}</td><td>{t('tokenDetails.investors.seed.name')}</td><td>5.0%</td><td>5.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.investors.seed.method')}</td><td>{t('tokenDetails.investors.seed.target')}</td></tr>
                    <tr><td>{t('tokenDetails.investors.private.name')}</td><td>9.0%</td><td>9.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.investors.private.method')}</td><td>{t('tokenDetails.investors.private.target')}</td></tr>
                    <tr><td>{t('tokenDetails.investors.public.name')}</td><td>6.0%</td><td>6.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.investors.public.method')}</td><td>{t('tokenDetails.investors.public.target')}</td></tr>
                    
                    {/* v4.3 Ecosystem - 14% (GENESIS_ALLOCATION: 7%+4%+3%) */}
                    <tr><td rowSpan={3} style={{ color: 'var(--td-purple)', fontWeight: 700 }}><i className="fas fa-globe" style={{ marginRight: '5px' }}></i> {t('tokenDetails.distribution.ecosystem')}</td><td>{t('tokenDetails.ecosystem.fund.name')}</td><td>7.0%</td><td>7.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.ecosystem.fund.vesting')}</td><td>{t('tokenDetails.ecosystem.fund.y1Activity')}</td></tr>
                    <tr><td>{t('tokenDetails.ecosystem.partnership.name')}</td><td>4.0%</td><td>4.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.ecosystem.partnership.vesting')}</td><td>{t('tokenDetails.ecosystem.partnership.y1Activity')}</td></tr>
                    <tr><td>{t('tokenDetails.ecosystem.marketing.name')}</td><td>3.0%</td><td>3.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.ecosystem.marketing.vesting')}</td><td>{t('tokenDetails.ecosystem.marketing.y1Activity')}</td></tr>
                    
                    {/* v4.3 Team - 11% (GENESIS_ALLOCATION: 7%+2%+2%) */}
                    <tr><td rowSpan={3} style={{ color: 'var(--td-pink)', fontWeight: 700 }}><i className="fas fa-user-tie" style={{ marginRight: '5px' }}></i> {t('tokenDetails.distribution.team')}</td><td>{t('tokenDetails.team.core.name')}</td><td>7.0%</td><td>7.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.team.core.cliff')}</td><td>Core Team</td></tr>
                    <tr><td>{t('tokenDetails.team.advisor.name')}</td><td>2.0%</td><td>2.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.team.advisor.cliff')}</td><td>Advisors</td></tr>
                    <tr><td>{t('tokenDetails.team.strategic.name')}</td><td>2.0%</td><td>2.00{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.team.strategic.cliff')}</td><td>Strategic Partners</td></tr>
                    
                    {/* v4.3 Foundation Reserve - 3% (GENESIS_ALLOCATION: 1.5%+1%+0.5%) */}
                    <tr><td rowSpan={3} style={{ color: '#60A5FA', fontWeight: 700 }}><i className="fas fa-landmark" style={{ marginRight: '5px' }}></i> {t('tokenDetails.distribution.foundation', { defaultValue: 'Foundation Reserve' })}</td><td>{t('tokenDetails.foundation.operations.name', { defaultValue: 'Operations Reserve' })}</td><td>1.5%</td><td>1.50{t('tokenDetails.common.billion')}</td><td>30% TGE</td><td>Legal, Listing, Infra</td></tr>
                    <tr><td>{t('tokenDetails.foundation.emergency.name', { defaultValue: 'Emergency Reserve' })}</td><td>1.0%</td><td>1.00{t('tokenDetails.common.billion')}</td><td>50% TGE + Lock</td><td>Emergency Fund</td></tr>
                    <tr><td>{t('tokenDetails.foundation.strategic.name', { defaultValue: 'Strategic Investment' })}</td><td>0.5%</td><td>0.50{t('tokenDetails.common.billion')}</td><td>Discretionary</td><td>Strategic Investment</td></tr>
                    
                    <tr className="td-highlight-row"><td colSpan={2}><strong>{t('tokenDetails.table.total')}</strong></td><td><strong>100.0%</strong></td><td><strong>100.00{t('tokenDetails.common.billion')}</strong></td><td colSpan={2}></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="community" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-users" style={{ color: 'var(--td-primary)' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.community.title')}</h2>
            </div>

            <div className="td-card">
              <div className="td-card-header">
                <h3 className="td-card-title">{t('tokenDetails.community.airdrop.title')}</h3>
                <span className="td-badge td-bg-fire">{t('tokenDetails.community.airdrop.method')}</span>
              </div>
              
              <div className="td-info-grid td-mb-6">
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.common.totalSupply')}</div><div className="td-info-val">12{t('tokenDetails.common.billion')} TBURN</div></div>
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.common.vesting')}</div><div className="td-info-val">{t('tokenDetails.community.airdrop.vesting')}</div></div>
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.community.airdrop.claimPeriod')}</div><div className="td-info-val">{t('tokenDetails.community.airdrop.claimPeriodValue')}</div></div>
              </div>

              <div className="td-table-wrapper td-mb-6">
                <table>
                  <thead><tr><th>{t('tokenDetails.community.airdrop.tier')}</th><th>{t('tokenDetails.community.airdrop.qualification')}</th><th>{t('tokenDetails.community.airdrop.allocation')}</th><th>{t('tokenDetails.community.airdrop.expectedCount')}</th><th>{t('tokenDetails.community.airdrop.perPerson')}</th></tr></thead>
                  <tbody>
                    <tr><td><span className="td-tier-tag td-tier-og">OG</span></td><td>{t('tokenDetails.community.airdrop.tierOgCondition')}</td><td>2.40{t('tokenDetails.common.billion')} (20%)</td><td>{t('tokenDetails.community.airdrop.tierOgCount')}</td><td>48,000</td></tr>
                    <tr><td><span className="td-tier-tag td-tier-early">Early</span></td><td>{t('tokenDetails.community.airdrop.tierEarlyCondition')}</td><td>3.60{t('tokenDetails.common.billion')} (30%)</td><td>{t('tokenDetails.community.airdrop.tierEarlyCount')}</td><td>24,000</td></tr>
                    <tr><td><span className="td-tier-tag td-tier-active">Active</span></td><td>{t('tokenDetails.community.airdrop.tierActiveCondition')}</td><td>3.60{t('tokenDetails.common.billion')} (30%)</td><td>{t('tokenDetails.community.airdrop.tierActiveCount')}</td><td>12,000</td></tr>
                    <tr><td><span className="td-tier-tag td-tier-basic">Basic</span></td><td>{t('tokenDetails.community.airdrop.tierBasicCondition')}</td><td>2.40{t('tokenDetails.common.billion')} (20%)</td><td>{t('tokenDetails.community.airdrop.tierBasicCount')}</td><td>4,800</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <div className="td-step"><div className="td-step-num">1</div><div>{t('tokenDetails.community.airdrop.step1')}</div></div>
                <div className="td-step"><div className="td-step-num">2</div><div>{t('tokenDetails.community.airdrop.step2')}</div></div>
                <div className="td-step"><div className="td-step-num">3</div><div>{t('tokenDetails.community.airdrop.step3')}</div></div>
                <div className="td-step"><div className="td-step-num">4</div><div>{t('tokenDetails.community.airdrop.step4')}</div></div>
              </div>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.community.referral.title')}</h3></div>
                <div className="td-info-grid td-mb-4">
                  <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.common.vesting')}</div><div className="td-info-val">{t('tokenDetails.community.referral.vesting')}</div></div>
                  <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.table.method')}</div><div className="td-info-val">{t('tokenDetails.community.referral.method')}</div></div>
                </div>
                <div className="td-table-wrapper">
                  <table>
                    <thead><tr><th>{t('tokenDetails.community.referral.activity')}</th><th>{t('tokenDetails.community.referral.referrer')}</th><th>{t('tokenDetails.community.referral.referee')}</th></tr></thead>
                    <tbody>
                      <tr><td>{t('tokenDetails.community.referral.signupTx')}</td><td>50 TBURN</td><td>50 TBURN</td></tr>
                      <tr><td>{t('tokenDetails.community.referral.saleParticipation')}</td><td>1%</td><td>0.5%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.community.events.title')}</h3></div>
                <div className="td-info-grid td-mb-4">
                  <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.common.vesting')}</div><div className="td-info-val">{t('tokenDetails.community.events.vesting')}</div></div>
                  <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.table.method')}</div><div className="td-info-val">{t('tokenDetails.community.events.method')}</div></div>
                </div>
                <ul style={{ listStyle: 'none', fontSize: '0.95rem', color: 'var(--td-text-muted)' }}>
                  <li style={{ marginBottom: '8px' }}>• {t('tokenDetails.community.events.launchAirdrop')}</li>
                  <li style={{ marginBottom: '8px' }}>• {t('tokenDetails.community.events.walletCampaign')}</li>
                  <li>• {t('tokenDetails.community.events.tier1Listing')}</li>
                </ul>
              </div>
            </div>

            <div className="td-card">
              <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.community.dao.title')}</h3><span className="td-badge td-bg-fire">{t('tokenDetails.community.dao.cliff')}</span></div>
              <div className="td-highlight-box td-hl-ocean" style={{ marginTop: 0 }}>
                <p style={{ margin: 0, color: '#fff' }}><strong>{t('tokenDetails.community.dao.lockupWarning')}</strong></p>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#fff' }}>{t('tokenDetails.community.dao.unlockInfo')}</p>
              </div>
            </div>
          </section>

          <section id="rewards" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-hammer" style={{ color: 'var(--td-secondary)' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.rewards.title')}</h2>
            </div>

            <div className="td-card">
              <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.rewards.block.title')}</h3><span className="td-badge td-bg-ocean">{t('tokenDetails.rewards.block.duration')}</span></div>
              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>{t('tokenDetails.rewards.block.halving')}</th><th>{t('tokenDetails.rewards.block.period')}</th><th>{t('tokenDetails.rewards.block.perBlock')}</th><th>{t('tokenDetails.rewards.block.annualIssuance')}</th><th>{t('tokenDetails.rewards.block.note')}</th></tr></thead>
                  <tbody>
                    <tr><td>{t('tokenDetails.rewards.block.phase1')}</td><td>Year 1~4</td><td style={{ color: 'var(--td-secondary)', fontWeight: 700 }}>10 TBURN</td><td>6.31{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.rewards.block.phase1Note')}</td></tr>
                    <tr><td>{t('tokenDetails.rewards.block.phase2')}</td><td>Year 5~8</td><td>5 TBURN</td><td>3.15{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.rewards.block.phase2Note')}</td></tr>
                    <tr><td>{t('tokenDetails.rewards.block.phase3')}</td><td>Year 9~12</td><td>2.5 TBURN</td><td>1.58{t('tokenDetails.common.billion')}</td><td>{t('tokenDetails.rewards.block.phase3Note')}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="td-stat-grid">
                <div className="td-stat-box">
                  <div className="td-stat-v" style={{ color: 'var(--td-secondary)' }}>125</div>
                  <div className="td-stat-l">{t('tokenDetails.rewards.block.validatorCount')}</div>
                </div>
                <div className="td-stat-box">
                  <div className="td-stat-v">~6.3{t('tokenDetails.common.billion')}</div>
                  <div className="td-stat-l">{t('tokenDetails.rewards.block.y1TotalReward')}</div>
                </div>
                <div className="td-stat-box">
                  <div className="td-stat-v">~42{t('tokenDetails.common.tenThousand')}</div>
                  <div className="td-stat-l">{t('tokenDetails.rewards.block.monthlyPerValidator')}</div>
                </div>
              </div>
            </div>

            <div className="td-card">
              <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.rewards.validator.title')}</h3><span className="td-badge td-bg-gold">{t('tokenDetails.rewards.validator.performanceBased')}</span></div>
              <div className="td-info-grid td-mb-4">
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.rewards.validator.distributionPeriod')}</div><div className="td-info-val">{t('tokenDetails.rewards.validator.distributionPeriodValue')}</div></div>
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.rewards.validator.monthlyBudget')}</div><div className="td-info-val">{t('tokenDetails.rewards.validator.monthlyBudgetValue')}</div></div>
              </div>
              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>{t('tokenDetails.rewards.validator.type')}</th><th>{t('tokenDetails.table.ratio')}</th><th>{t('tokenDetails.rewards.validator.monthlyBudget')}</th><th>{t('tokenDetails.rewards.validator.condition')}</th></tr></thead>
                  <tbody>
                    <tr><td>{t('tokenDetails.rewards.validator.uptimeBonus')}</td><td>40%</td><td>533{t('tokenDetails.common.tenThousand')}</td><td>{t('tokenDetails.rewards.validator.uptimeCondition')}</td></tr>
                    <tr><td>{t('tokenDetails.rewards.validator.blockProduction')}</td><td>30%</td><td>400{t('tokenDetails.common.tenThousand')}</td><td>{t('tokenDetails.rewards.validator.blockCondition')}</td></tr>
                    <tr><td>{t('tokenDetails.rewards.validator.networkContribution')}</td><td>20%</td><td>267{t('tokenDetails.common.tenThousand')}</td><td>{t('tokenDetails.rewards.validator.networkCondition')}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="investors" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-coins" style={{ color: 'var(--td-accent)' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.investors.title')}</h2>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">Seed Round (5%)</h3><span className="td-badge td-bg-gold">$0.04</span></div>
                <div className="td-info-grid td-mb-4" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.common.vesting')}</div><div className="td-info-val">{t('tokenDetails.investors.seed.vesting')}</div></div>
                </div>
                <div className="td-highlight-box td-hl-warning" style={{ margin: 0 }}>
                  <strong>{t('tokenDetails.investors.seed.y1Unlock')}</strong><br />
                  {t('tokenDetails.investors.seed.firstUnlock')}
                </div>
              </div>

              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">Private Round (9%)</h3><span className="td-badge td-bg-ocean">$0.10</span></div>
                <div className="td-info-grid td-mb-4" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.common.vesting')}</div><div className="td-info-val">{t('tokenDetails.investors.private.vesting')}</div></div>
                </div>
                <div className="td-highlight-box td-hl-ocean" style={{ margin: 0, color: '#fff' }}>
                  <strong>{t('tokenDetails.investors.private.y1Unlock')}</strong><br />
                  {t('tokenDetails.investors.private.firstUnlock')}
                </div>
              </div>

              <div className="td-card">
                <div className="td-card-header"><h3 className="td-card-title">Public Sale (6%)</h3><span className="td-badge td-bg-fire">$0.20</span></div>
                <div className="td-info-grid td-mb-4" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.common.vesting')}</div><div className="td-info-val">{t('tokenDetails.investors.public.vesting')}</div></div>
                </div>
                <div className="td-highlight-box td-hl-fire" style={{ margin: 0, color: '#fff' }}>
                  <strong>{t('tokenDetails.investors.public.y1Unlock')}</strong><br />
                  {t('tokenDetails.investors.public.details')}
                </div>
              </div>
            </div>
          </section>

          <section id="ecosystem" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-globe" style={{ color: 'var(--td-purple)' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.ecosystem.title')}</h2>
            </div>
            
            <div className="td-card">
              <div className="td-table-wrapper">
                <table>
                  <thead><tr><th>{t('tokenDetails.ecosystem.item')}</th><th>{t('tokenDetails.table.quantity')}</th><th>{t('tokenDetails.common.vesting')}</th><th>{t('tokenDetails.ecosystem.y1Activity')}</th></tr></thead>
                  <tbody>
                    <tr>
                      <td className="td-font-bold" style={{ color: 'var(--td-purple)' }}>{t('tokenDetails.ecosystem.fund.name')}</td>
                      <td>8{t('tokenDetails.common.billion')} (8%)</td>
                      <td>{t('tokenDetails.ecosystem.fund.vesting')}</td>
                      <td>{t('tokenDetails.ecosystem.fund.y1Activity')}</td>
                    </tr>
                    <tr>
                      <td className="td-font-bold" style={{ color: 'var(--td-purple)' }}>{t('tokenDetails.ecosystem.partnership.name')}</td>
                      <td>4{t('tokenDetails.common.billion')} (4%)</td>
                      <td>{t('tokenDetails.ecosystem.partnership.vesting')}</td>
                      <td>{t('tokenDetails.ecosystem.partnership.y1Activity')}</td>
                    </tr>
                    <tr>
                      <td className="td-font-bold" style={{ color: 'var(--td-purple)' }}>{t('tokenDetails.ecosystem.marketing.name')}</td>
                      <td>2{t('tokenDetails.common.billion')} (2%)</td>
                      <td>{t('tokenDetails.ecosystem.marketing.vesting')}</td>
                      <td>{t('tokenDetails.ecosystem.marketing.y1Activity')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="team" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-user-tie" style={{ color: 'var(--td-pink)' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.team.title')}</h2>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-text-pink td-mb-2">{t('tokenDetails.team.core.name')}</h3>
                <div className="td-badge td-bg-pink td-mb-4">{t('tokenDetails.team.core.cliff')}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>{t('tokenDetails.team.core.firstUnlock')}</p>
              </div>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-text-purple td-mb-2">{t('tokenDetails.team.advisor.name')}</h3>
                <div className="td-badge td-bg-purple td-mb-4">{t('tokenDetails.team.advisor.cliff')}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>{t('tokenDetails.team.advisor.firstUnlock')}</p>
              </div>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-text-secondary td-mb-2">{t('tokenDetails.team.strategic.name')}</h3>
                <div className="td-badge td-bg-ocean td-mb-4">{t('tokenDetails.team.strategic.cliff')}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>{t('tokenDetails.team.strategic.firstUnlock')}</p>
              </div>
            </div>
            <div className="td-highlight-box td-hl-warning td-text-center">
              <strong>{t('tokenDetails.team.lockupWarning')}</strong>
            </div>
          </section>

          {/* v4.3 Foundation Reserve Section - 3% */}
          <section id="foundation" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-landmark" style={{ color: '#60A5FA' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.foundation.title', { defaultValue: 'Foundation Reserve (3%)' })}</h2>
            </div>

            <div className="td-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-mb-2" style={{ color: '#60A5FA' }}>{t('tokenDetails.foundation.operations.name', { defaultValue: 'Foundation Operations' })}</h3>
                <div className="td-dist-pct" style={{ color: '#60A5FA', fontSize: '2rem' }}>1.5%</div>
                <div className="td-dist-amt">1.5{t('tokenDetails.common.billion')} TBURN</div>
                <div className="td-badge td-mb-4" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.3)' }}>30% TGE</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>{t('tokenDetails.foundation.operations.desc') || 'Immediate operational funding for legal, exchange listing, infrastructure'}</p>
              </div>
              <div className="td-card td-text-center">
                <h3 className="td-card-title td-mb-2" style={{ color: '#60A5FA' }}>{t('tokenDetails.foundation.emergency.name', { defaultValue: 'Emergency Fund' })}</h3>
                <div className="td-dist-pct" style={{ color: '#60A5FA', fontSize: '2rem' }}>1.5%</div>
                <div className="td-dist-amt">1.5{t('tokenDetails.common.billion')} TBURN</div>
                <div className="td-badge td-mb-4" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.3)' }}>50% TGE + 50% Lock</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--td-text-muted)' }}>{t('tokenDetails.foundation.emergency.desc') || 'Reserved for unforeseen circumstances, market volatility, and ecosystem protection'}</p>
              </div>
            </div>
            <div className="td-highlight-box" style={{ borderColor: '#60A5FA', background: 'rgba(96, 165, 250, 0.05)' }}>
              <p style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
                <strong style={{ color: '#60A5FA' }}>{t('tokenDetails.foundation.note.title', { defaultValue: 'Foundation Transparency' })}</strong><br />
                {t('tokenDetails.foundation.note.desc', { defaultValue: 'All Foundation funds are managed with multi-sig wallets and quarterly transparency reports.' })}
              </p>
            </div>
          </section>

          <section id="y1schedule" className="td-section td-container td-fade-in-up">
            <div className="td-section-header">
              <div className="td-section-icon"><i className="fas fa-calendar-alt" style={{ color: 'var(--td-primary)' }}></i></div>
              <h2 className="td-section-title">{t('tokenDetails.y1Schedule.title')}</h2>
            </div>

            <div className="td-card">
              <div className="td-flex td-justify-between td-items-center td-mb-4">
                <p style={{ color: 'var(--td-text-muted)', fontSize: '0.9rem' }}>{t('tokenDetails.y1Schedule.unit')}</p>
                <div className="td-badge td-bg-fire">{t('tokenDetails.y1Schedule.totalUnlock')}</div>
              </div>
              <div className="td-table-wrapper">
                <table style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr><th>{t('tokenDetails.y1Schedule.timing')}</th><th>{t('tokenDetails.community.airdrop.name')}</th><th>{t('tokenDetails.community.referral.name')}</th><th>{t('tokenDetails.community.events.name')}</th><th>{t('tokenDetails.y1Schedule.blockValidator')}</th><th>{t('tokenDetails.investors.public.name')}</th><th>{t('tokenDetails.investors.private.name')}</th><th>{t('tokenDetails.y1Schedule.ecosystemMarketing')}</th><th>{t('tokenDetails.y1Schedule.monthlyTotal')}</th><th>{t('tokenDetails.y1Schedule.keyEvent')}</th></tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'rgba(255,107,53,0.15)', fontWeight: 700 }}>
                      <td>{t('tokenDetails.y1Schedule.listingDay')}</td><td>1.200</td><td>0.150</td><td>0.400</td><td>-</td><td>1.200</td><td>-</td><td>0.450</td><td className="td-text-primary">3.400</td><td>{t('tokenDetails.y1Schedule.firstListing')}</td>
                    </tr>
                    <tr><td>M1</td><td>0.900</td><td>0.119</td><td>0.150</td><td>0.350</td><td>-</td><td>-</td><td>0.239</td><td>1.758</td><td>{t('tokenDetails.y1Schedule.blockRewardStart')}</td></tr>
                    <tr><td>M2</td><td>0.900</td><td>0.119</td><td>0.300</td><td>0.350</td><td>-</td><td>-</td><td>0.239</td><td>1.908</td><td>{t('tokenDetails.y1Schedule.tier1Target')}</td></tr>
                    <tr><td>M3</td><td>0.900</td><td>0.119</td><td>0.150</td><td>0.350</td><td>-</td><td>-</td><td>0.239</td><td>1.841</td><td>{t('tokenDetails.y1Schedule.publicCliffEnd')}</td></tr>
                    <tr><td>M4</td><td>0.900</td><td>0.119</td><td>0.150</td><td>0.350</td><td>0.533</td><td>-</td><td>0.239</td><td>2.374</td><td>{t('tokenDetails.y1Schedule.publicVesting')}</td></tr>
                    <tr><td>M6</td><td>0.900</td><td>0.119</td><td>0.250</td><td>0.350</td><td>0.533</td><td>-</td><td>0.350</td><td>2.585</td><td>{t('tokenDetails.y1Schedule.partnershipStart')}</td></tr>
                    <tr><td>M10</td><td>0.900</td><td>0.119</td><td>0.100</td><td>0.350</td><td>0.533</td><td>0.500</td><td>0.350</td><td>2.935</td><td>{t('tokenDetails.y1Schedule.privateStart')}</td></tr>
                    <tr style={{ background: 'rgba(255,107,53,0.15)', fontWeight: 700 }}>
                      <td>M12</td><td>0.900</td><td>0.119</td><td>0.300</td><td>0.350</td><td>0.536</td><td>0.500</td><td>0.350</td><td className="td-text-primary">3.138</td><td>{t('tokenDetails.y1Schedule.anniversary')}</td>
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
                <h2 className="td-section-title">{t('tokenDetails.checklist.title')}</h2>
              </div>
              <div className="td-card">
                <div className="td-checklist">
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> {t('tokenDetails.checklist.item1')}</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> {t('tokenDetails.checklist.item2')}</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> {t('tokenDetails.checklist.item3')}</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> {t('tokenDetails.checklist.item4')}</div>
                  <div className="td-check-item"><i className="fas fa-check-circle td-check-icon"></i> {t('tokenDetails.checklist.item5')}</div>
                </div>
              </div>
            </section>

            <section id="calendar" className="td-section td-fade-in-up">
              <div className="td-section-header">
                <div className="td-section-icon"><i className="fas fa-calendar-check" style={{ color: 'var(--td-accent)' }}></i></div>
                <h2 className="td-section-title">{t('tokenDetails.calendar.title')}</h2>
              </div>
              <div className="td-card">
                <div className="td-table-wrapper">
                  <table>
                    <thead><tr><th>{t('tokenDetails.calendar.date')}</th><th>{t('tokenDetails.calendar.event')}</th><th>{t('tokenDetails.calendar.unlockAmount')}</th></tr></thead>
                    <tbody>
                      <tr style={{ background: 'rgba(255,107,53,0.1)' }}><td>{t('tokenDetails.calendar.listingDateTarget')}</td><td className="td-font-bold">{t('tokenDetails.calendar.listingEvent')}</td><td>3.40{t('tokenDetails.common.billion')}</td></tr>
                      <tr><td>2026.05.01</td><td>{t('tokenDetails.calendar.publicVestingStart')}</td><td>+0.53{t('tokenDetails.common.billion')}/{t('tokenDetails.common.month')}</td></tr>
                      <tr><td>2026.08.01</td><td>{t('tokenDetails.calendar.partnershipStartEvent')}</td><td>+0.11{t('tokenDetails.common.billion')}/{t('tokenDetails.common.month')}</td></tr>
                      <tr><td>2026.11.01</td><td>{t('tokenDetails.calendar.privateStartEvent')}</td><td>+0.50{t('tokenDetails.common.billion')}/{t('tokenDetails.common.month')}</td></tr>
                      <tr style={{ background: 'rgba(255,107,53,0.1)' }}><td>2027.02.01</td><td className="td-font-bold">{t('tokenDetails.calendar.anniversaryEvent')}</td><td>+3.13{t('tokenDetails.common.billion')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          <div className="td-container td-fade-in-up">
            <div className="td-card" style={{ border: '2px solid var(--td-primary-glow)' }}>
              <div className="td-card-header"><h3 className="td-card-title">{t('tokenDetails.docInfo.title')}</h3></div>
              <div className="td-info-grid">
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.docInfo.docTitle')}</div><div className="td-info-val">{t('tokenDetails.docInfo.docTitleValue')}</div></div>
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.docInfo.version')}</div><div className="td-info-val">3.0.0 Final</div></div>
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.docInfo.planPeriod')}</div><div className="td-info-val">2025.12.22 ~ 2027.02.01</div></div>
                <div className="td-info-box"><div className="td-info-lbl">{t('tokenDetails.docInfo.y1TotalUnlock')}</div><div className="td-info-val td-text-primary">32.68{t('tokenDetails.common.billion')} (32.7%)</div></div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--td-text-muted)', fontSize: '0.85rem' }}>
                {t('tokenDetails.docInfo.author')}
              </div>
            </div>
          </div>

          <div className="td-container td-fade-in-up" style={{ marginTop: '40px' }}>
            <div className="td-card" style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <div className="td-card-header"><h3 className="td-card-title" style={{ color: 'var(--td-accent)' }}>{t('tokenDetails.disclaimer.title')}</h3></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--td-text-muted)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong>{t('tokenDetails.disclaimer.notInvestmentAdvice.title')}</strong> {t('tokenDetails.disclaimer.notInvestmentAdvice.content')}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>{t('tokenDetails.disclaimer.forwardLooking.title')}</strong> {t('tokenDetails.disclaimer.forwardLooking.content')}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>{t('tokenDetails.disclaimer.subjectToChange.title')}</strong> {t('tokenDetails.disclaimer.subjectToChange.content')}
                </p>
                <p>
                  <strong>{t('tokenDetails.disclaimer.limitedLiability.title')}</strong> {t('tokenDetails.disclaimer.limitedLiability.content')}
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
              <p style={{ color: 'var(--td-text-muted)' }}>{t('tokenDetails.footer.tagline')}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '15px', maxWidth: '600px', margin: '15px auto 0' }}>
                {t('tokenDetails.footer.disclaimer')}
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
