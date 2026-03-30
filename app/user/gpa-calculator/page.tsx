"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  Award, 
  Save, 
  Loader2,
  Zap,
  BookOpen,
  LayoutGrid,
  Scale,
  PlusCircle,
  Database,
  ArrowRight,
  Calculator,
  History,
  Info
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export default function GPACalculator() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [previousCGPA, setPreviousCGPA] = useState("");
  const [previousCredits, setPreviousCredits] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadGPAData = async () => {
      if (!user) return;
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
      }
    };
    loadGPAData();
  }, [user]);

  const saveGPAData = async () => {
    if (!user) {
      toast.error("Please login to save your data");
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
      toast.success("GPA data saved successfully");
    } catch (error) {
      toast.error("Failed to save data");
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
    const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const totalPoints = courses.reduce((sum, c) => sum + (c.credits || 0) * gradePoints[c.grade], 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const calculateCGPA = () => {
    const currentCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const currentPoints = courses.reduce((sum, c) => sum + (c.credits || 0) * gradePoints[c.grade], 0);

    const prevCGPA = parseFloat(previousCGPA) || 0;
    const prevCredits = parseFloat(previousCredits) || 0;
    const prevPoints = prevCGPA * prevCredits;

    const totalCredits = currentCredits + prevCredits;
    const totalPoints = currentPoints + prevPoints;

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const sgpa = parseFloat(calculateSGPA());
  const cgpa = parseFloat(calculateCGPA());

  if (!mounted) return null;

  return (
    <PageHeader
      title="GPA Calculator"
      description="Calculate your semester SGPA and overall CGPA based on your academic performance."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={saveGPAData} disabled={isSaving} className="rounded-xl font-semibold gap-2 border-primary/20 text-primary">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Progress
          </Button>
          <Button onClick={addCourse} className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
            <Plus size={16} />
            Add Course
          </Button>
        </div>
      }
    >
      <div className="space-y-10 pb-12">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Main Calculation Inputs */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Semester Courses Card */}
            <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
              <CardHeader className="p-6 border-b border-muted/50">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BookOpen size={20} className="text-primary" />
                            Current Semester Courses
                        </CardTitle>
                        <CardDescription className="text-xs">Add your courses and predicted grades for this semester.</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-xl bg-muted/20 p-4 border border-muted-foreground/10 hover:border-primary/20 transition-all group"
                      >
                        <div className="md:col-span-6">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 mb-1.5 block">Course Name</Label>
                            <Input
                                value={course.name}
                                onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                                placeholder="e.g. Data Structures"
                                className="h-11 rounded-lg bg-background border-muted-foreground/10 px-4 font-medium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 mb-1.5 block text-center">Credits</Label>
                            <Input
                                type="number"
                                value={course.credits}
                                onChange={(e) => updateCourse(course.id, "credits", parseInt(e.target.value) || 0)}
                                className="h-11 rounded-lg bg-background border-muted-foreground/10 text-center font-bold"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 mb-1.5 block">Grade</Label>
                            <Select
                                value={course.grade}
                                onValueChange={(value) => updateCourse(course.id, "grade", value)}
                            >
                                <SelectTrigger className="h-11 rounded-lg bg-background border-muted-foreground/10 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {grades.map((grade) => (
                                        <SelectItem key={grade} value={grade} className="font-semibold">
                                            {grade} <span className="text-muted-foreground font-normal ml-2">({gradePoints[grade]}.0)</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-1 flex justify-end pt-5 md:pt-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCourse(course.id)}
                                className="h-10 w-10 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {courses.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-muted/50 rounded-2xl bg-muted/10">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calculator className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1">No Courses Added</h3>
                        <p className="text-xs text-muted-foreground mb-6">Start by adding the courses you are taking this semester.</p>
                        <Button onClick={addCourse} variant="outline" className="rounded-xl text-xs gap-2">
                            <Plus size={14} /> Add First Course
                        </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Previous Academic Data */}
            <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
                <CardHeader className="p-6 border-b border-muted/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History size={20} className="text-primary" />
                        Previous Academic Records
                    </CardTitle>
                    <CardDescription className="text-xs">Include your current CGPA and total credits to calculate the final aggregate.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1">Current CGPA (out of 10.0)</Label>
                        <div className="relative">
                            <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                step="0.01"
                                value={previousCGPA}
                                onChange={(e) => setPreviousCGPA(e.target.value)}
                                placeholder="e.g. 8.5"
                                className="h-12 pl-10 rounded-xl bg-muted/20 border-muted-foreground/10 font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1">Total Credits Completed</Label>
                        <div className="relative">
                            <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={previousCredits}
                                onChange={(e) => setPreviousCredits(e.target.value)}
                                placeholder="e.g. 120"
                                className="h-12 pl-10 rounded-xl bg-muted/20 border-muted-foreground/10 font-bold"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Results Cards */}
            <div className="grid gap-6">
                <Card className="rounded-2xl border-none shadow-sm bg-primary text-primary-foreground relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                    <CardHeader className="p-8 pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Semester SGPA</p>
                            <Zap size={18} className="opacity-60" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-6xl font-bold tracking-tight">{calculateSGPA()}</h2>
                            <p className="text-xs font-medium opacity-70">Calculated from {courses.length} courses</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                                <span>Performance Meter</span>
                                <span>{((sgpa / 10) * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={(sgpa / 10) * 100} className="h-2 bg-white/20" indicatorClassName="bg-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm bg-[#1c1c1c] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                    <CardHeader className="p-8 pb-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Predicted CGPA</p>
                            <Award size={18} className="text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-6xl font-bold tracking-tight text-white">{calculateCGPA()}</h2>
                            <p className="text-xs font-medium text-muted-foreground">Aggregate of all semesters</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1 text-emerald-500/60">
                                <span>Global Consistency</span>
                                <span>{((cgpa / 10) * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={(cgpa / 10) * 100} className="h-2 bg-white/5" indicatorClassName="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Scale Legend */}
            <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
                <CardHeader className="p-6 border-b border-muted/50 py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Info size={16} className="text-muted-foreground" />
                        Grade Point Legend
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 py-4 grid grid-cols-2 gap-3">
                    {Object.entries(gradePoints).map(([grade, points]) => (
                        <div key={grade} className="flex justify-between items-center rounded-xl bg-muted/20 px-4 py-2.5 border border-muted-foreground/5 hover:bg-muted/30 transition-all group">
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{grade}</span>
                            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{points}.0</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Aggregate Table Summary */}
        <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
             <CardHeader className="p-8 border-b border-muted/50">
                <CardTitle className="text-xl font-bold">Calculation Summary</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="overflow-x-auto scrollbar-hide">
                 <Table>
                   <TableHeader>
                     <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-muted/50">
                       <TableHead className="py-5 px-8 text-xs font-bold text-muted-foreground uppercase tracking-widest">Course</TableHead>
                       <TableHead className="py-5 px-8 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">Credits</TableHead>
                       <TableHead className="py-5 px-8 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">Grade</TableHead>
                       <TableHead className="py-5 px-8 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">Points Earned</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody className="divide-y divide-muted/50">
                     {courses.map((course) => (
                       <TableRow key={course.id} className="hover:bg-muted/5 transition-colors border-none group">
                         <TableCell className="py-6 px-8">
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{course.name || "Untitled Course"}</div>
                         </TableCell>
                         <TableCell className="py-6 px-8 text-center">
                            <div className="font-bold text-foreground">{course.credits}</div>
                         </TableCell>
                         <TableCell className="py-6 px-8 text-center">
                            <Badge className="rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold px-4 py-1">{course.grade}</Badge>
                         </TableCell>
                         <TableCell className="py-6 px-8 text-right font-bold text-foreground">
                            {(course.credits * gradePoints[course.grade]).toFixed(1)}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                   <TableFooter className="bg-muted/10 border-t border-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="py-8 px-8 font-bold text-foreground uppercase tracking-widest text-sm">Totals</TableCell>
                        <TableCell className="py-8 px-8 text-center font-bold text-lg text-foreground">{courses.reduce((s, c) => s + (c.credits || 0), 0)}</TableCell>
                        <TableCell className="py-8 border-none"></TableCell>
                        <TableCell className="py-8 px-8 text-right">
                           <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Semester SGPA</span>
                              <span className="text-4xl font-bold text-primary">{calculateSGPA()}</span>
                           </div>
                        </TableCell>
                      </TableRow>
                   </TableFooter>
                 </Table>
               </div>
             </CardContent>
        </Card>
      </div>
    </PageHeader>
  );
}
