"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, Save, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    password: "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        updatedAt: new Date().toISOString(),
      };
      
      // If password logic is needed, Firebase Auth updatePassword would go here
      // But for Firestore doc, we just update names/email
      await updateDoc(userRef, updateData);
      toast.success("Identity registry updated successfully");
    } catch {
      toast.error("Profile synchronization failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageHeader
      title="User Identity"
      description="Manage your institutional credentials and digital persona across the campus network"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <Button variant="ghost" className="h-10 px-6 text-white hover:bg-white/10 rounded-xl font-bold font-black uppercase text-[10px] tracking-widest" onClick={() => router.back()}>
            Abort Changes
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading} className="h-10 px-6 bg-white text-primary hover:bg-white/90 rounded-xl font-bold flex items-center gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Commit Updates
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <form onSubmit={handleUpdate} className="space-y-12">
          {/* Avatar Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
            <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-primary-foreground opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity" />
               <Avatar className="h-40 w-40 border-4 border-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                 <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} />
                 <AvatarFallback className="text-4xl font-black bg-secondary/10">
                   {user?.firstName?.[0]}{user?.lastName?.[0]}
                 </AvatarFallback>
               </Avatar>
               <button 
                 type="button"
                 className="absolute bottom-2 right-2 p-3 bg-white text-primary rounded-2xl shadow-xl hover:bg-primary hover:text-white transition-all z-20 border border-secondary/10"
               >
                 <Camera className="h-6 w-6" />
               </button>
            </div>
            <div className="text-center">
               <h2 className="text-2xl font-black italic tracking-tighter uppercase">{formData.firstName} {formData.lastName}</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Authentication tier: verified user</p>
            </div>
          </motion.div>

          {/* Credentials Card */}
          <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-10 pb-4">
               <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Identity Registry Credentials</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Given Name</Label>
                     <Input 
                       value={formData.firstName}
                       onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                       className="h-14 rounded-2xl bg-secondary/5 border-0 font-black text-lg px-6"
                       required 
                     />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Ancestral Name</Label>
                     <Input 
                       value={formData.lastName}
                       onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                       className="h-14 rounded-2xl bg-secondary/5 border-0 font-black text-lg px-6"
                       required 
                     />
                  </div>
               </div>

               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Digital Address (Email)</Label>
                  <Input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/5 border-0 font-black text-lg px-6"
                    required 
                  />
               </div>

               <div className="pt-6 border-t border-secondary/5">
                  <div className="space-y-3">
                     <div className="flex justify-between items-center ml-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Security Cipher (Password)</Label>
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded-md">Confidential</span>
                     </div>
                     <Input 
                       type="password" 
                       placeholder="Leave blank to maintain current encryption"
                       value={formData.password}
                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                       className="h-14 rounded-2xl bg-secondary/5 border-0 font-black text-lg px-6"
                     />
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
             <p className="text-[10px] font-bold text-muted-foreground italic text-center max-w-xs leading-relaxed opacity-40 uppercase tracking-widest animate-pulse">
                Modifying these parameters will update your global profile across the VidyaHub ecosystem
             </p>
          </div>
        </form>
      </div>
    </PageHeader>
  );
}
