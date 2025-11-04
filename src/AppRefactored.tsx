/**
 * CandleSpinner - 리팩토링된 메인 앱 컴포넌트
 * Google 스타일 디자인 시스템 적용
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useCredit } from '@/hooks/useCredit';
import { Deposit } from '@/components/Deposit';
import { Withdraw } from '@/components/Withdraw';
import { AdminWithdrawals } from '@/components/AdminWithdrawals';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SlotMachineV3 } from '@/features/slot/components/SlotMachineV3';

// 메인 게임 페이지 (새 디자인)
function GamePageNew() {
  const { t } = useTranslation();
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* 배경 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative z-10">
        {/* 헤더 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full px-4 py-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* 로고 및 타이틀 */}
                <div className="text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-2">
                    🕯️ {t('app.title')}
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base">
                    {t('app.subtitle')}
                  </p>
                </div>

                {/* 언어 선택 & 지갑 연결 */}
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <TonConnectButton />
                </div>
              </div>

              {/* 크레딧 표시 */}
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 glass-hover rounded-xl p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">
                        {t('header.credit')}
                      </div>
                      <div className="text-3xl md:text-4xl font-display font-bold text-white">
                        {isLoading ? (
                          <span className="animate-pulse" role="status" aria-live="polite" aria-label={t('header.loading')}>
                            {t('header.loading')}
                          </span>
                        ) : (
                          <span className="text-gradient">{credit}</span>
                        )}{' '}
                        CSPIN
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="text-5xl"
                    >
                      💎
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.header>

        {/* 메인 컨텐츠 */}
        <main className="w-full px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {isConnected && walletAddress ? (
              <div className="space-y-8">
                {/* 입금 & 인출 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <Deposit walletAddress={walletAddress} onSuccess={refreshCredit} />
                  <Withdraw
                    walletAddress={walletAddress}
                    currentCredit={credit}
                    onSuccess={refreshCredit}
                  />
                </motion.div>

                {/* 슬롯머신 V3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <SlotMachineV3
                    walletAddress={walletAddress}
                    currentCredit={credit}
                    onCreditChange={refreshCredit}
                  />
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-12 shadow-2xl text-center max-w-2xl mx-auto"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  🎰
                </motion.div>
                <h2 className="text-3xl font-heading font-bold mb-4">
                  {t('wallet.connectPrompt')}
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Connect your TON wallet to start spinning and winning!
                </p>
                <div className="flex justify-center">
                  <TonConnectButton />
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* 푸터 */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full px-4 py-8 text-center"
        >
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-4">
              <p className="text-gray-400 text-sm">
                {t('app.footer')} | RTP 95% | {t('game.subtitle')}
              </p>
              <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
                <span>© 2024 CandleSpinner</span>
                <span>•</span>
                <Link to="/admin" className="hover:text-purple-400 transition-colors">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

// 앱 라우터
function AppRefactored() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePageNew />} />
        <Route path="/admin" element={<AdminWithdrawals />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRefactored;
