'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    const [totalStudents, setTotalStudents] = useState<number>(0);
    const [rank, setRank] = useState<number | string>('--');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editSchool, setEditSchool] = useState('');
    const [editGrade, setEditGrade] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

            // Fetch total students for rank
            const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
            setTotalStudents(studentCount || 0);

            // Fetch student profile
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();

            if (studentError) throw studentError;
            setStudent(studentData);

            // Set edit form defaults
            if (studentData) {
                setEditName(studentData.name || '');
                setEditSchool(studentData.school || '');
                setEditGrade(studentData.grade || '');

                // Determine rank
                const { count: rankCount } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })
                    .gt('elo', studentData.elo);
                setRank((rankCount || 0) + 1);
            }

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

    const handleSaveProfile = async () => {
        if (!student) return;
        setIsSaving(true);
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('students')
                .update({
                    name: editName,
                    school: editSchool,
                    grade: editGrade,
                    updated_at: new Date().toISOString()
                })
                .eq('id', student.id);

            if (error) throw error;
            setIsEditing(false);
            fetchProfileData();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setIsSaving(false);
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
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-5xl text-white shadow-2xl">
                                {student?.name?.[0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-xl shadow-xl">
                                <Zap className="h-5 w-5 fill-black" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-semibold tracking-tighter">
                                    {student?.name}
                                </h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-500 font-semibold text-sm uppercase tracking-widest leading-none">
                                    <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {student?.school || 'Unlisted Institution'}</span>
                                    {student?.grade && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Grade {student.grade}</span>}
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn-3d btn-3d-primary px-8 py-2.5 text-sm"
                                >
                                    Edit Profile
                                </button>
                                <button className="btn-3d btn-3d-dark px-10 py-2.5 text-sm flex items-center gap-2">
                                    Share <ExternalLink className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'ELO Score', value: student?.elo || 0, icon: TrendingUp },
                            { label: 'Achievements', value: reports.length, icon: Award },
                            { label: 'Global Rank', value: `#${rank}`, icon: Zap },
                            { label: 'Registry Size', value: totalStudents, icon: MapPin },
                        ].map((item, i) => (
                            <div
                                key={item.label}
                                className="glass-card p-6 text-center md:text-left group border-white/5"
                            >
                                <item.icon className="h-4 w-4 text-zinc-600 mb-2 group-hover:text-white transition-colors" />
                                <div className="text-2xl font-bold tracking-tighter">{item.value}</div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Portfolio / Achievements */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold tracking-tighter underline decoration-white/10 underline-offset-8">Accomplishments</h2>

                        <div className="grid gap-6">
                            {reports.length === 0 ? (
                                <div className="glass-card p-12 text-center text-zinc-500 font-semibold border-white/5">
                                    No accomplishments verified yet. Start your journey on the Dashboard.
                                </div>
                            ) : (
                                reports.map((report, i) => (
                                    <div
                                        key={report.id}
                                        className="glass-card p-8 group hover:bg-zinc-900/50 transition-all border-white/5"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-white text-black text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest leading-none">{report.category}</span>
                                                    <span className="text-zinc-600 text-[10px] font-bold">{new Date(report.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-2xl font-semibold tracking-tight leading-tight">{report.title}</h3>
                                                <p className="text-zinc-500 font-medium max-w-2xl text-sm leading-relaxed">{report.description}</p>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end justify-center min-w-[100px]">
                                                <div className="text-3xl font-bold text-white">+{report.elo_awarded}</div>
                                                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">ELO Issued</div>
                                            </div>
                                        </div>

                                        {report.ai_feedback && (
                                            <div className="mt-8 pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-2 mb-2 text-zinc-600">
                                                    <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Ultra Eval Notes</span>
                                                </div>
                                                <p className="text-sm font-semibold text-zinc-400 italic">
                                                    "{report.ai_feedback}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditing(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative w-full max-w-lg glass-card p-8 md:p-10 border-white/10 bg-zinc-950"
                            >
                                <div className="space-y-6">
                                    <div className="text-center space-y-2 mb-8">
                                        <h2 className="text-3xl font-bold tracking-tighter">Update Profile</h2>
                                        <p className="text-zinc-500 font-semibold text-sm">Review your credentials for accuracy.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:border-white/10 transition-all"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Institution / School</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:border-white/10 transition-all"
                                                value={editSchool}
                                                onChange={(e) => setEditSchool(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Grade Level</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:border-white/10 transition-all"
                                                value={editGrade}
                                                onChange={(e) => setEditGrade(e.target.value)}
                                                placeholder="e.g. 12"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 btn-3d btn-3d-dark py-4 text-sm font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="flex-1 btn-3d btn-3d-primary py-4 text-sm font-bold"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
