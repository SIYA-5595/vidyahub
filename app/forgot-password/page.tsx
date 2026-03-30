"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
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
import { motion } from "framer-motion";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("loading");
    setErrorMessage(null);

    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/reset-password`,
      handleCodeInApp: false,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setStatus("success");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      let message = "Manifestation error. Recovery sequence failed.";

      if (firebaseErr.code === "auth/user-not-found") {
        setStatus("success");
        return;
      } else if (firebaseErr.code === "auth/invalid-email") {
        message = "Identity mail node format invalid.";
      } else if (firebaseErr.code === "auth/too-many-requests") {
        message = "Flood protection active. Await synchronization retry.";
      }

      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden" data-testid="forgot-password-page">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(30,136,229,0.03),transparent_70%)] pointer-events-none" />

      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.8 }}
         className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-card/60 backdrop-blur-xl mb-8 border border-white/10 shadow-premium group hover:rotate-12 transition-transform duration-700 relative overflow-hidden mx-auto">
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-primary animate-pulse" />
            <Mail size={48} className="text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            RECOVERY NEXUS
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 mt-4 italic leading-none">
            Passkey Restoration Protocol // Authorized Access
          </p>
        </div>

        <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-3xl overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />

          {/* ✅ Success State */}
          {status === "success" ? (
            <CardContent className="p-16 space-y-10 text-center relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="flex flex-col items-center gap-8 py-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:rotate-12 transition-all duration-700">
                     <CheckCircle2 size={56} className="animate-pulse" data-testid="success-icon" />
                  </div>
                  <div className="space-y-4">
                     <p className="text-3xl font-black italic tracking-tighter text-emerald-400 uppercase leading-none">TRANSMISSION SENT</p>
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic leading-relaxed px-8" data-testid="success-message">
                       IF AN ACCOUNT EXISTS FOR <span className="text-primary">{email}</span>, A RECOVERY LINK HAS BEEN TRANSMITTED TO THE CORRESPONDING NODE.
                     </p>
                  </div>
                </div>
                <Link href="/login" className="block">
                  <Button className="w-full h-16 bg-background/50 border border-white/5 hover:bg-background/80 text-foreground rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-inner transition-all group/back">
                    <ArrowLeft size={18} className="mr-4 group-hover:-translate-x-2 transition-transform" />
                    BACK TO LOGIN PROTOCOL
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          ) : (
            /* 📧 Form State */
            <form onSubmit={handleSubmit} data-testid="forgot-password-form" className="relative z-10">
              <CardContent className="p-16 space-y-10">
                {status === "error" && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-black uppercase tracking-widest italic animate-pulse text-center"
                  >
                    SEQUENCE ERROR: {errorMessage}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <Label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Identity Mail Node</Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                    <Input
                      id="reset-email"
                      data-testid="forgot-password-email-input"
                      type="email"
                      placeholder="IDENTITY@VIDYAHUB.EDU"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                      className="h-16 pl-20 pr-8 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all placeholder:tracking-widest"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-10 p-16 pt-0">
                <Button
                  type="submit"
                  className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] font-black italic uppercase tracking-widest text-[12px] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] border-none relative overflow-hidden group/btn"
                  disabled={status === "loading"}
                  data-testid="forgot-password-submit"
                >
                   <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                   {status === "loading" ? (
                     <Loader2 size={32} className="animate-spin" />
                   ) : (
                     <div className="flex items-center gap-6">
                        TRANSMIT RECOVERY LINK
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                     </div>
                   )}
                </Button>

                <div className="text-center">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="flex-grow h-px bg-white/5" />
                      <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] italic leading-none">Abort Mission?</p>
                      <div className="flex-grow h-px bg-white/5" />
                   </div>
                   <Link
                     href="/login"
                     className="text-[12px] font-black text-primary hover:text-primary/80 underline decoration-2 underline-offset-8 transition-all uppercase tracking-widest leading-none flex items-center justify-center gap-3"
                     data-testid="back-to-login-link"
                   >
                     <ArrowLeft size={16} />
                     RETURN TO LOGIN
                   </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-12 text-center"
        >
           <p className="text-[10px] font-black uppercase tracking-[1em] text-muted-foreground/10 leading-none">
              RECOVERY AGENT v2.5.0
           </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
