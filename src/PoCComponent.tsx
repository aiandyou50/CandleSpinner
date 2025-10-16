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

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: CSPIN_TOKEN_ADDRESS,
            amount: toNano("0.05").toString(),
            payload: payloadBase64,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(tx as any);
      console.log("트랜잭션 결과:", result);
      alert("CSPIN 입금 요청이 생성되었습니다. 지갑에서 트랜잭션을 확인하세요.");
    } catch (err: any) {
      console.error("트랜잭션 에러:", err);
      alert("입금 중 오류가 발생했습니다.");
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
    </div>
  );
};

export default PoCComponent;
