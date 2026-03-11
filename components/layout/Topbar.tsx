"use client";

import { useAuth } from "@/lib/auth-context";
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border bg-white/80 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-4">
         <div className="relative group w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search intelligence index..." 
              className="h-10 w-full pl-10 pr-4 rounded-xl border-secondary/20 bg-secondary/5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
            />
         </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-secondary/50">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-white" />
        </Button>

        <div className="h-8 w-[1px] bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-1.5 hover:bg-secondary/50 rounded-2xl flex items-center gap-3">
              <Avatar className="h-9 w-9 rounded-xl border-2 border-primary/20">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase tracking-tighter">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start pr-2 hidden sm:flex">
                <span className="text-sm font-bold tracking-tight text-gray-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </span>
                <Badge variant="success" className="h-4 px-1.5 py-0 text-[8px] mt-1 font-black uppercase tracking-widest border-0">
                  {user?.role?.replace('_', ' ')}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border shadow-2xl">
            <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground p-3">
              Account Control
            </DropdownMenuLabel>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-secondary/50 flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold tracking-tight">Admin Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-secondary/50 flex items-center gap-3">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold tracking-tight">Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-secondary/50" />
            <DropdownMenuItem 
              onClick={logout}
              className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-rose-50 text-rose-600 focus:text-rose-600 flex items-center gap-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-bold tracking-tight">Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
