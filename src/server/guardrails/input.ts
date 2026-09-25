import { InvalidRequestError } from '../domain/errors';
import { MESSAGE_MAX_CHARS } from '@/shared/contract';

/**
 * A shopper's message. Branded so it can't be passed where a trusted string is
 * expected, and so the only way into a prompt is through `delimit`.
 */
export interface UntrustedText {
  readonly kind: 'untrusted';
  readonly value: string;
}

// Control, zero-width and bidi-override characters: invisible in the UI, still read
// by the model. Built from code points so the source file holds no invisible bytes.
const INVISIBLE_RANGES: ReadonlyArray<[number, number]> = [
  [0x00, 0x08], [0x0b, 0x0c], [0x0e, 0x1f], [0x7f, 0x7f],
  [0x200b, 0x200f], [0x2028, 0x202e], [0x2060, 0x2064], [0xfeff, 0xfeff],
];
const INVISIBLE_CHARS = new RegExp(
  `[${INVISIBLE_RANGES.map(([from, to]) => `\\u{${from.toString(16)}}-\\u{${to.toString(16)}}`).join('')}]`,
  'gu',
);

export function acceptMessage(raw: string): UntrustedText {
  const value = raw.normalize('NFKC').replace(INVISIBLE_CHARS, '').replace(/\s+/g, ' ').trim();
  if (!value) throw new InvalidRequestError('Message is empty.');
  if (value.length > MESSAGE_MAX_CHARS) {
    throw new InvalidRequestError(`Message is longer than ${MESSAGE_MAX_CHARS} characters.`);
  }
  return Object.freeze({ kind: 'untrusted', value });
}

/**
 * Wraps untrusted text in a tag the system prompt names as data. Escaping means
 * the text can't close the tag early and start writing instructions after it.
 */
export function delimit(tag: string, text: UntrustedText): string {
  const escaped = text.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<${tag}>${escaped}</${tag}>`;
}
