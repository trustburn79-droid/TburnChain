import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Brain, Database, Play, Pause, Clock, CheckCircle, 
  AlertTriangle, BarChart3, TrendingUp, Layers, RefreshCw,
  Download, Wifi, WifiOff, AlertCircle, X, Eye
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TrainingJob {
  id: number;
  name: string;
  model: string;
  status: string;
  progress: number;
  eta: string;
  dataPoints: string;
}

interface Dataset {
  name: string;
  records: string;
  size: string;
  lastUpdated: string;
  quality: number;
}

interface AccuracyDataPoint {
  epoch: number;
  accuracy: number;
  loss: number;
}

interface ModelVersion {
  version: string;
  date: string;
  accuracy: number;
  status: string;
}

interface TrainingData {
  jobs: TrainingJob[];
  datasets: Dataset[];
  accuracyData: AccuracyDataPoint[];
  modelVersions: ModelVersion[];
  stats: {
    activeJobs: number;
    runningJobs: number;
    queuedJobs: number;
    totalData: string;
    avgAccuracy: number;
    modelVersions: number;
  };
}

const mockData: TrainingData = {
  jobs: [
    { id: 1, name: "Mainnet Consensus Optimizer v8.0", model: "Gemini 3 Pro FT", status: "running", progress: 94, eta: "25m", dataPoints: "18.5M" },
    { id: 2, name: "Quantum Shard Balancer v4.2", model: "Claude Sonnet 4.5 FT", status: "completed", progress: 100, eta: "-", dataPoints: "12.8M" },
    { id: 3, name: "Burn Rate Predictor v5.0", model: "GPT-4o FT", status: "completed", progress: 100, eta: "-", dataPoints: "8.4M" },
    { id: 4, name: "Bridge Risk Analyzer v3.5", model: "Custom Ensemble", status: "running", progress: 78, eta: "1h 45m", dataPoints: "6.2M" },
    { id: 5, name: "Validator Selection AI v6.0", model: "Llama 3.3 FT", status: "queued", progress: 0, eta: "~3h", dataPoints: "15.2M" },
  ],
  datasets: [
    { name: "TBURN Transaction Patterns", records: "245.8M", size: "128.5 GB", lastUpdated: "2024-12-07", quality: 99 },
    { name: "Validator Performance Metrics", records: "48.5M", size: "24.2 GB", lastUpdated: "2024-12-07", quality: 99 },
    { name: "Network Consensus Logs", records: "185.2M", size: "96.8 GB", lastUpdated: "2024-12-07", quality: 98 },
    { name: "Burn Event History", records: "12.4M", size: "6.8 GB", lastUpdated: "2024-12-07", quality: 99 },
    { name: "Bridge Transaction Records", records: "8.9M", size: "4.5 GB", lastUpdated: "2024-12-07", quality: 97 },
  ],
  accuracyData: [
    { epoch: 1, accuracy: 82, loss: 0.38 },
    { epoch: 2, accuracy: 88, loss: 0.25 },
    { epoch: 3, accuracy: 93, loss: 0.15 },
    { epoch: 4, accuracy: 96, loss: 0.09 },
    { epoch: 5, accuracy: 98, loss: 0.05 },
    { epoch: 6, accuracy: 99, loss: 0.02 },
  ],
  modelVersions: [
    { version: "v8.0.0", date: "2024-12-07", accuracy: 99.2, status: "production" },
    { version: "v7.5.2", date: "2024-12-01", accuracy: 98.7, status: "backup" },
    { version: "v7.0.0", date: "2024-11-15", accuracy: 97.8, status: "archived" },
    { version: "v6.5.0", date: "2024-10-28", accuracy: 96.5, status: "archived" },
  ],
  stats: {
    activeJobs: 3,
    runningJobs: 2,
    queuedJobs: 1,
    totalData: "500.8M",
    avgAccuracy: 99.2,
    modelVersions: 24
  }
};

export default function AdminAITraining() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveJobs, setLiveJobs] = useState<TrainingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [jobToCancel, setJobToCancel] = useState<TrainingJob | null>(null);

  const { data, isLoading, error, refetch } = useQuery<TrainingData>({
    queryKey: ["/api/admin/ai/training"],
    enabled: true,
    refetchInterval: 30000,
  });

  const trainingData = data && data.stats ? data : mockData;
  const jobs = liveJobs.length > 0 ? liveJobs : trainingData.jobs;

  const pauseJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest('POST', `/api/admin/ai/training/${jobId}/pause`);
    },
    onSuccess: (_, jobId) => {
      const job = jobs.find(j => j.id === jobId);
      toast({
        title: t("adminTraining.jobPaused"),
        description: t("adminTraining.jobPausedDesc", { name: job?.name }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai/training"] });
    },
  });

  const resumeJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest('POST', `/api/admin/ai/training/${jobId}/resume`);
    },
    onSuccess: (_, jobId) => {
      const job = jobs.find(j => j.id === jobId);
      toast({
        title: t("adminTraining.jobStarted"),
        description: t("adminTraining.jobStartedDesc", { name: job?.name }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai/training"] });
    },
  });

  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest('POST', `/api/admin/ai/training/${jobId}/cancel`);
    },
    onSuccess: (_, jobId) => {
      const job = jobs.find(j => j.id === jobId);
      toast({
        title: t("adminTraining.jobCancelled"),
        description: t("adminTraining.jobCancelledDesc", { name: job?.name }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai/training"] });
    },
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => {
        setWsConnected(true);
        setLastUpdate(new Date());
        reconnectAttempts = 0;
        ws?.send(JSON.stringify({ type: 'subscribe', channel: 'ai_training' }));
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === 'ai_training_update' || update.type === 'job_update') {
            if (update.data?.jobs) {
              setLiveJobs(update.data.jobs);
            } else if (update.data?.id) {
              setLiveJobs(prev => {
                const existing = prev.find(j => j.id === update.data.id);
                if (existing) {
                  return prev.map(j => j.id === update.data.id ? update.data : j);
                }
                return [update.data, ...prev];
              });
            }
            setLastUpdate(new Date());
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(connect, delay);
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
      setLastUpdate(new Date());
      toast({
        title: t("adminTraining.refreshSuccess"),
        description: t("adminTraining.refreshSuccessDesc"),
      });
    } catch {
      toast({
        title: t("adminTraining.error.title"),
        description: t("adminTraining.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      jobs,
      datasets: trainingData.datasets,
      accuracyData: trainingData.accuracyData,
      modelVersions: trainingData.modelVersions,
      stats: trainingData.stats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-training-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("adminTraining.exportSuccess"),
      description: t("adminTraining.exportSuccessDesc"),
    });
  }, [trainingData, jobs, toast, t]);

  const handleViewJob = (job: TrainingJob) => {
    setSelectedJob(job);
    setDetailOpen(true);
  };

  const handleCancelJob = (job: TrainingJob) => {
    setJobToCancel(job);
    setCancelDialogOpen(true);
  };

  const confirmCancelJob = () => {
    if (jobToCancel) {
      cancelJobMutation.mutate(jobToCancel.id);
      setCancelDialogOpen(false);
      setJobToCancel(null);
    }
  };

  const getJobDetailSections = (job: TrainingJob): DetailSection[] => [
    {
      title: t("adminTraining.detail.overview"),
      fields: [
        { label: t("adminTraining.detail.jobId"), value: job.id.toString(), copyable: true },
        { label: t("adminTraining.detail.name"), value: job.name },
        { label: t("adminTraining.detail.model"), value: job.model, type: "badge" as const },
        { label: t("adminTraining.detail.status"), value: job.status === "running" ? "active" : job.status === "completed" ? "success" : job.status === "paused" ? "warning" : "pending", type: "status" as const },
      ]
    },
    {
      title: t("adminTraining.detail.progress"),
      fields: [
        { label: t("adminTraining.progress"), value: job.progress, type: "progress" as const },
        { label: t("adminTraining.dataPoints"), value: job.dataPoints },
        { label: t("adminTraining.eta"), value: job.eta },
      ]
    }
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="error-container">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">{t("adminTraining.error.title")}</h2>
        <p className="text-muted-foreground mb-4" data-testid="text-error-description">{t("adminTraining.error.description")}</p>
        <Button onClick={() => refetch()} data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("adminTraining.retry")}
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" data-testid="scroll-area-ai-training">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminTraining.title")}</h1>
            <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminTraining.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="status-connection">
              {wsConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">{t("adminTraining.connected")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500">{t("adminTraining.reconnecting")}</span>
                </>
              )}
            </div>
            {lastUpdate && (
              <span className="text-sm text-muted-foreground" data-testid="text-last-update">
                {t("adminTraining.lastUpdate")}: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("adminTraining.refreshing") : t("adminTraining.refresh")}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("adminTraining.export")}
            </Button>
            <Button data-testid="button-new-job">
              <Play className="w-4 h-4 mr-2" />
              {t("adminTraining.newTrainingJob")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="skeleton-stats">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="grid-stats">
            <Card data-testid="card-stat-active-jobs">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">{t("adminTraining.activeJobs")}</span>
                </div>
                <div className="text-3xl font-bold" data-testid="text-active-jobs">{trainingData.stats.activeJobs}</div>
                <div className="text-sm text-muted-foreground">
                  {trainingData.stats.runningJobs} {t("adminTraining.running")}, {trainingData.stats.queuedJobs} {t("adminTraining.queued")}
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-total-data">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">{t("adminTraining.totalData")}</span>
                </div>
                <div className="text-3xl font-bold" data-testid="text-total-data">{trainingData.stats.totalData}</div>
                <div className="text-sm text-muted-foreground">{t("adminTraining.records")}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-accuracy">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">{t("adminTraining.avgAccuracy")}</span>
                </div>
                <div className="text-3xl font-bold" data-testid="text-avg-accuracy">{trainingData.stats.avgAccuracy}%</div>
                <div className="text-sm text-muted-foreground">{t("adminTraining.acrossAllModels")}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-versions">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">{t("adminTraining.modelVersions")}</span>
                </div>
                <div className="text-3xl font-bold" data-testid="text-model-versions">{trainingData.stats.modelVersions}</div>
                <div className="text-sm text-muted-foreground">{t("adminTraining.inProduction")}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="jobs" className="space-y-4" data-testid="tabs-training">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              <Brain className="w-4 h-4 mr-2" />
              {t("adminTraining.trainingJobs")}
            </TabsTrigger>
            <TabsTrigger value="datasets" data-testid="tab-datasets">
              <Database className="w-4 h-4 mr-2" />
              {t("adminTraining.datasets")}
            </TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t("adminTraining.metrics")}
            </TabsTrigger>
            <TabsTrigger value="versions" data-testid="tab-versions">
              <Layers className="w-4 h-4 mr-2" />
              {t("adminTraining.versions")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" data-testid="tab-content-jobs">
            <Card data-testid="card-training-jobs">
              <CardHeader>
                <CardTitle data-testid="text-training-jobs-title">{t("adminTraining.trainingJobs")}</CardTitle>
                <CardDescription data-testid="text-training-jobs-desc">{t("adminTraining.activeRecentRuns")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3" data-testid="skeleton-jobs">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-jobs">
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-head-job-name">{t("adminTraining.jobName")}</TableHead>
                        <TableHead data-testid="table-head-model">{t("adminTraining.model")}</TableHead>
                        <TableHead data-testid="table-head-status">{t("adminTraining.status")}</TableHead>
                        <TableHead data-testid="table-head-progress">{t("adminTraining.progress")}</TableHead>
                        <TableHead data-testid="table-head-data-points">{t("adminTraining.dataPoints")}</TableHead>
                        <TableHead data-testid="table-head-eta">{t("adminTraining.eta")}</TableHead>
                        <TableHead data-testid="table-head-actions">{t("adminTraining.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                          <TableCell className="font-medium" data-testid={`text-job-name-${job.id}`}>{job.name}</TableCell>
                          <TableCell data-testid={`text-job-model-${job.id}`}>{job.model}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                job.status === "running" ? "default" :
                                job.status === "completed" ? "outline" :
                                job.status === "queued" ? "secondary" : "destructive"
                              } 
                              className={
                                job.status === "running" ? "bg-blue-500" :
                                job.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/30" : ""
                              }
                              data-testid={`badge-job-status-${job.id}`}
                            >
                              {job.status === "running" ? t("adminTraining.running_status") :
                               job.status === "completed" ? t("adminTraining.completed") :
                               job.status === "queued" ? t("adminTraining.queued_status") :
                               t("adminTraining.paused")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Progress value={job.progress} className="flex-1" data-testid={`progress-job-${job.id}`} />
                              <span className="text-sm" data-testid={`text-job-progress-${job.id}`}>{job.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-job-data-points-${job.id}`}>{job.dataPoints}</TableCell>
                          <TableCell className="text-muted-foreground" data-testid={`text-job-eta-${job.id}`}>{job.eta}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => handleViewJob(job)}
                                data-testid={`button-view-job-${job.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {job.status === "running" && (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => pauseJobMutation.mutate(job.id)}
                                  disabled={pauseJobMutation.isPending}
                                  data-testid={`button-pause-job-${job.id}`}
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              )}
                              {job.status === "paused" && (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => resumeJobMutation.mutate(job.id)}
                                  disabled={resumeJobMutation.isPending}
                                  data-testid={`button-resume-job-${job.id}`}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              {(job.status === "running" || job.status === "paused" || job.status === "queued") && (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleCancelJob(job)}
                                  disabled={cancelJobMutation.isPending}
                                  data-testid={`button-cancel-job-${job.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
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

          <TabsContent value="datasets" data-testid="tab-content-datasets">
            <Card data-testid="card-datasets">
              <CardHeader>
                <CardTitle data-testid="text-datasets-title">{t("adminTraining.trainingDatasets")}</CardTitle>
                <CardDescription data-testid="text-datasets-desc">{t("adminTraining.availableDatasets")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3" data-testid="skeleton-datasets">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-datasets">
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-head-dataset-name">{t("adminTraining.datasetName")}</TableHead>
                        <TableHead data-testid="table-head-records">{t("adminTraining.records")}</TableHead>
                        <TableHead data-testid="table-head-size">{t("adminTraining.size")}</TableHead>
                        <TableHead data-testid="table-head-last-updated">{t("adminTraining.lastUpdated")}</TableHead>
                        <TableHead data-testid="table-head-quality">{t("adminTraining.qualityScore")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingData.datasets.map((dataset, index) => (
                        <TableRow key={index} data-testid={`row-dataset-${index}`}>
                          <TableCell className="font-medium" data-testid={`text-dataset-name-${index}`}>{dataset.name}</TableCell>
                          <TableCell data-testid={`text-dataset-records-${index}`}>{dataset.records}</TableCell>
                          <TableCell data-testid={`text-dataset-size-${index}`}>{dataset.size}</TableCell>
                          <TableCell className="text-muted-foreground" data-testid={`text-dataset-updated-${index}`}>{dataset.lastUpdated}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={dataset.quality} className="w-16" data-testid={`progress-dataset-quality-${index}`} />
                              <span 
                                className={dataset.quality >= 95 ? "text-green-500" : "text-yellow-500"}
                                data-testid={`text-dataset-quality-${index}`}
                              >
                                {dataset.quality}%
                              </span>
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

          <TabsContent value="metrics" data-testid="tab-content-metrics">
            <Card data-testid="card-metrics">
              <CardHeader>
                <CardTitle data-testid="text-metrics-title">{t("adminTraining.trainingMetrics")}</CardTitle>
                <CardDescription data-testid="text-metrics-desc">{t("adminTraining.accuracyLossDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" data-testid="skeleton-chart" />
                ) : (
                  <div className="h-80" data-testid="chart-accuracy">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trainingData.accuracyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="epoch" label={{ value: t("adminTraining.epoch"), position: 'bottom' }} />
                        <YAxis yAxisId="left" domain={[70, 100]} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 0.5]} />
                        <Tooltip />
                        <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#22c55e" name={t("adminTraining.accuracy")} strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#ef4444" name={t("adminTraining.loss")} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" data-testid="tab-content-versions">
            <Card data-testid="card-versions">
              <CardHeader>
                <CardTitle data-testid="text-versions-title">{t("adminTraining.modelVersions")}</CardTitle>
                <CardDescription data-testid="text-versions-desc">{t("adminTraining.deployedVersions")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3" data-testid="skeleton-versions">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table data-testid="table-versions">
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-head-version">{t("adminTraining.version")}</TableHead>
                        <TableHead data-testid="table-head-date">{t("adminTraining.date")}</TableHead>
                        <TableHead data-testid="table-head-accuracy">{t("adminTraining.accuracy")}</TableHead>
                        <TableHead data-testid="table-head-status">{t("adminTraining.status")}</TableHead>
                        <TableHead data-testid="table-head-actions">{t("adminTraining.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingData.modelVersions.map((version, index) => (
                        <TableRow key={index} data-testid={`row-version-${index}`}>
                          <TableCell className="font-mono font-medium" data-testid={`text-version-${index}`}>{version.version}</TableCell>
                          <TableCell data-testid={`text-version-date-${index}`}>{version.date}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className="bg-green-500/10 text-green-500"
                              data-testid={`badge-version-accuracy-${index}`}
                            >
                              {version.accuracy}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                version.status === "production" ? "default" :
                                version.status === "backup" ? "secondary" : "outline"
                              }
                              data-testid={`badge-version-status-${index}`}
                            >
                              {version.status === "production" ? t("adminTraining.production") :
                               version.status === "backup" ? t("adminTraining.backup") :
                               t("adminTraining.archived")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {version.status !== "production" && (
                              <Button size="sm" variant="outline" data-testid={`button-deploy-${index}`}>
                                {t("adminTraining.deploy")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedJob && (
        <DetailSheet
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={t("adminTraining.detail.title")}
          subtitle={selectedJob.model}
          icon={<Brain className="w-5 h-5" />}
          sections={getJobDetailSections(selectedJob)}
        />
      )}

      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={t("adminTraining.confirm.cancelTitle")}
        description={t("adminTraining.confirm.cancelDescription", { name: jobToCancel?.name })}
        confirmText={t("adminTraining.confirm.cancel")}
        cancelText={t("adminTraining.confirm.keep")}
        destructive={true}
        onConfirm={confirmCancelJob}
        isLoading={cancelJobMutation.isPending}
      />
    </ScrollArea>
  );
}
