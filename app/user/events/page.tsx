"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Plus,
  Zap,
  Globe,
  Trophy,
  ShieldCheck,
  Activity,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Users
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

/* ------------------------- */

type EventType = "fest" | "cultural" | "technical" | "networking";

const eventTypeColors: Record<EventType, string> & { [key: string]: string } = {
  fest: "from-primary to-blue-600",
  cultural: "from-purple-500 to-indigo-600",
  technical: "from-emerald-500 to-teal-600",
  networking: "from-orange-500 to-amber-600",
};

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  type: EventType;
  tickets: number;
  sold: number;
}

/* ------------------------- */

export default function EventsPage() {
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    venue: "",
    type: "fest" as EventType,
    tickets: 100,
    sold: 0
  });

  // Real-time listener for events
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEventsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.venue) {
      toast.error("Manifest requires nomenclature, temporal slot and sector parameters");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "events"), {
        ...newEvent,
        title: newEvent.title.toUpperCase(),
        venue: newEvent.venue.toUpperCase(),
        createdAt: serverTimestamp()
      });
      setNewEvent({ title: "", date: "", venue: "", type: "fest", tickets: 100, sold: 0 });
      setShowAddForm(false);
      toast.success("New event manifestation successfully broadcast to the collective");
    } catch {
      toast.error("Event manifestation failed // Sync error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcquisition = async () => {
    if (!selectedEvent || !user) {
      toast.error("Authentication node required for asset acquisition");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "event-bookings"), {
        userId: user.uid,
        userName: `${user.firstName} ${user.lastName}`,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        ticketCount,
        totalAmount: ticketCount * 25,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });
      toast.success("Access Node Synchronized // Acquisition Manifest Generated");
      setIsDialogOpen(false);
    } catch {
      toast.error("Asset acquisition failed // Signal error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageHeader
      title="Institutional Catalyst"
      description="Access the primary node for high-velocity campus collective interactions and cultural syntheses"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/30 border-none transition-all active:scale-95 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
            <PlusCircle className={`w-5 h-5 transition-transform duration-700 ${showAddForm ? "rotate-45" : ""}`} />
            {showAddForm ? "CLOSE ARCHIVE" : "INITIATE EVENT"}
          </Button>
          <Badge className="bg-background/40 text-primary border border-white/5 px-8 h-11 rounded-xl flex items-center gap-4 font-black text-[10px] uppercase tracking-widest italic shadow-inner">
            <Sparkles size={16} className="text-primary animate-pulse" />
            {eventsList.length} ACTIVE MANIFESTATIONS
          </Badge>
        </div>
      }
    >
      <div className="space-y-16">
        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
               <Card className="rounded-[4.5rem] border border-white/5 shadow-premium-hover bg-card/60 backdrop-blur-xl overflow-hidden p-16 space-y-16 transition-all duration-700 relative">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(30,136,229,0.05),transparent_70%)] pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none flex items-center gap-8">
                        <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                           <Trophy size={40} className="text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        Initialize Manifestation
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Execute institutional event manifestation request</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Event Nomenclature</Label>
                        <Input placeholder="E.G. NEURAL NET FEST 2026" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value.toUpperCase()})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Temporal Slot</Label>
                        <div className="relative group/input">
                           <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all [color-scheme:dark]"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Sector (Venue)</Label>
                        <div className="relative group/input">
                           <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input placeholder="E.G. CORE AUDITORIUM" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value.toUpperCase()})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Entity Category</Label>
                        <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})} className="w-full h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 outline-none text-foreground cursor-pointer hover:bg-background/80 transition-all appearance-none">
                           <option value="fest" className="bg-card">FEST NODE</option>
                           <option value="cultural" className="bg-card">CULTURAL NODE</option>
                           <option value="technical" className="bg-card">TECHNICAL NODE</option>
                           <option value="networking" className="bg-card">SYNERGY NODE</option>
                        </select>
                     </div>
                  </div>
                  <Button onClick={addEvent} disabled={isSubmitting} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE MANIFESTATION PROTOCOL // BROADCAST"}
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {eventsList.map((event, index) => {
            const soldPercent = (event.sold / event.tickets) * 100;
            const remaining = event.tickets - event.sold;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -12 }}
              >
                <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 group bg-card/40 backdrop-blur-sm overflow-hidden h-full relative">
                  {/* Visual Header */}
                  <div className={`h-64 relative overflow-hidden`}>
                     <div className={`absolute inset-0 bg-gradient-to-br ${eventTypeColors[event.type]} transition-transform duration-700 group-hover:scale-110`} />
                     <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_0%_0%,white_0%,transparent_50%)]" />
                     <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                     
                     <div className="absolute inset-12 flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                           <Badge className="bg-white/20 backdrop-blur-md border-white/20 text-[10px] font-black uppercase tracking-[0.3em] px-5 h-9 rounded-xl italic">
                             {event.type} NODE
                           </Badge>
                           <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                              <Ticket size={28} className="text-white" />
                           </div>
                        </div>

                        <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none transform group-hover:translate-x-4 transition-transform duration-700">
                          {event.title}
                        </h3>
                     </div>
                  </div>

                  <CardContent className="p-12 space-y-12 relative z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(30,136,229,0.03),transparent_70%)] h-full flex flex-col">
                    {/* Info Matrix */}
                    <div className="grid grid-cols-2 gap-10 pb-10 border-b border-white/5">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] opacity-40 italic leading-none">Temporal</p>
                          <div className="flex items-center gap-4 text-foreground/80 group-hover:text-foreground transition-colors duration-700">
                             <Calendar size={20} className="text-primary opacity-40" />
                             <p className="font-black italic text-lg leading-none">
                                {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                             </p>
                          </div>
                       </div>

                       <div className="space-y-4 text-right">
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] opacity-40 italic leading-none">Sector</p>
                          <div className="flex items-center gap-4 justify-end text-foreground/80 group-hover:text-foreground transition-colors duration-700">
                             <MapPin size={20} className="text-primary opacity-40" />
                             <p className="font-black italic text-lg leading-none truncate">
                                {event.venue.split(' ')[0]}
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <div className="space-y-3">
                           <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic leading-none">Load Factor</p>
                           <p className="text-4xl font-black tracking-tighter italic text-foreground leading-none group-hover:text-primary transition-colors duration-700">{event.sold} <span className="text-[10px] font-black text-muted-foreground/20 tracking-widest uppercase italic">Units Synched</span></p>
                        </div>
                        <Badge className={`rounded-2xl px-5 h-10 text-[10px] font-black uppercase tracking-widest border-none italic shadow-inner ${remaining < 50 ? "bg-rose-500/20 text-rose-500 animate-pulse" : "bg-emerald-500/20 text-emerald-500"}`}>
                          {remaining} Available
                        </Badge>
                      </div>

                      <div className="h-6 w-full bg-background/50 rounded-full overflow-hidden p-1.5 shadow-inner border border-white/5 group-hover:border-white/10 transition-all duration-700">
                         <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: `${soldPercent}%` }}
                           className={`h-full rounded-full shadow-[0_0_20px_rgba(30,136,229,0.3)] bg-gradient-to-r ${eventTypeColors[event.type]}`}
                         />
                      </div>
                    </div>

                    {/* Logic Interface */}
                    <Dialog open={isDialogOpen && selectedEvent?.id === event.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if(open) {
                        setSelectedEvent(event);
                        setTicketCount(1);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full h-20 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:grayscale group/apply relative overflow-hidden border-none mt-auto"
                          disabled={remaining === 0}
                        >
                          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                          {remaining === 0 ? (
                            "Sold Out // Deployment Closed"
                          ) : (
                            <div className="flex items-center justify-center gap-6">
                               <Ticket size={28} className="group-hover/apply:rotate-12 transition-transform duration-500" />
                               SYNCHRONIZE ACCESS NODE // $25
                            </div>
                          )}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="rounded-[5rem] border border-white/10 p-0 overflow-hidden bg-card/90 backdrop-blur-3xl shadow-premium-hover sm:max-w-[700px] outline-none">
                        <div className={`h-10 p-0 bg-gradient-to-r ${eventTypeColors[(selectedEvent?.type as EventType) || 'fest']} animate-shimmer`} />
                        <div className="p-16 space-y-12 relative">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                           
                           <DialogHeader className="relative z-10">
                              <div className="space-y-6">
                                 <DialogTitle className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none flex items-center gap-6">
                                    <ShieldCheck size={56} className="text-primary" /> Access Protocol
                                 </DialogTitle>
                                 <p className="text-[14px] font-black uppercase tracking-[0.6em] text-muted-foreground/40 ml-[80px] italic leading-none">Identity Verification & Access Token Synthesis</p>
                              </div>
                              <div className="pt-10">
                                 <Badge className={`bg-gradient-to-r ${eventTypeColors[(selectedEvent?.type as EventType) || 'fest']} text-white border-none rounded-2xl px-10 h-12 font-black uppercase tracking-widest text-[14px] italic shadow-2xl shadow-primary/20`}>
                                   MANIFEST: {selectedEvent?.title}
                                 </Badge>
                              </div>
                           </DialogHeader>

                           <div className="bg-background/40 backdrop-blur-sm p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-inner relative z-10">
                              <div className="flex justify-between items-center">
                                 <div className="space-y-4">
                                    <Label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Unit Quantity</Label>
                                    <div className="flex items-center gap-4 text-rose-500 font-black italic text-[10px] tracking-widest uppercase">
                                       <Zap size={14} className="animate-pulse" /> LIMIT: 05 UNITS / NODE
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-12 bg-card/60 backdrop-blur-md p-6 rounded-[2.5rem] shadow-premium border border-white/5">
                                    <Button variant="ghost" size="icon" className="h-16 w-16 text-3xl font-black rounded-2xl hover:bg-primary/20 text-primary border border-white/5 shadow-inner transition-all hover:scale-110 active:scale-90" onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}>-</Button>
                                    <span className="text-6xl font-black italic w-20 text-center text-foreground group-hover:scale-125 transition-transform animate-in fade-in zoom-in duration-500">{ticketCount}</span>
                                    <Button variant="ghost" size="icon" className="h-16 w-16 text-3xl font-black rounded-2xl hover:bg-primary/20 text-primary border border-white/5 shadow-inner transition-all hover:scale-110 active:scale-90" onClick={() => setTicketCount(Math.min(5, ticketCount + 1))}>+</Button>
                                 </div>
                              </div>

                              <div className="h-[1.5px] bg-white/5 rounded-full" />

                              <div className="space-y-8">
                                 <div className="flex justify-between items-center px-4">
                                    <span className="text-[12px] font-black uppercase tracking-[0.6em] text-muted-foreground/20 italic">Base Asset Value</span>
                                    <span className="font-black text-2xl italic tracking-tighter text-muted-foreground/40">$25.00</span>
                                 </div>
                                 <div className="flex justify-between items-center px-12 py-8 bg-background/50 rounded-[3rem] border border-primary/20 shadow-inner group hover:border-primary/40 transition-all duration-700 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <span className="text-[14px] font-black uppercase tracking-[0.8em] text-primary/60 italic z-10">Aggregate Debt</span>
                                    <span className="text-7xl font-black italic tracking-tighter text-primary group-hover:scale-110 transition-transform origin-right duration-700 z-10">
                                       ${(ticketCount * 25).toFixed(2)}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <Button 
                              onClick={handleAcquisition} 
                              disabled={isSubmitting} 
                              className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-widest text-[16px] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-primary/40 active:scale-95 transition-all outline-none border-none relative overflow-hidden font-black"
                            >
                               <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                               <div className="flex items-center justify-center gap-8">
                                  {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : (
                                    <>
                                       <Globe size={32} className="animate-spin-slow" />
                                       EXECUTE ASSET ACQUISITION PROTOCOL
                                    </>
                                  )}
                               </div>
                           </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Timeline Sequence */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Global Sequential Log</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Temporal Event Propagation // Sequential Manifest Registry</p>
            </div>
            <Badge className="rounded-2xl h-12 px-10 border border-primary/20 bg-primary/10 text-primary font-black italic uppercase text-[12px] tracking-widest flex items-center shadow-inner">
               <Activity size={18} className="mr-4 animate-pulse" /> Primary Sync Established
            </Badge>
          </div>

          <Card className="rounded-[5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:w-3 transition-all duration-700" />
            <CardContent className="p-16">
              <div className="relative pl-16 space-y-20 border-l-4 border-white/5">
                {eventsList.map((event, i) => (
                  <motion.div 
                    key={event.id} 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="relative group/line"
                  >
                    <div className="absolute -left-[104px] top-10 h-20 w-20 bg-card border-4 border-background rounded-[2rem] flex items-center justify-center transition-all duration-700 group-hover/line:bg-primary group-hover/line:rotate-12 group-hover/line:scale-110 z-10 shadow-premium">
                       <Clock size={32} className="text-primary group-hover/line:text-primary-foreground group-hover/line:-rotate-12 transition-all duration-700" />
                    </div>

                    <div className="p-16 bg-background/40 backdrop-blur-md rounded-[4rem] border border-white/5 hover:border-primary/20 hover:bg-background/80 hover:shadow-2xl transition-all duration-700 relative overflow-hidden shadow-inner flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
                      <div className="absolute top-0 right-0 p-16 opacity-[0.02] scale-150 rotate-12 group-hover/line:rotate-45 transition-transform duration-1000">
                         <Calendar size={180} className="text-primary" />
                      </div>
                      
                      <div className="space-y-6 relative z-10 max-w-2xl">
                        <div className="flex flex-wrap gap-6 items-center">
                           <h4 className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none group-hover/line:text-primary transition-colors duration-700">
                              {event.title}
                           </h4>
                           <Badge className={`bg-gradient-to-r ${eventTypeColors[event.type]} text-white border-none rounded-xl px-5 h-9 font-black uppercase tracking-widest text-[9px] italic shadow-inner`}>
                              {event.type}
                           </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-10">
                           <div className="flex items-center gap-4 text-muted-foreground/40 font-black italic text-[11px] uppercase tracking-widest group-hover/line:text-muted-foreground/60 transition-colors">
                              <MapPin size={18} className="text-primary opacity-30" />
                              TERMINAL: {event.venue}
                           </div>
                           <div className="flex items-center gap-4 text-muted-foreground/40 font-black italic text-[11px] uppercase tracking-widest group-hover/line:text-muted-foreground/60 transition-colors">
                              <Users size={18} className="text-primary opacity-30" />
                              CAPACITY: {event.tickets} UNITS
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-5 relative z-10 w-full xl:w-80 group/date">
                         <p className="text-[12px] font-black text-muted-foreground/20 uppercase tracking-[0.6em] italic mb-1 group-hover/line:text-primary/40 transition-colors">Temporal Key</p>
                         <Badge className="bg-background/80 hover:bg-primary text-foreground hover:text-primary-foreground rounded-3xl px-12 h-20 font-black italic text-2xl tracking-tighter border border-white/5 group-hover/line:border-primary/50 group-hover/line:shadow-2xl group-hover/line:shadow-primary/40 transition-all duration-700 flex items-center justify-center w-full">
                           {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }).toUpperCase()}
                         </Badge>
                         <div className="flex items-center gap-3 text-primary font-black italic text-[10px] tracking-widest uppercase opacity-0 group-hover/line:opacity-100 transition-all duration-700 translate-y-4 group-hover/line:translate-y-0">
                            VIEW LOG DETAILS <ArrowRight size={14} className="group-hover/line:translate-x-2 transition-transform duration-500" />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EMPTY STATE */}
        {eventsList.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 shadow-premium text-center relative group overflow-hidden">
            <Globe className="w-[600px] h-[600px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 space-y-12">
               <Calendar size={160} className="mx-auto text-primary opacity-5 animate-pulse" />
               <div className="space-y-6">
                  <p className="text-6xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Archival Void</p>
                  <p className="text-[16px] font-black text-muted-foreground/20 uppercase mt-4 tracking-[0.8em] italic leading-none">Initialize manifestation sequence to populate institutional event log</p>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageHeader>
  );
}
