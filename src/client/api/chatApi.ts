import type { ChatRequestDto, ChatResponseDto } from '@/shared/contract';
import { api } from './api';
import { ENDPOINTS } from './endpoints';

export const chatApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendMessage: build.mutation<ChatResponseDto, ChatRequestDto>({
      query: (body) => ({ url: ENDPOINTS.chat, method: 'POST', body }),
    }),
  }),
});

export const { useSendMessageMutation } = chatApi;
