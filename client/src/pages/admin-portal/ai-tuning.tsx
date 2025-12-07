import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Settings, Sliders, Brain, Zap, Save, RotateCcw, 
  AlertTriangle, CheckCircle, TestTube, RefreshCw, Wifi, WifiOff, AlertCircle, Eye
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ModelConfig {
  name: string;
  layer: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface DecisionParam {
  name: string;
  weight: number;
  enabled: boolean;
}

interface AITuningData {
  modelConfigs: ModelConfig[];
  decisionParams: DecisionParam[];
  layerWeights: {
    strategic: number;
    tactical: number;
    operational: number;
  };
  thresholds: {
    autoExecute: number;
    humanReview: number;
    rejection: number;
  };
  rateLimits: {
    strategicPerHour: number;
    tacticalPerMinute: number;
    operationalPerSecond: number;
  };
  emergencySettings: {
    allowEmergencyActions: boolean;
    circuitBreaker: boolean;
  };
  advancedConfig: {
    consensusTimeout: number;
    retryAttempts: number;
    backoffMultiplier: number;
    cacheTTL: number;
  };
}

const mockData: AITuningData = {
  modelConfigs: [
    { 
      name: "Gemini 3 Pro", 
      layer: "Strategic",
      temperature: 0.65,
      maxTokens: 8192,
      topP: 0.92,
      frequencyPenalty: 0.25,
      presencePenalty: 0.25
    },
    { 
      name: "Claude Sonnet 4.5", 
      layer: "Tactical",
      temperature: 0.45,
      maxTokens: 16384,
      topP: 0.96,
      frequencyPenalty: 0.15,
      presencePenalty: 0.15
    },
    { 
      name: "GPT-4o", 
      layer: "Operational",
      temperature: 0.25,
      maxTokens: 4096,
      topP: 0.85,
      frequencyPenalty: 0.08,
      presencePenalty: 0.08
    },
    { 
      name: "Grok 3", 
      layer: "Fallback",
      temperature: 0.35,
      maxTokens: 8192,
      topP: 0.88,
      frequencyPenalty: 0.12,
      presencePenalty: 0.12
    },
  ],
  decisionParams: [
    { name: "Consensus Optimization", weight: 0.95, enabled: true },
    { name: "Shard Rebalancing", weight: 0.92, enabled: true },
    { name: "Gas Price Adjustment", weight: 0.98, enabled: true },
    { name: "Validator Selection", weight: 0.94, enabled: true },
    { name: "Bridge Risk Assessment", weight: 0.90, enabled: true },
    { name: "Burn Rate Optimization", weight: 0.96, enabled: true },
    { name: "Treasury Management", weight: 0.88, enabled: true },
    { name: "Quantum Security Check", weight: 0.85, enabled: true },
  ],
  layerWeights: {
    strategic: 45,
    tactical: 35,
    operational: 20
  },
  thresholds: {
    autoExecute: 85,
    humanReview: 65,
    rejection: 40
  },
  rateLimits: {
    strategicPerHour: 25,
    tacticalPerMinute: 250,
    operationalPerSecond: 2500
  },
  emergencySettings: {
    allowEmergencyActions: true,
    circuitBreaker: true
  },
  advancedConfig: {
    consensusTimeout: 3000,
    retryAttempts: 5,
    backoffMultiplier: 1.25,
    cacheTTL: 180
  }
};

export default function AdminAITuning() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [hasChanges, setHasChanges] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [localParams, setLocalParams] = useState<AITuningData | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<AITuningData>({
    queryKey: ["/api/admin/ai/params"],
    enabled: true,
  });

  const tuningData = localParams || data || mockData;

  useEffect(() => {
    if (data && !localParams) {
      setLocalParams(data);
    }
  }, [data, localParams]);

  const saveParamsMutation = useMutation({
    mutationFn: async (params: AITuningData) => {
      return apiRequest('PUT', '/api/admin/ai/params', params);
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({
        title: t("adminAITuning.changesSaved"),
        description: t("adminAITuning.changesSavedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai/params"] });
    },
    onError: () => {
      toast({
        title: t("adminAITuning.error.title"),
        description: t("adminAITuning.error.description"),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws/ai-tuning`);

      ws.onopen = () => {
        setWsConnected(true);
        setLastUpdate(new Date());
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLocalParams(null);
      setHasChanges(false);
      setLastUpdate(new Date());
      toast({
        title: t("adminAITuning.refreshSuccess"),
        description: t("adminAITuning.refreshSuccessDesc"),
      });
    } catch {
      toast({
        title: t("adminAITuning.error.title"),
        description: t("adminAITuning.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleReset = useCallback(() => {
    setResetDialogOpen(true);
  }, []);

  const confirmReset = useCallback(() => {
    setLocalParams(data || mockData);
    setHasChanges(false);
    setResetDialogOpen(false);
    toast({
      title: t("adminAITuning.changesReset"),
      description: t("adminAITuning.changesResetDesc"),
    });
  }, [data, toast, t]);

  const handleTest = useCallback(() => {
    toast({
      title: t("adminAITuning.testStarted"),
      description: t("adminAITuning.testStartedDesc"),
    });
  }, [toast, t]);

  const handleApply = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  const confirmApply = useCallback(() => {
    if (localParams) {
      saveParamsMutation.mutate(localParams);
      setSaveDialogOpen(false);
    }
  }, [localParams, saveParamsMutation]);

  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const handleViewModel = (model: ModelConfig) => {
    setSelectedModel(model);
    setDetailOpen(true);
  };

  const getModelDetailSections = (model: ModelConfig): DetailSection[] => [
    {
      title: t("adminAITuning.detail.overview"),
      fields: [
        { label: t("adminAITuning.detail.modelName"), value: model.name },
        { label: t("adminAITuning.detail.layer"), value: model.layer, type: "badge" as const },
      ]
    },
    {
      title: t("adminAITuning.detail.parameters"),
      fields: [
        { label: t("adminAITuning.temperature"), value: model.temperature.toString() },
        { label: t("adminAITuning.maxTokens"), value: model.maxTokens.toString() },
        { label: t("adminAITuning.topP"), value: model.topP.toString() },
        { label: t("adminAITuning.freqPenalty"), value: model.frequencyPenalty.toString() },
        { label: t("adminAITuning.presPenalty"), value: model.presencePenalty.toString() },
      ]
    }
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="error-container">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">{t("adminAITuning.error.title")}</h2>
        <p className="text-muted-foreground mb-4" data-testid="text-error-description">{t("adminAITuning.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("adminAITuning.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="scroll-area-ai-tuning">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminAITuning.title")}</h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminAITuning.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="status-connection">
              {wsConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">{t("adminAITuning.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500">{t("adminAITuning.reconnecting")}</span>
                </>
              )}
            </div>
            {lastUpdate && (
              <span className="text-sm text-muted-foreground" data-testid="text-last-update">
                {t("adminAITuning.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500" data-testid="badge-unsaved-changes">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {t("adminAITuning.unsavedChanges")}
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminAITuning.refreshing") : t("adminAITuning.refresh")}
            </Button>
            <Button variant="outline" onClick={handleReset} data-testid="button-reset">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("adminAITuning.reset")}
            </Button>
            <Button variant="outline" onClick={handleTest} data-testid="button-test">
              <TestTube className="w-4 h-4 mr-2" />
              {t("adminAITuning.test")}
            </Button>
            <Button 
              disabled={!hasChanges || saveParamsMutation.isPending} 
              onClick={handleApply}
              data-testid="button-apply"
            >
              <Save className="w-4 h-4 mr-2" />
              {t("adminAITuning.applyChanges")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="models" className="space-y-4" data-testid="tabs-tuning">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="models" data-testid="tab-models">
              <Brain className="w-4 h-4 mr-2" />
              {t("adminAITuning.modelParameters")}
            </TabsTrigger>
            <TabsTrigger value="decisions" data-testid="tab-decisions">
              <Sliders className="w-4 h-4 mr-2" />
              {t("adminAITuning.decisionWeights")}
            </TabsTrigger>
            <TabsTrigger value="thresholds" data-testid="tab-thresholds">
              <Zap className="w-4 h-4 mr-2" />
              {t("adminAITuning.thresholds")}
            </TabsTrigger>
            <TabsTrigger value="advanced" data-testid="tab-advanced">
              <Settings className="w-4 h-4 mr-2" />
              {t("adminAITuning.advanced")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4" data-testid="tab-content-models">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} data-testid={`skeleton-model-${i}`}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-6">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Skeleton key={j} className="h-16 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              tuningData.modelConfigs.map((model, index) => (
                <Card key={index} data-testid={`card-model-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="flex items-center gap-2">
                        <Brain className={
                          model.layer === "Strategic" ? "text-blue-500" :
                          model.layer === "Tactical" ? "text-purple-500" :
                          "text-green-500"
                        } />
                        <span data-testid={`text-model-name-${index}`}>{model.name}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" data-testid={`badge-model-layer-${index}`}>
                          {model.layer === "Strategic" ? t("adminAITuning.strategicLayer") :
                           model.layer === "Tactical" ? t("adminAITuning.tacticalLayer") :
                           t("adminAITuning.operationalLayer")}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleViewModel(model)}
                          data-testid={`button-view-model-${index}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label data-testid={`label-temperature-${index}`}>{t("adminAITuning.temperature")}</Label>
                          <span className="text-sm font-medium" data-testid={`text-temperature-${index}`}>{model.temperature}</span>
                        </div>
                        <Slider 
                          defaultValue={[model.temperature * 100]} 
                          min={0} 
                          max={100} 
                          onValueChange={markChanged}
                          data-testid={`slider-temperature-${index}`}
                        />
                        <span className="text-xs text-muted-foreground">{t("adminAITuning.controlsRandomness")}</span>
                      </div>
                      <div className="space-y-2">
                        <Label data-testid={`label-max-tokens-${index}`}>{t("adminAITuning.maxTokens")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={model.maxTokens} 
                          onChange={markChanged}
                          data-testid={`input-max-tokens-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label data-testid={`label-top-p-${index}`}>{t("adminAITuning.topP")}</Label>
                          <span className="text-sm font-medium" data-testid={`text-top-p-${index}`}>{model.topP}</span>
                        </div>
                        <Slider 
                          defaultValue={[model.topP * 100]} 
                          min={0} 
                          max={100}
                          onValueChange={markChanged}
                          data-testid={`slider-top-p-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label data-testid={`label-freq-penalty-${index}`}>{t("adminAITuning.freqPenalty")}</Label>
                          <span className="text-sm font-medium" data-testid={`text-freq-penalty-${index}`}>{model.frequencyPenalty}</span>
                        </div>
                        <Slider 
                          defaultValue={[model.frequencyPenalty * 100]} 
                          min={0} 
                          max={100}
                          onValueChange={markChanged}
                          data-testid={`slider-freq-penalty-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label data-testid={`label-pres-penalty-${index}`}>{t("adminAITuning.presPenalty")}</Label>
                          <span className="text-sm font-medium" data-testid={`text-pres-penalty-${index}`}>{model.presencePenalty}</span>
                        </div>
                        <Slider 
                          defaultValue={[model.presencePenalty * 100]} 
                          min={0} 
                          max={100}
                          onValueChange={markChanged}
                          data-testid={`slider-pres-penalty-${index}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4" data-testid="tab-content-decisions">
            <Card data-testid="card-decision-type-weights">
              <CardHeader>
                <CardTitle data-testid="text-decision-weights-title">{t("adminAITuning.decisionTypeWeights")}</CardTitle>
                <CardDescription data-testid="text-decision-weights-desc">{t("adminAITuning.decisionTypeWeightsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" data-testid={`skeleton-decision-param-${i}`} />
                  ))
                ) : (
                  tuningData.decisionParams.map((param, index) => (
                    <div key={index} className="flex items-center gap-4" data-testid={`decision-param-${index}`}>
                      <div className="w-48">
                        <div className="flex items-center gap-2">
                          <Switch 
                            defaultChecked={param.enabled} 
                            onCheckedChange={markChanged}
                            data-testid={`switch-decision-${index}`}
                          />
                          <Label data-testid={`label-decision-${index}`}>
                            {param.name === "Consensus Optimization" ? t("adminAITuning.consensusOptimization") :
                             param.name === "Shard Rebalancing" ? t("adminAITuning.shardRebalancing") :
                             param.name === "Gas Price Adjustment" ? t("adminAITuning.gasPriceAdjustment") :
                             param.name === "Validator Selection" ? t("adminAITuning.validatorSelection") :
                             param.name === "Bridge Risk Assessment" ? t("adminAITuning.bridgeRiskAssessment") :
                             t("adminAITuning.burnRateOptimization")}
                          </Label>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Slider 
                          defaultValue={[param.weight * 100]} 
                          min={0} 
                          max={100}
                          disabled={!param.enabled}
                          onValueChange={markChanged}
                          data-testid={`slider-decision-${index}`}
                        />
                      </div>
                      <div className="w-16 text-right font-medium" data-testid={`text-decision-weight-${index}`}>
                        {(param.weight * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-layer-priority-weights">
              <CardHeader>
                <CardTitle data-testid="text-layer-weights-title">{t("adminAITuning.layerPriorityWeights")}</CardTitle>
                <CardDescription data-testid="text-layer-weights-desc">{t("adminAITuning.layerPriorityWeightsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" data-testid={`skeleton-layer-${i}`} />
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-4" data-testid="layer-strategic">
                      <div className="w-48 flex items-center gap-2">
                        <Brain className="text-blue-500" />
                        <Label>{t("adminAITuning.strategicLayer")}</Label>
                      </div>
                      <Slider 
                        defaultValue={[tuningData.layerWeights.strategic]} 
                        min={0} 
                        max={100} 
                        onValueChange={markChanged} 
                        className="flex-1"
                        data-testid="slider-layer-strategic"
                      />
                      <div className="w-16 text-right font-medium" data-testid="text-layer-strategic-value">{tuningData.layerWeights.strategic}%</div>
                    </div>
                    <div className="flex items-center gap-4" data-testid="layer-tactical">
                      <div className="w-48 flex items-center gap-2">
                        <Brain className="text-purple-500" />
                        <Label>{t("adminAITuning.tacticalLayer")}</Label>
                      </div>
                      <Slider 
                        defaultValue={[tuningData.layerWeights.tactical]} 
                        min={0} 
                        max={100} 
                        onValueChange={markChanged} 
                        className="flex-1"
                        data-testid="slider-layer-tactical"
                      />
                      <div className="w-16 text-right font-medium" data-testid="text-layer-tactical-value">{tuningData.layerWeights.tactical}%</div>
                    </div>
                    <div className="flex items-center gap-4" data-testid="layer-operational">
                      <div className="w-48 flex items-center gap-2">
                        <Brain className="text-green-500" />
                        <Label>{t("adminAITuning.operationalLayer")}</Label>
                      </div>
                      <Slider 
                        defaultValue={[tuningData.layerWeights.operational]} 
                        min={0} 
                        max={100} 
                        onValueChange={markChanged} 
                        className="flex-1"
                        data-testid="slider-layer-operational"
                      />
                      <div className="w-16 text-right font-medium" data-testid="text-layer-operational-value">{tuningData.layerWeights.operational}%</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thresholds" className="space-y-4" data-testid="tab-content-thresholds">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card data-testid="card-confidence-thresholds">
                <CardHeader>
                  <CardTitle data-testid="text-confidence-thresholds-title">{t("adminAITuning.confidenceThresholds")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" data-testid={`skeleton-threshold-${i}`} />
                    ))
                  ) : (
                    <>
                      <div className="space-y-2" data-testid="threshold-auto-execute">
                        <Label data-testid="label-auto-execute">{t("adminAITuning.autoExecuteThreshold")}</Label>
                        <div className="flex items-center gap-2">
                          <Slider 
                            defaultValue={[tuningData.thresholds.autoExecute]} 
                            min={50} 
                            max={100} 
                            onValueChange={markChanged} 
                            className="flex-1"
                            data-testid="slider-auto-execute"
                          />
                          <Input 
                            type="number" 
                            defaultValue={tuningData.thresholds.autoExecute} 
                            className="w-20" 
                            onChange={markChanged}
                            data-testid="input-auto-execute"
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t("adminAITuning.autoExecuteDesc")}</span>
                      </div>
                      <div className="space-y-2" data-testid="threshold-human-review">
                        <Label data-testid="label-human-review">{t("adminAITuning.humanReviewThreshold")}</Label>
                        <div className="flex items-center gap-2">
                          <Slider 
                            defaultValue={[tuningData.thresholds.humanReview]} 
                            min={30} 
                            max={80} 
                            onValueChange={markChanged} 
                            className="flex-1"
                            data-testid="slider-human-review"
                          />
                          <Input 
                            type="number" 
                            defaultValue={tuningData.thresholds.humanReview} 
                            className="w-20" 
                            onChange={markChanged}
                            data-testid="input-human-review"
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t("adminAITuning.humanReviewDesc")}</span>
                      </div>
                      <div className="space-y-2" data-testid="threshold-rejection">
                        <Label data-testid="label-rejection">{t("adminAITuning.rejectionThreshold")}</Label>
                        <div className="flex items-center gap-2">
                          <Slider 
                            defaultValue={[tuningData.thresholds.rejection]} 
                            min={10} 
                            max={50} 
                            onValueChange={markChanged} 
                            className="flex-1"
                            data-testid="slider-rejection"
                          />
                          <Input 
                            type="number" 
                            defaultValue={tuningData.thresholds.rejection} 
                            className="w-20" 
                            onChange={markChanged}
                            data-testid="input-rejection"
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t("adminAITuning.rejectionDesc")}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-rate-limits">
                <CardHeader>
                  <CardTitle data-testid="text-rate-limits-title">{t("adminAITuning.rateLimits")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" data-testid={`skeleton-rate-${i}`} />
                    ))
                  ) : (
                    <>
                      <div className="space-y-2" data-testid="rate-strategic">
                        <Label data-testid="label-rate-strategic">{t("adminAITuning.strategicPerHour")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={tuningData.rateLimits.strategicPerHour} 
                          onChange={markChanged}
                          data-testid="input-rate-strategic"
                        />
                      </div>
                      <div className="space-y-2" data-testid="rate-tactical">
                        <Label data-testid="label-rate-tactical">{t("adminAITuning.tacticalPerMinute")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={tuningData.rateLimits.tacticalPerMinute} 
                          onChange={markChanged}
                          data-testid="input-rate-tactical"
                        />
                      </div>
                      <div className="space-y-2" data-testid="rate-operational">
                        <Label data-testid="label-rate-operational">{t("adminAITuning.operationalPerSecond")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={tuningData.rateLimits.operationalPerSecond} 
                          onChange={markChanged}
                          data-testid="input-rate-operational"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-emergency-overrides">
              <CardHeader>
                <CardTitle data-testid="text-emergency-title">{t("adminAITuning.emergencyOverrides")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  [1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" data-testid={`skeleton-emergency-${i}`} />
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg" data-testid="emergency-actions">
                      <div>
                        <p className="font-medium" data-testid="text-emergency-actions-label">{t("adminAITuning.allowAIEmergency")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminAITuning.allowAIEmergencyDesc")}</p>
                      </div>
                      <Switch 
                        defaultChecked={tuningData.emergencySettings.allowEmergencyActions} 
                        onCheckedChange={markChanged}
                        data-testid="switch-emergency-actions"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg" data-testid="circuit-breaker">
                      <div>
                        <p className="font-medium" data-testid="text-circuit-breaker-label">{t("adminAITuning.circuitBreaker")}</p>
                        <p className="text-sm text-muted-foreground">{t("adminAITuning.circuitBreakerDesc")}</p>
                      </div>
                      <Switch 
                        defaultChecked={tuningData.emergencySettings.circuitBreaker} 
                        onCheckedChange={markChanged}
                        data-testid="switch-circuit-breaker"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4" data-testid="tab-content-advanced">
            <Card data-testid="card-advanced-config">
              <CardHeader>
                <CardTitle data-testid="text-advanced-title">{t("adminAITuning.advancedConfiguration")}</CardTitle>
                <CardDescription data-testid="text-advanced-desc">{t("adminAITuning.expertSettings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" data-testid={`skeleton-advanced-${i}`} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2" data-testid="advanced-consensus-timeout">
                        <Label data-testid="label-consensus-timeout">{t("adminAITuning.consensusTimeout")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={tuningData.advancedConfig.consensusTimeout} 
                          onChange={markChanged}
                          data-testid="input-consensus-timeout"
                        />
                      </div>
                      <div className="space-y-2" data-testid="advanced-retry-attempts">
                        <Label data-testid="label-retry-attempts">{t("adminAITuning.retryAttempts")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={tuningData.advancedConfig.retryAttempts} 
                          onChange={markChanged}
                          data-testid="input-retry-attempts"
                        />
                      </div>
                      <div className="space-y-2" data-testid="advanced-backoff-multiplier">
                        <Label data-testid="label-backoff-multiplier">{t("adminAITuning.backoffMultiplier")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={tuningData.advancedConfig.backoffMultiplier} 
                          step="0.1" 
                          onChange={markChanged}
                          data-testid="input-backoff-multiplier"
                        />
                      </div>
                      <div className="space-y-2" data-testid="advanced-cache-ttl">
                        <Label data-testid="label-cache-ttl">{t("adminAITuning.cacheTTL")}</Label>
                        <Input 
                          type="number" 
                          defaultValue={tuningData.advancedConfig.cacheTTL} 
                          onChange={markChanged}
                          data-testid="input-cache-ttl"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg" data-testid="caution-box">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium" data-testid="text-caution-title">{t("adminAITuning.caution")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-caution-desc">
                        {t("adminAITuning.cautionDesc")}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedModel && (
        <DetailSheet
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={t("adminAITuning.detail.title")}
          subtitle={selectedModel.layer}
          icon={<Brain className="w-5 h-5" />}
          sections={getModelDetailSections(selectedModel)}
        />
      )}

      <ConfirmationDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        title={t("adminAITuning.confirm.saveTitle")}
        description={t("adminAITuning.confirm.saveDescription")}
        confirmText={t("adminAITuning.confirm.save")}
        cancelText={t("adminAITuning.confirm.cancel")}
        variant="default"
        onConfirm={confirmApply}
        isLoading={saveParamsMutation.isPending}
      />

      <ConfirmationDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title={t("adminAITuning.confirm.resetTitle")}
        description={t("adminAITuning.confirm.resetDescription")}
        confirmText={t("adminAITuning.confirm.reset")}
        cancelText={t("adminAITuning.confirm.keep")}
        variant="destructive"
        onConfirm={confirmReset}
      />
    </ScrollArea>
  );
}
