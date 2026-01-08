#!/bin/bash
#
# TBURN 검증자 노드 배포 패키지 빌드 스크립트
# 모든 필수 파일을 압축하여 배포용 아카이브 생성
#

set -e

VERSION="1.0.0"
BUILD_DIR="dist-release"
PACKAGE_NAME="tburn-validator-node-v${VERSION}"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TBURN 검증자 노드 배포 패키지 빌드                       ║"
echo "║     Version: ${VERSION}                                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "📁 프로젝트 디렉토리: $PROJECT_DIR"

# 이전 빌드 정리
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$PACKAGE_NAME"

echo "🔨 TypeScript 빌드 중..."
npm run build 2>/dev/null || echo "⚠️  빌드 스킵 (tsx 사용)"

# 배포 디렉토리 구조 생성
echo "📦 패키지 구조 생성 중..."

mkdir -p "$BUILD_DIR/$PACKAGE_NAME"/{bin,lib,config,scripts,docs,data}

# 소스 파일 복사 (빌드된 dist 또는 src)
if [ -d "dist" ]; then
    cp -r dist/* "$BUILD_DIR/$PACKAGE_NAME/lib/"
else
    cp -r src/* "$BUILD_DIR/$PACKAGE_NAME/lib/"
fi

# 스크립트 복사
cp scripts/install.sh "$BUILD_DIR/$PACKAGE_NAME/scripts/"
cp scripts/setup-validator.sh "$BUILD_DIR/$PACKAGE_NAME/scripts/"
cp scripts/quick-start.sh "$BUILD_DIR/$PACKAGE_NAME/scripts/"
chmod +x "$BUILD_DIR/$PACKAGE_NAME/scripts/"*.sh

# 문서 복사
cp docs/*.md "$BUILD_DIR/$PACKAGE_NAME/docs/"
cp README.md "$BUILD_DIR/$PACKAGE_NAME/"

# Docker 파일 복사
cp Dockerfile "$BUILD_DIR/$PACKAGE_NAME/"
cp docker-compose.yml "$BUILD_DIR/$PACKAGE_NAME/"

# package.json 복사 (dependencies만)
cp package.json "$BUILD_DIR/$PACKAGE_NAME/"
cp tsconfig.json "$BUILD_DIR/$PACKAGE_NAME/" 2>/dev/null || true

# 실행 스크립트 생성
cat > "$BUILD_DIR/$PACKAGE_NAME/bin/tburn-validator" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_PATH="$SCRIPT_DIR/../lib"
exec node "$NODE_PATH/cli.js" "$@"
EOF
chmod +x "$BUILD_DIR/$PACKAGE_NAME/bin/tburn-validator"

# 샘플 설정 파일 생성
cat > "$BUILD_DIR/$PACKAGE_NAME/config/validator.example.json" << 'EOF'
{
  "nodeId": "YOUR_NODE_ID",
  "chainId": 5800,
  "networkId": "tburn-mainnet",
  "validator": {
    "address": "YOUR_VALIDATOR_ADDRESS",
    "privateKey": "YOUR_PRIVATE_KEY",
    "publicKey": "YOUR_PUBLIC_KEY",
    "stake": "1000000000000000000000000",
    "commission": 0.1,
    "name": "My TBURN Validator",
    "description": "TBURN Mainnet Validator"
  },
  "network": {
    "listenHost": "0.0.0.0",
    "listenPort": 26656,
    "rpcPort": 8545,
    "wsPort": 8546,
    "bootstrapPeers": [
      "tcp://seed1.tburn.io:26656",
      "tcp://seed2.tburn.io:26656",
      "tcp://seed3.tburn.io:26656"
    ],
    "maxPeers": 50,
    "minPeers": 10
  },
  "api": {
    "enabled": true,
    "host": "0.0.0.0",
    "port": 8080
  },
  "geo": {
    "region": "asia-northeast1",
    "datacenter": "Seoul"
  }
}
EOF

# 라이센스 파일 생성
cat > "$BUILD_DIR/$PACKAGE_NAME/LICENSE" << 'EOF'
MIT License

Copyright (c) 2026 TBURN Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# 버전 파일 생성
echo "$VERSION" > "$BUILD_DIR/$PACKAGE_NAME/VERSION"

# INSTALL.txt 빠른 시작 안내
cat > "$BUILD_DIR/$PACKAGE_NAME/INSTALL.txt" << 'EOF'
TBURN 메인넷 검증자 노드 설치 가이드
=====================================

빠른 설치 (Linux):
  sudo bash scripts/install.sh
  sudo bash scripts/setup-validator.sh

Docker 설치:
  bash scripts/quick-start.sh

수동 설치:
  1. Node.js 20 이상 설치
  2. npm install
  3. node lib/cli.js init --name "MyValidator" --region asia-northeast1
  4. node lib/cli.js start --config config/validator.json

자세한 설명서: docs/VALIDATOR_SETUP_GUIDE_KO.md (한국어)
                docs/VALIDATOR_SETUP_GUIDE_EN.md (English)

문의: https://discord.gg/tburn
문서: https://docs.tburn.io/validator
EOF

echo ""
echo "📦 압축 파일 생성 중..."

cd "$BUILD_DIR"

# tar.gz 생성
tar -czvf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME"
echo "✅ ${PACKAGE_NAME}.tar.gz 생성 완료"

# zip 생성 (zip이 설치되어 있는 경우)
if command -v zip &> /dev/null; then
    zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME"
    echo "✅ ${PACKAGE_NAME}.zip 생성 완료"
fi

cd "$PROJECT_DIR"

# 파일 크기 표시
echo ""
echo "📊 생성된 패키지:"
ls -lh "$BUILD_DIR"/*.tar.gz "$BUILD_DIR"/*.zip 2>/dev/null || ls -lh "$BUILD_DIR"/*.tar.gz

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ 빌드 완료!                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "배포 파일 위치: $BUILD_DIR/"
echo ""
echo "패키지 내용물:"
ls -la "$BUILD_DIR/$PACKAGE_NAME/"
echo ""
