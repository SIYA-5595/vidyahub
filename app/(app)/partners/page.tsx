"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import {
  Users,
  Trash2,
  Clock,
  Terminal,
  Loader2,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type Tab = "projects" | "post";

type Project = {
  id: string;
  title: string;
  domain: string;
  skills: string;
  teamSize: number;
  members: number;
  creatorId: string;
};

export default function ProjectPartners() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("projects");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [skills, setSkills] = useState("");
  const [teamSize, setTeamSize] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[]);
    });
    return () => unsubscribe();
  }, []);

  const postProject = async () => {
    if (!title || !domain || !skills || !teamSize) {
      toast.error("Manifest requires mission parameters");
      return;
    }
    
    if (!user) {
      toast.error("Authentication required for deployment");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "projects"), {
        title,
        domain,
        skills,
        teamSize: Number(teamSize),
        members: 1,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDomain("");
      setSkills("");
      setTeamSize("");
      setTab("projects");
      toast.success("Mission broadcast successfully");
    } catch {
       toast.error("Deployment sequence failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    if (project.members < project.teamSize) {
      try {
        await updateDoc(doc(db, "projects", id), {
          members: project.members + 1
        });
        toast.success("Synergy link established");
      } catch {
        toast.error("Synergy link failed");
      }
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.success("Mission purged from registry");
    } catch {
      toast.error("Purge failed");
    }
  };

  return (
    <PageHeader
      title="Synergy Core"
      description="Collaborative cross-domain technical alliances and architectural peer matching for elite development squads"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="flex bg-white/10 p-1 rounded-xl">
             {(["projects", "post"] as Tab[]).map((t) => (
               <Button
                 key={t}
                 variant="ghost"
                 size="sm"
                 onClick={() => setTab(t)}
                 className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-widest transition-all ${tab === t ? "bg-white text-primary shadow-xl" : "text-white/40 hover:text-white"}`}
               >
                 {t === 'projects' ? 'ALLIANCES' : 'DEPLOY'}
               </Button>
             ))}
           </div>
           <Button className="h-11 px-8 bg-primary text-primary hover:bg-white/90 hover:text-primary rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95">
            <Users className="w-4 h-4" />
            GLOBAL FEED
          </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {/* ================= PROJECT LIST ================= */}
        {tab === "projects" && (
          <div className="grid gap-10 md:grid-cols-2">
            {projects.map((project: Project, i: number) => {
              const isFull = project.members >= project.teamSize;
              const progress = (project.members / project.teamSize) * 100;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -12 }}
                >
                  <Card className="rounded-[3.5rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden group relative">
                    <CardContent className="p-10 space-y-10 flex flex-col h-full">
                       <div className="flex justify-between items-start">
                          <div className="space-y-3">
                             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">{project.domain}</p>
                             <h2 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase flex items-center gap-4 group-hover:text-primary transition-colors leading-none">
                               <Terminal size={32} className="text-primary group-hover:rotate-12 transition-transform duration-700" />
                               {project.title}
                             </h2>
                          </div>
                          <Badge className={`${isFull ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'} border-0 h-8 px-5 rounded-xl text-[10px] font-black italic uppercase tracking-widest shadow-lg`}>
                            {isFull ? "MANNING COMPLETE" : "SLOTS SYNCED"}
                          </Badge>
                       </div>

                       <div className="space-y-6">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black uppercase text-muted-foreground opacity-40 tracking-[0.2em] italic">Tactical deployment progress</p>
                             <p className="text-2xl font-black italic tracking-tighter text-red">{project.members} / {project.teamSize}</p>
                          </div>
                          <div className="h-2.5 w-full bg-secondary/5 rounded-full overflow-hidden border border-secondary/10">
                             <motion.div
                               initial={{ width: 0 }}
                               animate={{ width: `${progress}%` }}
                               className={`h-full ${isFull ? 'bg-rose-500' : 'bg-primary'}`}
                             />
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-2.5">
                          {project.skills.split(',').map((skill, idx) => (
                             <Badge key={idx} variant="secondary" className="rounded-xl font-black italic text-[9px] uppercase tracking-widest px-4 py-1.5 bg-secondary/5 text-muted-foreground border border-secondary/10 shadow-sm group-hover:bg-white transition-colors duration-500">
                               {skill.trim()}
                             </Badge>
                          ))}
                       </div>

                       <div className="flex gap-4 pt-6 border-t border-secondary/5 mt-auto">
                          <Button
                            disabled={isFull}
                            onClick={() => joinProject(project.id)}
                            className={`flex-1 h-16 rounded-[1.5rem] font-black italic tracking-tighter text-lg shadow-xl transition-all relative overflow-hidden group/btn ${isFull ? 'bg-secondary/20 text-muted-foreground shadow-none' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'}`}
                          >
                             <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
                            {isFull ? "CAPACITY REACHED" : "INITIALIZE SYNERGY"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-16 w-16 rounded-[1.5rem] bg-secondary/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 shadow-sm border border-secondary/10"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 size={24} />
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ================= POST PROJECT ================= */}
        {tab === "post" && (
          <Card className="rounded-[3.5rem] border-0 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <CardHeader className="p-10 pb-6">
               <div className="space-y-1">
                  <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Mission Deployment</CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 ml-1">Archive project parameters for global propagation</p>
               </div>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Objective nomenclature</Label>
                   <Input
                     placeholder="E.G. PROJECT 'ARES' CORE"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Vertical Sector</Label>
                   <Input
                     placeholder="E.G. NEURAL ARCHITECTURES"
                     value={domain}
                     onChange={(e) => setDomain(e.target.value)}
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Required Protocol Stack</Label>
                   <Input
                     placeholder="E.G. RUST, WASM, NVIDIA GRID"
                     value={skills}
                     onChange={(e) => setSkills(e.target.value)}
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Squad saturation point</Label>
                   <Input
                     type="number"
                     placeholder="MAX OPERATIVES"
                     value={teamSize}
                     onChange={(e) => setTeamSize(e.target.value)}
                     className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:opacity-20"
                   />
                </div>
              </div>

              <Button onClick={postProject} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2.5rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                {isSubmitting ? <Loader2 size={28} className="animate-spin" /> : <Clock size={28} className="mr-5 group-hover:rotate-12 transition-transform duration-500" />}
                {isSubmitting ? "DEPLOYING..." : "BROADCAST ALLIANCE OPPORTUNITY"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageHeader>
  );
}
