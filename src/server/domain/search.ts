import { MAX_COMPARED, MAX_RESULTS } from '../constants/limits';
import type { Phone } from './phone';
import type { SearchCriteria, SortKey } from './searchCriteria';

export interface SearchResult {
  readonly phones: readonly Phone[];
  /** Phone id -> what it leads on. Only filled when comparing. */
  readonly highlights: ReadonlyMap<string, readonly string[]>;
  /** Names the shopper asked to compare that matched nothing in the catalog. */
  readonly unmatchedModels: readonly string[];
}

/**
 * Pure and deterministic: the same catalog and criteria always give the same
 * phones. Every card the shopper sees comes from here, never from the model.
 */
export function searchPhones(catalog: readonly Phone[], criteria: SearchCriteria): SearchResult {
  if (criteria.mode === 'compare') return compare(catalog, criteria.compareModels);

  const matches = catalog.filter((phone) => matchesFilters(phone, criteria)).sort(COMPARATORS[criteria.sortBy]);
  // One brand asked for by name means the shopper wants that brand's best, not variety.
  const phones =
    criteria.includeBrands.length === 1 ? matches.slice(0, MAX_RESULTS) : diversifyByBrand(matches, MAX_RESULTS);

  return { phones, highlights: new Map(), unmatchedModels: [] };
}

function matchesFilters(phone: Phone, c: SearchCriteria): boolean {
  // A phone fits a budget if its cheapest variant does.
  if (c.maxPriceInr !== null && phone.priceMinInr > c.maxPriceInr) return false;
  if (c.minPriceInr !== null && phone.priceMaxInr < c.minPriceInr) return false;
  if (c.includeBrands.length > 0 && !c.includeBrands.includes(phone.brand)) return false;
  if (c.excludeBrands.includes(phone.brand)) return false;
  if (c.os !== null && phone.os !== c.os) return false;
  if (c.deviceType !== 'any' && phone.deviceType !== c.deviceType) return false;
  if (c.launchYear !== null && phone.launchYear !== c.launchYear) return false;
  return true;
}

type Comparator = (a: Phone, b: Phone) => number;

/** Missing values sort last whichever way the metric runs. */
function by(metric: (p: Phone) => number | null, direction: 'asc' | 'desc'): Comparator {
  return (a, b) => {
    const va = metric(a);
    const vb = metric(b);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return direction === 'asc' ? va - vb : vb - va;
  };
}

function thenBy(...comparators: Comparator[]): Comparator {
  return (a, b) => {
    for (const compareFn of comparators) {
      const result = compareFn(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

const newestFirst = by((p) => p.launchYear, 'desc');

const COMPARATORS: Record<SortKey, Comparator> = {
  newest: thenBy(newestFirst, by((p) => p.priceMinInr, 'desc')),
  camera: thenBy(by((p) => p.primaryCameraMp, 'desc'), newestFirst),
  battery: thenBy(by((p) => p.batteryMah, 'desc'), newestFirst),
  lightest: thenBy(by((p) => p.weightGrams, 'asc'), newestFirst),
  price_low: thenBy(by((p) => p.priceMinInr, 'asc'), newestFirst),
  price_high: thenBy(by((p) => p.priceMinInr, 'desc'), newestFirst),
  screen: thenBy(by((p) => p.screenInches, 'desc'), newestFirst),
};

/** Best of each brand first, in ranked order, then the rest of the ranking. */
function diversifyByBrand(ranked: readonly Phone[], limit: number): Phone[] {
  const picked: Phone[] = [];
  const seenBrands = new Set<string>();
  for (const phone of ranked) {
    if (picked.length >= limit) break;
    if (!seenBrands.has(phone.brand)) {
      picked.push(phone);
      seenBrands.add(phone.brand);
    }
  }
  for (const phone of ranked) {
    if (picked.length >= limit) break;
    if (!picked.includes(phone)) picked.push(phone);
  }
  return picked;
}

function compare(catalog: readonly Phone[], names: readonly string[]): SearchResult {
  const phones: Phone[] = [];
  const unmatchedModels: string[] = [];
  for (const name of names) {
    const match = bestNameMatch(catalog, name);
    if (match && !phones.includes(match)) phones.push(match);
    else if (!match) unmatchedModels.push(name);
  }
  const compared = phones.slice(0, MAX_COMPARED);
  return { phones: compared, highlights: computeHighlights(compared), unmatchedModels };
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Every word the shopper typed must appear in the phone's brand and name. Among
 * the phones that pass, the one with the fewest extra words wins, so "S24" picks
 * the Galaxy S24 over the S24 Ultra. Ties go to the newest.
 */
function bestNameMatch(catalog: readonly Phone[], query: string): Phone | null {
  const wanted = tokens(query);
  if (wanted.length === 0) return null;

  let best: { phone: Phone; extra: number } | null = null;
  for (const phone of catalog) {
    const have = new Set(tokens(`${phone.brand} ${phone.name}`));
    if (!wanted.every((t) => have.has(t))) continue;
    const extra = have.size - wanted.length;
    if (!best || extra < best.extra || (extra === best.extra && phone.launchYear > best.phone.launchYear)) {
      best = { phone, extra };
    }
  }
  return best?.phone ?? null;
}

const HIGHLIGHT_RULES: ReadonlyArray<{ label: string; metric: (p: Phone) => number | null; direction: 'asc' | 'desc' }> = [
  { label: 'Highest-resolution camera', metric: (p) => p.primaryCameraMp, direction: 'desc' },
  { label: 'Biggest battery', metric: (p) => p.batteryMah, direction: 'desc' },
  { label: 'Lightest', metric: (p) => p.weightGrams, direction: 'asc' },
  { label: 'Biggest screen', metric: (p) => p.screenInches, direction: 'desc' },
  { label: 'Cheapest', metric: (p) => p.priceMinInr, direction: 'asc' },
];

/** A phone leads on a metric only if it beats every other phone outright. Ties name no one. */
function computeHighlights(phones: readonly Phone[]): Map<string, string[]> {
  const highlights = new Map<string, string[]>();
  if (phones.length < 2) return highlights;

  for (const rule of HIGHLIGHT_RULES) {
    const measured = phones
      .map((phone) => ({ phone, value: rule.metric(phone) }))
      .filter((m): m is { phone: Phone; value: number } => m.value !== null);
    if (measured.length < 2) continue;

    measured.sort((a, b) => (rule.direction === 'asc' ? a.value - b.value : b.value - a.value));
    const [first, second] = measured;
    if (first!.value === second!.value) continue;

    highlights.set(first!.phone.id, [...(highlights.get(first!.phone.id) ?? []), rule.label]);
  }
  return highlights;
}
