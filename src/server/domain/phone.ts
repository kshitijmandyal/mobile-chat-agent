import { InvalidPhoneError } from './errors';

export const OPERATING_SYSTEMS = ['iOS', 'iPadOS', 'Android', 'HarmonyOS'] as const;
export type OperatingSystem = (typeof OPERATING_SYSTEMS)[number];

export const DEVICE_TYPES = ['phone', 'tablet'] as const;
export type DeviceType = (typeof DEVICE_TYPES)[number];

export interface PhoneVariant {
  readonly storage: string | null;
  readonly ram: string | null;
  readonly priceInr: number;
}

export interface Phone {
  readonly id: string;
  readonly brand: string;
  readonly model: string;
  /** What a person would call it: "OnePlus 12", not "OnePlus OnePlus 12". */
  readonly name: string;
  readonly deviceType: DeviceType;
  readonly os: OperatingSystem;
  readonly launchYear: number;
  readonly processor: string | null;
  readonly backCamera: string | null;
  readonly primaryCameraMp: number | null;
  readonly frontCameraMp: number | null;
  readonly batteryMah: number | null;
  readonly screenInches: number | null;
  readonly weightGrams: number | null;
  /** Cheapest first. Never empty. */
  readonly variants: readonly PhoneVariant[];
  readonly priceMinInr: number;
  readonly priceMaxInr: number;
}

export type PhoneInput = Omit<Phone, 'id' | 'name' | 'priceMinInr' | 'priceMaxInr'>;

const EARLIEST_YEAR = 2007;
const LATEST_YEAR = 2100;

/**
 * The only way to make a Phone. A row that fails here never reaches search, so
 * search never has to ask whether a price is a number.
 */
export function createPhone(input: PhoneInput): Phone {
  const brand = input.brand.trim();
  const model = input.model.trim();
  if (!brand || !model) throw new InvalidPhoneError('brand and model are required');
  if (!Number.isInteger(input.launchYear) || input.launchYear < EARLIEST_YEAR || input.launchYear > LATEST_YEAR) {
    throw new InvalidPhoneError('launch year out of range');
  }
  if (input.variants.length === 0) throw new InvalidPhoneError('at least one priced variant is required');
  if (input.variants.some((v) => !Number.isInteger(v.priceInr) || v.priceInr <= 0)) {
    throw new InvalidPhoneError('variant prices must be positive whole rupees');
  }

  const variants = [...input.variants].sort((a, b) => a.priceInr - b.priceInr).map((v) => Object.freeze({ ...v }));
  const name = model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`;

  return Object.freeze({
    ...input,
    brand,
    model,
    name,
    id: slugify(`${brand} ${model} ${input.launchYear}`),
    variants: Object.freeze(variants),
    priceMinInr: variants[0]!.priceInr,
    priceMaxInr: variants[variants.length - 1]!.priceInr,
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** What the extractor is told the catalog contains, and what criteria are clamped to. */
export interface CatalogFacts {
  readonly brands: readonly string[];
  readonly earliestYear: number;
  readonly latestYear: number;
}

export function describeCatalog(phones: readonly Phone[]): CatalogFacts {
  const years = phones.map((p) => p.launchYear);
  return Object.freeze({
    brands: Object.freeze([...new Set(phones.map((p) => p.brand))].sort()),
    earliestYear: Math.min(...years),
    latestYear: Math.max(...years),
  });
}
