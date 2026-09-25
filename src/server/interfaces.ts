import type { ChatMode } from '@/shared/contract';
import type { UntrustedText } from './guardrails/input';
import type { CatalogFacts, Phone } from './domain/phone';
import type { RawCriteria } from './domain/searchCriteria';

/**
 * The seams the chat service depends on. Services see only these, never an SDK or
 * a file, so every one can be swapped for a fake in a plain script.
 */

export interface PhoneCatalog {
  all(): Promise<readonly Phone[]>;
}

export type ExtractedIntent = { readonly onTopic: false } | { readonly onTopic: true; readonly criteria: RawCriteria };

export interface IntentExtractor {
  extract(message: UntrustedText, facts: CatalogFacts): Promise<ExtractedIntent>;
}

export interface ReplyRequest {
  readonly message: UntrustedText;
  readonly mode: ChatMode;
  readonly phones: readonly Phone[];
  readonly highlights: ReadonlyMap<string, readonly string[]>;
  readonly unmatchedModels: readonly string[];
}

export interface DraftReply {
  readonly text: string;
  readonly citedPhoneIds: readonly string[];
}

export interface ReplyWriter {
  write(request: ReplyRequest): Promise<DraftReply>;
}

/** Fields are counts, codes and flags. Never message text, never identifiers. */
export type LogFields = Readonly<Record<string, string | number | boolean>>;

export interface Logger {
  info(event: string, fields?: LogFields): void;
  warn(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
}
