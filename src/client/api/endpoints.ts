/**
 * Every path the app calls, in one place. The API is served by the same Next app,
 * so the base is relative: there is no host to configure and nothing to rebuild.
 */
export const API_BASE_URL = '/api';

export const ENDPOINTS = {
  chat: '/chat',
} as const;
