"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, ADMIN_ROLES } from "@/lib/auth-context";

export function useDashboardStats() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    announcements: 0,
    assignments: 0,
    requests: 0,
    timetables: 0,
    loading: true
  });

  useEffect(() => {
    // Only start listeners if auth is finished and we have a user
    if (authLoading || !user) {
      if (!authLoading && !user) setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    // Anyone authenticated can probe basic counts
    if (!user) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const collections = ["students", "announcements", "assignments", "requests", "timetables"];
    const unsubscribes: (() => void)[] = [];

    collections.forEach((colName) => {
      const q = query(collection(db, colName));
      const unsub = onSnapshot(q, (snapshot) => {
        setStats(prev => ({
          ...prev,
          [colName]: snapshot.size,
          loading: false
        }));
      }, (err) => {
        // Silently handle permission errors if they occur during role transitions
        if (err.code !== 'permission-denied' && !err.message.toLowerCase().includes("permission")) {
          console.error(`Error fetching ${colName} count:`, err);
        }
        setStats(prev => ({ ...prev, loading: false }));
      });
      unsubscribes.push(unsub);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, authLoading]);

  return stats;
}
