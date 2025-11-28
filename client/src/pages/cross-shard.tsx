import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Network, ArrowRightLeft, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useWebSocketChannel } from "@/hooks/use-websocket-channel";
import { crossShardMessagesSnapshotSchema } from "@shared/schema";
import type { CrossShardMessage, Shard } from "@shared/schema";

export default function CrossShard() {
  const { t } = useTranslation();
  const { data: messages, isLoading: messagesLoading } = useQuery<CrossShardMessage[]>({
    queryKey: ["/api/cross-shard/messages"],
  });

  const { data: shards, isLoading: shardsLoading } = useQuery<Shard[]>({
    queryKey: ["/api/shards"],
  });

  useWebSocketChannel({
    channel: "cross_shard_snapshot",
    schema: crossShardMessagesSnapshotSchema,
    queryKey: ["/api/cross-shard/messages"],
    updateMode: "snapshot",
  });

  const pendingMessages = messages?.filter(m => m.status === 'pending').length || 0;
  const confirmedMessages = messages?.filter(m => m.status === 'confirmed').length || 0;
  const failedMessages = messages?.filter(m => m.status === 'failed').length || 0;
  const totalGasUsed = messages?.reduce((sum, m) => sum + Number(m.gasUsed), 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />{t('crossShard.confirmed')}</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t('common.pending')}</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t('common.failed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "transfer":
        return "text-blue-600 dark:text-blue-400";
      case "contract_call":
        return "text-purple-600 dark:text-purple-400";
      case "state_sync":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Network className="h-8 w-8" />
          {t('crossShard.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('crossShard.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {messagesLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title={t('crossShard.pendingMessages')}
              value={formatNumber(pendingMessages)}
              icon={Clock}
              subtitle={t('crossShard.awaitingConfirmation')}
            />
            <StatCard
              title={t('crossShard.confirmed')}
              value={formatNumber(confirmedMessages)}
              icon={CheckCircle}
              trend={{ value: 12.5, isPositive: true }}
              subtitle={t('crossShard.successfulTransfers')}
            />
            <StatCard
              title={t('common.failed')}
              value={formatNumber(failedMessages)}
              icon={XCircle}
              subtitle={t('crossShard.retryOrInvestigate')}
            />
            <StatCard
              title={t('crossShard.totalGasUsed')}
              value={formatNumber(totalGasUsed)}
              icon={ArrowRightLeft}
              subtitle={t('crossShard.crossShardOperations')}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('crossShard.shardTopology')}</CardTitle>
          <CardDescription>{t('crossShard.shardNetworkArchitecture', { count: 5 })}</CardDescription>
        </CardHeader>
        <CardContent>
          {shardsLoading ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : shards && shards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {shards.map((shard) => (
                <Card key={shard.id} className="hover-elevate" data-testid={`card-shard-${shard.shardId}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{shard.name}</div>
                      <Badge variant={shard.status === 'active' ? 'default' : shard.status === 'syncing' ? 'secondary' : 'destructive'} className="text-xs capitalize">
                        {shard.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">{formatNumber(shard.tps)}</div>
                    <div className="text-xs text-muted-foreground">{t('sharding.tps')}</div>
                    <div className="space-y-1 pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t('sharding.blockHeight')}:</span>
                        <span className="font-semibold tabular-nums">{formatNumber(shard.blockHeight)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t('sharding.validators')}:</span>
                        <span className="font-semibold tabular-nums">{shard.validatorCount}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t('sharding.load')}:</span>
                        <span className="font-semibold tabular-nums">{shard.load}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('sharding.noShardDataAvailable')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            {t('crossShard.messageQueue')}
          </CardTitle>
          <CardDescription>
            {t('crossShard.messageRoutingStatus')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messagesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('crossShard.fromTo')}</TableHead>
                    <TableHead>{t('common.type')}</TableHead>
                    <TableHead>{t('crossShard.transactionHash')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('crossShard.retryCount')}</TableHead>
                    <TableHead>{t('common.gasUsed')}</TableHead>
                    <TableHead>{t('crossShard.timestamp')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id} className="hover-elevate" data-testid={`row-message-${message.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <Badge variant="outline" className="text-xs">{t('crossShard.shard')} {message.fromShardId}</Badge>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{t('crossShard.shard')} {message.toShardId}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`capitalize font-medium ${getMessageTypeColor(message.messageType)}`}>
                          {message.messageType.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs" title={message.transactionHash}>
                        {message.transactionHash.slice(0, 10)}...{message.transactionHash.slice(-8)}
                      </TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell className="tabular-nums">
                        {message.retryCount > 0 ? (
                          <Badge variant="secondary">{message.retryCount} {t('crossShard.retries')}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{formatNumber(Number(message.gasUsed))}</TableCell>
                      <TableCell className="text-muted-foreground text-sm tabular-nums">
                        {new Date(message.sentAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('crossShard.noCrossShardMessages')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
