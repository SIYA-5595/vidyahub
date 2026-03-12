"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc,
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth, ADMIN_ROLES } from "@/lib/auth-context";

import { Timestamp } from "firebase/firestore";

export interface Student {
  id?: string;
  name: string;
  email: string;
  roll: string;
  department: string;
  status: "Active" | "Probation" | "Suspended";
  createdAt?: Timestamp;
}

export function useStudents() {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    
    // Permission Guard
    if (!ADMIN_ROLES.includes(user.role)) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentList);
      setLoading(false);
    }, (err) => {
      // Quench permission errors to keep console clean
      if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
        console.error("useStudents Error:", err);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const addStudent = async (student: Omit<Student, "id" | "createdAt">) => {
    try {
      const currentToken = await auth.currentUser?.getIdToken();
      console.log("[useStudents] Session Probe:", {
        uid: auth.currentUser?.uid || "NO_USER",
        hasToken: !!currentToken,
        projectId: (db as any)._databaseId?.projectId || "N/A"
      });
      
      console.log("[useStudents] Initializing setDoc on manifest:", student);
      // use doc(collection()) to pre-generate the ID, then use setDoc
      const newDocRef = doc(collection(db, "students"));
      
      const studentData = {
        name: student.name || "",
        email: student.email || "",
        roll: student.roll || "",
        department: student.department || "Architecture",
        status: student.status || "Active",
        createdAt: serverTimestamp(),
      };
      
      await setDoc(newDocRef, studentData);
      console.log("[useStudents] Propagated with ID:", newDocRef.id);
    } catch (err: any) {
      console.error("[useStudents] Failed to add student:", err);
      if (err.code === "permission-denied") {
        console.warn("[Firebase] Insufficient permissions. Check if rules are Published (blue bar) in the console.");
        console.log("Full Error Context:", err);
      }
      throw err;
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    const studentRef = doc(db, "students", id);
    await updateDoc(studentRef, student);
  };

  const deleteStudent = async (id: string) => {
    const studentRef = doc(db, "students", id);
    await deleteDoc(studentRef);
  };

  return { students, loading, addStudent, updateStudent, deleteStudent };
}
