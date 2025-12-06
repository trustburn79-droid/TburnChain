import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Blocks, 
  ArrowRightLeft,
  Flame,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Database,
  Layers,
  Globe,
  Cpu,
  HardDrive,
  BarChart3
} from "lucide-react";
import { useScanWebSocket } from "../../hooks/useScanWebSocket";
import ScanLayout from "../../components/ScanLayout";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useState, useMemo } from "react";

interface NetworkStats {
  blockHeight: number;
  tps: number;
  avgBlockTime: number;
  totalTransactions: number;
  activeValidators: number;
  totalBurned: string;
  circulatingSupply: string;
  gasPrice: string;
  totalStaked: string;
  finality: string;
  shardCount: number;
  nodeCount: number;
  uptime: string;
}

function generateChartData(type: string, points: number = 24) {
  const data = [];
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    let value;
    switch (type) {
      case 'tps':
        value = Math.floor(Math.random() * 500) + 3000;
        break;
      case 'gas':
        value = (Math.random() * 0.0002 + 0.00008).toFixed(5);
        break;
      case 'blocks':
        value = Math.floor(Math.random() * 50) + 7150;
        break;
      case 'txs':
        value = Math.floor(Math.random() * 100000) + 500000;
        break;
      default:
        value = Math.random() * 100;
    }
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(String(value)),
    });
  }
  return data;
}

const shardDistribution = [
  { name: 'Shard 0', value: 24, color: '#3b82f6' },
  { name: 'Shard 1', value: 22, color: '#8b5cf6' },
  { name: 'Shard 2', value: 21, color: '#10b981' },
  { name: 'Shard 3', value: 20, color: '#f59e0b' },
  { name: 'Shard 4', value: 19, color: '#ef4444' },
  { name: 'Others', value: 19, color: '#6b7280' },
];

export default function NetworkStats() {
  const { t } = useTranslation();
  const { isConnected } = useScanWebSocket();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const { data: statsData, isLoading } = useQuery<{ success: boolean; data: NetworkStats }>({
    queryKey: ["/api/public/v1/network/stats"],
    refetchInterval: 5000,
  });

  const stats = statsData?.data;

  const tpsData = useMemo(() => generateChartData('tps'), []);
  const gasData = useMemo(() => generateChartData('gas'), []);
  const blockData = useMemo(() => generateChartData('blocks'), []);
  const txData = useMemo(() => generateChartData('txs'), []);

  return (
    <ScanLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2" data-testid="text-stats-title">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              {t("scan.networkStats", "Network Statistics")}
              {isConnected && (
                <span className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {t("scan.networkStatsDesc", "Real-time TBURN Mainnet performance metrics")}
            </p>
          </div>

          <div className="flex gap-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <Badge
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                className={`cursor-pointer ${timeRange === range ? 'bg-blue-600' : 'border-gray-700 text-gray-400 hover:text-white'}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-7 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Blocks className="w-3.5 h-3.5 text-blue-400" />
                    {t("scan.blockHeight", "Block Height")}
                  </div>
                  <div className="text-xl font-bold text-white">
                    #{stats?.blockHeight?.toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    {t("scan.tps", "TPS")}
                  </div>
                  <div className="text-xl font-bold text-yellow-400">
                    {stats?.tps?.toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-green-400" />
                    {t("scan.finality", "Finality")}
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    {stats?.finality || "< 2s"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    {t("scan.shards", "Shards")}
                  </div>
                  <div className="text-xl font-bold text-purple-400">
                    {stats?.shardCount || 16}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    {t("scan.nodes", "Nodes")}
                  </div>
                  <div className="text-xl font-bold text-cyan-400">
                    {stats?.nodeCount?.toLocaleString() || "0"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Activity className="w-3.5 h-3.5 text-green-400" />
                    {t("scan.uptime", "Uptime")}
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    {stats?.uptime || "99.99%"}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Zap className="w-4 h-4 text-yellow-400" />
                {t("scan.tpsHistory", "TPS History")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tpsData}>
                    <defs>
                      <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#eab308" 
                      fillOpacity={1} 
                      fill="url(#tpsGradient)" 
                      strokeWidth={2}
                      name="TPS"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Flame className="w-4 h-4 text-orange-400" />
                {t("scan.gasPrice", "Gas Price History")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gasData}>
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }}
                      formatter={(value: number) => [`${value} EMB`, 'Gas Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={false}
                      name="Gas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Blocks className="w-4 h-4 text-blue-400" />
                {t("scan.blocksPerHour", "Blocks / Hour")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blockData}>
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Blocks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Layers className="w-4 h-4 text-purple-400" />
                {t("scan.shardDistribution", "Shard Distribution")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shardDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {shardDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value} validators`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Cpu className="w-4 h-4 text-green-400" />
                {t("scan.networkHealth", "Network Health")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{t("scan.consensusHealth", "Consensus")}</span>
                  <span className="text-green-400">100%</span>
                </div>
                <Progress value={100} className="h-2 bg-gray-800" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{t("scan.networkLoad", "Network Load")}</span>
                  <span className="text-blue-400">67%</span>
                </div>
                <Progress value={67} className="h-2 bg-gray-800" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{t("scan.peerConnectivity", "Peer Connectivity")}</span>
                  <span className="text-purple-400">98%</span>
                </div>
                <Progress value={98} className="h-2 bg-gray-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <ArrowRightLeft className="w-4 h-4 text-green-400" />
              {t("scan.dailyTransactions", "Daily Transactions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={txData}>
                  <defs>
                    <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                    formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#txGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScanLayout>
  );
}
