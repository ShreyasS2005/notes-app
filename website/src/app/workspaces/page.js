"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { collaborationService } from "@/services/collaborationService";
import CollaborationRoom from "@/components/CollaborationRoom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  ChevronRight,
  Users2,
  Clock,
  Shield,
  Search,
  Loader2,
  Sparkles
} from "lucide-react";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = collaborationService.subscribeToRooms(user.uid, (fetchedRooms) => {
      setRooms(fetchedRooms);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      const room = await collaborationService.createRoom(user.uid, {
        name: newRoomName,
        description: "A shared space for collective intelligence."
      });
      setNewRoomName('');
      setIsCreating(false);
      setActiveRoomId(room.id);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (activeRoomId) {
    return (
      <ProtectedRoute>
        <div className="h-screen pt-16">
          <CollaborationRoom
            roomId={activeRoomId}
            onLeave={() => setActiveRoomId(null)}
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">

          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                Team <span className="text-cyan-500">Nexus</span>
              </h1>
              <p className="text-gray-500 font-medium">Coordinate, collaborate, and conquer complex topics together.</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
            >
              <Plus className="w-6 h-6" />
              New Workspace
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {isCreating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass p-8 rounded-3xl border border-cyan-500/20 mb-8"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">Initialize New Workspace</h3>
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Workspace Name (e.g., Quantum Physics Study Group)"
                        className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan-500"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        required
                      />
                      <div className="flex gap-3">
                        <button type="submit" className="flex-1 py-4 rounded-xl bg-cyan-500 text-black font-black uppercase tracking-widest text-xs">Establish Room</button>
                        <button type="button" onClick={() => setIsCreating(false)} className="px-8 py-4 rounded-xl bg-white/5 text-gray-400 font-bold text-xs">Cancel</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {rooms.length === 0 ? (
                <div className="glass p-16 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="p-6 rounded-3xl bg-white/5 text-gray-700 mb-6">
                    <Users2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-500">No Active Workspaces</h2>
                  <p className="text-gray-600 max-w-sm mt-2 mb-8">Create a room to start collaborating with your team in real-time.</p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 font-bold text-sm"
                  >
                    Create My First Room
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {rooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setActiveRoomId(room.id)}
                      className="group glass p-6 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-all">{room.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-1">
                              <Users2 className="w-3 h-3" /> {room.members?.length || 0} Members
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {room.ownerId === user.uid ? 'Owner' : 'Member'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-cyan-500 transition-all" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Sparkles className="w-12 h-12 text-cyan-500" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-6">Collaboration Pulse</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Total Workspaces</span>
                     <span className="text-sm font-bold text-white">{rooms.length}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Teammates</span>
                     <span className="text-sm font-bold text-white">
                       {[...new Set(rooms.flatMap(r => r.members))].length}
                     </span>
                   </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Activity Feed
                </h3>
                <div className="space-y-4">
                  {rooms.slice(0, 3).map(room => (
                    <div key={room.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-black">Latest Activity</p>
                      <p className="text-xs font-bold text-gray-300 truncate">{room.name}</p>
                    </div>
                  ))}
                  {rooms.length === 0 && <p className="text-xs text-gray-600 italic">No activity yet</p>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
