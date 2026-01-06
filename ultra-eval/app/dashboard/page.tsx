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
    Download,
    Mail
} from 'lucide-react';
import { getSupabase, Student, Report } from '@/lib/supabase';
import { uploadFile } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Paperclip, FileIcon, Trash } from 'lucide-react';

export default function DashboardPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('accomplishment');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const formatAnalysis = (text: string) => {
        if (!text) return ["No analysis provided."];
        // Split by major sections or newlines and strip "Part X:" or "Compliment:" prefixes
        const sections = text.split(/(?=Impact \d: |Productivity \d: |Quality \d: |Relevance \d: |To improve)/g);
        return sections
            .map(s => s.trim().replace(/^(Part \d:|Compliment:)\s*/i, ''))
            .filter(Boolean);
    };
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
    const [visibleCount, setVisibleCount] = useState(5);

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
            // 1. Upload files first
            const fileUrls: string[] = [];
            if (selectedFiles.length > 0) {
                setIsUploading(true);
                for (const file of selectedFiles) {
                    try {
                        const url = await uploadFile(file);
                        fileUrls.push(url);
                    } catch (err) {
                        console.error('File upload failed:', err);
                    }
                }
                setIsUploading(false);
            }

            // 2. Submit report with file URLs
            const response = await fetch('/api/submit-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    studentId: student.id,
                    fileUrls: fileUrls
                }),
            });
            const data = await response.json();
            if (data.success) {
                setEvaluationResult(data.evaluation);
                fetchDashboardData();
                setSelectedFiles([]);
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
                        <div className="space-y-0.5">
                            <h1 className="text-2xl font-semibold tracking-tighter">Dashboard</h1>
                            <p className="text-zinc-500 font-medium text-[13px]">Welcome back, {student?.name?.split(' ')[0]}</p>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-3d btn-3d-primary py-2 px-5 text-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
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
                                bg: ''
                            },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className={cn("glass-card p-8 group transition-all cursor-default card-3d")}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="p-3 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                                    </div>
                                </div>
                                <div className="text-4xl font-semibold tracking-tighter mb-1">{stat.value}</div>
                                <div className="text-zinc-500 font-semibold uppercase tracking-widest text-[10px]">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Submissions */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl tracking-tighter uppercase underline decoration-white/20 underline-offset-8">Activity Feed</h2>
                        </div>

                        <div className="grid gap-4">
                            {reports.length === 0 ? (
                                <div className="glass-card p-12 text-center text-zinc-500 font-semibold card-3d">
                                    Your accomplishments will appear here. Start by submitting one!
                                </div>
                            ) : (
                                reports.slice(0, visibleCount).map((report, i) => (
                                    <div
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:bg-zinc-900/50 transition-all cursor-pointer border-white/15 card-3d"
                                    >
                                        <div className="bg-white text-black h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            +{report.elo_awarded}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-xl font-semibold tracking-tight group-hover:text-white transition-colors capitalize">{report.title}</h4>
                                            <p className="text-zinc-500 text-sm font-medium truncate max-w-md">{report.description}</p>
                                        </div>
                                        <div className="text-zinc-700 font-mono text-xs uppercase tracking-tighter">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}

                            {reports.length > visibleCount && (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 5)}
                                    className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    View More Activities
                                </button>
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
                                className="relative w-full max-w-4xl glass-card border-white/10 shadow-3xl bg-zinc-950 p-8 md:p-12 overflow-hidden card-3d"
                            >
                                <button onClick={resetForm} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>

                                {selectedReport ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-6 space-y-8"
                                    >
                                        <div className="text-left space-y-2 mb-8">
                                            <h2 className="text-2xl font-semibold tracking-tighter">Submission Details</h2>
                                            <p className="text-zinc-500 font-medium text-sm">Verified accomplishment from your activity feed.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div className="glass-card bg-white p-8 text-black text-center rounded-[1.5rem] card-3d">
                                                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">ELO Issued</div>
                                                    <div className="text-5xl font-semibold tracking-tighter">+{selectedReport.elo_awarded}</div>
                                                    <div className="text-sm font-bold mt-2 opacity-80">{selectedReport.title}</div>
                                                </div>

                                                {selectedReport.category_score && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {Object.entries(selectedReport.category_score).map(([key, value]) => (
                                                            <div key={key} className="bg-white/5 rounded-2xl p-4 border border-white/5 card-3d">
                                                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{key}</div>
                                                                <div className="text-xl font-semibold">{value as number}/10</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Impact Analysis</h4>
                                                    <div className="glass-card p-6 bg-zinc-900/50 text-zinc-400 font-medium leading-relaxed rounded-2xl border-white/5 card-3d">
                                                        {selectedReport.description}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Ultra Analysis</h4>
                                                    <div className="space-y-3">
                                                        {(selectedReport.analysis_parts || formatAnalysis(selectedReport.ai_feedback || "")).map((part: string, idx: number) => (
                                                            <div key={idx} className="glass-card p-4 bg-white/[0.02] text-zinc-300 text-[13px] leading-relaxed border-white/10 rounded-xl font-medium card-3d">
                                                                {part}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setShareData(selectedReport);
                                                            setShowShareModal(true);
                                                        }}
                                                        className="flex-1 btn-3d btn-3d-dark py-2.5 flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                        Share Impact
                                                    </button>
                                                    <button
                                                        onClick={resetForm}
                                                        className="flex-1 btn-3d btn-3d-primary py-2.5 text-sm"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {!isSubmitting && !evaluationResult && (
                                            <form onSubmit={handleSubmit} className="space-y-8">
                                                <div className="space-y-2 text-center mb-8">
                                                    <h2 className="text-3xl tracking-tighter">New Entry</h2>
                                                    <p className="text-zinc-500 font-semibold">What did you accomplish today?</p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <input
                                                            placeholder="Short Title..."
                                                            className="w-full bg-transparent text-2xl font-semibold tracking-tight placeholder:text-zinc-700 outline-none border-b border-white/10 pb-2 focus:border-white/30 transition-all"
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
                                                                    "px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all",
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
                                                            className="w-full h-40 bg-white/5 rounded-2xl p-6 text-lg font-medium placeholder:text-zinc-800 outline-none border-none focus:ring-1 focus:ring-white/10 transition-colors resize-y"
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Supporting Evidence</label>
                                                            <span className="text-[10px] text-zinc-800">Images or Documents</span>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {selectedFiles.map((file, idx) => (
                                                                <div key={idx} className="relative group aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-2 text-center overflow-hidden card-3d">
                                                                    <FileIcon className="h-6 w-6 text-zinc-700 mb-1" />
                                                                    <span className="text-[8px] font-bold text-zinc-500 truncate w-full px-2">{file.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                                                                        className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                                                    >
                                                                        <Trash className="h-4 w-4 text-white" />
                                                                    </button>
                                                                </div>
                                                            ))}

                                                            <label className="aspect-square rounded-2xl border-2 border-dashed border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                                                <Paperclip className="h-6 w-6 text-zinc-700 group-hover:text-white transition-colors" />
                                                                <span className="text-[8px] font-bold text-zinc-700 group-hover:text-zinc-400 mt-2 uppercase tracking-widest">Add Asset</span>
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        if (e.target.files) {
                                                                            setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full btn-3d btn-3d-primary py-3 font-semibold group"
                                                >
                                                    Evaluate Impact
                                                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                                                    <h2 className="text-2xl font-semibold tracking-tighter">Analysis Complete</h2>
                                                    <p className="text-zinc-500 font-medium text-sm">Verified accomplishment issued to registry.</p>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-10">
                                                    <div className="space-y-6">
                                                        <div className="glass-card bg-white p-8 text-black text-center rounded-[1.5rem] card-3d">
                                                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">ELO Issued</div>
                                                            <div className="text-5xl font-semibold tracking-tighter">+{evaluationResult.elo_awarded}</div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            {Object.entries(evaluationResult.category_score).map(([key, value]) => (
                                                                <div key={key} className="bg-white/5 rounded-2xl p-4 border border-white/5 card-3d">
                                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{key}</div>
                                                                    <div className="text-xl font-semibold">{value as number}/10</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Ultra Analysis</h4>
                                                            <div className="space-y-3">
                                                                {(evaluationResult.analysis_parts || formatAnalysis(evaluationResult.feedback)).map((part: string, idx: number) => (
                                                                    <div key={idx} className="glass-card p-4 bg-white/[0.02] text-zinc-300 text-[13px] leading-relaxed border-white/10 rounded-xl font-medium card-3d">
                                                                        {part}
                                                                    </div>
                                                                ))}
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
                                                                className="flex-1 btn-3d btn-3d-dark py-2.5 text-sm flex items-center justify-center gap-2"
                                                            >
                                                                <Share2 className="h-4 w-4" />
                                                                Share
                                                            </button>
                                                            <button
                                                                onClick={resetForm}
                                                                className="flex-1 btn-3d btn-3d-primary py-2.5 text-sm"
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
                                <div id="share-card" className="bg-black border border-white/20 rounded-[1.25rem] overflow-hidden p-8 space-y-10 shadow-2xl relative scale-100 origin-center">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-1">
                                            <img src="/White Logo 512x174.png" alt="Ultra" className="h-4 w-auto object-contain" />
                                            <span className="text-[8px] font-bold text-zinc-600 tracking-tighter mt-0.5">(eval)</span>
                                        </div>
                                        <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-600">Official Record</div>
                                    </div>

                                    <div className="space-y-3 py-6">
                                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center">ELO Issued</div>
                                        <div className="text-8xl font-bold tracking-tighter text-white text-center leading-none">
                                            {shareData.elo_awarded}
                                        </div>
                                        <div className="text-base font-bold tracking-tight text-white/90 text-center capitalize">{shareData.title}</div>
                                    </div>

                                    <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Contributor</div>
                                            <div className="text-sm font-bold text-white leading-none mb-1">{student?.name}</div>
                                            <div className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">{student?.school || 'Protocol Member'}</div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Issue Date</div>
                                            <div className="text-sm font-bold text-white leading-none mb-1">{new Date(shareData.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <button
                                        onClick={async () => {
                                            const node = document.getElementById('share-card');
                                            if (node) {
                                                try {
                                                    const dataUrl = await toPng(node, {
                                                        cacheBust: true,
                                                        pixelRatio: 2, // Higher quality
                                                    });
                                                    const link = document.createElement('a');
                                                    link.style.display = 'none';
                                                    link.href = dataUrl;
                                                    link.download = `ultra-eval-${shareData.id}.png`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    setTimeout(() => {
                                                        document.body.removeChild(link);
                                                    }, 100);
                                                } catch (err) {
                                                    console.error('Failed to download image:', err);
                                                }
                                            }
                                        }}
                                        className="w-full btn-3d btn-3d-primary py-3 font-bold flex items-center justify-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Image
                                    </button>
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="w-full text-zinc-500 font-semibold text-sm hover:text-white transition-colors"
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
