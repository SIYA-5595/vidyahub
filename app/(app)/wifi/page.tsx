"use client";

import { useState, useEffect } from "react";
import { Wifi, PlusCircle, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
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

  // Real-time listener for Wi-Fi issues
  useEffect(() => {
    if (!user) {
      return;
    }
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
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500 text-white shadow-emerald-500/20";
      case "In Progress":
        return "bg-primary text-white shadow-primary/20";
      default:
        return "bg-gray-100 text-gray-500 shadow-sm";
    }
  };

  return (
    <PageHeader
      title="Network Diagnostics"
      description="Interface for reporting and monitoring institutional connectivity anomalies across campus nodes"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          <Badge className="bg-emerald-500/20 text-emerald-100 border-0 px-6 h-10 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            Core Latency: 12ms
          </Badge>
          <div className="relative hidden lg:block">
            <Wifi className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Filter by sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-48 pl-12 bg-white/10 border-0 text-white placeholder:text-white/30 rounded-xl font-bold"
            />
          </div>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ADD ISSUE */}
        <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
          <CardHeader className="p-10 pb-6">
            <div className="space-y-1">
               <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4 text-gray-900">
                 <PlusCircle className="w-8 h-8 text-primary" />
                 Initialize Incident Log
               </CardTitle>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-12">Capture connectivity parameters</p>
            </div>
          </CardHeader>

          <CardContent className="p-10 pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Sector Locus</Label>
                    <Input 
                      placeholder="e.g. Lab 4B Core" 
                      value={location} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setLocation(val);
                      }} 
                      className="h-14 rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6" 
                    />
                  </div>
                  <div className="space-y-3 lg:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Anomaly Description</Label>
                    <Input 
                      placeholder="e.g. Latency spikes in neural link" 
                      value={problem} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, "");
                        setProblem(val);
                      }} 
                      className="h-14 rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6" 
                    />
                  </div>

            <div className="md:col-span-1.5 space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Criticality</Label>
               <Select value={priority} onValueChange={(v) => setPriority(v as Issue["priority"])}>
                 <SelectTrigger className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-0 shadow-2xl">
                   <SelectItem value="Low">LOW</SelectItem>
                   <SelectItem value="Medium">MED</SelectItem>
                   <SelectItem value="High">HIGH</SelectItem>
                 </SelectContent>
               </Select>
            </div>

            <div className="md:col-span-1.5">
               <Button onClick={addIssue} className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black italic tracking-tighter text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                  TRANSMIT
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* ISSUE LIST */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Diagnostic Registry</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Live Network Propagation Status</p>
            </div>
            <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest">{filteredIssues.length} ACTIVE INCIDENTS</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredIssues.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
                 <Wifi className="w-24 h-24 mx-auto mb-8 opacity-5" />
                 <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">Signal Optimal</p>
                 <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">No anomalies identified across institutional nodes</p>
              </motion.div>
            )}

            {filteredIssues.map((issue: Issue, index: number) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -10 }}
              >
                <Card className="rounded-[3rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 bg-white overflow-hidden relative group">
                  <div className={`absolute top-0 right-0 p-8 opacity-5 scale-150 group-hover:rotate-45 transition-transform duration-1000`}>
                     <Wifi size={80} />
                  </div>
                  
                  <CardContent className="p-10 space-y-8 h-full flex flex-col">
                     <div className="flex justify-between items-start relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-secondary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                           <Wifi className="w-7 h-7" />
                        </div>
                        <Badge className={`rounded-xl px-4 h-8 font-black italic text-[10px] uppercase tracking-widest border transition-all ${priorityColor(issue.priority)}`}>
                          {issue.priority} LOAD
                        </Badge>
                     </div>

                     <div className="space-y-3 flex-grow relative z-10">
                        <h3 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase leading-none truncate group-hover:text-primary transition-colors">{issue.location}</h3>
                        <p className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-[0.2em] leading-normal">{issue.problem}</p>
                     </div>

                     <div className="space-y-6 pt-4 border-t border-secondary/5 relative z-10">
                       <Badge className={`w-full justify-center h-10 rounded-xl font-black italic uppercase text-[10px] tracking-widest ${statusColor(issue.status)}`}>
                         {issue.status}
                       </Badge>

                       <div className="flex gap-4">
                         {issue.status === "Open" && (
                           <Button
                             className="flex-1 h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-black italic text-xs tracking-tighter"
                             onClick={() => updateStatus(issue.id, "In Progress")}
                           >
                             <AlertTriangle size={16} className="mr-2" />
                             INITIATE FIX
                           </Button>
                         )}

                         {issue.status === "In Progress" && (
                           <Button
                             className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black italic text-xs tracking-tighter"
                             onClick={() => updateStatus(issue.id, "Resolved")}
                           >
                             <CheckCircle2 size={16} className="mr-2" />
                             CLOSE LOG
                           </Button>
                         )}

                         <Button
                           size="icon"
                           variant="ghost"
                           className="h-12 w-12 bg-secondary/5 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12"
                           onClick={() => deleteIssue(issue.id)}
                         >
                           <Trash2 size={18} />
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
