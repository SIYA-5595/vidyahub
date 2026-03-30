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
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="flex bg-white/10 p-1 rounded-xl">
             {(["dashboard", "upload", "explore", "my"] as Tab[]).map((t) => (
               <Button
                 key={t}
                 variant="ghost"
                 size="sm"
                 onClick={() => setTab(t)}
                 className={`h-8 rounded-lg px-4 font-bold text-[10px] uppercase tracking-widest transition-all ${tab === t ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"}`}
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
                  { label: "Total Asset Nodes", value: talents.length, icon: Star, color: "text-amber-500" },
                  { label: "Aggregate Appreciation", value: talents.reduce((a, b) => a + b.likes, 0), icon: Heart, color: "text-rose-500" },
                  { label: "Trending Vector", value: "Aesthetics 🔥", icon: Trophy, color: "text-blue-500" },
                ].map((stat) => (
                  <Card key={stat.label} className="rounded-[2.5rem] border-0 bg-white shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <CardContent className="p-10 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                        <p className="text-4xl font-black italic tracking-tighter text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`h-14 w-14 rounded-2xl bg-secondary/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-7 w-7" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <Card className="rounded-[3rem] border-0 bg-primary text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                    <CardContent className="p-12 space-y-6 relative z-10">
                       <Badge className="bg-white/20 text-white border-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">Action Required</Badge>
                       <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Initialize Project Upload</h2>
                       <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">Broadcast your creative manifestations to the institutional catalog for validation and peer-review appreciation.</p>
                       <Button onClick={() => setTab('upload')} className="h-16 px-10 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-2xl font-black italic text-lg tracking-tight shadow-xl">
                          INITIALIZE BROADCAST
                       </Button>
                    </CardContent>
                 </Card>

                 <Card className="rounded-[3rem] border-0 bg-white shadow-sm overflow-hidden relative group">
                    <CardContent className="p-12 space-y-6">
                       <div className="flex justify-between items-center">
                          <Badge className="bg-rose-500/10 text-rose-500 border-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">Trending Now</Badge>
                          <Trophy className="text-amber-500" />
                       </div>
                       <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">Explore The Catalyst</h2>
                       <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm">Browse the verified institutional archive of student-driven creative excellence and technical innovation.</p>
                       <Button variant="secondary" onClick={() => setTab('explore')} className="h-16 px-10 rounded-2xl font-black italic text-lg tracking-tight bg-secondary/10 hover:bg-secondary/20">
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
              <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-12 pb-4">
                  <CardTitle className="text-3xl font-black italic tracking-tight uppercase">Registry Intake</CardTitle>
                </CardHeader>
                <CardContent className="p-12 pt-4 space-y-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Creation Designation</label>
                       <Input
                         placeholder="e.g. Algorithmic Art Interface"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="h-14 rounded-2xl bg-secondary/5 border-0 font-black text-lg px-6"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Creative Category</label>
                       <Input
                         placeholder="e.g. Digital Media, Music, Engineering"
                         value={category}
                         onChange={(e) => setCategory(e.target.value)}
                         className="h-14 rounded-2xl bg-secondary/5 border-0 font-black text-lg px-6"
                       />
                    </div>
                  </div>
                  <Button onClick={uploadTalent} disabled={isSubmitting} className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black italic tracking-tight text-xl shadow-xl shadow-primary/20">
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Upload className="mr-3 h-6 w-6" />}
                    {isSubmitting ? "ARCHIVING..." : "ARCHIVE CREATION"}
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
                   <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-700 group overflow-hidden">
                     <CardContent className="p-10 space-y-6">
                       <div className="space-y-2">
                          <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase leading-tight group-hover:text-primary transition-colors">{talent.title}</h2>
                          <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-black text-[10px] tracking-widest uppercase px-3 py-1">
                            {talent.category}
                          </Badge>
                       </div>
                       
                       <div className="flex justify-between items-center pt-4">
                         <Button
                           variant="outline"
                           onClick={() => likeTalent(talent.id)}
                           className="h-12 px-6 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black italic uppercase text-[10px] tracking-widest gap-2"
                         >
                           <Heart className="h-4 w-4" /> RECOGNIZE ({talent.likes})
                         </Button>

                         {(user?.uid === talent.creatorId) && (
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => deleteTalent(talent.id)}
                             className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                           >
                             <Trash size={20} />
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Local Archive Sequence</h3>
                 <Badge variant="secondary" className="rounded-full px-4 h-8 font-black">{talents.filter(t => t.creatorId === user?.uid).length} NODES</Badge>
              </div>

              {talents.filter(t => t.creatorId === user?.uid).length === 0 ? (
                <div className="text-center py-40 bg-secondary/5 rounded-[3rem] border-4 border-dashed border-secondary/20">
                   <Trophy className="mx-auto h-20 w-20 text-muted-foreground opacity-10 mb-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Void Registry: Zero assets archived</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {talents.filter(t => t.creatorId === user?.uid).map((talent) => (
                    <Card key={talent.id} className="rounded-[1.5rem] border-0 bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden">
                      <CardContent className="p-8 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-secondary/5 flex items-center justify-center">
                             <Star className="text-amber-500 h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-lg font-black italic tracking-tight uppercase leading-none mb-2">
                              {talent.title}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                              Sector: {talent.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="px-4 py-2 bg-rose-500/5 rounded-xl border border-rose-500/10">
                              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center">Appreciation Index</p>
                              <p className="text-xl font-black text-rose-500 text-center">{talent.likes}</p>
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => deleteTalent(talent.id)} className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash size={20} />
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
