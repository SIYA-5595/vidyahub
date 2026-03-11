"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc,
  updateDoc,
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, ADMIN_ROLES } from "@/lib/auth-context";
import { Timestamp } from "firebase/firestore";

export interface ResultRecord {
  id?: string;
  subject: string;
  studentName: string;
  studentId: string;
  marks: number;
  maxMarks: number;
  status: "Validated" | "Pending";
  department: string;
  batch: string;
  createdAt?: Timestamp;
}

export function useResults() {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    // Permission Guard
    if (!ADMIN_ROLES.includes(user.role)) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ResultRecord[];
      setResults(list);
      setLoading(false);
    }, (err) => {
      if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
        console.error("useResults Error:", err);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const addResult = async (data: Omit<ResultRecord, "id" | "createdAt" | "status">) => {
    try {
      await addDoc(collection(db, "results"), {
        ...data,
        status: "Validated",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[useResults] Failed to manifest result:", err);
      throw err;
    }
  };

  const updateResultMarks = async (id: string, marks: number) => {
    try {
      const ref = doc(db, "results", id);
      await updateDoc(ref, { marks, status: "Validated" });
    } catch (err) {
      console.error("[useResults] Failed to update result marks:", err);
      throw err;
    }
  };

  const deleteResult = async (id: string) => {
    await deleteDoc(doc(db, "results", id));
  };

  return { results, loading, addResult, updateResultMarks, deleteResult };
}
