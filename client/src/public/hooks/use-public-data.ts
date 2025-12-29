import { useQuery } from "@tanstack/react-query";

export interface NetworkStats {
  id: string;
  currentBlockHeight: number;
  totalTransactions: number;
  tps: number;
  peakTps: number;
  avgBlockTime: number;
  blockTimeP99: number;
  slaUptime: number;
  latency: number;
  latencyP99: number;
  activeValidators: number;
  totalValidators: number;
  totalAccounts: number;
  tokenPrice: number;
  priceChangePercent: number;
}

export interface EnterpriseSnapshot {
  success: boolean;
  data: {
    network: {
      timestamp: number;
      blockHeight: number;
      tps: number;
      totalTransactions: number;
      pendingTransactions: number;
      activeValidators: number;
      totalStaked: string;
      totalSupply: string;
      circulatingSupply: string;
      burnedAmount: string;
      marketCap: string;
      dexTvl: string;
    };
  };
}

export interface PublicNetworkStats {
  success: boolean;
  data: {
    blockHeight: number;
    tps: number;
    avgBlockTime: number;
    totalTransactions: number;
    pendingTransactions: number;
    activeValidators: number;
    totalValidators: number;
    networkHashrate: string;
    difficulty: string;
    gasPrice: string;
    totalStaked: string;
    totalBurned: string;
    circulatingSupply: string;
    marketCap: string;
    dexTvl: string;
    lendingTvl: string;
    stakingTvl: string;
    finality: string;
    shardCount: number;
    nodeCount: number;
    uptime: string;
    lastUpdated: number;
  };
}

export interface PublicDefiSummary {
  success: boolean;
  data: {
    tvl: string;
    tvlChange24h: string;
    volume24h: string;
    volumeChange24h: string;
    totalPools: number;
    activeLPs: number;
    totalStaked: string;
    stakingApy: string;
    lendingTvl: string;
    borrowVolume: string;
    yieldVaults: number;
    bridgeVolume24h: string;
    crossChainTxns: number;
    dex: {
      pairs: number;
      volume24h: string;
      fees24h: string;
      trades24h: number;
    };
    lending: {
      totalSupplied: string;
      totalBorrowed: string;
      utilizationRate: string;
      avgSupplyApy: string;
      avgBorrowApy: string;
    };
    staking: {
      totalStaked: string;
      validators: number;
      avgApy: string;
      rewards24h: string;
    };
  };
}

export interface PublicValidators {
  success: boolean;
  data: {
    validators: Array<{
      address: string;
      name: string;
      status: string;
      stake: string;
      delegators: number;
      commission: string;
      uptime: string;
      blocksProduced: number;
      rewardsEarned: string;
      apy: string;
      behaviorScore: number;
      adaptiveWeight: number;
      tier: string;
      joinedAt: number;
      location: string;
    }>;
    summary: {
      total: number;
      active: number;
      inactive: number;
      totalStaked: string;
      avgUptime: string;
      avgApy: string;
    };
  };
}

export interface PublicAiSummary {
  success: boolean;
  data: {
    totalDecisions: number;
    decisions24h: number;
    avgConfidence: string;
    avgResponseTime: string;
    accuracy: string;
    models: {
      gpt5: { requests: number; avgTime: string; accuracy: string };
      claude: { requests: number; avgTime: string; accuracy: string };
      llama: { requests: number; avgTime: string; accuracy: string };
    };
    trustScores: {
      processed: number;
      avgScore: number;
      highTrust: number;
      mediumTrust: number;
      lowTrust: number;
    };
    shardOptimization: {
      rebalances24h: number;
      avgLoadBalance: string;
      crossShardTxns: number;
    };
  };
}

export interface ValidatorStats {
  totalValidators: number;
  activeValidators: number;
  totalStaked: string;
  avgUptime: number;
  avgCommissionRate: number;
  avgBehaviorScore: number;
}

export function useNetworkStats() {
  return useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useEnterpriseSnapshot() {
  return useQuery<EnterpriseSnapshot>({
    queryKey: ["/api/enterprise/snapshot"],
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function useValidatorStats() {
  return useQuery<ValidatorStats>({
    queryKey: ["/api/validators/stats"],
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function useBurnMetrics() {
  return useQuery({
    queryKey: ["/api/enterprise/burn/metrics"],
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useGameFiSummary() {
  return useQuery({
    queryKey: ["/api/enterprise/gamefi/summary"],
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useLaunchpadSummary() {
  return useQuery({
    queryKey: ["/api/enterprise/launchpad/summary"],
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function usePublicNetworkStats() {
  return useQuery<PublicNetworkStats>({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 30000, // Match backend cache TTL for consistent display
    staleTime: 30000, // 30s staleTime ensures consistent values across pages
    refetchOnMount: false, // Use cached value when navigating between pages
    refetchOnWindowFocus: false,
  });
}

export function usePublicDefiSummary() {
  return useQuery<PublicDefiSummary>({
    queryKey: ["/api/public/v1/defi/summary"],
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function usePublicValidators() {
  return useQuery<PublicValidators>({
    queryKey: ["/api/public/v1/validators"],
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function usePublicTopValidators(limit: number = 10) {
  return useQuery({
    queryKey: ["/api/public/v1/validators/top", limit],
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function usePublicBridgeSummary() {
  return useQuery({
    queryKey: ["/api/public/v1/bridge/summary"],
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function usePublicBurnStats() {
  return useQuery({
    queryKey: ["/api/public/v1/tokenomics/burn"],
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function usePublicAiSummary() {
  return useQuery<PublicAiSummary>({
    queryKey: ["/api/public/v1/ai/summary"],
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function usePublicNews() {
  return useQuery({
    queryKey: ["/api/public/v1/news"],
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

export function usePublicEvents() {
  return useQuery({
    queryKey: ["/api/public/v1/events"],
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

export function usePublicSearch(query: string) {
  return useQuery({
    queryKey: ["/api/public/v1/search", query],
    enabled: query.length >= 2,
  });
}
