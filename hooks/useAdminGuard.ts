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

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.data()?.role !== "admin") {
        router.push("/login");
      }
    });

    return () => unsub();
  }, [router]);
}
