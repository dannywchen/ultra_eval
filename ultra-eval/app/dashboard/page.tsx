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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Upload, TrendingUp, Award, Target, CheckCircle } from 'lucide-react';
import { getSupabase, Student, Report } from '@/lib/supabase';

export default function DashboardPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [student, setStudent] = useState<Student | null>(null);
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

            // Fetch student profile
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();

            if (studentError) throw studentError;
            setStudent(studentData);

            // Fetch recent reports
            const { data: reportsData, error: reportsError } = await supabase
                .from('reports')
                .select('*')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (reportsError) throw reportsError;
            setReports(reportsData || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submit-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    studentId: student.id,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit report');

            // Refresh data
            await fetchDashboardData();

            // Reset form
            setTitle('');
            setDescription('');
            setCategory('');
            alert('Report submitted and graded successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to submit report');
        } finally {
            setIsSubmitting(false);
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
            <div className="h-full p-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                        <p className="mt-2 text-muted-foreground">
                            Welcome back, {student?.name || 'Student'}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Current ELO
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{student?.elo || 0}</div>
                                <p className="text-xs text-green-500">
                                    Starts at 0
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Reports Submitted
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reports.length}
                                </div>
                                <p className="text-xs text-muted-foreground">Recent reports tracked</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Global Rank
                                </CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">--</div>
                                <p className="text-xs text-muted-foreground">
                                    Calculate on Leaderboard
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Next Goal
                                </CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">100</div>
                                <p className="text-xs text-muted-foreground">
                                    Keep reporting!
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submit Report Form */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle>Submit New Report</CardTitle>
                            <CardDescription>
                                Share your accomplishments, awards, or impactful work to earn ELO points (1-100)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Report Title</Label>
                                    <Input
                                        id="title"
                                        className="bg-zinc-950 border-zinc-800"
                                        placeholder="e.g., Won First Place at Biology Olympiad"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory} required>
                                        <SelectTrigger id="category" className="bg-zinc-950 border-zinc-800">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="accomplishment">
                                                Accomplishment
                                            </SelectItem>
                                            <SelectItem value="award">Award</SelectItem>
                                            <SelectItem value="impact">Impact</SelectItem>
                                            <SelectItem value="todo">To-Do/In Progress</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (for AI Evaluation)</Label>
                                    <Textarea
                                        id="description"
                                        className="bg-zinc-950 border-zinc-800"
                                        placeholder="Describe your accomplishment in detail. Include context, your role, impact, and measurable outcomes..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="btn-3d btn-3d-dark w-full py-6 text-lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'AI is Evaluating...' : 'Submit Report'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Recent Submissions */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle>Recent Submissions</CardTitle>
                            <CardDescription>Your latest reports and their AI evaluations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reports.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No reports submitted yet.</p>
                                ) : (
                                    reports.map((report) => (
                                        <div key={report.id} className="flex items-start justify-between rounded-lg border border-zinc-800 p-4 bg-zinc-950/50">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{report.title}</h4>
                                                <p className="mt-1 text-xs text-muted-foreground capitalize">
                                                    {report.category} • {new Date(report.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-500">+{report.elo_awarded} ELO</div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{report.status}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
