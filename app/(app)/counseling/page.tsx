"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import {
  HeartPulse,
  PlusCircle,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Session {
  id: string;
  counselor: string;
  date: string;
  mode: "Online" | "Offline";
  concern: string;
  status: "Pending" | "Approved" | "Completed";
}

export default function CounselingPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [counselor, setCounselor] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<Session["mode"]>("Offline");
  const [concern, setConcern] = useState("");

  // Real-time listener
  useEffect(() => {
    if (!user) {
      return;
    }
    const q = query(collection(db, "users", user.uid, "counseling-sessions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session)));
    }, (error) => {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions.");
    });
    return () => unsubscribe();
  }, [user]);

  const addSession = async () => {
    if (!counselor || !date || !concern) {
      toast.error("All mission parameters required for registry");
      return;
    }
    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated");
      await addDoc(collection(db, "users", user.uid, "counseling-sessions"), {
        counselor,
        date,
        mode,
        concern,
        status: "Pending",
        createdAt: serverTimestamp()
      });
      setCounselor("");
      setDate("");
      setConcern("");
      setMode("Offline");
      toast.success("Confidential session registered successfully");
    } catch (error) {
      console.error("Error adding session:", error);
      toast.error("Registration sequence failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: Session["status"]) => {
    try {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid, "counseling-sessions", id), { status });
      toast.success(`Protocol status updated to ${status}`);
    } catch (error) {
      console.error("Error updating session status:", error);
      toast.error("Protocol update failed");
    }
  };

  const deleteSession = async (id: string) => {
    try {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "counseling-sessions", id));
      toast.success("Session archive purged");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Archive purge failed");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-blue-500 text-white shadow-blue-500/20";
      case "Completed":
        return "bg-emerald-500 text-white shadow-emerald-500/20";
      default:
        return "bg-amber-500 text-white shadow-amber-500/20";
    }
  };

  return (
    <PageHeader
      title="Wellness Sanctuary"
      description="Access confidential clinical counseling, peer support networks, and wellness tracking modules within the institutional framework"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          <Badge className="bg-primary-foreground/20 text-white border-0 px-6 h-10 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest italic">
            <HeartPulse className="w-5 h-5 text-rose-300 animate-pulse" />
            LIVE WELLNESS SIGNAL: OPTIMAL
          </Badge>
        </div>
      }
    >
      <div className="space-y-16">
        {/* BOOK SESSION CARD */}
        <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
          <CardHeader className="p-10 pb-6">
            <div className="space-y-1">
               <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Confidential Registry</CardTitle>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-1">Secure session archival protocols</p>
            </div>
          </CardHeader>

          <CardContent className="p-10 pt-4 space-y-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-2">Assigned Specialist</Label>
                 <Input
                   placeholder="ELITE CONSULTANT NAME"
                   value={counselor}
                   onChange={(e) => setCounselor(e.target.value)}
                   className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-6"
                 />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-2">Temporal Window</Label>
                 <Input
                   type="date"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-6"
                 />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-2">Interface Mode</Label>
                 <Select value={mode} onValueChange={(v) => setMode(v as Session["mode"])}>
                   <SelectTrigger className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-6">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl border-0 shadow-2xl">
                     <SelectItem value="Offline">OFFLINE NODAL</SelectItem>
                     <SelectItem value="Online">NEURAL LINK</SelectItem>
                   </SelectContent>
                 </Select>
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-2">Core Optimization Focus</Label>
                 <Input
                   placeholder="PRIMARY FOCUS AREA"
                   value={concern}
                   onChange={(e) => setConcern(e.target.value)}
                   className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-6"
                 />
              </div>
            </div>

            <Button onClick={addSession} disabled={isSubmitting} className="w-full h-18 py-8 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group overflow-hidden relative">
               <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
               {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <PlusCircle size={28} className="mr-5 group-hover:rotate-90 transition-transform duration-500" />}
               {isSubmitting ? "SYNCHRONIZING..." : "INITIALIZE SESSION"}
            </Button>
          </CardContent>
        </Card>

        {/* SESSION LIST */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-6">
             <div className="space-y-1">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Archived Sessions</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Verified Institutional Wellness Logs</p>
             </div>
             <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">{sessions.length} Appointments Loaded</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sessions.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
                 <HeartPulse className="mx-auto h-24 w-24 text-primary opacity-5 mb-8" />
                 <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">No Active Protocols</p>
                 <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize intake sequence to populate clinical logs</p>
              </motion.div>
            )}

            {sessions.map((session: Session, index: number) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -12 }}
              >
                <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 bg-white overflow-hidden relative group">
                  <div className={`absolute top-0 left-0 h-1.5 w-full transition-all duration-700 ${
                    session.status === 'Approved' ? 'bg-blue-500' : 
                    session.status === 'Completed' ? 'bg-emerald-500' :
                    'bg-amber-500'
                  }`} />
                  
                  <CardContent className="p-10 space-y-8 flex flex-col h-full">
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Wellness Specialist</p>
                          <h3 className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic group-hover:text-primary transition-colors leading-none">{session.counselor}</h3>
                       </div>
                       <Badge className={`${statusColor(session.status)} border-0 h-8 px-4 rounded-xl font-black italic text-[9px] uppercase tracking-widest shadow-lg`}>
                        {session.status}
                      </Badge>
                    </div>

                    <div className="bg-secondary/5 p-6 rounded-[2rem] space-y-5 border border-secondary/10 group-hover:bg-white transition-colors duration-500">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 leading-none">Schedule Window</span>
                          <span className="text-sm font-black italic text-gray-900">{session.date}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 leading-none">Operational Link</span>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary h-6 rounded-lg italic">{session.mode}</Badge>
                       </div>
                    </div>

                    <div className="space-y-3 flex-grow">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Primary Concern Focus</p>
                       <p className="text-sm font-black italic leading-relaxed text-gray-900">{session.concern}</p>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-secondary/5 mt-auto">
                      {session.status === "Pending" && (
                        <Button
                          className="flex-1 h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black italic tracking-tighter text-sm shadow-xl shadow-blue-500/20"
                          onClick={() => updateStatus(session.id, "Approved")}
                        >
                          <CheckCircle size={18} className="mr-2" />
                          AUTHORIZE
                        </Button>
                      )}

                      {session.status === "Approved" && (
                        <Button
                          className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black italic tracking-tighter text-sm shadow-xl shadow-emerald-500/20"
                          onClick={() => updateStatus(session.id, "Completed")}
                        >
                          <CheckCircle size={18} className="mr-2" />
                          FINALIZE
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-14 w-14 rounded-2xl bg-secondary/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 shadow-sm"
                        onClick={() => deleteSession(session.id)}
                      >
                        <Trash2 size={22} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
