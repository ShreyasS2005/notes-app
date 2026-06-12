import React, { useState } from 'react';
import { Search, Plus, Trash2, Star, Tag, Folder, Hash, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const NoteList = ({ notes, activeNoteId, onNoteSelect, onCreateNote, onDeleteNote, onToggleFavorite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, favorites

  const filteredNotes = notes.filter(note => {
    const matchesSearch = (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (note.content || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'favorites') return matchesSearch && note.favorite;
    return matchesSearch;
  });

  return (
    <div className="w-80 border-r border-gray-800 bg-[#0a0a0c] flex flex-col h-full">
      <div className="p-6 space-y-4">
        <button
          onClick={onCreateNote}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-gray-800 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Inbox className="w-3.5 h-3.5" /> All
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'favorites' ? 'bg-gray-800 text-yellow-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Star className="w-3.5 h-3.5" /> Faves
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all ${
                  activeNoteId === note.id
                    ? 'bg-cyan-500/10 border border-cyan-500/20'
                    : 'hover:bg-gray-900/50 border border-transparent'
                }`}
                onClick={() => onNoteSelect(note.id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-medium truncate pr-6 text-sm ${
                    activeNoteId === note.id ? 'text-cyan-400' : 'text-gray-200'
                  }`}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(note.id, note.favorite);
                    }}
                    className={`transition-colors ${
                      note.favorite ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" fill={note.favorite ? "currentColor" : "none"} />
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                  {(note.content || '').replace(/<[^>]*>/g, '') || 'No content yet...'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        #{tag}
                      </span>
                    ))}
                    {note.folder && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                        <Folder className="w-2 h-2" /> {note.folder}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this note?')) onDeleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NoteList;
