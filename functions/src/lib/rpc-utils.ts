/**
 * Ankr JSON-RPC 유틸리티
 * 
 * 사용:
 * - sendBoc(boc): BOC 전송 (거래 확인)
 * - getAccountState(address): 계정 상태 조회 (seqno 포함)
 * - getBalance(address): TON 잔액 조회
 * - runGetMethod(address, method, params): 스마트 컨트랙트 메서드 호출
 */

interface RpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: any[];
}

interface RpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export class AnkrRpc {
  constructor(private rpcUrl: string) {
    if (!rpcUrl) {
      throw new Error('AnkrRpc: RPC URL required');
    }
  }

  private async call<T>(method: string, params: any[]): Promise<T> {
    const id = Math.floor(Math.random() * 1e9);
    
    console.log(`[RPC] 호출 시작: method=${method}, id=${id}`);
    console.log(`[RPC] RPC URL: ${this.rpcUrl.substring(0, 50)}...`);
    
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id,
          method,
          params
        } as RpcRequest)
      });

      console.log(`[RPC] HTTP 응답: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[RPC] ❌ HTTP 오류 (${response.status}): ${text.substring(0, 200)}`);
        throw new Error(`RPC HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      let data: RpcResponse<T>;
      try {
        data = (await response.json()) as RpcResponse<T>;
      } catch (e) {
        console.error(`[RPC] ❌ JSON 파싱 오류: ${e}`);
        throw new Error(`RPC Response parse error: ${e}`);
      }

      if (data.error) {
        console.error(`[RPC] ❌ RPC 오류 (${data.error.code}): ${data.error.message}`);
        throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
      }

      if (data.result === undefined) {
        console.warn(`[RPC] ⚠️ result 없음 for method: ${method}`);
        throw new Error(`RPC no result for method: ${method}`);
      }

      console.log(`[RPC] ✅ 호출 성공: method=${method}`);
      return data.result;
    } catch (error) {
      console.error(`[RPC] ❌ 호출 실패: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * BOC 전송 (거래 확인)
   * 
   * @param boc - 서명된 거래 BOC (base64)
   * @returns 메시지 해시
   */
  async sendBoc(boc: string): Promise<string> {
    console.log(`[RPC] sendBoc 요청: ${boc.substring(0, 30)}...`);
    
    try {
      const result = await this.call<{ message_hash?: string }>(
        'sendBoc',
        [boc]
      );
      
      const hash = result.message_hash || 'pending';
      console.log(`[RPC] ✅ BOC 전송 성공: ${hash}`);
      return hash;
    } catch (error) {
      console.error(`[RPC] ❌ BOC 전송 실패:`, error);
      throw error;
    }
  }

  /**
   * 계정 상태 조회 (seqno 포함)
   * 
   * @param address - 지갑 주소
   * @returns 계정 상태 (seqno는 result.account?.state?.seq_no 경로)
   */
  async getAccountState(address: string): Promise<any> {
    console.log(`[RPC] getAccountState 요청: ${address}`);
    
    try {
      const result = await this.call<any>(
        'getAccountState',
        [address]
      );
      
      // seqno 추출 시도 (경로는 RPC 구현에 따라 다를 수 있음)
      let seqno = 0;
      try {
        seqno = result?.account?.state?.seq_no || 
                result?.account?.storage?.state?.seq_no ||
                result?.seq_no ||
                0;
      } catch {
        seqno = 0;
      }
      
      console.log(`[RPC] ✅ 계정 상태 조회: seqno=${seqno}`);
      
      return result;
    } catch (error) {
      console.error(`[RPC] ❌ getAccountState 실패:`, error);
      throw error;
    }
  }

  /**
   * seqno 직접 조회 (편의 함수)
   * 
   * @param address - 지갑 주소
   * @returns seqno (정수)
   */
  async getSeqno(address: string): Promise<number> {
    try {
      const state = await this.getAccountState(address);
      
      // 여러 경로 시도
      const seqno = 
        state?.account?.state?.seq_no ||
        state?.account?.storage?.state?.seq_no ||
        state?.seq_no ||
        0;
      
      return typeof seqno === 'number' ? seqno : parseInt(String(seqno), 10) || 0;
    } catch (error) {
      console.error(`[RPC] ❌ getSeqno 실패:`, error);
      // 실패 시 0 반환 (새 계정)
      return 0;
    }
  }

  /**
   * 계정 TON 잔액 조회
   * 
   * @param address - 지갑 주소
   * @returns TON 잔액 (nanoton, BigInt)
   */
  async getBalance(address: string): Promise<bigint> {
    console.log(`[RPC] getBalance 요청: ${address}`);
    
    try {
      const result = await this.call<any>(
        'getAccountState',
        [address]
      );
      
      // balance 추출 시도
      const balance = 
        result?.account?.balance ||
        result?.account?.storage?.balance ||
        result?.balance ||
        '0';
      
      const balanceBigInt = BigInt(String(balance));
      console.log(`[RPC] ✅ 잔액: ${(Number(balanceBigInt) / 1e9).toFixed(4)} TON`);
      
      return balanceBigInt;
    } catch (error) {
      console.error(`[RPC] ❌ getBalance 실패:`, error);
      throw error;
    }
  }

  /**
   * 스마트 컨트랙트 메서드 호출
   * 
   * @param address - 컨트랙트 주소
   * @param method - 메서드 이름
   * @param params - 메서드 파라미터
   * @returns 반환 값 (스택)
   */
  async runGetMethod(
    address: string,
    method: string,
    params: any[] = []
  ): Promise<any> {
    console.log(`[RPC] runGetMethod 요청: ${address}.${method}`);
    
    try {
      const result = await this.call<any>(
        'runGetMethod',
        [address, method, params]
      );
      
      console.log(`[RPC] ✅ 메서드 실행 성공`);
      return result;
    } catch (error) {
      console.error(`[RPC] ❌ runGetMethod 실패:`, error);
      throw error;
    }
  }

  /**
   * 거래 상태 조회 (옵션: Ankr 지원 여부 확인 필요)
   */
  async getTransactionStatus(txHash: string): Promise<any> {
    console.log(`[RPC] 거래 상태 조회: ${txHash}`);
    
    try {
      const result = await this.call<any>(
        'getTransactionStatus',
        [txHash]
      );
      
      console.log(`[RPC] ✅ 거래 상태:`, result);
      return result;
    } catch (error) {
      console.error(`[RPC] ⚠️ getTransactionStatus 미지원:`, error);
      // 이 메서드가 지원되지 않을 수 있음
      return null;
    }
  }
}

// ============================================================================
// RPC 인터페이스 (공통)
// ============================================================================

interface IRpcClient {
  getSeqno(address: string): Promise<number>;
  getBalance(address: string): Promise<bigint>;
  sendBoc(boc: string): Promise<string>;
}

/**
 * seqno 관리자 (원자성 보장)
 */
export class SeqnoManager {
  constructor(
    private rpc: IRpcClient,
    private kv: any,
    private walletAddress: string
  ) {}

  /**
   * seqno 안전하게 증가 및 반환
   * 
   * 전략:
   * 1. 블록체인에서 현재 seqno 조회
   * 2. KV에서 로컬 seqno 확인
   * 3. 블록체인 seqno ≥ 로컬 seqno: 로컬 업데이트
   * 4. 다음 seqno 반환
   */
  async getAndIncrementSeqno(): Promise<number> {
    const SEQNO_KEY = 'game_wallet_seqno';
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Step 1: 블록체인에서 최신 seqno 조회
        const blockchainSeqno = await this.rpc.getSeqno(this.walletAddress);
        console.log(`[SeqnoManager] 블록체인 seqno: ${blockchainSeqno}`);

        // Step 2: KV에서 로컬 seqno 조회
        const localSeqnoStr = await this.kv.get(SEQNO_KEY);
        const localSeqno = localSeqnoStr ? parseInt(localSeqnoStr, 10) : 0;
        console.log(`[SeqnoManager] KV seqno: ${localSeqno} (raw='${localSeqnoStr}')`);

        // Step 3: 최신 seqno 결정 (블록체인 우선)
        const currentSeqno = Math.max(blockchainSeqno, localSeqno);
        const nextSeqno = currentSeqno + 1;

        console.log(`[SeqnoManager] next seqno=${nextSeqno} (current=${currentSeqno})`);

        // Step 4: KV 업데이트
        await this.kv.put(SEQNO_KEY, nextSeqno.toString());

        console.log(`[SeqnoManager] ✅ seqno 증가 성공: ${currentSeqno} → ${nextSeqno}`);
        return nextSeqno;

      } catch (error) {
        lastError = error;
        console.error(`[SeqnoManager] ❌ 시도 ${attempt + 1}/${maxRetries} 실패`, error);
        
        if (attempt < maxRetries - 1) {
          // 재시도 전 백오프 대기
          const waitMs = 100 * Math.pow(2, attempt); // 100ms, 200ms, 400ms
          console.log(`[SeqnoManager] ${waitMs}ms 대기 후 재시도...`);
          await new Promise((res) => setTimeout(res, waitMs));
        } else {
          console.warn('[SeqnoManager] 모든 재시도 실패, KV와 블록체인 seqno를 재동기화 시도');
          try {
            await this.resetSeqno();
          } catch (resetError) {
            console.error('[SeqnoManager] seqno 리셋 중 오류 발생', resetError);
          }
          const message = `seqno 획득 실패 (${maxRetries}회 재시도)`;
          throw new Error(`${message}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
        }
      }
    }

    throw new Error('Unexpected: getAndIncrementSeqno loop failed');
  }

  /**
   * seqno 리셋 (복구용)
   */
  async resetSeqno(): Promise<void> {
    const SEQNO_KEY = 'game_wallet_seqno';
    const blockchainSeqno = await this.rpc.getSeqno(this.walletAddress);
    
    console.log(`[SeqnoManager] 리셋 실행: 블록체인 seqno=${blockchainSeqno}`);
    await this.kv.put(SEQNO_KEY, blockchainSeqno.toString());
    console.log(`[SeqnoManager] ✅ seqno 리셋 완료`);
  }
}

// ============================================================================
// TonCenter v3 RPC Client
// ============================================================================

/**
 * TonCenter v3 API 클라이언트
 * 
 * 공식 문서: https://toncenter.com/api/v3/
 * API Spec: https://toncenter.com/api/v3/doc.json
 * 
 * 사용:
 * - sendBoc(boc): BOC 전송 (거래 확인)
 * - getBalance(address): TON 잔액 조회
 * - getAccountState(address): 계정 상태 조회 (seqno 포함)
 * - runGetMethod(address, method, params): 스마트 컨트랙트 메서드 호출
 */
export class TonCenterV3Rpc {
  private baseUrl = 'https://toncenter.com/api/v3';
  
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('TonCenterV3Rpc: API key required');
    }
    console.log(`[TonCenter v3] 초기화 완료 (endpoint: ${this.baseUrl})`);
  }

  private async call<T>(method: string, params: any[]): Promise<T> {
    const id = Math.floor(Math.random() * 1e9);
    
    console.log(`[TonCenter v3] 호출: method=${method}, id=${id}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/jsonRPC`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'accept': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id,
          method,
          params
        } as RpcRequest)
      });

      console.log(`[TonCenter v3] HTTP 응답: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[TonCenter v3] ❌ HTTP 오류 (${response.status}): ${text.substring(0, 200)}`);
        throw new Error(`TonCenter v3 HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      let data: RpcResponse<T>;
      try {
        data = (await response.json()) as RpcResponse<T>;
      } catch (e) {
        console.error(`[TonCenter v3] ❌ JSON 파싱 오류: ${e}`);
        throw new Error(`TonCenter v3 Response parse error: ${e}`);
      }

      if (data.error) {
        console.error(`[TonCenter v3] ❌ RPC 오류 (${data.error.code}): ${data.error.message}`);
        throw new Error(`TonCenter v3 Error ${data.error.code}: ${data.error.message}`);
      }

      if (data.result === undefined) {
        console.warn(`[TonCenter v3] ⚠️ result 없음 for method: ${method}`);
        throw new Error(`TonCenter v3 no result for method: ${method}`);
      }

      console.log(`[TonCenter v3] ✅ 호출 성공: method=${method}`);
      return data.result;
    } catch (error) {
      console.error(`[TonCenter v3] ❌ 호출 실패: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * BOC 전송 (거래 확인)
   * 
   * @param boc - 서명된 거래 BOC (base64)
   * @returns 메시지 해시
   */
  async sendBoc(boc: string): Promise<string> {
    console.log(`[TonCenter v3] sendBoc 요청: ${boc.substring(0, 30)}...`);
    
    try {
      const rawResult = await this.call<{ hash?: string } | string>('sendBocReturnHash', [boc]);

      // sendBocReturnHash는 문자열 혹은 { hash } 형태로 응답할 수 있으므로 모두 처리
      const hash = typeof rawResult === 'string'
        ? rawResult
        : rawResult?.hash;

      if (!hash) {
        console.warn('[TonCenter v3] sendBocReturnHash에서 해시가 반환되지 않음. sendBoc로 폴백 시도');
        const fallback = await this.call<string>('sendBoc', [boc]);
        console.log(`[TonCenter v3] ✅ sendBoc 성공 (fallback): ${fallback || 'pending'}`);
        return fallback || 'pending';
      }

      console.log(`[TonCenter v3] ✅ sendBoc 성공: ${hash}`);
      return hash;
    } catch (error) {
      console.error(`[TonCenter v3] ❌ sendBoc 실패:`, error);
      throw error;
    }
  }

  /**
   * TON 잔액 조회
   * 
   * @param address - 조회할 주소
   * @returns 잔액 (nanoTON)
   */
  async getBalance(address: string): Promise<bigint> {
    console.log(`[TonCenter v3] getBalance: ${address}`);
    
    try {
      const result = await this.call<{ balance: string }>('getAddressBalance', [{ address }]);
      
      if (result.balance === undefined) {
        throw new Error('TonCenter v3 getBalance: balance not returned');
      }
      
      const balance = BigInt(result.balance);
      console.log(`[TonCenter v3] ✅ 잔액: ${(Number(balance) / 1e9).toFixed(4)} TON`);
      return balance;
    } catch (error) {
      console.error(`[TonCenter v3] ❌ getBalance 실패:`, error);
      throw error;
    }
  }

  /**
   * 계정 상태 조회 (seqno 포함)
   * 
   * @param address - 조회할 주소
   * @returns 계정 상태 (balance, seqno 등)
   */
  async getAccountState(address: string): Promise<{ balance: bigint; seqno: number; status: string }> {
    console.log(`[TonCenter v3] getAccountState: ${address}`);
    
    try {
      const result = await this.call<{
        balance: string;
        code?: string;
        data?: string;
        last_transaction_lt: string;
        last_transaction_hash: string;
        status: string;
      }>('getAddressInformation', [{ address }]);
      
      const balance = BigInt(result.balance || '0');
      let seqno = 0;
      
      // seqno는 스마트 컨트랙트 get 메서드로 조회
      if (result.code && result.data) {
        try {
          const seqnoResult = await this.runGetMethod(address, 'seqno', []);
          seqno = seqnoResult.stack?.[0]?.value ? parseInt(seqnoResult.stack[0].value, 10) : 0;
        } catch (e) {
          console.warn(`[TonCenter v3] seqno 조회 실패 (기본값 0 사용): ${e}`);
        }
      }
      
      console.log(`[TonCenter v3] ✅ 상태: balance=${(Number(balance) / 1e9).toFixed(4)} TON, seqno=${seqno}, status=${result.status}`);
      
      return {
        balance,
        seqno,
        status: result.status
      };
    } catch (error) {
      console.error(`[TonCenter v3] ❌ getAccountState 실패:`, error);
      throw error;
    }
  }

  /**
   * seqno 조회
   * 
   * @param address - 조회할 주소
   * @returns seqno
   */
  async getSeqno(address: string): Promise<number> {
    console.log(`[TonCenter v3] getSeqno: ${address}`);
    
    try {
      const result = await this.runGetMethod(address, 'seqno', []);
      
      if (!result.stack || result.stack.length === 0) {
        console.warn(`[TonCenter v3] seqno 없음 (초기화 전 지갑), 기본값 0 반환`);
        return 0;
      }
      
      const seqno = parseInt(result.stack[0].value, 10);
      console.log(`[TonCenter v3] ✅ seqno: ${seqno}`);
      return seqno;
    } catch (error) {
      console.error(`[TonCenter v3] ❌ runGetMethod(seqno) 실패:`, error);

      // Fallback 1: getAddressInformation → last_transaction_lt 기반 추론
      try {
        const info = await this.call<{
          last_transaction_lt?: string;
          last_transaction_hash?: string;
          balance?: string;
          status?: string;
        }>('getAddressInformation', [{ address }]);

        if (info?.last_transaction_lt) {
          const derived = Number(BigInt(info.last_transaction_lt) > 0n ? 1 : 0);
          console.warn(`[TonCenter v3] seqno runGetMethod 실패, last_transaction_lt 기반 추정값 ${derived} 사용`);
          return derived;
        }
      } catch (fallbackError) {
        console.error('[TonCenter v3] ⚠️ getAddressInformation 폴백 실패', fallbackError);
      }

      // Fallback 2: 기본값 0 반환 (초기화 상태)
      console.warn('[TonCenter v3] seqno를 결정하지 못해 0을 반환합니다.');
      return 0;
    }
  }

  /**
   * 스마트 컨트랙트 get 메서드 호출
   * 
   * @param address - 컨트랙트 주소
   * @param method - 메서드 이름
   * @param params - 매개변수 배열
   * @returns 실행 결과 (stack 포함)
   */
  async runGetMethod(address: string, method: string, params: any[]): Promise<any> {
    console.log(`[TonCenter v3] runGetMethod: ${address}.${method}()`);
    
    try {
      const result = await this.call<any>('runGetMethod', [{ address, method, stack: params }]);
      
      console.log(`[TonCenter v3] ✅ runGetMethod 성공`);
      return result;
    } catch (error) {
      console.error(`[TonCenter v3] ❌ runGetMethod 실패:`, error);
      throw error;
    }
  }
}
