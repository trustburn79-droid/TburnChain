# TBURN Validator Node - Google Cloud Deployment Guide

## Overview

This guide covers deploying TBURN Validator nodes on Google Cloud Platform with enterprise-grade security. The architecture separates the Validator Node from the Signer Service to ensure private keys never leave the isolated signing environment.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Google Cloud Platform                            │
│                                                                         │
│  ┌─────────────────────────┐         ┌─────────────────────────────┐   │
│  │     Validator Node      │  mTLS   │      Signer Service         │   │
│  │   (Compute Engine)      │◄───────►│  (Isolated Compute Engine)  │   │
│  │                         │         │                             │   │
│  │  • Block Proposal       │         │  • Private Key Storage      │   │
│  │  • Attestation          │         │  • GCP Secret Manager       │   │
│  │  • P2P Networking       │         │  • Cloud HSM Integration    │   │
│  │  • Transaction Pool     │         │  • Audit Logging            │   │
│  └─────────────────────────┘         └─────────────────────────────┘   │
│            │                                     │                      │
│            ▼                                     ▼                      │
│  ┌─────────────────┐                 ┌─────────────────────────┐       │
│  │   Cloud Armor   │                 │   Secret Manager        │       │
│  │  (DDoS Shield)  │                 │   (Encrypted Keys)      │       │
│  └─────────────────┘                 └─────────────────────────┘       │
│            │                                     │                      │
│            ▼                                     ▼                      │
│  ┌─────────────────┐                 ┌─────────────────────────┐       │
│  │ Cloud Monitoring│                 │     Cloud KMS / HSM     │       │
│  │   & Logging     │                 │  (Hardware Security)    │       │
│  └─────────────────┘                 └─────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **Validator Credentials**:
   - Validator Address (0x...)
   - Private Key (0x...)
   - Public Key (0x...)

## Step 1: Create GCP Project

```bash
# Create project
gcloud projects create tburn-mainnet-prod --name="TBURN Mainnet Production"

# Set project
gcloud config set project tburn-mainnet-prod

# Enable required APIs
gcloud services enable \
  compute.googleapis.com \
  secretmanager.googleapis.com \
  cloudkms.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  containerregistry.googleapis.com
```

## Step 2: Create VPC Network

```bash
# Create VPC
gcloud compute networks create tburn-mainnet-vpc \
  --subnet-mode=custom \
  --bgp-routing-mode=regional

# Create validator subnet
gcloud compute networks subnets create tburn-validators-subnet \
  --network=tburn-mainnet-vpc \
  --region=asia-northeast3 \
  --range=10.0.1.0/24

# Create signer subnet (isolated)
gcloud compute networks subnets create tburn-signer-subnet \
  --network=tburn-mainnet-vpc \
  --region=asia-northeast3 \
  --range=10.0.2.0/24 \
  --enable-private-ip-google-access
```

## Step 3: Configure Firewall Rules

```bash
# Allow P2P traffic (validators)
gcloud compute firewall-rules create allow-p2p \
  --network=tburn-mainnet-vpc \
  --allow=tcp:30303,udp:30303 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=tburn-validator

# Allow RPC (internal only)
gcloud compute firewall-rules create allow-rpc-internal \
  --network=tburn-mainnet-vpc \
  --allow=tcp:8545,tcp:8546 \
  --source-ranges=10.0.0.0/8 \
  --target-tags=tburn-validator

# Allow signer service (validator subnet only)
gcloud compute firewall-rules create allow-signer-internal \
  --network=tburn-mainnet-vpc \
  --allow=tcp:8443 \
  --source-ranges=10.0.1.0/24 \
  --target-tags=tburn-signer \
  --priority=900

# Deny all external to signer
gcloud compute firewall-rules create deny-signer-external \
  --network=tburn-mainnet-vpc \
  --direction=INGRESS \
  --action=DENY \
  --rules=all \
  --source-ranges=0.0.0.0/0 \
  --target-tags=tburn-signer \
  --priority=1000
```

## Step 4: Create Service Accounts

```bash
# Validator service account
gcloud iam service-accounts create tburn-validator \
  --display-name="TBURN Validator Node"

# Signer service account
gcloud iam service-accounts create tburn-signer \
  --display-name="TBURN Signer Service"

# Grant Secret Manager access to signer
gcloud projects add-iam-policy-binding tburn-mainnet-prod \
  --member="serviceAccount:tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant Cloud KMS access to signer
gcloud projects add-iam-policy-binding tburn-mainnet-prod \
  --member="serviceAccount:tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com" \
  --role="roles/cloudkms.cryptoKeyDecrypter"

# Grant logging/monitoring to both
for SA in tburn-validator tburn-signer; do
  gcloud projects add-iam-policy-binding tburn-mainnet-prod \
    --member="serviceAccount:${SA}@tburn-mainnet-prod.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"
  gcloud projects add-iam-policy-binding tburn-mainnet-prod \
    --member="serviceAccount:${SA}@tburn-mainnet-prod.iam.gserviceaccount.com" \
    --role="roles/monitoring.metricWriter"
done
```

## Step 5: Store Private Key in Secret Manager

```bash
# Create secret for validator private key
# IMPORTANT: Replace YOUR_PRIVATE_KEY with actual key
echo -n "0xYOUR_PRIVATE_KEY" | gcloud secrets create tburn-validator-001-key \
  --data-file=- \
  --replication-policy="user-managed" \
  --locations="asia-northeast3"

# Verify secret was created
gcloud secrets describe tburn-validator-001-key

# Add secret version (for key rotation)
echo -n "0xNEW_PRIVATE_KEY" | gcloud secrets versions add tburn-validator-001-key \
  --data-file=-
```

## Step 6: Create Cloud HSM Key Ring (Optional, Recommended)

```bash
# Create HSM key ring
gcloud kms keyrings create tburn-validator-keys \
  --location=asia-northeast3 \
  --purpose=encryption

# Create HSM crypto key
gcloud kms keys create validator-signing-key \
  --keyring=tburn-validator-keys \
  --location=asia-northeast3 \
  --purpose=asymmetric-signing \
  --default-algorithm=ec-sign-secp256k1-sha256 \
  --protection-level=hsm
```

## Step 7: Deploy Signer Service

```bash
# Create Signer VM (isolated, no external IP)
gcloud compute instances create tburn-signer-service-001 \
  --zone=asia-northeast3-a \
  --machine-type=n2-standard-4 \
  --subnet=tburn-signer-subnet \
  --no-address \
  --service-account=tburn-signer@tburn-mainnet-prod.iam.gserviceaccount.com \
  --scopes=cloud-platform \
  --tags=tburn-signer \
  --shielded-secure-boot \
  --shielded-vtpm \
  --shielded-integrity-monitoring \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=100GB \
  --boot-disk-type=pd-ssd \
  --metadata-from-file=startup-script=scripts/signer-startup.sh
```

## Step 8: Deploy Validator Node

```bash
# Create Validator VM
gcloud compute instances create tburn-validator-node-001 \
  --zone=asia-northeast3-a \
  --machine-type=n2-standard-8 \
  --subnet=tburn-validators-subnet \
  --service-account=tburn-validator@tburn-mainnet-prod.iam.gserviceaccount.com \
  --scopes=cloud-platform \
  --tags=tburn-validator,allow-p2p,allow-rpc \
  --shielded-secure-boot \
  --shielded-vtpm \
  --shielded-integrity-monitoring \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=500GB \
  --boot-disk-type=pd-ssd \
  --metadata-from-file=startup-script=scripts/validator-startup.sh
```

## Step 9: Configure Environment Variables

Create `.env.production` on the Validator Node:

```bash
# TBURN Network Configuration
TBURN_CHAIN_ID=5800
TBURN_NETWORK=mainnet

# Validator Identity
VALIDATOR_ADDRESS=0xYOUR_VALIDATOR_ADDRESS
VALIDATOR_PUBLIC_KEY=0xYOUR_PUBLIC_KEY

# Remote Signer Configuration
SIGNER_ENDPOINT=https://10.0.2.2:8443
SIGNER_CA_CERT_PATH=/etc/tburn/certs/ca.crt
CLIENT_CERT_PATH=/etc/tburn/certs/client.crt
CLIENT_KEY_PATH=/etc/tburn/certs/client.key

# Network Ports
P2P_PORT=30303
RPC_PORT=8545
WS_PORT=8546
METRICS_PORT=8080

# GCP Configuration
GCP_PROJECT_ID=tburn-mainnet-prod
GCP_REGION=asia-northeast3

# Monitoring
ENABLE_CLOUD_LOGGING=true
ENABLE_CLOUD_MONITORING=true
LOG_LEVEL=info
```

## Step 10: Generate TLS Certificates

```bash
# Generate CA certificate
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/CN=TBURN Validator CA/O=TBURN Network"

# Generate Signer server certificate
openssl genrsa -out signer.key 4096
openssl req -new -key signer.key -out signer.csr \
  -subj "/CN=tburn-signer.internal/O=TBURN Network"
openssl x509 -req -days 365 -in signer.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out signer.crt

# Generate Validator client certificate
openssl genrsa -out client.key 4096
openssl req -new -key client.key -out client.csr \
  -subj "/CN=tburn-validator-001/O=TBURN Network"
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out client.crt
```

## Step 11: Configure Monitoring Alerts

```bash
# Create notification channel (Slack)
gcloud alpha monitoring channels create \
  --display-name="TBURN Alerts - Slack" \
  --type=slack \
  --channel-labels=channel_name=#tburn-alerts

# Create uptime check
gcloud monitoring uptime create \
  --display-name="Validator Node Health" \
  --monitored-resource-type=gce_instance \
  --http-check-path="/health" \
  --http-check-port=8080 \
  --period=60

# Create alert policy for high latency
gcloud alpha monitoring policies create \
  --display-name="High Signing Latency" \
  --condition-filter='metric.type="custom.googleapis.com/tburn/signer/signing_latency"' \
  --condition-threshold-value=100 \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-duration=60s
```

## Troubleshooting

### Common Issues

1. **Signer Connection Failed**
   ```bash
   # Check signer VM is running
   gcloud compute instances describe tburn-signer-service-001 --zone=asia-northeast3-a
   
   # Check firewall rules
   gcloud compute firewall-rules list --filter="network:tburn-mainnet-vpc"
   
   # Test connectivity from validator
   curl -k https://10.0.2.2:8443/health
   ```

2. **Secret Access Denied**
   ```bash
   # Verify IAM bindings
   gcloud secrets get-iam-policy tburn-validator-001-key
   
   # Check service account permissions
   gcloud projects get-iam-policy tburn-mainnet-prod \
     --filter="bindings.members:tburn-signer@*"
   ```

3. **High Block Miss Rate**
   - Check network latency between validator and signer
   - Verify P2P connectivity
   - Review signing latency metrics

## Security Best Practices

1. **Key Rotation**: Rotate private keys every 90 days
2. **Audit Logs**: Enable Cloud Audit Logs for all operations
3. **VPC Service Controls**: Consider enabling for additional isolation
4. **IAM Conditions**: Add time-based conditions for access
5. **HSM**: Use Cloud HSM for hardware-backed key security

## Support

- TBURN Network Documentation: https://docs.tburn.network
- Validator Discord: https://discord.gg/tburn-validators
- Emergency Support: validators@tburn.network

---
**Chain ID**: 5800 | **TBURN Mainnet** | **Target TPS**: 210,000
