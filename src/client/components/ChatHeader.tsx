import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';

import styles from './ChatHeader.module.scss';

export function ChatHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.badge} aria-hidden>
        <SmartphoneRoundedIcon />
      </span>
      <div>
        <h1 className={styles.title}>Mobile Chat Assistant</h1>
        <p className={styles.subtitle}>Tell me what you need and I’ll find phones that fit</p>
      </div>
    </header>
  );
}
