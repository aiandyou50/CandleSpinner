#***REMOVED*****[산출물 3] 핵심 로직 의사코드 (Pseudocode for Core Logic)**

  * **프로젝트명:** CandleSpinner
  * **대상 단계:** Phase 0: PoC (Proof of Concept)
  * **목표:** React 환경에서 TON Connect를 사용하여 CSPIN 토큰 전송 트랜잭션을 성공적으로 실행하는 로직을 정의한다.
  * **상태 :** 2025.10.18.기준으로 PoC 검증은 완료 되었습니다.

##***REMOVED*****1. 전역 설정 (Global Configuration)**

```
// 파일: src/constants.ts

// 게임 지갑 주소 (실제 자금을 받을 주소)
DEFINE constant GAME_WALLET_ADDRESS = "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"

// CSPIN 토큰의 스마트 컨트랙트(Jetton) 주소
DEFINE constant CSPIN_TOKEN_ADDRESS = "EQBZ6nHfmT2wct9d4MoOdNPzhtUGXOds1y3NTmYUFHAA3uvV"

// TON Connect 매니페스트 URL (앱 정보 파일)
// 이 URL은 Cloudflare Pages에 배포된 후 실제 경로로 지정해야 함
DEFINE constant TON_CONNECT_MANIFEST_URL = "https://aiandyou.me/tonconnect-manifest.json"
```

##***REMOVED*****2. 메인 애플리케이션 컴포넌트 (`App.tsx`)**

```
// 파일: src/App.tsx

// --- 1. 초기화 ---
// 라이브러리 임포트: React, TonConnectUIProvider, TonConnectButton, useTonWallet
IMPORT React libraries
IMPORT { TonConnectUIProvider, TonConnectButton } from "@tonconnect/ui-react"
IMPORT { PoCComponent } from "./PoCComponent"

// --- 2. UI 렌더링 ---
FUNCTION App():
    // TonConnectUIProvider로 전체 앱을 감싸서 지갑 연결 기능을 전역적으로 활성화
    RETURN (
        <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
            <div>
                <h1>CandleSpinner PoC</h1>

                // 우측 상단에 지갑 연결 버튼을 항상 표시
                <header style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <TonConnectButton />
                </header>

                // 핵심 PoC 기능을 담은 컴포넌트를 렌더링
                <PoCComponent />
            </div>
        </TonConnectUIProvider>
    )
END FUNCTION
```

##***REMOVED*****3. PoC 핵심 기능 컴포넌트 (`PoCComponent.tsx`)**

```
// 파일: src/PoCComponent.tsx

// --- 1. 초기화 ---
// 라이브러리 임포트: React hooks, TON 관련 라이브러리, 상수
IMPORT { useState } from "react"
IMPORT { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react"
IMPORT { Address, toNano } from "ton-core"
IMPORT { GAME_WALLET_ADDRESS } from "./constants"

// --- 2. 컴포넌트 정의 ---
FUNCTION PoCComponent():
    // --- 3. 상태 관리 (State Management) ---
    // 사용자가 연결한 지갑 정보를 가져오는 훅
    // wallet 객체는 지갑 주소, 체인 정보 등을 포함. 연결 안되면 null.
    GET connectedWallet = useTonWallet()

    // 트랜잭션 전송 기능을 제어하는 훅
    GET [tonConnectUI] = useTonConnectUI()

    // 사용자가 입력할 CSPIN 입금 수량을 저장할 상태
    // 기본값은 '100'으로 설정
    STATE depositAmount, setDepositAmount = useState("100")

    // --- 4. 핵심 기능: CSPIN 입금 처리 함수 ---
    FUNCTION handleDeposit():
        // 4.1. 유효성 검사: 지갑이 연결되지 않았으면 함수 종료
        IF connectedWallet IS NULL THEN
            ALERT "지갑을 먼저 연결해주세요."
            RETURN
        END IF

        // 4.2. 트랜잭션 메시지 생성
        // TON 블록체인에서 Jetton(토큰)을 전송하기 위한 표준 메시지 구조
        // 이 구조는 AI 코딩 에이전트가 ton-core 라이브러리를 사용하여 구현해야 함
        CREATE transactionMessageBody = {
            opcode: 0x0f8a7ea5, // Jetton 전송을 위한 Operation Code
            queryId: 0,
            amount: toNano(depositAmount), // 사용자가 입력한 값을 나노 단위로 변환
            destination: Address.parse(GAME_WALLET_ADDRESS), // 최종 수신자 (게임 지갑)
            responseDestination: connectedWallet.account.address, // 가스비 잔액 반환 주소
            forwardTonAmount: toNano('0.02'), // 메시지 포워딩에 필요한 최소 TON 수수료
            forwardPayload: null // 추가 데이터 없음
        }

        // 4.3. 트랜잭션 객체 정의
        // 실제 블록체인에 보낼 트랜잭션의 최종 형태
        CREATE transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 트랜잭션 유효 시간 (10분)
            messages: [
                {
                    // CSPIN 토큰 컨트랙트 주소로 메시지를 보냄
                    address: CSPIN_TOKEN_ADDRESS,
                    // 보낼 금액: 토큰 전송 트랜잭션을 처리하기 위한 최소한의 TON (가스비)
                    // 보통 0.05 TON 정도면 충분함
                    amount: toNano('0.05'),
                    // 보낼 데이터: 위에서 생성한 메시지 본문(payload)
                    payload: transactionMessageBody.toBoc().toString("base64")
                }
            ]
        }

        // 4.4. 트랜잭션 전송 요청
        // tonConnectUI 훅을 사용하여 사용자에게 트랜잭션 서명 및 전송을 요청
        // 이 함수를 호출하면 사용자 텔레그램 Wallet에 팝업이 나타남
        CALL tonConnectUI.sendTransaction(transaction)
            .THEN(result => {
                // 성공 시
                PRINT "트랜잭션 성공! 결과:", result
                ALERT "CSPIN 입금이 성공적으로 요청되었습니다!"
            })
            .CATCH(error => {
                // 실패 또는 사용자가 거절 시
                PRINT "트랜잭션 실패 또는 거절됨:", error
                ALERT "입금에 실패했습니다."
            })
    END FUNCTION

    // --- 5. UI 렌더링 ---
    RETURN (
        <div>
            // 지갑이 연결되었을 때만 입금 UI를 보여줌
            IF connectedWallet IS NOT NULL THEN
                <h2>CSPIN 입금하기</h2>
                <p>연결된 지갑: {connectedWallet.account.address}</p>
                <input
                    type="number"
                    value={depositAmount}
                    onChange={event => setDepositAmount(event.target.value)}
                />
                <button onClick={handleDeposit}>
                    {depositAmount} CSPIN 입금
                </button>
            ELSE
                <p>게임을 시작하려면 지갑을 연결해주세요.</p>
            END IF
        </div>
    )
END FUNCTION
```