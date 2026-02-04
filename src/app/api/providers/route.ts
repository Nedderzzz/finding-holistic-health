import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const city = url.searchParams.get('city');
  const q = url.searchParams.get('q');
  const specialty = url.searchParams.get('specialty');

  let base = 'SELECT * FROM providers WHERE status = "APPROVED"';
  const params: any[] = [];

  if (state) {
    base += ' AND state = ?';
    params.push(state.toUpperCase());
  }
  if (city) {
    base += ' AND city LIKE ?';
    params.push(`%${city}%`);
  }
  if (q) {
    base += ' AND (business_name LIKE ? OR provider_name LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (specialty) {
    base += ' AND specialties LIKE ?';
    params.push(`%${specialty}%`);
  }

  base += ' ORDER BY avg_rating DESC';

  const rows = runQuery(base, params);

  // parse specialties JSON from DB
  const data = rows.map((r: any) => ({
    ...r,
    specialties: (() => {
      try {
        return JSON.parse(r.specialties || '[]');
      } catch (e) {
        return [];
      }
    })(),
  }));

  return NextResponse.json({ providers: data });
}
