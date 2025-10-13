import type { Phone, GetMobilesOptions } from './types';
import { convertToINR } from './fx';
import { enrichPrices } from './priceProvider';
import { promises as fs } from 'fs';
import path from 'path';

// Simple in-memory cache for build/dev; swap to KV/Upstash/Redis in prod
let CACHE: { data: Phone[]; ts: number } | null = null;
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Public sources we can use without auth:
// 1) gsmarena-like mirrors (HTML parse) — not recommended without ToS approval
// 2) public-apis for phones are scarce; we’ll use an open community mirror if provided via ENV
// 3) Your own serverless scraper (Puppeteer) — optional, behind your endpoint
// 4) Fallback to curated JSON if no source available

const PUBLIC_PHONE_API = process.env.PUBLIC_PHONE_API; // e.g., your serverless endpoint that returns normalized phones

const LOCAL_CSV = path.join(process.cwd(), 'Mobiles Dataset (2025).csv');

async function readLocalCsvDataset(): Promise<Phone[]> {
  try {
    const csv = await fs.readFile(LOCAL_CSV, 'utf8');
    const rows = parseCsv(csv);
    if (rows.length <= 1) return [];
    const [header, ...data] = rows;
    const idx = (name: string) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());

    // Flexible mappings across common Kaggle schemas
    const col = {
      brand: firstFoundIndex(header, ['company name','brand','oem','manufacturer']),
      model: firstFoundIndex(header, ['model name','model','device','name']),
      price: firstFoundIndex(header, ['price','price_usd','usd_price','mrp']),
      priceInIndia: firstFoundIndex(header, ['launched price (india)','price (india)']),
      priceUSA: firstFoundIndex(header, ['launched price (usa)','price (usa)']),
      priceUAE: firstFoundIndex(header, ['launched price (dubai)','price (dubai)','price (uae)']),
      priceChina: firstFoundIndex(header, ['launched price (china)','price (china)']),
      pricePK: firstFoundIndex(header, ['launched price (pakistan)','price (pakistan)']),
      currency: firstFoundIndex(header, ['currency','curr']),
      display: firstFoundIndex(header, ['display','screen','panel','screen size']),
      refresh: firstFoundIndex(header, ['refresh_rate','hz','refresh']),
      camera: firstFoundIndex(header, ['camera_mp','main_camera_mp','primary_camera','camera','back camera']),
      battery: firstFoundIndex(header, ['battery_mah','battery','mah','battery capacity']),
      os: firstFoundIndex(header, ['os','software']),
      chipset: firstFoundIndex(header, ['chipset','soc','processor']),
      ram: firstFoundIndex(header, ['ram']),
      storage: firstFoundIndex(header, ['storage']),
      weight: firstFoundIndex(header, ['weight','mobile weight']),
  releaseDate: firstFoundIndex(header, ['release_date','launch_date','launched date']),
  releaseYear: firstFoundIndex(header, ['launched year','launch_year','year']),
      dimensions: firstFoundIndex(header, ['dimensions','size']),
      charging: firstFoundIndex(header, ['charging','fast_charging']),
      ipRating: firstFoundIndex(header, ['ip_rating','ip']),
      network: firstFoundIndex(header, ['network','bands','5g_bands']),
      amoled: firstFoundIndex(header, ['amoled','oled']),
      ois: firstFoundIndex(header, ['ois']),
      eis: firstFoundIndex(header, ['eis']),
      wireless: firstFoundIndex(header, ['wireless_charging']),
      expandable: firstFoundIndex(header, ['expandable_storage']),
    };

    const devices: Phone[] = [];
    for (const r of data) {
  const brand = canonicalizeBrand(pick(r, col.brand));
      const model = pick(r, col.model);
      if (!brand || !model) continue;

      // Prefer India price if present; else convert from USA/UAE/China/PK
      let priceInr: number | undefined = undefined;
      const priceIndia = parseMoneyINR(pick(r, col.priceInIndia));
      if (priceIndia) {
        priceInr = priceIndia;
      } else {
        const usd = parseMoney(pick(r, col.priceUSA));
        const aed = parseMoney(pick(r, col.priceUAE));
        const cny = parseMoney(pick(r, col.priceChina));
        const pkr = parseMoney(pick(r, col.pricePK));
        if (usd) priceInr = await convertToINR(usd, 'USD');
        else if (aed) priceInr = await convertToINR(aed, 'AED');
        else if (cny) priceInr = await convertToINR(cny, 'CNY');
        else if (pkr) priceInr = await convertToINR(pkr, 'PKR');
        else {
          const priceRaw = toNumberSafe(pick(r, col.price));
          const currency = pick(r, col.currency) || inferCurrencyFromHeader(header) || 'USD';
          priceInr = await convertToINR(priceRaw || undefined, currency || undefined);
        }
      }

      const displayBase = joinTruthy([
        pick(r, col.display),
        pick(r, col.refresh) && `${pick(r, col.refresh)}Hz`
      ], ' ');

  const primaryCamera = parsePrimaryCameraMP(pick(r, col.camera));
  const battery = parseBatteryMah(pick(r, col.battery));

      const features = uniqueTruthy([
        (pick(r, col.amoled) || '').toString().toLowerCase() === 'true' || /amoled/i.test(pick(r, col.display) || '') ? 'AMOLED' : undefined,
        pick(r, col.refresh) ? `${pick(r, col.refresh)}Hz` : undefined,
        truthyBool(r, col.ois) ? 'OIS' : undefined,
        truthyBool(r, col.eis) ? 'EIS' : undefined,
        truthyBool(r, col.wireless) ? 'Wireless Charging' : undefined,
        truthyBool(r, col.expandable) ? 'Expandable Storage' : undefined,
        pick(r, col.ipRating) && `IP${pick(r, col.ipRating)}`,
      ]);

  const releaseDateRaw = pick(r, col.releaseDate);
  const releaseYear = parseReleaseYear(pick(r, col.releaseYear) || releaseDateRaw);

  devices.push({
  id: `${brand}-${model}`,
        brand,
        model,
        price: priceInr,
  display: displayBase,
        primaryCamera,
        battery,
        features,
        os: pick(r, col.os),
        chipset: pick(r, col.chipset),
        ram: pick(r, col.ram),
        storage: pick(r, col.storage),
        weight: pick(r, col.weight),
    releaseDate: releaseDateRaw,
    releaseYear,
        dimensions: pick(r, col.dimensions),
        charging: pick(r, col.charging),
        ipRating: pick(r, col.ipRating),
        network: pick(r, col.network),
      });
    }
    return devices;
  } catch {
    return [];
  }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      cur.push(field); field = '';
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (field.length || cur.length) { cur.push(field); rows.push(cur); }
      cur = []; field = '';
      // swallow \r\n pairs naturally
    } else {
      field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  // trim headers/cells
  return rows.map(row => row.map(cell => cell.trim()));
}

function firstFoundIndex(header: string[], names: string[]): number {
  for (const n of names) {
    const i = header.findIndex(h => h.toLowerCase() === n.toLowerCase());
    if (i !== -1) return i;
  }
  return -1;
}
function inferCurrencyFromHeader(header: string[]): string | undefined {
  const joined = header.join(' ').toLowerCase();
  if (/usd/.test(joined)) return 'USD';
  if (/eur/.test(joined)) return 'EUR';
  if (/gbp|pound/.test(joined)) return 'GBP';
  if (/inr|₹/.test(joined)) return 'INR';
  return undefined;
}
function pick(row: string[], i: number | undefined | null): string | undefined {
  if (typeof i !== 'number' || i < 0) return undefined;
  return row[i]?.trim() || undefined;
}
function toNumberSafe(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : undefined;
}
function truthyBool(row: string[], i: number | undefined | null): boolean {
  const v = (pick(row, i) || '').toString().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function parseMoneyINR(v?: string): number | undefined {
  if (!v) return undefined;
  // Examples: "INR 79,999", "₹79,999"
  const cleaned = v.replace(/[,\s]/g, '');
  const m = cleaned.match(/(?:INR|₹)?(\d+(?:\.\d+)?)/i);
  if (!m) return undefined;
  const num = parseFloat(m[1]);
  return isFinite(num) ? Math.round(num) : undefined;
}
function parseMoney(v?: string): number | undefined {
  if (!v) return undefined;
  // Examples: "USD 799", "AED 2,799", "CNY 5,799", "PKR 224,999"
  const cleaned = v.replace(/[,\s]/g, '');
  const m = cleaned.match(/([A-Z]{3})?(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  const num = parseFloat(m[2] || m[1]);
  return isFinite(num) ? num : undefined;
}
function parsePrimaryCameraMP(v?: string): number | undefined {
  if (!v) return undefined;
  // Examples: "48MP", "50MP + 12MP", "64MP / 4K"
  const m = v.match(/(\d{2,3})\s*MP/i);
  if (m) return parseInt(m[1], 10);
  return undefined;
}
function parseBatteryMah(v?: string): number | undefined {
  if (!v) return undefined;
  // Examples: "3,600mAh", "5000 mAh"
  const cleaned = v.replace(/[,\s]/g, '');
  const m = cleaned.match(/(\d{3,5})m?Ah/i);
  if (m) return parseInt(m[1], 10);
  const n = toNumberSafe(v);
  return n && n >= 800 ? Math.round(n) : undefined;
}

function parseReleaseYear(v?: string): number | undefined {
  if (!v) return undefined;
  const m = v.match(/(20\d{2})/); // 2000-2099
  if (m) {
    const y = parseInt(m[1], 10);
    if (y >= 2005 && y <= 2035) return y;
  }
  const n = parseInt(v, 10);
  if (isFinite(n) && n >= 2005 && n <= 2035) return n;
  return undefined;
}

async function fetchPublicPhones(): Promise<Phone[]> {
  if (!PUBLIC_PHONE_API) return [];
  try {
    const res = await fetch(PUBLIC_PHONE_API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Public phone API failed: ${res.status}`);
    const raw = await res.json();
    // Expecting an array of devices; normalize best-effort
  const devices: Phone[] = (raw || []).map((d: any) => ({
    id: d.id || `${d.brand}-${d.model}`,
    brand: canonicalizeBrand(d.brand || d.oem || 'Unknown'),
      model: d.model || d.device || d.name || 'Unknown',
  price: undefined, // we’ll enrich later; keep raw for conversion if provided
      display: d.display || joinTruthy([d.screen, d.panel, d.refreshRate && `${d.refreshRate}Hz`]),
      primaryCamera: parseInt(d.cameraMP || d.primaryCamera || d.camera?.mainMP, 10) || undefined,
      battery: parseInt(d.batteryMAh || d.battery, 10) || undefined,
  features: uniqueTruthy([
        d.panel,
        d.refreshRate && `${d.refreshRate}Hz`,
        d.charging && `${d.charging}`,
        d.wirelessCharging && 'Wireless Charging',
        d.ipRating && `IP${d.ipRating}`,
        d.ois && 'OIS',
        d.eis && 'EIS',
        d.expandableStorage && 'Expandable Storage',
      ]),
      os: d.os || d.software,
      chipset: d.chipset || d.soc,
      ram: d.ram,
      storage: d.storage,
      weight: d.weight,
      releaseDate: d.releaseDate || d.launchDate,
      releaseYear: parseReleaseYear(d.launchYear || d.releaseYear || d.releaseDate || d.launchDate),
      dimensions: d.dimensions,
      charging: d.charging,
      ipRating: d.ipRating,
      network: d.network || d.bands,
    }));
    return devices;
  } catch (e) {
    console.warn('fetchPublicPhones failed', e);
    return [];
  }
}

function uniqueTruthy(arr: any[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}
function joinTruthy(arr: any[], sep = ' '): string | undefined {
  const s = arr.filter(Boolean).join(sep).trim();
  return s || undefined;
}
function canonicalizeBrand(input?: string): string {
  if (!input) return 'Unknown';
  const s = input.trim();
  const lower = s.toLowerCase();
  if (/(^|\b)apple(\b|$)/.test(lower)) return 'Apple';
  if (/(^|\b)samsung(\b|$)/.test(lower)) return 'Samsung';
  if (/(^|\b)xiaomi(\b|$)/.test(lower)) return 'Xiaomi';
  if (/one\s*plus|oneplus/.test(lower)) return 'OnePlus';
  if (/(^|\b)vivo(\b|$)/.test(lower)) return 'Vivo';
  if (/(^|\b)oppo(\b|$)/.test(lower)) return 'Oppo';
  if (/(^|\b)realme(\b|$)/.test(lower)) return 'Realme';
  if (/(^|\b)poco(\b|$)/.test(lower)) return 'Poco';
  return s.replace(/\s+Inc\.?$/i, '');
}
// Keep for backward compat if local JSON has price in other currency; prefer convertToINR

export async function getMobiles(options: GetMobilesOptions = {}): Promise<Phone[]> {
  const now = Date.now();
  if (!options.forceRefresh && CACHE && (now - CACHE.ts) < TTL_MS) {
    return CACHE.data;
  }

  // 1) Prefer local CSV dataset if available (kept in repo for context)
  let devices = await readLocalCsvDataset();

  // 2) Try public API (your endpoint)
  if (devices.length === 0) {
    devices = await fetchPublicPhones();
  }

  // 3) Fallback to local JSON if empty
  if (devices.length === 0) {
    try {
      const local = (await import('../data/mobiles.json')).default as any[];
      devices = (local || []).map((d) => ({ ...d, features: d.features || [] }));
    } catch { /* ignore */ }
  }



  // 5) Group by (brand, model, releaseYear), aggregate storage, merge camera info, and sort iPhones so Pro/Pro Max come first
  const grouped: Record<string, Phone & { storageOptions?: string[]; storagePriceMap?: Record<string, number>; priceMin?: number; priceMax?: number; cameraSummary?: string }> = {};
  for (const d of devices) {
    // Group by brand, model, releaseYear (ignore storage)
    const key = [d.brand, d.model, d.releaseYear].join('||');
    if (!grouped[key]) {
      grouped[key] = { ...d, storage: undefined, storageOptions: [], storagePriceMap: {}, cameraSummary: '' };
    }
    // Extract storage from model name if missing (e.g., "256GB" in "iPhone 17 Pro Max 256GB")
    let storageVal = (typeof d.storage === 'string' && d.storage.trim()) ? d.storage.trim() : undefined;
    if (!storageVal && /\b(\d{1,4})\s?(gb|tb)\b/i.test(d.model)) {
      const match = d.model.match(/\b(\d{1,4})\s?(gb|tb)\b/i);
      if (match) {
        const num = match[1];
        const unit = match[2].toUpperCase();
        storageVal = `${num}${unit}`;
      }
    }
    if (storageVal) {
      if (!grouped[key].storageOptions?.includes(storageVal)) {
        grouped[key].storageOptions?.push(storageVal);
      }
      if (typeof d.price === 'number') {
        grouped[key].storagePriceMap![storageVal] = d.price;
      }
    }
    // Aggregate price range
    if (typeof d.price === 'number') {
      if (typeof grouped[key].priceMin !== 'number' || d.price < grouped[key].priceMin) grouped[key].priceMin = d.price;
      if (typeof grouped[key].priceMax !== 'number' || d.price > grouped[key].priceMax) grouped[key].priceMax = d.price;
    }
    // Aggregate camera info: prefer most descriptive feature (e.g., Triple 48MP + 12MP + 12MP)
    const camFeatures = (d.features || []).filter(f => /\d+mp/i.test(f));
    // Prefer feature with 'triple', 'dual', etc., or longest
    let bestCam = camFeatures.find(f => /(triple|quad|dual|penta|main|ultrawide|tele|periscope|macro|depth)/i.test(f));
    if (!bestCam && camFeatures.length) bestCam = camFeatures.sort((a, b) => b.length - a.length)[0];
    // If still not found, use camera column directly (for iPhones, e.g., "Triple 48 MP")
  if (!bestCam && typeof (d as any).camera === 'string' && /\d+\s*mp/i.test((d as any).camera)) bestCam = (d as any).camera;
    if (bestCam && (!grouped[key].cameraSummary || bestCam.length > grouped[key].cameraSummary.length)) {
      grouped[key].cameraSummary = bestCam;
    }
    if (!grouped[key].cameraSummary && d.primaryCamera) {
      grouped[key].cameraSummary = `${d.primaryCamera}MP`;
    }
    if (!grouped[key].cameraSummary) {
      const anyMP = (d.features || []).find(f => /\d+mp/i.test(f));
      if (anyMP) grouped[key].cameraSummary = anyMP;
    }
  }

  // Convert grouped to array and sort
  let result = Object.values(grouped);
  
  // Sort by recency first (latest phones first), with brand diversity
  result = result.sort((a, b) => {
    const recency = (p: Phone) => {
      if (p.releaseYear) return p.releaseYear;
      if (p.releaseDate) {
        const m = p.releaseDate.match(/(20\d{2})/);
        if (m) return parseInt(m[1], 10);
      }
      return 0;
    };
    const yearDiff = recency(b) - recency(a);
    // If same release year, interleave brands alphabetically to ensure diversity
    if (yearDiff === 0) {
      // For Apple phones in same year, maintain Pro/Pro Max hierarchy
      if (a.brand === 'Apple' && b.brand === 'Apple') {
        const rank = (m: string) => /pro max/i.test(m) ? 3 : /pro/i.test(m) ? 2 : /plus/i.test(m) ? 1 : 0;
        return rank(b.model) - rank(a.model);
      }
      // Otherwise sort by brand name to mix brands
      return a.brand.localeCompare(b.brand);
    }
    return yearDiff;
  });

  // 6) Enrich prices using optional price API and FX conversion
  const enriched = await enrichPrices(result);

  CACHE = { data: enriched, ts: now };
  return enriched;
}
