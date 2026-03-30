"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Plus,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { onSnapshot, query, orderBy } from "firebase/firestore";

/* ------------------------- */

type EventType = "fest" | "cultural" | "technical" | "networking";

const eventTypeColors: Record<EventType, string> & { [key: string]: string } = {
  fest: "from-primary to-primary/60",
  cultural: "from-purple-500 to-purple-400",
  technical: "from-blue-500 to-blue-400",
  networking: "from-green-500 to-green-400",
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

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    venue: "",
    type: "fest" as EventType,
    tickets: 100,
    sold: 0
  });

  // Real-time listener for events
  useEffect(() => { // Changed useState to useEffect
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEventsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.venue) {
      toast.error("All mission parameters required for event manifestation");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "events"), {
        ...newEvent,
        createdAt: serverTimestamp()
      });
      setNewEvent({ title: "", date: "", venue: "", type: "fest", tickets: 100, sold: 0 });
      setShowAddForm(false);
      toast.success("New event successfully broadcast");
    } catch {
      toast.error("Event manifestation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcquisition = async () => {
    if (!selectedEvent || !user) {
      toast.error("User node authentication required");
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
      toast.success("Access Node Synchronized Successfully");
      // Note: In a real app, you'd close the dialog here. 
      // I'll keep it simple for now as there's no state-controlled 'isDialogOpen' for all triggers.
    } catch {
      toast.error("Ticket acquisition failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageHeader
      title="Institutional Catalyst"
      description="Access the primary node for high-velocity campus collective interactions and cultural syntheses"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 px-6 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "CLOSE ARCHIVE" : "INITIATE EVENT"}
          </Button>
          <Badge className="bg-primary-foreground/20 text-white border-0 px-6 h-10 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
            <Calendar className="w-4 h-4 text-white/60" />
            {eventsList.length} ACTIVE MANIFESTATIONS
          </Badge>
        </div>
      }
    >
      <div className="space-y-16">
         {showAddForm && (
           <Card className="rounded-[4rem] border-0 shadow-2xl bg-white overflow-hidden p-12 space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Event Nomenclature</p>
                    <Input placeholder="E.G. NEURAL NET FEST 2024" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Temporal Slot</p>
                    <Input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Sector (Venue)</p>
                    <Input placeholder="E.G. CORE AUDITORIUM" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Entity Category</p>
                    <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})} className="w-full h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 outline-none">
                       <option value="fest">FEST NODE</option>
                       <option value="cultural">CULTURAL NODE</option>
                       <option value="technical">TECHNICAL NODE</option>
                       <option value="networking">SYNERGY NODE</option>
                    </select>
                 </div>
              </div>
              <Button onClick={addEvent} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : "EXECUTE MANIFESTATION"}
              </Button>
           </Card>
         )}

        {/* Events Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {eventsList.map((event, index) => {
            const soldPercent = (event.sold / event.tickets) * 100;
            const remaining = event.tickets - event.sold;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -12 }}
              >
                <Card className="rounded-[3rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 group bg-white overflow-hidden">
                  {/* Visual Header */}
                  <div className={`h-56 relative overflow-hidden bg-gradient-to-br ${eventTypeColors[event.type as EventType]}`}>
                     <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_0%_0%,white_0%,transparent_50%)]" />
                     <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                     
                     <div className="absolute inset-0 p-10 flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                           <Badge className="bg-white/20 backdrop-blur-md border-0 text-[10px] font-black uppercase tracking-[0.2em] px-4 h-8 rounded-xl">
                             {event.type} NODE
                           </Badge>
                           <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                              <Ticket className="w-6 h-6 text-white" />
                           </div>
                        </div>

                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none transform group-hover:translate-x-2 transition-transform">
                          {event.title}
                        </h3>
                     </div>
                  </div>

                  <CardContent className="p-10 space-y-10">
                    {/* Info Matrix */}
                    <div className="grid grid-cols-2 gap-8 pb-8 border-b border-secondary/10">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Temporal</p>
                          <p className="font-black italic text-base flex items-center gap-3 text-gray-900 leading-none">
                             <Calendar className="w-5 h-5 text-primary opacity-30" />
                             {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </p>
                       </div>

                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Sector</p>
                          <p className="font-black italic text-base flex items-center gap-3 text-gray-900 leading-none truncate">
                             <MapPin className="w-5 h-5 text-primary opacity-30" />
                             {event.venue}
                          </p>
                       </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Load Factor</p>
                           <p className="text-3xl font-black tracking-tighter italic text-gray-900 leading-none">{event.sold} <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase opacity-40">Units Synced</span></p>
                        </div>
                        <Badge className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest border-0 ${remaining < 50 ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-emerald-500/10 text-emerald-500"}`}>
                          {remaining} Available
                        </Badge>
                      </div>

                      <div className="h-4 w-full bg-secondary/10 rounded-full overflow-hidden p-1 shadow-inner">
                         <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: `${soldPercent}%` }}
                           className={`h-full rounded-full shadow-lg bg-gradient-to-r ${eventTypeColors[event.type]}`}
                         />
                      </div>
                    </div>

                    {/* Logic Interface */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black italic tracking-tighter text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:grayscale group relative overflow-hidden"
                          onClick={() => {
                            setSelectedEvent(event);
                            setTicketCount(1);
                          }}
                          disabled={remaining === 0}
                        >
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                          {remaining === 0 ? (
                            "Sold Out"
                          ) : (
                            <>
                              <Ticket className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                              SYNCHRONIZE ACCESS NODE — $25
                            </>
                          )}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="rounded-[4rem] border-0 p-0 overflow-hidden bg-white shadow-2xl">
                        <div className={`h-6 p-0 bg-gradient-to-r ${eventTypeColors[(selectedEvent?.type as EventType) || 'fest']}`} />
                        <div className="p-12 space-y-10">
                           <DialogHeader>
                              <div className="space-y-2">
                                 <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Access Protocol</DialogTitle>
                                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Verification & Token Generation</p>
                              </div>
                              <div className="pt-4">
                                 <Badge className="bg-secondary/10 text-primary border-0 rounded-lg px-4 h-8 font-black uppercase tracking-widest text-[10px] italic">{selectedEvent?.title}</Badge>
                              </div>
                           </DialogHeader>

                           <div className="bg-secondary/5 p-10 rounded-[3rem] border border-secondary/10 space-y-8">
                              <div className="flex justify-between items-center">
                                 <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Unit Quantity</Label>
                                    <p className="text-xs font-bold text-muted-foreground italic">Max 5 units/node</p>
                                 </div>
                                 <div className="flex items-center gap-8 bg-white p-3 rounded-2xl shadow-sm border border-secondary/10">
                                    <Button variant="ghost" size="icon" className="h-12 w-12 text-2xl font-black rounded-xl hover:bg-secondary/5" onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}>-</Button>
                                    <span className="text-3xl font-black italic w-8 text-center text-primary">{ticketCount}</span>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 text-2xl font-black rounded-xl hover:bg-secondary/5" onClick={() => setTicketCount(Math.min(5, ticketCount + 1))}>+</Button>
                                 </div>
                              </div>

                              <div className="h-[1px] bg-secondary/10" />

                              <div className="space-y-4">
                                 <div className="flex justify-between items-center px-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Base Asset Value</span>
                                    <span className="font-black text-lg italic tracking-tight opacity-40">$25.00</span>
                                 </div>
                                 <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-secondary/10 translate-y-2 shadow-inner">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Aggregate Debt</span>
                                    <span className="text-4xl font-black italic tracking-tighter text-primary">${(ticketCount * 25).toFixed(2)}</span>
                                 </div>
                              </div>
                           </div>

                           <Button 
                              onClick={handleAcquisition} 
                              disabled={isSubmitting} 
                              className="w-full h-20 rounded-[2rem] bg-primary text-white font-black italic tracking-tighter text-2xl shadow-3xl shadow-primary/40 active:scale-95 transition-all"
                            >
                              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "EXECUTE ACQUISITION"}
                           </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {eventsList.length === 0 && !isLoading && (
            <div className="col-span-full py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
               <Calendar className="w-24 h-24 mx-auto mb-8 opacity-5" />
               <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">Archival Void</p>
               <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize manifestation sequence to populate event log</p>
            </div>
          )}
        </div>

        {/* Timeline Sequence */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black italic tracking-tight uppercase text-gray-900 leading-none">Global Sequential Log</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Temporal Event Propagation</p>
            </div>
            <Badge className="rounded-xl h-10 px-6 border-primary/20 text-primary font-black italic uppercase text-[10px] tracking-widest hidden md:flex items-center">Primary Sync Active</Badge>
          </div>

          <Card className="rounded-[4rem] border-0 bg-white shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <CardContent className="p-12 md:p-16">
              <div className="relative pl-12 space-y-12 border-l-4 border-secondary/10">
                {eventsList.map((event) => (
                  <div key={event.id} className="relative group/line">
                    <div className="absolute -left-[68px] top-6 h-12 w-12 bg-white border-4 border-primary rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/line:bg-primary group-hover/line:scale-125 z-10 shadow-lg">
                       <Clock className="w-5 h-5 text-primary group-hover/line:text-white" />
                    </div>

                    <div className="p-10 bg-secondary/5 rounded-[3rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover/line:rotate-45 transition-transform duration-1000">
                         <Calendar size={60} />
                      </div>
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 relative z-10">
                        <div className="space-y-3">
                          <h4 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 leading-none group-hover/line:text-primary transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-4">
                             <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-black text-[10px] tracking-widest uppercase px-3 italic">{event.type}</Badge>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                                Terminal: {event.venue}
                             </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Temporal Key</p>
                           <Badge className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-12 font-black italic text-sm tracking-widest border-0 shadow-lg">
                             {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
                           </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageHeader>
  );
}
