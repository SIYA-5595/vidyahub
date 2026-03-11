import { NextResponse } from 'next/server';
import { adminDb, adminAuth, Timestamp } from '@/lib/firebase-admin';
import { sendInviteEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role = 'admin' } = body as { email?: string; role?: string };

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. REVOCATION LOGIC: Delete any existing documents for this email in "admin_invites"
    const existingSnap = await adminDb
      .collection('admin_invites')
      .where('email', '==', trimmedEmail)
      .get();

    if (!existingSnap.empty) {
      console.log(`[Firestore] Revoking ${existingSnap.size} existing invite(s) for ${trimmedEmail}`);
      const batch = adminDb.batch();
      existingSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // 2. AUTH CHECK: Safety check to see if user already exists in Firebase Authentication
    try {
      await adminAuth.getUserByEmail(trimmedEmail);
      return NextResponse.json(
        { error: 'An account with this email already exists in the system.' },
        { status: 409 }
      );
    } catch {
      // User-not-found: Proceed with invitation
    }

    // 3. GENERATE SIGN-IN LINK: Passwordless login link for the invite
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const continueUrl = `${baseUrl}/accept-invite?email=${encodeURIComponent(trimmedEmail)}`;

    const loginLink = await adminAuth.generateSignInWithEmailLink(trimmedEmail, {
      url: continueUrl,
      handleCodeInApp: true,
    });

    // 4. STORAGE: Save invitation details in Firestore "admin_invites" collection
    const inviteRef = adminDb.collection('admin_invites').doc();
    const now = new Date();
    await inviteRef.set({
      email: trimmedEmail,
      role, // Preserving role from UI selection
      status: 'pending',
      sentAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(new Date(now.getTime() + 48 * 60 * 60 * 1000)), // 48 Hours
    });

    // 5. EMAIL DISPATCH: Send the email using Nodemailer
    await sendInviteEmail(trimmedEmail, loginLink, role);

    console.log(`[API Success] Invite saved to Firestore and email sent to ${trimmedEmail}`);

    return NextResponse.json({
      success: true,
      message: `Invitation successfully sent to ${trimmedEmail}.`,
      inviteId: inviteRef.id,
    });

  } catch (error: any) {
    console.error('[/api/invite] API ERROR:', error);

    // Special handling for common infrastructure errors
    if (error?.code === 7 || error?.message?.includes('permissions')) {
      return NextResponse.json(
        { error: 'Firebase Permissions Error: Check your Service Account Key IAM roles.' },
        { status: 403 }
      );
    }

    if (error?.message?.includes('535') || error?.message?.includes('BadCredentials')) {
      return NextResponse.json(
        { error: 'Email Dispatch Error: Check your SMTP/App Password in .env.local.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error.' },
      { status: 500 }
    );
  }
}
