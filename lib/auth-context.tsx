"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
<<<<<<< HEAD
import { 
  onAuthStateChanged, 
  signOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  uid: string;
  role: string;
=======
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
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
<<<<<<< HEAD
  saveCredentials: (creds: { email: string; password?: string }) => void;
}

=======
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ADMIN_ROLES = ["super_admin", "department_admin", "admin"];

// Routes that do NOT require authentication
const PUBLIC_PATHS = ["/login", "/accept-invite"];

// ─── Context ──────────────────────────────────────────────────────────────────

>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

<<<<<<< HEAD
  const saveCredentials = (creds: { email: string; password?: string }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vidyahub_pending_login", JSON.stringify(creds));
    }
  };

=======
  // ── Listen to Firebase Auth state ───────────────────────────────────────────
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
<<<<<<< HEAD
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || "student";
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              firstName: userData.firstName || userData.name?.split(' ')[0] || "User",
              lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || "",
              profileImage: userData.profileImage || "",
              role: role,
            });

            // Set cookie for middleware protection
            document.cookie = "login=true; path=/; max-age=86400; SameSite=Lax";

            // Redirect logic if on login page
            if (pathname === "/login" || pathname === "/signup") {
              router.replace("/dashboard");
            }
          } else {
            setUser(null);
            if (pathname !== "/login" && pathname !== "/signup" && !pathname.includes("/reset-password")) {
              router.push("/login");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
=======
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
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
          setUser(null);
        }
      } else {
        setUser(null);
<<<<<<< HEAD
        // Clear cookie for middleware protection
        if (typeof document !== "undefined") {
          document.cookie = "login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        // Protect all routes except login/signup/reset
        if (pathname !== "/login" && pathname !== "/signup" && !pathname.includes("/reset-password") && pathname !== "/") {
          router.replace("/login");
        }
=======
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
      }
      setLoading(false);
    });

    return () => unsubscribe();
<<<<<<< HEAD
  }, [router, pathname]);

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, saveCredentials }}>
=======
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
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
<<<<<<< HEAD
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
=======
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
}
