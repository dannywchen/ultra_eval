'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await getSupabase().auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black overflow-x-hidden flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Ultra Eval
          </Link>
          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/login"} className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">
              {user ? "Go to App" : "Sign In"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl leading-tight"
        >
          Ultra Eval
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-lg md:text-xl text-zinc-500 font-medium max-w-2xl leading-relaxed"
        >
          Report your accomplishments to gain elo and compete with others.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Link href={user ? "/dashboard" : "/login"}>
            <button className="btn-3d btn-3d-primary px-10 py-4 text-lg font-bold group">
              {user ? "Go to Dashboard" : "Get Started"} <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 px-6 flex justify-center">
        <p className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Ultra Protocol
        </p>
      </footer>
    </div>
  );
}
