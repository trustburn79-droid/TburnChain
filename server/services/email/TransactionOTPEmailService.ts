/**
 * TransactionOTPEmailService - 트랜잭션 OTP 이메일 전송 서비스
 * 
 * Resend 통합을 사용하여 OTP 코드 이메일 전송
 */

import { Resend } from 'resend';
import { transactionOTPService } from '../account-abstraction/TransactionOTPService';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

interface OTPEmailData {
  email: string;
  otpCode: string;
  transactionType: string;
  amount: string;
  tokenSymbol: string;
  toAddress?: string;
  expiresAt: number;
  walletAddress: string;
}

class TransactionOTPEmailService {
  private static instance: TransactionOTPEmailService;

  private constructor() {
    this.setupEventListeners();
    console.log('[TransactionOTPEmail] Service initialized');
  }

  static getInstance(): TransactionOTPEmailService {
    if (!TransactionOTPEmailService.instance) {
      TransactionOTPEmailService.instance = new TransactionOTPEmailService();
    }
    return TransactionOTPEmailService.instance;
  }

  private setupEventListeners(): void {
    transactionOTPService.on('otp_created', async (data: OTPEmailData & { requestId: string }) => {
      await this.sendOTPEmail(data);
    });

    transactionOTPService.on('otp_max_attempts', async (data: { requestId: string; walletAddress: string; email: string }) => {
      await this.sendMaxAttemptsAlert(data.email, data.walletAddress);
    });
  }

  async sendOTPEmail(data: OTPEmailData): Promise<boolean> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      
      const transactionTypeKorean = this.getTransactionTypeKorean(data.transactionType);
      const expiryMinutes = Math.ceil((data.expiresAt - Date.now()) / 60000);
      const shortAddress = data.toAddress ? `${data.toAddress.slice(0, 6)}...${data.toAddress.slice(-4)}` : '';

      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TBURN 트랜잭션 인증 코드</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #141414; border-radius: 16px; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #333;">
              <div style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 12px 24px; border-radius: 8px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">🔥 TBURN</span>
              </div>
              <p style="color: #888; margin-top: 8px; font-size: 14px;">2026 Next-Gen Blockchain</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #f97316; margin: 0 0 24px 0; font-size: 28px; text-align: center;">
                트랜잭션 인증 코드
              </h1>
              
              <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
                아래 인증 코드를 입력하여 트랜잭션을 승인하세요.
              </p>

              <!-- OTP Code Box -->
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 2px solid #f97316; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <p style="color: #888; margin: 0 0 12px 0; font-size: 14px;">인증 코드</p>
                <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #f97316; font-family: monospace;">
                  ${data.otpCode}
                </div>
                <p style="color: #f97316; margin: 16px 0 0 0; font-size: 14px;">
                  ⏱️ ${expiryMinutes}분 후 만료
                </p>
              </div>

              <!-- Transaction Details -->
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #888; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase;">트랜잭션 상세</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #888; padding: 8px 0; font-size: 14px;">유형</td>
                    <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${transactionTypeKorean}</td>
                  </tr>
                  <tr>
                    <td style="color: #888; padding: 8px 0; font-size: 14px;">금액</td>
                    <td style="color: #22c55e; padding: 8px 0; font-size: 14px; text-align: right; font-weight: bold;">${data.amount} ${data.tokenSymbol}</td>
                  </tr>
                  ${data.toAddress ? `
                  <tr>
                    <td style="color: #888; padding: 8px 0; font-size: 14px;">수신 주소</td>
                    <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right; font-family: monospace;">${shortAddress}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Security Warning -->
              <div style="background-color: #7f1d1d20; border: 1px solid #991b1b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #fca5a5; margin: 0; font-size: 13px; line-height: 1.5;">
                  ⚠️ <strong>보안 주의:</strong> 이 코드를 누구에게도 공유하지 마세요. TBURN 팀은 절대로 인증 코드를 요청하지 않습니다.
                </p>
              </div>

              <p style="color: #666; font-size: 13px; text-align: center; margin: 0;">
                본인이 요청하지 않은 경우 이 이메일을 무시하세요.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #0d0d0d; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #555; font-size: 12px; margin: 0;">
                © 2026 TBURN Blockchain. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const { error } = await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: `[TBURN] 트랜잭션 인증 코드: ${data.otpCode}`,
        html,
      });

      if (error) {
        console.error('[TransactionOTPEmail] Failed to send OTP email:', error);
        return false;
      }

      console.log(`[TransactionOTPEmail] OTP email sent to ${data.email}`);
      return true;
    } catch (error) {
      console.error('[TransactionOTPEmail] Error sending OTP email:', error);
      return false;
    }
  }

  async sendMaxAttemptsAlert(email: string, walletAddress: string): Promise<boolean> {
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const shortWallet = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>TBURN 보안 알림</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #141414; border-radius: 16px; border: 1px solid #991b1b;">
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #333;">
              <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 12px 24px; border-radius: 8px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">🔐 보안 알림</span>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #dc2626; margin: 0 0 24px 0; font-size: 24px; text-align: center;">
                OTP 인증 시도 초과
              </h1>
              
              <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                지갑 <strong style="color: #f97316;">${shortWallet}</strong>에서 OTP 인증 시도가 최대 횟수를 초과했습니다.
              </p>

              <div style="background-color: #7f1d1d30; border: 1px solid #991b1b; border-radius: 8px; padding: 20px;">
                <p style="color: #fca5a5; margin: 0; font-size: 14px;">
                  본인이 시도하지 않은 경우, 즉시 지갑 보안을 확인하고 필요시 소셜 복구를 진행하세요.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px; background-color: #0d0d0d; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #555; font-size: 12px; margin: 0;">
                © 2026 TBURN Blockchain. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const { error } = await client.emails.send({
        from: fromEmail,
        to: email,
        subject: '[TBURN] 보안 알림: OTP 인증 시도 초과',
        html,
      });

      if (error) {
        console.error('[TransactionOTPEmail] Failed to send alert email:', error);
        return false;
      }

      console.log(`[TransactionOTPEmail] Max attempts alert sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[TransactionOTPEmail] Error sending alert email:', error);
      return false;
    }
  }

  private getTransactionTypeKorean(type: string): string {
    const types: Record<string, string> = {
      'TRANSFER': '토큰 전송',
      'SWAP': '토큰 스왑',
      'STAKE': '스테이킹',
      'UNSTAKE': '언스테이킹',
      'BRIDGE': '브릿지 전송',
      'CONTRACT_CALL': '컨트랙트 호출',
    };
    return types[type] || type;
  }
}

export const transactionOTPEmailService = TransactionOTPEmailService.getInstance();
export default transactionOTPEmailService;
