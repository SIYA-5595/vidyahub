"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StudentForm from "@/components/StudentForm";
import { useStudents, Student } from "@/hooks/useStudents";
import { Plus, Search, Trash2, Edit3, Mail, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function StudentManagement() {
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: Omit<Student, "id" | "createdAt">) => {
    try {
      await addStudent(data);
      toast.success("Student enrolled successfully");
    } catch {
      toast.error("Failed to enroll student");
    }
  };

  const handleUpdate = async (data: Omit<Student, "id" | "createdAt">) => {
    if (!editingStudent?.id) return;
    try {
      await updateStudent(editingStudent.id, data);
      toast.success("Profile updated in registry");
    } catch {
      toast.error("Update sequence failed");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Confirm deletion of ${name}?`)) {
      try {
        await deleteStudent(id);
        toast.success("Subject purged from registry");
      } catch {
        toast.error("Operation failed");
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
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Registry Control</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Manage Student Enrollment & Identity</p>
            </div>
            <button 
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              className="h-14 px-8 bg-primary text-white rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-3 transition-transform active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Enroll New Subject
            </button>
          </div>

          <div className="bg-white rounded-[3rem] shadow-premium border border-secondary/10 overflow-hidden">
            <div className="p-10 border-b border-secondary/10 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-slate-50/50">
              <div className="relative group flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter student directory..." 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-secondary/20 font-medium text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="h-14 px-6 rounded-2xl bg-white border border-secondary/20 flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Users className="h-5 w-5 text-primary" />
                  {students.length} Total Nodes
                </div>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Registry...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nexus ID</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Department</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Integrity</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/10">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center font-black text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-none">{student.name}</p>
                              <p className="text-xs font-medium text-slate-400 mt-1.5 flex items-center gap-1.5">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-xs font-black italic tracking-widest text-slate-600 bg-secondary/20 px-4 py-2 rounded-xl">
                            {student.roll}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                           <p className="text-sm font-bold text-slate-700">{student.department}</p>
                        </td>
                        <td className="px-10 py-8">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none",
                            student.status === "Active" ? "bg-emerald-100 text-emerald-600" : 
                            student.status === "Probation" ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", student.status === "Active" ? "bg-emerald-500" : student.status === "Probation" ? "bg-amber-500" : "bg-rose-500")} />
                            {student.status}
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingStudent(student);
                                setIsFormOpen(true);
                              }}
                              className="p-3 bg-white shadow-sm border border-secondary/20 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(student.id!, student.name)}
                              className="p-3 bg-white shadow-sm border border-secondary/20 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Zero Nodes Detected</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <StudentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={editingStudent ? handleUpdate : handleCreate}
        initialData={editingStudent}
      />
    </div>
  );
}
