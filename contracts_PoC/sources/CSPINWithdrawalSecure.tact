import "@stdlib/deploy";
import "@stdlib/ownable";

/**
 * CSPIN Withdrawal System (Pull 방식) - 보안 강화 버전
 * 
 * 추가 기능:
 * - Emergency Pause/Unpause
 * - Game Jetton Wallet 업데이트
 * - 최대 인출 제한
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

message ClaimRequest {
    queryId: Int as uint64;
}

message SetClaimable {
    user: Address;
    amount: Int as coins;
}

message UpdateGameWallet {
    newWallet: Address;
}

message WithdrawTON {
    amount: Int as coins;
}

contract CSPINWithdrawalSecure with Deployable, Ownable {
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
    
    // 보안 추가 기능
    paused: Bool;
    maxSingleWithdraw: Int;  // 1회 최대 인출 제한
    
    claimableAmounts: map<Address, Int>;

    init(
        owner: Address,
        jettonMaster: Address,
        gameJettonWallet: Address
    ) {
        self.owner = owner;
        self.jettonMaster = jettonMaster;
        self.gameJettonWallet = gameJettonWallet;
        self.paused = false;
        self.maxSingleWithdraw = 1000000000000000;  // 1,000,000 CSPIN (10^9 = 1 CSPIN)
        self.claimableAmounts = emptyMap();
    }

    // ===== 긴급 정지 기능 =====
    
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
    
    // ===== TON 인출 기능 =====
    
    receive(msg: WithdrawTON) {
        self.requireOwner();
        
        let balance: Int = myBalance();
        let minBalance: Int = ton("0.1"); // 최소 0.1 TON 유지 (저장료)
        
        require(msg.amount > 0, "Amount must be positive");
        require(balance >= minBalance + msg.amount, "Insufficient balance or must keep min balance");
        
        // Owner에게 TON 전송
        send(SendParameters{
            to: self.owner,
            value: msg.amount,
            mode: SendPayGasSeparately,
            body: "TON withdrawal".asComment()
        });
    }

    // ===== 기존 기능 =====
    
    receive(msg: SetClaimable) {
        self.requireOwner();
        require(msg.amount >= 0, "Amount cannot be negative");
        self.claimableAmounts.set(msg.user, msg.amount);
    }

    receive(msg: ClaimRequest) {
        // 긴급 정지 체크
        require(!self.paused, "Contract is paused");
        
        let sender: Address = sender();
        let claimable: Int? = self.claimableAmounts.get(sender);
        
        require(claimable != null, "No claimable amount");
        let amount: Int = claimable!!;
        require(amount > 0, "Claimable amount is zero");
        
        // 최대 인출 제한 체크
        require(amount <= self.maxSingleWithdraw, "Amount exceeds limit");
        
        // Reentrancy 방지: 먼저 상태 초기화
        self.claimableAmounts.set(sender, 0);
        
        // Jetton 전송
        send(SendParameters{
            to: self.gameJettonWallet,
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: JettonTransfer{
                queryId: msg.queryId,
                amount: amount,
                destination: sender,
                responseDestination: self.owner,
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: null
            }.toCell()
        });
    }

    // ===== Get 메서드 =====
    
    get fun getClaimable(user: Address): Int {
        let amount: Int? = self.claimableAmounts.get(user);
        if (amount == null) {
            return 0;
        }
        return amount!!;
    }

    get fun balance(): Int {
        return myBalance();
    }

    get fun contractInfo(): ContractInfo {
        return ContractInfo{
            owner: self.owner,
            jettonMaster: self.jettonMaster,
            gameJettonWallet: self.gameJettonWallet,
            paused: self.paused,
            maxSingleWithdraw: self.maxSingleWithdraw
        };
    }
    
    get fun isPaused(): Bool {
        return self.paused;
    }
}

struct ContractInfo {
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
    paused: Bool;
    maxSingleWithdraw: Int;
}
