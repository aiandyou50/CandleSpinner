// src/PoCComponent.tsx
import React, { useState } from "react";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import { Address, toNano, beginCell } from "ton-core";
import { GAME_WALLET_ADDRESS, CSPIN_TOKEN_ADDRESS } from "./constants.js";

// A canonical zero address (workchain 0) used as a safe placeholder when no response_to is provided.
// This avoids producing an invalid '0' address encoding which breaks parsers.
const ZERO_ADDRESS_BOC = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

function parseAddressSafe(s: string | Address | null | undefined): Address {
  if (!s) return Address.parse(ZERO_ADDRESS_BOC);
  try {
    if (typeof s === 'string') return Address.parse(s);
    return s as Address;
  } catch (e) {
    // fallback to zero address if parsing fails
    try { return Address.parse(ZERO_ADDRESS_BOC); } catch { throw e; }
  }
}

function buildJettonTransferPayload(amount: bigint, destination: Address, responseTo: Address | null) {
  // normalize responseTo: if null/undefined, use canonical zero-address to ensure valid encoding
  const resp = responseTo ? responseTo : Address.parse(ZERO_ADDRESS_BOC);
  const cell = beginCell()
    .storeUint(0xF8A7EA5, 32) // op code 'transfer' (common jetton op)
    .storeUint(0, 64) // query id
    .storeCoins(amount) // token amount in smallest units
    .storeAddress(destination)
    .storeAddress(resp)
    .storeCoins(BigInt(0)) // forward TON amount
    .endCell();
  return cell;
}

// Ensure message.amount covers forward TON plus a fee margin.
function ensureMessageAmount(forwardTon: bigint, diagnostic: boolean) : bigint {
  const feeMargin = diagnostic ? toNano('0.05') : toNano('1.1');
  return forwardTon + feeMargin;
}

function buildJettonTransferPayloadVariant(amount: bigint, destination: Address, responseTo: Address | null, forwardTon: bigint = BigInt(0), opcodeOverride?: number) {
  const op = typeof opcodeOverride === 'number' ? opcodeOverride : 0xF8A7EA5;
  const resp = responseTo ? responseTo : Address.parse(ZERO_ADDRESS_BOC);
  const cell = beginCell()
    .storeUint(op, 32)
    .storeUint(0, 64)
    .storeCoins(amount)
    .storeAddress(destination)
    .storeAddress(resp)
    .storeCoins(forwardTon)
    .endCell();
  return cell;
}

export const PoCComponent: React.FC = () => {
  const connectedWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [txPreview, setTxPreview] = useState<any | null>(null);
  const [showDeepLink, setShowDeepLink] = useState(false);
  const [decodedPayloadHex, setDecodedPayloadHex] = useState<string | null>(null);
  const [decodedCellInfo, setDecodedCellInfo] = useState<string | null>(null);
  const [includeResponseTo, setIncludeResponseTo] = useState<boolean>(true);
  const [useDiagnosticLowFee, setUseDiagnosticLowFee] = useState<boolean>(false);
  const [sendToTokenMaster, setSendToTokenMaster] = useState<boolean>(true);
  const [lastTxJson, setLastTxJson] = useState<string | null>(null);
  const [derivedJettonWallet, setDerivedJettonWallet] = useState<string | null>(null);
  const [manualJettonWallet, setManualJettonWallet] = useState<string>('');
  const [deriveError, setDeriveError] = useState<string | null>(null);

  // expose a console helper so you can paste a TX JSON in devtools and resend it
  React.useEffect(() => {
    try {
      (window as any).sendTestTx = async (tx: any) => {
        if (!tonConnectUI) throw new Error('tonConnectUI not available');
        console.log('window.sendTestTx invoked', tx);
        return await tonConnectUI.sendTransaction(tx as any);
      };
    } catch (e) {
      console.warn('failed to install window.sendTestTx helper', e);
    }
    // no cleanup: keep helper available for debugging during session
  }, [tonConnectUI]);

  // Attempt to derive user's jetton-wallet address (owner's jetton wallet) from master + owner
  React.useEffect(() => {
    let cancelled = false;
    async function derive() {
      setDeriveError(null);
      setDerivedJettonWallet(null);
      try {
        if (!connectedWallet) return;
        // dynamic import ton-core
        const ton = await import('ton-core');
        const master = CSPIN_TOKEN_ADDRESS;
        const owner = connectedWallet.account.address;

        // prefer a helper if present in this ton-core build
        if (typeof (ton as any).getJettonWalletAddress === 'function') {
          try {
            const addr = (ton as any).getJettonWalletAddress(master, owner);
            if (!cancelled) setDerivedJettonWallet(String(addr));
            return;
          } catch (e) {
            // ignore and try other options
          }
        }

        if ((ton as any).JettonWallet && typeof (ton as any).JettonWallet.getAddress === 'function') {
          try {
            const addr = (ton as any).JettonWallet.getAddress(master, owner);
            if (!cancelled) setDerivedJettonWallet(String(addr));
            return;
          } catch (e) {
            // ignore
          }
        }

        // Fallback: try to compute address from known JettonWallet code BOC if available (dynamic import)
        try {
    const mod = await import('./jetton_wallet_code_base64.js');
          const JETTON_WALLET_CODE_BOC_BASE64 = mod?.JETTON_WALLET_CODE_BOC_BASE64;
          if (JETTON_WALLET_CODE_BOC_BASE64 && typeof JETTON_WALLET_CODE_BOC_BASE64 === 'string' && JETTON_WALLET_CODE_BOC_BASE64.indexOf('REPLACE_WITH_REAL_BOC') === -1) {
            try {
              const codeBuf = (globalThis as any).Buffer.from(JETTON_WALLET_CODE_BOC_BASE64, 'base64');
              const codeCell = (ton as any).Cell.fromBoc ? (ton as any).Cell.fromBoc(codeBuf)[0] : null;
              if (!codeCell) throw new Error('codeCell parse failed');

              // Build data cell for JettonWallet state: owner address
              const dataCell = (ton as any).beginCell().storeAddress((ton as any).Address.parse(owner)).endCell();

              // Build stateInit and compute address using Address.createFromStateInit if available
              if ((ton as any).Address && typeof (ton as any).Address.createFromStateInit === 'function') {
                const addr = (ton as any).Address.createFromStateInit({ code: codeCell, data: dataCell });
                if (!cancelled) setDerivedJettonWallet(String(addr));
                return;
              }
            } catch (e) {
              // ignore fallback failures
            }
          }
        } catch (e) {
          // ignore dynamic import failures
        }

        // No convenient helper found in this build. Inform user to paste jetton-wallet manually.
        if (!cancelled) setDeriveError('자동 파생 불가: 브라우저 번들에서 jetton helper를 찾을 수 없습니다. 수동으로 jetton-wallet 주소를 붙여넣어 주세요.');
      } catch (e: any) {
        console.warn('derive jetton wallet failed', e);
        if (!cancelled) setDeriveError('자동 파생 중 오류: ' + ((e && e.message) || String(e)));
      }
    }
    derive();
    return () => { cancelled = true; };
  }, [connectedWallet]);

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

  // choose recipient-jt-wallet for payload destination: manual override > derived jetton-wallet > fallback to GAME_WALLET_ADDRESS
  const payloadDestAddrStr = (manualJettonWallet && manualJettonWallet.length > 0) ? manualJettonWallet : (derivedJettonWallet ? derivedJettonWallet : GAME_WALLET_ADDRESS as string);
  const toAddress = Address.parse(payloadDestAddrStr);
  const responseAddress = includeResponseTo ? Address.parse(connectedWallet.account.address) : null;

  // Safety guard: if payload destination equals the connected wallet (owner) address, don't send payload directly to owner.
  // This prevents accidental TON-only approvals where wallet shows native TON transfer UI instead of token transfer.
  if (!sendToTokenMaster) {
    const ownerAddr = connectedWallet.account.address;
    if (payloadDestAddrStr === ownerAddr) {
      alert('경고: 페이로드 대상이 연결된 지갑(Owner)입니다. 직접 owner로 전송하면 지갑이 TON 승인으로 표시할 수 있습니다. \n\n해결 방법:\n- "보내기 대상: Token Master 사용" 옵션을 켜고 재시도하거나\n- 수동으로 올바른 jetton-wallet 주소를 입력하세요.');
      setBusy(false);
      return;
    }
  }

  const payloadCell = buildJettonTransferPayload(amount, toAddress, responseAddress);
  const payloadBase64 = payloadCell.toBoc().toString("base64");

  // validUntil: TonConnect expects validUntil not too far in the future — keep 5 minutes
  const VALID_SECONDS = 60 * 5; // 5 minutes
      const validUntil = Math.floor(Date.now() / 1000) + VALID_SECONDS;

  // Compute forward amount (we used zero for buildJettonTransferPayload)
  const forwardAmount = BigInt(0);
  // compute required message amount to cover forward + fee margin
  const requiredAmount = ensureMessageAmount(forwardAmount, useDiagnosticLowFee);
  const TON_FEE = requiredAmount.toString();

      // Choose recipient based on toggle: token master or jetton-wallet (payload destination)
      const recipientAddress = sendToTokenMaster ? CSPIN_TOKEN_ADDRESS : payloadDestAddrStr;
      const tx = {
        validUntil,
        messages: [
          {
            address: recipientAddress,
            amount: TON_FEE,
            payload: payloadBase64,
          },
        ],
      };

      // Detailed logging to help debug TonConnect delivery issues
      console.log('Prepared tx:', {
        validUntil,
        messages: tx.messages.map((m: any) => ({ address: m.address, amount: m.amount, payloadLen: m.payload ? m.payload.length : 0 })),
      });

      // populate preview for user verification and deep-link help
      setTxPreview({
        to: payloadDestAddrStr,
        amount: TON_FEE,
        validUntil,
        payloadDisplay: payloadBase64.slice(0, 120) + (payloadBase64.length > 120 ? '...' : ''),
        payloadFull: payloadBase64,
        responseTo: responseAddress ? connectedWallet.account.address : null,
      });

      // store full tx json for copy/debug
      try {
        setLastTxJson(JSON.stringify(tx, null, 2));
      } catch (e) {
        setLastTxJson(String(tx));
      }

      // Simple retry logic for transient bridge/network issues (e.g. rate limit on public bridge)
      let lastErr: any = null;
      const MAX_RETRIES = 2;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const attemptId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
          console.log(`sendTransaction attempt ${attempt + 1} id=${attemptId}`);
          // log timestamp for correlating with bridge/wallet logs
          console.log('sendTransaction timestamp:', new Date().toISOString(), 'attemptId=', attemptId, 'useDiagnosticLowFee=', useDiagnosticLowFee);
          const result = await tonConnectUI.sendTransaction(tx as any);
          console.log('sendTransaction result:', result, 'attemptId=', attemptId);
          alert("CSPIN 입금 요청이 생성되었습니다. 지갑에서 트랜잭션을 확인하세요.");
          lastErr = null;
          break;
        } catch (e: any) {
          lastErr = e;
          // richer error logging for debugging: include name/message/stack and any sdk fields
            try {
              console.error(`sendTransaction failed (attempt ${attempt + 1}):`, {
                errorName: e && e.name,
                errorMessage: e && e.message,
                errorStack: e && e.stack,
                raw: e,
              });
            } catch (logErr) {
              console.warn('sendTransaction failed, but error logging also failed', logErr);
              console.warn('original error:', e);
            }
          // normalize message
          let msg = '';
          try { msg = typeof e === 'string' ? e : JSON.stringify(e); } catch { msg = String(e); }

          // if bridge related error or 429/CORS, show deep link option
          if (msg.includes('bridge') || msg.includes('Bridge') || msg.includes('429') || msg.includes('CORS')) {
            setShowDeepLink(true);
          }

          // if error looks like request expired or transaction not sent due to timeout, open deep-link fallback on mobile
          const looksExpired = msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('transaction was not sent') || msg.toLowerCase().includes('not sent');
          if (looksExpired) {
            setShowDeepLink(true);
            // if mobile user agent, attempt to open telegram wallet deep link after short delay
            try {
              const ua = navigator.userAgent || '';
              const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
              const openDeepLink = () => {
                // attempt tg resolve deep link
                const tg = `tg://resolve?domain=wallet`;
                try {
                  if (isMobile) {
                    window.location.href = tg;
                  } else {
                    // open in new tab for desktop as fallback
                    window.open('https://wallet.ton.org/', '_blank');
                  }
                } catch (err) {
                  try { window.open('https://wallet.ton.org/', '_blank'); } catch {}
                }
              };
              // schedule open so the current error flow can complete first
              setTimeout(openDeepLink, 900);
            } catch (err) {
              console.warn('deep-link open failed:', err);
            }
          }

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
    <div style={{ padding: 12, maxWidth: 980, margin: '0 auto' }}>
      <h2>CSPIN 입금하기</h2>
      <p style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>연결된 지갑: {connectedWallet.account.address}</p>

      <div style={{ marginBottom: 8 }}>
        <label>
          입금 수량 (CSPIN):{" "}
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            min={0}
            style={{ width: '100%', maxWidth: 160 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={includeResponseTo}
            onChange={(e) => setIncludeResponseTo(e.target.checked)}
          />{' '}
          Include response_to (send callback to connected wallet)
        </label>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={useDiagnosticLowFee}
            onChange={(e) => setUseDiagnosticLowFee(e.target.checked)}
          />{' '}
          Diagnostic low fee (0.05 TON) — only for testing
        </label>
      </div>

      <button onClick={handleDeposit} disabled={busy} style={{ padding: '10px 14px', fontSize: 16, width: '100%', maxWidth: 220 }}>
        {busy ? '처리중...' : (
          // if the deposit amount string is very long, show a short, stable label to avoid overflow
          (typeof depositAmount === 'string' && depositAmount.length > 12) ? 'CSPIN 토큰 입금' : `${depositAmount} CSPIN 입금`
        )}
      </button>

      {/* Test buttons container: simple tx and payload tx - aligned */}
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <button
          onClick={async () => {
            try {
              setBusy(true);
              if (!connectedWallet) {
                alert('지갑을 먼저 연결해주세요.');
                return;
              }
              const VALID_SECONDS = 60 * 5;
              const tx = {
                validUntil: Math.floor(Date.now() / 1000) + VALID_SECONDS,
                messages: [
                  {
                    address: CSPIN_TOKEN_ADDRESS,
                    amount: toNano('0.05').toString(),
                    // intentionally no payload
                  },
                ],
              };
              const txJson = JSON.stringify(tx, null, 2);
              console.log('TEST SIMPLE TX', txJson);
              setLastTxJson(txJson);
              await tonConnectUI.sendTransaction(tx as any);
              alert('간단 전송 요청을 보냈습니다. 지갑에서 확인하세요.');
            } catch (e) {
              console.error('simple tx failed', e);
              alert('간단 전송 실패: ' + (e && (e as any).message ? (e as any).message : String(e)));
            } finally {
              setBusy(false);
            }
          }}
          style={{ padding: '8px 12px', fontSize: 14 }}
        >
          Payload 없이 전송 (테스트)
        </button>

        {/* Payload test button: prepare real jetton transfer payload and send using current diagnostic fee setting */}
        <button
          onClick={async () => {
            try {
              setBusy(true);
              if (!connectedWallet) {
                alert('지갑을 먼저 연결해주세요.');
                return;
              }

              // reuse same logic as handleDeposit for building payload/amount
              const DECIMALS = 9n;
              const amountWhole = BigInt(Math.max(0, Number(depositAmount)));
              const amount = amountWhole * 10n ** DECIMALS;
              const masterAddress = Address.parse(GAME_WALLET_ADDRESS);
              const responseAddress = includeResponseTo ? Address.parse(connectedWallet.account.address) : null;

              // recipient should be the user's jetton-wallet address (derived or manual override)
              const recipient = manualJettonWallet && manualJettonWallet.length > 0 ? manualJettonWallet : derivedJettonWallet;
              if (!recipient) {
                alert('Jetton wallet 주소를 파생할 수 없습니다. 수동으로 jetton-wallet 주소를 입력하세요.');
                setBusy(false);
                return;
              }
              const toAddress = Address.parse(recipient as string);
              const payloadCell = buildJettonTransferPayload(amount, toAddress, responseAddress);
              const payloadBase64 = payloadCell.toBoc().toString('base64');

              const VALID_SECONDS = 60 * 5;
              const validUntil = Math.floor(Date.now() / 1000) + VALID_SECONDS;
              // compute forward (0 here) and required message amount
              const forward = BigInt(0);
              const TON_FEE_BIG = ensureMessageAmount(forward, useDiagnosticLowFee);
              const TON_FEE = TON_FEE_BIG.toString();
              const recipientAddress = sendToTokenMaster ? CSPIN_TOKEN_ADDRESS : (recipient as string);

              const tx = {
                validUntil,
                messages: [
                  {
                    // send payload to selected recipient
                    address: recipientAddress,
                    amount: TON_FEE,
                    payload: payloadBase64,
                  },
                ],
              };

              const txJson = JSON.stringify(tx, null, 2);
              console.log('TEST PAYLOAD TX', txJson);
              setLastTxJson(txJson);
              // send through TonConnect UI
              await tonConnectUI.sendTransaction(tx as any);
              alert('페이로드 포함 전송 요청을 보냈습니다. 지갑에서 확인하세요.');
            } catch (e) {
              console.error('payload tx failed', e);
              alert('payload 전송 실패: ' + (e && (e as any).message ? (e as any).message : String(e)));
            } finally {
              setBusy(false);
            }
          }}
          style={{ padding: '8px 12px', fontSize: 14 }}
        >
          Payload 포함 전송 (테스트)
        </button>
      </div>

      {/* Derived jetton-wallet info */}
      <div style={{ marginTop: 10 }}>
        <strong>파생된 Jetton-wallet 주소</strong>
        <div style={{ marginTop: 6 }}>
          <input value={derivedJettonWallet ?? manualJettonWallet} onChange={(e) => setManualJettonWallet(e.target.value)} style={{ width: '100%', maxWidth: 560 }} placeholder={derivedJettonWallet ? '자동 파생됨 - 필요 시 덮어쓰기 가능' : '자동 파생 실패: 수동 입력하세요'} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => { const v = manualJettonWallet || derivedJettonWallet; if (v) { navigator.clipboard.writeText(v); alert('Jetton wallet 주소 복사됨'); } else { alert('복사할 주소가 없습니다'); } }}>주소 복사</button>
          <span style={{ marginLeft: 12, color: '#666' }}>{deriveError ? `Error: ${deriveError}` : (derivedJettonWallet ? '자동 파생 성공' : '자동 파생 중...')}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            <input type="checkbox" checked={sendToTokenMaster} onChange={(e) => setSendToTokenMaster(e.target.checked)} /> 보내기 대상: Token Master 사용
          </label>
        </div>
      </div>

      {/* Last TX JSON display + variant test buttons */}
      <div style={{ marginTop: 12 }}>
        <strong>최근 전송 TX JSON (복사 가능)</strong>
        <div style={{ marginTop: 8 }}>
          <textarea readOnly value={lastTxJson ?? ''} style={{ width: '100%', height: 140, fontSize: 12 }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => { if (lastTxJson) { navigator.clipboard.writeText(lastTxJson); alert('TX JSON이 클립보드에 복사되었습니다.'); } else { alert('복사할 TX JSON이 없습니다.'); } }}>TX JSON 복사</button>
          <button style={{ marginLeft: 8 }} onClick={() => setLastTxJson(null)}>지우기</button>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={async () => {
            // variant: omit response_to
            try {
              setBusy(true);
              const DECIMALS = 9n;
              const amountWhole = BigInt(Math.max(0, Number(depositAmount)));
              const amount = amountWhole * 10n ** DECIMALS;
              const recipientForPayload = manualJettonWallet && manualJettonWallet.length > 0 ? manualJettonWallet : derivedJettonWallet;
              if (!recipientForPayload) {
                alert('Jetton wallet 주소를 파생할 수 없습니다. 수동으로 jetton-wallet 주소를 입력하세요.');
                setBusy(false);
                return;
              }
              const toAddress = Address.parse(recipientForPayload as string);
              const payloadCell = buildJettonTransferPayloadVariant(amount, toAddress, null, BigInt(0));
              const payloadBase64 = payloadCell.toBoc().toString('base64');
              const VALID_SECONDS = 60 * 5;
              const tx = { validUntil: Math.floor(Date.now() / 1000) + VALID_SECONDS, messages: [{ address: recipientForPayload as string, amount: (useDiagnosticLowFee ? toNano('0.05') : toNano('1.1')).toString(), payload: payloadBase64 }] };
              const txJson = JSON.stringify(tx, null, 2);
              setLastTxJson(txJson);
              console.log('VARIANT omit response_to', txJson);
              await tonConnectUI.sendTransaction(tx as any);
            } catch (e) {
              console.error('variant omit failed', e);
              alert('variant omit failed: ' + ((e as any)?.message ?? String(e)));
            } finally { setBusy(false); }
          }}>Variant: omit response_to</button>

          <button onClick={async () => {
            // variant: set forward TON to 1 TON
            try {
              setBusy(true);
              const DECIMALS = 9n;
              const amountWhole = BigInt(Math.max(0, Number(depositAmount)));
              const amount = amountWhole * 10n ** DECIMALS;
              const recipientForPayload = manualJettonWallet && manualJettonWallet.length > 0 ? manualJettonWallet : derivedJettonWallet;
              if (!recipientForPayload) {
                alert('Jetton wallet 주소를 파생할 수 없습니다. 수동으로 jetton-wallet 주소를 입력하세요.');
                setBusy(false);
                return;
              }
              const toAddress = Address.parse(recipientForPayload as string);
              const forward = toNano('1');
              // include forward in payload and ensure message.amount covers forward plus fee margin
              const payloadCell = buildJettonTransferPayloadVariant(amount, toAddress, includeResponseTo ? Address.parse(connectedWallet.account.address) : null, forward);
              const payloadBase64 = payloadCell.toBoc().toString('base64');
              const VALID_SECONDS = 60 * 5;
              // ensure message TON amount includes forward plus a fee margin
              const msgAmountBig = ensureMessageAmount(forward, useDiagnosticLowFee);
              const recipientAddr = sendToTokenMaster ? CSPIN_TOKEN_ADDRESS : (recipientForPayload as string);
              const tx = { validUntil: Math.floor(Date.now() / 1000) + VALID_SECONDS, messages: [{ address: recipientAddr, amount: msgAmountBig.toString(), payload: payloadBase64 }] };
              const txJson = JSON.stringify(tx, null, 2);
              setLastTxJson(txJson);
              console.log('VARIANT forward 1 TON (encoded in payload structure)', txJson);
              await tonConnectUI.sendTransaction(tx as any);
            } catch (e) {
              console.error('variant forward failed', e);
              alert('variant forward failed: ' + ((e as any)?.message ?? String(e)));
            } finally { setBusy(false); }
          }}>Variant: forward 1 TON</button>

          <button onClick={async () => {
            // diagnostic: send with higher TON fee (2.5 TON) to rule out fee/simulation mismatch
            try {
              setBusy(true);
              const DECIMALS = 9n;
              const amountWhole = BigInt(Math.max(0, Number(depositAmount)));
              const amount = amountWhole * 10n ** DECIMALS;
              const toAddress = Address.parse(GAME_WALLET_ADDRESS);
              const responseAddr = includeResponseTo ? Address.parse(connectedWallet.account.address) : null;
              const payloadCell = buildJettonTransferPayload(amount, toAddress, responseAddr);
              const payloadBase64 = payloadCell.toBoc().toString('base64');
              const VALID_SECONDS = 60 * 5;
              const highFeeBig = toNano('2.5');
              const recipientAddr = sendToTokenMaster ? CSPIN_TOKEN_ADDRESS : toAddress.toString();
              const tx = { validUntil: Math.floor(Date.now() / 1000) + VALID_SECONDS, messages: [{ address: recipientAddr, amount: highFeeBig.toString(), payload: payloadBase64 }] };
              const txJson = JSON.stringify(tx, null, 2);
              setLastTxJson(txJson);
              console.log('DIAG high-fee payload tx', txJson);
              await tonConnectUI.sendTransaction(tx as any);
            } catch (e) {
              console.error('high-fee payload failed', e);
              alert('high-fee payload failed: ' + ((e as any)?.message ?? String(e)));
            } finally { setBusy(false); }
          }}>Diagnostic: High TON fee (2.5 TON)</button>

          <button onClick={async () => {
            // variant: opcode override to a different value (for testing)
            try {
              setBusy(true);
              const DECIMALS = 9n;
              const amountWhole = BigInt(Math.max(0, Number(depositAmount)));
              const amount = amountWhole * 10n ** DECIMALS;
              const recipientForPayload = manualJettonWallet && manualJettonWallet.length > 0 ? manualJettonWallet : derivedJettonWallet;
              if (!recipientForPayload) {
                alert('Jetton wallet 주소를 파생할 수 없습니다. 수동으로 jetton-wallet 주소를 입력하세요.');
                setBusy(false);
                return;
              }
              const toAddress = Address.parse(recipientForPayload as string);
              const responseAddr = includeResponseTo ? Address.parse(connectedWallet.account.address) : null;
              const payloadCell = buildJettonTransferPayloadVariant(amount, toAddress, responseAddr, BigInt(0), 0x12345678);
              const payloadBase64 = payloadCell.toBoc().toString('base64');
              const VALID_SECONDS = 60 * 5;
              const msgAmountBig = ensureMessageAmount(BigInt(0), useDiagnosticLowFee);
              const recipientAddr = sendToTokenMaster ? CSPIN_TOKEN_ADDRESS : (recipientForPayload as string);
              const tx = { validUntil: Math.floor(Date.now() / 1000) + VALID_SECONDS, messages: [{ address: recipientAddr, amount: msgAmountBig.toString(), payload: payloadBase64 }] };
              const txJson = JSON.stringify(tx, null, 2);
              setLastTxJson(txJson);
              console.log('VARIANT opcode override', txJson);
              await tonConnectUI.sendTransaction(tx as any);
            } catch (e) {
              console.error('variant opcode failed', e);
              alert('variant opcode failed: ' + ((e as any)?.message ?? String(e)));
            } finally { setBusy(false); }
          }}>Variant: opcode override</button>
        </div>
      </div>

      {/* tx preview */}
      {txPreview && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #e1e1e1', borderRadius: 6 }}>
          <strong>트랜잭션 미리보기</strong>
          <div style={{ fontSize: 13, marginTop: 8 }}>
            <div>To: {txPreview.to}</div>
            <div>Amount (nano): {txPreview.amount}</div>
            <div>ValidUntil: {new Date(txPreview.validUntil * 1000).toLocaleString()}</div>
            <div>Payload (prefix):</div>
            <div style={{ maxWidth: '100%', overflowX: 'auto', wordBreak: 'normal' }}>
              <code style={{ whiteSpace: 'pre', display: 'block' }}>{txPreview.payloadDisplay}</code>
            </div>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={async () => {
                  // robust base64 -> Uint8Array helper that supports base64url and missing padding
                  function base64ToUint8Array(input: string): Uint8Array {
                    // remove whitespace
                    let s = input.replace(/\s+/g, '');
                    // base64url -> base64
                    s = s.replace(/-/g, '+').replace(/_/g, '/');
                    // pad with '=' to multiple of 4
                    while (s.length % 4 !== 0) {
                      s += '=';
                    }

                    // try browser atob first
                    try {
                      const bin = atob(s);
                      const bytes = new Uint8Array(bin.length);
                      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                      return bytes;
                    } catch (e) {
                      // fallback to Buffer (polyfilled in app via polyfills.ts)
                      if (typeof (globalThis as any).Buffer !== 'undefined') {
                        const buf = (globalThis as any).Buffer.from(s, 'base64');
                        return new Uint8Array(buf);
                      }
                      throw e;
                    }
                  }

                  try {
                    const bytes = base64ToUint8Array(txPreview.payloadFull);
                    const hex = Array.from(bytes).map(x => x.toString(16).padStart(2, '0')).join('');
                    setDecodedPayloadHex(hex);

                    // try to use ton-core BOC parser if available
                    try {
                      // dynamic import to avoid bundling issues
                      const ton = await import('ton-core');
                      if ((ton as any).Cell && typeof (ton as any).Cell.fromBoc === 'function') {
                        const cells = (ton as any).Cell.fromBoc((globalThis as any).Buffer.from(txPreview.payloadFull, 'base64'));
                        const info = `Parsed cells: ${cells.length}`;
                        setDecodedCellInfo(info);
                      } else if (typeof (ton as any).deserializeBoc === 'function') {
                        const cells = (ton as any).deserializeBoc((globalThis as any).Buffer.from(txPreview.payloadFull, 'base64'));
                        setDecodedCellInfo(`Parsed cells: ${cells.length}`);
                      } else {
                        setDecodedCellInfo('No compatible BOC parser found in ton-core build.');
                      }
                    } catch (err) {
                      setDecodedCellInfo('BOC parse attempt failed: ' + String(err));
                    }
                  } catch (err) {
                    setDecodedPayloadHex('Failed to decode payload: ' + String(err));
                  }
                }}
              >
                Decode payload
              </button>
        
            <button onClick={async () => {
              // Direct payload -> jetton-wallet test (visible)
              try {
                setBusy(true);
                if (!connectedWallet) { alert('지갑을 먼저 연결해주세요.'); return; }
                const DECIMALS = 9n;
                const amountWhole = BigInt(Math.max(0, Number(depositAmount)));
                const amount = amountWhole * 10n ** DECIMALS;
                const recipientForPayload = manualJettonWallet && manualJettonWallet.length > 0 ? manualJettonWallet : derivedJettonWallet;
                if (!recipientForPayload) { alert('Jetton wallet 주소를 파생할 수 없습니다. 수동으로 jetton-wallet 주소를 입력하세요.'); setBusy(false); return; }
                const toAddress = Address.parse(recipientForPayload as string);
                const responseAddr = includeResponseTo ? Address.parse(connectedWallet.account.address) : null;
                const payloadCell = buildJettonTransferPayload(amount, toAddress, responseAddr);
                const payloadBase64 = payloadCell.toBoc().toString('base64');
                const VALID_SECONDS = 60 * 5;
                const TON_FEE = (useDiagnosticLowFee ? toNano('0.05') : toNano('1.1')).toString();
                const tx = { validUntil: Math.floor(Date.now() / 1000) + VALID_SECONDS, messages: [{ address: recipientForPayload as string, amount: TON_FEE, payload: payloadBase64 }] };
                const txJson = JSON.stringify(tx, null, 2);
                setLastTxJson(txJson);
                console.log('TEST DIRECT PAYLOAD -> jetton-wallet', txJson);
                await tonConnectUI.sendTransaction(tx as any);
              } catch (e) { console.error('direct payload tx failed', e); alert('직접 전송 실패: ' + ((e as any)?.message ?? String(e))); } finally { setBusy(false); }
            }}
            style={{ padding: '8px 12px', fontSize: 14 }}
          >
            Payload → jetton-wallet (직접 전송 테스트)
          </button>
            </div>
          </div>
        </div>
      )}

      {decodedPayloadHex && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
          <strong>Payload Hex</strong>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{decodedPayloadHex}</pre>
          {decodedCellInfo && <div style={{ marginTop: 8 }}>{decodedCellInfo}</div>}
        </div>
      )}

      {/* deep link helper when bridge fails */}
      {showDeepLink && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #cce5ff', borderRadius: 6, background: '#f0f8ff' }}>
          <strong>브리지 연결 문제가 의심됩니다.</strong>
          <div style={{ marginTop: 8 }}>
            모바일에서 직접 지갑을 열어 승인해 보세요.
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => {
                // open tg resolve for TON Wallet
                const url = `tg://resolve?domain=wallet&appname=start&startapp=tonconnect-v__2-id__${encodeURIComponent(
                  'manual-open'
                )}-ret__back`;
                window.location.href = url;
              }}
            >
              Open in Telegram Wallet
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                // fallback to wallet web deep link
                const url = `https://wallet.ton.org/`;
                window.open(url, '_blank');
              }}
            >
              Open Wallet Web
            </button>
          </div>
        </div>
      )}
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
