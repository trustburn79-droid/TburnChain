import { useState, useEffect } from "react";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WalletRequiredBanner } from "@/components/require-wallet";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
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
  RefreshCw,
  Search,
  ExternalLink,
  Share2,
  Copy,
  Shield,
  Zap,
  Target,
  Award,
  Wallet,
  BarChart3,
  Info,
  Minus,
  Plus,
  Hash,
  Globe,
  Twitter,
  MessageCircle,
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

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

interface UserAllocation {
  projectId: string;
  projectName: string;
  allocation: number;
  minted: number;
  status: string;
}

function formatAmount(wei: string | null | undefined, decimals: number = 18): string {
  if (!wei || wei === "0") return "0";
  try {
    const value = parseFloat(wei) / Math.pow(10, decimals);
    if (isNaN(value)) return "0";
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
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

function getEventTypeIcon(type: string) {
  const icons: Record<string, typeof Rocket> = {
    mint: Zap,
    project_created: Rocket,
    round_started: Timer,
    round_ended: CheckCircle2,
    whitelist_added: UserPlus,
    claim: Gift,
  };
  return icons[type] || Activity;
}

function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    mint: "text-green-500 bg-green-500/10",
    project_created: "text-blue-500 bg-blue-500/10",
    round_started: "text-purple-500 bg-purple-500/10",
    round_ended: "text-orange-500 bg-orange-500/10",
    whitelist_added: "text-cyan-500 bg-cyan-500/10",
    claim: "text-emerald-500 bg-emerald-500/10",
  };
  return colors[type] || "text-gray-500 bg-gray-500/10";
}

function useCountdown(endDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  useEffect(() => {
    if (!endDate) return;
    
    const update = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate]);
  
  return timeLeft;
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

function ProjectDetailDialog({ 
  project, 
  open, 
  onOpenChange,
  onMint,
  onWhitelist,
  onClaim,
}: { 
  project: LaunchpadProject | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onMint: (projectId: string, quantity: number) => void;
  onWhitelist: (projectId: string) => void;
  onClaim: (projectId: string) => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [mintQuantity, setMintQuantity] = useState(1);
  
  const { data: projectDetail } = useQuery<{ project: LaunchpadProject; rounds: LaunchRound[] }>({
    queryKey: ["/api/launchpad/projects", project?.id],
    enabled: !!project?.id && open,
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
  
  const { data: projectActivity } = useQuery<LaunchpadActivity[]>({
    queryKey: ["/api/launchpad/projects", project?.id, "activity"],
    enabled: !!project?.id && open && activeTab === "activity",
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
  
  const countdown = useCountdown(project?.endDate || null);
  
  if (!project) return null;
  
  const progress = parseInt(project.totalSupply) > 0 
    ? (project.totalMinted / parseInt(project.totalSupply)) * 100 
    : 0;
  
  const rounds = projectDetail?.rounds || [];
  const mintCost = BigInt(project.mintPrice || "0") * BigInt(mintQuantity);
  const canMint = project.status === "active" && mintQuantity > 0 && mintQuantity <= project.maxPerWallet;
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(project.creatorAddress);
    toast({
      title: t("nftLaunchpad.copied"),
      description: t("nftLaunchpad.addressCopied"),
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Rocket className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              {project.featured && (
                <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-1">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-2xl">{project.name}</DialogTitle>
                {project.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("nftLaunchpad.verified")}
                  </Badge>
                )}
                <Badge className={getStatusColor(project.status)}>
                  {t(`nftLaunchpad.status.${project.status}`, { defaultValue: project.status })}
                </Badge>
              </div>
              <DialogDescription className="mt-1">
                {project.symbol} {project.category && `• ${project.category}`}
              </DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="ghost" size="sm" onClick={handleCopyAddress} data-testid="button-copy-creator">
                  <Copy className="w-3 h-3 mr-1" />
                  {shortenAddress(project.creatorAddress)}
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-view-explorer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {t("nftLaunchpad.viewOnExplorer")}
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-share-project">
                  <Share2 className="w-3 h-3 mr-1" />
                  {t("nftLaunchpad.share")}
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="overview" data-testid="dialog-tab-overview">{t("nftLaunchpad.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="rounds" data-testid="dialog-tab-rounds">{t("nftLaunchpad.rounds")} ({rounds.length})</TabsTrigger>
            <TabsTrigger value="mint" data-testid="dialog-tab-mint">{t("nftLaunchpad.mintNft")}</TabsTrigger>
            <TabsTrigger value="activity" data-testid="dialog-tab-activity">{t("nftLaunchpad.activityTab")}</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-6">
              {project.name && (
                <div>
                  <h4 className="font-semibold mb-2">{t("nftLaunchpad.description")}</h4>
                  <p className="text-muted-foreground">
                    {t(`nftLaunchpad.projectDescriptions.${project.name}`, t("nftLaunchpad.projectDescriptions.default"))}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">{t("nftLaunchpad.mintPrice")}</div>
                    <div className="text-lg font-bold">{formatAmount(project.mintPrice)} TBURN</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">{t("nftLaunchpad.totalSupply")}</div>
                    <div className="text-lg font-bold">{parseInt(project.totalSupply).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">{t("nftLaunchpad.minted")}</div>
                    <div className="text-lg font-bold text-green-500">{project.totalMinted.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">{t("nftLaunchpad.uniqueMinters")}</div>
                    <div className="text-lg font-bold">{project.uniqueMinters.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("nftLaunchpad.mintProgress")}</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{project.totalMinted.toLocaleString()} {t("nftLaunchpad.minted")}</span>
                  <span>{parseInt(project.totalSupply).toLocaleString()} {t("nftLaunchpad.totalSupply")}</span>
                </div>
              </div>
              
              {countdown && project.status === "active" && (
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t("nftLaunchpad.endsIn")}</span>
                    </div>
                    <div className="text-xl font-bold text-primary">{countdown}</div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">{t("nftLaunchpad.totalRaised")}</div>
                    <div className="text-lg font-bold">{formatAmount(project.totalRaised)} TBURN</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground">{t("nftLaunchpad.maxPerWallet")}</div>
                    <div className="text-lg font-bold">{project.maxPerWallet}</div>
                  </CardContent>
                </Card>
                {project.aiScore && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {t("nftLaunchpad.aiScore")}
                      </div>
                      <div className="text-lg font-bold text-purple-500">{project.aiScore.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                )}
                {project.launchDate && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">{t("nftLaunchpad.launchDate")}</div>
                      <div className="text-sm font-bold">{new Date(project.launchDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="rounds" className="mt-0 space-y-4">
              {rounds.length > 0 ? (
                rounds.map(round => {
                  const roundProgress = round.allocation > 0 
                    ? (round.totalMinted / round.allocation) * 100 
                    : 0;
                  return (
                    <Card key={round.id} data-testid={`dialog-round-${round.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-lg">{round.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {t(`nftLaunchpad.roundTypes.${round.roundType}`, { defaultValue: round.roundType })}
                            </div>
                          </div>
                          <Badge className={getStatusColor(round.status)}>
                            {t(`nftLaunchpad.status.${round.status}`, { defaultValue: round.status })}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <div className="text-muted-foreground">{t("nftLaunchpad.roundCard.price")}</div>
                            <div className="font-medium">{formatAmount(round.price)} TBURN</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{t("nftLaunchpad.roundCard.allocation")}</div>
                            <div className="font-medium">{round.allocation.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{t("nftLaunchpad.startTime")}</div>
                            <div className="font-medium">{new Date(round.startTime).toLocaleString('en-US', { timeZone: 'America/New_York' })}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{t("nftLaunchpad.endTime")}</div>
                            <div className="font-medium">{new Date(round.endTime).toLocaleString('en-US', { timeZone: 'America/New_York' })}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("nftLaunchpad.roundCard.minted")}</span>
                            <span>{round.totalMinted.toLocaleString()} / {round.allocation.toLocaleString()}</span>
                          </div>
                          <Progress value={roundProgress} className="h-2" />
                        </div>
                        {round.whitelistRequired && (
                          <div className="flex items-center gap-1 mt-3 text-sm text-yellow-500">
                            <AlertCircle className="w-3 h-3" />
                            <span>{t("nftLaunchpad.roundCard.whitelistRequired")}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftLaunchpad.noRoundsAvailable")}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="mint" className="mt-0 space-y-6">
              {project.status === "active" ? (
                <>
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">{t("nftLaunchpad.mintNft")}</div>
                          <div className="text-sm text-muted-foreground">
                            {t("nftLaunchpad.maxPerWalletInfo", { max: project.maxPerWallet })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{t("nftLaunchpad.pricePerNft")}</div>
                          <div className="text-lg font-bold">{formatAmount(project.mintPrice)} TBURN</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <Label>{t("nftLaunchpad.quantity")}</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                            disabled={mintQuantity <= 1}
                            data-testid="button-decrease-quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={mintQuantity}
                            onChange={(e) => setMintQuantity(Math.min(project.maxPerWallet, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-24 text-center text-lg font-bold"
                            min={1}
                            max={project.maxPerWallet}
                            data-testid="input-mint-quantity"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setMintQuantity(Math.min(project.maxPerWallet, mintQuantity + 1))}
                            disabled={mintQuantity >= project.maxPerWallet}
                            data-testid="button-increase-quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("nftLaunchpad.subtotal")}</span>
                          <span>{formatAmount(project.mintPrice)} × {mintQuantity}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>{t("nftLaunchpad.totalCost")}</span>
                          <span className="text-primary">{formatAmount(mintCost.toString())} TBURN</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => onMint(project.id, mintQuantity)}
                        disabled={!canMint}
                        data-testid="button-confirm-mint"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        {t("nftLaunchpad.confirmMint", { quantity: mintQuantity })}
                      </Button>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>{t("nftLaunchpad.secureTransaction")}</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : project.status === "pending" ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                    <div className="text-lg font-semibold mb-2">{t("nftLaunchpad.mintNotStarted")}</div>
                    <p className="text-muted-foreground mb-4">{t("nftLaunchpad.joinWhitelistFirst")}</p>
                    <Button onClick={() => onWhitelist(project.id)} data-testid="button-join-whitelist-dialog">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("nftLaunchpad.projectCard.joinWhitelist")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <div className="text-lg font-semibold mb-2">{t("nftLaunchpad.mintCompleted")}</div>
                    <p className="text-muted-foreground mb-4">{t("nftLaunchpad.claimYourNfts")}</p>
                    <Button onClick={() => onClaim(project.id)} data-testid="button-claim-dialog">
                      <Gift className="w-4 h-4 mr-2" />
                      {t("nftLaunchpad.projectCard.claimNft")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="mt-0 space-y-2">
              {projectActivity && projectActivity.length > 0 ? (
                projectActivity.map(act => {
                  const EventIcon = getEventTypeIcon(act.eventType);
                  return (
                    <div 
                      key={act.id} 
                      className="flex items-center gap-4 p-3 rounded-lg hover-elevate"
                      data-testid={`dialog-activity-${act.id}`}
                    >
                      <div className={`p-2 rounded-lg ${getEventTypeColor(act.eventType)}`}>
                        <EventIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium capitalize">
                          {t(`nftLaunchpad.eventTypes.${act.eventType}`, { defaultValue: act.eventType.replace(/_/g, ' ') })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {act.walletAddress && shortenAddress(act.walletAddress)}
                          {act.quantity && ` • ${act.quantity} NFTs`}
                        </div>
                      </div>
                      {act.amount && (
                        <div className="text-right">
                          <div className="font-medium">{formatAmount(act.amount)} TBURN</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(act.createdAt).toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftLaunchpad.noActivityYet")}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function MintDialog({
  project,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: {
  project: LaunchpadProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantity: number) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  
  if (!project) return null;
  
  const totalCost = BigInt(project.mintPrice || "0") * BigInt(quantity);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            {t("nftLaunchpad.mintNft")}
          </DialogTitle>
          <DialogDescription>{t("nftLaunchpad.mintDialogDesc")}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold">{project.name}</div>
              <div className="text-sm text-muted-foreground">{project.symbol}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t("nftLaunchpad.quantity")}</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(project.maxPerWallet, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center font-bold"
                min={1}
                max={project.maxPerWallet}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(project.maxPerWallet, quantity + 1))}
                disabled={quantity >= project.maxPerWallet}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                / {project.maxPerWallet} max
              </span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("nftLaunchpad.pricePerNft")}</span>
              <span>{formatAmount(project.mintPrice)} TBURN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("nftLaunchpad.quantity")}</span>
              <span>× {quantity}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{t("nftLaunchpad.totalCost")}</span>
              <span className="text-primary">{formatAmount(totalCost.toString())} TBURN</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("nftLaunchpad.cancel")}
          </Button>
          <Button onClick={() => onConfirm(quantity)} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 mr-2" />
            )}
            {t("nftLaunchpad.confirmMint", { quantity })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ 
  project, 
  onClick,
  onMint, 
  onWhitelist, 
  onClaim,
  mintLoading,
  whitelistLoading,
  claimLoading 
}: { 
  project: LaunchpadProject; 
  onClick?: () => void;
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
  const countdown = useCountdown(project.status === "active" ? project.endDate : null);

  const canMint = project.status === "active";
  const canWhitelist = project.status === "pending";
  const canClaim = project.status === "completed";
    
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
            <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
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
              {countdown && project.status === "active" && (
                <div className="flex items-center gap-1 text-primary">
                  <Timer className="w-3 h-3" />
                  <span className="font-medium">{countdown}</span>
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
              <Button 
                size="sm" 
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                data-testid={`button-details-${project.id}`}
              >
                {t("nftLaunchpad.viewDetails")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoundCard({ 
  round, 
  project,
  onClick 
}: { 
  round: LaunchRound; 
  project?: LaunchpadProject;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const progress = round.allocation > 0 
    ? (round.totalMinted / round.allocation) * 100 
    : 0;
  const countdown = useCountdown(round.status === "active" ? round.endTime : null);
    
  return (
    <Card 
      className="hover-elevate cursor-pointer" 
      onClick={onClick}
      data-testid={`card-round-${round.id}`}
    >
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
            <div className="font-medium text-primary">
              {round.status === "active" && countdown
                ? countdown
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

function ActivityRow({ 
  activity,
  onClick,
  projectName 
}: { 
  activity: LaunchpadActivity;
  onClick?: () => void;
  projectName?: string;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const EventIcon = getEventTypeIcon(activity.eventType);
  const eventTypeKey = `nftLaunchpad.eventTypes.${activity.eventType}` as const;
  const eventTypeText = t(eventTypeKey, { defaultValue: activity.eventType.replace(/_/g, ' ') });
  
  const handleCopyTxHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity.txHash) {
      navigator.clipboard.writeText(activity.txHash);
      toast({
        title: t("nftLaunchpad.copied"),
        description: t("nftLaunchpad.txHashCopied"),
      });
    }
  };
  
  return (
    <div 
      className="flex items-center gap-4 py-3 border-b last:border-0 hover-elevate cursor-pointer rounded-lg px-2 -mx-2"
      onClick={onClick}
      data-testid={`row-activity-${activity.id}`}
    >
      <div className={`p-2 rounded-lg ${getEventTypeColor(activity.eventType)}`}>
        <EventIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize">{eventTypeText}</span>
          {projectName && (
            <span className="text-sm text-muted-foreground">• {projectName}</span>
          )}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {activity.walletAddress && (
            <span>{shortenAddress(activity.walletAddress)}</span>
          )}
          {activity.quantity && (
            <span>{t("nftLaunchpad.activity.quantity")} {activity.quantity}</span>
          )}
          <span className="text-xs">
            {new Date(activity.createdAt).toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}
          </span>
        </div>
      </div>
      {activity.amount && (
        <div className="text-right">
          <div className="font-medium">{formatAmount(activity.amount)} TBURN</div>
        </div>
      )}
      {activity.txHash && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex-shrink-0"
          onClick={handleCopyTxHash}
          data-testid={`button-copy-tx-${activity.id}`}
        >
          <Copy className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

function MyAllocationsCard({ allocations }: { allocations: UserAllocation[] }) {
  const { t } = useTranslation();
  
  if (!allocations || allocations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <div className="text-lg font-semibold mb-2">{t("nftLaunchpad.noAllocations")}</div>
          <p className="text-muted-foreground">{t("nftLaunchpad.noAllocationsDesc")}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          {t("nftLaunchpad.myAllocations")}
        </CardTitle>
        <CardDescription>{t("nftLaunchpad.myAllocationsDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allocations.map((alloc, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div>
                <div className="font-medium">{alloc.projectName}</div>
                <div className="text-sm text-muted-foreground">
                  {t("nftLaunchpad.allocatedMinted", { 
                    allocated: alloc.allocation, 
                    minted: alloc.minted 
                  })}
                </div>
              </div>
              <Badge className={getStatusColor(alloc.status)}>
                {t(`nftLaunchpad.status.${alloc.status}`, { defaultValue: alloc.status })}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function NftLaunchpadPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, isCorrectNetwork } = useWeb3();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<LaunchpadProject | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [mintDialogProject, setMintDialogProject] = useState<LaunchpadProject | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { data: overview, isLoading: overviewLoading } = useQuery<LaunchpadOverview>({
    queryKey: ["/api/launchpad/stats"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<LaunchpadProject[]>({
    queryKey: ["/api/launchpad/projects"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: featuredProjects } = useQuery<LaunchpadProject[]>({
    queryKey: ["/api/launchpad/projects/featured"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: activeRounds } = useQuery<LaunchRound[]>({
    queryKey: ["/api/launchpad/rounds/active"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: activity } = useQuery<LaunchpadActivity[]>({
    queryKey: ["/api/launchpad/activity"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: userAllocations } = useQuery<UserAllocation[]>({
    queryKey: ["/api/launchpad/allocations", ENTERPRISE_WALLET],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
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
          txHash: data.txHash?.slice(0, 10) || '' 
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/activity"] });
      setMintDialogProject(null);
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
      queryClient.invalidateQueries({ queryKey: ["/api/launchpad/allocations"] });
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
          txHash: data.txHash?.slice(0, 10) || '' 
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/projects"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/projects/featured"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/rounds/active"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/activity"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/allocations"] }),
      ]);
      toast({
        title: t("nftLaunchpad.refreshSuccess"),
        description: t("nftLaunchpad.refreshSuccessDesc"),
      });
    } catch {
      toast({
        title: t("nftLaunchpad.refreshError"),
        description: t("nftLaunchpad.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenMintDialog = (projectId: string) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    const project = projects?.find(p => p.id === projectId);
    if (project) {
      setMintDialogProject(project);
    }
  };

  const handleMint = (projectId: string, quantity: number) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    mintMutation.mutate({ projectId, quantity });
  };

  const handleWhitelist = (projectId: string) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    whitelistMutation.mutate(projectId);
  };

  const handleClaim = (projectId: string) => {
    claimMutation.mutate(projectId);
  };

  const handleProjectClick = (project: LaunchpadProject) => {
    setSelectedProject(project);
    setProjectDialogOpen(true);
  };

  const categories = Array.from(new Set(projects?.map(p => p.category).filter(Boolean) || [])) as string[];
  
  const filteredProjects = projects?.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const activeProjects = filteredProjects.filter(p => p.status === "active");
  const upcomingProjects = filteredProjects.filter(p => p.status === "pending");
  const completedProjects = filteredProjects.filter(p => p.status === "completed");

  return (
    <div className="p-6 space-y-6">
      <WalletRequiredBanner />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t("nftLaunchpad.title")}</h1>
          <p className="text-muted-foreground">
            {t("nftLaunchpad.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("nftLaunchpad.searchProjects")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
              data-testid="input-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" data-testid="select-category">
              <SelectValue placeholder={t("nftLaunchpad.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("nftLaunchpad.allCategories")}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
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
          <TabsTrigger value="my-allocations" data-testid="tab-allocations">
            <Wallet className="w-4 h-4 mr-2" />
            {t("nftLaunchpad.tabs.myAllocations")}
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
                          onClick={() => handleProjectClick(project)}
                          onMint={handleOpenMintDialog}
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
                        <RoundCard 
                          key={round.id} 
                          round={round} 
                          project={project}
                          onClick={() => project && handleProjectClick(project)}
                        />
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
                  {activity?.slice(0, 20).map(act => {
                    const project = projects?.find(p => p.id === act.projectId);
                    return (
                      <ActivityRow 
                        key={act.id} 
                        activity={act}
                        projectName={project?.name}
                        onClick={() => project && handleProjectClick(project)}
                      />
                    );
                  })}
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
                      onClick={() => handleProjectClick(project)}
                      onMint={handleOpenMintDialog}
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
                      onClick={() => handleProjectClick(project)}
                      onMint={handleOpenMintDialog}
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
                      onClick={() => handleProjectClick(project)}
                      onMint={handleOpenMintDialog}
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

        <TabsContent value="my-allocations" className="space-y-4">
          <MyAllocationsCard allocations={userAllocations || []} />
        </TabsContent>
      </Tabs>

      <ProjectDetailDialog
        project={selectedProject}
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onMint={handleMint}
        onWhitelist={handleWhitelist}
        onClaim={handleClaim}
      />

      <MintDialog
        project={mintDialogProject}
        open={!!mintDialogProject}
        onOpenChange={(open) => !open && setMintDialogProject(null)}
        onConfirm={(quantity) => mintDialogProject && handleMint(mintDialogProject.id, quantity)}
        isLoading={mintMutation.isPending}
      />
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}
