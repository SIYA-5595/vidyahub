"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  DollarSign,
  Check,
  Clock,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700 border-green-200",
  upcoming: "bg-yellow-100 text-yellow-700 border-yellow-200",
  closed: "bg-red-100 text-red-700 border-red-200",
};

const statusIcons: Record<string, React.ElementType> = {
  open: Check,
  upcoming: Clock,
  closed: AlertCircle,
};

interface Scholarship {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  eligibility: string;
  status: string;
}

export default function ScholarshipsPage() {
  const [scholarshipsList, setScholarshipsList] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newScholarship, setNewScholarship] = useState({
    name: "",
    amount: "",
    deadline: "",
    eligibility: "",
    status: "open"
  });

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "scholarships"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScholarshipsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scholarship)));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addScholarship = async () => {
    if (!newScholarship.name || !newScholarship.amount || !newScholarship.deadline) {
      toast.error("All mission parameters required for grant injection");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "scholarships"), {
        ...newScholarship,
        createdAt: serverTimestamp()
      });
      setNewScholarship({ name: "", amount: "", deadline: "", eligibility: "", status: "open" });
      setShowAddForm(false);
      toast.success("New grant opportunity successfully broadcast");
    } catch {
      toast.error("Grant broadcast failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <PageHeader
      title="Scholarship Central"
      description="Track elite scholarship opportunities and critical deadlines"
      actions={
        <div className="flex bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 px-6 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "CLOSE ARCHIVE" : "BROADCAST GRANT"}
          </Button>
          <Button className="h-10 px-6 bg-white/10 text-white hover:bg-white/90 hover:text-primary rounded-xl font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Check My Eligibility
          </Button>
        </div>
      }
    >
      <div className="space-y-12">
        {/* STATS */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { label: "Active Opportunites", value: scholarshipsList.length.toString(), icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Total Fund Pool", value: "₹45.00 Lakh", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Urgent Deadlines", value: "03", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-[2.5rem] border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
              <CardContent className="p-8 flex justify-between items-center relative">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tighter italic">{stat.value}</p>
                </div>
                <div className={`p-5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <stat.icon className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showAddForm && (
          <Card className="rounded-[4rem] border-0 shadow-2xl bg-white overflow-hidden p-12 space-y-10">
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Grant Nomenclature</p>
                   <Input placeholder="E.G. GLOBAL QUANTUM FELLOWSHIP" value={newScholarship.name} onChange={e => setNewScholarship({...newScholarship, name: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Funding Scale</p>
                   <Input placeholder="E.G. ₹50,000 / ANNUM" value={newScholarship.amount} onChange={e => setNewScholarship({...newScholarship, amount: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Temporal Cutoff (Deadline)</p>
                   <Input type="date" value={newScholarship.deadline} onChange={e => setNewScholarship({...newScholarship, deadline: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Eligibility Parameters</p>
                   <Input placeholder="E.G. CGPA > 9.5 & RESEARCH PORTFOLIO" value={newScholarship.eligibility} onChange={e => setNewScholarship({...newScholarship, eligibility: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                </div>
             </div>
             <Button onClick={addScholarship} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
               {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : "EXECUTE BROADCAST"}
             </Button>
          </Card>
        )}

        {/* TIMELINE */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black italic tracking-tight uppercase">Opportunities Timeline</h2>
            <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary">Live Applications: {scholarshipsList.length}</Badge>
          </div>

          <div className="relative border-l-4 border-secondary ml-6 space-y-10 pl-10">
            {scholarshipsList.map((scholarship, index) => {
              const StatusIcon = statusIcons[scholarship.status as keyof typeof statusIcons] || AlertCircle;
              const daysLeft = getDaysUntilDeadline(scholarship.deadline);

              return (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <span className={`absolute -left-[54px] top-4 flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:rotate-12 ${
                    scholarship.status === 'open' ? 'bg-emerald-500' : 
                    scholarship.status === 'upcoming' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    <StatusIcon className="h-6 w-6 text-white" />
                  </span>

                  <Card className="rounded-[2.5rem] border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white group-hover:-translate-y-1">
                    <CardContent className="p-10">
                      <div className="flex flex-col xl:flex-row xl:justify-between gap-8">
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-3 items-center">
                            <h3 className="font-black text-2xl tracking-tight text-gray-900 uppercase">
                              {scholarship.name}
                            </h3>

                            <Badge className={`rounded-xl px-4 py-1 h-8 font-bold text-[10px] uppercase tracking-widest border-0 ${statusColors[scholarship.status as keyof typeof statusColors]}`}>
                              {scholarship.status}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-2">
                             <p className="text-3xl font-black text-primary italic leading-none">
                               {scholarship.amount}
                             </p>
                             <p className="text-muted-foreground font-bold text-sm tracking-tight opacity-70">
                               {scholarship.eligibility}
                             </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row xl:flex-col justify-between items-start xl:items-end gap-6">
                          <div className="xl:text-right space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Due Date</p>
                            <p className="font-black text-lg tracking-tight">
                              {new Date(scholarship.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>

                            {daysLeft > 0 && scholarship.status === "open" && (
                              <Badge className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg px-3 mt-2 font-bold animate-pulse">
                                {daysLeft} DAYS LEFT
                              </Badge>
                            )}
                          </div>

                          {scholarship.status === "open" && (
                            <div className="flex gap-3">
                              <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black italic tracking-tight shadow-lg shadow-primary/20">
                                APPLY NOW
                              </Button>
                              <Button variant="ghost" className="h-12 px-8 rounded-xl border-2 border-primary/10 text-primary font-bold hover:bg-primary/5">
                                DETAILS
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {scholarshipsList.length === 0 && !isLoading && (
              <div className="py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 text-center">
                 <Trophy className="w-24 h-24 mx-auto mb-8 opacity-5" />
                 <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase leading-none">Archival Void</p>
                 <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em]">Initialize grant sequence to populate timeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
