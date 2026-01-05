'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    User,
    Settings,
    Award,
    Calendar,
    Zap,
    TrendingUp,
    Loader2,
    ExternalLink,
    Mail,
    MapPin,
    GraduationCap,
    Sparkles
} from 'lucide-react';
import { getSupabase, Student, Report } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const [student, setStudent] = useState<Student | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = '/login';
                return;
            }

            // Fetch student profile
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();

            if (studentError) throw studentError;
            setStudent(studentData);

            // Fetch student's reports/achievements
            const { data: reportsData, error: reportsError } = await supabase
                .from('reports')
                .select('*')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });

            if (reportsError) throw reportsError;
            setReports(reportsData || []);

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center bg-black">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black text-white p-6 md:p-12 bg-mesh overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Hero Profile Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative group"
                        >
                            <div className="h-44 w-44 rounded-[3rem] bg-gradient-to-br from-zinc-800 to-black border-4 border-white/10 flex items-center justify-center font-black text-7xl text-white shadow-2xl group-hover:border-white/20 transition-all">
                                {student?.name?.[0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white text-black p-3 rounded-2xl shadow-xl">
                                <Zap className="h-6 w-6 fill-black" />
                            </div>
                        </motion.div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-5xl md:text-6xl font-black tracking-tighter"
                                >
                                    {student?.name}
                                </motion.h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-500 font-bold text-sm uppercase tracking-widest leading-none">
                                    <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {student?.school || 'Unlisted Institution'}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Global Citizen</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                                <button className="btn-sleek btn-sleek-primary px-8">Edit Profile</button>
                                <button className="btn-sleek btn-sleek-dark px-10">Share <ExternalLink className="ml-2 h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Ranking Score', value: student?.elo || 0, icon: TrendingUp },
                            { label: 'Achievements', value: reports.length, icon: Award },
                            { label: 'Profile Age', value: '4d', icon: Calendar },
                            { label: 'Rank', value: '#--', icon: Zap },
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 text-center md:text-left group"
                            >
                                <item.icon className="h-5 w-5 text-zinc-600 mb-2 group-hover:text-white transition-colors" />
                                <div className="text-3xl font-black tracking-tighter">{item.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">{item.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Portfolio / Achievements */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black tracking-tighter underline decoration-white/10 underline-offset-8">Accomplishments</h2>

                        <div className="grid gap-6">
                            {reports.length === 0 ? (
                                <div className="glass-card p-12 text-center text-zinc-500 font-bold border-dashed">
                                    No accomplishments verified yet. Start your journey on the Dashboard.
                                </div>
                            ) : (
                                reports.map((report, i) => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="glass-card p-8 group hover:bg-zinc-900/50 transition-all border-white/5"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{report.category}</span>
                                                    <span className="text-zinc-600 text-xs font-bold">{new Date(report.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-2xl font-black tracking-tight leading-tight">{report.title}</h3>
                                                <p className="text-zinc-500 font-medium max-w-2xl">{report.description}</p>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end justify-center min-w-[120px]">
                                                <div className="text-4xl font-black text-white">+{report.elo_awarded}</div>
                                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified Impact</div>
                                            </div>
                                        </div>

                                        {report.ai_feedback && (
                                            <div className="mt-8 pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                                    <Sparkles className="h-4 w-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">AI Evaluator Notes</span>
                                                </div>
                                                <p className="text-sm font-medium text-zinc-400 italic">
                                                    "{report.ai_feedback}"
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
