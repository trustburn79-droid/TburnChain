# TBURN 메인넷 검증자 노드 설정 가이드

## 목차
1. [시스템 요구사항](#시스템-요구사항)
2. [빠른 설치](#빠른-설치)
3. [수동 설치](#수동-설치)
4. [검증자 등록](#검증자-등록)
5. [운영 및 모니터링](#운영-및-모니터링)
6. [문제 해결](#문제-해결)
7. [보안 권장사항](#보안-권장사항)

---

## 시스템 요구사항

### 최소 사양
| 항목 | 최소 | 권장 |
|------|------|------|
| CPU | 4코어 | 8코어 이상 |
| RAM | 8GB | 16GB 이상 |
| 스토리지 | 100GB SSD | 500GB NVMe SSD |
| 네트워크 | 100Mbps | 1Gbps |
| 운영체제 | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### 네트워크 포트
| 포트 | 용도 | 필수 여부 |
|------|------|----------|
| 26656 | P2P 통신 | 필수 |
| 8080 | REST API | 선택 |
| 8545 | JSON-RPC | 선택 |
| 8546 | WebSocket | 선택 |
| 9090 | Prometheus | 선택 |

---

## 빠른 설치

### 자동 설치 스크립트 실행

```bash
# 설치 스크립트 다운로드 및 실행
curl -fsSL https://tburn.io/validator/install.sh | sudo bash

# 검증자 설정 마법사 실행
sudo /opt/tburn-validator/scripts/setup-validator.sh
```

---

## 수동 설치

### 1단계: 시스템 준비

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl wget git build-essential

# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Node.js 버전 확인
node -v  # v20.x.x 이상
```

### 2단계: 검증자 노드 설치

```bash
# 설치 디렉토리 생성
sudo mkdir -p /opt/tburn-validator
sudo mkdir -p /var/lib/tburn/{blocks,state,txpool}
sudo mkdir -p /etc/tburn
sudo mkdir -p /var/log/tburn

# 검증자 노드 다운로드
cd /opt/tburn-validator
sudo wget https://github.com/tburn-foundation/validator-node/releases/latest/download/tburn-validator.tar.gz
sudo tar -xzf tburn-validator.tar.gz

# 의존성 설치
sudo npm install --production
```

### 3단계: 사용자 및 권한 설정

```bash
# tburn 사용자 생성
sudo useradd -r -s /bin/false -m -d /home/tburn tburn

# 권한 설정
sudo chown -R tburn:tburn /opt/tburn-validator
sudo chown -R tburn:tburn /var/lib/tburn
sudo chown -R tburn:tburn /etc/tburn
sudo chown -R tburn:tburn /var/log/tburn
```

### 4단계: 검증자 초기화

```bash
# 검증자 키 생성 및 설정
sudo -u tburn /opt/tburn-validator/bin/tburn-validator init \
    --name "내검증자이름" \
    --region asia-northeast1 \
    --datacenter Seoul \
    --stake 1000000 \
    --commission 10 \
    --output /etc/tburn/validator.json

# 설정 파일 보안
sudo chmod 600 /etc/tburn/validator.json
```

### 5단계: systemd 서비스 설정

```bash
# 서비스 파일 생성
sudo tee /etc/systemd/system/tburn-validator.service << EOF
[Unit]
Description=TBURN Mainnet Validator Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tburn
Group=tburn
WorkingDirectory=/opt/tburn-validator
ExecStart=/usr/bin/node /opt/tburn-validator/dist/cli.js start --config /etc/tburn/validator.json
Restart=always
RestartSec=10
LimitNOFILE=65535

Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable tburn-validator
```

### 6단계: 방화벽 설정

```bash
# UFW 사용시
sudo ufw allow 26656/tcp comment "TBURN P2P"
sudo ufw allow 8080/tcp comment "TBURN API"

# firewalld 사용시
sudo firewall-cmd --permanent --add-port=26656/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

---

## 검증자 등록

### 1. 검증자 주소 확인

```bash
# 검증자 정보 확인
cat /etc/tburn/validator.json | jq '.validator.address'
```

### 2. 스테이킹 트랜잭션

검증자로 활성화되려면 최소 **1,000,000 TBURN**을 스테이킹해야 합니다.

1. TBURN 지갑에서 검증자 주소로 스테이킹
2. https://explorer.tburn.io 에서 트랜잭션 확인
3. 스테이킹 완료 후 검증자 활성화

### 3. 검증자 시작

```bash
# 검증자 시작
sudo systemctl start tburn-validator

# 상태 확인
sudo systemctl status tburn-validator

# 로그 확인
sudo journalctl -u tburn-validator -f
```

---

## 운영 및 모니터링

### 상태 확인 명령어

```bash
# 서비스 상태
sudo systemctl status tburn-validator

# 실시간 로그
sudo journalctl -u tburn-validator -f

# 노드 상태 API
curl http://localhost:8080/api/v1/status

# 헬스 체크
curl http://localhost:8080/api/v1/health

# 메트릭
curl http://localhost:8080/api/v1/metrics
```

### 모니터링 대시보드

Prometheus + Grafana 설정:

```bash
# prometheus.yml에 추가
scrape_configs:
  - job_name: 'tburn-validator'
    static_configs:
      - targets: ['localhost:9090']
```

### 알림 설정

```bash
# 디스코드 웹훅 알림 (선택)
export TBURN_DISCORD_WEBHOOK="https://discord.com/api/webhooks/..."

# 이메일 알림 (선택)
export TBURN_ALERT_EMAIL="admin@example.com"
```

---

## 문제 해결

### 일반적인 문제

#### 노드가 시작되지 않음
```bash
# 로그 확인
sudo journalctl -u tburn-validator -n 100

# 설정 파일 확인
sudo cat /etc/tburn/validator.json | jq .

# 포트 충돌 확인
sudo netstat -tlnp | grep -E "26656|8080"
```

#### 피어 연결 실패
```bash
# 방화벽 확인
sudo ufw status

# 부트스트랩 피어 연결 테스트
nc -zv seed1.tburn.io 26656
```

#### 동기화 지연
```bash
# 현재 블록 높이 확인
curl http://localhost:8080/api/v1/status | jq '.currentHeight'

# 피어 수 확인
curl http://localhost:8080/api/v1/peers | jq '.count'
```

### 재시작 및 복구

```bash
# 안전한 재시작
sudo systemctl restart tburn-validator

# 데이터 초기화 (주의: 모든 데이터 삭제)
sudo systemctl stop tburn-validator
sudo rm -rf /var/lib/tburn/*
sudo systemctl start tburn-validator
```

---

## 보안 권장사항

### 1. 키 보안
- **개인키를 절대 공유하지 마세요**
- 설정 파일 권한: `chmod 600 /etc/tburn/validator.json`
- 정기적인 키 백업 (오프라인 저장)

### 2. 서버 보안
```bash
# SSH 키 인증만 허용
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 불필요한 포트 차단
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 26656/tcp
sudo ufw enable
```

### 3. 모니터링
- 24/7 가동시간 모니터링 설정
- 슬래싱 이벤트 알림 설정
- 리소스 사용량 모니터링

### 4. 업데이트
```bash
# 정기적인 업데이트 확인
cd /opt/tburn-validator
sudo -u tburn git pull
sudo -u tburn npm install
sudo systemctl restart tburn-validator
```

---

## 지원

- 문서: https://docs.tburn.io/validator
- 디스코드: https://discord.gg/tburn
- 이메일: validator-support@tburn.io
- GitHub: https://github.com/tburn-foundation/validator-node

---

## 부록: 지역별 부트스트랩 노드

| 지역 | 부트스트랩 노드 |
|------|----------------|
| 아시아 | seed1.asia.tburn.io:26656 |
| 북미 | seed1.us.tburn.io:26656 |
| 유럽 | seed1.eu.tburn.io:26656 |

---

*TBURN Foundation - 2026*
