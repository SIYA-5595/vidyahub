"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Student } from "@/hooks/useStudents";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 border-none bg-white rounded-[3rem] overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 border-b border-secondary/10 bg-slate-50/50">
          <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-slate-900">
            {initialData ? "Modify Subject Profile" : "Initialize New Enrollment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
              <Input 
                className={cn(
                  "h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none",
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
              <Input 
                type="email"
                className={cn(
                  "h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none",
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Roll / Nexus ID</Label>
              <Input 
                className={cn(
                  "h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none",
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Department Scope</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  setFormData({ ...formData, department: value });
                  if (errors.department) setErrors({...errors, department: ""});
                }}
              >
                <SelectTrigger className={cn(
                  "w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none appearance-none",
                  errors.department && "ring-2 ring-rose-500/50 bg-rose-50/50"
                )}>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-secondary/10 shadow-xl font-bold">
                  <SelectItem value="Architecture" className="rounded-xl">Architecture</SelectItem>
                  <SelectItem value="Engineering" className="rounded-xl">Engineering</SelectItem>
                  <SelectItem value="Design" className="rounded-xl">Design</SelectItem>
                  <SelectItem value="Humanities" className="rounded-xl">Humanities</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.department}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Integrity Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as "Active" | "Probation" | "Suspended" })}
            >
              <SelectTrigger className="w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none appearance-none">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-secondary/10 shadow-xl font-bold">
                <SelectItem value="Active" className="rounded-xl">Active</SelectItem>
                <SelectItem value="Probation" className="rounded-xl">Probation</SelectItem>
                <SelectItem value="Suspended" className="rounded-xl">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-18 bg-primary hover:opacity-90 text-white rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (initialData ? "Update Registry" : "Confirm Enrollment")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
