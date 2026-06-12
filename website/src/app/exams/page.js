"use client";
import React, { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Award,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  GraduationCap,
  History,
  TrendingUp,
  BrainCircuit
} from "lucide-react";

const ExamCard = ({ title, description, icon: Icon, color, stats }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-[32px] border border-white/10 hover:border-white/20 transition-all group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Target Year</p>
        <p className="text-lg font-black text-white italic">2024/25</p>
      </div>
    </div>
    <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">{title}</h3>
    <p className="text-gray-400 text-sm mb-6 font-medium leading-relaxed">{description}</p>

    <div className="grid grid-cols-2 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">{stat.label}</p>
          <p className="text-sm font-black text-white">{stat.value}</p>
        </div>
      ))}
    </div>

    <button className={`w-full py-4 rounded-2xl bg-${color}-500 text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-all`}>
      Enter Arena <ChevronRight className="w-4 h-4" />
    </button>
  </motion.div>
);

export default function CompetitiveExams() {
  const [activeCategory, setActiveCategory] = useState('upsc');

  const examData = {
    upsc: {
      title: "UPSC Civil Services",
      description: "Master the syllabus from Ancient History to International Relations. Curated resources for Prelims and Mains.",
      icon: GraduationCap,
      color: "amber",
      stats: [
        { label: "NCERT Focus", value: "Class 6-12" },
        { label: "Current Affairs", value: "Daily Sync" }
      ]
    },
    neet: {
      title: "NEET Medical",
      description: "Deep dive into Biology, Physics, and Chemistry. Practice with MCQ banks and flashcards designed for speed.",
      icon: BrainCircuit,
      color: "emerald",
      stats: [
        { label: "Biology", value: "360/360 Goal" },
        { label: "PYQs", value: "15 Years" }
      ]
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050505] pt-28 pb-12 px-4 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <Target className="w-5 h-5 text-cyan-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Competitive Protocol</span>
              </motion.div>
              <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                Exam <span className="text-cyan-500">Nexus</span>
              </h1>
              <p className="text-gray-500 font-medium mt-4 max-w-xl">
                Advanced preparation modules for India's toughest competitive exams. Optimized for high-retention studying.
              </p>
            </div>

            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveCategory('upsc')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'upsc' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-white'}`}
              >
                UPSC
              </button>
              <button
                onClick={() => setActiveCategory('neet')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'neet' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-white'}`}
              >
                NEET
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Areas */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExamCard {...examData.upsc} />
                <ExamCard {...examData.neet} />
              </div>

              {/* Study Tools Grid */}
              <div className="glass p-8 rounded-[40px] border border-white/10">
                <h3 className="text-xl font-black text-white uppercase italic mb-8">Specialized <span className="text-cyan-500">Syllabus Tracker</span></h3>
                <div className="space-y-4">
                  {[
                    { label: "Polity & Governance", progress: "65%", color: "bg-blue-500" },
                    { label: "Economics", progress: "40%", color: "bg-purple-500" },
                    { label: "Environment", progress: "85%", color: "bg-emerald-500" }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white">{item.progress}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.progress }}
                          className={`h-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-8">
              <div className="glass p-6 rounded-[32px] border border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Exam Countdown
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Days", value: "142" },
                    { label: "Hrs", value: "12" },
                    { label: "Min", value: "45" }
                  ].map((unit, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-xl font-black text-white italic leading-none mb-1">{unit.value}</p>
                      <p className="text-[8px] font-black uppercase tracking-tighter text-gray-600">{unit.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-6 rounded-[32px] border border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Momentum Score
                </h3>
                <div className="flex items-end gap-2 h-24 mb-4">
                  {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg opacity-50"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 font-medium">Your consistency is <span className="text-white font-bold">Up 12%</span> this week.</p>
              </div>

              <div className="glass p-6 rounded-[32px] border border-white/10 bg-cyan-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-500 rounded-xl text-black">
                    <History className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Previous Attempts</h3>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                  Review your mock test performance and identify weak areas in your preparation strategy.
                </p>
                <button className="w-full mt-4 py-3 rounded-xl border border-cyan-500/30 text-cyan-500 text-[10px] font-black uppercase hover:bg-cyan-500/10 transition-all">
                  Analyze Performance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
