import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { CatalogUnavailableError } from '../domain/errors';
import type { Phone } from '../domain/phone';
import type { Logger, PhoneCatalog } from '../interfaces';
import { mapCsvRecords, type CsvRecord } from '../mappers/csvRowMapper';

/**
 * Reads the CSV once per server instance. The file ships with the deploy and
 * never changes at runtime, so there's nothing to expire.
 */
export class CsvPhoneCatalog implements PhoneCatalog {
  private loading: Promise<readonly Phone[]> | null = null;

  constructor(
    private readonly fileName: string,
    private readonly logger: Logger,
  ) {}

  all(): Promise<readonly Phone[]> {
    this.loading ??= this.load().catch((error: unknown) => {
      // Don't cache a failure: the next request should get to try again.
      this.loading = null;
      throw error;
    });
    return this.loading;
  }

  private async load(): Promise<readonly Phone[]> {
    let text: string;
    try {
      // The literal 'data' segment lets build tracing ship just that folder, not the whole project.
      text = await readFile(path.join(process.cwd(), 'data', this.fileName), 'utf8');
    } catch (cause) {
      throw new CatalogUnavailableError('The phone catalog could not be read.', { cause });
    }

    const { phones, skippedRows } = mapCsvRecords(toRecords(parseCsv(text)));
    if (phones.length === 0) throw new CatalogUnavailableError('The phone catalog is empty.');

    this.logger.info('catalog_loaded', { phones: phones.length, skippedRows });
    return Object.freeze(phones);
  }
}

function toRecords(rows: readonly string[][]): CsvRecord[] {
  const [header, ...data] = rows;
  if (!header) return [];
  return data.map((row) => Object.fromEntries(header.map((column, i) => [column, row[i] ?? ''])));
}

/** RFC 4180: quoted fields may hold commas, newlines and doubled quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);

  return rows.map((r) => r.map((f) => f.trim()));
}
