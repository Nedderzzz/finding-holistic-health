import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { runInsert } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { firstName, lastName } = body;
    if (!firstName || !lastName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // update users table
    const now = Date.now();
    runInsert('UPDATE users SET first_name = ?, last_name = ? WHERE email = ?', [firstName, lastName, session.user.email]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
