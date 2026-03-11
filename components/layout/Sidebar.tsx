"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Home,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  UserCheck,
  Briefcase,
  LayoutDashboard,
  Database,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navigationSections = [
  {
    title: "System Overview",
    icon: LayoutDashboard,
    items: [
      { title: "Control Center", icon: Home, href: "/" },
      { title: "Real-time Audit", icon: ClipboardList, href: "/audit" },
      { title: "Data Analytics", icon: BarChart3, href: "/analytics" },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      { title: "Student Directory", icon: GraduationCap, href: "/students" },
      { title: "Faculty Registry", icon: UserCheck, href: "/faculty" },
      { title: "Staff Records", icon: Briefcase, href: "/staff" },
      { title: "Role Admissions", icon: Lock, href: "/roles" },
    ],
  },
  {
    title: "Institutions",
    icon: Building2,
    items: [
      { title: "Departments", icon: Building2, href: "/departments" },
      { title: "Course Catalog", icon: BookOpen, href: "/courses" },
      { title: "Resource Archive", icon: Database, href: "/resources" },
    ],
  },
  {
    title: "Academic Operations",
    icon: BookOpen,
    items: [
      { title: "Attendance Control", icon: UserCheck, href: "/attendance" },
      { title: "Grades & Marks", icon: BarChart3, href: "/marks" },
      { title: "Exam Scheduling", icon: Calendar, href: "/exams" },
    ],
  },
  {
    title: "System Config",
    icon: Settings,
    items: [
      { title: "Global Settings", icon: Settings, href: "/settings" },
      { title: "Security Protocols", icon: ShieldCheck, href: "/security" },
      { title: "Admin Logs", icon: ClipboardList, href: "/logs" },
    ],
  },
];

export function Sidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["System Overview"]);

  const toggle = (title: string) => {
    setExpanded((p) =>
      p.includes(title) ? p.filter((t) => t !== title) : [...p, title]
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.25 }}
      className="fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border"
      style={{ background: "var(--gradient-sidebar)" }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="space-y-0.5">
              <h1 className="text-base font-bold text-white tracking-tight leading-none uppercase italic">VidyaHub</h1>
              <p className="text-[9px] font-black text-sidebar-muted uppercase tracking-widest leading-none opacity-60 mt-1">
                Admin Core v1.0
              </p>
            </div>
          )}
        </div>

        {/* Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3.5 top-20 h-7 w-7 rounded-full bg-background shadow-lg border border-border z-50"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Nav */}
        <ScrollArea className="flex-1 px-4 py-8">
          {navigationSections.map((section) => {
            const isOpen = expanded.includes(section.title);

            return (
              <div key={section.title} className="mb-4">
                <button
                  onClick={() => toggle(section.title)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-sidebar-muted hover:bg-white/5 transition-all group"
                >
                  <section.icon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-bold uppercase tracking-tight text-[11px]">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")}
                      />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {!isCollapsed && isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-white/5 pl-4">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-200",
                              pathname === item.href
                                ? "bg-primary text-white font-bold tracking-tight shadow-lg shadow-primary/10"
                                : "text-sidebar-muted hover:bg-white/5 font-medium tracking-tight hover:text-white"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </ScrollArea>
      </div>
    </motion.aside>
  );
}
