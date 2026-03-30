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
    { label: "Too weak",  color: "bg-red-500" },
    { label: "Weak",      color: "bg-orange-400" },
    { label: "Fair",      color: "bg-yellow-400" },
    { label: "Good",      color: "bg-blue-400" },
    { label: "Strong",    color: "bg-green-500" },
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
  const mode    = searchParams.get("mode"); // Firebase sets mode=resetPassword

  // Derive the initial status synchronously from URL params at render time.
  // This avoids calling setState() synchronously inside a useEffect body,
  // which can cause cascading renders and triggers the react-hooks lint rule.
  const isValidLink = Boolean(oobCode) && mode === "resetPassword";

  const [pageStatus, setPageStatus]      = useState<PageStatus>(
    isValidLink ? "verifying" : "invalid"
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [errorMessage, setErrorMessage]  = useState<string>(
    isValidLink
      ? ""
      : "This reset link is invalid or missing required information. Please request a new one."
  );

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const strength = getPasswordStrength(newPassword);

  // ── Step 1: Verify oobCode via Firebase (async — safe inside useEffect) ──
  useEffect(() => {
    // Skip the async call if the link is already known to be invalid.
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
            ? "This password reset link has expired or has already been used. Please request a new one."
            : "This reset link is invalid. Please request a new password reset email."
        );
        setPageStatus("invalid");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — oobCode and mode are stable URL params

  // ── Step 2: Submit new password ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }
    if (strength.score < 2) {
      setValidationError(
        "Password is too weak. Add uppercase letters, numbers, or symbols."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match. Please try again.");
      return;
    }

    setPageStatus("submitting");

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setPageStatus("success");

      // Auto-redirect after 3 seconds
      setTimeout(() => router.replace("/login"), 3000);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      let message = "Could not reset your password. Please try again.";

      if (
        firebaseErr.code === "auth/expired-action-code" ||
        firebaseErr.code === "auth/invalid-action-code"
      ) {
        message =
          "This reset link has expired or has already been used. Please request a new password reset.";
        setPageStatus("invalid");
        setErrorMessage(message);
        return;
      } else if (firebaseErr.code === "auth/weak-password") {
        message = "Password is too weak. Please choose a stronger password.";
      }

      setErrorMessage(message);
      setPageStatus("error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Step 1 — Verifying the oobCode */
  if (pageStatus === "verifying") {
    return (
      <CardContent className="flex flex-col items-center gap-3 py-10">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Verifying your reset link…</p>
      </CardContent>
    );
  }

  /** Invalid / expired link */
  if (pageStatus === "invalid") {
    return (
      <>
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p
            className="text-sm text-gray-700 leading-relaxed"
            data-testid="reset-invalid-message"
          >
            {errorMessage}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full" data-testid="request-new-link-button">
              Request New Reset Link
            </Button>
          </Link>
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Login
          </Link>
        </CardFooter>
      </>
    );
  }

  /** Success */
  if (pageStatus === "success") {
    return (
      <>
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <p
              className="font-semibold text-gray-900"
              data-testid="reset-success-heading"
            >
              Password reset successfully!
            </p>
            <p
              className="text-sm text-gray-500 mt-1"
              data-testid="reset-success-message"
            >
              You will be redirected to the login page in a moment…
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button className="w-full gap-2" data-testid="go-to-login-button">
              Go to Login
            </Button>
          </Link>
        </CardFooter>
      </>
    );
  }

  /** Error after submission */
  if (pageStatus === "error") {
    return (
      <>
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed" data-testid="reset-error-message">
            {errorMessage}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => {
              setPageStatus("ready");
              setErrorMessage("");
            }}
          >
            Try Again
          </Button>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Request a new reset link
          </Link>
        </CardFooter>
      </>
    );
  }

  // ── "ready" | "submitting" — The main form ────────────────────────────────
  return (
    <form onSubmit={handleSubmit} data-testid="reset-password-form">
      <CardContent className="space-y-5">

        {/* Verified email badge */}
        {verifiedEmail && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
            <ShieldCheck size={16} className="shrink-0" />
            <span>
              Resetting password for{" "}
              <span className="font-semibold">{verifiedEmail}</span>
            </span>
          </div>
        )}

        {/* Validation error banner */}
        {validationError && (
          <div
            role="alert"
            data-testid="reset-validation-error"
            className="p-3 rounded-md bg-red-100 text-red-600 text-sm font-medium"
          >
            {validationError}
          </div>
        )}

        {/* New Password */}
        <div className="space-y-1">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              data-testid="reset-new-password-input"
              type={showNew ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              data-testid="toggle-new-password"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password strength meter */}
          {newPassword.length > 0 && (
            <div className="space-y-1 pt-1" data-testid="password-strength-meter">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < strength.score ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                strength.score <= 1 ? "text-red-500"
                : strength.score === 2 ? "text-yellow-600"
                : strength.score === 3 ? "text-blue-500"
                : "text-green-600"
              }`}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              data-testid="reset-confirm-password-input"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              data-testid="toggle-confirm-password"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Match indicator */}
          {confirmPassword.length > 0 && (
            <p
              data-testid="password-match-indicator"
              className={`text-xs font-medium ${
                newPassword === confirmPassword
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {newPassword === confirmPassword
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </p>
          )}
        </div>

        {/* Password requirements hint */}
        <ul className="text-xs text-gray-500 space-y-0.5 list-none">
          <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
            {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters
          </li>
          <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>
            {/[A-Z]/.test(newPassword) ? "✓" : "○"} One uppercase letter
          </li>
          <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>
            {/[0-9]/.test(newPassword) ? "✓" : "○"} One number
          </li>
          <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600" : ""}>
            {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"} One special character
          </li>
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          className="w-full"
          disabled={pageStatus === "submitting"}
          data-testid="reset-submit-button"
        >
          {pageStatus === "submitting" ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Resetting Password…
            </>
          ) : (
            <>
              <Lock size={16} className="mr-2" />
              Reset Password
            </>
          )}
        </Button>

        <Link
          href="/login"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          data-testid="back-to-login-link"
        >
          Back to Login
        </Link>
      </CardFooter>
    </form>
  );
}

// ─────────────────────────────────────────────
// Page export — wraps form in Suspense because
// useSearchParams() requires it in App Router
// ─────────────────────────────────────────────
export default function ResetPasswordPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4"
      data-testid="reset-password-page"
    >
      <Card className="w-full max-w-md shadow-2xl bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Choose a strong new password for your VidyaHub account.
          </CardDescription>
        </CardHeader>

        {/* Suspense required for useSearchParams in App Router */}
        <Suspense
          fallback={
            <CardContent className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </CardContent>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}
