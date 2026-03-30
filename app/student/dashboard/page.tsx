"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Bell,
  Calendar,
  BarChart3,
  LogOut,
  Loader2,
  ShieldCheck,
  UserCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const CARDS = [
  {
    icon: BookOpen,
    label: "My Courses",
    value: "6 Active",
    sub: "Enrolled this semester",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    accent: "bg-blue-500",
  },
  {
    icon: Bell,
    label: "Announcements",
    value: "3 New",
    sub: "Unread from admin",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "bg-amber-500",
  },
  {
    icon: Calendar,
    label: "Timetable",
    value: "5 Classes",
    sub: "Scheduled today",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accent: "bg-emerald-500",
  },
  {
    icon: BarChart3,
    label: "Results",
    value: "View Marks",
    sub: "Latest results available",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    accent: "bg-purple-500",
  },
];

export default function StudentDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Failed to sign out.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Loading Dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* ── Top Bar ── */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border px-6 md:px-10 py-5 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground block">
              VidyaHub
            </span>
            <span className="text-sm font-black italic text-foreground uppercase tracking-tight">
              Student Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 capitalize">
              {user.role.replace(/_/g, " ")}
            </p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        {/* Welcome */}
        <div className="space-y-1 pt-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">
            Welcome, {user.firstName}!
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Student Dashboard • {today}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARDS.map((card) => (
            <div
              key={card.label}
              className="group bg-card rounded-[2rem] border border-border p-6 shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem] opacity-40 -mr-6 -mt-6`} />
              <div className={`h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`h-6 w-6 text-primary`} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground relative z-10">
                {card.label}
              </p>
              <p className="text-lg font-black text-foreground mt-1 relative z-10">{card.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5 relative z-10">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Account details + Quick stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account info */}
          <div className="bg-card rounded-[2rem] border border-border p-8 shadow-premium space-y-5">
            <h2 className="text-lg font-black italic uppercase tracking-tight text-foreground">
              Account Details
            </h2>
            <div className="space-y-3">
              {[
                { label: "Full Name", value: `${user.firstName} ${user.lastName}` },
                { label: "Email", value: user.email },
                { label: "Role", value: user.role.replace(/_/g, " ") },
                { label: "Status", value: "Active" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-foreground capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-card rounded-[2rem] border border-border p-8 shadow-premium space-y-5">
            <h2 className="text-lg font-black italic uppercase tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {[
                { text: "Account activated via invite", time: "Just now", icon: ShieldCheck },
                { text: "Welcome to VidyaHub!", time: "Today", icon: Bell },
                { text: "Profile initialized", time: "Today", icon: Clock },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-background/50 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
