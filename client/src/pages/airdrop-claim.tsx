import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Gift, Search, CheckCircle2, Clock, AlertCircle, Wallet, 
  ArrowRight, Coins, Users, TrendingUp, Loader2, ExternalLink
} from "lucide-react";
import { Link } from "wouter";

interface AirdropInfo {
  programName: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  stats: {
    totalEligible: number;
    totalClaimed: number;
    claimRate: string;
    totalAmount: string;
    claimedAmount: string;
  };
  tiers: { name: string; label: string; minAmount: string; maxAmount: string }[];
  completedBatches: number;
}

interface ClaimData {
  id: string;
  tier: string;
  claimableAmount: string;
  claimedAmount: string | null;
  status: string;
  claimedAt: string | null;
}

interface EligibilityData {
  eligible: boolean;
  message?: string;
  claims?: ClaimData[];
  summary?: {
    totalClaims: number;
    eligibleClaims: number;
    claimedClaims: number;
    totalClaimable: string;
    totalClaimed: string;
  };
}

const formatTBURN = (amount: string) => {
  const num = BigInt(amount || '0');
  const tburn = Number(num) / 1e18;
  if (tburn >= 1e6) return `${(tburn / 1e6).toFixed(2)}M`;
  if (tburn >= 1e3) return `${(tburn / 1e3).toFixed(2)}K`;
  return tburn.toFixed(4);
};

const getTierInfo = (tier: string) => {
  switch (tier) {
    case 'legendary': return { label: 'Legendary', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white', icon: '🏆' };
    case 'whale': return { label: 'Whale', color: 'bg-purple-600 text-white', icon: '🐋' };
    case 'og': return { label: 'OG', color: 'bg-blue-600 text-white', icon: '⭐' };
    case 'holder': return { label: 'Holder', color: 'bg-teal-600 text-white', icon: '💎' };
    default: return { label: 'Basic', color: 'bg-gray-600 text-white', icon: '🎁' };
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'claimed': return { label: '청구 완료', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 };
    case 'eligible': return { label: '청구 가능', color: 'bg-blue-500/20 text-blue-400', icon: Gift };
    case 'processing': return { label: '처리 중', color: 'bg-purple-500/20 text-purple-400', icon: Clock };
    case 'expired': return { label: '만료됨', color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle };
    default: return { label: status, color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle };
  }
};

export default function AirdropClaimPage() {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState("");
  const [searchedWallet, setSearchedWallet] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data: infoData, isLoading: infoLoading } = useQuery<{ success: boolean; data: AirdropInfo }>({
    queryKey: ['/api/airdrop/info'],
  });

  const { data: eligibilityData, isLoading: eligibilityLoading, refetch: refetchEligibility } = useQuery<{ success: boolean; data: EligibilityData }>({
    queryKey: ['/api/airdrop/check', searchedWallet],
    enabled: !!searchedWallet,
  });

  const claimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      setClaimingId(claimId);
      return apiRequest('POST', '/api/airdrop/claim', {
        walletAddress: searchedWallet,
        claimId,
      });
    },
    onSuccess: (data: any) => {
      refetchEligibility();
      toast({
        title: "에어드랍 청구 성공",
        description: `${formatTBURN(data.data?.transaction?.amount || '0')} TBURN이 지갑으로 전송되었습니다`,
      });
      setClaimingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "청구 실패",
        description: error.message || "에어드랍 청구에 실패했습니다",
        variant: "destructive",
      });
      setClaimingId(null);
    }
  });

  const handleSearch = () => {
    if (!walletAddress.trim()) {
      toast({
        title: "지갑 주소 필요",
        description: "지갑 주소를 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    setSearchedWallet(walletAddress.trim().toLowerCase());
  };

  const info = infoData?.data;
  const eligibility = eligibilityData?.data;
  const claimRate = info?.stats?.claimRate ? parseFloat(info.stats.claimRate) : 0;

  return (
    <div className="min-h-screen bg-background" data-testid="airdrop-claim-page">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Gift className="h-4 w-4" />
              <span className="text-sm font-medium">TBURN Mainnet Launch Airdrop</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-page-title">
              에어드랍 청구
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              TBURN 메인넷 런칭 기념 에어드랍 프로그램에 참여하세요.
              지갑 주소를 입력하여 청구 가능 여부를 확인하고 토큰을 받으세요.
            </p>
          </div>

          {infoLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : info && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card data-testid="card-total-eligible">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">총 대상자</p>
                      <p className="text-2xl font-bold">{info.stats.totalEligible.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="card-claimed">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">청구 완료</p>
                      <p className="text-2xl font-bold">{info.stats.totalClaimed.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="card-claim-rate">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">청구율</p>
                      <p className="text-2xl font-bold">{info.stats.claimRate}%</p>
                    </div>
                  </div>
                  <Progress value={claimRate} className="mt-2 h-1" />
                </CardContent>
              </Card>
              <Card data-testid="card-total-amount">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Coins className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">총 배분량</p>
                      <p className="text-2xl font-bold">{formatTBURN(info.stats.totalAmount)} TBURN</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="max-w-2xl mx-auto mb-8" data-testid="card-wallet-check">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                자격 확인
              </CardTitle>
              <CardDescription>
                지갑 주소를 입력하여 에어드랍 청구 가능 여부를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="지갑 주소 입력 (tb1...)"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-12"
                    data-testid="input-wallet-address"
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  disabled={eligibilityLoading}
                  data-testid="button-check-eligibility"
                >
                  {eligibilityLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      확인
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchedWallet && !eligibilityLoading && eligibility && (
            <div className="max-w-2xl mx-auto space-y-4">
              {!eligibility.eligible && !eligibility.claims?.length ? (
                <Card className="border-amber-500/50" data-testid="card-not-eligible">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-amber-500/10">
                        <AlertCircle className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">대상자가 아닙니다</h3>
                        <p className="text-muted-foreground">
                          이 지갑 주소는 에어드랍 대상에 포함되어 있지 않습니다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {eligibility.summary && (
                    <Card data-testid="card-eligibility-summary">
                      <CardHeader>
                        <CardTitle className="text-lg">청구 요약</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">총 청구 건수</p>
                            <p className="text-xl font-bold">{eligibility.summary.totalClaims}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">청구 가능</p>
                            <p className="text-xl font-bold text-blue-500">{eligibility.summary.eligibleClaims}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">청구 완료</p>
                            <p className="text-xl font-bold text-emerald-500">{eligibility.summary.claimedClaims}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">청구 가능 금액</p>
                            <p className="text-xl font-bold">{formatTBURN(eligibility.summary.totalClaimable)} TBURN</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {eligibility.claims?.map((claim) => {
                    const tierInfo = getTierInfo(claim.tier);
                    const statusInfo = getStatusInfo(claim.status);
                    const StatusIcon = statusInfo.icon;
                    const isClaimable = claim.status === 'eligible';
                    const isClaiming = claimingId === claim.id;

                    return (
                      <Card key={claim.id} data-testid={`card-claim-${claim.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">{tierInfo.icon}</div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={tierInfo.color}>{tierInfo.label}</Badge>
                                  <Badge className={statusInfo.color}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <p className="text-2xl font-bold">
                                  {formatTBURN(claim.claimableAmount)} TBURN
                                </p>
                                {claim.claimedAt && (
                                  <p className="text-sm text-muted-foreground">
                                    청구일: {new Date(claim.claimedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isClaimable && (
                                <Button
                                  size="lg"
                                  onClick={() => claimMutation.mutate(claim.id)}
                                  disabled={isClaiming || claimMutation.isPending}
                                  data-testid={`button-claim-${claim.id}`}
                                >
                                  {isClaiming ? (
                                    <>
                                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                      처리 중...
                                    </>
                                  ) : (
                                    <>
                                      <Gift className="mr-2 h-5 w-5" />
                                      청구하기
                                    </>
                                  )}
                                </Button>
                              )}
                              {claim.status === 'claimed' && (
                                <div className="flex items-center gap-2 text-emerald-500">
                                  <CheckCircle2 className="h-5 w-5" />
                                  <span className="font-medium">청구 완료</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {info && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-center mb-6">에어드랍 티어</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {info.tiers.map((tier) => {
                  const tierInfo = getTierInfo(tier.name);
                  return (
                    <Card key={tier.name} className="text-center hover-elevate" data-testid={`card-tier-${tier.name}`}>
                      <CardContent className="pt-6">
                        <div className="text-4xl mb-2">{tierInfo.icon}</div>
                        <Badge className={tierInfo.color}>{tier.label}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {tier.minAmount} - {tier.maxAmount} TBURN
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">에어드랍 프로그램 안내</h3>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• 에어드랍은 2026년 1월 2일 메인넷 런칭과 함께 시작되었습니다</li>
                  <li>• 청구 기한: 2026년 3월 31일까지</li>
                  <li>• 티어는 사전 스냅샷 기준 TBURN 보유량에 따라 결정됩니다</li>
                  <li>• 청구된 토큰은 즉시 지갑으로 전송됩니다</li>
                  <li>• 문의사항은 공식 커뮤니티를 통해 연락주세요</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
