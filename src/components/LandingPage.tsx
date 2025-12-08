import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LandingPage() {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3 fixed top-0 left-0 right-0 z-50 max-w-[960px] mx-auto bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-solid border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="text-primary size-6">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h2 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">CandleSpinner</h2>
              </div>
              <div className="flex flex-1 justify-end items-center gap-4">
                <nav className="hidden sm:flex items-center gap-6">
                  <a className="text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-primary dark:hover:text-primary transition-colors" href="#features">주요 특징</a>
                  <a className="text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-primary dark:hover:text-primary transition-colors" href="#how-to-use">이용 방법</a>
                </nav>
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-10 px-4 bg-primary text-white text-sm font-bold shadow-lg hover:shadow-primary/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"></path>
                    <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"></path>
                    <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.344-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z" fill="#4CAF50"></path>
                    <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C43.021,36.251,44,30.663,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"></path>
                  </svg>
                  <span className="truncate">{isSigningIn ? '로그인 중...' : 'Google로 시작하기'}</span>
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="mt-16 sm:mt-20">
              {/* Hero Section */}
              <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-lg overflow-hidden flex items-center justify-center text-center p-4">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  poster="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&h=800&fit=crop"
                  className="absolute top-0 left-0 w-full h-full object-cover z-0"
                >
                  <source src="https://videos.pexels.com/video-files/3843433/3843433-hd_1920_1080_30fps.mp4" type="video/mp4" />
                </video>
                <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>
                <div className="relative z-20 flex flex-col gap-6 items-center">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-white text-4xl sm:text-6xl font-black tracking-tighter">🎰 CandleSpinner</h1>
                    <h2 className="text-white/90 text-base sm:text-lg font-normal">TON 블록체인 기반 슬롯머신 게임</h2>
                  </div>
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-base font-bold shadow-lg hover:shadow-primary/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"></path>
                      <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"></path>
                      <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.344-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z" fill="#4CAF50"></path>
                      <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C43.021,36.251,44,30.663,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"></path>
                    </svg>
                    <span className="truncate">{isSigningIn ? '로그인 중...' : 'Google로 시작하기'}</span>
                  </button>
                </div>
              </div>

              {/* Features Section */}
              <div className="flex flex-col gap-10 px-4 py-16 sm:py-24" id="features">
                <div className="flex flex-col gap-3 text-center items-center">
                  <h2 className="text-gray-900 dark:text-white text-3xl sm:text-4xl font-black tracking-tight max-w-2xl">왜 CandleSpinner인가요?</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-relaxed max-w-2xl">TON 블록체인을 활용한 안전하고 투명한 게임 경험을 제공합니다.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-1 gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6 flex-col items-start text-left">
                    <div className="bg-primary/20 text-primary rounded-full p-3">
                      <span className="material-symbols-outlined text-2xl">security</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-gray-900 dark:text-white text-lg font-bold">블록체인 보안</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">TON 블록체인의 투명성과 보안으로 안전한 게임을 즐기세요.</p>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6 flex-col items-start text-left">
                    <div className="bg-primary/20 text-primary rounded-full p-3">
                      <span className="material-symbols-outlined text-2xl">paid</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-gray-900 dark:text-white text-lg font-bold">CSPIN 토큰</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">CSPIN Jetton으로 게임을 플레이하고 보상을 받으세요.</p>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6 flex-col items-start text-left">
                    <div className="bg-primary/20 text-primary rounded-full p-3">
                      <span className="material-symbols-outlined text-2xl">casino</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-gray-900 dark:text-white text-lg font-bold">공정한 게임</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">투명한 RTP 시스템으로 공정한 슬롯 게임을 경험하세요.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Use Section */}
              <div className="px-4 py-16 sm:py-24" id="how-to-use">
                <div className="flex flex-col gap-3 text-center items-center mb-12">
                  <h2 className="text-gray-900 dark:text-white text-3xl sm:text-4xl font-black tracking-tight max-w-2xl">CandleSpinner 이용 방법</h2>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 max-w-md mx-auto">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">login</span>
                    </div>
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-10 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col pb-10 pt-2">
                    <p className="text-gray-900 dark:text-white text-base font-bold">Google 로그인</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Google 계정으로 시작하세요</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-2"></div>
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                    </div>
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-10 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col pb-10 pt-2">
                    <p className="text-gray-900 dark:text-white text-base font-bold">지갑 연결</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">TON 지갑을 연결하세요</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-2"></div>
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">savings</span>
                    </div>
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-10 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col pb-10 pt-2">
                    <p className="text-gray-900 dark:text-white text-base font-bold">CSPIN 입금</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">CSPIN 토큰을 입금하세요</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-2"></div>
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">casino</span>
                    </div>
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-10 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col pb-10 pt-2">
                    <p className="text-gray-900 dark:text-white text-base font-bold">게임 플레이</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">슬롯을 돌려 보상을 받으세요</p>
                  </div>

                  <div className="flex flex-col items-center gap-2 pb-3">
                    <div className="w-px bg-gray-300 dark:bg-gray-600 h-2"></div>
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">currency_exchange</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col pt-2">
                    <p className="text-gray-900 dark:text-white text-base font-bold">출금</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">원하실 때 언제든지 출금하세요</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="mt-16 sm:mt-24 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 CandleSpinner. 모든 권리 보유.</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base">mail</span>
                    <a className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="mailto:support@candlespinner.com">
                      고객 지원: support@candlespinner.com
                    </a>
                  </div>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
