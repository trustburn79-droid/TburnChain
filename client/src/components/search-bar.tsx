import { Search, Loader2, Box, ArrowRightLeft, Wallet, Users, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
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

export function SearchBar({ 
  placeholder, 
  onSearch, 
  className,
  autoFocus = false
}: SearchBarProps) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultPlaceholder = t("search.placeholder", "Search by Address / Tx Hash / Block...");

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const { data: searchResults, isLoading, isFetching } = useQuery<SearchResponse>({
    queryKey: ['/api/search', debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || !searchResults?.results.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults.results[selectedIndex]) {
          handleResultClick(searchResults.results[selectedIndex]);
        } else if (query) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, searchResults, selectedIndex, query]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    
    switch (result.type) {
      case 'block':
        navigate(`/blocks/${result.data.blockNumber || result.id}`);
        break;
      case 'transaction':
        navigate(`/transactions/${result.id}`);
        break;
      case 'address':
        navigate(`/address/${result.id}`);
        break;
      case 'validator':
        navigate(`/validators?search=${result.id}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(result.id)}`);
    }
  };

  // Handle search submit
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsOpen(false);
    onSearch?.(query);
    
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when there are results
  useEffect(() => {
    if (debouncedQuery.length >= 2 && searchResults?.results?.length) {
      setIsOpen(true);
    }
  }, [searchResults, debouncedQuery]);

  const showDropdown = isOpen && debouncedQuery.length >= 2;
  const hasResults = searchResults?.results?.length ?? 0;
  const isSearching = isLoading || isFetching;

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || defaultPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (debouncedQuery.length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className="pl-9 pr-20 h-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
          data-testid="input-search"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {query && !isSearching && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClear}
              data-testid="button-search-clear"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={!query.trim()}
            data-testid="button-search-submit"
          >
            {t("search.search", "Search")}
          </Button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden"
            data-testid="search-dropdown"
          >
            {hasResults ? (
              <div className="max-h-[400px] overflow-y-auto">
                <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/50">
                  {t("search.resultsFound", "{{count}} results found", { count: searchResults?.count || 0 })}
                </div>
                
                <div className="py-1">
                  {searchResults?.results.map((result, index) => {
                    const Icon = typeIcons[result.type] || Box;
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          isSelected 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-muted/50"
                        )}
                        data-testid={`search-result-${result.type}-${index}`}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center border",
                          typeColors[result.type] || "bg-muted"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {result.title}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                              {t(`search.types.${result.type}`, result.type)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {result.subtitle}
                          </p>
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
                
                {(searchResults?.count ?? 0) > (searchResults?.results?.length ?? 0) && (
                  <div className="px-3 py-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleSearch}
                      data-testid="button-view-all-results"
                    >
                      {t("search.viewAllResults", "View all {{count}} results", { 
                        count: searchResults?.count || 0 
                      })}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ) : !isSearching ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("search.noResults", "No results found for")} "{debouncedQuery}"
                </p>
                {searchResults?.suggestions?.length ? (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground mb-2">
                      {t("search.suggestions", "Try:")}
                    </p>
                    {searchResults.suggestions.map((suggestion, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {suggestion.text}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-4 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {t("search.searching", "Searching...")}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut hint */}
      {!query && (
        <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 items-center gap-1 pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border text-muted-foreground">
            /
          </kbd>
        </div>
      )}
    </div>
  );
}

// Compact search bar for header/navbar
export function CompactSearchBar({ className }: { className?: string }) {
  const { t } = useTranslation();
  
  return (
    <SearchBar 
      className={cn("max-w-md", className)}
      placeholder={t("search.placeholderShort", "Search...")}
    />
  );
}
