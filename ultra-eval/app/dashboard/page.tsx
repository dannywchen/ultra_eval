'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    Plus,
    X,
    ChevronRight,
    Zap,
    Trophy,
    Flame,
    Loader2,
    CheckCircle2,
    Sparkles,
    LayoutDashboard,
    ArrowUpRight
} from 'lucide-react';
import { getSupabase, Student, Report } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('accomplishment');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<any>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
                return;
            }
            const { data: studentData } = await supabase.from('students').select('*').eq('id', user.id).single();
            setStudent(studentData);
            const { data: reportsData } = await supabase.from('reports').select('*').eq('student_id', user.id).order('created_at', { ascending: false });
            setReports(reportsData || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        setIsSubmitting(true);
        setEvaluationResult(null);

        try {
            const response = await fetch('/api/submit-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, category, studentId: student.id }),
            });
            const data = await response.json();
            if (data.success) {
                setEvaluationResult(data.evaluation);
                fetchDashboardData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('accomplishment');
        setEvaluationResult(null);
        setShowModal(false);
        setSelectedReport(null);
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
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1"
                        >
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Dashboard</h1>
                            <p className="text-zinc-500 font-bold text-lg">Good to see you, {student?.name?.split(' ')[0]}</p>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowModal(true)}
                            className="btn-sleek btn-sleek-primary text-lg px-8 py-4 shadow-2xl shadow-white/10"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Submit Accomplishment
                        </motion.button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Current ELO', value: student?.elo || 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                            { label: 'Total Reports', value: reports.length, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Global Rank', value: '#--', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 group hover:border-white/20 transition-all cursor-default"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                                    </div>
                                    <Sparkles className="h-4 w-4 text-white/10 group-hover:text-white/40 transition-colors" />
                                </div>
                                <div className="text-4xl font-black tracking-tighter mb-1">{stat.value}</div>
                                <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent Submissions */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black tracking-tighter uppercase underline decoration-white/20 underline-offset-8">Activity Feed</h2>
                            <button className="text-zinc-500 hover:text-white text-sm font-bold flex items-center gap-1 transition-colors">
                                View all <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {reports.length === 0 ? (
                                <div className="glass-card p-12 text-center text-zinc-500 font-bold">
                                    Your accomplishments will appear here. Start by submitting one!
                                </div>
                            ) : (
                                reports.slice(0, 5).map((report, i) => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedReport(report)}
                                        className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:bg-zinc-900/50 transition-all cursor-pointer"
                                    >
                                        <div className="bg-white text-black h-14 w-14 rounded-3xl flex items-center justify-center font-black text-xl flex-shrink-0">
                                            +{report.elo_awarded}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-xl font-black tracking-tight group-hover:text-white transition-colors capitalize">{report.title}</h4>
                                            <p className="text-zinc-500 text-sm font-bold truncate max-w-md">{report.description}</p>
                                        </div>
                                        <div className="text-zinc-600 font-mono text-xs uppercase tracking-tighter">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Submission & Detail Modal */}
                <AnimatePresence>
                    {(showModal || selectedReport) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={resetForm}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-2xl glass-card border-white/10 shadow-3xl bg-zinc-950 p-8 md:p-12 overflow-hidden"
                            >
                                <button onClick={resetForm} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>

                                {selectedReport ? (
                                    <div className="py-6 space-y-8">
                                        <div className="text-center space-y-4">
                                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/5 text-white mb-2 font-black text-2xl">
                                                +{selectedReport.elo_awarded}
                                            </div>
                                            <h3 className="text-4xl font-black tracking-tighter leading-none">{selectedReport.title}</h3>
                                            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">{selectedReport.category} • {new Date(selectedReport.created_at).toLocaleDateString()}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Your Description</h4>
                                            <div className="glass-card p-6 bg-zinc-900/50 text-zinc-400 font-medium leading-relaxed">
                                                {selectedReport.description}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">AI Evaluation Feedback</h4>
                                            <div className="glass-card p-6 bg-white/5 text-white leading-relaxed font-bold italic border-emerald-500/20">
                                                "{selectedReport.ai_feedback || "No feedback provided."}"
                                            </div>
                                        </div>

                                        <button
                                            onClick={resetForm}
                                            className="w-full btn-sleek btn-sleek-primary py-5 text-xl"
                                        >
                                            Close Record
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {!isSubmitting && !evaluationResult && (
                                            <form onSubmit={handleSubmit} className="space-y-8">
                                                <div className="space-y-2 text-center mb-8">
                                                    <h2 className="text-4xl font-black tracking-tighter">New Entry</h2>
                                                    <p className="text-zinc-500 font-bold">What did you accomplish today?</p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <input
                                                            placeholder="Short Title..."
                                                            className="w-full bg-transparent text-3xl font-black tracking-tight placeholder:text-zinc-800 outline-none border-none"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {['accomplishment', 'award', 'impact', 'todo'].map((cat) => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => setCategory(cat)}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                                                    category === cat ? "bg-white text-black" : "bg-white/5 text-zinc-500 hover:text-white"
                                                                )}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <textarea
                                                            placeholder="Detailed description for the AI evaluator. Explain what you did and why it matters..."
                                                            className="w-full h-48 bg-white/5 rounded-3xl p-6 text-lg font-medium placeholder:text-zinc-700 outline-none border-white/5 focus:border-white/10 transition-all resize-y"
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full btn-sleek btn-sleek-primary py-5 text-xl group"
                                                >
                                                    Evaluate Accomplishment
                                                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </form>
                                        )}

                                        {isSubmitting && (
                                            <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                                                <div className="relative h-24 w-24">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                        className="absolute inset-0 rounded-full border-t-4 border-white"
                                                    />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                        className="absolute inset-4 bg-white/5 rounded-full flex items-center justify-center"
                                                    >
                                                        <Zap className="h-8 w-8 text-white fill-white" />
                                                    </motion.div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl font-black tracking-tighter">Analyzing Impact</h3>
                                                    <p className="text-zinc-500 font-bold">Ultra AI is calculating your ELO reward...</p>
                                                </div>
                                            </div>
                                        )}

                                        {evaluationResult && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="py-6 space-y-8"
                                            >
                                                <div className="text-center space-y-4">
                                                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/5 text-emerald-500 mb-2">
                                                        <CheckCircle2 className="h-10 w-10" />
                                                    </div>
                                                    <h3 className="text-4xl font-black tracking-tighter">Analysis Complete</h3>
                                                    <p className="text-zinc-500 font-bold">Great work on "{title}"</p>
                                                </div>

                                                <div className="glass-card bg-white p-8 text-black text-center">
                                                    <div className="text-sm font-black uppercase tracking-widest mb-1 opacity-50">ELO Awarded</div>
                                                    <div className="text-7xl font-black tracking-tighter">+{evaluationResult.elo_awarded}</div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500">AI Feedback</h4>
                                                    <div className="glass-card p-6 bg-white/5 text-zinc-300 leading-relaxed font-medium italic">
                                                        "{evaluationResult.feedback}"
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={resetForm}
                                                    className="w-full btn-sleek btn-sleek-primary py-5 text-xl"
                                                >
                                                    Got it
                                                </button>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
