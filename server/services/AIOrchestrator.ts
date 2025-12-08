import { aiService, AIProvider, AIResponse } from '../ai-service-manager';
import { storage } from '../storage';
import { InsertAiDecision, InsertAiUsageLog } from '@shared/schema';
import { EventEmitter } from 'events';

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

class AIOrchestrator extends EventEmitter {
  private isRunning = false;
  private decisionQueue: BlockchainEvent[] = [];
  private processedDecisions = 0;
  private totalCost = 0;
  private totalTokens = 0;

  constructor() {
    super();
    console.log('[AIOrchestrator] Real AI Orchestrator initialized');
  }

  async start(): Promise<void> {
    this.isRunning = true;
    console.log('[AIOrchestrator] Started - Real AI decisions enabled');
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('[AIOrchestrator] Stopped');
    this.emit('stopped');
  }

  getBandForEvent(eventType: BlockchainEvent['type']): AIBand {
    return EVENT_BAND_MAP[eventType] || 'operational';
  }

  async processBlockchainEvent(event: BlockchainEvent): Promise<AIDecisionResult | null> {
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

      this.emit('decision', result);
      console.log(`[AIOrchestrator] Decision: ${result.decision} (confidence: ${result.confidence}%, cost: $${result.costUsd})`);

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
        return {
          action: parsed.action || `${eventType} analyzed`,
          confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence) || 85)),
          impact: ['high', 'medium', 'low'].includes(parsed.impact) ? parsed.impact : 'medium',
          appliedAction: parsed.appliedAction || 'No immediate action required',
          reasoning: parsed.reasoning || 'AI analysis complete',
        };
      }
    } catch {
      console.warn('[AIOrchestrator] Failed to parse AI response as JSON');
    }

    return {
      action: `${eventType} processed by AI`,
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
}

export const aiOrchestrator = new AIOrchestrator();
