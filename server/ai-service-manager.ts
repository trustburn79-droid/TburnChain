import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import pLimit from "p-limit";
import pRetry from "p-retry";
import { EventEmitter } from "events";

// AI Provider Types
export type AIProvider = "anthropic" | "openai" | "gemini";

export interface AIUsageStats {
  provider: AIProvider;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  totalTokensUsed: number;
  totalCost: number;
  lastRequestTime?: Date;
  lastRateLimitTime?: Date;
  rateLimitResetTime?: Date;
  isRateLimited: boolean;
  dailyLimit?: number;
  dailyUsage?: number;
}

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  priority: number; // Lower is higher priority
  maxRetries: number;
  maxRequestsPerMinute: number;
  dailyTokenLimit?: number;
  costPerToken?: number;
}

export interface AIRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  model: string;
  tokensUsed: number;
  cost: number;
  processingTime: number;
}

// Usage tracking database schema extension
export const aiUsageSchema = {
  provider: "text",
  timestamp: "timestamp",
  tokensUsed: "integer",
  cost: "real",
  success: "boolean",
  errorType: "text",
  requestType: "text",
  responseTime: "integer"
};

class AIServiceManager extends EventEmitter {
  private providers: Map<AIProvider, any> = new Map();
  private configs: Map<AIProvider, AIProviderConfig> = new Map();
  private usageStats: Map<AIProvider, AIUsageStats> = new Map();
  private requestLimiters: Map<AIProvider, ReturnType<typeof pLimit>> = new Map();
  private activeProvider: AIProvider = "anthropic";
  
  constructor() {
    super();
    this.initializeProviders();
    this.initializeUsageStats();
    this.startUsageMonitoring();
  }
  
  private initializeProviders() {
    // Initialize Anthropic (Using Replit AI Integration)
    if (process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({
        apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
      });
      this.providers.set("anthropic", anthropic);
      this.configs.set("anthropic", {
        provider: "anthropic",
        model: "claude-sonnet-4-5",
        priority: 1,
        maxRetries: 3,
        maxRequestsPerMinute: 50,
        dailyTokenLimit: 1000000, // 1M tokens per day
        costPerToken: 0.000003 // $3 per 1M tokens
      });
      this.requestLimiters.set("anthropic", pLimit(2)); // 2 concurrent requests
    }
    
    // Initialize OpenAI (Using Replit AI Integration)
    if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
      this.providers.set("openai", openai);
      this.configs.set("openai", {
        provider: "openai",
        model: "gpt-5",
        priority: 2,
        maxRetries: 3,
        maxRequestsPerMinute: 60,
        dailyTokenLimit: 2000000, // 2M tokens per day
        costPerToken: 0.000002 // $2 per 1M tokens
      });
      this.requestLimiters.set("openai", pLimit(3)); // 3 concurrent requests
    }
    
    // Initialize Google Gemini (Using Replit AI Integration)
    if (process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
      const gemini = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY
      });
      this.providers.set("gemini", gemini);
      this.configs.set("gemini", {
        provider: "gemini",
        model: "gemini-3-pro-preview", // Gemini 3.0 Pro
        priority: 3,
        maxRetries: 3,
        maxRequestsPerMinute: 100,
        dailyTokenLimit: 2000000, // 2M tokens per day
        costPerToken: 0.000002 // $2 per 1M tokens input (based on pricing research)
      });
      this.requestLimiters.set("gemini", pLimit(3)); // 3 concurrent requests
    }
  }
  
  private initializeUsageStats() {
    for (const provider of ["anthropic", "openai", "gemini"] as AIProvider[]) {
      this.usageStats.set(provider, {
        provider,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        rateLimitHits: 0,
        totalTokensUsed: 0,
        totalCost: 0,
        isRateLimited: false,
        dailyLimit: this.configs.get(provider)?.dailyTokenLimit,
        dailyUsage: 0
      });
    }
  }
  
  private startUsageMonitoring() {
    // Reset daily usage at midnight
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.resetDailyUsage();
      }
    }, 60000); // Check every minute
    
    // Emit usage stats periodically
    setInterval(() => {
      this.emit("usageUpdate", this.getAllUsageStats());
    }, 5000); // Every 5 seconds
  }
  
  private resetDailyUsage() {
    Array.from(this.usageStats.values()).forEach(stats => {
      stats.dailyUsage = 0;
    });
    console.log("[AI Service] Daily usage counters reset");
  }
  
  private isRateLimitError(error: any): boolean {
    const errorMsg = error?.message || String(error);
    return (
      error?.status === 429 ||
      errorMsg.includes("429") ||
      errorMsg.includes("RATELIMIT_EXCEEDED") ||
      errorMsg.toLowerCase().includes("quota") ||
      errorMsg.toLowerCase().includes("rate limit")
    );
  }
  
  private handleRateLimit(provider: AIProvider) {
    const stats = this.usageStats.get(provider);
    if (stats) {
      stats.isRateLimited = true;
      stats.rateLimitHits++;
      stats.lastRateLimitTime = new Date();
      stats.rateLimitResetTime = new Date(Date.now() + 60000); // Reset in 1 minute
      
      this.emit("rateLimitHit", {
        provider,
        resetTime: stats.rateLimitResetTime
      });
      
      console.log(`[AI Service] Rate limit hit for ${provider}, switching to next provider`);
      this.switchToNextProvider(provider);
      
      // Reset rate limit flag after timeout
      setTimeout(() => {
        stats.isRateLimited = false;
        console.log(`[AI Service] Rate limit reset for ${provider}`);
      }, 60000);
    }
  }
  
  private switchToNextProvider(currentProvider: AIProvider) {
    const providers = Array.from(this.configs.keys())
      .filter(p => p !== currentProvider && !this.usageStats.get(p)?.isRateLimited)
      .sort((a, b) => {
        const configA = this.configs.get(a)!;
        const configB = this.configs.get(b)!;
        return configA.priority - configB.priority;
      });
    
    if (providers.length > 0) {
      this.activeProvider = providers[0];
      console.log(`[AI Service] Switched to ${this.activeProvider}`);
      this.emit("providerSwitched", {
        from: currentProvider,
        to: this.activeProvider
      });
    } else {
      console.error("[AI Service] All providers are rate limited!");
      this.emit("allProvidersLimited");
    }
  }
  
  private async callAnthropic(request: AIRequest): Promise<AIResponse> {
    const anthropic = this.providers.get("anthropic");
    const config = this.configs.get("anthropic")!;
    const stats = this.usageStats.get("anthropic")!;
    
    const startTime = Date.now();
    
    try {
      const message = await anthropic.messages.create({
        model: config.model,
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature || 0.5,
        system: request.systemPrompt,
        messages: [
          {
            role: "user",
            content: request.prompt,
          },
        ],
      });
      
      const content = message.content[0];
      const text = content.type === "text" ? content.text : "";
      const tokensUsed = message.usage?.total_tokens || 0;
      const cost = tokensUsed * (config.costPerToken || 0);
      
      // Update stats
      stats.successfulRequests++;
      stats.totalTokensUsed += tokensUsed;
      stats.totalCost += cost;
      stats.dailyUsage = (stats.dailyUsage || 0) + tokensUsed;
      
      return {
        text,
        provider: "anthropic",
        model: config.model,
        tokensUsed,
        cost,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      stats.failedRequests++;
      if (this.isRateLimitError(error)) {
        this.handleRateLimit("anthropic");
      }
      throw error;
    } finally {
      stats.totalRequests++;
      stats.lastRequestTime = new Date();
    }
  }
  
  private async callOpenAI(request: AIRequest): Promise<AIResponse> {
    const openai = this.providers.get("openai");
    const config = this.configs.get("openai")!;
    const stats = this.usageStats.get("openai")!;
    
    const startTime = Date.now();
    
    try {
      const messages: any[] = [];
      if (request.systemPrompt) {
        messages.push({ role: "system", content: request.systemPrompt });
      }
      messages.push({ role: "user", content: request.prompt });
      
      const completion = await openai.chat.completions.create({
        model: config.model,
        messages,
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature || 0.5,
      });
      
      const text = completion.choices[0]?.message?.content || "";
      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = tokensUsed * (config.costPerToken || 0);
      
      // Update stats
      stats.successfulRequests++;
      stats.totalTokensUsed += tokensUsed;
      stats.totalCost += cost;
      stats.dailyUsage = (stats.dailyUsage || 0) + tokensUsed;
      
      return {
        text,
        provider: "openai",
        model: config.model,
        tokensUsed,
        cost,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      stats.failedRequests++;
      if (this.isRateLimitError(error)) {
        this.handleRateLimit("openai");
      }
      throw error;
    } finally {
      stats.totalRequests++;
      stats.lastRequestTime = new Date();
    }
  }
  
  private async callGemini(request: AIRequest): Promise<AIResponse> {
    const gemini = this.providers.get("gemini");
    const config = this.configs.get("gemini")!;
    const stats = this.usageStats.get("gemini")!;
    
    const startTime = Date.now();
    
    try {
      const model = gemini.models.generate({
        model: config.model
      });
      
      const result = await model.generateContent({
        contents: [
          {
            parts: [
              {
                text: request.prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: request.maxTokens || 1024,
          temperature: request.temperature || 0.5
        },
        systemInstruction: request.systemPrompt ? {
          parts: [{
            text: request.systemPrompt
          }]
        } : undefined
      });
      
      const text = result.response?.text() || "";
      const tokensUsed = result.response?.usageMetadata?.totalTokenCount || 0;
      const cost = tokensUsed * (config.costPerToken || 0);
      
      // Update stats
      stats.successfulRequests++;
      stats.totalTokensUsed += tokensUsed;
      stats.totalCost += cost;
      stats.dailyUsage = (stats.dailyUsage || 0) + tokensUsed;
      
      return {
        text,
        provider: "gemini",
        model: config.model,
        tokensUsed,
        cost,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      stats.failedRequests++;
      if (this.isRateLimitError(error)) {
        this.handleRateLimit("gemini");
      }
      throw error;
    } finally {
      stats.totalRequests++;
      stats.lastRequestTime = new Date();
    }
  }
  
  public async makeRequest(request: AIRequest): Promise<AIResponse> {
    const maxAttempts = 3;
    let lastError: any;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const provider = this.activeProvider;
      const stats = this.usageStats.get(provider);
      
      // Check if provider is rate limited
      if (stats?.isRateLimited) {
        this.switchToNextProvider(provider);
        continue;
      }
      
      // Check daily limit
      if (stats && stats.dailyLimit && stats.dailyUsage && stats.dailyUsage >= stats.dailyLimit) {
        console.log(`[AI Service] Daily limit reached for ${provider}`);
        this.switchToNextProvider(provider);
        continue;
      }
      
      const limiter = this.requestLimiters.get(provider);
      if (!limiter) {
        this.switchToNextProvider(provider);
        continue;
      }
      
      try {
        return await limiter(() => 
          pRetry(
            async () => {
              switch (provider) {
                case "anthropic":
                  if (this.providers.has("anthropic")) {
                    return await this.callAnthropic(request);
                  }
                  break;
                case "openai":
                  if (this.providers.has("openai")) {
                    return await this.callOpenAI(request);
                  }
                  break;
                case "gemini":
                  if (this.providers.has("gemini")) {
                    return await this.callGemini(request);
                  }
                  break;
              }
              throw new Error(`Provider ${provider} not available`);
            },
            {
              retries: 2,
              minTimeout: 2000,
              maxTimeout: 10000,
              factor: 2,
              onFailedAttempt: (context) => {
                console.log(`[AI Service] Attempt ${context.attemptNumber} failed for ${provider}`);
              }
            }
          )
        );
      } catch (error) {
        lastError = error;
        console.error(`[AI Service] Failed with ${provider}:`, error);
        
        if (this.isRateLimitError(error)) {
          // Rate limit already handled in provider methods
        } else {
          // Try next provider for other errors
          this.switchToNextProvider(provider);
        }
      }
    }
    
    throw lastError || new Error("All AI providers failed");
  }
  
  public getAllUsageStats(): AIUsageStats[] {
    return Array.from(this.usageStats.values());
  }
  
  public getProviderStats(provider: AIProvider): AIUsageStats | undefined {
    return this.usageStats.get(provider);
  }
  
  public getCurrentProvider(): AIProvider {
    return this.activeProvider;
  }
  
  public resetProvider(provider: AIProvider) {
    const stats = this.usageStats.get(provider);
    if (stats) {
      stats.isRateLimited = false;
      stats.rateLimitResetTime = undefined;
      console.log(`[AI Service] Manually reset ${provider}`);
    }
  }
  
  public switchProvider(provider: AIProvider) {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} is not configured`);
    }
    
    const stats = this.usageStats.get(provider);
    if (stats?.isRateLimited) {
      throw new Error(`Provider ${provider} is currently rate limited`);
    }
    
    this.activeProvider = provider;
    console.log(`[AI Service] Manually switched to ${provider}`);
    
    // Emit event for WebSocket broadcasting
    this.emit("providerSwitched", {
      from: this.activeProvider,
      to: provider
    });
  }
  
  public checkHealth(): {
    availableProviders: AIProvider[];
    rateLimitedProviders: AIProvider[];
    currentProvider: AIProvider;
    totalRequests: number;
    totalCost: number;
  } {
    const availableProviders: AIProvider[] = [];
    const rateLimitedProviders: AIProvider[] = [];
    let totalRequests = 0;
    let totalCost = 0;
    
    for (const [provider, stats] of Array.from(this.usageStats)) {
      if (stats.isRateLimited) {
        rateLimitedProviders.push(provider);
      } else if (this.providers.has(provider)) {
        availableProviders.push(provider);
      }
      totalRequests += stats.totalRequests;
      totalCost += stats.totalCost;
    }
    
    return {
      availableProviders,
      rateLimitedProviders,
      currentProvider: this.activeProvider,
      totalRequests,
      totalCost
    };
  }
}

// Export singleton instance
export const aiService = new AIServiceManager();

// Export for WebSocket integration
export function broadcastAIUsageStats(broadcastFn: (type: string, data: any) => void) {
  aiService.on("usageUpdate", (stats) => {
    broadcastFn("ai-usage", stats);
  });
  
  aiService.on("rateLimitHit", (data) => {
    broadcastFn("ai-rate-limit", data);
  });
  
  aiService.on("providerSwitched", (data) => {
    broadcastFn("ai-provider-switch", data);
  });
}