"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function UltraSettingsPage() {

  // SECURITY
  const [twoFA, setTwoFA] = useState(true);
  const [alerts, setAlerts] = useState(true);

  // SYSTEM
  const [darkMode, setDarkMode] = useState(false);
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
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">Ultra Settings</h1>
        <p className="text-gray-500">
          Control every aspect of your college management system.
        </p>
      </div>

      {/* SECURITY CENTER */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Security Center</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <SettingRow
            title="Two-Factor Authentication"
            desc="Require OTP for admins during login."
            checked={twoFA}
            onChange={setTwoFA}
          />

          <SettingRow
            title="Login Alerts"
            desc="Receive alerts for suspicious logins."
            checked={alerts}
            onChange={setAlerts}
          />

          <div className="space-y-2">
            <Label>Password Policy</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select strength"/>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="military">Military Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* ACADEMIC AUTOMATION */}
      <Card>
        <CardHeader>
          <CardTitle>🎓 Academic Automation</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <SettingRow
            title="Smart Attendance System"
            desc="Auto-track attendance using biometric or QR."
            checked={attendance}
            onChange={setAttendance}
          />

          <SettingRow
            title="AI Timetable Generator"
            desc="Automatically create clash-free timetables."
            checked={aiTimetable}
            onChange={setAiTimetable}
          />

          <SettingRow
            title="Exam Result Automation"
            desc="Publish results instantly after evaluation."
            checked={true}
            onChange={()=>{}}
          />

        </CardContent>
      </Card>

      {/* HOSTEL + CAMPUS */}
      <Card>
        <CardHeader>
          <CardTitle>🏨 Campus Controls</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <SettingRow
            title="Night Canteen"
            desc="Allow food ordering after hours."
            checked={canteen}
            onChange={setCanteen}
          />

          <SettingRow
            title="Visitor Management"
            desc="Require approval before entry."
            checked={visitor}
            onChange={setVisitor}
          />

          <SettingRow
            title="Hostel Booking"
            desc="Students can reserve rooms online."
            checked={true}
            onChange={()=>{}}
          />

        </CardContent>
      </Card>

      {/* PAYMENT SYSTEM */}
      <Card>
        <CardHeader>
          <CardTitle>💳 Payment Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <SettingRow
            title="Enable UPI Payments"
            desc="Accept Google Pay, PhonePe, Paytm."
            checked={upi}
            onChange={setUpi}
          />

          <SettingRow
            title="Enable Card Payments"
            desc="Allow debit & credit cards."
            checked={card}
            onChange={setCard}
          />

          <SettingRow
            title="Auto Fee Reminders"
            desc="Send reminders before due date."
            checked={true}
            onChange={()=>{}}
          />

        </CardContent>
      </Card>

      {/* SYSTEM PREFERENCES */}
      <Card>
        <CardHeader>
          <CardTitle>🌐 System Preferences</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <SettingRow
            title="Dark Mode"
            desc="Reduce eye strain with dark UI."
            checked={darkMode}
            onChange={setDarkMode}
          />

          <SettingRow
            title="Maintenance Mode"
            desc="Temporarily disable the platform."
            checked={maintenance}
            onChange={setMaintenance}
          />

          <div className="space-y-2">
            <Label>System Language</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose language"/>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="tamil">Tamil</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* SUPER ADMIN */}
      <Card>
        <CardHeader>
          <CardTitle>👑 Super Admin Panel</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex gap-2">
            <Input
              placeholder="Enter super admin email"
              value={newAdmin}
              onChange={(e)=>setNewAdmin(e.target.value)}
            />
            <Button onClick={addAdmin}>Add</Button>
          </div>

          {admins.map((admin, index)=>(
            <div
              key={index}
              className="flex justify-between items-center border p-2 rounded-lg"
            >
              {admin}
              <Button
                variant="destructive"
                onClick={()=>removeAdmin(index)}
              >
                Remove
              </Button>
            </div>
          ))}

          <Button variant="secondary">
            View Audit Logs
          </Button>

        </CardContent>
      </Card>

    </div>
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
    <div className="flex justify-between items-center">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}
