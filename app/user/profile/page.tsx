"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, Save, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Given Name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Ancestral Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().optional(),
});

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  // Load user data into form when available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        updatedAt: new Date().toISOString(),
      };
      
      // If password logic is needed, Firebase Auth updatePassword would go here
      
      await updateDoc(userRef, updateData);
      toast.success("Identity registry updated successfully");
      
      // Reset password field to empty after save
      form.setValue("password", "");
    } catch {
      toast.error("Profile synchronization failed");
    } finally {
      setIsLoading(false);
    }
  };

  const firstNameValue = form.watch("firstName");
  const lastNameValue = form.watch("lastName");

  return (
    <PageHeader
      title="User Identity"
      description="Manage your institutional credentials and digital persona across the campus network"
      actions={
        <div className="flex bg-background/50 p-1.5 rounded-2xl backdrop-blur-md border border-border/20 gap-3">
           <Button variant="ghost" className="h-10 px-6 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all" onClick={() => router.back()}>
            Abort Changes
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold flex items-center gap-2 border-none shadow-xl shadow-primary/20">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Save className="w-4 h-4" />}
            Commit Updates
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {/* Avatar Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
              <div className="relative group">
                 <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-accent opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity" />
                 <Avatar className="h-40 w-40 border-4 border-border shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                   <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} />
                   <AvatarFallback className="text-4xl font-black bg-white/5 text-foreground">
                     {firstNameValue?.[0]}{lastNameValue?.[0]}
                   </AvatarFallback>
                 </Avatar>
                 <button 
                   type="button"
                   className="absolute bottom-2 right-2 p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:bg-primary/90 transition-all z-20 border border-border/10"
                 >
                   <Camera className="h-6 w-6" />
                 </button>
              </div>
              <div className="text-center">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">{firstNameValue} {lastNameValue}</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 opacity-60">Authentication tier: verified user</p>
              </div>
            </motion.div>

            {/* Credentials Card */}
            <Card className="rounded-[3rem] border border-border shadow-premium bg-card overflow-hidden">
              <CardHeader className="p-10 pb-4">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 opacity-50">Identity Registry Credentials</CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Given Name</FormLabel>
                           <FormControl>
                             <Input 
                               {...field}
                               className="h-14 rounded-2xl bg-background/50 border border-border font-black text-lg px-6 text-foreground italic"
                             />
                           </FormControl>
                           <FormMessage className="ml-2 text-xs text-rose-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Ancestral Name</FormLabel>
                           <FormControl>
                             <Input 
                               {...field}
                               className="h-14 rounded-2xl bg-background/50 border border-border font-black text-lg px-6 text-foreground italic"
                             />
                           </FormControl>
                           <FormMessage className="ml-2 text-xs text-rose-400" />
                        </FormItem>
                      )}
                    />
                 </div>

                 <FormField
                   control={form.control}
                   name="email"
                   render={({ field }) => (
                     <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Digital Address (Email)</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            {...field}
                            className="h-14 rounded-2xl bg-background/50 border border-border font-black text-lg px-6 text-foreground italic"
                          />
                        </FormControl>
                        <FormMessage className="ml-2 text-xs text-rose-400" />
                     </FormItem>
                   )}
                 />

                 <div className="pt-6 border-t border-border/40">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                           <div className="flex justify-between items-center ml-2">
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Security Cipher (Password)</FormLabel>
                              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">Confidential</span>
                           </div>
                           <FormControl>
                             <Input 
                               type="password"
                               placeholder="Leave blank to maintain current encryption"
                               {...field}
                               className="h-14 rounded-2xl bg-background/50 border border-border font-black text-lg px-6 text-foreground italic placeholder:text-muted-foreground/20"
                             />
                           </FormControl>
                           <FormMessage className="ml-2 text-xs text-rose-400" />
                        </FormItem>
                      )}
                    />
                 </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
               <p className="text-[10px] font-bold text-muted-foreground/40 italic text-center max-w-xs leading-relaxed opacity-40 uppercase tracking-widest animate-pulse">
                  Modifying these parameters will update your global profile across the VidyaHub ecosystem
               </p>
            </div>
          </form>
        </Form>
      </div>
    </PageHeader>
  );
}
