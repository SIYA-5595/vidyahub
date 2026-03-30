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

// import { libraryBooks } from "@/data/mockData"; // Replaced with Firestore
import { PageHeader } from "@/components/ui/page-header";
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
  available: "bg-green-500/10 text-green-600 border-green-500/20",
  reserved: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  borrowed: "bg-red-500/10 text-red-600 border-red-500/20",
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
        userName: `${user.firstName} ${user.lastName}`,
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
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 gap-3 items-center">
           <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
             <Input
               className="h-10 w-64 pl-10 pr-4 bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-white/30 text-white placeholder:text-white/40 rounded-xl"
               placeholder="Query archive..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

           <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-44 bg-white/10 border-0 text-white rounded-xl focus:ring-1 focus:ring-white/30">
                <Filter className="mr-2 h-4 w-4 opacity-40" />
                <SelectValue placeholder="Manifest Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-2xl">
                <SelectItem value="all">Complete Manifest</SelectItem>
                <SelectItem value="available">Ready for Intake</SelectItem>
                <SelectItem value="reserved">Hold Registry</SelectItem>
                <SelectItem value="borrowed">Active Deployment</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-10 px-6 bg-primary text-white hover:bg-white/90 hover:text-primary rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center gap-3"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? "CLOSE ARCHIVE" : "INITIATE VOLUME"}
            </Button>
        </div>
      }
    >
      <div className="space-y-12">
        {showAddForm && (
           <Card className="rounded-[4rem] border-0 shadow-2xl bg-white overflow-hidden p-12 space-y-10">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Volume Nomenclature</p>
                    <Input placeholder="E.G. QUANTUM DYNAMICS V4" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Knowledge Architect</p>
                    <Input placeholder="E.G. PROF. VANCE" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg uppercase tracking-tight px-8"/>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2 italic">Archive Index (ISBN)</p>
                    <Input placeholder="E.G. 978-3-16-148410-0" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} className="h-16 rounded-2xl bg-secondary/5 border-0 shadow-inner font-black italic text-lg tracking-tight px-8"/>
                 </div>
              </div>
              <Button onClick={addBook} disabled={isSubmitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black italic tracking-tighter text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : "EXECUTE MANIFESTATION"}
              </Button>
           </Card>
        )}
        {/* STATS */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Volume Count", value: stats.total, icon: BookOpen, color: "text-blue-500" },
            { label: "Intake Ready", value: stats.available, icon: LibraryIcon, color: "text-emerald-500" },
            { label: "Hold Queue", value: stats.reserved, icon: Clock, color: "text-amber-500" },
            { label: "External Sync", value: stats.borrowed, icon: User, color: "text-rose-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-[2rem] border-0 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                <CardContent className="p-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-black italic tracking-tighter">{stat.value}</p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl bg-secondary/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* TABLE */}
        <Card className="rounded-[2.5rem] border-0 bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-10 border-b border-secondary/5">
             <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Archive Registry Status Report</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/5">
                <TableRow className="hover:bg-transparent border-b-secondary/5">
                  <TableHead className="h-16 px-10 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Archive Designation</TableHead>
                  <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Knowledge Architect</TableHead>
                  <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status Header</TableHead>
                  <TableHead className="h-16 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Volume Stock</TableHead>
                  <TableHead className="h-16 px-10 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id} className="hover:bg-secondary/5 transition-colors border-b-secondary/5 group">
                    <TableCell className="px-10 py-8">
                       <div className="space-y-1">
                          <div className="font-black text-lg italic uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors">{book.title}</div>
                          <div className="text-[10px] text-muted-foreground font-black tracking-widest flex items-center gap-2">
                             <span className="opacity-40">INDEX:</span> {book.isbn}
                          </div>
                       </div>
                    </TableCell>

                    <TableCell>
                       <p className="text-sm font-bold uppercase tracking-tight text-gray-600">
                         {book.author}
                       </p>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize font-black text-[9px] tracking-widest h-6 px-3 rounded-lg border-0 ${statusColors[book.status]}`}
                      >
                        {book.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                       <p className="font-black italic text-lg tracking-tighter">{book.copies}</p>
                    </TableCell>

                    <TableCell className="px-10 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={book.status === "available" ? "default" : "outline"}
                            className={`h-10 px-6 rounded-xl font-black italic tracking-tight text-xs transition-all ${book.status === 'available' ? 'bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20' : ''}`}
                            disabled={book.status !== "available"}
                            onClick={() => setSelectedBook(book)}
                          >
                            RESERVE VOLUME
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-10 bg-white">
                          <DialogHeader className="space-y-3">
                            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">Intake Acquisition</DialogTitle>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Authorize volume reservation for short-term archival sync</p>
                          </DialogHeader>

                          {selectedBook && (
                            <div className="py-8 space-y-6">
                               <div className="bg-secondary/5 p-8 rounded-[1.5rem] space-y-2 border border-secondary/10">
                                  <p className="text-2xl font-black italic tracking-tighter text-primary uppercase leading-tight">
                                    {selectedBook.title}
                                  </p>
                                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Architect: {selectedBook.author}
                                  </p>
                               </div>

                               <div className="flex gap-4 items-start p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-amber-700">
                                 <Info className="h-5 w-5 mt-0.5 shrink-0 opacity-60" />
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Protocol Notice</p>
                                    <p className="text-xs font-medium leading-relaxed opacity-80">This volume will be held in synchronization for 24 hours. Failure to initiate physical intake will result in automatic de-reservation.</p>
                                 </div>
                               </div>
                            </div>
                          )}

                          <DialogFooter className="gap-4 pt-4">
                            <Button variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest flex-1">Abort Acquisition</Button>
                            <Button 
                              onClick={handleReservation}
                              disabled={isSubmitting}
                              className="rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl shadow-primary/20"
                            >
                              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : "Authorize Sync"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredBooks.length === 0 && (
              <div className="text-center py-32 bg-secondary/5">
                <div className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] opacity-40">Void Search Profile: Zero Correlations Identified</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageHeader>
  );
}
