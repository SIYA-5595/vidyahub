import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
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
  }
}
