import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 p-6 ${message.isUser ? 'bg-transparent' : 'bg-white/5 border-y border-white/5'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        message.isUser ? 'bg-purple-600' : 'bg-cyan-600'
      }`}>
        {message.isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-200">
            {message.isUser ? 'You' : 'SmartNotes AI'}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            {message.timestamp?.toDate ? format(message.timestamp.toDate(), 'p') : 'Just now'}
          </span>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative group mt-4">
                    <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(String(children))}
                        className="p-1.5 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-400"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-xl !bg-black/50 !border !border-white/10"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-400" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
