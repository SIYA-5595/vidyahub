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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Premium Background Mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[140px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[140px] opacity-30" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/40 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black italic text-2xl shadow-xl shadow-primary/20">
              V
            </div>
            <span className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/40 uppercase">
              VidyaHub
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] italic">
            <Link href="#features" className="text-muted-foreground/60 hover:text-primary transition-all">Features</Link>
            <Link href="#solutions" className="text-muted-foreground/60 hover:text-primary transition-all">Solutions</Link>
            <Link href="#about" className="text-muted-foreground/60 hover:text-primary transition-all">About</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-black italic uppercase text-[10px] tracking-widest hover:bg-white/5">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="font-black italic uppercase text-[10px] tracking-widest hidden sm:flex border-white/10 bg-white/5 hover:bg-white/10">
                Sign Up
              </Button>
            </Link>
            <Button 
              onClick={handleProtectedAction}
              className="rounded-full px-8 shadow-xl shadow-primary/20 font-black italic uppercase text-[10px] tracking-widest group bg-primary hover:bg-primary/90 text-primary-foreground border-none"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          <div className="container mx-auto px-8">
            <div className="flex flex-col items-center text-center space-y-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic animate-pulse shadow-lg shadow-primary/5">
                <Zap className="h-4 w-4" />
                <span>Modern University OS 2.0 is live</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter max-w-6xl text-foreground uppercase leading-[0.9] italic">
                Elevate Your <span className="text-primary">Academic</span> Universe
              </h1>
              
              <p className="max-w-3xl text-lg md:text-xl text-muted-foreground/60 leading-relaxed italic font-medium">
                VidyaHub is the all-in-one ecosystem designed to streamline your university life—from 
                precise GPA tracking to intelligent library management.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <Button 
                  onClick={handleProtectedAction}
                  size="lg" 
                  className="h-20 px-14 rounded-[2rem] text-xl font-black italic uppercase tracking-tighter shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground border-none active:scale-95 transition-all"
                >
                  Access Dashboard
                </Button>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-20 px-14 rounded-[2rem] text-xl font-black italic uppercase tracking-tighter bg-white/5 border-white/5 backdrop-blur-sm text-foreground hover:bg-white/10 transition-all active:scale-95">
                    Explore Modern Tools
                  </Button>
                </Link>
              </div>

              {/* Stat Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-24 w-full max-w-6xl">
                {[
                  { label: "Active Students", value: "25k+", icon: Users },
                  { label: "Success Rate", value: "99.2%", icon: Compass },
                  { label: "Resources", value: "1.2M", icon: Library },
                  { label: "Daily Tasks", value: "450k", icon: CheckCircle2 },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center p-8 rounded-[2.5rem] bg-card/40 border border-white/5 shadow-premium backdrop-blur-sm transition-all hover:translate-y-[-8px] hover:shadow-premium-hover group cursor-default">
                    <stat.icon className="h-8 w-8 text-primary mb-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                    <span className="text-4xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] pt-4 opacity-40 group-hover:opacity-60 transition-opacity italic">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 bg-card/10 backdrop-blur-sm border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/2 opacity-20" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6 text-foreground uppercase">
              Everything you need to <span className="text-primary">excel</span>.
            </h2>
            <p className="text-muted-foreground/60 max-w-2xl mx-auto mb-20 text-lg italic">
              Smart tools built for the modern student. Zero friction, maximum results.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto text-left">
              {/* Feature 1 */}
              <div className="p-10 rounded-[3rem] bg-card/40 border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 space-y-6 group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Smart Dashboard</h3>
                <p className="text-muted-foreground/60 text-sm leading-relaxed italic">
                  Real-time overview of your academic progress, upcoming deadlines, and campus news in one minimalist view.
                </p>
              </div>

              {/* Feature 2 (Large) */}
              <div className="p-10 rounded-[3rem] bg-card/40 border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 space-y-6 md:col-span-2 bg-gradient-to-br from-card/60 to-primary/10 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <GraduationCap className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">GPA Intelligence</h3>
                    <p className="text-muted-foreground/60 leading-relaxed max-w-md italic text-lg">
                      Advanced grade prediction algorithms and detailed performance analytics to keep your goals within reach.
                    </p>
                  </div>
                  <div className="hidden sm:flex h-40 w-40 rounded-full border-[12px] border-primary/10 border-r-primary flex items-center justify-center text-primary font-black italic text-3xl shadow-2xl shadow-primary/20 group-hover:rotate-[360deg] transition-transform duration-[2000ms]">
                    9.4
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-10 rounded-[3rem] bg-card/40 border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 space-y-6 group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">AI Timetable</h3>
                <p className="text-muted-foreground/60 text-sm leading-relaxed italic">
                  Automatically generated schedules that balance your lectures, study sessions, and social life.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-10 rounded-[3rem] bg-card/40 border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 space-y-6 group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <Library className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Library Cloud</h3>
                <p className="text-muted-foreground/60 text-sm leading-relaxed italic">
                  Instant book reservations and access to digital resources across the entire university network.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-10 rounded-[3rem] bg-card/40 border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 space-y-6 group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Course Hub</h3>
                <p className="text-muted-foreground/60 text-sm leading-relaxed italic">
                  Collaborative spaces for every module to share notes, resources, and insights with your peers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40">
          <div className="container mx-auto px-8">
            <div className="relative rounded-[4rem] bg-primary px-10 py-24 md:px-24 overflow-hidden shadow-2xl shadow-primary/40 group">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-black/20 to-transparent transition-opacity group-hover:opacity-60" />
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-full w-full bg-[radial-gradient(circle_at_center,_white/10_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                <div className="text-center md:text-left space-y-6 max-w-2xl">
                  <h2 className="text-4xl md:text-7xl font-black italic text-primary-foreground leading-[0.9] tracking-tighter uppercase">
                    Ready to transform your university journey?
                  </h2>
                  <p className="text-primary-foreground/80 text-xl font-medium italic">
                    Join thousands of students who have already upgraded their academic workflow.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Button 
                    onClick={handleProtectedAction}
                    size="lg" 
                    variant="secondary" 
                    className="h-24 px-16 rounded-[2.5rem] text-2xl font-black italic bg-background text-foreground hover:bg-background/90 uppercase tracking-tighter shadow-3xl active:scale-95 transition-all text-center"
                  >
                    Manifest Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-white/5 py-20 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background font-black italic text-xl">
                V
              </div>
              <span className="text-sm font-black italic tracking-widest text-foreground uppercase">VidyaHub © 2026</span>
            </div>
            <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] italic">
              <Link href="#" className="text-muted-foreground/40 hover:text-primary transition-all">Privacy</Link>
              <Link href="#" className="text-muted-foreground/40 hover:text-primary transition-all">Terms</Link>
              <Link href="#" className="text-muted-foreground/40 hover:text-primary transition-all">Documentation</Link>
              <Link href="#" className="text-muted-foreground/40 hover:text-primary transition-all">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
