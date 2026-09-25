import { useCallback } from 'react';

import { errorMessage } from '../api/api';
import { useSendMessageMutation } from '../api/chatApi';
import { SEND_FAILED_TEXT } from '../constants/chat';
import { assistantReplied, replyFailed, userMessageSent } from '../store/chatSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

/** The conversation and the one action that moves it forward. */
export function useChat() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.chat.messages);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || isSending) return;

      dispatch(userMessageSent(message));
      try {
        dispatch(assistantReplied(await sendMessage({ message }).unwrap()));
      } catch (error) {
        // Every failure becomes a message in the thread, never an unhandled rejection.
        dispatch(replyFailed(errorMessage(error, SEND_FAILED_TEXT)));
      }
    },
    [dispatch, isSending, sendMessage],
  );

  return { messages, send, isSending };
}
