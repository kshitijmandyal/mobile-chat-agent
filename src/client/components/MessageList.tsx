import type { ChatMessage } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { PhoneList } from './PhoneList';
import { TypingIndicator } from './TypingIndicator';
import styles from './MessageList.module.scss';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  endRef: React.Ref<HTMLDivElement>;
}

export function MessageList({ messages, isTyping, endRef }: MessageListProps) {
  return (
    <div className={styles.list} role="log" aria-live="polite" aria-label="Conversation">
      {messages.map((message) => (
        <div key={message.id} className={styles.turn}>
          <MessageBubble message={message} />
          {message.phones.length > 0 && <PhoneList phones={message.phones} mode={message.mode} />}
        </div>
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
