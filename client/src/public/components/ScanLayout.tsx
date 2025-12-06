import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Flame,
  Search,
  Blocks,
  ArrowRightLeft,
  Shield,
  BarChart3,
  Coins,
  Globe,
  Wifi,
  WifiOff,
  Activity,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { useScanWebSocket, useLiveIndicator } from "../hooks/useScanWebSocket";
import { useQuery } from "@tanstack/react-query";
import i18n from "@/lib/i18n";

interface ScanLayoutProps {
  children: ReactNode;
}

export default function ScanLayout({ children }: ScanLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected, lastUpdate, networkStats } = useScanWebSocket();
  const { isLive } = useLiveIndicator();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const { data: statsData } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 5000,
  });

  const stats = statsData?.data || networkStats;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/scan/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const navItems = [
    { path: "/scan", label: t("scan.home", "Home"), icon: Flame },
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
                <div className="flex items-center gap-2 cursor-pointer" data-testid="link-scan-home">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
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

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50">
                  <span className="text-gray-400">TBURN</span>
                  <span className="text-white font-medium">$2.45</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                    +5.2%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50">
                  <span className="text-gray-400">Gas</span>
                  <span className="text-white font-medium">{stats?.gasPrice || "0.0001"} TBURN</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <Wifi className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <WifiOff className="w-4 h-4" />
                  </div>
                )}
              </div>

              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-20 h-8 bg-gray-800/50 border-gray-700 text-gray-300">
                  <Globe className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 py-3 border-t border-gray-800/50">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder={t("scan.searchPlaceholder", "Search by Address / Txn Hash / Block / Token")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-20 h-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                  data-testid="input-header-search"
                />
                <Button 
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 h-8"
                  data-testid="button-header-search"
                >
                  {t("scan.search", "Search")}
                </Button>
              </div>
            </form>

            <div className="hidden xl:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">TPS:</span>
                <span className="text-white font-medium">{stats?.tps?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Blocks className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">{t("scan.blockHeight", "Block")}:</span>
                <span className="text-white font-medium">#{stats?.blockHeight?.toLocaleString() || "0"}</span>
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
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>TBURNScan © 2024 TBURN Foundation</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/scan/api">
                <span className="hover:text-white cursor-pointer">API</span>
              </Link>
              <Link href="/scan/docs">
                <span className="hover:text-white cursor-pointer">{t("scan.docs", "Docs")}</span>
              </Link>
              <a href="https://github.com/tburn" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                GitHub
              </a>
              <a href="https://twitter.com/tburnchain" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
