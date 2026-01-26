/**
 * Public Endpoint Rate Limiter
 * 공개 POST 엔드포인트에 대한 Rate Limiting 및 Anti-Spam 보호
 * 
 * 보안 기능:
 * - IP 기반 Rate Limiting
 * - 윈도우 기반 요청 제한
 * - 자동 정리 (메모리 누수 방지)
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, value] of entries) {
    if (value.resetTime < now && (!value.blockUntil || value.blockUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * 공개 엔드포인트용 Rate Limiter (엄격)
 * - 10분당 10회 요청 제한
 * - 스팸 방지
 */
export const publicSubmitLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 10;
  const blockDuration = 30 * 60 * 1000;

  const ip = getClientIP(req);
  const key = `public:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (record?.blocked && record.blockUntil && record.blockUntil > now) {
    res.status(429).json({
      error: 'Too many requests',
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: Math.ceil((record.blockUntil - now) / 1000)
    });
    return;
  }

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs, blocked: false });
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString());
    return next();
  }

  if (record.count >= maxRequests) {
    record.blocked = true;
    record.blockUntil = now + blockDuration;
    console.warn(`[RateLimit] IP ${ip} blocked for excessive public endpoint requests`);
    res.status(429).json({
      error: 'Too many requests',
      message: '요청 한도를 초과했습니다. 30분 후 다시 시도해주세요.',
      retryAfter: Math.ceil(blockDuration / 1000)
    });
    return;
  }

  record.count++;
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - record.count).toString());
  next();
};

/**
 * 뉴스레터 구독용 Rate Limiter (완화)
 * - 1시간당 5회 요청 제한
 */
export const newsletterLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 5;

  const ip = getClientIP(req);
  const key = `newsletter:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs, blocked: false });
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString());
    return next();
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      error: 'Too many requests',
      message: '구독 요청 한도를 초과했습니다. 나중에 다시 시도해주세요.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
    return;
  }

  record.count++;
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - record.count).toString());
  next();
};

/**
 * 버그 바운티 제출용 Rate Limiter
 * - 24시간당 5회 제한
 */
export const bugBountyLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const windowMs = 24 * 60 * 60 * 1000;
  const maxRequests = 5;

  const ip = getClientIP(req);
  const key = `bugbounty:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs, blocked: false });
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString());
    return next();
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      error: 'Too many requests',
      message: '버그 리포트 제출 한도를 초과했습니다. 24시간 후 다시 시도해주세요.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
    return;
  }

  record.count++;
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - record.count).toString());
  next();
};

export { getClientIP };
