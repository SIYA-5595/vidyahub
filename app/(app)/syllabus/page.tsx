"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, BookOpen, Plus, Loader2, Edit3, Check, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { EditableText } from "@/components/ui/editable-text";
import { Target as LucideTarget } from "lucide-react";


type Course = {
  id: string;
  name: string;
  code: string;
  semester: string;
  credits: string;
  overview: string;
  objectives: string;
  syllabus: string;
  exam: string;
  creatorId?: string;
};

type Material = {
  id: string;
  courseId: string;
  title: string;
  type: "Note" | "Question Paper" | "Book";
  link: string;
};

export default function AcademicCurriculumPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"staff" | "student">("staff");
  
  // -- MOCK DATA --
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- REAL-TIME LISTENERS --
  useEffect(() => {
    if (!user) {
      setCourses([]);
      return;
    }
    const q = query(collection(db, "users", user.uid, "curriculum"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Course[];
      setCourses(coursesList);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMaterials([]);
      return;
    }
    const q = query(collection(db, "users", user.uid, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const materialsList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Material[];
      setMaterials(materialsList);
    });
    return () => unsubscribe();
  }, [user]);

  // -- FORMS --
  const [newCourse, setNewCourse] = useState<Course>({
    id: "", name: "", code: "", semester: "", credits: "", overview: "", objectives: "", syllabus: "", exam: ""
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [newMaterial, setNewMaterial] = useState<{ courseId: string, title: string, type: "Note" | "Question Paper" | "Book", link: string }>({
    courseId: "", title: "", type: "Note", link: ""
  });
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // -- HANDLERS --
  const addCourse = async () => {
    if (!newCourse.name || !newCourse.code) {
      toast.error("Designation Name and System Code are required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated");
      const courseData = { ...newCourse };
      delete (courseData as { id?: string }).id;
      await addDoc(collection(db, "users", user.uid, "curriculum"), {
        ...courseData,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewCourse({ id: "", name: "", code: "", semester: "", credits: "", overview: "", objectives: "", syllabus: "", exam: "" });
      toast.success("Curriculum Blueprint Manifested");
    } catch {
      toast.error("Manifest update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCourse = async (id: string, data: Partial<Course>) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "users", user.uid, "curriculum", id);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Blueprint Updated");
      setEditingCourseId(null);
    } catch {
      toast.error("Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeCourse = async (id: string) => {
    if (!id || !user) {
      toast.error("Purge Failed");
      return;
    }
    try {
      await deleteDoc(doc(db, "users", user.uid, "curriculum", id));
      if (selectedCourse?.id === id) setSelectedCourse(null);
      toast.success("Blueprint Purged");
    } catch {
      toast.error("Manifest deletion failed");
    }
  };

  const addMaterial = async () => {
    if (!newMaterial.title || !newMaterial.courseId) {
      toast.error("Asset Label and Target Node are required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated");
      await addDoc(collection(db, "users", user.uid, "materials"), {
        ...newMaterial,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewMaterial({ ...newMaterial, title: "", type: "Note", link: "" });
      toast.success("Asset Archived Successfully");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(`Archive Failed: ${error.message || "Error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMaterial = async (id: string, data: Partial<Material>) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "users", user.uid, "materials", id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      toast.success("Asset Updated");
      setEditingMaterialId(null);
    } catch {
      toast.error("Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMaterial = async (id: string) => {
    if (!id || !user) {
      toast.error("Purge Failed");
      return;
    }
    try {
      await deleteDoc(doc(db, "users", user.uid, "materials", id));
      toast.success("Asset Removed");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(`Removal Failed: ${error.message || "Error"}`);
    }
  };

  return (
    <PageHeader
      title="Syllabus & Resources"
      description="Access curriculum blueprints and academic repositories"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <div className="flex bg-white/10 p-1 rounded-xl">
             {(["staff", "student"] as const).map((v) => (
               <Button
                 key={v}
                 variant="ghost"
                 size="sm"
                 onClick={() => setView(v)}
                 className={`h-8 rounded-lg px-4 font-bold text-[10px] uppercase tracking-widest transition-all ${view === v ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"}`}
               >
                 {v === 'staff' ? 'Architect Access' : 'Academic Intake'}
               </Button>
             ))}
           </div>
        </div>
      }
    >
      <div className="space-y-12">
        <Tabs defaultValue="syllabus" className="w-full">
          <div className="flex justify-between items-center mb-10">
             <TabsList className="bg-secondary/10 p-1 rounded-2xl">
               <TabsTrigger value="syllabus" className="rounded-xl px-10 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm transition-all">Curriculum Blueprint</TabsTrigger>
               <TabsTrigger value="repository" className="rounded-xl px-10 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg font-bold text-sm transition-all">Asset Archive</TabsTrigger>
             </TabsList>
          </div>

          {/* --- SYLLABUS TAB --- */}
          <TabsContent value="syllabus" className="space-y-12">
            {/* STAFF: ADD COURSE */}
            {view === "staff" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-[3rem] border-0 shadow-sm bg-secondary/10 overflow-hidden">
                  <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-2xl font-black italic tracking-tight uppercase">
                      <EditableText id="syllabus_init" defaultText="Blueprint Initialization" className="text-2xl font-black italic tracking-tight uppercase" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-4 space-y-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                       <div className="space-y-3 lg:col-span-2">
                          <label className="text-sm font-semibold text-gray-600 ml-2 tracking-tight">Designation Name</label>
                          <Input placeholder="Architecture of Systems" value={newCourse.name} onChange={e => {
                              const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                              setNewCourse({...newCourse, name: val});
                          }} className="h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base px-6" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-600 ml-2 tracking-tight">System Code</label>
                          <Input placeholder="SYS-404" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} className="h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base px-6" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-600 ml-2 tracking-tight">Temporal Phase</label>
                          <Input placeholder="Phase III" value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: e.target.value})} className="h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base px-6" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-600 ml-2 tracking-tight">Credit Weight</label>
                          <Input placeholder="4.0" value={newCourse.credits} onChange={e => {
                              const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                              setNewCourse({...newCourse, credits: val});
                          }} className="h-14 rounded-2xl bg-white border-0 shadow-sm font-semibold text-base px-6" />
                       </div>
                       <div className="space-y-3 lg:col-span-3">
                          <label className="text-sm font-semibold text-gray-600 ml-2 tracking-tight">Abstract Overview</label>
                          <Textarea placeholder="Define system essence..." value={newCourse.overview} onChange={e => {
                              const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, "");
                              setNewCourse({...newCourse, overview: val});
                          }} className="min-h-[120px] rounded-3xl bg-white border-0 shadow-sm font-semibold text-base p-6 resize-none" />
                       </div>
                       <div className="space-y-3 lg:col-span-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Core Objectives</label>
                          <Textarea placeholder="Establish pedagogical targets..." value={newCourse.objectives} onChange={e => {
                              const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, "");
                              setNewCourse({...newCourse, objectives: val});
                          }} className="min-h-[120px] rounded-3xl bg-white border-0 shadow-sm font-medium p-6 resize-none" />
                       </div>
                    </div>
                    <Button 
                      onClick={addCourse} 
                      disabled={isSubmitting}
                      className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black italic tracking-tight text-xl shadow-xl shadow-primary/20"
                    >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : (
                        <><Plus className="mr-3 h-6 w-6" /> MANIFEST CURRICULUM BLUEPRINT</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* COURSE LIST */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((course, i) => (
                <motion.div key={course.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card 
                    className={`rounded-[2.5rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden group relative ${selectedCourse?.id === course.id ? 'ring-4 ring-primary/20' : ''}`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <CardContent className="p-10 space-y-6">
                       <div className="flex justify-between items-start">
                          <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-black text-[10px] tracking-widest uppercase px-3 py-1">
                            {course.code}
                          </Badge>
                          {view === "staff" && (
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (editingCourseId === course.id) {
                                    setEditingCourseId(null);
                                  } else {
                                    setEditingCourseId(course.id);
                                    setNewCourse(course);
                                  }
                                }}
                              >
                                {editingCourseId === course.id ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                onClick={(e) => { e.stopPropagation(); removeCourse(course.id); }}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          )}
                       </div>
                       {editingCourseId === course.id ? (
                         <div className="space-y-4 pt-4 border-t border-dashed border-primary/10">
                            <Input value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} className="h-10 text-xs" placeholder="Name" />
                            <Input value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} className="h-10 text-xs" placeholder="Code" />
                            <Button onClick={(e) => { e.stopPropagation(); updateCourse(course.id, newCourse); }} className="w-full h-10 bg-primary text-white">
                               <Check className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                         </div>
                       ) : (
                         <>
                           <div className="space-y-2">
                              <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase leading-tight group-hover:text-primary transition-colors">{course.name}</h2>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Phase: {course.semester} • Credits: {course.credits}</p>
                           </div>
                           <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3 opacity-80">{course.overview}</p>
                           <div className="pt-4">
                              <Button variant="secondary" className="w-full h-12 rounded-2xl bg-secondary/10 hover:bg-secondary/20 font-black italic uppercase text-[10px] tracking-widest">
                                 Access Schematic
                              </Button>
                           </div>
                         </>
                       )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* DETAIL VIEW SECTION */}
            {selectedCourse && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-[3rem] border-0 shadow-2xl bg-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8">
                     <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-secondary/10" onClick={() => setSelectedCourse(null)}>
                        <Plus className="rotate-45 h-6 w-6" />
                     </Button>
                  </div>
                  <CardHeader className="p-14 pb-10 bg-secondary/5">
                    <div className="space-y-4">
                      <Badge className="bg-primary/10 text-primary border-0 rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest">{selectedCourse.code}</Badge>
                      <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">{selectedCourse.name}</h2>
                      <p className="text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground opacity-40">Full Systems Schematic Overview</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-14 space-y-14">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="p-10 rounded-[2.5rem] bg-secondary/5 space-y-6">
                        <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-4 text-primary">
                          <BookOpen className="w-7 h-7"/> 
                          <EditableText id="syllabus_core" defaultText="Core Abstract" className="text-xl font-black italic tracking-tight uppercase" />
                        </h3>
                        <p className="text-gray-600 font-medium leading-relaxed">{selectedCourse.overview}</p>
                      </div>
                      <div className="p-10 rounded-[2.5rem] bg-rose-500/5 space-y-6">
                        <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-4 text-rose-500">
                          <LucideTarget className="w-7 h-7"/> 
                          <EditableText id="syllabus_vectors" defaultText="Success Vectors" className="text-xl font-black italic tracking-tight uppercase" />
                        </h3>
                        <p className="text-gray-600 font-medium leading-relaxed">{selectedCourse.objectives}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                       <EditableText id="syllabus_segments" defaultText="Sequential Curricular Segments" tag="h3" className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50 px-4" />
                       <div className="bg-gray-900 p-12 rounded-[2.5rem] text-cyan-400 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-2xl overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-8 opacity-10">
                             <BookOpen className="w-40 h-40" />
                          </div>
                          <div className="relative z-10">
                             {selectedCourse.syllabus}
                          </div>
                       </div>
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 space-y-4">
                        <EditableText id="syllabus_verification" defaultText="Verification Matrix Pattern" tag="h3" className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 opacity-60" />
                        <p className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">{selectedCourse.exam}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* --- REPOSITORY TAB --- */}
          <TabsContent value="repository" className="space-y-12">
             {view === "staff" && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                 <Card className="rounded-[3rem] border-0 shadow-sm bg-secondary/10 overflow-hidden">
                   <CardHeader className="p-10 pb-4">
                     <CardTitle className="text-2xl font-black italic tracking-tight uppercase">
                       <EditableText id="syllabus_archive" defaultText="Archive Intake Authorization" className="text-2xl font-black italic tracking-tight uppercase" />
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="p-10 pt-4 space-y-8">
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Target Node</label>
                          <select 
                             className="flex h-14 w-full rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6 outline-none appearance-none"
                             value={newMaterial.courseId}
                             onChange={(e) => setNewMaterial({...newMaterial, courseId: e.target.value})}
                          >
                            <option value="">IDENTIFY SYSTEM</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Asset Label</label>
                          <Input placeholder="e.g. Protocol Notes III" value={newMaterial.title} onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})} className="h-14 rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Payload Categorization</label>
                          <select 
                             className="flex h-14 w-full rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6 outline-none appearance-none"
                             value={newMaterial.type}
                             onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value as Material["type"]})}
                          >
                            <option value="Note">TECHNICAL DATA</option>
                            <option value="Question Paper">VERIFICATION HISTORY</option>
                            <option value="Book">CORE ENCYCLOPEDIA</option>
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Sync Link</label>
                          <div className="flex gap-4">
                             <Input placeholder="https://sync.nexus/asset" value={newMaterial.link} onChange={(e) => setNewMaterial({...newMaterial, link: e.target.value})} className="h-14 rounded-2xl bg-white border-0 shadow-sm font-black text-sm px-6 flex-1" />
                             <Button 
                                onClick={addMaterial} 
                                disabled={isSubmitting}
                                className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 shrink-0"
                             >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : <Plus className="h-6 w-6" />}
                             </Button>
                          </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
             )}

             <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {materials.map((mat, i) => {
                 const courseName = courses.find(c => c.id === mat.courseId)?.name || "Void Sequence";
                 return (
                   <motion.div key={mat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                     <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                       <CardContent className="p-10 flex flex-col gap-6 min-h-[200px] justify-between">
                         <div className="space-y-4">
                           <div className="flex justify-between items-center">
                              <Badge variant="outline" className={`rounded-lg border-0 font-black text-[9px] tracking-[0.2em] uppercase px-3 py-1 ${mat.type === 'Question Paper' ? 'bg-rose-500/10 text-rose-500' : mat.type === 'Book' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {mat.type}
                              </Badge>
                              {view === "staff" && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all" 
                                    onClick={() => {
                                      if (editingMaterialId === mat.id) {
                                        setEditingMaterialId(null);
                                      } else {
                                        setEditingMaterialId(mat.id);
                                        setNewMaterial(mat);
                                      }
                                    }}
                                  >
                                    {editingMaterialId === mat.id ? <X className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all" onClick={() => removeMaterial(mat.id)}>
                                    <Trash2 className="w-4 h-4"/>
                                  </Button>
                                </div>
                              )}
                           </div>
                           {editingMaterialId === mat.id ? (
                             <div className="space-y-2">
                                <Input value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="h-8 text-[10px]" />
                                <Button onClick={() => updateMaterial(mat.id, newMaterial)} className="w-full h-8 bg-primary text-white text-[10px]">
                                   Save
                                </Button>
                             </div>
                           ) : (
                             <div className="space-y-1">
                                <h4 className="font-black italic text-xl tracking-tighter uppercase leading-tight text-gray-900 group-hover:text-primary transition-colors">{mat.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{courseName}</p>
                             </div>
                           )}
                         </div>
                         <Button variant="secondary" className="w-full h-12 rounded-2xl bg-secondary/10 hover:bg-secondary/20 font-black italic uppercase text-[10px] tracking-widest group" asChild>
                           <a href={mat.link} target="_blank" rel="noopener noreferrer">
                             Initiate Sync <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                           </a>
                         </Button>
                       </CardContent>
                     </Card>
                   </motion.div>
                 )
               })}
               {materials.length === 0 && (
                 <div className="col-span-full py-40 flex flex-col items-center justify-center bg-secondary/5 rounded-[3rem] border-4 border-dashed border-secondary/20">
                   <BookOpen className="w-24 h-24 mb-6 text-muted-foreground opacity-10"/>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Void Archive: Zero assets identified</p>
                 </div>
               )}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageHeader>
  );
}

