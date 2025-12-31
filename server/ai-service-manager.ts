import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import pLimit from "p-limit";
import pRetry from "p-retry";
import { EventEmitter } from "events";

// AI Provider Types - Grok is fallback provider
export type AIProvider = "anthropic" | "openai" | "gemini" | "grok";

// Consecutive failure tracking for Grok fallback activation
interface FailureTracker {
  consecutiveFailures: number;
  lastFailureTime?: Date;
  grokActivated: boolean;
}

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
  connectionStatus?: "connected" | "disconnected" | "rate_limited";
  lastHealthCheck?: Date;
  averageResponseTime?: number;
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
  preferredProvider?: AIProvider;
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
  private activeProvider: AIProvider = "gemini"; // Gemini is now the default primary provider
  
  // Grok fallback tracking - activates when any primary provider fails 3+ consecutive times
  private failureTracker: FailureTracker = {
    consecutiveFailures: 0,
    grokActivated: false
  };
  private readonly GROK_ACTIVATION_THRESHOLD = 3; // Activate Grok after 3 consecutive failures
  
  // Global circuit breaker - stops ALL AI calls when all providers are rate limited
  // CRITICAL: Uses exponential backoff to prevent event loop blocking
  private globalCircuitBreaker = {
    isOpen: false,
    openedAt: 0,
    cooldownMs: 300000, // 5 minute cooldown (increased from 60s to prevent event loop thrashing)
    consecutiveAllProvidersDown: 0,
    threshold: 1, // Open immediately after first "all providers down" event (reduced from 3)
    maxCooldownMs: 900000 // Max 15 minute cooldown with exponential backoff
  };
  
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
        priority: 2, // Changed from 1 to 2 (Gemini is now priority 1)
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
        model: "gpt-4o",  // Using GPT-4o for stable performance
        priority: 3, // Changed from 2 to 3 (Gemini is priority 1, Anthropic is priority 2)
        maxRetries: 3,
        maxRequestsPerMinute: 60,
        dailyTokenLimit: 2000000, // 2M tokens per day
        costPerToken: 0.000002 // $2 per 1M tokens
      });
      this.requestLimiters.set("openai", pLimit(3)); // 3 concurrent requests
    }
    
    // Initialize Google Gemini (Priority #1 - Primary Provider)
    // Check for user's own API key first, then fall back to Replit AI Integration
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    if (geminiApiKey) {
      const gemini = new GoogleGenAI({
        apiKey: geminiApiKey
      });
      this.providers.set("gemini", gemini);
      this.configs.set("gemini", {
        provider: "gemini",
        model: "gemini-3-pro-preview", // Gemini 3.0 Pro
        priority: 1, // PRIMARY PROVIDER - Highest priority
        maxRetries: 3,
        maxRequestsPerMinute: 100,
        dailyTokenLimit: 5000000, // 5M tokens per day (increased for primary provider)
        costPerToken: 0.000002 // $2 per 1M tokens input
      });
      this.requestLimiters.set("gemini", pLimit(4)); // 4 concurrent requests (increased)
      console.log("[AI Service] 🚀 Gemini initialized as PRIMARY provider");
    }
    
    // Initialize Grok (xAI) - FALLBACK PROVIDER
    // Activates when primary providers fail 3+ consecutive times
    const grokApiKey = process.env.GROK_API_KEY;
    if (grokApiKey) {
      const grok = new OpenAI({
        apiKey: grokApiKey,
        baseURL: "https://api.x.ai/v1"
      });
      this.providers.set("grok", grok);
      this.configs.set("grok", {
        provider: "grok",
        model: "grok-3-latest", // Grok 3 latest model
        priority: 99, // FALLBACK - Only used when primary providers fail
        maxRetries: 3,
        maxRequestsPerMinute: 60,
        dailyTokenLimit: 1000000, // 1M tokens per day
        costPerToken: 0.000005 // $5 per 1M tokens (estimated)
      });
      this.requestLimiters.set("grok", pLimit(2)); // 2 concurrent requests
      console.log("[AI Service] 🔄 Grok initialized as FALLBACK provider (activates after 3 consecutive failures)");
    }
  }
  
  private initializeUsageStats() {
    // Initialize in priority order: Gemini first, then Anthropic, then OpenAI, then Grok (fallback)
    for (const provider of ["gemini", "anthropic", "openai", "grok"] as AIProvider[]) {
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
  
  private switchToNextProvider(currentProvider: AIProvider): boolean {
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
      return true;
    } else {
      console.error("[AI Service] All providers are rate limited!");
      this.emit("allProvidersLimited");
      return false;
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
      
      const completionParams: any = {
        model: config.model,
        messages,
        temperature: request.temperature || 0.5,
        max_tokens: request.maxTokens || 1024,
      };

      const completion = await openai.chat.completions.create(completionParams);
      
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
      // Prepare the request
      const generateRequest: any = {
        model: config.model,
        contents: [
          {
            parts: [
              {
                text: request.prompt
              }
            ],
            role: "user"
          }
        ],
        generationConfig: {
          maxOutputTokens: request.maxTokens || 1024,
          temperature: request.temperature || 0.5
        }
      };
      
      // Add system instruction if provided
      if (request.systemPrompt) {
        generateRequest.systemInstruction = {
          parts: [{
            text: request.systemPrompt
          }]
        };
      }
      
      // Generate content using client.models.generateContent
      const result = await gemini.models.generateContent(generateRequest);
      
      // Extract text from the response
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const tokensUsed = result.usageMetadata?.totalTokenCount || 0;
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
  
  // Grok AI (xAI) - Fallback provider using OpenAI-compatible API
  private async callGrok(request: AIRequest): Promise<AIResponse> {
    const grok = this.providers.get("grok");
    const config = this.configs.get("grok")!;
    const stats = this.usageStats.get("grok")!;
    
    const startTime = Date.now();
    
    try {
      const messages: any[] = [];
      if (request.systemPrompt) {
        messages.push({ role: "system", content: request.systemPrompt });
      }
      messages.push({ role: "user", content: request.prompt });
      
      const completionParams: any = {
        model: config.model,
        messages,
        temperature: request.temperature || 0.5,
        max_tokens: request.maxTokens || 1024,
      };

      const completion = await grok.chat.completions.create(completionParams);
      
      const text = completion.choices[0]?.message?.content || "";
      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = tokensUsed * (config.costPerToken || 0);
      
      // Update stats
      stats.successfulRequests++;
      stats.totalTokensUsed += tokensUsed;
      stats.totalCost += cost;
      stats.dailyUsage = (stats.dailyUsage || 0) + tokensUsed;
      
      // Reset failure tracker on successful Grok response
      this.failureTracker.consecutiveFailures = 0;
      
      return {
        text,
        provider: "grok",
        model: config.model,
        tokensUsed,
        cost,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      stats.failedRequests++;
      if (this.isRateLimitError(error)) {
        this.handleRateLimit("grok");
      }
      throw error;
    } finally {
      stats.totalRequests++;
      stats.lastRequestTime = new Date();
    }
  }
  
  // Track consecutive failures and check if Grok should be activated
  private trackFailureAndCheckGrok(provider: AIProvider): boolean {
    // Only track failures for primary providers (not Grok itself)
    if (provider === "grok") return false;
    
    this.failureTracker.consecutiveFailures++;
    this.failureTracker.lastFailureTime = new Date();
    
    console.log(`[AI Service] ⚠️ Provider ${provider} failed. Consecutive failures: ${this.failureTracker.consecutiveFailures}/${this.GROK_ACTIVATION_THRESHOLD}`);
    
    // Activate Grok if we've hit the threshold and haven't already
    if (this.failureTracker.consecutiveFailures >= this.GROK_ACTIVATION_THRESHOLD && 
        !this.failureTracker.grokActivated && 
        this.providers.has("grok")) {
      this.failureTracker.grokActivated = true;
      console.log(`[AI Service] 🔄 GROK FALLBACK ACTIVATED! ${this.failureTracker.consecutiveFailures} consecutive failures detected.`);
      this.emit("grokActivated", {
        consecutiveFailures: this.failureTracker.consecutiveFailures,
        lastFailedProvider: provider,
        activatedAt: new Date()
      });
      return true;
    }
    
    return this.failureTracker.grokActivated;
  }
  
  // Reset failure tracker when a primary provider succeeds
  private resetFailureTracker() {
    if (this.failureTracker.consecutiveFailures > 0) {
      console.log(`[AI Service] ✅ Primary provider succeeded. Resetting failure counter.`);
    }
    this.failureTracker.consecutiveFailures = 0;
    // Keep grokActivated true - once activated, Grok remains available as an option
  }
  
  // Check if Grok is available and should be used
  public isGrokActive(): boolean {
    return this.failureTracker.grokActivated && this.providers.has("grok");
  }
  
  // Get Grok activation status
  public getGrokStatus(): { activated: boolean; consecutiveFailures: number; threshold: number; available: boolean } {
    return {
      activated: this.failureTracker.grokActivated,
      consecutiveFailures: this.failureTracker.consecutiveFailures,
      threshold: this.GROK_ACTIVATION_THRESHOLD,
      available: this.providers.has("grok")
    };
  }
  
  // Get list of providers that are NOT rate-limited
  private getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];
    for (const [provider, stats] of Array.from(this.usageStats)) {
      if (!stats.isRateLimited && this.providers.has(provider)) {
        available.push(provider);
      }
    }
    return available;
  }
  
  public async makeRequest(request: AIRequest): Promise<AIResponse> {
    const maxAttempts = 3;
    let lastError: any;
    let allProvidersExhausted = false;
    
    // GLOBAL CIRCUIT BREAKER - Fastest possible rejection
    if (this.globalCircuitBreaker.isOpen) {
      const elapsed = Date.now() - this.globalCircuitBreaker.openedAt;
      if (elapsed < this.globalCircuitBreaker.cooldownMs) {
        // Circuit is open and still cooling down - fail IMMEDIATELY
        throw new Error("AI service circuit breaker is open. All providers rate limited.");
      }
      // Cooldown complete - allow half-open test
      console.log('[AI Service] Circuit breaker half-open - testing...');
    }
    
    // CRITICAL FIX: Check if ALL providers are rate-limited BEFORE attempting requests
    // This prevents blocking the event loop when no providers are available
    const initialAvailable = this.getAvailableProviders();
    if (initialAvailable.length === 0) {
      // Track consecutive "all providers down" events
      this.globalCircuitBreaker.consecutiveAllProvidersDown++;
      if (this.globalCircuitBreaker.consecutiveAllProvidersDown >= this.globalCircuitBreaker.threshold) {
        if (!this.globalCircuitBreaker.isOpen) {
          this.globalCircuitBreaker.isOpen = true;
          this.globalCircuitBreaker.openedAt = Date.now();
          console.log(`[AI Service] 🔴 GLOBAL CIRCUIT BREAKER OPEN - cooling down for ${this.globalCircuitBreaker.cooldownMs / 1000}s`);
        }
      }
      // Track failure for Grok activation before throwing
      this.trackFailureAndCheckGrok(this.activeProvider);
      throw new Error("All AI providers are currently rate limited. Please wait and try again.");
    }
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const provider = this.activeProvider;
      const stats = this.usageStats.get(provider);
      
      // Check if provider is rate limited - if switch fails, break immediately
      if (stats?.isRateLimited) {
        const switched = this.switchToNextProvider(provider);
        if (!switched) {
          allProvidersExhausted = true;
          this.trackFailureAndCheckGrok(provider);
          break; // Exit loop immediately - no available providers
        }
        continue;
      }
      
      // Check daily limit - if switch fails, break immediately
      if (stats && stats.dailyLimit && stats.dailyUsage && stats.dailyUsage >= stats.dailyLimit) {
        console.log(`[AI Service] Daily limit reached for ${provider}`);
        const switched = this.switchToNextProvider(provider);
        if (!switched) {
          allProvidersExhausted = true;
          this.trackFailureAndCheckGrok(provider);
          break;
        }
        continue;
      }
      
      const limiter = this.requestLimiters.get(provider);
      if (!limiter) {
        const switched = this.switchToNextProvider(provider);
        if (!switched) {
          allProvidersExhausted = true;
          break;
        }
        continue;
      }
      
      try {
        const result = await limiter(() => 
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
                case "grok":
                  if (this.providers.has("grok")) {
                    return await this.callGrok(request);
                  }
                  break;
              }
              throw new Error(`Provider ${provider} not available`);
            },
            {
              retries: 1,
              minTimeout: 500,
              maxTimeout: 2000,
              factor: 2,
              onFailedAttempt: (context) => {
                console.log(`[AI Service] Attempt ${context.attemptNumber} failed for ${provider}`);
              }
            }
          )
        );
        
        // Reset failure tracker on success (for primary providers only)
        if (provider !== "grok") {
          this.resetFailureTracker();
        }
        
        // Reset global circuit breaker on success
        if (this.globalCircuitBreaker.isOpen || this.globalCircuitBreaker.consecutiveAllProvidersDown > 0) {
          console.log('[AI Service] ✅ Request succeeded - resetting circuit breaker');
          this.globalCircuitBreaker.isOpen = false;
          this.globalCircuitBreaker.consecutiveAllProvidersDown = 0;
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.error(`[AI Service] Failed with ${provider}:`, error);
        
        // Track failure for Grok activation (only for primary providers)
        const shouldTryGrok = this.trackFailureAndCheckGrok(provider);
        
        if (this.isRateLimitError(error)) {
          // Rate limit error - try to switch, break if all exhausted
          const switched = this.switchToNextProvider(provider);
          if (!switched) {
            allProvidersExhausted = true;
            break;
          }
        } else {
          // Other error - try next provider
          const switched = this.switchToNextProvider(provider);
          if (!switched) {
            allProvidersExhausted = true;
            break;
          }
        }
        
        // If Grok is activated and available, try it as last resort
        if (shouldTryGrok && this.providers.has("grok") && !this.usageStats.get("grok")?.isRateLimited) {
          console.log(`[AI Service] 🔄 Attempting Grok fallback...`);
          try {
            const grokLimiter = this.requestLimiters.get("grok");
            if (grokLimiter) {
              return await grokLimiter(() => this.callGrok(request));
            }
          } catch (grokError) {
            console.error(`[AI Service] Grok fallback also failed:`, grokError);
            lastError = grokError;
          }
        }
      }
    }
    
    // Handle all providers exhausted case
    if (allProvidersExhausted) {
      throw new Error("All AI providers are currently rate limited. Please wait and try again.");
    }
    
    throw lastError || new Error("All AI providers failed");
  }
  
  public getAllUsageStats(): AIUsageStats[] {
    // Sort by priority (lower number = higher priority)
    return Array.from(this.usageStats.values()).sort((a, b) => {
      const configA = this.configs.get(a.provider);
      const configB = this.configs.get(b.provider);
      if (!configA || !configB) return 0;
      return configA.priority - configB.priority;
    });
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

  // Health check for individual provider
  public async checkProviderConnection(provider: AIProvider): Promise<boolean> {
    const stats = this.usageStats.get(provider);
    if (!stats) {
      return false;
    }

    try {
      const testRequest: AIRequest = {
        prompt: "Hi",
        maxTokens: 10,
        temperature: 0.5
      };

      console.log(`[AI Health Check] Testing ${provider}...`);
      const startTime = Date.now();
      let result: any;
      
      switch (provider) {
        case "gemini":
          if (!this.providers.has("gemini")) {
            stats.connectionStatus = "disconnected";
            stats.lastHealthCheck = new Date();
            return false;
          }
          result = await this.callGemini(testRequest);
          break;
        case "anthropic":
          if (!this.providers.has("anthropic")) {
            stats.connectionStatus = "disconnected";
            stats.lastHealthCheck = new Date();
            return false;
          }
          result = await this.callAnthropic(testRequest);
          break;
        case "openai":
          if (!this.providers.has("openai")) {
            stats.connectionStatus = "disconnected";
            stats.lastHealthCheck = new Date();
            return false;
          }
          result = await this.callOpenAI(testRequest);
          break;
        case "grok":
          if (!this.providers.has("grok")) {
            stats.connectionStatus = "disconnected";
            stats.lastHealthCheck = new Date();
            return false;
          }
          result = await this.callGrok(testRequest);
          break;
        default:
          stats.connectionStatus = "disconnected";
          stats.lastHealthCheck = new Date();
          return false;
      }

      const responseTime = Date.now() - startTime;
      
      // If we got a successful response, mark as healthy
      if (result && result.text) {
        stats.connectionStatus = "connected";
        stats.lastHealthCheck = new Date();
        stats.averageResponseTime = (stats.averageResponseTime || 0) * 0.9 + responseTime * 0.1; // Rolling average
        console.log(`[AI Health Check] ${provider} is healthy (${responseTime}ms)`);
        return true;
      } else {
        stats.connectionStatus = "disconnected";
        stats.lastHealthCheck = new Date();
        return false;
      }
    } catch (error: any) {
      stats.lastHealthCheck = new Date();
      
      // Check if it's a rate limit error (still means API is reachable)
      if (error.status === 429 || error.message?.includes("rate") || error.message?.includes("429")) {
        stats.connectionStatus = "rate_limited";
        console.log(`[AI Health Check] ${provider} is rate-limited but reachable`);
        return true; // API is reachable, just rate limited
      }
      
      stats.connectionStatus = "disconnected";
      console.error(`[AI Health Check] ${provider} is unhealthy:`, error.message || error);
      return false;
    }
  }

  // Health check for all providers (including Grok if available)
  public async checkAllProviderConnections(): Promise<Map<AIProvider, boolean>> {
    const healthStatus = new Map<AIProvider, boolean>();
    // Include Grok in health checks if it's configured
    const providers: AIProvider[] = this.providers.has("grok") 
      ? ["gemini", "anthropic", "openai", "grok"]
      : ["gemini", "anthropic", "openai"];
    
    // Check all providers in parallel
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        const isHealthy = await this.checkProviderConnection(provider);
        return { provider, isHealthy };
      })
    );
    
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        healthStatus.set(result.value.provider, result.value.isHealthy);
      } else {
        // If check itself failed, mark as unhealthy
        console.error("[AI Health Check] Health check failed:", result.reason);
      }
    });
    
    return healthStatus;
  }

  // Start periodic health checks (called from routes)
  private healthCheckInterval?: NodeJS.Timeout;
  
  public startPeriodicHealthChecks(intervalMinutes: number = 5) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Run initial health check
    this.checkAllProviderConnections().then((results) => {
      console.log("[AI Health Check] Initial health check complete:", 
        Array.from(results.entries()).map(([p, h]) => `${p}: ${h ? 'healthy' : 'unhealthy'}`).join(', '));
    });
    
    // Schedule periodic checks
    this.healthCheckInterval = setInterval(async () => {
      const results = await this.checkAllProviderConnections();
      this.emit("healthCheckUpdate", results);
      console.log(`[AI Health Check] Periodic check (${intervalMinutes}min):`, 
        Array.from(results.entries()).map(([p, h]) => `${p}: ${h ? 'healthy' : 'unhealthy'}`).join(', '));
    }, intervalMinutes * 60 * 1000);
    
    console.log(`[AI Health Check] Started periodic health checks every ${intervalMinutes} minutes`);
  }
  
  public stopPeriodicHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      console.log("[AI Health Check] Stopped periodic health checks");
    }
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