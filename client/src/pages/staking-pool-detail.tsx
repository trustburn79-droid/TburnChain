import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft,
  Coins, 
  TrendingUp,
  Activity,
  Shield,
  Award,
  Clock,
  Users,
  Percent,
  Lock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  BarChart3,
  Gift,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

interface StakingPool {
  id: string;
  name: string;
  poolType: string;
  tier: string;
  validatorId: string;
  validatorAddress: string;
  validatorName: string;
  minStake: string;
  maxStake: string | null;
  apy: number;
  apyBoost: number;
  totalStaked: string;
  stakersCount: number;
  lockPeriodDays: number;
  earlyWithdrawalPenalty: number;
  status: string;
  isCompoundingEnabled: boolean;
  rewardFrequency: string;
  description: string;
  createdAt: string;
}

interface StakingPosition {
  id: string;
  stakerAddress: string;
  poolId: string;
  stakedAmount: string;
  pendingRewards: string;
  tier: string;
  autoCompound: boolean;
  status: string;
  createdAt: string;
}

const tierColors: Record<string, string> = {
  bronze: "bg-amber-600 text-white",
  silver: "bg-slate-400 text-white",
  gold: "bg-yellow-500 text-white",
  platinum: "bg-purple-600 text-white",
  diamond: "bg-cyan-500 text-white"
};

const tierIcons: Record<string, JSX.Element> = {
  bronze: <Coins className="h-4 w-4" />,
  silver: <Shield className="h-4 w-4" />,
  gold: <Award className="h-4 w-4" />,
  platinum: <Target className="h-4 w-4" />,
  diamond: <Zap className="h-4 w-4" />
};

function formatWeiToTBURN(weiStr: string): string {
  try {
    const wei = BigInt(weiStr);
    const tburn = Number(wei) / 1e18;
    if (tburn >= 1e9) return `${(tburn / 1e9).toFixed(2)}B`;
    if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
    if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
    return tburn.toFixed(2);
  } catch {
    return "0";
  }
}

export default function StakingPoolDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState("");
  const [autoCompound, setAutoCompound] = useState(true);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);

  const { data: pool, isLoading: poolLoading } = useQuery<StakingPool>({
    queryKey: ["/api/staking/pools", id]
  });

  const { data: positions, isLoading: positionsLoading } = useQuery<StakingPosition[]>({
    queryKey: ["/api/staking/positions", { poolId: id }]
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Address copied to clipboard"
    });
  };

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Staking Request Submitted",
      description: `Your stake of ${stakeAmount} TBURN is being processed`
    });
    setStakeDialogOpen(false);
    setStakeAmount("");
  };

  if (poolLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Pool Not Found</h3>
            <p className="text-muted-foreground">The staking pool you're looking for doesn't exist.</p>
            <Link href="/staking">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Staking
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staking">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" data-testid="text-pool-name">{pool.name}</h1>
            <Badge className={tierColors[pool.tier.toLowerCase()] || "bg-gray-500"}>
              {tierIcons[pool.tier.toLowerCase()]}
              <span className="ml-1 capitalize">{pool.tier}</span>
            </Badge>
            <Badge variant={pool.status === "active" ? "default" : "secondary"}>
              {pool.status === "active" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {pool.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{pool.description || "High-yield staking pool with advanced features"}</p>
        </div>
        <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-stake-now">
              <Coins className="h-4 w-4 mr-2" />
              Stake TBURN
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stake to {pool.name}</DialogTitle>
              <DialogDescription>
                Enter the amount of TBURN you want to stake in this pool.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount (TBURN)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter stake amount..."
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    data-testid="input-stake-dialog"
                  />
                  <Button variant="outline" size="sm">MAX</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum: {formatWeiToTBURN(pool.minStake)} TBURN
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Compound</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically reinvest your rewards
                  </p>
                </div>
                <Switch
                  checked={autoCompound}
                  onCheckedChange={setAutoCompound}
                  data-testid="switch-auto-compound"
                />
              </div>

              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current APY</span>
                  <span className="font-medium text-green-500">{pool.apy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lock Period</span>
                  <span className="font-medium">{pool.lockPeriodDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Early Withdrawal Fee</span>
                  <span className="font-medium">{pool.earlyWithdrawalPenalty}%</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStakeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleStake} data-testid="button-confirm-stake">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Stake
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-staked">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeiToTBURN(pool.totalStaked)} TBURN</div>
            <Progress value={Math.min(100, (parseInt(pool.totalStaked) / 1e21) * 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-current-apy">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current APY</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{pool.apy}%</div>
            <p className="text-xs text-muted-foreground">
              +{pool.apyBoost}% boost available
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-stakers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(pool.stakersCount)}</div>
            <p className="text-xs text-muted-foreground">
              {pool.rewardFrequency} rewards
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-lock-period">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lock Period</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pool.lockPeriodDays} Days</div>
            <p className="text-xs text-muted-foreground">
              {pool.earlyWithdrawalPenalty}% early withdrawal fee
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2" data-testid="card-pool-info">
          <CardHeader>
            <CardTitle>Pool Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Pool Type</span>
                  <span className="font-medium capitalize">{pool.poolType}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tier Level</span>
                  <Badge className={tierColors[pool.tier.toLowerCase()]}>
                    {tierIcons[pool.tier.toLowerCase()]}
                    <span className="ml-1 capitalize">{pool.tier}</span>
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Minimum Stake</span>
                  <span className="font-medium">{formatWeiToTBURN(pool.minStake)} TBURN</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Maximum Stake</span>
                  <span className="font-medium">
                    {pool.maxStake ? formatWeiToTBURN(pool.maxStake) + " TBURN" : "No Limit"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Compounding</span>
                  <Badge variant={pool.isCompoundingEnabled ? "default" : "outline"}>
                    {pool.isCompoundingEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Reward Frequency</span>
                  <span className="font-medium capitalize">{pool.rewardFrequency}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(pool.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Pool ID</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">{pool.id.slice(0, 8)}...</span>
                    <Button variant="ghost" size="sm" onClick={() => copyAddress(pool.id)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-validator-info">
          <CardHeader>
            <CardTitle>Validator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{pool.validatorName || "TBURN Validator"}</p>
                <p className="text-xs text-muted-foreground">
                  {pool.validatorAddress?.slice(0, 10)}...{pool.validatorAddress?.slice(-8)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Commission</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium text-green-500">99.98%</span>
              </div>
            </div>

            <Link href={`/validator/${pool.validatorAddress}`}>
              <Button variant="outline" className="w-full" data-testid="button-view-validator">
                View Validator Details
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-stakers-list">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Stakers
          </CardTitle>
          <CardDescription>
            Addresses with the largest stakes in this pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {positionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : positions && positions.length > 0 ? (
              <div className="space-y-2">
                {positions.slice(0, 10).map((position, i) => (
                  <div key={position.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                      <div>
                        <p className="font-mono text-sm">
                          {position.stakerAddress.slice(0, 10)}...{position.stakerAddress.slice(-8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {position.autoCompound ? "Auto-compound" : "Manual"} | {position.tier}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatWeiToTBURN(position.stakedAmount)} TBURN</p>
                      <p className="text-xs text-green-500">
                        +{formatWeiToTBURN(position.pendingRewards)} pending
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No stakers in this pool yet</p>
                <Button className="mt-4" onClick={() => setStakeDialogOpen(true)}>
                  Be the first to stake
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
