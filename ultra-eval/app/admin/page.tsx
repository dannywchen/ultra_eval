'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    Users,
    ChevronRight,
    Search,
    ShieldCheck,
    ArrowUpRight,
    TrendingUp,
    Clock,
    UserCircle,
    Loader2
} from 'lucide-react';
import { getSupabase, Student } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            const adminEmails = ['dannywchen3@gmail.com', 'dannywchenofficial@gmail.com'];

            if (!user || !adminEmails.includes(user.email || '')) {
                window.location.href = '/dashboard';
                return;
            }

            setIsAdmin(true);
            fetchStudents();
        } catch (error) {
            console.error('Admin check error:', error);
            window.location.href = '/dashboard';
        }
    };

    const fetchStudents = async () => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('elo', { ascending: false });

            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAdmin || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black text-white p-6 md:p-12">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold tracking-tighter">Admin</h1>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{students.length} Total Users</p>
                        </div>

                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-full py-3 pl-12 pr-6 outline-none focus:border-white/20 transition-all font-medium text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between px-6 mb-2">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">User Profile</h2>
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">Rating</h2>
                        </div>

                        {filteredStudents.map((student, i) => (
                            <Link
                                href={`/admin/student/${student.id}`}
                                key={student.id}
                                className="group"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-900/50 transition-all cursor-pointer group-hover:border-white/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all overflow-hidden">
                                            {student.avatar_url ? (
                                                <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <UserCircle className="h-5 w-5 opacity-40" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold tracking-tight text-white inline-flex items-center gap-2">
                                                {student.name}
                                                {['dannywchen3@gmail.com', 'dannywchenofficial@gmail.com'].includes(student.email || '') && <ShieldCheck className="h-3 w-3 text-zinc-600" />}
                                            </h4>
                                            <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest">{student.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-xl font-black italic tracking-tighter text-white">{student.elo}</div>
                                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-800">ELO</div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-zinc-800 group-hover:text-white transition-colors" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
