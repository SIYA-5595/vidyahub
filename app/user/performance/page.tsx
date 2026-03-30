"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { BarChart, Users, TrendingUp, Trash2, Plus, GraduationCap, Award, MessageSquare, Loader2, Edit3, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, setDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { EditableText } from "@/components/ui/editable-text";

type StudentPerformance = {
  id: string;
  studentName: string;
  regNo: string;
  cgpa: number;
  attendance: number;
  arrears: number;
  remarks: string;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"staff" | "student">("staff");
  const [isSaving, setIsSaving] = useState(false);

  // Performances State
  const [performances, setPerformances] = useState<StudentPerformance[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load performances from Firestore
  useEffect(() => {
    if (!user) {
      setPerformances([]);
      return;
    }
    const q = query(collection(db, "users", user.uid, "performance-records"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPerformances(snapshot.docs.map(h => ({ ...h.data(), id: h.id })) as StudentPerformance[]);
    });
  }, [user]);

  // syncWithFirestore is no longer needed in this direct way, but we'll implement add/remove directly

  const [newRecord, setNewRecord] = useState<StudentPerformance>({
    id: "", studentName: "", regNo: "", cgpa: 0, attendance: 0, arrears: 0, remarks: ""
  });

  const addRecord = async () => {
    if (!user) return;
    if (!newRecord.studentName || !newRecord.regNo) {
        toast.error("Student Name and Reg No required");
        return;
    }
    setIsSaving(true);
    try {
      const colRef = collection(db, "users", user.uid, "performance-records");
      const newDoc = doc(colRef);
      await setDoc(newDoc, {
        ...newRecord,
        id: newDoc.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Student metrics archived");
      setNewRecord({ id: "", studentName: "", regNo: "", cgpa: 0, attendance: 0, arrears: 0, remarks: "" });
    } catch {
       toast.error("Failed to archive metrics");
    } finally {
      setIsSaving(false);
    }
  };

  const updateRecord = async (id: string, data: Partial<StudentPerformance>) => {
    if (!user || !id) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "users", user.uid, "performance-records", id);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Record updated successfully");
      setEditingId(null);
    } catch {
      toast.error("Failed to update record");
    } finally {
      setIsSaving(false);
    }
  };

  const removeRecord = async (id: string) => {
    if (!user || !id) {
      console.error("Purge Error: Missing User or Document ID");
      toast.error("Purge Failed");
      return;
    }
    try {
        await deleteDoc(doc(db, "users", user.uid, "performance-records", id));
        toast.success("Record purged from database");
    } catch (error) {
        console.error("Purge Error:", error);
        toast.error("Institutional access restricted");
    }
  };

  // Analytics
  const avgCGPA = (performances.reduce((acc, curr) => acc + Number(curr.cgpa), 0) / (performances.length || 1)).toFixed(2);
  const avgAttendance = (performances.reduce((acc, curr) => acc + Number(curr.attendance), 0) / (performances.length || 1)).toFixed(1);

  return (
    <PageHeader
      title="Performance Analytics"
      description="Track Academic Progress & Insights"
      actions={
        <div className="flex bg-card/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/5 gap-4 items-center shadow-premium">
          {isSaving && (
             <div className="flex items-center gap-2 px-4 text-[8px] font-black text-primary animate-pulse uppercase tracking-widest">
               <Loader2 className="w-3 h-3 animate-spin" />
               Syncing Analytics
             </div>
           )}
          <div className="flex bg-background/50 p-1 rounded-xl border border-white/5">
            <Button 
                variant={view === "staff" ? "secondary" : "ghost"} 
                onClick={() => setView("staff")} 
                className={`rounded-lg font-black italic text-[9px] uppercase tracking-widest h-8 transition-all px-4 ${view === "staff" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
            >
                Staff Dashboard
            </Button>
            <Button 
                variant={view === "student" ? "secondary" : "ghost"} 
                onClick={() => setView("student")} 
                className={`rounded-lg font-black italic text-[9px] uppercase tracking-widest h-8 transition-all px-4 ${view === "student" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
            >
                Student Portal
            </Button>
          </div>
        </div>
      }
    >
      {view === "staff" ? (
        <div className="space-y-8 w-full">
          {/* STAFF: OVERVIEW CARDS */}
          <div className="grid md:grid-cols-3 gap-6 w-full">
             <Card className="rounded-[2.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm group hover:shadow-premium-hover transition-all duration-500">
               <CardContent className="flex items-center gap-6 p-8">
                 <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform border border-primary/20">
                    <Users className="w-8 h-8 text-primary" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic mb-1">Total Students</p>
                   <p className="text-5xl font-black text-foreground italic tracking-tighter">{performances.length}</p>
                 </div>
               </CardContent>
             </Card>
             <Card className="rounded-[2.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm group hover:shadow-premium-hover transition-all duration-500">
               <CardContent className="flex items-center gap-6 p-8">
                 <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform border border-emerald-500/20">
                    <BarChart className="w-8 h-8 text-emerald-400" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic mb-1">Class Avg CGPA</p>
                   <p className="text-5xl font-black text-foreground italic tracking-tighter">{avgCGPA}</p>
                 </div>
               </CardContent>
             </Card>
             <Card className="rounded-[2.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm group hover:shadow-premium-hover transition-all duration-500">
               <CardContent className="flex items-center gap-6 p-8">
                 <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:scale-110 transition-transform border border-purple-500/20">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] italic mb-1">Avg Attendance</p>
                   <p className="text-5xl font-black text-foreground italic tracking-tighter">{avgAttendance}%</p>
                 </div>
               </CardContent>
             </Card>
          </div>

          {/* STAFF: ADD RECORD */}
          <Card className="rounded-[2.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                <EditableText id="perf_update" defaultText="Update Student Records" className="text-2xl font-black italic uppercase tracking-tighter text-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <div className="grid md:grid-cols-6 lg:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-[10px] mb-2 font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic">Student Name</p>
                        <Input placeholder="John Doe" value={newRecord.studentName || ""} onChange={e => {
                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                            setNewRecord({...newRecord, studentName: val});
                        }} className="rounded-xl h-14 bg-background/50 border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/10" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-2">
                         <p className="text-[10px] mb-2 font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic">Register No</p>
                         <Input placeholder="Reg No" value={newRecord.regNo || ""} onChange={e => setNewRecord({...newRecord, regNo: e.target.value})} className="rounded-xl h-14 bg-background/50 border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/10"/>
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <p className="text-[10px] mb-2 font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic">CGPA</p>
                        <Input type="number" placeholder="0.0" value={newRecord.cgpa || ''} onChange={e => {
                            const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                            setNewRecord({...newRecord, cgpa: Number(val)});
                        }} className="rounded-xl h-14 bg-background/50 border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/10"/>
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <p className="text-[10px] mb-2 font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic">Attn %</p>
                        <Input type="number" placeholder="%" value={newRecord.attendance || ''} onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setNewRecord({...newRecord, attendance: Number(val)});
                        }} className="rounded-xl h-14 bg-background/50 border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/10"/>
                    </div>
                    <div className="md:col-span-6 lg:col-span-4">
                        <p className="text-[10px] mb-2 font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic">Remarks</p>
                         <Input placeholder="Remarks" value={newRecord.remarks || ""} onChange={e => {
                             setNewRecord({...newRecord, remarks: e.target.value});
                         }} className="rounded-xl h-14 bg-background/50 border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/10"/>
                    </div>
                    <div className="md:col-span-6 lg:col-span-1">
                        <Button onClick={addRecord} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 rounded-xl shadow-lg shadow-primary/20 border-none transition-all active:scale-95">
                            <Plus className="w-6 h-6"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* STAFF: LIST */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
                <EditableText id="perf_db" defaultText="Student Database" className="font-black text-xl text-foreground italic uppercase tracking-tighter" />
                <Badge variant="secondary" className="rounded-full px-4 h-8 bg-background border border-white/5 text-primary text-[10px] font-black uppercase tracking-widest italic">{performances.length} Records</Badge>
            </div>
            {performances.map(p => (
              <Card key={p.id} className="rounded-[2rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm hover:shadow-premium-hover transition-all group overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 min-w-[250px]">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                        {p.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-lg italic uppercase tracking-tight text-foreground">{p.studentName}</p>
                      <p className="text-xs text-muted-foreground/40 font-black uppercase tracking-widest italic">{p.regNo}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-8 items-center flex-1 justify-start md:justify-center">
                    <div className="text-center">
                      <p className="text-[10px] font-black italic text-muted-foreground/40 mb-1 uppercase tracking-widest">CGPA</p>
                      <p className={`text-2xl font-black italic tracking-tighter ${p.cgpa >= 8.5 ? 'text-emerald-400' : p.cgpa >= 7 ? 'text-primary' : 'text-orange-400'}`}>
                          {p.cgpa}
                      </p>
                    </div>
                    <div className="min-w-[150px]">
                      <div className="flex justify-between text-[10px] font-black italic mb-1 uppercase tracking-widest text-muted-foreground/40">
                          <span>Attendance</span>
                          <span className="text-primary">{p.attendance}%</span>
                      </div>
                      <Progress value={p.attendance} className="h-1.5 rounded-full bg-background border border-white/5" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                         <p className="text-[10px] font-black italic text-muted-foreground/40 mb-1 uppercase tracking-widest">Faculty Remarks</p>
                         <p className="text-sm text-foreground/70 italic font-black uppercase tracking-tight leading-relaxed">&quot;{p.remarks}&quot;</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-primary hover:bg-primary/10 rounded-xl" 
                         onClick={() => {
                           if (editingId === p.id) {
                             setEditingId(null);
                           } else {
                             setEditingId(p.id);
                             setNewRecord(p); // Reuse newRecord state for simplicity or create a separate one
                           }
                         }}
                       >
                         {editingId === p.id ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => removeRecord(p.id)}>
                         <Trash2 className="w-5 h-5" />
                       </Button>
                  </div>
                </CardContent>
                {editingId === p.id && (
                  <div className="px-6 pb-6 border-t border-dashed border-primary/10 pt-6 bg-primary/5">
                    <div className="grid md:grid-cols-6 lg:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-2 lg:col-span-3">
                          <Input value={newRecord.studentName} onChange={e => setNewRecord({...newRecord, studentName: e.target.value})} className="h-10 rounded-lg bg-white" placeholder="Student Name" />
                      </div>
                      <div className="md:col-span-2 lg:col-span-2">
                          <Input value={newRecord.regNo} onChange={e => setNewRecord({...newRecord, regNo: e.target.value})} className="h-10 rounded-lg bg-white" placeholder="Reg No" />
                      </div>
                      <div className="md:col-span-1 lg:col-span-1">
                          <Input type="number" value={newRecord.cgpa} onChange={e => setNewRecord({...newRecord, cgpa: Number(e.target.value)})} className="h-10 rounded-lg bg-white" placeholder="CGPA" />
                      </div>
                      <div className="md:col-span-1 lg:col-span-1">
                          <Input type="number" value={newRecord.attendance} onChange={e => setNewRecord({...newRecord, attendance: Number(e.target.value)})} className="h-10 rounded-lg bg-white" placeholder="Attn %" />
                      </div>
                      <div className="md:col-span-6 lg:col-span-4">
                          <Input value={newRecord.remarks} onChange={e => setNewRecord({...newRecord, remarks: e.target.value})} className="h-10 rounded-lg bg-white" placeholder="Remarks" />
                      </div>
                      <div className="md:col-span-6 lg:col-span-1">
                          <Button onClick={() => updateRecord(p.id, newRecord)} className="w-full bg-primary h-10 rounded-lg">
                              <Check className="w-4 h-4"/>
                          </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* STUDENT VIEW */
        <div className="space-y-8 w-full">
           <Card className="rounded-[3rem] border-0 shadow-2xl bg-primary text-white overflow-hidden relative">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-[60px] -ml-24 -mb-24" />
             
             <CardHeader className="p-10 pb-4 relative z-10">
               <CardTitle className="text-3xl font-black flex items-center gap-4 italic tracking-tight">
                   <div className="p-3 bg-white/20 rounded-2xl">
                    <GraduationCap className="w-8 h-8 text-white" />
                   </div>
                   MY ACADEMIC HUB
               </CardTitle>
               <p className="text-white/70 font-bold uppercase tracking-[0.2em] text-xs mt-2">Reg: 21CS001 • Sem V • Computer Science</p>
             </CardHeader>
             
             <CardContent className="grid md:grid-cols-4 gap-6 text-center p-10 relative z-10">
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 hover:scale-105 transition-transform duration-500">
                   <p className="text-[10px] font-black text-white/60 mb-3 uppercase tracking-[0.2em]">CGPA</p>
                   <p className="text-6xl font-black text-white tracking-tighter">{performances[0]?.cgpa || "0.0"}</p>
                </div>
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 hover:scale-105 transition-transform duration-500">
                   <p className="text-[10px] font-black text-white/60 mb-3 uppercase tracking-[0.2em]">Attendance</p>
                   <p className="text-6xl font-black text-emerald-300 tracking-tighter">{performances[0]?.attendance || "0"}%</p>
                </div>
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 hover:scale-105 transition-transform duration-500">
                   <p className="text-[10px] font-black text-white/60 mb-3 uppercase tracking-[0.2em]">Arrears</p>
                   <p className="text-6xl font-black text-white tracking-tighter">{performances[0]?.arrears || "0"}</p>
                </div>
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 hover:scale-105 transition-transform duration-500">
                   <p className="text-[10px] font-black text-white/60 mb-3 uppercase tracking-[0.2em]">Class Rank</p>
                   <div className="flex items-center justify-center gap-3">
                      <Award className="w-10 h-10 text-yellow-300" />
                      <p className="text-6xl font-black text-yellow-300 tracking-tighter">#1</p>
                   </div>
                </div>
             </CardContent>
           </Card>

           <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" /> Semester Performance
                </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                   <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(sem => (
                            <div key={sem} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black italic uppercase tracking-widest text-muted-foreground/40">
                                  <span>Semester {sem}</span>
                                  <span className="text-primary">{(8.0 + sem * 0.1).toFixed(1)}</span>
                                </div>
                                <Progress value={80 + sem * 2} className="h-1.5 rounded-full bg-background border border-white/5" />
                            </div>
                        ))}
                   </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden relative group">
                <div className="absolute top-0 left-0 h-full w-2 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]" />
                <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-foreground">Faculty Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="p-8 bg-background/50 border border-white/5 rounded-3xl text-foreground italic text-lg font-black uppercase tracking-tight leading-relaxed relative overflow-hidden group">
                      <div className="absolute top-0 left-0 p-4 opacity-5">
                        <MessageSquare className="w-12 h-12" />
                      </div>
                      <div className="relative z-10">
                        &quot;Excellent performance consistently. Shows great leadership in group projects. Needs slightly more focus on Theoretical subjects.&quot;
                      </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between px-2">
                      <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary bg-primary/5 text-[10px] font-black uppercase tracking-widest italic">Class Advisor</Badge>
                      <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest italic">Updated Yesterday</span>
                  </div>
                </CardContent>
            </Card>
           </div>
        </div>
      )}
    </PageHeader>
  );
}
