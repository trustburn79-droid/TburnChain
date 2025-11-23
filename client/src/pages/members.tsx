import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Users,
  Shield,
  Coins,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  FilterIcon,
  UserPlus,
  Wallet,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Member {
  id: string;
  accountAddress: string;
  memberTier: string;
  memberStatus: string;
  kycLevel: string;
  joinedAt: string;
  updatedAt: string;
  profile?: {
    displayName: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
  };
  governance?: {
    votingPower: string;
    proposalsCreated: number;
    votesParticipated: number;
  };
  financial?: {
    totalStaked: string;
    totalRewards: string;
    totalWithdrawn: string;
  };
  performance?: {
    reliability: number;
    responseTime: number;
    successRate: number;
  };
}

interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  totalValidators: number;
  totalStakers: number;
  kycVerified: number;
}

const tierColors: Record<string, string> = {
  basic_user: "bg-gray-500",
  staker: "bg-blue-500",
  active_validator: "bg-green-500",
  inactive_validator: "bg-yellow-500",
  genesis_validator: "bg-purple-500",
  enterprise_validator: "bg-indigo-500",
  governance_validator: "bg-pink-500",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  suspended: "bg-red-500",
  pending_kyc: "bg-yellow-500",
};

const kycColors: Record<string, string> = {
  none: "bg-gray-500",
  basic: "bg-blue-500",
  advanced: "bg-green-500",
  institutional: "bg-purple-500",
};

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("all");

  // Fetch members
  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
    refetchInterval: 10000,
  });

  // Fetch member statistics
  const { data: stats } = useQuery<MemberStats>({
    queryKey: ["/api/members/stats/summary"],
    refetchInterval: 30000,
  });

  // Filter members based on search and filters
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      searchQuery === "" ||
      member.accountAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profile?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = tierFilter === "all" || member.memberTier === tierFilter;
    const matchesStatus = statusFilter === "all" || member.memberStatus === statusFilter;
    const matchesKyc = kycFilter === "all" || member.kycLevel === kycFilter;

    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "validators" && member.memberTier.includes("validator")) ||
      (selectedTab === "stakers" && 
        (member.memberTier === "staker" || member.memberTier.includes("validator"))) ||
      (selectedTab === "pending" && member.memberStatus === "pending_kyc");

    return matchesSearch && matchesTier && matchesStatus && matchesKyc && matchesTab;
  });

  // Update member status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: string }) => {
      const response = await apiRequest('POST', `/api/members/${memberId}/status`, { status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
    },
  });

  // Update member tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ memberId, tier }: { memberId: string; tier: string }) => {
      const response = await apiRequest('POST', `/api/members/${memberId}/tier`, { tier });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
    },
  });

  const formatStakedAmount = (amount: string | undefined) => {
    if (!amount) return "0";
    const value = parseFloat(amount) / 1e18;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const getTierIcon = (tier: string) => {
    if (tier.includes("validator")) return <Shield className="h-4 w-4" />;
    if (tier === "staker") return <Coins className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "inactive":
        return <XCircle className="h-4 w-4" />;
      case "suspended":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Member Management</h1>
        <p className="text-muted-foreground">
          Comprehensive member, staker, and validator management system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card data-testid="card-total-members">
          <CardHeader className="pb-3">
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalMembers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-active-members">
          <CardHeader className="pb-3">
            <CardDescription>Active Members</CardDescription>
            <CardTitle className="text-2xl text-green-500">
              {stats?.activeMembers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-total-validators">
          <CardHeader className="pb-3">
            <CardDescription>Total Validators</CardDescription>
            <CardTitle className="text-2xl text-blue-500">
              {stats?.totalValidators || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-total-stakers">
          <CardHeader className="pb-3">
            <CardDescription>Total Stakers</CardDescription>
            <CardTitle className="text-2xl text-purple-500">
              {stats?.totalStakers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-kyc-verified">
          <CardHeader className="pb-3">
            <CardDescription>KYC Verified</CardDescription>
            <CardTitle className="text-2xl text-indigo-500">
              {stats?.kycVerified || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger data-testid="select-tier-filter">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="basic_user">Basic User</SelectItem>
                <SelectItem value="staker">Staker</SelectItem>
                <SelectItem value="active_validator">Active Validator</SelectItem>
                <SelectItem value="inactive_validator">Inactive Validator</SelectItem>
                <SelectItem value="genesis_validator">Genesis Validator</SelectItem>
                <SelectItem value="enterprise_validator">Enterprise Validator</SelectItem>
                <SelectItem value="governance_validator">Governance Validator</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending_kyc">Pending KYC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger data-testid="select-kyc-filter">
                <SelectValue placeholder="Filter by KYC level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC Levels</SelectItem>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all" data-testid="tab-all">
            All Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="validators" data-testid="tab-validators">
            Validators ({members.filter(m => m.memberTier.includes("validator")).length})
          </TabsTrigger>
          <TabsTrigger value="stakers" data-testid="tab-stakers">
            Stakers ({members.filter(m => m.memberTier === "staker" || m.memberTier.includes("validator")).length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending KYC ({members.filter(m => m.memberStatus === "pending_kyc").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardHeader>
              <CardTitle>Members List</CardTitle>
              <CardDescription>
                {filteredMembers.length} members found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC Level</TableHead>
                      <TableHead>Staked</TableHead>
                      <TableHead>Voting Power</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {member.profile?.displayName || "Anonymous"}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {member.accountAddress.slice(0, 6)}...{member.accountAddress.slice(-4)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${tierColors[member.memberTier]} text-white`}>
                            <span className="flex items-center gap-1">
                              {getTierIcon(member.memberTier)}
                              {member.memberTier.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[member.memberStatus]} text-white`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(member.memberStatus)}
                              {member.memberStatus.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${kycColors[member.kycLevel]} text-white`}>
                            {member.kycLevel.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-muted-foreground" />
                            {formatStakedAmount(member.financial?.totalStaked)} TBURN
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            {member.governance?.votingPower || "0"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/members/${member.id}`}>
                              <Button variant="outline" size="sm" data-testid={`button-view-${member.id}`}>
                                View
                                <ArrowUpRight className="ml-1 h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!isLoading && filteredMembers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No members found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}