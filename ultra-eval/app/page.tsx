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
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden bg-mesh">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            Ultra<span className="text-[10px] ml-1 bg-white text-black px-2 py-0.5 rounded-full uppercase">eval</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/leaderboard" className="hidden md:block text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/login" className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Sign In</Link>
            <Link href="/login">
              <button className="btn-3d btn-3d-primary px-6 py-2 text-sm">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4 text-white" /> AI-Driven Achievement Protocol
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black tracking-tighter max-w-4xl leading-[0.9]"
        >
          Build your <span className="text-zinc-600">Proof of Impact</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-xl text-zinc-500 font-bold max-w-2xl leading-relaxed"
        >
          Ultra Eval uses high-fidelity reasoning to grade your accomplishments, assignments, and contributions. Prove your worth on the global leaderboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/login">
            <button className="btn-3d btn-3d-primary px-10 py-5 text-xl group">
              Start Evaluation <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/leaderboard">
            <button className="btn-3d btn-3d-dark px-10 py-5 text-xl">View Leaderboard</button>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Reasoning Grade',
              desc: 'GPT-5 powered evaluation ensures your ELO matches your real-world impact.',
              icon: Zap,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10'
            },
            {
              title: 'Global Standing',
              desc: 'Compete with elite students and developers from over 100 countries.',
              icon: Globe,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10'
            },
            {
              title: 'Verified Proof',
              desc: 'Every point of ELO is backed by a verified piece of evidence or analysis.',
              icon: Shield,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10'
            }
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="glass-card p-10 group hover:bg-zinc-900/50 transition-all"
            >
              <div className={cn("inline-flex p-4 rounded-2xl mb-6", feat.bg)}>
                <feat.icon className={cn("h-8 w-8", feat.color)} />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-4">{feat.title}</h3>
              <p className="text-zinc-500 font-bold leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5 bg-zinc-950/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Total ELO Issued', value: '142K+' },
            { label: 'Active Students', value: '8.4K+' },
            { label: 'Verifications', value: '25K+' },
            { label: 'Countries', value: '112+' },
          ].map((stat, i) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-4xl md:text-5xl font-black tracking-tighter">{stat.value}</div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-6 py-44 text-center">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 max-w-2xl mx-auto leading-none">
          Stop wondering. <br /><span className="text-zinc-600">Start proving.</span>
        </h2>
        <p className="text-zinc-500 font-bold text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          Join the protocol for high-achieving humans. Your impact deserves to be measured.
        </p>
        <Link href="/login">
          <button className="btn-3d btn-3d-primary px-12 py-6 text-2xl group shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            Initialize Profile
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-xl font-black tracking-tighter">
            Ultra<span className="text-[10px] ml-1 bg-white text-black px-2 py-0.5 rounded-full uppercase">eval</span>
          </div>
          <p className="text-zinc-700 text-xs font-black uppercase tracking-widest">
            © 2026 Ultra Protocol. Engineered for excellence.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-zinc-700 hover:text-white transition-colors"><Star className="h-5 w-5" /></Link>
            <Link href="#" className="text-zinc-700 hover:text-white transition-colors"><Users className="h-5 w-5" /></Link>
            <Link href="#" className="text-zinc-700 hover:text-white transition-colors"><Globe className="h-5 w-5" /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
