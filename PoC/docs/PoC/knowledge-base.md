# TON Connect 제톤 전송 구현 FAQ

## 기본 개념

### Q: TON Connect란 무엇인가요?
A: TON Connect는 TON 블록체인 지갑을 웹 dApp에 연결하기 위한 표준 프로토콜입니다. Telegram Wallet, Tonkeeper 등의 지갑 앱을 지원합니다.

### Q: 제톤(Jetton)이란 무엇인가요?
A: TON 블록체인에서 fungible 토큰을 구현하는 표준입니다. ERC-20과 유사하며, TEP-74에 정의되어 있습니다.

### Q: 제톤 지갑 주소는 어떻게 계산되나요?
A: 제톤 마스터 컨트랙트의 `get_wallet_address` 메서드를 호출하여 계산합니다. 파라미터는 토큰 소유자의 주소입니다.

## 구현 관련

### Q: 제톤 전송 페이로드를 어떻게 만드나요?
A: TON TEP-74 표준에 따라 다음과 같은 구조로 만듭니다:

```typescript
const cell = beginCell()
  .storeUint(0xF8A7EA5, 32)     // op: transfer
  .storeUint(queryId, 64)       // query_id
  .storeCoins(amount)            // amount
  .storeAddress(destination)     // destination
  .storeAddress(responseTo)      // response_destination
  .storeBit(0)                   // custom_payload (none)
  .storeCoins(forwardTonAmount)  // forward_ton_amount
  .storeBit(0)                   // forward_payload (none)
  .endCell();
```

### Q: 트랜잭션 전송 시 필요한 파라미터는 무엇인가요?
A: TON Connect의 `sendTransaction` 메서드에 다음 객체를 전달합니다:

```typescript
const tx = {
  validUntil: Math.floor(Date.now() / 1000) + 600, // 10분 후 만료
  messages: [{
    address: jettonWalletAddress,  // 제톤 지갑 주소
    amount: '100000000',           // TON 수량 (nano)
    payload: bocBase64             // 페이로드 base64
  }]
};
```

### Q: boc를 base64로 변환하는 방법은?
A: ton-core를 사용하여 boc를 생성하고 base64로 변환합니다:

```typescript
const boc = cell.toBoc();
const hex = boc.toString('hex');
const base64 = Buffer.from(hex, 'hex').toString('base64');
```

## 오류 해결

### Q: "Transaction verification failed" 오류가 발생합니다
A: 다음을 확인하세요:
1. 페이로드 구조가 TEP-74 표준을 준수하는지
2. custom_payload와 forward_payload 필드가 포함되어 있는지
3. boc가 올바르게 생성되었는지
4. 지갑 주소가 올바른 제톤 지갑 주소인지

### Q: 제톤 지갑 주소 파생이 실패합니다
A: 다음 방법으로 해결하세요:
1. RPC를 사용하여 `runGetMethod` 호출
2. TON Scan이나 다른 블록체인 탐색기로 수동 확인
3. ton-core 라이브러리 버전 업데이트

### Q: boc 생성 시 오류가 발생합니다
A: boc 생성 코드를 검토하세요:
- 모든 필드가 올바른 순서로 저장되었는지
- address와 coins 타입이 맞는지
- cell이 제대로 닫혔는지 (.endCell())

## 모범 사례

### Q: 제톤 전송 구현 시 주의할 점은?
A:
- 항상 최신 TEP-74 표준을 따르세요
- 사용자에게 충분한 gas fee 정보를 제공하세요
- 트랜잭션 실패 시 명확한 에러 메시지를 표시하세요
- 테스트넷에서 충분히 테스트하세요

### Q: 보안상 고려할 점은?
A:
- 사용자 지갑 주소 외 민감 정보 저장 금지
- 트랜잭션 파라미터 클라이언트 사이드 검증
- HTTPS 사용 강제
- API 키 안전하게 관리

### Q: 성능 최적화 방법은?
A:
- 불필요한 RPC 호출 최소화
- boc 생성 캐싱 (가능한 경우)
- React 컴포넌트 최적화 (memo, lazy loading)

## 고급 주제

### Q: 커스텀 페이로드가 있는 제톤 전송은 어떻게 하나요?
A: custom_payload 필드에 Cell을 저장합니다:

```typescript
const customCell = beginCell()
  .storeUint(customOp, 32)
  .storeAddress(customAddress)
  .endCell();

const payload = beginCell()
  // ... 기본 필드
  .storeBit(1)              // custom_payload 존재
  .storeRef(customCell)     // custom_payload
  // ... 나머지 필드
  .endCell();
```

### Q: forward_payload는 언제 사용하나요?
A: forward_ton_amount > 0일 때 사용합니다. 수신자가 추가 작업을 수행할 때 TON을 함께 보낼 수 있습니다.

### Q: 다중 메시지 트랜잭션은 어떻게 보내나요?
A: messages 배열에 여러 메시지를 추가합니다:

```typescript
const tx = {
  validUntil: ...,
  messages: [
    { address: addr1, amount: amt1, payload: payload1 },
    { address: addr2, amount: amt2, payload: payload2 }
  ]
};
```

## 툴과 라이브러리

### Q: 추천 개발 도구는?
A:
- **ton-core**: TON 기본 기능
- **@tonconnect/ui-react**: React용 TON Connect
- **TON Scan**: 블록체인 탐색기
- **TON Testnet**: 테스트 환경

### Q: 디버깅 도구는?
A:
- 브라우저 개발자 도구 콘솔
- TON 개발자 포럼
- GitHub Issues
- Discord 커뮤니티

## 관련 리소스

### 공식 문서
- [TON Documentation](https://docs.ton.org/)
- [TEP-74 Jetton Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
- [TON Connect Docs](https://docs.ton.org/develop/dapps/ton-connect)

### 커뮤니티
- [TON Dev Chat](https://t.me/tondev)
- [TON Developers](https://github.com/ton-org)
- [Stack Overflow TON 태그](https://stackoverflow.com/questions/tagged/ton)

### 예제 코드
- [ton-core Examples](https://github.com/ton-org/ton-core/tree/main/examples)
- [TON Connect Examples](https://github.com/ton-connect)

## 버전 정보
- **ton-core**: v0.50.0
- **@tonconnect/ui-react**: v2.3.1
- **TEP-74**: v1.0
- **마지막 업데이트**: 2025년 10월 18일

## 기여
이 문서에 기여하려면 Pull Request를 보내주세요. 새로운 질문이나 답변이 있으면 추가해주세요.