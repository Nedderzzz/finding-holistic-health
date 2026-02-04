import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { runQuery, runSingle, runInsert } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { sendAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // require admin session
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions as any);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get('file') as any;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const text = await file.text();
    const records = parse(text, { columns: true, skip_empty_lines: true });

    let created = 0, updated = 0, skipped = 0, errors: any[] = [];

    for (const [i, row] of records.entries()) {
      try {
        const businessName = (row.businessName || row.business_name || '').trim();
        const city = (row.city || '').trim();
        const state = (row.state || '').trim().toUpperCase();
        if (!businessName || !city || !state) {
          skipped++;
          continue;
        }

        const specialtiesRaw = (row.specialties || '').toString();
        const specialties = specialtiesRaw ? specialtiesRaw.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : [];

        const lat = row.latitude ? parseFloat(row.latitude) : null;
        const lng = row.longitude ? parseFloat(row.longitude) : null;

        const existing = runSingle('SELECT * FROM providers WHERE business_name = ? AND city = ? AND state = ?', [businessName, city, state]);
        const now = Date.now();
        if (existing) {
          // update
          runInsert('UPDATE providers SET provider_name = ?, specialties = ?, address_line_1 = ?, zip = ?, phone = ?, website = ?, description = ?, status = ?, latitude = ?, longitude = ?, updated_at = ? WHERE id = ?', [
            row.providerName || row.provider_name || existing.provider_name,
            JSON.stringify(specialties),
            row.addressLine1 || row.address_line_1 || existing.address_line_1,
            row.zip || existing.zip,
            row.phone || existing.phone,
            row.website || existing.website,
            row.description || existing.description,
            row.status || existing.status,
            lat,
            lng,
            now,
            existing.id,
          ]);
          updated++;
        } else {
          const id = generateId();
          runInsert('INSERT INTO providers (id, business_name, provider_name, specialties, address_line_1, city, state, zip, latitude, longitude, phone, website, description, status, avg_rating, review_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            id,
            businessName,
            row.providerName || row.provider_name || '',
            JSON.stringify(specialties),
            row.addressLine1 || row.address_line_1 || null,
            city,
            state,
            row.zip || null,
            lat,
            lng,
            row.phone || null,
            row.website || null,
            row.description || null,
            (row.status || 'PENDING'),
            0,
            0,
            now,
            now,
          ]);
          created++;
        }
      } catch (err: any) {
        errors.push({ line: i + 1, error: (err && err.message) || String(err) });
      }
    }

    // send summary email
    sendAdminNotification('CSV import completed', `<p>Created: ${created}</p><p>Updated: ${updated}</p><p>Skipped: ${skipped}</p><p>Errors: ${errors.length}</p>`).catch(console.error);

    return NextResponse.json({ created, updated, skipped, errors });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: (err && err.message) || 'Import failed' }, { status: 500 });
  }
}
