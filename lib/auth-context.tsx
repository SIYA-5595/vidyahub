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
      setLoading(true);
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
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

            // Set cookie for middleware
            document.cookie = `auth_token=${firebaseUser.uid}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `user_role=${ADMIN_ROLES.includes(role) ? "admin" : "student"}; path=/; max-age=86400; SameSite=Lax`;
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("[auth-context] Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
        // Clear cookies
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Route redirection logic ──────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);
    const isAdminRoute = pathname.startsWith("/admin");
    const isUserRoute = pathname.startsWith("/user");
    const isRoot = pathname === "/";

    // 1. Not Logged In - Redirect from protected routes
    if (!user) {
      if (isAdminRoute || isUserRoute) {
        router.replace("/login");
      }
      return;
    }

    if (isAuthPage || isRoot) {
      router.replace("/user/dashboard");
      return;
    }

  }, [user, loading, pathname, router]);

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("[auth-context] Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
