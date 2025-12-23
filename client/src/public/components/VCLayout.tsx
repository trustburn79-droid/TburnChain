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
  Briefcase,
  BarChart3,
  Globe,
  Menu,
  Wallet,
  TrendingUp,
  Shield,
  Home,
} from "lucide-react";
import { TBurnLogo } from "@/components/tburn-logo";
import { useState, ReactNode } from "react";
import i18n from "@/lib/i18n";

interface VCLayoutProps {
  children: ReactNode;
}

export default function VCLayout({ children }: VCLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const navItems = [
    { path: "/vc", label: "Overview", icon: Briefcase },
    { path: "/app/staking", label: "Staking", icon: TrendingUp },
    { path: "/app/governance", label: "Governance", icon: Shield },
    { path: "/scan", label: "Explorer", icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === "/vc") return location === "/vc";
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
      <header className="sticky top-0 z-50 bg-[#030407]/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/vc">
                <div className="flex items-center gap-1.5 cursor-pointer" data-testid="link-vc-home">
                  <TBurnLogo showText={true} textColor="#000000" className="w-10 h-10" />
                  <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent hidden sm:inline">
                    TBURN VC
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
                      data-testid={`nav-vc-${item.path.split('/').pop()}`}
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
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white" data-testid="link-vc-to-home">
                    <Home className="w-4 h-4" />
                    Home
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">Demo Mode</span>
                </div>
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
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem className="gap-2 text-gray-400">
                      <span>TBURN: $2.45</span>
                      <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs ml-auto">
                        +5.2%
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

      <footer className="border-t border-gray-800/50 bg-[#030407]/95 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-1.5">
                <TBurnLogo showText={false} className="w-6 h-6" />
                <span>TBURN VC © 2024 TBURN Foundation</span>
              </div>
              <Link href="/" className="text-[#00f0ff] hover:text-white transition font-bold" data-testid="link-vc-tburn-chain">
                TBurn Chain
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/scan">
                <span className="hover:text-white cursor-pointer">Explorer</span>
              </Link>
              <Link href="/developers/docs">
                <span className="hover:text-white cursor-pointer">Docs</span>
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
