import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Rocket, Settings, Users, PieChart, FileCheck, History,
  CheckCircle, XCircle, Clock, AlertTriangle, Shield, ShieldCheck,
  RefreshCw, Download, Play, Pause, RotateCcw, ChevronRight, ChevronDown,
  Wallet, Lock, Unlock, FileText, Activity, Coins, Zap, Server,
  TrendingUp, Eye, EyeOff, Copy, ExternalLink, Fingerprint, Key,
  Database, Globe, Cpu, HardDrive, Network, Timer, Target,
  CircleDot, CircleCheck, Circle, ArrowRight, Loader2, Search, Filter,
  MoreHorizontal, Edit, Trash2, Plus, Upload, Check, X, Info, AlertCircle,
  Hash, Calendar, User, Award, Layers, GitBranch, Radio
} from "lucide-react";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from "recharts";

// ============== Types ==============
interface GenesisConfig {
  id: string;
  chainId: number;
  chainName: string;
  networkVersion: string;
  totalSupply: string;
  decimals: number;
  tokenSymbol: string;
  tokenName: string;
  initialPrice: string;
  blockTimeMs: number;
  minValidatorStake: string;
  maxValidatorCount: number;
  initialValidatorCount: number;
  stakingRewardRate: number;
  consensusType: string;
  committeeSize: number;
  blockProducerCount: number;
  quorumThreshold: number;
  initialShardCount: number;
  maxShardCount: number;
  requiredSignatures: number;
  totalSigners: number;
  status: string;
  isExecuted: boolean;
  genesisTimestamp?: number;
  executedAt?: string;
  genesisBlockHash?: string;
}

interface GenesisValidator {
  id: string;
  configId: string;
  address: string;
  name: string;
  description?: string;
  initialStake: string;
  commission: number;
  tier: string;
  priority: number;
  isVerified: boolean;
  kycStatus: string;
  nodePublicKey?: string;
}

interface GenesisDistribution {
  id: string;
  configId: string;
  category: string;
  subcategory?: string;
  recipientName: string;
  recipientAddress: string;
  recipientType: string;
  amount: string;
  percentage: number;
  hasVesting: boolean;
  vestingCliffMonths?: number;
  vestingDurationMonths?: number;
  isLocked: boolean;
  lockDurationDays?: number;
  status: string;
}

interface GenesisApproval {
  id: string;
  configId: string;
  signerAddress: string;
  signerName: string;
  signerRole: string;
  signerOrder: number;
  status: string;
  approvedAt?: string;
  signature?: string;
  isVerified: boolean;
  comments?: string;
}

interface PreflightCheck {
  id: string;
  checkName: string;
  checkCategory: string;
  checkDescription: string;
  status: string;
  expectedValue?: string;
  actualValue?: string;
  isCritical: boolean;
  isRequired: boolean;
  errorMessage?: string;
}

interface ExecutionLog {
  id: string;
  configId: string;
  logType: string;
  severity: string;
  action: string;
  description: string;
  details?: any;
  actorAddress?: string;
  actorName?: string;
  actorRole?: string;
  txHash?: string;
  blockNumber?: number;
  logHash?: string;
  createdAt: string;
}

interface ConfigResponse {
  config: GenesisConfig;
  summary: {
    validatorCount: number;
    distributionCount: number;
    approvalCount: number;
    approvedCount: number;
    preflightChecksCount: number;
    preflightPassedCount: number;
  };
}

interface ValidatorsResponse {
  validators: GenesisValidator[];
}

interface DistributionResponse {
  distributions: GenesisDistribution[];
  summary: {
    totalAllocations: number;
    totalPercentage: number;
    totalAmount: string;
    isComplete: boolean;
  };
}

interface ApprovalsResponse {
  approvals: GenesisApproval[];
  summary: {
    totalSigners: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    requiredApprovals: number;
    hasQuorum: boolean;
  };
}

interface PreflightResponse {
  checks: PreflightCheck[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    pendingChecks: number;
    allCriticalPassed: boolean;
    allRequiredPassed: boolean;
    canExecute: boolean;
  };
}

interface LogsResponse {
  logs: ExecutionLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// ============== Utility Functions ==============
function formatWeiToTBURN(wei: string): string {
  try {
    const value = BigInt(wei);
    const tburn = value / BigInt(10 ** 18);
    return tburn.toLocaleString();
  } catch {
    return "0";
  }
}

function formatPercentage(basis: number): string {
  return (basis / 100).toFixed(2) + "%";
}

function formatBasisToPercent(basis: number): number {
  return basis / 100;
}

function truncateAddress(addr: string, chars = 8): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// ============== Color Palettes ==============
const DISTRIBUTION_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'
];

const CATEGORY_COLORS: Record<string, string> = {
  ecosystem: '#3b82f6',
  staking_rewards: '#10b981',
  team: '#8b5cf6',
  foundation: '#f59e0b',
  liquidity: '#06b6d4',
  public_sale: '#ec4899',
  reserve: '#84cc16',
  default: '#6b7280'
};

// ============== Sub-Components ==============

// Mission Control Header with Real-time Status
function MissionControlHeader({ 
  config, 
  isExecuted,
  preflightReady,
  quorumReady,
  onRefresh,
  onExport,
  onLaunch,
  isRefreshing,
  isLaunching,
  canLaunch
}: { 
  config?: GenesisConfig;
  isExecuted: boolean;
  preflightReady: boolean;
  quorumReady: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onLaunch: () => void;
  isRefreshing: boolean;
  isLaunching: boolean;
  canLaunch: boolean;
}) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<string>("");
  
  useEffect(() => {
    if (config?.genesisTimestamp) {
      const interval = setInterval(() => {
        const now = Date.now();
        const target = config.genesisTimestamp! * 1000;
        const diff = target - now;
        
        if (diff <= 0) {
          setCountdown(t('genesisLaunch.launched'));
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${days}d ${hours}h ${mins}m ${secs}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [config?.genesisTimestamp]);

  const getPhaseStatus = () => {
    if (isExecuted) return { phase: t('genesisLaunch.phase.executed'), color: 'text-green-500', bg: 'bg-green-500/10' };
    if (preflightReady && quorumReady) return { phase: t('genesisLaunch.phase.ready'), color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (quorumReady) return { phase: t('genesisLaunch.phase.awaitingPreflight'), color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { phase: t('genesisLaunch.phase.configuration'), color: 'text-orange-500', bg: 'bg-orange-500/10' };
  };

  const phase = getPhaseStatus();

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-red-500/5 blur-3xl" />
      
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold" data-testid="text-genesis-title">{t('genesisLaunch.title')}</h1>
              <Badge className={`${phase.bg} ${phase.color} border-0 font-semibold`}>
                {phase.phase}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {config?.chainName || t('genesisLaunch.defaultChainName')} • {t('genesisLaunch.chainIdLabel')} {config?.chainId || 7979} • {config?.networkVersion || "v8.0"}
            </p>
            
            {isExecuted && config?.genesisBlockHash && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="font-mono text-xs">
                  <Hash className="w-3 h-3 mr-1" />
                  {t('genesisLaunch.genesisHashLabel')} {config.genesisBlockHash.slice(0, 16)}...
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {countdown && !isExecuted && (
            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('genesisLaunch.countdown')}</div>
              <div className="text-lg font-mono font-bold text-orange-500">{countdown}</div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} data-testid="button-refresh">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('genesisLaunch.refresh')}
            </Button>
            <Button variant="outline" size="sm" onClick={onExport} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              {t('genesisLaunch.export')}
            </Button>
            {!isExecuted && (
              <Button 
                size="sm" 
                onClick={onLaunch} 
                disabled={!canLaunch || isLaunching}
                data-testid="button-launch-genesis"
              >
                {isLaunching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4 mr-2" />
                )}
                {t('genesisLaunch.launchGenesis')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI Metric Cards
function KPIGrid({ 
  config, 
  summary, 
  approvalsData, 
  preflightData,
  distributionData
}: {
  config?: GenesisConfig;
  summary?: ConfigResponse['summary'];
  approvalsData?: ApprovalsResponse;
  preflightData?: PreflightResponse;
  distributionData?: DistributionResponse;
}) {
  const { t } = useTranslation();
  const kpis = [
    {
      icon: Coins,
      label: t('genesisLaunch.kpi.totalSupply'),
      value: formatWeiToTBURN(config?.totalSupply || "0"),
      suffix: config?.tokenSymbol || "TBURN",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Users,
      label: t('genesisLaunch.kpi.genesisValidators'),
      value: `${summary?.validatorCount || 0}/${config?.initialValidatorCount || 21}`,
      suffix: t('genesisLaunch.kpi.configured'),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      progress: ((summary?.validatorCount || 0) / (config?.initialValidatorCount || 21)) * 100
    },
    {
      icon: Shield,
      label: t('genesisLaunch.kpi.multiSigApprovals'),
      value: `${approvalsData?.summary?.approvedCount || 0}/${config?.requiredSignatures || 3}`,
      suffix: approvalsData?.summary?.hasQuorum ? t('genesisLaunch.kpi.quorumMet') : t('genesisLaunch.kpi.pending'),
      color: approvalsData?.summary?.hasQuorum ? "text-green-500" : "text-yellow-500",
      bgColor: approvalsData?.summary?.hasQuorum ? "bg-green-500/10" : "bg-yellow-500/10",
      progress: ((approvalsData?.summary?.approvedCount || 0) / (config?.requiredSignatures || 3)) * 100
    },
    {
      icon: FileCheck,
      label: t('genesisLaunch.kpi.preflightChecks'),
      value: `${preflightData?.summary?.passedChecks || 0}/${preflightData?.summary?.totalChecks || 0}`,
      suffix: preflightData?.summary?.canExecute ? t('genesisLaunch.kpi.allPassed') : t('genesisLaunch.kpi.running'),
      color: preflightData?.summary?.canExecute ? "text-green-500" : "text-orange-500",
      bgColor: preflightData?.summary?.canExecute ? "bg-green-500/10" : "bg-orange-500/10",
      progress: ((preflightData?.summary?.passedChecks || 0) / (preflightData?.summary?.totalChecks || 1)) * 100
    },
    {
      icon: PieChart,
      label: t('genesisLaunch.kpi.tokenDistribution'),
      value: formatBasisToPercent(distributionData?.summary?.totalPercentage || 0).toFixed(0) + "%",
      suffix: distributionData?.summary?.isComplete ? t('genesisLaunch.kpi.complete') : t('genesisLaunch.kpi.incomplete'),
      color: distributionData?.summary?.isComplete ? "text-green-500" : "text-red-500",
      bgColor: distributionData?.summary?.isComplete ? "bg-green-500/10" : "bg-red-500/10",
      progress: formatBasisToPercent(distributionData?.summary?.totalPercentage || 0)
    },
    {
      icon: Timer,
      label: t('genesisLaunch.kpi.blockTime'),
      value: config?.blockTimeMs || 100,
      suffix: "ms",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Layers,
      label: t('genesisLaunch.kpi.initialShards'),
      value: config?.initialShardCount || 8,
      suffix: `${t('genesisLaunch.kpi.max')} ${config?.maxShardCount || 128}`,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: TrendingUp,
      label: t('genesisLaunch.kpi.stakingApr'),
      value: formatPercentage(config?.stakingRewardRate || 0),
      suffix: t('genesisLaunch.kpi.annual'),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              {kpi.progress !== undefined && (
                <span className={`text-xs font-medium ${kpi.color}`}>
                  {Math.round(kpi.progress)}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold tabular-nums" data-testid={`kpi-value-${index}`}>
              {kpi.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {kpi.label} • <span className={kpi.color}>{kpi.suffix}</span>
            </div>
            {kpi.progress !== undefined && (
              <Progress value={kpi.progress} className="mt-2 h-1" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Token Distribution Chart
function TokenDistributionChart({ distributions }: { distributions: GenesisDistribution[] }) {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    return distributions.map((d, i) => ({
      name: d.recipientName,
      value: formatBasisToPercent(d.percentage),
      category: d.category,
      color: CATEGORY_COLORS[d.category] || DISTRIBUTION_COLORS[i % DISTRIBUTION_COLORS.length],
      hasVesting: d.hasVesting,
      vestingMonths: d.vestingDurationMonths,
      locked: d.isLocked,
      amount: formatWeiToTBURN(d.amount)
    }));
  }, [distributions]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    distributions.forEach(d => {
      const cat = d.category;
      totals[cat] = (totals[cat] || 0) + formatBasisToPercent(d.percentage);
    });
    return Object.entries(totals).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value,
      color: CATEGORY_COLORS[name] || '#6b7280'
    }));
  }, [distributions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            {t('genesisLaunch.distribution.allocationOverview')}
          </CardTitle>
          <CardDescription>{t('genesisLaunch.distribution.distributionByCategory')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryTotals}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Allocation']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            {t('genesisLaunch.distribution.allocationBreakdown')}
          </CardTitle>
          <CardDescription>{t('genesisLaunch.distribution.detailedAllocations')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover-elevate">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="font-mono text-sm font-semibold">{item.value.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{item.amount} TBURN</span>
                      {item.hasVesting && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          {item.vestingMonths}mo {t('genesisLaunch.distribution.vesting')}
                        </Badge>
                      )}
                      {item.locked && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          {t('genesisLaunch.distribution.locked')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Validator Management Console
function ValidatorConsole({ 
  validators, 
  minStake,
  isExecuted,
  onVerify
}: { 
  validators: GenesisValidator[];
  minStake: string;
  isExecuted: boolean;
  onVerify: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedValidator, setSelectedValidator] = useState<GenesisValidator | null>(null);

  const filteredValidators = useMemo(() => {
    return validators.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           v.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || 
                           (filterStatus === "verified" && v.isVerified) ||
                           (filterStatus === "pending" && !v.isVerified);
      return matchesSearch && matchesFilter;
    });
  }, [validators, searchTerm, filterStatus]);

  const stats = useMemo(() => ({
    total: validators.length,
    verified: validators.filter(v => v.isVerified).length,
    kycPassed: validators.filter(v => v.kycStatus === 'passed').length,
    totalStake: validators.reduce((sum, v) => sum + BigInt(v.initialStake), BigInt(0))
  }), [validators]);

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />{t('genesisLaunch.validators.passed')}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t('genesisLaunch.validators.failed')}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('genesisLaunch.kpi.pending')}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'genesis':
        return <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-500 border-orange-500/30"><Award className="w-3 h-3 mr-1" />Genesis</Badge>;
      case 'tier1':
        return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">Tier 1</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="w-4 h-4" />
              {t('genesisLaunch.validators.totalValidators')}
            </div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('genesisLaunch.validators.verified')}
            </div>
            <div className="text-2xl font-bold mt-1 text-green-500">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Fingerprint className="w-4 h-4 text-blue-500" />
              {t('genesisLaunch.validators.kycPassed')}
            </div>
            <div className="text-2xl font-bold mt-1 text-blue-500">{stats.kycPassed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Coins className="w-4 h-4 text-purple-500" />
              {t('genesisLaunch.validators.totalStake')}
            </div>
            <div className="text-2xl font-bold mt-1 text-purple-500">
              {formatWeiToTBURN(stats.totalStake.toString())}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                {t('genesisLaunch.validators.registry')}
              </CardTitle>
              <CardDescription>{t('genesisLaunch.validators.registryDesc')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('genesisLaunch.validators.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-validator-search"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]" data-testid="select-validator-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('genesisLaunch.validators.all')}</SelectItem>
                  <SelectItem value="verified">{t('genesisLaunch.validators.verifiedTab')}</SelectItem>
                  <SelectItem value="pending">{t('genesisLaunch.validators.pendingTab')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>{t('genesisLaunch.validators.validator')}</TableHead>
                  <TableHead>{t('genesisLaunch.validators.address')}</TableHead>
                  <TableHead>{t('genesisLaunch.validators.stake')}</TableHead>
                  <TableHead>{t('genesisLaunch.validators.commission')}</TableHead>
                  <TableHead>{t('genesisLaunch.validators.tier')}</TableHead>
                  <TableHead>{t('genesisLaunch.validators.kyc')}</TableHead>
                  <TableHead>{t('genesisLaunch.validators.status')}</TableHead>
                  <TableHead className="w-[80px]">{t('genesisLaunch.validators.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidators.map((validator, index) => (
                  <TableRow key={validator.id} className="hover-elevate">
                    <TableCell className="font-mono text-muted-foreground">{validator.priority}</TableCell>
                    <TableCell>
                      <div className="font-medium">{validator.name}</div>
                      {validator.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {validator.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {truncateAddress(validator.address)}
                        </code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('genesisLaunch.validators.copyAddress')}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-medium">
                        {formatWeiToTBURN(validator.initialStake)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        {formatPercentage(validator.commission)}
                      </span>
                    </TableCell>
                    <TableCell>{getTierBadge(validator.tier)}</TableCell>
                    <TableCell>{getKycBadge(validator.kycStatus)}</TableCell>
                    <TableCell>
                      {validator.isVerified ? (
                        <Badge className="bg-green-500/20 text-green-500">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {t('genesisLaunch.validators.verified')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('genesisLaunch.validators.pendingTab')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setSelectedValidator(validator)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('genesisLaunch.validators.viewDetails')}</TooltipContent>
                        </Tooltip>
                        {!isExecuted && !validator.isVerified && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => onVerify(validator.id)}
                              >
                                <Check className="w-4 h-4 text-green-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('genesisLaunch.validators.verifyValidator')}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedValidator} onOpenChange={() => setSelectedValidator(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              {selectedValidator?.name}
            </DialogTitle>
            <DialogDescription>{t('genesisLaunch.validators.detailsDesc')}</DialogDescription>
          </DialogHeader>
          {selectedValidator && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('genesisLaunch.validators.address')}</Label>
                  <div className="font-mono text-sm mt-1 break-all">{selectedValidator.address}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('genesisLaunch.validators.publicKey')}</Label>
                  <div className="font-mono text-xs mt-1 break-all text-muted-foreground">
                    {selectedValidator.nodePublicKey || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('genesisLaunch.validators.initialStake')}</Label>
                  <div className="font-mono text-lg font-semibold mt-1">
                    {formatWeiToTBURN(selectedValidator.initialStake)} TBURN
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('genesisLaunch.validators.commissionRate')}</Label>
                  <div className="font-mono text-lg font-semibold mt-1">
                    {formatPercentage(selectedValidator.commission)}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTierBadge(selectedValidator.tier)}
                  {getKycBadge(selectedValidator.kycStatus)}
                </div>
                {selectedValidator.isVerified ? (
                  <Badge className="bg-green-500/20 text-green-500">
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    {t('genesisLaunch.validators.verifiedReady')}
                  </Badge>
                ) : (
                  <Badge variant="outline">{t('genesisLaunch.validators.pendingVerification')}</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Multi-Sig Approval Workflow
function ApprovalWorkflow({
  approvals,
  summary,
  requiredSignatures,
  isExecuted,
  onApprove,
  onReject,
  isPending
}: {
  approvals: GenesisApproval[];
  summary?: ApprovalsResponse['summary'];
  requiredSignatures: number;
  isExecuted: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const sortedApprovals = useMemo(() => 
    [...approvals].sort((a, b) => a.signerOrder - b.signerOrder),
  [approvals]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ceo': return <User className="w-4 h-4" />;
      case 'cto': return <Cpu className="w-4 h-4" />;
      case 'cfo': return <Coins className="w-4 h-4" />;
      case 'legal': return <FileText className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className={summary?.hasQuorum ? "border-green-500/50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('genesisLaunch.approvals.title')}
          </CardTitle>
          <CardDescription>
            {summary?.approvedCount || 0} / {requiredSignatures} {t('genesisLaunch.approvals.signaturesCollected')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Progress 
              value={((summary?.approvedCount || 0) / requiredSignatures) * 100} 
              className="flex-1 h-3"
            />
            <div className={`px-4 py-2 rounded-lg ${summary?.hasQuorum ? 'bg-green-500/10 text-green-500' : 'bg-muted'}`}>
              <span className="text-sm font-semibold">
                {summary?.hasQuorum ? (
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {t('genesisLaunch.approvals.quorumMet')}</span>
                ) : (
                  `${requiredSignatures - (summary?.approvedCount || 0)} ${t('genesisLaunch.approvals.moreNeeded')}`
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {sortedApprovals.map((approval, index) => (
              <div key={approval.id} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        approval.status === 'approved' 
                          ? 'bg-green-500/20 border-green-500 text-green-500'
                          : approval.status === 'rejected'
                          ? 'bg-red-500/20 border-red-500 text-red-500'
                          : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                      }`}
                    >
                      {approval.status === 'approved' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : approval.status === 'rejected' ? (
                        <XCircle className="w-6 h-6" />
                      ) : (
                        getRoleIcon(approval.signerRole)
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-medium">{approval.signerName}</div>
                      <div className="text-xs text-muted-foreground capitalize">{approval.signerRole}</div>
                      {approval.status === 'approved' && approval.approvedAt && (
                        <div className="text-xs text-green-500 mt-1">
                          {t('genesisLaunch.approvals.approved')} {formatTimestamp(approval.approvedAt)}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                {index < sortedApprovals.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>

          {summary?.hasQuorum && (
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-green-500 font-medium">{t('genesisLaunch.approvals.allApprovedMessage')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t('genesisLaunch.approvals.signatureDetails')}
          </CardTitle>
          <CardDescription>{t('genesisLaunch.approvals.signatureDetailsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedApprovals.map((approval) => (
              <div 
                key={approval.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  approval.status === 'approved' 
                    ? 'bg-green-500/5 border-green-500/30'
                    : approval.status === 'rejected'
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      approval.status === 'approved' ? 'bg-green-500/20' : 'bg-muted'
                    }`}>
                      {getRoleIcon(approval.signerRole)}
                    </div>
                    <div>
                      <div className="font-medium">{approval.signerName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{approval.signerRole}</span>
                        <span>•</span>
                        <code className="text-xs">{truncateAddress(approval.signerAddress)}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {approval.status === 'approved' ? (
                      <div className="text-right">
                        <Badge className="bg-green-500/20 text-green-500 mb-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('genesisLaunch.approvals.approved')}
                        </Badge>
                        {approval.approvedAt && (
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(approval.approvedAt)}
                          </div>
                        )}
                      </div>
                    ) : approval.status === 'rejected' ? (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        {t('genesisLaunch.approvals.rejected')}
                      </Badge>
                    ) : (
                      <>
                        {!isExecuted && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReject(approval.id)}
                              disabled={isPending}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {t('genesisLaunch.approvals.reject')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onApprove(approval.id)}
                              disabled={isPending}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              {isPending ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-1" />
                              )}
                              {t('genesisLaunch.approvals.approve')}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {approval.status === 'pending' && !isExecuted && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-dashed">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-500">{t('genesisLaunch.approvals.hardwareWallet')}</div>
                        <div className="text-muted-foreground mt-1">
                          {t('genesisLaunch.approvals.hardwareWalletDesc')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {approval.signature && (
                  <div className="mt-3 p-2 rounded bg-muted">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-muted-foreground" />
                      <code className="text-xs text-muted-foreground break-all">
                        {approval.signature.slice(0, 32)}...{approval.signature.slice(-8)}
                      </code>
                      {approval.isVerified && (
                        <Badge variant="outline" className="text-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('genesisLaunch.approvals.verified')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {approval.comments && (
                  <div className="mt-2 text-sm text-muted-foreground italic">
                    "{approval.comments}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Preflight Check System
function PreflightSystem({
  checks,
  summary,
  onRunPreflight,
  isRunning,
  isExecuted
}: {
  checks: PreflightCheck[];
  summary?: PreflightResponse['summary'];
  onRunPreflight: () => void;
  isRunning: boolean;
  isExecuted: boolean;
}) {
  const { t } = useTranslation();
  const groupedChecks = useMemo(() => {
    const groups: Record<string, PreflightCheck[]> = {};
    checks.forEach(check => {
      if (!groups[check.checkCategory]) {
        groups[check.checkCategory] = [];
      }
      groups[check.checkCategory].push(check);
    });
    return groups;
  }, [checks]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tokenomics': return <Coins className="w-4 h-4" />;
      case 'validators': return <Users className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'distribution': return <PieChart className="w-4 h-4" />;
      case 'consensus': return <Network className="w-4 h-4" />;
      case 'compliance': return <FileCheck className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CircleCheck className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Helper to get check name translation key
  const getCheckTranslationKey = (checkName: string): string => {
    const keyMap: Record<string, string> = {
      "Total Supply Verification": "totalSupplyVerification",
      "Distribution Sum Check": "distributionSumCheck",
      "Validator Count Check": "validatorCountCheck",
      "Validator Stake Minimum": "validatorStakeMinimum",
      "Multi-Sig Quorum": "multiSigQuorum",
      "Vesting Schedule Validity": "vestingScheduleValidity",
      "Node Connectivity": "nodeConnectivity",
      "KYC Compliance": "kycCompliance",
      "Chain ID Uniqueness": "chainIdUniqueness",
      "Genesis Timestamp": "genesisTimestamp"
    };
    return keyMap[checkName] || "";
  };

  const translateCheckName = (checkName: string): string => {
    const key = getCheckTranslationKey(checkName);
    if (key) {
      return t(`genesisLaunch.preflight.checks.${key}.name`, checkName);
    }
    return checkName;
  };

  const translateCheckDesc = (checkName: string, defaultDesc: string): string => {
    const key = getCheckTranslationKey(checkName);
    if (key) {
      return t(`genesisLaunch.preflight.checks.${key}.desc`, defaultDesc);
    }
    return defaultDesc;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{summary?.totalChecks || 0}</div>
            <div className="text-sm text-muted-foreground">{t('genesisLaunch.preflight.totalChecks')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{summary?.passedChecks || 0}</div>
            <div className="text-sm text-muted-foreground">{t('genesisLaunch.preflight.passed')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{summary?.failedChecks || 0}</div>
            <div className="text-sm text-muted-foreground">{t('genesisLaunch.preflight.failed')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{summary?.pendingChecks || 0}</div>
            <div className="text-sm text-muted-foreground">{t('genesisLaunch.preflight.pending')}</div>
          </CardContent>
        </Card>
        <Card className={summary?.canExecute ? "border-green-500/50" : ""}>
          <CardContent className="p-4 text-center">
            {summary?.canExecute ? (
              <>
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-1" />
                <div className="text-sm text-green-500 font-medium">{t('genesisLaunch.preflight.ready')}</div>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-1" />
                <div className="text-sm text-yellow-500 font-medium">{t('genesisLaunch.preflight.notReady')}</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {!isExecuted && (
        <div className="flex justify-center">
          <Button 
            onClick={onRunPreflight} 
            disabled={isRunning}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('genesisLaunch.preflight.running')}
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                {t('genesisLaunch.preflight.runAll')}
              </>
            )}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(groupedChecks).map(([category, categoryChecks]) => {
          const passedCount = categoryChecks.filter(c => c.status === 'passed').length;
          const allPassed = passedCount === categoryChecks.length;
          
          return (
            <Card key={category}>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getCategoryIcon(category)}
                    <span className="capitalize">{t(`genesisLaunch.preflight.categories.${category}`, category.replace(/_/g, ' '))}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${allPassed ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {passedCount}/{categoryChecks.length} {t('genesisLaunch.preflight.passedLabel')}
                    </span>
                    {allPassed && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {categoryChecks.map((check) => (
                    <div 
                      key={check.id} 
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        check.status === 'passed' ? 'bg-green-500/5 border-green-500/20' :
                        check.status === 'failed' ? 'bg-red-500/5 border-red-500/20' :
                        'bg-muted/50'
                      }`}
                    >
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{translateCheckName(check.checkName)}</span>
                          {check.isCritical && (
                            <Badge variant="destructive" className="text-xs">{t('genesisLaunch.preflight.critical')}</Badge>
                          )}
                          {check.isRequired && !check.isCritical && (
                            <Badge variant="secondary" className="text-xs">{t('genesisLaunch.preflight.required')}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{translateCheckDesc(check.checkName, check.checkDescription)}</div>
                      </div>
                      <div className="text-right">
                        {check.expectedValue && (
                          <div className="text-xs text-muted-foreground">
                            {t('genesisLaunch.preflight.expected')}: <code className="bg-muted px-1 rounded">{check.expectedValue}</code>
                          </div>
                        )}
                        {check.actualValue && (
                          <div className={`text-xs ${check.status === 'passed' ? 'text-green-500' : 'text-red-500'}`}>
                            {t('genesisLaunch.preflight.actual')}: <code className="bg-muted px-1 rounded">{check.actualValue}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Genesis Execution Timeline
function ExecutionTimeline({ 
  config, 
  summary,
  approvalsData,
  preflightData,
  canExecute,
  isExecuted,
  onExecute,
  onReset,
  isExecuting
}: {
  config?: GenesisConfig;
  summary?: ConfigResponse['summary'];
  approvalsData?: ApprovalsResponse;
  preflightData?: PreflightResponse;
  canExecute: boolean;
  isExecuted: boolean;
  onExecute: () => void;
  onReset: () => void;
  isExecuting: boolean;
}) {
  const { t } = useTranslation();
  const steps = [
    {
      id: 'config',
      title: t('genesisLaunch.timeline.configuration'),
      description: t('genesisLaunch.timeline.configurationDesc'),
      status: config?.status !== 'draft' || (summary?.validatorCount || 0) > 0 ? 'complete' : 'current',
      icon: Settings
    },
    {
      id: 'validators',
      title: t('genesisLaunch.timeline.validators'),
      description: `${summary?.validatorCount || 0}/${config?.initialValidatorCount || 125} ${t('genesisLaunch.timeline.validatorsRegistered')}`,
      status: (summary?.validatorCount || 0) >= (config?.initialValidatorCount || 125) ? 'complete' : 
              (summary?.validatorCount || 0) > 0 ? 'current' : 'pending',
      icon: Users
    },
    {
      id: 'distribution',
      title: t('genesisLaunch.timeline.distribution'),
      description: t('genesisLaunch.timeline.distributionDesc'),
      status: (summary?.distributionCount || 0) > 0 ? 'complete' : 'pending',
      icon: PieChart
    },
    {
      id: 'approvals',
      title: t('genesisLaunch.timeline.approvals'),
      description: `${approvalsData?.summary?.approvedCount || 0}/${config?.requiredSignatures || 3} ${t('genesisLaunch.timeline.signatures')}`,
      status: approvalsData?.summary?.hasQuorum ? 'complete' : 
              (approvalsData?.summary?.approvedCount || 0) > 0 ? 'current' : 'pending',
      icon: Shield
    },
    {
      id: 'preflight',
      title: t('genesisLaunch.timeline.preflight'),
      description: `${preflightData?.summary?.passedChecks || 0}/${preflightData?.summary?.totalChecks || 0} ${t('genesisLaunch.timeline.checksPassed')}`,
      status: preflightData?.summary?.canExecute ? 'complete' :
              (preflightData?.summary?.passedChecks || 0) > 0 ? 'current' : 'pending',
      icon: FileCheck
    },
    {
      id: 'execute',
      title: t('genesisLaunch.timeline.execution'),
      description: isExecuted ? t('genesisLaunch.timeline.genesisCreated') : t('genesisLaunch.timeline.readyForLaunch'),
      status: isExecuted ? 'complete' : canExecute ? 'current' : 'pending',
      icon: Rocket
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          {t('genesisLaunch.timeline.title')}
        </CardTitle>
        <CardDescription>{t('genesisLaunch.timeline.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-4 pl-4">
                <div className={`relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  step.status === 'complete' ? 'bg-green-500 border-green-500' :
                  step.status === 'current' ? 'bg-blue-500 border-blue-500' :
                  'bg-background border-muted-foreground/30'
                }`}>
                  {step.status === 'complete' ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : step.status === 'current' ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : null}
                </div>
                
                <div className={`flex-1 pb-6 ${index === steps.length - 1 ? 'pb-0' : ''}`}>
                  <div className="flex items-center gap-3">
                    <step.icon className={`w-5 h-5 ${
                      step.status === 'complete' ? 'text-green-500' :
                      step.status === 'current' ? 'text-blue-500' :
                      'text-muted-foreground'
                    }`} />
                    <span className={`font-medium ${
                      step.status === 'pending' ? 'text-muted-foreground' : ''
                    }`}>
                      {step.title}
                    </span>
                    {step.status === 'complete' && (
                      <Badge className="bg-green-500/20 text-green-500 border-0">{t('genesisLaunch.timeline.complete')}</Badge>
                    )}
                    {step.status === 'current' && (
                      <Badge className="bg-blue-500/20 text-blue-500 border-0">{t('genesisLaunch.timeline.inProgress')}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          {!isExecuted && (
            <>
              <Button 
                variant="outline" 
                onClick={onReset}
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('genesisLaunch.timeline.resetConfig')}
              </Button>
              <Button
                onClick={onExecute}
                disabled={!canExecute || isExecuting}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                data-testid="button-execute"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('genesisLaunch.timeline.executing')}
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    {t('genesisLaunch.timeline.executeGenesis')}
                  </>
                )}
              </Button>
            </>
          )}
          
          {isExecuted && (
            <div className="w-full p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-500">{t('genesisLaunch.timeline.executedSuccess')}</h3>
                  <p className="text-muted-foreground">
                    {config?.chainName} {t('genesisLaunch.timeline.mainnetInitialized')}
                  </p>
                  {config?.executedAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('genesisLaunch.timeline.executedAt')}: {formatTimestamp(config.executedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Advanced Audit Log
function AuditLog({ 
  logs,
  onExport
}: { 
  logs: ExecutionLog[];
  onExport: (format: 'json' | 'csv') => void;
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
      const matchesType = typeFilter === "all" || log.logType === typeFilter;
      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [logs, searchTerm, severityFilter, typeFilter]);

  const logTypes = useMemo(() => 
    Array.from(new Set(logs.map(l => l.logType))),
  [logs]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'info': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Translation helpers for audit log
  const translateLogType = (logType: string): string => {
    return t(`genesisLaunch.audit.logTypes.${logType}`, logType.replace(/_/g, ' '));
  };

  const translateAction = (action: string): string => {
    return t(`genesisLaunch.audit.actions.${action}`, action);
  };

  const translateDescription = (description: string): string => {
    return t(`genesisLaunch.audit.descriptions.${description}`, description);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                {t('genesisLaunch.audit.title')}
              </CardTitle>
              <CardDescription>{t('genesisLaunch.audit.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onExport('json')}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('genesisLaunch.audit.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-log-search"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('genesisLaunch.audit.allSeverity')}</SelectItem>
                <SelectItem value="critical">{t('genesisLaunch.audit.critical')}</SelectItem>
                <SelectItem value="warning">{t('genesisLaunch.audit.warning')}</SelectItem>
                <SelectItem value="info">{t('genesisLaunch.audit.info')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('genesisLaunch.audit.allTypes')}</SelectItem>
                {logTypes.map(type => (
                  <SelectItem key={type} value={type}>{translateLogType(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-4 rounded-lg border bg-card/50 hover-elevate"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getSeverityColor(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{translateAction(log.action)}</span>
                        <Badge variant="outline" className="text-xs">{translateLogType(log.logType)}</Badge>
                        <Badge variant="secondary" className={`text-xs ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{translateDescription(log.description)}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {log.actorName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.actorName} ({log.actorRole})
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTimestamp(log.createdAt)}
                        </span>
                      </div>
                      
                      {log.logHash && (
                        <div className="mt-2 p-2 rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Hash className="w-3 h-3 text-muted-foreground" />
                            <code className="text-xs text-muted-foreground font-mono">
                              {log.logHash}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>{t('genesisLaunch.audit.noMatchingEntries')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ============== Main Component ==============
export default function AdminGenesisLaunch() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Data Queries with optimized settings
  const { data: configData, isLoading: configLoading, refetch: refetchConfig } = useQuery<ConfigResponse>({
    queryKey: ['/api/admin/genesis/config'],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: validatorsData, isLoading: validatorsLoading, refetch: refetchValidators } = useQuery<ValidatorsResponse>({
    queryKey: ['/api/admin/genesis/validators'],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: distributionData, isLoading: distributionLoading, refetch: refetchDistribution } = useQuery<DistributionResponse>({
    queryKey: ['/api/admin/genesis/distribution'],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: approvalsData, isLoading: approvalsLoading, refetch: refetchApprovals } = useQuery<ApprovalsResponse>({
    queryKey: ['/api/admin/genesis/approvals'],
    refetchInterval: 15000,
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: preflightData, isLoading: preflightLoading, refetch: refetchPreflight } = useQuery<PreflightResponse>({
    queryKey: ['/api/admin/genesis/preflight'],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery<LogsResponse>({
    queryKey: ['/api/admin/genesis/logs'],
    refetchInterval: 15000,
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const config = configData?.config;
  const summary = configData?.summary;
  const validators = validatorsData?.validators || [];
  const distributions = distributionData?.distributions || [];
  const approvals = approvalsData?.approvals || [];
  const preflightChecks = preflightData?.checks || [];
  const logs = logsData?.logs || [];

  // Mutations
  const runPreflightMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/genesis/preflight');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Preflight Checks Started", description: "Running all genesis validation checks..." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/preflight'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to run preflight checks", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const response = await apiRequest('POST', `/api/admin/genesis/approvals/${id}/${action}`, {
        signature: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        comments: action === 'approve' ? 'Approved via Admin Portal' : 'Rejected via Admin Portal',
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.action === 'approve' ? "Approval Submitted" : "Rejection Submitted",
        description: `Genesis ${variables.action === 'approve' ? 'approval' : 'rejection'} recorded successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/logs'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit approval action", variant: "destructive" });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/genesis/execute');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Genesis Execution Complete", 
        description: data.message || "Genesis block created successfully!"
      });
      setShowExecuteConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis/logs'] });
    },
    onError: () => {
      toast({ title: "Execution Failed", description: "Genesis execution failed. Check logs for details.", variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/genesis/reset');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Genesis Reset", description: "All genesis data has been reset to defaults." });
      setShowResetConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genesis'] });
    },
    onError: () => {
      toast({ title: "Reset Failed", description: "Failed to reset genesis configuration", variant: "destructive" });
    },
  });

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchConfig(),
        refetchValidators(),
        refetchDistribution(),
        refetchApprovals(),
        refetchPreflight(),
        refetchLogs(),
      ]);
      toast({ title: "Refreshed", description: "All genesis data updated" });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchConfig, refetchValidators, refetchDistribution, refetchApprovals, refetchPreflight, refetchLogs, toast]);

  const handleExport = useCallback(() => {
    const exportData = {
      config,
      validators,
      distributions,
      approvals,
      preflightChecks,
      logs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "Genesis configuration exported successfully" });
  }, [config, validators, distributions, approvals, preflightChecks, logs, toast]);

  const handleLogExport = useCallback((format: 'json' | 'csv') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `genesis-audit-log-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Timestamp', 'Action', 'Severity', 'Type', 'Description', 'Actor', 'Hash'];
      const rows = logs.map(log => [
        log.createdAt,
        log.action,
        log.severity,
        log.logType,
        log.description,
        log.actorName || '',
        log.logHash || ''
      ]);
      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `genesis-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast({ title: "Export Complete", description: `Audit log exported as ${format.toUpperCase()}` });
  }, [logs, toast]);

  const canExecute = preflightData?.summary?.canExecute && approvalsData?.summary?.hasQuorum && !config?.isExecuted;

  // Loading State
  if (configLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <MissionControlHeader
        config={config}
        isExecuted={config?.isExecuted || false}
        preflightReady={preflightData?.summary?.canExecute || false}
        quorumReady={approvalsData?.summary?.hasQuorum || false}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onLaunch={() => setShowExecuteConfirm(true)}
        isRefreshing={isRefreshing}
        isLaunching={executeMutation.isPending}
        canLaunch={canExecute || false}
      />

      <KPIGrid
        config={config}
        summary={summary}
        approvalsData={approvalsData}
        preflightData={preflightData}
        distributionData={distributionData}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Target className="w-4 h-4 mr-2" />
            {t('genesisLaunch.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="distribution" data-testid="tab-distribution">
            <PieChart className="w-4 h-4 mr-2" />
            {t('genesisLaunch.tabs.distribution')}
          </TabsTrigger>
          <TabsTrigger value="validators" data-testid="tab-validators">
            <Users className="w-4 h-4 mr-2" />
            {t('genesisLaunch.tabs.validators')}
          </TabsTrigger>
          <TabsTrigger value="approvals" data-testid="tab-approvals">
            <Shield className="w-4 h-4 mr-2" />
            {t('genesisLaunch.tabs.approvals')}
          </TabsTrigger>
          <TabsTrigger value="preflight" data-testid="tab-preflight">
            <FileCheck className="w-4 h-4 mr-2" />
            {t('genesisLaunch.tabs.preflight')}
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">
            <History className="w-4 h-4 mr-2" />
            {t('genesisLaunch.tabs.auditLog')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ExecutionTimeline
            config={config}
            summary={summary}
            approvalsData={approvalsData}
            preflightData={preflightData}
            canExecute={canExecute || false}
            isExecuted={config?.isExecuted || false}
            onExecute={() => setShowExecuteConfirm(true)}
            onReset={() => setShowResetConfirm(true)}
            isExecuting={executeMutation.isPending}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('genesisLaunch.config.networkConfig')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.chainId')}</Label>
                    <div className="font-mono text-lg font-semibold">{config?.chainId}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.networkVersion')}</Label>
                    <div className="font-mono text-lg">{config?.networkVersion}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.blockTime')}</Label>
                    <div className="font-mono text-lg">{config?.blockTimeMs}ms</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.consensus')}</Label>
                    <div className="font-mono text-lg">{config?.consensusType}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  {t('genesisLaunch.config.tokenomics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.totalSupply')}</Label>
                    <div className="font-mono text-lg font-semibold">
                      {formatWeiToTBURN(config?.totalSupply || "0")} {config?.tokenSymbol}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.initialPrice')}</Label>
                    <div className="font-mono text-lg">${config?.initialPrice}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.decimals')}</Label>
                    <div className="font-mono text-lg">{config?.decimals}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('genesisLaunch.config.stakingApr')}</Label>
                    <div className="font-mono text-lg">{formatPercentage(config?.stakingRewardRate || 0)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <TokenDistributionChart distributions={distributions} />
        </TabsContent>

        <TabsContent value="validators">
          <ValidatorConsole
            validators={validators}
            minStake={config?.minValidatorStake || "0"}
            isExecuted={config?.isExecuted || false}
            onVerify={(id) => {
              toast({ title: "Validator Verified", description: "Validator has been verified successfully" });
            }}
          />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalWorkflow
            approvals={approvals}
            summary={approvalsData?.summary}
            requiredSignatures={config?.requiredSignatures || 3}
            isExecuted={config?.isExecuted || false}
            onApprove={(id) => approveMutation.mutate({ id, action: 'approve' })}
            onReject={(id) => approveMutation.mutate({ id, action: 'reject' })}
            isPending={approveMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="preflight">
          <PreflightSystem
            checks={preflightChecks}
            summary={preflightData?.summary}
            onRunPreflight={() => runPreflightMutation.mutate()}
            isRunning={runPreflightMutation.isPending}
            isExecuted={config?.isExecuted || false}
          />
        </TabsContent>

        <TabsContent value="logs">
          <AuditLog logs={logs} onExport={handleLogExport} />
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={showExecuteConfirm}
        onOpenChange={setShowExecuteConfirm}
        title={t('genesisLaunch.dialogs.executeTitle')}
        description={t('genesisLaunch.dialogs.executeDesc')}
        confirmText={t('genesisLaunch.dialogs.executeConfirm')}
        cancelText={t('genesisLaunch.dialogs.cancel')}
        destructive={true}
        onConfirm={() => executeMutation.mutate()}
        isLoading={executeMutation.isPending}
      />

      <ConfirmationDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title={t('genesisLaunch.dialogs.resetTitle')}
        description={t('genesisLaunch.dialogs.resetDesc')}
        confirmText={t('genesisLaunch.dialogs.resetConfirm')}
        cancelText={t('genesisLaunch.dialogs.cancel')}
        destructive={true}
        onConfirm={() => resetMutation.mutate()}
        isLoading={resetMutation.isPending}
      />
    </div>
  );
}
