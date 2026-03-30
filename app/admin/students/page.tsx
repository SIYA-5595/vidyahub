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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Registry Control</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-2">Manage Student Enrollment & Identity</p>
            </div>
            <button 
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-3 transition-transform active:scale-95 border-none outline-none"
            >
              <Plus className="h-5 w-5" />
              Enroll New Subject
            </button>
          </div>

          <div className="bg-card rounded-[3rem] shadow-premium border border-border overflow-hidden">
            <div className="p-10 border-b border-border flex flex-col md:flex-row gap-6 md:items-center justify-between bg-background/30">
              <div className="relative group flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter student directory..." 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-background/50 border border-border font-medium text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none italic placeholder:text-muted-foreground/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="h-14 px-6 rounded-2xl bg-background/50 border border-border flex items-center gap-3 text-sm font-bold text-muted-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  {students.length} Total Nodes
                </div>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Syncing Registry...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background/20">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Identity</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Nexus ID</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Department</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Integrity</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground italic">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground leading-none">{student.name}</p>
                              <p className="text-xs font-medium text-muted-foreground/40 mt-1.5 flex items-center gap-1.5 italic">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-[10px] font-black italic tracking-widest text-foreground bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                            {student.roll}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                           <p className="text-sm font-bold text-muted-foreground italic uppercase tracking-wider">{student.department}</p>
                        </td>
                        <td className="px-10 py-8">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none",
                            student.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : 
                            student.status === "Probation" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", student.status === "Active" ? "bg-emerald-500" : student.status === "Probation" ? "bg-amber-500" : "bg-rose-500")} />
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
                              className="p-3 bg-card shadow-sm border border-border rounded-xl text-muted-foreground/40 hover:text-primary hover:border-primary transition-all"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(student.id!, student.name)}
                              className="p-3 bg-card shadow-sm border border-border rounded-xl text-muted-foreground/40 hover:text-rose-500 hover:border-rose-500 transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-24 text-center border-none">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">Zero Nodes Detected</p>
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
