"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Settings,
  Bell,
  Target,
  Zap,
  Award,
  Flame
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);

  const navLinks = [
    { name: 'Notes', href: '/dashboard', color: 'text-cyan-400' },
    { name: 'Exams', href: '/exams', color: 'text-amber-400' },
    { name: 'Study', href: '/study', color: 'text-green-400' },
    { name: 'Workspaces', href: '/workspaces', color: 'text-pink-400' },
    { name: 'Analytics', href: '/analytics', color: 'text-orange-400' },
    { name: 'Planner', href: '/planner', color: 'text-blue-400' },
  ];

  return (
    <nav className="fixed w-full z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-tighter italic">
                SmartNotes <span className="text-cyan-500">AI</span>
              </span>
            </Link>
          </div>

          <div className="hidden xl:block">
            <div className="ml-10 flex items-center space-x-1">
              {user ? (
                <div className="flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        pathname === link.href ? `bg-white/5 ${link.color}` : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {/* Streak & XP Display */}
                  <div className="flex items-center gap-4 px-4 border-l border-white/10 ml-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20" title="Daily Streak">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-[10px] font-black text-orange-400">{profile?.streak || 0}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20" title="Player Level">
                      <Zap className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-[10px] font-black text-cyan-400">LVL {profile?.level || 1}</span>
                    </div>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                      <Link href="/settings" className="text-gray-500 hover:text-cyan-500 transition-colors">
                        <Settings className="w-5 h-5" />
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 group">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-white leading-none uppercase">{profile?.displayName || user.displayName || 'User'}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {profile?.badges?.slice(0, 2).map(badge => (
                              <span key={badge} className="text-[7px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter">{badge}</span>
                            ))}
                          </div>
                        </div>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-2xl border-2 border-white/10 group-hover:border-cyan-500 transition-all" />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-white/10 group-hover:border-cyan-500 transition-all">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {!isAuthPage && (
                    <Link href="/exams" className="text-amber-500 hover:text-white transition-colors px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-3 h-3" /> Exam Arena
                    </Link>
                  )}
                  <Link href="/login" className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">
                    Entry
                  </Link>
                  <Link href="/register" className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    Join Nexus
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="xl:hidden flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-black">{profile?.streak || 0}</span>
                </div>
                <Link href="/settings">
                  <Settings className="h-6 w-6 text-gray-500" />
                </Link>
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white transition-colors">
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-4 p-4 mb-4 bg-white/5 rounded-3xl">
                     <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-xl font-black">
                       {profile?.level || 1}
                     </div>
                     <div>
                       <p className="text-white font-bold">{profile?.displayName || user.displayName}</p>
                       <p className="text-xs text-gray-500">LVL {profile?.level || 1} • {profile?.xp || 0} XP</p>
                     </div>
                  </div>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest ${
                        pathname === link.href ? `bg-white/5 ${link.color}` : 'text-gray-500'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-4 text-red-500 text-sm font-black uppercase tracking-widest"
                  >
                    <LogOut className="w-5 h-5" /> Terminate Session
                  </button>
                </>
              ) : (
                <>
                  <Link href="/exams" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-amber-500 font-black uppercase tracking-widest">Exam Arena</Link>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-white font-black uppercase tracking-widest">Entry</Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="block px-4 py-4 text-cyan-500 font-black uppercase tracking-widest">Join Nexus</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
