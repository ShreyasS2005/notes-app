import React, { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import ChatMessage from './ChatMessage';
import { CHAT_MODES } from '@/services/aiService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Mic,
  Sparkles,
  Terminal,
  BookOpen,
  Search,
  GraduationCap,
  Loader2,
  ChevronDown
} from 'lucide-react';

const ChatInterface = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('STUDY');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const { messages, sendMessage, isTyping, chatEndRef } = useChat(user?.uid, mode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const currentMode = CHAT_MODES[mode];

  const modeIcons = {
    STUDY: BookOpen,
    CODING: Terminal,
    RESEARCH: Search,
    EXAM: GraduationCap
  };

  const ModeIcon = modeIcons[mode];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#050505] text-white overflow-hidden relative">
      {/* Top Header / Mode Selector */}
      <div className="p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between z-20">
        <div className="relative">
          <button
            onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all"
          >
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${currentMode.color}`}>
              <ModeIcon className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Current Mode</p>
              <p className="text-sm font-semibold">{currentMode.name}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isModeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-64 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
              >
                {Object.values(CHAT_MODES).map((m) => {
                  const Icon = modeIcons[m.id];
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMode(m.id);
                        setIsModeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        mode === m.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${m.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{m.name}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400/80">Powered by Gemini 1.5 Flash</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              How can I help you today?
            </h2>
            <p className="text-gray-500 max-w-md leading-relaxed">
              Start a conversation with your AI assistant. I can help with studying, coding, research, or exam prep.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-10 max-w-xl">
              {["Explain quantum physics", "Debug my React hook", "Summarize this PDF", "Quiz me on history"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all text-sm text-gray-400 hover:text-white text-left"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div className="flex gap-4 p-6 bg-white/5 border-y border-white/5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-cyan-600">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1.5 py-2">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-32" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#0f0f12] border border-white/10 rounded-2xl flex items-end p-2 pl-4">
            <button
              type="button"
              className="p-3 text-gray-500 hover:text-cyan-400 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-gray-200 placeholder-gray-600 resize-none max-h-60"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-3 text-gray-500 hover:text-purple-400 transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-gray-700 bg-white/5 cursor-not-allowed'
                }`}
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-600 mt-3 uppercase tracking-widest font-bold">
            SmartNotes AI can make mistakes. Check important info.
          </p>
        </form>
      </div>
    </div>
  );
};

// Add missing Bot icon import if not present
import { Bot } from 'lucide-react';

export default ChatInterface;
