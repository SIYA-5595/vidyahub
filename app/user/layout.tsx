"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true); // Default open on desktop
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Auto-close on small screens
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar - Side Drawer or Persistent Panel */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Main Container Area */}
      <div className={cn(
        "flex flex-col flex-1 h-full bg-background relative overflow-hidden transition-all duration-300",
        isOpen ? "lg:ml-0" : "lg:ml-0"
      )}>
        {/* Topbar sticky at top */}
        <Topbar />

        {/* Dynamic Page Content with ScrollArea logic */}
        <main className="flex-1 w-full h-full overflow-y-auto bg-muted/20 relative">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Backdrop for Sidebar */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden block transition-opacity duration-300"
        />
      )}
    </div>
  );
}
