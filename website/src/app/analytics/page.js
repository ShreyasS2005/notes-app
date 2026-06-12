"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { analyticsService } from "@/services/analyticsService";
import { aiService } from "@/services/aiService";
import {
  AccuracyChart,
  SubjectRadar,
  FocusBarChart,
  AIUsagePie,
  StudyHeatmap
} from "@/components/AnalyticsCharts";
import AIInsights from "@/components/AIInsights";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Zap,
  Target,
  Clock,
  Loader2,
  RefreshCw,
  Flame,
  Award,
  Type,
  BookOpen
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await analyticsService.getStudyStats(user.uid);
      setStats(data);

      // Fetch AI Insights
      setInsightsLoading(true);
      const aiInsights = await aiService.generateAnalyticsInsights(data);
      setInsights(aiInsights);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Synchronizing your performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">

          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                Performance <span className="text-purple-500">Nexus</span>
              </h1>
              <p className="text-gray-500 font-medium">Real-time intelligence on your learning journey.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">7 Day Streak</span>
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-gray-300"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </header>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Readiness Score', value: `${insights?.readinessScore || 0}%`, icon: Target, color: 'text-cyan-500' },
              { label: 'Estimated Study', value: `${stats?.estStudyTimeHours || 0} Hours`, icon: BookOpen, color: 'text-yellow-500' },
              { label: 'Knowledge Base', value: `${(stats?.totalChars / 1000 || 0).toFixed(1)}k Chars`, icon: Type, color: 'text-purple-500' },
              { label: 'Avg. Accuracy', value: `${Math.round(stats?.accuracyOverTime.reduce((acc, q) => acc + q.accuracy, 0) / (stats?.accuracyOverTime.length || 1))}%`, icon: TrendingUp, color: 'text-green-500' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl border border-white/10 flex items-center gap-5"
              >
                <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Insights Panel */}
            <div className="lg:col-span-2 space-y-8">
              <AIInsights insights={insights} loading={insightsLoading} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl border border-white/10">
                  <header className="flex items-center gap-3 mb-8">
                    <TrendingUp className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-lg font-bold text-white">Accuracy Trend</h3>
                  </header>
                  <AccuracyChart data={stats?.accuracyOverTime} />
                </div>

                <div className="glass p-8 rounded-3xl border border-white/10">
                  <header className="flex items-center gap-3 mb-8">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-white">Focus Time (Hrs)</h3>
                  </header>
                  <FocusBarChart data={stats?.focusTime} />
                </div>
              </div>

              {/* Study Load Estimation Details */}
              <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-transparent">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl">
                       <Clock className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Study Load Estimation</h3>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Calculated via character density analysis</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Raw Density</p>
                       <p className="text-xl font-black text-white">{stats?.totalChars?.toLocaleString()} Characters</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Est. Reading Time</p>
                       <p className="text-xl font-black text-cyan-500">{Math.ceil(stats?.totalChars / 1000)} Minutes</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Deep Study Req.</p>
                       <p className="text-xl font-black text-purple-500">{stats?.estStudyTimeHours} Hours</p>
                    </div>
                 </div>
                 <p className="mt-6 text-xs text-gray-500 italic">
                    *Estimation assumes a deep-learning speed of 100 words per minute with comprehensive note analysis.
                 </p>
              </div>
            </div>

            {/* Side Analytics */}
            <div className="space-y-8">
              <div className="glass p-8 rounded-3xl border border-white/10">
                <header className="flex items-center gap-3 mb-8">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-bold text-white">Subject Mastery</h3>
                </header>
                <SubjectRadar data={stats?.subjectPerformance} />
              </div>

              <div className="glass p-8 rounded-3xl border border-white/10">
                <header className="flex items-center gap-3 mb-6">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-bold text-white">Consistency Matrix</h3>
                </header>
                <StudyHeatmap />
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
