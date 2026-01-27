import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  UserPlus, 
  UserMinus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Activity,
  Mail,
  Key,
  RefreshCw,
  Zap
} from "lucide-react";

interface Guardian {
  email: string;
  walletAddress?: string;
  nickname?: string;
  addedAt: number;
  trustLevel: 'STANDARD' | 'TRUSTED' | 'HIGHLY_TRUSTED';
  recoveryParticipation: number;
}

interface RecoveryConfig {
  walletAddress: string;
  guardians: Guardian[];
  threshold: number;
  timelockHours: number;
  securityLevel: 'STANDARD' | 'HIGH' | 'CRITICAL';
  createdAt: number;
  updatedAt: number;
}

interface RecoverySession {
  sessionId: string;
  walletAddress: string;
  newOwner: string;
  initiatorEmail: string;
  status: string;
  approvals: { guardianEmail: string; approvedAt: number; signature: string }[];
  requiredApprovals: number;
  timelockEndsAt?: number;
  expiresAt: number;
  createdAt: number;
}

export default function SocialRecoveryPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClientHook = useQueryClient();
  
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [addGuardianDialogOpen, setAddGuardianDialogOpen] = useState(false);
  const [initiateRecoveryDialogOpen, setInitiateRecoveryDialogOpen] = useState(false);
  
  const [walletAddress, setWalletAddress] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianNickname, setGuardianNickname] = useState("");
  const [guardianTrustLevel, setGuardianTrustLevel] = useState<'STANDARD' | 'TRUSTED' | 'HIGHLY_TRUSTED'>('STANDARD');
  const [recoveryThreshold, setRecoveryThreshold] = useState(2);
  const [securityLevel, setSecurityLevel] = useState<'STANDARD' | 'HIGH' | 'CRITICAL'>('STANDARD');
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [initiatorEmail, setInitiatorEmail] = useState("");

  const { data: configData, isLoading: configLoading, refetch: refetchConfig } = useQuery<{ config: RecoveryConfig } | null>({
    queryKey: ['/api/social-recovery/guardians', walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/social-recovery/guardians/${walletAddress}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: walletAddress.length > 10,
  });

  const { data: sessionData, isLoading: sessionLoading, refetch: refetchSession } = useQuery<{ session: RecoverySession } | null>({
    queryKey: ['/api/social-recovery/recovery/wallet', walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/social-recovery/recovery/wallet/${walletAddress}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: walletAddress.length > 10,
  });

  const { data: statsData } = useQuery<{ stats: any }>({
    queryKey: ['/api/social-recovery/stats'],
  });

  const setupMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; guardianEmails: string[]; threshold: number; securityLevel: string }) => {
      return apiRequest('POST', '/api/social-recovery/guardians/setup', data);
    },
    onSuccess: () => {
      toast({ title: t('socialRecovery.setupSuccess'), description: t('socialRecovery.setupSuccessDesc') });
      setSetupDialogOpen(false);
      refetchConfig();
    },
    onError: (error: Error) => {
      toast({ title: t('socialRecovery.error'), description: error.message, variant: "destructive" });
    }
  });

  const addGuardianMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; guardianEmail: string; nickname?: string; trustLevel: string }) => {
      return apiRequest('POST', '/api/social-recovery/guardians/add', data);
    },
    onSuccess: () => {
      toast({ title: t('socialRecovery.guardianAdded'), description: t('socialRecovery.guardianAddedDesc') });
      setAddGuardianDialogOpen(false);
      setGuardianEmail("");
      setGuardianNickname("");
      refetchConfig();
    },
    onError: (error: Error) => {
      toast({ title: t('socialRecovery.error'), description: error.message, variant: "destructive" });
    }
  });

  const removeGuardianMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; guardianEmail: string }) => {
      return apiRequest('POST', '/api/social-recovery/guardians/remove', data);
    },
    onSuccess: () => {
      toast({ title: t('socialRecovery.guardianRemoved') });
      refetchConfig();
    },
    onError: (error: Error) => {
      toast({ title: t('socialRecovery.error'), description: error.message, variant: "destructive" });
    }
  });

  const initiateRecoveryMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; newOwner: string; initiatorEmail: string }) => {
      return apiRequest('POST', '/api/social-recovery/recovery/initiate', data);
    },
    onSuccess: () => {
      toast({ title: t('socialRecovery.recoveryInitiated'), description: t('socialRecovery.recoveryInitiatedDesc') });
      setInitiateRecoveryDialogOpen(false);
      refetchSession();
    },
    onError: (error: Error) => {
      toast({ title: t('socialRecovery.error'), description: error.message, variant: "destructive" });
    }
  });

  const approveRecoveryMutation = useMutation({
    mutationFn: async (data: { sessionId: string; guardianEmail: string; signature: string }) => {
      return apiRequest('POST', '/api/social-recovery/recovery/approve', data);
    },
    onSuccess: () => {
      toast({ title: t('socialRecovery.approvalSuccess') });
      refetchSession();
    },
    onError: (error: Error) => {
      toast({ title: t('socialRecovery.error'), description: error.message, variant: "destructive" });
    }
  });

  const executeRecoveryMutation = useMutation({
    mutationFn: async (data: { sessionId: string }) => {
      return apiRequest('POST', `/api/social-recovery/recovery/execute/${data.sessionId}`, data);
    },
    onSuccess: () => {
      toast({ title: t('socialRecovery.recoveryExecuted'), description: t('socialRecovery.recoveryExecutedDesc') });
      refetchSession();
      refetchConfig();
    },
    onError: (error: Error) => {
      toast({ title: t('socialRecovery.error'), description: error.message, variant: "destructive" });
    }
  });

  const cancelRecoveryMutation = useMutation({
    mutationFn: async (data: { sessionId: string; cancellerEmail: string }) => {
      return apiRequest('POST', '/api/social-recovery/recovery/cancel', data);
    },
    onSuccess: () => {
      toast({ title: t('socialRecovery.recoveryCancelled') });
      refetchSession();
    },
    onError: (error: Error) => {
      toast({ title: t('socialRecovery.error'), description: error.message, variant: "destructive" });
    }
  });

  const config = configData?.config;
  const session = sessionData?.session;
  const stats = statsData?.stats;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
      'INITIATED': { variant: 'secondary', icon: Clock },
      'PENDING_APPROVALS': { variant: 'default', icon: Users },
      'TIMELOCK': { variant: 'outline', icon: Lock },
      'EXECUTABLE': { variant: 'default', icon: Unlock },
      'EXECUTED': { variant: 'default', icon: CheckCircle },
      'CANCELLED': { variant: 'destructive', icon: XCircle },
      'EXPIRED': { variant: 'destructive', icon: AlertTriangle },
    };
    const cfg = statusConfig[status] || { variant: 'secondary' as const, icon: Activity };
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Shield className="h-8 w-8 text-primary" />
            {t('socialRecovery.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('socialRecovery.subtitle')}</p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          <Zap className="h-3 w-3 mr-1" />
          2026 {t('socialRecovery.nextGenTech')}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('socialRecovery.walletLookup')}
          </CardTitle>
          <CardDescription>{t('socialRecovery.walletLookupDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('socialRecovery.enterWalletAddress')}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                data-testid="input-wallet-address"
              />
            </div>
            <Button onClick={() => { refetchConfig(); refetchSession(); }} data-testid="button-lookup">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('socialRecovery.lookup')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="guardians" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guardians" data-testid="tab-guardians">
            <Users className="h-4 w-4 mr-2" />
            {t('socialRecovery.guardians')}
          </TabsTrigger>
          <TabsTrigger value="recovery" data-testid="tab-recovery">
            <Shield className="h-4 w-4 mr-2" />
            {t('socialRecovery.recovery')}
          </TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">
            <Activity className="h-4 w-4 mr-2" />
            {t('socialRecovery.stats')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guardians" className="space-y-4">
          {configLoading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : config ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('socialRecovery.guardianConfiguration')}</CardTitle>
                    <CardDescription>
                      {t('socialRecovery.threshold')}: {config.threshold} / {config.guardians.length} {t('socialRecovery.guardiansRequired')}
                    </CardDescription>
                  </div>
                  <Badge variant={config.securityLevel === 'CRITICAL' ? 'destructive' : config.securityLevel === 'HIGH' ? 'default' : 'secondary'}>
                    {config.securityLevel} {t('socialRecovery.security')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {config.guardians.map((guardian, index) => (
                    <div key={guardian.email} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{guardian.nickname || guardian.email}</p>
                          <p className="text-sm text-muted-foreground">{guardian.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{guardian.trustLevel}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGuardianMutation.mutate({ walletAddress: config.walletAddress, guardianEmail: guardian.email })}
                          data-testid={`button-remove-guardian-${index}`}
                        >
                          <UserMinus className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Dialog open={addGuardianDialogOpen} onOpenChange={setAddGuardianDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-guardian">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t('socialRecovery.addGuardian')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('socialRecovery.addGuardian')}</DialogTitle>
                        <DialogDescription>{t('socialRecovery.addGuardianDesc')}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>{t('socialRecovery.guardianEmail')}</Label>
                          <Input
                            type="email"
                            value={guardianEmail}
                            onChange={(e) => setGuardianEmail(e.target.value)}
                            placeholder="guardian@example.com"
                            data-testid="input-guardian-email"
                          />
                        </div>
                        <div>
                          <Label>{t('socialRecovery.nickname')}</Label>
                          <Input
                            value={guardianNickname}
                            onChange={(e) => setGuardianNickname(e.target.value)}
                            placeholder={t('socialRecovery.nicknameOptional')}
                            data-testid="input-guardian-nickname"
                          />
                        </div>
                        <div>
                          <Label>{t('socialRecovery.trustLevel')}</Label>
                          <Select value={guardianTrustLevel} onValueChange={(v) => setGuardianTrustLevel(v as typeof guardianTrustLevel)}>
                            <SelectTrigger data-testid="select-trust-level">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STANDARD">{t('socialRecovery.trustStandard')}</SelectItem>
                              <SelectItem value="TRUSTED">{t('socialRecovery.trustTrusted')}</SelectItem>
                              <SelectItem value="HIGHLY_TRUSTED">{t('socialRecovery.trustHighlyTrusted')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => addGuardianMutation.mutate({
                            walletAddress: config.walletAddress,
                            guardianEmail,
                            nickname: guardianNickname || undefined,
                            trustLevel: guardianTrustLevel
                          })}
                          disabled={addGuardianMutation.isPending}
                          data-testid="button-confirm-add-guardian"
                        >
                          {addGuardianMutation.isPending ? t('socialRecovery.adding') : t('socialRecovery.add')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">{t('socialRecovery.noConfigFound')}</h3>
                  <p className="text-sm text-muted-foreground">{t('socialRecovery.noConfigFoundDesc')}</p>
                </div>
                <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-setup-recovery">
                      <Shield className="h-4 w-4 mr-2" />
                      {t('socialRecovery.setupRecovery')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{t('socialRecovery.setupRecovery')}</DialogTitle>
                      <DialogDescription>{t('socialRecovery.setupRecoveryDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{t('socialRecovery.walletAddress')}</Label>
                        <Input
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="0x..."
                          data-testid="input-setup-wallet"
                        />
                      </div>
                      <div>
                        <Label>{t('socialRecovery.initialGuardians')}</Label>
                        <Input
                          placeholder={t('socialRecovery.guardiansPlaceholder')}
                          data-testid="input-initial-guardians"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{t('socialRecovery.guardiansHint')}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('socialRecovery.recoveryThreshold')}</Label>
                          <Input
                            type="number"
                            min={2}
                            max={7}
                            value={recoveryThreshold}
                            onChange={(e) => setRecoveryThreshold(parseInt(e.target.value))}
                            data-testid="input-threshold"
                          />
                        </div>
                        <div>
                          <Label>{t('socialRecovery.securityLevel')}</Label>
                          <Select value={securityLevel} onValueChange={(v) => setSecurityLevel(v as typeof securityLevel)}>
                            <SelectTrigger data-testid="select-security-level">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STANDARD">{t('socialRecovery.securityStandard')}</SelectItem>
                              <SelectItem value="HIGH">{t('socialRecovery.securityHigh')}</SelectItem>
                              <SelectItem value="CRITICAL">{t('socialRecovery.securityCritical')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => setupMutation.mutate({
                          walletAddress,
                          guardianEmails: [],
                          threshold: recoveryThreshold,
                          securityLevel
                        })}
                        disabled={setupMutation.isPending}
                        data-testid="button-confirm-setup"
                      >
                        {setupMutation.isPending ? t('socialRecovery.setting') : t('socialRecovery.setup')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          {sessionLoading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : session ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('socialRecovery.activeRecoverySession')}</CardTitle>
                  {getStatusBadge(session.status)}
                </div>
                <CardDescription>
                  {t('socialRecovery.sessionId')}: {session.sessionId.slice(0, 16)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('socialRecovery.newOwner')}</p>
                    <p className="font-mono text-sm">{session.newOwner.slice(0, 20)}...</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('socialRecovery.initiator')}</p>
                    <p className="text-sm">{session.initiatorEmail}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t('socialRecovery.approvalProgress')}</span>
                    <span className="text-sm text-muted-foreground">
                      {session.approvals.length} / {session.requiredApprovals}
                    </span>
                  </div>
                  <Progress value={(session.approvals.length / session.requiredApprovals) * 100} />
                </div>

                {session.timelockEndsAt && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>{t('socialRecovery.timelockActive')}</AlertTitle>
                    <AlertDescription>
                      {t('socialRecovery.timelockEndsAt')}: {new Date(session.timelockEndsAt).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  {session.status === 'EXECUTABLE' && (
                    <Button
                      onClick={() => executeRecoveryMutation.mutate({ sessionId: session.sessionId })}
                      disabled={executeRecoveryMutation.isPending}
                      data-testid="button-execute-recovery"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {t('socialRecovery.executeRecovery')}
                    </Button>
                  )}
                  {['INITIATED', 'PENDING_APPROVALS', 'TIMELOCK'].includes(session.status) && (
                    <Button
                      variant="destructive"
                      onClick={() => cancelRecoveryMutation.mutate({ sessionId: session.sessionId, cancellerEmail: '' })}
                      disabled={cancelRecoveryMutation.isPending}
                      data-testid="button-cancel-recovery"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('socialRecovery.cancelRecovery')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">{t('socialRecovery.noActiveSession')}</h3>
                  <p className="text-sm text-muted-foreground">{t('socialRecovery.noActiveSessionDesc')}</p>
                </div>
                {config && (
                  <Dialog open={initiateRecoveryDialogOpen} onOpenChange={setInitiateRecoveryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" data-testid="button-initiate-recovery">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {t('socialRecovery.initiateRecovery')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('socialRecovery.initiateRecovery')}</DialogTitle>
                        <DialogDescription>{t('socialRecovery.initiateRecoveryDesc')}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>{t('socialRecovery.newOwnerAddress')}</Label>
                          <Input
                            value={newOwnerAddress}
                            onChange={(e) => setNewOwnerAddress(e.target.value)}
                            placeholder="0x..."
                            data-testid="input-new-owner"
                          />
                        </div>
                        <div>
                          <Label>{t('socialRecovery.yourEmail')}</Label>
                          <Input
                            type="email"
                            value={initiatorEmail}
                            onChange={(e) => setInitiatorEmail(e.target.value)}
                            placeholder="your@email.com"
                            data-testid="input-initiator-email"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => initiateRecoveryMutation.mutate({
                            walletAddress: config.walletAddress,
                            newOwner: newOwnerAddress,
                            initiatorEmail
                          })}
                          disabled={initiateRecoveryMutation.isPending}
                          data-testid="button-confirm-initiate"
                        >
                          {initiateRecoveryMutation.isPending ? t('socialRecovery.initiating') : t('socialRecovery.initiate')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalConfigurations || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('socialRecovery.totalConfigs')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.successfulRecoveries || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('socialRecovery.successfulRecoveries')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.activeSessions || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('socialRecovery.activeSessions')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.averageRecoveryTimeHours?.toFixed(1) || '0'}h</p>
                    <p className="text-sm text-muted-foreground">{t('socialRecovery.avgRecoveryTime')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('socialRecovery.emailNotifications')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>{t('socialRecovery.emailIntegration')}</AlertTitle>
                <AlertDescription>
                  {t('socialRecovery.emailIntegrationDesc')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
