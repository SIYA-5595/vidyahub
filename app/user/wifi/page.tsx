"use client";

import { useState, useEffect } from "react";
import { Wifi, PlusCircle, Trash2, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface Issue {
  id: string;
  location: string;
  problem: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

export default function WifiIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [location, setLocation] = useState("");
  const [problem, setProblem] = useState("");
  const [priority, setPriority] = useState<Issue["priority"]>("Medium");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time listener for Wi-Fi issues
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "wifi-issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Issue[];
      setIssues(issuesList);
    });
    return () => unsubscribe();
  }, [user]);

  const addIssue = async () => {
    if (!location || !problem) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated");
      await addDoc(collection(db, "users", user.uid, "wifi-issues"), {
        location,
        problem,
        priority,
        status: "Open",
        createdAt: serverTimestamp(),
      });
      setLocation("");
      setProblem("");
      setPriority("Medium");
      toast.success("Issue logged successfully");
    } catch (err) {
      console.error("Error adding issue: ", err);
      toast.error("Failed to log issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: Issue["status"]) => {
    try {
      if (!user) throw new Error("Unauthenticated");
      await updateDoc(doc(db, "users", user.uid, "wifi-issues", id), { status });
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      console.error("Error updating status: ", err);
      toast.error("Failed to update status");
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      if (!user) throw new Error("Unauthenticated");
      await deleteDoc(doc(db, "users", user.uid, "wifi-issues", id));
      toast.success("Issue record deleted");
    } catch (err: unknown) {
      console.error("Error deleting issue: ", err);
      toast.error("Failed to purge record");
    }
  };

  const filteredIssues = issues.filter((issue: Issue) =>
    issue.location.toLowerCase().includes(search.toLowerCase())
  );

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/20 text-rose-400 border-rose-500/20 shadow-inner";
      case "Medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/20 shadow-inner";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-inner";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/20 text-emerald-400 border border-white/5 shadow-inner";
      case "In Progress":
        return "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 rotate-1 scale-[1.02]";
      default:
        return "bg-background/40 text-muted-foreground/40 border border-white/5 shadow-inner italic";
    }
  };

  return (
    <PageHeader
      title="Network Diagnostics"
      description="Interface for reporting and monitoring institutional connectivity anomalies across campus nodes"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 items-center shadow-premium">
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-8 h-11 rounded-xl flex items-center gap-4 font-black text-[10px] uppercase tracking-widest italic shadow-inner">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
            Core Latency: 12ms
          </Badge>
          <div className="relative group">
            <Wifi className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-500" />
            <Input
              placeholder="Filter by sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-64 pl-12 pr-4 bg-background/50 border-white/5 text-foreground placeholder:text-muted-foreground/20 rounded-xl font-black italic text-[10px] uppercase tracking-widest placeholder:tracking-widest transition-all"
            />
          </div>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ADD ISSUE */}
        <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <CardHeader className="p-16 pb-8 relative z-10">
            <div className="space-y-4">
               <CardTitle className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-8 text-foreground leading-none">
                  <div className="p-6 bg-background/50 rounded-3xl border border-white/5 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                     <PlusCircle size={48} className="text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  Initialize Incident Log
               </CardTitle>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 ml-[104px] italic leading-none">Capture connectivity parameters across institutional nodes</p>
            </div>
          </CardHeader>

          <CardContent className="p-16 pt-4 grid grid-cols-1 md:grid-cols-12 gap-10 items-end relative z-10">
              <div className="space-y-4 md:col-span-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Sector Locus</Label>
                <Input 
                  placeholder="E.G. LAB 4B CORE" 
                  value={location} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
                    setLocation(val);
                  }} 
                  className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-8 text-foreground uppercase tracking-tight placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-4 md:col-span-5">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Anomaly Description</Label>
                <Input 
                  placeholder="E.G. LATENCY SPIKES IN NEURAL LINK" 
                  value={problem} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9\s.,]/g, "");
                    setProblem(val);
                  }} 
                  className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-8 text-foreground uppercase tracking-tight placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all" 
                />
              </div>

            <div className="md:col-span-1.5 space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Criticality</Label>
               <Select value={priority} onValueChange={(v) => setPriority(v as Issue["priority"])}>
                 <SelectTrigger className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-widest text-foreground focus:ring-primary/20 transition-all uppercase px-8">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border border-white/5 bg-card/95 backdrop-blur-xl text-foreground font-black italic text-[12px] uppercase tracking-widest">
                    <SelectItem value="Low">LOW</SelectItem>
                    <SelectItem value="Medium">MED</SelectItem>
                    <SelectItem value="High">HIGH</SelectItem>
                 </SelectContent>
               </Select>
            </div>

            <div className="md:col-span-1.5">
               <Button onClick={addIssue} disabled={isSubmitting} className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 active:scale-95 transition-all border-none relative overflow-hidden group/btn">
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "TRANSMIT"}
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* ISSUE LIST */}
        <div className="space-y-12">
          <div className="flex items-center justify-between px-10">
            <div className="space-y-3">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Diagnostic Registry</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Live Network Propagation Status // Sector Connectivity Logs</p>
            </div>
            <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest bg-background/40 border border-white/5 text-foreground italic shadow-inner">{filteredIssues.length} ACTIVE INCIDENTS</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredIssues.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-56 bg-background/20 rounded-[5rem] border-4 border-dashed border-white/5 text-center relative group overflow-hidden">
                 <Wifi className="w-64 h-64 mx-auto text-primary opacity-[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-6">
                    <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Signal Optimal</p>
                    <p className="text-[12px] font-black text-muted-foreground/20 uppercase mt-4 tracking-[0.6em] italic leading-none">No anomalies identified across institutional nodes</p>
                 </div>
              </motion.div>
            )}

            {filteredIssues.map((issue: Issue, index: number) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
                whileHover={{ y: -12 }}
              >
                <Card className="rounded-[4rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 bg-card/40 backdrop-blur-sm overflow-hidden relative group">
                  <div className={`absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-[25deg] group-hover:scale-[2] transition-all duration-1000 text-primary pointer-events-none`}>
                     <Wifi size={120} />
                  </div>
                  
                  <CardContent className="p-12 space-y-10 h-full flex flex-col relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-background/50 border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-inner">
                           <Wifi size={40} />
                        </div>
                        <Badge className={`rounded-xl px-6 h-10 font-black italic text-[10px] uppercase tracking-[0.1em] border transition-all shadow-inner ${priorityColor(issue.priority)}`}>
                          {issue.priority} LOAD
                        </Badge>
                     </div>

                     <div className="space-y-4 flex-grow">
                        <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none truncate group-hover:text-primary transition-colors duration-700">{issue.location}</h3>
                        <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic leading-relaxed">{issue.problem}</p>
                     </div>

                     <div className="space-y-8 pt-8 border-t border-white/5">
                       <Badge className={`w-full justify-center h-12 rounded-2xl font-black italic uppercase text-[11px] tracking-widest transition-all duration-700 ${statusColor(issue.status)}`}>
                         {issue.status} // SEQUENCE
                       </Badge>

                       <div className="flex gap-4">
                         {issue.status === "Open" && (
                           <Button
                             className="flex-1 h-14 bg-primary/20 hover:bg-primary/30 text-primary rounded-2xl font-black italic text-[10px] tracking-widest uppercase transition-all shadow-inner border border-primary/20 backdrop-blur-sm active:scale-95 group/btn relative overflow-hidden"
                             onClick={() => updateStatus(issue.id, "In Progress")}
                           >
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 animate-pulse" />
                             <AlertTriangle size={18} className="mr-3 group-hover:scale-125 transition-transform" />
                             INITIATE FIX
                           </Button>
                         )}

                         {issue.status === "In Progress" && (
                           <Button
                             className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-400 text-primary-foreground rounded-2xl font-black italic text-[10px] tracking-widest uppercase transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 group/btn relative overflow-hidden border-none"
                             onClick={() => updateStatus(issue.id, "Resolved")}
                           >
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
                             <CheckCircle2 size={18} className="mr-3 group-hover:scale-125 transition-transform" />
                             CLOSE LOG
                           </Button>
                         )}

                         <Button
                           size="icon"
                           variant="ghost"
                           className="h-14 w-14 bg-background/50 rounded-2xl text-rose-500 hover:bg-rose-500/20 transition-all transform hover:rotate-12 border border-white/5 shadow-inner"
                           onClick={() => deleteIssue(issue.id)}
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
