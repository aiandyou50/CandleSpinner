export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  details?: unknown;
  origin?: string;
  timestamp: number;
}

const MAX_LOGS = 200;
const listeners = new Set<(entries: LogEntry[]) => void>();
let logs: LogEntry[] = [];

function emit(): void {
  const snapshot = logs.slice(-MAX_LOGS);
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribe(listener: (entries: LogEntry[]) => void): () => void {
  listeners.add(listener);
  listener(logs);
  return () => listeners.delete(listener);
}

export function clearLogs(): void {
  logs = [];
  emit();
}

function createEntry(level: LogLevel, message: string, details?: unknown, origin?: string): LogEntry {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level,
    message,
    timestamp: Date.now(),
    ...(details !== undefined ? { details } : {}),
    ...(origin ? { origin } : {}),
  };
  logs = [...logs, entry].slice(-MAX_LOGS);
  emit();
  return entry;
}

function log(level: LogLevel, message: string, details?: unknown, origin?: string): LogEntry {
  const entry = createEntry(level, message, details, origin);

  const prefix = `[UI][${level.toUpperCase()}]${origin ? `[${origin}]` : ''}`;
  // eslint-disable-next-line no-console -- 의도적으로 콘솔 출력
  console[level === 'debug' ? 'log' : level](prefix, message, details ?? '');

  return entry;
}

export const logger = {
  log,
  debug: (message: string, details?: unknown, origin?: string) => log('debug', message, details, origin),
  info: (message: string, details?: unknown, origin?: string) => log('info', message, details, origin),
  warn: (message: string, details?: unknown, origin?: string) => log('warn', message, details, origin),
  error: (message: string, details?: unknown, origin?: string) => log('error', message, details, origin),
};
