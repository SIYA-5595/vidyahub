"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Student } from "@/hooks/useStudents";
import { cn } from "@/lib/utils";

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, "id" | "createdAt">) => Promise<void>;
  initialData?: Student | null;
}

export default function StudentForm({ isOpen, onClose, onSubmit, initialData }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roll: "",
    department: "",
    status: "Active" as "Active" | "Probation" | "Suspended",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        roll: initialData.roll,
        department: initialData.department,
        status: initialData.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        roll: "",
        department: "Architecture",
        status: "Active",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email protocol";
    }
    if (!formData.roll.trim()) newErrors.roll = "Nexus ID (Roll) is required";
    if (!formData.department.trim()) newErrors.department = "Department scope is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      console.error("Error submitting student:");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border border-secondary/10 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 border-b border-secondary/10 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
            {initialData ? "Modify Subject Profile" : "Initialize New Enrollment"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
              <input 
                className={cn(
                  "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                  errors.name && "ring-2 ring-rose-500/50 bg-rose-50/50"
                )}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({...errors, name: ""});
                }}
              />
              {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <input 
                type="email"
                className={cn(
                  "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                  errors.email && "ring-2 ring-rose-500/50 bg-rose-50/50"
                )}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({...errors, email: ""});
                }}
              />
              {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Roll / Nexus ID</label>
              <input 
                className={cn(
                  "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                  errors.roll && "ring-2 ring-rose-500/50 bg-rose-50/50"
                )}
                value={formData.roll}
                onChange={(e) => {
                  setFormData({ ...formData, roll: e.target.value });
                  if (errors.roll) setErrors({...errors, roll: ""});
                }}
              />
              {errors.roll && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.roll}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Department Scope</label>
              <select 
                className={cn(
                  "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none",
                  errors.department && "ring-2 ring-rose-500/50 bg-rose-50/50"
                )}
                value={formData.department}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value });
                  if (errors.department) setErrors({...errors, department: ""});
                }}
              >
                 <option>Architecture</option>
                 <option>Engineering</option>
                 <option>Design</option>
                 <option>Humanities</option>
              </select>
              {errors.department && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.department}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Integrity Status</label>
            <select 
              className="w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Probation" | "Suspended" })}
            >
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-18 bg-primary hover:opacity-90 text-white rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (initialData ? "Update Registry" : "Confirm Enrollment")}
          </button>
        </form>
      </div>
    </div>
  );
}
