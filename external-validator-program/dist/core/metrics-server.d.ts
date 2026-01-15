/**
 * TBURN Metrics Server
 * Exposes Prometheus-compatible metrics and health endpoints
 */
import { EventEmitter } from 'events';
export interface MetricsServerConfig {
    port: number;
    validatorAddress: string;
}
export declare class MetricsServer extends EventEmitter {
    private config;
    private server?;
    private startTime;
    private metrics;
    constructor(config: MetricsServerConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleRequest;
    private handleHealthCheck;
    private handleMetrics;
    private handleStatus;
    updateMetrics(updates: Partial<typeof this.metrics>): void;
    incrementMetric(key: keyof typeof this.metrics, value?: number): void;
}
//# sourceMappingURL=metrics-server.d.ts.map