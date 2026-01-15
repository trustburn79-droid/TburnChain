import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  RefreshCw,
  Shield,
  Server,
  MapPin,
  Coins,
  Mail,
  Building,
  Copy,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface Registration {
  id: string;
  operatorAddress: string;
  operatorName: string;
  region: string;
  stakeAmount: string;
  tier: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
  metadata?: {
    organization?: string;
    email?: string;
    hostingProvider?: string;
    hardware?: any;
    security?: any;
  };
  nodeId?: string;
}

interface RegistrationsResponse {
  success: boolean;
  data: {
    registrations: Registration[];
    total: number;
    summary: {
      pending: number;
      underReview: number;
      approved: number;
      rejected: number;
    };
  };
}

const TIER_CONFIG = {
  genesis: { label: 'Genesis', color: 'bg-purple-500/20 text-purple-400' },
  pioneer: { label: 'Pioneer', color: 'bg-orange-500/20 text-orange-400' },
  standard: { label: 'Standard', color: 'bg-blue-500/20 text-blue-400' },
  community: { label: 'Community', color: 'bg-green-500/20 text-green-400' },
};

const WEI_PER_TBURN = BigInt("1000000000000000000");

function formatStake(weiAmount: string): string {
  try {
    const wei = BigInt(weiAmount);
    const tburn = wei / WEI_PER_TBURN;
    return tburn.toLocaleString() + ' TBURN';
  } catch {
    return weiAmount;
  }
}

export default function AdminValidatorRegistrations() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvedApiKey, setApprovedApiKey] = useState('');

  const statusConfig = {
    pending: { label: t('adminValidatorRegistrations.status.pending'), color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
    under_review: { label: t('adminValidatorRegistrations.status.underReview'), color: 'bg-blue-500/20 text-blue-500', icon: Eye },
    approved: { label: t('adminValidatorRegistrations.status.approved'), color: 'bg-emerald-500/20 text-emerald-500', icon: CheckCircle },
    rejected: { label: t('adminValidatorRegistrations.status.rejected'), color: 'bg-red-500/20 text-red-500', icon: XCircle },
  };

  const { data, isLoading, refetch } = useQuery<RegistrationsResponse>({
    queryKey: ['/api/external-validators/admin/registrations'],
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/external-validators/admin/registrations/${id}/approve`);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        setApprovedApiKey(result.data.apiKey || '');
        toast({
          title: t('adminValidatorRegistrations.toast.approveSuccess'),
          description: t('adminValidatorRegistrations.toast.approveSuccessDesc'),
        });
        queryClient.invalidateQueries({ queryKey: ['/api/external-validators/admin/registrations'] });
      } else {
        toast({
          title: t('adminValidatorRegistrations.toast.approveFailed'),
          description: result.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('adminValidatorRegistrations.toast.error'),
        description: error.message || t('adminValidatorRegistrations.toast.approveError'),
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/external-validators/admin/registrations/${id}/reject`, { reason });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        setShowRejectDialog(false);
        setRejectionReason('');
        toast({
          title: t('adminValidatorRegistrations.toast.rejectSuccess'),
          description: t('adminValidatorRegistrations.toast.rejectSuccessDesc'),
        });
        queryClient.invalidateQueries({ queryKey: ['/api/external-validators/admin/registrations'] });
      } else {
        toast({
          title: t('adminValidatorRegistrations.toast.rejectFailed'),
          description: result.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('adminValidatorRegistrations.toast.error'),
        description: error.message || t('adminValidatorRegistrations.toast.rejectError'),
        variant: 'destructive',
      });
    },
  });

  const registrations = data?.data?.registrations || [];
  const summary = data?.data?.summary || { pending: 0, underReview: 0, approved: 0, rejected: 0 };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesSearch = !searchTerm || 
      reg.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.operatorAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.metadata?.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (reg: Registration) => {
    setSelectedRegistration(reg);
    setApprovedApiKey('');
    setShowApproveDialog(true);
  };

  const handleReject = (reg: Registration) => {
    setSelectedRegistration(reg);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleViewDetails = (reg: Registration) => {
    setSelectedRegistration(reg);
    setShowDetailDialog(true);
  };

  const confirmApprove = () => {
    if (selectedRegistration) {
      approveMutation.mutate(selectedRegistration.id);
    }
  };

  const confirmReject = () => {
    if (selectedRegistration && rejectionReason) {
      rejectMutation.mutate({ id: selectedRegistration.id, reason: rejectionReason });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('adminValidatorRegistrations.toast.copied'), description: t('adminValidatorRegistrations.toast.copiedDesc') });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('adminValidatorRegistrations.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('adminValidatorRegistrations.pageDescription')}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('adminValidatorRegistrations.refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('adminValidatorRegistrations.status.pending')}</p>
                <p className="text-2xl font-bold">{summary.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('adminValidatorRegistrations.status.underReview')}</p>
                <p className="text-2xl font-bold">{summary.underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('adminValidatorRegistrations.status.approved')}</p>
                <p className="text-2xl font-bold">{summary.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('adminValidatorRegistrations.status.rejected')}</p>
                <p className="text-2xl font-bold">{summary.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminValidatorRegistrations.registrationList.title')}</CardTitle>
          <CardDescription>{t('adminValidatorRegistrations.registrationList.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('adminValidatorRegistrations.registrationList.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder={t('adminValidatorRegistrations.registrationList.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminValidatorRegistrations.registrationList.all')}</SelectItem>
                <SelectItem value="pending">{t('adminValidatorRegistrations.status.pending')}</SelectItem>
                <SelectItem value="under_review">{t('adminValidatorRegistrations.status.underReview')}</SelectItem>
                <SelectItem value="approved">{t('adminValidatorRegistrations.status.approved')}</SelectItem>
                <SelectItem value="rejected">{t('adminValidatorRegistrations.status.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Server className="h-12 w-12 mb-4 opacity-50" />
              <p>{t('adminValidatorRegistrations.registrationList.noRegistrations')}</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('adminValidatorRegistrations.table.nodeName')}</TableHead>
                    <TableHead>{t('adminValidatorRegistrations.table.address')}</TableHead>
                    <TableHead>{t('adminValidatorRegistrations.table.organization')}</TableHead>
                    <TableHead>{t('adminValidatorRegistrations.table.region')}</TableHead>
                    <TableHead>{t('adminValidatorRegistrations.table.tier')}</TableHead>
                    <TableHead>{t('adminValidatorRegistrations.table.staking')}</TableHead>
                    <TableHead>{t('adminValidatorRegistrations.table.status')}</TableHead>
                    <TableHead>{t('adminValidatorRegistrations.table.submittedAt')}</TableHead>
                    <TableHead className="text-right">{t('adminValidatorRegistrations.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => {
                    const StatusIcon = statusConfig[reg.status]?.icon || Clock;
                    return (
                      <TableRow key={reg.id} data-testid={`row-registration-${reg.id}`}>
                        <TableCell className="font-medium">{reg.operatorName}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {reg.operatorAddress.slice(0, 8)}...{reg.operatorAddress.slice(-6)}
                        </TableCell>
                        <TableCell>{reg.metadata?.organization || '-'}</TableCell>
                        <TableCell className="capitalize">{reg.region.replace('-', ' ')}</TableCell>
                        <TableCell>
                          <Badge className={TIER_CONFIG[reg.tier as keyof typeof TIER_CONFIG]?.color || ''}>
                            {TIER_CONFIG[reg.tier as keyof typeof TIER_CONFIG]?.label || reg.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatStake(reg.stakeAmount)}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig[reg.status]?.color || ''}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[reg.status]?.label || reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(reg.submittedAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(reg)}
                              data-testid={`button-view-${reg.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(reg.status === 'pending' || reg.status === 'under_review') && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApprove(reg)}
                                  className="text-emerald-500 hover:text-emerald-600"
                                  data-testid={`button-approve-${reg.id}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReject(reg)}
                                  className="text-red-500 hover:text-red-600"
                                  data-testid={`button-reject-${reg.id}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('adminValidatorRegistrations.detail.title')}</DialogTitle>
            <DialogDescription>{t('adminValidatorRegistrations.detail.description')}</DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Server className="h-4 w-4" /> {t('adminValidatorRegistrations.detail.nodeName')}
                  </p>
                  <p className="font-medium">{selectedRegistration.operatorName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="h-4 w-4" /> {t('adminValidatorRegistrations.detail.organization')}
                  </p>
                  <p className="font-medium">{selectedRegistration.metadata?.organization || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Shield className="h-4 w-4" /> {t('adminValidatorRegistrations.detail.operatorAddress')}
                  </p>
                  <p className="font-mono text-sm break-all">{selectedRegistration.operatorAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" /> {t('adminValidatorRegistrations.detail.email')}
                  </p>
                  <p className="font-medium">{selectedRegistration.metadata?.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {t('adminValidatorRegistrations.detail.region')}
                  </p>
                  <p className="font-medium capitalize">{selectedRegistration.region.replace('-', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Coins className="h-4 w-4" /> {t('adminValidatorRegistrations.detail.stakingAmount')}
                  </p>
                  <p className="font-medium">{formatStake(selectedRegistration.stakeAmount)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{t('adminValidatorRegistrations.detail.tier')}:</p>
                <Badge className={TIER_CONFIG[selectedRegistration.tier as keyof typeof TIER_CONFIG]?.color || ''}>
                  {TIER_CONFIG[selectedRegistration.tier as keyof typeof TIER_CONFIG]?.label || selectedRegistration.tier}
                </Badge>
                <p className="text-sm text-muted-foreground ml-4">{t('adminValidatorRegistrations.detail.status')}:</p>
                <Badge className={statusConfig[selectedRegistration.status]?.color || ''}>
                  {statusConfig[selectedRegistration.status]?.label || selectedRegistration.status}
                </Badge>
              </div>

              {selectedRegistration.metadata?.hardware && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('adminValidatorRegistrations.detail.hardwareSpecs')}</p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p>{t('adminValidatorRegistrations.detail.cpu')}: {selectedRegistration.metadata.hardware.cpu || '-'}</p>
                    <p>{t('adminValidatorRegistrations.detail.memory')}: {selectedRegistration.metadata.hardware.memory || '-'}</p>
                    <p>{t('adminValidatorRegistrations.detail.storage')}: {selectedRegistration.metadata.hardware.storage || '-'}</p>
                  </div>
                </div>
              )}

              {selectedRegistration.rejectionReason && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> {t('adminValidatorRegistrations.detail.rejectionReason')}
                  </p>
                  <p className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
                    {selectedRegistration.rejectionReason}
                  </p>
                </div>
              )}

              {selectedRegistration.nodeId && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('adminValidatorRegistrations.detail.nodeId')}</p>
                  <p className="font-mono text-sm bg-muted/50 p-2 rounded">{selectedRegistration.nodeId}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              {t('adminValidatorRegistrations.detail.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('adminValidatorRegistrations.approve.title')}</DialogTitle>
            <DialogDescription>
              {t('adminValidatorRegistrations.approve.description')}
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p><span className="text-muted-foreground">{t('adminValidatorRegistrations.approve.nodeName')}</span> {selectedRegistration.operatorName}</p>
                <p><span className="text-muted-foreground">{t('adminValidatorRegistrations.approve.address')}</span> {selectedRegistration.operatorAddress.slice(0, 16)}...</p>
                <p><span className="text-muted-foreground">{t('adminValidatorRegistrations.approve.tier')}</span> {TIER_CONFIG[selectedRegistration.tier as keyof typeof TIER_CONFIG]?.label}</p>
              </div>

              {approvedApiKey && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg space-y-2">
                  <p className="text-emerald-500 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> {t('adminValidatorRegistrations.approve.apiKeyGenerated')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={approvedApiKey}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="input-api-key"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(approvedApiKey)}
                      data-testid="button-copy-api-key"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('adminValidatorRegistrations.approve.apiKeyWarning')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              {approvedApiKey ? t('adminValidatorRegistrations.approve.close') : t('adminValidatorRegistrations.approve.cancel')}
            </Button>
            {!approvedApiKey && (
              <Button 
                onClick={confirmApprove} 
                disabled={approveMutation.isPending}
                data-testid="button-confirm-approve"
              >
                {approveMutation.isPending ? t('adminValidatorRegistrations.approve.processing') : t('adminValidatorRegistrations.approve.confirm')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('adminValidatorRegistrations.reject.title')}</DialogTitle>
            <DialogDescription>
              {t('adminValidatorRegistrations.reject.description')}
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p><span className="text-muted-foreground">{t('adminValidatorRegistrations.reject.nodeName')}</span> {selectedRegistration.operatorName}</p>
                <p><span className="text-muted-foreground">{t('adminValidatorRegistrations.reject.address')}</span> {selectedRegistration.operatorAddress.slice(0, 16)}...</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('adminValidatorRegistrations.reject.reasonLabel')}</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('adminValidatorRegistrations.reject.reasonPlaceholder')}
                  className="min-h-[100px]"
                  data-testid="textarea-rejection-reason"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {t('adminValidatorRegistrations.reject.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject} 
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? t('adminValidatorRegistrations.reject.processing') : t('adminValidatorRegistrations.reject.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
