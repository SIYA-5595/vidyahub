"use client"; // Required for client-side components in Next.js 13+

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, TrendingUp, Award, Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { EditableText } from "@/components/ui/editable-text";


interface Course {
  id: number;
  name: string;
  credits: number;
  grade: string;
}

const gradePoints: Record<string, number> = {
  "A+": 10,
  A: 9,
  "A-": 8.5,
  "B+": 8,
  B: 7,
  "B-": 6.5,
  "C+": 6,
  C: 5,
  D: 4,
  F: 0,
};

const grades = Object.keys(gradePoints);

const initialCourses: Course[] = [];

export default function GPACalculator() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [previousCGPA, setPreviousCGPA] = useState("");
  const [previousCredits, setPreviousCredits] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load GPA data from Firestore
  useEffect(() => {
    const loadGPAData = async () => {
      if (!user) {
        return;
      }

      try {
        const docRef = doc(db, "gpa-data", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourses(data.courses || []);
          setPreviousCGPA(data.previousCGPA || "");
          setPreviousCredits(data.previousCredits || "");
        }
      } catch (error) {
        console.error("Error loading GPA data:", error);
      } finally {
        // isLoading removed
      }
    };

    loadGPAData();
  }, [user]);

  const saveGPAData = async () => {
    if (!user) {
      toast.error("Authentication required to save records");
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, "gpa-data", user.uid), {
        courses,
        previousCGPA,
        previousCredits,
        updatedAt: serverTimestamp(),
      });
      toast.success("Merit Matrix Synchronized");
    } catch (error) {
      console.error("Error saving GPA data:", error);
      toast.error("Synchronization failed");
    } finally {
      setIsSaving(false);
    }
  };

  const addCourse = () => {
    const newId = Math.max(...courses.map((c) => c.id), 0) + 1;
    setCourses([...courses, { id: newId, name: "", credits: 3, grade: "B" }]);
  };

  const removeCourse = (id: number) => setCourses(courses.filter((c) => c.id !== id));

  const updateCourse = (id: number, field: keyof Course, value: string | number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const calculateSGPA = () => {
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const totalPoints = courses.reduce((sum, c) => sum + c.credits * gradePoints[c.grade], 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const calculateCGPA = () => {
    const currentCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const currentPoints = courses.reduce((sum, c) => sum + c.credits * gradePoints[c.grade], 0);

    const prevCGPA = parseFloat(previousCGPA) || 0;
    const prevCredits = parseFloat(previousCredits) || 0;
    const prevPoints = prevCGPA * prevCredits;

    const totalCredits = currentCredits + prevCredits;
    const totalPoints = currentPoints + prevPoints;

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const sgpa = parseFloat(calculateSGPA());
  const cgpa = parseFloat(calculateCGPA());

  return (
    <PageHeader
      title="Merit Matrix"
      description="Analytical performance projection and cumulative grade point averaging engine"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           <Button onClick={saveGPAData} disabled={isSaving} className="h-10 px-6 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sync Registry
          </Button>
           <Button onClick={addCourse} className="h-10 px-6 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      }
    >
      <div className="space-y-6 md:space-y-12">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {/* Course Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6 md:space-y-8"
          >
            {/* Current Semester Courses */}
            <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 md:p-10 pb-4">
                <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-3">
                  <EditableText id="gpa_active" defaultText="Active Curriculum" className="text-xl md:text-2xl font-bold" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-10 pt-0">
                <div className="space-y-3 md:space-y-4">
                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                    <div className="col-span-12 sm:col-span-5">Unit Designation</div>
                    <div className="col-span-2">Credits</div>
                    <div className="col-span-3">Performance</div>
                    <div className="col-span-2 text-right">Yield</div>
                  </div>

                  {/* Course Rows */}
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 md:gap-4 items-center rounded-xl md:rounded-2xl bg-secondary/5 p-4 md:p-6 border border-transparent hover:border-primary/10 transition-all group"
                    >
                      <div className="sm:col-span-5">
                        <Label className="sm:hidden text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1 block">Unit Designation</Label>
                        <Input
                          value={course.name || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                            updateCourse(course.id, "name", val);
                          }}
                          placeholder="e.g. Advanced Quantum Computing"
                          className="h-10 md:h-12 rounded-lg md:rounded-xl bg-white border-0 shadow-sm font-bold text-gray-900 px-3 md:px-4 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="sm:hidden text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1 block">Credits</Label>
                        <Input
                          type="number"
                          value={course.credits}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            updateCourse(course.id, "credits", parseInt(val) || 0);
                          }}
                          min={1}
                          max={10}
                          className="h-10 md:h-12 rounded-lg md:rounded-xl bg-white border-0 shadow-sm font-black text-center text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label className="sm:hidden text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1 block">Performance (Grade)</Label>
                        <Select
                          value={course.grade}
                          onValueChange={(value) => updateCourse(course.id, "grade", value)}
                        >
                          <SelectTrigger className="h-10 md:h-12 rounded-lg md:rounded-xl bg-white border-0 shadow-sm font-black px-3 md:px-4 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-0 shadow-2xl">
                            {grades.map((grade) => (
                              <SelectItem key={grade} value={grade} className="font-bold">
                                {grade} <span className="text-primary/40 font-black ml-2 text-[10px] md:text-xs">[{gradePoints[grade]}]</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 px-1 md:px-2 pt-2 sm:pt-0">
                        <div className="sm:hidden text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Yield</div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg md:text-xl font-black italic tracking-tighter text-primary">
                            {(course.credits * gradePoints[course.grade]).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCourse(course.id)}
                            className="h-8 w-8 md:h-10 md:w-10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg md:rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Previous CGPA Section */}
            <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-6 md:p-10 pb-4">
               <CardTitle className="text-xl md:text-2xl font-bold italic uppercase tracking-tight">Legacy Records</CardTitle>
            </CardHeader>
               <CardContent className="p-6 md:p-10 pt-0">
                  <div className="grid gap-6 md:gap-8 sm:grid-cols-2">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-2">Verified CGPA</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={previousCGPA || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                          setPreviousCGPA(val);
                        }}
                        placeholder="0.00"
                        className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-secondary/5 border-0 font-bold text-lg md:text-xl px-4 md:px-6"
                      />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-2">Total Credit Pool</label>
                      <Input
                        type="number"
                        value={previousCredits || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setPreviousCredits(val);
                        }}
                        placeholder="0"
                        className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-secondary/5 border-0 font-bold text-lg md:text-xl px-4 md:px-6"
                      />
                    </div>
                  </div>
               </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6 md:space-y-8">
            {/* SGPA */}
            <Card className="rounded-[2rem] md:rounded-[3rem] border-0 shadow-sm overflow-hidden bg-white">
              <div className="bg-gradient-to-br from-primary to-primary-foreground p-8 md:p-10 text-white relative">
                <div className="absolute top-0 right-0 p-6 md:p-8 opacity-20">
                   <TrendingUp className="w-12 h-12 md:w-20 md:h-20" />
                </div>
                <div className="relative z-10 space-y-1">
                   <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Semester Index</p>
                   <p className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">{calculateSGPA()}</p>
                   <Progress value={(sgpa / 10) * 100} className="h-1.5 md:h-2 mt-4 md:mt-6 bg-white/10" />
                </div>
              </div>
              <CardContent className="p-6 md:p-10 space-y-3 md:space-y-4">
                <div className="flex justify-between items-center bg-secondary/5 p-3 md:p-4 rounded-xl">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credits In-Flight</span>
                  <span className="text-base md:text-lg font-black italic text-primary">{courses.reduce((sum, c) => sum + c.credits, 0)}</span>
                </div>
                <div className="flex justify-between items-center bg-secondary/5 p-3 md:p-4 rounded-xl">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantum Points Earned</span>
                  <span className="text-base md:text-lg font-black italic text-primary">
                    {courses.reduce((sum, c) => sum + c.credits * gradePoints[c.grade], 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* CGPA */}
            <Card className="rounded-[2rem] md:rounded-[3rem] border-0 shadow-sm overflow-hidden bg-white">
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 p-8 md:p-10 text-white relative">
                 <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10">
                   <Award className="w-12 h-12 md:w-20 md:h-20" />
                </div>
                <div className="relative z-10 space-y-1">
                   <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Global Aggregate</p>
                   <p className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">{calculateCGPA()}</p>
                   <Progress value={(cgpa / 10) * 100} className="h-1.5 md:h-2 mt-4 md:mt-6 bg-white/10" />
                </div>
              </div>
              <CardContent className="p-6 md:p-10 space-y-3 md:space-y-4">
                <div className="flex justify-between items-center bg-secondary/5 p-3 md:p-4 rounded-xl">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Vector Load</span>
                  <span className="text-base md:text-lg font-black italic text-gray-900">
                    {courses.reduce((sum, c) => sum + c.credits, 0) + (parseInt(previousCredits) || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Grade Legend */}
            <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 md:p-10 pb-4">
                <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Constants Registry</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-10 pt-0">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {Object.entries(gradePoints).map(([grade, points]) => (
                    <div key={grade} className="flex justify-between items-center rounded-lg md:rounded-xl bg-secondary/5 px-3 md:px-4 py-2 md:py-3 border border-transparent hover:border-primary/5 transition-all">
                      <span className="text-xs md:text-sm font-black text-gray-900">{grade}</span>
                      <span className="text-[9px] md:text-[10px] font-black text-primary bg-white px-2 py-1 rounded-md shadow-sm">{points}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Analytics Table View */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
           <Card className="rounded-[2rem] md:rounded-[3rem] border-0 bg-white shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-700">
             <CardHeader className="p-6 md:p-12 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="space-y-1">
                  <CardTitle className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                    <EditableText id="gpa_table" defaultText="Merit Registry Table" className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-gray-900" />
                  </CardTitle>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Tabular Representation of Analytical Performance</p>
               </div>
               <Badge className="rounded-lg md:rounded-xl h-8 md:h-10 px-4 md:px-6 bg-emerald-500/10 text-emerald-600 border-0 font-black italic uppercase text-[9px] md:text-[10px] tracking-widest flex items-center self-start md:self-auto">Verified Matrix</Badge>
             </CardHeader>
             <CardContent className="p-0">
               <div className="overflow-x-auto scrollbar-hide">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-secondary/5">
                       <th className="p-6 md:p-10 text-left text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border-b border-border/20 whitespace-nowrap">Unit Designation</th>
                       <th className="p-6 md:p-10 text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border-b border-border/20 whitespace-nowrap">Credits</th>
                       <th className="p-6 md:p-10 text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border-b border-border/20 whitespace-nowrap">Grade</th>
                       <th className="p-6 md:p-10 text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border-b border-border/20 whitespace-nowrap">Points</th>
                       <th className="p-6 md:p-10 text-right text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border-b border-border/20 whitespace-nowrap">Yield</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/20">
                     {courses.map((course) => (
                       <tr key={course.id} className="hover:bg-secondary/5 transition-all group/row">
                         <td className="p-6 md:p-10">
                            <div className="font-black italic text-base md:text-lg uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors whitespace-nowrap">{course.name || "Untitled Node"}</div>
                         </td>
                         <td className="p-6 md:p-10 text-center">
                            <div className="font-black text-lg md:text-xl text-gray-900">{course.credits}</div>
                         </td>
                         <td className="p-6 md:p-10 text-center">
                            <Badge className="rounded-lg bg-primary/10 text-primary border-0 font-black italic px-3 md:px-4 py-1 text-xs">{course.grade}</Badge>
                         </td>
                         <td className="p-6 md:p-10 text-center">
                            <div className="font-bold text-muted-foreground/60 text-sm">{gradePoints[course.grade]}</div>
                         </td>
                         <td className="p-6 md:p-10 text-right">
                            <div className="font-black text-xl md:text-2xl italic tracking-tighter text-primary">{(course.credits * gradePoints[course.grade]).toFixed(1)}</div>
                         </td>
                       </tr>
                     ))}
                     {courses.length === 0 && (
                       <tr>
                         <td colSpan={5} className="p-10 md:p-20 text-center">
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-20">Initialize curricular data to populate registry</p>
                         </td>
                       </tr>
                     )}
                   </tbody>
                   <tfoot>
                      <tr className="bg-primary/[0.02]">
                        <td className="p-6 md:p-10 font-black italic text-xs md:text-sm uppercase tracking-widest text-primary whitespace-nowrap">Aggregate Vectors</td>
                        <td className="p-6 md:p-10 text-center font-black text-lg md:text-xl">{courses.reduce((s, c) => s + c.credits, 0)}</td>
                        <td className="p-6 md:p-10"></td>
                        <td className="p-6 md:p-10"></td>
                        <td className="p-6 md:p-10 text-right">
                           <div className="flex flex-col">
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Semester Yield</span>
                              <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-primary">{calculateSGPA()}</span>
                           </div>
                        </td>
                      </tr>
                   </tfoot>
                 </table>
               </div>
             </CardContent>
           </Card>
        </motion.div>
      </div>
    </PageHeader>
  );
}
