"use client";

import { Bell, Search, UserCircle, Menu, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function Navbar() {
  return (
    <header className="h-24 sticky top-0 z-40 flex items-center justify-between px-10 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="flex items-center gap-8">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-xl hover:bg-primary/10 text-foreground transition-all">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="relative group hidden md:block">
          <div className="absolute inset-0 bg-primary/5 rounded-2xl transition-all group-focus-within:bg-primary/10 -z-10" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors z-10" />
          <Input 
            type="text" 
            placeholder="Search telemetry..." 
            className="w-[450px] h-12 pl-12 pr-12 rounded-2xl border border-border/50 bg-background/50 text-sm font-bold text-foreground placeholder:text-muted-foreground/20 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none opacity-40">
            <kbd className="h-5 select-none items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium sm:flex text-muted-foreground/40 shadow-sm">
                <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
             <button className="relative p-2.5 text-muted-foreground/30 hover:text-primary transition-all hover:bg-primary/10 rounded-xl group group-focus:outline-none outline-none border-none">
                <Bell className="h-6 w-6 transition-transform group-hover:rotate-12 outline-none" />
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-rose-500 border-2 border-background rounded-full animate-pulse" />
            </button>
        </div>

        <div className="h-10 w-[1px] bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-5 cursor-pointer group outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-foreground leading-none group-hover:text-primary transition-colors">ADMIN NEXUS</p>
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mt-2 group-hover:opacity-80 transition-opacity">MASTER AUTHORITY</p>
              </div>
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center border-2 border-border/50 group-hover:border-primary transition-all group-hover:scale-105 overflow-hidden">
                    <UserCircle className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-4 rounded-[2rem] border-border bg-card shadow-premium overflow-hidden p-2">
            <DropdownMenuLabel className="p-5 font-black uppercase text-[10px] tracking-[0.15em] text-muted-foreground/30">SECURITY CLEARANCE</DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2 bg-border" />
            <div className="p-1 space-y-1">
              <DropdownMenuItem className="rounded-2xl px-5 py-4 cursor-pointer gap-4 font-bold text-foreground hover:bg-primary/10 transition-all group/item outline-none">
                <UserIcon className="h-5 w-5 text-muted-foreground/20 group-hover/item:text-primary transition-colors" />
                IDENTITY DECRYPT
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-2xl px-5 py-4 cursor-pointer gap-4 font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-all group/item outline-none">
                <Settings className="h-5 w-5 text-muted-foreground/20 group-hover/item:text-primary transition-colors" />
                SYSTEM PARAMS
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-2 my-2 bg-border" />
              <DropdownMenuItem className="rounded-2xl px-5 py-4 cursor-pointer gap-4 font-bold text-rose-500 hover:bg-rose-500/10 transition-all outline-none">
                <LogOut className="h-5 w-5" />
                LOGOUT NODE
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
