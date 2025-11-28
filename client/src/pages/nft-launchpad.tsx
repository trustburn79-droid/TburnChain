import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Rocket, 
  Clock, 
  CheckCircle2, 
  Users, 
  Coins, 
  Star,
  Calendar,
  TrendingUp,
  Activity,
  Sparkles,
  Timer,
  AlertCircle,
  ChevronRight,
  Loader2,
  Gift,
  UserPlus,
} from "lucide-react";

const ENTERPRISE_WALLET = "0xTBURNEnterprise00000000000000000000000001";

interface LaunchpadProject {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  imageUrl: string | null;
  creatorAddress: string;
  totalSupply: string;
  mintPrice: string;
  maxPerWallet: number;
  status: string;
  featured: boolean;
  verified: boolean;
  aiScore: number | null;
  category: string | null;
  totalRaised: string;
  totalMinted: number;
  uniqueMinters: number;
  launchDate: string | null;
  endDate: string | null;
}

interface LaunchRound {
  id: string;
  projectId: string;
  name: string;
  roundType: string;
  startTime: string;
  endTime: string;
  price: string;
  allocation: number;
  totalMinted: number;
  status: string;
  whitelistRequired: boolean;
}

interface LaunchpadActivity {
  id: string;
  projectId: string;
  walletAddress: string | null;
  eventType: string;
  quantity: number | null;
  amount: string | null;
  txHash: string | null;
  createdAt: string;
}

interface LaunchpadOverview {
  totalProjects: number;
  activeProjects: number;
  upcomingProjects: number;
  completedProjects: number;
  totalRaised: string;
  totalMinted: number;
  uniqueParticipants: number;
  featuredCount: number;
}

function formatAmount(wei: string | null | undefined, decimals: number = 18): string {
  if (!wei || wei === "0") return "0";
  try {
    const value = BigInt(wei);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const remainder = value % divisor;
    const decimalStr = remainder.toString().padStart(decimals, '0').slice(0, 2);
    return `${integerPart.toLocaleString()}.${decimalStr}`;
  } catch {
    return "0";
  }
}

function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-500/10 text-green-500",
    pending: "bg-yellow-500/10 text-yellow-500",
    completed: "bg-blue-500/10 text-blue-500",
    cancelled: "bg-red-500/10 text-red-500",
    draft: "bg-gray-500/10 text-gray-500",
  };
  return colors[status] || colors.draft;
}

function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    mint: "text-green-500",
    project_created: "text-blue-500",
    round_started: "text-purple-500",
    round_ended: "text-orange-500",
    whitelist_added: "text-cyan-500",
    claim: "text-emerald-500",
  };
  return colors[type] || "text-gray-500";
}

function formatTimeRemaining(dateStr: string, endedText: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return endedText;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function ProjectCard({ 
  project, 
  onMint, 
  onWhitelist, 
  onClaim,
  mintLoading,
  whitelistLoading,
  claimLoading 
}: { 
  project: LaunchpadProject; 
  onMint?: (projectId: string) => void;
  onWhitelist?: (projectId: string) => void;
  onClaim?: (projectId: string) => void;
  mintLoading?: boolean;
  whitelistLoading?: boolean;
  claimLoading?: boolean;
}) {
  const { t } = useTranslation();
  const progress = parseInt(project.totalSupply) > 0 
    ? (project.totalMinted / parseInt(project.totalSupply)) * 100 
    : 0;

  const canMint = project.status === "active";
  const canWhitelist = project.status === "pending";
  const canClaim = project.status === "active" || project.status === "completed";
    
  return (
    <Card className="hover-elevate" data-testid={`card-project-${project.id}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {project.imageUrl ? (
              <img 
                src={project.imageUrl} 
                alt={project.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            {project.featured && (
              <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-0.5">
                <Star className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold truncate">{project.name}</span>
              {project.verified && (
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
              <Badge className={getStatusColor(project.status)}>
                {t(`nftLaunchpad.status.${project.status}`, { defaultValue: project.status })}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {project.symbol}
              {project.category && (
                <span className="ml-2 text-xs">#{project.category}</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("nftLaunchpad.projectCard.progress")}</span>
                <span className="font-medium">{project.totalMinted.toLocaleString()} / {parseInt(project.totalSupply).toLocaleString()}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t("nftLaunchpad.projectCard.price")} </span>
                <span className="font-medium">{formatAmount(project.mintPrice)} TBURN</span>
              </div>
              {project.aiScore && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="font-medium">{project.aiScore.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {canMint && onMint && (
                <Button 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); onMint(project.id); }}
                  disabled={mintLoading}
                  data-testid={`button-mint-${project.id}`}
                >
                  {mintLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-1" />
                  )}
                  {t("nftLaunchpad.projectCard.mint")}
                </Button>
              )}
              {canWhitelist && onWhitelist && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); onWhitelist(project.id); }}
                  disabled={whitelistLoading}
                  data-testid={`button-whitelist-${project.id}`}
                >
                  {whitelistLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-1" />
                  )}
                  {t("nftLaunchpad.projectCard.joinWhitelist")}
                </Button>
              )}
              {canClaim && onClaim && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onClaim(project.id); }}
                  disabled={claimLoading}
                  data-testid={`button-claim-${project.id}`}
                >
                  {claimLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Gift className="w-4 h-4 mr-1" />
                  )}
                  {t("nftLaunchpad.projectCard.claimNft")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoundCard({ round, project }: { round: LaunchRound; project?: LaunchpadProject }) {
  const { t } = useTranslation();
  const progress = round.allocation > 0 
    ? (round.totalMinted / round.allocation) * 100 
    : 0;
    
  return (
    <Card className="hover-elevate" data-testid={`card-round-${round.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold">{round.name}</div>
            {project && (
              <div className="text-sm text-muted-foreground">{project.name}</div>
            )}
          </div>
          <Badge className={getStatusColor(round.status)}>
            {t(`nftLaunchpad.status.${round.status}`, { defaultValue: round.status })}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <div className="text-muted-foreground">{t("nftLaunchpad.roundCard.price")}</div>
            <div className="font-medium">{formatAmount(round.price)} TBURN</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("nftLaunchpad.roundCard.allocation")}</div>
            <div className="font-medium">{round.allocation.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("nftLaunchpad.roundCard.type")}</div>
            <div className="font-medium capitalize">{t(`nftLaunchpad.roundTypes.${round.roundType}`, { defaultValue: round.roundType })}</div>
          </div>
          <div>
            <div className="text-muted-foreground">
              {round.status === "active" ? t("nftLaunchpad.roundCard.endsIn") : t("nftLaunchpad.roundCard.status")}
            </div>
            <div className="font-medium">
              {round.status === "active" 
                ? formatTimeRemaining(round.endTime, t("nftLaunchpad.timeRemaining.ended"))
                : t(`nftLaunchpad.status.${round.status}`, { defaultValue: round.status })
              }
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("nftLaunchpad.roundCard.minted")}</span>
            <span>{round.totalMinted.toLocaleString()} / {round.allocation.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {round.whitelistRequired && (
          <div className="flex items-center gap-1 mt-2 text-sm text-yellow-500">
            <AlertCircle className="w-3 h-3" />
            <span>{t("nftLaunchpad.roundCard.whitelistRequired")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: LaunchpadActivity }) {
  const { t } = useTranslation();
  const eventTypeKey = `nftLaunchpad.eventTypes.${activity.eventType}` as const;
  const eventTypeText = t(eventTypeKey, { defaultValue: activity.eventType.replace(/_/g, ' ') });
  
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`row-activity-${activity.id}`}>
      <div className={`p-2 rounded-lg bg-muted ${getEventTypeColor(activity.eventType)}`}>
        <Activity className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize">{eventTypeText}</span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {activity.walletAddress && (
            <span>{shortenAddress(activity.walletAddress)}</span>
          )}
          {activity.quantity && (
            <span>{t("nftLaunchpad.activity.quantity")} {activity.quantity}</span>
          )}
        </div>
      </div>
      {activity.amount && (
        <div className="text-right">
          <div className="font-medium">{formatAmount(activity.amount)} TBURN</div>
        </div>
      )}
    </div>
  );
}

export default function NftLaunchpadPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const { data: overview, isLoading: overviewLoading } = useQuery<LaunchpadOverview>({
    queryKey: ["/api/launchpad/stats"],
    refetchInterval: 10000,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<LaunchpadProject[]>({
    queryKey: ["/api/launchpad/projects"],
    refetchInterval: 15000,
  });

  const { data: featuredProjects } = useQuery<LaunchpadProject[]>({
    queryKey: ["/api/launchpad/projects/featured"],
    refetchInterval: 30000,
  });

  const { data: activeRounds } = useQuery<LaunchRound[]>({
    queryKey: ["/api/launchpad/rounds/active"],
    refetchInterval: 10000,
  });

  const { data: activity } = useQuery<LaunchpadActivity[]>({
    queryKey: ["/api/launchpad/activity"],
    refetchInterval: 5000,
  });

  const mintMutation = useMutation({
    mutationFn: async ({ projectId, quantity }: { projectId: string; quantity: number }) => {
      const res = await apiRequest("POST", "/api/launchpad/mint", {
        projectId,
        walletAddress: ENTERPRISE_WALLET,
        quantity,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("nftLaunchpad.toast.mintSuccess"),
        description: t("nftLaunchpad.toast.mintSuccessDesc", { 
          quantity: data.quantity, 
          projectName: data.projectName, 
          txHash: data.txHash.slice(0, 10) 
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/activity"] });
    },
    onError: (error: any) => {
      toast({
        title: t("nftLaunchpad.toast.mintFailed"),
        description: error.message || t("nftLaunchpad.toast.mintFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const whitelistMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await apiRequest("POST", "/api/launchpad/whitelist/join", {
        projectId,
        walletAddress: ENTERPRISE_WALLET,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("nftLaunchpad.toast.whitelistJoined"),
        description: t("nftLaunchpad.toast.whitelistJoinedDesc", { 
          projectName: data.projectName, 
          allocation: data.allocation 
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/activity"] });
    },
    onError: (error: any) => {
      toast({
        title: t("nftLaunchpad.toast.whitelistFailed"),
        description: error.message || t("nftLaunchpad.toast.whitelistFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await apiRequest("POST", "/api/launchpad/claim", {
        projectId,
        walletAddress: ENTERPRISE_WALLET,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("nftLaunchpad.toast.claimSuccess"),
        description: t("nftLaunchpad.toast.claimSuccessDesc", { 
          claimed: data.claimed, 
          projectName: data.projectName, 
          txHash: data.txHash.slice(0, 10) 
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/activity"] });
    },
    onError: (error: any) => {
      toast({
        title: t("nftLaunchpad.toast.claimFailed"),
        description: error.message || t("nftLaunchpad.toast.claimFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const handleMint = (projectId: string) => {
    mintMutation.mutate({ projectId, quantity: 1 });
  };

  const handleWhitelist = (projectId: string) => {
    whitelistMutation.mutate(projectId);
  };

  const handleClaim = (projectId: string) => {
    claimMutation.mutate(projectId);
  };

  const activeProjects = projects?.filter(p => p.status === "active") || [];
  const upcomingProjects = projects?.filter(p => p.status === "pending") || [];
  const completedProjects = projects?.filter(p => p.status === "completed") || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t("nftLaunchpad.title")}</h1>
          <p className="text-muted-foreground">
            {t("nftLaunchpad.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Rocket className="w-4 h-4" />
              <span className="text-sm">{t("nftLaunchpad.stats.totalProjects")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-projects">
                {overview?.totalProjects || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t("nftLaunchpad.stats.active")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold text-green-500" data-testid="text-active-projects">
                {overview?.activeProjects || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t("nftLaunchpad.stats.upcoming")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold text-yellow-500" data-testid="text-upcoming-projects">
                {overview?.upcomingProjects || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-sm">{t("nftLaunchpad.stats.totalRaised")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-raised">
                {formatAmount(overview?.totalRaised || "0")} TBURN
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">{t("nftLaunchpad.stats.totalMinted")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-minted">
                {overview?.totalMinted?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{t("nftLaunchpad.stats.participants")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-participants">
                {overview?.uniqueParticipants?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Rocket className="w-4 h-4 mr-2" />
            {t("nftLaunchpad.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("nftLaunchpad.tabs.active")} ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            <Clock className="w-4 h-4 mr-2" />
            {t("nftLaunchpad.tabs.upcoming")} ({upcomingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {t("nftLaunchpad.tabs.completed")} ({completedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {t("nftLaunchpad.sections.featuredLaunches")}
                </CardTitle>
                <CardDescription>{t("nftLaunchpad.sections.featuredLaunchesDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {projectsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                      ))
                    ) : (
                      featuredProjects?.map(project => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          onMint={handleMint}
                          onWhitelist={handleWhitelist}
                          onClaim={handleClaim}
                          mintLoading={mintMutation.isPending}
                          whitelistLoading={whitelistMutation.isPending}
                          claimLoading={claimMutation.isPending}
                        />
                      ))
                    )}
                    {!projectsLoading && (!featuredProjects || featuredProjects.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        {t("nftLaunchpad.sections.noFeaturedProjects")}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-green-500" />
                  {t("nftLaunchpad.sections.activeRounds")}
                </CardTitle>
                <CardDescription>{t("nftLaunchpad.sections.activeRoundsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {activeRounds?.map(round => {
                      const project = projects?.find(p => p.id === round.projectId);
                      return (
                        <RoundCard key={round.id} round={round} project={project} />
                      );
                    })}
                    {(!activeRounds || activeRounds.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        {t("nftLaunchpad.sections.noActiveRounds")}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                {t("nftLaunchpad.sections.recentActivity")}
              </CardTitle>
              <CardDescription>{t("nftLaunchpad.sections.recentActivityDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {activity?.slice(0, 20).map(act => (
                    <ActivityRow key={act.id} activity={act} />
                  ))}
                  {!activity?.length && (
                    <div className="py-8 text-center text-muted-foreground">
                      {t("nftLaunchpad.sections.noRecentActivity")}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("nftLaunchpad.sections.activeLaunches")}</CardTitle>
              <CardDescription>{t("nftLaunchpad.sections.activeLaunchesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))
                ) : (
                  activeProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      onMint={handleMint}
                      onWhitelist={handleWhitelist}
                      onClaim={handleClaim}
                      mintLoading={mintMutation.isPending}
                      whitelistLoading={whitelistMutation.isPending}
                      claimLoading={claimMutation.isPending}
                    />
                  ))
                )}
              </div>
              {!projectsLoading && activeProjects.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftLaunchpad.sections.noActiveLaunches")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("nftLaunchpad.sections.upcomingLaunches")}</CardTitle>
              <CardDescription>{t("nftLaunchpad.sections.upcomingLaunchesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))
                ) : (
                  upcomingProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      onMint={handleMint}
                      onWhitelist={handleWhitelist}
                      onClaim={handleClaim}
                      mintLoading={mintMutation.isPending}
                      whitelistLoading={whitelistMutation.isPending}
                      claimLoading={claimMutation.isPending}
                    />
                  ))
                )}
              </div>
              {!projectsLoading && upcomingProjects.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftLaunchpad.sections.noUpcomingLaunches")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("nftLaunchpad.sections.completedLaunches")}</CardTitle>
              <CardDescription>{t("nftLaunchpad.sections.completedLaunchesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))
                ) : (
                  completedProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      onMint={handleMint}
                      onWhitelist={handleWhitelist}
                      onClaim={handleClaim}
                      mintLoading={mintMutation.isPending}
                      whitelistLoading={whitelistMutation.isPending}
                      claimLoading={claimMutation.isPending}
                    />
                  ))
                )}
              </div>
              {!projectsLoading && completedProjects.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftLaunchpad.sections.noCompletedLaunches")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
