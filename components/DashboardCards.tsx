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
      color: "text-blue-500", 
      bg: "bg-blue-500",
      light: "bg-blue-50",
      href: "/admin/students"
    },
    { 
      label: "Announcements", 
      value: announcements, 
      change: "Live", 
      icon: Megaphone, 
      color: "text-purple-500", 
      bg: "bg-purple-500",
      light: "bg-purple-50",
      href: "/admin/announcements"
    },
    { 
      label: "Assignments", 
      value: assignments, 
      change: "Active", 
      icon: FileText, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500",
      light: "bg-emerald-50",
      href: "/admin/assignments"
    },
    { 
      label: "Total Requests", 
      value: requests, 
      change: "New", 
      icon: CheckCircle2, 
      color: "text-primary", 
      bg: "bg-primary",
      light: "bg-primary/10",
      href: "/admin/requests"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <Card 
          key={i} 
          onClick={() => router.push(stat.href)}
          className="rounded-[2.5rem] bg-white border-secondary/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden relative cursor-pointer active:scale-95 p-0"
        >
          <CardContent className="p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={cn("p-4 rounded-2xl", stat.light)}>
                <stat.icon className={cn("h-7 w-7", stat.color)} />
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{stat.change}</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500 mt-1" />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">{stat.label}</h3>
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
              ) : (
                <p className="text-4xl font-black italic tracking-tighter text-slate-900">{stat.value.toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
