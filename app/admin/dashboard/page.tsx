"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardCards from "@/components/DashboardCards";
import StudentForm from "@/components/StudentForm";
import { useStudents, Student } from "@/hooks/useStudents";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Activity, Plus, Megaphone, Loader2, Clock, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 space-y-12 pb-24">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Intelligence Deck</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2">
                 Aggregating Institutional Data Nodes
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => setIsStudentModalOpen(true)}
                className="h-14 px-8 rounded-2xl font-bold text-xs uppercase tracking-widest text-foreground border-border hover:bg-primary/5 transition-all flex items-center gap-3 active:scale-95 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Enroll Student
              </Button>
              <Button 
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="h-14 px-10 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-3 active:scale-95 group"
              >
                <Megaphone className="h-4 w-4 transition-transform group-hover:rotate-12" />
                New Signal
              </Button>
            </div>
          </div>

          <DashboardCards />

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic tracking-tight text-foreground flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  Real-time propagation
                </h2>
                <div className="flex items-center gap-3">
                   {announcementsLoading && <Loader2 className="h-4 w-4 animate-spin text-primary/20" />}
                   <Badge variant="outline" className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest px-4 py-1.5 rounded-xl border-border bg-card">
                     Live Feed
                   </Badge>
                </div>
              </div>

              <div className="space-y-4 min-h-[300px]">
                {announcements.length === 0 && !announcementsLoading ? (
                  <div className="p-20 text-center bg-card rounded-[3rem] border border-dashed border-border shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/20">Zero recent transmissions</p>
                  </div>
                ) : announcements.map((item) => (
                  <Card 
                    key={item.id} 
                    onClick={() => router.push("/admin/announcements")}
                    className="group p-8 bg-card rounded-[2.5rem] border-border hover:border-primary/30 shadow-premium hover:shadow-2xl transition-all cursor-pointer flex items-center justify-between border active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-8">
                      <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                        <Clock className="h-7 w-7 text-muted-foreground/40 group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-[11px] font-black uppercase text-muted-foreground/30 tracking-widest mt-2 flex items-center gap-2">
                           <span className="h-1 w-1 rounded-full bg-primary" />
                          {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : "Recently"} • Broadcast Node
                        </p>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ArrowUpRight className="h-6 w-6 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-black italic tracking-tight text-foreground flex items-center gap-4">
                <div className="h-2 w-8 bg-primary rounded-full" />
                Nexus Stability
              </h2>
              <Card className="p-10 bg-card rounded-[3rem] border-border shadow-premium space-y-10 border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <ShieldCheck className="w-32 h-32" />
                </div>
                {[
                  { label: "Identity Nodes", value: 100, display: "OPTIMIZED", color: "bg-primary" },
                  { label: "Data Latency", value: 100, display: "LOW-LATENCY", color: "bg-accent" },
                  { label: "Auth Protocols", value: 100, display: "SECURED", color: "bg-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase text-muted-foreground/20 tracking-widest">{item.label}</span>
                      <span className="text-sm font-black italic text-foreground">{item.display}</span>
                    </div>
                    <div className="h-2.5 w-full bg-background/50 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.2 * i }}
                            className={cn("h-full rounded-full", item.color)} 
                        />
                    </div>
                  </div>
                ))}
                
                <div className="pt-8 border-t border-border flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/10">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">Protocol Status</p>
                    <p className="text-base font-bold italic text-foreground">Synchronized Globally</p>
                  </div>
                </div>
              </Card>
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
      <Dialog open={isAnnouncementModalOpen} onOpenChange={setIsAnnouncementModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 border border-border bg-card rounded-[3rem] overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 border-b border-border bg-background/50">
            <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-foreground">Quick Signal Broadcast</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePostQuickAnn} className="p-10 space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Header</Label>
              <Input 
                required
                className="w-full h-14 px-6 rounded-2xl bg-background/50 border border-border text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none italic uppercase placeholder:text-muted-foreground/30"
                placeholder="SIGNAL IDENTIFIER..."
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payload</Label>
              <Textarea 
                required
                rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-background/50 border border-border text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none resize-none placeholder:text-muted-foreground/30"
                placeholder="Encryption-ready message content..."
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
              />
            </div>
            <Button 
              type="submit"
              disabled={submittingAnn}
              className="w-full h-16 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
            >
              {submittingAnn ? <Loader2 className="h-6 w-6 animate-spin" /> : "Initiate Protocol"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
