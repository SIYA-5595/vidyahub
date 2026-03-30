"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, Trash2, Eye, Star, CheckCircle, Zap, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";

type Resume = {
  id: string;
  name: string;
  role: string;
  skills: string;
  status: "Pending" | "Reviewed";
};

export default function ResumeForum() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");

  const [resumes, setResumes] = useState<Resume[]>([]);

  // Load resumes from Firestore
  useEffect(() => {
    const loadResumes = async () => {
      if (!user) {
        return;
      }

      try {
        const docRef = doc(db, "user-resumes", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setResumes(docSnap.data().resumes || []);
        }
      } catch (err) {
        console.error("Error loading resumes:", err);
      }
    };

    loadResumes();
  }, [user]);

  const syncWithFirestore = async (updatedResumes: Resume[]) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "user-resumes", user.uid), {
        resumes: updatedResumes,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error syncing resumes:", err);
      toast.error("Failed to synchronize Dossier Forge");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadResume = async () => {
    if (!name || !role || !skills) return;

    const updated = [
      ...resumes,
      { id: Date.now().toString(), name, role, skills, status: "Pending" as const },
    ];

    setResumes(updated);
    await syncWithFirestore(updated);
    toast.success("Blueprint injected into Nexus");

    setName("");
    setRole("");
    setSkills("");
  };

  const deleteResume = async (id: string) => {
    const updated = resumes.filter((r: Resume) => r.id !== id);
    setResumes(updated);
    await syncWithFirestore(updated);
    toast.success("Blueprint purged from registry");
  };

  const markReviewed = async (id: string) => {
    const updated = resumes.map((r: Resume) => {
      if (r.id === id) return { ...r, status: "Reviewed" as const };
      return r;
    });
    setResumes(updated);
    await syncWithFirestore(updated);
    toast.success("Blueprint verified by AI Scanner");
  };

  return (
    <PageHeader
      title="Cognitive Dossier Forge"
      description="Architectural career blueprints and neural career optimization patterns for elite technical placement"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium">
            {isSaving && (
              <div className="flex items-center gap-3 px-6 text-[10px] font-black text-primary/60 uppercase tracking-widest animate-pulse italic">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                NEXUS SYNC ACTIVE
              </div>
            )}
            <Button className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 border-none">
              <Zap size={16} className="text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform" /> AI SCANNER
            </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* SIDEBAR FORM */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-10">
           <Card className="rounded-[3.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
             <CardHeader className="p-10 pb-6">
                <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-foreground leading-none">
                   Intake Gate
                </CardTitle>
             </CardHeader>
             <CardContent className="p-10 pt-4 space-y-10">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic leading-none">Candidate Name</p>
                       <Input placeholder="FULL NOMENCLATURE" value={name} onChange={(e) => {
                           const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                           setName(val);
                       }} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-8 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/10 text-foreground"/>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic leading-none">Target Vector (Role)</p>
                       <Input placeholder="E.G. NEURAL ARCHITECT" value={role} onChange={(e) => {
                           const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                           setRole(val);
                       }} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-8 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/10 text-foreground uppercase"/>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2 italic leading-none">Tech Stack Protocol</p>
                       <Input placeholder="REACT, NEXT, WASM" value={skills} onChange={(e) => {
                           const val = e.target.value.replace(/[^a-zA-Z\s,]/g, "");
                           setSkills(val);
                       }} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-[10px] px-8 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/10 text-foreground uppercase tracking-widest"/>
                   </div>
                </div>
                <Button onClick={uploadResume} className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group relative overflow-hidden border-none text-center">
                   <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                   <Upload size={28} className="mr-5 group-hover:-translate-y-2 transition-transform duration-500" />
                   INIT SUBMISSION
                </Button>
             </CardContent>
           </Card>

           <div className="p-10 bg-background/40 backdrop-blur-sm rounded-[3rem] border border-white/5 space-y-6 shadow-inner relative group overflow-hidden transition-all duration-700 hover:shadow-premium-hover">
              <div className="flex items-center gap-4 text-primary relative z-10">
                 <Shield size={24} className="group-hover:rotate-12 transition-transform duration-700" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">Encryption: Active</p>
              </div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase leading-relaxed italic leading-none relative z-10">
                All uploaded blueprints undergo deep architectural analysis and neural verification sequences.
              </p>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           </div>
        </div>

        {/* MAIN LIST */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
           <div className="flex items-center justify-between px-6">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground leading-none">Blueprints Nexus</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Managed Career Architectural Frameworks</p>
              </div>
              <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest leading-none bg-background/40 border border-white/5 text-foreground transition-all shadow-inner">{resumes.length} CANDIDATES</Badge>
           </div>

           <div className="grid md:grid-cols-1 xl:grid-cols-2 gap-10">
              {resumes.map((resume: Resume, index: number) => (
                <motion.div
                   key={resume.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   whileHover={{ y: -8 }}
                >
                   <Card className="rounded-[3.5rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden bg-card/40 backdrop-blur-sm relative transition-colors">
                      <div className={`absolute top-0 right-0 h-full w-2 transition-all duration-700 ${resume.status === 'Reviewed' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`} />
                      <CardContent className="p-10 space-y-10 flex flex-col h-full">
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 rounded-[1.5rem] bg-background/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-inner border border-white/5">
                                  <FileText className="w-8 h-8 group-hover:scale-110 transition-transform"/>
                               </div>
                               <div className="space-y-3">
                                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">CANDIDATE NODE</p>
                                  <p className="text-3xl font-black italic tracking-tighter text-foreground leading-none uppercase group-hover:text-primary transition-colors">{resume.name}</p>
                               </div>
                            </div>
                            <Badge className={`rounded-xl px-4 py-1 font-black italic text-[10px] uppercase tracking-widest border-none ${resume.status === 'Reviewed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {resume.status}
                            </Badge>
                         </div>

                         <div className="space-y-4 flex-grow px-2">
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">STRATEGIC VECTOR</p>
                               <p className="text-2xl font-black italic text-foreground leading-none uppercase tracking-tight">{resume.role}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                               {resume.skills.split(',').map((skill, sIdx) => (
                                 <Badge key={sIdx} variant="secondary" className="bg-background/40 text-[10px] font-black italic uppercase tracking-widest px-4 py-2 rounded-xl border border-white/5 group-hover:bg-background transition-colors duration-500 text-foreground">
                                   {skill.trim()}
                                 </Badge>
                               ))}
                            </div>
                         </div>

                         {resume.status === "Reviewed" && (
                            <div className="bg-emerald-500/10 p-8 rounded-[2rem] border border-emerald-500/20 flex items-start gap-6 transform group-hover:scale-[1.02] transition-transform duration-700 shadow-inner">
                               <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl shadow-inner flex items-center justify-center text-emerald-400 group-hover:rotate-12 transition-transform">
                                  <Star className="w-7 h-7 fill-emerald-400" />
                               </div>
                               <div className="space-y-2 flex-1">
                                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic leading-none">Architectural Feedback</p>
                                  <p className="text-sm font-black italic text-muted-foreground leading-relaxed uppercase tracking-tight mt-3">Strong resume with good technical skills. Optimization complete.</p>
                                </div>
                             </div>
                          )}

                         <div className="flex flex-col gap-4 pt-6 border-t border-white/5 mt-auto">
                            <div className="grid grid-cols-2 gap-3">
                               <Button variant="ghost" className="h-16 rounded-2xl bg-background/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all font-black italic tracking-widest text-[10px] uppercase gap-3 shadow-inner border border-white/5 group-hover:scale-105">
                                  <Eye size={20} /> VIEW BLUEPRINT
                               </Button>
                               <Button 
                                 onClick={() => markReviewed(resume.id)}
                                 disabled={resume.status === "Reviewed"}
                                 className="h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-black italic tracking-widest text-[10px] uppercase gap-3 shadow-2xl shadow-primary/30 disabled:bg-emerald-500/20 disabled:text-emerald-400 disabled:opacity-100 border-none group-hover:scale-105 active:scale-95 relative overflow-hidden"
                               >
                                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                                  <CheckCircle size={20} /> {resume.status === 'Reviewed' ? 'VERIFIED' : 'INITIATE REVIEW'}
                               </Button>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                              <div className="flex-grow h-px bg-white/5" />
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-12 w-12 rounded-xl bg-background/40 text-rose-500 border border-white/5 hover:bg-rose-500/20 transition-all transform hover:rotate-12 shadow-inner" 
                                 onClick={() => deleteResume(resume.id)}
                               >
                                  <Trash2 size={24} />
                               </Button>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </PageHeader>
  );
}
