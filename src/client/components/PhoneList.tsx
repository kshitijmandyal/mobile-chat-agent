import type { ChatMode, PhoneDto } from '@/shared/contract';
import { PhoneCard } from './PhoneCard';
import styles from './PhoneList.module.scss';

interface PhoneListProps {
  phones: PhoneDto[];
  mode: ChatMode;
}

export function PhoneList({ phones, mode }: PhoneListProps) {
  return (
    <section className={mode === 'compare' ? styles.compare : styles.grid} aria-label="Phones">
      {phones.map((phone) => (
        <PhoneCard key={phone.id} phone={phone} />
      ))}
    </section>
  );
}
