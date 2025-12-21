import { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  FileCode, CheckCircle, XCircle, Code2, List, Activity, BarChart3, 
  Search, Filter, Eye, Shield, Zap, DollarSign, Clock, Hash, 
  AlertTriangle, TrendingUp, Layers, Server, RefreshCw, ChevronRight,
  FileText, GitBranch, ArrowUpRight, ArrowDownRight, Database,
  Cpu, Terminal, Play, Settings, ExternalLink, Copy, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAddress, formatTimeAgo, formatNumber, formatTokenAmount, formatGasEmber } from "@/lib/format";
import { SmartContractEditor } from "@/components/SmartContractEditor";
import { useToast } from "@/hooks/use-toast";
import type { SmartContract } from "@shared/schema";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];

const localeMap: Record<string, string> = {
  en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', hi: 'hi-IN', es: 'es-ES',
  fr: 'fr-FR', ar: 'ar-SA', bn: 'bn-BD', ru: 'ru-RU', pt: 'pt-BR', ur: 'ur-PK', ko: 'ko-KR',
};

type TranslationFn = (key: string, options?: { defaultValue?: string }) => string;

type StatType = 'totalContracts' | 'verifiedContracts' | 'interactions' | 'gasUsage' | 'tvl';

interface ContractActivity {
  id: string;
  type: 'deploy' | 'call' | 'verify' | 'upgrade';
  contractAddress: string;
  contractName: string;
  caller: string;
  method?: string;
  gasUsed: number;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  txHash: string;
}

function generateMockActivities(): ContractActivity[] {
  const types: ContractActivity['type'][] = ['deploy', 'call', 'verify', 'upgrade'];
  const statuses: ContractActivity['status'][] = ['success', 'pending', 'failed'];
  const methods = ['transfer', 'approve', 'stake', 'withdraw', 'mint', 'burn', 'swap', 'addLiquidity'];
  const contracts = [
    { name: 'TBURN Token', address: '0x1234...5678' },
    { name: 'Staking Pool', address: '0xABCD...EF01' },
    { name: 'DEX Router', address: '0x9876...5432' },
    { name: 'NFT Collection', address: '0xFEDC...BA98' },
    { name: 'Governance', address: '0x2468...1357' },
  ];
  
  return Array.from({ length: 50 }, (_, i) => {
    const contract = contracts[Math.floor(Math.random() * contracts.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const status: ContractActivity['status'] = Math.random() > 0.1 ? 'success' : statuses[Math.floor(Math.random() * 2) + 1];
    return {
      id: `activity-${i}`,
      type,
      contractAddress: contract.address,
      contractName: contract.name,
      caller: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      method: type === 'call' ? methods[Math.floor(Math.random() * methods.length)] : undefined,
      gasUsed: Math.floor(Math.random() * 500000) + 21000,
      status,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function ContractStatsDialog({
  open,
  onOpenChange,
  statType,
  contracts,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statType: StatType | null;
  contracts: SmartContract[];
  t: TranslationFn;
}) {
  if (!statType) return null;

  const hasContracts = contracts.length > 0;

  const getDialogContent = () => {
    switch (statType) {
      case 'totalContracts': {
        const byType = [
          { name: 'Token (ERC-20)', count: Math.floor(contracts.length * 0.35), color: CHART_COLORS[0] },
          { name: 'NFT (ERC-721)', count: Math.floor(contracts.length * 0.25), color: CHART_COLORS[1] },
          { name: 'DeFi', count: Math.floor(contracts.length * 0.2), color: CHART_COLORS[2] },
          { name: 'Governance', count: Math.floor(contracts.length * 0.12), color: CHART_COLORS[3] },
          { name: 'Other', count: Math.floor(contracts.length * 0.08), color: CHART_COLORS[4] },
        ];

        const deploymentTrend = Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          deployed: Math.floor(Math.random() * 15) + 5,
          upgraded: Math.floor(Math.random() * 5),
        }));

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-blue-500" />
                {t('smartContracts.contractAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('smartContracts.contractAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.contractTypeDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={byType}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), t('smartContracts.contracts')]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {byType.map((item, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.deploymentTrend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={deploymentTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="deployed" fill="#3B82F6" name={t('smartContracts.deployed')} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="upgraded" fill="#10B981" name={t('smartContracts.upgraded')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4 bg-muted">
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(contracts.length)}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.totalDeployed')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatNumber(Math.floor(contracts.length * 0.15))}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.thisWeek')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(Math.floor(contracts.length * 0.08))}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.upgradeable')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">+12.5%</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.growthRate')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
      }

      case 'verifiedContracts': {
        const verified = contracts.filter(c => c.verified).length;
        const unverified = contracts.length - verified;
        const verificationRate = contracts.length > 0 ? (verified / contracts.length) * 100 : 0;

        const verificationData = [
          { name: t('smartContracts.verified'), value: verified, color: '#10B981' },
          { name: t('smartContracts.unverified'), value: unverified, color: '#EF4444' },
        ];

        const securityScores = [
          { level: 'A+ (Excellent)', count: Math.floor(verified * 0.3), color: '#10B981' },
          { level: 'A (Good)', count: Math.floor(verified * 0.35), color: '#3B82F6' },
          { level: 'B (Fair)', count: Math.floor(verified * 0.25), color: '#F59E0B' },
          { level: 'C (Needs Review)', count: Math.floor(verified * 0.1), color: '#EF4444' },
        ];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                {t('smartContracts.verificationAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('smartContracts.verificationAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.verificationStatus')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={verificationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {verificationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-green-600">{verificationRate.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground ml-2">{t('smartContracts.verificationRate')}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.securityScoreDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityScores.map((score, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{score.level}</span>
                          <span className="text-sm font-semibold">{score.count}</span>
                        </div>
                        <Progress value={(score.count / verified) * 100} className="h-2" style={{ '--progress-color': score.color } as any} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4 bg-muted">
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{verified}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.verified')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{unverified}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.unverified')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{Math.floor(verified * 0.65)}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.auditedContracts')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">98.2%</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.securityScore')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
      }

      case 'interactions': {
        const totalInteractions = contracts.reduce((sum, c) => sum + c.transactionCount, 0);
        
        const interactionTrend = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          calls: Math.floor(Math.random() * 1000) + 200,
          transfers: Math.floor(Math.random() * 500) + 100,
        }));

        const methodDistribution = [
          { method: 'transfer', count: Math.floor(totalInteractions * 0.35) },
          { method: 'approve', count: Math.floor(totalInteractions * 0.2) },
          { method: 'swap', count: Math.floor(totalInteractions * 0.18) },
          { method: 'stake', count: Math.floor(totalInteractions * 0.12) },
          { method: 'mint', count: Math.floor(totalInteractions * 0.08) },
          { method: 'other', count: Math.floor(totalInteractions * 0.07) },
        ];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                {t('smartContracts.interactionAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('smartContracts.interactionAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.hourlyActivity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={interactionTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" interval={3} />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="calls" fill="#8B5CF6" fillOpacity={0.3} stroke="#8B5CF6" name={t('smartContracts.calls')} />
                      <Area type="monotone" dataKey="transfers" fill="#10B981" fillOpacity={0.3} stroke="#10B981" name={t('smartContracts.transfers')} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.methodDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={methodDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="method" className="text-xs" width={60} />
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), t('smartContracts.calls')]} />
                      <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4 bg-muted">
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(totalInteractions)}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.totalCalls')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatNumber(Math.floor(totalInteractions / 24))}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.avgPerHour')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">99.2%</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.successRate')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">+8.3%</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.dailyGrowth')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
      }

      case 'gasUsage': {
        const avgGas = 125000;
        const gasData = Array.from({ length: 12 }, (_, i) => ({
          time: `${i * 2}:00`,
          avgGas: Math.floor(Math.random() * 50000) + 100000,
          gasPrice: Math.floor(Math.random() * 50) + 20,
        }));

        const gasDistribution = [
          { range: '< 50K', count: 25 },
          { range: '50K-100K', count: 35 },
          { range: '100K-200K', count: 28 },
          { range: '200K-500K', count: 10 },
          { range: '> 500K', count: 2 },
        ];

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {t('smartContracts.gasAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('smartContracts.gasAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.gasUsageTrend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={gasData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgGas" stroke="#F59E0B" strokeWidth={2} name={t('smartContracts.avgGas')} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.gasDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gasDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4 bg-muted">
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{formatNumber(avgGas)}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.avgGasUsed')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">25 EMB</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.avgGasPrice')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">3.1M EMB</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.totalGasSpent')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">-12%</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.optimization')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
      }

      case 'tvl': {
        const totalTVLWei = contracts.reduce((sum, c) => {
          try {
            return sum + BigInt(c.balance || "0");
          } catch {
            return sum;
          }
        }, BigInt(0));
        
        const tvlByContract = contracts
          .sort((a, b) => {
            try {
              const balanceA = BigInt(a.balance || "0");
              const balanceB = BigInt(b.balance || "0");
              return balanceB > balanceA ? 1 : balanceB < balanceA ? -1 : 0;
            } catch {
              return 0;
            }
          })
          .slice(0, 5)
          .map((c, i) => ({
            name: c.name.slice(0, 15),
            tvl: Number(BigInt(c.balance || "0") / BigInt(10 ** 14)) / 10000,
            color: CHART_COLORS[i],
          }));

        const tvlTrend = Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          tvl: Math.floor(Math.random() * 1000000) + 5000000,
        }));

        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                {t('smartContracts.tvlAnalytics')}
              </DialogTitle>
              <DialogDescription>{t('smartContracts.tvlAnalyticsDesc')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.tvlByContract')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={tvlByContract}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="tvl"
                      >
                        {tvlByContract.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} TBURN`, 'TVL']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.tvlTrend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={tvlTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => [`${formatNumber(Number(value))} TBURN`, 'TVL']} />
                      <Area type="monotone" dataKey="tvl" fill="#10B981" fillOpacity={0.3} stroke="#10B981" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4 bg-muted">
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatTokenAmount(totalTVLWei.toString())}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.totalTvl')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{contracts.filter(c => BigInt(c.balance || "0") > BigInt(0)).length}</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.contractsWithTvl')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">$12.5M</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.usdValue')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">+15.2%</div>
                    <div className="text-xs text-muted-foreground">{t('smartContracts.weeklyChange')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}

function ContractDetailDialog({
  open,
  onOpenChange,
  contract,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: SmartContract | null;
  t: TranslationFn;
}) {
  const [detailTab, setDetailTab] = useState<'overview' | 'abi' | 'events' | 'code'>('overview');
  const { toast } = useToast();

  if (!contract) return null;

  const mockEvents = [
    { name: 'Transfer', args: 'from: 0x123..., to: 0x456..., value: 1000', block: 11234567, time: '2 min ago' },
    { name: 'Approval', args: 'owner: 0x789..., spender: 0xABC..., value: 500', block: 11234560, time: '5 min ago' },
    { name: 'Mint', args: 'to: 0xDEF..., amount: 10000', block: 11234550, time: '8 min ago' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('common.copied'), description: t('smartContracts.addressCopied') });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            {contract.name}
            {contract.verified && (
              <Badge className="bg-green-600 ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('smartContracts.verified')}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="font-mono">{contract.address}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(contract.address)} data-testid="button-copy-contract-address">
              <Copy className="h-3 w-3" />
            </Button>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={detailTab} onValueChange={(v) => setDetailTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-contract-overview">{t('smartContracts.overview')}</TabsTrigger>
            <TabsTrigger value="abi" data-testid="tab-contract-abi">{t('smartContracts.abi')}</TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-contract-events">{t('smartContracts.events')}</TabsTrigger>
            <TabsTrigger value="code" data-testid="tab-contract-code">{t('smartContracts.sourceCode')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.contractInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('smartContracts.creator')}</span>
                    <span className="font-mono text-sm">{formatAddress(contract.creator)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('smartContracts.deployed')}</span>
                    <span>{formatTimeAgo(Math.floor(new Date(contract.deployedAt).getTime() / 1000))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.balance')}</span>
                    <span className="font-semibold">{formatTokenAmount(contract.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.transactions')}</span>
                    <span className="font-semibold">{formatNumber(contract.transactionCount)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('smartContracts.securityInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('smartContracts.verificationStatus')}</span>
                    <Badge variant={contract.verified ? "default" : "secondary"} className={contract.verified ? "bg-green-600" : ""}>
                      {contract.verified ? t('smartContracts.verified') : t('smartContracts.unverified')}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('smartContracts.auditStatus')}</span>
                    <Badge variant="outline">{t('smartContracts.pendingAudit')}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('smartContracts.securityScore')}</span>
                    <span className="font-semibold text-green-600">A+ (98/100)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('smartContracts.optimizer')}</span>
                    <Badge className="bg-blue-600">{t('smartContracts.enabled')}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('smartContracts.recentTransactions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('smartContracts.method')}</TableHead>
                      <TableHead>{t('common.from')}</TableHead>
                      <TableHead>{t('smartContracts.gasUsed')}</TableHead>
                      <TableHead>{t('common.time')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { method: 'transfer', from: '0x1234...5678', gas: 65000, time: '1 min ago', status: 'success' },
                      { method: 'approve', from: '0xABCD...EF01', gas: 45000, time: '3 min ago', status: 'success' },
                      { method: 'mint', from: '0x9876...5432', gas: 85000, time: '5 min ago', status: 'success' },
                    ].map((tx, i) => (
                      <TableRow key={i}>
                        <TableCell><Badge variant="outline">{tx.method}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">{tx.from}</TableCell>
                        <TableCell>{formatNumber(tx.gas)}</TableCell>
                        <TableCell>{tx.time}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('common.success')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abi" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">{t('smartContracts.contractAbi')}</CardTitle>
                <Button variant="outline" size="sm" data-testid="button-download-abi">
                  <Download className="h-4 w-4 mr-2" />
                  {t('smartContracts.downloadAbi')}
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(contract.abi || [
                      { "type": "function", "name": "transfer", "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}], "outputs": [{"type": "bool"}] },
                      { "type": "function", "name": "balanceOf", "inputs": [{"name": "account", "type": "address"}], "outputs": [{"type": "uint256"}] },
                      { "type": "event", "name": "Transfer", "inputs": [{"name": "from", "type": "address", "indexed": true}, {"name": "to", "type": "address", "indexed": true}, {"name": "value", "type": "uint256"}] }
                    ], null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('smartContracts.recentEvents')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('smartContracts.eventName')}</TableHead>
                      <TableHead>{t('smartContracts.arguments')}</TableHead>
                      <TableHead>{t('common.block')}</TableHead>
                      <TableHead>{t('common.time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEvents.map((event, i) => (
                      <TableRow key={i}>
                        <TableCell><Badge variant="outline">{event.name}</Badge></TableCell>
                        <TableCell className="font-mono text-xs max-w-[300px] truncate">{event.args}</TableCell>
                        <TableCell>{formatNumber(event.block)}</TableCell>
                        <TableCell>{event.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">{t('smartContracts.sourceCode')}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-copy-source-code">
                    <Copy className="h-4 w-4 mr-2" />
                    {t('common.copy')}
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-view-on-explorer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('smartContracts.viewOnExplorer')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono">
                    {contract.sourceCode || `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${contract.name} {
    string public name = "${contract.name}";
    
    // Contract source code not available
    // Please verify the contract to view source code
}`}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" variant="outline" data-testid="button-read-contract">
            <Eye className="h-4 w-4 mr-2" />
            {t('smartContracts.readContract')}
          </Button>
          <Button className="flex-1" data-testid="button-write-contract">
            <Terminal className="h-4 w-4 mr-2" />
            {t('smartContracts.writeContract')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SmartContracts() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStat, setSelectedStat] = useState<StatType | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");

  const { data: contracts, isLoading } = useQuery<SmartContract[]>({
    queryKey: ["/api/contracts"],
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const activities = useMemo(() => generateMockActivities(), []);

  const verifiedContracts = contracts?.filter(c => c.verified).length || 0;
  const totalContracts = contracts?.length || 0;
  const totalInteractions = contracts?.reduce((sum, c) => sum + c.transactionCount, 0) || 0;
  const totalTVLWei = contracts?.reduce((sum, c) => {
    try {
      return sum + BigInt(c.balance || "0");
    } catch {
      return sum;
    }
  }, BigInt(0)) || BigInt(0);

  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    return contracts.filter(c => {
      const matchesSearch = searchQuery === "" || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterVerified === "all" || 
        (filterVerified === "verified" && c.verified) ||
        (filterVerified === "unverified" && !c.verified);
      return matchesSearch && matchesFilter;
    });
  }, [contracts, searchQuery, filterVerified]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => 
      activityTypeFilter === "all" || a.type === activityTypeFilter
    );
  }, [activities, activityTypeFilter]);

  const openStatsDialog = (stat: StatType) => {
    setSelectedStat(stat);
    setStatsDialogOpen(true);
  };

  const openContractDialog = (contract: SmartContract) => {
    setSelectedContract(contract);
    setContractDialogOpen(true);
  };

  const getActivityIcon = (type: ContractActivity['type']) => {
    switch (type) {
      case 'deploy': return <Layers className="h-4 w-4 text-blue-500" />;
      case 'call': return <Play className="h-4 w-4 text-green-500" />;
      case 'verify': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'upgrade': return <RefreshCw className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: ContractActivity['status']) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />{t('common.success')}</Badge>;
      case 'pending': return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />{t('common.pending')}</Badge>;
      case 'failed': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t('common.failed')}</Badge>;
    }
  };

  const getTranslatedActivityType = (type: ContractActivity['type']) => {
    return t(`smartContracts.activityTypes.${type}`);
  };

  const getTranslatedTimeAgo = (timestamp: Date): string => {
    const now = Date.now();
    const diff = now - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return t('community.time.secondsAgo', { count: seconds });
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('community.time.minutesAgo', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('community.time.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    return t('community.time.daysAgo', { count: days });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2" data-testid="text-contracts-title">
            <FileCode className="h-8 w-8" />
            {t('smartContracts.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('smartContracts.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            {t('common.live')}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-contracts-overview">
            <BarChart3 className="h-4 w-4" />
            {t('smartContracts.overview')}
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2" data-testid="tab-contracts-editor">
            <Code2 className="h-4 w-4" />
            {t('smartContracts.contractIde')}
          </TabsTrigger>
          <TabsTrigger value="deployed" className="flex items-center gap-2" data-testid="tab-contracts-deployed">
            <List className="h-4 w-4" />
            {t('smartContracts.deployedContracts')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2" data-testid="tab-contracts-analytics">
            <TrendingUp className="h-4 w-4" />
            {t('smartContracts.analytics')}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2" data-testid="tab-contracts-activity">
            <Activity className="h-4 w-4" />
            {t('smartContracts.liveFeed')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            ) : (
              <>
                <Card 
                  className="hover-elevate cursor-pointer" 
                  onClick={() => openStatsDialog('totalContracts')}
                  data-testid="card-total-contracts"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.totalContracts')}
                    </CardTitle>
                    <FileCode className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">{formatNumber(totalContracts)}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      +12 {t('smartContracts.thisWeek')}
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover-elevate cursor-pointer" 
                  onClick={() => openStatsDialog('verifiedContracts')}
                  data-testid="card-verified-contracts"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.verifiedContracts')}
                    </CardTitle>
                    <Shield className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">
                      {formatNumber(verifiedContracts)}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({totalContracts > 0 ? ((verifiedContracts / totalContracts) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <Progress value={totalContracts > 0 ? (verifiedContracts / totalContracts) * 100 : 0} className="h-1 mt-2" />
                  </CardContent>
                </Card>

                <Card 
                  className="hover-elevate cursor-pointer" 
                  onClick={() => openStatsDialog('interactions')}
                  data-testid="card-total-interactions"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.totalInteractions')}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">{formatNumber(totalInteractions)}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      +8.3% {t('smartContracts.dailyGrowth')}
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover-elevate cursor-pointer" 
                  onClick={() => openStatsDialog('gasUsage')}
                  data-testid="card-gas-usage"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.avgGasUsed')}
                    </CardTitle>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">125K</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <ArrowDownRight className="h-3 w-3 text-green-500" />
                      -12% {t('smartContracts.optimized')}
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover-elevate cursor-pointer" 
                  onClick={() => openStatsDialog('tvl')}
                  data-testid="card-tvl"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('smartContracts.totalTvl')}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tabular-nums">{formatTokenAmount(totalTVLWei.toString())}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      +15.2% {t('smartContracts.weeklyChange')}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('smartContracts.deploymentTrend')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={Array.from({ length: 7 }, (_, i) => ({
                    day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
                    value: Math.floor(Math.random() * 20) + 5,
                  }))}>
                    <Area type="monotone" dataKey="value" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" strokeWidth={2} />
                    <XAxis dataKey="day" className="text-xs" />
                    <Tooltip />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('smartContracts.securityOverview')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('smartContracts.auditedContracts')}</span>
                    <Badge className="bg-green-600">{Math.floor(verifiedContracts * 0.6)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('smartContracts.pendingAudit')}</span>
                    <Badge variant="secondary">{Math.floor(verifiedContracts * 0.3)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('smartContracts.criticalIssues')}</span>
                    <Badge variant="destructive">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  {t('smartContracts.topContracts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contracts?.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={() => openContractDialog(c)} data-testid={`button-top-contract-${i + 1}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <span className="font-medium truncate max-w-[120px]">{c.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatNumber(c.transactionCount)} txs</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('smartContracts.recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('smartContracts.type')}</TableHead>
                    <TableHead>{t('smartContracts.contract')}</TableHead>
                    <TableHead>{t('smartContracts.method')}</TableHead>
                    <TableHead>{t('smartContracts.gasUsed')}</TableHead>
                    <TableHead>{t('common.time')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.slice(0, 5).map((activity) => (
                    <TableRow key={activity.id} className="hover-elevate cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity.type)}
                          <span className="capitalize">{activity.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{activity.contractName}</TableCell>
                      <TableCell>
                        {activity.method ? <Badge variant="outline">{activity.method}</Badge> : '-'}
                      </TableCell>
                      <TableCell className="tabular-nums">{formatGasEmber(activity.gasUsed)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTimeAgo(Math.floor(activity.timestamp.getTime() / 1000))}
                      </TableCell>
                      <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract IDE Tab */}
        <TabsContent value="editor" className="mt-6">
          <SmartContractEditor />
        </TabsContent>

        {/* Deployed Contracts Tab */}
        <TabsContent value="deployed" className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('smartContracts.searchContracts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-contracts"
              />
            </div>
            <Select value={filterVerified} onValueChange={setFilterVerified}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-verified">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('smartContracts.allContracts')}</SelectItem>
                <SelectItem value="verified">{t('smartContracts.verifiedOnly')}</SelectItem>
                <SelectItem value="unverified">{t('smartContracts.unverifiedOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredContracts.length > 0 ? (
                <div className="rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('smartContracts.contract')}</TableHead>
                        <TableHead>{t('common.address')}</TableHead>
                        <TableHead>{t('smartContracts.creator')}</TableHead>
                        <TableHead>{t('common.balance')}</TableHead>
                        <TableHead>{t('common.transactions')}</TableHead>
                        <TableHead>{t('smartContracts.deployed')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow
                          key={contract.id}
                          className="hover-elevate cursor-pointer"
                          onClick={() => openContractDialog(contract)}
                          data-testid={`row-contract-${contract.address?.slice(0, 10) || 'unknown'}`}
                        >
                          <TableCell className="font-semibold">{contract.name}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatAddress(contract.address)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatAddress(contract.creator)}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {formatTokenAmount(contract.balance)}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {formatNumber(contract.transactionCount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTimeAgo(Math.floor(new Date(contract.deployedAt).getTime() / 1000))}
                          </TableCell>
                          <TableCell>
                            {contract.verified ? (
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('smartContracts.verified')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {t('smartContracts.unverified')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" data-testid={`button-view-contract-${contract.address?.slice(0, 10) || 'unknown'}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('smartContracts.noContractsFound')}</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={() => setActiveTab("editor")}
                    data-testid="button-deploy-first-contract"
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    {t('smartContracts.goToContractIde')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {t('smartContracts.contractTypeDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Token (ERC-20)', value: 35, color: CHART_COLORS[0] },
                        { name: 'NFT (ERC-721)', value: 25, color: CHART_COLORS[1] },
                        { name: 'DeFi', value: 20, color: CHART_COLORS[2] },
                        { name: 'Governance', value: 12, color: CHART_COLORS[3] },
                        { name: 'Other', value: 8, color: CHART_COLORS[4] },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Cell key={`cell-${i}`} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('smartContracts.deploymentHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                    day: i + 1,
                    deployed: Math.floor(Math.random() * 15) + 5,
                    verified: Math.floor(Math.random() * 10) + 2,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area type="monotone" dataKey="deployed" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name={t('smartContracts.deployed')} />
                    <Area type="monotone" dataKey="verified" fill="#10B981" fillOpacity={0.3} stroke="#10B981" name={t('smartContracts.verified')} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {t('smartContracts.gasUsageTrend')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={Array.from({ length: 24 }, (_, i) => ({
                    hour: `${i}:00`,
                    avgGas: Math.floor(Math.random() * 50000) + 100000,
                    gasPrice: Math.floor(Math.random() * 30) + 15,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" interval={3} />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="avgGas" stroke="#F59E0B" strokeWidth={2} name={t('smartContracts.avgGas')} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="gasPrice" stroke="#8B5CF6" strokeWidth={2} name={t('smartContracts.gasPrice')} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t('smartContracts.transactionVolume')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Array.from({ length: 7 }, (_, i) => ({
                    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                    calls: Math.floor(Math.random() * 5000) + 2000,
                    transfers: Math.floor(Math.random() * 3000) + 1000,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="calls" fill="#3B82F6" name={t('smartContracts.calls')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="transfers" fill="#10B981" name={t('smartContracts.transfers')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Activity Feed Tab */}
        <TabsContent value="activity" className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-activity-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('smartContracts.allActivity')}</SelectItem>
                <SelectItem value="deploy">{t('smartContracts.deployments')}</SelectItem>
                <SelectItem value="call">{t('smartContracts.contractCalls')}</SelectItem>
                <SelectItem value="verify">{t('smartContracts.verifications')}</SelectItem>
                <SelectItem value="upgrade">{t('smartContracts.upgrades')}</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              {t('smartContracts.liveUpdates')}
            </Badge>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{activity.contractName}</span>
                            <Badge variant="outline" className="capitalize">{getTranslatedActivityType(activity.type)}</Badge>
                            {activity.method && <Badge variant="secondary">{activity.method}</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="font-mono">{activity.contractAddress}</span>
                            <span>•</span>
                            <span>{t('smartContracts.caller')}: {activity.caller}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-semibold tabular-nums">{formatGasEmber(activity.gasUsed)}</div>
                          <div className="text-xs text-muted-foreground">
                            {getTranslatedTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Stats Dialog */}
      <ContractStatsDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
        statType={selectedStat}
        contracts={contracts || []}
        t={t}
      />

      {/* Contract Detail Dialog */}
      <ContractDetailDialog
        open={contractDialogOpen}
        onOpenChange={setContractDialogOpen}
        contract={selectedContract}
        t={t}
      />
    </div>
  );
}
