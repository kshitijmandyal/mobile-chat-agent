import type { ClaudeIntent, ClaudeReply } from '../adapters/schemas';
import type { DraftReply, ExtractedIntent } from '../interfaces';

export function toExtractedIntent(intent: ClaudeIntent): ExtractedIntent {
  if (!intent.on_topic) return { onTopic: false };
  return {
    onTopic: true,
    criteria: {
      mode: intent.mode,
      maxPriceInr: intent.max_price_inr,
      minPriceInr: intent.min_price_inr,
      includeBrands: intent.include_brands,
      excludeBrands: intent.exclude_brands,
      os: intent.os,
      deviceType: intent.device_type,
      launchYear: intent.launch_year,
      sortBy: intent.sort_by,
      compareModels: intent.compare_models,
    },
  };
}

export function toDraftReply(reply: ClaudeReply): DraftReply {
  return { text: reply.reply, citedPhoneIds: reply.cited_phone_ids };
}
