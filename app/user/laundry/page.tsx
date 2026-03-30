"use client";

import { useState, useEffect } from "react";
import {
  Shirt,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Zap,
  Globe,
  PlusCircle,
  Activity,
  Box,
  Flame,
  ArrowRight,
  ShieldCheck,
  ChevronRight as ChevronRightIcon,
  RotateCcw,
  Sparkles
} from "lucide-react";

import { laundrySlots } from "@/data/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const months = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

export default function LaundryBooking() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);

  // Listen for bookings on the selected date
  useEffect(() => {
    const q = query(
      collection(db, "laundry-bookings"),
      where("date", "==", selectedDate.toLocaleDateString())
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookedIds = snapshot.docs.map(doc => doc.data().slotId);
      setBookedSlots(bookedIds);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleReservation = async () => {
    if (!selectedSlot || !user) {
      toast.error("User node authentication required for sanitation authorization");
      return;
    }

    if (bookedSlots.includes(selectedSlot)) {
      toast.error("Temporal segment already claimed by another node");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const slot = laundrySlots.find(s => s.id === selectedSlot);
      await addDoc(collection(db, "laundry-bookings"), {
        userId: user.uid,
        userName: `${user.firstName} ${user.lastName}`,
        date: selectedDate.toLocaleDateString(),
        slotId: selectedSlot,
        time: slot?.time,
        createdAt: serverTimestamp(),
      });
      toast.success("Sanitation cycle successfully authorized in matrix");
      setSelectedSlot(null);
    } catch {
      toast.error("Authorization sequence failed // Nodal error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.unshift(new Date(year, month, -i));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    while (days.length < 42) {
      days.push(new Date(year, month + 1, days.length - lastDay.getDate()));
    }

    return days;
  };

  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (dir === "prev" ? -1 : 1));
      return newMonth;
    });
  };

  const isToday = (d: Date) =>
    d.toDateString() === new Date().toDateString();

  const isSelected = (d: Date) =>
    d.toDateString() === selectedDate.toDateString();

  const isCurrentMonth = (d: Date) =>
    d.getMonth() === currentMonth.getMonth();

  return (
    <PageHeader
      title="Temporal Cleansing"
      description="Orchestrate institutional sanitation cycles through advance reservation of laundry asset nodes"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
          <Badge className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-6 h-11 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest italic shadow-inner">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            Operational Capacity Active
          </Badge>
          <div className="w-11 h-11 bg-background/40 border border-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Shirt className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      }
    >
      <div className="grid lg:grid-cols-12 gap-16">
        {/* CALENDAR */}
        <div className="lg:col-span-8 space-y-12">
          <Card className="rounded-[4.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="p-16 pb-8 flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
              <div className="space-y-4">
                 <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none flex items-center gap-8">
                   <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                      <Calendar size={40} className="text-primary group-hover:scale-110 transition-transform" />
                   </div>
                   Temporal Selection
                 </CardTitle>
                 <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[112px] italic leading-none">Identify acquisition date for sanitation protocol</p>
              </div>
              <div className="flex items-center gap-6 bg-background/40 p-3 rounded-[2.5rem] border border-white/5 shadow-inner relative group/nav">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 transition-all shadow-sm border border-white/5 group-hover/nav:-translate-x-2">
                  <ChevronLeft size={24} className="text-primary" />
                </Button>
                <div className="px-10 font-black uppercase text-[12px] tracking-[0.4em] text-foreground min-w-[240px] text-center italic leading-none">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 transition-all shadow-sm border border-white/5 group-hover/nav:translate-x-2">
                  <ChevronRight size={24} className="text-primary" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-16 pt-4 relative z-10">
              {/* WEEK DAYS */}
              <div className="grid grid-cols-7 gap-6 mb-12">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">
                    {d}
                  </div>
                ))}
              </div>

              {/* DATE GRID */}
              <div className="grid grid-cols-7 gap-6">
                {getDaysInMonth(currentMonth).map((date, i) => (
                  <button
                    key={i}
                    disabled={!isCurrentMonth(date)}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-[2rem] text-lg font-black transition-all duration-700 relative group/date flex items-center justify-center border border-transparent overflow-hidden
                      ${isSelected(date) 
                        ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 scale-110 z-10 border-primary" 
                        : "hover:bg-background/80 hover:border-white/5 text-foreground/40 hover:text-foreground"}
                      ${isToday(date) && !isSelected(date) ? "bg-background/40 border-primary/20 shadow-inner" : ""}
                      ${!isCurrentMonth(date) ? "opacity-0 pointer-events-none" : ""}
                    `}
                  >
                    <span className="relative z-10 italic">{date.getDate()}</span>
                    {isToday(date) && !isSelected(date) && (
                      <div className="absolute bottom-4 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(30,136,229,0.8)]" />
                    )}
                    {isSelected(date) && (
                      <div className="absolute inset-0 bg-white/10 animate-shimmer pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SLOTS */}
        <div className="lg:col-span-4 space-y-12">
          <Card className="rounded-[4.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden h-full flex flex-col group hover:shadow-premium-hover transition-all duration-700 relative">
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-shimmer pointer-events-none" />
            <CardHeader className="p-16 pb-8 relative z-10">
              <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-primary flex items-center gap-6 leading-none">
                <div className="w-16 h-16 rounded-[1.75rem] bg-background/50 flex items-center justify-center border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                   <Clock size={32} />
                </div>
                Logic Slots
              </CardTitle>
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-[88px] italic leading-none">Synchronize interval for sanitation</p>
            </CardHeader>

            <CardContent className="p-12 pt-4 space-y-6 flex-grow relative z-10">
              <div className="space-y-6">
                {laundrySlots.map((slot, idx) => {
                  const isBooked = bookedSlots.includes(slot.id);
                  const isAvailable = slot.available && !isBooked;

                  return (
                    <motion.button
                      key={slot.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full p-8 rounded-[2.5rem] flex justify-between items-center transition-all duration-700 border-2 shadow-inner group/slot
                        ${isAvailable
                          ? "bg-background/40 border-white/5 hover:bg-background/80 hover:border-primary/20 hover:-translate-y-2"
                          : "bg-background/10 border-transparent opacity-20 cursor-not-allowed"}
                        ${selectedSlot === slot.id
                          ? "bg-primary/10 border-primary shadow-2xl ring-4 ring-primary/10"
                          : ""}
                      `}
                    >
                      <div className="space-y-1 text-left">
                         <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic leading-none opacity-40 ml-1">Interval ID: #{slot.id}</p>
                         <span className={`font-black italic text-3xl uppercase tracking-tighter leading-none ${selectedSlot === slot.id ? 'text-primary' : 'text-foreground'}`}>{slot.time}</span>
                      </div>
                      <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 shadow-inner ${isAvailable ? 'bg-emerald-500/10 text-emerald-500 group-hover/slot:bg-emerald-500 group-hover/slot:text-white group-hover/slot:rotate-12' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isAvailable ? (
                          <Check size={28} />
                        ) : (
                          <X size={28} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>

            <div className="p-16 pt-0 relative z-10">
                <Button 
                  disabled={!selectedSlot || isSubmitting}
                  onClick={handleReservation}
                  className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/reserve"
                >
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                  {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : (
                    <div className="flex items-center justify-center gap-6">
                      <Shirt size={32} className="group-hover/reserve:rotate-12 group-hover/reserve:scale-110 transition-transform duration-700" />
                      INITIATE RESERVATION // SYNC
                    </div>
                  )}
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageHeader>
  );
}
