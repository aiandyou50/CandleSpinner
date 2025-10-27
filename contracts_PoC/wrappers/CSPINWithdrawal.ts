import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

/**
 * CSPINWithdrawal 스마트 컨트랙트 TypeScript 래퍼
 */

export type CSPINWithdrawalConfig = {
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
};

export type ContractInfo = {
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
};

export class CSPINWithdrawal implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    /**
     * 배포 설정에서 컨트랙트 생성
     */
    static createFromConfig(config: CSPINWithdrawalConfig, code: Cell, workchain = 0): CSPINWithdrawal {
        const data = beginCell()
            .storeAddress(config.owner)
            .storeAddress(config.jettonMaster)
            .storeAddress(config.gameJettonWallet)
            .storeDict(null)  // claimableAmounts map (초기 비어있음)
            .endCell();

        const init = { code, data };
        const address = contractAddress(workchain, init);

        return new CSPINWithdrawal(address, init);
    }

    /**
     * 관리자가 사용자의 claimable amount 설정
     */
    async sendSetClaimable(
        provider: ContractProvider,
        via: Sender,
        opts: {
            user: Address;
            amount: bigint;
            value?: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value ?? toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x1, 32)  // op: SetClaimable
                .storeUint(0, 64)     // queryId
                .storeAddress(opts.user)
                .storeCoins(opts.amount)
                .endCell(),
        });
    }

    /**
     * 사용자가 자신의 토큰 인출
     */
    async sendClaim(
        provider: ContractProvider,
        via: Sender,
        opts: {
            queryId?: bigint;
            value?: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value ?? toNano('0.15'),  // Jetton 전송 + 수수료
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x2, 32)  // op: ClaimRequest
                .storeUint(opts.queryId ?? 0n, 64)
                .endCell(),
        });
    }

    /**
     * 사용자의 claimable amount 조회
     */
    async getClaimable(user: Address): Promise<bigint> {
        const result = await this.provider(0).get('getClaimable', [
            { type: 'slice', cell: beginCell().storeAddress(user).endCell() }
        ]);
        return result.stack.readBigNumber();
    }

    /**
     * 컨트랙트 잔액 조회
     */
    async getBalance(): Promise<bigint> {
        const result = await this.provider(0).get('balance', []);
        return result.stack.readBigNumber();
    }

    /**
     * 컨트랙트 정보 조회
     */
    async getContractInfo(): Promise<ContractInfo> {
        const result = await this.provider(0).get('contractInfo', []);
        return {
            owner: result.stack.readAddress(),
            jettonMaster: result.stack.readAddress(),
            gameJettonWallet: result.stack.readAddress(),
        };
    }

    // Provider helper
    private provider(value: number): ContractProvider {
        throw new Error('Contract not initialized with provider');
    }
}

// Helper function for contract address calculation
function contractAddress(workchain: number, init: { code: Cell; data: Cell }): Address {
    const stateInit = beginCell()
        .storeBit(0)
        .storeBit(0)
        .storeBit(1)
        .storeRef(init.code)
        .storeBit(1)
        .storeRef(init.data)
        .storeBit(0)
        .endCell();
    
    const hash = stateInit.hash();
    return new Address(workchain, hash);
}

