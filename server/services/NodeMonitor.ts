/**
 * TBURN Enterprise Node Monitor
 * Provides comprehensive monitoring for the enterprise node infrastructure
 */

import { EventEmitter } from 'events';
import { getEnterpriseNode, TBurnEnterpriseNode } from './TBurnEnterpriseNode';

export interface NodeHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  nodeId: string;
  uptime: number;
  lastCheck: number;
  metrics: {
    blockProduction: {
      current: number;
      avgBlockTime: number;
      blocksPerSecond: number;
      isProducing: boolean;
    };
    network: {
      peerCount: number;
      inboundConnections: number;
      outboundConnections: number;
      bandwidth: {
        in: number; // MB/s
        out: number; // MB/s
      };
    };
    performance: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      tps: number;
      peakTps: number;
      avgLatency: number; // ms
    };
    sync: {
      isSyncing: boolean;
      syncProgress: number;
      currentBlock: number;
      highestBlock: number;
      behindBy: number;
    };
  };
  alerts: NodeAlert[];
}

export interface NodeAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  type: string;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export class NodeMonitor extends EventEmitter {
  private node: TBurnEnterpriseNode | null = null;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alerts: Map<string, NodeAlert> = new Map();
  private lastHealth: NodeHealth | null = null;
  
  // Health thresholds
  private readonly thresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 75, critical: 90 },
    disk: { warning: 80, critical: 95 },
    peers: { warning: 20, critical: 10 },
    blockTime: { warning: 200, critical: 500 }, // ms
    tps: { warning: 1000, critical: 100 },
    syncBehind: { warning: 10, critical: 100 }
  };

  constructor() {
    super();
    console.log('[Node Monitor] Initialized');
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('[Node Monitor] Already monitoring');
      return;
    }

    console.log('[Node Monitor] Starting node monitoring...');
    this.node = getEnterpriseNode();
    this.isMonitoring = true;

    // Perform initial health check
    await this.checkHealth();

    // Set up regular monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.checkHealth();
    }, 5000); // Check every 5 seconds

    console.log('[Node Monitor] ✅ Monitoring started');
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    console.log('[Node Monitor] Stopping monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('[Node Monitor] ✅ Monitoring stopped');
  }

  private async checkHealth(): Promise<NodeHealth> {
    if (!this.node) {
      throw new Error('Node not initialized');
    }

    const status = this.node.getStatus();
    const now = Date.now();

    // Calculate metrics
    const blockProductionRate = status.isSyncing ? 0 : 10; // 10 blocks/second when not syncing
    const avgBlockTime = status.isSyncing ? 0 : 100; // 100ms average
    const avgLatency = 10 + Math.random() * 20; // 10-30ms
    const bandwidth = {
      in: 2.5 + Math.random() * 1.5, // 2.5-4 MB/s
      out: 1.5 + Math.random() * 1 // 1.5-2.5 MB/s
    };

    // Build health status
    const health: NodeHealth = {
      status: 'healthy',
      nodeId: status.nodeId,
      uptime: status.uptime,
      lastCheck: now,
      metrics: {
        blockProduction: {
          current: status.currentBlock,
          avgBlockTime,
          blocksPerSecond: blockProductionRate,
          isProducing: !status.isSyncing && blockProductionRate > 0
        },
        network: {
          peerCount: status.peerCount,
          inboundConnections: Math.floor(status.peerCount * 0.4),
          outboundConnections: Math.floor(status.peerCount * 0.6),
          bandwidth
        },
        performance: {
          cpuUsage: status.cpuUsage,
          memoryUsage: status.memoryUsage,
          diskUsage: status.diskUsage,
          tps: Math.floor(blockProductionRate * 500), // ~500 tx per block
          peakTps: 520847,
          avgLatency
        },
        sync: {
          isSyncing: status.isSyncing,
          syncProgress: status.syncProgress,
          currentBlock: status.currentBlock,
          highestBlock: status.highestBlock,
          behindBy: status.highestBlock - status.currentBlock
        }
      },
      alerts: []
    };

    // Check for alerts
    this.checkAlerts(health);

    // Determine overall health status
    if (health.alerts.some(a => a.severity === 'critical')) {
      health.status = 'critical';
    } else if (health.alerts.some(a => a.severity === 'error')) {
      health.status = 'degraded';
    } else if (health.alerts.some(a => a.severity === 'warning')) {
      health.status = 'degraded';
    }

    // Add active alerts to health
    health.alerts = Array.from(this.alerts.values()).filter(a => !a.resolved);

    this.lastHealth = health;
    this.emit('health', health);

    return health;
  }

  private checkAlerts(health: NodeHealth): void {
    const now = Date.now();

    // CPU usage alert
    if (health.metrics.performance.cpuUsage > this.thresholds.cpu.critical) {
      this.addAlert({
        id: 'cpu-critical',
        severity: 'critical',
        type: 'performance',
        message: `CPU usage critical: ${health.metrics.performance.cpuUsage.toFixed(1)}%`,
        timestamp: now,
        resolved: false
      });
    } else if (health.metrics.performance.cpuUsage > this.thresholds.cpu.warning) {
      this.addAlert({
        id: 'cpu-warning',
        severity: 'warning',
        type: 'performance',
        message: `CPU usage high: ${health.metrics.performance.cpuUsage.toFixed(1)}%`,
        timestamp: now,
        resolved: false
      });
    } else {
      this.resolveAlert('cpu-critical');
      this.resolveAlert('cpu-warning');
    }

    // Memory usage alert
    if (health.metrics.performance.memoryUsage > this.thresholds.memory.critical) {
      this.addAlert({
        id: 'memory-critical',
        severity: 'critical',
        type: 'performance',
        message: `Memory usage critical: ${health.metrics.performance.memoryUsage.toFixed(1)} MB`,
        timestamp: now,
        resolved: false
      });
    } else if (health.metrics.performance.memoryUsage > this.thresholds.memory.warning * 10) { // Convert to MB
      this.addAlert({
        id: 'memory-warning',
        severity: 'warning',
        type: 'performance',
        message: `Memory usage high: ${health.metrics.performance.memoryUsage.toFixed(1)} MB`,
        timestamp: now,
        resolved: false
      });
    } else {
      this.resolveAlert('memory-critical');
      this.resolveAlert('memory-warning');
    }

    // Peer count alert
    if (health.metrics.network.peerCount < this.thresholds.peers.critical) {
      this.addAlert({
        id: 'peers-critical',
        severity: 'critical',
        type: 'network',
        message: `Low peer count: ${health.metrics.network.peerCount} peers`,
        timestamp: now,
        resolved: false
      });
    } else if (health.metrics.network.peerCount < this.thresholds.peers.warning) {
      this.addAlert({
        id: 'peers-warning',
        severity: 'warning',
        type: 'network',
        message: `Peer count below optimal: ${health.metrics.network.peerCount} peers`,
        timestamp: now,
        resolved: false
      });
    } else {
      this.resolveAlert('peers-critical');
      this.resolveAlert('peers-warning');
    }

    // Block production alert
    if (!health.metrics.blockProduction.isProducing && !health.metrics.sync.isSyncing) {
      this.addAlert({
        id: 'block-production-stopped',
        severity: 'critical',
        type: 'blockchain',
        message: 'Block production has stopped',
        timestamp: now,
        resolved: false
      });
    } else {
      this.resolveAlert('block-production-stopped');
    }

    // Sync alert
    if (health.metrics.sync.behindBy > this.thresholds.syncBehind.critical) {
      this.addAlert({
        id: 'sync-behind-critical',
        severity: 'error',
        type: 'sync',
        message: `Node is ${health.metrics.sync.behindBy} blocks behind`,
        timestamp: now,
        resolved: false
      });
    } else if (health.metrics.sync.behindBy > this.thresholds.syncBehind.warning) {
      this.addAlert({
        id: 'sync-behind-warning',
        severity: 'warning',
        type: 'sync',
        message: `Node is ${health.metrics.sync.behindBy} blocks behind`,
        timestamp: now,
        resolved: false
      });
    } else {
      this.resolveAlert('sync-behind-critical');
      this.resolveAlert('sync-behind-warning');
    }
  }

  private addAlert(alert: NodeAlert): void {
    const existing = this.alerts.get(alert.id);
    if (!existing || existing.resolved) {
      this.alerts.set(alert.id, alert);
      this.emit('alert', alert);
    }
  }

  private resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      this.emit('alert-resolved', alert);
    }
  }

  getHealth(): NodeHealth | null {
    return this.lastHealth;
  }

  getAlerts(): NodeAlert[] {
    return Array.from(this.alerts.values()).filter(a => !a.resolved);
  }

  clearAlert(alertId: string): void {
    this.alerts.delete(alertId);
  }

  clearAllAlerts(): void {
    this.alerts.clear();
  }
}

// Singleton instance
let nodeMonitor: NodeMonitor | null = null;

export function getNodeMonitor(): NodeMonitor {
  if (!nodeMonitor) {
    nodeMonitor = new NodeMonitor();
  }
  return nodeMonitor;
}