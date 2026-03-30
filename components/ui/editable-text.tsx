"use client";

import React from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Edit3, Check, X, Loader2 } from "lucide-react";

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  collectionName?: string;
  tag?: keyof React.JSX.IntrinsicElements;
}

export function EditableText({ 
  id, 
  defaultText, 
  className = "", 
  collectionName = "ui-copy",
  tag: Tag = "h2"
}: EditableTextProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [text, setText] = React.useState(defaultText || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [liveText, setLiveText] = React.useState("");

  React.useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, collectionName, id), (snapshot) => {
      if (snapshot.exists()) {
        setLiveText(snapshot.data().text || "");
      }
    });
    return () => unsubscribe();
  }, [id, collectionName]);

  const save = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, collectionName, id), {
        text: text,
        updatedAt: new Date()
      }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const displayText = liveText || defaultText;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full">
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          className={`bg-transparent border-b-2 border-primary outline-none flex-1 ${className}`}
          autoFocus
        />
        <button onClick={save} disabled={isSaving} className="text-emerald-500 hover:scale-110 transition-transform">
          {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-5 w-5" />}
        </button>
        <button onClick={() => setIsEditing(false)} className="text-rose-500 hover:scale-110 transition-transform">
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group/edit flex items-center gap-3 cursor-pointer" onDoubleClick={() => { setText(displayText); setIsEditing(true); }}>
      <Tag className={className}>{displayText}</Tag>
      <Edit3 
        className="h-4 w-4 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" 
        onClick={() => { setText(displayText); setIsEditing(true); }}
      />
    </div>
  );
}
