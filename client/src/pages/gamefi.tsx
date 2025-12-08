import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WalletRequiredBanner } from "@/components/require-wallet";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
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
  RefreshCw,
  Search,
  ChevronRight,
  ExternalLink,
  Share2,
  Copy,
  CheckCircle2,
  Play,
  BarChart3,
  Clock,
  Eye,
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

interface TournamentParticipant {
  id: string;
  tournamentId: string;
  walletAddress: string;
  playerName: string | null;
  rank: number | null;
  score: string;
  status: string;
  joinedAt: string;
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
    const divisor = 10n ** BigInt(decimals);
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

function getStatusTranslationKey(status: string): string {
  const statusMap: Record<string, string> = {
    active: "gamefi.statusActive",
    beta: "gamefi.statusBeta",
    coming_soon: "gamefi.statusComingSoon",
    maintenance: "gamefi.statusMaintenance",
    deprecated: "gamefi.statusDeprecated",
    upcoming: "gamefi.statusUpcoming",
    registration: "gamefi.statusRegistration",
    completed: "gamefi.statusCompleted",
    cancelled: "gamefi.statusCancelled",
  };
  return statusMap[status] || "gamefi.statusActive";
}

function getRarityTranslationKey(rarity: string): string {
  const rarityMap: Record<string, string> = {
    common: "gamefi.rarityCommon",
    uncommon: "gamefi.rarityUncommon",
    rare: "gamefi.rarityRare",
    epic: "gamefi.rarityEpic",
    legendary: "gamefi.rarityLegendary",
    mythic: "gamefi.rarityMythic",
  };
  return rarityMap[rarity] || "gamefi.rarityCommon";
}

function getTournamentTypeTranslationKey(type: string): string {
  const typeMap: Record<string, string> = {
    single_elimination: "gamefi.tournamentTypeSingleElimination",
    double_elimination: "gamefi.tournamentTypeDoubleElimination",
    round_robin: "gamefi.tournamentTypeRoundRobin",
    swiss: "gamefi.tournamentTypeSwiss",
    battle_royale: "gamefi.tournamentTypeBattleRoyale",
    ladder: "gamefi.tournamentTypeLadder",
  };
  return typeMap[type] || "gamefi.tournamentTypeOther";
}

function getAssetTypeTranslationKey(type: string): string {
  const typeMap: Record<string, string> = {
    weapon: "gamefi.assetTypeWeapon",
    armor: "gamefi.assetTypeArmor",
    accessory: "gamefi.assetTypeAccessory",
    consumable: "gamefi.assetTypeConsumable",
    pet: "gamefi.assetTypePet",
    mount: "gamefi.assetTypeMount",
    skin: "gamefi.assetTypeSkin",
    character: "gamefi.assetTypeCharacter",
  };
  return typeMap[type] || "gamefi.assetTypeOther";
}

function getCategoryTranslationKey(category: string): string {
  const categoryMap: Record<string, string> = {
    card: "gamefi.categoryCard",
    racing: "gamefi.categoryRacing",
    rpg: "gamefi.categoryRpg",
    action: "gamefi.categoryAction",
    strategy: "gamefi.categoryStrategy",
    puzzle: "gamefi.categoryPuzzle",
    sports: "gamefi.categorySports",
    adventure: "gamefi.categoryAdventure",
    simulation: "gamefi.categorySimulation",
    casual: "gamefi.categoryCasual",
  };
  return categoryMap[category?.toLowerCase()] || category;
}

function getGenreTranslationKey(genre: string): string {
  const genreMap: Record<string, string> = {
    "Trading Card": "gamefi.genreTradingCard",
    "trading card": "gamefi.genreTradingCard",
    "Racing": "gamefi.genreRacing",
    "racing": "gamefi.genreRacing",
    "Adventure": "gamefi.genreAdventure",
    "adventure": "gamefi.genreAdventure",
    "RPG": "gamefi.genreRpg",
    "rpg": "gamefi.genreRpg",
    "Action": "gamefi.genreAction",
    "action": "gamefi.genreAction",
    "Strategy": "gamefi.genreStrategy",
    "strategy": "gamefi.genreStrategy",
    "Puzzle": "gamefi.genrePuzzle",
    "puzzle": "gamefi.genrePuzzle",
    "Sports": "gamefi.genreSports",
    "sports": "gamefi.genreSports",
    "Sports Manager": "gamefi.genreSportsManager",
    "sports manager": "gamefi.genreSportsManager",
    "Simulation": "gamefi.genreSimulation",
    "simulation": "gamefi.genreSimulation",
    "Casual": "gamefi.genreCasual",
    "casual": "gamefi.genreCasual",
    "MMORPG": "gamefi.genreMmorpg",
    "mmorpg": "gamefi.genreMmorpg",
    "Battle Royale": "gamefi.genreBattleRoyale",
    "battle royale": "gamefi.genreBattleRoyale",
    "Farm Simulator": "gamefi.genreFarmSimulator",
    "farm simulator": "gamefi.genreFarmSimulator",
  };
  return genreMap[genre] || genre;
}

function useCountdown(targetDate: string | null): string | null {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setCountdown(null);
      return;
    }

    const calculateCountdown = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        return null;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
      return `${minutes}m ${seconds}s`;
    };

    setCountdown(calculateCountdown());
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return countdown;
}

function ProjectCard({ 
  project, 
  onClick 
}: { 
  project: GamefiProject; 
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all" 
      onClick={onClick}
      data-testid={`card-project-${project.id}`}
    >
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold truncate">{project.name}</span>
              {project.verified && (
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
              <Badge className={getStatusColor(project.status)}>
                {t(getStatusTranslationKey(project.status))}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {t(getCategoryTranslationKey(project.category))}
              {project.genre && (
                <span className="ml-2 text-xs">#{t(getGenreTranslationKey(project.genre))}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{project.activePlayers24h.toLocaleString()} {t("gamefi.active")}</span>
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
                <Badge variant="outline" className="text-xs py-0">{t("gamefi.p2e")}</Badge>
              )}
              {project.stakingEnabled && (
                <Badge variant="outline" className="text-xs py-0">{t("gamefi.staking")}</Badge>
              )}
              {project.tournamentEnabled && (
                <Badge variant="outline" className="text-xs py-0">{t("gamefi.tournaments")}</Badge>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground self-center flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function TournamentCard({ 
  tournament, 
  project,
  onClick,
  onJoin,
  isJoining,
}: { 
  tournament: GameTournament; 
  project?: GamefiProject;
  onClick?: () => void;
  onJoin?: (tournamentId: string) => void;
  isJoining?: boolean;
}) {
  const { t } = useTranslation();
  const progress = tournament.maxParticipants > 0 
    ? (tournament.currentParticipants / tournament.maxParticipants) * 100 
    : 0;
  const countdown = useCountdown(tournament.status === "upcoming" || tournament.status === "registration" ? tournament.startTime : null);
  
  const canJoin = (tournament.status === "upcoming" || tournament.status === "registration") 
    && tournament.currentParticipants < tournament.maxParticipants;
    
  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all" 
      onClick={onClick}
      data-testid={`card-tournament-${tournament.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{tournament.name}</div>
            {project && (
              <div className="text-sm text-muted-foreground truncate">{project.name}</div>
            )}
          </div>
          <Badge className={getTournamentStatusColor(tournament.status)}>
            {t(getStatusTranslationKey(tournament.status))}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <div className="text-muted-foreground">{t("gamefi.prizePool")}</div>
            <div className="font-medium">{formatAmount(tournament.prizePool)} TBURN</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("gamefi.entryFee")}</div>
            <div className="font-medium">
              {tournament.entryFee && tournament.entryFee !== "0" 
                ? `${formatAmount(tournament.entryFee)} TBURN` 
                : t("gamefi.free")
              }
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("gamefi.type")}</div>
            <div className="font-medium capitalize">{t(getTournamentTypeTranslationKey(tournament.tournamentType))}</div>
          </div>
          <div>
            <div className="text-muted-foreground">
              {countdown ? t("gamefi.startsIn") : t("gamefi.status")}
            </div>
            <div className="font-medium flex items-center gap-1">
              {countdown ? (
                <>
                  <Timer className="w-3 h-3 text-primary" />
                  <span className="text-primary">{countdown}</span>
                </>
              ) : (
                t(getStatusTranslationKey(tournament.status))
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("gamefi.participants")}</span>
            <span>{tournament.currentParticipants} / {tournament.maxParticipants}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {tournament.requiresNft && (
          <div className="flex items-center gap-1 mt-2 text-sm text-purple-500">
            <Sparkles className="w-3 h-3" />
            <span>{t("gamefi.nftRequired")}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-3">
          {onJoin && canJoin && (
            <Button 
              className="flex-1" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); onJoin(tournament.id); }}
              disabled={isJoining}
              data-testid={`button-join-tournament-${tournament.id}`}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("gamefi.joining")}
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4 mr-2" />
                  {t("gamefi.joinTournament")}
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            data-testid={`button-details-tournament-${tournament.id}`}
          >
            {t("gamefi.viewDetails")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
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
  const { t } = useTranslation();
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
                {t(getRarityTranslationKey(asset.rarity))}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {t(getAssetTypeTranslationKey(asset.assetType))}
            </div>
            {asset.attributes?.level && (
              <div className="text-xs text-muted-foreground mt-1">
                {t("gamefi.levelLabel", { level: asset.attributes.level })}
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
                {isEquipped ? t("gamefi.unequipping") : t("gamefi.equipping")}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {isEquipped ? t("gamefi.unequip") : t("gamefi.equip")}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({ entry, rank }: { entry: GameLeaderboard; rank: number }) {
  const { t } = useTranslation();
  const rankIcon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : null;
  const RankIcon = rankIcon;
  
  return (
    <div 
      className="flex items-center gap-4 py-3 border-b last:border-0 hover-elevate rounded-lg px-2 cursor-pointer" 
      data-testid={`row-leaderboard-${entry.id}`}
    >
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
          {t("gamefi.winsLosses", { wins: entry.wins, losses: entry.losses, games: entry.gamesPlayed })}
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{parseInt(entry.score).toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">{formatAmount(entry.totalEarned)} {t("gamefi.earned")}</div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: AchievementBadge }) {
  const { t } = useTranslation();
  
  const getBadgeNameKey = (name: string): string => {
    const nameMap: Record<string, string> = {
      "First Victory": "gamefi.badges.firstVictory.name",
      "Chain Master": "gamefi.badges.chainMaster.name",
      "Tournament Champion": "gamefi.badges.tournamentChampion.name",
      "NFT Collector": "gamefi.badges.nftCollector.name",
      "Legendary Holder": "gamefi.badges.legendaryHolder.name",
      "Social Butterfly": "gamefi.badges.socialButterfly.name",
      "Daily Warrior": "gamefi.badges.dailyWarrior.name",
      "Season Pioneer": "gamefi.badges.seasonPioneer.name",
    };
    return nameMap[name] || name;
  };

  const getBadgeDescKey = (name: string): string => {
    const descMap: Record<string, string> = {
      "First Victory": "gamefi.badges.firstVictory.desc",
      "Chain Master": "gamefi.badges.chainMaster.desc",
      "Tournament Champion": "gamefi.badges.tournamentChampion.desc",
      "NFT Collector": "gamefi.badges.nftCollector.desc",
      "Legendary Holder": "gamefi.badges.legendaryHolder.desc",
      "Social Butterfly": "gamefi.badges.socialButterfly.desc",
      "Daily Warrior": "gamefi.badges.dailyWarrior.desc",
      "Season Pioneer": "gamefi.badges.seasonPioneer.desc",
    };
    return descMap[name] || name;
  };

  const badgeName = t(getBadgeNameKey(badge.name), { defaultValue: badge.name });
  const badgeDesc = t(getBadgeDescKey(badge.name), { defaultValue: badge.description || "" });

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
              <span className="font-medium truncate">{badgeName}</span>
              <Badge className={getRarityColor(badge.rarity)}>
                {t(getRarityTranslationKey(badge.rarity))}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{badgeDesc}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{badge.points} {t("gamefi.points")}</span>
              <span>{badge.totalUnlocks?.toLocaleString() || 0} {t("gamefi.unlocks")}</span>
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

function ActivityRow({ activity, onClick }: { activity: GamefiActivity; onClick?: () => void }) {
  const { t } = useTranslation();
  const IconComponent = getEventTypeIcon(activity.eventType);
  
  const getEventTypeLabel = (eventType: string) => {
    const eventLabels: Record<string, string> = {
      game_started: t("gamefi.eventGameStarted"),
      game_ended: t("gamefi.eventGameEnded"),
      reward_earned: t("gamefi.eventRewardEarned"),
      asset_minted: t("gamefi.eventAssetMinted"),
      asset_transferred: t("gamefi.eventAssetTransferred"),
      tournament_joined: t("gamefi.eventTournamentJoined"),
      tournament_won: t("gamefi.eventTournamentWon"),
      achievement_unlocked: t("gamefi.eventAchievementUnlocked"),
      level_up: t("gamefi.eventLevelUp"),
    };
    return eventLabels[eventType] || eventType.replace(/_/g, ' ');
  };
  
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };
  
  return (
    <div 
      className="flex items-center gap-4 py-3 border-b last:border-0 hover-elevate rounded-lg px-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`row-activity-${activity.id}`}
    >
      <div className="p-2 rounded-lg bg-muted">
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium capitalize">{getEventTypeLabel(activity.eventType)}</div>
        <div className="text-sm text-muted-foreground">
          {activity.walletAddress && shortenAddress(activity.walletAddress)}
        </div>
      </div>
      <div className="text-right">
        {activity.amount && (
          <div className="font-medium text-green-500">{formatAmount(activity.amount)} TBURN</div>
        )}
        <div className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</div>
      </div>
    </div>
  );
}

function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
}: {
  project: GamefiProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [dialogTab, setDialogTab] = useState("overview");
  const { toast } = useToast();

  const { data: projectAssets } = useQuery<GameAsset[]>({
    queryKey: ["/api/gamefi/projects", project?.id, "assets"],
    enabled: !!project?.id && open,
  });

  const { data: projectLeaderboard } = useQuery<GameLeaderboard[]>({
    queryKey: ["/api/gamefi/projects", project?.id, "leaderboard"],
    enabled: !!project?.id && open,
  });

  const { data: projectTournaments } = useQuery<GameTournament[]>({
    queryKey: ["/api/gamefi/tournaments"],
    enabled: !!project?.id && open,
    select: (data) => data?.filter(t => t.projectId === project?.id) || [],
  });

  const { data: projectActivity } = useQuery<GamefiActivity[]>({
    queryKey: ["/api/gamefi/projects", project?.id, "activity"],
    enabled: !!project?.id && open,
  });

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: t("gamefi.copied"),
      description: t("gamefi.addressCopied"),
    });
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl">{project.name}</DialogTitle>
                {project.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                <Badge className={getStatusColor(project.status)}>
                  {t(getStatusTranslationKey(project.status))}
                </Badge>
              </div>
              <DialogDescription className="mt-1">
                {project.developer && <span>{project.developer} • </span>}
                {t(getCategoryTranslationKey(project.category))}
                {project.genre && ` • ${t(getGenreTranslationKey(project.genre))}`}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCopyAddress(project.id)}
                  data-testid="button-copy-project-id"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {shortenAddress(project.id)}
                </Button>
                <Button size="sm" variant="outline" data-testid="button-view-explorer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {t("gamefi.viewOnExplorer")}
                </Button>
                <Button size="sm" variant="outline" data-testid="button-share-project">
                  <Share2 className="w-3 h-3 mr-1" />
                  {t("gamefi.share")}
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={dialogTab} onValueChange={setDialogTab} className="flex-1 flex flex-col min-h-0 mt-4">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="overview" data-testid="dialog-tab-overview">{t("gamefi.overview")}</TabsTrigger>
            <TabsTrigger value="assets" data-testid="dialog-tab-assets">{t("gamefi.assets")} ({projectAssets?.length || 0})</TabsTrigger>
            <TabsTrigger value="leaderboard" data-testid="dialog-tab-leaderboard">{t("gamefi.leaderboard")}</TabsTrigger>
            <TabsTrigger value="tournaments" data-testid="dialog-tab-tournaments">{t("gamefi.tournaments")} ({projectTournaments?.length || 0})</TabsTrigger>
            <TabsTrigger value="activity" data-testid="dialog-tab-activity">{t("gamefi.activityTab")}</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-6">
              {project.description && (
                <div>
                  <h3 className="font-semibold mb-2">{t("gamefi.description")}</h3>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{project.totalPlayers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{t("gamefi.totalPlayers")}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{project.activePlayers24h.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{t("gamefi.activePlayers24h")}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">{formatAmount(project.totalVolume)}</div>
                    <div className="text-sm text-muted-foreground">{t("gamefi.totalVolume")}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Gift className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{formatAmount(project.totalRewardsDistributed)}</div>
                    <div className="text-sm text-muted-foreground">{t("gamefi.totalRewardsDistributed")}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <div>
                    <div className="font-medium">{project.rating.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">{project.ratingCount} {t("gamefi.reviews")}</div>
                  </div>
                </div>
                {project.aiScore && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-medium">{project.aiScore.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">{t("gamefi.aiScore")}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {project.playToEarnEnabled && (
                  <Badge variant="secondary" className="gap-1">
                    <Coins className="w-3 h-3" />
                    {t("gamefi.playToEarn")}
                  </Badge>
                )}
                {project.stakingEnabled && (
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {t("gamefi.stakingEnabled")}
                  </Badge>
                )}
                {project.tournamentEnabled && (
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="w-3 h-3" />
                    {t("gamefi.tournamentsEnabled")}
                  </Badge>
                )}
              </div>

              <Button className="w-full" size="lg" data-testid="button-play-game">
                <Play className="w-5 h-5 mr-2" />
                {t("gamefi.playNow")}
              </Button>
            </TabsContent>

            <TabsContent value="assets" className="mt-0">
              {projectAssets && projectAssets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("gamefi.noAssetsAvailable")}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-0">
              {projectLeaderboard && projectLeaderboard.length > 0 ? (
                <div className="space-y-1">
                  {projectLeaderboard.map((entry, index) => (
                    <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("gamefi.noLeaderboardData")}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tournaments" className="mt-0">
              {projectTournaments && projectTournaments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {projectTournaments.map(tournament => (
                    <TournamentCard key={tournament.id} tournament={tournament} project={project} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("gamefi.noTournamentsAvailable")}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              {projectActivity && projectActivity.length > 0 ? (
                <div className="space-y-1">
                  {projectActivity.map(act => (
                    <ActivityRow key={act.id} activity={act} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("gamefi.noActivityYet")}</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function TournamentDetailDialog({
  tournament,
  project,
  open,
  onOpenChange,
  onJoin,
  isJoining,
}: {
  tournament: GameTournament | null;
  project?: GamefiProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin?: (tournamentId: string) => void;
  isJoining?: boolean;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const countdown = useCountdown(tournament?.status === "upcoming" || tournament?.status === "registration" ? tournament.startTime : null);

  const { data: participants } = useQuery<TournamentParticipant[]>({
    queryKey: ["/api/gamefi/tournaments", tournament?.id, "participants"],
    enabled: !!tournament?.id && open,
  });

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: t("gamefi.copied"),
      description: t("gamefi.addressCopied"),
    });
  };

  if (!tournament) return null;

  const progress = tournament.maxParticipants > 0 
    ? (tournament.currentParticipants / tournament.maxParticipants) * 100 
    : 0;
  const canJoin = (tournament.status === "upcoming" || tournament.status === "registration") 
    && tournament.currentParticipants < tournament.maxParticipants;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl">{tournament.name}</DialogTitle>
                <Badge className={getTournamentStatusColor(tournament.status)}>
                  {t(getStatusTranslationKey(tournament.status))}
                </Badge>
              </div>
              <DialogDescription className="mt-1">
                {project?.name && <span>{project.name} • </span>}
                {t(getTournamentTypeTranslationKey(tournament.tournamentType))}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-6">
            {tournament.description && (
              <p className="text-muted-foreground">{tournament.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-xl font-bold">{formatAmount(tournament.prizePool)}</div>
                  <div className="text-sm text-muted-foreground">TBURN {t("gamefi.prizePool")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Coins className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-xl font-bold">
                    {tournament.entryFee && tournament.entryFee !== "0" 
                      ? formatAmount(tournament.entryFee) 
                      : t("gamefi.free")
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">{t("gamefi.entryFee")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="text-xl font-bold">{tournament.currentParticipants}</div>
                  <div className="text-sm text-muted-foreground">/ {tournament.maxParticipants}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Timer className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">{countdown || t(getStatusTranslationKey(tournament.status))}</div>
                  <div className="text-sm text-muted-foreground">{countdown ? t("gamefi.startsIn") : t("gamefi.status")}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("gamefi.registrationProgress")}</span>
                <span>{tournament.currentParticipants} / {tournament.maxParticipants}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {tournament.requiresNft && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-purple-500">{t("gamefi.nftRequiredToJoin")}</span>
              </div>
            )}

            {(tournament.startTime || tournament.endTime) && (
              <div className="grid grid-cols-2 gap-4">
                {tournament.startTime && (
                  <div>
                    <div className="text-sm text-muted-foreground">{t("gamefi.startTime")}</div>
                    <div className="font-medium">{new Date(tournament.startTime).toLocaleString('en-US', { timeZone: 'America/New_York' })}</div>
                  </div>
                )}
                {tournament.endTime && (
                  <div>
                    <div className="text-sm text-muted-foreground">{t("gamefi.endTime")}</div>
                    <div className="font-medium">{new Date(tournament.endTime).toLocaleString('en-US', { timeZone: 'America/New_York' })}</div>
                  </div>
                )}
              </div>
            )}

            {canJoin && onJoin && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => onJoin(tournament.id)}
                disabled={isJoining}
                data-testid="button-join-tournament-dialog"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("gamefi.joining")}
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5 mr-2" />
                    {t("gamefi.joinTournament")}
                  </>
                )}
              </Button>
            )}

            {participants && participants.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">{t("gamefi.participants")} ({participants.length})</h3>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div 
                      key={participant.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => handleCopyAddress(participant.walletAddress)}
                      data-testid={`row-participant-${participant.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {participant.rank || index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{participant.playerName || shortenAddress(participant.walletAddress)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(participant.joinedAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{parseInt(participant.score || "0").toLocaleString()}</div>
                        <Badge variant="outline" className="text-xs">{participant.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function GameFiPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, isCorrectNetwork } = useWeb3();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<GamefiProject | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<GameTournament | null>(null);
  const [joiningTournamentId, setJoiningTournamentId] = useState<string | null>(null);
  const [equippingAssetId, setEquippingAssetId] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<GamefiOverview>({
    queryKey: ["/api/gamefi/stats"],
    refetchInterval: 10000,
  });

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery<GamefiProject[]>({
    queryKey: ["/api/gamefi/projects"],
    refetchInterval: 15000,
  });

  const { data: featuredProjects, refetch: refetchFeatured } = useQuery<GamefiProject[]>({
    queryKey: ["/api/gamefi/projects/featured"],
    refetchInterval: 30000,
  });

  const { data: tournaments, refetch: refetchTournaments } = useQuery<GameTournament[]>({
    queryKey: ["/api/gamefi/tournaments"],
    refetchInterval: 15000,
  });

  const { data: activeTournaments, refetch: refetchActiveTournaments } = useQuery<GameTournament[]>({
    queryKey: ["/api/gamefi/tournaments/active"],
    refetchInterval: 10000,
  });

  const { data: badges, refetch: refetchBadges } = useQuery<AchievementBadge[]>({
    queryKey: ["/api/gamefi/badges/global"],
    refetchInterval: 60000,
  });

  const { data: activity, refetch: refetchActivity } = useQuery<GamefiActivity[]>({
    queryKey: ["/api/gamefi/activity"],
    refetchInterval: 5000,
  });

  const { data: myAssets, isLoading: assetsLoading, refetch: refetchAssets } = useQuery<GameAsset[]>({
    queryKey: ["/api/gamefi/assets/owner", ENTERPRISE_WALLET],
    refetchInterval: 15000,
  });

  const { data: pendingRewards, isLoading: rewardsLoading, refetch: refetchRewards } = useQuery<PendingReward[]>({
    queryKey: ["/api/gamefi/player", ENTERPRISE_WALLET, "pending-rewards"],
    refetchInterval: 10000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchOverview(),
        refetchProjects(),
        refetchFeatured(),
        refetchTournaments(),
        refetchActiveTournaments(),
        refetchBadges(),
        refetchActivity(),
        refetchAssets(),
        refetchRewards(),
      ]);
      toast({
        title: t("gamefi.refreshSuccess"),
        description: t("gamefi.refreshSuccessDesc"),
      });
    } catch (error) {
      toast({
        title: t("gamefi.refreshError"),
        description: t("gamefi.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await apiRequest("POST", `/api/gamefi/tournaments/${tournamentId}/join`, {
        walletAddress: ENTERPRISE_WALLET,
        playerName: t("gamefi.enterprisePlayer"),
      });
      return response.json();
    },
    onMutate: (tournamentId) => {
      setJoiningTournamentId(tournamentId);
    },
    onSuccess: (data) => {
      toast({
        title: t("gamefi.joinedTournament"),
        description: data.message || t("gamefi.successfullyJoined"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/tournaments/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("gamefi.failedToJoin"),
        description: error.message || t("gamefi.couldNotJoin"),
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
        title: t("gamefi.rewardsClaimed"),
        description: data.message || t("gamefi.successfullyClaimed", { count: data.claimedCount }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/player", ENTERPRISE_WALLET, "pending-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("gamefi.failedToClaim"),
        description: error.message || t("gamefi.couldNotClaim"),
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
        title: data.asset?.isEquipped ? t("gamefi.assetEquipped") : t("gamefi.assetUnequipped"),
        description: data.message || t("gamefi.successfullyUpdatedAsset"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/assets/owner", ENTERPRISE_WALLET] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamefi/activity"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("gamefi.failedToUpdateAsset"),
        description: error.message || t("gamefi.couldNotUpdateAsset"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setEquippingAssetId(null);
    },
  });

  const handleJoinTournament = (tournamentId: string) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    joinTournamentMutation.mutate(tournamentId);
  };

  const handleClaimRewards = () => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    claimRewardsMutation.mutate();
  };

  const handleEquipAsset = (assetId: string) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    equipAssetMutation.mutate(assetId);
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    projects?.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = projects || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.genre?.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
    }
    
    return result;
  }, [projects, searchQuery, categoryFilter]);

  const filteredTournaments = useMemo(() => {
    if (!searchQuery) return tournaments || [];
    const query = searchQuery.toLowerCase();
    return (tournaments || []).filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    );
  }, [tournaments, searchQuery]);

  const activeProjects = projects?.filter(p => p.status === "active") || [];
  const totalPendingRewards = pendingRewards?.reduce((acc, r) => acc + BigInt(r.amount || 0), BigInt(0)) || BigInt(0);

  return (
    <div className="p-6 space-y-6">
      <WalletRequiredBanner />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t("gamefi.title")}</h1>
          <p className="text-muted-foreground">
            {t("gamefi.pageDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("gamefi.searchGames")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
              data-testid="input-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" data-testid="select-category">
              <SelectValue placeholder={t("gamefi.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("gamefi.allCategories")}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {t(getCategoryTranslationKey(cat))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span className="text-sm">{t("gamefi.games")}</span>
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
              <span className="text-sm">{t("gamefi.active")}</span>
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
              <span className="text-sm">{t("gamefi.players")}</span>
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
              <span className="text-sm">{t("gamefi.active24h")}</span>
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
              <span className="text-sm">{t("gamefi.volume")}</span>
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
              <span className="text-sm">{t("gamefi.volume24h")}</span>
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
              <span className="text-sm">{t("gamefi.rewards")}</span>
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
              <span className="text-sm">{t("gamefi.tournaments")}</span>
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
            {t("gamefi.overview")}
          </TabsTrigger>
          <TabsTrigger value="games" data-testid="tab-games">
            <Sparkles className="w-4 h-4 mr-2" />
            {t("gamefi.gamesCount", { count: activeProjects.length })}
          </TabsTrigger>
          <TabsTrigger value="tournaments" data-testid="tab-tournaments">
            <Trophy className="w-4 h-4 mr-2" />
            {t("gamefi.tournaments")}
          </TabsTrigger>
          <TabsTrigger value="my-assets" data-testid="tab-my-assets">
            <Package className="w-4 h-4 mr-2" />
            {t("gamefi.myAssets")}
          </TabsTrigger>
          <TabsTrigger value="rewards" data-testid="tab-rewards">
            <Gift className="w-4 h-4 mr-2" />
            {t("gamefi.rewards")} {pendingRewards?.length ? `(${pendingRewards.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">
            <Award className="w-4 h-4 mr-2" />
            {t("gamefi.achievements")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {t("gamefi.featuredGames")}
                </CardTitle>
                <CardDescription>{t("gamefi.topRatedGames")}</CardDescription>
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
                          onClick={() => setSelectedProject(project)}
                        />
                      ))
                    )}
                    {!projectsLoading && (!featuredProjects || featuredProjects.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        {t("gamefi.noFeaturedGames")}
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
                  {t("gamefi.liveTournaments")}
                </CardTitle>
                <CardDescription>{t("gamefi.activeAndUpcoming")}</CardDescription>
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
                          onClick={() => setSelectedTournament(tournament)}
                          onJoin={handleJoinTournament}
                          isJoining={joiningTournamentId === tournament.id}
                        />
                      );
                    })}
                    {(!activeTournaments || activeTournaments.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        {t("gamefi.noActiveTournaments")}
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
                {t("gamefi.recentActivity")}
              </CardTitle>
              <CardDescription>{t("gamefi.latestGamefiEvents")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {activity?.slice(0, 20).map(act => (
                    <ActivityRow key={act.id} activity={act} />
                  ))}
                  {!activity?.length && (
                    <div className="py-8 text-center text-muted-foreground">
                      {t("gamefi.noRecentActivity")}
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
              <CardTitle>{t("gamefi.allGames")}</CardTitle>
              <CardDescription>{t("gamefi.browseAllGames")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))
                ) : (
                  filteredProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onClick={() => setSelectedProject(project)}
                    />
                  ))
                )}
              </div>
              {!projectsLoading && filteredProjects.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {searchQuery ? t("gamefi.noSearchResults") : t("gamefi.noGamesAvailable")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("gamefi.allTournaments")}</CardTitle>
              <CardDescription>{t("gamefi.browseAllTournaments")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTournaments.map(tournament => {
                  const project = projects?.find(p => p.id === tournament.projectId);
                  return (
                    <TournamentCard 
                      key={tournament.id} 
                      tournament={tournament} 
                      project={project}
                      onClick={() => setSelectedTournament(tournament)}
                      onJoin={handleJoinTournament}
                      isJoining={joiningTournamentId === tournament.id}
                    />
                  );
                })}
              </div>
              {filteredTournaments.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {searchQuery ? t("gamefi.noSearchResults") : t("gamefi.noTournamentsAvailable")}
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
                {t("gamefi.myGameAssets")}
              </CardTitle>
              <CardDescription>
                {t("gamefi.manageAssets")} - {t("gamefi.wallet")}: {shortenAddress(ENTERPRISE_WALLET)}
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
                  <p>{t("gamefi.noAssetsOwned")}</p>
                  <p className="text-sm mt-2">{t("gamefi.playToEarn")}</p>
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
                    {t("gamefi.pendingRewards")}
                  </CardTitle>
                  <CardDescription>
                    {t("gamefi.claimEarnedRewards")} - {t("gamefi.wallet")}: {shortenAddress(ENTERPRISE_WALLET)}
                  </CardDescription>
                </div>
                {pendingRewards && pendingRewards.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{t("gamefi.totalClaimable")}</div>
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
                          {t("gamefi.claiming")}
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          {t("gamefi.claimAllRewards")}
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
                      className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                      data-testid={`row-reward-${reward.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Coins className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {reward.rewardType.replace(/_/g, ' ')} {t("gamefi.reward")}
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
                  <p>{t("gamefi.noPendingRewards")}</p>
                  <p className="text-sm mt-2">{t("gamefi.earnRewardsHint")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("gamefi.globalAchievements")}</CardTitle>
              <CardDescription>{t("gamefi.unlockBadges")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map(badge => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
              {(!badges || badges.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("gamefi.noAchievementsAvailable")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProjectDetailDialog
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />

      <TournamentDetailDialog
        tournament={selectedTournament}
        project={projects?.find(p => p.id === selectedTournament?.projectId)}
        open={!!selectedTournament}
        onOpenChange={(open) => !open && setSelectedTournament(null)}
        onJoin={handleJoinTournament}
        isJoining={joiningTournamentId === selectedTournament?.id}
      />
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}
