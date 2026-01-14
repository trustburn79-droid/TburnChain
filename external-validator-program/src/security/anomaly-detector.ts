/**
 * TBURN Anomaly Detector
 * Real-time detection of suspicious signing patterns and behavior
 */

export interface AnomalyConfig {
  maxSigningsPerMinute: number;
  maxFailuresPerMinute: number;
  maxLatencyMs: number;
  minLatencyMs: number;
  suspiciousPatternThreshold: number;
  alertCallback?: (alert: AnomalyAlert) => void;
}

export interface AnomalyAlert {
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  validatorAddress: string;
  message: string;
  timestamp: number;
  details: Record<string, unknown>;
}

export type AnomalyType = 
  | 'HIGH_FREQUENCY'
  | 'UNUSUAL_TIMING'
  | 'REPEATED_FAILURES'
  | 'SUSPICIOUS_PATTERN'
  | 'LATENCY_ANOMALY'
  | 'CLOCK_DRIFT'
  | 'DOUBLE_SIGNING_ATTEMPT';

interface ValidatorMetrics {
  signings: number[];
  failures: number[];
  latencies: number[];
  lastSlots: number[];
  alerts: AnomalyAlert[];
}

export class AnomalyDetector {
  private config: AnomalyConfig;
  private metrics: Map<string, ValidatorMetrics> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<AnomalyConfig> = {}) {
    this.config = {
      maxSigningsPerMinute: config.maxSigningsPerMinute ?? 200,
      maxFailuresPerMinute: config.maxFailuresPerMinute ?? 10,
      maxLatencyMs: config.maxLatencyMs ?? 1000,
      minLatencyMs: config.minLatencyMs ?? 1,
      suspiciousPatternThreshold: config.suspiciousPatternThreshold ?? 5,
      alertCallback: config.alertCallback
    };

    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  recordSigning(validatorAddress: string, slot: number, latencyMs: number, success: boolean): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];
    const metrics = this.getMetrics(validatorAddress);
    const now = Date.now();

    metrics.signings.push(now);
    metrics.latencies.push(latencyMs);
    
    if (!success) {
      metrics.failures.push(now);
    }

    const highFreqAlert = this.checkHighFrequency(validatorAddress, metrics);
    if (highFreqAlert) alerts.push(highFreqAlert);

    const failureAlert = this.checkRepeatedFailures(validatorAddress, metrics);
    if (failureAlert) alerts.push(failureAlert);

    const latencyAlert = this.checkLatencyAnomaly(validatorAddress, latencyMs);
    if (latencyAlert) alerts.push(latencyAlert);

    const doubleSignAlert = this.checkDoubleSigningAttempt(validatorAddress, slot, metrics);
    if (doubleSignAlert) alerts.push(doubleSignAlert);

    metrics.lastSlots.push(slot);
    if (metrics.lastSlots.length > 100) {
      metrics.lastSlots = metrics.lastSlots.slice(-100);
    }

    for (const alert of alerts) {
      metrics.alerts.push(alert);
      if (this.config.alertCallback) {
        this.config.alertCallback(alert);
      }
    }

    return alerts;
  }

  private getMetrics(validatorAddress: string): ValidatorMetrics {
    let metrics = this.metrics.get(validatorAddress);
    if (!metrics) {
      metrics = {
        signings: [],
        failures: [],
        latencies: [],
        lastSlots: [],
        alerts: []
      };
      this.metrics.set(validatorAddress, metrics);
    }
    return metrics;
  }

  private checkHighFrequency(validatorAddress: string, metrics: ValidatorMetrics): AnomalyAlert | null {
    const now = Date.now();
    const lastMinute = metrics.signings.filter(t => now - t < 60000).length;

    if (lastMinute > this.config.maxSigningsPerMinute) {
      return {
        type: 'HIGH_FREQUENCY',
        severity: lastMinute > this.config.maxSigningsPerMinute * 2 ? 'high' : 'medium',
        validatorAddress,
        message: `Unusually high signing frequency: ${lastMinute} requests in last minute`,
        timestamp: now,
        details: {
          count: lastMinute,
          threshold: this.config.maxSigningsPerMinute
        }
      };
    }

    return null;
  }

  private checkRepeatedFailures(validatorAddress: string, metrics: ValidatorMetrics): AnomalyAlert | null {
    const now = Date.now();
    const lastMinute = metrics.failures.filter(t => now - t < 60000).length;

    if (lastMinute > this.config.maxFailuresPerMinute) {
      return {
        type: 'REPEATED_FAILURES',
        severity: lastMinute > this.config.maxFailuresPerMinute * 2 ? 'high' : 'medium',
        validatorAddress,
        message: `High failure rate: ${lastMinute} failures in last minute`,
        timestamp: now,
        details: {
          count: lastMinute,
          threshold: this.config.maxFailuresPerMinute
        }
      };
    }

    return null;
  }

  private checkLatencyAnomaly(validatorAddress: string, latencyMs: number): AnomalyAlert | null {
    if (latencyMs > this.config.maxLatencyMs) {
      return {
        type: 'LATENCY_ANOMALY',
        severity: latencyMs > this.config.maxLatencyMs * 2 ? 'high' : 'low',
        validatorAddress,
        message: `High latency detected: ${latencyMs}ms`,
        timestamp: Date.now(),
        details: {
          latencyMs,
          maxExpected: this.config.maxLatencyMs
        }
      };
    }

    if (latencyMs < this.config.minLatencyMs) {
      return {
        type: 'LATENCY_ANOMALY',
        severity: 'medium',
        validatorAddress,
        message: `Suspiciously low latency: ${latencyMs}ms (possible cache/replay)`,
        timestamp: Date.now(),
        details: {
          latencyMs,
          minExpected: this.config.minLatencyMs
        }
      };
    }

    return null;
  }

  private checkDoubleSigningAttempt(validatorAddress: string, slot: number, metrics: ValidatorMetrics): AnomalyAlert | null {
    const duplicates = metrics.lastSlots.filter(s => s === slot).length;

    if (duplicates >= 1) {
      return {
        type: 'DOUBLE_SIGNING_ATTEMPT',
        severity: 'critical',
        validatorAddress,
        message: `Potential double signing attempt for slot ${slot}`,
        timestamp: Date.now(),
        details: {
          slot,
          attempts: duplicates + 1
        }
      };
    }

    return null;
  }

  getAlerts(validatorAddress: string, since?: number): AnomalyAlert[] {
    const metrics = this.metrics.get(validatorAddress);
    if (!metrics) return [];

    if (since) {
      return metrics.alerts.filter(a => a.timestamp >= since);
    }

    return [...metrics.alerts];
  }

  getStats(validatorAddress: string): {
    totalSignings: number;
    totalFailures: number;
    avgLatency: number;
    alertCount: number;
  } {
    const metrics = this.metrics.get(validatorAddress);
    if (!metrics) {
      return { totalSignings: 0, totalFailures: 0, avgLatency: 0, alertCount: 0 };
    }

    const avgLatency = metrics.latencies.length > 0
      ? metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length
      : 0;

    return {
      totalSignings: metrics.signings.length,
      totalFailures: metrics.failures.length,
      avgLatency: Math.round(avgLatency * 100) / 100,
      alertCount: metrics.alerts.length
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - 3600000;

    for (const metrics of this.metrics.values()) {
      metrics.signings = metrics.signings.filter(t => t >= cutoff);
      metrics.failures = metrics.failures.filter(t => t >= cutoff);
      metrics.latencies = metrics.latencies.slice(-1000);
      metrics.alerts = metrics.alerts.filter(a => a.timestamp >= cutoff);
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.metrics.clear();
  }
}
