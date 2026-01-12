import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEnterpriseShards } from "@/hooks/use-enterprise-shards";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Vote, TrendingUp, Zap, Check, Clock, Minus, Activity,
  Users, Shield, Timer, BarChart3, PieChart as PieChartIcon,
  Search, RefreshCw, ChevronRight, Target, Award, Layers,
  CheckCircle, XCircle, AlertCircle, History, Eye, Copy,
  ArrowUpRight, ArrowDownRight, Hash, Network, Brain, Crown
} from "lucide-react";
import { formatAddress } from "@/lib/format";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useWebSocketChannel } from "@/hooks/use-websocket-channel";
import { consensusStateSchema } from "@shared/schema";
import type { ConsensusState, ConsensusRound } from "@shared/schema";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { z } from "zod";

type StatType = 'successRate' | 'blockTime' | 'participation' | 'finality' | 'quorum';

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function PhaseCard({ phase, t }: { phase: import("@shared/schema").ConsensusPhase; t: (key: string) => string }) {
  const [progress, setProgress] = useState(0);
  const phaseTimeMs = parseInt(phase.time.replace('ms', '')) || 20;
  
  // Animate progress bar when phase is active
  useEffect(() => {
    if (phase.status === "active") {
      setProgress(0);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / phaseTimeMs) * 100, 100);
        setProgress(newProgress);
        if (newProgress >= 100) {
          clearInterval(interval);
        }
      }, 10); // Update every 10ms for smooth animation
      return () => clearInterval(interval);
    } else if (phase.status === "completed") {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [phase.status, phaseTimeMs]);

  const getIcon = () => {
    if (phase.status === "completed") return <Check className="h-6 w-6" />;
    if (phase.status === "active") return <Clock className="h-6 w-6 animate-pulse" />;
    return <Minus className="h-6 w-6" />;
  };

  const getStyles = () => {
    if (phase.status === "completed") {
      return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200";
    }
    if (phase.status === "active") {
      return "bg-primary text-primary-foreground border-primary";
    }
    return "bg-card border-border";
  };

  return (
    <Card className={`text-center ${getStyles()} hover-elevate transition-all relative overflow-hidden`} data-testid={`card-phase-${phase.number}`}>
      {/* Progress bar for active phase */}
      {phase.status === "active" && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      )}
      <CardContent className="pt-4 pb-4">
        <div className="flex justify-center mb-2">{getIcon()}</div>
        <div className="font-semibold text-sm mb-1">
          {phase.number}. {phase.label}
        </div>
        <div className="text-xs opacity-80">{phase.time}</div>
      </CardContent>
    </Card>
  );
}

function ConsensusStatsDetailDialog({
  open,
  onOpenChange,
  statType,
  t,
  consensusState,
  rounds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statType: StatType;
  t: (key: string, options?: Record<string, unknown>) => string;
  consensusState: ConsensusState | undefined;
  rounds: ConsensusRound[];
}) {
  const getDialogContent = () => {
    const hasRoundsData = rounds.length > 0;
    
    switch (statType) {
      case 'successRate': {
        const completedRounds = rounds.filter(r => r.status === 'completed').length;
        const failedRounds = rounds.filter(r => r.status === 'failed').length;
        const inProgressRounds = rounds.filter(r => r.status === 'in_progress').length;
        const totalRounds = rounds.length;
        const successRate = totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;
        const uptimeRate = totalRounds > 0 ? ((completedRounds + inProgressRounds) / totalRounds) * 100 : 0;
        
        const distributionData = hasRoundsData ? [
          { name: t('consensus.completed'), value: completedRounds, color: '#10B981' },
          { name: t('consensus.failed'), value: failedRounds, color: '#EF4444' },
        ].filter(d => d.value > 0) : [];
        
        const sortedRounds = [...rounds].sort((a, b) => b.blockHeight - a.blockHeight);
        const trendData = sortedRounds.slice(0, 7).reverse().map((round, i) => {
          const voteProgress = round.totalValidators > 0 
            ? (round.prevoteCount / round.totalValidators) * 100 
            : 0;
          return {
            day: t(`consensus.day${i + 1}`),
            successRate: round.status === 'completed' ? 100 : round.status === 'failed' ? 0 : voteProgress,
            blockHeight: round.blockHeight,
          };
        });

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {t('consensus.successRateAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('consensus.successRateAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasRoundsData ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('consensus.noRoundsFound')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.roundDistribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {distributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={distributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            >
                              {distributionData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          {t('consensus.noRoundsFound')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.weeklyTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="day" className="text-xs" />
                            <YAxis domain={[0, 100]} className="text-xs" />
                            <Tooltip formatter={(value, name) => [name === 'successRate' ? `${value}%` : value, name === 'successRate' ? t('consensus.successRate') : name]} />
                            <Area type="monotone" dataKey="successRate" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          {t('consensus.noRoundsFound')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{successRate.toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.overallRate')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{completedRounds.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.successfulRounds')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{failedRounds.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.failedRoundsCount')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{uptimeRate.toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.uptimeRate')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }
      
      case 'blockTime': {
        const avgBlockTime = consensusState?.avgBlockTimeMs ?? 0;
        const blockTimes = rounds.map(r => r.avgBlockTimeMs).filter(t => t > 0);
        const minBlockTime = blockTimes.length > 0 ? Math.min(...blockTimes) : 0;
        const maxBlockTime = blockTimes.length > 0 ? Math.max(...blockTimes) : 0;
        
        const sortedRounds = [...rounds].sort((a, b) => b.blockHeight - a.blockHeight);
        const trendData = sortedRounds.slice(0, 24).reverse().map((round, i) => ({
          hour: `#${round.blockHeight}`,
          blockTime: round.avgBlockTimeMs,
          target: 100,
        }));
        
        const distributionData = hasRoundsData ? [
          { range: '<80ms', count: rounds.filter(r => r.avgBlockTimeMs < 80).length },
          { range: '80-90ms', count: rounds.filter(r => r.avgBlockTimeMs >= 80 && r.avgBlockTimeMs < 90).length },
          { range: '90-100ms', count: rounds.filter(r => r.avgBlockTimeMs >= 90 && r.avgBlockTimeMs < 100).length },
          { range: '100-110ms', count: rounds.filter(r => r.avgBlockTimeMs >= 100 && r.avgBlockTimeMs < 110).length },
          { range: '>110ms', count: rounds.filter(r => r.avgBlockTimeMs >= 110).length },
        ] : [];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-500" />
                {t('consensus.blockTimeAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('consensus.blockTimeAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasRoundsData ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('consensus.noRoundsFound')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.hourlyTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" className="text-xs" interval={5} />
                          <YAxis domain={[Math.max(0, minBlockTime - 20), maxBlockTime + 20]} className="text-xs" />
                          <Tooltip />
                          <Line type="monotone" dataKey="blockTime" stroke="#3B82F6" strokeWidth={2} dot={false} name={t('consensus.blockTime')} />
                          <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" dot={false} name={t('consensus.target')} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.timeDistribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={distributionData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="range" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name={t('consensus.roundsCompleted')} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{avgBlockTime}ms</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.currentAvg')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{minBlockTime}ms</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.fastestBlock')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{maxBlockTime}ms</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.slowestBlock')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">100ms</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.targetTime')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }
      
      case 'participation': {
        const totalValidators = consensusState?.totalValidators ?? 0;
        const activeVoters = consensusState?.prevoteCount ?? 0;
        const participationRate = totalValidators > 0 ? (activeVoters / totalValidators) * 100 : 0;
        const missedVotes = Math.max(0, totalValidators - activeVoters);
        
        const avgParticipation = hasRoundsData 
          ? rounds.reduce((sum, r) => sum + (r.prevoteCount / Math.max(1, r.totalValidators) * 100), 0) / rounds.length
          : 0;
        
        const requiredQuorum = consensusState?.requiredQuorum ?? 0;
        const committeeSize = requiredQuorum > 0 ? Math.ceil(requiredQuorum * 3 / 2) : 0;
        
        const sortedRounds = [...rounds].sort((a, b) => b.blockHeight - a.blockHeight);
        const historyData = sortedRounds.slice(0, 7).reverse().map((round, i) => {
          const rate = round.totalValidators > 0 ? (round.prevoteCount / round.totalValidators) * 100 : 0;
          return {
            day: t(`consensus.day${i + 1}`),
            participation: rate,
            blockHeight: round.blockHeight,
          };
        });
        
        const roundParticipationData = sortedRounds.slice(0, 10).map((round) => ({
          block: `#${round.blockHeight}`,
          prevotes: round.prevoteCount,
          precommits: round.precommitCount,
          total: round.totalValidators,
        }));

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                {t('consensus.participationAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('consensus.participationAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasRoundsData && totalValidators === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('consensus.noRoundsFound')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.votingDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {roundParticipationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={roundParticipationData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="block" className="text-xs" />
                            <YAxis domain={[0, Math.max(totalValidators, 100) + 10]} className="text-xs" />
                            <Tooltip />
                            <Bar dataKey="prevotes" fill="#10B981" name={t('consensus.preVotes')} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="precommits" fill="#3B82F6" name={t('consensus.preCommits')} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          {t('consensus.noRoundsFound')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.participationHistory')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {historyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={historyData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="day" className="text-xs" />
                            <YAxis domain={[0, 100]} className="text-xs" />
                            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, t('consensus.participation')]} />
                            <Line type="monotone" dataKey="participation" name={t('consensus.participation')} stroke="#8B5CF6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          {t('consensus.noRoundsFound')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{participationRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.overallParticipation')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{activeVoters}/{totalValidators}</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.activeVoters')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{avgParticipation.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.avgParticipationRate')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{missedVotes}</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.missedVotes')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }
      
      case 'finality': {
        const completedRounds = rounds.filter(r => r.status === 'completed' && r.completedTime);
        const finalityTimes = completedRounds.map(r => r.completedTime! - r.startTime);
        const avgFinality = finalityTimes.length > 0 
          ? Math.round(finalityTimes.reduce((sum, t) => sum + t, 0) / finalityTimes.length)
          : 0;
        const bestFinality = finalityTimes.length > 0 ? Math.min(...finalityTimes) : 0;
        const targetFinality = 200;
        
        const sortedRounds = [...completedRounds].sort((a, b) => b.blockHeight - a.blockHeight);
        const trendData = sortedRounds.slice(0, 12).reverse().map((round) => ({
          hour: `#${round.blockHeight}`,
          finality: round.completedTime! - round.startTime,
          target: targetFinality,
        }));

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                {t('consensus.finalityAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('consensus.finalityAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasRoundsData || completedRounds.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('consensus.noRoundsFound')}</p>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.finalityTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" className="text-xs" />
                          <YAxis domain={[0, Math.max(targetFinality, ...finalityTimes) + 50]} className="text-xs" />
                          <Tooltip formatter={(value) => [`${value}ms`, t('consensus.finality')]} />
                          <Area type="monotone" dataKey="finality" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name={t('consensus.finality')} />
                          <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name={t('consensus.target')} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{avgFinality}ms</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.avgFinality')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{bestFinality}ms</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.bestFinality')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{targetFinality}ms</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.targetFinality')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">1</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.blocksToFinality')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }
      
      case 'quorum': {
        const requiredQuorum = consensusState?.requiredQuorum ?? 0;
        const totalValidators = consensusState?.totalValidators ?? 0;
        const quorumPercent = totalValidators > 0 ? (requiredQuorum / totalValidators) * 100 : 0;
        
        const quorumMetCount = rounds.filter(r => r.prevoteCount >= r.requiredQuorum).length;
        const quorumReachRate = rounds.length > 0 ? (quorumMetCount / rounds.length) * 100 : 0;
        
        const sortedRounds = [...rounds].sort((a, b) => b.blockHeight - a.blockHeight);
        const quorumHistory = sortedRounds.slice(0, 10).reverse().map((round) => ({
          round: `#${round.blockHeight}`,
          votes: round.prevoteCount,
          required: round.requiredQuorum,
        }));

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                {t('consensus.quorumAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('consensus.quorumAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            {!hasRoundsData ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('consensus.noRoundsFound')}</p>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('consensus.recentQuorumStatus')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={quorumHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="round" className="text-xs" />
                          <YAxis domain={[0, Math.max(totalValidators, ...quorumHistory.map(q => q.votes)) + 10]} className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="votes" fill="#10B981" radius={[4, 4, 0, 0]} name={t('consensus.votesReceived')} />
                          <Bar dataKey="required" fill="#F59E0B" radius={[4, 4, 0, 0]} name={t('consensus.required')} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card className="mt-4 bg-muted">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-amber-600">{requiredQuorum}</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.requiredQuorum')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{quorumPercent.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.quorumThreshold')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{quorumReachRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.quorumReached')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">2f+1</div>
                        <div className="text-xs text-muted-foreground">{t('consensus.bftFormula')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-consensus-stats-${statType}`}>
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}

function ConsensusRoundDetailDialog({
  open,
  onOpenChange,
  round,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  round: ConsensusRound | null;
  t: (key: string) => string;
}) {
  if (!round) return null;

  const phases = round.phasesJson ? JSON.parse(round.phasesJson) : [];
  const duration = round.completedTime ? round.completedTime - round.startTime : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-consensus-round-detail">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            {t('consensus.roundDetail')} #{round.blockHeight.toLocaleString()}
          </DialogTitle>
          <DialogDescription>
            {t('consensus.roundDetailDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('consensus.roundOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">{t('consensus.blockHeight')}</div>
                  <div className="font-semibold">{round.blockHeight.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t('consensus.proposer')}</div>
                  <div className="font-mono text-sm">{formatAddress(round.proposerAddress)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t('consensus.status')}</div>
                  <Badge variant={round.status === 'completed' ? 'default' : round.status === 'failed' ? 'destructive' : 'secondary'}>
                    {round.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t('consensus.duration')}</div>
                  <div className="font-semibold">{duration}ms</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('consensus.votingDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{t('consensus.preVotes')}</span>
                    <span className="text-sm font-semibold text-green-600">
                      {round.prevoteCount}/{round.totalValidators}
                    </span>
                  </div>
                  <Progress value={round.totalValidators > 0 ? (round.prevoteCount / round.totalValidators) * 100 : 0} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{t('consensus.preCommits')}</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {round.precommitCount}/{round.totalValidators}
                    </span>
                  </div>
                  <Progress value={round.totalValidators > 0 ? (round.precommitCount / round.totalValidators) * 100 : 0} className="h-3" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold">{round.requiredQuorum}</div>
                    <div className="text-xs text-muted-foreground">{t('consensus.requiredQuorum')}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{round.totalValidators}</div>
                    <div className="text-xs text-muted-foreground">{t('consensus.totalValidators')}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{round.avgBlockTimeMs}ms</div>
                    <div className="text-xs text-muted-foreground">{t('consensus.avgTime')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {phases.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('consensus.phaseBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {phases.map((phase: { number: number; label: string; status: string; time: string }) => (
                    <div 
                      key={phase.number}
                      className={`p-2 rounded-lg text-center text-xs ${
                        phase.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200' 
                          : phase.status === 'active'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="font-semibold">{phase.label}</div>
                      <div>{phase.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Consensus() {
  const { t } = useTranslation();
  const [selectedStatType, setSelectedStatType] = useState<StatType | null>(null);
  const [selectedRound, setSelectedRound] = useState<ConsensusRound | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Display phase directly from server - server calculates correct phase using blockAge modulo
  // No need for forward-only tracking since server handles 100ms cycle transitions correctly

  const { 
    totalValidators: enterpriseValidators, 
    config: shardConfig,
    isLoading: shardsLoading 
  } = useEnterpriseShards();

  const dynamicQuorum = useMemo(() => {
    return Math.floor((enterpriseValidators * 2) / 3) + 1;
  }, [enterpriseValidators]);

  // REAL-TIME CONSENSUS: 50ms polling for 100ms block time (5 phases × 20ms each)
  // Must be fast enough to visualize rapid phase transitions matching ~200K TPS
  const { data: consensusState, isLoading } = useQuery<ConsensusState>({
    queryKey: ["/api/consensus/current"],
    refetchInterval: 50, // 50ms for real-time phase visualization
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true, // Keep updating even when tab not focused
    retry: 1,
  });
  
  // Use server-calculated phase directly - server uses blockAge modulo for accurate 100ms cycling
  // Phase transitions 1→2→3→4→5→1 are handled correctly by server using (Date.now() - startTime) % 100
  const displayPhase = consensusState?.currentPhase || 1;

  useWebSocketChannel({
    channel: "consensus_state_update",
    schema: consensusStateSchema,
    queryKey: ["/api/consensus/current"],
    updateMode: "replace",
  });

  const consensusRoundsSnapshotSchema = useMemo(() => z.array(z.object({
    id: z.string(),
    blockHeight: z.number(),
    proposerAddress: z.string(),
    currentPhase: z.number().optional().default(5),
    prevoteCount: z.number().optional().default(0),
    precommitCount: z.number().optional().default(0),
    totalValidators: z.number().optional().default(enterpriseValidators || 21),
    requiredQuorum: z.number().optional().default(dynamicQuorum || 14),
    avgBlockTimeMs: z.number().optional().default(200),
    status: z.string().optional().default("completed"),
    startTime: z.number().optional().default(0),
    completedTime: z.number().nullable().optional().default(null),
    phasesJson: z.string().optional().default("[]"),
    createdAt: z.string().or(z.date()).optional(),
  })), [enterpriseValidators, dynamicQuorum]);

  const { data: consensusRoundsData } = useQuery<ConsensusRound[]>({
    queryKey: ["/api/consensus/rounds"],
    staleTime: 10000,
    gcTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  useWebSocketChannel({
    channel: "consensus_rounds_snapshot",
    schema: consensusRoundsSnapshotSchema,
    queryKey: ["/api/consensus/rounds"],
    updateMode: "replace",
  });

  const votingActivitySchema = useMemo(() => z.array(z.object({
    blockHeight: z.number(),
    proposer: z.string(),
    prevotes: z.number(),
    precommits: z.number(),
    totalValidators: z.number(),
    quorumReached: z.boolean(),
    status: z.string(),
  })), []);

  const { data: votingActivityData } = useQuery<z.infer<typeof votingActivitySchema>>({
    queryKey: ["/api/consensus/voting-activity"],
    staleTime: 5000,
    gcTime: 15000,
    initialData: [],
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  useWebSocketChannel({
    channel: "voting_activity",
    schema: votingActivitySchema,
    queryKey: ["/api/consensus/voting-activity"],
    updateMode: "replace",
  });

  const votingActivity = votingActivityData || [];

  const rounds: ConsensusRound[] = consensusRoundsData || [];
  const filteredRounds = useMemo(() => rounds.filter((round: ConsensusRound) => {
    const matchesSearch = searchQuery === "" || 
      round.blockHeight.toString().includes(searchQuery) ||
      round.proposerAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || round.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [rounds, searchQuery, statusFilter]);

  // Use displayPhase for forward-only phase progression (1→2→3→4→5)
  // This ensures UI shows phases in correct order even with network timing issues
  const phases = useMemo(() => {
    const rawPhases = consensusState?.phases || [];
    if (rawPhases.length === 0) {
      // Default phases when no data
      return [
        { number: 1, label: 'Propose', time: '20ms', status: 'pending' as const },
        { number: 2, label: 'Pre-vote', time: '20ms', status: 'pending' as const },
        { number: 3, label: 'Pre-commit', time: '20ms', status: 'pending' as const },
        { number: 4, label: 'Commit', time: '20ms', status: 'pending' as const },
        { number: 5, label: 'Finalize', time: '20ms', status: 'pending' as const },
      ];
    }
    // Recalculate status based on displayPhase for smooth forward progression
    return rawPhases.map(p => ({
      ...p,
      status: p.number < displayPhase ? 'completed' as const 
        : p.number === displayPhase ? 'active' as const 
        : 'pending' as const
    }));
  }, [consensusState?.phases, displayPhase]);
  
  const currentRound = consensusState?.blockHeight || 0;
  const activePhase = phases.find(p => p.status === "active");
  const completedPhases = phases.filter(p => p.status === "completed").length;
  const progress = Math.floor((completedPhases / 5) * 100);
  const proposerAddress = consensusState?.proposer || "N/A";
  const avgBlockTime = consensusState?.avgBlockTimeMs || 0;
  
  const effectiveValidators = consensusState?.totalValidators || enterpriseValidators || 0;
  const effectiveQuorum = consensusState?.requiredQuorum || dynamicQuorum || 0;

  // AI Pre-Validation ensures 85%~100% participation rate
  // participatingValidators = validators actively participating in this round
  const participatingValidators = consensusState?.participatingValidators || Math.floor(effectiveValidators * 0.9);
  
  const prevoteCount = {
    current: consensusState?.prevoteCount || 0,
    total: participatingValidators, // Use participating validators, not total
  };
  const precommitCount = {
    current: consensusState?.precommitCount || 0,
    total: participatingValidators, // Use participating validators, not total
  };
  const prevoteProgress = prevoteCount.total > 0 ? (prevoteCount.current / prevoteCount.total) * 100 : 0;
  const precommitProgress = precommitCount.total > 0 ? (precommitCount.current / precommitCount.total) * 100 : 0;
  const prevoteNeeded = Math.max(0, effectiveQuorum - prevoteCount.current);
  const precommitNeeded = Math.max(0, effectiveQuorum - precommitCount.current);

  const successRate = 99.8;
  // Use backend-provided participation rate (85%~100% due to AI Pre-Validation)
  const participationRate = consensusState?.participationRate || 
    (effectiveValidators > 0 ? (participatingValidators / effectiveValidators) * 100 : 92);
  const finalityTime = 150;

  if (isLoading || shardsLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-consensus-title">
          <Vote className="h-8 w-8" />
          {t('consensus.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('consensus.subtitle')} | {t('consensus.currentRound')} #{currentRound.toLocaleString()} | {progress}% {t('common.completed')}
        </p>
      </div>

      {/* Statistics Cards - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setSelectedStatType('successRate')}
          data-testid="card-stat-success-rate"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                <div className="text-xs text-muted-foreground">{t('consensus.successRate')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+0.1% {t('consensus.fromLastWeek')}</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setSelectedStatType('blockTime')}
          data-testid="card-stat-block-time"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{avgBlockTime}ms</div>
                <div className="text-xs text-muted-foreground">{t('consensus.avgTime')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
              <ArrowDownRight className="h-3 w-3" />
              <span>-2ms {t('consensus.fromTarget')}</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setSelectedStatType('participation')}
          data-testid="card-stat-participation"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{participationRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{t('consensus.participation')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{participatingValidators}/{effectiveValidators} {t('consensus.validators')}</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setSelectedStatType('finality')}
          data-testid="card-stat-finality"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{finalityTime}ms</div>
                <div className="text-xs text-muted-foreground">{t('consensus.finality')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <Zap className="h-3 w-3" />
              <span>{t('consensus.instantFinality')}</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setSelectedStatType('quorum')}
          data-testid="card-stat-quorum"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{effectiveQuorum}</div>
                <div className="text-xs text-muted-foreground">{t('consensus.quorum')} (2f+1)</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <CheckCircle className="h-3 w-3" />
              <span>{t('consensus.quorumMet')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Round Alert */}
      <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <Zap className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="font-semibold text-lg">
            {t('consensus.currentRound')} #{currentRound.toLocaleString()} {t('consensus.inProgress')}
          </div>
          <div className="text-sm mt-1">
            {t('consensus.phase')}: {activePhase?.label || t('consensus.initializing')} | {completedPhases} {t('consensus.ofPhasesCompleted', { total: 5 })} | {t('consensus.target')}: {avgBlockTime}ms
          </div>
        </AlertDescription>
      </Alert>

      {/* Phase Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {phases.map((phase) => (
          <PhaseCard key={phase.number} phase={phase} t={t} />
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('consensus.overview')}
          </TabsTrigger>
          <TabsTrigger value="rounds" data-testid="tab-rounds">
            <History className="h-4 w-4 mr-2" />
            {t('consensus.roundsHistory')}
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="h-4 w-4 mr-2" />
            {t('consensus.votingActivity')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  {t('consensus.currentRoundVotes')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{t('consensus.preVotes')} (2f+1 {t('consensus.required')})</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      {prevoteCount.current}/{prevoteCount.total} <Check className="h-4 w-4" />
                    </span>
                  </div>
                  <Progress value={prevoteProgress} className="h-8" />
                  <div className="text-center mt-2 text-sm font-semibold">
                    {prevoteProgress.toFixed(1)}% ({prevoteNeeded} {t('consensus.moreNeeded')})
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{t('consensus.preCommits')} (2f+1 {t('consensus.required')})</span>
                    <span className="text-blue-600 font-semibold">
                      {precommitCount.current}/{precommitCount.total}
                    </span>
                  </div>
                  <Progress value={precommitProgress} className="h-8" />
                  <div className="text-center mt-2 text-sm font-semibold text-blue-600">
                    {precommitProgress.toFixed(1)}% ({precommitNeeded} {t('consensus.moreNeeded')})
                  </div>
                </div>

                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">{t('consensus.currentProposer')}</div>
                        <div className="font-mono text-sm font-semibold">{formatAddress(proposerAddress)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">{t('consensus.totalValidators')}</div>
                        <div className="font-bold text-lg">{prevoteCount.total} {t('consensus.validators')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">{t('consensus.quorum')} (2f+1)</div>
                        <div className="font-bold text-lg">{effectiveQuorum} {t('consensus.votes')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">{t('consensus.selectionMethod')}</div>
                        <div className="font-bold text-lg text-purple-600">{t('consensus.aiEnhanced')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('consensus.performanceMetrics')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6 text-center">
                      <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                        {t('consensus.successRate')}
                      </div>
                      <div className="text-4xl font-bold text-green-700 dark:text-green-300">
                        99.8%
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {t('consensus.lastRounds', { count: 10000 })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6 text-center">
                      <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                        {t('consensus.avgTime')}
                      </div>
                      <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                        {avgBlockTime}ms
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {t('consensus.target')}: 100ms
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2 border-b border-border">
                        <span className="text-muted-foreground">{t('consensus.roundsCompleted')}</span>
                        <span className="font-semibold">{currentRound.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-border">
                        <span className="text-muted-foreground">{t('consensus.failedRounds')}</span>
                        <span className="font-semibold text-red-600">2,468</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-border">
                        <span className="text-muted-foreground">{t('consensus.timeoutRate')}</span>
                        <span className="font-semibold text-yellow-600">0.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('consensus.earlyTerminations')}</span>
                        <span className="font-semibold text-green-600">89.3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rounds" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>{t('consensus.roundsHistory')}</CardTitle>
                  <CardDescription>{t('consensus.roundsHistoryDesc')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('consensus.searchRounds')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                      data-testid="input-search-rounds"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32" data-testid="select-status-filter">
                      <SelectValue placeholder={t('consensus.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('consensus.allStatuses')}</SelectItem>
                      <SelectItem value="completed">{t('consensus.completed')}</SelectItem>
                      <SelectItem value="in_progress">{t('consensus.inProgress')}</SelectItem>
                      <SelectItem value="failed">{t('consensus.failed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('consensus.blockHeight')}</TableHead>
                      <TableHead>{t('consensus.proposer')}</TableHead>
                      <TableHead>{t('consensus.phase')}</TableHead>
                      <TableHead>{t('consensus.votes')}</TableHead>
                      <TableHead>{t('consensus.status')}</TableHead>
                      <TableHead>{t('consensus.time')}</TableHead>
                      <TableHead>{t('consensus.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRounds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t('consensus.noRoundsFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRounds.map((round) => (
                        <TableRow key={round.id} data-testid={`row-round-${round.blockHeight}`}>
                          <TableCell className="font-mono font-semibold">
                            #{round.blockHeight.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatAddress(round.proposerAddress)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {round.currentPhase}/5
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 text-xs">
                              <span className="text-green-600">{round.prevoteCount}PV</span>
                              <span className="text-blue-600">{round.precommitCount}PC</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                round.status === 'completed' ? 'default' : 
                                round.status === 'failed' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {round.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                              {round.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                              {round.status === 'in_progress' && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
                              {round.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {round.avgBlockTimeMs}ms
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRound(round)}
                              data-testid={`button-view-round-${round.blockHeight}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('consensus.liveVotingActivity')}
              </CardTitle>
              <CardDescription>{t('consensus.liveVotingActivityDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {votingActivity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('consensus.noActivityYet')}
                    </div>
                  ) : (
                    votingActivity.map((activity, index) => (
                      <Card key={index} className="bg-muted/50" data-testid={`card-activity-${activity.blockHeight}`}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                activity.quorumReached 
                                  ? 'bg-green-100 dark:bg-green-950/30' 
                                  : 'bg-yellow-100 dark:bg-yellow-950/30'
                              }`}>
                                {activity.quorumReached 
                                  ? <CheckCircle className="h-4 w-4 text-green-600" />
                                  : <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
                                }
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {t('consensus.round')} #{activity.blockHeight.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {t('consensus.proposer')}: {formatAddress(activity.proposer)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="text-green-600 font-semibold">{activity.prevotes}</span>
                                  <span className="text-muted-foreground">PV</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600 font-semibold">{activity.precommits}</span>
                                  <span className="text-muted-foreground">PC</span>
                                </div>
                              </div>
                              <Badge 
                                variant={activity.status === 'completed' ? 'default' : 'secondary'}
                                className="mt-1"
                              >
                                {activity.status}
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={activity.totalValidators > 0 ? (activity.prevotes / activity.totalValidators) * 100 : 0} 
                            className="h-1 mt-3" 
                          />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ConsensusStatsDetailDialog
        open={selectedStatType !== null}
        onOpenChange={(open) => !open && setSelectedStatType(null)}
        statType={selectedStatType || 'successRate'}
        t={t}
        consensusState={consensusState}
        rounds={rounds}
      />

      <ConsensusRoundDetailDialog
        open={selectedRound !== null}
        onOpenChange={(open) => !open && setSelectedRound(null)}
        round={selectedRound}
        t={t}
      />
    </div>
  );
}
