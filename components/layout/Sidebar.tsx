"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Home,
  Calendar,
  Calculator,
  BookOpen,
  BarChart3,
  FileText,
  Building2,
  UtensilsCrossed,
  Shirt,
  Bed,
  Moon,
  Users,
  Briefcase,
  Network,
  Video,
  Search,
  Award,
  MessageSquare,
  Library,
  Wifi,
  Heart,
  Wrench,
  Ticket,
  Dumbbell,
  MessageCircle,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navigationSections = [
  {
    title: "Academic & Curriculum",
    icon: GraduationCap,
    items: [
      { title: "Dashboard", icon: Home, href: "/dashboard" },
      { title: "Timetable Generator", icon: Calendar, href: "/timetable" },
      { title: "GPA Calculator", icon: Calculator, href: "/gpa-calculator" },
      { title: "Syllabus & Resources", icon: BookOpen, href: "/syllabus" },
      { title: "Performance Analytics", icon: BarChart3, href: "/performance" },
      { title: "Research Repository", icon: FileText, href: "/research" },
      { title: "Library Hub", icon: Library, href: "/library" },
    ],
  },
  {
    title: "Hostel & Campus Life",
    icon: Building2,
    items: [
      { title: "Mess Waste Tracker", icon: UtensilsCrossed, href: "/mess" },
      { title: "Laundry Booking", icon: Shirt, href: "/laundry" },
      { title: "Room Inventory", icon: Bed, href: "/room" },
      { title: "Night Canteen", icon: Moon, href: "/canteen" },
      { title: "Wi-Fi Issues", icon: Wifi, href: "/wifi" },
      { title: "Visitor Management", icon: Users, href: "/visitors" },
    ],
  },
  {
    title: "Career & Skills",
    icon: Briefcase,
    items: [
      { title: "Alumni Network", icon: Network, href: "/alumni" },
      { title: "Mock Interviews", icon: Video, href: "/interviews" },
      { title: "Project Partners", icon: Search, href: "/partners" },
      { title: "Resume Forum", icon: FileText, href: "/resume" },
      { title: "Talent Showcase", icon: Award, href: "/talent" },
    ],
  },
  {
    title: "Utilities & Support",
    icon: Wrench,
    items: [
      { title: "Counseling Support", icon: Heart, href: "/counseling" },
      { title: "Scholarship Hub", icon: GraduationCap, href: "/scholarships" },
      { title: "Lab Equipment", icon: MessageSquare, href: "/lab" },
      { title: "Live Q&A", icon: MessageCircle, href: "/qna" },
      { title: "Lost & Found", icon: Search, href: "/lost-found" },
    ],
  },
  {
    title: "Events & Engagement",
    icon: Ticket,
    items: [
      { title: "Fest Tickets", icon: Ticket, href: "/events" },
      { title: "Sports Rental", icon: Dumbbell, href: "/sports" },
      { title: "Tech Clubs", icon: Users, href: "/clubs" },
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
  const [expanded, setExpanded] = useState<string[]>([
    "Academic & Curriculum",
  ]);

  const toggle = (title: string) => {
    setExpanded((p) =>
      p.includes(title) ? p.filter((t) => t !== title) : [...p, title]
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.25 }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border"
      style={{ background: "var(--gradient-sidebar)" }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="space-y-0.5">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">UniManage</h1>
              <p className="text-[10px] font-bold text-sidebar-muted uppercase tracking-widest leading-none opacity-60">
                Nexus OS v2.0
              </p>
            </div>
          )}
        </div>

        {/* Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-20 h-7 w-7 rounded-full bg-background shadow"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>

        {/* Nav */}
        <ScrollArea className="flex-1 px-4 py-6">
          <Link
            href="/"
            className={cn(
              "mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
              pathname === "/"
                ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold tracking-tight"
                : "text-sidebar-foreground hover:bg-white/10 font-medium tracking-tight"
            )}
          >
            <Home className="h-5 w-5" />
            {!isCollapsed && "Dashboard"}
          </Link>

          {navigationSections.map((section) => {
            const isOpen = expanded.includes(section.title);

            return (
              <div key={section.title} className="mb-2">
                <button
                  onClick={() => toggle(section.title)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-sidebar-muted hover:bg-white/5 transition-all group"
                >
                  <section.icon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-semibold tracking-tight">
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
                                ? "bg-primary/20 text-primary font-bold tracking-tight"
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
