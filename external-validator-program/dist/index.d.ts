/**
 * TBURN External Validator Node
 * Production-grade validator with Remote Signer integration and security modules
 *
 * Architecture:
 * - Validator node runs block production and attestation
 * - Private keys stored in isolated Signer Service (GCP Secret Manager)
 * - All signing requests sent via mTLS to Signer Service
 * - Advanced security: Rate limiting, anomaly detection, audit logging
 * - Hardware Security Module (HSM) ready
 *
 * Chain ID: 5800 | TBURN Mainnet | Target: 210,000 TPS
 */
export {};
//# sourceMappingURL=index.d.ts.map