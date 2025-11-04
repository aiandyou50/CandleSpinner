/**
 * 잭팟 비디오 컴포넌트 (새 디자인)
 * public/jackpot_video.mp4 재생
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JackpotVideoNewProps {
  isPlaying: boolean;
  onComplete: () => void;
}

export function JackpotVideoNew({ isPlaying, onComplete }: JackpotVideoNewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      setHasError(false);
      
      // 비디오 재생
      video.currentTime = 0;
      video.play().catch((error) => {
        console.error('Video playback failed:', error);
        setHasError(true);
        // 에러 시 3초 후 자동으로 완료 처리
        setTimeout(() => {
          onComplete();
        }, 3000);
      });

      // 비디오 종료 시 콜백
      const handleEnded = () => {
        onComplete();
      };

      // 비디오 에러 핸들러
      const handleError = () => {
        console.error('Video loading error');
        setHasError(true);
        setTimeout(() => {
          onComplete();
        }, 3000);
      };

      video.addEventListener('ended', handleEnded);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleError);
        video.pause();
      };
    }
  }, [isPlaying, onComplete]);

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] bg-black flex items-center justify-center"
        >
          {/* 잭팟 텍스트 오버레이 */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1 }}
            className="absolute top-10 left-0 right-0 text-center z-10"
          >
            <h1 className="text-8xl md:text-9xl font-bold text-yellow-400 tracking-wider jackpot-shake" style={{ textShadow: '0 0 30px rgba(255, 215, 0, 0.8)' }}>
              JACKPOT!
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-4xl md:text-5xl text-white mt-4"
            >
              🎰 💎 👑 💎 🎰
            </motion.div>
          </motion.div>

          {/* 비디오 또는 폴백 */}
          {!hasError ? (
            <video
              ref={videoRef}
              className="max-w-full max-h-full w-auto h-auto"
              autoPlay
              playsInline
              muted={false}
            >
              <source src="/jackpot_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center text-white">
              <p className="text-2xl">Celebrating your JACKPOT win! 🎉</p>
            </div>
          )}

          {/* 파티클 효과 (선택적) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#FFD700' : '#FFA500',
                  left: `${Math.random() * 100}%`,
                  top: '-5%',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, Math.random() * 100 - 50],
                  rotate: [0, 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
