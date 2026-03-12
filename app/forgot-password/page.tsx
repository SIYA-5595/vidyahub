"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
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

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("loading");
    setErrorMessage(null);

    // Direct the reset link to our custom /reset-password page.
    // Firebase will append ?mode=resetPassword&oobCode=XXX to this URL.
    // NOTE: In Firebase Console → Authentication → Templates → Password reset
    //       → "Customize action URL", set it to:
    //       https://<your-domain>/reset-password
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/reset-password`,
      handleCodeInApp: false,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setStatus("success");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      let message = "Something went wrong. Please try again.";

      if (firebaseErr.code === "auth/user-not-found") {
        // Return success state to avoid email enumeration attacks
        setStatus("success");
        return;
      } else if (firebaseErr.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (firebaseErr.code === "auth/too-many-requests") {
        message =
          "Too many requests. Please wait a few minutes and try again.";
      }

      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4"
      data-testid="forgot-password-page"
    >
      <Card className="w-full max-w-md shadow-2xl bg-white">
        <CardHeader className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Mail className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>

        {/* ✅ Success State */}
        {status === "success" ? (
          <CardContent className="space-y-5 text-center">
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2
                className="h-12 w-12 text-green-500"
                data-testid="success-icon"
              />
              <p
                className="text-sm text-gray-700 leading-relaxed"
                data-testid="success-message"
              >
                If an account exists for{" "}
                <span className="font-semibold text-gray-900">{email}</span>,
                you will receive a password reset link shortly. Check your spam
                folder if you don&apos;t see it.
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft size={16} />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        ) : (
          /* 📧 Form State */
          <form onSubmit={handleSubmit} data-testid="forgot-password-form">
            <CardContent className="space-y-4">
              {/* 🔥 Error Banner */}
              {status === "error" && errorMessage && (
                <div
                  role="alert"
                  data-testid="forgot-password-error"
                  className="p-3 rounded-md bg-red-100 text-red-600 text-sm font-medium"
                >
                  {errorMessage}
                </div>
              )}

              <div>
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  data-testid="forgot-password-email-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  className="mt-1"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
                data-testid="forgot-password-submit"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 font-medium"
                data-testid="back-to-login-link"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
