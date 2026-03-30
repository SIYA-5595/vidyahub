"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type PageStatus =
  | "verifying"   // Checking oobCode on mount
  | "ready"       // oobCode valid, show the form
  | "submitting"  // Sending confirmPasswordReset
  | "success"     // Password changed successfully
  | "invalid"     // oobCode expired / already used / missing
  | "error";      // Submission error

// ─────────────────────────────────────────────
// Password strength helper
// ─────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;   // 0-4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "CRITICAL FAILURE",  color: "bg-red-500" },
    { label: "VULNERABLE",      color: "bg-orange-500" },
    { label: "NOMINAL",      color: "bg-yellow-500" },
    { label: "SECURE",      color: "bg-blue-500" },
    { label: "PENETRATION PROOF",    color: "bg-emerald-500" },
  ];

  return { score, ...levels[score] };
}

// ─────────────────────────────────────────────
// Inner component (uses useSearchParams — must be inside Suspense)
// ─────────────────────────────────────────────
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const oobCode = searchParams.get("oobCode");
  const mode    = searchParams.get("mode");

  const isValidLink = Boolean(oobCode) && mode === "resetPassword";

  const [pageStatus, setPageStatus]      = useState<PageStatus>(
    isValidLink ? "verifying" : "invalid"
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [errorMessage, setErrorMessage]  = useState<string>(
    isValidLink
      ? ""
      : "This reset link node is invalid or missing required telemetry. Request new sequence."
  );

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (!isValidLink || !oobCode) return;

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setVerifiedEmail(email);
        setPageStatus("ready");
      })
      .catch((err: { code?: string }) => {
        const expired =
          err.code === "auth/expired-action-code" ||
          err.code === "auth/invalid-action-code";
        setErrorMessage(
          expired
            ? "Recovery link expired or already synchronized. Initiate new sequence."
            : "Reset link invalid. Request new password restoration."
        );
        setPageStatus("invalid");
      });
  }, [isValidLink, oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (newPassword.length < 8) {
      setValidationError("Passkey minimal entropy required: 8 characters.");
      return;
    }
    if (strength.score < 2) {
      setValidationError("Security threshold not met. Increase passkey complexity.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Passkey mismatch detected. Re-verify inputs.");
      return;
    }

    setPageStatus("submitting");

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setPageStatus("success");
      setTimeout(() => router.replace("/login"), 3000);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      let message = "Password restoration failed. Link sync error.";

      if (
        firebaseErr.code === "auth/expired-action-code" ||
        firebaseErr.code === "auth/invalid-action-code"
      ) {
        message = "Link expired or already consumed. Request new restoration.";
        setPageStatus("invalid");
        setErrorMessage(message);
        return;
      } else if (firebaseErr.code === "auth/weak-password") {
        message = "Passkey entropy insufficient for perimeter security.";
      }

      setErrorMessage(message);
      setPageStatus("error");
    }
  };

  if (pageStatus === "verifying") {
    return (
      <CardContent className="flex flex-col items-center gap-6 py-16 relative z-10">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic animate-pulse">Verifying Neural Link Telemetry…</p>
      </CardContent>
    );
  }

  if (pageStatus === "invalid") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
        <CardContent className="flex flex-col items-center gap-8 py-10 text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
            <AlertTriangle size={48} />
          </div>
          <p className="text-sm font-black italic text-muted-foreground/60 uppercase tracking-tight leading-relaxed px-8" data-testid="reset-invalid-message">
            {errorMessage}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 p-16 pt-0">
          <Link href="/forgot-password" title="Request New Reset Link" className="w-full">
            <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 border-none transition-all" data-testid="request-new-link-button">
              INITIATE NEW SEQUENCE
            </Button>
          </Link>
          <Link href="/login" className="text-[12px] font-black text-primary hover:text-primary/80 underline decoration-2 underline-offset-8 transition-all uppercase tracking-widest leading-none flex items-center justify-center gap-3">
             <ArrowLeft size={16} /> RETURN TO LOGIN
          </Link>
        </CardFooter>
      </motion.div>
    );
  }

  if (pageStatus === "success") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
        <CardContent className="flex flex-col items-center gap-8 py-10 text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <CheckCircle2 size={48} className="animate-pulse" />
          </div>
          <div className="space-y-4">
            <p className="text-3xl font-black italic tracking-tighter text-emerald-400 uppercase leading-none" data-testid="reset-success-heading">
              PASSKEY SYNCHRONIZED
            </p>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic leading-relaxed px-8" data-testid="reset-success-message">
              RESTORATION COMPLETE. REDIRECTING TO AUTHENTICATION NODE…
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-16 pt-0">
          <Link href="/login" className="w-full">
            <Button className="w-full h-16 bg-background/50 border border-white/5 hover:bg-background/80 text-foreground rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-inner transition-all flex items-center gap-4 justify-center" data-testid="go-to-login-button">
              MANUAL LOGIN BYPASS <ArrowRight size={18} />
            </Button>
          </Link>
        </CardFooter>
      </motion.div>
    );
  }

  if (pageStatus === "error") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
        <CardContent className="flex flex-col items-center gap-8 py-10 text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
            <AlertTriangle size={48} />
          </div>
          <p className="text-sm font-black italic text-muted-foreground/60 uppercase tracking-tight leading-relaxed px-8" data-testid="reset-error-message">
            {errorMessage}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 p-16 pt-0">
          <Button
            className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 border-none transition-all"
            onClick={() => {
              setPageStatus("ready");
              setErrorMessage("");
            }}
          >
            RETRY SEQUENCE
          </Button>
          <Link href="/forgot-password" className="text-[12px] font-black text-primary hover:text-primary/80 underline decoration-2 underline-offset-8 transition-all uppercase tracking-widest leading-none flex items-center justify-center gap-3">
             REQUEST NEW LINK
          </Link>
        </CardFooter>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="reset-password-form" className="relative z-10">
      <CardContent className="p-16 space-y-10">
        {verifiedEmail && (
          <div className="flex items-center gap-4 rounded-2xl bg-primary/5 border border-primary/20 p-6 text-[10px] font-black uppercase tracking-widest text-primary italic shadow-inner">
            <ShieldCheck size={20} className="shrink-0" />
            <span>AUTHENTICATED EMAIL NODE: <span className="text-foreground">{verifiedEmail}</span></span>
          </div>
        )}

        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-black uppercase tracking-widest italic animate-pulse text-center"
          >
            VALIDATION ERROR: {validationError}
          </motion.div>
        )}

        <div className="space-y-4">
          <Label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">New Security Passkey</Label>
          <div className="relative group/input">
            <Lock className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
            <Input
              id="new-password"
              data-testid="reset-new-password-input"
              type={showNew ? "text" : "password"}
              placeholder="MIN. 8 ENTROPY CHARACTER"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
              className="h-16 pl-20 pr-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all placeholder:tracking-widest"
            />
            <button
              type="button"
              data-testid="toggle-new-password"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground/20 hover:text-primary transition-all"
            >
              {showNew ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {newPassword.length > 0 && (
            <div className="space-y-3 pt-2" data-testid="password-strength-meter">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                      i < strength.score ? strength.color : "bg-white/5"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest italic text-right ${
                strength.score <= 1 ? "text-rose-500"
                : strength.score === 2 ? "text-amber-500"
                : strength.score === 3 ? "text-blue-500"
                : "text-emerald-500"
              }`}>
                SECURITY LEVEL: {strength.label}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Confirm Passkey</Label>
          <div className="relative group/input">
            <Lock className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
            <Input
              id="confirm-password"
              data-testid="reset-confirm-password-input"
              type={showConfirm ? "text" : "password"}
              placeholder="RE-ENTER PASSKEY"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-16 pl-20 pr-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all placeholder:tracking-widest"
            />
            <button
              type="button"
              data-testid="toggle-confirm-password"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground/20 hover:text-primary transition-all"
            >
              {showConfirm ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {confirmPassword.length > 0 && (
            <p
              data-testid="password-match-indicator"
              className={`text-[10px] font-black uppercase tracking-widest italic text-right ${
                newPassword === confirmPassword
                  ? "text-emerald-500"
                  : "text-rose-500 animate-pulse"
              }`}
            >
              {newPassword === confirmPassword
                ? "✓ PASSKEY SYNC OPTIMAL"
                : "✗ PASSKEY MISMATCH DETECTED"}
            </p>
          )}
        </div>

        <div className="bg-background/40 backdrop-blur-sm rounded-3xl p-8 border border-white/5 shadow-inner">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-4 italic leading-none underline">Security Matrix Requirements:</p>
           <ul className="text-[10px] font-black uppercase tracking-widest space-y-3 list-none italic">
             <li className={`${newPassword.length >= 8 ? "text-emerald-500" : "text-muted-foreground/20"}`}>
               {newPassword.length >= 8 ? "✓" : "○"} 08+ ENTROPY CHARACTERS
             </li>
             <li className={`${/[A-Z]/.test(newPassword) ? "text-emerald-500" : "text-muted-foreground/20"}`}>
               {/[A-Z]/.test(newPassword) ? "✓" : "○"} UPPERCASE NODE
             </li>
             <li className={`${/[0-9]/.test(newPassword) ? "text-emerald-500" : "text-muted-foreground/20"}`}>
               {/[0-9]/.test(newPassword) ? "✓" : "○"} NUMERIC IDENTIFIER
             </li>
             <li className={`${/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-500" : "text-muted-foreground/20"}`}>
               {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"} SPECIAL SYMBOL OPERATOR
             </li>
           </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-10 p-16 pt-0">
        <Button
          type="submit"
          className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] font-black italic uppercase tracking-widest text-[12px] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] border-none relative overflow-hidden group/btn"
          disabled={pageStatus === "submitting"}
          data-testid="reset-submit-button"
        >
           <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
           {pageStatus === "submitting" ? (
             <Loader2 size={32} className="animate-spin" />
           ) : (
             <div className="flex items-center gap-6">
                <Lock size={20} />
                COMMIT NEW PASSKEY
             </div>
           )}
        </Button>

        <Link
          href="/login"
          className="text-[12px] font-black text-primary hover:text-primary/80 underline decoration-2 underline-offset-8 transition-all uppercase tracking-widest leading-none flex items-center justify-center gap-3"
          data-testid="back-to-login-link"
        >
          ABORT RECOVERY
        </Link>
      </CardFooter>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden" data-testid="reset-password-page">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(30,136,229,0.03),transparent_70%)] pointer-events-none" />

      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.8 }}
         className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-card/60 backdrop-blur-xl mb-8 border border-white/10 shadow-premium group hover:rotate-12 transition-transform duration-700 relative overflow-hidden mx-auto">
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-primary animate-pulse" />
            <Lock size={48} className="text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            PASSKEY OVERRIDE
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 mt-4 italic leading-none">
            Reset Authorized // Establishing New Security Parameters
          </p>
        </div>

        <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-3xl overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          
          <Suspense
            fallback={
              <CardContent className="flex flex-col items-center gap-6 py-24">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic animate-pulse">Initializing Security Subsystem…</p>
              </CardContent>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Card>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-12 text-center"
        >
           <p className="text-[10px] font-black uppercase tracking-[1em] text-muted-foreground/10 leading-none">
              SECURITY PROTOCOL v2.5.0
           </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
