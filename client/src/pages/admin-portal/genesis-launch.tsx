import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Rocket, Settings, Users, PieChart, FileCheck, History,
  CheckCircle, XCircle, Clock, AlertTriangle, Shield,
  RefreshCw, Download, Play, Pause, RotateCcw, ChevronRight,
  Wallet, Lock, Unlock, FileText, Activity, Coins
} from "lucide-react";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";

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

export default function AdminGenesisLaunch() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [approvalToAction, setApprovalToAction] = useState<{id: string, action: 'approve' | 'reject'} | null>(null);

  const { data: configData, isLoading: configLoading, refetch: refetchConfig } = useQuery<ConfigResponse>({
    queryKey: ['/api/admin/genesis/config'],
    refetchInterval: 30000,
  });

  const { data: validatorsData, isLoading: validatorsLoading, refetch: refetchValidators } = useQuery<ValidatorsResponse>({
    queryKey: ['/api/admin/genesis/validators'],
    refetchInterval: 30000,
  });

  const { data: distributionData, isLoading: distributionLoading, refetch: refetchDistribution } = useQuery<DistributionResponse>({
    queryKey: ['/api/admin/genesis/distribution'],
    refetchInterval: 30000,
  });

  const { data: approvalsData, isLoading: approvalsLoading, refetch: refetchApprovals } = useQuery<ApprovalsResponse>({
    queryKey: ['/api/admin/genesis/approvals'],
    refetchInterval: 15000,
  });

  const { data: preflightData, isLoading: preflightLoading, refetch: refetchPreflight } = useQuery<PreflightResponse>({
    queryKey: ['/api/admin/genesis/preflight'],
    refetchInterval: 30000,
  });

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery<LogsResponse>({
    queryKey: ['/api/admin/genesis/logs'],
    refetchInterval: 15000,
  });

  const config = configData?.config;
  const summary = configData?.summary;
  const validators = validatorsData?.validators || [];
  const distributions = distributionData?.distributions || [];
  const approvals = approvalsData?.approvals || [];
  const preflightChecks = preflightData?.checks || [];
  const logs = logsData?.logs || [];

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
      setApprovalToAction(null);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'passed':
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />{status}
        </Badge>;
      case 'rejected':
      case 'failed':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />{status}
        </Badge>;
      case 'pending':
      case 'draft':
        return <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />{status}
        </Badge>;
      case 'ready':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />{status}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">{severity}</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">{severity}</Badge>;
      case 'info':
        return <Badge variant="secondary">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (configLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const canExecute = preflightData?.summary?.canExecute && approvalsData?.summary?.hasQuorum && !config?.isExecuted;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-genesis-title">Genesis Block Launch</h1>
            <p className="text-sm text-muted-foreground">TBURN Mainnet Genesis Configuration & Execution</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {!config?.isExecuted && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(true)} data-testid="button-reset">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowExecuteConfirm(true)} 
                disabled={!canExecute}
                className="bg-gradient-to-r from-orange-500 to-red-500"
                data-testid="button-execute"
              >
                <Play className="w-4 h-4 mr-2" />
                Execute Genesis
              </Button>
            </>
          )}
          {config?.isExecuted && (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 py-1 px-3">
              <CheckCircle className="w-4 h-4 mr-2" />
              Genesis Executed
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-chain-id">{config?.chainId || 8888}</div>
            <p className="text-xs text-muted-foreground">{config?.chainName || "TBURN Mainnet"}</p>
            {getStatusBadge(config?.status || 'draft')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              Validators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-validator-count">{summary?.validatorCount || 0}</div>
            <p className="text-xs text-muted-foreground">of {config?.initialValidatorCount || 21} required</p>
            <Progress value={(summary?.validatorCount || 0) / (config?.initialValidatorCount || 21) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-approval-count">
              {approvalsData?.summary?.approvedCount || 0}/{config?.requiredSignatures || 3}
            </div>
            <p className="text-xs text-muted-foreground">Multi-sig quorum</p>
            {approvalsData?.summary?.hasQuorum ? (
              <Badge className="mt-2 bg-green-500/20 text-green-500">Quorum Met</Badge>
            ) : (
              <Badge variant="secondary" className="mt-2">Awaiting Signatures</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-orange-500" />
              Preflight Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-preflight-count">
              {preflightData?.summary?.passedChecks || 0}/{preflightData?.summary?.totalChecks || 0}
            </div>
            <p className="text-xs text-muted-foreground">Checks passed</p>
            <Progress value={(preflightData?.summary?.passedChecks || 0) / (preflightData?.summary?.totalChecks || 1) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="config" data-testid="tab-config">
            <Settings className="w-4 h-4 mr-2" />
            Config
          </TabsTrigger>
          <TabsTrigger value="distribution" data-testid="tab-distribution">
            <PieChart className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="approvals" data-testid="tab-approvals">
            <Shield className="w-4 h-4 mr-2" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="preflight" data-testid="tab-preflight">
            <FileCheck className="w-4 h-4 mr-2" />
            Preflight
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">
            <History className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Network Configuration
                </CardTitle>
                <CardDescription>Core blockchain parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Chain ID</Label>
                    <div className="font-mono text-lg" data-testid="text-config-chainid">{config?.chainId}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Network Version</Label>
                    <div className="font-mono text-lg">{config?.networkVersion}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Block Time</Label>
                    <div className="font-mono text-lg">{config?.blockTimeMs}ms</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Consensus</Label>
                    <div className="font-mono text-lg">{config?.consensusType}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Tokenomics
                </CardTitle>
                <CardDescription>Token supply and economics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Supply</Label>
                    <div className="font-mono text-lg" data-testid="text-config-supply">
                      {formatWeiToTBURN(config?.totalSupply || "0")} {config?.tokenSymbol}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Initial Price</Label>
                    <div className="font-mono text-lg">${config?.initialPrice}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Decimals</Label>
                    <div className="font-mono text-lg">{config?.decimals}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Staking Reward Rate</Label>
                    <div className="font-mono text-lg">{formatPercentage(config?.stakingRewardRate || 0)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Validator Settings
                </CardTitle>
                <CardDescription>Consensus and validator parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min Stake</Label>
                    <div className="font-mono text-lg">{formatWeiToTBURN(config?.minValidatorStake || "0")} TBURN</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max Validators</Label>
                    <div className="font-mono text-lg">{config?.maxValidatorCount}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Committee Size</Label>
                    <div className="font-mono text-lg">{config?.committeeSize}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Quorum Threshold</Label>
                    <div className="font-mono text-lg">{formatPercentage(config?.quorumThreshold || 0)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sharding Configuration
                </CardTitle>
                <CardDescription>Dynamic sharding parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Initial Shards</Label>
                    <div className="font-mono text-lg">{config?.initialShardCount}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max Shards</Label>
                    <div className="font-mono text-lg">{config?.maxShardCount}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Block Producers</Label>
                    <div className="font-mono text-lg">{config?.blockProducerCount}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Multi-Sig</Label>
                    <div className="font-mono text-lg">{config?.requiredSignatures}/{config?.totalSigners}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Genesis Validators ({validators.length})
              </CardTitle>
              <CardDescription>Initial validator set for mainnet launch</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validators.map((validator, idx) => (
                      <TableRow key={validator.id}>
                        <TableCell className="font-mono">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{validator.name}</TableCell>
                        <TableCell className="font-mono text-xs">{validator.address.slice(0, 20)}...</TableCell>
                        <TableCell>{formatWeiToTBURN(validator.initialStake)} TBURN</TableCell>
                        <TableCell>{formatPercentage(validator.commission)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{validator.tier}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(validator.kycStatus)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Allocations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{distributionData?.summary?.totalAllocations || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(distributionData?.summary?.totalPercentage || 0)}</div>
                {distributionData?.summary?.isComplete ? (
                  <Badge className="mt-1 bg-green-500/20 text-green-500">Complete</Badge>
                ) : (
                  <Badge variant="destructive" className="mt-1">Incomplete</Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatWeiToTBURN(distributionData?.summary?.totalAmount || "0")}</div>
                <p className="text-xs text-muted-foreground">TBURN</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Token Distribution
              </CardTitle>
              <CardDescription>Genesis token allocation breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Vesting</TableHead>
                      <TableHead>Lock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((dist) => (
                      <TableRow key={dist.id}>
                        <TableCell>
                          <Badge variant="outline">{dist.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{dist.recipientName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{dist.recipientAddress.slice(0, 20)}...</div>
                        </TableCell>
                        <TableCell className="font-mono">{formatWeiToTBURN(dist.amount)}</TableCell>
                        <TableCell className="font-mono">{formatPercentage(dist.percentage)}</TableCell>
                        <TableCell>
                          {dist.hasVesting ? (
                            <div className="text-xs">
                              <div>Cliff: {dist.vestingCliffMonths}mo</div>
                              <div>Duration: {dist.vestingDurationMonths}mo</div>
                            </div>
                          ) : (
                            <Badge variant="secondary">No Vesting</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {dist.isLocked ? (
                            <div className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs">{dist.lockDurationDays}d</span>
                            </div>
                          ) : (
                            <Unlock className="w-4 h-4 text-green-500" />
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(dist.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Signers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvalsData?.summary?.totalSigners || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{approvalsData?.summary?.approvedCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{approvalsData?.summary?.pendingCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quorum Status</CardTitle>
              </CardHeader>
              <CardContent>
                {approvalsData?.summary?.hasQuorum ? (
                  <Badge className="bg-green-500/20 text-green-500 text-lg py-1 px-3">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Quorum Met
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-lg py-1 px-3">
                    <Clock className="w-4 h-4 mr-2" />
                    {(approvalsData?.summary?.requiredApprovals || 3) - (approvalsData?.summary?.approvedCount || 0)} more needed
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Multi-Signature Approvals
              </CardTitle>
              <CardDescription>
                Required: {approvalsData?.summary?.requiredApprovals || 3} of {approvalsData?.summary?.totalSigners || 5} signatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Signer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell className="font-mono">{approval.signerOrder}</TableCell>
                      <TableCell className="font-medium">{approval.signerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{approval.signerRole.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{approval.signerAddress.slice(0, 20)}...</TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell className="text-sm">
                        {approval.approvedAt ? new Date(approval.approvedAt).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {approval.status === 'pending' && !config?.isExecuted && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setApprovalToAction({ id: approval.id, action: 'approve' })}
                              data-testid={`button-approve-${approval.signerRole}`}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setApprovalToAction({ id: approval.id, action: 'reject' })}
                              data-testid={`button-reject-${approval.signerRole}`}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preflight" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Passed:</span>
                <span className="ml-2 font-bold text-green-500">{preflightData?.summary?.passedChecks || 0}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Failed:</span>
                <span className="ml-2 font-bold text-red-500">{preflightData?.summary?.failedChecks || 0}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pending:</span>
                <span className="ml-2 font-bold text-yellow-500">{preflightData?.summary?.pendingChecks || 0}</span>
              </div>
            </div>
            <Button 
              onClick={() => runPreflightMutation.mutate()} 
              disabled={runPreflightMutation.isPending || config?.isExecuted}
              data-testid="button-run-preflight"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${runPreflightMutation.isPending ? 'animate-spin' : ''}`} />
              Run All Checks
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Preflight Verification Checks
              </CardTitle>
              <CardDescription>All checks must pass before genesis execution</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Critical</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preflightChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">{check.checkName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{check.checkCategory}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {check.checkDescription}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{check.expectedValue || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{check.actualValue || '-'}</TableCell>
                        <TableCell>
                          {check.isCritical ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(check.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {preflightData?.summary?.canExecute && (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-green-500">All Critical Checks Passed</h3>
                    <p className="text-sm text-muted-foreground">Genesis block is ready for execution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Immutable Audit Log
              </CardTitle>
              <CardDescription>Complete history of all genesis-related actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card/50">
                      <div className="flex-shrink-0 mt-1">
                        {log.severity === 'critical' ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : log.severity === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{log.action}</span>
                          {getSeverityBadge(log.severity)}
                          <Badge variant="outline" className="text-xs">{log.logType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                        {log.actorName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {log.actorName} ({log.actorRole})
                          </p>
                        )}
                        {log.logHash && (
                          <p className="text-xs font-mono text-muted-foreground mt-1">
                            Hash: {log.logHash.slice(0, 32)}...
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No audit logs yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={showExecuteConfirm}
        onOpenChange={setShowExecuteConfirm}
        title="Execute Genesis Block"
        description="This action will create the genesis block and initialize the TBURN Mainnet. This action cannot be undone."
        confirmText="Execute Genesis"
        cancelText="Cancel"
        destructive={true}
        onConfirm={() => executeMutation.mutate()}
        isLoading={executeMutation.isPending}
      />

      <ConfirmationDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset Genesis Configuration"
        description="This will reset all genesis configuration data to default values. All approvals and customizations will be lost."
        confirmText="Reset All"
        cancelText="Cancel"
        destructive={true}
        onConfirm={() => resetMutation.mutate()}
        isLoading={resetMutation.isPending}
      />

      <ConfirmationDialog
        open={!!approvalToAction}
        onOpenChange={(open) => !open && setApprovalToAction(null)}
        title={approvalToAction?.action === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
        description={approvalToAction?.action === 'approve' 
          ? "By approving, you are signing off on the genesis configuration."
          : "By rejecting, you are blocking the genesis execution until issues are resolved."
        }
        confirmText={approvalToAction?.action === 'approve' ? "Approve" : "Reject"}
        cancelText="Cancel"
        destructive={approvalToAction?.action !== 'approve'}
        onConfirm={() => { if (approvalToAction) approveMutation.mutate(approvalToAction); }}
        isLoading={approveMutation.isPending}
      />
    </div>
  );
}
