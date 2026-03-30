"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Library,
  Wifi,
  Heart,
  Wrench,
  Ticket,
  Dumbbell,
  MessageCircle,
  LogOut,
  Sparkles,
  LayoutDashboard,
  ChevronDown,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SHADCN-STYLE INTERNAL COMPONENTS
 * Using SidebarContainer to prevent naming collision with exported Sidebar component.
 */

const SidebarContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <aside className={cn(
    "flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border shadow-sm relative z-50 transition-all duration-300 shrink-0",
    className
  )}>
    {children}
  </aside>
);

const SidebarHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-6 py-8 flex flex-col justify-center", className)}>{children}</div>
);

const SidebarContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <ScrollArea className={cn("flex-1 px-3", className)}>
    <div className="pb-8 pt-2">{children}</div>
  </ScrollArea>
);

const SidebarGroup = ({ children, title, className }: { children: React.ReactNode; title?: string; className?: string }) => (
  <div className={cn("mb-6", className)}>
    {title && (
      <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {title}
      </p>
    )}
    <div className="space-y-1">{children}</div>
  </div>
);

const SidebarMenu = ({ children }: { children: React.ReactNode }) => (
  <nav className="space-y-1">{children}</nav>
);

const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">{children}</div>
);

const SidebarMenuButton = ({ 
  children, 
  isActive, 
  className,
  onClick,
  isOpen
}: { 
  children: React.ReactNode; 
  isActive?: boolean; 
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative",
      isActive 
        ? "bg-primary text-primary-foreground shadow-md font-medium" 
        : "text-muted-foreground hover:bg-muted/50 hover:text-sidebar-foreground",
      className
    )}
  >
    {children}
    {onClick && (
      <ChevronDown className={cn(
        "ml-auto h-4 w-4 opacity-50 transition-transform duration-300",
        isOpen && "rotate-180"
      )} />
    )}
  </button>
);

// --- NAVIGATION DATA ---

const navigationSections = [
  {
    title: "Learning",
    icon: GraduationCap,
    items: [
      { title: "My Timetable", icon: Calendar, href: "/user/timetable" },
      { title: "GPA Calculator", icon: Calculator, href: "/user/gpa-calculator" },
      { title: "Study Materials", icon: BookOpen, href: "/user/syllabus" },
      { title: "My Grades", icon: BarChart3, href: "/user/performance" },
      { title: "Research Library", icon: FileText, href: "/user/research" },
    ],
  },
  {
    title: "Campus Services",
    icon: Building2,
    items: [
      { title: "Dining & Mess", icon: UtensilsCrossed, href: "/user/mess" },
      { title: "Laundry Service", icon: Shirt, href: "/user/laundry" },
      { title: "Room Allotment", icon: Bed, href: "/user/room" },
      { title: "Campus Wi-Fi", icon: Wifi, href: "/user/wifi" },
      { title: "Visitors Log", icon: Users, href: "/user/visitors" },
    ],
  },
  {
    title: "Career Growth",
    icon: Briefcase,
    items: [
      { title: "Alumni Network", icon: Network, href: "/user/alumni" },
      { title: "Interview Prep", icon: Video, href: "/user/interviews" },
      { title: "Hiring Partners", icon: Search, href: "/user/partners" },
      { title: "My Portfolio", icon: Award, href: "/user/talent" },
    ],
  },
  {
    title: "Help & Support",
    icon: Heart,
    items: [
      { title: "Student Wellness", icon: Heart, href: "/user/counseling" },
      { title: "Scholarships", icon: GraduationCap, href: "/user/scholarships" },
      { title: "Ask Questions", icon: MessageCircle, href: "/user/qna" },
      { title: "Lost & Found", icon: Search, href: "/user/lost-found" },
    ],
  },
];

// --- DROPDOWN COMPONENT ---

const CollapsibleMenu = ({ section, pathname }: { section: any; pathname: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isAnyChildActive = section.items.some((item: any) => pathname === item.href);

  React.useEffect(() => {
    if (isAnyChildActive) setIsOpen(true);
  }, [isAnyChildActive]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={() => setIsOpen(!isOpen)} 
        isOpen={isOpen}
        isActive={isAnyChildActive && !isOpen}
      >
        <section.icon className={cn(
          "h-5 w-5",
          (isAnyChildActive || isOpen) ? "text-primary" : "text-muted-foreground"
        )} />
        <span className="text-sm font-medium">{section.title}</span>
      </SidebarMenuButton>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 py-1.5 ml-8 border-l border-muted pl-4">
              {section.items.map((item: any) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                      isActive 
                        ? "text-primary font-semibold bg-primary/5" 
                        : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50"
                    )}>
                      <span className="text-xs">{item.title}</span>
                      {isActive && (
                        <div className="absolute right-0 w-1 h-4 bg-primary rounded-full" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarMenuItem>
  );
};

// --- MAIN COMPONENT ---

export function Sidebar({
  isOpen = true,
  setIsOpen,
}: {
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-64 h-screen bg-sidebar shrink-0 border-r border-sidebar-border" />;

  return (
    <SidebarContainer className={cn(
      isOpen ? "translate-x-0" : "max-lg:-translate-x-full"
    )}>
      <SidebarHeader className="border-b border-sidebar-border mx-4 mb-4 pt-10">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col justify-center overflow-hidden">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              VidyaHub
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none mt-1">
              Student Portal
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Section */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/user/dashboard">
                <SidebarMenuButton isActive={pathname === "/user/dashboard"}>
                  <LayoutDashboard className={cn(
                    "h-5 w-5",
                    pathname === "/user/dashboard" ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup title="Academic Modules">
          <SidebarMenu>
            {navigationSections.map((section) => (
              <CollapsibleMenu 
                key={section.title} 
                section={section} 
                pathname={pathname} 
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup title="Quick Access">
            <SidebarMenu>
              <SidebarMenuItem>
                  <Link href="/user/events">
                      <SidebarMenuButton isActive={pathname === "/user/events"}>
                          <Ticket className={cn(
                              "h-5 w-5",
                              pathname === "/user/events" ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                          <span className="text-sm font-medium">College Events</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <Link href="/user/clubs">
                      <SidebarMenuButton isActive={pathname === "/user/clubs"}>
                          <Users className={cn(
                              "h-5 w-5",
                              pathname === "/user/clubs" ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                          <span className="text-sm font-medium">Student Clubs</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 w-full p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200 group">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </SidebarContainer>
  );
}
