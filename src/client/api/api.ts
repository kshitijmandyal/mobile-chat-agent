import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { ApiErrorDto } from '@/shared/contract';
import { API_BASE_URL } from './endpoints';

/** The one base every endpoint injects into. Nothing else builds a URL. */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: () => ({}),
});

/** Narrows an RTK Query error to the API's error body. */
export function isApiError(error: unknown): error is { status: number; data: ApiErrorDto } {
  if (typeof error !== 'object' || error === null || !('data' in error)) return false;
  const data = (error as { data: unknown }).data;
  return typeof data === 'object' && data !== null && 'code' in data && 'message' in data;
}

export function errorMessage(error: unknown, fallback: string): string {
  return isApiError(error) ? error.data.message : fallback;
}
