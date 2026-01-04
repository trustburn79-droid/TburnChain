# TBURN 검증자 노드 설치 및 설정 가이드

## 시스템 요구사항

- **Node.js**: 20.0.0 이상
- **메모리**: 4GB 이상 권장
- **저장소**: SSD 50GB 이상 권장
- **네트워크**: 안정적인 인터넷 연결

## 빠른 설치

### 1단계: 파일 다운로드

```bash
# 배포 패키지 다운로드 또는 복사
tar -xzf tburn-validator-node-v1.0.0.tar.gz
cd tburn-validator-node
```

### 2단계: 의존성 설치

```bash
npm install
npm run build
```

### 3단계: 대화형 설정 (권장)

일반 사용자는 대화형 설정을 사용하세요:

```bash
npx tburn-validator setup
```

이 명령어는 단계별로 안내합니다:
1. 검증자 이름 입력
2. 지역 선택 (서울, 도쿄, 싱가포르 등)
3. 스테이크 금액 설정
4. 수수료율 설정
5. 키 생성 또는 가져오기
6. 비밀번호 설정 (키 암호화용)

### 4단계: 검증자 시작

```bash
npx tburn-validator start --config validator.json
```

비밀번호를 입력하면 검증자가 시작됩니다.

## 상세 설정 옵션

### 기본 설정 (명령줄)

```bash
npx tburn-validator init \
  --name "내 TBURN 검증자" \
  --region asia-northeast1 \
  --datacenter Seoul \
  --stake 1000000 \
  --commission 10
```

### 환경별 설정

#### 개발/테스트 환경

```bash
npx tburn-validator start --config validator.json --solo --log-level debug
```

#### 프로덕션 환경

```bash
npx tburn-validator start --config validator.json --log-level info
```

## 키 관리

### 새 키 생성

```bash
npx tburn-validator keys generate
```

출력 예시:
```
Address:     tb1a1b2c3d4e5f6...
Public Key:  302a30...
Private Key: 302e020...
```

### 기존 키 가져오기

```bash
npx tburn-validator keys import --private-key <16진수_개인키>
```

### 키 백업

```bash
npx tburn-validator keys backup --output my-backup.json
```

### 키 복원

```bash
npx tburn-validator keys restore --input my-backup.json
```

### 키 정보 확인

```bash
npx tburn-validator keys show
```

## 보안 권장사항

### 필수 사항

1. **비밀번호 관리**
   - 최소 8자 이상의 강력한 비밀번호 사용
   - 비밀번호를 안전한 장소에 기록
   - 비밀번호 분실 시 키 복구 불가

2. **백업**
   - 설정 완료 후 즉시 백업 생성
   - 백업 파일을 오프라인 저장소에 보관
   - 정기적으로 백업 업데이트

3. **네트워크 보안**
   - 방화벽에서 필요한 포트만 개방
   - P2P: 26656
   - API: 8080 (내부 네트워크만 권장)

### 권장 사항

- 전용 서버 또는 VPS 사용
- 정기적인 소프트웨어 업데이트
- 모니터링 시스템 구성

## 지원 지역

| 지역 코드 | 데이터센터 | 권장 검증자 수 |
|-----------|------------|----------------|
| asia-northeast1 | 서울 | 25 |
| asia-northeast2 | 도쿄 | 20 |
| asia-southeast1 | 싱가포르 | 15 |
| us-east1 | 뉴욕 | 20 |
| us-west1 | 로스앤젤레스 | 15 |
| europe-west1 | 프랑크푸르트 | 15 |
| europe-west2 | 런던 | 15 |

## 상태 확인

```bash
npx tburn-validator status --url http://localhost:8080
```

## 문제 해결

### "Configuration file not found" 오류

```bash
npx tburn-validator setup  # 새 설정 생성
```

### "Invalid password" 오류

- 올바른 비밀번호를 입력했는지 확인
- 5회 이상 실패 시 잠금됨 (재시작 필요)

### "No keys found in keystore" 오류

```bash
npx tburn-validator keys restore --input backup.json
```

### 연결 실패

- 인터넷 연결 확인
- 방화벽 설정 확인
- 부트스트랩 노드 접근성 확인

## Docker 배포

```bash
# 이미지 빌드
docker build -t tburn/validator-node:latest .

# 컨테이너 실행
docker run -d \
  --name tburn-validator \
  -p 26656:26656 \
  -p 8080:8080 \
  -v $(pwd)/validator.json:/config/validator.json \
  -v $(pwd)/data:/data \
  tburn/validator-node:latest
```

## 지원

- 문서: https://docs.tburn.io/validator
- 커뮤니티: https://discord.tburn.io
- 이슈: https://github.com/tburn-foundation/validator-node/issues
