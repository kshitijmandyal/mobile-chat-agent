import { z } from 'zod';

import { DEVICE_TYPES, OPERATING_SYSTEMS } from '../domain/phone';
import { SORT_KEYS } from '../domain/searchCriteria';

/**
 * The shapes Claude is constrained to return. Ranges aren't encoded here: the
 * domain clamps every value anyway, and a schema can't be the last line of defence.
 */

export const IntentSchema = z.object({
  on_topic: z.boolean(),
  mode: z.enum(['recommend', 'compare']),
  max_price_inr: z.number().nullable(),
  min_price_inr: z.number().nullable(),
  include_brands: z.array(z.string()),
  exclude_brands: z.array(z.string()),
  os: z.enum(OPERATING_SYSTEMS).nullable(),
  device_type: z.enum([...DEVICE_TYPES, 'any']),
  launch_year: z.number().nullable(),
  sort_by: z.enum(SORT_KEYS),
  compare_models: z.array(z.string()),
});
export type ClaudeIntent = z.infer<typeof IntentSchema>;

export const ReplySchema = z.object({
  reply: z.string(),
  cited_phone_ids: z.array(z.string()),
});
export type ClaudeReply = z.infer<typeof ReplySchema>;
