"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, CheckCircle, XCircle, LogIn, LogOut, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Visitor {
  id: string;
  name: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected" | "Checked-In" | "Checked-Out";
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

export default function VisitorManagement() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time listener for visitors
  useEffect(() => {
    const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Visitor[];
      setVisitors(visitorsList);
    });
    return () => unsubscribe();
  }, []);

  const addVisitor = async () => {
    if (!name || !purpose) {
      toast.error("Mission parameters incomplete: Name and Purpose required");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "visitors"), {
        name,
        purpose,
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      setName("");
      setPurpose("");
      toast.success("Pre-registration synchronized with perimeter node");
    } catch (err) {
      console.error("Error adding visitor: ", err);
      toast.error("Perimeter registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: Visitor["status"]) => {
    try {
      await updateDoc(doc(db, "visitors", id), { status });
      toast.success(`Transit Manifest Status: ${status}`);
    } catch (err) {
      console.error("Error updating status: ", err);
      toast.error("Manifest update failed");
    }
  };

  const removeVisitor = async (id: string) => {
    try {
      await deleteDoc(doc(db, "visitors", id));
      toast.success("Visitor record purged from secure registry");
    } catch (err) {
      console.error("Error removing visitor: ", err);
      toast.error("Record purge failed");
    }
  };

  const badgeColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-500/20 text-emerald-400 border-white/5 shadow-inner";
      case "Rejected":
        return "bg-rose-500/20 text-rose-400 border-white/5 shadow-inner";
      case "Checked-In":
        return "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 rotate-1 scale-105";
      case "Checked-Out":
        return "bg-background/40 text-muted-foreground/40 border-white/5 shadow-inner italic";
      default:
        return "bg-amber-500/20 text-amber-400 border-white/5 shadow-inner";
    }
  };

  return (
    <PageHeader
      title="Secure Perimeter"
      description="Orchestrate campus visitation protocols and authorization matrices for institutional transit"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 items-center shadow-premium">
          <Badge className="bg-background/40 text-foreground border border-white/5 px-8 h-11 rounded-xl flex items-center gap-4 font-black text-[10px] uppercase tracking-widest italic shadow-inner">
            <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_12px_rgba(30,136,229,0.6)] ${visitors.length > 0 ? "bg-primary" : "bg-muted-foreground/20"}`} />
            {visitors.length} ACTIVE MANIFESTATIONS
          </Badge>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ADD VISITOR */}
        <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <CardHeader className="p-16 pb-8 relative z-10">
            <div className="space-y-4">
               <CardTitle className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-8 text-foreground leading-none">
                  <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                     <Plus size={48} className="text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  Initialize Pre-Registration
               </CardTitle>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Capture identity parameters for secure institutional ingress</p>
            </div>
          </CardHeader>

          <CardContent className="p-16 pt-4 flex gap-10 flex-wrap md:flex-nowrap items-end relative z-10">
            <div className="flex-1 space-y-4 relative group/input">
               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Full Legal Name</Label>
               <div className="relative">
                  <Users className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                  <Input
                    placeholder="E.G. ALEXANDER VANCE"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-16 pl-20 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all"
                  />
               </div>
            </div>

            <div className="flex-[1.5] space-y-4 relative group/input">
               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Transit Objective</Label>
               <div className="relative">
                  <Plus className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700 rotate-45" />
                  <Input
                    placeholder="E.G. STRATEGIC GUEST LECTURE SYNC"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-16 pl-20 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all"
                  />
               </div>
            </div>

            <Button 
              onClick={addVisitor} 
              disabled={isSubmitting}
              className="h-16 px-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 active:scale-95 transition-all border-none relative overflow-hidden group/btn"
            >
               <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
               {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "EXECUTE REGISTRY"}
            </Button>
          </CardContent>
        </Card>

        {/* VISITOR LIST */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Authorization Sequence</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Verified Institutional Transit Logs // Perimeter Security Manifest</p>
            </div>
            <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 border border-white/5 text-foreground italic shadow-inner">{visitors.length} Registrations Loaded</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {visitors.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-56 bg-background/20 rounded-[5rem] border-4 border-dashed border-white/5 text-center relative group overflow-hidden">
                 <Users className="w-64 h-64 mx-auto text-primary opacity-[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-6">
                    <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">No Transit Manifests</p>
                    <p className="text-[12px] font-black text-muted-foreground/20 uppercase mt-4 tracking-[0.6em] italic leading-none">Initialize registration sequence to populate perimeter logs</p>
                 </div>
              </motion.div>
            )}

            {visitors.map((visitor, index) => (
              <motion.div
                key={visitor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
                whileHover={{ y: -12 }}
              >
                <Card className="rounded-[4rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 bg-card/40 backdrop-blur-sm overflow-hidden relative group">
                  <div className={`absolute top-0 left-0 h-2 w-full transition-all duration-700 opacity-50 ${
                    visitor.status === 'Approved' ? 'bg-emerald-500' : 
                    visitor.status === 'Rejected' ? 'bg-rose-500' :
                    visitor.status === 'Checked-In' ? 'bg-primary animate-pulse' :
                    visitor.status === 'Checked-Out' ? 'bg-muted-foreground/20' :
                    'bg-amber-500'
                  }`} />
                  
                  <CardContent className="p-12 space-y-10 h-full flex flex-col relative z-10">
                     <div className="flex justify-between items-start">
                        <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-inner group-hover:rotate-12 group-hover:scale-110 ${
                          visitor.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          visitor.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          visitor.status === 'Checked-In' ? 'bg-primary/20 text-primary border border-primary/30' :
                          visitor.status === 'Checked-Out' ? 'bg-background/40 text-muted-foreground/40 border border-white/5' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                           <Users size={40} />
                        </div>
                        <Badge className={`rounded-xl px-6 h-10 font-black italic text-[11px] uppercase tracking-widest border-none transition-all duration-700 ${badgeColor(visitor.status)}`}>
                          {visitor.status} // STATUS
                        </Badge>
                     </div>

                     <div className="space-y-4 flex-grow">
                        <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none group-hover:text-primary transition-colors duration-700">{visitor.name}</h3>
                        <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic leading-relaxed">{visitor.purpose}</p>
                     </div>

                     <div className="flex flex-col gap-6 pt-8 border-t border-white/5 mt-auto">
                        <div className="grid grid-cols-2 gap-4">
                           {visitor.status === "Pending" && (
                             <>
                               <Button
                                 size="sm"
                                 className="h-14 bg-emerald-500 hover:bg-emerald-400 text-primary-foreground rounded-2xl font-black italic text-[10px] tracking-widest uppercase transition-all shadow-2xl shadow-emerald-500/30 border-none relative overflow-hidden active:scale-95 group/btn"
                                 onClick={() => updateStatus(visitor.id, "Approved")}
                               >
                                 <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
                                 <CheckCircle size={18} className="mr-3 group-hover:scale-125 transition-transform" />
                                 AUTHORIZE
                               </Button>

                               <Button
                                 size="sm"
                                 variant="destructive"
                                 className="h-14 rounded-2xl font-black italic text-[10px] tracking-widest uppercase bg-rose-500 hover:bg-rose-400 shadow-2xl shadow-rose-500/30 border-none transition-all active:scale-95 group/btn"
                                 onClick={() => updateStatus(visitor.id, "Rejected")}
                                >
                                 <XCircle size={18} className="mr-3 group-hover:scale-125 transition-transform" />
                                 VETO
                               </Button>
                             </>
                           )}

                           {visitor.status === "Approved" && (
                             <Button
                               size="sm"
                               className="col-span-2 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black italic text-lg tracking-tighter shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none relative overflow-hidden group/btn"
                               onClick={() => updateStatus(visitor.id, "Checked-In")}
                             >
                               <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                               <LogIn size={24} className="mr-4 group-hover:translate-x-2 transition-transform" />
                               NODE CHECK-IN
                             </Button>
                           )}

                           {visitor.status === "Checked-In" && (
                             <Button
                               size="sm"
                               className="col-span-2 h-16 bg-background/50 hover:bg-background/80 text-foreground border border-white/5 rounded-2xl font-black italic text-lg tracking-tighter shadow-inner transition-all active:scale-95 group/btn"
                               onClick={() => updateStatus(visitor.id, "Checked-Out")}
                             >
                               <LogOut size={24} className="mr-4 group-hover:-translate-x-2 transition-transform" />
                               TERMINATE SESSION
                             </Button>
                           )}
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                          <div className="flex-grow h-px bg-white/5" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 bg-background/40 rounded-2xl text-rose-500 hover:bg-rose-500/20 transition-all transform hover:rotate-12 border border-white/5 shadow-inner"
                            onClick={() => removeVisitor(visitor.id)}
                          >
                            <Trash2 size={24} />
                          </Button>
                        </div>
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
