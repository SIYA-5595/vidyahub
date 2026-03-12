"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
<<<<<<< HEAD
  limit,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  tag: string;
  createdAt: Timestamp | null;
}

export function useAnnouncements(maxItems: number = 5) {
=======
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, ADMIN_ROLES } from "@/lib/auth-context";

import { Timestamp } from "firebase/firestore";

export interface Announcement {
  id?: string;
  title: string;
  message: string;
  tag: string;
  createdAt?: Timestamp;
}

export function useAnnouncements(limitCount: number = 0) {
  const { user, loading: authLoading } = useAuth();
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    const q = query(
      collection(db, "announcements"), 
      orderBy("createdAt", "desc"), 
      limit(maxItems)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching announcements:", error);
=======
    if (authLoading || !user) return;

    // Permission Guard
    if (!ADMIN_ROLES.includes(user.role)) {
      setLoading(false);
      return;
    }

    let q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    
    if (limitCount > 0) {
      q = query(q, limit(limitCount));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(announcementList);
      setLoading(false);
    }, (err) => {
      if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
        console.error("Error fetching announcements:", err);
      }
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
      setLoading(false);
    });

    return () => unsubscribe();
<<<<<<< HEAD
  }, [maxItems]);

  return { announcements, loading };
=======
  }, [limitCount, user, authLoading]);

  const postAnnouncement = async (announcement: Omit<Announcement, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "announcements"), {
        ...announcement,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[useAnnouncements] Failed to post announcement:", err);
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const announcementRef = doc(db, "announcements", id);
    await deleteDoc(announcementRef);
  };

  return { announcements, loading, postAnnouncement, deleteAnnouncement };
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
}
