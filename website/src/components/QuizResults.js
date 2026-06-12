import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Target, Zap, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

const QuizResults = ({ results, onRetry }) => {
  const percentage = Math.round((results.score / results.totalQuestions) * 100);

  const getRank = () => {
    if (percentage === 100) return { name: 'Master', color: 'text-yellow-400', icon: Trophy };
    if (percentage >= 80) return { name: 'Expert', color: 'text-purple-400', icon: Award };
    if (percentage >= 60) return { name: 'Scholar', color: 'text-cyan-400', icon: Target };
    return { name: 'Apprentice', color: 'text-gray-400', icon: Zap };
  };

  const rank = getRank();
  const RankIcon = rank.icon;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 text-center py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-12"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative bg-gray-900 w-32 h-32 rounded-full border-4 border-cyan-500/50 flex items-center justify-center mx-auto mb-6">
            <RankIcon className={`w-16 h-16 ${rank.color}`} />
          </div>
        </div>
        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Quiz Complete</h2>
        <p className={`text-xl font-bold uppercase tracking-widest ${rank.color}`}>Rank: {rank.name}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6"
        >
          <p className="text-gray-500 text-xs uppercase font-bold mb-2">Accuracy</p>
          <p className="text-3xl font-black text-white">{percentage}%</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6"
        >
          <p className="text-gray-500 text-xs uppercase font-bold mb-2">Score</p>
          <p className="text-3xl font-black text-white">{results.score} / {results.totalQuestions}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6"
        >
          <p className="text-gray-500 text-xs uppercase font-bold mb-2">XP Gained</p>
          <p className="text-3xl font-black text-cyan-400">+{results.xpEarned}</p>
        </motion.div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onRetry}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Retake Quiz
        </button>

        <Link
          href="/dashboard"
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-16 text-left">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full" />
          Review Answers
        </h3>
        <div className="space-y-4">
          {results.answers.map((ans, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${ans.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
               <div className="flex items-center gap-3">
                 <div className={`p-1 rounded-full ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                   {ans.isCorrect ? <Zap className="w-3 h-3 text-black" /> : <RotateCcw className="w-3 h-3 text-black" />}
                 </div>
                 <span className={`text-sm font-medium ${ans.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                   {ans.isCorrect ? 'Correct' : 'Incorrect'}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
