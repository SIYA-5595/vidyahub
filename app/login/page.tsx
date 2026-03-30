"use client";

import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, UserCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const user = userCredential.user;

      // Fetch user profile to verify existence and role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || "student";
        const isAdmin = ["admin", "super_admin", "department_admin"].includes(role);

        toast.success(`Access Authorized. Proceeding to ${isAdmin ? "Admin" : "Student"} Neural Link...`);

        // Set cookies for middleware
        const maxAge = 60 * 60 * 24 * 7; 
        document.cookie = `auth_token=${user.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `user_role=${isAdmin ? "admin" : "student"}; path=/; max-age=${maxAge}; SameSite=Lax`;

        // Routing
        router.push(isAdmin ? "/admin/dashboard" : "/user/dashboard");
      } else {
        toast.error("User profile node not identified in nexus");
      }
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      let message = "Neural link failed. Synchronization aborted.";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        message = "Incorrect credentials. Neural match failure.";
      } else if (code === "auth/user-not-found") {
        message = "Identity node not identified.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(30,136,229,0.03),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-card/60 backdrop-blur-xl mb-8 border border-white/10 shadow-premium group hover:rotate-12 transition-transform duration-700 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-primary animate-pulse" />
            <ShieldCheck size={48} className="text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            VIDYAHUB NEXUS
          </h1>
          <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 mt-4 italic leading-none">
            Secure Academy Protocol // Identification Required
          </p>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="bg-card/40 backdrop-blur-3xl p-16 rounded-[4rem] shadow-premium border border-white/5 relative overflow-hidden group hover:shadow-premium-hover transition-all duration-700"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          
          <form className="space-y-10 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">
                Identity Mail Node
              </label>
              <div className="relative group/input">
                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                <input
                  type="email"
                  placeholder="IDENTITY@VIDYAHUB.EDU"
                  className="w-full h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 text-lg font-black italic uppercase tracking-tight placeholder:text-muted-foreground/10 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground placeholder:tracking-widest"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center ml-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none">
                    Security Passkey
                 </label>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 hover:text-primary cursor-pointer italic transition-colors" onClick={() => router.push('/forgot-password')}>
                    Recovery Link?
                 </span>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full h-16 pl-20 pr-16 rounded-2xl bg-background/50 border border-white/5 text-lg font-black italic uppercase tracking-tight placeholder:text-muted-foreground/10 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground/20 hover:text-primary transition-all"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-[2rem] font-black italic uppercase tracking-widest text-[12px] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-6 group/btn border-none relative overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
              {loading ? (
                <Loader2 size={32} className="animate-spin" />
              ) : (
                <>
                  INITIALIZE NEURAL LINK
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center mt-12 relative z-10">
             <div className="flex items-center gap-6 mb-8">
                <div className="flex-grow h-px bg-white/5" />
                <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] italic">Or Identity Manifestation</p>
                <div className="flex-grow h-px bg-white/5" />
             </div>
             <p className="text-[12px] font-black text-muted-foreground/40 italic leading-none">
                Awaiting clearance?{" "}
                <span className="text-primary hover:text-primary/80 cursor-pointer underline transition-all font-black uppercase tracking-[0.1em]" onClick={() => router.push('/signup')}>
                  REGISTER NEW NODE
                </span>
             </p>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-12 text-center"
        >
           <p className="text-[10px] font-black uppercase tracking-[1em] text-muted-foreground/10 leading-none">
              SYSTEM v2.5.0 // CORE DEPLOYED
           </p>
        </motion.div>
      </div>
    </div>
  );
}
