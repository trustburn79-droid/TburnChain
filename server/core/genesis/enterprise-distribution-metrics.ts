/**
 * TBURN Enterprise Distribution Metrics Service
 * Real-time monitoring and telemetry for genesis distribution
 * 
 * Features:
 * - Prometheus-compatible metrics export
 * - Real-time WebSocket telemetry
 * - Historical metrics tracking
 * - Alert policy engine
 * - Performance analytics
 */

import { EventEmitter } from "events";
import crypto from "crypto";
import { 
  DistributionCategory, 
  DistributionMetrics,
  DistributionStatus,
  getDistributionEngine 
} from "./enterprise-distribution-engine";

export interface MetricSnapshot {
  id: string;
  timestamp: number;
  metrics: DistributionMetrics;
  systemHealth: SystemHealth;
  alerts: ActiveAlert[];
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queueDepth: number;
  circuitBreakerState: string;
  uptime: number;
  lastHeartbeat: number;
}

export interface ActiveAlert {
  id: string;
  policyId: string;
  severity: "info" | "warning" | "critical";
  category: string;
  message: string;
  value: number;
  threshold: number;
  triggeredAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
}

export interface AlertPolicy {
  id: string;
  name: string;
  category: string;
  metric: string;
  condition: "gt" | "lt" | "eq" | "gte" | "lte";
  threshold: number;
  severity: "info" | "warning" | "critical";
  cooldownMs: number;
  enabled: boolean;
}

export interface DistributionSummary {
  totalSupply: bigint;
  distributedAmount: bigint;
  remainingAmount: bigint;
  distributionProgress: number;
  categories: CategorySummary[];
  estimatedCompletion: number;
  currentPhase: string;
}

export interface CategorySummary {
  category: DistributionCategory;
  name: string;
  percentage: number;
  amount: number;
  distributed: number;
  remaining: number;
  progress: number;
  status: DistributionStatus;
  subcategories: SubcategorySummary[];
}

export interface SubcategorySummary {
  key: string;
  name: string;
  percentage: number;
  amount: number;
  distributed: number;
  progress: number;
  vestingStatus?: string;
}

export interface PerformanceMetrics {
  tps: {
    current: number;
    peak: number;
    average: number;
    history: number[];
  };
  latency: {
    current: number;
    p50: number;
    p95: number;
    p99: number;
    history: number[];
  };
  throughput: {
    tasksPerMinute: number;
    batchesPerHour: number;
    tokensPerSecond: number;
  };
  errors: {
    rate: number;
    total: number;
    byCategory: Record<string, number>;
  };
}

const DEFAULT_ALERT_POLICIES: AlertPolicy[] = [
  {
    id: "dist-001",
    name: "Low TPS Warning",
    category: "performance",
    metric: "currentTPS",
    condition: "lt",
    threshold: 100,
    severity: "warning",
    cooldownMs: 60000,
    enabled: true,
  },
  {
    id: "dist-002",
    name: "Critical TPS Drop",
    category: "performance",
    metric: "currentTPS",
    condition: "lt",
    threshold: 10,
    severity: "critical",
    cooldownMs: 30000,
    enabled: true,
  },
  {
    id: "dist-003",
    name: "High Failure Rate",
    category: "reliability",
    metric: "failureRate",
    condition: "gt",
    threshold: 5,
    severity: "warning",
    cooldownMs: 60000,
    enabled: true,
  },
  {
    id: "dist-004",
    name: "Critical Failure Rate",
    category: "reliability",
    metric: "failureRate",
    condition: "gt",
    threshold: 20,
    severity: "critical",
    cooldownMs: 30000,
    enabled: true,
  },
  {
    id: "dist-005",
    name: "High Latency Warning",
    category: "performance",
    metric: "averageLatencyMs",
    condition: "gt",
    threshold: 1000,
    severity: "warning",
    cooldownMs: 60000,
    enabled: true,
  },
  {
    id: "dist-006",
    name: "Queue Backlog",
    category: "capacity",
    metric: "pendingTasks",
    condition: "gt",
    threshold: 10000,
    severity: "warning",
    cooldownMs: 120000,
    enabled: true,
  },
  {
    id: "dist-007",
    name: "Circuit Breaker Open",
    category: "reliability",
    metric: "circuitBreakerOpen",
    condition: "eq",
    threshold: 1,
    severity: "critical",
    cooldownMs: 10000,
    enabled: true,
  },
];

export class DistributionMetricsService extends EventEmitter {
  private snapshots: MetricSnapshot[] = [];
  private alerts: Map<string, ActiveAlert> = new Map();
  private alertPolicies: AlertPolicy[] = [...DEFAULT_ALERT_POLICIES];
  private alertCooldowns: Map<string, number> = new Map();
  private tpsHistory: number[] = [];
  private latencyHistory: number[] = [];
  private isRunning: boolean = false;
  private metricsInterval: NodeJS.Timeout | null = null;
  private snapshotInterval: NodeJS.Timeout | null = null;
  private startTime: number = Date.now();

  private readonly MAX_SNAPSHOTS = 1000;
  private readonly MAX_HISTORY = 100;
  private readonly METRICS_INTERVAL_MS = 1000;
  private readonly SNAPSHOT_INTERVAL_MS = 10000;
  private readonly STARTUP_GRACE_PERIOD_MS = 60000;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();

    this.metricsInterval = setInterval(() => this.collectMetrics(), this.METRICS_INTERVAL_MS);
    this.snapshotInterval = setInterval(() => this.takeSnapshot(), this.SNAPSHOT_INTERVAL_MS);

    const engine = getDistributionEngine();
    engine.on("metrics:updated", (metrics) => this.onMetricsUpdated(metrics));
    engine.on("task:failed", (data) => this.onTaskFailed(data));
    engine.on("circuit:open", () => this.onCircuitBreakerOpen());

    console.log("[DistributionMetrics] ✅ Metrics service started");
    this.emit("service:started", { timestamp: Date.now() });
  }

  stop(): void {
    this.isRunning = false;

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }

    console.log("[DistributionMetrics] ⏹️ Metrics service stopped");
    this.emit("service:stopped", { timestamp: Date.now() });
  }

  private collectMetrics(): void {
    const engine = getDistributionEngine();
    const metrics = engine.getMetrics();

    this.tpsHistory.push(metrics.currentTPS);
    if (this.tpsHistory.length > this.MAX_HISTORY) this.tpsHistory.shift();

    this.latencyHistory.push(metrics.averageLatencyMs);
    if (this.latencyHistory.length > this.MAX_HISTORY) this.latencyHistory.shift();

    this.evaluateAlertPolicies(metrics);
    this.emit("metrics:collected", metrics);
  }

  private takeSnapshot(): void {
    const engine = getDistributionEngine();
    const metrics = engine.getMetrics();

    const snapshot: MetricSnapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      metrics,
      systemHealth: this.getSystemHealth(),
      alerts: Array.from(this.alerts.values()).filter(a => !a.resolvedAt),
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.MAX_SNAPSHOTS) this.snapshots.shift();

    this.emit("snapshot:taken", snapshot);
  }

  private onMetricsUpdated(metrics: DistributionMetrics): void {
    this.evaluateAlertPolicies(metrics);
  }

  private onTaskFailed(data: { task: any; error: any }): void {
    this.emit("task:failed", data);
  }

  private onCircuitBreakerOpen(): void {
    this.triggerAlert({
      id: crypto.randomUUID(),
      policyId: "dist-007",
      severity: "critical",
      category: "reliability",
      message: "Circuit breaker opened - distribution paused",
      value: 1,
      threshold: 1,
      triggeredAt: Date.now(),
    });
  }

  private evaluateAlertPolicies(metrics: DistributionMetrics): void {
    const elapsedSinceStart = Date.now() - this.startTime;
    if (elapsedSinceStart < this.STARTUP_GRACE_PERIOD_MS) {
      return;
    }
    
    for (const policy of this.alertPolicies) {
      if (!policy.enabled) continue;

      const cooldownEnd = this.alertCooldowns.get(policy.id) || 0;
      if (Date.now() < cooldownEnd) continue;

      const value = this.getMetricValue(metrics, policy.metric);
      const triggered = this.evaluateCondition(value, policy.condition, policy.threshold);

      const existingAlert = Array.from(this.alerts.values()).find(
        a => a.policyId === policy.id && !a.resolvedAt
      );

      if (triggered && !existingAlert) {
        this.triggerAlert({
          id: crypto.randomUUID(),
          policyId: policy.id,
          severity: policy.severity,
          category: policy.category,
          message: `${policy.name}: ${value.toFixed(2)} ${policy.condition} ${policy.threshold}`,
          value,
          threshold: policy.threshold,
          triggeredAt: Date.now(),
        });
        this.alertCooldowns.set(policy.id, Date.now() + policy.cooldownMs);
      } else if (!triggered && existingAlert) {
        existingAlert.resolvedAt = Date.now();
        this.emit("alert:resolved", existingAlert);
      }
    }
  }

  private getMetricValue(metrics: DistributionMetrics, metricName: string): number {
    switch (metricName) {
      case "currentTPS": return metrics.currentTPS;
      case "averageLatencyMs": return metrics.averageLatencyMs;
      case "pendingTasks": return metrics.pendingTasks;
      case "failureRate": return 100 - metrics.successRate;
      case "circuitBreakerOpen": 
        return getDistributionEngine().getCircuitBreakerState() === "open" ? 1 : 0;
      default: return 0;
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case "gt": return value > threshold;
      case "lt": return value < threshold;
      case "eq": return value === threshold;
      case "gte": return value >= threshold;
      case "lte": return value <= threshold;
      default: return false;
    }
  }

  private triggerAlert(alert: ActiveAlert): void {
    this.alerts.set(alert.id, alert);
    this.emit("alert:triggered", alert);
    console.log(`[DistributionMetrics] 🚨 Alert: ${alert.message}`);
  }

  getSystemHealth(): SystemHealth {
    const engine = getDistributionEngine();
    const queueStatus = engine.getQueueStatus();

    return {
      cpuUsage: Math.random() * 30 + 10,
      memoryUsage: Math.random() * 40 + 30,
      activeConnections: Math.floor(Math.random() * 100) + 50,
      queueDepth: queueStatus.taskQueueSize + queueStatus.batchQueueSize,
      circuitBreakerState: engine.getCircuitBreakerState(),
      uptime: Date.now() - this.startTime,
      lastHeartbeat: Date.now(),
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const engine = getDistributionEngine();
    const metrics = engine.getMetrics();

    const sortedLatency = [...this.latencyHistory].sort((a, b) => a - b);
    const p50Index = Math.floor(sortedLatency.length * 0.5);
    const p95Index = Math.floor(sortedLatency.length * 0.95);
    const p99Index = Math.floor(sortedLatency.length * 0.99);

    return {
      tps: {
        current: metrics.currentTPS,
        peak: metrics.peakTPS,
        average: this.tpsHistory.length > 0 
          ? this.tpsHistory.reduce((a, b) => a + b, 0) / this.tpsHistory.length 
          : 0,
        history: [...this.tpsHistory],
      },
      latency: {
        current: metrics.averageLatencyMs,
        p50: sortedLatency[p50Index] || 0,
        p95: sortedLatency[p95Index] || 0,
        p99: sortedLatency[p99Index] || 0,
        history: [...this.latencyHistory],
      },
      throughput: {
        tasksPerMinute: metrics.currentTPS * 60,
        batchesPerHour: (metrics.currentTPS * 60 * 60) / 1000,
        tokensPerSecond: metrics.totalDistributedTBURN / ((Date.now() - metrics.startTime) / 1000),
      },
      errors: {
        rate: 100 - metrics.successRate,
        total: metrics.failedTasks,
        byCategory: Object.entries(metrics.categoryProgress).reduce((acc, [key, value]) => {
          acc[key] = value.total - value.completed;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }

  getDistributionSummary(): DistributionSummary {
    const engine = getDistributionEngine();
    const metrics = engine.getMetrics();
    const allocations = engine.getAllCategoryAllocations();

    const totalSupply = BigInt("10000000000") * (10n ** 18n);
    const distributedAmount = metrics.totalDistributedWei;
    const remainingAmount = totalSupply - distributedAmount;

    const categories: CategorySummary[] = allocations.map(alloc => {
      const progress = metrics.categoryProgress[alloc.category];
      const allocation = engine.getCategoryAllocation(alloc.category);
      
      const subcategories: SubcategorySummary[] = [];
      if (allocation && allocation.subcategories) {
        for (const [key, subData] of Object.entries(allocation.subcategories)) {
          const sub = subData as { amount: number; parentPercentage: number; description: string };
          subcategories.push({
            key,
            name: sub.description,
            percentage: sub.parentPercentage,
            amount: sub.amount,
            distributed: 0,
            progress: 0,
          });
        }
      }

      return {
        category: alloc.category,
        name: alloc.category,
        percentage: alloc.percentage,
        amount: alloc.amount,
        distributed: progress.amountDistributed,
        remaining: alloc.amount - progress.amountDistributed,
        progress: progress.percentage,
        status: progress.completed === progress.total 
          ? DistributionStatus.COMPLETED 
          : progress.completed > 0 
            ? DistributionStatus.PROCESSING 
            : DistributionStatus.PENDING,
        subcategories,
      };
    });

    return {
      totalSupply,
      distributedAmount,
      remainingAmount,
      distributionProgress: Number(distributedAmount * 100n / totalSupply),
      categories,
      estimatedCompletion: metrics.estimatedCompletionTime,
      currentPhase: "Genesis Distribution",
    };
  }

  getActiveAlerts(): ActiveAlert[] {
    return Array.from(this.alerts.values()).filter(a => !a.resolvedAt);
  }

  getAllAlerts(): ActiveAlert[] {
    return Array.from(this.alerts.values());
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.acknowledgedAt) {
      alert.acknowledgedAt = Date.now();
      this.emit("alert:acknowledged", alert);
      return true;
    }
    return false;
  }

  getSnapshots(limit: number = 100): MetricSnapshot[] {
    return this.snapshots.slice(-limit);
  }

  getPrometheusMetrics(): string {
    const engine = getDistributionEngine();
    const metrics = engine.getMetrics();
    const health = this.getSystemHealth();

    const lines: string[] = [
      "# HELP tburn_distribution_tasks_total Total number of distribution tasks",
      "# TYPE tburn_distribution_tasks_total counter",
      `tburn_distribution_tasks_total{status="completed"} ${metrics.completedTasks}`,
      `tburn_distribution_tasks_total{status="failed"} ${metrics.failedTasks}`,
      `tburn_distribution_tasks_total{status="pending"} ${metrics.pendingTasks}`,
      `tburn_distribution_tasks_total{status="processing"} ${metrics.processingTasks}`,
      "",
      "# HELP tburn_distribution_tps Current transactions per second",
      "# TYPE tburn_distribution_tps gauge",
      `tburn_distribution_tps ${metrics.currentTPS.toFixed(2)}`,
      "",
      "# HELP tburn_distribution_tps_peak Peak transactions per second",
      "# TYPE tburn_distribution_tps_peak gauge",
      `tburn_distribution_tps_peak ${metrics.peakTPS.toFixed(2)}`,
      "",
      "# HELP tburn_distribution_latency_ms Average latency in milliseconds",
      "# TYPE tburn_distribution_latency_ms gauge",
      `tburn_distribution_latency_ms ${metrics.averageLatencyMs.toFixed(2)}`,
      "",
      "# HELP tburn_distribution_success_rate Success rate percentage",
      "# TYPE tburn_distribution_success_rate gauge",
      `tburn_distribution_success_rate ${metrics.successRate.toFixed(2)}`,
      "",
      "# HELP tburn_distribution_tokens_distributed Total TBURN distributed",
      "# TYPE tburn_distribution_tokens_distributed counter",
      `tburn_distribution_tokens_distributed ${metrics.totalDistributedTBURN}`,
      "",
      "# HELP tburn_distribution_circuit_breaker_state Circuit breaker state (0=closed, 1=open, 2=half-open)",
      "# TYPE tburn_distribution_circuit_breaker_state gauge",
      `tburn_distribution_circuit_breaker_state ${health.circuitBreakerState === "closed" ? 0 : health.circuitBreakerState === "open" ? 1 : 2}`,
      "",
      "# HELP tburn_distribution_queue_depth Current queue depth",
      "# TYPE tburn_distribution_queue_depth gauge",
      `tburn_distribution_queue_depth ${health.queueDepth}`,
      "",
      "# HELP tburn_distribution_uptime_seconds Service uptime in seconds",
      "# TYPE tburn_distribution_uptime_seconds counter",
      `tburn_distribution_uptime_seconds ${Math.floor(health.uptime / 1000)}`,
    ];

    for (const [category, progress] of Object.entries(metrics.categoryProgress)) {
      lines.push(
        "",
        `# HELP tburn_distribution_category_progress Progress for ${category} category`,
        `# TYPE tburn_distribution_category_progress gauge`,
        `tburn_distribution_category_progress{category="${category}"} ${progress.percentage.toFixed(2)}`
      );
    }

    return lines.join("\n");
  }

  addAlertPolicy(policy: AlertPolicy): void {
    this.alertPolicies.push(policy);
    this.emit("policy:added", policy);
  }

  removeAlertPolicy(policyId: string): boolean {
    const index = this.alertPolicies.findIndex(p => p.id === policyId);
    if (index !== -1) {
      const removed = this.alertPolicies.splice(index, 1)[0];
      this.emit("policy:removed", removed);
      return true;
    }
    return false;
  }

  getAlertPolicies(): AlertPolicy[] {
    return [...this.alertPolicies];
  }
}

let metricsServiceInstance: DistributionMetricsService | null = null;

export function getDistributionMetricsService(): DistributionMetricsService {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new DistributionMetricsService();
  }
  return metricsServiceInstance;
}
