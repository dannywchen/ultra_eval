'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Shield,
    FileText,
    History,
    Edit3,
    BarChart
} from 'lucide-react';
import { getSupabase, Student, Report } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function StudentAdminDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [student, setStudent] = useState<Student | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Editing states
    const [editElo, setEditElo] = useState<string>('0');
    const [editingReport, setEditingReport] = useState<Report | null>(null);

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
            fetchData();
        } catch (error) {
            console.error('Admin check error:', error);
            window.location.href = '/dashboard';
        }
    };

    const fetchData = async () => {
        try {
            const supabase = getSupabase();

            // Fetch student
            const { data: studentData, error: sError } = await supabase
                .from('students')
                .select('*')
                .eq('id', id)
                .single();

            if (sError) throw sError;
            setStudent(studentData);
            setEditElo(studentData.elo.toString());

            // Fetch reports
            const { data: reportsData, error: rError } = await supabase
                .from('reports')
                .select('*')
                .eq('student_id', id)
                .order('created_at', { ascending: false });

            if (rError) throw rError;
            setReports(reportsData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Failed to load user data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTotalElo = async () => {
        setIsSaving(true);
        const eloNumber = parseInt(editElo) || 0;
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('students')
                .update({ elo: eloNumber, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setStudent(prev => prev ? { ...prev, elo: eloNumber } : null);
            setEditElo(eloNumber.toString());
            setMessage({ type: 'success', text: 'Total ELO updated successfully.' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update total ELO.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleUpdateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReport) return;
        setIsSaving(true);
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('reports')
                .update({
                    elo_awarded: editingReport.elo_awarded,
                    ai_feedback: editingReport.ai_feedback,
                    title: editingReport.title,
                    description: editingReport.description,
                    graded_at: new Date().toISOString()
                })
                .eq('id', editingReport.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Submission updated successfully.' });
            setReports(reports.map(r => r.id === editingReport.id ? editingReport : r));
            setEditingReport(null);

            // Optionally recalculate total ELO or just let admin handle it
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update submission.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (!isAdmin || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black text-white p-6 md:p-12 bg-mesh overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-12 pb-24">

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Back to Console</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                            message.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                        )}
                                    >
                                        {message.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Profile Header */}
                    <div className="grid md:grid-cols-[1fr_350px] gap-12 items-start">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">{student?.name}</h1>
                                <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    User ID: {student?.id.slice(0, 8)} • {student?.email}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Submissions</div>
                                    <div className="text-3xl font-bold tracking-tighter">{reports.length}</div>
                                </div>
                                <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Joined</div>
                                    <div className="text-xl font-bold tracking-tighter">{new Date(student?.created_at || '').toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 bg-white text-black rounded-[2rem] space-y-6">
                            <div className="text-center space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Admin Action</div>
                                <h3 className="text-2xl font-bold tracking-tighter">Edit Total ELO</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full bg-black/5 rounded-2xl py-6 text-center text-5xl font-black italic tracking-tighter outline-none"
                                        value={editElo}
                                        onChange={(e) => setEditElo(e.target.value)}
                                    />
                                    <Plus className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 opacity-10" />
                                </div>

                                <button
                                    onClick={handleUpdateTotalElo}
                                    disabled={isSaving}
                                    className="w-full btn-3d btn-3d-dark py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save ELO
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submissions List */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-3">
                                <History className="h-5 w-5 text-zinc-600" />
                                Submissions
                            </h2>
                        </div>

                        <div className="grid gap-6">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="glass-card p-8 border-white/5 bg-zinc-900/20 group hover:bg-zinc-900/40 transition-all font-medium"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white text-black h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm">
                                                    +{report.elo_awarded}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold tracking-tight">{report.title}</h4>
                                                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
                                                        {report.category} • {new Date(report.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 mb-2">Description</div>
                                                    <p className="text-zinc-400 text-sm leading-relaxed">{report.description}</p>
                                                </div>

                                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">AI Feedback</div>
                                                    <p className="text-zinc-300 text-sm leading-relaxed">{report.ai_feedback}</p>
                                                </div>

                                                {report.file_urls && report.file_urls.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {report.file_urls.map((url, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                File {idx + 1}
                                                                <ExternalLink className="h-2 w-2 opacity-50" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:w-64 space-y-4">
                                            <button
                                                onClick={() => setEditingReport(report)}
                                                className="w-full btn-3d btn-3d-dark py-3 flex items-center justify-center gap-2"
                                            >
                                                <Edit3 className="h-3 w-3" />
                                                Edit Detail
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Report Modal */}
            <AnimatePresence>
                {editingReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingReport(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl glass-card p-8 md:p-12 bg-zinc-950 border-white/10"
                        >
                            <h2 className="text-3xl font-bold tracking-tighter mb-8 italic">Edit Submission</h2>

                            <form onSubmit={handleUpdateReport} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-white/20 transition-all font-bold"
                                        value={editingReport.title}
                                        onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ELO Awarded</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-white/20 transition-all font-black text-xl text-emerald-500"
                                            value={editingReport.elo_awarded}
                                            onChange={(e) => setEditingReport({ ...editingReport, elo_awarded: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-white/20 transition-all font-bold text-xs uppercase appearance-none"
                                            value={editingReport.status}
                                            onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value as any })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="graded">Graded</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-32 outline-none focus:border-white/20 transition-all text-sm font-medium resize-none"
                                        value={editingReport.description}
                                        onChange={(e) => setEditingReport({ ...editingReport, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Feedback</label>
                                    <textarea
                                        className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-3 px-4 h-32 outline-none focus:border-emerald-500/20 transition-all text-sm font-medium text-emerald-100 resize-none"
                                        value={editingReport.ai_feedback}
                                        onChange={(e) => setEditingReport({ ...editingReport, ai_feedback: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingReport(null)}
                                        className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-3d btn-3d-primary py-4 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
