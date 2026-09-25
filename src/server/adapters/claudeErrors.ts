import Anthropic from '@anthropic-ai/sdk';

import { LlmUnavailableError } from '../domain/errors';

/**
 * Turns an SDK failure into the app's own error. The message stays generic on
 * purpose: it reaches the browser, and the SDK's can mention keys and quotas.
 */
export function toLlmError(error: unknown): LlmUnavailableError {
  if (error instanceof LlmUnavailableError) return error;
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new LlmUnavailableError('The assistant is not configured.', { cause: error });
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new LlmUnavailableError('The assistant is busy. Try again in a moment.', { cause: error });
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError || error instanceof Anthropic.APIConnectionError) {
    return new LlmUnavailableError('The assistant took too long to respond.', { cause: error });
  }
  return new LlmUnavailableError('The assistant is unavailable right now.', { cause: error });
}

/** A turn that stopped for any reason other than finishing has no usable output. */
export function assertFinished(stopReason: string | null): void {
  if (stopReason === 'refusal') throw new LlmUnavailableError('The assistant declined that request.');
  if (stopReason !== 'end_turn') throw new LlmUnavailableError('The assistant returned an incomplete answer.');
}
