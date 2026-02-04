import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { runSingle, runInsert } from '@/lib/db';

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
    const { status, isVisible } = body; // status: APPROVED, REJECTED, PENDING; isVisible: true/false
    if (status === undefined && isVisible === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const rev = runSingle('SELECT * FROM reviews WHERE id = ?', [id]);
    if (!rev) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = Date.now();
    const updateParts = [];
    const updateVals = [];

    if (status !== undefined) {
      updateParts.push('status = ?');
      updateVals.push(status);
    }
    if (isVisible !== undefined) {
      updateParts.push('is_visible = ?');
      updateVals.push(isVisible ? 1 : 0);
    }
    updateParts.push('updated_at = ?');
    updateVals.push(now);
    updateVals.push(id);

    runInsert(`UPDATE reviews SET ${updateParts.join(', ')} WHERE id = ?`, updateVals);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
