import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Gift, 
  TrendingUp,
  Activity,
  Clock,
  Users,
  Percent,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  PiggyBank,
  BarChart3,
  Calendar,
  Timer,
  Repeat,
  Download,
  Sparkles,
  AlertTriangle,
  History
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

interface RewardCycle {
  id: string;
  cycleNumber: number;
  startTimestamp: string;
  endTimestamp: string | null;
  totalRewards: string;
  totalParticipants: number;
  baseApy: number;
  tierMultipliers: Record<string, number>;
  status: string;
}

interface RewardEvent {
  id: string;
  cycleId: string;
  recipientAddress: string;
  poolId: string;
  baseAmount: string;
  bonusAmount: string;
  totalAmount: string;
  tier: string;
  apyApplied: number;
  autoCompounded: boolean;
  status: string;
  createdAt: string;
}

interface UnbondingRequest {
  id: string;
  delegatorAddress: string;
  validatorId: string;
  amount: string;
  requestedAt: string;
  completesAt: string;
  status: string;
  penaltyApplied: number;
}

interface SlashingEvent {
  id: string;
  validatorId: string;
  validatorAddress: string;
  slashType: string;
  slashAmount: string;
  slashPercentage: number;
  reason: string;
  createdAt: string;
}

function formatWeiToTBURN(weiStr: string): string {
  try {
    const wei = BigInt(weiStr);
    const tburn = Number(wei) / 1e18;
    if (tburn >= 1e9) return `${(tburn / 1e9).toFixed(2)}B`;
    if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
    if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
    return tburn.toFixed(4);
  } catch {
    return "0";
  }
}

function formatTimeRemaining(dateStr: string): string {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  
  if (diff <= 0) return "Ready";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default function StakingRewards() {
  const { toast } = useToast();
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);

  const { data: currentCycle, isLoading: cycleLoading } = useQuery<RewardCycle>({
    queryKey: ["/api/staking/rewards/current"]
  });

  const { data: cycles, isLoading: cyclesLoading } = useQuery<RewardCycle[]>({
    queryKey: ["/api/staking/rewards/cycles"]
  });

  const { data: unbonding, isLoading: unbondingLoading } = useQuery<UnbondingRequest[]>({
    queryKey: ["/api/staking/unbonding"]
  });

  const { data: slashingEvents, isLoading: slashingLoading } = useQuery<SlashingEvent[]>({
    queryKey: ["/api/staking/slashing"]
  });

  const handleClaimRewards = () => {
    toast({
      title: "Claim Request Submitted",
      description: "Your rewards claim is being processed"
    });
    setClaimDialogOpen(false);
  };

  const pendingUnbonding = unbonding?.filter(u => u.status === "pending") || [];
  const completedUnbonding = unbonding?.filter(u => u.status === "completed") || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-rewards-title">Rewards Center</h1>
          <p className="text-muted-foreground mt-1">
            Track and claim your staking rewards, manage unbonding requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentCycle && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Cycle #{currentCycle.cycleNumber}
            </Badge>
          )}
          <Button variant="outline" size="sm" data-testid="button-refresh-rewards">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-pending-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">2,547.83 TBURN</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              Ready to claim
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-claimed-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,892.45 TBURN</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-unbonding">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unbonding</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUnbonding.length} Requests</div>
            <p className="text-xs text-muted-foreground">
              {formatWeiToTBURN(pendingUnbonding.reduce((sum, u) => sum + BigInt(u.amount || "0"), BigInt(0)).toString())} TBURN pending
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-next-distribution">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Distribution</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {cycleLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {currentCycle?.endTimestamp ? formatTimeRemaining(currentCycle.endTimestamp) : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Base APY: {currentCycle?.baseApy || 0}%
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-claim-all">
              <Gift className="h-4 w-4 mr-2" />
              Claim All Rewards
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claim All Rewards</DialogTitle>
              <DialogDescription>
                You are about to claim all your pending staking rewards.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Pending Rewards</span>
                  <span className="font-bold text-green-500">2,547.83 TBURN</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">From Pools</span>
                  <span>4 pools</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~0.001 TBURN</span>
                </div>
              </div>

              <div className="p-3 border border-yellow-500/50 bg-yellow-500/10 rounded-lg flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Claiming will reset compound bonus</p>
                  <p className="text-muted-foreground">Consider re-staking to maintain your tier benefits.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleClaimRewards} data-testid="button-confirm-claim">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Claim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="lg" data-testid="button-compound-all">
          <Repeat className="h-4 w-4 mr-2" />
          Compound All
        </Button>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList data-testid="tabs-rewards">
          <TabsTrigger value="history" data-testid="tab-history">Reward History</TabsTrigger>
          <TabsTrigger value="cycles" data-testid="tab-cycles">Reward Cycles</TabsTrigger>
          <TabsTrigger value="unbonding" data-testid="tab-unbonding">Unbonding</TabsTrigger>
          <TabsTrigger value="slashing" data-testid="tab-slashing">Slashing Events</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card data-testid="card-reward-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Reward Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const isCompounded = Math.random() > 0.5;
                    const tier = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"][Math.floor(Math.random() * 5)];
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isCompounded ? "bg-purple-500/10" : "bg-green-500/10"}`}>
                            {isCompounded ? (
                              <Repeat className="h-4 w-4 text-purple-500" />
                            ) : (
                              <Gift className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {isCompounded ? "Auto-Compounded" : "Reward Distributed"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cycle #{100 - Math.floor(i / 2)} | {tier} Pool
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">
                            +{(Math.random() * 100 + 10).toFixed(4)} TBURN
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 24)} hours ago
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cycles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cyclesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : cycles && cycles.length > 0 ? (
              cycles.map(cycle => (
                <Card key={cycle.id} data-testid={`card-cycle-${cycle.cycleNumber}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Cycle #{cycle.cycleNumber}</CardTitle>
                      <Badge variant={cycle.status === "active" ? "default" : "outline"}>
                        {cycle.status === "active" ? (
                          <Activity className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {cycle.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(cycle.startTimestamp).toLocaleDateString()} - {cycle.endTimestamp ? new Date(cycle.endTimestamp).toLocaleDateString() : "Ongoing"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Distributed</span>
                      <span className="font-medium">{formatWeiToTBURN(cycle.totalRewards)} TBURN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Participants</span>
                      <span className="font-medium">{formatNumber(cycle.totalParticipants)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base APY</span>
                      <span className="font-medium text-green-500">{cycle.baseApy}%</span>
                    </div>
                    {cycle.status === "active" && (
                      <Progress value={45} className="mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Reward Cycles</h3>
                <p className="text-muted-foreground">Reward cycles will appear here once staking is active.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="unbonding" className="space-y-4">
          <Card data-testid="card-unbonding-requests">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Unbonding Requests
              </CardTitle>
              <CardDescription>
                21-day unbonding period applies to all unstaking requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unbondingLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : unbonding && unbonding.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {unbonding.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 rounded-md border">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${request.status === "pending" ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
                            {request.status === "pending" ? (
                              <Timer className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{formatWeiToTBURN(request.amount)} TBURN</p>
                            <p className="text-xs text-muted-foreground">
                              Requested: {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {request.status === "pending" ? (
                            <>
                              <p className="font-medium text-yellow-500">
                                {formatTimeRemaining(request.completesAt)} remaining
                              </p>
                              <Progress 
                                value={Math.max(0, 100 - (new Date(request.completesAt).getTime() - Date.now()) / (21 * 24 * 60 * 60 * 10))} 
                                className="w-24 mt-1"
                              />
                            </>
                          ) : (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Unbonding Requests</h3>
                  <p className="text-muted-foreground">You don't have any pending unstaking requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slashing" className="space-y-4">
          <Card data-testid="card-slashing-events">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Slashing Events
              </CardTitle>
              <CardDescription>
                Validator penalties that may affect your staked amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slashingLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : slashingEvents && slashingEvents.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {slashingEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-4 rounded-md border border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-red-500/10">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium">{event.slashType}</p>
                            <p className="text-xs text-muted-foreground">
                              Validator: {event.validatorAddress?.slice(0, 10)}...
                            </p>
                            <p className="text-xs text-muted-foreground">{event.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-500">
                            -{formatWeiToTBURN(event.slashAmount)} TBURN
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.slashPercentage}% slashed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">No Slashing Events</h3>
                  <p className="text-muted-foreground">Your validators have maintained excellent behavior.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
