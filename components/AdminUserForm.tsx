"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Shield, User } from "lucide-react";
import { UserData, AddUserData } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";

interface AdminUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserData) => Promise<void>;
  initialData?: UserData | null;
}

export default function AdminUserForm({ isOpen, onClose, onSubmit, initialData }: AdminUserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "admin" | "student",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        password: "", // Don't show password during edit
        role: initialData.role,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Identity label is required";
    if (!initialData) {
      if (!formData.email.trim()) {
        newErrors.email = "Node address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid address protocol";
      }
      if (!formData.password) {
        newErrors.password = "Encryption key is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Key must be at least 6 tokens";
      }
    }
    
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
    } catch (error) {
      console.error("Error submitting user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border border-secondary/10 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 border-b border-secondary/10 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
            {initialData ? "Update Registry Node" : "Register Access Identity"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Label</label>
              <input 
                className={cn(
                  "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                  errors.name && "ring-2 ring-rose-500/50 bg-rose-50/50"
                )}
                placeholder="Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({...errors, name: ""});
                }}
              />
              {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Node Address</label>
              <input 
                type="email"
                disabled={!!initialData}
                className={cn(
                  "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50",
                  errors.email && "ring-2 ring-rose-500/50 bg-rose-50/50"
                )}
                placeholder="email@vidyahub.edu"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({...errors, email: ""});
                }}
              />
              {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.email}</p>}
            </div>
            {!initialData && (
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Encryption Key (Password)</label>
                <input 
                  type="password"
                  className={cn(
                    "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                    errors.password && "ring-2 ring-rose-500/50 bg-rose-50/50"
                  )}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({...errors, password: ""});
                  }}
                />
                {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.password}</p>}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Protocol</label>
            <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl border border-secondary/10">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "student" })}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${formData.role === 'student' ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <User className="h-4 w-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "admin" })}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${formData.role === 'admin' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-18 bg-primary hover:opacity-90 text-white rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (initialData ? "Apply Modification" : "Authorized Creation")}
          </button>
        </form>
      </div>
    </div>
  );
}
