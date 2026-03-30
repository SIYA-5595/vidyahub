"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
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
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 shadow-premium">
            <div className="flex bg-background/40 p-1 rounded-xl shadow-inner border border-white/5">
              {(["projects", "post"] as Tab[]).map((t) => (
                <Button
                  key={t}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTab(t)}
                  className={`h-10 rounded-lg px-8 font-black text-[10px] uppercase tracking-widest transition-all italic ${tab === t ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
                >
                  {t === 'projects' ? 'ALLIANCES' : 'DEPLOY'}
                </Button>
              ))}
            </div>
            <Button className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 border-none">
             <Users className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -12 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <Card className="rounded-[3.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 overflow-hidden group relative">
                    <CardContent className="p-10 space-y-10 flex flex-col h-full">
                       <div className="flex justify-between items-start">
                          <div className="space-y-3">
                             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">{project.domain}</p>
                             <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase flex items-center gap-4 group-hover:text-primary transition-colors leading-none">
                               <Terminal size={32} className="text-primary group-hover:rotate-12 transition-transform duration-700" />
                               {project.title}
                             </h2>
                          </div>
                          <Badge className={`${isFull ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'} border border-white/5 h-8 px-6 rounded-xl text-[10px] font-black italic uppercase tracking-widest shadow-inner`}>
                            {isFull ? "MANNING COMPLETE" : "SLOTS SYNCED"}
                          </Badge>
                       </div>

                       <div className="space-y-6">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] italic leading-none">Tactical deployment progress</p>
                             <p className="text-2xl font-black italic tracking-tighter text-primary leading-none">{project.members} / {project.teamSize}</p>
                          </div>
                          <div className="h-3 w-full bg-background/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                             <motion.div
                               initial={{ width: 0 }}
                               animate={{ width: `${progress}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className={`h-full ${isFull ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]'}`}
                             />
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-2.5">
                          {project.skills.split(',').map((skill, idx) => (
                             <Badge key={idx} variant="secondary" className="rounded-xl font-black italic text-[9px] uppercase tracking-widest px-4 py-2 bg-background/50 text-foreground border border-white/5 shadow-inner hover:bg-background transition-all duration-500">
                               {skill.trim()}
                             </Badge>
                          ))}
                       </div>

                       <div className="flex gap-4 pt-8 border-t border-white/5 mt-auto">
                          <Button
                            disabled={isFull}
                            onClick={() => joinProject(project.id)}
                            className={`flex-1 h-16 rounded-2xl font-black italic tracking-widest text-[10px] uppercase shadow-2xl transition-all relative overflow-hidden group/btn border-none active:scale-95 ${isFull ? 'bg-background/20 text-muted-foreground opacity-50' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30'}`}
                          >
                             <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                            {isFull ? "CAPACITY REACHED" : "INITIALIZE SYNERGY"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-16 w-16 rounded-2xl bg-background/40 text-rose-500 border border-white/5 hover:bg-rose-500/20 transition-all transform hover:rotate-12 shadow-inner"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 size={26} />
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
          <Card className="rounded-[3.5rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700">
            <CardHeader className="p-10 pb-6">
               <div className="space-y-1">
                  <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-foreground leading-none">Mission Deployment</CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-1 italic">Archive project parameters for global propagation</p>
               </div>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Objective nomenclature</Label>
                   <Input
                     placeholder="E.G. PROJECT 'ARES' CORE"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:text-muted-foreground/10 text-foreground"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Vertical Sector</Label>
                   <Input
                     placeholder="E.G. NEURAL ARCHITECTURES"
                     value={domain}
                     onChange={(e) => setDomain(e.target.value)}
                     className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:text-muted-foreground/10 text-foreground"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Required Protocol Stack</Label>
                   <Input
                     placeholder="E.G. RUST, WASM, NVIDIA GRID"
                     value={skills}
                     onChange={(e) => setSkills(e.target.value)}
                     className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:text-muted-foreground/10 text-foreground"
                   />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Squad saturation point</Label>
                   <Input
                     type="number"
                     placeholder="MAX OPERATIVES"
                     value={teamSize}
                     onChange={(e) => setTeamSize(e.target.value)}
                     className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tight focus:ring-2 focus:ring-primary/20 transition-all px-8 placeholder:text-muted-foreground/10 text-foreground"
                   />
                </div>
              </div>

              <Button onClick={postProject} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group relative overflow-hidden border-none text-center">
                <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                {isSubmitting ? <Loader2 size={28} className="animate-spin" /> : <Clock size={32} className="mr-5 group-hover:rotate-12 transition-transform duration-700" />}
                {isSubmitting ? "DEPLOYING..." : "BROADCAST ALLIANCE OPPORTUNITY"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageHeader>
  );
}
