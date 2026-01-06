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
            const adminEmails = ['dannywchen3@gmail.com'];

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
                <div className="max-w-4xl mx-auto space-y-10 pb-24">

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Link href="/admin">
                            <button className="btn-3d btn-3d-dark px-6 py-2 flex items-center gap-2 group">
                                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Go Back</span>
                            </button>
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
                    <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-bold tracking-tighter">{student?.name}</h1>
                                <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    {student?.email} • {student?.school || 'No School'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-5 border-white/5 card-3d">
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Total Submissions</div>
                                    <div className="text-2xl font-bold tracking-tighter">{reports.length}</div>
                                </div>
                                <div className="glass-card p-5 border-white/5 card-3d">
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Member Since</div>
                                    <div className="text-lg font-bold tracking-tighter">{new Date(student?.created_at || '').toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 border-white/5 card-3d space-y-4">
                            <div className="space-y-0.5">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Total ELO</div>
                                <h3 className="text-xl font-bold tracking-tighter">Adjust Score</h3>
                            </div>

                            <div className="space-y-3">
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-3xl font-bold outline-none focus:border-white/20 transition-all"
                                    value={editElo}
                                    onChange={(e) => setEditElo(e.target.value)}
                                />
                                <button
                                    onClick={handleUpdateTotalElo}
                                    disabled={isSaving}
                                    className="w-full btn-3d btn-3d-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 text-[12px]"
                                >
                                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                    Update ELO
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submissions List */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold tracking-tighter uppercase flex items-center gap-2 text-zinc-400">
                            <History className="h-4 w-4" />
                            Submissions
                        </h2>

                        <div className="grid gap-4">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="glass-card p-6 border-white/5 card-3d"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white text-black h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm">
                                                    +{report.elo_awarded}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold tracking-tight">{report.title}</h4>
                                                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px]">
                                                        {report.category} • {new Date(report.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                                                    <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-700 mb-1.5">Description</div>
                                                    <p className="text-zinc-400 text-[12px] leading-relaxed line-clamp-3">{report.description}</p>
                                                </div>

                                                <div className="bg-emerald-500/[0.02] rounded-xl p-4 border border-emerald-500/5">
                                                    <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-900/40 mb-1.5">AI Feedback</div>
                                                    <p className="text-zinc-500 text-[12px] leading-relaxed line-clamp-3 italic">{report.ai_feedback || 'No feedback provided.'}</p>
                                                </div>
                                            </div>

                                            {report.file_urls && report.file_urls.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {report.file_urls.map((url, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border border-white/5"
                                                        >
                                                            <FileText className="h-3 w-3 text-zinc-500" />
                                                            Asset {idx + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="md:w-48 flex items-center">
                                            <button
                                                onClick={() => setEditingReport(report)}
                                                className="w-full btn-3d btn-3d-dark py-2 text-[11px] flex items-center justify-center gap-2"
                                            >
                                                <Edit3 className="h-3 w-3" />
                                                Edit Submission
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
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-xl glass-card p-8 bg-zinc-950 border-white/10 card-3d"
                        >
                            <h2 className="text-2xl font-bold tracking-tighter mb-6">Edit Submission</h2>

                            <form onSubmit={handleUpdateReport} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 ml-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-white/20 transition-all font-bold text-sm"
                                        value={editingReport.title}
                                        onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 ml-1">ELO Awarded</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-white/20 transition-all font-bold text-lg text-white"
                                            value={editingReport.elo_awarded === 0 ? '' : editingReport.elo_awarded}
                                            placeholder="0"
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                setEditingReport({ ...editingReport, elo_awarded: val });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 ml-1">Status</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-white/20 transition-all font-bold text-[11px] uppercase appearance-none"
                                            value={editingReport.status}
                                            onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value as any })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="graded">Graded</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 ml-1">Description</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-24 outline-none focus:border-white/20 transition-all text-[13px] font-medium resize-none"
                                        value={editingReport.description}
                                        onChange={(e) => setEditingReport({ ...editingReport, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 ml-1">AI Feedback</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-24 outline-none focus:border-white/20 transition-all text-[13px] font-medium text-zinc-300 resize-none"
                                        value={editingReport.ai_feedback}
                                        onChange={(e) => setEditingReport({ ...editingReport, ai_feedback: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingReport(null)}
                                        className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-3d btn-3d-primary py-3 flex items-center justify-center gap-2 text-[12px]"
                                    >
                                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
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
