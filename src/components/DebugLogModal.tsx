/**
 * 디버그 로그 모달
 * 모바일에서 로그를 확인하고 복사할 수 있는 UI
 */

import { useState } from 'react';
import { logger } from '@/utils/logger';

interface DebugLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebugLogModal({ isOpen, onClose }: DebugLogModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const logs = logger.getLogsAsText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: 텍스트 선택
      const textArea = document.createElement('textarea');
      textArea.value = logs;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    logger.clear();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">🐛 디버그 로그</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 로그 내용 */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words bg-gray-800 p-4 rounded-lg">
            {logs || '로그가 없습니다.'}
          </pre>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-4 p-6 border-t border-gray-700">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition"
          >
            {copied ? '✅ 복사됨!' : '📋 복사하기'}
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition"
          >
            🗑️ 로그 지우기
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
