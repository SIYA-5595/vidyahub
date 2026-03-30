"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, BookOpen, Plus, Loader2, Edit3, Check, X, FileText, Download, LayoutGrid, Target, GraduationCap, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

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

export default function SyllabusPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"staff" | "student">("student");
  const [activeTab, setActiveTab] = useState("syllabus");
  const [mounted, setMounted] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!user) return;

    // Courses listener
    const qCourses = query(collection(db, "users", user.uid, "curriculum"), orderBy("createdAt", "desc"));
    const unsubCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Course[]);
    });

    // Materials listener
    const qMaterials = query(collection(db, "users", user.uid, "materials"), orderBy("createdAt", "desc"));
    const unsubMaterials = onSnapshot(qMaterials, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Material[]);
    });

    return () => {
      unsubCourses();
      unsubMaterials();
    };
  }, [user]);

  // Form States
  const [newCourse, setNewCourse] = useState<Course>({
    id: "", name: "", code: "", semester: "", credits: "", overview: "", objectives: "", syllabus: "", exam: ""
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [newMaterial, setNewMaterial] = useState<{ courseId: string, title: string, type: "Note" | "Question Paper" | "Book", link: string }>({
    courseId: "", title: "", type: "Note", link: ""
  });

  // Handlers
  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code) {
      toast.error("Course name and code are required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthenticated");
      const courseData = { ...newCourse };
      delete (courseData as any).id;
      
      await addDoc(collection(db, "users", user.uid, "curriculum"), {
        ...courseData,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewCourse({ id: "", name: "", code: "", semester: "", credits: "", overview: "", objectives: "", syllabus: "", exam: "" });
      toast.success("Course added to curriculum");
    } catch (error) {
      toast.error("Failed to add course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (id: string, data: Partial<Course>) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "users", user.uid, "curriculum", id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      toast.success("Course details updated");
      setEditingCourseId(null);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCourse = async (id: string) => {
    if (!user || !id) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "curriculum", id));
      if (selectedCourse?.id === id) setSelectedCourse(null);
      toast.success("Course removed from curriculum");
    } catch (error) {
      toast.error("Failed to remove course");
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title || !newMaterial.courseId) {
      toast.error("Title and course selection are required");
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
      toast.success("Resource added successfully");
    } catch (error) {
      toast.error("Failed to add resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMaterial = async (id: string) => {
    if (!user || !id) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "materials", id));
      toast.success("Resource removed");
    } catch (error) {
      toast.error("Failed to remove resource");
    }
  };

  if (!mounted) return null;

  return (
    <PageHeader
      title="Course Materials"
      description="Access your course syllabus, lecture notes, and study resources in one place."
      actions={
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-muted-foreground/10">
          <Button
            variant={view === "student" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("student")}
            className="rounded-lg text-xs font-semibold h-8"
          >
            Student View
          </Button>
          <Button
            variant={view === "staff" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("staff")}
            className="rounded-lg text-xs font-semibold h-8"
          >
            Staff Actions
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card/50 p-1 rounded-xl border border-muted/50 shadow-sm mb-8 w-full sm:w-auto h-auto grid grid-cols-2">
            <TabsTrigger value="syllabus" className="rounded-lg py-2.5 px-8 font-bold text-xs gap-2">
              <BookOpen className="h-4 w-4" />
              Course Syllabus
            </TabsTrigger>
            <TabsTrigger value="repository" className="rounded-lg py-2.5 px-8 font-bold text-xs gap-2">
              <FileText className="h-4 w-4" />
              Study Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="syllabus" className="space-y-8">
            {/* Staff: Add Course Form */}
            {view === "staff" && !selectedCourse && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
                  <CardHeader className="p-6 border-b border-muted/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Add New Course
                    </CardTitle>
                    <CardDescription className="text-xs">Initialise a new course module in the student portal curriculum.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       <div className="lg:col-span-2 space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Course Name</Label>
                          <Input placeholder="e.g. Operating Systems" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} className="h-11 rounded-xl bg-muted/20" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Course Code</Label>
                          <Input placeholder="e.g. CS-202" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} className="h-11 rounded-xl bg-muted/20" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Semester</Label>
                          <Input placeholder="e.g. Semester 3" value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: e.target.value})} className="h-11 rounded-xl bg-muted/20" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Credits</Label>
                          <Input placeholder="e.g. 4.0" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})} className="h-11 rounded-xl bg-muted/20" />
                       </div>
                       <div className="lg:col-span-4 space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Course Overview</Label>
                          <Textarea placeholder="Describe the course goals and content..." value={newCourse.overview} onChange={e => setNewCourse({...newCourse, overview: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/20 resize-none" />
                       </div>
                    </div>
                    <Button onClick={handleAddCourse} disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold gap-2">
                       {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" /> Add Course to Curriculum</>}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Course Grid */}
            {!selectedCourse && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, i) => (
                  <motion.div key={course.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="group">
                    <Card 
                      className="rounded-2xl border-none shadow-sm bg-card hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-transparent hover:border-primary/20 h-full flex flex-col"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary" className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-primary bg-primary/10 border-none">
                              {course.code}
                            </Badge>
                            {view === "staff" && (
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => { e.stopPropagation(); handleRemoveCourse(course.id); }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                         </div>
                         <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{course.name}</h3>
                         <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground mb-4">
                            <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {course.semester}</span>
                            <span className="flex items-center gap-1"><LayoutGrid className="h-3 w-3" /> {course.credits} Credits</span>
                         </div>
                         <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">{course.overview}</p>
                         <div className="mt-auto pt-4 border-t border-muted/50 flex items-center justify-between text-primary font-bold text-xs group-hover:gap-1 transition-all">
                            <span>View Syllabus</span>
                            <ChevronRight className="h-4 w-4" />
                         </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {courses.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-muted/50 rounded-2xl bg-muted/5">
                      <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1">No Courses Found</h3>
                      <p className="text-xs text-muted-foreground">The academic curriculum has not been populated yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Detail View */}
            {selectedCourse && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="h-9 rounded-lg text-xs font-semibold gap-2 mb-2 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 rotate-180" /> Back to All Courses
                </Button>
                
                <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
                  <CardHeader className="p-8 md:p-12 bg-muted/30 border-b border-muted/50">
                    <div className="space-y-4">
                      <Badge className="bg-primary/10 text-primary border-none rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{selectedCourse.code}</Badge>
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">{selectedCourse.name}</h2>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Offered In</span>
                            <span className="text-sm font-semibold">{selectedCourse.semester}</span>
                        </div>
                        <div className="h-8 w-px bg-muted-foreground/20" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Credit Load</span>
                            <span className="text-sm font-semibold">{selectedCourse.credits} Units</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 md:p-12 space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-primary uppercase">
                          <Target className="h-4 w-4" /> Course Overview
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">{selectedCourse.overview}</p>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-primary uppercase">
                          <GraduationCap className="h-4 w-4" /> Learning Objectives
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.objectives}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                       <h3 className="text-sm font-bold flex items-center gap-2 text-primary uppercase border-b border-muted pb-4">
                         <BookOpen className="h-4 w-4" /> Detailed Syllabus
                       </h3>
                       <div className="bg-muted/30 p-8 rounded-2xl text-foreground text-sm leading-relaxed whitespace-pre-wrap font-medium border border-muted/50">
                          {selectedCourse.syllabus || "Detailed syllabus content not provided yet."}
                       </div>
                    </div>

                    <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Examination Pattern</h3>
                            <p className="text-base font-bold text-foreground">{selectedCourse.exam || "Standard University Pattern"}</p>
                        </div>
                        <Check className="h-6 w-6 text-amber-500/40" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="repository" className="space-y-8">
             {/* Staff: Add Material Form */}
             {view === "staff" && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
                   <CardHeader className="p-6 border-b border-muted/50">
                     <CardTitle className="text-lg font-bold flex items-center gap-2">
                       <Plus className="h-5 w-5 text-primary" />
                       Add Study Resource
                     </CardTitle>
                     <CardDescription className="text-xs">Upload links to lecture notes, books, or question papers.</CardDescription>
                   </CardHeader>
                   <CardContent className="p-6 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Related Course</Label>
                          <select 
                             className="flex h-11 w-full rounded-xl bg-muted/20 border border-muted-foreground/10 text-xs font-semibold px-4 outline-none focus:ring-2 focus:ring-primary/20"
                             value={newMaterial.courseId}
                             onChange={(e) => setNewMaterial({...newMaterial, courseId: e.target.value})}
                          >
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Resource Title</Label>
                          <Input placeholder="e.g. Unit 1 Notes" value={newMaterial.title} onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})} className="h-11 rounded-xl bg-muted/20" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Type</Label>
                          <select 
                             className="flex h-11 w-full rounded-xl bg-muted/20 border border-muted-foreground/10 text-xs font-semibold px-4 outline-none focus:ring-2 focus:ring-primary/20"
                             value={newMaterial.type}
                             onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value as any})}
                          >
                            <option value="Note">Lecture Note</option>
                            <option value="Question Paper">Question Paper</option>
                            <option value="Book">E-Book</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground ml-1">Resource Link</Label>
                          <Input placeholder="https://drive.google.com/..." value={newMaterial.link} onChange={(e) => setNewMaterial({...newMaterial, link: e.target.value})} className="h-11 rounded-xl bg-muted/20" />
                       </div>
                     </div>
                     <Button onClick={handleAddMaterial} disabled={isSubmitting} className="w-full h-11 rounded-xl font-bold gap-2">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add to Repository</>}
                     </Button>
                   </CardContent>
                 </Card>
               </motion.div>
             )}

             {/* Materials Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {materials.map((mat, i) => {
                 const course = courses.find(c => c.id === mat.courseId);
                 return (
                   <motion.div key={mat.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="group">
                     <Card className="rounded-2xl border-none shadow-sm bg-card hover:shadow-md transition-all duration-300 overflow-hidden border border-transparent hover:border-primary/20 flex flex-col h-full">
                       <CardContent className="p-6 flex flex-col flex-1">
                          <div className="flex justify-between items-center mb-4">
                             <Badge variant="outline" className={cn(
                               "rounded-lg px-2 py-0.5 text-[10px] font-bold border-none",
                               mat.type === "Question Paper" ? "bg-rose-500/10 text-rose-600" :
                               mat.type === "Book" ? "bg-indigo-500/10 text-indigo-600" :
                               "bg-emerald-500/10 text-emerald-600"
                             )}>
                               {mat.type}
                             </Badge>
                             {view === "staff" && (
                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleRemoveMaterial(mat.id)}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             )}
                          </div>
                          <div className="space-y-1 mb-6">
                             <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{mat.title}</h4>
                             <p className="text-[10px] font-semibold text-muted-foreground uppercase opacity-70 truncate">{course?.name || "Independent Resource"}</p>
                          </div>
                          <Button variant="secondary" className="mt-auto h-10 w-full rounded-xl bg-muted/40 hover:bg-primary hover:text-primary-foreground border-none text-[11px] font-bold gap-2 transition-all shadow-sm group/dl" asChild>
                            <a href={mat.link} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3.5 w-3.5 group-hover/dl:-translate-y-0.5 transition-transform" />
                              Download Asset
                            </a>
                          </Button>
                       </CardContent>
                     </Card>
                   </motion.div>
                 );
               })}
               {materials.length === 0 && (
                 <div className="col-span-full py-24 text-center border-2 border-dashed border-muted/50 rounded-2xl bg-muted/5">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm font-bold text-foreground mb-1">Resource Repository is Empty</p>
                    <p className="text-xs text-muted-foreground">Study materials will appear here once faculty uploads them.</p>
                 </div>
               )}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageHeader>
  );
}
