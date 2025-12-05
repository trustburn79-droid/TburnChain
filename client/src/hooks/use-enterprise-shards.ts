import { useQuery } from "@tanstack/react-query";
import { useWebSocketChannel } from "@/hooks/use-websocket-channel";
import { shardsSnapshotSchema } from "@shared/schema";
import type { Shard } from "@shared/schema";
import { z } from "zod";

export interface ShardConfig {
  currentShardCount: number;
  minShards: number;
  maxShards: number;
  validatorsPerShard: number;
  tpsPerShard: number;
  crossShardLatencyMs: number;
  scalingMode: 'automatic' | 'manual';
  lastConfigUpdate: string;
  totalValidators: number;
  estimatedTps: number;
  hardwareRequirements: {
    minCores: number;
    minRamGB: number;
    recommendedCores: number;
    recommendedRamGB: number;
    storageGB: number;
    networkBandwidthGbps: number;
    profile: string;
  };
  scalingAnalysis: {
    currentCapacity: { shards: number; tps: number; validators: number };
    maxCapacity: { shards: number; tps: number; validators: number };
    utilizationPercent: number;
    recommendations: string[];
    scalingReadiness: 'ready' | 'warning' | 'critical';
  };
}

const shardConfigUpdateSchema = z.any();

export interface EnterpriseShardData {
  shards: Shard[];
  config: ShardConfig | null;
  isLoading: boolean;
  isConfigLoading: boolean;
  error: Error | null;
  configError: Error | null;
  totalShards: number;
  totalValidators: number;
  totalTps: number;
  avgLoad: number;
  activeShards: number;
  requiredQuorum: number;
  refetch: () => void;
  refetchConfig: () => void;
}

export function useEnterpriseShards(): EnterpriseShardData {
  const { data: shards, isLoading, error, refetch } = useQuery<Shard[]>({
    queryKey: ["/api/shards"],
    refetchInterval: 10000,
  });

  const { data: configData, isLoading: isConfigLoading, error: configError, refetch: refetchConfig } = useQuery<ShardConfig>({
    queryKey: ["/api/admin/shards/config"],
    refetchInterval: 30000,
  });
  
  const config = configData ?? null;

  useWebSocketChannel({
    channel: "shards_snapshot",
    schema: shardsSnapshotSchema,
    queryKey: ["/api/shards"],
    updateMode: "snapshot",
  });

  useWebSocketChannel({
    channel: "shard_config_update",
    schema: shardConfigUpdateSchema,
    queryKey: ["/api/admin/shards/config"],
    updateMode: "snapshot",
  });

  const totalShards = config?.currentShardCount || shards?.length || 8;
  const totalValidators = config?.totalValidators || (shards?.reduce((sum, s) => sum + s.validatorCount, 0) || 200);
  const totalTps = config?.estimatedTps || (shards?.reduce((sum, s) => sum + s.tps, 0) || 0);
  const avgLoad = shards?.length ? (shards.reduce((sum, s) => sum + s.load, 0) / shards.length) : 0;
  const activeShards = shards?.filter(s => s.status === "active").length || totalShards;
  
  const requiredQuorum = Math.ceil((totalValidators * 2) / 3) + 1;

  return {
    shards: shards || [],
    config,
    isLoading,
    isConfigLoading,
    error: error as Error | null,
    configError: configError as Error | null,
    totalShards,
    totalValidators,
    totalTps,
    avgLoad,
    activeShards,
    requiredQuorum,
    refetch,
    refetchConfig,
  };
}

export function useShardMetrics() {
  const { 
    shards, 
    config, 
    totalShards, 
    totalValidators, 
    totalTps,
    avgLoad,
    activeShards,
    requiredQuorum,
    isLoading,
    isConfigLoading
  } = useEnterpriseShards();

  const healthyShards = shards.filter(s => s.status === "active").length;
  const warningShards = shards.filter(s => s.status === "syncing").length;
  const criticalShards = shards.filter(s => s.status === "error").length;

  const avgMlScore = shards.length 
    ? shards.reduce((sum, s) => sum + s.mlOptimizationScore, 0) / shards.length 
    : 0;

  const crossShardTxCount = shards.reduce((sum, s) => sum + s.crossShardTxCount, 0);

  const validatorsPerShard = config?.validatorsPerShard || 25;
  const tpsPerShard = config?.tpsPerShard || 500;
  const scalingMode = config?.scalingMode || 'manual';

  return {
    shards,
    config,
    totalShards,
    totalValidators,
    totalTps,
    avgLoad,
    activeShards,
    requiredQuorum,
    healthyShards,
    warningShards,
    criticalShards,
    avgMlScore,
    crossShardTxCount,
    validatorsPerShard,
    tpsPerShard,
    scalingMode,
    isLoading: isLoading || isConfigLoading,
  };
}
