"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [maxItems]);

  return { announcements, loading };
}
