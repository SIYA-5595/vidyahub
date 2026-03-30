"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  DollarSign,
  Check,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
  Calendar,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  Globe,
  Award,
  ChevronRight
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner",
  upcoming: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner",
  closed: "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner",
};

const statusIcons: Record<string, React.ElementType> = {
  open: Check,
  upcoming: Clock,
  closed: AlertCircle,
};

interface Scholarship {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  eligibility: string;
  status: string;
}

export default function ScholarshipsPage() {
  const [scholarshipsList, setScholarshipsList] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newScholarship, setNewScholarship] = useState({
    name: "",
    amount: "",
    deadline: "",
    eligibility: "",
    status: "open"
  });

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "scholarships"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScholarshipsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scholarship)));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addScholarship = async () => {
    if (!newScholarship.name || !newScholarship.amount || !newScholarship.deadline) {
      toast.error("Manifest requires name, amount and temporal cutoff parameters");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "scholarships"), {
        ...newScholarship,
        createdAt: serverTimestamp()
      });
      setNewScholarship({ name: "", amount: "", deadline: "", eligibility: "", status: "open" });
      setShowAddForm(false);
      toast.success("New grant opportunity successfully broadcast to the matrix");
    } catch {
      toast.error("Grant broadcast failed // Signal interference");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <PageHeader
      title="Scholarship Central"
      description="Track elite scholarship opportunities, funding scales, and critical temporal cutoffs within the collective"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 border-none shadow-2xl shadow-primary/30 transition-all active:scale-95 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
            <Plus className={`w-5 h-5 transition-transform duration-700 ${showAddForm ? "rotate-45" : ""}`} />
            {showAddForm ? "CLOSE ARCHIVE" : "BROADCAST GRANT"}
          </Button>
          <Button className="h-11 px-8 bg-background/40 hover:bg-background/60 text-primary border border-white/5 rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-inner">
            <Target className="w-5 h-5 text-amber-500 group-hover:scale-125 transition-transform duration-500" />
            CHECK ELIGIBILITY
          </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {/* STATS */}
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            { label: "Active Nodes", value: scholarshipsList.length.toString(), icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10", suffix: "GRANTS" },
            { label: "Collective Fund Pool", value: "₹45.0M", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "TOTAL" },
            { label: "Critical Windows", value: "03", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", suffix: "EXPIRING" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
               <Card className="rounded-[4rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-700 h-full relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -mr-16 -mt-16 pointer-events-none`} />
                  <CardContent className="p-12 relative z-10 flex flex-col justify-between h-full space-y-10">
                    <div className="flex justify-between items-start">
                       <div className="space-y-4">
                          <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic leading-none">{stat.label}</p>
                          <p className="text-5xl font-black text-foreground tracking-tighter italic leading-none">{stat.value}</p>
                       </div>
                       <div className={`w-16 h-16 rounded-[1.5rem] bg-background/50 flex items-center justify-center border border-white/5 ${stat.color} group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 shadow-inner`}>
                          <stat.icon size={36} />
                       </div>
                    </div>
                    <Badge variant="secondary" className="w-fit bg-background/40 border border-white/5 text-muted-foreground/40 font-black italic text-[9px] uppercase tracking-widest px-4 h-8 rounded-xl shadow-inner italic">
                       {stat.suffix} // VERIFIED
                    </Badge>
                  </CardContent>
               </Card>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
               <Card className="rounded-[4.5rem] border border-white/5 shadow-premium-hover bg-card/60 backdrop-blur-xl overflow-hidden p-16 space-y-16 transition-all duration-700 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(30,136,229,0.05),transparent_70%)] pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none flex items-center gap-6">
                        <Award size={48} className="text-primary" /> INITIALIZE GRANT BROADCAST
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[72px] italic leading-none">Capture scholarship telemetry for collective synchronization</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Grant Nomenclature</Label>
                        <Input placeholder="E.G. GLOBAL QUANTUM FELLOWSHIP" value={newScholarship.name} onChange={e => setNewScholarship({...newScholarship, name: e.target.value.toUpperCase()})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Funding Scale</Label>
                        <div className="relative group/input">
                           <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input placeholder="E.G. ₹50,000 / ANNUM" value={newScholarship.amount} onChange={e => setNewScholarship({...newScholarship, amount: e.target.value.toUpperCase()})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Temporal Cutoff (Deadline)</Label>
                        <div className="relative group/input">
                           <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input type="date" value={newScholarship.deadline} onChange={e => setNewScholarship({...newScholarship, deadline: e.target.value})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all [color-scheme:dark]"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Eligibility Parameters</Label>
                        <div className="relative group/input">
                           <ShieldCheck className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input placeholder="E.G. CGPA > 9.5 & RESEARCH PORTFOLIO" value={newScholarship.eligibility} onChange={e => setNewScholarship({...newScholarship, eligibility: e.target.value.toUpperCase()})} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                        </div>
                     </div>
                  </div>
                  <Button onClick={addScholarship} disabled={isSubmitting} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE BROADCAST PROTOCOL // SYNC GRANT"}
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TIMELINE */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Opportunities Timeline</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Temporal Application Windows // Active Grant Cycles</p>
            </div>
            <Badge variant="outline" className="rounded-2xl h-12 px-10 border-white/5 bg-background/40 backdrop-blur-sm text-primary font-black italic uppercase text-[12px] tracking-widest leading-none shadow-inner italic">Live Applications: {scholarshipsList.length}</Badge>
          </div>

          <div className="relative border-l-4 border-white/5 ml-14 space-y-16 pl-16">
            {scholarshipsList.map((scholarship, index) => {
              const StatusIcon = statusIcons[scholarship.status as keyof typeof statusIcons] || AlertCircle;
              const daysLeft = getDaysUntilDeadline(scholarship.deadline);

              return (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="relative group"
                >
                  <div className={`absolute -left-[108px] top-8 flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-2xl transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 border-4 border-background z-20 ${
                    scholarship.status === 'open' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                    scholarship.status === 'upcoming' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                  }`}>
                    <StatusIcon size={36} />
                  </div>

                  <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 bg-card/40 backdrop-blur-sm group-hover:-translate-y-4 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                    <CardContent className="p-16 relative z-10">
                      <div className="flex flex-col xl:flex-row xl:justify-between gap-16">
                        <div className="space-y-10 flex-1">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-6 items-center">
                              <h3 className="font-black text-4xl italic tracking-tighter text-foreground uppercase group-hover:text-primary transition-colors duration-700 leading-none">
                                {scholarship.name}
                              </h3>

                              <Badge className={`rounded-xl px-6 h-9 font-black italic text-[10px] uppercase tracking-widest border-none md:h-10 leading-none ${statusColors[scholarship.status as keyof typeof statusColors]}`}>
                                {scholarship.status} // NODE
                              </Badge>
                            </div>
                            <div className="h-1 w-32 bg-primary/20 rounded-full overflow-hidden">
                               <div className="h-full w-1/2 bg-primary animate-shimmer" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-8">
                             <div className="space-y-2">
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic leading-none ml-1">Scale of funding</p>
                                <p className="text-5xl font-black text-primary italic leading-none tracking-tighter group-hover:scale-105 origin-left transition-transform duration-700">
                                  {scholarship.amount}
                                </p>
                             </div>
                             <div className="bg-background/40 backdrop-blur-sm p-8 rounded-[3rem] border border-white/5 group-hover:bg-background/60 transition-all duration-700 shadow-inner">
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic mb-4 leading-none">Eligibility parameters</p>
                                <p className="text-lg font-black italic tracking-tight text-foreground/80 group-hover:text-foreground transition-colors duration-700 uppercase leading-relaxed">
                                  {scholarship.eligibility}
                                </p>
                             </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row xl:flex-col justify-between items-start xl:items-end gap-10 border-t xl:border-t-0 xl:border-l border-white/5 pt-12 xl:pt-0 xl:pl-16">
                          <div className="xl:text-right space-y-4">
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] opacity-40 italic leading-none">Temporal Cutoff</p>
                            <p className="font-black text-4xl italic tracking-tighter text-foreground leading-none group-hover:text-primary transition-colors duration-700">
                              {new Date(scholarship.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                            </p>

                            {daysLeft > 0 && scholarship.status === "open" && (
                              <Badge className="bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl px-6 h-10 mt-6 font-black italic text-[10px] uppercase tracking-widest animate-pulse leading-none shadow-inner">
                                <Zap size={14} className="mr-3" /> {daysLeft} CYCLES REMAINING
                              </Badge>
                            )}
                          </div>

                          {scholarship.status === "open" && (
                            <div className="flex gap-6 w-full md:w-auto mt-4 px-1 pb-1">
                              <Button className="flex-1 md:flex-none h-20 px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 border-none transition-all active:scale-95 relative overflow-hidden group/btn-apply">
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                                <div className="flex items-center gap-4">
                                   APPLY NODE
                                   <ArrowRight size={28} className="group-hover/btn-apply:translate-x-3 transition-transform duration-500" />
                                </div>
                              </Button>
                              <Button variant="ghost" className="h-20 w-20 rounded-[2rem] border border-white/5 bg-background/40 text-primary font-black italic hover:bg-white/5 transition-all shadow-inner hover:scale-110 active:scale-95 group/details">
                                <ChevronRight size={32} className="group-hover/details:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {scholarshipsList.length === 0 && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 text-center relative group overflow-hidden">
                <Globe className="w-[500px] h-[500px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 space-y-10">
                   <Trophy className="w-32 h-32 mx-auto mb-10 text-primary opacity-[0.05] animate-pulse" />
                   <div className="space-y-4">
                      <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Archival Void</p>
                      <p className="text-[14px] font-black text-muted-foreground/20 uppercase mt-6 tracking-[0.8em] italic leading-none">Initialize grant broadcast to populate temporal timeline</p>
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
