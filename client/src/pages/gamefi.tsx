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
  Gamepad2, 
  Trophy, 
  Users, 
  Coins, 
  Star,
  TrendingUp,
  Activity,
  Sparkles,
  Timer,
  Award,
  Crown,
  Swords,
  Target,
  Medal,
  Zap,
  Gift,
  Package,
  Shield,
  Loader2,
} from "lucide-react";

const ENTERPRISE_WALLET = "0xTBURNEnterprise7890abcdef1234567890abcdef";

interface GamefiProject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  category: string;
  genre: string | null;
  developer: string | null;
  status: string;
  featured: boolean;
  verified: boolean;
  totalPlayers: number;
  activePlayers24h: number;
  totalVolume: string;
  dailyVolume: string;
  totalRewardsDistributed: string;
  aiScore: number | null;
  rating: number;
  ratingCount: number;
  playToEarnEnabled: boolean;
  stakingEnabled: boolean;
  tournamentEnabled: boolean;
}

interface GameTournament {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  tournamentType: string;
  status: string;
  entryFee: string;
  prizePool: string;
  maxParticipants: number;
  currentParticipants: number;
  startTime: string | null;
  endTime: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  requiresNft: boolean;
}

interface GameLeaderboard {
  id: string;
  projectId: string;
  walletAddress: string;
  playerName: string | null;
  rank: number;
  score: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winStreak: number;
  totalEarned: string;
}

interface GamefiActivity {
  id: string;
  projectId: string | null;
  walletAddress: string | null;
  eventType: string;
  amount: string | null;
  createdAt: string;
}

interface GamefiOverview {
  totalProjects: number;
  activeProjects: number;
  totalPlayers: number;
  activePlayers24h: number;
  totalVolume: string;
  dailyVolume: string;
  totalRewardsDistributed: string;
  activeTournaments: number;
}

interface AchievementBadge {
  id: string;
  name: string;
  description: string | null;
  category: string;
  rarity: string;
  points: number;
  totalUnlocks: number;
  rewardAmount: string | null;
}

interface GameAsset {
  id: string;
  projectId: string;
  tokenId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  assetType: string;
  rarity: string;
  ownerAddress: string | null;
  price: string | null;
  isListed: boolean;
  isStaked: boolean;
  attributes: Record<string, any> | null;
}

interface PendingReward {
  id: string;
  projectId: string;
  walletAddress: string;
  rewardType: string;
  amount: string;
  status: string;
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
    beta: "bg-yellow-500/10 text-yellow-500",
    coming_soon: "bg-blue-500/10 text-blue-500",
    maintenance: "bg-orange-500/10 text-orange-500",
    deprecated: "bg-red-500/10 text-red-500",
    upcoming: "bg-blue-500/10 text-blue-500",
    registration: "bg-purple-500/10 text-purple-500",
    completed: "bg-gray-500/10 text-gray-500",
  };
  return colors[status] || colors.active;
}

function getTournamentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    upcoming: "bg-blue-500/10 text-blue-500",
    registration: "bg-purple-500/10 text-purple-500",
    active: "bg-green-500/10 text-green-500",
    completed: "bg-gray-500/10 text-gray-500",
    cancelled: "bg-red-500/10 text-red-500",
  };
  return colors[status] || colors.upcoming;
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "bg-gray-500/10 text-gray-500",
    uncommon: "bg-green-500/10 text-green-500",
    rare: "bg-blue-500/10 text-blue-500",
    epic: "bg-purple-500/10 text-purple-500",
    legendary: "bg-yellow-500/10 text-yellow-500",
    mythic: "bg-red-500/10 text-red-500",
  };
  return colors[rarity] || colors.common;
}

function getEventTypeIcon(type: string) {
  const icons: Record<string, any> = {
    game_started: Gamepad2,
    game_ended: Target,
    reward_earned: Coins,
    asset_minted: Sparkles,
    asset_transferred: Gift,
    tournament_joined: Swords,
    tournament_won: Crown,
    achievement_unlocked: Award,
    level_up: TrendingUp,
  };
  return icons[type] || Activity;
}

function formatTimeRemaining(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return "Started";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function ProjectCard({ project }: { project: GamefiProject }) {
  return (
    <Card className="hover-elevate cursor-pointer" data-testid={`card-project-${project.id}`}>
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
                <Gamepad2 className="w-8 h-8 text-muted-foreground" />
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
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {project.category}
              {project.genre && (
                <span className="ml-2 text-xs">#{project.genre}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{project.activePlayers24h.toLocaleString()} active</span>
              </div>
              {project.aiScore && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>{project.aiScore.toFixed(1)}</span>
                </div>
              )}
              {project.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{project.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {project.playToEarnEnabled && (
                <Badge variant="outline" className="text-xs py-0">P2E</Badge>
              )}
              {project.stakingEnabled && (
                <Badge variant="outline" className="text-xs py-0">Staking</Badge>
              )}
              {project.tournamentEnabled && (
                <Badge variant="outline" className="text-xs py-0">Tournaments</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TournamentCard({ 
  tournament, 
  project,
  onJoin,
  isJoining,
}: { 
  tournament: GameTournament; 
  project?: GamefiProject;
  onJoin?: (tournamentId: string) => void;
  isJoining?: boolean;
}) {
  const progress = tournament.maxParticipants > 0 
    ? (tournament.currentParticipants / tournament.maxParticipants) * 100 
    : 0;
  
  const canJoin = (tournament.status === "upcoming" || tournament.status === "registration") 
    && tournament.currentParticipants < tournament.maxParticipants;
    
  return (
    <Card className="hover-elevate" data-testid={`card-tournament-${tournament.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold">{tournament.name}</div>
            {project && (
              <div className="text-sm text-muted-foreground">{project.name}</div>
            )}
          </div>
          <Badge className={getTournamentStatusColor(tournament.status)}>
            {tournament.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <div className="text-muted-foreground">Prize Pool</div>
            <div className="font-medium">{formatAmount(tournament.prizePool)} TBURN</div>
          </div>
          <div>
            <div className="text-muted-foreground">Entry Fee</div>
            <div className="font-medium">
              {tournament.entryFee && tournament.entryFee !== "0" 
                ? `${formatAmount(tournament.entryFee)} TBURN` 
                : "Free"
              }
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Type</div>
            <div className="font-medium capitalize">{tournament.tournamentType.replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div className="text-muted-foreground">
              {tournament.status === "upcoming" ? "Starts In" : "Status"}
            </div>
            <div className="font-medium">
              {tournament.startTime && tournament.status === "upcoming"
                ? formatTimeRemaining(tournament.startTime)
                : tournament.status
              }
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Participants</span>
            <span>{tournament.currentParticipants} / {tournament.maxParticipants}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {tournament.requiresNft && (
          <div className="flex items-center gap-1 mt-2 text-sm text-purple-500">
            <Sparkles className="w-3 h-3" />
            <span>NFT required</span>
          </div>
        )}
        {onJoin && canJoin && (
          <Button 
            className="w-full mt-3" 
            size="sm"
            onClick={() => onJoin(tournament.id)}
            disabled={isJoining}
            data-testid={`button-join-tournament-${tournament.id}`}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Swords className="w-4 h-4 mr-2" />
                Join Tournament
              </>
            )}
          </Button>
        )}
        {tournament.status === "completed" && (
          <div className="mt-3 text-center text-sm text-muted-foreground">
            Tournament completed
          </div>
        )}
        {tournament.status === "active" && (
          <div className="mt-3 text-center text-sm text-green-500 font-medium">
            Tournament in progress
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AssetCard({ 
  asset, 
  onEquip,
  isEquipping,
}: { 
  asset: GameAsset;
  onEquip?: (assetId: string) => void;
  isEquipping?: boolean;
}) {
  const isEquipped = asset.attributes?.equipped === true;
  
  return (
    <Card className="hover-elevate" data-testid={`card-asset-${asset.id}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {asset.imageUrl ? (
              <img 
                src={asset.imageUrl} 
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            {isEquipped && (
              <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                <Shield className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{asset.name}</span>
              <Badge className={getRarityColor(asset.rarity)}>
                {asset.rarity}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {asset.assetType}
            </div>
            {asset.attributes?.level && (
              <div className="text-xs text-muted-foreground mt-1">
                Level {asset.attributes.level}
              </div>
            )}
          </div>
        </div>
        {onEquip && (
          <Button 
            className="w-full mt-3" 
            size="sm"
            variant={isEquipped ? "outline" : "default"}
            onClick={() => onEquip(asset.id)}
            disabled={isEquipping}
            data-testid={`button-equip-asset-${asset.id}`}
          >
            {isEquipping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEquipped ? "Unequipping..." : "Equipping..."}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {isEquipped ? "Unequip" : "Equip"}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({ entry, rank }: { entry: GameLeaderboard; rank: number }) {
  const rankIcon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : null;
  const RankIcon = rankIcon;
  
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`row-leaderboard-${entry.id}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
        rank === 2 ? 'bg-gray-400/20 text-gray-400' :
        rank === 3 ? 'bg-orange-500/20 text-orange-500' :
        'bg-muted text-muted-foreground'
      }`}>
        {RankIcon ? <RankIcon className="w-4 h-4" /> : <span className="text-sm font-medium">{rank}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{entry.playerName || shortenAddress(entry.walletAddress)}</div>
        <div className="text-sm text-muted-foreground">
          {entry.wins}W / {entry.losses}L ({entry.gamesPlayed} games)
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{parseInt(entry.score).toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">{formatAmount(entry.totalEarned)} earned</div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: AchievementBadge }) {
  return (
    <Card className="hover-elevate" data-testid={`card-badge-${badge.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Award className={`w-6 h-6 ${
              badge.rarity === 'legendary' ? 'text-yellow-500' :
              badge.rarity === 'epic' ? 'text-purple-500' :
              badge.rarity === 'rare' ? 'text-blue-500' :
              'text-muted-foreground'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{badge.name}</span>
              <Badge className={getRarityColor(badge.rarity)}>
                {badge.rarity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{badge.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{badge.points} pts</span>
              <span>{badge.totalUnlocks?.toLocaleString() || 0} unlocks</span>
              {badge.rewardAmount && (
                <span className="text-green-500">{formatAmount(badge.rewardAmount)} TBURN</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: GamefiActivity }) {
  const IconComponent = getEventTypeIcon(activity.eventType);
  
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`row-activity-${activity.id}`}>
      <div className="p-2 rounded-lg bg-muted">
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium capitalize">{activity.eventType.replace(/_/g, ' ')}</div>
        <div className="text-sm text-muted-foreground">
          {activity.walletAddress && shortenAddress(activity.walletAddress)}
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

export default function GameFiPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [joiningTournamentId, setJoiningTournamentId] = useState<string | null>(null);
  const [equippingAssetId, setEquippingAssetId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: overview, isLoading: overviewLoading } = useQuery<GamefiOverview>({
    queryKey: ["/api/gamefi/stats"],
    refetchInterval: 10000,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<GamefiProject[]>({
    queryKey: ["/api/gamefi/projects"],
    refetchInterval: 15000,
  });

  const { data: featuredProjects } = useQuery<GamefiProject[]>({
    queryKey: ["/api/gamefi/projects/featured"],
    refetchInterval: 30000,
  });

  const { data: tournaments } = useQuery<GameTournament[]>({
    queryKey: ["/api/gamefi/tournaments"],
    refetchInterval: 15000,
  });

  const { data: activeTournaments } = useQuery<GameTournament[]>({
    queryKey: ["/api/gamefi/tournaments/active"],
    refetchInterval: 10000,
  });

  const { data: badges } = useQuery<AchievementBadge[]>({
    queryKey: ["/api/gamefi/badges/global"],
    refetchInterval: 60000,
  });

  const { data: activity } = useQuery<GamefiActivity[]>({
    queryKey: ["/api/gamefi/activity"],
    refetchInterval: 5000,
  });

  const { data: myAssets, isLoading: assetsLoading } = useQuery<GameAsset[]>({
    queryKey: ["/api/gamefi/assets/owner", ENTERPRISE_WALLET],
    refetchInterval: 15000,
  });

  const { data: pendingRewards, isLoading: rewardsLoading } = useQuery<PendingReward[]>({
    queryKey: ["/api/gamefi/player", ENTERPRISE_WALLET, "pending-rewards"],
    refetchInterval: 10000,
  });

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await apiRequest("POST", `/api/gamefi/tournaments/${tournamentId}/join`, {
        walletAddress: ENTERPRISE_WALLET,
        playerName: "Enterprise Player",
      });
      return response.json();
    },
    onMutate: (tournamentId) => {
      setJoiningTournamentId(tournamentId);
    },
    onSuccess: (data) => {
      toast({
        title: "Joined Tournament",
        description: data.message || "Successfully joined the tournament!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/tournaments/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Join",
        description: error.message || "Could not join the tournament",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setJoiningTournamentId(null);
    },
  });

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/gamefi/rewards/claim", {
        walletAddress: ENTERPRISE_WALLET,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rewards Claimed",
        description: data.message || `Successfully claimed ${data.claimedCount} rewards!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/player", ENTERPRISE_WALLET, "pending-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Claim",
        description: error.message || "Could not claim rewards",
        variant: "destructive",
      });
    },
  });

  const equipAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const response = await apiRequest("POST", `/api/gamefi/assets/${assetId}/equip`, {
        walletAddress: ENTERPRISE_WALLET,
      });
      return response.json();
    },
    onMutate: (assetId) => {
      setEquippingAssetId(assetId);
    },
    onSuccess: (data) => {
      toast({
        title: data.asset?.isEquipped ? "Asset Equipped" : "Asset Unequipped",
        description: data.message || "Successfully updated asset!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/assets/owner", ENTERPRISE_WALLET] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Asset",
        description: error.message || "Could not update asset",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setEquippingAssetId(null);
    },
  });

  const handleJoinTournament = (tournamentId: string) => {
    joinTournamentMutation.mutate(tournamentId);
  };

  const handleClaimRewards = () => {
    claimRewardsMutation.mutate();
  };

  const handleEquipAsset = (assetId: string) => {
    equipAssetMutation.mutate(assetId);
  };

  const activeProjects = projects?.filter(p => p.status === "active") || [];
  const totalPendingRewards = pendingRewards?.reduce((acc, r) => acc + BigInt(r.amount || 0), BigInt(0)) || BigInt(0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">GameFi Hub</h1>
          <p className="text-muted-foreground">
            Play-to-earn games, tournaments, and achievements on TBURN blockchain
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span className="text-sm">Games</span>
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
              <span className="text-sm">Active</span>
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
              <Users className="w-4 h-4" />
              <span className="text-sm">Players</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-players">
                {overview?.totalPlayers?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Active 24h</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold text-blue-500" data-testid="text-active-players">
                {overview?.activePlayers24h?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-sm">Volume</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-volume">
                {formatAmount(overview?.totalVolume || "0")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm">24h Vol</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-daily-volume">
                {formatAmount(overview?.dailyVolume || "0")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Gift className="w-4 h-4" />
              <span className="text-sm">Rewards</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold text-green-500" data-testid="text-rewards">
                {formatAmount(overview?.totalRewardsDistributed || "0")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">Tournaments</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-xl font-bold text-purple-500" data-testid="text-tournaments">
                {overview?.activeTournaments || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="games" data-testid="tab-games">
            <Sparkles className="w-4 h-4 mr-2" />
            Games ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="tournaments" data-testid="tab-tournaments">
            <Trophy className="w-4 h-4 mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="my-assets" data-testid="tab-my-assets">
            <Package className="w-4 h-4 mr-2" />
            My Assets
          </TabsTrigger>
          <TabsTrigger value="rewards" data-testid="tab-rewards">
            <Gift className="w-4 h-4 mr-2" />
            Rewards {pendingRewards?.length ? `(${pendingRewards.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Featured Games
                </CardTitle>
                <CardDescription>Top-rated games on TBURN blockchain</CardDescription>
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
                        <ProjectCard key={project.id} project={project} />
                      ))
                    )}
                    {!projectsLoading && (!featuredProjects || featuredProjects.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        No featured games
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  Live Tournaments
                </CardTitle>
                <CardDescription>Active and upcoming competitions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {activeTournaments?.map(tournament => {
                      const project = projects?.find(p => p.id === tournament.projectId);
                      return (
                        <TournamentCard 
                          key={tournament.id} 
                          tournament={tournament} 
                          project={project}
                          onJoin={handleJoinTournament}
                          isJoining={joiningTournamentId === tournament.id}
                        />
                      );
                    })}
                    {(!activeTournaments || activeTournaments.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        No active tournaments
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
                Recent Activity
              </CardTitle>
              <CardDescription>Latest GameFi events</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {activity?.slice(0, 20).map(act => (
                    <ActivityRow key={act.id} activity={act} />
                  ))}
                  {!activity?.length && (
                    <div className="py-8 text-center text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Games</CardTitle>
              <CardDescription>Browse all games on TBURN blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))
                ) : (
                  projects?.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                )}
              </div>
              {!projectsLoading && (!projects || projects.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">
                  No games available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tournaments</CardTitle>
              <CardDescription>Browse all tournaments and competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments?.map(tournament => {
                  const project = projects?.find(p => p.id === tournament.projectId);
                  return (
                    <TournamentCard 
                      key={tournament.id} 
                      tournament={tournament} 
                      project={project}
                      onJoin={handleJoinTournament}
                      isJoining={joiningTournamentId === tournament.id}
                    />
                  );
                })}
              </div>
              {(!tournaments || tournaments.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">
                  No tournaments available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                My Game Assets
              </CardTitle>
              <CardDescription>
                Manage your in-game assets - Wallet: {shortenAddress(ENTERPRISE_WALLET)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : myAssets && myAssets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myAssets.map(asset => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset}
                      onEquip={handleEquipAsset}
                      isEquipping={equippingAssetId === asset.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No assets owned yet</p>
                  <p className="text-sm mt-2">Play games to earn or purchase assets</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-500" />
                    Pending Rewards
                  </CardTitle>
                  <CardDescription>
                    Claim your earned rewards - Wallet: {shortenAddress(ENTERPRISE_WALLET)}
                  </CardDescription>
                </div>
                {pendingRewards && pendingRewards.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Claimable</div>
                      <div className="text-xl font-bold text-green-500">
                        {formatAmount(totalPendingRewards.toString())} TBURN
                      </div>
                    </div>
                    <Button 
                      onClick={handleClaimRewards}
                      disabled={claimRewardsMutation.isPending}
                      data-testid="button-claim-all-rewards"
                    >
                      {claimRewardsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Claim All Rewards
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {rewardsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingRewards && pendingRewards.length > 0 ? (
                <div className="space-y-3">
                  {pendingRewards.map(reward => (
                    <div 
                      key={reward.id} 
                      className="flex items-center justify-between p-4 rounded-lg border"
                      data-testid={`row-reward-${reward.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Coins className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {reward.rewardType.replace(/_/g, ' ')} Reward
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {shortenAddress(reward.walletAddress)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">
                          {formatAmount(reward.amount)} TBURN
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {reward.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending rewards</p>
                  <p className="text-sm mt-2">Play games and join tournaments to earn rewards</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Achievements</CardTitle>
              <CardDescription>Unlock badges across all games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map(badge => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
              {(!badges || badges.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">
                  No achievements available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
