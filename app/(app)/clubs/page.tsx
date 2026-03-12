"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Users,
  Calendar,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

/* ---------------------------------- */

const clubColors: Record<string, string> = {
  "Coding Club": "from-primary to-primary/60",
  "Robotics Society": "from-cyan-500 to-cyan-400",
  "AI/ML Club": "from-primary/80 to-primary/40",
  "Cybersecurity Club": "from-cyan-600 to-cyan-500",
  "Design Club": "from-primary/60 to-primary/30",
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
      toast.error("Manifest requires name and master designation");
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
      toast.success("New Guild chartered successfully");
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
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="flex bg-white/10 p-1 rounded-xl">
             {["all", "joined", "recommended"].map((tab) => (
               <Button
                 key={tab}
                 variant="ghost"
                 size="sm"
                 onClick={() => setActiveTab(tab)}
                 className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === tab ? "bg-white text-primary shadow-xl" : "text-white/40 hover:text-white"}`}
               >
                 {tab === "all" ? "EXPLORE" : tab === "joined" ? "CONNECTED" : "SUGGESTED"}
               </Button>
             ))}
           </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-10 px-6 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3"
            >
             <Award className="w-5 h-5 text-primary" />
             {showAddForm ? "CLOSE ARCHIVE" : "CHARTER NEW GUILD"}
           </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {/* STATS OVERVIEW */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Nodes", value: "15", icon: Award, color: "text-primary" },
            { label: "Elite Members", value: "2.4K", icon: Users, color: "text-emerald-500" },
            { label: "Temporal Events", value: "8", icon: Calendar, color: "text-orange-500" },
            { label: "Integration Slots", value: "3/5", icon: ChevronRight, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-[2.5rem] border-0 bg-white group relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700">
                <CardContent className="p-10">
                  <div className="flex justify-between items-start">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 italic">{stat.label}</p>
                        <p className="text-4xl font-black italic tracking-tighter text-gray-900 leading-none">{stat.value}</p>
                     </div>
                     <div className={`w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-7 h-7" />
                     </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

         {showAddForm && (
           <Card className="rounded-[4rem] border-0 shadow-2xl bg-white overflow-hidden p-12 space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Guild Nomenclature</p>
                    <Input placeholder="E.G. QUANTUM COMPUTING CIRCLE" value={newClub.name} onChange={e => setNewClub({...newClub, name: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Guild Master Node</p>
                    <Input placeholder="E.G. DR. ARIA VANCE" value={newClub.lead} onChange={e => setNewClub({...newClub, lead: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Member Count Estimate</p>
                    <Input placeholder="E.G. 120" value={newClub.members} onChange={e => setNewClub({...newClub, members: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Core Specialization</p>
                    <Input placeholder="E.G. NEURAL ENTROPY ANALYSIS" value={newClub.activities} onChange={e => setNewClub({...newClub, activities: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
              </div>
              <Button onClick={addClub} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : "EXECUTE CHARTER"}
              </Button>
           </Card>
         )}

        {/* GUILD GRID */}
        <div className="space-y-10">
           <div className="flex items-center justify-between px-6">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Institutional Registry</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Verified Collective Architectures</p>
              </div>
              <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">Registry Loaded: {clubs.length}</Badge>
           </div>

           <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
             {clubs.map((club, index) => (
               <motion.div
                 key={club.id}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1, duration: 0.6 }}
                 whileHover={{ y: -12 }}
               >
                 <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 group bg-white overflow-hidden border border-transparent hover:border-primary/5 group">
                   {/* Visual Identity */}
                   <div className={`h-48 relative bg-gradient-to-br ${clubColors[club.name] || "from-primary to-primary/60"}`}>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_0%_0%,white_0%,transparent_50%)]" />
                      <div className="absolute inset-x-10 bottom-10 flex flex-col gap-2">
                         <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none transform group-hover:translate-x-2 transition-transform">
                           {club.name}
                         </h3>
                      </div>
                   </div>

                   <CardContent className="p-10 space-y-8">
                     <div className="flex justify-between items-center bg-secondary/5 p-5 rounded-[1.5rem] border border-secondary/10 group-hover:bg-white group-hover:shadow-inner transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              <Users className="w-5 h-5 text-primary opacity-40" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                              {club.members} Elite Nodes
                           </span>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-0 h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-emerald-500/10">Active</Badge>
                     </div>

                     <div className="space-y-3">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Core Specialization</p>
                       <p className="text-sm font-black leading-relaxed italic text-gray-900">{club.activities}</p>
                     </div>

                     {/* Lead Identity */}
                     <div className="flex items-center gap-6 bg-secondary/5 p-5 rounded-[2rem] border border-secondary/10 group-hover:bg-white transition-colors">
                        <Avatar className="h-14 w-14 rounded-2xl ring-4 ring-white shadow-xl">
                          <AvatarFallback className="bg-primary text-white font-black italic rounded-2xl text-xl">
                            {club.lead?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                       <div className="space-y-1">
                         <p className="text-sm font-black uppercase tracking-tight text-gray-900 leading-none">{club.lead}</p>
                         <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Guild Master</p>
                       </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                       <Button className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic tracking-tighter text-lg shadow-xl shadow-primary/20 transform group-hover:-translate-y-1 transition-all group-hover:shadow-2xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                         ENLIST NODE
                       </Button>
                       <Button variant="ghost" size="icon" className="h-16 w-16 rounded-2xl bg-secondary/5 border border-primary/5 hover:bg-primary hover:shadow-xl transition-all group/btn">
                         <ExternalLink className="h-6 w-6 group-hover/btn:text-white transition-colors" />
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
        </div>

        {/* AGENDA SECTION */}
        <div className="space-y-10">
           <div className="flex items-center justify-between px-6">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Temporal Operations Agenda</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Scheduled Synchronizations</p>
              </div>
              <Button variant="ghost" className="rounded-xl h-12 px-8 font-black text-primary text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all">
                 EXPAND TIMELINE <ChevronRight className="ml-3 w-5 h-5" />
              </Button>
           </div>

           <Card className="rounded-[4rem] border-0 bg-white shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-700">
              <CardContent className="p-12 md:p-16">
                 <div className="grid gap-6">
                   {[
                      { club: "Coding Club", event: "Weekly Coding Contest", date: "Mar 5, 2024", time: "6:00 PM" },
                      { club: "AI/ML Club", event: "Neural Network Workshop", date: "Mar 7, 2024", time: "4:00 PM" },
                      { club: "Robotics Society", event: "Robot Build", date: "Mar 9, 2024", time: "2:00 PM" },
                   ].map((item, i) => (
                     <motion.div key={i} whileHover={{ x: 12 }} transition={{ duration: 0.4 }}>
                        <div className="group flex flex-col lg:flex-row justify-between items-center bg-secondary/5 p-8 rounded-[2.5rem] border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-2xl transition-all gap-8 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                              <Calendar size={80} />
                           </div>
                           <div className="flex items-center gap-8 relative z-10 w-full lg:w-auto">
                              <div className="w-16 h-16 rounded-2xl bg-white border border-secondary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                 <Calendar className="w-8 h-8" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 leading-none group-hover:text-primary transition-colors">{item.event}</p>
                                <Badge variant="outline" className="border-primary/20 text-primary font-black text-[9px] tracking-widest uppercase px-3 italic">{item.club}</Badge>
                              </div>
                           </div>

                           <div className="flex items-center gap-12 relative z-10 w-full lg:w-auto justify-between lg:justify-end">
                              <div className="text-right space-y-1">
                                <p className="text-xl font-black italic text-gray-900 tracking-tighter leading-none">{item.date}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">{item.time}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white shadow-sm hover:bg-primary hover:text-white transition-all transform group-hover:rotate-90">
                                 <ChevronRight className="w-6 h-6" />
                              </Button>
                           </div>
                        </div>
                     </motion.div>
                   ))}
              {clubs.length === 0 && !isLoading && (
                <div className="col-span-full py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
                   <Users className="w-24 h-24 mx-auto mb-8 opacity-5" />
                   <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">Archival Void</p>
                   <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize charter sequence to populate registry</p>
                </div>
              )}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </PageHeader>
  );
}
