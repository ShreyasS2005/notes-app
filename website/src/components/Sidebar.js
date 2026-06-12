"use client";
import React from 'react';
import {
  Home,
  BookOpen,
  Settings,
  PlusCircle,
  Search,
  MessageSquare,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'My Notes', href: '/notes' },
    { icon: MessageSquare, label: 'AI Chat', href: '/ai-chat' },
    { icon: Zap, label: 'Templates', href: '/templates' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 pt-20 border-r border-white/10 glass hidden lg:flex flex-col">
      <div className="px-4 mb-6">
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neonBlue to-neonPurple py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-neon-blue text-sm">
          <PlusCircle className="w-5 h-5" />
          New Note
        </button>
      </div>

      <div className="px-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neonBlue transition-colors"
          />
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-neonBlue/10 text-neonBlue border-r-2 border-neonBlue"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-neonBlue" : "text-gray-400 group-hover:text-neonBlue transition-colors"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neonBlue to-neonPurple" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Guest User</p>
            <p className="text-[10px] text-gray-500 truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
