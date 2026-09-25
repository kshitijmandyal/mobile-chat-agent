import type { PhoneDto } from '@/shared/contract';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatPriceRange(min: number, max: number): string {
  return min === max ? inr.format(min) : `${inr.format(min)} – ${inr.format(max)}`;
}

export type SpecKey = 'camera' | 'battery' | 'storage' | 'display' | 'processor' | 'weight';

export interface SpecRow {
  key: SpecKey;
  label: string;
  value: string;
}

/** The spec tiles a card shows, in order. Missing values say so rather than vanish. */
export function specRows(phone: PhoneDto): SpecRow[] {
  const unknown = 'Not listed';
  const storage = phone.storageOptions.join(' · ');
  const ram = phone.ramOptions.length > 0 ? `${phone.ramOptions.join(' / ')} RAM` : '';
  const memory = storage && ram ? `${storage} (${ram})` : storage || ram || unknown;
  return [
    { key: 'camera', label: 'Camera', value: phone.backCamera ?? unknown },
    { key: 'battery', label: 'Battery', value: phone.batteryMah ? `${phone.batteryMah.toLocaleString('en-IN')} mAh` : unknown },
    { key: 'storage', label: 'Memory', value: memory },
    { key: 'display', label: 'Display', value: phone.screenInches ? `${phone.screenInches}″` : unknown },
    { key: 'processor', label: 'Processor', value: phone.processor ?? unknown },
    { key: 'weight', label: 'Weight', value: phone.weightGrams ? `${phone.weightGrams} g` : unknown },
  ];
}
