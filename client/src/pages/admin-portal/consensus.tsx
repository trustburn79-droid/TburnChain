import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Vote,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Zap,
  TrendingUp,
  Activity,
  Brain,
  RefreshCw,
  Download,
  AlertCircle,
  Timer,
  Blocks,
  History,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface ConsensusRound {
  roundNumber: number;
  phase: "propose" | "prevote" | "precommit" | "commit";
  proposer: string;
  votesReceived: number;
  votesRequired: number;
  startTime: Date;
  committee: Array<{
    address: string;
    votingPower: number;
    voted: boolean;
    vote: "approve" | "reject";
  }>;
}

interface ConsensusStats {
  avgBlockTime: number;
  avgFinality: number;
  consensusRate: number;
  participationRate: number;
  committeeSize: number;
  aiOptimization: string;
}

interface ConsensusHistory {
  round: number;
  blockTime: number;
  votes: number;
  finality: number;
}

interface ConsensusResponse {
  currentRound: ConsensusRound;
  stats: ConsensusStats;
  history: ConsensusHistory[];
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardContent>
    </Card>
  );
}

function CommitteeRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export default function AdminConsensus() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: consensusData, isLoading, error, refetch } = useQuery<ConsensusResponse>({
    queryKey: ["/api/consensus/current"],
    staleTime: 2000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 2000,
  });

  // Use API data with minimal default values for loading state
  const currentRound = useMemo(() => consensusData?.currentRound || {
    roundNumber: 0,
    phase: "propose" as const,
    proposer: "",
    votesReceived: 0,
    votesRequired: 0,
    startTime: new Date(),
    committee: []
  }, [consensusData]);

  const consensusHistory = useMemo(() => consensusData?.history || [], [consensusData]);

  const stats = useMemo(() => consensusData?.stats || {
    avgBlockTime: 0,
    avgFinality: 0,
    consensusRate: 0,
    participationRate: 0,
    committeeSize: 0,
    aiOptimization: "inactive"
  }, [consensusData]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["consensus"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "consensus_update") {
              refetch();
              setLastUpdate(new Date());
            }
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        console.error("WebSocket connection error:", e);
      }
    };

    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminConsensus.refreshSuccess"),
        description: t("adminConsensus.dataUpdated"),
      });
      setLastUpdate(new Date());
    } catch (err) {
      toast({
        title: t("adminConsensus.refreshError"),
        description: t("adminConsensus.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      currentRound: {
        ...currentRound,
        startTime: currentRound.startTime.toISOString(),
      },
      stats,
      history: consensusHistory,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-consensus-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminConsensus.exportSuccess"),
      description: t("adminConsensus.exportSuccessDesc"),
    });
  }, [currentRound, stats, consensusHistory, toast, t]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "propose": return "bg-blue-500";
      case "prevote": return "bg-yellow-500";
      case "precommit": return "bg-orange-500";
      case "commit": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  const votePercentage = Math.round((currentRound.votesReceived / currentRound.votesRequired) * 100);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="consensus-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminConsensus.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminConsensus.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="admin-consensus-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <Vote className="h-8 w-8" />
                {t("adminConsensus.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminConsensus.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs" data-testid="text-ws-status">{wsConnected ? t("common.connected") : t("adminConsensus.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminConsensus.wsConnected") : t("adminConsensus.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminConsensus.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1" data-testid="badge-ai-active">
                  <Brain className="h-3 w-3" />
                  {t("adminConsensus.aiOptimizationActive")}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      data-testid="button-refresh"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.export")}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <Card data-testid="metric-current-round">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold font-mono" data-testid="value-current-round">{currentRound.roundNumber.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("adminConsensus.currentRound")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-avg-block-time">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-avg-block-time">{stats.avgBlockTime}s</p>
                    <p className="text-xs text-muted-foreground">{t("adminConsensus.avgBlockTime")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-avg-finality">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-avg-finality">{stats.avgFinality}s</p>
                    <p className="text-xs text-muted-foreground">{t("adminConsensus.avgFinality")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-consensus-rate">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500" data-testid="value-consensus-rate">{stats.consensusRate}%</p>
                    <p className="text-xs text-muted-foreground">{t("adminConsensus.consensusRate")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-participation">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-participation">{stats.participationRate}%</p>
                    <p className="text-xs text-muted-foreground">{t("adminConsensus.participation")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-committee-size">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-committee-size">{stats.committeeSize}</p>
                    <p className="text-xs text-muted-foreground">{t("adminConsensus.committeeSize")}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" data-testid="card-current-round-status">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-current-round-title">
                  <Activity className="h-5 w-5" />
                  {t("adminConsensus.currentRoundStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("adminConsensus.round")}</p>
                          <p className="text-xl font-bold font-mono" data-testid="text-round-number">#{currentRound.roundNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("adminConsensus.phase")}</p>
                          <Badge className={`${getPhaseColor(currentRound.phase)} text-white uppercase`} data-testid="badge-phase">
                            {currentRound.phase}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("adminConsensus.proposer")}</p>
                          <p className="font-mono text-sm" data-testid="text-proposer">{currentRound.proposer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("adminConsensus.votes")}</p>
                        <p className="text-xl font-bold" data-testid="text-votes">
                          {currentRound.votesReceived}/{currentRound.votesRequired}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("adminConsensus.voteProgress")}</span>
                        <span className="font-medium" data-testid="value-vote-progress">{votePercentage}%</span>
                      </div>
                      <Progress value={votePercentage} className="h-3" data-testid="progress-votes" />
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      {(["propose", "prevote", "precommit", "commit"] as const).map((phase) => (
                        <Tooltip key={phase}>
                          <TooltipTrigger asChild>
                            <div
                              className={`p-3 rounded-lg border cursor-help ${currentRound.phase === phase ? "border-primary bg-primary/5" : "border-muted"}`}
                              data-testid={`phase-indicator-${phase}`}
                            >
                              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${currentRound.phase === phase ? getPhaseColor(phase) : "bg-muted"}`} />
                              <p className="text-xs font-medium capitalize">{t(`adminConsensus.phase${phase.charAt(0).toUpperCase() + phase.slice(1)}`)}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{t(`adminConsensus.${phase}Desc`)}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-committee-votes">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-committee-votes-title">
                  <Users className="h-5 w-5" />
                  {t("adminConsensus.committeeVotes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    {isLoading ? (
                      <>
                        <CommitteeRowSkeleton />
                        <CommitteeRowSkeleton />
                        <CommitteeRowSkeleton />
                        <CommitteeRowSkeleton />
                        <CommitteeRowSkeleton />
                        <CommitteeRowSkeleton />
                        <CommitteeRowSkeleton />
                        <CommitteeRowSkeleton />
                      </>
                    ) : (
                      currentRound.committee.slice(0, 20).map((member, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 rounded-lg hover-elevate"
                          data-testid={`committee-member-${index}`}
                        >
                          <div className="flex items-center gap-2">
                            {member.voted ? (
                              member.vote === "approve" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" data-testid={`icon-vote-approve-${index}`} />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" data-testid={`icon-vote-reject-${index}`} />
                              )
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" data-testid={`icon-vote-pending-${index}`} />
                            )}
                            <span className="font-mono text-xs" data-testid={`text-member-address-${index}`}>{member.address}</span>
                          </div>
                          <span className="text-xs text-muted-foreground" data-testid={`text-member-power-${index}`}>
                            {(member.votingPower / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-consensus-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-history-title">
                <TrendingUp className="h-5 w-5" />
                {t("adminConsensus.consensusHistory")}
              </CardTitle>
              <CardDescription>{t("adminConsensus.last30Rounds")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]" data-testid="chart-consensus-history">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={consensusHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="round" className="text-xs" tickFormatter={(v) => `#${v}`} />
                      <YAxis className="text-xs" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="blockTime" stroke="#10b981" strokeWidth={2} dot={false} name={t("adminConsensus.blockTimeMs")} />
                      <Line type="monotone" dataKey="finality" stroke="#3b82f6" strokeWidth={2} dot={false} name={t("adminConsensus.finalityMs")} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
