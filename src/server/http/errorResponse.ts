import { NextResponse } from 'next/server';

import type { ApiErrorCode, ApiErrorDto } from '@/shared/contract';
import { AppError } from '../domain/errors';
import { logger } from '../logging';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  INVALID_REQUEST: 400,
  LLM_UNAVAILABLE: 503,
  CATALOG_UNAVAILABLE: 503,
  INTERNAL: 500,
};

/** The single mapping from an error to what the client sees. */
export function errorResponse(error: unknown): NextResponse<ApiErrorDto> {
  if (error instanceof AppError) {
    const status = STATUS_BY_CODE[error.code];
    if (status >= 500) logger.error('request_failed', { code: error.code, cause: causeName(error.cause) });
    return NextResponse.json({ code: error.code, message: error.message }, { status });
  }
  logger.error('request_failed', { code: 'INTERNAL', cause: causeName(error) });
  return NextResponse.json({ code: 'INTERNAL', message: 'Something went wrong.' }, { status: 500 });
}

/** The class of the error only. Messages from the SDK can carry request details. */
function causeName(cause: unknown): string {
  return cause instanceof Error ? cause.name : typeof cause;
}
