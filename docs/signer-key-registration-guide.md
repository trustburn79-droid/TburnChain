# TBURN 메인넷 서명자 키 등록 가이드

## 개요

TBURN 메인넷 검증자로 참여하기 위해서는 **Enterprise Remote Signer 서비스**에 서명자 키를 등록해야 합니다. 이 문서는 키 등록을 위한 사전 준비 사항과 등록 절차를 안내합니다.

---

## 1. 사전 요구사항

### 1.1 검증자 자격 요건

| 티어 | 최소 스테이킹 | 일일 서명 한도 | 권한 |
|------|--------------|---------------|------|
| **Genesis** | 1,000,000 TBURN | 무제한 | 블록, 증명, 거버넌스, 출금 |
| **Pioneer** | 500,000 TBURN | 100,000 | 블록, 증명, 거버넌스 |
| **Standard** | 100,000 TBURN | 50,000 | 블록, 증명 |
| **Community** | 32,000 TBURN | 10,000 | 블록, 증명 |

### 1.2 기술 요구사항

- **운영체제**: Ubuntu 22.04 LTS 또는 Debian 12
- **하드웨어**: 
  - CPU: 8코어 이상
  - RAM: 32GB 이상
  - SSD: 500GB NVMe 이상
  - 네트워크: 100Mbps 대칭 회선
- **보안**: 
  - 고정 IP 주소
  - mTLS 클라이언트 인증서
  - 방화벽 설정 (포트 5800, 8545)

### 1.3 필수 소프트웨어

```bash
# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 필수 패키지 설치
sudo apt-get install -y openssl jq curl

# TBURN CLI 설치
npm install -g @tburn/cli
```

---

## 2. 키 생성

### 2.1 검증자 키쌍 생성

```bash
# 키 저장 디렉토리 생성
mkdir -p ~/.tburn/keys
chmod 700 ~/.tburn/keys

# 검증자 키쌍 생성
tburn-cli keygen validator \
  --output ~/.tburn/keys/validator_key.json \
  --password-file ~/.tburn/keys/password.txt

# 키 정보 확인
tburn-cli keys show ~/.tburn/keys/validator_key.json
```

### 2.2 출력 예시

```json
{
  "validatorAddress": "tburn1qzk7xn3v9q...",
  "publicKey": "0x04a8b2c3d4e5f6...",
  "keyType": "ed25519",
  "createdAt": "2026-01-27T10:00:00Z",
  "chainId": 5800
}
```

### 2.3 서명 키 종류

| 키 목적 | 설명 | 권한 레벨 |
|--------|------|----------|
| `block_signing` | 블록 서명용 | 필수 |
| `attestation` | 증명 서명용 | 필수 |
| `governance` | 거버넌스 투표용 | Pioneer 이상 |
| `withdrawal` | 출금 요청용 | Genesis 전용 |

---

## 3. mTLS 인증서 발급

### 3.1 CSR (인증서 서명 요청) 생성

```bash
# 개인키 생성
openssl genrsa -out ~/.tburn/certs/client.key 4096

# CSR 생성
openssl req -new \
  -key ~/.tburn/certs/client.key \
  -out ~/.tburn/certs/client.csr \
  -subj "/CN=validator-$(hostname)/O=TBURN-Validator/C=KR"

# CSR 내용 확인
openssl req -in ~/.tburn/certs/client.csr -noout -text
```

### 3.2 인증서 발급 요청

CSR 파일을 TBURN 운영팀에 제출하여 클라이언트 인증서를 발급받습니다.

```bash
# CSR 제출 (운영팀 이메일로 전송)
cat ~/.tburn/certs/client.csr

# 발급받은 인증서 저장
# 운영팀에서 발급한 client.crt 파일을 저장
mv client.crt ~/.tburn/certs/
chmod 600 ~/.tburn/certs/client.*
```

---

## 4. 키 등록 신청서 작성

### 4.1 등록 정보 준비

```json
{
  "operatorInfo": {
    "operatorName": "회사명 또는 운영자명",
    "contactEmail": "operator@example.com",
    "contactPhone": "+82-10-1234-5678",
    "region": "asia-northeast3",
    "timezone": "Asia/Seoul"
  },
  "validatorInfo": {
    "validatorAddress": "tburn1qzk7xn3v9q...",
    "publicKey": "0x04a8b2c3d4e5f6...",
    "nodeId": "node-001",
    "tier": "standard",
    "purpose": "block_signing"
  },
  "securityInfo": {
    "staticIpAddresses": ["203.0.113.10", "203.0.113.11"],
    "csrFingerprint": "SHA256:abc123...",
    "emergencyContact": "emergency@example.com"
  },
  "agreementInfo": {
    "termsAccepted": true,
    "slashingPolicyAccepted": true,
    "uptimeSlaAccepted": true
  }
}
```

### 4.2 체크리스트

등록 전 다음 항목을 확인하세요:

- [ ] 최소 스테이킹 금액 충족
- [ ] 검증자 키쌍 생성 완료
- [ ] mTLS CSR 생성 완료
- [ ] 고정 IP 주소 확보
- [ ] 방화벽 설정 완료
- [ ] 운영자 연락처 정보 준비
- [ ] 이용약관 검토 완료
- [ ] 슬래싱 정책 이해 완료
- [ ] SLA 요구사항 확인 완료

---

## 5. 등록 API 호출

### 5.1 키 등록 요청

```bash
# API 키는 사전에 운영팀에서 발급
API_KEY="your-api-key"
SIGNER_URL="https://signer.tburn.network"

# 키 등록 요청
curl -X POST "${SIGNER_URL}/api/remote-signer/register" \
  --cert ~/.tburn/certs/client.crt \
  --key ~/.tburn/certs/client.key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d @registration.json
```

### 5.2 응답 예시

```json
{
  "success": true,
  "data": {
    "registrationId": "reg-2026012700001",
    "status": "pending_verification",
    "validatorAddress": "tburn1qzk7xn3v9q...",
    "secretName": "validator-key-001",
    "keyVersion": 1,
    "estimatedActivation": "2026-01-28T00:00:00Z",
    "nextSteps": [
      "KYC 인증 완료",
      "스테이킹 예치 확인",
      "노드 연결 테스트"
    ]
  }
}
```

---

## 6. 등록 상태 확인

### 6.1 상태 조회

```bash
curl -X GET "${SIGNER_URL}/api/remote-signer/registration/reg-2026012700001" \
  --cert ~/.tburn/certs/client.crt \
  --key ~/.tburn/certs/client.key \
  -H "X-API-Key: ${API_KEY}"
```

### 6.2 상태 코드

| 상태 | 설명 |
|------|------|
| `pending_verification` | 검토 대기 중 |
| `kyc_required` | KYC 인증 필요 |
| `staking_required` | 스테이킹 예치 필요 |
| `approved` | 승인 완료, 활성화 대기 |
| `active` | 활성화됨, 서명 가능 |
| `suspended` | 일시 중지 |
| `revoked` | 등록 취소됨 |

---

## 7. 노드 연결 테스트

### 7.1 연결 확인

```bash
# 서명자 서비스 헬스체크
curl -X GET "${SIGNER_URL}/api/remote-signer/health" \
  --cert ~/.tburn/certs/client.crt \
  --key ~/.tburn/certs/client.key

# 테스트 서명 요청
tburn-cli signer test \
  --validator-address "tburn1qzk7xn3v9q..." \
  --cert ~/.tburn/certs/client.crt \
  --key ~/.tburn/certs/client.key
```

### 7.2 예상 응답

```json
{
  "success": true,
  "healthy": true,
  "details": {
    "signer": "operational",
    "hsm": "connected",
    "database": "connected",
    "latencyMs": 12
  }
}
```

---

## 8. 서명 권한 구성

### 8.1 기본 권한 설정

```typescript
// 서명 권한 구조
interface SigningPermissions {
  canSignBlocks: boolean;       // 블록 서명
  canSignAttestations: boolean; // 증명 서명
  canSignGovernance: boolean;   // 거버넌스 투표
  canSignWithdrawals: boolean;  // 출금 요청
  maxDailySignings: number;     // 일일 서명 한도
  allowedOperations: string[];  // 허용된 작업 목록
}
```

### 8.2 티어별 기본 권한

```json
{
  "genesis": {
    "canSignBlocks": true,
    "canSignAttestations": true,
    "canSignGovernance": true,
    "canSignWithdrawals": true,
    "maxDailySignings": -1,
    "allowedOperations": ["SIGN_BLOCK", "SIGN_ATTESTATION", "SIGN_AGGREGATE", "SIGN_SYNC_COMMITTEE", "SIGN_GOVERNANCE_VOTE", "SIGN_WITHDRAWAL"]
  },
  "pioneer": {
    "canSignBlocks": true,
    "canSignAttestations": true,
    "canSignGovernance": true,
    "canSignWithdrawals": false,
    "maxDailySignings": 100000,
    "allowedOperations": ["SIGN_BLOCK", "SIGN_ATTESTATION", "SIGN_AGGREGATE", "SIGN_GOVERNANCE_VOTE"]
  },
  "standard": {
    "canSignBlocks": true,
    "canSignAttestations": true,
    "canSignGovernance": false,
    "canSignWithdrawals": false,
    "maxDailySignings": 50000,
    "allowedOperations": ["SIGN_BLOCK", "SIGN_ATTESTATION"]
  },
  "community": {
    "canSignBlocks": true,
    "canSignAttestations": true,
    "canSignGovernance": false,
    "canSignWithdrawals": false,
    "maxDailySignings": 10000,
    "allowedOperations": ["SIGN_BLOCK", "SIGN_ATTESTATION"]
  }
}
```

---

## 9. 키 로테이션

### 9.1 정기 로테이션 (권장)

```bash
# 새 키쌍 생성
tburn-cli keygen validator \
  --output ~/.tburn/keys/validator_key_v2.json \
  --password-file ~/.tburn/keys/password.txt

# 키 로테이션 요청
curl -X POST "${SIGNER_URL}/api/remote-signer/rotate" \
  --cert ~/.tburn/certs/client.crt \
  --key ~/.tburn/certs/client.key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "validatorAddress": "tburn1qzk7xn3v9q...",
    "newPublicKey": "0x04new_public_key...",
    "reason": "scheduled_rotation"
  }'
```

### 9.2 긴급 로테이션

키 유출이 의심되는 경우:

```bash
# 긴급 키 로테이션 요청
tburn-cli signer emergency-rotate \
  --validator-address "tburn1qzk7xn3v9q..." \
  --reason "suspected_compromise" \
  --new-key ~/.tburn/keys/validator_key_emergency.json
```

---

## 10. 보안 권장사항

### 10.1 키 보관

- 개인키는 **절대로** 네트워크에 노출하지 마세요
- 백업 키는 오프라인 콜드 스토리지에 보관
- 암호화된 USB 또는 하드웨어 보안 모듈(HSM) 사용 권장

### 10.2 접근 제어

```bash
# 키 파일 권한 설정
chmod 600 ~/.tburn/keys/*
chmod 700 ~/.tburn/keys

# 인증서 파일 권한 설정
chmod 600 ~/.tburn/certs/*
chmod 700 ~/.tburn/certs
```

### 10.3 모니터링

- 서명 활동 로그 정기 검토
- 비정상적인 서명 패턴 알림 설정
- 실패한 서명 시도 모니터링

---

## 11. 문제 해결

### 11.1 일반적인 오류

| 오류 코드 | 원인 | 해결 방법 |
|----------|------|----------|
| `AUTH_FAILED` | mTLS 인증 실패 | 인증서 유효성 확인 |
| `KEY_NOT_FOUND` | 등록되지 않은 키 | 키 등록 상태 확인 |
| `RATE_LIMITED` | 일일 서명 한도 초과 | 다음 날 재시도 |
| `INVALID_PAYLOAD` | 잘못된 서명 요청 | 요청 형식 확인 |
| `PERMISSION_DENIED` | 권한 부족 | 티어 업그레이드 또는 운영팀 문의 |

### 11.2 지원 연락처

- **기술 지원**: tech-support@tburn.network
- **긴급 연락**: emergency@tburn.network
- **Discord**: https://discord.gg/tburn
- **Telegram**: https://t.me/tburn_validators

---

## 12. 부록

### A. API 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/remote-signer/health` | GET | 헬스체크 |
| `/api/remote-signer/stats` | GET | 서비스 통계 |
| `/api/remote-signer/validators` | GET | 검증자 목록 |
| `/api/remote-signer/register` | POST | 키 등록 |
| `/api/remote-signer/sign` | POST | 서명 요청 |
| `/api/remote-signer/rotate` | POST | 키 로테이션 |
| `/api/remote-signer/revoke` | POST | 키 폐기 |

### B. 체인 정보

- **Chain ID**: 5800
- **Network Name**: TBURN Mainnet
- **Block Time**: 100ms
- **Consensus**: BFT (5-phase)
- **Signature Algorithm**: Ed25519 / ECDSA secp256k1

### C. 버전 정보

- **문서 버전**: 1.0.0
- **최종 업데이트**: 2026-01-27
- **적용 대상**: TBURN Mainnet v1.0+

---

**주의**: 이 문서는 TBURN 메인넷 런칭 전 준비 자료입니다. 실제 등록 절차는 메인넷 런칭 시점에 변경될 수 있습니다.
