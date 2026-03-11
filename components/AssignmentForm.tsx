"use client";

import { useState, useEffect } from "react";
import { X, FileText, Calendar, Layout, Loader2, Sparkles } from "lucide-react";
import { Assignment } from "@/hooks/useAssignments";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Assignment, "id" | "createdAt">) => Promise<void>;
  initialData?: Assignment | null;
}

export default function AssignmentForm({ isOpen, onClose, onSubmit, initialData }: AssignmentFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    department: "Engineering",
    status: "Active" as "Active" | "Closed" | "Draft",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        dueDate: initialData.dueDate,
        department: initialData.department,
        status: initialData.status,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        department: "Engineering",
        status: "Active",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Directive header is required";
    if (!formData.description.trim()) newErrors.description = "Intel brief payload is required";
    if (!formData.dueDate) newErrors.dueDate = "Deadline timestamp is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // toast is handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="bg-[#0b1220] p-12 text-white relative">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20" />
              <button 
                onClick={onClose}
                className="absolute top-10 right-10 p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    {initialData ? "Reconfigure Module" : "Manifest Assignment"}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">
                    Directives for Nexus Deliverables
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Directive Header</label>
                  <div className="relative group">
                    <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      placeholder="E.G. ADVANCED STRUCTURAL AUDIT"
                      className={cn(
                        "w-full h-16 pl-14 pr-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                        errors.title && "ring-2 ring-rose-500/50 bg-rose-50/50"
                      )}
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value.toUpperCase() });
                        if (errors.title) setErrors({...errors, title: ""});
                      }}
                    />
                  </div>
                  {errors.title && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic tracking-widest">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Intel Brief</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter comprehensive assignment directives..."
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl bg-secondary/5 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none",
                      errors.description && "ring-2 ring-rose-500/50 bg-rose-50/50"
                    )}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description) setErrors({...errors, description: ""});
                    }}
                  />
                  {errors.description && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic tracking-widest">{errors.description}</p>}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Temporal Deadline</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="date"
                      className={cn(
                        "w-full h-16 pl-14 pr-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                        errors.dueDate && "ring-2 ring-rose-500/50 bg-rose-50/50"
                      )}
                      value={formData.dueDate}
                      onChange={(e) => {
                        setFormData({ ...formData, dueDate: e.target.value });
                        if (errors.dueDate) setErrors({...errors, dueDate: ""});
                      }}
                    />
                  </div>
                  {errors.dueDate && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic tracking-widest">{errors.dueDate}</p>}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Department Scope</label>
                  <div className="relative group">
                    <Layout className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <select 
                      className="w-full h-16 pl-14 pr-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option>Engineering</option>
                      <option>Architecture</option>
                      <option>Design</option>
                      <option>Humanities</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full h-18 bg-[#0b1220] hover:bg-[#162238] text-white rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    Initialize Broadcast
                    <Sparkles className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
