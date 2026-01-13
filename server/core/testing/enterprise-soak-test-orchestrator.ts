/**
 * Enterprise Soak Test Orchestrator v2.0
 * Phase 16: Production-Grade Load Testing Infrastructure
 * 
 * Features:
 * - Multiple test scenarios (stress, spike, endurance, chaos)
 * - Baseline performance comparison
 * - Regression detection with statistical analysis
 * - Anomaly detection using Z-scores
 * - SLA monitoring and alerting
 */

import crypto from 'crypto';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TestType = 'session_stability' | 'memory_leak' | 'throughput' | 'failover' | 'stress' | 'spike' | 'endurance' | 'chaos';
export type RegressionSeverity = 'info' | 'warning' | 'critical';
export type RegressionStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';

interface TestScenario {
  name: string;
  type: TestType;
  description: string;
  endpoints: string[];
  concurrentUsers: number;
  requestsPerSecond: number;
  durationMinutes: number;
  rampUpSeconds: number;
  rampDownSeconds?: number;
  spikeMultiplier?: number;
  spikeIntervalMinutes?: number;
  slaTargets?: SLATargets;
}

interface SLATargets {
  maxP99LatencyMs: number;
  minSuccessRate: number;
  minSkipRatio: number;
  maxErrorRate: number;
  maxMemoryGrowthPercent: number;
}

interface TestMetrics {
  timestamp: Date;
  minuteOffset: number;
  requests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  sessionsCreated: number;
  sessionsSkipped: number;
  sessionsActive: number;
  skipRatio: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  rps: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  cpuUsagePercent: number;
}

interface TestSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  sessionsCreated: number;
  sessionsSkipped: number;
  sessionSkipRatio: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  startMemoryMb: number;
  endMemoryMb: number;
  peakMemoryMb: number;
  memoryLeakDetected: boolean;
  memoryGrowthRate: number;
  memoryGrowthPercent: number;
  alertsTriggered: number;
  criticalIssues: number;
  slaViolations: string[];
  regressions: Regression[];
}

interface TestRun {
  id: string;
  runId: string;
  scenario: TestScenario;
  status: TestStatus;
  startedAt: Date;
  endedAt: Date | null;
  metrics: TestMetrics[];
  summary: TestSummary | null;
  alerts: string[];
  issues: string[];
  baselineId: string | null;
  regressionReport: RegressionReport | null;
}

interface Baseline {
  id: string;
  name: string;
  scenario: string;
  referenceRunId: string;
  createdAt: Date;
  metrics: {
    avgLatencyMs: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    successRate: number;
    skipRatio: number;
    rps: number;
    heapUsedMb: number;
    heapGrowthRateMbPerHour: number;
  };
  tolerances: {
    latencyPercent: number;
    throughputPercent: number;
    memoryPercent: number;
  };
  isActive: boolean;
}

interface Regression {
  id: string;
  type: 'latency' | 'throughput' | 'memory' | 'session' | 'error_rate';
  severity: RegressionSeverity;
  metricName: string;
  baselineValue: number;
  currentValue: number;
  deviationPercent: number;
  tolerancePercent: number;
  description: string;
  possibleCauses: string[];
  recommendations: string[];
  status: RegressionStatus;
}

interface RegressionReport {
  runId: string;
  baselineId: string;
  analyzedAt: Date;
  totalRegressions: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  regressions: Regression[];
  overallStatus: 'pass' | 'warning' | 'fail';
  summary: string;
}

interface AnomalyDetection {
  enabled: boolean;
  windowSize: number;
  zScoreThreshold: number;
  anomalies: Array<{
    timestamp: Date;
    metric: string;
    value: number;
    zScore: number;
    expected: number;
    deviation: number;
  }>;
}

// ============================================================================
// Default Scenarios (Enhanced)
// ============================================================================

const DEFAULT_SCENARIOS: Record<string, TestScenario> = {
  session_stability: {
    name: 'Session Stability Test',
    type: 'session_stability',
    description: 'Standard session stability test with moderate load',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
      '/api/validators/status',
      '/api/network/stats',
      '/api/shards',
    ],
    concurrentUsers: 50,
    requestsPerSecond: 500,
    durationMinutes: 60,
    rampUpSeconds: 60,
    slaTargets: {
      maxP99LatencyMs: 200,
      minSuccessRate: 0.99,
      minSkipRatio: 0.7,
      maxErrorRate: 0.01,
      maxMemoryGrowthPercent: 50,
    },
  },
  memory_leak: {
    name: 'Memory Leak Detection',
    type: 'memory_leak',
    description: 'Extended test for detecting memory leaks',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
      '/api/cross-shard-router/status',
    ],
    concurrentUsers: 100,
    requestsPerSecond: 1000,
    durationMinutes: 120,
    rampUpSeconds: 120,
    slaTargets: {
      maxP99LatencyMs: 300,
      minSuccessRate: 0.98,
      minSkipRatio: 0.6,
      maxErrorRate: 0.02,
      maxMemoryGrowthPercent: 30,
    },
  },
  throughput: {
    name: 'Maximum Throughput Test',
    type: 'throughput',
    description: 'Push system to maximum throughput capacity',
    endpoints: ['/api/public/v1/network/stats'],
    concurrentUsers: 200,
    requestsPerSecond: 2000,
    durationMinutes: 30,
    rampUpSeconds: 30,
    slaTargets: {
      maxP99LatencyMs: 500,
      minSuccessRate: 0.95,
      minSkipRatio: 0.5,
      maxErrorRate: 0.05,
      maxMemoryGrowthPercent: 100,
    },
  },
  stress: {
    name: 'Stress Test',
    type: 'stress',
    description: 'Gradually increase load until system breaks',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/validators/status',
      '/api/shards',
    ],
    concurrentUsers: 300,
    requestsPerSecond: 3000,
    durationMinutes: 45,
    rampUpSeconds: 300,
    slaTargets: {
      maxP99LatencyMs: 1000,
      minSuccessRate: 0.9,
      minSkipRatio: 0.4,
      maxErrorRate: 0.1,
      maxMemoryGrowthPercent: 150,
    },
  },
  spike: {
    name: 'Spike Test',
    type: 'spike',
    description: 'Test system response to sudden traffic spikes',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
    ],
    concurrentUsers: 50,
    requestsPerSecond: 500,
    durationMinutes: 30,
    rampUpSeconds: 10,
    spikeMultiplier: 5,
    spikeIntervalMinutes: 5,
    slaTargets: {
      maxP99LatencyMs: 500,
      minSuccessRate: 0.95,
      minSkipRatio: 0.5,
      maxErrorRate: 0.05,
      maxMemoryGrowthPercent: 75,
    },
  },
  endurance: {
    name: 'Endurance Test',
    type: 'endurance',
    description: 'Long-running test for system stability',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
    ],
    concurrentUsers: 30,
    requestsPerSecond: 300,
    durationMinutes: 480,
    rampUpSeconds: 60,
    slaTargets: {
      maxP99LatencyMs: 150,
      minSuccessRate: 0.999,
      minSkipRatio: 0.8,
      maxErrorRate: 0.001,
      maxMemoryGrowthPercent: 25,
    },
  },
  chaos: {
    name: 'Chaos Test',
    type: 'chaos',
    description: 'Test system resilience with random failures',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/validators/status',
      '/api/shards',
      '/api/blocks',
    ],
    concurrentUsers: 100,
    requestsPerSecond: 1000,
    durationMinutes: 60,
    rampUpSeconds: 60,
    slaTargets: {
      maxP99LatencyMs: 500,
      minSuccessRate: 0.9,
      minSkipRatio: 0.5,
      maxErrorRate: 0.1,
      maxMemoryGrowthPercent: 100,
    },
  },
  quick_check: {
    name: 'Quick Health Check',
    type: 'session_stability',
    description: 'Fast sanity check of system health',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
    ],
    concurrentUsers: 10,
    requestsPerSecond: 100,
    durationMinutes: 5,
    rampUpSeconds: 10,
    slaTargets: {
      maxP99LatencyMs: 100,
      minSuccessRate: 0.99,
      minSkipRatio: 0.8,
      maxErrorRate: 0.01,
      maxMemoryGrowthPercent: 20,
    },
  },
  
  // ============================================================================
  // 10x/100x Traffic Surge Tests (Phase 17)
  // ============================================================================
  
  traffic_surge_10x: {
    name: '10x Traffic Surge Test',
    type: 'spike',
    description: 'Simulate 10x normal traffic to test MemoryGovernor, RequestShedder, and Circuit Breakers',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
      '/api/validators/status',
      '/api/shards',
      '/api/blocks',
      '/api/network/stats',
    ],
    concurrentUsers: 500,
    requestsPerSecond: 5000,
    durationMinutes: 15,
    rampUpSeconds: 30,
    spikeMultiplier: 10,
    spikeIntervalMinutes: 3,
    slaTargets: {
      maxP99LatencyMs: 800,
      minSuccessRate: 0.85,
      minSkipRatio: 0.3,
      maxErrorRate: 0.15,
      maxMemoryGrowthPercent: 200,
    },
  },
  
  traffic_surge_100x: {
    name: '100x Traffic Surge Test',
    type: 'spike',
    description: 'Extreme 100x traffic to validate emergency mechanisms and graceful degradation',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
      '/api/validators/status',
      '/api/shards',
      '/api/blocks',
      '/api/network/stats',
      '/api/cross-shard-router/status',
    ],
    concurrentUsers: 3000,
    requestsPerSecond: 50000,
    durationMinutes: 10,
    rampUpSeconds: 60,
    spikeMultiplier: 100,
    spikeIntervalMinutes: 2,
    slaTargets: {
      maxP99LatencyMs: 2000,
      minSuccessRate: 0.70,
      minSkipRatio: 0.2,
      maxErrorRate: 0.30,
      maxMemoryGrowthPercent: 300,
    },
  },
  
  db_pool_saturation: {
    name: 'DB Pool Saturation Test',
    type: 'stress',
    description: 'Test database connection pool exhaustion and recovery with heavy DB-bound requests',
    endpoints: [
      '/api/blocks',
      '/api/transactions',
      '/api/wallets',
      '/api/validators/list',
      '/api/shards',
      '/api/staking/validators',
      '/api/governance/proposals',
    ],
    concurrentUsers: 200,
    requestsPerSecond: 2000,
    durationMinutes: 20,
    rampUpSeconds: 120,
    slaTargets: {
      maxP99LatencyMs: 1500,
      minSuccessRate: 0.80,
      minSkipRatio: 0.25,
      maxErrorRate: 0.20,
      maxMemoryGrowthPercent: 150,
    },
  },
  
  resilience_cascade: {
    name: 'Resilience Cascade Test',
    type: 'chaos',
    description: 'Test all 7 protection mechanisms under combined pressure: Memory, Shedder, Circuit Breaker, Scaling, Pooling, and Recovery',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
      '/api/validators/status',
      '/api/shards',
      '/api/blocks',
      '/api/transactions',
      '/api/wallets',
      '/api/cross-shard-router/status',
      '/api/pipeline/stats',
    ],
    concurrentUsers: 1000,
    requestsPerSecond: 10000,
    durationMinutes: 30,
    rampUpSeconds: 60,
    spikeMultiplier: 20,
    spikeIntervalMinutes: 5,
    slaTargets: {
      maxP99LatencyMs: 1000,
      minSuccessRate: 0.75,
      minSkipRatio: 0.2,
      maxErrorRate: 0.25,
      maxMemoryGrowthPercent: 250,
    },
  },
};

// ============================================================================
// Enterprise Soak Test Orchestrator
// ============================================================================

export class EnterpriseSoakTestOrchestrator {
  private static instance: EnterpriseSoakTestOrchestrator;
  
  private currentRun: TestRun | null = null;
  private runHistory: TestRun[] = [];
  private readonly maxHistory = 100;
  
  // Baselines
  private baselines: Map<string, Baseline> = new Map();
  private readonly maxBaselines = 50;
  
  // Internal state
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private activeWorkers: AbortController[] = [];
  private spikeTimer: NodeJS.Timeout | null = null;
  private currentLoadMultiplier = 1;
  
  // Anomaly detection
  private anomalyDetection: AnomalyDetection = {
    enabled: true,
    windowSize: 10,
    zScoreThreshold: 2.5,
    anomalies: [],
  };
  
  // Metrics collection
  private currentMinuteMetrics: {
    requests: number;
    successful: number;
    failed: number;
    latencies: number[];
    sessionsCreated: number;
    sessionsSkipped: number;
  } = this.createEmptyMinuteMetrics();
  
  // CPU tracking
  private lastCpuUsage = process.cpuUsage();
  private lastCpuTime = Date.now();
  
  private constructor() {}
  
  static getInstance(): EnterpriseSoakTestOrchestrator {
    if (!EnterpriseSoakTestOrchestrator.instance) {
      EnterpriseSoakTestOrchestrator.instance = new EnterpriseSoakTestOrchestrator();
    }
    return EnterpriseSoakTestOrchestrator.instance;
  }
  
  // ============================================================================
  // Baseline Management
  // ============================================================================
  
  createBaseline(name: string, runId: string): Baseline | null {
    const run = this.getRun(runId);
    if (!run || !run.summary) {
      return null;
    }
    
    const baselineId = `baseline_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    const baseline: Baseline = {
      id: baselineId,
      name,
      scenario: run.scenario.name,
      referenceRunId: runId,
      createdAt: new Date(),
      metrics: {
        avgLatencyMs: run.summary.avgLatencyMs,
        p50LatencyMs: run.summary.p50LatencyMs,
        p95LatencyMs: run.summary.p95LatencyMs,
        p99LatencyMs: run.summary.p99LatencyMs,
        successRate: run.summary.successRate,
        skipRatio: run.summary.sessionSkipRatio,
        rps: run.metrics.length > 0 
          ? run.metrics.reduce((sum, m) => sum + m.rps, 0) / run.metrics.length 
          : 0,
        heapUsedMb: run.summary.peakMemoryMb,
        heapGrowthRateMbPerHour: run.summary.memoryGrowthRate * 60,
      },
      tolerances: {
        latencyPercent: 20,
        throughputPercent: 15,
        memoryPercent: 25,
      },
      isActive: true,
    };
    
    // Deactivate previous baselines for same scenario
    this.baselines.forEach(b => {
      if (b.scenario === baseline.scenario && b.id !== baselineId) {
        b.isActive = false;
      }
    });
    
    this.baselines.set(baselineId, baseline);
    
    // Limit baselines
    if (this.baselines.size > this.maxBaselines) {
      const inactive = Array.from(this.baselines.entries())
        .filter(([, b]) => !b.isActive)
        .sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime());
      
      if (inactive.length > 0) {
        this.baselines.delete(inactive[0][0]);
      }
    }
    
    console.log(`[SoakTest] Created baseline "${name}" from run ${runId}`);
    return baseline;
  }
  
  getActiveBaseline(scenario: string): Baseline | undefined {
    return Array.from(this.baselines.values())
      .find(b => b.scenario === scenario && b.isActive);
  }
  
  getAllBaselines(): Baseline[] {
    return Array.from(this.baselines.values());
  }
  
  updateBaselineTolerances(baselineId: string, tolerances: Partial<Baseline['tolerances']>): boolean {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) return false;
    
    baseline.tolerances = { ...baseline.tolerances, ...tolerances };
    return true;
  }
  
  // ============================================================================
  // Test Execution
  // ============================================================================
  
  async startTest(scenarioName: string, options?: Partial<TestScenario>): Promise<TestRun> {
    if (this.isRunning) {
      throw new Error('A test is already running');
    }
    
    const baseScenario = DEFAULT_SCENARIOS[scenarioName] || DEFAULT_SCENARIOS.quick_check;
    const scenario: TestScenario = { ...baseScenario, ...options };
    
    const runId = `soak_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Find active baseline for comparison
    const baseline = this.getActiveBaseline(scenario.name);
    
    this.currentRun = {
      id: runId,
      runId,
      scenario,
      status: 'running',
      startedAt: new Date(),
      endedAt: null,
      metrics: [],
      summary: null,
      alerts: [],
      issues: [],
      baselineId: baseline?.id || null,
      regressionReport: null,
    };
    
    this.isRunning = true;
    this.currentMinuteMetrics = this.createEmptyMinuteMetrics();
    this.currentLoadMultiplier = 1;
    this.anomalyDetection.anomalies = [];
    
    console.log(`[SoakTest] Starting ${scenario.name} (${scenario.type}, ${scenario.durationMinutes} minutes)`);
    if (baseline) {
      console.log(`[SoakTest] Comparing against baseline: ${baseline.name}`);
    }
    
    // Start metrics collection
    this.startMetricsCollection();
    
    // Start load generation
    this.startLoadGeneration(scenario);
    
    // Handle spike tests
    if (scenario.type === 'spike' && scenario.spikeIntervalMinutes) {
      this.startSpikeSimulation(scenario);
    }
    
    // Schedule test completion
    const testDurationMs = scenario.durationMinutes * 60 * 1000;
    setTimeout(() => {
      if (this.currentRun?.runId === runId) {
        this.completeTest();
      }
    }, testDurationMs);
    
    return this.currentRun;
  }
  
  private startSpikeSimulation(scenario: TestScenario): void {
    const spikeIntervalMs = (scenario.spikeIntervalMinutes || 5) * 60 * 1000;
    const spikeDurationMs = 60000; // 1 minute spikes
    
    this.spikeTimer = setInterval(() => {
      if (!this.isRunning) return;
      
      // Start spike
      this.currentLoadMultiplier = scenario.spikeMultiplier || 5;
      console.log(`[SoakTest] 📈 SPIKE: Load multiplied by ${this.currentLoadMultiplier}x`);
      
      // End spike after duration
      setTimeout(() => {
        this.currentLoadMultiplier = 1;
        console.log(`[SoakTest] 📉 SPIKE ENDED: Load returned to normal`);
      }, spikeDurationMs);
    }, spikeIntervalMs);
  }
  
  private startMetricsCollection(): void {
    this.intervalTimer = setInterval(() => {
      this.collectMinuteMetrics();
    }, 60000);
    
    // Collect initial metrics
    this.collectMinuteMetrics();
  }
  
  private collectMinuteMetrics(): void {
    if (!this.currentRun) return;
    
    const memory = process.memoryUsage();
    const minuteOffset = this.currentRun.metrics.length;
    
    // Calculate CPU usage
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    const elapsedMs = Date.now() - this.lastCpuTime;
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / (elapsedMs * 1000) * 100;
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = Date.now();
    
    // Calculate latency percentiles
    const sortedLatencies = [...this.currentMinuteMetrics.latencies].sort((a, b) => a - b);
    const avgLatency = sortedLatencies.length > 0
      ? sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length
      : 0;
    
    const totalRequests = this.currentMinuteMetrics.successful + this.currentMinuteMetrics.failed;
    const sessionTotal = this.currentMinuteMetrics.sessionsCreated + this.currentMinuteMetrics.sessionsSkipped;
    
    const metric: TestMetrics = {
      timestamp: new Date(),
      minuteOffset,
      requests: this.currentMinuteMetrics.requests,
      successfulRequests: this.currentMinuteMetrics.successful,
      failedRequests: this.currentMinuteMetrics.failed,
      errorRate: totalRequests > 0 ? this.currentMinuteMetrics.failed / totalRequests : 0,
      sessionsCreated: this.currentMinuteMetrics.sessionsCreated,
      sessionsSkipped: this.currentMinuteMetrics.sessionsSkipped,
      sessionsActive: 0,
      skipRatio: sessionTotal > 0 ? this.currentMinuteMetrics.sessionsSkipped / sessionTotal : 1,
      avgLatencyMs: avgLatency,
      p50LatencyMs: this.percentile(sortedLatencies, 50),
      p95LatencyMs: this.percentile(sortedLatencies, 95),
      p99LatencyMs: this.percentile(sortedLatencies, 99),
      maxLatencyMs: sortedLatencies.length > 0 ? sortedLatencies[sortedLatencies.length - 1] : 0,
      rps: this.currentMinuteMetrics.requests / 60,
      heapUsedMb: memory.heapUsed / 1024 / 1024,
      // ★ [2026-01-08] V8 힙 제한 사용
      heapTotalMb: (() => {
        try {
          const v8 = require('v8');
          return v8.getHeapStatistics().heap_size_limit / (1024 * 1024);
        } catch { return memory.heapTotal / 1024 / 1024; }
      })(),
      externalMb: memory.external / 1024 / 1024,
      cpuUsagePercent: Math.min(cpuPercent, 100),
    };
    
    this.currentRun.metrics.push(metric);
    
    // Check for issues and SLA violations
    this.checkForIssues(metric);
    this.checkSLAViolations(metric);
    
    // Anomaly detection
    if (this.anomalyDetection.enabled) {
      this.detectAnomalies(metric);
    }
    
    // Reset minute metrics
    this.currentMinuteMetrics = this.createEmptyMinuteMetrics();
    
    console.log(`[SoakTest] Minute ${minuteOffset}: ${metric.requests} req, ` +
      `${(metric.errorRate * 100).toFixed(2)}% errors, ` +
      `${metric.avgLatencyMs.toFixed(2)}ms avg, ` +
      `${metric.heapUsedMb.toFixed(2)}MB heap, ` +
      `${metric.cpuUsagePercent.toFixed(1)}% CPU`);
  }
  
  private detectAnomalies(metric: TestMetrics): void {
    if (!this.currentRun || this.currentRun.metrics.length < this.anomalyDetection.windowSize) {
      return;
    }
    
    const recentMetrics = this.currentRun.metrics.slice(-this.anomalyDetection.windowSize);
    
    const metricsToCheck = [
      { name: 'p99LatencyMs', value: metric.p99LatencyMs },
      { name: 'errorRate', value: metric.errorRate },
      { name: 'heapUsedMb', value: metric.heapUsedMb },
      { name: 'rps', value: metric.rps },
    ];
    
    metricsToCheck.forEach(({ name, value }) => {
      const values = recentMetrics.map(m => (m as any)[name] as number);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
      
      if (std > 0) {
        const zScore = Math.abs((value - mean) / std);
        
        if (zScore > this.anomalyDetection.zScoreThreshold) {
          this.anomalyDetection.anomalies.push({
            timestamp: new Date(),
            metric: name,
            value,
            zScore,
            expected: mean,
            deviation: value - mean,
          });
          
          console.log(`[SoakTest] ⚠️ ANOMALY: ${name} = ${value.toFixed(2)} (z-score: ${zScore.toFixed(2)}, expected: ${mean.toFixed(2)})`);
        }
      }
    });
  }
  
  private checkSLAViolations(metric: TestMetrics): void {
    if (!this.currentRun || !this.currentRun.scenario.slaTargets) return;
    
    const sla = this.currentRun.scenario.slaTargets;
    const violations: string[] = [];
    
    if (metric.p99LatencyMs > sla.maxP99LatencyMs) {
      violations.push(`P99 latency ${metric.p99LatencyMs.toFixed(2)}ms > ${sla.maxP99LatencyMs}ms`);
    }
    
    const successRate = metric.successfulRequests / Math.max(metric.requests, 1);
    if (successRate < sla.minSuccessRate) {
      violations.push(`Success rate ${(successRate * 100).toFixed(2)}% < ${(sla.minSuccessRate * 100).toFixed(2)}%`);
    }
    
    if (metric.skipRatio < sla.minSkipRatio) {
      violations.push(`Skip ratio ${(metric.skipRatio * 100).toFixed(2)}% < ${(sla.minSkipRatio * 100).toFixed(2)}%`);
    }
    
    if (metric.errorRate > sla.maxErrorRate) {
      violations.push(`Error rate ${(metric.errorRate * 100).toFixed(2)}% > ${(sla.maxErrorRate * 100).toFixed(2)}%`);
    }
    
    violations.forEach(v => {
      this.currentRun!.alerts.push(`Minute ${metric.minuteOffset}: SLA VIOLATION - ${v}`);
    });
  }
  
  private checkForIssues(metric: TestMetrics): void {
    if (!this.currentRun) return;
    
    // Critical error rate
    if (metric.errorRate > 0.20) {
      this.currentRun.issues.push(`Critical: Error rate exceeded 20% at minute ${metric.minuteOffset}`);
    }
    
    // Memory growth detection
    if (this.currentRun.metrics.length > 10) {
      const firstMetric = this.currentRun.metrics[0];
      const memoryGrowth = metric.heapUsedMb - firstMetric.heapUsedMb;
      const growthPercent = (memoryGrowth / firstMetric.heapUsedMb) * 100;
      
      const slaMax = this.currentRun.scenario.slaTargets?.maxMemoryGrowthPercent || 100;
      if (growthPercent > slaMax) {
        this.currentRun.issues.push(`Critical: Memory growth ${growthPercent.toFixed(1)}% exceeds SLA ${slaMax}% at minute ${metric.minuteOffset}`);
      }
    }
  }
  
  private startLoadGeneration(scenario: TestScenario): void {
    const baseUrl = 'http://localhost:5000';
    const baseRequestsPerWorker = Math.ceil(scenario.requestsPerSecond / scenario.concurrentUsers);
    
    const workersToStart = scenario.concurrentUsers;
    const rampUpInterval = (scenario.rampUpSeconds * 1000) / workersToStart;
    
    let workersStarted = 0;
    
    const startWorker = () => {
      if (!this.isRunning || workersStarted >= workersToStart) return;
      
      const abortController = new AbortController();
      this.activeWorkers.push(abortController);
      
      this.runWorker(baseUrl, scenario.endpoints, baseRequestsPerWorker, abortController.signal);
      workersStarted++;
      
      if (workersStarted < workersToStart) {
        setTimeout(startWorker, rampUpInterval);
      }
    };
    
    startWorker();
  }
  
  private async runWorker(
    baseUrl: string,
    endpoints: string[],
    baseRequestsPerSecond: number,
    signal: AbortSignal
  ): Promise<void> {
    while (!signal.aborted && this.isRunning) {
      const effectiveRps = baseRequestsPerSecond * this.currentLoadMultiplier;
      const delayMs = Math.max(1000 / effectiveRps, 10);
      
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const url = `${baseUrl}${endpoint}`;
      
      const start = Date.now();
      try {
        const response = await fetch(url, {
          signal,
          headers: {
            'User-Agent': 'enterprise-soak-test/2.0',
            'X-Internal-Request': 'true',
            'X-Soak-Test': 'true',
          },
        });
        
        const latency = Date.now() - start;
        this.currentMinuteMetrics.requests++;
        this.currentMinuteMetrics.latencies.push(latency);
        
        if (response.ok) {
          this.currentMinuteMetrics.successful++;
          
          const setCookie = response.headers.get('set-cookie');
          if (setCookie && setCookie.includes('connect.sid')) {
            this.currentMinuteMetrics.sessionsCreated++;
          } else {
            this.currentMinuteMetrics.sessionsSkipped++;
          }
        } else {
          this.currentMinuteMetrics.failed++;
        }
      } catch (error) {
        if (!signal.aborted) {
          this.currentMinuteMetrics.failed++;
          this.currentMinuteMetrics.requests++;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  private completeTest(): void {
    if (!this.currentRun) return;
    
    // Collect final metrics
    this.collectMinuteMetrics();
    
    // Calculate summary
    this.currentRun.summary = this.calculateSummary();
    
    // Perform regression analysis if baseline exists
    if (this.currentRun.baselineId) {
      this.currentRun.regressionReport = this.analyzeRegressions();
    }
    
    this.currentRun.status = this.currentRun.issues.length > 0 ? 'failed' : 'completed';
    this.currentRun.endedAt = new Date();
    
    // Stop everything
    this.stopTest();
    
    // Save to history
    this.runHistory.push(this.currentRun);
    if (this.runHistory.length > this.maxHistory) {
      this.runHistory.shift();
    }
    
    const statusEmoji = this.currentRun.status === 'completed' ? '✅' : '❌';
    console.log(`[SoakTest] ${statusEmoji} Test ${this.currentRun.status}: ` +
      `${this.currentRun.summary!.totalRequests} requests, ` +
      `${(this.currentRun.summary!.successRate * 100).toFixed(2)}% success, ` +
      `${this.currentRun.alerts.length} alerts, ` +
      `${this.currentRun.issues.length} issues`);
    
    if (this.currentRun.regressionReport) {
      console.log(`[SoakTest] Regression Report: ${this.currentRun.regressionReport.overallStatus.toUpperCase()} - ` +
        `${this.currentRun.regressionReport.totalRegressions} regressions ` +
        `(${this.currentRun.regressionReport.criticalCount} critical)`);
    }
  }
  
  // ============================================================================
  // Regression Analysis
  // ============================================================================
  
  private analyzeRegressions(): RegressionReport | null {
    if (!this.currentRun || !this.currentRun.summary || !this.currentRun.baselineId) {
      return null;
    }
    
    const baseline = this.baselines.get(this.currentRun.baselineId);
    if (!baseline) return null;
    
    const regressions: Regression[] = [];
    const summary = this.currentRun.summary;
    
    // Latency regressions
    const latencyMetrics = [
      { name: 'avgLatencyMs', baseline: baseline.metrics.avgLatencyMs, current: summary.avgLatencyMs },
      { name: 'p50LatencyMs', baseline: baseline.metrics.p50LatencyMs, current: summary.p50LatencyMs },
      { name: 'p95LatencyMs', baseline: baseline.metrics.p95LatencyMs, current: summary.p95LatencyMs },
      { name: 'p99LatencyMs', baseline: baseline.metrics.p99LatencyMs, current: summary.p99LatencyMs },
    ];
    
    latencyMetrics.forEach(({ name, baseline: baselineValue, current }) => {
      if (baselineValue > 0) {
        const deviation = ((current - baselineValue) / baselineValue) * 100;
        if (deviation > baseline.tolerances.latencyPercent) {
          regressions.push(this.createRegression(
            'latency',
            name,
            baselineValue,
            current,
            deviation,
            baseline.tolerances.latencyPercent
          ));
        }
      }
    });
    
    // Throughput regression
    const avgRps = this.currentRun.metrics.length > 0
      ? this.currentRun.metrics.reduce((sum, m) => sum + m.rps, 0) / this.currentRun.metrics.length
      : 0;
    
    if (baseline.metrics.rps > 0) {
      const rpsDeviation = ((baseline.metrics.rps - avgRps) / baseline.metrics.rps) * 100;
      if (rpsDeviation > baseline.tolerances.throughputPercent) {
        regressions.push(this.createRegression(
          'throughput',
          'rps',
          baseline.metrics.rps,
          avgRps,
          -rpsDeviation,
          baseline.tolerances.throughputPercent
        ));
      }
    }
    
    // Success rate regression
    const successDeviation = (baseline.metrics.successRate - summary.successRate) * 100;
    if (successDeviation > 1) {
      regressions.push(this.createRegression(
        'error_rate',
        'successRate',
        baseline.metrics.successRate,
        summary.successRate,
        -successDeviation,
        1
      ));
    }
    
    // Memory regression
    if (baseline.metrics.heapUsedMb > 0) {
      const memDeviation = ((summary.peakMemoryMb - baseline.metrics.heapUsedMb) / baseline.metrics.heapUsedMb) * 100;
      if (memDeviation > baseline.tolerances.memoryPercent) {
        regressions.push(this.createRegression(
          'memory',
          'peakMemoryMb',
          baseline.metrics.heapUsedMb,
          summary.peakMemoryMb,
          memDeviation,
          baseline.tolerances.memoryPercent
        ));
      }
    }
    
    // Session skip ratio regression
    const skipDeviation = (baseline.metrics.skipRatio - summary.sessionSkipRatio) * 100;
    if (skipDeviation > 10) {
      regressions.push(this.createRegression(
        'session',
        'skipRatio',
        baseline.metrics.skipRatio,
        summary.sessionSkipRatio,
        -skipDeviation,
        10
      ));
    }
    
    const criticalCount = regressions.filter(r => r.severity === 'critical').length;
    const warningCount = regressions.filter(r => r.severity === 'warning').length;
    
    let overallStatus: 'pass' | 'warning' | 'fail' = 'pass';
    if (criticalCount > 0) {
      overallStatus = 'fail';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    }
    
    return {
      runId: this.currentRun.runId,
      baselineId: baseline.id,
      analyzedAt: new Date(),
      totalRegressions: regressions.length,
      criticalCount,
      warningCount,
      infoCount: regressions.filter(r => r.severity === 'info').length,
      regressions,
      overallStatus,
      summary: regressions.length === 0
        ? 'No regressions detected. Performance is within acceptable tolerances.'
        : `Detected ${regressions.length} regression(s): ${criticalCount} critical, ${warningCount} warning`,
    };
  }
  
  private createRegression(
    type: Regression['type'],
    metricName: string,
    baselineValue: number,
    currentValue: number,
    deviationPercent: number,
    tolerancePercent: number
  ): Regression {
    const absDeviation = Math.abs(deviationPercent);
    let severity: RegressionSeverity = 'info';
    
    if (absDeviation > tolerancePercent * 2) {
      severity = 'critical';
    } else if (absDeviation > tolerancePercent) {
      severity = 'warning';
    }
    
    const possibleCauses = this.getPossibleCauses(type, deviationPercent);
    const recommendations = this.getRecommendations(type, severity);
    
    return {
      id: `reg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      type,
      severity,
      metricName,
      baselineValue,
      currentValue,
      deviationPercent,
      tolerancePercent,
      description: `${metricName} regressed by ${Math.abs(deviationPercent).toFixed(2)}% ` +
        `(baseline: ${baselineValue.toFixed(2)}, current: ${currentValue.toFixed(2)})`,
      possibleCauses,
      recommendations,
      status: 'open',
    };
  }
  
  private getPossibleCauses(type: Regression['type'], deviation: number): string[] {
    const causes: Record<string, string[]> = {
      latency: [
        'Increased database query time',
        'Network congestion or packet loss',
        'Garbage collection pressure',
        'Cache miss rate increase',
        'Third-party service degradation',
      ],
      throughput: [
        'Resource exhaustion (CPU/Memory)',
        'Connection pool saturation',
        'Rate limiting activation',
        'Increased request complexity',
      ],
      memory: [
        'Memory leak in application code',
        'Cache growth without eviction',
        'Large object allocation',
        'Unclosed resources or connections',
      ],
      session: [
        'Session store performance degradation',
        'Increased session creation rate',
        'Session middleware overhead',
        'Cookie parsing inefficiency',
      ],
      error_rate: [
        'Backend service unavailability',
        'Database connection failures',
        'Resource exhaustion',
        'Configuration errors',
      ],
    };
    
    return causes[type] || ['Unknown cause'];
  }
  
  private getRecommendations(type: Regression['type'], severity: RegressionSeverity): string[] {
    const recs: string[] = [];
    
    if (severity === 'critical') {
      recs.push('Immediate investigation required');
      recs.push('Consider rollback if recently deployed');
    }
    
    const typeRecs: Record<string, string[]> = {
      latency: [
        'Review recent code changes affecting request handling',
        'Check database query performance',
        'Verify cache hit rates',
      ],
      throughput: [
        'Scale resources if needed',
        'Optimize critical paths',
        'Review connection pool settings',
      ],
      memory: [
        'Profile memory usage with heap snapshots',
        'Review object lifecycle management',
        'Check for resource leaks',
      ],
      session: [
        'Review session middleware configuration',
        'Check session store health',
        'Optimize session serialization',
      ],
      error_rate: [
        'Check service dependencies',
        'Review error logs for root cause',
        'Verify external service health',
      ],
    };
    
    recs.push(...(typeRecs[type] || []));
    return recs;
  }
  
  // ============================================================================
  // Summary Calculation
  // ============================================================================
  
  private calculateSummary(): TestSummary {
    const metrics = this.currentRun!.metrics;
    
    const totalRequests = metrics.reduce((sum, m) => sum + m.requests, 0);
    const successfulRequests = metrics.reduce((sum, m) => sum + m.successfulRequests, 0);
    const failedRequests = metrics.reduce((sum, m) => sum + m.failedRequests, 0);
    const sessionsCreated = metrics.reduce((sum, m) => sum + m.sessionsCreated, 0);
    const sessionsSkipped = metrics.reduce((sum, m) => sum + m.sessionsSkipped, 0);
    
    const avgLatencies = metrics.map(m => m.avgLatencyMs).filter(l => l > 0);
    const p99Latencies = metrics.map(m => m.p99LatencyMs).filter(l => l > 0);
    const heapValues = metrics.map(m => m.heapUsedMb);
    
    const startMemory = heapValues[0] || 0;
    const endMemory = heapValues[heapValues.length - 1] || 0;
    const peakMemory = Math.max(...heapValues);
    
    const memoryGrowthRate = this.calculateMemoryGrowthRate(heapValues);
    const memoryGrowthPercent = startMemory > 0 ? ((endMemory - startMemory) / startMemory) * 100 : 0;
    
    const slaViolations: string[] = [];
    if (this.currentRun?.scenario.slaTargets) {
      const sla = this.currentRun.scenario.slaTargets;
      const avgP99 = p99Latencies.length > 0 ? p99Latencies.reduce((a, b) => a + b, 0) / p99Latencies.length : 0;
      
      if (avgP99 > sla.maxP99LatencyMs) {
        slaViolations.push(`P99 latency: ${avgP99.toFixed(2)}ms > ${sla.maxP99LatencyMs}ms`);
      }
      
      const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
      if (successRate < sla.minSuccessRate) {
        slaViolations.push(`Success rate: ${(successRate * 100).toFixed(2)}% < ${(sla.minSuccessRate * 100).toFixed(2)}%`);
      }
      
      if (memoryGrowthPercent > sla.maxMemoryGrowthPercent) {
        slaViolations.push(`Memory growth: ${memoryGrowthPercent.toFixed(2)}% > ${sla.maxMemoryGrowthPercent}%`);
      }
    }
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
      sessionsCreated,
      sessionsSkipped,
      sessionSkipRatio: (sessionsCreated + sessionsSkipped) > 0
        ? sessionsSkipped / (sessionsCreated + sessionsSkipped)
        : 1,
      avgLatencyMs: avgLatencies.length > 0 ? avgLatencies.reduce((a, b) => a + b, 0) / avgLatencies.length : 0,
      p50LatencyMs: this.percentile(metrics.map(m => m.p50LatencyMs).sort((a, b) => a - b), 50),
      p95LatencyMs: this.percentile(metrics.map(m => m.p95LatencyMs).sort((a, b) => a - b), 95),
      p99LatencyMs: this.percentile(p99Latencies.sort((a, b) => a - b), 99),
      maxLatencyMs: Math.max(...p99Latencies, 0),
      startMemoryMb: startMemory,
      endMemoryMb: endMemory,
      peakMemoryMb: peakMemory,
      memoryLeakDetected: memoryGrowthRate > 0.5,
      memoryGrowthRate,
      memoryGrowthPercent,
      alertsTriggered: this.currentRun!.alerts.length,
      criticalIssues: this.currentRun!.issues.length,
      slaViolations,
      regressions: this.currentRun!.regressionReport?.regressions || [],
    };
  }
  
  private calculateMemoryGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }
  
  // ============================================================================
  // Control
  // ============================================================================
  
  stopTest(): void {
    this.isRunning = false;
    
    this.activeWorkers.forEach(controller => controller.abort());
    this.activeWorkers = [];
    
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    
    if (this.spikeTimer) {
      clearInterval(this.spikeTimer);
      this.spikeTimer = null;
    }
    
    if (this.currentRun && !this.currentRun.endedAt) {
      this.currentRun.status = 'cancelled';
      this.currentRun.endedAt = new Date();
    }
  }
  
  // ============================================================================
  // Status & History
  // ============================================================================
  
  getStatus(): {
    isRunning: boolean;
    currentRun: TestRun | null;
    availableScenarios: Array<{ name: string; type: TestType; description: string }>;
    activeBaselines: number;
    anomaliesDetected: number;
  } {
    return {
      isRunning: this.isRunning,
      currentRun: this.currentRun,
      availableScenarios: Object.entries(DEFAULT_SCENARIOS).map(([key, scenario]) => ({
        name: key,
        type: scenario.type,
        description: scenario.description,
      })),
      activeBaselines: Array.from(this.baselines.values()).filter(b => b.isActive).length,
      anomaliesDetected: this.anomalyDetection.anomalies.length,
    };
  }
  
  getRun(runId: string): TestRun | undefined {
    if (this.currentRun?.runId === runId) {
      return this.currentRun;
    }
    return this.runHistory.find(r => r.runId === runId);
  }
  
  getHistory(limit = 10): TestRun[] {
    return this.runHistory.slice(-limit);
  }
  
  getAnomalies(): AnomalyDetection['anomalies'] {
    return this.anomalyDetection.anomalies;
  }
  
  // ============================================================================
  // Helpers
  // ============================================================================
  
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.floor((p / 100) * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)];
  }
  
  private createEmptyMinuteMetrics() {
    return {
      requests: 0,
      successful: 0,
      failed: 0,
      latencies: [],
      sessionsCreated: 0,
      sessionsSkipped: 0,
    };
  }
}

// Export singleton
export const enterpriseSoakTest = EnterpriseSoakTestOrchestrator.getInstance();
