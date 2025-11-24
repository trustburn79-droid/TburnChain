import { EventEmitter } from 'events';
import pRetry from 'p-retry';

export interface RestartState {
  isRestarting: boolean;
  restartInitiatedAt: Date | null;
  restartCompletedAt: Date | null;
  phase: 'idle' | 'stopping' | 'waiting' | 'reconnecting' | 'restarting' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  error?: string;
  retryCount: number;
  nextRetryAt?: Date;
  rateLimitedUntil?: Date;
}

interface RestartOptions {
  force?: boolean;
  clearRateLimit?: boolean;
  maxRetries?: number;
}

export class RestartSupervisor extends EventEmitter {
  private state: RestartState = {
    isRestarting: false,
    restartInitiatedAt: null,
    restartCompletedAt: null,
    phase: 'idle',
    progress: 0,
    message: 'System idle',
    retryCount: 0
  };

  private tburnClient: any;
  private validatorService: any;
  private pollingIntervals: NodeJS.Timeout[] = [];
  private rateLimitBackoff = 1000; // Start with 1 second
  private maxBackoff = 300000; // Max 5 minutes
  private isProductionMode: boolean;

  constructor(isProduction: boolean = false) {
    super();
    this.isProductionMode = isProduction;
  }

  public getState(): RestartState {
    return { ...this.state };
  }

  public setTBurnClient(client: any) {
    this.tburnClient = client;
  }

  public setValidatorService(service: any) {
    this.validatorService = service;
  }

  public registerPollingInterval(interval: NodeJS.Timeout) {
    this.pollingIntervals.push(interval);
  }

  private updateState(updates: Partial<RestartState>) {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
    console.log(`[RestartSupervisor] ${this.state.phase}: ${this.state.message}`);
  }

  public async initiateRestart(options: RestartOptions = {}): Promise<boolean> {
    if (this.state.isRestarting) {
      console.warn('[RestartSupervisor] Restart already in progress');
      return false;
    }

    try {
      console.log('[RestartSupervisor] 🔄 Initiating mainnet restart...');
      
      this.updateState({
        isRestarting: true,
        restartInitiatedAt: new Date(),
        restartCompletedAt: null,
        phase: 'stopping',
        progress: 10,
        message: 'Stopping current operations...',
        retryCount: 0,
        error: undefined
      });

      // Step 1: Stop all polling operations
      await this.stopAllPolling();
      
      this.updateState({
        phase: 'waiting',
        progress: 30,
        message: 'Waiting for rate limit cooldown...'
      });

      // Step 2: Wait for rate limit cooldown
      await this.waitForRateLimitCooldown(options.clearRateLimit);

      this.updateState({
        phase: 'reconnecting',
        progress: 50,
        message: 'Reconnecting to TBURN mainnet...'
      });

      // Step 3: Attempt to reconnect with retry logic
      const reconnected = await this.reconnectWithRetry(options.maxRetries || 3);

      if (!reconnected) {
        throw new Error('Failed to reconnect to mainnet after multiple attempts');
      }

      this.updateState({
        phase: 'restarting',
        progress: 70,
        message: 'Restarting services...'
      });

      // Step 4: Restart services
      await this.restartServices();

      this.updateState({
        phase: 'completed',
        progress: 100,
        message: 'Mainnet restart completed successfully',
        isRestarting: false,
        restartCompletedAt: new Date()
      });

      console.log('[RestartSupervisor] ✅ Mainnet restart completed successfully');
      return true;

    } catch (error: any) {
      console.error('[RestartSupervisor] ❌ Restart failed:', error);
      
      this.updateState({
        phase: 'failed',
        progress: 0,
        message: `Restart failed: ${error.message}`,
        error: error.message,
        isRestarting: false,
        restartCompletedAt: new Date()
      });

      return false;
    }
  }

  private async stopAllPolling(): Promise<void> {
    console.log('[RestartSupervisor] Stopping all polling operations...');
    
    // Clear all registered intervals
    for (const interval of this.pollingIntervals) {
      clearInterval(interval);
    }
    this.pollingIntervals = [];

    // Stop validator service if it exists
    if (this.validatorService?.stop) {
      await this.validatorService.stop();
    }

    // Give services time to clean up
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async waitForRateLimitCooldown(clearRateLimit?: boolean): Promise<void> {
    // Check if we're rate limited
    const now = Date.now();
    
    if (this.state.rateLimitedUntil && this.state.rateLimitedUntil.getTime() > now) {
      const waitTime = this.state.rateLimitedUntil.getTime() - now;
      console.log(`[RestartSupervisor] Waiting ${waitTime}ms for rate limit to expire...`);
      
      this.updateState({
        message: `Waiting ${Math.ceil(waitTime / 1000)}s for rate limit cooldown...`,
        progress: 35
      });

      await new Promise(resolve => setTimeout(resolve, waitTime));
    } else {
      // Apply exponential backoff even if not explicitly rate limited
      const backoffTime = Math.min(this.rateLimitBackoff * Math.pow(2, this.state.retryCount), this.maxBackoff);
      
      if (!clearRateLimit) {
        console.log(`[RestartSupervisor] Applying ${backoffTime}ms backoff before reconnect...`);
        
        this.updateState({
          message: `Waiting ${Math.ceil(backoffTime / 1000)}s before reconnection...`,
          progress: 40
        });

        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  private async reconnectWithRetry(maxRetries: number): Promise<boolean> {
    if (!this.tburnClient) {
      console.warn('[RestartSupervisor] No TBurn client configured, skipping reconnection');
      return true; // Continue anyway for development mode
    }

    let currentRetryCount = 0;

    try {
      const connected = await pRetry(
        async () => {
          // Fix: Use local retry count to avoid state mutation issues
          currentRetryCount++;
          this.updateState({
            retryCount: currentRetryCount,
            message: `Reconnection attempt ${currentRetryCount}/${maxRetries}...`
          });

          // Force re-authentication
          if (this.tburnClient.clearAuth) {
            this.tburnClient.clearAuth();
          }

          // Attempt to reconnect
          try {
            const result = await this.tburnClient.connect();
            
            if (!result) {
              throw new Error('Connection failed');
            }

            return true;
          } catch (connectError: any) {
            // Check if it's a rate limit error
            if (connectError.isRateLimited && connectError.retryAfter) {
              const rateLimitedUntil = new Date(Date.now() + (connectError.retryAfter * 1000));
              
              // Update state with rate limit info
              this.updateState({
                rateLimitedUntil,
                message: `Rate limited. Waiting ${connectError.retryAfter}s before retry...`,
                nextRetryAt: rateLimitedUntil
              });
              
              // Store for future reference
              this.state.rateLimitedUntil = rateLimitedUntil;
              
              // Wait for rate limit to expire
              await new Promise(resolve => setTimeout(resolve, connectError.retryAfter * 1000));
              
              // Throw to trigger retry
              throw connectError;
            }
            
            // Re-throw non-rate-limit errors
            throw connectError;
          }
        },
        {
          retries: maxRetries - 1, // pRetry counts first attempt as 0
          onFailedAttempt: (error) => {
            console.warn(`[RestartSupervisor] Reconnection attempt ${error.attemptNumber} failed:`, error.message);
            
            // Increase backoff for next attempt
            this.rateLimitBackoff = Math.min(this.rateLimitBackoff * 2, this.maxBackoff);
          }
        }
      );

      console.log('[RestartSupervisor] Successfully reconnected to mainnet');
      this.rateLimitBackoff = 1000; // Reset backoff on success
      
      // Clear retry count on success
      this.updateState({ retryCount: 0 });
      
      return true;

    } catch (error) {
      console.error('[RestartSupervisor] All reconnection attempts failed');
      return false;
    }
  }

  private parseRetryAfter(error: any): number {
    // Try to parse Retry-After header or extract from error message
    const retryAfter = error.retryAfter || error.headers?.['retry-after'];
    
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000;
      }
    }

    // Default to exponential backoff
    return Math.min(this.rateLimitBackoff * 2, this.maxBackoff);
  }

  private async restartServices(): Promise<void> {
    console.log('[RestartSupervisor] Restarting services...');

    // Restart validator service if it exists
    if (this.validatorService?.start) {
      await this.validatorService.start();
    }

    // Re-initialize any other services that need restarting
    this.emit('servicesRestarted');

    // Give services time to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  public handleRateLimitError(error: any) {
    // Called when a rate limit is detected elsewhere in the system
    const retryAfter = this.parseRetryAfter(error);
    this.state.rateLimitedUntil = new Date(Date.now() + retryAfter);
    
    console.log(`[RestartSupervisor] Rate limit detected, retry after ${new Date(this.state.rateLimitedUntil).toISOString()}`);
  }

  public async emergencyStop() {
    console.log('[RestartSupervisor] 🛑 Emergency stop initiated');
    
    await this.stopAllPolling();
    
    this.updateState({
      isRestarting: false,
      phase: 'idle',
      progress: 0,
      message: 'Emergency stop - system halted',
      error: 'Emergency stop activated'
    });
  }
}

// Singleton instance
let supervisorInstance: RestartSupervisor | null = null;

export function getRestartSupervisor(isProduction: boolean = false): RestartSupervisor {
  if (!supervisorInstance) {
    supervisorInstance = new RestartSupervisor(isProduction);
  }
  return supervisorInstance;
}

export function resetRestartSupervisor() {
  supervisorInstance = null;
}