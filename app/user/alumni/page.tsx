"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Network,
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Linkedin,
  Plus,
  Loader2,
  Globe,
  Users,
  Award
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

const batches = ["All", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];

interface Alumni {
  id: string;
  name: string;
  role: string;
  company: string;
  batch: string;
  location: string;
  linkedin: string;
  avatar?: string;
}

export default function AlumniPage() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  const [newAlumni, setNewAlumni] = useState({
    name: "",
    role: "",
    company: "",
    batch: "2024",
    location: "",
    linkedin: ""
  });

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "alumni-network"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlumniList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alumni)));
    });
    return () => unsubscribe();
  }, []);

  const joinNetwork = async () => {
    if (!newAlumni.name || !newAlumni.role || !newAlumni.company) {
      toast.error("Manifest requires identity and professional parameters");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "alumni-network"), {
        ...newAlumni,
        createdAt: serverTimestamp()
      });
      setNewAlumni({ name: "", role: "", company: "", batch: "2024", location: "", linkedin: "" });
      setShowAddForm(false);
      toast.success("Professional node synchronized with institutional matrix");
    } catch {
      toast.error("Synchronization failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAlumni = alumniList.filter((alumni) => {
    const matchesSearch = alumni.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCompany =
      companyFilter === "All" || alumni.company === companyFilter;

    const matchesBatch =
      batchFilter === "All" || alumni.batch === batchFilter;

    return matchesSearch && matchesCompany && matchesBatch;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-primary to-blue-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-amber-600",
      "from-rose-500 to-pink-600",
      "from-purple-500 to-indigo-600",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <PageHeader
      title="Global Synergy Node"
      description="Tap into an elite network of global leaders, mentors, and industry pioneers within the institutional collective"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
           <div className="relative hidden lg:block group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within/search:text-primary transition-colors duration-500" />
              <Input
                placeholder="SEARCH MENTORS..."
                className="h-11 w-72 pl-12 bg-background/40 border border-white/5 text-foreground placeholder:text-muted-foreground/10 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black italic uppercase tracking-widest text-[9px] shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all border-none relative overflow-hidden group/btn"
             >
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <Plus className={`w-5 h-5 transition-transform duration-700 ${showAddForm ? "rotate-45" : ""}`} />
               {showAddForm ? "CLOSE ARCHIVE" : "JOIN NETWORK"}
            </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {/* FILTERS & STATS */}
        <div className="flex flex-col xl:flex-row gap-16">
           <div className="flex-1 space-y-12">
              <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl w-fit overflow-x-auto max-w-full border border-white/5 shadow-inner scrollbar-hide">
                {["All", "Google", "Microsoft", "Amazon", "Meta", "Apple"].map((comp) => (
                  <Button
                    key={comp}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompanyFilter(comp)}
                    className={`h-12 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all italic border-none ${companyFilter === comp ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105" : "text-muted-foreground/40 hover:bg-white/5 hover:text-foreground"}`}
                  >
                    {comp}
                  </Button>
                ))}
              </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {[
                  { label: "Elite Nodes", value: "5.4K", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Synched Brands", value: "150+", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Geographical Reach", value: "28", icon: MapPin, color: "text-orange-500", bg: "bg-orange-500/10" },
                  { label: "Active Mentors", value: "234", icon: Mail, color: "text-rose-500", bg: "bg-rose-500/10" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="rounded-[3rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium group overflow-hidden hover:shadow-premium-hover transition-all duration-700 h-full relative">
                      <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -mr-16 -mt-16`} />
                      <CardContent className="p-12 relative z-10 flex flex-col justify-between h-full">
                        <div className={`h-16 w-16 rounded-[1.5rem] bg-background/50 flex items-center justify-center border border-white/5 ${stat.color} mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 shadow-inner`}>
                           <stat.icon size={32} />
                        </div>
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic leading-none">{stat.label}</p>
                           <p className="text-4xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
           </div>

           <div className="w-full xl:w-96">
              <Card className="bg-card/40 backdrop-blur-sm border border-white/5 shadow-premium overflow-hidden h-full rounded-[4rem] group">
                 <div className="absolute top-0 left-0 w-full h-2 bg-primary/20 group-hover:h-3 transition-all duration-700" />
                 <CardContent className="p-12 space-y-10">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic leading-none flex items-center gap-3">
                         <Globe size={14} className="animate-spin-slow" /> Temporal Cycle
                       </p>
                       <h3 className="text-3xl font-black italic tracking-tighter uppercase text-foreground leading-none">Batch Calibration</h3>
                    </div>
                    <div className="space-y-4">
                       {batches.map((batch) => (
                         <Button
                           key={batch}
                           variant="ghost"
                           className={`w-full justify-between h-16 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] italic transition-all border border-white/5 relative overflow-hidden group/batch ${batchFilter === batch ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.02] border-none" : "bg-background/20 text-muted-foreground/40 hover:bg-white/5 hover:text-foreground hover:scale-105"}`}
                           onClick={() => setBatchFilter(batch)}
                         >
                           {batch === "All" ? "Global Class" : `Class of ${batch}`}
                           <div className={`w-3 h-3 rounded-full transition-all duration-700 ${batchFilter === batch ? "bg-primary-foreground scale-125 animate-pulse" : "bg-white/10 group-hover/batch:bg-primary/20"}`} />
                         </Button>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

         {showAddForm && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
               <Card className="rounded-[4.5rem] border border-white/5 shadow-premium-hover bg-card/60 backdrop-blur-xl overflow-hidden p-16 space-y-16 transition-all duration-700 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(30,136,229,0.05),transparent_70%)] pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none flex items-center gap-6">
                        <Award size={48} className="text-primary" /> INITIALIZE PROFESSIONAL NODE
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[72px] italic leading-none">Capture career telemetry for institutional synchronization</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Professional Alias</Label>
                        <Input placeholder="E.G. ALEXANDER VANCE" value={newAlumni.name} onChange={e => setNewAlumni({...newAlumni, name: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-primary/20 transition-all"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Designation Node</Label>
                        <Input placeholder="E.G. SENIOR ARCHITECT" value={newAlumni.role} onChange={e => setNewAlumni({...newAlumni, role: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-primary/20 transition-all"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Entity (Company)</Label>
                        <Input placeholder="E.G. NEURAL DYNAMICS" value={newAlumni.company} onChange={e => setNewAlumni({...newAlumni, company: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-primary/20 transition-all"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Locus (Location)</Label>
                        <Input placeholder="E.G. SILICON VALLEY" value={newAlumni.location} onChange={e => setNewAlumni({...newAlumni, location: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-primary/20 transition-all"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Temporal Class</Label>
                        <select value={newAlumni.batch} onChange={e => setNewAlumni({...newAlumni, batch: e.target.value})} className="w-full h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 outline-none text-foreground cursor-pointer hover:bg-background/80 transition-all appearance-none">
                           {batches.filter(b => b !== "All").map(b => <option key={b} value={b} className="bg-card text-foreground">CLASS OF {b}</option>)}
                        </select>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Neural Link (LinkedIn)</Label>
                        <Input placeholder="LINKEDIN URL NODE" value={newAlumni.linkedin} onChange={e => setNewAlumni({...newAlumni, linkedin: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-primary/20 transition-all"/>
                     </div>
                  </div>

                  <Button onClick={joinNetwork} disabled={isSubmitting} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE SYNC PROTOCOL // ADD NODE"}
                  </Button>
               </Card>
            </motion.div>
         )}

        {/* ALUMNI GRID */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Institutional Archivist</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Verified Industry Practitioners // Professional Collective Manifest</p>
            </div>
            <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 border border-white/5 text-primary italic shadow-inner">{filteredAlumni.length} Nodes Synchronized</Badge>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAlumni.map((alumni, index) => (
              <motion.div
                key={alumni.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
                whileHover={{ y: -12 }}
              >
                <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 group bg-card/40 backdrop-blur-sm overflow-hidden relative h-full">
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${getAvatarColor(alumni.name)} opacity-5 blur-3xl group-hover:opacity-20 group-hover:scale-150 transition-all duration-1000 -mr-24 -mt-24 pointer-events-none`} />
                  
                  <CardContent className="p-12 pt-20 space-y-10 relative z-10 flex flex-col h-full">
                    <div className="flex flex-col items-center text-center space-y-8">
                      <div className="relative group-hover:scale-110 transition-transform duration-700">
                         <div className={`absolute inset-0 rounded-[3rem] opacity-30 blur-2xl group-hover:blur-3xl transition-all duration-700 bg-gradient-to-br ${getAvatarColor(alumni.name)}`} />
                         <Avatar className="h-32 w-32 rounded-[3rem] shadow-2xl border-4 border-background relative z-10">
                           <AvatarImage src={alumni.avatar} className="object-cover" />
                           <AvatarFallback className={`text-4xl text-white font-black italic bg-gradient-to-br ${getAvatarColor(alumni.name)}`}>
                             {getInitials(alumni.name)}
                           </AvatarFallback>
                         </Avatar>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase leading-none group-hover:text-primary transition-colors duration-700 italic">
                          {alumni.name}
                        </h3>
                        <Badge className="bg-primary/20 text-primary border border-primary/20 font-black uppercase tracking-widest text-[9px] px-6 h-9 rounded-xl pointer-events-none italic shadow-inner">
                          {alumni.role} // NODE
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-background/40 backdrop-blur-sm p-8 rounded-[3rem] space-y-6 border border-white/5 group-hover:bg-background/60 transition-all duration-700 shadow-inner">
                       {[
                         { icon: Briefcase, text: alumni.company, label: "ENTITY" },
                         { icon: MapPin, text: alumni.location, label: "LOCUS" },
                         { icon: GraduationCap, text: `Batch ${alumni.batch}`, label: "CYCLE" }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none group-hover:text-muted-foreground/80 transition-colors duration-700 italic">
                           <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-primary/20 transition-all duration-700">
                              <item.icon size={20} className="text-primary opacity-30 group-hover:opacity-100 transition-opacity duration-700" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] opacity-30 leading-none mb-1">{item.label}</p>
                              <p className="leading-none text-foreground/80 group-hover:text-foreground transition-all duration-700">{item.text}</p>
                           </div>
                         </div>
                       ))}
                    </div>

                    <div className="flex gap-4 pt-8 mt-auto group/actions">
                      <Button className="flex-1 h-18 rounded-[1.75rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-tighter text-lg shadow-2xl shadow-primary/30 transform group-hover:-translate-y-2 transition-all duration-700 border-none relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                        SYNCHRONIZE
                      </Button>

                      <Button variant="ghost" className="h-18 w-18 rounded-[1.75rem] bg-white/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-700 border border-white/5 hover:border-primary/20 hover:shadow-2xl hover:scale-110 active:scale-95">
                        <Linkedin size={32} className="group-hover:rotate-12 transition-transform h-8 w-8" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* EMPTY STATE */}
        {filteredAlumni.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-56 bg-background/20 rounded-[5rem] border-4 border-dashed border-white/5 shadow-premium text-center relative group overflow-hidden">
            <Users className="w-[400px] h-[400px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 space-y-8">
               <div className="relative inline-block">
                  <Network className="h-32 w-32 text-primary opacity-10 animate-pulse" />
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full scale-[2]" />
               </div>
               <div className="space-y-4">
                  <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Synch Failed</p>
                  <p className="text-[12px] font-black text-muted-foreground/20 uppercase tracking-[0.6em] italic leading-none">Incompatible frequency node identification. Expand signal parameters.</p>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageHeader>
  );
}
