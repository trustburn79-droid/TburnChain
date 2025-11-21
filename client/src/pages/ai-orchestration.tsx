import { useQuery } from "@tanstack/react-query";
import { Bot, Cpu, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import type { AiModel } from "@shared/schema";

export default function AIOrchestration() {
  const { data: aiModels, isLoading } = useQuery<AiModel[]>({
    queryKey: ["/api/ai/models"],
  });

  const totalRequests = aiModels?.reduce((sum, m) => sum + m.requestCount, 0) || 0;
  const totalCost = aiModels?.reduce((sum, m) => sum + parseFloat(m.totalCost), 0) || 0;
  const avgResponseTime = aiModels?.reduce((sum, m) => sum + m.avgResponseTime, 0) / (aiModels?.length || 1) || 0;
  const avgCacheHitRate = aiModels?.reduce((sum, m) => sum + m.cacheHitRate, 0) / (aiModels?.length || 1) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModelIcon = (name: string) => {
    if (name.includes("gpt")) return "🤖";
    if (name.includes("claude")) return "🧠";
    if (name.includes("llama")) return "🦙";
    return "🔮";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Bot className="h-8 w-8" />
          AI Orchestration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Triple-Band AI model management and monitoring (GPT-5, Claude, Llama)
        </p>
      </div>

      {/* AI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Requests"
              value={formatNumber(totalRequests)}
              icon={Zap}
              subtitle="all models"
            />
            <StatCard
              title="Avg Response Time"
              value={`${avgResponseTime.toFixed(0)}ms`}
              icon={Cpu}
              trend={{ value: 8.5, isPositive: false }}
              subtitle="across models"
            />
            <StatCard
              title="Cache Hit Rate"
              value={`${avgCacheHitRate.toFixed(1)}%`}
              icon={Zap}
              trend={{ value: 15.2, isPositive: true }}
              subtitle="cost savings"
            />
            <StatCard
              title="Total Cost"
              value={`$${totalCost.toFixed(2)}`}
              icon={DollarSign}
              subtitle="API usage"
            />
          </>
        )}
      </div>

      {/* Model Status Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </>
        ) : aiModels && aiModels.length > 0 ? (
          aiModels.map((model) => {
            const successRate = model.requestCount > 0
              ? (model.successCount / model.requestCount) * 100
              : 0;

            return (
              <Card key={model.id} className="hover-elevate" data-testid={`card-ai-model-${model.name}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="text-2xl">{getModelIcon(model.name)}</span>
                    {model.name}
                  </CardTitle>
                  {getStatusBadge(model.status)}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Requests</span>
                      <span className="font-semibold tabular-nums">{formatNumber(model.requestCount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-semibold tabular-nums">{successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Time</span>
                      <span className="font-semibold tabular-nums">{model.avgResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cache Hit</span>
                      <span className="font-semibold tabular-nums">{model.cacheHitRate}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                    <Progress value={successRate} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">Total Cost</div>
                    <div className="text-lg font-semibold tabular-nums">${parseFloat(model.totalCost).toFixed(4)}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">No AI models configured</p>
          </div>
        )}
      </div>

      {/* Detailed Model Table */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : aiModels && aiModels.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Cache Hit</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiModels.map((model) => (
                    <TableRow key={model.id} className="hover-elevate">
                      <TableCell className="font-semibold">
                        {getModelIcon(model.name)} {model.name}
                      </TableCell>
                      <TableCell>{getStatusBadge(model.status)}</TableCell>
                      <TableCell className="tabular-nums">{formatNumber(model.requestCount)}</TableCell>
                      <TableCell className="tabular-nums text-green-600 dark:text-green-400">
                        {formatNumber(model.successCount)}
                      </TableCell>
                      <TableCell className="tabular-nums text-red-600 dark:text-red-400">
                        {formatNumber(model.failureCount)}
                      </TableCell>
                      <TableCell className="tabular-nums">{model.avgResponseTime}ms</TableCell>
                      <TableCell className="tabular-nums">{model.cacheHitRate}%</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        ${parseFloat(model.totalCost).toFixed(4)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No model data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
