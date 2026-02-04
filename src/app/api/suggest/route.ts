import { NextResponse } from 'next/server';
import { runInsert } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { sendAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.businessName || !body.city || !body.state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();
    const now = Date.now();
    runInsert('INSERT INTO suggestions (id, suggested_by, business_name, provider_name, specialties, address_line_1, city, state, zip, phone, website, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      body.suggestedBy || null,
      body.businessName,
      body.providerName || null,
      JSON.stringify(body.specialties || []),
      body.addressLine1 || null,
      body.city,
      body.state,
      body.zip || null,
      body.phone || null,
      body.website || null,
      body.notes || null,
      'RECEIVED',
      now,
      now,
    ]);

    sendAdminNotification('New provider suggestion', `<p>Suggestion: ${body.businessName} (${body.city}, ${body.state})</p>`).catch(console.error);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
