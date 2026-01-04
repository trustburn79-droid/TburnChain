#!/bin/bash
#
# TBURN 검증자 초기 설정 스크립트
# Interactive Validator Setup Script
#

set -e

CONFIG_DIR="/etc/tburn"
DATA_DIR="/var/lib/tburn"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         TBURN 검증자 노드 설정 마법사                        ║"
echo "║         TBURN Validator Node Setup Wizard                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 검증자 이름 입력
read -p "검증자 이름을 입력하세요 (예: MyValidator): " VALIDATOR_NAME
if [ -z "$VALIDATOR_NAME" ]; then
    VALIDATOR_NAME="TBURNValidator"
fi

# 지역 선택
echo ""
echo "지역을 선택하세요:"
echo "  1) 서울 (asia-northeast1)"
echo "  2) 도쿄 (asia-northeast2)"
echo "  3) 싱가포르 (asia-southeast1)"
echo "  4) 뉴욕 (us-east1)"
echo "  5) 로스앤젤레스 (us-west1)"
echo "  6) 프랑크푸르트 (europe-west1)"
echo "  7) 런던 (europe-west2)"
echo ""
read -p "선택 [1-7]: " REGION_CHOICE

case $REGION_CHOICE in
    1) REGION="asia-northeast1"; DATACENTER="Seoul";;
    2) REGION="asia-northeast2"; DATACENTER="Tokyo";;
    3) REGION="asia-southeast1"; DATACENTER="Singapore";;
    4) REGION="us-east1"; DATACENTER="New York";;
    5) REGION="us-west1"; DATACENTER="Los Angeles";;
    6) REGION="europe-west1"; DATACENTER="Frankfurt";;
    7) REGION="europe-west2"; DATACENTER="London";;
    *) REGION="asia-northeast1"; DATACENTER="Seoul";;
esac

# 스테이킹 금액
echo ""
read -p "스테이킹 금액 (TBURN, 최소 1,000,000): " STAKE_AMOUNT
if [ -z "$STAKE_AMOUNT" ]; then
    STAKE_AMOUNT="1000000"
fi

# 수수료율
echo ""
read -p "수수료율 (%, 0-100, 기본값 10): " COMMISSION
if [ -z "$COMMISSION" ]; then
    COMMISSION="10"
fi

# P2P 포트
echo ""
read -p "P2P 포트 (기본값 26656): " P2P_PORT
if [ -z "$P2P_PORT" ]; then
    P2P_PORT="26656"
fi

# API 포트
read -p "API 포트 (기본값 8080): " API_PORT
if [ -z "$API_PORT" ]; then
    API_PORT="8080"
fi

echo ""
echo "📋 설정 요약:"
echo "   검증자 이름: $VALIDATOR_NAME"
echo "   지역: $REGION ($DATACENTER)"
echo "   스테이킹: $STAKE_AMOUNT TBURN"
echo "   수수료율: $COMMISSION%"
echo "   P2P 포트: $P2P_PORT"
echo "   API 포트: $API_PORT"
echo ""

read -p "위 설정으로 진행하시겠습니까? [Y/n]: " CONFIRM
if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
    echo "설정이 취소되었습니다."
    exit 1
fi

# 검증자 초기화
echo ""
echo "🔑 검증자 키 생성 중..."

cd /opt/tburn-validator
sudo -u tburn node dist/cli.js init \
    --name "$VALIDATOR_NAME" \
    --region "$REGION" \
    --datacenter "$DATACENTER" \
    --stake "$STAKE_AMOUNT" \
    --commission "$COMMISSION" \
    --output "$CONFIG_DIR/validator.json"

# 포트 설정 업데이트
if [ -f "$CONFIG_DIR/validator.json" ]; then
    # jq가 있으면 사용, 없으면 sed 사용
    if command -v jq &> /dev/null; then
        jq ".network.listenPort = $P2P_PORT | .api.port = $API_PORT" \
            "$CONFIG_DIR/validator.json" > "$CONFIG_DIR/validator.json.tmp"
        mv "$CONFIG_DIR/validator.json.tmp" "$CONFIG_DIR/validator.json"
    fi
fi

chown tburn:tburn "$CONFIG_DIR/validator.json"
chmod 600 "$CONFIG_DIR/validator.json"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ 설정 완료!                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 검증자 주소 표시
if command -v jq &> /dev/null && [ -f "$CONFIG_DIR/validator.json" ]; then
    VALIDATOR_ADDRESS=$(jq -r '.validator.address' "$CONFIG_DIR/validator.json")
    echo "🔑 검증자 주소: $VALIDATOR_ADDRESS"
    echo ""
    echo "⚠️  중요: 이 주소로 스테이킹 금액을 전송해야 합니다!"
    echo "   스테이킹 후 검증자가 활성화됩니다."
fi

echo ""
echo "📝 다음 명령어로 검증자를 시작하세요:"
echo "   sudo systemctl start tburn-validator"
echo ""
echo "📊 상태 확인:"
echo "   sudo systemctl status tburn-validator"
echo "   curl http://localhost:$API_PORT/api/v1/health"
echo ""
