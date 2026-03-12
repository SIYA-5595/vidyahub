"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  saveCredentials: (creds: { email: string; password?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const saveCredentials = (creds: { email: string; password?: string }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vidyahub_pending_login", JSON.stringify(creds));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
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
          setUser(null);
        }
      } else {
        setUser(null);
        // Clear cookie for middleware protection
        if (typeof document !== "undefined") {
          document.cookie = "login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        // Protect all routes except login/signup/reset
        if (pathname !== "/login" && pathname !== "/signup" && !pathname.includes("/reset-password") && pathname !== "/") {
          router.replace("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
