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
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-4 items-center">
          {isSaving && (
             <div className="flex items-center gap-2 px-4 text-[8px] font-black text-white/40 uppercase tracking-widest animate-pulse">
               <Loader2 className="w-3 h-3 animate-spin" />
               Syncing Analytics
             </div>
           )}
          <div className="flex bg-white/10 p-1 rounded-xl">
            <Button 
                variant={view === "staff" ? "secondary" : "ghost"} 
                onClick={() => setView("staff")} 
                className={`rounded-lg ${view === "staff" ? "bg-white text-primary" : "text-white hover:bg-white/10 hover:text-white"}`}
            >
                Staff Dashboard
            </Button>
            <Button 
                variant={view === "student" ? "secondary" : "ghost"} 
                onClick={() => setView("student")} 
                className={`rounded-lg ${view === "student" ? "bg-white text-primary" : "text-white hover:bg-white/10 hover:text-white"}`}
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
             <Card className="rounded-[2.5rem] border-0 shadow-sm bg-primary/5 group hover:shadow-md transition-all">
               <CardContent className="flex items-center gap-6 p-8">
                 <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-primary" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-primary uppercase tracking-wider">Total Students</p>
                   <p className="text-5xl font-black text-gray-900">{performances.length}</p>
                 </div>
               </CardContent>
             </Card>
             <Card className="rounded-[2.5rem] border-0 shadow-sm bg-emerald-50/50 group hover:shadow-md transition-all">
               <CardContent className="flex items-center gap-6 p-8">
                 <div className="p-4 bg-emerald-100 rounded-2xl group-hover:scale-110 transition-transform">
                    <BarChart className="w-8 h-8 text-emerald-600" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Class Avg CGPA</p>
                   <p className="text-5xl font-black text-gray-900">{avgCGPA}</p>
                 </div>
               </CardContent>
             </Card>
             <Card className="rounded-[2.5rem] border-0 shadow-sm bg-purple-50/50 group hover:shadow-md transition-all">
               <CardContent className="flex items-center gap-6 p-8">
                 <div className="p-4 bg-purple-100 rounded-2xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Avg Attendance</p>
                   <p className="text-5xl font-black text-gray-900">{avgAttendance}%</p>
                 </div>
               </CardContent>
             </Card>
          </div>

          {/* STAFF: ADD RECORD */}
          <Card className="rounded-[2.5rem] border-0 shadow-sm bg-secondary/10 overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-bold italic uppercase tracking-tight">
                <EditableText id="perf_update" defaultText="Update Student Records" className="text-2xl font-bold italic uppercase tracking-tight" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <div className="grid md:grid-cols-6 lg:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm mb-2 font-semibold text-gray-600 uppercase tracking-tight ml-1">Student Name</p>
                        <Input placeholder="John Doe" value={newRecord.studentName || ""} onChange={e => {
                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                            setNewRecord({...newRecord, studentName: val});
                        }} className="rounded-xl h-14 bg-white font-semibold text-base" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-2">
                         <p className="text-sm mb-2 font-semibold text-gray-600 uppercase tracking-tight ml-1">Register No</p>
                         <Input placeholder="Reg No" value={newRecord.regNo || ""} onChange={e => setNewRecord({...newRecord, regNo: e.target.value})} className="rounded-xl h-14 bg-white font-semibold text-base"/>
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <p className="text-sm mb-2 font-semibold text-gray-600 uppercase tracking-tight ml-1">CGPA</p>
                        <Input type="number" placeholder="0.0" value={newRecord.cgpa || ''} onChange={e => {
                            const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                            setNewRecord({...newRecord, cgpa: Number(val)});
                        }} className="rounded-xl h-14 bg-white font-semibold text-base"/>
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <p className="text-sm mb-2 font-semibold text-gray-600 uppercase tracking-tight ml-1">Attn %</p>
                        <Input type="number" placeholder="%" value={newRecord.attendance || ''} onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setNewRecord({...newRecord, attendance: Number(val)});
                        }} className="rounded-xl h-14 bg-white font-semibold text-base"/>
                    </div>
                    <div className="md:col-span-6 lg:col-span-4">
                        <p className="text-sm mb-2 font-semibold text-gray-600 uppercase tracking-tight ml-1">Remarks</p>
                         <Input placeholder="Remarks" value={newRecord.remarks || ""} onChange={e => {
                             setNewRecord({...newRecord, remarks: e.target.value});
                         }} className="rounded-xl h-14 bg-white font-semibold text-base"/>
                    </div>
                    <div className="md:col-span-6 lg:col-span-1">
                        <Button onClick={addRecord} className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl">
                            <Plus className="w-6 h-6"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* STAFF: LIST */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
                <EditableText id="perf_db" defaultText="Student Database" className="font-bold text-xl text-gray-900 italic uppercase tracking-tighter" />
                <Badge variant="secondary" className="rounded-full px-4 h-8">{performances.length} Records</Badge>
            </div>
            {performances.map(p => (
              <Card key={p.id} className="rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 min-w-[250px]">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                        {p.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight">{p.studentName}</p>
                      <p className="text-sm text-muted-foreground font-medium">{p.regNo}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-8 items-center flex-1 justify-start md:justify-center">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest opacity-60">CGPA</p>
                      <p className={`text-2xl font-black ${p.cgpa >= 8.5 ? 'text-emerald-600' : p.cgpa >= 7 ? 'text-primary' : 'text-orange-600'}`}>
                          {p.cgpa}
                      </p>
                    </div>
                    <div className="min-w-[150px]">
                      <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-widest opacity-60">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="text-primary">{p.attendance}%</span>
                      </div>
                      <Progress value={p.attendance} className="h-2 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                         <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest opacity-60">Faculty Remarks</p>
                         <p className="text-sm text-gray-600 italic font-medium leading-relaxed">&quot;{p.remarks}&quot;</p>
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
            <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white">
                <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" /> Semester Performance
                </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                   <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(sem => (
                            <div key={sem} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                                  <span>Semester {sem}</span>
                                  <span className="text-primary">{(8.0 + sem * 0.1).toFixed(1)}</span>
                                </div>
                                <Progress value={80 + sem * 2} className="h-2 rounded-full" />
                            </div>
                        ))}
                   </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-0 shadow-sm bg-secondary/20 relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-full w-2 bg-primary" />
                <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold">Faculty Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="p-8 bg-white rounded-3xl text-gray-700 italic text-xl font-medium leading-relaxed relative">
                      <div className="absolute top-0 left-0 p-4 opacity-10">
                        <MessageSquare className="w-12 h-12" />
                      </div>
                      &quot;Excellent performance consistently. Shows great leadership in group projects. Needs slightly more focus on Theoretical subjects.&quot;
                  </div>
                  <div className="mt-8 flex items-center justify-between px-2">
                      <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary">Class Advisor</Badge>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Updated Yesterday</span>
                  </div>
                </CardContent>
            </Card>
           </div>
        </div>
      )}
    </PageHeader>
  );
}
