
-----

#***REMOVED*****[산출물 3] 핵심 로직 의사코드 (MVP 확장 v2.0)**

  * **프로젝트명:** CandleSpinner
  * **대상 단계:** Phase 1: MVP (Minimum Viable Product)
  * **목표:** 게임의 핵심 오프체인 로직(스핀, 확률, 당첨, 미니게임)과 온체인 연동(입출금)을 위한 전체 플로우를 정의한다.

-----

##***REMOVED*****A. 백엔드 로직 (Cloudflare Pages Functions - `functions/api/*.ts`)**

  * **설명:** 모든 오프체인 게임 로직, 확률 계산, 사용자 크레딧 관리를 담당합니다. Cloudflare Pages Functions를 사용하여 functions/api/ 디렉토리에 각 API 엔드포인트를 별도 파일로 구현합니다.
  * **데이터베이스:** Cloudflare KV를 사용하여 `user_${walletAddress}`를 Key로, 사용자 크레딧 정보를 Value로 저장합니다. (예: `KV["user_UQBF..."] = { credit: 1000, canDoubleUp: false, pendingWinnings: 0 }`)

###***REMOVED*****A.1. 상수 및 헬퍼 함수 정의**

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

###***REMOVED*****A.2. API 엔드포인트: `/api/credit-deposit`**

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

###***REMOVED*****A.3. API 엔드포인트: `/api/spin`**

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

###***REMOVED*****A.4. API 엔드포인트: `/api/double-up`**

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

###***REMOVED*****A.5. API 엔드포인트: `/api/collect-winnings`**

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

###***REMOVED*****A.6. API 엔드포인트: `/api/initiate-withdrawal`**

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
        value: toNano('0.05'), // 수수료 포함
        body: jettonTransferBody
    })
    
    // 트랜잭션 생성 및 전송
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

##***REMOVED*****B. 프론트엔드 로직 (React - `src/components/Game.tsx`)**

  * **설명:** 사용자 입력을 받아 백엔드 API를 호출하고, 그 결과를 화면(애니메이션, UI)에 반영합니다.
  * **상태 관리:** Zustand 스토어를 사용하여 `userCredit`, `betAmount`, `reelSymbols`, `lastWinnings`, `isSpinning`, `showDoubleUp`, `isDeveloperMode` 등의 상태를 관리합니다.

###***REMOVED*****B.1. 기능: 크레딧 입금 (PoC 확장)**

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

###***REMOVED*****B.2. 기능: 스핀 실행**

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

###***REMOVED*****B.3. 기능: 미니게임 선택 (`Gamble` / `Collect`)**

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

###***REMOVED*****B.4. 기능: 상금 인출**

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

##***REMOVED*****C. 인출 처리기 (Withdrawal Processor) - (별도 보안 로직)**

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
```