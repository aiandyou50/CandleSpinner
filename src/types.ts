export type PingAttempt = { attempt?: number; ok?: boolean; status?: number; body?: any; error?: string; kind?: string };
export type PingResult = { kind: string; attempts: PingAttempt[] } | null;
