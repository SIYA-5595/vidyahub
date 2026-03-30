"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import UsersTable from "@/components/UsersTable";
import AdminUserForm from "@/components/AdminUserForm";
import { Download, UserPlus, Users as UsersIcon } from "lucide-react";
import { useUsers, AddUserData } from "@/hooks/useUsers";
import { toast } from "sonner";

export default function UsersPage() {
  const { users, loading, addUser } = useUsers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Calculate dynamic stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const blockedCount = users.filter(u => u.status === "blocked").length;

  const handleAddUser = async (data: AddUserData) => {
    try {
      await addUser(data);
      toast.success("Identity Manifested in Nexus.");
    } catch (err: unknown) {
      toast.error("Manifestation failed. Check protocols.");
      throw err;
    }
  };

  const handleExportCSV = () => {
    if (users.length === 0) return;

    const headers = ["Name", "Email", "Role", "UID", "Status", "Created At"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.role}"`,
        `"${u.uid}"`,
        `"${u.status}"`,
        `"${u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toISOString() : 'N/A'}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vidyahub_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Registry Exported.");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">User Registry</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-2">
                 Managing Authentication Nodes & Access Levels
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 h-12 px-4 bg-card border border-border rounded-xl text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors shadow-sm disabled:opacity-50"
                disabled={loading || users.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                <UserPlus className="h-4 w-4" />
                Add Node
              </button>
            </div>
          </div>

          {/* Stats Summary - Dynamic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Total Registrations", value: loading ? "..." : totalUsers, trend: "Nexus Bound", color: "text-primary" },
              { label: "Elevated Access", value: loading ? "..." : adminCount, trend: "Admin Nodes", color: "text-accent" },
              { label: "Restricted Nodes", value: loading ? "..." : blockedCount, trend: "Protocol 4", color: "text-rose-500" },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-card rounded-[2rem] border border-border shadow-premium flex flex-col gap-1 transition-all hover:shadow-md">
                <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em]">{stat.label}</span>
                <div className="flex items-baseline gap-3">
                  <span className={`text-2xl font-black italic ${stat.color}`}>{stat.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic uppercase tracking-tight text-foreground flex items-center gap-3">
                <UsersIcon className="h-5 w-5 text-primary" />
                Registry Manifest
              </h2>
            </div>
            
            <UsersTable />
          </div>
        </main>
      </div>

      <AdminUserForm 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </div>
  );
}
