import styles from './TypingIndicator.module.scss';

export function TypingIndicator() {
  return (
    <div className={styles.bubble} role="status">
      <span className="visually-hidden">Assistant is typing</span>
      <span className={styles.dot} aria-hidden />
      <span className={styles.dot} aria-hidden />
      <span className={styles.dot} aria-hidden />
    </div>
  );
}
