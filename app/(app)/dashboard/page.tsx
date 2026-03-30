"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  GraduationCap,
  Library,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  dashboardStats,
  upcomingEvents,
} from "@/data/mockData";



/* ---------------- Animations ---------------- */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/* ---------------- Icons ---------------- */
const iconMap: Record<number, React.ReactNode> = {
  1: <Users className="h-6 w-6 text-primary" />,
  2: <BookOpen className="h-6 w-6 text-primary" />,
  3: <GraduationCap className="h-6 w-6 text-primary" />,
  4: <Library className="h-6 w-6 text-primary" />,
};

/* ---------------- Badge Colors ---------------- */
const eventTypeColors: Record<string, string> = {
  exam: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  event: "bg-primary/10 text-primary border-primary/20",
  sports: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

/* ====================================================== */

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <PageHeader
      title="Strategic Dashboard"
      description={`Salutations, ${user?.firstName}! Intelligence overview for the Vidyahub decentralized campus ecosystem is now live.`}
      actions={
        <div className="flex bg-card/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/5 gap-3 shadow-premium">
           <Button className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
            <Bell className="w-4 h-4" />
            V-Intelligence
          </Button>
        </div>
      }
    >
      <div className="space-y-8 md:space-y-12">
        {/* ================= STATS ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {dashboardStats.map((stat) => (
            <motion.div key={stat.id} variants={item}>
              <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 bg-card/40 backdrop-blur-sm shadow-premium group hover:shadow-premium-hover transition-all duration-500 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    {iconMap[stat.id] && <div className="scale-[1.2] md:scale-[2]">{iconMap[stat.id]}</div>}
                 </div>
                  <CardContent className="p-6 md:p-8 space-y-3 md:space-y-4">
                    <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.title}</p>
                    <div className="space-y-1">
                       <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter text-foreground">{stat.value}</h3>
                       <div className="flex items-center gap-2">
                          <Badge className={`${stat.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} border-0 rounded-lg text-[8px] md:text-[9px] font-black h-5 uppercase tracking-widest`}>
                             {stat.change}
                          </Badge>
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Global Shift</span>
                       </div>
                    </div>
                  </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ================= MIDDLE GRID ================= */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {/* -------- RECENT ACTIVITIES -------- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-0 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-6 md:p-10 pb-4 flex flex-row items-center justify-between">
                <div className="space-y-1">
                   <CardTitle className="text-xl md:text-2xl font-black italic tracking-tight uppercase flex items-center gap-3 text-foreground">
                     <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                     Live Activity Stream
                   </CardTitle>
                </div>
                <Button variant="ghost" className="rounded-xl font-bold text-primary italic uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary/10">
                  Full Audit Log
                </Button>
              </CardHeader>
 
              <CardContent className="p-6 md:p-10 pt-0">
                <div className="text-center p-12 text-muted-foreground/30 font-black italic uppercase tracking-[0.4em] text-[10px]">
                  No recent activities recorded in the neural matrix.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* -------- UPCOMING EVENTS -------- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-0 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-6 md:p-10 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xl md:text-2xl font-black italic tracking-tight uppercase flex items-center gap-3 text-foreground">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  Upcoming
                </CardTitle>
                <Button variant="ghost" className="rounded-xl font-bold text-primary italic uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary/10">
                  Calendar
                </Button>
              </CardHeader>
 
              <CardContent className="p-6 md:p-10 pt-0">
                <div className="space-y-3 md:space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="flex flex-col gap-2 md:gap-3 rounded-[1rem] md:rounded-[1.5rem] bg-background/40 p-4 md:p-6 border border-white/5 hover:border-primary/20 transition-all group"
                    >
                       <div className="flex justify-between items-start">
                          <Badge className={`${eventTypeColors[event.type] || "bg-secondary/10 text-secondary border-white/5"} border h-5 md:h-6 px-2 md:px-3 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest`}>
                            {event.type}
                          </Badge>
                          <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{event.date}</p>
                       </div>
                       <p className="text-sm md:text-base font-black text-foreground uppercase italic tracking-tight group-hover:text-primary transition-colors">{event.title}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ================= CAMPUS HUB ================= */}
        <div className="space-y-8 md:space-y-12">
          <div className="flex items-center gap-4 md:gap-6 px-2 md:px-4">
             <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-foreground uppercase">CAMPUS HUB OPERATIONS</h2>
             <div className="flex-1 h-[2px] bg-primary/10" />
          </div>

          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Academic & Curriculum",
                icon: GraduationCap,
                color: "bg-primary",
                description: "Managing core pedagogical trajectories",
                links: [
                  { name: "Timetable", href: "/timetable" },
                  { name: "GPA Monitor", href: "/gpa-calculator" },
                  { name: "Syllabus Index", href: "/syllabus" },
                  { name: "Analytics", href: "/performance" },
                ]
              },
              {
                title: "Hostel & Logistics",
                icon: BookOpen,
                color: "bg-emerald-500",
                description: "Residential operations & sustenance",
                links: [
                  { name: "Mess Tracker", href: "/mess" },
                  { name: "Laundry Ops", href: "/laundry" },
                  { name: "Inventory", href: "/room" },
                  { name: "Night Feed", href: "/canteen" },
                ]
              },
              {
                title: "Career & Synergy",
                icon: TrendingUp,
                color: "bg-purple-500",
                description: "Professional alignment & networking",
                links: [
                  { name: "Alumni Unity", href: "/alumni" },
                  { name: "Live Panels", href: "/interviews" },
                  { name: "Resume Vault", href: "/resume" },
                  { name: "Guild Partners", href: "/partners" },
                ]
              },
              {
                title: "Support Engineering",
                icon: Library,
                color: "bg-orange-500",
                description: "Optimization & crisis management",
                links: [
                  { name: "Network Ops", href: "/wifi" },
                  { name: "Clinical Hub", href: "/counseling" },
                  { name: "Asset Recovery", href: "/lost-found" },
                  { name: "Grants Board", href: "/scholarships" },
                ]
              },
              {
                title: "Culture & Engagement",
                icon: Calendar,
                color: "bg-rose-500",
                description: "Social capital & festivity index",
                links: [
                  { name: "Fest Access", href: "/events" },
                  { name: "Equipment Pool", href: "/sports" },
                  { name: "Guild Registry", href: "/clubs" },
                  { name: "Talent Feed", href: "/talent" },
                ]
              }
            ].map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="h-full rounded-[2rem] md:rounded-[3rem] border-0 shadow-premium hover:shadow-premium-hover transition-all duration-500 group overflow-hidden bg-card/40 backdrop-blur-sm">
                  <div className={`h-1.5 md:h-2 w-full ${section.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                  <CardHeader className="p-6 md:p-10 pb-6">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${section.color}/10 flex items-center justify-center text-foreground ring-1 ring-white/5`}>
                        <section.icon className="h-6 w-6 md:h-7 md:w-7" />
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tight italic text-foreground">{section.title}</CardTitle>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{section.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 pt-0">
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {section.links.map((link) => (
                        <Button
                          key={link.name}
                          variant="ghost"
                          className="justify-start h-10 md:h-12 rounded-xl bg-background/40 hover:bg-primary/10 hover:text-primary border border-white/5 hover:border-primary/20 transition-all font-black italic text-[10px] md:text-xs uppercase tracking-widest px-3 md:px-4"
                          onClick={() => router.push(`/user${link.href}`)}
                        >
                          {link.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
