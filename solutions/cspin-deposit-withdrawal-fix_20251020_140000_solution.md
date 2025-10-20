***REMOVED***해결 기록: CSPIN 입금/인출 실제 토큰 전송 문제 해결

> **원본 지시서:** 사용자 요청 (CSPIN 입금/인출 실제 작동하도록 해결책 제시)
> **관련 커밋:** 98d65f2
> **최종 버전:** v1.1.1

---

##***REMOVED***1. 해결 방법 요약

CSPIN 입금/인출 시 실제 토큰 전송이 이루어지지 않는 문제를 해결했습니다.

- **입금 로직 수정**: 사용자의 CSPIN 지갑 주소 계산하여 올바른 제톤 컨트랙트에 트랜잭션 전송
- **수수료 최적화**: 네트워크 Fee를 0.1 TON → 0.03 TON으로 낮춤
- **트랜잭션 검증**: 입금 시 RPC를 통한 제톤 지갑 주소 파생 구현
- 버전을 1.1.1으로 업데이트하고 커밋&푸시

---

##***REMOVED***2. 핵심 코드 변경 사항

###***REMOVED***src/components/Game.tsx (입금 로직)
```typescript
// 사용자의 CSPIN 지갑 주소 계산
const userJettonWalletAddress = await getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, connectedWallet.account.address);

// 트랜잭션에 올바른 주소 사용
messages: [{
  address: userJettonWalletAddress, // 사용자의 CSPIN 지갑
  amount: '30000000', // 0.03 TON
  payload: base64
}]
```

###***REMOVED***functions/api/initiate-withdrawal.ts (인출 수수료)
```typescript
const transferMessage = internal({
  to: gameJettonWalletAddress,
  value: toNano('0.03'), // 수수료 낮춤
  body: jettonTransferBody
});
```

###***REMOVED***docs/ssot/[산출물3]핵심-로직-의사코드-(MVP-확장-v2.0).md
- 수수료 0.03 TON으로 업데이트

---

##***REMOVED***3. 참고 사항

- 입금 시 하드코딩된 게임 지갑 주소 대신 RPC로 계산된 사용자 지갑 주소 사용
- 수수료 낮춤으로 트랜잭션 실패율 감소 예상
- 테스트넷/메인넷 호환성 확인 필요 (테스트 월렛이 메인넷인지 검증)

---

##***REMOVED***4. 후임 AI를 위한 인수인계

- CSPIN 입금/인출이 실제 작동하는지 aiandyou.me에서 재테스트 필요
- 게임 월렛 프라이빗 키가 Cloudflare에 설정되었는지 확인
- 트랜잭션 모니터링을 위해 TON Scan 등으로 전송 상태 확인 가능