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
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search publications..."
                className="h-10 w-64 pl-9 bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl outline-none focus:ring-0"
              />
           </div>
           <div className="flex bg-white/10 p-1 rounded-xl">
             <Button 
               variant="ghost" 
               size="sm"
               onClick={() => setView("staff")} 
               className={`h-8 rounded-lg px-4 font-bold text-[10px] uppercase tracking-widest transition-all ${view === "staff" ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"}`}
             > 
               Staff 
             </Button>
             <Button 
               variant="ghost" 
               size="sm"
               onClick={() => setView("student")} 
               className={`h-8 rounded-lg px-4 font-bold text-[10px] uppercase tracking-widest transition-all ${view === "student" ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"}`}
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
          <Card className="rounded-[2.5rem] border-0 shadow-sm bg-secondary/10 overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-bold italic uppercase tracking-tight">
                <EditableText id="research_intake" defaultText="New Publication Intake" className="text-2xl font-bold italic uppercase tracking-tight" />
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground opacity-60">Add paper details to the institutional repository.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6">
                <Input placeholder="Research Title" value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="md:col-span-2 lg:col-span-3 h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base" />
                <Input placeholder="Author(s)" value={form.author || ""} onChange={e => setForm({ ...form, author: e.target.value })} className="lg:col-span-1 h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base"/>
                <Input placeholder="Department" value={form.department || ""} onChange={e => setForm({ ...form, department: e.target.value })} className="lg:col-span-1 h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base"/>
                <Input placeholder="Year" value={form.year || ""} onChange={e => setForm({ ...form, year: e.target.value })} className="lg:col-span-1 h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base"/>

                <Select value={form.type} onValueChange={(val) => setForm({...form, type: val})}>
                  <SelectTrigger className="lg:col-span-2 h-14 rounded-2xl bg-white border-0 shadow-sm font-medium px-6">
                    <SelectValue placeholder="Publication Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 shadow-xl">
                    <SelectItem value="Journal">Journal Article</SelectItem>
                    <SelectItem value="Conference">Conference Paper</SelectItem>
                    <SelectItem value="Thesis">Thesis</SelectItem>
                    <SelectItem value="Project">Project Report</SelectItem>
                  </SelectContent>
                </Select>

                <Input placeholder="Link (DOI / Drive)" value={form.link || ""} onChange={e => setForm({ ...form, link: e.target.value })} className="md:col-span-3 lg:col-span-4 h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base" />
                
                <Textarea placeholder="Abstract / Summary" value={form.abstract || ""} onChange={e => setForm({ ...form, abstract: e.target.value })} className="md:col-span-4 lg:col-span-6 min-h-[120px] rounded-[1.5rem] bg-white border-0 shadow-sm font-semibold text-base p-6" />
              </div>
              
              <Button 
                onClick={addResearch} 
                disabled={isSubmitting}
                className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black italic tracking-tight text-xl shadow-xl shadow-primary/20"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : (
                  <><FileText className="w-6 h-6 mr-3" /> PUBLISH TO REPOSITORY</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SEARCH & FILTER AREA */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-4">
           <div className="flex items-center gap-6">
              <EditableText id="research_collection" defaultText="Curated Collection" tag="h2" className="text-2xl font-black italic tracking-tight uppercase leading-none" />
              <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary">{filteredList.length} Papers</Badge>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex bg-secondary/10 p-1 rounded-xl">
               {["All", "Journal", "Conference", "Thesis", "Project"].map((type) => (
                 <Button
                   key={type}
                   variant="ghost"
                   size="sm"
                   onClick={() => setFilter(type)}
                   className={`h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${filter === type ? "bg-white text-primary shadow-sm" : "hover:bg-white/50 text-muted-foreground"}`}
                 >
                   {type}
                 </Button>
               ))}
             </div>
           </div>
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredList.map(r => (
            <Card key={r.id} className="rounded-[2.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full group bg-white overflow-hidden border border-transparent hover:border-primary/5">
              <CardHeader className="p-8 pb-4 space-y-4">
                <div className="flex justify-between items-start">
                   <Badge className="bg-primary/5 text-primary border-primary/10 rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">{r.type}</Badge>
                   <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <FileText className="w-5 h-5" />
                   </div>
                </div>
                <div className="space-y-1">
                   <CardTitle className="text-xl font-black tracking-tight text-gray-900 line-clamp-2 leading-tight uppercase group-hover:text-primary transition-colors">{r.title}</CardTitle>
                   <CardDescription className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest mt-2">{r.author} <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" /> {r.department} <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" /> {r.year}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-0 flex-grow">
                <div className="bg-secondary/5 p-6 rounded-[1.5rem] border border-secondary/10 group-hover:bg-white transition-colors">
                  <p className="text-sm font-medium text-muted-foreground/80 line-clamp-4 leading-relaxed italic">
                    {r.abstract || "Experimental details suppressed for public view. Institutional credentials required for full retrieval."}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="p-8 pt-0 flex justify-between gap-4">
                    <div className="flex gap-2 flex-1">
                      {r.link && (
                        <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black italic tracking-tight shadow-lg shadow-primary/20" asChild>
                          <a href={r.link} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="w-4 h-4 mr-2" />
                            RETRIEVE
                          </a>
                        </Button>
                      )}
                    </div>
                    {editingId === r.id ? (
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-primary" onClick={() => updateResearch(r.id, form)}>
                         <Check className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-all" 
                        onClick={() => {
                          setEditingId(r.id);
                          setForm(r);
                        }}
                      >
                         <Edit3 className="w-5 h-5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all" onClick={() => removeResearch(r.id)}>
                       <Trash2 className="w-5 h-5" />
                    </Button>
              </CardFooter>
              {editingId === r.id && (
                <div className="px-8 pb-8 space-y-4 bg-primary/5">
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="h-10 text-xs" placeholder="Title" />
                  <Input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="h-10 text-xs" placeholder="Author" />
                  <Button onClick={() => updateResearch(r.id, form)} className="w-full h-10 bg-primary text-white text-xs">Update Item</Button>
                </div>
              )}
            </Card>
          ))}
          
          {filteredList.length === 0 && (
            <div className="col-span-full text-center py-32 bg-secondary/5 rounded-[3rem] border-2 border-dashed border-secondary-foreground/10">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-10 text-primary" />
              <p className="text-2xl font-black italic tracking-tight text-gray-400 uppercase">Archive Empty</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-2 tracking-[0.2em]">Try adjusting your filters for better results</p>
            </div>
          )}
        </div>
      </div>
    </PageHeader>
  );
}
