'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
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
    ArrowUpRight,
    Share2,
    Download
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
    const [totalStudents, setTotalStudents] = useState<number>(0);
    const [rank, setRank] = useState<number | string>('--');
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState<Report | null>(null);

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

            // Fetch total students
            const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
            setTotalStudents(studentCount || 0);

            const { data: studentData } = await supabase.from('students').select('*').eq('id', user.id).single();
            setStudent(studentData);

            if (studentData) {
                // Determine rank
                const { count: rankCount } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })
                    .gt('elo', studentData.elo);
                setRank((rankCount || 0) + 1);
            }

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
        setShowShareModal(false);
        setShareData(null);
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
                        <div className="space-y-1">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">Dashboard</h1>
                            <p className="text-zinc-500 font-semibold text-lg">Good to see you, {student?.name?.split(' ')[0]}</p>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-3d btn-3d-primary text-lg px-8 py-4"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Submit Accomplishment
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Current ELO', value: student?.elo || 0, icon: Flame, color: 'text-white', bg: 'bg-zinc-900 border border-white/5' },
                            { label: 'Total Reports', value: reports.length, icon: LayoutDashboard, color: 'text-white', bg: 'bg-zinc-900 border border-white/5' },
                            {
                                label: 'Global Rank',
                                value: (
                                    <div className="flex items-baseline gap-2">
                                        <span>#{rank}</span>
                                        <span className="text-sm font-medium text-zinc-500">/ {totalStudents}</span>
                                    </div>
                                ),
                                icon: Trophy,
                                color: 'text-white',
                                bg: 'bg-zinc-900 border border-white/5'
                            },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className={cn("glass-card p-8 group transition-all cursor-default", stat.bg)}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="p-3 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                                    </div>
                                </div>
                                <div className="text-4xl font-bold tracking-tighter mb-1">{stat.value}</div>
                                <div className="text-zinc-500 font-semibold uppercase tracking-widest text-[10px]">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Submissions */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold tracking-tighter uppercase underline decoration-white/20 underline-offset-8">Activity Feed</h2>
                        </div>

                        <div className="grid gap-4">
                            {reports.length === 0 ? (
                                <div className="glass-card p-12 text-center text-zinc-500 font-semibold">
                                    Your accomplishments will appear here. Start by submitting one!
                                </div>
                            ) : (
                                reports.slice(0, 5).map((report, i) => (
                                    <div
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:bg-zinc-900/50 transition-all cursor-pointer border-white/5"
                                    >
                                        <div className="bg-white text-black h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            +{report.elo_awarded}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-xl font-bold tracking-tight group-hover:text-white transition-colors capitalize">{report.title}</h4>
                                            <p className="text-zinc-500 text-sm font-medium truncate max-w-md">{report.description}</p>
                                        </div>
                                        <div className="text-zinc-700 font-mono text-xs uppercase tracking-tighter">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
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
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative w-full max-w-4xl glass-card border-white/10 shadow-3xl bg-zinc-950 p-8 md:p-12 overflow-hidden"
                            >
                                <button onClick={resetForm} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>

                                {selectedReport ? (
                                    <div className="py-6 space-y-8">
                                        <div className="grid md:grid-cols-2 gap-12 text-left">
                                            <div className="space-y-8">
                                                <div className="space-y-4">
                                                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white text-black font-bold text-xl">
                                                        +{selectedReport.elo_awarded}
                                                    </div>
                                                    <h3 className="text-2xl font-bold tracking-tighter leading-tight">{selectedReport.title}</h3>
                                                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">{selectedReport.category} • {new Date(selectedReport.created_at).toLocaleDateString()}</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Impact Analysis</h4>
                                                    <div className="glass-card p-6 bg-zinc-900/50 text-zinc-400 font-medium leading-relaxed rounded-2xl border-white/5">
                                                        {selectedReport.description}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-white/40">Ultra Eval Feedback</h4>
                                                    <div className="glass-card p-6 bg-white/[0.03] text-white leading-relaxed font-semibold italic border-white/5 rounded-2xl">
                                                        "{selectedReport.ai_feedback || "No feedback provided."}"
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setShareData(selectedReport);
                                                            setShowShareModal(true);
                                                        }}
                                                        className="flex-1 btn-3d btn-3d-dark py-4 text-lg flex items-center justify-center gap-2"
                                                    >
                                                        <Share2 className="h-5 w-5" />
                                                        Share Impact
                                                    </button>
                                                    <button
                                                        onClick={resetForm}
                                                        className="flex-1 btn-3d btn-3d-primary py-3"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {!isSubmitting && !evaluationResult && (
                                            <form onSubmit={handleSubmit} className="space-y-8">
                                                <div className="space-y-2 text-center mb-8">
                                                    <h2 className="text-3xl font-bold tracking-tighter">New Entry</h2>
                                                    <p className="text-zinc-500 font-semibold">What did you accomplish today?</p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <input
                                                            placeholder="Short Title..."
                                                            className="w-full bg-transparent text-3xl font-bold tracking-tight placeholder:text-zinc-900 outline-none border-none"
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
                                                                    "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                                                    category === cat ? "bg-white text-black" : "bg-white/5 text-zinc-600 hover:text-white"
                                                                )}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <textarea
                                                            placeholder="Explain what you did and why it matters..."
                                                            className="w-full h-40 bg-white/5 rounded-2xl p-6 text-lg font-medium placeholder:text-zinc-800 outline-none border-none focus:ring-1 focus:ring-white/10 transition-all resize-y"
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full btn-3d btn-3d-primary py-5 text-xl group"
                                                >
                                                    Evaluate Impact
                                                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </form>
                                        )}

                                        {isSubmitting && (
                                            <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                                                <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl font-bold tracking-tighter">Analyzing Impact</h3>
                                                    <p className="text-zinc-500 font-semibold">Ultra Eval is calculating your reward...</p>
                                                </div>
                                            </div>
                                        )}

                                        {evaluationResult && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="py-6 space-y-8"
                                            >
                                                <div className="text-left space-y-2 mb-8">
                                                    <h2 className="text-2xl font-bold tracking-tighter">Analysis Complete</h2>
                                                    <p className="text-zinc-500 font-semibold text-sm">Verified accomplishment issued to registry.</p>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-10">
                                                    <div className="space-y-6">
                                                        <div className="glass-card bg-white p-8 text-black text-center rounded-[1.5rem]">
                                                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">ELO Issued</div>
                                                            <div className="text-5xl font-bold tracking-tighter">+{evaluationResult.elo_awarded}</div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            {Object.entries(evaluationResult.category_score).map(([key, value]) => (
                                                                <div key={key} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{key}</div>
                                                                    <div className="text-xl font-bold">{value as number}/10</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-8">
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Ultra Eval Notes</h4>
                                                            <div className="glass-card p-6 bg-white/[0.03] text-zinc-100 leading-relaxed font-medium border-white/5 rounded-2xl">
                                                                {evaluationResult.feedback}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => {
                                                                    setShareData({
                                                                        ...evaluationResult,
                                                                        title: title,
                                                                        created_at: new Date().toISOString()
                                                                    } as any);
                                                                    setShowShareModal(true);
                                                                }}
                                                                className="flex-1 btn-3d btn-3d-dark py-4 text-lg flex items-center justify-center gap-2"
                                                            >
                                                                <Share2 className="h-5 w-5" />
                                                                Share
                                                            </button>
                                                            <button
                                                                onClick={resetForm}
                                                                className="flex-1 btn-3d btn-3d-primary py-4 text-lg"
                                                            >
                                                                Got it
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Share Modal */}
                <AnimatePresence>
                    {showShareModal && shareData && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowShareModal(false)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative w-full max-w-sm"
                            >
                                {/* Shareable Card */}
                                <div id="share-card" className="bg-black border border-white/20 rounded-[1.5rem] overflow-hidden p-10 space-y-12 shadow-2xl relative scale-100 origin-center">
                                    <div className="flex justify-between items-start">
                                        <div className="text-xl font-bold tracking-tighter">
                                            Ultra<span className="text-[10px] ml-1 bg-white text-black px-2 py-0.5 rounded-full uppercase tracking-widest">eval</span>
                                        </div>
                                        <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600">Official Record</div>
                                    </div>

                                    <div className="space-y-4 py-8">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center">Merit Issued</div>
                                        <div className="text-9xl font-bold tracking-tighter text-white text-center leading-none">
                                            {shareData.elo_awarded}
                                        </div>
                                        <div className="text-lg font-bold tracking-tight text-white/90 text-center capitalize">{shareData.title}</div>
                                    </div>

                                    <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Contributor</div>
                                            <div className="text-sm font-bold text-white">{student?.name}</div>
                                            <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{student?.school || 'Protocol Member'}</div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Issue Date</div>
                                            <div className="text-sm font-bold text-white">{new Date(shareData.created_at).toLocaleDateString()}</div>
                                            <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Registry Auth</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <button
                                        onClick={async () => {
                                            const node = document.getElementById('share-card');
                                            if (node) {
                                                const dataUrl = await toPng(node, { cacheBust: true });
                                                const link = document.createElement('a');
                                                link.download = `ultra-eval-${shareData.id}.png`;
                                                link.href = dataUrl;
                                                link.click();
                                            }
                                        }}
                                        className="w-full btn-3d btn-3d-primary py-3 font-bold flex items-center justify-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Image
                                    </button>
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="w-full text-zinc-500 font-bold text-sm hover:text-white transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
