"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc,
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, ADMIN_ROLES } from "@/lib/auth-context";
import { Timestamp } from "firebase/firestore";

export interface Timetable {
  id?: string;
  name: string;
  department: string;
  temporalFrame: string;
  size: string;
  status: "Verified" | "Error" | "Pending";
  fileUrl?: string;
  createdAt?: Timestamp;
}

export function useTimetables() {
  const { user, loading: authLoading } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    // Anyone authenticated can read timetables

    const q = query(collection(db, "timetables"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Timetable[];
      setTimetables(list);
      setLoading(false);
    }, (err) => {
      if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
        console.error("useTimetables Error:", err);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const addTimetable = async (data: Omit<Timetable, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "timetables"), {
        ...data,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[useTimetables] Failed to propagate matrix:", err);
      throw err;
    }
  };

  const deleteTimetable = async (id: string) => {
    await deleteDoc(doc(db, "timetables", id));
  };

  return { timetables, loading, addTimetable, deleteTimetable };
}
