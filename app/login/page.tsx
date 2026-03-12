"use client";

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
    }
  };

  return (
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
    </div>
  );
}
