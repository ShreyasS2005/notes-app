"use client";
import React, { useState, useEffect, useMemo } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import NoteList from "@/components/NoteList";
import Editor from "@/components/Editor";
import AIPanel from "@/components/AIPanel";
import OCRScanner from "@/components/OCRScanner";
import { noteService } from "@/services/noteService";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Loader2, Plus, Camera, Type } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanTitle, setScanTitle] = useState("");

  const activeNote = useMemo(() => notes.find((n) => n.id === activeNoteId), [notes, activeNoteId]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = noteService.subscribeToNotes(user.uid, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleCreateNote = async (title = "Untitled Note", content = "") => {
    try {
      const docRef = await noteService.createNote(user.uid, { title, content });
      setActiveNoteId(docRef.id);
      setShowScanner(false);
      setScanTitle("");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleOCRResult = (extractedText) => {
    if (!extractedText) return;
    handleCreateNote(scanTitle || "Scanned Note", `<p>${extractedText.replace(/\n/g, '<br>')}</p>`);
  };

  const handleUpdateContent = (content) => noteService.updateNote(user.uid, activeNoteId, { content });
  const handleUpdateTitle = (title) => noteService.updateNote(user.uid, activeNoteId, { title });
  const handleSetReminder = (reminderAt) => noteService.setReminder(user.uid, activeNoteId, reminderAt);
  const handleToggleFavorite = (id, status) => noteService.toggleFavorite(user.uid, id, status);
  const handleDeleteNote = (id) => {
    noteService.deleteNote(user.uid, id);
    if (activeNoteId === id) setActiveNoteId(notes.length > 1 ? notes.find(n => n.id !== id)?.id : null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-[#050505] overflow-hidden pt-16">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-cyan-500 rounded-full text-black shadow-lg">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        <motion.div animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }} className="h-full overflow-hidden border-r border-gray-800">
          <div className="flex flex-col h-full">
            <NoteList notes={notes} activeNoteId={activeNoteId} onNoteSelect={setActiveNoteId} onCreateNote={() => handleCreateNote()} onDeleteNote={handleDeleteNote} onToggleFavorite={handleToggleFavorite} />
            <div className="p-4 border-t border-gray-800 bg-[#0a0a0c]">
              <button onClick={() => setShowScanner(true)} className="w-full py-3 px-4 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Camera className="w-4 h-4" /> Vision Note Upload
              </button>
            </div>
          </div>
        </motion.div>

        <main className="flex-1 h-full overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            {showScanner ? (
              <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-xl z-20">
                <div className="w-full max-w-xl">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Vision <span className="text-cyan-500">Note</span></h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Upload title and photo to digitize fully</p>
                  </div>

                  <div className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 ml-2">1. Set Note Title</label>
                      <div className="relative group">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="e.g., Biology Chapter 4"
                          className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all"
                          value={scanTitle}
                          onChange={(e) => setScanTitle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 ml-2">2. Upload Note Photo</label>
                      <OCRScanner onExtract={handleOCRResult} />
                    </div>

                    <button onClick={() => setShowScanner(false)} className="w-full py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all">Cancel Mission</button>
                  </div>
                </div>
              </motion.div>
            ) : activeNote ? (
              <Editor key={activeNote.id} title={activeNote.title} content={activeNote.content} reminderAt={activeNote.reminderAt} onTitleChange={handleUpdateTitle} onChange={handleUpdateContent} onSetReminder={handleSetReminder} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-800"><Plus className="w-10 h-10 text-gray-700" /></div>
                <h2 className="text-2xl font-bold text-white mb-2 italic">Select or initialize a note</h2>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => handleCreateNote()} className="px-8 py-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl hover:bg-cyan-500/20 transition-all font-black uppercase tracking-widest text-[10px]">New Protocol</button>
                  <button onClick={() => setShowScanner(true)} className="px-8 py-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl hover:bg-purple-500/20 transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2"><Camera className="w-4 h-4" /> Vision Sync</button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
        <AIPanel reminderAt={activeNote?.reminderAt} onSetReminder={handleSetReminder} />
      </div>
    </ProtectedRoute>
  );
}
