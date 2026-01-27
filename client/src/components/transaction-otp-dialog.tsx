import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Clock, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

interface TransactionOTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  transactionType: 'TRANSFER' | 'SWAP' | 'STAKE' | 'UNSTAKE' | 'BRIDGE' | 'CONTRACT_CALL';
  amount: string;
  tokenSymbol: string;
  toAddress?: string;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

export function TransactionOTPDialog({
  open,
  onOpenChange,
  walletAddress,
  transactionType,
  amount,
  tokenSymbol,
  toAddress,
  onSuccess,
  onCancel,
}: TransactionOTPDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);

  useEffect(() => {
    if (open) {
      setStep('request');
      setRequestId(null);
      setOtpCode('');
      setRemainingAttempts(3);
    }
  }, [open]);

  useEffect(() => {
    if (!expiresAt) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingTime(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        toast({
          title: t('transactionOTP.expired', 'OTP Expired'),
          description: t('transactionOTP.expiredDesc', 'Please request a new code'),
          variant: 'destructive',
        });
        setStep('request');
        setRequestId(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, t, toast]);

  const createOTPMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/transaction-otp/create', {
        walletAddress,
        transactionType,
        amount,
        tokenSymbol,
        toAddress,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setRequestId(data.requestId);
      setExpiresAt(data.expiresAt);
      setStep('verify');
      toast({
        title: t('transactionOTP.codeSent', 'Code Sent'),
        description: t('transactionOTP.codeSentDesc', 'Check your email for the verification code'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('transactionOTP.error', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/transaction-otp/verify', {
        requestId,
        otpCode,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setStep('success');
      toast({
        title: t('transactionOTP.verified', 'Verified'),
        description: t('transactionOTP.verifiedDesc', 'Transaction approved successfully'),
      });
      setTimeout(() => {
        onSuccess?.(data.transactionId);
        onOpenChange(false);
      }, 1500);
    },
    onError: async (error: any) => {
      try {
        const errorData = await error.json?.();
        if (errorData?.remainingAttempts !== undefined) {
          setRemainingAttempts(errorData.remainingAttempts);
        }
        toast({
          title: t('transactionOTP.invalidCode', 'Invalid Code'),
          description: errorData?.error || error.message,
          variant: 'destructive',
        });
      } catch {
        toast({
          title: t('transactionOTP.error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      }
      setOtpCode('');
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/transaction-otp/resend', { requestId });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setRequestId(data.requestId);
      setExpiresAt(Date.now() + 5 * 60 * 1000);
      setOtpCode('');
      setRemainingAttempts(3);
      toast({
        title: t('transactionOTP.resent', 'Code Resent'),
        description: t('transactionOTP.resentDesc', 'A new code has been sent to your email'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('transactionOTP.error', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'TRANSFER': t('transactionOTP.transfer', 'Token Transfer'),
      'SWAP': t('transactionOTP.swap', 'Token Swap'),
      'STAKE': t('transactionOTP.stake', 'Staking'),
      'UNSTAKE': t('transactionOTP.unstake', 'Unstaking'),
      'BRIDGE': t('transactionOTP.bridge', 'Bridge Transfer'),
      'CONTRACT_CALL': t('transactionOTP.contractCall', 'Contract Call'),
    };
    return labels[type] || type;
  };

  const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <DialogTitle>{t('transactionOTP.title', 'Transaction Verification')}</DialogTitle>
              <DialogDescription>
                {t('transactionOTP.subtitle', 'Email OTP authentication required')}
              </DialogDescription>
            </div>
          </div>
          <Badge variant="outline" className="absolute top-4 right-12 bg-orange-500/10 text-orange-500 border-orange-500/30">
            2026 Next-Gen
          </Badge>
        </DialogHeader>

        <Card className="border-orange-500/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('transactionOTP.type', 'Type')}</span>
              <span className="font-medium">{getTransactionTypeLabel(transactionType)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('transactionOTP.amount', 'Amount')}</span>
              <span className="font-medium text-green-500">{amount} {tokenSymbol}</span>
            </div>
            {toAddress && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('transactionOTP.to', 'To')}</span>
                <span className="font-mono text-xs">{shortAddress(toAddress)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {step === 'request' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg">
              <Mail className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                {t('transactionOTP.willSendCode', 'A 6-digit code will be sent to your registered email')}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                data-testid="button-cancel-otp"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={() => createOTPMutation.mutate()}
                disabled={createOTPMutation.isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                data-testid="button-request-otp"
              >
                {createOTPMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {t('transactionOTP.sendCode', 'Send Code')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{t('transactionOTP.expiresIn', 'Expires in')}</span>
              </div>
              <span className="font-mono text-lg font-bold text-blue-500">
                {formatTime(remainingTime)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('transactionOTP.enterCode', 'Enter 6-digit code')}
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest"
                data-testid="input-otp-code"
              />
              {remainingAttempts < 3 && (
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  {t('transactionOTP.attemptsRemaining', 'Attempts remaining')}: {remainingAttempts}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => resendOTPMutation.mutate()}
                disabled={resendOTPMutation.isPending}
                className="flex-1"
                data-testid="button-resend-otp"
              >
                {resendOTPMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t('transactionOTP.resend', 'Resend Code')
                )}
              </Button>
              <Button
                onClick={() => verifyOTPMutation.mutate()}
                disabled={verifyOTPMutation.isPending || otpCode.length !== 6}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                data-testid="button-verify-otp"
              >
                {verifyOTPMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t('transactionOTP.verify', 'Verify')
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-500">
                {t('transactionOTP.approved', 'Transaction Approved')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('transactionOTP.approvedDesc', 'Your transaction has been verified and is being processed')}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TransactionOTPDialog;
