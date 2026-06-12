import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useEffect, useCallback, useState } from 'react';
import debounce from 'lodash.debounce';
import {
  ZoomIn,
  ZoomOut,
  Share2,
  Bell,
  Clock,
  Info,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Editor = ({ content, onChange, title, onTitleChange, onSetReminder, reminderAt }) => {
  const [fontSize, setFontSize] = useState(16);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Placeholder.configure({
        placeholder: 'Start writing your brilliance...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] text-gray-200',
      },
    },
  });

  const debouncedUpdate = useCallback(
    debounce((html) => {
      onChange(html);
    }, 1000),
    [onChange]
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'SmartNotes AI',
          text: 'Check out my note on SmartNotes AI',
          url: url,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculateStudyTime = () => {
    const text = editor?.getText() || "";
    const charCount = text.length;
    if (charCount === 0) return 0;
    // Avg 100 words per minute for studying/deep reading
    // Avg 6 chars per word
    const minutes = Math.ceil((charCount / 6) / 100);
    return minutes;
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0c] overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0a0c]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-gray-500 w-8 text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 mx-2" />

          <div className="flex items-center gap-2 text-cyan-500/70">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Est. Study: {calculateStudyTime()} min
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowReminderPicker(!showReminderPicker)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                reminderAt
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Bell className="w-4 h-4" />
              {reminderAt && <span className="text-[10px] font-black uppercase">Active</span>}
            </button>

            <AnimatePresence>
              {showReminderPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 p-4 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 w-64"
                >
                  <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-3">Set Study Reminder</p>
                  <input
                    type="datetime-local"
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 transition-all mb-3"
                    onChange={(e) => {
                      onSetReminder(e.target.value);
                      setShowReminderPicker(false);
                    }}
                    value={reminderAt || ""}
                  />
                  <button
                    onClick={() => {
                      onSetReminder(null);
                      setShowReminderPicker(false);
                    }}
                    className="w-full py-2 text-[10px] font-black text-red-500 uppercase hover:bg-red-500/5 rounded-lg transition-all"
                  >
                    Clear Reminder
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar" style={{ fontSize: `${fontSize}px` }}>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-black bg-transparent border-none outline-none text-white mb-8 placeholder-gray-800 italic uppercase tracking-tighter"
        />
        <div className="relative">
          <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-headings:text-white prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
