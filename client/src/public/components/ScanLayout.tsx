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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Menu,
  User,
  Loader2,
  Hash,
  AlertCircle
} from "lucide-react";
import { useState, useEffect, ReactNode, useCallback } from "react";
import { useScanWebSocket, useLiveIndicator } from "../hooks/useScanWebSocket";
import { useQuery } from "@tanstack/react-query";
import i18n from "@/lib/i18n";

interface ScanLayoutProps {
  children: ReactNode;
}

type SearchType = 'address' | 'transaction' | 'block' | 'unknown';

function detectSearchType(query: string): { type: SearchType; value: string } {
  const trimmed = query.trim();
  
  if (/^\d+$/.test(trimmed)) {
    return { type: 'block', value: trimmed };
  }
  
  if (/^#\d+$/.test(trimmed)) {
    return { type: 'block', value: trimmed.slice(1) };
  }
  
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return { type: 'transaction', value: trimmed };
  }
  
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return { type: 'address', value: trimmed };
  }
  
  if (/^0x[a-fA-F0-9]+$/.test(trimmed)) {
    if (trimmed.length === 66) return { type: 'transaction', value: trimmed };
    if (trimmed.length === 42) return { type: 'address', value: trimmed };
  }
  
  return { type: 'unknown', value: trimmed };
}

export default function ScanLayout({ children }: ScanLayoutProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const { isConnected, lastUpdate, networkStats } = useScanWebSocket();
  const { isLive } = useLiveIndicator();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: statsData } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 5000,
  });

  const stats = statsData?.data || networkStats;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    
    if (!searchQuery.trim()) {
      setSearchError(t("scan.enterSearchTerm", "Please enter a search term"));
      return;
    }
    
    setIsSearching(true);
    
    const { type, value } = detectSearchType(searchQuery);
    
    setTimeout(() => {
      setIsSearching(false);
      
      switch (type) {
        case 'block':
          setSearchQuery("");
          setLocation(`/scan/block/${value}`);
          break;
        case 'transaction':
          setSearchQuery("");
          setLocation(`/scan/tx/${value}`);
          break;
        case 'address':
          setSearchQuery("");
          setLocation(`/scan/address/${value}`);
          break;
        default:
          if (value.startsWith('0x') && value.length === 66) {
            setSearchQuery("");
            setLocation(`/scan/tx/${value}`);
          } else if (value.startsWith('0x') && value.length === 42) {
            setSearchQuery("");
            setLocation(`/scan/address/${value}`);
          } else if (/^\d+$/.test(value)) {
            setSearchQuery("");
            setLocation(`/scan/block/${value}`);
          } else {
            setSearchError(t("scan.invalidSearch", "Invalid search. Enter a valid block number, transaction hash, or address."));
          }
      }
    }, 200);
  }, [searchQuery, setLocation, t]);

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
              {/* Price and Gas - Hidden on smaller screens */}
              <div className="hidden xl:flex items-center gap-3 text-sm">
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

              {/* Language Selector */}
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

          {/* Search Bar Row */}
          <div className="flex items-center gap-4 py-3 border-t border-gray-800/50">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={t("scan.searchPlaceholder", "Search by Address / Txn Hash / Block / Token")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchError("");
                    }}
                    className="pl-10 h-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-orange-500/50 focus:ring-orange-500/20"
                    data-testid="input-header-search"
                  />
                  {searchError && (
                    <div className="absolute left-0 top-full mt-1 text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {searchError}
                    </div>
                  )}
                </div>
                <Button 
                  type="submit"
                  size="sm"
                  disabled={isSearching}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 h-10 px-4 shrink-0"
                  data-testid="button-header-search"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t("scan.search", "Search")
                  )}
                </Button>
              </div>
            </form>

            {/* Live Stats - Hidden on smaller screens */}
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
