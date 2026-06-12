"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { noteService } from "@/services/noteService";
import { quizService } from "@/services/quizService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  History,
  FileText,
  Loader2,
  Construction
} from "lucide-react";

export default function StudyPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Fetch notes for selection
    const unsubscribe = noteService.subscribeToNotes(user.uid, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    // Fetch leaderboard and history
    quizService.getLeaderboard().then(setLeaderboard);
    quizService.getQuizHistory(user.uid).then(setHistory);

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left: Setup */}
            <div className="lg:col-span-2 space-y-8">
              <header>
                <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                  Study <span className="text-purple-500">Arena</span>
                </h1>
                <p className="text-gray-500 font-medium">Review your notes and track your progress.</p>
              </header>

              <div className="glass p-8 rounded-3xl border border-white/10 space-y-8">
                {/* Note Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-4 block">Select Subject Note</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {notes.map(note => (
                      <button
                        key={note.id}
                        onClick={() => setSelectedNote(note)}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-3 ${
                          selectedNote?.id === note.id
                            ? 'border-purple-500 bg-purple-500/10 text-white'
                            : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${selectedNote?.id === note.id ? 'bg-purple-500 text-black' : 'bg-gray-800'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold truncate text-sm">{note.title || 'Untitled'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                  <Construction className="w-12 h-12 text-gray-600 mb-4" />
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Interactive Features Coming Soon</h3>
                  <p className="text-gray-500 text-xs max-w-xs">We are currently upgrading our AI systems to provide better study tools. Stay tuned!</p>
                </div>
              </div>
            </div>

            {/* Right: Stats & Leaderboard */}
            <div className="space-y-8">
              <div className="glass p-6 rounded-3xl border border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-yellow-500 mb-6 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Leaderboard
                </h3>
                <div className="space-y-4">
                  {leaderboard.length === 0 ? (
                    <p className="text-center py-4 text-gray-600 text-sm italic">No data yet</p>
                  ) : (
                    leaderboard.map((player, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-gray-600 font-bold w-4">#{player.rank}</span>
                          <span className="text-sm font-bold text-gray-200">{player.name}</span>
                        </div>
                        <span className="text-xs font-bold text-purple-400">{player.xp.toLocaleString()} XP</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center gap-2">
                  <History className="w-4 h-4" /> Recent Sessions
                </h3>
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-center py-4 text-gray-600 text-sm italic">No history yet</p>
                  ) : (
                    history.map((session, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-300 truncate w-32">{session.noteTitle}</p>
                          <p className="text-[10px] text-gray-600 uppercase font-black">{session.difficulty}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-purple-500">{Math.round((session.score/session.totalQuestions)*100)}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
