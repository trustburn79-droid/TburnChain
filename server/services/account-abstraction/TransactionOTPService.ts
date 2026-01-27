/**
 * TransactionOTPService - 트랜잭션 이메일 OTP 인증 서비스
 * 
 * 코인 전송 시 이메일로 6자리 인증 코드 전송
 * - OTP 생성 및 검증
 * - 만료 시간 관리
 * - 시도 횟수 제한
 * - 트랜잭션 금액별 차등 인증
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { emailWalletLinkingService } from './EmailWalletLinkingService';

export interface OTPRequest {
  id: string;
  walletAddress: string;
  email: string;
  otpCode: string;
  otpHash: string;
  transactionType: 'TRANSFER' | 'SWAP' | 'STAKE' | 'UNSTAKE' | 'BRIDGE' | 'CONTRACT_CALL';
  amount: string;
  toAddress?: string;
  tokenSymbol: string;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
  attempts: number;
  maxAttempts: number;
  metadata?: Record<string, any>;
}

export interface OTPVerificationResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  remainingAttempts?: number;
}

export interface OTPConfig {
  codeLength: number;
  expirationMinutes: number;
  maxAttempts: number;
  cooldownSeconds: number;
  amountThresholds: {
    noOTPRequired: number;
    standardOTP: number;
    enhancedOTP: number;
  };
}

const DEFAULT_CONFIG: OTPConfig = {
  codeLength: 6,
  expirationMinutes: 5,
  maxAttempts: 3,
  cooldownSeconds: 60,
  amountThresholds: {
    noOTPRequired: 10,
    standardOTP: 1000,
    enhancedOTP: 10000,
  },
};

class TransactionOTPService extends EventEmitter {
  private static instance: TransactionOTPService;
  private otpRequests: Map<string, OTPRequest> = new Map();
  private walletCooldowns: Map<string, number> = new Map();
  private config: OTPConfig;
  private initialized: boolean = false;

  private constructor() {
    super();
    this.config = DEFAULT_CONFIG;
    this.startCleanupInterval();
    this.initialized = true;
    console.log('[TransactionOTP] Service initialized');
  }

  static getInstance(): TransactionOTPService {
    if (!TransactionOTPService.instance) {
      TransactionOTPService.instance = new TransactionOTPService();
    }
    return TransactionOTPService.instance;
  }

  private generateOTPCode(): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < this.config.codeLength; i++) {
      code += digits[crypto.randomInt(0, digits.length)];
    }
    return code;
  }

  private hashOTP(code: string, salt: string): string {
    return crypto.createHash('sha256').update(code + salt).digest('hex');
  }

  private generateRequestId(): string {
    return `otp_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  async requiresOTP(walletAddress: string, amount: number): Promise<{ required: boolean; level: 'none' | 'standard' | 'enhanced' }> {
    const thresholds = this.config.amountThresholds;
    
    if (amount <= thresholds.noOTPRequired) {
      return { required: false, level: 'none' };
    } else if (amount <= thresholds.standardOTP) {
      return { required: true, level: 'standard' };
    } else {
      return { required: true, level: 'enhanced' };
    }
  }

  async createOTPRequest(
    walletAddress: string,
    transactionType: OTPRequest['transactionType'],
    amount: string,
    tokenSymbol: string,
    toAddress?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; requestId?: string; expiresAt?: number; error?: string }> {
    const normalizedWallet = walletAddress.toLowerCase();
    
    const cooldownUntil = this.walletCooldowns.get(normalizedWallet);
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const remainingSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
      return { 
        success: false, 
        error: `Please wait ${remainingSeconds} seconds before requesting a new OTP` 
      };
    }

    const link = await emailWalletLinkingService.getEmailByWallet(normalizedWallet);
    if (!link) {
      return { success: false, error: 'Wallet not linked to any email address' };
    }

    const otpCode = this.generateOTPCode();
    const requestId = this.generateRequestId();
    const salt = crypto.randomBytes(16).toString('hex');
    const now = Date.now();

    const otpRequest: OTPRequest = {
      id: requestId,
      walletAddress: normalizedWallet,
      email: link.email,
      otpCode: otpCode,
      otpHash: this.hashOTP(otpCode, salt),
      transactionType,
      amount,
      toAddress,
      tokenSymbol,
      createdAt: now,
      expiresAt: now + this.config.expirationMinutes * 60 * 1000,
      verified: false,
      attempts: 0,
      maxAttempts: this.config.maxAttempts,
      metadata,
    };

    this.otpRequests.set(requestId, otpRequest);
    this.walletCooldowns.set(normalizedWallet, now + this.config.cooldownSeconds * 1000);

    this.emit('otp_created', {
      requestId,
      walletAddress: normalizedWallet,
      email: link.email,
      otpCode,
      transactionType,
      amount,
      tokenSymbol,
      toAddress,
      expiresAt: otpRequest.expiresAt,
    });

    console.log(`[TransactionOTP] OTP created for ${normalizedWallet}: ${otpCode} (expires: ${new Date(otpRequest.expiresAt).toISOString()})`);

    return {
      success: true,
      requestId,
      expiresAt: otpRequest.expiresAt,
    };
  }

  async verifyOTP(requestId: string, inputCode: string): Promise<OTPVerificationResult> {
    const otpRequest = this.otpRequests.get(requestId);

    if (!otpRequest) {
      return { success: false, error: 'OTP request not found or expired' };
    }

    if (Date.now() > otpRequest.expiresAt) {
      this.otpRequests.delete(requestId);
      return { success: false, error: 'OTP has expired. Please request a new code.' };
    }

    if (otpRequest.verified) {
      return { success: false, error: 'OTP has already been verified' };
    }

    otpRequest.attempts++;

    if (otpRequest.attempts > otpRequest.maxAttempts) {
      this.otpRequests.delete(requestId);
      this.emit('otp_max_attempts', {
        requestId,
        walletAddress: otpRequest.walletAddress,
        email: otpRequest.email,
      });
      return { success: false, error: 'Maximum verification attempts exceeded' };
    }

    if (inputCode !== otpRequest.otpCode) {
      const remainingAttempts = otpRequest.maxAttempts - otpRequest.attempts;
      return { 
        success: false, 
        error: 'Invalid OTP code',
        remainingAttempts,
      };
    }

    otpRequest.verified = true;
    const transactionId = `tx_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    this.emit('otp_verified', {
      requestId,
      transactionId,
      walletAddress: otpRequest.walletAddress,
      transactionType: otpRequest.transactionType,
      amount: otpRequest.amount,
      tokenSymbol: otpRequest.tokenSymbol,
      toAddress: otpRequest.toAddress,
    });

    console.log(`[TransactionOTP] OTP verified for ${otpRequest.walletAddress}, transaction: ${transactionId}`);

    return {
      success: true,
      transactionId,
    };
  }

  async cancelOTPRequest(requestId: string, walletAddress: string): Promise<boolean> {
    const otpRequest = this.otpRequests.get(requestId);
    
    if (!otpRequest || otpRequest.walletAddress !== walletAddress.toLowerCase()) {
      return false;
    }

    this.otpRequests.delete(requestId);
    this.emit('otp_cancelled', { requestId, walletAddress });
    return true;
  }

  async resendOTP(requestId: string): Promise<{ success: boolean; newRequestId?: string; error?: string }> {
    const otpRequest = this.otpRequests.get(requestId);

    if (!otpRequest) {
      return { success: false, error: 'OTP request not found' };
    }

    if (otpRequest.verified) {
      return { success: false, error: 'OTP has already been verified' };
    }

    this.otpRequests.delete(requestId);

    return this.createOTPRequest(
      otpRequest.walletAddress,
      otpRequest.transactionType,
      otpRequest.amount,
      otpRequest.tokenSymbol,
      otpRequest.toAddress,
      otpRequest.metadata
    );
  }

  getOTPRequest(requestId: string): OTPRequest | undefined {
    const request = this.otpRequests.get(requestId);
    if (request) {
      const { otpCode, otpHash, ...safeRequest } = request;
      return { ...safeRequest, otpCode: '******', otpHash: '******' } as OTPRequest;
    }
    return undefined;
  }

  async getPendingRequests(walletAddress: string): Promise<OTPRequest[]> {
    const normalizedWallet = walletAddress.toLowerCase();
    const pending: OTPRequest[] = [];
    const now = Date.now();

    this.otpRequests.forEach((request) => {
      if (request.walletAddress === normalizedWallet && 
          !request.verified && 
          request.expiresAt > now) {
        const { otpCode, otpHash, ...safeRequest } = request;
        pending.push({ ...safeRequest, otpCode: '******', otpHash: '******' } as OTPRequest);
      }
    });

    return pending;
  }

  getConfig(): OTPConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<OTPConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('[TransactionOTP] Config updated:', this.config);
  }

  getStats(): {
    totalRequests: number;
    pendingRequests: number;
    verifiedToday: number;
    failedToday: number;
  } {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    let pendingRequests = 0;
    let verifiedToday = 0;
    let failedToday = 0;

    this.otpRequests.forEach((request) => {
      if (!request.verified && request.expiresAt > now) {
        pendingRequests++;
      }
      if (request.createdAt >= todayStart) {
        if (request.verified) {
          verifiedToday++;
        } else if (request.attempts >= request.maxAttempts) {
          failedToday++;
        }
      }
    });

    return {
      totalRequests: this.otpRequests.size,
      pendingRequests,
      verifiedToday,
      failedToday,
    };
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      const toDelete: string[] = [];
      const cooldownsToDelete: string[] = [];

      this.otpRequests.forEach((request, id) => {
        if (request.expiresAt < now - 60 * 60 * 1000) {
          toDelete.push(id);
        }
      });

      toDelete.forEach(id => {
        this.otpRequests.delete(id);
        cleaned++;
      });

      this.walletCooldowns.forEach((until, wallet) => {
        if (until < now) {
          cooldownsToDelete.push(wallet);
        }
      });

      cooldownsToDelete.forEach(wallet => {
        this.walletCooldowns.delete(wallet);
      });

      if (cleaned > 0) {
        console.log(`[TransactionOTP] Cleaned up ${cleaned} expired OTP requests`);
      }
    }, 5 * 60 * 1000);
  }
}

export const transactionOTPService = TransactionOTPService.getInstance();
export default transactionOTPService;
