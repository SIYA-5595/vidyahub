"use client";

import { Bell, Search, UserCircle, Menu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-24 sticky top-0 z-40 flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl border-b border-secondary/20">
      <div className="flex items-center gap-6">
        <button className="lg:hidden p-2 hover:bg-secondary rounded-lg">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search indexing..." 
            className="w-96 h-12 pl-12 pr-4 rounded-2xl bg-secondary/10 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-3 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-all group">
          <Bell className="h-6 w-6 text-slate-600 group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary border-4 border-white rounded-full" />
        </button>

        <div className="h-8 w-[1px] bg-secondary/20 mx-2" />

        <div className="flex items-center gap-4 pl-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">Admin Nexus</p>
            <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Super Authority</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary transition-all">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
