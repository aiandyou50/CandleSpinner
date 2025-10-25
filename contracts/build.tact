import "@stdlib/deploy";

// ===== 메시지 타입 정의 =====

message RequestWithdrawal {
    jetton_amount: Int as coins;        // 출금 요청 금액
    ton_address: Address;                // 사용자 TON 지갑 주소
    callback_addr: Address;              // 콜백 주소
}

message ApproveWithdrawal {
    request_id: Int as uint64;           // 요청 ID
}

message RejectWithdrawal {
    request_id: Int as uint64;           // 요청 ID
    reason: String;                      // 거부 사유
}

// ===== 통계 구조체 =====

struct WithdrawalStats {
    processedRequests: Int;
    totalWithdrawn: Int;
    totalGasCollected: Int;
    isPaused: Bool;
}

// ===== 메인 컨트랙트 =====

contract WithdrawalManager with Deployable {
    
    // ===== 상태 변수 =====
    jettonMaster: Address;                  // CSPIN Jetton 마스터
    gameJettonWallet: Address;              // 게임 회사 Jetton 지갑
    owner: Address;                         // 컨트랙트 소유자
    
    processedRequests: Int = 0;             // 처리된 출금 요청 수
    totalWithdrawn: Int = 0;                // 총 출금액
    totalGasCollected: Int = 0;             // 징수한 가스비
    isPaused: Bool = false;                 // 일시 정지 여부
    
    // ===== 컨트랙트 초기화 =====
    
    init(jettonMaster: Address, gameJettonWallet: Address, owner: Address) {
        self.jettonMaster = jettonMaster;
        self.gameJettonWallet = gameJettonWallet;
        self.owner = owner;
    }
    
    // ===== 출금 요청 처리 =====
    
    receive(msg: RequestWithdrawal) {
        // 요청 처리 로직
        require(!self.isPaused, "Contract is paused");
        
        // 최소 금액 확인
        require(msg.jetton_amount >= 100000000, "Minimum withdrawal amount is 1 CSPIN");
        
        // 출금 횟수 증가
        self.processedRequests = self.processedRequests + 1;
        self.totalWithdrawn = self.totalWithdrawn + msg.jetton_amount;
    }
    
    receive(msg: ApproveWithdrawal) {
        // 관리자만 허용
        require(sender() == self.owner, "Only owner can approve");
    }
    
    receive(msg: RejectWithdrawal) {
        // 관리자만 허용
        require(sender() == self.owner, "Only owner can reject");
    }
    
    // ===== 컨트랙트 정지/재개 =====
    
    receive("pause") {
        require(sender() == self.owner, "Only owner can pause");
        self.isPaused = true;
    }
    
    receive("resume") {
        require(sender() == self.owner, "Only owner can resume");
        self.isPaused = false;
    }
    
    // ===== 통계 조회 =====
    
    get fun getStats(): WithdrawalStats {
        return WithdrawalStats {
            processedRequests: self.processedRequests,
            totalWithdrawn: self.totalWithdrawn,
            totalGasCollected: self.totalGasCollected,
            isPaused: self.isPaused
        };
    }
}
