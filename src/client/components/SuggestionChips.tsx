import Chip from '@mui/material/Chip';

import { SUGGESTIONS } from '../constants/chat';
import styles from './SuggestionChips.module.scss';

interface SuggestionChipsProps {
  onPick: (text: string) => void;
  disabled: boolean;
}

export function SuggestionChips({ onPick, disabled }: SuggestionChipsProps) {
  return (
    <ul className={styles.list} aria-label="Suggestions">
      {SUGGESTIONS.map((text) => (
        <li key={text}>
          <Chip label={text} onClick={() => onPick(text)} disabled={disabled} className={styles.chip} />
        </li>
      ))}
    </ul>
  );
}
