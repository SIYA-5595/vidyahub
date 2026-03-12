"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useResults, ResultRecord } from "@/hooks/useResults";
import { useStudents } from "@/hooks/useStudents";
import { Search, ArrowUpRight, Save, ShieldCheck, Trash2, Loader2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ResultsManagement() {
  const { results, loading, addResult, updateResultMarks, deleteResult } = useResults();
  const { students } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("Architecture");
  const [selectedBatch, setSelectedBatch] = useState("2024 Batch");
  const [isAdding, setIsAdding] = useState(false);
  const [newResult, setNewResult] = useState({
    studentId: "",
    subject: "Theory of Design",
    marks: 0,
    maxMarks: 100
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredResults = results.filter(item => 
    (item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (item.department === selectedDept) &&
    (item.batch === selectedBatch)
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!newResult.studentId.trim()) newErrors.studentId = "Student ID is required";
    if (!newResult.subject.trim()) newErrors.subject = "Subject name is required";
    if (newResult.marks < 0) newErrors.marks = "Invalid marks";
    if (newResult.maxMarks <= 0) newErrors.maxMarks = "Invalid max marks";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddResult = async () => {
    if (!validate()) return;
    const student = students.find(s => s.roll === newResult.studentId);
    if (!student) {
      setErrors({ ...errors, studentId: "Student ID not found in registry" });
      return;
    }

    try {
      await addResult({
        ...newResult,
        studentName: student.name,
        department: selectedDept,
        batch: selectedBatch
      });
      setIsAdding(false);
      toast.success("Result manifested in nexus");
    } catch {
      toast.error("Propagation failed");
    }
  };

  const handleUpdateMarks = async (id: string, marks: string) => {
    const num = parseInt(marks);
    if (isNaN(num)) return;
    try {
      await updateResultMarks(id, num);
      toast.success("Matrix updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Purge result record?")) {
      try {
        await deleteResult(id);
        toast.success("Record purged");
      } catch {
        toast.error("Purge failed");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Scholastic Audit</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Validate and Manifest Academic Performance Records</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="h-14 px-8 bg-primary text-white rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-3 transition-transform active:scale-95"
              >
                <Plus className="h-5 w-5" />
                {isAdding ? "Cancel Audit" : "Manifest Result"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
            {/* Filters */}
            <div className="xl:col-span-1 space-y-8">
               <div className="p-10 bg-white rounded-[3rem] border border-secondary/10 shadow-sm space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Index Search</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Node</label>
                       <select 
                         className="w-full h-14 px-4 rounded-xl bg-secondary/10 border-none font-bold text-sm focus:ring-1 focus:ring-primary outline-none"
                         value={selectedDept}
                         onChange={(e) => setSelectedDept(e.target.value)}
                       >
                          <option>Architecture</option>
                          <option>Engineering</option>
                          <option>Design</option>
                          <option>Humanities</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporal Batch</label>
                       <select 
                         className="w-full h-14 px-4 rounded-xl bg-secondary/10 border-none font-bold text-sm focus:ring-1 focus:ring-primary outline-none"
                         value={selectedBatch}
                         onChange={(e) => setSelectedBatch(e.target.value)}
                       >
                          <option>2024 Batch</option>
                          <option>2023 Batch</option>
                       </select>
                    </div>
                  </div>
               </div>

                {isAdding && (
                 <div className="p-10 bg-[#0b1220] rounded-[3rem] text-white space-y-8 animate-in slide-in-from-left duration-500">
                    <h3 className="text-sm font-black uppercase tracking-widest">Entry Protocol</h3>
                    <div className="space-y-4">
                       <div className="space-y-1">
                         <input 
                           className={cn(
                             "w-full h-14 px-6 rounded-xl bg-white/5 border text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all",
                             errors.studentId ? "border-rose-500 bg-rose-500/10" : "border-white/10"
                           )}
                           placeholder="Student ID (Roll)"
                           value={newResult.studentId}
                           onChange={(e) => {
                             setNewResult({...newResult, studentId: e.target.value});
                             if (errors.studentId) setErrors({...errors, studentId: ""});
                           }}
                         />
                         {errors.studentId && <p className="text-[10px] font-bold text-rose-400 ml-2 uppercase italic tracking-widest">{errors.studentId}</p>}
                       </div>

                       <div className="space-y-1">
                         <input 
                           className={cn(
                             "w-full h-14 px-6 rounded-xl bg-white/5 border text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all",
                             errors.subject ? "border-rose-500 bg-rose-500/10" : "border-white/10"
                           )}
                           placeholder="Subject Name"
                           value={newResult.subject}
                           onChange={(e) => {
                             setNewResult({...newResult, subject: e.target.value});
                             if (errors.subject) setErrors({...errors, subject: ""});
                           }}
                         />
                         {errors.subject && <p className="text-[10px] font-bold text-rose-400 ml-2 uppercase italic tracking-widest">{errors.subject}</p>}
                       </div>

                       <div className="flex gap-4">
                          <div className="flex-1 space-y-1">
                            <input 
                              type="number"
                              className={cn(
                                "w-full h-14 px-6 rounded-xl bg-white/5 border text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all",
                                errors.marks ? "border-rose-500 bg-rose-500/10" : "border-white/10"
                              )}
                              placeholder="Marks"
                              value={newResult.marks || ""}
                              onChange={(e) => {
                                setNewResult({...newResult, marks: parseInt(e.target.value)});
                                if (errors.marks) setErrors({...errors, marks: ""});
                              }}
                            />
                            {errors.marks && <p className="text-[10px] font-bold text-rose-400 ml-1 uppercase italic tracking-tighter truncate">{errors.marks}</p>}
                          </div>
                          <div className="flex-1 space-y-1">
                            <input 
                              type="number"
                              className={cn(
                                "w-full h-14 px-6 rounded-xl bg-white/5 border text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all",
                                errors.maxMarks ? "border-rose-500 bg-rose-500/10" : "border-white/10"
                              )}
                              placeholder="Max"
                              value={newResult.maxMarks || ""}
                              onChange={(e) => {
                                setNewResult({...newResult, maxMarks: parseInt(e.target.value)});
                                if (errors.maxMarks) setErrors({...errors, maxMarks: ""});
                              }}
                            />
                            {errors.maxMarks && <p className="text-[10px] font-bold text-rose-400 ml-1 uppercase italic tracking-tighter truncate">{errors.maxMarks}</p>}
                          </div>
                       </div>
                       <button 
                         onClick={handleAddResult}
                         className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95"
                       >
                         Manifest Data
                       </button>
                    </div>
                 </div>
               )}
            </div>

            {/* Main Table */}
            <div className="xl:col-span-3">
               <div className="bg-white rounded-[3.5rem] shadow-premium border border-secondary/10 overflow-hidden">
                  <div className="p-8 border-b border-secondary/10 flex items-center justify-between bg-slate-50/50">
                    <div className="relative group w-96">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border border-secondary/20 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Search student code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Snapshot: {filteredResults.length} Records</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Scanning Registry...</p>
                      </div>
                    ) : filteredResults.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <AlertCircle className="h-10 w-10 text-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero Records in Current Frame</p>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Core</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Nexus</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Score Matrix</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Integrity</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Manifest</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                          {filteredResults.map((node) => (
                            <tr key={node.id} className="hover:bg-primary/5 transition-colors group">
                              <td className="px-10 py-8">
                                 <p className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">{node.subject}</p>
                              </td>
                              <td className="px-10 py-8">
                                 <p className="text-xs font-bold text-slate-900">{node.studentName}</p>
                                 <p className="text-[9px] font-black uppercase text-slate-400 mt-1">{node.studentId}</p>
                              </td>
                              <td className="px-10 py-8">
                                 <input 
                                   type="number"
                                   className="w-20 h-10 text-center bg-secondary/10 rounded-lg border-none font-black italic text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                                   defaultValue={node.marks}
                                   onBlur={(e) => handleUpdateMarks(node.id!, e.target.value)}
                                 />
                                 <span className="ml-2 text-[10px] font-black text-slate-400">/ {node.maxMarks}</span>
                              </td>
                              <td className="px-10 py-8">
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg",
                                  node.status === "Validated" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                )}>
                                  {node.status}
                                </span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <button 
                                   onClick={() => handleDelete(node.id!)}
                                   className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all active:scale-95 mx-auto lg:ml-auto lg:mr-0"
                                 >
                                   <Trash2 className="h-5 w-5" />
                                 </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
