"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  Library, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users,
  Compass,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const router = useRouter();

  const handleProtectedAction = (e: React.MouseEvent) => {
    e.preventDefault();
    // Using a promise/callback structure to simulate "clicking the alert"
    // We use sonner for a premium feel instead of native window.alert
    toast("Authentication Required", {
      description: "You need to sign in to access the dashboard.",
      action: {
        label: "Sign In",
        onClick: () => router.push("/login"),
      },
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Premium Background Mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">
              V
            </div>
            <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              VidyaHub
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors">Solutions</Link>
            <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="font-medium hidden sm:flex">
                Sign Up
              </Button>
            </Link>
            <Button 
              onClick={handleProtectedAction}
              className="rounded-full px-6 shadow-xl shadow-primary/20 font-semibold group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-pulse">
                <Zap className="h-4 w-4" />
                <span>Modern University OS 2.0 is live</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground">
                Elevate Your <span className="text-primary italic">Academic</span> Experience
              </h1>
              
              <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                VidyaHub is the all-in-one ecosystem designed to streamline your university life—from 
                precise GPA tracking to intelligent library management.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleProtectedAction}
                  size="lg" 
                  className="h-14 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30"
                >
                  Access Dashboard
                </Button>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-semibold bg-white/5 backdrop-blur-sm">
                    Explore Modern Tools
                  </Button>
                </Link>
              </div>

              {/* Stat Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 w-full max-w-5xl">
                {[
                  { label: "Active Students", value: "25k+", icon: Users },
                  { label: "Success Rate", value: "99.2%", icon: Compass },
                  { label: "Resources", value: "1.2M", icon: Library },
                  { label: "Daily Tasks", value: "450k", icon: CheckCircle2 },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-sm transition-all hover:translate-y-[-4px] hover:border-primary/30">
                    <stat.icon className="h-6 w-6 text-primary mb-3" />
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest pt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-secondary/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to <span className="text-primary">excel</span>.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-lg">
              Smart tools built for the modern student. Zero friction, maximum results.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
              {/* Feature 1 */}
              <div className="p-8 rounded-[2rem] bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all space-y-4 col-span-1">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart Dashboard</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Real-time overview of your academic progress, upcoming deadlines, and campus news in one minimalist view.
                </p>
              </div>

              {/* Feature 2 (Large) */}
              <div className="p-8 rounded-[2rem] bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all space-y-4 md:col-span-2 bg-gradient-to-br from-card to-secondary/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold">GPA Intelligence</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      Advanced grade prediction algorithms and detailed performance analytics to keep your goals within reach.
                    </p>
                  </div>
                  <div className="hidden sm:block h-32 w-32 rounded-full border-[10px] border-accent/20 border-r-accent flex items-center justify-center text-accent font-bold text-xl">
                    9.4
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-[2rem] bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-info/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-info" />
                </div>
                <h3 className="text-xl font-bold">AI Timetable</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Automatically generated schedules that balance your lectures, study sessions, and social life.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-[2rem] bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <Library className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-bold">Library Cloud</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Instant book reservations and access to digital resources across the entire university network.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-[2rem] bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold">Course Hub</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Collaborative spaces for every module to share notes, resources, and insights with your peers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="relative rounded-[3rem] bg-primary px-8 py-16 md:px-16 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-black/20 to-transparent" />
              <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="text-center md:text-left space-y-4 max-w-xl">
                  <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
                    Ready to transform your university journey?
                  </h2>
                  <p className="text-primary-foreground/80 text-lg">
                    Join thousands of students who have already upgraded their academic workflow.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleProtectedAction}
                    size="lg" 
                    variant="secondary" 
                    className="h-14 px-10 rounded-2xl text-lg font-bold"
                  >
                    Get Started Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-border/10 py-12 bg-secondary/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-60">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background font-bold text-xs">
                V
              </div>
              <span className="text-sm font-semibold tracking-tighter">VidyaHub © 2026</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
