"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Mic,
  Calendar,
  Star,
  Trash2,
  CheckCircle,
  Clock,
  Building,
  Target,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck,
  Plus
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Tab = "dashboard" | "book" | "history";

type Interview = {
  company: string;
  role: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Upcoming" | "Completed";
  rating?: number;
};

export default function MockInterviews() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState("");
  const [difficulty, setDifficulty] = useState<Interview["difficulty"]>("Medium");

  const [interviews, setInterviews] = useState<Interview[]>([]);

  // Load interviews from Firestore
  useEffect(() => {
    const loadInterviews = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "user-interviews", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterviews(docSnap.data().interviews || []);
        }
      } catch (error) {
        console.error("Error loading interviews:", error);
      }
    };

    loadInterviews();
  }, [user]);

  const syncWithFirestore = async (updatedInterviews: Interview[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "user-interviews", user.uid), {
        interviews: updatedInterviews,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error syncing interviews:", error);
      toast.error("Telemetry synchronization failed");
    }
  };

  const bookInterview = async () => {
    if (!company || !role || !date || !difficulty) {
      toast.error("Mission parameters incomplete: Enterprise and Role required");
      return;
    }

    const updated: Interview[] = [
      ...interviews,
      {
        company,
        role,
        date,
        difficulty,
        status: "Upcoming" as const,
      },
    ];

    setInterviews(updated);
    await syncWithFirestore(updated);
    toast.success("Simulation scheduled and synchronized with assessment node");

    setCompany("");
    setRole("");
    setDate("");
    setDifficulty("Medium");
    setTab("history"); // Auto-navigate to history
  };

  const deleteInterview = async (index: number) => {
    const updated = interviews.filter((_: Interview, i: number) => i !== index);
    setInterviews(updated);
    await syncWithFirestore(updated);
    toast.success("Simulation record purged from registry");
  };

  const markCompleted = async (index: number) => {
    const updated = [...interviews];
    updated[index].status = "Completed";
    updated[index].rating = 8.5; // Simulate a rating
    setInterviews(updated);
    await syncWithFirestore(updated);
    toast.success("Performance telemetry updated in manifest");
  };

  const upcoming = interviews.filter((i: Interview) => i.status === "Upcoming").length;
  const completed = interviews.filter((i: Interview) => i.status === "Completed").length;

  return (
    <PageHeader
      title="Elite Assessment Hub"
      description="Simulate high-stakes technical evaluations with industry veterans and AI-driven behavioral models"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
            <div className="flex bg-background/40 p-1.5 rounded-xl shadow-inner border border-white/5">
              {(["dashboard", "book", "history"] as Tab[]).map((t) => (
                <Button
                  key={t}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTab(t)}
                  className={`h-11 rounded-lg px-8 font-black text-[10px] uppercase tracking-widest transition-all italic border-none ${tab === t ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
                >
                  {t}
                </Button>
              ))}
            </div>
            <Button className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none relative overflow-hidden group/btn">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
              <Mic className="w-5 h-5 text-rose-400 group-hover:scale-125 transition-transform duration-500" />
              LIVE LINK
            </Button>
        </div>
      }
    >
      <div className="space-y-16">
        <AnimatePresence mode="wait">
          {/* ================= DASHBOARD ================= */}
          {tab === "dashboard" && (
            <motion.div 
               key="dashboard"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid gap-12 md:grid-cols-3"
            >
               {[
                 { label: "Active Evaluations", value: upcoming, icon: Clock, color: "text-primary", bg: "bg-primary/10", suffix: "NODES" },
                 { label: "Success Quotient", value: upcoming + completed > 0 ? `${Math.round((completed / (upcoming + completed)) * 100)}%` : "0%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "YIELD" },
                 { label: "Elite Standing", value: "MASTER", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", suffix: "RANK" },
               ].map((stat, i) => (
                 <Card key={i} className="rounded-[4rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative h-full">
                    <div className={`absolute top-0 right-0 w-48 h-48 ${stat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -mr-24 -mt-24 pointer-events-none`} />
                    <CardContent className="p-12 relative z-10 flex flex-col justify-between h-full space-y-12">
                       <div className="flex items-start justify-between">
                          <div className={`w-20 h-20 rounded-[2.5rem] bg-background/50 flex items-center justify-center ${stat.color} group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 shadow-inner border border-white/5`}>
                             <stat.icon size={40} />
                          </div>
                          <Badge className="bg-white/5 text-muted-foreground/40 font-black italic text-[9px] uppercase tracking-widest px-4 h-8 rounded-xl border-none shadow-inner italic">
                             {stat.suffix} // CALIBRATED
                          </Badge>
                       </div>
                       <div className="space-y-4">
                          <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic leading-none">{stat.label}</p>
                          <h2 className="text-6xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</h2>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </motion.div>
          )}

          {/* ================= BOOK ================= */}
          {tab === "book" && (
            <motion.div 
               key="book"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="rounded-[4.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-3xl overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                <CardHeader className="p-16 pb-8 relative z-10">
                   <div className="space-y-4">
                      <CardTitle className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none flex items-center gap-8">
                         <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                            <Target size={48} className="text-primary group-hover:scale-110 transition-transform" />
                         </div>
                         Simulation Intake Matrix
                      </CardTitle>
                      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Archive high-fidelity assessment parameters for secure synchronization</p>
                   </div>
                </CardHeader>
                <CardContent className="p-16 pt-4 space-y-12 relative z-10">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Target Enterprise Node</Label>
                       <div className="relative group/input">
                          <Building className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                          <Input
                            placeholder="E.G. NVIDIA // OPENAI"
                            value={company}
                            onChange={(e) => setCompany(e.target.value.toUpperCase())}
                            className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/10 placeholder:tracking-widest"
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Operational Designation</Label>
                       <div className="relative group/input">
                          <ShieldCheck className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                          <Input
                            placeholder="E.G. SYSTEMS ARCHITECT"
                            value={role}
                            onChange={(e) => setRole(e.target.value.toUpperCase())}
                            className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/10 placeholder:tracking-widest"
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Temporal Window</Label>
                       <div className="relative group/input">
                          <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-4 focus:ring-primary/10 transition-all text-foreground [color-scheme:dark]"
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Complexity Level</Label>
                       <Select value={difficulty} onValueChange={(v: Interview["difficulty"]) => setDifficulty(v)}>
                         <SelectTrigger className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-10 text-foreground focus:ring-4 focus:ring-primary/10 transition-all">
                            <div className="flex items-center gap-4">
                               <Zap size={24} className="text-primary opacity-40" />
                               <SelectValue />
                            </div>
                         </SelectTrigger>
                         <SelectContent className="rounded-[2.5rem] border border-white/10 shadow-premium bg-card/90 backdrop-blur-xl text-foreground font-black italic uppercase text-[11px] tracking-widest p-4">
                           <SelectItem value="Easy" className="rounded-xl h-12 focus:bg-primary/20">LOW SIGNAL // ENTRY</SelectItem>
                           <SelectItem value="Medium" className="rounded-xl h-12 focus:bg-primary/20">MED CORE // ANALYST</SelectItem>
                           <SelectItem value="Hard" className="rounded-xl h-12 focus:bg-primary/20">HIGH STRESS // ELITE</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>
                  </div>

                  <Button onClick={bookInterview} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all group/btn relative overflow-hidden border-none mt-4">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    <div className="flex items-center justify-center gap-6">
                       <Plus size={32} className="group-hover:rotate-90 transition-transform duration-700" />
                       INITIALIZE ASSESSMENT SIMULATION
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ================= HISTORY ================= */}
          {tab === "history" && (
            <motion.div 
               key="history"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-12"
            >
              <div className="flex items-center justify-between px-10">
                 <div className="space-y-3">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Simulation Registry</h2>
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Verified Institutional Performance Logs // Historical Node Telemetry</p>
                 </div>
                 <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 backdrop-blur-sm border border-white/5 text-foreground shadow-inner italic">{interviews.length} RECORDS ARCHIVED</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {interviews.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="col-span-full py-64 bg-background/20 rounded-[5rem] border-4 border-dashed border-white/5 text-center relative group overflow-hidden"
                  >
                     <Activity className="w-[400px] h-[400px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                     <div className="relative z-10 space-y-8">
                        <Building size={128} className="mx-auto text-primary opacity-10 animate-pulse" />
                        <div className="space-y-4">
                           <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Archive Purged</p>
                           <p className="text-[12px] font-black text-muted-foreground/20 uppercase tracking-[0.6em] italic leading-none">Initialize evaluation sequence to populate historical registers</p>
                        </div>
                     </div>
                  </motion.div>
                )}

                {interviews.map((interview: Interview, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ y: -12 }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                  >
                    <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 bg-card/40 backdrop-blur-sm overflow-hidden relative group h-full">
                      <div className={`absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -mr-24 -mt-24 pointer-events-none`} />
                      <CardContent className="p-12 space-y-10 flex flex-col h-full relative z-10">
                        <div className="flex justify-between items-start">
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic leading-none">Enterprise Target</p>
                              <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase flex items-center gap-6 leading-none group-hover:text-primary transition-colors duration-700">
                                <div className="p-4 bg-background/50 rounded-2xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                   <Building size={40} className="text-primary group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                {interview.company}
                              </h2>
                           </div>
                           <Badge className={`${interview.status === "Completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-inner" : "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 rotate-1 scale-105"} h-10 px-8 rounded-2xl text-[10px] font-black italic uppercase tracking-widest border-none transition-all duration-700`}>
                             {interview.status} // STATUS
                           </Badge>
                        </div>

                        <div className="bg-background/40 backdrop-blur-sm p-10 rounded-[3rem] flex justify-between items-center border border-white/5 group-hover:bg-background/80 transition-all duration-700 shadow-inner">
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] leading-none italic">Designated role</p>
                              <p className="text-xl font-black italic uppercase tracking-tight text-foreground">{interview.role}</p>
                           </div>
                           <div className="text-right space-y-3">
                              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] leading-none italic">Intensity</p>
                              <Badge className="rounded-xl border border-primary/20 bg-primary/5 text-primary font-black italic text-[10px] tracking-widest px-6 h-9 shadow-inner italic">{interview.difficulty} STAGE</Badge>
                           </div>
                        </div>

                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic leading-none">
                           <div className="flex items-center gap-3">
                              <Calendar size={14} className="text-primary opacity-40" />
                              NODE SYNC: {interview.date}
                           </div>
                           {interview.status === "Completed" && interview.rating && (
                              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-6 h-9 rounded-xl tracking-widest italic shadow-inner">
                                PERFORMANCE YIELD: {interview.rating}/10
                              </Badge>
                           )}
                        </div>

                        <div className="flex gap-6 pt-6 border-t border-white/5 mt-auto group/actions">
                          {interview.status === "Upcoming" && (
                            <Button
                              onClick={() => markCompleted(i)}
                              className="flex-1 h-20 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-widest text-[11px] uppercase shadow-2xl shadow-primary/30 relative overflow-hidden group/btn border-none transition-all active:scale-95"
                            >
                              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                              <Mic size={24} className="mr-5 group-hover:scale-125 transition-transform duration-500" />
                              EXECUTE LIVE SIMULATION
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-20 w-20 rounded-[2rem] bg-background/50 text-rose-500 border border-white/5 hover:bg-rose-500/20 transition-all transform hover:rotate-12 shadow-inner group/trash"
                            onClick={() => deleteInterview(i)}
                          >
                            <Trash2 size={28} className="group-hover/trash:scale-110 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageHeader>
  );
}
