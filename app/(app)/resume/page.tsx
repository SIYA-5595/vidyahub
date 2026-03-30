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
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           {isSaving && (
             <div className="flex items-center gap-2 px-4 text-[8px] font-black text-white/40 uppercase tracking-widest animate-pulse">
               <Loader2 className="w-3 h-3 animate-spin" />
               Syncing Blueprints
             </div>
           )}
           <Button className="h-10 px-8 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95">
             <Zap size={14} className="text-amber-500" /> AI SCANNER
           </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* SIDEBAR FORM */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-10">
           <Card className="rounded-[3.5rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
             <CardHeader className="p-10 pb-6">
                <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                  Intake Gate
                </CardTitle>
             </CardHeader>
             <CardContent className="p-10 pt-4 space-y-10">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Candidate Name</p>
                       <Input placeholder="FULL NOMENCLATURE" value={name} onChange={(e) => {
                           const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                           setName(val);
                       }} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg px-8 focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20"/>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Target Vector (Role)</p>
                       <Input placeholder="E.G. NEURAL ARCHITECT" value={role} onChange={(e) => {
                           const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                           setRole(val);
                       }} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg px-8 focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20 uppercase"/>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 italic opacity-40">Tech Stack Protocol</p>
                       <Input placeholder="REACT, NEXT, WASM" value={skills} onChange={(e) => {
                           const val = e.target.value.replace(/[^a-zA-Z\s,]/g, "");
                           setSkills(val);
                       }} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-[10px] px-8 focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20 uppercase tracking-widest"/>
                   </div>
                </div>
                <Button onClick={uploadResume} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                   <Upload size={28} className="mr-5 group-hover:-translate-y-1 transition-transform duration-500" />
                   INIT SUBMISSION
                </Button>
             </CardContent>
           </Card>

           <div className="p-10 bg-secondary/5 rounded-[3rem] border border-secondary/10 space-y-6">
              <div className="flex items-center gap-4 text-primary">
                 <Shield size={20} />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Encryption: Active</p>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase leading-relaxed opacity-40 italic">
                All uploaded blueprints undergo deep architectural analysis and neural verification sequences.
              </p>
           </div>
        </div>

        {/* MAIN LIST */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
           <div className="flex items-center justify-between px-6">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Blueprints Nexus</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Managed Career Architectural Frameworks</p>
              </div>
              <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest leading-none bg-secondary/10">{resumes.length} CANDIDATES</Badge>
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
                  <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 group overflow-hidden bg-white relative">
                     <div className={`absolute top-0 right-0 h-full w-2 transition-all duration-700 ${resume.status === 'Reviewed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                     <CardContent className="p-10 space-y-10 flex flex-col h-full">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-[1.5rem] bg-secondary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm border border-secondary/10">
                                 <FileText className="w-8 h-8"/>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic leading-none">CANDIDATE NODE</p>
                                 <p className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none uppercase group-hover:text-primary transition-colors">{resume.name}</p>
                              </div>
                           </div>
                           <Badge className={`rounded-lg px-4 h-8 font-black italic text-[9px] uppercase tracking-widest border-0 ${resume.status === 'Reviewed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                             {resume.status}
                           </Badge>
                        </div>

                        <div className="space-y-4 flex-grow px-2">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest italic leading-none">STRATEGIC VECTOR</p>
                              <p className="text-xl font-black italic text-gray-900 leading-tight uppercase tracking-tight">{resume.role}</p>
                           </div>
                           
                           <div className="flex flex-wrap gap-2 pt-2">
                              {resume.skills.split(',').map((skill, sIdx) => (
                                <Badge key={sIdx} variant="secondary" className="bg-secondary/5 text-[9px] font-black italic uppercase tracking-widest px-3 py-1.5 rounded-xl border border-secondary/10 group-hover:bg-white transition-colors duration-500">
                                  {skill.trim()}
                                </Badge>
                              ))}
                           </div>
                        </div>

                        {resume.status === "Reviewed" && (
                           <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10 flex items-start gap-4 transform group-hover:scale-[1.02] transition-transform duration-500">
                              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                                 <Star className="w-5 h-5 fill-emerald-500" />
                              </div>
                              <div className="space-y-1 flex-1">
                                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic opacity-60">Architectural Feedback</p>
                                 <p className="text-xs font-black italic text-gray-700 leading-relaxed uppercase tracking-tight">Strong resume with good technical skills. Optimization complete.</p>
                              </div>
                           </div>
                        )}

                        <div className="flex gap-4 pt-6 border-t border-secondary/5 mt-auto">
                           <Button variant="ghost" className="h-14 flex-1 rounded-2xl bg-secondary/5 text-primary hover:bg-primary hover:text-white transition-all font-black italic tracking-widest text-[10px] uppercase gap-3 shadow-sm border border-secondary/10">
                              <Eye size={16} /> VIEW BLUEPRINT
                           </Button>
                           <Button 
                             onClick={() => markReviewed(resume.id)}
                             disabled={resume.status === "Reviewed"}
                             className="h-14 flex-1 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all font-black italic tracking-widest text-[10px] uppercase gap-3 shadow-xl disabled:bg-emerald-500 disabled:opacity-100 disabled:shadow-none"
                           >
                              <CheckCircle size={16} /> {resume.status === 'Reviewed' ? 'VERIFIED' : 'INITIATE REVIEW'}
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-14 w-14 rounded-2xl bg-secondary/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 shadow-sm border border-secondary/10" 
                             onClick={() => deleteResume(resume.id)}
                           >
                              <Trash2 size={20} />
                           </Button>
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
