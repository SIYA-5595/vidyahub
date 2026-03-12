"use client";

<<<<<<< HEAD
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        toast.success("Identity Verified.");
        router.push("/dashboard");
      } else {
        toast.error("Registry record missing.");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Verification failed. Check credentials.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
=======
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
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white rounded-[2.5rem] border-0 overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center p-10 pt-12">
          <CardTitle className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">
            VidyaHub
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Nexus Authenticator
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin} className="px-10 pb-10">
          <CardContent className="space-y-6 px-0">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity</Label>
              <Input
                type="email"
                placeholder="node@vidyahub.edu"
                className="h-14 rounded-2xl bg-slate-50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Encryption</Label>
                  <Link
                    href="/forgot-password"
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-70"
                  >
                    Reset?
                  </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="h-14 rounded-2xl bg-slate-50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 font-bold pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pt-6 px-0">
            <Button
              className="w-full h-16 rounded-2xl bg-[#0b1220] hover:bg-[#162238] text-white font-black italic uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.98]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Initiate Sync"
              )}
            </Button>

            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">New Node?</span>
              <Link href="/signup" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline italic">
                Generate Access
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
=======
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
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
    </div>
  );
}
