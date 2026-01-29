/**
 * CSP Nonce Middleware - Enterprise Security Hardening
 * 
 * Generates cryptographic nonces for Content Security Policy
 * to eliminate unsafe-inline/unsafe-eval while maintaining functionality.
 * 
 * @module csp-nonce
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Response {
      locals: {
        cspNonce?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Middleware to generate and attach CSP nonce to each request
 */
export function cspNonceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const nonce = generateNonce();
  res.locals.cspNonce = nonce;
  next();
}

/**
 * Inject nonce into HTML script tags
 * Handles both inline scripts and module scripts
 */
export function injectNonceIntoHtml(html: string, nonce: string): string {
  // Add nonce to inline scripts (without src attribute)
  let result = html.replace(
    /<script(?![^>]*\bsrc\b)([^>]*)>/gi,
    `<script nonce="${nonce}"$1>`
  );
  
  // Add nonce to module scripts with src
  result = result.replace(
    /<script\s+type="module"\s+src="([^"]+)"([^>]*)>/gi,
    `<script nonce="${nonce}" type="module" src="$1"$2>`
  );
  
  // Add nonce to regular scripts with src (not already processed)
  result = result.replace(
    /<script(?![^>]*nonce)([^>]*)\ssrc="([^"]+)"([^>]*)>/gi,
    `<script nonce="${nonce}"$1 src="$2"$3>`
  );
  
  return result;
}

/**
 * Get CSP directives with nonce
 * Enterprise-grade Content Security Policy configuration
 * 
 * @updated 2026-01-29 - Enhanced security headers
 */
export function getCspDirectivesWithNonce(nonce: string) {
  return {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"],
    styleSrc: ["'self'", `'nonce-${nonce}'`, "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    connectSrc: ["'self'", "wss:", "ws:", "https:"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: [],
    blockAllMixedContent: [],
    workerSrc: ["'self'", "blob:"],
    manifestSrc: ["'self'"],
    mediaSrc: ["'self'"],
  };
}

/**
 * Get additional security headers for production
 * These headers complement CSP for defense in depth
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

export default {
  generateNonce,
  cspNonceMiddleware,
  injectNonceIntoHtml,
  getCspDirectivesWithNonce,
  getSecurityHeaders,
};
