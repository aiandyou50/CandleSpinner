// src/PoCComponent.tsx
import React, { useState } from "react";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import { Address, toNano, beginCell } from "ton-core";
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from "./constants.js";

function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address | null) {
  const cell = beginCell()
    .storeUint(0xF8A7EA5, 32) // op code 'transfer' (common jetton op)
    .storeUint(0, 64) // query id
    .storeCoins(amount) // token amount in smallest units
    .storeAddress(destination)
    .storeAddress(responseTo)
    .storeCoins(BigInt(0)) // forward TON amount
    .endCell();
  return cell;
}

export const PoCComponent: React.FC = () => {
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!connectedWallet) {
      alert("지갑을 먼저 연결해주세요.");
      return;
    }

    try {
      setBusy(true);

      // Adjust decimals according to token decimals; default 9
      const DECIMALS = 9n;
      const amountWhole = BigInt(Math.max(0, Number(depositAmount)));
      const amount = amountWhole * 10n ** DECIMALS;

      const toAddress = Address.parse(GAME_WALLET_ADDRESS);
      const responseAddress = Address.parse(connectedWallet.account.address);

      const payloadCell = buildJettonTransferPayload(amount, toAddress, responseAddress);
      const payloadBase64 = payloadCell.toBoc().toString("base64");

      // validUntil must not be too far in the future — TON Connect validates this (<= ~5 minutes)
      const VALID_SECONDS = 60 * 5; // 5 minutes
      const validUntil = Math.floor(Date.now() / 1000) + VALID_SECONDS;

      // The TON amount sent to the token contract should cover gas/fees. For Jetton operations
      // TON Wallet often expects the user to have ~1.05 TON available for fees. Use a safe default
      // for PoC but warn the user before sending real TON.
      const TON_FEE = toNano("1.1").toString();

      const tx = {
        validUntil,
        messages: [
          {
            address: CSPIN_TOKEN_ADDRESS,
            amount: TON_FEE,
            payload: payloadBase64,
          },
        ],
      };

      // Simple retry logic for transient bridge/network issues (e.g. rate limit on public bridge)
      let lastErr: any = null;
      const MAX_RETRIES = 2;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`sendTransaction attempt ${attempt + 1}`);
          const result = await tonConnectUI.sendTransaction(tx as any);
          console.log("트랜잭션 결과:", result);
          alert("CSPIN 입금 요청이 생성되었습니다. 지갑에서 트랜잭션을 확인하세요.");
          lastErr = null;
          break;
        } catch (e: any) {
          lastErr = e;
          console.warn(`sendTransaction failed (attempt ${attempt + 1}):`, e);
          // If final attempt, throw to outer catch
          if (attempt < MAX_RETRIES) {
            // small backoff
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
            continue;
          }
        }
      }
      if (lastErr) {
        throw lastErr;
      }
    } catch (err: any) {
      console.error("트랜잭션 에러:", err);
      // Capture structured error for display/copy
      try {
        setLastError(typeof err === 'string' ? err : JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      } catch (e) {
        setLastError(String(err));
      }

      // Friendly user guidance depending on likely cause
      const msg = [] as string[];
      msg.push("입금 중 오류가 발생했습니다.");
      msg.push("가능한 원인:");
      msg.push(" - 네트워크 또는 브리지(bridge) 서비스 과부하 (공용 브리지에 429 발생)");
      msg.push(" - 지갑의 WebView/캐시 문제 또는 시간 동기화 문제");
      msg.push(" - 수수료 부족(지갑 내 Toncoin 잔액 확인)");
      msg.push("");
      msg.push("권장 조치:");
      msg.push("1) 모바일 Telegram TON Wallet에서 시도하거나 다른 네트워크(모바일 데이터)를 사용하세요.");
      msg.push("2) Telegram 앱 캐시를 지우고 재로그인하세요.");
      msg.push("3) 지갑 주소가 연결된 주소와 동일한지 확인하세요(설정 > Connected Apps).");
      msg.push("4) 문제가 지속되면 오류 상세 정보를 복사하여 앱 개발자나 TON Wallet Support에 전달하세요.");

      alert(msg.join('\n'));
    } finally {
      setBusy(false);
    }
  };

  if (!connectedWallet) {
    return <p>게임을 시작하려면 지갑을 연결해주세요.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>CSPIN 입금하기</h2>
      <p>연결된 지갑: {connectedWallet.account.address}</p>

      <div style={{ marginBottom: 8 }}>
        <label>
          입금 수량 (CSPIN):{" "}
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            min={0}
            style={{ width: 120 }}
          />
        </label>
      </div>

      <button onClick={handleDeposit} disabled={busy}>
        {busy ? "처리중..." : `${depositAmount} CSPIN 입금`}
      </button>
      {lastError && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #f1c40f', borderRadius: 6, background: '#fffbea' }}>
          <strong>마지막 오류 (복사 가능):</strong>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{lastError}</pre>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(lastError as string);
                  alert('오류 내용이 클립보드에 복사되었습니다.');
                } catch (e) {
                  alert('클립보드 복사에 실패했습니다. 콘솔에서 오류를 확인하세요.');
                }
              }}
            >
              오류 복사
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                // quick retry (user-initiated)
                setLastError(null);
              }}
            >
              오류 지우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoCComponent;
