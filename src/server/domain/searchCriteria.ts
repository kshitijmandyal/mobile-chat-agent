import { BRAND_ALIASES } from '../constants/catalog';
import { BUDGET_CEILING_INR, BUDGET_FLOOR_INR } from '../constants/limits';
import type { ChatMode } from '@/shared/contract';
import { DEVICE_TYPES, OPERATING_SYSTEMS, type CatalogFacts, type DeviceType, type OperatingSystem } from './phone';

export const SORT_KEYS = ['newest', 'camera', 'battery', 'lightest', 'price_low', 'price_high', 'screen'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

/**
 * What the extractor hands back. Nothing here is trusted: it came from a model
 * reading a stranger's message.
 */
export interface RawCriteria {
  readonly mode: ChatMode;
  readonly maxPriceInr: number | null;
  readonly minPriceInr: number | null;
  readonly includeBrands: readonly string[];
  readonly excludeBrands: readonly string[];
  readonly os: string | null;
  readonly deviceType: string;
  readonly launchYear: number | null;
  readonly sortBy: string;
  readonly compareModels: readonly string[];
}

export interface SearchCriteria {
  readonly mode: ChatMode;
  readonly maxPriceInr: number | null;
  readonly minPriceInr: number | null;
  readonly includeBrands: readonly string[];
  readonly excludeBrands: readonly string[];
  readonly os: OperatingSystem | null;
  readonly deviceType: DeviceType | 'any';
  readonly launchYear: number | null;
  readonly sortBy: SortKey;
  readonly compareModels: readonly string[];
}

const DEVICE_FILTERS: readonly string[] = [...DEVICE_TYPES, 'any'];
const MAX_COMPARE_NAMES = 3;
const MAX_MODEL_NAME_CHARS = 60;

/**
 * Clamps raw criteria to what the catalog can actually answer. This is the input
 * guardrail that holds whatever the model says: a brand not in the catalog is
 * dropped, a budget of ₹3 or ₹30 crore is dropped, an unknown sort key falls back
 * to newest.
 */
export function createSearchCriteria(raw: RawCriteria, facts: CatalogFacts): SearchCriteria {
  let maxPriceInr = clampBudget(raw.maxPriceInr);
  let minPriceInr = clampBudget(raw.minPriceInr);
  if (maxPriceInr !== null && minPriceInr !== null && minPriceInr > maxPriceInr) {
    [minPriceInr, maxPriceInr] = [maxPriceInr, minPriceInr];
  }

  const includeBrands = resolveBrands(raw.includeBrands, facts.brands);
  const excludeBrands = resolveBrands(raw.excludeBrands, facts.brands).filter((b) => !includeBrands.includes(b));

  const launchYear =
    raw.launchYear !== null && raw.launchYear >= facts.earliestYear && raw.launchYear <= facts.latestYear
      ? raw.launchYear
      : null;

  const compareModels = raw.compareModels
    .map((name) => name.trim().slice(0, MAX_MODEL_NAME_CHARS))
    .filter(Boolean)
    .slice(0, MAX_COMPARE_NAMES);

  return Object.freeze({
    mode: raw.mode === 'compare' && compareModels.length >= 2 ? 'compare' : 'recommend',
    maxPriceInr,
    minPriceInr,
    includeBrands: Object.freeze(includeBrands),
    excludeBrands: Object.freeze(excludeBrands),
    os: (OPERATING_SYSTEMS as readonly string[]).includes(raw.os ?? '') ? (raw.os as OperatingSystem) : null,
    // A shopper who doesn't mention tablets wants phones.
    deviceType: DEVICE_FILTERS.includes(raw.deviceType) ? (raw.deviceType as DeviceType | 'any') : 'phone',
    launchYear,
    sortBy: (SORT_KEYS as readonly string[]).includes(raw.sortBy) ? (raw.sortBy as SortKey) : 'newest',
    compareModels: Object.freeze(compareModels),
  });
}

function clampBudget(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= BUDGET_FLOOR_INR && rounded <= BUDGET_CEILING_INR ? rounded : null;
}

function resolveBrands(requested: readonly string[], known: readonly string[]): string[] {
  const byLowercase = new Map(known.map((b) => [b.toLowerCase(), b]));
  const resolved = requested
    .map((name) => {
      const key = name.trim().toLowerCase();
      return byLowercase.get(key) ?? byLowercase.get((BRAND_ALIASES[key] ?? '').toLowerCase());
    })
    .filter((b): b is string => b !== undefined);
  return [...new Set(resolved)];
}
