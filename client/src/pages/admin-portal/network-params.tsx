import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings, Clock, Users, Flame, Vote, History, 
  AlertTriangle, Save, RotateCcw, CheckCircle, Info,
  RefreshCw, Download, AlertCircle
} from "lucide-react";

const blockchainParamsSchema = z.object({
  blockTime: z.number().min(100).max(2000),
  maxBlockSize: z.number().min(1).max(50),
  maxTxPerBlock: z.number().min(1000).max(100000),
});

const committeeParamsSchema = z.object({
  defaultSize: z.number().min(21).max(200),
  minSize: z.number().min(7).max(50),
  maxSize: z.number().min(100).max(500),
  rotationPeriod: z.number().min(10).max(1000),
  aiSelection: z.boolean(),
  dynamicSizing: z.boolean(),
});

const gasParamsSchema = z.object({
  baseGas: z.number().min(10).max(1000),
  minGas: z.number().min(1).max(500),
  maxGas: z.number().min(100).max(10000),
  congestionMultiplier: z.number().min(1).max(10),
  eip1559: z.boolean(),
  aiOptimization: z.boolean(),
});

const burnParamsSchema = z.object({
  txBurnRate: z.number().min(0.1).max(10),
  timeBurnRate: z.number().min(0.01).max(5),
  volumeBurnRate: z.number().min(0.1).max(10),
  aiOptimized: z.boolean(),
});

const governanceParamsSchema = z.object({
  minStake: z.number().min(100).max(100000),
  quorum: z.number().min(1).max(50),
  approvalThreshold: z.number().min(50).max(90),
  votingPeriod: z.number().min(1).max(30),
  executionDelay: z.number().min(1).max(14),
});

interface NetworkParamsResponse {
  blockchain: z.infer<typeof blockchainParamsSchema>;
  committee: z.infer<typeof committeeParamsSchema>;
  gas: z.infer<typeof gasParamsSchema>;
  burn: z.infer<typeof burnParamsSchema>;
  governance: z.infer<typeof governanceParamsSchema>;
  changeHistory: Array<{
    id: number;
    param: string;
    oldValue: string;
    newValue: string;
    changedBy: string;
    date: string;
    reason: string;
  }>;
}

function ParamCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

function HistoryRowSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function AdminNetworkParams() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: paramsData, isLoading, error, refetch } = useQuery<NetworkParamsResponse>({
    queryKey: ["/api/admin/network/params"],
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<NetworkParamsResponse>) => 
      apiRequest("/api/admin/network/params", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/network/params"] });
      setHasChanges(false);
      toast({
        title: t("adminNetworkParams.saveSuccess"),
        description: t("adminNetworkParams.saveSuccessDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminNetworkParams.saveError"),
        description: t("adminNetworkParams.saveErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const defaultBlockchain = useMemo(() => paramsData?.blockchain || {
    blockTime: 500,
    maxBlockSize: 5,
    maxTxPerBlock: 10000,
  }, [paramsData]);

  const defaultCommittee = useMemo(() => paramsData?.committee || {
    defaultSize: 100,
    minSize: 21,
    maxSize: 200,
    rotationPeriod: 100,
    aiSelection: true,
    dynamicSizing: true,
  }, [paramsData]);

  const defaultGas = useMemo(() => paramsData?.gas || {
    baseGas: 100,
    minGas: 50,
    maxGas: 500,
    congestionMultiplier: 1.5,
    eip1559: true,
    aiOptimization: true,
  }, [paramsData]);

  const defaultBurn = useMemo(() => paramsData?.burn || {
    txBurnRate: 1.0,
    timeBurnRate: 0.1,
    volumeBurnRate: 0.5,
    aiOptimized: true,
  }, [paramsData]);

  const defaultGovernance = useMemo(() => paramsData?.governance || {
    minStake: 10000,
    quorum: 10,
    approvalThreshold: 66,
    votingPeriod: 7,
    executionDelay: 2,
  }, [paramsData]);

  const changeHistory = useMemo(() => paramsData?.changeHistory || [
    { id: 1, param: "Block Time", oldValue: "600ms", newValue: "500ms", changedBy: "Admin", date: "2024-12-03", reason: "Performance optimization" },
    { id: 2, param: "Committee Size", oldValue: "80", newValue: "100", changedBy: "Governance", date: "2024-12-01", reason: "Security enhancement" },
    { id: 3, param: "Gas Price", oldValue: "80 Ember", newValue: "100 Ember", changedBy: "AI System", date: "2024-11-28", reason: "Network congestion" },
    { id: 4, param: "Burn Rate", oldValue: "0.8%", newValue: "1.0%", changedBy: "Governance", date: "2024-11-25", reason: "Deflation target" },
  ], [paramsData]);

  const [blockchainParams, setBlockchainParams] = useState(defaultBlockchain);
  const [committeeParams, setCommitteeParams] = useState(defaultCommittee);
  const [gasParams, setGasParams] = useState(defaultGas);
  const [burnParams, setBurnParams] = useState(defaultBurn);
  const [governanceParams, setGovernanceParams] = useState(defaultGovernance);

  useEffect(() => {
    if (paramsData) {
      setBlockchainParams(paramsData.blockchain || defaultBlockchain);
      setCommitteeParams(paramsData.committee || defaultCommittee);
      setGasParams(paramsData.gas || defaultGas);
      setBurnParams(paramsData.burn || defaultBurn);
      setGovernanceParams(paramsData.governance || defaultGovernance);
    }
  }, [paramsData, defaultBlockchain, defaultCommittee, defaultGas, defaultBurn, defaultGovernance]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminNetworkParams.refreshSuccess"),
        description: t("adminNetworkParams.dataUpdated"),
      });
      setLastUpdate(new Date());
    } catch (err) {
      toast({
        title: t("adminNetworkParams.refreshError"),
        description: t("adminNetworkParams.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      blockchain: blockchainParams,
      committee: committeeParams,
      gas: gasParams,
      burn: burnParams,
      governance: governanceParams,
      changeHistory,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tburn-network-params-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t("adminNetworkParams.exportSuccess"),
      description: t("adminNetworkParams.exportSuccessDesc"),
    });
  }, [blockchainParams, committeeParams, gasParams, burnParams, governanceParams, changeHistory, toast, t]);

  const handleSave = useCallback(() => {
    saveMutation.mutate({
      blockchain: blockchainParams,
      committee: committeeParams,
      gas: gasParams,
      burn: burnParams,
      governance: governanceParams,
    });
  }, [blockchainParams, committeeParams, gasParams, burnParams, governanceParams, saveMutation]);

  const handleReset = useCallback(() => {
    setBlockchainParams(defaultBlockchain);
    setCommitteeParams(defaultCommittee);
    setGasParams(defaultGas);
    setBurnParams(defaultBurn);
    setGovernanceParams(defaultGovernance);
    setHasChanges(false);
    toast({
      title: t("adminNetworkParams.resetSuccess"),
      description: t("adminNetworkParams.resetSuccessDesc"),
    });
  }, [defaultBlockchain, defaultCommittee, defaultGas, defaultBurn, defaultGovernance, toast, t]);

  const updateBlockchainParam = (key: keyof typeof blockchainParams, value: number) => {
    setBlockchainParams(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateCommitteeParam = (key: keyof typeof committeeParams, value: number | boolean) => {
    setCommitteeParams(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateGasParam = (key: keyof typeof gasParams, value: number | boolean) => {
    setGasParams(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateBurnParam = (key: keyof typeof burnParams, value: number | boolean) => {
    setBurnParams(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateGovernanceParam = (key: keyof typeof governanceParams, value: number) => {
    setGovernanceParams(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="network-params-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminNetworkParams.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminNetworkParams.error.description")}</p>
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
      <ScrollArea className="h-full" data-testid="admin-network-params-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
                <Settings className="h-7 w-7" />
                {t("adminNetworkParams.title")}
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminNetworkParams.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                <Clock className="h-4 w-4" />
                <span data-testid="text-last-update">{t("adminNetworkParams.lastUpdate")}: {lastUpdate.toLocaleTimeString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}</span>
              </div>
              {hasChanges && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30" data-testid="badge-unsaved-changes">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {t("adminNetworkParams.unsavedChanges")}
                </Badge>
              )}
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReset}
                    data-testid="button-reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("adminNetworkParams.reset")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    disabled={!hasChanges || saveMutation.isPending}
                    onClick={handleSave}
                    data-testid="button-save"
                  >
                    <Save className={`w-4 h-4 mr-2 ${saveMutation.isPending ? 'animate-spin' : ''}`} />
                    {t("adminNetworkParams.saveChanges")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("adminNetworkParams.saveChangesTooltip")}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Tabs defaultValue="blockchain" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-params">
              <TabsTrigger value="blockchain" data-testid="tab-blockchain">
                <Settings className="w-4 h-4 mr-2" />
                {t("adminNetworkParams.blockchain")}
              </TabsTrigger>
              <TabsTrigger value="committee" data-testid="tab-committee">
                <Users className="w-4 h-4 mr-2" />
                {t("adminNetworkParams.committee")}
              </TabsTrigger>
              <TabsTrigger value="gas" data-testid="tab-gas">
                <Flame className="w-4 h-4 mr-2" />
                {t("adminNetworkParams.gas")}
              </TabsTrigger>
              <TabsTrigger value="burn" data-testid="tab-burn">
                <Flame className="w-4 h-4 mr-2" />
                {t("adminNetworkParams.burn")}
              </TabsTrigger>
              <TabsTrigger value="governance" data-testid="tab-governance">
                <Vote className="w-4 h-4 mr-2" />
                {t("adminNetworkParams.governance")}
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <History className="w-4 h-4 mr-2" />
                {t("adminNetworkParams.history")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blockchain" className="space-y-4">
              {isLoading ? (
                <ParamCardSkeleton />
              ) : (
                <Card data-testid="card-blockchain-params">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {t("adminNetworkParams.blockchainParams")}
                    </CardTitle>
                    <CardDescription>{t("adminNetworkParams.blockchainParamsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2" data-testid="param-block-time">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="blockTime">{t("adminNetworkParams.blockTime")}</Label>
                        <span className="text-sm text-muted-foreground">{t("adminNetworkParams.blockTimeDesc")}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="blockTime"
                          value={[blockchainParams.blockTime]}
                          min={100}
                          max={2000}
                          step={50}
                          className="flex-1"
                          onValueChange={([v]) => updateBlockchainParam('blockTime', v)}
                          data-testid="slider-block-time"
                        />
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Input
                            type="number"
                            value={blockchainParams.blockTime}
                            className="w-20"
                            onChange={(e) => updateBlockchainParam('blockTime', parseInt(e.target.value) || 0)}
                            data-testid="input-block-time"
                          />
                          <span className="text-sm text-muted-foreground">ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2" data-testid="param-max-block-size">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maxBlockSize">{t("adminNetworkParams.maxBlockSize")}</Label>
                        <span className="text-sm text-muted-foreground">{t("adminNetworkParams.maxBlockSizeDesc")}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="maxBlockSize"
                          value={[blockchainParams.maxBlockSize]}
                          min={1}
                          max={50}
                          step={1}
                          className="flex-1"
                          onValueChange={([v]) => updateBlockchainParam('maxBlockSize', v)}
                          data-testid="slider-max-block-size"
                        />
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Input
                            type="number"
                            value={blockchainParams.maxBlockSize}
                            className="w-20"
                            onChange={(e) => updateBlockchainParam('maxBlockSize', parseInt(e.target.value) || 0)}
                            data-testid="input-max-block-size"
                          />
                          <span className="text-sm text-muted-foreground">MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2" data-testid="param-max-tx-per-block">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maxTxPerBlock">{t("adminNetworkParams.maxTxPerBlock")}</Label>
                        <span className="text-sm text-muted-foreground">{t("adminNetworkParams.maxTxPerBlockDesc")}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="maxTxPerBlock"
                          value={[blockchainParams.maxTxPerBlock]}
                          min={1000}
                          max={100000}
                          step={1000}
                          className="flex-1"
                          onValueChange={([v]) => updateBlockchainParam('maxTxPerBlock', v)}
                          data-testid="slider-max-tx-per-block"
                        />
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Input
                            type="number"
                            value={blockchainParams.maxTxPerBlock}
                            className="w-20"
                            onChange={(e) => updateBlockchainParam('maxTxPerBlock', parseInt(e.target.value) || 0)}
                            data-testid="input-max-tx-per-block"
                          />
                          <span className="text-sm text-muted-foreground">tx</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="committee" className="space-y-4">
              {isLoading ? (
                <>
                  <ParamCardSkeleton />
                  <ParamCardSkeleton />
                </>
              ) : (
                <>
                  <Card data-testid="card-committee-params">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {t("adminNetworkParams.committeeConfig")}
                      </CardTitle>
                      <CardDescription>{t("adminNetworkParams.committeeConfigDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                      <div className="space-y-2" data-testid="param-default-size">
                        <Label htmlFor="defaultSize">{t("adminNetworkParams.defaultCommitteeSize")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="defaultSize"
                            type="number"
                            value={committeeParams.defaultSize}
                            min={21}
                            max={200}
                            onChange={(e) => updateCommitteeParam('defaultSize', parseInt(e.target.value) || 0)}
                            data-testid="input-default-size"
                          />
                        </div>
                      </div>
                      <div className="space-y-2" data-testid="param-min-size">
                        <Label htmlFor="minSize">{t("adminNetworkParams.minSize")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="minSize"
                            type="number"
                            value={committeeParams.minSize}
                            min={7}
                            max={50}
                            onChange={(e) => updateCommitteeParam('minSize', parseInt(e.target.value) || 0)}
                            data-testid="input-min-size"
                          />
                        </div>
                      </div>
                      <div className="space-y-2" data-testid="param-max-size">
                        <Label htmlFor="maxSize">{t("adminNetworkParams.maxSize")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="maxSize"
                            type="number"
                            value={committeeParams.maxSize}
                            min={100}
                            max={500}
                            onChange={(e) => updateCommitteeParam('maxSize', parseInt(e.target.value) || 0)}
                            data-testid="input-max-size"
                          />
                        </div>
                      </div>
                      <div className="space-y-2" data-testid="param-rotation-period">
                        <Label htmlFor="rotationPeriod">{t("adminNetworkParams.rotationPeriod")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="rotationPeriod"
                            type="number"
                            value={committeeParams.rotationPeriod}
                            onChange={(e) => updateCommitteeParam('rotationPeriod', parseInt(e.target.value) || 0)}
                            data-testid="input-rotation-period"
                          />
                          <span className="text-sm text-muted-foreground">{t("adminNetworkParams.blocks")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-ai-committee">
                    <CardHeader>
                      <CardTitle>{t("adminNetworkParams.aiCommitteeSelection")}</CardTitle>
                      <CardDescription>{t("adminNetworkParams.aiCommitteeSelectionDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between" data-testid="param-ai-selection">
                        <div>
                          <p className="font-medium">{t("adminNetworkParams.aiSelectionAlgorithm")}</p>
                          <p className="text-sm text-muted-foreground">{t("adminNetworkParams.aiSelectionAlgorithmDesc")}</p>
                        </div>
                        <Switch 
                          checked={committeeParams.aiSelection}
                          onCheckedChange={(v) => updateCommitteeParam('aiSelection', v)}
                          data-testid="switch-ai-selection"
                        />
                      </div>
                      <div className="flex items-center justify-between" data-testid="param-dynamic-sizing">
                        <div>
                          <p className="font-medium">{t("adminNetworkParams.dynamicCommitteeSizing")}</p>
                          <p className="text-sm text-muted-foreground">{t("adminNetworkParams.dynamicCommitteeSizingDesc")}</p>
                        </div>
                        <Switch 
                          checked={committeeParams.dynamicSizing}
                          onCheckedChange={(v) => updateCommitteeParam('dynamicSizing', v)}
                          data-testid="switch-dynamic-sizing"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="gas" className="space-y-4">
              {isLoading ? (
                <>
                  <ParamCardSkeleton />
                  <ParamCardSkeleton />
                </>
              ) : (
                <>
                  <Card data-testid="card-gas-params">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        {t("adminNetworkParams.gasPricePolicy")}
                      </CardTitle>
                      <CardDescription>{t("adminNetworkParams.gasPricePolicyDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                      <div className="space-y-2" data-testid="param-base-gas">
                        <Label htmlFor="baseGas">{t("adminNetworkParams.baseGasPrice")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="baseGas"
                            type="number"
                            value={gasParams.baseGas}
                            onChange={(e) => updateGasParam('baseGas', parseInt(e.target.value) || 0)}
                            data-testid="input-base-gas"
                          />
                          <span className="text-sm text-muted-foreground">Ember</span>
                        </div>
                      </div>
                      <div className="space-y-2" data-testid="param-min-gas">
                        <Label htmlFor="minGas">{t("adminNetworkParams.minGas")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="minGas"
                            type="number"
                            value={gasParams.minGas}
                            onChange={(e) => updateGasParam('minGas', parseInt(e.target.value) || 0)}
                            data-testid="input-min-gas"
                          />
                          <span className="text-sm text-muted-foreground">Ember</span>
                        </div>
                      </div>
                      <div className="space-y-2" data-testid="param-max-gas">
                        <Label htmlFor="maxGas">{t("adminNetworkParams.maxGas")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="maxGas"
                            type="number"
                            value={gasParams.maxGas}
                            onChange={(e) => updateGasParam('maxGas', parseInt(e.target.value) || 0)}
                            data-testid="input-max-gas"
                          />
                          <span className="text-sm text-muted-foreground">Ember</span>
                        </div>
                      </div>
                      <div className="space-y-2" data-testid="param-congestion-multiplier">
                        <Label htmlFor="congestionMultiplier">{t("adminNetworkParams.congestionMultiplier")}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="congestionMultiplier"
                            type="number"
                            step="0.1"
                            value={gasParams.congestionMultiplier}
                            onChange={(e) => updateGasParam('congestionMultiplier', parseFloat(e.target.value) || 0)}
                            data-testid="input-congestion-multiplier"
                          />
                          <span className="text-sm text-muted-foreground">x</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-dynamic-pricing">
                    <CardHeader>
                      <CardTitle>{t("adminNetworkParams.dynamicPricing")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between" data-testid="param-eip1559">
                        <div>
                          <p className="font-medium">{t("adminNetworkParams.eip1559Pricing")}</p>
                          <p className="text-sm text-muted-foreground">{t("adminNetworkParams.eip1559PricingDesc")}</p>
                        </div>
                        <Switch 
                          checked={gasParams.eip1559}
                          onCheckedChange={(v) => updateGasParam('eip1559', v)}
                          data-testid="switch-eip1559"
                        />
                      </div>
                      <div className="flex items-center justify-between" data-testid="param-gas-ai">
                        <div>
                          <p className="font-medium">{t("adminNetworkParams.aiGasOptimization")}</p>
                          <p className="text-sm text-muted-foreground">{t("adminNetworkParams.aiGasOptimizationDesc")}</p>
                        </div>
                        <Switch 
                          checked={gasParams.aiOptimization}
                          onCheckedChange={(v) => updateGasParam('aiOptimization', v)}
                          data-testid="switch-gas-ai"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="burn" className="space-y-4">
              {isLoading ? (
                <ParamCardSkeleton />
              ) : (
                <Card data-testid="card-burn-params">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      {t("adminNetworkParams.burnRateConfig")}
                    </CardTitle>
                    <CardDescription>{t("adminNetworkParams.burnRateConfigDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2" data-testid="param-tx-burn-rate">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="txBurnRate">{t("adminNetworkParams.txBurnRate")}</Label>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="txBurnRate"
                          value={[burnParams.txBurnRate * 10]}
                          min={1}
                          max={100}
                          step={1}
                          className="flex-1"
                          onValueChange={([v]) => updateBurnParam('txBurnRate', v / 10)}
                          data-testid="slider-tx-burn-rate"
                        />
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Input
                            type="number"
                            value={burnParams.txBurnRate}
                            step="0.1"
                            className="w-20"
                            onChange={(e) => updateBurnParam('txBurnRate', parseFloat(e.target.value) || 0)}
                            data-testid="input-tx-burn-rate"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2" data-testid="param-time-burn-rate">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="timeBurnRate">{t("adminNetworkParams.timeBurnRate")}</Label>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="timeBurnRate"
                          value={[burnParams.timeBurnRate * 100]}
                          min={1}
                          max={500}
                          step={1}
                          className="flex-1"
                          onValueChange={([v]) => updateBurnParam('timeBurnRate', v / 100)}
                          data-testid="slider-time-burn-rate"
                        />
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Input
                            type="number"
                            value={burnParams.timeBurnRate}
                            step="0.01"
                            className="w-20"
                            onChange={(e) => updateBurnParam('timeBurnRate', parseFloat(e.target.value) || 0)}
                            data-testid="input-time-burn-rate"
                          />
                          <span className="text-sm text-muted-foreground">% {t("adminNetworkParams.daily")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2" data-testid="param-volume-burn-rate">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="volumeBurnRate">{t("adminNetworkParams.volumeBurnRate")}</Label>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="volumeBurnRate"
                          value={[burnParams.volumeBurnRate * 10]}
                          min={1}
                          max={100}
                          step={1}
                          className="flex-1"
                          onValueChange={([v]) => updateBurnParam('volumeBurnRate', v / 10)}
                          data-testid="slider-volume-burn-rate"
                        />
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Input
                            type="number"
                            value={burnParams.volumeBurnRate}
                            step="0.1"
                            className="w-20"
                            onChange={(e) => updateBurnParam('volumeBurnRate', parseFloat(e.target.value) || 0)}
                            data-testid="input-volume-burn-rate"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t" data-testid="param-ai-optimized-burn">
                      <div>
                        <p className="font-medium">{t("adminNetworkParams.aiOptimizedBurn")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminNetworkParams.aiOptimizedBurnDesc")}</p>
                      </div>
                      <Switch 
                        checked={burnParams.aiOptimized}
                        onCheckedChange={(v) => updateBurnParam('aiOptimized', v)}
                        data-testid="switch-ai-optimized-burn"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="governance" className="space-y-4">
              {isLoading ? (
                <ParamCardSkeleton />
              ) : (
                <Card data-testid="card-governance-params">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="w-5 h-5" />
                      {t("adminNetworkParams.governanceThresholds")}
                    </CardTitle>
                    <CardDescription>{t("adminNetworkParams.governanceThresholdsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2" data-testid="param-min-stake">
                      <Label htmlFor="minStake">{t("adminNetworkParams.minProposalStake")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="minStake"
                          type="number"
                          value={governanceParams.minStake}
                          onChange={(e) => updateGovernanceParam('minStake', parseInt(e.target.value) || 0)}
                          data-testid="input-min-stake"
                        />
                        <span className="text-sm text-muted-foreground">TBURN</span>
                      </div>
                    </div>
                    <div className="space-y-2" data-testid="param-quorum">
                      <Label htmlFor="quorum">{t("adminNetworkParams.quorum")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="quorum"
                          type="number"
                          value={governanceParams.quorum}
                          onChange={(e) => updateGovernanceParam('quorum', parseInt(e.target.value) || 0)}
                          data-testid="input-quorum"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-2" data-testid="param-approval-threshold">
                      <Label htmlFor="approvalThreshold">{t("adminNetworkParams.approvalThreshold")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="approvalThreshold"
                          type="number"
                          value={governanceParams.approvalThreshold}
                          onChange={(e) => updateGovernanceParam('approvalThreshold', parseInt(e.target.value) || 0)}
                          data-testid="input-approval-threshold"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-2" data-testid="param-voting-period">
                      <Label htmlFor="votingPeriod">{t("adminNetworkParams.votingPeriod")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="votingPeriod"
                          type="number"
                          value={governanceParams.votingPeriod}
                          onChange={(e) => updateGovernanceParam('votingPeriod', parseInt(e.target.value) || 0)}
                          data-testid="input-voting-period"
                        />
                        <span className="text-sm text-muted-foreground">{t("adminNetworkParams.days")}</span>
                      </div>
                    </div>
                    <div className="space-y-2" data-testid="param-execution-delay">
                      <Label htmlFor="executionDelay">{t("adminNetworkParams.executionDelay")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="executionDelay"
                          type="number"
                          value={governanceParams.executionDelay}
                          onChange={(e) => updateGovernanceParam('executionDelay', parseInt(e.target.value) || 0)}
                          data-testid="input-execution-delay"
                        />
                        <span className="text-sm text-muted-foreground">{t("adminNetworkParams.days")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card data-testid="card-history">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    {t("adminNetworkParams.parameterChangeHistory")}
                  </CardTitle>
                  <CardDescription>{t("adminNetworkParams.parameterChangeHistoryDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <>
                        <HistoryRowSkeleton />
                        <HistoryRowSkeleton />
                        <HistoryRowSkeleton />
                        <HistoryRowSkeleton />
                      </>
                    ) : (
                      changeHistory.map((change) => (
                        <div key={change.id} className="flex items-start gap-4 p-4 border rounded-lg hover-elevate" data-testid={`history-item-${change.id}`}>
                          <div className="p-2 rounded-full bg-blue-500/10">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="font-medium" data-testid={`text-history-param-${change.id}`}>{change.param}</p>
                              <span className="text-sm text-muted-foreground" data-testid={`text-history-date-${change.id}`}>{change.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t("adminNetworkParams.changedFrom")} <span className="text-red-500" data-testid={`text-history-old-${change.id}`}>{change.oldValue}</span> {t("adminNetworkParams.to")}{" "}
                              <span className="text-green-500" data-testid={`text-history-new-${change.id}`}>{change.newValue}</span>
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                              <span>{t("adminNetworkParams.by")}: <span data-testid={`text-history-by-${change.id}`}>{change.changedBy}</span></span>
                              <span className="text-muted-foreground" data-testid={`text-history-reason-${change.id}`}>{change.reason}</span>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-history-info-${change.id}`}>
                                <Info className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("adminNetworkParams.viewDetails")}</TooltipContent>
                          </Tooltip>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
