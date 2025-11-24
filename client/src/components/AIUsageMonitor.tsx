import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket-context";
import { Activity, AlertCircle, Bot, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
}

export function AIUsageMonitor() {
  const [aiStats, setAIStats] = useState<AIProviderStats[]>([]);
  const [isSwitchingProvider, setIsSwitchingProvider] = useState(false);
  const { subscribeToEvent } = useWebSocket();
  const { toast } = useToast();

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

    return () => {
      unsubscribe();
    };
  }, [subscribeToEvent]);

  const handleSwitchProvider = async (provider: string) => {
    setIsSwitchingProvider(true);
    try {
      await apiRequest('POST', '/api/admin/ai-usage/switch-provider', { provider });
      
      toast({
        title: "Provider switched",
        description: `Successfully switched to ${provider}`,
      });
      
      // Refresh stats
      const response = await fetch('/api/admin/ai-usage/stats');
      const data = await response.json();
      setAIStats(data);
    } catch (error) {
      console.error('Error switching provider:', error);
      toast({
        title: "Error",
        description: "Failed to switch provider",
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
        title: "Limits reset",
        description: "Daily limits have been reset for all providers",
      });
      
      // Refresh stats
      const response = await fetch('/api/admin/ai-usage/stats');
      const data = await response.json();
      setAIStats(data);
    } catch (error) {
      console.error('Error resetting limits:', error);
      toast({
        title: "Error",
        description: "Failed to reset limits",
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
      case 'meta':
        return "🔷";
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
            AI Provider Usage & Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Live Updates
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleResetLimits}
              data-testid="button-reset-limits"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset Limits
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiStats.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Loading AI provider statistics...
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
                    </div>
                    {provider.isRateLimited && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Rate Limited
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Request Stats */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Requests</span>
                      <span className="font-mono">
                        {formatNumber(provider.successfulRequests)}/{formatNumber(provider.totalRequests)}
                      </span>
                    </div>
                    {provider.failedRequests > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Failed</span>
                        <span className="font-mono text-destructive">
                          {formatNumber(provider.failedRequests)}
                        </span>
                      </div>
                    )}
                    {provider.rateLimitHits > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate Limit Hits</span>
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
                        <span className="text-muted-foreground">Daily Usage</span>
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
                      <span className="text-muted-foreground">Tokens Used</span>
                      <span className="font-mono">{formatNumber(provider.totalTokensUsed)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost</span>
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
                      Use This Provider
                    </Button>
                  )}

                  {/* Rate Limit Reset Time */}
                  {provider.isRateLimited && provider.rateLimitResetTime && (
                    <div className="text-xs text-center text-muted-foreground">
                      Resets at: {new Date(provider.rateLimitResetTime).toLocaleTimeString()}
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
                  <div className="text-xs text-muted-foreground">Total Requests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatNumber(aiStats.reduce((acc, p) => acc + p.totalTokensUsed, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Tokens</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatCost(aiStats.reduce((acc, p) => acc + p.totalCost, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Cost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {aiStats.filter(p => !p.isRateLimited).length}/{aiStats.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Available Providers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}