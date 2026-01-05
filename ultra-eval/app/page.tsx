'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Award,
  Zap,
  Users,
  ChevronRight,
  Sparkles,
  Globe,
  Shield,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Ultra<span className="text-[10px] ml-1 bg-white text-black px-2 py-0.5 rounded-full uppercase">eval</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/leaderboard" className="hidden md:block text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/login" className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Sign In</Link>
            <Link href="/login">
              <button className="btn-3d btn-3d-primary px-6 py-2 text-sm font-bold">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
        >
          <Sparkles className="h-3 w-3" /> Achievement Registry
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter max-w-4xl leading-tight"
        >
          Prove your <span className="text-zinc-700">impact</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-lg md:text-xl text-zinc-500 font-medium max-w-2xl leading-relaxed"
        >
          A high-fidelity evaluation protocol that measures your real-world contributions and accomplishments. Join the global leaderboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/login">
            <button className="btn-3d btn-3d-primary px-10 py-4 text-lg font-bold group">
              Start Evaluation <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          <Link href="/leaderboard">
            <button className="btn-3d btn-3d-dark px-10 py-4 text-lg font-bold">View Rankings</button>
          </Link>
        </motion.div>
      </section>

      {/* Core Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-24 border-t border-white/5">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            {
              title: 'Objective Grading',
              desc: 'Advanced reasoning models evaluate the complexity and scale of your work with precision.',
              icon: Zap,
            },
            {
              title: 'Global Ledger',
              desc: 'Compete on a transparent leaderboard where every point of ELO is backed by verified data.',
              icon: Globe,
            },
            {
              title: 'Verified Proof',
              desc: 'Turn your achievements into a permanent record of impact recognized by the community.',
              icon: Shield,
            }
          ].map((feat, i) => (
            <div
              key={feat.title}
              className="space-y-4"
            >
              <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
                <feat.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{feat.title}</h3>
              <p className="text-zinc-500 font-medium text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-6 py-44 text-center">
        <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight">
          Ready to be <span className="text-zinc-700">measured</span>?
        </h2>
        <p className="text-zinc-500 font-semibold text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          Join the protocol for high-achievers. Your work deserves recognition.
        </p>
        <Link href="/login">
          <button className="btn-3d btn-3d-primary px-12 py-5 text-xl font-bold">
            Initialize Profile
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-xl font-bold tracking-tighter">
            Ultra<span className="text-[10px] ml-1 bg-white text-black px-2 py-0.5 rounded-full uppercase">eval</span>
          </div>
          <p className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Ultra Protocol. Built for impact.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-zinc-800 hover:text-white transition-colors"><Star className="h-4 w-4" /></Link>
            <Link href="#" className="text-zinc-800 hover:text-white transition-colors"><Users className="h-4 w-4" /></Link>
            <Link href="#" className="text-zinc-800 hover:text-white transition-colors"><Globe className="h-4 w-4" /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
