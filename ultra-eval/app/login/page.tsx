'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getSupabase } from '@/lib/supabase';
import {
    Mail,
    Lock,
    ArrowRight,
    Zap,
    ChevronRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const supabase = getSupabase();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            window.location.href = '/dashboard';
        } catch (error: any) {
            alert(error.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const supabase = getSupabase();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.message || 'Failed to sign in with Google');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-12">

                {/* Branding */}
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <Link href="/" className="inline-block">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                            Ultra<span className="text-[10px] ml-1 bg-white text-black px-2 py-0.5 rounded-full uppercase">eval</span>
                        </h1>
                    </Link>
                    <p className="text-zinc-500 font-semibold text-lg max-w-sm mx-auto">
                        Identity verification for high-impact contributors.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-10 md:p-12 space-y-10 border-white/5"
                >
                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full btn-3d bg-white text-black rounded-full py-4 font-bold text-lg"
                    >
                        <span className="flex items-center justify-center gap-3">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </span>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="bg-[#0a0a0a] px-6 text-zinc-700">Protected Entry</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                <input
                                    type="email"
                                    placeholder="Academic Email"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold outline-none focus:border-white/10 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                <input
                                    type="password"
                                    placeholder="Secure Password"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold outline-none focus:border-white/10 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-3d btn-3d-dark py-3.5 text-base font-bold"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        Don't have an access key? {' '}
                        <a href="/signup" className="text-white hover:underline transition-all">Request</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
