import { REPLY_MAX_CHARS } from '../constants/limits';
import type { Phone } from '../domain/phone';
import type { DraftReply } from '../interfaces';

export type RejectionReason = 'uncited_phone' | 'unshown_phone_named' | 'too_long' | 'empty';

export type Verdict = { readonly ok: true; readonly text: string } | { readonly ok: false; readonly reason: RejectionReason };

/**
 * Checks a drafted reply against the phones actually shown. The system prompt
 * asks the model to stay on the list; this is what holds if it doesn't. A reply
 * that fails is thrown away whole, not patched.
 */
export function verifyReply(draft: DraftReply, shown: readonly Phone[], catalog: readonly Phone[]): Verdict {
  const text = toPlainText(draft.text);
  if (!text) return { ok: false, reason: 'empty' };
  if (text.length > REPLY_MAX_CHARS) return { ok: false, reason: 'too_long' };

  const shownIds = new Set(shown.map((p) => p.id));
  if (draft.citedPhoneIds.some((id) => !shownIds.has(id))) return { ok: false, reason: 'uncited_phone' };

  if (namesUnshownPhone(text, shown, catalog)) return { ok: false, reason: 'unshown_phone_named' };

  return { ok: true, text };
}

/** The UI renders plain text. Markdown and links would show up as literal noise. */
function toPlainText(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\*\*|__|`|^#+\s*/gm, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Blanks out every shown phone's name, longest first, then looks for any other
 * catalog name in what's left. Blanking first stops "iPhone 16 Pro" (shown)
 * from counting as a mention of "iPhone 16" (not shown).
 */
function namesUnshownPhone(text: string, shown: readonly Phone[], catalog: readonly Phone[]): boolean {
  let remaining = normalise(text);
  const shownNames = shown.flatMap((p) => [p.name, p.model]).map(normalise).sort((a, b) => b.length - a.length);
  for (const name of shownNames) {
    // Two spaces back for each match, so a second mention right after keeps its leading boundary.
    while (remaining.includes(name)) remaining = remaining.replace(name, '  ');
  }

  const shownIds = new Set(shown.map((p) => p.id));
  const shownNameSet = new Set(shownNames);
  return catalog.some((phone) => {
    if (shownIds.has(phone.id) || !isDistinctive(phone.model)) return false;
    // Checked by model as well as full name: prose says "Galaxy S23", not "Samsung Galaxy S23".
    return [phone.name, phone.model]
      .map(normalise)
      // Same name, different launch year: the shown phone already covers the mention.
      .filter((name) => !shownNameSet.has(name))
      .some((name) => remaining.includes(name));
  });
}

/** Padded with spaces so a substring check only ever matches whole words. */
function normalise(value: string): string {
  return ` ${value.toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim()} `;
}

/** Names like "Pad" or "C63" alone are too short to be sure the text means a phone. */
function isDistinctive(model: string): boolean {
  return model.trim().length >= 4 && /\d/.test(model);
}
