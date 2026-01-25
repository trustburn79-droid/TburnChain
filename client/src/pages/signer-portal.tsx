import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Timer,
  AlertTriangle,
  Ban,
  FileText,
  ExternalLink,
  Copy,
  Wallet,
  Key,
  User,
  LogIn,
  LogOut,
  RefreshCw,
  History,
  ArrowRight,
  Lock,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import { ko } from "date-fns/locale";

interface Signer {
  id: number;
  signerId: string;
  walletId: string;
  name: string;
  role: string;
  signerAddress: string;
  email: string | null;
  canApproveEmergency: boolean;
  isActive: boolean;
  totalSignatures: number;
  lastSignatureAt: string | null;
}

interface CustodyTransaction {
  id: number;
  transactionId: string;
  walletId: string;
  transactionType: string;
  recipientAddress: string;
  recipientName: string | null;
  amount: string;
  amountUsd: string | null;
  status: string;
  approvalCount: number;
  requiredApprovals: number;
  purpose: string;
  justification: string | null;
  documentationUrl: string | null;
  proposedAt: string;
  proposedBy: string;
  timelockExpiresAt: string | null;
  approvalExpiresAt: string | null;
  isEmergency: boolean;
}

interface TransactionApproval {
  id: number;
  approvalId: string;
  transactionId: string;
  signerId: string;
  decision: string;
  comment: string | null;
  decidedAt: string;
}

const TRANSACTION_TYPES: Record<string, { label: string; description: string }> = {
  grant_disbursement: { label: "Grant Disbursement", description: "보조금 지급" },
  marketing_spend: { label: "Marketing Spend", description: "마케팅 비용" },
  partnership_payment: { label: "Partnership Payment", description: "파트너십 지급" },
  emergency_transfer: { label: "Emergency Transfer", description: "긴급 이체" },
  dao_execution: { label: "DAO Execution", description: "DAO 실행" },
};

function formatTburnAmount(amount: string): string {
  try {
    const value = BigInt(amount);
    const tburn = Number(value) / 1e18;
    if (tburn >= 1_000_000_000) return `${(tburn / 1_000_000_000).toFixed(2)}B TBURN`;
    if (tburn >= 1_000_000) return `${(tburn / 1_000_000).toFixed(2)}M TBURN`;
    if (tburn >= 1_000) return `${(tburn / 1_000).toFixed(2)}K TBURN`;
    return `${tburn.toFixed(4)} TBURN`;
  } catch {
    return amount;
  }
}

function formatAddress(address: string): string {
  if (address.length <= 20) return address;
  return `${address.slice(0, 12)}...${address.slice(-8)}`;
}

function copyToClipboard(text: string, toast: any) {
  navigator.clipboard.writeText(text);
  toast({ title: "복사됨", description: "클립보드에 복사되었습니다." });
}

export default function SignerPortalPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [authenticatedSigner, setAuthenticatedSigner] = useState<Signer | null>(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CustodyTransaction | null>(null);
  const [voteData, setVoteData] = useState({
    decision: "approve" as "approve" | "reject" | "abstain",
    comment: "",
  });

  useEffect(() => {
    const savedSigner = sessionStorage.getItem("signerPortalAuth");
    if (savedSigner) {
      try {
        setAuthenticatedSigner(JSON.parse(savedSigner));
      } catch (e) {
        sessionStorage.removeItem("signerPortalAuth");
      }
    }
  }, []);

  const { data: signersData, isLoading: signersLoading } = useQuery<{ signers: Signer[] }>({
    queryKey: ["/api/custody-admin/signers", { walletId: "foundation-custody-main", activeOnly: "true" }],
    enabled: !authenticatedSigner,
  });

  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<{ transactions: CustodyTransaction[] }>({
    queryKey: ["/api/custody-admin/transactions", { status: "pending_approval" }],
    enabled: !!authenticatedSigner,
    refetchInterval: 30000,
  });

  const { data: myVotesData, refetch: refetchMyVotes } = useQuery<{ approvals: TransactionApproval[] }>({
    queryKey: ["/api/custody-admin/signer-votes", authenticatedSigner?.signerId],
    enabled: !!authenticatedSigner,
    queryFn: async () => {
      const res = await fetch(`/api/custody-admin/signer-votes/${authenticatedSigner?.signerId}`, {
        credentials: "include",
      });
      if (!res.ok) return { approvals: [] };
      return res.json();
    },
  });

  const signers: Signer[] = signersData?.signers || [];
  const pendingTransactions: CustodyTransaction[] = transactionsData?.transactions?.filter(t => t.status === "pending_approval") || [];
  const myVotes: TransactionApproval[] = myVotesData?.approvals || [];

  const handleLogin = () => {
    const signer = signers.find(s => s.signerAddress.toLowerCase() === signerAddress.toLowerCase());
    if (signer) {
      setAuthenticatedSigner(signer);
      sessionStorage.setItem("signerPortalAuth", JSON.stringify(signer));
      toast({ title: "로그인 성공", description: `${signer.name}님으로 로그인되었습니다.` });
    } else {
      toast({ title: "인증 실패", description: "등록된 서명자 주소가 아닙니다.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setAuthenticatedSigner(null);
    sessionStorage.removeItem("signerPortalAuth");
    setSignerAddress("");
    toast({ title: "로그아웃", description: "로그아웃되었습니다." });
  };

  const voteMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: { signerId: string; decision: string; comment: string } }) => {
      return apiRequest("POST", `/api/custody-admin/transactions/${transactionId}/approve`, data);
    },
    onSuccess: (response: any) => {
      const status = response?.thresholdStatus;
      toast({ 
        title: "투표 완료", 
        description: `투표가 기록되었습니다. (${status?.current || 0}/${status?.required || 7} 승인)` 
      });
      refetchTransactions();
      refetchMyVotes();
      setShowVoteDialog(false);
      setVoteData({ decision: "approve", comment: "" });
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "투표 기록 실패", variant: "destructive" });
    },
  });

  const hasVoted = (transactionId: string) => {
    return myVotes.some(v => v.transactionId === transactionId);
  };

  const getMyVote = (transactionId: string) => {
    return myVotes.find(v => v.transactionId === transactionId);
  };

  if (!authenticatedSigner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">TBURN 서명자 포털</CardTitle>
            <CardDescription>
              다중서명 트랜잭션 승인 시스템
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="signerAddress">서명자 주소 (tb1...)</Label>
              <Input
                id="signerAddress"
                value={signerAddress}
                onChange={(e) => setSignerAddress(e.target.value)}
                placeholder="tb1q..."
                className="font-mono"
                data-testid="input-signer-address"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              등록된 서명자 주소로 인증하세요. 주소는 재단 커스터디 지갑에 등록되어 있어야 합니다.
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={!signerAddress || signersLoading}
              data-testid="button-signer-login"
            >
              {signersLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
              인증
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">TBURN 서명자 포털</h1>
              <p className="text-sm text-muted-foreground">다중서명 트랜잭션 승인</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {authenticatedSigner.name}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatAddress(authenticatedSigner.signerAddress)}
              </div>
            </div>
            <Badge variant={authenticatedSigner.canApproveEmergency ? "default" : "secondary"}>
              {authenticatedSigner.role}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-signer-logout">
              <LogOut className="w-4 h-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">대기 중 트랜잭션</p>
                  <p className="text-3xl font-bold">{pendingTransactions.length}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">내 총 서명</p>
                  <p className="text-3xl font-bold">{authenticatedSigner.totalSignatures || 0}</p>
                </div>
                <Key className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">긴급 승인 권한</p>
                  <p className="text-2xl font-bold">{authenticatedSigner.canApproveEmergency ? "있음" : "없음"}</p>
                </div>
                <AlertTriangle className={`w-10 h-10 ${authenticatedSigner.canApproveEmergency ? "text-orange-500" : "text-muted-foreground"}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>승인 대기 트랜잭션</CardTitle>
              <CardDescription>7/11 다중서명 승인이 필요한 트랜잭션</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchTransactions()} data-testid="button-refresh-pending">
              <RefreshCw className="w-4 h-4 mr-1" />
              새로고침
            </Button>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : pendingTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>현재 대기 중인 트랜잭션이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTransactions.map(transaction => {
                  const voted = hasVoted(transaction.transactionId);
                  const myVote = getMyVote(transaction.transactionId);
                  const txType = TRANSACTION_TYPES[transaction.transactionType];
                  const hoursRemaining = transaction.approvalExpiresAt 
                    ? differenceInHours(new Date(transaction.approvalExpiresAt), new Date())
                    : 168;

                  return (
                    <Card key={transaction.transactionId} className={voted ? "border-muted" : "border-primary/50"}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">{transaction.transactionId.slice(0, 16)}...</code>
                              {transaction.isEmergency && (
                                <Badge variant="destructive">긴급</Badge>
                              )}
                              {voted && (
                                <Badge variant={myVote?.decision === "approve" ? "default" : myVote?.decision === "reject" ? "destructive" : "secondary"}>
                                  {myVote?.decision === "approve" ? "승인함" : myVote?.decision === "reject" ? "거부함" : "기권함"}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">유형: </span>
                                <span>{txType?.label} ({txType?.description})</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">금액: </span>
                                <span className="font-bold">{formatTburnAmount(transaction.amount)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">수신자: </span>
                                <span className="font-mono text-xs">{formatAddress(transaction.recipientAddress)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">목적: </span>
                                <span>{transaction.purpose}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">승인:</span>
                                <Progress 
                                  value={(transaction.approvalCount / transaction.requiredApprovals) * 100} 
                                  className="w-20 h-2"
                                />
                                <span className="font-medium">{transaction.approvalCount}/{transaction.requiredApprovals}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Timer className="w-3 h-3" />
                                <span>{hoursRemaining}시간 남음</span>
                              </div>
                              <div className="text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.proposedAt), { addSuffix: true, locale: ko })} 제안
                              </div>
                            </div>

                            {transaction.documentationUrl && (
                              <a 
                                href={transaction.documentationUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary flex items-center gap-1 hover:underline"
                              >
                                <FileText className="w-3 h-3" />
                                관련 문서 보기
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {!voted ? (
                              <Button
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowVoteDialog(true);
                                }}
                                data-testid={`button-vote-${transaction.transactionId}`}
                              >
                                <Key className="w-4 h-4 mr-1" />
                                투표하기
                              </Button>
                            ) : (
                              <Button variant="outline" disabled>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                투표 완료
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(transaction.recipientAddress, toast)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              주소 복사
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              내 투표 이력
            </CardTitle>
            <CardDescription>이전에 투표한 트랜잭션 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {myVotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                아직 투표 이력이 없습니다
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>트랜잭션 ID</TableHead>
                    <TableHead>결정</TableHead>
                    <TableHead>코멘트</TableHead>
                    <TableHead>투표일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myVotes.slice(0, 10).map(vote => (
                    <TableRow key={vote.approvalId}>
                      <TableCell>
                        <code className="text-xs">{vote.transactionId.slice(0, 16)}...</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vote.decision === "approve" ? "default" : vote.decision === "reject" ? "destructive" : "secondary"}>
                          {vote.decision === "approve" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {vote.decision === "reject" && <XCircle className="w-3 h-3 mr-1" />}
                          {vote.decision === "abstain" && <Ban className="w-3 h-3 mr-1" />}
                          {vote.decision === "approve" ? "승인" : vote.decision === "reject" ? "거부" : "기권"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {vote.comment || "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(vote.decidedAt), "yyyy-MM-dd HH:mm", { locale: ko })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>트랜잭션 투표</DialogTitle>
            <DialogDescription>
              이 트랜잭션에 대해 승인, 거부 또는 기권 결정을 내려주세요
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">금액:</span>
                  <span className="font-bold">{formatTburnAmount(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">수신자:</span>
                  <span className="font-mono text-xs">{formatAddress(selectedTransaction.recipientAddress)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">목적:</span>
                  <span>{selectedTransaction.purpose}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">현재 승인:</span>
                  <span>{selectedTransaction.approvalCount}/{selectedTransaction.requiredApprovals}</span>
                </div>
                {selectedTransaction.justification && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">사유:</span>
                    <p className="mt-1">{selectedTransaction.justification}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-base">결정</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    variant={voteData.decision === "approve" ? "default" : "outline"}
                    onClick={() => setVoteData(prev => ({ ...prev, decision: "approve" }))}
                    className="h-20 flex-col"
                    data-testid="button-vote-approve"
                  >
                    <CheckCircle className="w-6 h-6 mb-1 text-green-500" />
                    <span>승인</span>
                  </Button>
                  <Button
                    variant={voteData.decision === "reject" ? "destructive" : "outline"}
                    onClick={() => setVoteData(prev => ({ ...prev, decision: "reject" }))}
                    className="h-20 flex-col"
                    data-testid="button-vote-reject"
                  >
                    <XCircle className="w-6 h-6 mb-1 text-red-500" />
                    <span>거부</span>
                  </Button>
                  <Button
                    variant={voteData.decision === "abstain" ? "secondary" : "outline"}
                    onClick={() => setVoteData(prev => ({ ...prev, decision: "abstain" }))}
                    className="h-20 flex-col"
                    data-testid="button-vote-abstain"
                  >
                    <Ban className="w-6 h-6 mb-1 text-muted-foreground" />
                    <span>기권</span>
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="voteComment">코멘트 (선택)</Label>
                <Textarea
                  id="voteComment"
                  value={voteData.comment}
                  onChange={(e) => setVoteData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="투표에 대한 의견을 입력하세요..."
                  rows={3}
                  data-testid="input-vote-comment"
                />
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                투표는 취소할 수 없습니다. 신중하게 결정해주세요.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoteDialog(false)}>
              취소
            </Button>
            <Button
              onClick={() => selectedTransaction && authenticatedSigner && voteMutation.mutate({
                transactionId: selectedTransaction.transactionId,
                data: {
                  signerId: authenticatedSigner.signerId,
                  decision: voteData.decision,
                  comment: voteData.comment,
                }
              })}
              disabled={voteMutation.isPending}
              data-testid="button-submit-vote"
            >
              {voteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Key className="w-4 h-4 mr-1" />}
              투표 제출
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
