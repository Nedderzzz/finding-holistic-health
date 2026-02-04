import { NextResponse } from 'next/server';
import { runInsert } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { sendAdminNotification } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { userId, rating, content } = body;
    if (!userId || !rating || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const reviewId = generateId();
    const now = Date.now();
    runInsert('INSERT INTO reviews (id, user_id, provider_id, rating, content, status, is_visible, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [reviewId, userId, id, rating, content, 'PENDING', 0, now, now]);

    // Notify admin
    sendAdminNotification('New review pending', `<p>New review for provider ${id}</p><p>Rating: ${rating}</p><p>Content: ${content}</p>`).catch(console.error);

    return NextResponse.json({ ok: true, id: reviewId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
