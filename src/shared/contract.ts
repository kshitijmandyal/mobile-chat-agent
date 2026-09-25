/**
 * The HTTP contract between the chat UI and /api/chat. The only module both
 * sides import, so a change here is a change to the API.
 */

export const MESSAGE_MAX_CHARS = 500;

export type ChatMode = 'recommend' | 'compare';

export interface ChatRequestDto {
  message: string;
}

export interface PhoneDto {
  id: string;
  name: string;
  brand: string;
  os: string;
  launchYear: number;
  priceMinInr: number;
  priceMaxInr: number;
  storageOptions: string[];
  ramOptions: string[];
  processor: string | null;
  backCamera: string | null;
  frontCameraMp: number | null;
  batteryMah: number | null;
  screenInches: number | null;
  weightGrams: number | null;
  /** Labels such as "Biggest battery", set only when phones are compared. */
  highlights: string[];
}

export interface ChatResponseDto {
  reply: string;
  mode: ChatMode;
  phones: PhoneDto[];
}

export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'LLM_UNAVAILABLE'
  | 'CATALOG_UNAVAILABLE'
  | 'INTERNAL';

export interface ApiErrorDto {
  code: ApiErrorCode;
  message: string;
}
