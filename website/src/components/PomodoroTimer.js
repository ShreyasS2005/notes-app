import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Brain, Sparkles, Timer, Zap } from 'lucide-react';

const PomodoroTimer = ({ onSessionComplete }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalTime = mode === 'work' ? 25 * 60 : (mode === 'shortBreak' ? 5 * 60 : 15 * 60);
  const currentTime = minutes * 60 + seconds;
  const progress = (currentTime / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          handleSwitchMode();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleSwitchMode = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      onSessionComplete?.({ mode: 'Work Session', duration: 25 });
      if (newCount % 4 === 0) {
        setMode('longBreak');
        setMinutes(15);
      } else {
        setMode('shortBreak');
        setMinutes(5);
      }
    } else {
      setMode('work');
      setMinutes(25);
    }
    setSeconds(0);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : (mode === 'shortBreak' ? 5 : 15));
    setSeconds(0);
  };

  return (
    <div className="glass p-8 md:p-12 rounded-[40px] border border-white/10 text-center relative overflow-hidden group">
      {/* Background Neon Glows */}
      <div className={`absolute -top-24 -left-24 w-64 h-64 blur-[120px] rounded-full transition-colors duration-1000 ${mode === 'work' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`} />
      <div className={`absolute -bottom-24 -right-24 w-64 h-64 blur-[120px] rounded-full transition-colors duration-1000 ${mode === 'work' ? 'bg-blue-500/10' : 'bg-pink-500/10'}`} />

      <div className="relative z-10">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: 'work', label: 'Deep Work', icon: Brain, color: 'text-cyan-500' },
            { id: 'shortBreak', label: 'Short Break', icon: Coffee, color: 'text-purple-500' },
            { id: 'longBreak', label: 'Long Break', icon: Timer, color: 'text-indigo-500' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setMinutes(m.id === 'work' ? 25 : (m.id === 'shortBreak' ? 5 : 15));
                setSeconds(0);
                setIsActive(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                mode === m.id
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                  : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
              }`}
            >
              <m.icon className={`w-3 h-3 ${mode === m.id ? 'text-black' : m.color}`} />
              {m.label}
            </button>
          ))}
        </div>

        {/* Circular Progress & Timer */}
        <div className="relative flex items-center justify-center mb-10">
          <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
              className={`${mode === 'work' ? 'text-cyan-500' : 'text-purple-500'} drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]`}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
               animate={isActive ? { scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] } : {}}
               transition={{ repeat: Infinity, duration: 2 }}
               className="text-7xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl"
            >
              {String(minutes).padStart(2, '0')}<span className={`${isActive ? 'animate-pulse' : ''} text-cyan-500/50`}>:</span>{String(seconds).padStart(2, '0')}
            </motion.div>
            <div className="flex items-center gap-2 mt-4 px-4 py-1 rounded-full bg-white/5 border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isActive ? 'Neural Sync Active' : 'Neural Sync Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all group/btn"
          >
            <RotateCcw className="w-6 h-6 group-hover/btn:rotate-180 transition-transform duration-700" />
          </button>

          <button
            onClick={toggleTimer}
            className={`group relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
              isActive
                ? 'bg-white text-black scale-95 shadow-inner'
                : 'bg-gradient-to-tr from-cyan-600 to-cyan-400 text-black shadow-[0_0_50px_rgba(6,182,212,0.4)] hover:shadow-[0_0_70px_rgba(6,182,212,0.6)] hover:scale-105'
            }`}
          >
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            {isActive ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-2" />}
          </button>

          <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all group/vol">
             <Volume2 className="w-6 h-6 group-hover/vol:scale-110 transition-transform" />
          </button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6">
           <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group/stat hover:border-cyan-500/30 transition-colors">
             <div className="flex items-center gap-2 mb-2">
               <Zap className="w-3 h-3 text-cyan-500" />
               <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Interval</p>
             </div>
             <p className="text-xl font-black text-white italic">#{sessionsCompleted + 1}</p>
           </div>
           <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group/stat hover:border-purple-500/30 transition-colors">
             <div className="flex items-center gap-2 mb-2">
               <Brain className="w-3 h-3 text-purple-500" />
               <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Protocol</p>
             </div>
             <p className={`text-xl font-black italic uppercase ${mode === 'work' ? 'text-cyan-500' : 'text-purple-500'}`}>
               {mode === 'work' ? 'Focus' : 'Rest'}
             </p>
           </div>
           <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group/stat hover:border-yellow-500/30 transition-colors">
             <div className="flex items-center gap-2 mb-2">
               <Sparkles className="w-3 h-3 text-yellow-500" />
               <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Nexus XP</p>
             </div>
             <p className="text-xl font-black text-yellow-500 italic">+{sessionsCompleted * 50}</p>
           </div>
        </div>
      </div>

      {/* Grid Pattern in background */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

      {/* Dynamic Scanline */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-[1px] bg-cyan-500/20 absolute top-0 animate-[scan_4s_linear_infinite]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PomodoroTimer;
