import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, CheckCircle2, XCircle, Clock, 
  Eye, FileCheck, Slash, ChevronLeft, ChevronRight,
  Server, Cpu, HardDrive, Wifi, TrendingUp, History,
  Calculator, Award, Activity, AlertTriangle, BarChart3, Coins
} from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { queryClient } from "@/lib/queryClient";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts";

interface ValidatorApplication {
  id: string;
  applicant_member_id: string;
  applicant_address: string;
  applicant_name: string;
  application_type: string;
  requested_tier: string;
  proposed_commission: number;
  proposed_stake: string;
  stake_source: string;
  hardware_specs: any;
  network_endpoints: any;
  geographic_location: any;
  documents: any[];
  status: string;
  review_notes: string | null;
  rejection_reason: string | null;
  approval_conditions: any;
  submitted_at: string;
  review_started_at: string | null;
  decided_at: string | null;
}

interface ApplicationsResponse {
  applications: ValidatorApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SlashingRecord {
  id: string;
  validator_address: string;
  slash_type: string;
  slash_amount: string;
  reason: string;
  evidence: any;
  executed_by: string;
  executed_at: string;
  status: string;
}

interface ValidatorPerformance {
  address: string;
  name: string;
  tier: string;
  stake: string;
  uptime: number;
  blocksProduced: number;
  missedBlocks: number;
  averageBlockTime: number;
  rewardsEarned: string;
  performanceScore: number;
}

const TIER_CONFIG = {
  tier_1: { name: "Tier 1 - Active Committee", maxValidators: 512, minStake: 200000, targetApy: 8, poolShare: 50 },
  tier_2: { name: "Tier 2 - Standby", maxValidators: 4488, minStake: 50000, targetApy: 4, poolShare: 30 },
  tier_3: { name: "Tier 3 - Delegators", maxValidators: 1000000, minStake: 100, targetApy: 5, poolShare: 20 },
};

const DAILY_EMISSION = 5000;
const BURN_RATE = 0.20;
const NET_DAILY_EMISSION = DAILY_EMISSION * (1 - BURN_RATE);

export default function OperatorValidators() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminPassword();
  const [activeTab, setActiveTab] = useState("applications");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<ValidatorApplication | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showSlashDialog, setShowSlashDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [slashData, setSlashData] = useState({
    address: "",
    slashType: "downtime",
    amount: "",
    reason: "",
  });

  const [calcStake, setCalcStake] = useState<number>(100000);
  const [calcTier, setCalcTier] = useState<string>("tier_1");
  const [selectedValidator, setSelectedValidator] = useState<ValidatorPerformance | null>(null);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (statusFilter !== "all") params.set("status", statusFilter);
    return params.toString();
  };

  const { data, isLoading, error } = useQuery<ApplicationsResponse>({
    queryKey: ["/api/operator/validator-applications", page, statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/operator/validator-applications?${buildQueryString()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes, reason }: { id: string; status: string; notes?: string; reason?: string }) => {
      const response = await fetch(`/api/operator/validator-applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          status,
          reviewNotes: notes,
          rejectionReason: reason,
        }),
      });
      if (!response.ok) throw new Error("Failed to update application");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Application updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/validator-applications"] });
      setShowReviewDialog(false);
      setSelectedApp(null);
      setReviewNotes("");
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update application", description: error.message, variant: "destructive" });
    },
  });

  const slashMutation = useMutation({
    mutationFn: async ({ address, slashType, amount, reason }: typeof slashData) => {
      const response = await fetch(`/api/operator/validators/${address}/slash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ slashType, amount, reason }),
      });
      if (!response.ok) throw new Error("Failed to slash validator");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Validator slashed successfully" });
      setShowSlashDialog(false);
      setSlashData({ address: "", slashType: "downtime", amount: "", reason: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/slashing-history"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to slash validator", description: error.message, variant: "destructive" });
    },
  });

  const { data: slashingHistory } = useQuery<SlashingRecord[]>({
    queryKey: ["/api/operator/slashing-history"],
    queryFn: async () => {
      const response = await fetch("/api/operator/slashing-history", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: activeTab === "slashing",
  });

  const { data: validatorPerformance } = useQuery<ValidatorPerformance[]>({
    queryKey: ["/api/operator/validator-performance"],
    queryFn: async () => {
      const response = await fetch("/api/operator/validator-performance", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: activeTab === "performance",
  });

  const performanceChartData = useMemo(() => {
    if (!validatorPerformance) return [];
    return validatorPerformance.slice(0, 20).map((v) => ({
      name: v.name.slice(0, 8),
      uptime: v.uptime,
      score: v.performanceScore,
      blocks: v.blocksProduced,
    }));
  }, [validatorPerformance]);

  const rewardCalculation = useMemo(() => {
    const tierConfig = TIER_CONFIG[calcTier as keyof typeof TIER_CONFIG];
    if (!tierConfig) return null;

    const tierPoolShare = tierConfig.poolShare / 100;
    const dailyTierPool = NET_DAILY_EMISSION * tierPoolShare;
    
    const estimatedValidatorsInTier = calcTier === "tier_1" ? 400 : calcTier === "tier_2" ? 2000 : 50000;
    const averageStakeInTier = calcTier === "tier_1" ? 300000 : calcTier === "tier_2" ? 80000 : 500;
    const totalTierStake = estimatedValidatorsInTier * averageStakeInTier;
    
    const stakeShare = calcStake / (totalTierStake + calcStake);
    const dailyReward = dailyTierPool * stakeShare;
    const monthlyReward = dailyReward * 30;
    const yearlyReward = dailyReward * 365;
    const effectiveApy = (yearlyReward / calcStake) * 100;

    return {
      tierName: tierConfig.name,
      minStake: tierConfig.minStake,
      targetApy: tierConfig.targetApy,
      dailyReward: dailyReward.toFixed(4),
      monthlyReward: monthlyReward.toFixed(2),
      yearlyReward: yearlyReward.toFixed(2),
      effectiveApy: effectiveApy.toFixed(2),
      dailyTierPool: dailyTierPool.toFixed(2),
      stakeShare: (stakeShare * 100).toFixed(4),
    };
  }, [calcStake, calcTier]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected": return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "under_review": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "tier_1": return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Tier 1</Badge>;
      case "tier_2": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Tier 2</Badge>;
      case "tier_3": return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Tier 3</Badge>;
      default: return <Badge variant="outline">{tier}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Validator Operations</h1>
          <p className="text-muted-foreground">
            Review applications, manage validators, and enforce slashing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => setShowSlashDialog(true)} data-testid="btn-slash-validator">
            <Slash className="h-4 w-4 mr-2" />
            Slash Validator
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="tabs-validators">
        <TabsList className="grid w-full grid-cols-4" data-testid="tablist-validators">
          <TabsTrigger value="applications" data-testid="tab-applications">
            <FileCheck className="h-4 w-4 mr-2" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="slashing" data-testid="tab-slashing">
            <History className="h-4 w-4 mr-2" />
            Slashing History
          </TabsTrigger>
          <TabsTrigger value="calculator" data-testid="tab-calculator">
            <Calculator className="h-4 w-4 mr-2" />
            Reward Calculator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card data-testid="card-pending-apps">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.applications?.filter(a => a.status === 'pending').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-under-review">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Under Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.applications?.filter(a => a.status === 'under_review').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-approved-month">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Approved This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.applications?.filter(a => a.status === 'approved').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Validator Applications</CardTitle>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40" data-testid="select-app-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Requested Tier</TableHead>
                <TableHead>Stake</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.applications?.map((app) => (
                <TableRow key={app.id} data-testid={`row-app-${app.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.applicant_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {app.applicant_address.slice(0, 8)}...{app.applicant_address.slice(-6)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getTierBadge(app.requested_tier)}</TableCell>
                  <TableCell className="font-mono">{app.proposed_stake} TBURN</TableCell>
                  <TableCell>{app.proposed_commission / 100}%</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewNotes(app.review_notes || "");
                        }}
                        data-testid={`btn-view-app-${app.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(app.status === "pending" || app.status === "under_review") && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowReviewDialog(true);
                            setReviewNotes(app.review_notes || "");
                          }}
                          data-testid={`btn-review-app-${app.id}`}
                        >
                          <FileCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.applications || data.applications.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-total-validators">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Validators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validatorPerformance?.length || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-avg-uptime">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {validatorPerformance?.length 
                    ? (validatorPerformance.reduce((sum, v) => sum + v.uptime, 0) / validatorPerformance.length).toFixed(1) 
                    : '--'}%
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-total-blocks">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Blocks Produced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {validatorPerformance?.reduce((sum, v) => sum + v.blocksProduced, 0)?.toLocaleString() || '--'}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-total-rewards">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Rewards Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">
                  {validatorPerformance?.reduce((sum, v) => sum + parseFloat(v.rewardsEarned), 0)?.toFixed(2) || '--'} TBURN
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-performance-chart">
            <CardHeader>
              <CardTitle>Validator Performance Overview</CardTitle>
              <CardDescription>Top 20 validators by performance score</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="uptime" name="Uptime %" fill="hsl(var(--primary))" />
                  <Bar dataKey="score" name="Score" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Stake</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Blocks</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Rewards</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatorPerformance?.slice(0, 20).map((v, idx) => (
                    <TableRow 
                      key={v.address} 
                      data-testid={`row-perf-${idx}`}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedValidator(v)}
                    >
                      <TableCell className="font-bold">#{idx + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{v.address.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(v.tier)}</TableCell>
                      <TableCell className="font-mono">{parseFloat(v.stake).toLocaleString()} TBURN</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={v.uptime} className="w-16 h-2" />
                          <span className="text-sm">{v.uptime}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{v.blocksProduced.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={v.performanceScore >= 95 ? "default" : v.performanceScore >= 85 ? "secondary" : "outline"}>
                          {v.performanceScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-amber-500">{parseFloat(v.rewardsEarned).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {(!validatorPerformance || validatorPerformance.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No performance data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slashing" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card data-testid="card-total-slashes">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Slashing Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{slashingHistory?.length || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-total-slashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total TBURN Slashed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {slashingHistory?.reduce((sum, s) => sum + parseFloat(s.slash_amount || '0'), 0)?.toLocaleString() || '0'} TBURN
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-pending-slashes">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {slashingHistory?.filter(s => s.status === 'pending').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Slashing History</CardTitle>
              <CardDescription>Record of all validator slashing events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Executed By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slashingHistory?.map((slash) => (
                    <TableRow key={slash.id} data-testid={`row-slash-${slash.id}`}>
                      <TableCell className="text-sm">
                        {new Date(slash.executed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {slash.validator_address.slice(0, 8)}...{slash.validator_address.slice(-6)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {slash.slash_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-red-500">-{slash.slash_amount} TBURN</TableCell>
                      <TableCell className="max-w-[200px] truncate">{slash.reason}</TableCell>
                      <TableCell>{slash.executed_by}</TableCell>
                      <TableCell>
                        <Badge variant={slash.status === 'executed' ? 'default' : 'secondary'}>
                          {slash.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!slashingHistory || slashingHistory.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No slashing records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-reward-calculator">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Reward Calculator
                </CardTitle>
                <CardDescription>
                  Estimate your validator rewards based on stake and tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Tier</label>
                  <Select value={calcTier} onValueChange={setCalcTier}>
                    <SelectTrigger data-testid="select-calc-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier_1">Tier 1 - Active Committee (200K+ TBURN)</SelectItem>
                      <SelectItem value="tier_2">Tier 2 - Standby (50K+ TBURN)</SelectItem>
                      <SelectItem value="tier_3">Tier 3 - Delegators (100+ TBURN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Stake Amount: {calcStake.toLocaleString()} TBURN</label>
                  <Slider
                    value={[calcStake]}
                    onValueChange={([v]) => setCalcStake(v)}
                    min={100}
                    max={500000}
                    step={1000}
                    data-testid="slider-stake"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>100 TBURN</span>
                    <span>500,000 TBURN</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Tier Requirements</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Min Stake:</div>
                    <div className="font-mono">{rewardCalculation?.minStake.toLocaleString()} TBURN</div>
                    <div className="text-muted-foreground">Target APY:</div>
                    <div className="font-medium text-green-500">{rewardCalculation?.targetApy}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-estimated-rewards">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Estimated Rewards
                </CardTitle>
                <CardDescription>
                  Based on current network parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Daily Reward</div>
                  <div className="text-3xl font-bold text-amber-500">{rewardCalculation?.dailyReward} TBURN</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Monthly</div>
                    <div className="text-xl font-bold">{rewardCalculation?.monthlyReward} TBURN</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Yearly</div>
                    <div className="text-xl font-bold">{rewardCalculation?.yearlyReward} TBURN</div>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">Effective APY</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{rewardCalculation?.effectiveApy}%</div>
                </div>

                <div className="pt-4 border-t text-sm">
                  <h4 className="font-medium mb-2">Calculation Details</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Daily Tier Pool:</span>
                      <span className="font-mono">{rewardCalculation?.dailyTierPool} TBURN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Pool Share:</span>
                      <span className="font-mono">{rewardCalculation?.stakeShare}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Emission:</span>
                      <span className="font-mono">{DAILY_EMISSION.toLocaleString()} TBURN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Burn Rate:</span>
                      <span className="font-mono">{BURN_RATE * 100}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Daily Emission:</span>
                      <span className="font-mono">{NET_DAILY_EMISSION.toLocaleString()} TBURN</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tier Comparison</CardTitle>
              <CardDescription>Compare reward structures across all validator tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>Max Validators</TableHead>
                    <TableHead>Min Stake</TableHead>
                    <TableHead>Target APY</TableHead>
                    <TableHead>Pool Share</TableHead>
                    <TableHead>Daily Pool</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(TIER_CONFIG).map(([key, config]) => (
                    <TableRow key={key} data-testid={`row-tier-${key}`}>
                      <TableCell>{getTierBadge(key)}</TableCell>
                      <TableCell>{config.maxValidators.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{config.minStake.toLocaleString()} TBURN</TableCell>
                      <TableCell className="text-green-500 font-bold">{config.targetApy}%</TableCell>
                      <TableCell>{config.poolShare}%</TableCell>
                      <TableCell className="font-mono">{(NET_DAILY_EMISSION * config.poolShare / 100).toFixed(0)} TBURN</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp && !showReviewDialog} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApp?.applicant_name} - {selectedApp?.applicant_address}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="hardware">Hardware</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Application Type</p>
                    <p className="font-medium capitalize">{selectedApp.application_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Tier</p>
                    {getTierBadge(selectedApp.requested_tier)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proposed Stake</p>
                    <p className="font-medium font-mono">{selectedApp.proposed_stake} TBURN</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commission Rate</p>
                    <p className="font-medium">{selectedApp.proposed_commission / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stake Source</p>
                    <p className="font-medium capitalize">{selectedApp.stake_source}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                </div>

                {selectedApp.review_notes && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Review Notes</p>
                    <p className="text-sm">{selectedApp.review_notes}</p>
                  </div>
                )}

                {selectedApp.rejection_reason && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive mb-1">Rejection Reason</p>
                    <p className="text-sm">{selectedApp.rejection_reason}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hardware" className="space-y-4">
                {selectedApp.hardware_specs ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        CPU: {selectedApp.hardware_specs.cpu || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        RAM: {selectedApp.hardware_specs.ram || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Storage: {selectedApp.hardware_specs.storage || "Not specified"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hardware specs provided</p>
                )}
              </TabsContent>

              <TabsContent value="network" className="space-y-4">
                {selectedApp.network_endpoints ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">
                        {selectedApp.network_endpoints.p2p || "No P2P endpoint"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No network endpoints provided</p>
                )}

                {selectedApp.geographic_location && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Geographic Location</p>
                    <p className="text-sm">
                      {selectedApp.geographic_location.country || "Unknown"}, {selectedApp.geographic_location.region || ""}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            {selectedApp && (selectedApp.status === "pending" || selectedApp.status === "under_review") && (
              <Button onClick={() => setShowReviewDialog(true)} data-testid="btn-start-review">
                <FileCheck className="h-4 w-4 mr-2" />
                Review Application
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              {selectedApp?.applicant_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Review Notes</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this application..."
                className="mt-1"
                data-testid="input-review-notes"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Required if rejecting the application..."
                className="mt-1"
                data-testid="input-rejection-reason"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedApp) {
                  reviewMutation.mutate({
                    id: selectedApp.id,
                    status: "under_review",
                    notes: reviewNotes,
                  });
                }
              }}
              disabled={reviewMutation.isPending}
              data-testid="btn-mark-reviewing"
            >
              Mark as Under Review
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedApp && rejectionReason) {
                  reviewMutation.mutate({
                    id: selectedApp.id,
                    status: "rejected",
                    notes: reviewNotes,
                    reason: rejectionReason,
                  });
                }
              }}
              disabled={reviewMutation.isPending || !rejectionReason}
              data-testid="btn-reject"
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedApp) {
                  reviewMutation.mutate({
                    id: selectedApp.id,
                    status: "approved",
                    notes: reviewNotes,
                  });
                }
              }}
              disabled={reviewMutation.isPending}
              data-testid="btn-approve"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slash Validator Dialog */}
      <Dialog open={showSlashDialog} onOpenChange={setShowSlashDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Slash Validator</DialogTitle>
            <DialogDescription>
              This action will penalize a validator and may affect their stake.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Validator Address</label>
              <Input
                value={slashData.address}
                onChange={(e) => setSlashData({ ...slashData, address: e.target.value })}
                placeholder="0x..."
                className="mt-1 font-mono"
                data-testid="input-slash-address"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Slash Type</label>
              <Select
                value={slashData.slashType}
                onValueChange={(v) => setSlashData({ ...slashData, slashType: v })}
              >
                <SelectTrigger className="mt-1" data-testid="select-slash-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downtime">Downtime</SelectItem>
                  <SelectItem value="double_sign">Double Sign</SelectItem>
                  <SelectItem value="invalid_block">Invalid Block</SelectItem>
                  <SelectItem value="consensus_violation">Consensus Violation</SelectItem>
                  <SelectItem value="security_breach">Security Breach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Slash Amount (TBURN)</label>
              <Input
                type="number"
                value={slashData.amount}
                onChange={(e) => setSlashData({ ...slashData, amount: e.target.value })}
                placeholder="1000"
                className="mt-1"
                data-testid="input-slash-amount"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                value={slashData.reason}
                onChange={(e) => setSlashData({ ...slashData, reason: e.target.value })}
                placeholder="Detailed reason for slashing..."
                className="mt-1"
                data-testid="input-slash-reason"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlashDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => slashMutation.mutate(slashData)}
              disabled={slashMutation.isPending || !slashData.address || !slashData.amount || !slashData.reason}
              data-testid="btn-confirm-slash"
            >
              <Slash className="h-4 w-4 mr-2" />
              Confirm Slash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validator Performance Detail Modal */}
      <Dialog open={!!selectedValidator} onOpenChange={() => setSelectedValidator(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Validator Details
            </DialogTitle>
            <DialogDescription>
              Detailed performance metrics and statistics
            </DialogDescription>
          </DialogHeader>

          {selectedValidator && (
            <div className="space-y-6">
              {/* Validator Identity */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedValidator.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{selectedValidator.address}</p>
                </div>
                {getTierBadge(selectedValidator.tier)}
              </div>

              {/* Performance Score */}
              <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Performance Score</p>
                <div className="text-5xl font-bold text-primary">{selectedValidator.performanceScore}</div>
                <Badge 
                  className="mt-2"
                  variant={selectedValidator.performanceScore >= 95 ? "default" : selectedValidator.performanceScore >= 85 ? "secondary" : "outline"}
                >
                  {selectedValidator.performanceScore >= 95 ? "Excellent" : selectedValidator.performanceScore >= 85 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3 w-3" /> Stake
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold font-mono">{parseFloat(selectedValidator.stake).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">TBURN</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Uptime
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">{selectedValidator.uptime}%</p>
                    <Progress value={selectedValidator.uptime} className="h-1 mt-1" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> Blocks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">{selectedValidator.blocksProduced.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">produced</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                      <Award className="h-3 w-3" /> Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-amber-500">{parseFloat(selectedValidator.rewardsEarned).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">TBURN earned</p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Additional Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Missed Blocks</p>
                    <p className="text-xl font-bold text-red-500">{selectedValidator.missedBlocks.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Block Time</p>
                    <p className="text-xl font-bold">{selectedValidator.averageBlockTime.toFixed(2)}s</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Block Success Rate</p>
                    <p className="text-xl font-bold text-green-500">
                      {((selectedValidator.blocksProduced / (selectedValidator.blocksProduced + selectedValidator.missedBlocks)) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tier</p>
                    <p className="text-xl font-bold capitalize">{selectedValidator.tier.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Tier Information */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Tier Requirements
                </h4>
                {selectedValidator.tier === 'tier_1' && (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Min Stake:</span> 200,000 TBURN</p>
                    <p><span className="text-muted-foreground">Target APY:</span> 8%</p>
                    <p><span className="text-muted-foreground">Pool Share:</span> 50%</p>
                    <p><span className="text-muted-foreground">Max Validators:</span> 512</p>
                  </div>
                )}
                {selectedValidator.tier === 'tier_2' && (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Min Stake:</span> 50,000 TBURN</p>
                    <p><span className="text-muted-foreground">Target APY:</span> 4%</p>
                    <p><span className="text-muted-foreground">Pool Share:</span> 30%</p>
                    <p><span className="text-muted-foreground">Max Validators:</span> 4,488</p>
                  </div>
                )}
                {selectedValidator.tier === 'tier_3' && (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Min Stake:</span> 100 TBURN</p>
                    <p><span className="text-muted-foreground">Target APY:</span> 5%</p>
                    <p><span className="text-muted-foreground">Pool Share:</span> 20%</p>
                    <p><span className="text-muted-foreground">Max Validators:</span> Unlimited</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedValidator(null)} data-testid="btn-close-validator-detail">
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedValidator) {
                  setSlashData({ ...slashData, address: selectedValidator.address });
                  setSelectedValidator(null);
                  setShowSlashDialog(true);
                }
              }}
              data-testid="btn-slash-from-detail"
            >
              <Slash className="h-4 w-4 mr-2" />
              Slash Validator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
