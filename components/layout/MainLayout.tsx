"use client";

export function MainLayout({ children }: { children: React.ReactNode }) {
  // For the frontend-only UI demo, we just render the children.
  // Sidebar and Navbar are included in the individual admin pages as requested by the folder structure.
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {children}
    </div>
  );
}
