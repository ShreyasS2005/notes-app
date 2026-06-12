import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Send,
  UserPlus,
  MessageSquare,
  MousePointer2,
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
  FileText,
  BrainCircuit,
  Trophy,
  Loader2
} from 'lucide-react';
import { collaborationService } from '@/services/collaborationService';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import Editor from './Editor';
import QuizPlayer from './QuizPlayer';
import debounce from 'lodash.debounce';

const Cursor = ({ user, x, y }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, x, y }}
    transition={{ type: 'spring', damping: 30, stiffness: 200 }}
    className="fixed pointer-events-none z-[100] flex flex-col items-start gap-1"
    style={{ left: 0, top: 0 }}
  >
    <MousePointer2 className="w-5 h-5 text-cyan-500 fill-cyan-500" />
    <span className="bg-cyan-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg">
      {user?.displayName || 'Anonymous'}
    </span>
  </motion.div>
);

const CollaborationRoom = ({ roomId, onLeave }) => {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [presence, setPresence] = useState([]);
  const [inputText, setInputText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [view, setView] = useState('notes');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const unsubRoom = collaborationService.subscribeToRoom(roomId, setRoomData);
    const unsubComments = collaborationService.subscribeToComments(roomId, setMessages);
    const unsubPresence = collaborationService.subscribeToPresence(roomId, setPresence);

    const handleMouseMove = (e) => {
      collaborationService.updatePresence(roomId, user.uid, {
        displayName: user.displayName,
        cursor: { x: e.clientX, y: e.clientY },
        lastActive: Date.now()
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      unsubRoom();
      unsubComments();
      unsubPresence();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [roomId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNoteChange = (content) => {
    collaborationService.updateSharedNote(roomId, user.uid, {
      content,
      title: roomData?.sharedNote?.title || "Collaborative Note"
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await collaborationService.addComment(roomId, user.uid, inputText, user.displayName);
    setInputText('');
    updateTyping(false);
  };

  const updateTyping = useCallback(
    debounce((typing) => {
      collaborationService.updatePresence(roomId, user.uid, { isTyping: typing });
    }, 500),
    [roomId, user]
  );

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await collaborationService.inviteUserByEmail(roomId, inviteEmail);
      alert('Invitation sent successfully!');
      setInviteEmail('');
      setShowInvite(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const generateTeamQuiz = async () => {
    if (!roomData?.sharedNote?.content) return;
    setIsGeneratingQuiz(true);
    try {
      await collaborationService.generateSharedQuiz(roomId, roomData.sharedNote.content);
    } catch (error) {
      alert("Failed to generate quiz: " + error.message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-hidden relative">
      {/* Cursors */}
      {presence.filter(p => p.userId !== user.uid && p.cursor && (Date.now() - (p.lastActive || 0) < 5000)).map(p => (
        <Cursor key={p.userId} user={p} x={p.cursor.x} y={p.cursor.y} />
      ))}

      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {presence.slice(0, 3).map((p, i) => (
              <div
                key={p.userId}
                className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-black flex items-center justify-center text-[10px] font-bold text-cyan-400"
                title={p.displayName}
              >
                {p.displayName?.[0] || 'U'}
              </div>
            ))}
            {presence.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-[10px] font-bold text-gray-400">
                +{presence.length - 3}
              </div>
            )}
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
            {roomData?.name || 'Live Session'}
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 border border-white/10">
          <button
            onClick={() => setView('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'notes' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Notes
          </button>
          <button
            onClick={() => setView('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'quiz' ? 'bg-purple-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <BrainCircuit className="w-4 h-4" /> Team Quiz
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Invite
          </button>
          <button
            onClick={onLeave}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[url('/grid.svg')] bg-center">
          {view === 'notes' ? (
            <div className="max-w-4xl mx-auto py-12 px-8 h-full">
              <Editor
                content={roomData?.sharedNote?.content || ""}
                onChange={handleNoteChange}
                title={roomData?.sharedNote?.title || "Collaborative Note"}
                onTitleChange={(title) => collaborationService.updateSharedNote(roomId, user.uid, { ...roomData.sharedNote, title })}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8">
              {roomData?.sharedQuiz ? (
                <div className="w-full max-w-4xl bg-black/40 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
                   <div className="p-8 border-b border-white/10 flex justify-between items-center bg-purple-500/5">
                      <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-purple-500" />
                        Team Challenge Protocol
                      </h2>
                      <button
                        onClick={generateTeamQuiz}
                        disabled={isGeneratingQuiz}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all flex items-center gap-2"
                      >
                        {isGeneratingQuiz ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Refresh Quiz
                      </button>
                   </div>
                   <QuizPlayer
                     quiz={roomData.sharedQuiz}
                     onComplete={(results) => console.log("Quiz finished", results)}
                   />
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-purple-500/10 rounded-[40px] border-2 border-purple-500/20 flex items-center justify-center mx-auto mb-4 group hover:scale-110 transition-transform">
                    <Trophy className="w-12 h-12 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">No Quiz Active</h2>
                  <p className="text-gray-500 max-w-xs mx-auto text-sm font-medium">Generate a team-wide challenge based on your current notes to sync collective knowledge.</p>
                  <button
                    onClick={generateTeamQuiz}
                    disabled={isGeneratingQuiz || !roomData?.sharedNote?.content}
                    className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isGeneratingQuiz ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Generate Team Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Chat */}
        <div className="w-80 border-l border-white/10 flex flex-col bg-black/40 backdrop-blur-md">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Communications</span>
            </div>
            <div className="flex items-center gap-1">
               {presence.filter(p => p.isTyping && p.userId !== user.uid).map(p => (
                 <span key={p.userId} className="text-[8px] text-cyan-500 animate-pulse font-black uppercase">
                   {p.displayName.split(' ')[0]} typing...
                 </span>
               ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
                <MessageSquare className="w-8 h-8 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Transmission...</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.userId === user.uid ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed ${
                  msg.userId === user.uid
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'bg-white/5 border border-white/10 text-gray-300'
                }`}>
                  {msg.userId !== user.uid && <p className="text-[9px] text-gray-500 mb-1 font-black uppercase">{msg.userName}</p>}
                  {msg.text}
                </div>
                <span className="text-[8px] text-gray-600 mt-2 uppercase tracking-tighter px-2">
                  {msg.timestamp?.toDate ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 bg-black/20">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500" />
              <input
                type="text"
                placeholder="Secure transmission..."
                className="relative w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-xs text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700 font-medium"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  updateTyping(true);
                }}
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-400 hover:scale-110 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass p-10 rounded-[50px] border border-white/10 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px]" />
              <div className="flex justify-between items-center mb-8 relative">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recruit Member</h3>
                  <p className="text-xs text-gray-500 font-medium">Grant workspace access via email.</p>
                </div>
                <button onClick={() => setShowInvite(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleInvite} className="space-y-6 relative">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Identification</label>
                  <input
                    type="email"
                    placeholder="user@smartnotes.ai"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white outline-none focus:border-cyan-500 transition-all font-medium"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Authorize & Send Invitation
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationRoom;
