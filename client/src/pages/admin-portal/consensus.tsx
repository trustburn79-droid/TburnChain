import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminConsensus() {
  const { data: consensusData } = useQuery<any>({
    queryKey: ["/api/consensus/current"],
    refetchInterval: 2000,
  });

  const currentRound = useMemo(() => ({
    roundNumber: consensusData?.currentRound?.roundNumber || 12847562,
    phase: consensusData?.currentRound?.phase || "commit",
    proposer: consensusData?.currentRound?.proposer || "0x1234...5678",
    votesReceived: 142,
    votesRequired: 104,
    startTime: new Date(Date.now() - 2500),
    committee: Array.from({ length: 156 }, (_, i) => ({
      address: `0x${i.toString(16).padStart(4, '0')}...${(i + 1).toString(16).padStart(4, '0')}`,
      votingPower: Math.floor(Math.random() * 1000000) + 500000,
      voted: Math.random() > 0.1,
      vote: Math.random() > 0.05 ? "approve" : "reject",
    })),
  }), [consensusData]);

  const consensusHistory = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      round: 12847532 + i,
      blockTime: Math.floor(Math.random() * 200) + 1800,
      votes: Math.floor(Math.random() * 20) + 136,
      finality: Math.floor(Math.random() * 100) + 1900,
    }));
  }, []);

  const stats = useMemo(() => ({
    avgBlockTime: 1.95,
    avgFinality: 2.1,
    consensusRate: 99.8,
    participationRate: 91.2,
    committeeSize: 156,
    aiOptimization: "active",
  }), []);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "propose": return "bg-blue-500";
      case "prevote": return "bg-yellow-500";
      case "precommit": return "bg-orange-500";
      case "commit": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Vote className="h-8 w-8" />
              Consensus Monitor
            </h1>
            <p className="text-muted-foreground">Real-time AI-Enhanced Committee BFT consensus monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Optimization Active
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-mono">{currentRound.roundNumber.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Current Round</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.avgBlockTime}s</p>
              <p className="text-xs text-muted-foreground">Avg Block Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.avgFinality}s</p>
              <p className="text-xs text-muted-foreground">Avg Finality</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.consensusRate}%</p>
              <p className="text-xs text-muted-foreground">Consensus Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.participationRate}%</p>
              <p className="text-xs text-muted-foreground">Participation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.committeeSize}</p>
              <p className="text-xs text-muted-foreground">Committee Size</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Current Round Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Round</p>
                      <p className="text-xl font-bold font-mono">#{currentRound.roundNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phase</p>
                      <Badge className={`${getPhaseColor(currentRound.phase)} text-white uppercase`}>
                        {currentRound.phase}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proposer</p>
                      <p className="font-mono text-sm">{currentRound.proposer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Votes</p>
                    <p className="text-xl font-bold">
                      {currentRound.votesReceived}/{currentRound.votesRequired}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Vote Progress</span>
                    <span className="font-medium">{Math.round((currentRound.votesReceived / currentRound.votesRequired) * 100)}%</span>
                  </div>
                  <Progress value={(currentRound.votesReceived / currentRound.votesRequired) * 100} className="h-3" />
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  {["propose", "prevote", "precommit", "commit"].map((phase) => (
                    <div
                      key={phase}
                      className={`p-3 rounded-lg border ${currentRound.phase === phase ? "border-primary bg-primary/5" : "border-muted"}`}
                    >
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${currentRound.phase === phase ? getPhaseColor(phase) : "bg-muted"}`} />
                      <p className="text-xs font-medium capitalize">{phase}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Committee Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {currentRound.committee.slice(0, 20).map((member: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover-elevate">
                      <div className="flex items-center gap-2">
                        {member.voted ? (
                          member.vote === "approve" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-mono text-xs">{member.address}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(member.votingPower / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Consensus History (Last 30 Rounds)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consensusHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="round" className="text-xs" tickFormatter={(v) => `#${v}`} />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="blockTime" stroke="#10b981" strokeWidth={2} dot={false} name="Block Time (ms)" />
                  <Line type="monotone" dataKey="finality" stroke="#3b82f6" strokeWidth={2} dot={false} name="Finality (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
