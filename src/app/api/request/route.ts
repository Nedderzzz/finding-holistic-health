import { NextResponse } from 'next/server';
import { runInsert } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { sendAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ['businessName', 'providerName', 'city', 'state', 'phone'];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `${f} required` }, { status: 400 });
    }

    const id = generateId();
    const now = Date.now();
    runInsert('INSERT INTO request_submissions (id, business_name, provider_name, specialties, address_line_1, city, state, zip, phone, website, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      body.businessName,
      body.providerName,
      JSON.stringify(body.specialties || []),
      body.addressLine1 || null,
      body.city,
      body.state,
      body.zip || null,
      body.phone,
      body.website || null,
      body.description || null,
      'RECEIVED',
      now,
      now,
    ]);

    sendAdminNotification('New provider request', `<p>New request submitted: ${body.businessName} (${body.city}, ${body.state})</p>`).catch(console.error);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
