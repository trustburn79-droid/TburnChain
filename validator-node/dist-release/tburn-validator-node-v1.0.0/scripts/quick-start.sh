#!/bin/bash
#
# TBURN 검증자 노드 빠른 시작 스크립트
# Docker를 사용한 간편 설치
#

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TBURN 검증자 노드 빠른 시작 (Docker)                     ║"
echo "║     TBURN Validator Quick Start                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Docker 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "   Docker 설치: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

echo "✅ Docker 설치 확인 완료"

# 작업 디렉토리 생성
WORK_DIR="${HOME}/tburn-validator"
mkdir -p "$WORK_DIR"/{data,config,logs}
cd "$WORK_DIR"

echo "📁 작업 디렉토리: $WORK_DIR"

# Docker Compose 파일 다운로드
echo "⬇️  구성 파일 다운로드 중..."
curl -fsSL https://raw.githubusercontent.com/tburn-foundation/validator-node/main/docker-compose.yml -o docker-compose.yml

# Prometheus 설정 파일 생성
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'tburn-validator'
    static_configs:
      - targets: ['validator:9090']
EOF

# 검증자 초기화 실행
echo ""
echo "🔑 검증자 초기화..."

# 검증자 이름 입력
read -p "검증자 이름을 입력하세요: " VALIDATOR_NAME
if [ -z "$VALIDATOR_NAME" ]; then
    VALIDATOR_NAME="TBURNValidator"
fi

# 지역 선택
echo ""
echo "지역을 선택하세요:"
echo "  1) 서울     2) 도쿄      3) 싱가포르"
echo "  4) 뉴욕     5) LA        6) 프랑크푸르트  7) 런던"
read -p "선택 [1-7]: " REGION_CHOICE

case $REGION_CHOICE in
    1) REGION="asia-northeast1"; DC="Seoul";;
    2) REGION="asia-northeast2"; DC="Tokyo";;
    3) REGION="asia-southeast1"; DC="Singapore";;
    4) REGION="us-east1"; DC="New York";;
    5) REGION="us-west1"; DC="Los Angeles";;
    6) REGION="europe-west1"; DC="Frankfurt";;
    7) REGION="europe-west2"; DC="London";;
    *) REGION="asia-northeast1"; DC="Seoul";;
esac

# Docker로 초기화 실행
docker run --rm -v "$WORK_DIR/config:/config" \
    tburn/validator-node:latest \
    node dist/cli.js init \
    --name "$VALIDATOR_NAME" \
    --region "$REGION" \
    --datacenter "$DC" \
    --output /config/validator.json

echo ""
echo "✅ 검증자 초기화 완료!"

# 검증자 주소 표시
if [ -f "$WORK_DIR/config/validator.json" ]; then
    VALIDATOR_ADDRESS=$(grep -o '"address": "[^"]*"' "$WORK_DIR/config/validator.json" | head -1 | cut -d'"' -f4)
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  🔑 검증자 주소                                              ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "   $VALIDATOR_ADDRESS"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "⚠️  중요: 위 주소로 스테이킹 금액을 전송하세요!"
fi

# 검증자 시작
echo ""
read -p "지금 검증자를 시작하시겠습니까? [Y/n]: " START_NOW
if [[ ! "$START_NOW" =~ ^[Nn]$ ]]; then
    echo ""
    echo "🚀 검증자 시작 중..."
    docker compose up -d
    
    echo ""
    echo "✅ 검증자가 시작되었습니다!"
    echo ""
    echo "📊 상태 확인:"
    echo "   docker compose logs -f"
    echo ""
    echo "🌐 API 엔드포인트:"
    echo "   헬스체크: http://localhost:8080/api/v1/health"
    echo "   상태: http://localhost:8080/api/v1/status"
else
    echo ""
    echo "📝 나중에 다음 명령어로 시작하세요:"
    echo "   cd $WORK_DIR && docker compose up -d"
fi

echo ""
echo "📚 문서: https://docs.tburn.io/validator"
echo "💬 지원: https://discord.gg/tburn"
echo ""
