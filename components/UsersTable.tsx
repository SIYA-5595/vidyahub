"use client";

import React, { useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Calendar, 
  Shield, 
  User as UserIcon,
  Tag,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  AlertCircle,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsers, UserData, AddUserData } from "@/hooks/useUsers";
import { toast } from "sonner";
import AdminUserForm from "./AdminUserForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function UsersTable() {
  const { users, loading, error, blockUser, unblockUser, deleteUser, updateUser } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Edit State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const itemsPerPage = 8;

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Handlers
  const handleToggleBlock = async (user: UserData) => {
    setActionLoading(user.uid);
    try {
      if (user.status === "active") {
        await blockUser(user.uid);
        toast.success("Access Revoked.");
      } else {
        await unblockUser(user.uid);
        toast.success("Access Restored.");
      }
    } catch {
      toast.error("Protocol violation.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: UserData) => {
    if (!confirm(`Purge identity ${user.name} from nexus?`)) return;
    
    setActionLoading(user.uid);
    try {
      await deleteUser(user.uid);
      toast.success("Identity Purged.");
    } catch {
      toast.error("Purge failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: AddUserData) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.uid, { name: data.name, role: data.role });
      toast.success("Identity Modified.");
    } catch {
       toast.error("Modification failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Nexus</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <div>
          <h3 className="font-black text-rose-500 uppercase tracking-tight">Sync Failure</h3>
          <p className="text-sm text-rose-400 mt-1">{error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Search indexing..."
            className="w-full pl-12 pr-4 h-12 bg-card border border-border rounded-2xl text-sm text-foreground focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary transition-all shadow-sm placeholder:text-muted-foreground/20"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex bg-card p-1 rounded-xl border border-border shadow-sm">
          {["all", "admin", "student"].map((role) => (
            <Button
              key={role}
              variant="ghost"
              size="sm"
              onClick={() => {
                setRoleFilter(role);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                roleFilter === role ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              {role}s
            </Button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-[2.5rem] border border-border bg-card shadow-premium overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/30 hover:bg-background/30 border-b border-border">
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Identity Nodes</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Nexus Access & Status</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Temporal Stamp</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 text-right">Node Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((user) => (
                <TableRow key={user.uid} className={cn(
                  "hover:bg-background/20 transition-colors group border-border",
                  user.status === "blocked" && "opacity-60 grayscale-[0.5]"
                )}>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center font-black italic shadow-sm group-hover:scale-110 transition-transform",
                        user.status === "blocked" ? "bg-muted text-muted-foreground" : (user.role === 'admin' ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")
                      )}>
                        <AvatarFallback className="bg-transparent">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-black text-foreground tracking-tight">{user.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="h-3 w-3 text-muted-foreground/40" />
                          <p className="text-xs font-bold text-muted-foreground/40">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={user.role === "admin" ? "success" : "secondary"}
                          className="px-3 py-1 rounded-lg border-none"
                        >
                          {user.role === "admin" ? <Shield className="h-3 w-3 mr-2" /> : <UserIcon className="h-3 w-3 mr-2" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                        </Badge>
                        <Badge 
                          className={cn(
                            "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm",
                            user.status === "active" ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/10" : "text-rose-500 bg-rose-500/10 border border-rose-500/10"
                          )}
                        >
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <Tag className="h-3 w-3 text-muted-foreground/20" />
                        <span className="text-[10px] font-black text-muted-foreground/20 tracking-widest uppercase">{user.uid}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground/20" />
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">
                          {user.createdAt?.seconds 
                            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                            : "Legacy Record"}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.1em]">Verified Node</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {actionLoading === user.uid ? (
                         <Loader2 className="h-5 w-5 text-primary animate-spin" />
                       ) : (
                         <>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(user)}
                              className="h-10 w-10 text-muted-foreground/40 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                              title="Modify Node"
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleBlock(user)}
                              className={cn(
                                "h-10 w-10 rounded-xl transition-all",
                                user.status === "active" 
                                  ? "text-muted-foreground/40 hover:bg-rose-500/10 hover:text-rose-500" 
                                  : "text-emerald-500 hover:bg-emerald-500/10"
                              )}
                              title={user.status === "active" ? "Revoke Access" : "Restore Access"}
                            >
                              {user.status === "active" ? <Ban className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(user)}
                              className="h-10 w-10 text-muted-foreground/40 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-all"
                              title="Purge Node"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                         </>
                       )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="px-8 py-20 text-center border-none">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Search className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Zero Nodes Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
           </Table>
        </CardContent>

        {/* Pagination */}
        <div className="px-8 py-5 bg-background/30 border-t border-border flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
            Nodes <span className="text-foreground">{indexOfFirstItem + 1}</span>-<span className="text-foreground">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of <span className="text-foreground">{filteredUsers.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1 overflow-x-auto max-w-[100px] md:max-w-none">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "h-8 w-8 rounded-xl text-[10px] font-black transition-all shrink-0",
                    currentPage === i + 1 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:text-primary-foreground" 
                      : "bg-card border border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-9 w-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AdminUserForm 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={editingUser}
      />
    </div>
  );
}
