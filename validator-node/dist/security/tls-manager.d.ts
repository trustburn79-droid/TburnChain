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
import * as tls from 'tls';
export interface TLSConfig {
    enabled: boolean;
    certPath: string;
    keyPath: string;
    caPath: string;
    mtlsEnabled: boolean;
    minVersion: 'TLSv1.2' | 'TLSv1.3';
    cipherSuites?: string[];
    autoRenew: boolean;
    renewBeforeExpiryDays: number;
}
export interface CertificateInfo {
    subject: string;
    issuer: string;
    validFrom: Date;
    validTo: Date;
    fingerprint: string;
    serialNumber: string;
}
export declare class TLSManager {
    private config;
    private certificate;
    private privateKey;
    private caCertificate;
    private certInfo;
    private renewalTimer;
    constructor(config?: Partial<TLSConfig>);
    initialize(): Promise<void>;
    private loadCertificates;
    private generateSelfSignedCert;
    private createSelfSignedCertPem;
    private parseCertificate;
    getTLSOptions(): tls.TlsOptions;
    getSecureContextOptions(): tls.SecureContextOptions;
    verifyCertificate(peerCert: Buffer): {
        valid: boolean;
        reason?: string;
    };
    private startRenewalCheck;
    requestCertificateFromCA(csr: string): Promise<string>;
    getCertificateInfo(): CertificateInfo | null;
    isEnabled(): boolean;
    isMtlsEnabled(): boolean;
    destroy(): void;
}
//# sourceMappingURL=tls-manager.d.ts.map