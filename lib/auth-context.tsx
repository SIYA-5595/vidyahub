"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ADMIN_ROLES = ["super_admin", "department_admin", "admin"];

// Routes that do NOT require authentication
const PUBLIC_PATHS = ["/login", "/accept-invite"];

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ── Listen to Firebase Auth state ───────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Retry logic for Firestore document fetch (helps with propagation delays)
          let userDoc = null;
          let retries = 3;
          while (retries > 0) {
            try {
              userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              break; 
            } catch (error: any) {
              if (error.code === 'permission-denied' && retries > 1) {
                console.warn(`[auth-context] Retrying user doc fetch (${4 - retries}/3)...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                retries--;
              } else {
                throw error;
              }
            }
          }

          if (userDoc?.exists()) {
            const data = userDoc.data();
            const role = data.role || "student";
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: data.name || data.firstName || "User",
              firstName: data.firstName || data.name?.split(" ")[0] || "User",
              lastName: data.lastName || data.name?.split(" ").slice(1).join(" ") || "",
              profileImage: data.profileImage || "",
              role,
            });
          } else {
            console.warn("[auth-context] No Firestore user doc for:", firebaseUser.uid);
            setUser(null);
          }
        } catch (error: any) {
          // Silent permission denied to keep console clean
          if (error.code !== 'permission-denied') {
            console.error("[auth-context] Error fetching user data:", error);
          }
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Route guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const isAdminRoute = pathname.startsWith("/admin");
    const isStudentRoute = pathname.startsWith("/student");
    const isLogin = pathname === "/login";
    const isAcceptInvite = pathname.startsWith("/accept-invite");
    const isRoot = pathname === "/";

    if (!user) {
      // Unauthenticated: protect private routes
      if (isAdminRoute || isStudentRoute || isRoot) {
        router.replace("/login");
      }
      return;
    }

    const isAdmin = ADMIN_ROLES.includes(user.role);

    // Authenticated users should not be on the login page or root
    if (isLogin || isRoot) {
      router.replace(isAdmin ? "/admin/dashboard" : "/student/dashboard");
      return;
    }

    // Role-based route enforcement
    if (isAdminRoute && !isAdmin) {
      router.replace("/student/dashboard");
    } else if (isStudentRoute && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [user, loading, pathname, router]);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
