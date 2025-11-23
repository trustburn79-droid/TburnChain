import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

// Failure record interface
interface FailureRecord {
  timestamp: number;
  endpoint: string;
  errorType: "api-rate-limit" | "api-error" | "network-error";
  statusCode?: number;
  message: string;
}

interface Snapshot<T> {
  data: T | null;
  receivedAt: number;
  source: "live" | "cached" | "failed";
  isStale: boolean;
  errorType?: "api-rate-limit" | "api-error" | "network-error";
  failureCount?: number;
}

interface NetworkStats {
  height: number;
  tps: number;
  peakTps: number;
  totalTransactions: string;
  totalValidators: number;
  consensusRounds: number;
  stakingAPY: number;
  totalStake: string;
}

interface Block {
  height: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  validator: string;
  size: number;
}

interface MainnetHealth {
  isHealthy: boolean;
  lastBlockTime: number;
  lastBlockNumber: number;
  timeSinceLastBlock: number;
  status: "active" | "paused" | "degraded" | "restarting" | "offline";
  tps: number;
  peakTps: number;
  errorType?: "api-rate-limit" | "api-error" | "mainnet-offline" | "network-error";
  retryAfter?: number;
  isStale?: boolean;
}

interface MainnetSnapshots {
  stats: Snapshot<NetworkStats>;
  blocks: Snapshot<Block[]>;
  health: Snapshot<MainnetHealth>;
  isLive: boolean;
  lastLiveUpdate: number;
  consecutiveErrors: number;
  failureHistory: FailureRecord[];
}

const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes
const FAILURE_HISTORY_KEY = "tburn_admin_failure_history";
const MAX_FAILURE_RECORDS = 100;

// Load failure history from localStorage
function loadFailureHistory(): FailureRecord[] {
  try {
    const stored = localStorage.getItem(FAILURE_HISTORY_KEY);
    if (stored) {
      const history = JSON.parse(stored);
      // Keep only recent failures (last 24 hours)
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      return history.filter((f: FailureRecord) => f.timestamp > cutoff).slice(-MAX_FAILURE_RECORDS);
    }
  } catch (e) {
    console.error("Failed to load failure history:", e);
  }
  return [];
}

// Save failure history to localStorage
function saveFailureHistory(history: FailureRecord[]) {
  try {
    const toSave = history.slice(-MAX_FAILURE_RECORDS);
    localStorage.setItem(FAILURE_HISTORY_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Failed to save failure history:", e);
  }
}

export function useMainnetSnapshots(refetchInterval: number = 5000) {
  const [snapshots, setSnapshots] = useState<MainnetSnapshots>({
    stats: { data: null, receivedAt: 0, source: "failed", isStale: true, failureCount: 0 },
    blocks: { data: null, receivedAt: 0, source: "failed", isStale: true, failureCount: 0 },
    health: { data: null, receivedAt: 0, source: "failed", isStale: true, failureCount: 0 },
    isLive: false,
    lastLiveUpdate: 0,
    consecutiveErrors: 0,
    failureHistory: loadFailureHistory()
  });

  const lastGoodStats = useRef<NetworkStats | null>(null);
  const lastGoodBlocks = useRef<Block[] | null>(null);

  // Function to record a failure
  const recordFailure = (endpoint: string, error: any) => {
    const errorMessage = error?.toString() || "Unknown error";
    // Check for status codes in the error message (format: "401: {error...}")
    const statusMatch = errorMessage.match(/^(\d{3}):/);
    const statusCode = statusMatch ? parseInt(statusMatch[1]) : 
                       error?.response?.status || 
                       (errorMessage.includes("429") ? 429 : 
                        errorMessage.includes("401") ? 401 :
                        errorMessage.includes("500") ? 500 :
                        errorMessage.includes("502") ? 502 : undefined);
    
    const errorType = statusCode === 429 ? "api-rate-limit" as const :
                     statusCode === 401 ? "api-error" as const : // 401 is also an API error
                     (statusCode === 500 || statusCode === 502) ? "api-error" as const :
                     "network-error" as const;

    const newFailure: FailureRecord = {
      timestamp: Date.now(),
      endpoint,
      errorType,
      statusCode,
      message: errorMessage
    };

    setSnapshots(prev => {
      const updatedHistory = [...prev.failureHistory, newFailure];
      saveFailureHistory(updatedHistory);
      return {
        ...prev,
        failureHistory: updatedHistory
      };
    });

    return errorType;
  };

  // Query for stats
  const { 
    data: statsData, 
    error: statsError,
    isLoading: statsLoading,
    dataUpdatedAt: statsUpdatedAt
  } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval,
    retry: 1, // Reduced retries - fail fast
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: MAX_CACHE_AGE
  });

  // Query for blocks
  const { 
    data: blocksData, 
    error: blocksError,
    isLoading: blocksLoading,
    dataUpdatedAt: blocksUpdatedAt
  } = useQuery<Block[]>({
    queryKey: ["/api/blocks/recent"],
    refetchInterval,
    retry: 1, // Reduced retries - fail fast
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: MAX_CACHE_AGE
  });

  // Update snapshots based on query results
  useEffect(() => {
    const now = Date.now();
    let newConsecutiveErrors = snapshots.consecutiveErrors;
    let hasLiveData = false;

    // Process stats
    let statsSnapshot: Snapshot<NetworkStats>;
    if (statsData && !statsError) {
      lastGoodStats.current = statsData;
      statsSnapshot = {
        data: statsData,
        receivedAt: statsUpdatedAt || now,
        source: "live" as const,
        isStale: false,
        failureCount: 0
      };
      hasLiveData = true;
      newConsecutiveErrors = 0;
    } else if (statsError) {
      const errorType = recordFailure("/api/network/stats", statsError);
      
      // Use cached data if available and not too old
      if (lastGoodStats.current && (now - (snapshots.stats.receivedAt || 0)) < MAX_CACHE_AGE) {
        statsSnapshot = {
          data: lastGoodStats.current,
          receivedAt: snapshots.stats.receivedAt,
          source: "cached" as const,
          isStale: true,
          errorType,
          failureCount: (snapshots.stats.failureCount || 0) + 1
        };
      } else {
        // Real failure - no data available
        statsSnapshot = {
          data: null,
          receivedAt: now,
          source: "failed" as const,
          isStale: true,
          errorType,
          failureCount: (snapshots.stats.failureCount || 0) + 1
        };
      }
      newConsecutiveErrors++;
    } else if (statsLoading && !snapshots.stats.data) {
      // Initial loading - show loading state
      statsSnapshot = snapshots.stats;
    } else {
      statsSnapshot = snapshots.stats;
    }

    // Process blocks
    let blocksSnapshot: Snapshot<Block[]>;
    if (blocksData && !blocksError) {
      lastGoodBlocks.current = blocksData;
      blocksSnapshot = {
        data: blocksData,
        receivedAt: blocksUpdatedAt || now,
        source: "live" as const,
        isStale: false,
        failureCount: 0
      };
      hasLiveData = true;
      if (hasLiveData) newConsecutiveErrors = 0;
    } else if (blocksError) {
      const errorType = recordFailure("/api/blocks/recent", blocksError);
      
      // Use cached data if available and not too old
      if (lastGoodBlocks.current && (now - (snapshots.blocks.receivedAt || 0)) < MAX_CACHE_AGE) {
        blocksSnapshot = {
          data: lastGoodBlocks.current,
          receivedAt: snapshots.blocks.receivedAt,
          source: "cached" as const,
          isStale: true,
          errorType,
          failureCount: (snapshots.blocks.failureCount || 0) + 1
        };
      } else {
        // Real failure - no data available
        blocksSnapshot = {
          data: null,
          receivedAt: now,
          source: "failed" as const,
          isStale: true,
          errorType,
          failureCount: (snapshots.blocks.failureCount || 0) + 1
        };
      }
      if (!hasLiveData) newConsecutiveErrors++;
    } else if (blocksLoading && !snapshots.blocks.data) {
      // Initial loading - show loading state
      blocksSnapshot = snapshots.blocks;
    } else {
      blocksSnapshot = snapshots.blocks;
    }

    // Generate health snapshot based on available data
    let healthData: MainnetHealth | null = null;
    if (statsSnapshot.data && blocksSnapshot.data && blocksSnapshot.data.length > 0) {
      const lastBlock = blocksSnapshot.data[0];
      const timeSinceLastBlock = (Date.now() - lastBlock.timestamp * 1000) / 1000;
      
      healthData = {
        isHealthy: timeSinceLastBlock < 3600 && statsSnapshot.data.tps > 0,
        lastBlockTime: lastBlock.timestamp,
        lastBlockNumber: lastBlock.height,
        timeSinceLastBlock,
        status: timeSinceLastBlock > 3600 ? "paused" : 
                statsSnapshot.data.tps === 0 ? "offline" :
                statsSnapshot.data.tps < 10000 ? "degraded" : 
                "active",
        tps: statsSnapshot.data.tps,
        peakTps: statsSnapshot.data.peakTps,
        isStale: statsSnapshot.isStale || blocksSnapshot.isStale,
        errorType: statsSnapshot.errorType || blocksSnapshot.errorType
      };
    }

    const healthSnapshot: Snapshot<MainnetHealth> = {
      data: healthData,
      receivedAt: Math.max(statsSnapshot.receivedAt, blocksSnapshot.receivedAt),
      source: hasLiveData ? "live" : 
              (statsSnapshot.source === "cached" || blocksSnapshot.source === "cached") ? "cached" : 
              "failed",
      isStale: statsSnapshot.isStale || blocksSnapshot.isStale,
      failureCount: Math.max(statsSnapshot.failureCount || 0, blocksSnapshot.failureCount || 0)
    };

    // Update state
    setSnapshots(prev => ({
      stats: statsSnapshot,
      blocks: blocksSnapshot,
      health: healthSnapshot,
      isLive: hasLiveData,
      lastLiveUpdate: hasLiveData ? now : prev.lastLiveUpdate,
      consecutiveErrors: newConsecutiveErrors,
      failureHistory: prev.failureHistory
    }));
  }, [statsData, statsError, statsLoading, statsUpdatedAt, blocksData, blocksError, blocksLoading, blocksUpdatedAt]);

  // Clear old failures periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      setSnapshots(prev => {
        const filtered = prev.failureHistory.filter(f => f.timestamp > cutoff);
        if (filtered.length !== prev.failureHistory.length) {
          saveFailureHistory(filtered);
          return { ...prev, failureHistory: filtered };
        }
        return prev;
      });
    }, 60 * 60 * 1000); // Clean up every hour

    return () => clearInterval(interval);
  }, []);

  return {
    ...snapshots,
    isLoading: statsLoading || blocksLoading,
    hasFailures: snapshots.consecutiveErrors > 0,
    recentFailures: snapshots.failureHistory.slice(-10) // Last 10 failures for display
  };
}