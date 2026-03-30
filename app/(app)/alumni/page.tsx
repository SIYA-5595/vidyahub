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
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      "bg-primary",
      "bg-emerald-600",
      "bg-orange-500",
      "bg-pink-600",
      "bg-purple-600",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <PageHeader
      title="Global Synergy Node"
      description="Tap into an elite network of global leaders, mentors, and industry pioneers within the institutional collective"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search mentors..."
                className="h-12 w-64 pl-12 bg-white/10 border-0 text-white placeholder:text-white/30 rounded-xl outline-none focus:ring-2 focus:ring-white/20 transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-12 px-8 bg-primary text-primary hover:bg-white/90 hover:text-primary rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl"
            >
              <Plus className="w-5 h-5 text-white" />
              {showAddForm ? "CLOSE ARCHIVE" : "JOIN NETWORK"}
            </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {/* FILTERS & STATS */}
        <div className="flex flex-col xl:flex-row gap-12">
           <div className="flex-1 space-y-10">
              <div className="flex bg-secondary/10 p-1.5 rounded-2xl w-fit overflow-x-auto max-w-full">
                {["All", "Google", "Microsoft", "Amazon", "Meta", "Apple"].map((comp) => (
                  <Button
                    key={comp}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompanyFilter(comp)}
                    className={`h-10 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${companyFilter === comp ? "bg-white text-primary shadow-lg" : "text-muted-foreground hover:bg-white/50"}`}
                  >
                    {comp}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Elite Nodes", value: "5.4K", icon: GraduationCap, color: "text-primary" },
                  { label: "Synched Brands", value: "150+", icon: Briefcase, color: "text-emerald-500" },
                  { label: "Geographical Reach", value: "28", icon: MapPin, color: "text-orange-500" },
                  { label: "Active Mentors", value: "234", icon: Mail, color: "text-rose-500" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm group overflow-hidden hover:shadow-2xl transition-all duration-500">
                      <CardContent className="p-10">
                        <div className={`h-12 w-12 rounded-2xl bg-secondary/5 flex items-center justify-center ${stat.color} mb-6 group-hover:scale-110 transition-transform`}>
                           <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 mb-2 italic">{stat.label}</p>
                        <p className="text-3xl font-black italic tracking-tighter text-gray-900 leading-none">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
           </div>

           <div className="w-full xl:w-80">
              <Card className="bg-secondary/10 rounded-[3rem] border-0 shadow-sm overflow-hidden h-full">
                 <CardContent className="p-10 space-y-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Temporal Cycle</p>
                       <h3 className="text-xl font-black italic tracking-tighter uppercase text-gray-900">Batch Calibration</h3>
                    </div>
                    <div className="space-y-3">
                       {batches.map((batch) => (
                         <Button
                           key={batch}
                           variant="ghost"
                           className={`w-full justify-between h-14 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${batchFilter === batch ? "bg-white text-primary shadow-xl scale-105" : "text-muted-foreground hover:bg-white/40"}`}
                           onClick={() => setBatchFilter(batch)}
                         >
                           {batch === "All" ? "Global Class" : `Class of ${batch}`}
                           <div className={`w-2 h-2 rounded-full transition-all ${batchFilter === batch ? "bg-primary scale-125 animate-pulse" : "bg-muted-foreground/20"}`} />
                         </Button>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

         {showAddForm && (
           <Card className="rounded-[4rem] border-0 shadow-2xl bg-white overflow-hidden p-12 space-y-10">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Professional Alias</p>
                    <Input placeholder="E.G. MARCUS VANCE" value={newAlumni.name} onChange={e => setNewAlumni({...newAlumni, name: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Designation Node</p>
                    <Input placeholder="E.G. SENIOR ARCHITECT" value={newAlumni.role} onChange={e => setNewAlumni({...newAlumni, role: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Entity (Company)</p>
                    <Input placeholder="E.G. NEURAL DYNAMICS" value={newAlumni.company} onChange={e => setNewAlumni({...newAlumni, company: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Locus (Location)</p>
                    <Input placeholder="E.G. SILICON VALLEY" value={newAlumni.location} onChange={e => setNewAlumni({...newAlumni, location: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Temporal Class</p>
                    <select value={newAlumni.batch} onChange={e => setNewAlumni({...newAlumni, batch: e.target.value})} className="w-full h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 outline-none">
                       {batches.filter(b => b !== "All").map(b => <option key={b} value={b}>CLASS OF {b}</option>)}
                    </select>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Neural Link (LinkedIn)</p>
                    <Input placeholder="LINKEDIN URL" value={newAlumni.linkedin} onChange={e => setNewAlumni({...newAlumni, linkedin: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
              </div>
              <Button onClick={joinNetwork} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : "EXECUTE SYNCHRONIZATION"}
              </Button>
           </Card>
         )}

        {/* ALUMNI GRID */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Institutional Archivist</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Verified Industry Practitioners</p>
            </div>
            <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">{filteredAlumni.length} Nodes Synchronized</Badge>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAlumni.map((alumni, index) => (
              <motion.div
                key={alumni.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 group bg-white overflow-hidden relative group">
                  {/* Decorative Background Orb */}
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br transition-all duration-700 group-hover:scale-[3] rounded-full blur-3xl ${getAvatarColor(alumni.name)}`} />
                  
                  <CardContent className="p-10 pt-16 space-y-8 relative z-10 flex flex-col h-full">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="relative">
                         <div className={`absolute inset-0 rounded-3xl opacity-20 blur-xl group-hover:blur-2xl transition-all duration-700 ${getAvatarColor(alumni.name)}`} />
                         <Avatar className={`h-28 w-28 rounded-[2.5rem] shadow-2xl border-4 border-white relative z-10`}>
                           <AvatarImage src={alumni.avatar} className="object-cover" />
                           <AvatarFallback className={`text-3xl text-white font-black italic ${getAvatarColor(alumni.name)}`}>
                             {getInitials(alumni.name)}
                           </AvatarFallback>
                         </Avatar>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tighter text-gray-900 uppercase leading-none group-hover:text-primary transition-colors">
                          {alumni.name}
                        </h3>
                        <Badge className="bg-primary/10 text-primary border-0 font-black uppercase tracking-widest text-[9px] px-3 h-6 rounded-lg pointer-events-none">
                          {alumni.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-secondary/5 p-6 rounded-[2rem] space-y-4 border border-secondary/10 group-hover:bg-white group-hover:shadow-inner transition-colors">
                       {[
                         { icon: Briefcase, text: alumni.company },
                         { icon: MapPin, text: alumni.location },
                         { icon: GraduationCap, text: `Batch ${alumni.batch}` }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">
                           <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                              <item.icon size={14} className="text-primary opacity-40" />
                           </div>
                           {item.text}
                         </div>
                       ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic tracking-tighter text-lg shadow-xl shadow-primary/20 transform group-hover:-translate-y-1 transition-all">
                        SYNCHRONIZE
                      </Button>

                      <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-secondary/5 text-primary hover:bg-primary hover:text-white transition-all border border-transparent hover:shadow-xl hover:scale-110">
                        <Linkedin className="h-6 w-6" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
            <div className="relative inline-block mb-8">
               <Network className="h-24 w-24 text-primary opacity-10" />
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full scale-150" />
            </div>
            <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase">Synchronicity Failed</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Expand signal parameters to identify potential nodes</p>
          </motion.div>
        )}
      </div>
    </PageHeader>
  );
}
