import type { ChatMode } from '@/shared/contract';
import { DATASET_NOTE, NO_MATCH_REPLY, OFF_TOPIC_REPLY } from '../constants/replies';
import { describeCatalog, type Phone } from '../domain/phone';
import { searchPhones } from '../domain/search';
import { createSearchCriteria } from '../domain/searchCriteria';
import { acceptMessage } from '../guardrails/input';
import { verifyReply } from '../guardrails/output';
import type { IntentExtractor, Logger, PhoneCatalog, ReplyWriter } from '../interfaces';

export interface ChatAnswer {
  readonly reply: string;
  readonly mode: ChatMode;
  readonly phones: readonly Phone[];
  readonly highlights: ReadonlyMap<string, readonly string[]>;
}

export interface ChatServiceDeps {
  readonly catalog: PhoneCatalog;
  readonly extractor: IntentExtractor;
  readonly writer: ReplyWriter;
  readonly logger: Logger;
}

const NO_HIGHLIGHTS: ReadonlyMap<string, readonly string[]> = new Map();

/**
 * One chat turn: read what the shopper wants, search in code, have the model
 * explain the result, then check the explanation before anyone sees it.
 *
 * The model is used twice and trusted zero times. What it extracts is clamped to
 * the catalog; what it writes is verified against the phones actually found.
 */
export class ChatService {
  constructor(private readonly deps: ChatServiceDeps) {}

  async answer(rawMessage: string): Promise<ChatAnswer> {
    const { catalog, extractor, writer, logger } = this.deps;
    const message = acceptMessage(rawMessage);

    const phones = await catalog.all();
    const facts = describeCatalog(phones);

    const intent = await extractor.extract(message, facts);
    if (!intent.onTopic) {
      logger.info('chat_turn', { outcome: 'off_topic' });
      return { reply: OFF_TOPIC_REPLY, mode: 'recommend', phones: [], highlights: NO_HIGHLIGHTS };
    }

    const criteria = createSearchCriteria(intent.criteria, facts);
    const result = searchPhones(phones, criteria);
    if (result.phones.length === 0) {
      logger.info('chat_turn', { outcome: 'no_match', mode: criteria.mode });
      return { reply: NO_MATCH_REPLY, mode: criteria.mode, phones: [], highlights: NO_HIGHLIGHTS };
    }

    const draft = await writer.write({
      message,
      mode: criteria.mode,
      phones: result.phones,
      highlights: result.highlights,
      unmatchedModels: result.unmatchedModels,
    });

    const verdict = verifyReply(draft, result.phones, phones);
    if (!verdict.ok) logger.warn('reply_rejected', { reason: verdict.reason });
    logger.info('chat_turn', {
      outcome: verdict.ok ? 'answered' : 'answered_with_fallback',
      mode: criteria.mode,
      shown: result.phones.length,
    });

    return {
      reply: verdict.ok ? verdict.text : fallbackReply(result.phones, criteria.mode),
      mode: criteria.mode,
      phones: result.phones,
      highlights: result.highlights,
    };
  }
}

/** Used when a drafted reply fails verification. Says only what search already knows. */
function fallbackReply(phones: readonly Phone[], mode: ChatMode): string {
  const names = phones.map((p) => p.name);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
  const lead = mode === 'compare' ? `Here's how the ${list} compare.` : `Here are some options that fit: ${list}.`;
  return `${lead} ${DATASET_NOTE}`;
}
