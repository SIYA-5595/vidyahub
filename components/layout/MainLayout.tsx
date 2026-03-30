"use client";

import React from "react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  // Common layout wrapper. Note: Role-specific sidebars/navbars are now 
  // managed within app/(admin)/layout.tsx and app/user/layout.tsx.
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {children}
    </div>
  );
}
