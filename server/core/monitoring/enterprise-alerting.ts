/**
 * Enterprise Alerting Service
 * 
 * Multi-level alerting system for 24/7 production monitoring:
 * - INFO: Logged only, no external notification
 * - WARNING: Slack/Email notification with 5-minute cooldown
 * - CRITICAL: Immediate notification with auto-recovery trigger
 * - EMERGENCY: Immediate notification + automatic restart consideration
 * 
 * Features:
 * - Webhook integration (Slack, Discord, custom endpoints)
 * - Rate limiting to prevent alert storms
 * - Alert deduplication and cooldown
 * - Escalation rules
 * - Alert history and analytics
 */

import { EventEmitter } from 'events';
import type { SystemAlert, AlertSeverity } from './enterprise-system-health';

export interface AlertChannel {
  id: string;
  name: string;
  type: 'slack' | 'discord' | 'email' | 'webhook' | 'console';
  enabled: boolean;
  config: {
    url?: string;
    email?: string;
    minSeverity: AlertSeverity;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: AlertSeverity;
  channels: string[];
  cooldownMinutes: number;
  enabled: boolean;
  lastTriggered?: Date;
}

interface AlertStats {
  totalAlerts: number;
  byLevel: Record<AlertSeverity, number>;
  byCategory: Record<string, number>;
  last24Hours: number;
  lastHour: number;
}

const SEVERITY_PRIORITY: Record<AlertSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
  emergency: 3,
};

const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
  emergency: '🔴',
};

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  info: '#2196F3',
  warning: '#FF9800',
  critical: '#F44336',
  emergency: '#9C27B0',
};

class EnterpriseAlertingService extends EventEmitter {
  private static instance: EnterpriseAlertingService;
  
  private channels: Map<string, AlertChannel> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private alertHistory: (SystemAlert & { notified: boolean; channels: string[] })[] = [];
  private cooldowns: Map<string, Date> = new Map();
  private isEnabled = true;
  
  private readonly STARTUP_GRACE_PERIOD_MS = 60000;
  private startTime = Date.now();
  
  private constructor() {
    super();
    this.initializeDefaultChannels();
    this.initializeDefaultRules();
    this.startTime = Date.now();
  }
  
  static getInstance(): EnterpriseAlertingService {
    if (!EnterpriseAlertingService.instance) {
      EnterpriseAlertingService.instance = new EnterpriseAlertingService();
    }
    return EnterpriseAlertingService.instance;
  }
  
  private initializeDefaultChannels(): void {
    this.channels.set('console', {
      id: 'console',
      name: 'Console Logger',
      type: 'console',
      enabled: true,
      config: {
        minSeverity: 'info',
      },
    });
    
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhook) {
      this.channels.set('slack', {
        id: 'slack',
        name: 'Slack Notifications',
        type: 'slack',
        enabled: true,
        config: {
          url: slackWebhook,
          minSeverity: 'warning',
        },
      });
    }
    
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      this.channels.set('discord', {
        id: 'discord',
        name: 'Discord Notifications',
        type: 'discord',
        enabled: true,
        config: {
          url: discordWebhook,
          minSeverity: 'warning',
        },
      });
    }
  }
  
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_cpu',
        name: 'High CPU Usage',
        condition: 'cpu.usagePercent > 70',
        severity: 'warning',
        channels: ['console', 'slack'],
        cooldownMinutes: 5,
        enabled: true,
      },
      {
        id: 'critical_cpu',
        name: 'Critical CPU Usage',
        condition: 'cpu.usagePercent > 85',
        severity: 'critical',
        channels: ['console', 'slack', 'discord'],
        cooldownMinutes: 2,
        enabled: true,
      },
      {
        id: 'high_memory',
        name: 'High Memory Usage',
        condition: 'memory.usagePercent > 80',
        severity: 'warning',
        channels: ['console', 'slack'],
        cooldownMinutes: 5,
        enabled: true,
      },
      {
        id: 'critical_memory',
        name: 'Critical Memory Usage',
        condition: 'memory.usagePercent > 90',
        severity: 'critical',
        channels: ['console', 'slack', 'discord'],
        cooldownMinutes: 2,
        enabled: true,
      },
      {
        id: 'session_capacity_warning',
        name: 'Session Store Warning',
        condition: 'session.memoryStoreCapacity > 60',
        severity: 'warning',
        channels: ['console'],
        cooldownMinutes: 10,
        enabled: true,
      },
      {
        id: 'session_capacity_critical',
        name: 'Session Store Critical',
        condition: 'session.memoryStoreCapacity > 80',
        severity: 'critical',
        channels: ['console', 'slack'],
        cooldownMinutes: 2,
        enabled: true,
      },
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: 'http.errorRate > 1',
        severity: 'critical',
        channels: ['console', 'slack', 'discord'],
        cooldownMinutes: 2,
        enabled: true,
      },
      {
        id: 'slow_response',
        name: 'Slow Response Time',
        condition: 'http.p95ResponseTimeMs > 500',
        severity: 'warning',
        channels: ['console', 'slack'],
        cooldownMinutes: 5,
        enabled: true,
      },
      {
        id: 'event_loop_lag',
        name: 'Event Loop Lag',
        condition: 'process.eventLoopLagMs > 100',
        severity: 'warning',
        channels: ['console'],
        cooldownMinutes: 5,
        enabled: true,
      },
    ];
    
    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }
  
  async processAlert(alert: SystemAlert): Promise<void> {
    if (!this.isEnabled) return;
    
    const elapsedSinceStart = Date.now() - this.startTime;
    if (elapsedSinceStart < this.STARTUP_GRACE_PERIOD_MS) {
      return;
    }
    
    const cooldownKey = `${alert.id}-${alert.severity}`;
    const lastTriggered = this.cooldowns.get(cooldownKey);
    const cooldownMs = this.getCooldownForSeverity(alert.severity) * 60 * 1000;
    
    if (lastTriggered && Date.now() - lastTriggered.getTime() < cooldownMs) {
      return;
    }
    
    this.cooldowns.set(cooldownKey, new Date());
    
    const notifiedChannels: string[] = [];
    
    const channelEntries = Array.from(this.channels.entries());
    for (const [channelId, channel] of channelEntries) {
      if (!channel.enabled) continue;
      const alertPriority = SEVERITY_PRIORITY[alert.severity as AlertSeverity] ?? 0;
      const channelPriority = SEVERITY_PRIORITY[channel.config.minSeverity as AlertSeverity] ?? 0;
      if (alertPriority < channelPriority) continue;
      
      try {
        await this.sendToChannel(channel, alert);
        notifiedChannels.push(channelId);
      } catch (error) {
        console.error(`[Alerting] Failed to send to channel ${channelId}:`, error);
      }
    }
    
    this.alertHistory.push({
      ...alert,
      notified: notifiedChannels.length > 0,
      channels: notifiedChannels,
    });
    
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-500);
    }
    
    this.emit('alertProcessed', { alert, channels: notifiedChannels });
  }
  
  private getCooldownForSeverity(severity: AlertSeverity): number {
    switch (severity) {
      case 'emergency': return 1;
      case 'critical': return 2;
      case 'warning': return 5;
      case 'info': return 15;
      default: return 5;
    }
  }
  
  private async sendToChannel(channel: AlertChannel, alert: SystemAlert): Promise<void> {
    switch (channel.type) {
      case 'console':
        this.sendToConsole(alert);
        break;
      case 'slack':
        await this.sendToSlack(channel, alert);
        break;
      case 'discord':
        await this.sendToDiscord(channel, alert);
        break;
      case 'webhook':
        await this.sendToWebhook(channel, alert);
        break;
    }
  }
  
  private sendToConsole(alert: SystemAlert): void {
    const emoji = SEVERITY_EMOJI[alert.severity];
    const timestamp = new Date().toISOString();
    console.log(`[Alerting] ${emoji} [${alert.severity.toUpperCase()}] ${alert.message} (${timestamp})`);
  }
  
  private async sendToSlack(channel: AlertChannel, alert: SystemAlert): Promise<void> {
    if (!channel.config.url) return;
    
    const payload = {
      attachments: [
        {
          color: SEVERITY_COLOR[alert.severity],
          title: `${SEVERITY_EMOJI[alert.severity]} ${alert.severity.toUpperCase()}: ${alert.metric}`,
          text: alert.message,
          fields: [
            { title: 'Category', value: alert.category, short: true },
            { title: 'Current Value', value: String(alert.currentValue), short: true },
            { title: 'Threshold', value: String(alert.threshold), short: true },
            { title: 'Time', value: new Date().toISOString(), short: true },
          ],
          footer: 'TBURN System Health Monitor',
        },
      ],
    };
    
    try {
      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('[Alerting] Slack notification failed:', error);
    }
  }
  
  private async sendToDiscord(channel: AlertChannel, alert: SystemAlert): Promise<void> {
    if (!channel.config.url) return;
    
    const payload = {
      embeds: [
        {
          title: `${SEVERITY_EMOJI[alert.severity]} ${alert.severity.toUpperCase()}: ${alert.metric}`,
          description: alert.message,
          color: parseInt(SEVERITY_COLOR[alert.severity].replace('#', ''), 16),
          fields: [
            { name: 'Category', value: alert.category, inline: true },
            { name: 'Current Value', value: String(alert.currentValue), inline: true },
            { name: 'Threshold', value: String(alert.threshold), inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'TBURN System Health Monitor' },
        },
      ],
    };
    
    try {
      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('[Alerting] Discord notification failed:', error);
    }
  }
  
  private async sendToWebhook(channel: AlertChannel, alert: SystemAlert): Promise<void> {
    if (!channel.config.url) return;
    
    const payload = {
      type: 'system_alert',
      severity: alert.severity,
      category: alert.category,
      metric: alert.metric,
      message: alert.message,
      currentValue: alert.currentValue,
      threshold: alert.threshold,
      timestamp: new Date().toISOString(),
      source: 'tburn-system-health',
    };
    
    try {
      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('[Alerting] Webhook notification failed:', error);
    }
  }
  
  addChannel(channel: AlertChannel): void {
    this.channels.set(channel.id, channel);
    console.log(`[Alerting] Channel added: ${channel.name}`);
  }
  
  removeChannel(channelId: string): boolean {
    const deleted = this.channels.delete(channelId);
    if (deleted) {
      console.log(`[Alerting] Channel removed: ${channelId}`);
    }
    return deleted;
  }
  
  getChannels(): AlertChannel[] {
    return Array.from(this.channels.values());
  }
  
  updateChannel(channelId: string, updates: Partial<AlertChannel>): boolean {
    const channel = this.channels.get(channelId);
    if (!channel) return false;
    
    Object.assign(channel, updates);
    return true;
  }
  
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }
  
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }
  
  getAlertHistory(limit = 100): typeof this.alertHistory {
    return this.alertHistory.slice(-limit);
  }
  
  getAlertStats(): AlertStats {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    
    const stats: AlertStats = {
      totalAlerts: this.alertHistory.length,
      byLevel: { info: 0, warning: 0, critical: 0, emergency: 0 },
      byCategory: {},
      last24Hours: 0,
      lastHour: 0,
    };
    
    for (const alert of this.alertHistory) {
      stats.byLevel[alert.severity]++;
      stats.byCategory[alert.category] = (stats.byCategory[alert.category] || 0) + 1;
      
      const alertTime = alert.timestamp.getTime();
      if (alertTime > dayAgo) stats.last24Hours++;
      if (alertTime > hourAgo) stats.lastHour++;
    }
    
    return stats;
  }
  
  enable(): void {
    this.isEnabled = true;
    console.log('[Alerting] Alerting service enabled');
  }
  
  disable(): void {
    this.isEnabled = false;
    console.log('[Alerting] Alerting service disabled');
  }
  
  isActive(): boolean {
    return this.isEnabled;
  }
  
  clearCooldowns(): void {
    this.cooldowns.clear();
    console.log('[Alerting] All cooldowns cleared');
  }
}

export const alertingService = EnterpriseAlertingService.getInstance();
