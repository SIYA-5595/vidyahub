"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useRequests, RequestItem } from "@/hooks/useRequests";
import { CheckCircle2, XCircle, Search, Trash2, Loader2, AlertCircle, Clock, GraduationCap, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const { requests, loading, updateRequestStatus, deleteRequest } = useRequests();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = requests.filter(item => 
    item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await updateRequestStatus(id, status);
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently purge this request record?")) {
      try {
        await deleteRequest(id);
        toast.success("Record purged from nexus");
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
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Input Requests</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Managing Institutional Feedback & Requests</p>
            </div>
            <div className="h-14 px-6 rounded-2xl bg-white border border-secondary/20 flex items-center gap-3 text-sm font-bold text-slate-600">
               <Clock className="h-5 w-5 text-primary" />
               {requests.filter(r => r.status === "Pending").length} Pending Queries
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-premium border border-secondary/10 overflow-hidden">
            <div className="p-10 border-b border-secondary/10 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-slate-50/50">
              <div className="relative group flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter request stream..." 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-secondary/20 font-medium text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Syncing Queue...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-dashed border-secondary/30 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-3xl bg-secondary/5 flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-slate-300" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Queue Synchronized</h2>
                  <p className="text-sm text-slate-400 mt-2 max-w-xs">No institutional requests detected in the current stream.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRequests.map((item) => (
                    <div key={item.id} className="p-8 bg-white rounded-[2.5rem] border border-secondary/10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:shadow-xl transition-all duration-500">
                       <div className="flex items-start gap-6">
                          <div className="h-16 w-16 rounded-3xl bg-secondary/5 shrink-0 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                             <GraduationCap className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                   {item.type}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                   <Clock className="h-3 w-3" />
                                   {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : "just now"}
                                </span>
                             </div>
                             <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">
                                {item.studentName} <span className="text-slate-300 font-normal">({item.studentId})</span>
                             </h3>
                             <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                {item.subject}: <span className="font-medium text-slate-500">{item.description}</span>
                             </p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 lg:border-l lg:pl-8 border-secondary/10">
                          {item.status === "Pending" ? (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(item.id!, "Approved")}
                                className="h-12 px-6 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(item.id!, "Rejected")}
                                className="h-12 px-6 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <div className={cn(
                              "h-12 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                              item.status === "Approved" ? "bg-emerald-100 text-emerald-600 italic" : "bg-rose-100 text-rose-600 italic"
                            )}>
                               {item.status === "Approved" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                               {item.status}
                            </div>
                          )}
                          <button 
                            onClick={() => handleDelete(item.id!)}
                            className="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
