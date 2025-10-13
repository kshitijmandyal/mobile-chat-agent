import { NextRequest, NextResponse } from 'next/server';
import { getMobiles } from '@/utils/dataProvider';

function recency(p: any): number {
  if (p.releaseYear) return p.releaseYear;
  if (p.releaseDate) {
    const m = String(p.releaseDate).match(/(20\d{2})/);
    if (m) return parseInt(m[1], 10);
  }
  return 0;
}

function canonBrand(s?: string): string | undefined {
  if (!s) return undefined;
  const lower = s.toLowerCase();
  if (lower === 'iphone') return 'apple';
  return lower;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const brandQ = url.searchParams.get('brand') || undefined;
    const latest = url.searchParams.get('latest');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const wantsLatest = latest === '1' || /true|yes|latest/i.test(latest || '');
    const devices = await getMobiles({ forceRefresh: wantsLatest, limitPerBrand: 100, maxBrands: 100 });

    const brand = canonBrand(brandQ);
    let filtered = brand ? devices.filter(d => d.brand?.toLowerCase() === brand) : devices;
    filtered = filtered.sort((a, b) => recency(b) - recency(a)).slice(0, Math.max(1, Math.min(100, limit)));

    return NextResponse.json({
      count: filtered.length,
      brand: brand || 'all',
      latest: wantsLatest,
      top: filtered.map(d => ({ brand: d.brand, model: d.model, releaseYear: d.releaseYear, releaseDate: d.releaseDate })).slice(0, 10),
      devices: filtered,
    });
  } catch (err: any) {
    console.error('/api/mobiles error', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
