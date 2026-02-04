import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file') as any;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const text = await file.text();
    const records = parse(text, { columns: true, skip_empty_lines: true });

    // basic validation per row
    const preview = records.map((row: any, idx: number) => {
      const businessName = (row.businessName || row.business_name || '').trim();
      const city = (row.city || '').trim();
      const state = (row.state || '').trim().toUpperCase();
      const ok = !!businessName && !!city && !!state;
      return { line: idx + 1, ok, businessName, city, state };
    });

    return NextResponse.json({ preview });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: (err && err.message) || 'Preview failed' }, { status: 500 });
  }
}
