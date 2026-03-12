"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useTimetables, Timetable } from "@/hooks/useTimetables";
import { CloudUpload, FileText, CheckCircle2, AlertCircle, X, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function TimetableUpload() {
  const { timetables, loading, addTimetable, deleteTimetable } = useTimetables();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDept, setSelectedDept] = useState("Engineering Dept.");
  const [selectedFrame, setSelectedFrame] = useState("Winter Sem 2024");

  const handleUpload = async (fileName: string) => {
    setUploading(true);
    try {
      await addTimetable({
        name: fileName,
        department: selectedDept,
        temporalFrame: selectedFrame,
        size: (Math.random() * 5).toFixed(1) + " MB",
        status: "Verified"
      });
      toast.success("Matrix propagated successfully");
    } catch {
      toast.error("Transmission failed");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file.name);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 space-y-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Temporal Mapping</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Upload institutional schedule matrices for Nexus synchronization</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
               {/* Upload Zone */}
               <div 
                  className={cn(
                    "relative p-20 rounded-[4rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group",
                    dragActive ? "border-primary bg-primary/5 scale-105" : "border-secondary/20 bg-white hover:border-primary/40 hover:bg-slate-50"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUpload(file.name);
                  }}
               >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={onFileChange}
                    accept=".pdf,.xlsx,.xlsm"
                  />
                  
                  <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000 text-primary">
                    <CloudUpload size={200} />
                  </div>
                  
                  <div className="h-24 w-24 rounded-3xl bg-secondary/10 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors relative z-10">
                    {uploading ? (
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    ) : (
                      <CloudUpload className="h-12 w-12 text-slate-400 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Push Matrix Data</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">Drop institutional PDF or XLSM schedules here for instant parsing</p>
                    <div className="pt-6">
                      <label 
                        htmlFor="file-upload"
                        className="px-8 py-4 bg-[#0b1220] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl group-hover:bg-primary transition-all cursor-pointer inline-block"
                      >
                        Browse Core Files
                      </label>
                    </div>
                  </div>
               </div>

               {/* Recent Uploads */}
               <div className="space-y-6">
                  <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Validation Log</h2>
                  {loading ? (
                    <div className="flex items-center gap-4 py-12 opacity-50">
                       <Loader2 className="h-6 w-6 text-primary animate-spin" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Syncing Matrix History...</p>
                    </div>
                  ) : timetables.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-secondary/30">
                       <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No schedules manifested</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {timetables.map((file) => (
                          <div key={file.id} className="p-6 bg-white rounded-3xl border border-secondary/10 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4">
                                <FileText className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                                <div>
                                    <p className="text-xs font-black text-slate-900 italic tracking-tight truncate w-32">{file.name}</p>
                                    <p className={cn(
                                      "text-[9px] font-black uppercase tracking-widest mt-1",
                                      file.status === "Verified" ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                      {file.status} • {file.size}
                                    </p>
                                </div>
                            </div>
                            <button 
                              onClick={() => deleteTimetable(file.id!)}
                              className="p-2 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                          </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            <div className="space-y-8">
               <div className="p-10 bg-[#0b1220] rounded-[3rem] text-white space-y-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20" />
                  
                  <h3 className="text-xl font-black italic uppercase tracking-tight relative z-10">Upload Matrix</h3>
                  <div className="space-y-6 relative z-10">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Department</label>
                        <select 
                          className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                          value={selectedDept}
                          onChange={(e) => setSelectedDept(e.target.value)}
                        >
                           <option>Engineering Dept.</option>
                           <option>Architecture Dept.</option>
                           <option>Business Dept.</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporal Frame</label>
                        <select 
                          className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                          value={selectedFrame}
                          onChange={(e) => setSelectedFrame(e.target.value)}
                        >
                           <option>Winter Sem 2024</option>
                           <option>Summer Sem 2024</option>
                        </select>
                     </div>
                  </div>

                  <div className="pt-4 relative z-10">
                     <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Download className="h-4 w-4 text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Master Template.xml</span>
                        </div>
                        <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">Get Path</button>
                     </div>
                  </div>
               </div>
               
               <div className="p-8 bg-white rounded-[2.5rem] border border-secondary/10 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">Propagation Status</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Global Sync</span>
                        <span className="text-[10px] font-bold text-emerald-600">Active</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
