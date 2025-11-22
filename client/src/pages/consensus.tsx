import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, Users, Vote, TrendingUp, Zap } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import type { NetworkStats, Validator } from "@shared/schema";

interface ConsensusPhase {
  number: number;
  label: string;
  time: string;
  status: "completed" | "active" | "pending";
}

interface CommitteeMember {
  rank: number;
  address: string;
  role: string;
  votingPower: string;
  prevote: boolean;
  precommit: boolean;
  latency: number;
  status: string;
}

// Generate consensus phases based on block time
function generatePhases(avgBlockTime: number): ConsensusPhase[] {
  const committeeTime = Math.floor(avgBlockTime * 0.05);
  const proposeTime = Math.floor(avgBlockTime * 0.33);
  const prevoteTime = Math.floor(avgBlockTime * 0.39);
  const precommitTime = Math.floor(avgBlockTime * 0.12);
  
  // Cycle through phases based on current time
  const currentPhase = (Math.floor(Date.now() / (avgBlockTime * 1000)) % 5) + 1;
  
  return [
    { number: 1, label: "Committee", time: `${committeeTime}ms`, status: currentPhase > 1 ? "completed" : "active" },
    { number: 2, label: "Propose", time: `${proposeTime}ms`, status: currentPhase > 2 ? "completed" : currentPhase === 2 ? "active" : "pending" },
    { number: 3, label: "Prevote", time: `${prevoteTime}ms`, status: currentPhase > 3 ? "completed" : currentPhase === 3 ? "active" : "pending" },
    { number: 4, label: "Precommit", time: `${precommitTime}ms`, status: currentPhase > 4 ? "completed" : currentPhase === 4 ? "active" : "pending" },
    { number: 5, label: "Finalize", time: "Pending", status: currentPhase === 5 ? "active" : "pending" },
  ];
}

// Convert validators to committee members
// Uses deterministic voting based on validator uptime and blocks produced
function validatorsToCommittee(validators: Validator[]): CommitteeMember[] {
  if (!validators || validators.length === 0) return [];
  
  const activeValidators = validators.filter(v => v.isActive);
  const totalStake = activeValidators.reduce((sum, v) => sum + BigInt(v.stake), BigInt(0));
  
  return activeValidators.slice(0, 5).map((v, idx) => {
    const votingPower = totalStake > 0 ? (Number(BigInt(v.stake) * BigInt(10000) / totalStake) / 100).toFixed(1) : "0.0";
    const isProposer = idx === 0;
    // Deterministic voting based on uptime (high uptime = voted)
    const prevote = v.uptime >= 0.95;
    const precommit = v.uptime >= 0.97;
    // Latency based on blocks produced (more blocks = lower latency)
    const latency = v.blocksProduced > 50000 ? Math.floor(8 + idx) : Math.floor(15 + idx);
    
    return {
      rank: idx + 1,
      address: formatAddress(v.address),
      role: isProposer ? "Proposer" : "Validator",
      votingPower: `${votingPower}%`,
      prevote,
      precommit,
      latency,
      status: "Active",
    };
  });
}

function PhaseCard({ phase }: { phase: ConsensusPhase }) {
  const getIcon = () => {
    if (phase.status === "completed") return "✓";
    if (phase.status === "active") return "⏳";
    return "--";
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
        <div className="text-4xl font-bold mb-2">{getIcon()}</div>
        <div className="font-semibold text-sm mb-1">
          {phase.number}. {phase.label}
        </div>
        <div className="text-xs opacity-80">{phase.time}</div>
      </CardContent>
    </Card>
  );
}

export default function Consensus() {
  const { data: stats, isLoading: isStatsLoading } = useQuery<NetworkStats>({
    queryKey: ["/api/network/stats"],
    refetchInterval: 5000,
  });

  const { data: validators, isLoading: isValidatorsLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    refetchInterval: 10000,
  });

  const isLoading = isStatsLoading || isValidatorsLoading;

  // Generate dynamic data
  const avgBlockTime = stats?.avgBlockTime || 98;
  const phases = generatePhases(avgBlockTime);
  const committeeMembers = validators ? validatorsToCommittee(validators) : [];
  const currentRound = stats?.blockHeight || 0;
  const activePhase = phases.find(p => p.status === "active");
  const completedPhases = phases.filter(p => p.status === "completed").length;
  const progress = Math.floor((completedPhases / 5) * 100);
  
  // Vote counts from committee members (use actual validator count)
  const totalValidators = validators?.filter(v => v.isActive).length || 0;
  const prevoteCount = {
    current: committeeMembers.filter(m => m.prevote).length,
    total: totalValidators,
  };
  const precommitCount = {
    current: committeeMembers.filter(m => m.precommit).length,
    total: totalValidators,
  };
  const prevoteProgress = prevoteCount.total > 0 ? (prevoteCount.current / prevoteCount.total) * 100 : 0;
  const precommitProgress = precommitCount.total > 0 ? (precommitCount.current / precommitCount.total) * 100 : 0;

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
            ⚡ Consensus Round #{currentRound.toLocaleString()} in Progress
          </div>
          <div className="text-sm mt-1">
            Phase: {activePhase?.label || "Initializing"} • Time Elapsed: {completedPhases * avgBlockTime / 5}ms / {avgBlockTime}ms Target
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
                <span className="text-green-600 font-semibold">
                  {prevoteCount.current}/{prevoteCount.total} ✓
                </span>
              </div>
              <Progress value={prevoteProgress} className="h-8" />
              <div className="text-center mt-2 text-sm font-semibold">
                {prevoteProgress}% Complete
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
                {precommitProgress.toFixed(1)}% (3 more needed)
              </div>
            </div>

            {/* Committee Info */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Committee Size</div>
                    <div className="font-bold text-lg">{committeeMembers.length} validators</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Quorum (2f+1)</div>
                    <div className="font-bold text-lg">15 votes</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Byzantine Tolerance</div>
                    <div className="font-bold text-lg">f = 6</div>
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

      {/* Committee Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Committee Members (Round #{currentRound.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Validator</TableHead>
                  <TableHead>Voting Power</TableHead>
                  <TableHead>Prevote</TableHead>
                  <TableHead>Precommit</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {committeeMembers.length > 0 ? (
                  committeeMembers.map((member) => (
                    <TableRow key={member.rank} className="hover-elevate">
                      <TableCell>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            member.rank === 1
                              ? "bg-yellow-200 dark:bg-yellow-800"
                              : "bg-muted"
                          }`}
                        >
                          {member.rank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm font-semibold">
                          {member.address}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.role}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{member.votingPower}</TableCell>
                      <TableCell>
                        {member.prevote ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Signed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.precommit ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Signed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{member.latency} ms</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">{member.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No committee members available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {committeeMembers.length > 0 && (
            <div className="text-center mt-4">
              <Button variant="outline" data-testid="button-view-all-members">
                View All {committeeMembers.length} Committee Members →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
