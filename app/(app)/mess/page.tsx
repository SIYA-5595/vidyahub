"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Trash2, AlertTriangle, MessageSquare, Utensils, Calendar, TrendingDown, Database, Zap, FileText, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

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
    if (!form.date || !form.meal) {
      toast.error("Please provide date and sequence details");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "mess-waste"), {
        ...form,
        createdAt: serverTimestamp()
      });
      setForm({ ...form, meal: "", kg: 0 });
      toast.success("Waste record logged");
    } catch {
      toast.error("Logging failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeWaste = async (id: string) => {
    try {
      await deleteDoc(doc(db, "mess-waste", id));
      toast.success("Record purged");
    } catch {
       toast.error("Purge failed");
    }
  };

  const addFeedback = async () => {
    if (!feedbackForm.message || !feedbackForm.student) {
      toast.error("All mission parameters required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "mess-feedback"), {
        student: feedbackForm.student,
        message: feedbackForm.message,
        createdAt: serverTimestamp()
      });
      setFeedbackForm({ student: "", message: "" });
      toast.success("Feedback transmitted");
    } catch {
      toast.error("Transmission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFeedback = async (id: string) => {
    try {
      await deleteDoc(doc(db, "mess-feedback", id));
      toast.success("Observation resolved");
    } catch {
      toast.error("Resolution failed");
    }
  };

  const totalWaste = records.reduce((acc, r) => acc + Number(r.kg), 0);
  const avgWaste = records.length ? (totalWaste / records.length).toFixed(1) : 0;
  const wastePrecentage = Math.min((totalWaste / 100) * 100, 100);

  const getColor = (kg: number) => {
    if (kg <= 5) return "bg-emerald-500 shadow-emerald-500/20";
    if (kg <= 10) return "bg-amber-500 shadow-amber-500/20";
    return "bg-rose-500 shadow-rose-500/20";
  };

  return (
    <PageHeader
      title="Sustenance Audit"
      description="Bio-waste tracking and student consumption feedback matrix for institutional nutrition optimization"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          {(["staff", "student"] as const).map((v) => (
            <Button
              key={v}
              variant="ghost"
              size="sm"
              onClick={() => setView(v)}
              className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-widest transition-all ${view === v ? "bg-white text-primary shadow-xl" : "text-white/40 hover:text-white"}`}
            >
              {v === 'staff' ? 'STAFF OVERRIDE' : 'STUDENT HUB'}
            </Button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* ANALYTICS PANE */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-10">
           <Card className="rounded-[3.5rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
             <CardHeader className="p-10 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic leading-none">
                  Load Metrics
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-10 p-10 pt-4">
                <div className="flex flex-col items-center">
                   <div className="relative w-full aspect-square bg-secondary/5 rounded-[4rem] flex flex-col justify-center items-center group-hover:bg-white group-hover:shadow-2xl transition-all duration-700 border-4 border-dashed border-secondary/20 group-hover:border-primary/20">
                     <span className="text-7xl font-black italic tracking-tighter text-gray-900 leading-none">{totalWaste}</span>
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-40">Bio-Mass KG</span>
                     
                     <div className="absolute -bottom-4 bg-primary text-white py-2 px-6 rounded-xl font-black italic text-[9px] uppercase tracking-widest shadow-xl shadow-primary/30">
                        TOTAL AGGREGATE
                     </div>
                   </div>
                </div>
                
                <div className="space-y-4 pt-4">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 italic">Waste Saturation</p>
                      <p className="text-xl font-black italic tracking-tighter text-gray-900 leading-none">{wastePrecentage.toFixed(0)}%</p>
                   </div>
                   <div className="h-2.5 w-full bg-secondary/5 rounded-full overflow-hidden border border-secondary/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${wastePrecentage}%` }}
                        className="h-full bg-primary"
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 pt-4">
                    {[
                      { label: "Avg / Iteration", value: `${avgWaste} KG`, icon: TrendingDown },
                      { label: "Synced Entries", value: records.length, icon: Database }
                    ].map((s, i) => (
                      <div key={i} className="bg-secondary/5 p-6 rounded-[2rem] flex items-center justify-between border border-secondary/10 group-hover:bg-white transition-colors duration-500">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 leading-none">{s.label}</p>
                            <p className="text-xl font-black italic tracking-tighter text-gray-900 leading-none">{s.value}</p>
                         </div>
                         <s.icon className="h-8 w-8 text-primary opacity-10 group-hover:opacity-40 transition-opacity" />
                      </div>
                    ))}
                </div>
             </CardContent>
           </Card>
        </div>

        {/* MAIN CONTENT PANE */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
           <Tabs defaultValue="waste" className="w-full">
              <div className="flex bg-secondary/10 p-2 rounded-[2rem] h-18 w-fit border border-secondary/10 shadow-inner mb-12">
                <TabsList className="bg-transparent gap-2 h-full">
                  <TabsTrigger value="waste" className="rounded-2xl px-10 h-14 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-black italic uppercase text-[10px] tracking-widest transition-all">
                    PROBATION LOGS
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="rounded-2xl px-10 h-14 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-black italic uppercase text-[10px] tracking-widest transition-all">
                    FEEDBACK PROTOCOLS
                  </TabsTrigger>
                </TabsList>
              </div>

             {/* WASTE TRACKER */}
             <TabsContent value="waste" className="space-y-12 outline-none">
               {view === "staff" && (
                 <Card className="rounded-[3.5rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
                   <CardHeader className="p-10 pb-6">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl font-black italic tracking-tight uppercase text-gray-900 leading-none">Log Initialization</CardTitle>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-1">Archive new bio-waste data stream</p>
                      </div>
                   </CardHeader>
                   <CardContent className="p-10 pt-4 space-y-10">
                      <div className="grid md:grid-cols-3 gap-10">
                          <div className="space-y-4">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Temporal Mark</p>
                              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg px-8 focus:ring-2 focus:ring-primary/20 transition-all"/>
                          </div>
                          <div className="space-y-4">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Iteration Cycle</p>
                              <Input placeholder="E.G. MID-DAY CYCLE" value={form.meal} onChange={e => setForm({...form, meal: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20"/>
                          </div>
                          <div className="space-y-4">
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Payload Scale (KG)</p>
                               <Input type="number" placeholder="0.0" value={form.kg || ''} onChange={e => setForm({...form, kg: Number(e.target.value)})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg tracking-tight px-8 focus:ring-2 focus:ring-primary/20 transition-all text-center"/>
                          </div>
                      </div>
                      <Button 
                        onClick={addWaste} 
                        disabled={isSubmitting}
                        className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group relative overflow-hidden"
                      >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : (
                          <>
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                            <Zap size={28} className="mr-5 group-hover:rotate-12 transition-transform duration-500" />
                            ARCHIVE DATA STREAM
                          </>
                        )}
                      </Button>
                   </CardContent>
                 </Card>
               )}

               <div className="space-y-8">
                  <div className="flex items-center justify-between px-6">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Archivists Registry</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Synchronized Bio-Waste Logs</p>
                      </div>
                      <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest leading-none bg-secondary/10">{records.length} SECTORS PROBED</Badge>
                  </div>

                  <div className="grid gap-10">
                    {records.map((r: WasteRecord, index: number) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="rounded-[3rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 group overflow-hidden bg-white hover:border-primary/10 border border-transparent">
                          <CardContent className="p-10 flex flex-col md:flex-row justify-between items-center gap-10">
                              <div className="flex items-center gap-10 w-full md:w-auto">
                                <div className={`w-28 h-28 rounded-[2.5rem] flex flex-col items-center justify-center text-white font-black italic shadow-2xl transition-all duration-700 group-hover:rotate-12 ${getColor(r.kg)}`}>
                                   <span className="text-4xl leading-none">{r.kg}</span>
                                   <span className="text-[9px] uppercase tracking-widest mt-2 opacity-60">KG</span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 leading-none group-hover:text-primary transition-colors">{r.meal}</p>
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center">
                                      <Calendar className="w-4 h-4 text-primary opacity-40" />
                                    </div>
                                    <span className="text-xs font-black italic uppercase tracking-tight text-muted-foreground">{r.date}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-secondary/10 pt-10 md:pt-0 md:pl-10">
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">PAYLOAD STATUS</p>
                                    <Badge className={`${r.kg > 10 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'} border-0 px-6 h-10 rounded-xl font-black italic tracking-widest text-[10px] shadow-lg`}>
                                      {r.kg > 10 ? 'CRITICAL SPIKE' : 'NOMINAL RANGE'}
                                    </Badge>
                                </div>
                                {view === "staff" && (
                                  <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.5rem] bg-secondary/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 shadow-sm border border-secondary/10" onClick={() => removeWaste(r.id)}>
                                    <Trash2 className="w-7 h-7" />
                                  </Button>
                                )}
                              </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {records.length === 0 && (
                    <div className="text-center py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20">
                      <Utensils className="h-24 w-24 mx-auto mb-8 opacity-5" />
                      <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase">Registry Empty</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize probe sequence to populate biowaste logs</p>
                    </div>
                  )}
               </div>
             </TabsContent>

             {/* FEEDBACK */}
             <TabsContent value="feedback" className="space-y-12 outline-none">
               {view === "student" && (
                  <Card className="rounded-[4rem] border-0 shadow-sm bg-primary text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-700">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <CardHeader className="p-12 pb-6 relative z-10">
                       <div className="space-y-1">
                          <CardTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">STUDENT FEEDBACK PORTAL</CardTitle>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Archive culinary observations for institutional verification</p>
                       </div>
                    </CardHeader>
                    <CardContent className="p-12 pt-4 space-y-10 relative z-10">
                       <Input 
                          placeholder="IDENTIFICATION NOMENCLATURE"
                          value={feedbackForm.student}
                          onChange={e => setFeedbackForm({ ...feedbackForm, student: e.target.value })}
                          className="h-16 rounded-2xl bg-white/10 border-white/20 text-white font-black italic uppercase px-8 focus:bg-white/20 transition-all shadow-inner placeholder:text-white/20"
                       />
                       <Textarea 
                          className="min-h-[180px] resize-none text-xl rounded-[2.5rem] bg-white/10 border-white/20 placeholder:text-white/20 focus:bg-white/20 transition-all font-black italic uppercase p-10 shadow-inner"
                          placeholder="IDENTIFY QUALITY SCALARS, HYGIENE DEVIATIONS OR ARCHITECTURAL CULINARY FLAWS..." 
                          value={feedbackForm.message} 
                          onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })} 
                       />
                       <div className="flex justify-end">
                          <Button 
                            onClick={addFeedback} 
                            disabled={isSubmitting}
                            className="w-full md:w-auto h-20 px-16 bg-white text-primary hover:bg-white/90 rounded-[2rem] font-black italic tracking-tighter text-xl shadow-2xl active:scale-95 transition-all"
                          >
                             {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> : (
                               <>
                                 <FileText size={24} className="mr-4" />
                                 TRANSMIT FEEDBACK
                               </>
                             )}
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
               )}

               <div className="grid md:grid-cols-2 gap-10">
                  {feedbacks.map((f: Feedback, index: number) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -12 }}
                    >
                      <Card className="rounded-[3.5rem] border-0 shadow-sm bg-white hover:shadow-2xl transition-all duration-700 group relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 left-0 w-3 h-full bg-secondary/5 group-hover:bg-primary transition-all duration-700" />
                        <CardContent className="p-10 flex flex-col h-full justify-between gap-10">
                           <div className="space-y-8">
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-5">
                                  <div className="w-16 h-16 rounded-[1.5rem] bg-secondary/5 border border-secondary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm">
                                    <MessageSquare className="w-8 h-8" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 leading-none">SOURCE NODE</p>
                                    <p className="font-black text-lg uppercase tracking-tight italic text-gray-900 leading-none">{f.student}</p>
                                  </div>
                                </div>
                                <Badge className="rounded-xl border-secondary/30 bg-secondary/5 text-primary text-[10px] font-black italic uppercase tracking-widest px-4 h-8">{f.date}</Badge>
                             </div>
                             <p className="text-gray-900 font-black text-xl italic leading-relaxed tracking-tight uppercase">&quot;{f.message}&quot;</p>
                           </div>
                           
                           {view === "staff" && (
                              <div className="flex justify-end pt-6 border-t border-secondary/5">
                                  <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-secondary/5 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all font-black italic tracking-widest text-[10px] uppercase gap-3 shadow-sm" onClick={() => removeFeedback(f.id)}>
                                     <AlertTriangle className="w-5 h-5" /> RESOLVE ANOMALY
                                  </Button>
                              </div>
                           )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
               </div>

               {feedbacks.length === 0 && (
                  <div className="col-span-full py-40 text-center bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20">
                      <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase">Void Observations</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 mt-3">No corresponding feedback identified in this sector</p>
                  </div>
               )}
             </TabsContent>
           </Tabs>
        </div>
      </div>
    </PageHeader>
  );
}
