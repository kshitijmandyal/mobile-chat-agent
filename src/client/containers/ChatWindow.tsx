'use client';

import { ChatHeader } from '../components/ChatHeader';
import { Composer } from '../components/Composer';
import { MessageList } from '../components/MessageList';
import { SuggestionChips } from '../components/SuggestionChips';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useChat } from '../hooks/useChat';
import styles from './ChatWindow.module.scss';

export function ChatWindow() {
  const { messages, send, isSending } = useChat();
  const endRef = useAutoScroll<HTMLDivElement>(`${messages.length}:${isSending}`);

  return (
    <main className={styles.window}>
      <ChatHeader />
      <MessageList messages={messages} isTyping={isSending} endRef={endRef} />
      <footer className={styles.footer}>
        <Composer onSend={send} disabled={isSending} />
        <SuggestionChips onPick={send} disabled={isSending} />
      </footer>
    </main>
  );
}
