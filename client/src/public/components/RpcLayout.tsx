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
  Server,
  Globe,
  Menu,
  Home,
  Activity,
  Code2,
  Settings,
  BookOpen,
  Gauge,
  LayoutDashboard,
} from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import { ProfileBadge } from "@/components/profile-badge";
import { useState, ReactNode } from "react";
import i18n from "@/lib/i18n";

interface RpcLayoutProps {
  children: ReactNode;
}

export default function RpcLayout({ children }: RpcLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const navItems = [
    { path: "/rpc", label: "RPC 엔드포인트", icon: Server },
    { path: "/rpc/status", label: "상태 모니터링", icon: Activity },
    { path: "/rpc/docs", label: "API 문서", icon: BookOpen },
    { path: "/rpc/benchmark", label: "벤치마크", icon: Gauge },
  ];

  const isActive = (path: string) => {
    if (path === "/rpc") return location === "/rpc";
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
      <header className="sticky top-0 z-50 bg-[#030407]/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/rpc">
                <div className="flex items-center gap-1.5 cursor-pointer" data-testid="link-rpc-home">
                  <TBurnLogo showText={true} textColor="#000000" className="w-10 h-10" />
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hidden sm:inline">
                    RPC
                  </span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    className={`text-sm ${
                      isActive(item.path)
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setLocation(item.path)}
                    data-testid={`nav-${item.path.replace(/\//g, '-')}`}
                  >
                    <item.icon className="h-4 w-4 mr-1.5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="button-language-toggle">
                    <Globe className="h-4 w-4 mr-1" />
                    {language === 'ko' ? 'KO' : 'EN'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="text-gray-300 hover:text-white hover:bg-gray-800">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ko')} className="text-gray-300 hover:text-white hover:bg-gray-800">
                    한국어
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="link-main-site">
                  <Home className="h-4 w-4 mr-1" />
                  메인
                </Button>
              </Link>

              <Link href="/testnet-rpc">
                <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" data-testid="link-testnet-rpc">
                  테스트넷 RPC
                </Button>
              </Link>

              <Link href="/app">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="link-app">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  앱
                </Button>
              </Link>

              <ProfileBadge />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-gray-400" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                  {navItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => setLocation(item.path)}
                      className={`${
                        isActive(item.path)
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>

      <footer className="border-t border-gray-800/50 bg-[#030407]/95 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TBurnLogo className="w-6 h-6" />
              <span className="text-sm text-gray-500">
                © 2025 TBurn Chain. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/scan" className="hover:text-cyan-400 transition">
                TBURNScan
              </Link>
              <Link href="/testnet-scan" className="hover:text-yellow-400 transition">
                Testnet Scan
              </Link>
              <Link href="/developers/docs" className="hover:text-cyan-400 transition">
                문서
              </Link>
              <a href="https://github.com/tburnchain" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
