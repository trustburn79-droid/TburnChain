import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Blocks,
  ArrowRightLeft,
  Shield,
  BarChart3,
  Coins,
  Globe,
  Menu,
  Home,
  User,
  ImageIcon,
  ScanLine,
  LayoutDashboard,
} from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import { ProfileBadge } from "@/components/profile-badge";
import { useState, ReactNode } from "react";
import i18n from "@/lib/i18n";

interface ScanLayoutProps {
  children: ReactNode;
}

export default function ScanLayout({ children }: ScanLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const navItems = [
    { path: "/scan", label: t("scan.home", "Home"), icon: Home },
    { path: "/scan/blocks", label: t("scan.blocks", "Blocks"), icon: Blocks },
    { path: "/scan/txs", label: t("scan.transactions", "Transactions"), icon: ArrowRightLeft },
    { path: "/scan/validators", label: t("scan.validators", "Validators"), icon: Shield },
    { path: "/scan/tokens", label: t("scan.tokens", "Tokens"), icon: Coins },
    { path: "/scan/stats", label: t("scan.stats", "Stats"), icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === "/scan") return location === "/scan";
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
      <header className="sticky top-0 z-50 bg-[#030407]/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/scan">
                <div className="flex items-center gap-1.5 cursor-pointer" data-testid="link-scan-home">
                  <TBurnLogo showText={true} textColor="#000000" className="w-10 h-10" />
                  <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent hidden sm:inline">
                    TBURNScan
                  </span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${
                        isActive(item.path)
                          ? "bg-gray-800/50 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                      data-testid={`nav-${item.path.split('/').pop()}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector - Globe icon only with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white"
                    data-testid="button-language-selector"
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 max-h-80 overflow-y-auto">
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={language === 'en' ? 'bg-gray-800 text-white' : 'text-gray-300'}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ko')} className={language === 'ko' ? 'bg-gray-800 text-white' : 'text-gray-300'}>한국어</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('zh')} className={language === 'zh' ? 'bg-gray-800 text-white' : 'text-gray-300'}>中文</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ja')} className={language === 'ja' ? 'bg-gray-800 text-white' : 'text-gray-300'}>日本語</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('hi')} className={language === 'hi' ? 'bg-gray-800 text-white' : 'text-gray-300'}>हिन्दी</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('es')} className={language === 'es' ? 'bg-gray-800 text-white' : 'text-gray-300'}>Español</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('fr')} className={language === 'fr' ? 'bg-gray-800 text-white' : 'text-gray-300'}>Français</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ar')} className={language === 'ar' ? 'bg-gray-800 text-white' : 'text-gray-300'}>العربية</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('bn')} className={language === 'bn' ? 'bg-gray-800 text-white' : 'text-gray-300'}>বাংলা</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ru')} className={language === 'ru' ? 'bg-gray-800 text-white' : 'text-gray-300'}>Русский</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('pt')} className={language === 'pt' ? 'bg-gray-800 text-white' : 'text-gray-300'}>Português</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ur')} className={language === 'ur' ? 'bg-gray-800 text-white' : 'text-gray-300'}>اردو</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Navigation Icons - visible on all screen sizes */}
              <div className="flex items-center gap-0 sm:gap-2">
                <div className="hidden sm:block w-px h-6 bg-gray-700 mx-1" />
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-9 sm:w-9 text-gray-400 hover:text-white"
                    data-testid="link-nav-home"
                  >
                    <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
                <Link href="/scan">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-9 sm:w-9 text-gray-400 hover:text-white"
                    data-testid="link-nav-scan"
                  >
                    <ScanLine className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
                <Link href="/user">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-9 sm:w-9 text-gray-400 hover:text-white"
                    data-testid="link-nav-user"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
                <Link href="/token-generator">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-9 sm:w-9 text-gray-400 hover:text-white"
                    data-testid="link-nav-token-generator"
                  >
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
                <Link href="/nft-marketplace">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-9 sm:w-9 text-gray-400 hover:text-white"
                    data-testid="link-nav-nft-marketplace"
                  >
                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
                <Link href="/app">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-9 sm:w-9 text-gray-400 hover:text-white"
                    data-testid="link-nav-app"
                  >
                    <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-700">
                    {navItems.map((item) => (
                      <DropdownMenuItem
                        key={item.path}
                        className={`gap-2 ${isActive(item.path) ? "text-white bg-gray-800" : "text-gray-400"}`}
                        onClick={() => setLocation(item.path)}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Profile Badge */}
              <ProfileBadge />
            </div>
          </div>

        </div>
      </header>

      <main className="min-h-[calc(100vh-180px)]">
        {children}
      </main>

      <footer className="border-t border-gray-800/50 bg-[#030407]/95 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-1.5">
                <TBurnLogo showText={true} textColor="#000000" className="w-6 h-6" />
                <span>TBURNScan © 2024 TBURN Foundation</span>
              </div>
              <Link href="/" className="text-[#00f0ff] hover:text-white transition font-bold" data-testid="link-scan-tburn-chain">
                TBurn Chain
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/developers/api">
                <span className="hover:text-white cursor-pointer">API</span>
              </Link>
              <Link href="/developers/docs">
                <span className="hover:text-white cursor-pointer">{t("scan.docs", "Docs")}</span>
              </Link>
              <a href="https://github.com/tburn" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                GitHub
              </a>
              <a href="https://x.com/tburnio" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                X
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
