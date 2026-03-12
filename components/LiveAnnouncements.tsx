"use client";

import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Megaphone, Bell, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function LiveAnnouncements() {
  const { announcements, loading } = useAnnouncements(3);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-secondary/5 rounded-3xl border border-secondary/10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="p-8 text-center bg-secondary/5 rounded-3xl border border-secondary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No active transmissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="group relative flex flex-col gap-3 p-6 bg-white rounded-3xl border border-secondary/10 hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Megaphone className="h-4 w-4" />
              </div>
              <Badge className={`${item.tag === 'Global Sync' ? 'bg-primary/10 text-primary' : 'bg-rose-100 text-rose-600'} border-0 h-5 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest`}>
                {item.tag}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : "Recent"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-black italic tracking-tight text-gray-900 uppercase">{item.title}</h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
              {item.message}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
