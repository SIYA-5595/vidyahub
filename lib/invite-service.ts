"use client";

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "./firebase";

// We'll define the invite structure
export interface AdminInvite {
  id: string; // The token
  email: string;
  role: "admin";
  invitedBy: string;
  expiresAt: Timestamp;
  used: boolean;
  createdAt: Timestamp;
}

/**
 * Generates a secure invite token and stores it in Firestore.
 */
export async function createAdminInvite(email: string, adminUid: string) {
  // Check if an active invite already exists for this email
  const invitesRef = collection(db, "admin_invites");
  const q = query(invitesRef, where("email", "==", email), where("used", "==", false));
  const existing = await getDocs(q);
  
  if (!existing.empty) {
    // Optionally delete old ones or throw error
    console.log("Active invite already exists for this email.");
  }

  // Generate a random token
  // If nanoid isn't installed, we use a fallback
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

  const inviteData = {
    email,
    role: "admin",
    invitedBy: adminUid,
    expiresAt: Timestamp.fromDate(expiresAt),
    used: false,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "admin_invites", token), inviteData);

  return { token, ...inviteData };
}

/**
 * Verifies if a token is valid, not used, and not expired.
 */
export async function verifyInviteToken(token: string) {
  const docRef = doc(db, "admin_invites", token);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Invalid invitation token.");
  }

  const data = docSnap.data() as AdminInvite;

  if (data.used) {
    throw new Error("This invitation has already been used.");
  }

  const now = new Date();
  if (data.expiresAt.toDate() < now) {
    throw new Error("This invitation has expired.");
  }

  return data;
}

/**
 * Marks a token as used.
 */
export async function markInviteAsUsed(token: string) {
  const docRef = doc(db, "admin_invites", token);
  await updateDoc(docRef, {
    used: true,
    usedAt: serverTimestamp()
  });
}
