"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Plus, 
  MapPin, 
  Search, 
  Radio, 
  Shield, 
  Box, 
  Sparkles, 
  Loader2, 
  Trash2, 
  Edit3,
  Globe,
  Zap,
  Activity,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  ArrowRight,
  Database
} from "lucide-react";

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
  id: string;
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
      toast.success("Entry successfully purged from institutional registry");
    } catch {
      toast.error("Purge failed // Sync error");
    }
  };

  const handleSubmit = async () => {
    if (!formData.item || !formData.location || !formData.contact) {
      toast.error("Manifest requires nomenclature, locus, and link parameters");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated node");
      await addDoc(collection(db, "users", user.uid, "lost-found"), {
        item: formData.item.toUpperCase(),
        description: formData.description.toUpperCase(),
        location: formData.location.toUpperCase(),
        contact: formData.contact,
        status: "lost",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
        createdAt: serverTimestamp(),
      });
      toast.success("Asset propagation successfully broadcast to the matrix");
      setIsOpen(false);
      setFormData({ item: "", description: "", location: "", contact: "" });
    } catch (err) {
      console.error(err);
      toast.error("Asset propagation failed // Signal interference");
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
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium items-center">
           <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-all duration-500" />
              <Input
                className="h-11 w-64 pl-12 bg-background/40 border border-white/5 text-foreground placeholder:text-muted-foreground/10 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black italic text-[10px] uppercase tracking-widest shadow-inner placeholder:tracking-widest"
                placeholder="REGISTRY SEARCH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if(!open) setFormData({ item: "", description: "", location: "", contact: "" });
          }}>
            <DialogTrigger asChild>
              <Button className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/30 border-none transition-all active:scale-95 relative overflow-hidden group/btn">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
                <PlusCircle className={`w-5 h-5 transition-transform duration-700 ${isOpen ? "rotate-45" : ""}`} />
                INITIATE BROADCAST
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-[5rem] border border-white/10 p-0 overflow-hidden bg-card/90 backdrop-blur-3xl shadow-premium-hover sm:max-w-[750px] outline-none">
              <div className="h-10 p-0 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 animate-shimmer" />
              <div className="p-16 space-y-12 relative">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                 
                 <DialogHeader className="relative z-10">
                    <div className="space-y-6">
                       <DialogTitle className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none flex items-center gap-6">
                          <Radio size={56} className="text-primary animate-pulse" /> Asset Propagation
                       </DialogTitle>
                       <DialogDescription className="text-[14px] font-black uppercase tracking-[0.6em] text-muted-foreground/40 ml-[80px] italic leading-none">
                          Inject verified meta-data into institutional recovery ecosystem
                       </DialogDescription>
                    </div>
                 </DialogHeader>

                 <div className="space-y-10 py-4 relative z-10">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Strategic Asset Designation</Label>
                       <Input 
                         placeholder="E.G. NEURAL LINK 2.0 PROTOCOL" 
                         className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight px-8 text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest" 
                         value={formData.item}
                         onChange={(e) => setFormData({ ...formData, item: e.target.value.toUpperCase() })}
                       />
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Visual Signature Analysis</Label>
                       <Textarea 
                         placeholder="IDENTIFY SPECTRAL PATTERNS, WEAR SCALARS, UNIQUENESS..." 
                         className="rounded-3xl bg-background/50 border border-white/5 shadow-inner font-black italic p-8 min-h-[160px] focus:ring-4 focus:ring-primary/10 transition-all uppercase placeholder:tracking-widest text-lg text-foreground resize-none" 
                         value={formData.description}
                         onChange={(e) => setFormData({ ...formData, description: e.target.value.toUpperCase() })}
                       />
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Termination Locus</Label>
                         <div className="relative group/input">
                            <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                            <Input 
                              placeholder="E.G. LAB 4B CORE" 
                              className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest" 
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value.toUpperCase() })}
                            />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic">Encryption Link (Contact)</Label>
                         <div className="relative group/input">
                            <ShieldCheck className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                            <Input 
                              placeholder="NODE ID / MOBILE" 
                              className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-widest" 
                              value={formData.contact}
                              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            />
                         </div>
                      </div>
                    </div>
                 </div>

                 <DialogFooter className="pt-10 relative z-10 gap-6">
                    <Button variant="ghost" className="rounded-2xl h-20 px-12 font-black italic uppercase text-[12px] tracking-widest text-muted-foreground hover:bg-white/5 transition-all" onClick={() => setIsOpen(false)}>
                      ABORT MISSION
                    </Button>
                    <Button 
                      className="rounded-[2.5rem] h-20 px-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase text-[12px] tracking-widest shadow-2xl shadow-primary/30 flex-1 active:scale-95 transition-all border-none relative overflow-hidden"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                      {isSubmitting ? <Loader2 size={32} className="animate-spin" /> : "EXECUTE BROADCAST PROTOCOL"}
                    </Button>
                 </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
           <div className="w-11 h-11 bg-background/40 border border-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      }
    >
      <div className="space-y-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-12 px-10">
            <div className="space-y-3 text-center xl:text-left">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Registry Database</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Live Property Reconciliation Stream // Institutional Asset Portal</p>
            </div>
            
            <TabsList className="bg-background/40 backdrop-blur-sm p-3 rounded-[3.5rem] h-24 w-full xl:w-[800px] border border-white/5 shadow-premium">
              {(["all", "lost", "found"] as const).map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="rounded-[3rem] font-black uppercase text-[12px] tracking-widest italic data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/30 h-full flex-1 transition-all duration-700 data-[state=active]:after:content-['']"
                >
                  {t === 'all' ? 'GLOBAL REGISTRY' : t === 'lost' ? 'TERMINATED' : 'RECOVERED'}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0 outline-none">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item: LostFoundItem, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.6 }}
                  whileHover={{ y: -12 }}
                >
                  <Card className="rounded-[4.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 overflow-hidden group relative flex flex-col h-full">
                    {/* Visual Status Indicator */}
                    <div className={`h-2.5 w-full ${item.status === 'lost' ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'} transition-all duration-700 group-hover:h-4`} />
                    
                    <CardContent className="p-12 space-y-10 flex flex-col flex-1 relative z-10 bg-[radial-gradient(circle_at_bottom_right,rgba(30,136,229,0.03),transparent_70%)]">
                      <div className="flex justify-between items-start">
                         <Badge className={`${item.status === 'lost' ? 'bg-rose-500/20 text-rose-500 border-rose-500/20 shadow-inner' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20 shadow-inner'} border-none h-9 px-6 rounded-xl text-[10px] font-black italic uppercase tracking-[0.2em] shadow-lg italic`}>
                           {item.status.toUpperCase()} NODE
                         </Badge>
                         <div className="text-right flex flex-col items-end gap-2">
                             <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-background/50 text-primary border border-white/5 hover:scale-110 active:scale-90" onClick={() => { setFormData({ item: item.item, description: item.description || "", location: item.location, contact: item.contact }); setIsOpen(true); }}>
                                   <Edit3 size={18} />
                                </Button>
                               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-background/50 text-rose-500 border border-white/5 hover:scale-110 active:scale-90" onClick={() => removeItem(item.id)}>
                                  <Trash2 size={18} />
                               </Button>
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mt-1 italic">{item.date}</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-3">
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic leading-none opacity-40 ml-1">Asset Nomenclature</p>
                            <div className="flex items-center gap-6">
                               <Box size={36} className="text-primary opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-700" />
                               <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none group-hover:text-primary transition-colors duration-700">
                                 {item.item}
                               </h3>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 bg-background/40 backdrop-blur-sm p-6 rounded-[2rem] border border-white/5 group-hover:bg-background/80 transition-all duration-700 shadow-inner">
                            <MapPin size={18} className="text-rose-500 opacity-60 group-hover:animate-bounce" />
                            <span className="text-[11px] font-black uppercase tracking-widest italic text-foreground/70 group-hover:text-foreground transition-colors duration-700">{item.location}</span>
                         </div>
                      </div>

                      <div className="bg-background/40 backdrop-blur-sm p-8 rounded-[3rem] border border-white/5 group-hover:bg-background/80 transition-all duration-700 space-y-6 shadow-inner">
                         <div className="flex items-center gap-5 text-muted-foreground">
                            <div className="h-12 w-12 rounded-2xl bg-card border border-white/5 shadow-premium flex items-center justify-center">
                               <Radio size={22} className="text-primary opacity-40 group-hover:animate-pulse" />
                            </div>
                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 italic">Link Channel</p>
                               <p className="text-sm font-black italic uppercase tracking-tight text-foreground/80 leading-none group-hover:text-primary transition-colors duration-700">{item.contact}</p>
                            </div>
                         </div>
                      </div>

                      <Button className={`w-full h-20 mt-auto rounded-[2rem] font-black italic uppercase tracking-widest text-[11px] transition-all relative overflow-hidden group/btn shadow-2xl border-none ${item.status === 'lost' ? 'bg-primary text-primary-foreground shadow-primary/30' : 'bg-emerald-500 text-white shadow-emerald-500/20'} active:scale-95`}>
                        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                        <div className="flex items-center justify-center gap-4">
                           <Shield size={22} className="group-hover/btn:rotate-12 transition-transform duration-500" />
                           {item.status === "lost" ? "INITIATE RECOVERY" : "VERIFY OWNERSHIP"}
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-72 bg-background/20 rounded-[6rem] border-4 border-dashed border-white/5 shadow-premium text-center relative group overflow-hidden"
              >
                 <Globe className="w-[600px] h-[600px] text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-12">
                    <HelpCircle size={160} className="mx-auto text-primary opacity-5 animate-pulse" />
                    <div className="space-y-6">
                       <p className="text-6xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Void Matrix Registry</p>
                       <p className="text-[16px] font-black text-muted-foreground/20 uppercase mt-4 tracking-[0.8em] italic leading-none">No corresponding assets identified within this sector of the institutional collective</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="mt-12 rounded-[2rem] font-black italic text-primary uppercase text-[12px] tracking-widest h-16 px-16 border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all font-black" 
                      onClick={() => setSearchTerm("")}
                    >
                      RESET FREQUENCY SPECTRUM
                    </Button>
                 </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageHeader>
  );
}
