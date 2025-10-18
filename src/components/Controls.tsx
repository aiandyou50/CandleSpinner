// src/components/Controls.tsx
interface ControlsProps {
  isProcessing: boolean;
  wallet: any;
  credit: number;
  showDoubleUp: boolean;
  lastWinnings: number;
  userCspinJettonWallet: string;
  setUserCspinJettonWallet: (wallet: string) => void;
  handleSpinClick: () => void;
  handleDeposit: () => void;
  handleWithdrawClick: () => void;
  handleGambleClick: (choice: 'red' | 'blue') => void;
  handleCollectClick: () => void;
}

export const Controls = (props: ControlsProps) => {
  const {
    isProcessing,
    wallet,
    credit,
    showDoubleUp,
    lastWinnings,
    userCspinJettonWallet,
    setUserCspinJettonWallet,
    handleSpinClick,
    handleDeposit,
    handleWithdrawClick,
    handleGambleClick,
    handleCollectClick,
  } = props;

  return (
    <div className="text-center space-y-4">
      {showDoubleUp ? (
        <div className="space-y-2">
          <p>상금 {lastWinnings}을 걸고 더블업 하시겠습니까?</p>
          <div className="space-x-4">
            <button onClick={() => handleGambleClick('red')} disabled={isProcessing} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded">RED</button>
            <button onClick={() => handleGambleClick('blue')} disabled={isProcessing} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">BLUE</button>
            <button onClick={handleCollectClick} disabled={isProcessing} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded">COLLECT</button>
          </div>
        </div>
      ) : (
        <button onClick={handleSpinClick} disabled={isProcessing || !wallet} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl disabled:opacity-50">🎰 SPIN!</button>
      )}
      <hr className="my-4 border-gray-600"/>
      <div className="space-x-4">
          <button onClick={handleDeposit} disabled={isProcessing || !wallet} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">💸 100 CSPIN 입금</button>
          <button onClick={handleWithdrawClick} disabled={isProcessing || !wallet || credit <= 0} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">💰 전체 인출</button>
      </div>
      <div className="text-xs text-gray-400 pt-2">
          <p>입금을 위해 CSPIN 젯톤 지갑 주소를 입력하세요.</p>
          <input type="text" value={userCspinJettonWallet} onChange={(e) => setUserCspinJettonWallet(e.target.value)} placeholder="Your CSPIN Jetton Wallet Address" className="mt-1 w-full max-w-md p-2 rounded bg-gray-800 text-white border border-gray-600"/>
      </div>
    </div>
  );
};
