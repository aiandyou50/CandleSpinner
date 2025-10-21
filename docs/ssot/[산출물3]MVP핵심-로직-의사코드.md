
-----

## **[산출물 3] 핵심 로직 의사코드 (MVP 확장 v2.1.0 최종)**

  * **프로젝트명:** CandleSpinner
  * **대상 단계:** Phase 1-2: MVP → TON 표준 준수
  * **목표:** 게임의 핵심 오프체인 로직(스핀, 확률, 당첨, 미니게임)과 온체인 연동(입출금)을 위한 전체 플로우를 정의한다.
  * **최종 업데이트:** 2025년 10월 21일
  * **상태:** ✅ 현재 코드 반영 (Phase 2 완료)

> **📌 참고**: 이 문서는 게임 로직의 상세 의사코드를 제공합니다.  
> 최신 구현 정보는 `/docs/ssot/README.md` 섹션 6을 참고하세요.

-----

### **A. 백엔드 로직 (Cloudflare Pages Functions - `functions/api/*.ts`)**

  * **설명:** 모든 오프체인 게임 로직, 확률 계산, 사용자 크레딧 관리를 담당합니다. Cloudflare Pages Functions를 사용하여 functions/api/ 디렉토리에 각 API 엔드포인트를 별도 파일로 구현합니다.
  * **데이터베이스:** Cloudflare KV를 사용하여 `user_${walletAddress}`를 Key로, 사용자 크레딧 정보를 Value로 저장합니다. (예: `KV["user_UQBF..."] = { credit: 1000, canDoubleUp: false, pendingWinnings: 0 }`)

#### **A.1. 상수 및 헬퍼 함수 정의**

```
// 심볼 정의 (산출물 1 기반)
DEFINE constant SYMBOLS = {
    "⭐": { multiplier: 0.5, probability: 35 },
    "🪐": { multiplier: 1, probability: 25 },
    "☄️": { multiplier: 2, probability: 15 },
    "🚀": { multiplier: 3, probability: 10 },
    "👽": { multiplier: 5, probability: 7 },
    "💎": { multiplier: 10, probability: 5 },
    "👑": { multiplier: 20, probability: 3 }
}

// 0-99 사이의 숫자를 받아 심볼을 반환하는 확률 헬퍼 함수
FUNCTION getSymbolFromProbability(value):
    IF value < 35 THEN RETURN "⭐"
    ELSE IF value < 60 THEN RETURN "🪐"
    ELSE IF value < 75 THEN RETURN "☄️"
    ELSE IF value < 85 THEN RETURN "🚀"
    ELSE IF value < 92 THEN RETURN "👽"
    ELSE IF value < 97 THEN RETURN "💎"
    ELSE RETURN "👑"
END FUNCTION

// 간단한 해시 함수 (Provably Fair용)
FUNCTION simpleHash(str):
    hash = 0
    FOR each char in str:
        hash = ((hash << 5) - hash) + charCode(char)
        hash = hash & hash  // 32bit 정수로 변환
    RETURN abs(hash)
END FUNCTION

// 시드로부터 숫자 생성
FUNCTION generateNumberFromSeed(seed, index):
    RETURN simpleHash(seed + toString(index)) % 100
END FUNCTION

// KV 데이터베이스 헬퍼 함수
FUNCTION getKVState(wallet, env):
    stateKey = "user_" + wallet
    stateData = await env.CREDIT_KV.get(stateKey)
    IF stateData EXISTS THEN
        RETURN JSON.parse(stateData)
    ELSE
        RETURN { credit: 0, canDoubleUp: false, pendingWinnings: 0 }
    END IF
END FUNCTION

FUNCTION setKVState(wallet, state, env):
    stateKey = "user_" + wallet
    await env.CREDIT_KV.put(stateKey, JSON.stringify(state))
END FUNCTION
```

#### **A.2. API 엔드포인트: `/api/credit-deposit`**

  * **목적:** PoC에서 검증된 온체인 입금이 성공한 후, 프론트엔드가 이 API를 호출하여 오프체인 크레딧을 충전.
  * **요청 (Body):** `{ walletAddress: string, amount: number }`

<!-- end list -->

```
FUNCTION handleApiCreditDeposit(request, env):
    GET { walletAddress, amount } FROM request.body
    
    state = await getKVState(walletAddress, env)
    state.credit = state.credit + amount
    
    await setKVState(walletAddress, state, env)
    
    RETURN { success: true, newCredit: state.credit }
```

#### **A.3. API 엔드포인트: `/api/spin`**

  * **목적:** 메인 게임 스핀을 실행하고 결과를 반환.
  * **요청 (Body):** `{ walletAddress: string, betAmount: number, clientSeed: string }`

<!-- end list -->

```
FUNCTION handleApiSpin(request, env):
    GET { walletAddress, betAmount, clientSeed } FROM request.body
    
    state = await getKVState(walletAddress, env)

    // 1. 유효성 검사 (베팅액 확인, 미니게임 대기 중인지 확인)
    IF betAmount > state.credit THEN
        RETURN ERROR "크레딧이 부족합니다."
    IF state.canDoubleUp IS TRUE THEN
        RETURN ERROR "미니게임 결과를 먼저 처리해야 합니다."

    // 2. 크레딧 차감
    state.credit = state.credit - betAmount
    
    // 3. Provably Fair 기반 릴 결과 생성
    serverSeed = Math.random().toString(36)
    hashedServerSeed = simpleHash(serverSeed).toString()
    combinedSeed = simpleHash(serverSeed + clientSeed).toString()
    
    // 3개의 릴 결과를 0-99 사이의 숫자로 각각 생성
    reel1_value = generateNumberFromSeed(combinedSeed, 1)
    reel2_value = generateNumberFromSeed(combinedSeed, 2)
    reel3_value = generateNumberFromSeed(combinedSeed, 3)
    
    reels = [
        getSymbolFromProbability(reel1_value),
        getSymbolFromProbability(reel2_value),
        getSymbolFromProbability(reel3_value)
    ]
    
    // 4. 당첨금 계산 (산출물 1의 독창적 규칙 적용)
    winnings = 0
    symbolCounts = {} // 각 심볼별 개수
    
    // 심볼 개수 세기
    FOR each symbol in reels:
        symbolCounts[symbol] = (symbolCounts[symbol] OR 0) + 1
    END FOR
    
    // 각 심볼별 당첨금 계산
    FOR (symbol, count) in symbolCounts:
        multiplier = SYMBOLS[symbol].multiplier
        individualPayout = betAmount * multiplier
        winnings = winnings + (individualPayout * count) // "1번째릴 + 2번째릴"
    END FOR
    
    // 5. 잭팟 처리
    isJackpot = (reels[0] == reels[1] AND reels[1] == reels[2])
    IF isJackpot THEN
        winnings = winnings * 100 // 잭팟 보너스
        
    // 6. 상태 저장
    IF winnings > 0 THEN
        state.canDoubleUp = true // 미니게임 기회 활성화
        state.pendingWinnings = winnings // 상금을 '대기' 상태로 저장
    END IF
    
    await setKVState(walletAddress, state, env)
    
    // 7. 결과 반환
    RETURN {
        reels: reels,
        winnings: winnings,
        newCredit: state.credit, // 베팅액만 차감된 크레딧
        isJackpot: isJackpot,
        hashedServerSeed: hashedServerSeed,
        serverSeed: serverSeed // (검증을 위해 스핀 직후 즉시 공개)
    }
```

#### **A.4. API 엔드포인트: `/api/double-up`**

  * **목적:** 미니게임(더블업) 실행.
  * **요청 (Body):** `{ walletAddress: string, choice: 'red' | 'blue', clientSeed: string }`

<!-- end list -->

```
FUNCTION handleApiDoubleUp(request, env):
    GET { walletAddress, choice, clientSeed } FROM request.body
    state = await getKVState(walletAddress, env)

    // 1. 유효성 검사 (미니게임 기회가 있는지)
    IF state.canDoubleUp IS NOT TRUE THEN
        RETURN ERROR "미니게임을 플레이할 수 없습니다."
        
    winningsAtStake = state.pendingWinnings
    state.canDoubleUp = false // 기회는 1회만
    state.pendingWinnings = 0
    
    // 2. Provably Fair 기반 50% 확률 계산
    serverSeed = Math.random().toString(36)
    resultValue = simpleHash(serverSeed + clientSeed) % 2
    winningChoice = (resultValue == 0) ? 'red' : 'blue'
    
    // 3. 결과 처리
    hasWon = (choice == winningChoice)
    IF hasWon THEN
        // 성공: 대기 중인 상금의 2배를 크레딧에 더함
        newWinnings = winningsAtStake * 2
        state.credit = state.credit + newWinnings
        await setKVState(walletAddress, state, env)
        RETURN { won: true, newWinnings: newWinnings }
    ELSE
        // 실패: 대기 중인 상금 소멸, 크레딧 변동 없음
        await setKVState(walletAddress, state, env)
        RETURN { won: false, newWinnings: 0 }
    END IF
```

#### **A.5. API 엔드포인트: `/api/collect-winnings`**

  * **목적:** 미니게임을 포기하고 대기 중인 상금을 크레딧에 합산.
  * **요청 (Body):** `{ walletAddress: string }`

<!-- end list -->

```
FUNCTION handleApiCollect(request, env):
    GET { walletAddress } FROM request.body
    state = await getKVState(walletAddress, env)

    IF state.canDoubleUp IS NOT TRUE THEN
        RETURN ERROR "수령할 상금이 없습니다."

    // 대기 중인 상금을 크레딧에 합산
    collectedAmount = state.pendingWinnings
    state.credit = state.credit + state.pendingWinnings
    state.canDoubleUp = false
    state.pendingWinnings = 0
    
    await setKVState(walletAddress, state, env)
    
    RETURN { success: true, newCredit: state.credit, collectedAmount: collectedAmount }
```

#### **A.5.5. API 엔드포인트: `/api/initiate-deposit` (v1.3.0 추가)**

  * **목적:** 사용자의 CSPIN 토큰을 게임 지갑으로 입금하고 오프체인 크레딧을 충전.
  * **요청 (Body):** `{ walletAddress: string, depositAmount: number }`
  * **환경 변수:** `GAME_WALLET_PRIVATE_KEY` (게임 지갑의 프라이빗 키)

<!-- end list -->

```
FUNCTION handleApiInitiateDeposit(request, env):
    GET { walletAddress, depositAmount } FROM request.body
    
    IF depositAmount <= 0 THEN
        RETURN ERROR "올바르지 않은 입금액입니다."
    
    // 1. 게임 지갑 준비
    gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY
    keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'))
    gameWallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 })
    
    // 2. 게임 지갑의 CSPIN Jetton 지갑 주소 조회
    gameJettonWalletAddress = await getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, gameWallet.address.toString())
    
    // 3. Jetton 전송 메시지 생성
    jettonTransferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(depositAmount.toString())) // amount
        .storeAddress(Address.parse(walletAddress)) // destination (사용자 지갑)
        .storeAddress(Address.parse(gameWallet.address.toString())) // response_destination
        .storeBit(0) // custom_payload
        .storeCoins(toNano('0.01')) // forward_ton_amount
        .storeBit(0) // forward_payload
        .endCell()
    
    // 4. 트랜잭션 생성
    seqno = await getWalletSeqno(gameWallet.address.toString())
    transferMessage = internal({
        to: gameJettonWalletAddress,
        value: toNano('0.03'), // 수수료
        body: jettonTransferBody
    })
    
    transfer = gameWallet.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [transferMessage]
    })
    
    // 5. BOC 생성 및 네트워크 전송
    boc = transfer.toBoc()
    bocBase64 = boc.toString('base64')
    txHash = await sendBocViaAPI(bocBase64) // tonapi.io 사용
    
    // 6. 오프체인 크레딧 업데이트
    state = await getKVState(walletAddress, env)
    state.credit = state.credit + depositAmount
    await setKVState(walletAddress, state, env)
    
    RETURN { 
        success: true, 
        message: 'CSPIN 입금이 성공했습니다.',
        txHash: txHash,
        newCredit: state.credit,
        depositAmount: depositAmount
    }
```

#### **A.6. API 엔드포인트: `/api/initiate-withdrawal`**

  * **목적:** 오프체인 크레딧을 온체인 `CSPIN`으로 인출.
  * **요청 (Body):** `{ walletAddress: string, withdrawalAmount: number }`

<!-- end list -->

```
FUNCTION handleApiInitiateWithdrawal(request, env):
    GET { walletAddress, withdrawalAmount } FROM request.body
    state = await getKVState(walletAddress, env)
    
    IF withdrawalAmount <= 0 OR state.credit < withdrawalAmount THEN
        RETURN ERROR "인출할 수 있는 크레딧이 부족합니다."
    
    // 1. CSPIN 제톤 전송 트랜잭션 생성
    gameWalletPrivateKey = env.GAME_WALLET_PRIVATE_KEY
    keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'))
    gameWallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 })
    
    // CSPIN transfer 메시지 생성
    jettonTransferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(withdrawalAmount.toString())) // amount
        .storeAddress(Address.parse(walletAddress)) // destination
        .storeAddress(Address.parse(gameWallet.address.toString())) // response_destination
        .storeBit(0) // custom_payload
        .storeCoins(toNano('0.01')) // forward_ton_amount
        .storeBit(0) // forward_payload
        .endCell()
    
    // 게임 월렛의 CSPIN 지갑 주소 계산
    gameJettonWalletAddress = await getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, gameWallet.address.toString())
    
      // 내부 메시지 생성
      transferMessage = internal({
        to: gameJettonWalletAddress,
        value: toNano('0.03'), // 수수료 최적화
        body: jettonTransferBody
      })    // 트랜잭션 생성 및 전송
    seqno = 0 // 실제로는 KV에 저장해서 관리
    transfer = gameWallet.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [transferMessage]
    })
    
    boc = transfer.toBoc()
    bocBase64 = boc.toString('base64')
    await sendBocViaTonAPI(bocBase64)
    
    // 2. KV에서 크레딧 차감
    state.credit -= withdrawalAmount
    state.canDoubleUp = false
    state.pendingWinnings = 0
    await setKVState(walletAddress, state, env)
    
        RETURN { success: true, withdrawalAmount, newCredit: state.credit }
```

#### **A.7. API 엔드포인트: `/api/rpc`**

  * **목적:** TON 블록체인 RPC 요청을 프록시하여 CORS 및 API 키 문제를 해결.
  * **요청 (Body):** `{ rpcBody: { jsonrpc: '2.0', id: 1, method: 'runGetMethod', params: {...} } }`

<!-- end list -->

```
FUNCTION handleApiRpc(request, env):
    // 1. 요청 검증 (POST, JSON, API 키)
    IF request.method !== 'POST' THEN RETURN 405
    IF NOT validContentType THEN RETURN 400
    IF NOT validApiKey THEN RETURN 401
    
    // 2. RPC 요청을 백엔드(TonCenter)로 프록시
    backendUrl = env.BACKEND_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC'
    response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: request.body.rpcBody
    })
    
    // 3. 응답을 클라이언트에 전달 (CORS 헤더 포함)
    RETURN response with CORS headers
```

-----
```
        RETURN ERROR "인출할 크레딧이 없습니다."

    // 1. 크레딧 즉시 차감 (중복 인출 방지)
    state.credit = 0
    await setKVState(walletAddress, state, env)
    
    // 2. 인출 큐(Queue)에 작업 등록
    // (Cloudflare Queues 또는 KV를 큐로 활용)
    await addWithdrawalToQueue({ to: walletAddress, amount: amountToWithdraw })
    
    RETURN { success: true, requestedAmount: amountToWithdraw }
```

-----

### **B. 프론트엔드 로직 (React - `src/components/Game.tsx`)**

  * **설명:** 사용자 입력을 받아 백엔드 API를 호출하고, 그 결과를 화면(애니메이션, UI)에 반영합니다.
  * **상태 관리:** Zustand 스토어를 사용하여 `userCredit`, `betAmount`, `reelSymbols`, `lastWinnings`, `isSpinning`, `showDoubleUp`, `isDeveloperMode` 등의 상태를 관리합니다.

#### **B.1. 기능: 크레딧 입금 (PoC 확장)**

```
// PoC에서 사용한 입금 컴포넌트와 연동
FUNCTION handleDepositSuccess(onChainResult, depositAmount):
    // 1. 온체인 트랜잭션 성공 시
    setMessage("온체인 입금 확인. 서버에 크레딧을 등록합니다...")

    // 2. 백엔드에 크레딧 등록 요청
    CALL API `/api/credit-deposit` with { walletAddress: user.address, amount: depositAmount }
    
    .ON_SUCCESS(data):
        setUserCredit(data.newCredit) // UI 크레딧 업데이트
        setMessage("크레딧 충전 완료!")
    .ON_ERROR(error):
        setMessage("크레딧 충전 실패: " + error.message)
```

#### **B.2. 기능: 스핀 실행**

```
FUNCTION handleSpinClick():
    setIsSpinning(true)
    setShowDoubleUp(false) // 미니게임 UI 숨김
    clientSeed = generateRandomString() // 프론트엔드에서 생성

    CALL API `/api/spin` with { walletAddress: user.address, betAmount: betAmount, clientSeed: clientSeed }
    
    .ON_SUCCESS(data):
        // 1. 릴 애니메이션 시작 (ReelPixi 컴포넌트 사용)
        triggerReelAnimation(data.reels) 
        
        // 2. 애니메이션 완료 후 (Callback)
        ON_ANIMATION_COMPLETE:
            setIsSpinning(false)
            setUserCredit(data.newCredit) // 베팅액 차감된 크레딧 반영
            
            IF data.winnings > 0 THEN
                setLastWinnings(data.winnings)
                setShowDoubleUp(true) // [Gamble] / [Collect] 버튼 표시
            END IF
            
            IF data.isJackpot THEN
                playJackpotVideo() // 잭팟 비디오 재생
            END IF
    .ON_ERROR(error):
        setMessage("스핀 오류: " + error.message)
        setIsSpinning(false)
```

#### **B.3. 기능: 미니게임 선택 (`Gamble` / `Collect`)**

```
// "Gamble" (빨간색 또는 파란색) 버튼 클릭 시
FUNCTION handleGambleClick(choice): // choice: 'red' or 'blue'
    clientSeed = generateRandomString()
    
    CALL API `/api/double-up` with { walletAddress: user.address, choice: choice, clientSeed: clientSeed }
    
    .ON_SUCCESS(data):
        setShowDoubleUp(false)
        IF data.won THEN
            setMessage("더블업 성공! 획득 상금: " + data.newWinnings)
            setUserCredit(current => current + data.newWinnings) // 크레딧에 즉시 반영
        ELSE
            setMessage("더블업 실패...")
            setLastWinnings(0)
        END IF

// "Collect" 버튼 클릭 시
FUNCTION handleCollectClick():
    CALL API `/api/collect-winnings` with { walletAddress: user.address }
    
    .ON_SUCCESS(data):
        setUserCredit(data.newCredit) // 크레딧에 합산
        setShowDoubleUp(false)
        setMessage("상금 수령 완료! 수령액: " + data.collectedAmount)
```

#### **B.4. 기능: 상금 인출**

```
FUNCTION handleWithdrawClick():
    IF confirm("정말 " + userCredit + " CSPIN을 모두 인출하시겠습니까?") THEN
        CALL API `/api/initiate-withdrawal` with { walletAddress: user.address }
        
        .ON_SUCCESS(data):
            setUserCredit(0) // UI 크레딧 즉시 0으로
            setMessage("인출 요청 완료: " + data.requestedAmount + " CSPIN (처리까지 몇 분 정도 소요될 수 있습니다)")
        .ON_ERROR(error):
            setMessage("인출 오류: " + error.message)
    END IF
```

-----

### **C. 인출 처리기 (Withdrawal Processor) - (별도 보안 로직)**

  * **설명:** 이것은 사용자 앱과 분리된 **별도의 보안 서버 또는 스크립트**입니다. Cloudflare Worker가 아닌, Private Key를 안전하게 보관할 수 있는 환경(예: AWS Lambda + Secrets Manager, Google Cloud Functions, 또는 전용 서버)에서 실행되어야 합니다.
  * **작동:** 정기적으로(예: 1분마다) 인출 큐(A.6에서 등록된)를 확인하고 실제 온체인 트랜잭션을 실행합니다.

<!-- end list -->

```
FUNCTION processWithdrawalQueue():
    // 1. 큐에서 처리할 작업 가져오기
    job = await getNextJobFromQueue() // e.g., { to: 'USER_WALLET', amount: 1000 }
    IF job IS NULL THEN RETURN

    // 2. 게임 지갑의 Private Key 안전하게 로드
    privateKey = await getSecurelyStoredPrivateKey()
    gameWallet = Wallet.fromPrivateKey(privateKey)
    
    // 3. CSPIN 토큰 전송 트랜잭션 생성 (PoC 로직과 유사하나, '보내는 주체'가 다름)
    CALL buildCSPINTransferTransaction(
        from: gameWallet,
        to: job.to,
        amount: job.amount,
        tokenAddress: CSPIN_TOKEN_ADDRESS
    )
    
    // 4. 트랜잭션 전송 및 로깅
    .ON_SUCCESS(result):
        LOG "인출 성공: " + job.to + "에게 " + job.amount + " CSPIN 전송"
        MARK job as complete
    .ON_ERROR(error):
        LOG "인출 실패: " + error.message
        MARK job as failed (재시도 또는 관리자 알림)

---

### **C. CSPIN 토큰 입금/인출 로직**

#### **C.1. CSPIN 입금 (프론트엔드)**

* **목적:** 사용자가 CSPIN 토큰을 게임 지갑으로 전송하여 크레딧 충전.
* **플로우:**
  1. 사용자가 입금 버튼 클릭.
  2. CSPIN 제톤 월렛 주소 계산 (RPC).
  3. 제톤 전송 페이로드 빌드 (transfer 메시지, TL-B 준수).
  4. TON Connect로 트랜잭션 전송 (사용자 서명).
  5. 성공 시 백엔드에 크레딧 등록.

```typescript
// 프론트엔드: CSPIN 전송 페이로드 빌드
const buildCSPINTransferPayload = (amount: bigint, destination: Address, responseTo: Address) => {
  return beginCell()
    .storeUint(0xF8A7EA5, 32) // op: transfer
    .storeUint(0, 64) // query_id
    .storeCoins(amount) // amount
    .storeAddress(destination) // destination
    .storeAddress(responseTo) // response_destination
    .storeBit(0) // custom_payload: none
    .storeCoins(BigInt(0)) // forward_ton_amount
    .storeBit(1) // forward_payload: right
    .storeBit(0) // forward_payload: nothing
    .endCell();
};

// 입금 처리
const handleDeposit = async () => {
  const userJettonWallet = await getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, userWallet);
  const payload = buildCSPINTransferPayload(amount, GAME_WALLET_ADDRESS, userWallet);
  const tx = { messages: [{ address: userJettonWallet, amount: '30000000', payload: payload.toBoc().toString('base64') }] };
  await tonConnectUI.sendTransaction(tx);
  // 성공 시 handleDepositSuccess 호출
};
```

#### **C.2. CSPIN 인출 (백엔드)**

* **목적:** 사용자의 크레딧을 CSPIN 토큰으로 게임 지갑에서 사용자 지갑으로 전송.
* **플로우:**
  1. 프론트엔드에서 /api/initiate-withdrawal 호출.
  2. 백엔드에서 크레딧 검증 및 차감.
  3. 게임 월렛 프라이빗 키로 제톤 전송 트랜잭션 생성 및 전송.
  4. 성공 시 사용자에게 토큰 전송.

```typescript
// 백엔드: /api/initiate-withdrawal
FUNCTION handleInitiateWithdrawal(request, env):
    GET { walletAddress, withdrawalAmount } FROM request.body
    
    state = await getKVState(walletAddress, env)
    IF state.credit < withdrawalAmount THEN RETURN { success: false, error: 'Insufficient credit' }
    
    state.credit -= withdrawalAmount
    await setKVState(walletAddress, state, env)
    
    // 게임 월렛으로 CSPIN 전송
    gameWallet = Wallet.fromPrivateKey(env.GAME_WALLET_PRIVATE_KEY)
    jettonWallet = await getJettonWalletAddress(CSPIN_TOKEN_ADDRESS, GAME_WALLET_ADDRESS)
    
    payload = buildCSPINTransferPayload(withdrawalAmount * 10**9, walletAddress, GAME_WALLET_ADDRESS)
    tx = { messages: [{ address: jettonWallet, amount: '100000000', payload: payload.toBoc().toString('base64') }] }
    
    result = await gameWallet.sendTransaction(tx)
    
    RETURN { success: true, newCredit: state.credit, withdrawalAmount }
```

### **D. A/B 이중 입금 방식 (v1.5 추가 → v2.1.0 수정)**

#### **D.0. Jetton Transfer Payload 구성 (v2.1.0 핵심 수정)**

* **문제:** 이전 버전에서 `payload: undefined`로 전송하여 "100TON 지갑에 있어야 한다" 오류 발생
* **해결:** PoC 코드에서 제공하는 **Jetton Transfer Payload (opcode: 0xF8A7EA5)** 사용

**Payload 생성 함수:**
```typescript
// Jetton Transfer Payload (Standard Jetton TEP-74)
function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address): string {
  const cell = beginCell()
    .storeUint(0xf8a7ea5, 32)        // Jetton transfer opcode
    .storeUint(0, 64)                 // query_id
    .storeCoins(amount)               // Jetton amount
    .storeAddress(destination)        // 수취인 (게임 지갑)
    .storeAddress(responseTo)         // 응답 주소 (사용자 지갑)
    .storeBit(0)                      // custom_payload: none
    .storeCoins(BigInt(0))            // forward_ton_amount
    .storeBit(0)                      // forward_payload: none
    .endCell();
  return cell.toBoc().toString('base64');
}
```

**TonConnect 트랜잭션 구조 (v2.1.0):**
```typescript
const payload = buildJettonTransferPayload(amountInNano, destinationAddress, responseAddress);

// ✅ v2.0.2 긴급 수정: Address 형식 오류 해결
const jettonWalletAddress = Address.parse(CSPIN_JETTON_WALLET).toString();

const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      address: jettonWalletAddress,  // ← Address.parse().toString() 필수 (v2.0.2)
      amount: '200000000',             // 0.2 TON (for fees)
      payload: payload                 // ← Jetton Transfer Payload 필수
    }
  ]
};
const result = await tonConnectUI.sendTransaction(transaction);
```

**핵심 수정 요소:**
1. **CSPIN_JETTON_WALLET 주소**: 게임 지갑이 아닌, CSPIN 토큰의 Jetton Wallet 주소 사용
2. **Address 형식 (v2.0.2 핵심)**: `Address.parse().toString()` 필수 (TonConnect SDK 요구사항)
3. **payload 필수**: `undefined` 대신 Jetton Transfer Payload 포함
4. **amount**: 게임 지갑이 아닌 CSPIN Jetton 주소로 전송할 때 필요한 TON 가스비

---

**오류 해결 과정 (v2.0.2)**:
| 단계 | 문제 | 해결책 |
|------|------|--------|
| **v2.0.1** | `address: CSPIN_JETTON_WALLET` (문자열) | ❌ TonConnect 거부: "Wrong 'address' format" |
| **v2.0.2** | `address: Address.parse(CSPIN_JETTON_WALLET).toString()` | ✅ 정식 Address 형식 |

#### **D.1. 입금 방식 A: TonConnect 클라이언트 직접 서명 (DepositDirect - v2.1.0 수정)**

* **목적:** 사용자가 자신의 지갑에서 CSPIN을 직접 게임 지갑으로 전송. 백엔드는 KV 크레딧만 업데이트.
* **장점:** 
  - 완전히 탈중앙화 (사용자가 직접 서명)
  - 백엔드 가스비 비용 없음
  - 프라이빗 키 관리 불필요
* **단점:**
  - 사용자가 지갑 앱에서 트랜잭션 서명 필요
  - 추가 단계 필요 (지갑 앱 전환)

**플로우:**
```
1. 사용자가 DepositDirect 컴포넌트에서 입금액 입력
2. TonConnect로 트랜잭션 생성 및 서명 (사용자 지갑에서)
3. 트랜잭션 전송 (온체인)
4. 프론트엔드에서 /api/deposit-complete 호출 (txHash 포함)
5. 백엔드에서 KV에 크레딧 저장
6. 게임 진행 가능
```

**백엔드 엔드포인트: `/api/deposit-complete`**
```
FUNCTION handleDepositComplete(request, env):
    GET { walletAddress, depositAmount, txHash, method } FROM request.body
    
    IF method != 'direct' THEN RETURN { success: false, error: 'Invalid method' }
    
    // KV에서 기존 크레딧 읽기
    key = 'deposit:' + walletAddress
    existing = await env.CREDIT_KV.get(key)
    currentCredit = existing ? parseFloat(existing) : 0
    newCredit = currentCredit + depositAmount
    
    // 트랜잭션 로그 저장
    logKey = 'txlog:' + walletAddress + ':' + timestamp()
    await env.CREDIT_KV.put(logKey, JSON.stringify({
        method: 'direct',
        amount: depositAmount,
        txHash: txHash,
        timestamp: NOW(),
        status: 'confirmed'
    }))
    
    // 크레딧 업데이트
    await env.CREDIT_KV.put(key, newCredit.toString())
    
    RETURN { success: true, newCredit: newCredit }
```

#### **D.2. 입금 방식 B: 백엔드 Ankr RPC 자동 입금 (DepositAuto)**

* **목적:** 백엔드에서 Ankr RPC를 통해 게임 지갑의 CSPIN을 자동으로 사용자에게 전송.
* **장점:**
  - 사용자 UX 최고 (입금액 입력만 하면 자동 처리)
  - 지갑 앱 전환 불필요
  - 완전히 자동화된 프로세스
* **단점:**
  - 백엔드 가스비 비용 발생 (~0.1 TON)
  - 게임사가 초기 TON 보유 필요

**플로우:**
```
1. 사용자가 DepositAuto 컴포넌트에서 입금액 입력
2. /api/deposit-auto 호출 (백엔드로)
3. 백엔드에서 Ankr RPC를 통해 자동 입금 트랜잭션 생성 & 전송
4. KV에 크레딧 저장
5. 프론트엔드에 성공 응답
6. 게임 진행 가능
```

**백엔드 엔드포인트: `/api/deposit-auto`**
```
FUNCTION handleDepositAuto(request, env):
    GET { walletAddress, depositAmount } FROM request.body
    
    // 환경변수 검증
    IF NOT env.ANKR_RPC_URL OR NOT env.GAME_WALLET_KEY THEN
        RETURN { success: false, error: 'Configuration missing' }
    
    // 게임 지갑 설정
    gameWalletPrivateKey = env.GAME_WALLET_KEY
    keyPair = keyPairFromSecretKey(Buffer.from(gameWalletPrivateKey, 'hex'))
    gameWallet = WalletContractV4.create({ publicKey: keyPair.publicKey })
    
    // Ankr RPC로부터 seqno 조회
    seqno = await getSeqnoFromAnkrRPC(env.ANKR_RPC_URL, gameWallet.address.toString())
    
    // Jetton transfer 메시지 생성
    jettonTransferBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // op: transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(depositAmount.toString())) // amount
        .storeAddress(Address.parse(walletAddress)) // destination
        .storeAddress(gameWallet.address) // response_destination
        .storeBit(0) // custom_payload
        .storeCoins(toNano('0.01')) // forward_ton_amount
        .storeBit(0) // forward_payload
        .endCell()
    
    // 트랜잭션 생성
    transferMessage = internal({
        to: CSPIN_JETTON_WALLET,
        value: toNano('0.05'),
        body: jettonTransferBody
    })
    
    transfer = gameWallet.createTransfer({
        seqno: seqno,
        secretKey: keyPair.secretKey,
        messages: [transferMessage],
        sendMode: 3
    })
    
    // BOC로 인코딩
    bocBase64 = transfer.toBoc().toString('base64')
    
    // Ankr RPC로 전송
    txHash = await sendBocViaAnkrRPC(env.ANKR_RPC_URL, bocBase64)
    
    // KV에 크레딧 저장
    key = 'deposit:' + walletAddress
    existing = await env.CREDIT_KV.get(key)
    currentCredit = existing ? parseFloat(existing) : 0
    newCredit = currentCredit + depositAmount
    
    logKey = 'txlog:' + walletAddress + ':' + timestamp()
    await env.CREDIT_KV.put(logKey, JSON.stringify({
        method: 'auto',
        amount: depositAmount,
        txHash: txHash,
        timestamp: NOW(),
        status: 'sent'
    }))
    
    await env.CREDIT_KV.put(key, newCredit.toString())
    
    RETURN { success: true, txHash: txHash, newCredit: newCredit }
```

#### **D.3. 프론트엔드 컴포넌트**

**DepositDirect.tsx:**
- TonConnect 클라이언트 직접 서명
- Jetton transfer 메시지 사용자 지갑에서 생성
- 트랜잭션 해시 백엔드로 전송

**DepositAuto.tsx:**
- 입금액만 입력
- 백엔드 API 호출로 자동 처리
- 결과 즉시 수신

**App.tsx 메인 화면:**
```
┌─────────────────────────────────┐
│   CandleSpinner 메인            │
│                                 │
│  ┌──────────┐    ┌──────────┐  │
│  │ 방식 A  │    │ 방식 B  │  │
│  │💳 직접  │    │🚀 자동  │  │
│  └──────────┘    └──────────┘  │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ ▶️ 게임 시작               │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### **D.4. 환경 변수 설정 (Cloudflare Pages)**

```
A방식 (DepositDirect):
- GAME_WALLET_ADDRESS (공개 주소) - 필수
- CSPIN_TOKEN_ADDRESS (CSPIN 마스터 계약 주소) - 필수
- CSPIN_JETTON_WALLET (게임 지갑의 CSPIN 지갑 주소) - 필수

B방식 (DepositAuto):
- ANKR_RPC_URL = https://rpc.ankr.com/ton_api_v2/ - 필수
- GAME_WALLET_KEY (게임 지갑 프라이빗 키) - 필수 (암호화)
- GAME_WALLET_ADDRESS - 필수
- CSPIN_TOKEN_ADDRESS - 필수
- CSPIN_JETTON_WALLET - 필수
```

#### **D.5. MVP 테스트 전략**

1. **A방식 우선 테스트 (안정성 검증)**
   - 사용자 지갑 연결 테스트
   - TonConnect 직접 서명 테스트
   - 트랜잭션 해시 검증

2. **B방식 추가 테스트 (자동화 검증)**
   - Ankr RPC 연결 테스트
   - 자동 트랜잭션 생성 및 전송 테스트
   - 동시성 문제 (seqno 동기화) 테스트

3. **통합 테스트 (A+B 동시)**
   - 사용자가 A 또는 B 선택 가능
   - 각 입금 방식별 크레딧 누적 검증
   - 게임 플레이 및 출금 검증
```
````