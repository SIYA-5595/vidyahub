"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Link as LinkIcon, FileText, Search, Loader2, Edit3, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { EditableText } from "@/components/ui/editable-text";

import { useAuth } from "@/lib/auth-context";

type Research = {
  id: string;
  title: string;
  author: string;
  department: string;
  type: string;
  year: string;
  abstract: string;
  link: string;
  creatorId?: string;
};

export default function ResearchRepository() {
  const { user } = useAuth();
  const [view, setView] = useState<"staff" | "student">("staff");
  const [filter, setFilter] = useState("All");

  const [researchList, setResearchList] = useState<Research[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // -- REAL-TIME LISTENER --
  useEffect(() => {
    if (!user) {
      setResearchList([]);
      return;
    }
    const q = query(collection(db, "users", user.uid, "research"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const researchData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Research[];
      setResearchList(researchData);
    });
    return () => unsubscribe();
  }, [user]);

  const [form, setForm] = useState<Research>({
    id: "", title: "", author: "", department: "", type: "", year: "", abstract: "", link: ""
  });

  const addResearch = async () => {
    if (!user) return;
    if (!form.title || !form.author) {
      toast.error("Research Title and Author(s) are required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const data = { ...form };
      delete (data as { id?: string }).id;
      await addDoc(collection(db, "users", user.uid, "research"), {
        ...data,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setForm({ id: "", title: "", author: "", department: "", type: "", year: "", abstract: "", link: "" });
      toast.success("Publication Synced to Repository");
    } catch {
      toast.error("Synchronization Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateResearch = async (id: string, data: Partial<Research>) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "users", user.uid, "research", id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      toast.success("Publication Updated");
      setEditingId(null);
    } catch {
      toast.error("Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeResearch = async (id: string) => {
    if (!user || !id) {
      toast.error("Purge Failed");
      return;
    }
    try {
      await deleteDoc(doc(db, "users", user.uid, "research", id));
      toast.success("Publication Purged");
    } catch {
       toast.error("Institutional clearing failed");
    }
  };

  const filteredList = filter === "All" ? researchList : researchList.filter(r => r.type === filter);

  return (
    <PageHeader
      title="Research Innovation Hub"
      description="Centralized repository for academic publications, pre-prints, and collaborative projects"
      actions={
        <div className="flex bg-background/50 p-1.5 rounded-2xl backdrop-blur-md border border-border/20 gap-3">
           <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input
                placeholder="Search publications..."
                className="h-10 w-64 pl-10 bg-white/5 border-border/20 text-foreground placeholder:text-muted-foreground/30 rounded-xl outline-none focus:ring-0"
              />
           </div>
           <div className="flex bg-white/5 p-1 rounded-xl">
             <Button 
               variant="ghost" 
               size="sm"
               onClick={() => setView("staff")} 
               className={`h-8 rounded-lg px-4 font-black text-[10px] uppercase tracking-widest transition-all ${view === "staff" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground/60 hover:text-foreground"}`}
             > 
               Staff 
             </Button>
             <Button 
               variant="ghost" 
               size="sm"
               onClick={() => setView("student")} 
               className={`h-8 rounded-lg px-4 font-black text-[10px] uppercase tracking-widest transition-all ${view === "student" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground/60 hover:text-foreground"}`}
             > 
               Student 
             </Button>
           </div>
        </div>
      }
    >
      <div className="space-y-12">
        {/* STAFF UPLOAD */}
        {view === "staff" && (
          <Card className="rounded-[2.5rem] border border-border shadow-premium bg-card overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-foreground">
                <EditableText id="research_intake" defaultText="New Publication Intake" className="text-2xl font-black italic uppercase tracking-tight text-foreground" />
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground/60 uppercase text-[10px] tracking-widest opacity-60">Add paper details to the institutional repository.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6">
                <Input placeholder="Research Title" value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="md:col-span-2 lg:col-span-3 h-14 rounded-2xl bg-background/50 border border-border shadow-inner font-black italic text-base uppercase tracking-tight text-foreground"/>
                <Input placeholder="Author(s)" value={form.author || ""} onChange={e => setForm({ ...form, author: e.target.value })} className="lg:col-span-1 h-14 rounded-2xl bg-background/50 border border-border shadow-inner font-black italic text-base uppercase tracking-tight text-foreground"/>
                <Input placeholder="Department" value={form.department || ""} onChange={e => setForm({ ...form, department: e.target.value })} className="lg:col-span-1 h-14 rounded-2xl bg-background/50 border border-border shadow-inner font-black italic text-base uppercase tracking-tight text-foreground"/>
                <Input placeholder="Year" value={form.year || ""} onChange={e => setForm({ ...form, year: e.target.value })} className="lg:col-span-1 h-14 rounded-2xl bg-background/50 border border-border shadow-inner font-black italic text-base uppercase tracking-tight text-foreground"/>

                <Select value={form.type} onValueChange={(val) => setForm({...form, type: val})}>
                  <SelectTrigger className="lg:col-span-2 h-14 rounded-2xl bg-background/50 border border-border shadow-inner font-black italic text-sm tracking-widest uppercase transition-all text-foreground px-6">
                    <SelectValue placeholder="Publication Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-border bg-card shadow-xl">
                    <SelectItem value="Journal">Journal Article</SelectItem>
                    <SelectItem value="Conference">Conference Paper</SelectItem>
                    <SelectItem value="Thesis">Thesis</SelectItem>
                    <SelectItem value="Project">Project Report</SelectItem>
                  </SelectContent>
                </Select>

                <Input placeholder="Link (DOI / Drive)" value={form.link || ""} onChange={e => setForm({ ...form, link: e.target.value })} className="md:col-span-3 lg:col-span-4 h-14 rounded-2xl bg-background/50 border border-border shadow-inner font-black italic text-base uppercase tracking-tight text-foreground" />
                
                <Textarea placeholder="Abstract / Summary" value={form.abstract || ""} onChange={e => setForm({ ...form, abstract: e.target.value })} className="md:col-span-4 lg:col-span-6 min-h-[140px] rounded-[1.5rem] bg-background/50 border border-border shadow-inner font-black italic text-base p-6 text-foreground" />
              </div>
              
              <Button 
                onClick={addResearch} 
                disabled={isSubmitting}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black italic tracking-tighter text-xl shadow-xl shadow-primary/20 border-none transition-all"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-foreground" /> : (
                  <><FileText className="w-6 h-6 mr-3" /> PUBLISH TO REPOSITORY</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SEARCH & FILTER AREA */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-4">
           <div className="flex items-center gap-6">
              <EditableText id="research_collection" defaultText="Curated Collection" tag="h2" className="text-2xl font-black italic tracking-tighter uppercase leading-none text-foreground" />
              <Badge variant="outline" className="rounded-full px-6 py-1 border-primary/20 bg-primary/10 text-primary font-black italic uppercase text-[10px] tracking-widest leading-none">{filteredList.length} Papers</Badge>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex bg-background/50 p-1.5 rounded-xl border border-border/20">
               {["All", "Journal", "Conference", "Thesis", "Project"].map((type) => (
                 <Button
                   key={type}
                   variant="ghost"
                   size="sm"
                   onClick={() => setFilter(type)}
                   className={`h-9 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${filter === type ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-white/5 text-muted-foreground/60"}`}
                 >
                   {type}
                 </Button>
               ))}
             </div>
           </div>
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredList.map(r => (
            <Card key={r.id} className="rounded-[2.5rem] border border-border shadow-premium hover:shadow-2xl transition-all duration-700 flex flex-col h-full group bg-card transition-colors">
              <CardHeader className="p-8 pb-4 space-y-6">
                <div className="flex justify-between items-start">
                   <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">{r.type}</Badge>
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-inner">
                      <FileText className="w-6 h-6" />
                   </div>
                </div>
                <div className="space-y-2">
                   <CardTitle className="text-xl font-black italic tracking-tighter text-foreground line-clamp-2 leading-tight uppercase group-hover:text-primary transition-colors">{r.title}</CardTitle>
                   <CardDescription className="flex flex-wrap items-center gap-2 font-black text-muted-foreground/60 text-[10px] uppercase tracking-widest mt-4">
                     {r.author} 
                     <span className="w-1 h-1 bg-primary/30 rounded-full" /> 
                     {r.department} 
                     <span className="w-1 h-1 bg-primary/30 rounded-full" /> 
                     {r.year}
                   </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-0 flex-grow">
                <div className="bg-background/50 p-6 rounded-[2rem] border border-border group-hover:bg-background/20 transition-colors">
                  <p className="text-sm font-black italic text-muted-foreground/80 line-clamp-4 leading-relaxed uppercase tracking-tight">
                    {r.abstract || "Experimental details suppressed for public view. Institutional credentials required for full retrieval."}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="p-8 pt-0 flex justify-between gap-4">
                    <div className="flex gap-2 flex-1">
                      {r.link && (
                        <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black italic tracking-tight shadow-xl shadow-primary/20 border-none transition-all" asChild>
                          <a href={r.link} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="w-4 h-4 mr-3" />
                            RETRIEVE
                          </a>
                        </Button>
                      )}
                    </div>
                    {editingId === r.id ? (
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-primary bg-white/5 hover:bg-white/10" onClick={() => updateResearch(r.id, form)}>
                         <Check className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl text-primary bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-sm" 
                        onClick={() => {
                          setEditingId(r.id);
                          setForm(r);
                        }}
                      >
                         <Edit3 className="w-5 h-5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-500 bg-white/5 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all shadow-sm" onClick={() => removeResearch(r.id)}>
                       <Trash2 className="w-5 h-5" />
                    </Button>
              </CardFooter>
              {editingId === r.id && (
                <div className="px-8 pb-8 space-y-4 bg-background/50 pt-8 border-t border-border/20">
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="h-12 text-xs font-black italic uppercase bg-background border-border text-foreground" placeholder="Title" />
                  <Input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="h-12 text-xs font-black italic uppercase bg-background border-border text-foreground" placeholder="Author" />
                  <Button onClick={() => updateResearch(r.id, form)} className="w-full h-12 bg-primary text-primary-foreground font-black italic text-xs uppercase shadow-lg border-none">Update Item</Button>
                </div>
              )}
            </Card>
          ))}
          
          {filteredList.length === 0 && (
            <div className="col-span-full text-center py-40 bg-white/5 rounded-[4rem] border-4 border-dashed border-border/20">
              <Search className="w-24 h-24 mx-auto mb-8 text-primary opacity-10" />
              <p className="text-3xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Archive Empty</p>
              <p className="text-[10px] font-black text-muted-foreground/20 uppercase opacity-40 mt-4 tracking-[0.4em]">Try adjusting your filters for better results</p>
            </div>
          )}
        </div>
      </div>
    </PageHeader>
  );
}
