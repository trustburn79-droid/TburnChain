/**
 * Public Endpoint Zod Schemas
 * 공개 POST 엔드포인트 입력 검증 스키마
 * 
 * 보안 기능:
 * - 엄격한 입력 검증
 * - XSS/인젝션 방지를 위한 문자열 정규화
 * - 필수 필드 및 형식 검증
 */

import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const walletAddressRegex = /^(tb1|tburn|0x)[a-zA-Z0-9]{20,64}$/;

const sanitizeString = (str: string) => str.trim().slice(0, 10000);
const sanitizeShortString = (str: string) => str.trim().slice(0, 500);
const sanitizeName = (str: string) => str.trim().slice(0, 100);

export const bugBountySchema = z.object({
  reporterEmail: z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .max(255)
    .optional()
    .transform(v => v?.toLowerCase().trim()),
  reporterWallet: z.string()
    .regex(walletAddressRegex, '올바른 지갑 주소 형식이 아닙니다')
    .optional()
    .transform(v => v?.trim()),
  reporterName: z.string()
    .max(100)
    .optional()
    .transform(v => v ? sanitizeName(v) : undefined),
  title: z.string()
    .min(5, '제목은 최소 5자 이상이어야 합니다')
    .max(200, '제목은 200자를 초과할 수 없습니다')
    .transform(sanitizeShortString),
  description: z.string()
    .min(20, '설명은 최소 20자 이상이어야 합니다')
    .max(10000, '설명은 10000자를 초과할 수 없습니다')
    .transform(sanitizeString),
  reproductionSteps: z.string()
    .max(5000)
    .optional()
    .transform(v => v ? sanitizeString(v) : undefined),
  assetTarget: z.enum(['smart_contracts', 'web_app', 'api', 'blockchain_core', 'wallet', 'other'])
    .optional()
    .default('smart_contracts'),
  reportedSeverity: z.enum(['critical', 'high', 'medium', 'low', 'informational'])
    .optional()
    .default('medium'),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .max(255)
    .transform(v => v.toLowerCase().trim()),
  source: z.string()
    .max(100)
    .optional()
    .transform(v => v ? sanitizeName(v) : undefined),
});

export const investmentInquirySchema = z.object({
  name: z.string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(100)
    .transform(sanitizeName),
  email: z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .max(255)
    .transform(v => v.toLowerCase().trim()),
  company: z.string()
    .max(200)
    .optional()
    .transform(v => v ? sanitizeName(v) : undefined),
  investmentAmount: z.string()
    .max(50)
    .optional()
    .transform(v => v ? sanitizeShortString(v) : undefined),
  message: z.string()
    .max(5000)
    .optional()
    .transform(v => v ? sanitizeString(v) : undefined),
  round: z.enum(['seed', 'private', 'strategic', 'public'])
    .optional()
    .default('seed'),
});

export const airdropClaimSchema = z.object({
  walletAddress: z.string()
    .regex(walletAddressRegex, '올바른 지갑 주소 형식이 아닙니다')
    .transform(v => v.trim()),
  claimId: z.union([z.string(), z.number()])
    .transform(v => typeof v === 'string' ? parseInt(v, 10) : v),
  signature: z.string()
    .max(500)
    .optional(),
});

export const referralApplySchema = z.object({
  newUserWallet: z.string()
    .regex(walletAddressRegex, '올바른 지갑 주소 형식이 아닙니다')
    .transform(v => v.trim()),
  referralCode: z.string()
    .min(6, '추천 코드는 최소 6자 이상이어야 합니다')
    .max(20)
    .transform(v => v.trim().toUpperCase()),
});

export const eventRegisterSchema = z.object({
  walletAddress: z.string()
    .regex(walletAddressRegex, '올바른 지갑 주소 형식이 아닙니다')
    .transform(v => v.trim()),
  eventId: z.union([z.string(), z.number()])
    .transform(v => typeof v === 'string' ? parseInt(v, 10) : v),
  email: z.string()
    .email()
    .max(255)
    .optional()
    .transform(v => v?.toLowerCase().trim()),
});

export const eventClaimSchema = z.object({
  walletAddress: z.string()
    .regex(walletAddressRegex, '올바른 지갑 주소 형식이 아닙니다')
    .transform(v => v.trim()),
  eventId: z.union([z.string(), z.number()])
    .transform(v => typeof v === 'string' ? parseInt(v, 10) : v),
});

export type BugBountyInput = z.infer<typeof bugBountySchema>;
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
export type InvestmentInquiryInput = z.infer<typeof investmentInquirySchema>;
export type AirdropClaimInput = z.infer<typeof airdropClaimSchema>;
export type ReferralApplyInput = z.infer<typeof referralApplySchema>;
export type EventRegisterInput = z.infer<typeof eventRegisterSchema>;
export type EventClaimInput = z.infer<typeof eventClaimSchema>;
