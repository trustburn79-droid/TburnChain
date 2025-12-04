import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

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

export default function Execution() {
  const [activeTab, setActiveTab] = useState("pending");

  const executionTasks: ExecutionTask[] = [
    {
      id: "EXE-001",
      proposalId: "TIP-002",
      title: "Reduce Transaction Fee Base Rate",
      type: "Parameter Update",
      status: "completed",
      progress: 100,
      startTime: "2024-12-01 10:00:00",
      endTime: "2024-12-01 10:05:23",
      executedBy: "0x1234...5678",
      txHash: "0xabc123...def456",
    },
    {
      id: "EXE-002",
      proposalId: "TIP-005",
      title: "Upgrade AI Orchestration to v2.0",
      type: "System Upgrade",
      status: "completed",
      progress: 100,
      startTime: "2024-11-15 14:00:00",
      endTime: "2024-11-15 15:30:00",
      executedBy: "0xabcd...efgh",
      txHash: "0x789xyz...abc123",
    },
    {
      id: "EXE-003",
      proposalId: "TIP-001",
      title: "Increase Block Gas Limit to 30M",
      type: "Parameter Update",
      status: "pending",
      progress: 0,
    },
    {
      id: "EXE-004",
      proposalId: "TIP-003",
      title: "Add New Bridge Chain: Solana",
      type: "Integration",
      status: "pending",
      progress: 0,
    },
    {
      id: "EXE-005",
      proposalId: "TIP-006",
      title: "Update Validator Reward Distribution",
      type: "Parameter Update",
      status: "failed",
      progress: 45,
      startTime: "2024-11-20 09:00:00",
      endTime: "2024-11-20 09:12:34",
      executedBy: "0x9876...5432",
      error: "Insufficient validator signatures (got 3/5)",
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

  const filteredTasks = executionTasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Play className="h-8 w-8" />
              Execution Management
            </h1>
            <p className="text-muted-foreground">실행 관리 | Execute and monitor passed proposals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Execution</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting execution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{completedCount}</div>
              <p className="text-xs text-muted-foreground">Successfully executed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{failedCount}</div>
              <p className="text-xs text-muted-foreground">Execution failed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((completedCount / (completedCount + failedCount)) * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Execution success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Execution Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Queue</CardTitle>
            <CardDescription>Proposals pending execution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {executionTasks.filter(t => t.status === "pending").map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.proposalId}</Badge>
                      <Badge variant="secondary">{task.type}</Badge>
                    </div>
                    <p className="font-medium mt-1">{task.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Execution Details: {task.proposalId}</DialogTitle>
                        <DialogDescription>{task.title}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Execution ID</p>
                            <p className="font-mono">{task.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p>{task.type}</p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Execution Steps</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Shield className="h-4 w-4" />
                              <span>Verify multi-signature authorization</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Settings className="h-4 w-4" />
                              <span>Update network parameters</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Zap className="h-4 w-4" />
                              <span>Broadcast changes to network</span>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Execute Proposal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </Button>
                </div>
              </div>
            ))}
            {executionTasks.filter(t => t.status === "pending").length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending executions
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>Past execution records</CardDescription>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Executed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.filter(t => t.status !== "pending").map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono">{task.id}</TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="mb-1">{task.proposalId}</Badge>
                        <p className="text-sm">{task.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{task.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20">
                        <Progress value={task.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">{task.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.startTime && task.endTime ? (
                        <span className="text-sm text-muted-foreground">
                          {Math.round((new Date(task.endTime).getTime() - new Date(task.startTime).getTime()) / 60000)} min
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {task.executedBy || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {task.status === "failed" && (
                          <Button variant="ghost" size="icon">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Failed Execution Details */}
        {executionTasks.filter(t => t.status === "failed").length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Failed Executions
              </CardTitle>
              <CardDescription>Executions that require attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {executionTasks.filter(t => t.status === "failed").map((task) => (
                <div key={task.id} className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{task.proposalId}</Badge>
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <p className="text-sm text-red-500 mt-2">
                        Error: {task.error}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Failed at: {task.endTime}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
