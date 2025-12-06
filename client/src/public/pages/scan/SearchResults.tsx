import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  ChevronLeft, 
  Blocks,
  ArrowRightLeft,
  Wallet,
  Shield,
  Coins,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";

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
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = urlParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchData, isLoading } = useQuery<{ success: boolean; data: SearchResponse }>({
    queryKey: ["/api/public/v1/search", { q: debouncedQuery }],
    enabled: debouncedQuery.length >= 2,
  });

  const results = searchData?.data?.results || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/scan/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'block':
        return <Blocks className="w-5 h-5 text-blue-400" />;
      case 'transaction':
        return <ArrowRightLeft className="w-5 h-5 text-green-400" />;
      case 'address':
        return <Wallet className="w-5 h-5 text-purple-400" />;
      case 'validator':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'token':
        return <Coins className="w-5 h-5 text-yellow-400" />;
      default:
        return <Search className="w-5 h-5 text-gray-400" />;
    }
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
        return result.link;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030407] to-[#0a0d14]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/scan">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="title-search">
                {t("scan.searchResults", "Search Results")}
              </h1>
              {debouncedQuery && (
                <p className="text-sm text-gray-400">
                  {t("scan.resultsFor", "Results for")} "{debouncedQuery}"
                </p>
              )}
            </div>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 mb-6" data-testid="card-search">
          <CardContent className="p-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder={t("scan.searchPlaceholder", "Search by Address / Txn Hash / Block / Token")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                  data-testid="input-search"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  data-testid="button-search"
                >
                  {t("scan.search", "Search")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800" data-testid="card-results">
          <CardHeader>
            <CardTitle className="text-white">
              {results.length > 0 
                ? t("scan.foundResults", "Found {{count}} results", { count: results.length })
                : t("scan.results", "Results")
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!debouncedQuery || debouncedQuery.length < 2 ? (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t("scan.enterSearch", "Enter at least 2 characters to search")}</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t("scan.noResults", "No results found for")} "{debouncedQuery}"</p>
                <p className="text-sm mt-2">{t("scan.tryDifferent", "Try a different search term")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Link key={index} href={getLink(result)}>
                    <div 
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                      data-testid={`result-row-${index}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center">
                          {getIcon(result.type)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{result.title}</div>
                          <div className="text-sm text-gray-400">{result.subtitle}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
