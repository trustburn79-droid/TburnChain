import { useState } from "react";
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
} from "lucide-react";

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

export default function Proposals() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const proposals: Proposal[] = [
    {
      id: "TIP-001",
      title: "Increase Block Gas Limit to 30M",
      description: "Proposal to increase the block gas limit from 20M to 30M to accommodate higher transaction throughput",
      category: "Network",
      proposer: "0x1234...5678",
      status: "active",
      votesFor: 8500000,
      votesAgainst: 2100000,
      votesAbstain: 400000,
      quorum: 10000000,
      startDate: "2024-12-01",
      endDate: "2024-12-08",
      totalVoters: 1247,
      requiredApproval: 66,
    },
    {
      id: "TIP-002",
      title: "Reduce Transaction Fee Base Rate",
      description: "Lower the base transaction fee from 0.001 TBURN to 0.0005 TBURN to improve network accessibility",
      category: "Economics",
      proposer: "0xabcd...efgh",
      status: "passed",
      votesFor: 12000000,
      votesAgainst: 3000000,
      votesAbstain: 1000000,
      quorum: 10000000,
      startDate: "2024-11-20",
      endDate: "2024-11-27",
      totalVoters: 2156,
      requiredApproval: 66,
    },
    {
      id: "TIP-003",
      title: "Add New Bridge Chain: Solana",
      description: "Integrate Solana blockchain into the TBURN cross-chain bridge infrastructure",
      category: "Bridge",
      proposer: "0x9876...5432",
      status: "active",
      votesFor: 5000000,
      votesAgainst: 4500000,
      votesAbstain: 500000,
      quorum: 10000000,
      startDate: "2024-12-02",
      endDate: "2024-12-09",
      totalVoters: 987,
      requiredApproval: 66,
    },
    {
      id: "TIP-004",
      title: "Implement Auto-Compounding Rewards",
      description: "Enable automatic reward compounding for stakers to improve DeFi experience",
      category: "Staking",
      proposer: "0xdead...beef",
      status: "rejected",
      votesFor: 4000000,
      votesAgainst: 8000000,
      votesAbstain: 2000000,
      quorum: 10000000,
      startDate: "2024-11-15",
      endDate: "2024-11-22",
      totalVoters: 1543,
      requiredApproval: 66,
    },
    {
      id: "TIP-005",
      title: "Upgrade AI Orchestration to v2.0",
      description: "Major upgrade to AI systems including improved consensus optimization and security features",
      category: "AI",
      proposer: "0xface...cafe",
      status: "executed",
      votesFor: 15000000,
      votesAgainst: 1500000,
      votesAbstain: 500000,
      quorum: 10000000,
      startDate: "2024-11-01",
      endDate: "2024-11-08",
      totalVoters: 2847,
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Proposal Management
            </h1>
            <p className="text-muted-foreground">제안 관리 | Manage governance proposals and voting</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-create-proposal">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Proposal</DialogTitle>
                  <DialogDescription>Submit a new governance proposal for community voting</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Enter proposal title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select defaultValue="network">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="economics">Economics</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                        <SelectItem value="staking">Staking</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe your proposal in detail..." className="h-32" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voting Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Voting End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quorum (TBURN)</Label>
                      <Input type="number" defaultValue="10000000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Required Approval (%)</Label>
                      <Input type="number" defaultValue="66" />
                    </div>
                  </div>
                  <Button className="w-full">Submit Proposal</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proposals.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Voting</CardTitle>
              <Vote className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{activeCount}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{passedCount}</div>
              <p className="text-xs text-muted-foreground">Approved proposals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="passed">Passed</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="executed">Executed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
            const forPercentage = (proposal.votesFor / totalVotes) * 100;
            const againstPercentage = (proposal.votesAgainst / totalVotes) * 100;
            const quorumReached = totalVotes >= proposal.quorum;

            return (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{proposal.id}</Badge>
                        <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                        <Badge variant="secondary">{proposal.category}</Badge>
                      </div>
                      <CardTitle className="text-xl">{proposal.title}</CardTitle>
                      <CardDescription>{proposal.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {proposal.status === "active" && (
                        <>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
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
                          For ({forPercentage.toFixed(1)}%)
                        </span>
                        <span>{(proposal.votesFor / 1000000).toFixed(2)}M TBURN</span>
                      </div>
                      <Progress value={forPercentage} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-500 flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4" />
                          Against ({againstPercentage.toFixed(1)}%)
                        </span>
                        <span>{(proposal.votesAgainst / 1000000).toFixed(2)}M TBURN</span>
                      </div>
                      <Progress value={againstPercentage} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quorum</span>
                        <span className={quorumReached ? "text-green-500" : "text-yellow-500"}>
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
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {proposal.totalVoters.toLocaleString()} voters
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {proposal.startDate} - {proposal.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Required: {proposal.requiredApproval}% approval
                    </span>
                    <span className="flex items-center gap-1">
                      Proposer: {proposal.proposer}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
