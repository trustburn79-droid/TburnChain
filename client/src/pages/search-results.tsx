import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Box, 
  ArrowRightLeft, 
  Wallet, 
  Users, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Filter,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/search-bar";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: 'block' | 'transaction' | 'address' | 'token' | 'validator' | 'contract';
  id: string;
  title: string;
  subtitle: string;
  data: any;
  relevance: number;
}

interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
  suggestions: { text: string }[];
}

const typeIcons: Record<string, typeof Box> = {
  block: Box,
  transaction: ArrowRightLeft,
  address: Wallet,
  validator: Users,
  token: Box,
  contract: Box,
};

const typeColors: Record<string, string> = {
  block: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  transaction: "bg-green-500/20 text-green-400 border-green-500/30",
  address: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  validator: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  token: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  contract: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const typeLabels: Record<string, string> = {
  block: "Blocks",
  transaction: "Transactions",
  address: "Addresses",
  validator: "Validators",
  token: "Tokens",
  contract: "Contracts",
  all: "All"
};

function getNavigationPath(result: SearchResult): string {
  switch (result.type) {
    case 'block':
      return `/blocks/${result.data.blockNumber || result.id}`;
    case 'transaction':
      return `/transactions/${result.id}`;
    case 'address':
      return `/address/${result.id}`;
    case 'validator':
      return `/validators?search=${result.id}`;
    default:
      return `/search?q=${encodeURIComponent(result.id)}`;
  }
}

export default function SearchResults() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  // Parse query from URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || 'all';

  useEffect(() => {
    setActiveFilter(typeFilter);
  }, [typeFilter]);

  // Search query
  const { 
    data: searchResults, 
    isLoading, 
    error,
    refetch,
    isFetching
  } = useQuery<SearchResponse>({
    queryKey: ['/api/search', query, activeFilter === 'all' ? undefined : activeFilter],
    enabled: query.length >= 1,
    staleTime: 30000,
  });

  // Group results by type
  const resultsByType = (searchResults?.results || []).reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const filteredResults = activeFilter === 'all' 
    ? searchResults?.results || []
    : resultsByType[activeFilter] || [];

  const availableTypes = ['all', ...Object.keys(resultsByType)];

  if (!query) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {t("search.enterQuery", "Enter a search query")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("search.searchDescription", "Search for blocks, transactions, addresses, or validators")}
            </p>
            <div className="max-w-md mx-auto">
              <SearchBar autoFocus />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-search-title">
              {t("search.resultsFor", "Search Results")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("search.queryLabel", "Showing results for:")}{" "}
              <span className="font-mono text-foreground">"{query}"</span>
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-search"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBar autoFocus />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("search.error", "Search Error")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("search.errorDescription", "Failed to fetch search results. Please try again.")}
            </p>
            <Button onClick={() => refetch()} data-testid="button-retry-search">
              {t("common.retry", "Retry")}
            </Button>
          </CardContent>
        </Card>
      ) : searchResults?.count === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t("search.noResults", "No results found")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t("search.noResultsDescription", "We couldn't find any matches for your search. Try different keywords or check your spelling.")}
            </p>
            
            {searchResults?.suggestions?.length ? (
              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto text-left">
                <p className="text-sm font-medium mb-2">
                  {t("search.tryThese", "Try these suggestions:")}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {searchResults.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      {suggestion.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Filter Tabs */}
          <Card>
            <CardContent className="py-3">
              <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                <TabsList className="bg-muted/50">
                  {availableTypes.map((type) => {
                    const count = type === 'all' 
                      ? searchResults?.count || 0 
                      : resultsByType[type]?.length || 0;
                    
                    return (
                      <TabsTrigger 
                        key={type} 
                        value={type}
                        className="gap-2"
                        data-testid={`tab-filter-${type}`}
                      >
                        {t(`search.types.${type}`, typeLabels[type] || type)}
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t("search.showingResults", "Showing {{shown}} of {{total}} results", {
                shown: filteredResults.length,
                total: searchResults?.count || 0
              })}
            </span>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{t("search.sortedByRelevance", "Sorted by relevance")}</span>
            </div>
          </div>

          {/* Results List */}
          <Card>
            <CardContent className="py-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="divide-y divide-border"
                >
                  {filteredResults.map((result, index) => {
                    const Icon = typeIcons[result.type] || Box;
                    
                    return (
                      <Link key={`${result.type}-${result.id}-${index}`} href={getNavigationPath(result)}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 py-4 px-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                          data-testid={`search-result-item-${result.type}-${index}`}
                        >
                          <div className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border",
                            typeColors[result.type] || "bg-muted"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold truncate">
                                {result.title}
                              </span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {t(`search.types.${result.type}`, result.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </motion.div>
                      </Link>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
