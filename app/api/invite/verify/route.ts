import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    const inviteDoc = await adminDb.collection('invites').doc(token).get();

    if (!inviteDoc.exists) {
      return NextResponse.json({ error: 'Invalid invitation link' }, { status: 404 });
    }

    const data = inviteDoc.data();
    
    // Check if used
    if (data?.status === 'used') {
      return NextResponse.json({ error: 'This invitation has already been used' }, { status: 410 });
    }

    // Check expiry
    const expiresAt = data?.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation link has expired' }, { status: 410 });
    }

    return NextResponse.json({ 
      success: true, 
      email: data?.email 
    });

  } catch (error: unknown) {
    console.error('Invite verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
