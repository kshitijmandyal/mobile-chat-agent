import { BRAND_ALIASES, CSV_COLUMNS, TABLET_NAME_PATTERN } from '../constants/catalog';
import { InvalidPhoneError } from '../domain/errors';
import { createPhone, type OperatingSystem, type Phone, type PhoneVariant } from '../domain/phone';

export type CsvRecord = Readonly<Record<string, string>>;

export interface MappedCatalog {
  readonly phones: readonly Phone[];
  readonly skippedRows: number;
}

interface ParsedRow {
  readonly brand: string;
  readonly baseModel: string;
  readonly launchYear: number;
  readonly variant: PhoneVariant;
  readonly weightGrams: number | null;
  readonly frontCameraMp: number | null;
  readonly backCamera: string | null;
  readonly primaryCameraMp: number | null;
  readonly processor: string | null;
  readonly batteryMah: number | null;
  readonly screenInches: number | null;
}

/**
 * The dataset has one row per storage variant ("iPhone 17 256GB", "iPhone 17
 * 512GB"). A shopper thinks in phones, so rows are grouped by brand, base model
 * and launch year, and the variants become that phone's price range.
 */
export function mapCsvRecords(records: readonly CsvRecord[]): MappedCatalog {
  const groups = new Map<string, ParsedRow[]>();
  const seenRows = new Set<string>();
  let skippedRows = 0;

  for (const record of records) {
    const row = parseRow(record);
    if (!row) {
      skippedRows++;
      continue;
    }
    // The dataset repeats some rows verbatim.
    const rowKey = JSON.stringify(record);
    if (seenRows.has(rowKey)) continue;
    seenRows.add(rowKey);

    const groupKey = [row.brand, row.baseModel.toLowerCase(), row.launchYear].join('|');
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), row]);
  }

  const phones: Phone[] = [];
  for (const rows of groups.values()) {
    try {
      phones.push(toPhone(rows));
    } catch (error) {
      if (!(error instanceof InvalidPhoneError)) throw error;
      skippedRows += rows.length;
    }
  }
  return { phones, skippedRows };
}

function toPhone(rows: readonly ParsedRow[]): Phone {
  const [first] = rows;
  if (!first) throw new InvalidPhoneError('empty group');
  // Specs other than storage, RAM and price are the same across variants; take the first known value.
  const firstKnown = <T>(pick: (r: ParsedRow) => T | null): T | null =>
    rows.map(pick).find((v) => v !== null) ?? null;

  const variants = new Map<string, PhoneVariant>();
  for (const { variant } of rows) {
    variants.set(`${variant.storage}|${variant.ram}|${variant.priceInr}`, variant);
  }

  return createPhone({
    brand: first.brand,
    model: first.baseModel,
    deviceType: TABLET_NAME_PATTERN.test(first.baseModel) ? 'tablet' : 'phone',
    os: operatingSystemFor(first.brand, first.baseModel),
    launchYear: first.launchYear,
    processor: firstKnown((r) => r.processor),
    backCamera: firstKnown((r) => r.backCamera),
    primaryCameraMp: firstKnown((r) => r.primaryCameraMp),
    frontCameraMp: firstKnown((r) => r.frontCameraMp),
    batteryMah: firstKnown((r) => r.batteryMah),
    screenInches: firstKnown((r) => r.screenInches),
    weightGrams: firstKnown((r) => r.weightGrams),
    variants: [...variants.values()],
  });
}

function parseRow(record: CsvRecord): ParsedRow | null {
  const brand = canonicalBrand(cell(record, CSV_COLUMNS.brand));
  const modelName = cell(record, CSV_COLUMNS.model);
  const priceInr = parseInr(cell(record, CSV_COLUMNS.priceIndia));
  const launchYear = parseWhole(cell(record, CSV_COLUMNS.year));
  if (!brand || !modelName || priceInr === null || launchYear === null) return null;

  const { baseModel, storage } = splitStorage(modelName);
  const backCamera = cell(record, CSV_COLUMNS.backCamera);

  return {
    brand,
    baseModel,
    launchYear,
    variant: { storage, ram: cell(record, CSV_COLUMNS.ram), priceInr },
    weightGrams: parseDecimal(cell(record, CSV_COLUMNS.weight)),
    frontCameraMp: parseDecimal(cell(record, CSV_COLUMNS.frontCamera)),
    backCamera,
    primaryCameraMp: parseDecimal(backCamera),
    processor: cell(record, CSV_COLUMNS.processor),
    batteryMah: parseWhole(cell(record, CSV_COLUMNS.battery)),
    screenInches: parseDecimal(cell(record, CSV_COLUMNS.screen)),
  };
}

function cell(record: CsvRecord, column: string): string | null {
  const value = record[column]?.trim();
  return value && value.toLowerCase() !== 'unknown' ? value : null;
}

function canonicalBrand(raw: string | null): string | null {
  if (!raw) return null;
  return BRAND_ALIASES[raw.toLowerCase()] ?? raw;
}

/** "iPhone 17 Pro 256GB" -> base "iPhone 17 Pro", storage "256GB". */
function splitStorage(modelName: string): { baseModel: string; storage: string | null } {
  const match = modelName.match(/\s*\b(\d{1,4})\s?(GB|TB)\b\s*$/i);
  if (!match || match.index === undefined) return { baseModel: modelName, storage: null };
  return {
    baseModel: modelName.slice(0, match.index).trim(),
    storage: `${match[1]}${match[2]!.toUpperCase()}`,
  };
}

function operatingSystemFor(brand: string, model: string): OperatingSystem {
  if (brand === 'Apple') return /ipad/i.test(model) ? 'iPadOS' : 'iOS';
  if (brand === 'Huawei') return 'HarmonyOS';
  return 'Android';
}

/** "INR 1,69,900" -> 169900. Indian digit grouping, so commas are just stripped. */
function parseInr(value: string | null): number | null {
  if (!value || !/INR|₹/i.test(value)) return null;
  const digits = value.replace(/[^\d.]/g, '');
  const amount = Number.parseFloat(digits);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
}

/** First number in the cell: "190g" -> 190, "50MP + 8MP" -> 50, "6.7 inches" -> 6.7. */
function parseDecimal(value: string | null): number | null {
  const match = value?.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number.parseFloat(match[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseWhole(value: string | null): number | null {
  const n = parseDecimal(value);
  return n === null ? null : Math.round(n);
}
