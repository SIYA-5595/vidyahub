"use client"; // Required in Next.js 13+ for client-side components

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, RefreshCw, MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where } from "firebase/firestore";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { EditableText } from "@/components/ui/editable-text";
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["09:00-10:00", "10:00-11:00", "11:30-12:30", "12:30-13:30", "14:00-15:00", "15:00-16:00"];

const subjectColors: Record<string, string> = {
  "Data Structures": "bg-cyan-50 text-cyan-700 border-cyan-100",
  "Database Systems": "bg-blue-50 text-blue-700 border-blue-100",
  "Computer Networks": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Machine Learning": "bg-amber-50 text-amber-700 border-amber-100",
  "Web Development": "bg-orange-50 text-orange-700 border-orange-100",
  "Software Engineering": "bg-rose-50 text-rose-700 border-rose-100",
  "Web Development Lab": "bg-yellow-50 text-yellow-700 border-yellow-100",
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

export default function TimetableGenerator() {
  const [selectedSemester, setSelectedSemester] = useState("3");
  const [selectedSector, setSelectedSector] = useState("cs");
  const [selectedNode, setSelectedNode] = useState("a");
  const [selectedCycle, setSelectedCycle] = useState("2024");
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingSlot, setEditingSlot] = useState<Partial<Slot> | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Real-time listener based on current filters
  useEffect(() => {
    const q = query(
      collection(db, "timetable"),
      where("semester", "==", selectedSemester),
      where("sector", "==", selectedSector),
      where("node", "==", selectedNode),
      where("cycle", "==", selectedCycle)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slot)));
    });

    return () => unsubscribe();
  }, [selectedSemester, selectedSector, selectedNode, selectedCycle]);

  const saveSlot = async (slotData: Partial<Slot>) => {
    setIsSubmitting(true);
    try {
      const slotDataWithoutId = { ...slotData };
      delete (slotDataWithoutId as { id?: string }).id;
      const data = {
        ...slotDataWithoutId,
        semester: selectedSemester,
        sector: selectedSector,
        node: selectedNode,
        cycle: selectedCycle,
        updatedAt: serverTimestamp()
      };

      if (editingSlot?.id) {
        await updateDoc(doc(db, "timetable", editingSlot.id), data);
        toast.success("Schedule node updated");
      } else {
        await addDoc(collection(db, "timetable"), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success("New temporal node manifested");
      }
      setShowEditDialog(false);
      setEditingSlot(null);
    } catch {
      toast.error("Synchronization failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSlot = async (id: string) => {
    if (!id) {
      console.error("Purge Error: Missing Document ID");
      toast.error("Purge Failed: Invalid Item ID");
      return;
    }
    try {
      await deleteDoc(doc(db, "timetable", id));
      toast.success("Temporal node purged");
    } catch (err) {
      console.error("Deletion Failed:", err);
      toast.error("Purge Failed: Institutional access denied");
    }
  };

  const getSlotForDayTime = (day: string, time: string) => {
    return slots.find((slot) => slot.day === day && slot.time === time);
  };

  return (
    <PageHeader
      title="Automated Timetable Generator"
      description="Generate and customize class schedules automatically"
      actions={
        <Button 
          onClick={() => {
            setEditingSlot({ day: "Monday", time: "09:00-10:00", subject: "", faculty: "", room: "" });
            setShowEditDialog(true);
          }} 
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 shadow-xl transition-all"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Timetable
        </Button>
      }
    >
      <div className="space-y-6 md:space-y-12">
        {/* Configuration Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-6 md:p-8 pb-4">
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-3">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <EditableText id="timetable_params" defaultText="Configuration" className="text-xl md:text-2xl font-bold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 pt-4">
              <div className="grid gap-4 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Phase Index</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="rounded-xl md:rounded-2xl h-12 md:h-14 bg-white border border-gray-100 md:border-0 shadow-sm font-black text-sm px-4 md:px-6">
                      <SelectValue placeholder="Phase Selection" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-0 shadow-2xl">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()} className="rounded-xl font-bold">
                          Phase {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Department</Label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger className="rounded-xl md:rounded-2xl h-12 md:h-14 bg-white border border-gray-100 md:border-0 shadow-sm font-black text-sm px-4 md:px-6">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl">
                      <SelectItem value="cs" className="rounded-xl font-bold">Computer Science</SelectItem>
                      <SelectItem value="it" className="rounded-xl font-bold">Information Tech</SelectItem>
                      <SelectItem value="ece" className="rounded-xl font-bold">Electronics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Section</Label>
                  <Select value={selectedNode} onValueChange={setSelectedNode}>
                    <SelectTrigger className="rounded-xl md:rounded-2xl h-12 md:h-14 bg-white border border-gray-100 md:border-0 shadow-sm font-black text-sm px-4 md:px-6">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl">
                      <SelectItem value="a" className="rounded-xl font-bold">Section A</SelectItem>
                      <SelectItem value="b" className="rounded-xl font-bold">Section B</SelectItem>
                      <SelectItem value="c" className="rounded-xl font-bold">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Batch</Label>
                  <Input 
                    placeholder="2024" 
                    className="rounded-xl md:rounded-2xl h-12 md:h-14 bg-white border border-gray-100 md:border-0 shadow-sm font-black text-sm px-4 md:px-6" 
                    value={selectedCycle || ""}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Visualization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="p-6 md:p-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                 <CardTitle className="text-xl md:text-2xl font-bold">
                    <EditableText id="timetable_matrix" defaultText="Weekly Schedule" className="text-xl md:text-2xl font-bold" />
                 </CardTitle>
              </div>
              <Badge className="rounded-full h-8 px-4 bg-gray-100 text-gray-500 border-0 font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center self-start md:self-auto">Semester {selectedSemester}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full border-collapse">
                   <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 md:p-6 text-left text-xs md:text-sm font-semibold text-gray-500 border-b border-gray-100">Time</th>
                      {days.map((day) => (
                        <th key={day} className="p-4 md:p-6 text-left text-xs md:text-sm font-semibold text-gray-500 border-b border-gray-100">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {timeSlots.map((time) => (
                      <tr key={time} className="hover:bg-gray-50/50 transition-all">
                        <td className="p-4 md:p-6 font-semibold text-xs md:text-sm text-gray-500 whitespace-nowrap">{time}</td>
                        {days.map((day) => {
                          const slot = getSlotForDayTime(day, time);
                          return (
                            <td key={day + time} className="p-2 border-l border-gray-100 min-w-[160px] md:min-w-[200px]">
                              {slot ? (
                                <motion.div 
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  onClick={() => {
                                    setEditingSlot(slot);
                                    setShowEditDialog(true);
                                  }}
                                  className={`rounded-xl p-3 md:p-5 h-full border transition-all duration-300 relative cursor-pointer group ${subjectColors[slot.subject] || "bg-gray-50 text-gray-700 border-gray-100"}`}
                                >
                                  <div className="font-bold text-sm md:text-base mb-2 leading-tight">{slot.subject}</div>
                                  <div className="flex flex-col gap-1 md:gap-1.5">
                                     <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-semibold opacity-80">
                                        <MapPin size={10} className="md:w-[12px] md:h-[12px]" />
                                        {slot.room}
                                     </div>
                                     <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-semibold opacity-80">
                                        <User size={10} className="md:w-[12px] md:h-[12px]" />
                                        {slot.faculty}
                                     </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-1 md:top-2 right-1 md:right-2 h-6 w-6 rounded-md text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </motion.div>
                              ) : (
                                <div 
                                  className="h-20 md:h-28 w-full flex items-center justify-center text-gray-200 hover:text-primary/40 hover:bg-gray-50 transition-all rounded-xl border border-dashed border-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setEditingSlot({ day, time, subject: "", faculty: "", room: "" });
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-[1.5rem] md:rounded-[3rem] border-0 shadow-2xl p-6 md:p-12 bg-white max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="space-y-4 text-left">
            <DialogTitle className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">{editingSlot?.id ? "Modify Temporal Node" : "Manifest New Node"}</DialogTitle>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Precision parameter calibration for institutional synchronization</p>
          </DialogHeader>

          <div className="space-y-6 md:space-y-8 py-4 md:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Day Cycle</Label>
                <Select value={editingSlot?.day} onValueChange={(v) => setEditingSlot({...editingSlot, day: v})}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-secondary/5 border-0 font-black text-xs md:text-sm px-4 md:px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 shadow-xl">
                    {days.map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Temporal Window</Label>
                <Select value={editingSlot?.time} onValueChange={(v) => setEditingSlot({...editingSlot, time: v})}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-secondary/5 border-0 font-black text-xs md:text-sm px-4 md:px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 shadow-xl">
                    {timeSlots.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Subject Designation</Label>
              <Input 
                placeholder="E.G. NEURAL NETWORKS" 
                value={editingSlot?.subject || ""} 
                onChange={(e) => setEditingSlot({...editingSlot, subject: e.target.value.toUpperCase()})}
                className="h-14 md:h-16 rounded-xl md:rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-base md:text-lg tracking-tight px-6 md:px-8"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Faculty Architect</Label>
                <Input 
                  placeholder="PROF. NAME" 
                  value={editingSlot?.faculty || ""} 
                  onChange={(e) => setEditingSlot({...editingSlot, faculty: e.target.value.toUpperCase()})}
                  className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-secondary/5 border-0 font-black text-xs md:text-sm px-4 md:px-6"
                />
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Locality Node (Room)</Label>
                <Input 
                  placeholder="ROOM-404" 
                  value={editingSlot?.room || ""} 
                  onChange={(e) => setEditingSlot({...editingSlot, room: e.target.value.toUpperCase()})}
                  className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-secondary/5 border-0 font-black text-xs md:text-sm px-4 md:px-6"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col md:flex-row gap-3 md:gap-4 mt-2">
             <Button variant="ghost" className="rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest w-full md:w-auto" onClick={() => setShowEditDialog(false)}>Cancel Protocol</Button>
             <Button 
                className="h-12 md:h-14 px-8 md:px-10 bg-primary hover:bg-primary/90 text-white rounded-xl md:rounded-2xl font-black italic tracking-tighter text-lg md:text-xl shadow-xl shadow-primary/20 flex-1 w-full"
               onClick={() => editingSlot && saveSlot(editingSlot)}
               disabled={isSubmitting}
             >
               {isSubmitting ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : "EXECUTE MANIFESTATION"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
