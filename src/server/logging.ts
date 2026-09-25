import type { LogFields, Logger } from './interfaces';

/**
 * Keys that must never reach a log line, whatever a caller passes. Redaction is
 * a filter here rather than something each call site has to remember.
 */
const REDACTED_KEYS = /message|query|text|reply|prompt|content|email|name|id$|ids$|key|token|secret/i;
const MAX_VALUE_CHARS = 80;

function redact(fields: LogFields | undefined): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (REDACTED_KEYS.test(key)) {
      safe[key] = '[redacted]';
    } else {
      safe[key] = typeof value === 'string' ? value.slice(0, MAX_VALUE_CHARS) : value;
    }
  }
  return safe;
}

type Level = 'info' | 'warn' | 'error';

function write(level: Level, event: string, fields?: LogFields): void {
  const line = JSON.stringify({ level, event, ...redact(fields) });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export const logger: Logger = {
  info: (event, fields) => write('info', event, fields),
  warn: (event, fields) => write('warn', event, fields),
  error: (event, fields) => write('error', event, fields),
};
