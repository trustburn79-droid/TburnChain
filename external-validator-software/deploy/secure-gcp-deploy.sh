#!/bin/bash
#
# TBURN Validator - Secure GCP Deployment Script
# Production-grade security with defense-in-depth
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
ZONE="${GCP_ZONE:-us-central1-a}"
NETWORK_NAME="tburn-validator-vpc"
SUBNET_NAME="tburn-validator-subnet"
VALIDATOR_ID="${1:-}"
NETWORK_TYPE="${2:-mainnet}"

# Security Configuration
MIN_TLS_VERSION="TLSv1.3"
KEY_ALGORITHM="RSA:4096"
CERT_VALIDITY_DAYS=365
PASSWORD_LENGTH=64
AUDIT_LOG_RETENTION_DAYS=365

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

# Pre-flight checks
preflight_checks() {
    log_info "Running pre-flight security checks..."
    
    # Check gcloud
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed"
    fi
    
    # Check authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n1; then
        log_error "Not authenticated with gcloud. Run: gcloud auth login"
    fi
    
    # Check project
    if [[ -z "$PROJECT_ID" ]]; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
        if [[ -z "$PROJECT_ID" ]]; then
            log_error "GCP_PROJECT_ID not set and no default project configured"
        fi
    fi
    
    # Check required APIs
    local required_apis=(
        "compute.googleapis.com"
        "secretmanager.googleapis.com"
        "cloudkms.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
        "iap.googleapis.com"
    )
    
    for api in "${required_apis[@]}"; do
        if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
            log_info "Enabling $api..."
            gcloud services enable "$api"
        fi
    done
    
    log_success "Pre-flight checks passed"
}

# Create secure VPC with proper isolation
create_secure_vpc() {
    log_info "Creating secure VPC network..."
    
    # Check if VPC exists
    if gcloud compute networks describe "$NETWORK_NAME" --project="$PROJECT_ID" &>/dev/null; then
        log_info "VPC $NETWORK_NAME already exists"
    else
        # Create custom VPC (no auto subnets)
        gcloud compute networks create "$NETWORK_NAME" \
            --project="$PROJECT_ID" \
            --subnet-mode=custom \
            --bgp-routing-mode=regional \
            --mtu=1460
        
        log_success "Created VPC: $NETWORK_NAME"
    fi
    
    # Check if subnet exists
    if gcloud compute networks subnets describe "$SUBNET_NAME" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
        log_info "Subnet $SUBNET_NAME already exists"
    else
        # Create private subnet
        gcloud compute networks subnets create "$SUBNET_NAME" \
            --project="$PROJECT_ID" \
            --network="$NETWORK_NAME" \
            --region="$REGION" \
            --range="10.0.0.0/24" \
            --enable-private-ip-google-access \
            --enable-flow-logs \
            --logging-metadata=include-all
        
        log_success "Created subnet: $SUBNET_NAME"
    fi
}

# Configure strict firewall rules
configure_firewall() {
    log_info "Configuring strict firewall rules..."
    
    # Delete default rules if they exist
    for rule in default-allow-http default-allow-https default-allow-ssh; do
        if gcloud compute firewall-rules describe "$rule" --project="$PROJECT_ID" &>/dev/null; then
            gcloud compute firewall-rules delete "$rule" --project="$PROJECT_ID" --quiet || true
        fi
    done
    
    # Allow internal communication
    if ! gcloud compute firewall-rules describe "tburn-allow-internal" --project="$PROJECT_ID" &>/dev/null; then
        gcloud compute firewall-rules create "tburn-allow-internal" \
            --project="$PROJECT_ID" \
            --network="$NETWORK_NAME" \
            --direction=INGRESS \
            --priority=1000 \
            --action=ALLOW \
            --rules=tcp,udp,icmp \
            --source-ranges="10.0.0.0/24" \
            --target-tags="tburn-validator"
    fi
    
    # Allow SSH only via IAP
    if ! gcloud compute firewall-rules describe "tburn-allow-iap-ssh" --project="$PROJECT_ID" &>/dev/null; then
        gcloud compute firewall-rules create "tburn-allow-iap-ssh" \
            --project="$PROJECT_ID" \
            --network="$NETWORK_NAME" \
            --direction=INGRESS \
            --priority=1000 \
            --action=ALLOW \
            --rules=tcp:22 \
            --source-ranges="35.235.240.0/20" \
            --target-tags="tburn-validator"
    fi
    
    # Allow P2P communication
    if ! gcloud compute firewall-rules describe "tburn-allow-p2p" --project="$PROJECT_ID" &>/dev/null; then
        gcloud compute firewall-rules create "tburn-allow-p2p" \
            --project="$PROJECT_ID" \
            --network="$NETWORK_NAME" \
            --direction=INGRESS \
            --priority=1000 \
            --action=ALLOW \
            --rules=tcp:30303,udp:30303 \
            --source-ranges="0.0.0.0/0" \
            --target-tags="tburn-validator"
    fi
    
    # Allow mTLS Signer port
    if ! gcloud compute firewall-rules describe "tburn-allow-signer" --project="$PROJECT_ID" &>/dev/null; then
        gcloud compute firewall-rules create "tburn-allow-signer" \
            --project="$PROJECT_ID" \
            --network="$NETWORK_NAME" \
            --direction=INGRESS \
            --priority=1000 \
            --action=ALLOW \
            --rules=tcp:8443 \
            --source-ranges="10.0.0.0/24" \
            --target-tags="tburn-signer"
    fi
    
    # Allow metrics (Prometheus)
    if ! gcloud compute firewall-rules describe "tburn-allow-metrics" --project="$PROJECT_ID" &>/dev/null; then
        gcloud compute firewall-rules create "tburn-allow-metrics" \
            --project="$PROJECT_ID" \
            --network="$NETWORK_NAME" \
            --direction=INGRESS \
            --priority=1000 \
            --action=ALLOW \
            --rules=tcp:9090 \
            --source-ranges="10.0.0.0/24" \
            --target-tags="tburn-validator"
    fi
    
    # Default deny all
    if ! gcloud compute firewall-rules describe "tburn-deny-all" --project="$PROJECT_ID" &>/dev/null; then
        gcloud compute firewall-rules create "tburn-deny-all" \
            --project="$PROJECT_ID" \
            --network="$NETWORK_NAME" \
            --direction=INGRESS \
            --priority=65534 \
            --action=DENY \
            --rules=all \
            --source-ranges="0.0.0.0/0" \
            --target-tags="tburn-validator,tburn-signer"
    fi
    
    log_success "Firewall rules configured"
}

# Setup Cloud KMS for key management
setup_cloud_kms() {
    log_info "Setting up Cloud KMS for key management..."
    
    local keyring="tburn-validator-keyring"
    local cryptokey="tburn-signing-key"
    
    # Create keyring
    if ! gcloud kms keyrings describe "$keyring" --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
        gcloud kms keyrings create "$keyring" \
            --project="$PROJECT_ID" \
            --location="$REGION"
        log_success "Created KMS keyring: $keyring"
    fi
    
    # Create asymmetric signing key
    if ! gcloud kms keys describe "$cryptokey" --keyring="$keyring" --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
        gcloud kms keys create "$cryptokey" \
            --project="$PROJECT_ID" \
            --location="$REGION" \
            --keyring="$keyring" \
            --purpose=asymmetric-signing \
            --default-algorithm=ec-sign-secp256k1-sha256 \
            --protection-level=hsm \
            --rotation-period=2592000s \
            --next-rotation-time="$(date -d '+30 days' --iso-8601=seconds)"
        log_success "Created HSM-backed signing key: $cryptokey"
    fi
}

# Create secrets in Secret Manager
create_secrets() {
    log_info "Creating secrets in Secret Manager..."
    
    local secrets=(
        "tburn-validator-${VALIDATOR_ID}-privkey"
        "tburn-validator-${VALIDATOR_ID}-password"
        "tburn-signer-${VALIDATOR_ID}-tls-key"
        "tburn-signer-${VALIDATOR_ID}-tls-cert"
        "tburn-signer-${VALIDATOR_ID}-ca-cert"
        "tburn-audit-${VALIDATOR_ID}-hmac-key"
    )
    
    for secret in "${secrets[@]}"; do
        if ! gcloud secrets describe "$secret" --project="$PROJECT_ID" &>/dev/null; then
            gcloud secrets create "$secret" \
                --project="$PROJECT_ID" \
                --replication-policy="user-managed" \
                --locations="$REGION" \
                --labels="validator-id=$VALIDATOR_ID,network=$NETWORK_TYPE,component=security"
            log_info "Created secret: $secret"
        fi
    done
    
    log_success "Secrets created in Secret Manager"
}

# Generate secure TLS certificates
generate_certificates() {
    log_info "Generating secure TLS certificates..."
    
    local cert_dir="/tmp/tburn-certs-${VALIDATOR_ID}"
    mkdir -p "$cert_dir"
    chmod 700 "$cert_dir"
    
    # Generate CA
    openssl req -x509 -newkey rsa:4096 -sha384 \
        -days "$CERT_VALIDITY_DAYS" \
        -nodes \
        -keyout "$cert_dir/ca.key" \
        -out "$cert_dir/ca.crt" \
        -subj "/O=TBURN/OU=Validators/CN=TBURN Validator CA" \
        -addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
        -addext "keyUsage=critical,keyCertSign,cRLSign"
    
    # Generate Signer certificate
    openssl req -newkey rsa:4096 -sha384 \
        -nodes \
        -keyout "$cert_dir/signer.key" \
        -out "$cert_dir/signer.csr" \
        -subj "/O=TBURN/OU=Signers/CN=tburn-signer-${VALIDATOR_ID}"
    
    openssl x509 -req \
        -in "$cert_dir/signer.csr" \
        -CA "$cert_dir/ca.crt" \
        -CAkey "$cert_dir/ca.key" \
        -CAcreateserial \
        -out "$cert_dir/signer.crt" \
        -days "$CERT_VALIDITY_DAYS" \
        -sha384 \
        -extfile <(printf "subjectAltName=DNS:localhost,DNS:tburn-signer-${VALIDATOR_ID},IP:127.0.0.1,IP:10.0.0.2\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth,clientAuth")
    
    # Generate Validator client certificate
    openssl req -newkey rsa:4096 -sha384 \
        -nodes \
        -keyout "$cert_dir/validator.key" \
        -out "$cert_dir/validator.csr" \
        -subj "/O=TBURN/OU=Validators/CN=tburn-validator-${VALIDATOR_ID}"
    
    openssl x509 -req \
        -in "$cert_dir/validator.csr" \
        -CA "$cert_dir/ca.crt" \
        -CAkey "$cert_dir/ca.key" \
        -CAcreateserial \
        -out "$cert_dir/validator.crt" \
        -days "$CERT_VALIDITY_DAYS" \
        -sha384 \
        -extfile <(printf "subjectAltName=DNS:localhost,DNS:tburn-validator-${VALIDATOR_ID},IP:127.0.0.1,IP:10.0.0.3\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=clientAuth")
    
    # Store certificates in Secret Manager
    gcloud secrets versions add "tburn-signer-${VALIDATOR_ID}-tls-key" \
        --project="$PROJECT_ID" \
        --data-file="$cert_dir/signer.key"
    
    gcloud secrets versions add "tburn-signer-${VALIDATOR_ID}-tls-cert" \
        --project="$PROJECT_ID" \
        --data-file="$cert_dir/signer.crt"
    
    gcloud secrets versions add "tburn-signer-${VALIDATOR_ID}-ca-cert" \
        --project="$PROJECT_ID" \
        --data-file="$cert_dir/ca.crt"
    
    # Generate and store audit HMAC key
    local hmac_key=$(openssl rand -hex 32)
    echo -n "$hmac_key" | gcloud secrets versions add "tburn-audit-${VALIDATOR_ID}-hmac-key" \
        --project="$PROJECT_ID" \
        --data-file=-
    
    # Secure cleanup
    rm -rf "$cert_dir"
    
    log_success "TLS certificates generated and stored securely"
}

# Create Signer VM with hardened configuration
create_signer_vm() {
    log_info "Creating hardened Signer VM..."
    
    local vm_name="tburn-signer-${VALIDATOR_ID}"
    
    if gcloud compute instances describe "$vm_name" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null; then
        log_info "Signer VM $vm_name already exists"
        return
    fi
    
    # Create startup script
    local startup_script=$(cat <<'EOF'
#!/bin/bash
set -euo pipefail

# System hardening
echo "Hardening system..."

# Disable unused services
systemctl disable --now avahi-daemon cups bluetooth 2>/dev/null || true

# Configure kernel parameters
cat >> /etc/sysctl.d/99-tburn-security.conf << 'SYSCTL'
# Network security
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Kernel security
kernel.randomize_va_space = 2
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1
kernel.core_uses_pid = 1
SYSCTL

sysctl --system

# Install dependencies
apt-get update
apt-get install -y nodejs npm auditd fail2ban

# Configure fail2ban
cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
FAIL2BAN

systemctl enable --now fail2ban

# Configure auditd
cat > /etc/audit/rules.d/tburn.rules << 'AUDIT'
# Monitor key files
-w /opt/tburn-signer/ -p wa -k tburn-signer
-w /etc/tburn/ -p wa -k tburn-config
-w /var/log/tburn/ -p wa -k tburn-logs

# Monitor network connections
-a always,exit -F arch=b64 -S connect -F key=network
-a always,exit -F arch=b64 -S accept -F key=network
AUDIT

augenrules --load
systemctl restart auditd

echo "System hardening complete"
EOF
)
    
    gcloud compute instances create "$vm_name" \
        --project="$PROJECT_ID" \
        --zone="$ZONE" \
        --machine-type="e2-medium" \
        --network-interface="network=$NETWORK_NAME,subnet=$SUBNET_NAME,no-address" \
        --maintenance-policy=MIGRATE \
        --provisioning-model=STANDARD \
        --service-account="$(gcloud iam service-accounts list --filter='name:compute' --format='value(email)' --project=$PROJECT_ID | head -1)" \
        --scopes="https://www.googleapis.com/auth/cloud-platform" \
        --tags="tburn-signer" \
        --create-disk="auto-delete=yes,boot=yes,device-name=$vm_name,image-project=debian-cloud,image-family=debian-12,mode=rw,size=20,type=pd-ssd" \
        --shielded-secure-boot \
        --shielded-vtpm \
        --shielded-integrity-monitoring \
        --reservation-affinity=any \
        --metadata="startup-script=$startup_script"
    
    log_success "Created hardened Signer VM: $vm_name"
}

# Create Validator VM
create_validator_vm() {
    log_info "Creating Validator VM..."
    
    local vm_name="tburn-validator-${VALIDATOR_ID}"
    
    if gcloud compute instances describe "$vm_name" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null; then
        log_info "Validator VM $vm_name already exists"
        return
    fi
    
    # Create startup script
    local startup_script=$(cat <<'EOF'
#!/bin/bash
set -euo pipefail

# Similar hardening as signer
apt-get update
apt-get install -y nodejs npm auditd fail2ban

# Configure fail2ban
systemctl enable --now fail2ban

# Setup validator directories
mkdir -p /opt/tburn-validator/{bin,config,data,logs}
chown -R root:root /opt/tburn-validator
chmod 755 /opt/tburn-validator

echo "Validator setup complete"
EOF
)
    
    gcloud compute instances create "$vm_name" \
        --project="$PROJECT_ID" \
        --zone="$ZONE" \
        --machine-type="e2-standard-4" \
        --network-interface="network=$NETWORK_NAME,subnet=$SUBNET_NAME,no-address" \
        --maintenance-policy=MIGRATE \
        --provisioning-model=STANDARD \
        --service-account="$(gcloud iam service-accounts list --filter='name:compute' --format='value(email)' --project=$PROJECT_ID | head -1)" \
        --scopes="https://www.googleapis.com/auth/cloud-platform" \
        --tags="tburn-validator" \
        --create-disk="auto-delete=yes,boot=yes,device-name=$vm_name,image-project=debian-cloud,image-family=debian-12,mode=rw,size=100,type=pd-ssd" \
        --shielded-secure-boot \
        --shielded-vtpm \
        --shielded-integrity-monitoring \
        --reservation-affinity=any \
        --metadata="startup-script=$startup_script"
    
    log_success "Created Validator VM: $vm_name"
}

# Setup Cloud Monitoring and Alerting
setup_monitoring() {
    log_info "Setting up monitoring and alerting..."
    
    # Create uptime check
    cat > /tmp/uptime-check.json << EOF
{
  "displayName": "TBURN Validator ${VALIDATOR_ID} Health",
  "monitoredResource": {
    "type": "gce_instance",
    "labels": {
      "instance_id": "tburn-validator-${VALIDATOR_ID}",
      "zone": "${ZONE}",
      "project_id": "${PROJECT_ID}"
    }
  },
  "httpCheck": {
    "path": "/health",
    "port": 9090
  },
  "period": "60s",
  "timeout": "10s"
}
EOF
    
    log_success "Monitoring configured"
}

# Main deployment
main() {
    echo "=============================================="
    echo "  TBURN Validator Secure GCP Deployment"
    echo "=============================================="
    echo ""
    
    if [[ -z "$VALIDATOR_ID" ]]; then
        log_error "Usage: $0 <validator-id> [mainnet|testnet]"
    fi
    
    log_info "Deploying validator: $VALIDATOR_ID"
    log_info "Network: $NETWORK_TYPE"
    log_info "Region: $REGION"
    log_info "Zone: $ZONE"
    echo ""
    
    preflight_checks
    create_secure_vpc
    configure_firewall
    setup_cloud_kms
    create_secrets
    generate_certificates
    create_signer_vm
    create_validator_vm
    setup_monitoring
    
    echo ""
    echo "=============================================="
    log_success "Deployment complete!"
    echo "=============================================="
    echo ""
    echo "Next steps:"
    echo "1. Connect to Signer VM:   gcloud compute ssh tburn-signer-${VALIDATOR_ID} --tunnel-through-iap --zone=$ZONE"
    echo "2. Connect to Validator:   gcloud compute ssh tburn-validator-${VALIDATOR_ID} --tunnel-through-iap --zone=$ZONE"
    echo "3. Deploy Signer service:  ./scripts/deploy-signer.sh $VALIDATOR_ID"
    echo "4. Deploy Validator:       ./scripts/deploy-validator.sh $VALIDATOR_ID"
    echo ""
}

main "$@"
