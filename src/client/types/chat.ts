import type { ChatMode, PhoneDto } from '@/shared/contract';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  mode: ChatMode;
  phones: PhoneDto[];
  /** An assistant message standing in for a reply that never came. */
  failed: boolean;
}
