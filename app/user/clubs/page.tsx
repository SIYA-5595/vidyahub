"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Users,
  Calendar,
  ExternalLink,
  ChevronRight,
  Plus,
  Loader2,
  Zap,
  ShieldCheck,
  Globe,
  Trophy,
  ArrowRight
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

/* ---------------------------------- */

const clubColors: Record<string, string> = {
  "Coding Club": "from-primary to-blue-600",
  "Robotics Society": "from-emerald-500 to-teal-600",
  "AI/ML Club": "from-purple-500 to-indigo-600",
  "Cybersecurity Club": "from-rose-500 to-pink-600",
  "Design Club": "from-orange-500 to-amber-600",
};

/* ---------------------------------- */

interface Club {
  id: string;
  name: string;
  members: string;
  activities: string;
  lead: string;
}

export default function TechClubsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newClub, setNewClub] = useState({ name: "", members: "", activities: "", lead: "" });

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "clubs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Club)));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addClub = async () => {
    if (!newClub.name || !newClub.lead) {
      toast.error("Manifest requires guild name and master designation");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "clubs"), {
        ...newClub,
        createdAt: serverTimestamp()
      });
      setNewClub({ name: "", members: "", activities: "", lead: "" });
      setShowAddForm(false);
      toast.success("New Guild chartered and synchronized with matrix");
    } catch {
      toast.error("Charter sequence failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageHeader
      title="Unity Hub Node"
      description="Connect with specialized technical guilds, society chapters, and research clusters within the institutional matrix"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
           <div className="flex bg-background/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
             {["all", "joined", "recommended"].map((tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={`h-11 rounded-lg px-8 font-black text-[10px] uppercase tracking-widest transition-all italic border-none ${activeTab === tab ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
                >
                  {tab === "all" ? "EXPLORE" : tab === "joined" ? "CONNECTED" : "SUGGESTED"}
                </Button>
              ))}
           </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all border-none relative overflow-hidden group/btn"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
              <Award className={`w-5 h-5 transition-transform duration-700 ${showAddForm ? "rotate-45" : ""}`} />
              {showAddForm ? "CLOSE ARCHIVE" : "CHARTER GUILD"}
            </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {/* STATS OVERVIEW */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Nodes", value: "15", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
            { label: "Elite Members", value: "2.4K", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Temporal Events", value: "8", icon: Calendar, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Integration Slots", value: "3/5", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-[3rem] border border-white/5 bg-card/40 backdrop-blur-sm group relative overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-700 h-full">
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -mr-16 -mt-16`} />
                <CardContent className="p-10 relative z-10 flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start mb-6">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] opacity-40 italic leading-none">{stat.label}</p>
                         <p className="text-4xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-background/50 flex items-center justify-center border border-white/5 ${stat.color} group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 shadow-inner`}>
                         <stat.icon size={28} />
                      </div>
                   </div>
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
                        <Trophy size={48} className="text-primary" /> INITIALIZE GUILD CHARTER
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[72px] italic leading-none">Execute institutional collective architecture request</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Guild Nomenclature</Label>
                        <Input placeholder="E.G. QUANTUM COMPUTING CIRCLE" value={newClub.name} onChange={e => setNewClub({...newClub, name: e.target.value.toUpperCase()})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Guild Master Node</Label>
                        <Input placeholder="E.G. ALEXANDER VANCE" value={newClub.lead} onChange={e => setNewClub({...newClub, lead: e.target.value.toUpperCase()})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Node Count Target</Label>
                        <Input placeholder="E.G. 120" value={newClub.members} onChange={e => setNewClub({...newClub, members: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Core Specialization</Label>
                        <Input placeholder="E.G. NEURAL ENTROPY ANALYSIS" value={newClub.activities} onChange={e => setNewClub({...newClub, activities: e.target.value.toUpperCase()})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                  </div>
                  <Button onClick={addClub} disabled={isSubmitting} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE CHARTER SEQUENCE // DEPLOY NODE"}
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GUILD GRID */}
        <div className="space-y-12">
           <div className="flex items-center justify-between px-10">
              <div className="space-y-3">
                 <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Institutional Registry</h2>
                 <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Verified Collective Architectures // Guild Nexus Manifest</p>
              </div>
              <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 border border-white/5 text-primary italic shadow-inner">{clubs.length} Guilds Synced</Badge>
           </div>

           <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
             {clubs.map((club, index) => (
               <motion.div
                 key={club.id}
                 initial={{ opacity: 0, scale: 0.95, y: 30 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 transition={{ delay: index * 0.1, duration: 0.6 }}
                 whileHover={{ y: -12 }}
               >
                 <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 group bg-card/40 backdrop-blur-sm overflow-hidden h-full relative">
                   <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${clubColors[club.name] || "from-primary to-blue-600"} opacity-5 blur-3xl group-hover:opacity-20 group-hover:scale-150 transition-all duration-1000 -mr-32 -mt-32 pointer-events-none`} />
                   
                   {/* Visual Identity */}
                   <div className={`h-64 relative overflow-hidden`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${clubColors[club.name] || "from-primary to-blue-600"} transition-transform duration-700 group-hover:scale-110`} />
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_0%_0%,white_0%,transparent_50%)]" />
                      <div className="absolute inset-12 flex flex-col justify-end">
                         <Badge className="w-fit bg-white/20 backdrop-blur-md text-white border-white/20 font-black italic text-[9px] uppercase tracking-widest px-4 h-7 rounded-lg mb-4 italic">
                            ACTIVE NODE
                         </Badge>
                         <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none group-hover:translate-x-4 transition-transform duration-700">
                           {club.name}
                         </h3>
                      </div>
                   </div>

                   <CardContent className="p-12 space-y-10 relative z-10">
                     <div className="flex justify-between items-center bg-background/40 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white/5 group-hover:bg-background/80 group-hover:shadow-inner transition-all duration-700">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-primary/20 transition-all duration-700">
                              <Users size={24} className="text-primary opacity-30 group-hover:opacity-100 transition-opacity duration-700" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] opacity-30 font-black tracking-widest leading-none">CAPACITY</p>
                              <p className="text-lg font-black italic uppercase text-foreground leading-none">{club.members} Elite Nodes</p>
                           </div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                     </div>

                     <div className="space-y-4">
                       <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] ml-2 italic leading-none">Core Specialization</p>
                       <p className="text-lg font-black leading-relaxed italic text-foreground/80 group-hover:text-foreground transition-colors duration-700">{club.activities}</p>
                     </div>

                     {/* Lead Identity */}
                     <div className="flex items-center gap-6 bg-background/50 p-6 rounded-[3rem] border border-white/5 group-hover:bg-background/80 transition-all duration-700 shadow-inner">
                        <div className="relative group-hover:scale-110 transition-transform duration-700">
                           <div className={`absolute inset-0 rounded-2xl opacity-20 blur-xl bg-gradient-to-br ${clubColors[club.name] || "from-primary to-blue-600"}`} />
                           <Avatar className="h-16 w-16 rounded-2xl border-2 border-white/10 relative z-10">
                              <AvatarFallback className={`bg-gradient-to-br ${clubColors[club.name] || "from-primary to-blue-600"} text-white font-black italic rounded-2xl text-2xl`}>
                                {club.lead?.[0] || "U"}
                              </AvatarFallback>
                           </Avatar>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] italic leading-none mb-1">Guild Master</p>
                          <p className="text-xl font-black italic uppercase tracking-tighter text-foreground leading-none">{club.lead}</p>
                        </div>
                     </div>

                     <div className="flex gap-4 pt-6 group/actions">
                       <Button className="flex-1 h-18 rounded-[1.75rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-tighter text-lg shadow-2xl shadow-primary/30 transform group-hover:-translate-y-2 transition-all duration-700 border-none relative overflow-hidden">
                         <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                         ENLIST NODE
                       </Button>
                       <Button variant="ghost" className="h-18 w-18 rounded-[1.75rem] bg-background/50 border border-white/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-700 hover:shadow-2xl hover:scale-110 active:scale-95 group/external">
                         <ExternalLink size={24} className="group-hover/external:rotate-12 transition-transform" />
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
        </div>

        {/* AGENDA SECTION */}
        <div className="space-y-12">
           <div className="flex items-center justify-between px-10">
              <div className="space-y-3">
                 <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Temporal Operations Agenda</h2>
                 <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Scheduled Synchronizations // Collective Sync Matrix</p>
              </div>
              <Button variant="ghost" className="rounded-2xl h-14 px-10 font-black text-primary text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all group/expand border border-white/5">
                 EXPAND TIMELINE <ChevronRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </Button>
           </div>

           <Card className="rounded-[5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:w-3 transition-all duration-700" />
              <CardContent className="p-16">
                 <div className="grid gap-8">
                    {[
                       { club: "Coding Club", event: "WEEKLY CODING CONTEST // ALGO SYNC", date: "MAR 28, 2026", time: "18:00 HRS" },
                       { club: "AI/ML Club", event: "NEURAL NETWORK WORKSHOP // TENSOR FLOW", date: "MAR 30, 2026", time: "16:00 HRS" },
                       { club: "Robotics Society", event: "GUILD ASSEMBLY // HARDWARE AUDIT", date: "APR 02, 2026", time: "14:00 HRS" },
                    ].map((item, i) => (
                      <motion.div key={i} whileHover={{ x: 20 }} transition={{ duration: 0.6 }}>
                         <div className="group flex flex-col lg:flex-row justify-between items-center bg-background/40 backdrop-blur-md p-10 rounded-[3.5rem] border border-white/5 hover:border-primary/20 hover:bg-background/80 hover:shadow-2xl transition-all gap-10 relative overflow-hidden shadow-inner">
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000 text-primary">
                               <Calendar size={120} />
                            </div>
                            <div className="flex items-center gap-10 relative z-10 w-full lg:w-auto">
                               <div className="w-20 h-20 rounded-3xl bg-background border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner group-hover:rotate-12">
                                  <Calendar size={36} />
                               </div>
                               <div className="space-y-3 text-left">
                                 <p className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none group-hover:text-primary transition-colors duration-700">{item.event}</p>
                                 <Badge className="bg-primary/10 text-primary border border-primary/20 font-black text-[9px] tracking-[0.2em] uppercase px-4 h-7 rounded-lg italic shadow-inner">{item.club} // NODE</Badge>
                               </div>
                            </div>

                            <div className="flex items-center gap-12 relative z-10 w-full lg:w-auto justify-between lg:justify-end">
                               <div className="text-right space-y-2">
                                 <p className="text-2xl font-black italic text-foreground tracking-tighter leading-none">{item.date}</p>
                                 <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">{item.time}</p>
                               </div>
                               <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.5rem] bg-background shadow-inner hover:bg-primary hover:text-primary-foreground transition-all duration-500 transform group-hover:rotate-90">
                                  <ArrowRight size={28} />
                               </Button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* EMPTY STATE */}
        {clubs.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 shadow-premium text-center relative group overflow-hidden">
            <Globe className="w-[500px] h-[500px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 space-y-10">
               <div className="relative inline-block">
                  <ShieldCheck className="h-32 w-32 text-primary opacity-10 animate-pulse" />
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full scale-[2.5]" />
               </div>
               <div className="space-y-4">
                  <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Archival Void</p>
                  <p className="text-[14px] font-black text-muted-foreground/20 uppercase tracking-[0.8em] italic leading-none">Initialize charter sequence to populate collective registry</p>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageHeader>
  );
}
