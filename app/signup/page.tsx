"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function SignUpPage() {
  const router = useRouter();
  const { saveCredentials, user, loading } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState("");

  useEffect(() => {
    async function verifyToken() {
      if (!token) return;
      
      try {
        const response = await fetch(`/api/invite/verify?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setPrefilledEmail(data.email);
          setEmailValue(data.email);
          toast.success("Invitation verified", {
            description: `Signing up for ${data.email}`
          });
        } else {
          setError(data.error || "Invalid or expired invitation link");
          toast.error("Invitation error", {
            description: data.error || "This link is no longer valid"
          });
        }
      } catch (err) {
        console.error("Token verification error:", err);
      } finally {
        setIsVerifyingToken(false);
      }
    }
    
    if (token) {
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    // Redirect to dashboard if already logged in and NOT currently signing up
    if (!loading && user && !isLoading && !isVerifyingToken) {
      router.replace("/dashboard");
    }
  }, [user, loading, isLoading, router, isVerifyingToken]);
  
  const formRef = useRef<HTMLFormElement>(null);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        role: token ? "admin" : "student",
      });

      // Consume token if present
      if (token) {
        try {
          await fetch('/api/invite/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } catch (err) {
          console.error("Token consumption error:", err);
        }
      }

      // Save credentials for autofill before redirecting
      saveCredentials({ email, password });

      // Force logout so user has to sign in manually
      await signOut(auth);

      setIsLoading(false);
      toast.success("Account created successfully!", {
        description: "Please sign in with your new account.",
      });
      
      // Auto redirect after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err) {
      setIsLoading(false);
      let message = "An error occurred during signup.";
      const error = err as { code?: string };
      
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Try logging in instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "Password is too weak. Please use at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Email/password accounts are not enabled in Firebase.";
      }
      
      setError(message);
      toast.error("Signup failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#f0f4f8] dark:bg-[#020617] p-4 sm:p-8" data-testid="signup-page">
      <Card className="w-full max-w-[400px] sm:max-w-md shadow-2xl border-slate-200 bg-white dark:bg-[#0f172a] dark:border-slate-800 transition-all duration-300">
        <CardHeader className="space-y-2 pb-6 sm:pb-8">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create account
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">
            Enter your details below to create your VidyaHub account
          </CardDescription>
        </CardHeader>
        <form ref={formRef} onSubmit={handleSignUp} data-testid="signup-form">
          <CardContent className="space-y-4 sm:space-y-5">
            {error && (
              <div
                data-testid="signup-error-message"
                className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm font-bold animate-in fade-in zoom-in duration-200"
              >
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-900 dark:text-slate-200 font-bold ml-1">First name</Label>
                <Input 
                  id="firstName" 
                  name="firstName"
                  data-testid="signup-firstname-input"
                  placeholder="John" 
                  required 
                  className="border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50  dark:text-white focus:ring-primary h-12 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-900 dark:text-slate-200 font-bold ml-1">Last name</Label>
                <Input 
                  id="lastName"  
                  name="lastName"
                  data-testid="signup-lastname-input"
                  placeholder="Doe" 
                  required 
                  className="border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 dark:text-white focus:ring-primary h-12 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-900 dark:text-slate-200 font-bold ml-1">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                data-testid="signup-email-input"
                type="email" 
                placeholder="name@example.com"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                readOnly={!!prefilledEmail}
                required 
                className={`border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 dark:text-white focus:ring-primary h-12 transition-all ${prefilledEmail ? 'opacity-70 cursor-not-allowed select-none' : ''}`}
              />
            </div>

            <div className="space-y-2 ">
              <Label 
                htmlFor="password" 
                className="text-slate-900 dark:text-slate-200 font-bold ml-1"
              >
                Password
              </Label>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  data-testid="signup-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-10 pr-12 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-primary h-12 dark:text-white transition-all"
                />
                <button
                  type="button"
                  data-testid="signup-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-6 sm:pt-8 pb-8 sm:pb-10">
            <Button
              data-testid="signup-submit-button"
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Create My Account"
              )}
            </Button>
            <div className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" data-testid="login-link" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
