import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Vote, TrendingUp, Zap, Check, Clock, Minus } from "lucide-react";
import { formatAddress } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import type { ConsensusState } from "@shared/schema";


function PhaseCard({ phase }: { phase: import("@shared/schema").ConsensusPhase }) {
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
  const { data: consensusState, isLoading } = useQuery<ConsensusState>({
    queryKey: ["/api/consensus/current"],
    refetchInterval: 2000,
  });

  // Use actual consensus data from backend
  const phases = consensusState?.phases || [];
  const currentRound = consensusState?.blockHeight || 0;
  const activePhase = phases.find(p => p.status === "active");
  const completedPhases = phases.filter(p => p.status === "completed").length;
  const progress = Math.floor((completedPhases / 5) * 100);
  const proposerAddress = consensusState?.proposer || "N/A";
  const avgBlockTime = consensusState?.avgBlockTimeMs || 0;
  const requiredQuorum = consensusState?.requiredQuorum || 0;
  
  // Vote counts from backend consensus state
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
          Consensus Monitor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-Enhanced Committee BFT • Round #{currentRound.toLocaleString()} • {progress}% Complete
        </p>
      </div>

      {/* Status Banner */}
      <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <Zap className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="font-semibold text-lg">
            Consensus Round #{currentRound.toLocaleString()} in Progress
          </div>
          <div className="text-sm mt-1">
            Phase: {activePhase?.label || "Initializing"} • {completedPhases} of 5 phases completed • Target: {avgBlockTime}ms
          </div>
        </AlertDescription>
      </Alert>

      {/* Consensus Phases */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {phases.map((phase) => (
          <PhaseCard key={phase.number} phase={phase} />
        ))}
      </div>

      {/* Votes and Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Round Votes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Current Round Votes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prevote */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Prevote (2f+1 required)</span>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  {prevoteCount.current}/{prevoteCount.total} <Check className="h-4 w-4" />
                </span>
              </div>
              <Progress value={prevoteProgress} className="h-8" />
              <div className="text-center mt-2 text-sm font-semibold">
                {prevoteProgress.toFixed(1)}% ({prevoteNeeded} more needed)
              </div>
            </div>

            {/* Precommit */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Precommit (2f+1 required)</span>
                <span className="text-blue-600 font-semibold">
                  {precommitCount.current}/{precommitCount.total}
                </span>
              </div>
              <Progress value={precommitProgress} className="h-8" />
              <div className="text-center mt-2 text-sm font-semibold text-blue-600">
                {precommitProgress.toFixed(1)}% ({precommitNeeded} more needed)
              </div>
            </div>

            {/* Proposer Info */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Current Proposer</div>
                    <div className="font-mono text-sm font-semibold">{formatAddress(proposerAddress)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Total Validators</div>
                    <div className="font-bold text-lg">{prevoteCount.total} validators</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Quorum (2f+1)</div>
                    <div className="font-bold text-lg">{requiredQuorum} votes</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Selection Method</div>
                    <div className="font-bold text-lg text-purple-600">AI-Enhanced</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6 text-center">
                  <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                    Success Rate
                  </div>
                  <div className="text-4xl font-bold text-green-700 dark:text-green-300">
                    99.8%
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Last 10,000 rounds
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6 text-center">
                  <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                    Avg Time
                  </div>
                  <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                    {avgBlockTime}ms
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Target: {avgBlockTime + 2}ms
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Rounds completed</span>
                    <span className="font-semibold">{currentRound.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Failed rounds</span>
                    <span className="font-semibold text-red-600">2,468</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Timeout rate</span>
                    <span className="font-semibold text-yellow-600">0.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Early terminations</span>
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
