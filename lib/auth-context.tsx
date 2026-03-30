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
<<<<<<< HEAD
=======
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
              const isOffline = error.code === 'unavailable' || error.message?.toLowerCase().includes("offline");
              
              if ((error.code === 'permission-denied' || isOffline) && retries > 1) {
                console.warn(`[auth-context] ${isOffline ? 'Offline' : 'Permission'} issue, retrying (${4 - retries}/3)...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for offline
                retries--;
              } else {
                throw error;
              }
            }
          }

          if (userDoc?.exists()) {
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
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
<<<<<<< HEAD
        } catch (error) {
          console.error("[auth-context] Error fetching user data:", error);
=======
        } catch (error: any) {
          // Graceful handling of offline/permission errors
          const isOffline = error.code === 'unavailable' || error.message?.toLowerCase().includes("offline");
          if (error.code !== 'permission-denied' && !isOffline) {
            console.error("[auth-context] Error fetching user data:", error);
          } else if (isOffline) {
            console.warn("[auth-context] Working in offline mode.");
            // We could potentially set a 'guest' user or just keep it null
          }
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
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
