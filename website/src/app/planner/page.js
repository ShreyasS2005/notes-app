"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { studyPlannerService } from "@/services/studyPlannerService";
import { aiService } from "@/services/aiService";
import StudyCalendar from "@/components/StudyCalendar";
import PomodoroTimer from "@/components/PomodoroTimer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Timer,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  ChevronRight,
  Bell,
  Target,
  Flame,
  Music
} from "lucide-react";
import { format, addDays, differenceInDays } from 'date-fns';

export default function PlannerPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('planner'); // planner, focus
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', deadline: format(new Date(), 'yyyy-MM-dd'), type: 'Study' });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = studyPlannerService.subscribeToTasks(user.uid, (fetchedTasks) => {
      setTasks(fetchedTasks);
      const calendarEvents = fetchedTasks.map(task => ({
        id: task.id,
        title: task.title,
        start: task.deadline,
        backgroundColor: task.type === 'Exam' ? '#ef4444' : (task.completed ? '#10b981' : '#06b6d4'),
        borderColor: 'transparent'
      }));
      setEvents(calendarEvents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    await studyPlannerService.addTask(user.uid, newTask);
    setNewTask({ title: '', deadline: format(new Date(), 'yyyy-MM-dd'), type: 'Study' });
    setIsAddingTask(false);
  };

  const handleToggleTask = async (id, completed) => {
    await studyPlannerService.updateTask(user.uid, id, { completed: !completed });
  };

  const handleDeleteTask = async (id) => {
    if (confirm('Delete this goal?')) {
      await studyPlannerService.deleteTask(user.uid, id);
    }
  };

  const generateAITimetable = async () => {
    setIsGenerating(true);
    try {
      const incompleteTasks = tasks.filter(t => !t.completed);
      const timetable = await aiService.generateTimetable(incompleteTasks, "Evening");

      // Save these as actual events/tasks or just display them
      // For this MVP, we'll add them as new tasks
      for (const session of timetable.sessions) {
        await studyPlannerService.addTask(user.uid, {
          title: `[AI] ${session.title}`,
          deadline: session.start,
          type: session.type
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionComplete = async (sessionData) => {
    await studyPlannerService.saveFocusSession(user.uid, sessionData);
    alert(`Great job! Session completed: ${sessionData.mode}`);
  };

  const nextExam = tasks.filter(t => t.type === 'Exam' && !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
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
                Mission <span className="text-cyan-500">Control</span>
              </h1>
              <p className="text-gray-500 font-medium">Coordinate your studies with AI precision.</p>
            </div>

            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('planner')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'planner' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-gray-400 hover:text-white'}`}
              >
                <CalendarIcon className="w-4 h-4" /> Planner
              </button>
              <button
                onClick={() => setActiveTab('focus')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'focus' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-gray-400 hover:text-white'}`}
              >
                <Timer className="w-4 h-4" /> Focus Mode
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'planner' ? (
              <motion.div
                key="planner"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left: Tasks & Goals */}
                <div className="space-y-8">
                  {/* Exam Countdown */}
                  {nextExam && (
                    <div className="glass p-6 rounded-3xl border border-red-500/20 bg-red-500/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Flame className="w-16 h-16 text-red-500" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Next Critical Deadline</p>
                      <h3 className="text-xl font-bold text-white mb-4">{nextExam.title}</h3>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white">{differenceInDays(new Date(nextExam.deadline), new Date())}</span>
                        <span className="text-gray-500 font-bold mb-1 uppercase text-xs tracking-widest">Days Remaining</span>
                      </div>
                    </div>
                  )}

                  <div className="glass p-8 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-400" /> Study Goals
                      </h3>
                      <button
                        onClick={() => setIsAddingTask(!isAddingTask)}
                        className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isAddingTask && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleAddTask}
                          className="mb-8 space-y-4"
                        >
                          <input
                            type="text"
                            placeholder="What's the goal?"
                            className="w-full p-4 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-cyan-500"
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          />
                          <div className="flex gap-2">
                            <input
                              type="date"
                              className="flex-1 p-4 rounded-xl bg-black border border-white/10 text-white outline-none"
                              value={newTask.deadline}
                              onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                            />
                            <select
                              className="p-4 rounded-xl bg-black border border-white/10 text-white outline-none"
                              value={newTask.type}
                              onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                            >
                              <option>Study</option>
                              <option>Review</option>
                              <option>Exam</option>
                              <option>Quiz</option>
                            </select>
                          </div>
                          <button className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold uppercase tracking-widest">Deploy Goal</button>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${
                            task.completed ? 'bg-green-500/5 border-green-500/20 opacity-50' : 'bg-white/5 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleTask(task.id, task.completed)}
                              className={`p-1 rounded-md border transition-all ${
                                task.completed ? 'bg-green-500 border-green-500 text-black' : 'border-white/20 text-transparent hover:border-cyan-500'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <div>
                              <p className={`text-sm font-bold ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.title}</p>
                              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{format(new Date(task.deadline), 'MMM dd')} • {task.type}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Calendar */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3 italic">
                      Study <span className="text-cyan-500 uppercase not-italic">Chronicles</span>
                    </h3>
                    <button
                      onClick={generateAITimetable}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 text-cyan-400 font-bold text-sm flex items-center gap-2 transition-all"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate AI Timetable
                    </button>
                  </div>
                  <StudyCalendar events={events} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="focus"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3">
                    <PomodoroTimer onSessionComplete={handleSessionComplete} />
                  </div>
                  <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border border-white/10">
                      <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-6 flex items-center gap-2">
                        <Music className="w-4 h-4" /> Ambient Flow
                      </h3>
                      <div className="space-y-4">
                        {['Rain', 'Waves', 'Lo-Fi', 'Library'].map(sound => (
                          <button key={sound} className="w-full p-3 rounded-xl bg-white/5 border border-white/5 text-left text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between">
                            {sound}
                            <Volume2 className="w-4 h-4 text-gray-600" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="glass p-6 rounded-3xl border border-white/10">
                      <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Smart Reminders
                      </h3>
                      <div className="space-y-4">
                         <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                           <p className="text-xs text-purple-400 font-bold">Review Quantum Physics</p>
                           <p className="text-[10px] text-gray-500">Scheduled for 6:00 PM</p>
                         </div>
                         <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                           <p className="text-xs text-gray-400 font-bold">Mock Exam: Math</p>
                           <p className="text-[10px] text-gray-500">In 2 days</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </ProtectedRoute>
  );
}

// Volume icon import
import { Volume2 } from 'lucide-react';
