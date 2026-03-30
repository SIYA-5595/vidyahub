"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, Users, RefreshCcw, MapPin, Plus, Trash2, Loader2, BookOpen, GraduationCap, Building } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where } from "firebase/firestore";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["09:00-10:00", "10:00-11:00", "11:30-12:30", "12:30-13:30", "14:00-15:00", "15:00-16:00"];

const subjectColors: Record<string, string> = {
  "Data Structures": "bg-blue-50 text-blue-700 border-blue-200",
  "Database Systems": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Computer Networks": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Machine Learning": "bg-amber-50 text-amber-700 border-amber-200",
  "Web Development": "bg-orange-50 text-orange-700 border-orange-200",
  "Software Engineering": "bg-rose-50 text-rose-700 border-rose-200",
};

interface Slot {
  id: string;
  day: string;
  time: string;
  subject: string;
  faculty: string;
  room: string;
  semester?: string;
  sector?: string;
  node?: string;
  cycle?: string;
}

export default function TimetablePage() {
  const [selectedSemester, setSelectedSemester] = useState("3");
  const [selectedDept, setSelectedDept] = useState("cs");
  const [selectedSection, setSelectedSection] = useState("a");
  const [selectedBatch, setSelectedBatch] = useState("2024");
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [editingSlot, setEditingSlot] = useState<Partial<Slot> | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const q = query(
      collection(db, "timetable"),
      where("semester", "==", selectedSemester),
      where("sector", "==", selectedDept),
      where("node", "==", selectedSection),
      where("cycle", "==", selectedBatch)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot)));
    });

    return () => unsubscribe();
  }, [selectedSemester, selectedDept, selectedSection, selectedBatch]);

  const saveSlot = async (slotData: Partial<Slot>) => {
    if (!slotData.subject || !slotData.faculty || !slotData.room) {
      toast.error("Please fill in all details");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...slotData,
        semester: selectedSemester,
        sector: selectedDept,
        node: selectedSection,
        cycle: selectedBatch,
        updatedAt: serverTimestamp()
      };
      delete (data as any).id;

      if (editingSlot?.id) {
        await updateDoc(doc(db, "timetable", editingSlot.id), data);
        toast.success("Schedule updated successfully");
      } else {
        await addDoc(collection(db, "timetable"), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success("New class slot added");
      }
      setShowEditDialog(false);
      setEditingSlot(null);
    } catch (error) {
      toast.error("Failed to save schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSlot = async (id: string) => {
    try {
      await deleteDoc(doc(db, "timetable", id));
      toast.success("Class slot removed");
    } catch (err) {
      toast.error("Failed to delete slot");
    }
  };

  const getSlotForDayTime = (day: string, time: string) => {
    return slots.find((slot) => slot.day === day && slot.time === time);
  };

  if (!isMounted) return null;

  return (
    <PageHeader
      title="Class Timetable"
      description="View and manage your weekly academic schedule easily."
      actions={
        <Button 
          onClick={() => {
            setEditingSlot({ day: "Monday", time: "09:00-10:00", subject: "", faculty: "", room: "" });
            setShowEditDialog(true);
          }} 
          className="rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      }
    >
      <div className="space-y-8 pb-10">
        {/* Filters Section */}
        <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="p-6 pb-2 border-b border-muted/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Filters
            </CardTitle>
            <CardDescription className="text-xs">Select your academic details to view your specific schedule.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Semester
                </Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-muted-foreground/10 focus:ring-primary/20">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Department
                </Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-muted-foreground/10 focus:ring-primary/20">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="it">Information Tech</SelectItem>
                    <SelectItem value="ece">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Section
                </Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-muted-foreground/10 focus:ring-primary/20">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="a">Section A</SelectItem>
                    <SelectItem value="b">Section B</SelectItem>
                    <SelectItem value="c">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    Batch Year
                </Label>
                <Input 
                  placeholder="e.g. 2024" 
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="rounded-xl h-11 bg-muted/30 border-muted-foreground/10 focus:ring-primary/20 font-medium" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Visualization */}
        <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="p-6 flex flex-row items-center justify-between border-b border-muted/50">
            <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold">Weekly Schedule</CardTitle>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/20 font-semibold text-xs transition-all hover:bg-primary/10">
                Semester {selectedSemester}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-hide">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30 border-muted/50">
                    <TableHead className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest w-32 border-r border-muted/50">Time</TableHead>
                    {days.map((day) => (
                      <TableHead key={day} className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest min-w-[180px] border-r border-muted/50 last:border-r-0">{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-muted/50">
                  {timeSlots.map((time) => (
                    <TableRow key={time} className="hover:bg-muted/5 transition-colors border-none group">
                      <TableCell className="py-8 px-6 font-semibold text-xs text-muted-foreground bg-muted/10 border-r border-muted/50">
                        {time}
                      </TableCell>
                      {days.map((day) => {
                        const slot = getSlotForDayTime(day, time);
                        const colorClass = slot ? subjectColors[slot.subject] || "bg-muted/50 text-foreground border-muted" : "";
                        
                        return (
                          <TableCell key={day + time} className="p-1.5 border-r border-muted/50 last:border-r-0 align-top">
                            {slot ? (
                              <motion.div 
                                whileHover={{ scale: 1.01, y: -2 }}
                                onClick={() => {
                                  setEditingSlot(slot);
                                  setShowEditDialog(true);
                                }}
                                className={cn(
                                  "rounded-xl p-4 h-full min-h-[110px] border transition-all duration-200 relative cursor-pointer group/slot shadow-sm",
                                  colorClass
                                )}
                              >
                                <h4 className="font-bold text-sm mb-3 leading-tight leading-snug">{slot.subject}</h4>
                                <div className="space-y-2 mt-auto">
                                   <div className="flex items-center gap-2 text-[10px] font-medium opacity-80">
                                      <MapPin size={12} className="text-current opacity-60" />
                                      <span>Room {slot.room}</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-[10px] font-medium opacity-80">
                                      <User size={12} className="text-current opacity-60" />
                                      <span>{slot.faculty}</span>
                                   </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-background/40 hover:bg-rose-500 hover:text-white opacity-0 group-hover/slot:opacity-100 transition-all"
                                  onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            ) : (
                              <button 
                                className="h-full min-h-[110px] w-full flex items-center justify-center text-muted-foreground/30 hover:text-primary hover:bg-primary/5 transition-all rounded-xl border-2 border-dashed border-muted/30 hover:border-primary/30 group/add"
                                onClick={() => {
                                  setEditingSlot({ day, time, subject: "", faculty: "", room: "" });
                                  setShowEditDialog(true);
                                }}
                              >
                                <Plus className="h-6 w-6 transition-transform group-hover/add:scale-110" />
                              </button>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit/Add Class Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-0 sm:max-w-xl bg-card overflow-hidden">
          <div className="px-8 py-6 bg-muted/30 border-b border-muted/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {editingSlot?.id ? "Edit Class Details" : "Add New Class"}
              </DialogTitle>
              <DialogDescription className="text-xs pt-1">Provide class information to update the institutional timetable.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1">Day of Week</Label>
                <Select value={editingSlot?.day} onValueChange={(v) => setEditingSlot({...editingSlot, day: v})}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted-foreground/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1">Time Slot</Label>
                <Select value={editingSlot?.time} onValueChange={(v) => setEditingSlot({...editingSlot, time: v})}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-muted-foreground/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground ml-1">Subject Name</Label>
              <Input 
                placeholder="e.g. Data Structures" 
                value={editingSlot?.subject || ""} 
                onChange={(e) => setEditingSlot({...editingSlot, subject: e.target.value})}
                className="rounded-xl h-12 bg-muted/30 border-muted-foreground/10 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1">Faculty Member</Label>
                <Input 
                  placeholder="e.g. Dr. John Smith" 
                  value={editingSlot?.faculty || ""} 
                  onChange={(e) => setEditingSlot({...editingSlot, faculty: e.target.value})}
                  className="rounded-xl h-12 bg-muted/30 border-muted-foreground/10 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1">Room Number</Label>
                <Input 
                  placeholder="e.g. CS-101" 
                  value={editingSlot?.room || ""} 
                  onChange={(e) => setEditingSlot({...editingSlot, room: e.target.value})}
                  className="rounded-xl h-12 bg-muted/30 border-muted-foreground/10 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-muted/30 border-t border-muted/50 flex justify-end gap-3">
             <Button variant="ghost" className="rounded-xl font-semibold h-11" onClick={() => setShowEditDialog(false)}>Cancel</Button>
             <Button 
               className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20"
               onClick={() => editingSlot && saveSlot(editingSlot)}
               disabled={isSubmitting}
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Saving...
                 </>
               ) : "Confirm Changes"}
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
