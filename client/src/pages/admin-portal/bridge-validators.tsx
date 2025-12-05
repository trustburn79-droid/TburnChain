import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Shield, Users, CheckCircle, AlertTriangle, Clock, 
  Activity, TrendingUp, Key, RefreshCw, Download, AlertCircle, Plus, Eye
} from "lucide-react";

interface ValidatorStats {
  total: number;
  active: number;
  inactive: number;
  slashed: number;
  quorum: string;
}

interface Validator {
  id: number;
  name: string;
  address: string;
  stake: string;
  status: "active" | "inactive" | "slashed";
  uptime: number;
  signatures: number;
  chains: string[];
}

interface SignatureHistory {
  id: number;
  transfer: string;
  validators: number;
  required: number;
  time: string;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-12 mt-1" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table data-testid="table-skeleton">
      <TableHeader>
        <TableRow>
          {Array.from({ length: 7 }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 7 }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminBridgeValidators() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addValidatorOpen, setAddValidatorOpen] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "deactivate" | "slash" | null>(null);

  const { data: statsData, isLoading: loadingStats, error, refetch: refetchStats } = useQuery<ValidatorStats>({
    queryKey: ["/api/admin/bridge/validators/stats"],
    refetchInterval: 30000,
  });

  const { data: validatorsData, isLoading: loadingValidators, refetch: refetchValidators } = useQuery<{ validators: Validator[] }>({
    queryKey: ["/api/admin/bridge/validators"],
    refetchInterval: 30000,
  });

  const { data: signaturesData, isLoading: loadingSignatures, refetch: refetchSignatures } = useQuery<{ signatures: SignatureHistory[] }>({
    queryKey: ["/api/admin/bridge/signatures"],
    refetchInterval: 15000,
  });

  const manageValidatorMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "activate" | "deactivate" | "slash" }) => {
      const res = await apiRequest("POST", `/api/admin/bridge/validators/${id}/${action}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/validators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bridge/validators/stats"] });
      toast({
        title: t("adminBridgeValidators.actionSuccess"),
        description: t("adminBridgeValidators.actionSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminBridgeValidators.actionError"),
        description: t("adminBridgeValidators.actionErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchValidators(),
        refetchSignatures(),
      ]);
      toast({
        title: t("adminBridgeValidators.refreshSuccess"),
        description: t("adminBridgeValidators.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminBridgeValidators.refreshError"),
        description: t("adminBridgeValidators.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }
  }, [refetchStats, refetchValidators, refetchSignatures, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: validatorStats,
      validators: validators,
      signatureHistory: signatureHistory,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge-validators-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminBridgeValidators.exportSuccess"),
      description: t("adminBridgeValidators.exportSuccessDesc"),
    });
  }, [toast, t]);

  const validatorStats = useMemo(() => {
    if (statsData) return statsData;
    return {
      total: 56,
      active: 48,
      inactive: 5,
      slashed: 3,
      quorum: "8/8",
    };
  }, [statsData]);

  const validators = useMemo(() => {
    if (validatorsData?.validators) return validatorsData.validators;
    return [
      { id: 1, name: "Bridge Validator 1", address: "0x1234...5678", stake: "500,000 TBURN", status: "active" as const, uptime: 99.98, signatures: 12450, chains: ["ETH", "BSC", "MATIC"] },
      { id: 2, name: "Bridge Validator 2", address: "0x2345...6789", stake: "450,000 TBURN", status: "active" as const, uptime: 99.95, signatures: 12380, chains: ["ETH", "AVAX", "ARB"] },
      { id: 3, name: "Bridge Validator 3", address: "0x3456...7890", stake: "420,000 TBURN", status: "active" as const, uptime: 99.92, signatures: 12290, chains: ["BSC", "OP", "BASE"] },
      { id: 4, name: "Bridge Validator 4", address: "0x4567...8901", stake: "400,000 TBURN", status: "inactive" as const, uptime: 85.50, signatures: 10500, chains: ["ETH", "MATIC"] },
      { id: 5, name: "Bridge Validator 5", address: "0x5678...9012", stake: "380,000 TBURN", status: "slashed" as const, uptime: 70.20, signatures: 8900, chains: ["BSC"] },
    ];
  }, [validatorsData]);

  const signatureHistory = useMemo(() => {
    if (signaturesData?.signatures) return signaturesData.signatures;
    return [
      { id: 1, transfer: "0xabc...123", validators: 8, required: 8, time: "2 min ago" },
      { id: 2, transfer: "0xdef...456", validators: 8, required: 8, time: "5 min ago" },
      { id: 3, transfer: "0xghi...789", validators: 6, required: 8, time: "8 min ago" },
    ];
  }, [signaturesData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500" data-testid="badge-status-active">{t("adminBridgeValidators.active")}</Badge>;
      case "inactive":
        return <Badge variant="secondary" data-testid="badge-status-inactive">{t("adminBridgeValidators.inactive")}</Badge>;
      case "slashed":
        return <Badge variant="destructive" data-testid="badge-status-slashed">{t("adminBridgeValidators.slashed")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewValidator = (validator: Validator) => {
    setSelectedValidator(validator);
    setDetailOpen(true);
  };

  const handleActionClick = (validator: Validator, action: "activate" | "deactivate" | "slash") => {
    setSelectedValidator(validator);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = useCallback(() => {
    if (selectedValidator && actionType) {
      manageValidatorMutation.mutate({ id: selectedValidator.id, action: actionType });
    }
    setActionDialogOpen(false);
  }, [selectedValidator, actionType, manageValidatorMutation]);

  const getValidatorDetailSections = (validator: Validator): DetailSection[] => {
    return [
      {
        title: t("adminBridgeValidators.detail.basicInfo"),
        fields: [
          { label: t("adminBridgeValidators.detail.name"), value: validator.name, type: "text" as const },
          { label: t("adminBridgeValidators.detail.address"), value: validator.address, type: "code" as const, copyable: true },
          { label: t("adminBridgeValidators.detail.status"), value: validator.status, type: "status" as const },
        ],
      },
      {
        title: t("adminBridgeValidators.detail.performance"),
        fields: [
          { label: t("adminBridgeValidators.detail.uptime"), value: `${validator.uptime}%`, type: "progress" as const },
          { label: t("adminBridgeValidators.detail.signatures"), value: validator.signatures.toLocaleString(), type: "text" as const },
        ],
      },
      {
        title: t("adminBridgeValidators.detail.staking"),
        fields: [
          { label: t("adminBridgeValidators.detail.stakeAmount"), value: validator.stake, type: "text" as const },
          { label: t("adminBridgeValidators.detail.supportedChains"), value: validator.chains.join(", "), type: "badge" as const },
        ],
      },
    ];
  };

  const getActionDialogConfig = () => {
    if (!actionType) return { title: "", description: "", destructive: false };
    
    const configs = {
      activate: {
        title: t("adminBridgeValidators.confirm.activateTitle"),
        description: t("adminBridgeValidators.confirm.activateDescription", { name: selectedValidator?.name || "" }),
        destructive: false,
      },
      deactivate: {
        title: t("adminBridgeValidators.confirm.deactivateTitle"),
        description: t("adminBridgeValidators.confirm.deactivateDescription", { name: selectedValidator?.name || "" }),
        destructive: true,
      },
      slash: {
        title: t("adminBridgeValidators.confirm.slashTitle"),
        description: t("adminBridgeValidators.confirm.slashDescription", { name: selectedValidator?.name || "" }),
        destructive: true,
      },
    };
    return configs[actionType];
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="validators-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminBridgeValidators.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminBridgeValidators.error.description")}</p>
            <Button onClick={() => refetchStats()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminBridgeValidators.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="bridge-validators">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminBridgeValidators.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminBridgeValidators.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminBridgeValidators.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminBridgeValidators.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleExport} data-testid="button-export">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("adminBridgeValidators.export")}</TooltipContent>
                </Tooltip>
                <Button data-testid="button-add-validator" onClick={() => setAddValidatorOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("adminBridgeValidators.addValidator")}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4" data-testid="stats-grid">
            {loadingStats ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card data-testid="card-total-validators">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridgeValidators.total")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-total">{validatorStats.total}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-active-validators">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridgeValidators.active")}</span>
                    </div>
                    <div className="text-3xl font-bold text-green-500" data-testid="text-active">{validatorStats.active}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-inactive-validators">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridgeValidators.inactive")}</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-500" data-testid="text-inactive">{validatorStats.inactive}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-slashed-validators">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridgeValidators.slashed")}</span>
                    </div>
                    <div className="text-3xl font-bold text-red-500" data-testid="text-slashed">{validatorStats.slashed}</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-quorum">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">{t("adminBridgeValidators.quorum")}</span>
                    </div>
                    <div className="text-3xl font-bold" data-testid="text-quorum">{validatorStats.quorum}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Tabs defaultValue="validators" className="space-y-4" data-testid="validators-tabs">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="validators" data-testid="tab-validators">
                <Users className="w-4 h-4 mr-2" />
                {t("adminBridgeValidators.validators")}
              </TabsTrigger>
              <TabsTrigger value="signatures" data-testid="tab-signatures">
                <Key className="w-4 h-4 mr-2" />
                {t("adminBridgeValidators.signatures")}
              </TabsTrigger>
              <TabsTrigger value="performance" data-testid="tab-performance">
                <Activity className="w-4 h-4 mr-2" />
                {t("adminBridgeValidators.performance")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="validators" data-testid="tab-content-validators">
              <Card data-testid="card-validators-list">
                <CardHeader>
                  <CardTitle>{t("adminBridgeValidators.validatorList")}</CardTitle>
                  <CardDescription>{t("adminBridgeValidators.validatorListDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingValidators ? (
                    <TableSkeleton rows={5} />
                  ) : (
                    <Table data-testid="table-validators">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminBridgeValidators.validator")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.stake")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.status")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.uptime")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.signatures")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.chains")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validators.map((validator) => (
                          <TableRow key={validator.id} data-testid={`row-validator-${validator.id}`}>
                            <TableCell>
                              <div>
                                <p className="font-medium" data-testid={`text-validator-name-${validator.id}`}>{validator.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{validator.address}</p>
                              </div>
                            </TableCell>
                            <TableCell data-testid={`text-stake-${validator.id}`}>{validator.stake}</TableCell>
                            <TableCell>{getStatusBadge(validator.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={validator.uptime} className="w-16" data-testid={`progress-uptime-${validator.id}`} />
                                <span className={validator.uptime >= 99 ? "text-green-500" : validator.uptime >= 90 ? "text-yellow-500" : "text-red-500"} data-testid={`text-uptime-${validator.id}`}>
                                  {validator.uptime}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell data-testid={`text-signatures-${validator.id}`}>{validator.signatures.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {validator.chains.map((chain, index) => (
                                  <Badge key={index} variant="outline" className="text-xs" data-testid={`badge-chain-${validator.id}-${chain}`}>{chain}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  data-testid={`button-view-${validator.id}`}
                                  onClick={() => handleViewValidator(validator)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {validator.status === "active" ? (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    data-testid={`button-deactivate-${validator.id}`}
                                    onClick={() => handleActionClick(validator, "deactivate")}
                                    disabled={manageValidatorMutation.isPending}
                                  >
                                    {t("adminBridgeValidators.deactivate")}
                                  </Button>
                                ) : validator.status === "inactive" ? (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    data-testid={`button-activate-${validator.id}`}
                                    onClick={() => handleActionClick(validator, "activate")}
                                    disabled={manageValidatorMutation.isPending}
                                  >
                                    {t("adminBridgeValidators.activate")}
                                  </Button>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signatures" data-testid="tab-content-signatures">
              <Card data-testid="card-signatures">
                <CardHeader>
                  <CardTitle>{t("adminBridgeValidators.recentSignatures")}</CardTitle>
                  <CardDescription>{t("adminBridgeValidators.recentSignaturesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSignatures ? (
                    <TableSkeleton rows={3} />
                  ) : (
                    <Table data-testid="table-signatures">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminBridgeValidators.transfer")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.signatures")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.status")}</TableHead>
                          <TableHead>{t("adminBridgeValidators.time")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {signatureHistory.map((sig) => (
                          <TableRow key={sig.id} data-testid={`row-signature-${sig.id}`}>
                            <TableCell className="font-mono" data-testid={`text-transfer-${sig.id}`}>{sig.transfer}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={(sig.validators / sig.required) * 100} className="w-20" data-testid={`progress-signatures-${sig.id}`} />
                                <span data-testid={`text-sig-count-${sig.id}`}>{sig.validators}/{sig.required}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {sig.validators >= sig.required ? (
                                <Badge className="bg-green-500" data-testid={`badge-sig-complete-${sig.id}`}>{t("adminBridgeValidators.complete")}</Badge>
                              ) : (
                                <Badge variant="secondary" data-testid={`badge-sig-collecting-${sig.id}`}>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  {t("adminBridgeValidators.collecting")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`text-time-${sig.id}`}>{sig.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" data-testid="tab-content-performance">
              <div className="grid grid-cols-2 gap-4">
                <Card data-testid="card-validator-performance">
                  <CardHeader>
                    <CardTitle>{t("adminBridgeValidators.validatorPerformance")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>{t("adminBridgeValidators.avgUptime")}</span>
                          <span className="font-medium text-green-500" data-testid="text-avg-uptime">99.87%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t("adminBridgeValidators.avgSignatureTime")}</span>
                          <span className="font-medium" data-testid="text-avg-sig-time">1.2s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t("adminBridgeValidators.dailySignatures")}</span>
                          <span className="font-medium" data-testid="text-daily-sigs">~2,800</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card data-testid="card-network-health">
                  <CardHeader>
                    <CardTitle>{t("adminBridgeValidators.networkHealth")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>{t("adminBridgeValidators.quorumStatus")}</span>
                          <Badge className="bg-green-500" data-testid="badge-quorum-healthy">{t("adminBridgeValidators.healthy")}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t("adminBridgeValidators.consensusSpeed")}</span>
                          <span className="font-medium" data-testid="text-consensus-speed">~2.5s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t("adminBridgeValidators.failedSignatures24h")}</span>
                          <span className="font-medium" data-testid="text-failed-sigs">0</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {selectedValidator && (
          <DetailSheet
            open={detailOpen}
            onOpenChange={setDetailOpen}
            title={t("adminBridgeValidators.validatorDetails")}
            subtitle={selectedValidator.name}
            sections={getValidatorDetailSections(selectedValidator)}
          />
        )}

        <ConfirmationDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          title={getActionDialogConfig().title}
          description={getActionDialogConfig().description}
          confirmText={actionType ? t(`adminBridgeValidators.confirm.${actionType}`) : ""}
          cancelText={t("adminBridgeValidators.confirm.cancel")}
          actionType={actionType === "slash" ? "terminate" : actionType === "deactivate" ? "disable" : "restart"}
          destructive={getActionDialogConfig().destructive}
          isLoading={manageValidatorMutation.isPending}
          onConfirm={confirmAction}
        />
      </ScrollArea>
    </TooltipProvider>
  );
}
