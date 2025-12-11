import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatAddress } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Vote,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Users,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from "recharts";

interface VotingData {
  time: string;
  for: number;
  against: number;
  abstain: number;
}

interface VoterRecord {
  address: string;
  vote: "for" | "against" | "abstain";
  power: number;
  timestamp: string;
}

interface VotingStats {
  totalVotes: number;
  forPercentage: number;
  againstPercentage: number;
  abstainPercentage: number;
  quorumPercentage: number;
  votersCount: number;
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading,
  bgColor = "bg-primary/10",
  iconColor = "text-primary",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId: string;
}) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground"
  };

  if (isLoading) {
    return (
      <Card data-testid={testId}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeColors[changeType]}`}>{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function VotingMonitor() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [selectedProposal, setSelectedProposal] = useState("TIP-001");
  const [timeRange, setTimeRange] = useState("24h");
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<VoterRecord | null>(null);

  const { data, isLoading, error, refetch } = useQuery<VotingStats>({
    queryKey: ['/api/enterprise/admin/governance/votes', `proposalId=${selectedProposal}`],
    refetchInterval: 10000,
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", channel: "voting" }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "vote_cast" || message.type === "voting_update") {
          queryClient.invalidateQueries({ queryKey: ['/api/enterprise/admin/governance/votes'] });
        }
      } catch (e) {
        console.error("WebSocket message parse error:", e);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const castVoteMutation = useMutation({
    mutationFn: async (voteData: { proposalId: string; vote: string }) => {
      const response = await apiRequest("POST", "/api/enterprise/admin/governance/votes", voteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/admin/governance/votes'] });
      toast({
        title: t("adminVoting.voteCast"),
        description: t("adminVoting.voteCastDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminVoting.error"),
        description: t("adminVoting.voteError"),
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminVoting.refreshed"),
      description: t("adminVoting.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = recentVoters;
    const csvContent = [
      ["Address", "Vote", "Voting Power", "Timestamp"].join(","),
      ...exportData.map(v => [
        v.address,
        v.vote,
        v.power,
        v.timestamp
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voting_export_${selectedProposal}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t("adminVoting.exported"),
      description: t("adminVoting.exportedDesc"),
    });
  }, [selectedProposal, toast, t]);

  const votingTrend: VotingData[] = [
    { time: "00:00", for: 120000000, against: 8000000, abstain: 2000000 },
    { time: "04:00", for: 280000000, against: 10000000, abstain: 4000000 },
    { time: "08:00", for: 450000000, against: 11000000, abstain: 5000000 },
    { time: "12:00", for: 620000000, against: 11500000, abstain: 6000000 },
    { time: "16:00", for: 780000000, against: 12000000, abstain: 7000000 },
    { time: "20:00", for: 850000000, against: 12000000, abstain: 8000000 },
  ];

  const voteDistribution = [
    { name: t("adminVoting.for"), value: 850000000, color: "#22c55e" },
    { name: t("adminVoting.against"), value: 12000000, color: "#ef4444" },
    { name: t("adminVoting.abstain"), value: 8000000, color: "#94a3b8" },
  ];

  const recentVoters: VoterRecord[] = [
    { address: "0xTBURN_Validator_Pool_Alpha_001", vote: "for", power: 25000000, timestamp: "2024-12-07 23:55:00" },
    { address: "0xTBURN_Staking_DAO_Treasury_01", vote: "for", power: 18500000, timestamp: "2024-12-07 23:50:00" },
    { address: "0xTBURN_Foundation_Reserve_Main", vote: "for", power: 15000000, timestamp: "2024-12-07 23:45:00" },
    { address: "0xTBURN_Enterprise_Partner_A01", vote: "for", power: 8500000, timestamp: "2024-12-07 23:40:00" },
    { address: "0xTBURN_Community_Pool_Voting", vote: "for", power: 5200000, timestamp: "2024-12-07 23:35:00" },
    { address: "0xTBURN_DeFi_Protocol_Partner", vote: "for", power: 3800000, timestamp: "2024-12-07 23:30:00" },
    { address: "0xTBURN_Institutional_Investor", vote: "for", power: 2500000, timestamp: "2024-12-07 23:25:00" },
  ];

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case "for":
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case "against":
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case "abstain":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case "for":
        return "bg-green-500";
      case "against":
        return "bg-red-500";
      case "abstain":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const totalVotes = voteDistribution.reduce((sum, v) => sum + v.value, 0);
  const forPercentage = (voteDistribution[0].value / totalVotes) * 100;
  const quorum = 10000000;
  const quorumPercentage = (totalVotes / quorum) * 100;

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="voting-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("adminVoting.loadError")}</span>
              </div>
              <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminVoting.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="voting-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-voting-title">
              <Vote className="h-8 w-8" />
              {t("adminVoting.title")}
              {wsConnected && (
                <Badge variant="outline" className="ml-2 text-green-500 border-green-500" data-testid="badge-ws-connected">
                  <Activity className="h-3 w-3 mr-1" />
                  {t("adminVoting.live")}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground" data-testid="text-voting-subtitle">
              {t("adminVoting.subtitleKo")} | {t("adminVoting.subtitleEn")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedProposal} onValueChange={setSelectedProposal}>
              <SelectTrigger className="w-[200px]" data-testid="select-proposal">
                <SelectValue placeholder={t("adminVoting.selectProposal")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIP-001">TIP-001: Increase Block Gas</SelectItem>
                <SelectItem value="TIP-003">TIP-003: Add Solana Bridge</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminVoting.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminVoting.refresh")}
            </Button>
          </div>
        </div>

        <Card data-testid="card-proposal-status">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <Badge variant="outline" className="mb-2" data-testid="badge-proposal-id">{selectedProposal}</Badge>
                <CardTitle data-testid="text-proposal-title">{t("adminVoting.increaseBlockGas")}</CardTitle>
                <CardDescription data-testid="text-proposal-description">
                  {t("adminVoting.increaseBlockGasDesc")}
                </CardDescription>
              </div>
              <Badge className="bg-blue-500" data-testid="badge-active-voting">{t("adminVoting.activeVoting")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg" data-testid="card-votes-for">
                  <div className="flex items-center gap-2 text-green-500">
                    <ThumbsUp className="h-5 w-5" />
                    <span className="font-medium">{t("adminVoting.for")}</span>
                  </div>
                  <p className="text-2xl font-bold mt-2" data-testid="text-for-percentage">97.7%</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-for-amount">850M TBURN</p>
                </div>
                <div className="p-4 border rounded-lg" data-testid="card-votes-against">
                  <div className="flex items-center gap-2 text-red-500">
                    <ThumbsDown className="h-5 w-5" />
                    <span className="font-medium">{t("adminVoting.against")}</span>
                  </div>
                  <p className="text-2xl font-bold mt-2" data-testid="text-against-percentage">1.4%</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-against-amount">12M TBURN</p>
                </div>
                <div className="p-4 border rounded-lg" data-testid="card-votes-abstain">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Minus className="h-5 w-5" />
                    <span className="font-medium">{t("adminVoting.abstain")}</span>
                  </div>
                  <p className="text-2xl font-bold mt-2" data-testid="text-abstain-percentage">0.9%</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-abstain-amount">8M TBURN</p>
                </div>
                <div className="p-4 border rounded-lg" data-testid="card-quorum">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{t("adminVoting.quorum")}</span>
                  </div>
                  <p className="text-2xl font-bold mt-2 text-green-500" data-testid="text-quorum-percentage">
                    174.0%
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-quorum-amount">870M / 500M Required</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("adminVoting.votingProgress")}</span>
                <span data-testid="text-approval-status">{forPercentage.toFixed(1)}% {t("adminVoting.approval")} (66% {t("adminVoting.required")})</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-muted" data-testid="progress-voting">
                <div 
                  className="bg-green-500 transition-all" 
                  style={{ width: `${(voteDistribution[0].value / totalVotes) * 100}%` }}
                />
                <div 
                  className="bg-red-500 transition-all" 
                  style={{ width: `${(voteDistribution[1].value / totalVotes) * 100}%` }}
                />
                <div 
                  className="bg-gray-400 transition-all" 
                  style={{ width: `${(voteDistribution[2].value / totalVotes) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 text-green-500" data-testid="text-remaining-time">
                <CheckCircle className="h-4 w-4" />
                Voting Complete - Executed
              </span>
              <span className="flex items-center gap-1" data-testid="text-voters-count">
                <Users className="h-4 w-4" />
                4,847 {t("adminVoting.voters")}
              </span>
              <span className="flex items-center gap-1" data-testid="text-end-date">
                <Calendar className="h-4 w-4" />
                Executed: Dec 2, 2024
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-voting-trend">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t("adminVoting.votingTrend")}
              </CardTitle>
              <CardDescription>{t("adminVoting.votingTrendDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={votingTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))" 
                        }}
                        formatter={(value: number) => `${(value / 1000000).toFixed(2)}M TBURN`}
                      />
                      <Area type="monotone" dataKey="for" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="against" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="abstain" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-vote-distribution">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {t("adminVoting.voteDistribution")}
              </CardTitle>
              <CardDescription>{t("adminVoting.voteDistributionDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={voteDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {voteDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))" 
                        }}
                        formatter={(value: number) => `${(value / 1000000).toFixed(2)}M TBURN`}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-recent-votes">
          <CardHeader>
            <CardTitle>{t("adminVoting.recentVotes")}</CardTitle>
            <CardDescription>{t("adminVoting.recentVotesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminVoting.voter")}</TableHead>
                    <TableHead>{t("adminVoting.vote")}</TableHead>
                    <TableHead>{t("adminVoting.votingPower")}</TableHead>
                    <TableHead>{t("adminVoting.timestamp")}</TableHead>
                    <TableHead>{t("adminVoting.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVoters.map((voter, index) => (
                    <TableRow key={index} data-testid={`row-voter-${index}`}>
                      <TableCell className="font-mono" data-testid={`text-voter-address-${index}`}>{voter.address}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getVoteIcon(voter.vote)}
                          <Badge className={getVoteColor(voter.vote)} data-testid={`badge-vote-${index}`}>{voter.vote}</Badge>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-voting-power-${index}`}>{(voter.power / 1000).toFixed(1)}K TBURN</TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-vote-timestamp-${index}`}>{voter.timestamp}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedVoter(voter)}
                          data-testid={`button-view-voter-${index}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-voting-insights">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("adminVoting.votingInsights")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10" data-testid="insight-quorum-reached">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{t("adminVoting.quorumReached")}</p>
                <p className="text-sm text-muted-foreground">{t("adminVoting.quorumReachedDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10" data-testid="insight-passing-threshold">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{t("adminVoting.passingThresholdMet")}</p>
                <p className="text-sm text-muted-foreground">{t("adminVoting.passingThresholdMetDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-500/10" data-testid="insight-ai-prediction">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{t("adminVoting.aiPrediction")}</p>
                <p className="text-sm text-muted-foreground">{t("adminVoting.aiPredictionDesc")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DetailSheet
        open={!!selectedVoter}
        onOpenChange={(open) => !open && setSelectedVoter(null)}
        title={t("adminVoting.detail.title")}
        sections={selectedVoter ? [
          {
            title: t("adminVoting.detail.voterInfo"),
            fields: [
              { label: t("adminVoting.detail.address"), value: formatAddress(selectedVoter.address), copyable: true, copyValue: selectedVoter.address },
              { label: t("adminVoting.detail.vote"), value: selectedVoter.vote, type: "badge" as const, badgeVariant: selectedVoter.vote === "for" ? "default" as const : selectedVoter.vote === "against" ? "destructive" as const : "secondary" as const },
            ],
          },
          {
            title: t("adminVoting.detail.votingDetails"),
            fields: [
              { label: t("adminVoting.detail.votingPower"), value: `${(selectedVoter.power / 1000).toFixed(1)}K TBURN` },
              { label: t("adminVoting.detail.timestamp"), value: selectedVoter.timestamp },
              { label: t("adminVoting.detail.proposal"), value: selectedProposal },
            ],
          },
        ] : []}
      />
    </div>
  );
}
