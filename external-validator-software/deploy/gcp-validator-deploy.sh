#!/bin/bash
#
# TBURN Validator GCP Deployment Script
# Deploys validator node and signer service to Google Cloud Platform
#
# Usage: ./gcp-validator-deploy.sh [mainnet|testnet] [validator-name]
#
# Prerequisites:
# - Google Cloud SDK (gcloud) installed and authenticated
# - Project permissions: Compute Engine, Secret Manager, VPC Network
# - Environment variables set in .env file
#

set -e

NETWORK="${1:-mainnet}"
VALIDATOR_NAME="${2:-tburn-validator-001}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Load environment
if [ -f ".env" ]; then
    source .env
else
    log_error ".env file not found. Please copy from config/mainnet.env.example"
fi

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-tburn-mainnet-prod}"
REGION="${GCP_REGION:-asia-northeast3}"
ZONE="${GCP_ZONE:-asia-northeast3-a}"
VALIDATOR_MACHINE_TYPE="n2-standard-4"
SIGNER_MACHINE_TYPE="n2-standard-2"
VPC_NAME="tburn-validator-vpc"
SUBNET_NAME="tburn-validator-subnet"

log_info "╔══════════════════════════════════════════════════════════════╗"
log_info "║     TBURN Validator GCP Deployment                          ║"
log_info "╚══════════════════════════════════════════════════════════════╝"
log_info "Network: $NETWORK"
log_info "Validator: $VALIDATOR_NAME"
log_info "Project: $PROJECT_ID"
log_info "Region: $REGION"
log_info "Zone: $ZONE"
echo ""

# Step 1: Verify GCP authentication
log_info "Step 1: Verifying GCP authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    log_error "Not authenticated with GCP. Run 'gcloud auth login'"
fi
ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
log_success "Authenticated as: $ACCOUNT"

# Step 2: Set project
log_info "Step 2: Setting project..."
gcloud config set project $PROJECT_ID 2>/dev/null || log_error "Failed to set project"
log_success "Project set: $PROJECT_ID"

# Step 3: Create VPC Network (if not exists)
log_info "Step 3: Creating VPC network..."
if ! gcloud compute networks describe $VPC_NAME --project=$PROJECT_ID >/dev/null 2>&1; then
    gcloud compute networks create $VPC_NAME \
        --project=$PROJECT_ID \
        --subnet-mode=custom \
        --bgp-routing-mode=regional
    log_success "VPC created: $VPC_NAME"
else
    log_warn "VPC already exists: $VPC_NAME"
fi

# Step 4: Create Subnet
log_info "Step 4: Creating subnet..."
if ! gcloud compute networks subnets describe $SUBNET_NAME --project=$PROJECT_ID --region=$REGION >/dev/null 2>&1; then
    gcloud compute networks subnets create $SUBNET_NAME \
        --project=$PROJECT_ID \
        --network=$VPC_NAME \
        --region=$REGION \
        --range=10.0.0.0/24 \
        --enable-private-ip-google-access
    log_success "Subnet created: $SUBNET_NAME"
else
    log_warn "Subnet already exists: $SUBNET_NAME"
fi

# Step 5: Create Firewall Rules
log_info "Step 5: Creating firewall rules..."

# Allow P2P traffic
gcloud compute firewall-rules create ${VPC_NAME}-allow-p2p \
    --project=$PROJECT_ID \
    --network=$VPC_NAME \
    --allow=tcp:30303,udp:30303 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=tburn-validator \
    --description="Allow P2P traffic" 2>/dev/null || true

# Allow internal traffic (signer communication)
gcloud compute firewall-rules create ${VPC_NAME}-allow-internal \
    --project=$PROJECT_ID \
    --network=$VPC_NAME \
    --allow=tcp:8443 \
    --source-ranges=10.0.0.0/24 \
    --target-tags=tburn-signer \
    --description="Allow internal signer traffic" 2>/dev/null || true

# Allow metrics/health (internal only)
gcloud compute firewall-rules create ${VPC_NAME}-allow-metrics \
    --project=$PROJECT_ID \
    --network=$VPC_NAME \
    --allow=tcp:8080 \
    --source-ranges=10.0.0.0/24 \
    --target-tags=tburn-validator \
    --description="Allow metrics traffic" 2>/dev/null || true

log_success "Firewall rules configured"

# Step 6: Store private key in Secret Manager
log_info "Step 6: Storing private key in Secret Manager..."
SECRET_NAME="${VALIDATOR_NAME}-private-key"

if [ -z "$VALIDATOR_PRIVATE_KEY" ]; then
    log_error "VALIDATOR_PRIVATE_KEY not set in .env"
fi

echo -n "$VALIDATOR_PRIVATE_KEY" | gcloud secrets create $SECRET_NAME \
    --project=$PROJECT_ID \
    --replication-policy="automatic" \
    --data-file=- 2>/dev/null || \
echo -n "$VALIDATOR_PRIVATE_KEY" | gcloud secrets versions add $SECRET_NAME \
    --project=$PROJECT_ID \
    --data-file=-

log_success "Private key stored in Secret Manager: $SECRET_NAME"

# Step 7: Create Signer Service VM
log_info "Step 7: Creating Signer Service VM..."
SIGNER_VM_NAME="${VALIDATOR_NAME}-signer"

gcloud compute instances create $SIGNER_VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=$SIGNER_MACHINE_TYPE \
    --network=$VPC_NAME \
    --subnet=$SUBNET_NAME \
    --no-address \
    --tags=tburn-signer \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=50GB \
    --boot-disk-type=pd-ssd \
    --metadata=startup-script='#!/bin/bash
        apt-get update
        apt-get install -y nodejs npm
        npm install -g tsx typescript
        echo "Signer service initialized"
    ' 2>/dev/null || log_warn "Signer VM already exists"

log_success "Signer VM created: $SIGNER_VM_NAME"

# Step 8: Create Validator Node VM
log_info "Step 8: Creating Validator Node VM..."
VALIDATOR_VM_NAME="${VALIDATOR_NAME}-node"

gcloud compute instances create $VALIDATOR_VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=$VALIDATOR_MACHINE_TYPE \
    --network=$VPC_NAME \
    --subnet=$SUBNET_NAME \
    --tags=tburn-validator \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=200GB \
    --boot-disk-type=pd-ssd \
    --metadata=startup-script='#!/bin/bash
        apt-get update
        apt-get install -y nodejs npm
        npm install -g tsx typescript
        echo "Validator node initialized"
    ' 2>/dev/null || log_warn "Validator VM already exists"

log_success "Validator VM created: $VALIDATOR_VM_NAME"

# Step 9: Get internal IPs
log_info "Step 9: Retrieving internal IPs..."
SIGNER_IP=$(gcloud compute instances describe $SIGNER_VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --format='get(networkInterfaces[0].networkIP)' 2>/dev/null)

VALIDATOR_IP=$(gcloud compute instances describe $VALIDATOR_VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --format='get(networkInterfaces[0].networkIP)' 2>/dev/null)

log_success "Signer IP: $SIGNER_IP"
log_success "Validator IP: $VALIDATOR_IP"

# Step 10: Generate summary
echo ""
log_info "╔══════════════════════════════════════════════════════════════╗"
log_info "║     Deployment Complete!                                     ║"
log_info "╚══════════════════════════════════════════════════════════════╝"
echo ""
log_success "VPC Network: $VPC_NAME"
log_success "Subnet: $SUBNET_NAME (10.0.0.0/24)"
log_success "Signer VM: $SIGNER_VM_NAME ($SIGNER_IP)"
log_success "Validator VM: $VALIDATOR_VM_NAME ($VALIDATOR_IP)"
log_success "Secret: $SECRET_NAME"
echo ""
log_info "Next Steps:"
log_info "1. SSH to signer VM: gcloud compute ssh $SIGNER_VM_NAME --zone=$ZONE"
log_info "2. Deploy signer service: ./deploy-signer.sh"
log_info "3. SSH to validator VM: gcloud compute ssh $VALIDATOR_VM_NAME --zone=$ZONE"
log_info "4. Deploy validator: ./deploy-validator.sh"
log_info "5. Start monitoring: ./start-monitoring.sh"
echo ""
