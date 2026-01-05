'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Edit,
    Mail,
    School,
    Award,
    TrendingUp,
    Calendar,
    Copy,
    Share2,
} from 'lucide-react';
import { getSupabase, Student, Report } from '@/lib/supabase';

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [student, setStudent] = useState<Student | null>(null);
    const [achievements, setAchievements] = useState<Report[]>([]);
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

            // Fetch reports as achievements
            const { data: reportsData, error: reportsError } = await supabase
                .from('reports')
                .select('*')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });

            if (reportsError) throw reportsError;
            setAchievements(reportsData || []);

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="h-full p-8 bg-black">
                <div className="mx-auto max-w-5xl space-y-8">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
                            <p className="mt-2 text-muted-foreground">
                                View and manage your student identity
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 border-zinc-800"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <Edit className="h-4 w-4" />
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                    </div>

                    {/* Profile Card */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <div className="flex items-start gap-6">
                                <Avatar className="h-24 w-24 border-2 border-zinc-800">
                                    <AvatarImage src={student?.avatar_url} />
                                    <AvatarFallback className="text-2xl bg-zinc-800">
                                        {student?.name?.split(' ').map((n) => n[0]).join('') || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-white">{student?.name || 'Incomplete Profile'}</h2>
                                        <Badge className="bg-primary/20 text-primary border-primary/20">Active Student</Badge>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{student?.school || 'School not set'}</span>
                                        <span>•</span>
                                        <span>{student?.grade || 'Class of --'}</span>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" className="border-zinc-800">
                                            <Share2 className="mr-2 h-3 w-3" />
                                            Share Profile
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button className="btn-3d btn-3d-primary w-full text-xs">
                                        Update Evaluation
                                    </Button>
                                    <Badge variant="outline" className="border-green-500/50 text-green-500 justify-center">
                                        {student?.elo || 0} ELO Points
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Academics Section */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-white">
                                <School className="h-5 w-5 text-primary" />
                                Academics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest">GPA (Placeholder)</Label>
                                    <div className="font-medium text-white italic">Information protected</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest">School</Label>
                                    <div className="font-medium text-zinc-100">{student?.school || 'Not Specified'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extracurricular Section */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white">Recent Achievements</CardTitle>
                            <Button variant="ghost" size="sm" className="text-2xl text-primary" onClick={() => window.location.href = '/dashboard'}>
                                +
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {achievements.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No achievements recorded yet. Head to the dashboard to report your first win!</p>
                            ) : (
                                achievements.map((achievement) => (
                                    <div key={achievement.id} className="flex gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <Award className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white uppercase tracking-tight">{achievement.title}</h3>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {achievement.category} • Awarded {achievement.elo_awarded} ELO
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="border-primary/20 text-primary">
                                                    +{achievement.elo_awarded}
                                                </Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-zinc-300 line-clamp-2">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    Total ELO
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{student?.elo || 0}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Award className="h-4 w-4" />
                                    Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{achievements.length}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Member Since
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">
                                    {student?.created_at ? new Date(student.created_at).getFullYear() : '2026'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
