import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "@/lib/websocket-context";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { formatAddress, formatHash, formatSize } from "@/lib/formatters";
import { formatGasEmber } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Box,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Hash,
  User,
  Activity,
  Database,
  Layers,
  Shield,
  AlertCircle,
  Download,
  ExternalLink,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface Block {
  id: string;
  blockNumber: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactionCount: number;
  validatorAddress: string;
  validatorName?: string;
  gasUsed: number;
  gasLimit: number;
  size: number;
  shardId: number;
  crossShardRefs: string[];
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  nonce: string;
  hashAlgorithm: string;
}

interface BlocksResponse {
  blocks: Block[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    validator?: string;
    shard?: number;
    hashAlgorithm?: string;
    startTime?: number;
    endTime?: number;
  };
}

interface Validator {
  id: string;
  name: string;
  address: string;
}

// Hash algorithm options
const HASH_ALGORITHMS = ["BLAKE3", "SHA3-512", "SHA-256"];

// Shard options
const SHARD_OPTIONS = [
  { value: "0", label: "Shard 0 - Primary" },
  { value: "1", label: "Shard 1 - Secondary" },
  { value: "2", label: "Shard 2 - Tertiary" },
  { value: "3", label: "Shard 3 - Quaternary" },
];

export default function Blocks() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { subscribeToEvent, isConnected } = useWebSocket();
  
  // State
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Filters - Initialize with "all" to match SelectItem values
  const [selectedValidator, setSelectedValidator] = useState<string>("all");
  const [selectedShard, setSelectedShard] = useState<string>("all");
  const [selectedHashAlgorithm, setSelectedHashAlgorithm] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("number");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Auto-refresh
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    
    if (selectedValidator && selectedValidator !== "all") params.set("validator", selectedValidator);
    if (selectedShard && selectedShard !== "all") params.set("shard", selectedShard);
    if (selectedHashAlgorithm && selectedHashAlgorithm !== "all") params.set("hashAlgorithm", selectedHashAlgorithm);
    
    return params.toString();
  }, [page, sortBy, sortOrder, selectedValidator, selectedShard, selectedHashAlgorithm]);
  
  // Fetch blocks
  const { data: blocksData, isLoading, error, refetch } = useQuery<BlocksResponse>({
    queryKey: ["/api/blocks", queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/blocks?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch blocks");
      return response.json();
    },
    refetchInterval: isAutoRefresh ? 5000 : false,
    staleTime: 3000,
  });
  
  // Fetch validators for filter dropdown
  const { data: validators = [] } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    queryFn: async () => {
      const response = await fetch("/api/validators");
      if (!response.ok) throw new Error("Failed to fetch validators");
      return response.json();
    },
  });
  
  // Search blocks
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      setIsSearching(true);
      const response = await fetch(`/api/blocks/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search blocks");
      return response.json();
    },
    onSuccess: (data) => {
      setIsSearching(false);
      if (data.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
          variant: "default",
        });
      } else if (data.length === 1) {
        // Navigate directly to block if only one result
        setLocation(`/blocks/${data[0].blockNumber}`);
      } else {
        // Show search results
        toast({
          title: `Found ${data.length} blocks`,
          description: "Results filtered based on your search",
        });
      }
    },
    onError: () => {
      setIsSearching(false);
      toast({
        title: "Search failed",
        description: "Failed to search blocks",
        variant: "destructive",
      });
    },
  });
  
  // Handle search
  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      searchMutation.mutate(searchInput.trim());
    }
  }, [searchInput, searchMutation]);
  
  // Subscribe to WebSocket events for real-time updates
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = subscribeToEvent("block_created", (data: any) => {
      setLastUpdate(new Date());
      if (isAutoRefresh) {
        queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      }
    });
    
    return unsubscribe;
  }, [isConnected, subscribeToEvent, isAutoRefresh]);
  
  // Clear filters
  const clearFilters = () => {
    setSelectedValidator("all");
    setSelectedShard("all");
    setSelectedHashAlgorithm("all");
    setSortBy("number");
    setSortOrder("desc");
    setPage(1);
  };
  
  // Check if filters are active
  const hasActiveFilters = (selectedValidator && selectedValidator !== "all") || 
                          (selectedShard && selectedShard !== "all") || 
                          (selectedHashAlgorithm && selectedHashAlgorithm !== "all");
  
  // Format functions are now imported from @/lib/formatters
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Box className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Blocks Found</h3>
      <p className="text-muted-foreground mb-4">
        {hasActiveFilters 
          ? "No blocks match your current filters. Try adjusting your criteria."
          : "No blocks have been created yet. Waiting for block production..."}
      </p>
      {hasActiveFilters && (
        <Button onClick={clearFilters} variant="outline">
          Clear Filters
        </Button>
      )}
    </div>
  );
  
  // Toggle sort
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };
  
  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortOrder === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Box className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-blocks-title">{t('blocks.title')}</h1>
              <p className="text-muted-foreground">
                {blocksData?.pagination.totalItems || 0} {t('blocks.totalBlocks')} • 
                {t('common.page')} {blocksData?.pagination.page || 1} / {blocksData?.pagination.totalPages || 1}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Auto-refresh toggle */}
            <Button
              variant={isAutoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? "animate-spin" : ""}`} />
              {isAutoRefresh ? t('blocks.live') : t('blocks.paused')}
            </Button>
            
            {/* Manual refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{t('blocks.exportFormat')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>CSV</DropdownMenuItem>
                <DropdownMenuItem>JSON</DropdownMenuItem>
                <DropdownMenuItem>Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('blocks.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-4"
              data-testid="input-block-search"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
          
          {/* Filter button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('common.filter')}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {[selectedValidator, selectedShard, selectedHashAlgorithm].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('blocks.filterBlocks')}</SheetTitle>
                <SheetDescription>
                  {t('blocks.filterDescription')}
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Validator filter */}
                <div className="space-y-2">
                  <Label>Validator</Label>
                  <Select value={selectedValidator} onValueChange={setSelectedValidator}>
                    <SelectTrigger>
                      <SelectValue placeholder="All validators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All validators</SelectItem>
                      {validators.slice(0, 21).map(v => (
                        <SelectItem key={v.id} value={v.address}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Shard filter */}
                <div className="space-y-2">
                  <Label>Shard</Label>
                  <Select value={selectedShard} onValueChange={setSelectedShard}>
                    <SelectTrigger>
                      <SelectValue placeholder="All shards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All shards</SelectItem>
                      {SHARD_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Hash Algorithm filter */}
                <div className="space-y-2">
                  <Label>Hash Algorithm</Label>
                  <Select value={selectedHashAlgorithm} onValueChange={setSelectedHashAlgorithm}>
                    <SelectTrigger>
                      <SelectValue placeholder="All algorithms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All algorithms</SelectItem>
                      {HASH_ALGORITHMS.map(algo => (
                        <SelectItem key={algo} value={algo}>
                          {algo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedValidator && (
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {validators.find(v => v.address === selectedValidator)?.name}
                <button onClick={() => setSelectedValidator("")} className="ml-1">
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedShard && (
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3 w-3" />
                Shard {selectedShard}
                <button onClick={() => setSelectedShard("")} className="ml-1">
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedHashAlgorithm && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                {selectedHashAlgorithm}
                <button onClick={() => setSelectedHashAlgorithm("")} className="ml-1">
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Last Update: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">{t('common.connected')}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{t('common.disconnected')}</span>
                </>
              )}
            </div>
          </div>
          
          {blocksData && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{t('blocks.avgBlockTime')}: 3s</span>
              <span>•</span>
              <span>{t('blocks.networkTps')}: 521,482</span>
              <span>•</span>
              <span>{t('blocks.gasPrice')}: 10 EMB</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Blocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('blocks.recentBlocks')}</CardTitle>
          <CardDescription>
            {t('blocks.recentBlocksDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load blocks: {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            renderSkeleton()
          ) : !blocksData?.blocks.length ? (
            renderEmptyState()
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("number")}
                    >
                      <div className="flex items-center">
                        {t('common.block')}
                        {renderSortIcon("number")}
                      </div>
                    </TableHead>
                    <TableHead>{t('common.hash')}</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("timestamp")}
                    >
                      <div className="flex items-center">
                        {t('common.time')}
                        {renderSortIcon("timestamp")}
                      </div>
                    </TableHead>
                    <TableHead>{t('blocks.validator')}</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("transactionCount")}
                    >
                      <div className="flex items-center">
                        {t('blocks.txns')}
                        {renderSortIcon("transactionCount")}
                      </div>
                    </TableHead>
                    <TableHead>{t('blocks.shard')}</TableHead>
                    <TableHead>{t('blocks.gasUsed')}</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("size")}
                    >
                      <div className="flex items-center">
                        {t('blocks.size')}
                        {renderSortIcon("size")}
                      </div>
                    </TableHead>
                    <TableHead>{t('blocks.hashAlgo')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocksData.blocks.map((block) => (
                    <TableRow 
                      key={block.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setLocation(`/blocks/${block.blockNumber}`)}
                    >
                      <TableCell>
                        <Link href={`/blocks/${block.blockNumber}`} className="font-mono text-primary hover:underline" data-testid={`link-block-${block.blockNumber}`}>
                          #{block.blockNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-xs">
                            {formatHash(block.hash)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(block.timestamp * 1000), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {block.validatorName || formatAddress(block.validatorAddress)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3 w-3" />
                          {block.transactionCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          Shard {block.shardId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {formatGasEmber(block.gasUsed)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatSize(block.size)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {block.hashAlgorithm}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/blocks/${block.blockNumber}`);
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {t('blocks.viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(block.hash);
                                toast({
                                  title: t('common.copiedToClipboard'),
                                  description: t('blocks.hashCopied'),
                                });
                              }}
                            >
                              <Hash className="h-4 w-4 mr-2" />
                              {t('blocks.copyHash')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/validator/${block.validatorAddress}`);
                              }}
                            >
                              <User className="h-4 w-4 mr-2" />
                              {t('blocks.viewValidator')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {blocksData && blocksData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                {t('common.showing')} {((page - 1) * 20) + 1} - {Math.min(page * 20, blocksData.pagination.totalItems)} / {blocksData.pagination.totalItems} {t('blocks.blocks')}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={!blocksData.pagination.hasPrev}
                  data-testid="button-first-page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!blocksData.pagination.hasPrev}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('common.previous')}
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, blocksData.pagination.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8"
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!blocksData.pagination.hasNext}
                  data-testid="button-next-page"
                >
                  {t('common.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(blocksData.pagination.totalPages)}
                  disabled={!blocksData.pagination.hasNext}
                  data-testid="button-last-page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}