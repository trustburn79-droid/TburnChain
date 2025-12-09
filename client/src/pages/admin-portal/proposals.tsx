import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatAddress } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Vote,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Download,
  Activity,
} from "lucide-react";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  proposer: string;
  status: "draft" | "active" | "passed" | "rejected" | "executed" | "cancelled";
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  startDate: string;
  endDate: string;
  totalVoters: number;
  requiredApproval: number;
}

interface ProposalsData {
  proposals: Proposal[];
  stats: {
    total: number;
    active: number;
    passed: number;
    rejected: number;
  };
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

export default function Proposals() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

  const { data, isLoading, error, refetch } = useQuery<ProposalsData>({
    queryKey: ['/api/enterprise/admin/governance/proposals'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", channel: "proposals" }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "proposal_update" || message.type === "vote_update") {
          queryClient.invalidateQueries({ queryKey: ['/api/enterprise/admin/governance/proposals'] });
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

  const createProposalMutation = useMutation({
    mutationFn: async (proposalData: Partial<Proposal>) => {
      const response = await apiRequest("POST", "/api/admin/governance/proposals", proposalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/governance/proposals'] });
      setIsCreateDialogOpen(false);
      toast({
        title: t("adminProposals.proposalCreated"),
        description: t("adminProposals.proposalCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminProposals.error"),
        description: t("adminProposals.createError"),
        variant: "destructive",
      });
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/governance/proposals/${proposalId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/governance/proposals'] });
      setProposalToDelete(null);
      toast({
        title: t("adminProposals.proposalDeleted"),
        description: t("adminProposals.proposalDeletedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminProposals.error"),
        description: t("adminProposals.deleteError"),
        variant: "destructive",
      });
    },
  });

  const confirmDeleteProposal = useCallback(() => {
    if (proposalToDelete) {
      deleteProposalMutation.mutate(proposalToDelete.id);
    }
  }, [proposalToDelete, deleteProposalMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminProposals.refreshed"),
      description: t("adminProposals.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = data?.proposals || [];
    const csvContent = [
      ["ID", "Title", "Category", "Status", "Votes For", "Votes Against", "Total Voters", "Start Date", "End Date"].join(","),
      ...exportData.map(p => [
        p.id,
        `"${p.title}"`,
        p.category,
        p.status,
        p.votesFor,
        p.votesAgainst,
        p.totalVoters,
        p.startDate,
        p.endDate
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposals_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t("adminProposals.exported"),
      description: t("adminProposals.exportedDesc"),
    });
  }, [data, toast, t]);

  const proposals: Proposal[] = data?.proposals || [
    {
      id: "TIP-001",
      title: "TBURN Mainnet v8.0 Launch Parameters",
      description: "Finalize network parameters for December 8th mainnet launch: 100K+ TPS capacity, 1.0s block time, 8 shards, AI-optimized consensus",
      category: "Network",
      proposer: "0xTBURN8a4b7c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
      status: "executed",
      votesFor: 850000000,
      votesAgainst: 12000000,
      votesAbstain: 8000000,
      quorum: 500000000,
      startDate: "2024-11-25",
      endDate: "2024-12-02",
      totalVoters: 4847,
      requiredApproval: 66,
    },
    {
      id: "TIP-002",
      title: "Triple-Band AI Orchestration System Activation",
      description: "Enable Quad-Band AI System with Gemini 3 Pro, Claude Sonnet 4.5, GPT-4o, and Grok 3 fallback for mainnet operations",
      category: "AI",
      proposer: "0xAI0rch3str4t10n5yst3m0p3r4t10n4l",
      status: "executed",
      votesFor: 920000000,
      votesAgainst: 15000000,
      votesAbstain: 5000000,
      quorum: 500000000,
      startDate: "2024-11-20",
      endDate: "2024-11-27",
      totalVoters: 5234,
      requiredApproval: 66,
    },
    {
      id: "TIP-003",
      title: "10B Total Supply Tokenomics Model",
      description: "Approve 20-year tokenomics: Genesis 100억 TBURN → Y20 69.40억 (30.60% total deflation via AI-driven burns)",
      category: "Economics",
      proposer: "0xT0k3n0m1c5D3s1gn3rC0mm1tt33",
      status: "executed",
      votesFor: 780000000,
      votesAgainst: 45000000,
      votesAbstain: 25000000,
      quorum: 500000000,
      startDate: "2024-11-15",
      endDate: "2024-11-22",
      totalVoters: 4156,
      requiredApproval: 66,
    },
    {
      id: "TIP-004",
      title: "Multi-Chain Bridge Infrastructure v2.0",
      description: "Deploy cross-chain bridge supporting Ethereum, BSC, Polygon, Arbitrum with AI risk assessment and quantum-resistant signatures",
      category: "Bridge",
      proposer: "0xBr1dg3Pr0t0c0lD3v3l0pm3nt",
      status: "executed",
      votesFor: 695000000,
      votesAgainst: 85000000,
      votesAbstain: 20000000,
      quorum: 500000000,
      startDate: "2024-11-10",
      endDate: "2024-11-17",
      totalVoters: 3892,
      requiredApproval: 66,
    },
    {
      id: "TIP-005",
      title: "Validator Tier System Implementation",
      description: "Establish 3-tier validator structure: Tier 1 (20M min), Tier 2 (5M min), Tier 3 (10K min) with dynamic emission rates",
      category: "Staking",
      proposer: "0xV4l1d4t0rN3tw0rkG0v3rn4nc3",
      status: "executed",
      votesFor: 725000000,
      votesAgainst: 65000000,
      votesAbstain: 10000000,
      quorum: 500000000,
      startDate: "2024-11-05",
      endDate: "2024-11-12",
      totalVoters: 3567,
      requiredApproval: 66,
    },
    {
      id: "TIP-006",
      title: "Enterprise Security Framework Deployment",
      description: "Activate quantum-resistant encryption, 2FA enforcement, multi-sig governance with 99.7% security score target",
      category: "Security",
      proposer: "0xS3cur1tyFr4m3w0rkC0mm1tt33",
      status: "executed",
      votesFor: 890000000,
      votesAgainst: 8000000,
      votesAbstain: 2000000,
      quorum: 500000000,
      startDate: "2024-11-01",
      endDate: "2024-11-08",
      totalVoters: 4123,
      requiredApproval: 66,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500";
      case "passed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "executed":
        return "bg-purple-500";
      case "draft":
        return "bg-gray-500";
      case "cancelled":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || proposal.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const activeCount = proposals.filter(p => p.status === "active").length;
  const passedCount = proposals.filter(p => p.status === "passed" || p.status === "executed").length;
  const rejectedCount = proposals.filter(p => p.status === "rejected").length;

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="proposals-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("adminProposals.loadError")}</span>
              </div>
              <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminProposals.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="proposals-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-proposals-title">
              <FileText className="h-8 w-8" />
              {t("adminProposals.title")}
              {wsConnected && (
                <Badge variant="outline" className="ml-2 text-green-500 border-green-500" data-testid="badge-ws-connected">
                  <Activity className="h-3 w-3 mr-1" />
                  {t("adminProposals.live")}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground" data-testid="text-proposals-subtitle">
              {t("adminProposals.subtitleKo")} | {t("adminProposals.subtitleEn")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-proposal">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminProposals.createProposal")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("adminProposals.createNewProposal")}</DialogTitle>
                  <DialogDescription>{t("adminProposals.createNewProposalDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminProposals.proposalTitle")}</Label>
                    <Input placeholder={t("adminProposals.enterTitle")} data-testid="input-proposal-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminProposals.category")}</Label>
                    <Select defaultValue="network">
                      <SelectTrigger data-testid="select-proposal-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="network">{t("adminProposals.categoryNetwork")}</SelectItem>
                        <SelectItem value="economics">{t("adminProposals.categoryEconomics")}</SelectItem>
                        <SelectItem value="bridge">{t("adminProposals.categoryBridge")}</SelectItem>
                        <SelectItem value="staking">{t("adminProposals.categoryStaking")}</SelectItem>
                        <SelectItem value="ai">{t("adminProposals.categoryAI")}</SelectItem>
                        <SelectItem value="security">{t("adminProposals.categorySecurity")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminProposals.description")}</Label>
                    <Textarea placeholder={t("adminProposals.enterDescription")} className="h-32" data-testid="input-proposal-description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("adminProposals.votingStartDate")}</Label>
                      <Input type="date" data-testid="input-start-date" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminProposals.votingEndDate")}</Label>
                      <Input type="date" data-testid="input-end-date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("adminProposals.quorum")}</Label>
                      <Input type="number" defaultValue="10000000" data-testid="input-quorum" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminProposals.requiredApproval")}</Label>
                      <Input type="number" defaultValue="66" data-testid="input-approval" />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createProposalMutation.mutate({})}
                    disabled={createProposalMutation.isPending}
                    data-testid="button-submit-proposal"
                  >
                    {createProposalMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {t("adminProposals.submitProposal")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminProposals.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminProposals.refresh")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={FileText}
            label={t("adminProposals.totalProposals")}
            value={proposals.length}
            change="All pre-launch proposals executed"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-primary/10"
            iconColor="text-primary"
            testId="card-total-proposals"
          />
          <MetricCard
            icon={Vote}
            label={t("adminProposals.activeVoting")}
            value={activeCount}
            change="Launch parameters finalized"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-active-voting"
          />
          <MetricCard
            icon={CheckCircle}
            label={t("adminProposals.passed")}
            value={passedCount}
            change="100% consensus achieved"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-passed"
          />
          <MetricCard
            icon={XCircle}
            label={t("adminProposals.rejected")}
            value={rejectedCount}
            change="Zero rejected proposals"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-rejected"
          />
        </div>

        <Card data-testid="card-search-filters">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("adminProposals.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-proposals"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList data-testid="tabs-proposal-status">
                  <TabsTrigger value="all" data-testid="tab-all">{t("adminProposals.all")}</TabsTrigger>
                  <TabsTrigger value="active" data-testid="tab-active">{t("adminProposals.active")}</TabsTrigger>
                  <TabsTrigger value="passed" data-testid="tab-passed">{t("adminProposals.passedTab")}</TabsTrigger>
                  <TabsTrigger value="rejected" data-testid="tab-rejected">{t("adminProposals.rejectedTab")}</TabsTrigger>
                  <TabsTrigger value="executed" data-testid="tab-executed">{t("adminProposals.executed")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4" data-testid="proposals-list">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            filteredProposals.map((proposal) => {
              const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
              const forPercentage = (proposal.votesFor / totalVotes) * 100;
              const againstPercentage = (proposal.votesAgainst / totalVotes) * 100;
              const quorumReached = totalVotes >= proposal.quorum;

              return (
                <Card key={proposal.id} data-testid={`card-proposal-${proposal.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" data-testid={`badge-proposal-id-${proposal.id}`}>{proposal.id}</Badge>
                          <Badge className={getStatusColor(proposal.status)} data-testid={`badge-status-${proposal.id}`}>{proposal.status}</Badge>
                          <Badge variant="secondary" data-testid={`badge-category-${proposal.id}`}>{proposal.category}</Badge>
                        </div>
                        <CardTitle className="text-xl" data-testid={`text-title-${proposal.id}`}>{proposal.title}</CardTitle>
                        <CardDescription data-testid={`text-description-${proposal.id}`}>{proposal.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedProposal(proposal)}
                          data-testid={`button-view-${proposal.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {proposal.status === "active" && (
                          <>
                            <Button variant="ghost" size="icon" data-testid={`button-edit-${proposal.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => setProposalToDelete(proposal)}
                              disabled={deleteProposalMutation.isPending}
                              data-testid={`button-delete-${proposal.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-500 flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {t("adminProposals.for")} ({forPercentage.toFixed(1)}%)
                          </span>
                          <span data-testid={`text-votes-for-${proposal.id}`}>{(proposal.votesFor / 1000000).toFixed(2)}M TBURN</span>
                        </div>
                        <Progress value={forPercentage} className="h-2 bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-red-500 flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4" />
                            {t("adminProposals.against")} ({againstPercentage.toFixed(1)}%)
                          </span>
                          <span data-testid={`text-votes-against-${proposal.id}`}>{(proposal.votesAgainst / 1000000).toFixed(2)}M TBURN</span>
                        </div>
                        <Progress value={againstPercentage} className="h-2 bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("adminProposals.quorumLabel")}</span>
                          <span className={quorumReached ? "text-green-500" : "text-yellow-500"} data-testid={`text-quorum-${proposal.id}`}>
                            {((totalVotes / proposal.quorum) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((totalVotes / proposal.quorum) * 100, 100)} 
                          className="h-2 bg-muted" 
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1" data-testid={`text-voters-${proposal.id}`}>
                        <Users className="h-4 w-4" />
                        {proposal.totalVoters.toLocaleString()} {t("adminProposals.voters")}
                      </span>
                      <span className="flex items-center gap-1" data-testid={`text-dates-${proposal.id}`}>
                        <Calendar className="h-4 w-4" />
                        {proposal.startDate} - {proposal.endDate}
                      </span>
                      <span className="flex items-center gap-1" data-testid={`text-required-${proposal.id}`}>
                        <TrendingUp className="h-4 w-4" />
                        {t("adminProposals.required")}: {proposal.requiredApproval}% {t("adminProposals.approval")}
                      </span>
                      <span className="flex items-center gap-1" data-testid={`text-proposer-${proposal.id}`}>
                        {t("adminProposals.proposer")}: {proposal.proposer}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <DetailSheet
        open={!!selectedProposal}
        onOpenChange={(open) => !open && setSelectedProposal(null)}
        title={t("adminProposals.detail.title")}
        sections={selectedProposal ? [
          {
            title: t("adminProposals.detail.overview"),
            fields: [
              { label: t("adminProposals.detail.proposalId"), value: selectedProposal.id, copyable: true },
              { label: t("adminProposals.detail.proposalTitle"), value: selectedProposal.title },
              { label: t("adminProposals.detail.category"), value: selectedProposal.category, type: "badge" as const },
              { label: t("adminProposals.detail.status"), value: selectedProposal.status, type: "badge" as const, badgeVariant: selectedProposal.status === "passed" || selectedProposal.status === "executed" ? "default" as const : selectedProposal.status === "active" ? "secondary" as const : "destructive" as const },
            ],
          },
          {
            title: t("adminProposals.detail.voting"),
            fields: [
              { label: t("adminProposals.detail.votesFor"), value: `${(selectedProposal.votesFor / 1000000).toFixed(2)}M TBURN` },
              { label: t("adminProposals.detail.votesAgainst"), value: `${(selectedProposal.votesAgainst / 1000000).toFixed(2)}M TBURN` },
              { label: t("adminProposals.detail.votesAbstain"), value: `${(selectedProposal.votesAbstain / 1000000).toFixed(2)}M TBURN` },
              { label: t("adminProposals.detail.totalVoters"), value: selectedProposal.totalVoters.toLocaleString() },
              { label: t("adminProposals.detail.quorum"), value: `${(selectedProposal.quorum / 1000000).toFixed(0)}M TBURN` },
              { label: t("adminProposals.detail.requiredApproval"), value: `${selectedProposal.requiredApproval}%` },
            ],
          },
          {
            title: t("adminProposals.detail.timeline"),
            fields: [
              { label: t("adminProposals.detail.startDate"), value: selectedProposal.startDate },
              { label: t("adminProposals.detail.endDate"), value: selectedProposal.endDate },
              { label: t("adminProposals.detail.proposer"), value: formatAddress(selectedProposal.proposer), copyable: true, copyValue: selectedProposal.proposer },
            ],
          },
          {
            title: t("adminProposals.detail.description"),
            fields: [
              { label: t("adminProposals.detail.fullDescription"), value: selectedProposal.description },
            ],
          },
        ] : []}
      />

      <ConfirmationDialog
        open={!!proposalToDelete}
        onOpenChange={(open) => !open && setProposalToDelete(null)}
        title={t("adminProposals.confirmDelete.title")}
        description={t("adminProposals.confirmDelete.description", { title: proposalToDelete?.title, id: proposalToDelete?.id })}
        confirmText={t("adminProposals.delete")}
        onConfirm={confirmDeleteProposal}
        destructive={true}
        isLoading={deleteProposalMutation.isPending}
      />
    </div>
  );
}
