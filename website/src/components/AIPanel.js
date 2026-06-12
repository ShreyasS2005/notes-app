import React from 'react';
import { Bell, Clock, Calendar, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIPanel = ({ reminderAt, onSetReminder }) => {
  return (
    <div className="w-80 border-l border-gray-800 bg-[#0a0a0c] flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-gray-800 flex items-center gap-2 bg-gradient-to-r from-purple-500/5 to-transparent">
        <Bell className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">Note <span className="text-purple-500">Options</span></h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Study Reminder Section */}
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
                <p className="text-[10px] text-gray-500 font-medium">Get notified to review this note</p>
              </div>
            </div>

            <input
              type="datetime-local"
              value={reminderAt || ""}
              onChange={(e) => onSetReminder(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
            />

            {reminderAt ? (
              <button
                onClick={() => onSetReminder(null)}
                className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-3 h-3" /> Terminate Reminder
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-purple-500/50 shrink-0 mt-0.5" />
                <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
                  Setting a reminder will sync this note with your study schedule and alert you when it's time to review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800 bg-black/20 text-center">
        <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">
          SmartNotes OS • Reminder Engine
        </p>
      </div>
    </div>
  );
};

export default AIPanel;
