"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Mic,
  Calendar,
  Star,
  Trash2,
  CheckCircle,
  Clock,
  Building,
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
      if (!user) {
        return;
      }

      try {
        const docRef = doc(db, "user-interviews", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterviews(docSnap.data().interviews || []);
        }
      } catch (error) {
        console.error("Error loading interviews:", error);
      } finally {
        // isLoading removed
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
      // Silent sync unless it's a critical action
    } catch (error) {
      console.error("Error syncing interviews:", error);
      toast.error("Failed to synchronize records");
    } finally {
      // isSaving removed
    }
  };

  const bookInterview = async () => {
    if (!company || !role || !date || !difficulty) return;

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
    toast.success("Simulation scheduled and synchronized");

    setCompany("");
    setRole("");
    setDate("");
    setDifficulty("Medium");
  };

  const deleteInterview = async (index: number) => {
    const updated = interviews.filter((_: Interview, i: number) => i !== index);
    setInterviews(updated);
    await syncWithFirestore(updated);
    toast.success("Record purged from registry");
  };

  const markCompleted = async (index: number) => {
    const updated = [...interviews];
    updated[index].status = "Completed";
    updated[index].rating = 5;
    setInterviews(updated);
    await syncWithFirestore(updated);
    toast.success("Performance log updated");
  };

  const upcoming = interviews.filter((i: Interview) => i.status === "Upcoming").length;
  const completed = interviews.filter((i: Interview) => i.status === "Completed").length;

  return (
    <PageHeader
      title="Elite Assessment Hub"
      description="Simulate high-stakes technical evaluations with industry veterans and AI-driven behavioral models"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="flex bg-white/10 p-1 rounded-xl">
             {(["dashboard", "book", "history"] as Tab[]).map((t) => (
               <Button
                 key={t}
                 variant="ghost"
                 size="sm"
                 onClick={() => setTab(t)}
                 className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-widest transition-all ${tab === t ? "bg-white text-primary shadow-xl" : "text-white/40 hover:text-white"}`}
               >
                 {t}
               </Button>
             ))}
           </div>
           <Button className="h-11 px-8 bg-primary text-primary hover:bg-white/90 hover:text-primary rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95">
            <Mic className="w-4 h-4" />
            LIVE LINK
          </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ================= DASHBOARD ================= */}
        {tab === "dashboard" && (
          <div className="grid gap-10 md:grid-cols-3">
             {[
               { label: "Active Evaluations", value: upcoming, icon: Clock, color: "text-primary", shadow: "shadow-primary/20" },
               { label: "Success Quotient", value: `${completed * 20}%`, icon: CheckCircle, color: "text-emerald-500", shadow: "shadow-emerald-500/20" },
               { label: "Elite standing", value: "Master", icon: Star, color: "text-amber-500", shadow: "shadow-amber-500/20" },
             ].map((stat, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
               >
                 <Card className="rounded-[3rem] border-0 bg-white shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
                    <CardContent className="p-10 flex justify-between items-center relative z-10">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic">{stat.label}</p>
                          <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 leading-none">{stat.value}</h2>
                       </div>
                       <div className={`w-18 h-18 rounded-[1.5rem] bg-secondary/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-700 shadow-sm ${stat.shadow}`}>
                          <stat.icon size={32} />
                       </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary/5 overflow-hidden">
                       <div className={`h-full w-1/2 ${stat.color} bg-current opacity-20`} />
                    </div>
                 </Card>
               </motion.div>
             ))}
          </div>
        )}

        {/* ================= BOOK ================= */}
        {tab === "book" && (
          <Card className="rounded-[3.5rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <CardHeader className="p-10 pb-6">
               <div className="space-y-1">
                  <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Simulation Intake</CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-1">Archive high-fidelity assessment parameters</p>
               </div>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Target Enterprise Node</Label>
                   <Input
                     placeholder="E.G. NVIDIA / OPENAI"
                     value={company}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setCompany(val);
                      }}
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Operational Designation</Label>
                   <Input
                     placeholder="E.G. SYSTEMS ENGINEER"
                     value={role}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setRole(val);
                      }}
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Temporal Window</Label>
                   <Input
                     type="date"
                     value={date}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Complexity parameters</Label>
                   <Select value={difficulty} onValueChange={(v: Interview["difficulty"]) => setDifficulty(v)}>
                     <SelectTrigger className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl border-0 shadow-2xl">
                       <SelectItem value="Easy">LOW SIGNAL</SelectItem>
                       <SelectItem value="Medium">MED CORE</SelectItem>
                       <SelectItem value="Hard">HIGH STRESS</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
              </div>

              <Button onClick={bookInterview} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2.5rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <Calendar size={28} className="mr-5 group-hover:rotate-12 transition-transform duration-500" />
                INITIALIZE SIMULATION
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ================= HISTORY ================= */}
        {tab === "history" && (
          <div className="space-y-10">
            <div className="flex items-center justify-between px-6">
               <div className="space-y-1">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Simulation Registry</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Verified Institutional Performance Logs</p>
               </div>
               <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">{interviews.length} RECORDS ARCHIVED</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {interviews.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
                   <Building className="mx-auto h-24 w-24 text-primary opacity-5 mb-8" />
                   <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">Archive Clean</p>
                   <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize evaluation sequence to populate records</p>
                </motion.div>
              )}

              {interviews.map((interview: Interview, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -12 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 bg-white overflow-hidden relative group">
                    <CardContent className="p-10 space-y-8 flex flex-col h-full">
                      <div className="flex justify-between items-start">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Enterprise Target</p>
                            <h2 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase flex items-center gap-4 leading-none group-hover:text-primary transition-colors">
                              <Building size={32} className="text-primary group-hover:rotate-12 transition-transform duration-700" />
                              {interview.company}
                            </h2>
                         </div>
                         <Badge className={`${interview.status === "Completed" ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary text-white shadow-primary/20"} border-0 h-8 px-5 rounded-xl text-[10px] font-black italic uppercase tracking-widest shadow-lg`}>
                           {interview.status}
                         </Badge>
                      </div>

                      <div className="bg-secondary/5 p-8 rounded-[2.5rem] flex justify-between items-center border border-secondary/10 group-hover:bg-white transition-colors duration-700">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 leading-none italic">Designated role</p>
                            <p className="text-lg font-black italic uppercase tracking-tight text-gray-900">{interview.role}</p>
                         </div>
                         <div className="text-right space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 leading-none italic">Hardness</p>
                            <Badge variant="outline" className="rounded-xl border-primary/20 text-primary font-black italic text-[10px] tracking-widest px-4 h-7">{interview.difficulty} LEVEL</Badge>
                         </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 italic">
                         <p>NODE SYNC: {interview.date}</p>
                         {interview.rating && (
                            <p className="bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-xl border border-amber-500/20 tracking-widest">
                               YIELD: ⭐ {interview.rating}/10
                            </p>
                         )}
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-secondary/5 mt-auto">
                        {interview.status === "Upcoming" && (
                          <Button
                            onClick={() => markCompleted(i)}
                            className="flex-1 h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black italic tracking-tighter text-lg shadow-xl shadow-primary/20 relative overflow-hidden group/btn"
                          >
                            <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
                            RUN SIMULATION
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-16 w-16 rounded-[1.5rem] bg-secondary/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 shadow-sm"
                          onClick={() => deleteInterview(i)}
                        >
                          <Trash2 size={24} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageHeader>
  );
}
