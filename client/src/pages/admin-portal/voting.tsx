import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
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

export default function VotingMonitor() {
  const [selectedProposal, setSelectedProposal] = useState("TIP-001");
  const [timeRange, setTimeRange] = useState("24h");

  const votingTrend: VotingData[] = [
    { time: "00:00", for: 2000000, against: 500000, abstain: 100000 },
    { time: "04:00", for: 3500000, against: 1000000, abstain: 200000 },
    { time: "08:00", for: 5000000, against: 1500000, abstain: 300000 },
    { time: "12:00", for: 6500000, against: 1800000, abstain: 350000 },
    { time: "16:00", for: 7500000, against: 2000000, abstain: 380000 },
    { time: "20:00", for: 8500000, against: 2100000, abstain: 400000 },
  ];

  const voteDistribution = [
    { name: "For", value: 8500000, color: "#22c55e" },
    { name: "Against", value: 2100000, color: "#ef4444" },
    { name: "Abstain", value: 400000, color: "#94a3b8" },
  ];

  const recentVoters: VoterRecord[] = [
    { address: "0x1234...5678", vote: "for", power: 150000, timestamp: "2024-12-04 14:45:00" },
    { address: "0xabcd...efgh", vote: "against", power: 85000, timestamp: "2024-12-04 14:42:00" },
    { address: "0x9876...5432", vote: "for", power: 320000, timestamp: "2024-12-04 14:38:00" },
    { address: "0xdead...beef", vote: "abstain", power: 45000, timestamp: "2024-12-04 14:35:00" },
    { address: "0xface...cafe", vote: "for", power: 210000, timestamp: "2024-12-04 14:30:00" },
    { address: "0x5555...6666", vote: "for", power: 175000, timestamp: "2024-12-04 14:25:00" },
    { address: "0x7777...8888", vote: "against", power: 95000, timestamp: "2024-12-04 14:20:00" },
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Vote className="h-8 w-8" />
              Voting Monitor
            </h1>
            <p className="text-muted-foreground">투표 모니터링 | Real-time voting status and analytics</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedProposal} onValueChange={setSelectedProposal}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select proposal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIP-001">TIP-001: Increase Block Gas</SelectItem>
                <SelectItem value="TIP-003">TIP-003: Add Solana Bridge</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Current Proposal Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="mb-2">{selectedProposal}</Badge>
                <CardTitle>Increase Block Gas Limit to 30M</CardTitle>
                <CardDescription>
                  Proposal to increase the block gas limit from 20M to 30M
                </CardDescription>
              </div>
              <Badge className="bg-blue-500">Active Voting</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-green-500">
                  <ThumbsUp className="h-5 w-5" />
                  <span className="font-medium">For</span>
                </div>
                <p className="text-2xl font-bold mt-2">77.3%</p>
                <p className="text-sm text-muted-foreground">8.5M TBURN</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-red-500">
                  <ThumbsDown className="h-5 w-5" />
                  <span className="font-medium">Against</span>
                </div>
                <p className="text-2xl font-bold mt-2">19.1%</p>
                <p className="text-sm text-muted-foreground">2.1M TBURN</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Minus className="h-5 w-5" />
                  <span className="font-medium">Abstain</span>
                </div>
                <p className="text-2xl font-bold mt-2">3.6%</p>
                <p className="text-sm text-muted-foreground">0.4M TBURN</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Quorum</span>
                </div>
                <p className={`text-2xl font-bold mt-2 ${quorumPercentage >= 100 ? "text-green-500" : "text-yellow-500"}`}>
                  {quorumPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">{(totalVotes / 1000000).toFixed(1)}M / 10M</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Voting Progress</span>
                <span>{forPercentage.toFixed(1)}% approval (66% required)</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
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

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                4 days remaining
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                1,247 voters
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Ends: Dec 8, 2024
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Voting Trend
              </CardTitle>
              <CardDescription>Vote accumulation over time</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Vote Distribution
              </CardTitle>
              <CardDescription>Current vote breakdown</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Recent Voters */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Votes</CardTitle>
            <CardDescription>Latest voting activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voter</TableHead>
                  <TableHead>Vote</TableHead>
                  <TableHead>Voting Power</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVoters.map((voter, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{voter.address}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVoteIcon(voter.vote)}
                        <Badge className={getVoteColor(voter.vote)}>{voter.vote}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{(voter.power / 1000).toFixed(1)}K TBURN</TableCell>
                    <TableCell className="text-muted-foreground">{voter.timestamp}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Voting Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Voting Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Quorum Reached</p>
                <p className="text-sm text-muted-foreground">Minimum participation threshold has been met</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Passing Threshold Met</p>
                <p className="text-sm text-muted-foreground">Current approval rate (77.3%) exceeds required 66%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-500/10">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">AI Prediction</p>
                <p className="text-sm text-muted-foreground">95% probability of passing based on current trajectory</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
