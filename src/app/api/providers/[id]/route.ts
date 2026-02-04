import { NextResponse } from 'next/server';
import { runSingle, runQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const provider = runSingle('SELECT * FROM providers WHERE id = ? AND status = "APPROVED"', [id]);
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const reviews = runQuery('SELECT r.*, u.first_name, u.last_name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.provider_id = ? AND r.status = "APPROVED" AND r.is_visible = 1 ORDER BY r.created_at DESC', [id]);

  try {
    provider.specialties = JSON.parse(provider.specialties || '[]');
  } catch (e) {
    provider.specialties = [];
  }

  return NextResponse.json({ provider, reviews });
}
