import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Vote, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Brain,
  TrendingUp,
  Users,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  FileText,
  Activity,
  Shield,
  Lightbulb
} from "lucide-react";
import { formatNumber, formatTokenAmount } from "@/lib/formatters";

interface Proposal {
  id: string;
  proposer: string;
  title: string;
  description: string;
  status: "draft" | "active" | "succeeded" | "defeated" | "queued" | "executed" | "cancelled";
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  totalVoters: number;
  quorumReached: boolean;
  votingEnds: string;
  createdAt: string;
  riskScore: number;
  aiAnalysis?: {
    model: string;
    confidence: number;
    economicImpact: number;
    securityImpact: number;
    recommendation: string;
    risks: string[];
  };
  predictedOutcome?: {
    result: "for" | "against";
    confidence: number;
    keyFactors: string[];
  };
}

interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  totalVoters: number;
  avgParticipation: number;
  aiAnalyzedProposals: number;
  aiPredictionAccuracy: number;
}

export default function Governance() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("active");

  const { data: stats, isLoading: statsLoading } = useQuery<GovernanceStats>({
    queryKey: ["/api/governance/stats"],
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/governance/proposals"],
  });

  const activeProposals = proposals?.filter(p => p.status === "active") || [];
  const completedProposals = proposals?.filter(p => ["succeeded", "defeated", "executed"].includes(p.status)) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-governance-title">
            AI Governance
          </h1>
          <p className="text-muted-foreground">
            AI-Enhanced DAO with Proposal Analysis & Outcome Prediction
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Brain className="h-4 w-4 mr-2" />
          AI-Powered
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover-elevate" data-testid="card-total-proposals">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Proposals
                </CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatNumber(stats?.totalProposals || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeProposals || 0} active
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-pass-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pass Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {stats?.totalProposals ? ((stats.passedProposals / stats.totalProposals) * 100).toFixed(1) : 0}%
                </div>
                <Progress 
                  value={stats?.totalProposals ? (stats.passedProposals / stats.totalProposals) * 100 : 0} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-participation">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Participation
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {(stats?.avgParticipation || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats?.totalVoters || 0)} total voters
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-ai-accuracy">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AI Prediction Accuracy
                </CardTitle>
                <Brain className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {(stats?.aiPredictionAccuracy || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats?.aiAnalyzedProposals || 0)} analyzed
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* AI Governance Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              GPT-5 Turbo Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Strategic layer analyzes economic impact, security implications, and provides risk assessment for each proposal.
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Claude Sonnet 4.5 Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tactical layer predicts voting outcomes based on community sentiment, historical patterns, and proposal content.
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Llama 3.3 70B Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Operational layer provides personalized voting recommendations based on voter history and stake alignment.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" data-testid="tab-active">
            <Activity className="h-4 w-4 mr-2" />
            Active ({activeProposals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            <FileText className="h-4 w-4 mr-2" />
            All Proposals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <ProposalList proposals={activeProposals} isLoading={proposalsLoading} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <ProposalList proposals={completedProposals} isLoading={proposalsLoading} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <ProposalList proposals={proposals || []} isLoading={proposalsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProposalList({ proposals, isLoading }: { proposals: Proposal[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No proposals found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const totalVotes = BigInt(proposal.votesFor) + BigInt(proposal.votesAgainst) + BigInt(proposal.votesAbstain);
  const forPercentage = totalVotes > BigInt(0) ? Number((BigInt(proposal.votesFor) * BigInt(100)) / totalVotes) : 0;
  const againstPercentage = totalVotes > BigInt(0) ? Number((BigInt(proposal.votesAgainst) * BigInt(100)) / totalVotes) : 0;

  const statusColors = {
    draft: "secondary",
    active: "default",
    succeeded: "default",
    defeated: "destructive",
    queued: "outline",
    executed: "default",
    cancelled: "secondary",
  } as const;

  const statusIcons = {
    draft: FileText,
    active: Clock,
    succeeded: CheckCircle,
    defeated: XCircle,
    queued: Clock,
    executed: CheckCircle,
    cancelled: XCircle,
  };

  const StatusIcon = statusIcons[proposal.status];

  return (
    <Card className="hover-elevate" data-testid={`card-proposal-${proposal.id}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{proposal.title}</h3>
                <Badge variant={statusColors[proposal.status]}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {proposal.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {proposal.description}
              </p>
            </div>
            <div className="flex gap-2">
              {proposal.riskScore > 0.5 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  High Risk
                </Badge>
              )}
              {proposal.quorumReached && (
                <Badge className="bg-green-500/10 text-green-500">
                  Quorum Reached
                </Badge>
              )}
            </div>
          </div>

          {/* Voting Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span>For: {forPercentage}%</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span>Against: {againstPercentage}%</span>
              </div>
              <div className="flex items-center gap-1">
                <MinusCircle className="h-4 w-4 text-muted-foreground" />
                <span>Abstain: {100 - forPercentage - againstPercentage}%</span>
              </div>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              <div 
                className="bg-green-500" 
                style={{ width: `${forPercentage}%` }} 
              />
              <div 
                className="bg-red-500" 
                style={{ width: `${againstPercentage}%` }} 
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatNumber(proposal.totalVoters)} voters</span>
              <span>Total: {formatTokenAmount(totalVotes.toString())}</span>
            </div>
          </div>

          {/* AI Analysis */}
          {proposal.aiAnalysis && (
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">AI Analysis</span>
                <Badge variant="outline" className="text-xs">
                  {proposal.aiAnalysis.model} • {(proposal.aiAnalysis.confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {proposal.aiAnalysis.recommendation}
              </p>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Economic: {proposal.aiAnalysis.economicImpact > 0 ? '+' : ''}{proposal.aiAnalysis.economicImpact}
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Security: {proposal.aiAnalysis.securityImpact}/100
                </div>
              </div>
            </div>
          )}

          {/* Predicted Outcome */}
          {proposal.predictedOutcome && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Predicted Outcome:</span>
                <Badge variant={proposal.predictedOutcome.result === "for" ? "default" : "destructive"}>
                  {proposal.predictedOutcome.result === "for" ? (
                    <ThumbsUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ThumbsDown className="h-3 w-3 mr-1" />
                  )}
                  {proposal.predictedOutcome.result.toUpperCase()}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {(proposal.predictedOutcome.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
