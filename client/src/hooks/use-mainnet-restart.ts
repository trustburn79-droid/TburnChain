import { useState, useEffect } from 'react';

export interface MainnetRestartStatus {
  isRestarting: boolean;
  restartInitiatedAt: Date | null;
  expectedRestartTime: number;
  lastHealthCheck: Date | null;
  isHealthy: boolean;
  elapsedTime: number;
}

const RESTART_STATUS_KEY = 'tburn_mainnet_restart_status';
const RESTART_TIMEOUT = 120000; // 2 minutes max restart time

export function useMainnetRestart() {
  const [status, setStatus] = useState<MainnetRestartStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial state from localStorage
  useEffect(() => {
    const savedStatus = localStorage.getItem(RESTART_STATUS_KEY);
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        const restartInitiatedAt = parsed.restartInitiatedAt ? new Date(parsed.restartInitiatedAt) : null;
        
        // Check if the restart is still valid (not expired)
        if (restartInitiatedAt) {
          const elapsedTime = Date.now() - restartInitiatedAt.getTime();
          if (elapsedTime < RESTART_TIMEOUT) {
            setStatus({
              ...parsed,
              restartInitiatedAt,
              lastHealthCheck: parsed.lastHealthCheck ? new Date(parsed.lastHealthCheck) : null,
              elapsedTime
            });
          } else {
            // Restart has expired, clear it
            localStorage.removeItem(RESTART_STATUS_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved restart status:', e);
        localStorage.removeItem(RESTART_STATUS_KEY);
      }
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkRestartStatus = async () => {
      try {
        const response = await fetch('/api/admin/restart-status');
        if (!response.ok) {
          // If API is down but we have a recent restart in localStorage, use that
          const savedStatus = localStorage.getItem(RESTART_STATUS_KEY);
          if (savedStatus) {
            const parsed = JSON.parse(savedStatus);
            const restartInitiatedAt = parsed.restartInitiatedAt ? new Date(parsed.restartInitiatedAt) : null;
            if (restartInitiatedAt) {
              const elapsedTime = Date.now() - restartInitiatedAt.getTime();
              if (elapsedTime < RESTART_TIMEOUT) {
                setStatus({
                  ...parsed,
                  restartInitiatedAt,
                  lastHealthCheck: parsed.lastHealthCheck ? new Date(parsed.lastHealthCheck) : null,
                  elapsedTime
                });
                setError(null);
                return;
              }
            }
          }
          throw new Error('Failed to fetch restart status');
        }
        const data = await response.json();
        
        // Convert date strings to Date objects
        const newStatus = {
          ...data,
          restartInitiatedAt: data.restartInitiatedAt ? new Date(data.restartInitiatedAt) : null,
          lastHealthCheck: data.lastHealthCheck ? new Date(data.lastHealthCheck) : null
        };
        
        setStatus(newStatus);
        setError(null);
        
        // Save to localStorage if restarting
        if (newStatus.isRestarting) {
          localStorage.setItem(RESTART_STATUS_KEY, JSON.stringify(newStatus));
        } else {
          // Clear localStorage if restart is complete
          localStorage.removeItem(RESTART_STATUS_KEY);
        }
      } catch (err) {
        // Don't overwrite status if we have a valid restart in progress
        if (!status?.isRestarting) {
          setError(err instanceof Error ? err.message : 'Failed to check restart status');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkRestartStatus();

    // Set up interval - check more frequently if restarting
    intervalId = setInterval(checkRestartStatus, 3000); // Check every 3 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const getProgress = () => {
    if (!status || !status.isRestarting) return 0;
    const progress = (status.elapsedTime / status.expectedRestartTime) * 100;
    return Math.min(progress, 100);
  };

  const getRemainingTime = () => {
    if (!status || !status.isRestarting) return 0;
    const remaining = Math.max(0, status.expectedRestartTime - status.elapsedTime);
    return Math.ceil(remaining / 1000); // Convert to seconds
  };

  return {
    status,
    isLoading,
    error,
    getProgress,
    getRemainingTime,
    isRestarting: status?.isRestarting || false,
    isHealthy: status?.isHealthy || false
  };
}