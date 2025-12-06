import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket-context";
import { Activity, AlertCircle, Bot, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface AIProviderStats {
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  totalTokensUsed: number;
  totalCost: number;
  isRateLimited: boolean;
  dailyLimit?: number;
  dailyUsage?: number;
  lastRequestTime?: Date;
  lastRateLimitTime?: Date;
  rateLimitResetTime?: Date;
  connectionStatus?: "connected" | "disconnected" | "rate_limited";
  lastHealthCheck?: Date;
  averageResponseTime?: number;
}

interface AIProviderHealth {
  provider: string;
  isConnected: boolean;
  connectionStatus: string;
  lastHealthCheck?: Date;
  averageResponseTime?: number;
  isRateLimited: boolean;
}

export function AIUsageMonitor() {
  const [aiStats, setAIStats] = useState<AIProviderStats[]>([]);
  const [healthStatus, setHealthStatus] = useState<Map<string, AIProviderHealth>>(new Map());
  const [isSwitchingProvider, setIsSwitchingProvider] = useState(false);
  const { subscribeToEvent } = useWebSocket();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch health status
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/admin/ai-health');
      const data = await response.json();
      if (data.success) {
        const healthMap = new Map<string, AIProviderHealth>();
        data.providers.forEach((p: AIProviderHealth) => {
          healthMap.set(p.provider, p);
        });
        setHealthStatus(healthMap);
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
    }
  };

  useEffect(() => {
    // Subscribe to AI usage updates
    const unsubscribe = subscribeToEvent('ai_usage_stats', (data: AIProviderStats[]) => {
      setAIStats(data);
    });

    // Initial fetch
    fetch('/api/admin/ai-usage/stats')
      .then(res => res.json())
      .then(data => setAIStats(data))
      .catch(console.error);

    // Initial health check
    fetchHealthStatus();

    // Set up periodic health checks (every 5 minutes)
    const healthInterval = setInterval(fetchHealthStatus, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(healthInterval);
    };
  }, [subscribeToEvent]);

  const handleSwitchProvider = async (provider: string) => {
    setIsSwitchingProvider(true);
    try {
      await apiRequest('POST', '/api/admin/ai-usage/switch-provider', { provider });
      
      toast({
        title: t('admin.ai.providerSwitched'),
        description: t('admin.ai.providerSwitchedDesc', { provider }),
      });
      
      // Refresh stats
      const response = await fetch('/api/admin/ai-usage/stats');
      const data = await response.json();
      setAIStats(data);
    } catch (error) {
      console.error('Error switching provider:', error);
      toast({
        title: t('common.error'),
        description: t('admin.ai.switchProviderFailed'),
        variant: "destructive",
      });
    } finally {
      setIsSwitchingProvider(false);
    }
  };

  const handleResetLimits = async () => {
    try {
      await apiRequest('POST', '/api/admin/ai-usage/reset-limits', {});
      
      toast({
        title: t('admin.ai.limitsReset'),
        description: t('admin.ai.limitsResetDesc'),
      });
      
      // Refresh stats
      const response = await fetch('/api/admin/ai-usage/stats');
      const data = await response.json();
      setAIStats(data);
    } catch (error) {
      console.error('Error resetting limits:', error);
      toast({
        title: t('common.error'),
        description: t('admin.ai.resetLimitsFailed'),
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return "🤖";
      case 'openai':
        return "🧠";
      case 'gemini':
        return "💎";
      default:
        return "🤖";
    }
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="w-full" data-testid="ai-usage-monitor">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t('admin.ai.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              {t('admin.ai.liveUpdates')}
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleResetLimits}
              data-testid="button-reset-limits"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('admin.ai.resetLimits')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiStats.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t('admin.ai.loading')}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {aiStats.map((provider) => (
              <Card 
                key={provider.provider} 
                className={`${provider.isRateLimited ? 'border-destructive' : ''}`}
                data-testid={`card-provider-${provider.provider.toLowerCase()}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getProviderIcon(provider.provider)}</span>
                      <h3 className="font-semibold capitalize">{provider.provider}</h3>
                      {/* Connection Status Indicator */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`h-3 w-3 rounded-full ${
                                healthStatus.get(provider.provider)?.isConnected 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              } animate-pulse cursor-help`}
                              data-testid={`status-indicator-${provider.provider.toLowerCase()}`}
                              aria-label={
                                healthStatus.get(provider.provider)?.isConnected 
                                  ? t('admin.ai.apiConnected')
                                  : t('admin.ai.apiDisconnected')
                              }
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {healthStatus.get(provider.provider)?.isConnected 
                                ? `${t('admin.ai.connected')}${healthStatus.get(provider.provider)?.averageResponseTime 
                                    ? ` (${Math.round(healthStatus.get(provider.provider)!.averageResponseTime!)}ms)` 
                                    : ''}`
                                : t('admin.ai.disconnected')}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {provider.isRateLimited && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {t('admin.ai.rateLimited')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Request Stats */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('admin.ai.requests')}</span>
                      <span className="font-mono">
                        {formatNumber(provider.successfulRequests)}/{formatNumber(provider.totalRequests)}
                      </span>
                    </div>
                    {provider.failedRequests > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.ai.failed')}</span>
                        <span className="font-mono text-destructive">
                          {formatNumber(provider.failedRequests)}
                        </span>
                      </div>
                    )}
                    {provider.rateLimitHits > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.ai.rateLimitHits')}</span>
                        <span className="font-mono text-yellow-500">
                          {formatNumber(provider.rateLimitHits)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Daily Usage Progress */}
                  {provider.dailyLimit && provider.dailyUsage !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.ai.dailyUsage')}</span>
                        <span className="font-mono">
                          {formatNumber(provider.dailyUsage)}/{formatNumber(provider.dailyLimit)}
                        </span>
                      </div>
                      <Progress 
                        value={(provider.dailyUsage / provider.dailyLimit) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Token & Cost */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('admin.ai.tokensUsed')}</span>
                      <span className="font-mono">{formatNumber(provider.totalTokensUsed)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('admin.ai.totalCost')}</span>
                      <span className="font-mono font-semibold">{formatCost(provider.totalCost)}</span>
                    </div>
                  </div>

                  {/* Switch Provider Button */}
                  {!provider.isRateLimited && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleSwitchProvider(provider.provider)}
                      disabled={isSwitchingProvider}
                      data-testid={`button-switch-${provider.provider.toLowerCase()}`}
                    >
                      {t('admin.ai.useThisProvider')}
                    </Button>
                  )}

                  {/* Rate Limit Reset Time */}
                  {provider.isRateLimited && provider.rateLimitResetTime && (
                    <div className="text-xs text-center text-muted-foreground">
                      {t('admin.ai.resetsAt', { time: new Date(provider.rateLimitResetTime).toLocaleTimeString('en-US', { timeZone: 'America/New_York' }) })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {aiStats.length > 0 && (
          <Card className="mt-4 bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {formatNumber(aiStats.reduce((acc, p) => acc + p.totalRequests, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('admin.ai.totalRequests')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatNumber(aiStats.reduce((acc, p) => acc + p.totalTokensUsed, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('admin.ai.totalTokens')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatCost(aiStats.reduce((acc, p) => acc + p.totalCost, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('admin.ai.totalCostLabel')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {aiStats.filter(p => !p.isRateLimited).length}/{aiStats.length}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('admin.ai.availableProviders')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}