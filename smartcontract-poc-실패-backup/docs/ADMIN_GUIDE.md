# 🛡️ 관리자 기능 가이드

CSPINWithdrawalSecure 컨트랙트의 모든 관리자 기능을 설명합니다.

---

## 👤 Owner (관리자) 권한

**Owner만 실행 가능한 기능:**
- ✅ SetClaimable (인출 가능 금액 설정)
- ✅ Pause/Unpause (긴급 정지/재개)
- ✅ UpdateGameWallet (게임 지갑 변경)
- ✅ UpdateOwner (관리자 권한 이전)

---

## 🔧 주요 관리 기능

### 1. SetClaimable (인출 가능 금액 설정)

**목적**: 사용자가 인출할 수 있는 CSPIN 토큰 금액 설정

**사용법**:
```bash
npx blueprint run setClaimable --mainnet
```

**입력 예시**:
```
Contract: EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg
User: UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd
Amount: 100
```

**제약 조건**:
- ⚠️ 최대 1,000,000 CSPIN (maxSingleWithdraw)
- ⚠️ Owner 권한 필요
- ⚠️ Pause 상태에서도 실행 가능

**프로세스**:
```
1. 게임에서 사용자 획득 CSPIN 계산
2. SetClaimable 실행 (금액 설정)
3. 사용자가 ClaimRequest 실행
4. 토큰 전송 완료
```

---

### 2. Pause (긴급 정지)

**목적**: 모든 인출 요청 차단 (보안 위협 대응)

#### **방법 1: PC 환경 (Blueprint)**
```bash
npx blueprint run pauseContract --mainnet
```

#### **방법 2: 모바일 환경 (Tonkeeper 앱)**
1. Tonkeeper 앱 열기
2. **전송(Send)** 탭 선택
3. **수신자**: 컨트랙트 주소 입력
   ```
   EQAIlrbypzom9HibUyYxosqmYnIRjFWAhFs5E1ybnKY2XtQg
   ```
4. **금액**: `0.05` TON
5. **메시지(Comment)**: `pause` (정확히 입력)
6. **전송** 버튼 클릭

**재개는 동일하게 `unpause` 메시지 전송**

#### **방법 3: 모바일 웹 페이지 (권장) ✅**
```
frontend-poc/emergency-pause.html
```
- 📱 모바일 브라우저에서 접근
- 🔐 TonConnect로 Owner 지갑 연결
- ⚡ 버튼 클릭만으로 Pause/Unpause 가능
- 📊 실시간 컨트랙트 상태 표시

**사용법**:
1. 모바일 브라우저에서 `emergency-pause.html` 열기
2. "Owner 지갑 연결" 버튼 클릭
3. Tonkeeper/MyTonWallet으로 QR 스캔
4. "긴급 정지" 또는 "재개" 버튼 클릭

**효과**:
- ❌ 모든 ClaimRequest 거부
- ✅ SetClaimable은 여전히 가능
- ✅ Owner 권한 기능은 정상 작동

**사용 시나리오**:
1. **보안 위협 감지**
   - 비정상적인 인출 패턴
   - 잠재적 공격 시도
   
2. **컨트랙트 업그레이드**
   - 새 버전 배포 준비
   - 데이터 마이그레이션

3. **긴급 점검**
   - Game Wallet 잔액 부족
   - Jetton Master 이슈

**테스트 방법**:
```bash
# 1. Pause 실행
npx blueprint run pauseContract --testnet

# 2. 프론트엔드에서 인출 시도
# → "Contract is paused" 오류 발생 확인

# 3. Unpause로 복구
npx blueprint run unpauseContract --testnet
```

---

### 3. Unpause (정지 해제)

**목적**: 정지된 컨트랙트 재개

**사용법**:
```bash
npx blueprint run unpauseContract --mainnet
```

**주의사항**:
- ⚠️ 정지 원인이 해결되었는지 확인
- ⚠️ Game Wallet 잔액 충분한지 확인
- ⚠️ 재개 후 즉시 인출 가능

---

### 4. UpdateGameWallet (게임 지갑 변경)

**목적**: CSPIN 토큰을 보유한 게임 지갑 주소 변경

**사용 시나리오**:
- 새로운 게임 지갑으로 마이그레이션
- 보안상 지갑 교체
- 멀티 지갑 전략

**코드 수정 필요**:
```typescript
// scripts/updateGameWallet.ts (생성 필요)
import { toNano, Address } from '@ton/core';
import { CSPINWithdrawalSecure } from '../wrappers/CSPINWithdrawalSecure';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    
    const address = Address.parse(await ui.input('Contract address'));
    const newGameWallet = Address.parse(await ui.input('New Game Wallet'));
    
    const contract = provider.open(CSPINWithdrawalSecure.fromAddress(address));
    
    await contract.send(
        provider.sender(),
        { value: toNano('0.05') },
        {
            $$type: 'UpdateGameWallet',
            newGameWallet: newGameWallet
        }
    );
    
    ui.write('✅ Game Wallet updated!');
}
```

---

### 5. UpdateOwner (관리자 권한 이전)

**목적**: Owner 권한을 다른 지갑으로 이전

**⚠️ 매우 중요**: 
- 잘못된 주소로 이전 시 컨트랙트 영구 잠김
- 신중하게 검증 후 실행
- 복구 불가능

**코드 수정 필요**:
```typescript
// scripts/updateOwner.ts (생성 필요)
import { toNano, Address } from '@ton/core';
import { CSPINWithdrawalSecure } from '../wrappers/CSPINWithdrawalSecure';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    
    const address = Address.parse(await ui.input('Contract address'));
    const newOwner = Address.parse(await ui.input('New Owner Address'));
    
    // 확인 메시지
    const confirm = await ui.input('⚠️ Are you sure? Type "CONFIRM" to proceed');
    if (confirm !== 'CONFIRM') {
        ui.write('❌ Cancelled');
        return;
    }
    
    const contract = provider.open(CSPINWithdrawalSecure.fromAddress(address));
    
    await contract.send(
        provider.sender(),
        { value: toNano('0.05') },
        {
            $$type: 'UpdateOwner',
            newOwner: newOwner
        }
    );
    
    ui.write('✅ Owner updated!');
}
```

---

## 🔒 보안 체크리스트

### 배포 전
- [ ] Jetton Master 주소 확인
- [ ] Game Wallet 주소 확인
- [ ] Owner 지갑 백업 (Mnemonic)
- [ ] 충분한 TON 잔액

### 운영 중
- [ ] 정기적인 Game Wallet 잔액 모니터링
- [ ] 비정상 인출 패턴 감시
- [ ] Pause 기능 테스트 (월 1회)
- [ ] Owner 지갑 안전 보관

### 긴급 상황
- [ ] 즉시 Pause 실행
- [ ] 원인 파악 및 해결
- [ ] 테스트넷에서 재현 테스트
- [ ] Unpause 후 모니터링

---

## 📊 모니터링 권장사항

### 1. Game Wallet 잔액
```bash
# Tonkeeper 또는 Explorer에서 확인
# 잔액 < 인출 요청 합계: 즉시 충전 필요
```

### 2. 인출 패턴
- 시간당 인출 횟수
- 평균 인출 금액
- 이상치 감지

### 3. 컨트랙트 상태
- Paused 여부
- Owner 주소
- Game Wallet 주소

---

## ❗ 문제 해결

### "Only owner can perform this action"
**원인**: Owner가 아닌 지갑으로 실행
**해결**: Owner 지갑으로 전환

### "Contract is paused"
**원인**: 컨트랙트가 정지 상태
**해결**: unpauseContract.ts 실행

### "Amount exceeds max single withdraw"
**원인**: 1,000,000 CSPIN 초과 설정 시도
**해결**: 금액을 1,000,000 이하로 설정

### "Insufficient game wallet balance"
**원인**: Game Wallet CSPIN 부족
**해결**: Game Wallet에 CSPIN 충전

---

## 📞 추가 정보

- **스크립트 사용법**: [SCRIPTS.md](./SCRIPTS.md)
- **보안 권장사항**: [SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md)
- **프론트엔드 통합**: [POC_GUIDE.md](./POC_GUIDE.md)
