import React, { useEffect, useMemo, useState } from 'react';
import { clearLogs, logger, subscribe } from '../lib/logger';
import type { LogEntry, LogLevel } from '../lib/logger';

export const DebugPanel: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    return subscribe((snapshot) => setEntries([...snapshot].reverse()));
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setVisible((prev) => !prev);
        logger.info('Debug panel toggle', { visible: !visible }, 'DebugPanel');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  const formatted = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        timestampLabel: new Date(entry.timestamp).toLocaleTimeString(),
      })),
    [entries],
  );

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: '360px',
        maxHeight: '60vh',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        color: '#f8fafc',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.4)',
        fontFamily: 'ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(248, 250, 252, 0.1)',
        }}
      >
        <div>
          <strong>Debug Console</strong>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Ctrl + Shift + D 로 토글</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => clearLogs()}
            style={{
              background: 'transparent',
              border: '1px solid rgba(248, 250, 252, 0.2)',
              color: '#f8fafc',
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(248, 250, 252, 0.2)',
              color: '#f8fafc',
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Hide
          </button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', padding: '12px 16px', display: 'grid', gap: 12 }}>
        {formatted.length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.7 }}>로그가 없습니다.</div>
        ) : (
          formatted.map((entry) => (
            <div
              key={entry.id}
              style={{
                borderLeft: `3px solid ${getLevelColor(entry.level)}`,
                paddingLeft: 12,
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: getLevelColor(entry.level), fontWeight: 600 }}>{entry.level.toUpperCase()}</span>
                <span style={{ opacity: 0.6 }}>{entry.timestampLabel}</span>
              </div>
              <div style={{ marginTop: 4 }}>{entry.message}</div>
              {entry.origin ? <div style={{ fontSize: 12, opacity: 0.6 }}>origin: {entry.origin}</div> : null}
              {entry.details ? (
                <pre
                  style={{
                    marginTop: 6,
                    padding: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function getLevelColor(level: LogLevel): string {
  switch (level) {
    case 'debug':
      return '#38bdf8';
    case 'info':
      return '#22c55e';
    case 'warn':
      return '#f97316';
    case 'error':
      return '#ef4444';
    default:
      return '#cbd5f5';
  }
}
