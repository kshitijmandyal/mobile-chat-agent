import type { ApiErrorCode } from '@/shared/contract';

/**
 * Every failure the app expects carries a stable code. The HTTP layer maps codes
 * to status codes in one place; nothing else decides what a client sees.
 */
export class AppError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class InvalidRequestError extends AppError {
  constructor(message: string) {
    super('INVALID_REQUEST', message);
  }
}

export class LlmUnavailableError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super('LLM_UNAVAILABLE', message, options);
  }
}

export class CatalogUnavailableError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super('CATALOG_UNAVAILABLE', message, options);
  }
}

/** A catalog row that can't become a Phone. Caught by the mapper, which skips the row. */
export class InvalidPhoneError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'InvalidPhoneError';
  }
}
