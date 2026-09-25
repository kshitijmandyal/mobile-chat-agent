import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import type { ChatResponseDto } from '@/shared/contract';
import { WELCOME_TEXT } from '../constants/chat';
import type { ChatMessage } from '../types/chat';

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: [{ id: 'welcome', role: 'assistant', text: WELCOME_TEXT, mode: 'recommend', phones: [], failed: false }],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    userMessageSent: {
      reducer(state, action: PayloadAction<ChatMessage>) {
        state.messages.push(action.payload);
      },
      prepare: (text: string) => ({
        payload: { id: nanoid(), role: 'user', text, mode: 'recommend', phones: [], failed: false } satisfies ChatMessage,
      }),
    },
    assistantReplied: {
      reducer(state, action: PayloadAction<ChatMessage>) {
        state.messages.push(action.payload);
      },
      prepare: (response: ChatResponseDto) => ({
        payload: {
          id: nanoid(),
          role: 'assistant',
          text: response.reply,
          mode: response.mode,
          phones: response.phones,
          failed: false,
        } satisfies ChatMessage,
      }),
    },
    replyFailed: {
      reducer(state, action: PayloadAction<ChatMessage>) {
        state.messages.push(action.payload);
      },
      prepare: (text: string) => ({
        payload: { id: nanoid(), role: 'assistant', text, mode: 'recommend', phones: [], failed: true } satisfies ChatMessage,
      }),
    },
  },
});

export const { userMessageSent, assistantReplied, replyFailed } = chatSlice.actions;
export default chatSlice.reducer;
