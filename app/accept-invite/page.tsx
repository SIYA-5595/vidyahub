"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "verifying" | "setup" | "success" | "error";

// ─── Password strength helper ─────────────────────────────────────────────────

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"];

// ─── Main Page ────────────────────────────────────────────────────────────────

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const strength = getPasswordStrength(password);

  // ── Step 1: Verify the link and invite ──────────────────────────────────────
  useEffect(() => {
    async function verify() {
      const url = window.location.href;

      // Must be a Firebase Email Sign-in Link
      if (!isSignInWithEmailLink(auth, url)) {
        setStatus("error");
        setErrorMessage(
          "This link is invalid or has expired. Please ask your admin to send a new invitation."
        );
        setLoading(false);
        return;
      }

      // Recover email from URL param or localStorage
      const emailFromUrl = searchParams.get("email");
      const emailFromStorage = window.localStorage.getItem("emailForSignIn");
      const detectedEmail = (emailFromUrl || emailFromStorage || "").trim().toLowerCase();

      if (!detectedEmail) {
        setStatus("error");
        setErrorMessage(
          "Email not found in the link. Please click the exact link from your invitation email."
        );
        setLoading(false);
        return;
      }

      setEmail(detectedEmail);

      // Confirm a pending invite exists via API (bypasses restrictive Firestore client rules)
      try {
        const res = await fetch(`/api/invite/verify?email=${encodeURIComponent(detectedEmail)}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(
            data.error || "No pending invitation found for this email. It may have already been used or expired."
          );
          setLoading(false);
          return;
        }

        setRole(data.role || "admin");
        setStatus("setup");
      } catch (err) {
        console.error("[accept-invite] Verify error:", err);
        setStatus("error");
        setErrorMessage("Failed to verify your invitation. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [searchParams]);

  // ── Step 2: Submit form → API → sign in ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Please enter your full name.");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    if (strength < 2) return toast.error("Please choose a stronger password.");

    setSubmitting(true);

    try {
      // POST to server — creates Firebase Auth user + writes Firestore doc
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        customToken?: string;
        role?: string;
        error?: string;
      };

      if (!res.ok) throw new Error(data.error || "Account creation failed.");

      // Sign in with the custom token returned by the server
      await signInWithCustomToken(auth, data.customToken!);

      // Clear invite email from storage
      window.localStorage.removeItem("emailForSignIn");

      setStatus("success");
      toast.success("Account created! Welcome to VidyaHub.");

      // Role-based redirect
      setTimeout(() => {
        const adminRoles = ["super_admin", "department_admin", "admin"];
        router.replace(
          adminRoles.includes(data.role ?? "") ? "/admin/dashboard" : "/student/dashboard"
        );
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render: Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="h-14 w-14 text-primary animate-spin relative" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Verifying Invite Link…
        </p>
      </div>
    );
  }

  // ── Render: Error ────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] p-6">
        <div className="w-full max-w-md p-10 bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 mx-auto">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black italic tracking-tight text-slate-900 uppercase">
              Access Denied
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Success ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="w-full max-w-md p-12 bg-white rounded-[3rem] shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full" />
            <div className="relative h-24 w-24 mx-auto rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">
              Access Granted
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
              Account Initialized
            </p>
          </div>
          <p className="text-slate-400 text-sm font-medium">Redirecting to your dashboard…</p>
          <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
        </div>
      </div>
    );
  }

  // ── Render: Setup Form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 shadow-sm border border-primary/20 mx-auto">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">
            Complete Setup
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
            Initialize Your{" "}
            <span className="text-primary capitalize">{role.replace(/_/g, " ")}</span> Profile
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/90 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/60">
          {/* Invited-as badge */}
          <div className="mb-8 flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Invited As
              </p>
              <p className="text-sm font-bold text-slate-800 break-all">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Full Name ── */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Seth"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:font-normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Set Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full h-14 pl-12 pr-12 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:font-normal"
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

              {/* Strength indicator */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? STRENGTH_COLORS[strength] : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 ml-1">
                    Strength:{" "}
                    <span className="text-slate-600">{STRENGTH_LABELS[strength]}</span>
                  </p>
                </div>
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your password"
                  className={`w-full h-14 pl-12 pr-12 rounded-2xl bg-slate-50 border text-sm font-bold focus:outline-none focus:ring-4 transition-all placeholder:font-normal ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-200 focus:ring-primary/10 focus:border-primary"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {confirmPassword === password ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={submitting || strength < 2}
              className="w-full h-14 mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl shadow-slate-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Activate Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-widest">
          Secured by Firebase Authentication • VidyaHub
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
