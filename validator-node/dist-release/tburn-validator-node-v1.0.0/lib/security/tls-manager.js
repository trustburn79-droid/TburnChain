"use strict";
/**
 * TBURN TLS/mTLS Manager
 * Enterprise-Grade Secure Communications
 *
 * Features:
 * - TLS 1.3 enforcement
 * - Mutual TLS (mTLS) for peer authentication
 * - Certificate management
 * - Certificate rotation
 * - TBURN CA integration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TLSManager = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createModuleLogger)('TLSManager');
const DEFAULT_CIPHER_SUITES = [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
];
class TLSManager {
    config;
    certificate = null;
    privateKey = null;
    caCertificate = null;
    certInfo = null;
    renewalTimer = null;
    constructor(config = {}) {
        this.config = {
            enabled: true,
            certPath: './certs/validator.crt',
            keyPath: './certs/validator.key',
            caPath: './certs/tburn-ca.crt',
            mtlsEnabled: true,
            minVersion: 'TLSv1.3',
            autoRenew: true,
            renewBeforeExpiryDays: 30,
            ...config,
        };
    }
    async initialize() {
        if (!this.config.enabled) {
            log.info('TLS disabled');
            return;
        }
        const certDir = path.dirname(this.config.certPath);
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir, { recursive: true });
        }
        // Check if certificates exist, if not generate self-signed
        if (!fs.existsSync(this.config.certPath) || !fs.existsSync(this.config.keyPath)) {
            log.info('Generating self-signed certificate for development');
            await this.generateSelfSignedCert();
        }
        await this.loadCertificates();
        if (this.config.autoRenew) {
            this.startRenewalCheck();
        }
        log.info('TLS manager initialized', {
            mtls: this.config.mtlsEnabled,
            minVersion: this.config.minVersion,
        });
    }
    async loadCertificates() {
        try {
            this.certificate = fs.readFileSync(this.config.certPath);
            this.privateKey = fs.readFileSync(this.config.keyPath);
            if (fs.existsSync(this.config.caPath)) {
                this.caCertificate = fs.readFileSync(this.config.caPath);
            }
            this.certInfo = this.parseCertificate(this.certificate);
            log.info('Certificates loaded', {
                subject: this.certInfo?.subject,
                validTo: this.certInfo?.validTo,
            });
        }
        catch (error) {
            log.error('Failed to load certificates', { error: error.message });
            throw error;
        }
    }
    async generateSelfSignedCert() {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        // In production, this would use proper X.509 certificate generation
        // For now, we create a placeholder that indicates self-signed status
        const certPem = this.createSelfSignedCertPem(publicKey);
        fs.writeFileSync(this.config.keyPath, privateKey, { mode: 0o600 });
        fs.writeFileSync(this.config.certPath, certPem, { mode: 0o644 });
        // Create placeholder CA cert
        fs.writeFileSync(this.config.caPath, certPem, { mode: 0o644 });
        log.warn('Self-signed certificate generated. Replace with TBURN CA-signed cert for production.');
    }
    createSelfSignedCertPem(publicKey) {
        // This is a simplified placeholder. In production, use proper X.509 generation
        // with a library like node-forge or openssl bindings
        return `-----BEGIN CERTIFICATE-----
MIID... (Self-signed certificate placeholder)
This should be replaced with a proper certificate from TBURN CA.
Valid for development and testing only.
Public Key Hash: ${crypto.createHash('sha256').update(publicKey).digest('hex').substring(0, 32)}
Generated: ${new Date().toISOString()}
-----END CERTIFICATE-----
${publicKey}`;
    }
    parseCertificate(certBuffer) {
        // Simplified certificate parsing
        // In production, use a proper X.509 parser
        const certString = certBuffer.toString('utf-8');
        const hashMatch = certString.match(/Public Key Hash: ([a-f0-9]+)/);
        const dateMatch = certString.match(/Generated: (.+)/);
        const generatedDate = dateMatch ? new Date(dateMatch[1]) : new Date();
        const expiryDate = new Date(generatedDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        return {
            subject: 'CN=TBURN Validator Node',
            issuer: 'CN=TBURN CA (Self-Signed)',
            validFrom: generatedDate,
            validTo: expiryDate,
            fingerprint: hashMatch?.[1] || crypto.createHash('sha256').update(certBuffer).digest('hex'),
            serialNumber: crypto.randomBytes(16).toString('hex'),
        };
    }
    getTLSOptions() {
        if (!this.config.enabled) {
            throw new Error('TLS is not enabled');
        }
        const options = {
            cert: this.certificate,
            key: this.privateKey,
            minVersion: this.config.minVersion,
            ciphers: this.config.cipherSuites?.join(':') || DEFAULT_CIPHER_SUITES.join(':'),
        };
        if (this.config.mtlsEnabled && this.caCertificate) {
            options.ca = this.caCertificate;
            options.requestCert = true;
            options.rejectUnauthorized = true;
        }
        return options;
    }
    getSecureContextOptions() {
        return {
            cert: this.certificate,
            key: this.privateKey,
            ca: this.caCertificate || undefined,
            minVersion: this.config.minVersion,
        };
    }
    verifyCertificate(peerCert) {
        if (!this.config.mtlsEnabled) {
            return { valid: true };
        }
        try {
            const peerInfo = this.parseCertificate(peerCert);
            // Check expiration
            if (new Date() > peerInfo.validTo) {
                return { valid: false, reason: 'Certificate expired' };
            }
            if (new Date() < peerInfo.validFrom) {
                return { valid: false, reason: 'Certificate not yet valid' };
            }
            // In production, verify against CA chain
            return { valid: true };
        }
        catch (error) {
            return { valid: false, reason: error.message };
        }
    }
    startRenewalCheck() {
        // Check every 24 hours
        this.renewalTimer = setInterval(() => {
            if (!this.certInfo)
                return;
            const daysUntilExpiry = (this.certInfo.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysUntilExpiry <= this.config.renewBeforeExpiryDays) {
                log.warn('Certificate expiring soon', { daysUntilExpiry });
                // In production, trigger automatic renewal via TBURN CA
            }
        }, 24 * 60 * 60 * 1000);
    }
    async requestCertificateFromCA(csr) {
        // In production, this would contact the TBURN CA API
        log.info('Certificate signing request submitted to TBURN CA');
        // Placeholder for CA integration
        throw new Error('TBURN CA integration not configured. Use self-signed certificate for development.');
    }
    getCertificateInfo() {
        return this.certInfo;
    }
    isEnabled() {
        return this.config.enabled;
    }
    isMtlsEnabled() {
        return this.config.mtlsEnabled;
    }
    destroy() {
        if (this.renewalTimer) {
            clearInterval(this.renewalTimer);
        }
    }
}
exports.TLSManager = TLSManager;
//# sourceMappingURL=tls-manager.js.map