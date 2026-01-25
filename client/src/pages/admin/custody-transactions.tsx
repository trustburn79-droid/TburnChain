import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  RefreshCw,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Send,
  FileText,
  Users,
  ArrowRight,
  ArrowUpRight,
  Timer,
  AlertTriangle,
  AlertOctagon,
  Ban,
  Play,
  History,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  TrendingUp,
  DollarSign,
  Eye,
  Lock,
  LockOpen,
  Zap,
  Activity,
  Bell,
  BellRing,
  MoreHorizontal,
  Building2,
  Boxes,
  Fingerprint,
  CircleDot,
  Database,
  PiggyBank,
  Receipt,
  Target,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format, differenceInHours, differenceInMinutes, addDays } from "date-fns";
import { ko } from "date-fns/locale";

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
  executedTxHash: string | null;
  executedAt: string | null;
  executedBy: string | null;
  proposedAt: string;
  proposedBy: string;
  timelockExpiresAt: string | null;
  approvalExpiresAt: string | null;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TransactionApproval {
  id: number;
  approvalId: string;
  transactionId: string;
  signerId: string;
  approved: boolean;
  signature: string | null;
  comments: string | null;
  approvedAt: string;
}

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
}

interface CustodyWallet {
  id: number;
  walletId: string;
  name: string;
  address: string;
  signaturesRequired: number;
  totalSigners: number;
  timelockHours: number;
  allocatedAmount: string;
  remainingAmount: string;
  distributedAmount: string;
  status: string;
}

const TRANSACTION_TYPES: Record<string, { label: string; description: string; icon: any; color: string }> = {
  grant_disbursement: { label: "Grant Disbursement", description: "보조금 지급", icon: Building2, color: "text-blue-400" },
  marketing_spend: { label: "Marketing Spend", description: "마케팅 비용", icon: TrendingUp, color: "text-purple-400" },
  partnership_payment: { label: "Partnership Payment", description: "파트너십 지급", icon: Users, color: "text-green-400" },
  emergency_transfer: { label: "Emergency Transfer", description: "긴급 이체", icon: Zap, color: "text-red-400" },
  dao_execution: { label: "DAO Execution", description: "DAO 실행", icon: Boxes, color: "text-orange-400" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending_approval: { label: "승인 대기", color: "text-orange-400", bgColor: "bg-orange-500/20", icon: Clock },
  approved: { label: "승인됨", color: "text-emerald-400", bgColor: "bg-emerald-500/20", icon: CheckCircle },
  executed: { label: "실행 완료", color: "text-cyan-400", bgColor: "bg-cyan-500/20", icon: Send },
  rejected: { label: "거부됨", color: "text-red-400", bgColor: "bg-red-500/20", icon: XCircle },
  cancelled: { label: "취소됨", color: "text-slate-400", bgColor: "bg-slate-500/20", icon: Ban },
  expired: { label: "만료됨", color: "text-slate-500", bgColor: "bg-slate-600/20", icon: Timer },
};

function formatTburnAmount(amount: string): string {
  try {
    const value = BigInt(amount);
    const tburn = Number(value) / 1e18;
    if (tburn >= 1_000_000_000) return `${(tburn / 1_000_000_000).toFixed(2)}B`;
    if (tburn >= 1_000_000) return `${(tburn / 1_000_000).toFixed(2)}M`;
    if (tburn >= 1_000) return `${(tburn / 1_000).toFixed(2)}K`;
    return tburn.toFixed(4);
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

function getTimeRemainingColor(hours: number): string {
  if (hours < 24) return "text-red-400";
  if (hours < 72) return "text-orange-400";
  return "text-slate-400";
}

export default function CustodyTransactionsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CustodyTransaction | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [newTransaction, setNewTransaction] = useState({
    walletId: "foundation-custody-main",
    transactionType: "grant_disbursement",
    recipientAddress: "",
    recipientName: "",
    amount: "",
    amountUsd: "",
    purpose: "",
    justification: "",
    documentationUrl: "",
    isEmergency: false,
  });

  const [approvalData, setApprovalData] = useState({
    signerId: "",
    decision: "approve" as "approve" | "reject",
    comment: "",
  });

  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channel: "custody-admin" }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "custody-update" || data.type === "new-transaction" || data.type === "transaction-approved") {
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
  }, []);

  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<{ transactions: CustodyTransaction[] }>({
    queryKey: ["/api/custody-admin/transactions"],
    refetchInterval: 30000,
  });

  const { data: signersData } = useQuery<{ signers: Signer[] }>({
    queryKey: ["/api/custody-admin/signers"],
  });

  const { data: walletsData } = useQuery<{ wallets: CustodyWallet[] }>({
    queryKey: ["/api/custody-admin/wallets"],
  });

  const { data: statsData } = useQuery<{ stats: any }>({
    queryKey: ["/api/custody-admin/stats"],
  });

  const transactions: CustodyTransaction[] = transactionsData?.transactions || [];
  const signers: Signer[] = signersData?.signers || [];
  const wallets: CustodyWallet[] = walletsData?.wallets || [];
  const foundationWallet = wallets.find(w => w.walletId === "foundation-custody-main");

  const pendingTransactions = transactions.filter(t => t.status === "pending_approval");
  const approvedTransactions = transactions.filter(t => t.status === "approved");
  const executedTransactions = transactions.filter(t => t.status === "executed");
  const otherTransactions = transactions.filter(t => ["rejected", "cancelled", "expired"].includes(t.status));
  const emergencyTransactions = pendingTransactions.filter(t => t.isEmergency);

  const totalPendingAmount = pendingTransactions.reduce((sum, t) => {
    try { return sum + Number(BigInt(t.amount)) / 1e18; } catch { return sum; }
  }, 0);

  const createMutation = useMutation({
    mutationFn: async (data: typeof newTransaction) => {
      const amountInWei = (BigInt(Math.floor(parseFloat(data.amount) * 1e18))).toString();
      return apiRequest("POST", "/api/custody-admin/transactions", {
        ...data,
        amount: amountInWei,
      });
    },
    onSuccess: () => {
      toast({ title: "트랜잭션 생성됨", description: "새 트랜잭션이 승인 대기 상태로 생성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
      setShowCreateDialog(false);
      setNewTransaction({
        walletId: "foundation-custody-main",
        transactionType: "grant_disbursement",
        recipientAddress: "",
        recipientName: "",
        amount: "",
        amountUsd: "",
        purpose: "",
        justification: "",
        documentationUrl: "",
        isEmergency: false,
      });
    },
    onError: (error: any) => {
      toast({ title: "생성 실패", description: error.message || "트랜잭션을 생성할 수 없습니다.", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: typeof approvalData }) => {
      return apiRequest("POST", `/api/custody-admin/transactions/${transactionId}/approve`, data);
    },
    onSuccess: (response: any) => {
      const status = response?.thresholdStatus;
      toast({ 
        title: "투표 완료", 
        description: `서명이 기록되었습니다. (${status?.current || 0}/${status?.required || 7} 승인)` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
      setShowApproveDialog(false);
      setApprovalData({ signerId: "", decision: "approve", comment: "" });
    },
    onError: (error: any) => {
      toast({ title: "투표 실패", description: error.message || "서명을 기록할 수 없습니다.", variant: "destructive" });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return apiRequest("POST", `/api/custody-admin/transactions/${transactionId}/execute`, {});
    },
    onSuccess: (response: any) => {
      toast({ 
        title: "트랜잭션 실행됨", 
        description: `트랜잭션이 블록체인에 전송되었습니다.` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/wallets"] });
      setShowExecuteDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "실행 실패", description: error.message || "트랜잭션을 실행할 수 없습니다.", variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: string; reason: string }) => {
      return apiRequest("POST", `/api/custody-admin/transactions/${transactionId}/cancel`, { reason });
    },
    onSuccess: () => {
      toast({ title: "트랜잭션 취소됨", description: "트랜잭션이 취소되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
      setShowCancelDialog(false);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast({ title: "취소 실패", description: error.message || "트랜잭션을 취소할 수 없습니다.", variant: "destructive" });
    },
  });

  const expireMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/custody-admin/transactions/expire-pending", {});
    },
    onSuccess: (response: any) => {
      const count = response?.expiredCount || 0;
      toast({ 
        title: "만료 처리 완료", 
        description: count > 0 ? `${count}개 트랜잭션이 만료 처리되었습니다.` : "만료 대상 트랜잭션이 없습니다." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
    },
    onError: (error: any) => {
      toast({ title: "처리 실패", description: error.message || "만료 처리에 실패했습니다.", variant: "destructive" });
    },
  });

  if (transactionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-700/50" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 bg-slate-700/50" />)}
          </div>
          <Skeleton className="h-96 bg-slate-700/50" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Foundation Treasury Management
                <Badge variant="outline" className={`${wsConnected ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-slate-500/50 text-slate-400 bg-slate-500/10"} text-xs`}>
                  <CircleDot className={`w-2 h-2 mr-1 ${wsConnected ? "animate-pulse" : ""}`} />
                  {wsConnected ? "Live" : "Offline"}
                </Badge>
              </h1>
              <p className="text-slate-400">7/11 Multi-Signature Custody System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => expireMutation.mutate()}
                  disabled={expireMutation.isPending}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-expire-pending"
                >
                  {expireMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Timer className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>만료 트랜잭션 처리</TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchTransactions()}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              data-testid="button-refresh-transactions"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              새로고침
            </Button>

            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
              data-testid="button-create-transaction"
            >
              <Plus className="w-4 h-4 mr-1" />
              새 트랜잭션
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">승인됨</p>
                  <p className="text-3xl font-bold text-white mt-1">{approvedTransactions.length}</p>
                  <p className="text-xs text-slate-500 mt-1">실행 대기 중</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">실행 완료</p>
                  <p className="text-3xl font-bold text-white mt-1">{executedTransactions.length}</p>
                  <p className="text-xs text-slate-500 mt-1">전체 기록</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">대기 금액</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatTburnAmount((totalPendingAmount * 1e18).toString())}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">TBURN</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">지갑 잔액</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {foundationWallet ? formatTburnAmount(foundationWallet.remainingAmount) : "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">TBURN</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white" data-testid="tab-pending">
              <Clock className="w-4 h-4 mr-2" />
              승인 대기
              {pendingTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-500/20 text-orange-400">
                  {pendingTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white" data-testid="tab-approved">
              <CheckCircle className="w-4 h-4 mr-2" />
              승인됨
              {approvedTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-emerald-500/20 text-emerald-400">
                  {approvedTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="executed" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white" data-testid="tab-executed">
              <Send className="w-4 h-4 mr-2" />
              실행 완료
            </TabsTrigger>
            <TabsTrigger value="other" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white" data-testid="tab-other">
              <History className="w-4 h-4 mr-2" />
              기타
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  승인 대기 트랜잭션
                </CardTitle>
                <CardDescription className="text-slate-400">
                  7/11 다중서명 승인이 필요합니다. 승인 기한은 7일입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">승인 대기 중인 트랜잭션이 없습니다</p>
                    <p className="text-sm text-slate-500 mt-2">새 트랜잭션을 생성하려면 위 버튼을 클릭하세요</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTransactions.map(tx => (
                      <TransactionCard
                        key={tx.transactionId}
                        transaction={tx}
                        signers={signers}
                        onApprove={() => {
                          setSelectedTransaction(tx);
                          setShowApproveDialog(true);
                        }}
                        onCancel={() => {
                          setSelectedTransaction(tx);
                          setShowCancelDialog(true);
                        }}
                        onViewDetails={() => {
                          setSelectedTransaction(tx);
                          setShowDetailDialog(true);
                        }}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  승인된 트랜잭션
                </CardTitle>
                <CardDescription className="text-slate-400">
                  타임락 해제 후 실행할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <Timer className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">승인된 트랜잭션이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedTransactions.map(tx => (
                      <TransactionCard
                        key={tx.transactionId}
                        transaction={tx}
                        signers={signers}
                        onExecute={() => {
                          setSelectedTransaction(tx);
                          setShowExecuteDialog(true);
                        }}
                        onViewDetails={() => {
                          setSelectedTransaction(tx);
                          setShowDetailDialog(true);
                        }}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="executed">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-cyan-400" />
                  실행 완료 트랜잭션
                </CardTitle>
                <CardDescription className="text-slate-400">
                  블록체인에 기록된 완료된 트랜잭션입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {executedTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <FileText className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">실행된 트랜잭션이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {executedTransactions.slice(0, 20).map(tx => (
                      <TransactionCard
                        key={tx.transactionId}
                        transaction={tx}
                        signers={signers}
                        onViewDetails={() => {
                          setSelectedTransaction(tx);
                          setShowDetailDialog(true);
                        }}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  기타 트랜잭션
                </CardTitle>
                <CardDescription className="text-slate-400">
                  거부, 취소, 만료된 트랜잭션입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {otherTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <Ban className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">기타 트랜잭션이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {otherTransactions.map(tx => (
                      <TransactionCard
                        key={tx.transactionId}
                        transaction={tx}
                        signers={signers}
                        onViewDetails={() => {
                          setSelectedTransaction(tx);
                          setShowDetailDialog(true);
                        }}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-slate-500 text-center">
          마지막 업데이트: {format(lastUpdate, "yyyy-MM-dd HH:mm:ss")}
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              새 트랜잭션 생성
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              재단 자산 지출을 위한 새 트랜잭션을 생성합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">트랜잭션 유형</Label>
                <Select
                  value={newTransaction.transactionType}
                  onValueChange={(v) => setNewTransaction(prev => ({ ...prev, transactionType: v }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(TRANSACTION_TYPES).map(([key, val]) => (
                      <SelectItem key={key} value={key} className="text-slate-100">
                        {val.label} ({val.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">금액 (TBURN)</Label>
                <Input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="1000000"
                  className="bg-slate-900/50 border-slate-600 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">수신자 주소</Label>
              <Input
                value={newTransaction.recipientAddress}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, recipientAddress: e.target.value }))}
                placeholder="tb1..."
                className="font-mono bg-slate-900/50 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">수신자 이름 (선택)</Label>
              <Input
                value={newTransaction.recipientName}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, recipientName: e.target.value }))}
                placeholder="수신자 이름 또는 조직명"
                className="bg-slate-900/50 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">목적</Label>
              <Input
                value={newTransaction.purpose}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="지출 목적을 입력하세요"
                className="bg-slate-900/50 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">정당성 (선택)</Label>
              <Textarea
                value={newTransaction.justification}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, justification: e.target.value }))}
                placeholder="지출의 정당성을 설명하세요"
                className="bg-slate-900/50 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">관련 문서 URL (선택)</Label>
              <Input
                value={newTransaction.documentationUrl}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, documentationUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-slate-900/50 border-slate-600 text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEmergency"
                checked={newTransaction.isEmergency}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, isEmergency: e.target.checked }))}
                className="rounded border-slate-600"
              />
              <Label htmlFor="isEmergency" className="text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" />
                긴급 트랜잭션
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              취소
            </Button>
            <Button
              onClick={() => createMutation.mutate(newTransaction)}
              disabled={createMutation.isPending || !newTransaction.recipientAddress || !newTransaction.amount || !newTransaction.purpose}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              트랜잭션 투표
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              이 트랜잭션에 대한 승인 또는 거부를 결정합니다.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">금액:</span>
                  <span className="text-white font-bold">{formatTburnAmount(selectedTransaction.amount)} TBURN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">수신자:</span>
                  <code className="text-slate-300 text-xs">{formatAddress(selectedTransaction.recipientAddress)}</code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">현재 승인:</span>
                  <span className="text-white">{selectedTransaction.approvalCount}/{selectedTransaction.requiredApprovals}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">서명자 선택</Label>
                <Select value={approvalData.signerId} onValueChange={(v) => setApprovalData(prev => ({ ...prev, signerId: v }))}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-100">
                    <SelectValue placeholder="서명자 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {signers.filter(s => s.isActive).map(signer => (
                      <SelectItem key={signer.signerId} value={signer.signerId} className="text-slate-100">
                        {signer.name} ({signer.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">결정</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={approvalData.decision === "approve" ? "default" : "outline"}
                    className={approvalData.decision === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                    onClick={() => setApprovalData(prev => ({ ...prev, decision: "approve" }))}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    승인
                  </Button>
                  <Button
                    type="button"
                    variant={approvalData.decision === "reject" ? "default" : "outline"}
                    className={approvalData.decision === "reject" ? "bg-red-600 hover:bg-red-500" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                    onClick={() => setApprovalData(prev => ({ ...prev, decision: "reject" }))}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거부
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">코멘트 (선택)</Label>
                <Textarea
                  value={approvalData.comment}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="투표 사유를 입력하세요"
                  className="bg-slate-900/50 border-slate-600 text-slate-100"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              취소
            </Button>
            <Button
              onClick={() => {
                if (!selectedTransaction || !approvalData.signerId) return;
                approveMutation.mutate({
                  transactionId: selectedTransaction.transactionId,
                  data: approvalData,
                });
              }}
              disabled={approveMutation.isPending || !approvalData.signerId}
              className={approvalData.decision === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}
            >
              {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Fingerprint className="w-4 h-4 mr-2" />}
              서명
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-cyan-400" />
              트랜잭션 실행
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              이 트랜잭션을 블록체인에 전송합니다. 이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedTransaction && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-2 my-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">금액:</span>
                <span className="text-white font-bold">{formatTburnAmount(selectedTransaction.amount)} TBURN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">수신자:</span>
                <code className="text-slate-300 text-xs">{formatAddress(selectedTransaction.recipientAddress)}</code>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedTransaction) return;
                executeMutation.mutate(selectedTransaction.transactionId);
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            >
              {executeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              실행
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              트랜잭션 취소
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              이 트랜잭션을 취소합니다. 이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 my-4">
            <Label className="text-slate-300">취소 사유</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="취소 사유를 입력하세요"
              className="bg-slate-900/50 border-slate-600 text-slate-100"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">뒤로</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedTransaction) return;
                cancelMutation.mutate({
                  transactionId: selectedTransaction.transactionId,
                  reason: cancelReason,
                });
              }}
              className="bg-red-600 hover:bg-red-500"
            >
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
              취소하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              트랜잭션 상세 정보
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <TransactionDetailView transaction={selectedTransaction} signers={signers} toast={toast} />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
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
  signers: Signer[];
  onApprove?: () => void;
  onExecute?: () => void;
  onCancel?: () => void;
  onViewDetails: () => void;
  toast: any;
}

function TransactionCard({ transaction, signers, onApprove, onExecute, onCancel, onViewDetails, toast }: TransactionCardProps) {
  const txType = TRANSACTION_TYPES[transaction.transactionType] || TRANSACTION_TYPES.grant_disbursement;
  const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending_approval;
  const TypeIcon = txType.icon;
  const StatusIcon = statusConfig.icon;

  const hoursRemaining = transaction.approvalExpiresAt 
    ? differenceInHours(new Date(transaction.approvalExpiresAt), new Date())
    : 168;

  const timelockRemaining = transaction.timelockExpiresAt 
    ? differenceInHours(new Date(transaction.timelockExpiresAt), new Date())
    : 0;
  
  const canExecute = transaction.status === "approved" && timelockRemaining <= 0;

  return (
    <Card className={`
      bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden
      ${transaction.isEmergency ? "border-red-500/30" : "border-slate-700/30"}
      transition-all duration-300 hover:border-cyan-500/50
    `}>
      {transaction.isEmergency && (
        <div className="bg-gradient-to-r from-red-500/20 to-transparent px-4 py-2 border-b border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
            <Zap className="w-4 h-4" />
            긴급 트랜잭션
          </div>
        </div>
      )}

      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${txType.color} bg-slate-800`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-cyan-400 bg-slate-800 px-2 py-1 rounded font-mono">
                    {transaction.transactionId.slice(0, 12)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(transaction.transactionId, toast);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {txType.label} • {txType.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">금액</p>
                <p className="font-bold text-white">{formatTburnAmount(transaction.amount)} TBURN</p>
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

            {transaction.status === "pending_approval" && (
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
            )}

            {transaction.status === "approved" && (
              <div className="flex items-center gap-2 text-sm">
                {canExecute ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <LockOpen className="w-3 h-3 mr-1" />
                    타임락 해제됨 - 실행 가능
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Lock className="w-3 h-3 mr-1" />
                    타임락 대기 중 - {timelockRemaining}시간 남음
                  </Badge>
                )}
              </div>
            )}

            {transaction.executedTxHash && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">TxHash:</span>
                <code className="text-xs text-cyan-400">{transaction.executedTxHash.slice(0, 16)}...</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-slate-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(transaction.executedTxHash!, toast);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {transaction.status === "pending_approval" && onApprove && (
              <>
                <Button
                  onClick={onApprove}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                  data-testid={`button-approve-${transaction.transactionId}`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  투표
                </Button>
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    data-testid={`button-cancel-${transaction.transactionId}`}
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    취소
                  </Button>
                )}
              </>
            )}

            {transaction.status === "approved" && onExecute && (
              <Button
                onClick={onExecute}
                size="sm"
                disabled={!canExecute}
                className={canExecute ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500" : ""}
                data-testid={`button-execute-${transaction.transactionId}`}
              >
                {canExecute ? (
                  <><Play className="w-4 h-4 mr-1" /> 실행</>
                ) : (
                  <><Timer className="w-4 h-4 mr-1" /> 대기</>
                )}
              </Button>
            )}

            <Button
              onClick={onViewDetails}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              상세
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TransactionDetailViewProps {
  transaction: CustodyTransaction;
  signers: Signer[];
  toast: any;
}

function TransactionDetailView({ transaction, signers, toast }: TransactionDetailViewProps) {
  const { data: detailsData } = useQuery({
    queryKey: ["/api/custody-admin/transactions", transaction.transactionId],
    queryFn: async () => {
      const res = await fetch(`/api/custody-admin/transactions/${transaction.transactionId}`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  const approvals: TransactionApproval[] = detailsData?.approvals || [];
  const txType = TRANSACTION_TYPES[transaction.transactionType];
  const statusConfig = STATUS_CONFIG[transaction.status];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">트랜잭션 ID</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm text-cyan-400 break-all">{transaction.transactionId}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-500 hover:text-white flex-shrink-0"
              onClick={() => copyToClipboard(transaction.transactionId, toast)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">상태</p>
          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">금액</p>
            <p className="text-xl font-bold text-white">{formatTburnAmount(transaction.amount)} TBURN</p>
            {transaction.amountUsd && (
              <p className="text-sm text-slate-400">${transaction.amountUsd} USD</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">유형</p>
            <p className="text-sm text-white">{txType?.label}</p>
            <p className="text-xs text-slate-400">{txType?.description}</p>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        <div>
          <p className="text-xs text-slate-500 mb-1">수신자 주소</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-slate-300 font-mono break-all">{transaction.recipientAddress}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-500 hover:text-white flex-shrink-0"
              onClick={() => copyToClipboard(transaction.recipientAddress, toast)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          {transaction.recipientName && (
            <p className="text-sm text-slate-400 mt-1">{transaction.recipientName}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">목적</p>
          <p className="text-sm text-white">{transaction.purpose}</p>
        </div>

        {transaction.justification && (
          <div>
            <p className="text-xs text-slate-500 mb-1">정당성</p>
            <p className="text-sm text-slate-300">{transaction.justification}</p>
          </div>
        )}

        {transaction.documentationUrl && (
          <div>
            <p className="text-xs text-slate-500 mb-1">관련 문서</p>
            <a
              href={transaction.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 flex items-center gap-1 hover:underline"
            >
              문서 보기 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-3">
        <p className="text-sm font-medium text-white">타임라인</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">제안일시</span>
            <span className="text-slate-300">{format(new Date(transaction.proposedAt), "yyyy-MM-dd HH:mm:ss", { locale: ko })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">제안자</span>
            <span className="text-slate-300">{transaction.proposedBy}</span>
          </div>
          {transaction.approvalExpiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">승인 기한</span>
              <span className="text-slate-300">{format(new Date(transaction.approvalExpiresAt), "yyyy-MM-dd HH:mm", { locale: ko })}</span>
            </div>
          )}
          {transaction.timelockExpiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">타임락 해제</span>
              <span className="text-slate-300">{format(new Date(transaction.timelockExpiresAt), "yyyy-MM-dd HH:mm", { locale: ko })}</span>
            </div>
          )}
          {transaction.executedAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">실행일시</span>
              <span className="text-slate-300">{format(new Date(transaction.executedAt), "yyyy-MM-dd HH:mm:ss", { locale: ko })}</span>
            </div>
          )}
          {transaction.executedTxHash && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">TxHash</span>
              <div className="flex items-center gap-1">
                <code className="text-xs text-cyan-400">{transaction.executedTxHash.slice(0, 20)}...</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-slate-500 hover:text-white"
                  onClick={() => copyToClipboard(transaction.executedTxHash!, toast)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
        <p className="text-sm font-medium text-white mb-3">승인 현황 ({approvals.length}명 투표)</p>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {approvals.map((approval) => {
              const signer = signers.find(s => s.signerId === approval.signerId);
              return (
                <div key={approval.approvalId} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`text-xs ${approval.approved ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {signer?.name?.slice(0, 2) || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-white">{signer?.name || approval.signerId}</p>
                      <p className="text-xs text-slate-400">
                        {approval.approvedAt ? formatDistanceToNow(new Date(approval.approvedAt), { addSuffix: true, locale: ko }) : "-"}
                      </p>
                    </div>
                  </div>
                  <Badge className={approval.approved ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                    {approval.approved ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> 승인</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> 거부</>
                    )}
                  </Badge>
                </div>
              );
            })}
            {approvals.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                아직 투표가 없습니다
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
