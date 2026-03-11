"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Mail, Send, ShieldPlus, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function InviteAdminPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const roles = [
    { id: "admin", label: "Standard Admin", desc: "Manage students and announcements" },
    { id: "department_admin", label: "Dept. Head", desc: "Full department node control" },
    { id: "super_admin", label: "Super Admin", desc: "Full system infrastructure access" },
  ];

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!user) {
      toast.error("You must be logged in as Super Admin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }
      
      // The API now sends back a secure Firebase login link
      setInviteLink(data.inviteId); // Using inviteId as a reference, or just showing success
      toast.success("Secure invitation dispatched via Firebase Email Link");
      
      // Toggle to success state
      setInviteLink("firebase_managed_link"); 
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create invitation");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 shadow-sm">
                <ShieldPlus className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Admin Invitation</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                 Provisioning Elevated Access Nodes
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-10">
              {!inviteLink ? (
                <form onSubmit={handleSendInvite} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Email Registry</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="nexus.admin@vidyahub.io"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assigned Authorization Level</label>
                    <div className="grid gap-3">
                      {roles.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                            role === r.id 
                              ? "bg-primary/5 border-primary shadow-sm shadow-primary/10" 
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            role === r.id ? "border-primary" : "border-slate-300"
                          }`}>
                            {role === r.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-tight ${role === r.id ? "text-primary" : "text-slate-900"}`}>
                              {r.label}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Initialize Secure Invite
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="h-16 w-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="h-10 w-10 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Invite Dispatched</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mt-1">Registry Node Updated</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                       <Mail className="h-4 w-4 text-primary" /> Target: {email}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      A secure passwordless login link has been sent. The recipient must use that link to initialize their profile.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setInviteLink(null);
                        setEmail("");
                      }}
                      className="w-full h-16 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      Provision Another Node <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                       Token Auto-Expires in 48 Hours
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex shrink-0 items-center justify-center">
                <ShieldPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-900">Security Protocol</p>
                <p className="text-[11px] font-medium text-amber-700/80 mt-1 leading-relaxed">
                  This token allows a user to bypass standard registration. Ensure the email provided is verified. One-time use only.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
