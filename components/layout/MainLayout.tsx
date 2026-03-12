"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavLink from "../NavLink";
import { 
  LayoutDashboard, 
  Calendar, 
  GraduationCap, 
  Library, 
  Clock, 
  Users, 
  Trophy, 
  Bell, 
  Settings,
  BookOpen,
  FileText,
  TrendingUp,
  Microscope,
  Home,
  Utensils,
  Bed,
  Coffee,
  UserCheck,
  Briefcase,
  Mic,
  Handshake,
  Cpu,
  FileUser,
  LifeBuoy,
  Wifi,
  HeartPlus,
  Coins,
  FlaskConical,
  Sparkles,
  Ticket,
  MessageCircle,
  Music,
  Search,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Menu
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { GlobalAnnouncement } from "../GlobalAnnouncement";

// ─── NavSection ───────────────────────────────────────────────────────────────

interface NavSectionProps {
  id: string;
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const NavSection = ({
  id,
  icon: Icon,
  label,
  children,
  isExpanded,
  onToggle,
}: NavSectionProps) => {
  return (
    <div>
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── SidebarContent (declared OUTSIDE MainLayout to fix lint error) ───────────

interface SidebarContentProps {
  setIsOpen: (open: boolean) => void;
  getIsExpanded: (id: string) => boolean;
  toggleSection: (id: string) => void;
}

const SidebarContent = ({ setIsOpen, getIsExpanded, toggleSection }: SidebarContentProps) => (
  <div className="flex flex-col h-full bg-[#01002dff] text-white">
    <div className="p-6">
      <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
          V
        </div>
        <span className="text-xl font-bold tracking-tight text-white">VidyaHub</span>
      </Link>
    </div>

    <ScrollArea className="flex-1 px-3">
      <div className="space-y-1 pb-6">
        <NavLink href="/dashboard" icon={LayoutDashboard} onClick={() => setIsOpen(false)}>Dashboard</NavLink>

        <NavSection
          id="academic"
          icon={BookOpen}
          label="Academic & Curriculum"
          isExpanded={getIsExpanded("academic")}
          onToggle={toggleSection}
        >
          <NavLink href="/timetable" icon={Calendar} onClick={() => setIsOpen(false)}>Timetable Generator</NavLink>
          <NavLink href="/gpa-calculator" icon={GraduationCap} onClick={() => setIsOpen(false)}>GPA Calculator</NavLink>
          <NavLink href="/syllabus" icon={FileText} onClick={() => setIsOpen(false)}>Syllabus &amp; Resources</NavLink>
          <NavLink href="/performance" icon={TrendingUp} onClick={() => setIsOpen(false)}>Performance Analytics</NavLink>
          <NavLink href="/research" icon={Microscope} onClick={() => setIsOpen(false)}>Research Repository</NavLink>
        </NavSection>

        <NavSection
          id="campus"
          icon={Home}
          label="Hostel & Campus Life"
          isExpanded={getIsExpanded("campus")}
          onToggle={toggleSection}
        >
          <NavLink href="/mess" icon={Utensils} onClick={() => setIsOpen(false)}>Mess Waste Tracker</NavLink>
          <NavLink href="/laundry" icon={Clock} onClick={() => setIsOpen(false)}>Laundry Booking</NavLink>
          <NavLink href="/room" icon={Bed} onClick={() => setIsOpen(false)}>Room Inventory</NavLink>
          <NavLink href="/canteen" icon={Coffee} onClick={() => setIsOpen(false)}>Night Canteen</NavLink>
          <NavLink href="/visitors" icon={UserCheck} onClick={() => setIsOpen(false)}>Visitor Management</NavLink>
        </NavSection>

        <NavSection
          id="career"
          icon={Briefcase}
          label="Career & Skills"
          isExpanded={getIsExpanded("career")}
          onToggle={toggleSection}
        >
          <NavLink href="/alumni" icon={Users} onClick={() => setIsOpen(false)}>Alumni Network</NavLink>
          <NavLink href="/interviews" icon={Mic} onClick={() => setIsOpen(false)}>Mock Interviews</NavLink>
          <NavLink href="/partners" icon={Handshake} onClick={() => setIsOpen(false)}>Project Partners</NavLink>
          <NavLink href="/clubs" icon={Cpu} onClick={() => setIsOpen(false)}>Tech Clubs</NavLink>
          <NavLink href="/resume" icon={FileUser} onClick={() => setIsOpen(false)}>Resume Forum</NavLink>
        </NavSection>

        <NavSection
          id="support"
          icon={LifeBuoy}
          label="Utilities & Support"
          isExpanded={getIsExpanded("support")}
          onToggle={toggleSection}
        >
          <NavLink href="/library" icon={Library} onClick={() => setIsOpen(false)}>Library</NavLink>
          <NavLink href="/wifi" icon={Wifi} onClick={() => setIsOpen(false)}>Wi-Fi Issues</NavLink>
          <NavLink href="/counseling" icon={HeartPlus} onClick={() => setIsOpen(false)}>Counseling</NavLink>
          <NavLink href="/scholarships" icon={Coins} onClick={() => setIsOpen(false)}>Scholarships</NavLink>
          <NavLink href="/lab" icon={FlaskConical} onClick={() => setIsOpen(false)}>Lab Equipment</NavLink>
        </NavSection>

        <NavSection
          id="engagement"
          icon={Sparkles}
          label="Events & Engagement"
          isExpanded={getIsExpanded("engagement")}
          onToggle={toggleSection}
        >
          <NavLink href="/events" icon={Ticket} onClick={() => setIsOpen(false)}>Fest Tickets</NavLink>
          <NavLink href="/sports" icon={Trophy} onClick={() => setIsOpen(false)}>Sports Rental</NavLink>
          <NavLink href="/qna" icon={MessageCircle} onClick={() => setIsOpen(false)}>Live Q&amp;A</NavLink>
          <NavLink href="/talent" icon={Music} onClick={() => setIsOpen(false)}>Talent Showcase</NavLink>
          <NavLink href="/lost-found" icon={Search} onClick={() => setIsOpen(false)}>Lost &amp; Found</NavLink>
        </NavSection>
      </div>
    </ScrollArea>

    <div className="p-3 border-t border-white/10">
      <NavLink href="/settings" icon={Settings} onClick={() => setIsOpen(false)}>Settings</NavLink>
    </div>
  </div>
);

// ─── MainLayout ───────────────────────────────────────────────────────────────

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    // Clear cookie for middleware
    document.cookie = "login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    logout();
    router.push("/login");
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const getIsExpanded = (id: string): boolean => {
    if (expandedSections.includes(id)) return true;

    const academicPaths = ["/timetable", "/gpa-calculator", "/syllabus", "/performance", "/research"];
    const campusPaths = ["/mess", "/laundry", "/room", "/canteen", "/visitors"];
    const careerPaths = ["/alumni", "/interviews", "/partners", "/clubs", "/resume"];
    const supportPaths = ["/library", "/wifi", "/counseling", "/scholarships", "/lab"];
    const engagementPaths = ["/tickets", "/sports", "/qna", "/talent", "/lost-found", "/events"];

    if (id === "academic" && academicPaths.includes(pathname)) return true;
    if (id === "campus" && campusPaths.includes(pathname)) return true;
    if (id === "career" && careerPaths.includes(pathname)) return true;
    if (id === "support" && supportPaths.includes(pathname)) return true;
    if (id === "engagement" && engagementPaths.includes(pathname)) return true;

    return false;
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : "Student";
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "ST";

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border/40 flex-col h-screen fixed left-0 top-0 z-40 bg-[#01002dff]">
        <SidebarContent
          setIsOpen={setIsOpen}
          getIsExpanded={getIsExpanded}
          toggleSection={toggleSection}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-[#01002dff] border-none">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SidebarContent
            setIsOpen={setIsOpen}
            getIsExpanded={getIsExpanded}
            toggleSection={toggleSection}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <GlobalAnnouncement />
        <header className="h-16 border-b border-border/40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-lg"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-xs lg:text-sm font-medium text-muted-foreground hidden sm:block">
              Welcome back, <span className="text-foreground font-semibold">{user?.firstName || 'Student'}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 lg:h-10 lg:w-10 rounded-full border border-primary/10 p-0 hover:bg-primary/5">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs lg:text-base">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 lg:w-64 p-2 shadow-2xl border-primary/10" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 lg:h-10 lg:w-10 border border-primary/20">
                        <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-bold leading-none truncate">{userName}</p>
                        <p className="text-[10px] lg:text-xs leading-none text-muted-foreground mt-1 truncate">
                          {user?.email || "student@vidyahub.edu"}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer gap-3 p-2 focus:bg-primary/10 rounded-lg">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">My Profile</span>
                      <span className="text-[10px] text-muted-foreground">View and edit your profile</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer gap-3 p-2 focus:bg-primary/10 rounded-lg">
                    <Settings className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Settings</span>
                      <span className="text-[10px] text-muted-foreground">Account and app preferences</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-3 p-2 text-red-600 focus:text-red-600 focus:bg-red-100/50 dark:focus:bg-red-900/20 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Log out</span>
                    <span className="text-[10px] opacity-70">Exit your current session</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
