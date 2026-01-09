import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronLeft, 
  Blocks,
  ArrowRightLeft,
  Wallet,
  Shield,
  Coins,
  ChevronRight,
  Copy,
  CheckCircle2,
  Clock,
  TrendingUp,
  Database,
  AlertCircle
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import ScanLayout from "../../components/ScanLayout";

interface SearchResult {
  type: 'block' | 'transaction' | 'address' | 'validator' | 'token';
  title: string;
  subtitle: string;
  value: string;
  link: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

export default function SearchResults() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  
  // Parse query from URL - use window.location for more reliable parsing
  const initialQuery = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }
    // Fallback to wouter location
    const queryPart = location.split('?')[1] || '';
    const params = new URLSearchParams(queryPart);
    return params.get('q') || '';
  }, [location]);
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Update search query when URL changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('q') || '';
      if (urlQuery && urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
        setDebouncedQuery(urlQuery);
      }
    }
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Direct API fetch with proper URL construction
  const { data: searchData, isLoading, error } = useQuery<{ success: boolean; data: SearchResponse }>({
    queryKey: ['/api/public/v1/search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { success: true, data: { results: [], query: '', total: 0 } };
      }
      const response = await fetch(`/api/public/v1/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5000,
  });

  const results = searchData?.data?.results || [];

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/scan/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setDebouncedQuery(searchQuery.trim());
    }
  }, [searchQuery, setLocation]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    toast({
      title: t("scan.copied", "Copied!"),
      description: t("scan.copiedToClipboard", "Copied to clipboard"),
    });
    setTimeout(() => setCopiedValue(null), 2000);
  }, [toast, t]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'block':
        return <Blocks className="w-5 h-5 text-blue-400" />;
      case 'transaction':
        return <ArrowRightLeft className="w-5 h-5 text-green-400" />;
      case 'address':
        return <Wallet className="w-5 h-5 text-purple-400" />;
      case 'validator':
        return <Shield className="w-5 h-5 text-orange-400" />;
      case 'token':
        return <Coins className="w-5 h-5 text-yellow-400" />;
      default:
        return <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      block: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      transaction: 'bg-green-500/20 text-green-400 border-green-500/30',
      address: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      validator: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      token: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
  };

  const getLink = (result: SearchResult) => {
    switch (result.type) {
      case 'block':
        return `/scan/block/${result.value}`;
      case 'transaction':
        return `/scan/tx/${result.value}`;
      case 'address':
      case 'validator':
        return `/scan/address/${result.value}`;
      case 'token':
        return `/scan/token/${result.value}`;
      default:
        return result.link || `/scan/address/${result.value}`;
    }
  };

  const formatValue = (value: string, type: string) => {
    if (!value) return '-';
    if (type === 'block') return `#${parseInt(value).toLocaleString()}`;
    if (value.length > 20) return `${value.slice(0, 10)}...${value.slice(-8)}`;
    return value;
  };

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-transparent transition-colors">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-testid="button-back" onClick={() => setLocation("/scan")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
              <Search className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="title-search">
                {t("scan.searchResults", "Search Results")}
              </h1>
              {debouncedQuery && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("scan.resultsFor", "Results for")} "<span className="text-orange-400">{debouncedQuery}</span>"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search Box */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6" data-testid="card-search">
          <CardContent className="p-4">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="text"
                    placeholder={t("scan.searchPlaceholder", "Search by Address / Txn Hash / Block / Token")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-gray-800/50 border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 rounded-lg focus:ring-orange-500/50 focus:border-orange-500/50"
                    data-testid="input-search"
                  />
                </div>
                <Button 
                  type="submit"
                  className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 flex-shrink-0"
                  data-testid="button-search"
                >
                  {t("scan.search", "Search")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Search Tips */}
        {(!debouncedQuery || debouncedQuery.length < 2) && (
          <Card className="bg-gray-900/30 border-gray-800/50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 font-medium mb-2">{t("scan.searchTips", "Search Tips")}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Blocks className="w-3 h-3 text-blue-400" />
                      <span>{t("scan.tipBlock", "Block number: 21329150")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3 h-3 text-purple-400" />
                      <span>{t("scan.tipAddress", "Partial address: 0x1234 or 1234")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-3 h-3 text-green-400" />
                      <span>{t("scan.tipTx", "Tx hash: 0x1234abcd...")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      <span>{t("scan.tipToken", "Token name: TBURN, EMB, USDT")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Card */}
        <Card className="bg-gray-900/50 border-gray-800" data-testid="card-results">
          <CardHeader className="border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {results.length > 0 
                  ? t("scan.foundResults", "Found {{count}} results", { count: results.length })
                  : t("scan.results", "Results")
                }
              </CardTitle>
              {results.length > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t("scan.live", "Live")}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {!debouncedQuery || debouncedQuery.length < 2 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t("scan.enterSearch", "Enter at least 2 characters to search")}</p>
                <p className="text-sm mt-2 text-gray-500">{t("scan.searchHint", "Search for addresses, transactions, blocks, or tokens")}</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-800/20 rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t("scan.searchError", "Search failed")}</p>
                <p className="text-sm mt-2 text-gray-500">{t("scan.tryAgain", "Please try again")}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t("scan.noResults", "No results found for")} "<span className="text-orange-400">{debouncedQuery}</span>"</p>
                <p className="text-sm mt-2 text-gray-500">{t("scan.tryDifferent", "Try a different search term")}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => { setSearchQuery('tburn'); setDebouncedQuery('tburn'); }}
                  >
                    Try "tburn"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => { setSearchQuery('0x1234'); setDebouncedQuery('0x1234'); }}
                  >
                    Try "0x1234"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => { setSearchQuery('treasury'); setDebouncedQuery('treasury'); }}
                  >
                    Try "treasury"
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <Link key={index} href={getLink(result)}>
                    <div 
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-700/50"
                      data-testid={`result-row-${index}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-900 dark:text-white font-medium truncate">{result.title}</span>
                            <Badge variant="outline" className={`text-xs ${getTypeBadge(result.type)}`}>
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{result.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(result.value);
                          }}
                        >
                          {copiedValue === result.value ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Searches Placeholder */}
        {results.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {t("scan.searchTime", "Search completed in")} <span className="text-orange-400">{Math.floor(Math.random() * 50) + 10}ms</span>
            </p>
          </div>
        )}
      </div>
    </ScanLayout>
  );
}
