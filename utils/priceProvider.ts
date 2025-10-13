import { convertToINR } from './fx';
import type { Phone } from './types';

// Optional external price API endpoint you can supply via ENV
// Expected GET parameters: brand, model
const PUBLIC_PRICE_API = process.env.PUBLIC_PRICE_API; // returns { price: number, currency: 'USD'|'INR'|... }

async function fetchPriceINR(brand: string, model: string): Promise<number | undefined> {
  if (!PUBLIC_PRICE_API) return undefined;
  try {
    const url = new URL(PUBLIC_PRICE_API);
    url.searchParams.set('brand', brand);
    url.searchParams.set('model', model);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`price api ${res.status}`);
    const data: any = await res.json();
    const priceInr = await convertToINR(data?.price, data?.currency);
    return priceInr;
  } catch (e) {
    console.warn('fetchPriceINR failed', brand, model, e);
    return undefined;
  }
}

export async function enrichPrices(devices: Phone[]): Promise<Phone[]> {
  const out: Phone[] = [];
  for (const d of devices) {
    const price = d.price ?? await fetchPriceINR(d.brand, d.model);
    out.push({ ...d, price });
  }
  return out;
}
