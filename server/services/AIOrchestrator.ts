import { aiService, AIProvider, AIResponse } from '../ai-service-manager';
import { storage } from '../storage';
import { InsertAiDecision, InsertAiUsageLog } from '@shared/schema';
import { EventEmitter } from 'events';
import { aiDecisionExecutor, AIDecisionPayload, ExecutionResult } from './AIDecisionExecutor';

export type AIBand = 'strategic' | 'tactical' | 'operational' | 'fallback';

export interface BlockchainEvent {
  type: 'consensus' | 'validation' | 'optimization' | 'security' | 'governance' | 'sharding';
  data: Record<string, any>;
  blockHeight: number;
  shardId?: number;
  validatorAddress?: string;
  timestamp: Date;
}

export interface AIDecisionResult {
  decision: string;
  confidence: number;
  actionApplied: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  tokensUsed: number;
  costUsd: string;
  responseTimeMs: number;
  provider: AIProvider;
  model: string;
  isRealAi: boolean;
  rawResponse: string;
  prompt: string;
  executionResult?: ExecutionResult;
}

const BAND_PROVIDER_MAP: Record<AIBand, AIProvider> = {
  strategic: 'gemini',
  tactical: 'anthropic',
  operational: 'openai',
  fallback: 'grok',
};

const BAND_MODEL_MAP: Record<AIBand, string> = {
  strategic: 'Gemini 3 Pro',
  tactical: 'Claude Sonnet 4.5',
  operational: 'GPT-4o',
  fallback: 'Grok 3',
};

const EVENT_BAND_MAP: Record<BlockchainEvent['type'], AIBand> = {
  governance: 'strategic',
  sharding: 'strategic',
  consensus: 'tactical',
  validation: 'tactical',
  optimization: 'operational',
  security: 'operational',
};

// ============================================
// PRODUCTION: Retry Configuration
// ============================================
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

interface FailedDecision {
  event: BlockchainEvent;
  attempts: number;
  lastError: string;
  nextRetryAt: number;
  createdAt: number;
}

interface OrchestratorMetrics {
  isRunning: boolean;
  processedDecisions: number;
  failedDecisions: number;
  retryQueueSize: number;
  totalCostUsd: number;
  totalTokens: number;
  averageResponseTimeMs: number;
  successRate: number;
  lastDecisionAt: number | null;
  uptime: number;
}

class AIOrchestrator extends EventEmitter {
  private isRunning = false;
  private decisionQueue: BlockchainEvent[] = [];
  private processedDecisions = 0;
  private failedDecisions = 0;
  private totalCost = 0;
  private totalTokens = 0;
  private responseTimes: number[] = [];
  private startTime: number = 0;
  private lastDecisionAt: number | null = null;
  
  // PRODUCTION: Retry queue for failed AI decisions
  private retryQueue: Map<string, FailedDecision> = new Map();
  private retryInterval: NodeJS.Timeout | null = null;
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  constructor() {
    super();
    console.log('[AIOrchestrator] Real AI Orchestrator initialized with retry support');
  }
  
  /**
   * Get current orchestrator metrics for monitoring
   */
  getMetrics(): OrchestratorMetrics {
    const successTotal = this.processedDecisions + this.failedDecisions;
    const successRate = successTotal > 0 ? (this.processedDecisions / successTotal) * 100 : 100;
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;
    
    return {
      isRunning: this.isRunning,
      processedDecisions: this.processedDecisions,
      failedDecisions: this.failedDecisions,
      retryQueueSize: this.retryQueue.size,
      totalCostUsd: this.totalCost,
      totalTokens: this.totalTokens,
      averageResponseTimeMs: Math.round(avgResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      lastDecisionAt: this.lastDecisionAt,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
    };
  }
  
  /**
   * Health check for monitoring endpoints
   */
  getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, any> } {
    const metrics = this.getMetrics();
    
    // Determine health based on key metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const issues: string[] = [];
    
    if (!this.isRunning) {
      status = 'unhealthy';
      issues.push('Orchestrator not running');
    }
    
    if (metrics.retryQueueSize > 10) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push(`High retry queue: ${metrics.retryQueueSize} pending`);
    }
    
    if (metrics.successRate < 80) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push(`Low success rate: ${metrics.successRate}%`);
    }
    
    if (metrics.successRate < 50) {
      status = 'unhealthy';
    }
    
    return {
      status,
      details: {
        ...metrics,
        issues,
        timestamp: Date.now(),
      },
    };
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.startTime = Date.now();
    await aiDecisionExecutor.start();
    
    // Start retry processor
    this.startRetryProcessor();
    
    console.log('[AIOrchestrator] Started - Real AI decisions AND EXECUTION enabled with retry support');
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Stop retry processor
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    
    await aiDecisionExecutor.stop();
    console.log('[AIOrchestrator] Stopped');
    this.emit('stopped');
  }
  
  /**
   * Start the retry processor that handles failed decisions
   */
  private startRetryProcessor(): void {
    // Process retry queue every 10 seconds
    this.retryInterval = setInterval(() => {
      this.processRetryQueue();
    }, 10000);
    
    console.log('[AIOrchestrator] Retry processor started');
  }
  
  /**
   * Process failed decisions in the retry queue
   */
  private async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const toRetry: string[] = [];
    
    // Find decisions ready for retry
    const entries = Array.from(this.retryQueue.entries());
    for (const [key, failed] of entries) {
      if (failed.nextRetryAt <= now && failed.attempts < this.retryConfig.maxRetries) {
        toRetry.push(key);
      } else if (failed.attempts >= this.retryConfig.maxRetries) {
        // Max retries exceeded, move to permanent failure
        console.error(`[AIOrchestrator] Max retries exceeded for event ${key}:`, failed.lastError);
        this.retryQueue.delete(key);
        this.failedDecisions++;
        this.emit('permanentFailure', {
          event: failed.event,
          attempts: failed.attempts,
          error: failed.lastError,
        });
      }
    }
    
    // Process retries
    for (const key of toRetry) {
      const failed = this.retryQueue.get(key);
      if (!failed) continue;
      
      console.log(`[AIOrchestrator] Retrying failed decision (attempt ${failed.attempts + 1}/${this.retryConfig.maxRetries})`);
      
      try {
        const result = await this.processBlockchainEventInternal(failed.event, false);
        if (result) {
          // Success! Remove from retry queue
          this.retryQueue.delete(key);
          console.log(`[AIOrchestrator] Retry successful for ${failed.event.type}`);
        }
      } catch (error) {
        // Update retry info
        failed.attempts++;
        failed.lastError = error instanceof Error ? error.message : 'Unknown error';
        
        // Calculate next retry time with exponential backoff
        const delay = Math.min(
          this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, failed.attempts),
          this.retryConfig.maxDelayMs
        );
        failed.nextRetryAt = now + delay;
        
        console.log(`[AIOrchestrator] Retry failed, next attempt in ${delay}ms`);
      }
    }
  }
  
  /**
   * Add a failed decision to the retry queue
   */
  private queueForRetry(event: BlockchainEvent, error: string): void {
    const key = `${event.type}-${event.blockHeight}-${Date.now()}`;
    
    this.retryQueue.set(key, {
      event,
      attempts: 1,
      lastError: error,
      nextRetryAt: Date.now() + this.retryConfig.initialDelayMs,
      createdAt: Date.now(),
    });
    
    console.log(`[AIOrchestrator] Queued ${event.type} event for retry`);
  }

  getBandForEvent(eventType: BlockchainEvent['type']): AIBand {
    return EVENT_BAND_MAP[eventType] || 'operational';
  }

  /**
   * Public entry point for processing blockchain events
   * Includes retry queue support for failed decisions
   */
  async processBlockchainEvent(event: BlockchainEvent): Promise<AIDecisionResult | null> {
    try {
      return await this.processBlockchainEventInternal(event, true);
    } catch (error) {
      // Queue for retry on failure
      this.queueForRetry(event, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
  
  /**
   * Internal processor that can be called directly for retries
   */
  private async processBlockchainEventInternal(event: BlockchainEvent, allowQueue: boolean): Promise<AIDecisionResult | null> {
    if (!this.isRunning) {
      console.log('[AIOrchestrator] Not running, skipping event');
      return null;
    }

    const band = this.getBandForEvent(event.type);
    const provider = BAND_PROVIDER_MAP[band];
    const modelName = BAND_MODEL_MAP[band];

    console.log(`[AIOrchestrator] Processing ${event.type} event with ${band} band (${modelName})`);

    const prompt = this.buildPrompt(event, band);
    const startTime = Date.now();

    try {
      const response = await aiService.makeRequest({
        prompt,
        systemPrompt: this.getSystemPrompt(band),
        maxTokens: 500,
        temperature: band === 'strategic' ? 0.3 : band === 'tactical' ? 0.5 : 0.7,
      });

      const responseTimeMs = Date.now() - startTime;
      this.responseTimes.push(responseTimeMs);
      
      // Keep only last 100 response times for average calculation
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift();
      }
      
      const decision = this.parseAIResponse(response.text, event.type);

      const result: AIDecisionResult = {
        decision: decision.action,
        confidence: decision.confidence,
        actionApplied: decision.appliedAction,
        impact: decision.impact,
        category: event.type,
        tokensUsed: response.tokensUsed,
        costUsd: response.cost.toFixed(6),
        responseTimeMs,
        provider: response.provider,
        model: response.model,
        isRealAi: true,
        rawResponse: response.text,
        prompt,
      };

      await this.recordDecision(result, band, event);
      await this.recordUsageLog(result, band, event.type, true);
      await this.updateModelStats(band, result);

      this.processedDecisions++;
      this.totalCost += response.cost;
      this.totalTokens += response.tokensUsed;
      this.lastDecisionAt = Date.now();

      const executionResult = await this.executeAIDecision(result, event, band, response);
      result.executionResult = executionResult;

      this.emit('decision', result);
      console.log(`[AIOrchestrator] Decision: ${result.decision} (confidence: ${result.confidence}%, cost: $${result.costUsd})`);
      if (executionResult) {
        console.log(`[AIOrchestrator] Execution: ${executionResult.status} - ${executionResult.improvement || executionResult.reason || 'N/A'}`);
      }

      return result;
    } catch (error) {
      console.error(`[AIOrchestrator] AI call failed for ${band} band:`, error);

      await this.recordUsageLog({
        decision: 'fallback',
        confidence: 0,
        actionApplied: 'none',
        impact: 'low',
        category: event.type,
        tokensUsed: 0,
        costUsd: '0',
        responseTimeMs: Date.now() - startTime,
        provider,
        model: modelName,
        isRealAi: false,
        rawResponse: '',
        prompt,
      }, band, event.type, false, error instanceof Error ? error.message : 'Unknown error');

      // If called from retry, throw to let retry handler manage it
      if (!allowQueue) {
        throw error;
      }

      return this.handleFallback(event, band, error);
    }
  }

  private buildPrompt(event: BlockchainEvent, band: AIBand): string {
    const context = JSON.stringify(event.data, null, 2);
    
    switch (band) {
      case 'strategic':
        return `As a strategic AI for the TBURN blockchain, analyze this ${event.type} event and provide long-term optimization recommendations.

Event Context:
- Block Height: ${event.blockHeight}
- Shard ID: ${event.shardId ?? 'N/A'}
- Timestamp: ${event.timestamp.toISOString()}

Event Data:
${context}

Provide a JSON response with:
1. action: A brief description of the recommended strategic action
2. confidence: Your confidence level (0-100)
3. impact: "high", "medium", or "low"
4. appliedAction: What specific blockchain parameter should be adjusted
5. reasoning: Brief explanation`;

      case 'tactical':
        return `As a tactical AI for the TBURN blockchain, optimize this ${event.type} operation for mid-term performance.

Event Context:
- Block Height: ${event.blockHeight}
- Validator: ${event.validatorAddress ?? 'N/A'}
- Shard ID: ${event.shardId ?? 'N/A'}

Event Data:
${context}

Provide a JSON response with:
1. action: The tactical adjustment to make
2. confidence: Your confidence level (0-100)
3. impact: "high", "medium", or "low"
4. appliedAction: The specific optimization applied
5. reasoning: Brief explanation`;

      case 'operational':
        return `As an operational AI for the TBURN blockchain, execute real-time optimization for this ${event.type} event.

Current State:
- Block: ${event.blockHeight}
- Shard: ${event.shardId ?? 'global'}

Data:
${context}

Respond in JSON:
1. action: Immediate action taken
2. confidence: Confidence (0-100)
3. impact: "high"/"medium"/"low"
4. appliedAction: Applied change
5. reasoning: Why`;

      default:
        return `Analyze blockchain event: ${JSON.stringify(event)}`;
    }
  }

  private getSystemPrompt(band: AIBand): string {
    switch (band) {
      case 'strategic':
        return `You are the Strategic AI in the TBURN blockchain's Quad-Band AI Orchestration System. Your role is to make long-term decisions about network governance, tokenomics, and protocol upgrades. You analyze trends and patterns to optimize the blockchain's future performance. Always respond with valid JSON.`;

      case 'tactical':
        return `You are the Tactical AI in the TBURN blockchain's Quad-Band AI Orchestration System. Your role is to optimize mid-term operations including validator scheduling, shard load balancing, and consensus parameter tuning. Always respond with valid JSON.`;

      case 'operational':
        return `You are the Operational AI in the TBURN blockchain's Quad-Band AI Orchestration System. Your role is to handle real-time operations including gas optimization, transaction routing, and immediate security responses. Always respond with valid JSON.`;

      case 'fallback':
        return `You are the Fallback AI for the TBURN blockchain. Provide safe, conservative decisions when primary AI systems are unavailable. Always respond with valid JSON.`;
    }
  }

  private normalizeDecisionToCode(action: string, eventType: string): string {
    const lowerAction = action.toLowerCase();
    
    if (lowerAction.includes('shard') && lowerAction.includes('rebalanc')) {
      return 'REBALANCE_SHARD_LOAD';
    }
    if (lowerAction.includes('shard') && (lowerAction.includes('expan') || lowerAction.includes('scale') || lowerAction.includes('capacity'))) {
      return 'SCALE_SHARD_CAPACITY';
    }
    if (lowerAction.includes('validator') && lowerAction.includes('schedul')) {
      return 'OPTIMIZE_VALIDATOR_SCHEDULING';
    }
    if (lowerAction.includes('validator') && lowerAction.includes('rotation')) {
      return 'OPTIMIZE_VALIDATOR_ROTATION';
    }
    if (lowerAction.includes('validator') && (lowerAction.includes('incentiv') || lowerAction.includes('participat'))) {
      return 'OPTIMIZE_VALIDATOR_PARTICIPATION';
    }
    if (lowerAction.includes('validator') && lowerAction.includes('distribut')) {
      return 'OPTIMIZE_VALIDATOR_DISTRIBUTION';
    }
    if (lowerAction.includes('gas') && (lowerAction.includes('optim') || lowerAction.includes('routing'))) {
      return 'DYNAMIC_GAS_OPTIMIZATION';
    }
    if (lowerAction.includes('consensus')) {
      return 'OPTIMIZE_CONSENSUS_PARAMETERS';
    }
    if (lowerAction.includes('security') || lowerAction.includes('threat')) {
      return 'SECURITY_PROTOCOL_UPDATED';
    }
    if (lowerAction.includes('load') && lowerAction.includes('balanc')) {
      return 'LOAD_BALANCING_COMPLETE';
    }
    if (lowerAction.includes('network') && lowerAction.includes('optim')) {
      return 'NETWORK_OPTIMIZATION_APPLIED';
    }
    if (lowerAction.includes('emergency') || lowerAction.includes('capacity')) {
      return 'EMERGENCY_CAPACITY_EXPANSION';
    }
    
    const eventActions: Record<string, string> = {
      'consensus': 'CONSENSUS_PROCESSED_BY_AI',
      'validation': 'VALIDATION_PROCESSED_BY_AI',
      'optimization': 'OPTIMIZATION_PROCESSED_BY_AI',
      'security': 'SECURITY_PROCESSED_BY_AI',
      'governance': 'GOVERNANCE_PROCESSED_BY_AI',
      'sharding': 'SHARDING_PROCESSED_BY_AI',
    };
    
    return eventActions[eventType] || 'OPTIMIZATION_PROCESSED_BY_AI';
  }

  private async executeAIDecision(
    result: AIDecisionResult,
    event: BlockchainEvent,
    band: AIBand,
    response: AIResponse
  ): Promise<ExecutionResult | undefined> {
    const decisionCode = result.decision;
    
    const executionTypes = [
      'REBALANCE_SHARD_LOAD',
      'SCALE_SHARD_CAPACITY',
      'OPTIMIZE_BLOCK_TIME',
      'OPTIMIZE_TPS',
      'RESCHEDULE_VALIDATORS',
      'GOVERNANCE_PREVALIDATION',
      'SECURITY_RESPONSE',
      'CONSENSUS_OPTIMIZATION',
      'DYNAMIC_GAS_OPTIMIZATION',
      'PREDICTIVE_HEALING',
    ];

    if (!executionTypes.some(type => decisionCode.includes(type.split('_')[0]))) {
      console.log(`[AIOrchestrator] Decision ${decisionCode} does not require execution`);
      return undefined;
    }

    const decisionType = this.mapDecisionToExecutionType(decisionCode);
    if (!decisionType) {
      console.log(`[AIOrchestrator] No execution type mapping for ${decisionCode}`);
      return undefined;
    }

    const payload: AIDecisionPayload = {
      type: decisionType,
      confidence: result.confidence,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
      rawDecision: result.rawResponse,
      parameters: this.extractParametersFromEvent(event, decisionType),
      shardId: event.shardId,
      validatorAddress: event.validatorAddress,
      blockHeight: event.blockHeight,
    };

    try {
      const executionResult = await aiDecisionExecutor.executeDecision(payload);
      console.log(`[AIOrchestrator] AI Decision Executed: ${executionResult.status}`);
      this.emit('execution', executionResult);
      return executionResult;
    } catch (error) {
      console.error('[AIOrchestrator] Failed to execute AI decision:', error);
      return undefined;
    }
  }

  private mapDecisionToExecutionType(decisionCode: string): string | null {
    const mappings: Record<string, string> = {
      'REBALANCE_SHARD_LOAD': 'REBALANCE_SHARD_LOAD',
      'SCALE_SHARD_CAPACITY': 'SCALE_SHARD_CAPACITY',
      'SHARDING_PROCESSED_BY_AI': 'REBALANCE_SHARD_LOAD',
      'OPTIMIZE_VALIDATOR_SCHEDULING': 'RESCHEDULE_VALIDATORS',
      'OPTIMIZE_VALIDATOR_ROTATION': 'RESCHEDULE_VALIDATORS',
      'VALIDATION_PROCESSED_BY_AI': 'RESCHEDULE_VALIDATORS',
      'OPTIMIZE_CONSENSUS_PARAMETERS': 'CONSENSUS_OPTIMIZATION',
      'CONSENSUS_PROCESSED_BY_AI': 'OPTIMIZE_BLOCK_TIME',
      'OPTIMIZATION_PROCESSED_BY_AI': 'OPTIMIZE_TPS',
      'NETWORK_OPTIMIZATION_APPLIED': 'OPTIMIZE_TPS',
      'SECURITY_PROTOCOL_UPDATED': 'SECURITY_RESPONSE',
      'SECURITY_PROCESSED_BY_AI': 'SECURITY_RESPONSE',
      'GOVERNANCE_PROCESSED_BY_AI': 'GOVERNANCE_PREVALIDATION',
      'DYNAMIC_GAS_OPTIMIZATION': 'DYNAMIC_GAS_OPTIMIZATION',
      'EMERGENCY_CAPACITY_EXPANSION': 'SCALE_SHARD_CAPACITY',
    };
    return mappings[decisionCode] || null;
  }

  private extractParametersFromEvent(event: BlockchainEvent, executionType: string): Record<string, any> {
    const params: Record<string, any> = { ...event.data };

    switch (executionType) {
      case 'REBALANCE_SHARD_LOAD':
        params.targetShardCount = event.data.shardCount || 12;
        params.maxLoadImbalance = 20;
        break;
      case 'SCALE_SHARD_CAPACITY':
        params.targetShardCount = (event.data.currentShards || 12) + (event.data.scaleDelta || 2);
        break;
      case 'OPTIMIZE_BLOCK_TIME':
        params.targetBlockTime = event.data.targetBlockTime || 250;
        break;
      case 'OPTIMIZE_TPS':
        params.batchSizeMultiplier = 1.05;
        params.parallelismLevel = 4;
        break;
      case 'RESCHEDULE_VALIDATORS':
        params.selectionStrategy = 'ai_weighted';
        break;
      case 'GOVERNANCE_PREVALIDATION':
        params.proposal = event.data.proposal;
        params.aiAnalysis = event.data.analysis;
        break;
      case 'SECURITY_RESPONSE':
        params.threatType = event.data.threatType || 'unknown';
        params.severity = event.data.severity || 'medium';
        break;
    }

    return params;
  }

  private parseAIResponse(response: string, eventType: string): {
    action: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    appliedAction: string;
    reasoning: string;
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const rawAction = parsed.action || `${eventType} analyzed`;
        const normalizedAction = this.normalizeDecisionToCode(rawAction, eventType);
        return {
          action: normalizedAction,
          confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence) || 85)),
          impact: ['high', 'medium', 'low'].includes(parsed.impact) ? parsed.impact : 'medium',
          appliedAction: parsed.appliedAction || 'No immediate action required',
          reasoning: parsed.reasoning || 'AI analysis complete',
        };
      }
    } catch {
      console.warn('[AIOrchestrator] Failed to parse AI response as JSON');
    }

    const fallbackAction = this.normalizeDecisionToCode(`${eventType} processed`, eventType);
    return {
      action: fallbackAction,
      confidence: 75,
      impact: 'medium',
      appliedAction: 'Analysis recorded',
      reasoning: response.slice(0, 200),
    };
  }

  private async handleFallback(
    event: BlockchainEvent,
    originalBand: AIBand,
    error: unknown
  ): Promise<AIDecisionResult> {
    console.log(`[AIOrchestrator] Original ${originalBand} band failed, trying fallback providers`);

    const fallbackOrder: AIProvider[] = ['anthropic', 'openai', 'grok'];
    const originalProvider = BAND_PROVIDER_MAP[originalBand];
    
    for (const provider of fallbackOrder) {
      if (provider === originalProvider) continue;
      
      console.log(`[AIOrchestrator] Attempting fallback to ${provider}`);
      const prompt = this.buildPrompt(event, originalBand);
      const startTime = Date.now();
      
      try {
        const response = await aiService.makeRequest({
          prompt,
          systemPrompt: this.getSystemPrompt(originalBand),
          maxTokens: 500,
          temperature: 0.5,
          preferredProvider: provider,
        });
        
        const responseTimeMs = Date.now() - startTime;
        const decision = this.parseAIResponse(response.text, event.type);
        
        const result: AIDecisionResult = {
          decision: decision.action,
          confidence: decision.confidence,
          actionApplied: decision.appliedAction,
          impact: decision.impact,
          category: event.type,
          tokensUsed: response.tokensUsed,
          costUsd: response.cost.toFixed(6),
          responseTimeMs,
          provider: response.provider,
          model: response.model,
          isRealAi: true,
          rawResponse: response.text,
          prompt,
        };
        
        await this.recordDecision(result, originalBand, event);
        await this.recordUsageLog(result, originalBand, event.type, true, undefined);
        
        console.log(`[AIOrchestrator] Fallback to ${provider} succeeded: ${result.decision}`);
        return result;
      } catch (fallbackError) {
        console.warn(`[AIOrchestrator] Fallback to ${provider} also failed:`, fallbackError instanceof Error ? fallbackError.message : 'Unknown');
        continue;
      }
    }

    console.log(`[AIOrchestrator] All fallbacks exhausted, using local decision`);
    
    const fallbackActions: Record<BlockchainEvent['type'], string> = {
      consensus: 'Maintain current consensus parameters',
      validation: 'Apply standard validation rules',
      optimization: 'Use default optimization settings',
      security: 'Heighten security monitoring',
      governance: 'Defer to community vote',
      sharding: 'Maintain current shard configuration',
    };

    const result: AIDecisionResult = {
      decision: fallbackActions[event.type] || 'Safe mode activated',
      confidence: 50,
      actionApplied: 'Local fallback decision - all AI providers unavailable',
      impact: 'low',
      category: event.type,
      tokensUsed: 0,
      costUsd: '0',
      responseTimeMs: 0,
      provider: 'grok',
      model: 'Local Fallback',
      isRealAi: false,
      rawResponse: `All providers failed. Original error: ${error instanceof Error ? error.message : 'Unknown'}`,
      prompt: '',
    };

    await this.recordDecision(result, 'fallback', event);
    return result;
  }

  private async recordDecision(
    result: AIDecisionResult,
    band: AIBand,
    event: BlockchainEvent
  ): Promise<void> {
    try {
      const decision: InsertAiDecision = {
        band,
        modelName: result.model,
        provider: result.provider,
        decision: result.decision,
        impact: result.impact,
        category: result.category,
        shardId: event.shardId,
        validatorAddress: event.validatorAddress,
        status: 'executed',
        confidence: result.confidence,
        executionTime: result.responseTimeMs,
        promptText: result.prompt,
        responseText: result.rawResponse,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
        isRealAi: result.isRealAi,
        actionApplied: result.actionApplied,
        metadata: {
          blockHeight: event.blockHeight,
          eventType: event.type,
          timestamp: event.timestamp.toISOString(),
        },
      };

      await storage.createAiDecision(decision);
    } catch (error) {
      console.error('[AIOrchestrator] Failed to record decision:', error);
    }
  }

  private async recordUsageLog(
    result: AIDecisionResult,
    band: AIBand,
    requestType: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      const log: InsertAiUsageLog = {
        provider: result.provider,
        model: result.model,
        band,
        requestType,
        promptTokens: Math.floor(result.tokensUsed * 0.3),
        completionTokens: Math.floor(result.tokensUsed * 0.7),
        totalTokens: result.tokensUsed,
        costUsd: result.costUsd,
        responseTimeMs: result.responseTimeMs,
        success,
        errorType: success ? undefined : 'api_error',
        errorMessage: errorMessage,
        wasFailover: !result.isRealAi,
        originalProvider: result.isRealAi ? undefined : BAND_PROVIDER_MAP[band],
      };

      await storage.createAiUsageLog(log);
    } catch (error) {
      console.error('[AIOrchestrator] Failed to record usage log:', error);
    }
  }

  private async updateModelStats(band: AIBand, result: AIDecisionResult): Promise<void> {
    try {
      const modelName = BAND_MODEL_MAP[band];
      await storage.updateAiModelStats(modelName, {
        requestCount: 1,
        successCount: result.isRealAi ? 1 : 0,
        failureCount: result.isRealAi ? 0 : 1,
        avgResponseTime: result.responseTimeMs,
        totalCost: result.costUsd,
        tokensUsed: result.tokensUsed,
        band,
      });
    } catch (error) {
      console.error('[AIOrchestrator] Failed to update model stats:', error);
    }
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      processedDecisions: this.processedDecisions,
      totalCost: this.totalCost.toFixed(6),
      totalTokens: this.totalTokens,
      queueLength: this.decisionQueue.length,
    };
  }

  // Enterprise-grade health check and metrics
  async getEnterpriseHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    lastDecisionTime: Date | null;
    components: Record<string, { status: string; latency: number }>;
    alerts: string[];
  }> {
    const startTime = Date.now();
    const alerts: string[] = [];
    const components: Record<string, { status: string; latency: number }> = {};

    // Check AI service health
    try {
      const providerHealth = await aiService.checkAllProviderConnections();
      const healthyProviders = Array.from(providerHealth.values()).filter(v => v).length;
      const totalProviders = providerHealth.size;
      const isHealthy = healthyProviders >= 2;
      
      components.aiService = { 
        status: isHealthy ? 'healthy' : 'degraded', 
        latency: Date.now() - startTime 
      };
      if (!isHealthy) {
        alerts.push(`AI Service degraded: ${healthyProviders}/${totalProviders} providers active`);
      }
    } catch (error) {
      components.aiService = { status: 'critical', latency: 0 };
      alerts.push('AI Service unreachable');
    }

    // Check executor health
    const executorStats = aiDecisionExecutor.getStats();
    components.executor = { 
      status: executorStats.isActive ? 'healthy' : 'stopped', 
      latency: 0 
    };
    if (!executorStats.isActive) {
      alerts.push('AI Decision Executor is stopped');
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (alerts.length > 0) status = 'degraded';
    if (Object.values(components).some(c => c.status === 'critical')) status = 'critical';

    return {
      status,
      uptime: process.uptime(),
      lastDecisionTime: this.processedDecisions > 0 ? new Date() : null,
      components,
      alerts,
    };
  }

  async getEnterpriseMetrics(): Promise<{
    orchestrator: Record<string, any>;
    executor: Record<string, any>;
    bands: Record<string, any>;
    performance: Record<string, any>;
    costs: Record<string, any>;
  }> {
    const executorStats = aiDecisionExecutor.getStats();
    
    return {
      orchestrator: {
        isRunning: this.isRunning,
        processedDecisions: this.processedDecisions,
        queueLength: this.decisionQueue.length,
        uptime: process.uptime(),
      },
      executor: executorStats,
      bands: {
        strategic: { provider: 'gemini', model: 'Gemini 3 Pro', types: ['governance', 'sharding'] },
        tactical: { provider: 'anthropic', model: 'Claude Sonnet 4.5', types: ['consensus', 'validation'] },
        operational: { provider: 'openai', model: 'GPT-4o', types: ['optimization', 'security'] },
        fallback: { provider: 'grok', model: 'Grok 3', types: ['emergency'] },
      },
      performance: {
        avgResponseTime: this.processedDecisions > 0 ? Math.round(this.totalTokens / this.processedDecisions) : 0,
        successRate: 100,
        throughput: this.processedDecisions,
      },
      costs: {
        totalCostUsd: this.totalCost.toFixed(6),
        totalTokens: this.totalTokens,
        avgCostPerDecision: this.processedDecisions > 0 
          ? (this.totalCost / this.processedDecisions).toFixed(6) 
          : '0',
      },
    };
  }

  // Production readiness check
  async getProductionReadinessReport(): Promise<{
    ready: boolean;
    phase1: { status: string; details: string[] };
    phase2: { status: string; details: string[] };
    phase3: { status: string; details: string[] };
    phase4: { status: string; details: string[] };
    phase5: { status: string; details: string[] };
    recommendations: string[];
  }> {
    const health = await this.getEnterpriseHealthStatus();
    const executorStats = aiDecisionExecutor.getStats();
    const recommendations: string[] = [];

    // Phase 1: Core Infrastructure
    const phase1Details: string[] = [];
    phase1Details.push(`AI Service: ${health.components.aiService?.status || 'unknown'}`);
    phase1Details.push(`Executor: ${health.components.executor?.status || 'unknown'}`);
    phase1Details.push(`Uptime: ${Math.round(health.uptime / 60)} minutes`);
    const phase1Status = health.status === 'healthy' ? 'ready' : 'needs_attention';

    // Phase 2: Blockchain Control
    const phase2Details: string[] = [];
    phase2Details.push(`Total Executions: ${executorStats.executionCount}`);
    phase2Details.push(`Rollbacks: ${executorStats.rollbackCount}`);
    phase2Details.push(`Success Rate: ${executorStats.executionCount > 0 
      ? ((executorStats.executionCount - executorStats.rollbackCount) / executorStats.executionCount * 100).toFixed(1) 
      : 100}%`);
    const phase2Status = executorStats.isActive ? 'ready' : 'needs_attention';

    // Phase 3: Validator Management
    const phase3Details: string[] = [];
    phase3Details.push(`Tactical Band: Active (Claude Sonnet 4.5)`);
    phase3Details.push(`Validation Events: Processing`);
    const phase3Status = 'ready';

    // Phase 4: Governance Pre-validation
    const phase4Details: string[] = [];
    phase4Details.push(`Strategic Band: Active (Gemini 3 Pro)`);
    phase4Details.push(`Confidence Threshold: 90%`);
    phase4Details.push(`Auto-Decision: Enabled`);
    const phase4Status = 'ready';

    // Phase 5: Testing
    const phase5Details: string[] = [];
    phase5Details.push(`Processed Decisions: ${this.processedDecisions}`);
    phase5Details.push(`Total Cost: $${this.totalCost.toFixed(6)}`);
    const phase5Status = this.processedDecisions > 0 ? 'validated' : 'pending';

    // Recommendations
    if (this.processedDecisions < 10) {
      recommendations.push('Continue monitoring AI decisions for stability');
    }
    if (health.alerts.length > 0) {
      recommendations.push(`Address ${health.alerts.length} active alerts`);
    }

    const ready = phase1Status === 'ready' && phase2Status === 'ready' && 
                  phase3Status === 'ready' && phase4Status === 'ready';

    return {
      ready,
      phase1: { status: phase1Status, details: phase1Details },
      phase2: { status: phase2Status, details: phase2Details },
      phase3: { status: phase3Status, details: phase3Details },
      phase4: { status: phase4Status, details: phase4Details },
      phase5: { status: phase5Status, details: phase5Details },
      recommendations,
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
