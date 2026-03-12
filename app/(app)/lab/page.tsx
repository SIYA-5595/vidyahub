"use client";

import { useState, useEffect } from "react";
import {
  FlaskConical,
  PlusCircle,
  Search,
  Loader2,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

import { motion } from "framer-motion";
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
      toast.error("Parameters required for archive intake");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "lab-assets"), {
        name,
        lab,
        quantity: Number(quantity),
        issued: 0,
        damaged: 0,
        createdAt: serverTimestamp()
      });
      setName("");
      setLab("");
      setQuantity("");
      toast.success("Asset successfully archived");
    } catch {
      toast.error("Archival sequence failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteEquipment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "lab-assets", id));
      toast.success("Asset purged from matrix");
    } catch {
      toast.error("Purge failed");
    }
  };

  /* ---------- ISSUE ---------- */
  const issueEquipment = async (id: string) => {
    const item = equipments.find(e => e.id === id);
    if (!item || item.quantity - item.issued - item.damaged <= 0) {
      toast.error("No available units for acquisition");
      return;
    }
    try {
      await updateDoc(doc(db, "lab-assets", id), {
        issued: item.issued + 1
      });
      toast.success("Asset acquisition authorized");
    } catch {
      toast.error("Authorization failed");
    }
  };

  /* ---------- RETURN ---------- */
  const returnEquipment = async (id: string) => {
    const item = equipments.find(e => e.id === id);
    if (!item || item.issued <= 0) {
      toast.error("No units to return");
      return;
    }
    try {
      await updateDoc(doc(db, "lab-assets", id), {
        issued: item.issued - 1
      });
      toast.success("Asset return synchronized");
    } catch {
      toast.error("Synchronization failed");
    }
  };

  /* ---------- DAMAGE ---------- */
  const markDamaged = async (id: string) => {
    const item = equipments.find(e => e.id === id);
    if (!item || item.quantity - item.damaged <= 0) {
      toast.error("All units already marked damaged or no units exist");
      return;
    }
    try {
      await updateDoc(doc(db, "lab-assets", id), {
        damaged: item.damaged + 1
      });
      toast.success("Anomaly registry updated");
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
      return <Badge className="bg-rose-500 text-white shadow-lg shadow-rose-500/20 border-0 h-6 px-3 rounded-lg font-black italic text-[9px] uppercase tracking-widest">DEPLETED</Badge>;

    if (available < 3)
      return (
        <Badge className="bg-amber-500 text-white shadow-lg shadow-amber-500/20 border-0 h-6 px-3 rounded-lg font-black italic text-[9px] uppercase tracking-widest">
          CRITICAL
        </Badge>
      );

    return (
      <Badge className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-0 h-6 px-3 rounded-lg font-black italic text-[9px] uppercase tracking-widest">
        OPTIMAL
      </Badge>
    );
  };

  return (
    <PageHeader
      title="Nodal Asset Core"
      description="Archival and distribution interface for institutional scientific instrumentation and laboratory resources"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          <div className="relative group/search">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within/search:text-white transition-colors" />
             <Input
               placeholder="Filter assets..."
               className="h-11 w-64 pl-12 bg-white/10 border-0 text-white placeholder:text-white/30 rounded-xl outline-none focus:ring-2 focus:ring-white/20 transition-all font-bold"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-xl">
            <FlaskConical className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ADD EQUIPMENT */}
        <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
          <CardHeader className="p-10 pb-6">
            <div className="space-y-1">
               <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none flex items-center gap-4">
                 <PlusCircle className="w-8 h-8 text-primary" />
                 Initialize Asset Log
               </CardTitle>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-12">Capture instrumentation parameters</p>
            </div>
          </CardHeader>

          <CardContent className="p-10 pt-4 flex gap-6 flex-wrap lg:flex-nowrap items-end">
            <div className="flex-1 space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-2">Instrumentation nomenclature</Label>
               <Input
                 placeholder="E.G. HIGH-FLUX SPECTROMETER"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
               />
            </div>

            <div className="flex-1 space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-2">Laboratory Assignment</Label>
               <Input
                 placeholder="E.G. PHYSICS CORE-B"
                 value={lab}
                 onChange={(e) => setLab(e.target.value)}
                 className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
               />
            </div>

            <div className="w-32 space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-2">Units</Label>
               <Input
                 type="number"
                 placeholder="00"
                 value={quantity}
                 onChange={(e) => setQuantity(e.target.value)}
                 className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight text-center focus:ring-2 focus:ring-primary/20 transition-all"
               />
            </div>

            <Button onClick={addEquipment} disabled={isSubmitting} className="h-16 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black italic tracking-tighter text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group overflow-hidden relative">
               <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
               {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : "ARCHIVE"}
            </Button>
          </CardContent>
        </Card>

        {/* EQUIPMENT GRID */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Instrumentation Core</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Live Asset Propagation Status</p>
            </div>
            <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">{filtered.length} NODAL ASSETS SYNCED</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
                 <FlaskConical className="w-24 h-24 mx-auto mb-8 opacity-5" />
                 <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">Vault Empty</p>
                 <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize intake sequence to populate repository logs</p>
              </motion.div>
            )}

            {filtered.map((e: Equipment, index: number) => {
              const available = e.quantity - e.issued - e.damaged;

              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -12 }}
                >
                  <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 bg-white overflow-hidden relative group">
                    <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between border-b border-secondary/5">
                      <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-gray-900 leading-none group-hover:text-primary transition-colors">{e.name}</CardTitle>
                      {getStatus(e)}
                    </CardHeader>

                    <CardContent className="p-10 space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic leading-none">Assigned Lab</p>
                            <p className="font-black italic text-sm truncate uppercase text-gray-900">{e.lab}</p>
                         </div>
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 leading-none italic">Nodal Units</p>
                            <p className="font-black text-2xl text-gray-900 tracking-tighter leading-none">{e.quantity}</p>
                         </div>
                      </div>

                      <div className="flex gap-4 p-6 bg-secondary/5 rounded-[2rem] border border-secondary/10 group-hover:bg-white transition-colors duration-700">
                         <div className="flex-1 text-center space-y-1">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Live</p>
                            <p className="font-black text-2xl tracking-tighter text-gray-900">{available}</p>
                         </div>
                         <div className="w-[1px] bg-secondary/10" />
                         <div className="flex-1 text-center space-y-1">
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none">Out</p>
                            <p className="font-black text-2xl tracking-tighter text-gray-900">{e.issued}</p>
                         </div>
                         <div className="w-[1px] bg-secondary/10" />
                         <div className="flex-1 text-center space-y-1">
                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Dmg</p>
                            <p className="font-black text-2xl tracking-tighter text-gray-900">{e.damaged}</p>
                         </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="grid grid-cols-2 gap-4 pt-4 mt-2">
                         <Button className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic tracking-tighter text-sm shadow-xl shadow-primary/20 relative overflow-hidden group/btn" onClick={() => issueEquipment(e.id)}>
                           <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
                           ISSUE
                         </Button>
                         <Button variant="ghost" className="h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm font-black italic uppercase text-xs tracking-tighter" onClick={() => returnEquipment(e.id)}>
                           RETURN
                         </Button>
                         <Button variant="ghost" className="h-14 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm font-black italic uppercase text-xs tracking-tighter" onClick={() => markDamaged(e.id)}>
                           DAMAGE
                         </Button>
                         <Button variant="ghost" className="h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm font-black italic uppercase text-xs tracking-tighter" onClick={() => deleteEquipment(e.id)}>
                           DELETE
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
