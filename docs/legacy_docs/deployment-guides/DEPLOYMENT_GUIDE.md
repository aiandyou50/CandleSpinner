# WithdrawalManager 테스트넷 배포 안내

## 배포 전 확인

✅ 배포자 지갑: kQB_yGkOExm0kP1--22Kx7EwllpC67Fk2xpZcfjUt7vic5Ml
✅ 잔액: 0.05+ TON (이미 받음)
✅ 스마트컨트랙트: WithdrawalManager.tact (빌드 완료)

## 배포 방법

### 방법 1: Tonkeeper (권장)
```bash
npm run deploy
```

1. "testnet" 선택
2. "Tonkeeper" 선택
3. QR 코드 스캔
4. 트랜잭션 서명

### 배포 완료 확인
```bash
cat deployment-info.json
```

## 배포 정보

- **Owner**: EQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8JaY
- **CSPIN Jetton**: EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV
- **네트워크**: Testnet
- **예상 가스비**: 0.05 TON

## 배포 후 확인

- 배포 정보: `docs/deployment-info.json`
- 테스트넷 탐색기: https://testnet.tonscan.org
