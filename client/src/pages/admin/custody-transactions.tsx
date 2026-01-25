import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  XCircle,
  Loader2,
  Clock,
  Send,
  FileText,
  Users,
  ArrowRight,
  Timer,
  AlertTriangle,
  Ban,
  Play,
  History,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Shield,
  Wallet,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format, differenceInHours, differenceInMinutes } from "date-fns";
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
  decision: string;
  signature: string | null;
  comment: string | null;
  decidedAt: string;
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

const TRANSACTION_TYPES = [
  { value: "grant_disbursement", label: "Grant Disbursement", description: "보조금 지급" },
  { value: "marketing_spend", label: "Marketing Spend", description: "마케팅 비용" },
  { value: "partnership_payment", label: "Partnership Payment", description: "파트너십 지급" },
  { value: "emergency_transfer", label: "Emergency Transfer", description: "긴급 이체" },
  { value: "dao_execution", label: "DAO Execution", description: "DAO 실행" },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pending_approval: { label: "승인 대기", variant: "secondary", icon: Clock },
  approved: { label: "승인됨", variant: "default", icon: CheckCircle },
  executed: { label: "실행 완료", variant: "default", icon: Send },
  rejected: { label: "거부됨", variant: "destructive", icon: XCircle },
  cancelled: { label: "취소됨", variant: "outline", icon: Ban },
  expired: { label: "만료됨", variant: "outline", icon: Timer },
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
  if (address.length <= 16) return address;
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

function copyToClipboard(text: string, toast: any) {
  navigator.clipboard.writeText(text);
  toast({ title: "복사됨", description: "클립보드에 복사되었습니다." });
}

export default function CustodyTransactionsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CustodyTransaction | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
  });

  const [approvalData, setApprovalData] = useState({
    signerId: "",
    decision: "approve" as "approve" | "reject" | "abstain",
    comment: "",
  });

  const [cancelReason, setCancelReason] = useState("");

  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<{ transactions: CustodyTransaction[] }>({
    queryKey: ["/api/custody-admin/transactions"],
  });

  const { data: signersData } = useQuery<{ signers: Signer[] }>({
    queryKey: ["/api/custody-admin/signers", { walletId: "foundation-custody-main", activeOnly: "true" }],
  });

  const { data: walletsData } = useQuery<{ wallets: CustodyWallet[] }>({
    queryKey: ["/api/custody-admin/wallets"],
  });

  const transactions: CustodyTransaction[] = transactionsData?.transactions || [];
  const signers: Signer[] = signersData?.signers || [];
  const wallets: CustodyWallet[] = walletsData?.wallets || [];
  const foundationWallet = wallets.find(w => w.walletId === "foundation-custody-main");

  const pendingTransactions = transactions.filter(t => t.status === "pending_approval");
  const approvedTransactions = transactions.filter(t => t.status === "approved");
  const executedTransactions = transactions.filter(t => t.status === "executed");
  const otherTransactions = transactions.filter(t => ["rejected", "cancelled", "expired"].includes(t.status));

  const createMutation = useMutation({
    mutationFn: async (data: typeof newTransaction) => {
      const amountInWei = (BigInt(Math.floor(parseFloat(data.amount) * 1e18))).toString();
      return apiRequest("POST", "/api/custody-admin/transactions", {
        ...data,
        amount: amountInWei,
      });
    },
    onSuccess: () => {
      toast({ title: "성공", description: "트랜잭션이 생성되었습니다." });
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
      });
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "트랜잭션 생성 실패", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: typeof approvalData }) => {
      return apiRequest("POST", `/api/custody-admin/transactions/${transactionId}/approve`, data);
    },
    onSuccess: (response: any) => {
      const status = response?.thresholdStatus;
      toast({ 
        title: "성공", 
        description: `투표가 기록되었습니다. (${status?.current || 0}/${status?.required || 7} 승인)` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
      setShowApproveDialog(false);
      setApprovalData({ signerId: "", decision: "approve", comment: "" });
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "투표 기록 실패", variant: "destructive" });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return apiRequest("POST", `/api/custody-admin/transactions/${transactionId}/execute`, {});
    },
    onSuccess: (response: any) => {
      toast({ 
        title: "실행 완료", 
        description: `트랜잭션이 실행되었습니다. TxHash: ${response?.txHash?.slice(0, 16)}...` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/wallets"] });
      setShowExecuteDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "실행 오류", description: error.message || "트랜잭션 실행 실패", variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: string; reason: string }) => {
      return apiRequest("POST", `/api/custody-admin/transactions/${transactionId}/cancel`, { reason });
    },
    onSuccess: () => {
      toast({ title: "취소됨", description: "트랜잭션이 취소되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
      setShowCancelDialog(false);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "취소 실패", variant: "destructive" });
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
        description: count > 0 ? `${count}개 트랜잭션이 만료되었습니다.` : "만료된 트랜잭션이 없습니다." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/transactions"] });
    },
    onError: (error: any) => {
      toast({ title: "오류", description: error.message || "만료 처리 실패", variant: "destructive" });
    },
  });

  const TransactionRow = ({ transaction }: { transaction: CustodyTransaction }) => {
    const isExpanded = expandedRow === transaction.transactionId;
    const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending_approval;
    const StatusIcon = statusConfig.icon;
    
    const timelockRemaining = transaction.timelockExpiresAt 
      ? differenceInHours(new Date(transaction.timelockExpiresAt), new Date())
      : 0;
    
    const canExecute = transaction.status === "approved" && timelockRemaining <= 0;

    return (
      <>
        <TableRow 
          className="cursor-pointer hover-elevate"
          onClick={() => setExpandedRow(isExpanded ? null : transaction.transactionId)}
          data-testid={`row-transaction-${transaction.transactionId}`}
        >
          <TableCell>
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <code className="text-xs bg-muted px-2 py-1 rounded">{transaction.transactionId.slice(0, 12)}...</code>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={statusConfig.variant} className="gap-1">
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </Badge>
            {transaction.isEmergency && (
              <Badge variant="destructive" className="ml-1">긴급</Badge>
            )}
          </TableCell>
          <TableCell>
            <div className="font-medium">{formatTburnAmount(transaction.amount)}</div>
            {transaction.amountUsd && (
              <div className="text-xs text-muted-foreground">${transaction.amountUsd}</div>
            )}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Progress 
                value={(transaction.approvalCount / transaction.requiredApprovals) * 100} 
                className="w-16 h-2"
              />
              <span className="text-sm font-medium">
                {transaction.approvalCount}/{transaction.requiredApprovals}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm">{formatAddress(transaction.recipientAddress)}</div>
            {transaction.recipientName && (
              <div className="text-xs text-muted-foreground">{transaction.recipientName}</div>
            )}
          </TableCell>
          <TableCell>
            <div className="text-sm">
              {formatDistanceToNow(new Date(transaction.proposedAt), { addSuffix: true, locale: ko })}
            </div>
          </TableCell>
          <TableCell onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              {transaction.status === "pending_approval" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowApproveDialog(true);
                    }}
                    data-testid={`button-approve-${transaction.transactionId}`}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    투표
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowCancelDialog(true);
                    }}
                    data-testid={`button-cancel-${transaction.transactionId}`}
                  >
                    <Ban className="w-3 h-3" />
                  </Button>
                </>
              )}
              {transaction.status === "approved" && (
                <Button
                  size="sm"
                  variant={canExecute ? "default" : "outline"}
                  disabled={!canExecute}
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setShowExecuteDialog(true);
                  }}
                  data-testid={`button-execute-${transaction.transactionId}`}
                >
                  {canExecute ? (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      실행
                    </>
                  ) : (
                    <>
                      <Timer className="w-3 h-3 mr-1" />
                      {timelockRemaining}h 남음
                    </>
                  )}
                </Button>
              )}
              {transaction.status === "executed" && transaction.executedTxHash && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(transaction.executedTxHash!, toast)}
                  data-testid={`button-copy-hash-${transaction.transactionId}`}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Hash
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={7} className="bg-muted/50 p-4">
              <TransactionDetails transaction={transaction} signers={signers} />
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };

  const TransactionDetails = ({ transaction, signers }: { transaction: CustodyTransaction; signers: Signer[] }) => {
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
    const txType = TRANSACTION_TYPES.find(t => t.value === transaction.transactionType);

    return (
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">트랜잭션 상세</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">유형:</span>
                <span>{txType?.label} ({txType?.description})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">목적:</span>
                <span>{transaction.purpose}</span>
              </div>
              {transaction.justification && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">사유:</span>
                  <span className="max-w-[200px] truncate">{transaction.justification}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">수신 주소:</span>
                <div className="flex items-center gap-1">
                  <code className="text-xs">{formatAddress(transaction.recipientAddress)}</code>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(transaction.recipientAddress, toast)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {transaction.documentationUrl && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">문서:</span>
                  <a href={transaction.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1">
                    문서 보기 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">타임라인</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">제안일:</span>
                <span>{format(new Date(transaction.proposedAt), "yyyy-MM-dd HH:mm", { locale: ko })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">제안자:</span>
                <span>{transaction.proposedBy}</span>
              </div>
              {transaction.timelockExpiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">타임락 해제:</span>
                  <span>{format(new Date(transaction.timelockExpiresAt), "yyyy-MM-dd HH:mm", { locale: ko })}</span>
                </div>
              )}
              {transaction.executedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">실행일:</span>
                  <span>{format(new Date(transaction.executedAt), "yyyy-MM-dd HH:mm", { locale: ko })}</span>
                </div>
              )}
              {transaction.executedTxHash && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">TxHash:</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs">{transaction.executedTxHash.slice(0, 16)}...</code>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction.executedTxHash!, toast)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">승인 현황 ({approvals.length}명 투표)</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {approvals.map((approval) => {
                const signer = signers.find(s => s.signerId === approval.signerId);
                return (
                  <div key={approval.approvalId} className="flex items-center justify-between p-2 bg-background rounded border">
                    <div className="flex items-center gap-2">
                      {approval.decision === "approve" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {approval.decision === "reject" && <XCircle className="w-4 h-4 text-red-500" />}
                      {approval.decision === "abstain" && <Ban className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <div className="font-medium text-sm">{signer?.name || approval.signerId}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(approval.decidedAt), { addSuffix: true, locale: ko })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={approval.decision === "approve" ? "default" : approval.decision === "reject" ? "destructive" : "secondary"}>
                      {approval.decision === "approve" ? "승인" : approval.decision === "reject" ? "거부" : "기권"}
                    </Badge>
                  </div>
                );
              })}
              {approvals.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  아직 투표가 없습니다
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  if (transactionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            다중서명 트랜잭션 관리
          </h1>
          <p className="text-muted-foreground">7/11 임계값 기반 재단 자산 관리</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => expireMutation.mutate()}
            disabled={expireMutation.isPending}
            data-testid="button-expire-pending"
          >
            {expireMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Timer className="w-4 h-4 mr-1" />}
            만료 처리
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchTransactions()}
            data-testid="button-refresh-transactions"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            새로고침
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            data-testid="button-create-transaction"
          >
            <Plus className="w-4 h-4 mr-1" />
            새 트랜잭션
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">대기 중</p>
                <p className="text-2xl font-bold">{pendingTransactions.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">승인됨</p>
                <p className="text-2xl font-bold">{approvedTransactions.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">실행 완료</p>
                <p className="text-2xl font-bold">{executedTransactions.length}</p>
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">지갑 잔액</p>
                <p className="text-xl font-bold">{foundationWallet ? formatTburnAmount(foundationWallet.remainingAmount) : "-"}</p>
              </div>
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            대기 중 ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            승인됨 ({approvedTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="executed" data-testid="tab-executed">
            실행 완료 ({executedTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="other" data-testid="tab-other">
            기타 ({otherTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>승인 대기 트랜잭션</CardTitle>
              <CardDescription>7/11 서명자 승인이 필요한 트랜잭션</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  대기 중인 트랜잭션이 없습니다
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>승인</TableHead>
                      <TableHead>수신자</TableHead>
                      <TableHead>제안일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTransactions.map(tx => (
                      <TransactionRow key={tx.transactionId} transaction={tx} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>승인된 트랜잭션</CardTitle>
              <CardDescription>타임락 대기 또는 실행 가능한 트랜잭션</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  승인된 트랜잭션이 없습니다
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>승인</TableHead>
                      <TableHead>수신자</TableHead>
                      <TableHead>제안일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedTransactions.map(tx => (
                      <TransactionRow key={tx.transactionId} transaction={tx} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executed">
          <Card>
            <CardHeader>
              <CardTitle>실행 완료 트랜잭션</CardTitle>
              <CardDescription>성공적으로 실행된 트랜잭션 이력</CardDescription>
            </CardHeader>
            <CardContent>
              {executedTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  실행 완료된 트랜잭션이 없습니다
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>승인</TableHead>
                      <TableHead>수신자</TableHead>
                      <TableHead>제안일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executedTransactions.map(tx => (
                      <TransactionRow key={tx.transactionId} transaction={tx} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>기타 트랜잭션</CardTitle>
              <CardDescription>거부, 취소, 만료된 트랜잭션</CardDescription>
            </CardHeader>
            <CardContent>
              {otherTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  기타 트랜잭션이 없습니다
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>승인</TableHead>
                      <TableHead>수신자</TableHead>
                      <TableHead>제안일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherTransactions.map(tx => (
                      <TransactionRow key={tx.transactionId} transaction={tx} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 다중서명 트랜잭션 생성</DialogTitle>
            <DialogDescription>
              7/11 서명자 승인이 필요한 재단 자산 이체 요청
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="transactionType">트랜잭션 유형</Label>
                <Select
                  value={newTransaction.transactionType}
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, transactionType: value }))}
                >
                  <SelectTrigger data-testid="select-transaction-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipientAddress">수신 주소 (tb1...)</Label>
                <Input
                  id="recipientAddress"
                  value={newTransaction.recipientAddress}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, recipientAddress: e.target.value }))}
                  placeholder="tb1q..."
                  data-testid="input-recipient-address"
                />
              </div>
              <div>
                <Label htmlFor="recipientName">수신자 이름 (선택)</Label>
                <Input
                  id="recipientName"
                  value={newTransaction.recipientName}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="Partner Company A"
                  data-testid="input-recipient-name"
                />
              </div>
              <div>
                <Label htmlFor="amount">금액 (TBURN)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="1000000"
                  data-testid="input-amount"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="purpose">목적</Label>
                <Input
                  id="purpose"
                  value={newTransaction.purpose}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Q1 2026 생태계 보조금"
                  data-testid="input-purpose"
                />
              </div>
              <div>
                <Label htmlFor="justification">사유 (선택)</Label>
                <Textarea
                  id="justification"
                  value={newTransaction.justification}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, justification: e.target.value }))}
                  placeholder="자세한 사유를 입력하세요..."
                  rows={3}
                  data-testid="input-justification"
                />
              </div>
              <div>
                <Label htmlFor="documentationUrl">문서 URL (선택)</Label>
                <Input
                  id="documentationUrl"
                  value={newTransaction.documentationUrl}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, documentationUrl: e.target.value }))}
                  placeholder="https://docs.example.com/proposal"
                  data-testid="input-documentation-url"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button
              onClick={() => createMutation.mutate(newTransaction)}
              disabled={createMutation.isPending || !newTransaction.recipientAddress || !newTransaction.amount || !newTransaction.purpose}
              data-testid="button-submit-transaction"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              트랜잭션 생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>트랜잭션 투표</DialogTitle>
            <DialogDescription>
              서명자로서 이 트랜잭션에 대해 투표하세요
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <div><span className="text-muted-foreground">금액:</span> {formatTburnAmount(selectedTransaction.amount)}</div>
                  <div><span className="text-muted-foreground">수신자:</span> {formatAddress(selectedTransaction.recipientAddress)}</div>
                  <div><span className="text-muted-foreground">목적:</span> {selectedTransaction.purpose}</div>
                  <div><span className="text-muted-foreground">현재 승인:</span> {selectedTransaction.approvalCount}/{selectedTransaction.requiredApprovals}</div>
                </div>
              </div>
              <div>
                <Label>서명자 선택</Label>
                <Select
                  value={approvalData.signerId}
                  onValueChange={(value) => setApprovalData(prev => ({ ...prev, signerId: value }))}
                >
                  <SelectTrigger data-testid="select-signer">
                    <SelectValue placeholder="서명자를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {signers.map(signer => (
                      <SelectItem key={signer.signerId} value={signer.signerId}>
                        {signer.name} ({signer.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>결정</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={approvalData.decision === "approve" ? "default" : "outline"}
                    onClick={() => setApprovalData(prev => ({ ...prev, decision: "approve" }))}
                    className="flex-1"
                    data-testid="button-decision-approve"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    승인
                  </Button>
                  <Button
                    variant={approvalData.decision === "reject" ? "destructive" : "outline"}
                    onClick={() => setApprovalData(prev => ({ ...prev, decision: "reject" }))}
                    className="flex-1"
                    data-testid="button-decision-reject"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    거부
                  </Button>
                  <Button
                    variant={approvalData.decision === "abstain" ? "secondary" : "outline"}
                    onClick={() => setApprovalData(prev => ({ ...prev, decision: "abstain" }))}
                    className="flex-1"
                    data-testid="button-decision-abstain"
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    기권
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="comment">코멘트 (선택)</Label>
                <Textarea
                  id="comment"
                  value={approvalData.comment}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="투표에 대한 의견을 입력하세요..."
                  rows={2}
                  data-testid="input-vote-comment"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              취소
            </Button>
            <Button
              onClick={() => selectedTransaction && approveMutation.mutate({
                transactionId: selectedTransaction.transactionId,
                data: approvalData
              })}
              disabled={approveMutation.isPending || !approvalData.signerId}
              data-testid="button-submit-vote"
            >
              {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              투표 제출
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>트랜잭션 실행</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 승인된 트랜잭션을 실행하면 자산이 수신자에게 이체됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedTransaction && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm space-y-1">
                <div><span className="text-muted-foreground">금액:</span> <span className="font-bold">{formatTburnAmount(selectedTransaction.amount)}</span></div>
                <div><span className="text-muted-foreground">수신자:</span> {selectedTransaction.recipientAddress}</div>
                <div><span className="text-muted-foreground">승인:</span> {selectedTransaction.approvalCount}/{selectedTransaction.requiredApprovals}</div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTransaction && executeMutation.mutate(selectedTransaction.transactionId)}
              disabled={executeMutation.isPending}
              data-testid="button-confirm-execute"
            >
              {executeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              실행
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>트랜잭션 취소</AlertDialogTitle>
            <AlertDialogDescription>
              이 트랜잭션을 취소하시겠습니까? 취소된 트랜잭션은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label htmlFor="cancelReason">취소 사유</Label>
            <Textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="취소 사유를 입력하세요..."
              rows={2}
              data-testid="input-cancel-reason"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>돌아가기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTransaction && cancelMutation.mutate({
                transactionId: selectedTransaction.transactionId,
                reason: cancelReason
              })}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Ban className="w-4 h-4 mr-1" />}
              취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
