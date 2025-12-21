import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Flame,
  Blocks,
  ArrowRightLeft,
  Shield,
  BarChart3,
  Coins,
  Globe,
  Wifi,
  WifiOff,
  Menu,
  FlaskConical,
} from "lucide-react";
import { useState, ReactNode } from "react";
import i18n from "@/lib/i18n";

interface TestnetScanLayoutProps {
  children: ReactNode;
}

export default function TestnetScanLayout({ children }: TestnetScanLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const navItems = [
    { path: "/testnet-scan", label: t("scan.home", "Home"), icon: Flame },
    { path: "/testnet-scan/blocks", label: t("scan.blocks", "Blocks"), icon: Blocks },
    { path: "/testnet-scan/txs", label: t("scan.transactions", "Transactions"), icon: ArrowRightLeft },
    { path: "/testnet-scan/validators", label: t("scan.validators", "Validators"), icon: Shield },
    { path: "/testnet-scan/tokens", label: t("scan.tokens", "Tokens"), icon: Coins },
    { path: "/testnet-scan/stats", label: t("scan.stats", "Stats"), icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === "/testnet-scan") return location === "/testnet-scan";
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0805] to-[#0d0a04]">
      <header className="sticky top-0 z-50 bg-[#0a0805]/95 backdrop-blur-md border-b border-yellow-900/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/testnet-scan">
                <div className="flex items-center gap-2 cursor-pointer" data-testid="link-testnet-scan-home">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent hidden sm:inline">
                    TBURNScan
                  </span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                    TESTNET
                  </Badge>
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
                          ? "bg-yellow-900/30 text-yellow-400"
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                      data-testid={`testnet-nav-${item.path.split('/').pop()}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden xl:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                  <span className="text-gray-400">TBURN</span>
                  <span className="text-yellow-400 font-medium">Test Token</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                  <span className="text-gray-400">Gas</span>
                  <span className="text-yellow-400 font-medium">Free</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-yellow-400" title="Testnet Active">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                  <Wifi className="w-4 h-4" />
                </div>
              </div>

              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-24 h-8 bg-yellow-900/20 border-yellow-800/30 text-gray-300">
                  <Globe className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-yellow-800/30 max-h-80">
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

              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-yellow-400">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-yellow-800/30">
                    {navItems.map((item) => (
                      <DropdownMenuItem
                        key={item.path}
                        className={`gap-2 ${isActive(item.path) ? "text-yellow-400 bg-yellow-900/30" : "text-gray-400"}`}
                        onClick={() => setLocation(item.path)}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-yellow-800/30" />
                    <DropdownMenuItem className="gap-2 text-gray-400">
                      <span>TBURN: Test Token</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs ml-auto">
                        FREE
                      </Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

        </div>
      </header>

      <main className="min-h-[calc(100vh-180px)]">
        {children}
      </main>

      <footer className="border-t border-yellow-900/30 bg-[#0a0805]/95 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-yellow-500" />
                <span>TBURNScan Testnet © 2024 TBURN Foundation</span>
              </div>
              <Link href="/" className="text-yellow-400 hover:text-white transition font-bold" data-testid="link-testnet-scan-tburn-chain">
                TBurn Chain
              </Link>
              <Link href="/scan" className="text-[#00f0ff] hover:text-white transition" data-testid="link-testnet-to-mainnet">
                {t("scan.switchToMainnet", "Switch to Mainnet")}
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/testnet-scan/faucet">
                <span className="hover:text-yellow-400 cursor-pointer">{t("scan.faucet", "Faucet")}</span>
              </Link>
              <Link href="/developers/docs">
                <span className="hover:text-yellow-400 cursor-pointer">{t("scan.docs", "Docs")}</span>
              </Link>
              <a href="https://github.com/tburn" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
                GitHub
              </a>
              <a href="https://twitter.com/tburnchain" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
