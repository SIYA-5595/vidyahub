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
    if (!user) return;
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
    <PageHeader
      title="Habitat Reconciliation Node"
      description="Biometric habitat inventory and maintenance audit infrastructure for institutional personnel"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 items-center shadow-premium">
            <div className="flex bg-background/40 p-1 rounded-xl shadow-inner border border-white/5">
              {(["staff", "student"] as const).map((v) => (
                <Button
                  key={v}
                  variant="ghost"
                  size="sm"
                  onClick={() => setView(v)}
                  className={`h-10 rounded-lg px-8 font-black text-[10px] uppercase tracking-widest transition-all italic ${view === v ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"}`}
                >
                  {v === 'staff' ? 'ADMIN OVERRIDE' : 'RESIDENT NODE'}
                </Button>
              ))}
            </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* SIDEBAR LIST */}
        {view === "staff" && (
          <div className="lg:col-span-4 xl:col-span-3 space-y-10">
            <Card className="rounded-[3rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden group hover:shadow-premium-hover transition-all duration-700 relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
              <CardHeader className="p-10 pb-6 relative z-10">
                <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-foreground leading-none">
                  Habitat Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Unit No</Label>
                      <Input placeholder="000" value={newRoom.roomNumber} onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setNewRoom({...newRoom, roomNumber: val});
                      }} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-6 focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/10"/>
                   </div>
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Lvl</Label>
                      <Input placeholder="G" value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg px-6 focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/10 uppercase"/>
                   </div>
                </div>
                <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.5rem] font-black italic uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 active:scale-95 transition-all border-none relative overflow-hidden group/btn" onClick={addRoom}>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
                  INITIALIZE UNIT
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
               <div className="flex items-center justify-between px-6">
                  <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic leading-none">Active Nodes</h3>
                  <Badge variant="secondary" className="rounded-xl h-8 px-4 bg-background/40 border border-white/5 text-foreground font-black italic uppercase text-[10px] tracking-widest italic shadow-inner">{rooms.length}</Badge>
               </div>
               {rooms.map((r: Room, index: number) => (
                 <motion.div
                   key={r.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.05 }}
                 >
                   <Card 
                     className={`rounded-[2.5rem] cursor-pointer transition-all duration-700 group relative overflow-hidden border-none ${selectedRoomId === r.id ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/40 scale-[1.02]' : 'bg-card/40 backdrop-blur-sm border border-white/5 hover:bg-background/40 shadow-premium'}`}
                     onClick={() => setSelectedRoomId(r.id)}
                   >
                     {selectedRoomId === r.id && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                     )}
                     <CardContent className="p-8 flex justify-between items-center relative z-10">
                       <div className="flex items-center gap-6">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black italic text-2xl transition-all duration-700 ${selectedRoomId === r.id ? 'bg-white/20 rotate-12 shadow-inner' : 'bg-background/50 text-primary group-hover:rotate-12 shadow-inner border border-white/5'}`}>
                           {r.roomNumber}
                         </div>
                         <div className="space-y-2">
                           <p className={`font-black italic tracking-tighter text-2xl leading-none uppercase ${selectedRoomId === r.id ? 'text-primary-foreground' : 'text-foreground group-hover:text-primary transition-colors'}`}>UNIT {r.roomNumber}</p>
                           <p className={`text-[10px] font-black uppercase tracking-[0.2em] italic leading-none ${selectedRoomId === r.id ? 'text-primary-foreground/40' : 'text-muted-foreground/40 opacity-40'}`}>{r.hostel}</p>
                         </div>
                       </div>
                       {r.maintenanceRequests.length > 0 && 
                         <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black animate-pulse shadow-lg ${selectedRoomId === r.id ? 'bg-white text-primary shadow-white/20' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
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
        <div className={`space-y-12 ${view === "staff" ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"}`}>
           {selectedRoom ? (
             <>
               {/* ROOM HEADER INFO */}
               <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden relative group hover:shadow-premium-hover transition-all duration-700">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-60 -mt-60 pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
                 <CardHeader className="p-16 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-10">
                   <div className="space-y-6">
                     <div className="flex items-center gap-8">
                        <CardTitle className="text-6xl font-black italic tracking-tighter uppercase text-foreground leading-none">
                           UNIT {view === "student" ? "101" : selectedRoom.roomNumber}
                        </CardTitle>
                        <Badge className="rounded-2xl px-8 h-12 bg-primary/20 text-primary border border-white/5 font-black italic uppercase text-[12px] tracking-widest shadow-inner leading-none">
                           {selectedRoom.hostel} // SECTOR
                        </Badge>
                     </div>
                     <p className="text-muted-foreground/40 font-black uppercase tracking-[0.5em] text-[12px] ml-1 flex items-center gap-6 italic leading-none">
                        <Home size={16} className="text-primary group-hover:rotate-12 transition-transform duration-700" /> LEVEL {selectedRoom.floor}
                        <span className="w-2 h-2 rounded-full bg-primary/30" />
                        TRIPLE OCCUPANCY PROTOCOL
                     </p>
                   </div>
                   {view === "staff" && (
                     <Button variant="ghost" className="h-20 w-20 rounded-[2rem] bg-background/40 text-rose-500 hover:bg-rose-500/20 transition-all transform hover:rotate-12 shadow-inner border border-white/5" onClick={() => removeRoom(selectedRoom.id)}>
                       <Trash2 size={32} />
                     </Button>
                   )}
                 </CardHeader>
                 <CardContent className="p-16 pt-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="group/item flex items-center gap-10 p-10 bg-background/40 backdrop-blur-sm rounded-[3rem] border border-white/5 hover:bg-background/60 shadow-inner hover:shadow-premium transition-all duration-700">
                          <div className="w-24 h-24 bg-background/50 border border-white/5 rounded-[2rem] flex items-center justify-center text-primary font-black italic text-5xl shadow-inner group-hover/item:rotate-12 group-hover/item:scale-110 transition-all duration-700">
                             {selectedRoom.occupant[0]}
                          </div>
                          <div className="space-y-3">
                            <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">HABITAT PREFECT</p>
                            <p className="font-black italic text-3xl text-foreground tracking-tighter uppercase leading-none group-hover/item:text-primary transition-colors">{selectedRoom.occupant}</p>
                          </div>
                      </div>
                      <div className="group/item flex items-center gap-10 p-10 bg-background/40 backdrop-blur-sm rounded-[3rem] border border-white/5 hover:bg-background/60 shadow-inner hover:shadow-premium transition-all duration-700">
                          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center text-emerald-400 shadow-inner group-hover/item:rotate-12 group-hover/item:scale-110 transition-all duration-700">
                             <CheckCircle size={48}/>
                          </div>
                          <div className="space-y-3">
                            <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">AUDIT SIGNATURE</p>
                            <p className="font-black italic text-3xl text-emerald-400 tracking-tighter uppercase leading-none">VERIFIED SYNC</p>
                          </div>
                      </div>
                    </div>
                 </CardContent>
               </Card>

               <Tabs defaultValue="inventory" className="w-full">
                  <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-[2.5rem] w-full max-w-2xl border border-white/5 shadow-premium mb-12">
                    <TabsList className="bg-transparent gap-3 h-full w-full">
                      <TabsTrigger value="inventory" className="rounded-[2rem] px-12 h-16 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl font-black italic uppercase text-[11px] tracking-widest transition-all text-muted-foreground/40 border-none relative overflow-hidden group/tab">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 opacity-0 group-data-[state=active]/tab:opacity-100 group-data-[state=active]/tab:animate-pulse" />
                        ASSET REGISTER
                      </TabsTrigger>
                      <TabsTrigger value="maintenance" className="rounded-[2rem] px-12 h-16 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl font-black italic uppercase text-[11px] tracking-widest transition-all text-muted-foreground/40 border-none flex items-center justify-center gap-6 relative overflow-hidden group/tab">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 opacity-0 group-data-[state=active]/tab:opacity-100 group-data-[state=active]/tab:animate-pulse" />
                        ANOMALIES
                        {selectedRoom.maintenanceRequests.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-4 py-1.5 rounded-xl font-black shadow-2xl shadow-rose-500/40 group-data-[state=active]/tab:bg-white group-data-[state=active]/tab:text-primary transition-colors">{selectedRoom.maintenanceRequests.length}</span>}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* INVENTORY TAB */}
                  <TabsContent value="inventory" className="mt-0 outline-none">
                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
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
                  <TabsContent value="maintenance" className="mt-0 space-y-16 outline-none">
                     {view === "student" && (
                       <Card className="rounded-[5rem] border border-white/5 shadow-premium bg-primary text-primary-foreground overflow-hidden relative group hover:shadow-premium-hover transition-all duration-700">
                         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none group-hover:bg-white/10 transition-colors duration-1000" />
                         <CardContent className="p-16 flex flex-col xl:flex-row gap-16 items-center relative z-10">
                            <div className="p-12 bg-white/10 rounded-[3rem] shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 border border-white/5 backdrop-blur-sm">
                               <Construction size={72} className="text-primary-foreground" />
                            </div>
                            <div className="flex-1 space-y-12 w-full">
                               <div className="space-y-4">
                                  <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">REPORT SYSTEM ANOMALY</h3>
                                  <p className="text-primary-foreground/40 font-black uppercase tracking-[0.5em] text-[12px] ml-1 italic leading-none">Structural or environmental failure identification gateway</p>
                               </div>
                               <div className="flex flex-col md:flex-row gap-6">
                                  <Input 
                                    placeholder="IDENTIFY ANOMALY (E.G. ACOUSTIC FAN DISTURBANCE)" 
                                    value={request} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, "");
                                        setRequest(val);
                                    }} 
                                    className="h-24 bg-white/10 border border-white/5 rounded-[2rem] placeholder:text-white/20 text-white font-black italic uppercase px-12 text-2xl flex-1 shadow-inner placeholder:italic focus:ring-4 focus:ring-white/10 transition-all" 
                                  />
                                  <Button onClick={() => addMaintenanceRequest(selectedRoom.id)} className="h-24 px-20 bg-white text-primary hover:bg-white/90 rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-white/10 active:scale-95 transition-all border-none relative overflow-hidden group/transmit">
                                    <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/20 opacity-0 group-hover/transmit:opacity-100 transition-opacity" />
                                    TRANSMIT
                                  </Button>
                                </div>
                            </div>
                         </CardContent>
                       </Card>
                     )}

                     <div className="space-y-12">
                        <div className="flex items-center justify-between px-10">
                            <div className="space-y-3">
                              <h3 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Anomalies Registry</h3>
                              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">Identified Habitat Deviations // Maintenance Log</p>
                            </div>
                            <Badge variant="secondary" className="rounded-2xl h-12 px-10 font-black italic uppercase text-[12px] tracking-widest leading-none bg-background/40 border border-white/5 text-foreground italic shadow-inner">{selectedRoom.maintenanceRequests.length} ENTRIES</Badge>
                        </div>

                        <div className="grid gap-10">
                          {selectedRoom.maintenanceRequests.map((req, idx) => (
                            <motion.div
                               key={idx}
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               transition={{ delay: idx * 0.05 }}
                            >
                               <Card className="rounded-[4rem] border border-white/5 shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden bg-card/40 backdrop-blur-sm hover:border-rose-500/20 transition-colors">
                                  <CardContent className="p-12 flex flex-col md:flex-row justify-between items-center gap-12">
                                    <div className="flex items-center gap-12 w-full md:w-auto">
                                      <div className="w-28 h-28 rounded-[2.5rem] bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-700 shadow-inner border border-white/5">
                                         <AlertCircle size={48} className="group-hover:animate-pulse"/>
                                      </div>
                                      <div className="space-y-4">
                                         <p className="text-4xl font-black italic tracking-tighter text-foreground leading-none uppercase group-hover:text-rose-400 transition-colors">{req}</p>
                                         <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-background/50 border border-white/5 flex items-center justify-center">
                                              <Construction size={20} className="text-primary group-hover:rotate-12 transition-transform shadow-lg" />
                                            </div>
                                            <span className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none">IDENTIFIED: 05 MAR 2024</span>
                                         </div>
                                      </div>
                                    </div>
                                    <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-white/5 pt-12 md:pt-0 md:pl-12">
                                       {view === "staff" ? (
                                         <Button variant="ghost" className="h-20 px-12 rounded-2xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all font-black italic tracking-widest text-[11px] uppercase gap-5 shadow-inner border border-white/5 group-hover:scale-105" onClick={() => resolveRequest(selectedRoom.id, idx)}>
                                           <CheckCircle size={24} /> RECTIFY ANOMALY
                                         </Button>
                                       ) : (
                                         <Badge className="bg-rose-500/20 text-rose-400 border border-white/5 rounded-[1.5rem] font-black italic px-10 h-16 uppercase tracking-widest text-[12px] animate-pulse leading-none shadow-inner">PENDING RECONCILIATION</Badge>
                                       )}
                                    </div>
                                  </CardContent>
                               </Card>
                            </motion.div>
                          ))}
                        </div>

                        {selectedRoom.maintenanceRequests.length === 0 && (
                          <div className="text-center py-56 bg-background/20 rounded-[5rem] border-4 border-dashed border-white/5 relative group overflow-hidden">
                             <CheckCircle className="w-48 h-48 mx-auto text-emerald-500 opacity-[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                             <div className="relative z-10 space-y-6">
                               <p className="text-5xl font-black italic tracking-tighter text-muted-foreground/40 uppercase leading-none">Habitat Nominal</p>
                               <p className="text-[12px] font-black text-muted-foreground/20 uppercase mt-4 tracking-[0.6em] italic leading-none">No deviating environmental signatures detected</p>
                             </div>
                          </div>
                        )}
                     </div>
                  </TabsContent>
               </Tabs>
             </>
           ) : (
             <div className="h-[700px] flex flex-col items-center justify-center bg-background/20 rounded-[5rem] border-4 border-dashed border-white/5 p-24 text-center gap-12 group overflow-hidden relative">
                <Home className="w-96 h-96 text-primary opacity-[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-40 h-40 rounded-[4rem] bg-card/60 shadow-premium border border-white/5 flex items-center justify-center text-primary relative z-10 group-hover:rotate-12 transition-transform duration-700">
                   <Home size={80} className="animate-pulse" />
                </div>
                <div className="space-y-6 relative z-10">
                   <p className="text-5xl font-black italic tracking-tighter text-foreground uppercase leading-none">Habitat Selection Required</p>
                   <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.6em] italic leading-none">Identify corresponding residency node to initiate audit sequence</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </PageHeader>
  );
}

function StatusBox({ title, available, icon: Icon, onToggle, readonly }: { title: string, available: boolean, icon: React.ElementType, onToggle: () => void, readonly: boolean }) {
  return (
    <Card 
      className={`rounded-[3.5rem] border border-white/5 transition-all duration-700 relative overflow-hidden group h-full shadow-premium ${available ? "bg-card/40 backdrop-blur-sm hover:shadow-premium-hover hover:-translate-y-3" : "bg-background/40 border-rose-500/20"} ${!readonly ? 'cursor-pointer' : ''}`}
      onClick={!readonly ? onToggle : undefined}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-12 -mt-12 transition-colors duration-700 pointer-events-none ${available ? "bg-emerald-500/5 group-hover:bg-emerald-500/10" : "bg-rose-500/5 group-hover:bg-rose-500/10"}`} />
      <CardContent className="p-12 flex flex-col justify-between gap-12 h-full relative z-10">
        <div className="flex justify-between items-start">
           <div className={`p-8 rounded-[2.5rem] shadow-inner transition-all duration-700 border ${available ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5 group-hover:rotate-12 group-hover:scale-110" : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5 group-hover:rotate-12 group-hover:scale-110"}`}>
              <Icon size={48} />
           </div>
           <Badge className={`rounded-2xl px-6 h-10 font-black italic text-[11px] uppercase tracking-widest border-none shadow-inner flex items-center justify-center ${available ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
             {available ? "OPERATIONAL" : "FAILURE"}
           </Badge>
        </div>

        <div className="space-y-4">
           <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic leading-none">Asset Identification Node</p>
           <p className="font-black italic text-4xl text-foreground tracking-tighter uppercase leading-none group-hover:text-primary transition-colors duration-700">{title}</p>
        </div>

        {!readonly && (
           <div className="flex justify-end pt-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-700">
              <p className="text-[12px] font-black italic text-primary uppercase tracking-[0.3em] leading-none animate-pulse">Execute Status Toggle</p>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
