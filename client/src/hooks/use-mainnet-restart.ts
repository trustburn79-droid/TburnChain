import { useState, useEffect } from 'react';

export interface MainnetRestartStatus {
  isRestarting: boolean;
  restartInitiatedAt: Date | null;
  expectedRestartTime: number;
  lastHealthCheck: Date | null;
  isHealthy: boolean;
  elapsedTime: number;
}

export function useMainnetRestart() {
  const [status, setStatus] = useState<MainnetRestartStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkRestartStatus = async () => {
      try {
        const response = await fetch('/api/admin/restart-status');
        if (!response.ok) {
          throw new Error('Failed to fetch restart status');
        }
        const data = await response.json();
        
        // Convert date strings to Date objects
        setStatus({
          ...data,
          restartInitiatedAt: data.restartInitiatedAt ? new Date(data.restartInitiatedAt) : null,
          lastHealthCheck: data.lastHealthCheck ? new Date(data.lastHealthCheck) : null
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check restart status');
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