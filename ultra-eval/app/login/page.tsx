'use client';

import React, { useState } from 'react';
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
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 bg-mesh">
            <div className="w-full max-w-xl space-y-12">

                {/* Branding */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-zinc-500 font-black text-[10px] uppercase tracking-widest mb-4">
                        <ShieldCheck className="h-3 w-3" /> Secure Access
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter">
                        Ultra<span className="text-[14px] ml-1 bg-white text-black px-3 py-1 rounded-full uppercase">eval</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg max-w-sm mx-auto">
                        High-performance evaluation for world-class learners.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-10 md:p-14 space-y-10"
                >
                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-4 bg-white text-black rounded-full py-5 font-black text-lg hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="bg-zinc-950 px-6 text-zinc-700">Protected Entry</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Academic Email"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 font-bold outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Secure Password"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 font-bold outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-3d btn-3d-dark py-5 text-lg group"
                        >
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-zinc-600 text-sm font-bold">
                            Don't have an access key? {' '}
                            <a href="/signup" className="text-white hover:underline transition-all">Request access</a>
                        </p>
                    </div>
                </motion.div>

                {/* Footer Quote */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <p className="text-zinc-800 font-black text-xs uppercase tracking-[0.3em]">
                        Excellence is not an act, but a habit.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
