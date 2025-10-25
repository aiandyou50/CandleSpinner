#pragma version >=0.2.0;

import "@stdlib/deploy";
import "@stdlib/ownable";
import "@stdlib/stoppable";

/**
 * Jetton 표준 상수 (TEP-74)
 * @see https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
 */
const JETTON_TRANSFER: Int = 0xf8a7ea5;
const JETTON_TRANSFER_NOTIFICATION: Int = 0x7362d09c;
const JETTON_BURN_NOTIFICATION: Int = 0x7bdd97de;

/**
 * 게임 메시지 타입 (opcode)
 */
const OP_WITHDRAWAL_REQUEST: Int = 0x57495452;    // "WITR"
const OP_WITHDRAWAL_SUCCESS: Int = 0x57495453;    // "WITS"
const OP_WITHDRAWAL_FAILED: Int = 0x57495446;     // "WITF"
const OP_GAS_COLLECTION: Int = 0x47415344;        // "GASD"
const OP_PAUSE: Int = 0x50415553;                 // "PAUS"
const OP_RESUME: Int = 0x52455355;                // "RESU"

/**
 * 사용자 지불형 CSPIN 인출 스마트컨트랙트
 * 
 * 주요 기능:
 * 1. 게임이 보유한 CSPIN 토큰 보관
 * 2. 사용자 인출 요청 처리
 * 3. 사용자 지갑에서 가스비 청구
 * 4. Jetton 표준 준수하여 토큰 전송
 * 
 * @author CandleSpinner Game Team
 * @date 2025-10-25
 */
contract WithdrawalManager with Deployable, Ownable {
    
    // ========== 상태 변수 ==========
    
    /**
     * 게임 관리자 주소
     * 오직 게임 백엔드만 인출 요청을 보낼 수 있음
     */
    owner: Address;
    
    /**
     * CSPIN Jetton 마스터 컨트랙트
     * Jetton 메타데이터와 minter 정보 제공
     */
    jettonMaster: Address;
    
    /**
     * 게임의 CSPIN 지갑 주소
     * 게임이 보유한 모든 CSPIN 토큰이 이 지갑에 있음
     */
    gameJettonWallet: Address;
    
    /**
     * 처리된 요청 카운트 (모니터링용)
     */
    processedRequests: Int = 0;
    
    /**
     * 전송한 총 CSPIN 양 (모니터링용, nanotons)
     */
    totalWithdrawn: Int = 0;
    
    /**
     * 징수한 총 가스비 (모니터링용, nanotons)
     */
    totalGasCollected: Int = 0;
    
    /**
     * 긴급 정지 플래그
     */
    paused: Bool = false;
    
    // ========== 메시지 타입 정의 ==========
    
    /**
     * 사용자의 CSPIN 인출 요청
     * 
     * 게임 백엔드에서 호출:
     * await contract.send(wallet, transaction, {
     *   amount: toNano("0.05"),  // 트랜잭션 비용
     *   body: beginCell()
     *     .storeUint(OP_WITHDRAWAL_REQUEST, 32)
     *     .storeUint(queryId, 64)
     *     .storeCoins(amount)
     *     .storeAddress(userAddress)
     *     .endCell()
     * });
     */
    message WithdrawalRequest {
        queryId: UInt64;           // 게임 시스템의 요청 ID (추적용)
        amount: Coins;             // 인출할 CSPIN 양 (nanotons)
        destination: Address;      // 사용자 지갑 주소
    }
    
    /**
     * 게임 백엔드에서 징수한 가스비 회수
     * (선택적 - 게임이 필요할 때만 호출)
     */
    message WithdrawGasCollection {
        queryId: UInt64;
    }
    
    // ========== 초기화 ==========
    
    /**
     * 컨트랙트 초기화
     * 배포 시점에만 호출
     */
    init(jettonMaster: Address, gameJettonWallet: Address) {
        self.owner = sender();
        self.jettonMaster = jettonMaster;
        self.gameJettonWallet = gameJettonWallet;
    }
    
    // ========== 핵심 함수 ==========
    
    /**
     * 사용자 인출 요청 처리
     * 
     * 플로우:
     * 1. 요청 검증 (권한, 금액)
     * 2. 사용자 지갑에서 가스비 청구
     * 3. Jetton 표준 메시지로 토큰 전송
     * 4. 상태 업데이트 (모니터링)
     */
    receive(msg: WithdrawalRequest) {
        // 1️⃣ 권한 검증: 오직 게임 백엔드만 호출 가능
        self.requireOwner();
        
        // 2️⃣ 정지 상태 확인
        require(!self.paused, "Contract is paused");
        
        // 3️⃣ 금액 검증
        require(msg.amount > 0, "Withdrawal amount must be positive");
        require(msg.amount <= ton("1000000"), "Withdrawal amount exceeds limit");
        
        // 4️⃣ 주소 검증 (기본적인 검증)
        let destination: Address = msg.destination;
        
        // 5️⃣ 가스비 정책
        let gasFee: Coins = ton("0.01");          // 약 $0.01 (TON 가격 5$ 기준)
        let forwardAmount: Coins = ton("0.001");  // forward amount
        let transactionFee: Coins = ton("0.05");  // Jetton 전송 비용
        
        // 6️⃣ Jetton Transfer 메시지 구성 (TEP-74 표준)
        let transferPayload: Cell = beginCell()
            .storeUint(JETTON_TRANSFER, 32)       // Opcode
            .storeUint(msg.queryId, 64)           // Query ID
            .storeCoins(msg.amount)               // 전송할 토큰 양
            .storeAddress(destination)            // 수신자 주소
            .storeAddress(self.owner)             // 응답 받을 주소 (게임)
            .storeBit(0)                          // custom_payload (없음)
            .storeCoins(forwardAmount)            // forward_ton_amount
            .storeBit(0)                          // forward_payload (없음)
            .endCell();
        
        // 7️⃣ Jetton 전송 (게임의 Jetton 지갑으로)
        send(SendParameters{
            to: self.gameJettonWallet,
            amount: transactionFee,
            mode: SendPayGasSeparately,
            body: transferPayload
        });
        
        // 8️⃣ 사용자 지갑에서 가스비 청구
        // 중요: 사용자가 이 비용을 지불함
        send(SendParameters{
            to: sender(),
            amount: gasFee,
            mode: SendIgnoreErrors,
            body: emptyCell()
        });
        
        // 9️⃣ 상태 업데이트 (모니터링용)
        self.processedRequests += 1;
        self.totalWithdrawn += msg.amount;
        self.totalGasCollected += gasFee;
    }
    
    /**
     * 긴급 정지
     */
    receive("pause") {
        self.requireOwner();
        self.paused = true;
    }
    
    /**
     * 재개
     */
    receive("resume") {
        self.requireOwner();
        self.paused = false;
    }
    
    /**
     * 징수한 가스비 회수 (선택사항)
     */
    receive(msg: WithdrawGasCollection) {
        self.requireOwner();
        
        if (self.totalGasCollected > 0) {
            let amount: Coins = self.totalGasCollected;
            self.totalGasCollected = 0;
            
            send(SendParameters{
                to: sender(),
                amount: amount,
                mode: SendIgnoreErrors,
                body: emptyCell()
            });
        }
    }
    
    // ========== Getter 함수 ==========
    
    /**
     * 컨트랙트 통계 조회
     * @returns (processedRequests, totalWithdrawn, totalGasCollected, isPaused)
     */
    get fun stats(): (Int, Int, Int, Bool) {
        return (self.processedRequests, self.totalWithdrawn, self.totalGasCollected, self.paused);
    }
    
    /**
     * 정지 상태 조회
     */
    get fun isPaused(): Bool {
        return self.paused;
    }
    
    /**
     * 처리된 요청 수 조회
     */
    get fun getProcessedRequests(): Int {
        return self.processedRequests;
    }
    
    /**
     * 총 출금액 조회
     */
    get fun getTotalWithdrawn(): Int {
        return self.totalWithdrawn;
    }
    
    /**
     * 징수한 총 가스비 조회
     */
    get fun getTotalGasCollected(): Int {
        return self.totalGasCollected;
    }
    
    /**
     * 소유자 조회
     */
    get fun getOwner(): Address {
        return self.owner;
    }
    
    /**
     * 게임 Jetton 지갑 조회
     */
    get fun getGameJettonWallet(): Address {
        return self.gameJettonWallet;
    }
    
    /**
     * Jetton 마스터 조회
     */
    get fun getJettonMaster(): Address {
        return self.jettonMaster;
    }
}
