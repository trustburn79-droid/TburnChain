#!/bin/bash
#
# TBURN Validator Monitoring Script
# Monitors validator health and performance
#

set -e

VALIDATOR_METRICS_PORT="${METRICS_PORT:-8080}"
CHECK_INTERVAL="${CHECK_INTERVAL:-30}"
ALERT_THRESHOLD="${ALERT_THRESHOLD:-5}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} $1"; }
log_error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} $1"; }

consecutive_failures=0

check_health() {
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$VALIDATOR_METRICS_PORT/health 2>/dev/null)
    
    if [ "$response" == "200" ]; then
        consecutive_failures=0
        return 0
    else
        ((consecutive_failures++))
        return 1
    fi
}

get_metrics() {
    curl -s http://localhost:$VALIDATOR_METRICS_PORT/metrics 2>/dev/null
}

parse_metric() {
    local metric_name=$1
    local metrics=$2
    echo "$metrics" | grep "^$metric_name" | head -1 | awk '{print $2}'
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TBURN Validator Monitoring                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
log_info "Monitoring port: $VALIDATOR_METRICS_PORT"
log_info "Check interval: ${CHECK_INTERVAL}s"
log_info "Alert threshold: $ALERT_THRESHOLD consecutive failures"
echo ""

last_slot=0
last_blocks=0
last_attestations=0

while true; do
    if check_health; then
        metrics=$(get_metrics)
        
        current_slot=$(parse_metric "tburn_validator_current_slot" "$metrics")
        current_epoch=$(parse_metric "tburn_validator_current_epoch" "$metrics")
        blocks=$(parse_metric "tburn_validator_blocks_proposed_total" "$metrics")
        attestations=$(parse_metric "tburn_validator_attestations_made_total" "$metrics")
        uptime=$(parse_metric "tburn_validator_uptime_seconds" "$metrics")
        
        # Calculate rates
        slot_diff=$((current_slot - last_slot))
        block_diff=$((blocks - last_blocks))
        attestation_diff=$((attestations - last_attestations))
        
        # Format uptime
        uptime_hours=$(echo "$uptime / 3600" | bc 2>/dev/null || echo "0")
        uptime_mins=$(echo "($uptime % 3600) / 60" | bc 2>/dev/null || echo "0")
        
        log_success "HEALTHY | Slot: $current_slot | Epoch: $current_epoch | Blocks: $blocks (+$block_diff) | Attestations: $attestations (+$attestation_diff) | Uptime: ${uptime_hours}h ${uptime_mins}m"
        
        last_slot=$current_slot
        last_blocks=$blocks
        last_attestations=$attestations
    else
        log_error "UNHEALTHY | Consecutive failures: $consecutive_failures"
        
        if [ $consecutive_failures -ge $ALERT_THRESHOLD ]; then
            log_error "ALERT: Validator has been unhealthy for $consecutive_failures checks!"
            log_warn "Attempting restart..."
            sudo systemctl restart tburn-validator 2>/dev/null || true
        fi
    fi
    
    sleep $CHECK_INTERVAL
done
