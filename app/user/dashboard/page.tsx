"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  GraduationCap,
  Library,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  dashboardStats,
  upcomingEvents,
} from "@/data/mockData";

/* ---------------- Animations ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

/* ---------------- UI Helpers ---------------- */
const getIcon = (id: number) => {
  switch (id) {
    case 1: return <Users className="h-5 w-5" />;
    case 2: return <BookOpen className="h-5 w-5" />;
    case 3: return <GraduationCap className="h-5 w-5" />;
    case 4: return <Library className="h-5 w-5" />;
    default: return <LayoutDashboard className="h-5 w-5" />;
  }
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm"></div>
          <p className="text-muted-foreground text-sm font-medium">Preparing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PageHeader
      title="Student Dashboard"
      description={`Welcome back, ${user?.firstName}. Here's an overview of your academic stats and campus activities.`}
      actions={
        <div className="flex items-center gap-3">
          <Button className="h-10 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground font-semibold hover:shadow-xl transition-all">
            <Sparkles className="h-4 w-4" />
            AI Study Insights
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* Key Metrics Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {dashboardStats.map((stat) => (
            <motion.div key={stat.id} variants={itemVariants}>
              <Card className="rounded-2xl border-none shadow-sm bg-card hover:translate-y-[-4px] transition-all duration-300 border border-muted/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {getIcon(stat.id)}
                    </div>
                    <Badge variant="secondary" className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      stat.trend === 'up' ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-600 bg-rose-500/10'
                    )}>
                      {stat.trend === 'up' ? '+' : ''}{stat.change}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{stat.title}</p>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mid-Section Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Recent Activity */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <Card className="rounded-2xl border-none shadow-sm bg-card flex flex-col flex-1">
              <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-muted/50">
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Updates & Activity
                  </CardTitle>
                  <CardDescription className="text-xs">Your latest academic and service notifications</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary rounded-lg h-8">
                  Check History
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="divide-y divide-muted/50 border-b border-muted/50">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-5 p-5 hover:bg-muted/30 transition-colors group cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-muted border border-muted/40 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center pr-1">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-all">Course Material Available</h4>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60">{i * 2}h ago</span>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                          Your notes for <span className="text-foreground font-medium">Machine Learning CS401</span> have been synchronized. Download them from the Resources module.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted/10 text-center">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Stay updated with campus notifications
                    </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Grades Analysis</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Track your semester GPA</p>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl text-xs h-10 font-bold bg-white text-black hover:bg-white/90 shadow-sm transition-all" onClick={() => router.push("/user/performance")}>
                    Detailed Performance
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-emerald-500/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Today's Timetable</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">View your class schedule</p>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl text-xs h-10 font-bold bg-white text-black hover:bg-white/90 shadow-sm transition-all" onClick={() => router.push("/user/timetable")}>
                    Full Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Area: Events & Progress */}
          <div className="lg:col-span-4 flex flex-col space-y-8">
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-card h-full">
              <CardHeader className="px-6 py-5 border-b border-muted/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  College Timeline
                </CardTitle>
                <CardDescription className="text-xs">Upcoming examinations and events</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/10 cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[55px] h-14 rounded-xl bg-card border border-muted/50">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{event.date.split(' ')[0]}</span>
                      <span className="text-lg font-bold text-foreground leading-none">{event.date.split(' ')[1]?.split('-')[0] || "15"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-bold px-1.5 py-0 border-none rounded-md",
                          event.type === 'exam' ? 'bg-rose-500/10 text-rose-600' : 'bg-primary/10 text-primary'
                        )}>
                          {event.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">{event.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
                <div className="pt-4">
                    <Button variant="outline" className="w-full text-[11px] font-bold h-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 transition-colors uppercase tracking-widest">
                        View Campus Calendar
                    </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-[#1c1c1c] text-white p-6 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">Semester Attendance</p>
                    <h2 className="text-4xl font-bold">88.4%</h2>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary shadow-sm border border-white/10">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={88.4} className="h-2.5 bg-white/5" indicatorClassName="bg-primary shadow-[0_0_15px_rgba(0,188,212,0.8)]" />
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <span>Minimum 75%</span>
                    <span>Target 95%</span>
                  </div>
                </div>
                <div className="pt-2">
                    <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                        You're safely above the mandatory <span className="text-white font-bold">75%</span> attendance threshold. Maintain your performance!
                    </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
