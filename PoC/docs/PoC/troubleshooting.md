# CSPIN 토큰 전송 오류 해결 가이드

## 개요
이 가이드는 CandleSpinner PoC 개발 중 발생한 CSPIN 토큰 전송 관련 오류들의 해결 방법을 정리한 것입니다. TON Connect와 제톤 전송 구현 시 겪을 수 있는 일반적인 문제를 다룹니다.

## 주요 오류 및 해결 방법

### 1. 오류: Transaction verification failed

#### 증상
- 지갑에서 "Something went wrong. Transaction verification failed" 오류 발생
- 트랜잭션이 전송되지 않고 SDK 에러 발생
- 디버그 팩에 "Error: [TON_CONNECT_SDK_ERROR] Rn" 기록

#### 원인
- 제톤 전송 페이로드 구조 불완전
- TON TEP-74 표준에서 요구하는 필드 누락
- boc (Bag of Cells) 생성 실패로 인한 base64 인코딩 오류

#### 해결 단계
1. **TON 표준 확인**
   - TEP-74 제톤 표준 문서 참조
   - 제톤 전송 메시지 구조 검토:
     ```
     transfer#f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress
       response_destination:MsgAddress custom_payload:(Maybe ^Cell)
       forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)
       = InternalMsgBody;
     ```

2. **페이로드 구조 수정**
   ```typescript
   const cell = beginCell()
     .storeUint(0xF8A7EA5, 32)     // op
     .storeUint(0, 64)             // query_id
     .storeCoins(amount)            // amount
     .storeAddress(destination)     // destination
     .storeAddress(responseTo)      // response_destination
     .storeBit(0)                   // custom_payload: none
     .storeCoins(BigInt(0))         // forward_ton_amount
     .storeBit(0)                   // forward_payload: none
     .endCell();
   ```

3. **boc 검증**
   - `cell.toBoc().toString('hex')`로 hex 생성
   - `Buffer.from(hex, 'hex').toString('base64')`로 base64 변환
   - TON Connect에 base64 payload 전달

#### 예방 방법
- TON TEP 문서 철저히 검토
- 제톤 전송 페이로드에 대한 단위 테스트 추가
- boc 생성 후 검증 로직 구현

### 2. 오류: 제톤 지갑 주소 파생 실패

#### 증상
- "RPC 파생 실패. 수동 입력 필요." 메시지
- 자동 제톤 지갑 주소 계산 불가

#### 원인
- ton-core 라이브러리의 `getJettonWalletAddress` 함수 부재
- RPC 호출 실패 또는 네트워크 문제

#### 해결 단계
1. **RPC 기반 파생 구현**
   ```typescript
   const getJettonWalletAddressRpc = async (masterAddress: string, ownerAddress: string) => {
     const body = {
       rpcBody: {
         jsonrpc: '2.0',
         id: 1,
         method: 'runGetMethod',
         params: {
           address: masterAddress,
           method: 'get_wallet_address',
           stack: [['tvm.Slice', ownerAddress]]
         }
       }
     };
     // RPC 호출 및 결과 파싱
   };
   ```

2. **수동 입력 대체**
   - UI에 제톤 지갑 주소 입력 필드 제공
   - TON Scan 등 외부 도구로 주소 확인

#### 예방 방법
- ton-core 라이브러리 업데이트 확인
- RPC 폴백 메커니즘 구현
- 주소 계산 라이브러리 검토

### 3. 오류: 페이로드 빌드 후 복사 기능 문제

#### 증상
- 페이로드 출력 시 `\n` 문자가 표시됨
- 복사된 텍스트에 줄바꿈이 적용되지 않음

#### 원인
- HTML `<pre>` 태그의 줄바꿈 처리 방식
- 템플릿 리터럴의 `\n`이 HTML에서 이스케이프되지 않음

#### 해결 단계
1. **출력 방식 변경**
   ```tsx
   // 변경 전
   <pre>{JSON.stringify(txPreview, null, 2)}\n페이로드 헥스: ${decodedPayloadHex}</pre>

   // 변경 후
   <div>
     <pre>{JSON.stringify(txPreview, null, 2)}</pre>
     <pre>페이로드 헥스: {decodedPayloadHex}</pre>
   </div>
   ```

2. **복사 기능 개선**
   ```tsx
   onClick={() => navigator.clipboard.writeText(
     `${JSON.stringify(txPreview, null, 2)}\n페이로드 헥스: ${decodedPayloadHex}`
   )}
   ```

#### 예방 방법
- UI 컴포넌트 설계 시 줄바꿈 처리 고려
- 복사 기능 테스트 추가

### 4. 오류: 디버그 팩에 txJson 누락

#### 증상
- 트랜잭션 전송 후 디버그 팩에 `txJson`이 null로 기록

#### 원인
- 트랜잭션 전송 실패 시 `lastTxJson`이 설정되지 않음
- 에러 처리 로직 누락

#### 해결 단계
1. **트랜잭션 결과 저장**
   ```typescript
   try {
     const result = await tonConnectUI.sendTransaction(tx);
     setLastTxJson(JSON.stringify(result));
   } catch (e) {
     setLastError(String(e));
     // txJson은 null로 유지
   }
   ```

2. **디버그 팩 개선**
   - 에러 정보와 함께 저장
   - 타임스탬프 및 환경 정보 포함

#### 예방 방법
- 트랜잭션 상태 관리 개선
- 디버그 로깅 강화

## 일반적인 예방 조치

### 1. TON 생태계 이해
- TEP (TON Enhancement Proposals) 문서 정기 확인
- TON 개발자 커뮤니티 참여

### 2. 테스트 환경 구축
- 로컬 테스트넷 사용
- 단위 테스트 및 통합 테스트 구현

### 3. 에러 처리 강화
- 사용자 친화적 에러 메시지
- 디버그 정보 수집 및 분석

### 4. 코드 품질 관리
- TypeScript 엄격 모드 사용
- 코드 리뷰 및 페어 프로그래밍

## 관련 리소스
- [TON TEP-74: Jetton Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
- [TON Connect Documentation](https://docs.ton.org/develop/dapps/ton-connect)
- [ton-core Library](https://github.com/ton-org/ton-core)

## 문의
문제가 발생하면 GitHub Issues에 보고해주세요.