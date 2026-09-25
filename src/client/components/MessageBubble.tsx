import type { ChatMessage } from '../types/chat';
import styles from './MessageBubble.module.scss';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const variant = message.role === 'user' ? styles.user : message.failed ? styles.failed : styles.assistant;
  return (
    <p className={`${styles.bubble} ${variant}`} role={message.failed ? 'alert' : undefined}>
      {message.text}
    </p>
  );
}
