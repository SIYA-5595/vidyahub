"use client";

import { Bell, Search, UserCircle, Menu, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-24 sticky top-0 z-40 flex items-center justify-between px-10 bg-background/80 backdrop-blur-xl border-b border-border/10">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-lg text-foreground">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10" />
          <Input 
            type="text" 
            placeholder="Search learning materials..." 
            className="w-96 h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-border text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white/10 transition-all outline-none italic placeholder:text-muted-foreground/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border-none">
          <Bell className="h-6 w-6 text-muted-foreground/60 group-hover:text-primary transition-colors" />
          <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary border-2 border-background rounded-full" />
        </Button>

        <div className="h-8 w-[1px] bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-4 pl-2 cursor-pointer group outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-foreground leading-none">{user?.name || "Student Node"}</p>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1 italic">Verified Member</p>
              </div>
              <Avatar className="h-12 w-12 rounded-2xl border-2 border-primary/20 group-hover:border-primary transition-all">
                <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold">
                  {user?.firstName?.[0] || <UserCircle className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-4 rounded-2xl border border-border bg-card shadow-premium overflow-hidden p-0 backdrop-blur-xl">
            <DropdownMenuLabel className="p-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/40 bg-background/50">My Identity</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-border" />
            <div className="p-2 space-y-1">
              <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer gap-3 font-bold text-muted-foreground/60 focus:bg-primary/10 focus:text-primary transition-colors">
                <UserIcon className="h-4 w-4" />
                Profile Details
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer gap-3 font-bold text-muted-foreground/60 focus:bg-primary/10 focus:text-primary transition-colors">
                <Settings className="h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-border" />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="rounded-xl px-4 py-3 cursor-pointer gap-3 font-bold text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Safe Disconnect
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
