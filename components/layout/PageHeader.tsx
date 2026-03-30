"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Edit3, Check, X, Loader2 } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/timetable": "Timetable Generator",
  "/gpa-calculator": "GPA Calculator",
  "/syllabus": "Syllabus & Resources",
  "/performance": "Performance Analytics",
  "/research": "Research Repository",
  "/mess": "Mess Waste Tracker",
  "/laundry": "Laundry Booking",
  "/room": "Room Inventory",
  "/canteen": "Night Canteen",
  "/visitors": "Visitor Management",
  "/alumni": "Alumni Network",
  "/interviews": "Mock Interviews",
  "/partners": "Project Partners",
  "/clubs": "Tech Clubs",
  "/resume": "Resume Forum",
  "/library": "Library",
  "/wifi": "Wi-Fi Issues",
  "/counseling": "Counseling",
  "/scholarships": "Scholarships",
  "/lab": "Lab Equipment",
  "/events": "Fest Tickets",
  "/sports": "Sports Rental",
  "/qna": "Live Q&A",
  "/talent": "Talent Showcase",
  "/lost-found": "Lost & Found",
  "/settings": "Settings",
  "/profile": "My Profile",
};

interface PageMetadata {
  title: string;
  description: string;
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  const pathname = usePathname();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [liveData, setLiveData] = React.useState<PageMetadata>({ title: "", description: "" });

  // Load custom metadata from Firestore
  React.useEffect(() => {
    const docId = pathname.replace(/\//g, "_") || "root";
    const unsubscribe = onSnapshot(doc(db, "page-metadata", docId), (snapshot) => {
      if (snapshot.exists()) {
        setLiveData(snapshot.data() as PageMetadata);
      }
    });
    return () => unsubscribe();
  }, [pathname]);

  const saveMetadata = async () => {
    setIsSaving(true);
    try {
      const docId = pathname.replace(/\//g, "_") || "root";
      await setDoc(doc(db, "page-metadata", docId), {
        title: liveData.title,
        description: liveData.description,
        updatedAt: new Date()
      }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Meta Save Failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const displayTitle = liveData.title || title || routeTitles[pathname] || "VidyaHub";
  const displayDesc = liveData.description || description;

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div 
        className="rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10 overflow-hidden relative shadow-2xl shadow-primary/20 transition-all duration-500 hover:shadow-primary/30 group"
        style={{
          backgroundColor: 'color-mix(in oklab, var(--color-primary) 90%, transparent)',
        }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-foreground/5 rounded-full blur-[80px] pointer-events-none " />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 space-y-3 md:space-y-5 flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <input
                value={liveData.title || displayTitle}
                onChange={(e) => setLiveData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white/10 border-b-2 border-white/30 text-2xl md:text-6xl font-black tracking-tighter text-white outline-none py-2"
                autoFocus
              />
              <textarea
                value={liveData.description || displayDesc}
                onChange={(e) => setLiveData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white/10 border-b-2 border-white/30 text-white/85 text-base md:text-xl font-medium outline-none py-2 min-h-[100px]"
              />
              <div className="flex gap-2">
                <button onClick={saveMetadata} className="p-3 bg-white text-primary rounded-xl font-black flex items-center gap-2 hover:bg-white/90 text-sm">
                  {isSaving ? <Loader2 className="animate-spin h-3 w-3" /> : <Check className="h-4 w-4" />}
                  COMMIT
                </button>
                <button onClick={() => setIsEditing(false)} className="p-3 bg-white/10 text-white rounded-xl font-black hover:bg-white/20">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="group/text cursor-pointer" onDoubleClick={() => setIsEditing(true)}>
              <div className="flex items-center gap-4">
                <h1 
                  className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]"
                  style={{ color: 'color-mix(in oklab, var(--color-primary) 10%, white)' }}
                >
                  {displayTitle}
                </h1>
                <Edit3 
                  className="h-5 w-5 md:h-6 md:w-6 text-white/20 opacity-0 group-hover/text:opacity-100 transition-opacity" 
                  onClick={() => setIsEditing(true)}
                />
              </div>
              {displayDesc && (
                <p className="text-white/85 text-base md:text-xl font-medium max-w-3xl leading-relaxed mt-2 md:mt-4">
                  {displayDesc}
                </p>
              )}
            </div>
          )}
        </div>

        {actions && (
          <div className="relative z-10 flex items-center gap-3 md:gap-5">
            {actions}
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      {children && (
        <div className="bg-white/80 p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm min-h-[400px] border border-gray-100/50">
          {children}
        </div>
      )}
    </div>
  );
}
