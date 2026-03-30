import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
<<<<<<< HEAD
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
=======
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email query parameter is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Verify a valid pending invite exists for this email using Admin SDK
    const inviteSnap = await adminDb
      .collection('admin_invites')
      .where('email', '==', trimmedEmail)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (inviteSnap.empty) {
      return NextResponse.json(
        { error: 'No pending invite found for this email. It may have already been used or expired.' },
        { status: 404 }
      );
    }

    const inviteData = inviteSnap.docs[0].data();
    
    // Check expiration
    const expiresAt = inviteData.expiresAt?.toDate?.() as Date | undefined;
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired. Please ask your admin to send a new one.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      role: inviteData.role || 'admin',
    });
  } catch (error: unknown) {
    console.error('[/api/invite/verify] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
  }
}
