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
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatDistanceToNow } from "date-fns";

export default function StudentDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { assignments, announcements: annCount, timetables, requests, loading: statsLoading } = useDashboardStats();
  const { announcements, loading: annLoading } = useAnnouncements(3);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Failed to sign out.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
          </div>
<<<<<<< HEAD
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Loading Dashboard…
=======
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Authorizing Protocol…
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  const CARDS = [
    {
      icon: BookOpen,
      label: "Assignments",
      value: statsLoading ? "..." : `${assignments} Active`,
      sub: "Pending submissions",
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      accent: "bg-blue-500",
      href: "/student/assignments"
    },
    {
      icon: Bell,
      label: "Announcements",
      value: statsLoading ? "..." : `${annCount} New`,
      sub: "From administration",
      color: "bg-amber-50",
      iconColor: "text-amber-600",
      accent: "bg-amber-500",
      href: "/student/announcements"
    },
    {
      icon: Calendar,
      label: "Timetables",
      value: statsLoading ? "..." : `${timetables} Drafted`,
      sub: "Latest schedule nodes",
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "bg-emerald-500",
      href: "/student/timetable"
    },
    {
      icon: BarChart3,
      label: "Academic Results",
      value: "View Node",
      sub: "GPA propagation ready",
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      accent: "bg-purple-500",
      href: "/student/results"
    },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* ── Top Bar ── */}
<<<<<<< HEAD
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
=======
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 py-5 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-0.5">
              VidyaHub Nexus
            </span>
            <span className="text-sm font-black italic text-slate-900 uppercase tracking-tight">
              Intelligence Interface
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
            </span>
          </div>
        </div>

<<<<<<< HEAD
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 capitalize">
              {user.role.replace(/_/g, " ")}
=======
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block border-r border-slate-100 pr-6 mr-2">
            <p className="text-xs font-black text-slate-900 leading-none mb-1.5 uppercase italic italic">
              {user.name}
            </p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] capitalize">
              {user.role} • Node {user.uid.slice(0, 5).toUpperCase()}
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
            </p>
          </div>
          <button
            onClick={handleLogout}
<<<<<<< HEAD
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground text-[10px] font-black uppercase tracking-widest transition-all"
=======
            className="flex items-center gap-2 h-11 px-5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-slate-900/10"
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Disconnect</span>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
<<<<<<< HEAD
      <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        {/* Welcome */}
        <div className="space-y-1 pt-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">
            Welcome, {user.firstName}!
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Student Dashboard • {today}
          </p>
=======
      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-100">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
              Welcome, {user.firstName || 'User'}
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
              Personalized Intelligence Feed • {today}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               System Nominal
            </div>
          </div>
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
        </div>

        {/* Intelligence Nodes (Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.label}
<<<<<<< HEAD
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
=======
              onClick={() => router.push(card.href)}
              className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden ring-1 ring-slate-200/50"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${card.color} rounded-bl-[4rem] opacity-30 -mr-8 -mt-8 group-hover:scale-110 transition-transform`} />
              <div className={`h-14 w-14 rounded-2xl ${card.color} flex items-center justify-center mb-6 relative z-10 group-hover:rotate-6 transition-transform`}>
                <card.icon className={`h-7 w-7 ${card.iconColor}`} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 relative z-10">
                {card.label}
              </p>
              <p className="text-2xl font-black italic text-slate-900 mt-2 relative z-10 tracking-tight">{card.value}</p>
              <p className="text-[11px] text-slate-500 font-bold mt-1 relative z-10 flex items-center gap-1">
                 {card.sub}
                 <TrendingUp className="h-3 w-3 text-emerald-500" />
              </p>
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
            </div>
          ))}
        </div>

<<<<<<< HEAD
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
=======
        {/* Data Matrix Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Identity Descriptor */}
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900 flex items-center gap-3">
               <UserCircle className="h-6 w-6 text-primary" />
               Entity Profile
            </h2>
            <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 space-y-8 ring-1 ring-slate-200/50">
              <div className="space-y-6">
                {[
                  { label: "Designation", value: user.name },
                  { label: "Core Email", value: user.email },
                  { label: "Access Level", value: user.role },
                  { label: "Node Authorization", value: "Verified" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-sm font-black italic text-slate-900 uppercase">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-slate-50">
                 <button className="w-full h-14 bg-secondary/10 hover:bg-secondary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    Request Sync Update
                 </button>
              </div>
            </div>
          </div>

          {/* Activity Transmissions */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              Recent Transmissions
            </h2>
            <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 min-h-[400px] flex flex-col ring-1 ring-slate-200/50">
              {annLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-300">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Polling Data Streams…</p>
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
                </div>
              ) : announcements.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-300">
                  <Bell className="h-12 w-12 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Zero recent broadcasts detected</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {announcements.map((item, i) => (
                    <div key={i} className="group flex items-center gap-6 p-6 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Bell className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                           <p className="text-sm font-black italic text-slate-900 uppercase truncate">
                             {item.title}
                           </p>
                           <span className="shrink-0 px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter rounded-full">
                             {item.tag || 'SYSTEM'}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-2">
                           {item.message}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                           <Clock className="h-3 w-3" />
                           {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : "Recent Transmission"}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => router.push("/student/announcements")}
                    className="w-full h-16 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 hover:text-primary transition-all mt-4"
                  >
                    Load All Transmissions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
