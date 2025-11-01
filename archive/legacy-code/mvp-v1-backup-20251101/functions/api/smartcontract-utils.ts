/**
 * 스마트컨트랙트 통합 유틸리티
 * 
 * 역할:
 * 1. 스마트컨트랙트 클라이언트 초기화
 * 2. 인출 요청 메시지 생성
 * 3. 컨트랙트 상태 조회
 * 4. 에러 처리 및 로깅
 */

import { Address, toNano, beginCell } from '@ton/core';
import { TonClient } from '@ton/ton';

/**
 * 스마트컨트랙트 설정
 */
export interface SmartContractConfig {
  address: string;           // 컨트랙트 주소
  jettonMaster: string;      // CSPIN Jetton Master
  gameJettonWallet: string;  // 게임의 CSPIN 지갑
}

/**
 * 인출 요청
 */
export interface WithdrawalRequest {
  queryId: bigint;
  amount: bigint;            // nanotons
  destination: string;       // 사용자 지갑
}

/**
 * 인출 응답
 */
export interface WithdrawalResponse {
  success: boolean;
  txHash?: string;
  amount?: number;
  error?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * 컨트랙트 통계
 */
export interface ContractStats {
  processedRequests: bigint;
  totalWithdrawn: bigint;
  totalGasCollected: bigint;
  isPaused: boolean;
}

/**
 * 스마트컨트랙트 클라이언트
 */
export class WithdrawalManagerClient {
  private client: TonClient;
  private config: SmartContractConfig;
  private contractAddress: Address;

  constructor(endpoint: string, config: SmartContractConfig) {
    this.client = new TonClient({ endpoint });
    this.config = config;
    this.contractAddress = Address.parse(config.address);
  }

  /**
   * 인출 요청 메시지 생성
   */
  createWithdrawalMessage(request: WithdrawalRequest) {
    const OP_WITHDRAWAL_REQUEST = 0x57495452;  // "WITR"
    
    return beginCell()
      .storeUint(OP_WITHDRAWAL_REQUEST, 32)
      .storeUint(request.queryId, 64)
      .storeCoins(request.amount)
      .storeAddress(Address.parse(request.destination))
      .endCell()
      .toBoc()
      .toString('base64');
  }

  /**
   * 컨트랙트 상태 조회
   */
  async getStats(): Promise<ContractStats> {
    try {
      const data = await this.client.runMethod(
        this.contractAddress,
        'get_stats'
      );

      const stack = data.stack as unknown as any[];
      return {
        processedRequests: BigInt(stack[0]?.number ?? 0),
        totalWithdrawn: BigInt(stack[1]?.number ?? 0),
        totalGasCollected: BigInt(stack[2]?.number ?? 0),
        isPaused: (stack[3]?.number ?? 0) !== 0n,
      };
    } catch (error) {
      console.error('[SmartContract] Failed to get stats:', error);
      throw new Error('Cannot retrieve contract statistics');
    }
  }

  /**
   * 현재 가스비 조회
   */
  getGasFee(): bigint {
    return toNano('0.01');  // 고정 비용
  }

  /**
   * 컨트랙트 정지 상태 조회
   */
  async getIsPaused(): Promise<boolean> {
    try {
      const data = await this.client.runMethod(
        this.contractAddress,
        'get_is_paused'
      );
      const stack = data.stack as unknown as any[];
      return (stack[0]?.number ?? 0) !== 0n;
    } catch (error) {
      console.error('[SmartContract] Failed to get pause status:', error);
      return false;
    }
  }

  /**
   * 처리된 요청 수 조회
   */
  async getProcessedRequests(): Promise<bigint> {
    try {
      const data = await this.client.runMethod(
        this.contractAddress,
        'get_processed_requests'
      );
      const stack = data.stack as unknown as any[];
      return BigInt(stack[0]?.number ?? 0);
    } catch (error) {
      console.error('[SmartContract] Failed to get processed requests:', error);
      return 0n;
    }
  }
}

/**
 * 스마트컨트랙트 방식 인출 처리
 */
export async function handleSmartContractWithdrawal(
  context: { env: any },
  userAddress: string,
  amount: number,
  queryId: bigint
): Promise<WithdrawalResponse> {
  const { env } = context;

  try {
    // 1️⃣ 입력값 검증
    if (!userAddress || !amount || amount <= 0) {
      return {
        success: false,
        error: 'Invalid input',
        status: 'failed',
      };
    }

    // 2️⃣ 클라이언트 초기화
    const client = new WithdrawalManagerClient(
      env.TON_RPC_ENDPOINT || 'https://toncenter.com/api/v2/jsonRPC',
      {
        address: env.WITHDRAWAL_MANAGER,
        jettonMaster: env.CSPIN_JETTON,
        gameJettonWallet: env.GAME_JETTON_WALLET,
      }
    );

    // 3️⃣ 컨트랙트 상태 확인
    const isPaused = await client.getIsPaused();
    if (isPaused) {
      return {
        success: false,
        error: 'Contract is paused',
        status: 'failed',
      };
    }

    // 4️⃣ 인출 메시지 생성
    const payload = client.createWithdrawalMessage({
      queryId,
      amount: toNano(amount.toString()),
      destination: userAddress,
    });

    // 5️⃣ 응답 반환 (메시지 데이터)
    return {
      success: true,
      amount,
      status: 'pending',
    };
  } catch (error) {
    console.error('[SmartContract Withdrawal] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    };
  }
}

/**
 * 모니터링 정보 조회
 */
export async function getMonitoringInfo(context: { env: any }): Promise<any> {
  const { env } = context;

  try {
    const client = new WithdrawalManagerClient(
      env.TON_RPC_ENDPOINT || 'https://toncenter.com/api/v2/jsonRPC',
      {
        address: env.WITHDRAWAL_MANAGER,
        jettonMaster: env.CSPIN_JETTON,
        gameJettonWallet: env.GAME_JETTON_WALLET,
      }
    );

    const stats = await client.getStats();
    const isPaused = await client.getIsPaused();
    const gasFee = client.getGasFee();

    return {
      status: 'healthy',
      contract: {
        address: env.WITHDRAWAL_MANAGER,
        stats: {
          processedRequests: stats.processedRequests.toString(),
          totalWithdrawn: (stats.totalWithdrawn / 1_000_000_000n).toString(),  // convert to CSPIN
          totalGasCollected: (stats.totalGasCollected / 1_000_000_000n).toString(),  // convert to TON
          isPaused,
          gasFee: (gasFee / 1_000_000_000n).toString(),
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
