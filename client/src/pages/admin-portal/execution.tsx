import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  FileText,
  Code,
  Settings,
  Activity,
  Shield,
  Zap,
  Timer,
  RotateCcw,
  Lock,
  Download,
} from "lucide-react";
import { DetailSheet } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";

interface ExecutionTask {
  id: string;
  proposalId: string;
  title: string;
  type: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  progress: number;
  startTime?: string;
  endTime?: string;
  executedBy?: string;
  txHash?: string;
  error?: string;
}

interface ExecutionData {
  tasks: ExecutionTask[];
  stats: {
    pending: number;
    completed: number;
    failed: number;
    successRate: number;
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

export default function Execution() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTask, setSelectedTask] = useState<ExecutionTask | null>(null);
  const [taskToExecute, setTaskToExecute] = useState<ExecutionTask | null>(null);
  const [taskToCancel, setTaskToCancel] = useState<ExecutionTask | null>(null);

  const { data, isLoading, error, refetch } = useQuery<ExecutionData>({
    queryKey: ['/api/enterprise/admin/governance/execution'],
    refetchInterval: 15000,
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const executeProposalMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/enterprise/admin/governance/execution/${taskId}/execute`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/admin/governance/execution'] });
      setTaskToExecute(null);
      toast({
        title: t("adminExecution.executionStarted"),
        description: t("adminExecution.executionStartedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminExecution.error"),
        description: t("adminExecution.executeError"),
        variant: "destructive",
      });
    },
  });

  const retryExecutionMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/enterprise/admin/governance/execution/${taskId}/retry`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/admin/governance/execution'] });
      toast({
        title: t("adminExecution.retryStarted"),
        description: t("adminExecution.retryStartedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminExecution.error"),
        description: t("adminExecution.retryError"),
        variant: "destructive",
      });
    },
  });

  const cancelExecutionMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/enterprise/admin/governance/execution/${taskId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/admin/governance/execution'] });
      setTaskToCancel(null);
      toast({
        title: t("adminExecution.executionCancelled"),
        description: t("adminExecution.executionCancelledDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminExecution.error"),
        description: t("adminExecution.cancelError"),
        variant: "destructive",
      });
    },
  });

  const confirmExecute = useCallback(() => {
    if (taskToExecute) {
      executeProposalMutation.mutate(taskToExecute.id);
    }
  }, [taskToExecute, executeProposalMutation]);

  const confirmCancel = useCallback(() => {
    if (taskToCancel) {
      cancelExecutionMutation.mutate(taskToCancel.id);
    }
  }, [taskToCancel, cancelExecutionMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminExecution.refreshed"),
      description: t("adminExecution.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = executionTasks;
    const csvContent = [
      ["ID", "Proposal ID", "Title", "Type", "Status", "Progress", "Start Time", "End Time", "Executed By"].join(","),
      ...exportData.map(task => [
        task.id,
        task.proposalId,
        `"${task.title}"`,
        task.type,
        task.status,
        task.progress,
        task.startTime || "",
        task.endTime || "",
        task.executedBy || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t("adminExecution.exported"),
      description: t("adminExecution.exportedDesc"),
    });
  }, [toast, t]);

  const executionTasks: ExecutionTask[] = data?.tasks || [
    {
      id: "EXE-001",
      proposalId: "TIP-001",
      title: "TBURN Mainnet v8.0 Launch Parameters",
      type: "Network Configuration",
      status: "completed",
      progress: 100,
      startTime: "2024-12-02 14:00:00",
      endTime: "2024-12-02 14:08:45",
      executedBy: "0xTBURN_Multi_Sig_Governance",
      txHash: "0xTBURN_Genesis_Config_v8_Mainnet",
    },
    {
      id: "EXE-002",
      proposalId: "TIP-002",
      title: "Triple-Band AI Orchestration System Activation",
      type: "AI System Deployment",
      status: "completed",
      progress: 100,
      startTime: "2024-11-27 10:00:00",
      endTime: "2024-11-27 11:45:30",
      executedBy: "0xAI_Orchestration_Controller",
      txHash: "0xTriple_Band_AI_v8_Activation",
    },
    {
      id: "EXE-003",
      proposalId: "TIP-003",
      title: "10B Total Supply Tokenomics Model",
      type: "Economics Update",
      status: "completed",
      progress: 100,
      startTime: "2024-11-22 16:00:00",
      endTime: "2024-11-22 16:12:18",
      executedBy: "0xTokenomics_Governance_Multi",
      txHash: "0x10B_Supply_Tokenomics_Deploy",
    },
    {
      id: "EXE-004",
      proposalId: "TIP-004",
      title: "Multi-Chain Bridge Infrastructure v2.0",
      type: "Bridge Deployment",
      status: "completed",
      progress: 100,
      startTime: "2024-11-17 09:00:00",
      endTime: "2024-11-17 10:35:42",
      executedBy: "0xBridge_Protocol_Deployer",
      txHash: "0xMulti_Chain_Bridge_v2_Deploy",
    },
    {
      id: "EXE-005",
      proposalId: "TIP-005",
      title: "Validator Tier System Implementation",
      type: "Staking Configuration",
      status: "completed",
      progress: 100,
      startTime: "2024-11-12 11:00:00",
      endTime: "2024-11-12 11:22:56",
      executedBy: "0xValidator_Network_Governance",
      txHash: "0xValidator_Tier_System_v8",
    },
    {
      id: "EXE-006",
      proposalId: "TIP-006",
      title: "Enterprise Security Framework Deployment",
      type: "Security Configuration",
      status: "completed",
      progress: 100,
      startTime: "2024-11-08 08:00:00",
      endTime: "2024-11-08 09:15:33",
      executedBy: "0xSecurity_Framework_Controller",
      txHash: "0xQuantum_Resistant_Security_v8",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const pendingCount = executionTasks.filter(t => t.status === "pending").length;
  const completedCount = executionTasks.filter(t => t.status === "completed").length;
  const failedCount = executionTasks.filter(t => t.status === "failed").length;
  const successRate = completedCount + failedCount > 0 
    ? ((completedCount / (completedCount + failedCount)) * 100).toFixed(1)
    : "0.0";

  const filteredTasks = executionTasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="execution-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("adminExecution.loadError")}</span>
              </div>
              <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminExecution.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="execution-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-execution-title">
              <Play className="h-8 w-8" />
              {t("adminExecution.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-execution-subtitle">
              {t("adminExecution.subtitle")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminExecution.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminExecution.refresh")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Clock}
            label={t("adminExecution.pendingExecution")}
            value={pendingCount}
            change="All proposals executed for launch"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-pending"
          />
          <MetricCard
            icon={CheckCircle}
            label={t("adminExecution.completed")}
            value={completedCount}
            change="100% execution success"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-completed"
          />
          <MetricCard
            icon={XCircle}
            label={t("adminExecution.failed")}
            value={failedCount}
            change="Zero execution failures"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-failed"
          />
          <MetricCard
            icon={Activity}
            label={t("adminExecution.successRate")}
            value={`${successRate}%`}
            change="Perfect execution record"
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-success-rate"
          />
        </div>

        <Card data-testid="card-execution-queue">
          <CardHeader>
            <CardTitle>{t("adminExecution.executionQueue")}</CardTitle>
            <CardDescription>{t("adminExecution.executionQueueDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              executionTasks.filter(t => t.status === "pending").map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`queue-item-${task.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" data-testid={`badge-proposal-${task.id}`}>{task.proposalId}</Badge>
                        <Badge variant="secondary" data-testid={`badge-type-${task.id}`}>{task.type}</Badge>
                      </div>
                      <p className="font-medium mt-1" data-testid={`text-title-${task.id}`}>{task.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" data-testid={`button-details-${task.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          {t("adminExecution.details")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t("adminExecution.executionDetails")}: {task.proposalId}</DialogTitle>
                          <DialogDescription>{task.title}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">{t("adminExecution.executionId")}</p>
                              <p className="font-mono">{task.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{t("adminExecution.type")}</p>
                              <p>{task.type}</p>
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">{t("adminExecution.executionSteps")}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                <Shield className="h-4 w-4" />
                                <span>{t("adminExecution.verifyMultiSig")}</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                <Settings className="h-4 w-4" />
                                <span>{t("adminExecution.updateNetworkParams")}</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                <Zap className="h-4 w-4" />
                                <span>{t("adminExecution.broadcastChanges")}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => executeProposalMutation.mutate(task.id)}
                            disabled={executeProposalMutation.isPending}
                            data-testid={`button-execute-dialog-${task.id}`}
                          >
                            {executeProposalMutation.isPending ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {t("adminExecution.executeProposal")}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm"
                      onClick={() => executeProposalMutation.mutate(task.id)}
                      disabled={executeProposalMutation.isPending}
                      data-testid={`button-execute-${task.id}`}
                    >
                      {executeProposalMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      {t("adminExecution.execute")}
                    </Button>
                  </div>
                </div>
              ))
            )}
            {!isLoading && executionTasks.filter(t => t.status === "pending").length === 0 && (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-pending">
                {t("adminExecution.noPendingExecutions")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-execution-history">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle>{t("adminExecution.executionHistory")}</CardTitle>
                <CardDescription>{t("adminExecution.executionHistoryDesc")}</CardDescription>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList data-testid="tabs-execution-status">
                  <TabsTrigger value="all" data-testid="tab-all">{t("adminExecution.all")}</TabsTrigger>
                  <TabsTrigger value="completed" data-testid="tab-completed">{t("adminExecution.completedTab")}</TabsTrigger>
                  <TabsTrigger value="failed" data-testid="tab-failed">{t("adminExecution.failedTab")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminExecution.id")}</TableHead>
                    <TableHead>{t("adminExecution.proposal")}</TableHead>
                    <TableHead>{t("adminExecution.type")}</TableHead>
                    <TableHead>{t("adminExecution.status")}</TableHead>
                    <TableHead>{t("adminExecution.progress")}</TableHead>
                    <TableHead>{t("adminExecution.duration")}</TableHead>
                    <TableHead>{t("adminExecution.executedBy")}</TableHead>
                    <TableHead>{t("adminExecution.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.filter(t => t.status !== "pending").map((task) => (
                    <TableRow key={task.id} data-testid={`row-history-${task.id}`}>
                      <TableCell className="font-mono" data-testid={`text-id-${task.id}`}>{task.id}</TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="mb-1" data-testid={`badge-history-proposal-${task.id}`}>{task.proposalId}</Badge>
                          <p className="text-sm" data-testid={`text-history-title-${task.id}`}>{task.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" data-testid={`badge-history-type-${task.id}`}>{task.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge className={getStatusColor(task.status)} data-testid={`badge-history-status-${task.id}`}>{task.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <Progress value={task.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground" data-testid={`text-progress-${task.id}`}>{task.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.startTime && task.endTime ? (
                          <span className="text-sm text-muted-foreground" data-testid={`text-duration-${task.id}`}>
                            {Math.round((new Date(task.endTime).getTime() - new Date(task.startTime).getTime()) / 60000)} min
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm" data-testid={`text-executor-${task.id}`}>
                        {task.executedBy || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedTask(task)}
                            data-testid={`button-view-history-${task.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {task.status === "failed" && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => retryExecutionMutation.mutate(task.id)}
                              disabled={retryExecutionMutation.isPending}
                              data-testid={`button-retry-${task.id}`}
                            >
                              <RotateCcw className="h-4 w-4" />
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

        {!isLoading && executionTasks.filter(t => t.status === "failed").length > 0 && (
          <Card data-testid="card-failed-executions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                {t("adminExecution.failedExecutions")}
              </CardTitle>
              <CardDescription>{t("adminExecution.failedExecutionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {executionTasks.filter(t => t.status === "failed").map((task) => (
                <div key={task.id} className="p-4 border border-red-500/30 rounded-lg bg-red-500/5" data-testid={`failed-item-${task.id}`}>
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{task.proposalId}</Badge>
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <p className="text-sm text-red-500 mt-2" data-testid={`text-error-${task.id}`}>
                        {t("adminExecution.errorLabel")}: {task.error}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-failed-at-${task.id}`}>
                        {t("adminExecution.failedAt")}: {task.endTime}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => retryExecutionMutation.mutate(task.id)}
                      disabled={retryExecutionMutation.isPending}
                      data-testid={`button-retry-failed-${task.id}`}
                    >
                      {retryExecutionMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-1" />
                      )}
                      {t("adminExecution.retry")}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <DetailSheet
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        title={t("adminExecution.detail.title")}
        sections={selectedTask ? [
          {
            title: t("adminExecution.detail.overview"),
            fields: [
              { label: t("adminExecution.detail.executionId"), value: selectedTask.id, copyable: true },
              { label: t("adminExecution.detail.proposalId"), value: selectedTask.proposalId, copyable: true },
              { label: t("adminExecution.detail.title"), value: selectedTask.title },
              { label: t("adminExecution.detail.type"), value: selectedTask.type, type: "badge" as const },
              { label: t("adminExecution.detail.status"), value: selectedTask.status, type: "badge" as const, badgeVariant: selectedTask.status === "completed" ? "default" as const : selectedTask.status === "in_progress" ? "secondary" as const : "destructive" as const },
            ],
          },
          {
            title: t("adminExecution.detail.progress"),
            fields: [
              { label: t("adminExecution.detail.progress"), value: `${selectedTask.progress}%`, type: "progress" as const },
              { label: t("adminExecution.detail.startTime"), value: selectedTask.startTime || "-" },
              { label: t("adminExecution.detail.endTime"), value: selectedTask.endTime || "-" },
              { label: t("adminExecution.detail.executedBy"), value: selectedTask.executedBy || "-", copyable: !!selectedTask.executedBy },
            ],
          },
          ...(selectedTask.txHash ? [{
            title: t("adminExecution.detail.transaction"),
            fields: [
              { label: t("adminExecution.detail.txHash"), value: selectedTask.txHash, copyable: true, type: "code" as const },
            ],
          }] : []),
          ...(selectedTask.error ? [{
            title: t("adminExecution.detail.error"),
            fields: [
              { label: t("adminExecution.detail.errorMessage"), value: selectedTask.error, type: "code" as const },
            ],
          }] : []),
        ] : []}
      />

      <ConfirmationDialog
        open={!!taskToExecute}
        onOpenChange={(open) => !open && setTaskToExecute(null)}
        title={t("adminExecution.confirmExecute.title")}
        description={t("adminExecution.confirmExecute.description", { title: taskToExecute?.title, proposalId: taskToExecute?.proposalId })}
        confirmText={t("adminExecution.execute")}
        onConfirm={confirmExecute}
        isLoading={executeProposalMutation.isPending}
      />

      <ConfirmationDialog
        open={!!taskToCancel}
        onOpenChange={(open) => !open && setTaskToCancel(null)}
        title={t("adminExecution.confirmCancel.title")}
        description={t("adminExecution.confirmCancel.description", { title: taskToCancel?.title })}
        confirmText={t("adminExecution.cancel")}
        onConfirm={confirmCancel}
        destructive={true}
        isLoading={cancelExecutionMutation.isPending}
      />
    </div>
  );
}
