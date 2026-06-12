"use client";
import React, { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Palette,
  Shield,
  LogOut,
  Camera,
  Check,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Mail,
  Smartphone
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sounds: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              System <span className="text-cyan-500">Preferences</span>
            </h1>
            <p className="text-gray-500 font-medium">Configure your SmartNotes AI experience.</p>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <aside className="w-full md:w-64 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                      : 'text-gray-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
              <hr className="border-white/5 my-4" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-white/5 rounded-[40px] border border-white/10 p-8 md:p-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  {tabs.find(t => t.id === activeTab)?.icon && React.createElement(tabs.find(t => t.id === activeTab).icon, { size: 120 })}
               </div>

               {activeTab === 'profile' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="flex items-center gap-8 mb-12">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-4xl font-black text-black">
                          {user?.displayName?.[0] || 'U'}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-black border border-white/10 rounded-2xl text-cyan-500 hover:text-white transition-all shadow-xl">
                          <Camera className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{user?.displayName || 'Smart User'}</h2>
                        <p className="text-gray-500 text-sm font-medium">{user?.email}</p>
                        <span className="inline-block mt-3 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                          Pro Member
                        </span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                       <input
                         type="text"
                         defaultValue={user?.displayName}
                         className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500 transition-all"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                       <input
                         type="email"
                         defaultValue={user?.email}
                         disabled
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-gray-500 outline-none cursor-not-allowed"
                       />
                     </div>
                   </div>
                   <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-cyan-500 transition-colors">
                     Update Profile
                   </button>
                 </motion.div>
               )}

               {activeTab === 'notifications' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="p-6 rounded-3xl bg-black/50 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Mail className="w-6 h-6" /></div>
                        <div>
                          <p className="text-white font-bold">Email Notifications</p>
                          <p className="text-xs text-gray-500">Weekly summaries and activity alerts.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.email} onChange={() => setNotifications({...notifications, email: !notifications.email})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>

                    <div className="p-6 rounded-3xl bg-black/50 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><Smartphone className="w-6 h-6" /></div>
                        <div>
                          <p className="text-white font-bold">Push Notifications</p>
                          <p className="text-xs text-gray-500">Real-time collaboration alerts.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.push} onChange={() => setNotifications({...notifications, push: !notifications.push})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>

                    <div className="p-6 rounded-3xl bg-black/50 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-500"><Volume2 className="w-6 h-6" /></div>
                        <div>
                          <p className="text-white font-bold">System Sounds</p>
                          <p className="text-xs text-gray-500">Sound effects for study timer and chat.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.sounds} onChange={() => setNotifications({...notifications, sounds: !notifications.sounds})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'appearance' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                       <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Interface Theme</h3>
                       <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'light', icon: Sun, label: 'Light' },
                            { id: 'dark', icon: Moon, label: 'Dark' },
                            { id: 'system', icon: Monitor, label: 'System' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id)}
                              className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                                theme === t.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/5 bg-black/50 hover:border-white/20'
                              }`}
                            >
                              <t.icon className={`w-6 h-6 ${theme === t.id ? 'text-cyan-500' : 'text-gray-500'}`} />
                              <span className={`text-xs font-bold ${theme === t.id ? 'text-white' : 'text-gray-500'}`}>{t.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Accent Color</h3>
                       <div className="flex gap-4">
                          {['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map(color => (
                            <button
                              key={color}
                              className="w-10 h-10 rounded-full border-2 border-black ring-2 ring-white/5 hover:ring-white/20 transition-all flex items-center justify-center"
                              style={{ backgroundColor: color }}
                            >
                              {color === '#06b6d4' && <Check className="w-4 h-4 text-black" />}
                            </button>
                          ))}
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'security' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="p-6 rounded-3xl bg-black/50 border border-white/5">
                       <h3 className="text-white font-bold mb-2">Password</h3>
                       <p className="text-xs text-gray-500 mb-6">Last changed 3 months ago.</p>
                       <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
                         Change Password
                       </button>
                    </div>
                    <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
                       <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
                       <p className="text-xs text-gray-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                       <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500 transition-all hover:text-white">
                         Delete Account
                       </button>
                    </div>
                 </motion.div>
               )}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
