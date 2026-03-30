"use client";

import { useState, useEffect } from "react";
import {
  FlaskConical,
  PlusCircle,
  Search,
  Loader2,
  Activity,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Box,
  Globe,
  Plus,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";

import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";

interface Equipment {
  id: string;
  name: string;
  lab: string;
  quantity: number;
  issued: number;
  damaged: number;
}

export default function LabEquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState("");
  const [lab, setLab] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "lab-assets"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEquipments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Equipment[]);
    });
    return () => unsubscribe();
  }, []);

  /* ---------- ADD EQUIPMENT ---------- */
  const addEquipment = async () => {
    if (!name || !lab || !quantity) {
      toast.error("Mission parameters required for instrumentation archival");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "lab-assets"), {
        name: name.toUpperCase(),
        lab: lab.toUpperCase(),
        quantity: Number(quantity),
        issued: 0,
        damaged: 0,
        createdAt: serverTimestamp()
      });
      setName("");
      setLab("");
      setQuantity("");
      setShowAddForm(false);
      toast.success("Scientific asset successfully archived in matrix");
    } catch {
      toast.error("Archival sequence failed // Nodal error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteEquipment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "lab-assets", id));
      toast.success("Asset purged from institutional registry");
    } catch {
      toast.error("Purge failed");
    }
  };

  /* ---------- ISSUE ---------- */
  const issueEquipment = async (id: string) => {
    const item = equipments.find(e => e.id === id);
    if (!item || item.quantity - item.issued - item.damaged <= 0) {
      toast.error("Resource depleted: No available units for acquisition");
      return;
    }
    try {
      await updateDoc(doc(db, "lab-assets", id), {
        issued: item.issued + 1
      });
      toast.success("Asset acquisition authorized // Tracking active");
    } catch {
      toast.error("Authorization failed");
    }
  };

  /* ---------- RETURN ---------- */
  const returnEquipment = async (id: string) => {
    const item = equipments.find(e => e.id === id);
    if (!item || item.issued <= 0) {
      toast.error("Manifest error: No units currently deployed");
      return;
    }
    try {
      await updateDoc(doc(db, "lab-assets", id), {
        issued: item.issued - 1
      });
      toast.success("Asset return synchronized with repository");
    } catch {
      toast.error("Synchronization failed");
    }
  };

  /* ---------- DAMAGE ---------- */
  const markDamaged = async (id: string) => {
    const item = equipments.find(e => e.id === id);
    if (!item || item.quantity - item.damaged <= 0) {
      toast.error("Registry error: All units already flagged or non-existent");
      return;
    }
    try {
      await updateDoc(doc(db, "lab-assets", id), {
        damaged: item.damaged + 1
      });
      toast.success("Anomaly registry updated // Maintenance sequence initiated");
    } catch {
      toast.error("Registry update failed");
    }
  };

  /* ---------- FILTER ---------- */
  const filtered = equipments.filter(
    (e: Equipment) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.lab.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (e: Equipment) => {
    const available = e.quantity - e.issued - e.damaged;

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

  return (
    <PageHeader
      title="Nodal Asset Core"
      description="Archival and distribution interface for institutional scientific instrumentation and laboratory resources"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
          <div className="relative group/search hidden lg:block">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within/search:text-primary transition-all duration-500" />
             <Input
               placeholder="FILTER ASSETS..."
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
            <FlaskConical className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      }
    >
      <div className="space-y-16">
        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
               <Card className="rounded-[4.5rem] border border-white/5 shadow-premium-hover bg-card/60 backdrop-blur-xl overflow-hidden p-16 space-y-16 transition-all duration-700 relative">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(30,136,229,0.05),transparent_70%)] pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none flex items-center gap-8">
                        <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                           <Box size={40} className="text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        Initialize Asset Log
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Capture instrumentation parameters for institutional registry</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Instrumentation Nomenclature</Label>
                        <Input placeholder="E.G. HIGH-FLUX SPECTROMETER" value={name} onChange={e => setName(e.target.value.toUpperCase())} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Laboratory Assignment</Label>
                        <div className="relative group/input">
                           <ShieldCheck className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                           <Input placeholder="E.G. PHYSICS CORE-B" value={lab} onChange={e => setLab(e.target.value.toUpperCase())} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Nodal Units (Quantity)</Label>
                        <Input type="number" placeholder="00" value={quantity} onChange={e => setQuantity(e.target.value)} className="h-16 text-center rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all"/>
                     </div>
                  </div>
                  <Button onClick={addEquipment} disabled={isSubmitting} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSubmitting ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE ARCHIVAL PROTOCOL // DEPLOY NODE"}
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EQUIPMENT GRID */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Instrumentation Core</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Live Asset Propagation Status // Scientific Resource Registry</p>
            </div>
            <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 backdrop-blur-sm border border-white/5 text-primary italic shadow-inner">{filtered.length} Nodes Synchronized</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {filtered.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="col-span-full py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 text-center relative group overflow-hidden"
              >
                 <Globe className="w-[500px] h-[500px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-10">
                    <FlaskConical size={128} className="mx-auto text-primary opacity-5 animate-pulse" />
                    <div className="space-y-4">
                       <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Archive Purged</p>
                       <p className="text-[14px] font-black text-muted-foreground/20 uppercase mt-6 tracking-[0.8em] italic leading-none">Initialize intake sequence to populate historical scientific registers</p>
                    </div>
                 </div>
              </motion.div>
            )}

            {filtered.map((e: Equipment, index: number) => {
              const available = e.quantity - e.issued - e.damaged;

              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ y: -12 }}
                  transition={{ delay: index * 0.05, duration: 0.6 }}
                >
                  <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 bg-card/40 backdrop-blur-sm overflow-hidden relative group h-full flex flex-col">
                    <CardHeader className="p-12 pb-8 flex flex-row items-center justify-between border-b border-white/5 relative z-10">
                       <div className="space-y-4">
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic leading-none">ASSET ID: {e.id.slice(-4)}</p>
                          <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-foreground leading-none group-hover:text-primary transition-colors duration-700">{e.name}</CardTitle>
                       </div>
                       {getStatus(e)}
                    </CardHeader>

                    <CardContent className="p-12 space-y-10 relative z-10 flex flex-col h-full bg-[radial-gradient(circle_at_bottom_right,rgba(30,136,229,0.03),transparent_70%)]">
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic leading-none">Assigned Lab</p>
                             <div className="flex items-center gap-3">
                                <Activity size={12} className="text-primary opacity-40" />
                                <p className="font-black italic text-sm truncate uppercase text-foreground/80 leading-none">{e.lab}</p>
                             </div>
                          </div>
                          <div className="space-y-3 text-right">
                             <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] leading-none italic">Total Nodes</p>
                             <p className="font-black text-4xl text-foreground tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700">{e.quantity}</p>
                          </div>
                       </div>

                       <div className="flex gap-4 p-8 bg-background/40 backdrop-blur-sm rounded-[3rem] border border-white/5 group-hover:bg-background/80 transition-all duration-700 shadow-inner">
                          <div className="flex-1 text-center space-y-2">
                             <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none italic">OPTIMAL</p>
                             <p className="font-black text-4xl tracking-tighter text-foreground leading-none">{available}</p>
                          </div>
                          <div className="w-[1.5px] bg-white/5 rounded-full" />
                          <div className="flex-1 text-center space-y-2">
                             <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none italic">DEPLOYED</p>
                             <p className="font-black text-4xl tracking-tighter text-foreground leading-none">{e.issued}</p>
                          </div>
                          <div className="w-[1.5px] bg-white/5 rounded-full" />
                          <div className="flex-1 text-center space-y-2">
                             <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none italic">ANOMALY</p>
                             <p className="font-black text-4xl tracking-tighter text-foreground leading-none">{e.damaged}</p>
                          </div>
                       </div>

                       {/* ACTIONS */}
                       <div className="grid grid-cols-2 gap-6 pt-4 mt-auto">
                          <Button className="h-16 rounded-[1.75rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-widest text-[10px] uppercase shadow-2xl shadow-primary/30 relative overflow-hidden group/btn border-none transition-all active:scale-95" onClick={() => issueEquipment(e.id)}>
                            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                            <div className="flex items-center gap-3">
                               <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                               ISSUE NODE
                            </div>
                          </Button>
                          <Button variant="ghost" className="h-16 rounded-[1.75rem] bg-background/50 text-foreground border border-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all transform hover:-translate-y-2 shadow-inner font-black italic uppercase text-[10px] tracking-widest group/ret" onClick={() => returnEquipment(e.id)}>
                             <div className="flex items-center gap-3">
                                <ArrowDownLeft size={18} className="group-hover/ret:-translate-x-1 group-hover/ret:translate-y-1 transition-transform" />
                                RETURN
                             </div>
                          </Button>
                          <Button variant="ghost" className="h-16 rounded-[1.75rem] bg-background/50 text-foreground border border-white/5 hover:bg-amber-500/20 hover:text-amber-500 transition-all transform hover:-translate-y-2 shadow-inner font-black italic uppercase text-[10px] tracking-widest group/dmg" onClick={() => markDamaged(e.id)}>
                             <div className="flex items-center gap-3">
                                <AlertTriangle size={18} className="group-hover/dmg:rotate-12 transition-transform" />
                                ANOMALY
                             </div>
                          </Button>
                          <Button variant="ghost" className="h-16 rounded-[1.75rem] bg-background/50 text-rose-500 border border-white/5 hover:bg-rose-500/20 transition-all transform hover:-translate-y-2 shadow-inner font-black italic uppercase text-[10px] tracking-widest group/del" onClick={() => deleteEquipment(e.id)}>
                             <div className="flex items-center gap-3">
                                <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                PURGE
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
