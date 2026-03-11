"use client";

import { useState, useEffect } from "react";
import { X, FileText, Calendar, Layout, Loader2, Sparkles } from "lucide-react";
import { Assignment } from "@/hooks/useAssignments";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 border-none bg-white rounded-[3.5rem] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#0b1220] p-12 text-white relative">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">
                {initialData ? "Reconfigure Module" : "Manifest Assignment"}
              </DialogTitle>
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Directive Header</Label>
              <div className="relative group">
                <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                <Input 
                  placeholder="E.G. ADVANCED STRUCTURAL AUDIT"
                  className={cn(
                    "h-16 pl-14 pr-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none",
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Intel Brief</Label>
              <Textarea 
                rows={4}
                placeholder="Enter comprehensive assignment directives..."
                className={cn(
                  "px-6 py-4 rounded-2xl bg-secondary/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none resize-none",
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Temporal Deadline</Label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                <Input 
                  type="date"
                  className={cn(
                    "h-16 pl-14 pr-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none",
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Department Scope</Label>
              <div className="relative group">
                <Layout className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors z-30" />
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="w-full h-16 pl-14 pr-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none appearance-none">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-secondary/10 shadow-xl font-bold">
                    <SelectItem value="Engineering" className="rounded-xl">Engineering</SelectItem>
                    <SelectItem value="Architecture" className="rounded-xl">Architecture</SelectItem>
                    <SelectItem value="Design" className="rounded-xl">Design</SelectItem>
                    <SelectItem value="Humanities" className="rounded-xl">Humanities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={submitting}
            className="w-full h-18 bg-[#0b1220] hover:bg-[#162238] text-white rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
          >
            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                Initialize Broadcast
                <Sparkles className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
