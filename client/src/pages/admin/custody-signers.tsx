import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
  Users, 
  Building2,
  Shield,
  UserCog,
  Code,
  Scale,
  Handshake,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
  Key,
  AlertTriangle,
  Mail,
  Clock,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
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

const roleIcons: Record<string, typeof Building2> = {
  board_member: Building2,
  foundation_officer: UserCog,
  technical_lead: Code,
  legal_officer: Scale,
  community_representative: Users,
  security_expert: Shield,
  strategic_partner: Handshake,
};

const roleColors: Record<string, string> = {
  board_member: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  foundation_officer: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  technical_lead: "bg-green-500/20 text-green-400 border-green-500/50",
  legal_officer: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  community_representative: "bg-pink-500/20 text-pink-400 border-pink-500/50",
  security_expert: "bg-red-500/20 text-red-400 border-red-500/50",
  strategic_partner: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
};

const generateTestCredentials = () => {
  const chars = "0123456789abcdefghjkmnpqrstuvwxyz";
  const hexChars = "0123456789abcdef";
  
  const generateBech32Address = () => {
    let address = "tb1q";
    for (let i = 0; i < 38; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  };
  
  const generatePublicKey = () => {
    let pubKey = "pk1";
    for (let i = 0; i < 64; i++) {
      pubKey += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return pubKey;
  };
  
  return {
    signerAddress: generateBech32Address(),
    publicKey: generatePublicKey(),
  };
};

export default function CustodySignersAdmin() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<Signer | null>(null);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    walletId: "foundation-custody-main",
    name: "",
    role: "",
    signerAddress: "",
    email: "",
    publicKey: "",
    canApproveEmergency: false,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<{ success: boolean; stats: CustodyStats }>({
    queryKey: ["/api/custody-admin/stats"],
  });

  const { data: signersData, isLoading: signersLoading, refetch: refetchSigners } = useQuery<{ success: boolean; signers: Signer[] }>({
    queryKey: ["/api/custody-admin/signers"],
  });

  const { data: walletsData } = useQuery<{ success: boolean; wallets: CustodyWallet[] }>({
    queryKey: ["/api/custody-admin/wallets"],
  });

  const { data: rolesData } = useQuery<{ success: boolean; roles: SignerRole[] }>({
    queryKey: ["/api/custody-admin/signer-roles"],
  });

  const addSignerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/custody-admin/signers", data);
    },
    onSuccess: () => {
      toast({ title: "서명자 추가 완료", description: "새로운 서명자가 등록되었습니다." });
      setIsAddDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/signers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "오류 발생", description: error.message || "서명자 추가에 실패했습니다.", variant: "destructive" });
    },
  });

  const updateSignerMutation = useMutation({
    mutationFn: async ({ signerId, data }: { signerId: string; data: Partial<typeof formData> }) => {
      return apiRequest("PATCH", `/api/custody-admin/signers/${signerId}`, data);
    },
    onSuccess: () => {
      toast({ title: "서명자 수정 완료", description: "서명자 정보가 업데이트되었습니다." });
      setIsEditDialogOpen(false);
      setSelectedSigner(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/signers"] });
    },
    onError: (error: any) => {
      toast({ title: "오류 발생", description: error.message || "서명자 수정에 실패했습니다.", variant: "destructive" });
    },
  });

  const removeSignerMutation = useMutation({
    mutationFn: async (signerId: string) => {
      return apiRequest("DELETE", `/api/custody-admin/signers/${signerId}`, { reason: "관리자에 의한 삭제" });
    },
    onSuccess: () => {
      toast({ title: "서명자 비활성화 완료", description: "서명자가 비활성화되었습니다." });
      setIsDeleteDialogOpen(false);
      setSelectedSigner(null);
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/signers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/custody-admin/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "오류 발생", description: error.message || "서명자 비활성화에 실패했습니다.", variant: "destructive" });
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
    });
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
    });
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

  const activeSignersByRole = signers.filter(s => s.isActive).reduce((acc, signer) => {
    acc[signer.role] = (acc[signer.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (statsLoading || signersLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Shield className="h-6 w-6" />
            멀티시그 서명자 관리
          </h1>
          <p className="text-muted-foreground">재단 커스터디 월렛의 서명자를 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchSigners()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-signer">
            <Plus className="h-4 w-4 mr-2" />
            서명자 추가
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-stat-wallets">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 월렛</p>
                <p className="text-2xl font-bold">{stats?.totalWallets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-signers">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">활성 서명자</p>
                <p className="text-2xl font-bold">{stats?.activeSigners || 0} / {stats?.mainWallet?.totalSigners || 11}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-threshold">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Lock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">서명 임계값</p>
                <p className="text-2xl font-bold">{stats?.mainWallet?.signaturesRequired || 7} / {stats?.mainWallet?.totalSigners || 11}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-pending">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">대기 트랜잭션</p>
                <p className="text-2xl font-bold">{stats?.pendingTransactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats && stats.activeSigners < (stats.mainWallet?.signaturesRequired || 7) && (
        <Card className="border-yellow-500/50 bg-yellow-500/10" data-testid="card-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-500">서명자 부족</p>
                <p className="text-sm text-muted-foreground">
                  트랜잭션 승인을 위해 최소 {stats.mainWallet?.signaturesRequired || 7}명의 활성 서명자가 필요합니다. 
                  현재 {stats.activeSigners}명이 등록되어 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="signers" className="space-y-4">
        <TabsList data-testid="tabs-main">
          <TabsTrigger value="signers" data-testid="tab-signers">서명자 목록</TabsTrigger>
          <TabsTrigger value="roles" data-testid="tab-roles">역할별 분포</TabsTrigger>
        </TabsList>

        <TabsContent value="signers" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={filterRole} onValueChange={setFilterRole} data-testid="select-role-filter">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 역할</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={showInactive}
                onCheckedChange={setShowInactive}
                data-testid="switch-show-inactive"
              />
              <Label className="text-sm">비활성 서명자 표시</Label>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>서명 주소</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>비상 승인</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSigners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          등록된 서명자가 없습니다
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSigners.map((signer) => {
                        const RoleIcon = roleIcons[signer.role] || Users;
                        return (
                          <TableRow key={signer.signerId} data-testid={`row-signer-${signer.signerId}`}>
                            <TableCell className="font-medium">{signer.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={roleColors[signer.role]}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {roles.find(r => r.id === signer.role)?.name || signer.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {signer.signerAddress.slice(0, 12)}...{signer.signerAddress.slice(-8)}
                            </TableCell>
                            <TableCell>
                              {signer.email ? (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {signer.email}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {signer.canApproveEmergency ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {signer.isActive ? (
                                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                                  활성
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                                  비활성
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {signer.addedAt 
                                ? formatDistanceToNow(new Date(signer.addedAt), { addSuffix: true, locale: ko })
                                : "-"
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(signer)}
                                  data-testid={`button-edit-${signer.signerId}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {signer.isActive && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => { setSelectedSigner(signer); setIsDeleteDialogOpen(true); }}
                                    data-testid={`button-delete-${signer.signerId}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const RoleIcon = roleIcons[role.id] || Users;
              const count = activeSignersByRole[role.id] || 0;
              return (
                <Card key={role.id} data-testid={`card-role-${role.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${roleColors[role.id]?.split(' ')[0] || 'bg-primary/10'}`}>
                        <RoleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{role.name}</CardTitle>
                        <CardDescription className="text-xs">{role.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">활성 서명자</span>
                      <span className="text-xl font-bold">{count}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-add-signer">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              새 서명자 추가
            </DialogTitle>
            <DialogDescription>
              재단 커스터디 월렛의 새로운 멀티시그 서명자를 등록합니다. 
              등록된 서명자는 트랜잭션 승인 시 서명 권한을 갖습니다.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 pr-4">
              <div className="space-y-2">
                <Label htmlFor="wallet" className="flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5" />
                  대상 월렛 *
                </Label>
                <Select 
                  value={formData.walletId} 
                  onValueChange={(v) => setFormData({...formData, walletId: v})}
                >
                  <SelectTrigger id="wallet" data-testid="select-wallet">
                    <SelectValue placeholder="월렛 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.length === 0 ? (
                      <SelectItem value="foundation-custody-main">Foundation Custody Main (기본)</SelectItem>
                    ) : (
                      wallets.map((w) => (
                        <SelectItem key={w.walletId} value={w.walletId}>
                          <div className="flex flex-col">
                            <span>{w.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {w.signaturesRequired}/{w.totalSigners} 서명 · {w.purpose}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">서명자를 추가할 멀티시그 월렛을 선택합니다.</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  서명자 정보
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">성명 (Full Name) *</Label>
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="예: 홍길동 (Gildong Hong)"
                      data-testid="input-name"
                    />
                    <p className="text-xs text-muted-foreground">공식 서명자 명단에 표시될 실명을 입력합니다.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">역할 (Role) *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(v) => setFormData({...formData, role: v})}
                    >
                      <SelectTrigger id="role" data-testid="select-role">
                        <SelectValue placeholder="역할 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.length === 0 ? (
                          <>
                            <SelectItem value="board_member">이사회 멤버 (Board Member)</SelectItem>
                            <SelectItem value="foundation_officer">재단 임원 (Foundation Officer)</SelectItem>
                            <SelectItem value="technical_lead">기술 책임자 (Technical Lead)</SelectItem>
                            <SelectItem value="legal_officer">법무 담당 (Legal Officer)</SelectItem>
                            <SelectItem value="community_representative">커뮤니티 대표 (Community Rep)</SelectItem>
                            <SelectItem value="security_expert">보안 전문가 (Security Expert)</SelectItem>
                            <SelectItem value="strategic_partner">전략적 파트너 (Strategic Partner)</SelectItem>
                          </>
                        ) : (
                          roles.map((r) => {
                            const RoleIcon = roleIcons[r.id] || Users;
                            return (
                              <SelectItem key={r.id} value={r.id}>
                                <div className="flex items-center gap-2">
                                  <RoleIcon className="h-3.5 w-3.5" />
                                  <span>{r.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">서명자의 조직 내 역할을 선택합니다. 역할에 따라 권한이 달라질 수 있습니다.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">업무 이메일 (Business Email)</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="예: signer@tburn.foundation"
                      data-testid="input-email"
                    />
                    <p className="text-xs text-muted-foreground">트랜잭션 알림 및 승인 요청을 받을 이메일 주소입니다.</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    서명 자격 증명
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const creds = generateTestCredentials();
                      setFormData({
                        ...formData,
                        signerAddress: creds.signerAddress,
                        publicKey: creds.publicKey,
                      });
                      toast({
                        title: "테스트 자격증명 생성됨",
                        description: "개발/테스트용 주소와 공개키가 생성되었습니다.",
                      });
                    }}
                    data-testid="button-generate-credentials"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    테스트 자격증명 생성
                  </Button>
                </div>
                
                <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 mb-4">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <strong>개발/테스트 환경:</strong> 실제 하드웨어 지갑이 없는 경우 위 버튼을 클릭하여 테스트용 자격증명을 생성할 수 있습니다. 
                    프로덕션 환경에서는 각 서명자가 본인의 하드웨어 지갑에서 생성한 실제 주소를 사용해야 합니다.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">TBURN 서명 주소 *</Label>
                    <Input 
                      id="address"
                      value={formData.signerAddress}
                      onChange={(e) => setFormData({...formData, signerAddress: e.target.value})}
                      placeholder="tb1q8z7n5d..."
                      className="font-mono text-sm"
                      data-testid="input-address"
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>TBURN 메인넷 Bech32m 주소 형식 (tb1으로 시작, 42-62자)</p>
                      <p className="text-yellow-600 dark:text-yellow-400">
                        이 주소의 개인키로 트랜잭션 서명이 이루어집니다. 정확히 입력하세요.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publicKey">공개 키 (Public Key)</Label>
                    <Input 
                      id="publicKey"
                      value={formData.publicKey}
                      onChange={(e) => setFormData({...formData, publicKey: e.target.value})}
                      placeholder="pk1q8z7n5d4f6g7h8j9k0..."
                      className="font-mono text-sm"
                      data-testid="input-public-key"
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>서명 검증용 공개 키 (pk1 형식, 66자 이상)</p>
                      <p>지원 알고리즘: secp256k1, Ed25519, SPHINCS+ (양자내성)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  권한 설정
                </h4>
                
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                  <Switch
                    checked={formData.canApproveEmergency}
                    onCheckedChange={(v) => setFormData({...formData, canApproveEmergency: v})}
                    data-testid="switch-emergency"
                  />
                  <div>
                    <Label className="font-medium">비상 승인 권한</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      활성화 시 4시간 단축 타임락으로 비상 트랜잭션을 승인할 수 있습니다.
                      보안상 신뢰도가 높은 핵심 인원에게만 부여하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel-add">
              취소
            </Button>
            <Button 
              onClick={() => addSignerMutation.mutate(formData)}
              disabled={addSignerMutation.isPending || !formData.name || !formData.role || !formData.signerAddress}
              data-testid="button-confirm-add"
            >
              {addSignerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              서명자 등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-edit-signer">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              서명자 정보 수정
            </DialogTitle>
            <DialogDescription>
              {selectedSigner?.name} 서명자의 정보를 수정합니다. 서명 주소는 보안상 변경할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 pr-4">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">서명 주소 (변경 불가)</p>
                <p className="font-mono text-sm">{selectedSigner?.signerAddress}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  서명자 정보
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">성명 (Full Name) *</Label>
                    <Input 
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="예: 홍길동 (Gildong Hong)"
                      data-testid="input-edit-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">역할 (Role) *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(v) => setFormData({...formData, role: v})}
                    >
                      <SelectTrigger id="edit-role" data-testid="select-edit-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.length === 0 ? (
                          <>
                            <SelectItem value="board_member">이사회 멤버 (Board Member)</SelectItem>
                            <SelectItem value="foundation_officer">재단 임원 (Foundation Officer)</SelectItem>
                            <SelectItem value="technical_lead">기술 책임자 (Technical Lead)</SelectItem>
                            <SelectItem value="legal_officer">법무 담당 (Legal Officer)</SelectItem>
                            <SelectItem value="community_representative">커뮤니티 대표 (Community Rep)</SelectItem>
                            <SelectItem value="security_expert">보안 전문가 (Security Expert)</SelectItem>
                            <SelectItem value="strategic_partner">전략적 파트너 (Strategic Partner)</SelectItem>
                          </>
                        ) : (
                          roles.map((r) => {
                            const RoleIcon = roleIcons[r.id] || Users;
                            return (
                              <SelectItem key={r.id} value={r.id}>
                                <div className="flex items-center gap-2">
                                  <RoleIcon className="h-3.5 w-3.5" />
                                  <span>{r.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email">업무 이메일</Label>
                    <Input 
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="예: signer@tburn.foundation"
                      data-testid="input-edit-email"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  서명 자격 증명
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-publicKey">공개 키 (Public Key)</Label>
                  <Input 
                    id="edit-publicKey"
                    value={formData.publicKey}
                    onChange={(e) => setFormData({...formData, publicKey: e.target.value})}
                    placeholder="pk1q8z7n5d4f6g7h8j9k0..."
                    className="font-mono text-sm"
                    data-testid="input-edit-public-key"
                  />
                  <p className="text-xs text-muted-foreground">서명 검증용 공개 키 (pk1 형식)</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  권한 설정
                </h4>
                
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                  <Switch
                    checked={formData.canApproveEmergency}
                    onCheckedChange={(v) => setFormData({...formData, canApproveEmergency: v})}
                    data-testid="switch-edit-emergency"
                  />
                  <div>
                    <Label className="font-medium">비상 승인 권한</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      4시간 단축 타임락으로 비상 트랜잭션 승인 가능
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} data-testid="button-cancel-edit">
              취소
            </Button>
            <Button 
              onClick={() => selectedSigner && updateSignerMutation.mutate({ 
                signerId: selectedSigner.signerId, 
                data: formData 
              })}
              disabled={updateSignerMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updateSignerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              변경사항 저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-signer">
          <AlertDialogHeader>
            <AlertDialogTitle>서명자 비활성화</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSigner?.name} 서명자를 비활성화하시겠습니까? 
              비활성화된 서명자는 트랜잭션 승인에 참여할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSigner && removeSignerMutation.mutate(selectedSigner.signerId)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {removeSignerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "비활성화"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
