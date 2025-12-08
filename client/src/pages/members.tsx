import { useState } from "react";
import { Link } from "wouter";
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
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  History,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Building,
  Globe,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  AlertTriangle,
  ChevronRight,
  Fingerprint,
  ShieldCheck,
  BadgeCheck,
  Layers,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

type StatsDialogType = 'totalMembers' | 'activeMembers' | 'validators' | 'stakers' | 'kycVerified' | null;

function MemberStatsDetailDialog({
  type,
  open,
  onClose,
  members,
  stats,
}: {
  type: StatsDialogType;
  open: boolean;
  onClose: () => void;
  members: Member[];
  stats: MemberStats | undefined;
}) {
  const { t } = useTranslation();

  if (!type || !open) return null;

  const tierDistribution = [
    { name: t('members.basicUser'), value: members.filter(m => m.memberTier === 'basic_user').length, color: '#6b7280' },
    { name: t('members.staker'), value: members.filter(m => m.memberTier === 'staker').length, color: '#3b82f6' },
    { name: t('members.activeValidator'), value: members.filter(m => m.memberTier === 'active_validator').length, color: '#10b981' },
    { name: t('members.inactiveValidator'), value: members.filter(m => m.memberTier === 'inactive_validator').length, color: '#f59e0b' },
    { name: t('members.genesisValidator'), value: members.filter(m => m.memberTier === 'genesis_validator').length, color: '#8b5cf6' },
    { name: t('members.enterpriseValidator'), value: members.filter(m => m.memberTier === 'enterprise_validator').length, color: '#6366f1' },
    { name: t('members.governanceValidator'), value: members.filter(m => m.memberTier === 'governance_validator').length, color: '#ec4899' },
  ].filter(d => d.value > 0);

  const statusDistribution = [
    { name: t('common.active'), value: members.filter(m => m.memberStatus === 'active').length, color: '#10b981' },
    { name: t('common.inactive'), value: members.filter(m => m.memberStatus === 'inactive').length, color: '#6b7280' },
    { name: t('members.suspended'), value: members.filter(m => m.memberStatus === 'suspended').length, color: '#ef4444' },
    { name: t('members.pendingKyc'), value: members.filter(m => m.memberStatus === 'pending_kyc').length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const kycDistribution = [
    { name: t('common.none'), value: members.filter(m => m.kycLevel === 'none').length, color: '#6b7280' },
    { name: t('members.basicKyc'), value: members.filter(m => m.kycLevel === 'basic').length, color: '#3b82f6' },
    { name: t('members.advancedKyc'), value: members.filter(m => m.kycLevel === 'advanced').length, color: '#10b981' },
    { name: t('members.institutionalKyc'), value: members.filter(m => m.kycLevel === 'institutional').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const validators = members.filter(m => m.memberTier.includes('validator'));
  const stakers = members.filter(m => m.memberTier === 'staker' || m.memberTier.includes('validator'));

  const joinTrend = Array.from({ length: 7 }, (_, i) => {
    const seed = type === 'totalMembers' ? 1 : type === 'activeMembers' ? 2 : type === 'validators' ? 3 : type === 'stakers' ? 4 : 5;
    const baseValue = type === 'validators' ? validators.length : type === 'stakers' ? stakers.length : members.length;
    const variation = Math.sin(i * seed * 0.5) * 5 + (i * 2);
    return {
      day: t(`members.day${i + 1}`),
      members: Math.max(0, Math.round(baseValue * (0.85 + i * 0.02) + variation)),
      growth: parseFloat((2 + Math.sin(i) * 1.5).toFixed(1)),
    };
  });

  const getDialogContent = () => {
    switch (type) {
      case 'totalMembers':
        return {
          title: t('members.totalMembersAnalytics'),
          icon: <Users className="h-6 w-6 text-white" />,
          bgClass: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          mainValue: stats?.totalMembers || members.length,
          mainLabel: t('members.totalMembers'),
          charts: (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {t('members.tierDistribution')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPie>
                        <Pie
                          data={tierDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {tierDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t('members.memberGrowthTrend')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={joinTrend}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="members" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('members.memberBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tierDistribution.map((tier, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                          <span className="text-xs text-muted-foreground">{tier.name}</span>
                        </div>
                        <p className="text-xl font-bold">{tier.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {members.length > 0 ? ((tier.value / members.length) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ),
        };

      case 'activeMembers':
        return {
          title: t('members.activeMembersAnalytics'),
          icon: <UserCheck className="h-6 w-6 text-white" />,
          bgClass: 'bg-gradient-to-br from-green-500 to-emerald-500',
          mainValue: stats?.activeMembers || members.filter(m => m.memberStatus === 'active').length,
          mainLabel: t('members.activeMembers'),
          charts: (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      {t('members.statusDistribution')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={statusDistribution}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      {t('members.activityMetrics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.activeRate')}</span>
                          <span className="text-sm font-medium text-green-500">
                            {members.length > 0 ? ((members.filter(m => m.memberStatus === 'active').length / members.length) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress value={members.length > 0 ? (members.filter(m => m.memberStatus === 'active').length / members.length) * 100 : 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.engagementScore')}</span>
                          <span className="text-sm font-medium text-blue-500">87.5%</span>
                        </div>
                        <Progress value={87.5} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.retentionRate')}</span>
                          <span className="text-sm font-medium text-purple-500">94.2%</span>
                        </div>
                        <Progress value={94.2} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('members.statusBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statusDistribution.map((status, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                          <span className="text-xs text-muted-foreground">{status.name}</span>
                        </div>
                        <p className="text-xl font-bold">{status.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {members.length > 0 ? ((status.value / members.length) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ),
        };

      case 'validators':
        return {
          title: t('members.validatorAnalytics'),
          icon: <Shield className="h-6 w-6 text-white" />,
          bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-500',
          mainValue: stats?.totalValidators || validators.length,
          mainLabel: t('members.totalValidators'),
          charts: (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t('members.validatorTypes')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPie>
                        <Pie
                          data={tierDistribution.filter(t => t.name.toLowerCase().includes('validator') || t.name.toLowerCase().includes('검증'))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {tierDistribution.filter(t => t.name.toLowerCase().includes('validator') || t.name.toLowerCase().includes('검증')).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t('members.validatorPerformance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.avgUptime')}</span>
                          <span className="text-sm font-medium text-green-500">99.7%</span>
                        </div>
                        <Progress value={99.7} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.avgBlockProduction')}</span>
                          <span className="text-sm font-medium text-blue-500">98.5%</span>
                        </div>
                        <Progress value={98.5} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.slashingRate')}</span>
                          <span className="text-sm font-medium text-yellow-500">0.02%</span>
                        </div>
                        <Progress value={0.2} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('members.topValidators')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {validators.slice(0, 5).map((v, index) => (
                      <div key={v.id} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 justify-center">{index + 1}</Badge>
                          <div>
                            <p className="text-sm font-medium">{v.profile?.displayName || t('members.anonymousMember')}</p>
                            <p className="text-xs text-muted-foreground font-mono">{v.accountAddress.slice(0, 10)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={tierColors[v.memberTier]}>{t(`members.tiers.${v.memberTier}`)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ),
        };

      case 'stakers':
        return {
          title: t('members.stakerAnalytics'),
          icon: <Coins className="h-6 w-6 text-white" />,
          bgClass: 'bg-gradient-to-br from-yellow-500 to-orange-500',
          mainValue: stats?.totalStakers || stakers.length,
          mainLabel: t('members.totalStakers'),
          charts: (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      {t('members.stakingDistribution')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { range: '< 1K', count: Math.floor(stakers.length * 0.3) },
                        { range: '1K-10K', count: Math.floor(stakers.length * 0.35) },
                        { range: '10K-100K', count: Math.floor(stakers.length * 0.2) },
                        { range: '100K-1M', count: Math.floor(stakers.length * 0.1) },
                        { range: '> 1M', count: Math.floor(stakers.length * 0.05) },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t('members.stakingMetrics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <span className="text-sm">{t('members.avgStakeAmount')}</span>
                        <span className="text-sm font-bold text-yellow-500">45,000 TBURN</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <span className="text-sm">{t('members.totalStakeValue')}</span>
                        <span className="text-sm font-bold text-green-500">125.5M TBURN</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <span className="text-sm">{t('members.avgLockPeriod')}</span>
                        <span className="text-sm font-bold text-blue-500">180 {t('common.days')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('members.stakingTrend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={joinTrend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="members" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ),
        };

      case 'kycVerified':
        return {
          title: t('members.kycAnalytics'),
          icon: <ShieldCheck className="h-6 w-6 text-white" />,
          bgClass: 'bg-gradient-to-br from-indigo-500 to-violet-500',
          mainValue: stats?.kycVerified || members.filter(m => m.kycLevel !== 'none').length,
          mainLabel: t('members.kycVerified'),
          charts: (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      {t('members.kycLevelDistribution')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPie>
                        <Pie
                          data={kycDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {kycDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4" />
                      {t('members.verificationMetrics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.verificationRate')}</span>
                          <span className="text-sm font-medium text-green-500">
                            {members.length > 0 ? ((members.filter(m => m.kycLevel !== 'none').length / members.length) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress value={members.length > 0 ? (members.filter(m => m.kycLevel !== 'none').length / members.length) * 100 : 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.institutionalRate')}</span>
                          <span className="text-sm font-medium text-purple-500">
                            {members.length > 0 ? ((members.filter(m => m.kycLevel === 'institutional').length / members.length) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress value={members.length > 0 ? (members.filter(m => m.kycLevel === 'institutional').length / members.length) * 100 : 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{t('members.pendingVerifications')}</span>
                          <span className="text-sm font-medium text-yellow-500">{members.filter(m => m.memberStatus === 'pending_kyc').length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('members.kycBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {kycDistribution.map((kyc, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: kyc.color }} />
                          <span className="text-xs text-muted-foreground">{kyc.name}</span>
                        </div>
                        <p className="text-xl font-bold">{kyc.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {members.length > 0 ? ((kyc.value / members.length) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ),
        };

      default:
        return null;
    }
  };

  const content = getDialogContent();
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden" data-testid={`modal-stats-${type}`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${content.bgClass}`}>
                {content.icon}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{content.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-foreground">{content.mainValue.toLocaleString()}</span>
                  <span className="text-muted-foreground">{content.mainLabel}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            {content.charts}
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={onClose} data-testid="button-close-stats-modal">
              {t('members.close')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KYCWorkflowDialog({
  member,
  open,
  onClose,
  onUpdateKyc,
}: {
  member: Member | null;
  open: boolean;
  onClose: () => void;
  onUpdateKyc: (memberId: string, kycLevel: string) => void;
}) {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  if (!member || !open) return null;

  const kycSteps = [
    { level: 'none', label: t('members.kycLevels.none'), description: t('members.kycStepNoneDesc'), icon: <UserX className="h-5 w-5" />, color: 'bg-gray-500' },
    { level: 'basic', label: t('members.kycLevels.basic'), description: t('members.kycStepBasicDesc'), icon: <UserCheck className="h-5 w-5" />, color: 'bg-blue-500' },
    { level: 'advanced', label: t('members.kycLevels.advanced'), description: t('members.kycStepAdvancedDesc'), icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-green-500' },
    { level: 'institutional', label: t('members.kycLevels.institutional'), description: t('members.kycStepInstitutionalDesc'), icon: <Building className="h-5 w-5" />, color: 'bg-purple-500' },
  ];

  const currentStepIndex = kycSteps.findIndex(s => s.level === member.kycLevel);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl" data-testid="modal-kyc-workflow">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            {t('members.kycVerificationWorkflow')}
          </DialogTitle>
          <DialogDescription>
            {t('members.kycWorkflowDescription', { name: member.profile?.displayName || t('members.anonymousMember') })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="relative">
            {kycSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.level} className="flex items-start gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all
                      ${isCompleted ? step.color : 'bg-muted'} ${isCurrent ? 'ring-2 ring-offset-2 ring-primary' : ''}`}>
                      {step.icon}
                    </div>
                    {index < kycSteps.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${index < currentStepIndex ? 'bg-green-500' : 'bg-muted'}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{step.label}</h4>
                      {isCurrent && <Badge variant="outline" className="text-xs">{t('members.current')}</Badge>}
                      {isCompleted && index < currentStepIndex && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setSelectedLevel(step.level)}
                        data-testid={`button-upgrade-kyc-${step.level}`}
                      >
                        {t('members.upgradeTo')} {step.label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          {selectedLevel && (
            <Button onClick={() => { onUpdateKyc(member.id, selectedLevel); onClose(); }} data-testid="button-confirm-kyc-upgrade">
              {t('members.confirmUpgrade')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberEditDialog({
  member,
  open,
  onClose,
  onSave,
}: {
  member: Member | null;
  open: boolean;
  onClose: () => void;
  onSave: (memberId: string, data: Partial<Member>) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    location: '',
    memberTier: '',
    memberStatus: '',
  });

  if (!member || !open) return null;

  if (formData.displayName === '' && member.profile?.displayName) {
    setFormData({
      displayName: member.profile?.displayName || '',
      email: member.profile?.email || '',
      bio: member.profile?.bio || '',
      location: member.profile?.location || '',
      memberTier: member.memberTier,
      memberStatus: member.memberStatus,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg" data-testid="modal-edit-member">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {t('members.editMember')}
          </DialogTitle>
          <DialogDescription>
            {t('members.editMemberDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">{t('members.displayName')}</label>
            <Input
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder={t('members.displayNamePlaceholder')}
              data-testid="input-edit-display-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('members.emailOptional')}</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('members.emailPlaceholder')}
              data-testid="input-edit-email"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('members.locationOptional')}</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('members.locationPlaceholder')}
              data-testid="input-edit-location"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('members.bioOptional')}</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={t('members.bioPlaceholder')}
              className="resize-none"
              data-testid="textarea-edit-bio"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t('members.memberTier')}</label>
              <Select value={formData.memberTier} onValueChange={(v) => setFormData({ ...formData, memberTier: v })}>
                <SelectTrigger data-testid="select-edit-tier">
                  <SelectValue />
                </SelectTrigger>
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
            </div>
            <div>
              <label className="text-sm font-medium">{t('members.status')}</label>
              <Select value={formData.memberStatus} onValueChange={(v) => setFormData({ ...formData, memberStatus: v })}>
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('common.active')}</SelectItem>
                  <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                  <SelectItem value="suspended">{t('members.suspended')}</SelectItem>
                  <SelectItem value="pending_kyc">{t('members.pendingKyc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => { onSave(member.id, formData); onClose(); }} data-testid="button-save-member">
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberDeleteDialog({
  member,
  open,
  onClose,
  onDelete,
}: {
  member: Member | null;
  open: boolean;
  onClose: () => void;
  onDelete: (memberId: string) => void;
}) {
  const { t } = useTranslation();

  if (!member || !open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md" data-testid="modal-delete-member">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('members.deleteMember')}
          </DialogTitle>
          <DialogDescription>
            {t('members.deleteMemberWarning', { name: member.profile?.displayName || member.accountAddress.slice(0, 10) })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Card className="border-destructive/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">{member.profile?.displayName || t('members.anonymousMember')}</p>
                  <p className="text-xs text-muted-foreground font-mono">{member.accountAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={() => { onDelete(member.id); onClose(); }} data-testid="button-confirm-delete">
            {t('members.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statsDialogType, setStatsDialogType] = useState<StatsDialogType>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);
  const [kycMember, setKycMember] = useState<Member | null>(null);
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

  // Update KYC level mutation
  const updateKycMutation = useMutation({
    mutationFn: async ({ memberId, kycLevel }: { memberId: string; kycLevel: string }) => {
      const response = await apiRequest('POST', `/api/members/${memberId}/kyc`, { kycLevel });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/stats/summary"] });
      toast({
        title: t('members.kycUpdated'),
        description: t('members.kycUpdatedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('members.error'),
        description: t('members.updateKycError'),
        variant: "destructive",
      });
    },
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: Partial<Member> }) => {
      const response = await apiRequest('PATCH', `/api/members/${memberId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/stats/summary"] });
      toast({
        title: t('members.memberUpdated'),
        description: t('members.memberUpdatedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('members.error'),
        description: t('members.updateMemberError'),
        variant: "destructive",
      });
    },
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiRequest('DELETE', `/api/members/${memberId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/stats/summary"] });
      toast({
        title: t('members.memberDeleted'),
        description: t('members.memberDeletedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('members.error'),
        description: t('members.deleteMemberError'),
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
        <h1 className="text-4xl font-bold" data-testid="text-members-title">{t('members.title')}</h1>
        <p className="text-muted-foreground">
          {t('members.subtitle')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setStatsDialogType('totalMembers')}
          data-testid="card-total-members"
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              {t('members.totalMembers')}
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {stats?.totalMembers || members.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setStatsDialogType('activeMembers')}
          data-testid="card-active-members"
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              {t('members.activeMembers')}
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl text-green-500 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              {stats?.activeMembers || members.filter(m => m.memberStatus === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setStatsDialogType('validators')}
          data-testid="card-total-validators"
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              {t('members.totalValidators')}
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl text-purple-500 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {stats?.totalValidators || members.filter(m => m.memberTier.includes('validator')).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setStatsDialogType('stakers')}
          data-testid="card-total-stakers"
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              {t('members.totalStakers')}
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-500 flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {stats?.totalStakers || members.filter(m => m.memberTier === 'staker' || m.memberTier.includes('validator')).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className="cursor-pointer hover-elevate transition-all"
          onClick={() => setStatsDialogType('kycVerified')}
          data-testid="card-kyc-verified"
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              {t('members.kycVerified')}
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl text-indigo-500 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {stats?.kycVerified || members.filter(m => m.kycLevel !== 'none').length}
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
                      <TableHead className="text-right">{t('members.tableHeaderActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow 
                        key={member.id} 
                        data-testid={`row-member-${member.id}`}
                        className="hover-elevate"
                      >
                        <TableCell>
                          <div 
                            className="cursor-pointer"
                            onClick={() => setSelectedMember(member)}
                          >
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
                          <Badge 
                            className={`${kycColors[member.kycLevel]} text-white cursor-pointer`}
                            onClick={() => setKycMember(member)}
                          >
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                              data-testid={`button-view-${member.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); setEditMember(member); }}
                              data-testid={`button-edit-${member.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); setKycMember(member); }}
                              data-testid={`button-kyc-${member.id}`}
                            >
                              <Fingerprint className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setDeleteMember(member); }}
                              data-testid={`button-delete-${member.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Stats Detail Dialogs */}
      <MemberStatsDetailDialog
        type={statsDialogType}
        open={!!statsDialogType}
        onClose={() => setStatsDialogType(null)}
        members={members}
        stats={stats}
      />

      {/* KYC Workflow Dialog */}
      <KYCWorkflowDialog
        member={kycMember}
        open={!!kycMember}
        onClose={() => setKycMember(null)}
        onUpdateKyc={(memberId, kycLevel) => {
          updateKycMutation.mutate({ memberId, kycLevel });
        }}
      />

      {/* Member Edit Dialog */}
      <MemberEditDialog
        member={editMember}
        open={!!editMember}
        onClose={() => setEditMember(null)}
        onSave={(memberId, data) => {
          updateMemberMutation.mutate({ memberId, data });
        }}
      />

      {/* Member Delete Dialog */}
      <MemberDeleteDialog
        member={deleteMember}
        open={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        onDelete={(memberId) => {
          deleteMemberMutation.mutate(memberId);
        }}
      />

      {/* Related Resources Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('members.relatedResources')}
          </CardTitle>
          <CardDescription>
            {t('members.relatedResourcesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Learn Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('members.learn')}</h4>
              <div className="space-y-2">
                <Link href="/learn/trust-score-system" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-trust-score">
                  <Shield className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm group-hover:text-primary transition">Trust Score System</span>
                </Link>
                <Link href="/learn/what-is-wallet" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-wallet">
                  <Wallet className="h-4 w-4 text-purple-500" />
                  <span className="text-sm group-hover:text-primary transition">What is a Wallet?</span>
                </Link>
                <Link href="/learn/tokenomics" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-tokenomics">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm group-hover:text-primary transition">Tokenomics</span>
                </Link>
              </div>
            </div>

            {/* Solutions Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('members.solutions')}</h4>
              <div className="space-y-2">
                <Link href="/solutions/wallets" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-solution-wallets">
                  <Wallet className="h-4 w-4 text-purple-500" />
                  <span className="text-sm group-hover:text-primary transition">Wallet Solutions</span>
                </Link>
                <Link href="/solutions/permissioned" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-solution-permissioned">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm group-hover:text-primary transition">Permissioned Environments</span>
                </Link>
                <Link href="/solutions/token-extensions" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-solution-token-extensions">
                  <Layers className="h-4 w-4 text-green-500" />
                  <span className="text-sm group-hover:text-primary transition">Token Extensions</span>
                </Link>
              </div>
            </div>

            {/* Legal & Developer Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('members.legalDeveloper')}</h4>
              <div className="space-y-2">
                <Link href="/legal/terms-of-service" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-terms">
                  <FileText className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm group-hover:text-primary transition">Terms of Service</span>
                </Link>
                <Link href="/legal/privacy-policy" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-privacy">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm group-hover:text-primary transition">Privacy Policy</span>
                </Link>
                <Link href="/developers/api" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition group" data-testid="link-api">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-sm group-hover:text-primary transition">API Documentation</span>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}