import { Address, beginCell, Contract, ContractProvider, Sender, toNano } from '@ton/core';

/**
 * WithdrawalManager 컨트랙트의 TypeScript 래퍼
 */
export class WithdrawalManager implements Contract {
    readonly address: Address;
    readonly init?: { code: any; data: any };

    constructor(address: Address, init?: { code: any; data: any }) {
        this.address = address;
        this.init = init;
    }

    /**
     * 컨트랙트 인스턴스 생성
     */
    static create(address: Address): WithdrawalManager {
        return new WithdrawalManager(address);
    }

    /**
     * 배포 데이터 생성
     */
    static createFromConfig(config: {
        jettonMaster: Address;
        gameJettonWallet: Address;
        owner: Address;
    }, code: any) {
        const data = beginCell()
            .storeAddress(config.owner)
            .storeAddress(config.jettonMaster)
            .storeAddress(config.gameJettonWallet)
            .storeUint(0, 64)   // processedRequests (64비트)
            .storeCoins(0)      // totalWithdrawn (coins type)
            .storeCoins(0)      // totalGasCollected (coins type)
            .storeBit(0)        // paused (1비트)
            .endCell();

        return new WithdrawalManager(
            new Address(0, code.hash()),
            { code, data }
        );
    }

    /**
     * 배포 트랜잭션 전송
     */
    async sendDeploy(via: Sender, opts: any) {
        await via.send({
            to: this.address,
            init: this.init,
            value: opts.value || toNano('0.05'),
        });
    }

    /**
     * 인출 요청 전송
     */
    async sendWithdrawalRequest(
        via: Sender,
        msg: {
            queryId: bigint;
            amount: bigint;
            destination: Address;
        }
    ) {
        const body = beginCell()
            .storeUint(0x57495452, 32)  // OP_WITHDRAWAL_REQUEST
            .storeUint(msg.queryId, 64)
            .storeCoins(msg.amount)
            .storeAddress(msg.destination)
            .endCell();

        await via.send({
            to: this.address,
            value: toNano('0.05'),
            body,
        });
    }

    /**
     * 정지 전송
     */
    async sendPause(via: Sender) {
        const body = beginCell()
            .storeUint(0x50415553, 32)  // OP_PAUSE
            .endCell();

        await via.send({
            to: this.address,
            value: toNano('0.01'),
            body,
        });
    }

    /**
     * 재개 전송
     */
    async sendResume(via: Sender) {
        const body = beginCell()
            .storeUint(0x52455355, 32)  // OP_RESUME
            .endCell();

        await via.send({
            to: this.address,
            value: toNano('0.01'),
            body,
        });
    }

    /**
     * 가스비 회수 전송
     */
    async sendWithdrawGasCollection(
        via: Sender,
        queryId: bigint
    ) {
        const body = beginCell()
            .storeUint(0x47415344, 32)  // OP_GAS_COLLECTION
            .storeUint(queryId, 64)
            .endCell();

        await via.send({
            to: this.address,
            value: toNano('0.01'),
            body,
        });
    }

    /**
     * 통계 조회
     */
    async getStats(provider: ContractProvider): Promise<{
        processedRequests: bigint;
        totalWithdrawn: bigint;
        totalGasCollected: bigint;
        isPaused: boolean;
    }> {
        const result = await provider.get('stats', []);
        
        return {
            processedRequests: result.stack.readBigNumber(),
            totalWithdrawn: result.stack.readBigNumber(),
            totalGasCollected: result.stack.readBigNumber(),
            isPaused: result.stack.readBoolean(),
        };
    }

    /**
     * 정지 상태 조회
     */
    async getIsPaused(provider: ContractProvider): Promise<boolean> {
        const result = await provider.get('isPaused', []);
        return result.stack.readBoolean();
    }

    /**
     * 처리된 요청 수 조회
     */
    async getProcessedRequests(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getProcessedRequests', []);
        return result.stack.readBigNumber();
    }

    /**
     * 총 출금액 조회
     */
    async getTotalWithdrawn(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getTotalWithdrawn', []);
        return result.stack.readBigNumber();
    }

    /**
     * 징수한 총 가스비 조회
     */
    async getTotalGasCollected(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getTotalGasCollected', []);
        return result.stack.readBigNumber();
    }

    /**
     * 소유자 조회
     */
    async getOwner(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('getOwner', []);
        return result.stack.readAddress();
    }

    /**
     * 게임 Jetton 지갑 조회
     */
    async getGameJettonWallet(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('getGameJettonWallet', []);
        return result.stack.readAddress();
    }

    /**
     * Jetton 마스터 조회
     */
    async getJettonMaster(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('getJettonMaster', []);
        return result.stack.readAddress();
    }
}
