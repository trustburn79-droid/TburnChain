import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Bell,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Activity,
  AlertCircle,
  Eye,
} from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: "critical" | "high" | "medium" | "low";
  enabled: boolean;
  notifications: string[];
  lastTriggered: string | null;
  triggerCount: number;
  category: string;
  cooldown: number;
}

interface AlertRulesData {
  rules: AlertRule[];
  totalCount: number;
}

export default function AlertRules() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    condition: "",
    severity: "medium" as const,
    category: "performance",
    cooldown: 300,
    notifications: [] as string[],
  });
  const [showRuleDetail, setShowRuleDetail] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: alertData, isLoading, error, refetch } = useQuery<AlertRulesData>({
    queryKey: ["/api/enterprise/admin/alerts/rules"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: typeof newRule) => {
      return apiRequest("POST", "/api/enterprise/admin/alerts/rules", rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/alerts/rules"] });
      setIsCreateDialogOpen(false);
      setNewRule({
        name: "",
        description: "",
        condition: "",
        severity: "medium",
        category: "performance",
        cooldown: 300,
        notifications: [],
      });
      toast({
        title: t("adminAlertRules.ruleCreated"),
        description: t("adminAlertRules.ruleCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminAlertRules.error"),
        description: t("adminAlertRules.createError"),
        variant: "destructive",
      });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return apiRequest("PATCH", `/api/enterprise/admin/alerts/rules/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/alerts/rules"] });
      toast({
        title: t("adminAlertRules.ruleUpdated"),
        description: t("adminAlertRules.ruleUpdatedDesc"),
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/enterprise/admin/alerts/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/alerts/rules"] });
      toast({
        title: t("adminAlertRules.ruleDeleted"),
        description: t("adminAlertRules.ruleDeletedDesc"),
      });
    },
  });

  const testRulesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/enterprise/admin/alerts/rules/test");
    },
    onSuccess: () => {
      toast({
        title: t("adminAlertRules.testComplete"),
        description: t("adminAlertRules.testCompleteDesc"),
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminAlertRules.refreshed"),
      description: t("adminAlertRules.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500";
      case "high": return "bg-orange-500/10 text-orange-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "low": return "bg-blue-500/10 text-blue-500";
      default: return "";
    }
  };

  const getRuleDetailSections = (rule: AlertRule): DetailSection[] => [
    {
      title: t("adminAlertRules.detail.ruleInfo"),
      fields: [
        { label: t("common.name"), value: rule.name },
        { label: t("common.description"), value: rule.description },
        { 
          label: t("adminAlertRules.dialog.category"), 
          value: t(`adminAlertRules.categories.${rule.category}`), 
          type: "badge" as const 
        },
        { 
          label: t("adminAlertRules.dialog.severity"), 
          value: t(`adminAlertRules.severity.${rule.severity}`), 
          type: "badge" as const,
          badgeColor: getSeverityBadgeColor(rule.severity)
        },
        { 
          label: t("common.status"), 
          value: rule.enabled ? t("adminAlertRules.enabled") : t("adminAlertRules.disabled"), 
          type: "badge" as const,
          badgeVariant: rule.enabled ? "default" as const : "secondary" as const
        },
      ],
    },
    {
      title: t("adminAlertRules.detail.configuration"),
      fields: [
        { label: t("adminAlertRules.condition"), value: rule.condition, type: "code" as const },
        { label: t("adminAlertRules.dialog.cooldown"), value: `${rule.cooldown}s` },
        { label: t("adminAlertRules.table.count"), value: rule.triggerCount },
        { 
          label: t("adminAlertRules.table.lastTriggered"), 
          value: rule.lastTriggered, 
          type: "date" as const 
        },
      ],
    },
  ];

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteRuleMutation.mutateAsync(pendingDeleteId);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const alertRules: AlertRule[] = alertData?.rules || [
    {
      id: "rule-001",
      name: "TPS Below 80K Threshold",
      description: "Critical alert if TPS drops below 80% of 100K capacity",
      condition: "tburn_tps_current < 80000",
      severity: "critical",
      enabled: true,
      notifications: ["email", "slack", "pagerduty", "sms"],
      lastTriggered: null,
      triggerCount: 0,
      category: "performance",
      cooldown: 60,
    },
    {
      id: "rule-002",
      name: "BFT Consensus Latency",
      description: "Alert when BFT consensus exceeds 100ms target",
      condition: "tburn_consensus_time_ms > 100",
      severity: "high",
      enabled: true,
      notifications: ["email", "slack", "pagerduty"],
      lastTriggered: null,
      triggerCount: 0,
      category: "consensus",
      cooldown: 120,
    },
    {
      id: "rule-003",
      name: "Validator Pool Degraded",
      description: "Critical: Less than 104 validators (67% quorum)",
      condition: "tburn_validator_count < 104",
      severity: "critical",
      enabled: true,
      notifications: ["email", "slack", "sms", "pagerduty", "webhook"],
      lastTriggered: null,
      triggerCount: 0,
      category: "validators",
      cooldown: 30,
    },
    {
      id: "rule-004",
      name: "Triple-Band AI Failover",
      description: "Alert when primary AI (Gemini 3 Pro) triggers failover",
      condition: "tburn_ai_primary_status != 'healthy'",
      severity: "high",
      enabled: true,
      notifications: ["email", "slack", "webhook"],
      lastTriggered: null,
      triggerCount: 0,
      category: "ai",
      cooldown: 180,
    },
    {
      id: "rule-005",
      name: "Shard Synchronization Delay",
      description: "Cross-shard latency exceeds 5ms threshold",
      condition: "tburn_cross_shard_latency_ms > 5",
      severity: "medium",
      enabled: true,
      notifications: ["email", "slack"],
      lastTriggered: null,
      triggerCount: 0,
      category: "performance",
      cooldown: 300,
    },
    {
      id: "rule-006",
      name: "Bridge Transaction Delay",
      description: "Multi-chain bridge transfer exceeds 5 minutes",
      condition: "tburn_bridge_transfer_time_seconds > 300",
      severity: "medium",
      enabled: true,
      notifications: ["email", "slack"],
      lastTriggered: null,
      triggerCount: 0,
      category: "bridge",
      cooldown: 600,
    },
    {
      id: "rule-007",
      name: "Quantum Signature Verification",
      description: "Alert if quantum-resistant signature fails",
      condition: "tburn_quantum_sig_failures > 0",
      severity: "critical",
      enabled: true,
      notifications: ["email", "slack", "sms", "pagerduty", "webhook"],
      lastTriggered: null,
      triggerCount: 0,
      category: "security",
      cooldown: 60,
    },
    {
      id: "rule-008",
      name: "Network P99 Latency",
      description: "Network latency exceeds 100ms P99 threshold",
      condition: "tburn_network_latency_p99_ms > 100",
      severity: "high",
      enabled: true,
      notifications: ["slack", "webhook"],
      lastTriggered: null,
      triggerCount: 0,
      category: "performance",
      cooldown: 180,
    },
  ];

  const categories = [
    { value: "all", label: t("adminAlertRules.categories.all") },
    { value: "performance", label: t("adminAlertRules.categories.performance") },
    { value: "consensus", label: t("adminAlertRules.categories.consensus") },
    { value: "validators", label: t("adminAlertRules.categories.validators") },
    { value: "resources", label: t("adminAlertRules.categories.resources") },
    { value: "bridge", label: t("adminAlertRules.categories.bridge") },
    { value: "ai", label: t("adminAlertRules.categories.ai") },
    { value: "transactions", label: t("adminAlertRules.categories.transactions") },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-3 w-3" />;
      case "slack": return <MessageSquare className="h-3 w-3" />;
      case "sms": return <Smartphone className="h-3 w-3" />;
      case "pagerduty": return <Bell className="h-3 w-3" />;
      case "webhook": return <Webhook className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const filteredRules = alertRules.filter((rule) => {
    const matchesSearch = 
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || rule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = alertRules.filter(r => r.enabled).length;
  const criticalCount = alertRules.filter(r => r.severity === "critical" && r.enabled).length;
  const triggeredToday = alertRules.filter(r => {
    if (!r.lastTriggered) return false;
    const triggered = new Date(r.lastTriggered);
    const today = new Date();
    return triggered.toDateString() === today.toDateString();
  }).length;

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminAlertRules.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminAlertRules.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-rules">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminAlertRules.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="alert-rules-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-alert-rules-title">
              <Bell className="h-8 w-8" />
              {t("adminAlertRules.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-alert-rules-description">
              {t("adminAlertRules.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-rules">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminAlertRules.refresh")}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testRulesMutation.mutate()}
              disabled={testRulesMutation.isPending}
              data-testid="button-test-alerts"
            >
              <Play className="h-4 w-4 mr-2" />
              {t("adminAlertRules.testAll")}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-rule">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminAlertRules.createRule")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("adminAlertRules.dialog.createTitle")}</DialogTitle>
                  <DialogDescription>{t("adminAlertRules.dialog.createDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">{t("adminAlertRules.dialog.ruleName")}</Label>
                      <Input 
                        id="rule-name" 
                        placeholder={t("adminAlertRules.dialog.ruleNamePlaceholder")}
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        data-testid="input-rule-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-category">{t("adminAlertRules.dialog.category")}</Label>
                      <Select 
                        value={newRule.category}
                        onValueChange={(v) => setNewRule({ ...newRule, category: v })}
                      >
                        <SelectTrigger data-testid="select-rule-category">
                          <SelectValue placeholder={t("adminAlertRules.dialog.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-description">{t("adminAlertRules.dialog.description")}</Label>
                    <Textarea 
                      id="rule-description" 
                      placeholder={t("adminAlertRules.dialog.descriptionPlaceholder")}
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      data-testid="textarea-rule-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-condition">{t("adminAlertRules.dialog.condition")}</Label>
                    <Input 
                      id="rule-condition" 
                      placeholder={t("adminAlertRules.dialog.conditionPlaceholder")}
                      className="font-mono"
                      value={newRule.condition}
                      onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                      data-testid="input-rule-condition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("adminAlertRules.dialog.severity")}</Label>
                      <Select 
                        value={newRule.severity}
                        onValueChange={(v) => setNewRule({ ...newRule, severity: v as typeof newRule.severity })}
                      >
                        <SelectTrigger data-testid="select-rule-severity">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">{t("adminAlertRules.severity.critical")}</SelectItem>
                          <SelectItem value="high">{t("adminAlertRules.severity.high")}</SelectItem>
                          <SelectItem value="medium">{t("adminAlertRules.severity.medium")}</SelectItem>
                          <SelectItem value="low">{t("adminAlertRules.severity.low")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-cooldown">{t("adminAlertRules.dialog.cooldown")}</Label>
                      <Input 
                        id="rule-cooldown" 
                        type="number" 
                        value={newRule.cooldown}
                        onChange={(e) => setNewRule({ ...newRule, cooldown: parseInt(e.target.value) })}
                        data-testid="input-rule-cooldown"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminAlertRules.dialog.notifications")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Email", "Slack", "SMS", "PagerDuty", "Webhook"].map((channel) => (
                        <Button 
                          key={channel} 
                          variant={newRule.notifications.includes(channel.toLowerCase()) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const lower = channel.toLowerCase();
                            setNewRule({
                              ...newRule,
                              notifications: newRule.notifications.includes(lower)
                                ? newRule.notifications.filter(n => n !== lower)
                                : [...newRule.notifications, lower],
                            });
                          }}
                          data-testid={`button-notif-${channel.toLowerCase()}`}
                        >
                          {channel}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-create">
                    {t("adminAlertRules.dialog.cancel")}
                  </Button>
                  <Button 
                    onClick={() => createRuleMutation.mutate(newRule)}
                    disabled={createRuleMutation.isPending}
                    data-testid="button-confirm-create"
                  >
                    {t("adminAlertRules.dialog.create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-active-rules">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAlertRules.stats.activeRules")}</p>
                  <p className="text-2xl font-bold" data-testid="text-active-count">{enabledCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-critical-rules">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAlertRules.stats.criticalRules")}</p>
                  <p className="text-2xl font-bold" data-testid="text-critical-count">{criticalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-triggered-today">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAlertRules.stats.triggeredToday")}</p>
                  <p className="text-2xl font-bold" data-testid="text-triggered-count">{triggeredToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-total-triggers">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAlertRules.stats.totalTriggers")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-triggers">
                    {alertRules.reduce((sum, r) => sum + r.triggerCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-rules-table">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>{t("adminAlertRules.tableTitle")}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("adminAlertRules.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-rules"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40" data-testid="select-category">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adminAlertRules.table.status")}</TableHead>
                  <TableHead>{t("adminAlertRules.table.name")}</TableHead>
                  <TableHead>{t("adminAlertRules.table.condition")}</TableHead>
                  <TableHead>{t("adminAlertRules.table.severity")}</TableHead>
                  <TableHead>{t("adminAlertRules.table.notifications")}</TableHead>
                  <TableHead>{t("adminAlertRules.table.lastTriggered")}</TableHead>
                  <TableHead>{t("adminAlertRules.table.count")}</TableHead>
                  <TableHead className="text-right">{t("adminAlertRules.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule, index) => (
                  <TableRow key={rule.id} data-testid={`rule-row-${index}`}>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => updateRuleMutation.mutate({ id: rule.id, enabled })}
                        data-testid={`switch-rule-${rule.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{rule.condition}</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {t(`adminAlertRules.severity.${rule.severity}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rule.notifications.map((notif) => (
                          <Badge key={notif} variant="outline" className="gap-1">
                            {getNotificationIcon(notif)}
                            {notif}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.lastTriggered ? (
                        <span className="text-sm">
                          {new Date(rule.lastTriggered).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">{t("adminAlertRules.never")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.triggerCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedRule(rule);
                            setShowRuleDetail(true);
                          }}
                          data-testid={`button-view-rule-${index}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-test-rule-${index}`}>
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-edit-rule-${index}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-copy-rule-${index}`}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => confirmDelete(rule.id)}
                          data-testid={`button-delete-rule-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card data-testid="card-notification-channels">
          <CardHeader>
            <CardTitle>{t("adminAlertRules.channels.title")}</CardTitle>
            <CardDescription>{t("adminAlertRules.channels.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg space-y-3" data-testid="channel-email">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">{t("adminAlertRules.channels.email")}</span>
                  </div>
                  <Badge variant="default">{t("adminAlertRules.channels.active")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t("adminAlertRules.channels.emailRecipients")}</p>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-configure-email">
                  {t("adminAlertRules.channels.configure")}
                </Button>
              </div>
              <div className="p-4 border rounded-lg space-y-3" data-testid="channel-slack">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">{t("adminAlertRules.channels.slack")}</span>
                  </div>
                  <Badge variant="default">{t("adminAlertRules.channels.active")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t("adminAlertRules.channels.slackChannel")}</p>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-configure-slack">
                  {t("adminAlertRules.channels.configure")}
                </Button>
              </div>
              <div className="p-4 border rounded-lg space-y-3" data-testid="channel-sms">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    <span className="font-medium">{t("adminAlertRules.channels.sms")}</span>
                  </div>
                  <Badge variant="secondary">{t("adminAlertRules.channels.inactive")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t("adminAlertRules.channels.notConfigured")}</p>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-configure-sms">
                  {t("adminAlertRules.channels.configure")}
                </Button>
              </div>
              <div className="p-4 border rounded-lg space-y-3" data-testid="channel-pagerduty">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <span className="font-medium">{t("adminAlertRules.channels.pagerduty")}</span>
                  </div>
                  <Badge variant="default">{t("adminAlertRules.channels.active")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t("adminAlertRules.channels.pagerdutyService")}</p>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-configure-pagerduty">
                  {t("adminAlertRules.channels.configure")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedRule && (
        <DetailSheet
          open={showRuleDetail}
          onOpenChange={setShowRuleDetail}
          title={selectedRule.name}
          subtitle={selectedRule.id}
          icon={<Bell className="h-5 w-5" />}
          sections={getRuleDetailSections(selectedRule)}
        />
      )}

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("adminAlertRules.confirm.deleteTitle")}
        description={t("adminAlertRules.confirm.deleteDesc")}
        actionType="delete"
        onConfirm={handleConfirmDelete}
        isLoading={deleteRuleMutation.isPending}
        destructive={true}
        confirmText={t("common.delete")}
        cancelText={t("adminAlertRules.cancel")}
      />
    </div>
  );
}
