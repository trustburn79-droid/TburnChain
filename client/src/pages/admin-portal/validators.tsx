import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatAddress } from "@/lib/format";
import {
  ConfirmationDialog,
  useConfirmation,
  DetailSheet,
  AdminFormDialog,
  ActionMenu,
  StatusBadge,
} from "@/components/admin";
import type { FormField, DetailSection } from "@/components/admin";
import {
  ShieldCheck,
  Server,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Award,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  AlertCircle,
  Brain,
  Eye,
  Settings,
  Unlock,
  Plus,
  Edit,
  Trash2,
  Slash,
  Play,
  Square,
  BarChart3,
  Shield,
  Coins,
  Activity,
  Globe,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
} from "lucide-react";

interface Validator {
  address: string;
  name: string;
  status: "active" | "inactive" | "jailed";
  stake: string;
  delegators: number;
  commission: number;
  uptime: number;
  blocksProduced: number;
  blocksProposed: number;
  rewards: string;
  aiTrustScore: number;
  jailedUntil: Date | null;
  website?: string;
  description?: string;
  votingPower?: number;
  selfDelegation?: string;
  minDelegation?: string;
  maxValidatorStake?: string;
  slashingEvents?: number;
  missedBlocks?: number;
  signatureRate?: number;
}

interface ValidatorsResponse {
  validators: Validator[];
  total: number;
  active: number;
  inactive: number;
  jailed: number;
  totalStake: number;
  totalDelegators: number;
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardContent>
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-5 w-14 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-2 w-24 ml-auto" /></td>
      <td className="py-3 px-4 text-center"><Skeleton className="h-8 w-16 mx-auto" /></td>
    </tr>
  );
}

export default function AdminValidators() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingValidator, setEditingValidator] = useState<Validator | null>(null);
  
  const {
    isOpen: isUnjailDialogOpen,
    confirm: confirmUnjail,
    cancel: cancelUnjail,
    data: unjailValidator,
    openConfirmation: openUnjailDialog,
  } = useConfirmation<Validator>();
  
  const {
    isOpen: isSlashDialogOpen,
    confirm: confirmSlash,
    cancel: cancelSlash,
    data: slashValidator,
    openConfirmation: openSlashDialog,
  } = useConfirmation<Validator>();
  
  const {
    isOpen: isDeleteDialogOpen,
    confirm: confirmDelete,
    cancel: cancelDelete,
    data: deleteValidator,
    openConfirmation: openDeleteDialog,
  } = useConfirmation<Validator>();

  const { data: validatorsData, isLoading, error, refetch } = useQuery<ValidatorsResponse>({
    queryKey: ["/api/validators"],
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  // Use only API data - no hardcoded fallback for production
  const validators: Validator[] = useMemo(() => validatorsData?.validators || [], [validatorsData]);

  const addValidatorMutation = useMutation({
    mutationFn: async (data: Partial<Validator>) => {
      return apiRequest("/api/admin/validators", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/validators"] });
      toast({
        title: t("adminValidators.addSuccess"),
        description: t("adminValidators.addSuccessDesc"),
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("adminValidators.addError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateValidatorMutation = useMutation({
    mutationFn: async ({ address, data }: { address: string; data: Partial<Validator> }) => {
      return apiRequest(`/api/admin/validators/${address}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/validators"] });
      toast({
        title: t("adminValidators.updateSuccess"),
        description: t("adminValidators.updateSuccessDesc"),
      });
      setIsEditDialogOpen(false);
      setEditingValidator(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("adminValidators.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unjailMutation = useMutation({
    mutationFn: async (address: string) => {
      return apiRequest(`/api/admin/validators/${address}/unjail`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/validators"] });
      toast({
        title: t("adminValidators.unjailSuccess"),
        description: t("adminValidators.unjailSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminValidators.unjailError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const slashMutation = useMutation({
    mutationFn: async (address: string) => {
      return apiRequest(`/api/admin/validators/${address}/slash`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/validators"] });
      toast({
        title: t("adminValidators.slashSuccess"),
        description: t("adminValidators.slashSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminValidators.slashError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteValidatorMutation = useMutation({
    mutationFn: async (address: string) => {
      return apiRequest(`/api/admin/validators/${address}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/validators"] });
      toast({
        title: t("adminValidators.deleteSuccess"),
        description: t("adminValidators.deleteSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminValidators.deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channels: ["validators"] }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "validators_update") {
              refetch();
              setLastUpdate(new Date());
            }
          } catch (e) {
            console.error("WebSocket message parse error:", e);
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        console.error("WebSocket connection error:", e);
      }
    };

    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminValidators.refreshSuccess"),
        description: t("adminValidators.dataUpdated"),
      });
      setLastUpdate(new Date());
    } catch (error) {
      toast({
        title: t("adminValidators.refreshError"),
        description: t("adminValidators.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalValidators: validators.length,
      validators: validators.map(v => ({
        ...v,
        jailedUntil: v.jailedUntil?.toISOString() || null,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-validators-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminValidators.exportSuccess"),
      description: t("adminValidators.exportSuccessDesc"),
    });
  }, [validators, toast, t]);

  const handleViewValidator = (validator: Validator) => {
    setSelectedValidator(validator);
    setIsDetailOpen(true);
  };

  const handleEditValidator = (validator: Validator) => {
    setEditingValidator(validator);
    setIsEditDialogOpen(true);
  };

  const handleUnjailValidator = async (validator: Validator) => {
    const confirmed = await openUnjailDialog(validator);
    if (confirmed) {
      unjailMutation.mutate(validator.address);
    }
  };

  const handleSlashValidator = async (validator: Validator) => {
    const confirmed = await openSlashDialog(validator);
    if (confirmed) {
      slashMutation.mutate(validator.address);
    }
  };

  const handleDeleteValidator = async (validator: Validator) => {
    const confirmed = await openDeleteDialog(validator);
    if (confirmed) {
      deleteValidatorMutation.mutate(validator.address);
    }
  };

  const getValidatorActions = (validator: Validator) => [
    {
      id: "view",
      label: t("common.view"),
      icon: <Eye className="h-4 w-4" />,
      onClick: () => handleViewValidator(validator),
    },
    {
      id: "edit",
      label: t("common.edit"),
      icon: <Edit className="h-4 w-4" />,
      onClick: () => handleEditValidator(validator),
    },
    { separator: true },
    ...(validator.status === "jailed" ? [{
      id: "unjail",
      label: t("adminValidators.unjail"),
      icon: <Unlock className="h-4 w-4" />,
      onClick: () => handleUnjailValidator(validator),
      variant: "success" as const,
    }] : []),
    ...(validator.status !== "jailed" ? [{
      id: "slash",
      label: t("adminValidators.slash"),
      icon: <Slash className="h-4 w-4" />,
      onClick: () => handleSlashValidator(validator),
      variant: "warning" as const,
    }] : []),
    { separator: true },
    {
      id: "delete",
      label: t("common.delete"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => handleDeleteValidator(validator),
      variant: "destructive" as const,
    },
  ];

  const getValidatorFormFields = (): FormField[] => [
    {
      name: "name",
      label: t("adminValidators.validatorName"),
      type: "text",
      required: true,
      placeholder: t("adminValidators.validatorNamePlaceholder"),
    },
    {
      name: "address",
      label: t("adminValidators.address"),
      type: "text",
      required: true,
      placeholder: "0x...",
    },
    {
      name: "commission",
      label: t("adminValidators.commission"),
      type: "number",
      required: true,
      placeholder: "5",
    },
    {
      name: "minDelegation",
      label: t("adminValidators.minDelegation"),
      type: "text",
      placeholder: "100",
    },
    {
      name: "website",
      label: t("adminValidators.website"),
      type: "text",
      placeholder: "https://...",
    },
    {
      name: "description",
      label: t("adminValidators.description"),
      type: "textarea",
      placeholder: t("adminValidators.descriptionPlaceholder"),
    },
  ];

  const formatTBURN = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toFixed(0);
  };

  const getValidatorDetailSections = (validator: Validator): DetailSection[] => [
    {
      title: t("adminValidators.basicInfo"),
      icon: <ShieldCheck className="h-4 w-4" />,
      fields: [
        { label: t("adminValidators.address"), value: formatAddress(validator.address), copyable: true, copyValue: validator.address },
        { label: t("common.status"), value: validator.status, type: "badge" as const, badgeVariant: validator.status === "active" ? "secondary" as const : "destructive" as const },
        { label: t("adminValidators.commission"), value: `${validator.commission}%` },
        { label: t("adminValidators.website"), value: validator.website || "-" },
        { label: t("adminValidators.description"), value: validator.description || "-" },
      ],
    },
    {
      title: t("adminValidators.performance"),
      icon: <BarChart3 className="h-4 w-4" />,
      fields: [
        { label: t("adminValidators.uptime"), value: `${validator.uptime}%`, type: "badge" as const, badgeVariant: validator.uptime >= 99.9 ? "secondary" as const : "outline" as const },
        { label: t("adminValidators.blocksProduced"), value: validator.blocksProduced.toLocaleString() },
        { label: t("adminValidators.blocksProposed"), value: validator.blocksProposed.toLocaleString() },
        { label: t("adminValidators.signatureRate"), value: `${validator.signatureRate || validator.uptime}%` },
        { label: t("adminValidators.missedBlocks"), value: (validator.missedBlocks || 0).toLocaleString() },
        { label: t("adminValidators.slashingEvents"), value: (validator.slashingEvents || 0).toString(), type: "badge" as const, badgeVariant: (validator.slashingEvents || 0) === 0 ? "secondary" as const : "destructive" as const },
      ],
    },
    {
      title: t("adminValidators.staking"),
      icon: <Coins className="h-4 w-4" />,
      fields: [
        { label: t("adminValidators.totalStake"), value: `${formatTBURN(validator.stake)} TBURN` },
        { label: t("adminValidators.selfDelegation"), value: `${formatTBURN(validator.selfDelegation || "0")} TBURN` },
        { label: t("adminValidators.delegators"), value: validator.delegators.toLocaleString() },
        { label: t("adminValidators.votingPower"), value: `${validator.votingPower?.toFixed(2) || 0}%` },
        { label: t("adminValidators.rewards"), value: `${formatTBURN(validator.rewards)} TBURN` },
        { label: t("adminValidators.minDelegation"), value: `${formatTBURN(validator.minDelegation || "0")} TBURN` },
      ],
    },
    {
      title: t("adminValidators.aiAnalysis"),
      icon: <Brain className="h-4 w-4" />,
      fields: [
        { label: t("adminValidators.aiTrustScore"), value: (validator.aiTrustScore / 100).toFixed(1), type: "progress" as const },
        { label: t("adminValidators.riskLevel"), value: validator.aiTrustScore >= 9000 ? t("adminValidators.riskLow") : validator.aiTrustScore >= 7500 ? t("adminValidators.riskMedium") : t("adminValidators.riskHigh"), type: "badge" as const, badgeVariant: validator.aiTrustScore >= 9000 ? "secondary" as const : validator.aiTrustScore >= 7500 ? "outline" as const : "destructive" as const },
        ...(validator.jailedUntil ? [{ label: t("adminValidators.jailedUntil"), value: validator.jailedUntil.toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { timeZone: 'America/New_York' }) }] : []),
      ],
    },
  ];

  const filteredValidators = useMemo(() => {
    return validators.filter((v: Validator) => {
      const matchesSearch = searchQuery === "" ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [validators, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: validatorsData?.total || validators.length,
    active: validatorsData?.active || validators.filter((v: Validator) => v.status === "active").length,
    inactive: validatorsData?.inactive || validators.filter((v: Validator) => v.status === "inactive").length,
    jailed: validatorsData?.jailed || validators.filter((v: Validator) => v.status === "jailed").length,
    totalStake: validatorsData?.totalStake || validators.reduce((acc: number, v: Validator) => acc + parseFloat(v.stake), 0),
    totalDelegators: validatorsData?.totalDelegators || validators.reduce((acc: number, v: Validator) => acc + v.delegators, 0),
  }), [validators, validatorsData]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="validators-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminValidators.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminValidators.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto" data-testid="admin-validators-page">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
                <ShieldCheck className="h-8 w-8" />
                {t("adminValidators.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminValidators.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${wsConnected ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-xs" data-testid="text-ws-status">{wsConnected ? t("common.connected") : t("adminValidators.reconnecting")}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wsConnected ? t("adminValidators.wsConnected") : t("adminValidators.wsReconnecting")}
                  </TooltipContent>
                </Tooltip>
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminValidators.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { timeZone: 'America/New_York' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      data-testid="button-refresh"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.refresh")}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.export")}</TooltipContent>
                </Tooltip>
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-validator">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminValidators.addValidator")}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <Card data-testid="metric-total-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-validators">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.totalValidators")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-active-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500" data-testid="value-active-validators">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.active")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-inactive-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500" data-testid="value-inactive-validators">{stats.inactive}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.inactive")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-jailed-validators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-500" data-testid="value-jailed-validators">{stats.jailed}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.jailed")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-total-stake">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-stake">{formatTBURN(stats.totalStake.toString())}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.totalStake")}</p>
                  </CardContent>
                </Card>
                <Card data-testid="metric-total-delegators">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold" data-testid="value-total-delegators">{stats.totalDelegators.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("adminValidators.totalDelegators")}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card data-testid="card-validators-table">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2" data-testid="text-validators-title">
                  <Brain className="h-5 w-5 text-primary" />
                  {t("adminValidators.validatorsList")}
                  <Badge className="bg-green-500/10 text-green-500">
                    {t("adminValidators.aiEnhanced")}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("adminValidators.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[250px]"
                      data-testid="input-validator-search"
                    />
                  </div>
                  <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList data-testid="tabs-validator-filter">
                      <TabsTrigger value="all" data-testid="tab-all">{t("common.all")}</TabsTrigger>
                      <TabsTrigger value="active" data-testid="tab-active">{t("adminValidators.active")}</TabsTrigger>
                      <TabsTrigger value="inactive" data-testid="tab-inactive">{t("adminValidators.inactive")}</TabsTrigger>
                      <TabsTrigger value="jailed" data-testid="tab-jailed">{t("adminValidators.jailed")}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-validators">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t("adminValidators.validator")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("common.status")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.stake")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.delegators")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.commission")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.uptime")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.blocks")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("adminValidators.aiTrust")}</th>
                      <th className="text-center py-3 px-4 font-medium">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <>
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                      </>
                    ) : (
                      filteredValidators.map((validator: Validator) => (
                        <tr 
                          key={validator.address} 
                          className="border-b hover-elevate cursor-pointer" 
                          data-testid={`row-validator-${validator.address}`}
                          onClick={() => handleViewValidator(validator)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`text-validator-name-${validator.address}`}>{validator.name}</p>
                                <p className="text-xs text-muted-foreground font-mono" data-testid={`text-validator-address-${validator.address}`}>{validator.address}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge 
                              status={validator.status} 
                              statusMap={{
                                active: { label: t("adminValidators.statusActive"), variant: "success" },
                                inactive: { label: t("adminValidators.statusInactive"), variant: "warning" },
                                jailed: { label: t("adminValidators.statusJailed"), variant: "error" },
                              }}
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-mono" data-testid={`text-validator-stake-${validator.address}`}>{formatTBURN(validator.stake)} TBURN</td>
                          <td className="py-3 px-4 text-right" data-testid={`text-validator-delegators-${validator.address}`}>{validator.delegators.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right" data-testid={`text-validator-commission-${validator.address}`}>{validator.commission}%</td>
                          <td className="py-3 px-4 text-right">
                            <Badge 
                              className={validator.uptime >= 99.9 ? "bg-green-500/10 text-green-500" : validator.uptime >= 99 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}
                              data-testid={`badge-validator-uptime-${validator.address}`}
                            >
                              {validator.uptime}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono" data-testid={`text-validator-blocks-${validator.address}`}>{validator.blocksProduced.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-end gap-1">
                                  <Progress value={validator.aiTrustScore / 100} className="w-16 h-2" />
                                  <span className="text-xs font-mono w-12" data-testid={`text-validator-trust-${validator.address}`}>{(validator.aiTrustScore / 100).toFixed(1)}%</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("adminValidators.aiTrustScore")}: {validator.aiTrustScore}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              <ActionMenu 
                                actions={getValidatorActions(validator)} 
                                testId={`menu-validator-actions-${validator.address}`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {!isLoading && filteredValidators.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-validators">
                    {t("adminValidators.noValidatorsFound")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title={selectedValidator?.name || ""}
        subtitle={selectedValidator?.address}
        sections={selectedValidator ? getValidatorDetailSections(selectedValidator) : []}
        actions={selectedValidator ? [
          {
            label: t("common.edit"),
            icon: <Edit className="h-4 w-4" />,
            onClick: () => {
              setIsDetailOpen(false);
              handleEditValidator(selectedValidator);
            },
          },
          ...(selectedValidator.status === "jailed" ? [{
            label: t("adminValidators.unjail"),
            icon: <Unlock className="h-4 w-4" />,
            onClick: () => {
              setIsDetailOpen(false);
              handleUnjailValidator(selectedValidator);
            },
            variant: "success" as const,
          }] : [{
            label: t("adminValidators.slash"),
            icon: <Slash className="h-4 w-4" />,
            onClick: () => {
              setIsDetailOpen(false);
              handleSlashValidator(selectedValidator);
            },
            variant: "warning" as const,
          }]),
        ] : []}
      />

      <AdminFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title={t("adminValidators.addValidator")}
        description={t("adminValidators.addValidatorDesc")}
        fields={getValidatorFormFields()}
        onSubmit={(data) => addValidatorMutation.mutate(data as Partial<Validator>)}
        isLoading={addValidatorMutation.isPending}
        submitLabel={t("common.create")}
      />

      <AdminFormDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingValidator(null);
        }}
        title={t("adminValidators.editValidator")}
        description={t("adminValidators.editValidatorDesc")}
        fields={getValidatorFormFields()}
        defaultValues={editingValidator ? {
          name: editingValidator.name,
          address: editingValidator.address,
          commission: editingValidator.commission,
          minDelegation: editingValidator.minDelegation || "",
          website: editingValidator.website || "",
          description: editingValidator.description || "",
        } : undefined}
        onSubmit={(data) => editingValidator && updateValidatorMutation.mutate({ 
          address: editingValidator.address, 
          data: data as Partial<Validator> 
        })}
        isLoading={updateValidatorMutation.isPending}
        submitLabel={t("common.save")}
      />

      <ConfirmationDialog
        open={isUnjailDialogOpen}
        onOpenChange={(open) => !open && cancelUnjail()}
        title={t("adminValidators.confirmUnjail")}
        description={t("adminValidators.confirmUnjailDesc", { name: unjailValidator?.name })}
        onConfirm={confirmUnjail}
        onCancel={cancelUnjail}
        confirmLabel={t("adminValidators.unjail")}
        variant="default"
        isLoading={unjailMutation.isPending}
      />

      <ConfirmationDialog
        open={isSlashDialogOpen}
        onOpenChange={(open) => !open && cancelSlash()}
        title={t("adminValidators.confirmSlash")}
        description={t("adminValidators.confirmSlashDesc", { name: slashValidator?.name })}
        onConfirm={confirmSlash}
        onCancel={cancelSlash}
        confirmLabel={t("adminValidators.slash")}
        variant="destructive"
        isLoading={slashMutation.isPending}
        requireConfirmText={slashValidator?.name}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && cancelDelete()}
        title={t("adminValidators.confirmDelete")}
        description={t("adminValidators.confirmDeleteDesc", { name: deleteValidator?.name })}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmLabel={t("common.delete")}
        variant="destructive"
        isLoading={deleteValidatorMutation.isPending}
        requireConfirmText={deleteValidator?.name}
      />
    </TooltipProvider>
  );
}
