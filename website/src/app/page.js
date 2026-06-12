"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Brain,
  RefreshCw,
  Shield,
  Cpu,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const Hero = () => (
  <section className="relative pt-32 pb-20 px-4 overflow-hidden">
    <div className="max-w-7xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Your Second Brain, <br />
          <span className="bg-gradient-to-r from-neonBlue via-neonPurple to-cyberPink bg-clip-text text-transparent">
            Supercharged by AI
          </span>
        </h1>
        <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto mb-10">
          Transform your notes into actionable insights. Organize, summarize, and generate content with the power of Gemini 1.5 Flash.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 rounded-full bg-gradient-to-r from-neonBlue to-neonPurple text-white font-bold text-lg hover:shadow-neon-blue transition-all flex items-center justify-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#features" className="px-8 py-4 rounded-full glass border border-white/10 text-white font-bold text-lg hover:bg-white/5 transition-all">
            See How it Works
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="glass p-8 border border-white/10 hover:neon-border-blue transition-all group"
  >
    <div className="p-3 bg-neonBlue/10 rounded-xl w-fit mb-6 group-hover:bg-neonBlue/20 transition-colors">
      <Icon className="w-8 h-8 text-neonBlue" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

const Features = () => (
  <section id="features" className="py-20 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Unmatched AI Capabilities</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-neonBlue to-neonPurple mx-auto rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Brain}
          title="AI Synthesis"
          description="Automatically summarize complex notes and extract key concepts using advanced LLMs."
        />
        <FeatureCard
          icon={Cpu}
          title="Smart Organization"
          description="Your notes tag themselves. AI-driven categorization keeps your workspace clutter-free."
        />
        <FeatureCard
          icon={Zap}
          title="Instant Recall"
          description="Natural language search. Ask your notes anything and get precise answers instantly."
        />
      </div>
    </div>
  </section>
);

const AISection = () => (
  <section id="ai" className="py-20 px-4 relative">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="relative">
        <div className="absolute inset-0 bg-neonPurple/20 blur-[100px] -z-10" />
        <div className="glass p-4 border border-white/10 rounded-2xl">
          <div className="bg-black/50 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <p className="text-neonBlue font-mono text-sm mb-2">&gt; Analyze lecture_notes.txt</p>
            <p className="text-gray-300 font-mono text-sm leading-relaxed">
              Generating study guide... <br />
              1. Key Concept: Quantum Entanglement <br />
              2. Historical Context: EPR Paradox <br />
              3. Practical Applications...
            </p>
            <div className="mt-4 p-2 bg-neonPurple/10 border border-neonPurple/30 rounded text-xs text-neonPurple">
              AI Study Assistant is ready
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-4xl font-bold mb-6">AI Study Assistant</h2>
        <p className="text-gray-400 text-lg mb-8">
          Meet your personal tutor that lives inside your notes. Gemini 1.5 Flash analyzes your content in real-time to provide context, explanations, and flashcards.
        </p>
        <ul className="space-y-4">
          {[
            "One-click summary generation",
            "Context-aware brainstorming",
            "Automated quiz creation",
            "Multi-language translation"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-neonBlue" />
              <span className="text-gray-200">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

const SyncSection = () => (
  <section className="py-20 px-4 glass border-y border-white/10">
    <div className="max-w-7xl mx-auto text-center">
      <RefreshCw className="w-16 h-16 text-neonPurple mx-auto mb-6 animate-spin-slow" />
      <h2 className="text-4xl font-bold mb-6">Real-time Cloud Sync</h2>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
        Access your thoughts from anywhere. Powered by Firebase, your data is always secure, private, and perfectly synced across all your devices.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="text-3xl font-bold text-white mb-1">99.9%</p>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Uptime</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white mb-1">&lt;100ms</p>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Latency</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white mb-1">AES-256</p>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Security</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white mb-1">Free</p>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Cloud Storage</p>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 px-4 border-t border-white/10">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-neonBlue" />
        <span className="text-xl font-bold bg-gradient-to-r from-neonBlue to-neonPurple bg-clip-text text-transparent">
          SmartNotes AI
        </span>
      </div>
      <div className="flex gap-8 text-gray-500 text-sm">
        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
      </div>
      <p className="text-gray-600 text-sm">
        © 2024 SmartNotes AI. All rights reserved.
      </p>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <AISection />
      <SyncSection />
      <section className="py-20 px-4 text-center">
        <div className="glass p-12 max-w-4xl mx-auto border-neon-purple/30">
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your mind?</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of students and professionals using SmartNotes AI.</p>
          <Link href="/register" className="px-10 py-5 rounded-full bg-white text-black font-bold text-xl hover:bg-neonBlue transition-all shadow-xl">
            Create Free Account
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
