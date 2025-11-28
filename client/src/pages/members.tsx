import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

// Form schema for member creation - function to support i18n
const createMemberFormSchema = (t: (key: string) => string) => z.object({
  accountAddress: z.string().min(42, t('members.invalidAccountAddress')),
  displayName: z.string().min(2, t('members.displayNameMinLength')),
  email: z.string().email(t('members.invalidEmailAddress')).optional(),
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
  const { t } = useTranslation();
  
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
                    {member.profile?.displayName || t('members.anonymousMember')}
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
                    {t(`members.tiers.${member.memberTier}`)}
                  </span>
                </Badge>
                <Badge className={`${statusColors[member.memberStatus]} text-white`}>
                  <span className="flex items-center gap-1">
                    {getStatusIconUtil(member.memberStatus)}
                    {t(`members.statuses.${member.memberStatus}`)}
                  </span>
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">{t('members.overview')}</TabsTrigger>
                <TabsTrigger value="financial">{t('members.financial')}</TabsTrigger>
                <TabsTrigger value="governance">{t('members.governance')}</TabsTrigger>
                <TabsTrigger value="performance">{t('members.performance')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Basic Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-muted-foreground">{t('members.kycLevel')}</span>
                      </div>
                      <Badge className={`${kycColors[member.kycLevel]} text-white mt-1`}>
                        {t(`members.kycLevels.${member.kycLevel}`)}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{t('members.totalStaked')}</span>
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
                        <span className="text-xs text-muted-foreground">{t('members.votingPower')}</span>
                      </div>
                      <p className="text-lg font-bold">{member.governance?.votingPower || "0"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">{t('members.memberSince')}</span>
                      </div>
                      <p className="text-sm font-medium">
                        {member.joinedAt && !isNaN(new Date(member.joinedAt).getTime())
                          ? formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })
                          : t('members.recentlyJoined')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">{t('members.profileInformation')}</CardTitle>
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
                        <p className="text-sm text-muted-foreground mb-1">{t('members.bio')}</p>
                        <p className="text-sm">{member.profile.bio}</p>
                      </div>
                    )}
                    {!member.profile?.email && !member.profile?.location && !member.profile?.bio && (
                      <p className="text-sm text-muted-foreground">{t('members.noProfileInfo')}</p>
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
                        {t('members.totalStaked')}
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
                        {t('members.totalRewards')}
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
                        {t('members.totalWithdrawn')}
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
                    <CardTitle className="text-sm font-medium">{t('members.financialSummary')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('members.netPosition')}</span>
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
                        <span className="text-muted-foreground">{t('members.roiRewardsStaked')}</span>
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
                        {t('members.votingPower')}
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
                        {t('members.proposalsCreated')}
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
                        {t('members.votesParticipated')}
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
                    <CardTitle className="text-sm font-medium">{t('members.governanceActivity')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('members.participationRate')}</span>
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
                        {t('members.reliability')}
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
                        {t('members.responseTime')}
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
                        {t('members.successRate')}
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
                    <CardTitle className="text-sm font-medium">{t('members.overallPerformanceScore')}</CardTitle>
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
              {t('members.close')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { toast } = useToast();

  // Create schema with translations
  const memberFormSchema = createMemberFormSchema(t);

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
        title: t('members.memberCreated'),
        description: t('members.memberCreatedDesc'),
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('members.error'),
        description: t('members.createMemberError'),
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
        title: t('members.validatorsSynced'),
        description: t('members.validatorsSyncedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('members.error'),
        description: t('members.syncValidatorsError'),
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
        <h1 className="text-4xl font-bold mb-2" data-testid="text-members-title">{t('members.title')}</h1>
        <p className="text-muted-foreground">
          {t('members.subtitle')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card data-testid="card-total-members">
          <CardHeader className="pb-3">
            <CardDescription>{t('members.totalMembers')}</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalMembers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-active-members">
          <CardHeader className="pb-3">
            <CardDescription>{t('members.activeMembers')}</CardDescription>
            <CardTitle className="text-2xl text-green-500">
              {stats?.activeMembers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-total-validators">
          <CardHeader className="pb-3">
            <CardDescription>{t('members.totalValidators')}</CardDescription>
            <CardTitle className="text-2xl text-blue-500">
              {stats?.totalValidators || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-total-stakers">
          <CardHeader className="pb-3">
            <CardDescription>{t('members.totalStakers')}</CardDescription>
            <CardTitle className="text-2xl text-purple-500">
              {stats?.totalStakers || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-kyc-verified">
          <CardHeader className="pb-3">
            <CardDescription>{t('members.kycVerified')}</CardDescription>
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
            {t('members.filtersSearch')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('members.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger data-testid="select-tier-filter">
                <SelectValue placeholder={t('members.filterByTier')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('members.allTiers')}</SelectItem>
                <SelectItem value="basic_user">{t('members.basicUser')}</SelectItem>
                <SelectItem value="staker">{t('members.staker')}</SelectItem>
                <SelectItem value="active_validator">{t('members.activeValidator')}</SelectItem>
                <SelectItem value="inactive_validator">{t('members.inactiveValidator')}</SelectItem>
                <SelectItem value="genesis_validator">{t('members.genesisValidator')}</SelectItem>
                <SelectItem value="enterprise_validator">{t('members.enterpriseValidator')}</SelectItem>
                <SelectItem value="governance_validator">{t('members.governanceValidator')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder={t('members.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('members.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                <SelectItem value="suspended">{t('members.suspended')}</SelectItem>
                <SelectItem value="pending_kyc">{t('members.pendingKyc')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger data-testid="select-kyc-filter">
                <SelectValue placeholder={t('members.filterByKyc')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('members.allKycLevels')}</SelectItem>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                <SelectItem value="basic">{t('members.basicKyc')}</SelectItem>
                <SelectItem value="advanced">{t('members.advancedKyc')}</SelectItem>
                <SelectItem value="institutional">{t('members.institutionalKyc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all" data-testid="tab-all">
            {t('members.allMembers')} ({members.length})
          </TabsTrigger>
          <TabsTrigger value="validators" data-testid="tab-validators">
            {t('members.validators')} ({members.filter(m => m.memberTier.includes("validator")).length})
          </TabsTrigger>
          <TabsTrigger value="stakers" data-testid="tab-stakers">
            {t('members.stakers')} ({members.filter(m => m.memberTier === "staker" || m.memberTier.includes("validator")).length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            {t('members.pendingKyc')} ({members.filter(m => m.memberStatus === "pending_kyc").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <div>
                <CardTitle>{t('members.membersList')}</CardTitle>
                <CardDescription>
                  {filteredMembers.length} {t('members.membersFound')}
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
                  {syncValidatorsMutation.isPending ? t('members.syncing') : t('members.syncValidators')}
                </Button>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-member">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('members.createMember')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('members.createNewMember')}</DialogTitle>
                    <DialogDescription>
                      {t('members.createMemberDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="accountAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('members.accountAddress')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('members.accountAddressPlaceholder')}
                                {...field}
                                data-testid="input-account-address"
                              />
                            </FormControl>
                            <FormDescription>
                              {t('members.accountAddressDescription')}
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
                            <FormLabel>{t('members.displayName')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('members.displayNamePlaceholder')}
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
                            <FormLabel>{t('members.emailOptional')}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t('members.emailPlaceholder')}
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
                            <FormLabel>{t('members.locationOptional')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('members.locationPlaceholder')}
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
                            <FormLabel>{t('members.bioOptional')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('members.bioPlaceholder')}
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
                              <FormLabel>{t('members.memberTier')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-member-tier">
                                    <SelectValue placeholder={t('members.selectTier')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="basic_user">{t('members.basicUser')}</SelectItem>
                                  <SelectItem value="staker">{t('members.staker')}</SelectItem>
                                  <SelectItem value="active_validator">{t('members.activeValidator')}</SelectItem>
                                  <SelectItem value="inactive_validator">{t('members.inactiveValidator')}</SelectItem>
                                  <SelectItem value="genesis_validator">{t('members.genesisValidator')}</SelectItem>
                                  <SelectItem value="enterprise_validator">{t('members.enterpriseValidator')}</SelectItem>
                                  <SelectItem value="governance_validator">{t('members.governanceValidator')}</SelectItem>
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
                              <FormLabel>{t('members.kycLevel')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-kyc-level">
                                    <SelectValue placeholder={t('members.selectKycLevel')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">{t('members.noneKyc')}</SelectItem>
                                  <SelectItem value="basic">{t('members.basicKyc')}</SelectItem>
                                  <SelectItem value="advanced">{t('members.advancedKyc')}</SelectItem>
                                  <SelectItem value="institutional">{t('members.institutionalKyc')}</SelectItem>
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
                          {t('members.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMemberMutation.isPending}
                          data-testid="button-submit-member"
                        >
                          {createMemberMutation.isPending ? t('members.creating') : t('members.createMember')}
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
                      <TableHead>{t('members.tableHeaderMember')}</TableHead>
                      <TableHead>{t('members.tableHeaderTier')}</TableHead>
                      <TableHead>{t('members.tableHeaderStatus')}</TableHead>
                      <TableHead>{t('members.tableHeaderKycLevel')}</TableHead>
                      <TableHead>{t('members.tableHeaderStaked')}</TableHead>
                      <TableHead>{t('members.tableHeaderVotingPower')}</TableHead>
                      <TableHead>{t('members.tableHeaderJoined')}</TableHead>
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
                              {member.profile?.displayName || t('members.anonymous')}
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
                              {t(`members.tiers.${member.memberTier}`)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[member.memberStatus]} text-white`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(member.memberStatus)}
                              {t(`members.statuses.${member.memberStatus}`)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${kycColors[member.kycLevel]} text-white`}>
                            {t(`members.kycLevels.${member.kycLevel}`)}
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
                              : t('members.recentlyJoined')}
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
                  <p className="text-muted-foreground">{t('members.noMembersMatchingCriteria')}</p>
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