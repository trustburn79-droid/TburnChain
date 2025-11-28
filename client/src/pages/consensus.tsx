import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Vote, TrendingUp, Zap, Check, Clock, Minus } from "lucide-react";
import { formatAddress } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { useWebSocketChannel } from "@/hooks/use-websocket-channel";
import { consensusStateSchema } from "@shared/schema";
import type { ConsensusState } from "@shared/schema";


function PhaseCard({ phase, t }: { phase: import("@shared/schema").ConsensusPhase; t: (key: string) => string }) {
  const getIcon = () => {
    if (phase.status === "completed") return <Check className="h-8 w-8" />;
    if (phase.status === "active") return <Clock className="h-8 w-8" />;
    return <Minus className="h-8 w-8" />;
  };

  const getStyles = () => {
    if (phase.status === "completed") {
      return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
    }
    if (phase.status === "active") {
      return "bg-green-600 text-white border-green-600";
    }
    return "bg-card border-border";
  };

  return (
    <Card className={`text-center ${getStyles()} hover-elevate`}>
      <CardContent className="pt-6">
        <div className="flex justify-center mb-2">{getIcon()}</div>
        <div className="font-semibold text-sm mb-1">
          {phase.number}. {phase.label}
        </div>
        <div className="text-xs opacity-80">{phase.time}</div>
      </CardContent>
    </Card>
  );
}

export default function Consensus() {
  const { t } = useTranslation();
  const { data: consensusState, isLoading } = useQuery<ConsensusState>({
    queryKey: ["/api/consensus/current"],
  });

  useWebSocketChannel({
    channel: "consensus_state_update",
    schema: consensusStateSchema,
    queryKey: ["/api/consensus/current"],
    updateMode: "replace",
  });

  const phases = consensusState?.phases || [];
  const currentRound = consensusState?.blockHeight || 0;
  const activePhase = phases.find(p => p.status === "active");
  const completedPhases = phases.filter(p => p.status === "completed").length;
  const progress = Math.floor((completedPhases / 5) * 100);
  const proposerAddress = consensusState?.proposer || "N/A";
  const avgBlockTime = consensusState?.avgBlockTimeMs || 0;
  const requiredQuorum = consensusState?.requiredQuorum || 0;
  
  const prevoteCount = {
    current: consensusState?.prevoteCount || 0,
    total: consensusState?.totalValidators || 0,
  };
  const precommitCount = {
    current: consensusState?.precommitCount || 0,
    total: consensusState?.totalValidators || 0,
  };
  const prevoteProgress = prevoteCount.total > 0 ? (prevoteCount.current / prevoteCount.total) * 100 : 0;
  const precommitProgress = precommitCount.total > 0 ? (precommitCount.current / precommitCount.total) * 100 : 0;
  const prevoteNeeded = Math.max(0, requiredQuorum - prevoteCount.current);
  const precommitNeeded = Math.max(0, requiredQuorum - precommitCount.current);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Vote className="h-8 w-8" />
          {t('consensus.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('consensus.subtitle')} | {t('consensus.currentRound')} #{currentRound.toLocaleString()} | {progress}% {t('common.completed')}
        </p>
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {phases.map((phase) => (
          <PhaseCard key={phase.number} phase={phase} t={t} />
        ))}
      </div>

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
                    <div className="font-bold text-lg">{prevoteCount.total} {t('validators.validators')}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">{t('consensus.quorum')} (2f+1)</div>
                    <div className="font-bold text-lg">{requiredQuorum} {t('consensus.votes')}</div>
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
                    {t('consensus.lastRounds', { count: '10,000' })}
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
                    {t('consensus.target')}: {avgBlockTime + 2}ms
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

    </div>
  );
}
