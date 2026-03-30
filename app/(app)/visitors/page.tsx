"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      toast.error("Please provide both name and purpose");
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
      toast.success("Pre-registration successful");
    } catch (err) {
      console.error("Error adding visitor: ", err);
      toast.error("Failed to register visitor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: Visitor["status"]) => {
    try {
      await updateDoc(doc(db, "visitors", id), { status });
      toast.success(`Manifest status: ${status}`);
    } catch (err) {
      console.error("Error updating status: ", err);
      toast.error("Status update failed");
    }
  };

  const removeVisitor = async (id: string) => {
    try {
      await deleteDoc(doc(db, "visitors", id));
      toast.success("Visitor record purged");
    } catch (err) {
      console.error("Error removing visitor: ", err);
      toast.error("Purge failed");
    }
  };

  const badgeColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Checked-In":
        return "bg-blue-100 text-blue-700";
      case "Checked-Out":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <PageHeader
      title="Secure Perimeter"
      description="Orchestrate campus visitation protocols and authorization matrices for institutional transit"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          <Badge className="bg-primary-foreground/20 text-white border-0 px-6 h-10 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
            <div className={`w-2 h-2 rounded-full animate-pulse ${visitors.length > 0 ? "bg-emerald-400" : "bg-white/40"}`} />
            {visitors.length} ACTIVE MANIFESTATIONS
          </Badge>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ADD VISITOR */}
        <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
          <CardHeader className="p-10 pb-6">
            <div className="space-y-1">
               <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4 text-gray-900">
                 <Plus className="w-8 h-8 text-primary" />
                 Initialize Pre-Registration
               </CardTitle>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-12">Capture identity parameters</p>
            </div>
          </CardHeader>

          <CardContent className="p-10 pt-4 flex gap-6 flex-wrap md:flex-nowrap items-center">
            <div className="flex-1 relative group/input">
               <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-20 group-focus-within/input:text-primary group-focus-within/input:opacity-100 transition-all" />
               <Input
                 placeholder="FULL LEGAL NAME"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full h-16 pl-14 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all"
               />
            </div>

            <div className="flex-[1.5] relative group/input">
               <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-20 group-focus-within/input:text-primary group-focus-within/input:opacity-100 transition-all rotate-45" />
               <Input
                 placeholder="TRANSIT OBJECTIVE (E.G. GUEST LECTURE)"
                 value={purpose}
                 onChange={(e) => setPurpose(e.target.value)}
                 className="w-full h-16 pl-14 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all"
               />
            </div>

            <Button 
              onClick={addVisitor} 
              disabled={isSubmitting}
              className="h-16 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black italic tracking-tighter text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all group overflow-hidden relative"
            >
               {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                 <>
                   <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                   EXECUTE REGISTRY
                 </>
               )}
            </Button>
          </CardContent>
        </Card>

        {/* VISITOR LIST */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Authorization Sequence</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Verified Institutional Transit Logs</p>
            </div>
            <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">{visitors.length} Registrations Loaded</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {visitors.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
                 <Users className="w-24 h-24 mx-auto mb-8 opacity-5" />
                 <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">No Transit Manifests</p>
                 <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize registration sequence to populate logs</p>
              </motion.div>
            )}

            {visitors.map((visitor, index) => (
              <motion.div
                key={visitor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -10 }}
              >
                <Card className="rounded-[3rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 bg-white overflow-hidden relative group">
                  <div className={`absolute top-0 left-0 h-1.5 w-full transition-all duration-700 ${
                    visitor.status === 'Approved' ? 'bg-emerald-500' : 
                    visitor.status === 'Rejected' ? 'bg-rose-500' :
                    visitor.status === 'Checked-In' ? 'bg-blue-500' :
                    visitor.status === 'Checked-Out' ? 'bg-gray-400' :
                    'bg-amber-500'
                  }`} />
                  
                  <CardContent className="p-10 space-y-8 h-full flex flex-col">
                     <div className="flex justify-between items-start">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-sm ${
                          visitor.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                          visitor.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                          visitor.status === 'Checked-In' ? 'bg-blue-500/10 text-blue-500' :
                          visitor.status === 'Checked-Out' ? 'bg-gray-100 text-gray-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                           <Users className="w-7 h-7" />
                        </div>
                        <Badge className={`rounded-xl px-4 py-2 font-black italic text-[10px] uppercase tracking-widest border-0 ${badgeColor(visitor.status)} shadow-sm`}>
                          {visitor.status}
                        </Badge>
                     </div>

                     <div className="space-y-2 flex-grow">
                        <h3 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase leading-none group-hover:text-primary transition-colors">{visitor.name}</h3>
                        <p className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-[0.2em] leading-none mt-3">{visitor.purpose}</p>
                     </div>

                     <div className="flex flex-wrap gap-4 pt-4 border-t border-secondary/5 mt-auto">
                       {visitor.status === "Pending" && (
                         <>
                           <Button
                             size="sm"
                             className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1rem] font-black italic text-xs tracking-tighter"
                             onClick={() => updateStatus(visitor.id, "Approved")}
                           >
                             <CheckCircle size={16} className="mr-2" />
                             AUTHORIZE
                           </Button>

                           <Button
                             size="sm"
                             variant="destructive"
                             className="flex-1 h-12 rounded-[1rem] font-black italic text-xs tracking-tighter bg-rose-500 hover:bg-rose-600"
                             onClick={() => updateStatus(visitor.id, "Rejected")}
                           >
                             <XCircle size={16} className="mr-2" />
                             VETO
                           </Button>
                         </>
                       )}

                       {visitor.status === "Approved" && (
                         <Button
                           size="sm"
                           className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-[1rem] font-black italic text-sm tracking-tighter shadow-lg shadow-blue-500/20"
                           onClick={() => updateStatus(visitor.id, "Checked-In")}
                         >
                           <LogIn size={18} className="mr-2" />
                           NODE CHECK-IN
                         </Button>
                       )}

                       {visitor.status === "Checked-In" && (
                         <Button
                           size="sm"
                           className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-[1rem] font-black italic text-sm tracking-tighter shadow-lg shadow-gray-900/20"
                           onClick={() => updateStatus(visitor.id, "Checked-Out")}
                         >
                           <LogOut size={18} className="mr-2" />
                           TERMINATE SESSION
                         </Button>
                       )}

                       <div className="flex items-center gap-2 w-full mt-2">
                         <div className="flex-grow h-px bg-secondary/10" />
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-10 w-10 bg-secondary/5 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12"
                           onClick={() => removeVisitor(visitor.id)}
                         >
                           <Trash2 size={16} />
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
