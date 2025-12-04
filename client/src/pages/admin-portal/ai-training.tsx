import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Brain, Database, Play, Pause, Clock, CheckCircle, 
  AlertTriangle, BarChart3, TrendingUp, Layers
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminAITraining() {
  const trainingJobs = [
    { id: 1, name: "Consensus Optimizer v2.1", model: "Llama 3.3", status: "running", progress: 67, eta: "2h 15m", dataPoints: "1.2M" },
    { id: 2, name: "Shard Balancer v1.8", model: "Custom", status: "completed", progress: 100, eta: "-", dataPoints: "850K" },
    { id: 3, name: "Gas Predictor v3.0", model: "Claude FT", status: "queued", progress: 0, eta: "~4h", dataPoints: "2.1M" },
    { id: 4, name: "Anomaly Detector v2.5", model: "Llama 3.3", status: "paused", progress: 45, eta: "-", dataPoints: "500K" },
  ];

  const datasets = [
    { name: "Transaction Patterns", records: "15.2M", size: "8.5 GB", lastUpdated: "2024-12-03", quality: 98 },
    { name: "Validator Performance", records: "2.8M", size: "1.2 GB", lastUpdated: "2024-12-03", quality: 99 },
    { name: "Network Metrics", records: "45.6M", size: "12.3 GB", lastUpdated: "2024-12-02", quality: 97 },
    { name: "Security Events", records: "890K", size: "450 MB", lastUpdated: "2024-12-03", quality: 95 },
  ];

  const accuracyData = [
    { epoch: 1, accuracy: 75, loss: 0.45 },
    { epoch: 2, accuracy: 82, loss: 0.32 },
    { epoch: 3, accuracy: 88, loss: 0.24 },
    { epoch: 4, accuracy: 92, loss: 0.18 },
    { epoch: 5, accuracy: 95, loss: 0.12 },
    { epoch: 6, accuracy: 97, loss: 0.08 },
  ];

  const modelVersions = [
    { version: "v2.1.0", date: "2024-12-03", accuracy: 98.7, status: "production" },
    { version: "v2.0.5", date: "2024-11-28", accuracy: 97.2, status: "backup" },
    { version: "v2.0.0", date: "2024-11-15", accuracy: 96.5, status: "archived" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">AI Training Management</h1>
            <p className="text-muted-foreground">Manage model training, datasets, and deployments</p>
          </div>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            New Training Job
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Active Jobs</span>
              </div>
              <div className="text-3xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">1 running, 1 queued</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total Data</span>
              </div>
              <div className="text-3xl font-bold">64.5M</div>
              <div className="text-sm text-muted-foreground">Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Avg Accuracy</span>
              </div>
              <div className="text-3xl font-bold">97.4%</div>
              <div className="text-sm text-muted-foreground">Across all models</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Model Versions</span>
              </div>
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">In production</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              <Brain className="w-4 h-4 mr-2" />
              Training Jobs
            </TabsTrigger>
            <TabsTrigger value="datasets" data-testid="tab-datasets">
              <Database className="w-4 h-4 mr-2" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="versions" data-testid="tab-versions">
              <Layers className="w-4 h-4 mr-2" />
              Versions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Training Jobs</CardTitle>
                <CardDescription>Active and recent training runs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Data Points</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.name}</TableCell>
                        <TableCell>{job.model}</TableCell>
                        <TableCell>
                          <Badge variant={
                            job.status === "running" ? "default" :
                            job.status === "completed" ? "outline" :
                            job.status === "queued" ? "secondary" : "destructive"
                          } className={
                            job.status === "running" ? "bg-blue-500" :
                            job.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/30" : ""
                          }>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={job.progress} className="flex-1" />
                            <span className="text-sm">{job.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{job.dataPoints}</TableCell>
                        <TableCell className="text-muted-foreground">{job.eta}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {job.status === "running" && (
                              <Button size="icon" variant="ghost">
                                <Pause className="w-4 h-4" />
                              </Button>
                            )}
                            {job.status === "paused" && (
                              <Button size="icon" variant="ghost">
                                <Play className="w-4 h-4" />
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
          </TabsContent>

          <TabsContent value="datasets">
            <Card>
              <CardHeader>
                <CardTitle>Training Datasets</CardTitle>
                <CardDescription>Available data for model training</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dataset Name</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Quality Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datasets.map((dataset, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dataset.name}</TableCell>
                        <TableCell>{dataset.records}</TableCell>
                        <TableCell>{dataset.size}</TableCell>
                        <TableCell className="text-muted-foreground">{dataset.lastUpdated}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={dataset.quality} className="w-16" />
                            <span className={dataset.quality >= 95 ? "text-green-500" : "text-yellow-500"}>
                              {dataset.quality}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Training Metrics</CardTitle>
                <CardDescription>Accuracy and loss over training epochs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'bottom' }} />
                      <YAxis yAxisId="left" domain={[70, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 0.5]} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#22c55e" name="Accuracy %" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#ef4444" name="Loss" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Model Versions</CardTitle>
                <CardDescription>Deployed model versions and history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelVersions.map((version, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono font-medium">{version.version}</TableCell>
                        <TableCell>{version.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            {version.accuracy}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            version.status === "production" ? "default" :
                            version.status === "backup" ? "secondary" : "outline"
                          }>
                            {version.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {version.status !== "production" && (
                            <Button size="sm" variant="outline">Deploy</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
