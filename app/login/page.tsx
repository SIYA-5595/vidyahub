"use client";

import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ADMIN_ROLES = ["super_admin", "department_admin", "admin"];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));

      if (!userDoc.exists()) {
        toast.error("No profile found for this account. Contact your administrator.");
        return;
      }

      const role: string = userDoc.data().role || "student";
      toast.success("Identity verified. Loading dashboard…");

      router.replace(ADMIN_ROLES.includes(role) ? "/admin/dashboard" : "/student/dashboard");
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      let message = "Authentication failed. Please try again.";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        message = "Incorrect email or password.";
      } else if (code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please wait a moment and try again.";
      } else if (code === "auth/user-disabled") {
        message = "This account has been disabled. Contact your administrator.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative z-10">
        {/* Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6 ring-1 ring-primary/20 mx-auto">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">
            VidyaHub Admin
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
            Enterprise Security Control Center
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-3xl p-12 rounded-[3.5rem] shadow-2xl border border-white/50">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="admin@vidyahub.edu"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary/10 border-none text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full h-14 pl-12 pr-12 rounded-2xl bg-secondary/10 border-none text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl shadow-slate-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-[10px] text-slate-400 font-medium">
            Don&apos;t have access?{" "}
            <span className="font-black text-slate-600">
              Contact your administrator for an invite.
            </span>
          </p>
        </div>

        <p className="text-center mt-10 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
          Authorized Nodes Only • Global Audit Log Active
        </p>
      </div>
    </div>
  );
}
