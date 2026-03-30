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
} from "lucide-react";

import { laundrySlots } from "@/data/mockData";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";


const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
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
      toast.error("User node authentication required");
      return;
    }

    if (bookedSlots.includes(selectedSlot)) {
      toast.error("Temporal segment already claimed");
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
      toast.success("Sanitation cycle authorized successfully");
      setSelectedSlot(null);
    } catch {
      toast.error("Authorization failed");
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
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          <Badge className="bg-emerald-500/20 text-emerald-100 border-0 px-6 h-10 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Operational Capacity Active
          </Badge>
        </div>
      }
    >
      <div className="grid lg:grid-cols-12 gap-12">
        {/* CALENDAR */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <CardHeader className="p-10 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4 text-gray-900">
                   <Calendar className="w-8 h-8 text-primary" />
                   Temporal Selection
                 </CardTitle>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-12">Identify acquisition date</p>
              </div>
              <div className="flex items-center gap-3 bg-secondary/10 p-2 rounded-2xl">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-10 w-10 rounded-xl hover:bg-white transition-all shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="px-6 font-black uppercase text-[10px] tracking-[0.2em] text-primary min-w-[160px] text-center italic">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-10 w-10 rounded-xl hover:bg-white transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-4">
              {/* WEEK DAYS */}
              <div className="grid grid-cols-7 gap-6 mb-8">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 italic">
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
                    className={`aspect-square rounded-[1.5rem] text-sm font-black transition-all duration-500 relative group flex items-center justify-center
                      ${isSelected(date) 
                        ? "bg-primary text-white shadow-2xl shadow-primary/40 scale-110 z-10" 
                        : "hover:bg-secondary/20 text-gray-600"}
                      ${isToday(date) && !isSelected(date) ? "ring-2 ring-primary ring-offset-8 ring-offset-white ring-inset shadow-xl" : ""}
                      ${!isCurrentMonth(date) ? "opacity-5 pointer-events-none" : ""}
                    `}
                  >
                    {date.getDate()}
                    {isToday(date) && !isSelected(date) && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SLOTS */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[3rem] border-0 shadow-sm bg-secondary/10 overflow-hidden h-full flex flex-col group hover:shadow-2xl transition-all duration-700">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4 text-primary">
                <Clock className="w-8 h-8" />
                Logic Slots
              </CardTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Synchronize interval</p>
            </CardHeader>

            <CardContent className="p-10 pt-4 space-y-6 flex-grow">
              <div className="space-y-4">
                {laundrySlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot.id);
                  const isAvailable = slot.available && !isBooked;

                  return (
                    <button
                      key={slot.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full p-6 rounded-[2rem] flex justify-between items-center transition-all duration-500 border-0 shadow-sm
                        ${isAvailable
                          ? "bg-white hover:shadow-xl hover:-translate-y-1"
                          : "bg-gray-200/50 opacity-20 cursor-not-allowed"}
                        ${selectedSlot === slot.id
                          ? "ring-4 ring-primary/20 bg-primary/5 shadow-2xl"
                          : ""}
                      `}
                    >
                      <span className={`font-black italic text-xl uppercase tracking-tighter ${selectedSlot === slot.id ? 'text-primary' : 'text-gray-900'}`}>{slot.time}</span>
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isAvailable ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <X className="w-6 h-6" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>

            <div className="p-10 pt-0">
                <Button 
                  disabled={!selectedSlot || isSubmitting}
                  onClick={handleReservation}
                  className="w-full h-20 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black italic tracking-tight text-xl shadow-2xl shadow-primary/30 disabled:opacity-20 disabled:shadow-none transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto text-white" /> : (
                    <>
                      <Shirt className="mr-4 w-7 h-7 group-hover:rotate-12 transition-transform" />
                      INITIATE RESERVATION
                    </>
                  )}
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageHeader>
  );
}
