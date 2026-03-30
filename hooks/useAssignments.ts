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

export interface Assignment {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  department: string;
  status: "Active" | "Closed" | "Draft";
  createdAt?: Timestamp;
}

export function useAssignments() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    // Anyone authenticated can read assignments

    const q = query(collection(db, "assignments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Assignment[];
      setAssignments(list);
      setLoading(false);
    }, (err) => {
      if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
        console.error("useAssignments Error:", err);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const addAssignment = async (data: Omit<Assignment, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "assignments"), {
        ...data,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[useAssignments] Failed to add assignment:", err);
      throw err;
    }
  };

  const updateAssignment = async (id: string, data: Partial<Assignment>) => {
    const ref = doc(db, "assignments", id);
    await updateDoc(ref, data);
  };

  const deleteAssignment = async (id: string) => {
    await deleteDoc(doc(db, "assignments", id));
  };

  return { assignments, loading, addAssignment, updateAssignment, deleteAssignment };
}
