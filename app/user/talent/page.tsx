"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Heart,
  Upload,
  Star,
  Trash,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { motion, AnimatePresence } from "framer-motion";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, increment } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

type Tab = "dashboard" | "upload" | "explore" | "my";

type Talent = {
  id: string;
  title: string;
  category: string;
  likes: number;
  creatorId: string;
};

export default function TalentShowcase() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const [talents, setTalents] = useState<Talent[]>([]);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "talents"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTalents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Talent)));
    });
    return () => unsubscribe();
  }, []);

  const uploadTalent = async () => {
    if (!title || !category) {
      toast.error("Creative parameters required for registry");
      return;
    }

    if (!user) {
      toast.error("Identity verification required for archive");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "talents"), {
        title,
        category,
        likes: 0,
        creatorId: user.uid,
        createdAt: serverTimestamp()
      });

      setTitle("");
      setCategory("");
      setTab("explore");
      toast.success("Creation manifested in institutional archive");
    } catch {
       toast.error("Archival sequence failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const likeTalent = async (id: string) => {
    try {
      await updateDoc(doc(db, "talents", id), {
        likes: increment(1)
      });
      toast.success("Recognition synchronized");
    } catch {
      toast.error("Synchronization failed");
    }
  };

  const deleteTalent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "talents", id));
      toast.success("Model purged from registry");
    } catch {
      toast.error("Purge sequence failed");
    }
  };

  return (
    <PageHeader
      title="Creative Spectrum"
      description="Showcase institutional excellence and individual creative paradigms across the campus collective"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium">
           <div className="flex bg-background/40 p-1 rounded-xl shadow-inner border border-white/5">
             {(["dashboard", "upload", "explore", "my"] as Tab[]).map((t) => (
               <Button
                 key={t}
                 variant="ghost"
                 size="sm"
                 onClick={() => setTab(t)}
                 className={`h-10 rounded-lg px-8 font-black text-[10px] uppercase tracking-widest transition-all italic ${tab === t ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
               >
                 {t === 'dashboard' ? 'Analytics' : t === 'upload' ? 'Initialize' : t === 'explore' ? 'Catalogue' : 'My Nodes'}
               </Button>
             ))}
           </div>
        </div>
      }
    >
      <div className="space-y-12">
        <AnimatePresence mode="wait">
          {/* ================= DASHBOARD ================= */}
          {tab === "dashboard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { label: "Total Asset Nodes", value: talents.length, icon: Star, color: "text-amber-400" },
                  { label: "Aggregate Appreciation", value: talents.reduce((a, b) => a + b.likes, 0), icon: Heart, color: "text-rose-400" },
                  { label: "Trending Vector", value: "Aesthetics 🔥", icon: Trophy, color: "text-blue-400" },
                ].map((stat) => (
                  <Card key={stat.label} className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-700">
                    <CardContent className="p-10 flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 opacity-40 italic leading-none">{stat.label}</p>
                        <p className="text-4xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</p>
                      </div>
                      <div className={`h-16 w-16 rounded-[1.5rem] bg-background/50 border border-white/5 shadow-inner flex items-center justify-center ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                        <stat.icon className="h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <Card className="rounded-[3rem] border border-primary/20 bg-primary/10 backdrop-blur-sm text-foreground overflow-hidden relative group hover:shadow-premium-hover transition-all duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                    <CardContent className="p-12 space-y-8 relative z-10">
                       <Badge className="bg-primary/20 text-primary border border-primary/20 rounded-lg px-4 py-1.5 text-[10px] font-black italic uppercase tracking-widest leading-none">Action Required</Badge>
                       <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground">Initialize Project Upload</h2>
                       <p className="text-muted-foreground/70 text-sm font-medium leading-relaxed max-w-sm italic">Broadcast your creative manifestations to the institutional catalog for validation and peer-review appreciation.</p>
                       <Button onClick={() => setTab('upload')} className="h-16 px-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 border-none transition-all active:scale-95">
                          INITIALIZE BROADCAST
                       </Button>
                    </CardContent>
                 </Card>

                 <Card className="rounded-[3rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden relative group hover:shadow-premium-hover transition-all duration-700">
                    <CardContent className="p-12 space-y-8">
                       <div className="flex justify-between items-center">
                          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg px-4 py-1.5 text-[10px] font-black italic uppercase tracking-widest leading-none shadow-inner">Trending Now</Badge>
                          <Trophy className="text-amber-400 group-hover:rotate-12 transition-transform" />
                       </div>
                       <h2 className="text-5xl font-black italic tracking-tighter text-foreground uppercase leading-none">Explore The Catalyst</h2>
                       <p className="text-muted-foreground/60 text-sm font-medium leading-relaxed max-w-sm italic">Browse the verified institutional archive of student-driven creative excellence and technical innovation.</p>
                       <Button variant="secondary" onClick={() => setTab('explore')} className="h-16 px-10 rounded-2xl font-black italic uppercase tracking-widest text-[10px] bg-background/40 hover:bg-background/60 text-primary border border-primary/20 transition-all active:scale-95 shadow-inner">
                          ENTER CATALOGUE
                       </Button>
                    </CardContent>
                 </Card>
              </div>
            </motion.div>
          )}

          {/* ================= UPLOAD ================= */}
          {tab === "upload" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
              <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700">
                <CardHeader className="p-12 pb-6">
                  <CardTitle className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Registry Intake</CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 opacity-40 italic mt-2 leading-none">Institutional creative archival gateway</p>
                </CardHeader>
                <CardContent className="p-12 pt-4 space-y-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic leading-none">Creation Designation</label>
                       <Input
                         placeholder="e.g. Algorithmic Art Interface"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-8 text-foreground placeholder:text-muted-foreground/10 focus:ring-2 focus:ring-primary/20 transition-all"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic leading-none">Creative Category</label>
                       <Input
                         placeholder="e.g. Digital Media, Music, Engineering"
                         value={category}
                         onChange={(e) => setCategory(e.target.value)}
                         className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-8 text-foreground placeholder:text-muted-foreground/10 focus:ring-2 focus:ring-primary/20 transition-all"
                       />
                    </div>
                  </div>
                  <Button onClick={uploadTalent} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={32} className="animate-spin mx-auto" /> : <Upload className="mr-3 h-8 w-8" />}
                    {isSubmitting ? "ARCHIVING CREATION..." : "ARCHIVE CREATION"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ================= EXPLORE ================= */}
          {tab === "explore" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {talents.map((talent, _i) => (
                <motion.div key={talent.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: _i * 0.05 }}>
                   <Card className="rounded-[3rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden relative">
                     <CardContent className="p-10 space-y-8">
                       <div className="space-y-4">
                          <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none group-hover:text-primary transition-colors">{talent.title}</h2>
                          <Badge variant="outline" className="rounded-xl border-primary/20 bg-primary/10 text-primary font-black italic text-[10px] tracking-widest uppercase px-4 py-1.5 leading-none shadow-inner">
                            {talent.category}
                          </Badge>
                       </div>
                       
                       <div className="flex justify-between items-center pt-8 border-t border-white/5">
                         <Button
                           variant="outline"
                           onClick={() => likeTalent(talent.id)}
                           className="h-14 px-8 rounded-2xl border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-400 hover:text-white transition-all font-black italic uppercase text-[10px] tracking-widest gap-3 shadow-inner group/heart"
                         >
                           <Heart className="h-5 w-5 group-hover/heart:scale-125 transition-transform" /> RECOGNIZE ({talent.likes})
                         </Button>

                         {(user?.uid === talent.creatorId) && (
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => deleteTalent(talent.id)}
                             className="h-14 w-14 rounded-2xl text-muted-foreground/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                           >
                             <Trash size={24} />
                           </Button>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ================= MY TALENTS ================= */}
          {tab === "my" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-10">
              <div className="flex justify-between items-center px-6">
                 <h3 className="text-xs font-black italic uppercase tracking-[0.4em] text-muted-foreground/40 opacity-40 leading-none">Local Archive Sequence</h3>
                 <Badge variant="secondary" className="rounded-xl px-6 h-10 font-black italic uppercase text-[10px] tracking-widest leading-none bg-background/40 backdrop-blur-sm border border-white/5 text-foreground transition-all shadow-inner">{talents.filter(t => t.creatorId === user?.uid).length} NODES</Badge>
              </div>

              {talents.filter(t => t.creatorId === user?.uid).length === 0 ? (
                <div className="text-center py-48 bg-background/40 backdrop-blur-sm rounded-[4rem] border-4 border-dashed border-white/5 transition-all group shadow-inner">
                   <Trophy className="mx-auto h-32 w-32 text-primary opacity-[0.05] mb-10 group-hover:scale-110 transition-transform duration-700" />
                   <p className="text-[10px] font-black italic uppercase tracking-[0.5em] text-muted-foreground/20 leading-none">Void Registry: Zero assets archived</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {talents.filter(t => t.creatorId === user?.uid).map((talent) => (
                    <Card key={talent.id} className="rounded-[2rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden">
                      <CardContent className="p-8 flex justify-between items-center">
                        <div className="flex items-center gap-8">
                          <div className="h-16 w-16 rounded-[1.2rem] bg-background/50 border border-white/5 shadow-inner flex items-center justify-center group-hover:rotate-6 transition-transform">
                             <Star className="text-amber-400 h-8 w-8" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-2xl font-black italic tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors leading-none">
                              {talent.title}
                            </p>
                            <p className="text-[10px] font-black italic uppercase tracking-widest text-muted-foreground/40 opacity-40 leading-none">
                              Sector: {talent.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                           <div className="px-6 py-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-inner">
                              <p className="text-[9px] font-black text-rose-400/60 uppercase tracking-widest text-center italic leading-none mb-1">Appreciation Index</p>
                              <p className="text-3xl font-black italic tracking-tighter text-rose-400 text-center leading-none">{talent.likes}</p>
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => deleteTalent(talent.id)} className="h-14 w-14 rounded-2xl text-rose-400/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100">
                              <Trash size={24} />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageHeader>
  );
}
