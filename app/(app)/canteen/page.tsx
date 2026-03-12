"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Coffee, Plus, Trash2, Utensils, ShoppingBag, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

interface Item {
  id: number;
  name: string;
  price: string;
}

export default function NightCanteen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Load items from Firestore
  useEffect(() => {
    const loadItems = async () => {
      if (!user) {
        return;
      }

      try {
        const docRef = doc(db, "user-canteen", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setItems(docSnap.data().items || []);
        }
      } catch (error) {
        console.error("Error loading canteen items:", error);
      } finally {
        // isLoading removed
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
      toast.error("Failed to synchronize manifest");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = async () => {
    if (!name || !price) return;

    const updated = [
      ...items,
      {
        id: Date.now(),
        name,
        price: `₹${price}`,
      },
    ];

    setItems(updated);
    await syncWithFirestore(updated);
    toast.success("Manifest updated and synchronized");

    setName("");
    setPrice("");
  };

  const removeItem = async (id: number) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    await syncWithFirestore(updated);
    toast.success("Module purged from manifest");
  };

  return (
    <PageHeader
      title="Midnight Gastronomy"
      description="Access elite level hydration and nutrition modules during nocturnal operational hours"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3 items-center">
          {isSaving && (
             <div className="flex items-center gap-2 px-4 text-[8px] font-black text-white/40 uppercase tracking-widest animate-pulse">
               <Loader2 className="w-3 h-3 animate-spin" />
               Syncing Manifest
             </div>
           )}
          <div className="flex bg-white/10 p-1 rounded-xl">
             {["all", "snacks", "drinks"].map((cat) => (
               <Button
                 key={cat}
                 variant="ghost"
                 size="sm"
                 onClick={() => setActiveCategory(cat)}
                 className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat ? "bg-white text-primary shadow-xl" : "text-white/40 hover:text-white"}`}
               >
                 {cat}
               </Button>
             ))}
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-100 border-0 px-6 h-11 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest italic border border-emerald-500/10">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Active Node
          </Badge>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ADD ITEM */}
        <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
          <CardHeader className="p-10 pb-6">
            <div className="space-y-1">
               <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4 text-gray-900 leading-none">
                 <Plus className="w-8 h-8 text-primary" />
                 Initialize Nutrition Update
               </CardTitle>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-12">Expand institutional menu parameters</p>
            </div>
          </CardHeader>

          <CardContent className="p-10 pt-4 flex gap-6 flex-wrap md:flex-nowrap items-center">
            <div className="flex-1 relative group/input">
               <Utensils className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-20 group-focus-within/input:text-primary transition-all" />
               <Input
                 placeholder="CUISINE NOMENCLATURE"
                 value={name}
                 onChange={(e) => {
                   const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                   setName(val);
                 }}
                 className="w-full h-16 pl-14 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all"
               />
            </div>

            <div className="w-full md:w-48 relative group/input">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-lg text-primary/40">₹</span>
               <Input
                 placeholder="0.00"
                 type="number"
                 value={price}
                 onChange={(e) => {
                   const val = e.target.value.replace(/[^0-9]/g, "");
                   setPrice(val);
                 }}
                 className="w-full h-16 pl-12 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight text-center focus:ring-2 focus:ring-primary/20 transition-all"
               />
            </div>

            <Button onClick={addItem} className="h-16 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black italic tracking-tighter text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all group overflow-hidden relative">
               <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
               UPDATE MANIFEST
            </Button>
          </CardContent>
        </Card>

        {/* MENU */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Gastronomy Protocol</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Verified Nutrition Modules Available</p>
            </div>
            <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">{items.length} Modules Online</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -12 }}
              >
                <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 group overflow-hidden bg-white relative">
                  <CardContent className="p-10 space-y-8 flex flex-col h-full">
                     <div className="flex justify-between items-start">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-700 shadow-sm">
                           <Coffee className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <Badge variant="outline" className="border-orange-500/20 text-orange-500 font-black text-[10px] tracking-widest rounded-lg px-2 italic uppercase">Premium</Badge>
                           <div className="flex items-center gap-1.5 text-muted-foreground opacity-40">
                              <Clock size={10} />
                              <span className="text-[8px] font-black uppercase tracking-tighter italic">15m Prep</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2 flex-grow">
                        <h3 className="text-2xl font-black tracking-tighter text-gray-900 uppercase leading-none group-hover:text-primary transition-colors italic">{item.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30 italic">Nutrition Protocol v1.4</p>
                        <p className="text-4xl font-black text-gray-900 italic tracking-tighter mt-4 leading-none">{item.price}</p>
                     </div>

                     <div className="flex gap-4 pt-6 mt-auto border-t border-secondary/5">
                        <Button className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic tracking-tighter text-lg shadow-xl shadow-primary/20 group/btn relative overflow-hidden">
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left" />
                          <ShoppingBag className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                          ORDER
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-16 w-16 rounded-2xl bg-secondary/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 hover:shadow-xl"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
