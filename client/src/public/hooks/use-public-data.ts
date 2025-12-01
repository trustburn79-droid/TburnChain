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
