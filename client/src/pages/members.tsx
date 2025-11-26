import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Search,
  Users,
  Shield,
  Coins,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  FilterIcon,
  UserPlus,
  Wallet,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Vote,
  FileText,
  Activity,
  Clock,
  Target,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Form schema for member creation
const memberFormSchema = z.object({
  accountAddress: z.string().min(42, "Invalid account address"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  memberTier: z.enum([
    "basic_user",
    "staker",
    "active_validator",
    "inactive_validator",
    "genesis_validator",
    "enterprise_validator",
    "governance_validator",
  ]),
  kycLevel: z.enum(["none", "basic", "advanced", "institutional"]),
});

// Helper functions for formatting
const formatStakedAmountUtil = (amount: string | undefined) => {
  if (!amount) return "0";
  const value = parseFloat(amount) / 1e18;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

const getTierIconUtil = (tier: string) => {
  if (tier.includes("validator")) return <Shield className="h-4 w-4" />;
  if (tier === "staker") return <Coins className="h-4 w-4" />;
  return <Users className="h-4 w-4" />;
};

const getStatusIconUtil = (status: string) => {
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

// Member Detail Modal Component
function MemberDetailModal({
  member,
  open,
  onClose,
}: {
  member: Member | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!member) return null;

  const isValidator = member.memberTier.includes("validator");
  const isActive = member.memberStatus === "active";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden" data-testid="modal-member-detail">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  isValidator ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}>
                  {isValidator ? (
                    <Shield className="h-6 w-6 text-white" />
                  ) : (
                    <Users className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {member.profile?.displayName || "Anonymous Member"}
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs break-all">
                    {member.accountAddress}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${tierColors[member.memberTier]} text-white`}>
                  <span className="flex items-center gap-1">
                    {getTierIconUtil(member.memberTier)}
                    {member.memberTier.replace(/_/g, " ").toUpperCase()}
                  </span>
                </Badge>
                <Badge className={`${statusColors[member.memberStatus]} text-white`}>
                  <span className="flex items-center gap-1">
                    {getStatusIconUtil(member.memberStatus)}
                    {member.memberStatus.replace(/_/g, " ").toUpperCase()}
                  </span>
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Basic Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-muted-foreground">KYC Level</span>
                      </div>
                      <Badge className={`${kycColors[member.kycLevel]} text-white mt-1`}>
                        {member.kycLevel.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">Total Staked</span>
                      </div>
                      <p className="text-lg font-bold">
                        {formatStakedAmountUtil(member.financial?.totalStaked)} TBURN
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Vote className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Voting Power</span>
                      </div>
                      <p className="text-lg font-bold">{member.governance?.votingPower || "0"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Member Since</span>
                      </div>
                      <p className="text-sm font-medium">
                        {member.joinedAt && !isNaN(new Date(member.joinedAt).getTime())
                          ? formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })
                          : "Recently joined"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {member.profile?.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{member.profile.email}</span>
                      </div>
                    )}
                    {member.profile?.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{member.profile.location}</span>
                      </div>
                    )}
                    {member.profile?.bio && (
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground mb-1">Bio</p>
                        <p className="text-sm">{member.profile.bio}</p>
                      </div>
                    )}
                    {!member.profile?.email && !member.profile?.location && !member.profile?.bio && (
                      <p className="text-sm text-muted-foreground">No additional profile information available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Total Staked
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-yellow-500">
                        {formatStakedAmountUtil(member.financial?.totalStaked)} TBURN
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Total Rewards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-500">
                        {formatStakedAmountUtil(member.financial?.totalRewards)} TBURN
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Total Withdrawn
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-500">
                        {formatStakedAmountUtil(member.financial?.totalWithdrawn)} TBURN
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Net Position</span>
                        <span className="font-medium">
                          {formatStakedAmountUtil(
                            String(
                              (parseFloat(member.financial?.totalStaked || "0") +
                                parseFloat(member.financial?.totalRewards || "0") -
                                parseFloat(member.financial?.totalWithdrawn || "0"))
                            )
                          )} TBURN
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ROI (Rewards/Staked)</span>
                        <span className="font-medium text-green-500">
                          {member.financial?.totalStaked && parseFloat(member.financial.totalStaked) > 0
                            ? ((parseFloat(member.financial?.totalRewards || "0") /
                                parseFloat(member.financial.totalStaked)) *
                                100).toFixed(2)
                            : "0.00"}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Vote className="h-4 w-4" />
                        Voting Power
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-purple-500">
                        {member.governance?.votingPower || "0"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Proposals Created
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-500">
                        {member.governance?.proposalsCreated || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Votes Participated
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-500">
                        {member.governance?.votesParticipated || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Governance Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Participation Rate</span>
                        <span className="font-medium">
                          {member.governance?.votesParticipated 
                            ? `${Math.min(100, member.governance.votesParticipated * 2)}%`
                            : "0%"}
                        </span>
                      </div>
                      <Progress 
                        value={member.governance?.votesParticipated 
                          ? Math.min(100, member.governance.votesParticipated * 2)
                          : 0} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Reliability
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-500">
                        {member.performance?.reliability?.toFixed(1) || "0.0"}%
                      </p>
                      <Progress value={member.performance?.reliability || 0} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Response Time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-500">
                        {member.performance?.responseTime || 0}ms
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Success Rate
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-purple-500">
                        {member.performance?.successRate?.toFixed(1) || "0.0"}%
                      </p>
                      <Progress value={member.performance?.successRate || 0} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Overall Performance Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress 
                          value={
                            ((member.performance?.reliability || 0) +
                              (member.performance?.successRate || 0)) /
                            2
                          } 
                        />
                      </div>
                      <span className="text-2xl font-bold">
                        {(
                          ((member.performance?.reliability || 0) +
                            (member.performance?.successRate || 0)) /
                          2
                        ).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { toast } = useToast();

  // Form for member creation
  const form = useForm<z.infer<typeof memberFormSchema>>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      accountAddress: "",
      displayName: "",
      email: "",
      bio: "",
      location: "",
      memberTier: "basic_user",
      kycLevel: "none",
    },
  });

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

  // Create member mutation
  const createMemberMutation = useMutation({
    mutationFn: async (values: z.infer<typeof memberFormSchema>) => {
      const response = await apiRequest('POST', '/api/members', values);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/stats/summary"] });
      toast({
        title: "Member Created",
        description: "New member has been created successfully.",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof memberFormSchema>) => {
    createMemberMutation.mutate(values);
  };

  // Sync validators mutation
  const syncValidatorsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/members/sync-validators', {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/stats/summary"] });
      toast({
        title: "Validators Synced",
        description: "All validators have been synced to the members system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to sync validators. Please try again.",
        variant: "destructive",
      });
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
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <div>
                <CardTitle>Members List</CardTitle>
                <CardDescription>
                  {filteredMembers.length} members found
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => syncValidatorsMutation.mutate()}
                  disabled={syncValidatorsMutation.isPending}
                  data-testid="button-sync-validators"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {syncValidatorsMutation.isPending ? "Syncing..." : "Sync Validators"}
                </Button>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-member">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to the TBURN blockchain network
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="accountAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0x..."
                                {...field}
                                data-testid="input-account-address"
                              />
                            </FormControl>
                            <FormDescription>
                              The blockchain wallet address (42 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                {...field}
                                data-testid="input-display-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                {...field}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="New York, USA"
                                {...field}
                                data-testid="input-location"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about yourself..."
                                className="resize-none"
                                {...field}
                                data-testid="textarea-bio"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="memberTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Member Tier</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-member-tier">
                                    <SelectValue placeholder="Select a tier" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="basic_user">Basic User</SelectItem>
                                  <SelectItem value="staker">Staker</SelectItem>
                                  <SelectItem value="active_validator">Active Validator</SelectItem>
                                  <SelectItem value="inactive_validator">Inactive Validator</SelectItem>
                                  <SelectItem value="genesis_validator">Genesis Validator</SelectItem>
                                  <SelectItem value="enterprise_validator">Enterprise Validator</SelectItem>
                                  <SelectItem value="governance_validator">Governance Validator</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="kycLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>KYC Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-kyc-level">
                                    <SelectValue placeholder="Select KYC level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="institutional">Institutional</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMemberMutation.isPending}
                          data-testid="button-submit-member"
                        >
                          {createMemberMutation.isPending ? "Creating..." : "Create Member"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              </div>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow 
                        key={member.id} 
                        data-testid={`row-member-${member.id}`}
                        className="cursor-pointer hover-elevate"
                        onClick={() => setSelectedMember(member)}
                      >
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
                            {member.joinedAt && !isNaN(new Date(member.joinedAt).getTime())
                              ? formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })
                              : "Recently joined"}
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

      {/* Member Detail Modal */}
      <MemberDetailModal
        member={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}