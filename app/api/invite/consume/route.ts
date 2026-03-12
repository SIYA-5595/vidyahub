import { NextResponse } from 'next/server';
import { adminDb, Timestamp } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const inviteRef = adminDb.collection('invites').doc(token);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Mark as used or delete
    // Option 1: Invalidate by marking as used
    await inviteRef.update({
      status: 'used',
      usedAt: Timestamp.now(),
    });

    // Option 2: Delete the token record
    // await inviteRef.delete();

    return NextResponse.json({ success: true, message: 'Invite consumed successfully' });

  } catch (error: unknown) {
    console.error('Invite consumption error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
