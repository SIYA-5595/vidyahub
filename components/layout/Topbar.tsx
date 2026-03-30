"use client";

import { useAuth } from "@/lib/auth-context";
import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Topbar() {
  const { user, logout } = useAuth(); 

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sidebar-border bg-background/80 backdrop-blur-md px-6 shadow-sm">
      {/* Search Section */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search for courses, grades, or campus info..."
          className="pl-10 h-10 rounded-lg bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 transition-all text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
          <kbd className="pointer-events-none select-none px-1.5 py-0.5 rounded border border-muted-foreground/20 bg-muted text-[10px] text-muted-foreground font-medium">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-muted group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        </Button>

        <div className="h-6 w-px bg-sidebar-border mx-2 hidden sm:block" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 rounded-lg hover:bg-muted transition-colors outline-none group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {user ? `${user.firstName} ${user.lastName}` : "Student User"}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {user?.role === "student" ? "Undergraduate Student" : (user?.role || "University Student")}
                </p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {user ? getInitials(user.firstName, user.lastName) : "JD"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-all" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
              My Profile
            </DropdownMenuLabel>
            <DropdownMenuItem className="rounded-lg cursor-pointer px-3 py-2 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {user ? getInitials(user.firstName, user.lastName) : "JD"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">View Profile</span>
                <span className="text-[10px] text-muted-foreground">Manage your settings</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem 
              onClick={logout}
              className="rounded-lg cursor-pointer px-3 py-2 flex items-center gap-3 text-rose-500 focus:text-rose-600 focus:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
