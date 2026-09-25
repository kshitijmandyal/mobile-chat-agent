export const CLAUDE_MODEL = 'claude-sonnet-5';

/** Both calls are short and well specified; more thinking buys latency, not quality. */
export const CLAUDE_EFFORT = 'low';

export const EXTRACT_MAX_TOKENS = 4_000;
export const REPLY_MAX_TOKENS = 4_000;

/** A chat turn that takes longer than this is worse than an error. */
export const CLAUDE_TIMEOUT_MS = 25_000;
export const CLAUDE_MAX_RETRIES = 1;
