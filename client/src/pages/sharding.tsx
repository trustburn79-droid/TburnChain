import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Grid3x3, Layers, ArrowLeftRight, Brain, TrendingUp, Activity, Zap } from "lucide-react";
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
import type { Shard } from "@shared/schema";

export default function Sharding() {
  const { t } = useTranslation();
  const { data: shards, isLoading } = useQuery<Shard[]>({
    queryKey: ["/api/shards"],
  });

  const activeShards = shards?.filter(s => s.status === "active").length || 0;
  const totalTps = shards?.reduce((sum, s) => sum + s.tps, 0) || 0;
  const avgLoad = (shards?.reduce((sum, s) => sum + s.load, 0) || 0) / (shards?.length || 1);
  const totalValidators = shards?.reduce((sum, s) => sum + s.validatorCount, 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">{t('common.active')}</Badge>;
      case "syncing":
        return <Badge variant="secondary">{t('sharding.syncing')}</Badge>;
      case "error":
        return <Badge variant="destructive">{t('common.error')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return "text-red-600 dark:text-red-400";
    if (load >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Grid3x3 className="h-8 w-8" />
          {t('sharding.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('sharding.subtitle')}
        </p>
      </div>

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
              title={t('sharding.activeShards')}
              value={activeShards}
              icon={Layers}
              subtitle={t('sharding.ofTotal', { total: shards?.length || 0 })}
            />
            <StatCard
              title={t('sharding.combinedTps')}
              value={formatNumber(totalTps)}
              icon={ArrowLeftRight}
              trend={{ value: 18.3, isPositive: true }}
              subtitle={t('sharding.transactionsPerSec')}
            />
            <StatCard
              title={t('sharding.avgLoad')}
              value={`${avgLoad.toFixed(1)}%`}
              icon={Grid3x3}
              subtitle={t('sharding.acrossShards')}
            />
            <StatCard
              title={t('sharding.totalValidators')}
              value={totalValidators}
              icon={Grid3x3}
              subtitle={t('sharding.distributed')}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </>
        ) : shards && shards.length > 0 ? (
          shards.map((shard) => (
            <Card key={shard.id} className="hover-elevate" data-testid={`card-shard-${shard.shardId}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {shard.name}
                </CardTitle>
                {getStatusBadge(shard.status)}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('sharding.blockHeight')}</span>
                    <span className="font-semibold font-mono tabular-nums">
                      #{formatNumber(shard.blockHeight)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.transactions')}</span>
                    <span className="font-semibold tabular-nums">
                      {formatNumber(shard.transactionCount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('sharding.validators')}</span>
                    <span className="font-semibold tabular-nums">
                      {shard.validatorCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('sharding.tps')}</span>
                    <span className={`font-semibold tabular-nums ${getLoadColor(shard.load)}`}>
                      {formatNumber(shard.tps)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{t('sharding.shardLoad')}</span>
                    <span className={`font-semibold ${getLoadColor(shard.load)}`}>
                      {shard.load}%
                    </span>
                  </div>
                  <Progress
                    value={shard.load}
                    className="h-2"
                  />
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-xs" data-testid={`metric-mlopt-${shard.shardId}`}>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {t('sharding.mlOptimization')}:
                    </span>
                    <span className="font-semibold">{(shard.mlOptimizationScore / 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs" data-testid={`metric-predicted-${shard.shardId}`}>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {t('sharding.predictedLoad')}:
                    </span>
                    <span className="font-semibold">{shard.predictedLoad}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs" data-testid={`metric-profiling-${shard.shardId}`}>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {t('sharding.profiling')}:
                    </span>
                    <span className="font-semibold">{(shard.profilingScore / 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs" data-testid={`metric-capacity-${shard.shardId}`}>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {t('sharding.capacity')}:
                    </span>
                    <span className="font-semibold">{(shard.capacityUtilization / 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs">
                    {t('sharding.shardId')}: {shard.shardId}
                  </Badge>
                  <Badge 
                    variant={shard.aiRecommendation === "stable" ? "outline" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {shard.aiRecommendation}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">{t('sharding.noShardsConfigured')}</p>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('sharding.shardPerformanceDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : shards && shards.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sharding.shard')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('sharding.blockHeight')}</TableHead>
                    <TableHead>{t('common.transactions')}</TableHead>
                    <TableHead>{t('sharding.validators')}</TableHead>
                    <TableHead>{t('sharding.tps')}</TableHead>
                    <TableHead>{t('sharding.load')}</TableHead>
                    <TableHead>{t('sharding.mlOptimization')}</TableHead>
                    <TableHead>{t('sharding.predictedLoad')}</TableHead>
                    <TableHead>{t('sharding.aiRecommendation')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shards.map((shard) => (
                    <TableRow key={shard.id} className="hover-elevate">
                      <TableCell className="font-semibold">{shard.name}</TableCell>
                      <TableCell>{getStatusBadge(shard.status)}</TableCell>
                      <TableCell className="font-mono tabular-nums">
                        #{formatNumber(shard.blockHeight)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(shard.transactionCount)}
                      </TableCell>
                      <TableCell className="tabular-nums">{shard.validatorCount}</TableCell>
                      <TableCell className={`tabular-nums font-medium ${getLoadColor(shard.load)}`}>
                        {formatNumber(shard.tps)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={shard.load} className="w-16" />
                          <span className={`text-sm tabular-nums ${getLoadColor(shard.load)}`}>
                            {shard.load}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`metric-mlopt-table-${shard.shardId}`}>
                        <div className="flex items-center gap-2">
                          <Brain className="h-3 w-3 text-purple-500" />
                          <span className="text-sm tabular-nums font-medium">{(shard.mlOptimizationScore / 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`metric-predicted-table-${shard.shardId}`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-blue-500" />
                          <span className="text-sm tabular-nums font-medium">{shard.predictedLoad}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`metric-recommendation-${shard.shardId}`}>
                        <Badge 
                          variant={shard.aiRecommendation === "stable" ? "outline" : "secondary"}
                          className="capitalize"
                        >
                          {shard.aiRecommendation}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('sharding.noShardDataAvailable')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
