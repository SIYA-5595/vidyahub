"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { user, logout } = useAuth();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">

      {/* SEARCH */}
      <div className="relative w-[400px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search courses, students, resources..."
          className="pl-11 h-11 rounded-2xl bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium tracking-tight text-sm placeholder:text-slate-400"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-4 border-l pl-6 border-slate-100">
          <div className="flex items-center gap-3">
             <div className="flex -space-x-1">
                <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 tracking-tighter shadow-sm overflow-hidden">
                  {user ? getInitials(user.firstName, user.lastName) : "JD"}
                </div>
             </div>
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-tight leading-none">{user ? `${user.firstName} ${user.lastName}` : "John Doe"}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">{user?.role || "Student"}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

    </header>
  );
}
