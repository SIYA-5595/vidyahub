"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, ADMIN_ROLES } from "@/lib/auth-context";
import { Timestamp } from "firebase/firestore";

export interface RequestItem {
  id?: string;
  studentName: string;
  studentId: string;
  type: string;
  subject: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: Timestamp;
}

export function useRequests() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    // Permission Guard
    if (!ADMIN_ROLES.includes(user.role)) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RequestItem[];
      setRequests(list);
      setLoading(false);
    }, (err) => {
      if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
        console.error("useRequests Error:", err);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const updateRequestStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const ref = doc(db, "requests", id);
      await updateDoc(ref, { status });
    } catch (err) {
      console.error("[useRequests] Failed to update request status:", err);
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    await deleteDoc(doc(db, "requests", id));
  };

  return { requests, loading, updateRequestStatus, deleteRequest };
}
