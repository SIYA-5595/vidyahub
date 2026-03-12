"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Users,
  Radio,
  CheckCircle,
  Trash2,
  Clock,
  Loader2,
  Edit3,
  Check,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

type Tab = "dashboard" | "ask" | "sessions" | "my";

interface Question {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  updatedAt?: { seconds: number; nanoseconds: number } | null;
  status: string;
}

export default function LiveQA() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [username, setUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Real-time listener for questions
  useEffect(() => {
    if (!user) {
      setQuestions([]);
      return;
    }
    const q = query(collection(db, "users", user.uid, "questions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(questionsList);
    });
    return () => unsubscribe();
  }, [user]);

  const addQuestion = async () => {
    if (!user) return;
    if (!question || !username) {
      toast.error("Please provide both identity and interrogation parameters");
      return;
    }
 
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "users", user.uid, "questions"), {
        text: question,
        userId: user.uid,
        userName: username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "pending"
      });
      setQuestion("");
      setUsername("");
      toast.success("Inquiry launched into neural net");
    } catch (err) {
      console.error("Error adding question: ", err);
      toast.error("Failed to broadcast query");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuestion = async (id: string, text: string) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "users", user.uid, "questions", id);
      await setDoc(docRef, { text, updatedAt: serverTimestamp() }, { merge: true });
      toast.success("Query updated");
      setEditingId(null);
    } catch {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!user || !id) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "questions", id));
      toast.success("Query purged from registry");
    } catch (err) {
      console.error("Error deleting question: ", err);
      toast.error("Failed to purge query");
    }
  };

  return (
    <PageHeader
      title="Live Catalyst"
      description="Real-time pedagogical interrogation and architectural knowledge exchange sessions"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="flex bg-white/10 p-1 rounded-xl">
             {(["dashboard", "ask", "sessions", "my"] as Tab[]).map((t) => (
               <Button
                 key={t}
                 variant="ghost"
                 size="sm"
                 onClick={() => setTab(t)}
                 className={`h-8 rounded-lg px-4 font-bold text-[10px] uppercase tracking-widest transition-all ${tab === t ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"}`}
               >
                 {t === 'dashboard' ? 'Overview' : t === 'ask' ? 'Broadcast' : t === 'sessions' ? 'Active Feeds' : 'My Archive'}
               </Button>
             ))}
           </div>
           <Button className="h-10 px-6 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            Live Sync
          </Button>
        </div>
      }
    >
      <div className="space-y-12">
        {/* ================= DASHBOARD ================= */}
        {tab === "dashboard" && (
          <div className="space-y-12">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { label: "Active Feeds", value: "3", icon: Radio, color: "text-rose-500" },
                { label: "Sync Participants", value: "120", icon: Users, color: "text-blue-500" },
                { label: "Global Queries", value: questions.length, icon: MessageCircle, color: "text-emerald-500" },
                { label: "Resolved Nodes", value: "38", icon: CheckCircle, color: "text-primary" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="rounded-[2rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                    <CardContent className="p-10 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                        <p className="text-4xl font-black italic tracking-tighter">{stat.value}</p>
                      </div>
                      <div className={`h-14 w-14 rounded-2xl bg-secondary/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-7 w-7" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               <Card className="rounded-[2.5rem] border-0 bg-primary shadow-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                  <CardContent className="p-12 space-y-6 relative z-10">
                     <Badge className="bg-white/20 text-white border-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">Immediate Priority</Badge>
                     <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Initialize New Inquiry</h2>
                     <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">Broadcast your technical impediments to the institutional faculty collective</p>
                     <Button onClick={() => setTab('ask')} className="h-16 px-10 bg-white text-primary hover:bg-white/90 rounded-2xl font-black italic text-lg tracking-tight shadow-xl">
                        START BROADCAST
                     </Button>
                  </CardContent>
               </Card>

               <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm overflow-hidden relative group">
                  <CardContent className="p-12 space-y-6">
                     <div className="flex justify-between items-center">
                        <Badge className="bg-rose-500/10 text-rose-500 border-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">Active Transmission</Badge>
                        <Radio className="text-rose-500 animate-pulse" />
                     </div>
                     <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">Sync in Progress</h2>
                     <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm">&quot;System Architecture and High-Density Database Scaling&quot; with Dr. Aris</p>
                     <Button variant="secondary" onClick={() => setTab('sessions')} className="h-16 px-10 rounded-2xl font-black italic text-lg tracking-tight bg-secondary/10 hover:bg-secondary/20">
                        JOIN INTERFACE
                     </Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        )}

        {/* ================= ASK QUESTION ================= */}
        {tab === "ask" && (
          <div className="max-w-4xl mx-auto space-y-12">
            <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden">
               <CardContent className="p-12 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-[1.5] space-y-4">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Identity Node</p>
                 <Input
                   placeholder="ENTER NOMENCLATURE"
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                 />
              </div>
              <div className="flex-[3] space-y-4">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Interrogation Protocol</p>
                 <Input
                   placeholder="WHAT IS THE CORE REASONING BEHIND THIS ARCHITECTURE?"
                   value={question}
                   onChange={(e) => setQuestion(e.target.value)}
                   className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                 />
              </div>
              <Button 
                onClick={addQuestion} 
                disabled={isSubmitting}
                className="h-16 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black italic tracking-tighter text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all group overflow-hidden relative"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : (
                  <>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                    TRANSMIT INQUIRY
                  </>
                )}
              </Button>
            </div>   </CardContent>
            </Card>

            <div className="space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Local Transmission History</h3>
                  <Badge variant="secondary" className="rounded-full h-6 px-3 text-[10px] font-black">{questions.length} NODES</Badge>
               </div>
               <div className="grid gap-4">
                  {questions.map((q, i) => (
                    <motion.div key={q.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white hover:shadow-md transition-all group">
                       <CardContent className="p-8 flex justify-between items-center bg-white rounded-[1.5rem]">
                            <div className="flex items-start gap-6 flex-1">
                               <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                  <MessageCircle className="text-primary h-6 w-6" />
                               </div>
                               {editingId === q.id ? (
                                 <div className="flex gap-2 flex-1">
                                   <Input value={question} onChange={e => setQuestion(e.target.value)} className="h-10 text-xs" />
                                   <Button onClick={() => updateQuestion(q.id, question)} size="icon" className="h-10 w-10"><Check className="h-4 w-4" /></Button>
                                 </div>
                               ) : (
                                 <p className="text-lg font-bold text-gray-800 leading-relaxed pt-1">{q.text}</p>
                               )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => {
                                  if (editingId === q.id) {
                                    setEditingId(null);
                                  } else {
                                    setEditingId(q.id);
                                    setQuestion(q.text);
                                  }
                                }}
                              >
                                {editingId === q.id ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => deleteQuestion(q.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                         </CardContent>
                      </Card>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* ================= LIVE SESSIONS ================= */}
        {tab === "sessions" && (
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Placement Protocols Q&A", host: "Placement Cell Intelligence", status: "Active Now" },
              { title: "Architectural Capstone Guidance", host: "Faculty Collective", status: "Starting in 15m" }
            ].map((session, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <Card className="rounded-[3rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="h-4 bg-primary/10 w-full group-hover:bg-primary transition-colors" />
                  <CardContent className="p-12 space-y-8">
                    <div className="space-y-2">
                       <Badge className="bg-rose-500/10 text-rose-500 border-0 rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">{session.status}</Badge>
                       <h2 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">{session.title}</h2>
                       <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Interface Host: {session.host}</p>
                    </div>
                    <Button className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black italic tracking-tight text-lg shadow-xl shadow-primary/20">
                      INITIALIZE SYNC
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* ================= MY QUESTIONS ================= */}
        {tab === "my" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center px-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Personal Query Archive</h3>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center py-32 bg-secondary/5 rounded-[3rem] border-4 border-dashed border-secondary/20">
                 <MessageCircle className="mx-auto h-20 w-20 text-muted-foreground opacity-10 mb-6" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Void Registry: Zero queries archived</p>
                 <Button variant="ghost" className="mt-6 text-primary font-black uppercase text-[10px] tracking-widest" onClick={() => setTab('ask')}>Broadcast first query</Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {questions.map((q) => (
                  <Card key={q.id} className="rounded-[2rem] border-0 shadow-sm bg-white group hover:shadow-md transition-all">
                    <CardContent className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                       <div className="space-y-4 flex-1">
                          <Badge className="bg-secondary/10 text-muted-foreground border-0 rounded-lg text-[10px] font-black px-3 uppercase tracking-widest">Awaiting Verification</Badge>
                          <p className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase leading-tight">{q.text}</p>
                       </div>
                       <div className="flex items-center gap-4 bg-secondary/5 p-4 rounded-2xl w-full md:w-auto">
                          <Clock className="text-muted-foreground h-5 w-5" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync Delay</p>
                             <p className="text-xs font-bold text-gray-700">T-minus Indeterminate</p>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageHeader>
  );
}
