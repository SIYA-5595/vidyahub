"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { 
  Trash2, 
  AlertTriangle, 
  MessageSquare, 
  Utensils, 
  Calendar, 
  TrendingDown, 
  Database, 
  Zap, 
  FileText, 
  Loader2,
  Activity,
  Box,
  Globe,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Search
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

type WasteRecord = {
  id: string;
  date: string;
  meal: string;
  kg: number;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

type Feedback = {
  id: string;
  student: string;
  message: string;
  date: string;
};

export default function MessWasteTracker() {
  const [view, setView] = useState<"staff" | "student">("staff");
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [form, setForm] = useState({ date: "", meal: "", kg: 0 });
  const [feedbackForm, setFeedbackForm] = useState({ student: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time listener for waste records
  useEffect(() => {
    const q = query(collection(db, "mess-waste"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WasteRecord[];
      setRecords(recordsList);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for feedbacks
  useEffect(() => {
    const q = query(collection(db, "mess-feedback"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbacksList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Feedback[];
      setFeedbacks(feedbacksList);
    });
    return () => unsubscribe();
  }, []);

  const addWaste = async () => {
    if (!form.date || !form.meal || form.kg <= 0) {
      toast.error("Temporal mark, iteration cycle, and payload scale (KG) required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "mess-waste"), {
        ...form,
        meal: form.meal.toUpperCase(),
        createdAt: serverTimestamp()
      });
      setForm({ ...form, meal: "", kg: 0 });
      toast.success("Waste record successfully archived in matrix");
    } catch {
      toast.error("Logging sequence failed // Nodal error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeWaste = async (id: string) => {
    try {
      await deleteDoc(doc(db, "mess-waste", id));
      toast.success("Record purged from institutional registry");
    } catch {
       toast.error("Purge sequence failed");
    }
  };

  const addFeedback = async () => {
    if (!feedbackForm.message || !feedbackForm.student) {
      toast.error("All mission parameters required for feedback transmission");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "mess-feedback"), {
        student: feedbackForm.student.toUpperCase(),
        message: feedbackForm.message.toUpperCase(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
        createdAt: serverTimestamp()
      });
      setFeedbackForm({ student: "", message: "" });
      toast.success("Culinary observation successfully transmitted to command");
    } catch {
      toast.error("Transmission failed // Signal interference");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFeedback = async (id: string) => {
    try {
      await deleteDoc(doc(db, "mess-feedback", id));
      toast.success("Observation successfully resolved and archived");
    } catch {
      toast.error("Resolution sequence failed");
    }
  };

  const totalWaste = records.reduce((acc, r) => acc + Number(r.kg), 0);
  const avgWaste = records.length ? (totalWaste / records.length).toFixed(1) : 0;
  const wastePrecentage = Math.min((totalWaste / 100) * 100, 100);

  const getColor = (kg: number) => {
    if (kg <= 5) return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 shadow-inner";
    if (kg <= 10) return "bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-inner";
    return "bg-rose-500/20 text-rose-500 border border-rose-500/20 shadow-inner";
  };

  return (
    <PageHeader
      title="Sustenance Audit"
      description="Bio-waste tracking and student consumption feedback matrix for institutional nutrition optimization"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
          <div className="flex bg-background/40 p-1 rounded-xl border border-white/5 shadow-inner">
            {(["staff", "student"] as const).map((v) => (
              <Button
                key={v}
                variant="ghost"
                size="sm"
                onClick={() => setView(v)}
                className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-widest italic transition-all ${view === v ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
              >
                {v === 'staff' ? 'STAFF OVERRIDE' : 'STUDENT HUB'}
              </Button>
            ))}
          </div>
          <div className="w-11 h-11 bg-background/40 border border-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* ANALYTICS PANE */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-12">
           <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
             <CardHeader className="p-12 pb-6 relative z-10">
                <CardTitle className="text-[12px] font-black uppercase tracking-[0.5em] text-primary italic leading-none flex items-center gap-4">
                  <Activity size={20} className="text-primary animate-pulse" /> Load Metrics
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-12 p-12 pt-4 relative z-10">
                <div className="flex flex-col items-center">
                   <div className="relative w-full aspect-square bg-background/60 rounded-[3.5rem] flex flex-col justify-center items-center group-hover:bg-background/80 group-hover:shadow-premium-hover transition-all duration-700 border-2 border-white/5 group-hover:border-primary/20 shadow-inner group/indicator overflow-hidden">
                     <div className="absolute inset-x-0 bottom-0 bg-primary/20 animate-shimmer pointer-events-none" style={{ height: `${wastePrecentage}%` }} />
                     <span className="text-8xl font-black italic tracking-tighter text-foreground leading-none group-hover:scale-110 transition-transform duration-700 relative z-10">{totalWaste}</span>
                     <span className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] mt-6 opacity-40 italic relative z-10 leading-none">Bio-Mass KG</span>
                     
                     <div className="absolute -bottom-6 bg-primary text-primary-foreground py-3 px-8 rounded-2xl font-black italic text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 z-20">
                        TOTAL AGGREGATE
                     </div>
                   </div>
                </div>
                
                <div className="space-y-6 pt-6">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 opacity-40 italic leading-none">Waste Saturation</p>
                      <p className="text-2xl font-black italic tracking-tighter text-foreground leading-none">{wastePrecentage.toFixed(0)}%</p>
                   </div>
                   <div className="h-4 w-full bg-background/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${wastePrecentage}%` }}
                        className="h-full bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_15px_rgba(30,136,229,0.3)]"
                      />
                   </div>
                </div>
                
                <div className="space-y-6 pt-4">
                    {[
                      { label: "Avg / Iteration", value: `${avgWaste} KG`, icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                      { label: "Synced Entries", value: records.length, icon: Database, color: "text-blue-500", bg: "bg-blue-500/10" }
                    ].map((s, i) => (
                      <div key={i} className="bg-background/30 p-8 rounded-[2.5rem] flex items-center justify-between border border-white/5 group-hover:bg-background/80 transition-all duration-700 shadow-inner">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] opacity-40 leading-none italic">{s.label}</p>
                            <p className="text-2xl font-black italic tracking-tighter text-foreground leading-none">{s.value}</p>
                         </div>
                         <div className={`w-14 h-14 rounded-2xl ${s.bg} border border-white/5 flex items-center justify-center ${s.color} group-hover:rotate-12 transition-all duration-700`}>
                            <s.icon size={28} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                         </div>
                      </div>
                    ))}
                </div>
             </CardContent>
           </Card>
        </div>

        {/* MAIN CONTENT PANE */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-16">
           <Tabs defaultValue="waste" className="w-full">
              <div className="flex bg-background/40 backdrop-blur-sm p-3 rounded-[3rem] h-24 w-fit border border-white/5 shadow-premium mb-16">
                <TabsList className="bg-transparent gap-4 h-full">
                  <TabsTrigger value="waste" className="rounded-[2.5rem] px-12 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/30 font-black italic uppercase text-[12px] tracking-widest transition-all duration-700">
                    <Database size={18} className="mr-3" /> PROBATION LOGS
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="rounded-[2.5rem] px-12 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/30 font-black italic uppercase text-[12px] tracking-widest transition-all duration-700">
                    <MessageSquare size={18} className="mr-3" /> FEEDBACK PROTOCOLS
                  </TabsTrigger>
                </TabsList>
              </div>

             {/* WASTE TRACKER */}
             <TabsContent value="waste" className="space-y-16 outline-none">
               {view === "staff" && (
                 <Card className="rounded-[4.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
                   <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(30,136,229,0.05),transparent_70%)] pointer-events-none" />
                   <CardHeader className="p-16 pb-8 relative z-10">
                      <div className="space-y-4">
                        <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none flex items-center gap-8">
                           <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                              <Zap size={40} className="text-primary group-hover:scale-110 transition-transform" />
                           </div>
                           Initialize Log Intake
                        </CardTitle>
                        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[112px] italic leading-none">Archive new bio-waste data stream into institutional matrix</p>
                      </div>
                   </CardHeader>
                   <CardContent className="p-16 pt-4 space-y-12 relative z-10">
                      <div className="grid md:grid-cols-3 gap-10">
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Temporal Mark</Label>
                              <div className="relative group/input">
                                 <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                                 <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg text-foreground focus:ring-4 focus:ring-primary/10 transition-all"/>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Iteration Cycle</Label>
                              <div className="relative group/input">
                                 <Clock className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                                 <Input placeholder="E.G. MID-DAY" value={form.meal} onChange={e => setForm({...form, meal: e.target.value.toUpperCase()})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                              </div>
                          </div>
                          <div className="space-y-4">
                               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Payload Scale (KG)</Label>
                               <div className="relative group/input">
                                  <TrendingDown className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                                  <Input type="number" placeholder="00" value={form.kg || ''} onChange={e => setForm({...form, kg: Number(e.target.value)})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg text-foreground focus:ring-4 focus:ring-primary/10 transition-all text-center"/>
                               </div>
                          </div>
                      </div>
                      <Button 
                        onClick={addWaste} 
                        disabled={isSubmitting}
                        className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync"
                      >
                        <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                        {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE DATA ARCHIVE // BROADCAST"}
                      </Button>
                   </CardContent>
                 </Card>
               )}

               <div className="space-y-12">
                  <div className="flex items-center justify-between px-10">
                      <div className="space-y-3">
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Archivists Registry</h3>
                        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Synchronized Bio-Waste Logs // Institutional Metabolism</p>
                      </div>
                      <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 backdrop-blur-sm border border-white/5 text-primary italic shadow-inner">{records.length} SECTORS PROBED</Badge>
                  </div>

                  <div className="grid gap-12">
                    <AnimatePresence>
                      {records.map((r: WasteRecord, index: number) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, scale: 0.95, y: 30 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          transition={{ delay: index * 0.05, duration: 0.6 }}
                        >
                          <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden bg-card/40 backdrop-blur-sm relative h-full">
                            <div className={`absolute top-0 left-0 bottom-0 w-3 transition-all duration-700 ${r.kg > 10 ? 'bg-rose-500 shadow-[20px_0_20px_rgba(244,63,94,0.1)]' : 'bg-emerald-500 shadow-[20px_0_20px_rgba(16,185,129,0.1)]'} group-hover:w-5`} />
                            
                            <CardContent className="p-12 pl-24 flex flex-col md:flex-row justify-between items-center gap-12 relative z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(30,136,229,0.03),transparent_70%)]">
                                <div className="flex items-center gap-12 w-full md:w-auto">
                                  <div className={`w-36 h-36 rounded-[3rem] flex flex-col items-center justify-center font-black italic shadow-2xl transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 ${getColor(r.kg)} relative overflow-hidden group/payload`}>
                                     <div className="absolute inset-0 bg-white/5 animate-pulse opacity-0 group-hover/payload:opacity-100 transition-opacity" />
                                     <span className="text-6xl leading-none relative z-10 group-hover:scale-125 transition-transform duration-700">{r.kg}</span>
                                     <span className="text-[12px] uppercase tracking-[0.5em] mt-3 opacity-40 italic relative z-10">KG</span>
                                  </div>
                                  <div className="space-y-4">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic leading-none opacity-40 ml-1">Cycle Descriptor</p>
                                    <h3 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none group-hover:text-primary transition-colors duration-700">{r.meal}</h3>
                                    <div className="flex items-center gap-5 bg-background/40 p-4 rounded-2xl border border-white/5 shadow-inner w-fit">
                                      <Calendar className="w-5 h-5 text-primary opacity-40 animate-pulse" />
                                      <span className="text-[12px] font-black italic uppercase tracking-widest text-muted-foreground/60">{r.date}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-white/5 pt-12 md:pt-0 md:pl-12">
                                  <div className="text-right space-y-4">
                                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] opacity-40 italic leading-none">Payload Status Index</p>
                                      <Badge className={`${r.kg > 10 ? 'bg-rose-500/20 text-rose-500 border-rose-500/20' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'} h-12 px-10 rounded-2xl font-black italic tracking-widest text-[12px] shadow-inner uppercase italic flex items-center gap-3`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${r.kg > 10 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} />
                                        {r.kg > 10 ? 'CRITICAL SPIKE' : 'NOMINAL RANGE'}
                                      </Badge>
                                  </div>
                                  {view === "staff" && (
                                    <Button variant="ghost" className="h-20 w-20 rounded-[2rem] bg-background/40 text-rose-500/40 border border-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all transform hover:rotate-12 shadow-inner group/del" onClick={() => removeWaste(r.id)}>
                                      <Trash2 size={40} className="group-hover/del:scale-110 transition-transform duration-500" />
                                    </Button>
                                  )}
                                </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {records.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 shadow-premium group overflow-hidden relative">
                       <Globe className="w-[600px] h-[600px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                       <div className="relative z-10 space-y-10">
                          <Utensils size={128} className="mx-auto text-primary opacity-5 animate-pulse" />
                          <div className="space-y-4">
                             <p className="text-6xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Registry Empty</p>
                             <p className="text-[14px] font-black text-muted-foreground/20 uppercase mt-4 tracking-[0.8em] italic leading-none">Initialize probe sequence to populate biowaste logs</p>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </div>
             </TabsContent>

             {/* FEEDBACK */}
             <TabsContent value="feedback" className="space-y-16 outline-none">
               {view === "student" && (
                  <Card className="rounded-[4.5rem] border border-white/5 shadow-premium bg-primary text-primary-foreground overflow-hidden relative group hover:shadow-premium-hover transition-all duration-700">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
                    <CardHeader className="p-16 pb-8 relative z-10">
                       <div className="space-y-4">
                          <CardTitle className="text-5xl font-black italic tracking-tighter uppercase leading-none flex items-center gap-8">
                             <div className="p-6 bg-white/10 rounded-3xl border border-white/20 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                <MessageSquare size={48} className="text-white group-hover:scale-110 transition-transform" />
                             </div>
                             Broadcast Observations
                          </CardTitle>
                          <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white/40 ml-[112px] italic leading-none">Archive culinary observations for institutional verification and analysis</p>
                       </div>
                    </CardHeader>
                    <CardContent className="p-16 pt-4 space-y-12 relative z-10">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2 italic">Source Identification</Label>
                          <Input 
                             placeholder="NOMENCLATURE / NODE ID"
                             value={feedbackForm.student}
                             onChange={e => setFeedbackForm({ ...feedbackForm, student: e.target.value.toUpperCase() })}
                             className="h-20 rounded-[2rem] bg-white/10 border-white/10 text-white font-black italic uppercase tracking-widest px-12 focus:bg-white/20 transition-all shadow-inner placeholder:text-white/20 text-xl border-none outline-none focus:ring-4 focus:ring-white/5"
                          />
                       </div>
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2 italic">Observation Payload</Label>
                          <Textarea 
                             className="min-h-[250px] resize-none text-[22px] rounded-[3rem] bg-white/10 border-white/10 placeholder:text-white/20 focus:bg-white/20 transition-all font-black italic uppercase p-12 shadow-inner border-none outline-none focus:ring-4 focus:ring-white/5 leading-relaxed"
                             placeholder="IDENTIFY QUALITY SCALARS, HYGIENE DEVIATIONS OR ARCHITECTURAL CULINARY FLAWS..." 
                             value={feedbackForm.message} 
                             onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value.toUpperCase() })} 
                          />
                       </div>
                       <Button 
                         onClick={addFeedback} 
                         disabled={isSubmitting}
                         className="w-full h-24 bg-white text-primary hover:bg-white/90 rounded-[2.5rem] font-black italic tracking-widest text-[14px] shadow-2xl active:scale-95 transition-all border-none relative overflow-hidden group/transmit"
                       >
                          <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/20 animate-pulse" />
                          {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : (
                             <div className="flex items-center gap-6">
                               <FileText size={32} className="group-hover/transmit:scale-110 transition-transform" />
                               TRANSMIT OBSERVATION // SYNC COMMAND
                             </div>
                          )}
                       </Button>
                    </CardContent>
                  </Card>
               )}

               <div className="grid md:grid-cols-1 xl:grid-cols-2 gap-12">
                  <AnimatePresence>
                    {feedbacks.map((f: Feedback, index: number) => (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ delay: index * 0.05, duration: 0.6 }}
                        whileHover={{ y: -12 }}
                      >
                        <Card className="rounded-[4.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm hover:shadow-premium-hover transition-all duration-700 group relative overflow-hidden flex flex-col h-full">
                          <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] bg-gradient-to-br from-primary to-transparent transition-all duration-1000 group-hover:opacity-10 group-hover:scale-150 rounded-full blur-[60px] pointer-events-none" />
                          
                          <CardContent className="p-12 space-y-12 flex flex-col h-full relative z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(30,136,229,0.03),transparent_70%)]">
                             <div className="space-y-10">
                               <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-background/50 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-inner group-hover:rotate-12">
                                      <MessageSquare size={32} />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-40 leading-none italic">Observation Source</p>
                                      <p className="font-black text-2xl uppercase tracking-tighter italic text-foreground leading-none">{f.student}</p>
                                    </div>
                                  </div>
                                  <Badge className="rounded-xl border border-white/5 bg-background/40 text-primary text-[10px] font-black italic uppercase tracking-widest px-6 h-10 transition-colors shadow-inner italic">{f.date}</Badge>
                               </div>
                               <div className="p-10 rounded-[3rem] bg-background/40 border border-white/5 shadow-inner relative group/msg">
                                  <Sparkles className="absolute -top-4 -right-4 text-primary opacity-0 group-hover/msg:opacity-100 transition-opacity duration-700" size={32} />
                                  <p className="text-foreground font-black text-2xl italic leading-relaxed tracking-tight uppercase">&quot;{f.message}&quot;</p>
                               </div>
                             </div>
                             
                             {view === "staff" && (
                                <div className="flex justify-end pt-8 border-t border-white/5 mt-auto">
                                    <Button variant="ghost" className="h-16 px-12 rounded-3xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black italic tracking-widest text-[10px] uppercase gap-5 shadow-inner border border-emerald-500/20 group/res" onClick={() => removeFeedback(f.id)}>
                                       <ShieldCheck size={24} className="group-hover/res:scale-110 transition-transform" /> RESOLVE ANOMALY
                                    </Button>
                                </div>
                             )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>

               {feedbacks.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 shadow-premium text-center relative group overflow-hidden">
                      <Search size={160} className="mx-auto text-primary opacity-5 animate-pulse" />
                      <div className="relative z-10 space-y-6 mt-12">
                         <p className="text-6xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Void Observations</p>
                         <p className="text-[14px] font-black text-muted-foreground/20 uppercase mt-4 tracking-[0.8em] italic leading-none">No corresponding feedback identified in this sector of the institutional memory</p>
                      </div>
                  </motion.div>
               )}
             </TabsContent>
           </Tabs>
        </div>
      </div>
    </PageHeader>
  );
}
