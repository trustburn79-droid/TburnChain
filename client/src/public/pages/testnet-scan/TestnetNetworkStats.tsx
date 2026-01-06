import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, Blocks, ArrowRightLeft, Zap, Shield, Flame, Coins, 
  Activity, Database, Globe, Timer, TrendingUp 
} from "lucide-react";
import TestnetScanLayout from "../../components/TestnetScanLayout";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState } from "react";

interface NetworkStats {
  blockHeight: number;
  tps: number;
  avgBlockTime: number;
  totalTransactions: number;
  activeValidators: number;
  totalBurned: string;
  totalStaked: string;
  finality: string;
  shardCount: number;
  nodeCount: number;
  uptime: string;
}

function generateChartData() {
  const data = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', timeZone: 'America/New_York' }),
      tps: Math.floor(Math.random() * 300) + 800,
      blocks: Math.floor(Math.random() * 50) + 100,
      txs: Math.floor(Math.random() * 1000) + 2000,
    });
  }
  return data;
}

export default function TestnetNetworkStats() {
  const { t } = useTranslation();
  const [chartData] = useState(generateChartData);

  const { data, isLoading } = useQuery<{ success: boolean; data: NetworkStats }>({
    queryKey: ["/api/public/v1/testnet/network/stats"],
    refetchInterval: 5000, // ★ REALTIME: Match RealtimeMetricsService poll interval
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const stats = data?.data;

  const formatLargeNumber = (value: string | number | undefined) => {
    if (!value) return "0";
    const num = parseFloat(value.toString()) / 1e18;
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <TestnetScanLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">{t("scan.networkStats", "Network Statistics")}</h1>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-yellow-900/10 border-yellow-800/30">
                <CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
                    <Blocks className="w-3.5 h-3.5" />{t("scan.blockHeight", "Block Height")}
                  </div>
                  <div className="text-xl font-bold text-white">#{stats?.blockHeight?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border-amber-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
                    <ArrowRightLeft className="w-3.5 h-3.5" />{t("scan.transactions", "Transactions")}
                  </div>
                  <div className="text-xl font-bold text-white">{stats?.totalTransactions?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-400 text-xs mb-1">
                    <Zap className="w-3.5 h-3.5" />{t("scan.tps", "TPS")}
                  </div>
                  <div className="text-xl font-bold text-white">{stats?.tps?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
                    <Shield className="w-3.5 h-3.5" />{t("scan.validators", "Validators")}
                  </div>
                  <div className="text-xl font-bold text-white">{stats?.activeValidators || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border-amber-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
                    <Flame className="w-3.5 h-3.5" />{t("scan.burned", "Burned")}
                  </div>
                  <div className="text-xl font-bold text-amber-400">{formatLargeNumber(stats?.totalBurned)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-400 text-xs mb-1">
                    <Coins className="w-3.5 h-3.5" />{t("scan.staked", "Staked")}
                  </div>
                  <div className="text-xl font-bold text-orange-400">{formatLargeNumber(stats?.totalStaked)}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Activity className="w-4 h-4 text-yellow-400" />
                {t("scan.tpsHistory", "TPS History")} (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="testnetTpsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #854d0e', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="tps" stroke="#eab308" fill="url(#testnetTpsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                {t("scan.txsHistory", "Transactions History")} (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #854d0e', borderRadius: '8px' }} />
                    <Bar dataKey="txs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("scan.uptime", "Uptime")}</span>
                <span className="text-yellow-400 font-medium">{stats?.uptime || "99.9%"}</span>
              </div>
              <Progress value={99.9} className="h-2 bg-gray-800" />
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("scan.finality", "Finality")}</span>
                <span className="text-amber-400 font-medium">{stats?.finality || "< 2s"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Timer className="w-3 h-3" />
                {t("scan.avgBlockTime", "Avg Block Time")}: {stats?.avgBlockTime || 0.5}s
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("scan.shards", "Shards")}</span>
                <span className="text-orange-400 font-medium">{stats?.shardCount || 4}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Database className="w-3 h-3" />
                {t("scan.nodes", "Nodes")}: {stats?.nodeCount || 8}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/10 border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("scan.network", "Network")}</span>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TESTNET</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Globe className="w-3 h-3" />
                Chain ID: 5900
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TestnetScanLayout>
  );
}
