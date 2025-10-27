import "@stdlib/deploy";
import "@stdlib/ownable";

/**
 * CSPIN Withdrawal System (Pull 방식)
 * 
 * 사용자가 게임 컨트랙트에 저장된 claimable amount를 직접 인출하는 스마트컨트랙트
 * 모든 네트워크 수수료는 사용자가 부담합니다.
 * 
 * 메커니즘:
 * 1. 게임 백엔드가 사용자의 claimable amount를 설정 (setClaimable)
 * 2. 사용자가 프론트엔드에서 "인출" 버튼 클릭
 * 3. 스마트컨트랙트의 claim() 함수가 호출됨
 * 4. 컨트랙트가 게임지갑의 Jetton Wallet에 전송 명령 전송
 * 5. 사용자 Jetton Wallet으로 CSPIN 토큰 전송
 */

// Jetton Transfer 메시지 (TON 표준)
message JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Cell?;
}

// 인출 요청 메시지 (외부 메시지)
message ClaimRequest {
    queryId: Int as uint64;
}

// 관리자가 claimable amount 설정
message SetClaimable {
    user: Address;
    amount: Int as coins;
}

contract CSPINWithdrawal with Deployable, Ownable {
    owner: Address;  // 게임 백엔드 주소 (관리자)
    jettonMaster: Address;  // CSPIN Jetton Master
    gameJettonWallet: Address;  // 게임지갑의 Jetton Wallet 주소
    
    // 사용자별 인출 가능한 금액 저장
    claimableAmounts: map<Address, Int>;

    init(
        owner: Address,
        jettonMaster: Address,
        gameJettonWallet: Address
    ) {
        self.owner = owner;
        self.jettonMaster = jettonMaster;
        self.gameJettonWallet = gameJettonWallet;
        self.claimableAmounts = emptyMap();
    }

    // 관리자가 사용자의 claimable amount 설정
    receive(msg: SetClaimable) {
        self.requireOwner();
        require(msg.amount >= 0, "Amount cannot be negative");
        
        self.claimableAmounts.set(msg.user, msg.amount);
    }

    // 사용자가 자신의 토큰을 인출 (Pull 방식)
    receive(msg: ClaimRequest) {
        let sender: Address = sender();
        let claimable: Int? = self.claimableAmounts.get(sender);
        
        require(claimable != null, "No claimable amount");
        let amount: Int = claimable!!;
        require(amount > 0, "Claimable amount is zero");
        
        // Reentrancy 방지: 먼저 상태 초기화
        self.claimableAmounts.set(sender, 0);
        
        // 게임지갑의 Jetton Wallet에 전송 요청
        send(SendParameters{
            to: self.gameJettonWallet,
            value: ton("0.1"),  // Jetton 전송 비용
            mode: SendPayGasSeparately,
            body: JettonTransfer{
                queryId: msg.queryId,
                amount: amount,
                destination: sender,  // 사용자 주소
                responseDestination: self.owner,  // 응답은 owner에게
                customPayload: null,
                forwardTonAmount: ton("0.01"),  // 사용자에게 알림 비용
                forwardPayload: null
            }.toCell()
        });
    }

    // Get 메서드: 사용자의 claimable amount 조회
    get fun getClaimable(user: Address): Int {
        let amount: Int? = self.claimableAmounts.get(user);
        if (amount == null) {
            return 0;
        }
        return amount!!;
    }

    // Get 메서드: 컨트랙트 잔액 조회
    get fun balance(): Int {
        return myBalance();
    }

    // Get 메서드: 컨트랙트 정보
    get fun contractInfo(): ContractInfo {
        return ContractInfo{
            owner: self.owner,
            jettonMaster: self.jettonMaster,
            gameJettonWallet: self.gameJettonWallet
        };
    }
}

// 컨트랙트 정보 구조체
struct ContractInfo {
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
}
