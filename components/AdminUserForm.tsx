"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Shield, User } from "lucide-react";
import { UserData, AddUserData } from "@/hooks/useUsers";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 border border-border bg-card rounded-[3rem] overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 border-b border-border bg-background/50">
          <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-foreground">
            {initialData ? "Update Registry Node" : "Register Access Identity"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Label</Label>
              <Input 
                className={cn(
                  "h-14 px-6 rounded-2xl bg-background/50 border border-border text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground/20 italic",
                  errors.name && "ring-2 ring-rose-500/50 bg-rose-500/10"
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Node Address</Label>
              <Input 
                type="email"
                disabled={!!initialData}
                className={cn(
                  "h-14 px-6 rounded-2xl bg-background/50 border border-border text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none disabled:opacity-50 placeholder:text-muted-foreground/20 italic",
                  errors.email && "ring-2 ring-rose-500/50 bg-rose-500/10"
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Encryption Key (Password)</Label>
                <Input 
                  type="password"
                  className={cn(
                    "h-14 px-6 rounded-2xl bg-background/50 border border-border text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground/20 italic",
                    errors.password && "ring-2 ring-rose-500/50 bg-rose-500/10"
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
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Protocol</Label>
            <div className="flex gap-4 p-2 bg-background/50 rounded-2xl border border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormData({ ...formData, role: "student" })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 px-6 py-4 h-auto rounded-xl transition-all font-black uppercase text-[10px] tracking-widest",
                  formData.role === 'student' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-white/5'
                )}
              >
                <User className="h-4 w-4" />
                Student
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormData({ ...formData, role: "admin" })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 px-6 py-4 h-auto rounded-xl transition-all font-black uppercase text-[10px] tracking-widest",
                  formData.role === 'admin' ? 'bg-accent text-accent-foreground shadow-lg' : 'text-muted-foreground hover:bg-white/5'
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (initialData ? "Apply Modification" : "Authorized Creation")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
