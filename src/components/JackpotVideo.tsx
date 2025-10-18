// src/components/JackpotVideo.tsx
import React, { useEffect, useRef } from 'react';

interface JackpotVideoProps {
  isVisible: boolean;
  onClose: () => void;
}

export const JackpotVideo: React.FC<JackpotVideoProps> = ({ isVisible, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      // Play video when modal opens
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [isVisible]);

  const handleVideoEnd = () => {
    // Close modal when video ends
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onEnded={handleVideoEnd}
        autoPlay
        playsInline
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Skip button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm"
      >
        ⏩ Skip
      </button>
    </div>
  );
};

export default JackpotVideo;
