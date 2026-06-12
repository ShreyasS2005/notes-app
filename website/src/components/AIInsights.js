import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Target, TrendingUp, AlertTriangle } from 'lucide-react';

const AIInsights = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="glass p-8 rounded-3xl border border-white/10 h-full flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <Brain className="w-12 h-12 text-cyan-500 animate-pulse" />
        </div>
        <p className="text-gray-400 font-medium animate-pulse">Gemini is analyzing your performance...</p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-24 h-24 text-cyan-500" />
        </div>

        <div className="relative">
          <header className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Executive Summary</h2>
          </header>

          <p className="text-gray-300 leading-relaxed mb-8">
            {insights.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Strengths
              </h3>
              <ul className="space-y-2">
                {insights.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> Weaknesses
              </h3>
              <ul className="space-y-2">
                {insights.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10">
        <header className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Strategic Recommendations</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.recommendations.map((r, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all">
              <p className="text-sm text-gray-400 italic">"{r}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
