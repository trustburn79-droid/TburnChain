import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X, Sun, Moon, Globe, Check, LogIn, Flame } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";
import { languages } from "@/lib/i18n";
import "../styles/public.css";

interface MenuItem {
  titleKey: string;
  href: string;
  descriptionKey?: string;
}

interface MenuSection {
  key: string;
  titleKey: string;
  items: MenuItem[];
  highlight?: boolean;
}

export function PublicHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const menuStructure: MenuSection[] = [
    {
      key: "learn",
      titleKey: "publicPages.header.nav.learn.title",
      items: [
        { titleKey: "publicPages.header.nav.learn.learnHub.title", href: "/learn", descriptionKey: "publicPages.header.nav.learn.learnHub.description" },
        { titleKey: "publicPages.header.nav.learn.whatIsBurnChain.title", href: "/learn/what-is-burn-chain" },
        { titleKey: "publicPages.header.nav.learn.trustScore.title", href: "/learn/trust-score" },
        { titleKey: "publicPages.header.nav.learn.wallet.title", href: "/learn/wallet" },
        { titleKey: "publicPages.header.nav.learn.blockchainBasics.title", href: "/learn/blockchain-basics" },
        { titleKey: "publicPages.header.nav.learn.defiMastery.title", href: "/learn/defi-mastery" },
        { titleKey: "publicPages.header.nav.learn.developerCourse.title", href: "/learn/developer-course" },
        { titleKey: "publicPages.header.nav.learn.introToDefi.title", href: "/learn/intro-to-defi" },
        { titleKey: "publicPages.header.nav.learn.educationPrograms.title", href: "/learn/education-programs" },
        { titleKey: "publicPages.header.nav.learn.whitepaper.title", href: "/learn/whitepaper" },
        { titleKey: "publicPages.header.nav.learn.tokenomics.title", href: "/learn/tokenomics" },
        { titleKey: "publicPages.header.nav.learn.roadmap.title", href: "/learn/roadmap" },
      ],
    },
    {
      key: "developers",
      titleKey: "publicPages.header.nav.developers.title",
      items: [
        { titleKey: "publicPages.header.nav.developers.developerHub.title", href: "/developers", descriptionKey: "publicPages.header.nav.developers.developerHub.description" },
        { titleKey: "publicPages.header.nav.developers.documentation.title", href: "/developers/docs" },
        { titleKey: "publicPages.header.nav.developers.apiReference.title", href: "/developers/api" },
        { titleKey: "publicPages.header.nav.developers.cliReference.title", href: "/developers/cli" },
        { titleKey: "publicPages.header.nav.developers.sdkGuide.title", href: "/developers/sdk" },
        { titleKey: "publicPages.header.nav.developers.smartContracts.title", href: "/developers/contracts" },
        { titleKey: "publicPages.header.nav.developers.websocketApi.title", href: "/developers/websocket" },
        { titleKey: "publicPages.header.nav.developers.codeExamples.title", href: "/developers/examples" },
        { titleKey: "publicPages.header.nav.developers.quickStart.title", href: "/developers/quickstart" },
        { titleKey: "publicPages.header.nav.developers.installation.title", href: "/developers/installation" },
        { titleKey: "publicPages.header.nav.developers.evmMigration.title", href: "/developers/evm-migration" },
      ],
    },
    {
      key: "solutions",
      titleKey: "publicPages.header.nav.solutions.title",
      items: [
        { titleKey: "publicPages.header.nav.solutions.tokenExtensions.title", href: "/solutions/token-extensions" },
        { titleKey: "publicPages.header.nav.solutions.actionsBlinks.title", href: "/solutions/actions-blinks" },
        { titleKey: "publicPages.header.nav.solutions.wallets.title", href: "/solutions/wallets" },
        { titleKey: "publicPages.header.nav.solutions.permissioned.title", href: "/solutions/permissioned" },
        { titleKey: "publicPages.header.nav.solutions.gameTooling.title", href: "/solutions/game-tooling" },
        { titleKey: "publicPages.header.nav.solutions.payments.title", href: "/solutions/payments" },
        { titleKey: "publicPages.header.nav.solutions.commerce.title", href: "/solutions/commerce" },
        { titleKey: "publicPages.header.nav.solutions.financial.title", href: "/solutions/financial" },
        { titleKey: "publicPages.header.nav.solutions.aiFeatures.title", href: "/solutions/ai-features" },
        { titleKey: "publicPages.header.nav.solutions.artistsCreators.title", href: "/solutions/artists-creators" },
        { titleKey: "publicPages.header.nav.solutions.btcfi.title", href: "/solutions/btcfi" },
        { titleKey: "publicPages.header.nav.solutions.crossChainBridge.title", href: "/solutions/cross-chain-bridge" },
        { titleKey: "publicPages.header.nav.solutions.defiHub.title", href: "/solutions/defi-hub" },
      ],
    },
    {
      key: "useCases",
      titleKey: "publicPages.header.nav.useCases.title",
      items: [
        { titleKey: "publicPages.header.nav.useCases.tokenization.title", href: "/use-cases/tokenization" },
        { titleKey: "publicPages.header.nav.useCases.depin.title", href: "/use-cases/depin" },
        { titleKey: "publicPages.header.nav.useCases.stablecoins.title", href: "/use-cases/stablecoins" },
        { titleKey: "publicPages.header.nav.useCases.institutional.title", href: "/use-cases/institutional-payments" },
        { titleKey: "publicPages.header.nav.useCases.enterprise.title", href: "/use-cases/enterprise" },
        { titleKey: "publicPages.header.nav.useCases.gaming.title", href: "/use-cases/gaming" },
      ],
    },
    {
      key: "network",
      titleKey: "publicPages.header.nav.network.title",
      items: [
        { titleKey: "publicPages.header.nav.network.validators.title", href: "/network/validators" },
        { titleKey: "publicPages.header.nav.network.rpc.title", href: "/network/rpc" },
        { titleKey: "publicPages.header.nav.network.status.title", href: "/network/status" },
        { titleKey: "publicPages.header.nav.network.ramp.title", href: "/network/ramp" },
      ],
    },
    {
      key: "community",
      titleKey: "publicPages.header.nav.community.title",
      highlight: true,
      items: [
        { titleKey: "publicPages.header.nav.community.news.title", href: "/community/news" },
        { titleKey: "publicPages.header.nav.community.events.title", href: "/community/events" },
        { titleKey: "publicPages.header.nav.community.hub.title", href: "/community/hub" },
      ],
    },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLanguageMenuOpen(false);
    document.documentElement.dir = languages.find(l => l.code === langCode)?.dir || 'ltr';
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              TBurn <span className="text-cyan-400 font-light">Chain</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {menuStructure.map((menu) => (
              <div
                key={menu.key}
                className="relative"
                onMouseEnter={() => setActiveMenu(menu.key)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors
                    ${menu.highlight 
                      ? "px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white"
                      : activeMenu === menu.key 
                        ? "text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  data-testid={`menu-${menu.key}`}
                >
                  {t(menu.titleKey)}
                  <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === menu.key ? "rotate-180" : ""}`} />
                </button>

                {activeMenu === menu.key && (
                  <div className="absolute left-0 top-full pt-2 z-50">
                    <div className="w-64 rounded-lg glass-panel p-2 shadow-xl border border-white/10">
                      {menu.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                          data-testid={`link-${item.href.replace(/\//g, '-').slice(1)}`}
                        >
                          <div className="font-medium text-white">{t(item.titleKey)}</div>
                          {item.descriptionKey && (
                            <div className="text-xs text-gray-500 mt-0.5">{t(item.descriptionKey)}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div ref={languageMenuRef} className="relative">
              <button 
                className="flex items-center gap-1.5 p-2 text-gray-400 hover:text-white transition"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                data-testid="button-language"
              >
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-medium uppercase">{currentLanguage.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <div className="w-56 max-h-80 overflow-y-auto rounded-lg glass-panel p-2 shadow-xl border border-white/10">
                    <div className="text-xs text-gray-500 px-3 py-1 mb-1 font-medium">{t('publicPages.header.selectLanguage')}</div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-white/5 transition-colors ${
                          i18n.language === lang.code ? 'bg-white/5' : ''
                        }`}
                        data-testid={`language-${lang.code}`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-white">{lang.nativeName}</div>
                          <div className="text-xs text-gray-500">{lang.name}</div>
                        </div>
                        {i18n.language === lang.code && (
                          <Check className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              className="p-2 text-gray-400 hover:text-white transition"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {/* Mobile: Icon only button */}
            <Link href="/app" className="sm:hidden">
              <button 
                className="glass-panel border border-cyan-400/30 text-cyan-400 p-2 rounded-lg hover:bg-cyan-400/10 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                data-testid="button-login-mobile"
              >
                <LogIn className="w-5 h-5" />
              </button>
            </Link>
            {/* Desktop: Full text button */}
            <Link href="/app" className="hidden sm:block">
              <button 
                className="glass-panel border border-cyan-400/30 text-cyan-400 px-6 py-2 rounded-lg text-sm font-bold hover:bg-cyan-400/10 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] whitespace-nowrap"
                data-testid="button-login"
              >
                {t('publicPages.header.loginInterface')}
              </button>
            </Link>

            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-white/5 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-6 py-4 pb-20">
            {menuStructure.map((menu) => (
              <div key={menu.key} className="mb-4">
                <div className="text-sm font-semibold text-white mb-2">{t(menu.titleKey)}</div>
                <div className="space-y-1 pl-4">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(item.titleKey)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </nav>
  );
}
