import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  RefreshCw,
  Save,
  Vote,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Percent,
  Timer,
  Calendar,
  Lock,
  Download,
} from "lucide-react";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";

interface GovParamsData {
  voting: {
    quorumPercentage: number;
    approvalThreshold: number;
    defaultVotingPeriod: number;
    minimumVotingPeriod: number;
    tokenWeightedVoting: boolean;
    includeStakedTokens: boolean;
    delegatedVoting: boolean;
  };
  proposals: {
    minimumThreshold: number;
    proposalDeposit: number;
    allowEditing: boolean;
    allowCancellation: boolean;
    categories: string[];
  };
  execution: {
    timelockPeriod: number;
    executionWindow: number;
    multiSigRequired: boolean;
    autoExecution: boolean;
  };
  security: {
    emergencyPause: boolean;
    vetoPower: boolean;
    guardianAddress: string;
  };
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading,
  bgColor = "bg-primary/10",
  iconColor = "text-primary",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId: string;
}) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground"
  };

  if (isLoading) {
    return (
      <Card data-testid={testId}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeColors[changeType]}`}>{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function GovParams() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("voting");
  const [quorumPercentage, setQuorumPercentage] = useState([30]);
  const [approvalThreshold, setApprovalThreshold] = useState([66]);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<GovParamsData>({
    queryKey: ['/api/admin/governance/params'],
    refetchInterval: 60000,
  });

  const updateParamsMutation = useMutation({
    mutationFn: async (params: Partial<GovParamsData>) => {
      const response = await apiRequest("PUT", "/api/admin/governance/params", params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/governance/params'] });
      setShowSaveConfirm(false);
      toast({
        title: t("adminGovParams.saved"),
        description: t("adminGovParams.savedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminGovParams.error"),
        description: t("adminGovParams.saveError"),
        variant: "destructive",
      });
    },
  });

  const resetParamsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/governance/params/reset");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/governance/params'] });
      setShowResetConfirm(false);
      setQuorumPercentage([30]);
      setApprovalThreshold([66]);
      toast({
        title: t("adminGovParams.resetSuccess"),
        description: t("adminGovParams.resetSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminGovParams.error"),
        description: t("adminGovParams.resetError"),
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminGovParams.refreshed"),
      description: t("adminGovParams.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const confirmSave = useCallback(() => {
    updateParamsMutation.mutate({
      voting: {
        quorumPercentage: quorumPercentage[0],
        approvalThreshold: approvalThreshold[0],
        defaultVotingPeriod: 7,
        minimumVotingPeriod: 3,
        tokenWeightedVoting: true,
        includeStakedTokens: true,
        delegatedVoting: true,
      },
    });
  }, [quorumPercentage, approvalThreshold, updateParamsMutation]);

  const confirmReset = useCallback(() => {
    resetParamsMutation.mutate();
  }, [resetParamsMutation]);

  const handleExport = useCallback(() => {
    const exportData = {
      quorumPercentage: quorumPercentage[0],
      approvalThreshold: approvalThreshold[0],
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gov_params_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t("adminGovParams.exported"),
      description: t("adminGovParams.exportedDesc"),
    });
  }, [quorumPercentage, approvalThreshold, toast, t]);

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="gov-params-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("adminGovParams.loadError")}</span>
              </div>
              <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminGovParams.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="gov-params-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-gov-params-title">
              <Settings className="h-8 w-8" />
              {t("adminGovParams.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-gov-params-subtitle">
              {t("adminGovParams.subtitleKo")} | {t("adminGovParams.subtitleEn")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminGovParams.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminGovParams.refresh")}
            </Button>
            <Button 
              onClick={() => setShowSaveConfirm(true)} 
              disabled={updateParamsMutation.isPending}
              data-testid="button-save"
            >
              {updateParamsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("adminGovParams.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            label={t("adminGovParams.quorum")}
            value="5%"
            change="500M TBURN minimum (10B supply)"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-primary/10"
            iconColor="text-primary"
            testId="card-quorum"
          />
          <MetricCard
            icon={Percent}
            label={t("adminGovParams.approvalThreshold")}
            value="66%"
            change="Supermajority for governance"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="card-approval"
          />
          <MetricCard
            icon={Clock}
            label={t("adminGovParams.votingPeriod")}
            value={t("adminGovParams.days", { count: 7 })}
            change="Standard voting window"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-voting-period"
          />
          <MetricCard
            icon={Timer}
            label={t("adminGovParams.timelock")}
            value={t("adminGovParams.hours", { count: 48 })}
            change="Security review period"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-yellow-500/10"
            iconColor="text-yellow-500"
            testId="card-timelock"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-gov-params">
            <TabsTrigger value="voting" data-testid="tab-voting">{t("adminGovParams.voting")}</TabsTrigger>
            <TabsTrigger value="proposals" data-testid="tab-proposals">{t("adminGovParams.proposals")}</TabsTrigger>
            <TabsTrigger value="execution" data-testid="tab-execution">{t("adminGovParams.execution")}</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">{t("adminGovParams.security")}</TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="space-y-6">
            <Card data-testid="card-voting-params">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  {t("adminGovParams.votingParameters")}
                </CardTitle>
                <CardDescription>{t("adminGovParams.votingParametersDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{t("adminGovParams.quorumPercentage")}</Label>
                        <span className="text-sm text-muted-foreground" data-testid="text-quorum-value">{quorumPercentage[0]}%</span>
                      </div>
                      <Slider
                        value={quorumPercentage}
                        onValueChange={setQuorumPercentage}
                        min={10}
                        max={50}
                        step={5}
                        data-testid="slider-quorum"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("adminGovParams.quorumPercentageDesc")}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{t("adminGovParams.approvalThreshold")}</Label>
                        <span className="text-sm text-muted-foreground" data-testid="text-approval-value">{approvalThreshold[0]}%</span>
                      </div>
                      <Slider
                        value={approvalThreshold}
                        onValueChange={setApprovalThreshold}
                        min={50}
                        max={80}
                        step={1}
                        data-testid="slider-approval"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("adminGovParams.approvalThresholdDesc")}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("adminGovParams.defaultVotingPeriod")}</Label>
                        <Select defaultValue="7">
                          <SelectTrigger data-testid="select-default-period">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">{t("adminGovParams.daysOption", { count: 3 })}</SelectItem>
                            <SelectItem value="5">{t("adminGovParams.daysOption", { count: 5 })}</SelectItem>
                            <SelectItem value="7">{t("adminGovParams.daysOption", { count: 7 })}</SelectItem>
                            <SelectItem value="14">{t("adminGovParams.daysOption", { count: 14 })}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminGovParams.minimumVotingPeriod")}</Label>
                        <Select defaultValue="3">
                          <SelectTrigger data-testid="select-min-period">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">{t("adminGovParams.dayOption", { count: 1 })}</SelectItem>
                            <SelectItem value="2">{t("adminGovParams.daysOption", { count: 2 })}</SelectItem>
                            <SelectItem value="3">{t("adminGovParams.daysOption", { count: 3 })}</SelectItem>
                            <SelectItem value="5">{t("adminGovParams.daysOption", { count: 5 })}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-voting-power">
              <CardHeader>
                <CardTitle>{t("adminGovParams.votingPower")}</CardTitle>
                <CardDescription>{t("adminGovParams.votingPowerDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between" data-testid="switch-token-weighted">
                      <div>
                        <p className="font-medium">{t("adminGovParams.tokenWeightedVoting")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.tokenWeightedVotingDesc")}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between" data-testid="switch-staked-tokens">
                      <div>
                        <p className="font-medium">{t("adminGovParams.includeStakedTokens")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.includeStakedTokensDesc")}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between" data-testid="switch-delegated-voting">
                      <div>
                        <p className="font-medium">{t("adminGovParams.delegatedVoting")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.delegatedVotingDesc")}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card data-testid="card-proposal-settings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("adminGovParams.proposalSettings")}
                </CardTitle>
                <CardDescription>{t("adminGovParams.proposalSettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("adminGovParams.minimumProposalThreshold")}</Label>
                        <Input type="number" defaultValue="100000" data-testid="input-min-threshold" />
                        <p className="text-xs text-muted-foreground">
                          {t("adminGovParams.minimumProposalThresholdDesc")}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminGovParams.proposalDeposit")}</Label>
                        <Input type="number" defaultValue="10000" data-testid="input-deposit" />
                        <p className="text-xs text-muted-foreground">
                          {t("adminGovParams.proposalDepositDesc")}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between" data-testid="switch-proposal-editing">
                      <div>
                        <p className="font-medium">{t("adminGovParams.proposalEditing")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.proposalEditingDesc")}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between" data-testid="switch-proposal-cancellation">
                      <div>
                        <p className="font-medium">{t("adminGovParams.proposalCancellation")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.proposalCancellationDesc")}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>{t("adminGovParams.proposalCategories")}</Label>
                      <div className="flex flex-wrap gap-2" data-testid="categories-list">
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">{t("adminGovParams.categoryNetwork")}</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">{t("adminGovParams.categoryEconomics")}</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">{t("adminGovParams.categoryBridge")}</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">{t("adminGovParams.categoryStaking")}</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">{t("adminGovParams.categoryAI")}</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">{t("adminGovParams.categorySecurity")}</span>
                        <Button variant="outline" size="sm" data-testid="button-add-category">+ {t("adminGovParams.addCategory")}</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <Card data-testid="card-execution-settings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  {t("adminGovParams.executionSettings")}
                </CardTitle>
                <CardDescription>{t("adminGovParams.executionSettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("adminGovParams.timelockPeriod")}</Label>
                        <Select defaultValue="48">
                          <SelectTrigger data-testid="select-timelock">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">{t("adminGovParams.hoursOption", { count: 24 })}</SelectItem>
                            <SelectItem value="48">{t("adminGovParams.hoursOption", { count: 48 })}</SelectItem>
                            <SelectItem value="72">{t("adminGovParams.hoursOption", { count: 72 })}</SelectItem>
                            <SelectItem value="168">{t("adminGovParams.daysOption", { count: 7 })}</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {t("adminGovParams.timelockPeriodDesc")}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminGovParams.executionWindow")}</Label>
                        <Select defaultValue="14">
                          <SelectTrigger data-testid="select-execution-window">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">{t("adminGovParams.daysOption", { count: 7 })}</SelectItem>
                            <SelectItem value="14">{t("adminGovParams.daysOption", { count: 14 })}</SelectItem>
                            <SelectItem value="30">{t("adminGovParams.daysOption", { count: 30 })}</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {t("adminGovParams.executionWindowDesc")}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between" data-testid="switch-multi-sig">
                      <div>
                        <p className="font-medium">{t("adminGovParams.multiSigExecution")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.multiSigExecutionDesc")}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between" data-testid="switch-auto-execution">
                      <div>
                        <p className="font-medium">{t("adminGovParams.automaticExecution")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.automaticExecutionDesc")}</p>
                      </div>
                      <Switch />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card data-testid="card-security-settings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("adminGovParams.securitySettings")}
                </CardTitle>
                <CardDescription>{t("adminGovParams.securitySettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between" data-testid="switch-emergency-pause">
                      <div>
                        <p className="font-medium">{t("adminGovParams.emergencyPause")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.emergencyPauseDesc")}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between" data-testid="switch-veto-power">
                      <div>
                        <p className="font-medium">{t("adminGovParams.vetoPower")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.vetoPowerDesc")}</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>{t("adminGovParams.guardianAddress")}</Label>
                      <Input defaultValue="0x1234...5678" placeholder={t("adminGovParams.guardianAddressPlaceholder")} data-testid="input-guardian-address" />
                      <p className="text-xs text-muted-foreground">
                        {t("adminGovParams.guardianAddressDesc")}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-security-alerts">
              <CardHeader>
                <CardTitle>{t("adminGovParams.securityAlerts")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10" data-testid="alert-multi-sig">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{t("adminGovParams.multiSigProtectionEnabled")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.multiSigProtectionEnabledDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10" data-testid="alert-timelock">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{t("adminGovParams.timelockActive")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminGovParams.timelockActiveDesc")}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmationDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title={t("adminGovParams.confirmSave.title")}
        description={t("adminGovParams.confirmSave.description")}
        confirmText={t("adminGovParams.saveChanges")}
        onConfirm={confirmSave}
        isLoading={updateParamsMutation.isPending}
      />

      <ConfirmationDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title={t("adminGovParams.confirmReset.title")}
        description={t("adminGovParams.confirmReset.description")}
        confirmText={t("adminGovParams.resetToDefaults")}
        onConfirm={confirmReset}
        destructive={true}
        isLoading={resetParamsMutation.isPending}
      />
    </div>
  );
}
