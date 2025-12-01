/**
 * TBURN Enterprise Data Hook
 * Unified data access layer for cross-module consistency
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types for enterprise data structures
export interface NetworkSnapshot {
  timestamp: number;
  blockHeight: number;
  tps: number;
  totalTransactions: number;
  activeValidators: number;
  totalStaked: string;
  totalSupply: string;
  circulatingSupply: string;
  burnedAmount: string;
  marketCap: string;
  dexTvl: string;
  lendingTvl: string;
  stakingTvl: string;
}

export interface ModuleMetrics {
  staking: {
    totalStaked: string;
    totalPools: number;
    activePositions: number;
    apy: number;
  };
  dex: {
    tvl: string;
    volume24h: string;
    totalPools: number;
    activeSwaps: number;
  };
  lending: {
    totalSupplied: string;
    totalBorrowed: string;
    activeMarkets: number;
    utilizationRate: number;
  };
  nft: {
    totalCollections: number;
    totalListings: number;
    volume24h: string;
    floorPriceAvg: string;
  };
  bridge: {
    totalBridged: string;
    pendingTransfers: number;
    supportedChains: number;
  };
  burn: {
    totalBurned: string;
    burnRate24h: string;
    nextBurnAmount: string;
    deflationRate: number;
  };
}

export interface AccountCompositeState {
  address: string;
  balance: string;
  stakedAmount: string;
  stakingPositions: any[];
  dexPositions: any[];
  lendingPositions: any[];
  nftAssets: any[];
  transactionCount: number;
  rewardsEarned: string;
  lastActivity: number;
}

export interface EnterpriseSnapshot {
  network: NetworkSnapshot;
  modules: ModuleMetrics;
  timestamp: number;
}

// Enterprise snapshot hook - unified network data
export function useEnterpriseSnapshot(options?: { refetchInterval?: number }) {
  return useQuery<{ success: boolean; data: EnterpriseSnapshot }>({
    queryKey: ['/api/enterprise/snapshot'],
    refetchInterval: options?.refetchInterval || 10000,
  });
}

// Enterprise metrics hook - all module metrics
export function useEnterpriseMetrics(options?: { refetchInterval?: number }) {
  return useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/enterprise/metrics'],
    refetchInterval: options?.refetchInterval || 15000,
  });
}

// Account composite state hook - cross-module account data
export function useAccountCompositeState(address: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<{ success: boolean; data: AccountCompositeState }>({
    queryKey: ['/api/enterprise/accounts', address],
    enabled: !!address && (options?.enabled !== false),
  });
}

// Validator composite state hook
export function useValidatorCompositeState(validatorAddress: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/enterprise/validators', validatorAddress],
    enabled: !!validatorAddress && (options?.enabled !== false),
  });
}

// Helper to parse and validate mutation response
async function parseMutationResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || result.message || 'Operation failed');
  }
  
  if (!result.success && result.error) {
    throw new Error(result.error);
  }
  
  return result;
}

// Staking orchestration hooks
export function useStakeOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { userAddress: string; validatorAddress: string; amount: string; poolId?: string }) => {
      const response = await apiRequest('POST', '/api/enterprise/staking/stake', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/staking'] });
        queryClient.invalidateQueries({ queryKey: ['/api/validators'] });
        toast({ title: 'Stake Successful', description: 'Your stake operation completed successfully.' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Stake Failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUnstakeOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { userAddress: string; validatorAddress: string; amount: string; poolId?: string }) => {
      const response = await apiRequest('POST', '/api/enterprise/staking/unstake', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/staking'] });
        toast({ title: 'Unstake Successful', description: 'Your unstake operation completed successfully.' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Unstake Failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useClaimRewardsOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { userAddress: string; validatorAddress?: string; poolId?: string }) => {
      const response = await apiRequest('POST', '/api/enterprise/staking/claim-rewards', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/staking'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
        toast({ title: 'Rewards Claimed', description: 'Your rewards have been claimed successfully.' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Claim Failed', description: error.message, variant: 'destructive' });
    },
  });
}

// DEX orchestration hooks
export function useSwapOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userAddress: string;
      poolId: string;
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      minAmountOut?: string;
      slippageTolerance?: number;
    }) => {
      const response = await apiRequest('POST', '/api/enterprise/dex/swap', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dex'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
        toast({ title: 'Swap Successful', description: 'Your token swap completed successfully.' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Swap Failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddLiquidityOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userAddress: string;
      poolId: string;
      token0Amount: string;
      token1Amount: string;
      minLpTokens?: string;
    }) => {
      const response = await apiRequest('POST', '/api/enterprise/dex/add-liquidity', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dex'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
        toast({ title: 'Liquidity Added', description: 'Liquidity added to pool successfully.' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Add Liquidity Failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveLiquidityOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userAddress: string;
      poolId: string;
      lpTokenAmount: string;
      minToken0?: string;
      minToken1?: string;
    }) => {
      const response = await apiRequest('POST', '/api/enterprise/dex/remove-liquidity', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dex'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
        toast({ title: 'Liquidity Removed', description: 'Liquidity removed from pool successfully.' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Remove Liquidity Failed', description: error.message, variant: 'destructive' });
    },
  });
}

// Bridge orchestration hooks
export function useBridgeTransfer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userAddress: string;
      amount: string;
      sourceChain: string;
      targetChain: string;
      tokenAddress: string;
      recipientAddress?: string;
    }) => {
      const response = await apiRequest('POST', '/api/enterprise/bridge/transfer', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bridge'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
        toast({ title: 'Bridge Transfer Initiated', description: 'Your cross-chain transfer is being processed.' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Bridge Transfer Failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useBridgeChains() {
  return useQuery<{ success: boolean; data: string[] }>({
    queryKey: ['/api/enterprise/bridge/chains'],
  });
}

// Auto-burn hooks
export function useBurnMetrics(options?: { refetchInterval?: number }) {
  return useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/enterprise/burn/metrics'],
    refetchInterval: options?.refetchInterval || 30000,
  });
}

export function useBurnHistory(limit?: number) {
  return useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/enterprise/burn/history', limit],
  });
}

export function useProjectedBurn(hours?: number) {
  return useQuery<{ success: boolean; data: { periodHours: number; projectedBurn: string } }>({
    queryKey: ['/api/enterprise/burn/projected', hours],
  });
}

// NFT orchestration hooks
export function useListNft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sellerAddress: string;
      collectionId: string;
      tokenId: string;
      price: string;
      currency?: string;
      expiresAt?: number;
    }) => {
      const response = await apiRequest('POST', '/api/enterprise/nft/list', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/nft'] });
      }
    },
  });
}

export function useBuyNft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      buyerAddress: string;
      listingId: string;
      price: string;
    }) => {
      const response = await apiRequest('POST', '/api/enterprise/nft/buy', params);
      return parseMutationResponse(response);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/snapshot'] });
        queryClient.invalidateQueries({ queryKey: ['/api/enterprise/metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/nft'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      }
    },
  });
}

// Event history hooks
export function useEventHistory(channel: string, limit?: number) {
  return useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/enterprise/events/history', channel, limit],
  });
}

export function useRecentEvents(limit?: number) {
  return useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/enterprise/events/recent', limit],
    refetchInterval: 5000,
  });
}

export function useEventStats() {
  return useQuery<{ success: boolean; data: { channels: any; connectedClients: number } }>({
    queryKey: ['/api/enterprise/events/stats'],
    refetchInterval: 10000,
  });
}

// Enterprise health check
export function useEnterpriseHealth() {
  return useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/enterprise/health'],
    refetchInterval: 30000,
  });
}
