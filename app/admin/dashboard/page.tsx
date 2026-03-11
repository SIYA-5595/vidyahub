"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardCards from "@/components/DashboardCards";
import StudentForm from "@/components/StudentForm";
import { useStudents, Student } from "@/hooks/useStudents";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Activity, Plus, Megaphone, Loader2, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const { addStudent } = useStudents();
  const { announcements, loading: announcementsLoading, postAnnouncement } = useAnnouncements(3);
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  
  // Quick Announcement State
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [submittingAnn, setSubmittingAnn] = useState(false);

  const handleCreateStudent = async (data: Omit<Student, "id" | "createdAt">) => {
    try {
      await addStudent(data);
      toast.success("Student added to registry");
      setIsStudentModalOpen(false);
    } catch {
      toast.error("Failed to add student");
    }
  };

  const handlePostQuickAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    
    setSubmittingAnn(true);
    try {
      await postAnnouncement({ title: annTitle, message: annMessage, tag: "Global Sync" });
      setAnnTitle("");
      setAnnMessage("");
      toast.success("Announcement broadcasted");
      setIsAnnouncementModalOpen(false);
    } catch {
      toast.error("Broadcast failed");
    } finally {
      setSubmittingAnn(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 space-y-12 pb-24">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Intelligence Deck</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                 Aggregating Institutional Data Nodes
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsStudentModalOpen(true)}
                className="h-14 px-6 bg-white border border-secondary/20 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Enroll Student
              </button>
              <button 
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="h-14 px-8 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Megaphone className="h-4 w-4" />
                New Signal
              </button>
            </div>
          </div>

          <DashboardCards />

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900 flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  Real-time propagation
                </h2>
                <div className="flex items-center gap-2">
                   {announcementsLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                   <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-lg">Live Feed</span>
                </div>
              </div>

              <div className="space-y-4 min-h-[300px]">
                {announcements.length === 0 && !announcementsLoading ? (
                  <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-secondary/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero recent transmissions</p>
                  </div>
                ) : announcements.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => router.push("/admin/announcements")}
                    className="group p-6 bg-white rounded-[2rem] border border-secondary/10 hover:shadow-xl transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Clock className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1">{item.title}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                          {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : "Recently"} • Broadcast Node
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">System Integrity</h2>
              <div className="p-8 bg-white rounded-[2.5rem] border border-secondary/10 shadow-sm space-y-8">
                {[
                  { label: "Core Processing", value: "99.9%", status: "Optimal" },
                  { label: "Data Redundancy", value: "Active", status: "Enabled" },
                  { label: "Security Protocols", value: "Layer 4", status: "Locked" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                      <span className="text-sm font-black italic text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                       <div className="h-full w-4/5 bg-primary rounded-full transition-all duration-1000" />
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 border-t border-secondary/10 flex items-center gap-4 text-emerald-500">
                  <CheckCircle2 className="h-8 w-8" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Nexus Status</p>
                    <p className="text-sm font-bold italic">Synchronized Globally</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <StudentForm 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
        onSubmit={handleCreateStudent}
      />

      {/* Quick Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-secondary/10 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
              <div className="p-8 border-b border-secondary/10 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Quick Signal Broadcast</h2>
                <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handlePostQuickAnn} className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Header</label>
                  <input 
                    required
                    className="w-full h-14 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none italic"
                    placeholder="SIGNAL IDENTIFIER..."
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Payload</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl bg-secondary/5 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                    placeholder="Encryption-ready message content..."
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={submittingAnn}
                  className="w-full h-18 bg-primary hover:opacity-90 text-white rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {submittingAnn ? <Loader2 className="h-6 w-6 animate-spin" /> : "Initiate Protocol"}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
