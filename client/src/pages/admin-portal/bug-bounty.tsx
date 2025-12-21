import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Shield,
  Eye,
  FileText,
  User,
  Mail,
  Wallet,
  Calendar,
  Target,
  Award,
} from "lucide-react";
import { format } from "date-fns";

interface BugBountyReport {
  id: string;
  reporterEmail?: string;
  reporterWallet?: string;
  reporterName?: string;
  title: string;
  description: string;
  reproductionSteps?: string;
  assetTarget: string;
  reportedSeverity: string;
  confirmedSeverity?: string;
  status: string;
  rewardUsd?: number;
  rewardTokenAmount?: string;
  rewardTxHash?: string;
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  reviewedAt?: string;
  paidAt?: string;
}

interface BugBountyStats {
  totalReports: number;
  pendingReports: number;
  acceptedReports: number;
  totalPaidUsd: number;
  severityDistribution?: Record<string, number>;
  reportsLast30Days?: number;
  averageResolutionTime?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-rose-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
  informational: "bg-slate-500 text-white",
};

const SEVERITY_REWARDS: Record<string, string> = {
  critical: "$1,000,000",
  high: "$50,000",
  medium: "$10,000",
  low: "$2,000",
  informational: "$500",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  reviewing: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  accepted: "bg-green-500/20 text-green-500 border-green-500/30",
  rejected: "bg-red-500/20 text-red-500 border-red-500/30",
  duplicate: "bg-gray-500/20 text-gray-500 border-gray-500/30",
  paid: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
};

export default function AdminBugBounty() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BugBountyReport | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    confirmedSeverity: "",
    rewardUsd: "",
    rewardTokenAmount: "",
    rewardTxHash: "",
    adminNotes: "",
    assignedTo: "",
  });

  const { data: stats, isLoading: statsLoading } = useQuery<BugBountyStats>({
    queryKey: ["/api/admin/bug-bounty/dashboard"],
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const { data: reports, isLoading: reportsLoading, refetch } = useQuery<BugBountyReport[]>({
    queryKey: activeTab === "all" 
      ? ["/api/admin/bug-bounty"]
      : ["/api/admin/bug-bounty", `status=${activeTab}`],
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<BugBountyReport> }) => {
      return apiRequest("PATCH", `/api/admin/bug-bounty/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/admin/bug-bounty');
        }
      });
      setSelectedReport(null);
      toast({
        title: t('adminBugBounty.reportUpdated', 'Report Updated'),
        description: t('adminBugBounty.reportUpdatedDesc', 'The bug bounty report has been updated successfully.'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('adminBugBounty.updateFailed', 'Update Failed'),
        description: error.message || t('adminBugBounty.updateFailedDesc', 'Failed to update the report.'),
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({
      title: t('adminBugBounty.refreshed', 'Refreshed'),
      description: t('adminBugBounty.refreshedDesc', 'Bug bounty data has been refreshed.'),
    });
  }, [refetch, toast]);

  const handleOpenReport = (report: BugBountyReport) => {
    setSelectedReport(report);
    setEditForm({
      status: report.status,
      confirmedSeverity: report.confirmedSeverity || report.reportedSeverity,
      rewardUsd: report.rewardUsd?.toString() || "",
      rewardTokenAmount: report.rewardTokenAmount || "",
      rewardTxHash: report.rewardTxHash || "",
      adminNotes: report.adminNotes || "",
      assignedTo: report.assignedTo || "",
    });
  };

  const handleSaveReport = () => {
    if (!selectedReport) return;
    
    const updates: Record<string, unknown> = {};
    if (editForm.status !== selectedReport.status) updates.status = editForm.status;
    if (editForm.confirmedSeverity !== (selectedReport.confirmedSeverity || selectedReport.reportedSeverity)) {
      updates.confirmedSeverity = editForm.confirmedSeverity;
    }
    if (editForm.rewardUsd && editForm.rewardUsd !== (selectedReport.rewardUsd?.toString() || "")) {
      updates.rewardUsd = parseInt(editForm.rewardUsd);
    }
    if (editForm.rewardTokenAmount !== (selectedReport.rewardTokenAmount || "")) {
      updates.rewardTokenAmount = editForm.rewardTokenAmount;
    }
    if (editForm.rewardTxHash !== (selectedReport.rewardTxHash || "")) {
      updates.rewardTxHash = editForm.rewardTxHash;
    }
    if (editForm.adminNotes !== (selectedReport.adminNotes || "")) {
      updates.adminNotes = editForm.adminNotes;
    }
    if (editForm.assignedTo !== (selectedReport.assignedTo || "")) {
      updates.assignedTo = editForm.assignedTo;
    }

    if (Object.keys(updates).length === 0) {
      toast({
        title: t('adminBugBounty.noChanges', 'No Changes'),
        description: t('adminBugBounty.noChangesDesc', 'No changes were made to the report.'),
      });
      return;
    }

    updateMutation.mutate({ id: selectedReport.id, updates: updates as Partial<BugBountyReport> });
  };

  const filteredReports = reports || [];

  const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: typeof Bug; color: string }) => (
    <Card className="glass-panel">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color} opacity-70`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-rose-500" />
          <div>
            <h1 className="text-2xl font-bold">{t('adminBugBounty.title', 'Bug Bounty Management')}</h1>
            <p className="text-sm text-muted-foreground">{t('adminBugBounty.subtitle', 'Review and manage vulnerability reports')}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh-bounty"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard 
              title={t('adminBugBounty.totalReports', 'Total Reports')} 
              value={stats?.totalReports || 0} 
              icon={Bug} 
              color="text-blue-500" 
            />
            <MetricCard 
              title={t('adminBugBounty.pendingReview', 'Pending Review')} 
              value={stats?.pendingReports || 0} 
              icon={Clock} 
              color="text-yellow-500" 
            />
            <MetricCard 
              title={t('adminBugBounty.accepted', 'Accepted')} 
              value={stats?.acceptedReports || 0} 
              icon={CheckCircle} 
              color="text-green-500" 
            />
            <MetricCard 
              title={t('adminBugBounty.totalPaid', 'Total Paid')} 
              value={`$${(stats?.totalPaidUsd || 0).toLocaleString()}`} 
              icon={DollarSign} 
              color="text-emerald-500" 
            />
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">{t('adminBugBounty.tabs.all', 'All Reports')}</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">{t('adminBugBounty.tabs.pending', 'Pending')}</TabsTrigger>
          <TabsTrigger value="reviewing" data-testid="tab-reviewing">{t('adminBugBounty.tabs.reviewing', 'Reviewing')}</TabsTrigger>
          <TabsTrigger value="accepted" data-testid="tab-accepted">{t('adminBugBounty.tabs.accepted', 'Accepted')}</TabsTrigger>
          <TabsTrigger value="paid" data-testid="tab-paid">{t('adminBugBounty.tabs.paid', 'Paid')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {activeTab === "all" 
                  ? t('adminBugBounty.tabs.all', 'All Reports') 
                  : t(`adminBugBounty.tabs.${activeTab}Reports`, `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports`)}
                <Badge variant="secondary" className="ml-2">{filteredReports.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {reportsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bug className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('adminBugBounty.noReportsFound', 'No reports found in this category')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleOpenReport(report)}
                        data-testid={`report-row-${report.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={SEVERITY_COLORS[report.confirmedSeverity || report.reportedSeverity]}>
                                {(report.confirmedSeverity || report.reportedSeverity).toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className={STATUS_COLORS[report.status]}>
                                {report.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                #{report.id.slice(0, 8)}
                              </span>
                            </div>
                            <h4 className="font-semibold truncate">{report.title}</h4>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {report.description.slice(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {report.assetTarget}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(report.createdAt), "MMM d, yyyy")}
                              </span>
                              {report.reporterEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {report.reporterEmail}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" data-testid={`view-report-${report.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-500" />
              {t('adminBugBounty.reportDetails', 'Report Details')}
            </SheetTitle>
            <SheetDescription>
              {t('adminBugBounty.reviewAndUpdate', 'Review and update the bug bounty report')}
            </SheetDescription>
          </SheetHeader>

          {selectedReport && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{selectedReport.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={SEVERITY_COLORS[selectedReport.confirmedSeverity || selectedReport.reportedSeverity]}>
                    {(selectedReport.confirmedSeverity || selectedReport.reportedSeverity).toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={STATUS_COLORS[selectedReport.status]}>
                    {selectedReport.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">#{selectedReport.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('adminBugBounty.asset', 'Asset')}:</span>
                  <span className="font-medium">{selectedReport.assetTarget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('adminBugBounty.maxReward', 'Max Reward')}:</span>
                  <span className="font-medium">{SEVERITY_REWARDS[selectedReport.confirmedSeverity || selectedReport.reportedSeverity]}</span>
                </div>
                {selectedReport.reporterEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('adminBugBounty.email', 'Email')}:</span>
                    <span className="font-medium">{selectedReport.reporterEmail}</span>
                  </div>
                )}
                {selectedReport.reporterWallet && (
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('adminBugBounty.wallet', 'Wallet')}:</span>
                    <span className="font-medium font-mono text-xs">{selectedReport.reporterWallet.slice(0, 16)}...</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('adminBugBounty.submitted', 'Submitted')}:</span>
                  <span className="font-medium">{format(new Date(selectedReport.createdAt), "PPp")}</span>
                </div>
                {selectedReport.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('adminBugBounty.reviewed', 'Reviewed')}:</span>
                    <span className="font-medium">{format(new Date(selectedReport.reviewedAt), "PPp")}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">{t('adminBugBounty.description', 'Description')}</h4>
                <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {selectedReport.description}
                </div>
              </div>

              {selectedReport.reproductionSteps && (
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('adminBugBounty.reproductionSteps', 'Reproduction Steps')}</h4>
                  <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedReport.reproductionSteps}
                  </div>
                </div>
              )}

              <div className="border-t pt-6 space-y-4">
                <h4 className="font-semibold">{t('adminBugBounty.updateReport', 'Update Report')}</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('adminBugBounty.status', 'Status')}</label>
                    <Select 
                      value={editForm.status} 
                      onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('adminBugBounty.statusPending', 'Pending')}</SelectItem>
                        <SelectItem value="reviewing">{t('adminBugBounty.statusReviewing', 'Reviewing')}</SelectItem>
                        <SelectItem value="accepted">{t('adminBugBounty.statusAccepted', 'Accepted')}</SelectItem>
                        <SelectItem value="rejected">{t('adminBugBounty.statusRejected', 'Rejected')}</SelectItem>
                        <SelectItem value="duplicate">{t('adminBugBounty.statusDuplicate', 'Duplicate')}</SelectItem>
                        <SelectItem value="paid">{t('adminBugBounty.statusPaid', 'Paid')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('adminBugBounty.confirmedSeverity', 'Confirmed Severity')}</label>
                    <Select 
                      value={editForm.confirmedSeverity} 
                      onValueChange={(v) => setEditForm({ ...editForm, confirmedSeverity: v })}
                    >
                      <SelectTrigger data-testid="select-severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">{t('adminBugBounty.severityCritical', 'Critical')}</SelectItem>
                        <SelectItem value="high">{t('adminBugBounty.severityHigh', 'High')}</SelectItem>
                        <SelectItem value="medium">{t('adminBugBounty.severityMedium', 'Medium')}</SelectItem>
                        <SelectItem value="low">{t('adminBugBounty.severityLow', 'Low')}</SelectItem>
                        <SelectItem value="informational">{t('adminBugBounty.severityInformational', 'Informational')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('adminBugBounty.rewardUsd', 'Reward (USD)')}</label>
                    <Input 
                      type="number" 
                      placeholder={t('adminBugBounty.rewardPlaceholder', 'e.g. 50000')}
                      value={editForm.rewardUsd}
                      onChange={(e) => setEditForm({ ...editForm, rewardUsd: e.target.value })}
                      data-testid="input-reward-usd"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('adminBugBounty.rewardTburn', 'Reward (TBURN)')}</label>
                    <Input 
                      placeholder={t('adminBugBounty.rewardTburnPlaceholder', 'e.g. 100000')}
                      value={editForm.rewardTokenAmount}
                      onChange={(e) => setEditForm({ ...editForm, rewardTokenAmount: e.target.value })}
                      data-testid="input-reward-tburn"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">{t('adminBugBounty.paymentTxHash', 'Payment TX Hash')}</label>
                  <Input 
                    placeholder={t('adminBugBounty.txHashPlaceholder', '0x...')}
                    value={editForm.rewardTxHash}
                    onChange={(e) => setEditForm({ ...editForm, rewardTxHash: e.target.value })}
                    data-testid="input-tx-hash"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">{t('adminBugBounty.assignedTo', 'Assigned To')}</label>
                  <Input 
                    placeholder={t('adminBugBounty.assignedToPlaceholder', 'Security team member')}
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    data-testid="input-assigned-to"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">{t('adminBugBounty.adminNotes', 'Admin Notes')}</label>
                  <Textarea 
                    rows={3}
                    placeholder={t('adminBugBounty.adminNotesPlaceholder', 'Internal notes about this report...')}
                    value={editForm.adminNotes}
                    onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                    data-testid="textarea-admin-notes"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleSaveReport}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-report"
                  >
                    {updateMutation.isPending ? t('adminBugBounty.saving', 'Saving...') : t('adminBugBounty.saveChanges', 'Save Changes')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedReport(null)}
                    data-testid="button-cancel"
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
