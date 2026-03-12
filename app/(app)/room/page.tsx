"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckCircle, AlertCircle, BedDouble, Fan, Lightbulb, Shield, Construction, Trash2, Home, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { collection, serverTimestamp, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

type InventoryStatus = {
  bed: boolean;
  mattress: boolean;
  fan: boolean;
  light: boolean;
  cupboard: boolean;
  wifi: boolean;
};

type Room = {
  id: string;
  roomNumber: string;
  floor: string;
  hostel: string;
  occupant: string;
  inventory: InventoryStatus;
  maintenanceRequests: string[];
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export default function RoomInventoryPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"staff" | "student">("staff");

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({ roomNumber: "", floor: "", hostel: "" });
  const [request, setRequest] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);

  // Real-time listener for rooms
  useEffect(() => {
    if (!user) {
      return;
    }
    const q = query(collection(db, "users", user.uid, "rooms"), orderBy("roomNumber", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      setRooms(roomsList);
    });
    return () => unsubscribe();
  }, [user]);

  const selectedRoom = (rooms as Room[]).find((r: Room) => r.id === selectedRoomId) || rooms[0];

  const addRoom = async () => {
    if(!newRoom.roomNumber) {
      toast.error("Unit number is mandatory");
      return;
    }
    
    try {
      if (!user) throw new Error("Unauthenticated");
      const roomId = newRoom.roomNumber;
      await setDoc(doc(db, "users", user.uid, "rooms", roomId), {
        roomNumber: newRoom.roomNumber || "000",
        floor: newRoom.floor || "G",
        hostel: newRoom.hostel || "Main",
        occupant: "Vacant",
        inventory: { bed: true, mattress: true, fan: true, light: true, cupboard: true, wifi: true },
        maintenanceRequests: [],
        createdAt: serverTimestamp()
      });
      setNewRoom({ roomNumber: "", floor: "", hostel: "" });
      toast.success(`Unit ${roomId} initialized`);
    } catch (err) {
      console.error("Error adding room: ", err);
      toast.error("Initialization failed");
    } finally {
    }
  };

  const removeRoom = async (id: string) => {
    try {
      if (!user) throw new Error("Unauthenticated");
      await deleteDoc(doc(db, "users", user.uid, "rooms", id));
      if (selectedRoomId === id) setSelectedRoomId(null);
      toast.success("Unit purged from registry");
    } catch {
      toast.error("Purge failed");
    }
  };

  const toggleInventory = async (roomId: string, item: keyof InventoryStatus) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !user) return;
    
    try {
      await updateDoc(doc(db, "users", user.uid, "rooms", roomId), {
        [`inventory.${item}`]: !room.inventory[item]
      });
    } catch {
      toast.error("Update failed");
    }
  };

  const addMaintenanceRequest = async (roomId: string) => {
    if (!request) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room || !user) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "rooms", roomId), {
        maintenanceRequests: [...room.maintenanceRequests, request]
      });
      setRequest("");
      toast.success("Anomaly reported");
    } catch {
      toast.error("Failed to transmit report");
    }
  };

  const resolveRequest = async (roomId: string, index: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !user) return;

    try {
      const newReqs = [...room.maintenanceRequests];
      newReqs.splice(index, 1);
      await updateDoc(doc(db, "users", user.uid, "rooms", roomId), {
        maintenanceRequests: newReqs
      });
      toast.success("Anomaly rectified");
    } catch {
      toast.error("Reconciliation failed");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50/30 to-primary/10">
      <PageHeader
      title="Habitat Reconciliation Node"
      description="Biometric habitat inventory and maintenance audit infrastructure for institutional personnel"
      actions={
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3">
           {(["staff", "student"] as const).map((v) => (
            <Button
              key={v}
              variant="ghost"
              size="sm"
              onClick={() => setView(v)}
              className={`h-9 rounded-lg px-6 font-black text-[10px] uppercase tracking-widest transition-all ${view === v ? "bg-white text-primary shadow-xl" : "text-white/40 hover:text-white"}`}
            >
              {v === 'staff' ? 'ADMIN OVERRIDE' : 'RESIDENT NODE'}
            </Button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* SIDEBAR LIST */}
        {view === "staff" && (
          <div className="lg:col-span-4 xl:col-span-3 space-y-8">
            <Card className="rounded-[3rem] border border-gray-200/50 shadow-lg bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
              <CardHeader className="p-10 pb-6">
                <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                  Habitat Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Unit No</Label>
                      <Input placeholder="000" value={newRoom.roomNumber} onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setNewRoom({...newRoom, roomNumber: val});
                      }} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg px-6 focus:ring-2 focus:ring-primary/20 transition-all"/>
                   </div>
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Lvl</Label>
                      <Input placeholder="G" value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg px-6 focus:ring-2 focus:ring-primary/20 transition-all"/>
                   </div>
                </div>
                <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 active:scale-95 transition-all" onClick={addRoom}>
                  INITIALIZE UNIT
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
               <div className="flex items-center justify-between px-6">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Active Nodes</h3>
                  <Badge variant="outline" className="rounded-lg h-6 px-3 border-secondary/20 text-primary font-black text-[8px] uppercase tracking-widest">{rooms.length}</Badge>
               </div>
               {rooms.map((r: Room, index: number) => (
                 <motion.div
                   key={r.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.05 }}
                 >
                   <Card 
                     className={`rounded-[2rem] cursor-pointer transition-all duration-500 group relative overflow-hidden ${selectedRoomId === r.id ? 'bg-primary text-white shadow-2xl shadow-primary/30 border-primary' : 'bg-white hover:bg-secondary/5 shadow-md border border-gray-200/50 hover:border-primary/30'}`}
                     onClick={() => setSelectedRoomId(r.id)}
                   >
                     {selectedRoomId === r.id && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                     )}
                     <CardContent className="p-6 flex justify-between items-center">
                       <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-2xl transition-all duration-500 ${selectedRoomId === r.id ? 'bg-white/20 rotate-12' : 'bg-secondary/10 text-primary group-hover:rotate-12'}`}>
                           {r.roomNumber}
                         </div>
                         <div>
                           <p className={`font-black italic tracking-tighter text-xl leading-none uppercase ${selectedRoomId === r.id ? 'text-white' : 'text-gray-900 group-hover:text-primary'}`}>UNIT {r.roomNumber}</p>
                           <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 ${selectedRoomId === r.id ? 'text-white/60' : 'text-muted-foreground opacity-40'}`}>{r.hostel}</p>
                         </div>
                       </div>
                       {r.maintenanceRequests.length > 0 && 
                         <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black animate-pulse shadow-lg ${selectedRoomId === r.id ? 'bg-white text-primary' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
                           {r.maintenanceRequests.length}
                         </div>
                       }
                     </CardContent>
                   </Card>
                 </motion.div>
               ))}
            </div>
          </div>
        )}

        {/* MAIN DETAIL VIEW */}
        <div className={`space-y-8 lg:space-y-12 ${view === "staff" ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"}`}>
           {selectedRoom ? (
             <>
               {/* ROOM HEADER INFO */}
               <Card className="rounded-[3rem] border border-gray-200/50 shadow-lg bg-white overflow-hidden relative group hover:shadow-2xl transition-all duration-700">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                 <CardHeader className="p-12 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-8">
                   <div className="space-y-4">
                     <div className="flex items-center gap-6">
                        <CardTitle className="text-5xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                           UNIT {view === "student" ? "101" : selectedRoom.roomNumber}
                        </CardTitle>
                        <Badge className="rounded-xl px-6 h-10 bg-primary/5 text-primary border-primary/10 font-black italic uppercase text-[10px] tracking-widest shadow-lg">
                           {selectedRoom.hostel}
                        </Badge>
                     </div>
                     <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] ml-1 opacity-40 flex items-center gap-4">
                        <Home size={12} className="text-primary" /> LEVEL {selectedRoom.floor}
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary/20" />
                        STANDARD TRIPLE OCCUPANCY
                     </p>
                   </div>
                   {view === "staff" && (
                     <Button variant="ghost" className="h-16 w-16 rounded-[1.5rem] bg-secondary/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 shadow-sm border border-secondary/10" onClick={() => removeRoom(selectedRoom.id)}>
                       <Trash2 className="w-7 h-7" />
                     </Button>
                   )}
                 </CardHeader>
                 <CardContent className="p-12 pt-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="group/item flex items-center gap-8 p-8 bg-secondary/5 rounded-[3rem] border border-secondary/10 hover:bg-white hover:shadow-2xl transition-all duration-700">
                          <div className="w-20 h-20 bg-white rounded-[1.8rem] flex items-center justify-center text-primary font-black italic text-4xl shadow-xl group-hover/item:rotate-12 transition-transform">
                             {selectedRoom.occupant[0]}
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">HABITAT PREFECT</p>
                            <p className="font-black italic text-2xl text-gray-900 tracking-tighter uppercase leading-none">{selectedRoom.occupant}</p>
                          </div>
                      </div>
                      <div className="group/item flex items-center gap-8 p-8 bg-secondary/5 rounded-[3rem] border border-secondary/10 hover:bg-white hover:shadow-2xl transition-all duration-700">
                          <div className="w-20 h-20 bg-white rounded-[1.8rem] flex items-center justify-center text-emerald-500 shadow-xl group-hover/item:rotate-12 transition-transform">
                             <CheckCircle className="w-10 h-10"/>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">AUDIT SIGNATURE</p>
                            <p className="font-black italic text-2xl text-emerald-600 tracking-tighter uppercase leading-none">VERIFIED SYNC</p>
                          </div>
                      </div>
                    </div>
                 </CardContent>
               </Card>

               <Tabs defaultValue="inventory" className="w-full">
                  <div className="flex bg-white p-2 rounded-[2rem] w-fit border border-gray-200 shadow-md mb-8">
                    <TabsList className="bg-transparent gap-2 h-full">
                      <TabsTrigger value="inventory" className="rounded-2xl px-10 h-14 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-black italic uppercase text-[10px] tracking-widest transition-all">
                        ASSET REGISTER
                      </TabsTrigger>
                      <TabsTrigger value="maintenance" className="rounded-2xl px-10 h-14 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary font-black italic uppercase text-[10px] tracking-widest transition-all flex items-center gap-4">
                        ANOMALIES
                        {selectedRoom.maintenanceRequests.length > 0 && <span className="bg-rose-500 text-white text-[9px] px-3 py-1 rounded-lg font-black shadow-lg shadow-rose-500/20">{selectedRoom.maintenanceRequests.length}</span>}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* INVENTORY TAB */}
                  <TabsContent value="inventory" className="mt-0 outline-none">
                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                        {(Object.keys(selectedRoom.inventory) as Array<keyof InventoryStatus>).map((key) => (
                           <StatusBox 
                             key={key}
                             title={key.charAt(0).toUpperCase() + key.slice(1)} 
                             available={selectedRoom.inventory[key]} 
                             icon={key === "bed" ? BedDouble : key === "mattress" ? BedDouble : key === "fan" ? Fan : key === "light" ? Lightbulb : key === "cupboard" ? Shield : Zap} 
                             onToggle={() => view === "staff" && toggleInventory(selectedRoom.id, key)}
                             readonly={view === "student"}
                           />
                        ))}
                     </div>
                  </TabsContent>

                  {/* MAINTENANCE TAB */}
                  <TabsContent value="maintenance" className="mt-0 space-y-12 outline-none">
                     {view === "student" && (
                       <Card className="rounded-[4rem] border-0 shadow-sm bg-primary text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-700">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                         <CardContent className="p-12 flex flex-col xl:flex-row gap-12 items-center relative z-10">
                            <div className="p-8 bg-white/20 rounded-[2.5rem] shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                               <Construction className="w-16 h-16 text-white" />
                            </div>
                            <div className="flex-1 space-y-8 w-full">
                               <div className="space-y-2">
                                  <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">REPORT SYSTEM ANOMALY</h3>
                                  <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] ml-1">Structural or environmental failure identification gateway</p>
                               </div>
                               <div className="flex flex-col md:flex-row gap-4">
                                  <Input 
                                    placeholder="IDENTIFY ANOMALY (E.G. ACOUSTIC FAN DISTURBANCE)" 
                                    value={request} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, "");
                                        setRequest(val);
                                    }} 
                                    className="h-20 bg-white/10 border-white/20 rounded-[1.5rem] placeholder:text-white/20 text-white font-black italic uppercase px-10 text-xl flex-1 shadow-inner" 
                                  />
                                  <Button onClick={() => addMaintenanceRequest(selectedRoom.id)} className="h-20 px-16 bg-white text-primary hover:bg-white/90 rounded-[1.5rem] font-black italic tracking-tighter text-xl shadow-2xl active:scale-95 transition-all">
                                    TRANSMIT
                                  </Button>
                               </div>
                            </div>
                         </CardContent>
                       </Card>
                     )}

                     <div className="space-y-8">
                        <div className="flex items-center justify-between px-6">
                            <div className="space-y-1">
                              <h3 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Anomalies Registry</h3>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Identified Habitat Deviations</p>
                            </div>
                            <Badge variant="secondary" className="rounded-xl h-10 px-6 font-black italic uppercase text-[10px] tracking-widest leading-none bg-secondary/10">{selectedRoom.maintenanceRequests.length} ENTRIES</Badge>
                        </div>

                        <div className="grid gap-10">
                          {selectedRoom.maintenanceRequests.map((req, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Card className="rounded-[3.5rem] border-0 shadow-sm hover:shadow-2xl transition-all duration-700 group overflow-hidden bg-white hover:border-rose-500/10 border border-transparent">
                                 <CardContent className="p-10 flex flex-col md:flex-row justify-between items-center gap-10">
                                   <div className="flex items-center gap-10 w-full md:w-auto">
                                     <div className="w-24 h-24 rounded-[2rem] bg-rose-500/5 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-700 shadow-sm border border-rose-500/10">
                                        <AlertCircle className="w-10 h-10 group-hover:animate-pulse"/>
                                     </div>
                                     <div className="space-y-2">
                                        <p className="text-3xl font-black italic tracking-tighter text-gray-900 leading-none uppercase group-hover:text-rose-500 transition-colors">{req}</p>
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center">
                                            <Construction className="w-4 h-4 text-primary opacity-40" />
                                          </div>
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 italic">IDENTIFIED: 05 FEB 2024</span>
                                        </div>
                                     </div>
                                   </div>
                                   <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-secondary/10 pt-10 md:pt-0 md:pl-10">
                                      {view === "staff" ? (
                                        <Button variant="ghost" className="h-16 px-10 rounded-[1.5rem] bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all font-black italic tracking-widest text-[10px] uppercase gap-4 shadow-sm" onClick={() => resolveRequest(selectedRoom.id, idx)}>
                                          <CheckCircle className="w-5 h-5" /> RECTIFY ANOMALY
                                        </Button>
                                      ) : (
                                        <Badge className="bg-rose-500/5 text-rose-500 border-rose-500/10 rounded-xl font-black italic px-8 h-12 uppercase tracking-widest text-[10px] animate-pulse">PENDING RECONCILIATION</Badge>
                                      )}
                                   </div>
                                 </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>

                        {selectedRoom.maintenanceRequests.length === 0 && (
                          <div className="text-center py-40 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20">
                             <CheckCircle className="w-24 h-24 mx-auto mb-8 opacity-5 text-emerald-500" />
                             <p className="text-3xl font-black italic tracking-tighter text-gray-400 uppercase">Habitat Nominal</p>
                             <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 mt-3 tracking-[0.4em] italic">No deviating environmental signatures detected</p>
                          </div>
                        )}
                     </div>
                  </TabsContent>
               </Tabs>
             </>
           ) : (
             <div className="h-[600px] flex flex-col items-center justify-center bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/20 p-20 text-center gap-8">
                <div className="w-32 h-32 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center text-primary/10">
                   <Home size={64} className="animate-pulse" />
                </div>
                <div className="space-y-3">
                   <p className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">Habitat Selection Required</p>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Identify corresponding residency node to initiate audit sequence</p>
                </div>
             </div>
           )}
        </div>
      </div>
      </PageHeader>
    </div>
  );
}

function StatusBox({ title, available, icon: Icon, onToggle, readonly }: { title: string, available: boolean, icon: React.ElementType, onToggle: () => void, readonly: boolean }) {
  return (
    <Card 
      className={`rounded-[3rem] border-0 transition-all duration-700 relative overflow-hidden group h-full ${available ? "bg-white hover:shadow-2xl hover:-translate-y-2" : "bg-rose-500/5 border border-rose-500/10"} ${!readonly ? 'cursor-pointer' : ''}`}
      onClick={!readonly ? onToggle : undefined}
    >
      <CardContent className="p-10 flex flex-col justify-between gap-10">
        <div className="flex justify-between items-start">
           <div className={`p-6 rounded-[1.8rem] shadow-2xl transition-all duration-700 ${available ? "bg-emerald-500 text-white shadow-emerald-500/20 group-hover:rotate-12" : "bg-rose-500 text-white shadow-rose-500/20 group-hover:rotate-12"}`}>
              <Icon className="w-10 h-10" />
           </div>
           <Badge className={`rounded-lg px-4 h-8 font-black italic text-[9px] uppercase tracking-widest border-0 ${available ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
             {available ? "OPERATIONAL" : "FAILURE"}
           </Badge>
        </div>

        <div className="space-y-2">
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic leading-none">Asset ID</p>
           <p className="font-black italic text-2xl text-gray-900 tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">{title}</p>
        </div>

        {!readonly && (
           <div className="flex justify-end pt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
              <p className="text-[9px] font-black italic text-primary uppercase tracking-[0.2em]">Toggle Status</p>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
