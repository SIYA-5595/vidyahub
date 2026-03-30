"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  HeartPulse,
  PlusCircle,
  Trash2,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Activity,
  Zap,
  Globe,
  Plus,
  ArrowRight,
  ChevronRight,
  Box,
  Brain,
  Stethoscope,
  Smile,
  Frown,
  Meh
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
  const [showAddForm, setShowAddForm] = useState(false);

  const [counselor, setCounselor] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<Session["mode"]>("Offline");
  const [concern, setConcern] = useState("");

  // Real-time listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "counseling-sessions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session)));
    }, (error) => {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load clinical registry protocols.");
    });
    return () => unsubscribe();
  }, [user]);

  const addSession = async () => {
    if (!counselor || !date || !concern) {
      toast.error("All mission parameters required for confidential registry");
      return;
    }
    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated node");
      await addDoc(collection(db, "users", user.uid, "counseling-sessions"), {
        counselor: counselor.toUpperCase(),
        date,
        mode,
        concern: concern.toUpperCase(),
        status: "Pending",
        createdAt: serverTimestamp()
      });
      setCounselor("");
      setDate("");
      setConcern("");
      setMode("Offline");
      setShowAddForm(false);
      toast.success("Confidential wellness session registered in institutional matrix");
    } catch (error) {
      console.error("Error adding session:", error);
      toast.error("Registration sequence failed // Nodal error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: Session["status"]) => {
    try {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid, "counseling-sessions", id), { status });
      toast.success(`Protocol status updated to ${status.toUpperCase()}`);
    } catch (error) {
      console.error("Error updating session status:", error);
      toast.error("Protocol status update failed");
    }
  };

  const deleteSession = async (id: string) => {
    try {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "counseling-sessions", id));
      toast.success("Session successfully purged from confidential archive");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Archive purge sequence failed");
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20 shadow-inner";
      case "Completed":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/20 shadow-inner";
      default:
        return "bg-amber-500/20 text-amber-500 border-amber-500/20 shadow-inner";
    }
  };

  return (
    <PageHeader
      title="Wellness Sanctuary"
      description="Access confidential clinical counseling, peer support networks, and wellness tracking modules within the institutional framework"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
          <Badge className="bg-rose-500/20 text-rose-500 border border-rose-500/20 px-6 h-11 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest italic shadow-inner">
            <HeartPulse className="w-5 h-5 text-rose-500 animate-pulse" />
            WELLNESS SIGNAL: OPTIMAL
          </Badge>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 border-none shadow-2xl shadow-primary/30 transition-all active:scale-95 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
            <PlusCircle className={`w-5 h-5 transition-transform duration-700 ${showAddForm ? "rotate-45" : ""}`} />
            {showAddForm ? "CLOSE ARCHIVE" : "INITIATE SESSION"}
          </Button>
          <div className="w-11 h-11 bg-background/40 border border-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
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
                           <ShieldCheck size={40} className="text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        Initialize Confidential Registry
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Register new clinical observation sequence for institutional wellness tracking</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Assigned Specialist</Label>
                        <div className="relative group/input">
                           <Stethoscope size={24} className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input placeholder="E.G. DR. NEURAL CORE" value={counselor} onChange={e => setCounselor(e.target.value.toUpperCase())} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Temporal Window</Label>
                        <div className="relative group/input">
                           <Activity size={24} className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg text-foreground focus:ring-4 focus:ring-primary/10 transition-all"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Interface Mode</Label>
                        <Select value={mode} onValueChange={(v) => setMode(v as Session["mode"])}>
                           <SelectTrigger className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all">
                              <div className="flex items-center gap-4">
                                 <Globe size={20} className="text-primary/40" />
                                 <SelectValue />
                              </div>
                           </SelectTrigger>
                           <SelectContent className="rounded-3xl border border-white/5 bg-card/90 backdrop-blur-3xl shadow-premium text-foreground font-black italic uppercase text-[12px] tracking-widest p-2">
                              <SelectItem value="Offline" className="rounded-2xl h-12 hover:bg-white/5 focus:bg-white/5 cursor-pointer">OFFLINE NODAL</SelectItem>
                              <SelectItem value="Online" className="rounded-2xl h-12 hover:bg-white/5 focus:bg-white/5 cursor-pointer">NEURAL LINK</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Core Optimization Focus</Label>
                        <div className="relative group/input">
                           <Box size={24} className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input placeholder="E.G. STRESS COMPRESSION" value={concern} onChange={e => setConcern(e.target.value.toUpperCase())} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                        </div>
                     </div>
                  </div>
                  <Button onClick={addSession} disabled={isSubmitting} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE REGISTRY PROTOCOL // SYNC"}
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SESSION LIST */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
             <div className="space-y-3">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Archived Sessions</h2>
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Verified Institutional Wellness Logs // Confidential Sequential Stream</p>
             </div>
             <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 backdrop-blur-sm border border-white/5 text-primary italic shadow-inner">{sessions.length} Appointments Loaded</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence>
              {sessions.map((session: Session, index: number) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileHover={{ y: -12 }}
                  transition={{ delay: index * 0.05, duration: 0.6 }}
                >
                  <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 bg-card/40 backdrop-blur-sm overflow-hidden relative group h-full flex flex-col">
                    <div className={`absolute top-0 left-0 right-0 h-2.5 transition-all duration-700 ${
                      session.status === 'Approved' ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 
                      session.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                      'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    } group-hover:h-4`} />
                    
                    <CardContent className="p-12 space-y-10 flex flex-col h-full bg-[radial-gradient(circle_at_bottom_right,rgba(30,136,229,0.03),transparent_70%)] relative z-10">
                      <div className="flex justify-between items-start">
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic leading-none opacity-40 ml-1">Wellness Specialist</p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase group-hover:text-primary transition-colors duration-700 leading-none">{session.counselor}</h3>
                         </div>
                         <Badge className={`${getStatusStyles(session.status)} border-none h-10 px-6 rounded-xl font-black italic text-[10px] uppercase tracking-[0.2em] shadow-lg italic`}>
                           {session.status}
                         </Badge>
                      </div>

                      <div className="bg-background/40 backdrop-blur-sm p-10 rounded-[3rem] space-y-8 border border-white/5 group-hover:bg-background/80 transition-all duration-700 shadow-inner">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                               <Calendar size={20} className="text-primary/40 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none">Window</span>
                            </div>
                            <span className="text-xl font-black italic text-foreground leading-none">{session.date}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                               <Globe size={20} className="text-primary/40 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none">Link</span>
                            </div>
                            <Badge variant="outline" className="text-[11px] font-black uppercase tracking-widest border-primary/20 text-primary h-9 rounded-2xl italic px-6 shadow-inner bg-primary/5">{session.mode}</Badge>
                         </div>
                      </div>

                      <div className="space-y-4 flex-grow px-2">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none opacity-40">Primary Concern Focus</p>
                         <p className="text-base font-black italic leading-relaxed text-foreground/80 tracking-tight uppercase group-hover:text-foreground transition-colors duration-700">{session.concern}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5 mt-auto">
                        {session.status === "Pending" && (
                          <Button
                            className="h-16 rounded-[1.75rem] bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white font-black italic tracking-widest text-[10px] uppercase border border-blue-500/20 transition-all shadow-inner group/auth relative overflow-hidden"
                            onClick={() => updateStatus(session.id, "Approved")}
                          >
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100" />
                             <div className="flex items-center justify-center gap-3">
                                <Zap size={18} className="group-hover/auth:rotate-12 transition-transform duration-500" />
                                AUTHORIZE
                             </div>
                          </Button>
                        )}

                        {session.status === "Approved" && (
                          <Button
                            className="h-16 rounded-[1.75rem] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-black italic tracking-widest text-[10px] uppercase border border-emerald-500/20 transition-all shadow-inner group/final relative overflow-hidden"
                            onClick={() => updateStatus(session.id, "Completed")}
                          >
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100" />
                             <div className="flex items-center justify-center gap-3">
                                <ShieldCheck size={18} className="group-hover/final:scale-110 transition-transform duration-500" />
                                FINALIZE
                             </div>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className={`h-16 rounded-[1.75rem] bg-background/40 text-rose-500/40 border border-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all transform hover:-translate-y-2 shadow-inner font-black italic uppercase text-[10px] tracking-widest group/del ${session.status === 'Pending' || session.status === 'Approved' ? '' : 'col-span-2'}`}
                          onClick={() => deleteSession(session.id)}
                        >
                           <Trash2 size={24} className="group-hover/del:scale-110 group-hover/del:rotate-6 transition-all duration-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {sessions.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 shadow-premium text-center relative group overflow-hidden">
                 <Globe className="w-[600px] h-[600px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-10">
                    <HeartPulse size={128} className="mx-auto text-primary opacity-5 animate-pulse" />
                    <div className="space-y-4">
                       <p className="text-6xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Void Protocols</p>
                       <p className="text-[14px] font-black text-muted-foreground/20 uppercase mt-6 tracking-[0.8em] italic leading-none">Initialize intake sequence to populate confidential registry logs</p>
                    </div>
                 </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
