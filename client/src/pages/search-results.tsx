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
  RefreshCw,
  Hash,
  Clock,
  Zap,
  TrendingUp,
  Shield,
  Database,
  Activity,
  Copy,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
  validator: Shield,
  token: Zap,
  contract: Database,
};

const typeColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  block: { 
    bg: "bg-blue-500/10", 
    text: "text-blue-400", 
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20"
  },
  transaction: { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-400", 
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20"
  },
  address: { 
    bg: "bg-violet-500/10", 
    text: "text-violet-400", 
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20"
  },
  validator: { 
    bg: "bg-amber-500/10", 
    text: "text-amber-400", 
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20"
  },
  token: { 
    bg: "bg-pink-500/10", 
    text: "text-pink-400", 
    border: "border-pink-500/30",
    glow: "shadow-pink-500/20"
  },
  contract: { 
    bg: "bg-cyan-500/10", 
    text: "text-cyan-400", 
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20"
  },
};

const typeLabels: Record<string, string> = {
  block: "Blocks",
  transaction: "Transactions",
  address: "Addresses",
  validator: "Validators",
  token: "Tokens",
  contract: "Contracts",
  all: "All Results"
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

function formatHash(hash: string, chars: number = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const Icon = typeIcons[result.type] || Box;
  const colors = typeColors[result.type] || typeColors.block;

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast({
      title: t("common.copied", "Copied!"),
      description: formatHash(text, 12),
    });
  };

  const getResultDetails = () => {
    switch (result.type) {
      case 'block':
        return {
          primary: `Block #${result.data.blockNumber?.toLocaleString() || result.id}`,
          secondary: result.data.timestamp ? new Date(result.data.timestamp).toLocaleString() : null,
          stats: [
            { label: "Transactions", value: result.data.transactionCount || result.data.txCount || "0" },
            { label: "Gas Used", value: result.data.gasUsed ? `${(parseInt(result.data.gasUsed) / 1e9).toFixed(2)} Gwei` : "N/A" },
          ]
        };
      case 'transaction':
        return {
          primary: formatHash(result.id, 16),
          secondary: result.data.timestamp ? new Date(result.data.timestamp).toLocaleString() : null,
          stats: [
            { label: "Value", value: result.data.value ? `${parseFloat(result.data.value).toFixed(4)} TBURN` : "0 TBURN" },
            { label: "Status", value: result.data.status === 'confirmed' ? "Confirmed" : "Pending" },
          ]
        };
      case 'address':
        return {
          primary: formatHash(result.id, 12),
          secondary: "Wallet Address",
          stats: [
            { label: "Balance", value: result.data.balance ? `${parseFloat(result.data.balance).toFixed(4)} TBURN` : "0 TBURN" },
            { label: "Transactions", value: result.data.txCount || "View" },
          ]
        };
      case 'validator':
        return {
          primary: result.data.name || result.title,
          secondary: formatHash(result.data.address || result.id, 10),
          stats: [
            { label: "Status", value: result.data.status === 'active' ? "Active" : "Inactive" },
            { label: "Stake", value: result.data.stake ? `${(parseFloat(result.data.stake) / 1e18).toLocaleString()} TBURN` : "N/A" },
            { label: "Uptime", value: result.data.uptime ? `${(result.data.uptime / 100).toFixed(1)}%` : "N/A" },
          ]
        };
      default:
        return {
          primary: result.title,
          secondary: result.subtitle,
          stats: []
        };
    }
  };

  const details = getResultDetails();

  return (
    <Link href={getNavigationPath(result)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className={cn(
          "group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer",
          "bg-card/50 hover:bg-card border-border/50 hover:border-border",
          "hover:shadow-lg",
          colors.glow
        )}
        data-testid={`search-result-item-${result.type}-${index}`}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
            colors.bg, colors.border,
            "group-hover:scale-105"
          )}>
            <Icon className={cn("h-6 w-6", colors.text)} />
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                  {details.primary}
                </h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 shrink-0",
                    colors.bg, colors.text, colors.border
                  )}
                >
                  {t(`search.types.${result.type}`, result.type)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => copyToClipboard(e, result.id)}
                  data-testid={`button-copy-${result.type}-${index}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
            
            {details.secondary && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {result.type === 'block' || result.type === 'transaction' ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : null}
                {details.secondary}
              </p>
            )}
            
            {details.stats.length > 0 && (
              <div className="flex items-center gap-4 pt-1">
                {details.stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{stat.label}:</span>
                    <span className={cn(
                      "text-xs font-semibold",
                      stat.value === "Active" ? "text-emerald-400" : 
                      stat.value === "Inactive" ? "text-rose-400" :
                      stat.value === "Confirmed" ? "text-emerald-400" :
                      stat.value === "Pending" ? "text-amber-400" :
                      "text-foreground"
                    )}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          "bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        )} />
      </motion.div>
    </Link>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border/50 bg-card/30">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyQueryState() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const exampleSearches = [
    { type: "block", label: "Block #11671999", query: "11671999" },
    { type: "validator", label: "Asia Validator", query: "asia" },
    { type: "address", label: "0x1234...abcd", query: "0x" },
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          <CardContent className="relative pt-12 pb-10 px-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative inline-flex mb-6"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                <Search className="h-10 w-10 text-primary" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t("search.enterpriseSearch", "Enterprise Blockchain Search")}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("search.searchDescription", "Search for blocks, transactions, addresses, or validators")}
            </p>

            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-background rounded-xl border border-border/50 group-focus-within:border-primary/50 transition-colors">
                  <Search className="h-5 w-5 text-muted-foreground ml-4" />
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t("search.placeholder", "Search by Address / Tx Hash / Block...")}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base py-6 px-4"
                    data-testid="input-search-main"
                  />
                  <Button 
                    type="submit"
                    className="m-1.5 px-6"
                    disabled={!searchInput.trim()}
                    data-testid="button-search-submit"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t("search.search", "Search")}
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("search.tryExamples", "Try these examples:")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {exampleSearches.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setLocation(`/search?q=${encodeURIComponent(example.query)}`)}
                    data-testid={`button-example-${example.type}`}
                  >
                    {example.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: Box, label: t("search.types.block", "Blocks"), color: "text-blue-400" },
            { icon: ArrowRightLeft, label: t("search.types.transaction", "Transactions"), color: "text-emerald-400" },
            { icon: Shield, label: t("search.types.validator", "Validators"), color: "text-amber-400" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/30 border border-border/30"
            >
              <item.icon className={cn("h-6 w-6", item.color)} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function SearchResults() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || 'all';

  useEffect(() => {
    setActiveFilter(typeFilter);
    setSearchInput(query);
  }, [typeFilter, query]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  if (!query) {
    return <EmptyQueryState />;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold" data-testid="text-search-title">
                {t("search.resultsFor", "Search Results")}
              </h1>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <span>{t("search.queryLabel", "Showing results for:")}</span>
              <code className="px-2 py-0.5 rounded bg-muted text-sm font-mono text-foreground">
                {query}
              </code>
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0"
            data-testid="button-refresh-search"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center bg-card rounded-xl border border-border/50 focus-within:border-primary/50 transition-colors">
            <Search className="h-5 w-5 text-muted-foreground ml-4" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search.placeholder", "Search by Address / Tx Hash / Block...")}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base py-5 px-4"
              data-testid="input-search-refine"
            />
            <Button 
              type="submit"
              className="m-1.5"
              disabled={!searchInput.trim()}
              data-testid="button-search-refine"
            >
              {t("search.search", "Search")}
            </Button>
          </div>
        </form>
      </motion.div>

      {isLoading ? (
        <SearchSkeleton />
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("search.error", "Search Error")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("search.errorDescription", "Failed to fetch search results. Please try again.")}
              </p>
              <Button onClick={() => refetch()} data-testid="button-retry-search">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("common.retry", "Retry")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : searchResults?.count === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                {t("search.noResults", "No results found")}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t("search.noResultsDescription", "We couldn't find any matches for your search. Try different keywords or check your spelling.")}
              </p>
              
              {searchResults?.suggestions?.length ? (
                <div className="bg-muted/30 rounded-xl p-6 max-w-md mx-auto text-left border border-border/30">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t("search.tryThese", "Try these suggestions:")}
                  </p>
                  <ul className="space-y-2">
                    {searchResults.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        {suggestion.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card className="border-border/50 bg-card/50">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-4">
                <Tabs value={activeFilter} onValueChange={setActiveFilter} className="flex-1">
                  <TabsList className="bg-muted/30 h-auto p-1 flex-wrap">
                    {availableTypes.map((type) => {
                      const count = type === 'all' 
                        ? searchResults?.count || 0 
                        : resultsByType[type]?.length || 0;
                      const Icon = typeIcons[type] || Box;
                      const colors = typeColors[type];
                      
                      return (
                        <TabsTrigger 
                          key={type} 
                          value={type}
                          className={cn(
                            "gap-2 data-[state=active]:bg-background px-3 py-2",
                            type !== 'all' && colors && `data-[state=active]:${colors.text}`
                          )}
                          data-testid={`tab-filter-${type}`}
                        >
                          {type !== 'all' && Icon && <Icon className="h-4 w-4" />}
                          <span className="font-medium">
                            {t(`search.types.${type}`, typeLabels[type] || type)}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0 h-5 min-w-[24px] justify-center"
                          >
                            {count}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-muted-foreground">
              {t("search.showingResults", "Showing {{shown}} of {{total}} results", {
                shown: filteredResults.length,
                total: searchResults?.count || 0
              })}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{t("search.sortedByRelevance", "Sorted by relevance")}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {filteredResults.map((result, index) => (
                <ResultCard key={`${result.type}-${result.id}-${index}`} result={result} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-4 text-center"
            >
              <p className="text-sm text-muted-foreground">
                {t("search.endOfResults", "End of search results")}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
