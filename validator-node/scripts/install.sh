#!/bin/bash
#
# TBURN 메인넷 검증자 노드 설치 스크립트
# TBURN Mainnet Validator Node Installation Script
#
# 사용법: curl -fsSL https://tburn.io/validator/install.sh | bash
#

set -e

TBURN_VERSION="1.0.0"
INSTALL_DIR="/opt/tburn-validator"
DATA_DIR="/var/lib/tburn"
CONFIG_DIR="/etc/tburn"
LOG_DIR="/var/log/tburn"
USER="tburn"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       TBURN 메인넷 검증자 노드 설치 프로그램                 ║"
echo "║       TBURN Mainnet Validator Node Installer v${TBURN_VERSION}          ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  체인 ID: 6000                                               ║"
echo "║  네트워크: tburn-mainnet                                     ║"
echo "║  블록 시간: 100ms                                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 루트 권한 확인
if [ "$EUID" -ne 0 ]; then
    echo "❌ 이 스크립트는 루트 권한이 필요합니다."
    echo "   sudo bash install.sh 로 실행해주세요."
    exit 1
fi

# 시스템 요구사항 확인
echo "📋 시스템 요구사항 확인 중..."

# CPU 코어 수
CPU_CORES=$(nproc)
if [ "$CPU_CORES" -lt 4 ]; then
    echo "⚠️  경고: CPU 코어가 4개 미만입니다. (현재: ${CPU_CORES}개)"
    echo "   최소 4코어 이상을 권장합니다."
fi

# 메모리 확인
TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
if [ "$TOTAL_MEM" -lt 8 ]; then
    echo "⚠️  경고: 메모리가 8GB 미만입니다. (현재: ${TOTAL_MEM}GB)"
    echo "   최소 8GB 이상을 권장합니다."
fi

# 디스크 공간 확인
DISK_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_SPACE" -lt 100 ]; then
    echo "⚠️  경고: 디스크 공간이 100GB 미만입니다. (현재: ${DISK_SPACE}GB)"
    echo "   최소 100GB 이상을 권장합니다."
fi

echo "✅ CPU: ${CPU_CORES}코어"
echo "✅ 메모리: ${TOTAL_MEM}GB"
echo "✅ 디스크: ${DISK_SPACE}GB 사용 가능"
echo ""

# 의존성 설치
echo "📦 의존성 설치 중..."

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "   Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20 이상이 필요합니다. (현재: $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# 사용자 생성
if ! id "$USER" &>/dev/null; then
    echo "👤 tburn 사용자 생성 중..."
    useradd -r -s /bin/false -m -d /home/tburn $USER
fi

# 디렉토리 생성
echo "📁 디렉토리 구조 생성 중..."
mkdir -p $INSTALL_DIR
mkdir -p $DATA_DIR/blocks
mkdir -p $DATA_DIR/state
mkdir -p $DATA_DIR/txpool
mkdir -p $CONFIG_DIR
mkdir -p $LOG_DIR

# 검증자 노드 다운로드 및 설치
echo "⬇️  검증자 노드 다운로드 중..."
cd $INSTALL_DIR

# 패키지 복사 (실제 배포시 다운로드로 대체)
cat > package.json << 'EOF'
{
  "name": "tburn-validator",
  "version": "1.0.0",
  "description": "TBURN Mainnet Validator Node",
  "main": "dist/index.js",
  "bin": {
    "tburn-validator": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/cli.js start",
    "init": "node dist/cli.js init"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "ws": "^8.14.0",
    "express": "^4.18.2"
  }
}
EOF

echo "📦 의존성 설치 중..."
npm install --production

# 권한 설정
chown -R $USER:$USER $INSTALL_DIR
chown -R $USER:$USER $DATA_DIR
chown -R $USER:$USER $CONFIG_DIR
chown -R $USER:$USER $LOG_DIR

# systemd 서비스 파일 생성
echo "🔧 systemd 서비스 구성 중..."
cat > /etc/systemd/system/tburn-validator.service << EOF
[Unit]
Description=TBURN Mainnet Validator Node
Documentation=https://docs.tburn.io/validator
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/dist/cli.js start --config $CONFIG_DIR/validator.json
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
LimitNOFILE=65535
LimitNPROC=65535

# 보안 설정
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DATA_DIR $LOG_DIR $CONFIG_DIR

# 환경변수
Environment=NODE_ENV=production
Environment=TBURN_DATA_DIR=$DATA_DIR
Environment=TBURN_LOG_DIR=$LOG_DIR

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tburn-validator

# 로그 로테이션 설정
cat > /etc/logrotate.d/tburn-validator << EOF
$LOG_DIR/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $USER $USER
    postrotate
        systemctl reload tburn-validator > /dev/null 2>&1 || true
    endscript
}
EOF

# 방화벽 설정 안내
echo ""
echo "🔥 방화벽 설정이 필요합니다:"
echo "   sudo ufw allow 26656/tcp  # P2P 통신"
echo "   sudo ufw allow 8080/tcp   # API (선택)"
echo "   sudo ufw allow 8545/tcp   # RPC (선택)"
echo ""

# 완료 메시지
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ 설치 완료!                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 다음 단계:"
echo ""
echo "   1. 검증자 초기화:"
echo "      sudo -u tburn tburn-validator init \\"
echo "        --name \"내 검증자\" \\"
echo "        --region asia-northeast1 \\"
echo "        --datacenter Seoul \\"
echo "        --output $CONFIG_DIR/validator.json"
echo ""
echo "   2. 검증자 시작:"
echo "      sudo systemctl start tburn-validator"
echo ""
echo "   3. 상태 확인:"
echo "      sudo systemctl status tburn-validator"
echo "      sudo journalctl -u tburn-validator -f"
echo ""
echo "📚 문서: https://docs.tburn.io/validator"
echo "💬 지원: https://discord.gg/tburn"
echo ""
