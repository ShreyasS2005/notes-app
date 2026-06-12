import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Eye,
  Bell,
  Calendar,
  X,
  Clock
} from 'lucide-react';
import { noteService } from '@/services/noteService';
import { useAuth } from '@/hooks/useAuth';

const DocumentWorkspace = ({ text, title, fileUrl, onBack }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [reminderAt, setReminderAt] = useState(null);

  const saveToNotes = async () => {
    if (!user) return;
    try {
      await noteService.createNote(user.uid, {
        title: `Extracted: ${title}`,
        content: `<p>${text.replace(/\n/g, '<br>')}</p>`,
        reminderAt: reminderAt,
        tags: ['Extracted']
      });
      alert('Document saved to your notes!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#050505] overflow-hidden">
      {/* Left: Original Extracted Text Viewer */}
      <motion.div
        animate={{ width: isSidebarOpen ? '70%' : '100%' }}
        className="h-full border-r border-white/10 flex flex-col"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">
              {title}
            </h2>
            {fileUrl && (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    showOriginal ? 'bg-purple-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {showOriginal ? 'Show Text' : 'Show Original'}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400"
          >
            {isSidebarOpen ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
          <div className="max-w-3xl mx-auto h-full">
             {showOriginal && fileUrl ? (
               <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-black">
                 {fileUrl.includes('.pdf') ? (
                   <iframe src={fileUrl} className="w-full h-full" title="Original PDF" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center p-4">
                     <img src={fileUrl} alt="Original document" className="max-w-full max-h-full object-contain rounded-xl" />
                   </div>
                 )}
               </div>
             ) : (
               <div className="p-10 bg-[#0a0a0c] border border-white/5 rounded-3xl shadow-2xl min-h-[80vh]">
                 <pre className="whitespace-pre-wrap font-sans text-sm text-gray-400 leading-relaxed">
                   {text}
                 </pre>
               </div>
             )}
          </div>
        </div>
      </motion.div>

      {/* Right: Note Options & Reminder Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '30%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-[#0a0a0c] flex flex-col border-l border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-500 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Note Options
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 px-1">Study Protocol</p>
                  {reminderAt && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      <Clock className="w-2.5 h-2.5" /> Scheduled
                    </span>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Set Reminder</h3>
                      <p className="text-[10px] text-gray-500 font-medium">Get notified to review this document</p>
                    </div>
                  </div>

                  <input
                    type="datetime-local"
                    value={reminderAt || ""}
                    onChange={(e) => setReminderAt(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-purple-500 transition-all font-mono"
                  />

                  {reminderAt && (
                    <button
                      onClick={() => setReminderAt(null)}
                      className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-3 h-3" /> Clear Reminder
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/40">
               <button
                onClick={saveToNotes}
                className="w-full py-4 rounded-xl bg-purple-600 text-white font-black uppercase tracking-widest text-xs hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Note
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentWorkspace;
