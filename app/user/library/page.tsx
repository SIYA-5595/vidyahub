"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Library as LibraryIcon,
  Search,
  BookOpen,
  Clock,
  User,
  Filter,
  Info,
  Loader2,
  Plus,
} from "lucide-react";

import { onSnapshot, query, orderBy } from "firebase/firestore";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors: Record<string, string> = {
  available: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-inner",
  reserved: "bg-amber-500/20 text-amber-400 border-amber-500/20 shadow-inner",
  borrowed: "bg-rose-500/20 text-rose-400 border-rose-500/20 shadow-inner",
};

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: "available" | "reserved" | "borrowed";
  copies: number;
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    status: "available",
    copies: 1
  });

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "library-books"), orderBy("title", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
    });
    return () => unsubscribe();
  }, []);

  const addBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      toast.error("All mission parameters required for volume registration");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "library-books"), {
        ...newBook,
        copies: Number(newBook.copies),
        createdAt: serverTimestamp()
      });
      setNewBook({ title: "", author: "", isbn: "", status: "available", copies: 1 });
      setShowAddForm(false);
      toast.success("New volume successfully registered in nexus");
    } catch {
      toast.error("Volume registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReservation = async () => {
    if (!selectedBook || !user) {
      toast.error("User node authentication required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "library-reservations"), {
        userId: user.uid,
        userName: `${user.firstName || ''} ${user.lastName || ''}`,
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        isbn: selectedBook.isbn,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success("Volume Reservation Authorized");
      setSelectedBook(null);
    } catch {
      toast.error("Authorization Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || book.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: books.length,
    available: books.filter((b) => b.status === "available").length,
    reserved: books.filter((b) => b.status === "reserved").length,
    borrowed: books.filter((b) => b.status === "borrowed").length,
  };

  return (
    <PageHeader
      title="Archive Nexus"
      description="Centralized repository for institutional knowledge and high-density academic resources"
      actions={
        <div className="flex bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 gap-4 items-center shadow-premium">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-500" />
              <Input
                className="h-11 w-72 pl-12 pr-4 bg-background/50 border-white/5 focus-visible:ring-1 focus-visible:ring-primary/30 text-foreground placeholder:text-muted-foreground/20 rounded-xl transition-all font-black italic text-[10px] uppercase tracking-widest placeholder:italic placeholder:tracking-widest"
                placeholder="Query archive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
 
           <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-52 bg-background/50 border-white/5 text-foreground rounded-xl focus:ring-1 focus:ring-primary/30 font-black italic text-[10px] uppercase tracking-widest shadow-inner">
                <Filter className="mr-3 h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                <SelectValue placeholder="Manifest Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-white/5 bg-card/95 backdrop-blur-xl shadow-2xl text-foreground font-black italic text-[10px] uppercase tracking-[0.2em]">
                <SelectItem value="all">Complete Manifest</SelectItem>
                <SelectItem value="available">Ready for Intake</SelectItem>
                <SelectItem value="reserved">Hold Registry</SelectItem>
                <SelectItem value="borrowed">Active Deployment</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 border-none"
            >
              <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
              {showAddForm ? "CLOSE ARCHIVE" : "INITIATE VOLUME"}
            </Button>
        </div>
      }
    >
      <div className="space-y-16">
        {showAddForm && (
           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="rounded-[4rem] border border-white/5 shadow-premium bg-card/40 backdrop-blur-sm overflow-hidden p-12 space-y-10 group hover:shadow-premium-hover transition-all duration-700 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Volume Nomenclature</p>
                      <Input placeholder="E.G. QUANTUM DYNAMICS V4" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tighter px-8 text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all"/>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Knowledge Architect</p>
                      <Input placeholder="E.G. PROF. VANCE" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg uppercase tracking-tighter px-8 text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all"/>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 italic leading-none">Archive Index (ISBN)</p>
                      <Input placeholder="E.G. 978-3-16-148410-0" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} className="h-16 rounded-2xl bg-background/50 border border-white/5 shadow-inner font-black italic text-lg tracking-tighter px-8 text-foreground placeholder:text-muted-foreground/10 focus:ring-primary/20 transition-all"/>
                   </div>
                </div>
                <Button onClick={addBook} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all border-none relative overflow-hidden group/btn">
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse" />
                  {isSubmitting ? <Loader2 className="w-10 h-10 animate-spin mx-auto" /> : "EXECUTE MANIFESTATION"}
                </Button>
             </Card>
           </motion.div>
        )}

        {/* STATS */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Volume Count", value: stats.total, icon: BookOpen, color: "text-blue-400" },
            { label: "Intake Ready", value: stats.available, icon: LibraryIcon, color: "text-emerald-400" },
            { label: "Hold Queue", value: stats.reserved, icon: Clock, color: "text-amber-400" },
            { label: "External Sync", value: stats.borrowed, icon: User, color: "text-rose-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="rounded-[2.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium hover:shadow-premium-hover transition-all duration-700 group overflow-hidden relative">
                <CardContent className="p-10 flex items-center justify-between relative z-10">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none">
                      {stat.label}
                    </p>
                    <p className="text-5xl font-black italic tracking-tighter text-foreground leading-none">{stat.value}</p>
                  </div>
                  <div className={`h-16 w-16 rounded-2xl bg-background/50 border border-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner`}>
                    <stat.icon size={32} />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-background opacity-20" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* TABLE */}
        <Card className="rounded-[3.5rem] border border-white/5 bg-card/40 backdrop-blur-sm shadow-premium overflow-hidden group hover:shadow-premium-hover transition-all duration-700">
          <CardHeader className="p-12 border-b border-white/5 bg-background/20">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-foreground leading-none">Archive Registry</CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Institutional Knowledge Inventory - v2.4.0</p>
                </div>
                <Badge variant="secondary" className="rounded-xl h-10 px-8 bg-background/40 border border-white/5 text-foreground font-black italic uppercase tracking-widest italic shadow-inner">{filteredBooks.length} VOLUMES IDENTIFIED</Badge>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-background/40">
                  <TableRow className="hover:bg-transparent border-b border-white/5">
                    <TableHead className="h-16 px-12 font-black uppercase tracking-widest text-[10px] text-muted-foreground/40 italic">Archive Designation</TableHead>
                    <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground/40 italic">Knowledge Architect</TableHead>
                    <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground/40 italic">Status Header</TableHead>
                    <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground/40 italic">Volume Stock</TableHead>
                    <TableHead className="h-16 px-12 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground/40 italic">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id} className="hover:bg-primary/5 transition-all duration-500 border-b border-white/5 group/row">
                      <TableCell className="px-12 py-10">
                         <div className="space-y-3">
                            <div className="font-black text-2xl italic uppercase tracking-tight text-foreground group-hover/row:text-primary transition-colors leading-none">{book.title}</div>
                            <div className="text-[10px] text-muted-foreground/40 font-black tracking-[0.2em] flex items-center gap-3 italic leading-none">
                               <span className="opacity-20">INDEX NODE:</span> {book.isbn}
                            </div>
                         </div>
                      </TableCell>

                      <TableCell>
                         <p className="text-sm font-black italic uppercase tracking-widest text-muted-foreground/60 leading-none">
                           {book.author}
                         </p>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize font-black text-[10px] tracking-widest h-8 px-5 rounded-xl border-white/5 italic ${statusColors[book.status]}`}
                        >
                          {book.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                         <p className="font-black italic text-2xl tracking-tighter text-foreground leading-none">{book.copies} UNITS</p>
                      </TableCell>

                      <TableCell className="px-12 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant={book.status === "available" ? "default" : "outline"}
                              className={`h-12 px-8 rounded-2xl font-black italic tracking-widest text-[10px] uppercase transition-all active:scale-95 group/btn relative overflow-hidden ${book.status === 'available' ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/30 border-none' : 'border-white/5 text-muted-foreground/20 bg-background/20 cursor-not-allowed'}`}
                              disabled={book.status !== "available"}
                              onClick={() => setSelectedBook(book)}
                            >
                              {book.status === 'available' && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />}
                              RESERVE VOLUME
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="rounded-[4rem] border border-white/5 shadow-2xl p-16 bg-card/95 backdrop-blur-2xl max-w-2xl">
                            <DialogHeader className="space-y-6">
                              <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">Intake Acquisition</DialogTitle>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic leading-none">Authorize volume reservation for short-term archival sync</p>
                            </DialogHeader>

                            {selectedBook && (
                              <div className="py-12 space-y-10">
                                 <div className="bg-background/40 backdrop-blur-sm p-10 rounded-[2.5rem] space-y-4 border border-white/5 shadow-inner group/dialog-card">
                                    <p className="text-3xl font-black italic tracking-tighter text-primary uppercase leading-none group-hover/dialog-card:scale-105 transition-transform duration-700">
                                      {selectedBook.title}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic leading-none">
                                      {selectedBook.author} // KNOWLEDGE ARCHITECT
                                    </p>
                                 </div>

                                 <div className="flex gap-6 items-start p-8 bg-amber-500/5 rounded-[2rem] border border-amber-500/10 text-amber-200/60 shadow-inner">
                                   <Info className="h-8 w-8 shrink-0 opacity-60 text-amber-400 group-hover:rotate-12 transition-transform duration-700" />
                                   <div className="space-y-3">
                                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 italic leading-none">Protocol Notice // Reservation Sequence</p>
                                      <p className="text-sm font-black italic leading-relaxed opacity-80 uppercase tracking-tight">This volume will be held in synchronization for 24 hours. Failure to initiate physical intake will result in automatic de-reservation of the asset.</p>
                                   </div>
                                 </div>
                              </div>
                            )}

                            <DialogFooter className="gap-6 pt-6">
                              <Button variant="ghost" className="rounded-2xl h-16 font-black uppercase text-[10px] tracking-widest flex-1 text-muted-foreground/40 hover:bg-white/5 hover:text-foreground border-none italic transition-all">Abort Acquisition</Button>
                              <Button 
                                onClick={handleReservation}
                                disabled={isSubmitting}
                                className="rounded-2xl h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest flex-1 shadow-2xl shadow-primary/30 border-none relative overflow-hidden active:scale-95 transition-all"
                              >
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 animate-pulse" />
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Authorize Sync"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-48 bg-background/20 relative group overflow-hidden">
                <Search className="h-32 w-32 text-primary opacity-[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 space-y-4">
                  <div className="text-3xl font-black italic tracking-tighter text-muted-foreground/20 uppercase leading-none">Void Search Profile</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/10 italic leading-none">Zero correlations identified in registry</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageHeader>
  );
}
