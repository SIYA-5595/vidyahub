"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { Eye, EyeOff, Lock, UserCircle, ShieldCheck, ArrowRight, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { motion } from "framer-motion";

function SignUpForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
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
          toast.success("Invitation Node Verified", {
            description: `Authenticating link for ${data.email}`
          });
        } else {
          setError(data.error || "Invalid or expired invitation link");
          toast.error("Invitation Conflict", {
            description: data.error || "This link node is no longer operational"
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
      router.replace("/user/dashboard");
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

      // Force logout so user has to sign in manually
      await signOut(auth);

      setIsLoading(false);
      toast.success("Neural Node Initialized!", {
        description: "Please authenticate with your new identity.",
      });
      
      // Auto redirect after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err) {
      setIsLoading(false);
      let message = "Manifestation failure. Neural link sequence aborted.";
      const error = err as { code?: string };
      
      if (error.code === 'auth/email-already-in-use') {
        message = "Identity already exists. Execute login protocol instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "Passkey insufficient. Minimal 6-character entropy required.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Identity mail node format invalid.";
      }
      
      setError(message);
      toast.error("Manifestation Failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden" data-testid="signup-page">
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-card/60 backdrop-blur-xl mb-8 border border-white/10 shadow-premium group hover:rotate-12 transition-transform duration-700 relative overflow-hidden mx-auto">
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-primary animate-pulse" />
            <Users size={40} className="text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            IDENTITY MANIFESTATION
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 mt-4 italic leading-none">
            Establish Neural Link // Academic Perimeter Access
          </p>
        </div>

        <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-3xl overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          
          <form ref={formRef} onSubmit={handleSignUp} data-testid="signup-form" className="relative z-10">
            <CardContent className="p-16 space-y-10">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-black uppercase tracking-widest italic animate-pulse text-center"
                >
                  SEQUENCE ERROR: {error}
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Given Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    data-testid="signup-firstname-input"
                    placeholder="ALEXANDER" 
                    required 
                    className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all px-8 placeholder:tracking-widest"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Family Name</Label>
                  <Input 
                    id="lastName"  
                    name="lastName"
                    data-testid="signup-lastname-input"
                    placeholder="VANCE" 
                    required 
                    className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all px-8 placeholder:tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Identity Mail Node</Label>
                <Input 
                  id="email" 
                  name="email"
                  data-testid="signup-email-input"
                  type="email" 
                  placeholder="IDENTITY@VIDYAHUB.EDU"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  readOnly={!!prefilledEmail}
                  required 
                  className={`h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all px-8 placeholder:tracking-widest ${prefilledEmail ? 'opacity-40 cursor-not-allowed select-none' : ''}`}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-2 italic leading-none">Security Passkey</Label>
                <div className="relative group/input">
                  <Lock className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/20 group-focus-within/input:text-primary transition-all duration-700" />
                  <Input
                    id="password"
                    name="password"
                    data-testid="signup-password-input"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    className="h-16 pl-20 pr-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="signup-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground/20 hover:text-primary transition-all"
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-10 p-16 pt-0">
              <Button
                data-testid="signup-submit-button"
                className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] font-black italic uppercase tracking-widest text-[12px] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] border-none relative overflow-hidden group/btn"
                type="submit"
                disabled={isLoading}
              >
                 <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                 {isLoading ? (
                   <Loader2 size={32} className="animate-spin" />
                 ) : (
                   <>
                     INITIALIZE ACCOUNT
                     <ArrowRight size={24} className="ml-4 group-hover:translate-x-2 transition-transform duration-500" />
                   </>
                 )}
              </Button>
              <div className="text-center">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="flex-grow h-px bg-white/5" />
                    <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] italic leading-none">Already Synchronized?</p>
                    <div className="flex-grow h-px bg-white/5" />
                 </div>
                 <Link href="/login" data-testid="login-link" className="text-[12px] font-black text-primary hover:text-primary/80 underline decoration-2 underline-offset-8 transition-all uppercase tracking-widest leading-none">
                    EXECUTE SIGN IN PROTOCOL
                 </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-12 text-center"
        >
           <p className="text-[10px] font-black uppercase tracking-[1em] text-muted-foreground/10 leading-none">
              SECURE DEPLOYMENT v2.5.0
           </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>}>
      <SignUpForm />
    </Suspense>
  );
}
