import { WebSocket, WebSocketServer } from 'ws';
import { db } from './db';
import { 
  websocketSessions, 
  websocketSubscriptions, 
  websocketMessageMetrics,
  websocketReconnectTokens 
} from '@shared/schema';
import { eq, and, lt, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';

interface ClientSession {
  ws: WebSocket;
  sessionId: string;
  apiKeyId?: string;
  clientIp: string;
  userAgent?: string;
  connectionType: 'anonymous' | 'authenticated' | 'admin';
  qosTier: 'standard' | 'premium' | 'enterprise';
  connectedAt: Date;
  lastPingAt?: Date;
  messagesSent: number;
  messagesReceived: number;
  bytesIn: number;
  bytesOut: number;
  subscriptions: Map<string, SubscriptionInfo>;
  rateLimitTokens: number;
  rateLimitLastReset: number;
}

interface SubscriptionInfo {
  subscriptionId: string;
  method: string;
  channel: string;
  filters?: Record<string, any>;
  messageCount: number;
  droppedCount: number;
  lastMessageAt?: Date;
  backpressureLevel: number;
}

interface BroadcastMetrics {
  channel: string;
  messageCount: number;
  bytesTotal: number;
  latencies: number[];
  droppedCount: number;
  subscriberCount: number;
  fanoutTimeMs: number;
}

export class WebSocketOrchestrator {
  private sessions: Map<string, ClientSession> = new Map();
  private wsBySession: Map<string, WebSocket> = new Map();
  private sessionByWs: WeakMap<WebSocket, string> = new WeakMap();
  private channelSubscribers: Map<string, Set<string>> = new Map();
  private metricsBuffer: Map<string, BroadcastMetrics> = new Map();
  private metricsFlushInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private pingInterval?: NodeJS.Timeout;
  private sequenceNumbers: Map<string, number> = new Map();
  
  private readonly RATE_LIMIT_TOKENS_PER_MINUTE = 120;
  private readonly RATE_LIMIT_REFILL_INTERVAL = 60000;
  private readonly SESSION_TIMEOUT_MS = 300000;
  private readonly PING_INTERVAL_MS = 30000;
  private readonly METRICS_FLUSH_INTERVAL_MS = 60000;
  private readonly MAX_BACKPRESSURE = 100;
  private readonly RESUME_TOKEN_TTL_MS = 300000;

  constructor() {
    this.initializeChannels();
  }

  private initializeChannels() {
    const channels = [
      'newHeads', 'logs', 'newPendingTransactions', 'syncing',
      'consensus', 'validators', 'shards', 'burn-events',
      'tburn_shards', 'tburn_validators', 'tburn_consensus', 'tburn_burn'
    ];
    channels.forEach(ch => this.channelSubscribers.set(ch, new Set()));
  }

  async start() {
    this.metricsFlushInterval = setInterval(() => this.flushMetrics(), this.METRICS_FLUSH_INTERVAL_MS);
    this.cleanupInterval = setInterval(() => this.cleanupStaleSessions(), this.SESSION_TIMEOUT_MS);
    this.pingInterval = setInterval(() => this.pingClients(), this.PING_INTERVAL_MS);
    
    await this.markStaleSessionsOffline();
    console.log('[WebSocketOrchestrator] ✅ Started with enterprise features');
  }

  async stop() {
    if (this.metricsFlushInterval) clearInterval(this.metricsFlushInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.pingInterval) clearInterval(this.pingInterval);
    
    await this.flushMetrics();
    console.log('[WebSocketOrchestrator] ⏹️ Stopped');
  }

  async registerConnection(ws: WebSocket, clientIp: string, userAgent?: string, apiKeyId?: string): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const session: ClientSession = {
      ws,
      sessionId,
      apiKeyId,
      clientIp,
      userAgent,
      connectionType: apiKeyId ? 'authenticated' : 'anonymous',
      qosTier: this.determineQosTier(apiKeyId),
      connectedAt: new Date(),
      messagesSent: 0,
      messagesReceived: 0,
      bytesIn: 0,
      bytesOut: 0,
      subscriptions: new Map(),
      rateLimitTokens: this.RATE_LIMIT_TOKENS_PER_MINUTE,
      rateLimitLastReset: Date.now(),
    };

    this.sessions.set(sessionId, session);
    this.wsBySession.set(sessionId, ws);
    this.sessionByWs.set(ws, sessionId);

    try {
      await db.insert(websocketSessions).values({
        sessionId,
        apiKeyId,
        clientIp,
        userAgent,
        connectionType: session.connectionType,
        qosTier: session.qosTier,
        status: 'active',
      });
    } catch (error) {
      console.error('[WebSocketOrchestrator] Failed to persist session:', error);
    }

    console.log(`[WebSocketOrchestrator] 🔗 Session ${sessionId.slice(0, 8)}... connected (${session.qosTier})`);
    return sessionId;
  }

  async unregisterConnection(ws: WebSocket, reason?: string) {
    const sessionId = this.sessionByWs.get(ws);
    if (!sessionId) return;

    const session = this.sessions.get(sessionId);
    if (session) {
      const subscriptionEntries = Array.from(session.subscriptions.entries());
      for (const [subId, sub] of subscriptionEntries) {
        this.removeFromChannel(sub.channel, sessionId);
        await this.persistSubscriptionCancel(subId);
      }

      const resumeToken = await this.createResumeToken(session);

      try {
        await db.update(websocketSessions)
          .set({
            status: 'disconnected',
            disconnectedAt: new Date(),
            disconnectReason: reason,
            messagesSent: session.messagesSent,
            messagesReceived: session.messagesReceived,
            bytesIn: session.bytesIn,
            bytesOut: session.bytesOut,
          })
          .where(eq(websocketSessions.sessionId, sessionId));
      } catch (error) {
        console.error('[WebSocketOrchestrator] Failed to update session on disconnect:', error);
      }

      console.log(`[WebSocketOrchestrator] ⛓️ Session ${sessionId.slice(0, 8)}... disconnected (${reason || 'unknown'})`);
      if (resumeToken) {
        console.log(`[WebSocketOrchestrator] 🔑 Resume token generated: ${resumeToken.slice(0, 8)}...`);
      }
    }

    this.sessions.delete(sessionId);
    this.wsBySession.delete(sessionId);
    this.sessionByWs.delete(ws);
  }

  async handleSubscribe(ws: WebSocket, method: string, channel: string, filters?: Record<string, any>): Promise<string | null> {
    const sessionId = this.sessionByWs.get(ws);
    if (!sessionId) return null;

    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (!this.checkRateLimit(session)) {
      this.sendError(ws, -32005, 'Rate limit exceeded');
      return null;
    }

    const subscriptionId = this.generateSubscriptionId();
    
    const subInfo: SubscriptionInfo = {
      subscriptionId,
      method,
      channel,
      filters,
      messageCount: 0,
      droppedCount: 0,
      backpressureLevel: 0,
    };

    session.subscriptions.set(subscriptionId, subInfo);
    this.addToChannel(channel, sessionId);

    try {
      await db.insert(websocketSubscriptions).values({
        sessionId,
        subscriptionId,
        method,
        channel,
        filters: filters || null,
        status: 'active',
      });
    } catch (error) {
      console.error('[WebSocketOrchestrator] Failed to persist subscription:', error);
    }

    console.log(`[WebSocketOrchestrator] 📡 Session ${sessionId.slice(0, 8)}... subscribed to ${channel}`);
    return subscriptionId;
  }

  async handleUnsubscribe(ws: WebSocket, subscriptionId: string): Promise<boolean> {
    const sessionId = this.sessionByWs.get(ws);
    if (!sessionId) return false;

    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const sub = session.subscriptions.get(subscriptionId);
    if (!sub) return false;

    this.removeFromChannel(sub.channel, sessionId);
    session.subscriptions.delete(subscriptionId);

    await this.persistSubscriptionCancel(subscriptionId);

    console.log(`[WebSocketOrchestrator] 🔕 Session ${sessionId.slice(0, 8)}... unsubscribed from ${sub.channel}`);
    return true;
  }

  broadcast(channel: string, data: any): void {
    const startTime = Date.now();
    const subscribers = this.channelSubscribers.get(channel);
    if (!subscribers || subscribers.size === 0) return;

    const payload = JSON.stringify(data);
    const payloadBytes = Buffer.byteLength(payload);
    let sentCount = 0;
    let droppedCount = 0;
    const latencies: number[] = [];

    const subscriberIds = Array.from(subscribers);
    for (const sessionId of subscriberIds) {
      const session = this.sessions.get(sessionId);
      if (!session || session.ws.readyState !== WebSocket.OPEN) continue;

      const sub = this.findSubscriptionByChannel(session, channel);
      if (!sub) continue;

      if (sub.backpressureLevel >= this.MAX_BACKPRESSURE) {
        sub.droppedCount++;
        droppedCount++;
        continue;
      }

      const sendStart = Date.now();
      try {
        session.ws.send(payload);
        const latency = Date.now() - sendStart;
        latencies.push(latency);
        
        session.messagesSent++;
        session.bytesOut += payloadBytes;
        sub.messageCount++;
        sub.lastMessageAt = new Date();
        sentCount++;
      } catch (error) {
        sub.backpressureLevel = Math.min(sub.backpressureLevel + 10, this.MAX_BACKPRESSURE);
        droppedCount++;
      }
    }

    const fanoutTime = Date.now() - startTime;
    this.recordMetrics(channel, sentCount, payloadBytes * sentCount, latencies, droppedCount, subscribers.size, fanoutTime);
  }

  broadcastToSubscription(subscriptionId: string, data: any): void {
    const sessionEntries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of sessionEntries) {
      const sub = session.subscriptions.get(subscriptionId);
      if (!sub) continue;

      if (session.ws.readyState !== WebSocket.OPEN) continue;

      const payload = JSON.stringify({
        jsonrpc: '2.0',
        method: sub.method === 'eth_subscribe' ? 'eth_subscription' : 'tburn_subscription',
        params: {
          subscription: subscriptionId,
          result: data,
        },
      });

      try {
        session.ws.send(payload);
        session.messagesSent++;
        session.bytesOut += Buffer.byteLength(payload);
        sub.messageCount++;
        sub.lastMessageAt = new Date();
      } catch (error) {
        sub.backpressureLevel = Math.min(sub.backpressureLevel + 10, this.MAX_BACKPRESSURE);
      }

      break;
    }
  }

  broadcastJsonRpc(channel: string, result: any): void {
    const subscribers = this.channelSubscribers.get(channel);
    if (!subscribers || subscribers.size === 0) return;

    const subscriberIds = Array.from(subscribers);
    for (const sessionId of subscriberIds) {
      const session = this.sessions.get(sessionId);
      if (!session || session.ws.readyState !== WebSocket.OPEN) continue;

      const sub = this.findSubscriptionByChannel(session, channel);
      if (!sub) continue;

      const payload = JSON.stringify({
        jsonrpc: '2.0',
        method: sub.method === 'eth_subscribe' ? 'eth_subscription' : 'tburn_subscription',
        params: {
          subscription: sub.subscriptionId,
          result,
        },
      });

      try {
        session.ws.send(payload);
        session.messagesSent++;
        session.bytesOut += Buffer.byteLength(payload);
        sub.messageCount++;
        sub.lastMessageAt = new Date();
      } catch (error) {
        sub.backpressureLevel = Math.min(sub.backpressureLevel + 10, this.MAX_BACKPRESSURE);
      }
    }
  }

  async resumeSession(ws: WebSocket, resumeToken: string): Promise<boolean> {
    try {
      const tokenHash = this.hashToken(resumeToken);
      const [token] = await db.select()
        .from(websocketReconnectTokens)
        .where(and(
          eq(websocketReconnectTokens.token, tokenHash),
          eq(websocketReconnectTokens.used, false),
          sql`${websocketReconnectTokens.expiresAt} > NOW()`
        ))
        .limit(1);

      if (!token) {
        console.log('[WebSocketOrchestrator] ❌ Invalid or expired resume token');
        return false;
      }

      await db.update(websocketReconnectTokens)
        .set({ used: true, usedAt: new Date() })
        .where(eq(websocketReconnectTokens.id, token.id));

      const sessionId = await this.registerConnection(ws, 'resumed', undefined, token.apiKeyId || undefined);
      const session = this.sessions.get(sessionId);
      if (!session) return false;

      const savedSubscriptions = JSON.parse(token.subscriptionsJson);
      for (const sub of savedSubscriptions) {
        const newSubId = await this.handleSubscribe(ws, sub.method, sub.channel, sub.filters);
        if (newSubId) {
          console.log(`[WebSocketOrchestrator] ♻️ Restored subscription: ${sub.channel}`);
        }
      }

      console.log(`[WebSocketOrchestrator] ✅ Session resumed from ${token.sessionId.slice(0, 8)}...`);
      return true;
    } catch (error) {
      console.error('[WebSocketOrchestrator] Failed to resume session:', error);
      return false;
    }
  }

  getStats(): {
    activeSessions: number;
    totalSubscriptions: number;
    channelStats: Record<string, number>;
    qosTierBreakdown: Record<string, number>;
  } {
    const channelStats: Record<string, number> = {};
    const channelEntries = Array.from(this.channelSubscribers.entries());
    for (const [channel, subs] of channelEntries) {
      channelStats[channel] = subs.size;
    }

    const qosTierBreakdown: Record<string, number> = { standard: 0, premium: 0, enterprise: 0 };
    let totalSubscriptions = 0;
    
    const sessionValues = Array.from(this.sessions.values());
    for (const session of sessionValues) {
      qosTierBreakdown[session.qosTier]++;
      totalSubscriptions += session.subscriptions.size;
    }

    return {
      activeSessions: this.sessions.size,
      totalSubscriptions,
      channelStats,
      qosTierBreakdown,
    };
  }

  getSessionInfo(sessionId: string): ClientSession | undefined {
    return this.sessions.get(sessionId);
  }

  private generateSessionId(): string {
    return `ws_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateSubscriptionId(): string {
    return `0x${crypto.randomBytes(16).toString('hex')}`;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private determineQosTier(apiKeyId?: string): 'standard' | 'premium' | 'enterprise' {
    return 'standard';
  }

  private checkRateLimit(session: ClientSession): boolean {
    const now = Date.now();
    if (now - session.rateLimitLastReset >= this.RATE_LIMIT_REFILL_INTERVAL) {
      session.rateLimitTokens = this.RATE_LIMIT_TOKENS_PER_MINUTE;
      session.rateLimitLastReset = now;
    }

    if (session.rateLimitTokens <= 0) {
      return false;
    }

    session.rateLimitTokens--;
    return true;
  }

  private addToChannel(channel: string, sessionId: string) {
    let subscribers = this.channelSubscribers.get(channel);
    if (!subscribers) {
      subscribers = new Set();
      this.channelSubscribers.set(channel, subscribers);
    }
    subscribers.add(sessionId);
  }

  private removeFromChannel(channel: string, sessionId: string) {
    const subscribers = this.channelSubscribers.get(channel);
    if (subscribers) {
      subscribers.delete(sessionId);
    }
  }

  private findSubscriptionByChannel(session: ClientSession, channel: string): SubscriptionInfo | undefined {
    const subValues = Array.from(session.subscriptions.values());
    for (const sub of subValues) {
      if (sub.channel === channel) return sub;
    }
    return undefined;
  }

  private async persistSubscriptionCancel(subscriptionId: string) {
    try {
      await db.update(websocketSubscriptions)
        .set({ status: 'cancelled', cancelledAt: new Date() })
        .where(eq(websocketSubscriptions.subscriptionId, subscriptionId));
    } catch (error) {
      console.error('[WebSocketOrchestrator] Failed to cancel subscription in DB:', error);
    }
  }

  private async createResumeToken(session: ClientSession): Promise<string | null> {
    if (session.subscriptions.size === 0) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const subscriptionValues = Array.from(session.subscriptions.values());
    const subscriptions = subscriptionValues.map(s => ({
      method: s.method,
      channel: s.channel,
      filters: s.filters,
    }));

    try {
      await db.insert(websocketReconnectTokens).values({
        sessionId: session.sessionId,
        token: tokenHash,
        apiKeyId: session.apiKeyId,
        subscriptionsJson: JSON.stringify(subscriptions),
        lastSequenceNumber: 0,
        expiresAt: new Date(Date.now() + this.RESUME_TOKEN_TTL_MS),
      });
      return token;
    } catch (error) {
      console.error('[WebSocketOrchestrator] Failed to create resume token:', error);
      return null;
    }
  }

  private recordMetrics(
    channel: string,
    messageCount: number,
    bytesTotal: number,
    latencies: number[],
    droppedCount: number,
    subscriberCount: number,
    fanoutTimeMs: number
  ) {
    let metrics = this.metricsBuffer.get(channel);
    if (!metrics) {
      metrics = {
        channel,
        messageCount: 0,
        bytesTotal: 0,
        latencies: [],
        droppedCount: 0,
        subscriberCount: 0,
        fanoutTimeMs: 0,
      };
      this.metricsBuffer.set(channel, metrics);
    }

    metrics.messageCount += messageCount;
    metrics.bytesTotal += bytesTotal;
    metrics.latencies.push(...latencies);
    metrics.droppedCount += droppedCount;
    metrics.subscriberCount = subscriberCount;
    metrics.fanoutTimeMs = Math.max(metrics.fanoutTimeMs, fanoutTimeMs);
  }

  private async flushMetrics() {
    if (this.metricsBuffer.size === 0) return;

    const now = new Date();
    const intervalStart = new Date(Math.floor(now.getTime() / 60000) * 60000);

    const metricsEntries = Array.from(this.metricsBuffer.entries());
    for (const [channel, metrics] of metricsEntries) {
      if (metrics.messageCount === 0) continue;

      const sortedLatencies = metrics.latencies.sort((a: number, b: number) => a - b);
      const avgLatency = sortedLatencies.length > 0 
        ? Math.round(sortedLatencies.reduce((a: number, b: number) => a + b, 0) / sortedLatencies.length)
        : 0;
      const p95Index = Math.floor(sortedLatencies.length * 0.95);
      const p99Index = Math.floor(sortedLatencies.length * 0.99);

      try {
        await db.insert(websocketMessageMetrics).values({
          intervalStart,
          channel,
          messageCount: metrics.messageCount,
          bytesTotal: metrics.bytesTotal,
          avgLatencyMs: avgLatency,
          p95LatencyMs: sortedLatencies[p95Index] || 0,
          p99LatencyMs: sortedLatencies[p99Index] || 0,
          droppedCount: metrics.droppedCount,
          subscriberCount: metrics.subscriberCount,
          fanoutTimeMs: metrics.fanoutTimeMs,
        });
      } catch (error) {
        console.error(`[WebSocketOrchestrator] Failed to flush metrics for ${channel}:`, error);
      }
    }

    this.metricsBuffer.clear();
  }

  private async markStaleSessionsOffline() {
    try {
      await db.update(websocketSessions)
        .set({ status: 'disconnected', disconnectReason: 'server_restart' })
        .where(eq(websocketSessions.status, 'active'));
      console.log('[WebSocketOrchestrator] 🧹 Marked stale sessions as offline');
    } catch (error) {
      console.error('[WebSocketOrchestrator] Failed to mark stale sessions offline:', error);
    }
  }

  private async cleanupStaleSessions() {
    const now = Date.now();
    const sessionEntries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of sessionEntries) {
      if (session.lastPingAt && now - session.lastPingAt.getTime() > this.SESSION_TIMEOUT_MS) {
        console.log(`[WebSocketOrchestrator] 🧹 Cleaning up stale session: ${sessionId.slice(0, 8)}...`);
        await this.unregisterConnection(session.ws, 'timeout');
      }
    }

    try {
      await db.delete(websocketReconnectTokens)
        .where(lt(websocketReconnectTokens.expiresAt, new Date()));
    } catch (error) {
      console.error('[WebSocketOrchestrator] Failed to cleanup expired tokens:', error);
    }
  }

  private pingClients() {
    const sessionValues = Array.from(this.sessions.values());
    for (const session of sessionValues) {
      if (session.ws.readyState === WebSocket.OPEN) {
        try {
          session.ws.ping();
          session.lastPingAt = new Date();
        } catch (error) {
        }
      }
    }
  }

  private sendError(ws: WebSocket, code: number, message: string) {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      error: { code, message },
      id: null,
    });
    try {
      ws.send(payload);
    } catch (error) {
    }
  }
}

export const wsOrchestrator = new WebSocketOrchestrator();
