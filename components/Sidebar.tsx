"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2,
  Megaphone, 
  CalendarDays, 
  GraduationCap, 
  LogOut,
  ShieldCheck,
  UserPlus,
  FileText,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "User Registry", href: "/admin/users" },
  { icon: UserSquare2, label: "Student List", href: "/admin/students" },
  { icon: Megaphone, label: "Announcements", href: "/admin/announcements" },
  { icon: FileText, label: "Assignments", href: "/admin/assignments" },
  { icon: CheckCircle2, label: "Requests", href: "/admin/requests" },
  { icon: CalendarDays, label: "Timetable", href: "/admin/timetable" },
  { icon: GraduationCap, label: "Results", href: "/admin/results" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Identity Disconnected. Safe Travels.");
    } catch {
      toast.error("Logout procedure failed.");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-sidebar text-sidebar-foreground z-50 flex flex-col pt-8 border-r border-sidebar-border shadow-2xl" style={{ background: "var(--gradient-sidebar)" }}>
      <div className="px-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:rotate-3">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none text-foreground">VidyaHub</h1>
            <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest mt-1">Admin Core</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
        <p className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Operations Hub</p>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
              pathname === item.href 
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10 font-bold scale-[1.02]" 
                : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              pathname === item.href ? "text-primary-foreground" : "text-foreground/20 group-hover:text-primary"
            )} />
            <span className="text-sm tracking-tight font-medium">{item.label}</span>
            {pathname === item.href && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
            )}
          </Link>
        ))}

        {/* Invite Admin - Restricted to Super Admin */}
        {(user?.role === "super_admin" || user?.role === "admin") && (
          <div className="mt-8 space-y-2">
            <p className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Access Control</p>
            <Link
              href="/admin/invite"
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
                pathname === "/admin/invite" 
                  ? "bg-accent/40 text-foreground shadow-lg shadow-accent/20 font-bold" 
                  : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-foreground"
              )}
            >
              <UserPlus className={cn(
                "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                pathname === "/admin/invite" ? "text-foreground" : "text-primary/40 group-hover:text-primary"
              )} />
              <span className="text-sm tracking-tight font-medium">Invite Admin</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="flex w-full items-center justify-start gap-4 px-6 py-8 rounded-2xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-bold group border-none h-auto"
        >
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Log Out Node</span>
        </Button>
      </div>
    </aside>
  );
}
