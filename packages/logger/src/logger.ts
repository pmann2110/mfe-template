import type { LogLevel, LogContext, LogEntry } from './types';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  if (typeof process !== 'undefined' && process.env?.LOG_LEVEL) {
    const v = String(process.env.LOG_LEVEL).toLowerCase();
    if (v === 'debug' || v === 'info' || v === 'warn' || v === 'error') return v;
  }
  const viteEnv = typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_LOG_LEVEL;
  if (viteEnv) {
    const v = String((import.meta as unknown as { env: Record<string, string> }).env.VITE_LOG_LEVEL).toLowerCase();
    if (v === 'debug' || v === 'info' || v === 'warn' || v === 'error') return v;
  }
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'info' : 'debug';
}

let minLevel: LogLevel | null = null;

function shouldLog(level: LogLevel): boolean {
  if (minLevel === null) minLevel = getMinLevel();
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function formatEntry(entry: LogEntry): string {
  const parts = [entry.timestamp, `[${entry.level.toUpperCase()}]`, entry.message];
  if (entry.context && Object.keys(entry.context).length > 0) {
    parts.push(JSON.stringify(entry.context));
  }
  if (entry.error !== undefined) {
    parts.push(entry.error instanceof Error ? entry.error.message : String(entry.error));
  }
  return parts.join(' ');
}

function createEntry(level: LogLevel, message: string, context?: LogContext, error?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
    ...(error !== undefined ? { error } : {}),
  };
}

function log(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
  if (!shouldLog(level)) return;
  const entry = createEntry(level, message, context, error);
  const line = formatEntry(entry);
  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console -- intentional logger output
      console.debug(line);
      break;
    case 'info':
      // eslint-disable-next-line no-console -- intentional logger output
      console.info(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    case 'error':
      console.error(line, error !== undefined ? error : '');
      break;
  }
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext, error?: unknown): void;
  error(message: string, context?: LogContext, error?: unknown): void;
  child(context: LogContext): Logger;
}

export function createLogger(baseContext?: LogContext): Logger {
  const merge = (ctx?: LogContext) =>
    baseContext && ctx ? { ...baseContext, ...ctx } : baseContext ?? ctx;

  return {
    debug: (message, ctx) => log('debug', message, merge(ctx)),
    info: (message, ctx) => log('info', message, merge(ctx)),
    warn: (message, ctx, err) => log('warn', message, merge(ctx), err),
    error: (message, ctx, err) => log('error', message, merge(ctx), err),
    child: (ctx) => createLogger(merge(ctx)),
  };
}

export const logger = createLogger();

export function createLoggerWithContext(context: LogContext): Logger {
  return createLogger(context);
}
