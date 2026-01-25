import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Timer,
  AlertTriangle,
  AlertOctagon,
  Ban,
  FileText,
  ExternalLink,
  Copy,
  Wallet,
  Key,
  User,
  Users,
  LogIn,
  LogOut,
  RefreshCw,
  History,
  ArrowRight,
  ArrowUpRight,
  Lock,
  LockOpen,
  Zap,
  Activity,
  Bell,
  BellRing,
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronRight,
  Fingerprint,
  Building2,
  TrendingUp,
  CircleDot,
  Radio,
  Signal,
  Boxes,
  Server,
  Database,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format, differenceInHours, differenceInMinutes, addDays } from "date-fns";
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
  approved: boolean;
  comments: string | null;
  approvedAt: string;
}

const TRANSACTION_TYPES: Record<string, { label: string; description: string; icon: any; color: string }> = {
  grant_disbursement: { label: "Grant Disbursement", description: "보조금 지급", icon: Building2, color: "text-blue-500" },
  marketing_spend: { label: "Marketing Spend", description: "마케팅 비용", icon: TrendingUp, color: "text-purple-500" },
  partnership_payment: { label: "Partnership Payment", description: "파트너십 지급", icon: Users, color: "text-green-500" },
  emergency_transfer: { label: "Emergency Transfer", description: "긴급 이체", icon: Zap, color: "text-red-500" },
  dao_execution: { label: "DAO Execution", description: "DAO 실행", icon: Boxes, color: "text-orange-500" },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  founder: { label: "창립자", color: "bg-gradient-to-r from-amber-500 to-yellow-500" },
  board_member: { label: "이사회 멤버", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  advisor: { label: "자문위원", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  treasury_manager: { label: "재무 관리자", color: "bg-gradient-to-r from-green-500 to-emerald-500" },
  security_officer: { label: "보안 책임자", color: "bg-gradient-to-r from-red-500 to-orange-500" },
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

function formatAddress(address: string, length: number = 16): string {
  if (address.length <= length) return address;
  const half = Math.floor(length / 2);
  return `${address.slice(0, half + 4)}...${address.slice(-half)}`;
}

function copyToClipboard(text: string, toast: any) {
  navigator.clipboard.writeText(text);
  toast({ title: "복사됨", description: "클립보드에 복사되었습니다." });
}

function getTimeRemainingColor(hoursRemaining: number): string {
  if (hoursRemaining < 24) return "text-red-500";
  if (hoursRemaining < 72) return "text-orange-500";
  return "text-muted-foreground";
}

function getProgressColor(current: number, required: number): string {
  const ratio = current / required;
  if (ratio >= 1) return "bg-green-500";
  if (ratio >= 0.5) return "bg-yellow-500";
  return "bg-orange-500";
}

export default function SignerPortalPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [authenticatedSigner, setAuthenticatedSigner] = useState<Signer | null>(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CustodyTransaction | null>(null);
  const [voteData, setVoteData] = useState({
    decision: "approve" as "approve" | "reject",
    comment: "",
  });
  const [showConfirmVote, setShowConfirmVote] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [codeExpiresAt, setCodeExpiresAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState<number>(0);

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

  useEffect(() => {
    if (!authenticatedSigner) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channel: "custody-transactions" }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "custody-update" || data.type === "new-transaction") {
              setNotifications(prev => prev + 1);
              setLastUpdate(new Date());
              refetchTransactions();
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        setWsConnected(false);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [authenticatedSigner]);

  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<{ transactions: CustodyTransaction[] }>({
    queryKey: ["/api/signer-portal/transactions"],
    enabled: !!authenticatedSigner,
    refetchInterval: 30000,
  });

  const { data: myVotesData, refetch: refetchMyVotes } = useQuery<{ approvals: TransactionApproval[] }>({
    queryKey: ["/api/signer-portal/votes", authenticatedSigner?.signerId],
    enabled: !!authenticatedSigner,
    queryFn: async () => {
      const res = await fetch(`/api/signer-portal/votes/${authenticatedSigner?.signerId}`, {
        credentials: "include",
      });
      if (!res.ok) return { approvals: [] };
      return res.json();
    },
  });

  const allTransactions: CustodyTransaction[] = transactionsData?.transactions || [];
  const pendingTransactions = allTransactions.filter(t => t.status === "pending_approval");
  const emergencyTransactions = pendingTransactions.filter(t => t.isEmergency);
  const regularTransactions = pendingTransactions.filter(t => !t.isEmergency);
  const myVotes: TransactionApproval[] = myVotesData?.approvals || [];

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!signerAddress.startsWith("tb1")) {
      toast({ title: "인증 실패", description: "tb1으로 시작하는 유효한 Bech32m 주소를 입력하세요.", variant: "destructive" });
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const response = await fetch(`/api/signer-portal/signer-by-address/${encodeURIComponent(signerAddress)}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const data = await response.json();
        toast({ title: "인증 실패", description: data.error || "등록된 서명자 주소가 아닙니다.", variant: "destructive" });
        return;
      }
      
      const data = await response.json();
      if (data.success && data.signer) {
        setAuthenticatedSigner(data.signer);
        sessionStorage.setItem("signerPortalAuth", JSON.stringify(data.signer));
        toast({ title: "인증 성공", description: `${data.signer.name}님, 환영합니다.` });
      } else {
        toast({ title: "인증 실패", description: "등록된 서명자 주소가 아닙니다.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "오류", description: error.message || "인증 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAuthenticatedSigner(null);
    sessionStorage.removeItem("signerPortalAuth");
    setSignerAddress("");
    setNotifications(0);
    toast({ title: "로그아웃", description: "안전하게 로그아웃되었습니다." });
  };

  // Step 1: Request email verification code
  const requestVerificationMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: { signerId: string; decision: string; comment: string } }) => {
      const res = await apiRequest("POST", `/api/signer-portal/transactions/${transactionId}/request-verification`, data);
      return res.json();
    },
    onSuccess: (response: any) => {
      setMaskedEmail(response.email);
      setCodeExpiresAt(new Date(Date.now() + (response.expiresIn || 600) * 1000));
      setVerificationCode("");
      setShowConfirmVote(false);
      setShowEmailVerification(true);
      toast({ 
        title: "인증 코드 발송", 
        description: `${response.email}로 인증 코드가 발송되었습니다.`,
      });
    },
    onError: (error: any) => {
      toast({ title: "인증 코드 발송 실패", description: error.message || "이메일 발송에 실패했습니다.", variant: "destructive" });
    },
  });

  // Step 2: Verify code and submit vote
  const verifyAndVoteMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: { signerId: string; verificationCode: string } }) => {
      const res = await apiRequest("POST", `/api/signer-portal/transactions/${transactionId}/verify-and-vote`, data);
      return res.json();
    },
    onSuccess: (response: any) => {
      const status = response?.thresholdStatus;
      toast({ 
        title: "서명 완료", 
        description: response.message || `트랜잭션에 서명했습니다. (${status?.current || 0}/${status?.required || 7} 승인)`,
      });
      refetchTransactions();
      refetchMyVotes();
      setShowVoteDialog(false);
      setShowEmailVerification(false);
      setShowConfirmVote(false);
      setVoteData({ decision: "approve", comment: "" });
      setVerificationCode("");
      setMaskedEmail("");
      setCodeExpiresAt(null);
    },
    onError: (error: any) => {
      // Check if code expired or max attempts
      if (error.message?.includes("만료") || error.message?.includes("초과")) {
        setShowEmailVerification(false);
        toast({ title: "인증 실패", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "인증 실패", description: error.message || "인증 코드가 올바르지 않습니다.", variant: "destructive" });
      }
    },
  });

  // Cancel verification
  const cancelVerificationMutation = useMutation({
    mutationFn: async ({ transactionId, signerId }: { transactionId: string; signerId: string }) => {
      return apiRequest("POST", `/api/signer-portal/transactions/${transactionId}/cancel-verification`, { signerId });
    },
    onSuccess: () => {
      setShowEmailVerification(false);
      setVerificationCode("");
      setMaskedEmail("");
      setCodeExpiresAt(null);
    },
  });

  // Legacy mutation (kept for compatibility but redirects to new flow)
  const voteMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: { signerId: string; decision: string; comment: string } }) => {
      // Redirect to new 2FA flow
      return requestVerificationMutation.mutateAsync({ transactionId, data });
    },
    onSuccess: () => {},
    onError: (error: any) => {
      toast({ title: "서명 실패", description: error.message || "서명을 기록할 수 없습니다.", variant: "destructive" });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
        
        <Card className="w-full max-w-lg relative bg-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 rounded-lg" />
          
          <CardHeader className="text-center relative">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              TBURN Signer Portal
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Foundation Treasury 다중서명 시스템
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-500/10">
                <Lock className="w-3 h-3 mr-1" />
                7/11 Multi-Signature
              </Badge>
              <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10">
                <Database className="w-3 h-3 mr-1" />
                10B TBURN
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 relative">
            <div className="space-y-2">
              <Label htmlFor="signerAddress" className="text-slate-300">지갑 주소 (Bech32m)</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="signerAddress"
                  value={signerAddress}
                  onChange={(e) => setSignerAddress(e.target.value)}
                  placeholder="tb1q..."
                  className="pl-11 font-mono bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-signer-address"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-400">
                  <p className="font-medium text-slate-300 mb-1">보안 인증 안내</p>
                  <ul className="space-y-1 text-xs">
                    <li>- 등록된 서명자 주소로만 인증 가능</li>
                    <li>- 세션은 보안을 위해 1시간 후 만료</li>
                    <li>- 모든 서명 활동은 감사 로그에 기록됨</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative">
            <Button 
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-300" 
              onClick={handleLogin}
              disabled={!signerAddress || isLoggingIn}
              data-testid="button-signer-login"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  인증 중...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 mr-2" />
                  지갑 주소로 인증
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const roleInfo = ROLE_LABELS[authenticatedSigner.role] || { label: authenticatedSigner.role, color: "bg-slate-500" };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  TBURN Signer Portal
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 text-xs">
                    <CircleDot className="w-2 h-2 mr-1 animate-pulse" />
                    {wsConnected ? "Live" : "Offline"}
                  </Badge>
                </h1>
                <p className="text-xs text-slate-400">Foundation Treasury Multi-Signature System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative text-slate-400 hover:text-white hover:bg-slate-700/50"
                    onClick={() => {
                      setNotifications(0);
                      refetchTransactions();
                    }}
                    data-testid="button-notifications"
                  >
                    {notifications > 0 ? (
                      <BellRing className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {notifications > 9 ? "9+" : notifications}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>새 알림</TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <Avatar className="w-9 h-9 border-2 border-cyan-500/50">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-sm">
                    {authenticatedSigner.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="font-medium text-sm text-white">{authenticatedSigner.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    {formatAddress(authenticatedSigner.signerAddress, 12)}
                  </div>
                </div>
                <Badge className={`${roleInfo.color} text-white text-xs border-0`}>
                  {roleInfo.label}
                </Badge>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                data-testid="button-signer-logout"
              >
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">승인 대기</p>
                  <p className="text-3xl font-bold text-white mt-1">{pendingTransactions.length}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {emergencyTransactions.length > 0 && (
                      <span className="text-red-400">{emergencyTransactions.length} 긴급</span>
                    )}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">내 총 서명</p>
                  <p className="text-3xl font-bold text-white mt-1">{authenticatedSigner.totalSignatures || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {authenticatedSigner.lastSignatureAt 
                      ? `최근: ${formatDistanceToNow(new Date(authenticatedSigner.lastSignatureAt), { addSuffix: true, locale: ko })}`
                      : "아직 서명 없음"
                    }
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Fingerprint className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">긴급 승인 권한</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {authenticatedSigner.canApproveEmergency ? (
                      <span className="text-emerald-400">보유</span>
                    ) : (
                      <span className="text-slate-500">없음</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {authenticatedSigner.canApproveEmergency ? "긴급 트랜잭션 승인 가능" : "일반 트랜잭션만 승인 가능"}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  authenticatedSigner.canApproveEmergency 
                    ? "bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/20" 
                    : "bg-slate-700"
                }`}>
                  <ShieldAlert className={`w-7 h-7 ${authenticatedSigner.canApproveEmergency ? "text-white" : "text-slate-500"}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">시스템 상태</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    <span className="text-emerald-400">정상</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    마지막 업데이트: {format(lastUpdate, "HH:mm:ss")}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Activity className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              승인 대기
              {pendingTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-500/20 text-orange-400">
                  {pendingTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="emergency" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              긴급
              {emergencyTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-400">
                  {emergencyTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              내 투표 이력
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    승인 대기 트랜잭션
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    7/11 다중서명 승인이 필요합니다. 승인 기한은 7일입니다.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchTransactions()} 
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-refresh-pending"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  새로고침
                </Button>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-32 w-full bg-slate-700/50" />
                    ))}
                  </div>
                ) : regularTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">승인 대기 중인 트랜잭션이 없습니다</p>
                    <p className="text-sm text-slate-500 mt-2">새 트랜잭션이 생성되면 알림을 받습니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {regularTransactions.map(transaction => (
                      <TransactionCard 
                        key={transaction.transactionId}
                        transaction={transaction}
                        hasVoted={hasVoted(transaction.transactionId)}
                        myVote={getMyVote(transaction.transactionId)}
                        onVote={() => {
                          setSelectedTransaction(transaction);
                          setShowVoteDialog(true);
                        }}
                        onViewDetails={() => {
                          setSelectedTransaction(transaction);
                          setShowTransactionDetail(true);
                        }}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card className="bg-slate-800/50 border-red-900/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  긴급 트랜잭션
                </CardTitle>
                <CardDescription className="text-slate-400">
                  긴급 승인 권한이 있는 서명자만 승인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emergencyTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">긴급 트랜잭션이 없습니다</p>
                    <p className="text-sm text-slate-500 mt-2">시스템이 안정적으로 운영 중입니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emergencyTransactions.map(transaction => (
                      <TransactionCard 
                        key={transaction.transactionId}
                        transaction={transaction}
                        hasVoted={hasVoted(transaction.transactionId)}
                        myVote={getMyVote(transaction.transactionId)}
                        onVote={() => {
                          if (!authenticatedSigner.canApproveEmergency) {
                            toast({ 
                              title: "권한 없음", 
                              description: "긴급 트랜잭션을 승인할 권한이 없습니다.", 
                              variant: "destructive" 
                            });
                            return;
                          }
                          setSelectedTransaction(transaction);
                          setShowVoteDialog(true);
                        }}
                        onViewDetails={() => {
                          setSelectedTransaction(transaction);
                          setShowTransactionDetail(true);
                        }}
                        toast={toast}
                        isEmergency
                        canApproveEmergency={authenticatedSigner.canApproveEmergency}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  내 투표 이력
                </CardTitle>
                <CardDescription className="text-slate-400">
                  이전에 투표한 트랜잭션 목록입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myVotes.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <FileText className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">투표 이력이 없습니다</p>
                    <p className="text-sm text-slate-500 mt-2">트랜잭션에 투표하면 여기에 기록됩니다</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-transparent">
                          <TableHead className="text-slate-400">트랜잭션 ID</TableHead>
                          <TableHead className="text-slate-400">결정</TableHead>
                          <TableHead className="text-slate-400">코멘트</TableHead>
                          <TableHead className="text-slate-400">투표일시</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myVotes.slice(0, 20).map(vote => (
                          <TableRow key={vote.approvalId} className="border-slate-700/50 hover:bg-slate-700/30">
                            <TableCell>
                              <code className="text-xs text-cyan-400 bg-slate-900/50 px-2 py-1 rounded">
                                {vote.transactionId.slice(0, 16)}...
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                vote.approved
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              }>
                                {vote.approved ? (
                                  <><CheckCircle className="w-3 h-3 mr-1" /> 승인</>
                                ) : (
                                  <><XCircle className="w-3 h-3 mr-1" /> 거부</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] text-slate-300">
                              <span className="truncate block">
                                {vote.comments || <span className="text-slate-500">-</span>}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">
                              {vote.approvedAt 
                                ? format(new Date(vote.approvedAt), "yyyy-MM-dd HH:mm", { locale: ko })
                                : "-"
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              트랜잭션 서명
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              이 트랜잭션에 대한 승인 또는 거부를 결정합니다.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">트랜잭션 ID</span>
                  <code className="text-xs text-cyan-400">{selectedTransaction.transactionId.slice(0, 20)}...</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">금액</span>
                  <span className="font-bold text-white">{formatTburnAmount(selectedTransaction.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">수신자</span>
                  <code className="text-xs text-slate-300">{formatAddress(selectedTransaction.recipientAddress)}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">목적</span>
                  <span className="text-sm text-slate-300">{selectedTransaction.purpose}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">현재 승인</span>
                  <span className="text-sm text-white">{selectedTransaction.approvalCount}/{selectedTransaction.requiredApprovals}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-300">결정</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={voteData.decision === "approve" ? "default" : "outline"}
                    className={
                      voteData.decision === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }
                    onClick={() => setVoteData(prev => ({ ...prev, decision: "approve" }))}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    승인
                  </Button>
                  <Button
                    type="button"
                    variant={voteData.decision === "reject" ? "default" : "outline"}
                    className={
                      voteData.decision === "reject"
                        ? "bg-red-600 hover:bg-red-500 border-red-500"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }
                    onClick={() => setVoteData(prev => ({ ...prev, decision: "reject" }))}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거부
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">코멘트 (선택)</Label>
                <Textarea
                  value={voteData.comment}
                  onChange={(e) => setVoteData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="투표 사유를 입력하세요..."
                  className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>

              {selectedTransaction.isEmergency && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-300">
                    <p className="font-medium">긴급 트랜잭션 경고</p>
                    <p className="text-red-400/80 text-xs mt-1">
                      이 트랜잭션은 긴급 승인이 필요합니다. 신중하게 검토하세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowVoteDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              취소
            </Button>
            <Button
              onClick={() => setShowConfirmVote(true)}
              disabled={voteMutation.isPending}
              className={
                voteData.decision === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-600 hover:bg-red-500"
              }
            >
              {voteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Fingerprint className="w-4 h-4 mr-2" />
              )}
              서명하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmVote} onOpenChange={setShowConfirmVote}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              서명 확인 (1/2단계)
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              트랜잭션에 {voteData.decision === "approve" ? "승인" : "거부"} 서명을 하시겠습니까?
              <br />
              <span className="text-cyan-400 text-sm mt-2 block">
                확인을 누르면 등록된 이메일로 인증 코드가 발송됩니다.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedTransaction || !authenticatedSigner) return;
                requestVerificationMutation.mutate({
                  transactionId: selectedTransaction.transactionId,
                  data: {
                    signerId: authenticatedSigner.signerId,
                    decision: voteData.decision,
                    comment: voteData.comment,
                  },
                });
              }}
              disabled={requestVerificationMutation.isPending}
              className={
                voteData.decision === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-600 hover:bg-red-500"
              }
            >
              {requestVerificationMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              인증 코드 발송
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEmailVerification} onOpenChange={(open) => {
        if (!open && selectedTransaction && authenticatedSigner) {
          cancelVerificationMutation.mutate({
            transactionId: selectedTransaction.transactionId,
            signerId: authenticatedSigner.signerId,
          });
        }
        setShowEmailVerification(open);
      }}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              이메일 인증 (2/2단계)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {maskedEmail}로 발송된 6자리 인증 코드를 입력하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                  <Key className="w-8 h-8 text-cyan-400" />
                </div>
                
                <div>
                  <Label htmlFor="verificationCode" className="text-slate-300 text-sm">인증 코드</Label>
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="mt-2 text-center text-2xl font-mono tracking-[0.5em] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-verification-code"
                    autoFocus
                  />
                </div>

                {codeExpiresAt && (
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Timer className="w-3 h-3" />
                    코드 유효 시간: {Math.max(0, Math.floor((codeExpiresAt.getTime() - Date.now()) / 60000))}분
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-300">
                <p className="font-medium">보안 알림</p>
                <ul className="text-amber-400/80 text-xs mt-1 space-y-1">
                  <li>- 인증 코드는 10분 후 만료됩니다</li>
                  <li>- 5회 오입력 시 새 코드를 요청해야 합니다</li>
                  <li>- 이 코드를 다른 사람과 공유하지 마세요</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedTransaction && authenticatedSigner) {
                  cancelVerificationMutation.mutate({
                    transactionId: selectedTransaction.transactionId,
                    signerId: authenticatedSigner.signerId,
                  });
                }
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              취소
            </Button>
            <Button
              onClick={() => {
                if (!selectedTransaction || !authenticatedSigner || verificationCode.length !== 6) return;
                verifyAndVoteMutation.mutate({
                  transactionId: selectedTransaction.transactionId,
                  data: {
                    signerId: authenticatedSigner.signerId,
                    verificationCode,
                  },
                });
              }}
              disabled={verificationCode.length !== 6 || verifyAndVoteMutation.isPending}
              className={
                voteData.decision === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-600 hover:bg-red-500"
              }
            >
              {verifyAndVoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              {voteData.decision === "approve" ? "최종 승인" : "최종 거부"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransactionDetail} onOpenChange={setShowTransactionDetail}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              트랜잭션 상세 정보
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-500 mb-1">트랜잭션 ID</p>
                  <p className="font-mono text-sm text-cyan-400 break-all">{selectedTransaction.transactionId}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-500 mb-1">유형</p>
                  <p className="text-sm text-white">
                    {TRANSACTION_TYPES[selectedTransaction.transactionType]?.label || selectedTransaction.transactionType}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">금액</p>
                    <p className="text-xl font-bold text-white">{formatTburnAmount(selectedTransaction.amount)}</p>
                    {selectedTransaction.amountUsd && (
                      <p className="text-sm text-slate-400">${selectedTransaction.amountUsd}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">승인 현황</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(selectedTransaction.approvalCount / selectedTransaction.requiredApprovals) * 100}
                        className="h-2 flex-1"
                      />
                      <span className="text-white font-medium">
                        {selectedTransaction.approvalCount}/{selectedTransaction.requiredApprovals}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <p className="text-xs text-slate-500 mb-1">수신자 주소</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-slate-300 font-mono break-all">{selectedTransaction.recipientAddress}</code>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-white"
                      onClick={() => copyToClipboard(selectedTransaction.recipientAddress, toast)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {selectedTransaction.recipientName && (
                    <p className="text-sm text-slate-400 mt-1">{selectedTransaction.recipientName}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">목적</p>
                  <p className="text-sm text-white">{selectedTransaction.purpose}</p>
                </div>

                {selectedTransaction.justification && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">정당성</p>
                    <p className="text-sm text-slate-300">{selectedTransaction.justification}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-3">
                <p className="text-sm font-medium text-white">타임라인</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">제안일시</span>
                    <span className="text-slate-300">
                      {format(new Date(selectedTransaction.proposedAt), "yyyy-MM-dd HH:mm:ss", { locale: ko })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">제안자</span>
                    <span className="text-slate-300">{selectedTransaction.proposedBy}</span>
                  </div>
                  {selectedTransaction.approvalExpiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">승인 기한</span>
                      <span className={getTimeRemainingColor(
                        differenceInHours(new Date(selectedTransaction.approvalExpiresAt), new Date())
                      )}>
                        {format(new Date(selectedTransaction.approvalExpiresAt), "yyyy-MM-dd HH:mm", { locale: ko })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTransaction.documentationUrl && (
                <a 
                  href={selectedTransaction.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  관련 문서 보기
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowTransactionDetail(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}

interface TransactionCardProps {
  transaction: CustodyTransaction;
  hasVoted: boolean;
  myVote?: TransactionApproval;
  onVote: () => void;
  onViewDetails: () => void;
  toast: any;
  isEmergency?: boolean;
  canApproveEmergency?: boolean;
}

function TransactionCard({ 
  transaction, 
  hasVoted, 
  myVote, 
  onVote, 
  onViewDetails, 
  toast,
  isEmergency,
  canApproveEmergency 
}: TransactionCardProps) {
  const txType = TRANSACTION_TYPES[transaction.transactionType];
  const TypeIcon = txType?.icon || FileText;
  const hoursRemaining = transaction.approvalExpiresAt 
    ? differenceInHours(new Date(transaction.approvalExpiresAt), new Date())
    : 168;

  return (
    <Card className={`
      bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden
      ${isEmergency ? "border-red-500/30" : hasVoted ? "border-slate-700/30" : "border-cyan-500/30"}
      transition-all duration-300 hover:border-cyan-500/50
    `}>
      {isEmergency && (
        <div className="bg-gradient-to-r from-red-500/20 to-transparent px-4 py-2 border-b border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
            <Zap className="w-4 h-4" />
            긴급 트랜잭션
          </div>
        </div>
      )}

      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${txType?.color || "text-slate-400"} bg-slate-800`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-cyan-400 bg-slate-800 px-2 py-1 rounded font-mono">
                    {transaction.transactionId.slice(0, 16)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-500 hover:text-white"
                    onClick={() => copyToClipboard(transaction.transactionId, toast)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  {hasVoted && (
                    <Badge className={
                      myVote?.approved
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }>
                      {myVote?.approved ? "승인함" : "거부함"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {txType?.label} • {txType?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">금액</p>
                <p className="font-bold text-white">{formatTburnAmount(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">수신자</p>
                <p className="font-mono text-xs text-slate-300">{formatAddress(transaction.recipientAddress, 12)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">목적</p>
                <p className="text-slate-300 truncate">{transaction.purpose}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">제안일시</p>
                <p className="text-slate-400">{formatDistanceToNow(new Date(transaction.proposedAt), { addSuffix: true, locale: ko })}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">승인:</span>
                <Progress 
                  value={(transaction.approvalCount / transaction.requiredApprovals) * 100} 
                  className="w-24 h-2"
                />
                <span className="font-medium text-white">{transaction.approvalCount}/{transaction.requiredApprovals}</span>
              </div>
              <div className={`flex items-center gap-1 ${getTimeRemainingColor(hoursRemaining)}`}>
                <Timer className="w-3 h-3" />
                <span>{hoursRemaining > 0 ? `${hoursRemaining}시간 남음` : "만료됨"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!hasVoted ? (
              <Button
                onClick={onVote}
                disabled={isEmergency && !canApproveEmergency}
                className={
                  isEmergency
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                }
                data-testid={`button-vote-${transaction.transactionId}`}
              >
                <Fingerprint className="w-4 h-4 mr-1" />
                서명하기
              </Button>
            ) : (
              <Button variant="outline" disabled className="border-emerald-500/30 text-emerald-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                서명 완료
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="text-slate-400 hover:text-white"
            >
              <Eye className="w-3 h-3 mr-1" />
              상세보기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
