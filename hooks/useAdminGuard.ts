"use client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useAdminGuard() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.data()?.role !== "admin") {
          router.push("/login");
        }
      } catch (err: any) {
        const isOffline = err.code === 'unavailable' || err.message?.toLowerCase().includes("offline");
        if (!isOffline && err.code !== 'permission-denied') {
          console.error("[useAdminGuard] Error:", err);
          router.push("/login");
        }
        // If offline, we might want to let the session continue if data is in cache
      }
    });

    return () => unsub();
  }, [router]);
}
