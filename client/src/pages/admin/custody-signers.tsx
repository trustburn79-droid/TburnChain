import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Users, 
  Building2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Code,
  Scale,
  Handshake,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Lock,
  LockOpen,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Wallet,
  Key,
  Fingerprint,
  AlertTriangle,
  AlertOctagon,
  Mail,
  Clock,
  Eye,
  EyeOff,
  Copy,
  CircleDot,
  Activity,
  UserPlus,
  UserCheck,
  UserX,
  Zap,
  Crown,
  Star,
  Award,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";

interface Signer {
  id: number;
  signerId: string;
  walletId: string;
  name: string;
  role: string;
  signerAddress: string;
  email: string | null;
  publicKey: string | null;
  canApproveEmergency: boolean;
  isActive: boolean;
  addedBy: string | null;
  addedAt: string | null;
  removedAt: string | null;
  removalReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustodyWallet {
  id: number;
  walletId: string;
  name: string;
  purpose: string;
  signaturesRequired: number;
  totalSigners: number;
  timelockHours: number;
  allocatedAmount: string;
  remainingAmount: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface CustodyStats {
  totalWallets: number;
  activeSigners: number;
  pendingTransactions: number;
  mainWallet: {
    signaturesRequired: number;
    totalSigners: number;
    timelockHours: number;
    allocatedAmount: string;
    remainingAmount: string;
  } | null;
}

interface SignerRole {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const ROLE_CONFIG: Record<string, { icon: any; label: string; labelKo: string; color: string; bgColor: string; description: string }> = {
  founder: { icon: Crown, label: "Founder", labelKo: "창립자", color: "text-amber-400", bgColor: "bg-amber-500/20", description: "재단 창립 멤버" },
  board_member: { icon: Building2, label: "Board Member", labelKo: "이사회 멤버", color: "text-purple-400", bgColor: "bg-purple-500/20", description: "이사회 의결권 보유" },
  advisor: { icon: Star, label: "Advisor", labelKo: "자문위원", color: "text-cyan-400", bgColor: "bg-cyan-500/20", description: "전략 자문 역할" },
  foundation_officer: { icon: UserCog, label: "Foundation Officer", labelKo: "재단 임원", color: "text-blue-400", bgColor: "bg-blue-500/20", description: "재단 운영 책임" },
  technical_lead: { icon: Code, label: "Technical Lead", labelKo: "기술 책임자", color: "text-green-400", bgColor: "bg-green-500/20", description: "기술 의사결정" },
  legal_officer: { icon: Scale, label: "Legal Officer", labelKo: "법무 담당", color: "text-yellow-400", bgColor: "bg-yellow-500/20", description: "법률 검토 담당" },
  community_representative: { icon: Users, label: "Community Rep", labelKo: "커뮤니티 대표", color: "text-pink-400", bgColor: "bg-pink-500/20", description: "커뮤니티 대변" },
  security_expert: { icon: Shield, label: "Security Expert", labelKo: "보안 전문가", color: "text-red-400", bgColor: "bg-red-500/20", description: "보안 감사 담당" },
  strategic_partner: { icon: Handshake, label: "Strategic Partner", labelKo: "전략적 파트너", color: "text-indigo-400", bgColor: "bg-indigo-500/20", description: "파트너십 대표" },
};

const generateTestCredentials = () => {
  const bech32mChars = "023456789acdefghjklmnpqrstuvwxyz";
  const hexChars = "0123456789abcdef";
  
  const generateBech32Address = () => {
    let address = "tb1";
    for (let i = 0; i < 39; i++) {
      address += bech32mChars[Math.floor(Math.random() * bech32mChars.length)];
    }
    return address;
  };
  
  const generatePublicKey = () => {
    let key = "";
    for (let i = 0; i < 66; i++) {
      key += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return key;
  };

  return {
    signerAddress: generateBech32Address(),
    publicKey: generatePublicKey(),
  };
};

function formatAddress(address: string, length: number = 16): string {
  if (address.length <= length) return address;
  const half = Math.floor(length / 2);
  return `${address.slice(0, half + 4)}...${address.slice(-half)}`;
}

function copyToClipboard(text: string, toast: any) {
  navigator.clipboard.writeText(text);
  toast({ title: "복사됨", description: "클립보드에 복사되었습니다." });
}

export default function CustodySignersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("signers");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<Signer | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isTestCredential, setIsTestCredential] = useState(false);

  const [formData, setFormData] = useState({
    walletId: "foundation-custody-main",
    name: "",
    role: "",
    signerAddress: "",
    email: "",
    publicKey: "",
    canApproveEmergency: false,
    credentialType: "production" as "test" | "production",
  });

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
            if (data.type === "signer-update" || data.type === "custody-update") {
              setLastUpdate(new Date());
              refetchSigners();
              refetchStats();
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

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<{ stats: CustodyStats }>({
    queryKey: ["/api/custody-admin/stats"],
    refetchInterval: 30000,
  });

  const { data: signersData, isLoading: signersLoading, refetch: refetchSigners } = useQuery<{ signers: Signer[] }>({
    queryKey: ["/api/custody-admin/signers"],
    refetchInterval: 30000,
  });

  const { data: walletsData } = useQuery<{ wallets: CustodyWallet[] }>({
    queryKey: ["/api/custody-admin/wallets"],
  });

  const { data: rolesData } = useQuery<{ roles: SignerRole[] }>({
    queryKey: ["/api/custody-admin/signer-roles"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/custody-admin/signers", {
        walletId: data.walletId,
        name: data.name,
        role: data.role,
        signerAddress: data.signerAddress,
        email: data.email || null,
        publicKey: data.publicKey || null,
        canApproveEmergency: data.canApproveEmergency,
      });
    },
    onSuccess: () => {
      toast({ title: "서명자 추가됨", description: "새 서명자가 성공적으로 등록되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/signers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/stats"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "추가 실패", description: error.message || "서명자를 추가할 수 없습니다.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ signerId, data }: { signerId: string; data: Partial<typeof formData> }) => {
      return apiRequest("PATCH", `/api/custody-admin/signers/${signerId}`, data);
    },
    onSuccess: () => {
      toast({ title: "서명자 수정됨", description: "서명자 정보가 업데이트되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/signers"] });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "수정 실패", description: error.message || "서명자 정보를 수정할 수 없습니다.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ signerId, reason }: { signerId: string; reason: string }) => {
      return apiRequest("DELETE", `/api/custody-admin/signers/${signerId}`, { reason });
    },
    onSuccess: () => {
      toast({ title: "서명자 비활성화됨", description: "서명자가 비활성화되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/signers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/stats"] });
      setIsDeleteDialogOpen(false);
      setSelectedSigner(null);
    },
    onError: (error: any) => {
      toast({ title: "비활성화 실패", description: error.message || "서명자를 비활성화할 수 없습니다.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      walletId: "foundation-custody-main",
      name: "",
      role: "",
      signerAddress: "",
      email: "",
      publicKey: "",
      canApproveEmergency: false,
      credentialType: "production",
    });
    setIsTestCredential(false);
    setSelectedSigner(null);
  };

  const openEditDialog = (signer: Signer) => {
    setSelectedSigner(signer);
    setFormData({
      walletId: signer.walletId,
      name: signer.name,
      role: signer.role,
      signerAddress: signer.signerAddress,
      email: signer.email || "",
      publicKey: signer.publicKey || "",
      canApproveEmergency: signer.canApproveEmergency,
      credentialType: "production",
    });
    setIsTestCredential(false);
    setIsEditDialogOpen(true);
  };

  const stats = statsData?.stats;
  const signers = signersData?.signers || [];
  const wallets = walletsData?.wallets || [];
  const roles = rolesData?.roles || [];

  const filteredSigners = signers.filter((signer) => {
    if (!showInactive && !signer.isActive) return false;
    if (filterRole !== "all" && signer.role !== filterRole) return false;
    return true;
  });

  const activeSigners = signers.filter(s => s.isActive);
  const inactiveSigners = signers.filter(s => !s.isActive);
  const emergencySigners = activeSigners.filter(s => s.canApproveEmergency);

  const roleDistribution = activeSigners.reduce((acc, signer) => {
    acc[signer.role] = (acc[signer.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const thresholdMet = (stats?.activeSigners || 0) >= (stats?.mainWallet?.signaturesRequired || 7);

  if (statsLoading || signersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-700/50" />
          <div className="grid grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 bg-slate-700/50" />)}
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3" data-testid="text-page-title">
                Multi-Signature Signer Management
                <Badge variant="outline" className={`${wsConnected ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-slate-500/50 text-slate-400 bg-slate-500/10"} text-xs`}>
                  <CircleDot className={`w-2 h-2 mr-1 ${wsConnected ? "animate-pulse" : ""}`} />
                  {wsConnected ? "Live" : "Offline"}
                </Badge>
              </h1>
              <p className="text-slate-400">7/11 Threshold Custody Signer Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchSigners(); refetchStats(); }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              새로고침
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500"
              data-testid="button-add-signer"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              서명자 추가
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group" data-testid="card-stat-signers">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">활성 서명자</p>
                  <p className="text-3xl font-bold text-white mt-1">{activeSigners.length}</p>
                  <p className="text-xs text-slate-500 mt-1">/ {stats?.mainWallet?.totalSigners || 11} 전체</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group" data-testid="card-stat-threshold">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">서명 임계값</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats?.mainWallet?.signaturesRequired || 7}</p>
                  <p className="text-xs mt-1">
                    {thresholdMet ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 충족됨
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" /> 부족
                      </span>
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group" data-testid="card-stat-emergency">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">긴급 승인자</p>
                  <p className="text-3xl font-bold text-white mt-1">{emergencySigners.length}</p>
                  <p className="text-xs text-slate-500 mt-1">비상 트랜잭션 권한</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group" data-testid="card-stat-pending">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">대기 트랜잭션</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats?.pendingTransactions || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">승인 필요</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden relative group" data-testid="card-stat-wallets">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">커스터디 월렛</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats?.totalWallets || 1}</p>
                  <p className="text-xs text-slate-500 mt-1">멀티시그 월렛</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!thresholdMet && (
          <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-sm" data-testid="card-warning">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-400">서명자 부족 경고</p>
                  <p className="text-sm text-slate-400">
                    트랜잭션 승인을 위해 최소 {stats?.mainWallet?.signaturesRequired || 7}명의 활성 서명자가 필요합니다.
                    현재 {activeSigners.length}명이 등록되어 있습니다. {(stats?.mainWallet?.signaturesRequired || 7) - activeSigners.length}명을 추가로 등록하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger value="signers" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white" data-testid="tab-signers">
              <Users className="w-4 h-4 mr-2" />
              서명자 목록
              <Badge variant="secondary" className="ml-2 bg-slate-600/50 text-slate-300">
                {activeSigners.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white" data-testid="tab-roles">
              <Award className="w-4 h-4 mr-2" />
              역할별 분포
            </TabsTrigger>
            {inactiveSigners.length > 0 && (
              <TabsTrigger value="inactive" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white" data-testid="tab-inactive">
                <UserX className="w-4 h-4 mr-2" />
                비활성
                <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-400">
                  {inactiveSigners.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="signers">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                      활성 서명자
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      재단 커스터디 월렛의 다중서명 권한을 가진 서명자입니다.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={filterRole} onValueChange={setFilterRole} data-testid="select-role-filter">
                      <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600 text-slate-100">
                        <SelectValue placeholder="역할 필터" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-slate-100">전체 역할</SelectItem>
                        {Object.entries(ROLE_CONFIG).map(([key, val]) => (
                          <SelectItem key={key} value={key} className="text-slate-100">
                            {val.labelKo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredSigners.filter(s => s.isActive).length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-lg font-medium">등록된 서명자가 없습니다</p>
                    <p className="text-sm text-slate-500 mt-2">새 서명자를 추가하려면 위 버튼을 클릭하세요</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSigners.filter(s => s.isActive).map(signer => (
                      <SignerCard
                        key={signer.signerId}
                        signer={signer}
                        onEdit={() => openEditDialog(signer)}
                        onDelete={() => { setSelectedSigner(signer); setIsDeleteDialogOpen(true); }}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  역할별 서명자 분포
                </CardTitle>
                <CardDescription className="text-slate-400">
                  각 역할별 서명자 수와 구성 현황입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ROLE_CONFIG).map(([roleId, config]) => {
                    const count = roleDistribution[roleId] || 0;
                    const RoleIcon = config.icon;
                    return (
                      <Card key={roleId} className={`bg-slate-900/50 border-slate-700/30 ${count > 0 ? "" : "opacity-50"}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor}`}>
                              <RoleIcon className={`w-6 h-6 ${config.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${config.color}`}>{config.labelKo}</p>
                              <p className="text-xs text-slate-500">{config.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">{count}</p>
                              <p className="text-xs text-slate-500">명</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <UserX className="w-5 h-5 text-red-400" />
                  비활성 서명자
                </CardTitle>
                <CardDescription className="text-slate-400">
                  비활성화된 서명자 목록입니다. 더 이상 서명 권한이 없습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inactiveSigners.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-lg font-medium">비활성 서명자가 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inactiveSigners.map(signer => (
                      <SignerCard
                        key={signer.signerId}
                        signer={signer}
                        onEdit={() => openEditDialog(signer)}
                        toast={toast}
                        inactive
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto" data-testid="dialog-add-signer">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              새 서명자 추가
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              재단 커스터디 월렛의 다중서명 권한을 가진 새 서명자를 등록합니다.
            </DialogDescription>
          </DialogHeader>

          <SignerForm
            formData={formData}
            setFormData={setFormData}
            isTestCredential={isTestCredential}
            setIsTestCredential={setIsTestCredential}
            wallets={wallets}
            roles={roles}
            toast={toast}
          />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              취소
            </Button>
            <Button
              onClick={() => addMutation.mutate(formData)}
              disabled={addMutation.isPending || !formData.name || !formData.role || !formData.signerAddress}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500"
            >
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-signer">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-cyan-400" />
              서명자 수정
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              서명자 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <SignerForm
            formData={formData}
            setFormData={setFormData}
            isTestCredential={isTestCredential}
            setIsTestCredential={setIsTestCredential}
            wallets={wallets}
            roles={roles}
            toast={toast}
            isEdit
          />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              취소
            </Button>
            <Button
              onClick={() => {
                if (!selectedSigner) return;
                updateMutation.mutate({
                  signerId: selectedSigner.signerId,
                  data: {
                    name: formData.name,
                    role: formData.role,
                    email: formData.email || undefined,
                    canApproveEmergency: formData.canApproveEmergency,
                  },
                });
              }}
              disabled={updateMutation.isPending || !formData.name || !formData.role}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-400" />
              서명자 비활성화
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              <span className="font-medium text-white">{selectedSigner?.name}</span> 서명자를 비활성화하시겠습니까?
              비활성화된 서명자는 더 이상 트랜잭션에 서명할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedSigner && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-2 my-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">이름:</span>
                <span className="text-white">{selectedSigner.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">역할:</span>
                <span className="text-white">{ROLE_CONFIG[selectedSigner.role]?.labelKo || selectedSigner.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">주소:</span>
                <code className="text-xs text-cyan-400">{formatAddress(selectedSigner.signerAddress)}</code>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedSigner) return;
                deleteMutation.mutate({ 
                  signerId: selectedSigner.signerId, 
                  reason: "관리자에 의해 비활성화됨" 
                });
              }}
              className="bg-red-600 hover:bg-red-500"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserX className="w-4 h-4 mr-2" />}
              비활성화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}

interface SignerCardProps {
  signer: Signer;
  onEdit: () => void;
  onDelete?: () => void;
  toast: any;
  inactive?: boolean;
}

function SignerCard({ signer, onEdit, onDelete, toast, inactive }: SignerCardProps) {
  const config = ROLE_CONFIG[signer.role] || ROLE_CONFIG.board_member;
  const RoleIcon = config.icon;

  return (
    <Card className={`
      bg-slate-900/50 border-slate-700/30 backdrop-blur-sm overflow-hidden
      ${inactive ? "opacity-60" : ""}
      transition-all duration-300 hover:border-purple-500/50
    `}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 border-2 border-slate-700">
            <AvatarFallback className={`${config.bgColor} ${config.color} text-lg font-bold`}>
              {signer.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white truncate">{signer.name}</h3>
              {signer.canApproveEmergency && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      <Zap className="w-3 h-3" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>긴급 트랜잭션 승인 권한</TooltipContent>
                </Tooltip>
              )}
              {inactive && (
                <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs">
                  비활성
                </Badge>
              )}
            </div>

            <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs mb-2`}>
              <RoleIcon className="w-3 h-3 mr-1" />
              {config.labelKo}
            </Badge>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Fingerprint className="w-3 h-3" />
                <code className="text-slate-300">{formatAddress(signer.signerAddress, 20)}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-slate-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(signer.signerAddress, toast);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              {signer.email && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3 h-3" />
                  <span>{signer.email}</span>
                </div>
              )}
              {signer.addedAt && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(signer.addedAt), { addSuffix: true, locale: ko })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                  onClick={onEdit}
                  data-testid={`button-edit-${signer.signerId}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>수정</TooltipContent>
            </Tooltip>
            {!inactive && onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={onDelete}
                    data-testid={`button-delete-${signer.signerId}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>비활성화</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SignerFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isTestCredential: boolean;
  setIsTestCredential: (v: boolean) => void;
  wallets: CustodyWallet[];
  roles: SignerRole[];
  toast: any;
  isEdit?: boolean;
}

function SignerForm({ formData, setFormData, isTestCredential, setIsTestCredential, wallets, roles, toast, isEdit }: SignerFormProps) {
  return (
    <div className="space-y-5">
      {!isEdit && (
        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            대상 월렛 *
          </Label>
          <Select value={formData.walletId} onValueChange={(v) => setFormData({ ...formData, walletId: v })}>
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-100" data-testid="select-wallet">
              <SelectValue placeholder="월렛 선택" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {wallets.length === 0 ? (
                <SelectItem value="foundation-custody-main" className="text-slate-100">Foundation Custody Main (기본)</SelectItem>
              ) : (
                wallets.map((w) => (
                  <SelectItem key={w.walletId} value={w.walletId} className="text-slate-100">
                    {w.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator className="bg-slate-700" />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Users className="w-4 h-4" />
          서명자 정보
        </h4>

        <div className="space-y-2">
          <Label className="text-slate-300">성명 (Full Name) *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="예: 홍길동 (Gildong Hong)"
            className="bg-slate-900/50 border-slate-600 text-slate-100"
            data-testid="input-name"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">역할 (Role) *</Label>
          <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-100" data-testid="select-role">
              <SelectValue placeholder="역할 선택" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Object.entries(ROLE_CONFIG).map(([key, val]) => {
                const Icon = val.icon;
                return (
                  <SelectItem key={key} value={key} className="text-slate-100">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${val.color}`} />
                      <span>{val.labelKo}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">업무 이메일</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="예: signer@tburn.foundation"
            className="bg-slate-900/50 border-slate-600 text-slate-100"
            data-testid="input-email"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <Switch
            id="emergency"
            checked={formData.canApproveEmergency}
            onCheckedChange={(v) => setFormData({ ...formData, canApproveEmergency: v })}
          />
          <div>
            <Label htmlFor="emergency" className="text-slate-300 flex items-center gap-2 cursor-pointer">
              <Zap className="w-4 h-4 text-red-400" />
              긴급 트랜잭션 승인 권한
            </Label>
            <p className="text-xs text-slate-500">비상 상황 시 긴급 트랜잭션을 승인할 수 있습니다.</p>
          </div>
        </div>
      </div>

      {!isEdit && (
        <>
          <Separator className="bg-slate-700" />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Key className="w-4 h-4" />
              서명 자격 증명
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.credentialType === "test" ? "default" : "outline"}
                size="sm"
                className={formData.credentialType === "test" ? "bg-amber-600 hover:bg-amber-500" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                onClick={() => {
                  setFormData({ ...formData, credentialType: "test", signerAddress: "", publicKey: "" });
                  setIsTestCredential(false);
                }}
                data-testid="button-type-test"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                테스트용
              </Button>
              <Button
                type="button"
                variant={formData.credentialType === "production" ? "default" : "outline"}
                size="sm"
                className={formData.credentialType === "production" ? "bg-emerald-600 hover:bg-emerald-500" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                onClick={() => {
                  setFormData({ ...formData, credentialType: "production", signerAddress: "", publicKey: "" });
                  setIsTestCredential(false);
                }}
                data-testid="button-type-production"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                프로덕션
              </Button>
            </div>

            {formData.credentialType === "test" && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-400">
                      <p className="font-semibold mb-1">테스트용 자격증명</p>
                      <p>개발/테스트 환경에서만 사용하세요.</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    const creds = generateTestCredentials();
                    setFormData({
                      ...formData,
                      signerAddress: creds.signerAddress,
                      publicKey: creds.publicKey,
                    });
                    setIsTestCredential(true);
                    toast({
                      title: "테스트 자격증명 생성됨",
                      description: "개발/테스트용 주소가 생성되었습니다.",
                    });
                  }}
                  data-testid="button-generate-credentials"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  테스트 자격증명 생성
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-300">서명자 주소 (Bech32m) *</Label>
              <Input
                value={formData.signerAddress}
                onChange={(e) => setFormData({ ...formData, signerAddress: e.target.value })}
                placeholder="tb1..."
                className="font-mono bg-slate-900/50 border-slate-600 text-slate-100"
                disabled={isTestCredential}
                data-testid="input-address"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">공개키 (선택)</Label>
              <Input
                value={formData.publicKey}
                onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                placeholder="66자 hex 공개키"
                className="font-mono bg-slate-900/50 border-slate-600 text-slate-100"
                disabled={isTestCredential}
                data-testid="input-publickey"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
