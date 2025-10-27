import "@stdlib/deploy";
import "@stdlib/ownable";

/**
 * CSPIN Withdrawal System (자동화 버전)
 * 
 * 게임 백엔드가 Jetton을 전송하면 자동으로 처리
 * SetClaimable 수동 호출 불필요
 * 
 * 작동 방식:
 * 1. 게임에서 사용자가 토큰 획득
 * 2. 게임 백엔드가 Jetton Notification으로 전송
 * 3. 컨트랙트가 자동으로 사용자 Jetton Wallet로 전송
 */

message JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Cell?;
}

message JettonTransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Slice;
}

message UpdateGameWallet {
    newWallet: Address;
}

message UpdateContractWallet {
    newWallet: Address;
}

message WithdrawTON {
    amount: Int as coins;
}

contract CSPINWithdrawalAuto with Deployable, Ownable {
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
    contractJettonWallet: Address;  // 이 컨트랙트의 Jetton Wallet
    
    // 보안 기능
    paused: Bool;
    maxSingleWithdraw: Int;
    
    // 통계
    totalWithdrawn: Int;
    withdrawCount: Int;

    init(
        owner: Address,
        jettonMaster: Address,
        gameJettonWallet: Address,
        contractJettonWallet: Address
    ) {
        self.owner = owner;
        self.jettonMaster = jettonMaster;
        self.gameJettonWallet = gameJettonWallet;
        self.contractJettonWallet = contractJettonWallet;
        self.paused = false;
        self.maxSingleWithdraw = 1000000000000000;  // 1,000,000 CSPIN
        self.totalWithdrawn = 0;
        self.withdrawCount = 0;
    }

    // ===== 긴급 정지 =====
    
    receive("pause") {
        self.requireOwner();
        self.paused = true;
    }
    
    receive("unpause") {
        self.requireOwner();
        self.paused = false;
    }
    
    // ===== 게임 Wallet 업데이트 =====
    
    receive(msg: UpdateGameWallet) {
        self.requireOwner();
        require(msg.newWallet != newAddress(0, 0), "Invalid address");
        self.gameJettonWallet = msg.newWallet;
    }
    
    // ===== 컨트랙트 Jetton Wallet 업데이트 =====
    
    receive(msg: UpdateContractWallet) {
        self.requireOwner();
        require(msg.newWallet != newAddress(0, 0), "Invalid address");
        self.contractJettonWallet = msg.newWallet;
    }
    
    // ===== TON 인출 =====
    
    receive(msg: WithdrawTON) {
        self.requireOwner();
        
        let balance: Int = myBalance();
        let minBalance: Int = ton("0.1");
        
        require(msg.amount > 0, "Amount must be positive");
        require(balance >= minBalance + msg.amount, "Insufficient balance");
        
        send(SendParameters{
            to: self.owner,
            value: msg.amount,
            mode: SendPayGasSeparately,
            body: "TON withdrawal".asComment()
        });
    }

    // ===== 자동 인출 처리 =====
    
    /**
     * Jetton Notification을 받으면 자동으로 사용자에게 전송
     * 
     * forwardPayload 구조:
     * - 사용자 주소 (Address)
     * 
     * 사용 예시:
     * 게임 백엔드에서 Jetton 전송 시:
     * - amount: 100 CSPIN
     * - forwardPayload: 사용자 주소
     */
    receive(msg: JettonTransferNotification) {
        // 1. 컨트랙트의 Jetton Wallet에서만 받음
        require(sender() == self.contractJettonWallet, "Invalid sender");
        
        // 2. 긴급 정지 체크
        require(!self.paused, "Contract is paused");
        
        // 3. 금액 검증
        require(msg.amount > 0, "Amount must be positive");
        require(msg.amount <= self.maxSingleWithdraw, "Amount exceeds limit");
        
        // 4. forwardPayload에서 사용자 주소 추출
        let userAddress: Address = msg.forwardPayload.loadAddress();
        
        // 5. 통계 업데이트
        self.totalWithdrawn = self.totalWithdrawn + msg.amount;
        self.withdrawCount = self.withdrawCount + 1;
        
        // 6. 사용자에게 Jetton 전송
        send(SendParameters{
            to: self.contractJettonWallet,
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: JettonTransfer{
                queryId: msg.queryId,
                amount: msg.amount,
                destination: userAddress,
                responseDestination: self.owner,
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: null
            }.toCell()
        });
    }

    // ===== Get 메서드 =====
    
    get fun balance(): Int {
        return myBalance();
    }

    get fun contractInfo(): ContractInfo {
        return ContractInfo{
            owner: self.owner,
            jettonMaster: self.jettonMaster,
            gameJettonWallet: self.gameJettonWallet,
            contractJettonWallet: self.contractJettonWallet,
            paused: self.paused,
            maxSingleWithdraw: self.maxSingleWithdraw,
            totalWithdrawn: self.totalWithdrawn,
            withdrawCount: self.withdrawCount
        };
    }
    
    get fun isPaused(): Bool {
        return self.paused;
    }
    
    get fun stats(): Stats {
        return Stats{
            totalWithdrawn: self.totalWithdrawn,
            withdrawCount: self.withdrawCount
        };
    }
}

struct ContractInfo {
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
    contractJettonWallet: Address;
    paused: Bool;
    maxSingleWithdraw: Int;
    totalWithdrawn: Int;
    withdrawCount: Int;
}

struct Stats {
    totalWithdrawn: Int;
    withdrawCount: Int;
}
