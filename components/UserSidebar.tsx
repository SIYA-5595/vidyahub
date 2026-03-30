"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Library, 
  Calendar, 
  LogOut,
  UserCircle,
  TrendingUp,
  Settings,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/user/dashboard" },
  { icon: GraduationCap, label: "My Courses", href: "/user/courses" },
  { icon: BookOpen, label: "Assignments", href: "/user/assignments" },
  { icon: Calendar, label: "Timetable", href: "/user/timetable" },
  { icon: Library, label: "Library Cloud", href: "/user/library" },
  { icon: TrendingUp, label: "GPA Analytics", href: "/user/performance" },
  { icon: Bell, label: "Announcements", href: "/user/notifications" },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Identity Disconnected. Safe Travels.");
    } catch {
      toast.error("Logout procedure failed.");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-sidebar text-sidebar-foreground z-50 flex flex-col pt-8 border-r border-sidebar-border shadow-2xl overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 bg-gradient-to-b from-primary/50 to-transparent" />
      
      <div className="px-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none text-sidebar-foreground">VidyaHub</h1>
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Student Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
        <p className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">Learning Center</p>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold" 
                  : "text-muted-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground/40 group-hover:text-primary"
              )} />
              <span className="text-sm tracking-tight">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
              )}
            </Link>
          );
        })}

        <div className="pt-8 space-y-2">
            <p className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">Preferences</p>
            <Link
              href="/user/profile"
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
                pathname === "/user/profile" 
                  ? "bg-sidebar-accent text-sidebar-foreground font-bold" 
                  : "text-muted-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
              )}
            >
              <UserCircle className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary" />
              <span className="text-sm tracking-tight">Profile Matrix</span>
            </Link>
            <Link
              href="/user/settings"
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
                pathname === "/user/settings" 
                  ? "bg-sidebar-accent text-sidebar-foreground font-bold" 
                  : "text-muted-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
              )}
            >
              <Settings className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary" />
              <span className="text-sm tracking-tight">System Config</span>
            </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="flex w-full items-center justify-start gap-4 px-6 py-8 rounded-2xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-bold group border-none h-auto bg-transparent shadow-none"
        >
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Disconnect Portal</span>
        </Button>
      </div>
    </aside>
  );
}
