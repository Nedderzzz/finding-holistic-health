import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { runSingle, runInsert } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions as any);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body; // APPROVED, REJECTED, REVIEWED
    if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });

    const sug = runSingle('SELECT * FROM suggestions WHERE id = ?', [id]);
    if (!sug) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = Date.now();

    if (status === 'APPROVED') {
      // create provider from suggestion
      const providerId = generateId();
      runInsert(
        'INSERT INTO providers (id, business_name, provider_name, specialties, address_line_1, city, state, zip, latitude, longitude, phone, website, description, status, avg_rating, review_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          providerId,
          sug.business_name,
          sug.provider_name,
          sug.specialties,
          sug.address_line_1,
          sug.city,
          sug.state,
          sug.zip,
          null,
          null,
          sug.phone,
          sug.website,
          null,
          'APPROVED',
          0,
          0,
          now,
          now,
        ]
      );
    }

    // update suggestion status
    runInsert('UPDATE suggestions SET status = ?, updated_at = ? WHERE id = ?', [status, now, id]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
