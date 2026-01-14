/**
 * TBURN Enterprise Validator Node - GCP Configuration
 * Production-grade configuration for Google Cloud deployment
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    Google Cloud Platform                        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  ┌───────────────────┐      ┌───────────────────────────────┐  │
 * │  │  Validator Node   │      │      Signer Service           │  │
 * │  │  (Compute Engine) │──────│  (Isolated Compute Engine)   │  │
 * │  │                   │ mTLS │                               │  │
 * │  │  - Block proposal │──────│  - Private key storage        │  │
 * │  │  - Attestation    │      │  - GCP Secret Manager         │  │
 * │  │  - P2P networking │      │  - HSM integration            │  │
 * │  └───────────────────┘      └───────────────────────────────┘  │
 * │           │                              │                      │
 * │           │                              │                      │
 * │  ┌────────▼────────┐          ┌─────────▼──────────┐           │
 * │  │  Cloud Armor    │          │  Secret Manager    │           │
 * │  │  (DDoS protect) │          │  (Key storage)     │           │
 * │  └─────────────────┘          └────────────────────┘           │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * Chain ID: 5800 | TBURN Mainnet
 */

export interface GCPValidatorConfig {
  projectId: string;
  region: string;
  zone: string;
  validatorNode: ValidatorNodeConfig;
  signerService: SignerServiceConfig;
  networking: NetworkingConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

export interface ValidatorNodeConfig {
  instanceName: string;
  machineType: string;
  diskSizeGb: number;
  diskType: 'pd-ssd' | 'pd-balanced' | 'pd-standard';
  networkTags: string[];
  serviceAccount: string;
  labels: Record<string, string>;
  preemptible: boolean;
}

export interface SignerServiceConfig {
  instanceName: string;
  machineType: string;
  diskSizeGb: number;
  networkTags: string[];
  serviceAccount: string;
  secretManagerPrefix: string;
  enableHsm: boolean;
  hsmKeyRingId?: string;
  hsmCryptoKeyId?: string;
}

export interface NetworkingConfig {
  vpcNetwork: string;
  subnetwork: string;
  internalIpOnly: boolean;
  enableCloudNat: boolean;
  firewallRules: FirewallRule[];
  loadBalancer?: LoadBalancerConfig;
}

export interface FirewallRule {
  name: string;
  direction: 'INGRESS' | 'EGRESS';
  priority: number;
  sourceRanges?: string[];
  targetTags: string[];
  allowed: { protocol: string; ports: string[] }[];
}

export interface LoadBalancerConfig {
  enabled: boolean;
  type: 'INTERNAL' | 'EXTERNAL';
  healthCheckPath: string;
  healthCheckPort: number;
}

export interface MonitoringConfig {
  enableStackdriver: boolean;
  enableCloudTrace: boolean;
  alertPolicies: AlertPolicy[];
  logRetentionDays: number;
  customMetrics: CustomMetric[];
}

export interface AlertPolicy {
  name: string;
  condition: string;
  threshold: number;
  duration: string;
  notificationChannels: string[];
}

export interface CustomMetric {
  name: string;
  type: 'gauge' | 'counter' | 'histogram';
  description: string;
  labels: string[];
}

export interface SecurityConfig {
  enableShieldedVm: boolean;
  enableSecureBoot: boolean;
  enableVtpm: boolean;
  enableIntegrityMonitoring: boolean;
  osLoginEnabled: boolean;
  iamBindings: IamBinding[];
}

export interface IamBinding {
  role: string;
  members: string[];
}

// ============================================
// PRODUCTION CONFIGURATION
// ============================================

export const PRODUCTION_CONFIG: GCPValidatorConfig = {
  projectId: process.env.GCP_PROJECT_ID || 'tburn-mainnet-prod',
  region: process.env.GCP_REGION || 'asia-northeast3',
  zone: process.env.GCP_ZONE || 'asia-northeast3-a',

  validatorNode: {
    instanceName: 'tburn-validator-node-001',
    machineType: 'n2-standard-8',
    diskSizeGb: 500,
    diskType: 'pd-ssd',
    networkTags: ['tburn-validator', 'allow-p2p', 'allow-rpc'],
    serviceAccount: 'tburn-validator@tburn-mainnet-prod.iam.gserviceaccount.com',
    labels: {
      'environment': 'production',
      'component': 'validator',
      'chain': 'tburn-mainnet',
      'chain-id': '5800'
    },
    preemptible: false
  },

  signerService: {
    instanceName: 'tburn-signer-service-001',
    machineType: 'n2-standard-4',
    diskSizeGb: 100,
    networkTags: ['tburn-signer', 'internal-only'],
    serviceAccount: 'tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com',
    secretManagerPrefix: 'tburn-validator-',
    enableHsm: true,
    hsmKeyRingId: 'tburn-validator-keys',
    hsmCryptoKeyId: 'validator-signing-key'
  },

  networking: {
    vpcNetwork: 'tburn-mainnet-vpc',
    subnetwork: 'tburn-validators-subnet',
    internalIpOnly: false,
    enableCloudNat: true,
    firewallRules: [
      {
        name: 'allow-p2p',
        direction: 'INGRESS',
        priority: 1000,
        sourceRanges: ['0.0.0.0/0'],
        targetTags: ['tburn-validator'],
        allowed: [
          { protocol: 'tcp', ports: ['30303'] },
          { protocol: 'udp', ports: ['30303'] }
        ]
      },
      {
        name: 'allow-rpc',
        direction: 'INGRESS',
        priority: 1000,
        sourceRanges: ['10.0.0.0/8'],
        targetTags: ['tburn-validator'],
        allowed: [
          { protocol: 'tcp', ports: ['8545', '8546'] }
        ]
      },
      {
        name: 'allow-signer-internal',
        direction: 'INGRESS',
        priority: 900,
        sourceRanges: ['10.0.1.0/24'],
        targetTags: ['tburn-signer'],
        allowed: [
          { protocol: 'tcp', ports: ['8443'] }
        ]
      },
      {
        name: 'deny-signer-external',
        direction: 'INGRESS',
        priority: 800,
        sourceRanges: ['0.0.0.0/0'],
        targetTags: ['tburn-signer'],
        allowed: []
      }
    ],
    loadBalancer: {
      enabled: true,
      type: 'INTERNAL',
      healthCheckPath: '/health',
      healthCheckPort: 8080
    }
  },

  monitoring: {
    enableStackdriver: true,
    enableCloudTrace: true,
    logRetentionDays: 365,
    alertPolicies: [
      {
        name: 'validator-offline',
        condition: 'uptime_check_failed',
        threshold: 1,
        duration: '60s',
        notificationChannels: ['pagerduty', 'slack']
      },
      {
        name: 'high-block-miss-rate',
        condition: 'block_miss_rate > threshold',
        threshold: 0.01,
        duration: '300s',
        notificationChannels: ['slack']
      },
      {
        name: 'signer-latency-high',
        condition: 'signing_latency_p99 > threshold',
        threshold: 100,
        duration: '60s',
        notificationChannels: ['slack']
      },
      {
        name: 'memory-usage-critical',
        condition: 'memory_usage > threshold',
        threshold: 0.9,
        duration: '300s',
        notificationChannels: ['pagerduty']
      }
    ],
    customMetrics: [
      {
        name: 'tburn/validator/blocks_proposed',
        type: 'counter',
        description: 'Number of blocks proposed by validator',
        labels: ['validator_address', 'tier']
      },
      {
        name: 'tburn/validator/attestations_made',
        type: 'counter',
        description: 'Number of attestations made by validator',
        labels: ['validator_address', 'epoch']
      },
      {
        name: 'tburn/signer/signing_latency',
        type: 'histogram',
        description: 'Signing request latency in milliseconds',
        labels: ['operation_type', 'validator_address']
      },
      {
        name: 'tburn/validator/peer_count',
        type: 'gauge',
        description: 'Number of connected peers',
        labels: ['validator_address']
      }
    ]
  },

  security: {
    enableShieldedVm: true,
    enableSecureBoot: true,
    enableVtpm: true,
    enableIntegrityMonitoring: true,
    osLoginEnabled: true,
    iamBindings: [
      {
        role: 'roles/secretmanager.secretAccessor',
        members: ['serviceAccount:tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com']
      },
      {
        role: 'roles/cloudkms.cryptoKeyDecrypter',
        members: ['serviceAccount:tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com']
      },
      {
        role: 'roles/logging.logWriter',
        members: [
          'serviceAccount:tburn-validator@tburn-mainnet-prod.iam.gserviceaccount.com',
          'serviceAccount:tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com'
        ]
      },
      {
        role: 'roles/monitoring.metricWriter',
        members: [
          'serviceAccount:tburn-validator@tburn-mainnet-prod.iam.gserviceaccount.com',
          'serviceAccount:tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com'
        ]
      }
    ]
  }
};

// ============================================
// TESTNET CONFIGURATION
// ============================================

export const TESTNET_CONFIG: GCPValidatorConfig = {
  ...PRODUCTION_CONFIG,
  projectId: process.env.GCP_PROJECT_ID || 'tburn-testnet',
  
  validatorNode: {
    ...PRODUCTION_CONFIG.validatorNode,
    instanceName: 'tburn-validator-testnet-001',
    machineType: 'n2-standard-4',
    diskSizeGb: 200,
    labels: {
      'environment': 'testnet',
      'component': 'validator',
      'chain': 'tburn-testnet',
      'chain-id': '5801'
    },
    preemptible: true
  },

  signerService: {
    ...PRODUCTION_CONFIG.signerService,
    instanceName: 'tburn-signer-testnet-001',
    machineType: 'n2-standard-2',
    enableHsm: false
  }
};

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

export interface ValidatorEnvVars {
  TBURN_CHAIN_ID: string;
  TBURN_NETWORK: 'mainnet' | 'testnet';
  VALIDATOR_ADDRESS: string;
  VALIDATOR_PUBLIC_KEY: string;
  SIGNER_ENDPOINT: string;
  SIGNER_CA_CERT_PATH: string;
  CLIENT_CERT_PATH: string;
  CLIENT_KEY_PATH: string;
  P2P_PORT: string;
  RPC_PORT: string;
  WS_PORT: string;
  METRICS_PORT: string;
  GCP_PROJECT_ID: string;
  GCP_REGION: string;
  ENABLE_CLOUD_LOGGING: string;
  ENABLE_CLOUD_MONITORING: string;
  LOG_LEVEL: string;
}

export const getValidatorEnvVars = (
  validatorAddress: string,
  publicKey: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): ValidatorEnvVars => ({
  TBURN_CHAIN_ID: network === 'mainnet' ? '5800' : '5801',
  TBURN_NETWORK: network,
  VALIDATOR_ADDRESS: validatorAddress,
  VALIDATOR_PUBLIC_KEY: publicKey,
  SIGNER_ENDPOINT: 'https://signer.internal.tburn.network:8443',
  SIGNER_CA_CERT_PATH: '/etc/tburn/certs/ca.crt',
  CLIENT_CERT_PATH: '/etc/tburn/certs/client.crt',
  CLIENT_KEY_PATH: '/etc/tburn/certs/client.key',
  P2P_PORT: '30303',
  RPC_PORT: '8545',
  WS_PORT: '8546',
  METRICS_PORT: '8080',
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || 'tburn-mainnet-prod',
  GCP_REGION: process.env.GCP_REGION || 'asia-northeast3',
  ENABLE_CLOUD_LOGGING: 'true',
  ENABLE_CLOUD_MONITORING: 'true',
  LOG_LEVEL: network === 'mainnet' ? 'info' : 'debug'
});

// ============================================
// EXPORT DEFAULT
// ============================================

export const getConfig = (network: 'mainnet' | 'testnet' = 'mainnet'): GCPValidatorConfig => {
  return network === 'mainnet' ? PRODUCTION_CONFIG : TESTNET_CONFIG;
};

export default PRODUCTION_CONFIG;
