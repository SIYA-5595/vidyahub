"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Megaphone, Clock, Globe, ArrowRight, Shield, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function Announcements() {
  const { announcements, loading, postAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState("Global Sync");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Header is required";
    if (!message.trim()) newErrors.message = "Payload message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await postAnnouncement({ title, message, tag });
      setTitle("");
      setMessage("");
      setErrors({});
      toast.success("Signal propagated successfully");
    } catch {
      toast.error("Transmission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast.success("Broadcast terminated");
    } catch {
      toast.error("Cleanup failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Universal Broadcast</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Transmit High-Priority Intel to Nexus Nodes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <div className="bg-white p-12 rounded-[3.5rem] shadow-premium border border-secondary/10 space-y-10">
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Megaphone className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Blast Protocol</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initialize Message Sequence</p>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Intel Header</label>
                    <input 
                      className={cn(
                        "w-full h-16 px-6 rounded-2xl bg-secondary/5 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none italic",
                        errors.title && "ring-2 ring-rose-500/50 bg-rose-50/50"
                      )}
                      placeholder="E.G. SEMESTER AUDIT COMMENCING..."
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value.toUpperCase());
                        if (errors.title) setErrors({...errors, title: ""});
                      }}
                    />
                    {errors.title && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic tracking-widest">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Intel Payload</label>
                    <textarea 
                      rows={5}
                      className={cn(
                        "w-full px-6 py-4 rounded-2xl bg-secondary/5 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none",
                        errors.message && "ring-2 ring-rose-500/50 bg-rose-50/50"
                      )}
                      placeholder="Detailed transmission content..."
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors({...errors, message: ""});
                      }}
                    />
                    {errors.message && <p className="text-[10px] font-bold text-rose-500 ml-2 uppercase italic tracking-widest">{errors.message}</p>}
                  </div>

                  <div className="flex bg-slate-50 p-4 rounded-2xl border border-secondary/10 gap-6">
                    <div 
                      onClick={() => setTag("Global Sync")}
                      className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group ${tag === "Global Sync" ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-secondary/20 text-slate-600 hover:border-primary'}`}
                    >
                       <Globe className={`h-5 w-5 ${tag === "Global Sync" ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                       <span className="text-xs font-black uppercase tracking-widest">Global Sync</span>
                    </div>
                    <div 
                       onClick={() => setTag("Secure Only")}
                       className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group ${tag === "Secure Only" ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-secondary/20 text-slate-600 hover:border-rose-500'}`}
                    >
                       <Shield className={`h-5 w-5 ${tag === "Secure Only" ? 'text-white' : 'text-slate-400 group-hover:text-rose-500'}`} />
                       <span className="text-xs font-black uppercase tracking-widest">Secure Only</span>
                    </div>
                  </div>

                  <button 
                    disabled={submitting}
                    className="w-full h-18 bg-[#0b1220] hover:bg-[#162238] text-white rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                      <>
                        Propagate Signal
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
               </form>
            </div>

            {/* History */}
            <div className="space-y-8">
               <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Transmission Log</h2>
               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-50">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Syncing History...</p>
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-secondary/30">
                      <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No signals detected</p>
                    </div>
                  ) : announcements.map((item) => (
                    <div key={item.id} className="p-8 bg-white rounded-[2.5rem] border border-secondary/10 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Clock className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 tracking-tight italic">{item.title}</p>
                             <div className="flex items-center gap-3 mt-1.5">
                               <span className={`text-[10px] font-black uppercase tracking-widest italic ${item.tag === 'Global Sync' ? 'text-primary' : 'text-rose-500'}`}>{item.tag}</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : "just now"}
                               </span>
                             </div>
                             <p className="text-xs text-slate-500 mt-2 line-clamp-1 group-hover:line-clamp-none transition-all duration-500 max-w-xs">{item.message}</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleDelete(item.id!)}
                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                       >
                         <Trash2 className="h-5 w-5" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
