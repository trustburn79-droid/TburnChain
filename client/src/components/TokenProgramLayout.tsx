import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ReactNode, useState } from "react";
import { TBurnLogo } from "@/components/tburn-logo";
import i18n, { changeLanguageWithPreload } from "@/lib/i18n";
import { Globe, ChevronDown } from "lucide-react";

interface TokenProgramLayoutProps {
  children: ReactNode;
  programKey: string;
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
];

export default function TokenProgramLayout({ 
  children, 
  programKey,
  accentColor = '#D4AF37',
  gradientFrom = '#D4AF37',
  gradientTo = '#F5D76E'
}: TokenProgramLayoutProps) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleLanguageChange = async (code: string) => {
    setLanguage(code);
    setIsLangOpen(false);
    await changeLanguageWithPreload(code);
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="token-program-layout" style={{ '--accent': accentColor, '--gradient-from': gradientFrom, '--gradient-to': gradientTo } as React.CSSProperties}>
      <style>{`
        .token-program-layout {
          min-height: 100vh;
          background: #0F172A;
          color: #FFFFFF;
        }

        .tp-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tp-header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tp-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .tp-logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .tp-logo-text span {
          color: var(--accent);
        }

        .tp-nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .tp-nav-links a {
          color: #94A3B8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .tp-nav-links a:hover {
          color: var(--accent);
        }

        .tp-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .tp-lang-selector {
          position: relative;
        }

        .tp-lang-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tp-lang-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: var(--accent);
        }

        .tp-lang-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px;
          min-width: 180px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          display: none;
          max-height: 400px;
          overflow-y: auto;
        }

        .tp-lang-dropdown.open {
          display: block;
        }

        .tp-lang-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.875rem;
        }

        .tp-lang-option:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .tp-lang-option.active {
          background: rgba(var(--accent), 0.2);
          color: var(--accent);
        }

        .tp-lang-flag {
          font-size: 1.25rem;
        }

        .tp-main {
          padding-top: 80px;
        }

        .tp-footer {
          background: #0F172A;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 60px 2rem 30px;
        }

        .tp-footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .tp-footer-brand h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .tp-footer-brand h3 span {
          color: var(--accent);
        }

        .tp-footer-brand p {
          color: #94A3B8;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .tp-footer-col h4 {
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #FFFFFF;
        }

        .tp-footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tp-footer-col ul li {
          margin-bottom: 0.75rem;
        }

        .tp-footer-col ul li a {
          color: #94A3B8;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
        }

        .tp-footer-col ul li a:hover {
          color: var(--accent);
        }

        .tp-footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .tp-footer-copyright {
          color: #64748B;
          font-size: 0.875rem;
        }

        .tp-footer-links {
          display: flex;
          gap: 2rem;
        }

        .tp-footer-links a {
          color: #64748B;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s;
        }

        .tp-footer-links a:hover {
          color: var(--accent);
        }

        @media (max-width: 1024px) {
          .tp-nav-links {
            display: none;
          }
          .tp-footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 640px) {
          .tp-footer-content {
            grid-template-columns: 1fr;
          }
          .tp-footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>

      <header className="tp-header">
        <div className="tp-header-container">
          <Link href="/" className="tp-logo" data-testid="link-home">
            <TBurnLogo showText={false} className="w-10 h-10" />
            <span className="tp-logo-text">
              TB<span>URN</span>
            </span>
          </Link>

          <nav className="tp-nav-links">
            <Link href="/" data-testid="link-nav-home">{t('tokenPrograms.nav.home', 'Home')}</Link>
            <Link href="/scan" data-testid="link-nav-explorer">{t('tokenPrograms.nav.explorer', 'Explorer')}</Link>
            <Link href="/vc" data-testid="link-nav-invest">{t('tokenPrograms.nav.invest', 'Invest')}</Link>
            <Link href="/staking" data-testid="link-nav-staking">{t('tokenPrograms.nav.staking', 'Staking')}</Link>
          </nav>

          <div className="tp-header-right">
            <div className="tp-lang-selector">
              <button 
                className="tp-lang-btn" 
                onClick={() => setIsLangOpen(!isLangOpen)}
                data-testid="button-language-selector"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang.flag} {currentLang.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`tp-lang-dropdown ${isLangOpen ? 'open' : ''}`}>
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className={`tp-lang-option ${language === lang.code ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                    data-testid={`lang-option-${lang.code}`}
                  >
                    <span className="tp-lang-flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="tp-main">
        {children}
      </main>

      <footer className="tp-footer">
        <div className="tp-footer-content">
          <div className="tp-footer-brand">
            <h3>TB<span>URN</span></h3>
            <p>{t('tokenPrograms.footer.description', 'Building the future of decentralized finance with innovative blockchain technology.')}</p>
          </div>
          <div className="tp-footer-col">
            <h4>{t('tokenPrograms.footer.ecosystem', 'Ecosystem')}</h4>
            <ul>
              <li><Link href="/staking">{t('tokenPrograms.footer.staking', 'Staking')}</Link></li>
              <li><Link href="/governance">{t('tokenPrograms.footer.governance', 'Governance')}</Link></li>
              <li><Link href="/bridge">{t('tokenPrograms.footer.bridge', 'Bridge')}</Link></li>
            </ul>
          </div>
          <div className="tp-footer-col">
            <h4>{t('tokenPrograms.footer.resources', 'Resources')}</h4>
            <ul>
              <li><Link href="/scan">{t('tokenPrograms.footer.explorer', 'Explorer')}</Link></li>
              <li><a href="https://docs.tburn.io" target="_blank" rel="noopener noreferrer">{t('tokenPrograms.footer.docs', 'Documentation')}</a></li>
              <li><Link href="/developers">{t('tokenPrograms.footer.developers', 'Developers')}</Link></li>
            </ul>
          </div>
          <div className="tp-footer-col">
            <h4>{t('tokenPrograms.footer.community', 'Community')}</h4>
            <ul>
              <li><a href="https://x.com/tburnio" target="_blank" rel="noopener noreferrer">Twitter/X</a></li>
              <li><a href="https://t.me/tburn" target="_blank" rel="noopener noreferrer">Telegram</a></li>
              <li><a href="https://discord.gg/tburn" target="_blank" rel="noopener noreferrer">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="tp-footer-bottom">
          <p className="tp-footer-copyright">© 2025 TBURN Foundation. {t('tokenPrograms.footer.rights', 'All rights reserved.')}</p>
          <div className="tp-footer-links">
            <Link href="/privacy">{t('tokenPrograms.footer.privacy', 'Privacy Policy')}</Link>
            <Link href="/terms">{t('tokenPrograms.footer.terms', 'Terms of Service')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { TokenProgramLayout };
