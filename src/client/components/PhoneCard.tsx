import Chip from '@mui/material/Chip';

import type { PhoneDto } from '@/shared/contract';
import { formatPriceRange, specRows } from '../helpers/format';
import { SpecTile } from './SpecTile';
import styles from './PhoneCard.module.scss';

export function PhoneCard({ phone }: { phone: PhoneDto }) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.name}>{phone.name}</h3>
        <div className={styles.meta}>
          <span className={styles.price}>{formatPriceRange(phone.priceMinInr, phone.priceMaxInr)}</span>
          <Chip size="small" label={phone.os} className={styles.chip} />
          <Chip size="small" label={phone.launchYear} className={styles.chip} />
        </div>
      </header>

      {phone.highlights.length > 0 && (
        <ul className={styles.highlights} aria-label="Leads the comparison on">
          {phone.highlights.map((label) => (
            <li key={label}>
              <Chip size="small" color="primary" label={label} />
            </li>
          ))}
        </ul>
      )}

      <div className={styles.specs}>
        {specRows(phone).map((spec) => (
          <SpecTile key={spec.key} spec={spec} />
        ))}
      </div>
    </article>
  );
}
