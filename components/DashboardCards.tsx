"use client";

import { Users, Megaphone, FileText, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardCards() {
  const router = useRouter();
  const { students, announcements, assignments, requests, loading } = useDashboardStats();

  const stats = [
    { 
      label: "Total Students", 
      value: students, 
      change: "+Live", 
      icon: Users, 
      color: "text-accent", 
      bg: "bg-primary",
      light: "bg-primary/20",
      href: "/admin/students"
    },
    { 
      label: "Announcements", 
      value: announcements, 
      change: "Live", 
      icon: Megaphone, 
      color: "text-accent", 
      bg: "bg-accent/10",
      light: "bg-accent/5",
      href: "/admin/announcements"
    },
    { 
      label: "Assignments", 
      value: assignments, 
      change: "Active", 
      icon: FileText, 
      color: "text-emerald-600", 
      bg: "bg-emerald-500",
      light: "bg-emerald-500/10",
      href: "/admin/assignments"
    },
    { 
      label: "Total Requests", 
      value: requests, 
      change: "New", 
      icon: CheckCircle2, 
      color: "text-accent", 
      bg: "bg-primary",
      light: "bg-primary/20",
      href: "/admin/requests"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <Card 
          key={i} 
          onClick={() => router.push(stat.href)}
          className="rounded-[3rem] bg-card border-border shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 group overflow-hidden relative cursor-pointer active:scale-95 p-0"
        >
          <CardContent className="p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground", stat.light)}>
                <stat.icon className={cn("h-7 w-7 transition-colors", stat.color, "group-hover:text-primary-foreground")} />
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{stat.change}</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500 mt-1.5" />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[11px] font-black uppercase text-muted-foreground/30 tracking-[0.2em] mb-2">{stat.label}</h3>
              {loading ? (
                <div className="h-10 w-24 bg-background/50 animate-pulse rounded-xl" />
              ) : (
                <p className="text-4xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors">{stat.value.toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
