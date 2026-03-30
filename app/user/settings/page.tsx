"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Shield, GraduationCap, Building2, CreditCard, Settings, Crown, Trash2, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function UltraSettingsPage() {

  // SECURITY
  const [twoFA, setTwoFA] = useState(true);
  const [alerts, setAlerts] = useState(true);

  // SYSTEM
  const [darkMode, setDarkMode] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  // ACADEMICS
  const [attendance, setAttendance] = useState(true);
  const [aiTimetable, setAiTimetable] = useState(false);

  // HOSTEL
  const [canteen, setCanteen] = useState(true);
  const [visitor, setVisitor] = useState(true);

  // PAYMENTS
  const [upi, setUpi] = useState(true);
  const [card, setCard] = useState(false);

  // SUPER ADMINS
  const [admins, setAdmins] = useState<string[]>([
    "superadmin@college.edu"
  ]);
  const [newAdmin, setNewAdmin] = useState("");

  const addAdmin = () => {
    if (!newAdmin) return;
    setAdmins([...admins, newAdmin]);
    setNewAdmin("");
  };

  const removeAdmin = (index:number) => {
    setAdmins(admins.filter((_, i) => i !== index));
  };

  return (
    <PageHeader
      title="Ultra Settings"
      description="Control every aspect of your college management system with precision"
    >
      <div className="space-y-8 md:space-y-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* SECURITY CENTER */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-foreground">
                  <Shield className="h-6 w-6 text-primary" />
                  Security Center
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <SettingRow
                  title="Two-Factor Authentication"
                  desc="Require OTP for admins during login synchronization."
                  checked={twoFA}
                  onChange={setTwoFA}
                />
                <SettingRow
                  title="Login Alerts"
                  desc="Receive alerts for suspicious temporal logins."
                  checked={alerts}
                  onChange={setAlerts}
                />
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Password Policy</Label>
                  <Select>
                    <SelectTrigger className="h-14 rounded-2xl bg-background/50 border border-white/5 text-foreground font-black px-6 shadow-inner italic">
                      <SelectValue placeholder="Select Encryption Strength"/>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-white/5 bg-card shadow-2xl text-foreground">
                      <SelectItem value="basic" className="font-bold italic">Basic Security</SelectItem>
                      <SelectItem value="strong" className="font-bold italic">Strong Encryption</SelectItem>
                      <SelectItem value="military" className="font-bold italic">Military Grade Protocol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ACADEMIC AUTOMATION */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-foreground">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  Academic Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <SettingRow
                  title="Smart Attendance System"
                  desc="Auto-track attendance using biometric or QR matrix."
                  checked={attendance}
                  onChange={setAttendance}
                />
                <SettingRow
                  title="AI Timetable Generator"
                  desc="Automatically create clash-free temporal schedules."
                  checked={aiTimetable}
                  onChange={setAiTimetable}
                />
                <SettingRow
                  title="Exam Result Automation"
                  desc="Publish results instantly after pedagogical evaluation."
                  checked={true}
                  onChange={()=>{}}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* HOSTEL + CAMPUS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-foreground">
                  <Building2 className="h-6 w-6 text-primary" />
                  Campus Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <SettingRow
                  title="Night Canteen"
                  desc="Allow nutritional intake during late-cycle hours."
                  checked={canteen}
                  onChange={setCanteen}
                />
                <SettingRow
                  title="Visitor Management"
                  desc="Require architectural approval before node entry."
                  checked={visitor}
                  onChange={setVisitor}
                />
                <SettingRow
                  title="Hostel Booking"
                  desc="Inhabitants can reserve slots via local network."
                  checked={true}
                  onChange={()=>{}}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* PAYMENT SYSTEM */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-foreground">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Financial Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <SettingRow
                  title="Enable UPI Payments"
                  desc="Accept all global digital credit protocols."
                  checked={upi}
                  onChange={setUpi}
                />
                <SettingRow
                  title="Enable Card Payments"
                  desc="Allow traditional magnetic & chip assets."
                  checked={card}
                  onChange={setCard}
                />
                <SettingRow
                  title="Auto Fee Reminders"
                  desc="Send temporal alerts before credit due window."
                  checked={true}
                  onChange={()=>{}}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* SYSTEM PREFERENCES */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-foreground">
                  <Settings className="h-6 w-6 text-primary" />
                  System Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <SettingRow
                  title="Arctic Dark Mode"
                  desc="Protect retinal sensors with deep navy UI."
                  checked={darkMode}
                  onChange={setDarkMode}
                />
                <SettingRow
                  title="Maintenance Mode"
                  desc="Temporarily desync the platform for calibration."
                  checked={maintenance}
                  onChange={setMaintenance}
                />
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Interface Dialect</Label>
                  <Select defaultValue="english">
                    <SelectTrigger className="h-14 rounded-2xl bg-background/50 border border-white/5 text-foreground font-black px-6 shadow-inner italic">
                      <SelectValue placeholder="Choose Dialect"/>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-white/5 bg-card shadow-2xl text-foreground">
                      <SelectItem value="english" className="font-bold italic">Standard English</SelectItem>
                      <SelectItem value="tamil" className="font-bold italic">Tamil Protocol</SelectItem>
                      <SelectItem value="hindi" className="font-bold italic">Hindi Protocol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SUPER ADMIN */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-foreground">
                  <Crown className="h-6 w-6 text-primary" />
                  Super Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter super admin node email"
                    value={newAdmin}
                    onChange={(e)=>setNewAdmin(e.target.value)}
                    className="h-14 rounded-2xl bg-background/50 border border-white/5 text-foreground font-black px-6 shadow-inner italic placeholder:text-muted-foreground/10"
                  />
                  <Button onClick={addAdmin} className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black border-none shadow-lg shadow-primary/20 transition-all active:scale-95 italic">MANIFEST</Button>
                </div>

                 <div className="space-y-4">
                  {admins.map((admin, index)=>(
                    <div
                      key={index}
                      className="flex justify-between items-center bg-background/50 border border-white/5 p-4 rounded-2xl group hover:border-primary/20 transition-all shadow-inner"
                    >
                      <span className="font-black italic text-foreground opacity-80 uppercase tracking-tight">{admin}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={()=>removeAdmin(index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button variant="secondary" className="w-full h-14 rounded-2xl bg-background/50 hover:bg-background/80 text-foreground font-black italic uppercase text-[10px] tracking-[0.2em] border border-white/5 shadow-inner transition-all active:scale-[0.98]">
                  ACCESS SYSTEM AUDIT LOGS
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageHeader>
  );
}

// ✅ Reusable Row Component
function SettingRow({
  title,
  desc,
  checked,
  onChange,
}:{
  title:string;
  desc:string;
  checked:boolean;
  onChange:(v:boolean)=>void;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="space-y-1">
        <p className="font-black italic text-lg tracking-tight uppercase text-foreground leading-tight">{title}</p>
        <p className="text-xs font-semibold text-muted-foreground/60 leading-relaxed italic">{desc}</p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
