"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Edit3, Check, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const routeTitles: Record<string, string> = {
  "/user/dashboard": "My Dashboard",
  "/user/timetable": "Class Timetable",
  "/user/gpa-calculator": "GPA Calculator",
  "/user/syllabus": "Course Materials",
  "/user/performance": "Grades & Performance",
  "/user/research": "Research Papers",
  "/user/mess": "Dining & Mess",
  "/user/laundry": "Laundry Services",
  "/user/room": "Room Allotment",
  "/user/canteen": "Campus Canteen",
  "/user/visitors": "Visitors Log",
  "/user/alumni": "Alumni Network",
  "/user/interviews": "Interview Prep",
  "/user/partners": "Hiring Partners",
  "/user/clubs": "Student Clubs",
  "/user/resume": "Resume Builder",
  "/user/library": "Digital Library",
  "/user/wifi": "Wi-Fi Hub",
  "/user/counseling": "Student Wellness",
  "/user/scholarships": "Available Scholarships",
  "/user/lab": "Lab Equipment",
  "/user/events": "College Events",
  "/user/sports": "Sports Facility",
  "/user/qna": "Ask Questions",
  "/user/talent": "My Portfolio",
  "/user/lost-found": "Lost & Found",
  "/user/settings": "Account Settings",
  "/user/profile": "Profile Info",
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
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5 flex-1 group">
          {isEditing ? (
            <div className="flex flex-col gap-4 max-w-2xl bg-muted/30 p-4 rounded-xl border border-muted-foreground/10">
              <input
                value={liveData.title || displayTitle}
                onChange={(e) => setLiveData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none border-b border-primary/20 pb-1"
                autoFocus
              />
              <textarea
                value={liveData.description || displayDesc}
                onChange={(e) => setLiveData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-transparent text-muted-foreground text-sm font-medium outline-none border-b border-primary/10 min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveMetadata} disabled={isSaving} className="gap-2 rounded-lg">
                  {isSaving ? <Loader2 className="animate-spin h-3 w-3" /> : <Check className="h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="rounded-lg">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="cursor-pointer relative group/meta" 
              onDoubleClick={() => setIsEditing(true)}
              title="Double click to edit page info"
            >
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground group-hover/meta:text-primary transition-colors">
                  {displayTitle}
                </h1>
                <Edit3 
                  className="h-4 w-4 text-muted-foreground opacity-0 group-hover/meta:opacity-100 transition-opacity cursor-pointer" 
                  onClick={() => setIsEditing(true)}
                />
              </div>
              {displayDesc && (
                <p className="text-muted-foreground max-w-3xl text-base leading-relaxed mt-1">
                  {displayDesc}
                </p>
              )}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      {children && (
        <div className="relative min-h-[400px]">
          {children}
        </div>
      )}
    </div>
  );
}
