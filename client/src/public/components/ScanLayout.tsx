import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Wifi,
  WifiOff,
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
import { useScanWebSocket, useLiveIndicator } from "../hooks/useScanWebSocket";
import i18n from "@/lib/i18n";

interface ScanLayoutProps {
  children: ReactNode;
}

export default function ScanLayout({ children }: ScanLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { isConnected } = useScanWebSocket();
  const { isLive } = useLiveIndicator();
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
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 text-green-400" title={t("scan.connected", "Connected")}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <Wifi className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-500" title={t("scan.disconnected", "Disconnected")}>
                    <WifiOff className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Language Selector - 12 Languages */}
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-24 h-8 bg-gray-800/50 border-gray-700 text-gray-300">
                  <Globe className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 max-h-80">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="bn">বাংলা</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="ur">اردو</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>

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
