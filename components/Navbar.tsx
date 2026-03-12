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
    <header className="h-24 sticky top-0 z-40 flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl border-b border-secondary/20">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-lg">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
          <Input 
            type="text" 
            placeholder="Search indexing..." 
            className="w-96 h-12 pl-12 pr-4 rounded-2xl bg-secondary/10 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-all group border-none">
          <Bell className="h-6 w-6 text-slate-600 group-hover:text-primary transition-colors" />
          <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary border-2 border-white rounded-full" />
        </Button>

        <div className="h-8 w-[1px] bg-secondary/20 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-4 pl-2 cursor-pointer group outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">Admin Nexus</p>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Super Authority</p>
              </div>
              <Avatar className="h-12 w-12 rounded-2xl border-2 border-primary/20 group-hover:border-primary transition-all">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserCircle className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-4 rounded-2xl border-secondary/10 shadow-xl overflow-hidden p-0">
            <DropdownMenuLabel className="p-4 font-black uppercase text-[10px] tracking-widest text-slate-400 bg-slate-50/50">Admin Identity</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0 bg-secondary/10" />
            <div className="p-2">
              <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer gap-3 font-bold text-slate-600 focus:bg-primary/5 focus:text-primary transition-colors">
                <UserIcon className="h-4 w-4" />
                Profile Decryption
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer gap-3 font-bold text-slate-600 focus:bg-primary/5 focus:text-primary transition-colors">
                <Settings className="h-4 w-4" />
                Nexus Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-secondary/5" />
              <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer gap-3 font-bold text-rose-500 focus:bg-rose-50 focus:text-rose-600 transition-colors">
                <LogOut className="h-4 w-4" />
                Disconnect Node
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
