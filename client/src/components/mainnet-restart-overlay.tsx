import { useMainnetRestart } from '@/hooks/use-mainnet-restart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Loader2, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function MainnetRestartOverlay() {
  const { status, isRestarting, isHealthy, getProgress, getRemainingTime, error } = useMainnetRestart();
  const queryClient = useQueryClient();
  const hasRefreshed = useRef(false);

  // Auto-refresh data when restart completes
  useEffect(() => {
    if (!isRestarting && isHealthy && !hasRefreshed.current) {
      hasRefreshed.current = true;
      console.log('[MainnetRestart] Health restored, refreshing all data...');
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      // Reload page after a short delay for complete refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    // Reset flag when restarting again
    if (isRestarting) {
      hasRefreshed.current = false;
    }
  }, [isRestarting, isHealthy, queryClient]);

  // Only show overlay if restarting
  if (!isRestarting) {
    return null;
  }

  const progress = getProgress();
  const remainingSeconds = getRemainingTime();

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4" data-testid="overlay-mainnet-restart">
      <Card className="max-w-2xl w-full shadow-2xl border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
              Mainnet Server Restarting
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              In Progress
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Restart Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {remainingSeconds > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Estimated time remaining: <span className="font-medium">{remainingSeconds} seconds</span>
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              What's Happening?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>The TBURN mainnet server is being restarted to restore optimal performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>All blockchain operations are temporarily paused during this process</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>The system will automatically resume once the restart is complete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Your data and session are safe and will be preserved</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                {progress < 100 ? (
                  <>
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-yellow-600 dark:text-yellow-500 font-medium">
                      Restarting Services...
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-500 font-medium">
                      Verifying Health...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {status?.restartInitiatedAt && (
            <div className="text-xs text-center text-muted-foreground">
              Restart initiated at {new Date(status.restartInitiatedAt).toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}