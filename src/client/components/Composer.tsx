import IconButton from '@mui/material/IconButton';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useState, type FormEvent } from 'react';

import { MESSAGE_MAX_CHARS } from '@/shared/contract';
import styles from './Composer.module.scss';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function Composer({ onSend, disabled }: ComposerProps) {
  const [draft, setDraft] = useState('');
  const canSend = !disabled && draft.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="chat-input" className="visually-hidden">
        Ask about phones
      </label>
      <input
        id="chat-input"
        className={styles.input}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Ask about phones…"
        maxLength={MESSAGE_MAX_CHARS}
        autoComplete="off"
        enterKeyHint="send"
      />
      <IconButton type="submit" aria-label="Send" disabled={!canSend} className={styles.send}>
        <SendRoundedIcon />
      </IconButton>
    </form>
  );
}
