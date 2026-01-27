/**
 * Transaction OTP API Routes
 * 
 * 트랜잭션 이메일 OTP 인증 API
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { transactionOTPService } from '../services/account-abstraction/TransactionOTPService';
import '../services/email/TransactionOTPEmailService';

const router = Router();

const createOTPSchema = z.object({
  walletAddress: z.string().min(10),
  transactionType: z.enum(['TRANSFER', 'SWAP', 'STAKE', 'UNSTAKE', 'BRIDGE', 'CONTRACT_CALL']),
  amount: z.string(),
  tokenSymbol: z.string(),
  toAddress: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const verifyOTPSchema = z.object({
  requestId: z.string(),
  otpCode: z.string().length(6),
});

const resendOTPSchema = z.object({
  requestId: z.string(),
});

const cancelOTPSchema = z.object({
  requestId: z.string(),
  walletAddress: z.string(),
});

const checkRequiresOTPSchema = z.object({
  walletAddress: z.string(),
  amount: z.number(),
});

router.post('/create', async (req: Request, res: Response) => {
  try {
    const parsed = createOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parsed.error.errors 
      });
    }

    const { walletAddress, transactionType, amount, tokenSymbol, toAddress, metadata } = parsed.data;

    const result = await transactionOTPService.createOTPRequest(
      walletAddress,
      transactionType,
      amount,
      tokenSymbol,
      toAddress,
      metadata
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      requestId: result.requestId,
      expiresAt: result.expiresAt,
      message: 'OTP code sent to your registered email',
    });
  } catch (error) {
    console.error('[TransactionOTP] Create error:', error);
    res.status(500).json({ error: 'Failed to create OTP request' });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const parsed = verifyOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parsed.error.errors 
      });
    }

    const { requestId, otpCode } = parsed.data;
    const result = await transactionOTPService.verifyOTP(requestId, otpCode);

    if (!result.success) {
      return res.status(400).json({ 
        error: result.error,
        remainingAttempts: result.remainingAttempts,
      });
    }

    res.json({
      success: true,
      transactionId: result.transactionId,
      message: 'Transaction approved',
    });
  } catch (error) {
    console.error('[TransactionOTP] Verify error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.post('/resend', async (req: Request, res: Response) => {
  try {
    const parsed = resendOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parsed.error.errors 
      });
    }

    const { requestId } = parsed.data;
    const result = await transactionOTPService.resendOTP(requestId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      requestId: result.newRequestId,
      message: 'New OTP code sent to your email',
    });
  } catch (error) {
    console.error('[TransactionOTP] Resend error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const parsed = cancelOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parsed.error.errors 
      });
    }

    const { requestId, walletAddress } = parsed.data;
    const success = await transactionOTPService.cancelOTPRequest(requestId, walletAddress);

    if (!success) {
      return res.status(404).json({ error: 'OTP request not found or unauthorized' });
    }

    res.json({ success: true, message: 'OTP request cancelled' });
  } catch (error) {
    console.error('[TransactionOTP] Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel OTP request' });
  }
});

router.post('/check-required', async (req: Request, res: Response) => {
  try {
    const parsed = checkRequiresOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parsed.error.errors 
      });
    }

    const { walletAddress, amount } = parsed.data;
    const result = await transactionOTPService.requiresOTP(walletAddress, amount);

    res.json({
      required: result.required,
      level: result.level,
      thresholds: transactionOTPService.getConfig().amountThresholds,
    });
  } catch (error) {
    console.error('[TransactionOTP] Check required error:', error);
    res.status(500).json({ error: 'Failed to check OTP requirement' });
  }
});

router.get('/pending/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const pending = await transactionOTPService.getPendingRequests(walletAddress);
    res.json({ pending });
  } catch (error) {
    console.error('[TransactionOTP] Get pending error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

router.get('/request/:requestId', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID required' });
    }

    const request = transactionOTPService.getOTPRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: 'OTP request not found or expired' });
    }

    res.json({ request });
  } catch (error) {
    console.error('[TransactionOTP] Get request error:', error);
    res.status(500).json({ error: 'Failed to get OTP request' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = transactionOTPService.getStats();
    const config = transactionOTPService.getConfig();
    res.json({ stats, config });
  } catch (error) {
    console.error('[TransactionOTP] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/config', async (_req: Request, res: Response) => {
  try {
    const config = transactionOTPService.getConfig();
    res.json({ config });
  } catch (error) {
    console.error('[TransactionOTP] Get config error:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

import type { Express } from 'express';

export function registerTransactionOTPRoutes(app: Express): void {
  app.use('/api/transaction-otp', router);
  console.log('[TransactionOTP] Routes registered at /api/transaction-otp');
}

export default router;
