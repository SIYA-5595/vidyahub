"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AssignmentForm from "@/components/AssignmentForm";
import { useAssignments, Assignment } from "@/hooks/useAssignments";
import { FileText, Plus, Search, Trash2, Edit3, Calendar, Users, Loader2, AlertCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AssignmentsPage() {
  const { assignments, loading, addAssignment, updateAssignment, deleteAssignment } = useAssignments();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const filteredAssignments = assignments.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: Omit<Assignment, "id" | "createdAt">) => {
    try {
      await addAssignment(data);
      toast.success("Directive manifested successfully");
    } catch {
      toast.error("Initialization failed");
    }
  };

  const handleUpdate = async (data: Omit<Assignment, "id" | "createdAt">) => {
    if (!editingAssignment?.id) return;
    try {
      await updateAssignment(editingAssignment.id, data);
      toast.success("Directive reconfigured");
    } catch {
      toast.error("Update sequence failed");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Purge assignment: ${title}?`)) {
      try {
        await deleteAssignment(id);
        toast.success("Broadcast terminated");
      } catch {
        toast.error("Cleanup failed");
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
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Assignment Vault</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Managing Pedagogical Deliverables</p>
            </div>
            <button 
              onClick={() => {
                setEditingAssignment(null);
                setIsFormOpen(true);
              }}
              className="h-14 px-8 bg-primary text-white rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-3 transition-transform active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Initialize Assignment
            </button>
          </div>

          <div className="bg-white rounded-[3rem] shadow-premium border border-secondary/10 overflow-hidden">
            <div className="p-10 border-b border-secondary/10 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-slate-50/50">
              <div className="relative group flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Scan vault index..." 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-secondary/20 font-medium text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="h-14 px-6 rounded-2xl bg-white border border-secondary/20 flex items-center gap-3 text-sm font-bold text-slate-600">
                  <FileText className="h-5 w-5 text-primary" />
                  {assignments.length} Total Directives
                </div>
              </div>
            </div>

            <div className="p-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Syncing Vault...</p>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-dashed border-secondary/30 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-3xl bg-secondary/5 flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-slate-300" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Vault Depleted</h2>
                  <p className="text-sm text-slate-400 mt-2 max-w-xs">No active assignments matching your query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {filteredAssignments.map((item) => (
                    <div key={item.id} className="p-10 bg-white rounded-[2.5rem] border border-secondary/10 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                       {/* Department Indicator */}
                       <div className="absolute top-0 right-0 p-1 bg-primary/10 rounded-bl-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] px-4 text-primary">
                          {item.department}
                       </div>

                       <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-secondary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <FileText className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                               <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">{item.title}</h3>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Segment: {item.department}</p>
                            </div>
                          </div>

                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between border-t border-secondary/10 pt-6">
                             <div className="flex items-center gap-6">
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <Calendar className="h-3 w-3" /> Deadline
                                   </p>
                                   <p className="text-xs font-bold text-slate-900">
                                      {format(new Date(item.dueDate), "MMM dd, yyyy")}
                                   </p>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</p>
                                   <span className={cn(
                                     "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                                     item.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'
                                   )}>
                                      {item.status}
                                   </span>
                                </div>
                             </div>

                             <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => {
                                    setEditingAssignment(item);
                                    setIsFormOpen(true);
                                  }}
                                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                                >
                                  <Edit3 className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id!, item.title)}
                                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AssignmentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={editingAssignment ? handleUpdate : handleCreate}
        initialData={editingAssignment}
      />
    </div>
  );
}
