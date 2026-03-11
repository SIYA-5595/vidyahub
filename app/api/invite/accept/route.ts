import { NextResponse } from 'next/server';
import { adminDb, adminAuth, Timestamp } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are all required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // 1. Verify a valid pending invite exists for this email
    const inviteSnap = await adminDb
      .collection('admin_invites')
      .where('email', '==', trimmedEmail)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (inviteSnap.empty) {
      return NextResponse.json(
        { error: 'No pending invite found for this email. It may have already been used or expired.' },
        { status: 403 }
      );
    }

    const inviteDoc = inviteSnap.docs[0];
    const inviteData = inviteDoc.data();

    // 2. Check expiry
    const expiresAt = inviteData.expiresAt?.toDate?.() as Date | undefined;
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired. Please ask your admin to send a new one.' },
        { status: 403 }
      );
    }

    const role: string = inviteData.role || 'admin';

    // 3. Create Firebase Auth user (server-side — bypasses client auth restrictions)
    let uid: string;
    try {
      const newUser = await adminAuth.createUser({
        email: trimmedEmail,
        password,
        displayName: trimmedName,
        emailVerified: true, // They arrived via email link, so email is verified
      });
      uid = newUser.uid;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-exists') {
        // Account already exists — update password + name
        const existing = await adminAuth.getUserByEmail(trimmedEmail);
        uid = existing.uid;
        await adminAuth.updateUser(uid, {
          password,
          displayName: trimmedName,
          emailVerified: true,
        });
      } else {
        throw err;
      }
    }

    // 4. Set role as a custom claim so client/rules can read it from the token
    await adminAuth.setCustomUserClaims(uid, { role });

    // 5. Write user profile to Firestore 'users' collection
    const nameParts = trimmedName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    await adminDb.collection('users').doc(uid).set(
      {
        uid,
        email: trimmedEmail,
        name: trimmedName,
        firstName,
        lastName,
        role,
        status: 'active',
        createdAt: Timestamp.now(),
        inviteId: inviteDoc.id,
      },
      { merge: true } // safe if doc already partially exists
    );

    // 6. Mark invite as accepted
    await inviteDoc.ref.update({
      status: 'accepted',
      acceptedAt: Timestamp.now(),
      uid,
    });

    // 7. Return a custom token so the client can sign in immediately
    const customToken = await adminAuth.createCustomToken(uid, { role });

    return NextResponse.json({
      success: true,
      customToken,
      role,
      message: 'Account created successfully.',
    });

  } catch (error: unknown) {
    console.error('[/api/invite/accept] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error.' },
      { status: 500 }
    );
  }
}
