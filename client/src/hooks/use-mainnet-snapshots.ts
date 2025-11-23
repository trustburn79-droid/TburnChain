import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEMO_STATS, DEMO_BLOCKS, DEMO_HEALTH } from "@/data/admin-demo";

interface Snapshot<T> {
  data: T | null;
  receivedAt: number;
  source: "live" | "cached" | "demo";
  isStale: boolean;
  errorType?: "api-rate-limit" | "api-error" | "network-error";
}

interface MainnetSnapshots {
  stats: Snapshot<typeof DEMO_STATS>;
  blocks: Snapshot<typeof DEMO_BLOCKS>;
  health: Snapshot<typeof DEMO_HEALTH>;
  isLive: boolean;
  lastLiveUpdate: number;
  consecutiveErrors: number;
}

const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes
const MAX_CONSECUTIVE_ERRORS = 3;

export function useMainnetSnapshots(refetchInterval: number = 5000) {
  const [snapshots, setSnapshots] = useState<MainnetSnapshots>({
    stats: { data: null, receivedAt: 0, source: "demo", isStale: true },
    blocks: { data: null, receivedAt: 0, source: "demo", isStale: true },
    health: { data: null, receivedAt: 0, source: "demo", isStale: true },
    isLive: false,
    lastLiveUpdate: 0,
    consecutiveErrors: 0
  });

  const lastGoodStats = useRef<typeof DEMO_STATS | null>(null);
  const lastGoodBlocks = useRef<typeof DEMO_BLOCKS | null>(null);

  // Query for stats with caching
  const { 
    data: statsData, 
    error: statsError,
    isLoading: statsLoading,
    dataUpdatedAt: statsUpdatedAt
  } = useQuery<typeof DEMO_STATS>({
    queryKey: ["/api/network/stats"],
    refetchInterval,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: MAX_CACHE_AGE // Keep in cache for 5 minutes
  });

  // Query for blocks with caching
  const { 
    data: blocksData, 
    error: blocksError,
    isLoading: blocksLoading,
    dataUpdatedAt: blocksUpdatedAt
  } = useQuery<typeof DEMO_BLOCKS>({
    queryKey: ["/api/blocks/recent"],
    refetchInterval,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
    gcTime: MAX_CACHE_AGE
  });

  // Update snapshots based on query results
  useEffect(() => {
    const now = Date.now();
    let newConsecutiveErrors = snapshots.consecutiveErrors;
    let hasLiveData = false;

    // Process stats
    let statsSnapshot: Snapshot<typeof DEMO_STATS>;
    if (statsData && !statsError) {
      lastGoodStats.current = statsData;
      statsSnapshot = {
        data: statsData,
        receivedAt: statsUpdatedAt || now,
        source: "live" as const,
        isStale: false
      };
      hasLiveData = true;
      newConsecutiveErrors = 0;
    } else if (statsError) {
      const errorMessage = statsError.toString();
      const errorType = errorMessage.includes("429") ? "api-rate-limit" as const :
                       errorMessage.includes("500") || errorMessage.includes("502") ? "api-error" as const :
                       "network-error" as const;
      
      // Use cached data if available and not too old
      if (lastGoodStats.current && (now - (snapshots.stats.receivedAt || 0)) < MAX_CACHE_AGE) {
        statsSnapshot = {
          data: lastGoodStats.current,
          receivedAt: snapshots.stats.receivedAt,
          source: "cached" as const,
          isStale: true,
          errorType
        };
      } else {
        // Fall back to demo data
        statsSnapshot = {
          data: DEMO_STATS,
          receivedAt: now,
          source: "demo" as const,
          isStale: true,
          errorType
        };
      }
      newConsecutiveErrors++;
    } else if (statsLoading && !snapshots.stats.data) {
      // Initial loading, use demo data
      statsSnapshot = {
        data: DEMO_STATS,
        receivedAt: now,
        source: "demo" as const,
        isStale: true
      };
    } else {
      statsSnapshot = snapshots.stats;
    }

    // Process blocks
    let blocksSnapshot: Snapshot<typeof DEMO_BLOCKS>;
    if (blocksData && !blocksError) {
      lastGoodBlocks.current = blocksData;
      blocksSnapshot = {
        data: blocksData,
        receivedAt: blocksUpdatedAt || now,
        source: "live" as const,
        isStale: false
      };
      hasLiveData = true;
      if (hasLiveData) newConsecutiveErrors = 0;
    } else if (blocksError) {
      const errorMessage = blocksError.toString();
      const errorType = errorMessage.includes("429") ? "api-rate-limit" as const :
                       errorMessage.includes("500") || errorMessage.includes("502") ? "api-error" as const :
                       "network-error" as const;
      
      // Use cached data if available and not too old
      if (lastGoodBlocks.current && (now - (snapshots.blocks.receivedAt || 0)) < MAX_CACHE_AGE) {
        blocksSnapshot = {
          data: lastGoodBlocks.current,
          receivedAt: snapshots.blocks.receivedAt,
          source: "cached" as const,
          isStale: true,
          errorType
        };
      } else {
        // Fall back to demo data
        blocksSnapshot = {
          data: DEMO_BLOCKS,
          receivedAt: now,
          source: "demo" as const,
          isStale: true,
          errorType
        };
      }
      if (!hasLiveData) newConsecutiveErrors++;
    } else if (blocksLoading && !snapshots.blocks.data) {
      // Initial loading, use demo data
      blocksSnapshot = {
        data: DEMO_BLOCKS,
        receivedAt: now,
        source: "demo" as const,
        isStale: true
      };
    } else {
      blocksSnapshot = snapshots.blocks;
    }

    // Generate health snapshot based on available data
    const healthSnapshot: Snapshot<typeof DEMO_HEALTH> = {
      data: DEMO_HEALTH,
      receivedAt: Math.max(statsSnapshot.receivedAt, blocksSnapshot.receivedAt),
      source: hasLiveData ? "live" : statsSnapshot.source === "cached" || blocksSnapshot.source === "cached" ? "cached" : "demo",
      isStale: statsSnapshot.isStale || blocksSnapshot.isStale
    };

    // Update state
    setSnapshots({
      stats: statsSnapshot,
      blocks: blocksSnapshot,
      health: healthSnapshot,
      isLive: hasLiveData,
      lastLiveUpdate: hasLiveData ? now : snapshots.lastLiveUpdate,
      consecutiveErrors: newConsecutiveErrors
    });
  }, [statsData, statsError, statsLoading, statsUpdatedAt, blocksData, blocksError, blocksLoading, blocksUpdatedAt]);

  return {
    ...snapshots,
    isLoading: statsLoading || blocksLoading,
    shouldUseDemoMode: snapshots.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS || 
                       import.meta.env.VITE_USE_DEMO_DATA === "true"
  };
}