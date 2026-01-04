/**
 * Enterprise Soak Test Orchestrator
 * Phase 16: Production Stability Infrastructure
 * 
 * Long-running load testing infrastructure for detecting:
 * - Memory leaks
 * - Session overflow
 * - Performance degradation
 * - System instability under sustained load
 */

import { sessionMetrics } from '../monitoring/session-metrics';

type TestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
type TestType = 'session_stability' | 'memory_leak' | 'throughput' | 'failover';

interface TestScenario {
  name: string;
  type: TestType;
  endpoints: string[];
  concurrentUsers: number;
  requestsPerSecond: number;
  durationMinutes: number;
  rampUpSeconds: number;
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
  rps: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
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
  alertsTriggered: number;
  criticalIssues: number;
}

// Default scenarios
const DEFAULT_SCENARIOS: Record<string, TestScenario> = {
  session_stability: {
    name: 'Session Stability Test',
    type: 'session_stability',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
      '/api/validators/status',
      '/api/network/stats',
      '/api/shards',
      '/api/blocks',
    ],
    concurrentUsers: 50,
    requestsPerSecond: 500,
    durationMinutes: 60,
    rampUpSeconds: 60,
  },
  memory_leak: {
    name: 'Memory Leak Detection',
    type: 'memory_leak',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
      '/api/cross-shard-router/status',
    ],
    concurrentUsers: 100,
    requestsPerSecond: 1000,
    durationMinutes: 120,
    rampUpSeconds: 120,
  },
  throughput: {
    name: 'Maximum Throughput Test',
    type: 'throughput',
    endpoints: ['/api/public/v1/network/stats'],
    concurrentUsers: 200,
    requestsPerSecond: 2000,
    durationMinutes: 30,
    rampUpSeconds: 30,
  },
  quick_check: {
    name: 'Quick Health Check',
    type: 'session_stability',
    endpoints: [
      '/api/public/v1/network/stats',
      '/api/shard-cache/status',
    ],
    concurrentUsers: 10,
    requestsPerSecond: 100,
    durationMinutes: 5,
    rampUpSeconds: 10,
  },
};

export class SoakTestOrchestrator {
  private static instance: SoakTestOrchestrator;
  
  private currentRun: TestRun | null = null;
  private runHistory: TestRun[] = [];
  private readonly maxHistory = 100;
  
  // Internal state
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private activeWorkers: AbortController[] = [];
  
  // Metrics collection
  private currentMinuteMetrics: {
    requests: number;
    successful: number;
    failed: number;
    latencies: number[];
    sessionsCreated: number;
    sessionsSkipped: number;
  } = this.createEmptyMinuteMetrics();
  
  private constructor() {}
  
  static getInstance(): SoakTestOrchestrator {
    if (!SoakTestOrchestrator.instance) {
      SoakTestOrchestrator.instance = new SoakTestOrchestrator();
    }
    return SoakTestOrchestrator.instance;
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
    
    const runId = `soak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
    };
    
    this.isRunning = true;
    this.currentMinuteMetrics = this.createEmptyMinuteMetrics();
    
    console.log(`[SoakTest] Starting ${scenario.name} (${scenario.durationMinutes} minutes)`);
    
    // Start metrics collection
    this.startMetricsCollection();
    
    // Start load generation
    this.startLoadGeneration(scenario);
    
    // Schedule test completion
    const testDurationMs = scenario.durationMinutes * 60 * 1000;
    setTimeout(() => {
      if (this.currentRun?.runId === runId) {
        this.completeTest();
      }
    }, testDurationMs);
    
    return this.currentRun;
  }
  
  private startMetricsCollection(): void {
    // Collect metrics every minute
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
    
    // Calculate latency percentiles
    const sortedLatencies = [...this.currentMinuteMetrics.latencies].sort((a, b) => a - b);
    const avgLatency = sortedLatencies.length > 0
      ? sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length
      : 0;
    const p50 = this.percentile(sortedLatencies, 50);
    const p95 = this.percentile(sortedLatencies, 95);
    const p99 = this.percentile(sortedLatencies, 99);
    
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
      sessionsActive: 0, // Would need to query session store
      skipRatio: sessionTotal > 0 ? this.currentMinuteMetrics.sessionsSkipped / sessionTotal : 1,
      avgLatencyMs: avgLatency,
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      p99LatencyMs: p99,
      rps: this.currentMinuteMetrics.requests / 60,
      heapUsedMb: memory.heapUsed / 1024 / 1024,
      heapTotalMb: memory.heapTotal / 1024 / 1024,
      externalMb: memory.external / 1024 / 1024,
    };
    
    this.currentRun.metrics.push(metric);
    
    // Check for issues
    this.checkForIssues(metric);
    
    // Reset minute metrics
    this.currentMinuteMetrics = this.createEmptyMinuteMetrics();
    
    console.log(`[SoakTest] Minute ${minuteOffset}: ${metric.requests} req, ${(metric.errorRate * 100).toFixed(2)}% errors, ${metric.avgLatencyMs.toFixed(2)}ms avg latency, ${metric.heapUsedMb.toFixed(2)}MB heap`);
  }
  
  private checkForIssues(metric: TestMetrics): void {
    if (!this.currentRun) return;
    
    // High error rate
    if (metric.errorRate > 0.05) {
      this.currentRun.alerts.push(`Minute ${metric.minuteOffset}: High error rate (${(metric.errorRate * 100).toFixed(2)}%)`);
    }
    
    // Critical error rate
    if (metric.errorRate > 0.20) {
      this.currentRun.issues.push(`Critical: Error rate exceeded 20% at minute ${metric.minuteOffset}`);
    }
    
    // Low skip ratio
    if (metric.skipRatio < 0.7 && metric.sessionsCreated + metric.sessionsSkipped > 100) {
      this.currentRun.alerts.push(`Minute ${metric.minuteOffset}: Low session skip ratio (${(metric.skipRatio * 100).toFixed(2)}%)`);
    }
    
    // High latency
    if (metric.p99LatencyMs > 500) {
      this.currentRun.alerts.push(`Minute ${metric.minuteOffset}: High P99 latency (${metric.p99LatencyMs.toFixed(2)}ms)`);
    }
    
    // Memory growth detection (compare with first metric)
    if (this.currentRun.metrics.length > 10) {
      const firstMetric = this.currentRun.metrics[0];
      const memoryGrowth = metric.heapUsedMb - firstMetric.heapUsedMb;
      const growthPercent = (memoryGrowth / firstMetric.heapUsedMb) * 100;
      
      if (growthPercent > 50) {
        this.currentRun.alerts.push(`Minute ${metric.minuteOffset}: Significant memory growth (${growthPercent.toFixed(1)}%)`);
      }
      
      if (growthPercent > 100) {
        this.currentRun.issues.push(`Critical: Memory doubled since test start at minute ${metric.minuteOffset}`);
      }
    }
  }
  
  private startLoadGeneration(scenario: TestScenario): void {
    const baseUrl = `http://localhost:5000`;
    const requestsPerWorker = Math.ceil(scenario.requestsPerSecond / scenario.concurrentUsers);
    const delayBetweenRequests = 1000 / requestsPerWorker;
    
    // Ramp up workers gradually
    const workersToStart = scenario.concurrentUsers;
    const rampUpInterval = (scenario.rampUpSeconds * 1000) / workersToStart;
    
    let workersStarted = 0;
    
    const startWorker = () => {
      if (!this.isRunning || workersStarted >= workersToStart) return;
      
      const abortController = new AbortController();
      this.activeWorkers.push(abortController);
      
      this.runWorker(baseUrl, scenario.endpoints, delayBetweenRequests, abortController.signal);
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
    delayMs: number, 
    signal: AbortSignal
  ): Promise<void> {
    while (!signal.aborted && this.isRunning) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const url = `${baseUrl}${endpoint}`;
      
      const start = Date.now();
      try {
        const response = await fetch(url, {
          signal,
          headers: {
            'User-Agent': 'soak-test/1.0',
            'X-Internal-Request': 'true',
          },
        });
        
        const latency = Date.now() - start;
        this.currentMinuteMetrics.requests++;
        this.currentMinuteMetrics.latencies.push(latency);
        
        if (response.ok) {
          this.currentMinuteMetrics.successful++;
          
          // Check for session creation
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
      
      // Wait before next request
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  private completeTest(): void {
    if (!this.currentRun) return;
    
    // Collect final metrics
    this.collectMinuteMetrics();
    
    // Calculate summary
    this.currentRun.summary = this.calculateSummary();
    this.currentRun.status = this.currentRun.issues.length > 0 ? 'failed' : 'completed';
    this.currentRun.endedAt = new Date();
    
    // Stop everything
    this.stopTest();
    
    // Save to history
    this.runHistory.push(this.currentRun);
    if (this.runHistory.length > this.maxHistory) {
      this.runHistory.shift();
    }
    
    console.log(`[SoakTest] Test ${this.currentRun.status}: ${this.currentRun.summary.totalRequests} requests, ${(this.currentRun.summary.successRate * 100).toFixed(2)}% success rate`);
  }
  
  private calculateSummary(): TestSummary {
    const metrics = this.currentRun!.metrics;
    
    const totalRequests = metrics.reduce((sum, m) => sum + m.requests, 0);
    const successfulRequests = metrics.reduce((sum, m) => sum + m.successfulRequests, 0);
    const failedRequests = metrics.reduce((sum, m) => sum + m.failedRequests, 0);
    const sessionsCreated = metrics.reduce((sum, m) => sum + m.sessionsCreated, 0);
    const sessionsSkipped = metrics.reduce((sum, m) => sum + m.sessionsSkipped, 0);
    
    // Latency aggregation
    const avgLatencies = metrics.map(m => m.avgLatencyMs).filter(l => l > 0);
    const p99Latencies = metrics.map(m => m.p99LatencyMs).filter(l => l > 0);
    
    // Memory analysis
    const heapValues = metrics.map(m => m.heapUsedMb);
    const startMemory = heapValues[0] || 0;
    const endMemory = heapValues[heapValues.length - 1] || 0;
    const peakMemory = Math.max(...heapValues);
    
    // Memory leak detection (linear regression on memory growth)
    const memoryGrowthRate = this.calculateMemoryGrowthRate(heapValues);
    const memoryLeakDetected = memoryGrowthRate > 0.5; // >0.5MB per minute is suspicious
    
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
      memoryLeakDetected,
      memoryGrowthRate,
      alertsTriggered: this.currentRun!.alerts.length,
      criticalIssues: this.currentRun!.issues.length,
    };
  }
  
  private calculateMemoryGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope; // MB per minute
  }
  
  // ============================================================================
  // Control
  // ============================================================================
  
  stopTest(): void {
    this.isRunning = false;
    
    // Stop workers
    this.activeWorkers.forEach(controller => controller.abort());
    this.activeWorkers = [];
    
    // Stop interval
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
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
    availableScenarios: string[];
  } {
    return {
      isRunning: this.isRunning,
      currentRun: this.currentRun,
      availableScenarios: Object.keys(DEFAULT_SCENARIOS),
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
export const soakTestOrchestrator = SoakTestOrchestrator.getInstance();
