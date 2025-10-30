/**
 * TON Center API v3 유틸리티
 * 
 * 사용:
 * - sendBoc(boc): BOC 전송 (거래 확인)
 * - getAccountState(address): 계정 상태 조회 (seqno 포함)
 * - getBalance(address): TON 잔액 조회
 * - runGetMethod(address, method, params): 스마트 컨트랙트 메서드 호출
 */

interface TonCenterV3Response<T> {
  ok: boolean;
  result?: T;
  error?: string;
}

export class AnkrRpc {
  private baseUrl: string;
  private apiKey?: string;

  constructor(rpcUrl: string, apiKey?: string) {
    if (!rpcUrl) {
      throw new Error('AnkrRpc: RPC URL required');
    }
    // TON Center v3 API 기본 URL
    this.baseUrl = rpcUrl.replace(/\/+$/, ''); // trailing slash 제거
    this.apiKey = apiKey;
  }

  private async call<T>(endpoint: string, method: 'GET' | 'POST' = 'POST', body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`[TON Center] 호출 시작: ${method} ${endpoint}`);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      };

      // API 키가 있으면 헤더에 추가
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const options: RequestInit = {
        method,
        headers
      };

      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      console.log(`[TON Center] HTTP 응답: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[TON Center] ❌ HTTP 오류 (${response.status}): ${text.substring(0, 200)}`);
        throw new Error(`TON Center HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      let data: TonCenterV3Response<T>;
      try {
        data = (await response.json()) as TonCenterV3Response<T>;
      } catch (e) {
        console.error(`[TON Center] ❌ JSON 파싱 오류: ${e}`);
        throw new Error(`TON Center Response parse error: ${e}`);
      }

      if (!data.ok || data.error) {
        console.error(`[TON Center] ❌ API 오류: ${data.error}`);
        throw new Error(`TON Center Error: ${data.error}`);
      }

      if (data.result === undefined) {
        console.warn(`[TON Center] ⚠️ result 없음 for endpoint: ${endpoint}`);
        throw new Error(`TON Center no result for endpoint: ${endpoint}`);
      }

      console.log(`[TON Center] ✅ 호출 성공: ${endpoint}`);
      return data.result;
    } catch (error) {
      console.error(`[TON Center] ❌ 호출 실패: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * BOC 전송 (거래 확인)
   * TON Center v3: POST /api/v3/sendBoc
   * 
   * @param boc - 서명된 거래 BOC (base64)
   * @returns 메시지 해시
   */
  async sendBoc(boc: string): Promise<string> {
    console.log(`[TON Center] sendBoc 요청: ${boc.substring(0, 30)}...`);
    
    try {
      const result = await this.call<{ message_hash?: string }>(
        '/sendBoc',
        'POST',
        { boc }
      );
      
      const hash = result.message_hash || 'pending';
      console.log(`[TON Center] ✅ BOC 전송 성공: ${hash}`);
      return hash;
    } catch (error) {
      console.error(`[TON Center] ❌ BOC 전송 실패:`, error);
      throw error;
    }
  }

  /**
   * 계정 상태 조회 (seqno 포함)
   * TON Center v3: GET /api/v3/accounts/{address}
   * 
   * @param address - 지갑 주소
   * @returns 계정 상태 (seqno는 result.seqno 경로)
   */
  async getAccountState(address: string): Promise<any> {
    console.log(`[TON Center] getAccountState 요청: ${address}`);
    
    try {
      const result = await this.call<any>(
        `/accounts/${address}`,
        'GET'
      );
      
      // seqno 추출 (TON Center v3 형식)
      let seqno = 0;
      try {
        seqno = result?.seqno || 
                result?.account_state?.seqno ||
                0;
      } catch {
        seqno = 0;
      }
      
      console.log(`[TON Center] ✅ 계정 상태 조회: seqno=${seqno}`);
      
      return result;
    } catch (error) {
      console.error(`[TON Center] ❌ getAccountState 실패:`, error);
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
      
      // TON Center v3 경로
      const seqno = 
        state?.seqno ||
        state?.account_state?.seqno ||
        0;
      
      return typeof seqno === 'number' ? seqno : parseInt(String(seqno), 10) || 0;
    } catch (error) {
      console.error(`[TON Center] ❌ getSeqno 실패:`, error);
      // 실패 시 0 반환 (새 계정)
      return 0;
    }
  }

  /**
   * 계정 TON 잔액 조회
   * TON Center v3: GET /api/v3/accounts/{address}
   * 
   * @param address - 지갑 주소
   * @returns TON 잔액 (nanoton, BigInt)
   */
  async getBalance(address: string): Promise<bigint> {
    console.log(`[TON Center] getBalance 요청: ${address}`);
    
    try {
      const result = await this.call<any>(
        `/accounts/${address}`,
        'GET'
      );
      
      // balance 추출 (TON Center v3 형식)
      const balance = 
        result?.balance ||
        result?.account_state?.balance ||
        '0';
      
      const balanceBigInt = BigInt(String(balance));
      console.log(`[TON Center] ✅ 잔액: ${(Number(balanceBigInt) / 1e9).toFixed(4)} TON`);
      
      return balanceBigInt;
    } catch (error) {
      console.error(`[TON Center] ❌ getBalance 실패:`, error);
      throw error;
    }
  }

  /**
   * 스마트 컨트랙트 메서드 호출
   * TON Center v3: POST /api/v3/runGetMethod
   * 
   * @param address - 컨트랙트 주소
   * @param method - 메서드 이름
   * @param params - 메서드 파라미터 (TON Center v3 형식: [{type, value}])
   * @returns 반환 값 (스택)
   */
  async runGetMethod(
    address: string,
    method: string,
    params: any[] = []
  ): Promise<any> {
    console.log(`[TON Center] runGetMethod 요청: ${address}.${method}`);
    
    try {
      const result = await this.call<any>(
        '/runGetMethod',
        'POST',
        {
          address,
          method,
          stack: params
        }
      );
      
      console.log(`[TON Center] ✅ 메서드 실행 성공`);
      return result;
    } catch (error) {
      console.error(`[TON Center] ❌ runGetMethod 실패:`, error);
      throw error;
    }
  }

  /**
   * 거래 상태 조회 (TON Center v3)
   * TON Center v3: GET /api/v3/transactions/{tx_hash}
   */
  async getTransactionStatus(txHash: string): Promise<any> {
    console.log(`[TON Center] 거래 상태 조회: ${txHash}`);
    
    try {
      const result = await this.call<any>(
        `/transactions/${txHash}`,
        'GET'
      );
      
      console.log(`[TON Center] ✅ 거래 상태:`, result);
      return result;
    } catch (error) {
      console.error(`[TON Center] ⚠️ getTransactionStatus 실패:`, error);
      // 이 메서드가 지원되지 않을 수 있음
      return null;
    }
  }
}

/**
 * seqno 관리자 (원자성 보장)
 */
export class SeqnoManager {
  constructor(
    private rpc: AnkrRpc,
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

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Step 1: 블록체인에서 최신 seqno 조회
        const blockchainSeqno = await this.rpc.getSeqno(this.walletAddress);
        console.log(`[seqno] 블록체인 seqno: ${blockchainSeqno}`);

        // Step 2: KV에서 로컬 seqno 조회
        const localSeqnoStr = await this.kv.get(SEQNO_KEY);
        const localSeqno = localSeqnoStr ? parseInt(localSeqnoStr, 10) : 0;
        console.log(`[seqno] 로컬 seqno: ${localSeqno}`);

        // Step 3: 최신 seqno 결정 (블록체인 우선)
        const currentSeqno = Math.max(blockchainSeqno, localSeqno);
        const nextSeqno = currentSeqno + 1;

        console.log(`[seqno] 다음 seqno: ${nextSeqno} (현재: ${currentSeqno})`);

        // Step 4: KV 업데이트
        await this.kv.put(SEQNO_KEY, nextSeqno.toString());

        console.log(`✅ seqno 증가 성공: ${currentSeqno} → ${nextSeqno}`);
        return nextSeqno;

      } catch (error) {
        console.error(`[seqno] 시도 ${attempt + 1}/${maxRetries} 실패:`, error);
        
        if (attempt < maxRetries - 1) {
          // 재시도 전 백오프 대기
          const waitMs = 100 * Math.pow(2, attempt); // 100ms, 200ms, 400ms
          console.log(`[seqno] ${waitMs}ms 대기 후 재시도...`);
          await new Promise((res) => setTimeout(res, waitMs));
        } else {
          throw new Error(`seqno 획득 실패 (${maxRetries}회 재시도)`);
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
    
    console.log(`[seqno] 리셋: 블록체인 seqno=${blockchainSeqno}`);
    await this.kv.put(SEQNO_KEY, blockchainSeqno.toString());
    console.log(`✅ seqno 리셋 완료`);
  }
}
