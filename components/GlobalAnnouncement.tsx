 "use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { Megaphone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  id: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  createdAt: { seconds: number; nanoseconds: number } | null;
}

export function GlobalAnnouncement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc"),
      limit(1),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Announcement[];
      setAnnouncements(data);
    });

    return () => unsubscribe();
  }, []);

  if (announcements.length === 0 || !isVisible) return null;

  const announcement = announcements[0];

  return (
    <AnimatePresence>
      <div className="contents">
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/5 backdrop-blur-[3px] pointer-events-none"
        />
        
        {/* Announcement Box */}
        <motion.div
          initial={{ y: -100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: -100, opacity: 0, x: "-50%" }}
          className="fixed top-8 left-1/2 z-[101] w-full max-w-3xl px-6"
        >
          <div className="bg-white/95 backdrop-blur-2xl border-2 border-primary/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-6 pr-8 flex items-center justify-between gap-8 overflow-hidden relative group">
            {/* Animated background detail */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl transition-all duration-1000 group-hover:bg-primary/10" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-xl shadow-primary/30 shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Megaphone className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                   <Badge className="bg-primary/10 text-primary border-0 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5">Systems Broadcast</Badge>
                   <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Priority Alpha</span>
                </div>
                <p className="text-lg font-black italic tracking-tight text-gray-900 leading-tight uppercase">
                  {announcement.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="h-12 w-12 rounded-2xl hover:bg-black/5 flex items-center justify-center transition-all shrink-0 active:scale-90 group/close relative z-10"
            >
              <X className="h-6 w-6 text-muted-foreground group-hover/close:text-gray-900 group-hover/close:rotate-90 transition-all duration-500" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Sub-component Helper
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center font-bold ${className}`}>
      {children}
    </span>
  );
}
