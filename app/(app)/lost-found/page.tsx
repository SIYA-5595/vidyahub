"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Plus, MapPin, Search, Radio, Shield, Box, Sparkles, Loader2, Trash2, Edit3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/PageHeader";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

type LostFoundItem = {
  id: string | number;
  item: string;
  status: "lost" | "found";
  location: string;
  contact: string;
  date: string;
  description?: string;
};

export default function LostFoundPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [formData, setFormData] = useState({
    item: "",
    description: "",
    location: "",
    contact: ""
  });

  // Fetch items from Firestore
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const q = query(collection(db, "users", user.uid, "lost-found"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const firestoreItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LostFoundItem[];
      setItems(firestoreItems);
    });

    return () => unsubscribe();
  }, [user]);


  const removeItem = async (id: string) => {
    if (!user || !id) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "lost-found", id));
      toast.success("Entry purged from registry");
    } catch {
      toast.error("Purge failed");
    }
  };

  const handleSubmit = async () => {
    if (!formData.item || !formData.location || !formData.contact) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated");
      await addDoc(collection(db, "users", user.uid, "lost-found"), {
        item: formData.item,
        description: formData.description,
        location: formData.location,
        contact: formData.contact,
        status: "lost",
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });
      toast.success("Broadcast initiated successfully");
      setIsOpen(false);
      setFormData({ item: "", description: "", location: "", contact: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item: LostFoundItem) => {
    const matchesSearch =
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = activeTab === "all" || item.status === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <PageHeader
      title="Asset Recovery Node"
      description="Decentralized nexus for institutional item reconciliation and lost property optimization matrix"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3 items-center">
           <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
              <Input
                className="h-11 w-64 pl-12 pr-4 bg-white/10 border-0 focus-visible:ring-2 focus-visible:ring-white/30 text-white placeholder:text-white/30 rounded-xl transition-all font-bold italic"
                placeholder="REGISTRY SEARCH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-8 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95">
                <Plus className="w-5 h-5" />
                INITIATE BROADCAST
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-[3rem] border-0 shadow-2xl bg-white p-12 max-w-2xl overflow-hidden">
              {/* Decorative elements for Dialog */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

              <DialogHeader className="space-y-4 relative z-10">
                <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                  Asset Propagation
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 ml-1">
                  Inject verified metadata into the institutional recovery ecosystem
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 py-10 relative z-10">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Strategic Asset Designation</Label>
                   <Input 
                     placeholder="E.G. NEURAL LINK 2.0 PROTOCOL" 
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 px-8 transition-all" 
                     value={formData.item}
                     onChange={(e) => {
                       const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                       setFormData({ ...formData, item: val });
                     }}
                   />
                </div>

                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Visual Signature Analysis</Label>
                   <Textarea 
                     placeholder="IDENTIFY SPECTRAL PATTERNS, WEAR SCALARS, UNIQUENESS..." 
                     className="rounded-2xl bg-secondary/5 border-0 shadow-inner font-bold p-8 min-h-[140px] focus:ring-2 focus:ring-primary/20 transition-all uppercase placeholder:opacity-20" 
                     value={formData.description}
                     onChange={(e) => {
                       const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, "");
                       setFormData({ ...formData, description: val });
                     }}
                   />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Termination Locus</Label>
                     <Input 
                       placeholder="E.G. LAB 4B CORE" 
                       className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 px-8 transition-all" 
                       value={formData.location}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, "");
                          setFormData({ ...formData, location: val });
                        }}
                     />
                  </div>
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Encryption Link</Label>
                     <Input 
                       placeholder="NODE ID / MOBILE" 
                       className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 px-8 transition-all" 
                       value={formData.contact}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({ ...formData, contact: val });
                        }}
                     />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-6 relative z-10 gap-4">
                <Button variant="ghost" className="rounded-2xl h-16 px-10 font-black italic uppercase text-xs tracking-widest text-muted-foreground hover:bg-secondary/10 transition-all" onClick={() => setIsOpen(false)}>
                  ABORT MISSION
                </Button>
                <Button 
                  className="rounded-2xl h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black italic uppercase text-lg tracking-tighter shadow-2xl shadow-primary/30 flex-1 active:scale-95 transition-all"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "INITIALIZE BROADCAST"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="space-y-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-6">
            <div className="space-y-2 text-center md:text-left">
               <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Registry Database</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Live Property Reconciliation Stream</p>
            </div>
            
            <TabsList className="bg-secondary/10 p-2 rounded-[2rem] h-16 w-full md:w-[480px] border border-secondary/10 shadow-inner">
              {(["all", "lost", "found"] as const).map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] italic data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary h-full flex-1 transition-all duration-500"
                >
                  {t === 'all' ? 'GLOBAL REGISTRY' : t === 'lost' ? 'TERMINATED' : 'RECOVERED'}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item: LostFoundItem, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -12 }}
                >
                  <Card className="rounded-[4rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden group relative flex flex-col h-full">
                    {/* Visual Status Indicator */}
                    <div className={`h-3 w-full ${item.status === 'lost' ? 'bg-rose-500' : 'bg-emerald-500'} opacity-30 group-hover:opacity-100 transition-opacity duration-700`} />
                    
                    <CardContent className="p-10 space-y-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start">
                         <Badge className={`${item.status === 'lost' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'} border-0 h-8 px-5 rounded-xl text-[10px] font-black italic uppercase tracking-widest shadow-lg`}>
                           {item.status.toUpperCase()}
                         </Badge>
                         <div className="text-right flex flex-col items-end gap-1">
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-primary" onClick={() => { setFormData({ item: item.item, description: item.description || "", location: item.location, contact: item.contact }); setIsOpen(true); }}>
                                   <Edit3 className="h-3 w-3" />
                                </Button>
                               <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-rose-500" onClick={() => removeItem(item.id.toString())}>
                                  <Trash2 className="h-3 w-3" />
                               </Button>
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest leading-none">{item.date}</p>
                            <p className="text-[8px] font-bold text-muted-foreground opacity-20 uppercase tracking-[0.1em] mt-1">Archive ID: #{item.id}</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-4">
                            <Box size={32} className="text-primary opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-700" />
                            <h3 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase leading-none group-hover:text-primary transition-colors">
                              {item.item}
                            </h3>
                         </div>
                         <div className="flex items-center gap-3 bg-secondary/5 p-4 rounded-2xl border border-secondary/10 group-hover:bg-white transition-colors duration-500">
                            <MapPin size={16} className="text-rose-500 opacity-60" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic text-muted-foreground">{item.location}</span>
                         </div>
                      </div>

                      <div className="bg-secondary/5 p-6 rounded-[2rem] border border-secondary/10 group-hover:bg-white group-hover:shadow-inner transition-all duration-500 space-y-4">
                         <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                               <Radio size={18} className="text-primary opacity-40 group-hover:animate-pulse" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Encryption Hash</p>
                               <p className="text-xs font-black italic uppercase tracking-tight text-gray-900 leading-none">{item.contact}</p>
                            </div>
                         </div>
                      </div>

                      <Button className={`w-full h-16 mt-auto rounded-[1.5rem] font-black italic uppercase tracking-tighter text-lg transition-all relative overflow-hidden group/btn ${item.status === 'lost' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'} text-white shadow-2xl`}>
                        <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
                        <Shield size={20} className="mr-3 group-hover/btn:rotate-12 transition-transform" />
                        {item.status === "lost" ? "INITIATE RECOVERY" : "VERIFY OWNERSHIP"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 m-6"
              >
                <div className="relative mb-10">
                   <div className="w-24 h-24 rounded-[3rem] bg-white shadow-2xl flex items-center justify-center text-primary/20 relative z-10">
                      <HelpCircle size={48} className="animate-pulse" />
                   </div>
                   <motion.div 
                     animate={{ rotate: 360 }} 
                     transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
                     className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full scale-150" 
                   />
                   <Sparkles className="absolute -top-4 -right-4 text-primary animate-bounce" size={24} />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Void Matrix Registry</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">No corresponding assets identified within this sector</p>
                </div>
                <Button 
                  variant="ghost" 
                  className="mt-10 rounded-[1.5rem] font-black italic text-primary uppercase text-[10px] tracking-widest h-14 px-12 border border-primary/10 hover:bg-primary/5 transition-all" 
                  onClick={() => setSearchTerm("")}
                >
                  RESET FREQUENCY SPECTRUM
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageHeader>
  );
}
