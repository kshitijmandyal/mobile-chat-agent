import Anthropic from '@anthropic-ai/sdk';

import { ClaudeIntentExtractor } from './adapters/claudeIntentExtractor';
import { ClaudeReplyWriter } from './adapters/claudeReplyWriter';
import { CsvPhoneCatalog } from './adapters/csvPhoneCatalog';
import { CATALOG_FILE } from './constants/catalog';
import { LlmUnavailableError } from './domain/errors';
import { CLAUDE_MAX_RETRIES, CLAUDE_TIMEOUT_MS } from './constants/llm';
import { logger } from './logging';
import { ChatService } from './services/chatService';

/**
 * The one place that decides which adapter satisfies which interface.
 *
 * Built on first request, not at import: a missing API key should fail one chat
 * turn with a clear error, not take the whole route down at cold start.
 */
let chatService: ChatService | null = null;

export function getChatService(): ChatService {
  if (chatService) return chatService;

  let client: Anthropic;
  try {
    client = new Anthropic({ timeout: CLAUDE_TIMEOUT_MS, maxRetries: CLAUDE_MAX_RETRIES });
  } catch (cause) {
    // The SDK throws here when it finds no credentials at all.
    throw new LlmUnavailableError('The assistant is not configured.', { cause });
  }

  chatService = new ChatService({
    catalog: new CsvPhoneCatalog(CATALOG_FILE, logger),
    extractor: new ClaudeIntentExtractor(client),
    writer: new ClaudeReplyWriter(client),
    logger,
  });
  return chatService;
}
