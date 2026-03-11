"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth, ADMIN_ROLES } from "@/lib/auth-context";

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "student";
  status: "active" | "blocked";
  createdAt: Timestamp | null;
}

// Config for secondary auth instance to prevent session logout during user creation
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export interface AddUserData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "student";
}

export function useUsers() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    // Permission Guard: Only admins should see the full registry
    if (!ADMIN_ROLES.includes(user.role)) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const usersList: UserData[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            name: data.name || "Anonymous",
            email: data.email || "No Email",
            role: data.role || "student",
            status: data.status || "active",
            createdAt: data.createdAt,
          } as UserData;
        });
        setUsers(usersList);
        setLoading(false);
      },
      (err) => {
        if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
          console.error("useUsers Error:", err);
          setError(err);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  // Admin Actions
  const addUser = async (data: AddUserData) => {
    try {
      // We use a secondary auth instance to create a user without logging out the current admin
      const secondaryApp = !getApps().find(app => app.name === 'Secondary') 
        ? initializeApp(firebaseConfig, 'Secondary') 
        : getApp('Secondary');
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, { displayName: data.name });
      
      await setDoc(doc(db, "users", newUser.uid), {
        name: data.name,
        email: data.email,
        role: data.role,
        status: "active",
        createdAt: serverTimestamp(),
      });

      // Sign out from the secondary instance to clean up
      await secondaryAuth.signOut();
    } catch (err) {
      console.error("[useUsers] Failed to add user:", err);
      throw err;
    }
  };

  const updateUser = async (uid: string, data: Partial<UserData>) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, data);
    } catch (err) {
      console.error("[useUsers] Failed to update user:", err);
      throw err;
    }
  };

  const blockUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { status: "blocked" });
    } catch (err) {
      console.error("[useUsers] Failed to block user:", err);
      throw err;
    }
  };

  const unblockUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { status: "active" });
    } catch (err) {
      console.error("[useUsers] Failed to unblock user:", err);
      throw err;
    }
  };

  const deleteUser = async (uid: string) => {
    await deleteDoc(doc(db, "users", uid));
    // Auth deletion handled by Admin SDK ordinarily, on client we just purge DB entry
  };

  return { 
    users, 
    loading, 
    error,
    addUser,
    updateUser,
    blockUser,
    unblockUser,
    deleteUser
  };
}
