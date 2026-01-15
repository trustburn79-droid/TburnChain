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
export type AnomalyType = 'HIGH_FREQUENCY' | 'UNUSUAL_TIMING' | 'REPEATED_FAILURES' | 'SUSPICIOUS_PATTERN' | 'LATENCY_ANOMALY' | 'CLOCK_DRIFT' | 'DOUBLE_SIGNING_ATTEMPT';
export declare class AnomalyDetector {
    private config;
    private metrics;
    private cleanupInterval;
    constructor(config?: Partial<AnomalyConfig>);
    recordSigning(validatorAddress: string, slot: number, latencyMs: number, success: boolean): AnomalyAlert[];
    private getMetrics;
    private checkHighFrequency;
    private checkRepeatedFailures;
    private checkLatencyAnomaly;
    private checkDoubleSigningAttempt;
    getAlerts(validatorAddress: string, since?: number): AnomalyAlert[];
    getStats(validatorAddress: string): {
        totalSignings: number;
        totalFailures: number;
        avgLatency: number;
        alertCount: number;
    };
    private cleanup;
    destroy(): void;
}
//# sourceMappingURL=anomaly-detector.d.ts.map