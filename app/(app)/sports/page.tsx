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
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";

interface SportItem {
  id: string;
  name: string;
  total: number;
  rented: number;
  dueDate?: string;
}

export default function SportsRentalPage() {
  const [items, setItems] = useState<SportItem[]>([]);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "sports-assets"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SportItem)));
    });
    return () => unsubscribe();
  }, []);
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [search, setSearch] = useState("");

  /* ---------- ADD ITEM ---------- */
  const addItem = async () => {
    if (!name || !total) {
      toast.error("Asset parameters required for archive intake");
      return;
    }
    try {
      await addDoc(collection(db, "sports-assets"), {
        name,
        total: Number(total),
        rented: 0,
        createdAt: serverTimestamp()
      });
      setName("");
      setTotal("");
      toast.success("Athletic hardware registered successfully");
    } catch {
      toast.error("Registration failed");
    } finally {
    }
  };

  const deleteItem = async (id: string | number) => {
    try {
      await deleteDoc(doc(db, "sports-assets", id.toString()));
      toast.success("Asset purged from matrix");
    } catch {
      toast.error("Purge sequence failed");
    }
  };

  const rentItem = async (id: string | number) => {
    const item = items.find(i => i.id === id);
    if (!item || item.total - item.rented <= 0) return;

    const due = new Date();
    due.setDate(due.getDate() + 2);

    try {
      await updateDoc(doc(db, "sports-assets", id.toString()), {
        rented: item.rented + 1,
        dueDate: due.toISOString()
      });
      toast.success("Asset acquisition authorized");
    } catch {
      toast.error("Authorization failed");
    }
  };

  const returnItem = async (id: string | number) => {
    const item = items.find(i => i.id === id);
    if (!item || item.rented <= 0) return;

    try {
      await updateDoc(doc(db, "sports-assets", id.toString()), {
        rented: item.rented - 1,
        dueDate: null
      });
      toast.success("Asset return synchronized");
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
      return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">Depleted</Badge>;

    if (available < 3)
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
          Low Stock
        </Badge>
      );

    return (
      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
        Operational
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

    return `₹${daysLate * 20}`; // ₹20 per day
  };

  return (
    <PageHeader
      title="Athletic Logistics"
      description="Equip your institutional sports endeavors through our streamlined pedagogical asset rental matrix"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
             <Input
               placeholder="Locate equipment..."
               className="h-10 w-[240px] bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl pl-9 focus:bg-white/20 transition-all font-bold text-xs"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <Button className="h-10 px-6 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Arena Ready
          </Button>
        </div>
      }
    >
      <div className="space-y-12">
        {/* STATS SECTION */}
        <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Total Asset Nodes", value: items.length, icon: Trophy, color: "text-amber-500" },
              { label: "Active Rentals", value: items.reduce((acc, i) => acc + i.rented, 0), icon: Clock, color: "text-blue-500" },
              { label: "Available Capacity", value: items.reduce((acc, i) => acc + (i.total - i.rented), 0), icon: CheckCircle, color: "text-emerald-500" },
              { label: "Pending Returns", value: items.filter(i => i.rented > 0).length, icon: AlertTriangle, color: "text-rose-500" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
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
              </motion.div>
            ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* ADD ITEM SECTION */}
          <div className="lg:col-span-1">
            <Card className="rounded-[3rem] border-0 shadow-sm bg-secondary/10 overflow-hidden sticky top-8">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-2xl font-black italic tracking-tight uppercase">Archive Intake</CardTitle>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Register new athletic hardware</p>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Equipment Identifier</label>
                    <Input
                      placeholder="e.g. Pro Match Sphere"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Total Unit Count</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={total}
                      onChange={(e) => setTotal(e.target.value)}
                      className="h-14 rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6"
                    />
                  </div>
                </div>
                <Button onClick={addItem} className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black italic tracking-tight text-xl shadow-xl shadow-primary/20">
                  <PlusCircle className="mr-3 h-6 w-6" /> REGISTER ASSET
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* LIST SECTION */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center px-4">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Active Logistics Inventory</h3>
               <Badge variant="secondary" className="rounded-full px-4 h-8 font-black">{filtered.length} NODES</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {filtered.map((i, idx) => {
                const available = i.total - i.rented;
                const fine = getFine(i.dueDate);

                return (
                  <motion.div key={i.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                      <div className={`h-2 w-full transition-colors ${available === 0 ? 'bg-rose-500' : available < 3 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase group-hover:text-primary transition-colors">{i.name}</CardTitle>
                          {getStatus(i)}
                        </div>
                      </CardHeader>

                      <CardContent className="p-10 pt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-secondary/5 rounded-2xl text-center">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                              <p className="text-2xl font-black text-gray-900">{i.total}</p>
                           </div>
                           <div className="p-4 bg-emerald-500/5 rounded-2xl text-center">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Ready</p>
                              <p className="text-2xl font-black text-emerald-600">{available}</p>
                           </div>
                        </div>

                        {i.dueDate && (
                          <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                            <Clock size={20} className="text-amber-500" />
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Temporal Boundary</p>
                               <p className="text-sm font-black text-amber-700">{new Date(i.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}

                        {fine && (
                          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex justify-between items-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                             <p className="text-[10px] font-black uppercase tracking-widest">Latency Fine Index</p>
                             <p className="text-xl font-black">{fine}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-3 pt-4">
                          <Button 
                            className="bg-primary hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest h-12"
                            onClick={() => rentItem(i.id)}
                            disabled={available === 0}
                          >
                            Rent
                          </Button>
                          <Button 
                            variant="secondary" 
                            className="bg-secondary/10 hover:bg-secondary/20 rounded-xl font-black italic uppercase text-[10px] tracking-widest h-12"
                            onClick={() => returnItem(i.id)}
                            disabled={i.rented === 0}
                          >
                            Return
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-12 flex items-center justify-center"
                            onClick={() => deleteItem(i.id)}
                          >
                            <Trash2 size={20} />
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
      </div>
    </PageHeader>
  );
}
