"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  PlusCircle,
  Trash2,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity,
  Globe,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  ChevronRight,
  Box,
  RotateCcw,
  Loader2
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";

interface SportItem {
  id: string;
  name: string;
  total: number;
  rented: number;
  dueDate?: string;
}

export default function SportsRentalPage() {
  const [items, setItems] = useState<SportItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "sports-assets"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SportItem)));
    });
    return () => unsubscribe();
  }, []);

  /* ---------- ADD ITEM ---------- */
  const addItem = async () => {
    if (!name || !total) {
      toast.error("Parameters required for athletic hardware registration");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "sports-assets"), {
        name: name.toUpperCase(),
        total: Number(total),
        rented: 0,
        createdAt: serverTimestamp()
      });
      setName("");
      setTotal("");
      setShowAddForm(false);
      toast.success("Athletic hardware successfully archived in matrix");
    } catch {
      toast.error("Registration sequence failed // Nodal error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sports-assets", id));
      toast.success("Asset purged from institutional registry");
    } catch {
      toast.error("Purge sequence failed");
    }
  };

  const rentItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || item.total - item.rented <= 0) {
      toast.error("Resource depleted: No available units for acquisition");
      return;
    }

    const due = new Date();
    due.setDate(due.getDate() + 2); // 48-hour rental window

    try {
      await updateDoc(doc(db, "sports-assets", id), {
        rented: item.rented + 1,
        dueDate: due.toISOString()
      });
      toast.success("Asset acquisition authorized // Tracking sequence active");
    } catch {
      toast.error("Authorization failed");
    }
  };

  const returnItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || item.rented <= 0) {
      toast.error("Manifest error: No units currently deployed");
      return;
    }

    try {
      await updateDoc(doc(db, "sports-assets", id), {
        rented: item.rented - 1,
        dueDate: item.rented === 1 ? null : item.dueDate // Reset due date if last item returned
      });
      toast.success("Asset return synchronized with repository");
    } catch {
      toast.error("Synchronization failed");
    }
  };

  /* ---------- FILTER ---------- */
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------- STATUS ---------- */
  const getStatus = (i: SportItem) => {
    const available = i.total - i.rented;

    if (available === 0)
      return <Badge className="bg-rose-500/20 text-rose-500 border border-rose-500/20 shadow-inner h-8 px-5 rounded-xl font-black italic text-[9px] uppercase tracking-widest italic">DEPLETED</Badge>;

    if (available < 3)
      return (
        <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-inner h-8 px-5 rounded-xl font-black italic text-[9px] uppercase tracking-widest italic">
          CRITICAL
        </Badge>
      );

    return (
      <Badge className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 shadow-inner h-8 px-5 rounded-xl font-black italic text-[9px] uppercase tracking-widest italic">
        OPTIMAL
      </Badge>
    );
  };

  /* ---------- FINE ---------- */
  const getFine = (dueDate?: string) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);

    if (today <= due) return null;

    const daysLate = Math.ceil(
      (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
    );

    return `₹${daysLate * 50}`; // ₹50 per day latency debt
  };

  return (
    <PageHeader
      title="Athletic Logistics"
      description="Equip institutional sports endeavors through our streamlined pedagogical asset rental matrix"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
           <div className="relative group/search hidden lg:block">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within/search:text-primary transition-all duration-500" />
             <Input
               placeholder="LOCATE EQUIPMENT..."
               className="h-11 w-64 pl-12 bg-background/40 border border-white/5 text-foreground placeholder:text-muted-foreground/10 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black italic text-[10px] uppercase tracking-widest shadow-inner placeholder:tracking-widest"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 border-none shadow-2xl shadow-primary/30 transition-all active:scale-95 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
            <PlusCircle className={`w-5 h-5 transition-transform duration-700 ${showAddForm ? "rotate-45" : ""}`} />
            {showAddForm ? "CLOSE ARCHIVE" : "INTAKE ASSET"}
          </Button>
          <div className="w-11 h-11 bg-background/40 border border-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      }
    >
      <div className="space-y-16">
        {/* STATS SECTION */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Assets", value: items.length, icon: Box, color: "text-amber-500", bg: "bg-amber-500/10", suffix: "NODES" },
              { label: "Active Deployments", value: items.reduce((acc, i) => acc + i.rented, 0), icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", suffix: "LIVE" },
              { label: "Arena Readiness", value: items.reduce((acc, i) => acc + (i.total - i.rented), 0), icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "READY" },
              { label: "Pending Returns", value: items.filter(i => i.rented > 0).length, icon: Calendar, color: "text-rose-500", bg: "bg-rose-500/10", suffix: "WINDOW" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="rounded-[4rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative h-full">
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
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none flex items-center gap-8">
                        <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                           <Trophy size={40} className="text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        Initialize Asset Intake
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Register new athletic hardware into institutional matrix</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Equipment Nomenclature</Label>
                        <Input placeholder="E.G. PRO MATCH SPHERE" value={name} onChange={e => setName(e.target.value.toUpperCase())} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Total Unit Propagation</Label>
                        <div className="relative group/input">
                           <Box className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input type="number" placeholder="00" value={total} onChange={e => setTotal(e.target.value)} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all"/>
                        </div>
                     </div>
                  </div>
                  <Button onClick={addItem} disabled={isSubmitting} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE INTAKE PROTOCOL // SYNC ASSET"}
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-12">
          {/* HEADER SECTION */}
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Active Logistics Inventory</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Institutional Athletic Hardware // Sequential Resource Hub</p>
            </div>
            <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 backdrop-blur-sm border border-white/5 text-primary italic shadow-inner">{filtered.length} NODES SYNCHRONIZED</Badge>
          </div>

          {/* LIST SECTION */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filtered.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="col-span-full py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 text-center relative group overflow-hidden"
              >
                 <Globe className="w-[500px] h-[500px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-10">
                    <Trophy size={128} className="mx-auto text-primary opacity-5 animate-pulse" />
                    <div className="space-y-4">
                       <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Vault Empty</p>
                       <p className="text-[14px] font-black text-muted-foreground/20 uppercase mt-6 tracking-[0.8em] italic leading-none">Initialize intake protocol to populate athletic resource registers</p>
                    </div>
                 </div>
              </motion.div>
            )}

            {filtered.map((i, idx) => {
              const available = i.total - i.rented;
              const fine = getFine(i.dueDate);

              return (
                <motion.div 
                  key={i.id} 
                  initial={{ opacity: 0, scale: 0.95, y: 30 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  whileHover={{ y: -12 }}
                  transition={{ delay: idx * 0.05, duration: 0.6 }}
                >
                  <Card className="rounded-[4.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden relative h-full flex flex-col">
                    <div className={`absolute top-0 left-0 right-0 h-3 transition-all duration-700 ${available === 0 ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : available < 3 ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`} />
                    
                    <CardHeader className="p-12 pb-8 flex flex-row items-center justify-between relative z-10 bg-card/20 border-b border-white/5">
                       <div className="space-y-4">
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic leading-none">UNIT ID: {i.id.slice(-4)}</p>
                          <CardTitle className="text-3xl font-black italic tracking-tighter text-foreground uppercase group-hover:text-primary transition-colors duration-700 leading-none">{i.name}</CardTitle>
                       </div>
                       {getStatus(i)}
                    </CardHeader>

                    <CardContent className="p-12 space-y-10 relative z-10 flex flex-col h-full bg-[radial-gradient(circle_at_bottom_right,rgba(30,136,229,0.03),transparent_70%)]">
                      <div className="grid grid-cols-2 gap-8">
                         <div className="p-8 bg-background/40 backdrop-blur-sm rounded-[2.5rem] text-center border border-white/5 shadow-inner group-hover:bg-background/80 transition-all duration-700">
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-3 italic leading-none">Matrix Total</p>
                            <p className="text-4xl font-black text-foreground italic tracking-tighter group-hover:scale-110 transition-transform duration-700">{i.total}</p>
                         </div>
                         <div className={`p-8 rounded-[2.5rem] text-center border shadow-inner group-hover:scale-105 transition-all duration-700 ${available > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic leading-none ${available > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Ready Rank</p>
                            <p className={`text-4xl font-black italic tracking-tighter ${available > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{available}</p>
                         </div>
                      </div>

                      <AnimatePresence>
                        {i.dueDate && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-6 p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] shadow-inner">
                            <Clock size={32} className="text-amber-400 animate-pulse" />
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest italic leading-none">Temporal Boundary</p>
                               <p className="text-xl font-black text-amber-400 italic leading-none">{new Date(i.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {fine && (
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-rose-500/20 border border-rose-500/40 rounded-[2.5rem] flex justify-between items-center group-hover:border-rose-500 transition-all duration-700 shadow-2xl shadow-rose-500/20 relative overflow-hidden">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1),transparent)] animate-pulse" />
                             <div className="space-y-2 relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest italic leading-none text-rose-500">Latency Debt Index</p>
                                <p className="text-xs font-bold text-rose-500/60 uppercase tracking-widest italic italic">Pending Authorization</p>
                             </div>
                             <p className="text-5xl font-black italic tracking-tighter leading-none text-rose-500 relative z-10">{fine}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-2 gap-6 pt-4 mt-auto">
                        <Button 
                          className="h-16 rounded-[1.75rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-widest text-[10px] uppercase shadow-2xl shadow-primary/30 relative overflow-hidden group/btn border-none transition-all active:scale-95 disabled:grayscale"
                          onClick={() => rentItem(i.id)}
                          disabled={available === 0}
                        >
                          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                          <div className="flex items-center gap-3">
                             <Zap size={18} className="group-hover:scale-125 transition-transform duration-500" />
                             ACQUIRE NODE
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-16 rounded-[1.75rem] bg-background/50 text-foreground border border-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all transform hover:-translate-y-2 shadow-inner font-black italic uppercase text-[10px] tracking-widest group/ret"
                          onClick={() => returnItem(i.id)}
                          disabled={i.rented === 0}
                        >
                           <div className="flex items-center gap-3">
                              <RotateCcw size={18} className="group-hover/ret:rotate-180 transition-transform duration-700" />
                              RETURN NODE
                           </div>
                        </Button>
                        <Button
                          variant="ghost"
                          className="col-span-2 h-16 rounded-[1.75rem] bg-background/30 text-rose-500/40 border border-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all transform hover:-translate-y-2 shadow-inner font-black italic uppercase text-[10px] tracking-widest group/del"
                          onClick={() => deleteItem(i.id)}
                        >
                           <div className="flex items-center justify-center gap-3">
                              <Trash2 size={20} className="group-hover/del:scale-110 group-hover/del:rotate-6 transition-all duration-500" />
                              PURGE FROM MATRIX
                           </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
