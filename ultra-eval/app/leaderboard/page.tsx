'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    Trophy,
    Search,
    ChevronUp,
    ChevronDown,
    Crown,
    Star,
    Sparkles,
    Loader2,
    School,
    X,
    User,
    GraduationCap,
    TrendingUp,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { getSupabase, Student, LeaderboardEntry, Report } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentReports, setStudentReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);

    const [sortConfig, setSortConfig] = useState<{
        key: 'elo' | 'name' | 'school';
        direction: 'asc' | 'desc';
    }>({ key: 'elo', direction: 'desc' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);
            await fetchLeaderboard();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('elo', { ascending: false });

            if (error) throw error;

            const rankedData = (data || []).map((student: any, index: number) => ({
                ...student,
                rank: index + 1,
            }));

            setLeaderboard(rankedData);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentDetails = async (student: Student) => {
        setSelectedStudent(student);
        setLoadingReports(true);
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('student_id', student.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudentReports(data || []);
        } catch (error) {
            console.error('Error fetching student reports:', error);
        } finally {
            setLoadingReports(false);
        }
    };

    const handleSort = (key: 'elo' | 'name' | 'school') => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const filteredLeaderboard = leaderboard.filter((entry) => {
        const query = searchQuery.toLowerCase();
        return (
            entry.name?.toLowerCase().includes(query) ||
            entry.school?.toLowerCase().includes(query)
        );
    }).sort((a, b) => {
        const { key, direction } = sortConfig;
        if (a[key]! < b[key]!) return direction === 'asc' ? -1 : 1;
        if (a[key]! > b[key]!) return direction === 'asc' ? 1 : -1;
        return 0;
    });

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
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">Leaderboard</h1>
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or school..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-full py-4 pl-14 pr-6 text-sm font-semibold placeholder:text-zinc-700 outline-none focus:border-white/10 transition-all shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Top 3 Podiums */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredLeaderboard.slice(0, 3).map((entry, i) => {
                            const isGold = i === 0;
                            const isSilver = i === 1;
                            const isBronze = i === 2;
                            return (
                                <div
                                    key={entry.id}
                                    onClick={() => fetchStudentDetails(entry)}
                                    className={cn(
                                        "glass-card p-10 relative flex flex-col items-center text-center group transition-all border-white/5 cursor-pointer",
                                        isGold ? "bg-white/[0.03]" : ""
                                    )}
                                >
                                    <div className="absolute top-6 left-6 text-zinc-700 font-bold text-3xl">#{i + 1}</div>

                                    <div className="relative mb-6">
                                        <div className={cn(
                                            "h-24 w-24 rounded-3xl flex items-center justify-center font-bold text-3xl border-2",
                                            isGold ? "border-white" : "border-zinc-800 text-zinc-400"
                                        )}>
                                            {entry.name?.[0]}
                                        </div>
                                        {isGold && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-10 w-10 text-white fill-white" />}
                                    </div>

                                    <h3 className="text-2xl font-bold tracking-tight mb-1">{entry.name}</h3>
                                    <p className="text-zinc-500 font-semibold text-sm mb-6 flex items-center justify-center gap-1">
                                        <School className="h-3 w-3" /> {entry.school || 'Unlisted School'}
                                    </p>

                                    <div className="bg-white text-black px-6 py-2 rounded-full font-bold text-xl tracking-tighter">
                                        {entry.elo} <span className="text-[10px] uppercase ml-1 opacity-60">ELO</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Full List */}
                    <div className="glass-card border-white/5 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 border-b border-white/5 p-8 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-5 cursor-pointer hover:text-white transition-colors flex items-center gap-1" onClick={() => handleSort('name')}>
                                Student {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                            </div>
                            <div className="col-span-4 cursor-pointer hover:text-white transition-colors flex items-center gap-1" onClick={() => handleSort('school')}>
                                School {sortConfig.key === 'school' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                            </div>
                            <div className="col-span-2 text-right cursor-pointer hover:text-white transition-colors flex items-center gap-1 justify-end" onClick={() => handleSort('elo')}>
                                ELO {sortConfig.key === 'elo' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                            </div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {filteredLeaderboard.map((entry, i) => (
                                <div
                                    key={entry.id}
                                    onClick={() => fetchStudentDetails(entry)}
                                    className="grid grid-cols-12 gap-4 p-8 items-center group hover:bg-white/[0.01] transition-colors cursor-pointer"
                                >
                                    <div className="col-span-1 font-bold text-xl text-zinc-700">#{entry.rank}</div>
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-sm border border-white/5">
                                            {entry.name?.[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg tracking-tight group-hover:text-white transition-colors">{entry.name}</span>
                                            {entry.highlight && <span className="text-xs text-zinc-600 font-medium italic">{entry.highlight}</span>}
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-zinc-600 font-semibold text-sm">
                                        {entry.school || '--'}
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full font-bold text-lg">
                                            {entry.elo} <Star className="h-3 w-3 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Student Detail Modal */}
                <AnimatePresence>
                    {selectedStudent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedStudent(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative w-full max-w-2xl glass-card p-10 bg-zinc-950 border-white/10 max-h-[85vh] overflow-y-auto"
                            >
                                <button onClick={() => setSelectedStudent(null)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>

                                <div className="space-y-10">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="h-24 w-24 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-4xl text-white">
                                            {selectedStudent.name?.[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-4xl font-bold tracking-tighter">{selectedStudent.name}</h2>
                                            <div className="flex flex-wrap justify-center gap-4 text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {selectedStudent.school || 'Unlisted Institution'}</span>
                                                {selectedStudent.grade && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Grade {selectedStudent.grade}</span>}
                                            </div>
                                        </div>
                                        <div className="bg-white text-black px-8 py-3 rounded-full font-bold text-2xl tracking-tighter">
                                            {selectedStudent.elo} <span className="text-xs uppercase ml-1 opacity-60 font-black">ELO</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-xl font-bold tracking-tighter uppercase underline decoration-white/10 underline-offset-8">Accomplishments</h3>
                                        </div>

                                        <div className="grid gap-4">
                                            {loadingReports ? (
                                                <div className="flex justify-center py-10">
                                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-700" />
                                                </div>
                                            ) : studentReports.length === 0 ? (
                                                <div className="glass-card p-8 text-center text-zinc-600 font-semibold text-sm border-white/5">
                                                    No public accomplishments found.
                                                </div>
                                            ) : (
                                                studentReports.map((report) => {
                                                    const isSelf = currentUserId === report.student_id;
                                                    return (
                                                        <div key={report.id} className="glass-card p-6 space-y-4 border-white/5 bg-white/[0.01]">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="bg-zinc-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest leading-none border border-white/5">
                                                                            {report.category}
                                                                        </span>
                                                                        <span className="text-zinc-700 text-[10px] font-bold">
                                                                            {new Date(report.created_at).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-lg font-bold tracking-tight text-white">{report.title}</h4>
                                                                    <p className="text-sm font-medium text-zinc-500 leading-relaxed line-clamp-2">
                                                                        {report.description}
                                                                    </p>
                                                                </div>
                                                                <div className="text-2xl font-bold text-white whitespace-nowrap">
                                                                    +{report.elo_awarded}
                                                                </div>
                                                            </div>

                                                            {report.ai_feedback && isSelf && (
                                                                <div className="pt-4 border-t border-white/5">
                                                                    <div className="flex items-center gap-2 mb-2 text-zinc-600">
                                                                        <Sparkles className="h-3 w-3" />
                                                                        <span className="text-[9px] font-bold uppercase tracking-widest">Ultra Eval Notes</span>
                                                                    </div>
                                                                    <p className="text-xs font-semibold text-zinc-400 italic">
                                                                        "{report.ai_feedback}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {currentUserId === selectedStudent.id && (
                                        <button
                                            onClick={() => window.location.href = '/profile'}
                                            className="w-full btn-3d btn-3d-primary py-4 text-sm font-bold flex items-center justify-center gap-2"
                                        >
                                            Go to Profile <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
