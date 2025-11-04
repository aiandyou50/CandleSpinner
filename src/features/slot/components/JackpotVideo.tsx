/**
 * 잭팟 비디오 컴포넌트
 * 전체 화면 비디오 재생
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JackpotVideoProps {
  onComplete?: () => void;
}

export function JackpotVideo({ onComplete }: JackpotVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 비디오 재생 시도
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[Jackpot] Video playing');
        })
        .catch((error) => {
          console.warn('[Jackpot] Video play failed:', error);
          // 비디오 재생 실패 시 폴백 애니메이션
          setShowFallback(true);
          setTimeout(() => {
            setIsPlaying(false);
            onComplete?.();
          }, 5000);
        });
    }

    // 비디오 종료 이벤트
    const handleEnded = () => {
      console.log('[Jackpot] Video ended');
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  if (!isPlaying && !showFallback) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="jackpot-video-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {!showFallback ? (
          <video
            ref={videoRef}
            src="/jackpot_video.mp4"
            className="jackpot-video"
            autoPlay
            muted={false}
            playsInline
          />
        ) : (
          // 폴백 애니메이션 (비디오가 없거나 재생 실패 시)
          <motion.div
            className="jackpot-fallback"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="jackpot-title"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              🎰 JACKPOT! 🎰
            </motion.div>
            <motion.div
              className="jackpot-confetti"
              animate={{
                y: [0, -20, 0],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              🎉 🎊 ✨ 💎 ✨ 🎊 🎉
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
