let INR_RATE_CACHE: { rate: number; ts: number } | null = null;
const FX_TTL_MS = 12 * 60 * 60 * 1000; // 12h

export async function getInrRate(base: string = 'USD'): Promise<number> {
  const now = Date.now();
  if (INR_RATE_CACHE && now - INR_RATE_CACHE.ts < FX_TTL_MS) {
    return INR_RATE_CACHE.rate;
  }
  try {
    // Free public endpoint; swap to a paid provider if needed
    const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=INR`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
    const json: any = await res.json();
    const rate = json?.rates?.INR;
    if (typeof rate === 'number' && isFinite(rate)) {
      INR_RATE_CACHE = { rate, ts: now };
      return rate;
    }
  } catch (e) {
    console.warn('getInrRate failed; falling back to static USD→INR=84', e);
  }
  // Fallback approximate USD→INR
  return 84;
}

export async function convertToINR(amount: number | undefined, currency?: string): Promise<number | undefined> {
  if (!amount) return undefined;
  if (!currency) return amount; // assume already INR if currency missing
  const cur = currency.toUpperCase();
  if (cur === 'INR' || cur === '₹') return amount;
  const rate = await getInrRate(cur);
  return Math.round(amount * rate);
}
