"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coffee, 
  Plus, 
  Trash2, 
  Utensils, 
  ShoppingBag, 
  Clock, 
  Loader2,
  Zap,
  Globe,
  PlusCircle,
  Activity,
  Box,
  Cigarette,
  Flame,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Item {
  id: number;
  name: string;
  price: string;
}

export default function NightCanteen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Load items from Firestore
  useEffect(() => {
    const loadItems = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "user-canteen", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setItems(docSnap.data().items || []);
        }
      } catch (error) {
        console.error("Error loading canteen items:", error);
      }
    };

    loadItems();
  }, [user]);

  const syncWithFirestore = async (updated: Item[]) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "user-canteen", user.uid), {
        items: updated,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error syncing canteen manifest:", error);
      toast.error("Manifest synchronization failed // Signal error");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = async () => {
    if (!name || !price) {
      toast.error("Parameters required for nutrition archival");
      return;
    }

    const updated = [
      ...items,
      {
        id: Date.now(),
        name: name.toUpperCase(),
        price: `₹${price}`,
      },
    ];

    setItems(updated);
    await syncWithFirestore(updated);
    toast.success("Nutrition manifest successfully broadcast to matrix");
    setShowAddForm(false);
    setName("");
    setPrice("");
  };

  const removeItem = async (id: number) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    await syncWithFirestore(updated);
    toast.success("Module successfully purged from active registry");
  };

  return (
    <PageHeader
      title="Midnight Gastronomy"
      description="Access elite level hydration and nutrition modules during nocturnal operational hours"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
          {isSaving && (
             <div className="flex items-center gap-2 px-4 text-[9px] font-black text-primary uppercase tracking-[0.2em] animate-pulse italic">
               <Activity size={12} className="text-primary" />
               SYNCING
             </div>
           )}
          <div className="flex bg-background/40 p-1 rounded-xl border border-white/5 shadow-inner hidden md:flex">
             {["all", "snacks", "drinks"].map((cat) => (
               <Button
                 key={cat}
                 variant="ghost"
                 size="sm"
                 onClick={() => setActiveCategory(cat)}
                 className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-[0.2em] italic transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
               >
                 {cat}
               </Button>
             ))}
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 border-none shadow-2xl shadow-primary/30 transition-all active:scale-95 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
            <PlusCircle className={`w-5 h-5 transition-transform duration-700 ${showAddForm ? "rotate-45" : ""}`} />
            {showAddForm ? "CLOSE ARCHIVE" : "INTAKE ITEM"}
          </Button>
          <Badge className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-6 h-11 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest italic shadow-inner">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            Active Node
          </Badge>
        </div>
      }
    >
      <div className="space-y-16">
        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
               <Card className="rounded-[4.5rem] border border-white/5 shadow-premium-hover bg-card/60 backdrop-blur-xl overflow-hidden p-16 space-y-16 transition-all duration-700 relative">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.05),transparent_70%)] pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none flex items-center gap-8">
                        <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-all duration-700">
                           <Flame size={40} className="text-orange-500 group-hover:scale-110 transition-transform" />
                        </div>
                        Initialize Nutrition Intake
                     </h3>
                     <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Register new nutrition modules into nocturnal registry</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 relative z-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Cuisine Nomenclature</Label>
                        <div className="relative group/input">
                           <Utensils className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-orange-500 transition-all duration-700" />
                           <Input placeholder="E.G. NEURAL NET NOODLES" value={name} onChange={e => setName(e.target.value.toUpperCase())} className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:tracking-widest"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Unit Value (Price)</Label>
                        <div className="relative group/input">
                           <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-xl text-muted-foreground/20 group-focus-within/input:text-orange-500 transition-all duration-700 italic">₹</span>
                           <Input type="number" placeholder="00" value={price} onChange={e => setPrice(e.target.value)} className="h-16 pl-16 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-orange-500/10 transition-all"/>
                        </div>
                     </div>
                  </div>
                  <Button onClick={addItem} disabled={isSaving} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-widest text-[12px] shadow-2xl shadow-primary/30 active:scale-95 transition-all outline-none border-none relative overflow-hidden group/sync">
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                    {isSaving ? <Loader2 size={40} className="animate-spin" /> : "EXECUTE NUTRITION UPDATE // BROADCAST"}
                  </Button>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MENU */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Gastronomy Protocol</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Verified Nutrition Modules Available // Nocturnal Operational Node</p>
            </div>
            <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 backdrop-blur-sm border border-white/5 text-primary italic shadow-inner">{items.length} Modules Online</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
             <AnimatePresence>
               {items.map((item, index) => (
                 <motion.div
                   key={item.id}
                   initial={{ opacity: 0, scale: 0.95, y: 30 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                   whileHover={{ y: -12 }}
                   transition={{ delay: index * 0.05, duration: 0.6 }}
                 >
                   <Card className="rounded-[4.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden bg-card/40 backdrop-blur-sm relative h-full flex flex-col">
                     <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] bg-gradient-to-br from-orange-500 to-transparent transition-all duration-1000 group-hover:opacity-10 group-hover:scale-150 rounded-full blur-[60px] pointer-events-none" />
                     
                     <CardContent className="p-12 space-y-10 relative z-10 flex flex-col h-full bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.03),transparent_70%)]">
                        <div className="flex justify-between items-start">
                           <div className="w-16 h-16 bg-background/40 border border-white/5 rounded-[1.75rem] flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-700 shadow-inner group-hover:rotate-12">
                              <Coffee size={32} />
                           </div>
                           <div className="flex flex-col items-end gap-3">
                              <Badge className="bg-orange-500/20 text-orange-500 border border-orange-500/20 font-black text-[10px] tracking-widest rounded-xl px-5 h-9 italic uppercase shadow-inner">
                                PREMIUM NODE
                              </Badge>
                              <div className="flex items-center gap-3 text-muted-foreground/40 italic">
                                 <Clock size={12} className="text-primary/40 animate-pulse" />
                                 <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">15M PREP CYCLES</span>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 flex-grow">
                           <div className="space-y-2">
                              <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic leading-none opacity-40 ml-1">Cuisine Identifier</p>
                              <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none group-hover:text-primary transition-colors duration-700">{item.name}</h3>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 italic leading-none">Nutrition Protocol v4.02 // Institutional Grade</p>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-end gap-2 group/price scale-100 group-hover:scale-110 transition-transform origin-left duration-700">
                              <span className="text-2xl font-black text-secondary/40 italic leading-none mb-1">₹</span>
                              <p className="text-5xl font-black text-foreground italic tracking-tighter leading-none">{item.price.replace('₹', '')}</p>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                              <Button className="h-16 rounded-[1.75rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-widest text-[10px] uppercase shadow-2xl shadow-primary/30 relative overflow-hidden group/btn border-none transition-all active:scale-95">
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                                <div className="flex items-center gap-3">
                                  <ShoppingBag size={20} className="group-hover/btn:rotate-12 transition-transform duration-500" />
                                  ORDER NODE
                                </div>
                              </Button>

                              <Button
                                variant="ghost"
                                className="h-16 rounded-[1.75rem] bg-background/40 text-rose-500/40 border border-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all transform hover:-translate-y-2 shadow-inner font-black italic uppercase text-[10px] tracking-widest group/del"
                                onClick={() => removeItem(item.id)}
                              >
                                 <Trash2 size={24} className="group-hover/del:scale-110 transition-all duration-500" />
                              </Button>
                           </div>
                        </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               ))}
             </AnimatePresence>

             {items.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="col-span-full py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 text-center relative group overflow-hidden"
              >
                 <Globe className="w-[500px] h-[500px] text-orange-500 opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-10">
                    <Utensils size={128} className="mx-auto text-orange-500 opacity-5 animate-pulse" />
                    <div className="space-y-4">
                       <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Kitchen Offline</p>
                       <p className="text-[14px] font-black text-muted-foreground/20 uppercase mt-6 tracking-[0.8em] italic leading-none">Initialize intake protocol to populate nutrition module registry</p>
                    </div>
                 </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
